'use client'

import { useCallback, useSyncExternalStore, type Dispatch, type SetStateAction } from 'react'

const storageValues = new Map<string, unknown>()
const storageRaw = new Map<string, string | null>()
const storageEventName = 'whismap-local-storage-change'

function readValue<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') return initialValue

  try {
    const raw = window.localStorage.getItem(key)
    if (storageRaw.get(key) === raw && storageValues.has(key)) return storageValues.get(key) as T

    const next = raw ? JSON.parse(raw) as T : initialValue
    storageRaw.set(key, raw)
    storageValues.set(key, next)
    return next
  } catch {
    return initialValue
  }
}

/**
 * Browser-only persistent state without hydration mismatches. Values remain on
 * the device; no data is sent to a server by this hook.
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const subscribe = useCallback((onStoreChange: () => void) => {
    if (typeof window === 'undefined') return () => undefined

    const handleStorage = (event: Event) => {
      if (event.type === 'storage') {
        const storageEvent = event as StorageEvent
        if (storageEvent.key && storageEvent.key !== key) return
      }
      onStoreChange()
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(storageEventName, handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(storageEventName, handleStorage)
    }
  }, [key])

  const getSnapshot = useCallback(() => readValue(key, initialValue), [initialValue, key])
  const getServerSnapshot = useCallback(() => initialValue, [initialValue])
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )

  const setValue = useCallback<Dispatch<SetStateAction<T>>>((update) => {
    const current = readValue(key, initialValue)
    const next = typeof update === 'function'
      ? (update as (value: T) => T)(current)
      : update

    storageValues.set(key, next)
    try {
      const raw = JSON.stringify(next)
      storageRaw.set(key, raw)
      window.localStorage.setItem(key, raw)
    } catch {
      // Keep the in-memory value when browser storage is unavailable.
    }
    window.dispatchEvent(new Event(storageEventName))
  }, [initialValue, key])

  return [value, setValue, hydrated]
}
