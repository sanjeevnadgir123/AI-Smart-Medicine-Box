import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/constants/theme';
import { AppTextInput } from '../../src/components/common/AppTextInput';
import { AppButton } from '../../src/components/common/AppButton';
import { getMedicineById, updateMedicine } from '../../src/services/medicineService';
import { MedicineRepeat, MedicineStatus } from '../../src/models/medicine';
import { deletePendingDosesForMedicine, generateTodaysDoses, getTodayDoses } from '../../src/services/doseService';
import { syncNotifications } from '../../src/services/notificationService';

export default function EditMedicineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [compartment, setCompartment] = useState<number>(1);
  const [repeat, setRepeat] = useState<MedicineRepeat>('daily');
  const [status, setStatus] = useState<MedicineStatus>('active');
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      Alert.alert('Error', 'Medicine ID not found.');
      router.back();
      return;
    }

    const loadMedicine = async () => {
      try {
        const med = await getMedicineById(id);
        setName(med.name);
        setDose(med.dose);
        setCompartment(med.compartment);
        setRepeat(med.repeat);
        setStatus(med.status);
        
        // Parse time string 'HH:mm:ss' back to Date object
        if (med.time) {
          const parts = med.time.split(':');
          if (parts.length >= 2) {
            const date = new Date();
            date.setHours(parseInt(parts[0], 10));
            date.setMinutes(parseInt(parts[1], 10));
            date.setSeconds(0);
            setTime(date);
          }
        }
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Unable to load medicine details.');
        router.back();
      } finally {
        setInitialLoading(false);
      }
    };

    loadMedicine();
  }, [id]);

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a medicine name.');
      return;
    }
    if (!dose.trim()) {
      Alert.alert('Error', 'Please enter a dose.');
      return;
    }
    if (!id) return;

    try {
      setLoading(true);
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}:00`;

      // Clean up old pending doses and notifications
      await deletePendingDosesForMedicine(id);

      await updateMedicine(id, {
        name: name.trim(),
        dose: dose.trim(),
        time: timeString,
        compartment,
        repeat,
        status,
      });

      // Regenerate doses and sync notifications for the updated medicine
      await generateTodaysDoses();
      const todayDoses = await getTodayDoses();
      await syncNotifications(todayDoses);

      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Unable to update this medicine. Please try again.');
      setLoading(false);
    }
  };

  const renderCompartmentOptions = () => {
    const options = [1, 2, 3, 4, 5, 6, 7, 8];
    return (
      <View style={styles.optionsGrid}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.optionButton,
              compartment === opt && styles.optionButtonActive
            ]}
            onPress={() => setCompartment(opt)}
          >
            <Text style={[
              styles.optionText,
              compartment === opt && styles.optionTextActive
            ]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderRepeatOptions = () => {
    const options: { label: string; value: MedicineRepeat }[] = [
      { label: 'Once', value: 'once' },
      { label: 'Every day', value: 'daily' },
      { label: 'Weekdays', value: 'weekdays' },
      { label: 'Custom', value: 'custom' },
    ];
    
    return (
      <View style={styles.repeatGrid}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.repeatButton,
              repeat === opt.value && styles.repeatButtonActive
            ]}
            onPress={() => setRepeat(opt.value)}
          >
            <Text style={[
              styles.repeatText,
              repeat === opt.value && styles.repeatTextActive
            ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderStatusOptions = () => {
    return (
      <View style={styles.repeatGrid}>
        <TouchableOpacity
          style={[
            styles.repeatButton,
            status === 'active' && styles.statusActiveButton
          ]}
          onPress={() => setStatus('active')}
        >
          <Text style={[
            styles.repeatText,
            status === 'active' && styles.repeatTextActive
          ]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.repeatButton,
            status === 'inactive' && styles.statusInactiveButton
          ]}
          onPress={() => setStatus('inactive')}
        >
          <Text style={[
            styles.repeatText,
            status === 'inactive' && styles.repeatTextActive
          ]}>
            Inactive
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Edit Medicine</Text>

        <AppTextInput
          label="Medicine Name"
          placeholder="e.g. Paracetamol"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <AppTextInput
          label="Dose"
          placeholder="e.g. 500 mg or 1 tablet"
          value={dose}
          onChangeText={setDose}
        />

        <View style={styles.section}>
          <Text style={styles.label}>Time</Text>
          {Platform.OS === 'ios' ? (
            <View style={styles.iosTimePickerContainer}>
              <DateTimePicker
                value={time}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            </View>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.timeDisplay}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.timeText}>
                  {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Compartment</Text>
          {renderCompartmentOptions()}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Repeat</Text>
          {renderRepeatOptions()}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Status</Text>
          {renderStatusOptions()}
        </View>

        <View style={styles.bottomPadding} />
        
        <AppButton 
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.primary,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.label,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  iosTimePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  timeDisplay: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    backgroundColor: Colors.light.surface,
  },
  timeText: {
    ...Typography.body1,
    color: Colors.light.text,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  optionButton: {
    width: '21%',
    margin: '2%',
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  optionText: {
    ...Typography.h3,
    color: Colors.light.text,
  },
  optionTextActive: {
    color: Colors.light.surface,
  },
  repeatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  repeatButton: {
    width: '46%',
    margin: '2%',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  statusActiveButton: {
    backgroundColor: Colors.light.success,
    borderColor: Colors.light.success,
  },
  statusInactiveButton: {
    backgroundColor: Colors.light.textMuted,
    borderColor: Colors.light.textMuted,
  },
  repeatText: {
    ...Typography.body1,
    fontWeight: '500',
    color: Colors.light.text,
  },
  repeatTextActive: {
    color: Colors.light.surface,
  },
  bottomPadding: {
    height: 20,
  },
  saveButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
  }
});
