'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Users, GraduationCap, Mail, Hash, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { MagicCard } from '@/components/ui/magic-card';

interface User {
  userId: number;
  email: string;
  userType: string;
  profileImg: string | null;
  name: string;
  roleInfo: string;
  contactEmail: string;
  course: string;
  batch: string;
  designation: string | null;
  department: string | null;
}

interface DirectoryData {
  data: User[];
}

function DirectoryContent() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedUserType, setSelectedUserType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data.json');
        const jsonData: DirectoryData = await response.json();
        setData(jsonData.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get unique values for filters
  const uniqueCourses = useMemo(() => {
    const courses = [...new Set(data.map(user => user.course).filter(Boolean))];
    return courses.sort();
  }, [data]);

  const uniqueBatches = useMemo(() => {
    const batches = [...new Set(data.map(user => user.batch).filter(Boolean))];
    return batches.sort();
  }, [data]);

  const uniqueUserTypes = useMemo(() => {
    const types = [...new Set(data.map(user => user.userType).filter(Boolean))];
    return types.sort();
  }, [data]);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return data.filter(user => {
      const matchesSearch = 
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.roleInfo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.course || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourse = selectedCourse === 'all' || user.course === selectedCourse;
      const matchesBatch = selectedBatch === 'all' || user.batch === selectedBatch;
      const matchesUserType = selectedUserType === 'all' || user.userType === selectedUserType;

      return matchesSearch && matchesCourse && matchesBatch && matchesUserType;
    });
  }, [data, searchTerm, selectedCourse, selectedBatch, selectedUserType]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCourse, selectedBatch, selectedUserType]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCourse('all');
    setSelectedBatch('all');
    setSelectedUserType('all');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-white bg-clip-text text-transparent">
            Directory
          </h1>
          <p className="text-zinc-400">
            Browse and search through all users in the system
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-[#101010] mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Filter className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, roll number, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#101010] border-white/20 text-white outline-none"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full p-2 bg-[#101010] border border-white/20 rounded-md text-white outline-none"
                >
                  <option value="all">All Courses</option>
                  {uniqueCourses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Batch</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full p-2 bg-[#101010] border border-white/20 rounded-md text-white outline-none"
                >
                  <option value="all">All Batches</option>
                  {uniqueBatches.map(batch => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">User Type</label>
                <select
                  value={selectedUserType}
                  onChange={(e) => setSelectedUserType(e.target.value)}
                    className="w-full p-2 bg-[#101010] border border-white/20 rounded-md text-white outline-none"
                    >
                  <option value="all">All Types</option>
                  {uniqueUserTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-between items-center pt-2">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-900"
              >
                Clear Filters
              </Button>
              <p className="text-gray-400 text-sm">
                Showing {filteredData.length} of {data.length} users
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {filteredData.length === 0 ? (
          <Card className="bg-black ">
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">No users found</h3>
              <p className="text-gray-400">Try adjusting your search criteria or filters.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* User Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {currentData.map((user) => (
                <MagicCard className='p-2 rounded-2xl'>
                <Card key={user.userId} className="bg-[#101010] transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {user.profileImg ? (
                          <img
                            src={user.profileImg}
                            alt={user.name || 'User'}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                            {(user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate" title={user.name || 'Unknown'}>
                          {user.name || 'Unknown User'}
                        </h3>
                        <div className="space-y-1 mt-2">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Hash className="h-3 w-3" />
                            <span className="truncate">{user.roleInfo || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Mail className="h-3 w-3" />
                            <span className="truncate" title={user.email || 'No email'}>{user.email || 'No email'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <GraduationCap className="h-3 w-3" />
                            <span className="truncate" title={user.course || 'No course'}>{user.course || 'No course'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>Batch {user.batch || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Badge
                            variant={user.userType === 'STUDENT' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {user.userType || 'UNKNOWN'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </MagicCard>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card className="bg-black">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Page {currentPage} of {totalPages} ({filteredData.length} total results)
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                        className="border-gray-700 text-gray-300 hover:bg-gray-900"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      {/* Page numbers */}
                      <div className="flex space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              className={currentPage === pageNum 
                                ? "bg-white text-black" 
                                : "border-gray-700 text-gray-300 hover:bg-gray-900"
                              }
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        size="sm"
                        className="border-gray-700 text-gray-300 hover:bg-gray-900"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function DirectoryPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DirectoryContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}