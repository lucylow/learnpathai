
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Video, FlaskConical, Clock } from "lucide-react";

type Props = {
  id: string;
  title: string;
  type?: string;
  duration?: number;
  onOpen?: () => void;
};

const typeIcons = {
  video: Video,
  article: BookOpen,
  interactive: FlaskConical,
};

export default function ResourceCard({ id, title, type = "video", duration, onOpen }: Props) {
  const Icon = typeIcons[type as keyof typeof typeIcons] || BookOpen;
  
  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow"
      role="article" 
      aria-labelledby={`res-${id}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 id={`res-${id}`} className="font-semibold text-sm truncate">{title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs capitalize">
              {type}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {duration ?? 5} min
            </span>
          </div>
        </div>
        <Button 
          onClick={onOpen} 
          variant="outline" 
          size="sm"
          aria-label={`Open ${title}`}
        >
          Open
        </Button>
      </div>
    </Card>
  );
}
