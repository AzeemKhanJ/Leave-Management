import React, { useEffect, useMemo, useState } from "react";
import { ClassService } from "../../services/classService";

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Semester {
  id: string;
  number: number;
}

interface Section {
  id: string;
  name: string;
}

interface ClassData {
  id: string;
  departmentId: string;
  semesterId: string;
  sectionId: string;

  department: Department;
  semester: Semester;
  section: Section;

  createdAt: string;
  updatedAt: string;
}

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassData[]>([]);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const totalPages = useMemo(() => {
    return Math.ceil(filteredClasses.length / pageSize);
  }, [filteredClasses]);

  const paginatedClasses = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredClasses.slice(start, start + pageSize);
  }, [filteredClasses, page]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        classRes,
        departmentRes,
        semesterRes,
        sectionRes,
      ] = await Promise.all([
        ClassService.getAll(),
        ClassService.getDepartments(),
        ClassService.getSemesters(),
        ClassService.getSections(),
      ]);

      setClasses(classRes.data || []);
      setFilteredClasses(classRes.data || []);

      setDepartments(departmentRes.data || []);
      setSemesters(semesterRes.data || []);
      setSections(sectionRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredClasses(classes);
      return;
    }

    const keyword = search.toLowerCase();

    setFilteredClasses(
      classes.filter((c) =>
        c.department.name.toLowerCase().includes(keyword) ||
        c.department.code.toLowerCase().includes(keyword) ||
        c.section.name.toLowerCase().includes(keyword) ||
        c.semester.number.toString().includes(keyword)
      )
    );
  }, [search, classes]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Classes</h1>

      <input
        type="text"
        placeholder="Search classes..."
        className="border rounded-lg px-4 py-2 w-full mb-5"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p>Loading classes...</p>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Department</th>
              <th className="border p-2">Semester</th>
              <th className="border p-2">Section</th>
            </tr>
          </thead>

          <tbody>
            {paginatedClasses.map((cls) => (
              <tr key={cls.id}>
                <td className="border p-2">
                  {cls.department.code}
                </td>

                <td className="border p-2">
                  Semester {cls.semester.number}
                </td>

                <td className="border p-2">
                  {cls.section.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-5">
        Page {page} of {totalPages || 1}
      </div>
    </div>
  );
};

export default Classes;