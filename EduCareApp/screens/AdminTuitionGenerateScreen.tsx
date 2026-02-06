// AdminTuitionGenerateScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { generateMonthlyTuition } from "../src/services/tuitionService";

export default function AdminTuitionGenerateScreen() {
  const navigation = useNavigation<any>();

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    Alert.alert(
      "Xác nhận",
      `Tạo học phí cho tháng ${month}/${year}?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Tạo",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await generateMonthlyTuition(month, year);

              Alert.alert(
                "✅ Thành công",
                `Đã tạo ${res.data.createdCount} hóa đơn`
              );

              navigation.navigate("AdminTuitionList", {
                month,
                year,
              });
            } catch (err: any) {
              Alert.alert(
                "❌ Lỗi",
                err.response?.data?.message || err.message
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tháng</Text>
      <Picker selectedValue={month} onValueChange={setMonth}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <Picker.Item key={m} label={`${m}`} value={m} />
        ))}
      </Picker>

      <Text style={styles.label}>Năm</Text>
      <Picker selectedValue={year} onValueChange={setYear}>
        {[year - 1, year, year + 1].map((y) => (
          <Picker.Item key={y} label={`${y}`} value={y} />
        ))}
      </Picker>

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.6 }]}
        onPress={handleGenerate}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading ? "Đang tạo..." : "🚀 Tạo học phí"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        ⚠️ Hệ thống sẽ:
        {"\n"}• Kiểm tra FeeConfig
        {"\n"}• Bỏ qua học sinh nhập học sau tháng
        {"\n"}• Không tạo trùng hóa đơn
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#E6FDF3",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#064E3B",
    marginBottom: 20,
  },
  label: {
    fontWeight: "600",
    marginTop: 10,
  },
  btn: {
    marginTop: 30,
    backgroundColor: "#0ea5a4",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  note: {
    marginTop: 20,
    color: "#047857",
    fontSize: 13,
  },
});
