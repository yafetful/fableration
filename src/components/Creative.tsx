import { useRef, useEffect, useState, useCallback } from 'react';
import './Creative.css';
import bgVideo from '../assets/bg_video.mp4';
import logo from '../assets/images/logo.svg';
import arrowDown from '../assets/icons/arrow_down_white.svg';
import '../styles/animations.css';

interface SlideContent {
  text?: string;
  logo?: boolean;
  logoWithText?: boolean;
}

export const Creative = ({ isSectionVisible }: { isSectionVisible: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const lastScrollTime = useRef<number>(0);
  const [sectionInViewport, setSectionInViewport] = useState(false);
  const [showArrow, setShowArrow] = useState(false);

  const slides: SlideContent[] = [
    {
      text: "Creators are undervalued, underpaid and under pressure."
    },
    {
      text: "Readers 'discover' what someone has paid to place in front of their nose."
    },
    {
      logo: true
    },
    {
      logoWithText: true,
      text: "the publishing industry\n FOREVER."
    }
  ];

  useEffect(() => {
    if (isSectionVisible && videoRef.current) {
      videoRef.current.play().catch(() => {
        setVideoLoaded(true);
      });
    }
  }, [isSectionVisible]);

  const handleSlideChange = useCallback((newSlideIndex: number) => {
    if (newSlideIndex !== currentSlide && !isAnimating) {
      setScrollDirection(newSlideIndex > currentSlide ? 'down' : 'up');
      setIsAnimating(true);
      setPrevSlide(currentSlide);
      setTimeout(() => {
        setIsAnimating(false);
        setPrevSlide(null);
      }, 650);
      setCurrentSlide(newSlideIndex);
    }
  }, [currentSlide, isAnimating]);

  useEffect(() => {
    if (!isSectionVisible) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const now = Date.now();
      if (now - lastScrollTime.current < 100) return;
      lastScrollTime.current = now;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // 检查组件是否在视口内
      const isInView = containerRect.bottom > 0 && 
                       containerRect.top < viewportHeight;
      
      // 如果组件即将完全离开视口（底部即将消失），则隐藏箭头
      const isAboutToLeave = containerRect.bottom < viewportHeight * 1.2;

      // 更新箭头显示状态
      setShowArrow(isInView && !isAboutToLeave);
      
      const topThreshold = viewportHeight * 0.3;
      const isTopInThreshold = containerRect.top <= topThreshold;
      setSectionInViewport(isTopInThreshold);
      
      if (!isTopInThreshold) return;
      const containerHeight = containerRef.current.clientHeight;
      const scrollProgress = 1 - (containerRect.top + containerHeight) / (viewportHeight + containerHeight);
      const startPoint = 0.25;
      const endPoint = 0.7;
      const effectiveScrollRange = endPoint - startPoint;
      const adjustedProgress = (scrollProgress - startPoint) / effectiveScrollRange;
      const segmentSize = 1 / slides.length;
      const slideThresholds = slides.map((_, index) => (index + 1) * segmentSize);
      let slideIndex = 0;
      if (adjustedProgress <= 0) {
        slideIndex = 0;
      } else if (adjustedProgress >= 1) {
        slideIndex = slides.length - 1;
      } else {
        const thresholdIndex = slideThresholds.findIndex(threshold => adjustedProgress < threshold);
        slideIndex = thresholdIndex !== -1 ? thresholdIndex : slides.length - 1;
      }
      handleSlideChange(slideIndex);
    };

    const debouncedHandleScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', debouncedHandleScroll);
    debouncedHandleScroll();
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
    };
  }, [isSectionVisible, handleSlideChange, slides.length]);

  const getAnimationClass = (isCurrentSlide: boolean) => {
    if (isCurrentSlide) {
      return scrollDirection === 'down' ? 'animate-slide-up' : 'animate-slide-down-reverse';
    } else {
      return scrollDirection === 'down' ? 'animate-slide-down' : 'animate-slide-up-reverse';
    }
  };

  const renderSlideContent = (slideIndex: number, isCurrentSlide: boolean) => {
    const slide = slides[slideIndex];
    const animationClass = getAnimationClass(isCurrentSlide);
    
    if (slide.logo) {
      return (
        <div className={`slide-text ${animationClass}`} key={`slide-${slideIndex}-${isCurrentSlide ? 'current' : 'prev'}`}>
          <img src={logo} alt="Fableration" className="slide-logo" />
        </div>
      );
    } else if (slide.logoWithText) {
      return (
        <div className={`slide-text ${animationClass}`} key={`slide-${slideIndex}-${isCurrentSlide ? 'current' : 'prev'}`}>
          <div className="logo-text-container">
            <img src={logo} alt="Fableration" className="slide-logo" />
            <span>will change</span>
          </div>
          {slide.text}
        </div>
      );
    } else {
      return (
        <div className={`slide-text ${animationClass}`} key={`slide-${slideIndex}-${isCurrentSlide ? 'current' : 'prev'}`}>
          {slide.text}
        </div>
      );
    }
  };

  return (
    <div ref={containerRef} className="creative-container">
        <div className="creative-content-wrapper" ref={contentRef}>
          <video
            ref={videoRef}
            className="creative-video"
            playsInline
            muted
            loop
            autoPlay
            onLoadedData={() => setVideoLoaded(true)}
          >
            <source src={bgVideo} type="video/mp4" />
            Your browser does not support video playback.
          </video>
          {isSectionVisible && videoLoaded && sectionInViewport && (
            <div className="creative-content">
              {prevSlide !== null && renderSlideContent(prevSlide, false)}
              {renderSlideContent(currentSlide, true)}
            </div>
          )}
        </div>
        {/* Bottom center down arrow */}
        {showArrow && (
          <div className="creative-bottom-arrow">
            <img src={arrowDown} alt="Scroll Down" className="down-arrow-svg" />
          </div>
        )}
    </div>
  );
};
