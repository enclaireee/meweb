"use client";
import { useState, useEffect, useRef } from "react";
import React from "react";
import { motion } from "framer-motion";
import { BsChevronDown } from "react-icons/bs";
import { FaCode, FaLaptopCode } from "react-icons/fa";

function LandingPage() {
  const [firstControl, setFirstControl] = useState("hidden");
  const [secondControl, setSecondControl] = useState("hidden");
  const [thirdControl, setThirdControl] = useState("hidden");

  const parallaxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${scrollTop * 0.4}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const firstTextDuration = 1500;
    const secondTextDelay = firstTextDuration + 750;
    const thirdTextDelay = secondTextDelay + 750;

    setFirstControl("visible");

    const firstTextTimeout = setTimeout(() => {
      setFirstControl("fadeOut");
    }, firstTextDuration);

    const secondTextTimeout = setTimeout(() => {
      setSecondControl("visible");
    }, secondTextDelay);

    const thirdTextTimeout = setTimeout(() => {
      setThirdControl("visible");
    }, thirdTextDelay);

    return () => {
      clearTimeout(firstTextTimeout);
      clearTimeout(secondTextTimeout);
      clearTimeout(thirdTextTimeout);
    };
  }, []);

  // Floating tech elements
  const techElements = [
    { Icon: FaCode, top: "20%", left: "10%", size: "text-2xl", delay: 1.2 },
    {
      Icon: FaLaptopCode,
      top: "70%",
      left: "85%",
      size: "text-4xl",
      delay: 0.8,
    },
    { Icon: FaCode, top: "30%", left: "80%", size: "text-3xl", delay: 1.5 },
    {
      Icon: FaLaptopCode,
      top: "80%",
      left: "20%",
      size: "text-2xl",
      delay: 0.5,
    },
  ];

  return (
    <div className="relative w-full overflow-hidden h-screen">
      {/* Loading animation */}
      <motion.div
        className="w-full h-screen z-50"
        variants={{
          hidden: { left: 0 },
          visible: { left: "100%" },
        }}
        initial="hidden"
        animate="visible"
        transition={{
          duration: 0.6,
          ease: "easeIn",
        }}
        style={{
          position: "absolute",
          top: 4,
          bottom: 4,
          left: 0,
          right: 0,
          background: "#fad643",
          zIndex: 20,
        }}
      ></motion.div>

      {/* Background image with parallax */}
      <div className="w-full h-screen">
        <div className="inset-0">
          <motion.div
            ref={parallaxRef}
            className="absolute w-full h-full"
            style={{
              backgroundImage: `url('/assets/fototim1.jpeg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 bg-black opacity-50 z-10" />
        </div>
      </div>

      {/* Floating tech elements */}
      {techElements.map((tech, index) => (
        <motion.div
          key={index}
          className={`${tech.size} text-light-200/60 absolute z-15`}
          style={{ top: tech.top, left: tech.left }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.8, 0.5, 0.8],
            y: [0, -10, 0, 10],
            rotate: [0, 5, 0, -5],
          }}
          transition={{
            delay: tech.delay,
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <tech.Icon />
        </motion.div>
      ))}

      {/* Welcome text animations */}
      <div>
        <motion.div
          className="z-20 absolute inset-0 flex justify-center items-center"
          variants={{
            hidden: {
              opacity: 0,
              y: 50,
              transition: { duration: 0, ease: "easeInOut" },
              filter: "blur(33px)",
            },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, delay: 0.2, ease: "easeInOut" },
              filter: "blur(0px)",
            },
            fadeOut: {
              opacity: 0,
              y: -50,
              transition: { duration: 0.6, delay: 0.3, ease: "easeInOut" },
              filter: "blur(33px)",
            },
          }}
          initial="hidden"
          animate={firstControl}
        >
          <p className="text-white font-poppins font-extrabold text-center px-6 mt-4 text-2xl sm:text-xl md:text-2xl lg:text-4xl xl:text-5xl">
            Welcome to My <span className="text-light-200">Digital</span>{" "}
            Playground
          </p>
        </motion.div>
      </div>

      <motion.div
        className="absolute inset-0 flex justify-center items-center z-20"
        variants={{
          hidden: {
            opacity: 0,
            y: 50,
            transition: { duration: 0, ease: "easeInOut" },
            filter: "blur(33px)",
          },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, delay: 0.2, ease: "easeInOut" },
            filter: "blur(0px)",
          },
        }}
        initial="hidden"
        animate={secondControl}
      >
        <div className="text-center px-6">
          <p className="text-white font-poppins font-black text-2xl sm:text-xl md:text-2xl lg:text-4xl xl:text-5xl mb-4">
            Step <span className="text-light-200">Into</span> My World of
            Discovery
          </p>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="z-20 absolute bottom-12 left-0 right-0 flex flex-col justify-center items-center"
        variants={{
          hidden: {
            opacity: 0,
            y: 20,
            filter: "blur(33px)",
          },
          visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          },
        }}
        initial="hidden"
        animate={thirdControl}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          delay: 0.2,
        }}
      >
        <motion.div className="text-white font-poppins font-medium text-center text-lg px-4 py-2 mb-4">
          Scroll down for <span className="text-light-200">more</span>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          <BsChevronDown className="text-light-200 text-3xl" />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default LandingPage;
