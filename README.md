# HydraFlow: An Industrially Engineered Hydration System

HydraFlow is a premium, mobile-first hydration tracking dashboard built for the 8xEngineer contest. It moves beyond simple counters by utilizing a state-machine orchestrator to manage hydration logic, paired with an "Aqua-Minimalist" glassmorphism aesthetic.

## ✨ Features

* **High-End Bento Grid UI**: A modern, responsive dashboard with tailored glassmorphism cards and micro-animations.
* **Programmatic SVG Wave**: Instead of generic static images or external assets, the core visual is a dynamic, dual-layer sinusoidal wave powered entirely by SVG math and hardware-accelerated via Reanimated at 60fps.
* **Live Streak & Goal Logic**: Advanced metrics that recalculate dynamically when a daily goal is adjusted mid-day, separating display-streaks from rolling historical data.
* **Interactive Heatmap**: A GitHub-style weekly intake heatmap displaying dynamically scaled color intensities based on hydration compliance.
* **One-Tap Execution**: Millisecond-responsive preset buttons with Android native ripple and haptics for frictionless logging.

## 🧠 Architectural Highlight: The HydrationEngine (DAG)

Unlike traditional React applications that mix state updates with UI side-effects, HydraFlow is powered by the **HydrationEngine**—a client-side adaptation of ByteDance's Deer Flow orchestration pattern. 

The engine processes all actions through a **Directed Acyclic Graph (DAG)** (`LogWater` → `UpdateTotal` → `CalculatePercentage` → `TriggerMilestoneAlert`). 

**Why is this superior?**
1. **Decoupled Logic**: Each node has a single responsibility.
2. **Observability**: Every state transition generates a timestamped `ExecutionLog` snapshot, creating a complete audit trail of the application's runtime state.
3. **Extensibility**: Adding new logic (like push notifications) simply requires plugging a new node into the graph.

## 🛠 Tech Stack

* **Core**: React Native (0.83.6), Expo SDK 55, TypeScript
* **Styling**: NativeWind v4 (Tailwind CSS)
* **Animations**: React Native Reanimated, Lottie
* **State Management**: Zustand (with AsyncStorage Persistence)
* **Icons**: Phosphor React Native, Lucide

## 🚀 Installation & Running

Ensure you have Node.js 20+ installed.

```bash
# 1. Install dependencies
npm install

# 2. Start the Expo Metro Bundler (with clear cache)
npx expo start -c
```

Press `i` to open in an iOS simulator, `a` for Android, or `w` for the Web target.
