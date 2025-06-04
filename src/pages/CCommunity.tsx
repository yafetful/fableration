import React, { useEffect, useRef, useState } from "react";
import { Navbar } from "../components/ui/Navbar";
import Footer from "../components/Footer";
import { GlassButton } from "@/components/ui/GlassButton";
import { Community } from "../components/Community";
import "./ccommunity.css";
import "../styles/animations.css";
import api from "../api";
import type { Blog } from "../api";

interface CompetitionCardProps {
  imageUrl?: string;
  title: string;
  description: string;
  link?: string;
  isVisible?: boolean;
}

// Define API base URL constant
const API_BASE_URL = "";

// Process image URL, add API base URL if it's a relative path
const getFullImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
};

const CompetitionCard: React.FC<CompetitionCardProps> = ({
  imageUrl,
  title,
  description,
  link,
  isVisible,
}) => {
  return (
    <div
      className={`competition-card ${isVisible ? "animate" : ""}`}
      onClick={() => link && window.open(link, "_blank")}
    >
      <div className="competition-image-container">
        <div
          className="competition-image"
          style={
            imageUrl
              ? {
                  backgroundImage: `url(${getFullImageUrl(imageUrl)})`,
                  backgroundSize: "cover",
                }
              : {}
          }
        ></div>
      </div>
      <div className="competition-content">
        <h3 className="competition-title">{title}</h3>
        <p className="competition-description">{description}</p>
      </div>
    </div>
  );
};

const CCommunity: React.FC = () => {
  const communityRef = useRef<HTMLElement>(null);
  const newsContainerRef = useRef<HTMLDivElement>(null);
  const competitionsRef = useRef<HTMLDivElement>(null);
  const [communityVisible, setCommunityVisible] = useState(false);
  const [newsVisible, setNewsVisible] = useState(false);
  const [competitionsVisible, setCompetitionsVisible] = useState(false);

  // Add blog data state
  const [blogs, setBlogs] = useState<Blog[]>([]);
  // Add current category state
  const [activeCategory, setActiveCategory] = useState("All");

  // Get blog data
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await api.blogs.getAll();
        setBlogs(data);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      }
    };

    fetchBlogs();
  }, []);

  // Use IntersectionObserver to monitor element visibility
  useEffect(() => {
    const communityObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCommunityVisible(true);
          communityObserver.unobserve(entries[0].target);
        }
      },
      { threshold: 0.1 }
    );

    const newsObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setNewsVisible(true);
          newsObserver.unobserve(entries[0].target);
        }
      },
      { threshold: 0.1 }
    );

    const competitionsObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCompetitionsVisible(true);
          competitionsObserver.unobserve(entries[0].target);
        }
      },
      { threshold: 0.1 }
    );

    if (communityRef.current) {
      communityObserver.observe(communityRef.current);
    }

    if (newsContainerRef.current) {
      newsObserver.observe(newsContainerRef.current);
    }

    if (competitionsRef.current) {
      competitionsObserver.observe(competitionsRef.current);
    }

    return () => {
      if (communityRef.current) {
        communityObserver.unobserve(communityRef.current);
      }
      if (newsContainerRef.current) {
        newsObserver.unobserve(newsContainerRef.current);
      }
      if (competitionsRef.current) {
        competitionsObserver.unobserve(competitionsRef.current);
      }
    };
  }, []);

  // Filter blogs by category
  const filteredBlogs =
    activeCategory === "All"
      ? blogs
      : blogs.filter((blog) => blog.category === activeCategory);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <div className="ccommunity-container">
      <Navbar />
      <main
        className={`ccommunity-header-content ${
          communityVisible ? "animate" : ""
        }`}
        ref={communityRef}
      >
        <Community isSectionVisible={communityVisible} />
      </main>
      <div
        ref={newsContainerRef}
        className={`ccommunity-news-container ${newsVisible ? "animate" : ""}`}
      >
        <GlassButton
          variant="simple"
          onClick={() => handleCategoryChange("All")}
          size="md"
        >
          All
        </GlassButton>
        <GlassButton
          variant="simple"
          onClick={() => handleCategoryChange("Blogs")}
          size="md"
        >
          Blog
        </GlassButton>
        <GlassButton
          variant="simple"
          onClick={() => handleCategoryChange("News")}
          size="md"
        >
          News
        </GlassButton>
      </div>
      <div className="competitions-container" ref={competitionsRef}>
        <div className="competitions-grid">
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog) => (
              <CompetitionCard
                key={blog.id}
                title={blog.title || ''}
                description={blog.summary || ''}
                link={blog.externalLink || (blog.slug ? `/blog/${blog.slug}` : '')}
                imageUrl={blog.imageUrl}
                isVisible={competitionsVisible}
              />
            ))
          ) : (
            <div className="no-content">
              <p>No content available in this category.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CCommunity;
