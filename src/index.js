import * as me from 'melonjs/dist/melonjs.module.js'
import 'index.css'

import TitleScreen from 'js/stage/title.js'
import PlayScreen from 'js/stage/play.js'
import PlayerEntity from 'js/renderables/player.js'

import DataManifest from 'manifest.js'
import BackgroundEntity from './js/renderables/background'
import {
  NAME_KEY,
  myself,
  myselfId,
  setMyself,
  IMAGE_KEY,
  LOCATION_KEY,
  IS_NEW_HERE,
} from './gun2'
import pickRandomImage from './selfRepresentation'

// HACK this is just to filter out painfully verbose gunjs logs
let oldConsoleLog = console.log
console.log = (...args) => {
  if (!args[0].includes('warning!') && !args[0].includes('Warning!')) {
    oldConsoleLog(...args)
  }
}

// SPAWN POINT (in the doorway)
const SPAWN_X = 3852
const SPAWN_Y = 7723

// DOM IDs
const HTML_DIV_ID = 'screen'
const OVERLAY_ID = 'overlay'
const INPUT_ID = 'name-input'
const BUTTON_ID = 'enter-space-button'

const overlay = document.getElementById(OVERLAY_ID)

const setupNameCollectorListeners = () => {
  const nameInput = document.getElementById(INPUT_ID)
  const nameButton = document.getElementById(BUTTON_ID)
  const onChange = () => {
    if (nameInput.value) {
      nameButton.removeAttribute('disabled')
    } else {
      nameButton.setAttribute('disabled', true)
    }
  }
  nameInput.addEventListener('paste', onChange)
  nameInput.addEventListener('keyup', onChange)
  nameButton.addEventListener('click', () => {
    // pick an id for myself
    const randomId = Math.random().toString().split('.')[1]
    setMyself(randomId)
    // collect the name and pick my color/image now too
    addMyself(nameInput.value, pickRandomImage(), randomId)
  })
}

const addMyself = (name, image, id) => {
  // clear the overlay
  overlay.remove()
  // only now start listening for navigational keyboard events
  bindKeyboardListeners()

  // create my player
  const mainPlayer = new PlayerEntity(SPAWN_X, SPAWN_Y, {
    artistaName: name,
    image: image,
    id: id
  })
  me.game.world.addChild(mainPlayer, 4)

  // now cache and broadcast to peers too
  myself.put({
    [IMAGE_KEY]: image,
    [NAME_KEY]: name,
    [LOCATION_KEY]: {
      x: SPAWN_X,
      y: SPAWN_Y,
    },
  })
}

const bindKeyboardListeners = () => {
  // enable the keyboard
  me.input.bindKey(me.input.KEY.LEFT, 'left')
  me.input.bindKey(me.input.KEY.RIGHT, 'right')
  me.input.bindKey(me.input.KEY.UP, 'up')
  me.input.bindKey(me.input.KEY.DOWN, 'down')
}

me.device.onReady(() => {
  // initialize the display canvas once the device/browser is ready
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

    // Start the game.
    me.state.change(me.state.PLAY)

    if (!IS_NEW_HERE) {
      myself.load((meData) => {
        addMyself(meData[NAME_KEY], meData[IMAGE_KEY], myselfId)
      })
    } else {
      setupNameCollectorListeners()
    }
  })
})
