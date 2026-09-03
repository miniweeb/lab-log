import { useCallback, useEffect, useState } from 'react'
import type { AssignmentProgress, Lang, TaskProgress, TaskStatus } from '../types'
import { emptyTaskProgress } from '../types'

/** Mỗi assignment một bản ghi riêng: lab-log:progress:a02 */
const PREFIX = 'lab-log:progress:'
const key = (id: string) => PREFIX + id
const listeners = new Set<(id: string) => void>()

export function readProgress(assignmentId: string): AssignmentProgress {
  try {
    const raw = localStorage.getItem(key(assignmentId))
    if (raw) {
      const p = JSON.parse(raw) as AssignmentProgress
      return { ...p, theoryRead: p.theoryRead ?? [] }
    }
  } catch {
    /* bản ghi hỏng thì coi như chưa có */
  }
  return { assignmentId, tasks: {}, theoryRead: [] }
}

export function writeProgress(p: AssignmentProgress) {
  try {
    localStorage.setItem(key(p.assignmentId), JSON.stringify(p))
  } catch {
    alert(
      'Không lưu được. Bộ nhớ trình duyệt đã đầy — thường là do ảnh đính kèm. ' +
        'Xoá bớt ảnh cũ, hoặc xuất file sao lưu rồi đặt lại bài này.',
    )
    return
  }
  listeners.forEach((l) => l(p.assignmentId))
}

export function useProgress(assignmentId: string): AssignmentProgress {
  const [p, setP] = useState(() => readProgress(assignmentId))
  useEffect(() => {
    setP(readProgress(assignmentId))
    const l = (id: string) => { if (id === assignmentId) setP(readProgress(assignmentId)) }
    listeners.add(l)
    return () => { listeners.delete(l) }
  }, [assignmentId])
  return p
}

export function saveTask(assignmentId: string, taskId: string, patch: Partial<TaskProgress>) {
  const p = readProgress(assignmentId)
  p.tasks[taskId] = { ...(p.tasks[taskId] ?? emptyTaskProgress()), ...patch, updatedAt: new Date().toISOString() }
  writeProgress(p)
}

export function useTaskProgress(assignmentId: string, taskId: string) {
  const p = useProgress(assignmentId)
  const task = p.tasks[taskId] ?? emptyTaskProgress()
  const update = useCallback(
    (patch: Partial<TaskProgress>) => saveTask(assignmentId, taskId, patch),
    [assignmentId, taskId],
  )
  return [task, update] as const
}

export function toggleTheoryRead(assignmentId: string, level: string) {
  const p = readProgress(assignmentId)
  p.theoryRead = p.theoryRead.includes(level)
    ? p.theoryRead.filter((x) => x !== level)
    : [...p.theoryRead, level]
  writeProgress(p)
}

export function counts(assignmentId: string, taskIds: string[]) {
  const p = readProgress(assignmentId)
  const out: Record<TaskStatus, number> = { todo: 0, doing: 0, done: 0 }
  taskIds.forEach((id) => { out[p.tasks[id]?.status ?? 'todo']++ })
  return out
}

export function clearAssignment(id: string) {
  localStorage.removeItem(key(id))
  listeners.forEach((l) => l(id))
}

/* ── ngôn ngữ ── */
const LANG_KEY = 'lab-log:lang'
const langListeners = new Set<() => void>()
let lang: Lang = (localStorage.getItem(LANG_KEY) as Lang) || 'vi'

export function setLang(l: Lang) {
  lang = l
  localStorage.setItem(LANG_KEY, l)
  langListeners.forEach((f) => f())
}

export function useLang(): Lang {
  const [, bump] = useState(0)
  useEffect(() => {
    const f = () => bump((n) => n + 1)
    langListeners.add(f)
    return () => { langListeners.delete(f) }
  }, [])
  return lang
}

/* ── sao lưu ── */
function download(data: unknown, name: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

export const exportAssignment = (id: string) => download(readProgress(id), `lab-log-${id}`)

export function exportAll() {
  const all: AssignmentProgress[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k?.startsWith(PREFIX)) {
      try { all.push(JSON.parse(localStorage.getItem(k)!) as AssignmentProgress) } catch { /* bỏ qua */ }
    }
  }
  download(all, 'lab-log-tat-ca')
}

export function importBackup(file: File) {
  const r = new FileReader()
  r.onload = () => {
    try {
      const data = JSON.parse(String(r.result))
      const list: AssignmentProgress[] = Array.isArray(data) ? data : [data]
      list.forEach((p) => { if (p?.assignmentId && p.tasks) writeProgress({ ...p, theoryRead: p.theoryRead ?? [] }) })
      alert(`Đã khôi phục ${list.length} bài.`)
    } catch {
      alert('File không đọc được. Cần đúng file JSON đã xuất từ trang này.')
    }
  }
  r.readAsText(file)
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(String(r.result))
    r.onerror = () => rej(new Error('Không đọc được ảnh'))
    r.readAsDataURL(file)
  })
}
