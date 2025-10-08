"use client"

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export default function AnimatedText({
  text,
  className = "",
  delay = 0,
  staggerDelay = 0.03
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chars = containerRef.current.querySelectorAll('.char');

    if (chars.length === 0) return;

    // Set initial state with GSAP.set to ensure proper rendering
    gsap.set(chars, {
      y: 100,
      opacity: 0,
    });

    // Animate with a slight delay to ensure DOM is ready
    gsap.to(chars, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
      stagger: staggerDelay,
      delay: delay,
    });
  }, [delay, staggerDelay, text]);

  // Split text into words and characters
  const words = text.split(' ');

  return (
    <span ref={containerRef} className={cn(className)} style={{ display: 'block' }}>
      {words.map((word, wordIndex) => (
        <span
          key={wordIndex}
          className="inline-block overflow-hidden"
          style={{
            verticalAlign: 'top',
            marginRight: wordIndex < words.length - 1 ? '0.25em' : '0'
          }}
        >
          {word.split('').map((char, charIndex) => (
            <span
              key={charIndex}
              className="char inline-block"
              style={{
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
