import { useState, useEffect } from "react";
import { Calendar, BookOpen, Clock, MapPin, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { scheduleService } from "../../services/scheduleService";
import { studentService } from "../../services/studentService";
import { useAuthStore } from "../../store/authStore";
import { useI18nStore } from "../../store/i18nStore";
import { SkeletonCard } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { DAYS_OF_WEEK } from "../../constants";

const DAY_LABELS = {
  MONDAY: "monday",
  TUESDAY: "tuesday",
  WEDNESDAY: "wednesday",
  THURSDAY: "thursday",
  FRIDAY: "friday",
  SATURDAY: "saturday",
  SUNDAY: "sunday",
};

const DAY_COLORS = {
  MONDAY: "border-blue-400 bg-blue-50 dark:bg-blue-900/20",
  TUESDAY: "border-purple-400 bg-purple-50 dark:bg-purple-900/20",
  WEDNESDAY: "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
  THURSDAY: "border-amber-400 bg-amber-50 dark:bg-amber-900/20",
  FRIDAY: "border-rose-400 bg-rose-50 dark:bg-rose-900/20",
  SATURDAY: "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20",
  SUNDAY: "border-slate-400 bg-slate-50 dark:bg-slate-700/40",
};

const DAY_HEADER_COLORS = {
  MONDAY: "text-blue-700 dark:text-blue-300",
  TUESDAY: "text-purple-700 dark:text-purple-300",
  WEDNESDAY: "text-emerald-700 dark:text-emerald-300",
  THURSDAY: "text-amber-700 dark:text-amber-300",
  FRIDAY: "text-rose-700 dark:text-rose-300",
  SATURDAY: "text-indigo-700 dark:text-indigo-300",
  SUNDAY: "text-slate-600 dark:text-slate-300",
};

// Order days starting from Monday
const ORDERED_DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export default function MySchedulePage() {
  const { t } = useI18nStore();
  const { user } = useAuthStore();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        // Get student profile
        const response = await studentService.getProfile();
        console.log("📊 Student Profile Response:", response);

        // IMPORTANT: Extract data correctly - response.data.data
        const student = response.data?.data || response.data;
        console.log("📊 Student Data:", student);
        console.log("📊 Assigned Class:", student?.assignedClass);

        // Get assigned class
        let classId = null;
        let classObj = null;

        if (student?.assignedClass) {
          // Check if it's a populated object or just an ID
          if (
            typeof student.assignedClass === "object" &&
            student.assignedClass._id
          ) {
            classId = student.assignedClass._id;
            classObj = student.assignedClass;
          } else if (typeof student.assignedClass === "string") {
            classId = student.assignedClass;
          }
        }

        console.log("📊 Class ID:", classId);
        console.log("📊 Class Object:", classObj);

        if (!classId) {
          console.warn("⚠️ No class assigned to this student");
          setError("NO_CLASS");
          setLoading(false);
          return;
        }

        // Set class info
        setClassInfo(classObj || { _id: classId, className: "Assigned Class" });

        // Fetch schedules for this class
        console.log("📊 Fetching schedules for class:", classId);
        const scheduleResponse = await scheduleService.getByClass(classId);
        console.log("📊 Schedule Response:", scheduleResponse);

        // Extract schedules - the API returns { success, count, data: [...] }
        let schedulesData = [];
        if (
          scheduleResponse?.data?.data &&
          Array.isArray(scheduleResponse.data.data)
        ) {
          schedulesData = scheduleResponse.data.data;
        } else if (
          scheduleResponse?.data &&
          Array.isArray(scheduleResponse.data)
        ) {
          schedulesData = scheduleResponse.data;
        } else if (Array.isArray(scheduleResponse)) {
          schedulesData = scheduleResponse;
        }

        console.log("📊 Schedules Data:", schedulesData);
        setSchedules(schedulesData);

        if (schedulesData.length === 0) {
          toast.success("No schedules found for your class");
        }
      } catch (error) {
        console.error("❌ Error loading schedule data:", error);
        console.error("❌ Error details:", error.response?.data);
        setError("LOAD_ERROR");
        toast.error(t("loadingFailed") || "Failed to load schedule");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [t]);

  // Group schedules by day of week
  const grouped = ORDERED_DAYS.reduce((acc, day) => {
    acc[day] = schedules.filter((s) => s.dayOfWeek === day);
    return acc;
  }, {});

  const activeDays = ORDERED_DAYS.filter((d) => grouped[d]?.length > 0);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // No class assigned state
  if (error === "NO_CLASS") {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            No Class Assigned
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            You haven't been assigned to a class yet. Please contact your
            administrator.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary mt-4"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (error === "LOAD_ERROR") {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            Failed to Load Schedule
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            There was an error loading your schedule. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary mt-4"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {t("mySchedule") || "My Schedule"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {classInfo?.className && `Class: ${classInfo.className}`}
            {classInfo?.classType && ` (${classInfo.classType})`}
          </p>
        </div>
        <div className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
          {schedules.length} sessions/week
        </div>
      </div>

      {/* Weekly summary */}
      {schedules.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {ORDERED_DAYS.map((day) => (
            <div
              key={day}
              className={`rounded-xl p-2 text-center border-l-4 ${DAY_COLORS[day]}`}
            >
              <p className={`text-xs font-bold ${DAY_HEADER_COLORS[day]}`}>
                {t(DAY_LABELS[day])?.slice(0, 3).toUpperCase() ||
                  day.slice(0, 3)}
              </p>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                {grouped[day]?.length || 0}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Schedules by day */}
      {activeDays.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Calendar}
            title={t("noSchedules") || "No Schedules"}
            description={
              t("emptySchedules") ||
              "No schedules available for your class yet."
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeDays.map((day) => (
            <div key={day} className="card space-y-3">
              <h3
                className={`text-sm font-bold uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-700 ${DAY_HEADER_COLORS[day]}`}
              >
                {t(DAY_LABELS[day]) || day}
              </h3>
              {grouped[day].map((s) => (
                <div
                  key={s._id}
                  className={`p-3 rounded-xl border-l-4 ${DAY_COLORS[day]} hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm flex-1">
                      {s.title}
                    </p>
                    {s.scheduleType && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 ml-2">
                        {s.scheduleType}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {s.startTime} – {s.endTime}
                  </p>
                  {s.location && (
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {s.location}
                    </p>
                  )}
                  {s.description && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {s.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Your Class Schedule
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {schedules.length > 0
                ? `You have ${schedules.length} scheduled sessions this week.`
                : "No sessions scheduled for this week."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
