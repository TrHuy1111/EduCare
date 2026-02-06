import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createAnnouncement } from "../src/services/announcementService";

export default function AdminAnnouncementCreateScreen({ navigation }: any) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    location: "",
    startTime: new Date(),
    endTime: new Date(),
    image: null as any,
  });

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [currentField, setCurrentField] = useState<'start' | 'end'>('start');

  const openPicker = (field: 'start' | 'end', mode: 'date' | 'time') => {
    setCurrentField(field);
    setPickerMode(mode);
    setShowPicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false); // Đóng picker ngay
    if (!selectedDate) return;

    const targetDate = currentField === 'start' ? form.startTime : form.endTime;
    
    const newDate = new Date(targetDate);

    if (pickerMode === 'date') {
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    } else {
      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
    }

    setForm({ 
      ...form, 
      [currentField === 'start' ? 'startTime' : 'endTime']: newDate 
    });
  };
  const pickImage = async () => {
    const res = await launchImageLibrary({ mediaType: "photo" });
    if (!res.assets?.[0]) return;

    const a = res.assets[0];
    setForm({
      ...form,
      image: {
        uri: a.uri,
        type: a.type || "image/jpeg",
        name: a.fileName || "announcement.jpg",
      },
    });
  };

  const handleSave = async () => {
    if (!form.title || !form.content) {
      return Alert.alert("Thiếu thông tin", "Nhập tiêu đề và nội dung");
    }

    if (form.endTime <= form.startTime) {
      return Alert.alert(
        "Thời gian không hợp lệ",
        "Thời gian kết thúc phải sau thời gian bắt đầu"
      );
    }

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("content", form.content);
      fd.append("location", form.location);
      fd.append("startTime", form.startTime.toISOString());
      fd.append("endTime", form.endTime.toISOString());

      if (form.image) {
        fd.append("image", form.image as any);
      }

      await createAnnouncement(fd);
      Alert.alert("✅ Thành công", "Đã tạo sự kiện");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("❌ Lỗi", err.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>➕ Tạo sự kiện</Text>

      {/* IMAGE */}
      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {form.image ? (
          <Image source={{ uri: form.image.uri }} style={styles.image} />
        ) : (
          <Text style={styles.imageText}>Chọn ảnh sự kiện 📷</Text>
        )}
      </TouchableOpacity>

      {/* TITLE */}
      <Text style={styles.label}>Tiêu đề</Text>
      <TextInput
        style={styles.input}
        value={form.title}
        onChangeText={(t) => setForm({ ...form, title: t })}
      />

      {/* CONTENT */}
      <Text style={styles.label}>Nội dung</Text>
      <TextInput
        style={[styles.input, { height: 120 }]}
        multiline
        value={form.content}
        onChangeText={(t) => setForm({ ...form, content: t })}
      />

      {/* LOCATION */}
      <Text style={styles.label}>Địa điểm</Text>
      <TextInput
        style={styles.input}
        value={form.location}
        onChangeText={(t) => setForm({ ...form, location: t })}
      />

      <Text style={styles.label}>Thời gian bắt đầu</Text>
      <View style={styles.row}>
        {/* Nút Chọn Ngày */}
        <TouchableOpacity 
          style={styles.halfBtn} 
          onPress={() => openPicker('start', 'date')}
        >
          <Text style={styles.btnText}>
            📅 {form.startTime.toLocaleDateString("vi-VN")}
          </Text>
        </TouchableOpacity>

        {/* Nút Chọn Giờ */}
        <TouchableOpacity 
          style={styles.halfBtn} 
          onPress={() => openPicker('start', 'time')}
        >
          <Text style={styles.btnText}>
            ⏰ {form.startTime.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- END TIME --- */}
      <Text style={styles.label}>Thời gian kết thúc</Text>
      <View style={styles.row}>
        <TouchableOpacity 
          style={styles.halfBtn} 
          onPress={() => openPicker('end', 'date')}
        >
          <Text style={styles.btnText}>
            📅 {form.endTime.toLocaleDateString("vi-VN")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.halfBtn} 
          onPress={() => openPicker('end', 'time')}
        >
          <Text style={styles.btnText}>
            ⏰ {form.endTime.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* COMPONENT PICKER CHUNG */}
      {showPicker && (
        <DateTimePicker
          value={currentField === 'start' ? form.startTime : form.endTime}
          mode={pickerMode} // 'date' hoặc 'time'
          display="default"
          onChange={handleDateChange}
          is24Hour={true}
        />
      )}


      {/* SAVE */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>💾 Lưu sự kiện</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6FDF3", padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#064E3B",
    marginBottom: 16,
  },
  label: { fontWeight: "600", marginBottom: 6, color: "#064E3B" },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
  },
  imageBox: {
    height: 160,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  imageText: { color: "#6b7280" },
  timeBtn: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: "#10B981",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  halfBtn: {
    flex: 1, 
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: 'center',
  },
  btnText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500'
  }
});
