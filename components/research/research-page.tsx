"use client"

import { motion } from "framer-motion"
import { Brain, Lightbulb, Cpu, Network, Eye, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SparklesCore } from "@/components/sparkles"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { AuroraText } from "@/components/ui/aurora-text"

export default function ResearchPage() {
  const researchAreas = [
    {
      icon: <Brain className="h-10 w-10 text-purple-500" />,
      title: "Multimodal Learning",
      description:
        "Our research focuses on integrating multiple data types (text, images, audio) to create a more comprehensive understanding of user context and needs.",
      link: "#multimodal",
    },
    {
      icon: <Lightbulb className="h-10 w-10 text-purple-500" />,
      title: "Contextual Understanding",
      description:
        "We're developing advanced algorithms that maintain context across different interactions and modalities for more natural conversations.",
      link: "#contextual",
    },
    {
      icon: <Cpu className="h-10 w-10 text-purple-500" />,
      title: "Efficient Inference",
      description:
        "Our partnership with Groq enables lightning-fast inference, allowing NbAIl to process complex requests in milliseconds rather than seconds.",
      link: "#inference",
    },
    {
      icon: <Network className="h-10 w-10 text-purple-500" />,
      title: "Knowledge Integration",
      description:
        "We're building systems that can access, verify, and integrate information from diverse sources to provide accurate and up-to-date responses.",
      link: "#knowledge",
    },
    {
      icon: <Eye className="h-10 w-10 text-purple-500" />,
      title: "Computer Vision",
      description:
        "Our advanced vision models can understand screen content, documents, and real-world objects to provide contextually relevant assistance.",
      link: "#vision",
    },
    {
      icon: <Layers className="h-10 w-10 text-purple-500" />,
      title: "AR Integration",
      description:
        "We're pioneering new ways to blend AI assistance with augmented reality for immersive and intuitive user experiences.",
      link: "#ar",
    },
  ]

  const publications = [
    {
      title: "Advancing Multimodal AI Assistants: Challenges and Opportunities",
      authors: "Dr. Sarah Chen, Dr. Michael Rodriguez",
      conference: "International Conference on AI, 2024",
      abstract:
        "This paper explores the current state of multimodal AI assistants and outlines key research directions for improving their capabilities and user experience.",
      link: "#",
    },
    {
      title: "ScreenAware: A Novel Approach to Screen Understanding for AI Assistants",
      authors: "Dr. Alex Johnson, Dr. Lisa Wong",
      conference: "ACM Conference on Human Factors in Computing Systems, 2024",
      abstract:
        "We present ScreenAware, a new framework for AI assistants to understand and interact with on-screen content in real-time, enabling more contextual assistance.",
      link: "#",
    },
    {
      title: "Integrating AR and AI: Design Principles for Next-Generation Assistants",
      authors: "Dr. James Smith, Dr. Emily Davis",
      conference: "IEEE Virtual Reality Conference, 2023",
      abstract:
        "This paper presents design principles and technical approaches for integrating augmented reality with AI assistants to create more immersive and helpful experiences.",
      link: "#",
    },
  ]

  return (
    <main
      className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden"
      data-barba="container"
      data-barba-namespace="research"
    >
      {/* Interactive background with moving particles - from Version 1 */}
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
                Our
                <AuroraText colors={["#a855f7", "#ec4899"]}> Research</AuroraText>
              </h1>
              <p className="text-gray-300 text-xl mb-8">
                Explore the cutting-edge AI research that powers NbAIl's multimodal capabilities.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Research Areas */}
        <section className="py-16 bg-gray-900/80 backdrop-blur-md">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-white mb-4">Research Areas</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Our team is focused on solving complex challenges in AI to create a more intuitive and helpful
                assistant.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {researchAreas.map((area, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="bg-gray-900 rounded-lg w-16 h-16 flex items-center justify-center mb-4">
                    {area.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{area.title}</h3>
                  <p className="text-gray-400 mb-4">{area.description}</p>
                  <Link
                    href={area.link}
                    className="text-purple-500 hover:text-purple-400 font-medium inline-flex items-center"
                  >
                    Learn more
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Publications */}
        <section className="py-16 bg-black/[0.96] relative">
          <div className="absolute inset-0 bg-grid-white/[0.02]" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-white mb-4">Recent Publications</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Our research team regularly publishes their findings in top academic conferences and journals.
              </p>
            </motion.div>

            <div className="space-y-6 max-w-4xl mx-auto">
              {publications.map((pub, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                >
                  <h3 className="text-xl font-semibold text-white mb-2">{pub.title}</h3>
                  <p className="text-purple-500 mb-2">{pub.authors}</p>
                  <p className="text-gray-400 text-sm mb-4">{pub.conference}</p>
                  <p className="text-gray-300 mb-4">{pub.abstract}</p>
                  <Link
                    href={pub.link}
                    className="text-purple-500 hover:text-purple-400 font-medium inline-flex items-center"
                  >
                    Read paper
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </Link>
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
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 border border-gray-700 max-w-4xl mx-auto text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-4">Experience Our Research in Action</h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Try NbAIl today and see how our cutting-edge research translates into a powerful AI assistant.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8" asChild>
                  <Link href="/chat">Try NbAIl Now</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-purple-500 hover:bg-purple-500/20"
                  asChild
                >
                  <Link href="/signup">Sign Up Free</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  )
}
