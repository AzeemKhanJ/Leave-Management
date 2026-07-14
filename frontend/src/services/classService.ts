import api from "./api";

export interface ClassPayload {
  departmentId: string;
  semesterId: string;
  sectionId: string;
}

export const ClassService = {
  // Get all classes
  async getAll() {
    const res = await api.get("/classes");
    return res.data;
  },

  // Get one class
  async getById(id: string) {
    const res = await api.get(`/classes/${id}`);
    return res.data;
  },

  // Create class
  async create(data: ClassPayload) {
    const res = await api.post("/classes", data);
    return res.data;
  },

  // Update class
  async update(id: string, data: ClassPayload) {
    const res = await api.put(`/classes/${id}`, data);
    return res.data;
  },

  // Delete class
  async delete(id: string) {
    const res = await api.delete(`/classes/${id}`);
    return res.data;
  },

  // Dropdown data
  async getDepartments() {
    const res = await api.get("/classes/departments");
    return res.data;
  },

  async getSemesters() {
    const res = await api.get("/classes/semesters");
    return res.data;
  },

  async getSections() {
    const res = await api.get("/classes/sections");
    return res.data;
  },

  async getStatistics() {
    const res = await api.get("/classes/statistics");
    return res.data;
  },
};