'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Shield, AlertTriangle, CheckCircle, Clock, User, Key, Globe, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { getLoginLogsSupabase, LoginLog } from '@/lib/supabase-logs';

function LoginLogsContent() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Load data
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const result = await getLoginLogsSupabase();
        if (result.success && result.data) {
          setLogs(result.data);
        } else {
          console.error('Failed to load login logs:', result.error);
        }
      } catch (error) {
        console.error('Error loading login logs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        (log.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.error_message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.ip_address || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || log.login_status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [logs, searchTerm, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Get stats
  const stats = useMemo(() => {
    const successful = logs.filter(log => log.login_status === 'SUCCESS').length;
    const failed = logs.filter(log => log.login_status === 'FAILED').length;
    const uniqueEmails = new Set(logs.map(log => log.email)).size;
    
    return {
      total: logs.length,
      successful,
      failed,
      uniqueEmails,
      successRate: logs.length > 0 ? ((successful / logs.length) * 100).toFixed(1) : '0'
    };
  }, [logs]);

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
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-400 to-orange-600 bg-clip-text text-transparent">
            Login Logs
          </h1>
          <p className="text-gray-400">
            Monitor and track all login attempts across the system
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-black border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Attempts</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Successful</p>
                  <p className="text-2xl font-bold text-white">{stats.successful}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Failed</p>
                  <p className="text-2xl font-bold text-white">{stats.failed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <User className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-white">{stats.successRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-black border-gray-800 mb-6">
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
                placeholder="Search by email, error message, or IP address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black border-white/20 text-white outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2 text-white">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 bg-black border border-white/20 rounded-md text-white outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="SUCCESS">Successful</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-900"
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            <p className="text-gray-400 text-sm">
              Showing {filteredData.length} of {logs.length} login attempts
            </p>
          </CardContent>
        </Card>

        {/* Results */}
        {filteredData.length === 0 ? (
          <Card className="bg-black border-gray-800">
            <CardContent className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">No login logs found</h3>
              <p className="text-gray-400">Try adjusting your search criteria or filters.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Login Logs Table */}
            <Card className="bg-black border-gray-800 mb-8">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-800">
                      <tr>
                        <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Email</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Password</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Time</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Error</th>
                        <th className="text-left p-4 text-gray-400 font-medium">User Agent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.map((log) => (
                        <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-900/20">
                          <td className="p-4">
                            <Badge
                              variant={log.login_status === 'SUCCESS' ? 'default' : 'destructive'}
                              className={log.login_status === 'SUCCESS' 
                                ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                                : 'bg-red-500/20 text-red-400 border-red-500/50'
                              }
                            >
                              {log.login_status === 'SUCCESS' ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <AlertTriangle className="h-3 w-3 mr-1" />
                              )}
                              {log.login_status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-white font-medium">{log.email}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Key className="h-4 w-4 text-gray-400" />
                              <code className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded">
                                {log.password_attempted?.substring(0, 12)}...
                              </code>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-300 text-sm">
                                {formatDate(log.attempted_at)}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            {log.error_message ? (
                              <span className="text-red-400 text-sm">
                                {log.error_message.substring(0, 50)}
                                {log.error_message.length > 50 && '...'}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-sm">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-300 text-xs truncate max-w-xs">
                                {log.user_agent?.substring(0, 50)}...
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card className="bg-black border-gray-800">
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

export default function LoginLogsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <LoginLogsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}