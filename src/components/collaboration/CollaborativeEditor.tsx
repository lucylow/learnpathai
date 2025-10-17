/**
 * CollaborativeEditor Component
 * 
 * Simple collaborative code and notes editor with real-time sync
 * For production, consider using Y.js or Monaco Editor with collaborative features
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Code, FileText, Save, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CollaborativeEditorProps {
  initialCode: string;
  initialNotes: string;
  onCodeChange: (code: string) => void;
  onNotesChange: (notes: string) => void;
  isConnected: boolean;
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  initialCode,
  initialNotes,
  onCodeChange,
  onNotesChange,
  isConnected
}) => {
  const [code, setCode] = useState(initialCode);
  const [notes, setNotes] = useState(initialNotes);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Update local state when props change (from other users)
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  // Debounced sync to avoid too many socket events
  useEffect(() => {
    const timer = setTimeout(() => {
      if (code !== initialCode) {
        onCodeChange(code);
        setLastSaved(new Date());
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [code]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (notes !== initialNotes) {
        onNotesChange(notes);
        setLastSaved(new Date());
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [notes]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Collaborative Workspace</h3>
            <Badge variant={isConnected ? 'default' : 'secondary'} className="ml-2">
              {isConnected ? 'Live' : 'Offline'}
            </Badge>
          </div>
          {lastSaved && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Save className="h-3 w-3" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="code" className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="code" className="gap-2">
              <Code className="h-4 w-4" />
              Code Editor
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <FileText className="h-4 w-4" />
              Shared Notes
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="code" className="flex-1 m-0 p-4">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Code className="h-4 w-4" />
                Collaborative Code Editor
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Changes sync automatically with your team
              </p>
            </CardHeader>
            <CardContent className="pb-4 h-[calc(100%-5rem)]">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Start coding here... Changes will sync with your team
function example() {
  console.log('Hello, team!');
}"
                className={cn(
                  "h-full font-mono text-sm resize-none",
                  "focus-visible:ring-2 focus-visible:ring-purple-500"
                )}
                disabled={!isConnected}
              />
              {!isConnected && (
                <p className="text-xs text-destructive mt-2">
                  Offline - Changes won't sync until you reconnect
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="flex-1 m-0 p-4">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Shared Notes
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Take notes collaboratively with your team
              </p>
            </CardHeader>
            <CardContent className="pb-4 h-[calc(100%-5rem)]">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="# Team Notes

## Key Concepts
- Concept 1
- Concept 2

## Questions
- Question 1

## Action Items
- [ ] Task 1
- [ ] Task 2"
                className={cn(
                  "h-full text-sm resize-none",
                  "focus-visible:ring-2 focus-visible:ring-blue-500"
                )}
                disabled={!isConnected}
              />
              {!isConnected && (
                <p className="text-xs text-destructive mt-2">
                  Offline - Changes won't sync until you reconnect
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Bar */}
      <div className="p-2 border-t bg-muted/50 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Real-time collaboration enabled</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Auto-save every second</span>
        </div>
        <div>
          {isConnected ? (
            <span className="text-green-600 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
              Connected
            </span>
          ) : (
            <span className="text-orange-600">Reconnecting...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborativeEditor;

