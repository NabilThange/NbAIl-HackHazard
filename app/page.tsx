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

export default function Home() {
  return (
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
        <Features />
        <UseCases />
        <Testimonials />
        <CTA />
        <Footer />
        <PerspectiveSections />
      </div>
    </main>
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

  // Define features data directly inside Section1 or import if needed elsewhere
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
    <motion.div style={{scale, rotate}} className="sticky top-0 h-screen bg-[#C72626] text-[1vw] flex flex-col items-center justify-center text-white pb-[10vh] overflow-y-auto"> {/* Adjusted text size and added overflow */}
      {/* Replaced the original content with the Features section structure */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10"> {/* Added padding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8" // Reduced margin-bottom
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">New Features</h2> {/* Renamed title */}
          <p className="text-gray-200 max-w-xl mx-auto text-sm"> {/* Adjusted text size and color */}
            NbAIl combines multiple AI capabilities...
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Increased gap */}
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} // Keep viewport settings simple inside scrolling container
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-md hover:shadow-purple-500/10" // Increased padding
            >
              <div className="bg-gray-900 rounded-md w-16 h-16 flex items-center justify-center mb-3"> {/* Increased size */}
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">{feature.title}</h3> {/* Increased size */}
              <p className="text-gray-300 text-sm">{feature.description}</p> {/* Increased size and color */}
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

  // Define use cases data directly inside Section2
  const useCases = [
    {
      icon: <GraduationCap className="h-10 w-10 text-blue-500" />,
      title: "For Students",
      description: "Enhance your learning with intelligent note-taking, paper summaries, and research assistance.",
      features: ["Smart note organization", "Research paper analysis", "Study plan generation", "Concept explanations"],
    },
    {
      icon: <Code className="h-10 w-10 text-blue-500" />,
      title: "For Developers",
      description: "Boost your productivity with code understanding, documentation assistance, and debugging help.",
      features: ["Code explanation", "Documentation search", "Bug identification", "Architecture suggestions"],
    },
    {
      icon: <Palette className="h-10 w-10 text-blue-500" />,
      title: "For Designers",
      description: "Get screen-aware feedback on your designs, UI suggestions, and creative inspiration.",
      features: ["Design critique", "UI pattern suggestions", "Accessibility checks", "Color palette recommendations"],
    },
    {
      icon: <Users className="h-10 w-10 text-blue-500" />,
      title: "For Everyone",
      description: "Experience the power of multimodal AI with chat, voice, vision, and AR capabilities.",
      features: ["Daily assistance", "Information retrieval", "Content creation", "Learning new skills"],
    },
  ];

  return (
    // Changed background, added padding and overflow
    <motion.div style={{scale, rotate}} className="relative h-screen bg-[#1a202c] text-white p-10 overflow-y-auto">
      {/* Replaced the Image with the Use Cases section structure */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Use Cases (Section 2)</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            NbAIl adapts to your specific needs...
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
                  {useCase.icon} {/* Icon color changed to blue-500 above */}
                </div>
                <h3 className="text-xl font-semibold text-white">{useCase.title}</h3>
              </div>
              <p className="text-gray-400 mb-4">{useCase.description}</p>
              <ul className="space-y-2 mb-6">
                {useCase.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></span> {/* Dot color changed to blue */}
                    {feature}
                  </li>
                ))}
              </ul>
              {/* Wrap Button with Link, remove asChild from Button */}
              <Link
                href="/use-cases"
                prefetch={false}
                data-barba-prevent="false"
                className="inline-block" // Add display block/inline-block if needed for layout
              >
                <Button variant="outline" className="text-white border-blue-500 hover:bg-blue-500/10"> {/* Button border/hover changed to blue */}
                  Learn More
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
