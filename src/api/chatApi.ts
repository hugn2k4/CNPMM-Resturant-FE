import axiosClient from "../utils/axiosClient";

const chatApi = {
  // Lấy lịch sử chat
  getChatHistory: async (limit = 50, skip = 0) => {
    const response = await axiosClient.get("/chat/history", {
      params: { limit, skip },
    });
    return response.data;
  },

  // Gửi tin nhắn qua API (backup cho WebSocket)
  sendMessage: async (message: string) => {
    const response = await axiosClient.post("/chat/send", { message });
    return response.data;
  },

  // Đánh dấu tin nhắn đã đọc
  markAsRead: async (messageIds: string[]) => {
    const response = await axiosClient.post("/chat/mark-read", { messageIds });
    return response.data;
  },

  // Lấy số lượng tin nhắn chưa đọc
  getUnreadCount: async () => {
    const response = await axiosClient.get("/chat/unread-count");
    return response.data;
  },

  // Admin: Lấy danh sách tất cả các cuộc hội thoại
  getAdminConversations: async (limit = 20, skip = 0) => {
    const response = await axiosClient.get("/chat/admin/conversations", {
      params: { limit, skip },
    });
    return response.data;
  },

  // Admin: Lấy lịch sử chat của một user cụ thể
  getAdminUserChatHistory: async (userId: string, limit = 50, skip = 0) => {
    const response = await axiosClient.get(`/chat/admin/conversation/${userId}`, {
      params: { limit, skip },
    });
    return response.data;
  },
};

export default chatApi;
