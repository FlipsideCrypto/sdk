export function msToMin(ms: number): number {
  return ms / 1000 / 60;
}

export function minToMs(min: number): number {
  return min * 60 * 1000;
}

export function msToSec(ms: number): number {
  return ms / 1000;
}

export function secToMs(sec: number): number {
  return sec * 1000;
}
