import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

export function DeviceStatusCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="hardware-chip-outline" size={24} color={Colors.light.primary} />
        <Text style={styles.title}>SMART MEDICINE BOX</Text>
      </View>
      
      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          <Text style={styles.label}>Device Status:</Text>
          <View style={styles.valueContainer}>
            <View style={[styles.dot, { backgroundColor: Colors.light.success }]} />
            <Text style={styles.value}>Connected</Text>
          </View>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.label}>Wi-Fi:</Text>
          <View style={styles.valueContainer}>
            <View style={[styles.dot, { backgroundColor: Colors.light.success }]} />
            <Text style={styles.value}>Connected</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h3,
    color: Colors.light.text,
    marginLeft: Spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flex: 1,
  },
  label: {
    ...Typography.caption,
    color: Colors.light.textMuted,
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  value: {
    ...Typography.body2,
    fontWeight: '600',
    color: Colors.light.text,
  },
});
