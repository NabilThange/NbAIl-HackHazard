"use client"

import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";

type Position = {
  left: number;
  width: number;
  opacity: number;
};

export default function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

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
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.div
      variants={{
        visible: { y: 0 },
        hidden: { y: "-110%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 pb-2"
    >
      <ul
        onMouseLeave={() => {
          setPosition((pv) => ({
            ...pv,
            opacity: 0,
          }));
        }}
        className="relative flex w-fit rounded-full border-2 border-black bg-black p-1"
      >
        <Tab setPosition={setPosition} href="/">Home</Tab>
        <Tab setPosition={setPosition} href="/pricing">Pricing</Tab>
        <Tab setPosition={setPosition} href="/features">Features</Tab>
        <Tab setPosition={setPosition} href="/use-cases">Use Cases</Tab>
        <Tab setPosition={setPosition} href="/bucket-list">Bucket List</Tab>

        <Cursor position={position} />
      </ul>
    </motion.div>
  );
}

const Tab = ({
  children,
  setPosition,
  href,
}: {
  children: string;
  setPosition: Dispatch<SetStateAction<Position>>;
  href: string;
}) => {
  const ref = useRef<null | HTMLLIElement>(null);

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref?.current) return;

        const { width } = ref.current.getBoundingClientRect();

        setPosition({
          left: ref.current.offsetLeft,
          width,
          opacity: 1,
        });
      }}
      className="relative z-10 flex items-center justify-center cursor-pointer px-3 py-1.5 text-xs uppercase text-white md:px-5 md:py-3 md:text-base border-2 border-transparent hover:border-white rounded-full transition-colors duration-200"
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
