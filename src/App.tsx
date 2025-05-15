"use client"

import './App.css'
import { Navbar } from './components/ui/Navbar'
import { Hero } from './components/Hero'
import { Creative } from './components/Creative'
import { OurCommunity } from './components/OurCommunity'
import { Features } from './components/Features'
import { Community } from './components/Community'
import { useRef, useEffect, useState } from 'react'
import { Event } from './components/Event'
import Footer from './components/Footer'

function App() {
  const heroRef = useRef<HTMLDivElement>(null)
  const creativeRef = useRef<HTMLDivElement>(null)
  const ourcommunityRef = useRef<HTMLDivElement>(null)
  const communityRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const eventRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState<'hero' | 'creative' | 'ourcommunity' | 'community' | 'features' | 'event'>('hero')
  
  // Use refs instead of state to avoid re-renders
  const isAutoScrollingRef = useRef(false)
  const lastScrollPositionRef = useRef(0)
  const scrollDirectionRef = useRef<'up' | 'down'>('down')
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Detect scroll direction and debounce scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (isAutoScrollingRef.current) return

      const currentScrollPosition = window.scrollY
      
      // Determine scroll direction
      if (currentScrollPosition > lastScrollPositionRef.current) {
        scrollDirectionRef.current = 'down'
      } else if (currentScrollPosition < lastScrollPositionRef.current) {
        scrollDirectionRef.current = 'up'
      }
      
      // Update last scroll position
      lastScrollPositionRef.current = currentScrollPosition
      
      // Debounce: only trigger after user stops scrolling for 100ms
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = setTimeout(() => {
        if (!heroRef.current || !creativeRef.current || !ourcommunityRef.current || !communityRef.current || !featuresRef.current || !eventRef.current) return
        
        const creativeRect = creativeRef.current.getBoundingClientRect()
        const ourcommunityRect = ourcommunityRef.current.getBoundingClientRect()
        const communityRect = communityRef.current.getBoundingClientRect()
        const featuresRect = featuresRef.current.getBoundingClientRect()
        const eventRect = eventRef.current.getBoundingClientRect()
        const threshold = window.innerHeight * 0.3
        
        let nextSection: 'hero' | 'creative' | 'ourcommunity' | 'community' | 'features' | 'event' = 'hero'
        
        // Determine the most visible section (checking from bottom to top)
        if (eventRect.top <= window.innerHeight - threshold) {
          nextSection = 'event'
        } else if (communityRect.top <= window.innerHeight - threshold) {
          nextSection = 'community'
        } 
        else if (featuresRect.top <= window.innerHeight - threshold) {
          nextSection = 'features'
        }
        else if (ourcommunityRect.top <= window.innerHeight - threshold) {
          nextSection = 'ourcommunity'
        } else if (creativeRect.top <= window.innerHeight - threshold) {
          nextSection = 'creative'
        }
        
        if (nextSection !== activeSection) {
          setActiveSection(nextSection)
        }
      }, 100)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeSection])
  
  // Handle auto-scrolling when active section changes
  useEffect(() => {
    // Only scroll if not already at the correct section
    let targetRef: HTMLDivElement | null = null
    if (activeSection === 'creative') targetRef = creativeRef.current
    else if (activeSection === 'ourcommunity') targetRef = ourcommunityRef.current
    else if (activeSection === 'features') targetRef = featuresRef.current
    else if (activeSection === 'community') targetRef = communityRef.current
    else if (activeSection === 'event') targetRef = eventRef.current
    else targetRef = heroRef.current
    if (targetRef) {
      isAutoScrollingRef.current = true
      targetRef.scrollIntoView({
        behavior: 'smooth',
        block: scrollDirectionRef.current === 'down' ? 'start' : 'end'
      })
      const scrollDuration = 1000 // Typical duration for smooth scrolling
      setTimeout(() => {
        isAutoScrollingRef.current = false
      }, scrollDuration)
    }
  }, [activeSection])
  
  return (
    <div className="app-container">
      <Navbar />
      <section className="hero-section-container" ref={heroRef}>
        <Hero />
      </section>
      <section className="creative-section-container" ref={creativeRef}>
        <Creative isSectionVisible={activeSection === 'creative'} />
      </section>
      <section className="ourcommunity-section-container" ref={ourcommunityRef}>
        <OurCommunity isSectionVisible={activeSection === 'ourcommunity'} />
      </section>
      <section className="features-section-container" ref={featuresRef}>
        <Features />
      </section>
      <section className="community-section-container" ref={communityRef}>
        <Community isSectionVisible={activeSection === 'community'} />
      </section>
      <section className="event-section-container" ref={eventRef}>
        <Event />
      </section>
      <Footer />
    </div>
  )
}

export default App
