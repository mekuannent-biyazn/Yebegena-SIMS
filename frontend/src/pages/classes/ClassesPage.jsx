import { useState, useEffect } from "react";
import { Plus, BookOpen, Users, UserCog } from "lucide-react";
import toast from "react-hot-toast";
import { classService } from "../../services/classService";
import { teacherService } from "../../services/teacherService";
import { SkeletonTable } from "../../components/ui/Skeleton";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { Badge } from "../../components/ui/Badge";

const emptyForm = { className: "", classType: "FRESH", maxStudents: 30 };

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [{ data: cl }, { data: tc }] = await Promise.all([
        classService.getAll(),
        teacherService.getAll(),
      ]);
      setClasses(cl.data || []);
      setTeachers(tc.data || []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await classService.create(form);
      toast.success("Class created!");
      setCreateOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create class");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAssignTeacher() {
    if (!selectedTeacher) {
      toast.error("Select a teacher");
      return;
    }
    setSubmitting(true);
    try {
      await classService.assignTeacher(assignOpen._id, selectedTeacher);
      toast.success("Teacher assigned!");
      setAssignOpen(null);
      setSelectedTeacher("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign teacher");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <SkeletonTable rows={5} cols={5} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Classes</h2>
          <p className="text-sm text-slate-500">
            {classes.length} classes total
          </p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Class
        </button>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={BookOpen}
            title="No classes yet"
            description="Create the first class to get started"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c) => {
            const pct =
              c.maxStudents > 0
                ? Math.round((c.currentStudents / c.maxStudents) * 100)
                : 0;
            return (
              <div
                key={c._id}
                className="card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 bg-blue-50 rounded-xl">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <Badge status={c.classType} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">
                  {c.className}
                </h3>
                {c.teacher ? (
                  <p className="text-sm text-slate-500 mb-3">
                    Teacher:{" "}
                    <span className="font-medium text-slate-700">
                      {c.teacher?.userId?.fullName}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-yellow-600 mb-3">
                    No teacher assigned
                  </p>
                )}

                {/* Capacity bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> Students
                    </span>
                    <span>
                      {c.currentStudents}/{c.maxStudents}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-400" : pct >= 70 ? "bg-yellow-400" : "bg-emerald-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setAssignOpen(c);
                    setSelectedTeacher("");
                  }}
                  className="btn-secondary w-full text-xs"
                >
                  <UserCog className="w-3.5 h-3.5" />
                  {c.teacher ? "Reassign Teacher" : "Assign Teacher"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Class"
        size="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Class Name</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Fresh Group A"
              value={form.className}
              onChange={(e) => setForm({ ...form, className: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Class Type</label>
            <select
              className="input"
              value={form.classType}
              onChange={(e) => setForm({ ...form, classType: e.target.value })}
            >
              <option value="FRESH">Fresh</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          <div>
            <label className="label">Max Students</label>
            <input
              type="number"
              className="input"
              min={1}
              max={100}
              value={form.maxStudents}
              onChange={(e) =>
                setForm({ ...form, maxStudents: Number(e.target.value) })
              }
              required
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Class"}
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Teacher Modal */}
      <Modal
        isOpen={!!assignOpen}
        onClose={() => setAssignOpen(null)}
        title="Assign Teacher"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Assign a teacher to <strong>{assignOpen?.className}</strong>
          </p>
          <div>
            <label className="label">Select Teacher</label>
            <select
              className="input"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
            >
              <option value="">Choose a teacher...</option>
              {teachers
                .filter((t) => {
                  if (assignOpen?.classType === "FRESH")
                    return t.teacherType === "FRESH_TEACHER";
                  if (assignOpen?.classType === "ADVANCED")
                    return t.teacherType === "ADVANCED_TEACHER";
                  return true;
                })
                .map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.userId?.fullName} ({t.teacherType})
                  </option>
                ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAssignTeacher}
              className="btn-primary flex-1"
              disabled={submitting}
            >
              {submitting ? "Assigning..." : "Assign"}
            </button>
            <button
              onClick={() => setAssignOpen(null)}
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
