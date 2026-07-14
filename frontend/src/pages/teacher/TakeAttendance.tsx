import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { UserCheck, Calendar, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';

export const TakeAttendance: React.FC = () => {
  const [assigned, setAssigned] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Selection states
  const [selectedMapping, setSelectedMapping] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState<number>(1);

  // Records state
  const [records, setRecords] = useState<Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE'; remarks: string }>>({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const res = await api.get('/teachers/assigned-classes');
        setAssigned(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAssigned();
  }, []);

  // Fetch student roster when class changes
  const handleMappingChange = async (mappingId: string) => {
    setSelectedMapping(mappingId);
    setStudents([]);
    setRecords({});
    setMessage({ type: '', text: '' });

    if (!mappingId) return;

    const matched = assigned.find((a) => a.id === mappingId);
    if (!matched) return;

    try {
      // Find students belonging to this class
      // Let's filter students by classId
      const res = await api.get(`/admin/students`);
      const filtered = res.data.data.filter((s: any) => s.classId === matched.classId);
      setStudents(filtered);

      // Initialize all students as PRESENT
      const initialRecords: any = {};
      for (const s of filtered) {
        initialRecords[s.id] = { status: 'PRESENT', remarks: '' };
      }
      setRecords(initialRecords);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMapping) return;

    const matched = assigned.find((a) => a.id === selectedMapping);
    if (!matched) return;

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const formattedRecords = Object.entries(records).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      remarks: data.remarks || undefined,
    }));

    try {
      await api.post('/teachers/attendance', {
        classId: matched.classId,
        subjectId: matched.subjectId,
        date,
        periodNumber: Number(period),
        records: formattedRecords,
      });

      setMessage({ type: 'success', text: 'Attendance recorded successfully for this period!' });
      // Reset
      setStudents([]);
      setSelectedMapping('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error recording attendance.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Syncing schedule mappings...</div>;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Mark Attendance</h1>
        <p className="text-muted-foreground text-sm">Mark attendance records for your assigned student directories</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-2 border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-600'}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      {/* Select Setup */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Mapping (Class & Subject)</label>
              <select
                required
                value={selectedMapping}
                onChange={(e) => handleMappingChange(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg bg-background text-sm"
              >
                <option value="">Select subject and class...</option>
                {assigned.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.subject.name} - Sem {a.class.semester.number} ({a.class.section.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Period / Hour</label>
              <select
                required
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                className="w-full px-3 py-2.5 border rounded-lg bg-background text-sm"
              >
                {[...Array(8)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Period {i + 1}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Student list */}
          {students.length > 0 && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-bold text-lg mb-2">Student Roster ({students.length})</h3>
              
              <div className="space-y-3">
                {students.map((student) => {
                  const studentRecord = records[student.id] || { status: 'PRESENT', remarks: '' };
                  return (
                    <div key={student.id} className="p-4 border border-border rounded-xl bg-secondary/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="font-semibold block">{student.name}</span>
                        <span className="text-xs text-muted-foreground block">Reg No: {student.registerNumber}</span>
                      </div>

                      {/* Status selectors */}
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'PRESENT')}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${studentRecord.status === 'PRESENT' ? 'bg-emerald-600 text-white' : 'bg-background hover:bg-secondary text-muted-foreground border'}`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'ABSENT')}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${studentRecord.status === 'ABSENT' ? 'bg-rose-600 text-white' : 'bg-background hover:bg-secondary text-muted-foreground border'}`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'LATE')}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${studentRecord.status === 'LATE' ? 'bg-amber-500 text-white' : 'bg-background hover:bg-secondary text-muted-foreground border'}`}
                        >
                          Late
                        </button>
                        
                        <input
                          type="text"
                          placeholder="Add remarks..."
                          value={studentRecord.remarks}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          className="px-3 py-1.5 border rounded-lg bg-background text-xs w-48"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting marks...' : 'Submit Attendance'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
