import React, { useEffect, useRef } from "react";
import { Navbar } from "../components/ui/Navbar";
import Footer from "../components/Footer";
import VisionCard from "../components/ui/VisionCard";
import "./about.css";
import visionImg from "../assets/images/about_img_1.png";
import "../styles/animations.css";

const About: React.FC = () => {
  // Create references for each section
  const heroRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const visionImgRef = useRef<HTMLDivElement>(null);
  const visionCardsRef = useRef<HTMLDivElement>(null);
  const visionTextRef = useRef<HTMLDivElement>(null);

  // Add scroll listener to trigger animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // Remove observer for visible elements
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -100px 0px" } // Trigger when element is 20% in viewport, 100px buffer at bottom
    );

    // Observe all related elements
    const refs = [heroRef, infoRef, visionImgRef, visionCardsRef, visionTextRef];
    refs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      refs.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  return (
    <div className="about-container">
      <Navbar />
      <main className="about-content">
        <div 
          ref={heroRef} 
          className="about-hero-text opacity-0"
          data-animation="animate-fade-in"
          data-delay="delay-200"
        >
          <h1>
            <span className="about-title-light">About</span>{" "}
            <span className="about-title-bold">Fableration</span>
          </h1>
        </div>

        <div 
          ref={infoRef}
          className="about-info-content opacity-0"
          data-animation="animate-fade-in"
          data-delay="delay-600"
        >
          <h2>
            <span className="highlight">What</span> is Fableration?
          </h2>
          <h3>
            Fableration is a storytelling and knowledge-sharing community where
            everyone benefits.
          </h3>
          <p>
            It is a not-for-profit, open-source platform that combines AI-driven
            objectivity with the power of human connection.
          </p>
          <p>
            PhiBee, our AI agent, acts as both guardian and guide—protecting
            readers from distorted perspectives while steering them toward
            affordable, transformative content and deeper, more balanced
            insights.
          </p>
        </div>
      </main>

      <div className="vision-section-container">
        <div className="vision-section">
          <div 
            ref={visionImgRef}
            className="vision-image-column opacity-0"
            data-animation="animate-fade-in"
          >
            <img src={visionImg} alt="vision" className="vision-image" />
          </div>

          <div 
            ref={visionCardsRef}
            className="vision-cards-column opacity-0"
            data-animation="animate-fade-in"
            data-delay="delay-200"
          >
            <VisionCard
              title="Our Vision"
              subtitle="We Are Leading A Knowledge Renaissance."
            />

            <VisionCard
              title="Our Mission"
              subtitle="To Build A Connected Community That Democratises Storytelling And Makes Knowledge More Accessible To All."
            />
          </div>

          <div 
            ref={visionTextRef}
            className="vision-text-column opacity-0"
            data-animation="animate-fade-in"
            data-delay="delay-400"
          >
            <VisionCard
              title="What makes us unique?"
              subtitle={`Fableration transforms books into powerful tools for connection and growth in a mutually beneficial community.

It empowers authors and publishers with fair royalties, and provides readers with access to affordable, transformative content.

The platform integrates emerging technology, including the scalable objectivity and independence of Artificial Intelligence, with the human strength of community.

Fableration protects readers from distorted perspectives and steers them towards more valuable and balanced insights.`}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
