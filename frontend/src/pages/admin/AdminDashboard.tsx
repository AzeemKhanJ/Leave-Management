import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { EmptyState } from '../../components/EmptyState';
import {
  Users,
  Building2,
  GraduationCap,
  Percent,
  FileCheck2,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const statsRes = await api.get('/admin/stats');
      const analyticsRes = await api.get('/attendance/analytics');
      setStats(statsRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-card border rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Check if database is empty
  const isEmpty = !stats || (stats.students === 0 && stats.teachers === 0 && stats.departments === 0);

  if (isEmpty) {
    return (
      <div className="py-12">
        <EmptyState
          title="Welcome to your AI Attendance ERP Dashboard"
          description="The system is currently empty. Get started by creating academic structures (Departments, Semesters, Sections, Classes, Subjects) and registering Teachers and Students. Once data exists, real-time analytics will automatically appear here."
          actionLabel="Go to Departments"
          onAction={() => window.location.href = '/admin/departments'}
        />
      </div>
    );
  }

  // Color palette for charts
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">System Analytics</h1>
        <p className="text-muted-foreground text-sm">Real-time overview of college attendance rates and operations</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <GraduationCap size={24} />
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Total Students</span>
            <h3 className="text-2xl font-bold">{stats.students}</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Users size={24} />
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Faculty Members</span>
            <h3 className="text-2xl font-bold">{stats.teachers}</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Building2 size={24} />
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Departments</span>
            <h3 className="text-2xl font-bold">{stats.departments}</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Percent size={24} />
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Attendance Rate</span>
            <h3 className="text-2xl font-bold">{stats.attendancePercentage}%</h3>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dept Comparison Chart */}
          {analytics.departmentComparison && analytics.departmentComparison.length > 0 && (
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
              <h4 className="font-bold mb-4">Department Attendance Rate</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.departmentComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="code" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="attendanceRate" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {analytics.departmentComparison.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Class Comparison Chart */}
          {analytics.classComparison && analytics.classComparison.length > 0 && (
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
              <h4 className="font-bold mb-4">Class Performance Comparison</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.classComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="attendanceRate" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Heatmap/Weekly rate */}
          {analytics.heatmap && analytics.heatmap.length > 0 && (
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
              <h4 className="font-bold mb-4">Weekly Attendance Heatmap</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.heatmap}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="attendanceRate" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Monthly trends */}
          {analytics.monthlyTrends && analytics.monthlyTrends.length > 0 && (
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
              <h4 className="font-bold mb-4">6-Month Presence Trend</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="attendanceRate" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
