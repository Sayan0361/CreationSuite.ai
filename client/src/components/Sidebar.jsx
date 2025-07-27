import { Protect, useClerk, useUser } from '@clerk/clerk-react'
import { 
    Eraser, 
    FileText, 
    Hash, 
    House, 
    Image, 
    LogOut, 
    Scissors, 
    SquarePen, 
    Users,
    Sparkles, 
    BarChart2, 
    MessageSquare
} from 'lucide-react';
import React from 'react'
import { NavLink } from 'react-router-dom';

const navItems = [
    {to: '/ai', label: 'Dashboard', Icon: House},
    {to: '/ai/write-article', label: 'Write Article', Icon: SquarePen},
    {to: '/ai/blog-titles', label: 'Blog Titles', Icon: Hash},
    {to: '/ai/humanize-text', label: 'Humanize Text', Icon: Sparkles}, // Changed to Sparkles
    {to: '/ai/generate-images', label: 'Generate Images', Icon: Image},
    {to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser},
    {to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors},
    {to: '/ai/review-resume', label: 'Review Resume', Icon: FileText},
    {to: '/ai/calculate-ats-score', label: 'Calculate ATS Score', Icon: BarChart2},
    {to: '/ai/chat-with-pdf', label: 'Chat With PDF', Icon: MessageSquare},
    {to: '/ai/community', label: 'Community', Icon: Users},
]

const Sidebar = ({ sidebar, setSidebar }) => {
    const {user} = useUser();
    const {signOut, openUserProfile} = useClerk()

    return (
        <div className={`w-60 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between items-center max-sm:absolute top-14 bottom-0 z-50 ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>
            <div className='my-7 w-full'>
            <img src={user.imageUrl} alt="User avatar" className='w-13 rounded-full mx-auto cursor-pointer border-2 border-zinc-700 hover:border-zinc-600 transition-colors' onClick={openUserProfile}/>
            <h1 className='mt-1 text-center cursor-pointer font-semibold text-white' onClick={openUserProfile}>{user.fullName}</h1>
            <div className='px-6 mt-5 text-sm text-gray-300 font-medium'>
                {navItems.map(({to, label, Icon})=>(
                    <NavLink 
                        key={to} 
                        to={to} 
                        end={to === '/ai'} 
                        onClick={()=> setSidebar(false)} 
                        className={({isActive})=> `px-3.5 py-2.5 flex items-center gap-3 rounded hover:bg-zinc-800 transition-colors ${isActive ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}`}
                    >
                        {({ isActive })=>(
                            <>
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}` } />
                            <span className={isActive ? 'text-white' : 'text-gray-300'}>{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </div>

        <div className='w-full border-t border-zinc-800 p-4 px-7 flex items-center justify-between'>
                <div onClick={openUserProfile} className='flex gap-2 items-center cursor-pointer'>
                    <img src={user.imageUrl} className='w-8 rounded-full border border-zinc-700' alt="" />
                    <div>
                        <h1 className='text-sm font-medium text-white'>{user.fullName}</h1>
                        <p className='text-xs text-zinc-400'>
                            <Protect plan='premium' fallback="Free">Premium</Protect> Plan
                        </p>
                    </div>
                </div>
                <LogOut 
                    onClick={signOut} 
                    className='w-4.5 text-zinc-400 hover:text-white transition-colors cursor-pointer'
                />
            </div>
        </div>
    )
}

export default Sidebar