import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { BookOpen, Target, TrendingUp, Clock, Award, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { 
  mockUserStats, 
  getActiveCourses, 
  getRecentAchievements,
  mockActivities,
  mockUserProgress 
} from "@/services/mockData";
import { XPTracker } from "@/components/gamification/XPTracker";
import { AITutor } from "@/components/ai/AITutor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const activeCourses = getActiveCourses();
  const recentAchievements = getRecentAchievements(3);
  const recentActivities = mockActivities.slice(0, 5);

  return (
    <Layout>
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back!</h1>
              <p className="text-muted-foreground text-lg">Continue your learning journey</p>
            </div>
            <Link to="/learning-path-viewer">
              <Button variant="outline" size="lg">
                <Zap className="h-4 w-4 mr-2" />
                View Knowledge Graph
              </Button>
            </Link>
          </div>
        </div>

        {/* XP Tracker */}
        <div className="mb-12">
          <XPTracker
            currentXP={mockUserProgress.currentXP}
            level={mockUserProgress.level}
            nextLevelXP={mockUserProgress.nextLevelXP}
            streak={mockUserProgress.streak}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockUserStats.activeCourses}</div>
              <p className="text-xs text-muted-foreground">{mockUserStats.completedCourses} completed this month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockUserStats.learningStreak} days</div>
              <p className="text-xs text-muted-foreground">Keep it up!</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockUserStats.averageProgress}%</div>
              <p className="text-xs text-muted-foreground">Avg score: {mockUserStats.averageScore}%</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockUserStats.totalStudyTime}h</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Recent Achievements</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {recentAchievements.map((achievement) => (
                <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                        <Badge variant={achievement.rarity === 'Epic' ? 'default' : 'secondary'} className="text-xs">
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Current Learning Paths */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Your Learning Paths</h2>
            <Link to="/learning-path">
              <Button variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                View All Paths
              </Button>
            </Link>
          </div>
          
          {activeCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </div>
                  <Badge variant="outline">{course.difficulty}</Badge>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {course.category}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {course.completedLessons}/{course.totalLessons} lessons
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>⏱️ {course.estimatedTime}</span>
                  <span>👨‍🏫 {course.instructor}</span>
                  <span>⭐ {course.rating}/5.0</span>
                </div>
                <div className="flex gap-4">
                  <Button size="sm">Continue Learning</Button>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

         {/* Activity & AI Tutor Tabs */}
         <div className="space-y-6">
           <h2 className="text-2xl font-bold text-foreground">Activity & Assistance</h2>
           <Tabs defaultValue="activity" className="w-full">
             <TabsList className="grid w-full grid-cols-2">
               <TabsTrigger value="activity">Recent Activity</TabsTrigger>
               <TabsTrigger value="tutor">AI Tutor</TabsTrigger>
             </TabsList>
             
             <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'lesson' ? 'bg-blue-500/10' :
                      activity.type === 'quiz' ? 'bg-green-500/10' :
                      activity.type === 'project' ? 'bg-purple-500/10' :
                      'bg-orange-500/10'
                    }`}>
                      {activity.type === 'lesson' && <BookOpen className="h-5 w-5 text-blue-600" />}
                      {activity.type === 'quiz' && <Target className="h-5 w-5 text-green-600" />}
                      {activity.type === 'project' && <Award className="h-5 w-5 text-purple-600" />}
                      {activity.type === 'discussion' && <TrendingUp className="h-5 w-5 text-orange-600" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{activity.title}</h3>
                      <p className="text-sm text-muted-foreground">{activity.course}</p>
                    </div>
                    <div className="text-right">
                      {activity.score && (
                        <div className="font-semibold text-green-600">{activity.score}%</div>
                      )}
                      <div className="text-sm text-muted-foreground">{activity.duration} min</div>
                    </div>
                  </div>
                ))}
               </div>
             </CardContent>
           </Card>
             </TabsContent>

             <TabsContent value="tutor">
               <AITutor contextConcept="Python Programming" />
             </TabsContent>
           </Tabs>
         </div>
       </main>
     </Layout>
  );
};

export default Dashboard;
