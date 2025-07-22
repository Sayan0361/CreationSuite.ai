import React, { useEffect, useRef } from 'react'
import { PricingTable } from '@clerk/clerk-react'

const Plan = () => {
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const pricingTableRef = useRef(null)
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
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                duration: 0.4,
                ease: "power2.out"
              })
              
              // Highlight recommended plan
              if (card.classList.contains('cl-pricing-plan--highlight')) {
                gsap.to(card, {
                  boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.25)',
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
                  boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.15)',
                  duration: 0.4
                })
              } else {
                gsap.to(card, {
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
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
  }, [])

  return (
    <div ref={containerRef} className='max-w-6xl mx-auto z-20 py-24 px-4 sm:px-8 relative overflow-hidden'>
      {/* Background decorative elements */}
      <div ref={backgroundRef} className='absolute inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute top-10 left-10 w-32 h-32 rounded-full bg-blue-400/5 blur-3xl animate-pulse'></div>
        <div className='absolute top-20 right-20 w-40 h-40 rounded-full bg-purple-400/5 blur-3xl animate-pulse delay-1000'></div>
        <div className='absolute bottom-20 left-1/3 w-28 h-28 rounded-full bg-indigo-400/5 blur-2xl animate-pulse delay-2000'></div>
      </div>
      
      <div className='text-center relative z-10'>
        <h2 ref={titleRef} className='text-slate-700 text-[42px] font-semibold opacity-0'>
          Choose Your Plan
        </h2>
        <p ref={subtitleRef} className='text-gray-500 max-w-lg mx-auto opacity-0'>
          Start for free and scale up as you grow. Find the perfect plan for your content creation needs.
        </p>
      </div>

      <div ref={pricingTableRef} className='mt-14 relative z-10'>
        {/* Custom container for better card arrangement */}
        <div className='flex flex-col items-center justify-center gap-6 lg:flex-row lg:items-stretch lg:justify-center lg:gap-8'>
          <PricingTable />
        </div>
        
        {/* Additional call-to-action */}
        <div className='mt-12 text-center opacity-0' id='cta-section'>
          <p className='text-gray-500 mb-6'>Need help choosing? <a href='#' className='text-primary hover:underline'>Compare all plans</a></p>
          <button className='bg-primary text-white px-8 py-3 rounded-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-primary/30 font-medium'>
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  )
}

export default Plan