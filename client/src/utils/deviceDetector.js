export function getDeviceInfo() {
  if (typeof window === 'undefined') return 'Unknown Device';

  const userAgent = navigator.userAgent;
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  // Detect OS
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    os = 'iOS';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (/Macintosh|Mac OS X/.test(userAgent)) {
    os = 'macOS';
  } else if (/Windows NT/.test(userAgent)) {
    os = 'Windows';
  } else if (/Linux/.test(userAgent)) {
    os = 'Linux';
  }

  // Detect Browser
  if (/Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor)) {
    if (/Mobile/.test(userAgent)) {
      browser = 'Chrome Mobile';
    } else {
      browser = 'Chrome';
    }
  } else if (/Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor)) {
    if (/Mobile/.test(userAgent)) {
      browser = 'Mobile Safari';
    } else {
      browser = 'Safari';
    }
  } else if (/Firefox/.test(userAgent)) {
    browser = 'Firefox';
  } else if (/Edg/.test(userAgent)) {
    browser = 'Edge';
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return `${os} • ${browser} • ${width}x${height} (${isTouch ? 'Touch' : 'Desktop'})`;
}
