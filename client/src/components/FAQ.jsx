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
    answer:
      "Our platform uses advanced APIs like Google's Gemini and ClickDrop to offer content generation, image editing, PDF analysis, and text enhancement across both free and premium plans."
  },
  {
    question: "How accurate are the AI-generated results?",
    answer:
      "While our platform uses powerful AI models (Gemini and ClickDrop), outputs may not always be 100% accurate. We recommend reviewing all AI-generated content before using it in professional or important settings."
  },
  {
    question: "Do I need technical skills to use these tools?",
    answer:
      "Not at all! Our tools are designed with intuitive, user-friendly interfaces suitable for everyone, regardless of technical background."
  },
  {
    question: "How does the pricing work?",
    answer:
      `Free Tier (30 credits/month):
      - AI Content Generator
      - Title Suggestor
      - Text Humanizer
      - Resume Review
      - Calculate ATS Score

      Premium Plan:
      - Image Generator (via ClickDrop)
      - Remove Image Background
      - Remove Object from Image
      - ChatWithPDF (via Gemini)
      - Unlimited credits
      - Priority processing`
  },
  {
    question: "Is my data secure with your platform?",
    answer:
      "We implement strong security measures including encryption. However, some processing happens through third-party APIs like Gemini and ClickDrop, which follow their own security practices."
  },
  {
    question: "What happens if I use all my free credits?",
    answer:
      "Free users receive 30 credits each month. Once these are used up, you can either wait until the next month for renewal or upgrade to the premium plan for unlimited access."
  },
  {
    question: "Which third-party services do you integrate with?",
    answer:
      "Currently, we integrate with Google's Gemini API for text-based features and ClickDrop for image-related functionality. We plan to expand our integrations in the future."
  }
];

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