import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  ChevronRight,
  FileText,
  GraduationCap,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useTeacher } from "../../hooks/useTeacher";
import { examService } from "../../services/examService";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { Badge } from "../../components/ui/Badge";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

const TeacherDashboard = () => {
  const { classes, loading, getMyClasses } = useTeacher();
  const [recentExams, setRecentExams] = useState([]);
  const [examStats, setExamStats] = useState({
    totalExams: 0,
    examsGraded: 0,
    pendingExams: 0,
  });
  const [loadingExams, setLoadingExams] = useState(false);

  useEffect(() => {
    getMyClasses();
    loadTeacherExams();
  }, [getMyClasses]);

  // Load teacher-specific exams
  async function loadTeacherExams() {
    setLoadingExams(true);
    try {
      // Use teacher-specific endpoint
      const response = await examService.getMyExams();
      const exams = response.data.data || [];

      let graded = 0;
      let pending = 0;
      exams.forEach((exam) => {
        if (exam.hasResults) {
          graded++;
        } else {
          pending++;
        }
      });

      setExamStats({
        totalExams: exams.length,
        examsGraded: graded,
        pendingExams: pending,
      });

      const sorted = exams
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentExams(sorted);
    } catch (error) {
      console.error("Error loading teacher exams:", error);
      // Don't show error toast for 403, just handle silently
      if (error.response?.status !== 403) {
        toast.error("Failed to load exams");
      }
    } finally {
      setLoadingExams(false);
    }
  }

  // Calculate stats from classes
  const totalStudents = classes.reduce(
    (acc, cls) => acc + (cls.currentStudents || 0),
    0,
  );
  const totalCapacity = classes.reduce(
    (acc, cls) => acc + (cls.maxStudents || 0),
    0,
  );
  const activeClasses = classes.filter((cls) => cls.isActive).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Classes",
      value: classes.length,
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    },
    {
      title: "Total Exams",
      value: examStats.totalExams,
      icon: FileText,
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    },
    {
      title: "Exams Graded",
      value: examStats.examsGraded,
      icon: CheckCircle,
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    },
    {
      title: "Active Classes",
      value: activeClasses,
      icon: Clock,
      color:
        "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome back, Teacher!</h1>
            <p className="text-indigo-100 text-sm">
              {classes.length} classes assigned
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            T
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {stat.title}
                </p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                View My Classes
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Manage your assigned classes and view student rosters.
              </p>
              <Link
                to="/teacher/classes"
                className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                View Classes <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="card bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                Manage Exams
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Create and manage exams for your classes.
              </p>
              <Link
                to="/teacher/exams"
                className="mt-2 inline-flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 font-medium hover:underline"
              >
                Manage Exams <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Exams - Only show if teacher has exams */}
      {recentExams.length > 0 && !loadingExams && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              Recent Exams
            </h3>
            <Link
              to="/teacher/exams"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentExams.map((exam) => (
              <div
                key={exam._id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    {exam.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {exam.classId?.className || "Unknown Class"}
                    </span>
                    <Badge status={exam.examType} className="text-xs" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(exam.examDate)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    status={exam.hasResults ? "APPROVED" : "PENDING"}
                    label={exam.hasResults ? "Graded" : "Pending"}
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {exam.maxScore} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Classes */}
      {classes.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              My Classes
            </h3>
            <Link
              to="/teacher/classes"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {classes.slice(0, 3).map((classItem) => (
              <Link
                key={classItem._id}
                to={`/teacher/classes/${classItem._id}/students`}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      classItem.classType === "FRESH"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-purple-100 dark:bg-purple-900/30"
                    }`}
                  >
                    <BookOpen
                      className={`w-4 h-4 ${
                        classItem.classType === "FRESH"
                          ? "text-green-600 dark:text-green-400"
                          : "text-purple-600 dark:text-purple-400"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-200">
                      {classItem.className}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {classItem.currentStudents || 0} students •{" "}
                      {classItem.classType}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
