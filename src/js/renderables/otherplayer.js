import { Body, Rect, Sprite } from 'melonjs/dist/melonjs.module.js'

class OtherPlayer extends Sprite {
  /**
   * constructor
   */
  constructor(x, y, settings) {
    // call the parent constructor
    super(x, y, settings)

    this.anchorPoint.set(0.5, 0.5)

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
  }

  /**
   * colision handler
   * (called when colliding with other objects)
   */
  onCollision(response, other) {
    // Make other objects non solid, for this object
    return false
  }
}

export default OtherPlayer
