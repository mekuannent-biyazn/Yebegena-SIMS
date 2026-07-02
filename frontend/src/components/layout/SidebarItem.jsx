import { NavLink } from "react-router-dom";

const SidebarItem = ({ title, icon: Icon, path }) => {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-blue-600 text-white"
            : "text-slate-300 hover:bg-slate-700 hover:text-white"
        }`
      }
    >
      <Icon size={20} />

      <span>{title}</span>
    </NavLink>
  );
};

export default SidebarItem;
