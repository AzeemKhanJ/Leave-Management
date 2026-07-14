import { Response, NextFunction } from 'express';
import { LeaveService } from '../services/leaveService';
import { LeaveRepository } from '../repository/leaveRepository';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as zodSchemas from '../models/zodSchemas';

export class LeaveController {
  static async applyLeave(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.studentId) {
        return res.status(400).json({ success: false, message: 'Student profile required' });
      }
      const data = zodSchemas.leaveRequestCreateSchema.parse(req.body);
      const result = await LeaveService.applyLeave(req.user.studentId, data);
      res.status(201).json({ success: true, message: 'Leave request submitted successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async reviewLeave(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, remarks } = zodSchemas.leaveActionSchema.parse(req.body);
      const result = await LeaveService.reviewLeave(id, status, remarks, req.user);
      res.status(200).json({ success: true, message: `Leave request status updated to ${status}`, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getLeaves(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

      let filters: any = {};
      if (req.user.role === 'STUDENT') {
        filters.studentId = req.user.studentId;
      } else if (req.user.role === 'TEACHER') {
        // Teachers see leaves in their department
        filters.departmentId = req.user.departmentId;
      } else if (req.user.role === 'ADMIN') {
        // Admin sees all leaves
      }

      const { status } = req.query;
      if (status) filters.status = status as string;

      const result = await LeaveRepository.getLeaveRequests(filters);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getLeaveById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await LeaveRepository.getLeaveRequestById(id);
      if (!result) return res.status(404).json({ success: false, message: 'Leave request not found' });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
