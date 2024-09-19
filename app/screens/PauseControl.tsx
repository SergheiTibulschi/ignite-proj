import React from 'react'
import { GestureResponderEvent, Text, TouchableOpacity, View, ViewStyle } from "react-native"
import { spacing } from "app/theme"

type PauseControlProps = {
  isPaused: boolean
  onPause: (event: GestureResponderEvent) => void
  onResume: (event: GestureResponderEvent) => void
}

export const PauseControl = ({ isPaused, onPause, onResume }: PauseControlProps) => {
  return (
    <View>
      <TouchableOpacity style={$control} onPress={isPaused ? onResume : onPause }>
        {isPaused ? <Text>R</Text> : <Text>P</Text>}
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