import api from './api';

export const notificationService = {
  // Get list of user notifications
  getNotifications: async (limit = 30) => {
    const response = await api.get('/notifications', { params: { limit } });
    return response.data;
  },

  // Get quick count of unread notifications for badge
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  }
};
