import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";

import Register from "../pages/auth/Register";

import ChangePassword from "../pages/auth/ChangePassword";

import AdminDashboard from "../pages/admin/Dashboard";

import TeacherDashboard from "../pages/teacher/Dashboard";

import StudentDashboard from "../pages/student/Dashboard";

import ProtectedRoute from "./ProtectedRoute";

import RoleRoute from "./RoleRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/change-password" element={<ChangePassword />} />

        {/* Admin */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Teacher */}

        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["ADVANCED_TEACHER", "FRESH_TEACHER"]}>
                <TeacherDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Student */}

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["FRESH_STUDENT", "ADVANCED_STUDENT"]}>
                <StudentDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
