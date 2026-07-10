import { useState, useEffect } from "react";
import { CheckCircle, XCircle, BookOpen, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { studentService } from "../../services/studentService";
import { classService } from "../../services/classService";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { Badge } from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate } from "../../utils/helpers";

export default function PendingStudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [{ data: sp }, { data: cl }] = await Promise.all([
        studentService.getPending(),
        classService.getAll(),
      ]);
      setStudents(sp.data || []);
      setClasses(cl.data || []);
    } catch (error) {
      console.error("Load error:", error);
      toast.error("Failed to load pending students");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    const student = students.find((s) => s._id === id);
    if (!student?.assignedClass) {
      toast.error("Please assign a class to this student before approving");
      return;
    }

    setActionLoading(id);
    try {
      await studentService.approve(id);
      toast.success("Student approved successfully!");
      await load();
    } catch (err) {
      console.error("Approve error:", err);
      const message = err.response?.data?.message || "Failed to approve";
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id) {
    setActionLoading(id);
    try {
      await studentService.reject(id);
      toast.success("Student rejected");
      await load();
    } catch (err) {
      console.error("Reject error:", err);
      const message = err.response?.data?.message || "Failed to reject";
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAssignClass() {
    if (!selectedClass) {
      toast.error("Please select a class");
      return;
    }

    setSubmitting(true);
    try {
      console.log("Assigning class:", {
        studentId: assignModal._id,
        classId: selectedClass,
      });

      const response = await studentService.assignClass(
        assignModal._id,
        selectedClass,
      );
      console.log("Assign class response:", response);

      toast.success("Class assigned successfully!");
      await load();
      setAssignModal(null);
      setSelectedClass("");
    } catch (err) {
      console.error("Assign class error:", err);
      console.log("Error response:", err.response);
      console.log("Error data:", err.response?.data);

      const message = err.response?.data?.message || "Failed to assign class";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <SkeletonTable rows={5} cols={6} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Pending Approvals
          </h2>
          <p className="text-sm text-slate-500">
            {students.length} student{students.length !== 1 ? "s" : ""} awaiting
            review
          </p>
        </div>
        {students.length > 0 && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-medium px-4 py-2 rounded-xl">
            <UserPlus className="w-4 h-4" />
            {students.length} pending
          </div>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        {students.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="No pending students"
            description="All registrations have been processed."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-th">Student</th>
                  <th className="table-th">Phone</th>
                  <th className="table-th">Kflat</th>
                  <th className="table-th">Assigned Class</th>
                  <th className="table-th">Registered</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s._id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 last:border-0"
                  >
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold">
                          {s.userId?.fullName?.slice(0, 2)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {s.userId?.fullName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-slate-500">
                      {s.userId?.phoneNumber}
                    </td>
                    <td className="table-td">
                      <span className="text-sm text-slate-600">
                        {s.kflat?.name || "—"}
                      </span>
                    </td>
                    <td className="table-td">
                      {s.assignedClass?.className ? (
                        <Badge
                          status="ASSIGNED"
                          className="bg-emerald-100 text-emerald-700"
                        >
                          {s.assignedClass.className}
                        </Badge>
                      ) : (
                        <span className="text-xs text-red-500 font-medium">
                          ⚠️ Not assigned
                        </span>
                      )}
                    </td>
                    <td className="table-td text-slate-500">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleApprove(s._id)}
                          disabled={actionLoading === s._id || !s.assignedClass}
                          className={`btn-success text-xs py-1.5 px-3 ${
                            !s.assignedClass
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          title={
                            !s.assignedClass
                              ? "Assign a class first"
                              : "Approve student"
                          }
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {actionLoading === s._id ? "..." : "Approve"}
                        </button>

                        <button
                          onClick={() => {
                            setAssignModal(s);
                            setSelectedClass(s.assignedClass?._id || "");
                          }}
                          className="btn-secondary text-xs py-1.5 px-3"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          {s.assignedClass ? "Change Class" : "Assign Class"}
                        </button>

                        <button
                          onClick={() => handleReject(s._id)}
                          disabled={actionLoading === s._id}
                          className="btn-danger text-xs py-1.5 px-3"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Class Modal */}
      <Modal
        isOpen={!!assignModal}
        onClose={() => {
          setAssignModal(null);
          setSelectedClass("");
        }}
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
              onClick={() => {
                setAssignModal(null);
                setSelectedClass("");
              }}
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
