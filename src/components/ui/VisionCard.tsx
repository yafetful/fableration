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
  
  // 直接测量并设置下划线宽度的函数
  const updateUnderlineWidth = () => {
    if (!titleRef.current || !underlineRef.current) return;
    
    // 获取标题元素并测量其文本内容宽度
    const titleEl = titleRef.current;
    
    // 使用文本测量的专用方法
    const range = document.createRange();
    range.selectNodeContents(titleEl);
    const textWidth = range.getBoundingClientRect().width;
    
    // 作为备份，也使用span方法测量
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
    
    // 使用最大值以确保覆盖完整文本
    const finalWidth = Math.max(textWidth, spanWidth);
    
    // 设置下划线宽度
    underlineRef.current.style.width = `${finalWidth}px`;
  };
  
  // 初始化组件
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // 在组件挂载和标题变化时更新宽度
  useEffect(() => {
    if (!isMounted) return;
    
    // 立即更新一次
    updateUnderlineWidth();
    
    // 在字体加载完成后更新
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        // 字体加载完成后多次尝试更新，以处理各种edge cases
        updateUnderlineWidth();
        setTimeout(updateUnderlineWidth, 100);
        setTimeout(updateUnderlineWidth, 500);
      });
    }
    
    // 监听窗口尺寸变化
    window.addEventListener('resize', updateUnderlineWidth);
    
    // 创建MutationObserver来监视DOM变化
    const observer = new MutationObserver(updateUnderlineWidth);
    if (titleRef.current) {
      observer.observe(titleRef.current, {
        characterData: true,
        subtree: true,
        childList: true,
        attributes: true
      });
    }
    
    // 定期检查以确保宽度正确
    const intervalId = setInterval(updateUnderlineWidth, 1000);
    
    // 清理函数
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