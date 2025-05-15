import React from "react";
import "./SocialButton.css";

interface SocialButtonProps {
  icon: string; // svg path
  href?: string;
  target?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const SocialButton: React.FC<SocialButtonProps> = ({ icon, href, target = "_blank", onClick, disabled }) => {
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (!href || href === '#') {
      e.preventDefault();
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <a 
      className={`social-btn${disabled ? ' social-btn--disabled' : ''}`}
      href={href || '#'} 
      target={target} 
      rel="noopener noreferrer"
      onClick={handleClick}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      style={disabled ? { pointerEvents: 'none', opacity: 0.4 } : {}}
    >
      <img src={icon} alt="social icon" className="social-btn__icon" />
    </a>
  );
};

export default SocialButton; 