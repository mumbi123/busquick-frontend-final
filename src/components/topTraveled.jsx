import React, { useState, useEffect, useRef } from 'react';
import '../resources/topTraveled.css';

const TopTraveled = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const autoScrollIntervalRef = useRef(null);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const allImages = [
    '/gallery/bus1.jpg',
    '/gallery/bus2.jpg',
    '/gallery/bus3.jpg',
    '/gallery/bus4.jpg',
    '/gallery/bus5.jpg',
    '/gallery/bus6.jpg',
    '/gallery/bus7.jpg',
    '/gallery/bus8.jpg',
    '/gallery/bus9.jpg',
    '/gallery/bus10.jpg',
    '/gallery/bus11.jpg',
    '/gallery/intercity1.jpg',
    '/gallery/intercity2.jpg',
    '/gallery/intercity3.jpg',
    '/gallery/intercity4.jpg',
    '/gallery/intercity5.jpg',
    '/gallery/intercity6.jpg',
    '/gallery/art.jpg',
    '/gallery/mwanawasa.jpg',
    '/gallery/rail.jpg',
    '/gallery/sun1.jpg',
    '/gallery/victoria.jpg',
    '/gallery/savana.jpg',
  ];

  // Create an infinite loop by tripling the images
  const displayImages = [...allImages, ...allImages, ...allImages];
  const totalSlides = allImages.length;

  // Start from the middle set
  useEffect(() => {
    setCurrentIndex(totalSlides);
  }, [totalSlides]);

  // Handle infinite loop reset
  useEffect(() => {
    if (currentIndex >= totalSlides * 2) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(totalSlides);
        setTimeout(() => setIsTransitioning(true), 50);
      }, 1000);
    } else if (currentIndex <= 0) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(totalSlides);
        setTimeout(() => setIsTransitioning(true), 50);
      }, 1000);
    }
  }, [currentIndex, totalSlides]);

  // Auto-scroll functionality
  useEffect(() => {
    if (isAutoScrolling) {
      autoScrollIntervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, 5000);
    }

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [isAutoScrolling]);

  const handleScroll = (direction) => {
    setIsAutoScrolling(false);
    setCurrentIndex((prevIndex) => {
      return direction === 'left' ? prevIndex - 1 : prevIndex + 1;
    });
    setTimeout(() => setIsAutoScrolling(true), 7000);
  };

  const handleDotClick = (index) => {
    setIsAutoScrolling(false);
    setCurrentIndex(totalSlides + index);
    setTimeout(() => setIsAutoScrolling(true), 7000);
  };

  // Calculate which dot should be active (normalized to original array)
  const activeDotIndex = ((currentIndex % totalSlides) + totalSlides) % totalSlides;

  // Adjust transform percentage based on screen size
  const cardsPerView = isMobile ? 1 : 2;
  const transformPercentage = (currentIndex * 100) / cardsPerView;

  return (
    <div className="gallery-section">
      <div className="gallery-container">
        <div className="gallery-header">
          <h2 className="gallery-title">Our Fleet Gallery</h2>
          <p className="gallery-subtitle">Experience comfort and luxury on every journey</p>
        </div>
        
        <div className="gallery-wrapper">
          <button 
            className="gallery-arrow gallery-arrow-left"
            onClick={() => handleScroll('left')}
            aria-label="Previous image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="gallery-viewport">
            <div 
              className={`gallery-track ${isTransitioning ? 'transitioning' : ''}`}
              style={{
                transform: `translateX(-${transformPercentage}%)`
              }}
            >
              {displayImages.map((image, index) => (
                <div 
                  key={`${image}-${index}`} 
                  className="gallery-slide"
                >
                  <div className="gallery-image-container">
                    <img 
                      src={image} 
                      alt={`Fleet ${(index % totalSlides) + 1}`}
                      className="gallery-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                      }}
                    />
                    <div className="gallery-image-overlay">
                      <span className="gallery-image-number">{(index % totalSlides) + 1} / {totalSlides}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="gallery-arrow gallery-arrow-right"
            onClick={() => handleScroll('right')}
            aria-label="Next image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="gallery-dots">
          {allImages.map((_, index) => (
            <button
              key={index}
              className={`gallery-dot ${index === activeDotIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>

        <div className="gallery-controls">
          <button 
            className="gallery-toggle-button"
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
          >
            {isAutoScrolling ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="2" width="3" height="12" fill="currentColor" rx="1"/>
                  <rect x="10" y="2" width="3" height="12" fill="currentColor" rx="1"/>
                </svg>
                <span>Pause</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 2L14 8L4 14V2Z" fill="currentColor"/>
                </svg>
                <span>Play</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopTraveled;
