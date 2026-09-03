import { useRef } from 'react'
import { assignments } from '../content'
import { clearAssignment, exportAll, exportAssignment, importBackup, readProgress } from '../lib/progress'
import { LangSwitch } from '../components/ui'

export default function Settings() {
  const ref = useRef<HTMLInputElement>(null)
  const open = assignments.filter((a) => !a.locked)

  return (
    <>
      <div className="page-head"><h2>Cài đặt</h2></div>

      <div className="card">
        <h3>Ngôn ngữ hiển thị</h3>
        <p className="hint" style={{ marginBottom: 12 }}>
          Chế độ song ngữ đặt nguyên văn tiếng Anh lên trên, bản dịch ngay dưới. Dùng nó khi bạn
          muốn quen dần với thuật ngữ gốc.
        </p>
        <LangSwitch />
      </div>

      <div className="card">
        <h3>Dữ liệu lưu ở đâu</h3>
        <p>
          Mỗi bài một bản ghi riêng trong localStorage của trình duyệt này, theo khoá
          lab-log:progress:aNN. Không tài khoản, không server, không rời khỏi máy bạn.
          Xoá dữ liệu duyệt web là mất — xuất file sao lưu sau mỗi buổi làm.
        </p>
        <div className="actions">
          <button className="btn sm" onClick={exportAll}>Xuất toàn bộ</button>
          <button className="btn ghost sm" onClick={() => ref.current?.click()}>Khôi phục từ file</button>
          <input ref={ref} type="file" accept="application/json" hidden
            onChange={(e) => e.target.files?.[0] && importBackup(e.target.files[0])} />
        </div>
      </div>

      <div className="card">
        <h3>Từng bài</h3>
        {open.map((a) => {
          const p = readProgress(a.id)
          return (
            <div className="row rowline" key={a.id}>
              <span>
                <span className="code-tag">{a.code}</span> {a.title.vi}
                <em className="sub"> · {Object.keys(p.tasks).length} task đã ghi</em>
              </span>
              <span className="actions">
                <button className="btn ghost sm" onClick={() => exportAssignment(a.id)}>Xuất</button>
                <button className="btn ghost sm"
                  onClick={() => { if (confirm(`Xoá kết quả của ${a.code}?`)) clearAssignment(a.id) }}>
                  Xoá
                </button>
              </span>
            </div>
          )
        })}
      </div>

      <div className="card">
        <h3>Giới hạn cần biết</h3>
        <p>
          Ảnh lưu dạng base64 ngay trong localStorage, mà trình duyệt chỉ cho khoảng 5 MB cho cả
          trang — chừng mười tới mười lăm ảnh chụp màn hình. Khi đầy, trang báo lỗi lúc lưu chứ
          không im lặng bỏ qua.
        </p>
      </div>
    </>
  )
}
