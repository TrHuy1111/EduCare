import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";

import { getTeacherClasses } from "../src/services/attendanceService";
import { getFeedbackStats } from "../src/services/feedbackService";

const screenWidth = Dimensions.get("window").width;

export default function TeacherStatsScreen() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");

  // 👇 THAY ĐỔI: Dùng state để lưu tháng đang chọn (Mặc định là tháng hiện tại)
  const [currentDate, setCurrentDate] = useState(new Date());

  const [summary, setSummary] = useState<any>(null);
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* ================= LOAD CLASSES ================= */
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const res = await getTeacherClasses();
    setClasses(res.data || []);
    if (res.data?.length) setSelectedClass(res.data[0]._id);
  };

  /* ================= HANDLE MONTH CHANGE ================= */
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  /* ================= LOAD STATS ================= */
  const loadStats = async (isRefreshing = false) => {
    if (!selectedClass) return;

    try {
      if (!isRefreshing) setLoading(true);

      // 👇 LOGIC MỚI: Tính ngày đầu tháng và cuối tháng của tháng đang chọn
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth(); // 0-11

      // Ngày bắt đầu: YYYY-MM-01
      const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;

      // Ngày kết thúc: Lấy ngày 0 của tháng sau (tức là ngày cuối của tháng này)
      const lastDay = new Date(year, month + 1, 0).getDate();
      const to = `${year}-${String(month + 1).padStart(2, "0")}-${lastDay}`;

      console.log(`📡 Fetching Stats: From ${from} to ${to}`);

      const res = await getFeedbackStats({
        classId: selectedClass,
        from,
        to,
      });

      setSummary(res.data.summary);
      setRanking(res.data.ranking || []);
    } catch (error) {
      console.error("Load stats error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (selectedClass) loadStats();
    }, [selectedClass, currentDate]) // Chạy lại khi đổi Lớp hoặc đổi Tháng
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadStats(true);
  };

  /* ================= CHART DATA PREPARATION ================= */
  const pieData = summary
    ? [
        {
          name: "Sao",
          population: summary.star || 0,
          color: "#FACC15",
          legendFontColor: "#374151",
          legendFontSize: 13,
        },
        {
          name: "Hoa",
          population: summary.flower || 0,
          color: "#F472B6",
          legendFontColor: "#374151",
          legendFontSize: 13,
        },
        {
          name: "Huy hiệu",
          population: summary.badge || 0,
          color: "#60A5FA",
          legendFontColor: "#374151",
          legendFontSize: 13,
        },
      ]
    : [];

  const topStudents = ranking.slice(0, 5);
  const chartValues = topStudents.map(
    (s) => (s.star || 0) + (s.flower || 0) + (s.badge || 0)
  );
  
  const barChartData = {
    labels: topStudents.map((s) => {
      const names = s.name.split(" ");
      return names.length > 0 ? names[names.length - 1] : s.name;
    }),
    datasets: [{ data: chartValues }],
  };

  const maxScore = Math.max(...chartValues, 1);
  const segments = maxScore < 5 ? maxScore : 4;

  /* ================= UI ================= */
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#10B981"]} />
      }
    >
      <Text style={styles.header}>📊 Thống kê thi đua</Text>

      {/* ===== CLASS PICKER ===== */}
      <View style={styles.card}>
        <Text style={styles.label}>Lớp học</Text>
        <Picker selectedValue={selectedClass} onValueChange={setSelectedClass}>
          {classes.map((c) => (
            <Picker.Item key={c._id} label={`${c.name} (${c.level})`} value={c._id} />
          ))}
        </Picker>
      </View>

      {/* ===== MONTH NAVIGATOR (MỚI) ===== */}
      <View style={styles.monthNavContainer}>
        <TouchableOpacity style={styles.navBtn} onPress={() => changeMonth(-1)}>
          <Text style={styles.navBtnText}>◀</Text>
        </TouchableOpacity>

        <View style={styles.monthDisplay}>
            <Text style={styles.monthText}>
                Tháng {currentDate.getMonth() + 1} / {currentDate.getFullYear()}
            </Text>
        </View>

        <TouchableOpacity style={styles.navBtn} onPress={() => changeMonth(1)}>
          <Text style={styles.navBtnText}>▶</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* ===== 1. PIE CHART ===== */}
          {summary && (summary.star + summary.flower + summary.badge > 0) ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>🎁 Tỷ lệ phần thưởng</Text>
              <PieChart
                data={pieData}
                width={screenWidth - 48}
                height={200}
                chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.empty}>Tháng này chưa có dữ liệu</Text>
            </View>
          )}

          {/* ===== 2. BAR CHART ===== */}
          {topStudents.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>🏆 Top 5 Bé Ngoan Tháng {currentDate.getMonth() + 1}</Text>
              <BarChart
                data={barChartData}
                width={screenWidth - 48}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                fromZero={true}
                segments={segments}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  barPercentage: 0.7,
                }}
                style={{ borderRadius: 16, marginVertical: 8 }}
                verticalLabelRotation={0}
              />
            </View>
          )}

          {/* ===== 3. DETAILED LIST ===== */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📋 Bảng xếp hạng chi tiết</Text>
            {ranking.length === 0 ? (
              <Text style={styles.empty}>Chưa có dữ liệu</Text>
            ) : (
              ranking.map((item, index) => (
                <View key={item.studentId} style={styles.rankRow}>
                  <View style={styles.rankIndexBox}>
                    <Text
                      style={[
                        styles.rankIndex,
                        index === 0 && { color: "#D97706", fontSize: 18 },
                        index === 1 && { color: "#9CA3AF", fontSize: 16 },
                        index === 2 && { color: "#B45309", fontSize: 16 },
                      ]}
                    >
                      #{index + 1}
                    </Text>
                  </View>
                  <Text style={styles.rankName}>{item.name}</Text>
                  <View style={styles.rankScoreBox}>
                    {item.star > 0 && <Text style={styles.scoreText}>⭐ {item.star}</Text>}
                    {item.flower > 0 && <Text style={styles.scoreText}>🌸 {item.flower}</Text>}
                    {item.badge > 0 && <Text style={styles.scoreText}>🏅 {item.badge}</Text>}
                    {item.star === 0 && item.flower === 0 && item.badge === 0 && (
                      <Text style={{ fontSize: 12, color: "#999" }}>-</Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
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
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontWeight: "700",
    marginBottom: 6,
    color: "#064E3B",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    color: "#064E3B",
  },
  
  // 👇 Style cho thanh điều hướng tháng
  monthNavContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 14,
    padding: 6,
    elevation: 1,
  },
  navBtn: {
    padding: 10,
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    width: 44,
    alignItems: 'center'
  },
  navBtnText: {
    fontSize: 18,
    color: "#065F46",
    fontWeight: "bold",
  },
  monthDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#065F46",
  },

  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
  },
  rankIndexBox: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  rankIndex: {
    fontWeight: "800",
    color: "#6B7280",
  },
  rankName: {
    flex: 1,
    fontWeight: "700",
    fontSize: 15,
    color: "#1F2937",
    marginLeft: 8,
  },
  rankScoreBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scoreText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  empty: {
    textAlign: "center",
    padding: 20,
    fontStyle: "italic",
    color: "#9CA3AF",
  },
});