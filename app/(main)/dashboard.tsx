import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, AppState, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { DeviceStatusCard } from '../../components/DeviceStatusCard';
import { MedicineCard } from '../../components/MedicineCard';
import { QuickActionCard } from '../../components/QuickActionCard';
import { Medicine } from '../../models/medicine';
import { Ionicons } from '@expo/vector-icons';
import { getTodaysMedicines } from '../../services/medicineService';
import { getTodayDoses, generateTodaysDoses } from '../../services/doseService';
import { DoseLog } from '../../models/dose';
import { requestNotificationPermissions, syncNotifications } from '../../services/notificationService';

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) {
    return 'Good Morning 👋';
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon 👋';
  } else if (hour >= 17 && hour < 21) {
    return 'Good Evening 👋';
  } else {
    return 'Good Night 👋';
  }
}

export default function DashboardScreen() {
  const [greeting, setGreeting] = useState(() => getGreeting(new Date().getHours()));
  const [todayMedicines, setTodayMedicines] = useState<Medicine[]>([]);
  const [todayDoses, setTodayDoses] = useState<DoseLog[]>([]);
  const [loading, setLoading] = useState(true);

  const updateGreeting = useCallback(() => {
    setGreeting(getGreeting(new Date().getHours()));
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const meds = await getTodaysMedicines();
      setTodayMedicines(meds);
      
      await generateTodaysDoses();
      const doses = await getTodayDoses();
      setTodayDoses(doses);

      // Notification sync
      await requestNotificationPermissions();
      await syncNotifications(doses);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      updateGreeting();
      fetchMedicines();
    }, [updateGreeting])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        updateGreeting();
        fetchMedicines();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [updateGreeting]);

  // Determine next reminder based on time
  const getNextReminder = () => {
    if (todayMedicines.length === 0) return null;
    
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeMinutes = currentHours * 60 + currentMinutes;

    for (const med of todayMedicines) {
      if (med.time) {
        const parts = med.time.split(':');
        if (parts.length >= 2) {
          const medTimeMinutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
          if (medTimeMinutes >= currentTimeMinutes) {
            return med;
          }
        }
      }
    }
    
    // If all times today have passed, return the first one for tomorrow
    return todayMedicines[0];
  };

  const nextReminder = getNextReminder();

  const scheduledCount = todayDoses.length;
  const takenCount = todayDoses.filter(d => d.status === 'taken').length;
  const upcomingCount = todayDoses.filter(d => d.status === 'pending').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.subtitle}>Your medication, organized.</Text>
          </View>
          <View style={styles.profileAvatar}>
            <Ionicons name="person-outline" size={24} color={Colors.light.primary} />
          </View>
        </View>

        <DeviceStatusCard />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NEXT REMINDER</Text>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.light.primary} style={styles.loader} />
          ) : nextReminder ? (
            <MedicineCard medicine={nextReminder} isNextReminder />
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No upcoming reminders.</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TODAY'S SCHEDULE SUMMARY</Text>
            <TouchableOpacity onPress={() => router.push('/(main)/schedule')}>
              <Text style={styles.seeAllText}>View Schedule</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryValue}>{scheduledCount}</Text>
              <Text style={styles.summaryLabel}>Scheduled</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>{takenCount}</Text>
              <Text style={styles.summaryLabel}>Taken</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryValue, { color: Colors.light.primary }]}>{upcomingCount}</Text>
              <Text style={styles.summaryLabel}>Upcoming</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TODAY&apos;S MEDICINES</Text>
            <TouchableOpacity onPress={() => router.push('/(main)/medicines')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator size="small" color={Colors.light.primary} style={styles.loader} />
          ) : todayMedicines.length > 0 ? (
            todayMedicines.map((med) => (
              <MedicineCard key={med.id} medicine={med} />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No medicines for today.</Text>
              <TouchableOpacity onPress={() => router.push('/(main)/add-medicine' as any)} style={styles.addMedLink}>
                <Text style={styles.addMedText}>Add Medicine</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          <View style={styles.actionGrid}>
            <QuickActionCard 
              title="Add Medicine" 
              icon="add-circle-outline" 
              onPress={() => router.push('/(main)/add-medicine' as any)} 
            />
            <QuickActionCard 
              title="Schedule" 
              icon="calendar-outline" 
              onPress={() => router.push('/(main)/schedule')} 
            />
          </View>
          <View style={styles.actionGrid}>
            <QuickActionCard 
              title="History" 
              icon="time-outline" 
              onPress={() => router.push('/(main)/history')} 
            />
            <QuickActionCard 
              title="Alerts" 
              icon="notifications-outline" 
              onPress={() => router.push('/(main)/alerts')} 
            />
          </View>
          <View style={styles.actionGrid}>
            <QuickActionCard 
              title="Caregiver" 
              icon="people-outline" 
              onPress={() => router.push('/(main)/caregiver')} 
            />
            <QuickActionCard 
              title="Settings" 
              icon="settings-outline" 
              onPress={() => router.push('/(main)/settings')} 
            />
          </View>
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  greeting: {
    ...Typography.h1,
    color: Colors.light.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.light.textMuted,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(11, 82, 91, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.light.textMuted,
    letterSpacing: 1,
  },
  seeAllText: {
    ...Typography.body2,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomPadding: {
    height: 40,
  },
  loader: {
    padding: Spacing.md,
  },
  emptyCard: {
    padding: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body1,
    color: Colors.light.textMuted,
  },
  addMedLink: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
  },
  addMedText: {
    ...Typography.button,
    color: Colors.light.primary,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryStat: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    ...Typography.h2,
    color: Colors.light.text,
    marginBottom: 4,
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.light.textMuted,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.light.border,
  }
});
