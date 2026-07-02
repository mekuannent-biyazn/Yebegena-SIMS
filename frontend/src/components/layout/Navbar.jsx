import { FaBars, FaBell, FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  return (
    <header
      className="
      h-20
      bg-white
      shadow-sm
      flex
      items-center
      justify-between
      px-8
      "
    >
      <div className="flex items-center gap-4">
        <FaBars size={22} className="cursor-pointer" />

        <h2 className="text-xl font-semibold">Dashboard</h2>
      </div>

      <div className="flex items-center gap-6">
        <FaBell className="cursor-pointer" size={20} />

        <button
          className="
          bg-gray-100
          rounded-full
          p-2
          "
        >
          <FaUserCircle size={28} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
