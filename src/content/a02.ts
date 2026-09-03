import type { AssignmentSpec } from '../types'
import { bi, vi } from '../types'
import { a02Terms, a02Theory } from './a02.theory'

export const a02: AssignmentSpec = {
  id: 'a02',
  code: 'A02',
  title: bi(
    'Build the Hive-partitioned Parquet lake',
    'Dựng lake Parquet phân vùng theo kiểu Hive',
  ),
  summary: bi(
    'Turn 45 CSV files into a date-partitioned lake, then prove the engine skips 369 of 377 files by folder name alone.',
    'Biến 45 file CSV thành lake chia theo ngày, rồi chứng minh engine bỏ qua 369 trên 377 file chỉ nhờ tên thư mục.',
  ),
  estHours: 3,
  difficulty: 2,
  outcome: bi(
    'You can lay out a lake so that date-sized questions cost date-sized reads, and you can read EXPLAIN output to prove it rather than assume it.',
    'Bạn bố trí được một lake sao cho câu hỏi cỡ một ngày chỉ tốn lượng đọc cỡ một ngày, và đọc được kết quả EXPLAIN để chứng minh điều đó thay vì tin suông.',
  ),
  theory: a02Theory,
  terms: a02Terms,
  tasks: [
    {
      id: 'a02-t0',
      title: bi('Setup', 'Chuẩn bị'),
      goal: bi(
        'Confirm you have exactly the 45 month-1 files, and understand why no database is needed today.',
        'Xác nhận đúng 45 file của tháng một, và hiểu vì sao hôm nay không cần database.',
      ),
      steps: [
        {
          title: bi('Preconditions', 'Điều kiện cần'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Venv active, ETL_LAB_DATA set (A00). Everything until Task 6 runs on small.',
                'Môi trường ảo đang bật, biến ETL_LAB_DATA đã khai từ A00. Mọi thứ cho tới Task 6 chạy trên bộ nhỏ.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'No warehouse.duckdb today — a lake is just files. An in-memory connection with the standard settings is all we need. This job streams and never nears the memory limit; set the limits anyway, as lab habit.',
                'Hôm nay không dùng file warehouse.duckdb, vì một lake chỉ là các file. Một kết nối in-memory với ba thiết lập quen thuộc là đủ. Công việc này xử lý theo dòng chảy nên không bao giờ chạm trần bộ nhớ — vẫn đặt giới hạn, coi như thói quen của lab.',
              ),
            },
          ],
        },
        {
          title: bi('Sanity-check the raw data', 'Kiểm tra nhanh dữ liệu thô'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: '(Get-ChildItem "$env:ETL_LAB_DATA\\small\\raw\\orders").Count    # expect 45 files',
            },
            {
              kind: 'expect',
              body: bi(
                '45 files = month 1 = era v1 = 2026-06-01 … 2026-07-15. Month 2 does not exist yet — A10 generates it. If you have more than 45, load only these 45 today.',
                '45 file, tức tháng một, tức kỷ nguyên lược đồ v1, từ 2026-06-01 tới 2026-07-15. Tháng hai chưa tồn tại — A10 mới sinh ra nó. Nếu bạn thấy nhiều hơn 45, hôm nay chỉ nạp đúng 45 file này.',
              ),
            },
          ],
        },
        {
          title: bi('Open what you will watch', 'Mở sẵn những thứ cần theo dõi'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Editor, PowerShell at the repo root, Task Manager (Details tab, find python.exe), journal.md.',
                'Trình soạn thảo, PowerShell đứng ở gốc repo, Task Manager mở tab Details và tìm python.exe, và journal.md.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('45 files counted in small/raw/orders', 'Đếm được đúng 45 file trong small/raw/orders'),
      ],
    },

    {
      id: 'a02-t1',
      num: 1,
      title: bi(
        'Look inside one file before moving anything',
        'Nhìn vào trong một file trước khi chuyển bất cứ thứ gì',
      ),
      goal: bi(
        'Verify with your own eyes that one file carries eight days of event time.',
        'Tự tay kiểm chứng rằng một file chứa tám ngày thời điểm xảy ra.',
      ),
      steps: [
        {
          title: bi('Why not a plain CAST', 'Vì sao không dùng CAST thường'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Never route data you have not looked at. The timestamp column is dirty — three formats plus a few impossible dates — so a plain CAST would crash.',
                'Đừng bao giờ dẫn đường cho dữ liệu mà bạn chưa nhìn vào. Cột mốc thời gian bẩn: ba định dạng khác nhau cộng vài ngày bất khả thi, nên CAST thẳng sẽ làm nổ truy vấn.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'A01 found two of these formats. The third, ISO-T, hid from A01\'s TRY_CAST probe because a plain TIMESTAMP cast accepts it. try_strptime tries formats in order and returns NULL when none fit.',
                'A01 tìm ra hai trong số các định dạng này. Cái thứ ba, kiểu ISO có chữ T ở giữa, đã trốn thoát khỏi phép thử TRY_CAST của A01 vì lệnh cast sang TIMESTAMP vẫn chấp nhận nó. Hàm try_strptime thử lần lượt từng định dạng và trả NULL khi không cái nào khớp.',
              ),
            },
          ],
        },
        {
          title: bi('Count rows by event day', 'Đếm số dòng theo ngày xảy ra'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `import duckdb
import os
from pathlib import Path

ROOT = Path(os.environ.get("ETL_LAB_DATA", "data")) / "small"
SRC = ROOT / "raw" / "orders" / "orders_2026-06-10.csv"

TS_FORMATS = "['%Y-%m-%d %H:%M:%S', '%d/%m/%Y %H:%M:%S', '%Y-%m-%dT%H:%M:%S']"

con = duckdb.connect()
rows = con.execute(f"""
    SELECT CAST(try_strptime(order_ts, {TS_FORMATS}) AS DATE) AS order_date,
           count(*) AS n
    FROM read_csv('{SRC.as_posix()}',
        header=true,
        columns={{'order_id':'BIGINT','customer_id':'BIGINT','store_id':'INTEGER',
                 'order_ts':'VARCHAR','updated_at':'TIMESTAMP','status':'VARCHAR',
                 'payment_method':'VARCHAR','order_total':'VARCHAR',
                 'items':'VARCHAR','meta':'VARCHAR'}})
    GROUP BY 1 ORDER BY 1
""").fetchall()
for r in rows:
    print(r)`,
            },
            {
              kind: 'glossary',
              items: [
                {
                  term: 'try_strptime(col, [formats])',
                  means: bi(
                    'Tries each format in order, returns the first that parses, NULL if none do.',
                    'Thử từng định dạng theo đúng thứ tự, trả về cái đầu tiên phân tích được, trả NULL nếu không có cái nào.',
                  ),
                },
                {
                  term: 'CAST(... AS DATE)',
                  means: bi(
                    'Drops the time part, keeping only the day. This value becomes the partition folder name.',
                    'Cắt bỏ phần giờ phút giây, chỉ giữ ngày. Chính giá trị này sẽ trở thành tên thư mục phân vùng.',
                  ),
                },
                {
                  term: 'columns={...}',
                  means: bi(
                    'Explicit schema instead of letting the reader guess — the A01 lesson. order_ts stays VARCHAR because it is dirty.',
                    'Khai lược đồ tường minh thay vì để trình đọc đoán — đúng bài học của A01. Cột order_ts để dạng VARCHAR vì nó bẩn.',
                  ),
                },
              ],
            },
            {
              kind: 'expect',
              body: bi(
                'Small scale is deterministic, so these exact numbers: 2026-06-03 → 41 (late corrections, 7 days back), then growing 66, 110, 122, 154, 196, and 2026-06-09 → 222; 2026-06-10 → 59,857 (the file\'s own day); None → 14 (impossible timestamps).',
                'Bộ nhỏ là tất định nên số phải khớp chính xác: 2026-06-03 có 41 dòng (bản sửa về trễ, lùi 7 ngày), rồi tăng dần 66, 110, 122, 154, 196, tới 2026-06-09 là 222; 2026-06-10 có 59.857 dòng, tức ngày của chính file; và nhóm None có 14 dòng, là các mốc thời gian bất khả thi.',
              ),
            },
          ],
        },
        {
          title: bi('Now remove the third format', 'Giờ thử bỏ định dạng thứ ba'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Remove the ISO-T format and re-run: the NULL bucket jumps about tenfold.',
                'Xoá định dạng ISO có chữ T khỏi danh sách rồi chạy lại: nhóm NULL phình lên khoảng mười lần.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Those 0.3% ISO-T rows are good orders we must not lose to lazy parsing.',
                'Khoảng 0,3% dòng dạng ISO-T đó là những đơn hàng hợp lệ. Không được để mất chúng chỉ vì phân tích cú pháp lười biếng.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'The counts sum to rows in small/raw/manifest/orders_2026-06-10.json',
          'Tổng các nhóm bằng đúng trường rows trong small/raw/manifest/orders_2026-06-10.json',
        ),
        bi(
          'You can say in one sentence where each group comes from: prior days, own day, NULL',
          'Nói được trong một câu mỗi nhóm đến từ đâu: các ngày trước, ngày của chính file, và NULL',
        ),
      ],
    },

    {
      id: 'a02-t2',
      num: 2,
      title: bi(
        'Step on the filename rake (deliberate failure)',
        'Giẫm lên cái cào mang tên trùng-tên-file (hỏng có chủ ý)',
      ),
      goal: bi(
        'Cause silent data loss with your own hands, so you never meet it in production.',
        'Tự tay gây ra mất dữ liệu âm thầm, để không bao giờ gặp lại nó trên môi trường thật.',
      ),
      steps: [
        {
          title: bi('Write work/build_lake.py', 'Viết work/build_lake.py'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Note the two constants marked Task 2 / Task 3 — start with the Task 2 values.',
                'Chú ý hai hằng số được đánh dấu Task 2 và Task 3 — bắt đầu bằng giá trị của Task 2.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `"""A02 - build the Hive-partitioned Parquet lake, one day at a time."""
import os
import time
from datetime import date, timedelta
from pathlib import Path

import duckdb

# Where is the data? Same rule as lib/labpaths.py: env var, else <repo>/data.
BASE = Path(os.environ.get("ETL_LAB_DATA", Path(__file__).resolve().parents[1] / "data"))
SCALE = "small"                          # develop on small, switch to "full" in Task 6
ROOT = BASE / "small" if SCALE == "small" else BASE

RAW_ORDERS = ROOT / "raw" / "orders"
LAKE_ORDERS = ROOT / "lake" / "orders"
TMP = ROOT / "tmp"

FIRST_DAY = date(2026, 6, 1)
LAST_DAY = date(2026, 6, 2)              # Task 2: two days.  Task 3: date(2026, 7, 15)
PARTITION_MODE = "OVERWRITE_OR_IGNORE"   # Task 2: this.      Task 3: "APPEND"

TS_FORMATS = "['%Y-%m-%d %H:%M:%S', '%d/%m/%Y %H:%M:%S', '%Y-%m-%dT%H:%M:%S']"
V1_COLUMNS = """{'order_id':'BIGINT','customer_id':'BIGINT','store_id':'INTEGER',
     'order_ts':'VARCHAR','updated_at':'TIMESTAMP','status':'VARCHAR',
     'payment_method':'VARCHAR','order_total':'VARCHAR',
     'items':'VARCHAR','meta':'VARCHAR'}"""

con = duckdb.connect()   # in-memory: the lake is plain files, no database needed yet
con.execute(f"SET memory_limit='8GB'; SET threads=8; "
            f"SET temp_directory='{TMP.as_posix()}';")


def load_day(day: date) -> int:
    """Read one raw CSV, derive order_date, write into the partitioned lake."""
    src = RAW_ORDERS / f"orders_{day}.csv"
    result = con.execute(f"""
        COPY (
            SELECT *,
                   try_strptime(order_ts, {TS_FORMATS}) AS order_ts_clean,
                   CAST(try_strptime(order_ts, {TS_FORMATS}) AS DATE) AS order_date
            FROM read_csv('{src.as_posix()}', header=true, columns={V1_COLUMNS})
        ) TO '{LAKE_ORDERS.as_posix()}'
        (FORMAT parquet, PARTITION_BY (order_date), {PARTITION_MODE},
         ROW_GROUP_SIZE 122880);
    """)
    return result.fetchone()[0]          # COPY reports how many rows it wrote


if __name__ == "__main__":
    LAKE_ORDERS.mkdir(parents=True, exist_ok=True)
    TMP.mkdir(parents=True, exist_ok=True)

    day = FIRST_DAY
    t_total = time.perf_counter()
    while day <= LAST_DAY:
        t0 = time.perf_counter()
        rows = load_day(day)
        print(f"{day}  {rows:>9,} rows  {time.perf_counter() - t0:6.2f} s")
        day += timedelta(days=1)
    print(f"TOTAL {time.perf_counter() - t_total:8.1f} s")`,
            },
            {
              kind: 'glossary',
              items: [
                {
                  term: 'PARTITION_BY (order_date)',
                  means: bi(
                    'Split the output into one folder per value of this column, named order_date=value.',
                    'Tách kết quả thành mỗi giá trị một thư mục, đặt tên dạng order_date=giá_trị.',
                  ),
                },
                {
                  term: 'ROW_GROUP_SIZE 122880',
                  means: bi(
                    'Rows per row group inside each Parquet file — the unit A01\'s min/max stats attach to.',
                    'Số dòng mỗi nhóm dòng bên trong file Parquet — chính là đơn vị mà thống kê min/max của A01 gắn vào.',
                  ),
                },
                {
                  term: 'result.fetchone()[0]',
                  means: bi(
                    'COPY returns a single row holding the number of rows written.',
                    'Lệnh COPY trả về một dòng duy nhất chứa số dòng đã ghi.',
                  ),
                },
              ],
            },
          ],
        },
        {
          title: bi('Run it, then count', 'Chạy rồi đếm lại'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Run python work\\build_lake.py: it prints 60,703 rows for 06-01 and 59,024 for 06-02, so the lake must hold 119,727.',
                'Chạy python work\\build_lake.py: nó in 60.703 dòng cho ngày 06-01 và 59.024 dòng cho 06-02, nên lake phải chứa 119.727 dòng.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `g = (ROOT / "lake" / "orders").as_posix() + "/*/*.parquet"
con.execute(f"SELECT count(*) FROM read_parquet('{g}', hive_partitioning=true)")`,
            },
            {
              kind: 'glossary',
              items: [
                {
                  term: 'hive_partitioning=true',
                  means: bi(
                    'Turns the folder names back into a real order_date column. Without it the column does not exist.',
                    'Biến tên thư mục ngược lại thành một cột order_date thật. Không có nó thì cột này không tồn tại.',
                  ),
                },
                {
                  term: '/*/*.parquet',
                  means: bi(
                    'Two glob levels: first the order_date=… folders, then the files inside them.',
                    'Hai tầng dấu sao: tầng một là các thư mục order_date=…, tầng hai là các file bên trong.',
                  ),
                },
              ],
            },
            {
              kind: 'expect',
              body: bi(
                'You get 59,024. A full day is gone and nothing errored.',
                'Bạn nhận được 59.024. Mất trọn một ngày mà không có lỗi nào được báo.',
              ),
            },
          ],
        },
        {
          title: bi('The crime scene', 'Hiện trường vụ án'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: 'Get-ChildItem "$env:ETL_LAB_DATA\\small\\lake\\orders\\order_date=2026-06-01"',
            },
            {
              kind: 'why',
              body: bi(
                'One file, data_0.parquet, a few dozen KB. Day 1\'s COPY wrote that file with 60,686 rows (17 of its 60,703 had impossible timestamps and went to the NULL partition instead). Day 2\'s COPY carried 885 late rows for 06-01, wrote into the same folder — named data_0.parquet again — and silently replaced a full day with 885 corrections.',
                'Chỉ có một file tên data_0.parquet, nặng vài chục KB. Lệnh COPY của ngày 1 đã ghi file đó với 60.686 dòng (17 trong số 60.703 dòng có mốc thời gian bất khả thi nên đi vào phân vùng NULL). Lệnh COPY của ngày 2 mang theo 885 dòng sửa trễ cho ngày 06-01, ghi vào đúng thư mục đó, lại đặt tên data_0.parquet — và âm thầm thay trọn một ngày bằng 885 bản sửa.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'This is the most dangerous failure shape: no exception, no warning, the process reports success. Only reconciliation against the manifest catches it.',
                'Đây là kiểu hỏng nguy hiểm nhất: không ngoại lệ, không cảnh báo, tiến trình báo thành công. Chỉ có phép đối chiếu với manifest mới bắt được nó.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Count query returns 59,024', 'Câu đếm trả về 59.024'),
        bi(
          "The 06-01 partition holds exactly 885 rows (WHERE order_date = DATE '2026-06-01')",
          "Phân vùng 06-01 chứa đúng 885 dòng khi lọc WHERE order_date = DATE '2026-06-01'",
        ),
        bi(
          'You can explain the loss in one sentence without re-reading the text',
          'Giải thích được nguyên nhân mất dữ liệu trong một câu mà không cần đọc lại tài liệu',
        ),
      ],
    },

    {
      id: 'a02-t3',
      num: 3,
      title: bi('The real loader: APPEND, all 45 days', 'Bộ nạp thật: APPEND cho cả 45 ngày'),
      goal: bi(
        'Rebuild the lake with the right mode and reconcile it against the manifests.',
        'Dựng lại lake bằng chế độ đúng, rồi đối chiếu với manifest.',
      ),
      steps: [
        {
          title: bi('The fix is one word', 'Cách chữa gói trong một từ'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `LAST_DAY = date(2026, 7, 15)             # all of month 1, era v1
PARTITION_MODE = "APPEND"`,
            },
            {
              kind: 'why',
              body: bi(
                'APPEND gives every written file a unique UUID name, so writes into an existing folder add instead of replace.',
                'Chế độ APPEND đặt cho mỗi file được ghi một tên UUID duy nhất, nên lần ghi vào thư mục đã có sẽ THÊM VÀO thay vì THAY THẾ.',
              ),
            },
          ],
        },
        {
          title: bi('Throw away the poisoned lake first', 'Vứt bỏ lake nhiễm độc trước đã'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'APPEND on top of wrong data = bigger wrong data.',
                'APPEND chồng lên dữ liệu sai chỉ cho ra dữ liệu sai to hơn.',
              ),
            },
            {
              kind: 'code',
              lang: 'powershell',
              body:
                'Remove-Item -Recurse -Force "$env:ETL_LAB_DATA\\small\\lake\\orders"\npython work\\build_lake.py',
            },
          ],
        },
        {
          title: bi('Write work/verify_lake.py', 'Viết work/verify_lake.py'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'A habit you keep all lab long: the manifests say what was written; the lake must agree.',
                'Thói quen giữ suốt cả lab: manifest nói cái gì đã được ghi, lake phải đồng ý với nó.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `"""Reconcile the lake against the generator manifests."""
import json
import os
from datetime import date, timedelta
from pathlib import Path

import duckdb

BASE = Path(os.environ.get("ETL_LAB_DATA", Path(__file__).resolve().parents[1] / "data"))
SCALE = "small"
ROOT = BASE / "small" if SCALE == "small" else BASE

manifest_total = 0
day, last = date(2026, 6, 1), date(2026, 7, 15)
while day <= last:
    m = json.loads((ROOT / "raw" / "manifest" / f"orders_{day}.json").read_text())
    manifest_total += m["rows"]
    day += timedelta(days=1)

con = duckdb.connect()
lake_glob = (ROOT / "lake" / "orders").as_posix() + "/*/*.parquet"
lake_total = con.execute(
    f"SELECT count(*) FROM read_parquet('{lake_glob}', hive_partitioning=true)"
).fetchone()[0]

print(f"manifests say: {manifest_total:,}")
print(f"lake contains: {lake_total:,}")
print("MATCH" if manifest_total == lake_total else "MISMATCH - investigate!")`,
            },
            {
              kind: 'expect',
              body: bi(
                'MATCH, 2,773,566 rows on both lines. If yours differs slightly, your manifests are the truth.',
                'In ra MATCH với 2.773.566 dòng ở cả hai dòng. Nếu của bạn lệch chút ít thì manifest của bạn mới là sự thật.',
              ),
            },
          ],
        },
        {
          title: bi('Record the wall-clock', 'Ghi lại thời gian chạy'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'The small loop takes well under a minute on the baseline machine.',
                'Vòng lặp trên bộ nhỏ mất chưa tới một phút trên máy chuẩn.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'The loop is strictly one day after another — deliberately naive. A12 makes it fast; A07 makes it re-runnable. Without a number today, there is nothing to compare against then.',
                'Vòng lặp chạy tuần tự từng ngày một, ngây thơ có chủ đích. A12 sẽ làm nó nhanh lên, A07 sẽ làm nó chạy lại được an toàn. Không có con số hôm nay thì lúc đó chẳng có gì để so.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('verify_lake.py prints MATCH with 2,773,566 rows', 'verify_lake.py in MATCH với 2.773.566 dòng'),
        bi('Journal records the wall-clock', 'Journal ghi thời gian chạy của vòng lặp'),
      ],
    },

    {
      id: 'a02-t4',
      num: 4,
      title: bi('Read the tree like an engineer', 'Đọc cây thư mục như một kỹ sư'),
      goal: bi(
        'Audit pipeline behavior from a directory listing alone, before running any query.',
        'Kiểm toán hành vi của pipeline chỉ bằng cách liệt kê thư mục, chưa cần chạy truy vấn nào.',
      ),
      steps: [
        {
          title: bi('Survey the lake', 'Khảo sát lake'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `$lake = "$env:ETL_LAB_DATA\\small\\lake\\orders"
(Get-ChildItem $lake -Directory).Count                              # folders
(Get-ChildItem $lake -Recurse -Filter *.parquet).Count              # files
Get-ChildItem $lake -Directory | ForEach-Object {
    "{0}  {1}" -f $_.Name, (Get-ChildItem $_.FullName -Filter *.parquet).Count }
Get-ChildItem $lake -Directory | Select-Object Name, @{n='MB';e={[math]::Round(
    (Get-ChildItem $_.FullName -Filter *.parquet |
     Measure-Object Length -Sum).Sum/1MB,1)}} |
    Sort-Object MB -Descending | Select-Object -First 5`,
            },
            {
              kind: 'expect',
              body: bi(
                'You loaded 45 files, yet you get 46 folders and 377 files. Three anomalies — work each out before reading on.',
                'Bạn nạp 45 file, nhưng nhận được 46 thư mục và 377 file. Ba điều bất thường — tự nghĩ ra lời giải cho từng cái trước khi đọc tiếp.',
              ),
            },
          ],
        },
        {
          title: bi('Anomaly 1 — the 46th folder', 'Bất thường 1 — thư mục thứ 46'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'order_date=__HIVE_DEFAULT_PARTITION__ holds the NULL-date rows: impossible timestamps, ~0.02%, 553 rows total across 45 small files — every day contributed a few. Parked, not lost; A05 quarantines them properly.',
                'Thư mục order_date=__HIVE_DEFAULT_PARTITION__ chứa các dòng có ngày NULL: mốc thời gian bất khả thi, chiếm khoảng 0,02%, tổng cộng 553 dòng nằm trong 45 file nhỏ — mỗi ngày góp vài dòng. Được gửi tạm chứ không mất; A05 sẽ cách ly chúng đúng cách.',
              ),
            },
          ],
        },
        {
          title: bi('Anomaly 2 — most folders hold 8 files', 'Bất thường 2 — phần lớn thư mục chứa 8 file'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'The day\'s own write plus late-correction writes from each of the next 7 days. The last week tapers 7, 6, … 1 — 2026-07-15 has no later files to correct it yet; month 2 will, in A10.',
                'Một file là lần ghi của chính ngày đó, bảy file còn lại là các bản sửa trễ đến từ bảy ngày kế tiếp. Tuần cuối thoái dần 7, 6, … 1 — ngày 2026-07-15 chưa có ngày nào sau nó để gửi bản sửa; tháng hai sẽ có, ở A10.',
              ),
            },
          ],
        },
        {
          title: bi('Anomaly 3 — two folders ~3× their neighbors', 'Bất thường 3 — hai thư mục to gấp khoảng ba lần'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                '2026-06-19 and 2026-07-11, the flash-sale spike days A01 found. Data skew, now visible in the filesystem. They will torment you in A12–A14.',
                'Đó là 2026-06-19 và 2026-07-11, hai ngày khuyến mãi chớp nhoáng mà A01 đã tìm ra. Độ lệch dữ liệu giờ hiện ra ngay trên hệ thống file. Chúng sẽ hành hạ bạn ở A12 tới A14.',
              ),
            },
          ],
        },
        {
          title: bi('One consequence to remember', 'Một hệ quả cần nhớ'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'The same order_id can now exist in two partitions: original plus late correction. The lake is an append-only log, not final truth — deduplicating it is A08\'s whole topic.',
                'Cùng một order_id giờ có thể tồn tại trong hai phân vùng: bản gốc và bản sửa trễ. Lake là nhật ký chỉ ghi thêm, không phải sự thật cuối cùng — khử trùng lặp là toàn bộ chủ đề của A08.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'All three anomalies explained in your journal, in your own words',
          'Journal giải thích cả ba điều bất thường bằng lời của chính bạn',
        ),
      ],
    },

    {
      id: 'a02-t5',
      num: 5,
      title: bi('Prove the pruning', 'Chứng minh việc cắt tỉa có thật'),
      goal: bi(
        'See the evidence in the execution plan rather than trusting the promise.',
        'Nhìn thấy bằng chứng trong kế hoạch thực thi thay vì tin vào lời hứa.',
      ),
      steps: [
        {
          title: bi('Query A — partition filter', 'Truy vấn A — lọc theo cột phân vùng'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT count(*) AS orders, round(avg(store_id), 2) AS avg_store
FROM read_parquet('<DATA_ROOT>/small/lake/orders/*/*.parquet', hive_partitioning=true)
WHERE order_date = DATE '2026-06-19';`,
            },
          ],
        },
        {
          title: bi('Query B — your turn, data-column filter', 'Truy vấn B — tự viết, lọc theo cột dữ liệu'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Same aggregate, but filter on the data column order_ts_clean. Hint: WHERE CAST(order_ts_clean AS DATE) = …',
                'Cùng phép tổng hợp nhưng lọc trên cột dữ liệu order_ts_clean. Gợi ý: WHERE CAST(order_ts_clean AS DATE) = …',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Both must return identical results, since order_date was derived from it. Same answer, completely different cost — that is the thing to see.',
                'Hai truy vấn bắt buộc trả về kết quả giống hệt nhau, vì order_date được suy ra từ chính nó. Cùng câu trả lời nhưng chi phí khác hẳn — đó mới là thứ cần thấy.',
              ),
            },
          ],
        },
        {
          title: bi('Time them and compare plans', 'Đo thời gian và so kế hoạch thực thi'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Run each 3 times (first run warms the OS cache; keep the median — the A01 habit), then compare plans.',
                'Chạy mỗi truy vấn ba lần (lần đầu làm nóng bộ đệm hệ điều hành; lấy giá trị trung vị — thói quen của A01), rồi so kế hoạch thực thi.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `print(con.execute("EXPLAIN " + query_a).fetchall()[0][1])
print(con.execute("EXPLAIN " + query_b).fetchall()[0][1])`,
            },
            {
              kind: 'code',
              lang: 'text',
              body: `File Filters: (order_date = '2026-06-19'::DATE)
Scanning Files: 8/377`,
            },
            {
              kind: 'expect',
              body: bi(
                'Query A\'s READ_PARQUET box holds the proof: 8 files opened out of 377 — 369 skipped by folder name alone. Query B shows a plain Filters: on the timestamp and opens every file. On small scale expect roughly 20 ms vs 60 ms; pruning saves reading, so the win grows with data size.',
                'Khối READ_PARQUET của truy vấn A chứa bằng chứng: 8 file được mở trên tổng 377 — 369 file bị bỏ qua chỉ nhờ tên thư mục. Truy vấn B chỉ có dòng Filters thường trên cột thời gian và mở mọi file. Trên bộ nhỏ chênh khoảng 20 mili giây so với 60 mili giây; cắt tỉa tiết kiệm việc ĐỌC nên lợi ích tăng theo lượng dữ liệu.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Both queries return (180183, 267.17) on small scale', 'Cả hai truy vấn trả về (180183, 267.17) trên bộ nhỏ'),
        bi(
          'Both EXPLAIN outputs in your journal with the Scanning Files line highlighted',
          'Journal có cả hai kết quả EXPLAIN, đánh dấu dòng Scanning Files',
        ),
        bi('Timings recorded', 'Đã ghi lại thời gian chạy'),
      ],
    },

    {
      id: 'a02-t6',
      num: 6,
      title: bi('Now for real: full scale', 'Giờ mới thật: chạy trên bộ đầy đủ'),
      goal: bi(
        'Build at real scale and watch the process while it runs.',
        'Dựng lake ở quy mô thật và quan sát tiến trình trong lúc nó chạy.',
      ),
      steps: [
        {
          title: bi('Predict before you run', 'Dự đoán trước khi chạy'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Flip SCALE = "full" in both scripts. Month 1 at full scale is roughly 16 GB of CSV — before running, predict in your journal: total rows (hint: small × 20), lake size, loop time.',
                'Đổi SCALE thành "full" trong cả hai script. Tháng một ở quy mô đầy đủ là khoảng 16 GB CSV — trước khi chạy, hãy ghi dự đoán vào journal: tổng số dòng (gợi ý: nhân bộ nhỏ với 20), dung lượng lake, thời gian vòng lặp.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Writing the prediction down first turns the run into a test. The gap between prediction and reality is what teaches; if you only look at the final number, it will always look reasonable.',
                'Viết dự đoán ra trước biến việc chạy thành một phép thử. Khoảng cách giữa dự đoán và thực tế mới là thứ dạy được điều gì đó; nếu chỉ nhìn con số cuối cùng, bạn sẽ luôn thấy nó hợp lý.',
              ),
            },
          ],
        },
        {
          title: bi('Observe while it grinds', 'Quan sát trong lúc nó cày'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Run python work\\build_lake.py and watch. This is the lesson, do not skip it.',
                'Chạy python work\\build_lake.py rồi ngồi nhìn. Đây chính là bài học, đừng bỏ qua.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Task Manager: python.exe memory stays modest (a few hundred MB to ~2 GB) even though each file is ~350 MB — DuckDB streams: read a chunk, write a chunk. Compare with A01\'s pandas trap.',
                'Trong Task Manager, bộ nhớ của python.exe giữ ở mức khiêm tốn, vài trăm MB tới khoảng 2 GB, dù mỗi file nặng chừng 350 MB — DuckDB xử lý theo dòng chảy: đọc một khối, ghi một khối. Đối lập hẳn với cái bẫy pandas của A01.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Per-day timings: roughly 5–20 s each on the baseline machine; 2026-06-19 and 2026-07-11 take ~3× their neighbors — skew again.',
                'Thời gian mỗi ngày khoảng 5 tới 20 giây trên máy chuẩn; riêng 2026-06-19 và 2026-07-11 lâu gấp khoảng ba lần — lại là độ lệch dữ liệu.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'The whole loop: roughly 5–20 minutes of sequential grinding, depending on your disk. Find it annoying — that annoyance is A12\'s motivation. Do not parallelize anything today.',
                'Toàn bộ vòng lặp mất khoảng 5 tới 20 phút cày tuần tự, tuỳ ổ đĩa. Hãy thấy khó chịu vì nó — sự khó chịu đó chính là động cơ của A12. Hôm nay tuyệt đối không song song hoá bất cứ thứ gì.',
              ),
            },
          ],
        },
        {
          title: bi('Verify and re-measure', 'Kiểm chứng và đo lại'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'work/verify_lake.py with SCALE = "full" must print MATCH (roughly 55M rows; your manifests are the exact truth). Re-run Task 5\'s queries on the full lake: the gap is now dramatic — Query B reads a multi-GB lake, Query A one spike day.',
                'Chạy work/verify_lake.py với SCALE = "full", phải in MATCH, khoảng 55 triệu dòng — manifest của bạn mới là con số chính xác. Chạy lại hai truy vấn của Task 5 trên lake đầy đủ: khoảng cách giờ đã rõ rệt — truy vấn B đọc một lake nhiều GB, còn truy vấn A chỉ đọc một ngày khuyến mãi.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Full-scale MATCH', 'Bộ đầy đủ in MATCH'),
        bi('Journal has predictions vs actuals', 'Journal có dự đoán đặt cạnh thực tế'),
        bi(
          'Journal has total wall-clock, per-day pattern, and full-scale pruning timings',
          'Journal ghi tổng thời gian, quy luật thời gian theo ngày, và thời gian cắt tỉa ở quy mô đầy đủ',
        ),
      ],
    },

    {
      id: 'a02-verify',
      title: bi('Verify yourself', 'Tự kiểm chứng'),
      goal: bi(
        'Run the check commands and compare against the reference numbers.',
        'Chạy bộ lệnh kiểm tra và đối chiếu với số chuẩn.',
      ),
      steps: [
        {
          title: bi('Small-scale checks', 'Bộ lệnh kiểm tra trên bộ nhỏ'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `(Get-ChildItem "$env:ETL_LAB_DATA\\small\\lake\\orders" -Directory).Count
# 46
(Get-ChildItem "$env:ETL_LAB_DATA\\small\\lake\\orders" -Recurse -Filter *.parquet).Count
# 377
[math]::Round((Get-ChildItem "$env:ETL_LAB_DATA\\small\\lake\\orders" -Recurse -Filter *.parquet |
  Measure-Object Length -Sum).Sum/1MB)
# roughly 210-230 (vs ~840 MB of CSV -- roughly 4x smaller)
python work\\verify_lake.py
# manifests say: 2,773,566
# lake contains: 2,773,566
# MATCH`,
            },
          ],
        },
        {
          title: bi('Spike-day count', 'Số dòng ngày khuyến mãi'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT count(*) FROM read_parquet('<DATA_ROOT>/small/lake/orders/*/*.parquet',
    hive_partitioning=true)
WHERE order_date = DATE '2026-06-19';
-- 180183      (full scale: roughly 3.6M)`,
            },
          ],
        },
        {
          title: bi('At full scale', 'Ở quy mô đầy đủ'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Same checks with the small path segment removed and SCALE = "full". Folder count identical (46 — partitioning depends on dates, not volume); file count 377 or somewhat higher (DuckDB may split a large partition into several files per write); sizes roughly 20× larger; MATCH against full manifests.',
                'Vẫn những phép kiểm tra đó, bỏ đoạn small khỏi đường dẫn và đặt SCALE = "full". Số thư mục không đổi, vẫn 46 — phân vùng phụ thuộc vào ngày chứ không phụ thuộc khối lượng. Số file là 377 hoặc nhiều hơn chút, vì DuckDB có thể tách một phân vùng lớn thành vài file trong một lần ghi. Dung lượng lớn hơn khoảng 20 lần, và phải MATCH với manifest đầy đủ.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('46 folders, 377 files, roughly 210–230 MB', '46 thư mục, 377 file, dung lượng khoảng 210 tới 230 MB'),
        bi('verify_lake.py prints MATCH at both scales', 'verify_lake.py in MATCH ở cả hai quy mô'),
      ],
    },

    {
      id: 'a02-mistakes',
      title: bi('Common beginner mistakes', 'Lỗi thường gặp của người mới'),
      goal: bi(
        'Recognize six traps before you walk into them.',
        'Nhận diện sáu cái bẫy trước khi giẫm phải chúng.',
      ),
      steps: [
        {
          title: bi('The six', 'Sáu lỗi'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'OVERWRITE_OR_IGNORE inside a loop. Task 2 proved it silently destroys data. One-shot rewrite of everything: fine. Incremental loop: APPEND.',
                'Dùng OVERWRITE_OR_IGNORE bên trong vòng lặp. Task 2 đã chứng minh nó âm thầm phá dữ liệu. Ghi đè toàn bộ một lần thì được; vòng lặp tăng dần thì phải APPEND.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Re-running the loop without wiping the lake. APPEND means append: run twice and every row exists twice (verify prints MISMATCH … 5,547,132). For now: wipe and rebuild. Safe re-runs are A07.',
                'Chạy lại vòng lặp mà không xoá lake. APPEND nghĩa đúng là thêm vào: chạy hai lần thì mọi dòng tồn tại hai bản, verify in MISMATCH với 5.547.132. Hiện giờ cứ xoá rồi dựng lại; chạy lại an toàn là chủ đề A07.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Building the lake inside OneDrive or the repo. The sync client will happily upload thousands of parquet files while you work. Data lives under ETL_LAB_DATA on a fast local disk — A00 rules.',
                'Dựng lake bên trong OneDrive hoặc bên trong repo. Trình đồng bộ sẽ vui vẻ tải hàng nghìn file parquet lên mây trong lúc bạn làm việc. Dữ liệu phải nằm dưới ETL_LAB_DATA trên ổ nội bộ nhanh — luật của A00.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'CAST(order_ts AS TIMESTAMP) instead of try_strptime. Crashes on the first DD/MM/YYYY row with a Conversion Error. And a 2-format list quietly drops the 0.3% ISO-T rows into the NULL partition — parse all three (full cleaning: A03).',
                'Dùng CAST(order_ts AS TIMESTAMP) thay cho try_strptime. Nó nổ ngay ở dòng dạng DD/MM/YYYY đầu tiên với lỗi Conversion Error. Còn danh sách chỉ hai định dạng thì âm thầm ném 0,3% dòng ISO-T vào phân vùng NULL — phải khai đủ ba định dạng; làm sạch trọn vẹn là việc của A03.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                "Filtering with WHERE order_ts LIKE '2026-06-19%'. No pruning (not the partition column) and wrong results: 19/06/2026-format rows don't match the string. Filter on order_date.",
                "Lọc bằng WHERE order_ts LIKE '2026-06-19%'. Vừa không cắt tỉa được vì đó không phải cột phân vùng, vừa cho kết quả sai vì các dòng ghi dạng 19/06/2026 không khớp chuỗi. Lọc trên order_date.",
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Globbing one level too shallow. lake/orders/*.parquet finds nothing (IO Error: No files found) — files live inside the order_date=… folders. Use lake/orders/*/*.parquet.',
                'Đặt dấu sao nông hơn một tầng. Đường dẫn lake/orders/*.parquet không tìm thấy gì và báo IO Error: No files found, vì file nằm bên trong các thư mục order_date=… Phải dùng lake/orders/*/*.parquet.',
              ),
            },
          ],
        },
      ],
      accept: [bi('Read through once before starting Task 2', 'Đọc qua một lượt trước khi bắt tay vào Task 2')],
    },

    {
      id: 'a02-stretch',
      title: bi('Stretch goals', 'Bài mở rộng'),
      goal: bi('Three optional exercises if time allows.', 'Ba bài tự chọn, làm nếu còn thời gian.'),
      steps: [
        {
          title: bi('Feel the small-files problem', 'Cảm nhận vấn đề quá nhiều file nhỏ'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Copy one day into a scratch folder with PARTITION_BY (order_date, store_id): it explodes into ~1,100 folders of ~6 KB files. Query it, feel the sluggishness, delete it, journal one sentence on choosing partition columns.',
                'Chép một ngày sang thư mục nháp với PARTITION_BY (order_date, store_id): nó nổ tung thành khoảng 1.100 thư mục chứa file cỡ 6 KB. Truy vấn thử, cảm nhận độ ì, xoá đi, rồi ghi một câu vào journal về cách chọn cột phân vùng.',
              ),
            },
          ],
        },
        {
          title: bi('Forensics with filename=true', 'Điều tra bằng filename=true'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'read_parquet(…, filename=true) adds each row\'s source file as a column. Group the order_date=2026-06-01 partition by parse_filename(filename).',
                'Tuỳ chọn filename=true trong read_parquet thêm một cột ghi file nguồn của từng dòng. Gom nhóm phân vùng order_date=2026-06-01 theo parse_filename(filename).',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'One 60,686-row file (the day\'s own load) and seven shrinking files (885 → 28 rows) — late-correction writes from days 2–8, fading with distance. Cross-check the 885 against late_rows in the 06-02 manifest.',
                'Một file 60.686 dòng, là lần nạp của chính ngày đó, cộng bảy file nhỏ dần từ 885 xuống 28 dòng — các bản sửa trễ từ ngày thứ hai tới ngày thứ tám, nhạt dần theo khoảng cách. Đối chiếu con số 885 với trường late_rows trong manifest ngày 06-02.',
              ),
            },
          ],
        },
        {
          title: bi('Predict before you measure', 'Dự đoán trước khi đo'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Formalize your Task 6 predictions: write down the scaling factors you would use (rows ×20, bytes ×~20, time ×?), check each against reality, and explain your worst miss.',
                'Chính thức hoá phần dự đoán ở Task 6: viết ra các hệ số quy đổi bạn định dùng (số dòng nhân 20, số byte nhân khoảng 20, thời gian nhân bao nhiêu?), đối chiếu từng cái với thực tế, rồi giải thích cái sai lệch nhiều nhất.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Hoàn thành ít nhất một mục và ghi lại kết luận')],
    },
  ],
}
