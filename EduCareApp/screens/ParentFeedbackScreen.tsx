// screens/ParentFeedbackScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getMyChildren } from "../src/services/studentService";
import { getFeedbackByStudent } from "../src/services/feedbackService";

type FilterType = "today" | "week" | "month";

export default function ParentFeedbackScreen() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState<FilterType>("week");

  /* ================= LOAD CHILDREN ================= */
  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const res = await getMyChildren();
      const list = res.data || [];
      setChildren(list);
      if (list.length > 0) {
        setSelectedStudent(list[0]._id);
      }
    } catch (err) {
      console.log("❌ load children error", err);
    }
  };

  /* ================= LOAD FEEDBACK ================= */
  useEffect(() => {
    if (selectedStudent) {
      loadFeedback();
    }
  }, [selectedStudent]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const res = await getFeedbackByStudent(selectedStudent);
      
      // 🛠️ FIX 1: Kiểm tra kỹ cấu trúc dữ liệu trả về
      // Backend thường trả về { data: [...] } hoặc trực tiếp [...]
      const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
      
      console.log("✅ Loaded Feedbacks:", list.length);
      setFeedbacks(list);
    } catch (err) {
      console.log("❌ load feedback error", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER LOGIC ================= */
  const filteredFeedbacks = useMemo(() => {
    const now = new Date();
    // Reset giờ của 'now' về 00:00:00 để so sánh ngày chuẩn hơn
    now.setHours(0,0,0,0);

    return feedbacks.filter((f) => {
      // Chuyển đổi ngày từ chuỗi sang Date object
      const d = new Date(f.date); 
      d.setHours(0,0,0,0); // Reset giờ của ngày trong feedback

      if (filter === "today") {
        return d.getTime() === now.getTime();
      }

      if (filter === "week") {
        const dayOfWeek = now.getDay(); // 0 (Sun) -> 6 (Sat)
        const startOfWeek = new Date(now);
        // Tính ngày thứ 2 đầu tuần (hoặc CN tùy logic)
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        return d >= startOfWeek;
      }

      if (filter === "month") {
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }

      return true;
    });
  }, [feedbacks, filter]);

  const getActivityItem = (feedback: any) => {
    // Kiểm tra an toàn null/undefined
    const activityDate = feedback.activityDateId;
    if (!activityDate || !activityDate.activities) return null;

    return activityDate.activities.find(
      (i: any) => i._id === feedback.activityItemId
    );
  };

  return (
    <View style={styles.container}>

      {/* ===== CHILD PICKER ===== */}
      {children.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.label}>Chọn con</Text>
          <View style={styles.pickerWrap}>
            <Picker
                selectedValue={selectedStudent}
                onValueChange={setSelectedStudent}
                style={{ height: 50, width: '100%' }}
            >
                {children.map((c) => (
                <Picker.Item key={c._id} label={c.name} value={c._id} />
                ))}
            </Picker>
          </View>
        </View>
      )}

      {/* ===== FILTER TABS ===== */}
      <View style={styles.filterRow}>
        {[
          { key: "today", label: "Hôm nay" },
          { key: "week", label: "Tuần này" },
          { key: "month", label: "Tháng này" },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterBtn,
              filter === f.key && styles.filterActive,
            ]}
            onPress={() => setFilter(f.key as FilterType)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ===== LIST ===== */}
      {loading ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={filteredFeedbacks}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Image source={require('../assets/icons/feedback.png')} style={{width: 60, height: 60, opacity: 0.3, tintColor: 'gray'}} />
                <Text style={styles.empty}>Chưa có nhận xét nào trong thời gian này.</Text>
            </View>
          }
          renderItem={({ item }) => {
            // Lấy thông tin activity (nếu có)
            const activityItem = getActivityItem(item);

            return (
                <View style={styles.feedbackCard}>
                    {/* Header: Date & Reward */}
                    <View style={styles.rowBetween}>
                        <Text style={styles.date}>📅 {new Date(item.date).toLocaleDateString('vi-VN')}</Text>

                        {item.reward && item.reward !== "none" && (
                            <View style={styles.rewardBadge}>
                                <Text style={styles.rewardText}>
                                {item.reward === "star" && "⭐ "}
                                {item.reward === "flower" && "🌸 "}
                                {item.reward === "badge" && "🏅 "}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Activity Section (Chỉ hiện nếu tìm thấy activity) */}
                    {activityItem ? (
                        <View style={styles.activityBox}>
                            <Text style={styles.activityTitle}>📘 {activityItem.title}</Text>
                            <Text style={styles.activityTime}>
                                ⏰ {activityItem.startTime} – {activityItem.endTime}
                            </Text>
                        </View>
                    ) : (
                        // Fallback nếu không có link activity (Vẫn hiện card)
                        <View style={[styles.activityBox, {backgroundColor: '#F3F4F6'}]}>
                             <Text style={{color: '#666', fontStyle: 'italic'}}>Hoạt động chung</Text>
                        </View>
                    )}

                    {/* Comment Content */}
                    <View style={styles.commentBox}>
                        <Text style={styles.commentLabel}>Cô giáo nhận xét:</Text>
                        <Text style={styles.comment}>
                            "{item.comment || "Không có lời nhận xét cụ thể."}"
                        </Text>
                    </View>

                    {/* Footer: Teacher Name */}
                    <View style={styles.footer}>
                        <Text style={styles.teacher}>
                        👩‍🏫 GV: {item.teacherId?.name || "Giáo viên"}
                        </Text>
                    </View>
                </View>
            );
          }}
        />
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    elevation: 2,
  },
  label: {
    fontWeight: "700",
    marginBottom: 6,
    color: "#064E3B",
  },
  pickerWrap: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  filterActive: {
    backgroundColor: "#10B981",
    borderColor: '#10B981'
  },
  filterText: {
    fontWeight: "600",
    color: "#6B7280",
    fontSize: 13
  },
  filterTextActive: {
    color: "#fff",
  },
  feedbackCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  date: {
    fontWeight: "700",
    color: "#374151",
    fontSize: 15
  },
  rewardBadge: {
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
  },
  rewardText: {
    fontWeight: "700",
    color: "#D97706",
    fontSize: 12
  },
  activityBox: {
    padding: 10,
    backgroundColor: "#ECFDF5",
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981'
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#065F46",
  },
  activityTime: {
    fontSize: 13,
    color: "#047857",
    marginTop: 2,
  },
  commentBox: {
      marginBottom: 8
  },
  commentLabel: {
      fontSize: 12,
      color: '#9CA3AF',
      marginBottom: 2
  },
  comment: {
    fontSize: 15,
    color: "#1F2937",
    fontStyle: 'italic',
    lineHeight: 22
  },
  footer: {
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
      paddingTop: 8,
      marginTop: 4
  },
  teacher: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: '500'
  },
  emptyContainer: {
      alignItems: 'center',
      marginTop: 60
  },
  empty: {
    marginTop: 16,
    fontStyle: "italic",
    color: "#9CA3AF",
  },
});