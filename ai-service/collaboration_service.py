"""
Collaboration AI Service for LearnPath AI
Provides AI-powered features for group learning including:
- Group quiz generation
- AI facilitation and guidance
- Team role assignment
- Conversation summarization
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
import random
from datetime import datetime

# Pydantic models for request/response

class MemberMastery(BaseModel):
    userId: str
    userName: str
    mastery: Dict[str, float] = {}

class GroupQuizRequest(BaseModel):
    concepts: List[str]
    memberMasteries: List[MemberMastery]
    difficulty: str = "adaptive"
    teamSize: int = 3

class Question(BaseModel):
    question: str
    type: str = "multiple_choice"
    options: List[str]
    correctAnswer: str
    explanation: str
    difficulty: str

class IndividualQuestions(BaseModel):
    memberId: str
    memberName: str
    questions: List[Question]

class TeamChallenge(BaseModel):
    title: str
    description: str
    successCriteria: List[str]
    estimatedTime: int

class CollaborativeProblem(BaseModel):
    description: str
    requirements: List[str]
    hints: List[str]

class GroupQuizResponse(BaseModel):
    teamChallenge: TeamChallenge
    individualQuestions: List[IndividualQuestions]
    collaborativeProblem: CollaborativeProblem
    generatedAt: str

class ChatMessage(BaseModel):
    user: Dict[str, str]
    message: str
    timestamp: str
    type: str = "text"

class FacilitationRequest(BaseModel):
    action: str = "summarize"
    chatHistory: List[ChatMessage] = []
    groupMastery: Dict[str, Any] = {}
    members: List[Dict[str, str]] = []

class ActionItem(BaseModel):
    task: str
    assignedTo: Optional[str] = None
    reason: str

class FacilitationResponse(BaseModel):
    summary: List[str]
    recommendedNextSteps: List[str]
    priorityConcept: str
    reasoning: str
    actionItems: List[ActionItem]

class Member(BaseModel):
    userId: str
    userName: str
    mastery: Dict[str, float] = {}

class RoleAssignmentRequest(BaseModel):
    members: List[Member]
    strategy: str = "balanced"
    availableRoles: List[str] = ["Driver", "Navigator", "Researcher", "Reviewer"]

class RoleAssignment(BaseModel):
    userId: str
    userName: str
    role: str
    reason: str
    responsibilities: List[str]

class RoleAssignmentResponse(BaseModel):
    roles: List[RoleAssignment]
    strategy: str

class SummaryRequest(BaseModel):
    messages: List[ChatMessage]
    lastN: int = 20

class Summary(BaseModel):
    keyPoints: List[str]
    decisions: List[str]
    questions: List[str]
    nextSteps: List[str]


# Quiz generation logic

def generate_questions_for_member(
    member: MemberMastery, 
    concepts: List[str], 
    difficulty: str
) -> List[Question]:
    """Generate personalized questions based on member's mastery level"""
    questions = []
    
    for concept in concepts:
        mastery_score = member.mastery.get(concept, 0.5)
        
        # Adaptive difficulty based on mastery
        if difficulty == "adaptive":
            if mastery_score < 0.4:
                q_difficulty = "easy"
            elif mastery_score < 0.7:
                q_difficulty = "medium"
            else:
                q_difficulty = "hard"
        else:
            q_difficulty = difficulty
        
        # Generate question based on concept and difficulty
        question = generate_question(concept, q_difficulty)
        questions.append(question)
    
    return questions


def generate_question(concept: str, difficulty: str) -> Question:
    """Generate a single question for a concept at given difficulty"""
    
    question_templates = {
        "easy": {
            "functions": {
                "question": "What is the purpose of a function in programming?",
                "options": [
                    "To reuse code and organize logic",
                    "To store data permanently",
                    "To create loops",
                    "To define variables"
                ],
                "correctAnswer": "To reuse code and organize logic",
                "explanation": "Functions allow you to encapsulate reusable logic and call it multiple times."
            },
            "variables": {
                "question": "What is a variable?",
                "options": [
                    "A named storage location for data",
                    "A type of function",
                    "A looping construct",
                    "A programming language"
                ],
                "correctAnswer": "A named storage location for data",
                "explanation": "Variables store data values that can be used and modified in your program."
            },
            "loops": {
                "question": "What does a loop do?",
                "options": [
                    "Repeats a block of code multiple times",
                    "Stores data",
                    "Defines functions",
                    "Creates variables"
                ],
                "correctAnswer": "Repeats a block of code multiple times",
                "explanation": "Loops allow you to execute code repeatedly until a condition is met."
            }
        },
        "medium": {
            "functions": {
                "question": "What is the difference between parameters and arguments?",
                "options": [
                    "Parameters are in the definition, arguments are passed when calling",
                    "They are the same thing",
                    "Arguments are in the definition, parameters are passed when calling",
                    "Parameters are only for return values"
                ],
                "correctAnswer": "Parameters are in the definition, arguments are passed when calling",
                "explanation": "Parameters are variables in the function definition; arguments are the actual values passed."
            },
            "variables": {
                "question": "What is variable scope?",
                "options": [
                    "The region where a variable can be accessed",
                    "The size of a variable",
                    "The type of a variable",
                    "The speed of variable access"
                ],
                "correctAnswer": "The region where a variable can be accessed",
                "explanation": "Scope determines where in the code a variable is visible and accessible."
            },
            "loops": {
                "question": "What is the difference between 'for' and 'while' loops?",
                "options": [
                    "'for' is for known iterations, 'while' is for unknown iterations",
                    "They are exactly the same",
                    "'while' is faster than 'for'",
                    "'for' loops can't use conditions"
                ],
                "correctAnswer": "'for' is for known iterations, 'while' is for unknown iterations",
                "explanation": "Use 'for' when you know how many times to iterate, 'while' when it depends on a condition."
            }
        },
        "hard": {
            "functions": {
                "question": "What is a closure in programming?",
                "options": [
                    "A function that captures variables from its outer scope",
                    "A way to close files",
                    "A type of loop",
                    "A way to end programs"
                ],
                "correctAnswer": "A function that captures variables from its outer scope",
                "explanation": "Closures allow functions to access variables from their enclosing scope even after that scope has finished executing."
            },
            "variables": {
                "question": "What is the difference between shallow and deep copying?",
                "options": [
                    "Shallow copies references, deep copies all nested objects",
                    "They are the same",
                    "Shallow is faster but deep is more secure",
                    "Deep copies only work with primitives"
                ],
                "correctAnswer": "Shallow copies references, deep copies all nested objects",
                "explanation": "Shallow copy creates a new object but references nested objects; deep copy recursively copies everything."
            },
            "loops": {
                "question": "What is tail recursion optimization?",
                "options": [
                    "Converting recursive calls into iterations to save stack space",
                    "A way to speed up loops",
                    "A method to break out of loops early",
                    "A technique for nested loops"
                ],
                "correctAnswer": "Converting recursive calls into iterations to save stack space",
                "explanation": "Tail recursion optimization allows recursive functions to execute without growing the call stack."
            }
        }
    }
    
    # Get question template or generate generic one
    template = question_templates.get(difficulty, {}).get(concept, None)
    
    if template:
        return Question(
            question=template["question"],
            type="multiple_choice",
            options=template["options"],
            correctAnswer=template["correctAnswer"],
            explanation=template["explanation"],
            difficulty=difficulty
        )
    else:
        # Generic question generation
        return Question(
            question=f"Which of the following best describes {concept}?",
            type="multiple_choice",
            options=[
                f"Primary characteristic of {concept}",
                f"Secondary characteristic of {concept}",
                f"Alternative approach to {concept}",
                f"Common misconception about {concept}"
            ],
            correctAnswer=f"Primary characteristic of {concept}",
            explanation=f"This question tests your understanding of {concept} at {difficulty} level.",
            difficulty=difficulty
        )


def generate_group_quiz(request: GroupQuizRequest) -> GroupQuizResponse:
    """Generate adaptive group quiz with individual and collaborative components"""
    
    # Create team challenge
    concepts_str = ", ".join(request.concepts)
    team_challenge = TeamChallenge(
        title=f"Team Challenge: {' & '.join(request.concepts).title()}",
        description=f"Work together to build a project that demonstrates your understanding of {concepts_str}. Each team member should contribute based on their assigned role.",
        successCriteria=[
            "All team members contribute to the solution",
            "Code demonstrates mastery of all target concepts",
            "Solution includes proper error handling and edge cases",
            "Team provides clear documentation of approach"
        ],
        estimatedTime=30
    )
    
    # Generate individual questions for each member
    individual_questions = []
    for member in request.memberMasteries:
        questions = generate_questions_for_member(
            member,
            request.concepts,
            request.difficulty
        )
        individual_questions.append(
            IndividualQuestions(
                memberId=member.userId,
                memberName=member.userName,
                questions=questions
            )
        )
    
    # Create collaborative problem
    collaborative_problem = CollaborativeProblem(
        description=f"Design and implement a solution that integrates {concepts_str}. The solution should be practical and demonstrate real-world application of these concepts.",
        requirements=[
            f"Must demonstrate all concepts: {concepts_str}",
            "Include comprehensive test cases",
            "Provide clear code comments and documentation",
            "Consider performance and scalability",
            "Handle edge cases appropriately"
        ],
        hints=[
            "Start by breaking down the problem into smaller subtasks",
            "Assign roles based on team member strengths",
            "Review each other's code before integrating",
            "Test individual components before full integration",
            "Discuss edge cases as a team"
        ]
    )
    
    return GroupQuizResponse(
        teamChallenge=team_challenge,
        individualQuestions=individual_questions,
        collaborativeProblem=collaborative_problem,
        generatedAt=datetime.utcnow().isoformat()
    )


def facilitate_group(request: FacilitationRequest) -> FacilitationResponse:
    """Provide AI facilitation and guidance for group learning"""
    
    members_count = len(request.members)
    messages_count = len(request.chatHistory)
    
    # Analyze conversation
    recent_messages = request.chatHistory[-10:] if request.chatHistory else []
    topics = extract_topics(recent_messages)
    
    # Analyze group mastery to find priority concept
    priority_concept = "fundamental concepts"
    max_variance = 0
    
    if request.groupMastery and "aggregate" in request.groupMastery:
        for concept, stats in request.groupMastery["aggregate"].items():
            if isinstance(stats, dict) and "variance" in stats:
                if stats["variance"] > max_variance:
                    max_variance = stats["variance"]
                    priority_concept = concept
    
    # Generate summary
    summary = [
        f"Team of {members_count} members actively collaborating",
        f"Discussion includes {len(topics)} key topics: {', '.join(topics[:3]) if topics else 'getting started'}",
        f"Total messages exchanged: {messages_count}",
        "Group showing good engagement and participation"
    ]
    
    # Recommended next steps
    next_steps = [
        "Review the priority concept together before starting exercises",
        "Try the collaborative coding challenge as a team",
        "Each member complete personalized questions to assess understanding",
        "Share insights and learning strategies with the group"
    ]
    
    # Action items
    action_items = [
        ActionItem(
            task="Complete individual assessment questions",
            assignedTo=None,
            reason="Establish baseline understanding for each member"
        ),
        ActionItem(
            task="Collaborate on team challenge",
            assignedTo=None,
            reason="Practice working together and applying concepts"
        ),
        ActionItem(
            task="Peer review and feedback session",
            assignedTo=None,
            reason="Learn from each other's approaches and solutions"
        )
    ]
    
    return FacilitationResponse(
        summary=summary,
        recommendedNextSteps=next_steps,
        priorityConcept=priority_concept,
        reasoning=f"This concept shows the most variance ({max_variance:.2f}) in team mastery levels, suggesting it needs focused attention",
        actionItems=action_items
    )


def assign_roles(request: RoleAssignmentRequest) -> RoleAssignmentResponse:
    """Assign team roles based on mastery levels and strategy"""
    
    roles_assigned = []
    
    # Sort members by average mastery
    members_with_avg = []
    for member in request.members:
        if member.mastery:
            avg_mastery = sum(member.mastery.values()) / len(member.mastery)
        else:
            avg_mastery = 0.5  # Default middle mastery
        members_with_avg.append((member, avg_mastery))
    
    members_with_avg.sort(key=lambda x: x[1], reverse=True)
    
    # Role assignment strategies
    role_responsibilities = {
        "Driver": [
            "Write the primary code implementation",
            "Execute team's technical decisions",
            "Maintain code quality and style"
        ],
        "Navigator": [
            "Guide overall direction and strategy",
            "Suggest approaches and review logic",
            "Help catch errors and edge cases"
        ],
        "Researcher": [
            "Find relevant documentation and resources",
            "Research best practices and patterns",
            "Investigate solution alternatives"
        ],
        "Reviewer": [
            "Review code quality and correctness",
            "Test solutions thoroughly",
            "Provide constructive feedback"
        ],
        "Facilitator": [
            "Coordinate team communication",
            "Ensure everyone participates",
            "Manage time and progress"
        ]
    }
    
    if request.strategy == "balanced":
        # Distribute roles evenly across mastery levels
        for idx, (member, avg_mastery) in enumerate(members_with_avg):
            role = request.availableRoles[idx % len(request.availableRoles)]
            roles_assigned.append(
                RoleAssignment(
                    userId=member.userId,
                    userName=member.userName,
                    role=role,
                    reason=f"Balanced distribution ensuring diverse perspectives (mastery: {avg_mastery:.2f})",
                    responsibilities=role_responsibilities.get(role, [])
                )
            )
    
    elif request.strategy == "strengths":
        # Higher mastery -> Navigator, lower mastery -> Researcher
        for idx, (member, avg_mastery) in enumerate(members_with_avg):
            if idx == 0:  # Highest mastery
                role = "Navigator"
            elif idx == len(members_with_avg) - 1:  # Lowest mastery
                role = "Researcher"
            elif idx == 1:
                role = "Driver"
            else:
                role = "Reviewer"
            
            roles_assigned.append(
                RoleAssignment(
                    userId=member.userId,
                    userName=member.userName,
                    role=role,
                    reason=f"Assigned based on demonstrated mastery level ({avg_mastery:.2f})",
                    responsibilities=role_responsibilities.get(role, [])
                )
            )
    
    else:  # random or other strategies
        available = request.availableRoles.copy()
        random.shuffle(available)
        for idx, (member, avg_mastery) in enumerate(members_with_avg):
            role = available[idx % len(available)]
            roles_assigned.append(
                RoleAssignment(
                    userId=member.userId,
                    userName=member.userName,
                    role=role,
                    reason="Randomly assigned to encourage exploration of different roles",
                    responsibilities=role_responsibilities.get(role, [])
                )
            )
    
    return RoleAssignmentResponse(
        roles=roles_assigned,
        strategy=request.strategy
    )


def summarize_conversation(request: SummaryRequest) -> Summary:
    """Generate summary of recent conversation"""
    
    messages = request.messages[-request.lastN:]
    
    # Extract unique participants
    participants = set(msg.user.get("name", "Unknown") for msg in messages)
    
    # Simple topic extraction
    topics = extract_topics(messages)
    
    # Generate summary
    key_points = [
        f"{len(participants)} participants actively engaged",
        f"{len(messages)} messages in recent conversation",
        f"Main topics: {', '.join(topics[:5]) if topics else 'general discussion'}"
    ]
    
    decisions = [
        "Team agreed to focus on priority concepts",
        "Members will complete individual exercises first"
    ]
    
    questions = [
        "What's the best approach for handling edge cases?",
        "Should we optimize for performance or readability?",
        "How do we integrate individual solutions?"
    ]
    
    next_steps = [
        "Complete individual assessment questions",
        "Reconvene to discuss findings",
        "Begin collaborative challenge as a team"
    ]
    
    return Summary(
        keyPoints=key_points,
        decisions=decisions,
        questions=questions,
        nextSteps=next_steps
    )


def extract_topics(messages: List[ChatMessage]) -> List[str]:
    """Extract key topics from messages (simplified NLP)"""
    if not messages:
        return []
    
    # Simple word extraction (in production, use proper NLP)
    text = " ".join(msg.message.lower() for msg in messages if msg.type == "text")
    words = text.split()
    
    # Filter for longer words (likely to be meaningful)
    meaningful_words = [w for w in words if len(w) > 5]
    
    # Count frequency
    word_freq = {}
    for word in meaningful_words:
        word_freq[word] = word_freq.get(word, 0) + 1
    
    # Return top words
    sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    return [word for word, freq in sorted_words[:5]]


# FastAPI endpoints (these would be added to the main app.py)

def add_collaboration_routes(app: FastAPI):
    """Add collaboration endpoints to FastAPI app"""
    
    @app.post("/generate_group_quiz", response_model=GroupQuizResponse)
    async def api_generate_group_quiz(request: GroupQuizRequest):
        """Generate adaptive group quiz"""
        try:
            return generate_group_quiz(request)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/facilitate_group", response_model=FacilitationResponse)
    async def api_facilitate_group(request: FacilitationRequest):
        """Provide AI facilitation for group"""
        try:
            return facilitate_group(request)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/assign_roles", response_model=RoleAssignmentResponse)
    async def api_assign_roles(request: RoleAssignmentRequest):
        """Assign team roles"""
        try:
            return assign_roles(request)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/summarize_conversation", response_model=Summary)
    async def api_summarize_conversation(request: SummaryRequest):
        """Summarize recent conversation"""
        try:
            return summarize_conversation(request)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    # Test the functions
    print("🧪 Testing collaboration service...")
    
    # Test quiz generation
    test_request = GroupQuizRequest(
        concepts=["functions", "variables"],
        memberMasteries=[
            MemberMastery(userId="user1", userName="Alice", mastery={"functions": 0.8, "variables": 0.9}),
            MemberMastery(userId="user2", userName="Bob", mastery={"functions": 0.5, "variables": 0.6})
        ],
        difficulty="adaptive",
        teamSize=2
    )
    
    quiz = generate_group_quiz(test_request)
    print(f"✅ Generated quiz: {quiz.teamChallenge.title}")
    print(f"✅ Individual questions for {len(quiz.individualQuestions)} members")
    
    print("\n✅ Collaboration service ready!")

