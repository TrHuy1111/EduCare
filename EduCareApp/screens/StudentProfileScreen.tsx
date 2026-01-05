// EduCareApp/screens/StudentProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getStudentById } from '../src/services/studentService';

export default function StudentProfileScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  // safe get studentId
  const studentId = (route.params as any)?.studentId;

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!studentId) {
      console.warn('No studentId passed to StudentProfileScreen', route.params);
      Alert.alert('Không tìm thấy học sinh', 'Vui lòng quay lại và chọn học sinh khác.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      return;
    }

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await getStudentById(studentId);
      setStudent(res.data);
      console.log("📌 Student detail:", res.data);
    } catch (err: any) {
      console.log('❌ Lỗi load profile:', err.message || err);
      Alert.alert('Lỗi', 'Không thể tải thông tin học sinh.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />;

  if (!student) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Không có dữ liệu học sinh.</Text>
      </View>
    );
  }

  const getTeacherNames = () => {
  const cls = student?.classId;
  if (cls && typeof cls === 'object' && cls.teachers && cls.teachers.length > 0) {
    return cls.teachers.map((t: any) => t.name).join(", ");
  }
  return "Chưa phân công";
};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../assets/icons/back.png')}
            style={{ width: 24, height: 24, marginRight: 8 }}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Student Profile</Text>
      </View>

      <Image
        source={
          student.avatar
            ? { uri: student.avatar }
            : require('../assets/icons/student.png')
        }
        style={styles.avatar}
      />

      <View style={styles.section}>
        <Text style={styles.label}>Full name</Text>
        <Text style={styles.value}>{student.name}</Text>

        <Text style={styles.label}>Class</Text>
        <Text style={styles.value}>
                         {typeof student.classId === "string" 
                            ? student.classId 
                            : student.classId?.name || "N/A"}
                      </Text>
        <Text style={styles.label}>Teachers</Text>
        <Text style={styles.value}>{getTeacherNames()}</Text>                      
        <Text style={styles.label}>Address</Text>
        <Text style={styles.value}>{student.address}</Text>

        <Text style={styles.label}>Date of birth</Text>
        <Text style={styles.value}>
          {student.dob ? new Date(student.dob).toLocaleDateString('vi-VN') : 'N/A'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <Text style={styles.value}>{student.motherName ?? 'N/A'} / Mother</Text>
        <Text style={styles.value}>{student.motherPhone ?? 'N/A'}</Text>
        <Text style={styles.value}>{student.fatherName ?? 'N/A'} / Father</Text>
        <Text style={styles.value}>{student.fatherPhone ?? 'N/A'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6FDF3', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  headerText: { fontSize: 20, fontWeight: 'bold', color: '#064E3B' },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginVertical: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  label: { fontWeight: '600', color: '#047857', marginTop: 6 },
  value: { color: '#065f46', fontSize: 14 },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#064E3B',
    marginBottom: 8,
  },
});
