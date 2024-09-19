import { observer } from "mobx-react-lite"
import React, { FC, useRef, useState } from "react"
import { View, ViewStyle, Linking, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native"
import { Button, Text, Screen } from "app/components"
import { AppStackScreenProps } from "../navigators"
import { colors, palette, spacing } from "../theme"
import { Camera, CameraPermissionStatus, useCameraDevice } from "react-native-vision-camera"
// import { PermissionsAndroid, Platform } from 'react-native';
import { RecordingTimer, useRecordingTime } from "app/screens/RecordingTimer"
import { RecordControl } from "app/screens/RecordControl"
import { PauseControl } from "app/screens/PauseControl"

const cloudName = 'dhfprmjgu'

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> {}

export const WelcomeScreen: FC<WelcomeScreenProps> = observer(function WelcomeScreen() {
  const [cameraPermission, setCameraPermission] = useState<CameraPermissionStatus>();
  const device = useCameraDevice("back");
  const [isActive, setIsActive] = useState(false);
  const cameraRef = useRef<Camera>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState('M')
  const {
    onResumeRecording, onPauseRecording, onStartRecording, recordedTime, onRecordingFinished
  } = useRecordingTime(isPaused)

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

  // const saveVideoToGallery = async (videoPath: string) => {
  //   if (Platform.OS === "android" && !(await hasAndroidPermission())) {
  //     setCameraPermission("denied");
  //     return;
  //   }
  //
  //   const t = await CameraRoll.save(videoPath, { type: 'video' })
  // };

  const startRecording = () => {
    setIsRecording(true)
    cameraRef.current?.startRecording({
      fileType: 'mp4',
      onRecordingFinished: async (video) => {
        onRecordingFinished()

        const imageResponse = await fetch(`file://${video.path}`)
        const blobData = await imageResponse.blob()
        const buffer = await new Response(blobData).arrayBuffer()

        try {
          const formData = new FormData();
          formData.append('file', '');
          formData.append('upload_preset', 'st_cloudinary_preset'); // Cloudinary upload preset


          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/upload`, // Replace with your Cloudinary cloud name
            {
              method: 'POST',
              body: formData
            }
          );
          const data = await response.json();
          console.log('Video uploaded successfully:', data.secure_url);
          console.log(JSON.stringify(data, null, 2))
          return data.secure_url; // Return the uploaded video URL
        } catch (error) {
          console.log({
            error
          })
          console.error('Error uploading video to Cloudinary:', error);
        }
      },
      onRecordingError: () => {
        setError('Error while recording video. Please try again. 3')
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

  if (device && isActive) {
    return (
      <View style={$cameraContainer}>
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
      </View>
    );
  }

  return (
    <Screen contentContainerStyle={$container}>
      <View>
        {error && (
          <View style={$errorStyle}>
            <Text>{error}</Text>
          </View>
        )}
        <Button
          style={$openCameraControl}
          onPress={openCamera}
          text="Open Camera"
        />
        <ActivityIndicator color={palette.accent500} />
      </View>
    </Screen>
  )
})

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
  backgroundColor: "rgba(140, 140, 140, 0.3)",
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
  alignItems: 'center'
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
}

const $errorStyle: ViewStyle = {
  backgroundColor: palette.angry100,
  padding: spacing.sm,
}