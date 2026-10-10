import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';
import { Medicine } from '../models/medicine';

interface MedicineCardProps {
  medicine: Medicine;
  isNextReminder?: boolean;
}

export function MedicineCard({ medicine, isNextReminder = false }: MedicineCardProps) {
  // Format time from "14:30:00" to "02:30 PM" if needed
  const formatTime = (timeString: string) => {
    try {
      // Basic check for HH:mm:ss
      if (timeString.includes(':')) {
        const parts = timeString.split(':');
        if (parts.length >= 2) {
          let hours = parseInt(parts[0], 10);
          const minutes = parts[1];
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12; // the hour '0' should be '12'
          return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
        }
      }
      return timeString;
    } catch {
      return timeString;
    }
  };

  const displayTime = formatTime(medicine.time);

  return (
    <View style={[styles.card, isNextReminder && styles.nextReminderCard]}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name="medical" 
          size={24} 
          color={isNextReminder ? Colors.light.surface : Colors.light.primary} 
        />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.name, isNextReminder && styles.textLight]}>{medicine.name}</Text>
        <Text style={[styles.details, isNextReminder && styles.textLightMuted]}>
          {medicine.dose} • Compartment {medicine.compartment}
        </Text>
      </View>

      <View style={styles.timeContainer}>
        <Text style={[styles.time, isNextReminder && styles.textLight]}>{displayTime}</Text>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: medicine.status === 'active' ? Colors.light.success : Colors.light.warning }
        ]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  nextReminderCard: {
    backgroundColor: Colors.light.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(11, 82, 91, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: 4,
  },
  details: {
    ...Typography.body2,
    color: Colors.light.textMuted,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  time: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: 4,
  },
  statusBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  textLight: {
    color: Colors.light.surface,
  },
  textLightMuted: {
    color: 'rgba(255,255,255,0.7)',
  }
});
