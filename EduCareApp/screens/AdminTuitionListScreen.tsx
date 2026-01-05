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
  TextInput,Image
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getInvoicesByMonth, exportTuition } from "../src/services/tuitionService";
import { getAllClasses } from "../src/services/classService";
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

export default function AdminTuitionListScreen() {
  const navigation = useNavigation<any>();

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getAllClasses();
        setClasses(res.data);
      } catch (e) { console.log("Err load classes", e)}
    };
    fetchClasses();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);

      const res = await getInvoicesByMonth(month, year, searchText, selectedClass);
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
  }, [searchText, month, year, selectedClass]);

  const handleExport = async () => {
  try {
    setLoading(true);
    // 1. Gọi Service lấy file Base64 từ Backend
    const res = await exportTuition(month, year, selectedClass);
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
      onPress={() => navigation.navigate("AdminTuitionDetail", { invoiceId: item._id })}
    >
      <View style={styles.row}>
        <Text style={styles.student}>{item.student?.name}</Text>
        <Text style={[styles.status, item.status === "paid" ? styles.paid : styles.pending]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.sub}>
        Lớp: {item.classId?.name} ({item.classId?.level})
      </Text>
      <Text style={styles.amount}>💰 {item.totalAmount.toLocaleString()} VND</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* --- TIME FILTER --- */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.arrowBtn} onPress={() => setMonth((m) => (m === 1 ? 12 : m - 1))}>
          <Text style={styles.arrowText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.filterText}>📅 {month}/{year}</Text>
        <TouchableOpacity style={styles.arrowBtn} onPress={() => setMonth((m) => (m === 12 ? 1 : m + 1))}>
          <Text style={styles.arrowText}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* --- CLASS FILTER & SEARCH --- */}
      <View style={{ gap: 10, marginBottom: 10 }}>
        {/* Dropdown chọn lớp */}
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={selectedClass}
            onValueChange={(v) => setSelectedClass(v)}
            style={{ height: 50 }}
          >
            <Picker.Item label="-- Tất cả các lớp --" value="" />
            {classes.map((c) => (
              <Picker.Item key={c._id} label={c.name} value={c._id} />
            ))}
          </Picker>
        </View>

        {/* Search Box (Bỏ nút Export ở đây) */}
        <View style={styles.searchBox}>
          <Text style={{marginRight: 8, fontSize: 18}}>🔍</Text>
          <TextInput 
            style={styles.searchInput}
            placeholder="Tìm tên học sinh..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator size="large" color="#10B981" style={{marginTop: 20}} />
      ) : invoices.length === 0 ? (
        <Text style={styles.empty}>Chưa có hóa đơn nào.</Text>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }} // Chừa chỗ cho nút FAB
        />
      )}

      {/* 👇 NÚT FAB EXPORT EXCEL (Giống nút +) */}
      <TouchableOpacity style={styles.fabBtn} onPress={handleExport}>
        {/* Dùng icon ảnh hoặc text */}
        <Image 
          source={require('../assets/icons/excel.png')} // Bạn cần kiếm 1 icon excel.png đẹp
          style={{ width: 28, height: 28 }} 
        />
        {/* Hoặc dùng Text nếu chưa có icon: <Text style={{fontSize: 24}}>📥</Text> */}
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#ecfdf5" },
  
  // Filter Time
  filterRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  arrowBtn: { padding: 10, backgroundColor: "#d1fae5", borderRadius: 8, marginHorizontal: 15 },
  arrowText: { fontSize: 18, color: "#065f46", fontWeight: "bold" },
  filterText: { fontSize: 18, fontWeight: "700", color: "#065f46" },

  // Inputs
  pickerBox: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', overflow: 'hidden' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ddd', height: 48 },
  searchInput: { flex: 1, fontSize: 16 },

  // Card
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  student: { fontSize: 16, fontWeight: "700", color: "#065f46" },
  status: { fontWeight: "700", fontSize: 12 },
  paid: { color: "#10b981" },
  pending: { color: "#f59e0b" },
  sub: { color: "#6b7280", marginBottom: 6, fontSize: 13 },
  amount: { fontWeight: "800", color: "#065f46", fontSize: 16 },
  empty: { textAlign: "center", marginTop: 50, color: "#6b7280" },

  fabBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#fff', 
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6, // Bóng đổ Android
    shadowColor: '#000', // Bóng đổ iOS
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  }
});