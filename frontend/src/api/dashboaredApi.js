import api from "./axios";

export const getAdminDashboard = async () => {
  const { data } = await api.get("/dashboard/admin");

  return data;
};
