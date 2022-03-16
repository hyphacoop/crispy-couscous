import Gun from 'gun/gun'

// const RELAY_ADDRESS = 'http://localhost:8080/gun'
const RELAY_ADDRESS = 'https://hypha-gun-relay.herokuapp.com/gun'
const gun = Gun(RELAY_ADDRESS)

const LOCALSTORAGE_ME_KEY = 'ME_KEY'
const ARTISTAS_KEY = 'artistas'
const LOCATION_KEY = 'location'

const artistas = gun.get(ARTISTAS_KEY)

// uncomment this to reset all the peoples
// artistas.map().once((data, id) => {
//   artistas.get(id).put(null)
// })

// check if I've visited before.
// re-use my id if so.
// if not, generate a random ID for myself
let myselfId = localStorage.getItem(LOCALSTORAGE_ME_KEY)
if (!myselfId) {
  myselfId = Math.random().toString().split('.')[1]
  localStorage.setItem(LOCALSTORAGE_ME_KEY, myselfId)
  console.log('first time to use, this is my id: ', myselfId)
} else {
  console.log('second time use, this is my id: ', myselfId)
}

const myself = artistas.get(myselfId)

function subscribeToArtistas(callback) {
  artistas
    // all children properties (peers), but omit myself
    .map((data, id) => {
      return id === myselfId ? undefined : data
    })
    // once per artista, including those that are added over time
    .once((_data, id) => {
      const artista = artistas.get(id)
      // listen to all changes to location
      artista.get(LOCATION_KEY).on((locationData) => {
        callback(id, locationData.x, locationData.y)
      })
    })
}

export {
  gun,
  myself,
  artistas,
  myselfId,
  subscribeToArtistas,
  LOCALSTORAGE_ME_KEY,
  ARTISTAS_KEY,
  LOCATION_KEY,
}
