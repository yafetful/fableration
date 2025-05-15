import React from "react";
import "./EventCard.css";

interface EventCardProps {
  description?: string;
  imageSrc?: string;
  url?: string;
  target?: '_blank' | '_self';
}

const EventCard: React.FC<EventCardProps> = ({ 
  description = "Picture event description, placeholder copy", 
  imageSrc,
  url,
  target = '_blank',
}) => {
  const cardContent = (
    <div className="event-card">
      <div className="event-card-img-wrapper">
        <img
          src={imageSrc}
          alt="Event"
          className="event-card-img"
        />
        <div className="event-card-gradient" />
        <div className="event-card-overlay-text">{description}</div>
      </div>
    </div>
  );

  if (url) {
    return (
      <a 
        href={url} 
        target={target} 
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        className="event-card-link"
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
};

export default EventCard; 