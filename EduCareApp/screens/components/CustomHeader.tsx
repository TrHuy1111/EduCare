// components/CustomHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView } from 'react-native';
import { getHeaderTitle } from '@react-navigation/elements';

export default function CustomHeader({ navigation, route, options, back }: any) {
  const title = getHeaderTitle(options, route.name);

  return (
    // Dùng SafeAreaView để tránh tai thỏ (Notch)
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* 👇 Tự động kiểm tra: Nếu có lịch sử stack thì hiện nút Back */}
        {back ? (
          <TouchableOpacity onPress={navigation.goBack} style={styles.backBtn}>
            <Image
              source={require('../../assets/icons/back.png')} 
              style={{ width: 24, height: 24, resizeMode: 'contain' }}
            />
          </TouchableOpacity>
        ) : (
          // Nếu không có nút back thì placeholder để title vẫn căn giữa
          <View style={styles.placeholder} />
        )}

        {/* Title ở giữa */}
        <Text style={styles.title}>{title}</Text>

        {/* Placeholder bên phải để cân bằng layout */}
        <View style={styles.placeholder} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#E6FDF3', 
    borderBottomWidth: 3,
    borderBottomColor: '#d1fae5',
  },
  container: {
    height: 56, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    padding: 8,
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#064E3B', 
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  }
});