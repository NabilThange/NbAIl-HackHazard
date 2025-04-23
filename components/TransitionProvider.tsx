"use client"; // Add this directive

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import barba from '@barba/core';
import gsap from 'gsap';

// Define the namespaces for pages that should have transitions
const TRANSITION_PAGES = ['home', 'features', 'pricing', 'research', 'use-cases'];

// --- Reusable Leave Animation ---
const leaveAnimation = (container: HTMLElement): Promise<void> => {
  const tl = gsap.timeline();
  tl.to(container, {
    opacity: 0,
    x: '-50px',
    duration: 0.4,
    ease: 'power1.in',
  });
  return tl.then(); // Return promise from timeline
};

// --- Pricing Page Enter Animation ---
const pricingEnter = (container: HTMLElement): Promise<void> => {
  window.scrollTo(0, 0);
  const tl = gsap.timeline();
  // Initial state
  tl.set(container, {
      opacity: 0,
      y: '100px', // Start from bottom
      skewY: 5, // Slight skew
      transformOrigin: 'bottom left'
  });
  // Animation
  tl.to(container, {
    opacity: 1,
    y: '0px',
    skewY: 0,
    duration: 0.7,
    ease: 'power2.out',
    delay: 0.2,
  });
  return tl.then();
};

// --- Use Cases Page Enter Animation (Clip Path) ---
const useCasesEnter = (container: HTMLElement): Promise<void> => {
    window.scrollTo(0, 0);
    const tl = gsap.timeline();
    // Initial state: fully clipped
    tl.set(container, {
        opacity: 1, // Make sure it's visible before clip-path animates
        clipPath: 'circle(0% at 50% 50%)'
    });
    // Animation: expand circle
    tl.to(container, {
        clipPath: 'circle(75% at 50% 50%)', // 75% covers most screens, adjust if needed
        duration: 0.8,
        ease: 'power2.inOut',
        delay: 0.1,
    });
    return tl.then();
};

// --- Default Enter Animation ---
const defaultEnter = (container: HTMLElement): Promise<void> => {
  window.scrollTo(0, 0);
  const tl = gsap.timeline();
  // Initial state
  tl.set(container, {
    opacity: 0,
    x: '50px',
  });
  // Animation
  tl.to(container, {
    opacity: 1,
    x: '0px',
    duration: 0.6,
    ease: 'power1.out',
    delay: 0.2,
  });
  return tl.then();
};

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Ensure this code runs only in the browser
    if (typeof window !== 'undefined') {
      if (document.body.hasAttribute('data-barba-initialized')) return;
      document.body.setAttribute('data-barba-initialized', 'true');

      barba.init({
        debug: process.env.NODE_ENV === 'development',
        prevent: ({ el }) => {
            if (el.hasAttribute('target') && el.getAttribute('target') === '_blank') return true;
            const href = el.getAttribute('href');
            if (!href || !href.startsWith('/')) return true;
            const isTransitionLink = href === '/' || TRANSITION_PAGES.some(page => href.startsWith(`/${page}`) && page !== 'home');
            if (!isTransitionLink) return true;
            return false;
        },
        transitions: [
          // --- Pricing Transition ---
          {
            name: 'pricing-special',
            from: { namespace: TRANSITION_PAGES },
            to: { namespace: ['pricing'] },
            leave: ({ current }) => leaveAnimation(current.container),
            enter: ({ next }) => pricingEnter(next.container),
          },
          // --- Use Cases Transition ---
          {
            name: 'use-cases-special',
            from: { namespace: TRANSITION_PAGES },
            to: { namespace: ['use-cases'] },
            leave: ({ current }) => leaveAnimation(current.container),
            enter: ({ next }) => useCasesEnter(next.container),
          },
          // --- Default Transition (for home, features, research) ---
          {
            name: 'default-fade-slide',
            from: { namespace: TRANSITION_PAGES },
            to: { namespace: ['home', 'features', 'research'] },
            leave: ({ current }) => leaveAnimation(current.container),
            enter: ({ next }) => defaultEnter(next.container),
          }
        ],
      });

      // Cleanup
      return () => {
        // Ensure Barba is destroyed only if it was initialized in the browser
        if (barba.destroy) {
          barba.destroy();
          document.body.removeAttribute('data-barba-initialized');
        }
      };
    }
  }, [router]); // Add router to dependency array

  // The wrapper div that Barba needs
  return (
    <div data-barba="wrapper">
      {children}
    </div>
  );
} 