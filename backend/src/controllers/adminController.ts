import { Response, NextFunction } from 'express';
import { AdminService } from '../services/adminService';
import { DepartmentRepository } from '../repository/departmentRepository';
import { UserRepository } from '../repository/userRepository';
import { AuditLogRepository } from '../repository/auditLogRepository';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as zodSchemas from '../models/zodSchemas';
import { prisma } from '../config/db';
import path from 'path';

export class AdminController {
  // Teacher CRUD
  static async createTeacher(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = zodSchemas.teacherCreateSchema.parse(req.body);
      const result = await AdminService.createTeacher(data, req.user);
      res.status(201).json({ success: true, message: 'Teacher created successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async editTeacher(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = zodSchemas.teacherEditSchema.parse(req.body);
      const result = await AdminService.editTeacher(id, data, req.user);
      res.status(200).json({ success: true, message: 'Teacher updated successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTeacher(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await AdminService.deleteTeacher(id, req.user);
      res.status(200).json({ success: true, message: 'Teacher deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async resetTeacherPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { newPassword } = zodSchemas.passwordResetSchema.parse(req.body);
      await AdminService.resetTeacherPassword(id, newPassword, req.user);
      res.status(200).json({ success: true, message: 'Teacher password reset successful' });
    } catch (error) {
      next(error);
    }
  }

  static async getTeachers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await UserRepository.getAllTeachers();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Student CRUD
  static async createStudent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = zodSchemas.studentCreateSchema.parse(req.body);
      const result = await AdminService.createStudent(data, req.user);
      res.status(201).json({ success: true, message: 'Student created successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async editStudent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = zodSchemas.studentEditSchema.parse(req.body);
      const result = await AdminService.editStudent(id, data, req.user);
      res.status(200).json({ success: true, message: 'Student updated successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async deleteStudent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await AdminService.deleteStudent(id, req.user);
      res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async resetStudentPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { newPassword } = zodSchemas.passwordResetSchema.parse(req.body);
      await AdminService.resetStudentPassword(id, newPassword, req.user);
      res.status(200).json({ success: true, message: 'Student password reset successful' });
    } catch (error) {
      next(error);
    }
  }

  static async getStudents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await UserRepository.getAllStudents();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Department management
  static async createDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, code } = zodSchemas.departmentCreateSchema.parse(req.body);
      const result = await DepartmentRepository.createDepartment(name, code);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getDepartments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await DepartmentRepository.getAllDepartments();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async deleteDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await DepartmentRepository.deleteDepartment(id);
      res.status(200).json({ success: true, message: 'Department deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Academic Years
  static async createAcademicYear(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, active } = zodSchemas.academicYearCreateSchema.parse(req.body);
      const result = await DepartmentRepository.createAcademicYear(name, active);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getAcademicYears(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await DepartmentRepository.getAllAcademicYears();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAcademicYear(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await DepartmentRepository.deleteAcademicYear(id);
      res.status(200).json({ success: true, message: 'Academic Year deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Semesters
  static async createSemester(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { number, academicYearId, active } = zodSchemas.semesterCreateSchema.parse(req.body);
      const result = await DepartmentRepository.createSemester(number, academicYearId, active);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getSemesters(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await DepartmentRepository.getAllSemesters();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSemester(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await DepartmentRepository.deleteSemester(id);
      res.status(200).json({ success: true, message: 'Semester deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Sections
  static async createSection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name } = zodSchemas.sectionCreateSchema.parse(req.body);
      const result = await DepartmentRepository.createSection(name);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getSections(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await DepartmentRepository.getAllSections();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await DepartmentRepository.deleteSection(id);
      res.status(200).json({ success: true, message: 'Section deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Classes
  static async createClass(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { departmentId, semesterId, sectionId } = zodSchemas.classCreateSchema.parse(req.body);
      const result = await DepartmentRepository.createClass(departmentId, semesterId, sectionId);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getClasses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await DepartmentRepository.getAllClasses();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async deleteClass(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await DepartmentRepository.deleteClass(id);
      res.status(200).json({ success: true, message: 'Class deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Subjects
  static async createSubject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, code, departmentId, semesterId } = zodSchemas.subjectCreateSchema.parse(req.body);
      const result = await DepartmentRepository.createSubject(name, code, departmentId, semesterId);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getSubjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await DepartmentRepository.getAllSubjects();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSubject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await DepartmentRepository.deleteSubject(id);
      res.status(200).json({ success: true, message: 'Subject deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Assign Teacher
  static async assignTeacher(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { teacherId, classId, subjectId } = zodSchemas.assignTeacherSchema.parse(req.body);
      const result = await DepartmentRepository.assignTeacher(teacherId, classId, subjectId);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getTeacherAssignments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await DepartmentRepository.getTeacherAssignments();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async removeTeacherAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await DepartmentRepository.removeTeacherAssignment(id);
      res.status(200).json({ success: true, message: 'Assignment removed successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Timetable
  static async createTimetable(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { classId, subjectId, teacherId, dayOfWeek, periodNumber } = zodSchemas.timetableCreateSchema.parse(req.body);
      const result = await DepartmentRepository.createTimetable(classId, subjectId, teacherId, dayOfWeek, periodNumber);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getTimetableForClass(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      const result = await DepartmentRepository.getTimetableForClass(classId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTimetableEntry(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await DepartmentRepository.deleteTimetableEntry(id);
      res.status(200).json({ success: true, message: 'Timetable entry deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Backup & Restore
  static async backup(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.backupDatabase();
      res.status(200).json({ success: true, message: 'Backup created successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async restore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { filename, payload } = req.body;
      if (payload) {
        await AdminService.restoreDatabase(payload, req.user);
      } else {
        const filepath = path.join(process.cwd(), 'backups', filename);
        await AdminService.restoreDatabase(filepath, req.user);
      }
      res.status(200).json({ success: true, message: 'Database restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Audit Logs
  static async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { role, actionType, username } = req.query;
      const result = await AuditLogRepository.getLogs({
        role: role as string,
        actionType: actionType as string,
        username: username as string,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Dashboard Stats
  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const studentCount = await prisma.student.count();
      const teacherCount = await prisma.teacher.count();
      const departmentCount = await prisma.department.count();
      
      const leavesPending = await prisma.leaveRequest.count({
        where: { status: 'TEACHER_APPROVED' }, // Admin resolves teacher approved leaves
      });

      // Overall attendance %
      const totalAtt = await prisma.attendance.count();
      const presentAtt = await prisma.attendance.count({
        where: { status: { in: ['PRESENT', 'LATE'] } },
      });
      const attendancePct = totalAtt === 0 ? 0 : Math.round((presentAtt / totalAtt) * 100);

      // Today's attendance details
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayAtt = await prisma.attendance.count({ where: { date: today } });
      const todayPresent = await prisma.attendance.count({
        where: { date: today, status: { in: ['PRESENT', 'LATE'] } },
      });
      const todayAttendancePct = todayAtt === 0 ? 0 : Math.round((todayPresent / todayAtt) * 100);

      res.status(200).json({
        success: true,
        data: {
          students: studentCount,
          teachers: teacherCount,
          departments: departmentCount,
          leavesPending,
          attendancePercentage: attendancePct,
          todayAttendancePercentage: todayAttendancePct,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
