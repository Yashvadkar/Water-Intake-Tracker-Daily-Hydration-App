/**
 * Profile Screen — Settings & Configurable Daily Goal
 *
 * Engineering Rationale:
 *   - Configurable daily goal lives in the Profile tab (contest requirement)
 *   - Preset goal buttons for common targets (2000, 2500, 3000, 3500ml)
 *   - Maintains the Aqua-Minimalist visual language
 *   - Includes engine debug log viewer for AI Logs demonstration
 */

import { useState, useCallback } from 'react'
import { View, ScrollView, StyleSheet, Pressable, Platform, TextInput, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { useHydrationStore } from '@/lib/stores/hydrationStore'
import {
  BG,
  CYAN_FROST,
  DEEP_AZURE,
  AQUA_GLOW,
  SURFACE,
  SURFACE2,
  BORDER,
  BORDER_ACTIVE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  ACCENT_DIM,
  ACCENT_BORDER,
  CARD_RADIUS,
} from '@/lib/theme'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'

const GOAL_PRESETS = [2000, 2500, 3000, 3500]

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { dailyGoal, setDailyGoal, streak, currentIntake, percentage, entries, resetDay, getEngineLogs } =
    useHydrationStore()

  const [customGoal, setCustomGoal] = useState('')
  const [showLogs, setShowLogs] = useState(false)

  const handleSetGoal = useCallback(
    (goal: number) => {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
      setDailyGoal(goal)
    },
    [setDailyGoal]
  )

  const handleCustomGoal = useCallback(() => {
    const val = parseInt(customGoal, 10)
    if (!isNaN(val) && val >= 500 && val <= 10000) {
      handleSetGoal(val)
      setCustomGoal('')
    }
  }, [customGoal, handleSetGoal])

  const engineLogs = getEngineLogs()
  const displayStreak = streak + (percentage >= 100 ? 1 : 0)

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Profile Header ─────────────────────────────────────────────────── */}
      <Card style={styles.heroCard}>
        <LinearGradient
          colors={['rgba(147,198,231,0.12)', 'rgba(10,38,71,0.30)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>💧</Text>
        </View>
        <Text style={styles.name}>HydraFlow</Text>
        <Text style={styles.metaText}>Water Intake Tracker</Text>
      </Card>

      {/* ── Daily Goal Configuration ───────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>DAILY GOAL</Text>
      <Card style={styles.goalCard}>
        <Text style={styles.currentGoal}>
          Current: <Text style={styles.goalHighlight}>{dailyGoal}ml</Text>
        </Text>

        <View style={styles.presetRow}>
          {GOAL_PRESETS.map((preset) => (
            <Pressable
              key={preset}
              onPress={() => handleSetGoal(preset)}
              android_ripple={{
                color: 'rgba(147,198,231,0.25)',
                borderless: false,
              }}
              style={[
                styles.presetBtn,
                dailyGoal === preset && styles.presetBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.presetText,
                  dailyGoal === preset && styles.presetTextActive,
                ]}
              >
                {preset >= 1000 ? `${preset / 1000}L` : `${preset}ml`}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.customRow}>
          <TextInput
            value={customGoal}
            onChangeText={setCustomGoal}
            placeholder="Custom goal (ml)"
            placeholderTextColor={TEXT_TERTIARY}
            keyboardType="numeric"
            style={styles.customInput}
            returnKeyType="done"
            onSubmitEditing={handleCustomGoal}
          />
          <Pressable
            onPress={handleCustomGoal}
            style={styles.customBtn}
            android_ripple={{ color: 'rgba(147,198,231,0.25)' }}
          >
            <Text style={styles.customBtnText}>Set</Text>
          </Pressable>
        </View>
      </Card>

      {/* ── Stats Summary ──────────────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>TODAY'S SUMMARY</Text>
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Intake</Text>
          <Text style={styles.summaryValue}>{currentIntake}ml</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryDivider]}>
          <Text style={styles.summaryLabel}>Progress</Text>
          <Text style={styles.summaryValue}>{percentage}%</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryDivider]}>
          <Text style={styles.summaryLabel}>Entries</Text>
          <Text style={styles.summaryValue}>{entries.length}</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryDivider]}>
          <Text style={styles.summaryLabel}>Streak</Text>
          <Text style={styles.summaryValue}>{displayStreak} days</Text>
        </View>
      </Card>

      {/* ── Engine Debug Logs (for AI Logs demo) ───────────────────────────── */}
      <Text style={styles.sectionTitle}>ENGINE LOGS</Text>
      <Pressable onPress={() => setShowLogs(!showLogs)}>
        <Card style={styles.logsCard}>
          <Text style={styles.logsTitle}>
            HydrationEngine™ Execution Trace {showLogs ? '▼' : '▶'}
          </Text>
          <Text style={styles.logsSub}>
            {engineLogs.length} node traversals recorded
          </Text>
          {showLogs && engineLogs.length > 0 && (
            <View style={styles.logsBody}>
              {engineLogs.slice(-10).map((log, i) => (
                <Text key={i} style={styles.logEntry}>
                  [{new Date(log.timestamp).toLocaleTimeString()}] {log.nodeId}{' '}
                  ({log.durationMs}ms) →{' '}
                  {log.outputSnapshot.currentIntake}ml /{' '}
                  {log.outputSnapshot.percentage}%
                </Text>
              ))}
            </View>
          )}
        </Card>
      </Pressable>

      {/* ── Reset Day (Debug) ──────────────────────────────────────────────── */}
      <Pressable
        onPress={() => {
          Alert.alert(
            "Reset Today's Data?",
            "This will clear your water intake for today. Your history and streak will be preserved.",
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Reset", 
                style: "destructive", 
                onPress: () => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
                  resetDay()
                }
              }
            ]
          )
        }}
        style={({ pressed }) => [styles.resetBtn, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.resetText}>Reset Today's Data</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14 },

  heroCard: {
    overflow: 'hidden',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 20,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(147,198,231,0.15)',
    marginBottom: 4,
  },
  avatarText: { fontSize: 32 },
  name: { fontSize: 22, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.4 },
  metaText: { fontSize: 12.5, color: TEXT_SECONDARY },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_TERTIARY,
    letterSpacing: 0.8,
    marginTop: 4,
  },

  goalCard: { gap: 14, paddingVertical: 16 },
  currentGoal: { fontSize: 14, color: TEXT_SECONDARY, fontWeight: '600' },
  goalHighlight: { color: CYAN_FROST, fontWeight: '800', fontSize: 16 },

  presetRow: { flexDirection: 'row', gap: 8 },
  presetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  presetBtnActive: {
    backgroundColor: AQUA_GLOW,
    borderColor: CYAN_FROST,
  },
  presetText: { fontSize: 13, fontWeight: '700', color: TEXT_SECONDARY },
  presetTextActive: { color: TEXT_PRIMARY },

  customRow: { flexDirection: 'row', gap: 8 },
  customInput: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: '600',
  },
  customBtn: {
    height: 42,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: AQUA_GLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customBtnText: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },

  summaryCard: { paddingVertical: 4, paddingHorizontal: 0 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  summaryDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  summaryLabel: { fontSize: 14, color: TEXT_SECONDARY, fontWeight: '500' },
  summaryValue: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },

  logsCard: { gap: 4, paddingVertical: 14 },
  logsTitle: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },
  logsSub: { fontSize: 12, color: TEXT_SECONDARY },
  logsBody: {
    marginTop: 8,
    backgroundColor: SURFACE,
    borderRadius: 8,
    padding: 10,
  },
  logEntry: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: CYAN_FROST,
    lineHeight: 16,
  },

  resetBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  resetText: { fontSize: 14, color: 'rgba(248,113,113,0.7)', fontWeight: '600' },
})
