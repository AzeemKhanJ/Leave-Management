import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Key, UserCheck, Mail, Phone, Bookmark } from 'lucide-react';

export const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    departmentId: '',
  });

  const [assignForm, setAssignForm] = useState({
    teacherId: '',
    classId: '',
    subjectId: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, dRes, cRes, subRes, aRes] = await Promise.all([
        api.get('/admin/teachers'),
        api.get('/admin/departments'),
        api.get('/admin/classes'),
        api.get('/admin/subjects'),
        api.get('/admin/assignments'),
      ]);
      setTeachers(tRes.data.data);
      setDepts(dRes.data.data);
      setClasses(cRes.data.data);
      setSubjects(subRes.data.data);
      setAssignments(aRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/teachers', form);
      setShowAddForm(false);
      setForm({
        username: '',
        password: '',
        employeeId: '',
        name: '',
        email: '',
        phone: '',
        departmentId: '',
      });
      fetchData();
    } catch (e) {
      alert('Error creating teacher. Ensure username or employee ID is unique.');
    }
  };

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/assignments', assignForm);
      setShowAssignForm(false);
      setAssignForm({ teacherId: '', classId: '', subjectId: '' });
      fetchData();
    } catch (e) {
      alert('Assignment already exists or parameters are invalid');
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher? This will also remove their user account.')) return;
    try {
      await api.delete(`/admin/teachers/${id}`);
      fetchData();
    } catch (e) {
      alert('Error deleting teacher');
    }
  };

  const handleRemoveAssignment = async (id: string) => {
    if (!confirm('Remove this class/subject assignment?')) return;
    try {
      await api.delete(`/admin/assignments/${id}`);
      fetchData();
    } catch (e) {
      alert('Error removing assignment');
    }
  };

  const handleResetPassword = async (id: string) => {
    const newPassword = prompt('Enter new password (min 6 characters):');
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert('Password too short!');
      return;
    }
    try {
      await api.post(`/admin/teachers/${id}/reset-password`, { newPassword });
      alert('Password reset successfully!');
    } catch (e) {
      alert('Error resetting password');
    }
  };

  if (loading) return <div>Loading faculty members...</div>;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Faculty Management</h1>
          <p className="text-muted-foreground text-sm">Add teachers and assign them to classes and subjects</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAssignForm(!showAssignForm)}
            className="px-4 py-2 rounded-lg border border-border bg-card text-foreground font-semibold hover:bg-secondary transition-all"
          >
            Assign Class/Subject
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/95 shadow-md transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Add Teacher
          </button>
        </div>
      </div>

      {/* Forms Drawer overlay simulation */}
      {showAddForm && (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-md max-w-xl">
          <h3 className="font-bold text-lg mb-4">Register New Teacher</h3>
          <form onSubmit={handleCreateTeacher} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Username</label>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Employee ID / Code</label>
              <input
                type="text"
                required
                placeholder="e.g. T1001"
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Ramesh Kumar"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="ramesh@college.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Phone (Optional)</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Department</label>
              <select
                required
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">Select Department...</option>
                {depts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-secondary"
              >
                Cancel
              </button>
              <button className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold">
                Register Account
              </button>
            </div>
          </form>
        </div>
      )}

      {showAssignForm && (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-md max-w-xl">
          <h3 className="font-bold text-lg mb-4">Assign Teacher to Class & Subject</h3>
          <form onSubmit={handleAssignTeacher} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Teacher</label>
              <select
                required
                value={assignForm.teacherId}
                onChange={(e) => setAssignForm({ ...assignForm, teacherId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">Choose Faculty...</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.employeeId})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Class</label>
              <select
                required
                value={assignForm.classId}
                onChange={(e) => setAssignForm({ ...assignForm, classId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">Choose Class...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.department.code} - Sem {c.semester.number} - Sec {c.section.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Subject</label>
              <select
                required
                value={assignForm.subjectId}
                onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">Choose Subject...</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowAssignForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-secondary"
              >
                Cancel
              </button>
              <button className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold">
                Map Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid Panels split between Faculty List and Mapping Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-sm overflow-x-auto">
          <h3 className="font-bold text-lg mb-4">Faculty Registry</h3>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-3">Employee ID</th>
                <th className="pb-3">Name</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="border-b last:border-b-0 hover:bg-secondary/40">
                  <td className="py-3 font-mono font-bold text-primary">{t.employeeId}</td>
                  <td className="py-3 font-semibold">{t.name}</td>
                  <td className="py-3">{t.department.code}</td>
                  <td className="py-3 text-xs">
                    <span className="flex items-center gap-1"><Mail size={12} /> {t.email}</span>
                    {t.phone && <span className="flex items-center gap-1 mt-1 text-muted-foreground"><Phone size={12} /> {t.phone}</span>}
                  </td>
                  <td className="py-3 text-right space-x-1">
                    <button onClick={() => handleResetPassword(t.id)} title="Reset Password" className="text-amber-500 p-1.5 rounded-lg hover:bg-amber-500/10">
                      <Key size={16} />
                    </button>
                    <button onClick={() => handleDeleteTeacher(t.id)} title="Delete Teacher" className="text-destructive p-1.5 rounded-lg hover:bg-destructive/10">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right side: class mappings */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm overflow-x-auto">
          <h3 className="font-bold text-lg mb-4">Class/Subject Assignments</h3>
          <div className="space-y-3">
            {assignments.map((a) => (
              <div key={a.id} className="p-3 border border-border rounded-xl bg-secondary/20 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-foreground">{a.teacher.name}</h4>
                  <p className="text-xs text-primary font-semibold mt-1">
                    {a.class.department.code} - Sem {a.class.semester.number} - Sec {a.class.section.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{a.subject.name} ({a.subject.code})</p>
                </div>
                <button onClick={() => handleRemoveAssignment(a.id)} className="text-destructive p-1.5 rounded-lg hover:bg-destructive/10">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
