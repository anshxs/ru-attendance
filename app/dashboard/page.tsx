"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getAuthToken, getUserProfile, UserProfile } from "@/lib/auth";
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
  Users,
  Key,
  GraduationCap,
  Mail,
  Phone,
  Home,
  Loader2,
  AlertCircle,
  Download,
  FileText,
  Image,
  File,
  Crown,
  Sparkles,
} from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { usePremium } from "@/lib/premium-context";
import { Badge } from "@/components/ui/badge";
import { div } from "motion/react-client";

function DashboardContent() {
  const {
    user,
    userProfile,
    isLoading: authLoading,
    refreshUserProfile,
  } = useAuth();
  const { isPremium } = usePremium();
  const accessToken = getAuthToken();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Use profile data from auth context instead of fetching separately
  useEffect(() => {
    if (!authLoading && accessToken && !userProfile && user) {
      // If user is authenticated but profile is missing, refresh it from the context
      const fetchProfile = async () => {
        try {
          setIsLoading(true);
          await refreshUserProfile();
        } catch (err: any) {
          console.error("Failed to refresh profile:", err);
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load profile data"
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchProfile();
    }
  }, [accessToken, userProfile, authLoading, user, refreshUserProfile]);

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-black text-lg">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-black text-xl font-semibold mb-2">
              Error Loading Profile
            </h2>
            <p className="text-black/70 mb-4">{error}</p>
            <div className="space-x-2">
              <button
                onClick={async () => {
                  setError("");
                  try {
                    await refreshUserProfile();
                  } catch (err: any) {
                    setError(err.message || "Failed to reload profile");
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-black rounded-lg hover:bg-gray-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!userProfile && !authLoading && !isLoading && user) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-black text-xl font-semibold mb-2">
              Profile Not Found
            </h2>
            <p className="text-black/70 mb-4">
              Your profile data could not be loaded. This might be a temporary
              issue.
            </p>
            <p className="text-black/50 mb-4 text-sm">
              Logged in as: {user?.email}
            </p>
            <button
              onClick={async () => {
                try {
                  setIsLoading(true);
                  await refreshUserProfile();
                } catch (err: any) {
                  setError(err.message || "Failed to load profile");
                } finally {
                  setIsLoading(false);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700"
            >
              Load Profile
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white p-6 space-y-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">
                User Profile
              </h1>
              <p className="text-black/50">
                Welcome back, {userProfile?.firstName || user?.email || "User"}!
                Here's your complete profile information.
              </p>
            </div>
            {isPremium && (
              <div className="sm:ml-4">
                <Badge className="bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold px-3 py-1 text-sm">
                  <Crown className="h-4 w-4 mr-2" />
                  Premium User
                  <Sparkles className="h-4 w-4 ml-2" />
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Personal Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Basic Personal Info */}
          <MagicCard className="p-1 rounded-2xl border-gray-200 border">
            <Card className="bg-[#F9F9F9] shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-black">
                  <Users className="h-5 w-5 text-black" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Full Name:
                  </span>
                  <span className="text-sm text-black text-right">
                    {userProfile?.fullName || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    First Name:
                  </span>
                  <span className="text-sm text-black">
                    {userProfile?.firstName || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Last Name:
                  </span>
                  <span className="text-sm text-black">
                    {userProfile?.lastName || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Gender:
                  </span>
                  <span className="text-sm text-black">
                    {userProfile?.gender || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Blood Group:
                  </span>
                  <span className="text-sm text-black">
                    {userProfile?.bloodGroup?.replace("_", " ") || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Religion:
                  </span>
                  <span className="text-sm text-black">
                    {userProfile?.religion || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Social Category:
                  </span>
                  <span className="text-sm text-black">
                    {userProfile?.socialCategory || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Status:
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      userProfile?.status === "ENROLLED"
                        ? "bg-green-950 text-green-300 border border-green-800"
                        : "bg-yellow-950 text-yellow-400 border border-yellow-800"
                    }`}
                  >
                    {userProfile?.status || "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </MagicCard>

          {/* Contact Information */}
          <MagicCard className="p-1 rounded-2xl border-gray-200 border">
            <Card className="bg-[#F9F9F9] shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-black">
                  <Mail className="h-5 w-5 text-black" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    RU Email:
                  </span>
                  <span className="text-xs text-black break-all">
                    {userProfile?.ruEmailId || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Personal Email:
                  </span>
                  <span className="text-xs text-black break-all">
                    {userProfile?.emailId || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Alternate Email:
                  </span>
                  <span className="text-xs text-black break-all">
                    {userProfile?.alternateEmailId || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Mobile:
                  </span>
                  <span className="text-sm text-black">
                    {userProfile?.mobileNumber || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Alternate Mobile:
                  </span>
                  <span className="text-sm text-black">
                    {userProfile?.alternateContactNumber || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    GitHub:
                  </span>
                  <span className="text-xs text-blue-400 break-all">
                    {userProfile?.githubLink || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    LinkedIn:
                  </span>
                  <span className="text-xs text-black">
                    {userProfile?.linkedinLink || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Website:
                  </span>
                  <span className="text-xs text-black">
                    {userProfile?.personalWebsite || "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </MagicCard>

          {/* Academic Information */}
          <MagicCard className="p-1 rounded-2xl border-gray-200 border">
            <Card className="bg-[#F9F9F9] shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-black">
                  <GraduationCap className="h-5 w-5 text-black" />
                  <span>Academic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Enrollment No:
                  </span>
                  <span className="text-sm text-black">
                    {userProfile?.enrollmentNo || "N/A"}
                  </span>
                </div>
                {userProfile?.studentPrograms?.[0] && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Program:
                      </span>
                      <span className="text-xs text-black text-right">
                        {
                          userProfile.studentPrograms[0].programBatch.program
                            .name
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Batch:
                      </span>
                      <span className="text-sm text-black">
                        {
                          userProfile.studentPrograms[0].programBatch
                            .batchNumber
                        }
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    ABC ID:
                  </span>
                  <span className="text-sm text-black">
                    {userProfile?.abcId || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    MacBook ID:
                  </span>
                  <span className="text-sm text-black">
                    {userProfile?.macbookId || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    NOC Status:
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      userProfile?.nocStatus
                        ? "bg-green-900 text-green-400 border border-green-800"
                        : "bg-red-900 text-red-400 border border-red-800"
                    }`}
                  >
                    {userProfile?.nocStatus ? "Yes" : "No"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </MagicCard>

          {/* Family Information */}
          <MagicCard className="p-1 rounded-2xl border-gray-200 border">
            <Card className="bg-[#F9F9F9] shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-black">
                  <Home className="h-5 w-5 text-black" />
                  <span>Family Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-black">
                    Father Details
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Name:
                    </span>
                    <span className="text-sm text-black">
                      {userProfile?.fatherName || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Mobile:
                    </span>
                    <span className="text-sm text-black">
                      {userProfile?.fatherMobile || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Email:
                    </span>
                    <span className="text-xs text-black break-all">
                      {userProfile?.fatherEmail || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Occupation:
                    </span>
                    <span className="text-sm text-black">
                      {userProfile?.fatherOccupation || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-300">
                  <h4 className="text-sm font-semibold text-black">
                    Mother Details
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Name:
                    </span>
                    <span className="text-sm text-black">
                      {userProfile?.motherName || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Mobile:
                    </span>
                    <span className="text-sm text-black">
                      {userProfile?.motherMobile || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Email:
                    </span>
                    <span className="text-xs text-black break-all">
                      {userProfile?.motherEmail || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Occupation:
                    </span>
                    <span className="text-sm text-black">
                      {userProfile?.motherOccupation || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between pt-3 border-t border-gray-300">
                  <span className="text-sm font-medium text-gray-600">
                    Annual Income:
                  </span>
                  <span className="text-xs text-black text-right">
                    {userProfile?.annualIncome || "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </MagicCard>

          {/* Accommodation */}
          <MagicCard className="p-1 rounded-2xl border-gray-200 border">
            <div className="flex flex-col gap-5">
              <Card className="bg-[#F9F9F9] shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-black">
                    <Home className="h-5 w-5 text-black" />
                    <span>Accommodation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Hostel No:
                    </span>
                    <span className="text-sm text-black">
                      {userProfile?.hostelNo || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Room No:
                    </span>
                    <span className="text-sm text-black">
                      {userProfile?.roomNo || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Haryana Domestic:
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        userProfile?.haryanaDomestic
                          ? "bg-green-900 text-green-400 border border-green-800"
                          : "bg-red-900 text-red-400 border border-red-800"
                      }`}
                    >
                      {userProfile?.haryanaDomestic ? "Yes" : "No"}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#F9F9F9] shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-black">
                    <Key className="h-5 w-5 text-black" />
                    <span>Documents & IDs</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Aadhaar:
                    </span>
                    <span className="text-sm text-black">
                      {userProfile?.aadhaarNumber || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      PAN Card:
                    </span>
                    <span className="text-sm text-black">
                      {userProfile?.pancardNumber || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Application No:
                    </span>
                    <span className="text-sm text-black">
                      {userProfile?.applicationNumber || "N/A"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </MagicCard>

          {/* Documents & IDs */}
          {/* <MagicCard className="p-1 rounded-2xl border-gray-200 border">
          
          </MagicCard> */}

          {userProfile?.educationHistory &&
          userProfile.educationHistory.length > 0 && (
            <MagicCard className="p-1 rounded-2xl border-gray-200 border">
              <Card className="bg-[#F9F9F9] shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-black">
                    <GraduationCap className="h-5 w-5 text-black" />
                    <span>Education History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {userProfile.educationHistory.map(
                      (edu: any, index: number) => (
                        <div
                          key={index}
                          className="bg-white border rounded-2xl p-3"
                        >
                          <h4 className="text-black font-semibold mb-2">
                            {edu.type.replace("_", " ")}
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Institute:
                              </span>
                              <span className="text-xs text-black text-right">
                                {edu.instituteName}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Board:
                              </span>
                              <span className="text-xs text-black text-right">
                                {edu.boardUniversity}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Year:
                              </span>
                              <span className="text-sm text-black">
                                {edu.yearOfPassing}
                              </span>
                            </div>
                            {edu.stream && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Stream:
                                </span>
                                <span className="text-sm text-black">
                                  {edu.stream}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Location:
                              </span>
                              <span className="text-xs text-black">
                                {edu.city}, {edu.state}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </MagicCard>
          )}
        </div>

        {/* Education History */}
        

        {/* Financial Information */}
        {/* <MagicCard className="p-1 rounded-2xl border-gray-200 border">
        <Card className="bg-[#F9F9F9] shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-black">
              <Phone className="h-5 w-5 text-black" />
              <span>Financial Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Amount Paid:</span>
                <span className="text-sm text-black">₹{userProfile?.amountPaid?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Due Amount:</span>
                <span className="text-sm text-black">₹{userProfile?.dueAmount?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Updated:</span>
                <span className="text-sm text-black">{userProfile?.updatedAt ? new Date(userProfile.updatedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        </MagicCard> */}

        {/* Documents & Downloads */}
        <MagicCard className="p-1 rounded-2xl border-gray-200 border">
          <Card className="bg-[#F9F9F9] shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-black">
                <FileText className="h-5 w-5 text-black" />
                <span>Documents & Downloads</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Download your uploaded documents and certificates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Academic Documents */}
                <div className="space-y-3">
                  <h4 className="text-black font-semibold text-sm border-b border-gray-200 pb-2">
                    Academic Documents
                  </h4>

                  {userProfile?.tenthMarksheet && (
                    <div className="flex items-center justify-between bg-[#f0f0f0] p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Image className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-black">
                          10th Marksheet
                        </span>
                      </div>
                      <a
                        href={userProfile.tenthMarksheet}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}

                  {userProfile?.twelfthMarksheet && (
                    <div className="flex items-center justify-between bg-[#f0f0f0] p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Image className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-black">
                          12th Marksheet
                        </span>
                      </div>
                      <a
                        href={userProfile.twelfthMarksheet}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}

                  {userProfile?.bachelorsMarksheet && (
                    <div className="flex items-center justify-between bg-[#f0f0f0] p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <File className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-black">
                          Bachelor's Marksheet
                        </span>
                      </div>
                      <a
                        href={userProfile.bachelorsMarksheet}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}

                  {userProfile?.admissionLetter && (
                    <div className="flex items-center justify-between bg-[#f0f0f0] p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-black">
                          Admission Letter
                        </span>
                      </div>
                      <a
                        href={userProfile.admissionLetter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Identity Documents */}
                <div className="space-y-3">
                  <h4 className="text-black font-semibold text-sm border-b border-gray-200 pb-2">
                    Identity Documents
                  </h4>

                  {userProfile?.studentAadharImg && (
                    <div className="flex items-center justify-between bg-[#f0f0f0] p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Image className="h-4 w-4 text-orange-400" />
                        <span className="text-sm text-black">
                          Student Aadhaar
                        </span>
                      </div>
                      <a
                        href={userProfile.studentAadharImg}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}

                  {userProfile?.parentAadharImg && (
                    <div className="flex items-center justify-between bg-[#f0f0f0] p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Image className="h-4 w-4 text-orange-400" />
                        <span className="text-sm text-black">
                          Parent Aadhaar
                        </span>
                      </div>
                      <a
                        href={userProfile.parentAadharImg}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}

                  {userProfile?.studentPanImg && (
                    <div className="flex items-center justify-between bg-[#f0f0f0] p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Image className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-black">Student PAN</span>
                      </div>
                      <a
                        href={userProfile.studentPanImg}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}

                  {userProfile?.parentPanImg && (
                    <div className="flex items-center justify-between bg-[#f0f0f0] p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Image className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-black">Parent PAN</span>
                      </div>
                      <a
                        href={userProfile.parentPanImg}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Certificates */}
                <div className="space-y-3">
                  <h4 className="text-black font-semibold text-sm border-b border-gray-200 pb-2">
                    Certificates
                  </h4>

                  {userProfile?.migrationCertificate && (
                    <div className="flex items-center justify-between bg-[#f0f0f0] p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-black">
                          Migration Certificate
                        </span>
                      </div>
                      <a
                        href={userProfile.migrationCertificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}

                  {userProfile?.characterCertificate && (
                    <div className="flex items-center justify-between bg-[#f0f0f0] p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-black">
                          Character Certificate
                        </span>
                      </div>
                      <a
                        href={userProfile.characterCertificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}

                  {userProfile?.medicalCertificate && (
                    <div className="flex items-center justify-between bg-[#f0f0f0] p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-red-400" />
                        <span className="text-sm text-black">
                          Medical Certificate
                        </span>
                      </div>
                      <a
                        href={userProfile.medicalCertificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}

                  {userProfile?.antiRaggingCertificate && (
                    <div className="flex items-center justify-between bg-[#f0f0f0] p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-pink-400" />
                        <span className="text-sm text-black">
                          Anti-Ragging Certificate
                        </span>
                      </div>
                      <a
                        href={userProfile.antiRaggingCertificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}

                  {userProfile?.incomeCertificate && (
                    <div className="flex items-center justify-between bg-[#f0f0f0] p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-black">
                          Income Certificate
                        </span>
                      </div>
                      <a
                        href={userProfile.incomeCertificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Undertakings & Bonds
              <div className="space-y-3">
                <h4 className="text-black font-semibold text-sm border-b border-gray-200 pb-2">Undertakings & Bonds</h4>
                
                {userProfile?.academicUndertaking && (
                  <div className="flex items-center justify-between bg-[#f0f0f0] p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-black">Academic Undertaking</span>
                    </div>
                    <a
                      href={userProfile.academicUndertaking}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-white hover:bg-zinc-200 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </div>
                )}

                {userProfile?.assetPolicyUndertaking && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-black">Asset Policy Undertaking</span>
                    </div>
                    <a
                      href={userProfile.assetPolicyUndertaking}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-white hover:bg-zinc-200 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </div>
                )}

                {userProfile?.noToleranceCertificate && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-black">No Tolerance Certificate</span>
                    </div>
                    <a
                      href={userProfile.noToleranceCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-white hover:bg-zinc-200 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </div>
                )}

                {userProfile?.indemnityBond && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-black">Indemnity Bond</span>
                    </div>
                    <a
                      href={userProfile.indemnityBond}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-white hover:bg-zinc-200 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </div>
                )}

                {userProfile?.shortLeaveAuthorisation && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-orange-400" />
                      <span className="text-sm text-black">Short Leave Authorization</span>
                    </div>
                    <a
                      href={userProfile.shortLeaveAuthorisation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-white hover:bg-zinc-200 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </div>
                )}

                {userProfile?.campusInfrastructureAccommodation && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-teal-400" />
                      <span className="text-sm text-black">Campus Infrastructure Accommodation</span>
                    </div>
                    <a
                      href={userProfile.campusInfrastructureAccommodation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-white hover:bg-zinc-200 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </div> */}
                {/* )} */}
                {/* </div> */}
              </div>
            </CardContent>
          </Card>
        </MagicCard>

        {/* Access Token Display */}
        {/* <MagicCard className="p-1 rounded-2xl border-gray-200 border">
          <Card className="bg-[#F9F9F9] shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-black">
                <Key className="h-5 w-5 text-black" />
                <span>Access Token</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Your current authentication token for API requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
                <p className="text-xs font-mono text-zinc-300 break-all">
                  {accessToken || "No token available"}
                </p>
              </div>
            </CardContent>
          </Card>
        </MagicCard> */}
      </div>
    </DashboardLayout>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
