const DashboardHeader = ({ title, description }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">{title}</h1>

      <p className="text-gray-500 mt-2">{description}</p>
    </div>
  );
};

export default DashboardHeader;
