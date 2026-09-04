import type { AssignmentSpec } from '../types'
import { bi } from '../types'
import { a00 } from './a00'
import { a01 } from './a01'
import { a02 } from './a02'
import { a03 } from './a03'
import { a04 } from './a04'
import { a05 } from './a05'
import { a06 } from './a06'
import { a07 } from './a07'

/**
 * MỞ MỘT BÀI MỚI:
 * 1. Viết src/content/aNN.ts theo khuôn của a02.ts (lý thuyết 5 tầng + task song ngữ)
 * 2. import vào đây và thay dòng locked() tương ứng
 */
const locked = (code: string, en: string, viTitle: string, sEn: string, sVi: string): AssignmentSpec => ({
  id: code.toLowerCase(),
  code,
  title: bi(en, viTitle),
  summary: bi(sEn, sVi),
  locked: true,
  theory: [],
  terms: [],
  tasks: [],
})

export const assignments: AssignmentSpec[] = [
  a00,
  a01,
  a02,
  a03,
  a04,
  a05,
  a06,
  a07,
  locked('A08', 'Load strategies', 'Chiến lược nạp dữ liệu',
    'Full versus incremental, and the late-arrival window.',
    'Nạp toàn bộ hay nạp tăng dần, và cửa sổ chờ dữ liệu trễ.'),
  locked('A09', 'Atomic swap', 'Hoán đổi nguyên tử',
    'Replace a table without anyone reading a half-finished state.',
    'Đổi bảng mà không để ai đọc thấy trạng thái nửa vời.'),
  locked('A10', 'Schema evolution', 'Lược đồ thay đổi theo thời gian',
    'Month two arrives and the shape has changed.',
    'Tháng hai về, và cấu trúc dữ liệu đã khác.'),
  locked('A11', 'Backfill', 'Nạp bù quá khứ',
    'Re-run old days after discovering corrupted data.',
    'Chạy lại các ngày cũ khi phát hiện dữ liệu hỏng.'),
  locked('A12', 'Parallelization', 'Xử lý song song',
    'Many processes running, one writer.',
    'Nhiều tiến trình cùng chạy, nhưng chỉ một nơi được ghi.'),
  locked('A13', 'Resource monitoring', 'Giám sát tài nguyên',
    'Measure memory and spill, and know before it dies.',
    'Đo bộ nhớ và lượng tràn ra đĩa, biết trước lúc sắp hỏng.'),
  locked('A14', 'Performance', 'Tối ưu hiệu năng',
    'Find the real bottleneck instead of optimizing by feel.',
    'Tìm nút thắt thật thay vì tối ưu theo cảm giác.'),
  locked('A15', 'dbt project', 'Đóng gói bằng dbt',
    'Package everything into a project you can hand over.',
    'Gói toàn bộ thành một dự án bàn giao được.'),
]

export const findAssignment = (id: string) => assignments.find((a) => a.id === id)
