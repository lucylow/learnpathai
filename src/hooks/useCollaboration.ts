/**
 * useCollaboration Hook
 * 
 * Manages real-time collaboration features for study rooms including:
 * - Socket.IO connection management
 * - Room membership and presence
 * - Chat messaging
 * - Group mastery tracking
 * - AI facilitation
 * - Role assignments
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface Member extends User {
  role?: string | null;
  online: boolean;
}

export interface ChatMessage {
  id: string;
  user: User;
  message: string;
  type: 'text' | 'ai_facilitation' | 'system';
  timestamp: Date | string;
  reactions?: string[];
  data?: any;
}

export interface SharedState {
  currentConcept?: string;
  code: string;
  notes: string;
  cursorPositions?: Map<string, any>;
}

export interface GroupMastery {
  individual: Record<string, Record<string, number>>;
  aggregate: Record<string, {
    mean: number;
    min: number;
    max: number;
    variance: number;
  }>;
  updatedAt: Date | string;
}

export interface AIFacilitator {
  summary: string[];
  recommendedNextSteps: string[];
  priorityConcept: string;
  reasoning: string;
  actionItems: Array<{
    task: string;
    assignedTo: string | null;
    reason: string;
  }>;
}

export interface Quiz {
  id?: string;
  teamChallenge: {
    title: string;
    description: string;
    successCriteria: string[];
    estimatedTime: number;
  };
  individualQuestions: Array<{
    memberId: string;
    memberName: string;
    questions: Array<{
      question: string;
      type: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
      difficulty: string;
    }>;
  }>;
  collaborativeProblem: {
    description: string;
    requirements: string[];
    hints: string[];
  };
}

export interface RoomState {
  sharedState: SharedState;
  chatHistory: ChatMessage[];
  members: Member[];
  roles?: Record<string, any>;
  groupMastery?: GroupMastery;
  recentQuizzes?: Quiz[];
}

export interface UseCollaborationOptions {
  roomId: string;
  user: User;
  learningPath?: {
    currentConcept?: string;
    [key: string]: any;
  };
  socketUrl?: string;
}

export interface UseCollaborationReturn {
  isConnected: boolean;
  members: Member[];
  messages: ChatMessage[];
  sharedState: SharedState;
  groupMastery: GroupMastery | null;
  aiFacilitator: AIFacilitator | null;
  currentQuiz: Quiz | null;
  sendMessage: (message: string, type?: string) => void;
  updateCode: (code: string) => void;
  updateNotes: (notes: string) => void;
  generateGroupQuiz: (concepts: string[], difficulty?: string) => void;
  requestAIFacilitator: (action?: string) => void;
  assignRoles: (strategy?: string) => void;
  requestSummary: (lastN?: number) => void;
  submitPeerReview: (targetUserId: string, review: string, rating: number) => void;
}

export const useCollaboration = ({
  roomId,
  user,
  learningPath,
  socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'
}: UseCollaborationOptions): UseCollaborationReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sharedState, setSharedState] = useState<SharedState>({
    code: '',
    notes: ''
  });
  const [groupMastery, setGroupMastery] = useState<GroupMastery | null>(null);
  const [aiFacilitator, setAiFacilitator] = useState<AIFacilitator | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (!roomId || !user) {
      console.warn('⚠️ Room ID or user not provided');
      return;
    }

    console.log('🔌 Initializing Socket.IO connection...', { roomId, user: user.name, socketUrl });

    // Initialize socket connection
    const socket = io(socketUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
      socket.emit('join_room', { roomId, user, learningPath });
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setIsConnected(false);
    });

    // Room event handlers
    socket.on('member_joined', ({ user: newUser, members: roomMembers, groupMastery: gm }) => {
      console.log('👋 Member joined:', newUser.name);
      setMembers(roomMembers);
      if (gm) setGroupMastery(gm);
    });

    socket.on('member_left', ({ user: leftUser, members: roomMembers }) => {
      console.log('👋 Member left:', leftUser.name);
      setMembers(roomMembers);
    });

    socket.on('room_state', (state: RoomState) => {
      console.log('📊 Received room state');
      setSharedState(state.sharedState);
      setMessages(state.chatHistory);
      setMembers(state.members);
      if (state.groupMastery) setGroupMastery(state.groupMastery);
      if (state.recentQuizzes && state.recentQuizzes.length > 0) {
        setCurrentQuiz(state.recentQuizzes[state.recentQuizzes.length - 1]);
      }
    });

    // Chat handlers
    socket.on('chat_message', (message: ChatMessage) => {
      console.log('💬 New message from:', message.user.name);
      setMessages(prev => [...prev, message]);
    });

    // Collaboration handlers
    socket.on('code_update', ({ code, editedBy }) => {
      console.log('💻 Code updated by:', editedBy);
      setSharedState(prev => ({ ...prev, code }));
    });

    socket.on('notes_update', ({ notes, editedBy }) => {
      console.log('📝 Notes updated by:', editedBy);
      setSharedState(prev => ({ ...prev, notes }));
    });

    // Group mastery updates
    socket.on('group_mastery_updated', (mastery: GroupMastery) => {
      console.log('📊 Group mastery updated');
      setGroupMastery(mastery);
    });

    // AI features
    socket.on('ai_facilitator_update', (facilitation: AIFacilitator) => {
      console.log('🤖 AI Facilitator update received');
      setAiFacilitator(facilitation);
    });

    socket.on('group_quiz_generated', ({ quiz }) => {
      console.log('🎯 Group quiz generated:', quiz.teamChallenge.title);
      setCurrentQuiz(quiz);
    });

    socket.on('roles_assigned', ({ roles }) => {
      console.log('👥 Roles assigned:', roles);
      // Update members with new roles
      setMembers(prev => prev.map(member => {
        const roleAssignment = roles.find((r: any) => r.userId === member.id);
        return roleAssignment ? { ...member, role: roleAssignment.role } : member;
      }));
    });

    socket.on('ai_summary', ({ summary }) => {
      console.log('📝 AI summary received');
      // Add summary as a system message
      const summaryMessage: ChatMessage = {
        id: `summary-${Date.now()}`,
        user: { id: 'system', name: 'System', avatar: '📋' },
        message: `**Conversation Summary:**\n${summary.keyPoints.map((p: string) => `• ${p}`).join('\n')}`,
        type: 'system',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, summaryMessage]);
    });

    // Error handling
    socket.on('error', (error: { message: string }) => {
      console.error('❌ Socket error:', error.message);
    });

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up Socket.IO connection');
      if (socket.connected) {
        socket.emit('leave_room', { roomId, user });
      }
      socket.disconnect();
    };
  }, [roomId, user?.id, socketUrl]); // Only reconnect if these change

  // Action callbacks
  const sendMessage = useCallback((message: string, type: string = 'text') => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('room_chat', { message, type });
    } else {
      console.warn('⚠️ Cannot send message: Socket not connected');
    }
  }, []);

  const updateCode = useCallback((code: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('code_edit', { code });
      setSharedState(prev => ({ ...prev, code })); // Optimistic update
    }
  }, []);

  const updateNotes = useCallback((notes: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('notes_update', { notes });
      setSharedState(prev => ({ ...prev, notes })); // Optimistic update
    }
  }, []);

  const generateGroupQuiz = useCallback((concepts: string[], difficulty: string = 'adaptive') => {
    if (socketRef.current?.connected) {
      console.log('🎯 Requesting group quiz for:', concepts);
      socketRef.current.emit('generate_group_quiz', { concepts, difficulty });
    } else {
      console.warn('⚠️ Cannot generate quiz: Socket not connected');
    }
  }, []);

  const requestAIFacilitator = useCallback((action: string = 'summarize') => {
    if (socketRef.current?.connected) {
      console.log('🤖 Requesting AI facilitator action:', action);
      socketRef.current.emit('request_ai_facilitator', { action });
    } else {
      console.warn('⚠️ Cannot request AI facilitator: Socket not connected');
    }
  }, []);

  const assignRoles = useCallback((strategy: string = 'balanced') => {
    if (socketRef.current?.connected) {
      console.log('👥 Requesting role assignment with strategy:', strategy);
      socketRef.current.emit('assign_roles', { strategy });
    } else {
      console.warn('⚠️ Cannot assign roles: Socket not connected');
    }
  }, []);

  const requestSummary = useCallback((lastN: number = 20) => {
    if (socketRef.current?.connected) {
      console.log('📝 Requesting conversation summary');
      socketRef.current.emit('request_summary', { lastN });
    } else {
      console.warn('⚠️ Cannot request summary: Socket not connected');
    }
  }, []);

  const submitPeerReview = useCallback((targetUserId: string, review: string, rating: number) => {
    if (socketRef.current?.connected) {
      console.log('📝 Submitting peer review for:', targetUserId);
      socketRef.current.emit('submit_peer_review', { targetUserId, review, rating });
    } else {
      console.warn('⚠️ Cannot submit peer review: Socket not connected');
    }
  }, []);

  return {
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
    requestSummary,
    submitPeerReview
  };
};

export default useCollaboration;

