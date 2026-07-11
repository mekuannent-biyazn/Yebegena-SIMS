import { useState, useEffect } from "react";
import { TrendingUp, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { studentService } from "../../services/studentService";
import { promotionService } from "../../services/promotionService";
import { useI18nStore } from "../../store/i18nStore";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { Badge } from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate } from "../../utils/helpers";

export default function PromotionsPage() {
  const { t } = useI18nStore();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmStudent, setConfirmStudent] = useState(null);
  const [promoting, setPromoting] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [examDetails, setExamDetails] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await studentService.getAll();
      const all = data.data || [];
      // Show only FRESH students with APPROVED status (eligible for promotion)
      const eligible = all.filter(
        (s) =>
          s.studentStatus === "FRESH" && s.registrationStatus === "APPROVED",
      );
      setStudents(eligible);
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error(t("loadingFailed") || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  async function handlePromote() {
    if (!confirmStudent) return;

    setPromoting(confirmStudent._id);
    setErrorMessage("");
    setExamDetails(null);

    try {
      const response = await promotionService.promote(confirmStudent._id);

      if (response.data && response.data.success) {
        toast.success(
          `${confirmStudent.userId?.fullName || "Student"} promoted to Advanced successfully! 🎉`,
        );
        setConfirmStudent(null);
        // Reload the list
        await load();
      } else {
        throw new Error(response.data?.message || "Promotion failed");
      }
    } catch (err) {
      console.error("Promotion error:", err);

      // Extract error message from response
      let errorMsg =
        err.response?.data?.message || err.message || t("operationFailed");

      // Parse the error message to show more details
      let displayMsg = errorMsg;
      let examInfo = null;

      // User-friendly error messages with more detail
      if (errorMsg.includes("Required exams")) {
        displayMsg =
          "📝 Required exams (Written and Practical) have not been created for this class yet. Please create both exams first.";
      } else if (errorMsg.includes("no result found")) {
        // Extract which exam is missing
        if (errorMsg.includes("Written")) {
          displayMsg =
            "❌ Student has not taken the Written exam. Please add the Written exam result first.";
          examInfo = "Missing: Written Exam Result";
        } else if (errorMsg.includes("Practical")) {
          displayMsg =
            "❌ Student has not taken the Practical exam. Please add the Practical exam result first.";
          examInfo = "Missing: Practical Exam Result";
        } else {
          displayMsg =
            "❌ Student has not completed all required exams. Please check exam results.";
        }
      } else if (errorMsg.includes("not passed")) {
        // Extract which exam was not passed
        if (errorMsg.includes("Written")) {
          displayMsg =
            "❌ Student did not pass the Written exam. Please check the score and passing threshold.";
          examInfo = "Failed: Written Exam";
        } else if (errorMsg.includes("Practical")) {
          displayMsg =
            "❌ Student did not pass the Practical exam. Please check the score and passing threshold.";
          examInfo = "Failed: Practical Exam";
        } else {
          displayMsg =
            "❌ Student has not passed all required exams. Please check exam results.";
        }
      } else if (errorMsg.includes("already at Advanced")) {
        displayMsg = "✅ This student is already at Advanced level.";
      } else if (errorMsg.includes("not eligible")) {
        displayMsg =
          "⚠️ This student is not eligible for promotion. Please check their status.";
      } else if (errorMsg.includes("no assigned class")) {
        displayMsg =
          "📚 Student has no assigned class. Please assign a class first.";
      }

      setErrorMessage(displayMsg);
      setExamDetails(examInfo);
      toast.error(displayMsg);
    } finally {
      setPromoting(null);
    }
  }

  // Helper function to check if student can be promoted
  const canPromote = (student) => {
    return student.assignedClass && student.studentStatus === "FRESH";
  };

  if (loading) return <SkeletonTable rows={6} cols={5} />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {t("promotionsPage") || "Student Promotions"}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {students.length}{" "}
          {t("eligibleStudents") || "eligible students for promotion"}
        </p>
      </div>

      {/* Info Banner */}
      <div className="card bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              Promotion Eligibility Criteria
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
              Students must have:
            </p>
            <ul className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 list-disc list-inside">
              <li>
                Passed both <strong>WRITTEN</strong> and{" "}
                <strong>PRACTICAL</strong> exams
              </li>
              <li>Minimum passing score in both exams</li>
              <li>
                Current status as <strong>FRESH</strong> student
              </li>
              <li>Approved registration status</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card p-0 overflow-hidden">
        {students.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title={t("noEligibleStudents") || "No Eligible Students"}
            description={
              t("noEligibleStudentsDesc") ||
              "All fresh students have been promoted or none are eligible yet."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="table-th">Student</th>
                  <th className="table-th">Phone</th>
                  <th className="table-th">Class</th>
                  <th className="table-th">Level</th>
                  <th className="table-th">Joined</th>
                  <th className="table-th">{t("actions") || "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s._id}
                    className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 last:border-0"
                  >
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold">
                          {s.userId?.fullName?.slice(0, 2)?.toUpperCase() ||
                            "NA"}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-100">
                          {s.userId?.fullName || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="table-td text-slate-500 dark:text-slate-400">
                      {s.userId?.phoneNumber || "N/A"}
                    </td>
                    <td className="table-td">
                      <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                        {s.assignedClass?.className || "Unassigned"}
                      </span>
                    </td>
                    <td className="table-td">
                      <Badge status={s.studentStatus} />
                    </td>
                    <td className="table-td text-slate-500 dark:text-slate-400">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="table-td">
                      <button
                        onClick={() => {
                          setErrorMessage("");
                          setExamDetails(null);
                          setConfirmStudent(s);
                        }}
                        className={`text-xs px-3 py-1.5 ${
                          canPromote(s)
                            ? "btn-success"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                        disabled={!canPromote(s)}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        {t("promoteStudent") || "Promote"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Promotion Modal */}
      <Modal
        isOpen={!!confirmStudent}
        onClose={() => {
          setConfirmStudent(null);
          setErrorMessage("");
          setExamDetails(null);
        }}
        title={t("promoteStudent") || "Promote Student"}
        size="sm"
      >
        {confirmStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-2xl font-bold">
                {confirmStudent.userId?.fullName?.slice(0, 2)?.toUpperCase() ||
                  "NA"}
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">
                  {confirmStudent.userId?.fullName || "Unknown Student"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {confirmStudent.userId?.phoneNumber || "No phone"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge status={confirmStudent.studentStatus} />
                  <span className="text-xs text-slate-400">→</span>
                  <Badge status="ADVANCED" />
                </div>
                {confirmStudent.assignedClass && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Class: {confirmStudent.assignedClass.className}
                  </p>
                )}
              </div>
            </div>

            {/* Exam Details */}
            {examDetails && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {examDetails}
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Confirmation Message */}
            {!errorMessage && !examDetails && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Confirm promotion of{" "}
                    <strong>{confirmStudent.userId?.fullName}</strong> from
                    Fresh to Advanced level? This action cannot be undone.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={handlePromote}
                className={`btn-success flex-1 ${
                  !errorMessage ? "" : "opacity-50 cursor-not-allowed"
                }`}
                disabled={!!promoting || !!errorMessage}
              >
                {promoting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Promoting...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    {t("promoteStudent") || "Promote Student"}
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setConfirmStudent(null);
                  setErrorMessage("");
                  setExamDetails(null);
                }}
                className="btn-secondary flex-1"
                disabled={!!promoting}
              >
                {t("cancel") || "Cancel"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
