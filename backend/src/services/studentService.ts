import { prisma } from '../config/db';

export class StudentService {
  static async getStudentDashboardData(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: {
          include: {
            department: true,
            semester: { include: { academicYear: true } },
            section: true,
          },
        },
      },
    });

    if (!student) throw new Error('Student profile not found');

    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId },
      include: { subject: true, teacher: true },
      orderBy: { date: 'desc' },
    });

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
    const absentDays = attendanceRecords.filter((a) => a.status === 'ABSENT').length;
    const lateDays = attendanceRecords.filter((a) => a.status === 'LATE').length;

    const percentage = totalDays === 0 ? 100 : Math.round((presentDays / totalDays) * 100);

    // Subject-wise percentage
    const subjectsMap: Record<string, { name: string; code: string; total: number; present: number }> = {};
    for (const record of attendanceRecords) {
      const subId = record.subjectId;
      if (!subjectsMap[subId]) {
        subjectsMap[subId] = {
          name: record.subject.name,
          code: record.subject.code,
          total: 0,
          present: 0,
        };
      }
      subjectsMap[subId].total += 1;
      if (record.status === 'PRESENT' || record.status === 'LATE') {
        subjectsMap[subId].present += 1;
      }
    }

    const subjectWiseAttendance = Object.entries(subjectsMap).map(([id, info]) => ({
      subjectId: id,
      name: info.name,
      code: info.code,
      total: info.total,
      present: info.present,
      percentage: info.total === 0 ? 100 : Math.round((info.present / info.total) * 100),
    }));

    return {
      student,
      summary: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        percentage,
      },
      subjectWiseAttendance,
      attendanceRecords,
      leaveRequests,
    };
  }
}
