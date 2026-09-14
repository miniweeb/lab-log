import type { TheorySection, Term } from '../types'
import { bi } from '../types'

export const a11Theory: TheorySection[] = [
  /* ─────────── TẦNG 1 ─────────── */
  {
    level: 'problem',
    heading: bi(
      'Sooner or later you have to run the last three months again',
      'Sớm muộn gì bạn cũng phải chạy lại ba tháng vừa rồi',
    ),
    paras: [
      bi(
        'A bug was found. Or the schema changed and old dates need the new columns. Or the pipeline was down for a week and nobody noticed. Every data team ends up reprocessing history, and that job has a name: backfill.',
        'Có người tìm ra một lỗi. Hoặc schema đã đổi và các ngày cũ cần có thêm cột mới. Hoặc pipeline chết cả tuần mà không ai để ý. Đội dữ liệu nào rồi cũng có lúc phải xử lý lại phần lịch sử, và công việc đó có tên riêng là backfill.',
      ),
      bi(
        'It is where pipelines go to die, for one reason: old files hold surprises that yesterday\'s file never showed you. Your daily job has run 68 times without complaint because it only ever met 68 well-formed files. Replay 69 days and you meet the one that is not.',
        'Đây cũng là chỗ pipeline hay chết, và lý do thì chỉ có một: mấy file cũ chứa những bất ngờ mà file hôm qua chưa từng cho bạn thấy. Cái job chạy hằng ngày của bạn đã chạy 68 lần mà không kêu ca gì, đơn giản vì nó mới chỉ gặp 68 file đúng khuôn. Tới khi chạy lại đủ 69 ngày thì bạn gặp cái file thứ 69.',
      ),
      bi(
        'Three words get mixed up constantly. An INCREMENTAL LOAD processes only the newest slice — yesterday\'s file, normal daily operation, cheap. A BACKFILL runs that same pipeline over a range of past dates, to fill a gap. A RESTATEMENT is a backfill that changes numbers people have already seen, because the logic or the source data changed.',
        'Có ba từ rất hay bị dùng lẫn với nhau. Incremental load là xử lý phần mới nhất, tức file của hôm qua, việc chạy hằng ngày bình thường và rẻ. Backfill là chạy chính pipeline đó trên một dải ngày trong quá khứ để lấp một khoảng trống. Còn restatement là một lần backfill làm thay đổi những con số mà người ta đã nhìn thấy rồi, vì logic hoặc dữ liệu nguồn đã đổi.',
      ),
      bi(
        'Backfill and restatement are technically identical — same code, same dates, same output. They differ socially: consumers must be warned before their dashboards move. That distinction is not pedantry, it is the difference between an engineer doing maintenance and an engineer surprising the finance team.',
        'Về mặt kỹ thuật thì backfill và restatement giống hệt nhau: cùng code, cùng dải ngày, cùng kết quả. Chúng chỉ khác nhau ở phía con người, vì người dùng phải được báo trước khi dashboard của họ đổi số. Phân biệt như vậy không phải chẻ chữ đâu, đó là khác biệt giữa một kỹ sư đang bảo trì hệ thống và một kỹ sư làm đội tài chính giật mình.',
      ),
    ],
    checks: [
      {
        q: bi(
          'You rerun 69 days with no code change and no source change. Is that a restatement?',
          'Bạn chạy lại 69 ngày mà không đổi code, cũng không đổi dữ liệu nguồn. Vậy đó có phải một lần restatement không?',
        ),
        a: bi(
          'No — if your pipeline is idempotent, the numbers do not move, so nobody needs warning. That is exactly why A07\'s work matters today: idempotency is what turns a replay from an announcement into a non-event.',
          'Không. Nếu pipeline của bạn idempotent thì các con số không nhúc nhích, nên chẳng ai cần được báo cả. Đó chính là lý do công sức bạn bỏ ra ở A07 có giá trị vào hôm nay: tính idempotent biến một lần chạy lại từ chỗ phải đi thông báo thành một chuyện chẳng có gì.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 2 ─────────── */
  {
    level: 'alternatives',
    heading: bi(
      'Four ways to replay history, three of which cost you later',
      'Bốn cách chạy lại lịch sử, và ba trong số đó bắt bạn trả giá về sau',
    ),
    paras: [
      bi(
        'The choice here is not about speed. It is about how many copies of your logic exist afterwards, and whether a crash on day 40 costs you 40 days of work.',
        'Lựa chọn ở đây không phải chuyện nhanh hay chậm. Nó là chuyện sau đó logic của bạn tồn tại bao nhiêu bản, và một lần chết ở ngày thứ 40 có làm bạn mất trắng 40 ngày công hay không.',
      ),
    ],
    alternatives: [
      {
        name: bi('Write a separate backfill script', 'Viết một script backfill riêng'),
        appeal: bi(
          'It feels like the right tool for the job. A backfill reads many files at once, so a bulk query over a glob is obviously faster than 69 sequential day loads.',
          'Nghe như đúng công cụ cho đúng việc. Backfill thì đọc nhiều file một lúc, nên một câu query gộp trên cả thư mục rõ ràng nhanh hơn việc nạp tuần tự 69 ngày.',
        ),
        breaks: bi(
          'Now you have two pipelines, and they drift. Fix a cleaning rule in the daily one and the backfill keeps the old rule; six months later a rebuilt month does not match the month next to it, and nobody can say which is right. If you catch yourself writing a "backfill version" of your logic, stop.',
          'Nhưng giờ bạn có hai pipeline, và chúng sẽ trôi khỏi nhau. Sửa một quy tắc làm sạch ở cái chạy hằng ngày thì cái backfill vẫn giữ quy tắc cũ; sáu tháng sau, một tháng vừa dựng lại không khớp với tháng nằm ngay cạnh nó, mà không ai nói được bên nào đúng. Nếu bạn thấy mình đang viết một bản backfill cho phần logic vốn đã có, hãy dừng lại.',
        ),
      },
      {
        name: bi('Drop everything and rebuild from scratch', 'Xoá sạch rồi dựng lại từ đầu'),
        appeal: bi(
          'The simplest mental model there is: no partial state, no resume logic, no ledger to consult. Truncate the table, loop, done.',
          'Đây là mô hình đơn giản nhất có thể nghĩ ra: không có trạng thái dở dang, không cần logic chạy tiếp, không phải tra cuốn sổ nào. Xoá bảng, chạy vòng lặp, xong.',
        ),
        breaks: bi(
          'It works until it does not finish. Crash at day 40 of 69 and you have an empty-ish table and 40 days of machine time gone. At full scale that is an evening. And during the rebuild your readers see a half-empty table, which A09 spent a whole assignment teaching you to avoid.',
          'Nó chạy tốt cho tới khi nó không chạy hết. Chết ở ngày 40 trên 69 thì bạn còn lại một cái bảng gần như rỗng và mất luôn 40 ngày máy chạy. Ở scale full thì đó là cả một buổi tối. Chưa kể trong lúc dựng lại, người đọc nhìn thấy một cái bảng vơi đi một nửa, đúng thứ mà cả bài A09 dạy bạn cách tránh.',
        ),
      },
      {
        name: bi('Hand-fix the bad file, then replay', 'Sửa tay file hỏng rồi mới chạy lại'),
        appeal: bi(
          'One file has 151 broken lines out of 58,551. Open it, delete the bad lines, and the whole backfill goes green in one pass. Fifteen minutes of work saves an hour of engineering.',
          'Có đúng một file với 151 dòng hỏng trên tổng số 58.551 dòng. Mở ra, xoá mấy dòng hỏng đi, thế là cả lần backfill xanh hết trong một lượt. Mười lăm phút làm tay đổi lấy một giờ kỹ thuật.',
        ),
        breaks: bi(
          'Raw data is immutable evidence. Edit it and you have destroyed the only proof that the producer shipped a broken export — and your pipeline still cannot survive the next broken file, because you fixed the file instead of the pipeline. Also the generator would simply recreate it.',
          'Nhưng dữ liệu thô là bằng chứng bất biến. Sửa nó là bạn phá mất chứng cứ duy nhất cho việc bên cung cấp đã giao một bản export hỏng. Mà pipeline của bạn thì vẫn không sống nổi qua file hỏng tiếp theo, vì bạn sửa cái file chứ có sửa cái pipeline đâu. Với lại generator rồi cũng tạo lại đúng file đó thôi.',
        ),
      },
      {
        name: bi('A thin runner around the per-day pipeline', 'Một runner mỏng bọc quanh pipeline theo ngày'),
        appeal: bi(
          'One loop that reads ops.etl_runs to decide what still needs doing, calls your existing load_day, records the outcome, and keeps going when a day fails. No second copy of the logic. A crash at day 40 costs you day 40.',
          'Chỉ là một vòng lặp: nó đọc bảng ops.etl_runs để quyết xem còn ngày nào phải làm, gọi hàm load_day sẵn có, ghi lại kết quả, và một ngày hỏng thì vẫn chạy tiếp. Không có bản sao thứ hai nào của logic. Chết ở ngày thứ 40 thì bạn chỉ mất đúng ngày 40.',
        ),
        breaks: bi(
          'It is sequential, so it is slow — the machine sits far from saturated for 30 to 90 minutes at full scale. That is a real cost and you will measure it today. It is also the number A12 exists to beat.',
          'Đổi lại nó chạy tuần tự nên chậm: ở scale full, máy nằm đó chưa đầy tải trong khoảng 30 tới 90 phút. Đó là một cái giá có thật và hôm nay bạn sẽ tự đo nó. Cũng chính là con số mà A12 sinh ra để đánh bại.',
        ),
      },
    ],
    checks: [
      {
        q: bi(
          'What property of your A07 pipeline makes the runner safe to rerun at all?',
          'Tính chất nào của pipeline từ A07 làm cho việc chạy lại runner trở nên an toàn?',
        ),
        a: bi(
          'Idempotency. Each day does DELETE that date, then INSERT, inside one transaction — so running a date twice leaves exactly the same rows as running it once, and a crash mid-day leaves nothing behind. Without that, resume logic would be guesswork.',
          'Là tính idempotent. Mỗi ngày, pipeline xoá đúng ngày đó rồi insert lại, và cả hai nằm trong một transaction. Nhờ vậy chạy một ngày hai lần cũng cho ra đúng số dòng như chạy một lần, còn chết giữa chừng thì không để lại gì. Không có tính chất đó thì phần logic chạy tiếp chỉ là đoán mò.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 3 ─────────── */
  {
    level: 'idea',
    heading: bi(
      'A backfill is not a special script — it is a loop with a memory',
      'Backfill không phải một script đặc biệt, nó là một vòng lặp có trí nhớ',
    ),
    paras: [
      bi(
        'The whole assignment in one sentence: your normal per-day pipeline, replayed over many dates, driven by a runner that reads the ledger to decide what still needs doing.',
        'Cả bài này gói gọn trong một câu: vẫn là pipeline theo ngày bình thường của bạn, chạy lại trên nhiều ngày, do một runner điều khiển, và runner thì đọc cuốn sổ ghi các lần chạy để quyết xem còn việc gì phải làm.',
      ),
      bi(
        'A good runner does four things. It PLANS before it acts, so you see "these 69 dates will run" before anything moves. It REMEMBERS, by reading ops.etl_runs, so a crash at day 40 never means restarting from day 1. It CONTINUES ON ERROR, because the 69 days are independent jobs and one bad day should not kill the other 68 — but the failure must be loud in the end-of-run summary, never swallowed. And it ESTIMATES COST: rows per second times rows remaining is how you answer "how long will this take" before launching.',
        'Một runner tốt làm bốn việc. Thứ nhất, nó lập kế hoạch trước khi hành động, để bạn nhìn thấy dòng chữ 69 ngày này sẽ chạy trước khi có gì đó động đậy. Thứ hai, nó nhớ, bằng cách đọc bảng ops.etl_runs, nhờ vậy chết ở ngày 40 không bao giờ có nghĩa là phải làm lại từ ngày 1. Thứ ba, gặp lỗi thì nó vẫn chạy tiếp, vì 69 ngày là 69 job độc lập và một ngày hỏng không được phép giết 68 ngày còn lại; nhưng cái hỏng đó phải hiện thật rõ trong bảng tổng kết cuối lần chạy, tuyệt đối không được nuốt đi. Thứ tư, nó ước lượng chi phí: lấy số dòng mỗi giây nhân với số dòng còn lại, đó là cách bạn trả lời câu chạy bao lâu trước khi bấm nút.',
      ),
      bi(
        'The second half of the assignment is what happens when a day genuinely fails. The loop is: diagnose, contain, document, resume. You do not start over, you do not hand-fix the source, and you do not swallow the error. That loop is the actual skill — the runner is just the thing that makes practising it possible.',
        'Nửa sau của bài là chuyện xảy ra khi có một ngày hỏng thật. Vòng xử lý gồm bốn bước: chẩn đoán, khoanh vùng, ghi lại, rồi chạy tiếp. Bạn không làm lại từ đầu, không sửa tay dữ liệu nguồn, và không nuốt lỗi. Chính cái vòng đó mới là kỹ năng thật sự; runner chỉ là thứ tạo cơ hội cho bạn tập nó.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Why does the runner print a plan and stop, instead of just running?',
          'Vì sao runner lại in ra kế hoạch rồi dừng, thay vì cứ thế chạy luôn?',
        ),
        a: bi(
          'Because a backfill touches weeks of data and you cannot un-touch it. The dry run is where you notice that your date range is off by a month, or that 69 dates will run when you expected 7. It costs two seconds and it is the only cheap moment in the whole operation.',
          'Vì backfill đụng vào dữ liệu của hàng tuần liền, mà đã đụng rồi thì không rút lại được. Lần chạy thử chính là lúc bạn nhận ra dải ngày của mình lệch mất một tháng, hoặc 69 ngày sắp chạy trong khi bạn tưởng chỉ có 7. Nó tốn hai giây và là khoảnh khắc rẻ duy nhất trong cả thao tác này.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 4 ─────────── */
  {
    level: 'mechanism',
    heading: bi(
      'How the runner remembers, and how a broken file is contained',
      'Runner nhớ bằng cách nào, và một file hỏng được khoanh vùng ra sao',
    ),
    paras: [
      bi(
        'Memory is one query: for each date, read the latest status from ops.etl_runs. Default mode skips dates whose latest status is success and runs everything else. The --only-failed flag runs exactly the dates whose latest status is failed. The --force flag runs every date regardless — that is a restatement, and the flag name should feel heavier than the other two.',
        'Trí nhớ ở đây chỉ là một câu query: với mỗi ngày, đọc trạng thái mới nhất trong bảng ops.etl_runs. Chế độ mặc định bỏ qua những ngày có trạng thái mới nhất là success và chạy tất cả phần còn lại. Cờ --only-failed thì chạy đúng những ngày có trạng thái mới nhất là failed. Còn cờ --force chạy mọi ngày bất kể trạng thái, và đó là một lần restatement, nên cái tên cờ đó phải cho bạn cảm giác nặng hơn hai cờ kia.',
      ),
      bi(
        'One state is worth knowing before you meet it: kill the runner mid-day with Ctrl-C and that day\'s ledger row stays at running. Default resume picks it up, because anything not green runs again. --only-failed does not, because it selects exactly the status its name says.',
        'Có một trạng thái bạn nên biết trước khi gặp: nếu bấm Ctrl-C giết runner giữa chừng thì dòng ledger của ngày đó nằm lại ở trạng thái running. Chế độ mặc định sẽ nhặt nó lên, vì hễ chưa xanh là chạy lại. Còn --only-failed thì không, bởi nó chỉ chọn đúng cái trạng thái mà tên của nó nói ra.',
      ),
      bi(
        'Preflight runs before EVERY day, not once at startup. Each date brings its own source file and manifest to check, and disks fill and locks appear mid-backfill, not before it. The point is when it fails: a permission or disk problem caught at hour 0 costs nothing, while the same problem discovered at row 40 million costs you the evening. And because a failed preflight is recorded in the ledger like any other failure, --only-failed picks that day up as soon as you fix whatever the FAIL line named.',
        'Preflight phải chạy trước MỖI ngày chứ không phải một lần lúc khởi động. Mỗi ngày mang theo file nguồn và manifest riêng cần kiểm, mà chuyện đĩa đầy hay file bị khoá thì xuất hiện giữa lúc backfill đang chạy chứ đâu chờ tới trước khi bắt đầu. Điểm mấu chốt nằm ở chỗ nó hỏng vào lúc nào: một vấn đề về quyền hay dung lượng bị bắt ngay giờ thứ 0 thì chẳng tốn gì, còn đúng vấn đề đó mà phát hiện ở dòng thứ 40 triệu thì bạn mất cả buổi tối. Và vì preflight hỏng cũng được ghi vào ledger như mọi kiểu hỏng khác, nên --only-failed sẽ nhặt ngày đó lên ngay khi bạn sửa xong thứ mà dòng FAIL gọi tên.',
      ),
      bi(
        'For the broken file, the tool is store_rejects=true: parse what is parseable, and file the rest as evidence in a reject table. Two behaviours to know. Rejects only appear on a MATERIALIZING scan — a bare count(*) is optimized past parsing and leaves the reject table empty, so use CREATE TABLE … AS. And a truncated line yields one reject record per missing column, so 151 bad lines show up as roughly 1,651 records. Always count DISTINCT line.',
        'Với cái file hỏng thì công cụ là tham số store_rejects=true: parse được dòng nào thì parse, phần còn lại đưa vào một bảng reject để làm bằng chứng. Có hai hành vi bạn cần biết. Một là các dòng bị loại chỉ xuất hiện khi phép quét có vật chất hoá kết quả; một câu count(*) trần sẽ bị tối ưu bỏ qua phần parse và để bảng reject rỗng, nên phải dùng CREATE TABLE … AS. Hai là một dòng bị cắt cụt sinh ra một bản ghi lỗi cho mỗi cột thiếu, nên 151 dòng hỏng hiện ra thành chừng 1.651 bản ghi. Vì vậy hãy luôn đếm số dòng khác nhau chứ đừng đếm bản ghi.',
      ),
      bi(
        'The reject table accumulates per connection. Clear it after copying each day out, or day N+1\'s quarantine parquet silently includes day N\'s rejects — evidence counted twice, which is worse than no evidence.',
        'Bảng reject tích luỹ theo từng connection. Sau khi chép xong mỗi ngày thì phải xoá nó đi, nếu không file parquet quarantine của ngày N cộng 1 sẽ lặng lẽ chứa luôn phần bị loại của ngày N. Bằng chứng bị đếm hai lần thì còn tệ hơn là không có bằng chứng.',
      ),
      bi(
        'Lineage stays at two columns on the row: _data_date and _run_id, on quarantine rows exactly as on core rows. The file name lives once per attempt on ops.etl_runs.source_file, written by the runner at the moment the attempt starts — on the INSERT, not the UPDATE, because a failed day must still say which file it was trying to read. Everything else about the load is one join away, and today is where that pays: the incident write-up needs the file name, the load time and the row count for one bad day, and reads them from 69 ledger rows instead of 4 million data rows.',
        'Phần lineage vẫn giữ đúng hai cột trên mỗi dòng là _data_date và _run_id, có mặt trên dòng quarantine y như trên dòng của core. Tên file thì nằm đúng một lần cho mỗi lần thử, ở cột ops.etl_runs.source_file, do runner ghi vào ngay lúc lần thử bắt đầu. Ghi ở câu INSERT chứ không phải câu UPDATE, vì một ngày hỏng vẫn phải nói được nó đang định đọc file nào. Mọi thứ khác về lần nạp chỉ cách một phép join, và hôm nay chính là lúc chuyện đó sinh lời: phần ghi chép sự cố cần tên file, thời điểm nạp và số dòng của đúng một ngày hỏng, và nó đọc mấy thứ đó từ 69 dòng ledger thay vì từ 4 triệu dòng dữ liệu.',
      ),
    ],
    checks: [
      {
        q: bi(
          'The error says the CSV dialect could not be detected. The real cause is truncated lines. Why does the message point somewhere else?',
          'Thông báo lỗi nói là không dò được cách parse CSV, trong khi nguyên nhân thật là các dòng bị cắt cụt. Vì sao thông báo lại chỉ sang chỗ khác?',
        ),
        a: bi(
          'Because error messages point at the symptom nearest to the code that raised them. Among the 151 broken lines is exactly one with an unclosed quote, and that single line poisons the dialect sniffer for the whole file. Rule zero of incidents is to collect the words, not to believe them.',
          'Vì thông báo lỗi chỉ vào triệu chứng gần nhất với đoạn code đã ném nó ra. Trong 151 dòng hỏng đó có đúng một dòng thiếu dấu nháy đóng, và riêng một dòng ấy đủ làm nhiễu bộ dò dialect cho cả file. Quy tắc số không khi xử lý sự cố là thu thập lấy câu chữ, chứ không phải tin vào chúng.',
        ),
      },
      {
        q: bi(
          'You probe the corrupt file with SELECT count(*) and reject_errors comes back empty. Is the file fine?',
          'Bạn thăm dò file hỏng bằng SELECT count(*) và bảng reject_errors trả về rỗng. Vậy file ổn chứ?',
        ),
        a: bi(
          'No — the scan never materialized, so it was optimized past the parsing that produces rejects. Re-probe with CREATE TABLE probe AS SELECT … and the 151 lines appear. This is a false all-clear that reads exactly like a real one.',
          'Không. Phép quét đó không vật chất hoá kết quả nên nó bị tối ưu bỏ qua luôn phần parse, mà phần parse mới là thứ sinh ra các dòng bị loại. Thăm dò lại bằng CREATE TABLE probe AS SELECT … thì 151 dòng hiện ra ngay. Đây là một lần báo an toàn giả, mà đọc lên thì y hệt một lần báo an toàn thật.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 5 ─────────── */
  {
    level: 'detail',
    heading: bi(
      'Late data on partial ranges, the append that is not idempotent, and telling people',
      'Dữ liệu về trễ khi chỉ backfill một đoạn, phép append không idempotent, và chuyện báo cho người khác',
    ),
    paras: [
      bi(
        'The subtle trap comes straight from the A06 contract: the feed has a 7-day late-data allowance, which you measured in A08. File D carries corrections for days D−7 through D. So if you backfill June 10 to June 20, corrections to June 20 live in files up to June 27 — outside your range, and your June 20 comes out stale. A full-history replay side-steps this. A partial backfill must extend its FILE range 7 days past the DATE range it wants correct.',
        'Cái bẫy tinh vi nhất đến thẳng từ contract của A06: feed này có mức trễ được phép là 7 ngày, con số mà bạn đã tự đo ở A08. File của ngày D mang theo bản sửa cho các ngày từ D trừ 7 tới D. Vậy nên nếu bạn backfill từ ngày 10 tới ngày 20 tháng 6, thì bản sửa cho ngày 20 lại nằm trong các file tới tận ngày 27, tức là ngoài dải bạn chạy, và ngày 20 của bạn ra kết quả cũ. Chạy lại toàn bộ lịch sử thì né được chuyện này. Còn backfill một đoạn thì phải kéo dải FILE dài thêm 7 ngày so với dải NGÀY mà bạn muốn nó đúng.',
      ),
      bi(
        'Another one that bites in the opposite direction: keep the A10 lake COPY … APPEND out of load_day. APPEND is not idempotent, so a 69-day replay through it would silently double the 68 days A10 already wrote, and nothing before A15\'s exact source count would catch it. The lake is missing exactly one day, and you repair that one day by hand, once.',
        'Còn một cái bẫy nữa cắn theo chiều ngược lại: đừng đưa lệnh COPY … APPEND ghi lake của A10 vào bên trong load_day. Phép APPEND không idempotent, nên chạy lại 69 ngày xuyên qua nó sẽ lặng lẽ nhân đôi 68 ngày mà A10 đã ghi, và không phép kiểm nào trước A15 bắt được chuyện đó. Lake thật ra chỉ thiếu đúng một ngày, và bạn vá đúng ngày đó bằng tay, một lần thôi.',
      ),
      bi(
        'The cost math is one line and it is what separates a professional from someone hitting enter and hoping: sum(rows) divided by sum of seconds gives rows per second; rows per second times rows remaining gives time remaining. Check it — does small-scale throughput times the full-scale manifest total predict your actual wall clock? Usually the right ballpark but not exact, because bigger files stream differently, spike days skew the average, and per-day overhead is fixed.',
        'Phép tính chi phí chỉ gói trong một dòng, mà chính nó tách một người làm nghề khỏi một người bấm enter rồi cầu may: lấy tổng số dòng chia tổng số giây thì ra số dòng mỗi giây, rồi lấy số đó nhân với số dòng còn lại thì ra thời gian còn lại. Hãy kiểm lại xem: lấy tốc độ đo ở scale small nhân với tổng số dòng theo manifest bản full thì có dự đoán đúng thời gian chạy thật không? Thường là đúng tầm nhưng không khớp hẳn, vì file lớn hơn thì đọc theo kiểu khác, mấy ngày tăng vọt kéo lệch trung bình, còn phần chi phí cố định của mỗi ngày thì không đổi.',
      ),
      bi(
        'On the ops side, note the division of labour between two sensors that both write to ops.alerts. A05\'s staleness probe watches the warehouse from the inside: what is the newest _data_date I hold? Today\'s freshness gate watches the producer\'s drop folder from the outside: has every file the contract promises actually arrived? The second one exists because your runner only notices a missing file if somebody happens to run it. A delivery that never arrives triggers no error anywhere, because the job that would have failed never starts.',
        'Về phía vận hành, hãy để ý cách phân chia việc giữa hai cảm biến cùng ghi vào bảng ops.alerts. Phép dò dữ liệu cũ của A05 nhìn warehouse từ bên trong, kiểu như _data_date mới nhất mình đang giữ là ngày nào. Còn freshness gate của hôm nay thì nhìn thư mục nhận file của bên cung cấp từ bên ngoài, kiểu như mọi file mà contract đã hứa đã về đủ chưa. Cái thứ hai tồn tại vì runner của bạn chỉ nhận ra một file thiếu khi có ai đó tình cờ chạy nó. Một lần giao không bao giờ tới thì chẳng kích hoạt lỗi ở đâu cả, bởi cái job lẽ ra phải hỏng thì lại không hề khởi động.',
      ),
      bi(
        'A gate you run by hand only ever confirms what you already suspected. The same gate on a schedule finds problems nobody was looking for. That one line — run my check at 04:05 daily, page on failure — is the seed of all orchestration: grow it and you get cron pipelines, grow those and you get Airflow.',
        'Một cái gate mà bạn chạy bằng tay thì chỉ xác nhận lại thứ bạn vốn đã nghi. Cũng cái gate đó đặt vào lịch chạy thì lại tìm ra những vấn đề không ai đang đi tìm. Đúng một dòng chỉ dẫn kiểu chạy phép kiểm của tôi lúc 04:05 mỗi ngày, hỏng thì gọi người, chính là hạt giống của mọi hệ điều phối: lớn lên thì thành pipeline chạy bằng cron, lớn thêm nữa thì thành Airflow.',
      ),
      bi(
        'And the last detail is social. The contract\'s quality.structural clause tolerates zero malformed lines, so a file with unparseable lines is a producer incident, not warehouse dirt to mop up quietly — your write-up carries a note to the producer with the reject counts attached. Meanwhile v1.3.0 has no restatement clause at all: nothing says how a corrected re-export must be announced. That silence is a gap, and naming it is part of the job.',
        'Chi tiết cuối cùng lại thuộc về chuyện con người. Điều khoản quality.structural trong contract không dung thứ một dòng hỏng nào, nên một file có dòng không parse được là sự cố phía nhà cung cấp chứ không phải rác của warehouse để bạn lặng lẽ đi dọn. Bản ghi chép của bạn vì vậy phải có một mục gửi bên cung cấp, đính kèm số dòng bị loại. Trong khi đó bản 1.3.0 lại hoàn toàn không có điều khoản nào về restatement: không dòng nào nói rằng một bản export sửa lại thì phải được thông báo ra sao. Chỗ im lặng đó là một lỗ hổng, và gọi tên nó ra cũng là một phần của công việc.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Your postmortem should have a detection-gap section. What could have caught this file before the backfill ever ran?',
          'Bản ghi chép sự cố của bạn cần có mục về khoảng trống phát hiện. Vậy cái gì lẽ ra đã bắt được file này từ trước khi backfill chạy?',
        ),
        a: bi(
          'The manifest. Its corrupt_rows field has been reporting 151 for this file all along — the producer\'s own paperwork confessed before you read a single byte of CSV. An alert on corrupt_rows > 0 would have turned a mid-backfill incident into a message on the morning it was delivered.',
          'Chính cái manifest. Trường corrupt_rows của nó vẫn báo con số 151 cho file này từ đầu tới giờ, tức là giấy tờ của chính bên cung cấp đã tự thú trước khi bạn kịp đọc lấy một byte CSV nào. Chỉ cần một cảnh báo khi corrupt_rows lớn hơn 0 là sự cố giữa lúc backfill đã trở thành một tin nhắn ngay buổi sáng file được giao.',
        ),
      },
      {
        q: bi(
          'After restating core for 69 days, what else has to run, and in what order?',
          'Sau khi dựng lại core cho 69 ngày thì còn thứ gì phải chạy nữa, và theo thứ tự nào?',
        ),
        a: bi(
          'Everything built from core, downstream first-in-dependency-order: your A04 marts read core, so they hold pre-restatement numbers until they are rebuilt. A core that is correct while the marts are stale is arguably worse than both being stale, because now two tables disagree and nobody knows which one the dashboard reads.',
          'Mọi thứ dựng lên từ core, chạy theo thứ tự phụ thuộc từ trên xuống. Các mart ở A04 đọc từ core, nên chúng vẫn giữ số của trước lần dựng lại cho tới khi được dựng lại. Một cái core đúng trong khi các mart còn cũ thì có khi còn tệ hơn cả hai cùng cũ, vì bây giờ hai bảng bất đồng với nhau mà không ai biết dashboard đang đọc bảng nào.',
        ),
      },
    ],
  },
]

export const a11Terms: Term[] = [
  {
    term: 'Backfill',
    gloss: 'chạy pipeline trên các ngày trong quá khứ',
    means: bi(
      'Running your normal per-day pipeline over a range of past dates to fill a gap — the pipeline is new, or it was down, or history was never loaded. Not a separate script.',
      'Chạy chính pipeline theo ngày bình thường trên một dải ngày trong quá khứ để lấp một khoảng trống, có thể vì pipeline mới dựng, vì nó từng chết, hoặc vì phần lịch sử chưa bao giờ được nạp. Đây không phải một script riêng.',
    ),
    source: {
      name: 'SQLMesh — Plans, backfills and restatement',
      url: 'https://sqlmesh.readthedocs.io/en/stable/concepts/plans/',
    },
  },
  {
    term: 'Restatement',
    gloss: 'backfill làm đổi số người ta đã thấy',
    means: bi(
      'A backfill that changes numbers consumers have already seen, because logic or source data changed. Technically identical to a backfill; socially very different — consumers must be warned before their dashboards move.',
      'Một lần backfill làm thay đổi những con số mà người dùng đã nhìn thấy rồi, vì logic hoặc dữ liệu nguồn đã đổi. Về kỹ thuật thì nó giống hệt backfill, nhưng về phía con người thì rất khác: người dùng phải được báo trước khi dashboard của họ đổi số.',
    ),
    source: {
      name: 'SQLMesh — Plans, backfills and restatement',
      url: 'https://sqlmesh.readthedocs.io/en/stable/concepts/plans/',
    },
  },
  {
    term: 'Incremental load',
    gloss: 'chỉ xử lý phần mới nhất',
    means: bi(
      'Processing only the newest slice — yesterday\'s file. Normal daily operation, cheap. The thing a backfill replays many times over.',
      'Chỉ xử lý phần mới nhất, tức file của hôm qua. Đây là việc chạy hằng ngày bình thường và rẻ, cũng chính là thứ mà backfill đem ra chạy lại nhiều lần.',
    ),
  },
  {
    term: 'Runner',
    gloss: 'vòng lặp điều khiển pipeline theo ngày',
    means: bi(
      'The thin loop around your per-day pipeline: it plans before acting, reads the ledger to decide what still needs doing, continues on error, and reports throughput. It owns ops.etl_runs; load_day does not write there.',
      'Là vòng lặp mỏng bọc quanh pipeline theo ngày của bạn: nó lập kế hoạch trước khi hành động, đọc ledger để quyết còn việc gì phải làm, gặp lỗi thì chạy tiếp, và báo cáo tốc độ. Nó sở hữu bảng ops.etl_runs, còn hàm load_day thì không ghi vào đó.',
    ),
  },
  {
    term: 'Dry run',
    gloss: 'in kế hoạch ra, không đụng gì cả',
    means: bi(
      'A flag that prints the plan and touches nothing. A backfill touches weeks of data and cannot be un-touched, so this is the only cheap moment in the operation. A dry run that writes anything is a bug.',
      'Một cái cờ chỉ in ra kế hoạch và không đụng vào bất cứ thứ gì. Backfill thì đụng vào dữ liệu của hàng tuần liền và không rút lại được, nên đây là khoảnh khắc rẻ duy nhất trong cả thao tác. Một lần chạy thử mà ghi ra thứ gì đó là lỗi.',
    ),
  },
  {
    term: 'Resume',
    gloss: 'chạy tiếp từ chỗ dở, không làm lại từ đầu',
    means: bi(
      'Reading the latest status per date from the ledger and skipping the green ones. A crash at day 40 of 69 then costs you day 40, not days 1 through 40.',
      'Đọc trạng thái mới nhất của từng ngày trong ledger rồi bỏ qua những ngày đã xanh. Khi đó chết ở ngày 40 trên 69 chỉ làm bạn mất đúng ngày 40, chứ không mất từ ngày 1 tới ngày 40.',
    ),
  },
  {
    term: 'Continue-on-error',
    gloss: 'một ngày hỏng không giết cả lần chạy',
    means: bi(
      'The 69 days are independent jobs, so a failure is logged and the loop moves on — but it must show up loudly in the end-of-run summary. Swallowed failures are how a backfill "succeeds" with a hole in it.',
      '69 ngày là 69 job độc lập, nên một lần hỏng thì được ghi lại rồi vòng lặp đi tiếp. Nhưng nó phải hiện thật rõ trong bảng tổng kết cuối lần chạy, vì nuốt lỗi đi chính là cách một lần backfill báo thành công trong khi vẫn thủng một lỗ.',
    ),
  },
  {
    term: 'Preflight',
    gloss: 'kiểm trước, mỗi ngày một lần',
    means: bi(
      'The fail-fast gate run before every single day, not once at startup — each date brings its own file and manifest, and disks fill mid-backfill. A disk problem caught at hour 0 costs nothing; the same problem at row 40 million costs the evening.',
      'Cổng kiểm hỏng-sớm, chạy trước từng ngày một chứ không phải một lần lúc khởi động, vì mỗi ngày mang file và manifest riêng, mà đĩa thì đầy ngay giữa lúc backfill đang chạy. Một vấn đề về đĩa bắt được ở giờ thứ 0 thì chẳng tốn gì, còn đúng vấn đề đó ở dòng thứ 40 triệu thì mất cả buổi tối.',
    ),
  },
  {
    term: 'store_rejects',
    gloss: 'giữ lại các dòng không parse được',
    means: bi(
      'A read_csv option: parse what is parseable and file the rest in a reject table as evidence. Only populated by a materializing scan, and it accumulates per connection — clear it between days.',
      'Một tuỳ chọn của read_csv: parse được dòng nào thì parse, phần còn lại đưa vào bảng reject để làm bằng chứng. Nó chỉ được điền khi phép quét có vật chất hoá kết quả, và nó tích luỹ theo từng connection, nên phải xoá đi giữa các ngày.',
    ),
    source: {
      name: 'DuckDB — CSV rejects tables',
      url: 'https://duckdb.org/docs/stable/data/csv/reading_faulty_csv_files',
    },
  },
  {
    term: 'DISTINCT line',
    gloss: 'đếm dòng hỏng, đừng đếm bản ghi lỗi',
    means: bi(
      'A truncated line yields one reject record per missing column, so 151 bad lines show up as roughly 1,651 records. Counting records instead of distinct lines inflates the incident by a factor of ten.',
      'Một dòng bị cắt cụt sinh ra một bản ghi lỗi cho mỗi cột còn thiếu, nên 151 dòng hỏng hiện ra thành chừng 1.651 bản ghi. Đếm bản ghi thay vì đếm số dòng khác nhau sẽ thổi phồng sự cố lên gấp mười lần.',
    ),
  },
  {
    term: 'Quarantine',
    gloss: 'chỗ chứa dòng hỏng kèm lý do',
    means: bi(
      'Bad lines go to a parquet file with their line number, column, error type and raw text — never to /dev/null, and never fixed by editing the raw CSV. Raw files are immutable evidence.',
      'Các dòng hỏng đi vào một file parquet, kèm số dòng, tên cột, loại lỗi và nguyên văn dòng đó. Không bao giờ vứt chúng đi, và cũng không bao giờ sửa bằng cách chỉnh tay file CSV gốc, vì file thô là bằng chứng bất biến.',
    ),
  },
  {
    term: 'Run ledger',
    gloss: 'sổ ghi mọi lần chạy, không xoá',
    means: bi(
      'ops.etl_runs: one row per attempt, carrying status, timestamps, row count, error and source_file. It is what the runner reads to resume, and what an incident write-up reads for detection time, resolution time and blast radius.',
      'Bảng ops.etl_runs, mỗi lần thử một dòng, mang theo trạng thái, các mốc thời gian, số dòng, lỗi và tên file nguồn. Đây là thứ runner đọc để chạy tiếp, và cũng là thứ bản ghi chép sự cố đọc để lấy thời điểm phát hiện, thời điểm xử lý xong và phạm vi ảnh hưởng.',
    ),
  },
  {
    term: 'Freshness gate',
    gloss: 'canh xem file đã về chưa, chạy theo giờ',
    means: bi(
      'A watchdog that checks the producer\'s drop folder against the contract\'s delivery deadline and alerts on anything missing. It has to run on the clock, because a delivery that never arrives starts no job and therefore fails nothing.',
      'Một cái canh cửa, đối chiếu thư mục nhận file của bên cung cấp với hạn giao ghi trong contract rồi cảnh báo nếu thiếu. Nó phải chạy theo lịch, vì một lần giao không bao giờ tới thì không khởi động job nào, nên cũng chẳng làm hỏng cái gì.',
    ),
    source: {
      name: 'Data Contract Specification — service levels',
      url: 'https://datacontract.com/',
    },
  },
  {
    term: 'Blast radius',
    gloss: 'sự cố lan tới đâu',
    means: bi(
      'How far an incident spread. Here it is one query: rows per day across the whole range, so a normal plateau with one anomaly proves the damage was contained to a single date.',
      'Sự cố đã lan rộng tới đâu. Ở đây nó chỉ là một câu query cho ra số dòng theo từng ngày trên cả dải, và khi thấy một mặt bằng bình thường với đúng một chỗ bất thường thì đó là bằng chứng thiệt hại chỉ gói gọn trong một ngày.',
    ),
  },
  {
    term: 'Blameless postmortem',
    gloss: 'ghi chép sự cố, không quy tội ai',
    means: bi(
      'A short write-up whose job is to make the NEXT incident shorter, not to assign guilt. Impact, timeline, root cause, detection gap, resolution, action items with owners.',
      'Một bản ghi ngắn mà mục đích là làm cho sự cố LẦN SAU ngắn hơn, chứ không phải để quy tội ai. Gồm các mục: ảnh hưởng, dòng thời gian, nguyên nhân gốc, khoảng trống phát hiện, cách xử lý, và các việc phải làm kèm người chịu trách nhiệm.',
    ),
    source: {
      name: 'Google SRE Book — Postmortem culture',
      url: 'https://sre.google/sre-book/postmortem-culture/',
    },
  },
]