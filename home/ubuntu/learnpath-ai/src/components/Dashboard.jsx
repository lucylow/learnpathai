import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, TrendingUp, Target, Award, Clock, Video, BookOpen, FileText, HelpCircle } from 'lucide-react'

export default function Dashboard({ user, learningPath, learningStyle, onBackToPath }) {
  const totalResources = learningPath.milestones.reduce((sum, m) => sum + m.resources.length, 0)
  const completedResources = learningPath.milestones.reduce(
    (sum, m) => sum + m.resources.filter(r => r.completed).length,
    0
  )
  const totalTime = learningPath.milestones.reduce(
    (sum, m) => sum + m.resources.reduce((s, r) => s + r.duration, 0),
    0
  )
  const completedTime = learningPath.milestones.reduce(
    (sum, m) => sum + m.resources.filter(r => r.completed).reduce((s, r) => s + r.duration, 0),
    0
  )

  const resourceTypes = learningPath.milestones.reduce((acc, m) => {
    m.resources.forEach(r => {
      if (r.completed) {
        acc[r.type] = (acc[r.type] || 0) + 1
      }
    })
    return acc
  }, {})

  const topLearningStyle = Object.entries(learningStyle || {}).reduce((a, b) => 
    (learningStyle[a[0]] || 0) > (learningStyle[b[0]] || 0) ? a : b
  )[0]

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={onBackToPath}
            variant="outline"
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Learning Path
          </Button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Dashboard</h1>
          <p className="text-gray-600 text-lg">Track your progress and achievements</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Overall Progress"
            value={`${learningPath.progress.toFixed(0)}%`}
            color="blue"
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            title="Resources Completed"
            value={`${completedResources}/${totalResources}`}
            color="emerald"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Time Invested"
            value={`${completedTime} min`}
            color="purple"
          />
          <StatCard
            icon={<Award className="w-6 h-6" />}
            title="Current Week"
            value={`Week ${learningPath.currentMilestoneIndex + 1}`}
            color="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Learning Style */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Learning Style</h2>
            <div className="space-y-4">
              {learningStyle && Object.entries(learningStyle).map(([style, value]) => (
                <div key={style}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">{style}</span>
                    <span className="text-sm text-gray-600">{(value * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-emerald-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${value * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Primary Style:</strong> {topLearningStyle.charAt(0).toUpperCase() + topLearningStyle.slice(1)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Resources are personalized to match your learning preferences
              </p>
            </div>
          </Card>

          {/* Resource Breakdown */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Completed Resources</h2>
            <div className="space-y-4">
              <ResourceTypeRow icon={<Video className="w-5 h-5" />} type="Videos" count={resourceTypes.video || 0} />
              <ResourceTypeRow icon={<FileText className="w-5 h-5" />} type="Articles" count={resourceTypes.article || 0} />
              <ResourceTypeRow icon={<BookOpen className="w-5 h-5" />} type="Interactive" count={resourceTypes.interactive || 0} />
              <ResourceTypeRow icon={<HelpCircle className="w-5 h-5" />} type="Quizzes" count={resourceTypes.quiz || 0} />
            </div>
            <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-800">
                <strong>Total Time:</strong> {totalTime} minutes of content
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                You've completed {((completedTime / totalTime) * 100).toFixed(0)}% of the total learning time
              </p>
            </div>
          </Card>

          {/* Milestones Progress */}
          <Card className="p-6 md:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Milestone Progress</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {learningPath.milestones.map((milestone, index) => {
                const completedCount = milestone.resources.filter(r => r.completed).length
                const totalCount = milestone.resources.length
                const progress = (completedCount / totalCount) * 100

                return (
                  <div
                    key={milestone.id}
                    className={`p-4 rounded-lg border-2 ${
                      milestone.isCompleted
                        ? 'border-green-200 bg-green-50'
                        : index === learningPath.currentMilestoneIndex
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="text-xs text-gray-500 mb-1">Week {milestone.week}</div>
                    <h3 className="font-bold text-gray-800 mb-2">{milestone.title}</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{completedCount}/{totalCount} resources</span>
                      <span className="text-sm font-medium text-blue-600">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-emerald-600 h-1.5 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="mt-6 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Achievements</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <AchievementBadge
              icon={<Award className="w-8 h-8" />}
              title="Getting Started"
              description="Completed first resource"
              unlocked={completedResources > 0}
            />
            <AchievementBadge
              icon={<TrendingUp className="w-8 h-8" />}
              title="Making Progress"
              description="Completed 5 resources"
              unlocked={completedResources >= 5}
            />
            <AchievementBadge
              icon={<Target className="w-8 h-8" />}
              title="Halfway There"
              description="Reached 50% completion"
              unlocked={learningPath.progress >= 50}
            />
            <AchievementBadge
              icon={<Award className="w-8 h-8" />}
              title="Master Learner"
              description="Completed all resources"
              unlocked={learningPath.progress === 100}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  }

  return (
    <Card className="p-6">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </Card>
  )
}

function ResourceTypeRow({ icon, type, count }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
          {icon}
        </div>
        <span className="font-medium text-gray-700">{type}</span>
      </div>
      <span className="text-2xl font-bold text-gray-800">{count}</span>
    </div>
  )
}

function AchievementBadge({ icon, title, description, unlocked }) {
  return (
    <div className={`p-4 rounded-lg border-2 text-center ${
      unlocked ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-gray-50 opacity-50'
    }`}>
      <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${
        unlocked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-400'
      }`}>
        {icon}
      </div>
      <h3 className="font-bold text-gray-800 text-sm mb-1">{title}</h3>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  )
}

