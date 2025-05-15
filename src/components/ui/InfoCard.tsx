import React from 'react';
import './InfoCard.css';

export type ImagePosition = 'top-left' | 'center';
export type CardVariant = 'default' | 'modern' | 'team';
export type TeamImageSize = 'large' | 'small';

interface InfoCardProps {
  image: string;
  title: string;
  subtitle?: string;
  content: string;
  link?: string;
  target?: '_blank' | '_self';
  imagePosition?: ImagePosition;
  variant?: CardVariant;
  backgroundColor?: string;
  hasGradient?: boolean;
  team_image_size?: TeamImageSize;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  image,
  title,
  subtitle,
  content,
  link,
  target = '_blank',
  imagePosition = 'top-left',
  variant = 'default',
  backgroundColor,
  hasGradient = true,
  team_image_size = 'small'
}) => {
  const isModern = variant === 'modern';
  const isTeam = variant === 'team';
  
  // 处理内容，所有内容都支持\n换行格式化，并将 [info@fableration.com] 转为 mailto 链接
  const renderContent = () => {
    // 将内容按换行符分割
    const lines = content.split('\n');
    const contentElements = lines.map((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine === '') {
        return null; // 忽略空行
      }
      // 检查是否包含 [info@fableration.com]
      const emailMatch = trimmedLine.match(/\[info@fableration.com\]/);
      let lineNode: React.ReactNode = trimmedLine;
      if (emailMatch) {
        // 替换为 mailto 链接
        lineNode = (
          <>
            {trimmedLine.split(/\[info@fableration.com\]/).map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span 
                    className="email-link"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = 'mailto:info@fableration.com';
                    }}
                    style={{ 
                      color: '#0038FF', 
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                  >
                    info@fableration.com
                  </span>
                )}
              </React.Fragment>
            ))}
          </>
        );
      }
      if (isTeam && trimmedLine.startsWith('•')) {
        // 移除•符号，因为我们会在CSS中添加
        const itemText = trimmedLine.substring(1).trim();
        return (
          <div key={index} className="list-item">
            {itemText}
          </div>
        );
      } else {
        return <p key={index} className="info-card-text">{lineNode}</p>;
      }
    }).filter(Boolean); // 过滤掉null值
    return <>{contentElements}</>;
  };
  
  const cardContent = (
    <div 
      className={`info-card ${isModern ? 'info-card-modern' : ''} ${isTeam ? 'info-card-team' : ''}`} 
      style={
        !isModern && backgroundColor ? 
        { 
          background: hasGradient ? 
            `linear-gradient(10deg, ${backgroundColor} 0%, rgba(255, 255, 255, 1) 100%)` : 
            backgroundColor 
        } : undefined
      }
    >
      <div className={`info-card-image-container ${isTeam ? `team-image-${team_image_size}` : ''}`}>
        <img 
          src={image} 
          alt={title} 
          className={`info-card-image ${isTeam ? `team-card-image` : ''}`}
          style={{objectPosition: isTeam ? 'center' : (imagePosition === 'center' ? 'center' : 'top left')}} 
        />
      </div>
      <div className="info-card-content">
        {!isTeam && subtitle && <h3 className="info-card-subtitle">{subtitle}</h3>}
        <h2 className="info-card-title">{title}</h2>
        {isTeam && subtitle && <h3 className="info-card-subtitle">{subtitle}</h3>}
        {renderContent()}
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} target={target} className="info-card-link" rel={target === '_blank' ? 'noopener noreferrer' : undefined}>
        {cardContent}
      </a>
    );
  }

  return cardContent;
}; 