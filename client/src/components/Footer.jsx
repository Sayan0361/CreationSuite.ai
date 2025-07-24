import React from 'react'
import { assets } from '../assets/assets'
import { socialImgs } from '../assets/assets'

const Footer = () => {
  return (
    <footer className="px-6 md:px-16 lg:px-24 xl:px-32 pt-8 w-full text-gray-400 bg-zinc-950 border-t border-gray-800">
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-800 pb-6">
        <div className="md:max-w-96">
          <img className="h-9" src={assets.logo} alt="logo"/>
          <p className="mt-6 text-sm text-gray-400">
            Experience the power of AI with QuickAi. <br />Transform your content creation with our suite of premium AI tools. Write articles, generate images, and enhance your workflow.
          </p>
          {/* Social media links */}
          <div className="socials mt-6 flex gap-4">
            {socialImgs.map((social) => {
              const Icon = social.Icon;
              return (
                <a
                  key={social.url}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-400 transition-colors duration-200"
                  aria-label={social.name}
                >
                  <Icon className="w-6 h-6" />
                </a>
              );
            })}
          </div>
        </div>
        <div className="flex-1 flex items-start md:justify-end gap-20">
          <div>
            <h2 className="font-semibold mb-5 text-gray-300">Company</h2>
            <ul className="text-sm space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-indigo-400">Home</a></li>
              <li><a href="#" className="hover:text-indigo-400">About us</a></li>
              <li><a href="#" className="hover:text-indigo-400">Contact us</a></li>
              <li><a href="#" className="hover:text-indigo-400">Privacy policy</a></li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold text-gray-300 mb-5">Subscribe to our newsletter</h2>
            <div className="text-sm space-y-2 text-gray-400">
              <p>The latest news, articles, and resources, sent to your inbox weekly.</p>
              <div className="flex items-center gap-2 pt-4">
                <input 
                  className="border border-gray-700 bg-zinc-900 placeholder-gray-500 focus:ring-2 ring-indigo-500 outline-none w-full max-w-64 h-9 rounded px-2 text-gray-300" 
                  type="email" 
                  placeholder="Enter your email" 
                />
                <button className="bg-indigo-600 w-24 h-9 text-white rounded cursor-pointer hover:bg-indigo-700 transition-colors">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center py-4 text-gray-500">
        <p className="text-sm mb-2">
          Made with 💙 by Sayan Sen
        </p>
        <p className="text-xs md:text-sm">
          &copy; {new Date().getFullYear()} QuickAi. All Rights Reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer