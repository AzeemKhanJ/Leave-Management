import { Response, NextFunction } from 'express';
import { ReportService } from '../services/reportService';
import { AttendanceRepository } from '../repository/attendanceRepository';
import { LeaveRepository } from '../repository/leaveRepository';
import { UserRepository } from '../repository/userRepository';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { prisma } from '../config/db';

export class ReportController {
  static async exportAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { classId, subjectId, format } = req.query;

      const logs = await AttendanceRepository.getAttendanceLogs({
        classId: classId as string,
        subjectId: subjectId as string,
      });

      const exportData = logs.map((log) => ({
        Date: log.date.toISOString().split('T')[0],
        Period: log.periodNumber,
        Student: log.student.name,
        RegisterNo: log.student.registerNumber,
        Subject: log.subject.name,
        Status: log.status,
        Teacher: log.teacher.name,
      }));

      if (format === 'csv') {
        const csv = await ReportService.generateCSV('Attendance', exportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="attendance_report.csv"');
        return res.status(200).send(csv);
      } else if (format === 'excel') {
        const columns = [
          { header: 'Date', key: 'Date', width: 15 },
          { header: 'Period', key: 'Period', width: 10 },
          { header: 'Student Name', key: 'Student', width: 25 },
          { header: 'Register No', key: 'RegisterNo', width: 20 },
          { header: 'Subject', key: 'Subject', width: 20 },
          { header: 'Status', key: 'Status', width: 15 },
          { header: 'Marked By', key: 'Teacher', width: 25 },
        ];
        const buffer = await ReportService.generateExcel('Attendance', columns, exportData);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="attendance_report.xlsx"');
        return res.status(200).send(buffer);
      } else {
        // PDF default
        const headers = ['Date', 'Period', 'Student Name', 'Register No', 'Subject', 'Status', 'Marked By'];
        const rows = exportData.map((d) => [
          d.Date,
          String(d.Period),
          d.Student,
          d.RegisterNo,
          d.Subject,
          d.Status,
          d.Teacher,
        ]);
        const buffer = await ReportService.generatePDF('Attendance Report', headers, rows);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="attendance_report.pdf"');
        return res.status(200).send(buffer);
      }
    } catch (error) {
      next(error);
    }
  }

  static async exportLeaves(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, format } = req.query;
      const leaves = await LeaveRepository.getLeaveRequests({
        status: status as string,
      });

      const exportData = leaves.map((leave) => ({
        Student: leave.student.name,
        RegisterNo: leave.student.registerNumber,
        FromDate: leave.fromDate.toISOString().split('T')[0],
        ToDate: leave.toDate.toISOString().split('T')[0],
        Type: leave.leaveType,
        Status: leave.status,
        Reason: leave.reason,
      }));

      if (format === 'csv') {
        const csv = await ReportService.generateCSV('Leaves', exportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="leaves_report.csv"');
        return res.status(200).send(csv);
      } else if (format === 'excel') {
        const columns = [
          { header: 'Student Name', key: 'Student', width: 25 },
          { header: 'Register No', key: 'RegisterNo', width: 20 },
          { header: 'From Date', key: 'FromDate', width: 15 },
          { header: 'To Date', key: 'ToDate', width: 15 },
          { header: 'Type', key: 'Type', width: 15 },
          { header: 'Status', key: 'Status', width: 15 },
          { header: 'Reason', key: 'Reason', width: 30 },
        ];
        const buffer = await ReportService.generateExcel('Leaves', columns, exportData);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="leaves_report.xlsx"');
        return res.status(200).send(buffer);
      } else {
        const headers = ['Student', 'Register No', 'From Date', 'To Date', 'Type', 'Status', 'Reason'];
        const rows = exportData.map((d) => [
          d.Student,
          d.RegisterNo,
          d.FromDate,
          d.ToDate,
          d.Type,
          d.Status,
          d.Reason,
        ]);
        const buffer = await ReportService.generatePDF('Leave Requests Report', headers, rows);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="leaves_report.pdf"');
        return res.status(200).send(buffer);
      }
    } catch (error) {
      next(error);
    }
  }

  static async exportStudents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { format } = req.query;
      const students = await UserRepository.getAllStudents();

      const exportData = students.map((s) => ({
        Name: s.name,
        RegisterNo: s.registerNumber,
        Email: s.email,
        Phone: s.phone || 'N/A',
        Department: s.department.name,
        Class: `Sem ${s.class.semester.number} - Sec ${s.class.section.name}`,
      }));

      if (format === 'csv') {
        const csv = await ReportService.generateCSV('Students', exportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="students_report.csv"');
        return res.status(200).send(csv);
      } else if (format === 'excel') {
        const columns = [
          { header: 'Name', key: 'Name', width: 25 },
          { header: 'Register No', key: 'RegisterNo', width: 20 },
          { header: 'Email', key: 'Email', width: 25 },
          { header: 'Phone', key: 'Phone', width: 15 },
          { header: 'Department', key: 'Department', width: 25 },
          { header: 'Class', key: 'Class', width: 30 },
        ];
        const buffer = await ReportService.generateExcel('Students', columns, exportData);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="students_report.xlsx"');
        return res.status(200).send(buffer);
      } else {
        const headers = ['Name', 'Register No', 'Email', 'Phone', 'Department', 'Class'];
        const rows = exportData.map((d) => [
          d.Name,
          d.RegisterNo,
          d.Email,
          d.Phone,
          d.Department,
          d.Class,
        ]);
        const buffer = await ReportService.generatePDF('Student Registry Report', headers, rows);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="students_report.pdf"');
        return res.status(200).send(buffer);
      }
    } catch (error) {
      next(error);
    }
  }

  static async exportTeachers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { format } = req.query;
      const teachers = await UserRepository.getAllTeachers();

      const exportData = teachers.map((t) => ({
        Name: t.name,
        EmployeeId: t.employeeId,
        Email: t.email,
        Phone: t.phone || 'N/A',
        Department: t.department.name,
      }));

      if (format === 'csv') {
        const csv = await ReportService.generateCSV('Teachers', exportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="teachers_report.csv"');
        return res.status(200).send(csv);
      } else if (format === 'excel') {
        const columns = [
          { header: 'Name', key: 'Name', width: 25 },
          { header: 'Employee ID', key: 'EmployeeId', width: 20 },
          { header: 'Email', key: 'Email', width: 25 },
          { header: 'Phone', key: 'Phone', width: 15 },
          { header: 'Department', key: 'Department', width: 25 },
        ];
        const buffer = await ReportService.generateExcel('Teachers', columns, exportData);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="teachers_report.xlsx"');
        return res.status(200).send(buffer);
      } else {
        const headers = ['Name', 'Employee ID', 'Email', 'Phone', 'Department'];
        const rows = exportData.map((d) => [
          d.Name,
          d.EmployeeId,
          d.Email,
          d.Phone,
          d.Department,
        ]);
        const buffer = await ReportService.generatePDF('Faculty Registry Report', headers, rows);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="teachers_report.pdf"');
        return res.status(200).send(buffer);
      }
    } catch (error) {
      next(error);
    }
  }
}
