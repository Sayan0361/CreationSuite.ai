import { Image, Sparkles, Download } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  const imageStyle = ['Realistic', 'Ghibli style', 'Anime style', 'Cartoon style', 'Fantasy style', 'Realistic style', '3D style', 'Portrait style']
    
  const [selectedStyle, setSelectedStyle] = useState('Realistic')
  const [input, setInput] = useState('')
  const [publish, setPublish] = useState(false)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [downloading, setDownloading] = useState(false)

  const {getToken} = useAuth()

  const onSubmitHandler = async (e)=>{
    e.preventDefault();
    try {
      setLoading(true)

      const prompt = `Generate an image of ${input} in the style ${selectedStyle}. Create a very good image plsss.`

      const { data } = await axios.post('/api/ai/generate-image', {prompt, publish}, {headers: {Authorization: `Bearer ${await getToken()}`}})

      if (data.success) {
        setContent(data.content)
        toast.success("Image Generated")
      }else{
        toast.error(data.message)
      }
      } catch (error) {
        toast.error(error.message)
      }
    setLoading(false)
  }

  const downloadImage = async () => {
    if (!content) return;
    
    try {
      setDownloading(true);
      const response = await fetch(content);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-generated-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      toast.error('Failed to download image');
      console.error('Download error:', error);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className='h-full overflow-y-auto p-6 flex flex-col md:flex-row gap-6 text-white'>
      {/* Input Section */}
      <form onSubmit={onSubmitHandler} className='w-full md:w-1/2 p-6 bg-zinc-900 rounded-xl border border-zinc-700 shadow-lg'>
        <div className='flex items-center gap-3 mb-6'>
          <Sparkles className='w-6 h-6 text-[#4A7AFF]'/>
          <h1 className='text-xl font-semibold'>Image Configuration</h1>
        </div>
        
        <div className='space-y-6'>
          <div>
            <label className='block text-sm font-medium mb-2'>Image Description</label>
            <textarea 
              onChange={(e)=>setInput(e.target.value)} 
              value={input} 
              rows={4}
              className='w-full p-3 bg-zinc-800 border border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all' 
              placeholder='Describe what you want to see in the image...' 
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Image Style</label>
            <div className='flex flex-wrap gap-2'>
              {imageStyle.map((item, index)=>(
                <button
                  type="button"
                  onClick={()=> setSelectedStyle(item)} 
                  className={`px-4 py-2 text-sm rounded-full transition-all ${
                    selectedStyle === item 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' 
                      : 'bg-zinc-800 text-gray-300 border border-zinc-700 hover:border-zinc-500'
                  }`} 
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={publish} 
                onChange={(e)=>setPublish(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
            <span className="text-sm text-gray-300">Make this image public</span>
          </div>

          <button 
            disabled={loading} 
            className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-3 text-sm rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/20 ${
              loading ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {
              loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              : <Image className='w-5 h-5'/>
            }
            Generate Image
          </button>
        </div>
      </form>

      {/* Output Section */}
      <div className='w-full md:w-1/2 p-6 bg-zinc-900 rounded-xl border border-zinc-700 shadow-lg flex flex-col h-full min-h-[500px] max-h-[calc(100vh-100px)]'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <Image className='w-6 h-6 text-[#4A7AFF]' />
            <h1 className='text-xl font-semibold'>Generated Image</h1>
          </div>
          {content && (
            <button 
              onClick={downloadImage}
              disabled={downloading}
              className='flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-all'
              title="Download image"
            >
              {downloading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              ) : (
                <>
                  <Download className='w-4 h-4' />
                  Download
                </>
              )}
            </button>
          )}
        </div>

        {!content ? (
          <div className='flex-1 flex flex-col justify-center items-center text-center p-6'>
            <div className='text-sm flex flex-col items-center gap-4 text-gray-400'>
              <Image className='w-10 h-10 opacity-50' />
              <p>Enter a description and click "Generate Image" to get started</p>
            </div>
          </div>
        ) : (
          <div className='flex-1 flex items-center justify-center overflow-hidden'>
            <img 
              src={content} 
              alt="generated content" 
              className='w-full h-full object-contain max-h-[70vh] rounded-lg'
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default GenerateImages;