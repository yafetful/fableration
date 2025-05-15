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
        // 获取活跃的公告
        const announcements = await api.announcements.getActive();

        // 如果有公告，取最新的一条
        if (announcements && announcements.length > 0) {
          // 可以根据日期排序，确保获取最新的
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

  // 如果没有公告或正在加载，不显示组件
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
