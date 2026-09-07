// frontend/src/components/Contact.jsx
import React, { useEffect, useState } from 'react';
import { fetchContactContent } from '../api/contentApi';

const Contact = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await fetchContactContent();
        setContent(data);
      } catch (error) {
        console.error('Error loading contact content:', error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  if (loading) {
    return <div className="contact-loading">Loading...</div>;
  }

  return (
    <section className="contact">
      <div className="contact-container">
        <div className="contact-info">
          <h2>
            Let's <span>Build</span> Together
          </h2>
          <p>
            Have a project in mind? Get in touch with our team for a 
            free consultation and quote.
          </p>
          <div className="contact-details">
            <div className="contact-item">
              <i className="fas fa-phone-alt"></i>
              <div>
                <h4>Phone</h4>
                <p>{content?.phone || '+1 (555) 123-4567'}</p>
              </div>
            </div>
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <div>
                <h4>Email</h4>
                <p>{content?.email || 'info@buildport.com'}</p>
              </div>
            </div>
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <div>
                <h4>Address</h4>
                <p>{content?.address || '123 Construction Ave, Suite 200'}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="contact-form-wrapper">
          <form className="contact-form">
            <div className="form-group">
              <input type="text" placeholder="Full Name" required />
            </div>
            <div className="form-group">
              <input type="email" placeholder="Email Address" required />
            </div>
            <div className="form-group">
              <input type="text" placeholder="Phone Number" />
            </div>
            <div className="form-group">
              <select>
                <option value="">Project Type</option>
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
                <option>Renovation</option>
              </select>
            </div>
            <div className="form-group">
              <textarea placeholder="Tell us about your project..." rows="4"></textarea>
            </div>
            <button type="submit" className="btn-primary">
              <i className="fas fa-paper-plane"></i> Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;