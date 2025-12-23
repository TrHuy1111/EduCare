import React, { useEffect, useState , useCallback} from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getAllAnnouncements, deleteAnnouncement } from "../src/services/announcementService";
import { BASE_URL } from "../src/services/announcementService";

export default function AdminAnnouncementListScreen({ navigation }: any) {
  const [list, setList] = useState<any[]>([]);

  useFocusEffect(
  useCallback(() => {
    load();
  }, [])
);

  const load = async () => {
    try {
      const res = await getAllAnnouncements();
      setList(res.data.data || []);
    } catch (err: any) {
      Alert.alert("Lỗi", err.message);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Xóa bài viết?", "Bạn chắc chắn muốn xóa?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteAnnouncement(id);
          load();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
        <View style={{ height: 50, justifyContent: 'center', marginBottom: 10 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Image
                source={require('../assets/icons/back.png')} 
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Text style={styles.header}>Quản lý thông báo</Text>
        </View>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate("AdminAnnouncementCreate")}
      >
        <Text style={styles.addText}>➕ Tạo thông báo mới</Text>
      </TouchableOpacity>

      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image ? (
              <Image
                source={{ uri: `${BASE_URL}${item.image}` }}
                style={styles.image}
              />
            ) : null}

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.content} numberOfLines={2}>
              {item.content}
            </Text>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() =>
                  navigation.navigate("AdminAnnouncementEdit", {
                    id: item._id,
                  })
                }
              >
                <Text style={{ color: "#fff" }}>✏️ Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item._id)}
              >
                <Text style={{ color: "#fff" }}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6FDF3", padding: 16 },
  header: { fontSize: 22, fontWeight: "700", color: "#064E3B",  textAlign: 'center' },
  addBtn: {
    backgroundColor: "#10B981",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  addText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  image: { width: "100%", height: 150, borderRadius: 10, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 4, color: "#064E3B" },
  content: { color: "#333", marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  editBtn: {
    backgroundColor: "#3B82F6",
    padding: 10,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  deleteBtn: {
    backgroundColor: "#EF4444",
    padding: 10,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  backBtn: {
  position: 'absolute',
  left: 0,
  paddingHorizontal: 10,
  paddingVertical: 6,
  },
  backIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
});
