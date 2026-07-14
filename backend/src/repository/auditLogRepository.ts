import { prisma } from '../config/db';

export class AuditLogRepository {
  static async log(data: {
    userId?: string;
    username: string;
    role: string;
    actionType: 'LOGIN' | 'USER_ACTIVITY' | 'ATTENDANCE_ACTIVITY' | 'LEAVE_ACTIVITY';
    description: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.auditLog.create({
      data: {
        userId: data.userId || null,
        username: data.username,
        role: data.role,
        actionType: data.actionType,
        description: data.description,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    });
  }

  static async getLogs(filters: {
    role?: string;
    actionType?: string;
    username?: string;
  }) {
    const where: any = {};
    if (filters.role) where.role = filters.role;
    if (filters.actionType) where.actionType = filters.actionType;
    if (filters.username) {
      where.username = { contains: filters.username };
    }

    return prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 1000,
    });
  }
}
