// src/components/AITutorChat.tsx
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  typing?: boolean;
}

interface AITutorChatProps {
  studentMastery?: Record<string, number>;
  currentConcept?: string;
  onClose?: () => void;
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

export const AITutorChat: React.FC<AITutorChatProps> = ({
  studentMastery = {},
  currentConcept,
  onClose,
  minimized = false,
  onToggleMinimize
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: `👋 Hi! I'm your AI Learning Coach. I can help you with:\n• Understanding concepts\n• Choosing the right resources\n• Planning your learning path\n• Answering questions\n\nWhat would you like to learn about?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI response based on context
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for concept-specific questions
    if (lowerMessage.includes('loop') || lowerMessage.includes('loops')) {
      return `Great question about loops! Based on your current mastery (${Math.round((studentMastery['loops'] || 0) * 100)}%), I recommend:\n\n1. Start with "for" loops - they're the most common\n2. Practice with simple counting exercises\n3. Then move to "while" loops for conditional iteration\n\nWould you like me to recommend a specific resource?`;
    }
    
    if (lowerMessage.includes('function') || lowerMessage.includes('functions')) {
      return `Functions are fundamental! You're at ${Math.round((studentMastery['functions'] || 0) * 100)}% mastery. Here's what to focus on:\n\n• Function declaration vs expression\n• Parameters and return values\n• Scope and closures\n\nTry building small utility functions first. Want some practice exercises?`;
    }
    
    if (lowerMessage.includes('stuck') || lowerMessage.includes('help') || lowerMessage.includes('confused')) {
      return `I understand it can be challenging! Let's break it down:\n\n1. What specific concept are you struggling with?\n2. Have you tried the interactive examples?\n3. Would you prefer a video tutorial or text guide?\n\nRemember: everyone learns at their own pace. You're doing great! 💪`;
    }
    
    if (lowerMessage.includes('recommend') || lowerMessage.includes('next') || lowerMessage.includes('should i learn')) {
      const recommendations: string[] = [];
      Object.entries(studentMastery).forEach(([concept, mastery]) => {
        if (mastery < 0.4) {
          recommendations.push(`📕 ${concept} (${Math.round(mastery * 100)}% - needs attention)`);
        }
      });
      
      if (recommendations.length > 0) {
        return `Based on your progress, I recommend focusing on:\n\n${recommendations.join('\n')}\n\nShall I find some resources for these topics?`;
      }
      
      return `You're doing well across the board! 🎉 Consider:\n\n• Reviewing concepts below 70% mastery\n• Trying advanced practice problems\n• Building a small project to apply your knowledge\n\nWhat sounds most interesting?`;
    }
    
    if (lowerMessage.includes('progress') || lowerMessage.includes('how am i doing')) {
      const masteredCount = Object.values(studentMastery).filter(m => m >= 0.7).length;
      const totalCount = Object.keys(studentMastery).length;
      const avgMastery = Object.values(studentMastery).reduce((a, b) => a + b, 0) / totalCount;
      
      return `Let's look at your progress! 📊\n\n• Mastered concepts: ${masteredCount}/${totalCount}\n• Average mastery: ${Math.round(avgMastery * 100)}%\n• Improvement this week: +12%\n\nYou're on the right track! Keep up the consistent effort. 🌟`;
    }
    
    // Default response
    return `That's a great question! Based on your learning profile, I can help you with:\n\n• Finding resources tailored to your level\n• Explaining tricky concepts step-by-step\n• Suggesting practice exercises\n• Planning your learning path\n\nCould you be more specific about what you'd like to know?`;
  };

  const streamResponse = async (response: string) => {
    let streamedContent = '';
    const typingSpeed = 30; // ms per character

    for (let i = 0; i < response.length; i++) {
      await new Promise(resolve => setTimeout(resolve, typingSpeed));
      streamedContent += response[i];
      
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.role === 'assistant' && lastMsg.typing) {
          return [...prev.slice(0, -1), { ...lastMsg, content: streamedContent }];
        }
        return [...prev, { 
          role: 'assistant', 
          content: streamedContent, 
          timestamp: new Date(),
          typing: true 
        }];
      });
    }

    // Mark as complete
    setMessages(prev => {
      const lastMsg = prev[prev.length - 1];
      if (lastMsg?.typing) {
        return [...prev.slice(0, -1), { ...lastMsg, typing: false }];
      }
      return prev;
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    try {
      const response = await generateResponse(input);
      await streamResponse(response);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again!',
        timestamp: new Date()
      }]);
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const quickActions = [
    { label: 'What should I learn next?', emoji: '🎯' },
    { label: 'Explain loops', emoji: '🔄' },
    { label: 'Show my progress', emoji: '📈' },
    { label: 'I\'m stuck on functions', emoji: '❓' },
  ];

  if (minimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          size="lg"
          className="rounded-full w-16 h-16 shadow-2xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
          onClick={onToggleMinimize}
        >
          <Bot className="w-8 h-8 text-white" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
    >
      <Card className="flex flex-col h-[600px] shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="w-7 h-7" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI Learning Coach</h3>
                <p className="text-xs opacity-90 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Online • Ready to help
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {onToggleMinimize && (
                <button
                  onClick={onToggleMinimize}
                  className="hover:bg-white/20 p-1.5 rounded transition"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="hover:bg-white/20 p-1.5 rounded transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : ''
                } ${msg.role === 'system' ? 'justify-center' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[75%] rounded-2xl p-3 ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : msg.role === 'system'
                    ? 'bg-gradient-to-r from-blue-50 to-emerald-50 text-gray-700 border border-blue-200 text-center'
                    : 'bg-white text-gray-900 shadow-md'
                }`}>
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {msg.content}
                  </p>
                  {msg.typing && (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="inline-block ml-1"
                    >
                      ▋
                    </motion.span>
                  )}
                  <span className="text-xs opacity-70 mt-1 block">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {!isStreaming && messages.length <= 2 && (
          <div className="px-4 py-2 border-t bg-white">
            <p className="text-xs text-gray-600 mb-2 font-medium">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => {
                    setInput(action.label);
                    setTimeout(() => handleSend(), 100);
                  }}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition flex items-center gap-1.5"
                >
                  <span>{action.emoji}</span>
                  <span>{action.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t bg-white rounded-b-lg">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask me anything..."
              disabled={isStreaming}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={isStreaming || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {isStreaming ? 'AI is thinking...' : 'Press Enter to send'}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

