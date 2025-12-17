// EduCareApp/screens/EditActivitiesScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/Feather";
import LinearGradient from "react-native-linear-gradient"; // optional, remove import if not installed

import { TeacherStackParamList } from "../navigation/TeacherNavigator";
import { getActivities, saveActivities } from "../src/services/activityService";

type Props = NativeStackScreenProps<
  TeacherStackParamList,
  "EditActivitiesScreen"
>;

// enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function EditActivitiesScreen({ route, navigation }: Props) {
  const { classId, date } = route.params;

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Which card + which picker (start/end) is active
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pickerMode, setPickerMode] = useState<"start" | "end" | null>(null);

  const locations = ["Classroom", "Playground", "Canteen", "Garden"];

  // Animated values per item (for mount animation)
  const itemAnim = useRef<Record<string, Animated.Value>>({}).current;

  useEffect(() => {
    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const res = await getActivities(classId, date);
      const list = (res.data?.activities || []).map((a: any, i: number) => ({
        // normalize id for FlatList key
        id: a._id || `local-${i}-${Date.now()}`,
        startTime: a.startTime || "08:00",
        endTime: a.endTime || "09:00",
        location: a.location || "Classroom",
        title: a.title || "",
        // keep any other props if needed
        ...a,
      }));
      // prepare anim values
      list.forEach((it: any) => {
        if (!itemAnim[it.id]) itemAnim[it.id] = new Animated.Value(0);
      });
      setActivities(list);
      // animate in
      setTimeout(() => {
        list.forEach((it: any, idx: number) => {
          Animated.timing(itemAnim[it.id], {
            toValue: 1,
            duration: 240,
            delay: idx * 80,
            useNativeDriver: true,
          }).start();
        });
      }, 50);
    } catch (err) {
      console.log("❌ Error loading activities:", err);
      Alert.alert("Error", "Could not load activities");
    } finally {
      setLoading(false);
    }
  };

  // helper: trigger layout animation
  const animateLayout = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(220, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity)
    );
  };

  const updateField = (index: number, key: string, value: any) => {
    setActivities(prev => {
      const clone = [...prev];
      // safety
      if (!clone[index]) return prev;
      clone[index] = { ...clone[index], [key]: value };
      return clone;
    });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    animateLayout();
    setActivities(prev => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  };

  const moveDown = (index: number) => {
    setActivities(prev => {
      if (index >= prev.length - 1) return prev;
      animateLayout();
      const arr = [...prev];
      [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
      return arr;
    });
  };

  const addActivity = () => {
    animateLayout();
    const id = `new-${Date.now()}`;
    itemAnim[id] = new Animated.Value(0);
    const newItem = {
      id,
      startTime: "08:00",
      endTime: "09:00",
      location: "Classroom",
      title: "",
    };
    setActivities(prev => {
      const next = [...prev, newItem];
      // animate newly pushed item
      setTimeout(() => {
        Animated.timing(itemAnim[id], {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }).start();
      }, 80);
      return next;
    });
  };

  const deleteActivity = (index: number) => {
    animateLayout();
    const id = activities[index]?.id;
    // small fade out animation before removing
    if (id && itemAnim[id]) {
      Animated.timing(itemAnim[id], {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        setActivities(prev => prev.filter((_, i) => i !== index));
      });
    } else {
      setActivities(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    try {
      await saveActivities({ classId, date, activities });
      Alert.alert("Success", "Activities saved!");
      navigation.goBack();
    } catch (err) {
      console.log("save err", err);
      Alert.alert("Error", "Could not save activities");
    }
  };

  // each item render
  const renderItem = ({ item, index }: any) => {
    const anim = itemAnim[item.id] ?? new Animated.Value(1);
    const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });
    const opacity = anim;

    return (
      <Animated.View
        style={[
          styles.card,
          { transform: [{ translateY }], opacity },
        ]}
      >
        {/* top row: arrows left, delete right */}
        <View style={styles.topRow}>
          <View style={styles.arrowGroup}>
            <TouchableOpacity onPress={() => moveUp(index)} style={styles.iconBtn}>
              <Icon name="chevron-up" size={20} color="#2b2b2b" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => moveDown(index)} style={styles.iconBtn}>
              <Icon name="chevron-down" size={20} color="#2b2b2b" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => deleteActivity(index)} style={styles.deleteBtn}>
            <Icon name="x" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.cardHeader}>Activity {index + 1}</Text>

        {/* time row */}
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
            dropdownIconColor="#007965"
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
      </Animated.View>
    );
  };

  // global picker (single instance) to avoid multiple pickers open
  const renderGlobalPicker = () => {
    if (pickerMode === null || activeIndex === null) return null;

    // initial time: parse existing item's start/end time
    const initialTimeStr =
      pickerMode === "start"
        ? activities[activeIndex]?.startTime
        : activities[activeIndex]?.endTime;

    // create Date from hh:mm string
    const baseDate = new Date();
    if (initialTimeStr && typeof initialTimeStr === "string") {
      const [hh, mm] = initialTimeStr.split(":").map((s: string) => Number(s));
      if (!isNaN(hh) && !isNaN(mm)) {
        baseDate.setHours(hh, mm, 0, 0);
      }
    }

    return (
      <DateTimePicker
        mode="time"
        value={baseDate}
        is24Hour={true}
        display={Platform.OS === "ios" ? "spinner" : "default"}
        onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
          // event.type exists on Android, on iOS event is always 'set' or 'dismissed'
          // handle dismiss
          const type = (event as any)?.type;
          if (type === "dismissed") {
            setPickerMode(null);
            setActiveIndex(null);
            return;
          }
          if (!selectedDate) {
            setPickerMode(null);
            setActiveIndex(null);
            return;
          }
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
      {/* header with subtle gradient */}
      <LinearGradient
        colors={["#E9FFF6", "#E0FFF4"]}
        style={styles.headerWrap}
      >
        <Text style={styles.header}>Edit Activities</Text>
      </LinearGradient>

      <FlatList
        data={activities}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 28 }}
      />

      <TouchableOpacity style={styles.addBtn} onPress={addActivity}>
        <LinearGradient
          colors={["#66B7FF", "#3B82F6"]}
          style={styles.addInner}
        >
          <Icon name="plus" size={18} color="#fff" />
          <Text style={styles.addText}> Add Activity</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <LinearGradient colors={["#2ECC96", "#0EB98F"]} style={styles.saveInner}>
          <Text style={styles.saveText}>Save All</Text>
        </LinearGradient>
      </TouchableOpacity>

      {renderGlobalPicker()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFFFFA", padding: 14 },

  headerWrap: {
    borderRadius: 12,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#007965",
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  arrowGroup: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBtn: {
    marginHorizontal: 6,
    padding: 6,
    borderRadius: 8,
  },

  deleteBtn: {
    backgroundColor: "#FF5A5A",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },

  cardHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: "#007965",
    marginBottom: 8,
  },

  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },

  timeBox: {
    backgroundColor: "#E0FFF4",
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 18,
    width: "48%",
  },

  timeLabel: { color: "#6B7280", fontSize: 12, marginBottom: 2 },

  timeValue: { fontSize: 17, fontWeight: "700", color: "#064E3B" },

  label: { marginTop: 6, fontWeight: "600", color: "#007965", marginBottom: 6 },

  pickerBox: {
    backgroundColor: "#E0FFF4",
    borderRadius: 40,
    overflow: "hidden",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#E0FFF4",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 40,
    marginTop: 4,
    fontSize: 15,
  },

  addBtn: {
    marginTop: 10,
    borderRadius: 18,
    overflow: "hidden",
  },

  addInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },

  addText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  saveBtn: {
    marginTop: 10,
    borderRadius: 18,
    overflow: "hidden",
  },

  saveInner: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
