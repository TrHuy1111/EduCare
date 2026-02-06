import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import {
  getAnnouncementById,
  updateAnnouncement,
} from "../src/services/announcementService";
import { BASE_URL } from "../src/services/announcementService";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AdminAnnouncementEditScreen({ route, navigation }: any) {
  const { id } = route.params;

  const [form, setForm] = useState({
    title: "",
    content: "",
    location: "",
    startTime: new Date(),
    endTime: new Date(),
    image: null as any,
    oldImage: "",
  });
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [currentField, setCurrentField] = useState<'start' | 'end'>('start');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getAnnouncementById(id);
    const a = res.data.data;

    setForm({
      title: a.title,
      content: a.content,
      location: a.location || "",
      startTime: a.startTime ? new Date(a.startTime) : new Date(),
      endTime: a.endTime ? new Date(a.endTime) : new Date(),
      image: null,
      oldImage: a.image,
    });
  };

  const openPicker = (field: 'start' | 'end', mode: 'date' | 'time') => {
    setCurrentField(field);
    setPickerMode(mode);
    setShowPicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
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

    const asset = res.assets[0];
    setForm({
      ...form,
      image: {
        uri: asset.uri,
        type: asset.type || "image/jpeg",
        name: asset.fileName || "announcement.jpg",
      },
    });
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append("location", form.location);
      formData.append("startTime", form.startTime.toISOString());
      formData.append("endTime", form.endTime.toISOString());

      if (form.endTime <= form.startTime) {
        return Alert.alert(
          "Thời gian không hợp lệ",
          "Ngày kết thúc phải sau ngày bắt đầu"
        );
      }
      if (form.image) {
        formData.append("image", form.image);
      }

      await updateAnnouncement(id, formData);
      Alert.alert("✅ Thành công", "Đã cập nhật");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("❌ Lỗi", err.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>✏️ Sửa sự kiện</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {form.image ? (
          <Image source={{ uri: form.image.uri }} style={styles.image} />
        ) : form.oldImage ? (
          <Image
            source={{ uri: `${BASE_URL}${form.oldImage}` }}
            style={styles.image}
          />
        ) : (
          <Text>Chọn ảnh 📷</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.label}>Tiêu đề</Text>
      <TextInput style={styles.input} value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} />
      <Text style={styles.label}>Nội dung</Text>
      <TextInput style={[styles.input, { height: 120 }]} multiline value={form.content} onChangeText={(t) => setForm({ ...form, content: t })} />
      <Text style={styles.label}>Địa điểm</Text>
      <TextInput style={styles.input} value={form.location} onChangeText={(t) => setForm({ ...form, location: t })} />
      
      <Text style={styles.label}>Thời gian bắt đầu</Text>
      <View style={styles.row}>
        <TouchableOpacity 
          style={styles.halfBtn} 
          onPress={() => openPicker('start', 'date')}
        >
          <Text style={styles.btnText}>
            📅 {form.startTime.toLocaleDateString("vi-VN")}
          </Text>
        </TouchableOpacity>

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
          mode={pickerMode}
          display="default"
          onChange={handleDateChange}
          is24Hour={true}
        />
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
        <Text style={styles.saveText}>💾 Cập nhật</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#E6FDF3", 
  },
  header: {
    fontSize: 24, 
    fontWeight: "bold",
    color: "#064E3B",
    marginBottom: 16,
  },  
  label: { fontWeight: "600", marginBottom: 6, color: "#064E3B" },  
  timeBtn: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
  },
  imagePicker: {
    width: "100%",
    height: 200,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: "100%", 
    borderRadius: 10,
  },
  input: {
    backgroundColor: "#FFFFFF", 
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },  
  saveBtn: {
    backgroundColor: "#10B981",
    padding: 14,  
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,  
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  halfBtn: {
    flex: 1, // Chia đôi màn hình
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
  },
}); 