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
    <section className="py-20 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Start Your AI-Powered Learning Journey Today
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Join thousands of students accelerating their learning with personalized, 
                adaptive education that actually works.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 text-blue-100"
                >
                  <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
                  <span className="text-lg">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* Trust Signals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-wrap gap-6 pt-6 border-t border-blue-500"
            >
              <div className="flex items-center gap-2 text-blue-200">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Secure & Private</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <Zap className="w-5 h-5" />
                <span className="text-sm">Instant Setup</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <Users className="w-5 h-5" />
                <span className="text-sm">10,000+ Students</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              {/* Pricing Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  🎉 Most Popular Choice
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Free Trial
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600">for 14 days</span>
                </div>
                <p className="text-gray-600 mt-2">
                  Then $29/month. Cancel anytime.
                </p>
              </div>

              {/* CTA Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <Link to="/dashboard" className="block">
                  <button className="w-full group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <span className="flex items-center justify-center gap-2">
                      Start Free Trial
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </Link>

                <p className="text-center text-gray-500 text-sm">
                  No credit card required • Get started in 30 seconds
                </p>
              </div>

              {/* Guarantee */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
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
              className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-xl font-semibold shadow-lg"
            >
              🚀 Most Popular
            </motion.div>

            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 -left-4 bg-green-400 text-green-900 px-4 py-2 rounded-xl font-semibold shadow-lg"
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
          className="mt-16 text-center"
        >
          <p className="text-blue-200 mb-6">Trusted by students at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-80">
            {['Stanford', 'MIT', 'Google', 'Microsoft', 'Amazon', 'Netflix'].map((company) => (
              <div key={company} className="text-white font-semibold text-lg">
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

