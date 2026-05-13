/**
 * HydrationEngine — Deer Flow-inspired Directed Graph Logic Engine
 *
 * Engineering Rationale:
 * This engine mirrors ByteDance's Deer Flow orchestration pattern (a Directed Acyclic Graph
 * of processing nodes with state transitions), adapted for client-side execution in React Native.
 *
 * Why this pattern?
 *   1. Separation of concerns — each node does one thing
 *   2. Auditable — every transition is logged with timestamps
 *   3. Extensible — add new nodes (e.g., NotifyReminder) by inserting into the graph
 *   4. Contest-ready — the execution logs demonstrate advanced AI engineering
 *
 * Graph: LogWater → UpdateTotal → CalculatePercentage → TriggerMilestoneAlert
 */

import {
  type HydrationState,
  type GraphNode,
  type NodeType,
  type ExecutionLog,
  type EngineRunResult,
  type WaterEntry,
  type MilestoneType,
  MILESTONES,
} from './types'

// ── Helper ────────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function snapshot(state: HydrationState): Partial<HydrationState> {
  return {
    currentIntake: state.currentIntake,
    percentage: state.percentage,
    achievedMilestones: [...state.achievedMilestones],
    pendingMilestone: state.pendingMilestone,
  }
}

// ── Graph Nodes ───────────────────────────────────────────────────────────────

const LogWaterNode: GraphNode = {
  id: 'LogWater',
  next: 'UpdateTotal',
  execute: (state, payload: { amount: number; label: string }) => {
    const entry: WaterEntry = {
      id: generateId(),
      amount: payload.amount,
      timestamp: Date.now(),
      label: payload.label,
    }
    return {
      ...state,
      entries: [...state.entries, entry],
    }
  },
}

const UpdateTotalNode: GraphNode = {
  id: 'UpdateTotal',
  next: 'CalculatePercentage',
  execute: (state) => {
    const total = state.entries.reduce((sum, e) => sum + e.amount, 0)
    return {
      ...state,
      currentIntake: total,
    }
  },
}

const CalculatePercentageNode: GraphNode = {
  id: 'CalculatePercentage',
  next: 'TriggerMilestoneAlert',
  execute: (state) => {
    const pct = state.dailyGoal > 0
      ? Math.round((state.currentIntake / state.dailyGoal) * 100)
      : 0
    return {
      ...state,
      percentage: pct,
    }
  },
}

const TriggerMilestoneAlertNode: GraphNode = {
  id: 'TriggerMilestoneAlert',
  next: null,
  execute: (state) => {
    let pendingMilestone: MilestoneType | null = null
    const newAchieved = [...state.achievedMilestones]

    for (const m of MILESTONES) {
      if (state.percentage >= m && !newAchieved.includes(m)) {
        pendingMilestone = m
        newAchieved.push(m)
      }
    }

    if (pendingMilestone !== null) {
      return {
        ...state,
        achievedMilestones: newAchieved.sort((a, b) => a - b),
        pendingMilestone,
      }
    }

    return { ...state, pendingMilestone: null }
  },
}

// ── Graph Registry ────────────────────────────────────────────────────────────

const GRAPH: Record<NodeType, GraphNode> = {
  LogWater: LogWaterNode,
  UpdateTotal: UpdateTotalNode,
  CalculatePercentage: CalculatePercentageNode,
  TriggerMilestoneAlert: TriggerMilestoneAlertNode,
}

// ── Engine ────────────────────────────────────────────────────────────────────

export class HydrationEngine {
  private executionHistory: ExecutionLog[] = []

  /**
   * Run the full graph starting from LogWater.
   * Returns the new state, execution logs, and any triggered milestone.
   */
  run(
    currentState: HydrationState,
    payload: { amount: number; label: string }
  ): EngineRunResult {
    const logs: ExecutionLog[] = []
    let state = { ...currentState }
    let nodeId: NodeType | null = 'LogWater'

    while (nodeId !== null) {
      const node: GraphNode = GRAPH[nodeId]
      const inputSnap = snapshot(state)
      const startTime = performance.now()

      // Execute node — only LogWater receives the payload
      if (nodeId === 'LogWater') {
        state = node.execute(state, payload)
      } else {
        state = node.execute(state)
      }

      const endTime = performance.now()
      const outputSnap = snapshot(state)

      const log: ExecutionLog = {
        timestamp: Date.now(),
        nodeId,
        inputSnapshot: inputSnap,
        outputSnapshot: outputSnap,
        durationMs: Math.round((endTime - startTime) * 100) / 100,
        metadata: nodeId === 'LogWater' ? { payload } : undefined,
      }

      logs.push(log)
      this.executionHistory.push(log)

      nodeId = node.next
    }

    return {
      state,
      logs,
      triggeredMilestone: state.pendingMilestone,
    }
  }

  /**
   * Fully recompute current-day derived state from currentIntake against a new goal.
   * Runs CalculatePercentage -> TriggerMilestoneAlert from scratch.
   */
  evaluateGoalChange(
    currentState: HydrationState,
    newGoal: number
  ): EngineRunResult {
    const logs: ExecutionLog[] = []
    
    // Prune stale milestones BEFORE running the graph
    const newPercentage = newGoal > 0 ? Math.round((currentState.currentIntake / newGoal) * 100) : 0
    const validMilestones = currentState.achievedMilestones.filter(m => m <= newPercentage)

    let state: HydrationState = { 
      ...currentState, 
      dailyGoal: newGoal,
      achievedMilestones: validMilestones,
      pendingMilestone: null
    }

    let nodeId: NodeType | null = 'CalculatePercentage'

    while (nodeId !== null) {
      const node: GraphNode = GRAPH[nodeId]
      const inputSnap = snapshot(state)
      const startTime = performance.now()

      state = node.execute(state)

      const endTime = performance.now()
      const outputSnap = snapshot(state)

      const log: ExecutionLog = {
        timestamp: Date.now(),
        nodeId,
        inputSnapshot: inputSnap,
        outputSnapshot: outputSnap,
        durationMs: Math.round((endTime - startTime) * 100) / 100,
        metadata: { event: 'evaluateGoalChange', newGoal },
      }

      logs.push(log)
      this.executionHistory.push(log)

      nodeId = node.next
    }

    return {
      state,
      logs,
      triggeredMilestone: state.pendingMilestone,
    }
  }

  /** Get full execution history for AI logs / debugging */
  getHistory(): ExecutionLog[] {
    return [...this.executionHistory]
  }

  /** Format execution logs as human-readable string (for AI_DEVELOPMENT_LOGS) */
  formatLogs(logs: ExecutionLog[]): string {
    return logs
      .map(
        (l) =>
          `[${new Date(l.timestamp).toISOString()}] ${l.nodeId} (${l.durationMs}ms) ` +
          `| intake: ${l.inputSnapshot.currentIntake}→${l.outputSnapshot.currentIntake}ml ` +
          `| pct: ${l.inputSnapshot.percentage}→${l.outputSnapshot.percentage}%`
      )
      .join('\n')
  }

  /** Create a fresh state for a new day */
  static createInitialState(dailyGoal: number = 2500): HydrationState {
    return {
      currentIntake: 0,
      dailyGoal,
      percentage: 0,
      achievedMilestones: [],
      pendingMilestone: null,
      date: todayString(),
      entries: [],
      history: [],
      streak: 0,
    }
  }

  /** Check if the state's date is today; if not, archive and reset */
  static rolloverIfNeeded(state: HydrationState): HydrationState {
    const today = todayString()
    if (state.date === today) return state

    // Archive yesterday
    const archived = {
      date: state.date,
      totalMl: state.currentIntake,
      goalMl: state.dailyGoal,
      percentage: state.percentage,
    }

    const history = [...state.history, archived].slice(-30) // keep last 30 days
    const metGoal = state.percentage >= 100
    const streak = metGoal ? state.streak + 1 : 0

    return {
      ...HydrationEngine.createInitialState(state.dailyGoal),
      date: today,
      history,
      streak,
    }
  }
}
