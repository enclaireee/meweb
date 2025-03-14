"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Reveal } from "../animations/reveal";
import { FaUniversity, FaGraduationCap } from "react-icons/fa";

function About() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return (
    <div className="w-full bg-white overflow-hidden">
      <HeroSection />
      <ProfileSection />
    </div>
  );
}

export default About;

function HeroSection() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <motion.div
      id="hero-section"
      className="relative w-full h-[90vh] overflow-hidden"
      ref={targetRef}
      style={{
        opacity,
      }}
    >
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/fototim2.jpeg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/90 z-0" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center z-10 px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ y }}
        >
          <motion.h1
            className="font-poppins font-black text-white text-5xl sm:text-9xlxl md:text-7xl tracking-tight mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            About <span className="text-light-200">Me</span>
          </motion.h1>

          <motion.div
            className="w-16 h-1 bg-light-200 mx-auto rounded-full mb-6"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-0 right-0 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div
            className="w-1.5 h-1.5 bg-light-200 rounded-full"
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ marginTop: "6px" }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function ProfileSection() {
  const [activeTab, setActiveTab] = useState("education");
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 0.5], [100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  const education = [
    {
      title: "Universitas Indonesia",
      period: "2024 - Present",
      description: "Bachelor of Electrical Engineering",
      icon: FaUniversity,
    },
    {
      title: "SMAIT Nurul Fikri",
      period: "2021 - 2024",
      description: "Science Track",
      icon: FaGraduationCap,
    },
  ];

  const tabs = [
    { id: "education", label: "Education" },
    { id: "interests", label: "Interests" },
  ];

  const interests = [
    "Mathematics",
    "Electrical Engineering",
    "Software Development",
    "Machine Learning",
    "Problem Solving",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 py-20 relative">
      {/* Top curve overlay for seamless transition */}
      <div
        className="absolute top-0 left-0 right-0 h-32 bg-black"
        style={{
          borderBottomLeftRadius: "50% 100%",
          borderBottomRightRadius: "50% 100%",
        }}
      />

      <div className="container mx-auto px-4 relative z-10" ref={containerRef}>
        <motion.div className="max-w-5xl mx-auto" style={{ opacity, y }}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center text-white">
            {/* Profile Image - Left Side */}
            <motion.div
              className="lg:col-span-2 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 overflow-hidden rounded-full border-4 border-light-200/20">
                <Image
                  src="/assets/fotodiri3.jpeg"
                  alt="Fatih"
                  fill
                  className="object-cover"
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-light-200/20 to-transparent"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  viewport={{ once: true }}
                />
              </div>
            </motion.div>

            {/* Content - Right Side */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Reveal>
                <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-white mb-3">
                  Muhammad <span className="text-light-200">Fatih</span> Zamzami
                </h2>
              </Reveal>

              <motion.div
                className="h-1 w-16 bg-light-200 mb-6 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: 64 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              />

              <Reveal>
                <p className="text-lg font-poppins text-gray-300 mb-8">
                  Electrical Engineering Student combining technical expertise
                  with innovative problem-solving to create impactful solutions.
                </p>
              </Reveal>

              {/* Tabs Navigation */}
              <div className="mb-8">
                <div className="inline-flex rounded-full bg-gray-800/60 p-1 backdrop-blur-sm">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`px-5 py-2 rounded-full font-poppins text-sm transition-all duration-300 ${
                        activeTab === tab.id
                          ? "bg-light-200 text-gray-900 font-medium shadow-md"
                          : "text-gray-300 hover:text-white"
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <AnimatePresence mode="wait">
                  {activeTab === "education" && (
                    <motion.div
                      key="education"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="min-h-[180px]"
                    >
                      <div className="space-y-6">
                        {education.map((item, idx) => (
                          <motion.div
                            key={idx}
                            className="flex items-start"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.2 }}
                          >
                            <div className="p-3 bg-light-200/10 rounded-lg mr-4 text-light-200">
                              <item.icon size={20} />
                            </div>
                            <div>
                              <h3 className="font-poppins font-bold text-white text-lg">
                                {item.title}
                              </h3>
                              <p className="text-light-200 font-poppins text-sm mb-1">
                                {item.period}
                              </p>
                              <p className="text-gray-400 font-poppins text-sm">
                                {item.description}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "interests" && (
                    <motion.div
                      key="interests"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="min-h-[180px]"
                    >
                      <div className="flex flex-wrap gap-3">
                        {interests.map((interest, idx) => (
                          <motion.div
                            key={idx}
                            className="bg-gray-800/80 px-5 py-3 rounded-full font-poppins text-gray-200 border border-gray-700"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{
                              backgroundColor: "rgba(250, 214, 67, 0.15)",
                              borderColor: "rgba(250, 214, 67, 0.3)",
                              color: "#fad643",
                              scale: 1.03,
                              transition: { duration: 0.2 },
                            }}
                          >
                            {interest}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
