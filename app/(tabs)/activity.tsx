/**
 * Activity / Analytics Screen — Weekly Heatmap & History
 *
 * Engineering Rationale:
 *   - GitHub-style heatmap is a recognizable pattern for developer judges
 *   - Summary stats provide at-a-glance weekly performance
 *   - Extends the Aqua-Minimalist theme to data visualization
 */

import { useMemo } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import WeeklyHeatmap from '@/components/WeeklyHeatmap'
import { useHydrationStore } from '@/lib/stores/hydrationStore'
import {
  BG,
  CYAN_FROST,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  SURFACE,
  BORDER,
} from '@/lib/theme'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'

export default function ActivityScreen() {
  const insets = useSafeAreaInsets()
  const { history, date, percentage, currentIntake, dailyGoal, entries, streak } =
    useHydrationStore()

  // Compute weekly stats
  const weekStats = useMemo(() => {
    const last7Keys: string[] = []
    const baseDate = new Date(date + 'T00:00:00')
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate)
      d.setDate(d.getDate() - i)
      last7Keys.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      )
    }

    const historyMap = new Map(history.map(r => [r.date, r]))

    let totalMl = 0
    let daysTracked = 0
    let goalHitDays = 0
    let bestDay: string | null = null
    let bestDayMl = 0

    for (const d of last7Keys) {
      if (d === date) {
        if (entries.length > 0 || percentage > 0) {
          daysTracked++
          totalMl += currentIntake
          if (percentage >= 100) goalHitDays++
          if (currentIntake > bestDayMl || bestDay === null) {
            bestDay = date
            bestDayMl = currentIntake
          }
        }
      } else {
        const r = historyMap.get(d)
        if (r) {
          daysTracked++
          totalMl += r.totalMl
          if (r.percentage >= 100) goalHitDays++
          if (r.totalMl > bestDayMl || bestDay === null) {
            bestDay = r.date
            bestDayMl = r.totalMl
          }
        }
      }
    }

    const avgIntake = daysTracked > 0 ? Math.round(totalMl / daysTracked) : 0

    return {
      avgIntake,
      bestDay,
      bestDayMl,
      totalWeekMl: totalMl,
      daysTracked,
      goalHitDays,
    }
  }, [history, currentIntake, percentage, date, entries])

  const displayStreak = streak + (percentage >= 100 ? 1 : 0)

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—'
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Analytics 📊</Text>
        <Text style={styles.subtitle}>Your hydration journey this week.</Text>
      </View>

      {/* ── Weekly Heatmap ─────────────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>WEEKLY HYDRATION</Text>
      <Card style={styles.heatmapCard}>
        <WeeklyHeatmap
          history={history}
          currentDate={date}
          currentPercentage={percentage}
        />
      </Card>

      {/* ── Summary Stats Grid ─────────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>THIS WEEK</Text>
      <View style={styles.statsGrid}>
        <Card style={styles.miniCard}>
          <Text style={styles.miniLabel}>AVG DAILY</Text>
          <Text style={styles.miniValue}>{weekStats.avgIntake}ml</Text>
        </Card>
        <Card style={styles.miniCard}>
          <Text style={styles.miniLabel}>TOTAL</Text>
          <Text style={styles.miniValue}>
            {weekStats.totalWeekMl >= 1000
              ? `${(weekStats.totalWeekMl / 1000).toFixed(1)}L`
              : `${weekStats.totalWeekMl}ml`}
          </Text>
        </Card>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.miniCard}>
          <Text style={styles.miniLabel}>GOALS HIT</Text>
          <Text style={styles.miniValue}>
            {weekStats.goalHitDays}/{weekStats.daysTracked} days
          </Text>
        </Card>
        <Card style={styles.miniCard}>
          <Text style={styles.miniLabel}>BEST DAY</Text>
          <Text style={styles.miniValue}>{weekStats.bestDayMl}ml</Text>
          <Text style={styles.miniSub}>{formatDate(weekStats.bestDay)}</Text>
        </Card>
      </View>

      {/* ── Streak ─────────────────────────────────────────────────────────── */}
      <Card style={styles.streakBanner}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.streakTitle}>
            {displayStreak > 0 ? `${displayStreak}-day streak!` : 'Start your streak'}
          </Text>
          <Text style={styles.streakSub}>
            {displayStreak > 0
              ? 'Keep hitting your daily goal to maintain it.'
              : 'Hit your daily goal to start building a streak.'}
          </Text>
        </View>
      </Card>

      {/* ── Recent History ─────────────────────────────────────────────────── */}
      {history.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>HISTORY</Text>
          <Card style={styles.historyCard}>
            {history
              .slice()
              .reverse()
              .slice(0, 7)
              .map((record, idx) => (
                <View
                  key={record.date}
                  style={[
                    styles.historyRow,
                    idx < Math.min(history.length, 7) - 1 && styles.historyDivider,
                  ]}
                >
                  <Text style={styles.historyDate}>{formatDate(record.date)}</Text>
                  <Text style={styles.historyMl}>{record.totalMl}ml</Text>
                  <View
                    style={[
                      styles.historyBadge,
                      {
                        backgroundColor:
                          record.percentage >= 100
                            ? 'rgba(74,222,128,0.15)'
                            : 'rgba(255,255,255,0.06)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.historyPct,
                        {
                          color: record.percentage >= 100 ? '#4ADE80' : TEXT_TERTIARY,
                        },
                      ]}
                    >
                      {record.percentage}%
                    </Text>
                  </View>
                </View>
              ))}
          </Card>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14 },
  header: { gap: 4, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: TEXT_SECONDARY },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_TERTIARY,
    letterSpacing: 0.8,
    marginTop: 4,
  },

  heatmapCard: { paddingVertical: 16, paddingHorizontal: 14 },

  statsGrid: { flexDirection: 'row', gap: 10 },
  miniCard: { flex: 1, gap: 4, paddingVertical: 12, paddingHorizontal: 12 },
  miniLabel: { fontSize: 10, fontWeight: '700', color: TEXT_TERTIARY, letterSpacing: 0.6 },
  miniValue: { fontSize: 18, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.3 },
  miniSub: { fontSize: 11, color: TEXT_SECONDARY },

  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  streakEmoji: { fontSize: 32 },
  streakTitle: { fontSize: 16, fontWeight: '800', color: TEXT_PRIMARY },
  streakSub: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 2 },

  historyCard: { paddingVertical: 4, paddingHorizontal: 0 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  historyDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  historyDate: { flex: 1, fontSize: 13, fontWeight: '600', color: TEXT_PRIMARY },
  historyMl: { fontSize: 13, fontWeight: '700', color: CYAN_FROST },
  historyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  historyPct: { fontSize: 11, fontWeight: '700' },
})
