import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Github, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const team = [
  {
    name: "Lucy Low",
    role: "Founder & Product Lead",
    bio: "Product strategist and hackathon enthusiast. Leads product development and demo presentations, passionate about making personalized education accessible.",
    avatar: "LL",
    links: {
      github: "https://github.com/lucylow",
      linkedin: "#",
      email: "lucy@learnpath.ai",
    },
  },
  {
    name: "Alex Zhang",
    role: "AI Engineer",
    bio: "ML researcher specializing in knowledge tracing and recommendation systems. Developed the Bayesian mastery estimation and adaptive pathfinding algorithms.",
    avatar: "AZ",
    links: {
      github: "#",
      linkedin: "#",
      email: "alex@learnpath.ai",
    },
  },
  {
    name: "Priya Rao",
    role: "Frontend Engineer",
    bio: "Full-stack developer with expertise in React and UI/UX design. Creates engaging, accessible learning experiences and interactive demos.",
    avatar: "PR",
    links: {
      github: "#",
      linkedin: "#",
      email: "priya@learnpath.ai",
    },
  },
  {
    name: "Jordan Kim",
    role: "NLP Engineer",
    bio: "Natural language processing specialist. Built the content intelligence pipeline for automated resource tagging and concept extraction.",
    avatar: "JK",
    links: {
      github: "#",
      linkedin: "#",
      email: "jordan@learnpath.ai",
    },
  },
];

export default function Team() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            LearnPath AI
          </Link>
          <nav className="flex gap-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/learning-path" className="text-muted-foreground hover:text-foreground transition-colors">Demo</Link>
            <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link to="/impact" className="text-muted-foreground hover:text-foreground transition-colors">Impact</Link>
            <Link to="/team" className="text-foreground font-medium">Team</Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-12 text-center">
          <Badge className="mb-4">Meet the Team</Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4">The People Behind LearnPath AI</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A diverse team of educators, engineers, and researchers united by the mission to personalize learning
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {team.map((member) => (
            <Card key={member.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="mb-1">{member.name}</CardTitle>
                    <Badge variant="secondary" className="mb-2">{member.role}</Badge>
                    <CardDescription className="text-sm">
                      {member.bio}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <a
                    href={member.links.github}
                    className="p-2 rounded-md hover:bg-muted transition-colors"
                    aria-label={`${member.name}'s GitHub`}
                  >
                    <Github className="h-4 w-4" />
                  </a>
                  <a
                    href={member.links.linkedin}
                    className="p-2 rounded-md hover:bg-muted transition-colors"
                    aria-label={`${member.name}'s LinkedIn`}
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a
                    href={`mailto:${member.links.email}`}
                    className="p-2 rounded-md hover:bg-muted transition-colors"
                    aria-label={`Email ${member.name}`}
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              LearnPath AI was founded on the belief that every learner deserves a personalized educational experience.
              Traditional one-size-fits-all curricula fail to account for individual learning paces, styles, and prior knowledge.
            </p>
            <p className="text-muted-foreground">
              By combining knowledge graphs, Bayesian knowledge tracing, and NLP-powered content intelligence, we create
              adaptive learning pathways that meet each student where they are and guide them efficiently toward mastery.
            </p>
            <p className="text-muted-foreground">
              Our team brings together expertise in machine learning, education technology, and user experience design
              to build tools that empower both learners and educators.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Interested in joining our mission?
          </p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            Get In Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
