import { useState } from 'react'
import './App.css'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import LearningStyleAssessment from './components/LearningStyleAssessment'
import KnowledgeAssessment from './components/KnowledgeAssessment'
import LearningPathViewer from './components/LearningPathViewer'

function App() {
  const [currentView, setCurrentView] = useState('landing') // landing, assessment-style, assessment-knowledge, path, dashboard
  const [user, setUser] = useState(null)
  const [learningStyle, setLearningStyle] = useState(null)
  const [knowledgeGaps, setKnowledgeGaps] = useState(null)
  const [learningPath, setLearningPath] = useState(null)

  const handleGetStarted = () => {
    setUser({ name: 'Student', id: 'demo-user' })
    setCurrentView('assessment-style')
  }

  const handleLearningStyleComplete = (style) => {
    setLearningStyle(style)
    setCurrentView('assessment-knowledge')
  }

  const handleKnowledgeAssessmentComplete = (gaps) => {
    setKnowledgeGaps(gaps)
    // Generate learning path based on gaps and style
    generateLearningPath(gaps, learningStyle)
  }

  const generateLearningPath = (gaps, style) => {
    // Simulate AI-generated learning path
    const path = {
      id: 'path-1',
      topic: 'Python Programming',
      durationWeeks: 8,
      progress: 0,
      currentMilestoneIndex: 0,
      milestones: [
        {
          id: 'm1',
          week: 1,
          title: 'Python Basics',
          description: 'Variables, data types, and basic operations',
          isCompleted: false,
          resources: [
            {
              id: 'r1',
              title: 'Introduction to Python Variables',
              type: 'video',
              duration: 15,
              difficulty: 'beginner',
              url: '#',
              completed: false
            },
            {
              id: 'r2',
              title: 'Python Data Types Explained',
              type: 'article',
              duration: 10,
              difficulty: 'beginner',
              url: '#',
              completed: false
            },
            {
              id: 'r3',
              title: 'Practice: Variables Quiz',
              type: 'quiz',
              duration: 5,
              difficulty: 'beginner',
              url: '#',
              completed: false
            }
          ]
        },
        {
          id: 'm2',
          week: 2,
          title: 'Control Flow',
          description: 'If statements, loops, and conditional logic',
          isCompleted: false,
          resources: [
            {
              id: 'r4',
              title: 'Mastering If-Else Statements',
              type: 'video',
              duration: 20,
              difficulty: 'beginner',
              url: '#',
              completed: false
            },
            {
              id: 'r5',
              title: 'For and While Loops Tutorial',
              type: 'interactive',
              duration: 25,
              difficulty: 'intermediate',
              url: '#',
              completed: false
            }
          ]
        },
        {
          id: 'm3',
          week: 3,
          title: 'Functions',
          description: 'Creating and using functions effectively',
          isCompleted: false,
          resources: [
            {
              id: 'r6',
              title: 'Python Functions Deep Dive',
              type: 'video',
              duration: 30,
              difficulty: 'intermediate',
              url: '#',
              completed: false
            },
            {
              id: 'r7',
              title: 'Function Parameters and Return Values',
              type: 'article',
              duration: 15,
              difficulty: 'intermediate',
              url: '#',
              completed: false
            }
          ]
        }
      ]
    }
    setLearningPath(path)
    setCurrentView('path')
  }

  const handleResourceComplete = (resourceId) => {
    setLearningPath(prev => {
      const updated = { ...prev }
      updated.milestones = updated.milestones.map(milestone => ({
        ...milestone,
        resources: milestone.resources.map(resource =>
          resource.id === resourceId ? { ...resource, completed: true } : resource
        )
      }))
      
      // Calculate progress
      const totalResources = updated.milestones.reduce((sum, m) => sum + m.resources.length, 0)
      const completedResources = updated.milestones.reduce(
        (sum, m) => sum + m.resources.filter(r => r.completed).length,
        0
      )
      updated.progress = (completedResources / totalResources) * 100
      
      return updated
    })
  }

  const handleViewDashboard = () => {
    setCurrentView('dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {currentView === 'landing' && <LandingPage onGetStarted={handleGetStarted} />}
      {currentView === 'assessment-style' && (
        <LearningStyleAssessment onComplete={handleLearningStyleComplete} />
      )}
      {currentView === 'assessment-knowledge' && (
        <KnowledgeAssessment onComplete={handleKnowledgeAssessmentComplete} />
      )}
      {currentView === 'path' && learningPath && (
        <LearningPathViewer
          learningPath={learningPath}
          onResourceComplete={handleResourceComplete}
          onViewDashboard={handleViewDashboard}
        />
      )}
      {currentView === 'dashboard' && (
        <Dashboard
          user={user}
          learningPath={learningPath}
          learningStyle={learningStyle}
          onBackToPath={() => setCurrentView('path')}
        />
      )}
    </div>
  )
}

export default App

