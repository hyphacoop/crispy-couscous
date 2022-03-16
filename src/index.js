import * as me from 'melonjs/dist/melonjs.module.js'
import 'index.css'

import TitleScreen from 'js/stage/title.js'
import PlayScreen from 'js/stage/play.js'
import PlayerEntity from 'js/renderables/player.js'

import DataManifest from 'manifest.js'
import BackgroundEntity from './js/renderables/background'

me.device.onReady(() => {
  // initialize the display canvas once the device/browser is ready
  const HTML_DIV_ID = 'screen'
  // const FULL_WIDTH = 8075
  // const FULL_HEIGHT = 7300
  // these numbers define roughly the field-of-view
  const FULL_WIDTH = 2000
  const FULL_HEIGHT = 2000
  if (
    !me.video.init(FULL_WIDTH, FULL_HEIGHT, {
      parent: HTML_DIV_ID,
      scale: 'auto',
      scaleMethod: 'flex-width',
    })
  ) {
    alert('Your browser does not support HTML5 canvas.')
    return
  }

  // initialize the debug plugin in development mode.
  if (process.env.NODE_ENV === 'development') {
    import('js/plugin/debug/debugPanel.js').then((plugin) => {
      // automatically register the debug panel
      me.utils.function.defer(
        me.plugin.register,
        this,
        plugin.DebugPanelPlugin,
        'debugPanel'
      )
    })
  }

  // Initialize the audio.
  me.audio.init('mp3,ogg')

  // allow cross-origin for image/texture loading
  me.loader.crossOrigin = 'anonymous'

  // set and load all resources.
  me.loader.preload(DataManifest, function () {
    // set the user defined game stages
    me.state.set(me.state.MENU, new TitleScreen())
    me.state.set(me.state.PLAY, new PlayScreen())

    // first layer is the background
    const BACKGROUND_LAYER_NAME = 'background'
    me.pool.register(BACKGROUND_LAYER_NAME, BackgroundEntity)

    // add our player entity in the entity pool
    // in front of the background
    const PLAYER_LAYER_NAME = 'mainPlayer'
    me.pool.register(PLAYER_LAYER_NAME, PlayerEntity)

    // enable the keyboard
    me.input.bindKey(me.input.KEY.LEFT, 'left')
    me.input.bindKey(me.input.KEY.RIGHT, 'right')
    me.input.bindKey(me.input.KEY.UP, 'up')
    me.input.bindKey(me.input.KEY.DOWN, 'down')

    // Start the game.
    me.state.change(me.state.PLAY)
  })
})
