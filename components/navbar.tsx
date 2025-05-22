"use client"

import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import Switch from "@/components/Switch";

type Position = {
  left: number;
  width: number;
  opacity: number;
};

export default function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [position, setPosition] = useState<Position>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (previous === undefined) return;

    if (latest > previous && latest > 100) {
      setHidden(true);
      setIsMobileMenuOpen(false);
    } else {
      setHidden(false);
    }
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <motion.div
      variants={{
        visible: { y: 0 },
        hidden: { y: "-110%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 pb-2 md:justify-center"
    >
      <div className="container mx-auto flex items-center justify-between px-4 md:px-0 md:justify-center">
        <div className="md:hidden">
          <Switch isToggled={isMobileMenuOpen} onToggle={toggleMobileMenu} />
        </div>

        <div
          className={`
            md:flex md:relative md:w-auto md:bg-transparent md:p-0 md:border-none
            ${
              isMobileMenuOpen
                ? "absolute top-16 left-0 right-0 bg-black/90 p-4 border-t border-gray-700 flex flex-col items-center space-y-2"
                : "hidden"
            }
          `}
        >
          <ul
            onMouseLeave={() => {
              if (!isMobileMenuOpen) {
                setPosition((pv) => ({
                  ...pv,
                  opacity: 0,
                }));
              }
            }}
            className="relative flex flex-col md:flex-row w-full md:w-fit rounded-full border-2 border-black bg-black p-1 items-center"
          >
            <Tab setPosition={setPosition} href="/" isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu}>Home</Tab>
            <Tab setPosition={setPosition} href="/pricing" isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu}>Pricing</Tab>
            <Tab setPosition={setPosition} href="/research" isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu}>Research</Tab>
            <Tab setPosition={setPosition} href="/features" isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu}>Features</Tab>
            <Tab setPosition={setPosition} href="/use-cases" isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu}>Use Cases</Tab>
            <Tab setPosition={setPosition} href="/bucket-list" isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu}>Bucket List</Tab>

            {!isMobileMenuOpen && <Cursor position={position} />}
          </ul>
        </div>
        <div className="hidden md:flex w-10 h-10"></div>
      </div>
    </motion.div>
  );
}

const Tab = ({
  children,
  setPosition,
  href,
  isMobileMenuOpen,
  toggleMobileMenu,
}: {
  children: string;
  setPosition: Dispatch<SetStateAction<Position>>;
  href: string;
  isMobileMenuOpen?: boolean;
  toggleMobileMenu?: () => void;
}) => {
  const ref = useRef<null | HTMLLIElement>(null);

  const handleClick = () => {
    if (isMobileMenuOpen && toggleMobileMenu) {
      toggleMobileMenu();
    }
  };

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (isMobileMenuOpen) return;
        if (!ref?.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({
          left: ref.current.offsetLeft,
          width,
          opacity: 1,
        });
      }}
      className="relative z-10 flex items-center justify-center cursor-pointer px-3 py-1.5 text-xs uppercase text-white md:px-5 md:py-3 md:text-base border-2 border-transparent hover:border-white rounded-full transition-colors duration-200 w-full md:w-auto my-1 md:my-0"
      onClick={handleClick}
    >
      <Link href={href} passHref legacyBehavior>
        <a>{children}</a>
      </Link>
    </li>
  );
};

const Cursor = ({ position }: { position: Position }) => {
  return (
    <motion.li
      animate={{
        ...position,
      }}
      className="absolute z-0 h-7 rounded-full bg-black md:h-12"
    />
  );
};
