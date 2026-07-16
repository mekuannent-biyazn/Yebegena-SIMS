import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { scheduleService } from "../../services/scheduleService";
import { studentService } from "../../services/studentService";
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

export default function MySchedulePage() {
  const { t } = useI18nStore();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Get student profile
        const { data: profileData } = await studentService.getProfile();
        const student = profileData.data || profileData;
        const classId = student?.assignedClass?._id || student?.assignedClass;

        if (!classId) {
          setLoading(false);
          return;
        }

        setClassInfo(student?.assignedClass);

        // Get schedules for the class
        const response = await scheduleService.getByClass(classId);

        // The response structure: { success: true, count: 2, data: [...] }
        // So we need to access response.data.data
        const schedulesData = response?.data?.data || response?.data || [];
        setSchedules(schedulesData);
      } catch (error) {
        console.error("Error loading schedule:", error);
        toast.error(t("loadingFailed") || "Failed to load schedule");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [t]);

  // Group schedules by day of week
  const grouped = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = schedules.filter((s) => s.dayOfWeek === day);
    return acc;
  }, {});

  const activeDays = DAYS_OF_WEEK.filter((d) => grouped[d]?.length > 0);

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

  if (!classInfo) {
    return (
      <div className="card">
        <EmptyState
          icon={Calendar}
          title="No class assigned"
          description="You haven't been assigned to a class yet. Please contact your admin."
        />
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
          </p>
        </div>
        <div className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
          {schedules.length} sessions/week
        </div>
      </div>

      {/* Weekly summary */}
      {schedules.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className={`rounded-xl p-2 text-center border-l-4 ${DAY_COLORS[day] || "border-slate-400 bg-slate-50 dark:bg-slate-800/20"}`}
            >
              <p
                className={`text-xs font-bold ${DAY_HEADER_COLORS[day] || "text-slate-600 dark:text-slate-300"}`}
              >
                {t(DAY_LABELS[day])?.slice(0, 3)?.toUpperCase() ||
                  day.slice(0, 3)}
              </p>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                {grouped[day]?.length || 0}
              </p>
            </div>
          ))}
        </div>
      )}

      {activeDays.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Calendar}
            title={t("noSchedules") || "No schedules"}
            description={
              t("emptySchedules") || "No schedules available for your class"
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeDays.map((day) => (
            <div key={day} className="card space-y-3">
              <h3
                className={`text-sm font-bold uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-700 ${DAY_HEADER_COLORS[day] || "text-slate-600 dark:text-slate-300"}`}
              >
                {t(DAY_LABELS[day]) || day}
              </h3>
              {grouped[day]?.map((s) => (
                <div
                  key={s._id}
                  className={`p-3 rounded-xl border-l-4 ${DAY_COLORS[day] || "border-slate-400 bg-slate-50 dark:bg-slate-800/20"}`}
                >
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                    {s.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    🕐 {s.startTime} – {s.endTime}
                  </p>
                  {s.location && (
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                      📍 {s.location}
                    </p>
                  )}
                  {s.description && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {s.description}
                    </p>
                  )}
                  {s.scheduleType && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-white/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                      {s.scheduleType}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
