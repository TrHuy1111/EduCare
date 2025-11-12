import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllStudents } from '../src/services/studentService';

export default function TeacherStudentListScreen() {
  const navigation = useNavigation();
  const [students, setStudents] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getAllStudents();
      setStudents(res.data || []);
      setFiltered(res.data || []);
    } catch (err: any) {
      console.log('❌ Lỗi tải dữ liệu:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (!text) setFiltered(students);
    else {
      const newData = students.filter((s) =>
        s.name.toLowerCase().includes(text.toLowerCase())
      );
      setFiltered(newData);
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Image
        source={
          item.avatar
            ? { uri: item.avatar }
            : require('../assets/icons/student.png')
        }
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.info}>Class: {item.class || 'N/A'}</Text>
        <Text style={styles.info}>Gender: {item.gender}</Text>
      </View>
      <TouchableOpacity
        style={styles.detailBtn}
        onPress={() => navigation.navigate('StudentProfile' as never)}>
        <Text style={{ fontSize: 18 }}>▶</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🧑‍🏫 Student List</Text>

      <TextInput
        style={styles.searchBox}
        placeholder="Search student..."
        value={search}
        onChangeText={handleSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#10B981" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 40 }}>No students found</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6FDF3', padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#064E3B',
    marginBottom: 12,
    textAlign: 'center',
  },
  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  name: { fontSize: 16, fontWeight: '600', color: '#064E3B' },
  info: { fontSize: 13, color: '#047857' },
  detailBtn: {
    backgroundColor: '#A7F3D0',
    borderRadius: 30,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
