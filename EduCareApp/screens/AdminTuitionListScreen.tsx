// AdminTuitionListScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getInvoicesByMonth } from "../src/services/tuitionService";

export default function AdminTuitionListScreen() {
  const navigation = useNavigation<any>();

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await getInvoicesByMonth(month, year);
      setInvoices(res.data);
    } catch (err) {
      console.log("❌ Load invoices error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [month, year]);

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
});
