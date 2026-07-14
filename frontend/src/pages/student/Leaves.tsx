import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Calendar, FileText, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

export const Leaves: React.FC = () => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);

  const [form, setForm] = useState({
    fromDate: '',
    toDate: '',
    reason: '',
    leaveType: 'MEDICAL' as 'MEDICAL' | 'PERSONAL' | 'ON_DUTY' | 'EMERGENCY' | 'OTHERS',
    attachmentUrl: '',
  });

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaves');
      setLeaves(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/leaves', form);
      setShowApplyForm(false);
      setForm({
        fromDate: '',
        toDate: '',
        reason: '',
        leaveType: 'MEDICAL',
        attachmentUrl: '',
      });
      fetchLeaves();
      alert('Leave request submitted. Moving to progressive approvals.');
    } catch (e) {
      alert('Error submitting leave request');
    }
  };

  if (loading) return <div>Loading leaves...</div>;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Leave Log & Apply</h1>
          <p className="text-muted-foreground text-sm">Apply for leave, track active workflows, and read comments from reviewers</p>
        </div>
        <button
          onClick={() => setShowApplyForm(!showApplyForm)}
          className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/95 shadow-md transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Apply Leave
        </button>
      </div>

      {showApplyForm && (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-md max-w-xl">
          <h3 className="font-bold text-lg mb-4">Submit Leave Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">From Date</label>
                <input
                  type="date"
                  required
                  value={form.fromDate}
                  onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">To Date</label>
                <input
                  type="date"
                  required
                  value={form.toDate}
                  onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Leave Category</label>
              <select
                value={form.leaveType}
                onChange={(e) => setForm({ ...form, leaveType: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="MEDICAL">Medical Leave</option>
                <option value="PERSONAL">Personal Leave</option>
                <option value="ON_DUTY">On Duty (OD)</option>
                <option value="EMERGENCY">Emergency Leave</option>
                <option value="OTHERS">Others</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Reason Description</label>
              <textarea
                required
                rows={3}
                placeholder="Explain the detailed reason for taking leave..."
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowApplyForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-secondary"
              >
                Cancel
              </button>
              <button className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold">
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid splits leaves lists and details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {leaves.length === 0 ? (
            <div className="p-6 text-center border rounded-2xl bg-card text-muted-foreground">
              No leave requests found.
            </div>
          ) : (
            leaves.map((leave) => (
              <div
                key={leave.id}
                onClick={() => setSelectedLeave(leave)}
                className={`p-5 border rounded-2xl bg-card shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col justify-between md:flex-row md:items-center ${selectedLeave?.id === leave.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wider text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                      {leave.leaveType}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      Applied: {new Date(leave.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm leading-relaxed truncate max-w-md">{leave.reason}</h4>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                    <span className="flex items-center gap-1"><Calendar size={12} /> From: {new Date(leave.fromDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> To: {new Date(leave.toDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                    leave.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' :
                    leave.status === 'TEACHER_APPROVED' ? 'bg-blue-500/10 text-blue-600' :
                    leave.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-600' :
                    'bg-rose-500/10 text-rose-600'
                  }`}>
                    {leave.status === 'TEACHER_APPROVED' ? 'Teacher Approved (Pending Admin)' : leave.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Details Panel */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm h-fit">
          <h3 className="font-bold text-lg mb-4">Workflow Audit</h3>
          {selectedLeave ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Leave Type</span>
                <span className="font-bold text-sm">{selectedLeave.leaveType}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Duration</span>
                <span className="text-sm font-semibold">
                  {new Date(selectedLeave.fromDate).toLocaleDateString()} - {new Date(selectedLeave.toDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">My Reason</span>
                <p className="text-sm text-foreground bg-secondary/35 p-3 rounded-lg border mt-1 leading-relaxed">
                  {selectedLeave.reason}
                </p>
              </div>

              {/* Review logs list */}
              <div className="border-t pt-4 space-y-3">
                <span className="text-xs font-bold text-foreground block">Workflow Path Log</span>
                {selectedLeave.workflowLogs?.map((log: any, idx: number) => (
                  <div key={idx} className="flex gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
                    <div>
                      <span className="font-semibold block">{log.status}</span>
                      <span className="text-muted-foreground leading-relaxed">"{log.remarks || 'No comments'}"</span>
                      <span className="text-[10px] text-muted-foreground/60 block mt-0.5">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Select a submitted leave request from the list to audit its workflow trajectory and read comments.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
