import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const teacherCreateSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  departmentId: z.string().uuid('Invalid Department ID'),
});

export const teacherEditSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  departmentId: z.string().uuid('Invalid Department ID'),
});

export const studentCreateSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  registerNumber: z.string().min(1, 'Register number is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  departmentId: z.string().uuid('Invalid Department ID'),
  classId: z.string().uuid('Invalid Class ID'),
  semesterId: z.string().uuid('Invalid Semester ID'),
  sectionId: z.string().uuid('Invalid Section ID'),
});

export const studentEditSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  departmentId: z.string().uuid('Invalid Department ID'),
  classId: z.string().uuid('Invalid Class ID'),
  semesterId: z.string().uuid('Invalid Semester ID'),
  sectionId: z.string().uuid('Invalid Section ID'),
});

export const passwordResetSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const departmentCreateSchema = z.object({
  name: z.string().min(1, 'Department Name is required'),
  code: z.string().min(1, 'Department Code is required'),
});

export const academicYearCreateSchema = z.object({
  name: z.string().min(1, 'Academic Year Name is required (e.g. 2025-2026)'),
  active: z.boolean().default(true),
});

export const semesterCreateSchema = z.object({
  number: z.number().int().min(1).max(8),
  academicYearId: z.string().uuid('Invalid Academic Year ID'),
  active: z.boolean().default(true),
});

export const sectionCreateSchema = z.object({
  name: z.string().min(1, 'Section name is required'),
});

export const classCreateSchema = z.object({
  departmentId: z.string().uuid('Invalid Department ID'),
  semesterId: z.string().uuid('Invalid Semester ID'),
  sectionId: z.string().uuid('Invalid Section ID'),
});

export const subjectCreateSchema = z.object({
  name: z.string().min(1, 'Subject Name is required'),
  code: z.string().min(1, 'Subject Code is required'),
  departmentId: z.string().uuid('Invalid Department ID'),
  semesterId: z.string().uuid('Invalid Semester ID'),
});

export const assignTeacherSchema = z.object({
  teacherId: z.string().uuid('Invalid Teacher ID'),
  classId: z.string().uuid('Invalid Class ID'),
  subjectId: z.string().uuid('Invalid Subject ID'),
});

export const timetableCreateSchema = z.object({
  classId: z.string().uuid('Invalid Class ID'),
  subjectId: z.string().uuid('Invalid Subject ID'),
  teacherId: z.string().uuid('Invalid Teacher ID'),
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']),
  periodNumber: z.number().int().min(1).max(8),
});

export const attendanceSubmitSchema = z.object({
  classId: z.string().uuid('Invalid Class ID'),
  subjectId: z.string().uuid('Invalid Subject ID'),
  date: z.string().min(1, 'Date is required'), // ISO or YYYY-MM-DD
  periodNumber: z.number().int().min(1).max(8),
  records: z.array(
    z.object({
      studentId: z.string().uuid('Invalid Student ID'),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
      remarks: z.string().optional(),
    })
  ),
});

export const attendanceEditSchema = z.object({
  status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
  reason: z.string().min(1, 'Reason for modification is required'),
});

export const leaveRequestCreateSchema = z.object({
  fromDate: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
  reason: z.string().min(1, 'Reason is required'),
  leaveType: z.enum(['MEDICAL', 'PERSONAL', 'ON_DUTY', 'EMERGENCY', 'OTHERS']),
  attachmentUrl: z.string().optional(),
});

export const leaveActionSchema = z.object({
  status: z.enum(['TEACHER_APPROVED', 'ADMIN_APPROVED', 'REJECTED']),
  remarks: z.string().optional(),
});

export const holidayCreateSchema = z.object({
  name: z.string().min(1, 'Holiday name is required'),
  date: z.string().min(1, 'Holiday date is required'),
  type: z.enum(['GOVERNMENT', 'COLLEGE']),
  isWorkingDay: z.boolean().default(false),
});
