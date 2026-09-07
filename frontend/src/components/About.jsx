// frontend/src/components/About.jsx
import React, { useEffect, useState } from 'react';
import { fetchAboutContent } from '../api/contentApi';

const About = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await fetchAboutContent();
        setContent(data);
      } catch (error) {
        console.error('Error loading about content:', error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  if (loading) {
    return <div className="about-loading">Loading...</div>;
  }

  const defaultFeatures = [
    { title: 'Quality Assurance', description: 'Rigorous quality control at every stage' },
    { title: 'On-Time Delivery', description: 'Projects completed within schedule' },
    { title: 'Sustainable Building', description: 'Eco-friendly materials and practices' }
  ];

  const features = content?.features || defaultFeatures;
  
  // image_1 = main image, image_2 = overlay image
  const mainImageUrl = content?.main_image_url || '/images/about-1.jpg';
  const overlayImageUrl = content?.overlay_image_url || '/images/about-2.jpg';

  return (
    <section className="about">
      <div className="about-container">
        <div className="about-image">
          <div className="about-image-wrapper">
            <div className="about-image-main">
              <img 
                src={mainImageUrl} 
                alt={content?.image_1_alt || 'Construction site'} 
                onError={(e) => {
                  e.target.src = '/images/about-1.jpg';
                }}
              />
            </div>
            <div className="about-image-overlay">
              <img 
                src={overlayImageUrl} 
                alt={content?.image_2_alt || 'Architecture design'}
                onError={(e) => {
                  e.target.src = '/images/about-2.jpg';
                }}
              />
            </div>
          </div>
        </div>
        <div className="about-content">
          <span className="about-tag">{content?.tag || 'About Us'}</span>
          <h2 dangerouslySetInnerHTML={{ 
            __html: content?.title || 'Building Excellence <span>Since 2010</span>' 
          }} />
          <p>{content?.description || 'BuildPort is a full-service construction company dedicated to delivering superior quality, innovation, and reliability. We bring your vision to life with precision craftsmanship and sustainable practices.'}</p>
          <div className="about-features">
            {features.map((feature, index) => (
              <div key={index} className="feature">
                <i className={`fas ${index === 0 ? 'fa-check-circle' : index === 1 ? 'fa-clock' : 'fa-leaf'}`}></i>
                <div>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary">
            Learn More <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default About;