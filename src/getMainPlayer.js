import { game } from 'melonjs/dist/melonjs.module.js'

const MAIN_PLAYER_NAME = 'mainPlayer'

export {
  MAIN_PLAYER_NAME
}

export default function getMainPlayer() {
  return game.world.getChildByName(MAIN_PLAYER_NAME)[0]
}
