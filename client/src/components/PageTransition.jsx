import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Wraps every routed page so it gets a fresh entrance animation
 * each time the route changes.
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reset animation by forcing a reflow
    el.classList.remove('page-enter');
    void el.offsetWidth; // reflow
    el.classList.add('page-enter');
  }, [location.pathname]);

  return (
    <div ref={ref} className="page-enter" style={{ width: '100%' }}>
      {children}
    </div>
  );
};

export default PageTransition;
