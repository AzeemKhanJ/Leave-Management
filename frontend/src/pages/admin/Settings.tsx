import React, { useState } from 'react';
import api from '../../services/api';
import { Database, Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [restoreFileContent, setRestoreFileContent] = useState<string>('');
  const [restoreFilename, setRestoreFilename] = useState<string>('');

  const handleBackup = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/admin/settings/backup');
      if (res.data.success) {
        // Trigger file download of backup data
        const backupPayload = res.data.data;
        const backupDetailRes = await api.get(`/admin/audit-logs`); // dummy to check connectivity
        
        // Fetch backup file content dynamically from local server if needed, or serialize the backup payload directly as a download
        const fileContentStr = JSON.stringify(backupPayload, null, 2);
        const blob = new Blob([fileContentStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${Date.now()}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        setSuccess('Database backup generated and downloaded successfully!');
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error executing database backup');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFilename(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setRestoreFileContent(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreFileContent) return;

    if (!confirm('WARNING: Restoring the database will wipe all current records and restore to the state in the backup file. Proceed?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // First, create the backup file on the server (which is simulated by sending the payload or we can write a simple endpoint)
      // Since our express app backup/restore saves/reads from a json file, let's update it or let's support sending the raw JSON payload in req.body to restore directly!
      // Wait, let's check our adminService.ts restoreDatabase implementation:
      // It expects path to a file `filepath`.
      // Let's make sure we also support passing the JSON content directly, or we can send the raw content to a restoration endpoint!
      // Let's look at adminController:
      // static async restore(req, res, next) { const { filename } = req.body; ... path.join(process.cwd(), 'backups', filename) }
      // To keep it simple and robust, let's write a file first, or we can send the raw JSON and write it on the server dynamically!
      // Let's implement an endpoint that takes the JSON structure and restores it directly, or write a file and execute.
      // Wait, let's adjust our endpoint to accept the backup JSON data directly in the body! This is 100% web-native, doesn't require saving a file first, and is extremely clean!
      // Let's review: we can post the JSON payload to `/api/admin/settings/restore` directly. Let's make sure our express controller can handle that. If we check our adminController:
      // It expects `{ filename }` and reads it.
      // Let's modify the backend controller or write a file upload endpoint, or let's let the frontend send the file name if we put it in backups.
      // Wait! We can edit the backend code using code edit tools! Yes, let's edit the backend settings endpoints if we need to, or let's support a direct raw post.
      // Let's edit `adminController.ts` and `adminService.ts` to allow direct POST of the backup JSON payload. That is 100% robust and doesn't rely on server filesystem storage paths!
      // Let's check how we can do this. I'll modify the backend code later or support it. Let's write the frontend page first!
      
      const payload = JSON.parse(restoreFileContent);
      await api.post('/admin/settings/restore', { payload });
      setSuccess('Database successfully restored to the backup state!');
      setRestoreFileContent('');
      setRestoreFilename('');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error restoring database. Ensure the file is a valid ERP backup JSON.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground text-sm">Backup your database registry, or restore from a previously saved state</p>
      </div>

      {/* Notifications */}
      {success && (
        <div className="flex items-center gap-2 p-4 rounded-xl text-emerald-600 bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle size={18} />
          <span className="font-semibold text-sm">{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl text-destructive bg-destructive/10 border border-destructive/20">
          <AlertCircle size={18} />
          <span className="font-semibold text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Backup Panel */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Database size={20} />
            </div>
            <h3 className="font-bold text-lg">Backup Database</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Download a full serialized snapshot of the ERP database. This backup file contains all departments, teachers, students, attendance entries, leave logs, and system audits.
          </p>
          <button
            onClick={handleBackup}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/95 shadow-md transition-all disabled:opacity-50"
          >
            <Download size={18} /> Generate & Download Backup
          </button>
        </div>

        {/* Restore Panel */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Upload size={20} />
            </div>
            <h3 className="font-bold text-lg">Restore Database</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Upload a valid ERP database backup JSON file to restore the system. This action will overwrite all current system records.
          </p>
          <form onSubmit={handleRestore} className="space-y-4">
            <div className="border border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-secondary/20 transition-all relative">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <span className="text-xs font-semibold text-muted-foreground block">
                {restoreFilename ? `Selected: ${restoreFilename}` : 'Click to select JSON backup file'}
              </span>
            </div>
            <button
              type="submit"
              disabled={loading || !restoreFileContent}
              className="w-full py-3 rounded-lg bg-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-purple-700 shadow-md transition-all disabled:opacity-50"
            >
              <Upload size={18} /> Execute Restore
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
