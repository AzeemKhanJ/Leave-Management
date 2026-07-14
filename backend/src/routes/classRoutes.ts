import { Router } from "express";
import { ClassController } from "../controllers/classController";

const router = Router();

// Statistics
router.get("/statistics", ClassController.getStatistics);

// Dropdown data
router.get("/departments", ClassController.getDepartments);
router.get("/semesters", ClassController.getSemesters);
router.get("/sections", ClassController.getSections);

// CRUD
router.get("/", ClassController.getAllClasses);
router.get("/:id", ClassController.getClassById);
router.post("/", ClassController.createClass);
router.put("/:id", ClassController.updateClass);
router.delete("/:id", ClassController.deleteClass);

export default router;