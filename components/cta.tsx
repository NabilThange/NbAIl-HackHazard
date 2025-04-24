"use client"

import React from "react";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="grid place-content-center gap-2 bg-black px-8 py-24 text-white">
      <FlipLink href="https://x.com/NabilThange">Twitter</FlipLink>
      <FlipLink href="https://www.linkedin.com/in/nabil-thange/">Linkedin</FlipLink>
      <FlipLink href="https://github.com/NabilThange">Github</FlipLink>
      <FlipLink href="#">Instagram</FlipLink>
    </section>
  );
};
//trigger animation on hover

const DURATION = 0.25;
const STAGGER = 0.025;

const FlipLink = ({ children, href }: { children: string; href: string }) => {
  return (
    <motion.a
      initial="initial"
      whileHover="hovered"
      href={href}
      className="relative block overflow-hidden whitespace-nowrap text-4xl font-black uppercase sm:text-7xl md:text-8xl lg:text-9xl"
      style={{
        lineHeight: 0.75,
      }}
    >
      <div>
        {children.split("").map((l, i) => (
          <motion.span
            variants={{
              initial: {
                y: 0,
              },
              hovered: {
                y: "-100%",
              },
            }}
            transition={{
              duration: DURATION,
              ease: "easeInOut",
              delay: STAGGER * i,
            }}
            className="inline-block"
            key={i}
          >
            {l}
          </motion.span>
        ))}
      </div>
      <div className="absolute inset-0">
        {children.split("").map((l, i) => (
          <motion.span
            variants={{
              initial: {
                y: "100%",
              },
              hovered: {
                y: 0,
              },
            }}
            transition={{
              duration: DURATION,
              ease: "easeInOut",
              delay: STAGGER * i,
            }}
            className="inline-block"
            key={i}
          >
            {l}
          </motion.span>
        ))}
      </div>
    </motion.a>
  );
};
