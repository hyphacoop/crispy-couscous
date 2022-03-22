import { input, game, pool, video, device } from 'melonjs/dist/melonjs.module'

export default function localToGlobal(x, y) {
  let v = pool.pull('Vector2d')

  var pixelRatio = device.devicePixelRatio
  x = x / pixelRatio
  y = y / pixelRatio

  const { scaleRatio, renderer } = video
  var scale = scaleRatio
  if (scale.x !== 1.0 || scale.y !== 1.0) {
    x *= scale.x
    y *= scale.y
  }

  var rect = device.getElementBounds(renderer.getScreenCanvas())
  x += rect.left + (window.pageXOffset || 0)
  y += rect.top + (window.pageYOffset || 0)
  return v.set(x, y)
}

// from the world coords, through the 'local' coords
// and finally, to the coords on 'screen'
export function worldToGlobal(x, y) {
  const localCoord = game.viewport.worldToLocal(x, y)
  return localToGlobal(localCoord.x, localCoord.y)
}

// from the "global" coords (on screen), through the 'local' (viewport)
// coords, and finally, to the "world" coords
export function globalToWorld(x, y) {
  const localCoord = input.globalToLocal(x, y)
  return game.viewport.localToWorld(localCoord.x, localCoord.y)
}
