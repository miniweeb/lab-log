import { useEffect, useMemo, useRef, useState } from 'react'
import { Empty } from '../components/ui'
import { DEFAULT_CONCEPTS, type ConceptItem } from '../lib/concepts'

export type { ConceptItem }   // giữ nguyên đường import cũ cho các file khác
const STORAGE_KEY = 'lab-log:foundations:concepts'
const MASTERED_KEY = 'lab-log:foundations:mastered'

function readStoredConcepts(): ConceptItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return DEFAULT_CONCEPTS
}

export default function Foundations() {
  const [concepts, setConcepts] = useState<ConceptItem[]>(readStoredConcepts)
  const [activeSub, setActiveSub] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  
  // Pagination state (Chỉ cần phân trang sổ tay tra cứu)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  
  // Mastered state
  const [mastered, setMastered] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(MASTERED_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch { return {} }
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(concepts))
  }, [concepts])

  const toggleMaster = (id: string) => {
    const next = { ...mastered, [id]: !mastered[id] }
    setMastered(next)
    localStorage.setItem(MASTERED_KEY, JSON.stringify(next))
  }

  // ── IMPORT / EXPORT FUNCTIONS ──
  const handleExportJSON = () => {
    const dataToExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      totalConcepts: concepts.length,
      concepts,
      mastered
    }
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `foundations-concepts-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        let importedConcepts: ConceptItem[] = []
        let importedMastered: Record<string, boolean> = {}

        if (Array.isArray(parsed)) {
          importedConcepts = parsed
        } else if (parsed && Array.isArray(parsed.concepts)) {
          importedConcepts = parsed.concepts
          if (parsed.mastered) importedMastered = parsed.mastered
        }

        if (importedConcepts.length > 0) {
          setConcepts(importedConcepts)
          setPage(1)
          if (Object.keys(importedMastered).length > 0) {
            setMastered(importedMastered)
            localStorage.setItem(MASTERED_KEY, JSON.stringify(importedMastered))
          }
          alert(`Đã nạp thành công ${importedConcepts.length} khái niệm vào Foundations!`)
        } else {
          alert('File JSON không đúng cấu trúc danh sách khái niệm Foundations.')
        }
      } catch {
        alert('Lỗi: File JSON không đọc được hoặc sai định dạng.')
      }
    }
    reader.readAsText(file)
  }

  const handleResetDefault = () => {
    if (confirm('Khôi phục danh sách 34 khái niệm gốc theo đúng thứ tự logic (1 - 34)? Mọi thay đổi trước đó sẽ được làm mới.')) {
      setConcepts(DEFAULT_CONCEPTS)
      setPage(1)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONCEPTS))
      alert('Đã khôi phục danh sách chuẩn từ 1 đến 34.')
    }
  }

  const subjects = [
    'ALL',
    'Pipeline Lifecycle',
    'SQL & Engine',
    'Storage & Pruning',
    'Cleansing',
    'Complex Types',
    'Quality Gate',
    'SQL Fundamentals',
    'Data Modeling',
    'Reliability & Ops',
  ]

  const filtered = useMemo(() => {
    return concepts.filter((c) => {
      const matchSub = activeSub === 'ALL' || c.subject === activeSub
      const q = search.toLowerCase().trim()
      const matchQ = !q || c.term.toLowerCase().includes(q) || c.definition.toLowerCase().includes(q) || c.formulaOrSyntax.toLowerCase().includes(q)
      return matchSub && matchQ
    })
  }, [concepts, activeSub, search])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const pagedConcepts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div className="page-head">
        <h2>Foundations · Sổ tay Khái niệm & Cú pháp ETL</h2>
      </div>

      <div className="card intro" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ margin: 0 }}>
            Hệ thống khái niệm sắp xếp tuần tự theo lộ trình học từ: Mô hình tư duy ➔ Nạp dữ liệu ➔ Lưu trữ ➔ Làm sạch ➔ Biến đổi ➔ Cổng kiểm soát.
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn ghost sm" onClick={handleExportJSON}>📥 Xuất JSON</button>
            <button className="btn ghost sm" onClick={() => fileInputRef.current?.click()}>📤 Nạp JSON</button>
            <button className="btn ghost sm" onClick={handleResetDefault} title="Khôi phục thứ tự chuẩn">🔄 Đặt lại</button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => e.target.files?.[0] && handleImportJSON(e.target.files[0])}
            />
          </div>
        </div>
      </div>

      {/* Filter Controls & Search */}
      <div className="vocab-controls" style={{ marginBottom: 12 }}>
        <input
          type="text"
          className="vocab-search"
          placeholder="Tìm kiếm theo số thứ tự (1, 2...), tên khái niệm, cú pháp SQL, cạm bẫy..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {/* Filter Chips */}
      <div className="chiprow" style={{ marginBottom: 16 }}>
        {subjects.map((sub) => (
          <button
            key={sub}
            className="fchip"
            aria-pressed={activeSub === sub}
            onClick={() => {
              setActiveSub(sub)
              setPage(1)
            }}
          >
            {sub}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty ico="🔍">Không tìm thấy khái niệm phù hợp với bộ lọc.</Empty>
      ) : (
        /* ════════════ BROWSE HANDBOOK LIST (WITH PAGINATION) ════════════ */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Controls bar: count & page size */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, margin: '0 0 4px' }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              Hiển thị <b>{pagedConcepts.length}</b> / <b>{filtered.length}</b> khái niệm · Trang {currentPage}/{totalPages}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
              <span>Hiển thị:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: '1px solid var(--line)',
                  background: '#fff',
                  color: 'var(--text)',
                  fontSize: 13
                }}
              >
                <option value={4}>4 mục / trang</option>
                <option value={6}>6 mục / trang</option>
                <option value={10}>10 mục / trang</option>
                <option value={26}>Toàn bộ (26 mục)</option>
              </select>
            </div>
          </div>

          {pagedConcepts.map((item) => {
            const isDone = mastered[item.id]
            return (
              <div
                key={item.id}
                className="card"
                style={{
                  borderLeft: isDone ? '4px solid #10b981' : '4px solid var(--coral)',
                  padding: 16
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <span className="code-tag" style={{ marginRight: 8 }}>{item.subject}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>
                      {item.pronounceOrType}
                    </span>
                    <h3 style={{ margin: '4px 0 0', fontSize: 18, color: 'var(--text)' }}>
                      {item.term}
                    </h3>
                  </div>
                  <button
                    className={`btn sm ${isDone ? 'ghost' : ''}`}
                    style={{ fontSize: 12, padding: '4px 10px' }}
                    onClick={() => toggleMaster(item.id)}
                  >
                    {isDone ? '✓ Đã thuộc' : '○ Thuộc lòng'}
                  </button>
                </div>

                <p style={{ margin: '0 0 10px', fontSize: 14, color: 'var(--text)' }}>
                  <b>Định nghĩa: </b>{item.definition}
                </p>

                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>
                    Cú pháp / Công thức chuẩn:
                  </span>
                  <pre style={{
                    background: '#181825',
                    color: '#cdd6f4',
                    padding: 10,
                    borderRadius: 6,
                    fontSize: 12,
                    overflowX: 'auto',
                    fontFamily: 'var(--mono)',
                    margin: '4px 0 0'
                  }}>
                    <code>{item.formulaOrSyntax}</code>
                  </pre>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, background: '#fafafa', padding: 8, borderRadius: 6 }}>
                  <div style={{ fontSize: 12.5, color: '#b91c1c' }}>
                    <b>⚠️ Cạm bẫy: </b>{item.pitfall}
                  </div>
                  {item.sourceLink && (
                    <a
                      href={item.sourceLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 12, color: 'var(--coral)', textDecoration: 'none', fontWeight: 500 }}
                    >
                      {item.sourceLink.text} ↗
                    </a>
                  )}
                </div>
              </div>
            )
          })}

          {/* ── PAGINATION BAR ── */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
              marginTop: 20,
              marginBottom: 16,
              flexWrap: 'wrap'
            }}>
              <button
                className="btn ghost sm"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                ← Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1]
                  return (
                    <span key={p} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {prev && p - prev > 1 && <span style={{ color: 'var(--muted)' }}>...</span>}
                      <button
                        className={`btn sm ${p === currentPage ? '' : 'ghost'}`}
                        style={{
                          minWidth: 36,
                          padding: '6px 10px',
                          fontWeight: p === currentPage ? 600 : 400
                        }}
                        onClick={() => handlePageChange(p)}
                      >
                        {p}
                      </button>
                    </span>
                  )
                })}

              <button
                className="btn ghost sm"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}