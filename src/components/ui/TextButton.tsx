import { cn } from "@/lib/utils"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import arrowIcon from "@/assets/icons/arrow.svg"
import arrowIconWhite from "@/assets/icons/arrow_white.svg"
import { Dropdown } from "./Dropdown"
import type { DropdownItem } from "./Dropdown"

export interface TextButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  hasSubmenu?: boolean;
  dropdownItems?: DropdownItem[];
  width?: string | number;
  href?: string;
  target?: string;
  to?: string;
  arrowColor?: 'white' | 'black';
}

const TextButton = React.forwardRef<HTMLButtonElement, TextButtonProps>(
  ({ 
    className, 
    hasSubmenu = false, 
    dropdownItems = [], 
    width, 
    href = "#", 
    target = "_self", 
    to,
    children, 
    arrowColor = 'black',
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleDropdown = () => {
      if (hasSubmenu) {
        setIsOpen(!isOpen);
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      toggleDropdown();
      
      if (!hasSubmenu) {
        if (to) {
          navigate(to);
        } else if (href) {
          if (target === "_blank") {
            window.open(href, target);
          } else if (href.startsWith('/')) {
            navigate(href);
          } else {
            window.location.href = href;
          }
        }
      }
      
      if (props.onClick) {
        props.onClick(e);
      }
    };

    return (
      <div className="relative group" style={width ? { width } : {}}>
        <button
          className={cn(
            "inline-flex items-center font-normal hover:font-medium transition-all text-white",
            "cursor-pointer",
            className
          )}
          style={{
            fontSize: "var(--font-size-base)",
            fontFamily: "var(--font-family)",
            width: width ? width : undefined,
            minWidth: width ? width : undefined,
          }}
          ref={ref}
          onClick={handleClick}
          {...props}
        >
          {children}
          {hasSubmenu && (
            <img 
              src={arrowColor === 'white' ? arrowIconWhite : arrowIcon} 
              alt="dropdown arrow" 
              className={cn(
                "ml-1 w-2.5 h-auto transition-transform duration-200",
                isOpen && "transform rotate-180"
              )}
            />
          )}
        </button>
        
        {hasSubmenu && isOpen && dropdownItems.length > 0 && (
          <Dropdown items={dropdownItems} />
        )}
      </div>
    )
  }
)

TextButton.displayName = "TextButton"

export { TextButton } 