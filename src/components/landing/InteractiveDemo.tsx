import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';

const InteractiveDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = [
    {
      title: 'Initial Assessment',
      description: 'Take a quick 5-minute assessment to identify your current knowledge level',
      progress: 25,
    },
    {
      title: 'Personalized Path',
      description: 'AI generates a custom learning path based on your gaps and goals',
      progress: 50,
    },
    {
      title: 'Learn & Practice',
      description: 'Engage with interactive content and micro-challenges',
      progress: 75,
    },
    {
      title: 'Mastery Achieved',
      description: 'Track your progress and celebrate milestones',
      progress: 100,
    },
  ];

  const startDemo = () => {
    setIsPlaying(true);
    let step = 0;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
      step++;
      if (step >= steps.length) clearInterval(interval);
    }, 2000);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            See How It Works
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Experience the power of adaptive learning in just 30 seconds
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Demo Controls */}
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <button
                  onClick={isPlaying ? () => setIsPlaying(false) : startDemo}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
                  {isPlaying ? 'Pause' : 'Start Demo'}
                </button>
                <button
                  onClick={resetDemo}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm sm:text-base"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                  Reset
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-4 sm:mb-6">
                <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{steps[currentStep].progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${steps[currentStep].progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <AnimatePresence>
                  {steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: index <= currentStep ? 1 : 0.5,
                        x: 0,
                        scale: index === currentStep ? 1.02 : 1
                      }}
                      transition={{ duration: 0.3 }}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 ${
                        index === currentStep
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : index < currentStep
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                          index < currentStep
                            ? 'bg-green-500 text-white'
                            : index === currentStep
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {index < currentStep ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span className="text-xs sm:text-sm font-semibold">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{step.title}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">{step.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Visual Demo */}
          <div className="relative mt-8 lg:mt-0">
            <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-200">
              <div className="space-y-4 sm:space-y-6">
                {/* Knowledge Graph */}
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Your Knowledge Map</h3>
                  <div className="relative h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                      {['Variables', 'Functions', 'Objects', 'Arrays', 'Async', 'Classes'].map((concept, index) => (
                        <motion.div
                          key={concept}
                          initial={{ scale: 0 }}
                          animate={{ 
                            scale: currentStep >= 1 ? 1 : 0,
                            opacity: currentStep >= 1 ? 1 : 0
                          }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-2 sm:p-2.5 lg:p-3 rounded-lg text-xs sm:text-sm font-medium ${
                            index < 2 + currentStep 
                              ? 'bg-green-500 text-white shadow-lg' 
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {concept}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Current Focus */}
                <AnimatePresence>
                  {currentStep >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4"
                    >
                      <h4 className="font-semibold text-yellow-800 mb-1 sm:mb-2 text-sm sm:text-base">
                        🎯 Current Focus
                      </h4>
                      <p className="text-yellow-700 text-xs sm:text-sm">
                        Mastering Async/Await patterns and error handling
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Achievement */}
                <AnimatePresence>
                  {currentStep >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-4 sm:p-6 text-center"
                    >
                      <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🎉</div>
                      <h4 className="font-bold text-base sm:text-lg">Milestone Achieved!</h4>
                      <p className="text-green-100 text-xs sm:text-sm mt-0.5 sm:mt-1">
                        You've mastered JavaScript Fundamentals
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;

