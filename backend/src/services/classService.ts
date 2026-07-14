import { ClassRepository } from "../repository/classRepository";

export class ClassService {
  /**
   * Get all classes
   */
  static async getAllClasses() {
    return await ClassRepository.getAllClasses();
  }

  /**
   * Get class by ID
   */
  static async getClassById(id: string) {
    const cls = await ClassRepository.getClassById(id);

    if (!cls) {
      throw new Error("Class not found.");
    }

    return cls;
  }

  /**
   * Create new class
   */
  static async createClass(data: {
    departmentId: string;
    semesterId: string;
    sectionId: string;
  }) {
    if (!data.departmentId) {
      throw new Error("Department is required.");
    }

    if (!data.semesterId) {
      throw new Error("Semester is required.");
    }

    if (!data.sectionId) {
      throw new Error("Section is required.");
    }

    // Prevent duplicate class creation
    const exists = await ClassRepository.classExists(
      data.departmentId,
      data.semesterId,
      data.sectionId
    );

    if (exists) {
      throw new Error(
        "This class already exists for the selected Department, Semester and Section."
      );
    }

    return await ClassRepository.createClass(data);
  }

  /**
   * Update class
   */
  static async updateClass(
    id: string,
    data: {
      departmentId: string;
      semesterId: string;
      sectionId: string;
    }
  ) {
    const cls = await ClassRepository.getClassById(id);

    if (!cls) {
      throw new Error("Class not found.");
    }

    return await ClassRepository.updateClass(id, data);
  }

  /**
   * Delete class
   */
  static async deleteClass(id: string) {
    const cls = await ClassRepository.getClassById(id);

    if (!cls) {
      throw new Error("Class not found.");
    }

    return await ClassRepository.deleteClass(id);
  }

  /**
   * Dropdown - Departments
   */
  static async getDepartments() {
    return await ClassRepository.getDepartments();
  }

  /**
   * Dropdown - Semesters
   */
  static async getSemesters() {
    return await ClassRepository.getSemesters();
  }

  /**
   * Dropdown - Sections
   */
  static async getSections() {
    return await ClassRepository.getSections();
  }

  /**
   * Dashboard statistics
   */
  static async getStatistics() {
    const totalClasses = await ClassRepository.countClasses();

    return {
      totalClasses,
    };
  }
}