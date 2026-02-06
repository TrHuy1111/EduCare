import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Calendar, LocaleConfig } from "react-native-calendars";
import moment from "moment"; 

import {
  getTeacherClasses,
  getStudentsByClass,
} from "../src/services/attendanceService";
import { getActivities } from "../src/services/activityService";
import FeedbackModal from "./components/FeedbackModal";

LocaleConfig.locales['vi'] = {
  monthNames: ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'],
  monthNamesShort: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'],
  dayNames: ['Chủ Nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'],
  dayNamesShort: ['CN','T2','T3','T4','T5','T6','T7'],
  today: 'Hôm nay'
};
LocaleConfig.defaultLocale = 'vi';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function TeacherFeedbackScreen() {

  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  
  const [showCalendar, setShowCalendar] = useState(false);

  const [activityDate, setActivityDate] = useState<any>(null);
  const [selectedActivityItem, setSelectedActivityItem] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadActivities();
    }
  }, [selectedClass, selectedDate]);

  const loadClasses = async () => {
    try {
      const res = await getTeacherClasses();
      setClasses(res.data);
      if (res.data.length > 0) setSelectedClass(res.data[0]._id);
    } catch (err) {
      console.log("Error load classes", err);
    }
  };

  const loadStudents = async (classId: string) => {
    try {
      setLoading(true);
      const res = await getStudentsByClass(classId);
      setStudents(res.data);
    } catch (err) {
      console.log("Error load students", err);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const res = await getActivities(selectedClass, selectedDate);
      const actDoc = res.data; 

      // 👇 Log ra để kiểm tra
      // console.log("Activities mới tải về:", JSON.stringify(actDoc, null, 2));

      setActivityDate(actDoc);

      if (actDoc && actDoc.activities && actDoc.activities.length > 0) {
        if (selectedActivityItem) {
          // Tìm lại item đang chọn trong danh sách mới
          const updatedItem = actDoc.activities.find(
            (a: any) => a._id === selectedActivityItem._id
          );
          
          if (updatedItem) {
            // console.log("👉 Đã tìm thấy update cho:", updatedItem.title);
             //console.log("👉 Số lượng feedback:", updatedItem.feedbacks?.length);
             setSelectedActivityItem(updatedItem);
          } else {
             setSelectedActivityItem(actDoc.activities[0]);
          }
        } else {
          setSelectedActivityItem(actDoc.activities[0]);
        }
      } else {
        setSelectedActivityItem(null);
      }
    } catch (err) {
      console.log("Error load activity", err);
    }
  };

  /* ================= HANDLERS ================= */
  const toggleCalendar = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowCalendar(!showCalendar);
  };

  const openFeedback = (student: any) => {
    if (!selectedActivityItem) {
      Alert.alert("Chưa có hoạt động", "Vui lòng chọn hoặc tạo hoạt động trước.");
      return;
    }
    setSelectedStudent(student);
    setShowModal(true);
  };

  /* ================= RENDER COMPONENTS ================= */
  
  // 1. Header Component (Chứa Filter & Calendar)
  const renderHeader = () => (
    <View>
      {/* Chọn Lớp & Ngày */}
      <View style={styles.filterCard}>
        <View style={styles.pickerContainer}>
           <Picker
            selectedValue={selectedClass}
            onValueChange={(v) => setSelectedClass(v)}
            style={styles.picker}
            dropdownIconColor="#065F46"
          >
            {classes.map((c) => (
              <Picker.Item key={c._id} label={c.name} value={c._id} />
            ))}
          </Picker>
        </View>

        {/* Thanh chọn ngày rút gọn */}
        <TouchableOpacity style={styles.dateSelector} onPress={toggleCalendar}>
          <Text style={styles.dateText}>
            📅 {moment(selectedDate).format("DD/MM/YYYY")}
          </Text>
          <Text style={{color: '#065F46', fontSize: 12}}>
            {showCalendar ? "▲ Thu gọn" : "▼ Chọn ngày"}
          </Text>
        </TouchableOpacity>

        {/* Lịch (Ẩn/Hiện) */}
        {showCalendar && (
          <Calendar
            current={selectedDate}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              toggleCalendar(); // Chọn xong tự đóng
            }}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: "#10B981" },
            }}
            theme={{
              todayTextColor: "#F59E0B",
              arrowColor: "#10B981",
            }}
            style={styles.calendar}
          />
        )}
      </View>

      {/* Chọn Hoạt động (Tab ngang) */}
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.sectionLabel}>Hoạt động trong ngày:</Text>
        {!activityDate || !activityDate.activities || activityDate.activities.length === 0 ? (
          <Text style={styles.emptyText}>(Chưa có hoạt động nào được ghi nhận)</Text>
        ) : (
          <FlatList 
            data={activityDate.activities}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              const isSelected = selectedActivityItem?._id === item._id;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedActivityItem(item)}
                  style={[
                    styles.activityTab,
                    isSelected && styles.activityTabActive
                  ]}
                >
                  <Text style={[styles.activityTabText, isSelected && {color:'#fff'}]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              )
            }}
          />
        )}
      </View>

      {/* Tiêu đề danh sách */}
      <View style={styles.listHeaderRow}>
        <Text style={styles.listHeaderTitle}>Danh sách học sinh ({students.length})</Text>
        <Text style={styles.listHeaderSub}>
           {selectedActivityItem ? `Đang chấm: ${selectedActivityItem.title}` : "Chọn hoạt động để chấm"}
        </Text>
      </View>
    </View>
  );

  // 2. Render Student Item (Card Style)
  const renderStudent = ({ item }: any) => {
    // Check đã feedback chưa
    const feedback = selectedActivityItem?.feedbacks?.find(
      (f: any) => f.studentId?.toString() === item._id?.toString()
    );
    const hasFeedback = !!feedback;

    return (
      <TouchableOpacity 
        style={[styles.studentCard, hasFeedback && styles.studentCardDone]} 
        onPress={() => openFeedback(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardLeft}>
           <Image 
             source={item.avatar ? { uri: item.avatar } : require("../assets/icons/student.png")} 
             style={styles.avatar} 
           />
           <View>
             <Text style={styles.studentName}>{item.name}</Text>
             {hasFeedback ? (
               <View style={styles.badgeDone}>
                 <Text style={styles.badgeText}>✅ Đã nhận xét</Text>
                 {feedback.reward !== 'none' && (
                    <Text style={{marginLeft: 5}}>
                      {feedback.reward === 'star' ? '⭐' : feedback.reward === 'flower' ? '🌸' : '🏅'}
                    </Text>
                 )}
               </View>
             ) : (
               <Text style={styles.pendingText}>Chưa nhận xét</Text>
             )}
           </View>
        </View>

        <View style={styles.cardRight}>
             <Text style={{fontSize: 20, color: '#ccc'}}>✎</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={students}
          extraData={selectedActivityItem}
          keyExtractor={(item) => item._id}
          renderItem={renderStudent}
          ListHeaderComponent={renderHeader} // 🔥 KEY FIX: Đưa header vào đây
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={{textAlign:'center', marginTop: 20, color:'#888'}}>Lớp chưa có học sinh</Text>
          }
        />
      )}

      {/* Modal giữ nguyên logic */}
      {showModal && (
        <FeedbackModal
          visible={showModal}
          onClose={() => {
            setShowModal(false);
            loadActivities(); // Reload để cập nhật tick xanh
          }}
          student={selectedStudent}
          classId={selectedClass}
          date={selectedDate}
          activityDate={activityDate}
          activityItem={selectedActivityItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 16 },
  screenTitle: { fontSize: 24, fontWeight: "800", color: "#065F46", marginBottom: 16 },

  // Filter Card
  filterCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#F9FAFB"
  },
  picker: { height: 50 },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: "#ECFDF5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#A7F3D0"
  },
  dateText: { fontWeight: "700", color: "#064E3B", fontSize: 16 },
  calendar: { marginTop: 10, borderRadius: 10 },

  // Activity Tabs
  sectionLabel: { fontSize: 14, fontWeight: "600", color: "#6B7280", marginBottom: 8 },
  emptyText: { fontStyle: "italic", color: "#9CA3AF" },
  activityTab: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  activityTabActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  activityTabText: { fontWeight: "600", color: "#374151" },

  // List Header
  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
    paddingHorizontal: 4
  },
  listHeaderTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  listHeaderSub: { fontSize: 12, color: "#EF4444", fontWeight: "600" },

  // Student Card
  studentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 1,
  },
  studentCardDone: {
    borderLeftWidth: 4,
    borderLeftColor: "#10B981", 
  },
  cardLeft: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#E5E7EB", marginRight: 12 },
  studentName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  
  badgeDone: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, color: '#065F46', fontWeight: 'bold' },
  
  pendingText: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },
  
  cardRight: { paddingHorizontal: 10 },
});