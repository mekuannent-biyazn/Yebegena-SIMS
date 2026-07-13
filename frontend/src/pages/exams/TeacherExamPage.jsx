import { useState, useEffect } from "react";
import {
  Plus,
  FileText,
  Award,
  RefreshCw,
  Users,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { examService } from "../../services/examService";
import { useTeacher } from "../../hooks/useTeacher";
import { useI18nStore } from "../../store/i18nStore";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { Badge } from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate } from "../../utils/helpers";

const emptyExamForm = {
  classId: "",
  title: "",
  examType: "WRITTEN",
  examDate: "",
  location: "",
  maxScore: 100,
  passingScore: 50,
  description: "",
};

const emptyResultForm = {
  examId: "",
  studentId: "",
  score: "",
  remark: "",
};

export default function TeacherExamsPage() {
  const { t } = useI18nStore();
  const { classes, loading: loadingClasses, getMyClasses } = useTeacher();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examModal, setExamModal] = useState(false);
  const [resultModal, setResultModal] = useState(false);
  const [examForm, setExamForm] = useState(emptyExamForm);
  const [resultForm, setResultForm] = useState(emptyResultForm);
  const [submitting, setSubmitting] = useState(false);
  const [filterClass, setFilterClass] = useState("");
  const [selectedExam, setSelectedExam] = useState(null);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      await getMyClasses();

      const examsRes = await examService
        .getAllExams()
        .catch(() => ({ data: { data: [] } }));

      if (examsRes.data && examsRes.data.data) {
        setExams(examsRes.data.data);
      } else {
        let allExams = [];
        for (const c of classes) {
          try {
            const classExams = await examService.getExamsByClass(c._id);
            if (classExams.data.data) {
              allExams = [...allExams, ...classExams.data.data];
            }
          } catch (err) {
            console.error(`Failed to fetch exams for class ${c._id}`, err);
          }
        }
        setExams(allExams);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateExam(e) {
    e.preventDefault();

    if (!examForm.classId) {
      toast.error("Please select a class");
      return;
    }
    if (!examForm.title.trim()) {
      toast.error("Please enter exam title");
      return;
    }
    if (!examForm.examDate) {
      toast.error("Please select exam date");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...examForm,
        maxScore: Number(examForm.maxScore),
        passingScore: Number(examForm.passingScore),
        examDate: new Date(examForm.examDate).toISOString(),
      };

      const response = await examService.create(payload);

      if (response.data && response.data.success) {
        toast.success("Exam created successfully!");
        setExamModal(false);
        setExamForm(emptyExamForm);
        await loadAll();
      } else {
        throw new Error("Failed to create exam");
      }
    } catch (err) {
      console.error("Create exam error:", err);
      toast.error(
        err.response?.data?.message || err.message || "Operation failed",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function loadEligibleStudents(examId) {
    setLoadingStudents(true);
    try {
      const response = await examService.getEligibleStudents(examId);
      if (response.data && response.data.data) {
        setEligibleStudents(response.data.data);
        return response.data.data;
      }
      setEligibleStudents([]);
      return [];
    } catch (error) {
      console.error("Error loading eligible students:", error);
      if (error.response?.status === 403) {
        toast.error("You are not assigned to this exam's class");
      } else if (error.response?.status === 404) {
        toast.error("Exam not found. Please refresh and try again.");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to load eligible students",
        );
      }
      setEligibleStudents([]);
      return [];
    } finally {
      setLoadingStudents(false);
    }
  }

  async function handleAddResult(e) {
    e.preventDefault();

    if (!resultForm.examId) {
      toast.error("Please select an exam");
      return;
    }
    if (!resultForm.studentId) {
      toast.error("Please select a student");
      return;
    }
    if (!resultForm.score || resultForm.score === "") {
      toast.error("Please enter score");
      return;
    }

    const scoreNum = Number(resultForm.score);
    if (isNaN(scoreNum) || scoreNum < 0) {
      toast.error("Please enter a valid score (positive number)");
      return;
    }

    if (selectedExam && scoreNum > selectedExam.maxScore) {
      toast.error(`Score cannot exceed ${selectedExam.maxScore}`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await examService.submitResult({
        examId: resultForm.examId,
        studentId: resultForm.studentId,
        score: scoreNum,
        remark: resultForm.remark || "",
      });

      if (response.data && response.data.success) {
        toast.success(response.data.message || "Result added successfully! 🎉");
        setResultModal(false);
        setResultForm(emptyResultForm);
        setEligibleStudents([]);
        setSelectedExam(null);
        await loadAll();
      } else {
        throw new Error(response.data?.message || "Failed to add result");
      }
    } catch (err) {
      console.error("Add result error:", err);

      let errorMsg =
        err.response?.data?.message || err.message || "Failed to add result";

      if (errorMsg.includes("already exists")) {
        errorMsg = "⚠️ Result already exists for this student in this exam.";
      } else if (errorMsg.includes("not enrolled in the class")) {
        errorMsg = "⚠️ Student is not enrolled in the class for this exam.";
      } else if (errorMsg.includes("not assigned to the class")) {
        errorMsg = "⚠️ You are not assigned to this exam's class.";
      } else if (errorMsg.includes("Exam not found")) {
        errorMsg = "❌ Exam not found.";
      } else if (errorMsg.includes("Student not found")) {
        errorMsg = "❌ Student not found.";
      } else if (errorMsg.includes("Score must be between")) {
        errorMsg = `⚠️ ${errorMsg}`;
      }

      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  const handleOpenResultModal = async (exam) => {
    setSelectedExam(exam);
    setResultForm({
      ...emptyResultForm,
      examId: exam._id,
    });
    setEligibleStudents([]);
    setResultModal(true);
    await loadEligibleStudents(exam._id);
  };

  const filteredExams = filterClass
    ? exams.filter(
        (exam) =>
          exam.classId?._id === filterClass || exam.classId === filterClass,
      )
    : exams;

  if (loading || loadingClasses) return <SkeletonTable rows={5} cols={6} />;

  const teacherClasses = classes || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Exam Management (Teacher)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filteredExams.length} exams {filterClass && "in selected class"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAll}
            className="btn-secondary"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setExamForm(emptyExamForm);
              setExamModal(true);
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" /> Create Exam
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Teacher Exam Management
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
              Create exams for your assigned classes and add results.{" "}
              <strong>
                Only students enrolled in the exam's class will be shown
              </strong>{" "}
              when adding results.
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      {exams.length > 0 && teacherClasses.length > 0 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Filter by Class:
          </label>
          <select
            className="input py-1 px-3 text-sm"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
          >
            <option value="">All Classes</option>
            {teacherClasses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.className}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Exams List */}
      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredExams.map((exam) => (
            <div key={exam._id} className="card">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200">
                    {exam.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Class: {exam.classId?.className || "Unknown"}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Date: {formatDate(exam.examDate)}
                    </span>
                    <Badge status={exam.examType} className="text-xs" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Max: {exam.maxScore} | Pass: {exam.passingScore}
                    </span>
                  </div>
                  {exam.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {exam.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenResultModal(exam)}
                    className="btn-outline text-xs py-1 px-3"
                  >
                    <Award className="w-3 h-3" /> Add Result
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Exams Found"
          description="Create your first exam by clicking the 'Create Exam' button above."
        />
      )}

      {/* Create Exam Modal */}
      <Modal
        isOpen={examModal}
        onClose={() => setExamModal(false)}
        title="Create Exam"
        size="md"
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div>
            <label className="label">Select Class *</label>
            <select
              className="input"
              value={examForm.classId}
              onChange={(e) =>
                setExamForm({ ...examForm, classId: e.target.value })
              }
              required
            >
              <option value="">-- Select Class --</option>
              {teacherClasses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.className}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Only classes you are assigned to are shown
            </p>
          </div>
          <div>
            <label className="label">Exam Title *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Mid-term Written Exam"
              value={examForm.title}
              onChange={(e) =>
                setExamForm({ ...examForm, title: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Exam Type *</label>
              <select
                className="input"
                value={examForm.examType}
                onChange={(e) =>
                  setExamForm({ ...examForm, examType: e.target.value })
                }
              >
                <option value="WRITTEN">Written</option>
                <option value="PRACTICAL">Practical</option>
              </select>
            </div>
            <div>
              <label className="label">Exam Date *</label>
              <input
                type="date"
                className="input"
                value={examForm.examDate}
                onChange={(e) =>
                  setExamForm({ ...examForm, examDate: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Location</label>
            <input
              type="text"
              className="input"
              placeholder="Exam room / location"
              value={examForm.location}
              onChange={(e) =>
                setExamForm({ ...examForm, location: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Max Score</label>
              <input
                type="number"
                className="input"
                value={examForm.maxScore}
                onChange={(e) =>
                  setExamForm({ ...examForm, maxScore: e.target.value })
                }
                min={1}
              />
            </div>
            <div>
              <label className="label">Passing Score</label>
              <input
                type="number"
                className="input"
                value={examForm.passingScore}
                onChange={(e) =>
                  setExamForm({ ...examForm, passingScore: e.target.value })
                }
                min={0}
              />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input h-20 resize-none"
              placeholder="Additional details about the exam..."
              value={examForm.description}
              onChange={(e) =>
                setExamForm({ ...examForm, description: e.target.value })
              }
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Exam"}
            </button>
            <button
              type="button"
              onClick={() => setExamModal(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Result Modal */}
      <Modal
        isOpen={resultModal}
        onClose={() => {
          setResultModal(false);
          setEligibleStudents([]);
          setSelectedExam(null);
          setResultForm(emptyResultForm);
        }}
        title="Add Result"
        size="md"
      >
        <form onSubmit={handleAddResult} className="space-y-4">
          <div>
            <label className="label">Exam</label>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="font-medium text-slate-700 dark:text-slate-200">
                {selectedExam?.title || "Loading..."}
              </p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Class: {selectedExam?.classId?.className || "Unknown"}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Max: {selectedExam?.maxScore || 100}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Pass: {selectedExam?.passingScore || 50}
                </span>
              </div>
            </div>
            <input
              type="hidden"
              value={resultForm.examId}
              onChange={(e) =>
                setResultForm({ ...resultForm, examId: e.target.value })
              }
            />
          </div>

          <div>
            <label className="label">Select Student *</label>
            {loadingStudents ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-slate-500">
                  Loading eligible students...
                </span>
              </div>
            ) : (
              <>
                <select
                  className="input"
                  value={resultForm.studentId}
                  onChange={(e) =>
                    setResultForm({ ...resultForm, studentId: e.target.value })
                  }
                  required
                  disabled={eligibleStudents.length === 0}
                >
                  <option value="">-- Select Student --</option>
                  {eligibleStudents.length === 0 ? (
                    <option value="" disabled>
                      No eligible students found for this exam
                    </option>
                  ) : (
                    eligibleStudents.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.userId?.fullName || "Unknown"}
                        {s.userId?.phoneNumber
                          ? ` (${s.userId.phoneNumber})`
                          : ""}
                        {s.hasResult ? " ✓ (Has Result)" : ""}
                      </option>
                    ))
                  )}
                </select>

                {eligibleStudents.length > 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    <Users className="w-3 h-3 inline mr-1" />
                    {eligibleStudents.length} students enrolled in this class
                    {eligibleStudents.filter((s) => s.hasResult).length > 0 &&
                      ` (${eligibleStudents.filter((s) => s.hasResult).length} already have results)`}
                  </p>
                )}

                {eligibleStudents.length === 0 && selectedExam && (
                  <div className="flex items-start gap-2 mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      No students found for this class. Please ensure students
                      are enrolled in the class before adding results.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <label className="label">Score *</label>
            <input
              type="number"
              className="input"
              placeholder={`Enter score (0-${selectedExam?.maxScore || 100})`}
              value={resultForm.score}
              onChange={(e) =>
                setResultForm({ ...resultForm, score: e.target.value })
              }
              min={0}
              max={selectedExam?.maxScore || 100}
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              Score must be between 0 and {selectedExam?.maxScore || 100}
            </p>
          </div>

          <div>
            <label className="label">Remark</label>
            <input
              type="text"
              className="input"
              placeholder="Optional remark"
              value={resultForm.remark}
              onChange={(e) =>
                setResultForm({ ...resultForm, remark: e.target.value })
              }
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={
                submitting || eligibleStudents.length === 0 || loadingStudents
              }
            >
              {submitting ? "Adding..." : "Add Result"}
            </button>
            <button
              type="button"
              onClick={() => {
                setResultModal(false);
                setEligibleStudents([]);
                setSelectedExam(null);
                setResultForm(emptyResultForm);
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
