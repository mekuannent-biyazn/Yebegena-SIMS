import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaMoneyBillWave,
  FaExchangeAlt,
} from "react-icons/fa";

import DashboardLayout from "../../components/layout/DashboardLayout";

import DashboardHeader from "../../components/dashboard/DashboaredHeader";

import DashboardGrid from "../../components/dashboard/DashboaredHeader";

import StatCard from "../../components/dashboard/StatCard";

import RegistrationChart from "../../components/dashboard/RegistrationChart";

import PaymentChart from "../../components/dashboard/PaymentChart";

import RecentActivity from "../../components/dashboard/RecentActivity";

import NotificationPanel from "../../components/dashboard/NotificationPanel";

import QuickActions from "../../components/dashboard/QuickActions";

import useDashboard from "../../hooks/useDashboared";

const Dashboard = () => {
  const { dashboard, loading, error } = useDashboard();

  if (loading) return <p>Loading...</p>;

  if (error) return <p>{error}</p>;

  const { statistics, charts, recentActivities, notifications } = dashboard;

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Welcome Admin 👋"
        description="Monitor your student information system."
      />

      <DashboardGrid>
        <StatCard
          title="Students"
          value={statistics.totalStudents}
          subtitle="Registered"
          icon={FaUserGraduate}
          color="bg-blue-600"
        />

        <StatCard
          title="Teachers"
          value={statistics.totalTeachers}
          subtitle="Active"
          icon={FaChalkboardTeacher}
          color="bg-green-600"
        />

        <StatCard
          title="Pending Payments"
          value={statistics.pendingPayments}
          subtitle="Waiting Approval"
          icon={FaMoneyBillWave}
          color="bg-yellow-500"
        />

        <StatCard
          title="Class Changes"
          value={statistics.classChanges}
          subtitle="Pending"
          icon={FaExchangeAlt}
          color="bg-red-500"
        />
      </DashboardGrid>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <RegistrationChart registrations={charts.monthlyRegistrations} />

        <PaymentChart payments={charts.paymentOverview} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <RecentActivity activities={recentActivities} />

        <NotificationPanel notifications={notifications} />

        <QuickActions />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
