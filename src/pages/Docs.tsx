import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout";
import { Code, BookOpen, Boxes, Database } from "lucide-react";
import { Link } from "react-router-dom";

export default function Docs() {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-12">
          <Badge className="mb-4">Documentation</Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4">Technical Overview</h1>
          <p className="text-xl text-muted-foreground">
            Architecture, APIs, and integration guides for LearnPath AI
          </p>
        </div>

        <Tabs defaultValue="architecture" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
            <TabsTrigger value="data">Data Model</TabsTrigger>
          </TabsList>

          <TabsContent value="architecture" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Boxes className="h-5 w-5 text-primary" />
                  <CardTitle>System Architecture</CardTitle>
                </div>
                <CardDescription>High-level overview of LearnPath AI components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-6 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`┌─────────────────┐
│   Frontend      │  React + TypeScript
│   (Vite)        │  Tailwind CSS + shadcn/ui
└────────┬────────┘
         │ REST/HTTP
         ▼
┌─────────────────┐
│   Backend API   │  Express.js
│   (Node.js)     │  Auth + routing
└────────┬────────┘
         │
    ┌────┴─────┬──────────────┐
    │          │              │
    ▼          ▼              ▼
┌─────────┐ ┌──────────┐ ┌──────────┐
│   AI    │ │  NLP     │ │  Data    │
│  (KT)   │ │ Pipeline │ │  Store   │
│FastAPI  │ │ Whisper  │ │PostgreSQL│
│         │ │ + spaCy  │ │          │
└─────────┘ └──────────┘ └──────────┘
     │           │             │
     └───────────┴─────────────┘
              │
              ▼
       ┌─────────────┐
       │     LRS     │  xAPI Events
       │  (Learning  │  Analytics
       │   Records)  │
       └─────────────┘`}</pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Core Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold mb-1">Knowledge Graph Engine</h3>
                  <p className="text-sm text-muted-foreground">
                    Represents concepts and prerequisites as a directed acyclic graph (DAG). Topological sort generates
                    valid learning sequences respecting dependencies.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold mb-1">Bayesian Knowledge Tracing</h3>
                  <p className="text-sm text-muted-foreground">
                    Beta-Bernoulli conjugate prior model estimates P(mastery | attempts). Updates in real-time as
                    students complete micro-assessments.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold mb-1">NLP Content Processor</h3>
                  <p className="text-sm text-muted-foreground">
                    Whisper for transcription, spaCy for entity extraction and concept tagging. Automatically indexes
                    video/audio content for searchability.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  <CardTitle>API Endpoints</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Badge className="mb-2">POST</Badge>
                  <code className="block bg-muted p-3 rounded text-sm">/api/paths/generate</code>
                  <p className="text-sm text-muted-foreground mt-2">
                    Generate personalized learning path based on target concepts and recent attempts
                  </p>
                  <div className="mt-3 bg-muted p-3 rounded text-xs font-mono">
                    {`{\n  "userId": "user123",\n  "targets": ["functions", "arrays"],\n  "recentAttempts": [\n    {"concept": "loops", "correct": false}\n  ]\n}`}
                  </div>
                </div>

                <div>
                  <Badge className="mb-2">GET</Badge>
                  <code className="block bg-muted p-3 rounded text-sm">/api/mastery/:userId</code>
                  <p className="text-sm text-muted-foreground mt-2">
                    Retrieve current mastery estimates for all concepts
                  </p>
                </div>

                <div>
                  <Badge className="mb-2">POST</Badge>
                  <code className="block bg-muted p-3 rounded text-sm">/api/resources/search</code>
                  <p className="text-sm text-muted-foreground mt-2">
                    Search for learning resources by concept, difficulty, or content type
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle>Integration Guide</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Installation</h3>
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    npm install @learnpath/sdk
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">2. Initialize Client</h3>
                  <div className="bg-muted p-3 rounded font-mono text-sm overflow-x-auto">
                    <pre>{`import { LearnPathClient } from '@learnpath/sdk';

const client = new LearnPathClient({
  apiKey: process.env.LEARNPATH_API_KEY,
  baseURL: 'https://api.learnpath.ai'
});`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">3. Generate Learning Path</h3>
                  <div className="bg-muted p-3 rounded font-mono text-sm overflow-x-auto">
                    <pre>{`const path = await client.generatePath({
  userId: 'student_123',
  targets: ['functions', 'arrays'],
  attempts: recentQuizData
});`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <CardTitle>Data Model</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded font-mono text-sm overflow-x-auto">
                  <pre>{`// Concept Node
{
  id: string;
  name: string;
  prerequisites: string[];  // IDs of required concepts
  difficulty: number;       // 1-5 scale
  estimatedTime: number;    // minutes
}

// Learning Resource
{
  id: string;
  title: string;
  type: 'video' | 'article' | 'interactive';
  concepts: string[];       // Tagged concepts
  duration: number;         // minutes
  url: string;
}

// Mastery Estimate
{
  userId: string;
  conceptId: string;
  mastery: number;          // 0-1 probability
  attempts: number;
  lastUpdated: Date;
}

// Learning Path Step
{
  concept: string;
  mastery: number;
  resources: Resource[];
  reasoning?: string;       // Explanation
}`}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Need help integrating LearnPath AI?
          </p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            Contact Support
          </Link>
        </div>
      </div>
    </Layout>
  );
}
