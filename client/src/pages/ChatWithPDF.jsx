import { FileText, MessageSquare, History } from 'lucide-react';
import React, { useState, useEffect } from 'react';
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

  const { getToken } = useAuth();

  useEffect(() => {
    localStorage.setItem('pdfChat_selectedFile', JSON.stringify(selectedFile));
  }, [selectedFile]);

  useEffect(() => {
    localStorage.setItem('pdfChat_conversation', JSON.stringify(conversation));
  }, [conversation]);

  // Fetch initial data
  useEffect(() => {
  const fetchInitialData = async () => {
    try {
      // First get list of available files
      const { data } = await axios.get('/api/ai/pdf-chat-history', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to load history');
      }

      // Set available files
      if (data.files) {
        setChatHistory(data.files.map(fileName => ({ fileName })));
        
        // Try to load selected file if exists
        const savedFile = localStorage.getItem('pdfChat_selectedFile');
        if (savedFile && data.files.includes(savedFile)) {
          await loadHistory(savedFile);
        }
      }
      
      // Handle case where we got specific chat history directly
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile || !message) {
      toast.error('Please upload a PDF and enter a message');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('message', message);
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
        
        // Update chat history list if this is a new file
        if (!chatHistory.some(item => item.fileName === pdfFile.name)) {
          setChatHistory(prev => [...prev, { fileName: pdfFile.name }]);
        }
        
        // Cache this conversation
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
    // Remove all conversation caches
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('pdfChat_conv_')) {
        localStorage.removeItem(key);
      }
    });
    setSelectedFile(null);
    setConversation([]);
    toast.success('Local chat history cleared');
  };
  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-white'>
      {/* Left column - PDF upload and chat input */}
      <form onSubmit={handleSubmit} className='w-full max-w-lg p-4 bg-zinc-900 rounded-lg'>
        <div className='flex items-center gap-3'>
          <MessageSquare className='w-6 text-[#00DA83]' />
          <h1 className='text-xl font-semibold'>Chat with PDF</h1>
        </div>

        <div className='mt-6'>
          <p className='text-sm font-medium'>Upload PDF</p>
          <input 
            onChange={(e) => setPdfFile(e.target.files[0])} 
            type="file" 
            accept='application/pdf' 
            className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-white' 
            required
          />
          <p className='text-xs text-white font-light mt-1'>Supports PDF files up to 5MB.</p>
        </div>

        <div className='mt-4'>
          <p className='text-sm font-medium'>Your Question</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-white bg-transparent min-h-24'
            placeholder='Ask questions about the PDF content...'
            required
          />
        </div>

        <button 
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white px-4 py-2 mt-4 text-sm rounded-lg cursor-pointer'
          disabled={loading}
        >
          {loading ? (
            <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
          ) : (
            <>
              <FileText className='w-5' />
              Ask PDF
            </>
          )}
        </button>

        {/* Chat history sidebar */}
        <div className='mt-6'>
          <div className='flex items-center gap-2 text-sm font-medium'>
            <History className='w-4 h-4' />
            <span>Previous Chats</span>
          </div>
          <div className='mt-2 max-h-40 overflow-y-auto'>
            {chatHistory.length > 0 ? (
              chatHistory.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-2 text-sm rounded cursor-pointer hover:bg-zinc-800 ${selectedFile === item.fileName ? 'bg-zinc-700' : ''}`}
                  onClick={() => loadHistory(item.fileName)}
                >
                  {item.fileName}
                </div>
              ))
            ) : (
              <p className='text-xs text-gray-400 mt-1'>No previous chats found</p>
            )}
          </div>
        </div>
      </form>

      {/* Right column - Conversation display */}
      <div className='w-full max-w-lg p-4 bg-zinc-900 rounded-lg flex flex-col min-h-96 max-h-[600px]'>
        <div className='flex items-center gap-3'>
          <MessageSquare className='w-5 h-5 text-[#00DA83]' />
          <h1 className='text-xl font-semibold'>Conversation</h1>
        </div>

        {conversation.length === 0 ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-white'>
              <FileText className='w-9 h-9' />
              <p>Upload a PDF and ask questions to get started</p>
            </div>
          </div>
        ) : (
          <div className='mt-3 h-full overflow-y-scroll text-sm text-white space-y-4'>
            {conversation.map((msg, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-zinc-800' : 'bg-zinc-700'}`}
              >
                <div className='font-medium mb-1'>
                  {msg.role === 'user' ? 'You' : 'Assistant'}
                </div>
                <div className='reset-tw'>
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWithPDF;