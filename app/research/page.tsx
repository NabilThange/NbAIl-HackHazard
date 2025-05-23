import { Suspense } from "react"
import dynamic from "next/dynamic"
import { LenisProvider } from "@/context/LenisProvider";

// Dynamically import the client component
const DynamicResearchPage = dynamic(() => import("@/components/research/research-page"), {
  ssr: true,
  loading: () => <ResearchLoading />,
})

// Loading component
const ResearchLoading = () => (
  <div className="flex items-center justify-center h-screen bg-black/[0.96]">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
  </div>
)

export const metadata = {
  title: "Research | NbAIl – Your Multimodal AI Assistant",
  description: "Explore the cutting-edge AI research that powers NbAIl's multimodal capabilities.",
}

export default function ResearchPage() {
  return (
    <LenisProvider>
      <Suspense fallback={<ResearchLoading />}>
        <DynamicResearchPage />
      </Suspense>
    </LenisProvider>
  )
}
