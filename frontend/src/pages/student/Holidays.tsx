import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { CalendarDays, Calendar } from 'lucide-react';

export const Holidays: React.FC = () => {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await api.get('/holidays');
        setHolidays(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHolidays();
  }, []);

  if (loading) return <div>Syncing academic calendar...</div>;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Holiday Calendar</h1>
        <p className="text-muted-foreground text-sm">Official government holidays, college holidays, and scheduled days off</p>
      </div>

      {/* Holidays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {holidays.length === 0 ? (
          <div className="col-span-full text-center py-6 text-muted-foreground">
            No holidays registered in the calendar yet.
          </div>
        ) : (
          holidays.map((h) => (
            <div key={h.id} className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-all">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">{h.name}</h3>
                <span className="text-xs text-primary font-semibold flex items-center gap-1">
                  <Calendar size={12} /> {new Date(h.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase ${h.type === 'GOVERNMENT' ? 'bg-blue-500/10 text-blue-600' : 'bg-indigo-500/10 text-indigo-600'}`}>
                {h.type}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
