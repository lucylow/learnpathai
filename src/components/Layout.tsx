import { Navigation } from "./Navigation";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function Layout({ children, className = "" }: LayoutProps) {
  return (
    <div className={`min-h-screen ${className}`}>
      <Navigation />
      <main className="pt-20">{children}</main>
      <footer className="border-t border-border bg-background/80 backdrop-blur-sm px-6 py-12 mt-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                LearnPath AI
              </h3>
              <p className="text-sm text-muted-foreground">
                AI-powered personalized learning pathways for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="/learning-path" className="hover:text-foreground transition-colors">Demo</a></li>
                <li><a href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="/impact" className="hover:text-foreground transition-colors">Impact</a></li>
                <li><a href="/team" className="hover:text-foreground transition-colors">Team</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/docs" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="/contact" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 LearnPath AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

