import React from "react"
import { Link, useNavigate } from "react-router-dom"

export interface DropdownItem {
  label: string;
  href: string;
  isBold?: boolean;
}

export interface DropdownProps {
  items: DropdownItem[];
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ 
  items, 
  className 
}) => {
  const navigate = useNavigate();
  
  const dropdownStyle = {
    position: "absolute" as const,
    top: "100%",
    left: "0",
    marginTop: "8px",
    minWidth: "200px",
    zIndex: 1000,
    borderRadius: "20px",
    overflow: "hidden",
  };

  const dropdownBgStyle = {
    position: "absolute" as const,
    inset: 0,
    zIndex: 0,
    background: "rgba(255,255,255,1)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxShadow: "0 0 0 1px rgba(255, 255, 255, 1) inset",
    WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0.8) 100%)",
    maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0.8) 100%)",
    borderRadius: "20px",
  };

  const dropdownContentStyle = {
    position: "relative" as const,
    zIndex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
    padding: "24px",
    borderRadius: "19px",
    background: "transparent",
  };
  
  const handleItemClick = (href: string, e: React.MouseEvent) => {
    if (href.startsWith('/')) {
      e.preventDefault();
      navigate(href);
    }
  };

  return (
    <div style={dropdownStyle} className={className}>
      <div style={dropdownBgStyle} />
      <div style={dropdownContentStyle}>
        {items.map((item, index) => (
          item.href.startsWith('/') ? (
            <Link
              key={index}
              to={item.href}
              style={{
                color: "#010821",
                fontWeight: item.isBold ? 500 : 400,
                textDecoration: "none",
                cursor: "pointer",
                opacity: 1,
              }}
              onMouseOver={e => (e.currentTarget.style.fontWeight = "500")}
              onMouseOut={e => (e.currentTarget.style.fontWeight = item.isBold ? "500" : "400")}
            >
              {item.label}
            </Link>
          ) : (
            <a
              key={index}
              href={item.href}
              style={{
                color: "#010821",
                fontWeight: item.isBold ? 500 : 400,
                textDecoration: "none",
                cursor: "pointer",
                opacity: 1,
              }}
              onClick={(e) => handleItemClick(item.href, e)}
              onMouseOver={e => (e.currentTarget.style.fontWeight = "500")}
              onMouseOut={e => (e.currentTarget.style.fontWeight = item.isBold ? "500" : "400")}
            >
              {item.label}
            </a>
          )
        ))}
      </div>
    </div>
  )
} 