import { input, game, Entity } from 'melonjs/dist/melonjs.module.js'
import throttle from 'lodash.throttle'
import { myself, LOCATION_KEY } from '../../gun2'

// a number that limits the write speed of
// location updates to something reasonable
const THROTTLE_TO_MS = 800
const updateMyLocation = throttle((x, y) => {
  myself.put({ [LOCATION_KEY]: { x, y } })
}, THROTTLE_TO_MS)

class PlayerEntity extends Entity {
  /**
   * constructor
   */
  constructor(x, y, settings) {
    // call the parent constructor
    super(x, y, settings)

    // max walking & jumping speed
    const X_MAX_VELOCITY = 10
    const Y_MAX_VELOCITY = 10
    this.body.setMaxVelocity(X_MAX_VELOCITY, Y_MAX_VELOCITY)
    this.body.setFriction(0.8, 0.8)

    // don't let gravity affect the object
    this.body.ignoreGravity = true

    // set the display to follow our position on both axis
    game.viewport.follow(this.pos, game.viewport.AXIS.BOTH, 0.4)

    // ensure the player is updated even when outside of the viewport
    this.alwaysUpdate = true
  }

  onActivateEvent() {
    // register on the 'pointerdown' event, which is like a mouse click
    input.registerPointerEvent(
      'pointerdown',
      game.viewport,
      this.pointerDown.bind(this)
    )
  }

  onDeactivateEvent() {
    input.releaseAllPointerEvents(this)
  }

  pointerDown(pointer) {
    // convert the given into local (viewport) relative coordinates
    const pos = input.globalToLocal(pointer.clientX, pointer.clientY)
    // TODO: use this position as the final position to navigate to

    // TODO: navigate x, then y
  }

  /**
   * update the entity
   */
  update(dt) {
    // change body force based on inputs
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

    if (
      !(
        input.isKeyPressed('up') ||
        input.isKeyPressed('down') ||
        input.isKeyPressed('right') ||
        input.isKeyPressed('left')
      )
    ) {
      this.body.force.x = 0
      this.body.force.y = 0
    }

    // update my location for my peers
    // with the call throttled fn since this
    // callback fires hyperfrequently
    updateMyLocation(this.pos.x, this.pos.y)

    // call the parent method
    return super.update(dt) || this.body.vel.x !== 0 || this.body.vel.y !== 0
  }

  onDestroyEvent() {}

  /**
   * colision handler
   * (called when colliding with other objects)
   */
  onCollision(response, other) {
    // Make all other objects solid, except the background
    if (other.name === 'background') return false
    else return true
  }
}

export default PlayerEntity
