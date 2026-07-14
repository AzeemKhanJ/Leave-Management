import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash passwords
  const passwordHash1 = await bcrypt.hash('Admin@123', 10);
  const passwordHash2 = await bcrypt.hash('Admin@AIDS', 10);

  // Clear existing data to ensure empty state
  await prisma.auditLog.deleteMany({});
  await prisma.holiday.deleteMany({});
  await prisma.leaveWorkflowLog.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.attendanceEditHistory.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.timetable.deleteMany({});
  await prisma.teacherClassSubject.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.semester.deleteMany({});
  await prisma.academicYear.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed Admin Accounts
  await prisma.user.create({
    data: {
      username: 'admin',
      passwordHash: passwordHash1,
      role: 'ADMIN',
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      username: 'AIDS',
      passwordHash: passwordHash2,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('Database seeded successfully with ADMIN users.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
