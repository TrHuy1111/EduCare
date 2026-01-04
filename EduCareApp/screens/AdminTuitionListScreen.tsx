// AdminTuitionListScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  TextInput
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getInvoicesByMonth, exportTuition } from "../src/services/tuitionService";
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

export default function AdminTuitionListScreen() {
  const navigation = useNavigation<any>();

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const loadInvoices = async () => {
    try {
      setLoading(true);
      
      const res = await getInvoicesByMonth(month, year, searchText);
      setInvoices(res.data);
    } catch (err) {
      console.log("❌ Load invoices error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadInvoices();
    }, 500); 
    return () => clearTimeout(timer);
  }, [searchText, month, year]);

  const handleExport = async () => {
  try {
    setLoading(true);
    
    // 1. Gọi Service lấy file Base64 từ Backend
    const res = await exportTuition(month, year);
    const { fileName, base64 } = res.data;

    if (!base64) {
      Alert.alert("Lỗi", "Dữ liệu file từ server bị rỗng!");
      return;
    }

    // 2. Lưu file vào thư mục Cache (An toàn nhất trên Android)
    // Dùng CachesDirectoryPath thay vì DocumentDirectoryPath để tránh lỗi quyền
    const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
    
    await RNFS.writeFile(filePath, base64, 'base64');

    console.log("File saved to:", filePath);

    // 3. Share file
    // Thêm prefix "file://" để Android nhận diện đúng đường dẫn
    await Share.open({
      title: "Xuất báo cáo học phí",
      url: `file://${filePath}`, 
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      failOnCancel: false, // Không báo lỗi nếu user bấm hủy share
    });

  } catch (err: any) {
    console.log("Export Error:", err);
    if (err?.error?.message !== "User did not share" && err?.message !== "User did not share") {
      Alert.alert("Lỗi", "Không thể xuất file: " + (err.message || err));
    }
  } finally {
    setLoading(false);
  }
};

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("AdminTuitionDetail", {
          invoiceId: item._id,
        })
      }
    >
      <View style={styles.row}>
        <Text style={styles.student}>{item.student?.name}</Text>
        <Text
          style={[
            styles.status,
            item.status === "paid" ? styles.paid : styles.pending,
          ]}
        >
          {item.status.toUpperCase()}
        </Text>
      </View>

      <Text style={styles.sub}>
        Lớp: {item.classId?.name} ({item.classId?.level})
      </Text>

      <Text style={styles.amount}>
        💰 {item.totalAmount.toLocaleString()} VND
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* FILTER */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setMonth((m) => (m === 1 ? 12 : m - 1))}
        >
          <Text>◀</Text>
        </TouchableOpacity>

        <Text style={styles.filterText}>
          📅 {month}/{year}
        </Text>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setMonth((m) => (m === 12 ? 1 : m + 1))}
        >
          <Text>▶</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Text style={{marginRight: 8}}>🔍</Text>
        <TextInput 
          style={styles.searchInput}
          placeholder="Tìm tên học sinh hoặc tên lớp..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Text style={styles.exportText}>📥 Excel</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : invoices.length === 0 ? (
        <Text style={styles.empty}>Chưa có hóa đơn</Text>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}
// 🧩 Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#ecfdf5" },
  filterRow: {  flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  filterBtn: {
    padding: 10,
    backgroundColor: "#d1fae5",
    borderRadius: 8,
    marginHorizontal: 20,
    },
    filterText: { fontSize: 16, fontWeight: "600", color: "#065f46" },
    card: {
    backgroundColor: "#fff",
    padding: 16,    
    borderRadius: 12,
    marginBottom: 12,
        
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    student: { fontSize: 18, fontWeight: "600", color: "#065f46" },
    status: { fontWeight: "700" },
    paid: { color: "#10b981" },
    pending: { color: "#f59e0b" },
    sub: { color: "#6b7280", marginBottom: 8 },
    amount: { fontWeight: "700", color: "#065f46" },
    empty: { textAlign: "center", marginTop: 50, color: "#6b7280" },
    searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  exportBtn: {
    backgroundColor: '#10B981',
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  exportText: { color: '#fff', fontWeight: 'bold' },
});
