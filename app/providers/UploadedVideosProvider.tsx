import React, { createContext, FC, PropsWithChildren, useContext, useMemo, useState } from "react"
import { CloudinaryResponse } from "../../types/video"

type UploadedVideosContextType = {
  videos: CloudinaryResponse[]
  addVideo: (video: CloudinaryResponse) => void
}

const UploadedVideosContext = createContext<UploadedVideosContextType>({ } as UploadedVideosContextType)

export const UploadedVideosProvider: FC<PropsWithChildren> = ({ children }) => {
  const [videos, setVideos] = useState<CloudinaryResponse[]>([])

  const addVideo = (video: CloudinaryResponse) => {
    setVideos([...videos, video])
  }

  const value = useMemo(() => ({
    videos,
    addVideo
  }), [videos])

  return <UploadedVideosContext.Provider value={value}>{children}</UploadedVideosContext.Provider>
}

export const useUploadedVideos = () => {
  return useContext(UploadedVideosContext)
}
