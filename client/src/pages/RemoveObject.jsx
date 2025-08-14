import { Scissors, Sparkles, Download, X } from 'lucide-react';
import React, { useState, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {
  const [input, setInput] = useState(null)
  const [preview, setPreview] = useState('')
  const [object, setObject] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [downloading, setDownloading] = useState(false)
  const fileInputRef = useRef(null)

  const {getToken} = useAuth()

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
    try {
      setLoading(true)

      if(object.split(' ').length > 1){
        return toast('Please enter only one object name')
      }

      const formData = new FormData()
      formData.append('image', input)
      formData.append('object', object)

      const { data } = await axios.post('/api/ai/remove-image-object',formData, {headers: {Authorization: `Bearer ${await getToken()}`}})

      if (data.success) {
        setContent(data.content)
        toast.success("Object removed successfully")
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
      link.download = `object-removed-${Date.now()}.png`;
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
          <h1 className='text-xl font-semibold'>Object Removal</h1>
        </div>
        
        <div className='space-y-6'>
          <div>
            <label className='block text-sm font-medium mb-2'>Upload Image</label>
            
            {preview ? (
              <div className="relative w-full rounded-lg overflow-hidden border border-zinc-600">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-64 object-contain bg-zinc-800"
                />
                <button
                  type="button"
                  onClick={clearSelection}
                  className="absolute top-2 right-2 p-1 bg-zinc-800/80 rounded-full hover:bg-zinc-700 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col w-full h-32 border-2 border-zinc-600 border-dashed rounded-lg cursor-pointer bg-zinc-800 hover:bg-zinc-700/50 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-zinc-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-zinc-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-zinc-500">PNG, JPG, JPEG (MAX. 10MB)</p>
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

          <div>
            <label className='block text-sm font-medium mb-2'>Object to Remove</label>
            <input
              type="text"
              value={object}
              onChange={(e) => setObject(e.target.value)}
              className="w-full p-3 text-sm rounded-md border border-zinc-600 bg-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Enter object name (e.g., watch, spoon)"
              required
            />
            <p className="mt-1 text-xs text-zinc-400">Enter only one object name to remove</p>
          </div>

          <button 
            disabled={loading || !input || !object} 
            className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-4 py-3 text-sm rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/20 ${
              loading || !input || !object ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {
              loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              : <Scissors className='w-5 h-5'/>
            }
            Remove Object
          </button>
        </div>
      </form>

      {/* Output Section */}
      <div className='w-full md:w-1/2 p-6 bg-zinc-900 rounded-xl border border-zinc-700 shadow-lg flex flex-col h-full min-h-[500px] max-h-[calc(100vh-100px)]'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <Scissors className='w-6 h-6 text-[#4A7AFF]' />
            <h1 className='text-xl font-semibold'>Processed Image</h1>
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
              <Scissors className='w-10 h-10 opacity-50' />
              <p>{preview ? 'Enter object name and click "Remove Object"' : 'Upload an image to get started'}</p>
            </div>
          </div>
        ) : (
          <div className='flex-1 flex items-center justify-center overflow-hidden'>
            <img 
              src={content} 
              alt="object removed" 
              className='w-full h-full object-contain max-h-[70vh] rounded-lg'
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default RemoveObject;