import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  CreditCard,
  Bell,
  Settings,
  UserPlus,
  TrendingUp,
  UserCog,
  RefreshCw,
  User,
  Award,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useI18nStore } from "../../store/i18nStore";
import { ROLES } from "../../constants";

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const { t } = useI18nStore();

  // Admin links - matches routes in App.jsx
  const adminLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { to: "/students/pending", icon: UserPlus, label: t("pendingStudents") },
    { to: "/students", icon: Users, label: t("students") },
    { to: "/teachers", icon: GraduationCap, label: t("teachers") },
    { to: "/classes", icon: BookOpen, label: t("classes") },
    { to: "/schedules", icon: Calendar, label: t("schedules") },
    { to: "/exams", icon: FileText, label: t("exams") },
    { to: "/payments", icon: CreditCard, label: t("payments") },
    { to: "/class-change", icon: RefreshCw, label: t("classChange") },
    // Fixed: Use the correct syntax with colon and proper label
    {
      to: "/admin/class-change-approvals",
      icon: RefreshCw,
      label: "Class Change Approval",
    },
    { to: "/promotions", icon: TrendingUp, label: t("promotions") },
    { to: "/kflats", icon: UserCog, label: t("kflats") },
    { to: "/notifications", icon: Bell, label: t("notifications") },
    { to: "/settings", icon: Settings, label: t("settings") },
  ];

  // Teacher links - matches routes in App.jsx
  const teacherLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { to: "/schedules", icon: Calendar, label: t("schedules") },
    { to: "/exams", icon: FileText, label: t("exams") },
    { to: "/notifications", icon: Bell, label: t("notifications") },
  ];

  // Student links - matches routes in App.jsx
  const studentLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { to: "/schedule", icon: Calendar, label: t("mySchedule") },
    { to: "/exams", icon: FileText, label: t("myExams") },
    { to: "/payments", icon: CreditCard, label: t("myPayments") },
    { to: "/class-change", icon: RefreshCw, label: t("classChange") },
    { to: "/notifications", icon: Bell, label: t("notifications") },
  ];

  let links = [];
  if (user?.role === ROLES.ADMIN) links = adminLinks;
  else if (user?.role === ROLES.TEACHER) links = teacherLinks;
  else links = studentLinks;

  // Get user initials
  const getInitials = (name) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  // Get profile picture URL
  const getProfilePicture = () => {
    if (user?.profilePicture) {
      return user.profilePicture;
    }
    if (user?.picture) {
      return user.picture;
    }
    return null;
  };

  // Get profile link based on role - matches routes in App.jsx
  const getProfileLink = () => {
    if (user?.role === ROLES.ADMIN) return "/admin/profile";
    if (user?.role === ROLES.TEACHER) return "/teacher/profile";
    if (
      user?.role === ROLES.FRESH_STUDENT ||
      user?.role === ROLES.ADVANCED_STUDENT
    ) {
      return "/student/profile";
    }
    return "/dashboard";
  };

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          Yebegena SIMS
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {user?.role === ROLES.ADMIN && "Admin Panel"}
          {user?.role === ROLES.TEACHER && "Teacher Portal"}
          {(user?.role === ROLES.FRESH_STUDENT ||
            user?.role === ROLES.ADVANCED_STUDENT) &&
            "Student Portal"}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <NavLink to={getProfileLink()} className="block">
          <div className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
              {getProfilePicture() ? (
                <img
                  src={getProfilePicture()}
                  alt={user?.fullName || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(user?.fullName)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                {user?.fullName || "User"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.phoneNumber || ""}
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}
