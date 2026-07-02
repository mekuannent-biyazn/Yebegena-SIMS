import { useEffect, useState } from "react";

import { getAdminDashboard } from "../api/dashboaredApi";

const useDashboard = () => {
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const response = await getAdminDashboard();

      setDashboard(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return {
    dashboard,
    loading,
    error,
    reload: loadDashboard,
  };
};

export default useDashboard;
