import api from "../lib/axios";

export const kflatService = {
  getAll: () => api.get("/kflats"),
  getById: (id) => api.get(`/kflats/${id}`),
  create: (payload) => api.post("/kflats", payload),
  update: (id, payload) => api.put(`/kflats/${id}`, payload),
  delete: (id) => api.delete(`/kflats/${id}`),
};

export const kflatRoleService = {
  getAll: () => api.get("/kflat-roles"),
  getById: (id) => api.get(`/kflat-roles/${id}`),
  create: (payload) => api.post("/kflat-roles", payload),
  update: (id, payload) => api.put(`/kflat-roles/${id}`, payload),
  delete: (id) => api.delete(`/kflat-roles/${id}`),
};
