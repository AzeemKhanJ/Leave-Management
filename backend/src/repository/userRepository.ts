import { prisma } from '../config/db';

export class UserRepository {
  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        teacher: { include: { department: true } },
        student: { include: { department: true, class: { include: { semester: true, section: true } } } },
      },
    });
  }

  static async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  static async createTeacher(data: {
    username: string;
    passwordHash: string;
    employeeId: string;
    name: string;
    email: string;
    phone?: string;
    departmentId: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: data.username,
          passwordHash: data.passwordHash,
          role: 'TEACHER',
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          employeeId: data.employeeId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          departmentId: data.departmentId,
        },
      });

      return { user, teacher };
    });
  }

  static async updateTeacher(
    id: string,
    data: {
      name: string;
      email: string;
      phone?: string;
      departmentId: string;
    }
  ) {
    return prisma.teacher.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        departmentId: data.departmentId,
      },
    });
  }

  static async deleteTeacher(id: string) {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) return null;
    return prisma.user.delete({ where: { id: teacher.userId } });
  }

  static async createStudent(data: {
    username: string;
    passwordHash: string;
    registerNumber: string;
    name: string;
    email: string;
    phone?: string;
    departmentId: string;
    classId: string;
    semesterId: string;
    sectionId: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: data.username,
          passwordHash: data.passwordHash,
          role: 'STUDENT',
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          registerNumber: data.registerNumber,
          name: data.name,
          email: data.email,
          phone: data.phone,
          departmentId: data.departmentId,
          classId: data.classId,
          semesterId: data.semesterId,
          sectionId: data.sectionId,
        },
      });

      return { user, student };
    });
  }

  static async updateStudent(
    id: string,
    data: {
      name: string;
      email: string;
      phone?: string;
      departmentId: string;
      classId: string;
      semesterId: string;
      sectionId: string;
    }
  ) {
    return prisma.student.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        departmentId: data.departmentId,
        classId: data.classId,
        semesterId: data.semesterId,
        sectionId: data.sectionId,
      },
    });
  }

  static async deleteStudent(id: string) {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return null;
    return prisma.user.delete({ where: { id: student.userId } });
  }

  static async resetPassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  static async getAllTeachers() {
    return prisma.teacher.findMany({
      include: {
        department: true,
        user: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getAllStudents() {
    return prisma.student.findMany({
      include: {
        department: true,
        class: {
          include: {
            semester: true,
            section: true,
          },
        },
        user: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
