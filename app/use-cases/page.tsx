"use client"

import LenisWrapper from '@/components/LenisWrapper';
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { GraduationCap, Code, Palette, Users, Briefcase, Stethoscope, ShoppingBag, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SparklesCore } from "@/components/sparkles"

export default function UseCasesPage() {
  const categories = [
    {
      icon: <GraduationCap className="h-10 w-10 text-purple-500" />,
      title: "Education",
      description: "Transform learning with AI-powered assistance for students and educators.",
      useCases: [
        {
          title: "Research Paper Analysis",
          description: "Upload research papers and get instant summaries, key insights, and related references.",
          image: "/placeholder.svg?height=400&width=600",
        },
        {
          title: "Smart Note-Taking",
          description:
            "Take notes with voice while NbAIl organizes, categorizes, and enhances them with relevant information.",
          image: "/placeholder.svg?height=400&width=600",
        },
      ],
    },
    {
      icon: <Code className="h-10 w-10 text-purple-500" />,
      title: "Development",
      description: "Boost developer productivity with code understanding and assistance.",
      useCases: [
        {
          title: "Code Explanation",
          description:
            "NbAIl can analyze code on your screen and explain how it works, suggest improvements, or identify bugs.",
          image: "/placeholder.svg?height=400&width=600",
        },
        {
          title: "Documentation Assistant",
          description: "Ask questions about APIs, libraries, or frameworks and get instant, contextual answers.",
          image: "/placeholder.svg?height=400&width=600",
        },
      ],
    },
    {
      icon: <Palette className="h-10 w-10 text-purple-500" />,
      title: "Design",
      description: "Get screen-aware feedback on your designs and creative inspiration.",
      useCases: [
        {
          title: "Design Critique",
          description:
            "NbAIl can analyze your designs in real-time and provide feedback on usability, accessibility, and aesthetics.",
          image: "/placeholder.svg?height=400&width=600",
        },
        {
          title: "Creative Inspiration",
          description:
            "Generate ideas, color palettes, and design concepts based on your requirements and preferences.",
          image: "/placeholder.svg?height=400&width=600",
        },
      ],
    },
    {
      icon: <Briefcase className="h-10 w-10 text-purple-500" />,
      title: "Business",
      description: "Enhance productivity and decision-making in professional settings.",
      useCases: [
        {
          title: "Meeting Assistant",
          description: "NbAIl can join your meetings, take notes, summarize discussions, and create action items.",
          image: "/placeholder.svg?height=400&width=600",
        },
        {
          title: "Data Analysis",
          description: "Upload spreadsheets or data visualizations and get instant insights and recommendations.",
          image: "/placeholder.svg?height=400&width=600",
        },
      ],
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
            particleDensity={100}
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

          {/* Detailed Use Cases */}
          {categories.map((category, categoryIndex) => (
            <section key={categoryIndex} className={`py-16 ${categoryIndex % 2 === 0 ? "bg-black/[0.96]" : "glass"}`}>
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-16"
                >
                  <div className="inline-flex items-center justify-center bg-gray-800 rounded-full px-4 py-1 mb-4">
                    {category.icon}
                    <span className="ml-2 text-white font-medium">{category.title}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">{category.title} Use Cases</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">{category.description}</p>
                </motion.div>

                <div className="space-y-16">
                  {category.useCases.map((useCase, useCaseIndex) => (
                    <motion.div
                      key={useCaseIndex}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: useCaseIndex * 0.1 }}
                      className={`flex flex-col ${
                        useCaseIndex % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                      } gap-8 items-center`}
                    >
                      <div className="w-full lg:w-1/2">
                        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 glow-purple-sm">
                          <img src={useCase.image || "/placeholder.svg"} alt={useCase.title} className="w-full h-auto" />
                        </div>
                      </div>
                      <div className="w-full lg:w-1/2">
                        <h3 className="text-2xl font-bold text-white mb-4">{useCase.title}</h3>
                        <p className="text-gray-300 text-lg mb-6">{useCase.description}</p>
                        <Button className="btn-primary" asChild>
                          <Link href="/chat">Try This Use Case</Link>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          ))}

          {/* More Use Cases */}
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
