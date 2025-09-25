'use client';

import React, { useState, useEffect } from 'react';
import { 
  updateGatepass, 
  createGatepass, 
  getUserGatepasses, 
  Gatepass, 
  CreateGatepassRequest 
} from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle, 
  Hash, 
  Plus,
  Clock,
  MapPin,
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { MagicCard } from '@/components/ui/magic-card';

function GatepassContent() {
  const [gatepassId, setGatepassId] = useState('');
  const [myGatepasses, setMyGatepasses] = useState<Gatepass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [isApproveByIdLoading, setIsApproveByIdLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<any>(null);
  const [showApproveById, setShowApproveById] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state for creating new gatepass
  const [createForm, setCreateForm] = useState<CreateGatepassRequest>({
    outTime: '',
    inTime: '',
    outLocation: '',
    reason: ''
  });

  // Fetch user's gatepasses
  const fetchMyGatepasses = async () => {
    try {
      setIsLoading(true);
      const data = await getUserGatepasses({
        sortBy: 'createdAt',
        order: 'desc'
      });
      setMyGatepasses(data);
    } catch (err: any) {
      console.error('Failed to fetch user gatepasses:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load your gatepasses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGatepasses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setGatepassId(value);
    if (error) setError('');
  };

  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleApproveById = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gatepassId.trim()) {
      setError('Please enter a gatepass ID');
      return;
    }

    const idNumber = parseInt(gatepassId.trim(), 10);
    if (isNaN(idNumber)) {
      setError('Gatepass ID must be a valid number');
      return;
    }

    setIsApproveByIdLoading(true);
    setError('');

    try {
      await updateGatepass({
        id: idNumber,
        action: 'approve'
      });
      
      setSuccess({
        message: `Gatepass ${gatepassId} approved successfully`,
        type: 'approve_by_id'
      });
      
      setGatepassId('');
      setShowApproveById(false);
      await fetchMyGatepasses(); // Refresh the list
      
    } catch (err: any) {
      console.error('Gatepass approval failed:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to approve gatepass. Please check the ID and try again.'
      );
    } finally {
      setIsApproveByIdLoading(false);
    }
  };

  const handleCreateGatepass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.outTime || !createForm.inTime || !createForm.outLocation || !createForm.reason) {
      setError('Please fill in all fields');
      return;
    }

    setIsActionLoading('create');
    setError('');

    try {
      await createGatepass(createForm);
      
      setSuccess({
        message: 'Gatepass created successfully',
        type: 'create'
      });
      
      setCreateForm({
        outTime: '',
        inTime: '',
        outLocation: '',
        reason: ''
      });
      setShowCreateForm(false);
      await fetchMyGatepasses(); // Refresh the list
      
    } catch (err: any) {
      console.error('Gatepass creation failed:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to create gatepass. Please try again.'
      );
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleApproveGatepass = async (gatepassId: string) => {
    try {
      setIsActionLoading(gatepassId);
      await updateGatepass({
        id: parseInt(gatepassId),
        action: 'approve'
      });
      await fetchMyGatepasses(); // Refresh the list
    } catch (err: any) {
      console.error('Failed to approve gatepass:', err);
      setError(err.response?.data?.message || err.message || 'Failed to approve gatepass');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleRejectGatepass = async (gatepassId: string) => {
    try {
      setIsActionLoading(gatepassId);
      await updateGatepass({
        id: parseInt(gatepassId),
        action: 'reject'
      });
      await fetchMyGatepasses(); // Refresh the list
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

  const handleReset = () => {
    setSuccess(null);
    setError('');
    setShowApproveById(false);
    setShowCreateForm(false);
    setGatepassId('');
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black p-6">
          <MagicCard className='p-2 rounded-2xl'>
          <Card className="max-w-2xl mx-auto bg-black border-zinc-800">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Success!
                  </h2>
                  <p className="text-zinc-400 mb-4">
                    {success.message}
                  </p>
                </div>
                
                <Button
                  onClick={handleReset}
                  className="bg-white hover:bg-zinc-200 text-black font-medium"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
          </MagicCard>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black p-6 space-y-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Gatepasses</h1>
          <p className="text-zinc-400">
            View and manage your gatepass requests
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <RainbowButton
            onClick={() => setShowCreateForm(true)}
            className="bg-white text-black hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Gatepass
          </RainbowButton>
          
          <Button
            onClick={() => setShowApproveById(true)}
            variant="outline"
            className="bg-black border-zinc-700 text-white hover:bg-zinc-900"
          >
            <Hash className="h-4 w-4 mr-2" />
            Approve by ID
          </Button>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-md flex items-center space-x-2 mb-6">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Create Gatepass Form */}
        {showCreateForm && (
          <MagicCard className='p-2 rounded-2xl'>
          <Card className="bg-black border-zinc-800 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Create New Gatepass</CardTitle>
              <CardDescription className="text-zinc-400">
                Fill in the details for your gatepass request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGatepass} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Out Time</label>
                    <Input
                      name="outTime"
                      type="datetime-local"
                      value={createForm.outTime}
                      onChange={handleCreateFormChange}
                      className="bg-zinc-950 border-zinc-800 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">In Time</label>
                    <Input
                      name="inTime"
                      type="datetime-local"
                      value={createForm.inTime}
                      onChange={handleCreateFormChange}
                      className="bg-zinc-950 border-zinc-800 text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Location</label>
                  <Input
                    name="outLocation"
                    placeholder="Where are you going?"
                    value={createForm.outLocation}
                    onChange={handleCreateFormChange}
                    className="bg-zinc-950 border-zinc-800 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Reason</label>
                  <Input
                    name="reason"
                    placeholder="Reason for going out"
                    value={createForm.reason}
                    onChange={handleCreateFormChange}
                    className="bg-zinc-950 border-zinc-800 text-white"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    disabled={isActionLoading === 'create'}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isActionLoading === 'create' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Create Gatepass
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-black border-zinc-700 text-white hover:bg-zinc-900"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          </MagicCard>
        )}

        {/* Approve by ID Form */}
        {showApproveById && (
          <MagicCard className='p-2 rounded-2xl'>
          <Card className="bg-black border-zinc-800 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Approve Gatepass by ID</CardTitle>
              <CardDescription className="text-zinc-400">
                Enter the gatepass ID to approve it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleApproveById} className="space-y-4">
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    type="number"
                    placeholder="Enter gatepass ID"
                    value={gatepassId}
                    onChange={handleInputChange}
                    className="pl-10 bg-zinc-950 border-zinc-800 text-white"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    disabled={isApproveByIdLoading || !gatepassId.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isApproveByIdLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowApproveById(false)}
                    className="bg-black border-zinc-700 text-white hover:bg-zinc-900"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          </MagicCard>
        )}

        {/* My Gatepasses List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : myGatepasses && myGatepasses.length > 0 ? (
          <div className="space-y-4">
            {myGatepasses.map((gatepass: Gatepass) => (
              <MagicCard className='p-2 rounded-2xl' key={gatepass.id}>
              <Card key={gatepass.id} className="bg-[#101010] border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-white">
                          Gatepass #{gatepass.id}
                        </h3>
                        <Badge className={getStatusColor(gatepass.status)}>
                          {gatepass.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {gatepass.status === 'CREATED' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveGatepass(gatepass.id)}
                          disabled={isActionLoading === gatepass.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isActionLoading === gatepass.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectGatepass(gatepass.id)}
                          disabled={isActionLoading === gatepass.id}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isActionLoading === gatepass.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          Reject
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

            {/* Total Count */}
            {myGatepasses.length > 0 && (
              <div className="text-center">
                <p className="text-sm text-zinc-400">
                  Total: {myGatepasses.length} gatepass{myGatepasses.length !== 1 ? 'es' : ''}
                </p>
              </div>
            )}
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
                    You haven't created any gatepasses yet.
                  </p>
                </div>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-white text-black hover:bg-zinc-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Gatepass
                </Button>
              </div>
            </CardContent>
          </Card>
          </MagicCard>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function GatepassPage() {
  return (
    <ProtectedRoute>
      <GatepassContent />
    </ProtectedRoute>
  );
}