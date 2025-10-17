# ai-service/adversarial_challenges.py
"""
Adversarial Learning Challenges System
Generates intentionally deceptive questions targeting common misconceptions.
Builds robust understanding through "desirable difficulties".

Innovation: Inspired by Deep Knowledge Tracing adversarial training.
Research backing: Struggle → deeper learning (Bjork's desirable difficulties).
"""
from typing import Dict, List, Optional, Tuple
from pydantic import BaseModel
import json
import random

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class Misconception(BaseModel):
    """Common misconception for a concept."""
    concept: str
    misconception_text: str
    correct_understanding: str
    frequency: float  # how common (0-1)


class AdversarialQuestion(BaseModel):
    """Challenging question targeting a misconception."""
    question_id: str
    concept: str
    question_text: str
    options: List[str]  # 4 options
    correct_answer: int  # index 0-3
    trap_answer: int  # index of plausible-but-wrong answer
    explanation: str  # why trap is wrong
    difficulty: str  # "hard", "very_hard", "expert"
    misconception_targeted: str


class AdversarialResponse(BaseModel):
    """Student's response to adversarial challenge."""
    question_id: str
    selected_answer: int
    is_correct: bool
    fell_for_trap: bool  # selected the trap answer
    time_taken: float  # seconds
    confidence: Optional[int] = None  # 1-5 if asked


class AdversarialChallengeSystem:
    """
    Generates and manages adversarial learning challenges.
    
    Innovation: Most systems avoid difficult questions; this seeks them out.
    Goal: Build resilient understanding, not brittle memorization.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Args:
            api_key: OpenAI API key for GPT-4 generation
        """
        self.use_openai = OPENAI_AVAILABLE
        
        if self.use_openai and api_key:
            openai.api_key = api_key
        
        # Common misconceptions database
        self.misconceptions = self._load_misconceptions()
        
        # Gamification parameters
        self.difficulty_xp = {
            'hard': 50,
            'very_hard': 100,
            'expert': 200
        }
    
    def generate_adversarial_question(
        self,
        concept: str,
        student_errors: List[Dict],
        difficulty: str = 'hard'
    ) -> AdversarialQuestion:
        """
        Generate adversarial question targeting student's misconceptions.
        
        Args:
            concept: target concept
            student_errors: list of previous wrong answers (error pattern analysis)
            difficulty: challenge level
            
        Returns:
            AdversarialQuestion with trap answer
        """
        # Identify most likely misconception from error patterns
        misconception = self._identify_misconception(concept, student_errors)
        
        if self.use_openai:
            return self._generate_with_llm(concept, misconception, difficulty)
        else:
            return self._generate_with_template(concept, misconception, difficulty)
    
    def _generate_with_llm(
        self,
        concept: str,
        misconception: Misconception,
        difficulty: str
    ) -> AdversarialQuestion:
        """Generate adversarial question using GPT-4."""
        
        prompt = f"""Create a challenging multiple-choice question for the concept "{concept}".

Target Misconception: {misconception.misconception_text}
Correct Understanding: {misconception.correct_understanding}

Requirements:
1. Create a question where the misconception leads to a plausible-but-wrong answer
2. Include 4 options: 1 correct, 1 trap (misconception-based), 2 distractors
3. Make it intellectually challenging, not just tricky
4. Difficulty level: {difficulty}

Output JSON format:
{{
    "question": "Your question here",
    "options": ["A", "B", "C", "D"],
    "correct_index": 0-3,
    "trap_index": 0-3,
    "explanation": "Why the trap is wrong and correct is right"
}}
"""
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert in creating challenging educational assessments that build deep understanding."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                max_tokens=500
            )
            
            result = json.loads(response.choices[0].message.content)
            
            return AdversarialQuestion(
                question_id=f"adv_{concept}_{random.randint(1000, 9999)}",
                concept=concept,
                question_text=result['question'],
                options=result['options'],
                correct_answer=result['correct_index'],
                trap_answer=result['trap_index'],
                explanation=result['explanation'],
                difficulty=difficulty,
                misconception_targeted=misconception.misconception_text
            )
            
        except Exception as e:
            print(f"LLM generation failed: {e}, using template")
            return self._generate_with_template(concept, misconception, difficulty)
    
    def _generate_with_template(
        self,
        concept: str,
        misconception: Misconception,
        difficulty: str
    ) -> AdversarialQuestion:
        """Generate from predefined challenging questions."""
        
        templates = {
            'recursion': {
                'question': "What is the output of this recursive function?\n\n```python\ndef mystery(n):\n    if n <= 1:\n        return 1\n    return n + mystery(n-2)\n```\n\nFor mystery(5):",
                'options': [
                    "9 (correct: 5+3+1)",
                    "15 (trap: thinking it's 5+4+3+2+1)",
                    "6 (distractor)",
                    "Error: infinite recursion (distractor)"
                ],
                'correct': 0,
                'trap': 1,
                'explanation': "The trap answer assumes all numbers are summed, but the function skips even numbers (n-2). Correct trace: 5 + mystery(3) → 5 + (3 + mystery(1)) → 5 + 3 + 1 = 9"
            },
            'loops': {
                'question': "How many times does 'X' print?\n\n```python\nfor i in range(5):\n    if i % 2 == 0:\n        continue\n    print('X')\n```",
                'options': [
                    "2 (correct: only i=1 and i=3)",
                    "5 (trap: forgetting continue skips)",
                    "3 (trap: including i=0)",
                    "0 (distractor)"
                ],
                'correct': 0,
                'trap': 1,
                'explanation': "The trap assumes all iterations print. But 'continue' skips even numbers (0,2,4). Only odd numbers (1,3) print, so 2 times."
            },
            'functions': {
                'question': "What does this function return?\n\n```python\ndef transform(lst):\n    lst.append(99)\n    return lst\n\noriginal = [1, 2]\nresult = transform(original)\nprint(len(original))\n```",
                'options': [
                    "3 (correct: list mutated)",
                    "2 (trap: thinking copy was made)",
                    "Error (distractor)",
                    "1 (distractor)"
                ],
                'correct': 0,
                'trap': 1,
                'explanation': "The trap assumes the function creates a copy. But lists are mutable and passed by reference, so 'original' is modified directly. Correct: len([1,2,99]) = 3"
            }
        }
        
        if concept in templates:
            template = templates[concept]
            return AdversarialQuestion(
                question_id=f"adv_{concept}_{random.randint(1000, 9999)}",
                concept=concept,
                question_text=template['question'],
                options=template['options'],
                correct_answer=template['correct'],
                trap_answer=template['trap'],
                explanation=template['explanation'],
                difficulty=difficulty,
                misconception_targeted=misconception.misconception_text
            )
        
        # Generic fallback
        return self._create_generic_challenge(concept, misconception, difficulty)
    
    def evaluate_response(
        self,
        question: AdversarialQuestion,
        response: AdversarialResponse
    ) -> Dict:
        """
        Evaluate student response and provide feedback.
        
        Returns:
            dict with XP earned, feedback, and learning insights
        """
        xp_earned = 0
        feedback = ""
        insights = []
        
        if response.is_correct:
            # Success on adversarial question = big reward
            xp_earned = self.difficulty_xp[question.difficulty]
            feedback = f"🎉 Excellent! You overcame a challenging {question.difficulty} question. {xp_earned} XP earned!"
            insights.append("You demonstrated robust understanding")
            
            if response.confidence and response.confidence >= 4:
                insights.append("Your confidence matches your competence—great metacognition!")
            
        elif response.fell_for_trap:
            # Fell for trap = learning opportunity
            feedback = f"⚠️ Close! You fell for a common misconception: {question.misconception_targeted}"
            insights.append(question.explanation)
            insights.append("Review this concept to build resilient understanding")
            
        else:
            # Wrong but not trap = needs more practice
            feedback = "Not quite. Let's review the correct approach:"
            insights.append(question.explanation)
        
        return {
            'xp_earned': xp_earned,
            'feedback': feedback,
            'insights': insights,
            'misconception_exposed': response.fell_for_trap,
            'recommendation': 'review_concept' if response.fell_for_trap else 'continue'
        }
    
    def _identify_misconception(
        self,
        concept: str,
        errors: List[Dict]
    ) -> Misconception:
        """
        Identify student's likely misconception from error patterns.
        
        Uses error clustering to detect systematic misunderstandings.
        """
        concept_misconceptions = [
            m for m in self.misconceptions 
            if m.concept == concept
        ]
        
        if not concept_misconceptions:
            # Generic misconception
            return Misconception(
                concept=concept,
                misconception_text="Surface-level understanding without deep comprehension",
                correct_understanding="Full conceptual understanding",
                frequency=0.5
            )
        
        # Simple heuristic: most common misconception
        # In production: cluster errors to identify specific misconception
        return sorted(concept_misconceptions, key=lambda m: -m.frequency)[0]
    
    def _load_misconceptions(self) -> List[Misconception]:
        """Load database of common misconceptions."""
        return [
            Misconception(
                concept='recursion',
                misconception_text="Thinking recursion is just a loop",
                correct_understanding="Recursion involves function calling itself with different state",
                frequency=0.8
            ),
            Misconception(
                concept='recursion',
                misconception_text="Forgetting the base case causes infinite recursion",
                correct_understanding="Base case is essential termination condition",
                frequency=0.9
            ),
            Misconception(
                concept='loops',
                misconception_text="Confusing continue vs break",
                correct_understanding="continue skips to next iteration, break exits loop entirely",
                frequency=0.7
            ),
            Misconception(
                concept='functions',
                misconception_text="Thinking all parameters are copied (ignoring mutability)",
                correct_understanding="Mutable objects (lists, dicts) are passed by reference",
                frequency=0.85
            ),
            Misconception(
                concept='arrays',
                misconception_text="Array indices start at 1",
                correct_understanding="Most languages use 0-based indexing",
                frequency=0.6
            )
        ]
    
    def _create_generic_challenge(
        self,
        concept: str,
        misconception: Misconception,
        difficulty: str
    ) -> AdversarialQuestion:
        """Create generic challenging question."""
        return AdversarialQuestion(
            question_id=f"adv_{concept}_generic",
            concept=concept,
            question_text=f"Advanced {concept} challenge: What is the subtle bug in this code?",
            options=[
                "No bug (trap)",
                "Correct bug identification",
                "Different bug",
                "Syntax error"
            ],
            correct_answer=1,
            trap_answer=0,
            explanation="There is a subtle logical error related to " + misconception.misconception_text,
            difficulty=difficulty,
            misconception_targeted=misconception.misconception_text
        )
    
    def create_challenge_mode(
        self,
        concepts: List[str],
        n_questions: int = 5
    ) -> Dict:
        """
        Create a gauntlet of adversarial challenges (gamified).
        
        Returns:
            challenge pack with difficulty progression
        """
        difficulties = ['hard', 'hard', 'very_hard', 'very_hard', 'expert']
        
        questions = []
        for concept, diff in zip(concepts * (n_questions // len(concepts) + 1), difficulties[:n_questions]):
            q = self.generate_adversarial_question(concept, [], diff)
            questions.append(q)
        
        total_possible_xp = sum(self.difficulty_xp[q.difficulty] for q in questions)
        
        return {
            'challenge_id': f'gauntlet_{random.randint(1000, 9999)}',
            'title': '💥 Critical Thinking Gauntlet',
            'description': 'Face progressively harder questions targeting common misconceptions. Build resilient understanding!',
            'questions': [q.dict() for q in questions],
            'total_xp': total_possible_xp,
            'difficulty_distribution': {
                'hard': sum(1 for q in questions if q.difficulty == 'hard'),
                'very_hard': sum(1 for q in questions if q.difficulty == 'very_hard'),
                'expert': sum(1 for q in questions if q.difficulty == 'expert')
            }
        }


# FastAPI Integration
"""
from adversarial_challenges import AdversarialChallengeSystem, AdversarialResponse

adv_system = AdversarialChallengeSystem()

@app.post("/adversarial_question")
async def generate_adversarial_question(
    concept: str,
    student_errors: List[Dict] = [],
    difficulty: str = 'hard'
):
    question = adv_system.generate_adversarial_question(
        concept,
        student_errors,
        difficulty
    )
    return question.dict()

@app.post("/evaluate_adversarial")
async def evaluate_adversarial_response(
    question: AdversarialQuestion,
    response: AdversarialResponse
):
    evaluation = adv_system.evaluate_response(question, response)
    return evaluation

@app.get("/challenge_gauntlet")
async def create_challenge_gauntlet(concepts: List[str] = ['loops', 'recursion']):
    challenge = adv_system.create_challenge_mode(concepts, n_questions=5)
    return challenge
"""

