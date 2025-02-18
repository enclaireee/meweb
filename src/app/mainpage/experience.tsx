"use client";
import React, { useRef } from "react";
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

export default function ExperienceContent() {
  const pinnedRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: pinnedRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -800]);

  return (
    <div className="bg-gray-50">
      <div ref={pinnedRef} className="relative" style={{ height: "200vh" }}>
        <div className="sticky top-0 h-[120vh] flex flex-col items-center justify-center">
          <div className="text-center mb-12">
            <motion.h1 className="font-poppins text-6xl font-extrabold">
              My <span className="text-yellow-400">Experiences</span>
            </motion.h1>
          </div>
          <motion.div
            style={{ x }}
            className="w-full max-w-6xl mx-auto flex space-x-8"
          >
            {experiences.map((experience) => (
              <div
                key={experience.id}
                className="min-w-[300px] p-8 rounded-xl shadow-lg bg-white"
              >
                <h2 className="font-poppins text-3xl font-bold text-yellow-400 mb-2">
                  {experience.title}
                </h2>
                <p className="font-poppins text-xl font-semibold text-black mb-4">
                  {experience.role}
                </p>
                <p className="font-poppins text-lg text-gray-700">
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
