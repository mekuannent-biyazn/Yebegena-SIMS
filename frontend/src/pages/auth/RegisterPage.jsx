import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Phone,
  Lock,
  User,
  ChevronDown,
  BookOpen,
  Globe,
  Moon,
  Sun,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { useI18nStore } from "../../store/i18nStore";
import { useKflats } from "../../hooks/useKflats";
import { useKflatRoles } from "../../hooks/useKflatRoles";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    kflat: "",
    kflatRole: "",
    customKflatRole: "",
  });
  const [showPass, setShowPass] = useState(false);

  // Use the hooks directly
  const { kflats } = useKflats();
  const { kflatRoles } = useKflatRoles(); // Pass kflatId if needed

  const { register, isLoading, user, token } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const { language, setLanguage } = useI18nStore();
  const navigate = useNavigate();
  const isAm = language === "am";

  // Already logged in — skip register
  useEffect(() => {
    if (token && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error(isAm ? "ፓስዎርዶቹ አይዛመዱም" : "Passwords do not match");
      return;
    }
    const payload = {
      fullName: form.fullName,
      phoneNumber: form.phoneNumber,
      password: form.password,
      confirmPassword: form.confirmPassword,
    };
    if (form.kflat) payload.kflat = form.kflat;
    if (form.kflatRole) payload.kflatRole = form.kflatRole;
    if (form.customKflatRole) payload.customKflatRole = form.customKflatRole;

    try {
      await register(payload);
      toast.success(
        isAm
          ? "ምዝገባ ተጠናቋል! የአስተዳዳሪ ፍቃድ እስኪያዙ ይጠብቁ።"
          : "Registration submitted! Awaiting admin approval.",
      );
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          (isAm ? "ምዝገባ አልተሳካም" : "Registration failed"),
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Top controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => setLanguage(isAm ? "en" : "am")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
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
      <div className="absolute top-4 left-4 z-10">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 border border-white/30
                     text-white text-xs font-semibold hover:bg-white/30 transition-colors"
        >
          ← {isAm ? "መነሻ ገጽ" : "Home"}
        </Link>
      </div>

      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Yebegena SIMS</h1>
          <p className="text-primary-200 mt-1 text-sm">
            {isAm ? "የተማሪ አካውንት ፍጠሩ" : "Create your student account"}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
            {isAm ? "ተመዝገብ" : "Register"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            {isAm ? "ዝርዝሮችዎን ሙሉ" : "Fill in your details to request enrollment"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="label dark:text-slate-300">
                {isAm ? "ሙሉ ስም" : "Full Name"}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  className="input pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                  placeholder={isAm ? "ሙሉ ስምዎ" : "Your full name"}
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="label dark:text-slate-300">
                {isAm ? "ስልክ ቁጥር" : "Phone Number"}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  className="input pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
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

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label dark:text-slate-300">
                  {isAm ? "ፓስዎርድ" : "Password"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    className="input pl-10 pr-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                    placeholder={isAm ? "ፓስዎርድ" : "Password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                    autoComplete="new-password"
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
              <div>
                <label className="label dark:text-slate-300">
                  {isAm ? "ያረጋግጡ" : "Confirm"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    className="input pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                    placeholder={isAm ? "አረጋጋጥ" : "Confirm"}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            {/* Kflat + Role (optional) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label dark:text-slate-300">
                  {isAm ? "ክፍል" : "Kflat"}
                  <span className="text-slate-400 font-normal ml-1">
                    {isAm ? "(አማራጭ)" : "(optional)"}
                  </span>
                </label>
                <div className="relative">
                  <select
                    className="input pr-8 appearance-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={form.kflat}
                    onChange={(e) =>
                      setForm({ ...form, kflat: e.target.value })
                    }
                  >
                    <option value="">
                      {isAm ? "ክፍል ምረጥ" : "Select Kflat"}
                    </option>
                    {kflats.map((k) => (
                      <option key={k._id} value={k._id}>
                        {k.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="label dark:text-slate-300">
                  {isAm ? "ሚና" : "Kflat Role"}
                  <span className="text-slate-400 font-normal ml-1">
                    {isAm ? "(አማራጭ)" : "(optional)"}
                  </span>
                </label>
                <div className="relative">
                  <select
                    className="input pr-8 appearance-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={form.kflatRole}
                    onChange={(e) =>
                      setForm({ ...form, kflatRole: e.target.value })
                    }
                  >
                    <option value="">{isAm ? "ሚና ምረጥ" : "Select Role"}</option>
                    {kflatRoles.map((r) => (
                      <option key={r._id} value={r._id}>
                        {isAm
                          ? r.roleName?.am || r.roleName?.en
                          : r.roleName?.en}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="label dark:text-slate-300">
                {isAm ? "ልዩ ሚና" : "Custom Role"}
                <span className="text-slate-400 font-normal ml-1">
                  {isAm ? "(አማራጭ)" : "(optional)"}
                </span>
              </label>
              <input
                type="text"
                className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                placeholder={isAm ? "ለምሳሌ: የቡድን መሪ" : "e.g. Group Leader"}
                value={form.customKflatRole}
                onChange={(e) =>
                  setForm({ ...form, customKflatRole: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isAm ? "በማስገባት ላይ..." : "Submitting..."}
                </span>
              ) : isAm ? (
                "ምዝገባ አስገባ"
              ) : (
                "Submit Registration"
              )}
            </button>
          </form>

          <div className="mt-5 space-y-2">
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              {isAm ? "አካውንት አለዎት? " : "Already have an account? "}
              <Link
                to="/login"
                className="text-primary-600 font-semibold hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                {isAm ? "ግባ" : "Sign in"}
              </Link>
            </p>
            <p className="text-center">
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
