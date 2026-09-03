import { useMemo, useState } from 'react'
import { allTerms, filterTerms, groupByAssignment, groupByLetter, termCodes } from '../lib/vocab'
import { Empty, T } from '../components/ui'

type ViewMode = 'list' | 'flashcard'
type SortMode = 'assignment' | 'alpha'

export default function Vocab() {
  const [query, setQuery] = useState('')
  const [code, setCode] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [sortMode, setSortMode] = useState<SortMode>('assignment')
  
  // Pagination state (List mode)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Flashcard state
  const [cardIndex, setCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [mastered, setMastered] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('lab-log:vocab:mastered')
      return raw ? JSON.parse(raw) : {}
    } catch { return {} }
  })

  const toggleMaster = (key: string) => {
    const next = { ...mastered, [key]: !mastered[key] }
    setMastered(next)
    localStorage.setItem('lab-log:vocab:mastered', JSON.stringify(next))
  }

  const filtered = useMemo(() => filterTerms(allTerms, query, code), [query, code])
  
  // Total pages
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  // Sliced items for current page
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  const groups = useMemo(
    () => (sortMode === 'alpha' ? groupByLetter(pageItems) : groupByAssignment(pageItems)),
    [pageItems, sortMode],
  )

  const curCard = filtered[cardIndex] || filtered[0]
  const curCardKey = curCard ? `${curCard.assignmentId}-${curCard.term}` : ''

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div className="page-head">
        <h2>Vocab · Thuật ngữ Data Engineering</h2>
      </div>

      <div className="card intro" style={{ marginBottom: 16 }}>
        <p>
          Toàn bộ thuật ngữ từ các bài lab (A00 – A05). Hỗ trợ chế độ <b>Danh sách tra cứu</b> và <b>Thẻ ghi nhớ (Flashcard)</b> để học thuộc lòng từ vựng chuyên ngành.
        </p>
      </div>

      {/* Search & View Mode Switcher */}
      <div className="vocab-controls" style={{ marginBottom: 12 }}>
        <input
          type="text"
          className="vocab-search"
          value={query}
          placeholder="Tìm theo tên tiếng Anh, nghĩa tiếng Việt, hoặc mô tả…"
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
            setCardIndex(0)
          }}
        />
        <div className="tabs small">
          <button
            role="tab"
            aria-selected={viewMode === 'list'}
            onClick={() => setViewMode('list')}
          >
            📋 Danh sách
          </button>
          <button
            role="tab"
            aria-selected={viewMode === 'flashcard'}
            onClick={() => {
              setViewMode('flashcard')
              setIsFlipped(false)
            }}
          >
            🗂️ Flashcard
          </button>
        </div>
      </div>

      {/* Filter by Assignment Chips */}
      <div className="chiprow" role="group" aria-label="Lọc theo bài">
        <button
          className="fchip"
          aria-pressed={code === null}
          onClick={() => {
            setCode(null)
            setPage(1)
            setCardIndex(0)
          }}
        >
          Tất cả ({allTerms.length})
        </button>
        {termCodes.map((c) => (
          <button
            key={c}
            className="fchip"
            aria-pressed={code === c}
            onClick={() => {
              setCode(code === c ? null : c)
              setPage(1)
              setCardIndex(0)
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty ico="🔍">
          Không có thuật ngữ nào khớp. Thử từ khoá ngắn hơn, hoặc bỏ bộ lọc bài.
        </Empty>
      ) : viewMode === 'flashcard' && curCard ? (
        /* ════════════ VOCAB FLASHCARD MODE ════════════ */
        <div className="flashcard-box" style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)' }}>
              Thẻ {cardIndex + 1} / {filtered.length} · <span className="code-tag">{curCard.code}</span>
            </span>
            <button
              className={`btn sm ${mastered[curCardKey] ? 'ghost' : ''}`}
              onClick={() => toggleMaster(curCardKey)}
            >
              {mastered[curCardKey] ? '✓ Đã thuộc' : '○ Đánh dấu đã thuộc'}
            </button>
          </div>

          <div
            className="card clickable"
            style={{
              minHeight: 280,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              cursor: 'pointer',
              border: isFlipped ? '2px solid var(--coral)' : '1px solid var(--line)',
              background: isFlipped ? '#fff' : 'var(--card)'
            }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {!isFlipped ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <span className="code-tag" style={{ fontSize: 13 }}>{curCard.code}</span>
                <h2 style={{ fontSize: 28, margin: '14px 0 8px', color: 'var(--coral)' }}>{curCard.term}</h2>
                <p style={{ color: 'var(--muted)', fontSize: 16, fontStyle: 'italic', margin: '0 0 16px' }}>
                  "{curCard.gloss}"
                </p>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                  👉 Nhấn vào thẻ để xem định nghĩa tiếng Việt & tiếng Anh
                </p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--line)', paddingBottom: 8, marginBottom: 12 }}>
                  <h3 style={{ margin: 0, color: 'var(--coral)' }}>{curCard.term}</h3>
                  <span style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>{curCard.gloss}</span>
                </div>

                <div style={{ margin: '14px 0' }}>
                  <T t={curCard.means} />
                </div>

                {curCard.source && (
                  <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px dashed var(--line)' }}>
                    <a
                      className="vterm-src"
                      href={curCard.source.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 12.5 }}
                    >
                      {curCard.source.name} ↗
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
            <button
              className="btn ghost sm"
              disabled={cardIndex === 0}
              onClick={() => {
                setCardIndex(cardIndex - 1)
                setIsFlipped(false)
              }}
            >
              ← Từ trước
            </button>
            <button
              className="btn sm"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {isFlipped ? 'Xem từ gốc' : 'Lật xem nghĩa'}
            </button>
            <button
              className="btn ghost sm"
              disabled={cardIndex >= filtered.length - 1}
              onClick={() => {
                setCardIndex(cardIndex + 1)
                setIsFlipped(false)
              }}
            >
              Từ tiếp theo →
            </button>
          </div>
        </div>
      ) : (
        /* ════════════ VOCAB LIST MODE (WITH PAGINATION) ════════════ */
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, margin: '0 0 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <p className="hint vocab-count" style={{ margin: 0 }}>
                Hiển thị {pageItems.length}/{filtered.length} thuật ngữ · Trang {currentPage}/{totalPages}
              </p>
              <div className="tabs small" style={{ margin: 0 }}>
                <button
                  role="tab"
                  aria-selected={sortMode === 'assignment'}
                  onClick={() => {
                    setSortMode('assignment')
                    setPage(1)
                  }}
                  style={{ padding: '4px 10px', fontSize: 12 }}
                >
                  Theo bài
                </button>
                <button
                  role="tab"
                  aria-selected={sortMode === 'alpha'}
                  onClick={() => {
                    setSortMode('alpha')
                    setPage(1)
                  }}
                  style={{ padding: '4px 10px', fontSize: 12 }}
                >
                  A–Z
                </button>
              </div>
            </div>

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
                <option value={5}>5 mục / trang</option>
                <option value={10}>10 mục / trang</option>
                <option value={20}>20 mục / trang</option>
                <option value={50}>50 mục / trang</option>
              </select>
            </div>
          </div>

          {groups.map(([key, items]) => (
            <section className="vgroup" key={key}>
              <h3 className="vgroup-head">{key}</h3>
              {items.map((t) => {
                const itemKey = `${t.assignmentId}-${t.term}`
                const isDone = mastered[itemKey]
                return (
                  <div
                    className="vterm"
                    key={itemKey}
                    style={{
                      borderLeft: isDone ? '3px solid #10b981' : undefined
                    }}
                  >
                    <div className="vterm-head" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <span className="vterm-name">{t.term}</span>
                        <span className="vterm-gloss" style={{ marginLeft: 8 }}>{t.gloss}</span>
                        {sortMode === 'alpha' && <span className="chip code">{t.code}</span>}
                      </div>
                      <button
                        className={`btn sm ${isDone ? 'ghost' : ''}`}
                        style={{ fontSize: 11, padding: '2px 8px', height: 'auto' }}
                        onClick={() => toggleMaster(itemKey)}
                      >
                        {isDone ? '✓ Đã thuộc' : '○ Thuộc'}
                      </button>
                    </div>
                    <T t={t.means} />
                    {t.source && (
                      <a className="vterm-src" href={t.source.url} target="_blank" rel="noreferrer">
                        {t.source.name} ↗
                      </a>
                    )}
                  </div>
                )
              })}
            </section>
          ))}

          {/* ── PAGINATION BAR ── */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
              marginTop: 24,
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
        </>
      )}
    </>
  )
}