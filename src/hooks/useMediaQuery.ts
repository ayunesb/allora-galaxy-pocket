
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);
  
  useEffect(() => {
    // Initialize with current match state (important for SSR)
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Start listening for changes
    media.addEventListener('change', listener);
    
    // Clean up listener on unmount
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);
  
  return matches;
}
