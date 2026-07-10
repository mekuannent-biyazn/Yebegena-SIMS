import { useState, useEffect } from "react";
import { useI18nStore } from "../../store/i18nStore";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useAuthStore } from "../../store/authStore";
import {
  Settings,
  Save,
  Calendar,
  DollarSign,
  Users,
  Globe,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { settingsService } from "../../services/settingsService";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    freshStudentFee: 1000,
    advancedStudentFee: 1500,
    paymentPeriodStartDay: 1,
    paymentPeriodEndDay: 10,
    classChangeEnabled: false,
    academicYear: "",
    defaultLanguage: "en",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      console.log("Loading settings...");
      const response = await settingsService.getSettings();
      console.log("Settings response:", response);

      if (response.data && response.data.data) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error("Load settings error:", error);
      toast.error(error.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  const validateForm = () => {
    const newErrors = {};

    if (settings.freshStudentFee < 0) {
      newErrors.freshStudentFee = "Fee must be greater than or equal to 0";
    }

    if (settings.advancedStudentFee < 0) {
      newErrors.advancedStudentFee = "Fee must be greater than or equal to 0";
    }

    if (
      settings.paymentPeriodStartDay < 1 ||
      settings.paymentPeriodStartDay > 31
    ) {
      newErrors.paymentPeriodStartDay = "Start day must be between 1 and 31";
    }

    if (settings.paymentPeriodEndDay < 1 || settings.paymentPeriodEndDay > 31) {
      newErrors.paymentPeriodEndDay = "End day must be between 1 and 31";
    }

    if (settings.paymentPeriodStartDay > settings.paymentPeriodEndDay) {
      newErrors.paymentPeriodEndDay = "End day must be after start day";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      console.log("Updating settings:", settings);
      const response = await settingsService.updateSettings(settings);
      console.log("Update response:", response);

      if (response.data && response.data.data) {
        setSettings(response.data.data);
      }

      toast.success("Settings updated successfully!");
    } catch (error) {
      console.error("Update settings error:", error);
      toast.error(error.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            System Settings
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure payment amounts, periods, and other system settings
          </p>
        </div>
        <button
          onClick={loadSettings}
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Settings */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-primary-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Payment Settings
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fresh Student Fee */}
            <div>
              <label className="label flex items-center gap-1">
                <Users className="w-4 h-4" />
                Fresh Student Fee (ETB)
              </label>
              <input
                type="number"
                value={settings.freshStudentFee}
                onChange={(e) =>
                  handleChange(
                    "freshStudentFee",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className={`input ${errors.freshStudentFee ? "border-red-500" : ""}`}
                min="0"
                step="100"
                disabled={saving}
              />
              {errors.freshStudentFee && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.freshStudentFee}
                </p>
              )}
            </div>

            {/* Advanced Student Fee */}
            <div>
              <label className="label flex items-center gap-1">
                <Users className="w-4 h-4" />
                Advanced Student Fee (ETB)
              </label>
              <input
                type="number"
                value={settings.advancedStudentFee}
                onChange={(e) =>
                  handleChange(
                    "advancedStudentFee",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className={`input ${errors.advancedStudentFee ? "border-red-500" : ""}`}
                min="0"
                step="100"
                disabled={saving}
              />
              {errors.advancedStudentFee && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.advancedStudentFee}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Period Settings */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Payment Period
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Start Day</label>
              <input
                type="number"
                value={settings.paymentPeriodStartDay}
                onChange={(e) =>
                  handleChange(
                    "paymentPeriodStartDay",
                    parseInt(e.target.value) || 1,
                  )
                }
                className={`input ${errors.paymentPeriodStartDay ? "border-red-500" : ""}`}
                min="1"
                max="31"
                disabled={saving}
              />
              {errors.paymentPeriodStartDay && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.paymentPeriodStartDay}
                </p>
              )}
            </div>

            <div>
              <label className="label">End Day</label>
              <input
                type="number"
                value={settings.paymentPeriodEndDay}
                onChange={(e) =>
                  handleChange(
                    "paymentPeriodEndDay",
                    parseInt(e.target.value) || 1,
                  )
                }
                className={`input ${errors.paymentPeriodEndDay ? "border-red-500" : ""}`}
                min="1"
                max="31"
                disabled={saving}
              />
              {errors.paymentPeriodEndDay && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.paymentPeriodEndDay}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              📌 Students can only make payments between day{" "}
              {settings.paymentPeriodStartDay} and{" "}
              {settings.paymentPeriodEndDay} of each month.
            </p>
          </div>
        </div>

        {/* Other Settings */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Other Settings
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-1">
                <Globe className="w-4 h-4" />
                Default Language
              </label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) =>
                  handleChange("defaultLanguage", e.target.value)
                }
                className="input"
                disabled={saving}
              >
                <option value="en">English</option>
                <option value="am">Amharic</option>
              </select>
            </div>

            <div>
              <label className="label">Academic Year</label>
              <input
                type="text"
                value={settings.academicYear}
                onChange={(e) => handleChange("academicYear", e.target.value)}
                className="input"
                placeholder="e.g., 2024/2025"
                disabled={saving}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.classChangeEnabled}
                onChange={(e) =>
                  handleChange("classChangeEnabled", e.target.checked)
                }
                className="w-4 h-4 text-primary-600 rounded"
                disabled={saving}
              />
              <span className="text-sm text-slate-700 dark:text-slate-200">
                Enable Class Change Requests
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn-primary w-full" disabled={saving}>
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving Settings...
            </span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save All Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
}
