import { useState, useEffect } from "react";
import { FileText, Award, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { examService } from "../../services/examService";
import { useI18nStore } from "../../store/i18nStore";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { Badge } from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate } from "../../utils/helpers";

export default function MyExamsPage() {
  const { t } = useI18nStore();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await examService.getMyResults();

      let examData = [];
      if (response.data && response.data.data) {
        examData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        examData = response.data;
      }

      // Process and structure the exam data
      const processedExams = examData.map((item, index) => {
        let exam = item;
        let result = null;

        // If the item has examId, it's a result object
        if (item.examId && typeof item.examId === "object") {
          result = {
            score: item.score || 0,
            isPassed: item.isPassed === true,
            remark: item.remark || "",
            createdAt: item.createdAt || new Date().toISOString(),
          };

          exam = {
            _id: item.examId._id || item._id,
            title: item.examId.title || "Untitled Exam",
            examType: item.examId.examType || "UNKNOWN",
            examDate: item.examId.examDate || new Date().toISOString(),
            location: item.examId.location || "",
            description: item.examId.description || "",
            maxScore: item.examId.maxScore || 100,
            passingScore: item.examId.passingScore || 50,
          };
        } else if (item.result) {
          result = item.result;
          exam = item;
        } else {
          exam = item;
          result = {
            score: item.score || 0,
            isPassed: item.isPassed === true,
            remark: item.remark || "",
            createdAt: item.createdAt || new Date().toISOString(),
          };
        }

        return {
          id: exam._id || `temp-${index}`,
          _id: exam._id || `temp-${index}`,
          title: exam.title || "Untitled Exam",
          examType: exam.examType || "UNKNOWN",
          examDate: exam.examDate || new Date().toISOString(),
          location: exam.location || "",
          description: exam.description || "",
          maxScore: exam.maxScore || 100,
          passingScore: exam.passingScore || 50,
          hasResult: true,
          result: result,
          score: result.score || 0,
          isPassed: result.isPassed === true,
          remark: result.remark || "",
          percentage:
            result.score !== null &&
            result.score !== undefined &&
            exam.maxScore > 0
              ? Math.round((Number(result.score) / Number(exam.maxScore)) * 100)
              : 0,
        };
      });

      setExams(processedExams);

      if (processedExams.length === 0) {
        toast.success("No exam results available yet");
      }
    } catch (error) {
      console.error("Error loading exams:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load exams";

      if (error.response?.status === 404) {
        setExams([]);
        toast.success("No exam results available yet");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadExams(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              My Exam Results
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading...
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Calculate stats
  const writtenExams = exams.filter((e) => e?.examType === "WRITTEN");
  const practicalExams = exams.filter((e) => e?.examType === "PRACTICAL");

  const passedWritten = writtenExams.filter((e) => e?.isPassed === true).length;
  const passedPractical = practicalExams.filter(
    (e) => e?.isPassed === true,
  ).length;
  const totalPassed = passedWritten + passedPractical;
  const totalExams = exams.length;

  // Get exam type label
  const getExamTypeLabel = (examType) => {
    if (!examType) return "Unknown";
    const typeMap = {
      WRITTEN: "Written",
      PRACTICAL: "Practical",
    };
    return typeMap[examType] || examType;
  };

  // Get exam type badge class
  const getExamTypeBadgeClass = (examType) => {
    if (!examType)
      return "badge bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
    const classMap = {
      WRITTEN:
        "badge bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      PRACTICAL:
        "badge bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    };
    return (
      classMap[examType] ||
      "badge bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
    );
  };

  // Get exam icon
  const getExamIcon = (examType) => {
    if (examType === "WRITTEN") return FileText;
    if (examType === "PRACTICAL") return Award;
    return FileText;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {t("myExamsPage") || "My Exam Results"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {totalExams} exams
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn-secondary"
          disabled={refreshing}
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Summary stats */}
      {totalExams > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Written Exams
            </p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
              {writtenExams.length}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              {passedWritten} passed
            </p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Practical Exams
            </p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
              {practicalExams.length}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              {passedPractical} passed
            </p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Exams
            </p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
              {totalExams}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Passed
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {totalPassed}
            </p>
          </div>
        </div>
      )}

      {totalExams === 0 ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title={t("noExams") || "No Exam Results"}
            description={
              t("emptyExams") ||
              "You don't have any exam results available yet. Results will appear here once exams are completed."
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam, index) => {
            // Skip invalid entries
            if (!exam || typeof exam !== "object") return null;

            const ExamIcon = getExamIcon(exam.examType);
            const examTypeLabel = getExamTypeLabel(exam.examType);
            const examTypeBadgeClass = getExamTypeBadgeClass(exam.examType);

            const hasResult = exam.hasResult === true;
            const isPassed = exam.isPassed === true;
            const score = exam.score;
            const maxScore = exam.maxScore || 100;
            const percentage = exam.percentage || 0;

            return (
              <div
                key={exam.id || exam._id || `exam-${index}`}
                className="card space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${exam.examType === "WRITTEN" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"}`}
                    >
                      <ExamIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                        {exam.title || "Untitled Exam"}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {exam.examDate ? formatDate(exam.examDate) : "No date"}
                      </p>
                    </div>
                  </div>
                  <span className={examTypeBadgeClass}>{examTypeLabel}</span>
                </div>

                {exam.location && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    📍 {exam.location}
                  </p>
                )}

                {exam.description && (
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {exam.description}
                  </p>
                )}

                <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
                  {hasResult ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Score
                        </span>
                        <div className="flex items-center gap-2">
                          {isPassed ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span
                            className={`font-bold ${isPassed ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            {score !== null && score !== undefined
                              ? `${score} / ${maxScore}`
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${isPassed ? "bg-emerald-500" : "bg-red-400"}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge
                          status={isPassed ? "APPROVED" : "REJECTED"}
                          label={isPassed ? "Passed ✅" : "Failed ❌"}
                          className={
                            isPassed
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }
                        />
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {percentage}%
                        </span>
                      </div>
                      {exam.remark && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                          "{exam.remark}"
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-2">
                      <Badge
                        status="PENDING"
                        label="Pending"
                        className="bg-yellow-100 text-yellow-700"
                      />
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Result not available yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
