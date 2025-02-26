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


  useEffect(() => {
    const refElement = containerRef.current; 
    if (!refElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && entry.intersectionRatio === 1) {
          setIsInView(true);
          observer.unobserve(refElement);
        }
      },
      {
        threshold: 1.0,
      }
    );

    observer.observe(refElement);

    return () => {
      if (refElement) {
        observer.unobserve(refElement);
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
    <div ref={containerRef} className="min-h-[50vh] flex flex-col justify-center items-center bg-gray-50 px-4 py-12 sm:py-16">
      <div className="container mx-auto text-center mb-8 sm:mb-12">
        <motion.h1
          className="text-3xl sm:text-5xl md:text-7xl font-poppins font-extrabold text-gray-900"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          Get in Touch
        </motion.h1>
      </div>
      <div ref={scope} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 w-full max-w-4xl px-4">
        {socials.map((social, index) => (
          <motion.a
            key={index}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit my ${social.name}`}
            className={`${social.bgColor} h-20 sm:h-32 md:h-40 rounded-lg flex justify-center items-center
              shadow-md hover:shadow-lg transition-shadow duration-200`}
            initial={{ opacity: 0, y: 30 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <FontAwesomeIcon 
              icon={social.icon} 
              className="text-white text-3xl sm:text-4xl md:text-6xl" 
            />
          </motion.a>
        ))}
      </div>
    </div>
  );
}

export default ContactMe;