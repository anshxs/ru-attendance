'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  getAuthToken, 
  getUserProfile, 
  getUserCourses, 
  getCourseAttendance,
  UserProfile, 
  SemesterData, 
  CourseAttendance,
  Course 
} from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { 
  BookOpen, 
  Loader2, 
  AlertCircle, 
  Users, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  Eye,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function CoursesContent() {
  const { user } = useAuth();
  const accessToken = getAuthToken();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [semesterData, setSemesterData] = useState<SemesterData | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseAttendance, setCourseAttendance] = useState<CourseAttendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [view, setView] = useState<'courses' | 'attendance'>('courses');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const profile = await getUserProfile();
        setUserProfile(profile);
        
        if (profile.enrollmentNo) {
          const courses = await getUserCourses(profile.enrollmentNo);
          setSemesterData(courses);
        }
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [accessToken]);

  const fetchCourseAttendance = async (course: Course) => {
    if (!userProfile?.enrollmentNo) return;
    
    try {
      setIsAttendanceLoading(true);
      const attendance = await getCourseAttendance(userProfile.enrollmentNo, course.courseId);
      setCourseAttendance(attendance);
      setSelectedCourse(course);
      setView('attendance');
    } catch (err: any) {
      console.error('Failed to fetch attendance:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load attendance data');
    } finally {
      setIsAttendanceLoading(false);
    }
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return 'text-green-400';
      case 'absent':
        return 'text-red-400';
      case 'awaited':
        return 'text-yellow-400';
      default:
        return 'text-zinc-400';
    }
  };

  const getAttendanceStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'awaited':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-zinc-400" />;
    }
  };

  const getCourseTypeColor = (type: string) => {
    switch (type) {
      case 'MAJOR_CORE':
        return 'bg-blue-900 text-blue-300 border-blue-700';
      case 'MINOR':
        return 'bg-purple-900 text-purple-300 border-purple-700';
      case 'ELECTIVE':
        return 'bg-green-900 text-green-300 border-green-700';
      default:
        return 'bg-zinc-900 text-zinc-300 border-zinc-700';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isLectureCompleted = (endTime: string) => {
    return new Date(endTime) < new Date();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-white mx-auto" />
            <p className="text-zinc-400">Loading your courses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black p-6">
          <div className="max-w-md mx-auto mt-10">
            <Card className="bg-black border-red-800">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <AlertCircle className="h-16 w-16 text-red-400 mx-auto" />
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Error Loading Courses</h2>
                    <p className="text-red-400">{error}</p>
                  </div>
                  {view === 'attendance' && (
                    <Button
                      onClick={() => {
                        setView('courses');
                        setError('');
                      }}
                      variant="outline"
                      className="bg-black border-zinc-700 text-white hover:bg-zinc-900"
                    >
                      Back to Courses
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black p-6 space-y-6">
        {/* Page Header */}
        <div className="mb-8">
          {view === 'courses' ? (
            <>
              <h1 className="text-3xl font-bold text-white mb-2">My Courses</h1>
              <p className="text-zinc-400">
                View all your enrolled courses for {semesterData?.program.name} - Semester {semesterData?.semesterNumber}
              </p>
            </>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={() => setView('courses')}
                variant="ghost"
                className="text-zinc-400 hover:text-white p-0 h-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
              <h1 className="text-3xl font-bold text-white">Attendance Details</h1>
              <p className="text-zinc-400">
                {selectedCourse?.courseName} ({selectedCourse?.courseCode})
              </p>
            </div>
          )}
        </div>

        {view === 'courses' ? (
          /* Courses View */
          <div className="space-y-6">
            {/* Program Info Card */}
            <Card className="bg-black border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Award className="h-5 w-5 text-white" />
                  <span>Program Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-zinc-400">Program:</span>
                  <span className="text-sm text-white text-right">{semesterData?.program.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-zinc-400">Program Code:</span>
                  <span className="text-sm text-white">{semesterData?.program.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-zinc-400">Current Semester:</span>
                  <span className="text-sm text-white">{semesterData?.semesterNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-zinc-400">Total Courses:</span>
                  <span className="text-sm text-white">{semesterData?.courses.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {semesterData?.courses.map((course) => (
                <Card key={course.courseId} className="bg-black border-zinc-800 hover:border-zinc-600 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-white text-lg">{course.courseName}</CardTitle>
                        <CardDescription className="text-zinc-400 font-mono">
                          {course.courseCode}
                        </CardDescription>
                      </div>
                      <Badge className={getCourseTypeColor(course.courseType)}>
                        {course.courseType.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Credits:</span>
                        <span className="text-white font-medium">{course.credits}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Sections:</span>
                        <span className="text-white font-medium">{course.sections.length}</span>
                      </div>
                    </div>

                    {/* Section Info */}
                    {course.sections.map((section) => (
                      <div key={section.id} className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-zinc-400" />
                          <span className="text-sm text-white">{section.name}</span>
                        </div>
                      </div>
                    ))}

                    <Button
                      onClick={() => fetchCourseAttendance(course)}
                      disabled={isAttendanceLoading}
                      className="w-full bg-white text-black hover:bg-zinc-200 transition-colors"
                    >
                      {isAttendanceLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Eye className="h-4 w-4 mr-2" />
                      )}
                      View Attendance
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {(!semesterData?.courses || semesterData.courses.length === 0) && (
              <Card className="bg-black border-zinc-800">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <BookOpen className="h-16 w-16 text-zinc-400 mx-auto" />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">No Courses Found</h3>
                      <p className="text-zinc-400">
                        You don't have any courses enrolled for this semester.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Attendance View */
          <div className="space-y-6">
            {courseAttendance && (
              <>
                {/* Attendance Summary Card */}
                <Card className="bg-black border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <TrendingUp className="h-5 w-5 text-white" />
                      <span>Attendance Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center space-y-1">
                        <p className="text-2xl font-bold text-white">
                          {courseAttendance.summary.attendancePercentage}%
                        </p>
                        <p className="text-sm text-zinc-400">Overall</p>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-2xl font-bold text-green-400">
                          {courseAttendance.summary.attendedLectures}
                        </p>
                        <p className="text-sm text-zinc-400">Attended</p>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-2xl font-bold text-red-400">
                          {courseAttendance.summary.absentLectures}
                        </p>
                        <p className="text-sm text-zinc-400">Absent</p>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-2xl font-bold text-white">
                          {courseAttendance.summary.totalLectures}
                        </p>
                        <p className="text-sm text-zinc-400">Total</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Required Attendance:</span>
                        <span className="text-white font-medium">
                          {courseAttendance.summary.requiredAttendance}%
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-zinc-800 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              courseAttendance.summary.attendancePercentage >= courseAttendance.summary.requiredAttendance
                                ? 'bg-green-500' 
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${courseAttendance.summary.attendancePercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Course Details Card */}
                <Card className="bg-black border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <BookOpen className="h-5 w-5 text-white" />
                      <span>Course Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-zinc-400">Course Name:</span>
                      <span className="text-sm text-white text-right">{courseAttendance.course.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-zinc-400">Course Code:</span>
                      <span className="text-sm text-white">{courseAttendance.course.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-zinc-400">Credits:</span>
                      <span className="text-sm text-white">{courseAttendance.course.credits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-zinc-400">Section:</span>
                      <span className="text-sm text-white">{courseAttendance.section.name}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Lectures Table */}
                <Card className="bg-black border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Calendar className="h-5 w-5 text-white" />
                      <span>Lecture History</span>
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      Showing completed lectures only
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-zinc-800">
                            <th className="text-left p-3 text-sm font-medium text-zinc-400">Date</th>
                            <th className="text-left p-3 text-sm font-medium text-zinc-400">Time</th>
                            <th className="text-left p-3 text-sm font-medium text-zinc-400">Topic</th>
                            <th className="text-left p-3 text-sm font-medium text-zinc-400">Faculty</th>
                            <th className="text-left p-3 text-sm font-medium text-zinc-400">Classroom</th>
                            <th className="text-left p-3 text-sm font-medium text-zinc-400">Status</th>
                            <th className="text-left p-3 text-sm font-medium text-zinc-400">Marked At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courseAttendance.lectures
                            .filter(lecture => isLectureCompleted(lecture.endTime))
                            .map((lecture) => (
                            <tr key={lecture.lectureId} className="border-b border-zinc-800 hover:bg-zinc-950">
                              <td className="p-3 text-sm text-white">
                                {formatDate(lecture.date)}
                              </td>
                              <td className="p-3 text-sm text-white">
                                {formatTime(lecture.startTime)} - {formatTime(lecture.endTime)}
                              </td>
                              <td className="p-3 text-sm text-white">
                                {lecture.topic}
                              </td>
                              <td className="p-3 text-sm text-white">
                                {lecture.faculty.name}
                              </td>
                              <td className="p-3 text-sm text-white">
                                {lecture.classroom.building} {lecture.classroom.roomNumber}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center space-x-2">
                                  {getAttendanceStatusIcon(lecture.attendance.status)}
                                  <span className={`text-sm font-medium ${getAttendanceStatusColor(lecture.attendance.status)}`}>
                                    {lecture.attendance.status.charAt(0).toUpperCase() + lecture.attendance.status.slice(1)}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 text-sm text-zinc-400">
                                {lecture.attendance.markedAt ? 
                                  new Date(lecture.attendance.markedAt).toLocaleString() : 
                                  'Not marked'
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {courseAttendance.lectures.filter(lecture => isLectureCompleted(lecture.endTime)).length === 0 && (
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                          <p className="text-zinc-400">No completed lectures found</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function Courses() {
  return (
    <ProtectedRoute>
      <CoursesContent />
    </ProtectedRoute>
  );
}