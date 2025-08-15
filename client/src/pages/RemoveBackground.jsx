import { Eraser, Sparkles, Download, X } from 'lucide-react';
import React, { useState, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveBackground = () => {
  const [input, setInput] = useState(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [downloading, setDownloading] = useState(false)
  const fileInputRef = useRef(null)
  const { theme } = useTheme();
  const { getToken } = useAuth()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setInput(file)
    
    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const clearSelection = () => {
    setInput(null)
    setPreview('')
    setContent('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmitHandler = async (e)=>{
    e.preventDefault();
    if (!input) return
    
    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('image', input)

      const { data } = await axios.post('/api/ai/remove-image-background',formData, {headers: {Authorization: `Bearer ${await getToken()}`}})

      if (data.success) {
        setContent(data.content)
        toast.success("Background removed successfully")
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
      link.download = `background-removed-${Date.now()}.png`;
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
    <div className={`h-full overflow-y-auto p-6 flex flex-col md:flex-row gap-6 ${
      theme === 'dark' ? 'text-white' : 'text-gray-900'
    }`}>
      {/* Input Section */}
      <form onSubmit={onSubmitHandler} className={`w-full md:w-1/2 p-6 rounded-xl border shadow-lg ${
        theme === 'dark' 
          ? 'bg-zinc-900 border-zinc-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className='flex items-center gap-3 mb-6'>
          <Sparkles className={`w-6 h-6 ${
            theme === 'dark' ? 'text-[#FF4938]' : 'text-red-600'
          }`}/>
          <h1 className='text-xl font-semibold'>Background Removal</h1>
        </div>
        
        <div className='space-y-6'>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Upload Image</label>
            
            {preview ? (
              <div className={`relative w-full rounded-lg overflow-hidden border ${
                theme === 'dark' ? 'border-zinc-600' : 'border-gray-300'
              }`}>
                <img 
                  src={preview} 
                  alt="Preview" 
                  className={`w-full h-64 object-contain ${
                    theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={clearSelection}
                  className={`absolute top-2 right-2 p-1 rounded-full hover:bg-opacity-80 transition-all ${
                    theme === 'dark' 
                      ? 'bg-zinc-800/80 hover:bg-zinc-700' 
                      : 'bg-gray-200/80 hover:bg-gray-300'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label className={`flex flex-col w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                  theme === 'dark' 
                    ? 'border-zinc-600 bg-zinc-800 hover:bg-zinc-700/50' 
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className={`w-8 h-8 mb-4 ${
                      theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
                    }`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className={`mb-2 text-sm ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                    }`}>
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
                    }`}>PNG, JPG, JPEG (MAX. 10MB)</p>
                  </div>
                  <input 
                    ref={fileInputRef}
                    onChange={handleFileChange} 
                    type="file" 
                    accept='image/*' 
                    className="hidden" 
                    required
                  />
                </label>
              </div>
            )}
          </div>

          <button 
            disabled={loading || !input} 
            className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#F6AB41] to-[#FF4938] text-white px-4 py-3 text-sm rounded-lg transition-all hover:shadow-lg ${
              theme === 'dark' 
                ? 'hover:shadow-orange-500/20' 
                : 'hover:shadow-orange-400/30'
            } ${
              loading || !input ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {
              loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              : <Eraser className='w-5 h-5'/>
            }
            Remove Background
          </button>
        </div>
      </form>

      {/* Output Section */}
      <div className={`w-full md:w-1/2 p-6 rounded-xl border shadow-lg flex flex-col h-full min-h-[500px] max-h-[calc(100vh-100px)] ${
        theme === 'dark' 
          ? 'bg-zinc-900 border-zinc-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <Eraser className={`w-6 h-6 ${
              theme === 'dark' ? 'text-[#FF4938]' : 'text-red-600'
            }`} />
            <h1 className='text-xl font-semibold'>Processed Image</h1>
          </div>
          {content && (
            <button 
              onClick={downloadImage}
              disabled={downloading}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                theme === 'dark' 
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
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
            <div className={`text-sm flex flex-col items-center gap-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Eraser className='w-10 h-10 opacity-50' />
              <p>{preview ? 'Click "Remove Background" to process' : 'Upload an image to get started'}</p>
            </div>
          </div>
        ) : (
          <div className='flex-1 flex items-center justify-center overflow-hidden'>
            <img 
              src={content} 
              alt="background removed" 
              className={`w-full h-full object-contain max-h-[70vh] rounded-lg ${
                theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
              } border`}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default RemoveBackground;