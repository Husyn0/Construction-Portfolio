// frontend/src/components/Hero.jsx
import React, { useEffect, useState } from 'react';
import { fetchHeroContent } from '../api/contentApi';

const Hero = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await fetchHeroContent();
        setContent(data);
      } catch (error) {
        console.error('Error loading hero content:', error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  if (loading) {
    return <div className="hero-loading">Loading...</div>;
  }

  // Use image_1 as main background, fallback to default
  const heroImageUrl = content?.hero_image_url || '/images/Home.jpg';

  const heroStyle = {
    backgroundImage: `url(${heroImageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    position: 'relative'
  };

  return (
    <section className="hero" style={heroStyle}>
      <div className="hero-overlay" />
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <i className="fas fa-trophy"></i>
            <span>{content?.badge || '2026 Award Winner'}</span>
          </div>
          <h1 dangerouslySetInnerHTML={{ 
            __html: content?.title || 'Built with <span>precision</span> & integrity' 
          }} />
          <p>{content?.description || 'From concept to completion — we deliver commercial, residential, and industrial projects that stand the test of time.'}</p>
          <div className="hero-actions">
            <button className="btn-primary">
              <i className="fas fa-arrow-right"></i> View Portfolio
            </button>
            <button className="btn-secondary">
              <i className="fas fa-calendar-alt"></i> Free Consultation
            </button>
          </div>
          <div className="hero-stats">
            {content?.stats?.map((stat, index) => (
              <div key={index} className="stat">
                <span className="stat-number">{stat.number}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;