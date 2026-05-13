/**
 * HydrationEngine — Type definitions
 *
 * Deer Flow-inspired directed graph architecture for water intake tracking.
 * Each node in the graph represents a processing step, and the engine
 * traverses nodes in sequence, logging each transition for AI audit trails.
 */

// ── State ─────────────────────────────────────────────────────────────────────

export interface HydrationState {
  /** Total ml consumed today */
  currentIntake: number
  /** Daily goal in ml */
  dailyGoal: number
  /** Percentage of goal achieved (0-100+) */
  percentage: number
  /** Milestones that have been achieved */
  achievedMilestones: MilestoneType[]
  /** Newly triggered milestone (flash notification) */
  pendingMilestone: MilestoneType | null
  /** Today's date string (YYYY-MM-DD) */
  date: string
  /** Log entries for today */
  entries: WaterEntry[]
  /** Historical daily totals (last 30 days) */
  history: DailyRecord[]
  /** Current streak in days */
  streak: number
}

export interface WaterEntry {
  id: string
  amount: number
  timestamp: number
  label: string
}

export interface DailyRecord {
  date: string
  totalMl: number
  goalMl: number
  percentage: number
}

// ── Milestones ────────────────────────────────────────────────────────────────

export type MilestoneType = 25 | 50 | 75 | 100

export const MILESTONES: MilestoneType[] = [25, 50, 75, 100]

export interface MilestoneInfo {
  threshold: MilestoneType
  label: string
  emoji: string
  color: string
}

export const MILESTONE_MAP: Record<MilestoneType, MilestoneInfo> = {
  25:  { threshold: 25,  label: 'Getting Started',  emoji: '💧', color: '#5EEAD4' },
  50:  { threshold: 50,  label: 'Halfway There',     emoji: '🌊', color: '#93C6E7' },
  75:  { threshold: 75,  label: 'Almost Done',       emoji: '🏊', color: '#2E8BC0' },
  100: { threshold: 100, label: 'Goal Achieved!',    emoji: '🏆', color: '#FFD700' },
}

// ── Graph Node Types ──────────────────────────────────────────────────────────

export type NodeType = 'LogWater' | 'UpdateTotal' | 'CalculatePercentage' | 'TriggerMilestoneAlert'

export interface GraphNode {
  id: NodeType
  execute: (state: HydrationState, payload?: any) => HydrationState
  next: NodeType | null
}

// ── Execution Log (for AI audit trail) ────────────────────────────────────────

export interface ExecutionLog {
  timestamp: number
  nodeId: NodeType
  inputSnapshot: Partial<HydrationState>
  outputSnapshot: Partial<HydrationState>
  durationMs: number
  metadata?: Record<string, any>
}

export interface EngineRunResult {
  state: HydrationState
  logs: ExecutionLog[]
  triggeredMilestone: MilestoneType | null
}
