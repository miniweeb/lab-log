import { assignments } from '../content'
import { readProgress } from '../lib/progress'
import { Progress } from '../components/ui'
import type { Route } from '../App'
import type { TaskStatus } from '../types'

export default function Home({ go }: { go: (r: Route) => void }) {
  let done = 0, doing = 0, total = 0, theoryRead = 0, theoryTotal = 0
  let cur: { code: string; title: string } | null = null

  assignments.forEach((a) => {
    if (a.locked) return
    const p = readProgress(a.id)
    theoryTotal += a.theory.length
    theoryRead += p.theoryRead.length
    a.tasks.forEach((t) => {
      total++
      const s: TaskStatus = p.tasks[t.id]?.status ?? 'todo'
      if (s === 'done') done++
      if (s === 'doing') {
        doing++
        if (!cur) cur = { code: a.code, title: t.title.vi }
      }
    })
  })

  const c = cur as { code: string; title: string } | null

  return (
    <>
      <div className="hero">
        <p className="eyebrow">Đang làm</p>
        <h2>{c ? c.title : 'Chưa có task nào đang chạy'}</h2>
        <p>{c ? `Thuộc bài ${c.code}` : 'Mở ETL Lab, chọn một task và chuyển sang "Đang làm".'}</p>
      </div>

      <div className="card">
        <h3>Tiến độ thực hành</h3>
        <Progress done={done} doing={doing} total={total} />
        <h3 style={{ marginTop: 18 }}>Tiến độ lý thuyết</h3>
        <Progress done={theoryRead} doing={0} total={theoryTotal} />
      </div>

      <div className="tiles">
        <button className="tile" onClick={() => go('etl')}>
          <span className="ico">🧪</span>
          <h3>ETL Lab</h3>
          <p>Lý thuyết năm tầng · thực hành từng task</p>
        </button>
        <button className="tile" onClick={() => go('vocab')}>
          <span className="ico">📖</span>
          <h3>Vocab</h3>
          <p>Thuật ngữ mọi bài · A–Z · link tài liệu gốc</p>
        </button>
        <button className="tile" onClick={() => go('foundations')}>
          <span className="ico">📚</span>
          <h3>Foundations</h3>
          <p>Chủ đề tự học · tự tạo task</p>
        </button>
        <button className="tile" onClick={() => go('reports')}>
          <span className="ico">📮</span>
          <h3>Report</h3>
          <p>Báo cáo hằng ngày qua link Notion</p>
        </button>
        <button className="tile" onClick={() => go('settings')}>
          <span className="ico">⚙️</span>
          <h3>Cài đặt</h3>
          <p>Ngôn ngữ · sao lưu · dọn dẹp</p>
        </button>
      </div>

      <div className="card intro" style={{ marginTop: 14 }}>
        <h3>Cách dùng trang này cho hiệu quả</h3>
        <p>
          Đọc hết năm tầng lý thuyết TRƯỚC khi gõ câu lệnh đầu tiên. Mỗi tầng có phần tự kiểm — trả
          lời trong đầu rồi mới bấm xem đáp án; nếu trả lời không được thì đọc lại tầng đó thay vì
          đi tiếp. Sang thực hành, dán kết quả thật vào từng task, vì con số của chính bạn mới là
          thứ bạn nhớ được.
        </p>
      </div>
    </>
  )
}
