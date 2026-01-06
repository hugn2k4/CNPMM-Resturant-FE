import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Minimize2, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import chatApi from "../../api/chatApi";
import socketService from "../../services/socketService";
import type { ChatMessage } from "../../types/chat";
import "./ChatBox.css";

interface TempChatMessage {
  _id: string;
  tempId: string;
  message: string;
  senderType: "user" | "admin";
  createdAt: string;
  isRead: boolean;
}

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<(ChatMessage | TempChatMessage)[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when opened
  useEffect(() => {
    if (isOpen && !isMinimized && messages.length === 0) {
      loadChatHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isMinimized]);

  // Setup socket listeners
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    // Connect socket if not connected
    if (!socketService.isConnected()) {
      socketService.connect(token);
    }

    // Listen for new messages from admin
    const handleNewMessage = (data: unknown) => {
      const msgData = data as { message: ChatMessage };
      setMessages((prev) => [...prev, msgData.message]);

      // Show notification if chat is closed
      if (!isOpen || isMinimized) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    // Listen for message sent confirmation
    const handleMessageSent = (data: unknown) => {
      const msgData = data as { message: ChatMessage; tempId?: string };
      setMessages((prev) => {
        // Replace temporary message with real one
        if (msgData.tempId) {
          return prev.map((msg) => ("tempId" in msg && msg.tempId === msgData.tempId ? msgData.message : msg));
        }
        return [...prev, msgData.message];
      });
    };

    // Listen for admin typing indicator
    const handleAdminTyping = (data: unknown) => {
      const typingData = data as { isTyping: boolean };
      setIsTyping(typingData.isTyping);
    };

    socketService.on("chat:new_message", handleNewMessage);
    socketService.on("chat:message_sent", handleMessageSent);
    socketService.on("chat:admin_typing", handleAdminTyping);

    return () => {
      socketService.off("chat:new_message", handleNewMessage);
      socketService.off("chat:message_sent", handleMessageSent);
      socketService.off("chat:admin_typing", handleAdminTyping);
    };
  }, [isOpen, isMinimized]);

  // Load unread count
  useEffect(() => {
    if (!isOpen) {
      loadUnreadCount();
    }
  }, [isOpen]);

  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      const response = await chatApi.getChatHistory();
      setMessages(response.data || []);
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await chatApi.getUnreadCount();
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socketService.isConnected()) return;

    const tempId = `temp_${Date.now()}`;
    const tempMessage: TempChatMessage = {
      _id: tempId,
      tempId,
      message: newMessage.trim(),
      senderType: "user",
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    // Optimistically add message
    setMessages((prev) => [...prev, tempMessage]);

    // Send via socket
    socketService.emit("chat:send_message", {
      message: newMessage.trim(),
      tempId,
    });

    setNewMessage("");

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketService.emit("chat:typing", { isTyping: false });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    socketService.emit("chat:typing", { isTyping: true });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emit("chat:typing", { isTyping: false });
    }, 2000);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);

    if (!isOpen) {
      setUnreadCount(0);
      // Mark unread messages as read
      const unreadMessageIds = messages
        .filter((msg) => msg.senderType === "admin" && !msg.isRead)
        .map((msg) => msg._id);

      if (unreadMessageIds.length > 0) {
        chatApi.markAsRead(unreadMessageIds).catch(console.error);
      }
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Chat toggle button */}
      <motion.button
        className="chat-toggle-btn"
        onClick={handleToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <MessageCircle size={24} />
            {unreadCount > 0 && <span className="chat-badge">{unreadCount}</span>}
          </>
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`chat-window ${isMinimized ? "minimized" : ""}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-content">
                <MessageCircle size={20} />
                <span>Hỗ trợ khách hàng</span>
              </div>
              <div className="chat-header-actions">
                <button onClick={handleMinimize} className="chat-icon-btn">
                  <Minimize2 size={18} />
                </button>
                <button onClick={handleToggle} className="chat-icon-btn">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="chat-messages">
                  {isLoading ? (
                    <div className="chat-loading">Đang tải...</div>
                  ) : messages.length === 0 ? (
                    <div className="chat-empty">
                      <MessageCircle size={48} className="chat-empty-icon" />
                      <p>Chào bạn! Chúng tôi có thể giúp gì cho bạn?</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg._id} className={`chat-message ${msg.senderType === "user" ? "user" : "admin"}`}>
                        <div className="chat-message-content">
                          <p>{msg.message}</p>
                          <span className="chat-message-time">{formatTime(msg.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}

                  {isTyping && (
                    <div className="chat-message admin">
                      <div className="chat-message-content">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="chat-input-container">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    className="chat-send-btn"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !socketService.isConnected()}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBox;
