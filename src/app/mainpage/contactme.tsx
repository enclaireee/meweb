"use client"
import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimate, stagger } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub, faInstagram, faLine, faSpotify } from '@fortawesome/free-brands-svg-icons';

const socials = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/fatihzamzami',
    icon: faLinkedin,
    bgColor: 'bg-blue-400',
  },
  {
    name: 'Line',
    url: 'https://line.me/ti/p/haiinifatih',
    icon: faLine,
    bgColor: 'bg-green-400',
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/fthzami',
    icon: faInstagram,
    bgColor: 'bg-pink-400',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/enclaire1443',
    icon: faGithub,
    bgColor: 'bg-blue-800',
  },
  {
    name: 'Spotify',
    url: 'https://open.spotify.com/user/31s4tbptqdhmx2wmxwmecw2eaz4y?si=b12fc2f74c5d4a8b',
    icon: faSpotify,
    bgColor: 'bg-[#1ED760]',
  },
];

function ContactMe() {
  const [scope, animate] = useAnimate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Intersection Observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && entry.intersectionRatio === 1) {
          setIsInView(true);
          if (containerRef.current) {
            observer.unobserve(containerRef.current);
          }
        }
      },
      {
        threshold: 1.0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);


  useEffect(() => {
    if (isInView) {
      animate(
        'a',
        { opacity: 1, y: 0 },
        {
          duration: 0.6,
          delay: stagger(0.2),
          ease: 'easeInOut',
        }
      );
    }
  }, [isInView, animate]);

  return (
    <div ref={containerRef} className="min-h-[50vh] flex flex-col justify-center items-center bg-gray-50 px-4">
      <div className="container mx-auto text-center mb-12">
        <motion.h1
          className="text-4xl sm:text-7xl font-poppins font-superbold text-gray-900"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          Get in Touch
        </motion.h1>
      </div>
      <div ref={scope} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full max-w-4xl">
        {socials.map((social, index) => (
          <motion.a
            key={index}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit my ${social.name}`}
            className={`${social.bgColor} h-24 sm:h-32 md:h-40 rounded-lg flex justify-center items-center`}
            initial={{ opacity: 0, y: 30 }}
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <FontAwesomeIcon icon={social.icon} className="text-white text-4xl sm:text-6xl md:text-8xl" />
          </motion.a>
        ))}
      </div>
    </div>
  );
}

export default ContactMe;