import { Edit, Sparkles, Copy } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const WriteArticle = () => {
  const articleLength = [
    {length: 800, text: 'Short (500-800 words)'},
    {length: 1200, text: 'Medium (800-1200 words)'},
    {length: 1600, text: 'Long (1200+ words)'}
  ]

  const [selectedLength, setSelectedLength] = useState(articleLength[0])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const {getToken} = useAuth()

  const onSubmitHandler = async (e)=>{
    e.preventDefault();
    try {
      setLoading(true)
      const prompt = `Write an article about ${input} in ${selectedLength.text} only. Write it just like a Human and don't exceed the length limit.`

      const {data} = await axios.post('/api/ai/generate-article', {prompt, length:selectedLength.length}, {
        headers: {Authorization: `Bearer ${await getToken()}`}
      })

      if(data.success){
        setContent(data.content)
        toast.success("Article Generated")
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  const copyToClipboard = () => {
    if (!content) return;
    navigator.clipboard.writeText(content)
      .then(() => {
        toast.success('Article copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy article');
      });
  };

  return (
    <div className='h-full overflow-y-auto p-6 flex flex-col md:flex-row gap-6 text-white'>
      {/* Input Section */}
      <form onSubmit={onSubmitHandler} className='w-full md:w-1/2 p-6 bg-zinc-900 rounded-xl border border-zinc-700 shadow-lg'>
        <div className='flex items-center gap-3 mb-6'>
          <Sparkles className='w-6 h-6 text-[#4A7AFF]'/>
          <h1 className='text-xl font-semibold'>Article Configuration</h1>
        </div>
        
        <div className='space-y-6'>
          <div>
            <label className='block text-sm font-medium mb-2'>Article Topic</label>
            <input 
              onChange={(e)=>setInput(e.target.value)} 
              value={input} 
              type="text" 
              className='w-full p-3 bg-zinc-800 border border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all' 
              placeholder='Write an article on....' 
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Article Length</label>
            <div className='flex flex-wrap gap-2'>
              {articleLength.map((item, index)=>(
                <button
                  type="button"
                  onClick={()=> setSelectedLength(item)} 
                  className={`px-4 py-2 text-sm rounded-full transition-all ${
                    selectedLength.text === item.text 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' 
                      : 'bg-zinc-800 text-gray-300 border border-zinc-700 hover:border-zinc-500'
                  }`} 
                  key={index}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>

          <button 
            disabled={loading} 
            className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-3 text-sm rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/20 ${
              loading ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {
              loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              : <Edit className='w-5 h-5'/>
            }
            Generate article
          </button>
        </div>
      </form>

      {/* Output Section */}
      <div className='w-full md:w-1/2 p-6 bg-zinc-900 rounded-xl border border-zinc-700 shadow-lg flex flex-col h-full min-h-[500px] max-h-[calc(100vh-100px)]'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <Edit className='w-6 h-6 text-[#4A7AFF]' />
            <h1 className='text-xl font-semibold'>Generated Article</h1>
          </div>
          {content && (
            <button 
              onClick={copyToClipboard}
              className='flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-all'
              title="Copy article"
            >
              <Copy className='w-4 h-4' />
              Copy
            </button>
          )}
        </div>

        {!content ? (
          <div className='flex-1 flex flex-col justify-center items-center text-center p-6'>
            <div className='text-sm flex flex-col items-center gap-4 text-gray-400'>
              <Edit className='w-10 h-10 opacity-50' />
              <p>Enter a topic and click "Generate article" to get started</p>
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
  )
}

export default WriteArticle