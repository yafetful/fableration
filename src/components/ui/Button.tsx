import { cn } from "@/lib/utils"
import React, { useRef, useState, useEffect, useCallback } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import arrowRightWhite from "../../assets/icons/arrow_right_white.svg"
import "./Button.css"

const buttonVariants = cva(
  "inline-flex items-center justify-center text-sm font-normal hover:font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
        gradient: "text-white gradient-animate relative overflow-hidden",
        slide: "text-white slide-button relative overflow-hidden py-4 px-6",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
)

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  textTransform?: "uppercase" | "lowercase" | "capitalize" | "normal-case";
  href?: string;
  target?: string;
  showArrow?: boolean;
  width?: string | number;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, textTransform = "normal-case", href = "#", target = "_self", showArrow = false, width, children, onClick, ...props }, ref) => {
    const textClass = {
      uppercase: "uppercase",
      lowercase: "lowercase", 
      capitalize: "capitalize",
      "normal-case": "normal-case"
    }[textTransform];

    const [dragX, setDragX] = useState(0);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const arrowRef = useRef<HTMLSpanElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isDragComplete, setIsDragComplete] = useState(false);
    const initialX = useRef(0);
    const [maxDistance, setMaxDistance] = useState(0);
    
    useEffect(() => {
      if (!buttonRef.current || !arrowRef.current) return;
      
      const calculateMaxDistance = () => {
        const buttonWidth = buttonRef.current?.offsetWidth || 0;
        const buttonHeight = buttonRef.current?.offsetHeight || 0;
        const arrowWidth = arrowRef.current?.offsetWidth || 0;
        const borderRadius = Math.min(buttonHeight / 2, buttonWidth / 2); // 防止极端情况
        const maxDrag = buttonWidth - arrowWidth - borderRadius+22;
        setMaxDistance(maxDrag);
      };
      
      calculateMaxDistance();
      
      const timerId = setTimeout(calculateMaxDistance, 100);
      
      window.addEventListener('resize', calculateMaxDistance);
      
      return () => {
        window.removeEventListener('resize', calculateMaxDistance);
        clearTimeout(timerId);
      };
    }, [width]);

    const checkDragComplete = useCallback((x: number) => {
      return x >= maxDistance - 2;
    }, [maxDistance]);

    const updateDragPosition = useCallback((clientX: number) => {
      if (!isDragging) return;
      
      const deltaX = clientX - initialX.current;
      const newDragX = Math.max(0, Math.min(deltaX, maxDistance));
      setDragX(newDragX);
      
      setIsDragComplete(checkDragComplete(newDragX));
      
      return newDragX;
    }, [isDragging, maxDistance, checkDragComplete]);

    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!buttonRef.current || !arrowRef.current) return;
      
      setIsDragging(true);
      setIsDragComplete(false);
      initialX.current = e.clientX;
      
      if (arrowRef.current) {
        arrowRef.current.style.cursor = "grabbing";
      }
    };
    
    const handleTouchStart = (e: React.TouchEvent) => {
      if (!buttonRef.current || !arrowRef.current) return;
      
      setIsDragging(true);
      setIsDragComplete(false);
      initialX.current = e.touches[0].clientX;
    };

    const triggerAction = useCallback(() => {
      if (variant === "slide" && onClick) {
        onClick(new MouseEvent('click', { bubbles: true }) as any);
      }
    }, [onClick, variant]);

    const resetDrag = useCallback(() => {
      setIsDragging(false);
      setDragX(0);
      setIsDragComplete(false);
      if (arrowRef.current) {
        arrowRef.current.style.cursor = "grab";
      }
    }, []);

    useEffect(() => {
      if (!isDragging) return;

      const handleMouseMove = (e: MouseEvent) => {
        updateDragPosition(e.clientX);
      };

      const handleMouseUp = (e: MouseEvent) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - initialX.current;
        const finalDragX = Math.max(0, Math.min(deltaX, maxDistance));
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Drag end - Final: ${finalDragX}, Max: ${maxDistance}, Threshold: ${maxDistance - 2}`);
        }
        
        if (deltaX > 5 && finalDragX >= maxDistance - 2) {
          triggerAction();
        }
        
        resetDrag();
      };

      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging, updateDragPosition, triggerAction, resetDrag, maxDistance, initialX]);

    useEffect(() => {
      if (!isDragging) return;

      const handleTouchMove = (e: TouchEvent) => {
        updateDragPosition(e.touches[0].clientX);
      };

      const handleTouchEnd = (e: TouchEvent) => {
        if (!isDragging) return;
        
        if (e.changedTouches.length > 0) {
          const touch = e.changedTouches[0];
          const deltaX = touch.clientX - initialX.current;
          const finalDragX = Math.max(0, Math.min(deltaX, maxDistance));
          
          if (deltaX > 5 && finalDragX >= maxDistance - 2) {
            triggerAction();
          }
        }
        
        resetDrag();
      };

      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchcancel', handleTouchEnd);
      
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchEnd);
      };
    }, [isDragging, updateDragPosition, triggerAction, resetDrag, maxDistance, initialX]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (variant === "slide") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      if (href) {
        if (target === "_blank") {
          window.open(href, target);
        } else {
          window.location.href = href;
        }
      }
      
      if (onClick) {
        onClick(e);
      }
    };

    const buttonClasses = cn(
      buttonVariants({ variant, size, rounded, className }),
      textClass,
      { 'drag-ready': isDragComplete }
    );

    useEffect(() => {
      if (variant !== "slide" || !buttonRef.current) return;
      
      const buttonElement = buttonRef.current;
      
      const captureClickHandler = (e: Event) => {
        e.stopPropagation();
        e.preventDefault();
      };
      
      buttonElement.addEventListener('click', captureClickHandler, true);
      
      return () => {
        buttonElement.removeEventListener('click', captureClickHandler, true);
      };
    }, [variant]);

    return (
      <button
        className={buttonClasses}
        ref={ref || buttonRef}
        onClick={handleClick}
        {...props}
        style={{
          cursor: variant === "slide" ? "grab" : "pointer",
          fontSize: "var(--font-size-base)",
          fontFamily: "var(--font-family)",
          width: width ?? undefined,
        }}
      >
        {(variant === "gradient" || variant === "slide") && (
          <span className="absolute inset-0 gradient-bg" aria-hidden="true"></span>
        )}
        {variant === "slide" ? (
          <>
            <span className="button-text relative">{children}</span>
            {showArrow && (
              <span
                className="arrow-container"
                ref={arrowRef}
                style={{ 
                  transform: `translateX(${dragX}px)`,
                  cursor: isDragging ? "grabbing" : "grab" 
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                <img 
                  src={arrowRightWhite} 
                  alt="arrow" 
                  className="button-arrow"
                  draggable="false"
                />
              </span>
            )}
          </>
        ) : (
          <span className="relative">{children}</span>
        )}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants } 