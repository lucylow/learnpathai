import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import { Layout } from "@/components/Layout";
import { Brain, Target, Zap, TrendingUp, Users, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-ai-learning.jpg";

const Index = () => {
  return (
    <Layout className="bg-[var(--gradient-hero)]">

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-20 pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Zap className="h-4 w-4" />
                AI-Powered Learning
              </div>
              <h1 className="text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Your Personalized Path to
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Mastery</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                LearnPath AI creates intelligent, adaptive learning journeys tailored to your goals, pace, and learning style. Experience education that evolves with you.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90 transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link to="/learning-path">Try Interactive Demo</Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-border hover:bg-secondary transition-[var(--transition-smooth)]"
                  asChild
                >
                  <Link to="/about">See How It Works</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl opacity-50" />
              <img 
                src={heroImage} 
                alt="AI-powered learning visualization" 
                className="relative rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24 bg-background/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-foreground sm:text-5xl">
              Learning That Adapts to You
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powered by advanced AI, LearnPath creates a unique educational experience designed around your needs.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Brain}
              title="AI-Powered Paths"
              description="Our intelligent system analyzes your learning style and creates customized paths that maximize retention and understanding."
            />
            <FeatureCard
              icon={Target}
              title="Goal-Oriented"
              description="Set your objectives and let our AI break them down into achievable milestones with personalized learning modules."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Adaptive Progress"
              description="As you learn, the AI adjusts difficulty and content in real-time to keep you challenged but not overwhelmed."
            />
            <FeatureCard
              icon={Users}
              title="Collaborative Learning"
              description="Connect with peers on similar paths, share insights, and grow together in an intelligent community."
            />
            <FeatureCard
              icon={BookOpen}
              title="Vast Content Library"
              description="Access thousands of high-quality courses across diverse subjects, all optimized for personalized learning."
            />
            <FeatureCard
              icon={Zap}
              title="Fast & Efficient"
              description="Learn faster with AI-optimized study sessions that focus on what matters most for your goals."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl font-bold text-foreground sm:text-5xl">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of learners who are achieving their goals faster with AI-powered personalization.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90 transition-all duration-300 hover:scale-105"
            asChild
          >
            <Link to="/dashboard">Get Started Now</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
