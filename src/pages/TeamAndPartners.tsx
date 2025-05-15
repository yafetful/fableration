import React, { useEffect, useRef } from "react";
import { Navbar } from "../components/ui/Navbar";
import Footer from "../components/Footer";
import { InfoCard } from "../components/ui/InfoCard";
import "./teamandpartners.css";
import "../styles/animations.css";

// Import team members and partners images
import phiBeeImg from "../assets/images/team/PhiBee_Paige.png";
import simonImg from "../assets/images/team/Simon_Harding.png";
import garyImg from "../assets/images/team/Gary_Budden.png";
import andrewImg from "../assets/images/team/Andrew_Zhou.png";
import lisaImg from "../assets/images/team/Lisa_Wade.png";
import heathImg from "../assets/images/team/Heath_Donald.png";
import arianImg from "../assets/images/team/Arian_Sohi.png";
import samanthaImg from "../assets/images/team/Prof_Samantha_Rayner.png";
import miriamImg from "../assets/images/team/Dr_Miriam_Johnson.png";
import lizImg from "../assets/images/team/Dr_Liz_Monument.png";
import josephineImg from "../assets/images/team/Josephine_Monger.png";

// Partner images
import partner1Img from "../assets/images/Partners/1.png";
import partner2Img from "../assets/images/Partners/2.png";
import partner3Img from "../assets/images/Partners/3.png";
import partner4Img from "../assets/images/Partners/4.png";
import partner5Img from "../assets/images/Partners/5.png";
import partner6Img from "../assets/images/Partners/6.png";
import partner7Img from "../assets/images/Partners/7.png";
import partner8Img from "../assets/images/Partners/8.png";
import partner9Img from "../assets/images/Partners/9.png";

const TeamAndPartners: React.FC = () => {
  // Create references for each section
  const heroRef = useRef<HTMLDivElement>(null);
  const teamTitleRef = useRef<HTMLDivElement>(null);
  const featuredTeamGridRef = useRef<HTMLDivElement>(null);
  const regularTeamGridRef = useRef<HTMLDivElement>(null);
  const partnersTitleRef = useRef<HTMLDivElement>(null);
  const partnersGridRef = useRef<HTMLDivElement>(null);
  
  // Create references for cards
  const featuredCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const regularCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const partnerCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Add scroll listener to trigger animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add visible class to trigger animation
            entry.target.classList.add("visible");
            
            // Remove observer for visible elements
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.1,  // Trigger when element is 10% in viewport
        rootMargin: "0px 0px -50px 0px" // Adjust trigger range, 50px buffer at bottom
      }
    );

    // Observe all related elements
    const refs = [
      heroRef,
      teamTitleRef,
      featuredTeamGridRef,
      regularTeamGridRef,
      partnersTitleRef,
      partnersGridRef,
    ];
    
    refs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });
    
    // Observe each card element to create sequential appearance effect
    featuredCardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    
    regularCardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    
    partnerCardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      // Clean up observer
      observer.disconnect();
    };
  }, []);

  // Main team members data (first three members)
  const featuredTeamMembers = [
    {
      id: 1,
      name: "PhiBee Paige",
      role: "",
      image: phiBeeImg,
      description:
        "PhiBee is our AI. She helps writers find an audience. She helps readers discover their next read. She is the guardian and guide for the entire Fableration community.",
    },
    {
      id: 2,
      name: "Simon Harding",
      role: "",
      image: simonImg,
      description:
        "Simon Harding is a professional writer and the CEO of Fableration. He has clocked up more than 20 years as a senior leader in NASDAQ, FTSE, and ASX-listed companies (20+ years), is a twice-published author and holds an MBA from Latrobe University. ",
    },
    {
      id: 3,
      name: "Lisa Wade",
      role: "",
      image: lisaImg,
      description:
        "Lisa is Fableration's Chief Community Officer. She is the 2024 Australian Female Fintech Leader of the Year, and is a pioneering force in both traditional banking and digital assets.\n With a three-decade career in global finance, Lisa has consistently been at the forefront of innovation and impact.\n As a pioneering force in both traditional banking and digital assets, she has transformed complex financial concepts into tangible market solutions, bridging the gap between legacy systems and the future of finance.",
    },
  ];

  // Regular team members data
  const regularTeamMembers = [
    {
      id: 4,
      name: "Andrew Zhou",
      role: "Chief Technology Officer",
      image: andrewImg,
      description: "",
    },
    {
      id: 5,
      name: "Heath Donald",
      role: "Head Of Marketing",
      image: heathImg,
      description: "",
    },
    {
      id: 6,
      name: "Gary Budden",
      role: "Head Of Industry Engagement",
      image: garyImg,
      description:
        "• Co-founder of Influx Press, an award-winning UK independent publisher\n• Author of Hollow Shores, Judderman (as D.A. Northwood), London Incognita, The White Heron Beneath the Reactor\n• Co-author of These Towers Will One Day Slip Into the Sea with artist Maxim Griffin",
    },
    {
      id: 7,
      name: "Arian Sohi",
      role: "Head Of Design",
      image: arianImg,
      description:
        "• 12 years of experience in UX/UI design, animation, and brand storytelling\n• Known for transforming big ideas into intuitive, character-driven experiences\n• Bridges technology and creativity to make every user feel part of the story",
    },
    {
      id: 8,
      name: "Prof. Samantha Rayner",
      role: "Advisor",
      image: samanthaImg,
      description:
        "• Professor Of Publishing And Book Cultures, Vice Dean Wellbeing At University College London\n• Co-Director Of The Bookselling Research Network\n• Research Fellow At The Institute Of English Studies\n• General Editor For Cambridge University Press Publishing Mini-Monographs",
    },
    {
      id: 9,
      name: "Dr Miriam Johnson",
      role: "Advisor",
      image: miriamImg,
      description:
        "• Founder of The Istanbul Review and second-hand bookseller\n• Worked with Scottish PEN and Scottish Book Trust\n• Developed Echoes of the City, an immersive literature project with Edinburgh UNESCO City of Literature\n• Research focuses on creative writing, publishing, and social media's impact on authorship and digital communities",
    },
    {
      id: 10,
      name: "Dr Liz Monument",
      role: "Advisor",
      image: lizImg,
      description:
        "• PhD in creative writing\n• Professional editor and writing coach\n• Freelance editor with clients like HarperCollins and Jericho Writers\n• Fabel community contributor, developing AI quality control for author submissions and guiding Fabel's leadership on the publishing market",
    },
    {
      id: 11,
      name: "Josephine Monger",
      role: "Advisor",
      image: josephineImg,
      description:
        "• Specialist In Customer Centricity And Strategy Development\n• 20+ Years Of Experience In Executive And Leadership Roles In Prominent Australian Businesses\n• Guides Fabel's Strategy To Ensure The Best Customer Experience On The Platform",
    },
  ];

  // Partners data
  const partners = [
    { id: 1, image: partner1Img, link: "https://www.influxpress.com/" },
    { id: 2, image: partner2Img, link: "https://www.leschenaultpress.com/" },
    { id: 3, image: partner3Img, link: "https://bluemoosebooks.com/" },
    { id: 4, image: partner4Img, link: "https://renardpress.com/" },
    { id: 5, image: partner5Img, link: "https://www.cloudtechgroup.com/" },
    { id: 6, image: partner6Img, link: "https://www.writingwa.org/" },
    { id: 7, image: partner7Img, link: "https://invisiblepublishing.com/" },
    { id: 8, image: partner8Img, link: "https://www.cipherpress.co.uk/" },
    { id: 9, image: partner9Img, link: "https://deadinkbooks.com/" },
  ];
  
  // Initialize references array
  useEffect(() => {
    // Create new references array, length matches data array
    featuredCardRefs.current = Array(featuredTeamMembers.length).fill(null);
    regularCardRefs.current = Array(regularTeamMembers.length).fill(null);
    partnerCardRefs.current = Array(partners.length).fill(null);
  }, [featuredTeamMembers.length, regularTeamMembers.length, partners.length]);

  // Calculate animation delay
  const getAnimationDelay = (index: number, baseDelay: number = 0) => {
    // Base delay + card index * 100ms
    const delayValue = 300 + baseDelay + (index * 150);
    return `${delayValue}ms`;
  };

  // Control marquee logic
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    // Get marquee element
    const marqueeContent = document.querySelector('.partners-marquee-content') as HTMLElement | null;
    if (!marqueeContent) return;
    
    // Adjust animation speed - adjust based on partner count
    const itemCount = partners.length;
    const animationDuration = Math.max(15, itemCount * 3); // Minimum 15 seconds, each partner 3 seconds
    
    marqueeContent.style.animationDuration = `${animationDuration}s`;
    
    // Adjust when window size changes
    const handleResize = () => {
      // If less than 1024px, don't handle marquee
      if (window.innerWidth < 1024) return;
      
      const marqueeContainer = document.querySelector('.partners-marquee-container');
      if (marqueeContainer) {
        marqueeContainer.classList.add('partners-marquee-visible');
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [partners.length]);

  return (
    <div className="team-container">
      <Navbar />
      <main className="team-header-content">
        <div
          ref={heroRef}
          className="team-hero-text opacity-0"
          style={{ transitionDelay: "200ms" }}
        >
          <h1>
            <span className="team-title-light">Team &</span>{" "}
            <span className="team-title-bold">Partners</span>
          </h1>
        </div>
      </main>

      <div className="team-content">
        <div
          ref={teamTitleRef}
          className="section-title opacity-0"
          style={{ transitionDelay: "200ms" }}
        >
          <h2>Team</h2>
        </div>

        {/* Main team members - Large image layout */}
        <div
          ref={featuredTeamGridRef}
          className="featured-team-grid"
        >
          {featuredTeamMembers.map((member, index) => {
            const delay = getAnimationDelay(index, 0);
            return (
              <div 
                key={member.id}
                ref={(el: HTMLDivElement | null) => { featuredCardRefs.current[index] = el; }}
                className="card-container"
                style={{ transitionDelay: delay }}
              >
                <InfoCard
                  image={member.image}
                  title={member.name}
                  subtitle={member.role}
                  content={member.description}
                  variant="team"
                  team_image_size="large"
                  backgroundColor="#E0E8FF"
                />
              </div>
            );
          })}
        </div>

        {/* Regular team members - Small image layout */}
        <div
          ref={regularTeamGridRef}
          className="regular-team-grid"
        >
          {regularTeamMembers.map((member, index) => {
            const delay = getAnimationDelay(index, 100);
            return (
              <div 
                key={member.id}
                ref={(el: HTMLDivElement | null) => { regularCardRefs.current[index] = el; }}
                className="card-container"
                style={{ transitionDelay: delay }}
              >
                <InfoCard
                  image={member.image}
                  title={member.name}
                  subtitle={member.role}
                  content={member.description}
                  variant="team"
                  team_image_size="small"
                  backgroundColor="#E0E8FF"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="partners-section">
        <div
          ref={partnersTitleRef}
          className="section-title opacity-0"
          style={{ transitionDelay: "200ms" }}
        >
          <h2>Partners</h2>
        </div>

        {/* PC marquee effect */}
        <div className="partners-marquee-container">
          <div className="partners-marquee">
            <div className="partners-marquee-content">
              {partners.map((partner) => (
                <a 
                  key={`marquee-1-${partner.id}`}
                  href={partner.link} 
                  className="partner-card-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="partner-card">
                    <img src={partner.image} alt={`Partner ${partner.id}`} />
                  </div>
                </a>
              ))}
              {/* Repeat content to create infinite scroll */}
              {partners.map((partner) => (
                <a 
                  key={`marquee-2-${partner.id}`}
                  href={partner.link} 
                  className="partner-card-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="partner-card">
                    <img src={partner.image} alt={`Partner ${partner.id}`} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {/* Mobile grid layout */}
        <div
          ref={partnersGridRef}
          className="partners-grid-mobile"
        >
          {partners.map((partner, index) => {
            const delay = getAnimationDelay(index, 200);
            return (
              <a 
                key={partner.id}
                href={partner.link}
                className="partner-card-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div 
                  ref={(el: HTMLDivElement | null) => { partnerCardRefs.current[index] = el; }}
                  className="partner-card-container"
                  style={{ transitionDelay: delay }}
                >
                  <div className="partner-card">
                    <img src={partner.image} alt={`Partner ${partner.id}`} />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TeamAndPartners;
