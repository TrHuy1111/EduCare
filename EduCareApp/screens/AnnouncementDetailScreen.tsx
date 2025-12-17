import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  getAnnouncementById,
  likeAnnouncement,
  BASE_URL,
} from "../src/services/announcementService";

export default function AnnouncementDetailScreen() {
  const route: any = useRoute();
  const navigation: any = useNavigation();
  const { id } = route.params;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    loadDetail();
  }, []);

  const loadDetail = async () => {
    try {
      const res = await getAnnouncementById(id);
      setData(res.data.data);
    } catch (err) {
      Alert.alert("Lỗi", "Không tải được chi tiết sự kiện");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (liking) return;
    try {
      setLiking(true);
      const res = await likeAnnouncement(id);
      setData(res.data.data);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể like sự kiện");
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${data.title}\n\n${data.content}`,
      });
    } catch (err) {
      console.log("Share error");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loadingBox}>
        <Text>Không tìm thấy sự kiện</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* IMAGE */}
      {data.image ? (
        <Image
          source={{ uri: `${BASE_URL}${data.image}` }}
          style={styles.banner}
        />
      ) : (
        <View style={styles.bannerPlaceholder}>
          <Text style={{ color: "#9CA3AF" }}>No Image</Text>
        </View>
      )}

      {/* CONTENT */}
      <View style={styles.body}>
        {/* TITLE */}
        <Text style={styles.title}>{data.title}</Text>

        {/* META */}
        <View style={styles.metaRow}>
          <Text style={styles.meta}>📍 {data.location || "Đang cập nhật"}</Text>
          <Text style={styles.meta}>
            🗓{" "}
            {data.startTime
              ? new Date(data.startTime).toLocaleDateString("vi-VN")
              : "Chưa rõ"}
          </Text>
        </View>

        {/* DESCRIPTION */}
        <Text style={styles.content}>{data.content}</Text>

        {/* ACTIONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.likeBtn}
            onPress={handleLike}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>
              ❤️ {data.likes || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>🔗 Chia sẻ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  banner: {
    width: "100%",
    height: 220,
  },

  bannerPlaceholder: {
    width: "100%",
    height: 220,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },

  body: {
    backgroundColor: "#FFFFFF",
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#064E3B",
    marginBottom: 8,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  meta: {
    fontSize: 13,
    color: "#6B7280",
  },

  content: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 20,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  likeBtn: {
    backgroundColor: "#ECFDF5",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },

  shareBtn: {
    backgroundColor: "#EFF6FF",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },

  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },

  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
