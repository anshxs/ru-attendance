"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Calendar, Clock, User, BookOpen, TrendingUp } from "lucide-react"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"

interface AttendanceData {
  course: {
    id: string
    name: string
    code: string
    credits: number
  }
  section: {
    id: string
    name: string
  }
  summary: {
    totalLectures: number
    attendedLectures: number
    attendancePercentage: number
    requiredAttendance: number
  }
  lectures: Array<{
    lectureId: string
    topic: string
    date: string
    startTime: string
    endTime: string
    faculty: {
      id: string
      name: string
    }
    attendance: {
      status: string
      markedAt: string | null
      concern: string | null
    }
  }>
}

const COURSES = [
  {
    id: "399b4f79-41c2-4de6-9e8a-d9e42b395857",
    name: "Understanding India",
    code: "UI",
  },
  {
    id: "0a153c7b-d828-4867-98d0-64b750b5cb29",
    name: "Self and Society",
    code: "SAS",
  },
  {
    id: "01e93bff-ce41-4d71-a74d-12c3def031d8",
    name: "Global Grand Challenges",
    code: "GGC",
  },
  {
    id: "1691623b-2ab2-45ad-8b79-5ecd18934212",
    name: "Social Communication",
    code: "SC",
  },
]

export default function AttendanceTracker() {
  const [bearerToken, setBearerToken] = useState("")
  const [selectedCourse, setSelectedCourse] = useState(COURSES[0].id)
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchAttendanceData = async () => {
    if (!bearerToken.trim()) {
      setError("Please enter a bearer token")
      return
    }

    if (!selectedCourse) {
      setError("Please select a course")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(
        `https://rishiverse-api.rishihood.edu.in/api/v1/students/self/courses/${selectedCourse}/attendance`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            Accept: "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setAttendanceData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch attendance data")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-900 text-green-100 hover:bg-green-800">Present</Badge>
      case "absent":
        return <Badge className="bg-red-900 text-red-100 hover:bg-red-800">Absent</Badge>
      case "awaited":
        return <Badge className="bg-yellow-900 text-yellow-100 hover:bg-yellow-800">Awaited</Badge>
      case "not_marked":
        return <Badge className="bg-gray-700 text-gray-300 hover:bg-gray-600">Not Marked</Badge>
      default:
        return <Badge className="bg-gray-700 text-gray-300 hover:bg-gray-600">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen max-w-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mt-20 space-y-4">
          <h1 className="text-4xl font-bold text-balance">Attendance Tracker by <AnimatedGradientText>Ansh Sharma</AnimatedGradientText></h1>
          <p className="text-muted-foreground text-lg">
            Select a course and enter your bearer token to view attendance data
          </p>
        </div>

        {/* Token Input */}
        <Card style={{ backgroundColor: "rgb(30,30,30)" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Authentication & Course Selection
            </CardTitle>
            <CardDescription>Select your course and enter your bearer token to fetch attendance data</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-2 space-y-4">
            {/* Course Selection Dropdown */}
            <div className="space-y-2">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="bg-black text-white">
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: "rgb(30,30,30)" }}>
                  {COURSES.map((course) => (
                    <SelectItem
                      key={course.id}
                      value={course.id}
                      className="text-white hover:bg-gray-800 focus:bg-gray-800"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{course.name}</span>
                        {/* <span className="text-xs text-gray-400">{course.code}</span> */}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 w-full">
              <Input
                type="password"
                placeholder="Enter bearer token..."
                value={bearerToken}
                onChange={(e) => setBearerToken(e.target.value)}
                className="flex-1 bg-black text-white placeholder:text-gray-500"
              />
              <Button
                onClick={fetchAttendanceData}
                disabled={loading}
                className="bg-white text-black hover:bg-gray-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Fetch Data"
                )}
              </Button>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </CardContent>
        </Card>

        {/* Attendance Data */}
        {attendanceData && (
          <div className="space-y-6">
            {/* Course Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card style={{ backgroundColor: "rgb(30,30,30)" }}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Course</p>
                      <p className="font-semibold">{attendanceData.course.name}</p>
                      <p className="text-xs text-muted-foreground">{attendanceData.course.code}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: "rgb(30,30,30)" }}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Attendance</p>
                      <p className="font-semibold text-2xl">{attendanceData.summary.attendancePercentage}%</p>
                      <p className="text-xs text-muted-foreground">
                        {attendanceData.summary.attendedLectures}/{attendanceData.summary.totalLectures} lectures
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

                <Card className="border-gray-800" style={{ backgroundColor: "rgb(30,30,30)" }}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Lectures</p>
                      <p className="font-semibold text-2xl">{attendanceData.summary.totalLectures}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: "rgb(30,30,30)" }}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-orange-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Section</p>
                      <p className="font-semibold">{attendanceData.section.name}</p>
                      <p className="text-xs text-muted-foreground">{attendanceData.course.credits} credits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lectures Table */}
            <Card style={{ backgroundColor: "rgb(30,30,30)" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Lecture Details
                </CardTitle>
                <CardDescription>Detailed attendance record for all lectures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800 hover:bg-gray-800/50">
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">Time</TableHead>
                        <TableHead className="text-gray-300">Topic</TableHead>
                        <TableHead className="text-gray-300">Faculty</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Marked At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attendanceData.lectures.slice().reverse().map((lecture) => (
                        <TableRow key={lecture.lectureId} className="border-gray-800 hover:bg-gray-800/30">
                          <TableCell className="font-medium">{formatDate(lecture.date)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(lecture.startTime)} - {formatTime(lecture.endTime)}
                            </div>
                          </TableCell>
                          <TableCell>{lecture.topic}</TableCell>
                          <TableCell className="text-muted-foreground">{lecture.faculty.name}</TableCell>
                          <TableCell>{getStatusBadge(lecture.attendance.status)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {lecture.attendance.markedAt ? formatDate(lecture.attendance.markedAt) : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
