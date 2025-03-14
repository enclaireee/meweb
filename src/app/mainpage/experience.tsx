"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaCode,
  FaUserFriends,
  FaMedal,
  FaCalendarAlt,
  FaLaptopCode,
} from "react-icons/fa";

const experiences = [
  {
    id: 1,
    title: "Ikatan Mahasiswa Elektro 2025",
    role: "Staff of Research and Development",
    period: "2025 - Present",
    description:
      "Conducted internal research and development by analyzing data and providing actionable recommendations. Collaborated with team members to implement data-driven improvements for organization initiatives.",
    icon: FaCode,
    color: "bg-blue-500",
    skills: [
      "Data Analysis",
      "Research Methodology",
      "Team Collaboration",
      "Project Planning",
    ],
  },
  {
    id: 2,
    title: "Exercise FTUI Staff 2025",
    role: "Software Division",
    period: "2025 - Present",
    description:
      "Developing secure, production-ready software while gaining hands-on experience in the full development workflow. Contributed to frontend and backend components of web applications.",
    icon: FaLaptopCode,
    color: "bg-yellow-400",
    skills: [
      "JavaScript/TypeScript",
      "React",
      "Next.js",
      "Git Version Control",
    ],
  },
  {
    id: 3,
    title: "Indonesian Delegate at 2023 World Scout Jamboree",
    role: "Team Leader",
    period: "2023",
    description:
      "Led a team of delegates at the World Scout Jamboree, fostering teamwork and global cultural exchange. Coordinated activities and ensured smooth communication between international participants.",
    icon: FaUserFriends,
    color: "bg-green-500",
    skills: [
      "Leadership",
      "Cross-Cultural Communication",
      "Problem Solving",
      "Event Management",
    ],
  },
  {
    id: 4,
    title: "Hong Kong International Mathematics Olympiad 2019",
    role: "Bronze Medalist",
    period: "2019",
    description:
      "Achieved a bronze medal, showcasing problem-solving and analytical skills in a highly competitive international mathematics competition against participants from around the world.",
    icon: FaMedal,
    color: "bg-amber-500",
    skills: [
      "Mathematical Analysis",
      "Logical Reasoning",
      "Competition Strategy",
      "Time Management",
    ],
  },
];

export default function ExperienceContent() {
  // Binary code background effect
  const [binaryCode, setBinaryCode] = useState<string[]>([]);

  useEffect(() => {
    const generateBinaryCode = () => {
      const codeLines = [];
      for (let i = 0; i < 15; i++) {
        let line = "";
        for (let j = 0; j < 30; j++) {
          line += Math.random() > 0.5 ? "1" : "0";
        }
        codeLines.push(line);
      }
      return codeLines;
    };

    setBinaryCode(generateBinaryCode());
  }, []);

  return (
    <div className="bg-gray-50 relative py-16 md:py-24 min-h-screen overflow-hidden">
      {/* Decorative binary code background */}
      <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
        {binaryCode.map((line, index) => (
          <motion.div
            key={index}
            className="text-xs font-mono text-black whitespace-nowrap"
            style={{ position: "absolute", top: `${index * 7}%`, left: 0 }}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, delay: index * 0.1 }}
          >
            {line}
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-12 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-poppins font-black text-gray-900 mb-4">
            My <span className="text-yellow-400">Experiences</span>
          </h2>
          <motion.div
            className="h-1 w-24 bg-yellow-400 mx-auto rounded-full mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          />
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-poppins">
            A journey through my professional and academic achievements
          </p>
        </motion.div>

        {/* Timeline view for experiences */}
        <div className="relative max-w-5xl mx-auto">
          {/* Timeline line */}
          <motion.div
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200"
            initial={{ height: 0 }}
            whileInView={{ height: "100%" }}
            transition={{ duration: 1.5 }}
            viewport={{ once: true }}
          />

          {experiences.map((experience, index) => (
            <TimelineItem
              key={experience.id}
              experience={experience}
              index={index}
              isEven={index % 2 === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface TimelineItemProps {
  experience: (typeof experiences)[0];
  index: number;
  isEven: boolean;
}

function TimelineItem({ experience, index, isEven }: TimelineItemProps) {
  const IconComponent = experience.icon;

  return (
    <motion.div
      className={`flex flex-col md:flex-row items-start mb-12 md:mb-16 relative`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      {/* Timeline dot */}
      <motion.div
        className={`absolute left-4 md:left-1/2 w-7 h-7 ${experience.color} rounded-full z-10 transform md:translate-x-[-0.875rem] flex items-center justify-center shadow-md`}
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 500,
          delay: index * 0.1 + 0.2,
        }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.2 }}
      >
        <span className="text-white text-xs">
          <IconComponent />
        </span>
      </motion.div>

      {/* Date indicator - visible on mobile */}
      <div className="md:hidden pl-12 mb-2 font-poppins text-sm text-gray-500 flex items-center">
        <FaCalendarAlt className="mr-2 text-yellow-400" />
        {experience.period}
      </div>

      {/* Content card - reorganized for mobile and desktop */}
      <div
        className={`
          ml-12 md:ml-0
          md:w-5/12
          ${isEven ? "md:mr-auto" : "md:ml-auto md:pl-12"}
          ${!isEven ? "md:text-right" : ""}
        `}
      >
        {/* Date indicator - desktop only */}
        <div
          className={`hidden md:flex items-center font-poppins text-sm text-gray-500 mb-2 ${!isEven ? "justify-end" : ""}`}
        >
          {!isEven && <span className="ml-2">{experience.period}</span>}
          <FaCalendarAlt
            className={`${isEven ? "mr-2" : "ml-2"} text-yellow-400`}
          />
          {isEven && <span className="ml-2">{experience.period}</span>}
        </div>

        <motion.div
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          whileHover={{ y: -5 }}
        >
          <div className={`h-2 ${experience.color}`} />
          <div className="p-6">
            <h3 className="text-xl font-poppins font-bold text-gray-800 mb-1">
              {experience.title}
            </h3>
            <p className="text-yellow-500 font-poppins font-medium mb-3">
              {experience.role}
            </p>
            <p className="text-gray-600 font-poppins text-sm mb-4">
              {experience.description}
            </p>

            <div className="mb-4">
              <p className="font-poppins font-semibold text-sm text-gray-700 mb-2">
                Key Skills:
              </p>
              <div className="flex flex-wrap gap-2">
                {experience.skills.slice(0, 3).map((skill, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 rounded-full px-3 py-1 text-xs font-poppins text-gray-700"
                  >
                    {skill}
                  </span>
                ))}
                {experience.skills.length > 3 && (
                  <span className="bg-gray-100 rounded-full px-3 py-1 text-xs font-poppins text-gray-700">
                    +{experience.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
