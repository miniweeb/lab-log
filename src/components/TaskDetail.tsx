import { useEffect, useRef, useState } from 'react'
import type { AssignmentSpec, TaskSpec } from '../types'
import { BlockView, StatusPicker, T } from './ui'
import { fileToDataUrl, useTaskProgress } from '../lib/progress'

export const taskLabel = (t: TaskSpec) => (t.num ? `Task ${t.num}` : null)

export default function TaskDetail({
  asg,
  task,
  onBack,
  onNext,
}: {
  asg: AssignmentSpec
  task: TaskSpec
  onBack: () => void
  onNext?: () => void
}) {
  const [prog, update] = useTaskProgress(asg.id, task.id)
  const [note, setNote] = useState(prog.note)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => setNote(prog.note), [task.id])

  const saveNote = () => {
    update({ note })
    setSaved(true)
    setTimeout(() => setSaved(false), 1600)
  }

  const addImages = async (files: FileList | null) => {
    if (!files?.length) return
    const urls = await Promise.all(Array.from(files).map(fileToDataUrl))
    update({ images: [...prog.images, ...urls] })
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <>
      <div className="page-head">
        <button className="back" onClick={onBack}>
          ← {asg.code}
        </button>
        <div className="head-title">
          {taskLabel(task) && <span className="code-tag">{taskLabel(task)}</span>}
          <T t={task.title} as="h3" />
        </div>
      </div>

      <div className="card goal">
        <div className="goalline">
          <b>Mục tiêu</b>
          <T t={task.goal} />
        </div>
        <StatusPicker value={prog.status} onChange={(status) => update({ status })} />
      </div>

      {task.steps.map((s, i) => (
        <section className="stepcard" key={i}>
          <header>
            <span className="step-n">{i + 1}</span>
            <T t={s.title} as="h3" />
          </header>
          <div className="step-blocks">
            {s.blocks.map((b, k) => (
              <BlockView b={b} key={k} />
            ))}
          </div>
        </section>
      ))}

      {task.accept.length > 0 && (
        <div className="card accept">
          <h3>Điều kiện hoàn thành</h3>
          <ul>
            {task.accept.map((x, i) => (
              <li key={i}>
                <T t={x} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="result">
        <h3>Kết quả của tôi</h3>
        <p className="hint">
          Dán output terminal, số liệu đối chiếu, hoặc mô tả lỗi đã gặp. Lưu riêng cho task này.
        </p>
        <textarea
          value={note}
          placeholder={'Ví dụ:\n45 files, 15.7 GB\nĐếm được 1.180.490 dòng, khớp manifest.'}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="actions">
          <button className="btn sm" onClick={saveNote}>
            {saved ? 'Đã lưu' : 'Lưu ghi chú'}
          </button>
          <button className="btn ghost sm" onClick={() => fileRef.current?.click()}>
            Đính kèm ảnh
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => addImages(e.target.files)}
          />
          {prog.updatedAt && (
            <span className="stamp">
              Cập nhật {new Date(prog.updatedAt).toLocaleString('vi-VN')}
            </span>
          )}
        </div>

        {prog.images.length > 0 && (
          <div className="shots">
            {prog.images.map((src, i) => (
              <div className="shot" key={i}>
                <a href={src} target="_blank" rel="noreferrer">
                  <img src={src} alt={`Ảnh kết quả ${i + 1}`} />
                </a>
                <button
                  onClick={() => update({ images: prog.images.filter((_, k) => k !== i) })}
                  aria-label="Xoá ảnh"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="navrow">
        <button className="btn ghost" onClick={onBack}>
          ← Về danh sách task
        </button>
        {onNext && (
          <button className="btn" onClick={onNext}>
            Task tiếp theo →
          </button>
        )}
      </div>
    </>
  )
}
