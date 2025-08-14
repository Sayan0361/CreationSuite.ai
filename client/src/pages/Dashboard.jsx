import React, { useEffect, useState } from 'react';
import { Gem, Sparkles, FileText, ChevronRight } from 'lucide-react';
import { Protect, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import CreationItem from '../components/CreationItem';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [pdfChats, setPdfChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllCreations, setShowAllCreations] = useState(false);
  const [showAllPdfChats, setShowAllPdfChats] = useState(false);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const getDashboardData = async () => {
    try {
      setLoading(true);
      
      const [creationsRes, pdfChatsRes] = await Promise.all([
        axios.get('/api/user/get-user-creations', {
          headers: { Authorization: `Bearer ${await getToken()}` }
        }),
        axios.get('/api/ai/pdf-chat-history', {
          headers: { Authorization: `Bearer ${await getToken()}` }
        })
      ]);

      if (creationsRes.data.success) {
        setCreations(creationsRes.data.creations);
      } else {
        toast.error(creationsRes.data.message);
      }

      if (pdfChatsRes.data.success) {
        const groupedChats = pdfChatsRes.data.files ? 
          await Promise.all(pdfChatsRes.data.files.map(async fileName => {
            const { data } = await axios.get(
              `/api/ai/pdf-chat-history?file_name=${encodeURIComponent(fileName)}`,
              { headers: { Authorization: `Bearer ${await getToken()}` } }
            );
            return {
              type: 'pdf-chat',
              fileName,
              lastMessage: data.chatHistory?.[data.chatHistory.length - 1]?.content || '',
              createdAt: new Date().toISOString()
            };
          })) : [];
        
        setPdfChats(groupedChats);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  const toggleAllCreations = () => {
    setShowAllCreations(!showAllCreations);
  };

  const toggleAllPdfChats = () => {
    setShowAllPdfChats(!showAllPdfChats);
  };

  const navigateToCreate = () => {
    navigate('/ai/write-article');
  };

  const navigateToPdfChat = () => {
    navigate('/ai/chat-with-pdf');
  };

  return (
    <div className='h-full overflow-y-auto p-4 md:p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl md:text-3xl font-bold text-white'>
            Dashboard
          </h1>
          <button 
            onClick={getDashboardData}
            className='text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-gray-300 transition-colors flex items-center gap-1'
          >
            Refresh
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-cw">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
            </svg>
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
          {/* Total Creation Card */}
          <div className='flex justify-between items-center p-5 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all'>
            <div className='text-white'>
              <p className='text-sm text-gray-400 mb-1'>
                Total Creations
              </p>
              <h2 className='text-2xl font-semibold'>
                {creations.length + pdfChats.length}
              </h2>
            </div>
            <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center shadow-lg'>
              <Sparkles className='w-5 text-white'/>
            </div>
          </div>

          {/* AI Chats Card */}
          <div className='flex justify-between items-center p-5 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all'>
            <div className='text-white'>
              <p className='text-sm text-gray-400 mb-1'>PDF Chats</p>
              <h2 className='text-2xl font-semibold'>
                {pdfChats.length}
              </h2>
            </div>
            <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-[#00DA83] to-[#009BB3] text-white flex justify-center items-center shadow-lg'>
              <FileText className='w-5 text-white' />
            </div>
          </div>

          {/* Active Plan Card */}
          <div className='flex justify-between items-center p-5 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all'>
            <div className='text-white'>
              <p className='text-sm text-gray-400 mb-1'>Active Plan</p>
              <h2 className='text-2xl font-semibold'>
                <Protect plan='premium' fallback="Free">Premium</Protect>
              </h2>
            </div>
            <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center shadow-lg'>
              <Gem className='w-5 text-white' />
            </div>
          </div>
        </div>

        {/* Recent Creations Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold text-white'>Recent Creations</h2>
            {creations.length > 4 && (
              <button 
                onClick={toggleAllCreations}
                className='text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-gray-300 transition-colors flex items-center gap-1'
              >
                {showAllCreations ? 'Show less' : 'View all'} <ChevronRight className={`w-3 h-3 transition-transform ${showAllCreations ? 'rotate-90' : ''}`} />
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="grid place-items-center py-10">
              <div className="w-8 h-8 rounded-full border-4 border-[#00DA83] border-t-transparent animate-spin"></div>
            </div>
          ) : creations.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {creations.slice(0, showAllCreations ? creations.length : 4).map((item) => (
                <CreationItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
              <p className="text-gray-400">No creations found</p>
              <button
                onClick={navigateToCreate}
                className="mt-2 px-4 py-2 bg-[#00DA83] hover:bg-[#00c978] text-white rounded-lg transition-colors"
              >
                Create Your First Content
              </button>
            </div>
          )}
        </div>

        {/* PDF Chats Section */}
        <div>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold text-white'>Recent PDF Chats</h2>
            {pdfChats.length > 3 && (
              <button 
                onClick={toggleAllPdfChats}
                className='text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-gray-300 transition-colors flex items-center gap-1'
              >
                {showAllPdfChats ? 'Show less' : 'View all'} <ChevronRight className={`w-3 h-3 transition-transform ${showAllPdfChats ? 'rotate-90' : ''}`} />
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="grid place-items-center py-10">
              <div className="w-8 h-8 rounded-full border-4 border-[#00DA83] border-t-transparent animate-spin"></div>
            </div>
          ) : pdfChats.length > 0 ? (
            <div className='space-y-3'>
              {pdfChats.slice(0, showAllPdfChats ? pdfChats.length : 3).map((chat, index) => (
                <div 
                  key={index} 
                  className="group p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 text-white transition-all cursor-pointer"
                  onClick={() => navigate('/ai/chat-with-pdf')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 text-[#00DA83]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm md:text-base truncate">{chat.fileName}</h3>
                      <p className="text-xs md:text-sm text-gray-400 truncate">
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
              <p className="text-gray-400">No PDF chats found</p>
              <button
                onClick={navigateToPdfChat}
                className="mt-2 px-4 py-2 bg-[#00DA83] hover:bg-[#00c978] text-white rounded-lg transition-colors"
              >
                Start New PDF Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;