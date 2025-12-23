// TeacherFeedbackScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Calendar } from "react-native-calendars";

import {
  getTeacherClasses,
  getStudentsByClass,
} from "../src/services/attendanceService";
import { getActivities } from "../src/services/activityService";
import FeedbackModal from "./components/FeedbackModal";

export default function TeacherFeedbackScreen() {
  /* ================= STATE ================= */
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // 👉 Activity document của ngày (chỉ 1)
  const [activityDate, setActivityDate] = useState<any>(null);

  // 👉 Activity con trong activities[]
  const [selectedActivityItem, setSelectedActivityItem] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  /* ================= LOAD CLASSES ================= */
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const res = await getTeacherClasses();
    const list = res.data || [];
    setClasses(list);
    if (list.length > 0) {
      setSelectedClass(list[0]._id);
    }
  };

  /* ================= LOAD DATA BY CLASS + DATE ================= */
  useEffect(() => {
    if (selectedClass) {
      loadData();
    }
  }, [selectedClass, selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [activityRes, studentRes] = await Promise.all([
        getActivities(selectedClass, selectedDate),
        getStudentsByClass(selectedClass),
      ]);

      // 👇 activityDate = 1 document duy nhất (hoặc null)
      setActivityDate(activityRes.data || null);
      setStudents(studentRes.data || []);

      // reset activity con khi đổi ngày / lớp
      setSelectedActivityItem(null);
    } finally {
      setLoading(false);
    }
  };

  const openFeedback = (student: any) => {
  if (!activityDate || !selectedActivityItem) {
    Alert.alert(
      "Thiếu thông tin",
      "Vui lòng chọn hoạt động trước khi đánh giá"
    );
    return;
  }

  setSelectedStudent(student);
  setShowModal(true);
};

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      <Text style={styles.header}>🌟 Đánh giá học sinh</Text>

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

      {/* ===== CALENDAR ===== */}
      <Calendar
        onDayPress={(d) => setSelectedDate(d.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: "#10B981" },
        }}
        style={styles.calendar}
      />

      {/* ===== ACTIVITY ITEMS IN DAY ===== */}
      {activityDate ? (
        <View style={styles.card}>
          <Text style={styles.label}>Hoạt động trong ngày</Text>

          <Picker
            selectedValue={selectedActivityItem?._id}
            onValueChange={(v) => {
              const item = activityDate.activities.find(
                (i: any) => i._id === v
              );
              setSelectedActivityItem(item);
            }}
          >
            <Picker.Item label="-- Chọn hoạt động --" value="" />

            {activityDate.activities.map((item: any) => (
              <Picker.Item
                key={item._id}
                value={item._id}
                label={`${item.startTime} - ${item.title}`}
              />
            ))}
          </Picker>
        </View>
      ) : (
        <Text style={styles.empty}>Không có hoạt động trong ngày này</Text>
      )}

      {/* ===== STUDENT LIST ===== */}
      {!selectedActivityItem ? (
        <Text style={styles.empty}>
          Vui lòng chọn hoạt động để đánh giá học sinh
        </Text>
      ) : loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <>
          {/* Header row */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, { flex: 1 }]}>
              Student Name
            </Text>
            <Text style={styles.headerText}>Feedback</Text>
          </View>

          <FlatList
            data={students}
            keyExtractor={(i) => i._id}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => (
              <View style={styles.studentRow}>
                <Image
                  source={
                    item.avatar
                      ? { uri: item.avatar }
                      : require("../assets/icons/student.png")
                  }
                  style={styles.avatar}
                />

                <View style={{ flex: 1 }}>
                  <Text style={styles.studentName}>{item.name}</Text>
                </View>

                <TouchableOpacity
                  style={styles.feedbackBtn}
                  onPress={() => openFeedback(item)}
                >
                  <Text style={styles.feedbackText}>Feedback</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      )}

      {/* ===== FEEDBACK MODAL ===== */}
      <FeedbackModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        student={selectedStudent}
        classId={selectedClass}
        activityDate={activityDate}
        activityItem={selectedActivityItem}
        date={selectedDate}
      />
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

  label: {
    fontWeight: "700",
    marginBottom: 6,
    color: "#064E3B",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },

  calendar: {
    borderRadius: 14,
    marginBottom: 14,
  },

  headerRow: {
    flexDirection: "row",
    backgroundColor: "#7873C0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  headerText: {
    color: "#fff",
    fontWeight: "700",
  },

  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 14,
  },

  studentName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#064E3B",
  },

  feedbackBtn: {
    backgroundColor: "#10B981",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 18,
  },

  feedbackText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#6B7280",
    fontStyle: "italic",
  },
});
