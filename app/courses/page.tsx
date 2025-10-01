"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  getAuthToken,
  getUserProfile,
  getUserCourses,
  getCourseAttendance,
  getAttendanceSummary,
  UserProfile,
  SemesterData,
  CourseAttendance,
  AttendanceSummary,
  Course,
} from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
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
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MagicCard } from "@/components/ui/magic-card";

function CoursesContent() {
  const { user } = useAuth();
  const accessToken = getAuthToken();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [semesterData, setSemesterData] = useState<SemesterData | null>(null);
  const [attendanceSummary, setAttendanceSummary] =
    useState<AttendanceSummary | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseAttendance, setCourseAttendance] =
    useState<CourseAttendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [view, setView] = useState<"summary" | "attendance">("summary");
  const [courseAttendanceMap, setCourseAttendanceMap] = useState<
    Map<string, { percentage: number; loading: boolean }>
  >(new Map());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const profile = await getUserProfile();
        setUserProfile(profile);

        if (profile.enrollmentNo && profile.studentPrograms?.length > 0) {
          // Get semester number from student programs
          const semesterNumber =
            profile.studentPrograms[0].programBatch.batchNumber;

          // Fetch both attendance summary and course data
          const [summary, courses] = await Promise.all([
            getAttendanceSummary(profile.enrollmentNo, semesterNumber),
            getUserCourses(profile.enrollmentNo),
          ]);

          setAttendanceSummary(summary);
          setSemesterData(courses);
        }
      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to load data"
        );
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

  const fetchCourseAttendance = async (courseData: any) => {
    if (!userProfile?.enrollmentNo) return;

    try {
      setIsAttendanceLoading(true);
      const attendance = await getCourseAttendance(
        userProfile.enrollmentNo,
        courseData.courseId
      );
      setCourseAttendance(attendance);
      setSelectedCourse({
        courseId: courseData.courseId,
        courseCode: courseData.courseCode,
        courseName: courseData.courseName,
        credits: courseData.credits,
        courseType: "MAJOR_CORE", // Default value
        sections: [courseData.section],
      });
      setView("attendance");
    } catch (err: any) {
      console.error("Failed to fetch attendance:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load attendance data"
      );
    } finally {
      setIsAttendanceLoading(false);
    }
  };

  const fetchIndividualCourseAttendance = async (courseId: string) => {
    if (!userProfile?.enrollmentNo) return;

    try {
      // Set loading state for this course
      setCourseAttendanceMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(courseId, {
          percentage: prev.get(courseId)?.percentage || 0,
          loading: true,
        });
        return newMap;
      });

      const attendance = await getCourseAttendance(
        userProfile.enrollmentNo,
        courseId
      );

      // Get attendance percentage from summary
      const percentage = Math.round(attendance.summary.attendancePercentage);

      // Update the map with the fetched data
      setCourseAttendanceMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(courseId, { percentage, loading: false });
        return newMap;
      });
    } catch (err: any) {
      console.error(`Failed to fetch attendance for course ${courseId}:`, err);

      // Set error state for this course
      setCourseAttendanceMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(courseId, {
          percentage: prev.get(courseId)?.percentage || 0,
          loading: false,
        });
        return newMap;
      });
    }
  };

  // Fetch attendance for all courses when semester data is loaded
  useEffect(() => {
    if (semesterData?.courses && userProfile?.enrollmentNo) {
      semesterData.courses.forEach((course) => {
        fetchIndividualCourseAttendance(course.courseId);
      });
    }
  }, [semesterData, userProfile]);

  const getAttendanceStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "present":
        return "text-green-600";
      case "absent":
        return "text-red-600";
      case "awaited":
        return "text-blue-600";
      default:
        return "text-zinc-600";
    }
  };

  const getAttendanceStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "awaited":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-zinc-600" />;
    }
  };

  const getCourseTypeColor = (type: string) => {
    switch (type) {
      case "MAJOR_CORE":
        return "bg-blue-900 text-blue-300 border-blue-700";
      case "MINOR":
        return "bg-purple-900 text-purple-300 border-purple-700";
      case "ELECTIVE":
        return "bg-green-900 text-green-300 border-green-700";
      default:
        return "bg-zinc-900 text-zinc-300 border-zinc-700";
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isLectureCompleted = (endTime: string) => {
    return new Date(endTime) < new Date();
  };

  const AttendanceProgressBar = ({
    percentage,
    showMarker = true,
    markerAt = 75,
    height = "h-3",
  }: {
    percentage: number;
    showMarker?: boolean;
    markerAt?: number;
    height?: string;
  }) => {
    const getProgressColor = (perc: number) => {
      if (perc >= 85) return "bg-green-500";
      if (perc >= 75) return "bg-yellow-500";
      return "bg-red-500";
    };

    return (
      <div className="relative w-full">
        <div
          className={`w-full ${height} bg-[#ffffff] border border-gray-400 rounded-full overflow-hidden`}
        >
          <div
            className={`${height} ${getProgressColor(
              percentage
            )} transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        {showMarker && (
          <div
            className="absolute top-0 w-0.5 bg-black rounded-full shadow-lg"
            style={{
              left: `${markerAt}%`,
              height: "100%",
              transform: "translateX(-50%)",
            }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-white font-medium bg-zinc-600 px-1 py-0.5 rounded">
              {markerAt}%
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-black mx-auto" />
            <p className="text-zinc-600">Loading your courses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-white p-6">
          <div className="max-w-md mx-auto mt-10">
            <MagicCard className="p-2 rounded-2xl border border-gray-200">
              <Card className="bg-white border-red-500 border-1">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <AlertCircle className="h-16 w-16 text-red-400 mx-auto" />
                    <div>
                      <h2 className="text-xl font-bold text-black mb-2">
                        Error Loading Courses
                      </h2>
                      <p className="text-red-400">{error}</p>
                    </div>
                    {view === "attendance" && (
                      <Button
                        onClick={() => {
                          setView("summary");
                          setError("");
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
            </MagicCard>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white p-6 space-y-6">
        {/* Page Header */}
        <div className="mb-2">
          {view === "summary" ? (
            <>
              <h1 className="text-3xl font-bold text-black mb-2">
                My Courses & Attendance
              </h1>
              <p className="text-black/60">
                Track your attendance progress and view all enrolled courses
                this semester
              </p>
            </>
          ) : (
            <div className="space-y-0">
              <Button
                onClick={() => setView("summary")}
                // variant="ghost"
                className="text-black p-1 h-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Summary
              </Button>
              <h1 className="text-3xl font-bold text-white">
                Attendance Details
              </h1>
              <p className="text-zinc-600">
                {selectedCourse?.courseName} ({selectedCourse?.courseCode})
              </p>
            </div>
          )}
        </div>

        {view === "summary" ? (
          /* Attendance Summary View */
          <div className="space-y-6">
            {/* Overall Attendance Card */}
            {attendanceSummary && (
              <MagicCard className="p-1 rounded-2xl border-gray-200 border">
                <Card className="bg-[#f0f0f0]">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-black">
                      <TrendingUp className="h-5 w-5 text-black" />
                      <span>Overall Attendance Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center space-y-2">
                        <div className="text-2xl font-bold text-black">
                          {attendanceSummary.overall.totalLectures}
                        </div>
                        <div className="text-sm text-zinc-400">
                          Total Lectures
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="text-2xl font-bold text-green-600">
                          {attendanceSummary.overall.attendedLectures}
                        </div>
                        <div className="text-sm text-zinc-400">Attended</div>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="text-2xl font-bold text-red-600">
                          {attendanceSummary.overall.absentLectures}
                        </div>
                        <div className="text-sm text-zinc-400">Absent</div>
                      </div>
                      <div className="text-center space-y-2">
                        <div
                          className={`text-2xl font-bold ${
                            attendanceSummary.overall.attendancePercentage >= 75
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {attendanceSummary.overall.attendancePercentage}%
                        </div>
                        <div className="text-sm text-black">Attendance</div>
                      </div>
                    </div>

                    {/* Overall Progress Bar */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-zinc-400">
                          Overall Progress
                        </span>
                        <span className="text-sm text-black">100%</span>
                      </div>
                      <AttendanceProgressBar
                        percentage={
                          attendanceSummary.overall.attendancePercentage
                        }
                        height="h-4"
                      />
                    </div>
                  </CardContent>
                </Card>
              </MagicCard>
            )}

            {/* Course-wise Attendance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {attendanceSummary?.byCourse.map((course) => (
                <MagicCard
                  className="p-2 rounded-2xl border-gray-200 border"
                  key={course.courseId}
                >
                  <Card
                    className="bg-black border-zinc-800 transition-all hover:border-zinc-600 cursor-pointer group"
                    onClick={() => fetchCourseAttendance(course)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-white text-lg group-hover:text-blue-400 transition-colors">
                            {course.courseName}
                          </CardTitle>
                          <CardDescription className="text-zinc-400 font-mono">
                            {course.courseCode}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-blue-900 text-blue-300 border-blue-700">
                            {course.credits} Credits
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                          <div className="text-lg font-semibold text-white">
                            {course.totalLectures}
                          </div>
                          <div className="text-xs text-zinc-400">Total</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-lg font-semibold text-green-600">
                            {course.attendedLectures}
                          </div>
                          <div className="text-xs text-zinc-400">Present</div>
                        </div>
                        <div className="space-y-1">
                          <div
                            className={`text-lg font-semibold ${
                              course.attendancePercentage >= 75
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {course.attendancePercentage}%
                          </div>
                          <div className="text-xs text-zinc-400">
                            Attendance
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-zinc-400">
                            Progress
                          </span>
                          <span className="text-xs text-zinc-300">
                            {course.attendedLectures}/{course.totalLectures}
                          </span>
                        </div>
                        <AttendanceProgressBar
                          percentage={course.attendancePercentage}
                        />
                      </div>

                      {/* Section Info */}
                      <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-zinc-400" />
                          <span className="text-sm text-white">
                            {course.section.name}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex justify-between items-center">
                        <Badge
                          className={`${
                            course.attendancePercentage >= 85
                              ? "bg-green-900 text-green-300 border-green-700"
                              : course.attendancePercentage >= 75
                              ? "bg-yellow-900 text-yellow-300 border-yellow-700"
                              : "bg-red-900 text-red-300 border-red-700"
                          }`}
                        >
                          {course.attendancePercentage >= 75
                            ? "On Track"
                            : "At Risk"}
                        </Badge>
                        <button className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </MagicCard>
              ))}
            </div>

            {/* Show message only if we have no attendance data AND no courses */}
            {(!attendanceSummary?.byCourse ||
              attendanceSummary.byCourse.length === 0) &&
              (!semesterData?.courses || semesterData.courses.length === 0) && (
                <MagicCard className="p-1 rounded-2xl border-gray-200 border">
                  <Card className="bg-black border-zinc-800">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <BookOpen className="h-16 w-16 text-zinc-400 mx-auto" />
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">
                            No Course Data
                          </h3>
                          <p className="text-zinc-400">
                            No course or attendance information is available for
                            this semester yet.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </MagicCard>
              )}

            {/* All Courses Section */}
            {semesterData?.courses && semesterData.courses.length > 0 && (
              <>
                <div className="pt-0">
                  <h2 className="text-2xl font-bold text-black mb-4">
                    All Enrolled Courses
                  </h2>
                  <p className="text-zinc-400 mb-6">
                    Complete list of your courses for{" "}
                    {semesterData?.program.name} - Semester{" "}
                    {semesterData?.semesterNumber}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {semesterData.courses.map((course) => {
                    // Find attendance data for this course
                    const courseAttendanceData =
                      attendanceSummary?.byCourse.find(
                        (attData) => attData.courseId === course.courseId
                      );

                    return (
                      <MagicCard
                        className="p-1 rounded-2xl border border-gray-200"
                        key={course.courseId}
                      >
                        <Card
                          className={`bg-[#f0f0f0] cursor-pointer group shadow-none ${
                            courseAttendanceMap.get(course.courseId)?.loading
                              ? "animate-pulse"
                              : ""
                          }`}
                          onClick={() =>
                            fetchCourseAttendance(
                              courseAttendanceData || course
                            )
                          }
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-black text-lg transition-colors">
                                    {course.courseName}
                                  </CardTitle>
                                  {/* {!courseAttendanceMap.get(course.courseId)?.loading && courseAttendanceMap.get(course.courseId)?.percentage !== undefined && (
                                    <div className="flex items-center">
                                      {(courseAttendanceMap.get(course.courseId)?.percentage || 0) >= 75 ? (
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                      ) : (courseAttendanceMap.get(course.courseId)?.percentage || 0) >= 65 ? (
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                      ) : (
                                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                      )}
                                    </div>
                                  )} */}
                                </div>
                                <CardDescription className="text-zinc-500 font-mono">
                                  {course.courseCode}
                                </CardDescription>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                {/* <Badge
                                  className={getCourseTypeColor(
                                    course.courseType
                                  )}
                                >
                                  {course.courseType.replace("_", " ")}
                                </Badge> */}
                                {/* {!courseAttendanceMap.get(course.courseId)?.loading && courseAttendanceMap.get(course.courseId)?.percentage !== undefined && (
                                  <Badge 
                                    className={`text-xs ${
                                      (courseAttendanceMap.get(course.courseId)?.percentage || 0) >= 75
                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                        : (courseAttendanceMap.get(course.courseId)?.percentage || 0) >= 65
                                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                        : "bg-red-500/20 text-red-400 border-red-500/30"
                                    }`}
                                  >
                                    {courseAttendanceMap.get(course.courseId)?.percentage}%
                                  </Badge>
                                )} */}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-600">Credits:</span>
                                <span className="text-black font-medium">
                                  {course.credits}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-600">
                                  Attendance:
                                </span>
                                {courseAttendanceMap.get(course.courseId)
                                  ?.loading ? (
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
                                    <span className="text-blue-400 text-xs">
                                      Loading...
                                    </span>
                                  </div>
                                ) : (
                                  <span
                                    className={`font-medium ${
                                      (courseAttendanceMap.get(course.courseId)
                                        ?.percentage || 0) >= 75
                                        ? "text-green-600"
                                        : (courseAttendanceMap.get(
                                            course.courseId
                                          )?.percentage || 0) >= 65
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {courseAttendanceMap.get(course.courseId)
                                      ?.percentage || 0}
                                    %
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Attendance Progress Bar */}
                            {!courseAttendanceMap.get(course.courseId)
                              ?.loading &&
                              courseAttendanceMap.get(course.courseId)
                                ?.percentage !== undefined && (
                                <div className="space-y-2 pt-2 border-t border-zinc-300">
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-600">
                                      Progress:
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {(courseAttendanceMap.get(course.courseId)
                                        ?.percentage || 0) >= 75 ? (
                                        <CheckCircle className="h-4 w-4 text-green-400" />
                                      ) : (courseAttendanceMap.get(
                                          course.courseId
                                        )?.percentage || 0) >= 65 ? (
                                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-red-400" />
                                      )}
                                      {/* <span className="text-xs text-zinc-600">
                                      {(courseAttendanceMap.get(course.courseId)?.percentage || 0) >= 75 ? 'Good' : 
                                       (courseAttendanceMap.get(course.courseId)?.percentage || 0) >= 65 ? 'Warning' : 'Critical'}
                                    </span> */}
                                    </div>
                                  </div>
                                  <AttendanceProgressBar
                                    percentage={
                                      courseAttendanceMap.get(course.courseId)
                                        ?.percentage || 0
                                    }
                                    height="h-2"
                                  />
                                </div>
                              )}

                            {/* Course Sections Info */}
                            <div className="bg-white p-3 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Users className="h-4 w-4 text-zinc-800" />
                                  <span className="text-sm text-zinc-800">
                                    Sections:
                                  </span>
                                </div>
                                <span className="text-sm text-black font-medium">
                                  {course.sections.length}
                                </span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {course.sections.map((section, index) => (
                                  <Badge
                                    key={section.id}
                                    variant="outline"
                                    className="text-xs text-black bg-[#f0f0f0]"
                                  >
                                    {section.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* <Button
                              onClick={() =>
                                fetchCourseAttendance(
                                  courseAttendanceData || course
                                )
                              }
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
                            </Button> */}
                          </CardContent>
                        </Card>
                      </MagicCard>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Attendance View */
          <div className="space-y-6">
            {courseAttendance && (
              <>
                {/* Attendance Summary Card */}
                <MagicCard className="p-1 rounded-2xl border-gray-200 border">
                  <Card className="bg-[#f0f0f0]">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-black">
                        <TrendingUp className="h-5 w-5 text-black" />
                        <span>Attendance Summary</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center space-y-1">
                          <p className="text-2xl font-bold text-black">
                            {courseAttendance.summary.attendancePercentage}%
                          </p>
                          <p className="text-sm text-zinc-600">Overall</p>
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-2xl font-bold text-green-400">
                            {courseAttendance.summary.attendedLectures}
                          </p>
                          <p className="text-sm text-zinc-600">Attended</p>
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-2xl font-bold text-red-400">
                            {courseAttendance.summary.absentLectures}
                          </p>
                          <p className="text-sm text-zinc-600">Absent</p>
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-2xl font-bold text-black">
                            {courseAttendance.summary.totalLectures}
                          </p>
                          <p className="text-sm text-zinc-600">Total</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-zinc-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-zinc-600">
                            Attendance Progress:
                          </span>
                          <span className="text-white font-medium">
                            {courseAttendance.summary.attendancePercentage}%
                          </span>
                        </div>
                        <AttendanceProgressBar
                          percentage={
                            courseAttendance.summary.attendancePercentage
                          }
                          height="h-4"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </MagicCard>

                {/* Course Details Card */}
                {/* <MagicCard className="p-1 rounded-2xl border-gray-200 border">
                <Card className="bg-black border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <BookOpen className="h-5 w-5 text-white" />
                      <span>Course Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-zinc-600">Course Name:</span>
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
                </MagicCard> */}

                {/* Lectures Table */}
                <MagicCard className="p-1 rounded-3xl border-gray-200 border">
                  <Card className="bg-[#f0f0f0] rounded-3xl">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-black">
                        <Calendar className="h-5 w-5 text-black" />
                        <span>Lecture History</span>
                      </CardTitle>
                      <CardDescription className="text-zinc-600">
                        Showing completed lectures in reverse chronological
                        order (most recent first)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto rounded-xl">
                        <table className="w-full rounded-2xl">
                          <thead>
                            <tr className="border-b border-zinc-300 bg-[#f8f8f8] rounded-3xl">
                              <th className="text-left p-3 text-sm font-medium text-zinc-700">
                                Date
                              </th>
                              {/* <th className="text-left p-3 text-sm font-medium text-zinc-400">Time</th>
                            <th className="text-left p-3 text-sm font-medium text-zinc-400">Topic</th> */}
                              {/* <th className="text-left p-3 text-sm font-medium text-zinc-400">Faculty</th> */}
                              {/* <th className="text-left p-3 text-sm font-medium text-zinc-400">Classroom</th> */}
                              <th className="text-left p-3 text-sm font-medium text-zinc-700">
                                Status
                              </th>
                              <th className="text-left p-3 text-sm font-medium text-zinc-700">
                                Marked At
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {courseAttendance.lectures
                              .filter((lecture) =>
                                isLectureCompleted(lecture.endTime)
                              ) // ✅ only completed
                              .sort((a, b) => {
                                const dateA = new Date(
                                  a.date + " " + a.startTime
                                );
                                const dateB = new Date(
                                  b.date + " " + b.startTime
                                );
                                return dateA.getTime() - dateB.getTime(); // ✅ oldest → newest
                              })
                              .map((lecture) => (
                                <tr
                                  key={lecture.lectureId}
                                  className="border-b border-gray-300"
                                >
                                  <td className="p-3 text-sm text-black">
                                    {formatDate(lecture.date)}
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center space-x-2">
                                      {getAttendanceStatusIcon(
                                        lecture.attendance.status
                                      )}
                                      <span
                                        className={`text-sm font-medium ${getAttendanceStatusColor(
                                          lecture.attendance.status
                                        )}`}
                                      >
                                        {lecture.attendance.status
                                          .charAt(0)
                                          .toUpperCase() +
                                          lecture.attendance.status.slice(1)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-3 text-sm text-zinc-500">
                                    {lecture.attendance.markedAt
                                      ? new Date(
                                          lecture.attendance.markedAt
                                        ).toLocaleString()
                                      : "Not marked"}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>

                        {courseAttendance.lectures.length === 0 && (
                          <div className="text-center py-8">
                            <Clock className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                            <p className="text-zinc-400">
                              No lectures scheduled for this course
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </MagicCard>
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
