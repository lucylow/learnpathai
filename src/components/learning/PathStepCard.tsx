import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import MasteryMeter from "./MasteryMeter";
import ResourceCard from "./ResourceCard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { PathStep } from "@/types/path";

export default function PathStepCard({ step, index }: { step: PathStep; index: number }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1">
            <Badge variant="outline" className="mt-1">
              {index + 1}
            </Badge>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{step.concept}</CardTitle>
                {step.reasoning && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Info className="h-4 w-4 text-muted-foreground" />
                          <span className="sr-only">Why this step?</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm"><strong>Why this?</strong> {step.reasoning}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="mt-3">
                <MasteryMeter value={step.mastery} />
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Hide' : 'Show'} resources for ${step.concept}`}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 space-y-2">
          {step.resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              id={resource.id}
              title={resource.title}
              type={resource.type}
              duration={resource.duration}
              onOpen={() => console.log("Open resource:", resource.id)}
            />
          ))}
        </CardContent>
      )}
    </Card>
  );
}
