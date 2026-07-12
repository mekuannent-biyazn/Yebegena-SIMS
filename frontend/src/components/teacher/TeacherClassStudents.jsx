import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Users,
  ArrowLeft,
  Search,
  Mail,
  Phone,
  ChevronRight,
  UserCheck,
  UserX,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { useTeacher } from "../../hooks/useTeacher";
import { SkeletonCard } from "../ui/Skeleton";
import EmptyState from "../ui/EmptyState";
import { Badge } from "../ui/Badge";

const TeacherClassStudents = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { classDetails, loading, getClassDetails } = useTeacher();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (classId) {
      getClassDetails(classId);
    }
  }, [classId, getClassDetails]);

  const classData = classDetails?.class;
  const students = classDetails?.students || [];
  const studentCount = classDetails?.studentCount || 0;
  const totalCapacity = classDetails?.totalCapacity || 0;
  const availableSlots = classDetails?.availableSlots || 0;

  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();
    const fullName = student.userId?.fullName?.toLowerCase() || "";
    const phoneNumber = student.userId?.phoneNumber || "";
    const email = student.userId?.email?.toLowerCase() || "";

    return (
      fullName.includes(search) ||
      phoneNumber.includes(search) ||
      email.includes(search)
    );
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonCard />
      </div>
    );
  }

  if (!classData) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Class Not Found"
        description="The class you're looking for doesn't exist or you don't have access to it."
        action={
          <button
            onClick={() => navigate("/teacher/classes")}
            className="btn-primary"
          >
            Back to Classes
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/teacher/classes")}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {classData.className}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {classData.classType} Class • {studentCount} students enrolled
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              classData.isActive
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {classData.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total Students
              </p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {studentCount}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Capacity
              </p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {totalCapacity}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <UserX className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Available Slots
              </p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {availableSlots}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Class Type
              </p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {classData.classType}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Students List */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">
            Students
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Students Found"
            description={
              searchTerm
                ? `No students match "${searchTerm}"`
                : "No students are enrolled in this class yet."
            }
            size="sm"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                    Contact
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                    Kflat
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredStudents.map((student) => (
                  <tr
                    key={student._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xs overflow-hidden flex-shrink-0">
                          {student.userId?.profilePicture ? (
                            <img
                              src={student.userId.profilePicture}
                              alt={student.userId.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            student.userId?.fullName
                              ?.slice(0, 2)
                              .toUpperCase() || "ST"
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">
                            {student.userId?.fullName || "Unknown"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {student.studentStatus || "Student"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="space-y-1">
                        {student.userId?.email && (
                          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{student.userId.email}</span>
                          </div>
                        )}
                        {student.userId?.phoneNumber && (
                          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{student.userId.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <div className="space-y-0.5">
                        {student.kflat?.name && (
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {student.kflat.name}
                          </p>
                        )}
                        {student.kflatRole?.name && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {student.kflatRole.name}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <Badge
                        status={student.registrationStatus}
                        label={student.registrationStatus}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/teacher/students/${student._id}`}
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherClassStudents;
