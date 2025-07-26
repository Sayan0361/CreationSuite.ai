import { Edit3, Sparkles, Copy, Wand2 } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const HumanizeText = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const { getToken } = useAuth();

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInput(text);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (wordCount > 1000) {
        return toast.error('Text exceeds 1000 word limit');
      }

      setLoading(true);
      
      const { data } = await axios.post(
        '/api/ai/humanize-text', 
        { text: input }, 
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        setContent(data.content);
        toast.success('Text humanized successfully');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to humanize text');
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
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-white'>
      {/* Left column - Form */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-zinc-900 rounded-lg'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#00AD25]' />
          <h1 className='text-xl font-semibold'>Humanize Text</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Enter your text</p>
        
        <textarea
          onChange={handleInputChange}
          value={input}
          rows={8}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
          placeholder='Paste your AI-generated or formal text here to make it sound more natural...'
          required
        />

        <div className='flex justify-between items-center mt-1'>
          <p className='text-xs text-gray-400'>
            {wordCount} / 1000 words
          </p>
          {wordCount > 1000 && (
            <p className='text-xs text-red-400'>
              Exceeds word limit
            </p>
          )}
        </div>

        <button
          disabled={loading || wordCount > 1000}
          className={`w-full flex justify-center items-center gap-2 ${
            wordCount > 1000 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-[#00AD25] to-[#04FF50] hover:opacity-90'
          } text-white px-4 py-2 mt-4 text-sm rounded-lg`}
        >
          {loading ? (
            <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
          ) : (
            <>
              <Wand2 className='w-5' />
              Humanize Text
            </>
          )}
        </button>
      </form>

      {/* Right column - Results */}
      <div className='w-full max-w-lg p-4 bg-zinc-900 rounded-lg flex flex-col min-h-96 max-h-[600px]'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Edit3 className='w-5 h-5 text-[#00AD25]' />
            <h1 className='text-xl font-semibold'>Humanized Text</h1>
          </div>
          {content && (
            <button
              onClick={copyToClipboard}
              className='flex items-center gap-1 text-sm text-gray-300 hover:text-white'
              title="Copy text"
            >
              <Copy className='w-4 h-4' />
              Copy
            </button>
          )}
        </div>

        {!content ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Edit3 className='w-9 h-9' />
              <p className='text-center'>
                Enter your text and click "Humanize Text" to convert it to natural language
              </p>
            </div>
          </div>
        ) : (
          <div className='mt-3 h-full overflow-y-scroll text-sm text-white'>
            <div className='reset-tw'>
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HumanizeText;