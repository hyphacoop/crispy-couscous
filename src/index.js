import * as me from 'melonjs/dist/melonjs.module.js'
import 'index.css'

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
  subscribeToArtistas,
  IN_STUDIO_KEY,
  DESTINATION_KEY,
} from './gun2'
import pickRandomImage from './selfRepresentation'
import createOrUpdateOtherPlayer from './js/createOrUpdateOtherPlayer'
import getMainPlayer, { MAIN_PLAYER_NAME } from './getPlayer'
import { getUserMedia, setVideoStream, setAudioStream } from './myStream'
import IS_STUDIO from './isStudio'
import DoorwayEntity from './js/renderables/doorway'

// HACK this is just to filter out painfully verbose gunjs logs
let oldConsoleLog = console.log
console.log = (...args) => {
  if (typeof args[0] !== 'string') {
    oldConsoleLog(...args)
  } else if (!args[0].includes('warning!') && !args[0].includes('Warning!')) {
    oldConsoleLog(...args)
  }
}

// SPAWN POINTS
let SPAWN_X
let SPAWN_Y
const searchParams = new URLSearchParams(window.location.search)
if (IS_STUDIO) {
  SPAWN_X = 1930
  SPAWN_Y = 3170
} else if (searchParams.get('from-studio')) {
  SPAWN_X = 2843
  SPAWN_Y = 3753
} else {
  // main entryway to yard
  SPAWN_X = 3852
  SPAWN_Y = 7723
}

// these numbers define roughly the field-of-view
const FOV_WIDTH = IS_STUDIO ? 3000 : 2000
const FOV_HEIGHT = IS_STUDIO ? 3000 : 2000

// DOM IDs
const HTML_DIV_ID = 'screen'
const OVERLAY_ID = 'overlay'
const INPUT_ID = 'name-input'
const BUTTON_ID = 'enter-space-button'

const overlay = document.getElementById(OVERLAY_ID)

const setupNameCollectorListeners = () => {
  overlay.style.display = 'flex'
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
  if (overlay) overlay.remove()
  // only now start listening for navigational keyboard events
  bindKeyboardListeners()

  // create my player
  const mainPlayer = new PlayerEntity(SPAWN_X, SPAWN_Y, {
    name: MAIN_PLAYER_NAME,
    playerId: id,
    artistaName: name,
    image: image,
  })
  me.game.world.addChild(mainPlayer, 4)

  // now cache and broadcast to peers too
  myself.put({
    [IN_STUDIO_KEY]: IS_STUDIO,
    [IMAGE_KEY]: image,
    [NAME_KEY]: name,
    [LOCATION_KEY]: {
      x: SPAWN_X,
      y: SPAWN_Y,
    },
  })

  // now that I'm 'alive' listen for other people
  subscribeToArtistas(createOrUpdateOtherPlayer)

  myself.get(DESTINATION_KEY).on((v) => {
    const mainPlayer = getMainPlayer()
    mainPlayer.destination = v
  })
}

const bindKeyboardListeners = () => {
  // enable the keyboard
  me.input.bindKey(me.input.KEY.LEFT, 'left')
  me.input.bindKey(me.input.KEY.RIGHT, 'right')
  me.input.bindKey(me.input.KEY.UP, 'up')
  me.input.bindKey(me.input.KEY.DOWN, 'down')
}

;(async () => {
  let audioStream, videoStream
  try {
    audioStream = await getUserMedia({ video: false, audio: true })
    setAudioStream(audioStream)
  } catch (e) {}
  try {
    videoStream = await getUserMedia({ video: true, audio: false })
    setVideoStream(videoStream)
  } catch (e) {}

  if (!(audioStream || videoStream)) {
    alert(
      'Unable to enter the space, because there is no access to audio or video'
    )
  }

  me.device.onReady(() => {
    // initialize the display canvas once the device/browser is ready
    if (
      !me.video.init(FOV_WIDTH, FOV_HEIGHT, {
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
      me.state.set(me.state.PLAY, new PlayScreen())

      // connect the `name` property of certain .tmx / tiled
      // map entities with melonjs entity types
      const BACKGROUND_LAYER_NAME = 'background'
      me.pool.register(BACKGROUND_LAYER_NAME, BackgroundEntity)
      const DOORWAY_LAYER_NAME = 'doorway'
      me.pool.register(DOORWAY_LAYER_NAME, DoorwayEntity)

      // Start the game.
      me.state.change(me.state.PLAY)

      if (!IS_NEW_HERE) {
        myself.load((meData) => {
          addMyself(meData[NAME_KEY], meData[IMAGE_KEY], myselfId)
        })
      } else if (!IS_STUDIO) {
        setupNameCollectorListeners()
      }
    })
  })
})()
