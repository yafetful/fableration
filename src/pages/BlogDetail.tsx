import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import type { Blog } from '../api';
import { Navbar } from '../components/ui/Navbar';
import Footer from '../components/Footer';
import styles from './BlogDetail.module.css';

interface ExtendedBlog extends Omit<Blog, 'referenceArticles' | 'tags'> {
  logoName?: string;
  logoUrl?: string;
  authorName?: string;
  avatarUrl?: string;
  authorBio?: string;
  coverImage?: string;
  tags?: Array<{ id: number; name: string; color: string }>;
  referenceArticles?: Array<{ 
    id: number; 
    title: string; 
    slug: string; 
    summary: string; 
    imageUrl?: string;
    createdAt?: string;
    externalLink?: string;
    tags?: Array<{ id: number; name: string; color: string }>;
  }>;
}

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<ExtendedBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(0.2); // 默认20%

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!slug) throw new Error('No blog slug');
        const data = await api.blogs.getById(slug);
        setBlog(data as ExtendedBlog);
      } catch (err: any) {
        setError(err.message || 'Failed to load blog');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  useEffect(() => {
    if (blog && (blog.coverImage || blog.imageUrl)) {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.naturalHeight / img.naturalWidth;
        setImageAspectRatio(aspectRatio);
      };
      img.onerror = () => {
        setImageAspectRatio(0.2); // 默认比例
      };
      img.src = blog.coverImage || blog.imageUrl || '';
    }
  }, [blog]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!blog) return <div className="p-8 text-center">No blog found.</div>;

  return (
    <div className={styles.blogDetailContainer}>
      <Navbar />
      <div 
        className={styles.blogDetailHeader}
        style={{
          backgroundImage: `url(${blog.coverImage || blog.imageUrl || '/src/assets/images/community_bg.png'})`,
          paddingBottom: `${imageAspectRatio * 100}%`
        }}
      >
        <h1 className={styles.blogDetailHeaderTitle}>{blog.title}</h1>
      </div>
      
      {blog.logoName && (
        <div className={styles.logoSection}>
          <div className={styles.logoContainer}>
            {blog.logoUrl && (
              <img 
                src={blog.logoUrl} 
                alt={blog.logoName} 
                className={styles.logoImage}
              />
            )}
          </div>
          <div className={styles.logoInfo}>
            <div className={styles.logoName}>{blog.logoName}</div>
            <div className={styles.logoDate}>
              {new Date(blog.createdAt || '').toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      )}
      
      <main className={styles.blogDetailMain}>
        <div className={styles.blogDetailCard}>
          <div className={styles.blogDetailContent}>
            {blog.content && (
              <div className={styles.blogDetailProse} dangerouslySetInnerHTML={{ __html: blog.content }} />
            )}
            
            {blog.authorName && (
              <div className={styles.authorSection}>
                <div className={styles.authorInfo}>
                  {blog.avatarUrl && (
                    <img 
                      src={blog.avatarUrl} 
                      alt={blog.authorName || 'Author'} 
                      className={styles.authorAvatar}
                    />
                  )}
                  <div className={styles.authorDetails}>
                    <h3>Written by {blog.authorName}</h3>
                    <div className={styles.authorTitle}>
                      {blog.authorBio || 'Content Creator at Fableration'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {blog.referenceArticles && blog.referenceArticles.length > 0 && (
        <section className={styles.referenceArticles}>
          <h3>You Might Also Like</h3>
          <div className={styles.articleGrid}>
            {blog.referenceArticles.map(article => {
              // 如果有外部链接，使用 a 标签在新窗口打开
              if (article.externalLink) {
                return (
                  <a
                    key={article.id}
                    href={article.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.referenceCard}
                  >
                    {article.imageUrl && (
                      <img 
                        src={article.imageUrl} 
                        alt={article.title} 
                        className={styles.referenceImage}
                      />
                    )}
                    <div className={styles.referenceContent}>
                      <h4>{article.title}</h4>
                      <p>{article.summary}</p>
                      <div className={styles.referenceFooter}>
                        <span className={styles.referenceCategory}>
                          {article.tags && article.tags.length > 0 
                            ? article.tags[0].name 
                            : 'Deep Dives'
                          }
                        </span>
                        <span className={styles.referenceDate}>
                          {article.createdAt 
                            ? new Date(article.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: '2-digit'
                              })
                            : new Date().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: '2-digit'
                              })
                          }
                        </span>
                      </div>
                    </div>
                  </a>
                );
              }
              
              // 没有外部链接，使用 Link 组件跳转到站内详情页
              return (
                <Link 
                  key={article.id} 
                  to={`/blog/${article.slug}`} 
                  className={styles.referenceCard}
                >
                  {article.imageUrl && (
                    <img 
                      src={article.imageUrl} 
                      alt={article.title} 
                      className={styles.referenceImage}
                    />
                  )}
                  <div className={styles.referenceContent}>
                    <h4>{article.title}</h4>
                    <p>{article.summary}</p>
                    <div className={styles.referenceFooter}>
                      <span className={styles.referenceCategory}>
                        {article.tags && article.tags.length > 0 
                          ? article.tags[0].name 
                          : 'Deep Dives'
                        }
                      </span>
                      <span className={styles.referenceDate}>
                        {article.createdAt 
                          ? new Date(article.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: '2-digit'
                            })
                          : new Date().toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: '2-digit'
                            })
                        }
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
      
      <Footer />
    </div>
  );
};

export default BlogDetail; 