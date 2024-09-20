import React, { FC, useRef, useState } from "react"
import { View, ViewStyle, Linking, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native"
import { Button, Text, Screen } from "app/components"
import { AppStackScreenProps } from "app/navigators"
import { colors, palette, spacing } from "app/theme"
import { Camera, CameraPermissionStatus, useCameraDevice } from "react-native-vision-camera"
import { RecordingTimer, useRecordingTime } from "app/screens/CameraScreen/components/RecordingTimer"
import { RecordControl } from "app/screens/CameraScreen/components/RecordControl"
import { PauseControl } from "app/screens/CameraScreen/components/PauseControl"
import ReactNativeBlobUtil from 'react-native-blob-util'
import { CloudinaryResponse } from "../../../types/video"
import Toast from 'react-native-toast-message';
import { useUploadedVideos } from "app/providers/UploadedVideosProvider"
import { UploadedVideos } from "app/screens/CameraScreen/components/UploadedVideos"
import { SafeAreaView } from "react-native-safe-area-context"

interface CameraScreenProps extends AppStackScreenProps<"Camera"> {}

export const CameraScreen: FC<CameraScreenProps> = () => {
  const [cameraPermission, setCameraPermission] = useState<CameraPermissionStatus>();
  const device = useCameraDevice("back");
  const [isActive, setIsActive] = useState(false);
  const cameraRef = useRef<Camera>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const {
    onResumeRecording, onPauseRecording, onStartRecording, recordedTime, onRecordingFinished
  } = useRecordingTime(isPaused)
  const [isLoading, setIsLoading] = useState(false)
  const { addVideo } = useUploadedVideos()

  React.useEffect(() => {
    setCameraPermission(Camera.getCameraPermissionStatus());
  }, []);

  const promptForCameraPermissions = React.useCallback(async () => {
    const permission = await Camera.requestCameraPermission();
    setCameraPermission(Camera.getCameraPermissionStatus());

    if (permission === "denied") await Linking.openSettings();

    if (permission === "granted") {
      setIsActive(true);
    }
  }, [cameraPermission]);

  const startRecording = () => {
    setIsRecording(true)
    cameraRef.current?.startRecording({
      fileType: 'mp4',
      onRecordingFinished: async (video) => {
        onRecordingFinished()

        closeCamera()
        setIsLoading(true)
        try {
          const fetchRawResponse = await ReactNativeBlobUtil.fetch('POST', `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/video/upload`, {
            'Content-Type': 'multipart/form-data',
          }, [
            {name: 'file', filename: `video_${Date.now()}.mp4`, type: 'video/mp4', data: ReactNativeBlobUtil.wrap(video.path.replace('file://', ''))},
            {name: 'upload_preset', data: process.env.UPLOAD_PRESET }
          ])
          const cloudinaryResponse = fetchRawResponse.json() as CloudinaryResponse

          addVideo(cloudinaryResponse)

          Toast.show({
            type: 'success',
            text1: 'Success!',
            text2: `Video uploaded successfully 🎉`
          })
        } catch (error) {
          Toast.show({
            type: 'error',
            text1: 'Oops',
            text2: 'Video uploaded failed 😢'
          })
        } finally {
          setIsLoading(false)
        }
      },
      onRecordingError: () => {
        Toast.show({
          type: 'error',
          text1: 'Oops',
          text2: 'Error while recording video. Please try again.'
        })
      }
    })
    onStartRecording()
  }

  const cleanUp = () => {
    setIsRecording(false)
    setIsPaused(false)
  }

  const stopRecording = () => {
    cameraRef.current?.stopRecording()
    setIsRecording(false)
  }

  const pauseRecording = () => {
    setIsPaused(true)
    cameraRef.current?.pauseRecording()
    onPauseRecording()
  }

  const resumeRecording = () => {
    setIsPaused(false)
    cameraRef.current?.resumeRecording()
    onResumeRecording()
  }

  const closeCamera = () => {
    setIsActive(false)

    cleanUp()
  }

  const openCamera = () => {
    if (cameraPermission === "granted") {
      setIsActive(true)
    } else {
      promptForCameraPermissions()
    }
  }

  if (isLoading) {
    return (
      <Screen style={$container}>
        <View>
          <Text>Video is uploading. It might take some time.</Text>
          <ActivityIndicator color={palette.accent500} />
        </View>
      </Screen>
    )
  }

  if (device && isActive) {
    return (
      <SafeAreaView style={$cameraContainer}>
        <View style={$cameraOverlay}>
          <View style={$overlayTop}>
            <View style={$overlayBarLeftItem}></View>

            {isRecording && (
              <View style={$overlayBarCenterItem}>
                <RecordingTimer recordedTime={recordedTime} />
              </View>
            )}

            <View style={$overlayBarRightItem}>
              <TouchableOpacity style={$closeCamera} onPress={closeCamera}>
                <Text>X</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={$overlayBottom}>
            <View style={$overlayBarLeftItem}>
              {
                isRecording && (
                  <PauseControl isPaused={isPaused} onPause={pauseRecording} onResume={resumeRecording} />
                )
              }
            </View>
            <View style={$overlayBarCenterItem}>
              <RecordControl isRecording={isRecording} onPlay={startRecording} onStop={stopRecording} />
            </View>
            <View style={$overlayBarLeftItem}></View>
          </View>
        </View>

        <Camera
          isActive={isActive}
          device={device}
          style={StyleSheet.absoluteFill}
          video
          ref={cameraRef}
        />
      </SafeAreaView>
    );
  }


  return (
    <Screen contentContainerStyle={$container}>
      <SafeAreaView>
        <View>
          <Button
            style={$openCameraControl}
            onPress={openCamera}
            text="Record a video"
          />
        </View>
        <View style={$videoList}>
          <UploadedVideos />
        </View>
      </SafeAreaView>
    </Screen>
  )
}

const $container: ViewStyle = {
  flex: 1,
  padding: spacing.sm,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: colors.background,
}

const $cameraContainer: ViewStyle = {
  flex: 1,
};

const $closeCamera: ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 40 / 2,
  backgroundColor: "rgba(255, 255, 255, 0.3)",
  justifyContent: "center",
  alignItems: "center",
};

const $cameraOverlay: ViewStyle = {
  zIndex: 10,
  flex: 1,
  justifyContent: "space-between",
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0
}

const $overlayTop: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: spacing.xs,
  padding: spacing.sm
}

const $overlayBarLeftItem: ViewStyle = {
  minWidth: spacing.xxxl,
}

const $overlayBarCenterItem: ViewStyle = {
  flex: 1,
  alignItems: 'center',
}

const $overlayBarRightItem: ViewStyle = {
  minWidth: spacing.xxxl,
  alignItems: 'flex-end',
}

const $overlayBottom: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: spacing.sm
}

const $openCameraControl: ViewStyle = {
  borderColor: palette.accent500,
  width: '100%'
}

const $videoList: ViewStyle = {
  flex: 1,
  marginTop: spacing.xl
}