// screens/ParentActivitiesScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image
} from "react-native";
import { getMyChildren } from "../src/services/studentService";
import { getActivities } from "../src/services/activityService";

const getMonday = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  // Set về thứ 2 đầu tuần
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

// Hàm format hiển thị trên thanh điều hướng (Ví dụ: Thứ Hai, 05/01)
const formatDateHeader = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[d.getDay()];

  return `${dayName}, ${day}/${month}`;
};

// Hàm lấy ngày/tháng cho ô vuông (Badge)
const getDateParts = (dateStr: string) => {
  const d = new Date(dateStr);
  return {
    day: d.getDate().toString().padStart(2, '0'),
    month: (d.getMonth() + 1).toString().padStart(2, '0')
  };
};

export default function ParentActivitiesScreen() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [activitiesMap, setActivitiesMap] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const cacheRef = useRef<{ [key: string]: any }>({});

  /* ===== WEEK DATES ===== */
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  }, [weekStart]);

  /* ===== LOAD INITIAL DATA ===== */
  useEffect(() => {
    (async () => {
      try {
        const res = await getMyChildren();
        const list = res.data || [];
        setChildren(list);

        if (list.length > 0) {
          handleSelectStudent(list[0]);
        }
      } catch (e) {
        console.log("Error loading children", e);
      }
    })();
  }, []);

  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    const classInfo = typeof student.classId === "string" 
        ? { _id: student.classId } 
        : student.classId;
    setSelectedClass(classInfo);
  };

  /* ===== LOAD ACTIVITIES ===== */
  useEffect(() => {
    if (!selectedClass?._id) {
        setLoading(false);
        return;
    }

    const key = `${selectedClass._id}-${weekDates[0]}`;
    if (cacheRef.current[key]) {
      setActivitiesMap(cacheRef.current[key]);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const responses = await Promise.all(
          weekDates.map((d) => getActivities(selectedClass._id, d))
        );

        const map: any = {};
        weekDates.forEach((date, i) => {
          map[date] =
            responses[i].data?.activities ||
            responses[i].data?.data?.activities ||
            [];
        });

        cacheRef.current[key] = map;
        setActivitiesMap(map);
      } catch (err) {
          console.log("Error loading activities", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedClass, weekDates]);

  if (loading && !selectedClass) {
    return <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 80 }} />;
  }

  return (
    <View style={styles.container}>
      {/* 1. CHILD SELECTOR */}
      <View style={styles.headerSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingRight: 20}}>
            {children.map((child) => (
                <TouchableOpacity 
                    key={child._id} 
                    style={[
                        styles.childBtn, 
                        selectedStudent?._id === child._id && styles.childBtnActive
                    ]}
                    onPress={() => handleSelectStudent(child)}
                >
                    <Image 
                        source={child.avatar ? {uri: child.avatar} : require('../assets/icons/student.png')} 
                        style={styles.childAvatar}
                    />
                    <Text style={[
                        styles.childName, 
                        selectedStudent?._id === child._id && styles.childNameActive
                    ]}>
                        {child.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* 2. WEEK NAV */}
        <View style={styles.weekNavCard}>
            <TouchableOpacity onPress={() => setWeekStart((d) => new Date(d.setDate(d.getDate() - 7)))}>
                <Text style={styles.navArrow}>◀</Text>
            </TouchableOpacity>
            
            <View style={{alignItems: 'center'}}>
                <Text style={styles.weekLabel}>LỊCH HOẠT ĐỘNG</Text>
                <Text style={styles.weekRange}>
                   {getDateParts(weekDates[0]).day}/{getDateParts(weekDates[0]).month} - {getDateParts(weekDates[6]).day}/{getDateParts(weekDates[6]).month}
                </Text>
            </View>

            <TouchableOpacity onPress={() => setWeekStart((d) => new Date(d.setDate(d.getDate() + 7)))}>
                <Text style={styles.navArrow}>▶</Text>
            </TouchableOpacity>
        </View>

        {loading ? (
             <ActivityIndicator size="large" color="#10B981" style={{marginTop: 40}} />
        ) : (
            /* 3. TIMELINE LIST */
            <View style={styles.timelineContainer}>
                {weekDates.map((date) => {
                    const list = activitiesMap[date] || [];
                    const todayStr = new Date().toISOString().split('T')[0];
                    const isToday = todayStr === date;
                    const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6;
                    
                    // Ẩn ngày cuối tuần nếu không có hoạt động để đỡ dài
                    if (list.length === 0 && isWeekend) return null;

                    // 🛠️ FIX LỖI UI NGÀY THÁNG Ở ĐÂY
                    const { day, month } = getDateParts(date);

                    return (
                        <View key={date} style={styles.dayBlock}>
                            {/* Date Header */}
                            <View style={styles.dayHeader}>
                                {/* Ô vuông ngày tháng */}
                                <View style={[styles.dateBadge, isToday && styles.dateBadgeToday]}>
                                    <Text style={[styles.dateNum, isToday && {color: '#fff'}]}>
                                        {day}
                                    </Text>
                                    <Text style={[styles.dateMonth, isToday && {color: '#E6FFFA'}]}>
                                        T{month}
                                    </Text>
                                </View>

                                <View style={{flex: 1, marginLeft: 12}}>
                                    <Text style={[styles.dayName, isToday && {color: '#10B981', fontWeight:'800'}]}>
                                        {formatDateHeader(date)} {isToday ? "(Hôm nay)" : ""}
                                    </Text>
                                    {list.length === 0 && (
                                        <Text style={styles.noActivityText}>Không có hoạt động</Text>
                                    )}
                                </View>
                            </View>

                            {/* Activities Timeline */}
                            <View style={styles.activityList}>
                                {list.map((a: any, idx: number) => (
                                    <View key={idx} style={styles.timelineRow}>
                                        {/* Time Column */}
                                        <View style={styles.timeCol}>
                                            <Text style={styles.startTime}>{a.startTime}</Text>
                                            <Text style={styles.endTime}>{a.endTime}</Text>
                                        </View>

                                        {/* Line & Dot */}
                                        <View style={styles.timelineLine}>
                                            <View style={styles.timelineDot} />
                                            {/* Đường kẻ nối */}
                                            {idx < list.length - 1 && <View style={styles.verticalLine} />}
                                        </View>

                                        {/* Content Card */}
                                        <View style={styles.cardWrapper}>
                                            <View style={styles.activityCard}>
                                                <Text style={styles.activityTitle}>{a.title}</Text>
                                                <View style={styles.locationRow}>
                                                    <Text style={{fontSize: 12}}>📍</Text>
                                                    <Text style={styles.locationText}>{a.location || "Tại lớp"}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                })}
                <View style={{height: 40}}/>
            </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6FDF3" },
  
  /* HEADER CHILD SELECTOR */
  headerSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2,
    zIndex: 10
  },
  childBtn: {
    flexDirection: 'row', alignItems: 'center',
    padding: 6, paddingRight: 12,
    marginRight: 10, borderRadius: 20,
    backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: 'transparent'
  },
  childBtnActive: {
    backgroundColor: '#ECFDF5', borderColor: '#10B981'
  },
  childAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  childName: { fontWeight: '600', color: '#666', fontSize: 13 },
  childNameActive: { color: '#065F46' },

  body: { flex: 1, padding: 16 },

  /* WEEK NAV */
  weekNavCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, marginBottom: 20,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: {width: 0, height: 2}
  },
  navArrow: { fontSize: 20, color: '#10B981', paddingHorizontal: 10 },
  weekLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 4, fontWeight: '600' },
  weekRange: { fontSize: 16, fontWeight: '800', color: '#064E3B' },

  timelineContainer: { paddingBottom: 20 },
  dayBlock: { marginBottom: 24 },
  
  dayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },

  dateBadge: {
    backgroundColor: '#fff', 
    alignItems: 'center', 
    justifyContent: 'center',
    width: 54, 
    height: 54, 
    borderRadius: 14,
    elevation: 2, 
    borderWidth: 1, 
    borderColor: '#E5E7EB',
    paddingVertical: 4
  },
  dateBadgeToday: { 
    backgroundColor: '#10B981', 
    borderColor: '#10B981',
    elevation: 4
  },
  dateNum: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#374151',
    lineHeight: 24 
  },
  dateMonth: { 
    fontSize: 11, 
    color: '#9CA3AF', 
    fontWeight: '600',
    marginTop: 0 
  },
  
  dayName: { fontSize: 16, fontWeight: '700', color: '#374151' },
  noActivityText: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic', marginTop: 4 },

  activityList: { paddingLeft: 10 }, 
  
  timelineRow: { flexDirection: 'row', marginBottom: 0 },
  
  timeCol: { width: 50, alignItems: 'flex-end', paddingRight: 10, paddingTop: 2 },
  startTime: { fontSize: 14, fontWeight: '700', color: '#064E3B' },
  endTime: { fontSize: 11, color: '#6B7280' },

  timelineLine: { alignItems: 'center', width: 20 },
  timelineDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#fff', borderWidth: 3, borderColor: '#10B981',
    zIndex: 2, marginTop: 4
  },
  verticalLine: {
    width: 2, flex: 1, backgroundColor: '#D1FAE5',
    position: 'absolute', top: 16, bottom: -4, left: 9
  },

  cardWrapper: { flex: 1, paddingBottom: 16 },
  activityCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
    marginLeft: 8,
    borderLeftWidth: 4, borderLeftColor: '#34D399',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05
  },
  activityTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 12, color: '#6B7280', marginLeft: 4 },
});