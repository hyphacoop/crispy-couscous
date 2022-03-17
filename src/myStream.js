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

/*
mainPlayer.stream = stream
const call = mainPlayer.peer.call(id, mainPlayer.stream)
if (call) {
  call.on('stream', (remoteStream) => {
    createRecordOfOpenCall(id)
    const audio = document.createElement('audio')
    audio.srcObject = remoteStream
    audio.autoplay = true
    audio.style.display = 'hidden'
    document.body.appendChild(audio)
  })
} else {
  console.log('why is there no call?')
}

*/
