import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const ScrollIndicator = () => {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const checkScrollable = () => {
      // Add a small delay to ensure DOM is fully rendered
      setTimeout(() => {
        const documentHeight = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
        const windowHeight = window.innerHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        const isScrollable = documentHeight > windowHeight + 50; // Add buffer
        const isNearBottom = scrollTop + windowHeight >= documentHeight - 100; // More generous bottom detection
        
        console.log('ScrollIndicator Debug:', {
          documentHeight,
          windowHeight,
          scrollTop,
          isScrollable,
          isNearBottom,
          shouldShow: isScrollable && !isNearBottom
        });
        
        setShowIndicator(isScrollable && !isNearBottom);
      }, 100);
    };

    const handleScroll = () => {
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      const windowHeight = window.innerHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      const isScrollable = documentHeight > windowHeight + 50;
      const isNearBottom = scrollTop + windowHeight >= documentHeight - 100;
      
      setShowIndicator(isScrollable && !isNearBottom);
    };

    // Initial check with delay
    checkScrollable();
    
    // Add listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkScrollable);
    window.addEventListener('load', checkScrollable);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollable);
      window.removeEventListener('load', checkScrollable);
    };
  }, []);

  const scrollDown = () => {
    window.scrollBy({
      top: window.innerHeight * 0.8,
      behavior: 'smooth'
    });
  };

  if (!showIndicator) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <button
        onClick={scrollDown}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 group"
        aria-label="Scroll down for more content"
      >
        <ChevronDown className="w-5 h-5 animate-bounce group-hover:animate-none" />
      </button>
    </div>
  );
};

export default ScrollIndicator;