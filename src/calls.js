import { game } from 'melonjs/dist/melonjs.module'
import getMainPlayer from './getMainPlayer'
import { otherPlayerName } from './js/renderables/otherplayer'

const MIN_AUDIBLE_DISTANCE = 2000

const calls = {}

function createRecordOfOpenCall(id, audioEl) {
  calls[id] = audioEl
}

function checkForOpenCall(id) {
  return !!calls[id]
}

function allCallIds() {
  return Object.keys(calls)
}

function createAudioForCall(id, remoteStream) {
  console.log('receiving an audio stream from', id)
  const audio = document.createElement('audio')
  audio.srcObject = remoteStream
  audio.autoplay = true
  audio.style.display = 'hidden'
  document.body.appendChild(audio)
  createRecordOfOpenCall(id, audio)
}

function adjustVolumeForDistance(id, distance) {
  const audioEl = calls[id]
  const volume =
    (MIN_AUDIBLE_DISTANCE - Math.min(distance, MIN_AUDIBLE_DISTANCE)) /
    MIN_AUDIBLE_DISTANCE
  // console.log('distance is ', distance)
  // console.log('adjusting volume to ', volume)
  audioEl.volume = volume
}

// called when a remote players position changes
// since that only changes their volume for the local player
function adjustVolumeForOne(id) {
  // get main player
  const mainPlayer = getMainPlayer()
  // get the other player
  const otherPlayer = game.world.getChildByName(otherPlayerName(id))[0]
  if (mainPlayer && otherPlayer) {
    // calculate the distance between them
    const mainPos = mainPlayer.pos
    const otherPos = otherPlayer.pos
    const distance = mainPos.distance(otherPos)
    // adjust the volume of that audio, per that distance
    adjustVolumeForDistance(id, distance)
  }
}

// called when the local players position changes
// since that changes their distance from all others
function adjustVolumeForAll() {
  allCallIds().forEach(adjustVolumeForOne)
}

export {
  createAudioForCall,
  checkForOpenCall,
  adjustVolumeForAll,
  adjustVolumeForOne,
}
