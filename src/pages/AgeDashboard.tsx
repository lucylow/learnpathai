import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { BookOpen, Target, TrendingUp, Clock, Award, Zap, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getAgeGroupById } from "@/config/ageGroups";
import { getActiveCoursesByAgeGroup, getLearningPathByAgeGroup, type AgeAwareCourse } from "@/services/ageAwareMockData";
import { ageAwarePathGenerator } from "@/services/ageAwarePathGenerator";
import type { AgeGroupId, PathConcept } from "@/types/ageGroups";
import { track } from "@/utils/telemetry";

const AgeDashboard = () => {
  const navigate = useNavigate();
  const [ageGroupId, setAgeGroupId] = useState<AgeGroupId | null>(null);
  const [userAge, setUserAge] = useState<number | null>(null);
  const [activeCourses, setActiveCourses] = useState<AgeAwareCourse[]>([]);
  const [learningPath, setLearningPath] = useState<PathConcept[]>([]);

  useEffect(() => {
    // Check if user has selected an age group
    const storedAgeGroup = localStorage.getItem('userAgeGroup') as AgeGroupId | null;
    const storedAge = localStorage.getItem('userAge');

    if (!storedAgeGroup || !storedAge) {
      // Redirect to age selection if not set
      navigate('/age-selection');
      return;
    }

    setAgeGroupId(storedAgeGroup);
    setUserAge(parseInt(storedAge, 10));

    // Load age-appropriate content
    const courses = getActiveCoursesByAgeGroup(storedAgeGroup);
    const path = getLearningPathByAgeGroup(storedAgeGroup);

    setActiveCourses(courses);
    setLearningPath(path);

    track('age_dashboard_loaded', {
      ageGroupId: storedAgeGroup,
      userAge: parseInt(storedAge, 10),
      courseCount: courses.length,
    });
  }, [navigate]);

  if (!ageGroupId || !userAge) {
    return null; // Will redirect
  }

  const ageGroup = getAgeGroupById(ageGroupId);
  if (!ageGroup) return null;

  // Calculate statistics
  const completedConcepts = learningPath.filter(c => c.status === 'completed').length;
  const inProgressConcepts = learningPath.filter(c => c.status === 'in-progress').length;
  const avgMastery = learningPath.length > 0
    ? Math.round((learningPath.reduce((sum, c) => sum + c.mastery, 0) / learningPath.length) * 100)
    : 0;

  return (
    <Layout>
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Header with Age Group Badge */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-foreground">Welcome back!</h1>
                <Badge 
                  className="text-lg px-3 py-1"
                  style={{ backgroundColor: ageGroup.color }}
                >
                  {ageGroup.icon} {ageGroup.label}
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                Continue your {ageGroup.label.toLowerCase()} learning journey
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/age-selection">
                <Button variant="outline" size="lg">
                  <Settings className="h-4 w-4 mr-2" />
                  Change Age Group
                </Button>
              </Link>
              <Link to="/learning-path">
                <Button variant="outline" size="lg">
                  <Zap className="h-4 w-4 mr-2" />
                  View Full Path
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Age-Appropriate Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active {ageGroup.uiPreferences.interactionStyle === 'playful' ? 'Adventures' : 'Courses'}</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCourses.length}</div>
              <p className="text-xs text-muted-foreground">
                {inProgressConcepts} concepts in progress
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mastery Level</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgMastery}%</div>
              <p className="text-xs text-muted-foreground">
                {completedConcepts} concepts mastered
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedConcepts}/{learningPath.length}</div>
              <p className="text-xs text-muted-foreground">Concepts completed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Limit</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ageGroup.contentRestrictions.maxDailyLearningTime}min</div>
              <p className="text-xs text-muted-foreground">
                {ageGroup.contentRestrictions.requiredSupervision ? 'With supervision' : 'Independent'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Learning Path for Age Group */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Your Learning Path</h2>
            <Badge variant="outline" className="text-sm">
              {ageGroup.label} Level
            </Badge>
          </div>
          
          <div className="grid gap-4">
            {learningPath.slice(0, 4).map((concept, index) => (
              <Card 
                key={concept.concept}
                className={`${
                  concept.status === 'completed' ? 'bg-green-50/50 dark:bg-green-900/10' :
                  concept.status === 'in-progress' ? 'bg-blue-50/50 dark:bg-blue-900/10' :
                  'opacity-60'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      concept.status === 'completed' ? 'bg-green-500 text-white' :
                      concept.status === 'in-progress' ? 'bg-blue-500 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {concept.status === 'completed' ? '✓' : index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{concept.concept}</h3>
                        <Badge variant={
                          concept.status === 'completed' ? 'default' :
                          concept.status === 'in-progress' ? 'secondary' :
                          'outline'
                        }>
                          {concept.status === 'completed' ? 'Completed' :
                           concept.status === 'in-progress' ? 'In Progress' :
                           'Locked'}
                        </Badge>
                      </div>
                      {concept.reasoning && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {concept.reasoning}
                        </p>
                      )}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Mastery</span>
                          <span className="font-medium">{Math.round(concept.mastery * 100)}%</span>
                        </div>
                        <Progress value={concept.mastery * 100} />
                        {concept.estimatedTime && (
                          <p className="text-xs text-muted-foreground">
                            ⏱️ Estimated time: {concept.estimatedTime} minutes
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Active Courses for Age Group */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">
            {ageGroup.uiPreferences.interactionStyle === 'playful' ? 'Fun Activities' : 'Your Courses'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {activeCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="mt-2">{course.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      Level {course.difficulty}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
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
                    <Button size="sm" className="flex-1">
                      {ageGroup.uiPreferences.interactionStyle === 'playful' ? 'Play' : 'Continue'}
                    </Button>
                    <Button size="sm" variant="outline">Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {activeCourses.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  No active courses yet. Start learning today!
                </p>
                <Link to="/learning-path">
                  <Button>Explore Learning Paths</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default AgeDashboard;

