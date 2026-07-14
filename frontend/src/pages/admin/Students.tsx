import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Key, Mail, Phone, GraduationCap } from 'lucide-react';

export const Students: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sems, setSems] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    registerNumber: '',
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    classId: '',
    semesterId: '',
    sectionId: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, dRes, cRes, semRes, secRes] = await Promise.all([
        api.get('/admin/students'),
        api.get('/admin/departments'),
        api.get('/admin/classes'),
        api.get('/admin/semesters'),
        api.get('/admin/sections'),
      ]);
      setStudents(sRes.data.data);
      setDepts(dRes.data.data);
      setClasses(cRes.data.data);
      setSems(semRes.data.data);
      setSections(secRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/students', form);
      setShowAddForm(false);
      setForm({
        username: '',
        password: '',
        registerNumber: '',
        name: '',
        email: '',
        phone: '',
        departmentId: '',
        classId: '',
        semesterId: '',
        sectionId: '',
      });
      fetchData();
    } catch (e) {
      alert('Error creating student. Ensure register number or username is unique.');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student? This will also remove their user account.')) return;
    try {
      await api.delete(`/admin/students/${id}`);
      fetchData();
    } catch (e) {
      alert('Error deleting student');
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
      await api.post(`/admin/students/${id}/reset-password`, { newPassword });
      alert('Password reset successfully!');
    } catch (e) {
      alert('Error resetting password');
    }
  };

  if (loading) return <div>Loading registry...</div>;
console.log(students);
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground text-sm">Add students, map classes, and manage student accounts</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/95 shadow-md transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Add Student
        </button>
      </div>

      {/* Form Drawer Overlay */}
      {showAddForm && (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-md max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Register New Student</h3>
          <form onSubmit={handleCreateStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Register Number</label>
              <input
                type="text"
                required
                placeholder="e.g. 211421104001"
                value={form.registerNumber}
                onChange={(e) => setForm({ ...form, registerNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Anand R"
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
                placeholder="anand@college.edu"
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
            <div>
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
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Semester</label>
              <select
                required
                value={form.semesterId}
                onChange={(e) => setForm({ ...form, semesterId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">Select Semester...</option>
                {sems.map((s) => (
                  <option key={s.id} value={s.id}>Sem {s.number} ({s.academicYear.name})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Section</label>
              <select
                required
                value={form.sectionId}
                onChange={(e) => setForm({ ...form, sectionId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">Select Section...</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Class Mapping Junction</label>
              <select
                required
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">Select Class...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.department.code} - Sem {c.semester.number} - Sec {c.section.name}
                  </option>
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
                Register Student
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Student Registry Table */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm overflow-x-auto">
        <h3 className="font-bold text-lg mb-4">Student Registry</h3>
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="pb-3">Register Number</th>
              <th className="pb-3">Name</th>
              <th className="pb-3">Department</th>
              <th className="pb-3">Class</th>
              <th className="pb-3">Contact</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b last:border-b-0 hover:bg-secondary/40">
                <td className="py-3 font-mono font-bold text-primary">{s.registerNumber}</td>
                <td className="py-3 font-semibold">{s.name}</td>
                <td className="py-3">
  {s.class?.department?.code ?? "N/A"}
</td>

<td className="py-3 text-xs">
  {s.class
    ? `${s.class.department?.code ?? "N/A"} Sem ${s.class.semester?.number ?? "-"} (${s.class.section?.name ?? "-"})`
    : "No Class Assigned"}
</td>
                <td className="py-3 text-xs">
                  <span className="flex items-center gap-1"><Mail size={12} /> {s.email}</span>
                  {s.phone && <span className="flex items-center gap-1 mt-1 text-muted-foreground"><Phone size={12} /> {s.phone}</span>}
                </td>
                <td className="py-3 text-right space-x-1">
                  <button onClick={() => handleResetPassword(s.id)} title="Reset Password" className="text-amber-500 p-1.5 rounded-lg hover:bg-amber-500/10">
                    <Key size={16} />
                  </button>
                  <button onClick={() => handleDeleteStudent(s.id)} title="Delete Student" className="text-destructive p-1.5 rounded-lg hover:bg-destructive/10">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
