'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, MapPin, User, BookOpen, Utensils, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCalendarEvents, CalendarEvent } from '@/lib/auth';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface CalendarDialogProps {
  children: React.ReactNode;
}

export function CalendarDialog({ children }: CalendarDialogProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [isOpen, setIsOpen] = useState(false);

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
    if (isOpen) {
      if (viewMode === 'day') {
        fetchEvents(selectedDate, selectedDate);
      } else {
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = endOfWeek(selectedDate);
        fetchEvents(weekStart, weekEnd);
      }
    }
  }, [selectedDate, viewMode, isOpen]);

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
        return 'bg-blue-900/50 border-blue-700 text-blue-300';
      case 'MESS':
        return 'bg-green-900/50 border-green-700 text-green-300';
      case 'CLUB_EVENT':
        return 'bg-purple-900/50 border-purple-700 text-purple-300';
      default:
        return 'bg-zinc-900/50 border-zinc-700 text-zinc-300';
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
          <h3 className="text-xl font-semibold text-white">
            {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
          </h3>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        ) : dayEvents.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
            {dayEvents.map((event) => (
              <Card key={event.id} className={`${getEventColor(event.type)} border`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white mb-1">{event.title}</h4>
                      
                      <div className="flex items-center space-x-2 text-sm mb-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                        </span>
                      </div>
                      
                      {event.details?.classroom && (
                        <div className="flex items-center space-x-2 text-sm mb-1">
                          <MapPin className="h-3 w-3" />
                          <span>Room: {event.details.classroom}</span>
                        </div>
                      )}
                      
                      {event.details?.faculty && (
                        <div className="flex items-center space-x-2 text-sm mb-1">
                          <User className="h-3 w-3" />
                          <span>Faculty: {event.details.faculty}</span>
                        </div>
                      )}
                      
                      {event.details?.courseCode && (
                        <div className="text-xs opacity-75 mb-1">
                          Course: {event.details.courseCode}
                        </div>
                      )}
                      
                      {event.details?.menu && (
                        <div className="text-xs opacity-75">
                          {event.details.menu}
                        </div>
                      )}
                      
                      <div className="mt-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium border">
                          {event.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No events scheduled for this day</p>
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
          <h3 className="text-xl font-semibold text-white">
            {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
          </h3>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto scrollbar-hide">
            {weekDays.map((day: Date) => {
              const dayEvents = events.filter(event => {
                const eventDate = format(new Date(event.start), 'yyyy-MM-dd');
                const dayStr = format(day, 'yyyy-MM-dd');
                return eventDate === dayStr;
              });

              return (
                <div key={day.toISOString()} className="border border-zinc-800 rounded-lg p-3 bg-zinc-950">
                  <div className="font-semibold text-white mb-2">
                    {format(day, 'EEEE, MMM dd')}
                  </div>
                  
                  {dayEvents.length > 0 ? (
                    <div className="space-y-2">
                      {dayEvents.map((event) => (
                        <div key={event.id} className={`p-2 rounded border text-xs ${getEventColor(event.type)}`}>
                          <div className="flex items-center space-x-2 mb-1">
                            {getEventIcon(event.type)}
                            <span className="font-medium">{event.title}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}</span>
                          </div>
                          {event.details?.classroom && (
                            <div className="flex items-center space-x-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>{event.details.classroom}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No events</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-black border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>Calendar</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex bg-zinc-900 rounded-lg p-1">
                <Button
                  variant={viewMode === 'day' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('day')}
                  className="text-xs"
                >
                  Day
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className="text-xs"
                >
                  Week
                </Button>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateDate('prev')}
            className="text-white hover:bg-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" />
            {viewMode === 'day' ? 'Previous Day' : 'Previous Week'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date())}
            className="text-white border-zinc-700 hover:bg-zinc-900"
          >
            Today
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateDate('next')}
            className="text-white hover:bg-zinc-900"
          >
            {viewMode === 'day' ? 'Next Day' : 'Next Week'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-white">
          {viewMode === 'day' ? renderDayView() : renderWeekView()}
        </div>
      </DialogContent>
    </Dialog>
  );
}