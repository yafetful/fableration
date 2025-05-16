import React, { useEffect, useRef, useState } from "react";
import { Navbar } from "../components/ui/Navbar";
import "./ocommunity.css";
import Footer from "../components/Footer";
import "../styles/animations.css";
import { InfoCard } from "../components/ui/InfoCard";
import readersCardImage from "../assets/images/readers_card.png";
import authorsCardImage from "../assets/images/authors_card.png";
import publishersCardImage from "../assets/images/publishers_card.png";

const OurCommunity: React.FC = () => {
  // Create references for each section
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [animatedCards, setAnimatedCards] = useState<{[key: number]: boolean}>({});

  // Card data
  const cardData = [
    {
      image: readersCardImage,
      subtitle: "Readers",
      title: "Access Without Overload: Cut Through the Fog.",
      content:
        "Today's algorithms focus on what makes the most money for their corporate owner, not on the quality of the book or what readers would really like to read. Fableration changes this with a groundbreaking AI discovery function.\n\n Fableration allows readers to break free from manipulative algorithms and the mindless scrolling they encourage. It allows readers to find and consume the knowledge or entertainment they seek, without losing the ease of digital convenience.\n\n Fableration also recognises when readers may have been hitting the socials a bit hard. It offers a friendly suggestion that they might want to break away from doom scrolling and read a book!",
      link: "/ourcommunity/0",
      target: "_self",
    },
    {
      image: authorsCardImage,
      subtitle: "Authors",
      title: "Create Without Constraints. Set your writing free.",
      content:
        "Create Without Constraints. Set your writing free. Most writers have at some stage been asked to make changes to their manuscript to reflect someone else's view of the market. At Fableration, we want writers to write the story they want to write, not constrain their creativity.\n\n The odds are stacked against any wannabe author. But odds are a symbol of luck or chance. On Fableration, finding an audience is a science not a lottery.\n\n Fableration creates authentic connections between writers and readers. These are the key to impact, audience and success.",
      link: "/ourcommunity/1",
      target: "_self",
    },
    {
      image: publishersCardImage,
      subtitle: "Publisher",
      title: "Publish Smarter. Lose the Risk, Not the Potential.",
      content:
        "Traditional publishing is a high-risk, low reward endeavour for publishers and the profits from the books that do sell in high volumes offset the losses from the rest.\n\n Fableration is a new model that encourages publishers to bring a book to market quickly and test the audience, without investing in promotion. This reduces the risk and encourages publishers to take a chance on manuscripts from emerging writers.\n\n We want to work with publishers to help transform the industry. So if you're a publisher and would like to know more about Fableration, contact us [info@fableration.com] today.",
      link: "/ourcommunity/2",
      target: "_self",
    },
  ];

  // Add scroll listener to trigger animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Determine which card
            if (entry.target.classList.contains('ocommunity-card')) {
              const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
              setAnimatedCards(prev => ({...prev, [index]: true}));
            } else {
              entry.target.classList.add("visible");
            }
            // Remove observer for visible elements
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" } // Trigger when element is 20% in viewport, 50px buffer at bottom
    );

    // Observe hero section
    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    // Observe card container
    if (cardsContainerRef.current) {
      observer.observe(cardsContainerRef.current);
    }

    // Observe all cards
    document.querySelectorAll('.ocommunity-card').forEach(card => {
      observer.observe(card);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

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
      
      <div ref={cardsContainerRef} className="ocommunity-cards-container">
        {cardData.map((card, index) => (
          <div 
            key={index}
            data-index={index}
            className={`ocommunity-card ${animatedCards[index] ? 'ocommunity-slide-in-up' : 'opacity-0'}`}
            style={{ animationDelay: `${(index + 1) * 200}ms` }}
          >
            <InfoCard
              image={card.image}
              subtitle={card.subtitle}
              title={card.title}
              content={card.content}
            />
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default OurCommunity; 