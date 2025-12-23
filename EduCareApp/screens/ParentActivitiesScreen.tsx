import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getMyChildren } from "../src/services/studentService";
import { getActivities } from "../src/services/activityService";

/* ================= HELPERS ================= */
const getMonday = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - ((day + 6) % 7));
  return d;
};

const formatDateLabel = (date: string) =>
  new Date(date).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });

/* ================= SCREEN ================= */
export default function ParentActivitiesScreen() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  const [weekStart, setWeekStart] = useState<Date>(() =>
    getMonday(new Date())
  );
  const [activitiesMap, setActivitiesMap] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // 🔥 cache để back / next tuần không lag
  const cacheRef = useRef<{ [key: string]: any }>({});

  /* ===== WEEK DATES ===== */
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  }, [weekStart]);

  /* ===== LOAD CHILDREN ===== */
  useEffect(() => {
    (async () => {
      try {
        const res = await getMyChildren();
        const list = res.data || [];
        setChildren(list);

        if (list.length > 0) {
          const first = list[0];
          setSelectedStudent(first._id);
          setSelectedClass(
            typeof first.classId === "string"
              ? { _id: first.classId }
              : first.classId
          );
        }
      } catch {}
    })();
  }, []);

  /* ===== LOAD ACTIVITIES ===== */
  useEffect(() => {
    if (!selectedClass?._id) return;

    const key = `${selectedClass._id}-${weekDates[0]}`;
    if (cacheRef.current[key]) {
      setActivitiesMap(cacheRef.current[key]);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);

        const responses = await Promise.all(
          weekDates.map((d) => getActivities(selectedClass._id, d))
        );

        const map: any = {};
        weekDates.forEach((date, i) => {
          map[date] =
            responses[i].data?.activities ||
            responses[i].data?.data?.activities ||
            [];
        });

        cacheRef.current[key] = map;
        setActivitiesMap(map);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedClass, weekDates]);

  /* ================= UI ================= */
  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 80 }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📅 Hoạt động của bé</Text>

      {/* ===== SELECT CHILD ===== */}
      {children.length > 1 && (
        <View style={styles.card}>
          <Text style={styles.label}>Chọn con</Text>
          <Picker
            selectedValue={selectedStudent}
            onValueChange={(v) => {
              const child = children.find((c) => c._id === v);
              setSelectedStudent(v);
              setSelectedClass(
                typeof child.classId === "string"
                  ? { _id: child.classId }
                  : child.classId
              );
            }}
          >
            {children.map((c) => (
              <Picker.Item
                key={c._id}
                label={`${c.name} (${c.classId?.name})`}
                value={c._id}
              />
            ))}
          </Picker>
        </View>
      )}

      {/* ===== WEEK NAV ===== */}
      <View style={styles.weekNav}>
        <TouchableOpacity
          onPress={() =>
            setWeekStart((d) => new Date(d.setDate(d.getDate() - 7)))
          }
        >
          <Text style={styles.weekBtn}>◀ Tuần trước</Text>
        </TouchableOpacity>

        <Text style={styles.weekTitle}>
          Tuần {formatDateLabel(weekDates[0])}
        </Text>

        <TouchableOpacity
          onPress={() =>
            setWeekStart((d) => new Date(d.setDate(d.getDate() + 7)))
          }
        >
          <Text style={styles.weekBtn}>Tuần sau ▶</Text>
        </TouchableOpacity>
      </View>

      {/* ===== ACTIVITIES ===== */}
      {weekDates.map((date) => {
        const list = activitiesMap[date] || [];
        const has = list.length > 0;

        return (
          <View key={date} style={styles.dayBlock}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{formatDateLabel(date)}</Text>
              {has && <View style={styles.dot} />}
            </View>

            {!has ? (
              <Text style={styles.empty}>— Không có hoạt động —</Text>
            ) : (
              list.map((a: any, idx: number) => (
                <View key={idx} style={styles.timelineRow}>
                  <View style={styles.timeCol}>
                    <Text style={styles.time}>{a.startTime}</Text>
                    <Text style={styles.timeSub}>{a.endTime}</Text>
                  </View>

                  <View style={styles.line} />

                  <View style={styles.activityCard}>
                    <Text style={styles.title}>{a.title}</Text>
                    <Text style={styles.location}>📍 {a.location}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#E6FDF3" },

  header: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
    color: "",
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },

  label: { fontWeight: "600", marginBottom: 6 },

  weekNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  weekBtn: {
    color: "#047857",
    fontWeight: "700",
  },

  weekTitle: {
    fontWeight: "700",
    color: "#064E3B",
  },

  dayBlock: { marginBottom: 18 },

  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  dayTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#047857",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginLeft: 8,
  },

  timelineRow: {
    flexDirection: "row",
    marginBottom: 12,
  },

  timeCol: {
    width: 60,
    alignItems: "flex-end",
  },

  time: {
    fontWeight: "700",
    color: "#064E3B",
  },

  timeSub: {
    fontSize: 12,
    color: "#6B7280",
  },

  line: {
    width: 2,
    backgroundColor: "#10B981",
    marginHorizontal: 10,
    borderRadius: 1,
  },

  activityCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
  },

  title: {
    fontSize: 15,
    color: "#047857",
    fontWeight: "600",
  },

  location: {
    fontSize: 13,
    marginTop: 2,
    color: "#444",
  },

  empty: {
    fontStyle: "italic",
    color: "#9CA3AF",
  },
});
