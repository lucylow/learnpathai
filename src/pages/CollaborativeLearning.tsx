/**
 * CollaborativeLearning Page
 * 
 * Entry point for collaborative learning features:
 * - Create or join study rooms
 * - View active rooms
 * - Access collaborative learning tools
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  Users, 
  Plus, 
  LogIn, 
  Sparkles, 
  Trophy,
  Target,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import StudyRoom from '../components/collaboration/StudyRoom';
import { useNavigate } from 'react-router-dom';

const CollaborativeLearning: React.FC = () => {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [roomName, setRoomName] = useState('');
  const [roomIdToJoin, setRoomIdToJoin] = useState('');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const navigate = useNavigate();

  // Mock user for demo
  const currentUser = {
    id: localStorage.getItem('userId') || `user-${Math.random().toString(36).substr(2, 9)}`,
    name: userName || 'Anonymous User',
    email: 'user@example.com',
    avatar: '👤'
  };

  // Save user info to localStorage
  const saveUserInfo = () => {
    localStorage.setItem('userId', currentUser.id);
    localStorage.setItem('userName', currentUser.name);
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      alert('Please enter a room name');
      return;
    }

    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }

    saveUserInfo();

    // Generate room ID
    const roomId = `room:${Math.random().toString(36).substr(2, 9)}`;

    try {
      // In production, call the API to create room
      // const response = await fetch('http://localhost:3001/api/rooms/create', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     title: roomName,
      //     memberIds: [currentUser.id],
      //     concepts: ['functions', 'variables', 'loops']
      //   })
      // });
      // const data = await response.json();
      // setCurrentRoom(data.room.id);

      // For demo, directly set the room
      setCurrentRoom(roomId);
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('Failed to create room. Make sure the backend is running.');
    }
  };

  const handleJoinRoom = () => {
    if (!roomIdToJoin.trim()) {
      alert('Please enter a room ID');
      return;
    }

    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }

    saveUserInfo();
    setCurrentRoom(roomIdToJoin);
  };

  const handleExitRoom = () => {
    setCurrentRoom(null);
    setRoomName('');
    setRoomIdToJoin('');
  };

  // If user is in a room, show the StudyRoom component
  if (currentRoom) {
    return (
      <StudyRoom
        roomId={currentRoom}
        user={currentUser}
        learningPath={{
          currentConcept: 'functions',
          currentConcepts: ['functions', 'variables', 'loops']
        }}
        onExit={handleExitRoom}
      />
    );
  }

  // Otherwise, show the lobby/landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              AI-Powered Collaborative Learning
            </span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Learn Together, Grow Together
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join study rooms with real-time collaboration, AI facilitation, and adaptive group learning
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Real-Time Collaboration</CardTitle>
              <CardDescription>
                Chat, code, and learn together in synchronized study rooms
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <Sparkles className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>AI Facilitator</CardTitle>
              <CardDescription>
                Get intelligent guidance, summaries, and personalized recommendations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-pink-200 dark:border-pink-800">
            <CardHeader>
              <Trophy className="h-10 w-10 text-pink-600 mb-2" />
              <CardTitle>Adaptive Group Quizzes</CardTitle>
              <CardDescription>
                Personalized questions for each member based on mastery level
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create Room Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Plus className="h-6 w-6 text-purple-600" />
                Create Study Room
              </CardTitle>
              <CardDescription>
                Start a new collaborative learning session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Your Name</Label>
                <Input
                  id="userName"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  placeholder="e.g., Python Functions Study Group"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>

              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleCreateRoom}
              >
                <Plus className="h-5 w-5" />
                Create Room
                <ArrowRight className="h-5 w-5 ml-auto" />
              </Button>

              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Features included:</strong> Real-time chat, collaborative editor, AI facilitator, group quizzes, role assignment
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Join Room Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <LogIn className="h-6 w-6 text-blue-600" />
                Join Existing Room
              </CardTitle>
              <CardDescription>
                Enter a room ID to join your team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userNameJoin">Your Name</Label>
                <Input
                  id="userNameJoin"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomId">Room ID</Label>
                <Input
                  id="roomId"
                  placeholder="e.g., room:abc123def"
                  value={roomIdToJoin}
                  onChange={(e) => setRoomIdToJoin(e.target.value)}
                />
              </div>

              <Button
                className="w-full gap-2"
                size="lg"
                variant="outline"
                onClick={handleJoinRoom}
              >
                <LogIn className="h-5 w-5" />
                Join Room
                <ArrowRight className="h-5 w-5 ml-auto" />
              </Button>

              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Tip:</strong> Get the room ID from your team member who created the room
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Separator className="mb-8" />
          
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-purple-600">1</span>
                </div>
                <CardTitle className="text-lg">Create or Join</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Start a new study room or join an existing one with a room ID
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-blue-600">2</span>
                </div>
                <CardTitle className="text-lg">Collaborate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Chat, code, and take notes together in real-time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-pink-600">3</span>
                </div>
                <CardTitle className="text-lg">Get AI Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  AI facilitator provides summaries, recommendations, and quizzes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-green-600">4</span>
                </div>
                <CardTitle className="text-lg">Learn & Grow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track group mastery and achieve learning goals together
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 text-center">
          <Card className="inline-block">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <p className="text-3xl font-bold text-purple-600">Real-Time</p>
                  <p className="text-sm text-muted-foreground">Collaboration</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">AI-Powered</p>
                  <p className="text-sm text-muted-foreground">Facilitation</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-pink-600">Adaptive</p>
                  <p className="text-sm text-muted-foreground">Group Learning</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeLearning;

