/**
 * Hydration Store — Zustand + AsyncStorage persistence
 *
 * Wraps the HydrationEngine for reactive state management.
 * All UI components subscribe to this store for real-time updates.
 * State is persisted to AsyncStorage so it survives app restarts.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { HydrationEngine } from '@/lib/logic/HydrationEngine'
import type { HydrationState, ExecutionLog, MilestoneType } from '@/lib/logic/types'

interface HydrationStore {
  // HydrationState properties
  currentIntake: number
  dailyGoal: number
  percentage: number
  achievedMilestones: MilestoneType[]
  pendingMilestone: MilestoneType | null
  date: string
  entries: WaterEntry[]
  history: DailyRecord[]
  streak: number

  // Engine instance (not persisted)
  _engineLogs: ExecutionLog[]

  // Actions
  logWater: (amount: number, label: string) => MilestoneType | null
  setDailyGoal: (goal: number) => void
  dismissMilestone: () => void
  resetDay: () => void
  getEngineLogs: () => ExecutionLog[]
}

// Singleton engine instance
const engine = new HydrationEngine()

export const useHydrationStore = create<HydrationStore>()(
  persist(
    (set, get): HydrationStore => ({
      // Initial state
      ...HydrationEngine.createInitialState(2500),
      _engineLogs: [],

      logWater: (amount: number, label: string) => {
        const currentState: HydrationState = {
          currentIntake: get().currentIntake,
          dailyGoal: get().dailyGoal,
          percentage: get().percentage,
          achievedMilestones: get().achievedMilestones,
          pendingMilestone: get().pendingMilestone,
          date: get().date,
          entries: get().entries,
          history: get().history,
          streak: get().streak,
        }

        // Rollover if it's a new day
        const rolledState = HydrationEngine.rolloverIfNeeded(currentState)

        // Run the engine graph
        const result = engine.run(rolledState, { amount, label })

        // Update store with new state
        set({
          ...result.state,
          _engineLogs: [...get()._engineLogs, ...result.logs],
        })

        return result.triggeredMilestone
      },

      setDailyGoal: (goal: number) => {
        const state = get()
        const currentState: HydrationState = {
          currentIntake: state.currentIntake,
          dailyGoal: state.dailyGoal,
          percentage: state.percentage,
          achievedMilestones: state.achievedMilestones,
          pendingMilestone: state.pendingMilestone,
          date: state.date,
          entries: state.entries,
          history: state.history,
          streak: state.streak,
        }
        const result = engine.evaluateGoalChange(currentState, goal)
        set({
          ...result.state,
          _engineLogs: [...state._engineLogs, ...result.logs],
        })
      },

      dismissMilestone: () => {
        set({ pendingMilestone: null })
      },

      resetDay: () => {
        set({
          currentIntake: 0,
          percentage: 0,
          achievedMilestones: [],
          pendingMilestone: null,
          entries: [],
        })
      },

      getEngineLogs: () => {
        return get()._engineLogs
      },
    }),
    {
      name: 'hydration-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentIntake: state.currentIntake,
        dailyGoal: state.dailyGoal,
        percentage: state.percentage,
        achievedMilestones: state.achievedMilestones,
        pendingMilestone: state.pendingMilestone,
        date: state.date,
        entries: state.entries,
        history: state.history,
        streak: state.streak,
      }),
    }
  )
)
