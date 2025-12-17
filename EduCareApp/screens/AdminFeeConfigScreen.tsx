import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { getFeeConfig, upsertFeeConfig } from "../src/services/feeConfigService";

const LEVELS = ["infant", "toddler", "preK2", "preK3", "preK4", "preK5"];

type LevelFee = {
  level: string;
  amount: number | string;
};

type ExtraFee = {
  key: string;
  name: string;
  amount: number | string;
};

export default function AdminFeeConfigScreen() {
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const [levelFees, setLevelFees] = useState<LevelFee[]>(
    LEVELS.map((l) => ({ level: l, amount: "" }))
  );

  const [extraFees, setExtraFees] = useState<ExtraFee[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExisting, setIsExisting] = useState(false);

  // 🧠 Normalize level fees (FIX TS + missing levels)
  const normalizeLevelFees = (apiFees: LevelFee[] = []): LevelFee[] => {
    return LEVELS.map((level) => {
      const found = apiFees.find((f) => f.level === level);
      return {
        level,
        amount: found ? found.amount : "",
      };
    });
  };

  // 🔄 Load config when month/year change
  const loadConfig = async () => {
    try {
      const res = await getFeeConfig(month, year);
      if (res.data) {
        setIsExisting(true);
        setLevelFees(normalizeLevelFees(res.data.levelFees || []));
        setExtraFees(res.data.extraFees || []);
      } else {
        setIsExisting(false);
        setLevelFees(LEVELS.map((l) => ({ level: l, amount: "" })));
        setExtraFees([]);
      }
    } catch (err) {
      // chưa có config
      setIsExisting(false);
      setLevelFees(LEVELS.map((l) => ({ level: l, amount: "" })));
      setExtraFees([]);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [month, year]);

  // 💾 SAVE
  const handleSave = async () => {
    // 🔴 VALIDATE LEVEL FEES
    for (const f of levelFees) {
      if (!f.amount || Number(f.amount) <= 0) {
        return Alert.alert(
          "Lỗi",
          `Học phí level ${f.level} phải > 0`
        );
      }
    }

    // 🔴 VALIDATE EXTRA FEES
    for (const f of extraFees) {
      if (!f.name || Number(f.amount) <= 0) {
        return Alert.alert("Lỗi", "Phí khác không hợp lệ");
      }
    }

    try {
      setLoading(true);

      const payload = {
        month,
        year,
        levelFees: levelFees.map((f) => ({
          level: f.level,
          amount: Number(f.amount),
        })),
        extraFees: extraFees.map((f) => ({
          key: f.key,
          name: f.name,
          amount: Number(f.amount),
        })),
      };

      await upsertFeeConfig(payload);

      Alert.alert("✅ Thành công", "Đã lưu cấu hình học phí");
      setIsExisting(true);
    } catch (err: any) {
      Alert.alert("❌ Lỗi", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>💰 Cấu hình học phí</Text>

      <Text style={styles.subTitle}>
        {isExisting
          ? "✏️ Đang chỉnh sửa cấu hình đã tồn tại"
          : "🆕 Chưa có cấu hình cho tháng này"}
      </Text>

      {/* MONTH / YEAR */}
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(month)}
          onChangeText={(t) => setMonth(Number(t))}
          placeholder="Month"
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(year)}
          onChangeText={(t) => setYear(Number(t))}
          placeholder="Year"
        />
      </View>

      {/* LEVEL FEES */}
      <Text style={styles.section}>Học phí theo level</Text>
      {levelFees.map((f, i) => (
        <View key={f.level} style={styles.row}>
          <Text style={{ width: 80 }}>{f.level}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Amount"
            value={String(f.amount)}
            onChangeText={(t) => {
              const copy = [...levelFees];
              copy[i].amount = t;
              setLevelFees(copy);
            }}
          />
        </View>
      ))}

      {/* EXTRA FEES */}
      <Text style={styles.section}>Phí khác</Text>
      {extraFees.map((f, i) => (
        <View key={f.key || i} style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Tên phí"
            value={f.name}
            onChangeText={(t) => {
              const copy = [...extraFees];
              copy[i].name = t;
              setExtraFees(copy);
            }}
          />
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Số tiền"
            value={String(f.amount)}
            onChangeText={(t) => {
              const copy = [...extraFees];
              copy[i].amount = t;
              setExtraFees(copy);
            }}
          />
        </View>
      ))}

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() =>
          setExtraFees([
            ...extraFees,
            {
              key: `fee_${Date.now()}`,
              name: "",
              amount: "",
            },
          ])
        }
      >
        <Text>➕ Thêm phí</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveBtn, loading && { opacity: 0.6 }]}
        disabled={loading}
        onPress={handleSave}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          {loading ? "Đang lưu..." : "💾 Lưu cấu hình"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#E6FDF3" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  subTitle: { color: "#047857", marginBottom: 12 },
  section: { fontWeight: "700", marginTop: 20, marginBottom: 10 },
  row: { flexDirection: "row", gap: 10, marginBottom: 10 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  addBtn: {
    padding: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 10,
  },
  saveBtn: {
    backgroundColor: "#10B981",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
});
