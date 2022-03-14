import { game } from 'melonjs/dist/melonjs.module.js'
import OtherPlayer from './renderables/otherplayer'

const artistasPlayers = {}

function createOrUpdateOtherPlayer(id, x, y) {
  // find or create a new OtherPlayer type...
  let artistaPlayer = artistasPlayers[id]
  if (!artistaPlayer) {
    // artistaPlayer = new OtherPlayer(locationData.x, locationData.y, {
    artistaPlayer = new OtherPlayer(x, y, {
      name: `other-player-${id}`,
      image: 'pegah-avatar',
      width: 309,
      height: 396,
      framewidth: 309,
      frameheight: 396,
    })
    artistasPlayers[id] = artistaPlayer
    game.world.addChild(artistaPlayer, 5)
    console.log('created an OtherPlayer', artistaPlayer)
  } else {
    artistaPlayer.pos.x = x
    artistaPlayer.pos.y = y
    console.log(
      id,
      'updated peer location data',
      JSON.stringify({ x: x, y: y })
    )
  }
}

export default createOrUpdateOtherPlayer
