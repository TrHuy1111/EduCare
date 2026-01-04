// ParentTuitionScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Image,
  Clipboard,
  ToastAndroid,
  Alert,
  Platform,
  FlatList, 
} from "react-native";

import { getInvoicesByStudent } from "../src/services/tuitionService";
import { getMyChildren } from "../src/services/studentService";

export default function ParentTuitionScreen() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [invoiceLoading, setInvoiceLoading] = useState(false); // Loading riêng cho phần invoice
  const [showHistory, setShowHistory] = useState(false);

  const loadChildren = async () => {
    try {
      const res = await getMyChildren();
      setChildren(res.data);

      if (res.data.length > 0) {
        // Mặc định chọn bé đầu tiên
        setSelectedStudent(res.data[0]._id);
      }
    } catch (err) {
      console.log("❌ Load children error", err);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async (studentId: string) => {
    try {
      setInvoiceLoading(true); // Bắt đầu load invoice
      const res = await getInvoicesByStudent(studentId);
      const list = res.data || [];
      setInvoices(list);

      const unpaid = list.find((i: any) => i.status === "pending");
      setCurrentInvoice(unpaid || list[0] || null);
    } catch (err) {
      console.log("❌ Load tuition error", err);
    } finally {
      setInvoiceLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadInvoices(selectedStudent);
    }
  }, [selectedStudent]);

  const handleCopy = (text: string, label: string) => {
    Clipboard.setString(text);
    if (Platform.OS === "android") {
      ToastAndroid.show(`Đã sao chép ${label}`, ToastAndroid.SHORT);
    } else {
      Alert.alert("Đã sao chép", text);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  // 👇 UI Thẻ con (Child Card)
  const renderChildCard = ({ item }: any) => {
    const isSelected = selectedStudent === item._id;
    return (
      <TouchableOpacity
        onPress={() => setSelectedStudent(item._id)}
        style={[
          styles.childCard,
          isSelected && styles.childCardActive, // Highlight nếu đang chọn
        ]}
      >
        <Image
          source={require("../assets/icons/student.png")} // Hoặc item.avatar nếu có
          style={styles.childAvatar}
        />
        <View>
          <Text
            style={[
              styles.childName,
              isSelected && { color: "#fff" }, // Đổi màu chữ
            ]}
          >
            {item.name}
          </Text>
          <Text
            style={[
              styles.childClass,
              isSelected && { color: "#E6FDF3" },
            ]}
          >
            {item.classId?.name || "Chưa xếp lớp"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 1️⃣ DANH SÁCH CON (HORIZONTAL SCROLL) */}
      <View style={styles.topSection}>
        <Text style={styles.topLabel}>Hồ sơ học sinh ({children.length})</Text>
        <FlatList
          data={children}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          renderItem={renderChildCard}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
        />
      </View>

      {/* 2️⃣ NỘI DUNG HỌC PHÍ (SCROLL VIEW) */}
      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {invoiceLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color="#10B981" />
        ) : !currentInvoice ? (
          <View style={styles.emptyContainer}>
            <Image
              source={require("../assets/icons/tuition.png")}
              style={{ width: 80, height: 80, opacity: 0.5, marginBottom: 10 }}
            />
            <Text style={styles.emptyText}>Tháng này chưa có học phí nhé!</Text>
          </View>
        ) : (
          <>
            {/* Header Tiền */}
            <View style={styles.billHeader}>
              <Text style={styles.billTitle}>
                Học phí T{currentInvoice.month}/{currentInvoice.year}
              </Text>
              <Text style={styles.billAmount}>
                {currentInvoice.totalAmount.toLocaleString()} đ
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  currentInvoice.status === "paid"
                    ? { backgroundColor: "#D1FAE5" }
                    : { backgroundColor: "#FEE2E2" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    currentInvoice.status === "paid"
                      ? { color: "#065F46" }
                      : { color: "#B91C1C" },
                  ]}
                >
                  {currentInvoice.status === "paid"
                    ? "✅ ĐÃ THANH TOÁN"
                    : "⏳ CHƯA THANH TOÁN"}
                </Text>
              </View>
            </View>

            {/* Chi tiết */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>📋 Chi tiết khoản thu</Text>
              {currentInvoice.items.map((i: any, idx: number) => (
                <View key={`${i.key}-${idx}`} style={styles.itemRow}>
                  <Text style={styles.itemName}>{i.name}</Text>
                  <Text style={styles.itemPrice}>
                    {i.amount.toLocaleString()} đ
                  </Text>
                </View>
              ))}
              <View style={styles.divider} />
              <View style={styles.itemRow}>
                <Text style={{ fontWeight: "bold" }}>Tổng cộng</Text>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                  {currentInvoice.totalAmount.toLocaleString()} đ
                </Text>
              </View>
            </View>

            {/* Thanh toán */}
            {currentInvoice.status === "pending" && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>💳 Chuyển khoản</Text>
                
                {/* QR Code */}
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                  <Image
                    source={require("../assets/icons/viet_qr.png")}
                    style={{ width: 150, height: 150 }}
                    resizeMode="contain"
                  />
                  <Text style={{ marginTop: 8, color: "#666" }}>
                    Quét mã để thanh toán nhanh
                  </Text>
                </View>

                {/* Thông tin Copy */}
                <CopyRow
                  label="Số tài khoản (MB Bank)"
                  value="0987654321"
                  onCopy={() => handleCopy("0987654321", "Số tài khoản")}
                />
                <CopyRow
                  label="Nội dung chuyển khoản"
                  value={`EDU ${currentInvoice.student.name} T${currentInvoice.month}`}
                  onCopy={() =>
                    handleCopy(
                      `EDU ${currentInvoice.student.name} T${currentInvoice.month}`,
                      "Nội dung"
                    )
                  }
                />
              </View>
            )}

            <TouchableOpacity
              onPress={() => setShowHistory(true)}
              style={styles.historyLink}
            >
              <Text style={{ color: "#2563EB", fontWeight: "600" }}>
                Xem lịch sử các tháng trước
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* modal history */}
      <Modal visible={showHistory} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>📅 Lịch sử học phí</Text>
          <ScrollView>
            {invoices.map((inv: any) => (
              <View key={inv._id} style={styles.historyItem}>
                <View>
                  <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                    Tháng {inv.month}/{inv.year}
                  </Text>
                  <Text style={{ color: "#666" }}>
                    {inv.totalAmount.toLocaleString()} đ
                  </Text>
                </View>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: inv.status === "paid" ? "green" : "#E11D48",
                  }}
                >
                  {inv.status === "paid" ? "Đã đóng" : "Nợ"}
                </Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeModalBtn}
            onPress={() => setShowHistory(false)}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

// Component con cho dòng Copy
const CopyRow = ({ label, value, onCopy }: any) => (
  <View style={styles.copyBox}>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 12, color: "#666" }}>{label}</Text>
      <Text style={{ fontSize: 15, fontWeight: "bold", color: "#333" }}>
        {value}
      </Text>
    </View>
    <TouchableOpacity style={styles.copyBtn} onPress={onCopy}>
      <Text style={{ color: "#2563EB", fontWeight: "bold" }}>Sao chép</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },

  // Top Section (Danh sách con)
  topSection: {
    backgroundColor: "#fff",
    paddingTop: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    elevation: 3,
    paddingBottom: 5,
  },
  topLabel: {
    marginLeft: 16,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  childCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 30, // Bo tròn kiểu "Chip"
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  childCardActive: {
    backgroundColor: "#10B981", // Màu xanh chủ đạo
    borderColor: "#10B981",
  },
  childAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: "#ddd",
  },
  childName: { fontWeight: "700", color: "#374151" },
  childClass: { fontSize: 11, color: "#6B7280" },

  // Content
  contentContainer: { padding: 16 },
  
  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { fontSize: 16, color: "#666" },

  // Bill Header
  billHeader: { alignItems: "center", marginBottom: 20 },
  billTitle: { fontSize: 16, color: "#666", marginBottom: 4 },
  billAmount: { fontSize: 32, fontWeight: "800", color: "#10B981" },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "800" },

  // Card chung
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12, color: "#333" },
  
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemName: { color: "#444", flex: 1 },
  itemPrice: { fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 8 },

  // Copy Row
  copyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  copyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  historyLink: { alignItems: "center", marginTop: 10, marginBottom: 30 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: "#fff", padding: 20, marginTop: 50 },
  modalHeader: { fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeModalBtn: {
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
});