import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { History, ShieldAlert, Monitor, Terminal } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filters, setFilters] = useState({
    username: '',
    role: '',
    actionType: '',
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `/admin/audit-logs?`;
      if (filters.username) url += `username=${filters.username}&`;
      if (filters.role) url += `role=${filters.role}&`;
      if (filters.actionType) url += `actionType=${filters.actionType}&`;

      const res = await api.get(url);
      setLogs(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Audit Trail Logs</h1>
        <p className="text-muted-foreground text-sm">Review full security audit records, system edits, user logins, and database operations</p>
      </div>

      {/* Filter panel */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">Search User</label>
          <input
            type="text"
            placeholder="e.g. admin or faculty..."
            value={filters.username}
            onChange={(e) => setFilters({ ...filters, username: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">Role Filter</label>
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="TEACHER">Teacher</option>
            <option value="STUDENT">Student</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">Activity Category</label>
          <select
            value={filters.actionType}
            onChange={(e) => setFilters({ ...filters, actionType: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none"
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Logins</option>
            <option value="USER_ACTIVITY">User Management</option>
            <option value="ATTENDANCE_ACTIVITY">Attendance Tracking</option>
            <option value="LEAVE_ACTIVITY">Leave Logs</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm overflow-x-auto">
        {loading ? (
          <div>Syncing logs history...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">No operations recorded matching filters.</div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">User</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Action</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Client details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b last:border-b-0 hover:bg-secondary/40">
                  <td className="py-3 font-mono text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 font-semibold text-foreground">{log.username}</td>
                  <td className="py-3 text-xs">
                    <span className="px-2 py-0.5 rounded bg-secondary font-semibold uppercase">{log.role}</span>
                  </td>
                  <td className="py-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      log.actionType === 'LOGIN' ? 'bg-emerald-500/10 text-emerald-600' :
                      log.actionType === 'USER_ACTIVITY' ? 'bg-purple-500/10 text-purple-600' :
                      log.actionType === 'ATTENDANCE_ACTIVITY' ? 'bg-blue-500/10 text-blue-600' :
                      'bg-orange-500/10 text-orange-600'
                    }`}>
                      {log.actionType}
                    </span>
                  </td>
                  <td className="py-3 text-xs leading-relaxed max-w-sm">{log.description}</td>
                  <td className="py-3 text-[10px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1"><Monitor size={10} /> IP: {log.ipAddress || '127.0.0.1'}</span>
                    <span className="flex items-center gap-1 mt-1 truncate max-w-[150px]" title={log.userAgent}><Terminal size={10} /> {log.userAgent || 'API client'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
