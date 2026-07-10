import { useState, useEffect } from "react";
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Download,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { paymentService } from "../../services/paymentService";
import { useI18nStore } from "../../store/i18nStore";
import { SkeletonTable, SkeletonStatCard } from "../../components/ui/Skeleton";
import { Badge } from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate } from "../../utils/helpers";

export default function PaymentsPage() {
  const { t } = useI18nStore();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [viewPayment, setViewPayment] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [paymentsRes, statsRes] = await Promise.all([
        paymentService.getAll(),
        paymentService.getStats(),
      ]);
      setPayments(paymentsRes.data.data || []);
      setStats(statsRes.data.data || null);
    } catch (error) {
      toast.error(error.response?.data?.message || t("loadingFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    if (!confirm("Are you sure you want to approve this payment?")) return;
    setProcessing(id);
    try {
      await paymentService.approve(id);
      toast.success("Payment approved successfully!");
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || t("operationFailed"));
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(id) {
    if (!rejectReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    setProcessing(id);
    try {
      await paymentService.reject(id, rejectReason);
      toast.success("Payment rejected successfully");
      setRejectModal(false);
      setRejectReason("");
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || t("operationFailed"));
    } finally {
      setProcessing(null);
    }
  }

  async function handleDelete(id) {
    if (
      !confirm(
        "Are you sure you want to delete this payment? This action cannot be undone.",
      )
    )
      return;
    setProcessing(id);
    try {
      await paymentService.delete(id);
      toast.success("Payment deleted successfully");
      setDeleteModal(false);
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || t("operationFailed"));
    } finally {
      setProcessing(null);
    }
  }

  const filtered = payments.filter((p) => {
    const matchStatus = filter === "ALL" || p.paymentStatus === filter;
    const matchSearch =
      p.student?.userId?.fullName
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      p.student?.userId?.phoneNumber?.includes(search) ||
      p.amount?.toString().includes(search);
    return matchStatus && matchSearch;
  });

  // Calculate total amount for filtered payments
  const totalFilteredAmount = filtered.reduce(
    (sum, p) => sum + (p.amount || 0),
    0,
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
        <SkeletonTable rows={6} cols={6} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {t("paymentsPage")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {payments.length} total payments · {filtered.length} filtered
          </p>
        </div>
        <button
          onClick={loadAll}
          className="btn-secondary text-sm"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mx-auto mb-2">
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {stats.approvedCount || 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t("approvedPayments")}
            </p>
          </div>

          <div className="card text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 mx-auto mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {stats.pendingCount || 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t("pendingPayments")}
            </p>
          </div>

          <div className="card text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 mx-auto mb-2">
              <XCircle className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {stats.rejectedCount || 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t("rejectedPayments")}
            </p>
          </div>

          <div className="card text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mx-auto mb-2">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {(stats.totalIncome || 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t("totalIncome")} ETB
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="input pl-9"
            placeholder="Search by name, phone or amount..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-40"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        {filtered.length > 0 && (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Total: {totalFilteredAmount.toLocaleString()} ETB
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={CreditCard}
              title={t("noPayments")}
              description={
                search
                  ? "No payments match your search criteria"
                  : t("emptyPayments")
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="table-th">Student</th>
                  <th className="table-th">Amount</th>
                  <th className="table-th">Month/Year</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Date</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p._id}
                    className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 last:border-0"
                  >
                    <td className="table-td">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">
                          {p.student?.userId?.fullName || "N/A"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {p.student?.userId?.phoneNumber || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {p.amount?.toLocaleString()} ETB
                      </span>
                    </td>
                    <td className="table-td text-slate-500 dark:text-slate-400">
                      {p.paymentMonth}/{p.paymentYear}
                    </td>
                    <td className="table-td">
                      <Badge status={p.paymentStatus} />
                    </td>
                    <td className="table-td text-slate-500 dark:text-slate-400">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewPayment(p)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {p.paymentStatus === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApprove(p._id)}
                              disabled={processing === p._id}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPayment(p);
                                setRejectModal(true);
                              }}
                              disabled={processing === p._id}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => {
                            setSelectedPayment(p);
                            setDeleteModal(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Payment Modal */}
      <Modal
        isOpen={!!viewPayment && !rejectModal && !deleteModal}
        onClose={() => setViewPayment(null)}
        title="Payment Details"
        size="md"
      >
        {viewPayment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Student
                </p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {viewPayment.student?.userId?.fullName || "N/A"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {viewPayment.student?.userId?.phoneNumber || "N/A"}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Amount
                </p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {viewPayment.amount?.toLocaleString()} ETB
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {viewPayment.paymentMonth}/{viewPayment.paymentYear}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Status
                </p>
                <Badge status={viewPayment.paymentStatus} />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Submitted
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  {formatDate(viewPayment.createdAt)}
                </p>
                {viewPayment.reviewedAt && (
                  <>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Reviewed: {formatDate(viewPayment.reviewedAt)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      By: {viewPayment.reviewedBy?.fullName || "Admin"}
                    </p>
                  </>
                )}
              </div>
            </div>

            {viewPayment.rejectionReason && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold mb-1">
                  Rejection Reason
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {viewPayment.rejectionReason}
                </p>
              </div>
            )}

            {viewPayment.receiptUrl && (
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Receipt Image
                </p>
                <div className="relative group">
                  <img
                    src={viewPayment.receiptUrl}
                    alt="Receipt"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                  <a
                    href={viewPayment.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-3 right-3 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Download className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal}
        onClose={() => {
          setRejectModal(false);
          setRejectReason("");
          setSelectedPayment(null);
        }}
        title="Reject Payment"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Rejection Reason</label>
            <textarea
              className="input h-24 resize-none"
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              This reason will be sent to the student
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() =>
                selectedPayment && handleReject(selectedPayment._id)
              }
              className="btn-danger flex-1"
              disabled={!rejectReason.trim() || processing}
            >
              {processing ? "Processing..." : "Reject Payment"}
            </button>
            <button
              onClick={() => {
                setRejectModal(false);
                setRejectReason("");
                setSelectedPayment(null);
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setSelectedPayment(null);
        }}
        title="Delete Payment"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              Are you sure you want to delete this payment?
            </p>
            {selectedPayment && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                Amount: {selectedPayment.amount?.toLocaleString()} ETB ·
                Student: {selectedPayment.student?.userId?.fullName}
              </p>
            )}
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">
              This action cannot be undone!
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() =>
                selectedPayment && handleDelete(selectedPayment._id)
              }
              className="btn-danger flex-1"
              disabled={processing}
            >
              {processing ? "Deleting..." : "Delete Payment"}
            </button>
            <button
              onClick={() => {
                setDeleteModal(false);
                setSelectedPayment(null);
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Add RefreshCw icon if not imported
const RefreshCw = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);
