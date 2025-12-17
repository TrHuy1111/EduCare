import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { AdminStackParamList } from "../navigation/AdminNavigator";
import {
  getInvoiceDetail,
  payInvoice,
} from "../src/services/tuitionService";

type RouteProps = RouteProp<
  AdminStackParamList,
  "AdminTuitionDetail"
>;

export default function AdminTuitionDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<any>();
  const { invoiceId } = route.params;

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const res = await getInvoiceDetail(invoiceId);
      setInvoice(res.data);
    } catch (err) {
      console.log("❌ Load invoice detail error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, []);

  const handlePay = async () => {
    Alert.alert(
      "Xác nhận thanh toán",
      "Đánh dấu hóa đơn này là đã thanh toán?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Thanh toán",
          style: "default",
          onPress: async () => {
            try {
              setPaying(true);
              await payInvoice(invoiceId);
              Alert.alert("✅ Thành công", "Đã thanh toán học phí");
              loadInvoice();
            } catch (err: any) {
              Alert.alert("❌ Lỗi", err.message);
            } finally {
              setPaying(false);
            }
          },
        },
      ]
    );
  };

  if (loading || !invoice) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧾 Chi tiết học phí</Text>

      <Text style={styles.label}>Học sinh</Text>
      <Text style={styles.value}>{invoice.student?.name}</Text>

      <Text style={styles.label}>Lớp</Text>
      <Text style={styles.value}>
        {invoice.classId?.name} ({invoice.classId?.level})
      </Text>

      <Text style={styles.label}>Tháng</Text>
      <Text style={styles.value}>
        {invoice.month}/{invoice.year}
      </Text>

      <Text style={styles.section}>Chi tiết khoản phí</Text>

      {invoice.items.map((item: any) => (
        <View key={item._id} style={styles.itemRow}>
          <Text>{item.name}</Text>
          <Text style={styles.amount}>
            {item.amount.toLocaleString()} đ
          </Text>
        </View>
      ))}

      <View style={styles.totalRow}>
        <Text style={styles.totalText}>Tổng cộng</Text>
        <Text style={styles.totalAmount}>
          {invoice.totalAmount.toLocaleString()} đ
        </Text>
      </View>

      <View
        style={[
          styles.statusBox,
          invoice.status === "paid" ? styles.paid : styles.pending,
        ]}
      >
        <Text style={styles.statusText}>
          {invoice.status === "paid"
            ? "ĐÃ THANH TOÁN"
            : "CHƯA THANH TOÁN"}
        </Text>
      </View>

      {invoice.status === "pending" && (
        <TouchableOpacity
          style={styles.payBtn}
          onPress={handlePay}
          disabled={paying}
        >
          <Text style={styles.payText}>
            {paying ? "Đang xử lý..." : "💰 Thanh toán"}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#E6FDF3",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#064E3B",
    marginBottom: 16,
  },
  label: {
    fontWeight: "600",
    marginTop: 8,
  },
  value: {
    marginBottom: 6,
    fontSize: 15,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "700",
    fontSize: 16,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  amount: {
    fontWeight: "600",
  },
  totalRow: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalText: {
    fontWeight: "800",
  },
  totalAmount: {
    fontWeight: "800",
    color: "#0f766e",
  },
  statusBox: {
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  paid: {
    backgroundColor: "#bbf7d0",
  },
  pending: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontWeight: "800",
  },
  payBtn: {
    marginTop: 20,
    backgroundColor: "#10B981",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  payText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});
