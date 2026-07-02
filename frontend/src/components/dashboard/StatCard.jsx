import { motion } from "framer-motion";

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => {
  return (
    <motion.div
      whileHover={{
        scale: 1.03,
        y: -5,
      }}
      className="bg-white rounded-2xl shadow-md p-6"
    >
      <div className="flex justify-between">
        <div>
          <p className="text-gray-500">{title}</p>

          <h2 className="text-4xl font-bold mt-2">{value}</h2>

          <p className="text-gray-400 mt-2">{subtitle}</p>
        </div>

        <div
          className={`${color}
          h-14
          w-14
          rounded-xl
          flex
          items-center
          justify-center
          text-white`}
        >
          <Icon size={28} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
