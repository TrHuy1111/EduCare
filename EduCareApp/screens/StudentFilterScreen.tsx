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
import Slider from "@react-native-community/slider";

type Range = { min: number; max: number } | null;
const ensureRange = (r: Range): { min: number; max: number } => {
  return {
    min: r?.min ?? 0,
    max: r?.max ?? 0,
  };
};
export default function StudentFilterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();
  const route = useRoute();

  const previousFilters = (route.params as any)?.filters || {};

  const [gender, setGender] = useState(previousFilters.gender || null);
  const [ageRange, setAgeRange] = useState(previousFilters.ageRange || null);

  const [weightRange, setWeightRange] = useState<Range>(
    previousFilters.weightRange || null
  );

  const [heightRange, setHeightRange] = useState<Range>(
    previousFilters.heightRange || null
  );

  const saveFilters = () => {
    navigation.navigate("TeacherStudentList", {
      filters: { gender, ageRange, weightRange, heightRange },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>←</Text>
      </TouchableOpacity>

      {/* WEIGHT */}
      <Text style={styles.sectionTitle}>Weight (kg)</Text>

      <Text style={{ marginBottom: 4 }}>
        {weightRange ? `${weightRange.min}kg → ${weightRange.max}kg` : "Choose range"}
      </Text>

      <Text style={styles.subLabel}>Min</Text>
      <Slider
        minimumValue={5}
        maximumValue={40}
        step={1}
        value={weightRange?.min ?? 8}
        onValueChange={(val) => {
          const safe = ensureRange(weightRange);
          setWeightRange({ ...safe, min: val });
        }}
        minimumTrackTintColor="#10B981"
        maximumTrackTintColor="#ccc"
        thumbTintColor="#047857"
      />

      <Text style={styles.subLabel}>Max</Text>
      <Slider
        minimumValue={5}
        maximumValue={40}
        step={1}
        value={weightRange?.max ?? 20}
        onValueChange={(val) => {
          const safe = ensureRange(weightRange);
          setWeightRange({ ...safe, max: val });
        }}

        minimumTrackTintColor="#10B981"
        maximumTrackTintColor="#ccc"
        thumbTintColor="#047857"
      />

      {/* HEIGHT */}
      <Text style={styles.sectionTitle}>Height (cm)</Text>

      <Text style={{ marginBottom: 4 }}>
        {heightRange ? `${heightRange.min}cm → ${heightRange.max}cm` : "Choose range"}
      </Text>

      <Text style={styles.subLabel}>Min</Text>
      <Slider
        minimumValue={40}
        maximumValue={150}
        step={1}
        value={heightRange?.min ?? 60}
        onValueChange={(val) => {
          const safe = ensureRange(heightRange);
          setHeightRange({ ...safe, min: val });
        }}

        minimumTrackTintColor="#10B981"
        maximumTrackTintColor="#ccc"
        thumbTintColor="#047857"
      />

      <Text style={styles.subLabel}>Max</Text>
      <Slider
        minimumValue={40}
        maximumValue={150}
        step={1}
        value={heightRange?.max ?? 110}
        onValueChange={(val) => {
          const safe = ensureRange(heightRange);
          setHeightRange({ ...safe, max: val });
        }}

        minimumTrackTintColor="#10B981"
        maximumTrackTintColor="#ccc"
        thumbTintColor="#047857"
      />

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
        {[
          { label: "0 - 12 months", minMonths: 0, maxMonths: 12 },
          { label: "1 - 2 years", minMonths: 12, maxMonths: 24 },
          { label: "2 - 3 years", minMonths: 24, maxMonths: 36 },
          { label: "3 - 4 years", minMonths: 36, maxMonths: 48 },
          { label: "4 - 5 years", minMonths: 48, maxMonths: 60 },
        ].map((range) => (
          <TouchableOpacity
            key={range.label}
            style={[
              styles.option,
              ageRange?.label === range.label && styles.optionActive,
            ]}
            onPress={() =>
              setAgeRange(ageRange?.label === range.label ? null : range)
            }
          >
            <Text style={styles.optionText}>{range.label}</Text>
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
  subLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
    marginBottom: 2,
    color: "#064E3B",
  },
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
