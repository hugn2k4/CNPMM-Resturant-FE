import { createContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useGlobal } from "../hooks/useGlobal";
import socketService from "../services/socketService";
import notificationApi, { type Notification } from "../api/notificationApi";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { isLogin, accessToken } = useGlobal();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshNotifications = useCallback(async () => {
    if (!isLogin) return;

    try {
      setLoading(true);
      const response = await notificationApi.getNotifications({ page: 1, limit: 50 });
      if (response.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [isLogin]);

  const refreshUnreadCount = useCallback(async () => {
    if (!isLogin) return;

    try {
      const response = await notificationApi.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [isLogin]);

  // Kết nối socket khi đăng nhập
  useEffect(() => {
    if (isLogin && accessToken) {
      socketService.connect(accessToken);

      // Lắng nghe notification mới
      const handleNewNotification = (data: unknown) => {
        const notification = data as Notification;
        // Kiểm tra xem notification đã tồn tại chưa (tránh duplicate)
        setNotifications((prev) => {
          const exists = prev.some((n) => n._id === notification._id);
          if (exists) return prev;
          return [notification, ...prev];
        });
        setUnreadCount((prev) => prev + 1);
        // Refresh notifications để đảm bảo sync với server
        refreshNotifications();
      };

      socketService.on("notification", handleNewNotification);

      return () => {
        socketService.off("notification", handleNewNotification);
      };
    } else {
      socketService.disconnect();
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isLogin, accessToken, refreshNotifications]);

  // Load notifications khi đăng nhập
  useEffect(() => {
    if (isLogin) {
      refreshNotifications();
      refreshUnreadCount();
    }
  }, [isLogin, refreshNotifications, refreshUnreadCount]);

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => {
        const notification = prev.find((n) => n._id === id);
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        return prev.filter((n) => n._id !== id);
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Export context for useNotifications hook (moved to hooks/useNotifications.ts)
export { NotificationContext };
