// screens/AdminTuitionStatsScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { getTuitionStats } from "../src/services/tuitionService";
import { useNavigation } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;

export default function AdminTuitionStatsScreen() {
  const navigation = useNavigation();
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0); // Tổng thực thu cả năm

  useEffect(() => {
    loadStats();
  }, [year]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await getTuitionStats(year);
      setData(res.data);
      
      // Tính tổng doanh thu thực tế cả năm
      const total = res.data.reduce((sum: number, item: any) => sum + item.paid, 0);
      setTotalRevenue(total);

    } catch (err) {
      console.log("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Chuẩn bị data cho Chart (Chỉ hiện tiền Đã thu - Paid)
  const chartData = {
    labels: data.map(d => d.month), // ["T1", "T2", ...]
    datasets: [
      {
        data: data.map(d => d.paid / 1000000), // Chia cho 1 triệu để số nhỏ gọn trên biểu đồ
      }
    ]
  };

  return (
    <ScrollView style={styles.container}>
      
      {/* Year Filter */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.arrowBtn} onPress={() => setYear(year - 1)}>
          <Text style={styles.arrowText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.yearText}>Năm {year}</Text>
        <TouchableOpacity style={styles.arrowBtn} onPress={() => setYear(year + 1)}>
          <Text style={styles.arrowText}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Tổng quan */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Tổng thực thu năm {year}</Text>
        <Text style={styles.summaryValue}>
          {totalRevenue.toLocaleString()} VND
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#10B981" style={{marginTop: 30}} />
      ) : (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Doanh thu thực tế (Triệu VNĐ)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={chartData}
              width={screenWidth + 100} 
              height={250}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 1, 
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, 
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                barPercentage: 0.6,
              }}
              style={{ borderRadius: 16 }}
              showValuesOnTopOfBars 
            />
          </ScrollView>
        </View>
      )}

      {/* Chi tiết từng tháng (Table nhỏ) */}
      <View style={styles.table}>
        <View style={[styles.row, styles.headerRowTable]}>
          <Text style={[styles.cell, {flex: 0.5, fontWeight: 'bold'}]}>Tháng</Text>
          <Text style={[styles.cell, {fontWeight: 'bold', color: '#10B981'}]}>Đã thu</Text>
          <Text style={[styles.cell, {fontWeight: 'bold', color: '#F59E0B'}]}>Chưa thu</Text>
        </View>
        {data.map((item, index) => (
          <View key={index} style={[styles.row, index % 2 === 0 && {backgroundColor: '#f9fafb'}]}>
            <Text style={[styles.cell, {flex: 0.5, fontWeight: 'bold'}]}>{item.month}</Text>
            <Text style={styles.cell}>{item.paid.toLocaleString()}</Text>
            <Text style={styles.cell}>{item.pending.toLocaleString()}</Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ecfdf5", padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20},
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#064E3B' },
  
  filterRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  arrowBtn: { padding: 10, backgroundColor: "#d1fae5", borderRadius: 8, marginHorizontal: 15 },
  arrowText: { fontSize: 18, color: "#065f46", fontWeight: "bold" },
  yearText: { fontSize: 20, fontWeight: "800", color: "#065f46" },

  summaryCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 20,
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
  },
  summaryLabel: { fontSize: 16, color: '#6b7280', marginBottom: 5 },
  summaryValue: { fontSize: 24, fontWeight: 'bold', color: '#10B981' },

  chartContainer: {
    backgroundColor: '#fff', borderRadius: 16, padding: 10, marginBottom: 20,
    elevation: 2
  },
  chartTitle: { textAlign: 'center', fontWeight: 'bold', marginBottom: 10, color: '#374151'},

  table: { backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 40 },
  row: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerRowTable: { backgroundColor: '#ecfdf5', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  cell: { flex: 1, textAlign: 'center', fontSize: 13, color: '#374151' }
});