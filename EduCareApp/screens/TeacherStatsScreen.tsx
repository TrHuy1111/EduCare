import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Picker } from "@react-native-picker/picker";

import { getTeacherClasses } from "../src/services/attendanceService";
import { getFeedbackStats } from "../src/services/feedbackService";

const screenWidth = Dimensions.get("window").width;

type PeriodType = "week" | "month";

export default function TeacherStatsScreen() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");

  const [period, setPeriod] = useState<PeriodType>("week");
  const [summary, setSummary] = useState<any>(null);
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD CLASSES ================= */
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const res = await getTeacherClasses();
    setClasses(res.data || []);
    if (res.data?.length) setSelectedClass(res.data[0]._id);
  };

  /* ================= LOAD STATS ================= */
  useEffect(() => {
    if (selectedClass) loadStats();
  }, [selectedClass, period]);

  const loadStats = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const to = now.toISOString().split("T")[0];

      const fromDate = new Date(now);
      if (period === "week") fromDate.setDate(now.getDate() - 7);
      else fromDate.setMonth(now.getMonth() - 1);

      const from = fromDate.toISOString().split("T")[0];

      const res = await getFeedbackStats({
        classId: selectedClass,
        from,
        to,
      });

      setSummary(res.data.summary);
      setRanking(res.data.ranking);
    } finally {
      setLoading(false);
    }
  };

  /* ================= PIE DATA ================= */
  const pieData = summary
    ? [
        {
          name: "⭐ Sao",
          population: summary.star,
          color: "#FACC15",
          legendFontColor: "#374151",
          legendFontSize: 14,
        },
        {
          name: "🌸 Hoa",
          population: summary.flower,
          color: "#F472B6",
          legendFontColor: "#374151",
          legendFontSize: 14,
        },
        {
          name: "🏅 Huy hiệu",
          population: summary.badge,
          color: "#60A5FA",
          legendFontColor: "#374151",
          legendFontSize: 14,
        },
      ]
    : [];

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      <Text style={styles.header}>📊 Thống kê đánh giá</Text>

      {/* ===== CLASS PICKER ===== */}
      <View style={styles.card}>
        <Text style={styles.label}>Lớp học</Text>
        <Picker selectedValue={selectedClass} onValueChange={setSelectedClass}>
          {classes.map((c) => (
            <Picker.Item
              key={c._id}
              label={`${c.name} (${c.level})`}
              value={c._id}
            />
          ))}
        </Picker>
      </View>

      {/* ===== PERIOD FILTER ===== */}
      <View style={styles.filterRow}>
        {[
          { key: "week", label: "Tuần này" },
          { key: "month", label: "Tháng này" },
        ].map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[
              styles.filterBtn,
              period === p.key && styles.filterActive,
            ]}
            onPress={() => setPeriod(p.key as PeriodType)}
          >
            <Text
              style={[
                styles.filterText,
                period === p.key && styles.filterTextActive,
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* ===== PIE CHART ===== */}
          {summary && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>🎁 Tổng phần thưởng</Text>
              <PieChart
                data={pieData}
                width={screenWidth - 32}
                height={200}
                chartConfig={{
                  color: () => "#000",
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          )}

          {/* ===== RANKING ===== */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>🏆 Xếp hạng học sinh</Text>

            <FlatList
              data={ranking}
              keyExtractor={(i) => i.studentId}
              renderItem={({ item, index }) => (
                <View style={styles.rankRow}>
                  <Text style={styles.rankIndex}>{index + 1}</Text>

                  <Text style={styles.rankName}>{item.name}</Text>

                  <Text style={styles.rankScore}>
                    ⭐ {item.star} 🌸 {item.flower} 🏅 {item.badge}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.empty}>Chưa có dữ liệu</Text>
              }
            />
          </View>
        </>
      )}
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    padding: 16,
  },

  header: {
    fontSize: 22,
    fontWeight: "800",
    color: "#065F46",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },

  label: {
    fontWeight: "700",
    marginBottom: 6,
    color: "#064E3B",
  },

  sectionTitle: {
    fontWeight: "800",
    marginBottom: 8,
    color: "#064E3B",
  },

  filterRow: {
    flexDirection: "row",
    marginBottom: 14,
  },

  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
  },

  filterActive: {
    backgroundColor: "#10B981",
  },

  filterText: {
    fontWeight: "600",
    color: "#065F46",
  },

  filterTextActive: {
    color: "#fff",
  },

  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },

  rankIndex: {
    width: 24,
    fontWeight: "800",
    color: "#10B981",
  },

  rankName: {
    flex: 1,
    fontWeight: "700",
  },

  rankScore: {
    fontSize: 12,
    color: "#374151",
  },

  empty: {
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
    color: "#9CA3AF",
  },
});
