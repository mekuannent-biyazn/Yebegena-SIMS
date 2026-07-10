// pages/notifications/NotificationsPage.jsx
import { useState, useEffect } from "react";
import { Bell, Trash2, Eye, CheckCheck } from "lucide-react";
import toast from "react-hot-toast";
import { notificationService } from "../../services/notificationService";
import { useI18nStore } from "../../store/i18nStore";
import { SkeletonCard } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { formatDateTime } from "../../utils/helpers";

const TYPE_STYLES = {
  SUCCESS:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  INFO: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  WARNING:
    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  ERROR:
    "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
};

const TYPE_DOT = {
  SUCCESS: "bg-emerald-500",
  INFO: "bg-blue-500",
  WARNING: "bg-amber-500",
  ERROR: "bg-red-500",
};

export default function NotificationsPage() {
  const { t } = useI18nStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      // ✅ Use getMyNotifications() instead of getAll()
      const { data } = await notificationService.getMyNotifications();
      setNotifications(data.data || []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast.error(error.response?.data?.message || t("loadingFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id) {
    setProcessing(id);
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      toast.success("Marked as read");
    } catch (err) {
      console.error("Failed to mark as read:", err);
      toast.error(err.response?.data?.message || t("operationFailed"));
    } finally {
      setProcessing(null);
    }
  }

  async function handleDelete(id) {
    setProcessing(id);
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success("Notification deleted");
    } catch (err) {
      console.error("Failed to delete notification:", err);
      toast.error(err.response?.data?.message || t("operationFailed"));
    } finally {
      setProcessing(null);
    }
  }

  async function handleMarkAll() {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) {
      toast("All notifications are already read");
      return;
    }
    setMarkingAll(true);
    try {
      await Promise.all(
        unread.map((n) => notificationService.markAsRead(n._id)),
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error(t("operationFailed"));
    } finally {
      setMarkingAll(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {t("notificationsPage") || "Notifications"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : `${notifications.length} total`}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={markingAll}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            {markingAll ? "Loading..." : "Mark all as read"}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up!"
          />
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`card border transition-all ${
                !n.isRead
                  ? "bg-white dark:bg-slate-800 border-primary-200 dark:border-primary-800"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Unread dot */}
                <div className="flex-shrink-0 mt-1.5">
                  {!n.isRead ? (
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${TYPE_DOT[n.type] || "bg-primary-500"}`}
                    />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`badge border ${TYPE_STYLES[n.type] || "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"} text-xs`}
                    >
                      {n.type || "INFO"}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {formatDateTime(n.createdAt)}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${!n.isRead ? "font-semibold text-slate-800 dark:text-slate-100" : "text-slate-600 dark:text-slate-300"}`}
                  >
                    {n.title || n.message}
                  </p>
                  {n.title && n.message && n.message !== n.title && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {n.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n._id)}
                      disabled={processing === n._id}
                      className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 dark:text-blue-400 disabled:opacity-50"
                      title="Mark as read"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n._id)}
                    disabled={processing === n._id}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
