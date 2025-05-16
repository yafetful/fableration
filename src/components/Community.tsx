import React, { useEffect, useState, useCallback } from 'react';
import './Community.css';
import { Button } from './ui/Button';
import api from '../api';
import type { Event } from '../api';

// API base URL constant
const API_BASE_URL = '';

// Process image URL, add API base URL if it's a relative path
const getFullImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
};

// Process icon URL, add API base URL if it's a relative path
const getFullIconUrl = (iconUrl?: string) => {
  if (!iconUrl) return '';
  if (iconUrl.startsWith('http')) return iconUrl;
  return `${API_BASE_URL}${iconUrl}`;
};

// 检测设备是否为移动设备
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         (window.innerWidth <= 768);
};

interface CommunityProps {
  isSectionVisible?: boolean;
}

export const Community: React.FC<CommunityProps> = ({ isSectionVisible = false }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch competition/event data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await api.events.getAll();
        // Only show published events
        const publishedEvents = data.filter(event => event.published);
        
        if (publishedEvents.length > 0) {
          // Get details of the first event (including items)
          const eventId = publishedEvents[0].id;
          const eventDetails = await api.events.getById(eventId as number);
          setEvents([eventDetails]);
        } else {
          setEvents([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events');
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  // Show loading state
  if (loading) {
    return (
      <div className={`community-container ${isSectionVisible ? 'visible' : ''}`}>
        <h2 className="community-title">Community</h2>
        <div className="community-content loading">Loading...</div>
      </div>
    );
  }
  
  // Show error or empty state
  if (error || events.length === 0) {
    return (
      <div className={`community-container ${isSectionVisible ? 'visible' : ''}`}>
        <h2 className="community-title">Community</h2>
        <div className="community-content error">
          {error || "No active competitions available at the moment."}
        </div>
      </div>
    );
  }
  
  // Get the first event details
  const event = events[0];
  
  return (
    <div className={`community-container ${isSectionVisible ? 'visible' : ''}`}>
      <h2 className="community-title">Community</h2>
      <div className="community-content">
        <div className="community-card">
          <div className="card-image-container">
            <img src={getFullImageUrl(event.imageUrl)} alt={event.title} className="card-image" />
          </div>
          <div className="card-details">
            <h3 className="card-title">{event.title}</h3>
            <p className="card-description">{event.summary}</p>
            <div className="card-info">
              {event.items && event.items.map((item, index) => (
                <div key={index} className="info-item">
                  {item.iconUrl && (
                    <img src={getFullIconUrl(item.iconUrl)} alt={item.name} className="info-icon" />
                  )}
                  <span className="info-title">{item.name}</span>
                  {item.content && <span className="info-text">{item.content}</span>}
                </div>
              ))}
            </div>
            <Button 
              variant="slide" 
              showArrow={true} 
              rounded="full"
              width="100%" 
              onClick={() => {
                if (event.externalLink) {
                  if (isMobileDevice()) {
                    // 移动设备：先尝试打开新窗口，失败则在当前窗口打开
                    const newWindow = window.open(event.externalLink, '_blank');
                    
                    // 如果window.open被阻止或返回null，则使用location.href
                    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                      window.location.href = event.externalLink;
                    }
                  } else {
                    // PC端：直接打开新窗口
                    window.open(event.externalLink, '_blank');
                  }
                }
              }}
            >
              Hurry Up And Participate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 