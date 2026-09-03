import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Bi, Block, Lang, TaskStatus } from '../types'
import { STATUS_LABEL, STATUS_ORDER } from '../types'
import { setLang, useLang } from '../lib/progress'

/* ══════════ SONG NGỮ ══════════ */

/**
 * Hiện một đoạn theo chế độ ngôn ngữ hiện tại.
 * Chế độ 'both' đặt nguyên văn tiếng Anh lên trên, bản dịch ngay dưới.
 */
export function T({ t, as = 'p' }: { t: Bi; as?: 'p' | 'span' | 'h3' | 'h4' }) {
  const lang = useLang()
  const Tag = as

  if (lang === 'en' && t.en) return <Tag className="t-en solo">{t.en}</Tag>
  if (lang === 'vi' || !t.en) return <Tag className="t-vi solo">{t.vi}</Tag>

  return (
    <span className="t-pair">
      <Tag className="t-en">{t.en}</Tag>
      <Tag className="t-vi">{t.vi}</Tag>
    </span>
  )
}

/** Lấy chuỗi thuần, dùng cho chỗ không đặt được thẻ (tiêu đề nút, aria-label) */
export function useText() {
  const lang = useLang()
  return (t: Bi) => (lang === 'en' && t.en ? t.en : t.vi)
}

export function LangSwitch() {
  const lang = useLang()
  const opts: Array<{ id: Lang; label: string }> = [
    { id: 'vi', label: 'Việt' },
    { id: 'both', label: 'Song ngữ' },
    { id: 'en', label: 'English' },
  ]
  return (
    <div className="langswitch" role="group" aria-label="Ngôn ngữ hiển thị">
      {opts.map((o) => (
        <button key={o.id} aria-pressed={lang === o.id} onClick={() => setLang(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ══════════ TRẠNG THÁI ══════════ */

export function StatusChip({ s }: { s: TaskStatus }) {
  return <span className={`chip ${s}`}>{STATUS_LABEL[s]}</span>
}

export function StatusPicker({
  value,
  onChange,
}: {
  value: TaskStatus
  onChange: (s: TaskStatus) => void
}) {
  return (
    <div className="statuspick" role="group" aria-label="Trạng thái task">
      {STATUS_ORDER.map((s, i) => (
        <button key={s} className={`sp ${s}`} aria-pressed={value === s} onClick={() => onChange(s)}>
          {i > 0 && <span className="arrow">→</span>}
          {STATUS_LABEL[s]}
        </button>
      ))}
    </div>
  )
}

export function Progress({ done, doing, total }: { done: number; doing: number; total: number }) {
  const d = total ? (done / total) * 100 : 0
  const w = total ? (doing / total) * 100 : 0
  return (
    <>
      <div className="bar">
        <i className="seg-done" style={{ width: `${d}%` }} />
        <i className="seg-doing" style={{ width: `${w}%` }} />
      </div>
      <span className="bar-label">
        {done}/{total} hoàn thành{doing ? ` · ${doing} đang làm` : ''}
      </span>
    </>
  )
}

/* ══════════ CODE ══════════ */

export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      alert('Trình duyệt chặn thao tác chép. Bôi đen rồi Ctrl+C.')
    }
  }
  return (
    <div className="codewrap">
      <div className="codebar">
        <span>{lang ?? 'text'}</span>
        <button onClick={copy}>{copied ? 'Đã chép' : 'Chép'}</button>
      </div>
      <pre className="code">{code}</pre>
    </div>
  )
}

/* ══════════ KHỐI NỘI DUNG ══════════ */

const CALLOUT: Record<string, string> = { why: 'Vì sao', trap: 'Bẫy', expect: 'Kết quả mong đợi' }

export function BlockView({ b }: { b: Block }) {
  switch (b.kind) {
    case 'text':
      return (
        <div className="b-text">
          <T t={b.body} />
        </div>
      )
    case 'why':
    case 'trap':
    case 'expect':
      return (
        <div className={`callout ${b.kind}`}>
          <b>{CALLOUT[b.kind]}</b>
          <T t={b.body} />
        </div>
      )
    case 'code':
      return <CodeBlock code={b.body} lang={b.lang} />
    case 'glossary':
      return (
        <dl className="glossary">
          {b.items.map((it) => (
            <div key={it.term}>
              <dt>{it.term}</dt>
              <dd>
                <T t={it.means} />
              </dd>
            </div>
          ))}
        </dl>
      )
  }
}

export function Empty({ ico, children }: { ico: string; children: ReactNode }) {
  return (
    <div className="empty">
      <span className="ico">{ico}</span>
      {children}
    </div>
  )
}
