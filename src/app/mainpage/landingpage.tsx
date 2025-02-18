"use client"
import { useState, useEffect, useRef } from "react"
import React from "react"
import { motion } from "motion/react"

function LandingPage() {
  const [firstControl, setFirstControl] = useState("hidden")
  const [secondControl, setSecondControl] = useState("hidden")
  const [thirdControl, setThirdControl] = useState("hidden")

  const parallaxRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${scrollTop * 0.4}px)`
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const firstTextDuration = 1500
    const secondTextDelay = firstTextDuration + 750
    const thirdTextDelay = secondTextDelay + 750

    setFirstControl("visible")

    const firstTextTimeout = setTimeout(() => {
      setFirstControl("fadeOut")
    }, firstTextDuration)

    const secondTextTimeout = setTimeout(() => {
      setSecondControl("visible")
    }, secondTextDelay)

    const thirdTextTimeout = setTimeout(() => {
      setThirdControl("visible")
    }, thirdTextDelay)

    return () => {
      clearTimeout(firstTextTimeout)
      clearTimeout(secondTextTimeout)
      clearTimeout(thirdTextTimeout)
    }
  }, [])

  return (

    <div className="relative w-full overflow-hidden h-screen">
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
          <div className="absolute inset-0 bg-black opacity-40 z-10" />
        </div>
      </div>
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
          <p className="text-white font-poppins font-extrabold text-center mt-4 text-2xl sm:text-xl md:text-2xl lg:text-4xl xl:text-4xl">
            Welcome to My <span className="text-light-200">Digital</span> Playground
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
        <p className="absolute text-white font-poppins font-superbold text-center mt-4 text-2xl sm:text-xl md:text-2xl lg:text-4xl xl:text-4xl">
          Step <span className="text-light-200">Into</span> My World of Discovery
        </p>
      </motion.div>

      <motion.div
        className="z-20 absolute bottom-8 left-0 right-0 flex justify-center items-center"
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
        <motion.div 
        className="text-white font-poppins font-superbold text-center mt-4 text-l sm:text-l md:text-l lg:text-xl xl:text-xl"
        whileHover={{
          backgroundColor: 'white',  
          color: '#18181a',  
          borderRadius: '8px',  
          scale: 1.05, 
          transition: {duration: 0.6},
        }}
        initial={{ 
          backgroundColor: 'transparent', 
          color: 'white',
          borderRadius: '8px',
        }} 
        style={{ 
          display: 'inline-block', 
          padding: '0px 10px', 
          boxSizing: 'border-box' 
        }}>
          Scroll down for <span className="text-light-200">more</span>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LandingPage;