import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Shield, Zap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  const features = [
    'Personalized learning paths',
    'AI-powered knowledge tracing',
    'Interactive micro-challenges',
    'Real-time progress tracking',
    '24/7 AI tutor support',
    'Gamified learning experience'
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="space-y-6 sm:space-y-8"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6">
                Start Your AI-Powered Learning Journey Today
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 leading-relaxed">
                Join thousands of students accelerating their learning with personalized, 
                adaptive education that actually works.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3 sm:space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-2 sm:gap-3 text-blue-100"
                >
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-300 flex-shrink-0" />
                  <span className="text-sm sm:text-base lg:text-lg">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* Trust Signals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-wrap gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-blue-500"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 text-blue-200">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">Secure & Private</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-blue-200">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">Instant Setup</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-blue-200">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">10,000+ Students</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative mt-8 lg:mt-0"
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl">
              {/* Pricing Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
                  🎉 Most Popular Choice
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Free Trial
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-sm sm:text-base text-gray-600">for 14 days</span>
                </div>
                <p className="text-sm sm:text-base text-gray-600 mt-2">
                  Then $29/month. Cancel anytime.
                </p>
              </div>

              {/* CTA Form */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <Link to="/dashboard" className="block">
                  <button className="w-full group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <span className="flex items-center justify-center gap-2">
                      Start Free Trial
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </Link>

                <p className="text-center text-gray-500 text-xs sm:text-sm">
                  No credit card required • Get started in 30 seconds
                </p>
              </div>

              {/* Guarantee */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <div className="font-semibold text-gray-900 text-xs sm:text-sm">
                      14-Day Money Back Guarantee
                    </div>
                    <div className="text-gray-600 text-xs">
                      If you're not satisfied, get a full refund. No questions asked.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="hidden sm:block absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold shadow-lg text-sm"
            >
              🚀 Most Popular
            </motion.div>

            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="hidden sm:block absolute -bottom-4 -left-4 bg-green-400 text-green-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold shadow-lg text-sm"
            >
              ⭐ 4.9/5 Rating
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Trust Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 text-center"
        >
          <p className="text-blue-200 mb-4 sm:mb-6 text-sm sm:text-base">Trusted by students at</p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 lg:gap-16 opacity-80">
            {['Stanford', 'MIT', 'Google', 'Microsoft', 'Amazon', 'Netflix'].map((company) => (
              <div key={company} className="text-white font-semibold text-sm sm:text-base lg:text-lg">
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;

