import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Frontend Developer',
      company: 'TechCorp',
      image: '👩‍💻',
      content: 'LearnPathAI helped me fill critical gaps in my JavaScript knowledge that I didn\'t even know I had. Went from intermediate to advanced in 3 months!',
      rating: 5,
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Bootcamp Graduate',
      company: 'Self-Taught',
      image: '👨‍🎓',
      content: 'The personalized learning path saved me hundreds of hours. Instead of watching endless tutorials, I focused exactly on what I needed to learn next.',
      rating: 5,
    },
    {
      name: 'Emily Watson',
      role: 'Product Manager',
      company: 'StartupXYZ',
      image: '👩‍💼',
      content: 'As a PM, I needed to understand technical concepts quickly. LearnPathAI adapted to my pace and helped me speak the same language as my engineering team.',
      rating: 5,
    },
    {
      name: 'Alex Thompson',
      role: 'Full Stack Developer',
      company: 'DigitalAgency',
      image: '👨‍💻',
      content: 'The AI tutor is incredible. It explains complex concepts in simple terms and provides perfect examples for my specific use cases.',
      rating: 5,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-900 to-purple-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Loved by Students
          </h2>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Join thousands of learners who transformed their skills with LearnPathAI
          </p>
        </motion.div>

        <div className="relative">
          {/* Testimonial Carousel */}
          <div className="relative h-96">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/20">
                  <Quote className="w-12 h-12 text-purple-300 mb-6" />
                  
                  <div className="flex flex-col lg:flex-row gap-8 items-center">
                    {/* Content */}
                    <div className="flex-1">
                      <p className="text-xl lg:text-2xl text-white leading-relaxed mb-6">
                        "{testimonials[currentTestimonial].content}"
                      </p>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      
                      {/* Author Info */}
                      <div>
                        <div className="text-white font-semibold text-lg">
                          {testimonials[currentTestimonial].name}
                        </div>
                        <div className="text-purple-200">
                          {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].company}
                        </div>
                      </div>
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl">
                        {testimonials[currentTestimonial].image}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            {/* Dots Indicator */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial
                      ? 'bg-white w-8'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
        >
          {[
            { number: '10K+', label: 'Happy Students' },
            { number: '50+', label: 'Countries' },
            { number: '96%', label: 'Success Rate' },
            { number: '4.9/5', label: 'Average Rating' },
          ].map((stat, index) => (
            <div key={stat.label} className="space-y-2">
              <div className="text-2xl lg:text-3xl font-bold text-white">
                {stat.number}
              </div>
              <div className="text-purple-200 text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;

