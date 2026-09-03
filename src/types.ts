/* ══════════════════ SONG NGỮ ══════════════════ */

/**
 * Một đoạn song ngữ. `en` là nguyên văn tiếng Anh trong file .md gốc,
 * `vi` là bản dịch. Thiếu `en` thì chỉ hiện tiếng Việt.
 */
export interface Bi {
  en?: string
  vi: string
}

export const bi = (en: string, vi: string): Bi => ({ en, vi })
export const vi = (v: string): Bi => ({ vi: v })

export type Lang = 'both' | 'vi' | 'en'

/* ══════════════════ LÝ THUYẾT ══════════════════ */

/**
 * Lý thuyết đi từ trên xuống, mỗi tầng trả lời một câu hỏi khác nhau.
 * Đọc theo thứ tự này thì khái niệm dính lại, không rơi ra như định nghĩa rời.
 */
export type TheoryLevel =
  /** Tầng 1 — Vấn đề gì có thật ở đây? Chưa nhắc tới giải pháp. */
  | 'problem'
  /** Tầng 2 — Những cách khác người ta hay nghĩ tới, và vì sao chúng hỏng. */
  | 'alternatives'
  /** Tầng 3 — Ý tưởng cốt lõi, giải thích được cho người ngoài ngành. */
  | 'idea'
  /** Tầng 4 — Cơ chế thật sự chạy thế nào, ở mức nhìn thấy được. */
  | 'mechanism'
  /** Tầng 5 — Chi tiết vận hành, đánh đổi, chỗ dễ sai. */
  | 'detail'

export const LEVEL_LABEL: Record<TheoryLevel, { vi: string; ask: string }> = {
  problem: { vi: 'Vấn đề', ask: 'Chuyện gì đang hỏng nếu không có kỹ thuật này?' },
  alternatives: { vi: 'Vì sao không dùng cách khác', ask: 'Những cách hiển nhiên hơn sai ở đâu?' },
  idea: { vi: 'Ý tưởng cốt lõi', ask: 'Nói một câu thì nó là gì?' },
  mechanism: { vi: 'Cơ chế', ask: 'Máy thật sự làm gì?' },
  detail: { vi: 'Chi tiết và đánh đổi', ask: 'Dùng sai thì hỏng kiểu nào?' },
}

/** So sánh một phương án thay thế với cách đang học */
export interface Alternative {
  name: Bi
  /** Nghe có vẻ hợp lý vì sao */
  appeal: Bi
  /** Nhưng hỏng ở đâu */
  breaks: Bi
}

export interface TheorySection {
  level: TheoryLevel
  heading: Bi
  paras: Bi[]
  alternatives?: Alternative[]
  code?: { lang: string; body: string; caption?: Bi }
  /** Câu hỏi tự kiểm — không có đáp án sẵn, bấm mới hiện */
  checks?: Array<{ q: Bi; a: Bi }>
}

/** Nguồn tra cứu chính thức cho một thuật ngữ */
export interface TermSource {
  /** Tên hiển thị, vd "DuckDB docs" */
  name: string
  url: string
}

/** Thuật ngữ: giữ nguyên tên tiếng Anh, giải nghĩa tiếng Việt */
export interface Term {
  term: string
  /** Đọc là gì trong đầu người Việt */
  gloss: string
  means: Bi
  /** Link tài liệu chính thức để tra sâu hơn */
  source?: TermSource
}

/** Một Term kèm thông tin bài nó xuất hiện — dùng cho trang Vocab */
export interface TermEntry extends Term {
  code: string
  assignmentId: string
}

/* ══════════════════ THỰC HÀNH ══════════════════ */

export type Block =
  | { kind: 'text'; body: Bi }
  | { kind: 'why'; body: Bi }
  | { kind: 'trap'; body: Bi }
  | { kind: 'expect'; body: Bi }
  | { kind: 'code'; lang: string; body: string }
  | { kind: 'glossary'; items: Array<{ term: string; means: Bi }> }

export interface Step {
  title: Bi
  blocks: Block[]
}

export interface TaskSpec {
  id: string
  /** Số thứ tự trong file .md gốc. Bỏ trống với task do trang này thêm vào. */
  num?: number
  title: Bi
  goal: Bi
  steps: Step[]
  accept: Bi[]
}

export interface AssignmentSpec {
  id: string
  code: string
  title: Bi
  summary: Bi
  estHours?: number
  difficulty?: 1 | 2 | 3
  /** Một câu trả lời cho "học xong bài này tôi làm được gì" */
  outcome?: Bi
  theory: TheorySection[]
  terms: Term[]
  tasks: TaskSpec[]
  locked?: boolean
}

/* ══════════════════ TIẾN ĐỘ ══════════════════ */

export type TaskStatus = 'todo' | 'doing' | 'done'
export const STATUS_ORDER: TaskStatus[] = ['todo', 'doing', 'done']
export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'Chưa bắt đầu',
  doing: 'Đang làm',
  done: 'Hoàn thành',
}

export interface TaskProgress {
  status: TaskStatus
  note: string
  images: string[]
  updatedAt?: string
}

export interface AssignmentProgress {
  assignmentId: string
  tasks: Record<string, TaskProgress>
  /** Đã đọc xong tầng lý thuyết nào */
  theoryRead: string[]
}

export const emptyTaskProgress = (): TaskProgress => ({ status: 'todo', note: '', images: [] })
