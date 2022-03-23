/*
  A global variable for the local audio/video
  stream, after it's been approved by the user.
*/

let videoStream
let audioStream

export function setAudioStream(s) {
  audioStream = s
}

export function getAudioStream() {
  return audioStream
}

export function setVideoStream(s) {
  videoStream = s
}

export function getVideoStream() {
  return videoStream
}

export function getStream() {
  if (videoStream && audioStream) {
    return new MediaStream([...videoStream.getVideoTracks(), ...audioStream.getAudioTracks()])
  } else if (videoStream) {
    return videoStream
  } else if (audioStream) {
    return audioStream
  }
}

export function getUserMedia(opts) {
  return new Promise((resolve, reject) => {
    var internalGetUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia
    internalGetUserMedia(
      opts, // { video: boolean, audio: boolean }
      (stream) => {
        resolve(stream)
      },
      (err) => {
        console.error('Failed to get local stream', err)
        reject(err)
      }
    )
  })
}
