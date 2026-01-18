import { useCallback } from 'react';

export const useHapticFeedback = () => {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const vibrate = useCallback((pattern: number | number[]) => {
    if (isSupported) {
      navigator.vibrate(pattern);
    }
  }, [isSupported]);

  // Light tap - for small actions
  const lightTap = useCallback(() => {
    vibrate(10);
  }, [vibrate]);

  // Medium tap - for task completion
  const mediumTap = useCallback(() => {
    vibrate(25);
  }, [vibrate]);

  // Success pattern - for completing all tasks
  const successPattern = useCallback(() => {
    vibrate([30, 50, 30, 50, 50]);
  }, [vibrate]);

  // Heavy tap - for important actions
  const heavyTap = useCallback(() => {
    vibrate(50);
  }, [vibrate]);

  return {
    isSupported,
    vibrate,
    lightTap,
    mediumTap,
    successPattern,
    heavyTap
  };
};
