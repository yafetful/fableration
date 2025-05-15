import React, { useRef, useEffect, useState } from 'react';
import './VisionCard.css';

interface VisionCardProps {
  title: string;
  subtitle: string;
  className?: string;
  titleColor?: string;
  subtitleColor?: string;
  width?: string | number;
}

const VisionCard: React.FC<VisionCardProps> = ({ 
  title, 
  subtitle, 
  className = '',
  titleColor,
  subtitleColor,
  width
}) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const updateUnderlineWidth = () => {
    if (!titleRef.current || !underlineRef.current) return;
    
    const titleEl = titleRef.current;
    
    const range = document.createRange();
    range.selectNodeContents(titleEl);
    const textWidth = range.getBoundingClientRect().width;
    
    const tempSpan = document.createElement('span');
    tempSpan.style.position = 'absolute';
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.whiteSpace = 'nowrap';
    tempSpan.style.left = '-9999px';
    tempSpan.style.font = window.getComputedStyle(titleEl).font;
    tempSpan.style.fontSize = window.getComputedStyle(titleEl).fontSize;
    tempSpan.style.fontFamily = window.getComputedStyle(titleEl).fontFamily;
    tempSpan.style.fontWeight = window.getComputedStyle(titleEl).fontWeight;
    tempSpan.style.letterSpacing = window.getComputedStyle(titleEl).letterSpacing;
    tempSpan.style.textTransform = window.getComputedStyle(titleEl).textTransform;
    tempSpan.innerText = titleEl.textContent || '';
    
    document.body.appendChild(tempSpan);
    const spanWidth = tempSpan.getBoundingClientRect().width;
    document.body.removeChild(tempSpan);
    
    const finalWidth = Math.max(textWidth, spanWidth);
    
    underlineRef.current.style.width = `${finalWidth}px`;
  };
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    if (!isMounted) return;
    
    updateUnderlineWidth();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {

        updateUnderlineWidth();
        setTimeout(updateUnderlineWidth, 100);
        setTimeout(updateUnderlineWidth, 500);
      });
    }

    window.addEventListener('resize', updateUnderlineWidth);
    
    const observer = new MutationObserver(updateUnderlineWidth);
    if (titleRef.current) {
      observer.observe(titleRef.current, {
        characterData: true,
        subtree: true,
        childList: true,
        attributes: true
      });
    }
    
    const intervalId = setInterval(updateUnderlineWidth, 1000);
    
    return () => {
      window.removeEventListener('resize', updateUnderlineWidth);
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, [isMounted, title]);
  
  const cardStyle = {
    width: width ? width : undefined
  };
  
  const titleStyle = {
    color: titleColor || undefined
  };
  
  const subtitleStyle = {
    color: subtitleColor || undefined
  };
  
  return (
    <div className={`vision-card ${className}`} style={cardStyle}>
      <div className="title-container">
        <h2 
          className="vision-title" 
          style={titleStyle}
          ref={titleRef}
        >{title}</h2>
        <div className="vision-underline-container">
          <div className="vision-underline" ref={underlineRef}>
            <div className="underline-gradient"></div>
          </div>
        </div>
      </div>
      <p className="vision-subtitle" style={subtitleStyle}>{subtitle}</p>
    </div>
  );
};

export default VisionCard; 