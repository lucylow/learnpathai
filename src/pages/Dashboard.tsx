import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Target, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
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
            <Link to="/dashboard" className="text-foreground font-medium">
              Dashboard
            </Link>
            <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back!</h1>
          <p className="text-muted-foreground text-lg">Continue your learning journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">2 completed this month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12 days</div>
              <p className="text-xs text-muted-foreground">Keep it up!</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">67%</div>
              <p className="text-xs text-muted-foreground">+12% from last week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24h</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Learning Paths */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Your Learning Paths</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Python Programming</CardTitle>
              <CardDescription>Master Python from basics to advanced concepts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">65%</span>
                </div>
                <Progress value={65} />
              </div>
              <div className="flex gap-4">
                <Button size="sm">Continue Learning</Button>
                <Button size="sm" variant="outline">View Details</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Web Development</CardTitle>
              <CardDescription>Build modern web applications with React</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">42%</span>
                </div>
                <Progress value={42} />
              </div>
              <div className="flex gap-4">
                <Button size="sm">Continue Learning</Button>
                <Button size="sm" variant="outline">View Details</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Machine Learning Basics</CardTitle>
              <CardDescription>Introduction to ML algorithms and applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">28%</span>
                </div>
                <Progress value={28} />
              </div>
              <div className="flex gap-4">
                <Button size="sm">Continue Learning</Button>
                <Button size="sm" variant="outline">View Details</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/80 backdrop-blur-sm px-6 py-12 mt-12">
        <div className="mx-auto max-w-7xl text-center text-muted-foreground">
          <p>&copy; 2025 LearnPath AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
