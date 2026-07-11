import { useState, useEffect } from "react";
import {
  Users,
  FileText,
  Award,
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { examService } from "../../services/examService";
import { classService } from "../../services/classService";
import { teacherService } from "../../services/teacherService";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { Badge } from "../../components/ui/Badge";
import { formatDate } from "../../utils/helpers";

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalExams: 0,
    totalStudents: 0,
    examsGraded: 0,
    pendingExams: 0,
  });
  const [recentExams, setRecentExams] = useState([]);
  const [teacherInfo, setTeacherInfo] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      // Get teacher info
      const teacherRes = await teacherService.getProfile();
      const teacher = teacherRes.data.data;
      setTeacherInfo(teacher);

      // Get all exams
      const examsRes = await examService.getAllExams();
      const exams = examsRes.data.data || [];

      // Get classes
      const classesRes = await classService.getAll();
      const classes = classesRes.data.data || [];

      // Calculate stats
      const totalExams = exams.length;
      const totalClasses = classes.length;

      // Count unique students from all classes (you might need to adjust this)
      let totalStudents = 0;
      const studentsPromises = classes.map((c) =>
        classService
          .getStudentsByClass(c._id)
          .catch(() => ({ data: { data: [] } })),
      );
      const studentsResults = await Promise.all(studentsPromises);
      const allStudents = new Set();
      studentsResults.forEach((result) => {
        const students = result.data?.data || [];
        students.forEach((s) => allStudents.add(s._id));
      });
      totalStudents = allStudents.size;

      // Count graded vs pending exams
      let examsGraded = 0;
      let pendingExams = 0;
      exams.forEach((exam) => {
        if (exam.hasResults) {
          examsGraded++;
        } else {
          pendingExams++;
        }
      });

      setStats({
        totalClasses,
        totalExams,
        totalStudents,
        examsGraded,
        pendingExams,
      });

      // Get recent exams (last 5)
      const sortedExams = exams
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentExams(sortedExams);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

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
      value: stats.totalClasses,
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Exams",
      value: stats.totalExams,
      icon: FileText,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Exams Graded",
      value: stats.examsGraded,
      icon: CheckCircle,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Pending Exams",
      value: stats.pendingExams,
      icon: XCircle,
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {teacherInfo?.userId?.fullName || "Teacher"}!
            </h1>
            <p className="text-indigo-100 mt-1">
              {teacherInfo?.teacherType?.replace("_", " ")} •{" "}
              {stats.totalClasses} classes assigned
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {teacherInfo?.userId?.fullName?.slice(0, 2) || "T"}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

      {/* Recent Exams */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">
            Recent Exams
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Latest 5 exams
          </span>
        </div>

        {recentExams.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 dark:text-slate-400">
              No exams created yet
            </p>
          </div>
        ) : (
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
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                Add Results
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Add results for exams. Only students enrolled in the class will
                be shown.
              </p>
              <button
                onClick={() => (window.location.href = "/teacher/exams")}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                Go to Exams →
              </button>
            </div>
          </div>
        </div>

        <div className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                Manage Classes
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                View your assigned classes and student information.
              </p>
              <button
                onClick={() => (window.location.href = "/teacher/classes")}
                className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium hover:underline"
              >
                View Classes →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
