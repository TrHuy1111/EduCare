import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useNavigation } from "@react-navigation/native";
import {
  getAllAnnouncements,
  BASE_URL,
} from "../src/services/announcementService";


export default function HomeScreen() {
  const navigation: any = useNavigation();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await getAllAnnouncements();
      setEvents(res.data.data || []);
    } catch (e: any) {
      console.log("❌ Load events error:", e.message);
    }
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      await GoogleSignin.signOut();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const QuickItem = ({ icon, label, onPress }: any) => (
    <TouchableOpacity style={styles.quickItem} onPress={onPress}>
      <View style={styles.quickIcon}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <Text style={styles.quickText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ===== HEADER ===== */}
      <View style={styles.topCard}>
        <View>
          <Text style={styles.hi}>
            Hi, {auth().currentUser?.displayName || "User"}
          </Text>
          <Text style={styles.subText}>EduCare App</Text>
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* ===== QUICK ACTIONS ===== */}
      <Text style={styles.blockTitle}>Tính năng yêu thích</Text>

      <View style={styles.quickRow}>
        <QuickItem icon="📅" label="Thời khóa biểu" />
        <QuickItem icon="✅" label="Điểm danh" />
        <QuickItem icon="💰" label="Học phí" />
        <QuickItem icon="📊" label="Điểm" />
      </View>

      <View style={styles.quickRow}>
        <QuickItem icon="📝" label="Lịch thi" />
        <QuickItem icon="📣" label="Thông báo" />
        <QuickItem icon="🎧" label="Góp ý" />
        <QuickItem icon="➕" label="Xem thêm" />
      </View>

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

              <Text style={styles.eventMeta}>
                📍 {item.location || "Đang cập nhật"}
              </Text>

              <Text style={styles.eventMeta}>
                🗓{" "}
                {item.startTime
                  ? new Date(item.startTime).toLocaleDateString("vi-VN")
                  : "Chưa rõ"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
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
  },

  eventImage: {
    width: "100%",
    height: 140,
  },

  eventBody: {
    padding: 12,
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
});
