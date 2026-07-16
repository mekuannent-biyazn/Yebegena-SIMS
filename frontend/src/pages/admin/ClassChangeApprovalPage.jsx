import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Users,
  Clock,
  Check,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { classChangeService } from "../../services/classChangeService";
import { useI18nStore } from "../../store/i18nStore";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { Badge } from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate } from "../../utils/helpers";

export default function ClassChangeApprovalPage() {
  const { t } = useI18nStore();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    matched: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
  });

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);
    try {
      const response = await classChangeService.getAllRequests();
      console.log("📊 Admin - All Requests:", response.data);

      const data = response.data?.data || [];
      setRequests(data);

      // Calculate stats from response
      if (response.data?.stats) {
        setStats(response.data.stats);
      } else {
        // Fallback calculation
        const total = data.length;
        const open = data.filter((r) => r.status === "OPEN").length;
        const matched = data.filter((r) => r.status === "MATCHED").length;
        const approved = data.filter((r) => r.status === "APPROVED").length;
        const rejected = data.filter((r) => r.status === "REJECTED").length;
        const cancelled = data.filter((r) => r.status === "CANCELLED").length;
        setStats({ total, open, matched, approved, rejected, cancelled });
      }

      if (data.length === 0) {
        toast.success("No class change requests found");
      }
    } catch (error) {
      console.error("Error loading requests:", error);
      console.error("Error details:", error.response?.data);

      const errorMsg =
        error.response?.data?.message || "Failed to load class change requests";

      if (error.response?.status === 403) {
        toast.error(
          "You do not have permission to view class change requests. Please contact admin.",
        );
      } else if (error.response?.status === 401) {
        toast.error("Please login again to view class change requests.");
      } else {
        toast.error(errorMsg);
      }

      setRequests([]);
      setStats({
        total: 0,
        open: 0,
        matched: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    if (
      !confirm(
        "Approve this class change request? This will swap the classes of both students.",
      )
    )
      return;

    setProcessing(id);
    try {
      const response = await classChangeService.approve(id);
      toast.success(
        response.data?.message ||
          "Class change approved successfully! Students have been notified.",
      );
      loadRequests();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to approve";
      toast.error(errorMsg);
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(id) {
    if (!confirm("Reject this class change request?")) return;

    setProcessing(id);
    try {
      await classChangeService.reject(id);
      toast.success("Request rejected");
      loadRequests();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to reject";
      toast.error(errorMsg);
    } finally {
      setProcessing(null);
    }
  }

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusMap = {
      OPEN: {
        color:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        label: "Open",
      },
      MATCHED: {
        color:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        label: "Pending Approval",
      },
      APPROVED: {
        color:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        label: "Approved",
      },
      REJECTED: {
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        label: "Rejected",
      },
      CANCELLED: {
        color:
          "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
        label: "Cancelled",
      },
    };
    return (
      statusMap[status] || { color: "bg-gray-100 text-gray-700", label: status }
    );
  };

  // Get action buttons based on status
  const getActionButtons = (request) => {
    if (request.status === "MATCHED") {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleApprove(request._id)}
            disabled={processing === request._id}
            className="btn-success text-xs px-3 py-1.5 flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            {processing === request._id ? "Processing..." : "Approve Swap"}
          </button>
          <button
            onClick={() => handleReject(request._id)}
            disabled={processing === request._id}
            className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Reject
          </button>
        </div>
      );
    } else if (request.status === "OPEN") {
      return (
        <button
          onClick={() => handleReject(request._id)}
          disabled={processing === request._id}
          className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          {processing === request._id ? "Processing..." : "Reject"}
        </button>
      );
    } else {
      return (
        <span className="text-xs text-slate-400">
          {request.status.charAt(0) + request.status.slice(1).toLowerCase()}
        </span>
      );
    }
  };

  if (loading) {
    return <SkeletonTable rows={5} cols={7} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Class Change Approvals
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Review and approve matched class change requests
          </p>
        </div>
        <button
          onClick={loadRequests}
          className="btn-secondary"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-600 dark:text-blue-400">Total</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {stats.total}
          </p>
        </div>
        <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-600 dark:text-blue-400">Open</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {stats.open}
          </p>
        </div>
        <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            Pending Approval
          </p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {stats.matched}
          </p>
        </div>
        <div className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <p className="text-xs text-green-600 dark:text-green-400">Approved</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {stats.approved}
          </p>
        </div>
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">Rejected</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            {stats.rejected}
          </p>
        </div>
      </div>

      {/* Requests Table */}
      {requests.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title="No Class Change Requests"
            description="There are no class change requests to review."
          />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="table-th text-left">Student</th>
                  <th className="table-th text-left">Current Class</th>
                  <th className="table-th text-left">Desired Class</th>
                  <th className="table-th text-left">Matched With</th>
                  <th className="table-th text-left">Status</th>
                  <th className="table-th text-left">Date</th>
                  <th className="table-th text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const statusInfo = getStatusBadge(req.status);
                  const isMatched = req.status === "MATCHED";

                  return (
                    <tr
                      key={req._id}
                      className={`border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 last:border-0 ${
                        isMatched ? "bg-yellow-50/50 dark:bg-yellow-900/5" : ""
                      }`}
                    >
                      <td className="table-td">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">
                            {req.requesterStudent?.userId?.fullName ||
                              "Unknown"}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {req.requesterStudent?.userId?.phoneNumber || ""}
                          </p>
                        </div>
                      </td>
                      <td className="table-td text-slate-600 dark:text-slate-300">
                        {req.currentClass?.className || "N/A"}
                      </td>
                      <td className="table-td text-slate-600 dark:text-slate-300">
                        {req.desiredClass?.className || "Any"}
                      </td>
                      <td className="table-td">
                        {req.matchedStudent ? (
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                              {req.matchedStudent?.userId?.fullName ||
                                "Unknown"}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {req.matchedStudent?.userId?.phoneNumber || ""}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            No match yet
                          </span>
                        )}
                      </td>
                      <td className="table-td">
                        <Badge
                          status={req.status}
                          className={statusInfo.color}
                        />
                        {req.status === "MATCHED" && (
                          <p className="text-xs text-yellow-600 mt-1">
                            ⏳ Waiting for admin approval
                          </p>
                        )}
                      </td>
                      <td className="table-td text-slate-500 dark:text-slate-400">
                        {formatDate(req.createdAt)}
                      </td>
                      <td className="table-td">{getActionButtons(req)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              How Class Change Works
            </p>
            <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 list-disc list-inside space-y-1">
              <li>Students create class change requests</li>
              <li>Students can find and accept matches with volunteers</li>
              <li>When matched, both students are notified</li>
              <li>Admin must approve the match to swap classes</li>
              <li>Both students receive confirmation notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
