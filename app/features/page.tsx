"use client"

import LenisWrapper from '@/components/LenisWrapper';
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Mic, Monitor, FileText, Glasses, Brain, History, Zap, Lock, Globe, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SparklesCore } from "@/components/sparkles"

export default function FeaturesPage() {
  const mainFeatures = [
    {
      icon: <Mic className="h-10 w-10 text-purple-500" />,
      title: "Voice Interaction",
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
    <LenisWrapper>
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

          {/* Main Features */}
          <section className="py-16 bg-gray-900/80 backdrop-blur-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mainFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300"
                  >
                    <div className="bg-gray-900 rounded-lg w-16 h-16 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Feature Showcase */}
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
                <h2 className="text-3xl font-bold text-white mb-4">See NbAIl in Action</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Watch how our multimodal AI assistant can help you with various tasks.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 max-w-4xl mx-auto"
              >
                <div className="aspect-w-16 aspect-h-9 relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <img src="/placeholder.svg?height=600&width=1200" alt="NbAIl Demo" className="w-full h-auto" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-purple-500/90 flex items-center justify-center cursor-pointer hover:bg-purple-600/90 transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 text-white"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Additional Features */}
          <section className="py-16 bg-gray-900/80 backdrop-blur-md">
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
                {additionalFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex items-center mb-3">
                      {feature.icon}
                      <h3 className="text-lg font-medium text-white ml-2">{feature.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
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
    </LenisWrapper>
  )
}
