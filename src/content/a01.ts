import type { AssignmentSpec } from '../types'
import { bi, vi } from '../types'
import { a01Terms, a01Theory } from './a01.theory'

export const a01: AssignmentSpec = {
  id: 'a01',
  code: 'A01',
  title: bi(
    'First contact: explore 24 GB of CSV, load one day to Parquet',
    'Chạm mặt lần đầu: khảo sát 24 GB CSV, nạp một ngày ra Parquet',
  ),
  summary: bi(
    'Interrogate the raw feed before moving a single byte, feel the pandas wall in your own RAM, then convert to Parquet and race it.',
    'Thẩm vấn feed thô trước khi di chuyển một byte nào, tự cảm nhận bức tường pandas bằng chính RAM của mình, rồi chuyển sang Parquet và đua thử.',
  ),
  estHours: 3,
  difficulty: 2,
  outcome: bi(
    'You can look at an unfamiliar feed and state, with evidence, how big it is, how dirty it is, where auto-detect lied to you, and why the whole lab is built on a columnar format.',
    'Bạn nhìn vào một feed lạ và nói được, kèm bằng chứng, nó lớn cỡ nào, bẩn tới đâu, sniffer kiểu đã không đáng tin bạn ở chỗ nào, và vì sao cả lab này được xây trên một định dạng columnar.',
  ),
  theory: a01Theory,
  terms: a01Terms,
  tasks: [
    {
      id: 'a01-t0',
      title: bi('Setup', 'Chuẩn bị'),
      goal: bi('Terminal, Task Manager, journal, and the standard DuckDB connection.', 'Terminal, Task Manager, journal, và kết nối DuckDB chuẩn.'),
      steps: [
        {
          title: bi('Have these open', 'Mở sẵn những thứ này'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'A terminal in the repo root (venv active), Task Manager on the Details tab (find the Memory column — sort by it), and your journal.md. Small scale is <DATA_ROOT>/small/..., full is <DATA_ROOT>/... Rule of the lab: try everything on small first.',
                'Một terminal ở gốc repo với venv đang bật, Task Manager mở tab Details (tìm cột Memory rồi sắp xếp theo nó), và file journal.md của bạn. Quy mô nhỏ nằm ở <DATA_ROOT>/small/..., scale full nằm ở <DATA_ROOT>/... Luật của lab: thử mọi thứ trên small trước.',
              ),
            },
          ],
        },
        {
          title: bi('How to run your scripts', 'Cách chạy script của bạn'),
          blocks: [
            { kind: 'code', lang: 'powershell', body: 'python -m work.a01_explore' },
            {
              kind: 'trap',
              body: bi(
                'The -m puts the repo root on Python\'s import path — the reason "from lib.labpaths import ..." works. python work\\a01_explore.py dies with ModuleNotFoundError, because Python puts the script\'s OWN folder on the path, not the folder you ran it from.',
                'Cờ -m đặt gốc repo vào import path của Python — đó là lý do dòng "from lib.labpaths import ..." chạy được. Còn python work\\a01_explore.py sẽ chết với ModuleNotFoundError, vì Python đặt THƯ MỤC CHỨA SCRIPT vào path chứ không phải thư mục bạn đang đứng khi chạy.',
              ),
            },
          ],
        },
        {
          title: bi('Every DuckDB connection today starts like this', 'Mọi kết nối DuckDB hôm nay đều bắt đầu như sau'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `import duckdb
from lib.labpaths import raw_orders_dir, manifest_dir, tmp_dir

con = duckdb.connect()   # in-memory scratch connection; no database file yet
con.execute("SET memory_limit='8GB'; SET threads=8;")
tmp_dir('full').mkdir(parents=True, exist_ok=True)   # DuckDB won't create missing folders for COPY (Task 6)
con.execute(f"SET temp_directory='{tmp_dir('full').as_posix()}';")`,
            },
            {
              kind: 'why',
              body: bi(
                'The memory limit leaves RAM for the OS. The mkdir line is not optional: DuckDB will not create missing folders when COPY writes in Task 6.',
                'Giới hạn bộ nhớ chừa RAM lại cho hệ điều hành. Dòng mkdir không phải tuỳ chọn: DuckDB sẽ không tự tạo thư mục còn thiếu khi lệnh COPY ghi file ở Task 6.',
              ),
            },
            { kind: 'code', lang: 'powershell', body: '$root = $env:ETL_LAB_DATA        # e.g. F:\\etl_lab' },
          ],
        },
      ],
      accept: [bi('Connection opens and $root resolves', 'Kết nối mở được và biến $root phân giải đúng')],
    },

    {
      id: 'a01-t1',
      num: 1,
      title: bi('Walk the raw folder', 'Đi bộ quanh thư mục raw'),
      goal: bi('Before code: look at what you have.', 'Trước khi viết code: nhìn xem mình đang có gì.'),
      steps: [
        {
          title: bi('List files with sizes', 'Liệt kê file kèm dung lượng'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `Get-ChildItem "$root\\raw\\orders" | Sort-Object Name |
  Format-Table Name, @{n='MB'; e={[math]::Round($_.Length/1MB,1)}}

Get-ChildItem "$root\\raw\\orders" | Measure-Object Length -Sum |
  ForEach-Object { "{0} files, {1:N1} GB" -f $_.Count, ($_.Sum/1GB) }`,
            },
            {
              kind: 'expect',
              body: bi(
                '45 files (2026-06-01 … 2026-07-15) totalling roughly 15–16 GB. The title of this assignment says 24 GB — the rest arrives in A10, when the upstream team ships month 2.',
                '45 file, từ 2026-06-01 tới 2026-07-15, tổng khoảng 15 tới 16 GB. Tiêu đề bài này nói 24 GB — phần còn lại về ở A10, khi đội phía trên giao tháng hai.',
              ),
            },
          ],
        },
        {
          title: bi('Find the two big ones', 'Tìm hai file lớn'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `Get-ChildItem "$root\\raw\\orders" | Sort-Object Length -Descending |
  Select-Object -First 3 Name, @{n='MB'; e={[math]::Round($_.Length/1MB,0)}}`,
            },
            {
              kind: 'code',
              lang: 'text',
              body: `Name                    MB
----                    --
orders_2026-06-19.csv 1057
orders_2026-07-11.csv 1045`,
            },
            {
              kind: 'why',
              body: bi(
                'Those are flash-sale days at roughly 3× normal volume — they will haunt every performance assignment later.',
                'Đó là hai ngày khuyến mãi chớp nhoáng với lượng đơn gấp khoảng ba lần bình thường — chúng sẽ ám mọi bài về hiệu năng về sau.',
              ),
            },
          ],
        },
        {
          title: bi('Pick your day', 'Chọn ngày của bạn'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Any ordinary weekday in June, not a flash-sale day. This doc uses 2026-06-02, and the Verify numbers are for that date — picking the same one makes checking easier.',
                'Một ngày thường trong tháng sáu, không phải ngày khuyến mãi. Tài liệu này dùng 2026-06-02, và các con số ở phần Tự kiểm chứng đều tính cho ngày đó — chọn cùng ngày sẽ dễ reconcile hơn.',
              ),
            },
            {
              kind: 'code',
              lang: 'powershell',
              body: `Get-Content "$root\\raw\\manifest\\orders_2026-06-02.json"
Get-Content "$root\\raw\\orders\\orders_2026-06-02.csv" -TotalCount 3`,
            },
            {
              kind: 'trap',
              body: bi('Do NOT open the CSV in Excel.', 'TUYỆT ĐỐI không mở file CSV bằng Excel.'),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Journal has the file count, total GB, the two flash-sale dates, your chosen day, and its manifest rows and bytes values',
          'Journal ghi số file, tổng dung lượng GB, hai ngày khuyến mãi, ngày bạn chọn, cùng giá trị rows và bytes trong manifest của ngày đó',
        ),
      ],
    },

    {
      id: 'a01-t2',
      num: 2,
      title: bi('Count one day, check it against the manifest', 'Đếm một ngày, reconcile với manifest'),
      goal: bi('The simplest possible reconciliation.', 'Phép reconcile đơn giản nhất có thể.'),
      steps: [
        {
          title: bi('Both scales in one loop', 'Cả hai quy mô trong một vòng lặp'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `import json
from lib.labpaths import raw_orders_dir, manifest_dir

DAY = "2026-06-02"
for scale in ("small", "full"):        # small runs instantly; full takes seconds
    csv_path = raw_orders_dir(scale) / f"orders_{DAY}.csv"
    n = con.execute("SELECT count(*) FROM read_csv(?)", [str(csv_path)]).fetchone()[0]
    claimed = json.loads((manifest_dir(scale) / f"orders_{DAY}.json").read_text())
    print(f"{scale:5}: counted {n:,}  manifest says {claimed['rows']:,}  "
          f"match={n == claimed['rows']}")`,
            },
            {
              kind: 'expect',
              body: bi(
                'Both scales must match exactly. Note how fast the full-scale count is — ~350 MB in about a second. Hold that thought for Task 4.',
                'Cả hai quy mô phải khớp chính xác. Để ý phép đếm ở scale full nhanh thế nào — khoảng 350 MB trong chừng một giây. Giữ ý nghĩ đó lại cho Task 4.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Both scales print match=True', 'Cả hai quy mô đều in match=True'),
        bi(
          'You can say in one sentence why this check will run after EVERY load for the rest of the lab',
          'Bạn nói được trong một câu vì sao phép kiểm tra này sẽ chạy sau MỌI lần nạp trong suốt phần còn lại của lab',
        ),
      ],
    },

    {
      id: 'a01-t3',
      num: 3,
      title: bi('DESCRIBE and SUMMARIZE: interrogate the schema', 'DESCRIBE và SUMMARIZE: khảo sát schema'),
      goal: bi('Let DuckDB guess the schema, then catch the guess being wrong.', 'Để DuckDB đoán schema, rồi bắt quả tang nó đoán sai.'),
      steps: [
        {
          title: bi('Three things deserve suspicion', 'Ba thứ đáng nghi ngờ'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: "DESCRIBE SELECT * FROM read_csv('<DATA_ROOT>/small/raw/orders/orders_2026-06-02.csv');",
            },
            {
              kind: 'glossary',
              items: [
                {
                  term: 'customer_id → DOUBLE',
                  means: bi(
                    'Customer ids with decimal points? Re-read with all_varchar=true and count rows WHERE customer_id LIKE \'%.0\'. This float-form ("47593.0") is classic damage from a producer that round-tripped ids through a float type — Excel is a common culprit.',
                    'Mã khách hàng mà có phần thập phân? Hãy đọc lại với all_varchar=true rồi đếm số dòng WHERE customer_id LIKE \'%.0\'. Dạng số thực này ("47593.0") là loại hư hại kinh điển do một producer cho mã đi vòng qua kiểu số thực — Excel là thủ phạm hay gặp.',
                  ),
                },
                {
                  term: 'order_ts stays VARCHAR',
                  means: bi(
                    'While updated_at becomes a timestamp. If a timestamp-looking column is inferred as text, some values did not parse.',
                    'Trong khi updated_at thì thành kiểu timestamp. Nếu một cột trông như thời gian lại bị suy ra là văn bản, nghĩa là có những giá trị không phân tích được.',
                  ),
                },
                {
                  term: 'items and meta are VARCHAR',
                  means: bi(
                    'JSON stuffed into CSV fields. Leave them as text for now; unpacking them properly is A04\'s whole job.',
                    'JSON bị nhét vào các ô CSV. Cứ để chúng ở dạng văn bản đã; bung chúng ra cho đàng hoàng là toàn bộ công việc của A04.',
                  ),
                },
              ],
            },
            {
              kind: 'why',
              body: bi(
                'A few thousandths of the rows are enough to flip auto-detect\'s guess for the ENTIRE column — this is why pipelines do not sniff. The authoritative answers to what each column should be live in the data contract in contracts/, which you study in A06.',
                'Chỉ vài phần nghìn số dòng là đủ để sniffer đoán sai cho CẢ CỘT — đây chính là lý do pipeline không dò kiểu. Câu trả lời chính thức về việc mỗi cột đáng lẽ phải là gì thì nằm trong data contract ở thư mục contracts/, và bạn sẽ nghiên cứu nó ở A06.',
              ),
            },
          ],
        },
        {
          title: bi('Now profile the day', 'Giờ lập hồ sơ cho ngày đó'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: "SUMMARIZE SELECT * FROM read_csv('<DATA_ROOT>/small/raw/orders/orders_2026-06-02.csv');",
            },
            {
              kind: 'text',
              body: bi(
                'SUMMARIZE computes min/max/uniques/nulls per column. Hunt for stories in the output and write your findings down.',
                'Lệnh SUMMARIZE tính giá trị nhỏ nhất, lớn nhất, số giá trị phân biệt và số NULL cho từng cột. Hãy săn tìm những câu chuyện trong phần kết quả và ghi lại những gì bạn tìm ra.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'order_ts min and max are both lies-in-plain-sight: the min starts with 01/06/2026 (a day-first format, sorting first AS TEXT) and the max is an impossible date. order_id min is below your day\'s id range — ids encode the day (days since 2026-01-01 × 10,000,000 + sequence, so 2026-06-02 starts at 1,520,000,000), so ids from the PREVIOUS day are in this file. The manifest calls them late_rows. And customer_id null_percentage is not 0.00 — some orders have no customer id at all.',
                'Giá trị nhỏ nhất và lớn nhất của order_ts đều là những lời không đáng tin lộ rõ: nhỏ nhất bắt đầu bằng 01/06/2026 (định dạng ngày-trước, nên đứng đầu khi sắp xếp NHƯ VĂN BẢN) và lớn nhất là một ngày bất khả thi. Giá trị order_id nhỏ nhất lại thấp hơn khoảng mã của ngày bạn chọn — mã đơn hàng mã hoá luôn cả ngày (số ngày kể từ 2026-01-01 nhân 10.000.000 cộng số thứ tự, nên 2026-06-02 bắt đầu từ 1.520.000.000), nghĩa là trong file này có cả mã của NGÀY TRƯỚC. Manifest gọi chúng là late_rows. Và tỉ lệ NULL của customer_id không phải 0,00 — có những đơn hàng không hề có mã khách hàng.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Park the late_rows thought; it becomes the core problem of A02 and A08. Then run both statements again on the full file — same shapes, ~20× the rows.',
                'Cứ gác ý nghĩ về late_rows lại đã; nó sẽ trở thành bài toán cốt lõi của A02 và A08. Sau đó chạy lại cả hai câu lệnh trên file đầy đủ — cùng hình dạng, số dòng gấp khoảng 20 lần.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Journal has at least three written observations, including an explanation of the DOUBLE inference in your own words',
          'Journal có ít nhất ba quan sát được viết ra, trong đó có lời giải thích về việc suy ra kiểu DOUBLE bằng chính lời của bạn',
        ),
      ],
    },

    {
      id: 'a01-t4',
      num: 4,
      title: bi('The pandas trap', 'Cái bẫy pandas'),
      goal: bi('The lesson you feel in your hardware.', 'Bài học mà bạn cảm nhận được bằng chính máy của mình.'),
      steps: [
        {
          title: bi('Load ONE full-scale day, with a guard', 'Nạp MỘT ngày ở scale full, có guard'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `import os, time
import pandas as pd
import psutil
from lib.labpaths import raw_orders_dir

GB = 1024 ** 3
if psutil.virtual_memory().available < 6 * GB:
    raise SystemExit("Less than 6 GB RAM free - close some apps first.")

csv_path = raw_orders_dir("full") / "orders_2026-06-02.csv"
proc = psutil.Process(os.getpid())

print(f"RSS before: {proc.memory_info().rss / GB:.2f} GB")
t0 = time.perf_counter()
df = pd.read_csv(csv_path)                    # whole file -> RAM, no way around it
print(f"loaded {len(df):,} rows in {time.perf_counter() - t0:.0f}s")
print(f"RSS after:  {proc.memory_info().rss / GB:.2f} GB")
print(f"DataFrame alone: {df.memory_usage(deep=True).sum() / GB:.2f} GB")`,
            },
            {
              kind: 'expect',
              body: bi(
                'Watch python.exe in Task Manager while it runs — you will see the memory climb as the file parses. On the baseline machine expect the process to end up somewhere around 0.5–2 GB for this one 350 MB file. Either way the ratio is the point: in RAM, the parsed table costs about 2× or more its size on disk.',
                'Theo dõi python.exe trong Task Manager trong lúc nó chạy — bạn sẽ thấy bộ nhớ leo lên khi file được phân tích. Trên máy chuẩn, process thường dừng ở khoảng 0,5 tới 2 GB cho đúng một file 350 MB này. Dù sao thì tỉ lệ mới là điều đáng nhớ: trong RAM, bảng đã parse tốn khoảng gấp đôi trở lên so với kích thước của nó trên đĩa.',
              ),
            },
          ],
        },
        {
          title: bi('Now the arithmetic — journal, not code', 'Giờ tới phép tính — viết vào journal, không phải chạy code'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'Month 1 is ~15.7 GB of CSV. At ≥2× on-disk size, loading all 45 files pandas-style needs 30+ GB of RAM. The machine has 16 GB. When month 2 arrives (~24 GB total), it is 45+ GB. This is not "slow" — it is impossible, and the OS will kill or thrash the process long before the end.',
                'Tháng một là khoảng 15,7 GB CSV. Với tỉ lệ từ gấp đôi trở lên so với kích thước trên đĩa, nạp cả 45 file theo kiểu pandas cần hơn 30 GB RAM. Máy chỉ có 16 GB. Khi tháng hai về, tổng khoảng 24 GB, thì con số là hơn 45 GB. Đây không phải chuyện "chậm" — đây là bất khả thi, và hệ điều hành sẽ giết hoặc làm process vật vã từ rất lâu trước khi nó xong.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Do not RUN the estimate. Loading 45 files into one process will freeze or kill your machine. The guard at the top of the script exists for a reason; the estimate is arithmetic, not an experiment.',
                'Đừng CHẠY ước lượng đó. Nạp 45 file vào một process sẽ làm đơ hoặc giết máy bạn. Cái guard ở đầu script có lý do của nó; ước lượng là một bài toán số học, không phải một thí nghiệm.',
              ),
            },
          ],
        },
        {
          title: bi('Contrast with streaming', 'Reconcile với xử lý streaming'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `import duckdb
con = duckdb.connect()
con.execute("SET memory_limit='8GB'; SET threads=8;")
t0 = time.perf_counter()
n = con.execute("SELECT count(*) FROM read_csv(?)", [str(csv_path)]).fetchone()[0]
print(f"DuckDB counted {n:,} rows in {time.perf_counter() - t0:.1f}s")
print(f"RSS now: {proc.memory_info().rss / GB:.2f} GB")`,
            },
            {
              kind: 'expect',
              body: bi(
                'Same file, same machine: RSS barely moves — tens to ~200 MB — because DuckDB never holds the whole file. Chunks stream through and are discarded. This is why the rest of the lab is built on DuckDB, and pandas appears only when a trap is the lesson.',
                'Cùng file, cùng máy: bộ nhớ gần như không nhúc nhích, chỉ vài chục tới khoảng 200 MB, vì DuckDB không bao giờ giữ cả file. Các khối dữ liệu chảy qua rồi bị vứt bỏ. Đây là lý do phần còn lại của lab được xây trên DuckDB, còn pandas chỉ xuất hiện khi chính cái bẫy mới là bài học.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Journal has pandas peak RSS (from Task Manager) and DataFrame size, the DuckDB RSS for comparison, and your written 45-file estimate with the conclusion',
          'Journal ghi mức bộ nhớ đỉnh của pandas lấy từ Task Manager cùng kích thước DataFrame, mức bộ nhớ của DuckDB để so sánh, và ước lượng cho 45 file kèm kết luận',
        ),
      ],
    },

    {
      id: 'a01-t5',
      num: 5,
      title: bi('Explicit schema: read like a production pipeline', 'Khai schema tường minh: đọc như một pipeline thật'),
      goal: bi('Stop letting the engine guess.', 'Thôi để engine đoán.'),
      steps: [
        {
          title: bi("The lab's canonical v1 read", 'Lệnh đọc chuẩn cho kỷ nguyên v1 của lab'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT count(*) FROM read_csv('<DATA_ROOT>/small/raw/orders/orders_2026-06-02.csv',
    header=true,
    columns={'order_id':'BIGINT','customer_id':'BIGINT','store_id':'INTEGER',
             'order_ts':'VARCHAR','updated_at':'TIMESTAMP','status':'VARCHAR',
             'payment_method':'VARCHAR','order_total':'VARCHAR',
             'items':'VARCHAR','meta':'VARCHAR'});`,
            },
            {
              kind: 'text',
              body: bi(
                'You will reuse this exact form in A02. Two deliberate choices to understand, not memorize.',
                'Bạn sẽ dùng lại đúng dạng này ở A02. Có hai lựa chọn có chủ đích cần HIỂU, không phải học thuộc.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'customer_id is declared BIGINT. The reader converts the float-forms ("47593.0" → 47593) and turns empties into NULL. The column is a proper id again — auto-detect\'s DOUBLE mistake is gone. Full id cleanup rules, including orphans, are A03\'s.',
                'Cột customer_id được khai BIGINT. Trình đọc chuyển đổi các dạng số thực ("47593.0" thành 47593) và biến ô rỗng thành NULL. Cột này lại là một mã đàng hoàng — lỗi DOUBLE của sniffer đã biến mất. Toàn bộ quy tắc dọn dẹp mã, kể cả các mã mồ côi, thuộc về A03.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'order_ts and order_total are declared VARCHAR ON PURPOSE. They contain dirty values; if you declared TIMESTAMP or DECIMAL the read would fail or lose rows. Production habit: land dirty columns as text, clean them in a staging step (A03), so the raw read never silently drops data.',
                'Hai cột order_ts và order_total được khai VARCHAR CÓ CHỦ ĐÍCH. Chúng chứa giá trị bẩn; nếu bạn khai TIMESTAMP hay DECIMAL thì lệnh đọc sẽ hỏng hoặc mất dòng. Thói quen của môi trường thật: đưa cột bẩn vào ở dạng văn bản, cleaning chúng ở bước staging tại A03, để lệnh đọc thô không bao giờ âm thầm đánh rơi dữ liệu.',
              ),
            },
          ],
        },
        {
          title: bi('Measure how much dirt you just protected yourself from', 'Đo xem bạn vừa tự bảo vệ mình khỏi bao nhiêu rác'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT count(*) FROM read_csv('<DATA_ROOT>/small/raw/orders/orders_2026-06-02.csv',
    header=true, columns={...same as above...})
WHERE TRY_CAST(order_ts AS TIMESTAMP) IS NULL;`,
            },
            {
              kind: 'glossary',
              items: [
                {
                  term: 'TRY_CAST',
                  means: bi(
                    'Returns NULL instead of erroring when a cast fails — your main tool for probing dirty columns.',
                    'Trả về NULL thay vì báo lỗi khi cast thất bại — công cụ chính để dò các cột bẩn.',
                  ),
                },
              ],
            },
            {
              kind: 'expect',
              body: bi(
                'Roughly 0.4% of rows. Look at 5 offending values with a LIMIT 5 variant: you will see day-first dates and the impossible date from Task 3. Repeat on the full file, and try the same probe on order_total too.',
                'Khoảng 0,4% số dòng. Xem thử 5 giá trị có vấn đề bằng một biến thể có LIMIT 5: bạn sẽ thấy các ngày ở định dạng ngày-trước và cái ngày bất khả thi từ Task 3. Làm lại trên file đầy đủ, và thử luôn phép dò tương tự trên cột order_total.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Explicit-schema count still equals the manifest for both scales', 'Phép đếm với schema tường minh vẫn bằng manifest ở cả hai quy mô'),
        bi(
          'Journal has the dirty order_ts count for both scales with two example values',
          'Journal ghi số dòng order_ts bẩn ở cả hai quy mô kèm hai giá trị ví dụ',
        ),
      ],
    },

    {
      id: 'a01-t6',
      num: 6,
      title: bi('Load one day to Parquet and race it', 'Nạp một ngày ra Parquet rồi đua thử'),
      goal: bi('CSV text in, columnar typed file out — then measure the difference.', 'Văn bản CSV đi vào, file columnar và có kiểu đi ra — rồi đo khác biệt.'),
      steps: [
        {
          title: bi('Convert your day', 'Chuyển đổi ngày của bạn'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `COPY (
    SELECT * FROM read_csv('<DATA_ROOT>/raw/orders/orders_2026-06-02.csv',
        header=true,
        columns={'order_id':'BIGINT','customer_id':'BIGINT','store_id':'INTEGER',
                 'order_ts':'VARCHAR','updated_at':'TIMESTAMP','status':'VARCHAR',
                 'payment_method':'VARCHAR','order_total':'VARCHAR',
                 'items':'VARCHAR','meta':'VARCHAR'})
) TO '<DATA_ROOT>/tmp/orders_2026-06-02.parquet' (FORMAT parquet);`,
            },
            {
              kind: 'trap',
              body: bi(
                'Write it to the scratch area. The real lake with its partition layout is A02\'s job — and a sync client hashing your 24 GB is misery.',
                'Ghi nó vào khu vực nháp. Cái lake thật với bố cục phân vùng của nó là việc của A02 — và một trình đồng bộ đám mây đang băm 24 GB của bạn là cả một nỗi khổ.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Roughly 4× smaller: ~350 MB of CSV becomes ~90 MB of Parquet, with the schema now stored INSIDE the file.',
                'Nhỏ đi khoảng 4 lần: từ chừng 350 MB CSV thành khoảng 90 MB Parquet, với schema giờ đã nằm BÊN TRONG file.',
              ),
            },
          ],
        },
        {
          title: bi('Race the two formats', 'Đua hai định dạng'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `import time

def bench(label, sql):
    t0 = time.perf_counter()
    result = con.execute(sql).fetchall()
    print(f"{label:<32}{(time.perf_counter() - t0) * 1000:8.0f} ms   {result[0]}")`,
            },
            {
              kind: 'trap',
              body: bi(
                'Run every query TWICE and record the second run. The first pays a one-time OS disk-cache cost — comparing a cold run to a warm one is a classic benchmarking sin.',
                'Chạy mỗi query HAI LẦN và ghi lại lần thứ hai. Lần đầu phải trả một khoản chi phí đọc đĩa một lần duy nhất — so lần chạy nguội với lần chạy ấm là lỗi kinh điển khi benchmark.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `-- race these three on the CSV (explicit-schema read) vs the Parquet file:
SELECT count(*) ...
SELECT count(*) ... WHERE store_id = 42
SELECT status, count(*) ... GROUP BY 1 ORDER BY 2 DESC`,
            },
            {
              kind: 'why',
              body: bi(
                'On the baseline machine the CSV scans land around a second or a few each; Parquet answers in tens of milliseconds — expect at least 10× on the filter and aggregate, and something absurd on count(*). Why is Parquet count(*) near-instant? Because the row count sits in the file\'s metadata — no data pages are read at all. Why is the filter so fast? Partly columnar reading (only store_id is touched), partly the next task.',
                'Trên máy chuẩn, các lần quét CSV rơi vào khoảng một giây hoặc vài giây mỗi lần; Parquet trả lời trong vài chục mili giây — hãy chờ đợi ít nhất gấp 10 lần ở filter và phép tổng hợp, còn ở count(*) thì là một con số phi lý. Vì sao count(*) trên Parquet gần như tức thì? Vì số dòng nằm sẵn trong metadata của file — không đọc data page nào cả. Vì sao filter nhanh vậy? Một phần nhờ đọc theo cột, chỉ chạm vào store_id, một phần là nhờ nội dung của task tiếp theo.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Both files exist, the size ratio and the 3×2 timing table are in your journal, second-run numbers',
          'Cả hai file đều tồn tại, tỉ lệ dung lượng và bảng thời gian 3 query × 2 định dạng đã có trong journal, lấy số của lần chạy thứ hai',
        ),
      ],
    },

    {
      id: 'a01-t7',
      num: 7,
      title: bi('Look inside the Parquet file', 'Nhìn vào bên trong file Parquet'),
      goal: bi('Proof, not folklore.', 'Bằng chứng, không phải truyền miệng.'),
      steps: [
        {
          title: bi('Count the row groups', 'Đếm số row group'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT row_group_id, row_group_num_rows
FROM parquet_metadata('<DATA_ROOT>/tmp/orders_2026-06-02.parquet')
WHERE column_id = 0;`,
            },
            {
              kind: 'expect',
              body: bi(
                '~10 row groups of up to ~123k rows each (DuckDB\'s default row-group size is 122,880). Your small-scale day would fit in a single row group.',
                'Khoảng 10 row group, mỗi nhóm tối đa khoảng 123 nghìn dòng (kích thước row group mặc định của DuckDB là 122.880). Ngày ở scale small của bạn sẽ nằm gọn trong đúng một nhóm.',
              ),
            },
          ],
        },
        {
          title: bi('The statistics that make skipping possible', 'Phần thống kê khiến việc bỏ qua trở nên khả thi'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT path_in_schema, stats_min_value, stats_max_value, total_compressed_size
FROM parquet_metadata('<DATA_ROOT>/tmp/orders_2026-06-02.parquet')
WHERE row_group_id = 0 AND path_in_schema IN ('order_id', 'status', 'items');`,
            },
            {
              kind: 'why',
              body: bi(
                'Every row group carries min/max per column. A query with WHERE order_id = 1520000042 can compare against each group\'s min/max and skip groups that cannot contain it — not reading is the fastest IO there is. Notice also total_compressed_size: items (the JSON blob) dwarfs every other column, and columnar means a query ignoring items never pays for those bytes. In A02 you extend this same skipping idea from row groups to whole folders.',
                'Mỗi row group mang theo min và max cho từng cột. Một query có WHERE order_id = 1520000042 sẽ so với cặp đó của từng nhóm rồi bỏ qua những nhóm không thể chứa nó — không đọc chính là cách I/O nhanh nhất tồn tại. Cũng để ý cột total_compressed_size: cột items, tức khối JSON, lớn hơn hẳn mọi cột khác, và columnar nghĩa là một query bỏ qua items sẽ không bao giờ phải trả tiền cho đống byte đó. Ở A02 bạn sẽ mở rộng đúng ý tưởng bỏ qua này từ row group lên tới cả thư mục.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Finish the assignment in your journal: in your own words, three bullets on why columnar + typed beats row-text. If you cannot write them without scrolling up, re-run Tasks 6–7.',
                'Kết thúc bài này trong journal: bằng lời của chính bạn, viết ba gạch đầu dòng về việc vì sao columnar và có kiểu lại thắng văn bản theo dòng. Nếu bạn không viết nổi mà không cuộn lên xem lại, hãy chạy lại Task 6 và 7.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Row-group count and one column\'s min/max are in the journal, plus your three bullets',
          'Số row group và cặp min/max của một cột đã có trong journal, cộng ba gạch đầu dòng của bạn',
        ),
      ],
    },

    {
      id: 'a01-verify',
      title: bi('Verify yourself', 'Tự kiểm chứng'),
      goal: bi('Deterministic numbers for 2026-06-02.', 'Các con số tất định cho ngày 2026-06-02.'),
      steps: [
        {
          title: bi('The reference numbers', 'Bảng số chuẩn'),
          blocks: [
            {
              kind: 'code',
              lang: 'text',
              body: `count(*), small  :  59,024        (manifest rows: 59,024)
count(*), full   :  1,180,490     (manifest rows: 1,180,490; bytes: 359,260,066)
manifest late_rows/dup_rows, full :  17,707 / 590
dirty order_ts (TRY_CAST IS NULL), small :  249      (~0.4%)
dirty order_ts (TRY_CAST IS NULL), full  :  4,899    (~0.4%)
customer_id LIKE '%.0' (all_varchar), small / full :  120 / 2,390   (~0.2%)
DESCRIBE auto-detect: customer_id DOUBLE, order_ts VARCHAR, items VARCHAR
Parquet size, full day  :  ~92 MB from ~343 MB CSV  (~3.5-4x; codec-dependent)
Row groups, full day    :  10   (small day: 1)
Parquet count(*)        :  ~1 ms;  CSV count(*): roughly a second or more`,
            },
            {
              kind: 'text',
              body: bi(
                'Sanity checks that should hold on ANY v1 day: dirty order_ts ≈ 0.4% of rows; float-form customer_id ≈ 0.2%; SUMMARIZE max of order_ts is an impossible date; min order_id belongs to the previous day (late corrections) — except on 2026-06-01, the feed\'s first day, which has no earlier day to correct.',
                'Những phép kiểm tra hợp lý đúng với BẤT KỲ ngày nào thuộc v1: order_ts bẩn khoảng 0,4% số dòng; customer_id dạng số thực khoảng 0,2%; giá trị lớn nhất của order_ts trong SUMMARIZE là một ngày bất khả thi; order_id nhỏ nhất thuộc về ngày hôm trước, tức các bản sửa về trễ — trừ ngày 2026-06-01, ngày đầu tiên của nguồn, vốn không có ngày nào trước đó để mà sửa.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('DuckDB count(*) equals manifest rows exactly, at both scales', 'Phép count(*) của DuckDB bằng đúng trường rows trong manifest, ở cả hai quy mô'),
        bi(
          "Auto-detect's mistakes explained in writing: customer_id → DOUBLE (why), order_ts stuck as VARCHAR (why)",
          'Đã viết ra lời giải thích các lỗi của sniffer: vì sao customer_id thành DOUBLE, vì sao order_ts kẹt ở VARCHAR',
        ),
        bi('Row-group count and one column\'s min/max stats recorded', 'Đã ghi lại số row group và thống kê nhỏ nhất/lớn nhất của một cột'),
        bi('Three own-words bullets: why columnar + typed beats text', 'Ba gạch đầu dòng bằng lời của bạn: vì sao columnar và có kiểu lại thắng văn bản'),
      ],
    },

    {
      id: 'a01-mistakes',
      title: bi('Common beginner mistakes', 'Lỗi thường gặp của người mới'),
      goal: bi('Six traps, and the last one is the deepest.', 'Sáu cái bẫy, và cái cuối cùng là sâu nhất.'),
      steps: [
        {
          title: bi('The six', 'Sáu lỗi'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'Opening the CSV in Excel "just to look". Excel truncates at 1,048,576 rows, reformats dates, and strips leading zeros — and if you save, the file is ruined. The customer_id float-forms in this feed are exactly the kind of scar such round-trips leave.',
                'Mở file CSV bằng Excel "chỉ để nhìn một chút". Excel cắt cụt ở dòng 1.048.576, định dạng lại ngày tháng, và bỏ mất số 0 ở đầu — và nếu bạn bấm lưu thì file coi như hỏng. Những giá trị customer_id dạng số thực trong nguồn này đúng là loại sẹo mà các chuyến đi vòng như vậy để lại.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Trusting auto-detect in pipeline code. It guesses from a sample; today it made customer_id a DOUBLE. Sniff when exploring, declare schemas when loading.',
                'Tin vào sniffer kiểu trong code pipeline. Nó đoán từ một mẫu; hôm nay nó đã biến customer_id thành DOUBLE. Dò kiểu khi khám phá, khai schema khi nạp.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Running the pandas estimate instead of calculating it. Loading 45 files into one process will freeze or kill your machine. The guard in Task 4 exists for a reason; the estimate is arithmetic, not an experiment.',
                'Chạy ước lượng pandas thay vì tính nó ra giấy. Nạp 45 file vào một process sẽ làm đơ hoặc giết máy bạn. Cái guard ở Task 4 có lý do của nó; ước lượng là số học, không phải thí nghiệm.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Benchmarking cold vs warm. First read of a file pays the disk; second comes from OS cache. Compare second runs to second runs — A14 formalizes this.',
                'Đo hiệu năng lần nguội so với lần ấm. Lần đọc đầu tiên trả giá đĩa; lần thứ hai lấy từ OS cache. So lần-hai với lần-hai — A14 sẽ chính thức hoá chuyện này.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Writing the Parquet file into lake/ or onto a OneDrive-synced path. The lake has a specific layout that A02 builds; scratch output goes to <DATA_ROOT>/tmp/.',
                'Ghi file Parquet vào lake/ hoặc vào một đường dẫn đang đồng bộ OneDrive. Cái lake có bố cục riêng mà A02 sẽ dựng; kết quả nháp thì đi vào <DATA_ROOT>/tmp/.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Reading "match=True" as "data is good". The row count matches and the values are still ~3% dirty. Structure parses; values lie. A03 and A05 deal with that.',
                'Hiểu "match=True" thành "dữ liệu tốt". Số dòng khớp mà giá trị vẫn bẩn khoảng 3%. Cấu trúc thì phân tích được; giá trị vẫn có thể sai. A03 và A05 sẽ xử lý chuyện đó.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Đọc qua một lượt trước khi bắt đầu Task 4')],
    },

    {
      id: 'a01-stretch',
      title: bi('Stretch goals', 'Bài mở rộng'),
      goal: bi('Three optional exercises.', 'Ba bài tự chọn.'),
      steps: [
        {
          title: bi('1 — Count the whole month in one query', '1 — Đếm cả tháng bằng một query'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Point read_csv at \'<DATA_ROOT>/small/raw/orders/orders_*.csv\' with filename=true and all_varchar=true, group by parse_filename(filename). Spot the weekend dip (~×0.75) and the 2026-06-19 spike (~×3) in the counts. Small scale — then decide for yourself whether you dare run it at full scale. It streams, so it works, and the wall-clock is your first taste of A12\'s problem.',
                'Trỏ read_csv vào \'<DATA_ROOT>/small/raw/orders/orders_*.csv\' với filename=true và all_varchar=true, rồi gom nhóm theo parse_filename(filename). Tìm ra chỗ trũng cuối tuần (khoảng 0,75 lần) và đỉnh nhọn ngày 2026-06-19 (khoảng 3 lần) trong các con số đếm được. Làm ở scale small — rồi tự quyết định xem bạn có dám chạy nó ở scale full không. Nó xử lý theo streaming nên chạy được, và thời gian chờ chính là hương vị đầu tiên của bài toán ở A12.',
              ),
            },
          ],
        },
        {
          title: bi('2 — Compression codecs', '2 — Các bộ nén'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Rewrite your day with (FORMAT parquet, COMPRESSION zstd) and compare size to the default (snappy). Expect roughly 92 MB → ~51 MB. What might the trade-off be? A14 measures it.',
                'Ghi lại ngày của bạn với (FORMAT parquet, COMPRESSION zstd) rồi so dung lượng với mặc định là snappy. Dự kiến khoảng 92 MB xuống còn chừng 51 MB. Cái giá phải trả có thể là gì? A14 sẽ đo nó.',
              ),
            },
          ],
        },
        {
          title: bi('3 — Pick your poison, quantify it', '3 — Chọn liều thuốc độc của bạn, rồi định lượng nó'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Choose one more dirt pattern from the SUMMARIZE output — junk status values, order_total with $ or N/A — count it with TRY_CAST or LIKE probes, and note the percentage. You are building the intuition A03\'s cleaning catalog is made of.',
                'Chọn thêm một kiểu rác nữa từ kết quả SUMMARIZE — các giá trị status rác, hay order_total có ký hiệu $ hoặc N/A — đếm nó bằng các phép dò TRY_CAST hoặc LIKE, rồi ghi lại tỉ lệ phần trăm. Bạn đang xây chính cái trực giác làm nên danh mục cleaning của A03.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Hoàn thành ít nhất một mục')],
    },
  ],
}
