import React, { useEffect, useState } from "react";
import "./Announcement.css";
import api from "../api";
import type { Announcement as AnnouncementType } from "../api";

export const Announcement: React.FC = () => {
  const [announcement, setAnnouncement] = useState<AnnouncementType | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        // Get active announcements
        const announcements = await api.announcements.getActive();

        // If there are announcements, get the latest one
        if (announcements && announcements.length > 0) {
          // Sort by date to ensure getting the latest
          const latestAnnouncement = announcements.sort(
            (a, b) =>
              new Date(b.createdAt || "").getTime() -
              new Date(a.createdAt || "").getTime()
          )[0];

          setAnnouncement(latestAnnouncement);
        }
      } catch (error) {
        console.error("Failed to fetch announcement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, []);

  // If there are no announcements or loading, don't display the component
  if (loading || !announcement) {
    return null;
  }

  return (
    <div className="announcement-container">
      {announcement.url && (
        <a
          href={announcement.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="container mx-auto">
            <div className="announcement-content">{announcement.title}</div>
          </div>
        </a>
      )}
    </div>
  );
};
