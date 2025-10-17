import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, Users, Star } from 'lucide-react';

const HeroSection = () => {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['JavaScript', 'Python', 'React', 'Machine Learning', 'Data Science'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-12">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
      </div>

      {/* Floating Elements - Hide on small screens */}
      <div className="hidden md:block absolute top-20 left-10 animate-float">
        <div className="w-6 h-6 bg-blue-400 rounded-full opacity-20"></div>
      </div>
      <div className="hidden md:block absolute top-40 right-20 animate-float" style={{ animationDelay: '1s' }}>
        <div className="w-8 h-8 bg-purple-400 rounded-full opacity-20"></div>
      </div>
      <div className="hidden md:block absolute bottom-40 left-20 animate-float" style={{ animationDelay: '2s' }}>
        <div className="w-10 h-10 bg-indigo-400 rounded-full opacity-20"></div>
      </div>

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 border border-gray-200 shadow-sm"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              AI-Powered Learning Platform
            </span>
          </motion.div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Master{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {words[currentWord]}
              </span>{' '}
              with AI
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg">
              LearnPathAI creates personalized learning paths that adapt to your pace, 
              filling knowledge gaps and accelerating your journey to mastery.
            </p>
          </div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-sm text-gray-600"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0" />
              <span className="text-sm sm:text-base">10,000+ Students</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 shrink-0" />
              <span className="text-sm sm:text-base">4.9/5 Rating</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <button className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto">
              <span className="flex items-center justify-center gap-2">
                Start Learning Free
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300 -z-10"></div>
            </button>

            <button className="group flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-gray-700 hover:text-gray-900 transition-colors duration-300 border-2 border-gray-300 hover:border-gray-400 w-full sm:w-auto">
              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
              Watch Demo
            </button>
          </motion.div>
        </motion.div>

        {/* Right Visual */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mt-8 lg:mt-0"
        >
          {/* Main Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 transform rotate-1 hover:rotate-0 transition-transform duration-500">
            {/* App Mockup */}
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full"></div>
                <div className="flex-1 text-center text-xs sm:text-sm font-medium text-gray-600">
                  Your Learning Path
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-blue-600">68%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: '68%' }}
                  ></div>
                </div>
              </div>

              {/* Learning Items */}
              <div className="space-y-3">
                {[
                  { name: 'Functions & Scope', status: 'completed', progress: 100 },
                  { name: 'Array Methods', status: 'completed', progress: 100 },
                  { name: 'Async/Await', status: 'current', progress: 68 },
                  { name: 'Promises', status: 'upcoming', progress: 0 },
                  { name: 'ES6+ Features', status: 'upcoming', progress: 0 },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      item.status === 'completed' 
                        ? 'bg-green-100 text-green-600' 
                        : item.status === 'current'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {item.status === 'completed' ? '✓' : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.name}</div>
                      {item.status === 'current' && (
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full transition-all duration-1000"
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    {item.status === 'completed' && (
                      <div className="text-green-500 text-sm">Mastered</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-yellow-400 text-yellow-900 px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-semibold shadow-lg"
          >
            +250 XP
          </motion.div>

          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 bg-green-400 text-green-900 px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-semibold shadow-lg"
          >
            Level 3
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

