import { useState } from 'react'
import type { AssignmentSpec, TheorySection } from '../types'
import { LEVEL_LABEL } from '../types'
import { BlockView, CodeBlock, T } from './ui'
import { toggleTheoryRead, useProgress } from '../lib/progress'

/**
 * Lý thuyết hiện theo tầng, mỗi tầng mở được thu được.
 * Tầng đầu mở sẵn để không ai phải bấm mới bắt đầu đọc.
 */
function Section({
  s,
  index,
  read,
  onToggleRead,
}: {
  s: TheorySection
  index: number
  read: boolean
  onToggleRead: () => void
}) {
  const [open, setOpen] = useState(index === 0)
  const [shown, setShown] = useState<number[]>([])
  const meta = LEVEL_LABEL[s.level]

  return (
    <section className={`layer ${open ? 'open' : ''} ${read ? 'read' : ''}`}>
      <button className="layer-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="layer-n">{index + 1}</span>
        <span className="layer-title">
          <span className="layer-kind">{meta.vi}</span>
          <T t={s.heading} as="span" />
          <span className="layer-ask">{meta.ask}</span>
        </span>
        <span className="layer-caret">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="layer-body">
          {s.paras.map((p, i) => (
            <div className="b-text" key={i}>
              <T t={p} />
            </div>
          ))}

          {s.alternatives && (
            <div className="alts">
              {s.alternatives.map((a, i) => (
                <div className="alt" key={i}>
                  <h4>
                    <T t={a.name} as="span" />
                  </h4>
                  <div className="alt-row appeal">
                    <b>Nghe hợp lý vì</b>
                    <T t={a.appeal} />
                  </div>
                  <div className="alt-row breaks">
                    <b>Nhưng hỏng ở</b>
                    <T t={a.breaks} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {s.code && (
            <>
              <CodeBlock code={s.code.body} lang={s.code.lang} />
              {s.code.caption && (
                <div className="caption">
                  <T t={s.code.caption} />
                </div>
              )}
            </>
          )}

          {s.checks && (
            <div className="checks">
              <h4>Tự kiểm</h4>
              {s.checks.map((c, i) => (
                <div className="check" key={i}>
                  <div className="q">
                    <T t={c.q} />
                  </div>
                  {shown.includes(i) ? (
                    <div className="a">
                      <T t={c.a} />
                    </div>
                  ) : (
                    <button className="btn ghost sm" onClick={() => setShown((x) => [...x, i])}>
                      Xem đáp án
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <button className={`readmark ${read ? 'on' : ''}`} onClick={onToggleRead}>
            {read ? '✓ Đã nắm tầng này' : 'Đánh dấu đã nắm'}
          </button>
        </div>
      )}
    </section>
  )
}

export default function TheoryView({ a }: { a: AssignmentSpec }) {
  const p = useProgress(a.id)

  return (
    <>
      {a.outcome && (
        <div className="outcome">
          <b>Học xong bài này bạn làm được gì</b>
          <T t={a.outcome} />
        </div>
      )}

      <p className="lead">
        Lý thuyết đi từ trên xuống: vấn đề trước, giải pháp sau. Đọc theo thứ tự thì khái niệm dính
        lại với nhau, thay vì rơi ra thành những định nghĩa rời.
      </p>

      {a.theory.map((s, i) => (
        <Section
          key={s.level}
          s={s}
          index={i}
          read={p.theoryRead.includes(s.level)}
          onToggleRead={() => toggleTheoryRead(a.id, s.level)}
        />
      ))}

      {a.terms.length > 0 && (
        <div className="card termcard">
          <h3>Bảng thuật ngữ</h3>
          <p className="hint">
            Giữ nguyên tên tiếng Anh vì đó là từ bạn sẽ gặp trong tài liệu và khi trao đổi với đồng
            nghiệp.
          </p>
          <dl className="glossary big">
            {a.terms.map((t) => (
              <div key={t.term}>
                <dt>
                  {t.term} <em>{t.gloss}</em>
                </dt>
                <dd>
                  <T t={t.means} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </>
  )
}

export { BlockView }
