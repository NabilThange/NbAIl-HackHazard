"use client";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import { useState, useRef, useId, useEffect } from "react";
import { motion } from "framer-motion";

interface SlideData {
  title: string;
  button: string;
  src: string;
  description?: string;
}

interface SlideProps {
  slide: SlideData;
  index: number;
  current: number;
  handleSlideClick: (index: number) => void;
}

const Slide = ({ slide, index, current, handleSlideClick }: SlideProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  const animate = () => {
    return {
      scale: current === index ? 1 : 0.85,
      opacity: current === index ? 1 : 0.6,
      transition: { duration: 0.3 }
    };
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5
    });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  const imageLoaded = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
  };

  return (
    <motion.div
      className={`relative w-full h-64 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ${
        current === index ? 'shadow-lg' : 'shadow-md'
      } ${slide.title === 'Scene Analysis' ? 'max-w-[100]' : ''}`}
      onClick={() => handleSlideClick(index)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={animate()}
    >
      {slide.src && (
        <img 
          src={slide.src} 
          alt={slide.title} 
          className="w-[calc(100%-8px)] h-[calc(100%-80px)] object-cover rounded-2xl border border-white/20 mx-auto"
        />
      )}
      <div 
        className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4"
        style={slide.src ? {
          transform: `perspective(1000px) rotateX(${mousePosition.y * 10}deg) rotateY(${-mousePosition.x * 10}deg)`
        } : {}}
      >
        <div className="text-white">
          <h3 className="text-sm font-semibold text-white text-center flex-grow mb-2">{slide.title}</h3>
          {slide.description && (
            <p className="text-xs opacity-80 mb-2 overflow-y-auto max-h-[100px]">{slide.description}</p>
          )}
          {slide.button && (
            <button className="px-3 py-1 bg-white/20 rounded-full text-xs hover:bg-white/30 transition-colors">
              {slide.button}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface CarouselControlProps {
  type: string;
  title: string;
  handleClick: () => void;
}

const CarouselControl = ({
  type,
  title,
  handleClick,
}: CarouselControlProps) => {
  return (
    <button
      className={`w-10 h-10 flex items-center mx-2 justify-center bg-neutral-200 dark:bg-neutral-800 border-3 border-transparent rounded-full focus:border-[#6D64F7] focus:outline-none hover:-translate-y-0.5 active:translate-y-0.5 transition duration-200 ${
        type === "previous" ? "rotate-180" : ""
      }`}
      title={title}
      onClick={handleClick}
    >
      <IconArrowNarrowRight className="text-neutral-600 dark:text-neutral-200" />
    </button>
  );
};

interface CarouselProps {
  slides: SlideData[];
}

export default function Carousel({ slides }: CarouselProps) {
  const [current, setCurrent] = useState(0);

  const handlePreviousClick = () => {
    const previous = current - 1;
    setCurrent(previous < 0 ? slides.length - 1 : previous);
  };

  const handleNextClick = () => {
    const next = current + 1;
    setCurrent(next === slides.length ? 0 : next);
  };

  const handleSlideClick = (index: number) => {
    if (current !== index) {
      setCurrent(index);
    }
  };

  const id = useId();

  return (
    <div
      className="relative w-full max-w-xs mx-auto h-64"
      aria-labelledby={`carousel-heading-${id}`}
    >
      <ul
        className="absolute flex w-[300%] h-64 space-x-4 transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateX(calc(-${current * 100}% - ${current * 16}px))`,
        }}
      >
        {slides.map((slide, index) => (
          <li 
            key={index} 
            className="flex-shrink-0 w-[calc(100%-16px)] h-64 flex items-center"
          >
            <Slide
              slide={slide}
              index={index}
              current={current}
              handleSlideClick={handleSlideClick}
            />
          </li>
        ))}
      </ul>

      <div className="absolute flex justify-center w-full top-[calc(100%+1rem)]">
        <CarouselControl
          type="previous"
          title="Go to previous slide"
          handleClick={handlePreviousClick}
        />

        <CarouselControl
          type="next"
          title="Go to next slide"
          handleClick={handleNextClick}
        />
      </div>
    </div>
  );
}
