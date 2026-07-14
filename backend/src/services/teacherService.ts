import { AttendanceRepository } from '../repository/attendanceRepository';
import { DepartmentRepository } from '../repository/departmentRepository';
import { AuditLogRepository } from '../repository/auditLogRepository';
import { prisma } from '../config/db';
import { logger } from '../config/logger';

export class TeacherService {
  static async submitAttendance(
    data: {
      classId: string;
      subjectId: string;
      date: string;
      periodNumber: number;
      records: Array<{ studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE'; remarks?: string }>;
    },
    teacherUser: any
  ) {
    const formattedDate = new Date(data.date);
    formattedDate.setHours(0, 0, 0, 0);

    // Check duplicate
    const existing = await AttendanceRepository.findExistingAttendance(
      data.classId,
      data.subjectId,
      formattedDate,
      data.periodNumber
    );

    if (existing) {
      throw new Error('Attendance for this period and class has already been submitted');
    }

    // Submit
    const result = await AttendanceRepository.submitAttendance({
      classId: data.classId,
      subjectId: data.subjectId,
      date: formattedDate,
      periodNumber: data.periodNumber,
      teacherId: teacherUser.teacherId,
      records: data.records,
    });

    await AuditLogRepository.log({
      userId: teacherUser.id,
      username: teacherUser.username,
      role: teacherUser.role,
      actionType: 'ATTENDANCE_ACTIVITY',
      description: `Submitted attendance for Class ID: ${data.classId}, Period: ${data.periodNumber}, Date: ${data.date}`,
    });

    return result;
  }

  static async editAttendance(
    attendanceId: string,
    newStatus: 'PRESENT' | 'ABSENT' | 'LATE',
    reason: string,
    teacherUser: any
  ) {
    // Audit check: in teacher flow, do they have access? Yes, let's allow editing, and log in editHistory
    const result = await AttendanceRepository.updateAttendanceRecord(
      attendanceId,
      newStatus,
      reason,
      teacherUser.id
    );

    await AuditLogRepository.log({
      userId: teacherUser.id,
      username: teacherUser.username,
      role: teacherUser.role,
      actionType: 'ATTENDANCE_ACTIVITY',
      description: `Modified attendance record ID: ${attendanceId} to ${newStatus}. Reason: ${reason}`,
    });

    return result;
  }

  static async getAssignedClasses(teacherId: string) {
    return prisma.teacherClassSubject.findMany({
      where: { teacherId },
      include: {
        class: {
          include: {
            department: true,
            semester: { include: { academicYear: true } },
            section: true,
          },
        },
        subject: true,
      },
    });
  }

  static async searchStudents(query: string, teacherId: string) {
    // Find all classes assigned to this teacher
    const assignments = await prisma.teacherClassSubject.findMany({
      where: { teacherId },
      select: { classId: true },
    });
    const classIds = assignments.map((a) => a.classId);

    // Search students only in these classes
    return prisma.student.findMany({
      where: {
        classId: { in: classIds },
        OR: [
          { name: { contains: query } },
          { registerNumber: { contains: query } },
        ],
      },
      include: {
  department: true,

  class: {
    include: {
      department: true,
      semester: true,
      section: true,
    },
  },

  user: true,
},
    });
  }
}
