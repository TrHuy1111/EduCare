import React, { useEffect, useState ,useCallback} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import { getTeacherClasses } from "../src/services/attendanceService";
import { getActivities } from "../src/services/activityService";
import { Picker } from "@react-native-picker/picker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TeacherStackParamList } from "../navigation/TeacherNavigator";

export default function TeacherActivitiesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🟢 Load class list theo giáo viên đang login
  useEffect(() => {
    loadTeacherClasses();
  }, []);
  useFocusEffect(
  useCallback(() => {
    if (selectedClass) {
      loadActivities();  // 🔥 Auto reload khi quay lại
    }
  }, [selectedClass, selectedDate])
);
  const loadTeacherClasses = async () => {
    try {
      const res = await getTeacherClasses();
      setClasses(res.data || []);

      // Auto-select first class
      if (res.data?.length > 0) {
        setSelectedClass(res.data[0]._id);
      }
    } catch (err) {
      console.error("Lỗi lấy lớp giáo viên:", err);
    }
  };

  // 🟢 Load activities khi chọn lớp hoặc ngày
  useEffect(() => {
    if (selectedClass) loadActivities();
  }, [selectedClass, selectedDate]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const res = await getActivities(selectedClass!, selectedDate);
      setActivities(res.data?.activities || []);
    } catch (err) {
      console.error("Lỗi load activities:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderActivity = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.time}>{item.startTime} - {item.endTime}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.location}>📍 {item.location}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Activities</Text>

      {/* CLASS DROPDOWN */}
      <Text style={styles.label}>Choose class</Text>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={selectedClass}
                onValueChange={(value: string) => setSelectedClass(value)}
              >
                <Picker.Item label="-- Chọn lớp --" value="" />
                {classes.map((c) => (
                  <Picker.Item
                    key={c._id}
                    label={`${c.name} (${c.level})`}
                    value={c._id}
                  />
                ))}
              </Picker>
            </View>

      {/* CALENDAR */}
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: "#2bbf9a" },
        }}
        style={styles.calendar}
      />

      {/* ACTIVITIES LIST */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivity}
          keyExtractor={(_, i) => i.toString()}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 16 }}>
              No activities for today.
            </Text>
          }
        />
      )}

      {/* BUTTON EDIT */}
      {selectedClass && (
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() =>
            navigation.navigate("EditActivitiesScreen", {
              classId: selectedClass,
              date: selectedDate,
            })
          }
        >
          <Text style={styles.editText}>Edit activity</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6FDF3", padding: 16 },
  header: { fontSize: 22, fontWeight: "700", color: "#064E3B", marginBottom: 10 },

  dropdown: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  dropdownText: { fontSize: 16 },

  calendar: {
    borderRadius: 12,
    marginBottom: 14,
  },

  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  time: { color: "#064E3B", fontWeight: "700" },
  title: { fontSize: 15, marginTop: 3, color: "#047857" },
  location: { fontSize: 13, marginTop: 2, color: "#444" },

  editBtn: {
    backgroundColor: "#10B981",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  editText: { color: "#fff", fontWeight: "700" },
  label: {
    fontSize: 15,
    marginBottom: 6,
    color: "#064E3B",
    fontWeight: "600",
  },
  pickerBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 16,
  },
});
