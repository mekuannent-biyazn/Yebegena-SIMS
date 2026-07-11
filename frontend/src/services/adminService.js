import api from "../lib/axios";

export const adminService = {
  getProfile: () => api.get("/profile"),
  updateProfile: (formData) =>
    api.put("/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  deleteProfilePicture: () => api.delete("/profile/picture"),
};
