import { game } from 'melonjs/dist/melonjs.module.js'
import { checkForOpenCall, createRecordOfOpenCall } from '../calls'
import getMainPlayer from '../getMainPlayer'
import { IMAGE_KEY, LAST_SEEN_KEY, LOCATION_KEY, NAME_KEY } from '../gun2'
import { getStream } from '../myStream'
import { SELF_REPRESENTATION_SIZE } from '../selfRepresentation'
import OtherPlayer from './renderables/otherplayer'

const artistasPlayers = {}

// forget after 1 minute about players
const ONE_MINUTE = 1000 * 60

// find and update or create a new OtherPlayer type...
function createOrUpdateOtherPlayer(id, details) {
  let artistaPlayer = artistasPlayers[id]
  if (artistaPlayer) {
    // update this players location
    artistaPlayer.pos.x = details[LOCATION_KEY].x
    artistaPlayer.pos.y = details[LOCATION_KEY].y
  } else if (Date.now() - details[LAST_SEEN_KEY] < ONE_MINUTE) {
    // create a new player, if their data is recent enough
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
            console.log('opening audio feed...')
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
      } else {
        console.log('there is already an open call with peer ', id)
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
}

export { removePlayer }

export default createOrUpdateOtherPlayer
