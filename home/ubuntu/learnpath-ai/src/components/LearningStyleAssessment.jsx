import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Video, BookOpen, Headphones, Activity, ArrowRight } from 'lucide-react'

export default function LearningStyleAssessment({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])

  const questions = [
    {
      id: 1,
      question: "When learning something new, I prefer to:",
      options: [
        { text: "Watch videos or demonstrations", style: "visual", icon: <Video className="w-6 h-6" /> },
        { text: "Read articles or documentation", style: "reading", icon: <BookOpen className="w-6 h-6" /> },
        { text: "Listen to explanations or podcasts", style: "auditory", icon: <Headphones className="w-6 h-6" /> },
        { text: "Try it hands-on immediately", style: "kinesthetic", icon: <Activity className="w-6 h-6" /> }
      ]
    },
    {
      id: 2,
      question: "I remember information best when:",
      options: [
        { text: "I see diagrams and visual aids", style: "visual", icon: <Video className="w-6 h-6" /> },
        { text: "I take detailed notes", style: "reading", icon: <BookOpen className="w-6 h-6" /> },
        { text: "I discuss it with others", style: "auditory", icon: <Headphones className="w-6 h-6" /> },
        { text: "I practice and apply it", style: "kinesthetic", icon: <Activity className="w-6 h-6" /> }
      ]
    },
    {
      id: 3,
      question: "My ideal study environment includes:",
      options: [
        { text: "Visual presentations and infographics", style: "visual", icon: <Video className="w-6 h-6" /> },
        { text: "Textbooks and written materials", style: "reading", icon: <BookOpen className="w-6 h-6" /> },
        { text: "Audio lectures or discussions", style: "auditory", icon: <Headphones className="w-6 h-6" /> },
        { text: "Interactive exercises and projects", style: "kinesthetic", icon: <Activity className="w-6 h-6" /> }
      ]
    },
    {
      id: 4,
      question: "When solving problems, I tend to:",
      options: [
        { text: "Visualize the solution mentally", style: "visual", icon: <Video className="w-6 h-6" /> },
        { text: "Write out the steps", style: "reading", icon: <BookOpen className="w-6 h-6" /> },
        { text: "Talk through the process", style: "auditory", icon: <Headphones className="w-6 h-6" /> },
        { text: "Experiment and test solutions", style: "kinesthetic", icon: <Activity className="w-6 h-6" /> }
      ]
    }
  ]

  const handleAnswer = (styleType) => {
    const newAnswers = [...answers, styleType]
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Calculate learning style preferences
      const styleCounts = newAnswers.reduce((acc, style) => {
        acc[style] = (acc[style] || 0) + 1
        return acc
      }, {})

      const total = newAnswers.length
      const learningStyle = {
        visual: (styleCounts.visual || 0) / total,
        reading: (styleCounts.reading || 0) / total,
        auditory: (styleCounts.auditory || 0) / total,
        kinesthetic: (styleCounts.kinesthetic || 0) / total
      }

      onComplete(learningStyle)
    }
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-3xl w-full p-8 shadow-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Discover Your Learning Style</h2>
          <p className="text-gray-600">Help us personalize your learning experience</p>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Question {currentQuestion + 1} of {questions.length}</span>
              <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-6">{currentQ.question}</h3>
          <div className="grid gap-4">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option.style)}
                className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-emerald-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-200">
                  {option.icon}
                </div>
                <span className="text-lg font-medium text-gray-700 group-hover:text-blue-700">{option.text}</span>
                <ArrowRight className="w-5 h-5 ml-auto text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index <= currentQuestion ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

