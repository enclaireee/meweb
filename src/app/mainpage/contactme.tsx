"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { socials } from "@/data";
import { faPaperPlane, faEnvelope } from "@fortawesome/free-solid-svg-icons";

export default function ContactMe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["20%", "0%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setIsSubmitted(false), 3000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section 
      ref={containerRef} 
      className="relative w-full min-h-screen bg-[#000722] text-white flex items-center justify-center py-24 overflow-hidden"
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        style={{ y, opacity }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl"
      >
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-7xl font-poppins font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-light-200"
          >
            Get in Touch
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-gray-400 text-lg md:text-xl font-light"
          >
            Have a question or want to work together? Let's connect.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-start">
          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-300 ml-1">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 rounded-xl bg-black/30 border border-white/10 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 outline-none text-white transition-all duration-300 placeholder-gray-500 font-light"
                  placeholder="John Doe"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-300 ml-1">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 rounded-xl bg-black/30 border border-white/10 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 outline-none text-white transition-all duration-300 placeholder-gray-500 font-light"
                  placeholder="john@example.com"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-sm font-medium text-gray-300 ml-1">Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 rounded-xl bg-black/30 border border-white/10 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 outline-none text-white transition-all duration-300 placeholder-gray-500 font-light resize-none"
                  placeholder="How can I help you?"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="mt-2 w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {isSubmitting ? (
                    <motion.div
                      key="submitting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    />
                  ) : isSubmitted ? (
                    <motion.span
                      key="submitted"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="flex items-center gap-2"
                    >
                      Sent Successfully!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="send"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <span>Send Message</span>
                      <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </form>
          </motion.div>

          {/* Social Links & Info Block */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex flex-col gap-8 lg:px-6"
          >
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-all duration-300">
              <div className="absolute -inset-20 bg-gradient-to-b from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-6 border border-blue-500/30">
                  <FontAwesomeIcon icon={faEnvelope} className="text-2xl" />
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-white">Direct Email</h3>
                <p className="text-gray-400 font-light mb-6">
                  Prefer directly sending an email? Reach out here.
                </p>
                <a 
                  href="mailto:nestui.ft@gmail.com" 
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors group/link"
                >
                  nestui.ft@gmail.com
                  <span className="transform translate-x-0 group-hover/link:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
              <h3 className="text-xl font-semibold mb-6 text-white">Connect across platforms</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {socials.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`${social.bgColor} h-16 rounded-2xl flex justify-center items-center backdrop-blur-sm shadow-xl group relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <FontAwesomeIcon icon={social.icon} className="text-white text-3xl z-10 relative" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
