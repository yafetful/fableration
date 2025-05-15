import React, { useEffect, useRef, useState } from "react";
import { Navbar } from "../components/ui/Navbar";
import "./feature.css";
import { Button } from "../components/ui/Button";
import SocialButton from "../components/ui/SocialButton";
import Footer from "../components/Footer";
import "../styles/animations.css";
import writeImg from "../assets/images/features/write.png";
import discoveryImg from "../assets/images/features/discovery.png";
import riskImg from "../assets/images/features/risk.png";
import protectingImg from "../assets/images/features/protecting.png";
import opensourceImg from "../assets/images/features/opensource.png";
import arrow from "../assets/icons/arrow_down.svg";
import { useMediaQuery } from 'react-responsive';
import { useParams, useNavigate } from 'react-router-dom';

interface FeatureSectionProps {
  title: string;
  subtitle: string;
  text: string;
  image: string;
  className?: string;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  subtitle,
  text,
  image,
  className,
}) => (
  <section className={`feature-section ${className || ""}`}>
    <div className="feature-section-left">
      <h1 className="feature-section-title">
        <span className="feature-section-title-bold">{title}</span>{" "}
        <span className="feature-section-title-light">{subtitle}</span>
      </h1>
      <div className="feature-section-text">
        {text.split("\n").map((line, idx) => (
          <React.Fragment key={idx}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </div>
    </div>
    <div className="feature-section-right">
      <img src={image} alt="feature" className="feature-section-image" />
    </div>
  </section>
);

const Features: React.FC = () => {
  // Get the id from URL params
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  // Create a state to keep track of the current feature section
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [animation, setAnimation] = useState<'in'|'out'|null>(null);
  const [direction, setDirection] = useState<'up'|'down'|'left'|'right'>('up');
  const [nextIndex, setNextIndex] = useState<number|null>(null);

  // 判断是否为移动端
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Define all feature sections data
  const featureSections = [
    {
      title: "Write.",
      subtitle: "Earn. Thrive.",
      text: `Most writers have at some stage been asked to make changes to their manuscript to reflect someone else's view of the market. At Fableration, we want writers to write the story they want to write, not constrain their creativity. We want to free the world from 'same' and give readers more choice and more content.\nThe odds are stacked against any wannabe author. But Fableration asks why there should be any talk of odds at all. Odds are a symbol of luck or chance. On Fableration, finding an audience is a science not a lottery.\nWe can't force readers to buy books that others haven't enjoyed reading, but we can at least give readers a chance to make up their own minds. Fableration's renaissance takes us back to the tried and tested human way of sharing knowledge through communities. The platform creates authentic connections between writers and readers, and these are the key to impact, audience and success.`,
      image: writeImg,
    },
    {
      title: "Not for Profit.",
      subtitle: "Open Source.",
      text: `Fableration is a not-for-profit platform that reinvests its excess revenue into emerging authors and bringing audiences to new work, rather than syphoning profits away from the industry. And being open source, Fableration brings the opportunity for its own community to move the platform forward and adopt—or not—new features that have been developed by other members of the community.\nFableration brings Web3 energy to an industry that has long been dominated by opaque systems that concentrate profits at the point of sale and leave creators undervalued. With transparency, equity, and community at its core, Fableration empowers writers, fosters discovery, and ensures value flows more fairly to those who create.\nFableration is blockchain of the people, by the people, for the people.`,
      image: opensourceImg,
    },
    {
      title: "Every Great Read Begins With",
      subtitle: "Discovery.",
      text: `Today's algorithms focus on what makes the most money for their corporate owner, not on the quality of the book or what readers would really like to read. These same algorithms confine our thinking and manipulate our ability to form perspectives. They suck us into a maelstrom of doom scrolling that drowns all but the strongest swimmers.\nFableration changes this with a game-changing AI search function and an innovative process to drive organic discovery. Together, they will shine a light on work that would otherwise be condemned to darkness. Why? Because every great read begins with discovery.`,
      image: discoveryImg,
    },
    {
      title: "Lose the Risk,",
      subtitle: "Not the Potential.",
      text: `From a publisher's perspective, taking a book to market is a high-risk endeavour. This is because a publisher must invest in polishing a manuscript into its final form as a book, launch a wholesale marketing effort, and invest in a print run. And all this happens without any certainty that the book will succeed in the market. As a direct consequence, for every success there are countless failures, and these eat into the profitability of the business. In other words, the profits from the books that sell in high numbers offset the losses from the rest.\nWhat publishers need is a more cost-effective and lower risk path to market, and a longer lifespan for each book. eBooks should be a ready-made tool to solve this problem, but the way they have been designed and used means they simply replicate the existing challenges faced by physical books.\nFableration's unique AI-led discovery means that good books find an audience without the need for investment in marketing. And our focus on the digital reading experience increases the popularity of eBooks and improves their market penetration. The end result is that publishers can afford to take a chance on a wider range of manuscripts and help uncover emerging talent. Our message to publishers is Publish smarter. Lose the risk, not the potential. After all, this is their renaissance too.`,
      image: riskImg,
    },
    {
      title: "Protecting",
      subtitle: "Perspectives.",
      text: `On Fableration, PhiBee - our ethical AI - allows readers to cut through the fog and break free from manipulative algorithms and mindless scrolling.\nShe protects readers' perspectives and allows them to find and consume the knowledge or entertainment they seek, without losing the ease of digital convenience.\nFableration gives readers access without overload and allows them to see what they want to see. It is truly a breath of fresh AIr.`,
      image: protectingImg,
    },
  ];

  // 同步URL参数到当前索引
  useEffect(() => {
    const parsedId = id ? parseInt(id, 10) : 0;
    if (!isNaN(parsedId) && parsedId >= 0 && parsedId < featureSections.length) {
      setCurrentFeatureIndex(parsedId);
    }
  }, [id, featureSections.length]);

  // 切换动画
  const handleSwitch = (targetIndex: number, dir: 'up'|'down'|'left'|'right') => {
    setDirection(dir);
    setAnimation('out');
    setNextIndex(targetIndex);
    // 更新URL
    navigate(`/feature/${targetIndex}`);
  };

  const goToPreviousFeature = () => {
    if (currentFeatureIndex === 0) return;
    if (isMobile) {
      handleSwitch(currentFeatureIndex - 1, 'right');
    } else {
      handleSwitch(currentFeatureIndex - 1, 'up');
    }
  };

  const goToNextFeature = () => {
    if (currentFeatureIndex === featureSections.length - 1) return;
    if (isMobile) {
      handleSwitch(currentFeatureIndex + 1, 'left');
    } else {
      handleSwitch(currentFeatureIndex + 1, 'down');
    }
  };

  // 动画结束后切换内容
  const handleAnimationEnd = () => {
    if (animation === 'out' && nextIndex !== null) {
      setCurrentFeatureIndex(nextIndex);
      setAnimation('in');
    } else if (animation === 'in') {
      setAnimation(null);
      setNextIndex(null);
    }
  };

  // 创建各个部分的引用
  const heroRef = useRef<HTMLDivElement>(null);
  const featureSectionRef = useRef<HTMLDivElement>(null);
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
    if (featureSectionRef.current) {
      observer.observe(featureSectionRef.current);
    }

    // 监听按钮区域
    if (buttonSectionRef.current) {
      observer.observe(buttonSectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Get the current feature to display
  const currentFeature = featureSections[currentFeatureIndex];

  // 动画className
  let animationClass = '';
  if (animation === 'out') {
    if (direction === 'up') animationClass = 'feature-slide-out-down';
    if (direction === 'down') animationClass = 'feature-slide-out-up';
    if (direction === 'left') animationClass = 'feature-slide-out-left';
    if (direction === 'right') animationClass = 'feature-slide-out-right';
  } else if (animation === 'in') {
    if (direction === 'up') animationClass = 'feature-slide-in-down';
    if (direction === 'down') animationClass = 'feature-slide-in-up';
    if (direction === 'left') animationClass = 'feature-slide-in-right';
    if (direction === 'right') animationClass = 'feature-slide-in-left';
  }

  return (
    <div className="feature-container">
      <Navbar />
      <main
        ref={heroRef}
        className="feature-hero opacity-0"
        data-animation="animate-fade-in"
        data-delay="delay-200"
      >
        <div className="feature-hero-item"></div>
        <h1>
          <span className="feature-hero-large-title">Product</span>{" "}
          <span className="feature-hero-small-title">Features</span>
        </h1>
      </main>

      <div className="feature-content-row">
        <div className="feature-navigation">
          <div className="navigation-buttons">
            <SocialButton 
              icon={arrow} 
              onClick={goToPreviousFeature}
              target="_self"
              disabled={currentFeatureIndex === 0 || animation !== null}
            />
            <SocialButton 
              icon={arrow} 
              onClick={goToNextFeature}
              target="_self"
              disabled={currentFeatureIndex === featureSections.length - 1 || animation !== null}
            />
          </div>
        </div>
        <div
          ref={featureSectionRef}
          className={`feature-content-container ${animationClass}`}
          onAnimationEnd={handleAnimationEnd}
        >
          <FeatureSection
            title={currentFeature.title}
            subtitle={currentFeature.subtitle}
            text={currentFeature.text}
            image={currentFeature.image}
          />
        </div>
      </div>

      <div
        ref={buttonSectionRef}
        className="feature-section-button opacity-0"
        data-animation="animate-fade-in"
        data-delay="delay-400"
      >
        <h1>
          <span className="feature-button-large-title">Want the detail? </span>{" "}
          <span className="feature-button-small-title">
            Read our Whitepaper
          </span>
        </h1>
        <Button
          variant="slide"
          rounded="full"
          showArrow
          width={400}
          onClick={() => {
            alert("Triggered!");
          }}
        >
          Whitepaper
        </Button>
      </div>
      <Footer />
    </div>
  );
};

export default Features;
