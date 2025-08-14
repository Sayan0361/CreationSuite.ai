import { useAuth } from '@clerk/clerk-react';
import { Hash, Sparkles, Copy } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import Markdown from 'react-markdown'
import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const BlogTitles = () => {
  const blogCategories = ['General', 'Technology', 'Business', 'Health', 'Lifestyle', 'Education', 'Travel', 'Food']
  
  const [selectedCategory, setSelectedCategory] = useState('General')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const {getToken} = useAuth()

  const onSubmitHandler = async (e)=>{
    e.preventDefault();
    try {
      setLoading(true)
      const prompt = `Generate atleast very good 10 blog titles for the keyword ${input} in the category ${selectedCategory}. Generate it within 500 words only and dont exceed the limit length.`

      const { data } = await axios.post('/api/ai/generate-blog-title', {prompt}, {headers: {Authorization: `Bearer ${await getToken()}`}})

      if (data.success) {
        setContent(data.content)
        toast.success("Title Generated")
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
        toast.success('Titles copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy titles');
      });
  };

  return (
    <div className='h-full overflow-y-auto p-6 flex flex-col md:flex-row gap-6 text-white'>
      {/* Input Section */}
      <form onSubmit={onSubmitHandler} className='w-full md:w-1/2 p-6 bg-zinc-900 rounded-xl border border-zinc-700 shadow-lg'>
        <div className='flex items-center gap-3 mb-6'>
          <Sparkles className='w-6 h-6 text-[#8E37EB]'/>
          <h1 className='text-xl font-semibold'>AI Title Generator</h1>
        </div>
        
        <div className='space-y-6'>
          <div>
            <label className='block text-sm font-medium mb-2'>Keyword</label>
            <input 
              onChange={(e)=>setInput(e.target.value)} 
              value={input} 
              type="text" 
              className='w-full p-3 bg-zinc-800 border border-zinc-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all' 
              placeholder='Generate a title on....' 
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Category</label>
            <div className='flex flex-wrap gap-2'>
              {blogCategories.map((item)=>(
                <button
                  type="button"
                  onClick={()=> setSelectedCategory(item)} 
                  className={`px-4 py-2 text-sm rounded-full transition-all ${
                    selectedCategory === item 
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' 
                      : 'bg-zinc-800 text-gray-300 border border-zinc-700 hover:border-zinc-500'
                  }`} 
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button 
            disabled={loading} 
            className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-4 py-3 text-sm rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/20 ${
              loading ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {
              loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              : <Hash className='w-5 h-5'/>
            }
            Generate titles
          </button>
        </div>
      </form>

      {/* Output Section */}
      <div className='w-full md:w-1/2 p-6 bg-zinc-900 rounded-xl border border-zinc-700 shadow-lg flex flex-col h-full min-h-[500px] max-h-[calc(100vh-100px)]'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <Hash className='w-6 h-6 text-[#8E37EB]' />
            <h1 className='text-xl font-semibold'>Generated Titles</h1>
          </div>
          {content && (
            <button 
              onClick={copyToClipboard}
              className='flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-all'
              title="Copy titles"
            >
              <Copy className='w-4 h-4' />
              Copy
            </button>
          )}
        </div>

        {!content ? (
          <div className='flex-1 flex flex-col justify-center items-center text-center p-6'>
            <div className='text-sm flex flex-col items-center gap-4 text-gray-400'>
              <Hash className='w-10 h-10 opacity-50' />
              <p>Enter a topic and click "Generate title" to get started</p>
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

export default BlogTitles