import { game } from 'melonjs/dist/melonjs.module.js'
import {
  adjustVolumeForOne,
  checkForOpenCall,
  checkForInitiatedCall,
  deleteRecordOfOpenCall,
  createRecordOfInitiatedCall,
} from '../calls'
import getMainPlayer, { getOtherPlayer, otherPlayerName } from '../getPlayer'
import {
  IMAGE_KEY,
  IN_STUDIO_KEY,
  LAST_SEEN_KEY,
  LOCATION_KEY,
  NAME_KEY,
} from '../gun2'
import IS_STUDIO from '../isStudio'
import { getStream } from '../myStream'
import { SELF_REPRESENTATION_SIZE } from '../selfRepresentation'
import OtherPlayer from './renderables/otherplayer'

const artistasPlayers = {}

// forget after 1 minute about players
const TWENTY_SECONDS = 1000 * 20

// find and update or create a new OtherPlayer type...
function createOrUpdateOtherPlayer(id, details) {
  let artistaPlayer = artistasPlayers[id]
  if (artistaPlayer) {
    // update this players location, if its new
    if (
      artistaPlayer.pos.x !== details[LOCATION_KEY].x ||
      artistaPlayer.pos.y !== details[LOCATION_KEY].y
    ) {
      artistaPlayer.pos.x = details[LOCATION_KEY].x
      artistaPlayer.pos.y = details[LOCATION_KEY].y
      // check first, just in case
      // there's no channel with this player open
      // yet
      if (checkForOpenCall(id)) adjustVolumeForOne(id)
    }
  } else if (
    // local player and remote player must both be either in the 'main building' or the 'studio'
    details[IN_STUDIO_KEY] === IS_STUDIO &&
    // remote players details must be recent, seen within the last twenty seconds
    Date.now() - details[LAST_SEEN_KEY] < TWENTY_SECONDS
  ) {
    // create a new player, if their data is recent enough
    artistaPlayer = new OtherPlayer(
      details[LOCATION_KEY].x,
      details[LOCATION_KEY].y,
      {
        name: otherPlayerName(id),
        playerId: id,
        artistaName: details[NAME_KEY],
        image: details[IMAGE_KEY],
        width: SELF_REPRESENTATION_SIZE,
        height: SELF_REPRESENTATION_SIZE,
        framewidth: SELF_REPRESENTATION_SIZE,
        frameheight: SELF_REPRESENTATION_SIZE,
      }
    )
    artistasPlayers[id] = artistaPlayer
    game.world.addChild(artistaPlayer, 3)
    const mainPlayer = getMainPlayer()
    if (mainPlayer) {
      // keep my self-representation above all the others
      // for me, in terms of zIndex
      game.world.moveToTop(mainPlayer)

      // here we make sure that only one of the two
      // peers initiates a call with the other.
      // the other will be the responder
      const isInitiater = Number(mainPlayer.playerId) > Number(id)
      if (isInitiater && !checkForInitiatedCall(id) && !checkForOpenCall(id)) {
        console.log(
          `there is no open call. we should call peer ${id}, trying...`
        )
        const stream = getStream()
        const call = mainPlayer.peer.call(id, stream)
        createRecordOfInitiatedCall(id)
        if (call) {
          // when the other player "picks up"
          call.on('stream', (remoteStream) => {
            console.log('remoteStream', remoteStream)
            console.log('received an answer from ', id)
            // find player and call the function to add a
            // stream to their otherplayer
            // double check now
            if (!checkForOpenCall(id)) {
              const otherPlayer = getOtherPlayer(id)
              otherPlayer.addMedia(remoteStream, id)
            }
          })
        } else {
          console.log('why is there no call?')
        }
      }
    }
  }
}

function removePlayer(id) {
  const player = getOtherPlayer(id)
  if (player) {
    game.world.removeChild(player)
  }
  delete artistasPlayers[id]
  deleteRecordOfOpenCall(id)
}

export { removePlayer }

export default createOrUpdateOtherPlayer
