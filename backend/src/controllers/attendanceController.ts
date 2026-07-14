import { Response, NextFunction } from 'express';
import { AttendanceRepository } from '../repository/attendanceRepository';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { prisma } from '../config/db';

export class AttendanceController {
  static async getAttendanceLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { classId, subjectId, studentId, teacherId, fromDate, toDate } = req.query;
      const logs = await AttendanceRepository.getAttendanceLogs({
        classId: classId as string,
        subjectId: subjectId as string,
        studentId: studentId as string,
        teacherId: teacherId as string,
        fromDate: fromDate ? new Date(fromDate as string) : undefined,
        toDate: toDate ? new Date(toDate as string) : undefined,
      });
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  static async getFrequentAbsentees(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { limit } = req.query;
      const result = await AttendanceRepository.getFrequentAbsentees(limit ? Number(limit) : 5);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getLowAttendanceStudents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { threshold } = req.query;
      const result = await AttendanceRepository.getLowAttendanceStudents(
        threshold ? Number(threshold) : 75
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // 1. Department Comparison
      const departments = await prisma.department.findMany({
        include: {
          students: {
            select: { id: true },
          },
        },
      });

      const departmentComparison = [];
      for (const dept of departments) {
        const studentIds = dept.students.map((s) => s.id);
        const total = await prisma.attendance.count({
          where: { studentId: { in: studentIds } },
        });
        const present = await prisma.attendance.count({
          where: { studentId: { in: studentIds }, status: { in: ['PRESENT', 'LATE'] } },
        });
        const pct = total === 0 ? 0 : Math.round((present / total) * 100);
        
        departmentComparison.push({
          name: dept.name,
          code: dept.code,
          attendanceRate: pct,
          totalPeriods: total,
        });
      }

      // 2. Class Comparison / Ranking
      const classes = await prisma.class.findMany({
        include: {
          department: true,
          semester: true,
          section: true,
          students: { select: { id: true } },
        },
      });

      const classComparison = [];
      for (const cls of classes) {
        const studentIds = cls.students.map((s) => s.id);
        const total = await prisma.attendance.count({
          where: { studentId: { in: studentIds } },
        });
        const present = await prisma.attendance.count({
          where: { studentId: { in: studentIds }, status: { in: ['PRESENT', 'LATE'] } },
        });
        const pct = total === 0 ? 0 : Math.round((present / total) * 100);

        classComparison.push({
          classId: cls.id,
          name: `${cls.department.code} Sem ${cls.semester.number} - Sec ${cls.section.name}`,
          attendanceRate: pct,
          totalPeriods: total,
        });
      }

      // 3. Attendance Heatmap (by Weekday)
      const attendance = await prisma.attendance.findMany({
        select: { date: true, status: true },
      });

      const weekdayMap: Record<string, { total: number; present: number }> = {
        MONDAY: { total: 0, present: 0 },
        TUESDAY: { total: 0, present: 0 },
        WEDNESDAY: { total: 0, present: 0 },
        THURSDAY: { total: 0, present: 0 },
        FRIDAY: { total: 0, present: 0 },
        SATURDAY: { total: 0, present: 0 },
      };

      const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      for (const record of attendance) {
        const dayName = daysOfWeek[new Date(record.date).getDay()];
        if (weekdayMap[dayName]) {
          weekdayMap[dayName].total += 1;
          if (record.status === 'PRESENT' || record.status === 'LATE') {
            weekdayMap[dayName].present += 1;
          }
        }
      }

      const heatmap = Object.entries(weekdayMap).map(([day, info]) => ({
        day,
        attendanceRate: info.total === 0 ? 0 : Math.round((info.present / info.total) * 100),
        totalCount: info.total,
      }));

      // 4. Monthly Trend (last 6 months)
      const monthlyTrends = [];
      const currentYear = new Date().getFullYear();
      for (let m = 0; m < 6; m++) {
        const d = new Date();
        d.setMonth(d.getMonth() - m);
        const monthNum = d.getMonth();
        const year = d.getFullYear();
        
        const startOfMonth = new Date(year, monthNum, 1);
        const endOfMonth = new Date(year, monthNum + 1, 0, 23, 59, 59);

        const totalMonth = await prisma.attendance.count({
          where: { date: { gte: startOfMonth, lte: endOfMonth } },
        });
        const presentMonth = await prisma.attendance.count({
          where: { date: { gte: startOfMonth, lte: endOfMonth }, status: { in: ['PRESENT', 'LATE'] } },
        });
        const pctMonth = totalMonth === 0 ? 0 : Math.round((presentMonth / totalMonth) * 100);

        monthlyTrends.push({
          month: d.toLocaleString('default', { month: 'short' }) + ' ' + year,
          attendanceRate: pctMonth,
          totalCount: totalMonth,
        });
      }
      monthlyTrends.reverse();

      res.status(200).json({
        success: true,
        data: {
          departmentComparison,
          classComparison,
          heatmap,
          monthlyTrends,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
