import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { UserRepository } from '../repository/userRepository';
import { DepartmentRepository } from '../repository/departmentRepository';
import { AuditLogRepository } from '../repository/auditLogRepository';
import * as fs from 'fs';
import * as path from 'path';

export class AdminService {
  // Teacher management
  static async createTeacher(data: any, adminUser: any) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const result = await UserRepository.createTeacher({ ...data, passwordHash });
    
    await AuditLogRepository.log({
      userId: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      actionType: 'USER_ACTIVITY',
      description: `Created teacher account for ${data.name} (Employee ID: ${data.employeeId})`,
    });
    return result;
  }

  static async editTeacher(id: string, data: any, adminUser: any) {
    const result = await UserRepository.updateTeacher(id, data);
    await AuditLogRepository.log({
      userId: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      actionType: 'USER_ACTIVITY',
      description: `Edited teacher profile: ${data.name}`,
    });
    return result;
  }

  static async deleteTeacher(id: string, adminUser: any) {
    const result = await UserRepository.deleteTeacher(id);
    await AuditLogRepository.log({
      userId: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      actionType: 'USER_ACTIVITY',
      description: `Deleted teacher account (ID: ${id})`,
    });
    return result;
  }

  static async resetTeacherPassword(id: string, newPass: string, adminUser: any) {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new Error('Teacher not found');

    const passwordHash = await bcrypt.hash(newPass, 10);
    await UserRepository.resetPassword(teacher.userId, passwordHash);

    await AuditLogRepository.log({
      userId: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      actionType: 'USER_ACTIVITY',
      description: `Reset password for teacher ${teacher.name}`,
    });
  }

  // Student management
  static async createStudent(data: any, adminUser: any) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const result = await UserRepository.createStudent({ ...data, passwordHash });

    await AuditLogRepository.log({
      userId: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      actionType: 'USER_ACTIVITY',
      description: `Created student account for ${data.name} (Register No: ${data.registerNumber})`,
    });
    return result;
  }

  static async editStudent(id: string, data: any, adminUser: any) {
    const result = await UserRepository.updateStudent(id, data);
    await AuditLogRepository.log({
      userId: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      actionType: 'USER_ACTIVITY',
      description: `Edited student profile: ${data.name}`,
    });
    return result;
  }

  static async deleteStudent(id: string, adminUser: any) {
    const result = await UserRepository.deleteStudent(id);
    await AuditLogRepository.log({
      userId: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      actionType: 'USER_ACTIVITY',
      description: `Deleted student account (ID: ${id})`,
    });
    return result;
  }

  static async resetStudentPassword(id: string, newPass: string, adminUser: any) {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) throw new Error('Student not found');

    const passwordHash = await bcrypt.hash(newPass, 10);
    await UserRepository.resetPassword(student.userId, passwordHash);

    await AuditLogRepository.log({
      userId: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      actionType: 'USER_ACTIVITY',
      description: `Reset password for student ${student.name}`,
    });
  }

  // Database Backup
  static async backupDatabase() {
    const backupData = {
      timestamp: new Date().toISOString(),
      departments: await prisma.department.findMany(),
      academicYears: await prisma.academicYear.findMany(),
      semesters: await prisma.semester.findMany(),
      sections: await prisma.section.findMany(),
      classes: await prisma.class.findMany(),
      subjects: await prisma.subject.findMany(),
      users: await prisma.user.findMany(),
      teachers: await prisma.teacher.findMany(),
      students: await prisma.student.findMany(),
      teacherClassSubjects: await prisma.teacherClassSubject.findMany(),
      timetables: await prisma.timetable.findMany(),
      attendance: await prisma.attendance.findMany(),
      attendanceEditHistories: await prisma.attendanceEditHistory.findMany(),
      leaveRequests: await prisma.leaveRequest.findMany(),
      leaveWorkflowLogs: await prisma.leaveWorkflowLog.findMany(),
      holidays: await prisma.holiday.findMany(),
      auditLogs: await prisma.auditLog.findMany(),
    };

    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    const filename = `backup_${Date.now()}.json`;
    const filepath = path.join(backupsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2), 'utf-8');

    return { filename, filepath, size: fs.statSync(filepath).size, backupData };
  }

  // Database Restore
  static async restoreDatabase(backupFilePathOrData: string | any, adminUser: any) {
    let data: any;
    if (typeof backupFilePathOrData === 'string') {
      if (!fs.existsSync(backupFilePathOrData)) {
        throw new Error('Backup file not found');
      }
      const fileContent = fs.readFileSync(backupFilePathOrData, 'utf-8');
      data = JSON.parse(fileContent);
    } else {
      data = backupFilePathOrData;
    }

    // Run delete-all and insert-all in transaction
    await prisma.$transaction(async (tx) => {
      // Clear all
      await tx.auditLog.deleteMany({});
      await tx.holiday.deleteMany({});
      await tx.leaveWorkflowLog.deleteMany({});
      await tx.leaveRequest.deleteMany({});
      await tx.attendanceEditHistory.deleteMany({});
      await tx.attendance.deleteMany({});
      await tx.timetable.deleteMany({});
      await tx.teacherClassSubject.deleteMany({});
      await tx.student.deleteMany({});
      await tx.teacher.deleteMany({});
      await tx.subject.deleteMany({});
      await tx.class.deleteMany({});
      await tx.section.deleteMany({});
      await tx.semester.deleteMany({});
      await tx.academicYear.deleteMany({});
      await tx.department.deleteMany({});
      await tx.user.deleteMany({});

      // Restore base infrastructure
      for (const dept of data.departments) {
        await tx.department.create({ data: dept });
      }
      for (const ay of data.academicYears) {
        await tx.academicYear.create({ data: ay });
      }
      for (const sem of data.semesters) {
        await tx.semester.create({ data: sem });
      }
      for (const sec of data.sections) {
        await tx.section.create({ data: sec });
      }
      for (const cls of data.classes) {
        await tx.class.create({ data: cls });
      }
      for (const subj of data.subjects) {
        await tx.subject.create({ data: subj });
      }

      // Restore credentials & profiles
      for (const user of data.users) {
        await tx.user.create({ data: user });
      }
      for (const teacher of data.teachers) {
        await tx.teacher.create({ data: teacher });
      }
      for (const student of data.students) {
        await tx.student.create({ data: student });
      }

      // Restore mappings, timetables, and logs
      for (const tcs of data.teacherClassSubjects) {
        await tx.teacherClassSubject.create({ data: tcs });
      }
      for (const tt of data.timetables) {
        await tx.timetable.create({ data: tt });
      }
      for (const att of data.attendance) {
        await tx.attendance.create({ data: att });
      }
      for (const aeh of data.attendanceEditHistories) {
        await tx.attendanceEditHistory.create({ data: aeh });
      }
      for (const lr of data.leaveRequests) {
        await tx.leaveRequest.create({ data: lr });
      }
      for (const lwl of data.leaveWorkflowLogs) {
        await tx.leaveWorkflowLog.create({ data: lwl });
      }
      for (const hol of data.holidays) {
        await tx.holiday.create({ data: hol });
      }
      for (const al of data.auditLogs) {
        await tx.auditLog.create({ data: al });
      }
    });

    await AuditLogRepository.log({
  userId: adminUser.id,
  username: adminUser.username,
  role: adminUser.role,
  actionType: 'USER_ACTIVITY',
  description: `Database restored from backup: ${
    typeof backupFilePathOrData === 'string'
      ? path.basename(backupFilePathOrData)
      : 'Uploaded Backup'
  }`,
});
  }
}
