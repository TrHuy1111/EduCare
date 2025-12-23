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
import { useRoute } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";

import {
  getAnnouncementById,
  toggleLikeAnnouncement,
  BASE_URL,
} from "../src/services/announcementService";

export default function AnnouncementDetailScreen() {
  const route: any = useRoute();
  const { id } = route.params;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    loadDetail();
  }, []);

  // ===== LOAD DETAIL =====
  const loadDetail = async () => {
    try {
      const res = await getAnnouncementById(id);
      const a = res.data.data;

      setData(a);
      setLikesCount(a.likesCount || 0);

      const uid = auth().currentUser?.uid;
      setLiked(a.likedBy?.some((u: any) => u.uid === uid));
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải chi tiết sự kiện");
    } finally {
      setLoading(false);
    }
  };

  // ===== LIKE / UNLIKE =====
  const handleLike = async () => {
    if (liking) return;

    try {
      setLiking(true);
      const res = await toggleLikeAnnouncement(data._id);

      setLiked(res.data.data.liked);
      setLikesCount(res.data.data.likesCount);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể like sự kiện");
    } finally {
      setLiking(false);
    }
  };

  // ===== SHARE =====
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${data.title}\n\n${data.content}`,
      });
    } catch (err) {
      console.log("Share error");
    }
  };

  // ===== LOADING =====
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

  // ===== UI =====
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

        {/* CONTENT */}
        <Text style={styles.content}>{data.content}</Text>

        {/* ACTIONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.likeBtn, liked && styles.liked]}
            onPress={handleLike}
            disabled={liking}
          >
            <Text style={styles.likeText}>
              {liked ? "💔 Bỏ thích" : "❤️ Thích"} ({likesCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShare}
          >
            <Text style={styles.actionText}>🔗 Chia sẻ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// ===== STYLES =====
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
    backgroundColor: "#E5E7EB",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },

  liked: {
    backgroundColor: "#FECACA",
  },

  likeText: {
    fontSize: 16,
    fontWeight: "700",
  },

  shareBtn: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 18,
    borderRadius: 12,
    justifyContent: "center",
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
