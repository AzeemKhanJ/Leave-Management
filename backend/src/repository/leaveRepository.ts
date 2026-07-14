import { prisma } from '../config/db';

export class LeaveRepository {
  static async createLeaveRequest(data: {
    studentId: string;
    fromDate: Date;
    toDate: Date;
    reason: string;
    leaveType: string;
    attachmentUrl?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const leave = await tx.leaveRequest.create({
        data: {
          studentId: data.studentId,
          fromDate: data.fromDate,
          toDate: data.toDate,
          reason: data.reason,
          leaveType: data.leaveType,
          attachmentUrl: data.attachmentUrl,
          status: 'PENDING',
        },
        include: { student: true },
      });

      // Find user id for student
      const student = await tx.student.findUnique({
        where: { id: data.studentId },
      });

      if (student) {
        await tx.leaveWorkflowLog.create({
          data: {
            leaveRequestId: leave.id,
            status: 'PENDING',
            remarks: 'Leave applied by student',
            updatedById: student.userId,
          },
        });
      }

      return leave;
    });
  }

  static async updateLeaveStatus(
    id: string,
    action: 'TEACHER_APPROVED' | 'ADMIN_APPROVED' | 'REJECTED',
    remarks: string | undefined,
    updatedById: string
  ) {
    return prisma.$transaction(async (tx) => {
      const updateData: any = {};
      
      if (action === 'TEACHER_APPROVED') {
        updateData.status = 'TEACHER_APPROVED';
        updateData.teacherRemarks = remarks;
      } else if (action === 'ADMIN_APPROVED') {
        updateData.status = 'ADMIN_APPROVED';
        updateData.adminRemarks = remarks;
      } else if (action === 'REJECTED') {
        updateData.status = 'REJECTED';
        if (remarks) {
          updateData.teacherRemarks = remarks; // Store in teacher/admin remarks depending on role? Or handle generally.
          updateData.adminRemarks = remarks;
        }
      }

      const updated = await tx.leaveRequest.update({
        where: { id },
        data: updateData,
        include: { student: { include: { user: true } } },
      });

      await tx.leaveWorkflowLog.create({
        data: {
          leaveRequestId: id,
          status: action,
          remarks: remarks || `Status updated to ${action}`,
          updatedById,
        },
      });

      return updated;
    });
  }

  static async getLeaveRequests(filters: {
    studentId?: string;
    classId?: string;
    departmentId?: string;
    status?: string;
  }) {
    const where: any = {};
    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.status) where.status = filters.status;
    if (filters.classId || filters.departmentId) {
      where.student = {};
      if (filters.classId) where.student.classId = filters.classId;
      if (filters.departmentId) where.student.departmentId = filters.departmentId;
    }

    return prisma.leaveRequest.findMany({
      where,
      include: {
        student: {
          include: {
            class: { include: { department: true, semester: true, section: true } },
          },
        },
        workflowLogs: {
          include: { updatedBy: true },
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getLeaveRequestById(id: string) {
    return prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            class: { include: { department: true, semester: true, section: true } },
          },
        },
        workflowLogs: {
          include: { updatedBy: true },
          orderBy: { timestamp: 'asc' },
        },
      },
    });
  }
}
