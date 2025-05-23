import { AnimatePresence, motion } from "framer-motion";
import Carousel from "@/src/blocks/Components/Carousel/Carousel"; // Adjusted import path
import { FiLayers, FiCode, FiFileText } from "react-icons/fi";

const MobileCarousel = ({ showCards }: { showCards: boolean }) => {
  return (
    // Only show on mobile devices (md:hidden)
    <div className="absolute bottom-20 right-4 z-20 pointer-events-none md:hidden">
      <div className="w-full pointer-events-auto">
        <AnimatePresence>
          {showCards && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-4"
            >
              <Carousel
                responsive={true} // Enables responsive styles for mobile
                items={[
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
                ]}
                baseWidth={250}
                autoplay={true}
                autoplayDelay={3000}
                pauseOnHover={true}
                loop={true}
                round={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MobileCarousel; 