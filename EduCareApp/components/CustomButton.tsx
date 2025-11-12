// components/CustomButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  outline?: boolean;
};

export default function CustomButton({ title, onPress, loading, outline }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, outline ? styles.outline : styles.fill]}
      activeOpacity={0.8}
    >
      {loading ? <ActivityIndicator color={outline ? '#10B981' : '#fff'} /> : <Text style={[styles.text, outline ? styles.textOutline : null]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 10,
  },
  fill: {
    backgroundColor: '#6EE7B7', // mint (Figma)
  },
  outline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  text: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  textOutline: {
    color: '#111827',
  },
});
