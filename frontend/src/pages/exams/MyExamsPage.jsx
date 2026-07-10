import { useState, useEffect } from "react";
import { FileText, Award, CheckCircle, XCircle } from "lucide-react";
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

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const response = await examService.getMyResults();
      // Handle different response structures
      let examData = [];
      if (response.data && response.data.data) {
        examData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        examData = response.data;
      }

      // Ensure each exam has required fields
      const sanitizedExams = examData.map((exam) => ({
        ...exam,
        examType: exam.examType || "UNKNOWN",
        title: exam.title || "Untitled Exam",
        maxScore: exam.maxScore || 100,
        result: exam.result || null,
        examDate: exam.examDate || new Date().toISOString(),
      }));

      setExams(sanitizedExams);
    } catch (error) {
      console.error("Error loading exams:", error);
      toast.error(t("loadingFailed") || "Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Safe filtering with null checks
  const writtenExams = exams.filter((e) => e?.examType === "WRITTEN");
  const practicalExams = exams.filter((e) => e?.examType === "PRACTICAL");

  const passedWritten = writtenExams.filter((e) => e?.result?.isPassed).length;
  const passedPractical = practicalExams.filter(
    (e) => e?.result?.isPassed,
  ).length;

  // Safe exam type display function
  const getExamTypeLabel = (examType) => {
    if (!examType) return "Unknown";
    const typeMap = {
      WRITTEN: t("written") || "Written",
      PRACTICAL: t("practical") || "Practical",
    };
    return typeMap[examType] || examType;
  };

  // Safe badge color for exam type
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

  // Safe icon component
  const getExamIcon = (examType) => {
    if (examType === "WRITTEN") return FileText;
    if (examType === "PRACTICAL") return Award;
    return FileText; // Default fallback
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {t("myExamsPage") || "My Exams"}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {exams.length} exams
        </p>
      </div>

      {/* Summary stats */}
      {exams.length > 0 && (
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
              {exams.length}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Passed
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {passedWritten + passedPractical}
            </p>
          </div>
        </div>
      )}

      {exams.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title={t("noExams") || "No Exams Found"}
            description={
              t("emptyExams") || "You have no exam results available yet."
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => {
            // Safety checks for each exam
            if (!exam || typeof exam !== "object") {
              return null; // Skip invalid entries
            }

            const hasResult = !!exam.result;
            const isPassed = exam.result?.isPassed || false;
            const score = exam.result?.score;
            const maxScore = exam.maxScore || 100;
            const percentage =
              score !== undefined && score !== null && !isNaN(score)
                ? Math.round((Number(score) / Number(maxScore)) * 100)
                : 0;

            const ExamIcon = getExamIcon(exam.examType);
            const examTypeLabel = getExamTypeLabel(exam.examType);
            const examTypeBadgeClass = getExamTypeBadgeClass(exam.examType);

            return (
              <div key={exam._id || Math.random()} className="card space-y-3">
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
                          {t("score") || "Score"}
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
                            {score !== undefined && score !== null
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
                          label={
                            isPassed
                              ? t("passed") || "Passed"
                              : t("failed") || "Failed"
                          }
                        />
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {percentage}%
                        </span>
                      </div>
                      {exam.result?.remark && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                          "{exam.result.remark}"
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-2">
                      <Badge
                        status="PENDING"
                        label={t("pending") || "Pending"}
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
