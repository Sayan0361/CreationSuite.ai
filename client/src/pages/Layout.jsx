import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { SignIn, useUser } from '@clerk/clerk-react'

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const { user } = useUser()

  return user ? (
    <div className='flex flex-col items-start justify-start h-screen bg-zinc-950'>

      <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-800 bg-zinc-950'>
        <img className='cursor-pointer w-32 sm:w-44' src={assets.logo} alt="" onClick={()=>navigate('/')} />
        {  /* Sidebar-Hamburger Menu for mobile devices */
          sidebar ? <X onClick={()=> setSidebar(false)} className='w-6 h-6 text-gray-400 sm:hidden'/>
          : <Menu onClick={()=> setSidebar(true)} className='w-6 h-6 text-gray-400 sm:hidden'/>
        }
      </nav>

      <div className='flex-1 w-full flex h-[calc(100vh-64px)]'>
          <Sidebar sidebar={sidebar} setSidebar={setSidebar}/>
          <div className='flex-1 bg-zinc-950 text-gray-500 overflow-y-auto'>
            <Outlet />
          </div>
      </div>

    </div>
  ) : 
  ( 
    // user is not loggedIn
    <div className='flex items-center justify-center h-screen bg-zinc-950'>
      <div className='bg-zinc-900 p-8 rounded-lg'>
        <SignIn appearance={{
          baseTheme: 'dark',
          variables: {
            colorBackground: '#09090b', // zinc-950
            colorText: 'white'
          },
          elements: {
            card: {
              backgroundColor: '#18181b' // zinc-800
            }
          }
        }} />
      </div>
    </div>
  )
}

export default Layout