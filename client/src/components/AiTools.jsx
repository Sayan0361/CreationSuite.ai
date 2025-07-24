import React, { useEffect, useRef } from 'react'
import { AiToolsData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'

const AiTools = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  
  // Refs for GSAP animations
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const toolsGridRef = useRef(null)
  const toolCardsRef = useRef([])
  const backgroundRef = useRef(null)
  
  useEffect(() => {
    // Import GSAP from CDN
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
    script.onload = () => {
      const { gsap } = window
      
      // Create ScrollTrigger for viewport animations
      const scrollScript = document.createElement('script')
      scrollScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js'
      scrollScript.onload = () => {
        gsap.registerPlugin(window.ScrollTrigger)
        
        // Set initial states
        gsap.set([titleRef.current, subtitleRef.current], {
          opacity: 0,
          y: 50,
          scale: 0.9
        })
        
        gsap.set(toolCardsRef.current, {
          opacity: 0,
          y: 80,
          scale: 0.8,
          rotation: -5
        })
        
        // Main entrance timeline with ScrollTrigger
        const mainTL = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        })
        
        // Animate title with text reveal effect
        mainTL.to(titleRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "back.out(1.7)",
          onComplete: () => {
            // Add continuous floating animation
            gsap.to(titleRef.current, {
              y: -5,
              duration: 3,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1
            })
          }
        })
        
        // Animate subtitle
        .to(subtitleRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out"
        }, "-=0.6")
        
        // Animate tool cards with advanced stagger
        .to(toolCardsRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: 1,
          ease: "back.out(1.4)",
          stagger: {
            amount: 1.2,
            grid: "auto",
            from: "random"
          }
        }, "-=0.4")
        
        // Enhanced card interactions
        toolCardsRef.current.forEach((card, index) => {
          if (card) {
            // Magnetic hover effect
            card.addEventListener('mouseenter', (e) => {
              gsap.to(card, {
                y: -15,
                scale: 1.05,
                rotation: Math.random() * 4 - 2,
                duration: 0.4,
                ease: "back.out(1.7)"
              })
              
              // Icon animation
              const icon = card.querySelector('.tool-icon')
              if (icon) {
                gsap.to(icon, {
                  scale: 1.2,
                  rotation: 360,
                  duration: 0.6,
                  ease: "back.out(1.7)"
                })
              }
              
              // Enhanced shadow
              gsap.to(card, {
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                duration: 0.4,
                ease: "power2.out"
              })
              
              // Background glow effect
              const bgGlow = card.querySelector('.card-glow')
              if (bgGlow) {
                gsap.to(bgGlow, {
                  opacity: 0.1,
                  scale: 1.1,
                  duration: 0.4,
                  ease: "power2.out"
                })
              }
            })
            
            card.addEventListener('mouseleave', () => {
              gsap.to(card, {
                y: 0,
                scale: 1,
                rotation: 0,
                duration: 0.4,
                ease: "power2.out"
              })
              
              const icon = card.querySelector('.tool-icon')
              if (icon) {
                gsap.to(icon, {
                  scale: 1,
                  rotation: 0,
                  duration: 0.4,
                  ease: "power2.out"
                })
              }
              
              gsap.to(card, {
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
                duration: 0.4,
                ease: "power2.out"
              })
              
              const bgGlow = card.querySelector('.card-glow')
              if (bgGlow) {
                gsap.to(bgGlow, {
                  opacity: 0,
                  scale: 1,
                  duration: 0.4,
                  ease: "power2.out"
                })
              }
            })
            
            // Click animation
            card.addEventListener('mousedown', () => {
              gsap.to(card, {
                scale: 0.95,
                duration: 0.1,
                ease: "power2.out"
              })
            })
            
            card.addEventListener('mouseup', () => {
              gsap.to(card, {
                scale: 1.05,
                duration: 0.2,
                ease: "back.out(2)"
              })
            })
            
            // Continuous subtle animations
            gsap.to(card, {
              y: Math.sin(index) * 3,
              duration: 3 + (index * 0.5),
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              delay: index * 0.2
            })
            
            // Icon breathing animation
            const icon = card.querySelector('.tool-icon')
            if (icon) {
              gsap.to(icon, {
                scale: 1.05,
                duration: 2 + (index * 0.3),
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
                delay: index * 0.1
              })
            }
          }
        })
        
        // Parallax effect on scroll
        gsap.to(toolCardsRef.current, {
          y: -50,
          scrollTrigger: {
            trigger: toolsGridRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        })
      }
      
      document.head.appendChild(scrollScript)
    }
    
    document.head.appendChild(script)
    
    return () => {
      // Cleanup
      const scripts = document.querySelectorAll('script[src*="gsap"]')
      scripts.forEach(script => {
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
      })
    }
  }, [])

  return (
    <div ref={containerRef} className='px-4 sm:px-20 xl:px-32 relative overflow-hidden bg-zinc-950'>
      {/* Background decorative elements */}
      <div ref={backgroundRef} className='absolute inset-0 pointer-events-none overflow-hidden mt-10'>
        <div className='absolute top-10 left-10 w-32 h-32 rounded-full bg-blue-400/10 blur-3xl animate-pulse'></div>
        <div className='absolute top-20 right-20 w-40 h-40 rounded-full bg-purple-400/10 blur-3xl animate-pulse delay-1000'></div>
        <div className='absolute bottom-20 left-1/3 w-28 h-28 rounded-full bg-pink-400/10 blur-2xl animate-pulse delay-2000'></div>
      </div>
      
      <div className='text-center relative z-10'>
        <h2 ref={titleRef} className='text-white text-[42px] font-semibold'>
          AI-Powered Creation Suite
        </h2>
        <p ref={subtitleRef} className='text-gray-400 max-w-lg mx-auto'>
          Your complete AI-powered content creation toolkit - from ideation to optimization
        </p>
      </div>

      <div ref={toolsGridRef} className='flex flex-wrap mt-10 justify-center relative z-10'>
        {AiToolsData.map((tool, index) => (
          <div 
            key={index} 
            ref={el => toolCardsRef.current[index] = el}
            className='p-8 m-4 max-w-xs rounded-lg bg-zinc-900 shadow-lg border border-zinc-800 cursor-pointer relative overflow-hidden group'
            onClick={() => user && navigate(tool.path)}
          >
            {/* Background glow effect */}
            <div className='card-glow absolute inset-0 bg-gradient-to-br from-blue-400/0 to-purple-400/0 rounded-lg opacity-0 transition-all duration-300'></div>
            
            {/* Card content */}
            <div className='relative z-10'>
              <tool.Icon 
                className='tool-icon w-12 h-12 p-3 text-white rounded-xl transition-all duration-300' 
                style={{
                  background: `linear-gradient(to bottom, ${tool.bg.from}, ${tool.bg.to})`
                }}
              />
              <h3 className='mt-6 mb-3 text-lg font-semibold text-white group-hover:text-blue-400 transition-colors duration-300'>
                {tool.title}
              </h3>
              <p className='text-gray-400 text-sm max-w-[95%] group-hover:text-gray-300 transition-colors duration-300'>
                {tool.description}
              </p>
            </div>
            
            {/* Hover border effect */}
            <div className='absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300'></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AiTools