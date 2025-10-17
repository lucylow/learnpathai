/**
 * StudyRoom Component
 * 
 * Main collaborative learning interface with:
 * - Real-time chat
 * - Collaborative code editor
 * - AI facilitator panel
 * - Group mastery visualization
 * - Member presence
 */

import React, { useState, useRef, useEffect } from 'react';
import { useCollaboration, User } from '../../hooks/useCollaboration';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  Users, 
  MessageSquare, 
  Code, 
  BookOpen, 
  Bot, 
  Trophy, 
  Send, 
  Sparkles,
  Target,
  UserCog
} from 'lucide-react';
import { cn } from '../../lib/utils';
import GroupMasteryChart from './GroupMasteryChart';
import AIFacilitatorPanel from './AIFacilitatorPanel';
import CollaborativeEditor from './CollaborativeEditor';

interface StudyRoomProps {
  roomId: string;
  user: User;
  learningPath?: {
    currentConcept?: string;
    currentConcepts?: string[];
    [key: string]: any;
  };
  onExit?: () => void;
}

export const StudyRoom: React.FC<StudyRoomProps> = ({
  roomId,
  user,
  learningPath,
  onExit
}) => {
  const {
    isConnected,
    members,
    messages,
    sharedState,
    groupMastery,
    aiFacilitator,
    currentQuiz,
    sendMessage,
    updateCode,
    updateNotes,
    generateGroupQuiz,
    requestAIFacilitator,
    assignRoles,
    requestSummary
  } = useCollaboration({ roomId, user, learningPath });

  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showQuizDetails, setShowQuizDetails] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentQuiz) {
      setShowQuizDetails(true);
    }
  }, [currentQuiz]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleGenerateQuiz = () => {
    const concepts = learningPath?.currentConcepts || ['functions', 'variables'];
    generateGroupQuiz(concepts);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string | null | undefined) => {
    const colors: Record<string, string> = {
      'Driver': 'bg-blue-500',
      'Navigator': 'bg-green-500',
      'Researcher': 'bg-purple-500',
      'Reviewer': 'bg-orange-500',
      'Facilitator': 'bg-pink-500'
    };
    return role ? colors[role] || 'bg-gray-500' : 'bg-gray-400';
  };

  const getRoleEmoji = (role: string | null | undefined) => {
    const emojis: Record<string, string> = {
      'Driver': '🚗',
      'Navigator': '🧭',
      'Researcher': '🔍',
      'Reviewer': '✅',
      'Facilitator': '🎯'
    };
    return role ? emojis[role] || '👤' : '👤';
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-purple-600" />
                <CardTitle className="text-2xl">Study Room: {roomId.split(':')[1]?.slice(0, 8)}</CardTitle>
              </div>
              <Badge variant={isConnected ? 'default' : 'destructive'} className="gap-1">
                <span className={cn("h-2 w-2 rounded-full", isConnected ? 'bg-green-500' : 'bg-red-500')} />
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => requestSummary()}>
                <BookOpen className="h-4 w-4 mr-2" />
                Summary
              </Button>
              {onExit && (
                <Button variant="ghost" size="sm" onClick={onExit}>
                  Exit Room
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Members & Tools */}
        <div className="w-72 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="h-full flex flex-col">
            {/* Members */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members ({members.length})
              </h3>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {members.map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={cn("text-white", getRoleColor(member.role))}>
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        {member.role && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span>{getRoleEmoji(member.role)}</span>
                            {member.role}
                          </p>
                        )}
                      </div>
                      {member.online && (
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Separator />

            {/* Collaboration Tools */}
            <div className="p-4 space-y-2">
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground">COLLABORATION TOOLS</h3>
              
              <Button 
                className="w-full justify-start gap-2"
                variant="outline"
                onClick={handleGenerateQuiz}
                disabled={!isConnected}
              >
                <Target className="h-4 w-4" />
                Generate Group Quiz
              </Button>

              <Button 
                className="w-full justify-start gap-2"
                variant="outline"
                onClick={() => requestAIFacilitator('summarize')}
                disabled={!isConnected}
              >
                <Bot className="h-4 w-4" />
                AI Facilitator
              </Button>

              <Button 
                className="w-full justify-start gap-2"
                variant="outline"
                onClick={() => assignRoles('balanced')}
                disabled={!isConnected}
              >
                <UserCog className="h-4 w-4" />
                Assign Roles
              </Button>
            </div>

            <Separator />

            {/* Group Mastery */}
            {groupMastery && (
              <div className="flex-1 p-4 overflow-auto">
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  GROUP MASTERY
                </h3>
                <GroupMasteryChart mastery={groupMastery} compact />
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <TabsList className="h-12 px-4 w-full justify-start rounded-none bg-transparent">
                <TabsTrigger value="chat" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                  {messages.length > 0 && (
                    <Badge variant="secondary" className="ml-1">{messages.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="editor" className="gap-2">
                  <Code className="h-4 w-4" />
                  Collaborative Editor
                </TabsTrigger>
                <TabsTrigger value="ai" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Assistant
                  {aiFacilitator && (
                    <Badge variant="secondary" className="ml-1">New</Badge>
                  )}
                </TabsTrigger>
                {currentQuiz && (
                  <TabsTrigger value="quiz" className="gap-2">
                    <Trophy className="h-4 w-4" />
                    Group Quiz
                    <Badge variant="destructive" className="ml-1">Active</Badge>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3 p-3 rounded-lg",
                        message.user.id === user.id ? 'bg-primary/10 ml-8' : 'bg-muted mr-8',
                        message.type === 'ai_facilitation' && 'bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                      )}
                    >
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback>
                          {message.type === 'ai_facilitation' ? '🤖' : getInitials(message.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <p className="text-sm font-semibold">{message.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                          {message.type === 'ai_facilitation' && (
                            <Badge variant="outline" className="text-xs">AI</Badge>
                          )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={!isConnected}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!isConnected || !newMessage.trim()} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* Collaborative Editor Tab */}
            <TabsContent value="editor" className="flex-1 m-0 p-0">
              <CollaborativeEditor
                initialCode={sharedState.code}
                initialNotes={sharedState.notes}
                onCodeChange={updateCode}
                onNotesChange={updateNotes}
                isConnected={isConnected}
              />
            </TabsContent>

            {/* AI Assistant Tab */}
            <TabsContent value="ai" className="flex-1 m-0 p-0">
              <AIFacilitatorPanel
                facilitator={aiFacilitator}
                onRequestAction={requestAIFacilitator}
                isConnected={isConnected}
              />
            </TabsContent>

            {/* Quiz Tab */}
            {currentQuiz && (
              <TabsContent value="quiz" className="flex-1 m-0 p-4 overflow-auto">
                <div className="max-w-4xl mx-auto space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-600" />
                        {currentQuiz.teamChallenge.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{currentQuiz.teamChallenge.description}</p>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Success Criteria:</h4>
                        <ul className="space-y-1">
                          {currentQuiz.teamChallenge.successCriteria.map((criteria, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Badge variant="outline" className="mt-0.5">✓</Badge>
                              <span className="text-sm">{criteria}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Badge variant="secondary">
                        ⏱️ Estimated Time: {currentQuiz.teamChallenge.estimatedTime} minutes
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Collaborative Problem</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p>{currentQuiz.collaborativeProblem.description}</p>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Requirements:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {currentQuiz.collaborativeProblem.requirements.map((req, idx) => (
                            <li key={idx} className="text-sm">{req}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          💡 Hints
                        </h4>
                        <ul className="space-y-1">
                          {currentQuiz.collaborativeProblem.hints.map((hint, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">• {hint}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StudyRoom;

