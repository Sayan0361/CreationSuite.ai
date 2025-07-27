import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import AiTools from '../components/AiTools'
import Testimonial from '../components/Testimonial'
import Plan from '../components/Plan'
import Footer from '../components/Footer'
import FAQ from '../components/Faq'
import HowItWorks from '../components/HowItWorks'

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>
      <main className="flex-grow">
        <Hero/>
        <AiTools/>
        <HowItWorks/>
        <Testimonial />
        <Plan/>
        <FAQ/>
      </main>
      <Footer/>
    </div>
  )
}

export default Home