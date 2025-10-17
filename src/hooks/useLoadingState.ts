import { useState, useEffect } from 'react';

interface UseLoadingStateOptions {
  /** Initial loading state */
  initialLoading?: boolean;
  /** Minimum loading duration in milliseconds */
  minDuration?: number;
  /** Simulate loading delay */
  delay?: number;
}

/**
 * Custom hook to manage loading states with optional minimum duration
 * Useful for showing loading skeletons for a consistent user experience
 */
export const useLoadingState = (options: UseLoadingStateOptions = {}) => {
  const {
    initialLoading = true,
    minDuration = 800,
    delay = 300,
  } = options;

  const [isLoading, setIsLoading] = useState(initialLoading);

  useEffect(() => {
    if (!initialLoading) return;

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay + minDuration);

    return () => clearTimeout(timer);
  }, [initialLoading, delay, minDuration]);

  return { isLoading, setIsLoading };
};
