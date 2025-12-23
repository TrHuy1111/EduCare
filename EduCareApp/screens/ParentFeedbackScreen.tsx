import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
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
        console.log("FEEDBACK RAW:", res.data);
        setFeedbacks(res.data || []);
    } catch (err) {
      console.log("❌ load feedback error", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER LOGIC ================= */
  const filteredFeedbacks = useMemo(() => {
    const now = new Date();

    return feedbacks.filter((f) => {
      const d = new Date(f.date);

      if (filter === "today") {
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }

      if (filter === "week") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
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
  const activityDate = feedback.activityDateId;
  if (!activityDate || !activityDate.activities) return null;

  return activityDate.activities.find(
    (i: any) => i._id === feedback.activityItemId
  );
};

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      <Text style={styles.header}>💬 Nhận xét của bé</Text>

      {/* ===== CHILD PICKER ===== */}
      {children.length > 1 && (
        <View style={styles.card}>
          <Text style={styles.label}>Chọn con</Text>
          <Picker
            selectedValue={selectedStudent}
            onValueChange={setSelectedStudent}
          >
            {children.map((c) => (
              <Picker.Item key={c._id} label={c.name} value={c._id} />
            ))}
          </Picker>
        </View>
      )}

      {/* ===== FILTER ===== */}
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
        <ActivityIndicator style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={filteredFeedbacks}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={styles.empty}>Chưa có nhận xét</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.feedbackCard}>
                {/* Date + Reward */}
                <View style={styles.rowBetween}>
                <Text style={styles.date}>{item.date}</Text>

                {item.reward !== "none" && (
                    <Text style={styles.reward}>
                    {item.reward === "star" && "⭐ Sao"}
                    {item.reward === "flower" && "🌸 Hoa hồng"}
                    {item.reward === "badge" && "🏅 Huy hiệu"}
                    </Text>
                )}
                </View>

                {/* Activity */}
                {(() => {
  const activityItem = getActivityItem(item);
  if (!activityItem) return null;

  return (
    <View style={styles.activityBox}>
      <Text style={styles.activityTitle}>
        📘 {activityItem.title}
      </Text>
      <Text style={styles.activityTime}>
        ⏰ {activityItem.startTime} – {activityItem.endTime}
      </Text>
    </View>
  );
})()}

                {/* Comment */}
                <Text style={styles.comment}>
                {item.comment || "Không có nhận xét"}
                </Text>

                {/* Teacher */}
                <Text style={styles.teacher}>
                👩‍🏫 {item.teacherId?.name || "Giáo viên"}
                </Text>
            </View>
            )}
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

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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

  feedbackCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  date: {
    fontWeight: "700",
    color: "#064E3B",
  },

  reward: {
    fontWeight: "700",
    color: "#10B981",
  },

  comment: {
    marginTop: 6,
    fontSize: 14,
    color: "#374151",
  },

  teacher: {
    marginTop: 6,
    fontSize: 12,
    color: "#6B7280",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    fontStyle: "italic",
    color: "#9CA3AF",
  },
  activityBox: {
  marginTop: 6,
  paddingVertical: 6,
  paddingHorizontal: 8,
  backgroundColor: "#ECFDF5",
  borderRadius: 8,
},

activityTitle: {
  fontSize: 14,
  fontWeight: "700",
  color: "#065F46",
},

activityTime: {
  fontSize: 12,
  color: "#047857",
  marginTop: 2,
},
});
