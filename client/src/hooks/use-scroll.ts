import { useState, useEffect } from 'react';

export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScrollPosition = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }
      
      lastScrollY = currentScrollY;
    };

    const handleScroll = () => {
      requestAnimationFrame(updateScrollPosition);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return { scrollY, scrollDirection };
}

export function useScrollTrigger(threshold: number = 300) {
  const { scrollY, scrollDirection } = useScrollPosition();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  useEffect(() => {
    // Always show at top
    if (scrollY < 100) {
      setSidebarVisible(true);
      return;
    }
    
    // Show sidebars when scrolling down significantly (content consumption mode)
    if (scrollY > threshold && scrollDirection === 'down') {
      setSidebarVisible(true);
    }
    
    // Hide sidebars when scrolling up (navigation mode)
    if (scrollY > threshold && scrollDirection === 'up') {
      setSidebarVisible(false);
    }
  }, [scrollY, scrollDirection, threshold]);
  
  return {
    scrollY,
    scrollDirection,
    sidebarVisible,
    isAtTop: scrollY < 100,
    scrollProgress: Math.min(scrollY / 1000, 1) // Progress indicator
  };
}