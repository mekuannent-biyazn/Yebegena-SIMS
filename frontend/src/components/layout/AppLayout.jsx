import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/students": "Students",
  "/students/pending": "Pending Approvals",
  "/teachers": "Teachers",
  "/classes": "Classes",
  "/schedules": "Schedules",
  "/schedule": "My Schedule",
  "/exams": "Exams",
  "/payments": "Payments",
  "/class-change": "Class Change Requests",
  "/promotions": "Student Promotions",
  "/kflats": "Kflats & Roles",
  "/notifications": "Notifications",
  "/settings": "System Settings",
  "/profile": "My Profile",
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (!desktop) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let title = "Yebegena SIMS";
  for (const [path, t] of Object.entries(pageTitles)) {
    if (pathname === path || pathname.startsWith(path + "/")) {
      title = t;
      break;
    }
  }

  // Sidebar width constants
  const SIDEBAR_EXPANDED = 260;
  const SIDEBAR_COLLAPSED = 72;
  const sidebarWidth = isDesktop
    ? isSidebarOpen
      ? SIDEBAR_EXPANDED
      : SIDEBAR_COLLAPSED
    : 0;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isDesktop={isDesktop}
      />

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          marginLeft: isDesktop ? `${sidebarWidth}px` : "0",
          width: isDesktop ? `calc(100% - ${sidebarWidth}px)` : "100%",
        }}
      >
        <Topbar
          title={title}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          isDesktop={isDesktop}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
