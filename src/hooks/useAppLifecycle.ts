import { useEffect, useRef } from 'react';

export function useAppLifecycle() {
  const isMounted = useRef(true);

  useEffect(() => {
    // Handle app visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App is hidden, pause intensive operations
        console.log('App hidden - pausing intensive operations');
      } else {
        // App is visible, resume operations
        console.log('App visible - resuming operations');
      }
    };

    // Handle page focus/blur
    const handleFocus = () => {
      console.log('App focused');
    };

    const handleBlur = () => {
      console.log('App blurred');
    };

    // Handle memory pressure
    const handleMemoryPressure = () => {
      console.log('Memory pressure detected - consider cleanup');
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Memory pressure listener (if available)
    if ('memory' in performance && 'onpressure' in window) {
      window.addEventListener('memorypressure', handleMemoryPressure);
    }

    // Cleanup function
    return () => {
      isMounted.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      
      if ('memory' in performance && 'onpressure' in window) {
        window.removeEventListener('memorypressure', handleMemoryPressure);
      }
    };
  }, []);

  return { isMounted: isMounted.current };
}
