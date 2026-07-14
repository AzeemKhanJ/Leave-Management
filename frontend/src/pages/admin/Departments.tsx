import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Building2, CalendarDays, Compass, BookOpen, Layers } from 'lucide-react';

export const Departments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'depts' | 'years' | 'sems' | 'sections' | 'classes' | 'subjects'>('depts');
  const [loading, setLoading] = useState(true);

  // Lists
  const [depts, setDepts] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [sems, setSems] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  // Form states
  const [deptForm, setDeptForm] = useState({ name: '', code: '' });
  const [yearForm, setYearForm] = useState({ name: '', active: true });
  const [semForm, setSemForm] = useState({ number: 1, academicYearId: '', active: true });
  const [sectionForm, setSectionForm] = useState({ name: '' });
  const [classForm, setClassForm] = useState({ departmentId: '', semesterId: '', sectionId: '' });
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', departmentId: '', semesterId: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dRes, yRes, semRes, secRes, cRes, sRes] = await Promise.all([
        api.get('/admin/departments'),
        api.get('/admin/academic-years'),
        api.get('/admin/semesters'),
        api.get('/admin/sections'),
        api.get('/admin/classes'),
        api.get('/admin/subjects'),
      ]);
      setDepts(dRes.data.data);
      setYears(yRes.data.data);
      setSems(semRes.data.data);
      setSections(secRes.data.data);
      setClasses(cRes.data.data);
      setSubjects(sRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/departments', deptForm);
      setDeptForm({ name: '', code: '' });
      fetchData();
    } catch (e) {
      alert('Error creating department');
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.delete(`/admin/departments/${id}`);
      fetchData();
    } catch (e) {
      alert('Error deleting department');
    }
  };

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/academic-years', yearForm);
      setYearForm({ name: '', active: true });
      fetchData();
    } catch (e) {
      alert('Error creating academic year');
    }
  };

  const handleDeleteYear = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/academic-years/${id}`);
      fetchData();
    } catch (e) {
      alert('Error deleting academic year');
    }
  };

  const handleCreateSem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/semesters', { ...semForm, number: Number(semForm.number) });
      setSemForm({ number: 1, academicYearId: '', active: true });
      fetchData();
    } catch (e) {
      alert('Error creating semester');
    }
  };

  const handleDeleteSem = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/semesters/${id}`);
      fetchData();
    } catch (e) {
      alert('Error deleting semester');
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/sections', sectionForm);
      setSectionForm({ name: '' });
      fetchData();
    } catch (e) {
      alert('Error creating section');
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/sections/${id}`);
      fetchData();
    } catch (e) {
      alert('Error deleting section');
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/classes', classForm);
      setClassForm({ departmentId: '', semesterId: '', sectionId: '' });
      fetchData();
    } catch (e) {
      alert('Error: Class mapping already exists or is invalid');
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/classes/${id}`);
      fetchData();
    } catch (e) {
      alert('Error deleting class');
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/subjects', subjectForm);
      setSubjectForm({ name: '', code: '', departmentId: '', semesterId: '' });
      fetchData();
    } catch (e) {
      alert('Error creating subject');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/subjects/${id}`);
      fetchData();
    } catch (e) {
      alert('Error deleting subject');
    }
  };

  if (loading) return <div>Loading configurations...</div>;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Academic Structure</h1>
        <p className="text-muted-foreground text-sm">Configure departments, years, semesters, classes, and subjects</p>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-border overflow-x-auto pb-px gap-2">
        {[
          { id: 'depts', name: 'Departments', icon: Building2 },
          { id: 'years', name: 'Academic Years', icon: CalendarDays },
          { id: 'sems', name: 'Semesters', icon: Layers },
          { id: 'sections', name: 'Sections', icon: Compass },
          { id: 'classes', name: 'Classes (Junction)', icon: Compass },
          { id: 'subjects', name: 'Subjects', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={16} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Create Form */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm h-fit">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Plus size={18} className="text-primary" />
            Add New Record
          </h3>

          {activeTab === 'depts' && (
            <form onSubmit={handleCreateDept} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science and Engineering"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none"
                />
              </div>
              <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
                Save Department
              </button>
            </form>
          )}

          {activeTab === 'years' && (
            <form onSubmit={handleCreateYear} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Academic Year</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2025-2026"
                  value={yearForm.name}
                  onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="yearActive"
                  checked={yearForm.active}
                  onChange={(e) => setYearForm({ ...yearForm, active: e.target.checked })}
                />
                <label htmlFor="yearActive" className="text-sm font-semibold">Set as Active Year</label>
              </div>
              <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
                Save Academic Year
              </button>
            </form>
          )}

          {activeTab === 'sems' && (
            <form onSubmit={handleCreateSem} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Semester Number</label>
                <select
                  value={semForm.number}
                  onChange={(e) => setSemForm({ ...semForm, number: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none"
                >
                  {[...Array(8)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Academic Year</label>
                <select
                  required
                  value={semForm.academicYearId}
                  onChange={(e) => setSemForm({ ...semForm, academicYearId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none"
                >
                  <option value="">Select Year...</option>
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="semActive"
                  checked={semForm.active}
                  onChange={(e) => setSemForm({ ...semForm, active: e.target.checked })}
                />
                <label htmlFor="semActive" className="text-sm font-semibold">Set as Active Semester</label>
              </div>
              <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
                Save Semester
              </button>
            </form>
          )}

          {activeTab === 'sections' && (
            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Section Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A, B, or C"
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm({ name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none"
                />
              </div>
              <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
                Save Section
              </button>
            </form>
          )}

          {activeTab === 'classes' && (
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Department</label>
                <select
                  required
                  value={classForm.departmentId}
                  onChange={(e) => setClassForm({ ...classForm, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none"
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
                  value={classForm.semesterId}
                  onChange={(e) => setClassForm({ ...classForm, semesterId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none"
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
                  value={classForm.sectionId}
                  onChange={(e) => setClassForm({ ...classForm, sectionId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none"
                >
                  <option value="">Select Section...</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
                Create Class Mapping
              </button>
            </form>
          )}

          {activeTab === 'subjects' && (
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS8601"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Department</label>
                <select
                  required
                  value={subjectForm.departmentId}
                  onChange={(e) => setSubjectForm({ ...subjectForm, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none"
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
                  value={subjectForm.semesterId}
                  onChange={(e) => setSubjectForm({ ...subjectForm, semesterId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none"
                >
                  <option value="">Select Semester...</option>
                  {sems.map((s) => (
                    <option key={s.id} value={s.id}>Sem {s.number} ({s.academicYear.name})</option>
                  ))}
                </select>
              </div>
              <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
                Save Subject
              </button>
            </form>
          )}
        </div>

        {/* Right Side: Data List */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm lg:col-span-2 overflow-x-auto">
          <h3 className="font-bold text-lg mb-4">Configurations List</h3>

          {activeTab === 'depts' && (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b text-muted-foreground font-semibold">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Code</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {depts.map((dept) => (
                  <tr key={dept.id} className="border-b last:border-b-0 hover:bg-secondary/40 transition-all">
                    <td className="py-3 font-medium">{dept.name}</td>
                    <td className="py-3 uppercase text-primary font-semibold">{dept.code}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDeleteDept(dept.id)} className="text-destructive p-1 rounded-lg hover:bg-destructive/10">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'years' && (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b text-muted-foreground font-semibold">
                  <th className="pb-3">Academic Year</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {years.map((y) => (
                  <tr key={y.id} className="border-b last:border-b-0 hover:bg-secondary/40 transition-all">
                    <td className="py-3 font-semibold">{y.name}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${y.active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground'}`}>
                        {y.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDeleteYear(y.id)} className="text-destructive p-1 rounded-lg hover:bg-destructive/10">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'sems' && (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b text-muted-foreground font-semibold">
                  <th className="pb-3">Semester</th>
                  <th className="pb-3">Academic Year</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sems.map((s) => (
                  <tr key={s.id} className="border-b last:border-b-0 hover:bg-secondary/40 transition-all">
                    <td className="py-3 font-semibold">Semester {s.number}</td>
                    <td className="py-3">{s.academicYear.name}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${s.active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground'}`}>
                        {s.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDeleteSem(s.id)} className="text-destructive p-1 rounded-lg hover:bg-destructive/10">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'sections' && (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b text-muted-foreground font-semibold">
                  <th className="pb-3">Name</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((sec) => (
                  <tr key={sec.id} className="border-b last:border-b-0 hover:bg-secondary/40 transition-all">
                    <td className="py-3 font-semibold">Section {sec.name}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDeleteSection(sec.id)} className="text-destructive p-1 rounded-lg hover:bg-destructive/10">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'classes' && (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b text-muted-foreground font-semibold">
                  <th className="pb-3">Class Description</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Semester & Sec</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls.id} className="border-b last:border-b-0 hover:bg-secondary/40 transition-all">
                    <td className="py-3 font-semibold">{cls.department.code} - Sem {cls.semester.number} - Sec {cls.section.name}</td>
                    <td className="py-3 text-muted-foreground">{cls.department.name}</td>
                    <td className="py-3">Sem {cls.semester.number} ({cls.section.name})</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDeleteClass(cls.id)} className="text-destructive p-1 rounded-lg hover:bg-destructive/10">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'subjects' && (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b text-muted-foreground font-semibold">
                  <th className="pb-3">Subject Name</th>
                  <th className="pb-3">Code</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub) => (
                  <tr key={sub.id} className="border-b last:border-b-0 hover:bg-secondary/40 transition-all">
                    <td className="py-3 font-semibold">{sub.name}</td>
                    <td className="py-3 font-mono text-primary uppercase">{sub.code}</td>
                    <td className="py-3 text-muted-foreground">{sub.department.name}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDeleteSubject(sub.id)} className="text-destructive p-1 rounded-lg hover:bg-destructive/10">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
