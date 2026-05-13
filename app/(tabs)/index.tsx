/**
 * Home Screen — Bento Grid Hydration Dashboard
 *
 * Engineering Rationale:
 *   - Bento Grid layout provides visual hierarchy (hero ring spans full width)
 *   - One-tap quick-log buttons with android_ripple for native feel
 *   - expo-haptics for tactile feedback on water logging
 *   - All state changes flow through the HydrationEngine directed graph
 *   - Cards use glassmorphism-style surfaces from the Aqua-Minimalist theme
 */

import { useCallback, useEffect } from 'react'
import { View, ScrollView, StyleSheet, Pressable, Platform } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import WaterRing from '@/components/WaterRing'
import MilestoneToast from '@/components/MilestoneToast'
import { useHydrationStore } from '@/lib/stores/hydrationStore'
import { HydrationEngine } from '@/lib/logic/HydrationEngine'
import { MILESTONE_MAP, type MilestoneType } from '@/lib/logic/types'
import {
  BG,
  CYAN_FROST,
  DEEP_AZURE,
  AQUA_GLOW,
  SURFACE,
  SURFACE2,
  BORDER,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  ACCENT_DIM,
  ACCENT_BORDER,
  MILESTONE_25,
  MILESTONE_50,
  MILESTONE_75,
  MILESTONE_100,
  CARD_RADIUS,
} from '@/lib/theme'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'

// ── Quick-log presets ─────────────────────────────────────────────────────────

const PRESETS = [
  { amount: 200, label: '200ml', icon: '🥤' },
  { amount: 500, label: '500ml', icon: '🫗' },
  { amount: 750, label: '750ml', icon: '🍶' },
]

// ── Milestone badge data ──────────────────────────────────────────────────────

const BADGE_DATA: { threshold: MilestoneType; color: string }[] = [
  { threshold: 25, color: MILESTONE_25 },
  { threshold: 50, color: MILESTONE_50 },
  { threshold: 75, color: MILESTONE_75 },
  { threshold: 100, color: MILESTONE_100 },
]

export default function HomeScreen(): React.ReactNode {
  const insets = useSafeAreaInsets()
  const {
    currentIntake,
    dailyGoal,
    percentage,
    achievedMilestones,
    pendingMilestone,
    streak,
    entries,
    logWater,
    dismissMilestone,
  } = useHydrationStore()

  // Rollover check on mount
  useEffect(() => {
    const state = useHydrationStore.getState()
    const rolled = HydrationEngine.rolloverIfNeeded({
      currentIntake: state.currentIntake,
      dailyGoal: state.dailyGoal,
      percentage: state.percentage,
      achievedMilestones: state.achievedMilestones,
      pendingMilestone: state.pendingMilestone,
      date: state.date,
      entries: state.entries,
      history: state.history,
      streak: state.streak,
    })
    if (rolled.date !== state.date) {
      useHydrationStore.setState(rolled)
    }
  }, [])

  const displayStreak = streak + (percentage >= 100 ? 1 : 0)

  const handleQuickLog = useCallback((amount: number, label: string) => {
    // Android haptics — Impact Light for subtle feedback
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    logWater(amount, label)
  }, [logWater])

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const remainingMl = Math.max(0, dailyGoal - currentIntake)
  const lastEntry = entries.length > 0 ? entries[entries.length - 1] : null
  const lastEntryTime = lastEntry
    ? new Date(lastEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--'

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting} 💧</Text>
          <Text style={styles.subGreeting}>Stay hydrated, stay healthy.</Text>
        </View>

        {/* ── Hero Card: Water Ring ─────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Card style={styles.heroCard}>
            <LinearGradient
              colors={['rgba(147,198,231,0.08)', 'rgba(10,38,71,0.40)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <WaterRing
              percentage={percentage}
              currentMl={currentIntake}
              goalMl={dailyGoal}
              size={200}
            />
          </Card>
        </Animated.View>

        {/* ── Stats Row (2-column Bento) ────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <View style={styles.bentoRow}>
            {/* Daily Goal vs Current */}
            <Card style={styles.statCard}>
              <Text style={styles.statLabel}>REMAINING</Text>
              <Text style={styles.statValue}>{remainingMl}ml</Text>
              <Text style={styles.statSub}>of {dailyGoal}ml goal</Text>
            </Card>

            {/* Last Drink */}
            <Card style={styles.statCard}>
              <Text style={styles.statLabel}>LAST DRINK</Text>
              <Text style={styles.statValue}>{lastEntry ? `${lastEntry.amount}ml` : '—'}</Text>
              <Text style={styles.statSub}>{lastEntryTime}</Text>
            </Card>
          </View>
        </Animated.View>

        {/* ── Streak & Milestones Card ─────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Card style={styles.streakCard}>
            <View style={styles.streakTop}>
              <View>
                <Text style={styles.statLabel}>DAILY STREAK</Text>
                <Text style={styles.streakValue}>
                  {displayStreak} {displayStreak === 1 ? 'day' : 'days'} 🔥
                </Text>
              </View>
            </View>
            <View style={styles.badgeRow}>
              {BADGE_DATA.map(({ threshold, color }) => {
                const achieved = achievedMilestones.includes(threshold)
                return (
                  <View
                    key={threshold}
                    style={[
                      styles.badge,
                      achieved
                        ? { backgroundColor: color }
                        : { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: BORDER },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        achieved ? { color: DEEP_AZURE } : { color: TEXT_TERTIARY },
                      ]}
                    >
                      {MILESTONE_MAP[threshold].emoji} {threshold}%
                    </Text>
                  </View>
                )
              })}
            </View>
          </Card>
        </Animated.View>

        {/* ── Quick-Log Row ────────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>QUICK LOG</Text>
        <View style={styles.quickLogRow}>
          {PRESETS.map(({ amount, label, icon }) => (
            <Pressable
              key={amount}
              onPress={() => handleQuickLog(amount, label)}
              android_ripple={{
                color: 'rgba(147,198,231,0.25)',
                borderless: false,
                radius: 60,
              }}
              style={({ pressed }) => [
                styles.quickLogBtn,
                pressed && Platform.OS === 'ios' && { opacity: 0.7, transform: [{ scale: 0.96 }] },
              ]}
            >
              <LinearGradient
                colors={[AQUA_GLOW, DEEP_AZURE]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <Text style={styles.quickLogIcon}>{icon}</Text>
              <Text style={styles.quickLogLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Today's Log ──────────────────────────────────────────────────── */}
        {entries.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>TODAY'S LOG</Text>
            <Card style={styles.logCard}>
              {entries
                .slice()
                .reverse()
                .slice(0, 5)
                .map((entry, idx) => (
                  <View
                    key={entry.id}
                    style={[styles.logRow, idx < Math.min(entries.length, 5) - 1 && styles.logDivider]}
                  >
                    <Text style={styles.logEmoji}>💧</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.logAmount}>{entry.label}</Text>
                      <Text style={styles.logTime}>
                        {new Date(entry.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <Text style={styles.logMl}>+{entry.amount}ml</Text>
                  </View>
                ))}
            </Card>
          </>
        )}
      </ScrollView>

      {/* Milestone Toast (overlay) */}
      <MilestoneToast milestone={pendingMilestone} onDismiss={dismissMilestone} />
    </View>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14 },
  header: { gap: 4, marginBottom: 4 },
  greeting: { fontSize: 26, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.6 },
  subGreeting: { fontSize: 14, color: TEXT_SECONDARY },

  heroCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
  },

  bentoRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, gap: 4, paddingVertical: 14, paddingHorizontal: 14 },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_TERTIARY,
    letterSpacing: 0.8,
  },
  statValue: { fontSize: 22, color: TEXT_PRIMARY, fontWeight: '800', letterSpacing: -0.4 },
  statSub: { fontSize: 12, color: TEXT_SECONDARY },

  streakCard: { gap: 12, paddingVertical: 14 },
  streakTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streakValue: { fontSize: 18, fontWeight: '800', color: TEXT_PRIMARY, marginTop: 2 },

  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 11, fontWeight: '700' },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_TERTIARY,
    letterSpacing: 0.8,
    marginTop: 4,
  },

  quickLogRow: { flexDirection: 'row', gap: 10 },
  quickLogBtn: {
    flex: 1,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: ACCENT_BORDER,
  },
  quickLogIcon: { fontSize: 26 },
  quickLogLabel: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },

  logCard: { paddingVertical: 4, paddingHorizontal: 0 },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  logDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  logEmoji: { fontSize: 18 },
  logAmount: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },
  logTime: { fontSize: 11, color: TEXT_TERTIARY },
  logMl: { fontSize: 13, fontWeight: '700', color: CYAN_FROST },
})
