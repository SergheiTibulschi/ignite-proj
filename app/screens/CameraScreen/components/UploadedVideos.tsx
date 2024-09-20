import React, { FlatList, Linking, Text, TouchableOpacity, View, ViewStyle } from "react-native"
import { useUploadedVideos } from "app/providers/UploadedVideosProvider"
import { spacing } from "app/theme"

export const UploadedVideos = () => {
  const { videos } = useUploadedVideos()

  return (
    <View>
      <FlatList keyExtractor={item => item.url} data={videos} renderItem={(item) => {
        return (
          <TouchableOpacity onPress={() => {
            Linking.openURL(item.item.url)
          }}>
            <View style={$item}>
              <Text>{item.index + 1}.</Text>
              <Text>{item.item.url}</Text>
            </View>
          </TouchableOpacity>
        )
      }} />
    </View>
  )
}

const $item: ViewStyle = {
  flexDirection: 'row',
  gap: spacing.xs
}