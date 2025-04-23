
import { useEffect, useState } from 'react';

export function useAnimatedNumber(target: number, duration = 500) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    let start = value;
    let end = target;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const next = start + (end - start) * progress;
      setValue(Number(next.toFixed(1)));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}
