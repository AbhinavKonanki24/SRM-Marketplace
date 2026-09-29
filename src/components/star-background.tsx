'use client';

import { useEffect, useState } from 'react';

export default function StarBackground() {
  const [stars, setStars] = useState<{ id: number; left: string; top: string; delay: string; duration: string; size: string }[]>([]);

  useEffect(() => {
    // Generate stars on client-side only to prevent hydration mismatch
    const newStars = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 150 - 50}%`, // Start further left for diagonal movement
      top: `${Math.random() * -50}%`, // Start higher up
      delay: `${Math.random() * 10}s`,
      duration: `${Math.random() * 5 + 5}s`, // 5 to 10 seconds to fall
      size: `${Math.random() * 2 + 1}px`
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // @ts-ignore
    setStars(newStars);
  }, []);

  if (stars.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[var(--color-background)]">
      {/* Static background stars for depth */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
      
      {/* Falling stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white opacity-0 animate-falling-star shadow-[0_0_8px_2px_rgba(255,255,255,0.4)]"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration
          }}
        >
          {/* Tail of the shooting star */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 h-[60px] w-[1px] bg-gradient-to-t from-white/80 to-transparent origin-bottom -translate-y-full"
          />
        </div>
      ))}
    </div>
  );
}
