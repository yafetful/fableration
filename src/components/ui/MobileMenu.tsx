import { useState, useEffect } from 'react';
import { Button } from './Button';
import logoBlack from '@/assets/images/logo_black.svg';
import menuIcon from '@/assets/icons/menu.svg';
import arrowIcon from '@/assets/icons/arrow.svg';
import './MobileMenu.css';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItemProps[];
}

interface MenuItemProps {
  label: string;
  href?: string;
  submenu?: {
    label: string;
    href: string;
  }[];
}

export function MobileMenu({ isOpen, onClose, menuItems }: MobileMenuProps) {
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, onClose]);
  
  const toggleSubmenu = (index: number) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };
  
  if (!isVisible && !isOpen) return null;
  
  return (
    <>
      <div 
        className={`mobile-menu-overlay ${isOpen ? 'active animate-fade-in' : 'animate-fade-out'}`} 
        onClick={onClose}
      />
      
      <div className={`mobile-menu ${isOpen ? 'active animate-mobile-slide-in-down' : 'animate-mobile-slide-out-up'}`}>
        <div className="mobile-menu-header">
          <img 
            src={logoBlack} 
            alt="Fableration" 
            className="mobile-menu-logo" 
          />
          <button 
            className="mobile-menu-toggle"
            onClick={onClose}
            aria-label="Close menu"
          >
            <img src={menuIcon} alt="Menu" className="mobile-menu-toggle-icon" />
          </button>
        </div>
        
        <div className="mobile-menu-content">
          {menuItems.map((item, index) => (
            <div key={index} className={`animate-fade-in-up delay-${index * 100}`}>
              {item.submenu ? (
                <>
                  <div 
                    className={`mobile-menu-item has-submenu ${openSubmenu === index ? 'open' : ''}`}
                    onClick={() => toggleSubmenu(index)}
                  >
                    {item.label}
                    <div className={`mobile-menu-submenu-toggle ${openSubmenu === index ? 'open' : ''}`}>
                      <img src={arrowIcon} alt="" />
                    </div>
                  </div>
                  <div className={`mobile-menu-submenu ${openSubmenu === index ? 'open' : ''}`}>
                    {item.submenu.map((subitem, subIndex) => (
                      <a 
                        key={subIndex} 
                        href={subitem.href} 
                        className="mobile-menu-submenu-item"
                      >
                        {subitem.label}
                      </a>
                    ))}
                  </div>
                </>
              ) : (
                <a 
                  href={item.href || '#'} 
                  className="mobile-menu-item"
                >
                  {item.label}
                </a>
              )}
            </div>
          ))}
        </div>
        
        <div className="mobile-menu-footer animate-fade-in-up delay-400">
          <Button 
            variant="gradient" 
            rounded="full"
            textTransform="capitalize"
            href="#join-us"
            className="w-full"
          >
            be part of story
          </Button>
        </div>
      </div>
    </>
  );
} 