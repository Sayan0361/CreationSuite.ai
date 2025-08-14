// Layout.jsx
import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { SignIn, useUser } from '@clerk/clerk-react'

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const { user } = useUser()

  return user ? (
    <div className='fixed inset-0 flex flex-col bg-zinc-950 overflow-hidden'>
      {/* Navbar - fixed height */}
      <nav className='w-full h-16 px-8 flex items-center justify-between border-b border-gray-800 bg-zinc-950 flex-shrink-0'>
        <div 
          onClick={() => navigate('/')}
          className="cursor-pointer hover:opacity-90 transition-opacity"
        >
          <h1 className="text-2xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
            Creation<span className="text-white">Suite</span>
            <span className="text-xs align-top ml-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">.ai</span>
          </h1>
        </div>
        {sidebar ? (
          <X 
            onClick={() => setSidebar(false)} 
            className='w-6 h-6 text-gray-400 sm:hidden cursor-pointer'
          />
        ) : (
          <Menu 
            onClick={() => setSidebar(true)} 
            className='w-6 h-6 text-gray-400 sm:hidden cursor-pointer'
          />
        )}
      </nav>

      {/* Main content area*/}
      <div className='flex-1 flex overflow-hidden'>
        <Sidebar sidebar={sidebar} setSidebar={setSidebar}/>
        {/* Content container with scroll */}
        <div className='flex-1 bg-zinc-950 text-gray-500 overflow-auto'>
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <div className='fixed inset-0 flex items-center justify-center bg-zinc-950 overflow-auto'>
      <div className='bg-zinc-900 p-8 rounded-lg m-4'>
        <SignIn appearance={{
          baseTheme: 'dark',
          variables: {
            colorBackground: '#09090b',
            colorText: 'white'
          },
          elements: {
            card: {
              backgroundColor: '#18181b'
            }
          }
        }} />
      </div>
    </div>
  )
}

export default Layout