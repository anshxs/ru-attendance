'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getAuthToken, getUserProfile, UserProfile } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Users, Key, GraduationCap, Mail, Phone, Home, Loader2, AlertCircle, Download, FileText, Image, File } from 'lucide-react';
import { MagicCard } from '@/components/ui/magic-card';

function DashboardContent() {
  const { user } = useAuth();
  const accessToken = getAuthToken();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const profile = await getUserProfile();
        setUserProfile(profile);
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-white mx-auto" />
            <p className="text-zinc-400">Loading your dashboard...</p>
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
                    <h2 className="text-xl font-bold text-white mb-2">Error Loading Profile</h2>
                    <p className="text-red-400">{error}</p>
                  </div>
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
          <h1 className="text-3xl font-bold text-white mb-2">Complete User Profile</h1>
          <p className="text-zinc-400">
            Welcome back, {userProfile?.firstName || 'User'}! Here's your complete profile information.
          </p>
        </div>

        {/* Personal Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Basic Personal Info */}
          <MagicCard className='p-2 rounded-2xl'>
          <Card className="bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Users className="h-5 w-5 text-white" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Full Name:</span>
                <span className="text-sm text-white text-right">{userProfile?.fullName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">First Name:</span>
                <span className="text-sm text-white">{userProfile?.firstName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Last Name:</span>
                <span className="text-sm text-white">{userProfile?.lastName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Gender:</span>
                <span className="text-sm text-white">{userProfile?.gender || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Blood Group:</span>
                <span className="text-sm text-white">{userProfile?.bloodGroup?.replace('_', ' ') || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Religion:</span>
                <span className="text-sm text-white">{userProfile?.religion || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Social Category:</span>
                <span className="text-sm text-white">{userProfile?.socialCategory || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  userProfile?.status === 'ENROLLED' 
                    ? 'bg-green-900 text-green-400 border border-green-800'
                    : 'bg-yellow-900 text-yellow-400 border border-yellow-800'
                }`}>
                  {userProfile?.status || 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
          </MagicCard>

          {/* Contact Information */}
          <MagicCard className='p-2 rounded-2xl'>
          <Card className="bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Mail className="h-5 w-5 text-white" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">RU Email:</span>
                <span className="text-xs text-white break-all">{userProfile?.ruEmailId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Personal Email:</span>
                <span className="text-xs text-white break-all">{userProfile?.emailId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Alternate Email:</span>
                <span className="text-xs text-white break-all">{userProfile?.alternateEmailId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Mobile:</span>
                <span className="text-sm text-white">{userProfile?.mobileNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Alternate Mobile:</span>
                <span className="text-sm text-white">{userProfile?.alternateContactNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">GitHub:</span>
                <span className="text-xs text-blue-400 break-all">{userProfile?.githubLink || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">LinkedIn:</span>
                <span className="text-xs text-white">{userProfile?.linkedinLink || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Website:</span>
                <span className="text-xs text-white">{userProfile?.personalWebsite || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
          </MagicCard>

          {/* Academic Information */}
          <MagicCard className='p-2 rounded-2xl'>
          <Card className="bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <GraduationCap className="h-5 w-5 text-white" />
                <span>Academic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Enrollment No:</span>
                <span className="text-sm text-white">{userProfile?.enrollmentNo || 'N/A'}</span>
              </div>
              {userProfile?.studentPrograms?.[0] && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-zinc-400">Program:</span>
                    <span className="text-xs text-white text-right">
                      {userProfile.studentPrograms[0].programBatch.program.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-zinc-400">Batch:</span>
                    <span className="text-sm text-white">
                      {userProfile.studentPrograms[0].programBatch.batchNumber}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">ABC ID:</span>
                <span className="text-sm text-white">{userProfile?.abcId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">MacBook ID:</span>
                <span className="text-sm text-white">{userProfile?.macbookId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">NOC Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  userProfile?.nocStatus 
                    ? 'bg-green-900 text-green-400 border border-green-800'
                    : 'bg-red-900 text-red-400 border border-red-800'
                }`}>
                  {userProfile?.nocStatus ? 'Yes' : 'No'}
                </span>
              </div>
            </CardContent>
          </Card>
          </MagicCard>

          {/* Family Information */}
          <MagicCard className='p-2 rounded-2xl'>
          <Card className="bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Home className="h-5 w-5 text-white" />
                <span>Family Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white">Father Details</h4>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-zinc-400">Name:</span>
                  <span className="text-sm text-white">{userProfile?.fatherName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-zinc-400">Mobile:</span>
                  <span className="text-sm text-white">{userProfile?.fatherMobile || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-zinc-400">Email:</span>
                  <span className="text-xs text-white break-all">{userProfile?.fatherEmail || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-zinc-400">Occupation:</span>
                  <span className="text-sm text-white">{userProfile?.fatherOccupation || 'N/A'}</span>
                </div>
              </div>
              
              <div className="space-y-2 pt-3 border-t border-zinc-800">
                <h4 className="text-sm font-semibold text-white">Mother Details</h4>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-zinc-400">Name:</span>
                  <span className="text-sm text-white">{userProfile?.motherName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-zinc-400">Mobile:</span>
                  <span className="text-sm text-white">{userProfile?.motherMobile || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-zinc-400">Email:</span>
                  <span className="text-xs text-white break-all">{userProfile?.motherEmail || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-zinc-400">Occupation:</span>
                  <span className="text-sm text-white">{userProfile?.motherOccupation || 'N/A'}</span>
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-zinc-800">
                <span className="text-sm font-medium text-zinc-400">Annual Income:</span>
                <span className="text-xs text-white text-right">{userProfile?.annualIncome || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
          </MagicCard>

          {/* Accommodation */}
          <MagicCard className='p-2 rounded-2xl'>
          <Card className="bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Home className="h-5 w-5 text-white" />
                <span>Accommodation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Hostel No:</span>
                <span className="text-sm text-white">{userProfile?.hostelNo || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Room No:</span>
                <span className="text-sm text-white">{userProfile?.roomNo || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Haryana Domestic:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  userProfile?.haryanaDomestic 
                    ? 'bg-green-900 text-green-400 border border-green-800'
                    : 'bg-red-900 text-red-400 border border-red-800'
                }`}>
                  {userProfile?.haryanaDomestic ? 'Yes' : 'No'}
                </span>
              </div>
            </CardContent>
          </Card>
          </MagicCard>

          {/* Documents & IDs */}
          <MagicCard className='p-2 rounded-2xl'>
          <Card className="bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Key className="h-5 w-5 text-white" />
                <span>Documents & IDs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Aadhaar:</span>
                <span className="text-sm text-white">{userProfile?.aadhaarNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">PAN Card:</span>
                <span className="text-sm text-white">{userProfile?.pancardNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Application No:</span>
                <span className="text-sm text-white">{userProfile?.applicationNumber || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
          </MagicCard>
        </div>

        {/* Education History */}
        {userProfile?.educationHistory && userProfile.educationHistory.length > 0 && (
          <MagicCard className='p-2 rounded-2xl'>
          <Card className="bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <GraduationCap className="h-5 w-5 text-white" />
                <span>Education History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userProfile.educationHistory.map((edu: any, index: number) => (
                  <div key={index} className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-2">{edu.type.replace('_', ' ')}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-400">Institute:</span>
                        <span className="text-xs text-white text-right">{edu.instituteName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-400">Board:</span>
                        <span className="text-xs text-white text-right">{edu.boardUniversity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-400">Year:</span>
                        <span className="text-sm text-white">{edu.yearOfPassing}</span>
                      </div>
                      {edu.stream && (
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-400">Stream:</span>
                          <span className="text-sm text-white">{edu.stream}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-400">Location:</span>
                        <span className="text-xs text-white">{edu.city}, {edu.state}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </MagicCard>
        )}

        {/* Financial Information */}
        <MagicCard className='p-2 rounded-2xl'>
        <Card className="bg-black border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Phone className="h-5 w-5 text-white" />
              <span>Financial Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Amount Paid:</span>
                <span className="text-sm text-white">₹{userProfile?.amountPaid?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Due Amount:</span>
                <span className="text-sm text-white">₹{userProfile?.dueAmount?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-zinc-400">Updated:</span>
                <span className="text-sm text-white">{userProfile?.updatedAt ? new Date(userProfile.updatedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        </MagicCard>

        {/* Documents & Downloads */}
        <MagicCard className='p-2 rounded-2xl'>
        <Card className="bg-black border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <FileText className="h-5 w-5 text-white" />
              <span>Documents & Downloads</span>
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Download your uploaded documents and certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Academic Documents */}
              <div className="space-y-3">
                <h4 className="text-white font-semibold text-sm border-b border-zinc-800 pb-2">Academic Documents</h4>
                
                {userProfile?.tenthMarksheet && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Image className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-white">10th Marksheet</span>
                    </div>
                    <a
                      href={userProfile.tenthMarksheet}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-white hover:bg-zinc-200 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </div>
                )}

                {userProfile?.twelfthMarksheet && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Image className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-white">12th Marksheet</span>
                    </div>
                    <a
                      href={userProfile.twelfthMarksheet}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-white hover:bg-zinc-200 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </div>
                )}

                {userProfile?.bachelorsMarksheet && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <File className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-white">Bachelor's Marksheet</span>
                    </div>
                    <a
                      href={userProfile.bachelorsMarksheet}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-white hover:bg-zinc-200 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </div>
                )}

                {userProfile?.admissionLetter && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-white">Admission Letter</span>
                    </div>
                    <a
                      href={userProfile.admissionLetter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-white hover:bg-zinc-200 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Identity Documents */}
              <div className="space-y-3">
                <h4 className="text-white font-semibold text-sm border-b border-zinc-800 pb-2">Identity Documents</h4>
                
                {userProfile?.studentAadharImg && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Image className="h-4 w-4 text-orange-400" />
                      <span className="text-sm text-white">Student Aadhaar</span>
                    </div>
                    <a
                      href={userProfile.studentAadharImg}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-white hover:bg-zinc-200 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </div>
                )}

                {userProfile?.parentAadharImg && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Image className="h-4 w-4 text-orange-400" />
                      <span className="text-sm text-white">Parent Aadhaar</span>
                    </div>
                    <a
                      href={userProfile.parentAadharImg}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-white hover:bg-zinc-200 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </div>
                )}

                {userProfile?.studentPanImg && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Image className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-white">Student PAN</span>
                    </div>
                    <a
                      href={userProfile.studentPanImg}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-white hover:bg-zinc-200 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </div>
                )}

                {userProfile?.parentPanImg && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Image className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-white">Parent PAN</span>
                    </div>
                    <a
                      href={userProfile.parentPanImg}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-white hover:bg-zinc-200 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Certificates */}
              <div className="space-y-3">
                <h4 className="text-white font-semibold text-sm border-b border-zinc-800 pb-2">Certificates</h4>
                
                {userProfile?.migrationCertificate && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-white">Migration Certificate</span>
                    </div>
                    <a
                      href={userProfile.migrationCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-white hover:bg-zinc-200 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </div>
                )}

                {userProfile?.characterCertificate && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-white">Character Certificate</span>
                    </div>
                    <a
                      href={userProfile.characterCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-white hover:bg-zinc-200 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </div>
                )}

                {userProfile?.medicalCertificate && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-white">Medical Certificate</span>
                    </div>
                    <a
                      href={userProfile.medicalCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-white hover:bg-zinc-200 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </div>
                )}

                {userProfile?.antiRaggingCertificate && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-pink-400" />
                      <span className="text-sm text-white">Anti-Ragging Certificate</span>
                    </div>
                    <a
                      href={userProfile.antiRaggingCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-white hover:bg-zinc-200 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </div>
                )}

                {userProfile?.incomeCertificate && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-white">Income Certificate</span>
                    </div>
                    <a
                      href={userProfile.incomeCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-white hover:bg-zinc-200 text-black px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Undertakings & Bonds */}
              <div className="space-y-3">
                <h4 className="text-white font-semibold text-sm border-b border-zinc-800 pb-2">Undertakings & Bonds</h4>
                
                {userProfile?.academicUndertaking && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-white">Academic Undertaking</span>
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
                      <span className="text-sm text-white">Asset Policy Undertaking</span>
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
                      <span className="text-sm text-white">No Tolerance Certificate</span>
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
                      <span className="text-sm text-white">Indemnity Bond</span>
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
                      <span className="text-sm text-white">Short Leave Authorization</span>
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
                      <span className="text-sm text-white">Campus Infrastructure Accommodation</span>
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
                  </div>
                )}
              </div>
              
            </div>
          </CardContent>
        </Card>
        </MagicCard>

        {/* Access Token Display */}
        <MagicCard className='p-2 rounded-2xl'>
        <Card className="bg-black border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Key className="h-5 w-5 text-white" />
              <span>Access Token</span>
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Your current authentication token for API requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
              <p className="text-xs font-mono text-zinc-300 break-all">
                {accessToken || 'No token available'}
              </p>
            </div>
          </CardContent>
        </Card>
        </MagicCard>
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