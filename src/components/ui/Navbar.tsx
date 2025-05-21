"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { TextButton } from "./TextButton"
import { Button } from "./Button"
import { MobileMenu } from "./MobileMenu"
import type { DropdownItem } from "./Dropdown"
import logoSvg from "@/assets/images/logo_black.svg"
import logoSvgWhite from "@/assets/images/logo.svg"
import menuIcon from "@/assets/icons/menu.svg"
import styles from "./Navbar.module.css"

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showGlassBg, setShowGlassBg] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [atTop, setAtTop] = useState(true);
  
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

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setAtTop(currentScrollY <= 10);
          if (currentScrollY > lastScrollY && currentScrollY > 10) {
            // Scrolling down
            setNavbarVisible(false);
            setShowGlassBg(false);
          } else if (currentScrollY < lastScrollY && currentScrollY > 10) {
            // Scrolling up
            setNavbarVisible(true);
            setShowGlassBg(true);
          } else if (currentScrollY <= 10) {
            setNavbarVisible(true);
            setShowGlassBg(false);
          }
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
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
    { label: "News", href: "/news" }
  ];
  
  return (
    <header 
      className={cn(
        "w-full py-4 px-6 fixed top-0 z-50 transition-all duration-300",
        !navbarVisible && "-translate-y-full opacity-0 pointer-events-none",
        showGlassBg && styles["navbar-glass-bg"],
        !showGlassBg && atTop && "bg-transparent",
        showGlassBg && "bg-black bg-opacity-80",
        className
      )}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src={atTop ? logoSvgWhite : logoSvg}
            alt="Fableration" 
            className="h-8 md:h-10 w-auto object-contain transition-all duration-300"
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
              className={atTop ? "text-white" : "text-black"}
              arrowColor={atTop ? "white" : "black"}
            >
              About Us
            </TextButton>
            <TextButton width={160} href="/ourcommunity" className={atTop ? "text-white" : "text-black"}>Our Community</TextButton>
            <TextButton width={170} href="/feature" className={atTop ? "text-white" : "text-black"}>Product Features</TextButton>
            <TextButton width={120} href="/news" className={atTop ? "text-white" : "text-black"}>News</TextButton>
          </nav>
          <div className="ml-8">
            <Button 
              variant="gradient"
              rounded="full"
              href="https://www.fableration.com/platform/reader"
              target="_blank"
            >
              Be Part of the Story
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <img src={menuIcon} alt="Menu" className={cn("w-6 h-6", atTop ? "" : "filter invert brightness-200")}/>
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