import { Body, Rect, Sprite, game } from 'melonjs/dist/melonjs.module.js'
import localToGlobal from '../../coord'
import { SELF_REPRESENTATION_SIZE } from '../../selfRepresentation'

class OtherPlayer extends Sprite {
  /**
   * constructor
   */
  constructor(x, y, settings) {
    // call the parent constructor
    super(x, y, settings)

    this.artistaName = settings.artistaName
    
    // draw image from the top left
    this.anchorPoint.set(0, 0)
    
    // add a physic body
    this.body = new Body(this)
    // add a default collision shape
    this.body.addShape(new Rect(0, 0, this.width, this.height))
    const X_MAX_VELOCITY = 10
    const Y_MAX_VELOCITY = 10
    this.body.setMaxVelocity(X_MAX_VELOCITY, Y_MAX_VELOCITY)
    this.body.setFriction(0.8, 0.8)
    
    // don't let gravity affect the object
    this.body.ignoreGravity = true
    
    // enable this, since the entity starts off the viewport
    this.alwaysUpdate = true

    // label
    this.nameText = document.createElement('div')
    this.nameText.innerHTML = this.artistaName
    this.nameText.classList.add('name-label')
    this.nameText.style.position = `absolute`
    // x and y are 'world' coordinates
    this.updateLabelPosition(x, y)
    document.body.appendChild(this.nameText)
  }

  update(dt) {
    this.updateLabelPosition(this.pos.x, this.pos.y)
    return super.update(dt)
  }

  updateLabelPosition(worldX, worldY) {
    const VERTICAL_PADDING = 10
    const localCoord = game.viewport.worldToLocal(
      worldX + SELF_REPRESENTATION_SIZE / 2,
      worldY + SELF_REPRESENTATION_SIZE + VERTICAL_PADDING
    )
    const globalCoord = localToGlobal(localCoord.x, localCoord.y)
    this.nameText.style.top = `${globalCoord.y}px`
    this.nameText.style.left = `${globalCoord.x}px`
  }

  /**
   * colision handler
   * (called when colliding with other objects)
   */
  onCollision(response, other) {
    // Make other objects non solid, for this object
    return false
  }

  onDestroyEvent() {
    // remove the label from the DOM
    this.nameText.remove()
  }
}

export default OtherPlayer
