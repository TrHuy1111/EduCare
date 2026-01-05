import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Switch, Alert, TextInput, ActivityIndicator } from 'react-native';
import { fetchAllUsers, updateUserRole, toggleUserStatus } from '../src/services/userService';

export default function AdminUserListScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetchAllUsers(searchText);
      setUsers(res.data);
    } catch (err: any) {
      console.error('❌ Lỗi tải user:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      Alert.alert('✅ Thành công', 'Đã đổi vai trò người dùng');
      loadUsers();
    } catch (err: any) {
      Alert.alert('❌ Lỗi', err.message);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus(userId, !currentStatus);
      loadUsers();
    } catch (err: any) {
      Alert.alert('❌ Lỗi', err.message);
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={[styles.card, !item.isActive && styles.inactiveCard]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name || 'Không tên'}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.role}>👤 Vai trò: {item.role}</Text>
      </View>

      {/* Đổi Role */}
      <View style={styles.roleButtons}>
        {['parent', 'teacher', 'admin'].map((role) => (
          <TouchableOpacity
            key={role}
            style={[
              styles.roleBtn,
              item.role === role && styles.activeRoleBtn
            ]}
            onPress={() => handleRoleChange(item._id, role)}
          >
            <Text style={{ color: item.role === role ? '#fff' : '#065f46' }}>
              {role}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bật/tắt tài khoản */}
      <View style={styles.switchContainer}>
        <Text style={{ color: item.isActive ? '#047857' : '#dc2626' }}>
          {item.isActive ? 'Hoạt động' : 'Vô hiệu'}
        </Text>
        <Switch
          value={item.isActive}
          onValueChange={() => handleStatusToggle(item._id, item.isActive)}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👥 Quản lý người dùng</Text>
      <View style={styles.searchBox}>
        <Text style={{marginRight: 8}}>🔍</Text>
        <TextInput 
          style={styles.input}
          placeholder="Tìm tên, email hoặc số điện thoại..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      {loading ? (
        <Text>Đang tải...</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ecfdf5', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#065f46', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inactiveCard: { backgroundColor: '#fee2e2' },
  name: { fontSize: 18, fontWeight: '600', color: '#065f46' },
  email: { color: '#6b7280' },
  role: { marginTop: 4, color: '#065f46' },
  roleButtons: { flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' },
  roleBtn: {
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginHorizontal: 2,
  },
  activeRoleBtn: {
    backgroundColor: '#10b981',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 45
  },
  input: {
    flex: 1,
    height: '100%',
  }
});
