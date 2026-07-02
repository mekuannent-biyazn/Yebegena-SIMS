import { adminMenu } from "../../data/sidebarMenus";
import SidebarItem from "./SidebarItem";

const Sidebar = () => {
  return (
    <aside
      className="
      w-72
      h-screen
      bg-slate-900
      text-white
      fixed
      left-0
      top-0
      flex
      flex-col
      "
    >
      <div className="h-20 flex items-center justify-center border-b border-slate-700">
        <h1 className="text-2xl font-bold text-blue-400">Yebegena SIMS</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {adminMenu.map((item) => (
          <SidebarItem key={item.path} {...item} />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
