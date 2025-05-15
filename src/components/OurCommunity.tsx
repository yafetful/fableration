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

  const lastScrollYRef = useRef(0);

  const scrollDirectionRef = useRef<"up" | "down">("down");

  const [isMobile, setIsMobile] = useState(false);

  const initialOffsets = [200, 1200, 1800]; // Adjust initial horizontal offsets to make cards more layered
  const middleOffsets = [0, 32, 64]; // Middle state horizontal offsets, adjusted for a more natural transition distance
  const targetOffsets = [0, 8, 16]; // Final horizontal offsets for cards
  const [horizontalOffsets, setHorizontalOffsets] = useState(initialOffsets);

  const initialOpacities = [0, 0, 0]; // Adjust initial opacity to make first card also have a fade-in effect
  const middleOpacities = [1, 1, 1]; // Middle state opacity
  const targetOpacities = [0.1, 0.2, 1]; // Final opacity
  const [opacities, setOpacities] = useState(initialOpacities);

  const initialScales = [1, 1, 1]; // Adjust initial scale to increase depth
  const middleScales = [1, 1, 1]; // Middle state scale
  const targetScales = [0.8, 0.9, 1]; // Final scale
  const [scales, setScales] = useState(initialScales);

  const initialMobileOffsets = [100, 150, 200]; // Initial vertical offset for mobile
  const targetMobileOffsets = [0, 0, 0]; // Target vertical offset for mobile (no offset)
  const [mobileVerticalOffsets, setMobileVerticalOffsets] = useState(initialMobileOffsets);
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

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const easeInOutCubic = (x: number): number => {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !isSectionVisible) return;

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

    const isInViewport =
      containerRect.top < viewportHeight && containerRect.bottom > 0;

    if (!isInViewport) {
      if (containerRect.bottom <= 0) {
        setHorizontalOffsets(targetOffsets);
        setOpacities(targetOpacities);
        setScales(targetScales);
        if (isMobile) {
          setMobileVerticalOffsets(targetMobileOffsets);
        }
      }
      return;
    }

    const totalScrollDistance = sectionHeight + viewportHeight; // Total scroll distance
    const distanceScrolled = viewportHeight - containerRect.top; // Distance scrolled

    const effectiveScrollDistance = totalScrollDistance * 0.8;
    const scrollProgress = Math.max(
      0,
      Math.min(1, distanceScrolled / effectiveScrollDistance)
    );
    
    const easedProgress = easeInOutCubic(scrollProgress);
    
    if (isMobile) {
      const newMobileOffsets = initialMobileOffsets.map((initialOffset, index) => {
        const cardStartPoint = index * 0.15;
        const cardEndPoint = cardStartPoint + 0.4;
        
        if (easedProgress < cardStartPoint) {
          return initialOffset;
        } else if (easedProgress > cardEndPoint) {
          return targetMobileOffsets[index];
        } else {
          const cardProgress = (easedProgress - cardStartPoint) / (cardEndPoint - cardStartPoint);
          const easedCardProgress = easeInOutCubic(cardProgress);
          return initialOffset + (targetMobileOffsets[index] - initialOffset) * easedCardProgress;
        }
      });
      
      setMobileVerticalOffsets(newMobileOffsets);
      
      const newOpacities = initialOpacities.map((_, index) => {
        const cardStartPoint = index * 0.15;
        const cardEndPoint = cardStartPoint + 0.4;
        
        if (easedProgress < cardStartPoint) {
          return 0;
        } else if (easedProgress > cardEndPoint) {
          return 1;
        } else {
          const cardProgress = (easedProgress - cardStartPoint) / (cardEndPoint - cardStartPoint);
          return easeInOutCubic(cardProgress);
        }
      });
      
      setOpacities(newOpacities);
      return;
    }

    const newOffsets = [...initialOffsets];
    const newOpacities = [...initialOpacities];
    const newScales = [...initialScales];

    if (easedProgress <= 0.1) {
      const phase1Progress = easedProgress / 0.1;
      newOffsets[0] =
        initialOffsets[0] +
        (middleOffsets[0] - initialOffsets[0]) * phase1Progress;
      newOpacities[0] =
        initialOpacities[0] +
        (middleOpacities[0] - initialOpacities[0]) * phase1Progress;
      newScales[0] =
        initialScales[0] +
        (middleScales[0] - initialScales[0]) * phase1Progress;

      newOffsets[1] = initialOffsets[1];
      newOpacities[1] =
        initialOpacities[1] +
        (middleOpacities[1] - initialOpacities[1]) * phase1Progress * 0.1;
      newScales[1] = initialScales[1];

      newOffsets[2] = initialOffsets[2];
      newOpacities[2] = initialOpacities[2];
      newScales[2] = initialScales[2];
    }
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
    else if (easedProgress <= 0.5) {
      const phase2Progress = (easedProgress - 0.4) / 0.1;
      newOffsets[0] =
        middleOffsets[0] +
        (targetOffsets[0] - middleOffsets[0]) * phase2Progress;
      newOpacities[0] =
        middleOpacities[0] +
        (targetOpacities[0] - middleOpacities[0]) * phase2Progress;
      newScales[0] =
        middleScales[0] + (targetScales[0] - middleScales[0]) * phase2Progress;

      newOffsets[1] =
        initialOffsets[1] +
        (middleOffsets[1] - initialOffsets[1]) * phase2Progress;
      newOpacities[1] = 0.1 + (middleOpacities[1] - 0.1) * phase2Progress;
      newScales[1] =
        initialScales[1] +
        (middleScales[1] - initialScales[1]) * phase2Progress;

      newOffsets[2] = initialOffsets[2];
      newOpacities[2] =
        initialOpacities[2] +
        (middleOpacities[2] - initialOpacities[2]) * phase2Progress * 0.1;
      newScales[2] = initialScales[2];
    }
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
    else {
      const phase3Progress = (easedProgress - 0.9) / 0.1;
      newOffsets[0] = targetOffsets[0];
      newOpacities[0] = targetOpacities[0];
      newScales[0] = targetScales[0];

      newOffsets[1] =
        middleOffsets[1] +
        (targetOffsets[1] - middleOffsets[1]) * phase3Progress;
      newOpacities[1] =
        middleOpacities[1] +
        (targetOpacities[1] - middleOpacities[1]) * phase3Progress;
      newScales[1] =
        middleScales[1] + (targetScales[1] - middleScales[1]) * phase3Progress;

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
  }, [isSectionVisible, isMobile]);

  useEffect(() => {
    let rafId: number;

    lastScrollYRef.current = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollYRef.current) {
        scrollDirectionRef.current = "up";
      } else if (currentScrollY > lastScrollYRef.current) {
        scrollDirectionRef.current = "down";
      }
      lastScrollYRef.current = currentScrollY;

      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
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
