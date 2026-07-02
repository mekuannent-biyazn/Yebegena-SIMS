import { motion } from "framer-motion";

const ChartCard = ({ title, children }) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white rounded-2xl shadow-md p-6"
    >
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      {children}
    </motion.div>
  );
};

export default ChartCard;
