import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { EmptyState } from '../../components/EmptyState';
import { Compass, FileCheck2, Percent, Users, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const TeacherDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/teachers/stats');
        setStats(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Syncing Teacher console...</div>;

  const isEmpty = !stats || stats.classesAssigned === 0;

  if (isEmpty) {
    return (
      <div className="py-12">
        <EmptyState
          title="No Classes Assigned Yet"
          description="You are currently not mapped to any subjects or classes. Please contact the college Admin to map your faculty account to subjects and sections. Once mapped, you will be able to take attendance, review leaves, and check analytics here."
        />
      </div>
    );
  }

  // Pre-formatted chart data mock-fallback or dynamic from real logs
  const dailyTrends = stats.todayTotal > 0 ? [
    { name: 'Present', count: stats.todayPresent },
    { name: 'Absent', count: stats.todayAbsent }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Faculty Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of your assigned sections, period markings, and pending approvals</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Compass size={24} />
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">My Classes</span>
            <h3 className="text-2xl font-bold">{stats.classesAssigned}</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <FileCheck2 size={24} />
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Today Marking Count</span>
            <h3 className="text-2xl font-bold">{stats.todayTotal}</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Percent size={24} />
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Present Ratio</span>
            <h3 className="text-2xl font-bold">
              {stats.todayTotal === 0 ? 0 : Math.round((stats.todayPresent / stats.todayTotal) * 100)}%
            </h3>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <FileCheck2 size={24} />
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Pending Leaves</span>
            <h3 className="text-2xl font-bold">{stats.pendingLeaves}</h3>
          </div>
        </div>
      </div>

      {/* Daily marks chart */}
      {dailyTrends.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-lg mb-4">Today's Attendance Ratio</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
