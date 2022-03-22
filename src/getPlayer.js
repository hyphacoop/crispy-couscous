import { game } from 'melonjs/dist/melonjs.module.js'

const MAIN_PLAYER_NAME = 'mainPlayer'
const OTHER_PLAYER_NAME = 'other-player-'

function otherPlayerName(id) {
  return `${OTHER_PLAYER_NAME}${id}`
}

export {
  OTHER_PLAYER_NAME,
  otherPlayerName,
  MAIN_PLAYER_NAME
}

export default function getMainPlayer() {
  return game.world.getChildByName(MAIN_PLAYER_NAME)[0]
}

export function getOtherPlayer(id) {
  return game.world.getChildByName(otherPlayerName(id))[0]
}


