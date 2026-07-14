import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search, GraduationCap, Percent, Mail } from 'lucide-react';

export const Students: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/teachers/students/search?q=${query}`);
      setStudents(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [query]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Student Directory</h1>
        <p className="text-muted-foreground text-sm">View student details and check general records for class sections you instruct</p>
      </div>

      {/* Search Filter */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex items-center gap-3 max-w-md">
        <Search size={18} className="text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or register number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent text-sm focus:outline-none"
        />
      </div>

      {/* Student List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div>Syncing student list...</div>
        ) : students.length === 0 ? (
          <div className="col-span-full py-8 text-center text-muted-foreground">No students found.</div>
        ) : (
          students.map((student) => (
            <div key={student.id} className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg text-foreground">{student.name}</h4>
                  <span className="text-xs font-mono text-muted-foreground">Reg No: {student.registerNumber}</span>
                </div>
                <div className="h-10 w-10 bg-primary/15 text-primary rounded-xl flex items-center justify-center">
                  <GraduationCap size={20} />
                </div>
              </div>

              <div className="border-t border-border pt-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Class</span>
                  <span className="font-semibold text-foreground">
                    {student.class.department.code} - Sem {student.class.semester.number} ({student.class.section.name})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-semibold text-foreground flex items-center gap-1"><Mail size={12} /> {student.email}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
