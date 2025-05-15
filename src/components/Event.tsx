import React, { useState, useEffect, useRef } from "react";
import EventCard from "./ui/EventCard";
import VideoCard from "./ui/VideoCard";
import api from "../api";
import type { Highlight } from "../api";
import "./Event.css";

// API基础URL，用于处理相对路径的图片
const API_BASE_URL = '';

// 处理图片URL，添加API基础URL如果是相对路径
const getFullImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
};

export const Event: React.FC = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoCardInView, setVideoCardInView] = useState(false);
  const videoSectionRef = useRef<HTMLDivElement>(null);

  // 从API获取highlights数据
  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.highlights.getActive();
        setHighlights(data);
      } catch (err) {
        console.error('Failed to fetch highlights:', err);
        setError('Failed to load highlights');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHighlights();
  }, []);

  // 分离图片和视频类型的highlights
  const imageHighlights = highlights.filter(item => item.type === 'image' || !item.type);
  const videoHighlights = highlights.filter(item => item.type === 'video');
  
  // 监测视频卡片是否在可视区域内
  useEffect(() => {
    if (videoSectionRef.current && videoHighlights.length > 0) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            console.log('Video card section is visible!');
            setVideoCardInView(true);
            
            // 一旦开始动画，就不需要再观察了
            if (videoSectionRef.current) {
              observer.unobserve(videoSectionRef.current);
            }
          }
        },
        {
          root: null,
          rootMargin: "0px",
          threshold: 0.1, // 降低阈值，让观察更敏感
        }
      );

      observer.observe(videoSectionRef.current);
      
      return () => {
        if (videoSectionRef.current) {
          observer.unobserve(videoSectionRef.current);
        }
      };
    }
  }, [videoHighlights.length]);

  // 为图片卡片设置size，每行3个，第一行"大小小"，第二行"小小大"交替模式
  const imageHighlightsWithSize = imageHighlights.map((item, index) => ({
    ...item,
    size: index % 6 === 0 || index % 6 === 5 ? 'large' : 'small'
  }));

  if (isLoading) {
    return (
      <div className="event-container">
        <h1 className="event-title">Event Highlights</h1>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-container">
        <h1 className="event-title">Event Highlights</h1>
        <div className="text-red-500 text-center p-4">{error}</div>
      </div>
    );
  }

  if (highlights.length === 0) {
    return (
      <div className="event-container">
        <h1 className="event-title">Event Highlights</h1>
        <div className="text-gray-500 text-center p-4">No highlights available</div>
      </div>
    );
  }

  return (
    <div className="event-container">
      <h1 className="event-title">Event Highlights</h1>

      {imageHighlightsWithSize.length > 0 && (
        <div className="event-section">
          <div className="event-card-grid">
            {imageHighlightsWithSize.map((item, idx) => (
              <div
                key={idx}
                className={`event-card-wrapper ${
                  item.size === "large"
                    ? "event-card-wrapper-large"
                    : "event-card-wrapper-small"
                }`}
              >
                <EventCard
                  imageSrc={getFullImageUrl(item.imageUrl)}
                  description={item.title}
                  url={item.url || ''}
                  target="_blank"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {videoHighlights.length > 0 && (
        <div ref={videoSectionRef} className="event-section video-card-section">
          <div className="video-card-container">
            {videoHighlights.map((video, idx) => {
              // 处理换行符，确保正确转换为VideoCard期望的/n格式
              const processedText = video.title
                .replace(/\\\\n/g, '/n') // 处理双重转义
                .replace(/\\n/g, '/n') // 处理单重转义
                .replace(/\n/g, '/n'); // 处理实际换行
              
              return (
                <VideoCard
                  key={idx}
                  videoUrl={video.url || ''}
                  coverImage={getFullImageUrl(video.imageUrl)}
                  text={processedText}
                  target="_blank"
                  animate={videoCardInView}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
