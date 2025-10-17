import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, Circle, Video, BookOpen, FileText, HelpCircle, Clock, BarChart3, Sparkles } from 'lucide-react'

export default function LearningPathViewer({ learningPath, onResourceComplete, onViewDashboard }) {
  const getResourceIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />
      case 'article': return <FileText className="w-4 h-4" />
      case 'interactive': return <Sparkles className="w-4 h-4" />
      case 'quiz': return <HelpCircle className="w-4 h-4" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700'
      case 'advanced': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">AI-Generated Learning Path</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{learningPath.topic} Learning Path</h1>
          <p className="text-gray-600 text-lg">
            {learningPath.durationWeeks} weeks • {learningPath.progress.toFixed(1)}% Complete
          </p>
          <div className="w-full max-w-2xl mx-auto bg-gray-200 rounded-full h-4 mt-4">
            <div
              className="bg-gradient-to-r from-blue-600 to-emerald-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${learningPath.progress}%` }}
            ></div>
          </div>
          <div className="mt-4">
            <Button
              onClick={onViewDashboard}
              variant="outline"
              className="gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              View Dashboard
            </Button>
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="space-y-8">
          {learningPath.milestones.map((milestone, index) => {
            const isActive = index === learningPath.currentMilestoneIndex
            const isPast = index < learningPath.currentMilestoneIndex
            const isFuture = index > learningPath.currentMilestoneIndex

            return (
              <div
                key={milestone.id}
                className={`relative ${isFuture ? 'opacity-60' : 'opacity-100'}`}
              >
                {/* Timeline connector */}
                {index < learningPath.milestones.length - 1 && (
                  <div
                    className={`absolute left-6 top-16 w-0.5 h-8 ${
                      isPast ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  ></div>
                )}

                <div className="flex items-start gap-6">
                  {/* Milestone indicator */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      milestone.isCompleted
                        ? 'bg-green-500 border-green-600'
                        : isActive
                        ? 'bg-blue-500 border-blue-600'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    {milestone.isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <span className={`font-semibold ${isActive ? 'text-white' : 'text-gray-500'}`}>
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Milestone content */}
                  <Card className="flex-1 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Week {milestone.week}</div>
                        <h3 className="text-2xl font-bold text-gray-800">{milestone.title}</h3>
                        <p className="text-gray-600 mt-1">{milestone.description}</p>
                      </div>
                      {isActive && (
                        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          Current
                        </div>
                      )}
                    </div>

                    {/* Resources */}
                    <div className="grid gap-4 mt-6">
                      {milestone.resources.map((resource) => (
                        <div
                          key={resource.id}
                          className={`border-2 rounded-lg p-4 transition-all duration-200 ${
                            resource.completed
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-10 h-10 rounded-lg ${
                                resource.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                              } flex items-center justify-center`}>
                                {getResourceIcon(resource.type)}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">{resource.title}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(resource.difficulty)}`}>
                                    {resource.difficulty}
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {resource.duration} min
                                  </span>
                                  <span className="text-xs text-gray-500 capitalize">{resource.type}</span>
                                </div>
                              </div>
                            </div>
                            {resource.completed ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Completed</span>
                              </div>
                            ) : (
                              <Button
                                onClick={() => onResourceComplete(resource.id)}
                                size="sm"
                                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                              >
                                Start
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )
          })}
        </div>

        {/* Completion Message */}
        {learningPath.progress === 100 && (
          <Card className="mt-8 p-8 text-center bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h3>
            <p className="text-gray-600">You've completed your learning path. Keep up the great work!</p>
          </Card>
        )}
      </div>
    </div>
  )
}

