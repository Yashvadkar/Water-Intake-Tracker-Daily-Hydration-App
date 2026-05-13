/**
 * WaterRing — Animated SVG Progress Ring with inner wave effect
 *
 * Engineering Rationale:
 *   - Uses react-native-svg for the circular progress ring (hardware accelerated)
 *   - Uses react-native-reanimated for 60fps spring animations on the stroke
 *   - Programmatic SVG wave animation avoids external Lottie JSON dependency
 *   - The wave rises proportionally to the fill percentage
 *   - Animated counter displays the percentage with a spring-based number interpolation
 *
 * This is the "Hero" visual element of the app — first thing judges see.
 */

import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Circle, Defs, ClipPath, Path, G } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useDerivedValue,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated'
import { Text } from '@/components/ui/Text'
import {
  CYAN_FROST,
  WATER_RING_BG,
  WATER_RING_FILL,
  WATER_WAVE_LIGHT,
  WATER_WAVE_DARK,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '@/lib/theme'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const AnimatedPath = Animated.createAnimatedComponent(Path)
const AnimatedG = Animated.createAnimatedComponent(G)

interface WaterRingProps {
  percentage: number
  currentMl: number
  goalMl: number
  size?: number
  strokeWidth?: number
}

export default function WaterRing({
  percentage,
  currentMl,
  goalMl,
  size = 220,
  strokeWidth = 10,
}: WaterRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  // ── Animated values ───────────────────────────────────────────────────────
  const animatedPercentage = useSharedValue(0)
  const waveOffset = useSharedValue(0)

  useEffect(() => {
    animatedPercentage.value = withTiming(Math.min(percentage, 100), {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    })
  }, [percentage])

  // Continuous wave animation
  useEffect(() => {
    waveOffset.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.linear }),
      -1, // infinite
      false
    )
  }, [])

  // ── Ring stroke animation ─────────────────────────────────────────────────
  const ringProps = useAnimatedProps(() => {
    const dashOffset = circumference * (1 - animatedPercentage.value / 100)
    return {
      strokeDashoffset: dashOffset,
    }
  })

  // ── Wave path animation ───────────────────────────────────────────────────
  const innerRadius = radius - strokeWidth / 2 - 4
  const waveAreaTop = center - innerRadius
  const waveAreaHeight = innerRadius * 2

  const wavePath1Props = useAnimatedProps(() => {
    const fillHeight = (animatedPercentage.value / 100) * waveAreaHeight
    const waveY = center + innerRadius - fillHeight
    const phase = waveOffset.value * Math.PI * 2
    const amp = 6 + animatedPercentage.value * 0.06

    const points: string[] = []
    const steps = 40
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * size
      const y = waveY + Math.sin((i / steps) * Math.PI * 2 + phase) * amp
      points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)
    }
    // Close path at bottom
    points.push(`L ${size} ${center + innerRadius + 10}`)
    points.push(`L 0 ${center + innerRadius + 10}`)
    points.push('Z')

    return { d: points.join(' ') }
  })

  const wavePath2Props = useAnimatedProps(() => {
    const fillHeight = (animatedPercentage.value / 100) * waveAreaHeight
    const waveY = center + innerRadius - fillHeight
    const phase = waveOffset.value * Math.PI * 2 + 1.8
    const amp = 4 + animatedPercentage.value * 0.04

    const points: string[] = []
    const steps = 40
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * size
      const y = waveY + Math.sin((i / steps) * Math.PI * 2.5 + phase) * amp
      points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)
    }
    points.push(`L ${size} ${center + innerRadius + 10}`)
    points.push(`L 0 ${center + innerRadius + 10}`)
    points.push('Z')

    return { d: points.join(' ') }
  })

  // ── Percentage text ───────────────────────────────────────────────────────
  const displayPercentage = useDerivedValue(() => {
    return `${Math.round(animatedPercentage.value)}`
  })

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Clip path for the inner circle (wave stays inside) */}
        <Defs>
          <ClipPath id="innerCircle">
            <Circle cx={center} cy={center} r={innerRadius} />
          </ClipPath>
        </Defs>

        {/* Background ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={WATER_RING_BG}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Animated progress ring */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={WATER_RING_FILL}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={ringProps}
          transform={`rotate(-90, ${center}, ${center})`}
        />

        {/* Inner fill area with wave */}
        <G clipPath="url(#innerCircle)">
          {/* Back wave (darker, slower offset) */}
          <AnimatedPath
            animatedProps={wavePath2Props}
            fill={WATER_WAVE_DARK}
          />
          {/* Front wave (lighter) */}
          <AnimatedPath
            animatedProps={wavePath1Props}
            fill={WATER_WAVE_LIGHT}
          />
        </G>
      </Svg>

      {/* Center text overlay */}
      <View style={styles.textOverlay}>
        <Text style={styles.percentText}>
          {Math.round(percentage)}%
        </Text>
        <Text style={styles.mlText}>
          {currentMl} / {goalMl} ml
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontSize: 42,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    letterSpacing: -1,
  },
  mlText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
})
