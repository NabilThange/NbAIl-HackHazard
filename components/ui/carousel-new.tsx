import { useEffect, useState, useRef } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
// replace icons with your own if needed
import {
  FiCircle,
  FiCode,
  FiFileText,
  FiLayers,
  FiLayout,
  FiCreditCard,
} from "react-icons/fi";

export interface CarouselItem {
  title: string;
  description: string;
  id: number;
  icon: JSX.Element;
  image?: string;
  data?: string | Record<string, any>;
}

export interface CarouselProps {
  items?: CarouselItem[];
  baseWidth?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
}

const DEFAULT_ITEMS: CarouselItem[] = [
  {
    title: "Text Animations",
    description: "**Cool** text animations for your *projects*. ~~Lightweight~~ ##Powerful",
    id: 1,
    icon: <FiCreditCard className="h-[16px] w-[16px] text-white" />,
    image: "/path/to/sample/image.jpg",
    data: "Sample data from Groq"
  },
  {
    title: "Animations",
    description: "**Smooth** animations for your *projects*. ##Responsive design",
    id: 2,
    icon: <FiCircle className="h-[16px] w-[16px] text-white" />,
  },
  {
    title: "Components",
    description: "**Reusable** components for your *projects*. ~~Simple~~ ##Advanced",
    id: 3,
    icon: <FiLayers className="h-[16px] w-[16px] text-white" />,
  },
  {
    title: "Backgrounds",
    description: "**Beautiful** backgrounds and *patterns* for your projects. ##Customizable",
    id: 4,
    icon: <FiLayout className="h-[16px] w-[16px] text-white" />,
  },
  {
    title: "Common UI",
    description: "**Common** UI components are *coming soon*! ~~Basic~~ ##Innovative",
    id: 5,
    icon: <FiCode className="h-[16px] w-[16px] text-white" />,
  },
];

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 };

// Markdown-like styling helper function
const parseMarkdown = (text: string) => {
  // Bold: **text**
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic: *text*
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Light: ~~text~~
  text = text.replace(/~~(.*?)~~/g, '<span className="text-gray-400">$1</span>');
  
  // Dark: ##text
  text = text.replace(/##(.*?)(?=\s|$)/g, '<span className="text-gray-700">$1</span>');
  
  return text;
}

export default function Carousel({
  items = DEFAULT_ITEMS,
  baseWidth = 300,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
}: CarouselProps): JSX.Element {
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  const carouselItems = loop ? [...items, items[0]] : items;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (autoplay && (!pauseOnHover || !isHovered)) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === items.length - 1 && loop) {
            return prev + 1; // Animate to clone.
          }
          if (prev === carouselItems.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [
    autoplay,
    autoplayDelay,
    isHovered,
    loop,
    items.length,
    carouselItems.length,
    pauseOnHover,
  ]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ): void => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1));
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(items.length - 1);
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    }
  };

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * (carouselItems.length - 1),
          right: 0,
        },
      };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden p-4 ${
        round
          ? "rounded-full border border-white"
          : "rounded-[24px] border border-[#222]"
      }`}
      style={{
        width: `${baseWidth}px`,
        ...(round && { height: `${baseWidth}px` }),
      }}
    >
      <motion.div
        className="flex"
        drag="x"
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
          x,
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => {
          const range = [
            -(index + 1) * trackItemOffset,
            -index * trackItemOffset,
            -(index - 1) * trackItemOffset,
          ];
          const outputRange = [90, 0, -90];
          const rotateY = useTransform(x, range, outputRange, { clamp: false });
          return (
            <motion.div
              key={index}
              className={`relative shrink-0 flex flex-col ${
                round
                  ? "items-center justify-center text-center bg-[#060606] border-0"
                  : "items-start justify-between bg-black/29 backdrop-blur-sm border border-white/20 rounded-[12px]"
              } overflow-hidden cursor-grab active:cursor-grabbing`}
              style={{
                width: itemWidth,
                height: round ? itemWidth : "300px",
                rotateY: rotateY,
                ...(round && { borderRadius: "50%" }),
              }}
              transition={effectiveTransition}
            >
              <div className={`${round ? "p-0 m-0" : "p-5"} flex flex-col`}>
                <div className="flex items-center mb-3">
                  <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#060606] mr-3 shrink-0">
                    {item.icon}
                  </span>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                </div>
                
                {item.image && (
                  <div className="mb-3 w-full">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-[188px] object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {item.data && (
                  <div className="mb-3">
                    <div className="bg-[#333] text-white text-xs px-3 py-1 rounded-full inline-block">
                      {typeof item.data === 'string' 
                        ? item.data 
                        : JSON.stringify(item.data)}
                    </div>
                  </div>
                )}
                
                <div className="flex-grow max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-300">
                  <p 
                    className="text-sm text-white pr-2" 
                    dangerouslySetInnerHTML={{ 
                      __html: parseMarkdown(item.description) 
                    }} 
                  />
                </div>
              </div>
              {!round && <div className="p-5 overflow-y-auto max-h-[200px]"></div>}
            </motion.div>
          );
        })}
      </motion.div>
      <div
        className={`flex w-full justify-center ${
          round ? "absolute z-20 bottom-12 left-1/2 -translate-x-1/2" : ""
        }`}
      >
        <div className="mt-4 flex w-[150px] justify-between px-8">
          {items.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 w-2 rounded-full cursor-pointer transition-colors duration-150 ${
                currentIndex % items.length === index
                  ? round
                    ? "bg-white"
                    : "bg-[#333333]"
                  : round
                    ? "bg-[#555]"
                    : "bg-[rgba(51,51,51,0.4)]"
              }`}
              animate={{
                scale: currentIndex % items.length === index ? 1.2 : 1,
              }}
              onClick={() => setCurrentIndex(index)}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 