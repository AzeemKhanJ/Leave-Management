import { prisma } from '../config/db';

export class DepartmentRepository {
  // Departments
  static async createDepartment(name: string, code: string) {
    return prisma.department.create({ data: { name, code } });
  }

  static async getAllDepartments() {
    return prisma.department.findMany({ orderBy: { name: 'asc' } });
  }

  static async findDepartmentById(id: string) {
    return prisma.department.findUnique({ where: { id } });
  }

  static async deleteDepartment(id: string) {
    return prisma.department.delete({ where: { id } });
  }

  // Academic Years
  static async createAcademicYear(name: string, active: boolean) {
    if (active) {
      await prisma.academicYear.updateMany({ data: { active: false } });
    }
    return prisma.academicYear.create({ data: { name, active } });
  }

  static async getAllAcademicYears() {
    return prisma.academicYear.findMany({ orderBy: { name: 'desc' } });
  }

  static async deleteAcademicYear(id: string) {
    return prisma.academicYear.delete({ where: { id } });
  }

  // Semesters
  static async createSemester(number: number, academicYearId: string, active: boolean) {
    if (active) {
      await prisma.semester.updateMany({
        where: { academicYearId },
        data: { active: false },
      });
    }
    return prisma.semester.create({
      data: { number, academicYearId, active },
    });
  }

  static async getAllSemesters() {
    return prisma.semester.findMany({
      include: { academicYear: true },
      orderBy: [{ academicYear: { name: 'desc' } }, { number: 'asc' }],
    });
  }

  static async deleteSemester(id: string) {
    return prisma.semester.delete({ where: { id } });
  }

  // Sections
  static async createSection(name: string) {
    return prisma.section.create({ data: { name } });
  }

  static async getAllSections() {
    return prisma.section.findMany({ orderBy: { name: 'asc' } });
  }

  static async deleteSection(id: string) {
    return prisma.section.delete({ where: { id } });
  }

  // Classes
  static async createClass(departmentId: string, semesterId: string, sectionId: string) {
    return prisma.class.create({
      data: { departmentId, semesterId, sectionId },
    });
  }

  static async getAllClasses() {
    return prisma.class.findMany({
      include: {
        department: true,
        semester: { include: { academicYear: true } },
        section: true,
      },
    });
  }

  static async deleteClass(id: string) {
    return prisma.class.delete({ where: { id } });
  }

  // Subjects
  static async createSubject(name: string, code: string, departmentId: string, semesterId: string) {
    return prisma.subject.create({
      data: { name, code, departmentId, semesterId },
    });
  }

  static async getAllSubjects() {
    return prisma.subject.findMany({
      include: {
        department: true,
        semester: { include: { academicYear: true } },
      },
      orderBy: { code: 'asc' },
    });
  }

  static async deleteSubject(id: string) {
    return prisma.subject.delete({ where: { id } });
  }

  // Teacher Assignments
  static async assignTeacher(teacherId: string, classId: string, subjectId: string) {
    return prisma.teacherClassSubject.create({
      data: { teacherId, classId, subjectId },
    });
  }

  static async getTeacherAssignments() {
    return prisma.teacherClassSubject.findMany({
      include: {
        teacher: true,
        class: {
          include: {
            department: true,
            semester: true,
            section: true,
          },
        },
        subject: true,
      },
    });
  }

  static async removeTeacherAssignment(id: string) {
    return prisma.teacherClassSubject.delete({ where: { id } });
  }

  // Timetable
  static async createTimetable(
    classId: string,
    subjectId: string,
    teacherId: string,
    dayOfWeek: string,
    periodNumber: number
  ) {
    return prisma.timetable.upsert({
      where: {
        classId_dayOfWeek_periodNumber: { classId, dayOfWeek, periodNumber },
      },
      update: { subjectId, teacherId },
      create: { classId, subjectId, teacherId, dayOfWeek, periodNumber },
    });
  }

  static async getTimetableForClass(classId: string) {
    return prisma.timetable.findMany({
      where: { classId },
      include: {
        subject: true,
        teacher: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { periodNumber: 'asc' }],
    });
  }

  static async getTimetableForTeacher(teacherId: string) {
    return prisma.timetable.findMany({
      where: { teacherId },
      include: {
        class: {
          include: {
            department: true,
            semester: true,
            section: true,
          },
        },
        subject: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { periodNumber: 'asc' }],
    });
  }

  static async deleteTimetableEntry(id: string) {
    return prisma.timetable.delete({ where: { id } });
  }
}
