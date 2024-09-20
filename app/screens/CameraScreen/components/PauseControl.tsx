import React from 'react'
import { GestureResponderEvent, TouchableOpacity, View, ViewStyle } from "react-native"
import { spacing } from "app/theme"
import { Icon } from "app/components"

type PauseControlProps = {
  isPaused: boolean
  onPause: (event: GestureResponderEvent) => void
  onResume: (event: GestureResponderEvent) => void
}

export const PauseControl = ({ isPaused, onPause, onResume }: PauseControlProps) => {
  return (
    <View>
      <TouchableOpacity style={$control} onPress={isPaused ? onResume : onPause }>
        {isPaused ? <Icon icon='play' size={32} /> : <Icon icon='pause' size={28} />}
      </TouchableOpacity>
    </View>
  )
}

const size = spacing.xxxl;


const $control: ViewStyle = {
  width: size,
  height: size,
  borderRadius: size / 2,
  backgroundColor: 'rgba(255, 255, 255, 0.25)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}