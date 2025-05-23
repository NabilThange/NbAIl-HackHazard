import { AnimatePresence, motion } from "framer-motion";
import Carousel from "@/components/ui/carousel-new"; // Updated import path
import { FiLayers, FiCode, FiFileText } from "react-icons/fi";

// Define the slide data structure that matches arModeSlides
interface SlideData {
  title: string;
  button: string;
  description: string;
  src?: string;
}

interface MobileCarouselProps {
  showCards: boolean;
  slides?: SlideData[];
}

const MobileCarousel = ({ showCards, slides }: MobileCarouselProps) => {
  // Default slide data if none is provided
  const defaultSlides = [
    {
      title: "AR Insights",
      description: "Explore AI-powered scene analysis",
      id: 1,
      icon: <FiLayers className="h-[16px] w-[16px] text-white" />,
    },
    {
      title: "Identity Snapshot",
      description: "Demographic and emotional insights about detected individuals.",
      button: "View Traits",
      src: "/images/identity-analysis.jpg",
      id: 2,
      icon: <FiFileText className="h-[16px] w-[16px] text-white" />,
    },
    {
      title: "Object Detection",
      description: "Detected Objects: - None\nDetected Gestures: - None",
      button: "Recognize Items",
      id: 3,
      icon: <FiCode className="h-[16px] w-[16px] text-white" />,
    }
  ];

  // Convert the slides from arModeSlides format to CarouselItem format if slides are provided
  const carouselItems = slides ? slides.map((slide, index) => {
    let icon;
    // Assign icons based on slide title or index
    if (slide.title.includes("Scene")) {
      icon = <FiLayers className="h-[16px] w-[16px] text-white" />;
    } else if (slide.title.includes("Identity")) {
      icon = <FiFileText className="h-[16px] w-[16px] text-white" />;
      
      // If this is the Identity Snapshot slide, parse the traits
      if (slide.description && slide.description.includes('\n')) {
        const traitPills = slide.description.split('\n')
          .filter(trait => trait.trim() !== '')
          .map(trait => {
            let icon = '🤔';
            if (trait.includes('Age')) icon = '🎂';
            if (trait.includes('Gender')) icon = '👤';
            if (trait.includes('Mood')) icon = '😀';
            return `${icon} ${trait.replace('- ', '')}`;
          });
        
        // Update description with trait information
        slide.description = traitPills.length > 0 
          ? traitPills.join('\n')
          : 'No Clear Face Detected. Check the lighting';
      }
    } else if (slide.title.includes("Object")) {
      icon = <FiCode className="h-[16px] w-[16px] text-white" />;
      
      // Directly set the description to match desktop view card
      slide.description = `**Objects & Gestures:**
- No objects detected
- No gestures detected`;
    }
    
    return {
      title: slide.title,
      description: slide.description,
      id: index + 1,
      icon: icon || <FiCode className="h-[16px] w-[16px] text-white" />, // Ensure icon is always defined
      image: slide.title.includes("Identity") ? slide.src : undefined, // Only add image for Identity Snapshot
      data: undefined // Remove data for all slides
    };
  }) : defaultSlides;

  return (
    // Only show on mobile devices (md:hidden)
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none md:hidden">
      <div className="w-full max-w-xs pointer-events-auto translate-y-[90px]">
        <AnimatePresence>
          {showCards && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-4"
            >
              <div style={{ height: '300px', position: 'relative' }}>
                <Carousel
                  items={carouselItems}
                  baseWidth={350}
                  autoplay={false}
                  autoplayDelay={3000}
                  pauseOnHover={false}
                  loop={true}
                  round={false}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MobileCarousel; 