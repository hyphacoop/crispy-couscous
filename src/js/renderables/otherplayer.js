import PlayerWithLabelAndMediaEntity from './playerWithLabelAndMedia'

class OtherPlayer extends PlayerWithLabelAndMediaEntity {
  /**
   * constructor
   */
  constructor(x, y, settings) {
    super(x, y, settings)
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
