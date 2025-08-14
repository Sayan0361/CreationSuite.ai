import { FileText, Sparkles, Copy } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
  const [input, setInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');

  const { getToken } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInput(file);
      setFileName(file.name);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('resume', input);

      const { data } = await axios.post('/api/ai/resume-review', formData, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });

      if (data.success) {
        setContent(data.content);
        toast.success("Resume reviewed successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (!content) return;
    navigator.clipboard.writeText(content)
      .then(() => toast.success('Copied to clipboard!'))
      .catch(() => toast.error('Failed to copy'));
  };

  return (
    <div className='h-full overflow-y-auto p-6 flex flex-col md:flex-row gap-6 text-white'>
      {/* Input Section */}
      <form onSubmit={onSubmitHandler} className='w-full md:w-1/2 p-6 bg-zinc-900 rounded-xl border border-zinc-700 shadow-lg'>
        <div className='flex items-center gap-3 mb-6'>
          <Sparkles className='w-6 h-6 text-[#00DA83]' />
          <h1 className='text-xl font-semibold'>Resume Review</h1>
        </div>

        <div className='space-y-6'>
          <div>
            <label className='block text-sm font-medium mb-2'>Upload Resume</label>
            <div className="relative">
              <input
                onChange={handleFileChange}
                type="file"
                accept="application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <div className="w-full p-3 bg-zinc-800 border border-zinc-600 rounded-lg flex items-center justify-between">
                <span className={`truncate ${fileName ? 'text-white' : 'text-gray-400'}`}>
                  {fileName || 'Select PDF file'}
                </span>
                <button
                  type="button"
                  className="px-3 py-1 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-md transition-all"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('input[type="file"]').click();
                  }}
                >
                  Browse
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400">Supports PDF files only</p>
          </div>

          <button
            disabled={loading || !input}
            className={`w-full flex justify-center items-center gap-2 text-white px-4 py-3 text-sm rounded-lg transition-all ${
              !input 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#00DA83] to-[#009BB3] hover:shadow-lg hover:shadow-green-500/20'
            }`}
          >
            {loading ? (
              <span className='w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin'></span>
            ) : (
              <>
                <FileText className='w-5 h-5' />
                Review Resume
              </>
            )}
          </button>
        </div>
      </form>

      {/* Output Section */}
      <div className='w-full md:w-1/2 p-6 bg-zinc-900 rounded-xl border border-zinc-700 shadow-lg flex flex-col h-full min-h-[500px] max-h-[calc(100vh-100px)]'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <FileText className='w-6 h-6 text-[#00DA83]' />
            <h1 className='text-xl font-semibold'>Analysis Results</h1>
          </div>
          {content && (
            <button
              onClick={copyToClipboard}
              className='flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-all'
              title="Copy text"
            >
              <Copy className='w-4 h-4' />
              Copy
            </button>
          )}
        </div>

        {!content ? (
          <div className='flex-1 flex flex-col justify-center items-center text-center p-6'>
            <div className='text-sm flex flex-col items-center gap-4 text-gray-400'>
              <FileText className='w-10 h-10 opacity-50' />
              <p>Upload a resume and click "Review Resume" to get started</p>
            </div>
          </div>
        ) : (
          <div className='flex-1 overflow-y-auto pr-2'>
            <div className='reset-tw prose prose-invert max-w-none'>
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewResume;