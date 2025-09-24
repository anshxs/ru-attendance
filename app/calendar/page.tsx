'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Calendar as CalendarIcon, Clock, MapPin, User, BookOpen, Utensils, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCalendarEvents, CalendarEvent } from '@/lib/auth';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { MagicCard } from '@/components/ui/magic-card';

function CalendarContent() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');

  const fetchEvents = async (startDate: Date, endDate: Date) => {
    try {
      setIsLoading(true);
      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');
      const fetchedEvents = await getCalendarEvents(startStr, endStr);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'day') {
      fetchEvents(selectedDate, selectedDate);
    } else {
      const weekStart = startOfWeek(selectedDate);
      const weekEnd = endOfWeek(selectedDate);
      fetchEvents(weekStart, weekEnd);
    }
  }, [selectedDate, viewMode]);

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'day') {
      setSelectedDate(direction === 'next' ? addDays(selectedDate, 1) : subDays(selectedDate, 1));
    } else {
      setSelectedDate(direction === 'next' ? addDays(selectedDate, 7) : subDays(selectedDate, 7));
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'LECTURE':
        return <BookOpen className="h-4 w-4" />;
      case 'MESS':
        return <Utensils className="h-4 w-4" />;
      case 'CLUB_EVENT':
        return <User className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'LECTURE':
        return 'bg-blue-900/30 border-blue-900 text-blue-300';
      case 'MESS':
        return 'bg-green-900/30 border-green-900 text-green-300';
      case 'CLUB_EVENT':
        return 'bg-purple-900/30 border-purple-900 text-purple-300';
      default:
        return 'bg-amber-900/30 border-zinc-900 text-zinc-300';
    }
  };

  const renderDayView = () => {
    const dayEvents = events.filter(event => {
      const eventDate = format(new Date(event.start), 'yyyy-MM-dd');
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      return eventDate === selectedDateStr;
    });

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-white mb-6">
            {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
          </h3>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : dayEvents.length > 0 ? (
          <div className="grid gap-4">
            {dayEvents.map((event) => (
              <MagicCard className='p-2 rounded-2xl'>
              <Card key={event.id} className={`border ${getEventColor(event.type)} bg-black/50`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getEventIcon(event.type)}
                      <h4 className="font-semibold text-lg">{event.title}</h4>
                    </div>
                    <span className="text-sm px-2 py-1 bg-zinc-900 rounded">{event.type}</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}</span>
                    </div>
                    
                    {event.details?.classroom && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.details.classroom}</span>
                      </div>
                    )}
                    
                    {event.details?.faculty && (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Faculty: {event.details.faculty}</span>
                      </div>
                    )}
                    
                    {event.details?.courseCode && (
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4" />
                        <span>Course: {event.details.courseCode}</span>
                      </div>
                    )}
                    
                    {event.details?.description && (
                      <p className="text-zinc-300 mt-2">{event.details.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              </MagicCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarIcon className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">No events for this day</p>
          </div>
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate);
    const weekEnd = endOfWeek(selectedDate);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-white mb-6">
            {format(weekStart, 'MMMM dd')} - {format(weekEnd, 'MMMM dd, yyyy')}
          </h3>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const dayEvents = events.filter(event => {
                const eventDate = format(new Date(event.start), 'yyyy-MM-dd');
                return eventDate === dayStr;
              });

              return (
                <MagicCard className='p-2 rounded-2xl'>
                <Card key={dayStr} className="bg-black border-zinc-800 min-h-[200px]">
                  <CardContent className="p-3">
                    <div className="text-center mb-3">
                      <h4 className="font-semibold text-white">
                        {format(day, 'EEE')}
                      </h4>
                      <p className="text-sm text-zinc-400">
                        {format(day, 'MMM dd')}
                      </p>
                    </div>
                    
                    {dayEvents.length > 0 ? (
                      <div className="space-y-2">
                        {dayEvents.map((event) => (
                          <div key={event.id} className={`p-2 rounded border text-xs ${getEventColor(event.type)}`}>
                            <div className="flex items-center space-x-1 mb-1">
                              {getEventIcon(event.type)}
                              <span className="font-medium truncate">{event.title}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{format(new Date(event.start), 'HH:mm')}</span>
                            </div>
                            {event.details?.classroom && (
                              <div className="flex items-center space-x-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{event.details.classroom}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-zinc-500 text-xs text-center">No events</p>
                    )}
                  </CardContent>
                </Card>
                </MagicCard>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
            <p className="text-zinc-400">
              View your schedule and upcoming events
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex bg-zinc-900 rounded-lg p-1">
              <Button
                variant={viewMode === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('day')}
                className="text-sm"
              >
                Day
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="text-sm"
              >
                Week
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigateDate('prev')}
            className="text-white hover:bg-zinc-900"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {viewMode === 'day' ? 'Previous Day' : 'Previous Week'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setSelectedDate(new Date())}
            className="text-white border-zinc-700 hover:bg-zinc-900"
          >
            Today
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => navigateDate('next')}
            className="text-white hover:bg-zinc-900"
          >
            {viewMode === 'day' ? 'Next Day' : 'Next Week'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Calendar Content */}
        <div className="text-white">
          {viewMode === 'day' ? renderDayView() : renderWeekView()}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function CalendarPage() {
  return (
    <ProtectedRoute>
      <CalendarContent />
    </ProtectedRoute>
  );
}