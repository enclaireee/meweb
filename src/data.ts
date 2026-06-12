import {
  FaCode,
  FaUserFriends,
  FaMedal,
  FaLaptopCode,
  FaCodeBranch,
  FaHeartbeat,
} from "react-icons/fa";
import {
  faLinkedin,
  faGithub,
  faInstagram,
  faLine,
  faSpotify,
} from "@fortawesome/free-brands-svg-icons";
import { IconType } from "react-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// =============================================================================
// PERSONAL INFO
// =============================================================================
export const personalInfo = {
  name: "Fatih Zamzami",
  email: "fatihzamzami@example.com", // Update with your actual email
  location: "Indonesia",
};

// =============================================================================
// SOCIAL LINKS
// =============================================================================
export interface Social {
  name: string;
  url: string;
  icon: IconDefinition;
  bgColor: string;
}

export const socials: Social[] = [
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/fatihzamzami",
    icon: faLinkedin,
    bgColor: "bg-blue-400",
  },
  {
    name: "Line",
    url: "https://line.me/ti/p/haiinifatih",
    icon: faLine,
    bgColor: "bg-green-400",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/fthzami",
    icon: faInstagram,
    bgColor: "bg-pink-400",
  },
  {
    name: "GitHub",
    url: "https://github.com/enclaireee",
    icon: faGithub,
    bgColor: "bg-blue-800",
  },
  {
    name: "Spotify",
    url: "https://open.spotify.com/user/31s4tbptqdhmx2wmxwmecw2eaz4y?si=b12fc2f74c5d4a8b",
    icon: faSpotify,
    bgColor: "bg-[#1ED760]",
  },
];

// =============================================================================
// EXPERIENCES / ACHIEVEMENTS
// =============================================================================
export interface Experience {
  id: number;
  title: string;
  role: string;
  period: string;
  description: string;
  icon: IconType;
  color: string;
  skills: string[];
}

export const experiences: Experience[] = [
  {
    id: 2,
    title: "2nd Winner of ProtoTech Competiton IEEE ITB Student Branch",
    role: "Software Developer",
    period: "2025",
    description:
      "Won a 2nd place in a competition organized by IEEE ITB Student Branch, showcasing skills in software development and problem-solving. Developed a prototype that addressed real-world challenges using innovative technology solutions in healthcare.",
    icon: FaHeartbeat,
    color: "bg-blue-500",
    skills: [
      "Software Development",
      "Prototype Development",
      "Healthcare Technology",
    ],
  },
  {
    id: 3,
    title: "EXERTION UI 1.0",
    role: "Director of Events",
    period: "2025",
    description:
      "Directed a nation scale tech and logic competition for high school and university students. Coordinated with the jurors and participants to ensure smooth execution of the event.",
    icon: FaCodeBranch,
    color: "bg-purple-500",
    skills: ["Event Management", "Team Leadership", "Communication"],
  },
  {
    id: 4,
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
    id: 5,
    title: "Exercise FTUI 2025",
    role: "Software Engineer",
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
    id: 6,
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
    id: 7,
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

// =============================================================================
// EDUCATION
// =============================================================================
export interface Education {
  id: number;
  institution: string;
  degree: string;
  field: string;
  period: string;
  description?: string;
}

export const education: Education[] = [
  // Add your education entries here
  // Example:
  // {
  //   id: 1,
  //   institution: "University of Indonesia",
  //   degree: "Bachelor's Degree",
  //   field: "Electrical Engineering",
  //   period: "2023 - Present",
  //   description: "Major in Computer Engineering",
  // },
];

// =============================================================================
// SKILLS
// =============================================================================
export const skills = {
  technical: [
    "JavaScript/TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Git",
    "HTML/CSS",
    "Tailwind CSS",
  ],
  soft: [
    "Leadership",
    "Team Collaboration",
    "Problem Solving",
    "Communication",
    "Event Management",
  ],
};
