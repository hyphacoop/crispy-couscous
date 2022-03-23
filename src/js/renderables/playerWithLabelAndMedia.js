import { input, Entity } from 'melonjs/dist/melonjs.module.js'
import { SELF_REPRESENTATION_SIZE } from '../../selfRepresentation'
import { worldToGlobal } from '../../coord'
import { createRecordOfOpenCall } from '../../calls'
import { MAIN_PLAYER_NAME } from '../../getPlayer'

class PlayerWithLabelAndMediaEntity extends Entity {
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

    // draw from the center
    this.anchorPoint.set(0.5, 0.5)

    this.playerId = settings.playerId
    this.artistaName = settings.artistaName

    // label
    this.myNameText = document.createElement('div')
    this.myNameText.innerHTML = this.artistaName
    this.myNameText.classList.add('name-label')
    this.myNameText.style.position = `absolute`
    // this.myNameText.addEventListener('click', this.onClick.bind(this))
    // x and y are 'world' coordinates
    this.updateLabelPosition(x, y)
    document.body.appendChild(this.myNameText)

    // don't let gravity affect the object
    this.body.ignoreGravity = true

    // ensure the player is updated even when outside of the viewport
    this.alwaysUpdate = true
  }

  onActivateEvent() {
    // input.registerPointerEvent('pointerdown', this, this.onClick.bind(this))
  }

  onDeactivateEvent() {
    // input.releasePointerEvent('pointerdown', this)
  }

  // @private
  // onClick() {
  //   // we can't select ourselves
  //   if (this.name === MAIN_PLAYER_NAME) return
  //   // alternate the selection
  //   if (this.isSelected) {
  //     this.deselect()
  //   } else {
  //     this.select()
  //   }
  // }

  /**
   * update the entity
   */
  update(dt) {
    this.updateLabelPosition(this.pos.x, this.pos.y)
    if (this.media) this.updateMediaPosition(this.pos.x, this.pos.y)
    return super.update(dt)
  }

  updateLabelPosition(worldX, worldY) {
    const VERTICAL_PADDING = 10
    const globalCoord = worldToGlobal(
      worldX + SELF_REPRESENTATION_SIZE / 2,
      worldY + SELF_REPRESENTATION_SIZE + VERTICAL_PADDING
    )
    this.myNameText.style.left = `${globalCoord.x}px`
    this.myNameText.style.top = `${globalCoord.y}px`
  }

  // remoteId is optional, and should be passed if this is from remote
  // not local
  addMedia(mediaStream, remoteId) {
    this.mediaIsVideo = mediaStream.getVideoTracks().length > 0
    if (this.mediaIsVideo) {
      this.media = document.createElement('video')
    } else {
      this.media = document.createElement('audio')
    }
    this.media.srcObject = mediaStream
    this.media.autoplay = true

    if (remoteId) {
      console.log('receiving a media stream from', remoteId)
      // cache this media object, for doing volume
      // adjustments, and making sure that it doesn't
      // get duplicated again for the same peer
      createRecordOfOpenCall(remoteId, this.media)
    } else {
      // mute local feed, for local
      this.media.volume = 0
    }

    this.mediaContainer = document.createElement('div')
    this.mediaContainer.classList.add('player-media')
    // don't display an audio feed on screen
    if (!this.mediaIsVideo) {
      this.media.style.display = 'hidden'
    } else {
      // if video, listen for clicks
      // this.mediaContainer.addEventListener('click', this.onClick.bind(this))
    }
    this.mediaContainer.appendChild(this.media)
    document.body.appendChild(this.mediaContainer)
    // x and y are 'world' coordinates
    this.updateMediaPosition(this.pos.x, this.pos.y)
  }

  updateMediaPosition(worldX, worldY) {
    // console.log(this.width, this.height)
    const globalCoordTopLeft = worldToGlobal(worldX, worldY)
    const globalCoordBottomRight = worldToGlobal(
      worldX + SELF_REPRESENTATION_SIZE,
      worldY + SELF_REPRESENTATION_SIZE
    )
    const widthHeight = globalCoordBottomRight.x - globalCoordTopLeft.x
    this.mediaContainer.style.borderRadius = `${widthHeight / 2}px`
    this.mediaContainer.style.width = `${widthHeight}px`
    this.mediaContainer.style.height = `${widthHeight}px`

    this.mediaContainer.style.left = `${globalCoordTopLeft.x}px`
    this.mediaContainer.style.top = `${globalCoordTopLeft.y}px`
  }

  select() {
    this.myNameText.innerHTML = this.myNameText.innerHTML + ' (selected)'
    this.isSelected = true
  }
  deselect() {
    this.myNameText.innerHTML = this.myNameText.innerHTML.replace(
      ' (selected)',
      ''
    )
    this.isSelected = false
  }

  draw(renderer, object) {
    // console.log(object)
    // dont render image if we have video
    if (!this.mediaIsVideo) {
      super.draw(renderer, object)
    }
  }

  onDestroyEvent() {
    // remove the label from the DOM
    this.myNameText.remove()
    // remove the video/audio container from the dom
    if (this.mediaContainer) this.mediaContainer.remove()
  }
}

export default PlayerWithLabelAndMediaEntity
