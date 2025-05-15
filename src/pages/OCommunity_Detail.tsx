import React, { useEffect, useRef, useState } from "react";
import { Navbar } from "../components/ui/Navbar";
import "./ocommunity.css";
import SocialButton from "../components/ui/SocialButton";
import Footer from "../components/Footer";
import "../styles/animations.css";
import { InfoCard } from "../components/ui/InfoCard";
import { useMediaQuery } from 'react-responsive';
import { useParams, useNavigate } from 'react-router-dom';
import readersCardImage from "../assets/images/readers_card.png";
import authorsCardImage from "../assets/images/authors_card.png";
import publishersCardImage from "../assets/images/publishers_card.png";
import arrow from "../assets/icons/arrow_down.svg";

const CommunityDetail: React.FC = () => {
  // Get the id from URL params
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  // Create a state to keep track of the current community section
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [animation, setAnimation] = useState<'in'|'out'|null>(null);
  const [direction, setDirection] = useState<'up'|'down'|'left'|'right'>('up');
  const [nextIndex, setNextIndex] = useState<number|null>(null);

  // 判断是否为移动端
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Define all community card data
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

  // 同步URL参数到当前索引
  useEffect(() => {
    const parsedId = id ? parseInt(id, 10) : 0;
    if (!isNaN(parsedId) && parsedId >= 0 && parsedId < cardData.length) {
      setCurrentCardIndex(parsedId);
    }
  }, [id, cardData.length]);

  // 切换动画
  const handleSwitch = (targetIndex: number, dir: 'up'|'down'|'left'|'right') => {
    setDirection(dir);
    setAnimation('out');
    setNextIndex(targetIndex);
    // 更新URL
    navigate(`/ourcommunity/${targetIndex}`);
  };

  const goToPreviousCard = () => {
    if (currentCardIndex === 0) return;
    if (isMobile) {
      handleSwitch(currentCardIndex - 1, 'right');
    } else {
      handleSwitch(currentCardIndex - 1, 'up');
    }
  };

  const goToNextCard = () => {
    if (currentCardIndex === cardData.length - 1) return;
    if (isMobile) {
      handleSwitch(currentCardIndex + 1, 'left');
    } else {
      handleSwitch(currentCardIndex + 1, 'down');
    }
  };

  // 动画结束后切换内容
  const handleAnimationEnd = () => {
    if (animation === 'out' && nextIndex !== null) {
      setCurrentCardIndex(nextIndex);
      setAnimation('in');
    } else if (animation === 'in') {
      setAnimation(null);
      setNextIndex(null);
    }
  };

  // 创建各个部分的引用
  const heroRef = useRef<HTMLDivElement>(null);
  const cardSectionRef = useRef<HTMLDivElement>(null);
  const buttonSectionRef = useRef<HTMLDivElement>(null);

  // 添加滚动监听，触发动画
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // 为已经可见的元素移除监听
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -100px 0px" } // 当元素20%进入视口时触发，底部有100px的缓冲区
    );

    // 监听英雄区域
    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    // 监听特性区域
    if (cardSectionRef.current) {
      observer.observe(cardSectionRef.current);
    }

    // 监听按钮区域
    if (buttonSectionRef.current) {
      observer.observe(buttonSectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Get the current card to display
  const currentCard = cardData[currentCardIndex];

  // 动画className
  let animationClass = '';
  if (animation === 'out') {
    if (direction === 'up') animationClass = 'ocommunity-slide-out-down';
    if (direction === 'down') animationClass = 'ocommunity-slide-out-up';
    if (direction === 'left') animationClass = 'ocommunity-slide-out-left';
    if (direction === 'right') animationClass = 'ocommunity-slide-out-right';
  } else if (animation === 'in') {
    if (direction === 'up') animationClass = 'ocommunity-slide-in-down';
    if (direction === 'down') animationClass = 'ocommunity-slide-in-up';
    if (direction === 'left') animationClass = 'ocommunity-slide-in-right';
    if (direction === 'right') animationClass = 'ocommunity-slide-in-left';
  }

  return (
    <div className="ocommunity-container">
      <Navbar />
      <main 
        ref={heroRef} 
        className="oc-hero opacity-0"
        data-animation="animate-fade-in"
        data-delay="delay-200"
      >
        <h1>
          <span className="ocommunity-hero-large-title">Our</span>{" "}
          <span className="ocommunity-hero-small-title">Community</span>
        </h1>
      </main>

      <div className="ocommunity-content-row">
        <div className="ocommunity-navigation">
          <div className="ocommunity-navigation-buttons">
            <SocialButton 
              icon={arrow} 
              onClick={goToPreviousCard}
              target="_self"
              disabled={currentCardIndex === 0 || animation !== null}
            />
            <SocialButton 
              icon={arrow} 
              onClick={goToNextCard}
              target="_self"
              disabled={currentCardIndex === cardData.length - 1 || animation !== null}
            />
          </div>
        </div>
        <div
          ref={cardSectionRef}
          className={`ocommunity-content-container ${animationClass}`}
          onAnimationEnd={handleAnimationEnd}
        >
          <InfoCard
            image={currentCard.image}
            subtitle={currentCard.subtitle}
            title={currentCard.title}
            content={currentCard.content}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CommunityDetail; 