import React from "react";
import "./VideoCard.css";
import playButton from "../../assets/icons/playbutton.svg";

interface VideoCardProps {
  videoUrl: string;
  coverImage: string;
  text: string;
  target?: "_blank" | "_self";
  animate?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({
  videoUrl,
  coverImage,
  text,
  target = "_blank",
  animate = false,
}) => {
  const lines = text.split("/n");
  
  const textLines = lines.map((line, index) => {
    // All lines use fontWeight 900
    const fontWeight = 900;
    return (
      <span 
        key={index} 
        className={`video-card-text-line ${animate ? 'animate' : ''} weight-${fontWeight}`}
        style={{ 
          animationDelay: animate ? `${1.5 * index}s` : '0s',
        }}
      >
        {line}
      </span>
    );
  });

  return (
    <div className="video-card-content">
      <div className="video-card-text-container">{textLines}</div>
      <div className="video-card-img-outer">
        <a
          href={videoUrl}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
        >
          <div className="video-card-img-wrapper">
            <img
              src={coverImage}
              alt="Video thumbnail"
              className="video-card-img"
            />
            <div className="video-card-gradient" />
            <img
              src={playButton}
              alt="Play"
              className="video-card-play-button"
            />
          </div>
        </a>
      </div>
    </div>
  );
};

export default VideoCard;
