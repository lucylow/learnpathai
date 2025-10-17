import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Target, 
  BarChart3, 
  Gamepad2,
  Video,
  MessageSquare,
  Users,
  Zap
} from 'lucide-react';

const FeaturesGrid = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI Knowledge Tracing',
      description: 'Real-time assessment of your understanding and knowledge gaps',
      color: 'blue',
    },
    {
      icon: Target,
      title: 'Adaptive Learning Paths',
      description: 'Personalized curriculum that evolves with your progress',
      color: 'purple',
    },
    {
      icon: BarChart3,
      title: 'Progress Analytics',
      description: 'Detailed insights into your learning journey and milestones',
      color: 'green',
    },
    {
      icon: Gamepad2,
      title: 'Gamified Learning',
      description: 'Earn XP, level up, and unlock achievements as you learn',
      color: 'yellow',
    },
    {
      icon: Video,
      title: 'Smart Video Snippets',
      description: 'Watch only the relevant parts of tutorials you need',
      color: 'red',
    },
    {
      icon: MessageSquare,
      title: 'AI Tutor Assistant',
      description: '24/7 conversational tutor for instant help and explanations',
      color: 'indigo',
    },
    {
      icon: Users,
      title: 'Collaborative Learning',
      description: 'Study groups and peer programming sessions',
      color: 'pink',
    },
    {
      icon: Zap,
      title: 'Quick Challenges',
      description: '60-second micro-challenges to reinforce concepts',
      color: 'orange',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'from-blue-500 to-cyan-500',
      purple: 'from-purple-500 to-pink-500',
      green: 'from-green-500 to-emerald-500',
      yellow: 'from-yellow-500 to-orange-500',
      red: 'from-red-500 to-pink-500',
      indigo: 'from-indigo-500 to-purple-500',
      pink: 'from-pink-500 to-rose-500',
      orange: 'from-orange-500 to-red-500',
    };
    return colors[color] || colors.blue;
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Powerful Learning Features
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Everything you need to accelerate your learning journey, powered by AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group cursor-pointer"
            >
              <div className="relative h-full bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
                {/* Icon */}
                <div className={`relative mb-3 sm:mb-4 inline-flex p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${getColorClasses(feature.color)} text-white group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Content */}
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${getColorClasses(feature.color)} opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`}></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12 sm:mt-16"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8 border border-blue-200">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Ready to Transform Your Learning?
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
              Join thousands of students who are already accelerating their learning with AI
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto">
              Start Your Journey Today
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesGrid;

