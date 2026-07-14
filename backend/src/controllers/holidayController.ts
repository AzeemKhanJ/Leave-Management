import { Response, NextFunction } from 'express';
import { HolidayRepository } from '../repository/holidayRepository';
import { AuditLogRepository } from '../repository/auditLogRepository';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as zodSchemas from '../models/zodSchemas';

export class HolidayController {
  static async createHoliday(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, date, type, isWorkingDay } = zodSchemas.holidayCreateSchema.parse(req.body);
      const formattedDate = new Date(date);
      formattedDate.setHours(0, 0, 0, 0);

      const result = await HolidayRepository.createHoliday(name, formattedDate, type, isWorkingDay);

      if (req.user) {
        await AuditLogRepository.log({
          userId: req.user.id,
          username: req.user.username,
          role: req.user.role,
          actionType: 'USER_ACTIVITY',
          description: `Created Holiday: ${name} on ${date} (${type})`,
        });
      }

      res.status(201).json({ success: true, message: 'Holiday created successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getHolidays(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await HolidayRepository.getAllHolidays();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async deleteHoliday(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await HolidayRepository.deleteHoliday(id);

      if (req.user) {
        await AuditLogRepository.log({
          userId: req.user.id,
          username: req.user.username,
          role: req.user.role,
          actionType: 'USER_ACTIVITY',
          description: `Deleted Holiday ID: ${id}`,
        });
      }

      res.status(200).json({ success: true, message: 'Holiday deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
