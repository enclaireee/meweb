"use client";
import React, { useEffect, useState } from "react";
import { motion, useAnimate, stagger } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faGithub,
  faInstagram,
  faLine,
  faSpotify,
} from "@fortawesome/free-brands-svg-icons";

const socials = [
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

export default function ContactMe() {
  const [scope, animate] = useAnimate();
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
      },
    );

    const element = scope.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [scope]);

  useEffect(() => {
    if (isInView) {
      animate(
        "a",
        { opacity: 1 },
        {
          duration: 0.3,
          delay: stagger(0.1),
        },
      );
    }
  }, [isInView, animate]);

  return (
    <div
      className="relative w-full"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      {/* Sticky content container with reduced height */}
      <div className="fixed w-full h-[40vh] bottom-0 z-10">
        <div className="h-full bg-gradient-to-b from-gray-800 via-gray-900 to-black flex flex-col justify-center items-center overflow-hidden">
          {/* Top curve overlay */}
          <div
            className="absolute top-0 left-0 right-0 h-16 bg-gray-800"
            style={{
              borderTopLeftRadius: "50% 100%",
              borderTopRightRadius: "50% 100%",
            }}
          />

          <div className="container mx-auto text-center mb-4 relative z-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-white">
              Get in <span className="text-light-200">Touch</span>
            </h1>

            <div className="w-16 h-1 bg-light-200 mx-auto mt-2 rounded-full" />
          </div>

          <div
            ref={scope}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 w-full max-w-4xl px-4 relative z-10"
          >
            {socials.map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit my ${social.name}`}
                className={`${social.bgColor} h-14 sm:h-16 md:h-20 rounded-lg flex justify-center items-center
                  shadow-md hover:shadow-lg transition-shadow duration-200 backdrop-blur-sm`}
                initial={{ opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon
                  icon={social.icon}
                  className="text-white text-xl sm:text-2xl md:text-3xl"
                />
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* Spacer div with reduced height */}
      <div className="w-full h-[40vh]"></div>
    </div>
  );
}
