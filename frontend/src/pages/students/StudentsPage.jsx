import { useState, useEffect } from "react";
import { Search, Eye, TrendingUp, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import { studentService } from "../../services/studentService";
import { promotionService } from "../../services/promotionService";
import { classService } from "../../services/classService";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { Badge } from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate } from "../../utils/helpers";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [promoting, setPromoting] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [{ data: studentsData }, { data: classesData }] = await Promise.all(
        [studentService.getAll(), classService.getAll()],
      );
      setStudents(studentsData.data || []);
      setClasses(classesData.data || []);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  async function handlePromote(studentId) {
    setPromoting(studentId);
    try {
      await promotionService.promote(studentId);
      toast.success("Student promoted to Advanced!");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Promotion failed");
    } finally {
      setPromoting(null);
    }
  }

  async function handleAssignClass() {
    if (!selectedClass) {
      toast.error("Select a class");
      return;
    }
    setSubmitting(true);
    try {
      await studentService.assignClass(assignModal._id, selectedClass);
      toast.success("Class assigned successfully!");
      setAssignModal(null);
      setSelectedClass("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign class");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = students.filter(
    (s) =>
      s.userId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.userId?.phoneNumber?.includes(search),
  );

  if (loading) return <SkeletonTable rows={8} cols={7} />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">All Students</h2>
          <p className="text-sm text-slate-500">
            {students.length} students total
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="input pl-9 w-64"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="No students found"
            description="Try adjusting your search"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-th">Student</th>
                  <th className="table-th">Phone</th>
                  <th className="table-th">Class</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Level</th>
                  <th className="table-th">Joined</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s._id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 last:border-0"
                  >
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                          {s.userId?.fullName?.slice(0, 2)?.toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800">
                          {s.userId?.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="table-td text-slate-500">
                      {s.userId?.phoneNumber}
                    </td>
                    <td className="table-td">
                      {s.assignedClass?.className ? (
                        <span className="badge bg-slate-100 text-slate-700">
                          {s.assignedClass.className}
                        </span>
                      ) : (
                        <span className="text-xs text-red-400 font-medium">
                          Not assigned
                        </span>
                      )}
                    </td>
                    <td className="table-td">
                      <Badge status={s.registrationStatus} />
                    </td>
                    <td className="table-td">
                      <Badge status={s.studentStatus} />
                    </td>
                    <td className="table-td text-slate-500">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Assign Class button - always visible */}
                        <button
                          onClick={() => {
                            setAssignModal(s);
                            setSelectedClass(s.assignedClass?._id || "");
                          }}
                          className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
                          title={
                            s.assignedClass ? "Change Class" : "Assign Class"
                          }
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>

                        {s.studentStatus === "FRESH" &&
                          s.registrationStatus === "APPROVED" && (
                            <button
                              onClick={() => handlePromote(s._id)}
                              disabled={promoting === s._id}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors disabled:opacity-50"
                              title="Promote to Advanced"
                            >
                              <TrendingUp className="w-4 h-4" />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title="Student Details"
        size="md"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold">
                {selectedStudent.userId?.fullName?.slice(0, 2)?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {selectedStudent.userId?.fullName}
                </h3>
                <p className="text-slate-500">
                  {selectedStudent.userId?.phoneNumber}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                [
                  "Registration Status",
                  <Badge status={selectedStudent.registrationStatus} />,
                ],
                [
                  "Student Level",
                  <Badge status={selectedStudent.studentStatus} />,
                ],
                [
                  "Assigned Class",
                  selectedStudent.assignedClass?.className || "Not assigned",
                ],
                ["Kflat", selectedStudent.kflat?.name || "None"],
                [
                  "Kflat Role",
                  selectedStudent.kflatRole?.roleName?.en ||
                    selectedStudent.customKflatRole ||
                    "None",
                ],
                ["Joined", formatDate(selectedStudent.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Class Modal */}
      <Modal
        isOpen={!!assignModal}
        onClose={() => setAssignModal(null)}
        title={assignModal?.assignedClass ? "Change Class" : "Assign Class"}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {assignModal?.assignedClass
              ? `Change the class for ${assignModal?.userId?.fullName}`
              : `Assign a class to ${assignModal?.userId?.fullName}`}
          </p>
          <div>
            <label className="label">Select Class</label>
            <select
              className="input"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Choose a class...</option>
              {classes.map((c) => {
                const isFull = c.currentStudents >= c.maxStudents;
                return (
                  <option key={c._id} value={c._id} disabled={isFull}>
                    {c.className} ({c.classType}) — {c.currentStudents}/
                    {c.maxStudents} students
                    {isFull ? " (FULL)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAssignClass}
              className="btn-primary flex-1"
              disabled={submitting || !selectedClass}
            >
              {submitting
                ? "Assigning..."
                : assignModal?.assignedClass
                  ? "Update Class"
                  : "Assign Class"}
            </button>
            <button
              onClick={() => setAssignModal(null)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
