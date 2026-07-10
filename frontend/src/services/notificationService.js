import api from "../lib/axios";

export const notificationService = {
  getMyNotifications: () => api.get("/notifications"),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  getAllNotifications: () => api.get("/notifications/admin/all"),
};

export default notificationService;
