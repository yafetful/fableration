import React, { useEffect, useState, useRef } from "react";
import { InfoCard } from "./ui/InfoCard";
import { Button } from "./ui/Button";
import writerImage from "../assets/images/write_card.png";
import openSourceImage from "../assets/images/opensource_card.png";
import discoveryImage from "../assets/images/discovery_card.png";
import riskImage from "../assets/images/risk_card.png";
import protectingImage from "../assets/images/protecting_card.png";
import "./Features.css";
import "../styles/animations.css";

export const Features: React.FC = () => {
  const [visibleItems, setVisibleItems] = useState<Record<number, boolean>>({});
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Feature data
  const topFeatures = [
    {
      id: 1,
      title: "Write. Earn. Thrive.",
      content:
        "Fableration is an innovative model that balances scarcity and popularity to ensure a book retains value once it enters the marketplace. It is the secret to enabling authors to earn a fair reward for their work, while ensuring that the most popular books are available and accessible to the widest possible audience.",
      image: writerImage,
      variant: "modern" as const,
      link: "/feature/0",
      target: "_self",
      animationClass: "animate-fade-in delay-100",
    },
    {
      id: 2,
      title: "Not for Profit. Open Source.",
      content:
        "Thanks to smart contracts and Fableration's status as a not-for-profit organisation, the platform delivers fair royalties to authors and publishers.",
      image: openSourceImage,
      link: "/feature/1",
      target: "_self",
      variant: "modern" as const,
      animationClass: "animate-fade-in delay-200",
    },
    {
      id: 3,
      title: "Every Great Read Begins With Discovery.",
      content:
        "Our game-changing AI search function promotes organic discovery and shines a light on work that would otherwise be condemned to darkness",
      image: discoveryImage,
      variant: "modern" as const,
      link: "/feature/2",
      target: "_self",
      animationClass: "animate-fade-in delay-300",
    },
  ];

  const bottomFeatures = [
    {
      id: 4,
      title: "Lose the Risk, Not the Potential.",
      content:
        "Fableration helps publishers find emerging voices, focus on quality, and build sustainable success.",
      image: riskImage,
      variant: "modern" as const,
      link: "/feature/3",
      target: "_self",
      animationClass: "animate-fade-in delay-400",
    },
    {
      id: 5,
      title: "Protecting Perspectives.",
      content:
        "On Fableration, PhiBee - our AI -  is the filter. She provides the opportunity to form more rounded perspectives and acts as the custodian of independence.",
      image: protectingImage,
      variant: "modern" as const,
      link: "/feature/4",
      target: "_self",
      animationClass: "animate-fade-in delay-500",
    },
  ];

  // Calculate button index (after all cards)
  const buttonIndex = topFeatures.length + bottomFeatures.length;

  // When any card becomes visible, check if all cards are visible to show the button
  useEffect(() => {
    // Check if all cards are visible
    const allCardsVisible = Array.from(
      { length: topFeatures.length + bottomFeatures.length },
      (_, i) => visibleItems[i]
    ).every(Boolean);

    // If all cards are visible, show the button after a delay
    if (allCardsVisible) {
      const timer = setTimeout(() => {
        setVisibleItems(prev => ({
          ...prev,
          [buttonIndex]: true
        }));
      }, 800); // Show button after all cards are visible, after a delay of 800ms
      
      return () => clearTimeout(timer);
    }
  }, [visibleItems, topFeatures.length, bottomFeatures.length, buttonIndex]);

  useEffect(() => {
    // Function to check if an element is in viewport
    const isInViewport = (element: HTMLElement): boolean => {
      const rect = element.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
        rect.bottom >= 0
      );
    };

    // Function to handle scroll and show elements
    const handleScroll = () => {
      // Check all elements visibility
      cardRefs.current.forEach((ref, index) => {
        if (ref && !visibleItems[index] && isInViewport(ref)) {
          setVisibleItems(prev => ({
            ...prev,
            [index]: true
          }));
        }
      });
    };

    // Initial check
    handleScroll();

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Touch events for mobile
    window.addEventListener("touchmove", handleScroll, { passive: true });
    window.addEventListener("touchend", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
      window.removeEventListener("touchend", handleScroll);
    };
  }, [visibleItems]);

  // Handle refs assignment
  const assignRef = (el: HTMLDivElement | null, index: number) => {
    cardRefs.current[index] = el;
  };

  return (
    <div className="features-container">
      <h1 className="features-title">A New Chapter in Publishing</h1>
      <div className="features-section">
        <div className="features-grid-top">
          {topFeatures.map((feature, index) => (
            <div
              key={feature.id}
              ref={(el) => assignRef(el, index)}
              className={`feature-card-container ${visibleItems[index] ? feature.animationClass : "opacity-0"}`}
              style={{ transform: "translateZ(0)" }}
            >
              <InfoCard
                title={feature.title}
                content={feature.content}
                image={feature.image}
                variant={feature.variant}
                imagePosition="center"
                link={feature.link}
                target={feature.target as "_blank" | "_self"}
              />
            </div>
          ))}
        </div>
        <div className="features-grid-bottom">
          {bottomFeatures.map((feature, index) => {
            const globalIndex = index + topFeatures.length;
            return (
              <div
                key={feature.id}
                ref={(el) => assignRef(el, globalIndex)}
                className={`feature-card-container ${visibleItems[globalIndex] ? feature.animationClass : "opacity-0"}`}
                style={{ transform: "translateZ(0)" }}
              >
                <InfoCard
                  title={feature.title}
                  content={feature.content}
                  image={feature.image}
                  variant={feature.variant}
                  imagePosition="center"
                  link={feature.link}
                  target={feature.target as "_blank" | "_self"}
                />
              </div>
            );
          })}
        </div>
        <div 
          className={`features-button-container ${visibleItems[buttonIndex] ? "animate-fade-in delay-200" : "opacity-0"}`}
          ref={(el) => assignRef(el, buttonIndex)}
          style={{ transform: "translateZ(0)"}}
        >
          <Button
            variant="slide"
            rounded="full"
            showArrow
            width={320}
            onClick={() => {
              alert("Triggered!");
            }}
          >
            Whitepaper
          </Button>
        </div>
      </div>
    </div>
  );
};
