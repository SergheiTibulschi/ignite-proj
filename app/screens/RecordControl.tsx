import React from 'react'
import { GestureResponderEvent, TouchableOpacity, View, ViewStyle } from "react-native"
import { colors, spacing } from "app/theme"

type RecordControlProps = {
  isRecording: boolean
  onPlay: (event: GestureResponderEvent) => void
  onStop: (event: GestureResponderEvent) => void
}

export const RecordControl = ({ isRecording, onStop, onPlay }: RecordControlProps) => {
  return (
    <View>
      <TouchableOpacity onPress={isRecording ? onStop : onPlay} style={$control}>
        <View style={isRecording ? $innerSquare : $innerCircle} />
      </TouchableOpacity>
    </View>
  )
}

const size = spacing.xxxl;

const $control: ViewStyle = {
  width: size,
  height: size,
  borderRadius: size / 2,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const $innerCircle: ViewStyle = {
  width: size - spacing.xs,
  height: size - spacing.xs,
  borderRadius: (size - 2) / 2,
  backgroundColor: colors.error,
}

const $innerSquare: ViewStyle = {
  width: size / 2.5,
  height: size / 2.5,
  borderRadius: spacing.xxs,
  backgroundColor: colors.error,
}