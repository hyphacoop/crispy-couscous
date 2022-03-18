import { game } from 'melonjs/dist/melonjs.module.js'
import {
  adjustVolumeForOne,
  checkForOpenCall,
  createAudioForCall,
} from '../calls'
import getMainPlayer from '../getMainPlayer'
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
import OtherPlayer, { otherPlayerName } from './renderables/otherplayer'

const artistasPlayers = {}

// forget after 1 minute about players
const ONE_MINUTE = 1000 * 60

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
    // remote players details must be recent, seen within the last minute
    Date.now() - details[LAST_SEEN_KEY] < ONE_MINUTE
  ) {
    // create a new player, if their data is recent enough
    artistaPlayer = new OtherPlayer(
      details[LOCATION_KEY].x,
      details[LOCATION_KEY].y,
      {
        name: otherPlayerName(id),
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

      if (!checkForOpenCall(id)) {
        console.log(
          `there is no open call. we should call peer ${id}, trying...`
        )
        const stream = getStream()
        const call = mainPlayer.peer.call(id, stream)
        if (call) {
          // when the other player "picks up"
          call.on('stream', (remoteStream) => {
            console.log('received an answer from ', id)
            createAudioForCall(id, remoteStream)
          })
        } else {
          console.log('why is there no call?')
        }
      } else {
        console.log('skipping, there is already an open call with peer ', id)
      }
    } else {
      console.log('we dont have mainPlayer, skipping...')
    }
  }
}

function removePlayer(id) {
  const player = game.world.getChildByName(`other-player-${id}`)[0]
  if (player) {
    game.world.removeChild(player)
  }
  delete artistasPlayers[id]
  //TODO: remove their audio here as well
}

export { removePlayer }

export default createOrUpdateOtherPlayer
