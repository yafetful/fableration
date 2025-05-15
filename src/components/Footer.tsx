import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import WaterRippleBackground from "./WaterRippleBackground";
import SocialButton from "./ui/SocialButton";
import logo from "../assets/images/logo_black.svg";
import webIcon from "../assets/icons/web.svg";
import xIcon from "../assets/icons/twitter.svg";
import tgIcon from "../assets/icons/telegram.svg";
import discordIcon from "../assets/icons/disccord.svg";
import instagramIcon from "../assets/icons/instagram.svg";
import youtubeIcon from "../assets/icons/youtube.svg";
import facebookIcon from "../assets/icons/facebook.svg";
import linkedinIcon from "../assets/icons/linkin.svg";
import "./Footer.css";

const socials = [
  { icon: webIcon, href: "https://www.fableration.com/" },
  { icon: xIcon, href: "https://x.com/Fableration" },
  { icon: tgIcon, href: "https://t.me/fablerationmain" },
  { icon: discordIcon, href: "https://discord.com/invite/PSJqSGT6jR" },
  { icon: instagramIcon, href: "https://www.instagram.com/fableration/" },
  { icon: youtubeIcon, href: "https://www.youtube.com/@Fableration" },
  { icon: facebookIcon, href: "https://www.facebook.com/fableration" },
  { icon: linkedinIcon, href: "https://www.linkedin.com/company/fableration1/" },
];

const Footer: React.FC = () => {
  const bgWrapperRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const updateBgWrapperSize = () => {
      if (bgWrapperRef.current) {
        const footerHeight = bgWrapperRef.current.parentElement?.offsetHeight || 0;
        bgWrapperRef.current.style.height = `${footerHeight}px`;
      }
    };
    
    updateBgWrapperSize();
    
    window.addEventListener('resize', updateBgWrapperSize);
    
    return () => {
      window.removeEventListener('resize', updateBgWrapperSize);
    };
  }, []);
  
  return (
    <footer className="footer">
      <div ref={bgWrapperRef} className="footer__bg-wrapper">
        <WaterRippleBackground />
      </div>
      <div className="footer__content">
        <div className="footer__mainrow">
          <div className="footer__logo-nav">
            <Link to="/">
              <img src={logo} alt="Fableration Logo" className="footer__logo" />
            </Link>
            <nav className="footer__nav">
              <Link to="/about">About Us</Link>
              <a href="/ourcommunity">Our Community</a>
              <a href="/feature">Product Features</a>
              <a href="/community">Community</a>
            </nav>
          </div>
        </div>
        <div className="footer__socials-row">
          <div className="footer__socials">
            {socials.map((s, i) => (
              <SocialButton key={i} icon={s.icon} href={s.href} />
            ))}
          </div>
        </div>
        <div className="footer__bottom">
          <span>©2025 Fableration | All Rights Reserved</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 