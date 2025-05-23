"use client";

// import LenisWrapper from '@/components/LenisWrapper';
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Features from "@/components/features-section"
import Footer from "@/components/footer"
import UseCases from "@/components/use-cases-section"
import Testimonials from "@/components/testimonials"
import CTA from "@/components/cta"
import { SparklesCore } from "@/components/sparkles"
import Image from "next/image";
import { useScroll, useTransform, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import Lenis from 'lenis'; // Keep Lenis import for now
// Import icons needed for the Features section
import { Mic, Monitor, FileText, Glasses, Brain, History } from "lucide-react";
// Import icons and components needed for the Use Cases section
import { GraduationCap, Code, Palette, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LenisProvider } from "@/context/LenisProvider";

export default function Home() {
  return (
    <LenisProvider>
      <main
        className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden"
        data-barba="container"
        data-barba-namespace="home"
      >
        {/* Interactive background with moving particles -  Version 1 wala */}
        <div className="h-full w-full absolute inset-0 z-0">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
        </div>

        <div className="relative z-10">
          <Navbar />
          <Hero />
          <PerspectiveSections />
          {/* <Features /> // Removed original Features section */}
          {/* <UseCases /> // Removed original Use Cases section */}
          <Testimonials />
          <CTA />
          <Footer />
        </div>
      </main>
    </LenisProvider>
  )
}

const PerspectiveSections = () => {
  const container = useRef<HTMLDivElement>(null); // Added type for ref
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"]
  })

  // Note: This useEffect for Lenis might conflict with existing LenisWrapper.
  // If smooth scrolling breaks, remove this useEffect.
  /*
  useEffect(() => {
    const lenis = new Lenis()

    function raf(time: number) { // Added type for time
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
  }, [])
  */

  return (
    // Changed main to div as it's inside the main Home component
    <div ref={container} className="relative h-[200vh] mt-10"> {/* Added margin-top */}
      <Section1 scrollYProgress={scrollYProgress}/>
      <Section2 scrollYProgress={scrollYProgress}/>
    </div>
  );
}

const Section1 = ({ scrollYProgress }: { scrollYProgress: any }) => {

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, -5])

  // Define features data directly inside Section1 (using original styling)
  const features = [
    {
      icon: <Mic className="h-10 w-10 text-purple-500" />,
      title: "Voice Interaction",
      description: "Talk naturally with NbAIl using advanced speech recognition and natural language processing.",
    },
    {
      icon: <Monitor className="h-10 w-10 text-purple-500" />,
      title: "Screen Awareness",
      description: "NbAIl can see and understand what's on your screen to provide contextual assistance.",
    },
    {
      icon: <FileText className="h-10 w-10 text-purple-500" />,
      title: "Document Understanding",
      description: "Upload and analyze documents, images, and files for instant insights and summaries.",
    },
    {
      icon: <Glasses className="h-10 w-10 text-purple-500" />,
      title: "AR Mode",
      description: "Experience augmented reality assistance that overlays helpful information in your field of view.",
    },
    {
      icon: <Brain className="h-10 w-10 text-purple-500" />,
      title: "Multimodal Intelligence",
      description: "Combines text, vision, voice, and context for a truly integrated AI experience.",
    },
    {
      icon: <History className="h-10 w-10 text-purple-500" />,
      title: "Chat Memory",
      description: "NbAIl remembers your conversations and builds context over time for more personalized help.",
    },
  ];

  return (
    // Applied original section classes + h-screen and overflow
    <motion.div 
      style={{scale, rotate}} 
      className="sticky top-0 h-screen py-20 bg-gray-900/80 backdrop-blur-md overflow-y-auto text-white" // Added text-white
    >
      {/* Copied exact inner content from original Features component */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          {/* Using original title and text */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Powerful Features</h2> 
          <p className="text-gray-400 max-w-2xl mx-auto">
            NbAIl combines multiple AI capabilities to create a truly intelligent assistant that understands your needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="bg-gray-900 rounded-lg w-16 h-16 flex items-center justify-center mb-4">
                {feature.icon} {/* Original purple icon color */}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

const Section2 = ({ scrollYProgress }: { scrollYProgress: any }) => {

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [5, 0])

  // Define use cases data directly inside Section2 (using original styling)
  const useCases = [
    {
      icon: <GraduationCap className="h-10 w-10 text-purple-500" />,
      title: "For Students",
      description: "Enhance your learning with intelligent note-taking, paper summaries, and research assistance.",
      features: ["Smart note organization", "Research paper analysis", "Study plan generation", "Concept explanations"],
    },
    {
      icon: <Code className="h-10 w-10 text-purple-500" />,
      title: "For Developers",
      description: "Boost your productivity with code understanding, documentation assistance, and debugging help.",
      features: ["Code explanation", "Documentation search", "Bug identification", "Architecture suggestions"],
    },
  ];

  return (
    // Added bottom padding to prevent overlap with following content
    <motion.div 
      style={{scale, rotate}} 
      className="relative py-20 pb-40 bg-black/[0.96] text-white" // Added pb-40
    >
      {/* Copied exact inner content from original UseCases component */}
      {/* Add sparkle background effect */}
      <div className="absolute inset-0 bg-grid-white/[0.02]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          {/* Using original title and text */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Use Cases</h2> 
          <p className="text-gray-400 max-w-2xl mx-auto">
            NbAIl adapts to your specific needs, whether you're a student, developer, designer, or anyone looking for an
            intelligent assistant.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center mb-4">
                <div className="bg-gray-900 rounded-lg w-16 h-16 flex items-center justify-center mr-4">
                  {useCase.icon} {/* Original purple icon color */}
                </div>
                <h3 className="text-xl font-semibold text-white">{useCase.title}</h3>
              </div>
              <p className="text-gray-400 mb-4">{useCase.description}</p>
              <ul className="space-y-2 mb-6">
                {useCase.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2"></span> {/* Original purple dot color */}
                    {feature}
                  </li>
                ))}
              </ul>
              {/* Reverted to original Button/Link with asChild and exact classes */}
              <Button variant="outline" className="text-white border-purple-500 hover:bg-purple-500/10" asChild>
                <Link
                  href="/use-cases"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  prefetch={false}
                  data-barba-prevent="false"
                >
                  Learn More
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
