import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TeacherStackParamList } from "../navigation/TeacherNavigator";

import { getActivities, saveActivities } from "../src/services/activityService";

type Props = NativeStackScreenProps<
  TeacherStackParamList,
  "EditActivitiesScreen"
>;

export default function EditActivitiesScreen({ route, navigation }: Props) {
  const { classId, date } = route.params;

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // GLOBAL PICKER STATE (FIX)
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pickerMode, setPickerMode] = useState<"start" | "end" | null>(null);

  const locations = ["Classroom", "Playground", "Canteen", "Garden"];

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const res = await getActivities(classId, date);
      const list = (res.data?.activities || []).map((a: any, i: number) => ({
        ...a,
        id: a._id || `local-${i}-${Date.now()}`,
      }));
      setActivities(list);
    } catch (err) {
      console.log("❌ Error loading activities:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (index: number, key: string, value: any) => {
    const arr = [...activities];
    arr[index] = { ...arr[index], [key]: value };
    setActivities(arr);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const arr = [...activities];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    setActivities(arr);
  };

  const moveDown = (index: number) => {
    if (index === activities.length - 1) return;
    const arr = [...activities];
    [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
    setActivities(arr);
  };

  const addActivity = () => {
    setActivities((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        startTime: "08:00",
        endTime: "09:00",
        location: "Classroom",
        title: "",
      },
    ]);
  };

  const deleteActivity = (index: number) => {
    setActivities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await saveActivities({ classId, date, activities });
      Alert.alert("Success", "Activities saved!");
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Could not save activities");
    }
  };

  const renderItem = ({ item, index }: any) => (
  <View style={styles.card}>

    {/* NEW: ROW CHỨA MŨI TÊN & DELETE */}
    <View style={styles.topRow}>
      <View style={styles.arrowGroup}>
        <TouchableOpacity onPress={() => moveUp(index)}>
          <Text style={styles.arrow}>⬆</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => moveDown(index)}>
          <Text style={styles.arrow}>⬇</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => deleteActivity(index)}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>X</Text>
      </TouchableOpacity>
    </View>

    <Text style={styles.cardHeader}>Activity {index + 1}</Text>

    {/* TIME ROW */}
    <View style={styles.timeRow}>
      <TouchableOpacity
        style={styles.timeBox}
        onPress={() => {
          setActiveIndex(index);
          setPickerMode("start");
        }}
      >
        <Text style={styles.timeLabel}>Start</Text>
        <Text style={styles.timeValue}>{item.startTime}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.timeBox}
        onPress={() => {
          setActiveIndex(index);
          setPickerMode("end");
        }}
      >
        <Text style={styles.timeLabel}>End</Text>
        <Text style={styles.timeValue}>{item.endTime}</Text>
      </TouchableOpacity>
    </View>

    <Text style={styles.label}>Location</Text>
    <View style={styles.pickerBox}>
      <Picker
        selectedValue={item.location}
        onValueChange={(v) => updateField(index, "location", v)}
      >
        {locations.map((loc) => (
          <Picker.Item key={loc} label={loc} value={loc} />
        ))}
      </Picker>
    </View>

    <Text style={styles.label}>Activity</Text>
    <TextInput
      style={styles.input}
      placeholder="Enter activity"
      value={item.title}
      onChangeText={(t) => updateField(index, "title", t)}
    />

  </View>
);

  // GLOBAL PICKER RENDER — FIXES THE BUG
  const renderGlobalPicker = () => {
  if (pickerMode === null || activeIndex === null) return null;

  return (
    <DateTimePicker
      mode="time"
      value={new Date()}
      is24Hour={true}
      onChange={(event, selectedDate) => {
        if (event.type === "dismissed") {
          setPickerMode(null);
          setActiveIndex(null);
          return;
        }

        if (!selectedDate) return; // ✅ FIX TYPE 'undefined'

        const h = selectedDate.getHours().toString().padStart(2, "0");
        const m = selectedDate.getMinutes().toString().padStart(2, "0");
        const formatted = `${h}:${m}`;

        if (pickerMode === "start") {
          updateField(activeIndex, "startTime", formatted);
        } else {
          updateField(activeIndex, "endTime", formatted);
        }

        setPickerMode(null);
        setActiveIndex(null);
      }}
    />
  );
};


  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Activities</Text>

      <FlatList
        data={activities}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />

      <TouchableOpacity style={styles.addBtn} onPress={addActivity}>
        <Text style={styles.addText}>＋ Add Activity</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save All</Text>
      </TouchableOpacity>

      {/* GLOBAL PICKER FIX */}
      {renderGlobalPicker()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFFFFA", padding: 16 },

  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#00856F",
    marginBottom: 14,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  moveRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 6,
  },
  arrow: {
  fontSize: 25,
  color: "#5A5A5A",
  
},

  cardHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007965",
    marginBottom: 10,
  },

  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 10,
  },

  timeBox: {
    backgroundColor: "#E0FFF4",
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 18,
    width: "48%",
  },

  timeLabel: {
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 2,
  },

  timeValue: {
    fontSize: 17,
    fontWeight: "600",
    color: "#064E3B",
  },

  label: {
    marginTop: 10,
    fontWeight: "600",
    color: "#00856F",
    marginBottom: 4,
  },

  pickerBox: {
    backgroundColor: "#E0FFF4",
    borderRadius: 50,
    borderWidth: 0,
    paddingHorizontal: 10,
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#E0FFF4",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 50,
    marginTop: 4,
    fontSize: 15,
  },
  topRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
},
  arrowGroup: {
  flexDirection: "row",
  gap: 8,
},
  deleteBtn: {
  backgroundColor: "#FF4D4D",
  width: 36,
  height: 36,
  borderRadius: 18,
  justifyContent: "center",
  alignItems: "center",
},

  addBtn: {
    backgroundColor: "#52A7FF",
    padding: 14,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 12,
  },
  addText: { color: "white", fontWeight: "700", fontSize: 16 },

  saveBtn: {
    backgroundColor: "#0EB98F",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 17 },
});
