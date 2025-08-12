import React, { useState, useEffect, useRef } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface LazyLoadProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  placeholder,
  threshold = 0.1,
  rootMargin = "0px 0px -100px 0px",
  className = ""
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isVisible, elementRef } = useScrollAnimation({
    threshold,
    rootMargin,
    triggerOnce: true
  });

  useEffect(() => {
    if (isVisible && !isLoaded) {
      // Add a small delay to simulate loading
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isLoaded]);

  const defaultPlaceholder = (
    <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading...</div>
    </div>
  );

  return (
    <div ref={elementRef} className={className}>
      {isLoaded ? (
        <div className={`transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}>
          {children}
        </div>
      ) : (
        placeholder || defaultPlaceholder
      )}
    </div>
  );
};

