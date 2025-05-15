import { useRef, useEffect, useState } from 'react';
import fabVideo from '../assets/fab_video.mp4';
import './Hero.css';
import { GlassButton } from './ui/GlassButton';
import xIcon from '../assets/icons/x.svg';
import tgIcon from '../assets/icons/tg.svg';
import { Announcement } from './Announcement';

export const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [elementsVisible, setElementsVisible] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      // Set autoplay attribute
      videoElement.autoplay = true;
      // Play the video
      videoElement.play().catch(err => {
        console.error("Error playing video:", err);
        // If video can't play, show the content anyway
        setVideoEnded(true);
      });
    }
    
    // Detect if it's a mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // After video ends, show elements and add animation
  useEffect(() => {
    if (videoEnded) {
      // Delay showing elements slightly to ensure animation works
      const timer = setTimeout(() => {
        setElementsVisible(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [videoEnded]);

  // After animation ends, remove animation class to ensure blur effect
  useEffect(() => {
    if (!elementsVisible) return;
    const items = document.querySelectorAll('.hero-social-item');
    items.forEach(item => {
      const animDiv = item as HTMLElement;
      const handleAnimEnd = () => {
        animDiv.classList.remove('animate-scale-in');
      };
      animDiv.addEventListener('animationend', handleAnimEnd, { once: true });
    });
  }, [elementsVisible]);

  return (
    <div className="hero-container">
      <video
        ref={videoRef}
        className="hero-video"
        playsInline
        muted
        onEnded={() => {
          // On video end, ensure it stays on the last frame
          if (videoRef.current) {
            videoRef.current.currentTime = videoRef.current.duration;
          }
          setVideoEnded(true);
        }}
      >
        <source src={fabVideo} type="video/mp4" />
        Your browser does not support video playback.
      </video>

      {videoEnded && (
        <>
          <div className={`announcement-wrapper ${elementsVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <Announcement />
          </div>
          
          <div className="container mx-auto">
            <div className="hero-content">
              <div className="hero-header">
                {isMobile ? (
                  <div className="hero-title-container">
                    <h1 className={`hero-bold-title ${elementsVisible ? 'animate-slide-left' : 'opacity-0'}`}>Words Create</h1>
                    <p className={`hero-title ${elementsVisible ? 'animate-slide-left delay-200' : 'opacity-0'}`}>Worlds</p>
                  </div>
                ) : (
                  <div className="hero-title-container">
                    <h1 className={`hero-bold-title ${elementsVisible ? 'animate-slide-left' : 'opacity-0'}`}>Words Create</h1>
                    <p className={`hero-title ${elementsVisible ? 'animate-slide-left delay-200' : 'opacity-0'}`}>Worlds</p>
                  </div>
                )}
                <p className={`hero-subtitle ${elementsVisible ? 'animate-fade-in delay-400' : 'opacity-0'}`}>The Publishing Renaissance Starts Here</p>
              </div>
              
              <div className="hero-footer">
                <div className="hero-social">
                  <div className={`hero-social-item ${elementsVisible ? 'animate-scale-in delay-600' : 'opacity-0'}`}>
                    <GlassButton 
                      icon={xIcon} 
                      href="https://X.Com/Fableration" 
                      target="_blank"
                      size={isMobile ? "sm" : "md"}
                    />
                  </div>
                  
                  <div className={`hero-social-item ${elementsVisible ? 'animate-scale-in delay-700' : 'opacity-0'}`}>
                    <GlassButton 
                      icon={tgIcon} 
                      href="https://T.Me/Fablerationmain" 
                      target="_blank"
                      size={isMobile ? "sm" : "md"}
                    />
                  </div>
                </div>
                <p className={`hero-community-text ${elementsVisible ? 'animate-fade-in delay-800' : 'opacity-0'}`}>Join A Like Minded Community</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 