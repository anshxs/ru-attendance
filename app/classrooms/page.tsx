'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Users, Projector, Search, Filter, MapPin, Layers, Map, LoaderPinwheel } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAuthToken } from '@/lib/auth';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { MagicCard } from '@/components/ui/magic-card';

interface Classroom {
  id: string;
  roomNumber: string;
  capacity: number;
  hasProjector: boolean;
  floor: {
    floorNumber: number;
    building: {
      name: string;
    };
  };
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Classroom[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}

function ClassroomsContent() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('all');
  const [filterFloor, setFilterFloor] = useState('all');
  const [filterProjector, setFilterProjector] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('map');
  const [error, setError] = useState<string | null>(null);

  // Fetch all classrooms data at once
  const fetchAllClassrooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // First, get the total count
      const initialResponse = await fetch(
        'https://rishiverse-api.rishihood.edu.in/api/v1/option/classroom?page=1&limit=10',
        {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!initialResponse.ok) {
        throw new Error(`HTTP error! status: ${initialResponse.status}`);
      }

      const initialData: ApiResponse = await initialResponse.json();
      const totalItems = initialData.meta.totalItems;
      
      // Now fetch all data in one request
      const allDataResponse = await fetch(
        `https://rishiverse-api.rishihood.edu.in/api/v1/option/classroom?page=1&limit=${totalItems}&order=asc`,
        {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!allDataResponse.ok) {
        throw new Error(`HTTP error! status: ${allDataResponse.status}`);
      }

      const allData: ApiResponse = await allDataResponse.json();
      
      if (allData.success) {
        setClassrooms(allData.data);
      } else {
        throw new Error(allData.message || 'Failed to fetch classrooms');
      }
    } catch (err) {
      console.error('Error fetching classrooms:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching classrooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllClassrooms();
  }, []);

  // Memoized filtered and sorted data
  const { filteredClassrooms, buildings, floors, stats } = useMemo(() => {
    let filtered = classrooms;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(classroom =>
        classroom.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classroom.floor.building.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply building filter
    if (filterBuilding !== 'all') {
      filtered = filtered.filter(classroom =>
        classroom.floor.building.name === filterBuilding
      );
    }

    // Apply floor filter
    if (filterFloor !== 'all') {
      filtered = filtered.filter(classroom =>
        classroom.floor.floorNumber.toString() === filterFloor
      );
    }

    // Apply projector filter
    if (filterProjector !== 'all') {
      filtered = filtered.filter(classroom =>
        filterProjector === 'yes' ? classroom.hasProjector : !classroom.hasProjector
      );
    }

    // Get unique buildings and floors
    const uniqueBuildings = [...new Set(classrooms.map(c => c.floor.building.name))];
    const uniqueFloors = [...new Set(classrooms.map(c => c.floor.floorNumber))];

    // Calculate stats
    const totalCapacity = filtered.reduce((sum, c) => sum + c.capacity, 0);
    const projectorCount = filtered.filter(c => c.hasProjector).length;
    const buildingCount = new Set(filtered.map(c => c.floor.building.name)).size;

    return {
      filteredClassrooms: filtered,
      buildings: uniqueBuildings,
      floors: uniqueFloors.sort((a, b) => a - b),
      stats: {
        totalRooms: filtered.length,
        totalCapacity,
        projectorCount,
        buildingCount
      }
    };
  }, [classrooms, searchTerm, filterBuilding, filterFloor, filterProjector]);

  const getCapacityColor = (capacity: number) => {
    if (capacity >= 100) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (capacity >= 50) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    if (capacity >= 30) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  const getFloorColor = (floor: number) => {
    const colors = [
      'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    ];
    return colors[floor % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-[80vh]">
            <LoaderPinwheel className="animate-spin rounded-full h-32 w-32 border-white" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black text-white p-6">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-red-900/20 border-red-500/30 p-8 text-center">
              <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Classrooms</h2>
              <p className="text-red-300 mb-4">{error}</p>
              <Button onClick={fetchAllClassrooms} className="bg-red-500 hover:bg-red-600">
                Try Again
              </Button>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Classroom Directory
            </h1>
            <p className="text-gray-400 mt-2">
              Explore all available classrooms across different buildings and floors
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              className="px-4"
            >
              <Layers className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className="px-4"
            >
              <Filter className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              onClick={() => setViewMode('map')}
              className="px-4"
            >
              <Map className="h-4 w-4 mr-2" />
              Map
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{stats.totalRooms}</p>
                <p className="text-blue-300 text-sm">Total Rooms</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{stats.totalCapacity.toLocaleString()}</p>
                <p className="text-green-300 text-sm">Total Capacity</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Projector className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">{stats.projectorCount}</p>
                <p className="text-purple-300 text-sm">With Projector</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <MapPin className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-400">{stats.buildingCount}</p>
                <p className="text-orange-300 text-sm">Buildings</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <MagicCard className="p-1 rounded-2xl border-gray-200 border">
        <Card className="bg-black p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search rooms or buildings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-800/50 border-zinc-600"
              />
            </div>
            
            
            <Select value={filterBuilding} onValueChange={setFilterBuilding}>
              <SelectTrigger className="bg-zinc-800/50 border-zinc-600">
                <SelectValue placeholder="Select Building" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-600">
                <SelectItem value="all">All Buildings</SelectItem>
                {buildings.map(building => (
                  <SelectItem key={building} value={building}>{building}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterFloor} onValueChange={setFilterFloor}>
              <SelectTrigger className="bg-zinc-800/50 border-zinc-600">
                <SelectValue placeholder="Select Floor" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-600">
                <SelectItem value="all">All Floors</SelectItem>
                {floors.map(floor => (
                  <SelectItem key={floor} value={floor.toString()}>Floor {floor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterProjector} onValueChange={setFilterProjector}>
              <SelectTrigger className="bg-zinc-800/50 border-zinc-600">
                <SelectValue placeholder="Projector" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-600">
                <SelectItem value="all">All Rooms</SelectItem>
                <SelectItem value="yes">With Projector</SelectItem>
                <SelectItem value="no">Without Projector</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={() => {
                setSearchTerm('');
                setFilterBuilding('all');
                setFilterFloor('all');
                setFilterProjector('all');
              }}
              variant="outline"
              className="border-zinc-600 hover:bg-zinc-700"
            >
              Clear Filters
            </Button>
          </div>
        </Card>
        </MagicCard>

        {/* Classrooms Display */}
        {viewMode === 'map' ? (
          /* Building Map View */
          <div className="space-y-6">
            {buildings.map(buildingName => {
              const buildingRooms = filteredClassrooms.filter(
                room => room.floor.building.name === buildingName
              );
              
              if (buildingRooms.length === 0) return null;
              
              const buildingFloors = [...new Set(buildingRooms.map(r => r.floor.floorNumber))].sort((a, b) => b - a);
              
              return (
                <Card key={buildingName} className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 border-zinc-700 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Building2 className="h-8 w-8 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{buildingName}</h2>
                        <p className="text-gray-400">{buildingRooms.length} rooms available</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {buildingFloors.map(floorNumber => {
                        const floorRooms = buildingRooms.filter(r => r.floor.floorNumber === floorNumber);
                        return (
                          <div key={floorNumber} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className={`${getFloorColor(floorNumber)} border text-sm px-3 py-1`}>
                                <Layers className="h-4 w-4 mr-1" />
                                Floor {floorNumber}
                              </Badge>
                              <span className="text-gray-400 text-sm">
                                {floorRooms.length} rooms
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                              {floorRooms
                                .sort((a, b) => parseInt(a.roomNumber) - parseInt(b.roomNumber))
                                .map(room => (
                                <div
                                  key={room.id}
                                  className={`
                                    relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 cursor-pointer
                                    ${getCapacityColor(room.capacity).replace('bg-', 'bg-').replace('/20', '/30')}
                                  `}
                                  title={`Room ${room.roomNumber} - Capacity: ${room.capacity} - ${room.hasProjector ? 'Has Projector' : 'No Projector'}`}
                                >
                                  <div className="text-center">
                                    <div className="font-bold text-lg">{room.roomNumber}</div>
                                    <div className="flex items-center justify-center gap-1 mt-1">
                                      <Users className="h-3 w-3" />
                                      <span className="text-xs">{room.capacity}</span>
                                    </div>
                                    {room.hasProjector && (
                                      <Projector className="h-3 w-3 mx-auto mt-1 text-green-400" />
                                    )}
                                  </div>
                                  
                                  {/* Room details on hover */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    Room {room.roomNumber} • {room.capacity} seats • {room.hasProjector ? '📽️ Projector' : 'No Projector'}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Floor Statistics */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700">
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span>Total Capacity: {floorRooms.reduce((sum, r) => sum + r.capacity, 0)}</span>
                                <span>With Projector: {floorRooms.filter(r => r.hasProjector).length}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredClassrooms.map((classroom) => (
              <Card
                key={classroom.id}
                className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 border-zinc-700 hover:border-zinc-500 transition-all duration-300 hover:shadow-lg hover:shadow-white/5 overflow-hidden group"
              >
                <div className="p-6 space-y-4">
                  {/* Room Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        Room {classroom.roomNumber}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{classroom.floor.building.name}</span>
                      </div>
                    </div>
                    {classroom.hasProjector && (
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Projector className="h-4 w-4 text-green-400" />
                      </div>
                    )}
                  </div>

                  {/* Room Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Capacity</span>
                      <Badge className={`${getCapacityColor(classroom.capacity)} border`}>
                        <Users className="h-3 w-3 mr-1" />
                        {classroom.capacity}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Floor</span>
                      <Badge className={`${getFloorColor(classroom.floor.floorNumber)} border`}>
                        <Layers className="h-3 w-3 mr-1" />
                        {classroom.floor.floorNumber}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Projector</span>
                      <Badge 
                        className={`border ${
                          classroom.hasProjector 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}
                      >
                        {classroom.hasProjector ? '✓ Available' : '✗ Not Available'}
                      </Badge>
                    </div>
                  </div>

                  {/* Room ID */}
                  <div className="pt-3 border-t border-zinc-700">
                    <p className="text-xs text-gray-500 font-mono truncate">
                      ID: {classroom.id}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* List View */
          <Card className="bg-zinc-900/50 border-zinc-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-700">
                  <tr>
                    <th className="text-left p-4 text-gray-400 font-medium">Room</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Building</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Floor</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Capacity</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Projector</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClassrooms.map((classroom) => (
                    <tr key={classroom.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white">{classroom.roomNumber}</div>
                        <div className="text-xs text-gray-500 font-mono">{classroom.id}</div>
                      </td>
                      <td className="p-4 text-gray-300">{classroom.floor.building.name}</td>
                      <td className="p-4">
                        <Badge className={`${getFloorColor(classroom.floor.floorNumber)} border`}>
                          {classroom.floor.floorNumber}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getCapacityColor(classroom.capacity)} border`}>
                          <Users className="h-3 w-3 mr-1" />
                          {classroom.capacity}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge 
                          className={`border ${
                            classroom.hasProjector 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}
                        >
                          {classroom.hasProjector ? (
                            <>
                              <Projector className="h-3 w-3 mr-1" />
                              Yes
                            </>
                          ) : (
                            '✗ No'
                          )}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* No Results */}
        {filteredClassrooms.length === 0 && (
          <Card className="bg-zinc-900/50 border-zinc-700 p-8 text-center">
            <Building2 className="h-16 w-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Classrooms Found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your filters or search terms to find classrooms.
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setFilterBuilding('all');
                setFilterFloor('all');
                setFilterProjector('all');
              }}
              variant="outline"
              className="border-zinc-600 hover:bg-zinc-700"
            >
              Clear All Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
}

export default function ClassroomsPage() {
  return (
    <ProtectedRoute>
      <ClassroomsContent />
    </ProtectedRoute>
  );
}