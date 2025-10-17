import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, Clock, TrendingUp } from 'lucide-react';

const ValueProps = () => {
  const features = [
    {
      icon: Zap,
      title: 'Learn 2x Faster',
      description: 'AI identifies knowledge gaps and focuses on what you need to learn next',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Target,
      title: 'Personalized Paths',
      description: 'Every learning journey is unique and tailored to your goals',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Clock,
      title: 'Save Time',
      description: 'No more wasting time on content you already know',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Real-time analytics show your improvement over time',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why LearnPathAI Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Traditional learning is one-size-fits-all. We build personalized paths that adapt to you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative"
            >
              <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                {/* Icon */}
                <div className={`relative mb-6 inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white`}>
                  <feature.icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect Border */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}>
                  <div className="absolute inset-[2px] rounded-2xl bg-white"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
        >
          {[
            { number: '10K+', label: 'Active Students' },
            { number: '2.3x', label: 'Faster Learning' },
            { number: '94%', label: 'Completion Rate' },
            { number: '4.9/5', label: 'Student Rating' },
          ].map((stat, index) => (
            <div key={stat.label} className="space-y-2">
              <div className="text-3xl lg:text-4xl font-bold text-gray-900">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ValueProps;

