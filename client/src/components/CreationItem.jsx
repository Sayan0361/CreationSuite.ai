import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { useTheme } from '../context/ThemeContext';

const CreationItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const { theme } = useTheme();

  return (
    <div 
      onClick={() => setExpanded(!expanded)} 
      className={`p-4 max-w-5xl text-sm rounded-lg cursor-pointer transition-colors ${
        theme === 'dark' 
          ? 'bg-zinc-900 hover:bg-zinc-800' 
          : 'bg-white hover:bg-gray-50 border border-gray-200'
      }`}
    >
      <div className='flex justify-between items-center gap-4'>
        <div>
          <h2 className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
            {item.prompt}
          </h2>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            {item.type} - {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
        <button 
          className={`px-4 py-1 rounded-full ${
            theme === 'dark'
              ? 'bg-zinc-800 border-zinc-700 text-blue-400'
              : 'bg-blue-50 border border-blue-100 text-blue-600'
          }`}
        >
          {item.type}
        </button>
      </div>
      {
        expanded && (
          <div>
            {item.type === 'image' ? (
              <div>
                <img 
                  src={item.content} 
                  alt="Generated content" 
                  className={`mt-3 w-full max-w-md rounded-lg ${
                    theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
                  } border`}
                />
              </div>
            ) : (
              <div className={`mt-3 h-full overflow-y-scroll text-sm ${
                theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
              }`}>
                <div className='reset-tw'>
                  <Markdown>{item.content}</Markdown>
                </div>
              </div>
            )}
          </div>
        )
      }
    </div>
  );
};

export default CreationItem;