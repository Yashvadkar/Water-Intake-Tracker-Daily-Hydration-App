import { HydrationEngine } from '../lib/logic/HydrationEngine'
import { useHydrationStore } from '../lib/stores/hydrationStore'
import { HydrationState } from '../lib/logic/types'

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

describe('Hydration Logic & Store', () => {
  beforeEach(() => {
    // Reset store
    useHydrationStore.setState(HydrationEngine.createInitialState(2500))
  })

  test('resetDay preserves history/streak but clears today', () => {
    // Set up some history and current progress
    useHydrationStore.setState({
      history: [{ date: '2023-01-01', totalMl: 2500, goalMl: 2500, percentage: 100 }],
      streak: 5,
      date: '2023-01-02',
      dailyGoal: 3000,
      currentIntake: 1500,
      percentage: 50,
      achievedMilestones: [25, 50],
      pendingMilestone: 50,
      entries: [{ id: '1', amount: 1500, timestamp: Date.now(), label: 'Water' }],
    })

    const store = useHydrationStore.getState()
    store.resetDay()

    const afterReset = useHydrationStore.getState()
    expect(afterReset.history.length).toBe(1)
    expect(afterReset.streak).toBe(5)
    expect(afterReset.date).toBe('2023-01-02')
    expect(afterReset.dailyGoal).toBe(3000)

    expect(afterReset.currentIntake).toBe(0)
    expect(afterReset.percentage).toBe(0)
    expect(afterReset.achievedMilestones.length).toBe(0)
    expect(afterReset.pendingMilestone).toBeNull()
    expect(afterReset.entries.length).toBe(0)
  })

  test('live streak display behavior', () => {
    // Start with a base streak of 2, 0% today
    useHydrationStore.setState({ streak: 2, percentage: 0 })
    let store = useHydrationStore.getState()
    expect(store.streak + (store.percentage >= 100 ? 1 : 0)).toBe(2)

    // Hit the goal today
    useHydrationStore.setState({ percentage: 100 })
    store = useHydrationStore.getState()
    expect(store.streak + (store.percentage >= 100 ? 1 : 0)).toBe(3)

    // Resetting drops it back
    store.resetDay()
    store = useHydrationStore.getState()
    expect(store.streak + (store.percentage >= 100 ? 1 : 0)).toBe(2)
  })

  test('goal lowering triggers correct milestone state', () => {
    useHydrationStore.setState({
      currentIntake: 1000,
      dailyGoal: 2000,
      percentage: 50,
      achievedMilestones: [25, 50]
    })

    // Lower goal to 1000, making intake 100%
    useHydrationStore.getState().setDailyGoal(1000)
    
    const afterChange = useHydrationStore.getState()
    expect(afterChange.percentage).toBe(100)
    expect(afterChange.achievedMilestones).toEqual([25, 50, 75, 100])
    expect(afterChange.pendingMilestone).toBe(100)
  })

  test('goal raising removes stale milestone state', () => {
    useHydrationStore.setState({
      currentIntake: 2000,
      dailyGoal: 2000,
      percentage: 100,
      achievedMilestones: [25, 50, 75, 100]
    })

    // Raise goal to 4000, making intake 50%
    useHydrationStore.getState().setDailyGoal(4000)
    
    const afterChange = useHydrationStore.getState()
    expect(afterChange.percentage).toBe(50)
    // Only 25 and 50 should be achieved now
    expect(afterChange.achievedMilestones).toEqual([25, 50])
  })

  test('rollover archives prior day correctly and resets missed streak', () => {
    const oldState: HydrationState = {
      ...HydrationEngine.createInitialState(2000),
      date: '2020-01-01',
      currentIntake: 1000,
      percentage: 50, // Goal missed
      streak: 5
    }

    const rolled = HydrationEngine.rolloverIfNeeded(oldState)
    expect(rolled.date).not.toBe('2020-01-01')
    expect(rolled.history.length).toBe(1)
    expect(rolled.history[0].totalMl).toBe(1000)
    // Streak resets because goal was missed
    expect(rolled.streak).toBe(0)
  })

  test('rollover increments streak when goal is met', () => {
    const oldState: HydrationState = {
      ...HydrationEngine.createInitialState(2000),
      date: '2020-01-01',
      currentIntake: 2000,
      percentage: 100, // Goal met
      streak: 5
    }

    const rolled = HydrationEngine.rolloverIfNeeded(oldState)
    // Streak increments because goal was met
    expect(rolled.streak).toBe(6)
  })
})
