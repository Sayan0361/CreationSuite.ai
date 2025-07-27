import React, { useRef, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { steps } from '../assets/assets'

const HowItWorks = () => {
  const { user } = useUser()
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const stepsRef = useRef([])
  const backgroundRef = useRef(null)

  useEffect(() => {
    // GSAP animation setup similar to AiTools
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
        
        gsap.set(stepsRef.current, {
          opacity: 0,
          y: 40
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
        .to(stepsRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: "power2.out"
        }, "-=0.2")
      }
      document.head.appendChild(scrollScript)
    }
    document.head.appendChild(script)
    
    return () => {
      const scripts = document.querySelectorAll('script[src*="gsap"]')
      scripts.forEach(script => document.head.removeChild(script))
    }
  }, [])

  return (
    <div ref={containerRef} className='px-4 sm:px-20 xl:px-32 relative overflow-hidden bg-zinc-950 py-16'>
      <div ref={backgroundRef} className='absolute inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-r from-green-500/5 to-teal-500/5 blur-3xl'></div>
        <div className='absolute top-32 right-16 w-80 h-80 rounded-full bg-gradient-to-r from-amber-500/5 to-orange-500/5 blur-3xl'></div>
      </div>
      
      <div className='text-center relative z-10 mb-16'>
        <h2 ref={titleRef} className='text-white text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-green-100 to-white bg-clip-text'>
          How It Works
        </h2>
        <p ref={subtitleRef} className='text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed'>
          Get started in just three simple steps to unlock your creative potential
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10'>
        {steps.map((step, index) => (
          <div 
            key={index}
            ref={el => stepsRef.current[index] = el}
            className='group relative p-8 rounded-2xl bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 transition-all duration-300 hover:border-green-400/30'
          >
            <div className='absolute inset-0 bg-gradient-to-br from-green-500/0 to-teal-500/0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300'></div>
            
            <div className='relative z-10'>
              <div className='w-16 h-16 mb-6 flex items-center justify-center text-2xl font-bold rounded-full bg-gradient-to-br from-green-500 to-teal-500 text-white'>
                {step.icon}
              </div>
              <h3 className='text-xl font-semibold text-white mb-3 group-hover:text-green-300 transition-colors duration-300'>
                {step.title}
              </h3>
              <p className='text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300'>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HowItWorks