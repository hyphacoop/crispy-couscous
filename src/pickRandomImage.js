const AVATAR_SIZE = 220

export {
  AVATAR_SIZE
}

const images = [
  'avatar-01',
  'avatar-02',
  'avatar-03',
  'avatar-04',
  'avatar-05',
  'avatar-06',
  'avatar-07',
  'avatar-08',
  'avatar-09',
  'avatar-10',
  'avatar-11',
  'avatar-12',
]

export default function pickRandomImage() {
  const pick = Math.floor(Math.random() * images.length)
  return images[pick]
}
