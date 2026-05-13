/**
 * 🎨 AQUA-MINIMALIST THEME — Water Intake Tracker
 *
 * Color palette: Deep Azure (#0A2647) + Cyan Frost (#93C6E7) + White
 * Designed for the 8xEngineer "High-End Hydration" contest.
 *
 * All components import from here — no hardcoded color strings elsewhere.
 * Both tailwind.config.js colors and these constants stay in sync.
 */

// ── Primary palette ───────────────────────────────────────────────────────────
export const DEEP_AZURE = '#0A2647'
export const CYAN_FROST = '#93C6E7'
export const AQUA_GLOW  = '#2E8BC0'
export const WHITE      = '#FFFFFF'

// ── Accent (primary interactive color) ────────────────────────────────────────
export const ACCENT       = CYAN_FROST
export const ACCENT_DIM   = 'rgba(147,198,231,0.12)'
export const ACCENT_BORDER = 'rgba(147,198,231,0.30)'
export const ACCENT_GLOW  = 'rgba(147,198,231,0.20)'
export const ACCENT_LIGHT = '#B8DDEF'

// ── Backgrounds ───────────────────────────────────────────────────────────────
export const BG       = '#061527'    // deepest background
export const SURFACE  = '#0D2F55'    // card surfaces
export const SURFACE2 = '#133B68'    // elevated panels
export const SURFACE3 = '#1A4A7A'    // highest elevation

// ── Text ──────────────────────────────────────────────────────────────────────
export const TEXT_PRIMARY   = '#FFFFFF'
export const TEXT_SECONDARY = 'rgba(255,255,255,0.60)'
export const TEXT_TERTIARY  = 'rgba(255,255,255,0.32)'
export const TEXT_DISABLED  = 'rgba(255,255,255,0.18)'

// ── Borders ───────────────────────────────────────────────────────────────────
export const BORDER        = 'rgba(147,198,231,0.12)'
export const BORDER_ACTIVE = 'rgba(147,198,231,0.25)'

// ── Semantic ──────────────────────────────────────────────────────────────────
export const ERROR   = '#F87171'
export const ERROR_DIM = 'rgba(248,113,113,0.10)'
export const WARNING = '#FBBF24'
export const SUCCESS = '#4ADE80'

// ── Tab bar ───────────────────────────────────────────────────────────────────
export const TAB_ACTIVE   = CYAN_FROST
export const TAB_INACTIVE = 'rgba(255,255,255,0.35)'
export const TAB_HEIGHT   = 68

// ── Water-specific colors ─────────────────────────────────────────────────────
export const WATER_RING_BG     = 'rgba(147,198,231,0.10)'
export const WATER_RING_FILL   = CYAN_FROST
export const WATER_WAVE_LIGHT  = 'rgba(147,198,231,0.25)'
export const WATER_WAVE_DARK   = 'rgba(46,139,192,0.40)'

// ── Milestone colors ──────────────────────────────────────────────────────────
export const MILESTONE_25  = '#5EEAD4'
export const MILESTONE_50  = '#93C6E7'
export const MILESTONE_75  = '#2E8BC0'
export const MILESTONE_100 = '#FFD700'

// ── Heatmap intensity scale (0% → 100% of daily goal) ─────────────────────────
export const HEATMAP_EMPTY = 'rgba(147,198,231,0.06)'
export const HEATMAP_LOW   = 'rgba(147,198,231,0.20)'
export const HEATMAP_MED   = 'rgba(147,198,231,0.45)'
export const HEATMAP_HIGH  = 'rgba(147,198,231,0.70)'
export const HEATMAP_FULL  = CYAN_FROST

// ── Spacing & Radius ──────────────────────────────────────────────────────────
export const CARD_RADIUS = 16
export const CARD_PADDING = 16
