/** Smallest and largest of a list without spreading it into arguments (a long list overflows the call stack). */
export function minOf<T>(list: readonly T[], f: (x: T) => number, empty = Infinity): number {
  let m = empty
  for (const x of list) { const v = f(x); if (v < m) m = v }
  return m
}
export function maxOf<T>(list: readonly T[], f: (x: T) => number, empty = -Infinity): number {
  let m = empty
  for (const x of list) { const v = f(x); if (v > m) m = v }
  return m
}
