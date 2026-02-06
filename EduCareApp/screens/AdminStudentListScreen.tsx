// AdminStudentListScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TextInput
} from 'react-native';
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList  } from '../navigation/AdminNavigator';
import { getAllStudents, deleteStudent } from '../src/services/studentService';
import { getAllClasses } from '../src/services/classService';
import { Image } from 'react-native';
type NavProp = NativeStackNavigationProp<AdminStackParamList, 'AdminStudentList'>;

type Student = {
  _id: string;
  name: string;
  classId?: {
    _id: string;
    name: string;
    level?: string;
  } | string;  // populate hoặc ObjectId string
  teacher?: {
    _id: string;
    name: string;
    email: string;
  } | string;
  address?: string;
  dob?: string;
  gender?: string;
};


// 🧠 Màn hình danh sách học sinh (Admin / Teacher)
export default function AdminStudentListScreen() {
  const navigation = useNavigation<NavProp>();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [classes, setClasses] = useState<any[]>([]); 
  const [searchText, setSearchText] = useState("");
  const [filterClassId, setFilterClassId] = useState("");

  const loadClasses = async () => {
    try {
      const res = await getAllClasses();
      setClasses(res.data);
    } catch (err) {
      console.log("Error loading classes", err);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      // Gọi service với tham số
      const res = await getAllStudents({ 
        name: searchText, 
        classId: filterClassId 
      });
      setStudents(res.data || []);
    } catch (err: any) {
      console.error('❌ Lỗi tải học sinh:', err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadClasses();
  }, []);

  useFocusEffect(
    useCallback(() => {
      
      const timer = setTimeout(() => {
        loadStudents();
      }, 500);
      return () => clearTimeout(timer);
    }, [searchText, filterClassId]) 
  );
  const handleDelete = async (id: string) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this student?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteStudent(id);
            setStudents(prev => prev.filter(s => s._id !== id));
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadStudents);
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }: { item: Student }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('AdminStudentForm', { editId: item._id } as never)
      }>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.info}>
          Class: {typeof item.classId === "string" 
              ? item.classId 
              : item.classId?.name || "N/A"}
        </Text>
        <Text style={styles.info}>Gender: {item.gender || 'N/A'}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDelete(item._id)}>
        <Text style={{ color: 'white' }}>🗑</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
   
    <View style={styles.filterContainer}>
        {/* Ô tìm tên */}
        <View style={styles.searchBox}>
          <Text style={{marginRight: 8}}>🔍</Text>
          <TextInput 
            style={styles.searchInput}
            placeholder="Tìm tên học sinh..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Dropdown chọn lớp */}
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={filterClassId}
            onValueChange={(itemValue) => setFilterClassId(itemValue)}
            style={{ height: 50, width: '100%' }}
          >
            <Picker.Item label="-- Tất cả lớp --" value="" />
            {classes.map((cls) => (
              <Picker.Item key={cls._id} label={cls.name} value={cls._id} />
            ))}
          </Picker>
        </View>
      </View>

    {loading ? (
      <ActivityIndicator size="large" color="#2bbf9a" />
    ) : (
      <FlatList
        data={students}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 30 }}>
            No students found.
          </Text>
        }
      />
    )}

    <TouchableOpacity
      style={styles.addBtn}
      onPress={() => navigation.navigate('AdminStudentForm' as never)}>
      <Text style={styles.addText}>＋</Text>
    </TouchableOpacity>
  </View>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6FDF3', padding: 12 },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#064E3B',
    textAlign: 'center',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  name: { fontSize: 16, fontWeight: '600', color: '#064E3B' },
  info: { color: '#065f46' },
  deleteBtn: {
    backgroundColor: '#dc2626',
    padding: 8,
    borderRadius: 6,
  },
  addBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#2bbf9a',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 6,
  },
  addText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: 'bold',
  },headerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 12,
  position: 'relative',
},
backBtn: {
  position: 'absolute',
  left: 0,
  paddingHorizontal: 10,
  paddingVertical: 6,
},
backIcon: {
  width: 28,
  height: 28,
  resizeMode: 'contain',
},
filterContainer: {
    marginBottom: 10,
    gap: 10
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 45
  },
  searchInput: {
    flex: 1,
    fontSize: 16
  },
  pickerBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    height: 45 
  }
});
