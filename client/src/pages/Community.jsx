import { useAuth, useUser } from '@clerk/clerk-react'
import React, { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useTheme } from '../context/ThemeContext'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const Community = () => {
  const [creations, setCreations] = useState([])
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()
  const { theme } = useTheme()

  const fetchCreations = async () => {
    try {
      const { data } = await axios.get('/api/user/get-published-creations', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setCreations(data.creations)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  const imageLikeToggle = async (id) => {
    try {
      const { data } = await axios.post('/api/user/toggle-like-creation', { id }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        toast.success(data.message)
        await fetchCreations()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCreations()
    }
  }, [user])

  return !loading ? (
    <div className={`flex-1 h-full flex flex-col gap-4 p-6 ${
      theme === 'dark' ? 'text-white' : 'text-gray-900'
    }`}>
      <h1 className='text-xl font-semibold'>Community Creations</h1>
      <div className={`h-full w-full rounded-xl overflow-y-auto ${
        theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-100'
      }`}>
        <div className='columns-1 sm:columns-2 lg:columns-3 gap-4 p-4'>
          {creations.map((creation, index) => (
            <div key={index} className='relative group mb-4 break-inside-avoid'>
              <img 
                src={creation.content} 
                alt="" 
                className='w-full h-auto rounded-lg object-cover transition-transform duration-300 group-hover:scale-[1.02]' 
              />

              <div className={`absolute inset-0 flex flex-col justify-end p-3 rounded-lg ${
                theme === 'dark'
                  ? 'group-hover:bg-gradient-to-b from-transparent to-black/80'
                  : 'group-hover:bg-gradient-to-b from-transparent to-gray-900/80'
              }`}>
                <p className={`text-sm hidden group-hover:block mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-100'
                }`}>{creation.prompt}</p>
                <div className='flex gap-1 items-center justify-end group-hover:justify-between'>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-white' : 'text-gray-100'
                  }`}>{creation.likes.length}</p>
                  <Heart 
                    onClick={() => imageLikeToggle(creation.id)} 
                    className={`min-w-5 h-5 hover:scale-110 cursor-pointer transition-transform ${
                      creation.likes.includes(user.id) 
                        ? 'fill-red-500 text-red-600' 
                        : theme === 'dark' 
                          ? 'text-white' 
                          : 'text-gray-100'
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : (
    <div className='flex justify-center items-center h-full'>
      <span className={`w-10 h-10 my-1 rounded-full border-3 ${
        theme === 'dark' ? 'border-[#00DA83]' : 'border-green-500'
      } border-t-transparent animate-spin`}></span>
    </div>
  )
}

export default Community