import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Clock, TrendingUp, LogOut, Settings, BookOpen, Shield, Eye, ArrowRight, Settings2, BarChart3 } from 'lucide-react';

export const AdminOverview = ({ stats, loadingStats, recentBookings }: { stats: any, loadingStats: boolean, recentBookings: any[] }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="rounded-3xl p-8 text-primary-foreground shadow-lg relative overflow-hidden bg-primary">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome back, System Admin!</h2>
          <p className="text-primary-foreground/90 max-w-xl">
            Here is what is happening at Satome Eye Clinic today. You have {stats.todayAppointments} appointments scheduled and {stats.pendingBookings} new requests.
          </p>
        </div>
      </div>

      {/* Admin Stats Grid - Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-2 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl bg-card/50 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1">Total scheduled for today</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-teal-500/50 transition-all duration-300 shadow-sm hover:shadow-xl bg-card/50 backdrop-blur-md border-teal-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Today</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-teal-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Consultations finished</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-yellow-500/50 transition-all duration-300 shadow-sm hover:shadow-xl bg-card/50 backdrop-blur-md border-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 hover:border-indigo-500/50 transition-all duration-300 shadow-sm hover:shadow-xl bg-card/50 backdrop-blur-md border-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Follow-ups Today</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Badge className="w-4 h-4 p-0 flex items-center justify-center bg-indigo-500 text-[8px]">F</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.followupsToday}</div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-xl bg-card/50 backdrop-blur-md border-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Walk-in Patients</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.walkinsToday}</div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-slate-500/50 transition-all duration-300 shadow-sm hover:shadow-xl bg-card/50 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalPatients}</div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl bg-card/50 backdrop-blur-md bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Today</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary">
              ₦{stats.dailyRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer group" onClick={() => navigate('/admin/bookings')}>
          <CardHeader>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
              <BookOpen className="w-6 h-6 text-primary group-hover:text-white" />
            </div>
            <CardTitle className="mt-4">Patient Management</CardTitle>
            <CardDescription>View and manage all appointments</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer group" onClick={() => navigate('/admin/staff')}>
          <CardHeader>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
              <Shield className="w-6 h-6 text-amber-500 group-hover:text-white" />
            </div>
            <CardTitle className="mt-4">Staff & Roles</CardTitle>
            <CardDescription>Manage team roles and system access</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer group" onClick={() => navigate('/admin/analytics')}>
          <CardHeader>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
              <BarChart3 className="w-6 h-6 text-purple-500 group-hover:text-white" />
            </div>
            <CardTitle className="mt-4">Reports & Analytics</CardTitle>
            <CardDescription>Clinic performance, revenue, and stats</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer group" onClick={() => navigate('/admin/settings')}>
          <CardHeader>
            <div className="w-12 h-12 rounded-2xl bg-zinc-500/10 flex items-center justify-center group-hover:bg-zinc-500 transition-colors">
              <Settings2 className="w-6 h-6 text-zinc-500 group-hover:text-white" />
            </div>
            <CardTitle className="mt-4">System Settings</CardTitle>
            <CardDescription>Configure services, modules, & preferences</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};
