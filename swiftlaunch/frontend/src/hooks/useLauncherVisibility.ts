import { useEffect } from 'react';
import { useSearchStore } from '../state/useSearchStore.js';
import { useUiStore } from '../state/useUiStore.js';

export function useLauncherVisibility() {
  const resetTransient = useSearchStore((state) => state.resetTransient);
  const setIsVisible = useUiStore((state) => state.setIsVisible);

  useEffect(() => {
    const handleFocus = () => {
      setIsVisible(true);
      resetTransient();
    };

    const handleBlur = () => {
      // Optional: keep track of visibility
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setIsVisible(true);
        resetTransient();
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [resetTransient, setIsVisible]);
}
