import getMainPlayer, { getOtherPlayer } from './getPlayer'

const MIN_AUDIBLE_DISTANCE = 2000

// people we've initiated a call with, and are trying to reach
const initiatedCalls = {}
function createRecordOfInitiatedCall(id) {
  initiatedCalls[id] = true
}

function deleteRecordOfInitiatedCall(id) {
  delete initiatedCalls[id]
}

function checkForInitiatedCall(id) {
 return initiatedCalls[id]
}

// actual calls
const calls = {}

function createRecordOfOpenCall(id, mediaEl) {
  calls[id] = mediaEl
}

function deleteRecordOfOpenCall(id) {
  delete calls[id]
}

function checkForOpenCall(id) {
  return !!calls[id]
}

function allCallIds() {
  return Object.keys(calls)
}

function adjustVolumeForDistance(id, distance) {
  const mediaEl = calls[id]
  const volume =
    (MIN_AUDIBLE_DISTANCE - Math.min(distance, MIN_AUDIBLE_DISTANCE)) /
    MIN_AUDIBLE_DISTANCE
  // console.log('distance is ', distance)
  // console.log('adjusting volume to ', volume)
  mediaEl.volume = volume
}

// called when a remote players position changes
// since that only changes their volume for the local player
function adjustVolumeForOne(id) {
  // get main player
  const mainPlayer = getMainPlayer()
  // get the other player
  const otherPlayer = getOtherPlayer(id)
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
  // initiated calls
  createRecordOfInitiatedCall,
  deleteRecordOfInitiatedCall,
  checkForInitiatedCall,
  // open calls
  createRecordOfOpenCall,
  deleteRecordOfOpenCall,
  checkForOpenCall,
  adjustVolumeForAll,
  adjustVolumeForOne,
}
