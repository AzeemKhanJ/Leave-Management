import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Compass, BookOpen, Clock } from 'lucide-react';

export const MyClasses: React.FC = () => {
  const [assigned, setAssigned] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Syncing schedule logs...</div>;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Classes</h1>
        <p className="text-muted-foreground text-sm">List of class sections and subjects you are currently assigned to teach</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assigned.map((item) => (
          <div key={item.id} className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Compass size={20} />
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                Active Assignment
              </span>
            </div>

            <div>
              <h3 className="font-bold text-lg text-foreground">{item.subject.name}</h3>
              <span className="text-xs font-mono text-muted-foreground uppercase">{item.subject.code}</span>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Department</span>
                <span className="font-semibold">{item.class.department.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Semester</span>
                <span className="font-semibold">Semester {item.class.semester.number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Section</span>
                <span className="font-semibold">Section {item.class.section.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
