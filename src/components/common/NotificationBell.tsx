import { Badge, IconButton, Popover, Typography, Box, List, ListItem, ListItemText, Button } from "@mui/material";
import { Notifications, CheckCircle } from "@mui/icons-material";
import { useState, useRef } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    setAnchorEl(anchorRef.current);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const getNotificationIcon = (type: string) => {
    if (type.includes("ORDER")) return "🛒";
    if (type.includes("REVIEW")) return "⭐";
    if (type.includes("VOUCHER")) return "🎫";
    return "📢";
  };

  return (
    <>
      <IconButton ref={anchorRef} onClick={handleClick} color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box sx={{ width: 400, maxHeight: 600, overflow: "auto" }}>
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Thông báo</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllAsRead}>
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </Box>

          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="textSecondary">Không có thông báo</Typography>
            </Box>
          ) : (
            <List>
              {notifications.map((notification) => (
                <ListItem
                  key={notification._id}
                  sx={{
                    bgcolor: notification.isRead ? "transparent" : "action.hover",
                    borderLeft: notification.isRead ? "none" : "4px solid",
                    borderColor: "primary.main",
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <span>{getNotificationIcon(notification.type)}</span>
                        <Typography variant="subtitle2" component="span">
                          {notification.title}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="textSecondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </Typography>
                      </>
                    }
                  />
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    {!notification.isRead && (
                      <IconButton size="small" onClick={() => markAsRead(notification._id)} color="primary">
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}
