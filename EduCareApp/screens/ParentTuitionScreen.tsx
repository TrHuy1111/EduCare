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
  Clipboard, ToastAndroid, Alert, Platform
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getInvoicesByStudent } from "../src/services/tuitionService";
import { getMyChildren } from "../src/services/studentService";

export default function ParentTuitionScreen() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  /* ================= LOAD CHILDREN ================= */
  const loadChildren = async () => {
    try {
      const res = await getMyChildren();
      setChildren(res.data);

      if (res.data.length === 1) {
        setSelectedStudent(res.data[0]._id);
      }
    } catch (err) {
      console.log("❌ Load children error", err);
    } finally {
      setLoading(false); // ⭐ FIX QUAN TRỌNG
    }
  };

  /* ================= LOAD INVOICES ================= */
  const loadInvoices = async (studentId: string) => {
    try {
      setLoading(true);
      const res = await getInvoicesByStudent(studentId);
      const list = res.data || [];
      setInvoices(list);

      // Ưu tiên invoice chưa thanh toán
      const unpaid = list.find((i: any) => i.status === "pending");
      setCurrentInvoice(unpaid || list[0] || null);
    } catch (err) {
      console.log("❌ Load tuition error", err);
    } finally {
      setLoading(false);
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

  /* ================= UI STATES ================= */
  if (loading) {
    return <ActivityIndicator style={{ marginTop: 60 }} size="large" />;
  }

  const handleCopy = (text: string, label: string) => {
  Clipboard.setString(text);
  if (Platform.OS === 'android') {
    ToastAndroid.show(`Đã sao chép ${label}`, ToastAndroid.SHORT);
  } else {
    Alert.alert("Đã sao chép", text);
  }
};

  return (
    <ScrollView style={styles.container}>
      {/* ===== SELECT CHILD ===== */}
      {children.length > 1 && (
        <View style={styles.card}>
          <Text style={styles.label}>Chọn con</Text>
          <Picker
            selectedValue={selectedStudent}
            onValueChange={(v) => setSelectedStudent(v)}
          >
            <Picker.Item label="-- Chọn học sinh --" value={null} />
            {children.map((c) => (
              <Picker.Item
                key={c._id}
                label={`${c.name} - ${c.classId?.name || "Chờ xếp lớp"}`} 
                value={c._id}
              />
            ))}
          </Picker>
        </View>
      )}

      {!currentInvoice ? (
        <Text style={styles.empty}>Chưa có học phí</Text>
      ) : (
        <>
          {/* ===== HEADER ===== */}
          <View style={styles.header}>
            <Text style={styles.title}>
              💰 Học phí tháng {currentInvoice.month}/{currentInvoice.year}
            </Text>
            <Text style={styles.amount}>
              {currentInvoice.totalAmount.toLocaleString()} VND
            </Text>
          </View>

          {/* ===== SUMMARY ===== */}
          <View style={styles.card}>
            <Row label="Số tiền phải đóng" value={currentInvoice.totalAmount} />
            <Row
              label="Đã đóng"
              value={
                currentInvoice.status === "paid"
                  ? currentInvoice.totalAmount
                  : 0
              }
            />
            <Row
              label="Còn lại"
              value={
                currentInvoice.status === "paid"
                  ? 0
                  : currentInvoice.totalAmount
              }
            />
          </View>

          {/* ===== ITEMS ===== */}
          <View style={styles.card}>
            <Text style={styles.section}>Chi tiết khoản phí</Text>
            {currentInvoice.items.map((i: any, idx: number) => (
              <Row
                key={`${i.key}-${idx}`}
                label={i.name}
                value={i.amount}
              />
            ))}
          </View>

          {/* ===== PAYMENT ===== */}
          <View style={styles.card}>
            {currentInvoice.status === "pending" ? (
              <>
                <Text style={styles.section}>Thanh toán</Text>
                <Image
                  source={require("../assets/icons/viet_qr.png")}
                  style={styles.qr}
                  resizeMode="contain"
                />
                <Text style={styles.qrText}>
                  Trường Mầm Non EduCare
                </Text>
                <Text style={styles.qrAmount}>
                  {currentInvoice.totalAmount.toLocaleString()} VND
                </Text>
              </>
            ) : (
              <Text style={styles.paid}>✅ Đã thanh toán</Text>
            )}
          </View>

          <View style={{ marginTop: 20, width: '100%' }}>
            <Text style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 10 }}>
              Hoặc chuyển khoản thủ công:
            </Text>
            
            {/* Số tài khoản */}
            <View style={styles.copyRow}>
              <View>
                <Text style={styles.copyLabel}>Số tài khoản (MB Bank):</Text>
                <Text style={styles.copyValue}>0987654321</Text>
              </View>
              <TouchableOpacity 
                style={styles.copyBtn} 
                onPress={() => handleCopy("0987654321", "Số tài khoản")}
              >
                <Text style={styles.copyBtnText}>Copy</Text>
              </TouchableOpacity>
            </View>

            {/* Nội dung CK */}
            <View style={styles.copyRow}>
              <View>
                <Text style={styles.copyLabel}>Nội dung:</Text>
                <Text style={styles.copyValue}>
                  EDU {currentInvoice.student.name} T{currentInvoice.month}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.copyBtn}
                onPress={() => handleCopy(`EDU ${currentInvoice.student.name} T${currentInvoice.month}`, "Nội dung")}
              >
                <Text style={styles.copyBtnText}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ===== HISTORY BUTTON ===== */}
          <TouchableOpacity onPress={() => setShowHistory(true)}>
            <Text style={styles.historyBtn}>Xem lịch sử học phí</Text>
          </TouchableOpacity>
        </>
      )}

      {/* ===== HISTORY MODAL ===== */}
      <Modal visible={showHistory} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>📅 Lịch sử học phí</Text>

          {invoices.map((inv: any) => (
            <View key={inv._id} style={styles.historyRow}>
              <Text>
                Tháng {inv.month}/{inv.year}
              </Text>
              <Text
                style={{
                  color: inv.status === "paid" ? "green" : "red",
                  fontWeight: "700",
                }}
              >
                {inv.status === "paid" ? "Đã đóng" : "Chưa đóng"}
              </Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setShowHistory(false)}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ================= COMPONENTS ================= */
const Row = ({ label, value }: any) => (
  <View style={styles.row}>
    <Text>{label}</Text>
    <Text>{value.toLocaleString()} VND</Text>
  </View>
);

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F3F4F6" },
  header: { marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "700" },
  amount: { fontSize: 26, fontWeight: "800" },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },

  section: { fontWeight: "700", marginBottom: 10 },
  label: { fontWeight: "600", marginBottom: 6 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  empty: { textAlign: "center", marginTop: 40 },

  qr: { width: "100%", height: 200, marginTop: 10 },
  qrText: { textAlign: "center", marginTop: 8 },
  qrAmount: { textAlign: "center", fontWeight: "800", marginTop: 4 },

  paid: { color: "green", fontWeight: "800", textAlign: "center" },

  historyBtn: {
    textAlign: "center",
    color: "#2563EB",
    fontWeight: "700",
    marginBottom: 30,
  },

  modal: { flex: 1, padding: 20, backgroundColor: "#fff" },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 16 },

  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  closeBtn: {
    marginTop: 30,
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  copyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  copyLabel: { fontSize: 12, color: '#6B7280' },
  copyValue: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  copyBtn: { backgroundColor: '#E0F2FE', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  copyBtnText: { color: '#0284C7', fontWeight: '600', fontSize: 12 }
});
