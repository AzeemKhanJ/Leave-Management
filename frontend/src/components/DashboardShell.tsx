import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  BookOpen,
  CalendarDays,
  FileSpreadsheet,
  Settings,
  History,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  User,
  Users,
  Compass,
  FileCheck2,
  BellRing
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: any;
}

export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) return null;

  const adminItems: SidebarItem[] = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Departments', path: '/admin/departments', icon: Building2 },
    { name: 'Classes', path: '/admin/classes', icon: Compass },
    { name: 'Faculty', path: '/admin/teachers', icon: Users },
    { name: 'Students', path: '/admin/students', icon: GraduationCap },
    { name: 'Leave Requests', path: '/admin/leaves', icon: FileCheck2 },
    { name: 'Holidays', path: '/admin/holidays', icon: CalendarDays },
    { name: 'Reports', path: '/admin/reports', icon: FileSpreadsheet },
    { name: 'Audit Logs', path: '/admin/audit', icon: History },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const teacherItems: SidebarItem[] = [
    { name: 'Dashboard', path: '/teacher', icon: LayoutDashboard },
    { name: 'Take Attendance', path: '/teacher/attendance', icon: FileCheck2 },
    { name: 'My Classes', path: '/teacher/classes', icon: Compass },
    { name: 'Students', path: '/teacher/students', icon: GraduationCap },
    { name: 'Leave Approvals', path: '/teacher/leaves', icon: FileSpreadsheet },
  ];

  const studentItems: SidebarItem[] = [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { name: 'Leave Requests', path: '/student/leaves', icon: FileCheck2 },
    { name: 'Holidays', path: '/student/holidays', icon: CalendarDays },
  ];

  const sidebarItems =
    user.role === 'ADMIN' ? adminItems : user.role === 'TEACHER' ? teacherItems : studentItems;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Sidebar Desktop */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 70 }}
        className="hidden md:flex flex-col h-full bg-card border-r border-border shadow-lg z-20 overflow-hidden"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent"
                >
                  Leave Management
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Sidebar Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border bg-secondary/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="flex items-center justify-between px-6 h-16 bg-card border-b border-border shadow-sm z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-muted-foreground">
              Welcome, <span className="text-foreground capitalize">{user.username}</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary uppercase">
              {user.role}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-all"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* User Profile Summary */}
            <div className="flex items-center gap-2 border-l pl-4">
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold">{user.profile?.name || user.username}</span>
                <span className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
