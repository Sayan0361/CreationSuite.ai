import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import WriteArticle from './pages/WriteArticle';
import BlogTitles from './pages/BlogTitles';
import GenerateImages from './pages/GenerateImages';
import RemoveBackground from './pages/RemoveBackground';
import RemoveObject from './pages/RemoveObject';
import ReviewResume from './pages/ReviewResume';
import Community from './pages/Community';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import CalculateATSScore from './pages/CalculateATSScore';
import HumanizeText from './pages/HumanizeText';
import ChatWithPDF from './pages/ChatWithPDF';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); 

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-950 z-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-[#4f6cff] rounded-full animate-spin"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Toaster />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/ai' element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path='write-article' element={<WriteArticle />} />
          <Route path='blog-titles' element={<BlogTitles />} />
          <Route path='humanize-text' element={<HumanizeText />} />
          <Route path='generate-images' element={<GenerateImages />} />
          <Route path='remove-background' element={<RemoveBackground />} />
          <Route path='remove-object' element={<RemoveObject />} />
          <Route path='review-resume' element={<ReviewResume />} />
          <Route path='calculate-ats-score' element={<CalculateATSScore />} />
          <Route path='chat-with-pdf' element={<ChatWithPDF />} />
          <Route path='community' element={<Community />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;