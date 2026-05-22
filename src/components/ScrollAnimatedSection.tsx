"use client"

import { useEffect, useRef, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollAnimatedSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

export default function ScrollAnimatedSection({
  children,
  className = "",
  id,
  style
}: ScrollAnimatedSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    const headline = section.querySelector('[data-animate="headline"]');
    const staggerElements = section.querySelectorAll('[data-animate="stagger"]');

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      if (headline) {
        gsap.fromTo(
          headline,
          {
            autoAlpha: 0,
            y: 24,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 84%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      if (staggerElements.length > 0) {
        gsap.fromTo(
          staggerElements,
          {
            autoAlpha: 0,
            y: 22,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            ease: "power2.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: section,
              start: "top 84%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id={id} className={className} style={style}>
      {children}
    </section>
  );
}
