// screens/AdminTuitionMenuScreen.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function AdminTuitionMenuScreen() {
  const navigation = useNavigation<any>();

  const menuItems = [
    {
      title: "⚙️ Cấu hình Học phí",
      desc: "Thiết lập đơn giá theo Level, các khoản phụ thu...",
      route: "AdminFeeConfig",
      color: "#E0F2FE", // Xanh dương nhạt
      textColor: "#0369A1",
    },
    {
      title: "🚀 Tạo học phí hàng tháng",
      desc: "Chốt sổ và tạo hóa đơn cho toàn bộ học sinh",
      route: "AdminTuitionGenerate",
      color: "#DCFCE7", // Xanh lá nhạt
      textColor: "#15803D",
    },
    {
      title: "📜 Danh sách Hóa đơn",
      desc: "Xem lịch sử, trạng thái thanh toán của học sinh",
      route: "AdminTuitionList",
      color: "#FEF3C7", // Vàng nhạt
      textColor: "#B45309",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>💰 Quản lý Tài chính</Text>
      
      <View style={styles.list}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: item.color }]}
            onPress={() => navigation.navigate(item.route)}
          >
            <Text style={[styles.title, { color: item.textColor }]}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 20 },
  list: { gap: 16 },
  card: {
    padding: 20,
    borderRadius: 16,
    // Shadow nhẹ cho đẹp
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  desc: { fontSize: 14, color: "#555" },
});