"use client"

import { useState } from "react";
import { LenisProvider } from "@/context/LenisProvider";
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import React, { ReactNode, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion"
import { Mic, Monitor, FileText, Glasses, Brain, History, Zap, Lock, Globe, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SparklesCore } from "@/components/sparkles"
import { FiArrowUpRight } from "react-icons/fi";
import styled from 'styled-components';
import { useLenis } from "@/context/LenisProvider";

// --- Start: New Styled Entry Button Component ---
const StyledEntryButton = () => {
  const { lenis } = useLenis();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    lenis?.scrollTo("#additional-features");
  };

  return (
    <StyledEntryButtonWrapper>
      <a 
        href="#additional-features" 
        onClick={handleClick} 
        className="button type--C"
      > 
        <div className="button__line" />
        <div className="button__line" />
        <span className="button__text">Learn More</span>
        <div className="button__drow1" />
        <div className="button__drow2" />
      </a>
    </StyledEntryButtonWrapper>
  );
}

const StyledEntryButtonWrapper = styled.div`
  /* Copied all styles from user query */
  .type--A {
    --line_color: #555555;
    --back_color: #ffecf6;
  }
  .type--B {
    --line_color: #1b1919;
    --back_color: #e9ecff;
  }
  .type--C {
    --line_color: #9333ea;
    --back_color: #e9d5ff;
  }
  .button {
    position: relative;
    z-index: 0;
    width: 200px;
    height: 40px;
    text-decoration: none;
    font-size: 12px;
    font-weight: bold;
    color: var(--line_color);
    letter-spacing: 2px;
    transition: all 0.3s ease;
    display: flex; 
    justify-content: center;
    align-items: center;
  }
  .button__text {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
  .button::before,
  .button::after,
  .button__text::before,
  .button__text::after {
    content: "";
    position: absolute;
    height: 3px;
    border-radius: 2px;
    background: var(--line_color);
    transition: all 0.5s ease;
  }
  .button::before {
    top: 0;
    left: 50px;
    width: calc(100% - 50px * 2 - 16px);
  }
  .button::after {
    top: 0;
    right: 50px;
    width: 8px;
  }
  .button__text::before {
    bottom: 0;
    right: 50px;
    width: calc(100% - 50px * 2 - 16px);
  }
  .button__text::after {
    bottom: 0;
    left: 50px;
    width: 8px;
  }
  .button__line {
    position: absolute;
    top: 0;
    width: 50px;
    height: 100%;
    overflow: hidden;
  }
  .button__line::before {
    content: "";
    position: absolute;
    top: 0;
    width: 150%;
    height: 100%;
    box-sizing: border-box;
    border-radius: 300px;
    border: solid 3px var(--line_color);
  }
  .button__line:nth-child(1),
  .button__line:nth-child(1)::before {
    left: 0;
  }
  .button__line:nth-child(2),
  .button__line:nth-child(2)::before {
    right: 0;
  }
  .button:hover {
    letter-spacing: 6px;
    background-color: #7e22ce;
    border-radius: 10rem;
  }
  .button:hover::before,
  .button:hover .button__text::before {
    width: 8px;
  }
  .button:hover::after,
  .button:hover .button__text::after {
    width: calc(100% - 50px * 2 - 16px);
  }
  .button:hover .button__icon-wrapper {
    color: #7e22ce;
  }
  .button__drow1,
  .button__drow2 {
    position: absolute;
    z-index: -1;
    border-radius: 16px;
    transform-origin: 16px 16px;
  }
  .button__drow1 {
    top: -16px;
    left: 40px;
    width: 32px;
    height: 0;
    transform: rotate(30deg);
  }
  .button__drow2 {
    top: 44px;
    left: 77px;
    width: 32px;
    height: 0;
    transform: rotate(-127deg);
  }
  .button__drow1::before,
  .button__drow1::after,
  .button__drow2::before,
  .button__drow2::after {
    content: "";
    position: absolute;
  }
  .button__drow1::before {
    bottom: 0;
    left: 0;
    width: 0;
    height: 32px;
    border-radius: 16px;
    transform-origin: 16px 16px;
    transform: rotate(-60deg);
  }
  .button__drow1::after {
    top: -10px;
    left: 45px;
    width: 0;
    height: 32px;
    border-radius: 16px;
    transform-origin: 16px 16px;
    transform: rotate(69deg);
  }
  .button__drow2::before {
    bottom: 0;
    left: 0;
    width: 0;
    height: 32px;
    border-radius: 16px;
    transform-origin: 16px 16px;
    transform: rotate(-146deg);
  }
  .button__drow2::after {
    bottom: 26px;
    left: -40px;
    width: 0;
    height: 32px;
    border-radius: 16px;
    transform-origin: 16px 16px;
    transform: rotate(-262deg);
  }
  .button__drow1,
  .button__drow1::before,
  .button__drow1::after,
  .button__drow2,
  .button__drow2::before,
  .button__drow2::after {
    background: var(--back_color);
  }
  .button:hover .button__drow1 {
    animation: drow1 ease-in 0.06s;
    animation-fill-mode: forwards;
  }
  .button:hover .button__drow1::before {
    animation: drow2 linear 0.08s 0.06s;
    animation-fill-mode: forwards;
  }
  .button:hover .button__drow1::after {
    animation: drow3 linear 0.03s 0.14s;
    animation-fill-mode: forwards;
  }
  .button:hover .button__drow2 {
    animation: drow4 linear 0.06s 0.2s;
    animation-fill-mode: forwards;
  }
  .button:hover .button__drow2::before {
    animation: drow3 linear 0.03s 0.26s;
    animation-fill-mode: forwards;
  }
  .button:hover .button__drow2::after {
    animation: drow5 linear 0.06s 0.32s;
    animation-fill-mode: forwards;
  }
  @keyframes drow1 {
    0% {
      height: 0;
    }
    100% {
      height: 100px;
    }
  }
  @keyframes drow2 {
    0% {
      width: 0;
      opacity: 0;
    }
    10% {
      opacity: 0;
    }
    11% {
      opacity: 1;
    }
    100% {
      width: 120px;
    }
  }
  @keyframes drow3 {
    0% {
      width: 0;
    }
    100% {
      width: 80px;
    }
  }
  @keyframes drow4 {
    0% {
      height: 0;
    }
    100% {
      height: 120px;
    }
  }
  @keyframes drow5 {
    0% {
      width: 0;
    }
    100% {
      width: 124px;
    }
  }
  /* Removed .container style as it's not used here */
`;
// --- End: New Styled Entry Button Component ---

// --- Start: Bouncy Card Components ---
const BouncyCardsFeatures = () => {
  return (
    // Removed wrapper section tag as it's defined below
    // className="mx-auto max-w-7xl px-4 py-12 text-slate-800"
    <>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end md:px-8">
        <h2 className="max-w-lg text-4xl font-bold md:text-5xl text-white"> {/* Changed text color */}
          Grow faster with our
          <span className="text-slate-400"> Many Features</span>
        </h2>
        <StyledEntryButton />
      </div>
      <div className="mb-4 grid grid-cols-12 gap-4">
        <BounceCard className="col-span-12 md:col-span-4">
          <CardTitle>Voice Interactiong</CardTitle>
          <div className="absolute bottom-0 left-4 right-4 top-32 translate-y-8 rounded-t-2xl bg-gradient-to-br from-violet-400 to-indigo-400 p-4 transition-transform duration-[250ms] group-hover:translate-y-4 group-hover:rotate-[2deg]">
            <span className="block text-center font-semibold text-indigo-50">
            Talk naturally with NbAIl using advanced speech recognition and natural language processing.
            </span>
          </div>
        </BounceCard>
        <BounceCard className="col-span-12 md:col-span-8">
          <CardTitle>Screen Awareness</CardTitle>
          <div className="absolute bottom-0 left-4 right-4 top-32 translate-y-8 rounded-t-2xl bg-gradient-to-br from-amber-400 to-orange-400 p-4 transition-transform duration-[250ms] group-hover:translate-y-4 group-hover:rotate-[2deg]">
            <span className="block text-center font-semibold text-orange-50">
            NbAIl can see and understand what's on your screen to provide contextual assistance.
            </span>
          </div>
        </BounceCard>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <BounceCard className="col-span-12 md:col-span-8">
          <CardTitle>AR Mode</CardTitle>
          <div className="absolute bottom-0 left-4 right-4 top-32 translate-y-8 rounded-t-2xl bg-gradient-to-br from-green-400 to-emerald-400 p-4 transition-transform duration-[250ms] group-hover:translate-y-4 group-hover:rotate-[2deg]">
            <span className="block text-center font-semibold text-emerald-50">
            Experience augmented reality assistance that overlays helpful information in your field of view
            </span>
          </div>
        </BounceCard>
        <BounceCard className="col-span-12 md:col-span-4">
          <CardTitle>Multimodal Intelligence</CardTitle>
          <div className="absolute bottom-0 left-4 right-4 top-32 translate-y-8 rounded-t-2xl bg-gradient-to-br from-pink-400 to-red-400 p-4 transition-transform duration-[250ms] group-hover:translate-y-4 group-hover:rotate-[2deg]">
            <span className="block text-center font-semibold text-red-50">
            Combines text, vision, voice, and context for a truly integrated AI experience.
            </span>
          </div>
        </BounceCard>
      </div>
    </>
  );
};

const BounceCard = ({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 0.95, rotate: "-1deg" }}
      // Changed background color for dark theme
      className={`group relative min-h-[300px] cursor-pointer overflow-hidden rounded-2xl bg-gray-800 p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
};

const CardTitle = ({ children }: { children: ReactNode }) => {
  return (
    // Changed text color for dark theme
    <h3 className="mx-auto text-center text-3xl font-semibold text-white">{children}</h3>
  );
};
// --- End: Bouncy Card Components ---

export default function FeaturesPage() {
  const mainFeatures = [
    {
      icon: <Mic className="h-10 w-10 text-purple-500" />,
      title: "Voice Iinteraction",
      description:
        "Talk naturally with NbAIl using advanced speech recognition and natural language processing. Our system understands context, accents, and even specialized terminology.",
    },
    {
      icon: <Monitor className="h-10 w-10 text-purple-500" />,
      title: "Screen Awareness",
      description:
        "NbAIl can see and understand what's on your screen to provide contextual assistance. It can analyze UI elements, recognize applications, and help you navigate complex interfaces.",
    },
    {
      icon: <FileText className="h-10 w-10 text-purple-500" />,
      title: "Document Understanding",
      description:
        "Upload and analyze documents, images, and files for instant insights and summaries. NbAIl can extract key information, create summaries, and answer questions about your content.",
    },
    {
      icon: <Glasses className="h-10 w-10 text-purple-500" />,
      title: "AR Mode",
      description:
        "Experience augmented reality assistance that overlays helpful information in your field of view. Get real-time translations, identify objects, and receive step-by-step guidance.",
    },
    {
      icon: <Brain className="h-10 w-10 text-purple-500" />,
      title: "Multimodal Intelligence",
      description:
        "Combines text, vision, voice, and context for a truly integrated AI experience. NbAIl understands the relationships between different types of information for more comprehensive assistance.",
    },
    {
      icon: <History className="h-10 w-10 text-purple-500" />,
      title: "Chat Memory",
      description:
        "NbAIl remembers your conversations and builds context over time for more personalized help. It learns your preferences, frequently asked questions, and adapts to your unique needs.",
    },
  ]

  const additionalFeatures = [
    {
      icon: <Zap className="h-6 w-6 text-purple-500" />,
      title: "Lightning Fast",
      description: "Powered by Groq's high-performance inference engine for near-instant responses.",
    },
    {
      icon: <Lock className="h-6 w-6 text-purple-500" />,
      title: "Privacy Focused",
      description: "Your data is processed securely and never shared with third parties.",
    },
    {
      icon: <Globe className="h-6 w-6 text-purple-500" />,
      title: "Multilingual",
      description: "Supports over 30 languages for global accessibility.",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-purple-500" />,
      title: "Continuous Learning",
      description: "Constantly improving through regular model updates and training.",
    },
  ]

  return (
    <LenisProvider>
      <main
        className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden"
        data-barba="container"
        data-barba-namespace="features"
      >
        {/* Interactive background with moving particles - from Version 1 */}
        <div className="h-full w-full absolute inset-0 z-0">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.2}
            particleDensity={80}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
        </div>

        <div className="relative z-10">
          <Navbar />

          {/* Hero Section */}
          <section className="pt-32 pb-16 relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-3xl mx-auto"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Powerful Features for a
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    {" "}
                    Smarter Experience
                  </span>
                </h1>
                <p className="text-gray-300 text-xl mb-8">
                  Discover how NbAIl's advanced capabilities can transform the way you work, learn, and create.
                </p>
              </motion.div>
            </div>
          </section>

          {/* ===== Section for Bouncy Cards Start ===== */}
          {/* Add horizontal padding */}
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <BouncyCardsFeatures />
          </section>
          {/* ===== Section for Bouncy Cards End ===== */}

          {/* Additional Features - Change background color */}
          <section 
            id="additional-features" 
            // Remove bg-gray-900/80, keep backdrop-blur, add inline style
            className="py-16 backdrop-blur-md" 
            style={{ backgroundColor: '#1A1A1A' }} 
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl font-bold text-white mb-4">Additional Features</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Beyond our core capabilities, NbAIl offers many other features to enhance your experience.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {additionalFeatures.map((feature, index) => {
                  return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                      style={{ backgroundColor: "#20242D" }}
                      className="rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex items-center mb-3">
                      {feature.icon}
                      <h3 className="text-lg font-medium text-white ml-2">{feature.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-black/[0.96] relative">
            <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 to-transparent" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 border border-gray-700 max-w-4xl mx-auto text-center"
              >
                <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience NbAIl?</h2>
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                  Start using our multimodal AI assistant today and transform the way you work.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8" asChild>
                    <Link href="/signup">Get Started Free</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-purple-500 hover:bg-purple-500/20"
                    asChild
                  >
                    <Link href="/chat">Try NbAIl Now</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          <Footer />
        </div>
      </main>
    </LenisProvider>
  )
}
