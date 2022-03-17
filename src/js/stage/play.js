import {
  Stage,
  game,
  level,
} from 'melonjs/dist/melonjs.module.js'
import createOrUpdateOtherPlayer from '../createOrUpdateOtherPlayer'
import { subscribeToArtistas } from '../../gun2'

class PlayScreen extends Stage {
  /**
   *  action to perform on state change
   */
  onResetEvent() {
    // load a level
    level.load('area01', {
      setViewportBounds: true
    })

    const p = game.world.getChildByName('mainPlayer')[0]
    game.world.moveToTop(p)
  }

  // onDestroyEvent() {
  //   // unsubscribe from gun
  // }
}

export default PlayScreen
