import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const Hero = () => {
  const navigate = useNavigate()
  
  // Refs for GSAP animations
  const heroRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const buttonsRef = useRef(null)
  const trustBadgeRef = useRef(null)
  const bgElementsRef = useRef([])
  const containerRef = useRef(null)
  
  useEffect(() => {
    // Import GSAP from CDN
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
    script.onload = () => {
      const { gsap } = window
      
      // Set initial states
      gsap.set(containerRef.current, { opacity: 0 })
      gsap.set([titleRef.current, subtitleRef.current], {
        opacity: 0,
        y: 60,
        scale: 0.8
      })
      gsap.set(buttonsRef.current?.children || [], {
        opacity: 0,
        y: 40,
        scale: 0.9
      })
      gsap.set(trustBadgeRef.current, {
        opacity: 0,
        y: 30,
        scale: 0.8
      })
      
      // Animate background elements with dramatic entry
      gsap.fromTo(bgElementsRef.current, {
        scale: 0,
        rotation: -360,
        opacity: 0,
        filter: 'blur(20px)'
      }, {
        scale: 1,
        rotation: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 2.5,
        ease: "elastic.out(1, 0.8)",
        stagger: {
          amount: 1.5,
          from: "random"
        }
      })
      
      // Main entrance timeline
      const masterTL = gsap.timeline({ delay: 0.3 })
      
      // Container fade in
      masterTL.to(containerRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      })
      
      // Title animation with text reveal effect
      .to(titleRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.4,
        ease: "back.out(1.4)",
        onComplete: () => {
          // Add continuous floating animation to title
          gsap.to(titleRef.current, {
            y: -8,
            duration: 4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
          })
          
          // Add subtle rotation animation
          gsap.to(titleRef.current, {
            rotation: 1,
            duration: 6,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
          })
        }
      }, "-=0.3")
      
      // Subtitle with typewriter effect
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: "power3.out"
      }, "-=0.8")
      
      // Buttons with magnetic hover preparation
      .to(buttonsRef.current?.children || [], {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "back.out(2)",
        stagger: 0.15
      }, "-=0.6")
      
      // Trust badge with bounce
      .to(trustBadgeRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: "elastic.out(1.2, 0.8)"
      }, "-=0.4")
      
      // Enhanced button interactions
      const buttons = buttonsRef.current?.querySelectorAll('button') || []
      
      buttons.forEach((button, index) => {
        // Magnetic hover effect
        button.addEventListener('mouseenter', (e) => {
          gsap.to(button, {
            y: -12,
            scale: 1.08,
            rotation: index === 0 ? 2 : -2,
            duration: 0.4,
            ease: "back.out(1.7)"
          })
          
          // Add glow effect to primary button
          if (index === 0) {
            gsap.to(button, {
              boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)',
              duration: 0.4,
              ease: "power2.out"
            })
          }
        })
        
        button.addEventListener('mouseleave', () => {
          gsap.to(button, {
            y: 0,
            scale: 1,
            rotation: 0,
            duration: 0.4,
            ease: "power2.out"
          })
          
          if (index === 0) {
            gsap.to(button, {
              boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.39)',
              duration: 0.4,
              ease: "power2.out"
            })
          }
        })
        
        // Click animation
        button.addEventListener('mousedown', () => {
          gsap.to(button, {
            scale: 0.92,
            duration: 0.1,
            ease: "power2.out"
          })
        })
        
        button.addEventListener('mouseup', () => {
          gsap.to(button, {
            scale: 1.08,
            duration: 0.2,
            ease: "back.out(2)"
          })
        })
        
        // Continuous pulse animation for primary button
        if (index === 0) {
          gsap.to(button, {
            scale: 1.02,
            duration: 2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 2
          })
        }
      })
      
      // Background elements floating animation
      bgElementsRef.current.forEach((el, index) => {
        if (el) {
          // Individual floating patterns
          gsap.to(el, {
            y: (index % 2 === 0 ? -30 : 30) + (Math.random() * 20),
            x: (index % 3 === 0 ? -15 : 15) + (Math.random() * 10),
            rotation: index % 2 === 0 ? 360 : -360,
            duration: 8 + (index * 2),
            ease: "none",
            repeat: -1,
            delay: index * 0.5
          })
          
          // Scale breathing effect
          gsap.to(el, {
            scale: 1.1 + (Math.random() * 0.2),
            duration: 4 + (index * 0.5),
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: index * 0.3
          })
        }
      })
      
      // Advanced parallax mouse tracking
      const handleMouseMove = (e) => {
        const { clientX, clientY } = e
        const centerX = window.innerWidth / 2
        const centerY = window.innerHeight / 2
        const deltaX = (clientX - centerX) / centerX
        const deltaY = (clientY - centerY) / centerY
        
        // Title parallax
        gsap.to(titleRef.current, {
          x: deltaX * 15,
          y: deltaY * 10,
          duration: 1.5,
          ease: "power2.out"
        })
        
        // Background elements parallax with different depths
        bgElementsRef.current.forEach((el, index) => {
          if (el) {
            const depth = (index + 1) * 5
            gsap.to(el, {
              x: deltaX * depth,
              y: deltaY * depth,
              duration: 2 + (index * 0.2),
              ease: "power2.out"
            })
          }
        })
        
        // Buttons slight tilt
        gsap.to(buttonsRef.current, {
          rotationY: deltaX * 5,
          rotationX: -deltaY * 5,
          duration: 1,
          ease: "power2.out"
        })
      }
      
      // Trust badge hover animation
      if (trustBadgeRef.current) {
        trustBadgeRef.current.addEventListener('mouseenter', () => {
          gsap.to(trustBadgeRef.current, {
            scale: 1.05,
            y: -5,
            duration: 0.3,
            ease: "back.out(1.7)"
          })
        })
        
        trustBadgeRef.current.addEventListener('mouseleave', () => {
          gsap.to(trustBadgeRef.current, {
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out"
          })
        })
      }
      
      heroRef.current?.addEventListener('mousemove', handleMouseMove)
      
      // Cleanup function
      return () => {
        heroRef.current?.removeEventListener('mousemove', handleMouseMove)
      }
    }
    
    document.head.appendChild(script)
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  return (
    <div 
      ref={heroRef}
      className='px-4 sm:px-20 xl:px-32 relative inline-flex flex-col w-full justify-center bg-[url(/gradientBackground.png)] bg-cover bg-no-repeat min-h-screen overflow-hidden'
    >
      {/* Enhanced background decorative elements */}
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none'>
        <div 
          ref={el => bgElementsRef.current[0] = el}
          className='absolute top-20 left-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl'
        ></div>
        <div 
          ref={el => bgElementsRef.current[1] = el}
          className='absolute bottom-10 right-10 w-60 h-60 rounded-full bg-secondary/10 blur-3xl'
        ></div>
        <div 
          ref={el => bgElementsRef.current[2] = el}
          className='absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-primary/5 blur-2xl'
        ></div>
        <div 
          ref={el => bgElementsRef.current[3] = el}
          className='absolute top-1/4 left-1/3 w-28 h-28 rounded-full bg-primary/8 blur-xl'
        ></div>
        <div 
          ref={el => bgElementsRef.current[4] = el}
          className='absolute bottom-1/3 left-1/5 w-36 h-36 rounded-full bg-secondary/8 blur-2xl'
        ></div>
        <div 
          ref={el => bgElementsRef.current[5] = el}
          className='absolute top-10 right-1/3 w-24 h-24 rounded-full bg-primary/12 blur-xl'
        ></div>
      </div>

      <div ref={containerRef} className='w-full'>
        <div className='text-center mb-6 z-10 relative'>
          <h1 
            ref={titleRef}
            className='text-4xl sm:text-5xl md:text-6xl 2xl:text-7xl font-semibold mx-auto leading-[1.2]'
          >
            Powerful content creation <br/> powered by <span className='text-primary'>AI tools</span>
          </h1>
          
          <p 
            ref={subtitleRef}
            className='mt-6 max-w-xs sm:max-w-lg 2xl:max-w-xl m-auto text-gray-600 text-sm sm:text-base'
          >
          Multiply your creative output with AI that crafts text, generates visuals, and streamlines processes.
          </p>
        </div>

        <div 
          ref={buttonsRef}
          className='flex flex-wrap justify-center gap-4 text-sm max-sm:text-xs z-10 relative'
        >
          <button 
            onClick={() => navigate('/ai')} 
            className='bg-primary text-white px-8 py-3 rounded-lg cursor-pointer shadow-lg hover:shadow-primary/30 font-medium transition-shadow duration-300'
          >
            Start creating now
          </button>
          
          <button 
            className='bg-white px-8 py-3 rounded-lg border border-gray-200 cursor-pointer shadow-sm hover:shadow-gray-300/30 font-medium transition-shadow duration-300'
          >
            Watch demo
          </button>
        </div>

        <div 
          ref={trustBadgeRef}
          className='flex items-center gap-4 mt-12 mx-auto text-gray-600 bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full border border-gray-100 shadow-sm z-10 relative w-fit cursor-pointer'
        >
          <img src={assets.user_group} alt="" className='h-8'/> 
          <span className='text-sm font-medium'>Trusted by 10k+ creators</span>
        </div>
      </div>
    </div>
  )
}

export default Hero