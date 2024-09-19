import React, { FC, useEffect, useRef, useState } from "react"
import { Text, View, ViewStyle } from "react-native"

const secondsInHour = 3_600_000
const secondsInMinute = 60_000

export const useRecordingTime = (isPaused: boolean) => {
  const [recordedTime, setRecordedTime] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const elapsedBeforePause = useRef(0)
  const lastUpdateRef = useRef(0)
  const animationFrameReqRef = useRef<number | null>(null)

  const updateTime = () => {
    if (!isPaused && startTimeRef.current) {
      const currentTime = Date.now();
      const totalTime = elapsedBeforePause.current + (currentTime - startTimeRef.current);

      if (currentTime - lastUpdateRef.current >= 1000) {
        setRecordedTime(totalTime);
        lastUpdateRef.current = currentTime;
      }

      animationFrameReqRef.current = requestAnimationFrame(updateTime);
    }
  };

  useEffect(() => {
    animationFrameReqRef.current = requestAnimationFrame(updateTime);

    return () => {
      if (animationFrameReqRef.current) {
        cancelAnimationFrame(animationFrameReqRef.current);
      }
    }
  }, [updateTime])

  const onPauseRecording = () => {
    const currentTime = Date.now();
    elapsedBeforePause.current += (currentTime - (startTimeRef.current ?? 0)); // Accumulate total time
    startTimeRef.current = null; // Clear start time

    if (animationFrameReqRef.current) {
      cancelAnimationFrame(animationFrameReqRef.current)
    }
  };

  const onResumeRecording = () => {
    startTimeRef.current = Date.now();
    animationFrameReqRef.current = requestAnimationFrame(updateTime);
  };

  const onStartRecording = () => {
    startTimeRef.current = Date.now();
    elapsedBeforePause.current = 0;
    animationFrameReqRef.current = requestAnimationFrame(updateTime);
  };

  const onStopRecording = () => {
    startTimeRef.current = null;
    elapsedBeforePause.current = 0;

    if (animationFrameReqRef.current) {
      cancelAnimationFrame(animationFrameReqRef.current);
    }
  }

  const onRecordingFinished = () => {
    onStopRecording()
    setRecordedTime(0)
  }

  return {
    onPauseRecording,
    onStartRecording,
    onResumeRecording,
    onStopRecording,
    onRecordingFinished,
    recordedTime
  }
}

type RecordingTimerProps = {
  recordedTime: number
}

export const RecordingTimer: FC<RecordingTimerProps> = ({ recordedTime }) => {
  const formatTime = (time: number) => {
    const hours = Math.floor(time / secondsInHour)
    const minutes = Math.floor((time % secondsInHour) / secondsInMinute)
    const seconds = Math.floor((time % secondsInMinute) / 1000)

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <View style={$container}>
      <View style={$dot} />
      <Text>{formatTime(recordedTime)}</Text>
    </View>
  )
}

const $container: ViewStyle = {
  flexDirection: "row",
  alignItems: 'center',
  gap: 8
}

const $dot: ViewStyle = {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "red"
}