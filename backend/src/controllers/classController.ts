import { Request, Response, NextFunction } from "express";
import { ClassService } from "../services/classService";

export class ClassController {
  /**
   * GET /api/classes
   */
  static async getAllClasses(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const classes = await ClassService.getAllClasses();

      return res.status(200).json({
        success: true,
        count: classes.length,
        data: classes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/classes/:id
   */
  static async getClassById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      const cls = await ClassService.getClassById(id);

      return res.status(200).json({
        success: true,
        data: cls,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/classes
   */
  static async createClass(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await ClassService.createClass(req.body);

      return res.status(201).json({
        success: true,
        message: "Class created successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/classes/:id
   */
  static async updateClass(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      const result = await ClassService.updateClass(id, req.body);

      return res.status(200).json({
        success: true,
        message: "Class updated successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/classes/:id
   */
  static async deleteClass(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      await ClassService.deleteClass(id);

      return res.status(200).json({
        success: true,
        message: "Class deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/classes/departments
   */
  static async getDepartments(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const departments = await ClassService.getDepartments();

      return res.status(200).json({
        success: true,
        data: departments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/classes/semesters
   */
  static async getSemesters(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const semesters = await ClassService.getSemesters();

      return res.status(200).json({
        success: true,
        data: semesters,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/classes/sections
   */
  static async getSections(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const sections = await ClassService.getSections();

      return res.status(200).json({
        success: true,
        data: sections,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/classes/statistics
   */
  static async getStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const stats = await ClassService.getStatistics();

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}