import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Send } from "lucide-react";
import { Link } from "react-router-dom";

export default function Contact() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });

      // Reset form
      setEmail("");
      setName("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <Link to="/team" className="text-muted-foreground hover:text-foreground transition-colors">Team</Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="mb-12 text-center">
          <Badge className="mb-4">Get In Touch</Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about LearnPath AI? We'd love to hear from you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle>Send us a message</CardTitle>
              </div>
              <CardDescription>
                Fill out the form and we'll respond within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium mb-2 block">
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-sm font-medium mb-2 block">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="text-sm font-medium mb-2 block">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell us how we can help..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle>Contact Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">General Inquiries</h3>
                  <a href="mailto:hello@learnpath.ai" className="text-primary hover:underline">
                    hello@learnpath.ai
                  </a>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Technical Support</h3>
                  <a href="mailto:support@learnpath.ai" className="text-primary hover:underline">
                    support@learnpath.ai
                  </a>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Partnerships</h3>
                  <a href="mailto:partnerships@learnpath.ai" className="text-primary hover:underline">
                    partnerships@learnpath.ai
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1 text-sm">How does adaptive pathfinding work?</h3>
                  <p className="text-sm text-muted-foreground">
                    We use knowledge graphs and Bayesian knowledge tracing to sequence concepts based on prerequisites
                    and current mastery levels.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1 text-sm">Can teachers customize learning paths?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! Teachers can override AI recommendations, reorder concepts, and add custom resources.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1 text-sm">What data do you collect?</h3>
                  <p className="text-sm text-muted-foreground">
                    We collect learning events (quiz attempts, resource views) in xAPI format for analytics,
                    all anonymized and privacy-compliant.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-8">
              <h2 className="text-2xl font-bold mb-2">Ready to get started?</h2>
              <p className="text-muted-foreground mb-6">
                Try our interactive demo to see adaptive learning in action
              </p>
              <Link to="/learning-path">
                <Button size="lg">
                  Try Interactive Demo
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
