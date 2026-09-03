import { useState } from 'react'
import { assignments, findAssignment } from '../content'
import { counts, useProgress } from '../lib/progress'
import { Empty, Progress, StatusChip, T } from '../components/ui'
import TheoryView from '../components/TheoryView'
import TaskDetail, { taskLabel } from '../components/TaskDetail'
import type { AssignmentSpec } from '../types'

type Tab = 'theory' | 'practice'

function Card({ a, onOpen }: { a: AssignmentSpec; onOpen: () => void }) {
  const p = useProgress(a.id)
  const done = a.tasks.filter((t) => p.tasks[t.id]?.status === 'done').length
  const doing = a.tasks.filter((t) => p.tasks[t.id]?.status === 'doing').length
  const theoryDone = a.theory.length > 0 && p.theoryRead.length === a.theory.length

  return (
    <button className={`card clickable asg ${a.locked ? 'locked' : ''}`} onClick={onOpen}>
      <div className="row">
        <div className="asg-main">
          <h3>
            <span className="code-tag">{a.code}</span> <T t={a.title} as="span" />
          </h3>
          <T t={a.summary} />
        </div>
        {a.locked ? (
          <span className="chip todo">Chưa mở</span>
        ) : (
          <span className="chip code">
            {done}/{a.tasks.length}
          </span>
        )}
      </div>
      {!a.locked && (
        <>
          <div className="asg-flags">
            <span className={theoryDone ? 'flag on' : 'flag'}>
              {theoryDone ? '✓' : '○'} Lý thuyết {p.theoryRead.length}/{a.theory.length}
            </span>
            <span className="flag">🧪 {a.tasks.length} task</span>
          </div>
          <Progress done={done} doing={doing} total={a.tasks.length} />
        </>
      )}
    </button>
  )
}

function View({ a, onBack }: { a: AssignmentSpec; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('theory')
  const [taskId, setTaskId] = useState<string | null>(null)
  const p = useProgress(a.id)

  const idx = a.tasks.findIndex((t) => t.id === taskId)
  const task = idx >= 0 ? a.tasks[idx] : null

  if (task) {
    return (
      <TaskDetail
        asg={a}
        task={task}
        onBack={() => setTaskId(null)}
        onNext={idx < a.tasks.length - 1 ? () => setTaskId(a.tasks[idx + 1].id) : undefined}
      />
    )
  }

  const c = counts(a.id, a.tasks.map((t) => t.id))
  const theoryDone = a.theory.length > 0 && p.theoryRead.length === a.theory.length

  return (
    <>
      <div className="page-head">
        <button className="back" onClick={onBack}>
          ← ETL Lab
        </button>
        <div className="head-title">
          <span className="code-tag">{a.code}</span>
          <T t={a.title} as="h3" />
        </div>
      </div>

      {a.locked ? (
        <Empty ico="📄">
          Bài này chưa có nội dung. Gửi file .md của bài để dựng thành lý thuyết năm tầng và các
          task song ngữ, nội dung sẽ nằm trong <code>src/content/{a.id}.ts</code>
        </Empty>
      ) : (
        <>
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={tab === 'theory'} onClick={() => setTab('theory')}>
              1 · Lý thuyết
              {theoryDone && <span className="tick">✓</span>}
            </button>
            <button role="tab" aria-selected={tab === 'practice'} onClick={() => setTab('practice')}>
              2 · Thực hành
              <span className="tick dim">
                {c.done}/{a.tasks.length}
              </span>
            </button>
          </div>

          {tab === 'theory' && (
            <>
              <TheoryView a={a} />
              <div className="navrow">
                <span className="hint">
                  {theoryDone
                    ? 'Đã nắm hết. Sang phần thực hành.'
                    : `Còn ${a.theory.length - p.theoryRead.length} tầng chưa đánh dấu.`}
                </span>
                <button className="btn" onClick={() => setTab('practice')}>
                  Sang thực hành →
                </button>
              </div>
            </>
          )}

          {tab === 'practice' && (
            <>
              <div className="card">
                <T t={a.summary} />
                <div className="meta-row">
                  {a.estHours && <span>~{a.estHours} giờ</span>}
                  {a.difficulty && (
                    <span>
                      {'★'.repeat(a.difficulty)}
                      {'☆'.repeat(3 - a.difficulty)}
                    </span>
                  )}
                </div>
                <Progress done={c.done} doing={c.doing} total={a.tasks.length} />
              </div>

              {a.tasks.map((t) => {
                const st = p.tasks[t.id]
                const hasResult = Boolean(st?.note || st?.images.length)
                return (
                  <button className="card clickable" key={t.id} onClick={() => setTaskId(t.id)}>
                    <div className="row">
                      <div className="asg-main">
                        <h3>
                          {taskLabel(t) && <span className="code-tag">{taskLabel(t)}</span>}{' '}
                          <T t={t.title} as="span" />
                        </h3>
                        <T t={t.goal} />
                        <p className="sub">
                          {t.steps.length} bước · {t.accept.length} điều kiện
                          {hasResult ? ' · đã ghi kết quả' : ''}
                        </p>
                      </div>
                      <StatusChip s={st?.status ?? 'todo'} />
                    </div>
                  </button>
                )
              })}
            </>
          )}
        </>
      )}
    </>
  )
}

export default function EtlLab() {
  const [id, setId] = useState<string | null>(null)
  const a = id ? findAssignment(id) : null

  if (a) return <View a={a} onBack={() => setId(null)} />

  return (
    <>
      <div className="page-head">
        <h2>ETL Lab</h2>
      </div>
      <div className="card intro">
        <p>
          Mười sáu bài, từ thư mục CSV thô tới một warehouse chạy trên máy cá nhân. Mỗi bài có hai
          phần: <b>lý thuyết</b> đi từ vấn đề xuống cơ chế, rồi <b>thực hành</b> từng task có chỗ
          dán kết quả.
        </p>
      </div>
      {assignments.map((x) => (
        <Card key={x.id} a={x} onOpen={() => setId(x.id)} />
      ))}
    </>
  )
}
