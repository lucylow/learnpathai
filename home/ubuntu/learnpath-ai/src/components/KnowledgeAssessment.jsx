import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react'

export default function KnowledgeAssessment({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)

  const questions = [
    {
      id: 1,
      concept: "Variables",
      question: "What is the correct way to create a variable in Python?",
      options: [
        "var x = 5",
        "x = 5",
        "int x = 5",
        "let x = 5"
      ],
      correctAnswer: 1,
      difficulty: 1,
      explanation: "In Python, you simply assign a value to a variable name without declaring its type. Python is dynamically typed."
    },
    {
      id: 2,
      concept: "Data Types",
      question: "Which of the following is NOT a basic data type in Python?",
      options: [
        "int",
        "float",
        "char",
        "str"
      ],
      correctAnswer: 2,
      difficulty: 2,
      explanation: "Python doesn't have a 'char' data type. Single characters are represented as strings of length 1."
    },
    {
      id: 3,
      concept: "Loops",
      question: "What will be the output of: for i in range(3): print(i)",
      options: [
        "1 2 3",
        "0 1 2",
        "0 1 2 3",
        "1 2"
      ],
      correctAnswer: 1,
      difficulty: 2,
      explanation: "The range(3) function generates numbers from 0 to 2 (3 is exclusive). So it prints 0, 1, 2."
    },
    {
      id: 4,
      concept: "Functions",
      question: "How do you define a function in Python?",
      options: [
        "function myFunc():",
        "def myFunc():",
        "func myFunc():",
        "define myFunc():"
      ],
      correctAnswer: 1,
      difficulty: 1,
      explanation: "Python uses the 'def' keyword to define functions, followed by the function name and parentheses."
    },
    {
      id: 5,
      concept: "Lists",
      question: "How do you access the first element of a list called 'myList'?",
      options: [
        "myList[1]",
        "myList.first()",
        "myList[0]",
        "myList.get(0)"
      ],
      correctAnswer: 2,
      difficulty: 1,
      explanation: "Python uses zero-based indexing, so the first element is at index 0."
    }
  ]

  const handleAnswer = (selectedIndex) => {
    setSelectedAnswer(selectedIndex)
    const isCorrect = selectedIndex === questions[currentQuestion].correctAnswer
    setAnswers([...answers, { 
      concept: questions[currentQuestion].concept, 
      correct: isCorrect,
      proficiency: isCorrect ? 0.8 : 0.2
    }])
    setShowExplanation(true)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowExplanation(false)
      setSelectedAnswer(null)
    } else {
      // Calculate knowledge gaps
      const conceptProficiency = answers.reduce((acc, answer) => {
        if (!acc[answer.concept]) {
          acc[answer.concept] = []
        }
        acc[answer.concept].push(answer.proficiency)
        return acc
      }, {})

      const knowledgeGaps = Object.entries(conceptProficiency).map(([concept, proficiencies]) => ({
        concept,
        proficiency: proficiencies.reduce((sum, p) => sum + p, 0) / proficiencies.length
      }))

      onComplete(knowledgeGaps)
    }
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-3xl w-full p-8 shadow-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Knowledge Assessment</h2>
          <p className="text-gray-600">Let's identify your current knowledge level</p>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Question {currentQuestion + 1} of {questions.length}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Difficulty:</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-4 rounded ${
                        i < currentQ.difficulty ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-4 inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Concept: {currentQ.concept}
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-6">{currentQ.question}</h3>
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showExplanation && handleAnswer(index)}
                disabled={showExplanation}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ${
                  showExplanation
                    ? index === currentQ.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : index === selectedAnswer
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                    : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {showExplanation && index === currentQ.correctAnswer && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {showExplanation && index === selectedAnswer && index !== currentQ.correctAnswer && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {showExplanation && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">Explanation</h4>
                <p className="text-blue-700 text-sm">{currentQ.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {showExplanation && (
          <Button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white py-6 text-lg rounded-xl"
          >
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Generate My Learning Path'}
          </Button>
        )}
      </Card>
    </div>
  )
}

