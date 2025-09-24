'use client';

import React, { useState } from 'react';
import { updateGatepass } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { CheckCircle, Loader2, AlertCircle, Hash } from 'lucide-react';

function GatepassContent() {
  const [gatepassId, setGatepassId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setGatepassId(value);
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gatepassId.trim()) {
      setError('Please enter a gatepass ID');
      return;
    }

    // Validate that the ID is a valid integer
    const idNumber = parseInt(gatepassId.trim(), 10);
    if (isNaN(idNumber)) {
      setError('Gatepass ID must be a valid number');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(null);

    try {
      console.log('Approving gatepass with ID:', idNumber);
      
      const approveResponse = await updateGatepass({
        id: idNumber, // Send as number to match API expectation
        action: 'approve'
      });
      
      console.log('Gatepass approved:', approveResponse);
      
      setSuccess({
        id: gatepassId,
        status: 'approved',
        response: approveResponse
      });
      
      // Reset form after successful approval
      setGatepassId('');
      
    } catch (err: any) {
      console.error('Gatepass approval failed:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to approve gatepass. Please check the ID and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setGatepassId('');
    setSuccess(null);
    setError('');
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black p-6">
          <Card className="max-w-2xl mx-auto bg-black border-zinc-800">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Gatepass Approved Successfully!
                  </h2>
                  <p className="text-zinc-400 mb-4">
                    The gatepass has been approved successfully.
                  </p>
                </div>
                
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg text-left space-y-2">
                  <h3 className="font-semibold text-white">Approval Details:</h3>
                  <p className="text-zinc-300"><strong className="text-white">Gatepass ID:</strong> {success.id}</p>
                  <p className="text-zinc-300"><strong className="text-white">Status:</strong> 
                    <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-400 border border-green-800">
                      Approved
                    </span>
                  </p>
                  <p className="text-zinc-300"><strong className="text-white">Approved At:</strong> {new Date().toLocaleString()}</p>
                </div>
                
                <Button
                  onClick={handleReset}
                  className="bg-white hover:bg-zinc-200 text-black font-medium"
                >
                  Approve Another Gatepass
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black p-6 space-y-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Approve Gatepass</h1>
          <p className="text-zinc-400">
            Enter a gatepass ID to approve it
          </p>
        </div>

        {/* Gatepass Approval Form */}
        <Card className="max-w-2xl mx-auto bg-black border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <CheckCircle className="h-5 w-5 text-white" />
              <span>Gatepass Approval</span>
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Enter the gatepass ID that you want to approve
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-md flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="gatepassId" className="text-sm font-medium text-white">
                  Gatepass ID
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    id="gatepassId"
                    name="gatepassId"
                    type="number"
                    placeholder="Enter the gatepass ID (e.g., 325)"
                    value={gatepassId}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="pl-10 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-white focus:ring-white"
                    min="1"
                    step="1"
                    required
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Enter a numeric ID (e.g., 325). This will approve the gatepass with the specified ID.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-white hover:bg-zinc-200 text-black font-medium disabled:bg-zinc-800 disabled:text-zinc-400"
                disabled={isLoading || !gatepassId.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving Gatepass...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Gatepass
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
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