import { FileText, MessageSquare, History, Send, Upload, X, Loader2, File, Trash2 } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ChatWithPDF = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(() => {
    const saved = localStorage.getItem('pdfChat_conversation');
    return saved ? JSON.parse(saved) : [];
  });
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedFile, setSelectedFile] = useState(() => {
    const saved = localStorage.getItem('pdfChat_selectedFile');
    return saved ? JSON.parse(saved) : null;
  });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const { getToken } = useAuth();

  useEffect(() => {
    localStorage.setItem('pdfChat_selectedFile', JSON.stringify(selectedFile));
  }, [selectedFile]);

  useEffect(() => {
    localStorage.setItem('pdfChat_conversation', JSON.stringify(conversation));
  }, [conversation]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  // Handle drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setPdfFile(files[0]);
    } else {
      toast.error('Please upload a valid PDF file');
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data } = await axios.get('/api/ai/pdf-chat-history', {
          headers: { Authorization: `Bearer ${await getToken()}` }
        });
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to load history');
        }

        if (data.files) {
          setChatHistory(data.files.map(fileName => ({ fileName })));
          
          const savedFile = localStorage.getItem('pdfChat_selectedFile');
          if (savedFile && data.files.includes(savedFile)) {
            await loadHistory(savedFile);
          }
        }
        
        if (data.chatHistory) {
          setConversation(data.chatHistory);
          if (data.fileName) {
            setSelectedFile(data.fileName);
          }
        }
      } catch (error) {
        console.error('Initial data load error:', error);
        toast.error(error.response?.data?.message || 'Failed to load initial data');
      }
    };
    fetchInitialData();
  }, [getToken]);

  const loadHistory = async (fileName) => {
    try {
      setHistoryLoading(true);
      
      const cachedConv = localStorage.getItem(`pdfChat_conv_${fileName}`);
      
      if (cachedConv) {
        setConversation(JSON.parse(cachedConv));
        setSelectedFile(fileName);
      }
      const { data } = await axios.get(
        `/api/ai/pdf-chat-history?file_name=${encodeURIComponent(fileName)}`,
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      
      if (data.success) {
        setConversation(data.chatHistory);
        setSelectedFile(fileName);
        localStorage.setItem(
          `pdfChat_conv_${fileName}`,
          JSON.stringify(data.chatHistory)
        );
      }
    } catch (error) {
      toast.error('Failed to load chat history');
      setChatHistory(prev => prev.filter(item => item.fileName !== fileName));
    } finally {
      setHistoryLoading(false);
      setShowSidebar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      toast.error('Please upload a PDF file first');
      fileInputRef.current?.focus();
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter your question');
      textareaRef.current?.focus();
      return;
    }

    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('message', message.trim());
    formData.append('chatHistory', JSON.stringify(conversation));

    try {
      setLoading(true);
      const { data } = await axios.post('/api/ai/chat-with-pdf', formData, {
        headers: { 
          Authorization: `Bearer ${await getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data.success) {
        setConversation(data.chatHistory);
        setMessage('');
        
        if (!chatHistory.some(item => item.fileName === pdfFile.name)) {
          setChatHistory(prev => [...prev, { fileName: pdfFile.name }]);
        }
        
        localStorage.setItem(
          `pdfChat_conv_${pdfFile.name}`,
          JSON.stringify(data.chatHistory)
        );
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to process PDF');
    } finally {
      setLoading(false);
    }
  };

  const clearLocalHistory = () => {
    localStorage.removeItem('pdfChat_selectedFile');
    localStorage.removeItem('pdfChat_conversation');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('pdfChat_conv_')) {
        localStorage.removeItem(key);
      }
    });
    setSelectedFile(null);
    setConversation([]);
    setPdfFile(null);
    toast.success('Chat history cleared');
  };

  const removeFile = () => {
    setPdfFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white">
      {/* Mobile header with sidebar toggle */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#00DA83]" />
          <h1 className="font-semibold">PDF Chat</h1>
        </div>
        <button 
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-2 rounded-md hover:bg-zinc-800 transition-colors"
          aria-label={showSidebar ? "Close sidebar" : "Open sidebar"}
        >
          {showSidebar ? <X className="w-5 h-5" /> : <History className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - PDF upload and history */}
        <div className={`${showSidebar ? 'block' : 'hidden'} md:block w-full md:w-80 bg-zinc-950 border-r border-zinc-800 flex-shrink-0 overflow-y-auto`}>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-5 h-5 text-[#00DA83]" />
              <h1 className="text-lg font-semibold">Chat with PDF</h1>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Upload PDF</label>
              <label 
                className={`flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition ${
                  isDragging ? 'border-[#00DA83] bg-zinc-900' : 'border-zinc-700 hover:bg-zinc-900'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {pdfFile ? (
                  <div className="w-full flex items-center gap-3 p-2 bg-zinc-900 rounded">
                    <File className="w-5 h-5 flex-shrink-0 text-[#00DA83]" />
                    <span className="text-sm truncate flex-1">{pdfFile.name}</span>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="text-zinc-400 hover:text-red-400 transition-colors"
                      aria-label="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 mb-2 text-[#00DA83]" />
                    <p className="text-sm text-center">
                      {isDragging ? 'Drop your PDF here' : 'Click or drag PDF to upload'}
                    </p>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setPdfFile(e.target.files[0]);
                        }
                      }}
                      required
                    />
                  </>
                )}
              </label>
              <p className="text-xs text-zinc-400 mt-2">Supports PDF files up to 5MB</p>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <History className="w-4 h-4" />
                  <span>Chat History</span>
                </div>
                {chatHistory.length > 0 && (
                  <button 
                    onClick={clearLocalHistory}
                    className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                    aria-label="Clear all history"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear all
                  </button>
                )}
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {historyLoading ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-[#00DA83]" />
                  </div>
                ) : chatHistory.length > 0 ? (
                  chatHistory.map((item, index) => (
                    <div 
                      key={index} 
                      className={`p-3 text-sm rounded cursor-pointer hover:bg-zinc-900 transition flex items-center justify-between ${
                        selectedFile === item.fileName ? 'bg-zinc-800 border border-zinc-700' : ''
                      }`}
                      onClick={() => loadHistory(item.fileName)}
                    >
                      <span className="truncate flex-1">{item.fileName}</span>
                      {selectedFile === item.fileName && (
                        <div className="w-2 h-2 rounded-full bg-[#00DA83] ml-2 flex-shrink-0" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400 p-2">No previous chats found</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950">
          {/* Conversation display */}
          <div className="flex-1 overflow-y-auto p-4">
            {conversation.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <FileText className="w-12 h-12 mb-4 text-zinc-500" />
                <h2 className="text-xl font-semibold mb-2">Chat with your PDF</h2>
                <p className="text-zinc-400 max-w-md">
                  Upload a PDF file and ask questions about its content to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversation.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg transition ${
                      msg.role === 'user' ? 'bg-zinc-900' : 'bg-zinc-800'
                    }`}
                  >
                    <div className="font-medium mb-2 text-[#00DA83]">
                      {msg.role === 'user' ? 'You' : 'PDF Assistant'}
                    </div>
                    <div className="reset-tw prose prose-invert max-w-none">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="p-4 rounded-lg bg-zinc-800">
                    <div className="font-medium mb-2 text-[#00DA83]">PDF Assistant</div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating response...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
            {pdfFile && (
              <div className="flex items-center gap-2 mb-2 text-xs text-zinc-400">
                <File className="w-3 h-3" />
                <span className="truncate">{pdfFile.name}</span>
                <button 
                  onClick={removeFile}
                  className="ml-auto text-zinc-500 hover:text-red-400 transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-3 pr-12 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00DA83] resize-none transition"
                placeholder={pdfFile ? "Ask questions about the PDF..." : "Upload a PDF to start chatting"}
                rows={1}
                disabled={loading || !pdfFile}
              />
              <button
                type="submit"
                disabled={loading || !pdfFile || !message.trim()}
                className={`absolute right-2 bottom-2 p-2 rounded-lg transition ${
                  loading || !pdfFile || !message.trim()
                    ? 'text-zinc-600'
                    : 'text-[#00DA83] hover:bg-zinc-800'
                }`}
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWithPDF;