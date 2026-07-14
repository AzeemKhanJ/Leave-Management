import { prisma } from "../config/db";

export class ClassRepository {
  /**
   * Get all classes with related information
   */
  static async getAllClasses() {
    return await prisma.class.findMany({
      include: {
        department: true,
        semester: {
          include: {
            academicYear: true,
          },
        },
        section: true,
      },
      orderBy: [
        {
          department: {
            code: "asc",
          },
        },
        {
          semester: {
            number: "asc",
          },
        },
        {
          section: {
            name: "asc",
          },
        },
      ],
    });
  }

  /**
   * Get one class by ID
   */
  static async getClassById(id: string) {
    return await prisma.class.findUnique({
      where: {
        id,
      },
      include: {
        department: true,
        semester: {
          include: {
            academicYear: true,
          },
        },
        section: true,
      },
    });
  }

  /**
   * Create a new class
   */
  static async createClass(data: {
    departmentId: string;
    semesterId: string;
    sectionId: string;
  }) {
    return await prisma.class.create({
      data: {
        departmentId: data.departmentId,
        semesterId: data.semesterId,
        sectionId: data.sectionId,
      },
      include: {
        department: true,
        semester: {
          include: {
            academicYear: true,
          },
        },
        section: true,
      },
    });
  }

  /**
   * Update existing class
   */
  static async updateClass(
    id: string,
    data: {
      departmentId: string;
      semesterId: string;
      sectionId: string;
    }
  ) {
    return await prisma.class.update({
      where: {
        id,
      },
      data: {
        departmentId: data.departmentId,
        semesterId: data.semesterId,
        sectionId: data.sectionId,
      },
      include: {
        department: true,
        semester: {
          include: {
            academicYear: true,
          },
        },
        section: true,
      },
    });
  }

  /**
   * Delete class
   */
  static async deleteClass(id: string) {
    return await prisma.class.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Check if the same class combination already exists
   */
  static async classExists(
    departmentId: string,
    semesterId: string,
    sectionId: string
  ) {
    return await prisma.class.findFirst({
      where: {
        departmentId,
        semesterId,
        sectionId,
      },
    });
  }

  /**
   * Count total classes
   */
  static async countClasses() {
    return await prisma.class.count();
  }

  /**
   * Get departments for dropdown
   */
  static async getDepartments() {
  return await prisma.department.findMany({
    orderBy: {
      code: "asc",
    },
  });
}

  /**
   * Get semesters for dropdown
   */
  static async getSemesters() {
  return await prisma.semester.findMany({
    where: {
      active: true,
    },
    include: {
      academicYear: true,
    },
    orderBy: [
      {
        academicYear: {
          name: "desc",
        },
      },
      {
        number: "asc",
      },
    ],
  });
}

  /**
   * Get sections for dropdown
   */
  static async getSections() {
  return await prisma.section.findMany({
    orderBy: {
      name: "asc",
    },
  });
}
}