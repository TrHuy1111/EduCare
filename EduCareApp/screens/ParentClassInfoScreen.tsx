// screens/ParentClassInfoScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  FlatList
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getClassDetail,BASE_URL } from "../src/services/classService";
import { getMyChildren } from "../src/services/studentService"; // 👈 Import thêm cái này

export default function ParentClassInfoScreen() {
  const navigation = useNavigation();
  const route: any = useRoute();
  
  // Lấy classId nếu có (từ Profile truyền qua), nếu không thì null
  const paramClassId = route.params?.classId; 

  const [classData, setClassData] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initData();
  }, [paramClassId]);

  const initData = async () => {
    try {
      setLoading(true);

      // Trường hợp 1: Có classId truyền vào (từ StudentProfile)
      if (paramClassId) {
        await loadClassInfo(paramClassId);
      } 
      // Trường hợp 2: Vào từ Dashboard (Chưa có classId) -> Phải tự tìm con
      else {
        const res = await getMyChildren();
        const list = res.data || [];
        setChildren(list);

        if (list.length > 0) {
          // Mặc định chọn bé đầu tiên và load lớp của bé đó
          const firstChild = list[0];
          setSelectedChild(firstChild);
          
          if (firstChild.classId) {
             const cId = typeof firstChild.classId === 'string' ? firstChild.classId : firstChild.classId._id;
             await loadClassInfo(cId);
          }
        }
      }
    } catch (err) {
      console.log("Error init data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Hàm load chi tiết lớp
  const loadClassInfo = async (id: string) => {
    try {
      const res = await getClassDetail(id);
      setClassData(res.data);
    } catch (err) {
      console.log("Load class detail error:", err);
    }
  };

  const handleSelectChild = async (child: any) => {
    setSelectedChild(child);
    setClassData(null); // Reset data
    if (child.classId) {
        const cId = typeof child.classId === 'string' ? child.classId : child.classId._id;
        await loadClassInfo(cId);
    }
  };

  const handleCall = (phone: string) => {
    if (!phone) return Alert.alert("Thông báo", "Giáo viên chưa cập nhật số điện thoại");
    Linking.openURL(`tel:${phone}`);
  };

  if (loading) return <ActivityIndicator size="large" color="#10B981" style={styles.center} />;

  return (
    <View style={{flex: 1, backgroundColor: "#E6FDF3"}}>
      {!paramClassId && children.length > 0 && (
        <View style={styles.childSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {children.map((child) => (
              <TouchableOpacity 
                key={child._id} 
                style={[
                    styles.childBtn, 
                    selectedChild?._id === child._id && styles.childBtnActive
                ]}
                onPress={() => handleSelectChild(child)}
              >
                <Image 
                    source={child.avatar ? {uri: child.avatar} : require('../assets/icons/student.png')} 
                    style={styles.childAvatar}
                />
                <Text style={[
                    styles.childName, 
                    selectedChild?._id === child._id && styles.childNameActive
                ]}>
                    {child.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView style={styles.container}>
        
        {(!classData && selectedChild && !loading) ? (
            <View style={styles.emptyState}>
                <Image source={require('../assets/LogoEduCare.png')} style={styles.classImage} />
                <Text style={styles.emptyText}>Bé {selectedChild.name} chưa được xếp lớp.</Text> 
            </View>
        ) : classData ? (
          <>
            <View style={styles.headerCard}>
              <View style={{flex: 1}}>
                <Text style={styles.className}>{classData.name}</Text>
                <Text style={styles.level}>Khối: {classData.level?.toUpperCase()}</Text>
                <Text style={styles.desc}>{classData.description || "Môi trường học tập năng động"}</Text>
              </View>
              <Image 
                  source={require('../assets/LogoEduCare.png')} style={styles.classImage}
              />
            </View>

            <Text style={styles.sectionTitle}>👩‍🏫 Đội ngũ giáo viên</Text>

            {classData.teachers?.map((t: any) => (
                <View key={t._id} style={styles.teacherCard}>
                  <Image
                    source={t.image ? { uri: `${BASE_URL}${t.image}` } : require('../assets/avatar.png')}
                    style={styles.avatar}
                  />
                  <View style={styles.info}>
                    <Text style={styles.teacherName}>{t.name}</Text>
                    <Text style={styles.role}>Giáo viên phụ trách</Text>
                    <Text style={styles.phone}>{t.phone || "Chưa cập nhật SĐT"}</Text>
                  </View>
                  <TouchableOpacity 
                      style={styles.callBtn} 
                      onPress={() => handleCall(t.phone)}
                  >
                      <Text style={{fontSize: 20}}>📞</Text>
                  </TouchableOpacity>
                </View>
            ))}

            {(!classData.teachers || classData.teachers.length === 0) && (
              <Text style={styles.emptyText}>Chưa có thông tin giáo viên.</Text>
            )}
          </>
        ) : null}
        
        <View style={{height: 40}}/>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Selector Styles
  childSelector: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  classImage: {
    width: 80, 
    height: 80, 
    opacity: 0.9, 
    resizeMode: 'contain',
    borderRadius: 10,
    
  },
  childBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  childBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981'
  },
  childAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  childName: { fontWeight: '600', color: '#666' },
  childNameActive: { color: '#065F46' },

  // Header Styles
  headerCard: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2
  },
  className: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  level: { fontSize: 14, color: '#D1FAE5', marginTop: 4, fontWeight: '600' },
  desc: { color: '#E6FFFA', marginTop: 8, fontStyle: 'italic', fontSize: 13 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#064E3B', marginBottom: 12, marginLeft: 4 },

  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#eee' },
  info: { flex: 1, marginLeft: 14 },
  teacherName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  role: { fontSize: 13, color: '#666', marginTop: 2 },
  phone: { fontSize: 12, color: '#10B981', marginTop: 2 },
  
  callBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#10B981'
  },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20, fontStyle: 'italic' },
  emptyState: { alignItems: 'center', marginTop: 50, opacity: 0.6 }
});