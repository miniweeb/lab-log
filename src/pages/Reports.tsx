import { useEffect, useState } from 'react'
import { Empty } from '../components/ui'

interface Report { id: string; date: string; title: string; url: string; note: string }

const KEY = 'lab-log:reports'
const uid = () => Math.random().toString(36).slice(2, 10)
const today = () => new Date().toISOString().slice(0, 10)

function read(): Report[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Report[]
  } catch { /* bỏ qua bản ghi hỏng */ }
  return []
}

export default function Reports() {
  const [items, setItems] = useState<Report[]>(read)
  const [form, setForm] = useState({ date: today(), title: '', url: '', note: '' })
  const [err, setErr] = useState('')

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)) }, [items])

  const add = () => {
    const url = form.url.trim()
    if (!url) return setErr('Cần dán link Notion trước khi lưu.')
    if (!/^https?:\/\//i.test(url)) return setErr('Link phải bắt đầu bằng http:// hoặc https://')
    setErr('')
    setItems((xs) => [{ id: uid(), ...form, url, title: form.title.trim() || `Báo cáo ${form.date}` }, ...xs]
      .sort((a, b) => b.date.localeCompare(a.date)))
    setForm({ date: today(), title: '', url: '', note: '' })
  }

  return (
    <>
      <div className="page-head"><h2>Report</h2></div>
      <div className="card">
        <h3>Thêm báo cáo</h3>
        <p className="hint" style={{ marginBottom: 14 }}>
          Dán link trang Notion kèm một dòng tóm tắt để mentor biết nên mở cái nào.
        </p>
        <div className="grid2">
          <label className="fld"><span>Ngày</span>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
          <label className="fld"><span>Tiêu đề</span>
            <input type="text" value={form.title} placeholder="A02 task 1–3"
              onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        </div>
        <label className="fld"><span>Link Notion</span>
          <input type="url" value={form.url} placeholder="https://www.notion.so/..."
            onChange={(e) => setForm({ ...form, url: e.target.value })} /></label>
        <label className="fld"><span>Tóm tắt</span>
          <input type="text" value={form.note} placeholder="Làm được gì, đang kẹt ở đâu"
            onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
        {err && <p className="warn">{err}</p>}
        <button className="btn" onClick={add}>Lưu báo cáo</button>
      </div>

      {items.length === 0 ? <Empty ico="🗒️">Chưa có báo cáo nào.</Empty> : items.map((r) => (
        <div className="card" key={r.id}>
          <div className="row">
            <div className="asg-main">
              <h3><span className="code-tag">{r.date}</span> {r.title}</h3>
              {r.note && <p>{r.note}</p>}
              <a href={r.url} target="_blank" rel="noreferrer">Mở trên Notion ↗</a>
            </div>
            <button className="btn ghost sm"
              onClick={() => setItems((xs) => xs.filter((x) => x.id !== r.id))}>Xoá</button>
          </div>
        </div>
      ))}
    </>
  )
}
