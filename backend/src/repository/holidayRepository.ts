import { prisma } from '../config/db';

export class HolidayRepository {
  static async createHoliday(name: string, date: Date, type: 'GOVERNMENT' | 'COLLEGE', isWorkingDay: boolean = false) {
    return prisma.holiday.upsert({
      where: { date },
      update: { name, type, isWorkingDay },
      create: { name, date, type, isWorkingDay },
    });
  }

  static async getAllHolidays() {
    return prisma.holiday.findMany({
      orderBy: { date: 'asc' },
    });
  }

  static async deleteHoliday(id: string) {
    return prisma.holiday.delete({ where: { id } });
  }

  static async isHoliday(date: Date) {
    const holiday = await prisma.holiday.findUnique({
      where: { date },
    });
    return holiday ? holiday : null;
  }
}
