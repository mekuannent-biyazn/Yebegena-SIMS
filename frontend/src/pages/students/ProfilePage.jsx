import { useState, useEffect, useRef } from "react";
import {
  User,
  Phone,
  BookOpen,
  Shield,
  Calendar,
  Camera,
  X,
  Save,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { studentService } from "../../services/studentService";
import { useAuthStore } from "../../store/authStore";
import { useI18nStore } from "../../store/i18nStore";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { RoleBadge } from "../../components/ui/Badge";
import { formatDate } from "../../utils/helpers";
import { ROLES } from "../../constants";
import Modal from "../../components/ui/Modal";

export default function ProfilePage() {
  const { t } = useI18nStore();
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pictureFile, setPictureFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPicture, setDeletingPicture] = useState(false);
  const fileInputRef = useRef(null);

  const isStudent =
    user?.role === ROLES.FRESH_STUDENT || user?.role === ROLES.ADVANCED_STUDENT;

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhoneNumber(user.phoneNumber || "");
      setPreviewUrl(user.picture || "");
    }
    loadProfile();
  }, [user]);

  async function loadProfile() {
    if (!isStudent) {
      setLoading(false);
      return;
    }

    try {
      const response = await studentService.getProfile();
      console.log("Full response:", response);

      // The response structure: { success: true, data: { ...studentData } }
      // BUT it seems the API might be returning user data instead of student data
      // Let's check both possibilities
      let studentData = response.data?.data || response.data;

      // If the data has 'userId' field, it's the student document
      // If it has 'role' field, it's the user document
      if (studentData.role) {
        // This is user data - we need to fetch student data separately
        console.warn(
          "Got user data instead of student data. Fetching student data...",
        );
        // Try to get student data through another endpoint or use the user data
        // For now, we'll use the user data but show a warning
        setProfile(studentData);
      } else {
        // This is student data
        setProfile(studentData);
      }

      console.log("Profile data:", studentData);
    } catch (error) {
      console.error("Load profile error:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  // ... (rest of the functions remain the same - handleFileChange, handleRemovePicture, validateForm, handleUpdateProfile, handleDeletePicture)

  // Helper function to get student data
  const getStudentData = () => {
    // If profile has 'userId', it's the student document
    if (profile?.userId) {
      return profile;
    }
    // If profile has 'role', it's the user document - we need to extract student info
    return null;
  };

  const studentData = getStudentData();

  if (loading) return <SkeletonCard />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="card">
        <div className="flex items-center gap-6">
          {/* Profile Picture */}
          <div className="relative group">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={user?.fullName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "";
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                {user?.fullName?.slice(0, 2)?.toUpperCase()}
              </div>
            )}

            {editing && (
              <div className="absolute -bottom-2 -right-2 flex gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-colors"
                  title="Change picture"
                  type="button"
                >
                  <Camera className="w-3 h-3" />
                </button>
                {user?.picture && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    title="Remove picture"
                    type="button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {user?.fullName}
              </h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  type="button"
                >
                  Edit Profile
                </button>
              )}
            </div>
            <p className="text-slate-500 flex items-center gap-1.5 mt-1">
              <Phone className="w-4 h-4" />
              {user?.phoneNumber}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <RoleBadge role={user?.role} />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="card">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`input ${errors.fullName ? "border-red-500" : ""}`}
                disabled={updating}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={`input ${errors.phoneNumber ? "border-red-500" : ""}`}
                disabled={updating}
                placeholder="09XXXXXXXX"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={updating}
              >
                {updating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFullName(user?.fullName || "");
                  setPhoneNumber(user?.phoneNumber || "");
                  setPreviewUrl(user?.picture || "");
                  setPictureFile(null);
                  setErrors({});
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="btn-secondary"
                disabled={updating}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Student-specific info */}
      {isStudent && profile && (
        <>
          <div className="card">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">
              Enrollment Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Registration Status - Check both profile and studentData */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Registration Status
                  </p>
                </div>
                <span
                  className={`inline-block text-sm font-semibold px-2.5 py-1 rounded-full ${
                    profile.registrationStatus === "APPROVED" ||
                    profile.registrationStatus === "APPROVED"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : profile.registrationStatus === "PENDING"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                  }`}
                >
                  {profile.registrationStatus || "N/A"}
                </span>
              </div>

              {/* Student Level */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Student Level
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {profile.studentStatus || "N/A"}
                </span>
              </div>

              {/* Assigned Class */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Assigned Class
                  </p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {profile.assignedClass?.className || "Not assigned yet"}
                  </span>
                  {profile.assignedClass?.classType && (
                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                      ({profile.assignedClass.classType})
                    </span>
                  )}
                </div>
              </div>

              {/* Enrolled On */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enrolled On
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {formatDate(profile.createdAt) || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Teacher Information */}
          {profile.assignedClass?.teacher && (
            <div className="card">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">
                Teacher Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Teacher Name
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {profile.assignedClass.teacher.userId?.fullName ||
                      "Not assigned"}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Teacher Phone
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {profile.assignedClass.teacher.userId?.phoneNumber || "N/A"}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Class Type
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {profile.assignedClass.classType || "N/A"}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Teacher Type
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {profile.assignedClass.teacher.teacherType || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Picture Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Remove Profile Picture"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              Are you sure you want to remove your profile picture?
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDeletePicture}
              className="btn-danger flex-1"
              disabled={deletingPicture}
            >
              {deletingPicture ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Removing...
                </span>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Remove Picture
                </>
              )}
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-secondary flex-1"
              disabled={deletingPicture}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
