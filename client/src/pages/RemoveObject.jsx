import { Scissors, Sparkles, Download } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {

  const [input, setInput] = useState('')
  const [object, setObject] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [downloading, setDownloading] = useState(false)

  const {getToken} = useAuth()
      
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
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-white'>
      {/* left col */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-zinc-900 rounded-lg '>

          <div className='flex items-center gap-3'>
            <Sparkles className='w-6 text-[#4A7AFF]'/>
            <h1 className='text-xl font-semibold'>Object Removal</h1>
          </div>

          <p className='mt-6 text-sm font-medium'>Upload image</p>

          <input onChange={(e)=>setInput(e.target.files[0])} type="file" accept='image/*' className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-white' required/>

          <p className='mt-6 text-sm font-medium'>Describe object name to remove</p>

          <textarea onChange={(e)=>setObject(e.target.value)} value={object} rows={4} className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300' placeholder='e.g., watch or spoon , Only single object name' required/>
          
          <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
            {
              loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
              : <Scissors className='w-5'/>
            }
            
            Remove object
          </button>
      </form>
      {/* Right col */}
      <div className='w-full max-w-lg p-4 bg-zinc-900 rounded-lg flex flex-col min-h-96'>

            <div className='flex items-center gap-3'>
              <Scissors className='w-5 h-5 text-[#4A7AFF]' />
              <h1 className='text-xl font-semibold'>Processed Image</h1>
            </div>

            {
              !content ? 
              (
                <div className='flex-1 flex justify-center items-center'>
                  <div className='text-sm flex flex-col items-center gap-5 text-white'>
                    <Scissors className='w-9 h-9' />
                    <p>Upload an image and click "Remove Object" to get started</p>
                  </div>
                </div>
              )
              :
              (
                <div className='mt-3 h-full flex flex-col'>
                  <img src={content} alt="object removed" className='w-full h-full object-contain'/>
                  <button 
                    onClick={downloadImage}
                    disabled={downloading}
                    className='mt-4 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50'
                  >
                    {downloading ? (
                      <span className='w-4 h-4 rounded-full border-2 border-t-transparent animate-spin'></span>
                    ) : (
                      <>
                        <Download className='w-4 h-4' />
                        Download Image
                      </>
                    )}
                  </button>
                </div>
              )
            }
      </div>
    </div>
  )
}

export default RemoveObject