'use client';

import React, { useState, useEffect } from 'react';
import { getAllGatepasses, updateGatepass, GatepassListResponse, Gatepass } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { PremiumGuard } from '@/components/premium-guard';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle, 
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MagicCard } from '@/components/ui/magic-card';

function AllGatepassesContent() {
  const [gatepasses, setGatepasses] = useState<GatepassListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const fetchGatepasses = async () => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit,
        ...(search && { search }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        sortBy: 'outTime',
        order: 'desc' as const
      };
      const data = await getAllGatepasses(params);
      setGatepasses(data);
    } catch (err: any) {
      console.error('Failed to fetch gatepasses:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load gatepasses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGatepasses();
  }, [page, search, statusFilter]);

  const handleApprove = async (gatepassId: string) => {
    try {
      setIsActionLoading(gatepassId);
      await updateGatepass({
        id: parseInt(gatepassId),
        action: 'approve'
      });
      await fetchGatepasses(); // Refresh the list
    } catch (err: any) {
      console.error('Failed to approve gatepass:', err);
      setError(err.response?.data?.message || err.message || 'Failed to approve gatepass');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleReject = async (gatepassId: string) => {
    try {
      setIsActionLoading(gatepassId);
      await updateGatepass({
        id: parseInt(gatepassId),
        action: 'reject'
      });
      await fetchGatepasses(); // Refresh the list
    } catch (err: any) {
      console.error('Failed to reject gatepass:', err);
      setError(err.response?.data?.message || err.message || 'Failed to reject gatepass');
    } finally {
      setIsActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return 'bg-green-900 text-green-300 border-green-700';
      case 'REJECTED':
        return 'bg-red-900 text-red-300 border-red-700';
      case 'CREATED':
        return 'bg-yellow-900 text-yellow-300 border-yellow-700';
      default:
        return 'bg-zinc-900 text-zinc-300 border-zinc-700';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black p-6">
          <div className="max-w-md mx-auto mt-10">
            <MagicCard className='p-2 rounded-2xl'>
            <Card className="bg-[#101010] border-red-800">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <AlertCircle className="h-16 w-16 text-red-400 mx-auto" />
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Error Loading Gatepasses</h2>
                    <p className="text-red-400">{error}</p>
                  </div>
                  <Button
                    onClick={() => {
                      setError('');
                      fetchGatepasses();
                    }}
                    variant="outline"
                    className="bg-black border-zinc-700 text-white hover:bg-zinc-900"
                  >
                    Try Again
                  </Button>
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
      <div className="min-h-screen bg-black p-6 space-y-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">All Gatepasses</h1>
          <p className="text-zinc-400">
            Manage and approve/reject gatepasses from all students
          </p>
        </div>

        {/* Filters */}
        <MagicCard className='p-2 rounded-2xl'>
        <Card className="bg-[#101010] border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Search by location, reason, or student name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-zinc-950 border-zinc-800 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="CREATED">Created</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        </MagicCard>

        {/* Gatepasses List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : gatepasses && gatepasses.data.length > 0 ? (
          <div className="space-y-4">
            {gatepasses.data.map((gatepass) => (
            <MagicCard className='p-2 rounded-2xl' key={gatepass.id}>
              <Card key={gatepass.id} className="bg-[#101010] border-zinc-800">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {gatepass.student.firstName} {gatepass.student.lastName}
                        </h3>
                        <Badge className={getStatusColor(gatepass.status)}>
                          {gatepass.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-400">ID: {gatepass.id}</p>
                    </div>
                    
                    {gatepass.status === 'CREATED' && (
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(gatepass.id)}
                          disabled={isActionLoading === gatepass.id}
                          className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                        >
                          {isActionLoading === gatepass.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          <span className="ml-1">Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(gatepass.id)}
                          disabled={isActionLoading === gatepass.id}
                          className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                        >
                          {isActionLoading === gatepass.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          <span className="ml-1">Reject</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-zinc-300">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Out Time:</span>
                      </div>
                      <p className="text-white ml-6">{formatDateTime(gatepass.outTime)}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-zinc-300">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">In Time:</span>
                      </div>
                      <p className="text-white ml-6">{formatDateTime(gatepass.inTime)}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-zinc-300">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">Location:</span>
                      </div>
                      <p className="text-white ml-6">{gatepass.outLocation}</p>
                    </div>

                    <div className="space-y-2 md:col-span-2 lg:col-span-3">
                      <div className="flex items-center space-x-2 text-zinc-300">
                        <User className="h-4 w-4" />
                        <span className="font-medium">Reason:</span>
                      </div>
                      <p className="text-white ml-6">{gatepass.reason}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-800 text-xs text-zinc-500">
                    Created: {formatDateTime(gatepass.createdAt)} | 
                    Updated: {formatDateTime(gatepass.updatedAt)}
                  </div>
                </CardContent>
              </Card>
              </MagicCard>
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, gatepasses.total)} of {gatepasses.total} gatepasses
              </p>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="bg-black border-zinc-700 text-white hover:bg-zinc-900"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <span className="text-sm text-white px-3">
                  Page {page} of {gatepasses.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= gatepasses.totalPages}
                  className="bg-black border-zinc-700 text-white hover:bg-zinc-900"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
            <MagicCard className='p-2 rounded-2xl'>
          <Card className="bg-black border-zinc-800">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <AlertCircle className="h-16 w-16 text-zinc-400 mx-auto" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">No Gatepasses Found</h3>
                  <p className="text-zinc-400">
                    {search || (statusFilter && statusFilter !== 'all')
                      ? 'No gatepasses match your current filters.' 
                      : 'No gatepasses have been created yet.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          </MagicCard>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function AllGatepassesPage() {
  return (
    <ProtectedRoute>
      <PremiumGuard>
        <AllGatepassesContent />
      </PremiumGuard>
    </ProtectedRoute>
  );
}