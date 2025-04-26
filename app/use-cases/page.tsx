"use client"

import { useState } from "react"
import LenisWrapper from '@/components/LenisWrapper';
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import React, { ReactNode, useRef } from "react"; 
import { motion, useScroll, useTransform } from "framer-motion"
import { GraduationCap, Code, Palette, Users, Briefcase, Stethoscope, ShoppingBag, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SparklesCore } from "@/components/sparkles"
import { FiArrowUpRight } from "react-icons/fi";
import styled from 'styled-components';

const IMG_PADDING = 12;

const TextParallaxContent = ({
  imgUrl,
  subheading,
  heading,
  children,
}: {
  imgUrl: string;
  subheading: string;
  heading: string;
  children: ReactNode;
}) => {
  return (
    <div
      style={{
        paddingLeft: IMG_PADDING,
        paddingRight: IMG_PADDING,
      }}
    >
      <div className="relative h-screen">
        <StickyImage imgUrl={imgUrl} />
        <OverlayCopy heading={heading} subheading={subheading} />
      </div>
      {children}
    </div>
  );
};

const StickyImage = ({ imgUrl }: { imgUrl: string }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.div
      style={{
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: `calc(100vh - ${IMG_PADDING * 2}px)`,
        top: IMG_PADDING,
        scale,
      }}
      ref={targetRef}
      className="sticky z-0 overflow-hidden rounded-3xl"
    >
      <motion.div
        className="absolute inset-0 bg-neutral-950/70"
        style={{
          opacity,
        }}
      />
    </motion.div>
  );
};

const OverlayCopy = ({
  subheading,
  heading,
}: {
  subheading: string;
  heading: string;
}) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);

  return (
    <motion.div
      style={{
        y,
        opacity,
      }}
      ref={targetRef}
      className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center text-white"
    >
      <p className="mb-2 text-center text-xl md:mb-4 md:text-3xl">
        {subheading}
      </p>
      <p className="text-center text-4xl font-bold md:text-7xl">{heading}</p>
    </motion.div>
  );
};

// --- Start: Custom Styled Button Component ---
const StyledButtonComponent = () => {
  return (
    <StyledWrapper>
      <button className="button" style={{ '--clr': '#7808d0' } as React.CSSProperties}> 
        <span className="button__icon-wrapper">
          <svg viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="button__icon-svg" width={10}>
            <path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" fill="currentColor" />
          </svg>
          <svg viewBox="0 0 14 15" fill="none" width={10} xmlns="http://www.w3.org/2000/svg" className="button__icon-svg button__icon-svg--copy">
            <path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" fill="currentColor" />
          </svg>
        </span>
        Explore All
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .button {
    line-height: 1;
    text-decoration: none;
    display: inline-flex;
    border: none;
    cursor: pointer;
    align-items: center;
    gap: 0.75rem;
    background-color: var(--clr);
    color: #fff;
    border-radius: 10rem;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    padding-left: 20px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: background-color 0.3s;
  }

  .button__icon-wrapper {
    flex-shrink: 0;
    width: 25px;
    height: 25px;
    position: relative;
    color: var(--clr);
    background-color: #fff;
    border-radius: 50%;
    display: grid;
    place-items: center;
    overflow: hidden;
  }

  .button:hover {
    background-color: #1A1A1A;
  }

  .button:hover .button__icon-wrapper {
    color: #1A1A1A;
  }

  .button__icon-svg--copy {
    position: absolute;
    transform: translate(-150%, 150%);
  }

  .button:hover .button__icon-svg:first-child {
    transition: transform 0.3s ease-in-out;
    transform: translate(150%, -150%);
  }

  .button:hover .button__icon-svg--copy {
    transition: transform 0.3s ease-in-out 0.1s;
    transform: translate(0);
  }
`;
// --- End: Custom Styled Button Component ---

const AcademiaContent = () => (
  <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
    <h2 className="col-span-1 text-3xl font-bold text-white md:col-span-4">
     AI Study Companion
    </h2>
    <div className="col-span-1 md:col-span-8">
      <p className="mb-4 text-xl text-neutral-300 md:text-2xl">
       Empower students and teachers with real-time AI-driven explanations, guidance, and smart study tools. Make complex subjects simple and transform how knowledge is delivered.
      </p>
      <StyledButtonComponent />
    </div>
  </div>
);

const QualityContent = () => (
  <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
    <h2 className="col-span-1 text-3xl font-bold text-white md:col-span-4">
      AI Coding Assistant
    </h2>
    <div className="col-span-1 md:col-span-8">
      <p className="mb-4 text-xl text-neutral-300 md:text-2xl">
        Accelerate development workflows with intelligent code understanding, auto-suggestions, and debugging help. Focus on building great products while AI handles the repetitive thinking.
      </p>
      <StyledButtonComponent />
    </div>
  </div>
);

const ModernContent = () => (
  <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
    <h2 className="col-span-1 text-3xl font-bold text-white md:col-span-4">
      Screen-Aware Design Feedback
    </h2>
    <div className="col-span-1 md:col-span-8">
      <p className="mb-4 text-xl text-neutral-300 md:text-2xl">
         Receive real-time feedback on your UI/UX designs directly from an AI that sees your screen. Improve usability, aesthetics, and creativity effortlessly.
      </p>
      <StyledButtonComponent />
    </div>
  </div>
);

const TextParallaxContentExample = () => {
  return (
    <div className="bg-black">
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        subheading="Academia"
        heading="Limitless possibilities"
      >
        <AcademiaContent />
      </TextParallaxContent>
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        subheading="Development"
        heading="Code faster, thrive."
      >
        <QualityContent />
      </TextParallaxContent>
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1504610926078-a1611febcad3?q=80&w=2416&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        subheading="Creativity"
        heading="Design better"
      >
        <ModernContent />
      </TextParallaxContent>
    </div>
  );
};

export default function UseCasesPage() {
  const categories = [
    {
      icon: <GraduationCap className="h-10 w-10 text-purple-500" />,
      title: "Education",
      description: "Transform learning with AI-powered assistance for students and educators.",
    },
    {
      icon: <Code className="h-10 w-10 text-purple-500" />,
      title: "Development",
      description: "Boost developer productivity with code understanding and assistance.",
    },
    {
      icon: <Palette className="h-10 w-10 text-purple-500" />,
      title: "Design",
      description: "Get screen-aware feedback on your designs and creative inspiration.",
    },
    {
      icon: <Briefcase className="h-10 w-10 text-purple-500" />,
      title: "Business",
      description: "Enhance productivity and decision-making in professional settings.",
    },
  ]

  return (
    <LenisWrapper>
      <main
        className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden"
        data-barba="container"
        data-barba-namespace="use-cases"
      >
        {/* Interactive background with moving particles */}
        <div className="h-full w-full absolute inset-0 z-0">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={70}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
        </div>

        <div className="relative z-10">
          <Navbar />

          {/* Hero Section */}
          <section className="pt-32 pb-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 to-transparent" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-3xl mx-auto"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Discover What
                  <span className="text-gradient"> NbAIl Can Do</span>
                </h1>
                <p className="text-gray-300 text-xl mb-8">
                  Explore how our multimodal AI assistant can transform your workflow across different domains.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Categories Overview */}
          <section className="py-16 glass">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gray-800 rounded-xl p-6 border border-gray-700 card-hover"
                  >
                    <div className="bg-gray-900 rounded-lg w-16 h-16 flex items-center justify-center mb-4">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{category.title}</h3>
                    <p className="text-gray-400">{category.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ===== Section for Parallax Content Start ===== */}
          <section className="py-16">
            <div className="px-4 sm:px-6 lg:px-8">
              <TextParallaxContentExample />
            </div>
          </section>
          {/* ===== Section for Parallax Content End ===== */}

          {/* More Use Cases (Now below the blue section) */}
          <section className="py-16 glass">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl font-bold text-white mb-4">More Industries</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  NbAIl can be customized for various industries and use cases.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: <Stethoscope className="h-6 w-6 text-purple-500" />,
                    title: "Healthcare",
                    description: "Assist with medical research, patient information, and healthcare documentation.",
                  },
                  {
                    icon: <ShoppingBag className="h-6 w-6 text-purple-500" />,
                    title: "Retail",
                    description: "Enhance customer service, inventory management, and market analysis.",
                  },
                  {
                    icon: <BookOpen className="h-6 w-6 text-purple-500" />,
                    title: "Publishing",
                    description: "Support content creation, editing, and research for publications.",
                  },
                  {
                    icon: <Users className="h-6 w-6 text-purple-500" />,
                    title: "Personal Use",
                    description: "Help with daily tasks, learning, and personal productivity.",
                  },
                ].map((industry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gray-800 rounded-lg p-6 border border-gray-700 card-hover"
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-gray-900 rounded-lg w-12 h-12 flex items-center justify-center mr-4">
                        {industry.icon}
                      </div>
                      <h3 className="text-lg font-medium text-white">{industry.title}</h3>
                    </div>
                    <p className="text-gray-400">{industry.description}</p>
                  </motion.div>
                ))}
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
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 border border-gray-700 max-w-4xl mx-auto text-center glow-purple-sm"
              >
                <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Workflow?</h2>
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                  Start using NbAIl today and experience the power of multimodal AI assistance.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="btn-primary" asChild>
                    <Link href="/signup">Get Started Free</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="btn-outline" asChild>
                    <Link href="/chat">Try NbAIl Now</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          <Footer />
        </div>
      </main>
    </LenisWrapper>
  )
}
