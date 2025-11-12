import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {useState, useEffect }  from 'react';
import auth from '@react-native-firebase/auth';
export default function DashboardScreen() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      setUserName(user.displayName || user.email?.split('@')[0] || 'User');
    }
  }, []);
  const features = [
    { name: 'Attendance', image: require('../assets/icons/attendance.png') },
    { name: 'Calendar', image: require('../assets/icons/calendar.png') },
    { name: 'Report', image: require('../assets/icons/report.png') },
    { name: 'Message', image: require('../assets/icons/message.png'),route : 'TeacherStudentList' },// for testing teacher student list screen
    { name: 'Students Management', image: require('../assets/icons/student.png'), route: 'AdminStudentList' },
    { name: 'Users Management', image: require('../assets/icons/teacher.png'), route: 'AdminUserList'},
    { name: 'Class Managament', image: require('../assets/icons/class.png'),route : 'AdminClassManagement' },
    
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Hi,👋 {userName}</Text>
      <View style={styles.grid}>
        {features.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => item.route && navigation.navigate(item.route as never)}>
            <Image source={item.image} style={styles.icon} />
            <Text style={styles.label}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  icon: { width: 40, height: 40, marginBottom: 8, resizeMode: 'contain' },
  label: { marginTop: 4, fontWeight: '600', color: '#065f46' },
});
