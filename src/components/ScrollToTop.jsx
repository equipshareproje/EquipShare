import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (window.scrollY > 0) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }
  }, [pathname]);

  return null;
}