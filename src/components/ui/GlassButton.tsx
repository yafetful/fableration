import React, { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import './GlassButton.css';
import arrowRight from '../../assets/icons/arrow_right.svg';

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'simple';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  href?: string;
  target?: string;
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ 
    className = '', 
    variant = 'primary',
    size = 'md',
    icon,
    href,
    target = '_self',
    ...props 
  }, ref) => {
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (href) {
        if (target === "_blank") {
          window.open(href, target);
        } else {
          window.location.href = href;
        }
      }
      
      if (props.onClick) {
        props.onClick(e);
      }
    };
    
    return (
      <button
        ref={ref}
        className={`glass-button ${variant} ${size} ${className}`}
        onClick={handleClick}
        {...props}
      >
        <div className="glass-button-inner">
          {variant === 'simple' ? (
            <span className="glass-button-text">
              {props.children}
              <span className="glass-button-arrow">
                <img src={arrowRight} alt="→" />
              </span>
            </span>
          ) : (
            <>
              <div className="glass-button-icon-circle">
                <img src={icon} alt="Icon" className="glass-button-icon" />
              </div>
              <div className="glass-button-arrow">
                <img src={arrowRight} alt="→" />
              </div>
            </>
          )}
        </div>
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton'; 