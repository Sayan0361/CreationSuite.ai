import React, { useEffect, useState } from 'react';
import { Gem, Sparkles, FileText } from 'lucide-react';
import { Protect, useAuth } from '@clerk/clerk-react';
import CreationItem from '../components/CreationItem';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [pdfChats, setPdfChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const getDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch both creations and PDF chats in parallel
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
        // Group PDF chats by file name
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
              createdAt: new Date().toISOString() // You might want to get actual date from your data
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

  return (
    <div className='h-full overflow-y-auto p-4 md:p-6'>
      <h1 className='text-xl md:text-2xl text-white mb-2 md:mb-4'>
        Dashboard
      </h1>
      
      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6'>
        {/* Total Creation Card */}
        <div className='flex justify-between items-center p-3 md:p-4 px-4 md:px-6 bg-zinc-900 rounded-lg md:rounded-xl'>
          <div className='text-white'>
            <p className='text-xs md:text-sm'>
              Total Creations
            </p>
            <h2 className='text-lg md:text-xl font-semibold'>
              {creations.length + pdfChats.length}
            </h2>
          </div>
          <div className='w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center'>
            <Sparkles className='w-4 md:w-5 text-white'/>
          </div>
        </div>

        {/* AI Chats Card */}
        <div className='flex justify-between items-center p-3 md:p-4 px-4 md:px-6 bg-zinc-900 rounded-lg md:rounded-xl'>
          <div className='text-white'>
            <p className='text-xs md:text-sm'>PDF Chats</p>
            <h2 className='text-lg md:text-xl font-semibold'>
              {pdfChats.length}
            </h2>
          </div>
          <div className='w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-[#00DA83] to-[#009BB3] text-white flex justify-center items-center'>
            <FileText className='w-4 md:w-5 text-white' />
          </div>
        </div>

        {/* Active Plan Card */}
        <div className='flex justify-between items-center p-3 md:p-4 px-4 md:px-6 bg-zinc-900 rounded-lg md:rounded-xl'>
          <div className='text-white'>
            <p className='text-xs md:text-sm'>Active Plan</p>
            <h2 className='text-lg md:text-xl font-semibold'>
              <Protect plan='premium' fallback="Free">Premium</Protect>
            </h2>
          </div>
          <div className='w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center'>
            <Gem className='w-4 md:w-5 text-white' />
          </div>
        </div>
      </div>

      {/* Recent Creations Section */}
      <div className='space-y-3 mb-6 md:mb-8'>
        <p className='text-white text-base md:text-lg font-medium'>Recent Creations</p>
        {loading ? (
          <div className="flex justify-center py-6 md:py-8">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <>
            {creations.map((item) => (
              <CreationItem key={item.id} item={item} />
            ))}
          </>
        )}
      </div>

      {/* PDF Chats Section */}
      <div className='space-y-3'>
        <p className='text-white text-base md:text-lg font-medium'>Recent PDF Chats</p>
        {loading ? (
          <div className="flex justify-center py-6 md:py-8">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-t-transparent animate-spin"></div>
          </div>
        ) : pdfChats.length > 0 ? (
          pdfChats.map((chat, index) => (
            <div 
              key={index} 
              className="p-3 md:p-4 bg-zinc-900 rounded-lg md:rounded-xl text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 md:gap-3">
                <div className="overflow-hidden">
                  <h3 className="font-medium text-sm md:text-base truncate">{chat.fileName}</h3>
                  <p className="text-xs md:text-sm text-gray-400 truncate">
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-3 md:p-4 bg-zinc-900 rounded-lg md:rounded-xl text-gray-400 text-center text-sm md:text-base">
            No PDF chats found
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;