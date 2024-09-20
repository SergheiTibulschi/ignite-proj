export interface CloudinaryResponse {
  access_mode: string
  asset_folder: string
  asset_id: string
  audio: Audio
  bit_rate: number
  bytes: number
  created_at: string
  display_name: string
  duration: number
  etag: string
  format: string
  frame_rate: number
  height: number
  nb_frames: number
  original_filename: string
  pages: number
  placeholder: boolean
  playback_url: string
  public_id: string
  resource_type: string
  rotation: number
  secure_url: string
  signature: string
  tags: any[]
  type: string
  url: string
  version: number
  version_id: string
  video: Video
  width: number
}

export interface Audio {}

export interface Video {
  bit_rate: string
  codec: string
  level: number
  pix_format: string
  profile: string
  time_base: string
}