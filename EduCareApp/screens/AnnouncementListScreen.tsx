import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  getAllAnnouncements,
  BASE_URL,
} from "../src/services/announcementService";

export default function AnnouncementListScreen() {
  const navigation: any = useNavigation();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await getAllAnnouncements();
      setList(res.data.data || []);
    } catch (err) {
      console.log("❌ Load announcements error");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("AnnouncementDetail", { id: item._id })
      }
      activeOpacity={0.85}
    >
      {/* IMAGE */}
      {item.image ? (
        <Image
          source={{ uri: `${BASE_URL}${item.image}` }}
          style={styles.image}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={{ color: "#9CA3AF" }}>No Image</Text>
        </View>
      )}

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
            {item.title}
        </Text>

        <Text style={styles.desc} numberOfLines={2}>
            {item.content}
        </Text>

        <Text style={styles.meta}>
            📍 {item.location || "Đang cập nhật"}
        </Text>

        <Text style={styles.meta}>
            📅{" "}
            {item.startTime
            ? new Date(item.startTime).toLocaleDateString("vi-VN")
            : "Chưa rõ"}
        </Text>
        </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📣 Tất cả sự kiện</Text>
      </View>

      {/* LIST */}
      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  header: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#064E3B",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 10,
    elevation: 3,
  },

  image: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },

  imagePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
  flex: 1,
  paddingLeft: 12,
},

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  meta: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  desc: {
    fontSize: 13,
    color: "#374151",
    marginTop: 6,
  },

  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
