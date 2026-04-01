import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Clock, TrendingUp, BookOpen, UserPlus, FileText, ArrowRight, Eye, MonitorPlay } from 'lucide-react';

export const DeskOverview = ({ stats, loadingStats, recentBookings }: { stats: any, loadingStats: boolean, recentBookings: any[] }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="rounded-3xl p-8 text-white shadow-lg relative overflow-hidden bg-indigo-600">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome, Front Desk!</h2>
          <p className="text-indigo-100 max-w-xl">
            There are {stats.todayAppointments} appointments today and {stats.pendingWaitlists} patients on the waitlist. Keep the flow smooth!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 hover:border-indigo-500/50 transition-all duration-300 shadow-sm hover:shadow-xl bg-card/50 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{stats.todayAppointments}</div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-yellow-500/50 transition-all duration-300 shadow-sm hover:shadow-xl bg-card/50 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Requests</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{stats.pendingBookings}</div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-xl bg-card/50 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Walk-ins Today</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{stats.walkinsToday}</div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-amber-500/50 transition-all duration-300 shadow-sm hover:shadow-xl bg-card/50 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Waitlist Patients</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{stats.pendingWaitlists}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Modules */}
      <h3 className="text-xl font-bold mt-8 mb-4">Front Desk Modules</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer group" onClick={() => navigate('/admin/bookings/new')}>
          <CardHeader>
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500 transition-colors">
              <UserPlus className="w-6 h-6 text-green-500 group-hover:text-white" />
            </div>
            <CardTitle className="mt-4">Register Patient</CardTitle>
            <CardDescription>Book new appointment or walk-in</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer group" onClick={() => navigate('/admin/check-in')}>
          <CardHeader>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
              <FileText className="w-6 h-6 text-indigo-500 group-hover:text-white" />
            </div>
            <CardTitle className="mt-4">Patient Check-in</CardTitle>
            <CardDescription>Verify arriving patients</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer group" onClick={() => navigate('/admin/queue')}>
          <CardHeader>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
              <MonitorPlay className="w-6 h-6 text-purple-500 group-hover:text-white" />
            </div>
            <CardTitle className="mt-4">Manage Queue</CardTitle>
            <CardDescription>Live clinic waiting room</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer group" onClick={() => navigate('/admin/waitlists')}>
          <CardHeader>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
              <Clock className="w-6 h-6 text-amber-500 group-hover:text-white" />
            </div>
            <CardTitle className="mt-4">Reschedule & Lists</CardTitle>
            <CardDescription>Manage waitlists & moves</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Today's Schedule & Arrivals
          </h3>
          <Button variant="link" asChild className="hidden sm:flex">
            <Link to="/admin/bookings">View All <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>

        <Card className="border-2 shadow-xl shadow-indigo-600/5">
          <CardContent className="p-0">
            {loadingStats ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                Loading...
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="text-center py-16 bg-muted/20">
                <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-foreground">No recent bookings</h4>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-1 sm:mt-0">
                        <span className="font-bold text-indigo-600">{booking.patient_name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-bold text-foreground mb-1">{booking.patient_name}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> {booking.clinic_services?.service_name || 'Eye Checkup'}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> {new Date(booking.appointment_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-1/3">
                      <Badge variant="outline" className={`
                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                              'bg-blue-100 text-blue-700 border-blue-200'}
                      `}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/admin/bookings/${booking.id}`}>Check-in</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {recentBookings.length > 0 && (
              <div className="p-4 border-t border-border bg-muted/10 text-center sm:hidden">
                <Button variant="link" asChild className="w-full">
                  <Link to="/admin/bookings">View All <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
