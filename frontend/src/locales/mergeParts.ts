/**
 * A translation split into parts (one per area of the interface, plus the parts added later for new strings): the
 * namespaces the parts share are merged key by key, so a later part can add `create.idea.settings` without wiping
 * the rest of `create`. A later part wins for the same key.
 */
type Messages = { [key: string]: Messages | string | Messages[] | string[] }

const isObject = (v: unknown): v is Messages => typeof v === 'object' && v !== null && !Array.isArray(v)

function merge(target: Messages, source: Messages): Messages {
  for (const [key, value] of Object.entries(source)) {
    const current = target[key]
    target[key] = isObject(current) && isObject(value) ? merge({ ...current }, value) : value
  }
  return target
}

export function mergeParts(...parts: object[]): Messages {
  return parts.reduce<Messages>((all, part) => merge(all, part as Messages), {})
}
