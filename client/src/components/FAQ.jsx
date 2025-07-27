import React, { useRef, useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'


const FAQ = () => {
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const backgroundRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(null)


  const faqs = [
    {
      question: "What types of content can I create with these tools?",
      answer: "Our platform leverages Gemini and ClickDrop APIs to provide content generation, image editing, PDF analysis, and text optimization across both free and premium plans."
    },
    {
      question: "How accurate are the AI-generated results?",
      answer: "While we use advanced AI models (Gemini and ClickDrop), outputs may not be 100% accurate. We recommend reviewing all AI-generated content before use, especially for professional or important applications."
    },
    {
      question: "Do I need technical skills to use these tools?",
      answer: "No technical skills required! Our tools are designed with simple, intuitive interfaces for all users."
    },
    {
      question: "How does the pricing work?",
      answer: (
        <div>
          <p className="mb-2"><strong>Free Tier (10 credits/month):</strong></p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>AI Content Generator</li>
            <li>Title Suggestor</li>
            <li>Text Humanizer</li>
            <li>Basic AI Assistant</li>
          </ul>
          <p className="mb-2"><strong>Premium Plan:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Image Generator (via ClickDrop API)</li>
            <li>Remove Image Background</li>
            <li>Remove Object from Image</li>
            <li>Review Resume</li>
            <li>Calculate ATS Score</li>
            <li>ChatWithPDF (via Gemini API)</li>
            <li>Unlimited credits</li>
            <li>Priority processing</li>
          </ul>
        </div>
      )
    },
    {
      question: "Is my data secure with your platform?",
      answer: "We implement strong security measures including encryption, though please note some processing occurs through third-party APIs (Gemini and ClickDrop) that have their own security policies."
    },
    {
      question: "What happens if I use all my free credits?",
      answer: "Free users receive 10 credits monthly. When exhausted, you can upgrade to premium for unlimited access or wait for your credits to reset the following month."
    },
    {
      question: "Which third-party services do you integrate with?",
      answer: "Our platform currently integrates with Google's Gemini API for text-based features and ClickDrop API for image-related functionalities. We may add more integrations in the future."
    }
  ]
  useEffect(() => {
    // GSAP animation setup
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
    script.onload = () => {
      const { gsap } = window
      
      const scrollScript = document.createElement('script')
      scrollScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js'
      scrollScript.onload = () => {
        gsap.registerPlugin(window.ScrollTrigger)
        
        gsap.set([titleRef.current, subtitleRef.current], {
          opacity: 0,
          y: 30
        })
        
        const mainTL = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        })
        
        mainTL.to(titleRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out"
        })
        .to(subtitleRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out"
        }, "-=0.4")
      }
      document.head.appendChild(scrollScript)
    }
    document.head.appendChild(script)
    
    return () => {
      const scripts = document.querySelectorAll('script[src*="gsap"]')
      scripts.forEach(script => document.head.removeChild(script))
    }
  }, [])

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <div ref={containerRef} className='px-4 sm:px-20 xl:px-32 relative overflow-hidden bg-zinc-950 py-16'>
      <div ref={backgroundRef} className='absolute inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/5 to-indigo-500/5 blur-3xl'></div>
        <div className='absolute bottom-32 right-16 w-80 h-80 rounded-full bg-gradient-to-r from-pink-500/5 to-rose-500/5 blur-3xl'></div>
      </div>
      
      <div className='text-center relative z-10 mb-16'>
        <h2 ref={titleRef} className='text-white text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text'>
          Frequently Asked Questions
        </h2>
        <p ref={subtitleRef} className='text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed'>
          Find answers to common questions about our AI tools and services
        </p>
      </div>

      <div className='max-w-4xl mx-auto relative z-10 space-y-4'>
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className='group rounded-xl bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 overflow-hidden transition-all duration-300'
          >
            <button
              className='w-full flex justify-between items-center p-6 text-left'
              onClick={() => toggleFAQ(index)}
            >
              <h3 className='text-lg font-medium text-white group-hover:text-purple-300 transition-colors duration-300'>
                {faq.question}
              </h3>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : ''}`} />
            </button>
            
            <div 
            className={`px-6 pb-6 pt-0 text-gray-400 transition-all duration-300 overflow-hidden ${activeIndex === index ? 'max-h-96' : 'max-h-0'}`}
            style={{ display: activeIndex === index ? 'block' : 'none' }}
            >
                {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FAQ