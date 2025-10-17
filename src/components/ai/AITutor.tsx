import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Loader2, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { marked } from "marked";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AITutorProps {
  contextConcept?: string;
}

export function AITutor({ contextConcept }: AITutorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm your AI learning companion. ${contextConcept ? `I'm here to help you with **${contextConcept}**. ` : ''}Ask me anything about your learning journey!`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const simulateAIResponse = async (question: string): Promise<string> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock responses based on keywords
    if (question.toLowerCase().includes('function')) {
      return `Great question about **functions**! 

Functions are reusable blocks of code that perform specific tasks. Here's a simple example:

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

result = greet("Alice")
print(result)  # Output: Hello, Alice!
\`\`\`

Key concepts:
- **Parameters**: Values passed to the function (\`name\`)
- **Return value**: What the function gives back
- **Function call**: Using the function with \`greet("Alice")\`

Would you like me to explain any specific aspect in more detail?`;
    }

    if (question.toLowerCase().includes('loop')) {
      return `Excellent! Let's dive into **loops**. 

Loops let you repeat actions. The two main types are:

**1. For Loop** (when you know how many times):
\`\`\`python
for i in range(5):
    print(f"Iteration {i}")
\`\`\`

**2. While Loop** (when you check a condition):
\`\`\`python
count = 0
while count < 5:
    print(count)
    count += 1
\`\`\`

💡 **Pro tip**: Use \`for\` when iterating over collections, \`while\` for condition-based repetition.

Want to try a practice problem?`;
    }

    if (question.toLowerCase().includes('help') || question.toLowerCase().includes('stuck')) {
      return `I'm here to help! 🙌

Here's what I can do:
- **Explain concepts** in simple terms
- **Show examples** with code
- **Suggest practice** problems
- **Debug** your code
- **Recommend resources** tailored to your level

What specific topic would you like assistance with?`;
    }

    // Default response
    return `That's an interesting question about ${contextConcept || 'programming'}! 

Based on your current learning path, I recommend:

1. **Review the basics** - Make sure you understand the fundamentals
2. **Practice with examples** - Try the interactive exercises
3. **Test your knowledge** - Take a quick quiz

Would you like me to elaborate on any of these points? Feel free to ask specific questions!`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Simulate API call to AI backend
      const response = await simulateAIResponse(input);
      
      setIsTyping(false);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Tutor error:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again!',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </motion.div>
          </div>
          <div>
            <CardTitle className="text-lg">AI Learning Companion</CardTitle>
            <CardDescription className="text-xs">
              Powered by Advanced NLP • Context-Aware
            </CardDescription>
          </div>
        </div>
        {contextConcept && (
          <Badge variant="secondary" className="w-fit">
            Context: {contextConcept}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ 
                    __html: marked(message.content, { 
                      breaks: true,
                      gfm: true 
                    }) as string
                  }}
                />
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="flex gap-1">
                <motion.div
                  className="w-2 h-2 bg-foreground/60 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-foreground/60 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-foreground/60 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask anything... (Shift+Enter for new line)"
            className="min-h-[60px] max-h-[120px]"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

