// backend/sockets/collaboration.js
const { Server } = require("socket.io");
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const config = require('../config');

/**
 * Collaborative Learning Socket.IO Server
 * Handles real-time study rooms, group chat, AI facilitation, and group learning features
 */
class CollaborationServer {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });
    
    // In-memory storage for demo (use Redis in production)
    this.rooms = new Map();
    this.userSockets = new Map(); // userId -> socketId mapping
    
    this.setupEventHandlers();
    console.log('✅ Collaboration server initialized');
  }

  setupEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log("🔌 User connected:", socket.id);

      // Room management
      socket.on("join_room", this.handleJoinRoom.bind(this, socket));
      socket.on("leave_room", this.handleLeaveRoom.bind(this, socket));
      
      // Real-time collaboration
      socket.on("room_chat", this.handleRoomChat.bind(this, socket));
      socket.on("shared_cursor", this.handleSharedCursor.bind(this, socket));
      socket.on("code_edit", this.handleCodeEdit.bind(this, socket));
      socket.on("notes_update", this.handleNotesUpdate.bind(this, socket));
      
      // AI features
      socket.on("generate_group_quiz", this.handleGenerateGroupQuiz.bind(this, socket));
      socket.on("request_ai_facilitator", this.handleAIFacilitator.bind(this, socket));
      socket.on("assign_roles", this.handleAssignRoles.bind(this, socket));
      socket.on("request_summary", this.handleRequestSummary.bind(this, socket));
      
      // Peer feedback
      socket.on("submit_peer_review", this.handlePeerReview.bind(this, socket));
      
      socket.on("disconnect", this.handleDisconnect.bind(this, socket));
    });
  }

  /**
   * Handle user joining a study room
   */
  async handleJoinRoom(socket, { roomId, user, learningPath }) {
    try {
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.user = user;
      
      this.userSockets.set(user.id, socket.id);

      // Initialize room if it doesn't exist
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, {
          id: roomId,
          members: new Map(),
          chatHistory: [],
          sharedState: {
            currentConcept: learningPath?.currentConcept || '',
            code: '',
            notes: '',
            cursorPositions: new Map()
          },
          groupMastery: {},
          activityLog: [],
          roles: {},
          createdAt: new Date(),
          quizzes: []
        });
      }

      const room = this.rooms.get(roomId);
      room.members.set(socket.id, {
        socketId: socket.id,
        user: user,
        joinedAt: new Date(),
        lastActivity: new Date(),
        role: null
      });

      // Update group mastery
      await this.updateGroupMastery(roomId);

      // Notify room of new member
      this.io.to(roomId).emit("member_joined", {
        user,
        members: Array.from(room.members.values()).map(m => ({
          ...m.user,
          role: m.role,
          online: true
        })),
        groupMastery: room.groupMastery
      });

      // Send current room state to new member
      socket.emit("room_state", {
        sharedState: room.sharedState,
        chatHistory: room.chatHistory.slice(-50), // Last 50 messages
        members: Array.from(room.members.values()).map(m => ({
          ...m.user,
          role: m.role,
          online: true
        })),
        roles: room.roles,
        groupMastery: room.groupMastery,
        recentQuizzes: room.quizzes.slice(-3)
      });

      this.logActivity(roomId, `${user.name} joined the room`);
      console.log(`✅ ${user.name} joined room ${roomId}`);

    } catch (error) {
      console.error("❌ Join room error:", error);
      socket.emit("error", { message: "Failed to join room", error: error.message });
    }
  }

  /**
   * Handle chat messages in a room
   */
  async handleRoomChat(socket, { message, type = "text" }) {
    const roomId = socket.data.roomId;
    if (!roomId || !this.rooms.has(roomId)) {
      return socket.emit("error", { message: "Not in a room" });
    }

    const room = this.rooms.get(roomId);
    const user = socket.data.user;

    const chatMessage = {
      id: uuidv4(),
      user,
      message,
      type,
      timestamp: new Date(),
      reactions: []
    };

    room.chatHistory.push(chatMessage);

    // Auto-summarize if chat is getting long (every 15 messages)
    if (room.chatHistory.length % 15 === 0 && room.chatHistory.length > 0) {
      setTimeout(() => this.triggerAutoSummary(roomId), 1000);
    }

    this.io.to(roomId).emit("chat_message", chatMessage);
    this.logActivity(roomId, `${user.name} sent a message`);
  }

  /**
   * Handle shared cursor movements for collaborative editing
   */
  handleSharedCursor(socket, { position, selection }) {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const user = socket.data.user;
    room.sharedState.cursorPositions.set(user.id, { position, selection, user });

    // Broadcast to other members
    socket.to(roomId).emit("cursor_update", {
      userId: user.id,
      userName: user.name,
      position,
      selection
    });
  }

  /**
   * Handle collaborative code editing
   */
  handleCodeEdit(socket, { code, cursorPosition }) {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    room.sharedState.code = code;
    
    // Broadcast to other members
    socket.to(roomId).emit("code_update", {
      code,
      editedBy: socket.data.user.name,
      timestamp: new Date()
    });

    this.logActivity(roomId, `${socket.data.user.name} updated code`);
  }

  /**
   * Handle shared notes updates
   */
  handleNotesUpdate(socket, { notes }) {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    room.sharedState.notes = notes;
    
    socket.to(roomId).emit("notes_update", {
      notes,
      editedBy: socket.data.user.name,
      timestamp: new Date()
    });
  }

  /**
   * Generate adaptive group quiz using AI
   */
  async handleGenerateGroupQuiz(socket, { concepts, difficulty = "adaptive" }) {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    try {
      const room = this.rooms.get(roomId);
      const members = Array.from(room.members.values());
      
      console.log(`🎯 Generating group quiz for ${members.length} members on concepts:`, concepts);

      // Get individual mastery levels from KT service
      const memberMasteries = await Promise.all(
        members.map(async (member) => {
          try {
            // Call KT service for each member
            const response = await axios.post(`${config.AI_SERVICE_URL}/predict_mastery`, {
              userId: member.user.id,
              attempts: [], // Would fetch real attempts from DB
              priorMastery: {}
            }, { timeout: 5000 });

            return {
              userId: member.user.id,
              userName: member.user.name,
              mastery: response.data.mastery || {}
            };
          } catch (err) {
            console.warn(`⚠️ Failed to get mastery for ${member.user.name}:`, err.message);
            return {
              userId: member.user.id,
              userName: member.user.name,
              mastery: {}
            };
          }
        })
      );

      // Generate quiz using mock AI (in production, call OpenAI)
      const quiz = this.generateMockGroupQuiz(concepts, memberMasteries, difficulty);
      
      room.quizzes.push(quiz);

      this.io.to(roomId).emit("group_quiz_generated", {
        quiz,
        requestedBy: socket.data.user
      });

      // Add AI message to chat
      const aiMessage = {
        id: uuidv4(),
        user: { id: "ai_facilitator", name: "AI Facilitator", avatar: "🤖" },
        message: `Generated adaptive quiz: "${quiz.teamChallenge.title}" - ${quiz.individualQuestions.length} personalized questions for each member.`,
        type: "ai_facilitation",
        timestamp: new Date()
      };
      room.chatHistory.push(aiMessage);
      this.io.to(roomId).emit("chat_message", aiMessage);

      this.logActivity(roomId, `${socket.data.user.name} generated a group quiz`);
      console.log(`✅ Quiz generated for room ${roomId}`);

    } catch (error) {
      console.error("❌ Quiz generation error:", error);
      socket.emit("error", { message: "Failed to generate quiz", error: error.message });
    }
  }

  /**
   * AI Facilitator - provides guidance and summaries
   */
  async handleAIFacilitator(socket, { action = "summarize" }) {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    try {
      const room = this.rooms.get(roomId);
      const members = Array.from(room.members.values()).map(m => m.user);
      
      console.log(`🤖 AI Facilitator action: ${action} for room ${roomId}`);

      // Generate facilitation response (mock - use OpenAI in production)
      const facilitatorResponse = this.generateMockFacilitation(
        action,
        room.chatHistory,
        room.groupMastery,
        members
      );

      this.io.to(roomId).emit("ai_facilitator_update", facilitatorResponse);
      
      // Add AI message to chat
      const aiMessage = {
        id: uuidv4(),
        user: { id: "ai_facilitator", name: "AI Facilitator", avatar: "🤖" },
        message: this.formatFacilitationMessage(facilitatorResponse),
        type: "ai_facilitation",
        timestamp: new Date(),
        data: facilitatorResponse
      };

      room.chatHistory.push(aiMessage);
      this.io.to(roomId).emit("chat_message", aiMessage);

      this.logActivity(roomId, `AI Facilitator provided ${action} guidance`);

    } catch (error) {
      console.error("❌ AI facilitator error:", error);
      socket.emit("error", { message: "AI facilitation failed", error: error.message });
    }
  }

  /**
   * Assign team roles based on mastery and collaboration strategy
   */
  async handleAssignRoles(socket, { strategy = "balanced" }) {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    try {
      const room = this.rooms.get(roomId);
      const members = Array.from(room.members.values());
      
      console.log(`👥 Assigning roles using ${strategy} strategy for ${members.length} members`);

      // Assign roles based on mastery (mock - use AI in production)
      const roles = this.assignTeamRoles(members, room.groupMastery, strategy);
      
      room.roles = roles;

      // Update member roles
      roles.forEach(roleAssignment => {
        const member = members.find(m => m.user.id === roleAssignment.userId);
        if (member) {
          member.role = roleAssignment.role;
        }
      });

      this.io.to(roomId).emit("roles_assigned", { 
        roles, 
        assignedBy: socket.data.user,
        strategy 
      });

      // Add notification to chat
      const aiMessage = {
        id: uuidv4(),
        user: { id: "ai_facilitator", name: "AI Facilitator", avatar: "🤖" },
        message: `Team roles assigned!\n${roles.map(r => `• ${r.userName}: ${r.role} ${this.getRoleEmoji(r.role)}`).join('\n')}`,
        type: "ai_facilitation",
        timestamp: new Date()
      };
      room.chatHistory.push(aiMessage);
      this.io.to(roomId).emit("chat_message", aiMessage);

      this.logActivity(roomId, `${socket.data.user.name} assigned team roles`);

    } catch (error) {
      console.error("❌ Role assignment error:", error);
      socket.emit("error", { message: "Role assignment failed", error: error.message });
    }
  }

  /**
   * Request chat summary
   */
  async handleRequestSummary(socket, { lastN = 20 }) {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    try {
      await this.triggerAutoSummary(roomId, lastN);
    } catch (error) {
      console.error("❌ Summary error:", error);
      socket.emit("error", { message: "Summary failed" });
    }
  }

  /**
   * Handle peer review submissions
   */
  handlePeerReview(socket, { targetUserId, review, rating }) {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const reviewData = {
      id: uuidv4(),
      fromUser: socket.data.user,
      targetUserId,
      review,
      rating,
      timestamp: new Date()
    };

    // Broadcast review to room
    this.io.to(roomId).emit("peer_review_received", reviewData);
    
    this.logActivity(roomId, `${socket.data.user.name} submitted peer review`);
  }

  /**
   * Update group mastery by aggregating individual masteries
   */
  async updateGroupMastery(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const members = Array.from(room.members.values());
    
    try {
      // Get mastery for each member
      const individualMasteries = {};
      const conceptMasteries = {};

      for (const member of members) {
        try {
          const response = await axios.post(
            `${config.AI_SERVICE_URL}/predict_mastery`,
            {
              userId: member.user.id,
              attempts: [],
              priorMastery: {}
            },
            { timeout: 5000 }
          );

          const mastery = response.data.mastery || {};
          individualMasteries[member.user.id] = mastery;
          
          // Aggregate by concept
          for (const [concept, score] of Object.entries(mastery)) {
            if (!conceptMasteries[concept]) conceptMasteries[concept] = [];
            conceptMasteries[concept].push(score);
          }
        } catch (err) {
          console.warn(`⚠️ Failed to get mastery for ${member.user.name}`);
          individualMasteries[member.user.id] = {};
        }
      }

      // Calculate aggregate scores
      const aggregateMastery = {};
      for (const [concept, scores] of Object.entries(conceptMasteries)) {
        aggregateMastery[concept] = {
          mean: scores.reduce((a, b) => a + b, 0) / scores.length,
          min: Math.min(...scores),
          max: Math.max(...scores),
          variance: this.calculateVariance(scores)
        };
      }

      room.groupMastery = {
        individual: individualMasteries,
        aggregate: aggregateMastery,
        updatedAt: new Date()
      };

      this.io.to(roomId).emit("group_mastery_updated", room.groupMastery);
      console.log(`📊 Updated group mastery for room ${roomId}`);

    } catch (error) {
      console.error("❌ Failed to update group mastery:", error);
    }
  }

  /**
   * Auto-summarize conversation
   */
  async triggerAutoSummary(roomId, lastN = 20) {
    const room = this.rooms.get(roomId);
    if (!room || room.chatHistory.length < 5) return;

    try {
      const recentMessages = room.chatHistory.slice(-lastN);
      const summary = this.generateMockSummary(recentMessages);

      this.io.to(roomId).emit("ai_summary", {
        type: "auto_summary",
        summary,
        trigger: "manual_request",
        messagesAnalyzed: recentMessages.length
      });

      console.log(`📝 Generated summary for room ${roomId}`);

    } catch (error) {
      console.error("❌ Auto-summary error:", error);
    }
  }

  /**
   * Handle user leaving room
   */
  handleLeaveRoom(socket, data) {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (room) {
      const member = room.members.get(socket.id);
      room.members.delete(socket.id);
      
      if (member) {
        this.io.to(roomId).emit("member_left", {
          user: member.user,
          members: Array.from(room.members.values()).map(m => ({
            ...m.user,
            role: m.role,
            online: true
          }))
        });

        this.logActivity(roomId, `${member.user.name} left the room`);
        console.log(`👋 ${member.user.name} left room ${roomId}`);
      }

      // Clean up empty rooms after 5 minutes
      if (room.members.size === 0) {
        setTimeout(() => {
          if (this.rooms.has(roomId) && this.rooms.get(roomId).members.size === 0) {
            this.rooms.delete(roomId);
            console.log(`🗑️ Cleaned up empty room ${roomId}`);
          }
        }, 5 * 60 * 1000);
      } else {
        this.updateGroupMastery(roomId);
      }
    }

    socket.leave(roomId);
    socket.data.roomId = null;
  }

  /**
   * Handle disconnection
   */
  handleDisconnect(socket) {
    const user = socket.data.user;
    if (user) {
      this.userSockets.delete(user.id);
      console.log(`🔌 User disconnected: ${user.name}`);
    }
    this.handleLeaveRoom(socket, {});
  }

  // Helper methods

  calculateVariance(scores) {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    return scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
  }

  logActivity(roomId, activity) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.activityLog.push({
        id: uuidv4(),
        activity,
        timestamp: new Date()
      });
      // Keep only last 100 activities
      if (room.activityLog.length > 100) {
        room.activityLog = room.activityLog.slice(-100);
      }
    }
  }

  getRoleEmoji(role) {
    const emojiMap = {
      'Driver': '🚗',
      'Navigator': '🧭',
      'Researcher': '🔍',
      'Reviewer': '✅',
      'Facilitator': '🎯'
    };
    return emojiMap[role] || '👤';
  }

  // Mock AI functions (replace with real AI service calls in production)

  generateMockGroupQuiz(concepts, memberMasteries, difficulty) {
    return {
      id: uuidv4(),
      teamChallenge: {
        title: `Collaborative ${concepts.join(' & ')} Challenge`,
        description: `Work together to solve this team challenge that tests your understanding of ${concepts.join(', ')}.`,
        successCriteria: [
          "All team members contribute",
          "Solution demonstrates mastery of key concepts",
          "Code passes all test cases"
        ],
        estimatedTime: 25
      },
      individualQuestions: memberMasteries.map(member => ({
        memberId: member.userId,
        memberName: member.userName,
        questions: concepts.map((concept, idx) => ({
          question: `${concept}: What is the best approach to implement this feature?`,
          type: "multiple_choice",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "Option A",
          explanation: `This tests your understanding of ${concept}`,
          difficulty: difficulty === "adaptive" ? 
            (Object.values(member.mastery)[0] > 0.7 ? "hard" : "medium") : difficulty
        }))
      })),
      collaborativeProblem: {
        description: "Build a mini-application that demonstrates all learned concepts",
        requirements: [
          "Must use all concepts discussed",
          "Include proper error handling",
          "Write unit tests",
          "Document your approach"
        ],
        hints: [
          "Start by breaking down the problem into smaller parts",
          "Assign roles based on team strengths",
          "Consider edge cases early"
        ]
      },
      createdAt: new Date()
    };
  }

  generateMockFacilitation(action, chatHistory, groupMastery, members) {
    const recentTopics = this.extractTopics(chatHistory.slice(-10));
    
    return {
      summary: [
        `Team of ${members.length} is actively collaborating`,
        `Recent discussion: ${recentTopics.join(', ') || 'Getting started'}`,
        `Group showing good engagement and participation`
      ],
      recommendedNextSteps: [
        "Review the concept together before starting exercises",
        "Try the collaborative coding challenge",
        "Each member should attempt the personalized questions"
      ],
      priorityConcept: Object.keys(groupMastery.aggregate || {})[0] || "functions",
      reasoning: "This concept shows the most variance in team mastery levels",
      actionItems: [
        {
          task: "Complete individual quiz questions",
          assignedTo: null,
          reason: "Assess current understanding"
        },
        {
          task: "Collaborate on team challenge",
          assignedTo: null,
          reason: "Practice working together"
        }
      ]
    };
  }

  generateMockSummary(messages) {
    const userMessages = messages.filter(m => m.type === 'text');
    const uniqueUsers = new Set(userMessages.map(m => m.user.name));
    
    return {
      keyPoints: [
        `${uniqueUsers.size} members actively participating`,
        `${userMessages.length} messages exchanged`,
        "Team is making good progress on learning goals"
      ],
      decisions: [
        "Agreed to work on collaborative challenge",
        "Decided to review concepts together first"
      ],
      questions: [
        "How should we handle edge cases?",
        "What's the best testing strategy?"
      ],
      nextSteps: [
        "Continue with individual exercises",
        "Regroup in 15 minutes to discuss progress"
      ]
    };
  }

  assignTeamRoles(members, groupMastery, strategy) {
    const roles = ['Driver', 'Navigator', 'Researcher', 'Reviewer'];
    const assigned = [];

    // Simple role assignment based on order (in production, use AI)
    members.forEach((member, idx) => {
      assigned.push({
        userId: member.user.id,
        userName: member.user.name,
        role: roles[idx % roles.length],
        reason: `Based on ${strategy} strategy and current team composition`,
        responsibilities: this.getRoleResponsibilities(roles[idx % roles.length])
      });
    });

    return assigned;
  }

  getRoleResponsibilities(role) {
    const responsibilities = {
      'Driver': ['Write code', 'Implement solutions', 'Execute team decisions'],
      'Navigator': ['Guide direction', 'Suggest approaches', 'Catch errors'],
      'Researcher': ['Find resources', 'Look up documentation', 'Research best practices'],
      'Reviewer': ['Check code quality', 'Test solutions', 'Provide feedback']
    };
    return responsibilities[role] || [];
  }

  extractTopics(messages) {
    // Simple topic extraction (use NLP in production)
    const words = messages
      .map(m => m.message)
      .join(' ')
      .toLowerCase()
      .split(' ')
      .filter(w => w.length > 5);
    
    return [...new Set(words)].slice(0, 3);
  }

  formatFacilitationMessage(facilitation) {
    return `📊 **AI Facilitator Summary:**

${facilitation.summary.map(s => `• ${s}`).join('\n')}

**Recommended Next Steps:**
${facilitation.recommendedNextSteps.map(s => `• ${s}`).join('\n')}

**Focus Area:** ${facilitation.priorityConcept}
${facilitation.reasoning}`;
  }

  // Public API for external access
  getRoomInfo(roomId) {
    return this.rooms.get(roomId);
  }

  getAllRooms() {
    return Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      memberCount: room.members.size,
      createdAt: room.createdAt,
      activityCount: room.activityLog.length
    }));
  }
}

module.exports = CollaborationServer;

