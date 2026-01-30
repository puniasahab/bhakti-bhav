import React, { useState, useRef, useEffect } from 'react';

/**
 * Optimized Image Component with lazy loading and placeholder
 */
const OptimizedImage = ({ 
  src, 
  alt = '', 
  className = '', 
  placeholderColor = '#f3f4f6',
  blur = false,
  fallbackSrc = '/img/default-placeholder.png',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: !isLoaded ? placeholderColor : 'transparent' }}
    >
      {/* Placeholder skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
      )}
      
      {/* Actual image - only loads when in view */}
      {isInView && (
        <img
          src={hasError ? fallbackSrc : src}
          alt={alt}
          className={`
            w-full h-full object-cover transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${blur ? 'blur-sm' : ''}
          `}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
