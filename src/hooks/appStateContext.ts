import { createContext } from 'react'
import type { AppStateV1 } from '@/types'

export type AppStateContextValue = {
  state: AppStateV1
  setState: (updater: (prev: AppStateV1) => AppStateV1) => void
  replaceState: (next: AppStateV1) => void
  flushPersist: () => Promise<void>
}

export const AppStateContext = createContext<AppStateContextValue | null>(null)
