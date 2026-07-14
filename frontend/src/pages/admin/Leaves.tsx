import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { CheckCircle, XCircle, FileText, User, Calendar, MessageSquare } from 'lucide-react';

export const Leaves: React.FC = () => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [remarks, setRemarks] = useState('');

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

  const handleAction = async (id: string, action: 'ADMIN_APPROVED' | 'REJECTED') => {
    try {
      await api.put(`/leaves/${id}/review`, { status: action, remarks });
      setSelectedLeave(null);
      setRemarks('');
      fetchLeaves();
      alert(`Leave request successfully updated.`);
    } catch (e) {
      alert('Error updating leave status');
    }
  };

  if (loading) return <div>Loading leave requests...</div>;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Leave Approvals</h1>
        <p className="text-muted-foreground text-sm">Review, approve, or reject student leave requests in the final validation stage</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Leaves List */}
        <div className="lg:col-span-2 space-y-4">
          {leaves.length === 0 ? (
            <div className="p-6 text-center border rounded-2xl bg-card text-muted-foreground">
              No leave requests found in the system.
            </div>
          ) : (
            leaves.map((leave) => (
              <div
                key={leave.id}
                onClick={() => { setSelectedLeave(leave); setRemarks(''); }}
                className={`p-5 border rounded-2xl bg-card shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col justify-between md:flex-row md:items-center ${selectedLeave?.id === leave.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{leave.student.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-secondary text-muted-foreground uppercase">
                      {leave.leaveType}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Register No: {leave.student.registerNumber}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                    <span className="flex items-center gap-1"><Calendar size={12} /> From: {new Date(leave.fromDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> To: {new Date(leave.toDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex items-center gap-3">
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

        {/* Right: Leave Review Panel */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm h-fit">
          <h3 className="font-bold text-lg mb-4">Review Details</h3>
          {selectedLeave ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Student</span>
                <span className="font-bold text-sm">{selectedLeave.student.name} ({selectedLeave.student.registerNumber})</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Reason</span>
                <p className="text-sm text-foreground bg-secondary/35 p-3 rounded-lg border mt-1 leading-relaxed">
                  {selectedLeave.reason}
                </p>
              </div>

              {selectedLeave.teacherRemarks && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Teacher Recommendation Remarks</span>
                  <p className="text-sm italic text-muted-foreground mt-1">
                    "{selectedLeave.teacherRemarks}"
                  </p>
                </div>
              )}

              {/* Action Form */}
              {selectedLeave.status === 'TEACHER_APPROVED' ? (
                <div className="space-y-3 pt-4 border-t">
                  <label className="text-xs font-semibold text-muted-foreground block">Admin Review Remarks</label>
                  <textarea
                    rows={3}
                    placeholder="Enter remarks for approval/rejection..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(selectedLeave.id, 'REJECTED')}
                      className="flex-1 py-2 rounded-lg border border-destructive text-destructive font-semibold hover:bg-destructive/5 flex items-center justify-center gap-1"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                    <button
                      onClick={() => handleAction(selectedLeave.id, 'ADMIN_APPROVED')}
                      className="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic border-t pt-4">
                  This leave request is currently {selectedLeave.status.toLowerCase()} and cannot be modified.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Select a leave request from the list to view its details and action workflow.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
