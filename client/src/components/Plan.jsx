import React, { useEffect, useRef } from 'react'
import { PricingTable } from '@clerk/clerk-react'
import { useTheme } from '../context/ThemeContext'

const Plan = () => {
  const { theme } = useTheme()
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const pricingTableRef = useRef(null)
  const backgroundRef = useRef(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
    script.onload = () => {
      const { gsap } = window

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
        
        gsap.set(".cl-pricing-plan", {
          opacity: 0,
          y: 80,
          scale: 0.8
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
        
        // Animate pricing cards with advanced stagger
        .to(".cl-pricing-plan", {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "back.out(1.4)",
          stagger: {
            amount: 1,
            from: "center"
          }
        }, "-=0.4")
        
        // Enhanced card interactions
        document.querySelectorAll(".cl-pricing-plan").forEach((card, index) => {
          if (card) {
            // Magnetic hover effect
            card.addEventListener('mouseenter', () => {
              gsap.to(card, {
                y: -15,
                scale: 1.03,
                duration: 0.4,
                ease: "back.out(1.7)"
              })
              
              // Enhanced shadow
              gsap.to(card, {
                boxShadow: theme === 'dark' 
                  ? '0 25px 50px -12px rgba(255, 255, 255, 0.05)'
                  : '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                duration: 0.4,
                ease: "power2.out"
              })
              
              // Highlight recommended plan
              if (card.classList.contains('cl-pricing-plan--highlight')) {
                gsap.to(card, {
                  boxShadow: theme === 'dark'
                    ? '0 25px 50px -12px rgba(59, 130, 246, 0.25)'
                    : '0 25px 50px -12px rgba(59, 130, 246, 0.15)',
                  duration: 0.4
                })
              }
            })
            
            card.addEventListener('mouseleave', () => {
              gsap.to(card, {
                y: 0,
                scale: 1,
                duration: 0.4,
                ease: "power2.out"
              })
              
              if (card.classList.contains('cl-pricing-plan--highlight')) {
                gsap.to(card, {
                  boxShadow: theme === 'dark'
                    ? '0 25px 50px -12px rgba(59, 130, 246, 0.15)'
                    : '0 25px 50px -12px rgba(59, 130, 246, 0.1)',
                  duration: 0.4
                })
              } else {
                gsap.to(card, {
                  boxShadow: theme === 'dark'
                    ? '0 10px 15px -3px rgba(255, 255, 255, 0.02)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  duration: 0.4
                })
              }
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
          }
        })
        
        // Parallax effect on scroll
        gsap.to(".cl-pricing-plan", {
          y: -30,
          scrollTrigger: {
            trigger: containerRef.current,
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
  }, [theme]) 

  return (
    <div id="Plan"
      ref={containerRef} 
      className={`max-w-8xl mx-auto py-24 px-4 sm:px-8 relative overflow-hidden ${
        theme === 'dark' ? 'bg-zinc-950' : 'bg-white'
      }`}
    >
      {/* Background decorative elements */}
      <div ref={backgroundRef} className='absolute inset-0 pointer-events-none overflow-hidden'>
        <div className={`absolute top-10 left-10 w-32 h-32 rounded-full blur-3xl animate-pulse ${
          theme === 'dark' ? 'bg-blue-400/10' : 'bg-blue-200/30'
        }`}></div>
        <div className={`absolute top-20 right-20 w-40 h-40 rounded-full blur-3xl animate-pulse delay-1000 ${
          theme === 'dark' ? 'bg-purple-400/10' : 'bg-purple-200/30'
        }`}></div>
        <div className={`absolute bottom-20 left-1/3 w-28 h-28 rounded-full blur-2xl animate-pulse delay-2000 ${
          theme === 'dark' ? 'bg-indigo-400/10' : 'bg-indigo-200/30'
        }`}></div>
      </div>
      
      <div className='text-center relative z-10'>
        <h2 
          ref={titleRef} 
          className={`text-[42px] text-4xl font-bold opacity-0 ${
            theme === 'dark'
              ? 'text-white bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text'
              : 'text-zinc-900 bg-gradient-to-r from-zinc-900 via-blue-600 to-zinc-900 bg-clip-text'
          }`}
        >
          Choose Your Plan
        </h2>
        <p 
          ref={subtitleRef} 
          className={`max-w-lg mx-auto opacity-0 ${
            theme === 'dark' ? 'text-gray-300' : 'text-zinc-600'
          }`}
        >
          Start for free and scale up as you grow. Find the perfect plan for your content creation needs.
        </p>
      </div>

      <div ref={pricingTableRef} className='mt-14 relative z-10'>
        <div className='flex flex-col items-center justify-center gap-6 lg:flex-row lg:items-stretch lg:justify-center lg:gap-8'>
          <PricingTable
            appearance={{
              variables: theme === 'dark' ? {
                colorPrimary: "#3b82f6",
                colorText: "#ffffff",
                colorTextSecondary: "#d1d5db",
                colorBackground: "black",
                colorBackgroundSecondary: "#0f172a",
                borderColor: "#1e293b"
              } : {
                colorPrimary: "#3b82f6",
                colorText: "#111827",
                colorTextSecondary: "#4b5563",
                colorBackground: "#ffffff",
                colorBackgroundSecondary: "#f9fafb",
                borderColor: "#e5e7eb"
              }
            }}
          />

        </div>
      </div>
    </div>
  )
}

export default Plan