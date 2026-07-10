import api from "../lib/axios";

export const settingsService = {
  getSettings: () => api.get("/setting"),
  updateSettings: (payload) => api.put("/setting", payload),

  get: () => api.get("/setting"),
  update: (payload) => api.put("/setting", payload),
};
