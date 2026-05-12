import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import './Tabs.css'

type TabsContextValue = {
  selectedId: string
  select: (id: string) => void
  tabIds: string[]
  registerTab: (id: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

export type TabsProps = {
  defaultSelectedId: string
  children: ReactNode
  className?: string
}

export function Tabs({ defaultSelectedId, children, className = '' }: TabsProps) {
  const [selectedId, setSelectedId] = useState(defaultSelectedId)
  const [tabIds, setTabIds] = useState<string[]>([])

  const registerTab = useCallback((id: string) => {
    setTabIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  const select = useCallback((id: string) => setSelectedId(id), [])

  const value = useMemo(
    () => ({
      selectedId,
      select,
      tabIds,
      registerTab,
    }),
    [selectedId, select, tabIds, registerTab],
  )

  return (
    <TabsContext.Provider value={value}>
      <div className={`fo-tabs ${className}`.trim()}>{children}</div>
    </TabsContext.Provider>
  )
}

export type TabListProps = {
  children: ReactNode
  'aria-label': string
}

export function TabList({ children, 'aria-label': ariaLabel }: TabListProps) {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('TabList must be inside Tabs')

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const ids = ctx.tabIds
    const idx = ids.indexOf(ctx.selectedId)
    if (idx < 0 || ids.length === 0) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = ids[(idx + 1) % ids.length]
      ctx.select(next)
      document.getElementById(`tab-${next}`)?.focus()
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const next = ids[(idx - 1 + ids.length) % ids.length]
      ctx.select(next)
      document.getElementById(`tab-${next}`)?.focus()
    }
  }

  return (
    <div className="fo-tabs__list" role="tablist" aria-label={ariaLabel} onKeyDown={onKeyDown}>
      {children}
    </div>
  )
}

export type TabProps = {
  id: string
  children: ReactNode
}

export function Tab({ id, children }: TabProps) {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tab must be inside Tabs')

  useEffect(() => {
    ctx.registerTab(id)
  }, [ctx, id])

  const selected = ctx.selectedId === id

  return (
    <button
      type="button"
      role="tab"
      id={`tab-${id}`}
      aria-selected={selected}
      aria-controls={`panel-${id}`}
      tabIndex={selected ? 0 : -1}
      className={`fo-tabs__tab ${selected ? 'fo-tabs__tab--selected' : ''}`.trim()}
      onClick={() => ctx.select(id)}
    >
      {children}
    </button>
  )
}

export type TabPanelProps = {
  id: string
  children: ReactNode
}

export function TabPanel({ id, children }: TabPanelProps) {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('TabPanel must be inside Tabs')

  const hidden = ctx.selectedId !== id

  return (
    <div
      id={`panel-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      hidden={hidden}
      className="fo-tabs__panel"
    >
      {hidden ? null : children}
    </div>
  )
}
