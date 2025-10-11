import React from 'react';
import '../resources/about.css';
import Partners from '../components/partners';

const About = () => {
  const handleBookNow = () => {
    window.location.href = '/';
  };

  return (
    <>
      <div className="about-container">
        {/* Dark Overlay */}
        <div className="overlay"></div>

        {/* Content Container */}
        <div className="content-wrapper">
          
          {/* Main Heading */}
          <h1 className="main-heading">
            TRAVEL SMARTER,<br />RIDE BETTER
          </h1>

          {/* Subtitle */}
          <p className="subtitle">
            Explore Zambia with ease — book your next trip online and enjoy 
            affordable, comfortable journeys across every major city.
          </p>

          {/* Features Grid */}
          <div className="features-grid">
            
            {/* Feature 1 - Cheapest Prices */}
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3 className="feature-title">Cheapest Prices</h3>
              <p className="feature-description">
                
              </p>
            </div>

            {/* Feature 2 - Safety Assured */}
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3 className="feature-title">Safety Assured</h3>
              <p className="feature-description">
               
              </p>
            </div>

            {/* Feature 3 - 24/7 Support */}
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3 className="feature-title">24/7 Customer Support</h3>
              <p className="feature-description">
                
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <button onClick={handleBookNow} className="cta-button">
            READY TO BOOK
          </button>
        </div>
      </div>

      {/* Partners Section */}
      <Partners />
    </>
  );
};

export default About;
