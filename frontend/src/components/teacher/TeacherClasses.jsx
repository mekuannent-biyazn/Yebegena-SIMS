import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  Calendar,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { useTeacher } from "../../hooks/useTeacher";
import { SkeletonCard } from "../ui/Skeleton";
import EmptyState from "../ui/EmptyState";

const TeacherClasses = () => {
  const { classes, loading, getMyClasses } = useTeacher();

  useEffect(() => {
    getMyClasses();
  }, [getMyClasses]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No Classes Assigned"
        description="You haven't been assigned to any classes yet. Contact your administrator."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            My Classes
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {classes.length} class{classes.length > 1 ? "es" : ""} assigned
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <Link
            key={classItem._id}
            to={`/teacher/classes/${classItem._id}/students`}
            className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                <GraduationCap className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <span
                className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                  classItem.classType === "FRESH"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                }`}
              >
                {classItem.classType}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
              {classItem.className}
            </h3>

            <div className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span>
                  {classItem.currentStudents || 0} / {classItem.maxStudents}{" "}
                  students
                </span>
              </div>

              {classItem.teacher?.userId && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>Teacher: {classItem.teacher.userId.fullName}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  Created: {new Date(classItem.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${classItem.isActive ? "bg-emerald-500" : "bg-red-500"}`}
                ></div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {classItem.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TeacherClasses;
