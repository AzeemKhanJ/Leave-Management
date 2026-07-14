import { LeaveRepository } from '../repository/leaveRepository';
import { AuditLogRepository } from '../repository/auditLogRepository';
import { prisma } from '../config/db';

export class LeaveService {
  static async applyLeave(
    studentId: string,
    data: {
      fromDate: string;
      toDate: string;
      reason: string;
      leaveType: string;
      attachmentUrl?: string;
    }
  ) {
    const from = new Date(data.fromDate);
    const to = new Date(data.toDate);

    const result = await LeaveRepository.createLeaveRequest({
      studentId,
      fromDate: from,
      toDate: to,
      reason: data.reason,
      leaveType: data.leaveType,
      attachmentUrl: data.attachmentUrl,
    });

    // Log audit
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (student) {
      await AuditLogRepository.log({
        userId: student.userId,
        username: student.name,
        role: 'STUDENT',
        actionType: 'LEAVE_ACTIVITY',
        description: `Applied for leave from ${data.fromDate} to ${data.toDate}. Reason: ${data.reason}`,
      });
    }

    return result;
  }

  static async reviewLeave(
    leaveId: string,
    action: 'TEACHER_APPROVED' | 'ADMIN_APPROVED' | 'REJECTED',
    remarks: string | undefined,
    user: any
  ) {
    const leave = await LeaveRepository.getLeaveRequestById(leaveId);
    if (!leave) throw new Error('Leave request not found');

    let finalAction: 'TEACHER_APPROVED' | 'ADMIN_APPROVED' | 'REJECTED' = action;
    
    // Check validation of role
    if (user.role === 'TEACHER') {
      if (action === 'ADMIN_APPROVED') {
        throw new Error('Teachers cannot perform final Admin Approval');
      }
      if (leave.status !== 'PENDING') {
        throw new Error('Leave request must be in PENDING status for teacher review');
      }
    }

    if (user.role === 'ADMIN') {
      if (action === 'TEACHER_APPROVED') {
        throw new Error('Admin must perform final approval or rejection');
      }
      // Admin can approve if teacher has approved, or even bypass if needed (we will allow admin action if status is PENDING or TEACHER_APPROVED)
    }

    // Map ADMIN_APPROVED to final "APPROVED" state (or keep "APPROVED" as status value)
    const result = await LeaveRepository.updateLeaveStatus(
      leaveId,
      finalAction,
      remarks,
      user.id
    );

    // If final Admin Approved, let's also update status to 'APPROVED' in the database to be clean
    if (finalAction === 'ADMIN_APPROVED') {
      await prisma.leaveRequest.update({
        where: { id: leaveId },
        data: { status: 'APPROVED' },
      });
    }

    await AuditLogRepository.log({
      userId: user.id,
      username: user.username,
      role: user.role,
      actionType: 'LEAVE_ACTIVITY',
      description: `Leave Request ID: ${leaveId} was reviewed. Action: ${action}. Remarks: ${remarks || 'None'}`,
    });

    return result;
  }
}
