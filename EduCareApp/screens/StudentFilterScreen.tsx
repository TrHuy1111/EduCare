// StudentFilterScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TeacherStackParamList } from "../navigation/TeacherNavigator";
export default function StudentFilterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();
  const route = useRoute();

  const previousFilters = (route.params as any)?.filters || {};

  const [gender, setGender] = useState(previousFilters.gender || null);
  const [ageRange, setAgeRange] = useState(previousFilters.ageRange || null);
  const [weightRange, setWeightRange] = useState(previousFilters.weightRange || null);

  const saveFilters = () => {
  navigation.navigate("TeacherStudentList", {
    filters: { gender, ageRange, weightRange }
  });
};

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>←</Text>
      </TouchableOpacity>

      {/* WEIGHT */}
      <Text style={styles.sectionTitle}>Weight</Text>
      <View style={styles.row}>
        {[
          { label: "8 - 12 kg", min: 8, max: 12 },
          { label: "12 - 16 kg", min: 12, max: 16 },
          { label: "16 - 20 kg", min: 16, max: 20 },
          { label: "20 - 25 kg", min: 20, max: 25 },
          { label: "25 - 30 kg", min: 25, max: 30 },
        ].map((range) => (
          <TouchableOpacity
            key={range.label}
            style={[
              styles.option,
              weightRange?.label === range.label && styles.optionActive,
            ]}
            onPress={() =>
              setWeightRange(
                weightRange?.label === range.label ? null : range
              )
            }
          >
            <Text style={styles.optionText}>{range.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* HEIGHT -- BỎ TẠM (Nếu bạn muốn mình thêm lại thì OK) */}

      {/* GENDER */}
      <Text style={styles.sectionTitle}>Genders</Text>
      <View style={styles.row}>
        {["male", "female"].map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.option, gender === g && styles.optionActive]}
            onPress={() => setGender(gender === g ? null : g)}
          >
            <Text style={styles.optionText}>{g === "male" ? "Boys" : "Girls"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* AGE */}
      <Text style={styles.sectionTitle}>Age</Text>
      <View style={styles.row}>
        {["4 years", "5 years", "6 years"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.option, ageRange === item && styles.optionActive]}
            onPress={() => setAgeRange(ageRange === item ? null : item)}
          >
            <Text style={styles.optionText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={saveFilters}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#E6FDF3", flex: 1 },
  back: { fontSize: 30, marginBottom: 10 },
  sectionTitle: { fontWeight: "bold", fontSize: 16, marginVertical: 10 },
  row: { flexDirection: "row", flexWrap: "wrap" },
  option: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    margin: 6,
  },
  optionActive: {
    backgroundColor: "#8FEAD0",
  },
  optionText: { fontSize: 14, fontWeight: "500" },
  saveBtn: {
    marginTop: 30,
    backgroundColor: "#10B981",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
