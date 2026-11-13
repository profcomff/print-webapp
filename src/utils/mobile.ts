type Device = Pick<Navigator, 'userAgent' | 'platform' | 'maxTouchPoints'>;
export function isMobile(device: Device = navigator): boolean {
  return /android|iphone|ipad|ipod|mobile/i.test(device.userAgent) || (device.platform === 'MacIntel' && device.maxTouchPoints > 1);
}
