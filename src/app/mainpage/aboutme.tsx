"use client"
import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { Reveal } from '../animations/reveal'

function About() {
  return (
    <div className="w-full bg-white">
      <ScreenOne />
      <ScreenTwo />
    </div>
  );
}

export default About;

function ScreenOne() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.7])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const scaleText = useTransform(scrollYProgress, [0, 1], [1, 0.8])

  return (
    <div className="bg-white w-full h-screen">
      <motion.div 
        className="h-screen relative bg-white" 
        ref={targetRef}
        style={{
          scale,
          opacity
        }}
      >
        <motion.div
          style={{
            backgroundImage: `url('/assets/fototim2.jpeg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "20px",
            margin: 60 
          }}
          className="absolute inset-0 p-4 rounded-2xl"
        ></motion.div>
        <div className="absolute inset-0 flex justify-center items-center z-10">
          <Reveal>
            <motion.h1
              className="font-poppins font-black text-white text-center"
              style={{
                scale: scaleText,
                opacity: 1,
                fontSize: 'clamp(5rem, 10vw, 9rem)' 
              }}
            >
                About <span className="text-light-200">Me</span>
            </motion.h1>
          </Reveal>
        </div>
      </motion.div>
    </div>
  )
}

function ScreenTwo() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  })
  
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8])
  const y = useTransform(scrollYProgress, [0, 1], [300, -300])
  const opacity = useTransform(scrollYProgress, [0.15, 0.5, 0.85], [0, 1, 0])

  return (
    <div className="bg-white w-full h-screen">
      <motion.div
        ref={targetRef}
        className="relative h-screen bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden"
        style={{ scale }}
      >
        <motion.div
          style={{ y, opacity }}
          className="relative flex flex-col lg:flex-row items-center justify-center w-full h-full space-y-8 lg:space-y-0 lg:space-x-8 px-4 sm:px-8" 
        >
          <div className="flex flex-col justify-center space-y-6 max-w-xl text-center lg:text-left relative z-10">
            <Reveal>
              <p className="text-3xl sm:text-5xl text-black font-poppins font-black leading-tight">
                Hi! Im Muhammad <span className="text-light-200">Fatih Zamzami</span>.
              </p>
            </Reveal>
            <Reveal>
              <p className="text-xl sm:text-2xl text-black/80 font-poppins font-black">
                I'm an ambitious and dedicated electrical engineering student @  <span className="text-light-200">Universitas Indonesia</span>.
              </p>
            </Reveal>
          </div>
          <Reveal>
            <motion.div className="relative flex items-center justify-center lg:justify-end z-0 rounded-xl">
              <div className="relative w-full max-w-[35rem] h-[20rem] sm:h-[30rem] lg:h-[40rem]">
                <div className="relative w-full h-full bg-white rounded-xl overflow-hidden shadow-lg">
                  <img
                    src="/assets/fotodiri3.jpeg"
                    alt="Fatih"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </Reveal>
        </motion.div>
      </motion.div>
    </div>
  )
}