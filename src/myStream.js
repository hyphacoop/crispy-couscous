/*
  A global variable for the local audio/video
  stream, after it's been approved by the user.
*/

let stream

export function setStream(s) {
  stream = s
}

export function getStream() {
  return stream
}

export function getUserMedia() {
  return new Promise((resolve, reject) => {
    var internalGetUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia
    internalGetUserMedia(
      { video: false, audio: true },
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
