import { migrate } from '@/storage/migrate'
import { isAppStateV1 } from '@/storage/schema'
import type { AppStateV1 } from '@/types'

export function serializeAppState(state: AppStateV1): string {
  return JSON.stringify(state, null, 2)
}

export function parseImportedAppState(json: string): AppStateV1 | null {
  try {
    const parsed: unknown = JSON.parse(json)
    const migrated = migrate(parsed)
    if (!isAppStateV1(migrated)) return null
    return migrated
  } catch {
    return null
  }
}

export function downloadJsonFile(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
