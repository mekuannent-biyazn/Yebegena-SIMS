import { Link } from "react-router-dom";

const QuickActions = () => {
  const actions = [
    {
      title: "Add Teacher",
      link: "/admin/teachers",
    },
    {
      title: "Approve Payments",
      link: "/admin/payments",
    },
    {
      title: "Create Schedule",
      link: "/admin/schedules",
    },
    {
      title: "View Reports",
      link: "/admin/reports",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            to={action.link}
            className="block rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white transition hover:bg-blue-700"
          >
            {action.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
