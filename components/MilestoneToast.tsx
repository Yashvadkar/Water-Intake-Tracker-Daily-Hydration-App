/**
 * MilestoneToast — Animated celebration toast for hydration milestones
 *
 * Slides in from the top with a spring animation when a milestone is hit.
 * Auto-dismisses after 3 seconds. Uses Phosphor Icons for visual polish.
 */

import React, { useEffect } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/Text'
import { MILESTONE_MAP, type MilestoneType } from '@/lib/logic/types'
import { SURFACE2, BORDER, TEXT_PRIMARY, TEXT_SECONDARY } from '@/lib/theme'

interface MilestoneToastProps {
  milestone: MilestoneType | null
  onDismiss: () => void
}

export default function MilestoneToast({ milestone, onDismiss }: MilestoneToastProps) {
  const insets = useSafeAreaInsets()
  const translateY = useSharedValue(-120)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (milestone !== null) {
      translateY.value = withSpring(0, { damping: 14, stiffness: 120 })
      opacity.value = withTiming(1, { duration: 200 })

      // Auto dismiss after 3 seconds
      const timeout = setTimeout(() => {
        translateY.value = withTiming(-120, { duration: 300 })
        opacity.value = withDelay(100, withTiming(0, { duration: 200 }))
        setTimeout(onDismiss, 400)
      }, 3000)

      return () => clearTimeout(timeout)
    } else {
      translateY.value = -120
      opacity.value = 0
    }
  }, [milestone])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }))

  if (milestone === null) return null

  const info = MILESTONE_MAP[milestone]

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 8 },
        animatedStyle,
      ]}
    >
      <Pressable onPress={onDismiss} style={styles.toast}>
        <Text style={styles.emoji}>{info.emoji}</Text>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{info.label}</Text>
          <Text style={styles.subtitle}>
            You've reached {milestone}% of your daily goal!
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: SURFACE2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  emoji: {
    fontSize: 28,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
})
