import type { AssignmentSpec } from '../types'
import { bi } from '../types'
import { a14Terms, a14Theory } from './a14.theory'

export const a14: AssignmentSpec = {
  id: 'a14',
  code: 'A14',
  title: bi('Performance tuning', 'Tối ưu hiệu năng'),
  summary: bi(
    'You inherit a nightly job that is correct and slow. Measure it, rank its sins by measured time, fix them one at a time, and prove after every fix that the numbers did not move.',
    'Bạn nhận lại một cái job chạy đêm vừa đúng vừa chậm. Đo nó, xếp hạng các lỗi theo thời gian đo được, sửa từng cái một, và sau mỗi lần sửa phải chứng minh các con số không hề xê dịch.',
  ),
  estHours: 5,
  difficulty: 3,
  outcome: bi(
    'You can time a query honestly instead of guessing, read a query plan well enough to prove which files were skipped, rank a slow job by where its seconds actually go, and hand someone a speedup with an equality proof attached.',
    'Sau bài này bạn đo được thời gian một câu query một cách trung thực thay vì đoán, đọc được kế hoạch thực thi đủ để chứng minh những file nào đã được bỏ qua, xếp hạng được một cái job chậm theo đúng chỗ mấy giây của nó chảy đi, và đưa cho người khác một con số tốc độ kèm bằng chứng kết quả không đổi.',
  ),
  theory: a14Theory,
  terms: a14Terms,
  tasks: [
    /* ═══════════════ T0 — SETUP ═══════════════ */
    {
      id: 'a14-t0',
      title: bi('Setup', 'Chuẩn bị'),
      goal: bi(
        'The lake at both scales, one glob that survives your directory name, and room for 8 GB of experiments.',
        'Lake ở cả hai scale, một mẫu đường dẫn không phụ thuộc tên thư mục, và chỗ trống cho 8 GB file thí nghiệm.',
      ),
      steps: [
        {
          title: bi('What you need in place', 'Những thứ phải có sẵn'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'A13 done, the full 69-day canonical lake at both scales from A10 and A11, the raw dimension CSVs, and roughly 12 GB free on the data drive. Scripts live in work/ and run from the repo root, with the usual connection settings.',
                'Bạn cần đã xong A13, có đủ cái lake canonical 69 ngày ở cả hai scale từ A10 và A11, có các file CSV chiều, và còn chừng 12 GB trống trên ổ chứa dữ liệu. Script đặt trong thư mục work/ và chạy từ thư mục gốc của repo, với các thiết lập kết nối như mọi khi.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `LAKE = (lake_dir(SCALE) / "orders_v=*").as_posix()   # lake có đánh version của A10

con.execute(f"SET memory_limit='8GB'; SET threads=8; "
            f"SET temp_directory='{tmp_dir(SCALE).as_posix()}';")`,
            },
            {
              kind: 'why',
              body: bi(
                'The glob means the timestamp in your A10 directory name does not matter, so nothing today breaks when you publish a new version. It does make hive_partitioning surface an extra orders_v column — harmless for everything in this assignment.',
                'Dùng mẫu có dấu sao thì cái mốc thời gian trong tên thư mục của A10 không còn quan trọng nữa, nên hôm nay chẳng có gì hỏng khi bạn công bố một phiên bản mới. Đổi lại nó làm hive_partitioning sinh thêm một cột orders_v, mà cột đó vô hại với mọi thứ trong bài này.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Query plans print with box-drawing characters, and the Windows console is cp1252. If printing one dies with UnicodeEncodeError, add sys.stdout.reconfigure(encoding="utf-8") at the top. Not a DuckDB bug.',
                'Kế hoạch thực thi được in bằng ký tự vẽ khung, mà console của Windows dùng bảng mã cp1252. Nếu in ra mà chết với lỗi UnicodeEncodeError thì thêm sys.stdout.reconfigure(encoding="utf-8") lên đầu file. Đây không phải lỗi của DuckDB.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Task 6 writes about 8 GB of full-scale experiment files, and cleaning them up is part of the Definition of Done. Optional but pleasant: the DuckDB CLI, whose .timer on prints the real wall clock per query. Everything today also works without it.',
                'Task 6 sẽ ghi ra chừng 8 GB file thí nghiệm ở scale full, và việc dọn chúng đi nằm trong danh sách hoàn thành. Có thì tiện, không có cũng không sao: bản DuckDB chạy dòng lệnh, với lệnh bật đồng hồ in ra thời gian thực của từng câu query. Mọi thứ hôm nay đều làm được mà không cần tới nó.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Lake readable at both scales through the glob; ~12 GB free on the data drive',
          'Đọc được lake ở cả hai scale qua mẫu đường dẫn có dấu sao; còn chừng 12 GB trống trên ổ dữ liệu',
        ),
      ],
    },

    /* ═══════════════ T1 ═══════════════ */
    {
      id: 'a14-t1',
      num: 1,
      title: bi('Build the stopwatch', 'Dựng cái đồng hồ bấm giờ'),
      goal: bi(
        'No timing claim today without this harness.',
        'Hôm nay không có con số thời gian nào được nói ra mà không đi qua cái khung này.',
      ),
      steps: [
        {
          title: bi('work/bench.py', 'work/bench.py'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `"""work/bench.py -- đo trung thực: một lần làm nóng, rồi lấy trung vị của 3."""
import statistics, time

def bench(con, label, sql, runs=3, warmup=1):
    for _ in range(warmup):
        con.execute(sql).fetchall()     # trả trước phần đĩa còn lạnh (A13)
    times = []
    for _ in range(runs):
        t0 = time.perf_counter()
        con.execute(sql).fetchall()     # phải fetch! không thì chỉ đo được một phần việc
        times.append(time.perf_counter() - t0)
    med = statistics.median(times)
    print(f"{label:30s} median {med*1000:9.1f} ms   "
          f"(min {min(times)*1000:.1f} / max {max(times)*1000:.1f})")
    return med`,
            },
            {
              kind: 'why',
              body: bi(
                'Median, not mean: one antivirus hiccup should not move your number. And the fetchall is not decoration — an execute can return before the work is finished, so without it you would be timing part of the query and calling it the whole thing.',
                'Lấy trung vị chứ không lấy trung bình, để một lần phần mềm diệt virus nhảy vào không làm lệch con số. Còn lệnh fetchall không phải để trang trí: lệnh thực thi có thể trả về trước khi công việc xong, nên thiếu nó thì bạn đang đo một phần câu query rồi gọi đó là toàn bộ.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'To bench a statement that creates something, write it as CREATE OR REPLACE TABLE. Otherwise run 2 fails because the table already exists, and you never get a median at all.',
                'Muốn đo một câu lệnh có tạo ra thứ gì đó thì viết thành CREATE OR REPLACE TABLE. Không thì lần chạy thứ hai sẽ hỏng vì bảng đã tồn tại, và bạn chẳng có trung vị nào cả.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Two bench calls on the same query agree closely, and at least once you see the warm-up run come in slower than the three that follow.',
                'Gọi hàm bench hai lần trên cùng một câu query thì hai kết quả sát nhau, và ít nhất một lần bạn thấy lần chạy làm nóng chậm hơn ba lần sau đó.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Two bench calls on one query agree closely; the warm-up was visibly slower at least once',
          'Hai lần gọi bench trên cùng một query cho kết quả sát nhau; lần làm nóng chậm hơn thấy rõ ít nhất một lần',
        ),
      ],
    },

    /* ═══════════════ T2 ═══════════════ */
    {
      id: 'a14-t2',
      num: 2,
      title: bi('Three lenses on one query', 'Ba ống kính nhìn vào một câu query'),
      goal: bi(
        'Three correct ways to filter one day, and a 200× spread between them.',
        'Ba cách lọc lấy một ngày, cả ba đều đúng, mà chênh nhau tới 200 lần.',
      ),
      steps: [
        {
          title: bi('Lens 1 — the stopwatch', 'Ống kính 1 — đồng hồ bấm giờ'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `BASE = (f"SELECT count(*) FROM read_parquet('{LAKE}/*/*.parquet', "
        f"hive_partitioning=true) WHERE ")
filters = {
    "A strftime(ts) = str": "strftime(order_ts, '%Y-%m-%d') = '2026-06-05'",
    "B cast(ts) = date":    "CAST(order_ts AS DATE) = DATE '2026-06-05'",
    "C order_date = date":  "order_date = DATE '2026-06-05'",
}
for name, f in filters.items():
    bench(con, name, BASE + f)`,
            },
            {
              kind: 'expect',
              body: bi(
                'One dev machine, small scale: A about 130 ms, B about 20 ms, C about 10 ms. At full scale: A about 1.9 SECONDS, B about 40 ms, C about 10 ms — a 200× spread for exactly the same answer. Your numbers will differ; the shape will not.',
                'Trên một máy dùng để phát triển, ở scale small: A chừng 130 ms, B chừng 20 ms, C chừng 10 ms. Còn ở scale full: A chừng 1,9 GIÂY, B chừng 40 ms, C chừng 10 ms — chênh nhau 200 lần cho đúng một câu trả lời. Số của bạn sẽ khác, nhưng hình dạng thì không.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'C filters on the partition column, so whole files are never opened. B looks clumsy but the optimizer rewrites the cast into a range check on order_ts, and zone maps rescue it. A hides the column inside a string function that no optimizer can see through, so every file is opened and every row formatted.',
                'Cách C lọc theo đúng cột dùng làm partition, nên cả những file kia không bao giờ được mở. Cách B trông vụng về nhưng optimizer viết lại phép ép kiểu thành một phép so khoảng trên order_ts, và zone map cứu được. Còn cách A giấu cột đó bên trong một hàm chuỗi mà không optimizer nào nhìn xuyên qua được, nên file nào cũng phải mở và dòng nào cũng phải định dạng lại.',
              ),
            },
          ],
        },
        {
          title: bi('Lens 2 — the plan with numbers in it', 'Ống kính 2 — kế hoạch kèm số liệu'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `print(con.execute("EXPLAIN ANALYZE " + BASE + filters["C order_date = date"])
         .fetchall()[0][1])
print(con.execute("EXPLAIN ANALYZE " + BASE + filters["A strftime(ts) = str"])
         .fetchall()[0][1])`,
            },
            {
              kind: 'expect',
              body: bi(
                'In the scan box, C shows a File Filters line and Scanning Files: 1/N. A shows Total Files Read: N with nearly all the time in TABLE_SCAN. N is your lake\'s total file count — a couple of hundred, not 69, because A10\'s per-day APPEND loads left several files per month-2 partition.',
                'Trong ô mô tả phép quét, cách C hiện một dòng File Filters và dòng báo quét 1 trên N file. Còn cách A hiện tổng số file đã đọc là N, với gần như toàn bộ thời gian nằm ở TABLE_SCAN. Số N chính là tổng số file trong lake của bạn, cỡ vài trăm chứ không phải 69, vì mấy lần nạp theo ngày kiểu ghi thêm của A10 để lại vài file trong mỗi partition của tháng 2.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'That number 1 is your pruning proof, and it stays useful forever: it is the one line that turns "I think the filter helped" into "one file out of N was opened".',
                'Con số 1 đó chính là bằng chứng cho việc bỏ bớt file, và nó còn dùng được mãi về sau: đó là dòng duy nhất biến câu tôi nghĩ phép lọc có tác dụng thành câu chỉ một file trên N file được mở ra.',
              ),
            },
          ],
        },
        {
          title: bi('Lens 3 — the same truth as data', 'Ống kính 3 — cũng sự thật đó, dưới dạng dữ liệu'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.execute("PRAGMA enable_profiling='json';")
con.execute("PRAGMA profiling_output='work/profile.json';")
con.execute(BASE + filters["A strftime(ts) = str"]).fetchall()
con.execute("PRAGMA disable_profiling;")

def ops(node):                          # đi qua cây toán tử trong JSON
    if "operator_timing" in node:
        yield node["operator_timing"], node["operator_type"], node["operator_cardinality"]
    for child in node.get("children", []):
        yield from ops(child)

prof = json.loads(Path("work/profile.json").read_text())
for tm, op, rows in sorted(ops(prof), reverse=True)[:5]:
    print(f"{tm:8.4f} s   {op:20s} rows out: {rows:,}")`,
            },
            {
              kind: 'text',
              body: bi(
                'The plan is for reading; the JSON is for sorting. Once the profile is data you can rank operators by time, which is exactly what you will want when the query is big enough that the plan no longer fits on a screen.',
                'Kế hoạch thực thi là để đọc, còn JSON là để sắp xếp. Khi bản hồ sơ đã thành dữ liệu thì bạn sắp được các toán tử theo thời gian, mà đó đúng là thứ bạn cần tới lúc câu query lớn đến mức kế hoạch không còn vừa một màn hình.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'The 3 filters × 2 scales table is in the journal, plus one sentence on how you prove pruning happened',
          'Bảng ba cách lọc nhân hai scale đã nằm trong journal, kèm một câu nói rõ bạn chứng minh việc bỏ bớt file bằng cách nào',
        ),
      ],
    },

    /* ═══════════════ T3 ═══════════════ */
    {
      id: 'a14-t3',
      num: 3,
      title: bi('Meet the inherited job', 'Làm quen với cái job vừa nhận'),
      goal: bi(
        'Read it like a crime scene, and fix nothing yet.',
        'Đọc nó như đọc một hiện trường, và chưa sửa gì cả.',
      ),
      steps: [
        {
          title: bi('Run it first, read it second', 'Chạy trước, đọc sau'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Copy the job from the assignment exactly as work/badpipe.py and run it at small scale. It is correct: for a chosen day it produces a day extract for the finance team, with their six contract columns, and a store_daily mart with one row per store. The rule of the game is to make it fast without changing what it produces.',
                'Chép nguyên cái job trong đề thành file work/badpipe.py rồi chạy ở scale small. Nó chạy đúng: với một ngày được chọn, nó tạo ra một bản trích xuất cho đội tài chính đúng sáu cột trong contract của họ, và một mart store_daily mỗi cửa hàng một dòng. Luật chơi là làm cho nó nhanh lên mà không đổi thứ nó tạo ra.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Per-step timings on one dev machine, small scale: slice 0.27 · validate 69.86 · extract 0.10 · mart 0.13 · TOTAL 70.35 s. That table is your baseline — write it down before touching anything.',
                'Thời gian từng bước trên một máy phát triển, ở scale small: cắt lát 0,27 · kiểm tra 69,86 · trích xuất 0,10 · dựng mart 0,13 · TỔNG 70,35 giây. Cái bảng đó là mốc của bạn, hãy ghi lại trước khi đụng vào bất cứ thứ gì.',
              ),
            },
          ],
        },
        {
          title: bi('Now list the sins, with a cost next to each', 'Giờ liệt kê các lỗi, mỗi lỗi kèm một cái giá'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Find at least seven, and next to each one write which step\'s measured time it lives in. Candidates to look for: a needless DISTINCT over wide rows, a string function wrapped around a date column, an ORDER BY nobody asked for, a Python loop doing single-row INSERTs, SELECT * dragging the widest columns through every step, a join that uses nothing from the joined table, and a row-group size small enough to hurt every future reader.',
                'Hãy tìm ít nhất bảy lỗi, và bên cạnh mỗi lỗi ghi rõ nó nằm trong thời gian đo được của bước nào. Mấy chỗ đáng ngó tới: một phép DISTINCT thừa chạy trên những dòng rất rộng, một hàm chuỗi bọc quanh cột ngày, một lệnh ORDER BY chẳng ai yêu cầu, một vòng lặp Python chạy từng lệnh INSERT một dòng, một câu SELECT * kéo theo mấy cột nặng nhất đi qua từng bước, một phép join không dùng gì từ bảng được join, và một kích thước row group nhỏ tới mức làm khổ mọi lần đọc về sau.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Notice what the ranking just told you. The clever finds — the DISTINCT, the strftime, the ORDER BY — sit inside half a second between them, while one boring step holds ninety-nine percent of the runtime. If you had started by fixing the interesting things, you would have spent an afternoon to save half a second.',
                'Hãy để ý cái bảng xếp hạng vừa nói cho bạn điều gì. Mấy chỗ đáng khoe như phép DISTINCT, hàm chuỗi và lệnh ORDER BY cộng lại nằm gọn trong nửa giây, trong khi đúng một bước nhàm chán chiếm chín mươi chín phần trăm thời gian chạy. Nếu bạn bắt đầu bằng việc sửa mấy chỗ thú vị thì bạn đã bỏ ra cả buổi chiều để tiết kiệm nửa giây.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Baseline per-step table plus a sin list, each sin tagged with its step and its cost',
          'Bảng thời gian từng bước làm mốc, kèm danh sách lỗi, mỗi lỗi ghi rõ thuộc bước nào và tốn bao nhiêu',
        ),
      ],
    },

    /* ═══════════════ T4 ═══════════════ */
    {
      id: 'a14-t4',
      num: 4,
      title: bi('Fix it, biggest first', 'Sửa nó, cái tốn nhất trước'),
      goal: bi(
        'Six fixes, applied one at a time, each measured and each proven safe.',
        'Sáu lần sửa, mỗi lần một cái, lần nào cũng đo và lần nào cũng chứng minh không làm hỏng gì.',
      ),
      steps: [
        {
          title: bi('The discipline is the skill', 'Kỷ luật mới là kỹ năng'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Copy badpipe.py to work/fastpipe.py and point its output at a different folder, so you keep both results to compare. Then apply the fixes one at a time, re-running and recording after each. Resist batching them.',
                'Chép file badpipe.py thành work/fastpipe.py và trỏ phần kết quả sang một thư mục khác, để giữ lại cả hai bộ kết quả mà đối chiếu. Rồi sửa từng lỗi một, sửa xong lại chạy lại và ghi số. Đừng gộp nhiều lần sửa vào một lượt.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Batching costs you attribution. If two changes go in together and one of them makes things worse, the pair can cancel out and the measurement looks like nothing happened — so you keep a regression without ever knowing it is there.',
                'Gộp lại thì bạn mất khả năng quy công cho từng thay đổi. Nếu hai thay đổi vào cùng lúc mà một cái làm mọi thứ chậm đi, hai cái sẽ triệt tiêu nhau, con số đo được trông như chẳng có gì xảy ra, và bạn giữ lại một chỗ tệ hơn mà không hề biết nó có ở đó.',
              ),
            },
          ],
        },
        {
          title: bi('Fix 1 — the loop becomes one statement', 'Sửa 1 — cả vòng lặp thành một câu lệnh'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.execute("CREATE TABLE day_ok AS "
            "SELECT * FROM day_raw WHERE order_total IS NOT NULL")`,
            },
            {
              kind: 'text',
              body: bi(
                'Sixty thousand rows were ferried into Python, then pushed back one INSERT at a time, and the whole "validation" turns out to be a WHERE clause in a costume.',
                'Sáu mươi nghìn dòng được kéo sang Python rồi đẩy ngược lại bằng từng lệnh INSERT một, mà hoá ra cả cái gọi là kiểm tra chỉ là một mệnh đề WHERE khoác áo.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'The win of the day. One dev machine: 69.86 s becomes 0.07 s.',
                'Đây là phần thắng lớn nhất của cả ngày. Trên một máy phát triển: 69,86 giây còn 0,07 giây.',
              ),
            },
          ],
        },
        {
          title: bi('Fixes 2 to 6', 'Sửa 2 tới 6'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Fix 2, filter on the partition column instead of the string function: same rows out, and the plan now shows one file scanned out of the whole lake. Fix 3, delete the DISTINCT and the ORDER BY — after proving them useless, not before.',
                'Sửa 2 là lọc theo cột partition thay vì dùng hàm chuỗi: vẫn ra đúng chừng ấy dòng, mà kế hoạch thực thi giờ cho thấy chỉ một file được quét trên cả cái lake. Sửa 3 là xoá phép DISTINCT và lệnh ORDER BY, nhưng phải chứng minh chúng vô dụng trước đã chứ không phải sau.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Never delete on faith. Count the day slice plain versus through SELECT DISTINCT * and see the same number: no two lake rows are byte-identical, because even A08\'s correction copies differ in updated_at, so the DISTINCT hashed sixty thousand wide rows for nothing. If YOUR counts differ, stop and investigate — a data bug outranks any speedup.',
                'Đừng bao giờ xoá theo cảm tính. Hãy đếm phần dữ liệu của ngày đó theo hai cách, một cách để nguyên và một cách qua SELECT DISTINCT *, rồi xem hai con số có bằng nhau không. Không có hai dòng nào trong lake giống hệt nhau tới từng byte, vì ngay cả mấy bản sửa của A08 cũng khác nhau ở cột updated_at, nên phép DISTINCT kia đã băm sáu mươi nghìn dòng rất rộng để chẳng được gì. Nhưng nếu số CỦA BẠN lệch thì dừng lại điều tra, vì một lỗi dữ liệu quan trọng hơn mọi con số tốc độ.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Fix 4, name your columns: the job drags the two widest columns in the lake through every step and ships them to a finance team that ignores them. Fix 5, drop the join nobody ordered: the mart joins a table it uses nothing from, and because it is a LEFT JOIN on the orders side the row count is unchanged without it. Fix 6, put the row-group size back to a sane value.',
                'Sửa 4 là gọi tên các cột: cái job đang kéo hai cột nặng nhất trong lake đi qua từng bước rồi gửi cả chúng cho một đội tài chính vốn không dùng tới. Sửa 5 là bỏ phép join chẳng ai đặt hàng: cái mart join với một bảng mà nó không lấy gì từ đó, và vì đây là LEFT JOIN đứng từ phía đơn hàng nên bỏ đi thì số dòng vẫn y nguyên. Sửa 6 là đưa kích thước row group về lại một giá trị hợp lý.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Two numbers worth writing down. The extract file at full scale goes from 94 MB to 28 MB once you name the six columns — projection is a disk and download win, not just a scan win. And the mart at full scale goes from about 205 ms with the useless join to about 32 ms without it.',
                'Có hai con số đáng ghi lại. File trích xuất ở scale full từ 94 MB còn 28 MB sau khi bạn gọi tên đúng sáu cột, tức là việc chỉ đọc cột cần thiết còn thắng cả về dung lượng đĩa và băng thông chứ không chỉ thắng ở khâu quét. Và cái mart ở scale full từ chừng 205 ms khi còn phép join vô ích xuống còn chừng 32 ms khi bỏ nó đi.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'See the join before deleting it: run EXPLAIN ANALYZE on the mart and find the hash join fed by a scan the size of the whole customer table. The optimizer picks build sides and join order for you, and will happily flip to building on the 400-row side — but it cannot know that a join is pointless. Deleting work is your job, not its.',
                'Hãy nhìn thấy phép join đó trước khi xoá: chạy EXPLAIN ANALYZE lên cái mart rồi tìm phép hash join được nuôi bởi một phép quét to bằng cả bảng khách hàng. Optimizer tự chọn bên nào để dựng và tự sắp thứ tự join, thậm chí sẵn sàng đảo sang dựng từ phía 400 dòng. Nhưng nó không có cách nào biết một phép join là vô ích. Xoá bớt việc là phần của bạn, không phải của nó.',
              ),
            },
          ],
        },
        {
          title: bi('Prove you broke nothing, after every fix', 'Chứng minh không làm hỏng gì, sau từng lần sửa'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT count(*) FROM (
  (SELECT * FROM read_parquet('<DATA_ROOT>/small/tmp/perf/store_daily_2026-06-05.parquet'))
  EXCEPT
  (SELECT * FROM read_parquet('<DATA_ROOT>/small/tmp/perf_fixed/store_daily_2026-06-05.parquet'))
);   -- 0 dòng khác biệt, và phải chạy cả chiều ngược lại`,
            },
            {
              kind: 'trap',
              body: bi(
                'Both directions, both artifacts. For the two extracts, name the six contract columns on the badpipe side, since that one still carries the wide columns. And run this after every single fix, not once at the end — that way, when it finally returns rows, you know exactly which fix broke it.',
                'Phải chạy cả hai chiều và trên cả hai sản phẩm đầu ra. Với hai bản trích xuất thì bên badpipe phải gọi tên đúng sáu cột trong contract, vì bên đó vẫn còn mang mấy cột nặng. Và hãy chạy sau từng lần sửa chứ đừng chạy một lần ở cuối, vì như vậy tới lúc nó trả về dòng nào đó thì bạn biết ngay lần sửa nào làm hỏng.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Small-scale end state on one dev machine: 70.35 s becomes 0.09 s, about 780 times faster. Yours will differ; the shape will not.',
                'Trạng thái cuối ở scale small trên một máy phát triển: 70,35 giây còn 0,09 giây, nhanh hơn chừng 780 lần. Số của bạn sẽ khác, nhưng hình dạng thì không.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'One journal row per fix — step, before, after — and the EXCEPT checks return 0',
          'Mỗi lần sửa một dòng trong journal, gồm bước nào, trước bao nhiêu, sau bao nhiêu, và các phép kiểm EXCEPT đều trả về 0',
        ),
        bi(
          'DISTINCT was proven a no-op with counts before it was deleted',
          'Phép DISTINCT được chứng minh là vô dụng bằng số đếm trước khi bị xoá',
        ),
      ],
    },

    /* ═══════════════ T5 ═══════════════ */
    {
      id: 'a14-t5',
      num: 5,
      title: bi('The full-scale showdown', 'Đối đầu ở scale full'),
      goal: bi(
        'Twenty minutes versus a fraction of a second, with an equality proof attached.',
        'Hai mươi phút so với một phần nhỏ của giây, kèm bằng chứng kết quả không đổi.',
      ),
      steps: [
        {
          title: bi('Start the slow one first, then go do Task 6', 'Chạy cái chậm trước, rồi đi làm Task 6'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `python work\\badpipe.py 2026-06-05     # để nó chạy, đừng ngồi nhìn
python work\\fastpipe.py 2026-06-05`,
            },
            {
              kind: 'text',
              body: bi(
                'Watch it while it grinds, then leave it alone. The slice step takes a couple of seconds — that is the string-function scan over roughly 5 GB of Parquet. Then the validate step sits there for about twenty minutes: a 1.2-million-row fetch holding around 2 GB of memory while 1.2 million INSERTs drip through one at a time.',
                'Hãy xem nó cày một lúc rồi để mặc nó. Bước cắt lát mất vài giây, đó là phép quét bằng hàm chuỗi trên chừng 5 GB Parquet. Rồi bước kiểm tra nằm đó chừng hai mươi phút: một lần kéo về 1,2 triệu dòng giữ chừng 2 GB bộ nhớ, trong khi 1,2 triệu lệnh INSERT nhỏ giọt từng cái một.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'One dev machine: badpipe TOTAL about 1,189 s, fastpipe about 0.3 s. Target is at least 20×; expect far beyond it — that machine saw about 780× at small scale and about 4,000× at full.',
                'Trên một máy phát triển: tổng của badpipe chừng 1.189 giây, của fastpipe chừng 0,3 giây. Mục tiêu là ít nhất 20 lần, nhưng thực tế sẽ vượt xa: trên máy đó là chừng 780 lần ở scale small và chừng 4.000 lần ở full.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Let the slow one finish rather than killing it. You want that number in writing, because the whole argument you will make to anyone else rests on the size of the gap, not on the fact that there was one.',
                'Hãy để cái chậm chạy cho hết chứ đừng giết nó giữa chừng. Bạn cần con số đó nằm trên giấy, vì mọi lập luận bạn sẽ đưa ra với người khác đều dựa trên độ lớn của khoảng cách, chứ không phải dựa trên chuyện có một khoảng cách.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Re-run both EXCEPT checks on the full-scale outputs too. A speedup without an equality proof is a rumour, and full scale has three eras and late corrections that small scale can hide.',
                'Nhớ chạy lại cả hai phép kiểm EXCEPT trên kết quả ở scale full nữa. Một con số tốc độ mà không kèm bằng chứng kết quả không đổi thì chỉ là tin đồn, mà scale full có ba era và có dữ liệu về trễ, những thứ mà scale small che được.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Table filled, at least 20× at both scales, equality proven both directions',
          'Bảng đã điền đủ, nhanh hơn ít nhất 20 lần ở cả hai scale, và đã chứng minh kết quả không đổi theo cả hai chiều',
        ),
        bi(
          'The journal names the single fix that bought the most seconds',
          'Journal gọi tên đúng một lần sửa đã mua về nhiều giây nhất',
        ),
      ],
    },

    /* ═══════════════ T6 ═══════════════ */
    {
      id: 'a14-t6',
      num: 6,
      title: bi('Row groups and zone maps', 'Row group và zone map'),
      goal: bi(
        'Two dials set at write time that every future reader pays for.',
        'Hai cái núm vặn lúc ghi, mà mọi lần đọc về sau đều phải trả giá.',
      ),
      steps: [
        {
          title: bi('Four files, two dials', 'Bốn file, hai cái núm'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `variants = {
    "rg5000_unsorted":   (5000,   ""),
    "rg122880_unsorted": (122880, ""),
    "rg122880_sorted":   (122880, "ORDER BY store_id"),
    "rg5000_sorted":     (5000,   "ORDER BY store_id"),
}
# ghi bốn file từ đúng sáu cột bạn thật sự query, rồi với mỗi file:
#   đếm số row group qua parquet_metadata()
#   bench một câu gom nhóm phải đọc hết
#   bench một câu lọc đúng một cửa hàng`,
            },
            {
              kind: 'expect',
              body: bi(
                'One dev machine, full scale, 82 million rows: tiny groups without sorting give about 13,400 groups, 2.1 s to scan everything and 2.0 s for the one-store filter. Sane groups without sorting give about 670 groups, 0.47 s and 0.43 s. Sane groups WITH sorting give the same 670 groups, 0.38 s to scan everything — and 0.024 s for the one-store filter.',
                'Trên một máy phát triển, ở scale full với 82 triệu dòng: khối nhỏ và không sắp xếp cho ra chừng 13.400 khối, mất 2,1 giây để quét hết và 2,0 giây cho câu lọc một cửa hàng. Khối hợp lý và không sắp xếp cho ra chừng 670 khối, mất 0,47 và 0,43 giây. Còn khối hợp lý CÓ sắp xếp thì vẫn 670 khối, mất 0,38 giây để quét hết, và 0,024 giây cho câu lọc một cửa hàng.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Read that table like an engineer. Tiny groups tax every query about four times over, including the ones that read everything, because the overhead is per group. Sorting does nothing for scan-everything — you still read every byte — but with sane groups it makes the one-store filter about eighteen times faster, because zone maps then skip 669 groups out of 670.',
                'Hãy đọc cái bảng đó như một kỹ sư. Khối nhỏ đánh thuế lên mọi câu query chừng bốn lần, kể cả những câu vốn phải đọc hết, vì phần phí đó tính theo từng khối. Việc sắp xếp thì chẳng giúp gì cho câu quét hết, vì bạn vẫn phải đọc từng byte, nhưng với kích thước khối hợp lý thì nó làm câu lọc một cửa hàng nhanh lên chừng mười tám lần, bởi zone map khi đó bỏ qua được 669 khối trên 670.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Also note your write times: the sorted tiny-group file is the slowest to produce, minutes at full scale. And look at the maps themselves — query the metadata for the min and max of store_id per group and you will see tight ranges like group 0 covering stores 1 to 16, group 1 covering 16 to 22.',
                'Cũng nhớ để ý thời gian ghi: cái file vừa khối nhỏ vừa sắp xếp là file lâu tạo ra nhất, ở scale full thì mất hàng phút. Và hãy nhìn thẳng vào mấy cái zone map: truy vấn phần metadata để lấy giá trị nhỏ nhất và lớn nhất của store_id theo từng khối, bạn sẽ thấy những khoảng rất hẹp, kiểu khối số 0 phủ cửa hàng 1 tới 16, khối số 1 phủ 16 tới 22.',
              ),
            },
          ],
        },
        {
          title: bi('The same mechanism inside your lake', 'Cũng cơ chế đó, ngay bên trong lake của bạn'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'At full scale, rewrite the 06-19 spike partition twice — plain, and sorted by store_id, both at a sane row-group size — then bench the one-store filter on each. One dev machine: about 17 ms becomes about 6 ms, with 29 of 30 groups skipped.',
                'Ở scale full, hãy ghi lại partition của ngày cao điểm 06-19 hai lần, một lần để nguyên và một lần sắp theo store_id, cả hai dùng kích thước row group hợp lý, rồi đo câu lọc một cửa hàng trên từng file. Trên một máy phát triển: chừng 17 ms còn chừng 6 ms, với 29 khối trên 30 được bỏ qua.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'A small-scale day is a single row group, so within-day sorting cannot help there at all — make sure you know why before you conclude sorting is useless. A full-scale day is about 1.2 million rows, which is roughly ten groups, and ten is enough for skipping to mean something.',
                'Một ngày ở scale small chỉ vừa đúng một row group, nên sắp xếp bên trong ngày đó hoàn toàn không giúp được gì — hãy chắc là bạn hiểu vì sao trước khi kết luận rằng sắp xếp là vô ích. Một ngày ở scale full có chừng 1,2 triệu dòng, tức khoảng mười khối, và mười khối là đủ để việc bỏ qua bắt đầu có ý nghĩa.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'This is why a partition rewrite job — your A09 swap — would add a sort by store_id if store-filtered queries are the hot path. You can only physically sort one way, so spend it on your hottest filter, and write down the reason.',
                'Đây chính là lý do một công việc ghi lại partition, tức cái swap ở A09, sẽ thêm lệnh sắp theo store_id nếu mấy câu query lọc theo cửa hàng là đường chạy nóng nhất. Về mặt vật lý bạn chỉ sắp được theo một chiều, nên hãy dành nó cho phép lọc chạy nhiều nhất, và ghi lại lý do.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Both tables in the journal, zone maps inspected, spike-partition sort measured',
          'Cả hai bảng đã nằm trong journal, đã xem tận mắt các zone map, và đã đo lần sắp xếp trên partition ngày cao điểm',
        ),
        bi(
          'One sentence: when would a tiny row-group size ever be right?',
          'Một câu trả lời: có khi nào đặt kích thước row group thật nhỏ lại là đúng không?',
        ),
      ],
    },

    /* ═══════════════ T7 ═══════════════ */
    {
      id: 'a14-t7',
      num: 7,
      title: bi('Same query, different day', 'Cùng một câu query, khác ngày'),
      goal: bi(
        'Cost is a function of the data, not just the SQL.',
        'Chi phí là một hàm của dữ liệu chứ không chỉ của câu SQL.',
      ),
      steps: [
        {
          title: bi('A normal day against a spike day', 'Một ngày thường đấu với một ngày cao điểm'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Take your fixed step-1 slice, written as CREATE OR REPLACE so it benches cleanly, and run it for 2026-06-05 and for 2026-06-19 at both scales. Put the two row counts from the manifests next to the two timings.',
                'Lấy phép cắt lát ở bước 1 sau khi đã sửa, viết thành CREATE OR REPLACE để đo cho gọn, rồi chạy nó cho ngày 2026-06-05 và ngày 2026-06-19 ở cả hai scale. Đặt hai con số dòng lấy từ bản kê khai ngay cạnh hai con số thời gian.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'At small scale the two land close together — one dev machine saw about 100 versus 120 ms despite three times the rows. At full scale the truth comes out: roughly 110 versus 350 ms, the clean threefold ratio the manifests predict.',
                'Ở scale small thì hai con số nằm sát nhau: trên một máy phát triển là chừng 100 so với 120 ms, dù số dòng gấp ba. Còn ở scale full thì sự thật lộ ra: chừng 110 so với 350 ms, đúng tỉ lệ gấp ba mà bản kê khai dự báo.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Two lessons, both worth writing down. Small scale ranks your problems but cannot size them, because fixed overhead — listing a couple of hundred lake files, planning the query — swamps the actual work; so confirm at full scale before promising anyone a number. And budget a daily job for its worst days, not its average day, which is A12\'s straggler problem wearing different clothes.',
                'Có hai bài học, cả hai đều đáng ghi lại. Một là scale small xếp hạng được các vấn đề nhưng không đo được độ lớn của chúng, vì phần phí cố định như liệt kê vài trăm file trong lake và lập kế hoạch truy vấn đã lấn át phần việc thật; nên hãy xác nhận ở scale full trước khi hứa với ai một con số. Hai là hãy tính hạn mức cho một job chạy hằng ngày theo những ngày nặng nhất chứ không theo ngày trung bình, mà đây chính là chuyện việc chậm nhất kéo cả nhóm ở A12 mặc một bộ đồ khác.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Both ratios plus the two lessons in the journal, with the manifest row counts next to them',
          'Cả hai tỉ lệ và hai bài học đã nằm trong journal, kèm số dòng theo bản kê khai đặt ngay bên cạnh',
        ),
      ],
    },

    /* ═══════════════ T8 ═══════════════ */
    {
      id: 'a14-t8',
      num: 8,
      title: bi('Write your performance checklist', 'Viết danh sách kiểm hiệu năng của riêng bạn'),
      goal: bi(
        'One page you would hand the next junior, built from your own numbers.',
        'Một trang giấy bạn có thể đưa cho người mới tiếp theo, dựng từ chính số liệu của mình.',
      ),
      steps: [
        {
          title: bi('Four sections, from the journal and not from memory', 'Bốn mục, lấy từ journal chứ không lấy từ trí nhớ'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Before you touch anything: take a baseline with per-step timings, and have the equality check written before the first fix. The usual suspects, in the order you found them: row-by-row Python, missing partition filters, SELECT *, needless DISTINCT and ORDER BY and joins, bad row-group sizes.',
                'Mục một, trước khi đụng vào bất cứ thứ gì: lấy một con số mốc có đo từng bước, và viết sẵn phép kiểm bằng nhau trước cả lần sửa đầu tiên. Mục hai, những nghi phạm quen mặt, xếp theo đúng thứ tự bạn đã tìm ra chúng: vòng lặp Python chạy từng dòng, thiếu phép lọc theo cột partition, SELECT *, mấy phép DISTINCT với ORDER BY với join thừa, và kích thước row group đặt sai.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'How to verify: the bench harness, EXPLAIN ANALYZE, the Scanning Files line, the profile JSON. When to stop: fast enough is a business number, not an ego number.',
                'Mục ba, kiểm chứng bằng cách nào: cái khung đo thời gian, lệnh EXPLAIN ANALYZE, dòng báo số file được quét, và bản hồ sơ dạng JSON. Mục bốn, khi nào thì dừng: đủ nhanh là một con số nghiệp vụ chứ không phải một con số để tự hào.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Write it from the journal, not from memory, and put at least eight of your own measured numbers in it. A checklist with numbers in it is something a junior can trust; a checklist of advice is something they will nod at and ignore.',
                'Hãy viết nó từ journal chứ đừng viết từ trí nhớ, và đặt vào đó ít nhất tám con số bạn đã tự đo. Một danh sách có số liệu là thứ người mới tin được; còn một danh sách toàn lời khuyên là thứ họ gật đầu rồi bỏ qua.',
              ),
            },
          ],
        },
        {
          title: bi('Stretch goals', 'Phần mở rộng'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'What does the optimizer buy? Turn it off, re-bench the cast filter and a LEFT JOIN, then turn it back on. The ratio is work it does for free on every query you have ever written.',
                'Optimizer mua về cho bạn những gì? Hãy tắt nó đi, đo lại câu lọc dùng phép ép kiểu và một câu LEFT JOIN, rồi bật lại. Tỉ lệ giữa hai bên chính là phần việc nó làm miễn phí cho bạn ở mọi câu query bạn từng viết.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Sort trade-offs are real. Rebuild the sorted file ordered by customer_id instead, then bench a store filter and a customer filter on both sorted files. One physical order, two query patterns — write the design note that comes out of it.',
                'Chuyện phải đánh đổi khi sắp xếp là có thật. Hãy dựng lại cái file đã sắp nhưng lần này sắp theo customer_id, rồi đo một câu lọc theo cửa hàng và một câu lọc theo khách hàng trên cả hai file. Một thứ tự vật lý, hai kiểu truy vấn — hãy viết ra bản ghi chú thiết kế rút ra từ đó.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Profile your real pipeline. Wrap your A11 per-day runner\'s main query with the JSON profiler, land the date, operator type and operator timing as rows in an ops table, and find your top three operators across a week.',
                'Lập hồ sơ cho chính pipeline thật của bạn. Hãy bọc câu query chính trong runner theo ngày của A11 bằng bộ profiler dạng JSON, ghi ngày, loại toán tử và thời gian của toán tử thành từng dòng vào một bảng trong ops, rồi tìm ra ba toán tử đứng đầu trong một tuần.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Cleanup is part of the Definition of Done: remove the experiment folders under both the full-scale data root and its small twin. Task 6 alone leaves about 8 GB behind.',
                'Việc dọn dẹp nằm trong danh sách hoàn thành: xoá các thư mục thí nghiệm ở cả thư mục dữ liệu scale full lẫn bản small của nó. Riêng Task 6 đã để lại chừng 8 GB.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'work/perf_checklist.md exists with at least eight of your own measured numbers in it',
          'File work/perf_checklist.md đã có, với ít nhất tám con số do chính bạn đo nằm trong đó',
        ),
        bi(
          'Experiment folders cleaned up at both scales',
          'Đã dọn các thư mục thí nghiệm ở cả hai scale',
        ),
      ],
    },
  ],
}