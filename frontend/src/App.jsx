import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { ROLES } from "./constants";

// Initialize stores on load (side-effect imports)
import "./store/themeStore";
import "./store/i18nStore";

// Layouts
import AppLayout from "./components/layout/AppLayout";

// Public Pages
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ChangePasswordPage from "./pages/auth/ChangePasswordPage";

// Notification Context
import { SocketProvider } from "./context/SocketContext";

// Dashboard
import DashboardPage from "./pages/dashboard/DashboardPage";

// Students
import StudentsPage from "./pages/students/StudentsPage";
import PendingStudentsPage from "./pages/students/PendingStudentsPage";
import ProfilePage from "./pages/students/ProfilePage";

// Teachers
import TeachersPage from "./pages/teachers/TeachersPage";

// Admin
import ClassChangeApprovalPage from "./pages/admin/ClassChangeApprovalPage";

// Classes
import ClassesPage from "./pages/classes/ClassesPage";

// Schedules
import SchedulesPage from "./pages/schedules/SchedulesPage";
import MySchedulePage from "./pages/schedules/MySchedulePage";

// Exams
import ExamsPage from "./pages/exams/ExamsPage";
import MyExamsPage from "./pages/exams/MyExamsPage";

// Payments
import PaymentsPage from "./pages/payments/PaymentsPage";
import MyPaymentsPage from "./pages/payments/MyPaymentsPage";

// Class Changes
import ClassChangePage from "./pages/class-change/ClassChangePage";

// Promotions
import PromotionsPage from "./pages/promotions/PromotionsPage";

// Kflats
import KflatsPage from "./pages/kflats/KflatsPage";

// Notifications
import NotificationsPage from "./pages/notifications/NotificationsPage";

// Settings
import SettingsPage from "./pages/settings/SettingsPage";

// ─── Guards ────────────────────────────────────────────────────────────────
function PrivateRoute({ children, roles }) {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * If already authenticated, redirect away from auth pages (login / register).
 * Otherwise render the page normally.
 */
function AuthRoute({ children }) {
  const { user, token } = useAuthStore();

  if (token && user) {
    // Already logged in — send to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ─── Role-based component switchers ────────────────────────────────────────

function ExamsRoute() {
  const user = useAuthStore((s) => s.user);
  return user?.role === ROLES.ADMIN ? <ExamsPage /> : <MyExamsPage />;
}

function PaymentsRoute() {
  const user = useAuthStore((s) => s.user);
  return user?.role === ROLES.ADMIN ? <PaymentsPage /> : <MyPaymentsPage />;
}

// ─── Catch All ────────────────────────────────────────────────────────────
function CatchAll() {
  const { user, token } = useAuthStore();
  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/" replace />;
}

// ─── App ───────────────────────────────────────────────────────────────────

function App() {
  return (
    <SocketProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              fontSize: "14px",
            },
          }}
        />
        <Routes>
          {/* ── Public / unauthenticated routes ── */}
          <Route path="/" element={<HomePage />} />

          <Route
            path="/login"
            element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRoute>
                <RegisterPage />
              </AuthRoute>
            }
          />

          <Route path="/change-password" element={<ChangePasswordPage />} />

          {/* ── Authenticated app shell ── */}
          <Route
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Admin-only */}
            <Route
              path="/students/pending"
              element={
                <PrivateRoute roles={[ROLES.ADMIN]}>
                  <PendingStudentsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/students"
              element={
                <PrivateRoute roles={[ROLES.ADMIN]}>
                  <StudentsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/teachers"
              element={
                <PrivateRoute roles={[ROLES.ADMIN]}>
                  <TeachersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/classes"
              element={
                <PrivateRoute roles={[ROLES.ADMIN]}>
                  <ClassesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/schedules"
              element={
                <PrivateRoute roles={[ROLES.ADMIN, ROLES.TEACHER]}>
                  <SchedulesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/promotions"
              element={
                <PrivateRoute roles={[ROLES.ADMIN]}>
                  <PromotionsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/kflats"
              element={
                <PrivateRoute roles={[ROLES.ADMIN]}>
                  <KflatsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute roles={[ROLES.ADMIN]}>
                  <SettingsPage />
                </PrivateRoute>
              }
            />

            {/* Admin + Students */}
            <Route
              path="/exams"
              element={
                <PrivateRoute
                  roles={[
                    ROLES.ADMIN,
                    ROLES.FRESH_STUDENT,
                    ROLES.ADVANCED_STUDENT,
                  ]}
                >
                  <ExamsRoute />
                </PrivateRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <PrivateRoute
                  roles={[
                    ROLES.ADMIN,
                    ROLES.FRESH_STUDENT,
                    ROLES.ADVANCED_STUDENT,
                  ]}
                >
                  <PaymentsRoute />
                </PrivateRoute>
              }
            />
            <Route
              path="/class-change"
              element={
                <PrivateRoute
                  roles={[
                    ROLES.ADMIN,
                    ROLES.FRESH_STUDENT,
                    ROLES.ADVANCED_STUDENT,
                  ]}
                >
                  <ClassChangePage />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/class-change-approvals"
              element={
                <PrivateRoute roles={[ROLES.ADMIN]}>
                  <ClassChangeApprovalPage />
                </PrivateRoute>
              }
            />

            {/* Student-only */}
            <Route
              path="/student/profile"
              element={
                <PrivateRoute
                  roles={[ROLES.FRESH_STUDENT, ROLES.ADVANCED_STUDENT]}
                >
                  <ProfilePage />
                </PrivateRoute>
              }
            />

            {/* Teacher-only */}
            <Route
              path="/teacher/profile"
              element={
                <PrivateRoute roles={[ROLES.TEACHER]}>
                  <ProfilePage />
                </PrivateRoute>
              }
            />

            {/* Admin-only */}
            <Route
              path="/admin/profile"
              element={
                <PrivateRoute roles={[ROLES.ADMIN]}>
                  <ProfilePage />
                </PrivateRoute>
              }
            />

            <Route
              path="/schedule"
              element={
                <PrivateRoute
                  roles={[ROLES.FRESH_STUDENT, ROLES.ADVANCED_STUDENT]}
                >
                  <MySchedulePage />
                </PrivateRoute>
              }
            />

            {/* All authenticated users */}
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          <Route path="*" element={<CatchAll />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
