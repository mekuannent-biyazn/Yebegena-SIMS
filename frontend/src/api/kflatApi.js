import api from "./axios";

export const getKflats = async () => {
  const response = await api.get("/kflats");
  return response.data;
};

export const getKflatRoles = async () => {
  const response = await api.get("/kflat-roles");
  return response.data;
};
