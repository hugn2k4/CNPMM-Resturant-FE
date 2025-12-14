import axiosClient from "../utils/axiosClient";

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  emailSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
}

const notificationApi = {
  getNotifications: async (params?: { page?: number; limit?: number; isRead?: boolean }) => {
    const response = await axiosClient.get<NotificationResponse>("/notifications", { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axiosClient.get<{ success: boolean; data: { count: number } }>(
      "/notifications/unread-count"
    );
    return response.data;
  },

  markAsRead: async (notificationId: string) => {
    const response = await axiosClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axiosClient.put("/notifications/read-all");
    return response.data;
  },

  deleteNotification: async (notificationId: string) => {
    const response = await axiosClient.delete(`/notifications/${notificationId}`);
    return response.data;
  },
};

export default notificationApi;
