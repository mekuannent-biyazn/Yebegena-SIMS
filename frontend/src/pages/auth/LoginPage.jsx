// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Phone, Lock, Globe, Moon, Sun } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { useI18nStore } from "../../store/i18nStore";
import Logo from "../../components/ui/Logo";

export default function LoginPage() {
  const [form, setForm] = useState({ phoneNumber: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, token } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const { language, setLanguage } = useI18nStore();
  const navigate = useNavigate();
  const isAm = language === "am";

  // Already logged in — skip login page
  useEffect(() => {
    if (token && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { mustChangePassword } = await login(
        form.phoneNumber,
        form.password,
      );
      if (mustChangePassword) {
        toast(
          isAm
            ? "ጊዜያዊ ፓስዎርዱን ይቀይሩ"
            : "Please change your temporary password first",
          { icon: "🔑" },
        );
        navigate("/change-password");
      } else {
        toast.success(isAm ? "እንኳን ደህና መጡ!" : "Welcome back!");
        navigate("/dashboard");
      }
    } catch (err) {
      // Error already handled in store, but we need to stop loading
      toast.error(
        err.response?.data?.message || (isAm ? "መግቢያ አልተሳካም" : "Login failed"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-400/10 rounded-full blur-2xl" />
      </div>

      {/* Top controls */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => setLanguage(isAm ? "en" : "am")}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold
                     bg-white/20 border border-white/30 text-white hover:bg-white/30 transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          {isAm ? "AM" : "EN"}
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white/20 border border-white/30 text-white hover:bg-white/30 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Back to home */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
        <Link
          to="/"
          className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-white/20 border border-white/30
                     text-white text-xs font-semibold hover:bg-white/30 transition-colors"
        >
          ← {isAm ? "መነሻ ገጽ" : "Home"}
        </Link>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-lg p-3">
            <Logo variant="icon" className="w-full h-full" />
          </div>
          <Logo variant="full" className="justify-center" />
          <p className="text-primary-200 mt-1 text-xs sm:text-sm">
            {isAm
              ? "የተማሪ መረጃ አስተዳደር ስርዓት"
              : "Student Information Management System"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-1">
            {isAm ? "እንኳን ደህና መጡ" : "Welcome back"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6">
            {isAm
              ? "ወደ አካውንትዎ ለመግባት ያስገቡ"
              : "Sign in to your account to continue"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="label dark:text-slate-300 text-sm">
                {isAm ? "ስልክ ቁጥር" : "Phone Number"}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  className="input pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 text-sm sm:text-base"
                  placeholder="09XXXXXXXX"
                  value={form.phoneNumber}
                  onChange={(e) =>
                    setForm({ ...form, phoneNumber: e.target.value })
                  }
                  required
                  autoComplete="tel"
                />
              </div>
            </div>

            <div>
              <label className="label dark:text-slate-300 text-sm">
                {isAm ? "ፓስዎርድ" : "Password"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPass ? "text" : "password"}
                  className="input pl-10 pr-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 text-sm sm:text-base"
                  placeholder={isAm ? "ፓስዎርድዎን ያስገቡ" : "Enter your password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-2 text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isAm ? "በመግባት ላይ..." : "Signing in..."}
                </span>
              ) : isAm ? (
                "ግባ"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isAm ? "አካውንት የለዎትም? " : "Don't have an account? "}
              <Link
                to="/register"
                className="text-primary-600 font-semibold hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                {isAm ? "ተመዝገብ" : "Register here"}
              </Link>
            </p>
            <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <Link
                to="/"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline text-xs"
              >
                {isAm ? "← ወደ መነሻ ገጽ ተመለስ" : "← Back to home page"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
