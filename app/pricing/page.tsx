"use client"

import LenisWrapper from '@/components/LenisWrapper';
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { SparklesCore } from "@/components/sparkles"

export default function PricingPage() {
  const [annual, setAnnual] = useState(true)

  const plans = [
    {
      name: "Free",
      description: "Basic features for personal use",
      price: {
        monthly: 0,
        annual: 0,
      },
      features: [
        { name: "Basic chat capabilities", included: true },
        { name: "Voice interaction (limited)", included: true },
        { name: "Document understanding (5 per day)", included: true },
        { name: "Screen awareness (limited)", included: true },
        { name: "AR Mode", included: false },
        { name: "Chat memory (7 days)", included: true },
        { name: "Priority support", included: false },
        { name: "Advanced integrations", included: false },
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      description: "Advanced features for power users",
      price: {
        monthly: 1499,
        annual: 1199,
      },
      features: [
        { name: "Advanced chat capabilities", included: true },
        { name: "Unlimited voice interaction", included: true },
        { name: "Document understanding (unlimited)", included: true },
        { name: "Full screen awareness", included: true },
        { name: "AR Mode", included: true },
        { name: "Chat memory (unlimited)", included: true },
        { name: "Priority support", included: true },
        { name: "Basic integrations", included: true },
      ],
      cta: "Subscribe Now",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "Custom solutions for organizations",
      price: {
        monthly: "Custom",
        annual: "Custom",
      },
      features: [
        { name: "Custom AI model training", included: true },
        { name: "Unlimited everything", included: true },
        { name: "Advanced security features", included: true },
        { name: "Team collaboration tools", included: true },
        { name: "AR Mode with custom overlays", included: true },
        { name: "Dedicated account manager", included: true },
        { name: "24/7 premium support", included: true },
        { name: "Custom integrations", included: true },
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <LenisWrapper>
      <main
        className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden"
        data-barba="container"
        data-barba-namespace="pricing"
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
                  Simple, Transparent
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    {" "}
                    Pricing
                  </span>
                </h1>
                <p className="text-gray-300 text-xl mb-8">
                  Choose the plan that works best for you. No hidden fees or surprises.
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center mb-12">
                  <span className={`text-sm ${annual ? "text-gray-400" : "text-white font-medium"}`}>Monthly</span>
                  <button
                    onClick={() => setAnnual(!annual)}
                    className="relative mx-4 w-14 h-7 bg-gray-700 rounded-full p-1 transition-colors duration-300 focus:outline-none"
                  >
                    <div
                      className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-purple-500 transition-transform duration-300 ${
                        annual ? "transform translate-x-7" : ""
                      }`}
                    />
                  </button>
                  <span className={`text-sm ${annual ? "text-white font-medium" : "text-gray-400"}`}>
                    Annual <span className="text-purple-500 font-medium">(Save 20%)</span>
                  </span>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Pricing Cards */}
          <section className="py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`bg-gray-800 rounded-xl p-6 border ${
                      plan.popular ? "border-purple-500" : "border-gray-700"
                    } relative hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                        MOST POPULAR
                      </div>
                    )}
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-gray-400 text-sm">{plan.description}</p>
                      <div className="mt-4">
                        {typeof plan.price[annual ? "annual" : "monthly"] === "number" ? (
                          <>
                            <span className="text-4xl font-bold text-white">
                              {plan.price[annual ? "annual" : "monthly"] === 0
                                ? "Free"
                                : `₹${plan.price[annual ? "annual" : "monthly"]}`}
                            </span>
                            {plan.price[annual ? "annual" : "monthly"] !== 0 && (
                              <span className="text-gray-400 ml-1">/mo</span>
                            )}
                          </>
                        ) : (
                          <span className="text-4xl font-bold text-white">
                            {plan.price[annual ? "annual" : "monthly"]}
                          </span>
                        )}
                        {annual && typeof plan.price.annual === "number" && plan.price.annual > 0 && (
                          <p className="text-sm text-gray-400 mt-1">Billed annually</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-purple-500 mt-0.5 mr-3 flex-shrink-0" />
                          ) : (
                            <X className="h-5 w-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
                          )}
                          <span className={feature.included ? "text-gray-300" : "text-gray-500"}>{feature.name}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "bg-gray-700 hover:bg-gray-600 text-white"
                      } transition-all duration-300 hover:shadow-md hover:shadow-purple-500/20`}
                      asChild
                    >
                      <Link href={plan.name === "Enterprise" ? "/contact" : "/signup"}>{plan.cta}</Link>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-16 bg-gray-900/80 backdrop-blur-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Find answers to common questions about our pricing and plans.
                </p>
              </motion.div>

              <div className="max-w-3xl mx-auto space-y-6">
                {[
                  {
                    question: "Can I switch between plans?",
                    answer:
                      "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
                  },
                  {
                    question: "Is there a free trial for paid plans?",
                    answer: "Yes, we offer a 14-day free trial for our Pro plan. No credit card required to start.",
                  },
                  {
                    question: "What payment methods do you accept?",
                    answer: "We accept all major credit cards, UPI, NetBanking, and bank transfers for Enterprise plans.",
                  },
                  {
                    question: "Can I cancel my subscription anytime?",
                    answer:
                      "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
                  },
                  {
                    question: "Do you offer discounts for educational institutions?",
                    answer:
                      "Yes, we offer special pricing for educational institutions. Please contact our sales team for more information.",
                  },
                ].map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300"
                  >
                    <h3 className="text-lg font-medium text-white mb-2">{faq.question}</h3>
                    <p className="text-gray-400">{faq.answer}</p>
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
                <h2 className="text-3xl font-bold text-white mb-4">Still Have Questions?</h2>
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                  Our team is here to help you find the perfect plan for your needs.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8" asChild>
                    <Link href="/contact">Contact Sales</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-purple-500 hover:bg-purple-500/20"
                    asChild
                  >
                    <Link href="/chat">Try NbAIl Free</Link>
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
