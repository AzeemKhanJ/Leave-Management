import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FileDown, FileText, Sparkles, Filter } from 'lucide-react';

export const Reports: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<'attendance' | 'leaves' | 'students' | 'teachers'>('attendance');
  
  // Filter states
  const [filters, setFilters] = useState({
    classId: '',
    status: '',
  });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/admin/classes');
        setClasses(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const handleDownload = (format: 'pdf' | 'excel' | 'csv') => {
    let url = `/reports/${reportType}?format=${format}`;
    if (reportType === 'attendance' && filters.classId) {
      url += `&classId=${filters.classId}`;
    }
    if (reportType === 'leaves' && filters.status) {
      url += `&status=${filters.status}`;
    }

    // Trigger browser download
    const link = document.createElement('a');
    link.href = `/api${url}`;
    link.setAttribute('download', `${reportType}_report.${format === 'excel' ? 'xlsx' : format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Reports & Registry Exports</h1>
        <p className="text-muted-foreground text-sm">Download official PDF certificates, Excel worksheets, or raw CSV sheets of your logs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Configuration Form */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6 h-fit">
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Filter size={18} className="text-primary" />
              Configure Report
            </h3>
            
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Report Category</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none"
            >
              <option value="attendance">Attendance Ledger Log</option>
              <option value="leaves">Leave Requests Registry</option>
              <option value="students">Student Registry</option>
              <option value="teachers">Faculty Registry</option>
            </select>
          </div>

          {/* Conditional Filters */}
          {reportType === 'attendance' && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Class Filter (Optional)</label>
              <select
                value={filters.classId}
                onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none text-sm"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.department.code} - Sem {c.semester.number} - Sec {c.section.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'leaves' && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Status Filter (Optional)</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none text-sm"
              >
                <option value="">All Leaves</option>
                <option value="PENDING">Pending Approval</option>
                <option value="TEACHER_APPROVED">Teacher Approved</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          )}
        </div>

        {/* Right: Export Options */}
        <div className="lg:col-span-2 bg-card border border-border p-8 rounded-2xl shadow-sm space-y-6">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            Generate Document Download
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Select one of the file formats below. Documents are compiled on demand based on the latest records in the database.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* PDF Card */}
            <div
              onClick={() => handleDownload('pdf')}
              className="p-6 border border-border rounded-2xl bg-secondary/10 hover:bg-secondary/20 hover:border-primary/20 transition-all cursor-pointer text-center space-y-3 flex flex-col items-center justify-center"
            >
              <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
                <FileText size={28} />
              </div>
              <h4 className="font-bold">PDF Format</h4>
              <span className="text-xs text-muted-foreground">Print-ready formatted document</span>
            </div>

            {/* Excel Card */}
            <div
              onClick={() => handleDownload('excel')}
              className="p-6 border border-border rounded-2xl bg-secondary/10 hover:bg-secondary/20 hover:border-primary/20 transition-all cursor-pointer text-center space-y-3 flex flex-col items-center justify-center"
            >
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                <FileDown size={28} />
              </div>
              <h4 className="font-bold">Excel Sheet</h4>
              <span className="text-xs text-muted-foreground">Full workbook with sorting & design</span>
            </div>

            {/* CSV Card */}
            <div
              onClick={() => handleDownload('csv')}
              className="p-6 border border-border rounded-2xl bg-secondary/10 hover:bg-secondary/20 hover:border-primary/20 transition-all cursor-pointer text-center space-y-3 flex flex-col items-center justify-center"
            >
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                <FileDown size={28} />
              </div>
              <h4 className="font-bold">CSV Sheet</h4>
              <span className="text-xs text-muted-foreground">Plain comma-delimited data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
