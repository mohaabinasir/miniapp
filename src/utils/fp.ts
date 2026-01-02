export default function getDeviceId() {
  const nav = window.navigator as any
  const screenData = window.screen

  const data = [
    nav.userAgent,
    nav.language,
    nav.platform,
    nav.hardwareConcurrency,
    nav.deviceMemory,
    screenData.width,
    screenData.height,
    screenData.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    nav.maxTouchPoints
  ].join('|')

  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))
    .then(buf => {
      const arr = Array.from(new Uint8Array(buf))
      return arr.map(x => x.toString(16).padStart(2, '0')).join('')
    })
}