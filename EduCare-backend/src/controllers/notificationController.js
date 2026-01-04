import Notification from "../models/notificationModel.js";

// Lấy thông báo của user đang đăng nhập
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    // Lấy mới nhất trước
    const notifs = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
    
    // Đếm số lượng chưa đọc
    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

    res.json({ data: notifs, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Đánh dấu đã đọc
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};