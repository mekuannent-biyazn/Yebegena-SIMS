const DashboardGrid = ({ children }) => {
  return (
    <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">{children}</div>
  );
};

export default DashboardGrid;
