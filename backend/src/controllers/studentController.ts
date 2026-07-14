import { Response, NextFunction } from 'express';
import { StudentService } from '../services/studentService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class StudentController {
  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.studentId) {
        return res.status(400).json({ success: false, message: 'Student profile not found' });
      }
      const result = await StudentService.getStudentDashboardData(req.user.studentId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
