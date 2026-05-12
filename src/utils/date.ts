/** Local calendar date `YYYY-MM-DD` (no timezone shift for "today"). */
export function formatLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Monday-start week; period key is Monday's `YYYY-MM-DD`. */
export function startOfWeekMonday(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  x.setHours(0, 0, 0, 0)
  return x
}

export function getDailyPeriodKey(d = new Date()): string {
  return formatLocalDate(d)
}

export function getWeeklyPeriodKey(d = new Date()): string {
  return formatLocalDate(startOfWeekMonday(d))
}

export function getMonthlyPeriodKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function compareIsoDates(a: string, b: string): number {
  if (a === b) return 0
  return a < b ? -1 : 1
}

export function todayString(): string {
  return formatLocalDate(new Date())
}

/** True if `YYYY-MM-DD` falls within the Monday–Sunday week containing `ref`. */
export function isDateInWeek(isoDate: string | undefined, ref = new Date()): boolean {
  if (!isoDate) return false
  const monday = startOfWeekMonday(ref)
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  const start = formatLocalDate(monday)
  const end = formatLocalDate(sunday)
  return isoDate >= start && isoDate <= end
}

export function parseDateOnly(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  const dt = new Date(y, mo - 1, d)
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null
  return dt
}

/**
 * Optional calendar dates from the UI (`<input type="date">` uses '' when cleared).
 * Absent/blank → undefined so domain types match optional fields.
 */
export function normalizeOptionalDateInput(value: string | undefined): string | undefined {
  const t = value?.trim()
  if (!t) return undefined
  return parseDateOnly(t) ? t : undefined
}

/**
 * Same normalization as {@link normalizeOptionalDateInput}, expressed as SQL NULL for PostgREST.
 * PostgreSQL DATE columns reject ''; nullable DATE maps empty input to NULL.
 */
export function toSqlDateNull(value: string | undefined | null): string | null {
  const normalized = normalizeOptionalDateInput(value ?? undefined)
  return normalized ?? null
}
