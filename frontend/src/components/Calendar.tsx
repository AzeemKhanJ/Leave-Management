import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
  date: string; // YYYY-MM-DD
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE_APPROVED' | 'LEAVE_PENDING' | 'HOLIDAY_GOVT' | 'HOLIDAY_COLLEGE';
  label?: string;
}

interface CalendarProps {
  events: CalendarEvent[];
}

export const Calendar: React.FC<CalendarProps> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to map date to event status
  const getDayStatus = (dayNum: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const matched = events.find((e) => e.date.startsWith(dayStr));
    
    // Check if Sunday
    const isSunday = new Date(year, month, dayNum).getDay() === 0;

    return { matched, isSunday };
  };

  const renderCells = () => {
    const cells = [];
    
    // Empty padding for start of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="h-24 bg-secondary/10 border border-border rounded-lg" />);
    }

    // Days in month
    for (let d = 1; d <= daysInMonth; d++) {
      const { matched, isSunday } = getDayStatus(d);
      let statusColor = 'hover:bg-secondary/40';
      let textBadge = '';

      if (isSunday) {
        statusColor = 'bg-slate-100 dark:bg-slate-900 text-muted-foreground/60';
        textBadge = 'Sunday';
      } else if (matched) {
        switch (matched.status) {
          case 'PRESENT':
            statusColor = 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400';
            textBadge = 'Present';
            break;
          case 'ABSENT':
            statusColor = 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-400';
            textBadge = 'Absent';
            break;
          case 'LATE':
            statusColor = 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400';
            textBadge = 'Late';
            break;
          case 'LEAVE_APPROVED':
            statusColor = 'bg-orange-500/15 border-orange-500 text-orange-700 dark:text-orange-400';
            textBadge = 'Approved Leave';
            break;
          case 'LEAVE_PENDING':
            statusColor = 'bg-yellow-500/15 border-yellow-500 text-yellow-700 dark:text-yellow-400';
            textBadge = 'Pending Leave';
            break;
          case 'HOLIDAY_GOVT':
            statusColor = 'bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-400';
            textBadge = matched.label || 'Govt Holiday';
            break;
          case 'HOLIDAY_COLLEGE':
            statusColor = 'bg-indigo-500/15 border-indigo-500 text-indigo-700 dark:text-indigo-400';
            textBadge = matched.label || 'College Holiday';
            break;
        }
      }

      cells.push(
        <div
          key={`day-${d}`}
          className={`h-24 p-2 border border-border rounded-lg flex flex-col justify-between transition-all ${statusColor}`}
        >
          <span className="font-semibold text-sm">{d}</span>
          {textBadge && (
            <span className="text-[10px] font-medium tracking-tight truncate uppercase self-end">
              {textBadge}
            </span>
          )}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-md">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">
          {months[month]} {year}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg border hover:bg-secondary transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg border hover:bg-secondary transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-muted-foreground uppercase">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Grid of days */}
      <div className="grid grid-cols-7 gap-2">
        {renderCells()}
      </div>
    </div>
  );
};
