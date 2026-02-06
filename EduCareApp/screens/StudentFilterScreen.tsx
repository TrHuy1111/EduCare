// StudentFilterScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TeacherStackParamList } from "../navigation/TeacherNavigator";

type Range = { min: number; max: number } | null;

const RangeInput = ({ label, range, setRange }: any) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.sectionTitle}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {/* Min Input */}
        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Từ</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            placeholder="0"
            value={range?.min ? String(range.min) : ""}
            onChangeText={(text) => setRange({ ...range, min: Number(text) })}
          />
        </View>

        <Text style={{ fontWeight: "bold", marginTop: 15 }}>➜</Text>

        {/* Max Input */}
        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Đến</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            placeholder="Max"
            value={range?.max ? String(range.max) : ""}
            onChangeText={(text) => setRange({ ...range, max: Number(text) })}
          />
        </View>
      </View>
    </View>
  );
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

      <RangeInput 
        label="Cân nặng (kg)" 
        range={weightRange} 
        setRange={setWeightRange} 
      />
      <RangeInput 
        label="Chiều cao (cm)" 
        range={heightRange} 
        setRange={setHeightRange} 
      />

      {/* GENDER */}
      <Text style={styles.sectionTitle}>Giới tính</Text>
      <View style={styles.row}>
        {["male", "female"].map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.option, gender === g && styles.optionActive]}
            onPress={() => setGender(gender === g ? null : g)}
          >
            <Text style={styles.optionText}>{g === "male" ? "Nam" : "Nữ"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* AGE */}
      <Text style={styles.sectionTitle}>Tuổi</Text>
      <View style={styles.row}>
        {[
          { label: "0 - 12 tháng", minMonths: 0, maxMonths: 12 },
          { label: "1 - 2 năm", minMonths: 12, maxMonths: 24 },
          { label: "2 - 3 năm", minMonths: 24, maxMonths: 36 },
          { label: "3 - 4 năm", minMonths: 36, maxMonths: 48 },
          { label: "4 - 5 năm", minMonths: 48, maxMonths: 60 },
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
        <Text style={styles.saveText}>Lưu</Text>
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
  inputWrap: { flex: 1 },
  inputLabel: { fontSize: 12, color: "#666", marginBottom: 4 },
  textInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlign: "center"
  }
});
