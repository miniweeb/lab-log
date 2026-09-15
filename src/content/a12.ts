import type { AssignmentSpec } from '../types'
import { bi } from '../types'
import { a12Terms, a12Theory } from './a12.theory'

export const a12: AssignmentSpec = {
  id: 'a12',
  code: 'A12',
  title: bi('Parallelization: 69 days on 8 cores', 'Chạy song song: 69 ngày trên 8 lõi'),
  summary: bi(
    'Turn the A11 backfill from tens of minutes into a few, using a pool of processes that stays inside a budget you worked out on paper first. The math is the lesson; the code follows from it.',
    'Rút lần backfill của A11 từ hàng chục phút xuống còn vài phút, bằng một nhóm tiến trình nằm gọn trong phần ngân sách máy mà bạn tính ra giấy trước. Phép tính mới là bài học, còn code thì đi theo sau nó.',
  ),
  estHours: 4,
  difficulty: 3,
  outcome: bi(
    'You can size a pool against the cores and RAM you actually have, explain why workers write Parquet while exactly one process writes the database, recognise oversubscription and memory overcommit by what they look like on a resource monitor, and say out loud when parallelizing is the wrong move.',
    'Sau bài này bạn tính được quy mô nhóm tiến trình dựa trên số lõi và lượng RAM thật sự có, giải thích được vì sao các tiến trình con chỉ ghi Parquet trong khi đúng một tiến trình được ghi vào database, nhận ra được thế nào là đặt quá tay số luồng và hứa quá tay bộ nhớ chỉ bằng cách nhìn cửa sổ theo dõi tài nguyên, và nói ra được khi nào thì chạy song song là nước đi sai.',
  ),
  theory: a12Theory,
  terms: a12Terms,
  tasks: [
    /* ═══════════════ T0 — SETUP ═══════════════ */
    {
      id: 'a12-t0',
      title: bi('Setup', 'Chuẩn bị'),
      goal: bi(
        'Two terminals, a resource monitor, and one number from yesterday.',
        'Hai terminal, một cửa sổ theo dõi tài nguyên, và một con số từ hôm qua.',
      ),
      steps: [
        {
          title: bi('What you need in place', 'Những thứ phải có sẵn'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'A11 done, with the full backfill green and its wall-clock written in your journal — that number is what everything today is measured against. All 69 raw files at both scales, and your A10 per-era canonical staging.',
                'Bạn cần đã xong A11, với lần backfill toàn bộ chạy xanh và thời gian chạy của nó đã ghi trong journal, vì mọi thứ hôm nay đều đem so với con số đó. Ngoài ra cần đủ 69 file thô ở cả hai scale, và phần canonical staging theo era từ A10.',
              ),
            },
            {
              kind: 'code',
              lang: 'powershell',
              body: `(Get-ChildItem "$env:ETL_LAB_DATA\\small\\raw\\orders\\orders_*.csv").Count   # 69
(Get-ChildItem "$env:ETL_LAB_DATA\\raw\\orders\\orders_*.csv").Count         # 69`,
            },
            {
              kind: 'text',
              body: bi(
                'Open Task Manager on the Performance tab, and keep BOTH the CPU and the Memory graph visible — today several tasks are read off those two graphs, not off a number your script prints.',
                'Mở Task Manager ở tab Performance, và để nhìn thấy CẢ biểu đồ CPU lẫn biểu đồ bộ nhớ, vì hôm nay có mấy task mà kết quả phải đọc từ hai biểu đồ đó chứ không phải từ con số script in ra.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'The usual SET memory_limit=\'8GB\'; SET threads=8; is a budget for ONE process. Today you split it: every worker sets its own smaller share. Leaving that line as-is inside a worker is the mistake Task 6 has you make on purpose.',
                'Hai dòng quen thuộc SET memory_limit=\'8GB\' và SET threads=8 là ngân sách cho MỘT tiến trình. Hôm nay bạn phải chia nó ra, mỗi tiến trình con tự đặt phần nhỏ hơn của mình. Để nguyên hai dòng đó bên trong một worker chính là lỗi mà Task 6 sẽ bắt bạn cố tình mắc.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Develop on small; go to full scale only where a task says so.',
                'Hãy làm ở scale small trước, và chỉ chuyển sang full ở những task có nói rõ.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          '69 raw files at both scales; the A11 baseline wall-clock is written down and visible',
          'Đủ 69 file thô ở cả hai scale, và thời gian chạy mốc của A11 đã được ghi ra và nhìn thấy được',
        ),
      ],
    },

    /* ═══════════════ T1 ═══════════════ */
    {
      id: 'a12-t1',
      num: 1,
      title: bi('Do the budget math first', 'Tính ngân sách máy trước đã'),
      goal: bi(
        'Ten minutes on paper, before a single line of code.',
        'Mười phút làm trên giấy, trước khi viết một dòng code nào.',
      ),
      steps: [
        {
          title: bi('Fill the table', 'Điền bảng'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Six configurations, and for each one: total threads, total promised RAM, and whether it is legal. Keep about 4 GB back for the operating system and whatever else is open. The baseline machine has 16 GB of RAM and 8 cores.',
                'Bảng gồm sáu cấu hình, và với mỗi cấu hình hãy tính: tổng số luồng, tổng lượng RAM đã hứa, và nó có hợp lệ không. Nhớ chừa lại khoảng 4 GB cho hệ điều hành và mấy thứ đang mở. Máy chuẩn có 16 GB RAM và 8 lõi.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `workers × threads mỗi worker                              <= 8 lõi
workers × memory_limit mỗi worker + ~4 GB (OS, trình duyệt)  <= 16 GB

 workers | threads mỗi cái | memory_limit mỗi cái | tổng luồng | tổng RAM hứa | hợp lệ?
       1 |               8 | 8 GB                 |          8 | 8 GB         | có
       2 |               4 | 5 GB                 |          8 | 10 GB        | có
       4 |               2 | 3 GB                 |          8 | 12 GB        | có
       8 |               1 | 1500 MB              |          8 | 12 GB        | có
       8 |               8 | 1500 MB              |         64 | 12 GB        | ?
       8 |               1 | mặc định (~12,8 GB)  |          8 | ~102 GB      | ?`,
            },
            {
              kind: 'why',
              body: bi(
                'Two hard constraints, and both are just addition. Nothing in the system adds these totals up for you — no warning at startup, no error, nothing. That is exactly why the table is a task and not a footnote.',
                'Có hai ràng buộc cứng, mà cả hai chỉ là phép cộng. Không có gì trong hệ thống cộng hộ bạn hai con số tổng đó: không cảnh báo lúc khởi động, không lỗi, không gì cả. Đó chính là lý do cái bảng này là một task chứ không phải một dòng chú thích.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Both of the last two rows come out illegal, but for different reasons — one wastes cores on switching between threads, the other promises RAM that does not exist. Write one sentence for each saying which constraint it breaks.',
                'Hai dòng cuối đều không hợp lệ, nhưng vì hai lý do khác nhau: một dòng phí lõi CPU vào việc chuyển qua lại giữa các luồng, dòng kia hứa một lượng RAM không hề tồn tại. Hãy viết cho mỗi dòng một câu nói rõ nó phá ràng buộc nào.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'The last row is the one that bites in real life, because it is what you get by simply not setting anything. The default memory limit is around 80% of machine RAM — per process, not for the machine.',
                'Dòng cuối mới là dòng hay cắn người ngoài đời thật, bởi đó chính là thứ bạn nhận được khi không đặt gì cả. Hạn mức bộ nhớ mặc định là khoảng 80% RAM của máy, tính cho TỪNG tiến trình chứ không phải cho cả máy.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Table filled, with a one-sentence explanation on each of the last two rows',
          'Bảng đã điền xong, và hai dòng cuối mỗi dòng có một câu giải thích',
        ),
      ],
    },

    /* ═══════════════ T2 ═══════════════ */
    {
      id: 'a12-t2',
      num: 2,
      title: bi('Break the single-writer rule on purpose', 'Cố ý phá luật một-người-ghi'),
      goal: bi(
        'See the lock error once, in a controlled way, so you recognise it forever.',
        'Nhìn thấy lỗi khoá file đúng một lần trong tình huống có kiểm soát, để về sau gặp là nhận ra ngay.',
      ),
      steps: [
        {
          title: bi('Two terminals', 'Hai terminal'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `# Terminal 1 — mở warehouse bản small và giữ 60 giây (giả làm một lần nạp dài)
python -c "import duckdb, os, time; p = os.environ['ETL_LAB_DATA'] + r'\\small\\warehouse\\warehouse.duckdb'; con = duckdb.connect(p); time.sleep(60)"

# Terminal 2 — chạy trong lúc Terminal 1 còn đang ngủ:
python -c "import duckdb, os; p = os.environ['ETL_LAB_DATA'] + r'\\small\\warehouse\\warehouse.duckdb'; duckdb.connect(p)"`,
            },
            {
              kind: 'text',
              body: bi(
                'Terminal 2 dies with an IOException naming the process that holds the file. Then try Terminal 2 again with read_only=True. Paste both errors into your journal.',
                'Terminal 2 chết kèm một lỗi vào ra, trong đó gọi tên đúng tiến trình đang giữ file. Sau đó chạy lại Terminal 2 nhưng thêm read_only=True. Dán cả hai thông báo lỗi vào journal.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'The read-only attempt fails too. That is the part worth seeing with your own eyes — it is not a write-write conflict you can dodge by promising to only read.',
                'Lần mở ở chế độ chỉ đọc cũng hỏng. Đây mới là chỗ đáng nhìn tận mắt, vì nó cho thấy đây không phải xung đột giữa hai bên cùng ghi mà bạn né được bằng cách hứa là chỉ đọc thôi.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'This is not a setting you can tune around, so the design has to move instead: workers never touch the warehouse file at all. They write Parquet, which nothing needs to lock, and one committer process merges afterwards.',
                'Đây không phải một tham số chỉnh được, nên thay vì né thì phải đổi thiết kế: các tiến trình con hoàn toàn không đụng tới file warehouse. Chúng ghi ra Parquet, thứ mà chẳng cần khoá gì cả, rồi sau đó một tiến trình gộp duy nhất đem nhập vào.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Both errors pasted, including the read-only case; you can state the rule from memory',
          'Đã dán cả hai thông báo lỗi, kể cả trường hợp chỉ đọc, và bạn nhắc lại được cái luật đó không cần nhìn tài liệu',
        ),
      ],
    },

    /* ═══════════════ T3 ═══════════════ */
    {
      id: 'a12-t3',
      num: 3,
      title: bi('Build the parallel stage', 'Dựng phần chuẩn bị dữ liệu chạy song song'),
      goal: bi(
        'Workers only stage: raw CSV in, one clean Parquet file per day out.',
        'Các tiến trình con chỉ lo phần chuẩn bị: đọc CSV thô vào, ghi ra mỗi ngày một file Parquet đã làm sạch.',
      ),
      steps: [
        {
          title: bi('The two rules the file layout must obey', 'Hai luật mà cách bố trí file phải tuân theo'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `SCALE = "small"   # cố ý đặt ở cấp module: tiến trình con nạp lại file này
                  # và nhìn thấy nó. Tham số dòng lệnh đã parse thì KHÔNG
                  # tự bay sang tiến trình con được.

def load_day(task):
    """Chạy trong tiến trình con. Phải ở cấp ngoài cùng của file."""
    day, cfg = task
    try:
        con = duckdb.connect()          # database trong bộ nhớ, riêng của worker này
        con.execute(f"SET threads={cfg['threads']}; SET memory_limit='{cfg['mem']}'; "
                    f"SET temp_directory='{tmp_dir(SCALE).as_posix()}';")
        ...
        return day, "OK", time.perf_counter() - t0, ""
    except Exception as e:
        return day, "FAIL", 0.0, f"{type(e).__name__}: {e}"[:200]

if __name__ == "__main__":              # BẮT BUỘC trên Windows
    ...`,
            },
            {
              kind: 'why',
              body: bi(
                'On Windows a child process starts by launching a fresh Python that re-imports your file from the top. So the pool-starting code must sit under the main guard, or every child opens a pool of its own; and the worker function must be at the top level, because the child looks it up by name after re-importing.',
                'Trên Windows, một tiến trình con khởi động bằng cách chạy một Python mới tinh và nạp lại file của bạn từ đầu. Vì vậy đoạn code mở nhóm tiến trình phải nằm dưới khối main, nếu không thì mỗi tiến trình con lại tự mở một nhóm của riêng nó; và hàm worker phải nằm ở cấp ngoài cùng, vì sau khi nạp lại file thì tiến trình con tìm nó theo tên.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Notice the connection is duckdb.connect() with no path — an in-memory database private to that worker. The moment a worker opens the warehouse file you are back in Task 2, and only the first worker survives.',
                'Để ý là lệnh kết nối gọi duckdb.connect() không kèm đường dẫn, tức một database nằm trong bộ nhớ và riêng của tiến trình đó. Chỉ cần một tiến trình con mở file warehouse là bạn quay lại đúng Task 2, và chỉ tiến trình đầu tiên sống sót.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Each worker writes ONE file per day, not PARTITION_BY into the shared lake folder. A day\'s file carries corrections for the previous week, so two workers handling two different delivery days would write into the same order_date folder and silently overwrite each other.',
                'Mỗi tiến trình ghi MỘT file cho một ngày, chứ không dùng PARTITION_BY để ghi vào thư mục lake dùng chung. File của một ngày mang theo bản sửa cho cả tuần trước đó, nên hai tiến trình lo hai ngày giao khác nhau sẽ cùng ghi vào một thư mục order_date và lặng lẽ đè lên kết quả của nhau.',
              ),
            },
          ],
        },
        {
          title: bi('Three runs, in this order', 'Ba lần chạy, theo đúng thứ tự này'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `# 1. chạy nguyên scaffold trên tháng 1
python work\\parallel_runner.py --workers 4 --threads 2 --mem 3GB

# 2. mở rộng sang tháng 2 — các ngày v2/v3 sẽ FAIL, và đó là chủ ý
python work\\parallel_runner.py --workers 4 --threads 2 --mem 3GB --end 2026-08-08`,
            },
            {
              kind: 'text',
              body: bi(
                'Lần chạy thứ nhất: kết quả in ra KHÔNG theo thứ tự ngày, vì nhóm tiến trình trả kết quả ngay khi mỗi tiến trình làm xong phần của nó.',
                'Lần chạy thứ nhất: kết quả in ra KHÔNG theo thứ tự ngày, vì nhóm tiến trình trả kết quả ngay khi mỗi tiến trình làm xong phần của nó.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Lần thứ hai: mọi ngày thuộc v2 và v3 đều in FAIL vì scaffold khai cứng schema của v1, nhưng cả lần chạy vẫn đi tiếp, đúng như A11. Cái FAIL đó là lời nhắc việc phải làm chứ không phải một con lỗi.',
                'Lần thứ hai: mọi ngày thuộc v2 và v3 đều in FAIL vì scaffold khai cứng schema của v1, nhưng cả lần chạy vẫn đi tiếp, đúng như A11. Cái FAIL đó là lời nhắc việc phải làm chứ không phải một con lỗi.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Then the real work: replace the staging SELECT with your A10 per-era canonical staging, taking the era from each day\'s manifest. Keep A10\'s WHERE that drops rows whose timestamp cannot be parsed. Rerun all 69 days and expect zero FAILs.',
                'Rồi tới phần việc thật: thay câu SELECT chuẩn bị dữ liệu bằng phần canonical staging theo era của A10, lấy era từ bản kê khai của từng ngày. Nhớ giữ nguyên mệnh đề WHERE của A10 để loại những dòng có timestamp không parse được. Chạy lại cả 69 ngày và không được có FAIL nào.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'At small scale staging lands 816 rows under the manifest sum — 816, not the 803 you logged in A10, because you are now staging 2026-07-22 as well and its 13 unparseable-timestamp rows join the total.',
                'Ở scale small, phần chuẩn bị dữ liệu ra ít hơn tổng theo bản kê khai đúng 816 dòng. Là 816 chứ không phải 803 như bạn ghi ở A10, vì lần này bạn xử lý cả ngày 2026-07-22, và 13 dòng có timestamp không parse được của nó cộng thêm vào.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'All 69 small days stage green with _data_date on every row',
          'Cả 69 ngày ở scale small đều xanh, và mọi dòng đều có cột _data_date',
        ),
        bi(
          'Journal explains in two sentences why the main guard and the top-level worker function are required on Windows',
          'Journal giải thích trong hai câu vì sao trên Windows bắt buộc phải có khối main và hàm worker ở cấp ngoài cùng',
        ),
      ],
    },

    /* ═══════════════ T4 ═══════════════ */
    {
      id: 'a12-t4',
      num: 4,
      title: bi('The committer: one process, one writer', 'Tiến trình gộp: một tiến trình, một người ghi'),
      goal: bi(
        'Merge the staged files with your A08 strategy: latest updated_at wins per order.',
        'Gộp các file đã chuẩn bị theo chiến lược của A08: với mỗi đơn hàng, bản có updated_at mới nhất thắng.',
      ),
      steps: [
        {
          title: bi('One query, run alone', 'Một câu query, chạy một mình'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `if __name__ == "__main__":
    con = duckdb.connect(str(warehouse_path(SCALE)))     # một người ghi. Chỉ một.
    con.execute("SET memory_limit='8GB'; SET threads=8; "
                f"SET temp_directory='{tmp_dir(SCALE).as_posix()}';")
    con.execute(f"""
        CREATE OR REPLACE TABLE core.orders_par AS
        SELECT * EXCLUDE (rn) FROM (
            SELECT *, row_number() OVER (PARTITION BY order_id
                                         ORDER BY updated_at DESC) AS rn
            FROM read_parquet('{STAGE.as_posix()}/*.parquet')
        ) WHERE rn = 1;""")`,
            },
            {
              kind: 'why',
              body: bi(
                'The committer runs after the pool has exited, alone, so it gets the full 8 GB and all 8 threads. The budget is a rule about what runs at the same moment, not a quota you divide once — a parallel job has phases, and each phase gets the whole machine.',
                'Tiến trình gộp chạy sau khi nhóm kia đã kết thúc, và chạy một mình, nên nó được dùng trọn 8 GB và cả 8 luồng. Ngân sách là quy tắc về những gì đang chạy cùng một thời điểm, chứ không phải một suất chia một lần rồi chịu mãi. Một công việc chạy song song có nhiều pha, và mỗi pha được dùng cả cái máy.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'It builds core.orders_par, not core.orders, so you can compare before you trust it. And the lineage stamp rides along for free: the workers wrote _data_date, the dedupe keeps the winning row, so the committed row carries the delivery date of the copy that actually won.',
                'Nó dựng bảng core.orders_par chứ không phải core.orders, để bạn đối chiếu trước khi tin. Còn phần lineage thì đi kèm sẵn mà không tốn công: các tiến trình con đã ghi cột _data_date, bước khử trùng lặp giữ lại bản thắng, nên dòng cuối cùng mang đúng ngày giao của bản đã thắng.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'The partner column _run_id is absent here because this speed scaffold never registers a run. That is a deliberate limit of today\'s lab, not a schema change: your A11 pipeline, which does register a run and stamps both columns, stays the production path.',
                'Cột đi kèm là _run_id thì ở đây không có, vì bộ khung chạy nhanh này không đăng ký lần chạy nào cả. Đó là giới hạn có chủ ý của bài hôm nay chứ không phải một thay đổi schema: pipeline ở A11, cái vốn có đăng ký lần chạy và đóng dấu cả hai cột, vẫn là đường chạy chính thức.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Small scale: staged = 4,116,024 and core.orders_par = 4,053,208. If your core.orders is slightly smaller than orders_par, that is your A05 gate quarantining rows this quick cleaner keeps — explain the gap using your quarantine counts.',
                'Ở scale small: phần đã chuẩn bị ra 4.116.024 dòng và bảng core.orders_par ra 4.053.208 dòng. Nếu bảng core.orders của bạn nhỏ hơn orders_par một chút thì đó là do cổng kiểm của A05 đã cách ly những dòng mà bộ làm sạch nhanh này giữ lại; hãy giải thích khoảng chênh đó bằng chính số dòng đã cách ly.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'The committer is the only process that opens warehouse.duckdb',
          'Tiến trình gộp là tiến trình duy nhất mở file warehouse.duckdb',
        ),
        bi(
          'Small scale shows staged = 4,116,024 and core.orders_par = 4,053,208, every row stamped with _data_date',
          'Ở scale small ra 4.116.024 dòng đã chuẩn bị và 4.053.208 dòng trong core.orders_par, mọi dòng đều có _data_date',
        ),
      ],
    },

    /* ═══════════════ T5 ═══════════════ */
    {
      id: 'a12-t5',
      num: 5,
      title: bi('The experiment matrix', 'Bảng thí nghiệm'),
      goal: bi(
        'Time the staging phase under four configurations, then three at full scale.',
        'Đo thời gian pha chuẩn bị dữ liệu với bốn cấu hình, rồi ba cấu hình nữa ở scale full.',
      ),
      steps: [
        {
          title: bi('Small scale, all 69 days', 'Scale small, cả 69 ngày'),
          blocks: [
            {
              kind: 'code',
              lang: 'text',
              body: ` workers | threads | mem     | wall (s) | peak RSS (GB)
       1 |       8 | 8GB     |          |
       2 |       4 | 5GB     |          |
       4 |       2 | 3GB     |          |
       8 |       1 | 1500MB  |          |`,
            },
            {
              kind: 'why',
              body: bi(
                'Peak RSS is measured across the whole family — the parent plus every child, sampled a few times a second. That total is what you compare against your RAM, not the limit you asked for.',
                'Đỉnh bộ nhớ phải đo trên cả nhà, tức tiến trình cha cộng tất cả tiến trình con, lấy mẫu vài lần mỗi giây. Chính con số tổng đó mới đem so với RAM của máy, chứ không phải cái hạn mức bạn khai.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'The first run pays for a cold disk cache, so a second run of the same config looks magically faster. Note the run order and repeat each configuration at least once. A proper harness that takes the median of several runs is A14\'s job.',
                'Lần chạy đầu tiên phải trả giá cho việc đĩa còn lạnh, nên chạy lại cùng cấu hình lần thứ hai sẽ trông nhanh như có phép. Hãy ghi lại thứ tự chạy và lặp mỗi cấu hình ít nhất một lần nữa. Việc dựng một bộ đo tử tế lấy trung vị của nhiều lần chạy thuộc về A14.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'At small scale the per-day work is tiny, so process startup blurs the picture — expect roughly 2–3×, not more. For reference, on one dev machine a month-1-only run of 45 days staged in about 12 s at one worker with eight threads, and about 4–6 s with four to eight workers; a 69-day total lands roughly 50% higher. Your numbers will differ; the ratios are what matter.',
                'Ở scale small, phần việc của mỗi ngày rất nhỏ nên thời gian khởi động tiến trình làm mờ bức tranh, và bạn chỉ nên kỳ vọng nhanh hơn chừng 2 tới 3 lần chứ không hơn. Để tham khảo, trên một máy phát triển thì chạy riêng 45 ngày của tháng 1 mất khoảng 12 giây với một tiến trình tám luồng, và khoảng 4 tới 6 giây với bốn tới tám tiến trình; tổng của 69 ngày thì cao hơn chừng một nửa. Số của bạn sẽ khác, nhưng thứ đáng nhìn là tỉ lệ giữa các cấu hình.',
              ),
            },
          ],
        },
        {
          title: bi('Full scale, three configs only', 'Scale full, chỉ ba cấu hình'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Run one worker with eight threads as your reference, plus your two best from the small-scale table. Full staging reads about 24 GB of CSV, so expect the reference run to take on the order of tens of minutes on the baseline machine.',
                'Chạy cấu hình một tiến trình tám luồng làm mốc tham chiếu, cộng hai cấu hình tốt nhất trong bảng ở scale small. Phần chuẩn bị ở scale full phải đọc chừng 24 GB CSV, nên cấu hình mốc mất cỡ hàng chục phút trên máy chuẩn.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Watch Task Manager while it runs: CPU busy during each day\'s SQL, dips between days. The pool configurations should flatten those dips — that flattening is the whole point of a pool, seen on a graph.',
                'Vừa chạy vừa xem Task Manager: CPU bận trong lúc câu SQL của từng ngày chạy, rồi tụt xuống ở quãng giữa hai ngày. Các cấu hình nhiều tiến trình sẽ làm mấy chỗ tụt đó phẳng lại, và chính chỗ phẳng ra đó là toàn bộ ý nghĩa của việc chạy song song, nhìn thấy được trên biểu đồ.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'When you pick a configuration, pick the fastest one that stays inside the budget, not the fastest one overall. A configuration that wins by ten seconds while peaking near your RAM ceiling is a configuration that fails the day someone else opens a browser.',
                'Khi chọn cấu hình, hãy chọn cái nhanh nhất mà vẫn nằm trong ngân sách, chứ không phải cái nhanh nhất nói chung. Một cấu hình thắng được mười giây nhưng đỉnh bộ nhớ sát trần RAM là một cấu hình sẽ hỏng vào ngày có người mở thêm trình duyệt.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Both tables filled with wall-clock and peak RSS',
          'Cả hai bảng đã điền đủ thời gian chạy và đỉnh bộ nhớ',
        ),
        bi(
          'One sentence chooses your configuration and says why',
          'Có một câu chốt lại bạn chọn cấu hình nào và vì sao',
        ),
      ],
    },

    /* ═══════════════ T6 ═══════════════ */
    {
      id: 'a12-t6',
      num: 6,
      title: bi('Break it on purpose', 'Cố ý làm hỏng'),
      goal: bi(
        'Two controlled bad runs on one week of data, so you recognise the shape of each failure.',
        'Hai lần chạy hỏng có kiểm soát trên dữ liệu một tuần, để nhận ra hình dạng của từng kiểu hỏng.',
      ),
      steps: [
        {
          title: bi('Before you start', 'Trước khi bắt đầu'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'One week only, from 2026-06-15 to 2026-06-21, which includes the 06-19 spike. Before the second run: close other apps, save your work, keep Task Manager visible, and be ready with Ctrl+C. Abort if memory passes about 90% and the machine stops responding.',
                'Chỉ chạy một tuần, từ 2026-06-15 tới 2026-06-21, trong đó có ngày cao điểm 06-19. Trước lần chạy thứ hai: đóng các ứng dụng khác, lưu lại việc đang làm, để Task Manager trong tầm mắt, và sẵn sàng bấm Ctrl+C. Hãy dừng ngay nếu bộ nhớ vượt chừng 90% và máy bắt đầu không phản hồi.',
              ),
            },
          ],
        },
        {
          title: bi('Run 1 — too many threads', 'Lần 1 — đặt quá tay số luồng'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `python work\\parallel_runner.py --start 2026-06-15 --end 2026-06-21 ^
    --workers 8 --threads 8 --mem 1500MB        # 64 luồng sẵn sàng chạy trên 8 lõi`,
            },
            {
              kind: 'expect',
              body: bi(
                'CPU pins at 100% while wall-clock lands no better than eight workers with one thread each — often a little worse. Cores do not multiply; the machine just switches between threads more, and switching is not free.',
                'CPU ghim ở 100% trong khi thời gian chạy chẳng khá hơn cấu hình tám tiến trình mỗi cái một luồng, thậm chí còn tệ hơn một chút. Lõi CPU không tự nhân lên, máy chỉ phải chuyển qua lại giữa các luồng nhiều hơn, mà mỗi lần chuyển đều tốn thời gian.',
              ),
            },
          ],
        },
        {
          title: bi('Run 2 — too much promised memory', 'Lần 2 — hứa quá tay bộ nhớ'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `python work\\parallel_runner.py --start 2026-06-15 --end 2026-06-21 ^
    --workers 8 --threads 1 --mem 12GB          # bắt chước việc quên đặt memory_limit`,
            },
            {
              kind: 'text',
              body: bi(
                'Watch the Memory graph climb and the disk churn, and look for spill files appearing in the temp directory. If the run survives politely, write that down too — one week may simply be too small to hit the limits.',
                'Hãy xem biểu đồ bộ nhớ leo lên và đĩa quay liên tục, đồng thời để ý những file tràn xuất hiện trong thư mục tạm. Nếu lần chạy đó vẫn về đích êm đẹp thì cũng ghi lại, vì một tuần dữ liệu có thể đơn giản là quá nhỏ để chạm tới giới hạn.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'The lesson stands either way: nothing checked your total. Eight workers at 12 GB each is a promise of about 96 GB on a 16 GB machine, and no part of the system objected at startup.',
                'Dù kết quả thế nào thì bài học vẫn giữ nguyên: không có gì kiểm con số tổng của bạn cả. Tám tiến trình mỗi cái 12 GB là một lời hứa chừng 96 GB trên một cái máy 16 GB, mà lúc khởi động chẳng bộ phận nào lên tiếng phản đối.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Journal has config, wall-clock, peak RSS and what the resource monitor showed, for both runs',
          'Journal có cấu hình, thời gian chạy, đỉnh bộ nhớ và những gì cửa sổ theo dõi tài nguyên hiện ra, cho cả hai lần chạy',
        ),
      ],
    },

    /* ═══════════════ T7 ═══════════════ */
    {
      id: 'a12-t7',
      num: 7,
      title: bi('The other way: one process, one big query', 'Cách còn lại: một tiến trình, một câu query lớn'),
      goal: bi(
        'Measure the engine\'s own parallelism against your hand-rolled pool.',
        'Đo phần song song mà chính engine tự làm, đem so với nhóm tiến trình bạn tự dựng.',
      ),
      steps: [
        {
          title: bi('Hand it the whole file list', 'Đưa nó cả danh sách file'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `files = [raw_orders_dir(SCALE) / f"orders_{d}.csv"
         for d in daterange("2026-06-01", "2026-07-15")]
file_list = "[" + ", ".join(f"'{f.as_posix()}'" for f in files) + "]"
con.execute(f"""
    COPY (
        WITH typed AS ({typed_select})          -- cùng bộ cleaner, nhưng FROM đọc HẾT file
        SELECT *, CAST(order_ts AS DATE) AS order_date FROM typed
    ) TO '{out.as_posix()}' (FORMAT parquet, PARTITION_BY (order_date),
                             OVERWRITE_OR_IGNORE, ROW_GROUP_SIZE 122880);""")`,
            },
            {
              kind: 'why',
              body: bi(
                'Here PARTITION_BY into a shared folder is safe, and it is worth pausing on why: there is exactly one writer, so no two processes can collide in the same date folder. The danger in Task 3 came from having several writers, not from partitioning itself.',
                'Ở đây việc dùng PARTITION_BY ghi vào một thư mục dùng chung lại an toàn, và đáng dừng lại một chút để hiểu vì sao: chỉ có đúng một người ghi, nên không thể có hai tiến trình va vào cùng một thư mục ngày. Cái nguy hiểm ở Task 3 đến từ chuyện có nhiều người ghi, chứ không đến từ bản thân việc chia thư mục theo ngày.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Look inside the output afterwards: 45 date folders plus one named __HIVE_DEFAULT_PARTITION__, where the rows whose impossible timestamps became NULL dates land. Your real pipeline quarantines those instead, as A05 does.',
                'Sau khi chạy xong hãy ngó vào kết quả: có 45 thư mục theo ngày, cộng thêm một thư mục tên __HIVE_DEFAULT_PARTITION__, chỗ chứa những dòng có timestamp bất khả thi nên ngày ra rỗng. Pipeline thật của bạn thì đưa chúng vào vùng cách ly như A05 đã làm.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'One query handles one schema, so one era; all 69 days means three file lists and three queries. And _data_date stops being a per-day constant here — add filename=true to the read and slice the date out of the file name. A regular expression would work too, but its brace syntax is a landmine inside a Python f-string.',
                'Một câu query chỉ xử lý được một schema, tức một era, nên muốn chạy đủ 69 ngày thì phải có ba danh sách file và ba câu query. Ngoài ra ở đây cột _data_date không còn là một hằng số cho mỗi ngày nữa, nên hãy thêm filename=true vào lệnh đọc rồi cắt lấy phần ngày trong tên file. Dùng biểu thức chính quy cũng được, nhưng cú pháp dấu ngoặc nhọn của nó là một quả mìn khi đặt trong chuỗi f của Python.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'The trade-off is real on both sides. The code is dead simple and the speed is often excellent for pure SQL, but it is all-or-nothing: no per-day retry and no per-day ledger row. In A11\'s vocabulary, this is a restatement rather than a resumable backfill.',
                'Cái được và cái mất ở đây đều rõ. Code thì đơn giản đến mức khó tin và tốc độ thường rất tốt với phần việc thuần SQL, nhưng nó được ăn cả ngã về không: không thử lại được từng ngày và không có dòng riêng cho từng ngày trong sổ ghi các lần chạy. Nói theo cách của A11 thì đây là một lần restatement chứ không phải một lần backfill chạy tiếp được.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Measure on small and full, over the same 45 days as your pool. On one dev machine the single query beat the sequential reference but lost to the eight-worker pool at small scale; at full scale the balance can flip. Measure, do not argue.',
                'Hãy đo ở cả scale small lẫn full, trên đúng 45 ngày mà nhóm tiến trình của bạn đã chạy. Trên một máy phát triển, câu query đơn thắng được cấu hình tuần tự làm mốc nhưng thua nhóm tám tiến trình ở scale small; còn ở scale full thì cán cân có thể lật lại. Cứ đo chứ đừng tranh luận.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Wall-clocks for pool versus single query at both scales are in the journal',
          'Thời gian chạy của nhóm tiến trình và của câu query đơn ở cả hai scale đã nằm trong journal',
        ),
        bi(
          'Two sentences on when you would pick each',
          'Hai câu nói rõ khi nào bạn chọn cách nào',
        ),
      ],
    },

    /* ═══════════════ T8 ═══════════════ */
    {
      id: 'a12-t8',
      num: 8,
      title: bi('Skew: spike days finish last', 'Lệch tải: ngày cao điểm về đích sau cùng'),
      goal: bi(
        'One line of scheduling, measured.',
        'Một dòng code về thứ tự xếp việc, và đem đo.',
      ),
      steps: [
        {
          title: bi('Sort biggest first', 'Sắp việc to lên trước'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'In any full-scale pool run, the per-day lines show 2026-06-19 and 2026-07-11 taking roughly three times a normal day — compare the byte sizes in their manifests. If a spike day starts near the end, everyone else finishes and the whole run waits on one worker.',
                'Trong bất kỳ lần chạy nào ở scale full, mấy dòng kết quả theo ngày cho thấy 2026-06-19 và 2026-07-11 mất chừng gấp ba lần một ngày thường; hãy so kích thước tính bằng byte trong bản kê khai của chúng. Nếu một ngày cao điểm được bắt gần cuối thì mọi ngày khác đã xong hết mà cả lần chạy vẫn phải ngồi chờ một tiến trình.',
              ),
            },
            {
              kind: 'code',
              lang: 'powershell',
              body: `python work\\parallel_runner.py --workers 4 --threads 2 --mem 3GB --order size`,
            },
            {
              kind: 'expect',
              body: bi(
                'Compare against the date-ordered run of the same configuration. Expect a modest but real win — about 25% on one dev machine at small scale.',
                'Đem so với lần chạy cùng cấu hình nhưng xếp theo ngày. Kỳ vọng là nhanh hơn một chút nhưng có thật, trên một máy phát triển thì được chừng 25% ở scale small.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'The order matters because the pool finishes when its slowest task finishes. Starting the big days immediately means the small ones pack into the gaps behind them, instead of one big day being left alone at the end with seven idle cores watching.',
                'Thứ tự có ý nghĩa vì cả nhóm chỉ xong khi việc chậm nhất xong. Bắt mấy ngày to ngay từ đầu thì các ngày nhỏ sẽ lấp vào những khoảng trống phía sau, thay vì để một ngày to nằm lại cuối cùng một mình với bảy lõi ngồi nhìn.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Both timings in the journal plus one sentence on why ordering by size helps',
          'Cả hai con số thời gian đã nằm trong journal, kèm một câu nói vì sao xếp theo kích thước lại giúp được',
        ),
      ],
    },

    /* ═══════════════ T9 ═══════════════ */
    {
      id: 'a12-t9',
      num: 9,
      title: bi('Ship it, then say when not to', 'Đưa vào dùng, rồi nói khi nào thì đừng'),
      goal: bi(
        'The full backfill at your chosen configuration, measured against the A11 baseline.',
        'Chạy lần backfill toàn bộ với cấu hình bạn đã chọn, rồi đem so với mốc của A11.',
      ),
      steps: [
        {
          title: bi('The number', 'Con số'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Stage all 69 full-scale days with your chosen configuration and ordering, then run the committer. Total wall-clock — stage plus commit — goes next to the A11 baseline in your journal.',
                'Chuẩn bị cả 69 ngày ở scale full với cấu hình và thứ tự bạn đã chọn, rồi chạy tiến trình gộp. Tổng thời gian chạy, gồm cả phần chuẩn bị lẫn phần gộp, ghi vào journal ngay cạnh mốc của A11.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Target: at least three times faster than the A11 baseline, shown as arithmetic in the journal.',
                'Mục tiêu là nhanh hơn mốc của A11 ít nhất ba lần, và trình bày bằng phép chia ngay trong journal.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'If you miss the target, check three things in this order. Is the CPU well under full during staging — then you are disk-bound and more workers will not help. Are there too few workers for the budget you have. Or is the committer eating the time: it is one big query, and it needs the full memory and thread budget to itself.',
                'Nếu không đạt mục tiêu thì kiểm ba thứ theo thứ tự này. Một, trong lúc chuẩn bị dữ liệu thì CPU có nằm thấp hơn hẳn mức đầy không; nếu có thì bạn đang nghẽn ở đĩa và thêm tiến trình cũng vô ích. Hai, số tiến trình có ít quá so với ngân sách bạn đang có không. Ba, phần gộp có đang ngốn hết thời gian không, vì nó là một câu query lớn và cần được dùng trọn ngân sách bộ nhớ lẫn số luồng.',
              ),
            },
          ],
        },
        {
          title: bi('One paragraph: when not to parallelize', 'Một đoạn văn: khi nào thì đừng chạy song song'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Five things belong in it. The job is already fast enough, and engineer-hours cost more than machine-minutes. The work is disk or network bound, so more workers only queue on the same bottleneck. The tasks share a writer or depend on each other. One big engine query already parallelizes better than your hand-rolled pool. And the machine is shared, which makes your eight workers somebody else\'s outage.',
                'Đoạn đó nên có năm ý. Một, công việc vốn đã đủ nhanh, mà giờ công của kỹ sư thì đắt hơn mấy phút chạy máy. Hai, phần việc nghẽn ở đĩa hoặc ở mạng, nên thêm tiến trình chỉ là thêm người xếp hàng ở đúng chỗ nghẽn cũ. Ba, các việc dùng chung một người ghi hoặc phụ thuộc lẫn nhau. Bốn, một câu query lớn của engine vốn đã chia việc tốt hơn cái nhóm tiến trình bạn tự dựng. Năm, cái máy là của chung, và tám tiến trình của bạn chính là sự cố của người khác.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Write it now, while you still have the numbers that prove each point. In six months you will remember that the pool was faster; you will not remember that at small scale it was only two to three times faster because process startup ate the gains.',
                'Hãy viết ngay bây giờ, khi bạn còn giữ mấy con số chứng minh cho từng ý. Sáu tháng nữa bạn sẽ chỉ nhớ là chạy song song thì nhanh hơn, chứ không nhớ rằng ở scale small nó chỉ nhanh hơn hai tới ba lần vì thời gian khởi động tiến trình đã ăn mất phần lợi.',
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
                'Retry-aware pool: swap the pool for a process pool executor with as-completed, re-submit failed dates with your A07 backoff wrapper, and have the committer record per-day rows into the run ledger so A11\'s resume flag still works.',
                'Nhóm tiến trình biết thử lại: thay nhóm hiện tại bằng một process pool executor dùng cơ chế báo theo từng việc xong, gửi lại những ngày hỏng qua lớp bọc chờ tăng dần của A07, và cho tiến trình gộp ghi kết quả từng ngày vào sổ ghi các lần chạy để cờ chạy tiếp của A11 vẫn dùng được.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Skew-aware scheduling: give the two spike days a dedicated solo pass at eight threads each, then pool the remaining 67. Measure against biggest-first.',
                'Xếp việc theo mức lệch tải: cho hai ngày cao điểm một lượt chạy riêng, mỗi ngày tám luồng, rồi mới đưa 67 ngày còn lại vào nhóm. Đem so với cách xếp to trước.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Chunking: hand each worker several dates at a time instead of one. Less dispatch overhead, worse stragglers. Measure a chunk size of one against four and eight on small, and explain the shape of the results.',
                'Giao theo lô: mỗi lần đưa cho một tiến trình vài ngày thay vì một ngày. Đổi lại ít tốn công điều phối hơn nhưng việc chậm nhất kéo dài hơn. Hãy đo lô một ngày so với lô bốn và lô tám ở scale small, rồi giải thích hình dạng của kết quả.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'At least 3× speedup shown with numbers against the A11 baseline',
          'Nhanh hơn ít nhất 3 lần so với mốc của A11, có số liệu chứng minh',
        ),
        bi(
          'The "when not to parallelize" paragraph exists in the journal',
          'Đoạn văn về khi nào thì đừng chạy song song đã có trong journal',
        ),
      ],
    },
  ],
}