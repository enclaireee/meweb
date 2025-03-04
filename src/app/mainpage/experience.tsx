"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const experiences = [
  {
    id: 1,
    title: "Ikatan Mahasiswa Elektro 2025",
    role: "Staff of Research and Development",
    description:
      "Conducted internal research and development by analyzing data and providing actionable recommendations.",
  },
  {
    id: 2,
    title: "Exercise FTUI Staff 2025",
    role: "Software Division",
    description:
      "Developing secure, production-ready software while gaining hands-on experience in the full development workflow.",
  },
  {
    id: 3,
    title: "Indonesian Delegate at 2023 World Scout Jamboree",
    role: "Team Leader",
    description:
      "Led a team of delegates at the World Scout Jamboree, fostering teamwork and global cultural exchange.",
  },
  {
    id: 4,
    title: "Hong Kong International Mathematics Olympiad 2019",
    role: "Bronze Medalist",
    description:
      "Achieved a bronze medal, showcasing problem-solving and analytical skills.",
  },
];

// Custom hook to get the window width
function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

export default function ExperienceContent() {
  const pinnedRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: pinnedRef,
    offset: ["start start", "end end"],
  });

  // Adjust the translation distance based on viewport width
  const windowWidth = useWindowWidth();
  const translateDistance = windowWidth < 768 ? -400 : -800;
  const x = useTransform(scrollYProgress, [0, 1], [0, translateDistance]);

  return (
    <div className="bg-gray-50">
      <div ref={pinnedRef} className="relative" style={{ height: "200vh" }}>
        <div className="sticky top-0 flex flex-col items-center justify-center h-[120vh]">
          <div className="text-center mb-12 px-4">
            <motion.h1 className="font-poppins text-4xl md:text-6xl font-extrabold">
              My <span className="text-yellow-400">Experiences</span>
            </motion.h1>
          </div>
          <motion.div
            style={{ x }}
            className="w-full max-w-6xl mx-auto flex flex-nowrap gap-4 px-4"
          >
            {experiences.map((experience) => (
              <div
                key={experience.id}
                className="min-w-[250px] sm:min-w-[300px] p-6 sm:p-8 rounded-xl shadow-lg bg-white"
              >
                <h2 className="font-poppins text-xl sm:text-3xl font-bold text-yellow-400 mb-2">
                  {experience.title}
                </h2>
                <p className="font-poppins text-lg sm:text-xl font-semibold text-black mb-4">
                  {experience.role}
                </p>
                <p className="font-poppins text-base sm:text-lg text-gray-700">
                  {experience.description}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
