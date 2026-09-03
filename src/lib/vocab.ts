import type { TermEntry } from '../types'
import { assignments } from '../content'

/**
 * Gom terms từ mọi assignment thành một danh sách phẳng.
 * Mỗi term giữ lại mã bài nó xuất hiện, để trang Vocab lọc được.
 */
export const allTerms: TermEntry[] = assignments.flatMap((a) =>
  a.terms.map((t) => ({ ...t, code: a.code, assignmentId: a.id })),
)

/** Các bài thực sự có term — dùng dựng bộ lọc */
export const termCodes: string[] = [...new Set(allTerms.map((t) => t.code))].sort()

/** So sánh không phân biệt hoa thường và dấu, để tìm kiếm dễ chịu hơn */
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')

export function filterTerms(
  terms: TermEntry[],
  query: string,
  code: string | null,
): TermEntry[] {
  const q = norm(query.trim())
  return terms.filter((t) => {
    if (code && t.code !== code) return false
    if (!q) return true
    return (
      norm(t.term).includes(q) ||
      norm(t.gloss).includes(q) ||
      norm(t.means.vi).includes(q) ||
      norm(t.means.en ?? '').includes(q)
    )
  })
}

/** Nhóm theo chữ cái đầu, cho chế độ sắp A-Z */
export function groupByLetter(terms: TermEntry[]): Array<[string, TermEntry[]]> {
  const map = new Map<string, TermEntry[]>()
  ;[...terms]
    .sort((a, b) => a.term.localeCompare(b.term, 'en'))
    .forEach((t) => {
      const letter = t.term[0].toUpperCase()
      const key = /[A-Z]/.test(letter) ? letter : '#'
      const list = map.get(key)
      if (list) list.push(t)
      else map.set(key, [t])
    })
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
}

/** Nhóm theo bài, giữ nguyên thứ tự term trong từng bài */
export function groupByAssignment(terms: TermEntry[]): Array<[string, TermEntry[]]> {
  const map = new Map<string, TermEntry[]>()
  terms.forEach((t) => {
    const list = map.get(t.code)
    if (list) list.push(t)
    else map.set(t.code, [t])
  })
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
}
