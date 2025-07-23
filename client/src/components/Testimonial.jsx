import React, { useEffect, useRef } from 'react'
import { assets,dummyTestimonialData } from "../assets/assets"

const Testimonial = () => {
    const containerRef = useRef(null)
    const titleRef = useRef(null)
    const subtitleRef = useRef(null)
    const testimonialCardsRef = useRef([])
    const backgroundRef = useRef(null)

    const handleInstagramRedirect = (link) => {
        if (link) {
            // Open Instagram link in a new tab
            window.open(link, '_blank', 'noopener,noreferrer');
        }
    }

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
                
                gsap.set(testimonialCardsRef.current, {
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
                
                // Animate testimonial cards with advanced stagger
                .to(testimonialCardsRef.current, {
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
                testimonialCardsRef.current.forEach((card, index) => {
                    if (card) {
                        // Magnetic hover effect
                        card.addEventListener('mouseenter', () => {
                            gsap.to(card, {
                                y: -15,
                                scale: 1.05,
                                rotation: Math.random() * 4 - 2,
                                duration: 0.4,
                                ease: "back.out(1.7)"
                            })
                            
                            // Stars animation
                            const stars = card.querySelectorAll('.star-icon')
                            stars.forEach((star, i) => {
                                gsap.to(star, {
                                    scale: 1.2,
                                    y: -5,
                                    duration: 0.3,
                                    delay: i * 0.1,
                                    ease: "back.out(1.7)"
                                })
                            })
                            
                            // Enhanced shadow
                            gsap.to(card, {
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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
                            
                            // Avatar animation
                            const avatar = card.querySelector('.testimonial-avatar')
                            if (avatar) {
                                gsap.to(avatar, {
                                    scale: 1.1,
                                    duration: 0.4,
                                    ease: "back.out(1.7)"
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
                            
                            const stars = card.querySelectorAll('.star-icon')
                            stars.forEach(star => {
                                gsap.to(star, {
                                    scale: 1,
                                    y: 0,
                                    duration: 0.4,
                                    ease: "power2.out"
                                })
                            })
                            
                            gsap.to(card, {
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
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
                            
                            const avatar = card.querySelector('.testimonial-avatar')
                            if (avatar) {
                                gsap.to(avatar, {
                                    scale: 1,
                                    duration: 0.4,
                                    ease: "power2.out"
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
                        
                        // Stars twinkle effect
                        const stars = card.querySelectorAll('.star-icon')
                        stars.forEach((star, i) => {
                            gsap.to(star, {
                                opacity: 0.8,
                                duration: 2 + (i * 0.3),
                                ease: "sine.inOut",
                                yoyo: true,
                                repeat: -1,
                                delay: i * 0.1
                            })
                        })
                    }
                })
                
                // Parallax effect on scroll
                gsap.to(testimonialCardsRef.current, {
                    y: -50,
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
        <div ref={containerRef} className='px-4 sm:px-20 xl:px-32 py-24 relative overflow-hidden'>
            {/* Background decorative elements */}
            <div ref={backgroundRef} className='absolute inset-0 pointer-events-none overflow-hidden'>
                <div className='absolute top-10 left-10 w-32 h-32 rounded-full bg-yellow-400/5 blur-3xl animate-pulse'></div>
                <div className='absolute top-20 right-20 w-40 h-40 rounded-full bg-orange-400/5 blur-3xl animate-pulse delay-1000'></div>
                <div className='absolute bottom-20 left-1/3 w-28 h-28 rounded-full bg-red-400/5 blur-2xl animate-pulse delay-2000'></div>
            </div>
            
            <div className='text-center relative z-10'>
                <h2 ref={titleRef} className='text-slate-700 text-[42px] font-semibold opacity-0'>
                    Loved by Creators
                </h2>
                <p ref={subtitleRef} className='text-gray-500 max-w-lg mx-auto opacity-0'>
                    Don't just take our word for it. Here's what our users are saying.
                </p>
            </div>

            <div className='flex flex-wrap mt-10 justify-center relative z-10'>
                {dummyTestimonialData.map((testimonial, index) => (
                    <div 
                        key={index} 
                        ref={el => testimonialCardsRef.current[index] = el}
                        className='p-8 m-4 max-w-xs rounded-lg bg-[#FDFDFE] shadow-lg border border-gray-100 cursor-pointer relative overflow-hidden group opacity-0'
                    >
                        {/* Background glow effect */}
                        <div className='card-glow absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-orange-400/0 rounded-lg opacity-0 transition-all duration-300'></div>
                        
                        {/* Card content */}
                        <div className='relative z-10'>
                            <div className="flex items-center gap-1">
                                {Array(5).fill(0).map((_, i) => (
                                    <img 
                                        key={i} 
                                        src={i < testimonial.rating ? assets.star_icon : assets.star_dull_icon} 
                                        className='star-icon w-4 h-4 transition-all duration-300' 
                                        alt="star"
                                    />
                                ))}
                            </div>
                            <p className='text-gray-500 text-sm my-5 group-hover:text-gray-700 transition-colors duration-300'>
                                "{testimonial.content}"
                            </p>
                            <hr className='mb-5 border-gray-300 group-hover:border-gray-400 transition-colors duration-300' />
                            <div className='flex items-center gap-4'>
                                <img 
                                    src={testimonial.image} 
                                    className='testimonial-avatar w-12 object-contain rounded-full transition-all duration-300' 
                                    alt={testimonial.name} 
                                    onClick={() => handleInstagramRedirect(testimonial.link)}
                                />
                                <div className='text-sm text-gray-600'>
                                    <h3 onClick={() => handleInstagramRedirect(testimonial.link)} className='font-medium group-hover:text-blue-600 transition-colors duration-300'>
                                        {testimonial.name}
                                    </h3>
                                    <p className='text-xs text-gray-500 group-hover:text-gray-700 transition-colors duration-300'>
                                        {testimonial.title}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Hover border effect */}
                        <div className='absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-300'></div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Testimonial