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
      title: "Object Detection",
      description: "Real-time object and gesture recognition",
      id: 2,
      icon: <FiCode className="h-[16px] w-[16px] text-white" />,
    },
    {
      title: "Face Analysis",
      description: "Detailed facial recognition and traits",
      id: 3,
      icon: <FiFileText className="h-[16px] w-[16px] text-white" />,
    },
  ];

  // Convert the slides from arModeSlides format to CarouselItem format if slides are provided
  const carouselItems = slides ? slides.map((slide, index) => {
    let icon;
    // Assign icons based on slide title or index
    if (slide.title.includes("Scene")) {
      icon = <FiLayers className="h-[16px] w-[16px] text-white" />;
    } else if (slide.title.includes("Identity")) {
      icon = <FiFileText className="h-[16px] w-[16px] text-white" />;
    } else {
      icon = <FiCode className="h-[16px] w-[16px] text-white" />;
    }
    
    return {
      title: slide.title,
      description: slide.description,
      id: index + 1,
      icon,
    };
  }) : defaultSlides;

  return (
    // Only show on mobile devices (md:hidden)
    <div className="absolute bottom-0 right-4 z-20 pointer-events-none md:hidden">
      <div className="w-full pointer-events-auto">
        <AnimatePresence>
          {showCards && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-4"
            >
              <div style={{ height: '500px', position: 'relative' }}>
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