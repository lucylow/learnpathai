import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Users, Zap, Target, BookOpen, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            LearnPath AI
          </Link>
          <nav className="flex gap-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link to="/about" className="text-foreground font-medium">
              About
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16 space-y-6">
          <h1 className="text-5xl font-bold text-foreground">
            About LearnPath AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're revolutionizing education through AI-powered personalized learning paths that adapt to each student's unique needs, pace, and learning style.
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground text-lg">
              <p>
                LearnPath AI was created to solve one of education's biggest challenges: providing truly personalized learning experiences at scale. Traditional education often follows a one-size-fits-all approach, but we believe every learner deserves a path tailored to their unique strengths, goals, and learning preferences.
              </p>
              <p>
                By leveraging advanced AI and machine learning, we analyze learning patterns, identify knowledge gaps, and dynamically adjust content difficulty and teaching methods to maximize retention and understanding.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Key Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            What Makes Us Different
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Brain className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI-Powered Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our advanced algorithms analyze your learning patterns to create optimal study paths that evolve with your progress.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Goal-Focused Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Set clear objectives and watch as we break them down into achievable milestones with structured guidance.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Adaptive Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Content difficulty adjusts in real-time based on your performance, keeping you challenged but never overwhelmed.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Rich Content Library</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access thousands of courses across diverse subjects, all optimized for personalized learning experiences.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Collaborative Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect with peers on similar paths, share insights, and grow together in our intelligent community.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Fast Results</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Students achieve mastery 20% faster with our optimized study sessions focused on what matters most.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent className="pt-6">
              <div className="grid gap-8 md:grid-cols-3 text-center">
                <div>
                  <div className="text-4xl font-bold text-foreground mb-2">10K+</div>
                  <div className="text-muted-foreground">Active Learners</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-foreground mb-2">500+</div>
                  <div className="text-muted-foreground">Courses Available</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-foreground mb-2">95%</div>
                  <div className="text-muted-foreground">Satisfaction Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6 py-12">
          <h2 className="text-3xl font-bold text-foreground">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of learners who are achieving their goals faster with AI-powered personalization.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/dashboard">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/80 backdrop-blur-sm px-6 py-12">
        <div className="mx-auto max-w-7xl text-center text-muted-foreground">
          <p>&copy; 2025 LearnPath AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
