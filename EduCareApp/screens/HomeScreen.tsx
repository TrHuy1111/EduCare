import React, { useEffect, useState , useCallback} from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  Modal, 
  RefreshControl
} from "react-native";
import auth from "@react-native-firebase/auth";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  getAllAnnouncements,
  BASE_URL,
} from "../src/services/announcementService";
import { getNotifications, markNotificationRead } from "../src/services/notificationService";
import { getUserProfile } from "../src/services/userService";
export default function HomeScreen() {
  const navigation: any = useNavigation();
  const [userName, setUserName] = useState('');
  const [events, setEvents] = useState<any[]>([]);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifModal, setShowNotifModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      loadEvents();
      loadNotifications(); 
    }, [])
  );

  const loadUserData = async () => {
    // 1. Ưu tiên lấy từ Backend (để đồng bộ với AccountScreen)
    try {
      const userBackend = await getUserProfile();
      if (userBackend && userBackend.name) {
        setUserName(userBackend.name);
        return;
      }
    } catch (e) {
      console.log("Không load được user backend, fallback sang firebase");
    }

    // 2. Fallback: Nếu backend lỗi thì mới lấy từ Firebase cache
    const userFirebase = auth().currentUser;
    if (userFirebase) {
      setUserName(userFirebase.displayName || 'User');
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {
      console.log("Notif error", e);
    }
  };

  const handleReadNotif = async (item: any) => {
    if (!item.isRead) {
      await markNotificationRead(item._id);
      loadNotifications(); // Reload để update badge
    }
    setShowNotifModal(false);

    // Nếu là thông báo học phí, chuyển trang
    if (item.type === "tuition") {
      navigation.navigate("ParentApp", { screen: "ParentTuition" });
    }
  };

  const loadEvents = async () => {
    try {
      const res = await getAllAnnouncements();
      setEvents(res.data.data || []);
    } catch (e: any) {
      console.log("❌ Load events error:", e.message);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ===== HEADER ===== */}
      <View style={styles.topCard}>
        <View>
          <Text style={styles.hi}>Hi 👋 {userName}</Text>
          <Text style={styles.subText}>EduCare App</Text>
        </View>

        {/* 🔔 BELL ICON */}
        <TouchableOpacity onPress={() => setShowNotifModal(true)}>
          <Text style={{ fontSize: 28 }}>🔔</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ===== QUICK ACTIONS ===== */}
      
      {/* ===== EVENTS ===== */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Sự kiện sắp tới</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("AnnouncementList")}
        >
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingRight: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.eventCard}
            onPress={() =>
              navigation.navigate("AnnouncementDetail", { id: item._id })
            }
          >
            {item.image && (
              <Image
                source={{ uri: `${BASE_URL}${item.image}` }}
                style={styles.eventImage}
              />
            )}

            <View style={styles.eventBody}>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {item.title}
              </Text>

              <Text style={styles.eventMeta} numberOfLines={1}>
                📍 {item.location || "Đang cập nhật"}
              </Text>

              <Text style={styles.eventMeta}>
                🗓{" "}
                {item.startTime
                  ? new Date(item.startTime).toLocaleDateString("vi-VN")
                  : "Chưa rõ"}
              </Text>

              {/* ❤️ LIKE FLOAT */}
              <View style={styles.likeBadge}>
                <Text style={styles.likeText}>❤️ {item.likesCount || 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={showNotifModal} animationType="fade" transparent>
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowNotifModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thông báo mới</Text>
            
            {(notifications || []).length === 0 ? (
              <Text style={{textAlign: 'center', color: '#666', marginTop: 20}}>
                Không có thông báo nào.
              </Text>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item._id}
                style={{ maxHeight: 400 }}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[
                      styles.notifItem, 
                      !item.isRead && { backgroundColor: "#E6FDF3" } 
                    ]}
                    onPress={() => handleReadNotif(item)}
                  >
                    <Text style={{fontSize: 20, marginRight: 10}}>
                      {item.type === 'tuition' ? '💰' : '📢'}
                    </Text>
                    <View style={{flex: 1}}>
                      <Text style={styles.notifTitle}>{item.title}</Text>
                      <Text style={styles.notifMsg}>{item.message}</Text>
                      <Text style={styles.notifTime}>
                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </Text>
                    </View>
                    {!item.isRead && <View style={styles.dot} />}
                  </TouchableOpacity>
                )}
              />
            )}
            
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => setShowNotifModal(false)}
            >
              <Text style={{color: 'white', fontWeight: 'bold'}}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    padding: 16,
  },

  topCard: {
    backgroundColor: "#7DE7C8",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  hi: {
    fontSize: 20,
    fontWeight: "700",
    color: "#064E3B",
  },

  subText: {
    fontSize: 13,
    color: "#065F46",
  },

  logout: {
    color: "#DC2626",
    fontWeight: "700",
  },

  blockTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  quickItem: {
    width: "22%",
    alignItems: "center",
  },

  quickIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E6FDF3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  quickText: {
    fontSize: 12,
    textAlign: "center",
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  seeAll: {
    color: "#3B82F6",
    fontWeight: "600",
  },

  eventCard: {
    width: 260,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginRight: 16,
    overflow: "hidden",
    elevation: 3,
    height: 280, 
  },

  eventImage: {
    width: "100%",
    height: 140,
  },

  eventBody: {
    padding: 12,
    flex: 1, 
    position: "relative",
    justifyContent: 'flex-start', 
    paddingBottom: 40, 
  },

  eventTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },

  eventMeta: {
    fontSize: 13,
    color: "#555",
  },
  eventFooter: {
  flexDirection: "row",
  justifyContent: "flex-end",
  marginTop: 8,
  },

  likeText: {
  fontSize: 13,
  color: "#DC2626",
  fontWeight: "700",
  },

likeBadge: {
    position: "absolute",
    right: 12,
    bottom: 12, 
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2, 
  },
badge: {
    position: "absolute",
    right: -2,
    top: -2,
    backgroundColor: "red",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#7DE7C8"
  },
  badgeText: { color: "white", fontSize: 10, fontWeight: "bold" },

  // Style cho Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    maxHeight: "60%",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#064E3B" },
  
  notifItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: 'center'
  },
  notifTitle: { fontWeight: "700", fontSize: 14, marginBottom: 2 },
  notifMsg: { fontSize: 13, color: "#444" },
  notifTime: { fontSize: 11, color: "#888", marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "red", marginLeft: 5 },
  
  closeBtn: {
    marginTop: 15,
    backgroundColor: "#064E3B",
    padding: 10,
    borderRadius: 8,
    alignItems: "center"
  }
  
});
