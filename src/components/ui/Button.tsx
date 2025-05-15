import { cn } from "@/lib/utils"
import React, { useRef, useState, useEffect, useCallback } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import arrowRightWhite from "../../assets/icons/arrow_right_white.svg"
import "./Button.css" // 导入CSS文件用于动画

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

    // 拖动相关状态
    const [dragX, setDragX] = useState(0);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const arrowRef = useRef<HTMLSpanElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isDragComplete, setIsDragComplete] = useState(false);
    const initialX = useRef(0);
    const [maxDistance, setMaxDistance] = useState(0);
    
    // 计算最大拖动距离 (对性能优化)
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
      
      // 立即计算一次
      calculateMaxDistance();
      
      // 添加延时计算，确保在DOM完全渲染后获取到准确尺寸
      const timerId = setTimeout(calculateMaxDistance, 100);
      
      // 监听窗口大小变化以重新计算
      window.addEventListener('resize', calculateMaxDistance);
      
      return () => {
        window.removeEventListener('resize', calculateMaxDistance);
        clearTimeout(timerId);
      };
    }, [width]);

    // 检查是否完成拖拽（拖到最右端）
    const checkDragComplete = useCallback((x: number) => {
      // 必须完全拖到最右端边缘
      return x >= maxDistance - 2;
    }, [maxDistance]);

    // 处理拖动距离更新 (性能优化)
    const updateDragPosition = useCallback((clientX: number) => {
      if (!isDragging) return;
      
      // 计算移动距离
      const deltaX = clientX - initialX.current;
      // 限制在合理范围内
      const newDragX = Math.max(0, Math.min(deltaX, maxDistance));
      // 更新位置状态
      setDragX(newDragX);
      
      // 检查是否达到触发条件
      setIsDragComplete(checkDragComplete(newDragX));
      
      return newDragX;
    }, [isDragging, maxDistance, checkDragComplete]);

    // 处理鼠标按下事件
    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!buttonRef.current || !arrowRef.current) return;
      
      setIsDragging(true);
      setIsDragComplete(false);
      initialX.current = e.clientX;
      
      // 立即捕获焦点以提高响应性
      if (arrowRef.current) {
        arrowRef.current.style.cursor = "grabbing";
      }
    };
    
    // 处理触摸开始事件
    const handleTouchStart = (e: React.TouchEvent) => {
      if (!buttonRef.current || !arrowRef.current) return;
      
      setIsDragging(true);
      setIsDragComplete(false);
      initialX.current = e.touches[0].clientX;
    };

    // 处理触发事件
    const triggerAction = useCallback(() => {
      if (variant === "slide" && onClick) {
        // 只有在slide变体下且拖拽完成时，才会执行onClick
        onClick(new MouseEvent('click', { bubbles: true }) as any);
      }
    }, [onClick, variant]);

    // 清理拖拽状态
    const resetDrag = useCallback(() => {
      setIsDragging(false);
      setDragX(0);
      setIsDragComplete(false);
      if (arrowRef.current) {
        arrowRef.current.style.cursor = "grab";
      }
    }, []);

    // 处理拖动和释放事件 (鼠标)
    useEffect(() => {
      if (!isDragging) return;

      const handleMouseMove = (e: MouseEvent) => {
        updateDragPosition(e.clientX);
      };

      const handleMouseUp = (e: MouseEvent) => {
        if (!isDragging) return;
        
        // 在松开鼠标时，重新检查当前位置是否真的完成拖拽，避免依赖可能异步的状态
        const deltaX = e.clientX - initialX.current;
        const finalDragX = Math.max(0, Math.min(deltaX, maxDistance));
        
        // 输出调试日志 (开发环境)
        if (process.env.NODE_ENV === 'development') {
          console.log(`Drag end - Final: ${finalDragX}, Max: ${maxDistance}, Threshold: ${maxDistance - 2}`);
        }
        
        // 确保是真正的拖动（移动距离大于5像素），并且拖到最右端
        if (deltaX > 5 && finalDragX >= maxDistance - 2) {
          // 只有拖到最右端才触发点击事件
          triggerAction();
        }
        
        // 复位
        resetDrag();
      };

      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging, updateDragPosition, triggerAction, resetDrag, maxDistance, initialX]);

    // 处理触摸事件 (移动设备)
    useEffect(() => {
      if (!isDragging) return;

      const handleTouchMove = (e: TouchEvent) => {
        updateDragPosition(e.touches[0].clientX);
      };

      const handleTouchEnd = (e: TouchEvent) => {
        if (!isDragging) return;
        
        // 在松开手指时，重新检查当前位置是否真的完成拖拽，避免依赖可能异步的状态
        if (e.changedTouches.length > 0) {
          const touch = e.changedTouches[0];
          const deltaX = touch.clientX - initialX.current;
          const finalDragX = Math.max(0, Math.min(deltaX, maxDistance));
          
          // 确保是真正的拖动（移动距离大于5像素），并且拖到最右端
          if (deltaX > 5 && finalDragX >= maxDistance - 2) {
            // 只有拖到最右端才触发点击事件
            triggerAction();
          }
        }
        
        // 复位
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

    // 处理普通点击
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (variant === "slide") {
        // 禁止slide类型的普通点击
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

    // 添加视觉提示类名
    const buttonClasses = cn(
      buttonVariants({ variant, size, rounded, className }),
      textClass,
      { 'drag-ready': isDragComplete }
    );

    // 添加一个useEffect来处理按钮的点击事件拦截 (slide变体专用)
    useEffect(() => {
      // 只对slide类型的按钮添加事件拦截
      if (variant !== "slide" || !buttonRef.current) return;
      
      const buttonElement = buttonRef.current;
      
      // 在捕获阶段拦截点击事件
      const captureClickHandler = (e: Event) => {
        e.stopPropagation();
        e.preventDefault();
      };
      
      // 使用捕获阶段拦截点击事件，确保比React的事件处理更早执行
      buttonElement.addEventListener('click', captureClickHandler, true);
      
      return () => {
        // 清理事件监听器
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