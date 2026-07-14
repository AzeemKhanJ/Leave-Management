import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Calendar } from '../../components/Calendar';
import { EmptyState } from '../../components/EmptyState';
import { Percent, CheckSquare, XSquare, CalendarDays, FileCheck2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const dashboardRes = await api.get('/students/dashboard');
        const holidaysRes = await api.get('/holidays');
        setData(dashboardRes.data.data);
        setHolidays(holidaysRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div>Syncing Student records...</div>;

  const summary = data?.summary;
  const isEmpty = !summary || summary.totalDays === 0;

  if (isEmpty) {
    return (
      <div className="py-12">
        <EmptyState
          title="No Attendance Data Conducted"
          description="Your class has not had any attendance periods recorded by faculty members yet. Once your teachers submit attendance logs for subjects, your attendance percentage, subject summaries, and calendar will appear here automatically."
        />
      </div>
    );
  }

  // Build calendar events list dynamically
  const calendarEvents: any[] = [];
  
  // Add attendance records
  if (data.attendanceRecords) {
    data.attendanceRecords.forEach((r: any) => {
      calendarEvents.push({
        date: r.date.split('T')[0],
        status: r.status, // "PRESENT", "ABSENT", "LATE"
      });
    });
  }

  // Add leaves
  if (data.leaveRequests) {
    data.leaveRequests.forEach((lr: any) => {
      // Loop between fromDate and toDate
      const start = new Date(lr.fromDate);
      const end = new Date(lr.toDate);
      const loop = new Date(start);
      while (loop <= end) {
        calendarEvents.push({
          date: loop.toISOString().split('T')[0],
          status: lr.status === 'APPROVED' ? 'LEAVE_APPROVED' : 'LEAVE_PENDING',
        });
        loop.setDate(loop.getDate() + 1);
      }
    });
  }

  // Add holidays
  holidays.forEach((h: any) => {
    calendarEvents.push({
      date: h.date.split('T')[0],
      status: h.type === 'GOVERNMENT' ? 'HOLIDAY_GOVT' : 'HOLIDAY_COLLEGE',
      label: h.name,
    });
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Student Portal</h1>
        <p className="text-muted-foreground text-sm">Real-time attendance summaries, subject indicators, and leave tracking</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Percent size={24} />
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">My Attendance Rate</span>
            <h3 className="text-2xl font-bold">{summary.percentage}%</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckSquare size={24} />
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Present Classes</span>
            <h3 className="text-2xl font-bold">{summary.presentDays} conducts</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <XSquare size={24} />
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Absent Classes</span>
            <h3 className="text-2xl font-bold">{summary.absentDays} conducts</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <FileCheck2 size={24} />
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Leaves Approved</span>
            <h3 className="text-2xl font-bold">
              {data.leaveRequests?.filter((l: any) => l.status === 'APPROVED').length || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Grid: Subject wise list & Monthly Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Subject Wise Attendance */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm h-fit">
          <h3 className="font-bold text-lg mb-4">Subject Wise Attendance</h3>
          
          <div className="space-y-4">
            {data.subjectWiseAttendance.map((subj: any) => (
              <div key={subj.subjectId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="font-semibold text-foreground block">{subj.name}</span>
                    <span className="text-xs text-muted-foreground font-mono uppercase">{subj.code}</span>
                  </div>
                  <span className="font-bold text-primary">{subj.percentage}%</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${subj.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${subj.percentage}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground block text-right">
                  {subj.present}/{subj.total} periods attended
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Calendar */}
        <div className="lg:col-span-2">
          <Calendar events={calendarEvents} />
        </div>
      </div>
    </div>
  );
};
