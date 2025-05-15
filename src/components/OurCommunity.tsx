import "./OurCommunity.css";
import { InfoCard } from "./ui/InfoCard";
import readersCardImage from "../assets/images/readers_card.png";
import authorsCardImage from "../assets/images/authors_card.png";
import publishersCardImage from "../assets/images/publishers_card.png";
import { useRef, useEffect, useState, useCallback } from "react";

export const OurCommunity = ({
  isSectionVisible,
}: {
  isSectionVisible: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // 记录上一次滚动位置，用于判断滚动方向
  const lastScrollYRef = useRef(0);
  // 记录当前滚动方向
  const scrollDirectionRef = useRef<"up" | "down">("down");
  // 判断是否为移动设备
  const [isMobile, setIsMobile] = useState(false);

  // 初始和目标位置设定
  const initialOffsets = [200, 1200, 1800]; // 调整初始水平偏移，使卡片更有层次感
  const middleOffsets = [0, 32, 64]; // 中间态水平偏移，调整为更自然的过渡距离
  const targetOffsets = [0, 8, 16]; // 卡片的最终水平偏移
  const [horizontalOffsets, setHorizontalOffsets] = useState(initialOffsets);

  const initialOpacities = [0, 0, 0]; // 调整初始透明度，使第一张卡片初始也有淡入效果
  const middleOpacities = [1, 1, 1]; // 中间态透明度
  const targetOpacities = [0.1, 0.2, 1]; // 最终透明度
  const [opacities, setOpacities] = useState(initialOpacities);

  const initialScales = [1, 1, 1]; // 调整初始缩放比例，增加立体感
  const middleScales = [1, 1, 1]; // 中间态缩放比例
  const targetScales = [0.8, 0.9, 1]; // 最终缩放比例
  const [scales, setScales] = useState(initialScales);

  // 移动端垂直偏移
  const initialMobileOffsets = [100, 150, 200]; // 移动端初始垂直偏移
  const targetMobileOffsets = [0, 0, 0]; // 移动端目标垂直偏移（无偏移）
  const [mobileVerticalOffsets, setMobileVerticalOffsets] = useState(initialMobileOffsets);

  // 使用 useRef 存储状态更新函数和初始值，避免循环依赖
  const stateValuesRef = useRef({
    initialOffsets,
    middleOffsets,
    targetOffsets,
    initialOpacities,
    middleOpacities,
    targetOpacities,
    initialScales,
    middleScales,
    targetScales,
    initialMobileOffsets,
    targetMobileOffsets
  });

  const stateUpdateFunctionsRef = useRef({
    setHorizontalOffsets,
    setOpacities,
    setScales,
    setMobileVerticalOffsets
  });

  // 检测是否为移动设备
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // 初始检查
    checkIfMobile();
    
    // 窗口大小变化时重新检查
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // 缓动函数，使动画更平滑
  const easeInOutCubic = (x: number): number => {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };

  // 处理滚动事件，更新卡片位置
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !isSectionVisible) return;

    // 从 ref 中获取状态和更新函数，避免依赖问题
    const {
      initialOffsets,
      middleOffsets,
      targetOffsets,
      initialOpacities,
      middleOpacities,
      targetOpacities,
      initialScales,
      middleScales,
      targetScales,
      initialMobileOffsets,
      targetMobileOffsets
    } = stateValuesRef.current;

    const {
      setHorizontalOffsets,
      setOpacities,
      setScales,
      setMobileVerticalOffsets
    } = stateUpdateFunctionsRef.current;

    const containerRect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const sectionHeight = containerRect.height;

    // 判断section是否在视口内
    const isInViewport =
      containerRect.top < viewportHeight && containerRect.bottom > 0;

    if (!isInViewport) {
      // 如果完全滚出视口底部，保持最终状态
      if (containerRect.bottom <= 0) {
        setHorizontalOffsets(targetOffsets);
        setOpacities(targetOpacities);
        setScales(targetScales);
        // 移动端垂直偏移设为目标值
        if (isMobile) {
          setMobileVerticalOffsets(targetMobileOffsets);
        }
      }
      return;
    }

    // 计算整体滚动进度 (0-1)
    // 简化计算方法，使动画均匀分布在整个高度的80%上
    // 关键思路：使用section相对于视口的位置来计算线性进度

    // 计算section在视口中的位置 (从完全在视口底部到完全滚出视口顶部)
    // 0% = section的顶部刚好在视口底部
    // 100% = section已经完全滚出视口顶部
    const totalScrollDistance = sectionHeight + viewportHeight; // 总滚动距离
    const distanceScrolled = viewportHeight - containerRect.top; // 已滚动距离

    // 将滚动距离转换为进度值 (0-1)
    // 仅使用总距离的80%来分布动画
    const effectiveScrollDistance = totalScrollDistance * 0.8;
    const scrollProgress = Math.max(
      0,
      Math.min(1, distanceScrolled / effectiveScrollDistance)
    );

    // 应用缓动函数，使动画更平滑
    const easedProgress = easeInOutCubic(scrollProgress);
    
    // 移动端时处理垂直偏移和透明度
    if (isMobile) {
      // 计算移动端垂直偏移
      const newMobileOffsets = initialMobileOffsets.map((initialOffset, index) => {
        // 为每个卡片设定不同的开始时间点，创造层叠效果
        const cardStartPoint = index * 0.15; // 0, 0.15, 0.3
        const cardEndPoint = cardStartPoint + 0.4; // 0.4, 0.55, 0.7
        
        if (easedProgress < cardStartPoint) {
          return initialOffset; // 保持初始状态
        } else if (easedProgress > cardEndPoint) {
          return targetMobileOffsets[index]; // 达到最终状态
        } else {
          // 计算该卡片的进度
          const cardProgress = (easedProgress - cardStartPoint) / (cardEndPoint - cardStartPoint);
          // 应用缓动函数
          const easedCardProgress = easeInOutCubic(cardProgress);
          // 计算当前偏移
          return initialOffset + (targetMobileOffsets[index] - initialOffset) * easedCardProgress;
        }
      });
      
      setMobileVerticalOffsets(newMobileOffsets);
      
      // 在移动端下使用简化的透明度动画
      const newOpacities = initialOpacities.map((_, index) => {
        const cardStartPoint = index * 0.15;
        const cardEndPoint = cardStartPoint + 0.4;
        
        if (easedProgress < cardStartPoint) {
          return 0; // 完全透明
        } else if (easedProgress > cardEndPoint) {
          return 1; // 完全不透明
        } else {
          // 计算该卡片的进度
          const cardProgress = (easedProgress - cardStartPoint) / (cardEndPoint - cardStartPoint);
          // 应用缓动函数
          return easeInOutCubic(cardProgress);
        }
      });
      
      setOpacities(newOpacities);
      return; // 移动端动画单独处理，不执行下面的桌面端动画逻辑
    }

    // 桌面端动画逻辑，保持原有逻辑不变
    // 定义三个阶段，均匀分布在整个滚动过程
    // 阶段1: 0-0.1 - 卡片1到中间态，卡片2开始显示
    // 阶段2: 0.4-0.5 - 卡片1到最终态，卡片2到中间态，卡片3开始显示
    // 阶段3: 0.8-1.0 - 卡片2和卡片3到最终态

    // 新建数组以存储计算后的值
    const newOffsets = [...initialOffsets];
    const newOpacities = [...initialOpacities];
    const newScales = [...initialScales];

    // 阶段1 (0-0.1)
    if (easedProgress <= 0.1) {
      // 将0-0.1映射到0-1
      const phase1Progress = easedProgress / 0.1;
      // 卡片1: 初始态到中间态
      newOffsets[0] =
        initialOffsets[0] +
        (middleOffsets[0] - initialOffsets[0]) * phase1Progress;
      newOpacities[0] =
        initialOpacities[0] +
        (middleOpacities[0] - initialOpacities[0]) * phase1Progress;
      newScales[0] =
        initialScales[0] +
        (middleScales[0] - initialScales[0]) * phase1Progress;

      // 卡片2: 开始部分显示
      newOffsets[1] = initialOffsets[1];
      newOpacities[1] =
        initialOpacities[1] +
        (middleOpacities[1] - initialOpacities[1]) * phase1Progress * 0.1;
      newScales[1] = initialScales[1];

      // 卡片3: 保持初始态
      newOffsets[2] = initialOffsets[2];
      newOpacities[2] = initialOpacities[2];
      newScales[2] = initialScales[2];
    }
    // 20%-40% 静止，保持第一阶段终点
    else if (easedProgress <= 0.4) {
      newOffsets[0] = middleOffsets[0];
      newOpacities[0] = middleOpacities[0];
      newScales[0] = middleScales[0];

      newOffsets[1] = initialOffsets[1];
      newOpacities[1] =
        initialOpacities[1] + (middleOpacities[1] - initialOpacities[1]) * 0.3;
      newScales[1] = initialScales[1];

      newOffsets[2] = initialOffsets[2];
      newOpacities[2] = initialOpacities[2];
      newScales[2] = initialScales[2];
    }
    // 阶段2 (0.4-0.5)
    else if (easedProgress <= 0.5) {
      // 将0.4-0.5映射到0-1
      const phase2Progress = (easedProgress - 0.4) / 0.1;
      // 卡片1: 中间态到最终态
      newOffsets[0] =
        middleOffsets[0] +
        (targetOffsets[0] - middleOffsets[0]) * phase2Progress;
      newOpacities[0] =
        middleOpacities[0] +
        (targetOpacities[0] - middleOpacities[0]) * phase2Progress;
      newScales[0] =
        middleScales[0] + (targetScales[0] - middleScales[0]) * phase2Progress;

      // 卡片2: 初始态(部分显示)到中间态
      newOffsets[1] =
        initialOffsets[1] +
        (middleOffsets[1] - initialOffsets[1]) * phase2Progress;
      newOpacities[1] = 0.1 + (middleOpacities[1] - 0.1) * phase2Progress;
      newScales[1] =
        initialScales[1] +
        (middleScales[1] - initialScales[1]) * phase2Progress;

      // 卡片3: 保持初始态
      newOffsets[2] = initialOffsets[2];
      newOpacities[2] =
        initialOpacities[2] +
        (middleOpacities[2] - initialOpacities[2]) * phase2Progress * 0.1;
      newScales[2] = initialScales[2];
    }
    // 60%-80% 静止，保持第二阶段终点
    else if (easedProgress <= 0.9) {
      newOffsets[0] = targetOffsets[0];
      newOpacities[0] = targetOpacities[0];
      newScales[0] = targetScales[0];

      newOffsets[1] = middleOffsets[1];
      newOpacities[1] = middleOpacities[1];
      newScales[1] = middleScales[1];

      newOffsets[2] = initialOffsets[2];
      newOpacities[2] = middleOpacities[2] * 0.4;
      newScales[2] = initialScales[2];
    }
    // 阶段3 (0.8-1)
    else {
      // 将0.8-1映射到0-1
      const phase3Progress = (easedProgress - 0.9) / 0.1;
      // 卡片1: 保持在最终态
      newOffsets[0] = targetOffsets[0];
      newOpacities[0] = targetOpacities[0];
      newScales[0] = targetScales[0];

      // 卡片2: 中间态到最终态
      newOffsets[1] =
        middleOffsets[1] +
        (targetOffsets[1] - middleOffsets[1]) * phase3Progress;
      newOpacities[1] =
        middleOpacities[1] +
        (targetOpacities[1] - middleOpacities[1]) * phase3Progress;
      newScales[1] =
        middleScales[1] + (targetScales[1] - middleScales[1]) * phase3Progress;

      // 卡片3: 部分显示到最终态
      newOffsets[2] =
        initialOffsets[2] +
        (targetOffsets[2] - initialOffsets[2]) * phase3Progress;
      newOpacities[2] =
        middleOpacities[2] * 0.4 +
        (targetOpacities[2] - middleOpacities[2] * 0.4) * phase3Progress;
      newScales[2] =
        initialScales[2] +
        (targetScales[2] - initialScales[2]) * phase3Progress;
    }

    setHorizontalOffsets(newOffsets);
    setOpacities(newOpacities);
    setScales(newScales);
  }, [isSectionVisible, isMobile]); // 只保留关键依赖，避免无限循环

  // 添加滚动事件监听，使用RAF优化性能
  useEffect(() => {
    let rafId: number;

    // 初始化滚动位置
    lastScrollYRef.current = window.scrollY;

    const onScroll = () => {
      // 检测滚动方向
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollYRef.current) {
        scrollDirectionRef.current = "up";
      } else if (currentScrollY > lastScrollYRef.current) {
        scrollDirectionRef.current = "down";
      }
      lastScrollYRef.current = currentScrollY;

      // 使用 requestAnimationFrame 进行优化
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // 初始调用一次确保初始状态正确
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [handleScroll]);

  const cardData = [
    {
      image: readersCardImage,
      subtitle: "Readers",
      title: "Access Without Overload: Cut Through the Fog.",
      content:
        "Today’s algorithms focus on what makes the most money for their corporate owner, not on the quality of the book or what readers would really like to read. Fableration changes this with a groundbreaking AI discovery function.\n Fableration allows readers to break free from manipulative algorithms and the mindless scrolling they encourage. It allows readers to find and consume the knowledge or entertainment they seek, without losing the ease of digital convenience.\n Fableration also recognises when readers may have been hitting the socials a bit hard. It offers a friendly suggestion that they might want to break away from doom scrolling and read a book!",
      link: "/ourcommunity/0",
      target: "_self",
    },
    {
      image: authorsCardImage,
      subtitle: "Authors",
      title: "Create Without Constraints. Set your writing free.",
      content:
        "Create Without Constraints. Set your writing free. Most writers have at some stage been asked to make changes to their manuscript to reflect someone else’s view of the market. At Fableration, we want writers to write the story they want to write, not constrain their creativity.\n The odds are stacked against any wannabe author. But odds are a symbol of luck or chance. On Fableration, finding an audience is a science not a lottery.\n Fableration creates authentic connections between writers and readers. These are the key to impact, audience and success.",
      link: "/ourcommunity/1",
      target: "_self",
    },
    {
      image: publishersCardImage,
      subtitle: "Publisher",
      title: "Publish Smarter. Lose the Risk, Not the Potential.",
      content:
        "Traditional publishing is a high-risk, low reward endeavour for publishers and the profits from the books that do sell in high volumes offset the losses from the rest.\n Fableration is a new model that encourages publishers to bring a book to market quickly and test the audience, without investing in promotion. This reduces the risk and encourages publishers to take a chance on manuscripts from emerging writers.\n We want to work with publishers to help transform the industry. So if you’re a publisher and would like to know more about Fableration, contact us [info@fableration.com] today.",
      link: "/ourcommunity/2",
      target: "_self",
    },
  ];

  return (
    <div className="our-community-container" ref={containerRef}>
      <div className="our-community-content-wrapper" ref={contentRef}>
        <div className="our-community-title-wrapper">
          <h2
            className="our-community-title"
            style={{
              transition: "transform 0.5s ease-out",
            }}
          >
            <span className="our-community-title-regular">Our </span>
            <span className="our-community-title-bold">Community</span>
          </h2>
        </div>
        <div className="our-community-grid">
          {cardData.map((card, index) => (
            <div
              key={index}
              className={`card-animation-container`}
              style={{
                transform: isMobile 
                  ? `translateY(${mobileVerticalOffsets[index]}px)` 
                  : `translate(${horizontalOffsets[index]}px) scale(${scales[index]})`,
                opacity: opacities[index],
                transition: `transform 0.6s ${
                  scrollDirectionRef.current === "up" ? "ease-in" : "ease-out"
                }, opacity 0.6s ${
                  scrollDirectionRef.current === "up" ? "ease-in" : "ease-out"
                }`,
              }}
            >
              <InfoCard
                image={card.image}
                subtitle={card.subtitle}
                title={card.title}
                content={card.content}
                link={card.link}
                target={card.target as "_blank" | "_self"}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
