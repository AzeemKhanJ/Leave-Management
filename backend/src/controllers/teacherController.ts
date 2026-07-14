import { Response, NextFunction } from 'express';
import { TeacherService } from '../services/teacherService';
import { AttendanceRepository } from '../repository/attendanceRepository';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as zodSchemas from '../models/zodSchemas';
import { prisma } from '../config/db';

export class TeacherController {
  static async submitAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = zodSchemas.attendanceSubmitSchema.parse(req.body);
      const result = await TeacherService.submitAttendance(data, req.user);
      res.status(201).json({ success: true, message: 'Attendance recorded successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async editAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, reason } = zodSchemas.attendanceEditSchema.parse(req.body);
      const result = await TeacherService.editAttendance(id, status, reason, req.user);
      res.status(200).json({ success: true, message: 'Attendance record updated', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getAssignedClasses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.teacherId) {
        return res.status(400).json({ success: false, message: 'Teacher profile not found' });
      }
      const result = await TeacherService.getAssignedClasses(req.user.teacherId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async searchStudents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      if (!req.user || !req.user.teacherId) {
        return res.status(400).json({ success: false, message: 'Teacher profile not found' });
      }
      const result = await TeacherService.searchStudents((q as string) || '', req.user.teacherId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.teacherId) {
        return res.status(400).json({ success: false, message: 'Teacher profile not found' });
      }
      const teacherId = req.user.teacherId;

      // Find teacher classes
      const assignments = await prisma.teacherClassSubject.findMany({
        where: { teacherId },
        select: { classId: true },
      });
      const classIds = assignments.map((a) => a.classId);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Today's attendance counts in teacher's classes
      const todayTotal = await prisma.attendance.count({
        where: { classId: { in: classIds }, date: today },
      });
      const todayPresent = await prisma.attendance.count({
        where: { classId: { in: classIds }, date: today, status: { in: ['PRESENT', 'LATE'] } },
      });
      const todayAbsent = await prisma.attendance.count({
        where: { classId: { in: classIds }, date: today, status: 'ABSENT' },
      });

      // Assigned classes count
      const classesCount = await prisma.teacherClassSubject.groupBy({
        by: ['classId'],
        where: { teacherId },
      });

      // Pending leave approvals that student applied in teacher's department
      const pendingLeaves = await prisma.leaveRequest.count({
        where: {
          status: 'PENDING',
          student: { departmentId: req.user.departmentId },
        },
      });

      res.status(200).json({
        success: true,
        data: {
          classesAssigned: classesCount.length,
          todayTotal,
          todayPresent,
          todayAbsent,
          pendingLeaves,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
