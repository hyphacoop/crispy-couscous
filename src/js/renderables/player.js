import Peer from 'peerjs'
import { input, game } from 'melonjs/dist/melonjs.module.js'
import throttle from 'lodash.throttle'
import PlayerWithLabelAndMediaEntity from './playerWithLabelAndMedia'
import {
  myself,
  LOCATION_KEY,
  LAST_SEEN_KEY,
  artistas,
  DESTINATION_KEY,
} from '../../gun2'
import { adjustVolumeForAll, checkForOpenCall } from '../../calls'
import { getStream } from '../../myStream'
import IS_STUDIO from '../../isStudio'
import { globalToWorld } from '../../coord'
import { getOtherPlayer, OTHER_PLAYER_NAME } from '../../getPlayer'

// a number that limits the write speed of
// location updates to something reasonable
const THROTTLE_TO_MS = 50
const updateMyLocation = throttle((x, y) => {
  myself.put({ [LOCATION_KEY]: { x, y }, [LAST_SEEN_KEY]: Date.now() })
  // since my location is changing, I should adjust volumes
  adjustVolumeForAll()
}, THROTTLE_TO_MS)

// remove me when the window closes
// window.addEventListener('visibilitychange', function () {
//   // remove my location from gun cache
//   if (document.visibilityState === 'hidden') {
//     console.log('window became hidden')
//     myself.put({ [LOCATION_KEY]: null })
//   } else {
//     // refresh?
//   }
// })

class PlayerEntity extends PlayerWithLabelAndMediaEntity {
  /**
   * constructor
   */
  constructor(x, y, settings) {
    super(x, y, settings)

    this.playerId = settings.playerId

    // audio
    this.peer = new Peer(this.playerId, {
      host: '143.110.213.122',
      port: 9000,
      path: '/myapp',
      // secure: true,
      debug: 3, // errors
    })
    var that = this

    // when I get a "call" automatically "pick up"
    that.peer.on('call', (call) => {
      // we have to getUserMedia inside
      // the call because the call could come in first
      // and we don't want to miss it, but we
      // need access to the media stream to pick up
      const stream = getStream()
      console.log('receiving a call from', call.peer)
      if (!checkForOpenCall(call.peer)) {
        console.log('there was no open call with ', call.peer)
        console.log('now accepting...')
        // Answer the call with my audio (& video) stream
        call.answer(stream)
        call.on('stream', function (remoteStream) {
          const id = call.peer
          // find player and call the function to add a
          // stream to their otherplayer

          // double check now
          function addMediaForPlayer() {
            if (!checkForOpenCall(id)) {
              const otherPlayer = getOtherPlayer(id)
              if (otherPlayer) {
                otherPlayer.addMedia(remoteStream, id)
              } else {
                setTimeout(addMediaForPlayer, 1000)
              }
            }
          }
          addMediaForPlayer()
        })
      } else {
        console.log('there was already an open call with', call.peer)
      }
    })

    // set up my own feed
    const stream = getStream()
    this.addMedia(stream)

    // used to store a temp reference
    // if the user is currently switching from
    // one room context to another
    this.isLeaving = false

    // max walking & jumping speed
    const X_MAX_VELOCITY = 10
    const Y_MAX_VELOCITY = 10
    this.body.setMaxVelocity(X_MAX_VELOCITY, Y_MAX_VELOCITY)
    this.body.setFriction(0.8, 0.8)

    // set the display to follow our position on both axis
    game.viewport.follow(this.pos, game.viewport.AXIS.BOTH, 0.4)

    // this is a field that
    // can be set by myself or by others
    // and affects the forces on me
    // and moves me towards my destination
    // until I get there
    this.destination = null
  }

  // event hooks
  onActivateEvent() {
    super.onActivateEvent()
    // register on the 'pointerdown' event, which is like a mouse click
    input.registerPointerEvent(
      'pointerdown',
      game.viewport,
      this.pointerDown.bind(this)
    )
  }
  onDeactivateEvent() {
    super.onDeactivateEvent()
    input.releaseAllPointerEvents(this)
  }

  // TODO: this should move out to some more global scope
  pointerDown(pointer) {
    // point-and-click navigation
    const worldRelative = globalToWorld(pointer.clientX, pointer.clientY)
    const destination = {
      x: worldRelative.x - this.width / 2,
      y: worldRelative.y - this.height / 2,
    }
    const hasOtherPlayerSelected = game.world.getChildren().find((r) => {
      return r.isSelected
    })
    if (hasOtherPlayerSelected) {
      console.log('setting new destination for player ', hasOtherPlayerSelected.playerId)
      artistas
        .get(hasOtherPlayerSelected.playerId)
        .put({ [DESTINATION_KEY]: destination })
    } else {
      // use this position as the final position to navigate the local players
      // position to
      // (and adjust by self-representation size)
      this.destination = destination
    }
  }

  /**
   * update the entity
   */
  update(dt) {
    // change body force based on inputs
    if (
      input.isKeyPressed('left') ||
      input.isKeyPressed('right') ||
      input.isKeyPressed('up') ||
      input.isKeyPressed('down')
    ) {
      // if a keyboard arrow key has
      // been pressed, clear the destination
      this.resetDestination()
      if (input.isKeyPressed('left')) {
        this.body.force.x = -this.body.maxVel.x
      } else if (input.isKeyPressed('right')) {
        this.body.force.x = this.body.maxVel.x
      }

      if (input.isKeyPressed('up')) {
        this.body.force.y = -this.body.maxVel.y
      } else if (input.isKeyPressed('down')) {
        this.body.force.y = this.body.maxVel.y
      }
    } else if (this.destination && (this.destination.x || this.destination.y)) {
      // do y first
      if (this.destination.y) {
        if (this.destination.y - this.pos.y > 10) {
          this.body.force.y = this.body.maxVel.y
        } else if (this.destination.y - this.pos.y < -10) {
          this.body.force.y = -this.body.maxVel.y
        } else {
          this.body.force.y = 0
          this.pos.y = this.destination.y
          this.destination.y = undefined
        }
      }
      // do x next
      if (this.destination.x) {
        if (this.destination.x - this.pos.x > 10) {
          this.body.force.x = this.body.maxVel.x
        } else if (this.destination.x - this.pos.x < -10) {
          this.body.force.x = -this.body.maxVel.x
        } else {
          this.body.force.x = 0
          this.pos.x = this.destination.x
          this.destination.x = undefined
        }
      }
    } else {
      this.resetDestination()
      this.body.force.x = 0
      this.body.force.y = 0
    }

    // update my location for my peers
    // with the call throttled fn since this
    // callback fires hyperfrequently
    updateMyLocation(this.pos.x, this.pos.y)
    this.updateLabelPosition(this.pos.x, this.pos.y)

    // call the parent method
    return super.update(dt) || this.body.vel.x !== 0 || this.body.vel.y !== 0
  }

  resetDestination() {
    this.destination = null
    myself.put({ [DESTINATION_KEY]: null })
  }

  /**
   * colision handler
   * (called when colliding with other objects)
   */
  onCollision(response, other) {
    // Make all other objects solid, except the background
    // and other players
    if (!other.name) {
      return true
    } else if (other.name === 'doorway') {
      // exit the current space
      // and enter the intended one
      // use this.isLeaving to only trigger this once
      if (!this.isLeaving) {
        this.isLeaving = true
        if (IS_STUDIO) {
          window.location.href = window.location.href.replace(
            '/studio.html',
            '?from-studio=true'
          )
        } else {
          window.location.href =
            window.location.href.replace('?from-studio=true', '') +
            'studio.html'
        }
      }
      return false
    } else if (
      other.name === 'background' ||
      other.name.includes(OTHER_PLAYER_NAME)
    ) {
      return false
    } else return true
  }
}

export default PlayerEntity
