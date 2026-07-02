import {
  FaHome,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBuilding,
  FaUsers,
  FaSchool,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaBell,
  FaChartBar,
  FaCog,
} from "react-icons/fa";

export const adminMenu = [
  { title: "Dashboard", icon: FaHome, path: "/admin/dashboard" },

  { title: "Students", icon: FaUserGraduate, path: "/admin/students" },

  { title: "Teachers", icon: FaChalkboardTeacher, path: "/admin/teachers" },

  { title: "Kflat", icon: FaBuilding, path: "/admin/kflats" },

  { title: "Kflat Roles", icon: FaUsers, path: "/admin/kflat-roles" },

  { title: "Classes", icon: FaSchool, path: "/admin/classes" },

  { title: "Schedules", icon: FaCalendarAlt, path: "/admin/schedules" },

  { title: "Payments", icon: FaMoneyBillWave, path: "/admin/payments" },

  {
    title: "Class Change",
    icon: FaExchangeAlt,
    path: "/admin/class-change",
  },

  {
    title: "Notifications",
    icon: FaBell,
    path: "/admin/notifications",
  },

  {
    title: "Reports",
    icon: FaChartBar,
    path: "/admin/reports",
  },

  {
    title: "Settings",
    icon: FaCog,
    path: "/admin/settings",
  },
];
