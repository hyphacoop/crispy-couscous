import { Stage, game, level } from 'melonjs/dist/melonjs.module.js'
import getMainPlayer from '../../getPlayer'

import IS_STUDIO from '../../isStudio'

class PlayScreen extends Stage {
  /**
   *  action to perform on state change
   */
  onResetEvent() {
    // load a level
    const BUILDING = 'area01'
    const STUDIO = 'area02'
    const levelToLoad = IS_STUDIO ? STUDIO : BUILDING

    level.load(levelToLoad, {
      setViewportBounds: true,
    })

    const mainPlayer = getMainPlayer()
    game.world.moveToTop(mainPlayer)
  }

  // onDestroyEvent() {
  //   // unsubscribe from gun
  // }
}

export default PlayScreen
