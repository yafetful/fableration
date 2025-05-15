"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { TextButton } from "./TextButton"
import { Button } from "./Button"
import { MobileMenu } from "./MobileMenu"
import type { DropdownItem } from "./Dropdown"
import logoSvg from "@/assets/images/logo_black.svg"
import menuIcon from "@/assets/icons/menu.svg"
import styles from "./Navbar.module.css"

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  const aboutDropdownItems: DropdownItem[] = [
    { label: "About Fableration", href: "/about" },
    { label: "Team & Partners", href: "/team" }
  ];
  
  const mobileMenuItems = [
    {
      label: "About Us",
      submenu: [
        { label: "About Fableration", href: "/about" },
        { label: "Team & Partners", href: "/team" }
      ]
    },
    { label: "Our Community", href: "/ourcommunity" },
    { label: "Product Features", href: "/feature" },
    { label: "Community", href: "/community" }
  ];
  
  return (
    <header 
      className={cn(
        "w-full py-4 px-6 fixed top-0 z-50 bg-transparent",
        styles["navbar-glass-bg"],
        className
      )}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src={logoSvg} 
            alt="Fableration" 
            className={`h-8 md:h-10 w-auto object-contain ${isMenuOpen ? 'logo-dark' : ''}`}
            style={{ height: isMobile ? '30px' : '' }}
          />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-center w-full">
          <nav className="flex items-center space-x-8 mx-auto">
            <TextButton 
              hasSubmenu 
              dropdownItems={aboutDropdownItems}
              width={140}
            >
              About Us
            </TextButton>
            <TextButton width={160} href="/ourcommunity">Our Community</TextButton>
            <TextButton width={170} href="/feature">Product Features</TextButton>
            <TextButton width={120} href="/community">Community</TextButton>
          </nav>
          <div className="ml-8">
            <Button 
              variant="gradient" 
              rounded="full"
              textTransform="capitalize"
              href="https://www.fableration.com/platform/reader"
              target="_blank"
            >
              be part of story
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <img src={menuIcon} alt="Menu" className="w-6 h-6" />
        </button>
      </div>
      
      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        menuItems={mobileMenuItems} 
      />
    </header>
  )
} 