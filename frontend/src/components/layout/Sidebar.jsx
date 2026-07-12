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
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useI18nStore } from "../../store/i18nStore";
import { ROLES } from "../../constants";

export default function Sidebar({ isOpen, setIsOpen, isDesktop }) {
  const user = useAuthStore((s) => s.user);
  const { t } = useI18nStore();

  // Admin links
  const adminLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { to: "/students/pending", icon: UserPlus, label: t("pendingStudents") },
    { to: "/students", icon: Users, label: t("students") },
    { to: "/teachers", icon: GraduationCap, label: t("teachers") },
    { to: "/classes", icon: BookOpen, label: t("classes") },
    { to: "/schedules", icon: Calendar, label: t("schedules") },
    // { to: "/exams", icon: FileText, label: t("exams") },
    { to: "/payments", icon: CreditCard, label: t("payments") },
    { to: "/class-change", icon: RefreshCw, label: t("classChange") },
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

  // Teacher links
  const teacherLinks = [
    // { to: "/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    // { to: "/schedules", icon: Calendar, label: t("schedules") },
    // { to: "/exams", icon: FileText, label: t("exams") },
    // { to: "/notifications", icon: Bell, label: t("notifications") },

    { to: "/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { to: "/teacher/classes", icon: BookOpen, label: "My Classes" },
    { to: "/teacher/exams", icon: FileText, label: t("exams") },
    { to: "/notifications", icon: Bell, label: t("notifications") },
    // { to: "/exams", icon: FileText, label: t("exams") },
  ];

  // Student links
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

  const getInitials = (name) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  const getProfilePicture = () => {
    if (user?.profilePicture) return user.profilePicture;
    if (user?.picture) return user.picture;
    return null;
  };

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

  const closeSidebar = () => {
    if (!isDesktop) {
      setIsOpen(false);
    }
  };

  // Sidebar classes
  const getSidebarClasses = () => {
    let classes =
      "fixed top-0 left-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 ease-in-out z-50 overflow-hidden";

    if (isDesktop) {
      // Desktop: always visible
      classes += isOpen ? " w-[260px]" : " w-[72px]";
      classes += " translate-x-0";
    } else {
      // Mobile: slides in/out
      classes += " w-[280px]";
      classes += isOpen ? " translate-x-0" : " -translate-x-full";
    }

    return classes;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!isDesktop && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      <aside className={getSidebarClasses()}>
        {/* Header - Hide text when sidebar is collapsed on desktop */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between min-h-[72px]">
          <div
            className={`${!isOpen && isDesktop ? "hidden" : "block"} flex-1 min-w-0`}
          >
            <h1
              className={`font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent whitespace-nowrap transition-all duration-300 ${
                isOpen ? "text-lg" : "text-base"
              }`}
            >
              {isOpen ? "Yebegena SIMS" : "YS"}
            </h1>
            {isOpen && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                {user?.role === ROLES.ADMIN && "Admin Panel"}
                {user?.role === ROLES.TEACHER && "Teacher Portal"}
                {(user?.role === ROLES.FRESH_STUDENT ||
                  user?.role === ROLES.ADVANCED_STUDENT) &&
                  "Student Portal"}
              </p>
            )}
          </div>

          {/* Close button for mobile */}
          {!isDesktop && isOpen && (
            <button
              onClick={closeSidebar}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          )}

          {/* Toggle button for desktop */}
          {isDesktop && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0 ${
                !isOpen ? "mx-auto" : ""
              }`}
            >
              {isOpen ? (
                <ChevronLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              )}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""} ${
                  !isOpen ? "justify-center" : ""
                }`
              }
            >
              <Icon
                className={`${isOpen ? "w-5 h-5" : "w-6 h-6"} flex-shrink-0`}
              />
              {isOpen && <span className="ml-3">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700">
          <NavLink
            to={getProfileLink()}
            onClick={closeSidebar}
            className="block"
          >
            <div
              className={`flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors cursor-pointer ${
                !isOpen ? "justify-center" : ""
              }`}
            >
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
              {isOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                    {user?.fullName || "User"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.phoneNumber || ""}
                  </p>
                </div>
              )}
              {isOpen && (
                <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
              )}
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
