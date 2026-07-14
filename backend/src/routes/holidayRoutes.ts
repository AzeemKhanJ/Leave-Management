import { Router } from 'express';
import { HolidayController } from '../controllers/holidayController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', HolidayController.getHolidays);
router.post('/', authorize(['ADMIN']), HolidayController.createHoliday);
router.delete('/:id', authorize(['ADMIN']), HolidayController.deleteHoliday);

export default router;
