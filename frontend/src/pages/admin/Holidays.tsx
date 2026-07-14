import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { CalendarDays, Trash2, Import, Plus } from 'lucide-react';

export const Holidays: React.FC = () => {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    name: '',
    date: '',
    type: 'GOVERNMENT' as 'GOVERNMENT' | 'COLLEGE',
    isWorkingDay: false,
  });

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await api.get('/holidays');
      setHolidays(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/holidays', form);
      setForm({ name: '', date: '', type: 'GOVERNMENT', isWorkingDay: false });
      fetchHolidays();
    } catch (e) {
      alert('Error creating holiday');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;
    try {
      await api.delete(`/holidays/${id}`);
      fetchHolidays();
    } catch (e) {
      alert('Error deleting holiday');
    }
  };

  // Pre-configured Tamil Nadu Government Holidays Import
  const handleImportTNHolidays = async () => {
    const currentYear = new Date().getFullYear();
    const tnHolidays = [
      { name: 'New Year Day', date: `${currentYear}-01-01`, type: 'GOVERNMENT' },
      { name: 'Pongal', date: `${currentYear}-01-14`, type: 'GOVERNMENT' },
      { name: 'Thiruvalluvar Day', date: `${currentYear}-01-15`, type: 'GOVERNMENT' },
      { name: 'Uzhavar Thirunal', date: `${currentYear}-01-16`, type: 'GOVERNMENT' },
      { name: 'Republic Day', date: `${currentYear}-01-26`, type: 'GOVERNMENT' },
      { name: 'Good Friday', date: `${currentYear}-04-03`, type: 'GOVERNMENT' }, // approximate
      { name: 'Tamil New Year / Dr. Ambedkar Birthday', date: `${currentYear}-04-14`, type: 'GOVERNMENT' },
      { name: 'May Day', date: `${currentYear}-05-01`, type: 'GOVERNMENT' },
      { name: 'Bakrid', date: `${currentYear}-06-17`, type: 'GOVERNMENT' },
      { name: 'Independence Day', date: `${currentYear}-08-15`, type: 'GOVERNMENT' },
      { name: 'Krishna Jayanthi', date: `${currentYear}-08-26`, type: 'GOVERNMENT' },
      { name: 'Vinayakar Chathurthi', date: `${currentYear}-09-07`, type: 'GOVERNMENT' },
      { name: 'Milad-un-Nabi', date: `${currentYear}-09-16`, type: 'GOVERNMENT' },
      { name: 'Gandhi Jayanthi', date: `${currentYear}-10-02`, type: 'GOVERNMENT' },
      { name: 'Ayutha Pooja', date: `${currentYear}-10-11`, type: 'GOVERNMENT' },
      { name: 'Vijaya Dasami', date: `${currentYear}-10-12`, type: 'GOVERNMENT' },
      { name: 'Deepavali', date: `${currentYear}-10-31`, type: 'GOVERNMENT' },
      { name: 'Christmas', date: `${currentYear}-12-25`, type: 'GOVERNMENT' },
    ];

    try {
      for (const h of tnHolidays) {
        await api.post('/holidays', h);
      }
      fetchHolidays();
      alert('Tamil Nadu Government Holidays imported successfully!');
    } catch (e) {
      alert('Error importing holidays');
    }
  };

  if (loading) return <div>Loading academic calendar...</div>;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Holidays Calendar</h1>
          <p className="text-muted-foreground text-sm">Configure government holidays, college-specific holidays, and working days</p>
        </div>
        <button
          onClick={handleImportTNHolidays}
          className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-secondary font-semibold transition-all flex items-center gap-2"
        >
          <Import size={16} /> Import Tamil Nadu Govt Holidays
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Add form */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm h-fit">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Plus size={18} className="text-primary" />
            Add Holiday
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Holiday Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Pongal Festival"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="GOVERNMENT">Government Holiday</option>
                <option value="COLLEGE">College Holiday</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isWorkingDay"
                checked={form.isWorkingDay}
                onChange={(e) => setForm({ ...form, isWorkingDay: e.target.checked })}
              />
              <label htmlFor="isWorkingDay" className="text-sm font-semibold">Is Working Day?</label>
            </div>
            <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
              Save Calendar Holiday
            </button>
          </form>
        </div>

        {/* Right: Holidays list */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm lg:col-span-2 overflow-x-auto">
          <h3 className="font-bold text-lg mb-4">Academic & Govt Holidays</h3>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-3">Holiday Name</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Working Day?</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((h) => (
                <tr key={h.id} className="border-b last:border-b-0 hover:bg-secondary/40">
                  <td className="py-3 font-semibold">{h.name}</td>
                  <td className="py-3 font-medium">{new Date(h.date).toLocaleDateString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${h.type === 'GOVERNMENT' ? 'bg-blue-500/10 text-blue-600' : 'bg-indigo-500/10 text-indigo-600'}`}>
                      {h.type}
                    </span>
                  </td>
                  <td className="py-3">{h.isWorkingDay ? 'Yes' : 'No'}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => handleDelete(h.id)} className="text-destructive p-1 rounded-lg hover:bg-destructive/10">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
