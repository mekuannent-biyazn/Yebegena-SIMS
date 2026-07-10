import { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Image,
  X,
  Eye,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import { paymentService } from "../../services/paymentService";
import { useI18nStore } from "../../store/i18nStore";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { Badge } from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate } from "../../utils/helpers";

export default function MyPaymentsPage() {
  const { t } = useI18nStore();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [viewPayment, setViewPayment] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await paymentService.getMyPayments();
      setPayments(data.data || []);
    } catch (error) {
      console.error("Load payments error:", error);
      toast.error(error.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Reset errors
    setUploadError("");

    // Check file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      toast.error("File size must be less than 5MB");
      e.target.value = "";
      return;
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadError("Only JPEG, PNG, WEBP, and GIF images are allowed");
      toast.error("Only JPEG, PNG, WEBP, and GIF images are allowed");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
    setFilePreview(URL.createObjectURL(selectedFile));
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    setUploadError("");
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  async function handleUpload(e) {
    e.preventDefault();

    // Validate file
    if (!file) {
      toast.error("Please select a receipt file");
      return;
    }

    // Double check file size before upload
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      console.log("Uploading file:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      const response = await paymentService.upload(formData);

      console.log("Upload response:", response.data);

      toast.success("Payment receipt uploaded successfully!");

      // Reset form
      setFile(null);
      setFilePreview(null);
      if (fileRef.current) {
        fileRef.current.value = "";
      }

      // Reload payments
      await load();
    } catch (err) {
      console.error("Upload error:", err);
      console.error("Error response:", err.response);

      // Handle specific error messages
      let errorMessage = "Failed to upload payment";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setUploadError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  }

  const hasPending = payments.some((p) => p.paymentStatus === "PENDING");

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
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
            {t("myPaymentsPage") || "My Payments"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {payments.length} payment records
          </p>
        </div>
        {payments.length > 0 && (
          <button
            onClick={load}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            disabled={loading}
          >
            Refresh
          </button>
        )}
      </div>

      {/* Upload Form - Only show if no pending payment */}
      {!hasPending ? (
        <div className="card">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
            {t("uploadReceipt") || "Upload Payment Receipt"}
          </h3>

          <form onSubmit={handleUpload} className="space-y-3">
            <div>
              <label className="label">
                {t("receiptImage") || "Receipt Image"}
              </label>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  uploadError
                    ? "border-red-400 bg-red-50 dark:bg-red-900/10"
                    : "border-slate-200 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-400"
                }`}
                onClick={() => fileRef.current?.click()}
              >
                {filePreview ? (
                  <div className="relative">
                    <img
                      src={filePreview}
                      alt="Receipt preview"
                      className="max-h-48 mx-auto rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-300 dark:text-slate-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Click to select receipt image
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      JPG, PNG, WEBP, GIF up to 5MB
                    </p>
                  </>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </div>

              {/* File Info */}
              {file && !filePreview && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl mt-2">
                  <Image className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span className="text-sm text-slate-700 dark:text-slate-200 flex-1 truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Error Message */}
              {uploadError && (
                <p className="text-red-500 text-sm mt-2">{uploadError}</p>
              )}
            </div>

            {/* Upload Button */}
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={uploading || !file}
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {t("uploadReceipt") || "Upload Payment Receipt"}
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        // Pending Payment Alert
        <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                Payment Under Review
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Your receipt is pending admin approval. You cannot upload
                another payment until this is reviewed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment List */}
      {payments.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={CreditCard}
            title={t("noPayments") || "No payments found"}
            description={t("emptyPayments") || "No payments available"}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Status Icon */}
                  <div
                    className={`p-2.5 rounded-xl ${
                      p.paymentStatus === "APPROVED"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                        : p.paymentStatus === "REJECTED"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                    }`}
                  >
                    {p.paymentStatus === "APPROVED" ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : p.paymentStatus === "REJECTED" ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>

                  {/* Payment Info */}
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {p.amount?.toLocaleString()} ETB
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {p.paymentMonth}/{p.paymentYear} •{" "}
                      {formatDate(p.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge status={p.paymentStatus} />
                  <button
                    onClick={() => setViewPayment(p)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Rejection Reason */}
              {p.paymentStatus === "REJECTED" && p.rejectionReason && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {t("rejectionReason") || "Rejection Reason"}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">
                    {p.rejectionReason}
                  </p>
                </div>
              )}

              {/* Receipt Link */}
              {p.receiptUrl && (
                <div className="mt-3">
                  <a
                    href={p.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    <Download className="w-3 h-3" />
                    View receipt →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* View Payment Modal */}
      {viewPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 z-10 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Payment Details
              </h3>
              <button
                onClick={() => setViewPayment(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Payment Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Amount
                  </p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {viewPayment.amount?.toLocaleString()} ETB
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Month/Year
                  </p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {viewPayment.paymentMonth}/{viewPayment.paymentYear}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Status
                  </p>
                  <Badge status={viewPayment.paymentStatus} />
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Submitted
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    {formatDate(viewPayment.createdAt)}
                  </p>
                </div>
              </div>

              {/* Rejection Reason */}
              {viewPayment.paymentStatus === "REJECTED" &&
                viewPayment.rejectionReason && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                    <p className="text-xs text-red-600 dark:text-red-400 font-semibold mb-1">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {viewPayment.rejectionReason}
                    </p>
                  </div>
                )}

              {/* Receipt Image */}
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
          </div>
        </div>
      )}
    </div>
  );
}
