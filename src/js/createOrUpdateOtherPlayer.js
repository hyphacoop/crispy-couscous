import { game } from 'melonjs/dist/melonjs.module.js'
import { checkForOpenCall, createRecordOfOpenCall } from '../calls'
import getMainPlayer from '../getMainPlayer'
import { IMAGE_KEY, LOCATION_KEY, NAME_KEY } from '../gun2'
import { SELF_REPRESENTATION_SIZE } from '../selfRepresentation'
import OtherPlayer from './renderables/otherplayer'

const artistasPlayers = {}

function createOrUpdateOtherPlayer(id, details) {
  // find or create a new OtherPlayer type...
  let artistaPlayer = artistasPlayers[id]
  if (!artistaPlayer) {
    artistaPlayer = new OtherPlayer(
      details[LOCATION_KEY].x,
      details[LOCATION_KEY].y,
      {
        name: `other-player-${id}`,
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
    // keep my self-representation above all the others
    // for me, in terms of zIndex
    const mainPlayer = getMainPlayer()
    game.world.moveToTop(mainPlayer)
    if (!checkForOpenCall(id)) {
      const call = peer.call(id, mainPlayer.stream)
      call.on('stream', (remoteStream) => {
        createRecordOfOpenCall(id)
        const audio = document.createElement('audio')
        audio.srcObject = remoteStream
        audio.autoplay = true
        audio.style.display = 'hidden'
        document.body.appendChild(audio)
      })
    }
  } else {
    artistaPlayer.pos.x = details[LOCATION_KEY].x
    artistaPlayer.pos.y = details[LOCATION_KEY].y
    // console.log(
    //   id,
    //   'updated peer location data',
    //   JSON.stringify({ x: x, y: y })
    // )
  }
}

function removePlayer(id) {
  const player = game.world.getChildByName(`other-player-${id}`)[0]
  if (player) {
    game.world.removeChild(player)
  }
  delete artistasPlayers[id]
}

export { removePlayer }

export default createOrUpdateOtherPlayer
