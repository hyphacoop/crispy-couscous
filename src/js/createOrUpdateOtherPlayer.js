import { game } from 'melonjs/dist/melonjs.module.js'
import pickRandomImage, { AVATAR_SIZE } from '../pickRandomImage'
import OtherPlayer from './renderables/otherplayer'

const artistasPlayers = {}

function createOrUpdateOtherPlayer(id, x, y) {
  // find or create a new OtherPlayer type...
  let artistaPlayer = artistasPlayers[id]
  if (!artistaPlayer) {
    const avatarSize = 220
    artistaPlayer = new OtherPlayer(x, y, {
      name: `other-player-${id}`,
      image: pickRandomImage(),
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      framewidth: AVATAR_SIZE,
      frameheight: AVATAR_SIZE,
    })
    artistasPlayers[id] = artistaPlayer
    game.world.addChild(artistaPlayer, 5)
    console.log('created an OtherPlayer', artistaPlayer)
  } else {
    artistaPlayer.pos.x = x
    artistaPlayer.pos.y = y
    // console.log(
    //   id,
    //   'updated peer location data',
    //   JSON.stringify({ x: x, y: y })
    // )
  }
}

export default createOrUpdateOtherPlayer
