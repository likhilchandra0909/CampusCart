import { useEffect, useRef } from 'react';

/**
 * Attaches IntersectionObserver to a container ref and toggles
 * the 'visible' class on any child that has a reveal class.
 * Works on both scroll-down AND scroll-up.
 */
export function useScrollReveal(options = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const { threshold = 0.15, rootMargin = '0px 0px -60px 0px' } = options;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else {
            // Remove on scroll-out so re-entry re-animates
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold, rootMargin }
    );

    const container = containerRef.current;
    if (!container) return;

    const revealEls = container.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-zoom'
    );
    revealEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return containerRef;
}

/**
 * Observe a single ref element directly.
 */
export function useRevealRef(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const { threshold = 0.15, rootMargin = '0px 0px -60px 0px' } = options;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
        } else {
          el.classList.remove('visible');
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
