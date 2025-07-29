import React from 'react'
import {assets} from "../assets/assets"
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react';
import {useClerk,UserButton,useUser} from  "@clerk/clerk-react"

const Navbar = () => {
  const navigate = useNavigate();
  const {user} = useUser();
  const {openSignIn} = useClerk();

  return (
    <div className='fixed z-50 w-full backdrop-blur-xl flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32 bg-zinc-900/80 border-b border-zinc-700'>
      <div 
        onClick={() => navigate('/')}
        className="cursor-pointer hover:opacity-90 transition-opacity"
      >
        <h1 className="text-2xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
          Creation<span className="text-white">Suite</span>
          <span className="text-xs align-top ml-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">.ai</span>
        </h1>
      </div>
      {
        user ? 
        <div className='bg-zinc-800 p-1 rounded-full border border-zinc-700'>
          <UserButton appearance={{
            elements: {
              userButtonAvatarBox: "w-9 h-9",
              userButtonPopoverCard: "bg-zinc-800 border border-zinc-700",
              userPreviewSecondaryIdentifier: "text-zinc-400",
              userButtonPopoverActionButtonText: "text-zinc-200",
              userButtonPopoverActionButton: "hover:bg-zinc-700",
              userButtonPopoverFooter: "bg-zinc-800"
            }
          }}/>
        </div> :
        (
          <button 
            onClick={openSignIn} 
            className="flex items-center gap-2 rounded-full text-sm cursor-pointer 
            bg-gradient-to-r from-blue-600 to-indigo-600 
            text-white px-10 py-2.5 hover:from-blue-700 hover:to-indigo-700 
            transition duration-300 ease-in-out shadow-lg hover:shadow-blue-500/20"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        )
      }
    </div>
  )
}

export default Navbar