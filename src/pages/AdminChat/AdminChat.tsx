import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import chatApi from "../../api/chatApi";
import socketService from "../../services/socketService";
import type { ChatMessage } from "../../types/chat";

interface Conversation {
  userId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  user: {
    _id: string;
    fullname: string;
    email: string;
    avatar?: string;
  };
}

interface TempChatMessage extends ChatMessage {
  tempId?: string;
}

const AdminChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    if (!socketService.isConnected()) {
      socketService.connect(token);
    }

    // Listen for new messages from users
    const handleNewUserMessage = (data: unknown) => {
      const msgData = data as { message: ChatMessage; userId: string };
      console.log("[AdminChat] New user message received:", msgData);

      // Update conversation list
      void loadConversations();

      // If this is the selected user, add to messages
      if (msgData.userId === selectedUserId) {
        setMessages((prev) => [...prev, msgData.message]);
      }
    };

    // Listen for admin message sent confirmation
    const handleMessageSent = (data: unknown) => {
      const msgData = data as { message: ChatMessage; tempId?: string };
      setMessages((prev) => {
        // Replace temporary message or add new
        if (msgData.tempId) {
          return prev.map((msg) =>
            "tempId" in msg && (msg as TempChatMessage).tempId === msgData.tempId ? msgData.message : msg
          );
        }
        return [...prev, msgData.message];
      });
    };

    socketService.on("chat:new_user_message", handleNewUserMessage);
    socketService.on("chat:message_sent", handleMessageSent);

    return () => {
      socketService.off("chat:new_user_message", handleNewUserMessage);
      socketService.off("chat:message_sent", handleMessageSent);
    };
  }, [selectedUserId]);

  useEffect(() => {
    void loadConversations();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      void loadUserMessages(selectedUserId);
    }
  }, [selectedUserId]);

  const loadConversations = async () => {
    try {
      const response = await chatApi.getAdminConversations();
      // Sort by unread count first, then by time
      const sorted = (response.data || []).sort((a: Conversation, b: Conversation) => {
        if (b.unreadCount !== a.unreadCount) {
          return b.unreadCount - a.unreadCount;
        }
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });
      setConversations(sorted);

      // Calculate total unread
      const total = sorted.reduce((sum: number, conv: Conversation) => sum + conv.unreadCount, 0);
      setTotalUnread(total);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const loadUserMessages = async (targetUserId: string) => {
    try {
      setIsLoading(true);
      const response = await chatApi.getAdminUserChatHistory(targetUserId);
      setMessages(response.data || []);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUserId || !socketService.isConnected()) return;

    const tempId = `temp_${Date.now()}`;

    // Optimistically add message
    const tempMessage: TempChatMessage = {
      _id: tempId,
      tempId,
      userId: selectedUserId,
      message: newMessage.trim(),
      senderType: "admin",
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    socketService.emit("chat:admin_send_message", {
      message: newMessage.trim(),
      targetUserId: selectedUserId,
      tempId,
    });

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 180px)", gap: 2 }}>
      {/* Conversations List */}
      <Paper sx={{ width: 320, overflow: "auto", display: "flex", flexDirection: "column" }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", bgcolor: "primary.main", color: "white" }}>
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "space-between" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MessageCircle size={24} />
              Cuộc hội thoại
            </Box>
            {totalUnread > 0 && (
              <Chip label={totalUnread} color="error" size="small" sx={{ color: "white", fontWeight: "bold" }} />
            )}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <Alert severity="info" sx={{ m: 2 }}>
            Các cuộc hội thoại sẽ hiển thị ở đây khi có khách hàng nhắn tin
          </Alert>
          <List>
            {conversations.length === 0 ? (
              <ListItem>
                <ListItemText primary="Chưa có cuộc hội thoại" secondary="Đợi khách hàng gửi tin nhắn" />
              </ListItem>
            ) : (
              conversations.map((conv) => (
                <ListItem
                  key={conv.userId}
                  sx={{
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                    bgcolor: selectedUserId === conv.userId ? "action.selected" : "transparent",
                  }}
                  onClick={() => setSelectedUserId(conv.userId)}
                >
                  <Avatar sx={{ mr: 2 }}>{conv.user?.fullname?.[0] || conv.user?.email?.[0] || "?"}</Avatar>
                  <ListItemText
                    primary={conv.user?.fullname || conv.user?.email || "Khách hàng"}
                    secondary={conv.lastMessage || "Chưa có tin nhắn"}
                  />
                  {conv.unreadCount > 0 && <Chip label={conv.unreadCount} color="error" size="small" />}
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Paper>

      {/* Chat Area */}
      <Paper sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedUserId ? (
          <>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}>
              {(() => {
                const conv = conversations.find((c) => c.userId === selectedUserId);
                return conv ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar>{conv.user?.fullname?.[0] || conv.user?.email?.[0] || "?"}</Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {conv.user?.fullname || conv.user?.email || "Khách hàng"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {conv.user?.email || ""}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="h6">Chat với khách hàng</Typography>
                );
              })()}
            </Box>

            <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
              {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : messages.length === 0 ? (
                <Typography color="text.secondary" align="center">
                  Chưa có tin nhắn
                </Typography>
              ) : (
                messages.map((msg) => (
                  <Box
                    key={msg._id}
                    sx={{
                      display: "flex",
                      justifyContent: msg.senderType === "admin" ? "flex-end" : "flex-start",
                      mb: 2,
                    }}
                  >
                    <Paper
                      sx={{
                        p: 1.5,
                        maxWidth: "70%",
                        bgcolor: msg.senderType === "admin" ? "primary.main" : "grey.200",
                        color: msg.senderType === "admin" ? "white" : "text.primary",
                      }}
                    >
                      <Typography variant="body2">{msg.message}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {formatTime(msg.createdAt)}
                      </Typography>
                    </Paper>
                  </Box>
                ))
              )}
              <div ref={messagesEndRef} />
            </Box>

            <Box sx={{ p: 2, borderTop: 1, borderColor: "divider", display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Nhập tin nhắn..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                size="small"
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !socketService.isConnected()}
              >
                <Send />
              </IconButton>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              flexDirection: "column",
              gap: 2,
              p: 4,
            }}
          >
            <MessageCircle size={64} color="#ccc" />
            <Typography variant="h6" color="text.secondary">
              Chọn một cuộc hội thoại để bắt đầu
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Các tin nhắn từ khách hàng sẽ xuất hiện bên trái.
              <br />
              Click vào để xem và trả lời.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AdminChat;
