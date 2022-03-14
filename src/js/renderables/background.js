import { input, game, Entity } from 'melonjs/dist/melonjs.module.js'

class BackgroundEntity extends Entity {
  /**
   * constructor
   */
  constructor(x, y, settings) {
    // call the parent constructor
    super(x, y, settings)
    // don't let gravity affect the object
    this.body.ignoreGravity = true

    this.renderable.addAnimation('normal', [0])
    this.renderable.setCurrentAnimation('normal')
  }

  /**
   * colision handler
   * (called when colliding with other objects)
   */
  onCollision(response, other) {
    // Make this object not solid
    return false
  }
}

export default BackgroundEntity
