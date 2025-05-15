import React, { useState, useEffect, useRef } from "react";
import EventCard from "./ui/EventCard";
import VideoCard from "./ui/VideoCard";
import api from "../api";
import type { Highlight } from "../api";
import "./Event.css";

// API base URL, used to handle relative path images
const API_BASE_URL = '';

// Handle image URL, add API base URL if it's a relative path
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

  // Fetch highlights data from API
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

  // Separate image and video type highlights
  const imageHighlights = highlights.filter(item => item.type === 'image' || !item.type);
  const videoHighlights = highlights.filter(item => item.type === 'video');
  
  // Monitor if video card is in the visible area
  useEffect(() => {
    if (videoSectionRef.current && videoHighlights.length > 0) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            console.log('Video card section is visible!');
            setVideoCardInView(true);
            
            // Once the animation starts, stop observing
            if (videoSectionRef.current) {
              observer.unobserve(videoSectionRef.current);
            }
          }
        },
        {
          root: null,
          rootMargin: "0px",
          threshold: 0.1, // Lower threshold to make observation more sensitive
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

  // Set size for image cards, 3 per row, alternating "large" and "small" patterns
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
              // Process newline characters, ensure correct conversion to VideoCard expected /n format
              const processedText = video.title
                .replace(/\\\\n/g, '/n') // Process double escape
                .replace(/\\n/g, '/n') // Process single escape
                .replace(/\n/g, '/n'); // Process actual newline
              
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
