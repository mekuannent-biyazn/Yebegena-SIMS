import { useState, useEffect } from "react";
import {
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  UserCheck,
  Users,
  Edit,
  Trash2,
  ArrowRight,
  Swap,
} from "lucide-react";
import toast from "react-hot-toast";
import { classChangeService } from "../../services/classChangeService";
import { classService } from "../../services/classService";
import { useAuthStore } from "../../store/authStore";
import { useI18nStore } from "../../store/i18nStore";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { Badge } from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate } from "../../utils/helpers";
import { ROLES } from "../../constants";

export default function ClassChangePage() {
  const { t } = useI18nStore();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === ROLES.ADMIN;
  const isStudent =
    user?.role === ROLES.FRESH_STUDENT || user?.role === ROLES.ADVANCED_STUDENT;

  const [myRequest, setMyRequest] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [currentClass, setCurrentClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState({ desiredClass: "", reason: "" });
  const [editForm, setEditForm] = useState({
    id: "",
    desiredClass: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const promises = [
        classChangeService.getVolunteers(),
        classService.getAll(),
      ];
      if (isStudent) promises.push(classChangeService.getMyRequest());

      const results = await Promise.allSettled(promises);

      // Handle volunteers
      if (results[0].status === "fulfilled") {
        const data = results[0].value?.data?.data || [];
        setVolunteers(data);
        if (results[0].value?.data?.currentClass) {
          setCurrentClass(results[0].value.data.currentClass);
        }
      }

      // Handle classes
      if (results[1].status === "fulfilled") {
        setClasses(results[1].value?.data?.data || []);
      }

      // Handle my request
      if (isStudent && results[2]?.status === "fulfilled") {
        const requestData = results[2].value?.data?.data || null;
        setMyRequest(requestData);
        if (results[2].value?.data?.currentClass) {
          setCurrentClass(results[2].value.data.currentClass);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error(t("loadingFailed") || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  // Check if student can create a new request
  const canCreateRequest = () => {
    if (!isStudent) return false;
    if (!myRequest) return true;
    // Allow creating new request if cancelled, rejected, or approved
    return ["CANCELLED", "REJECTED", "APPROVED"].includes(myRequest.status);
  };

  // Check if student can edit their request
  const canEditRequest = () => {
    if (!myRequest) return false;
    return myRequest.status === "OPEN";
  };

  // Check if student has a matched request waiting for swap
  const hasMatchedRequest = () => {
    if (!myRequest) return false;
    return myRequest.status === "MATCHED" && myRequest.matchedStudent;
  };

  async function handleCreateRequest(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {};
      if (form.desiredClass) payload.desiredClass = form.desiredClass;
      if (form.reason) payload.reason = form.reason;
      await classChangeService.createRequest(payload);
      toast.success("Class change request submitted!");
      setCreateModal(false);
      setForm({ desiredClass: "", reason: "" });
      await loadAll();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        t("operationFailed") ||
        "Failed to create request";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateRequest(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {};
      if (editForm.desiredClass) payload.desiredClass = editForm.desiredClass;
      if (editForm.reason) payload.reason = editForm.reason;

      await classChangeService.updateRequest(editForm.id, payload);
      toast.success("Request updated successfully!");
      setEditModal(false);
      setEditForm({ id: "", desiredClass: "", reason: "" });
      await loadAll();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to update request";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  // Handle accepting a volunteer match - IMMEDIATE SWAP
  async function handleAcceptMatch(volunteerId) {
    if (
      !confirm(
        "Do you want to accept this volunteer match? This will automatically swap your classes.",
      )
    )
      return;

    setAccepting(volunteerId);
    try {
      const response = await classChangeService.acceptMatch(volunteerId);

      // Update the current class immediately from the response
      if (response.data?.data?.currentStudent?.newClass) {
        setCurrentClass(response.data.data.currentStudent.newClass);
        toast.success(
          `✅ Class swapped! You are now in: ${response.data.data.currentStudent.newClass.className}`,
        );
      } else {
        toast.success(
          response.data?.message || "Class swap completed successfully!",
        );
      }

      // Refresh all data to show updated state
      await loadAll();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to accept match";
      toast.error(errorMsg);
    } finally {
      setAccepting(null);
    }
  }

  // Handle completing the swap for matched requests
  async function handleCompleteSwap() {
    if (!myRequest?.matchedStudent) {
      toast.error("No match found to swap with");
      return;
    }

    // Find the volunteer request that matches with the current student
    const matchedVolunteer = volunteers.find(
      (v) =>
        v.status === "OPEN" &&
        v.requesterStudent?._id === myRequest?.matchedStudent?._id &&
        v.desiredClass?._id === currentClass?._id,
    );

    if (!matchedVolunteer) {
      toast.error("No matching volunteer found to swap with");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to swap classes with ${myRequest.matchedStudent?.userId?.fullName || "your match"}? This action cannot be undone.`,
      )
    )
      return;

    setProcessing(myRequest._id);
    try {
      const response = await classChangeService.acceptMatch(
        matchedVolunteer._id,
      );

      if (response.data?.data?.currentStudent?.newClass) {
        setCurrentClass(response.data.data.currentStudent.newClass);
        toast.success(
          `✅ Class swapped! You are now in: ${response.data.data.currentStudent.newClass.className}`,
        );
      }

      toast.success("🎉 Classes swapped successfully!");
      await loadAll();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to swap classes";
      toast.error(errorMsg);
    } finally {
      setProcessing(null);
    }
  }

  async function handleCancelRequest() {
    if (!confirm("Cancel your class change request?")) return;
    try {
      await classChangeService.cancel();
      toast.success("Request cancelled");
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel");
    }
  }

  // Helper function to check if a volunteer matches the current student
  const isVolunteerMatch = (volunteer) => {
    if (!currentClass || !volunteer.desiredClass) return false;
    return (
      volunteer.desiredClass._id === currentClass._id ||
      volunteer.desiredClass._id.toString() === currentClass._id.toString()
    );
  };

  // Open edit modal with current request data
  const openEditModal = () => {
    if (myRequest) {
      setEditForm({
        id: myRequest._id,
        desiredClass: myRequest.desiredClass?._id || "",
        reason: myRequest.reason || "",
      });
      setEditModal(true);
    }
  };

  // Check if the volunteer request should be hidden
  const shouldHideVolunteer = (volunteer) => {
    // Hide if the request is APPROVED (class already swapped)
    if (volunteer.status === "APPROVED") return true;
    // Hide if the request is from the current user
    if (volunteer.requesterStudent?._id === myRequest?.requesterStudent?._id)
      return true;
    // Hide if the request is from the matched student (they already have a match)
    if (
      volunteer.requesterStudent?._id === myRequest?.matchedStudent?._id &&
      myRequest?.status === "MATCHED"
    )
      return true;
    return false;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Show message for admin
  if (isAdmin) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            Admin Class Change Management
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Please use the "Class Change Approvals" page to manage all requests.
          </p>
          <button
            onClick={() =>
              (window.location.href = "/admin/class-change-approvals")
            }
            className="btn-primary mt-4"
          >
            Go to Approvals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Class Change Requests
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {volunteers.filter((v) => v.status === "OPEN").length} open requests
          </p>
        </div>
        {isStudent && canCreateRequest() && (
          <button onClick={() => setCreateModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Create Request
          </button>
        )}
      </div>

      {/* Current Class Info */}
      {currentClass && (
        <div
          className={`card ${
            myRequest?.status === "APPROVED"
              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
              : myRequest?.status === "MATCHED"
                ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Your Current Class:{" "}
              <span className="font-bold">
                {currentClass.className || "N/A"}
              </span>
              {myRequest?.status === "APPROVED" && (
                <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  ✅ Updated
                </span>
              )}
              {myRequest?.status === "MATCHED" && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                  🔄 Match Pending
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* My Request (Student) */}
      {isStudent && myRequest && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> My Request
            </h3>
            <div className="flex items-center gap-2">
              {canEditRequest() && (
                <button
                  onClick={openEditModal}
                  className="btn-outline text-xs px-3 py-1 flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" /> Edit
                </button>
              )}
              {(myRequest.status === "OPEN" ||
                myRequest.status === "MATCHED") && (
                <button
                  onClick={handleCancelRequest}
                  className="btn-danger text-xs px-3 py-1 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Cancel
                </button>
              )}
              {["CANCELLED", "REJECTED", "APPROVED"].includes(
                myRequest.status,
              ) && (
                <button
                  onClick={() => setCreateModal(true)}
                  className="btn-primary text-xs px-3 py-1 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New Request
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Status
              </p>
              <Badge status={myRequest.status} />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Current Class
              </p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {myRequest.currentClass?.className ||
                  currentClass?.className ||
                  "N/A"}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Desired Class
              </p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {myRequest.desiredClass?.className || "Any"}
              </p>
            </div>
            {myRequest.reason && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 col-span-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Reason
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  {myRequest.reason}
                </p>
              </div>
            )}

            {/* Matched Status with Swap Button - THIS IS THE KEY SECTION */}
            {myRequest.status === "MATCHED" && myRequest.matchedStudent && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 col-span-2 border-2 border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">
                      Matched With
                    </p>
                    <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                      {myRequest.matchedStudent?.userId?.fullName ||
                        "Unknown Student"}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      Status: <Badge status="MATCHED" />
                    </p>
                  </div>
                  <button
                    onClick={handleCompleteSwap}
                    disabled={processing === myRequest._id}
                    className="btn-success text-sm px-6 py-2.5 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Swap
                      className={`w-4 h-4 ${
                        processing === myRequest._id ? "animate-spin" : ""
                      }`}
                    />
                    {processing === myRequest._id ? "Swapping..." : "Swap Now"}
                  </button>
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                  ⚡ Click "Swap Now" to instantly exchange classes with your
                  match.
                </p>
              </div>
            )}

            {/* Approved Status - Class Already Swapped */}
            {myRequest.status === "APPROVED" && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 col-span-2 border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  ✅ Class swap completed! You are now in:{" "}
                  <span className="font-bold">
                    {currentClass?.className || "new class"}
                  </span>
                </p>
                {myRequest.matchedStudent && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Swapped with: {myRequest.matchedStudent?.userId?.fullName}
                  </p>
                )}
              </div>
            )}

            {myRequest.status === "REJECTED" && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 col-span-2">
                <p className="text-xs text-red-600 dark:text-red-400">
                  Your request was rejected. You can create a new request.
                </p>
              </div>
            )}

            {myRequest.status === "CANCELLED" && (
              <div className="bg-gray-50 dark:bg-gray-900/20 rounded-xl p-3 col-span-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Your request was cancelled. You can create a new request.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Volunteers / Available Requests */}
      <div>
        <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Available Volunteers
        </h3>

        {volunteers.filter((v) => !shouldHideVolunteer(v)).length === 0 ? (
          <div className="card">
            <EmptyState
              icon={RefreshCw}
              title="No Available Volunteers"
              description="There are no volunteer requests available at the moment."
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
                    <th className="table-th text-left">Status</th>
                    <th className="table-th text-left">Date</th>
                    <th className="table-th text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers
                    .filter((v) => !shouldHideVolunteer(v))
                    .map((req) => {
                      const isMatch = isVolunteerMatch(req);
                      const canAccept =
                        isStudent &&
                        canCreateRequest() &&
                        req.status === "OPEN" &&
                        isMatch;

                      return (
                        <tr
                          key={req._id}
                          className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 last:border-0"
                        >
                          <td className="table-td">
                            <div>
                              <p className="font-medium text-slate-800 dark:text-slate-100">
                                {req.requesterStudent?.userId?.fullName ||
                                  "Unknown"}
                              </p>
                              <p className="text-xs text-slate-400 dark:text-slate-500">
                                {req.requesterStudent?.userId?.phoneNumber ||
                                  ""}
                              </p>
                            </div>
                          </td>
                          <td className="table-td text-slate-600 dark:text-slate-300">
                            {req.currentClass?.className || "N/A"}
                          </td>
                          <td className="table-td">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-600 dark:text-slate-300">
                                {req.desiredClass?.className || "Any"}
                              </span>
                              {isMatch && req.status === "OPEN" && (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                  Perfect Match! 🎯
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="table-td">
                            <Badge status={req.status} />
                          </td>
                          <td className="table-td text-slate-500 dark:text-slate-400">
                            {formatDate(req.createdAt)}
                          </td>
                          <td className="table-td">
                            {canAccept ? (
                              <button
                                onClick={() => handleAcceptMatch(req._id)}
                                disabled={accepting === req._id}
                                className="btn-success text-xs px-4 py-1.5 flex items-center gap-1 font-medium"
                              >
                                <UserCheck className="w-3 h-3" />
                                {accepting === req._id
                                  ? "Swapping..."
                                  : "Accept & Swap"}
                              </button>
                            ) : isMatch &&
                              req.status === "OPEN" &&
                              myRequest &&
                              !["CANCELLED", "REJECTED", "APPROVED"].includes(
                                myRequest.status,
                              ) ? (
                              <span className="text-xs text-yellow-600">
                                You have a pending request
                              </span>
                            ) : isMatch && req.status !== "OPEN" ? (
                              <span className="text-xs text-slate-400">
                                Not Available
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">
                                No match
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* How it Works Info Card */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              ⚡ Instant Class Swapping
            </p>
            <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 list-disc list-inside space-y-1">
              <li>Create a request for the class you want</li>
              <li>Find a volunteer who wants your class (Perfect Match 🎯)</li>
              <li>Click "Accept & Swap" to instantly exchange classes</li>
              <li>Both students are immediately moved to their new classes</li>
              <li>No admin approval needed - instant class change!</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create Request Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Create Class Change Request"
        size="sm"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="label">Desired Class</label>
            <select
              className="input"
              value={form.desiredClass}
              onChange={(e) =>
                setForm({ ...form, desiredClass: e.target.value })
              }
            >
              <option value="">Any available class</option>
              {classes
                .filter((c) => currentClass && c._id !== currentClass._id)
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.className}
                  </option>
                ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Select a specific class or leave empty for any class
            </p>
          </div>
          <div>
            <label className="label">Reason</label>
            <textarea
              className="input h-24 resize-none"
              placeholder="Reason for class change..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
            <button
              type="button"
              onClick={() => setCreateModal(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Request Modal */}
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Class Change Request"
        size="sm"
      >
        <form onSubmit={handleUpdateRequest} className="space-y-4">
          <div>
            <label className="label">Desired Class</label>
            <select
              className="input"
              value={editForm.desiredClass}
              onChange={(e) =>
                setEditForm({ ...editForm, desiredClass: e.target.value })
              }
            >
              <option value="">Any available class</option>
              {classes
                .filter((c) => currentClass && c._id !== currentClass._id)
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.className}
                  </option>
                ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Select a specific class or leave empty for any class
            </p>
          </div>
          <div>
            <label className="label">Reason</label>
            <textarea
              className="input h-24 resize-none"
              placeholder="Reason for class change..."
              value={editForm.reason}
              onChange={(e) =>
                setEditForm({ ...editForm, reason: e.target.value })
              }
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={submitting}
            >
              {submitting ? "Updating..." : "Update Request"}
            </button>
            <button
              type="button"
              onClick={() => setEditModal(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
