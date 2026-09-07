// components/HorizontalScroll.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';

const HorizontalScroll = ({ 
  children, 
  speed = 3000,
  gap = 24,
  className = '',
  cardWidth = 320
}) => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  let [scrollLeft, setScrollLeft] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const animationRef = useRef(null);
  const dragDistanceRef = useRef(0);
  
  const childrenArray = React.Children.toArray(children);
  const totalItems = childrenArray.length;

  // Calculate visible items count
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 80;
        const itemTotalWidth = cardWidth + gap;
        const count = Math.max(1, Math.floor(containerWidth / itemTotalWidth));
        setVisibleCount(count);
      }
    };
    
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, [cardWidth, gap]);

  // Get visible items with circular logic - FIXED KEYS
  const getVisibleItems = useCallback(() => {
    const items = [];
    const start = currentIndex;
    const visibleItemsCount = Math.min(visibleCount, totalItems);
    
    for (let i = 0; i < visibleItemsCount; i++) {
      const index = (start + i) % totalItems;
      const element = childrenArray[index];
      // Use a combination of index and a unique counter to ensure uniqueness
      // When currentIndex changes, we want React to treat these as new items
      // but we also need unique keys within the same render
      const uniqueKey = `item-${index}-${currentIndex}-${i}-${Date.now()}`;
      
      items.push({
        index,
        element,
        key: uniqueKey
      });
    }
    return items;
  }, [currentIndex, visibleCount, totalItems, childrenArray]);

  const visibleItems = getVisibleItems();

  // Scroll functions
  const scrollToIndex = useCallback((newIndex, smooth = true) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex(newIndex);
    
    if (trackRef.current) {
      if (smooth) {
        trackRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      } else {
        trackRef.current.style.transition = 'none';
      }
    }
    
    setTimeout(() => {
      setIsTransitioning(false);
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      }
    }, 500);
  }, [isTransitioning]);

  const scrollRight = useCallback(() => {
    const newIndex = (currentIndex + 1) % totalItems;
    scrollToIndex(newIndex, true);
  }, [currentIndex, totalItems, scrollToIndex]);

  scrollLeft = useCallback(() => {
    const newIndex = (currentIndex - 1 + totalItems) % totalItems;
    scrollToIndex(newIndex, true);
  }, [currentIndex, totalItems, scrollToIndex]);

  // Auto-scroll
  useEffect(() => {
    const autoScroll = () => {
      if (!isHovering && !isDragging && !isTransitioning) {
        scrollRight();
      }
      animationRef.current = setTimeout(autoScroll, speed);
    };
    
    animationRef.current = setTimeout(autoScroll, speed);
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isHovering, isDragging, isTransitioning, speed, scrollRight]);

  // Mouse drag handling
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(currentIndex);
    dragDistanceRef.current = 0;
    
    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX);
    dragDistanceRef.current = walk;
    
    if (trackRef.current) {
      const offset = walk * 0.3;
      trackRef.current.style.transform = `translateX(${offset}px)`;
    }
  };

  const handleMouseUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 50;
    
    if (Math.abs(dragDistanceRef.current) > threshold) {
      if (dragDistanceRef.current > 0) {
        scrollLeft();
      } else {
        scrollRight();
      }
    } else {
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 0.3s ease';
        trackRef.current.style.transform = 'translateX(0)';
      }
    }
    
    dragDistanceRef.current = 0;
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 0.3s ease';
        trackRef.current.style.transform = 'translateX(0)';
      }
    }
    setIsHovering(false);
  };

  // Touch handling for mobile
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
    setScrollLeft(currentIndex);
    dragDistanceRef.current = 0;
    
    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const walk = (x - startX);
    dragDistanceRef.current = walk;
    
    if (trackRef.current) {
      const offset = walk * 0.3;
      trackRef.current.style.transform = `translateX(${offset}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 50;
    
    if (Math.abs(dragDistanceRef.current) > threshold) {
      if (dragDistanceRef.current > 0) {
        scrollLeft();
      } else {
        scrollRight();
      }
    } else {
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 0.3s ease';
        trackRef.current.style.transform = 'translateX(0)';
      }
    }
    
    dragDistanceRef.current = 0;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') scrollRight();
      if (e.key === 'ArrowLeft') scrollLeft();
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      container.tabIndex = 0;
    }
    
    return () => {
      if (container) {
        container.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [scrollLeft, scrollRight]);

  return (
    <div 
      className={`horizontal-scroll-container ${className}`}
      ref={containerRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div 
        className="horizontal-scroll-track"
        ref={trackRef}
        style={{ 
          display: 'flex',
          gap: `${gap}px`,
          transform: 'translateX(0)',
          transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        {visibleItems.map((item) => (
          <div 
            key={item.key}
            className="horizontal-scroll-item"
            style={{ 
              flex: `0 0 ${cardWidth}px`,
              minWidth: `${cardWidth}px`
            }}
          >
            {item.element}
          </div>
        ))}
      </div>
      
      {/* Navigation Arrows */}
      <button 
        className="scroll-arrow scroll-left"
        onClick={scrollLeft}
        aria-label="Scroll left"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      
      <button 
        className="scroll-arrow scroll-right"
        onClick={scrollRight}
        aria-label="Scroll right"
      >
        <i className="fas fa-chevron-right"></i>
      </button>

      {/* Dots indicator */}
      <div className="scroll-dots">
        {childrenArray.map((_, index) => (
          <button
            key={`dot-${index}`}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => scrollToIndex(index, true)}
            aria-label={`Go to item ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HorizontalScroll;