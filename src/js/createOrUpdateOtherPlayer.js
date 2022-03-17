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
    if (mainPlayer) {
      game.world.moveToTop(mainPlayer)
      console.log('we have mainPlayer, so lets see about calling this peer')

      if (!checkForOpenCall(id)) {
        console.log('we should call this peer, trying...')
        var getUserMedia =
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia
        getUserMedia(
          { video: false, audio: true },
          (stream) => {
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
          },
          (err) => {
            console.error('Failed to get local stream', err)
          }
        )
      } else {
        console.log('there is already an open call with this peer')
      }
    } else {
      console.log('we dont have mainPlayer, skipping...')
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
