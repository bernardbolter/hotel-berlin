/**
 * Remove the GPS IFD from a JPEG while leaving other EXIF intact.
 * Non-JPEG buffers are returned unchanged.
 */
export function stripGpsFromJpeg(bytes: Uint8Array): Uint8Array {
  if (bytes.length < 2 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return bytes

  // piexifjs is CJS.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const piexif = require('piexifjs') as typeof import('piexifjs')

  try {
    const binary = uint8ToBinaryString(bytes)
    const exifObj = piexif.load(binary)
    if (exifObj.GPS) {
      exifObj.GPS = {}
    }
    if (exifObj['0th'] && piexif.ImageIFD?.GPSTag != null) {
      delete exifObj['0th'][piexif.ImageIFD.GPSTag]
    }
    const dumped = piexif.dump(exifObj)
    const inserted = piexif.insert(dumped, binary)
    return binaryStringToUint8(inserted)
  } catch {
    return bytes
  }
}

function uint8ToBinaryString(buf: Uint8Array): string {
  const chunk = 0x8000
  let s = ''
  for (let i = 0; i < buf.length; i += chunk) {
    s += String.fromCharCode(...buf.subarray(i, i + chunk))
  }
  return s
}

function binaryStringToUint8(s: string): Uint8Array {
  const out = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff
  return out
}
