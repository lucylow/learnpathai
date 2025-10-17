import { Button } from '@/components/ui/button'
import { Brain, Target, TrendingUp, Sparkles, BookOpen, Award } from 'lucide-react'

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-emerald-600/10"></div>
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">AI-Powered Personalized Learning</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent animate-slide-up">
              LearnPath.AI
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Your journey to mastery, guided by intelligence
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Personalized learning pathways powered by intelligent AI that diagnoses gaps, curates resources, and adapts as you learn.
            </p>
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Start Your Learning Journey
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How LearnPath.AI Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="AI-Powered Assessment"
              description="Our intelligent system diagnoses your current knowledge level and identifies learning gaps with precision."
              color="blue"
            />
            <FeatureCard
              icon={<Target className="w-8 h-8" />}
              title="Personalized Pathways"
              description="Get a customized learning path tailored to your goals, learning style, and current knowledge."
              color="purple"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Adaptive Learning"
              description="Your path evolves based on your progress, ensuring optimal learning efficiency and engagement."
              color="emerald"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose LearnPath.AI?</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <BenefitCard
              icon={<BookOpen className="w-6 h-6" />}
              title="Curated Resources"
              description="Access high-quality learning materials matched to your needs and preferences."
            />
            <BenefitCard
              icon={<Award className="w-6 h-6" />}
              title="Track Progress"
              description="Monitor your mastery with detailed analytics and achievement milestones."
            />
            <BenefitCard
              icon={<Sparkles className="w-6 h-6" />}
              title="Smart Recommendations"
              description="Receive intelligent suggestions for next steps based on your performance."
            />
            <BenefitCard
              icon={<Target className="w-6 h-6" />}
              title="Goal-Oriented"
              description="Stay focused on your learning objectives with structured pathways."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of learners achieving their goals with AI-powered personalization</p>
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm opacity-75">
            © 2025 LearnPath.AI - Built for EduHacks AI Fest 2025 • Powered by AI
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    emerald: 'bg-emerald-100 text-emerald-600'
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className={`w-16 h-16 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function BenefitCard({ icon, title, description }) {
  return (
    <div className="flex gap-4 items-start bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-emerald-100 flex items-center justify-center text-blue-600 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-bold mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
}

