import React from 'react';
import { socialImgs } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <footer className={`px-6 md:px-16 lg:px-24 xl:px-32 pt-12 pb-8 w-full ${
      theme === 'dark' 
        ? 'bg-zinc-950 border-t border-gray-800' 
        : 'bg-white border-t border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Brand Info */}
        <div className="max-w-lg mx-auto text-center">
          <div 
            onClick={() => navigate('/')}
            className="cursor-pointer hover:opacity-90 transition-opacity w-fit mx-auto"
          >
            <h1 className={`text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent ${
              theme === 'dark' ? '' : 'from-blue-700 to-purple-600'
            }`}>
              Creation<span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Suite</span>
              <span className={`text-xs align-top ml-1 px-2 py-1 rounded-full ${
                theme === 'dark' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-blue-600 text-white'
              }`}>.ai</span>
            </h1>
          </div>
          <p className={`mt-4 leading-relaxed ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Supercharge your creativity with our AI-powered toolkit. Generate content, enhance images, and streamline your workflow.
          </p>
          
          {/* Social Links */}
          <div className="mt-6 flex gap-5 justify-center">
            {socialImgs.map((social) => {
              const Icon = social.Icon;
              return (
                <a
                  key={social.url}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-colors duration-200 ${
                    theme === 'dark' 
                      ? 'text-gray-400 hover:text-indigo-400' 
                      : 'text-gray-500 hover:text-indigo-600'
                  }`}
                  aria-label={social.name}
                >
                  <Icon className="w-6 h-6" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className={`border-t my-8 ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        }`}></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            &copy; {new Date().getFullYear()} CreationSuite.ai. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className={`text-sm transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-indigo-400' 
                  : 'text-gray-500 hover:text-indigo-600'
              }`}
            >
              Terms
            </a>
            <a
              href="#"
              className={`text-sm transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-indigo-400' 
                  : 'text-gray-500 hover:text-indigo-600'
              }`}
            >
              Privacy
            </a>
          </div>
        </div>

        {/* Made with love */}
        <div className="text-center mt-8">
          <p className={`text-xs ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            Crafted with <span className="text-red-500">💙</span> by Sayan Sen
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;