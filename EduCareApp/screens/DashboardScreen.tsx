import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { getCurrentUserRole } from '../src/services/userService';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();

  const [userName, setUserName] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 🧩 Lấy user name từ Firebase
  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      setUserName(user.displayName || user.email?.split('@')[0] || 'User');
    }
  }, []);

  // 🧩 Lấy role từ backend qua userService
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const userRole = await getCurrentUserRole();  // 🔥 Gọi API BE
        setRole(userRole);
      } catch (err) {
        console.error("❌ Error fetching role:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, []);

  // Mapping menu
  const features = [
  { name: 'Student', image: require('../assets/icons/student.png'), route: 'TeacherStudentList', roles: ['teacher', 'admin'] },
  { name: 'Users Management', image: require('../assets/icons/teacher.png'), route: 'AdminUserList', roles: ['admin'] },
  { name: 'Class Management', image: require('../assets/icons/class.png'), route: 'AdminClassManagement', roles: ['admin'] },
  { name: 'Student Management', image: require('../assets/icons/kid_management.png'), route: 'AdminStudentList', roles: ['admin'] },
  { name: 'Attendance', image: require('../assets/icons/attendance.png'), route: 'AttendanceHome', roles: ['teacher'] },
  { name: 'Activities', image: require('../assets/icons/calendar.png'), route: 'TeacherActivity', roles: ['teacher'] },
  { name: 'Announcements', image: require('../assets/icons/anouncement.png'), route: role === 'admin' ? 'AdminAnnouncementList' : undefined, roles: ['admin'] },
  { name: 'Tuition Management', image: require('../assets/icons/tuition.png'), route: role === 'admin' ? 'AdminFeeConfig' : undefined, roles: ['admin'] },
  { name: 'Generate Tuition', image: require('../assets/icons/tuition.png'), route: role === 'admin' ? 'AdminTuitionGenerate' : undefined, roles: ['admin'] },
  { name: 'View Invoices', image: require('../assets/icons/tuition.png'), route: role === 'admin' ? 'AdminTuitionList' : undefined, roles: ['admin'] },
  { name: 'My Tuition', image: require('../assets/icons/tuition.png'), route: 'ParentTuition', roles: ['parent'] },
  { name: 'Camera Management', image: require('../assets/camera.png'), route: 'AdminCamera', roles: ['admin'] },
  { name: 'Class Camera', image: require('../assets/camera.png'), route: 'ParentCamera', roles: ['parent'] },
  { name: 'Activities', image: require('../assets/icons/calendar.png'), route: 'ParentActivities', roles: ['parent'] },
  { name: 'Feedback', image: require('../assets/icons/feedback.png'), route: 'TeacherFeedBackScreen', roles: ['teacher'] },
  { name: 'FeedBack', image: require('../assets/icons/feedback.png'), route: 'ParentFeedBackScreen', roles: ['parent'] },
  { name: 'Statistics', image: require('../assets/icons/feedback.png'), route: 'TeacherStatsScreen', roles: ['teacher'] },
];

  // 🔥 Điều hướng theo role và nested navigator
  const handleNavigation = (route?: string) => {
    if (!route) return;

    if (['TeacherStudentList', 'StudentFilter', 'StudentProfile', 'AttendanceHome','TeacherActivity', 'TeacherFeedBackScreen', 'TeacherStatsScreen'].includes(route)) {
      navigation.navigate('TeacherApp', { screen: route });
      return;
    }

    if (['AdminStudentList', 'AdminUserList', 'AdminClassManagement','AdminAnnouncementList', 'AdminFeeConfig','AdminTuitionGenerate','AdminTuitionList', 'AdminTuitionDetail', 'AdminCamera'].includes(route)) {
      navigation.navigate('AdminApp', { screen: route });
      return;
    }
    if (['ParentTuition', 'ParentCamera', 'ParentActivities', 'ParentFeedBackScreen'].includes(route)) {
      navigation.navigate('ParentApp', { screen: route });
      return;
    }
  };

  // wait for role to be fetched
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Hi 👋 {userName}</Text>

      <View style={styles.grid}>
        {features
          .filter(item => role !== null && item.roles.includes(role))
          .map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => handleNavigation(item.route)}
            >
              <Image source={item.image} style={styles.icon} />
              <Text style={styles.label}>{item.name}</Text>
            </TouchableOpacity>
          ))}
      </View>
    </ScrollView>
  );
}

// 🧩 Styles
const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#E6FDF3', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20, color: '#064E3B' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  icon: { width: 40, height: 40, marginBottom: 8, resizeMode: 'contain' },
  label: { marginTop: 4, fontWeight: '600', color: '#065f46' },
});
