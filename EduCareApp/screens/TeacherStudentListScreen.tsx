// TeacherStudentListScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import { getAllStudents } from "../src/services/studentService";
import { TeacherStackParamList } from "../navigation/TeacherNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function TeacherStudentListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();
  const route = useRoute();

  // 🟢 State luôn nằm trên
  const [students, setStudents] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // 🟢 Hooks khác (useMemo) luôn đặt SAU useState
  const filters = React.useMemo(() => {
    return (route.params as any)?.filters || {};
  }, [route.params]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, search, students]);

  const loadData = async () => {
    const res = await getAllStudents();
    setStudents(res.data || []);
  };

  const applyFilters = () => {
  let data = [...students];

  if (filters.gender) {
    data = data.filter((s) => s.gender === filters.gender);
  }

  if (filters.ageRange) {
    data = data.filter((s) => s.ageRange === filters.ageRange);
  }

  if (filters.weightRange) {
  data = data.filter((s) =>
    s.weight >= filters.weightRange.min &&
    s.weight <= filters.weightRange.max
  );
}

  if (search) {
    data = data.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  // 🔥 Ngăn loop vô hạn
  if (JSON.stringify(data) !== JSON.stringify(filtered)) {
    setFiltered(data);
  }
};

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("StudentProfile", { studentId: item._id })
      }
    >
      <View style={styles.avatarWrap}>
        <Image
          source={
            item.avatar
              ? { uri: item.avatar }
              : require("../assets/icons/student.png")
          }
          style={styles.avatar}
        />
        <Image
          source={require("../assets/icons/play.png")}
          style={styles.playIcon}
        />
      </View>

      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.classText}>
                Class: {typeof item.classId === "string" 
                    ? item.classId 
                    : item.classId?.name || "N/A"}
              </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <TouchableOpacity onPress={() => {
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'BottomTabs', params: { screen: 'Dashboard' } }] }));
        }}>
          <Image source={require("../assets/icons/back.png")} style={{ width: 24, height: 24 }} />
        </TouchableOpacity>
        <Text style={styles.header}>👩‍🏫 Student List</Text>
      </View>
      <TextInput
        style={styles.searchBox}
        placeholder="Search student..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() =>
            navigation.navigate("StudentFilter", { filters })
          }
        >
          <Text>⚙️ Filter</Text>
        </TouchableOpacity>

        {filters.gender && (
          <View style={styles.chip}>
            <Text>{filters.gender}</Text>
          </View>
        )}
        {filters.ageRange && (
          <View style={styles.chip}>
            <Text>{filters.ageRange}</Text>
          </View>
        )}
        {filters.weightRange && (
          <View style={styles.chip}>
            <Text>{filters.weightRange.label}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6FDF3", padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: "#064E3B",
  },
  searchBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  filterBtn: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  chip: {
    backgroundColor: "#8FEAD0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
  },
  card: {
    width: "48%",
    backgroundColor: "#D9FDF0",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  avatarWrap: {
    width: 80,
    height: 80,
    backgroundColor: "#ACEFDB",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
    marginBottom: 10,
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  playIcon: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
  },
  name: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#064E3B",
    textAlign: "center",
  },
  classText: {
    fontSize: 12,
    color: "#065f46",
    textAlign: "center",
  },
});
