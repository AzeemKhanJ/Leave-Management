import { prisma } from '../config/db';

export class AttendanceRepository {
  static async findExistingAttendance(
    classId: string,
    subjectId: string,
    date: Date,
    periodNumber: number
  ) {
    return prisma.attendance.findFirst({
      where: {
        classId,
        subjectId,
        date,
        periodNumber,
      },
    });
  }

  static async submitAttendance(data: {
    classId: string;
    subjectId: string;
    date: Date;
    periodNumber: number;
    teacherId: string;
    records: Array<{ studentId: string; status: string; remarks?: string }>;
  }) {
    return prisma.$transaction(async (tx) => {
      const results = [];
      for (const record of data.records) {
        const att = await tx.attendance.create({
          data: {
            classId: data.classId,
            subjectId: data.subjectId,
            studentId: record.studentId,
            teacherId: data.teacherId,
            date: data.date,
            periodNumber: data.periodNumber,
            status: record.status,
            remarks: record.remarks,
          },
        });
        results.push(att);
      }
      return results;
    });
  }

  static async updateAttendanceRecord(
    id: string,
    newStatus: string,
    reason: string,
    editedById: string
  ) {
    return prisma.$transaction(async (tx) => {
      const oldAtt = await tx.attendance.findUnique({
        where: { id },
      });
      if (!oldAtt) throw new Error('Attendance record not found');

      const updated = await tx.attendance.update({
        where: { id },
        data: { status: newStatus },
      });

      await tx.attendanceEditHistory.create({
        data: {
          attendanceId: id,
          editedById,
          oldStatus: oldAtt.status,
          newStatus,
          reason,
        },
      });

      return updated;
    });
  }

  static async getAttendanceLogs(filters: {
    classId?: string;
    subjectId?: string;
    studentId?: string;
    teacherId?: string;
    fromDate?: Date;
    toDate?: Date;
  }) {
    const where: any = {};
    if (filters.classId) where.classId = filters.classId;
    if (filters.subjectId) where.subjectId = filters.subjectId;
    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.teacherId) where.teacherId = filters.teacherId;
    if (filters.fromDate || filters.toDate) {
      where.date = {};
      if (filters.fromDate) where.date.gte = filters.fromDate;
      if (filters.toDate) where.date.lte = filters.toDate;
    }

    return prisma.attendance.findMany({
      where,
      include: {
        student: { include: { class: { include: { semester: true, section: true } } } },
        subject: true,
        teacher: true,
        class: { include: { department: true, semester: true, section: true } },
        editHistory: { include: { editedBy: true } },
      },
      orderBy: [{ date: 'desc' }, { periodNumber: 'asc' }],
    });
  }

  static async getStudentAttendancePercentage(studentId: string) {
    const total = await prisma.attendance.count({ where: { studentId } });
    const present = await prisma.attendance.count({
      where: { studentId, status: { in: ['PRESENT', 'LATE'] } },
    });
    return total === 0 ? 100 : Math.round((present / total) * 100);
  }

  static async getLowAttendanceStudents(threshold: number = 75) {
    const students = await prisma.student.findMany({
      include: {
        class: { include: { department: true, semester: true, section: true } },
      },
    });

    const lowAttendanceList = [];
    for (const student of students) {
      const total = await prisma.attendance.count({ where: { studentId: student.id } });
      const present = await prisma.attendance.count({
        where: { studentId: student.id, status: { in: ['PRESENT', 'LATE'] } },
      });
      const pct = total === 0 ? 100 : (present / total) * 100;
      if (pct < threshold && total > 0) {
        lowAttendanceList.push({
          student,
          percentage: Math.round(pct),
          totalPeriods: total,
          presentPeriods: present,
        });
      }
    }
    return lowAttendanceList;
  }

  static async getFrequentAbsentees(limit: number = 5) {
    // Group by student and count ABSENT
    const absents = await prisma.attendance.groupBy({
      by: ['studentId'],
      where: { status: 'ABSENT' },
      _count: { status: true },
      orderBy: { _count: { status: 'desc' } },
      take: limit,
    });

    const result = [];
    for (const item of absents) {
      const student = await prisma.student.findUnique({
        where: { id: item.studentId },
        include: { class: { include: { department: true, semester: true, section: true } } },
      });
      if (student) {
        result.push({
          student,
          absentCount: item._count.status,
        });
      }
    }
    return result;
  }
}
