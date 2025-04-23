"use client"

import { motion } from "framer-motion"
import { GraduationCap, Code, Palette, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function UseCases() {
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
    {
      icon: <Palette className="h-10 w-10 text-purple-500" />,
      title: "For Designers",
      description: "Get screen-aware feedback on your designs, UI suggestions, and creative inspiration.",
      features: ["Design critique", "UI pattern suggestions", "Accessibility checks", "Color palette recommendations"],
    },
    {
      icon: <Users className="h-10 w-10 text-purple-500" />,
      title: "For Everyone",
      description: "Experience the power of multimodal AI with chat, voice, vision, and AR capabilities.",
      features: ["Daily assistance", "Information retrieval", "Content creation", "Learning new skills"],
    },
  ]

  return (
    <section className="py-20 bg-black/[0.96] relative">
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
                  {useCase.icon}
                </div>
                <h3 className="text-xl font-semibold text-white">{useCase.title}</h3>
              </div>
              <p className="text-gray-400 mb-4">{useCase.description}</p>
              <ul className="space-y-2 mb-6">
                {useCase.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="text-purple-500 border-purple-500 hover:bg-purple-500/10" asChild>
                <Link href="/use-cases">Learn More</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
