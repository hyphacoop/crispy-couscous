import { input, game, Entity } from 'melonjs/dist/melonjs.module.js'
import throttle from 'lodash.throttle'
import { myself, LOCATION_KEY } from '../../gun2'
import { SELF_REPRESENTATION_SIZE } from '../../selfRepresentation'
import localToGlobal from '../../coord'

// a number that limits the write speed of
// location updates to something reasonable
const THROTTLE_TO_MS = 50
const updateMyLocation = throttle((x, y) => {
  myself.put({ [LOCATION_KEY]: { x, y } })
}, THROTTLE_TO_MS)

class PlayerEntity extends Entity {
  /**
   * constructor
   */
  constructor(x, y, settings) {
    // call the parent constructor
    super(x, y, {
      ...settings,
      width: SELF_REPRESENTATION_SIZE,
      height: SELF_REPRESENTATION_SIZE,
      framewidth: SELF_REPRESENTATION_SIZE,
      frameheight: SELF_REPRESENTATION_SIZE,
    })

    this.artistaName = settings.artistaName

    this.myNameText = document.createElement('div')
    this.myNameText.innerHTML = this.artistaName
    this.myNameText.classList.add('name-label')
    this.myNameText.style.position = `absolute`
    // x and y are 'world' coordinates
    this.updateLabelPosition(x, y)
    document.body.appendChild(this.myNameText)

    // draw image from the top left
    this.anchorPoint.set(0.5, 0.5)

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

    // this is a field that
    // can be set by myself or by others
    // and affects the forces on me
    // and moves me towards my destination
    // until I get there
    this.destination = null
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
    // point-and-click navigation
    const viewportRelative = input.globalToLocal(
      pointer.clientX,
      pointer.clientY
    )
    const worldRelative = game.viewport.localToWorld(
      viewportRelative.x,
      viewportRelative.y
    )
    // use this position as the final position to navigate to
    // adjust by self-representation size
    this.destination = {
      x: worldRelative.x - this.width / 2,
      y: worldRelative.y - this.height / 2,
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
      this.destination = null
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
      this.destination = null
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

  updateLabelPosition(worldX, worldY) {
    const VERTICAL_PADDING = 10
    const localCoord = game.viewport.worldToLocal(
      worldX + SELF_REPRESENTATION_SIZE / 2,
      worldY + SELF_REPRESENTATION_SIZE + VERTICAL_PADDING
    )
    const globalCoord = localToGlobal(localCoord.x, localCoord.y)
    this.myNameText.style.top = `${globalCoord.y}px`
    this.myNameText.style.left = `${globalCoord.x}px`
  }

  onDestroyEvent() {
    // remove the label from the DOM
    this.myNameText.remove()
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
    } else if (
      other.name === 'background' ||
      other.name.includes('other-player-')
    ) {
      return false
    } else return true
  }
}

export default PlayerEntity
