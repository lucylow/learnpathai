import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:shadow-[var(--shadow-card)] hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[var(--shadow-glow)]">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
