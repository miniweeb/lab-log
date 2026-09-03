import type { AssignmentSpec } from '../types'
import { bi, vi } from '../types'
import { a03Terms, a03Theory } from './a03.theory'

export const a03: AssignmentSpec = {
  id: 'a03',
  code: 'A03',
  title: bi('Transformation: staging → core', 'Biến đổi dữ liệu: staging → core'),
  summary: bi(
    'Build the layered warehouse, clean 13 documented pathologies, and count every row each rule touched.',
    'Dựng kho dữ liệu phân tầng, làm sạch 13 bệnh lý đã được ghi nhận, và đếm số dòng mà từng quy tắc chạm vào.',
  ),
  estHours: 5,
  difficulty: 3,
  outcome: bi(
    'You can turn a 97%-clean feed into a typed, audited staging table where every fix is counted, and you can explain any gap between your row count and the manifest.',
    'Bạn biến được một nguồn dữ liệu sạch 97% thành một bảng staging đúng kiểu và kiểm toán được, nơi mọi phép sửa đều được đếm, và bạn giải thích được mọi chênh lệch giữa số dòng của mình với manifest.',
  ),
  theory: a03Theory,
  terms: a03Terms,
  tasks: [
    {
      id: 'a03-t0',
      title: bi('Setup', 'Chuẩn bị'),
      goal: bi(
        'A branch, a bootstrap script, and an interactive session you can run SQL in bit by bit.',
        'Một nhánh, một script khởi tạo, và một phiên tương tác để chạy SQL từng đoạn một.',
      ),
      steps: [
        {
          title: bi('Branch and scale', 'Nhánh và quy mô'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Terminal in the repo root, venv active. Scale: small for Tasks 1–9; Task 10 goes full.',
                'Terminal đứng ở gốc repo, môi trường ảo đang bật. Quy mô: dùng small cho Task 1 tới 9; Task 10 mới chuyển sang full.',
              ),
            },
            { kind: 'code', lang: 'powershell', body: 'git switch -c a03-transformation' },
            {
              kind: 'text',
              body: bi(
                'Commit after each numbered task, e.g. git commit -m "A03 task 4: staging cleaners assembled". Merge to main only when the Definition of Done — pytest included — is green.',
                'Commit sau mỗi task có đánh số, ví dụ git commit -m "A03 task 4: staging cleaners assembled". Chỉ gộp về main khi mọi điều kiện hoàn thành đều xanh, tính cả pytest.',
              ),
            },
          ],
        },
        {
          title: bi('Create work/a03_bootstrap.py', 'Tạo file work/a03_bootstrap.py'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `# work/a03_bootstrap.py
import duckdb
from lib.labpaths import data_root, warehouse_path, ensure_dirs

SCALE = "small"; ensure_dirs(SCALE)   # Task 10 switches this to "full"
ROOT = data_root(SCALE)               # <DATA_ROOT>/small   (full scale: <DATA_ROOT>)
R = ROOT.as_posix()                   # forward slashes for SQL string literals

con = duckdb.connect(str(warehouse_path(SCALE)))
con.execute("SET memory_limit='8GB'; SET threads=8; SET TimeZone='UTC';")   # TZ: see Task 6
con.execute(f"SET temp_directory='{R}/tmp';")`,
            },
            {
              kind: 'code',
              lang: 'powershell',
              body: 'python -i -m work.a03_bootstrap',
            },
            {
              kind: 'glossary',
              items: [
                {
                  term: '-i',
                  means: bi(
                    'Stay interactive afterwards — perfect for running SQL bit by bit.',
                    'Ở lại chế độ tương tác sau khi chạy xong — rất hợp để chạy SQL từng đoạn.',
                  ),
                },
                {
                  term: '-m',
                  means: bi(
                    'Run as a module from the repo root, which puts the repo root on Python\'s import path — the reason lib.labpaths and later work.cleaners are importable at all.',
                    'Chạy dạng module từ gốc repo, nhờ đó gốc repo được đặt vào import path — chính là lý do lib.labpaths và sau này work.cleaners import được.',
                  ),
                },
                {
                  term: "SET TimeZone='UTC'",
                  means: bi(
                    'Pins the session timezone. Task 6 decodes epoch seconds, and to_timestamp is timezone-aware — without this, every laptop decodes them differently.',
                    'Ghim múi giờ cho phiên làm việc. Task 6 sẽ giải mã epoch giây, mà hàm to_timestamp có nhận biết múi giờ — không có dòng này thì mỗi máy giải mã ra một kiểu.',
                  ),
                },
              ],
            },
            {
              kind: 'trap',
              body: bi(
                'python -i work/a03_bootstrap.py would die with ModuleNotFoundError. Same repo-root reason as A01.',
                'Chạy python -i work/a03_bootstrap.py sẽ chết với ModuleNotFoundError. Cùng lý do gốc repo như ở A01.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Peek with con.sql("""...""").show(); run DDL with con.execute. Snippets containing {R} run as f-strings.',
                'Xem nhanh kết quả bằng con.sql("""...""").show(); chạy lệnh tạo bảng bằng con.execute. Đoạn nào có {R} thì chạy dưới dạng f-string.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('On branch a03-transformation', 'Đang ở nhánh a03-transformation'),
        bi('Interactive session opens with con ready', 'Phiên tương tác mở ra với biến con đã sẵn sàng'),
      ],
    },

    {
      id: 'a03-t1',
      num: 1,
      title: bi('Create the warehouse schemas', 'Tạo các schema của kho dữ liệu'),
      goal: bi(
        'One database file, four schemas — the lab convention from here to A15.',
        'Một file database, bốn schema — quy ước của lab từ đây tới A15.',
      ),
      steps: [
        {
          title: bi('Four schemas', 'Bốn schema'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `CREATE SCHEMA IF NOT EXISTS staging;   -- clean, typed, 1:1 with raw
CREATE SCHEMA IF NOT EXISTS core;      -- joined, enriched
CREATE SCHEMA IF NOT EXISTS marts;     -- aggregates for consumers (A04+)
CREATE SCHEMA IF NOT EXISTS ops;       -- pipeline bookkeeping: reports, run logs (A05, A07)`,
            },
          ],
        },
      ],
      accept: [
        bi(
          "SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('staging','core','marts','ops') returns all four rows",
          "Câu SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('staging','core','marts','ops') trả về đủ bốn dòng",
        ),
      ],
    },

    {
      id: 'a03-t2',
      num: 2,
      title: bi('Land one day, exactly as delivered', 'Nạp một ngày, y nguyên như lúc được giao'),
      goal: bi(
        'A 1:1 raw staging table, and a demonstration of why dirty columns land as text.',
        'Một bảng staging thô tương ứng một-một, và một minh chứng vì sao cột bẩn phải vào dạng văn bản.',
      ),
      steps: [
        {
          title: bi('Load 2026-06-02 as text where it is dirty', 'Nạp ngày 2026-06-02, chỗ nào bẩn thì để dạng văn bản'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'We work with 2026-06-02 all day. Any v1 date works, but the expected numbers assume this one.',
                'Cả bài này dùng ngày 2026-06-02. Ngày nào thuộc kỷ nguyên v1 cũng được, nhưng các con số kỳ vọng đều tính cho ngày này.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `con.execute(f"""
-- grain: one row = one order version as delivered in the 2026-06-02 file
CREATE OR REPLACE TABLE staging.shopcore_orders_raw AS
SELECT *,
    DATE '2026-06-02'    AS _data_date,   -- lineage: the delivery's business date
    CAST(NULL AS BIGINT) AS _run_id       -- lineage: comes alive in A07
FROM read_csv('{R}/raw/orders/orders_2026-06-02.csv',
    header=true,
    columns={{'order_id':'BIGINT','customer_id':'VARCHAR','store_id':'INTEGER',
             'order_ts':'VARCHAR','updated_at':'TIMESTAMP','status':'VARCHAR',
             'payment_method':'VARCHAR','order_total':'VARCHAR',
             'items':'VARCHAR','meta':'VARCHAR'}});
""")`,
            },
            {
              kind: 'text',
              body: bi(
                'Twelve columns out: the file\'s ten, plus the two lineage columns the file never contained. order_ts and order_total stay VARCHAR because they hold dirt we must clean ourselves.',
                'Mười hai cột đi ra: mười cột của file, cộng hai cột lineage mà file không hề có. Cột order_ts và order_total giữ dạng VARCHAR vì chúng chứa rác mà ta phải tự làm sạch.',
              ),
            },
          ],
        },
        {
          title: bi('But why customer_id as text?', 'Nhưng vì sao customer_id lại để dạng văn bản?'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'A01\'s explicit schema read it as BIGINT and it worked. "Worked" hid something.',
                'Lược đồ tường minh của A01 đọc nó thành BIGINT và chạy được. Nhưng "chạy được" đã che giấu một chuyện.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT count(*) FILTER (WHERE customer_id IS NULL)     AS missing,
       count(*) FILTER (WHERE customer_id LIKE '%.0')  AS excel_float
FROM staging.shopcore_orders_raw;
-- -> 94 missing, 120 excel_float`,
            },
            {
              kind: 'glossary',
              items: [
                {
                  term: 'FILTER (WHERE …)',
                  means: bi(
                    'Restricts just that one aggregate — a per-aggregate WHERE, letting one SELECT count several conditions at once.',
                    'Giới hạn phạm vi cho riêng một phép tổng hợp — như một mệnh đề WHERE cho từng aggregate, nhờ đó một câu SELECT đếm được nhiều điều kiện cùng lúc.',
                  ),
                },
              ],
            },
            {
              kind: 'why',
              body: bi(
                'Re-run that count with a BIGINT read and you get 94 NULLs and no way to see the rest — the CSV reader silently converted 120 Excel-mangled values like "123456.0". Convenient, and unaccountable. A cleaning layer reads dirty columns as text first so it can see and count what it fixes. That is this whole assignment in one query.',
                'Chạy lại phép đếm đó với kiểu đọc BIGINT thì bạn được 94 giá trị NULL và không còn cách nào thấy phần còn lại — trình đọc CSV đã âm thầm chuyển đổi 120 giá trị bị Excel làm hỏng kiểu "123456.0". Tiện lợi, và không thể quy trách nhiệm. Tầng làm sạch đọc cột bẩn ở dạng văn bản trước để nhìn thấy và đếm được những gì nó sửa. Cả bài này gói trong đúng một câu truy vấn đó.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'SELECT count(*) FROM staging.shopcore_orders_raw returns 59,024 — exactly the manifest rows field',
          'Câu SELECT count(*) FROM staging.shopcore_orders_raw trả về 59.024 — đúng bằng trường rows trong manifest',
        ),
      ],
    },

    {
      id: 'a03-t3',
      num: 3,
      title: bi('Build the cleaning rules, one at a time', 'Dựng từng quy tắc làm sạch, mỗi lúc một cái'),
      goal: bi(
        'Four cleaners, each eyeballed and counted before assembly.',
        'Bốn bộ làm sạch, mỗi cái đều được nhìn tận mắt và đếm trước khi lắp ráp.',
      ),
      steps: [
        {
          title: bi('The method: always look at the dirt first', 'Phương pháp: luôn nhìn vào rác trước'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'Never write a 60-line cleaning query in one go. Build each rule as a small SELECT, eyeball it, count it, then assemble.',
                'Đừng bao giờ viết một câu truy vấn làm sạch 60 dòng trong một lượt. Dựng từng quy tắc thành một câu SELECT nhỏ, nhìn tận mắt, đếm, rồi mới lắp lại.',
              ),
            },
          ],
        },
        {
          title: bi('a) Timestamps — three formats plus impossible dates', 'a) Mốc thời gian — ba định dạng cộng những ngày bất khả thi'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT order_ts FROM staging.shopcore_orders_raw
WHERE order_ts LIKE '%/%' OR order_ts LIKE '%T%' LIMIT 5;`,
            },
            {
              kind: 'code',
              lang: 'sql',
              body: "try_strptime(order_ts, ['%Y-%m-%d %H:%M:%S', '%d/%m/%Y %H:%M:%S', '%Y-%m-%dT%H:%M:%S'])",
            },
            {
              kind: 'expect',
              body: bi(
                'Rows where this returns NULL → 18 (0.03%). The docs promised ~0.02%; on 59k rows that noise is normal.',
                'Số dòng mà biểu thức này trả NULL là 18 dòng, tức 0,03%. Tài liệu hứa khoảng 0,02%; trên 59 nghìn dòng thì nhiễu như vậy là bình thường.',
              ),
            },
          ],
        },
        {
          title: bi('b) Money — four pathologies, one expression', 'b) Tiền — bốn bệnh lý, một biểu thức'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'order_total contains "$79.98", "N/A", empty, European decimal-comma forms "93,32" and "1.234,56", and negatives. Walk the cleaner inside-out: comma form → kill thousands-dots, comma becomes decimal point; otherwise trim and strip $; NULLIF turns \'N/A\' into NULL; TRY_CAST does the rest.',
                'Cột order_total chứa "$79.98", "N/A", ô rỗng, dạng dấu phẩy thập phân kiểu châu Âu như "93,32" và "1.234,56", cùng các giá trị âm. Đọc biểu thức từ trong ra ngoài: nếu có dấu phẩy thì xoá dấu chấm ngăn nghìn rồi đổi dấu phẩy thành dấu chấm thập phân; ngược lại thì cắt khoảng trắng và bỏ ký hiệu $; hàm NULLIF biến \'N/A\' thành NULL; TRY_CAST lo phần còn lại.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `TRY_CAST(NULLIF(
  CASE WHEN order_total LIKE '%,%'
       THEN replace(replace(order_total, '.', ''), ',', '.')
       ELSE replace(TRIM(order_total), '$', '') END,
  'N/A') AS DECIMAL(14,2))`,
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT v, <the cleaner> FROM (VALUES ('93,32'),('1.234,56'),('$79.98'),
  ('N/A'),(''),('-42.10')) t(v)
-- must give: 93.32, 1234.56, 79.98, NULL, NULL, -42.10`,
            },
            {
              kind: 'why',
              body: bi(
                'Test it on a values table before trusting it with real data — cheap and habit-forming. Negatives survive as negatives, on purpose: a negative total is not a format problem, it is a validity problem. A05 quarantines those. Cleansing and validation stay separate.',
                'Thử nó trên một bảng giá trị mẫu trước khi giao dữ liệu thật cho nó — rẻ và tạo được thói quen. Giá trị âm sống sót dưới dạng âm, một cách có chủ ý: tổng tiền âm không phải vấn đề định dạng mà là vấn đề tính hợp lệ. A05 sẽ cách ly chúng. Làm sạch và kiểm định giữ nguyên ranh giới.',
              ),
            },
          ],
        },
        {
          title: bi('c) customer_id — Excel-float to BIGINT', 'c) customer_id — từ số thực kiểu Excel về BIGINT'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: 'CAST(TRY_CAST(customer_id AS DOUBLE) AS BIGINT)',
            },
            {
              kind: 'why',
              body: bi(
                'The portable trick is a two-step cast through DOUBLE, turning \'123456.0\' → 123456.0 → 123456. DuckDB\'s direct TRY_CAST to BIGINT happens to tolerate a trailing .0, but many engines do not — learn the detour, it travels. IDs here are ≤ 1.2M, far below where DOUBLE loses integer precision.',
                'Mẹo dùng được ở mọi nơi là ép kiểu hai bước qua DOUBLE, biến \'123456.0\' thành 123456.0 rồi thành 123456. DuckDB tình cờ chấp nhận đuôi .0 khi TRY_CAST thẳng sang BIGINT, nhưng nhiều engine khác thì không — học đường vòng này vì nó đi được khắp nơi. Mã ở đây đều dưới 1,2 triệu, còn xa mới tới ngưỡng DOUBLE mất độ chính xác số nguyên.',
              ),
            },
          ],
        },
        {
          title: bi('d) Enums — status and payment_method', 'd) Tập giá trị hữu hạn — status và payment_method'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `CASE WHEN lower(TRIM(status)) IN
          ('created','paid','shipped','delivered','cancelled','refunded')
     THEN lower(TRIM(status)) END          AS status`,
            },
            {
              kind: 'text',
              body: bi(
                'TRIM first, then lower, then whitelist; anything not in the enum becomes NULL. status is given — payment_method is yours, same pattern and easier: casing and padding variants like "CARD" and " cod " are all fixable, so after trim+lower there is nothing left to NULL.',
                'TRIM trước, rồi lower, rồi lọc theo danh sách trắng; thứ gì không nằm trong tập giá trị thì thành NULL. Cột status đã cho sẵn — payment_method là phần của bạn, cùng khuôn và dễ hơn: các biến thể hoa thường và khoảng trắng thừa như "CARD" hay " cod " đều sửa được, nên sau khi trim và lower thì không còn gì phải chuyển thành NULL.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'lower() without TRIM(): \' cod \' lowercases to \' cod \' — still not \'cod\'. Both, in that order.',
                'Dùng lower() mà quên TRIM(): chuỗi \' cod \' viết thường ra vẫn là \' cod \' — vẫn không phải \'cod\'. Phải làm cả hai, đúng thứ tự đó.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Each cleaner runs standalone against staging.shopcore_orders_raw, touch-counts noted',
          'Từng bộ làm sạch chạy độc lập được trên staging.shopcore_orders_raw, đã ghi lại số dòng bị chạm vào',
        ),
      ],
    },

    {
      id: 'a03-t4',
      num: 4,
      title: bi('Assemble staging.shopcore_orders', 'Lắp ráp bảng staging.shopcore_orders'),
      goal: bi(
        'All cleaners plus in-file dedupe, and four checks you must be able to explain.',
        'Toàn bộ các bộ làm sạch cộng phép khử trùng trong cùng file, và bốn phép kiểm tra bạn phải giải thích được.',
      ),
      steps: [
        {
          title: bi('The window function does the dedupe', 'Hàm cửa sổ lo phần khử trùng'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'About 0.05% of order_ids appear twice within one file; the second copy is a correction (later updated_at, advanced status) — keep the latest.',
                'Khoảng 0,05% mã đơn hàng xuất hiện hai lần trong cùng một file; bản thứ hai là bản sửa, có updated_at muộn hơn và trạng thái tiến xa hơn — giữ bản mới nhất.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'A window function numbers rows within each group WITHOUT collapsing them, unlike GROUP BY. row_number() OVER (PARTITION BY order_id ORDER BY updated_at DESC) gives the newest row of each order_id rank 1.',
                'Hàm cửa sổ đánh số các dòng trong từng nhóm mà KHÔNG gộp chúng lại, khác với GROUP BY. Câu row_number() OVER (PARTITION BY order_id ORDER BY updated_at DESC) cho dòng mới nhất của mỗi order_id hạng 1.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `-- grain: one row = one order (its latest version in this file)
CREATE OR REPLACE TABLE staging.shopcore_orders AS
WITH cleaned AS (
    SELECT
        order_id,
        CAST(TRY_CAST(customer_id AS DOUBLE) AS BIGINT)          AS customer_id,
        store_id,
        try_strptime(order_ts, ['%Y-%m-%d %H:%M:%S', '%d/%m/%Y %H:%M:%S',
                                '%Y-%m-%dT%H:%M:%S'])            AS order_ts,
        updated_at,
        CASE WHEN lower(TRIM(status)) IN
                  ('created','paid','shipped','delivered','cancelled','refunded')
             THEN lower(TRIM(status)) END                        AS status,
        -- TODO: your payment_method cleaner from Task 3d
        -- TODO: the order_total cleaner from Task 3b
        items,          -- still a JSON string: parsing it is A04's whole show
        meta,           -- same
        _data_date, _run_id            -- lineage rides along untouched
    FROM staging.shopcore_orders_raw
),
numbered AS (
    SELECT *, row_number() OVER (PARTITION BY order_id
                                 ORDER BY updated_at DESC) AS rn FROM cleaned
)
SELECT * EXCLUDE (rn), CAST(order_ts AS DATE) AS order_date
FROM numbered WHERE rn = 1;`,
            },
            {
              kind: 'trap',
              body: bi(
                'This is in-file dedupe ONLY. The same order_id also reappears across later files — the late corrections that grew extra partitions in A02. Handling that properly is A08\'s topic.',
                'Đây CHỈ là khử trùng trong cùng một file. Cùng một order_id còn xuất hiện lại ở các file sau — chính là những bản sửa về trễ đã sinh thêm phân vùng ở A02. Xử lý chuyện đó cho đúng là chủ đề của A08.',
              ),
            },
          ],
        },
        {
          title: bi('Check 1 — the row count, and the two missing rows', 'Kiểm tra 1 — số dòng, và hai dòng lệch'),
          blocks: [
            {
              kind: 'expect',
              body: bi(
                'count(*) → 58,993 = 59,024 − 31. But the manifest says dup_rows: 29 — who are the other 2? Two late-correction rows happen to reference the same corrected order, a collision the dedupe rightly folds.',
                'count(*) cho ra 58.993 = 59.024 − 31. Nhưng manifest ghi dup_rows là 29 — vậy hai dòng còn lại là ai? Hai dòng sửa về trễ tình cờ cùng trỏ tới một đơn hàng đã sửa, một va chạm mà phép khử trùng gộp lại là đúng.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Never expect data to match theory to the row; expect to EXPLAIN the difference. That habit is the difference between a pipeline you trust and one you hope about.',
                'Đừng bao giờ mong dữ liệu khớp với lý thuyết tới từng dòng; hãy mong GIẢI THÍCH ĐƯỢC phần chênh lệch. Thói quen đó là khác biệt giữa một pipeline bạn tin tưởng và một pipeline bạn hy vọng.',
              ),
            },
          ],
        },
        {
          title: bi('Checks 2, 3, 4 — types, dates, freshness', 'Kiểm tra 2, 3, 4 — kiểu, ngày, độ tươi'),
          blocks: [
            {
              kind: 'expect',
              body: bi(
                'DESCRIBE staging.shopcore_orders — 13 columns, every one typed: BIGINT ids, TIMESTAMPs, DECIMAL(14,2) total, DATE order_date, and the lineage pair as DATE + BIGINT. Exactly four VARCHARs survive: items and meta (JSON, for A04) and the two enums.',
                'Chạy DESCRIBE staging.shopcore_orders — 13 cột, cột nào cũng có kiểu: mã dạng BIGINT, các mốc TIMESTAMP, tổng tiền DECIMAL(14,2), order_date kiểu DATE, và cặp lineage là DATE cộng BIGINT. Đúng bốn cột VARCHAR sống sót: items và meta (JSON, dành cho A04) cùng hai cột enum.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT order_date, count(*) FROM staging.shopcore_orders GROUP BY 1 ORDER BY 1;
-- 2026-06-01: 883  (late corrections for yesterday!)
-- 2026-06-02: 58092
-- NULL:        18  (unparseable timestamps — A05 quarantines them; staging keeps them, honestly NULL)

SELECT max(_data_date) FROM staging.shopcore_orders;   -- 2026-06-02`,
            },
            {
              kind: 'why',
              body: bi(
                'That last query is the staleness probe from the lineage rule: one query says how fresh the table is, no file spelunking. On any real warehouse it instantly answers "did last night\'s load run?" — A05 automates it.',
                'Câu cuối chính là que thăm độ tươi trong quy tắc lineage: một truy vấn cho biết bảng mới tới đâu, không phải lục lọi file. Trên bất kỳ kho dữ liệu thật nào, nó trả lời tức thì câu "lần nạp tối qua có chạy không?" — A05 sẽ tự động hoá việc này.',
              ),
            },
          ],
        },
      ],
      accept: [bi('All four checks pass', 'Cả bốn phép kiểm tra đều đạt')],
    },

    {
      id: 'a03-t5',
      num: 5,
      title: bi('The cleaning report', 'Báo cáo làm sạch'),
      goal: bi('Make the cleaning auditable: one row per rule, 13 rules.', 'Làm cho việc làm sạch kiểm toán được: mỗi quy tắc một dòng, tổng cộng 13 quy tắc.'),
      steps: [
        {
          title: bi('Six given, seven yours', 'Sáu cái cho sẵn, bảy cái của bạn'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'A CSV subtlety bites three of them: an empty CSV field arrives as NULL, not \'\'. WHERE col = \'\' matches nothing; test col IS NULL.',
                'Một chi tiết tinh vi của CSV cắn ba trong số các quy tắc: ô CSV rỗng về tới nơi dưới dạng NULL, không phải chuỗi rỗng. Điều kiện WHERE col = \'\' không khớp gì cả; phải kiểm tra col IS NULL.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `-- grain: one row = one cleaning rule for one file_date
CREATE OR REPLACE TABLE ops.cleaning_report AS
WITH raw AS (SELECT * FROM staging.shopcore_orders_raw)
SELECT DATE '2026-06-02' AS file_date, rule, rows_affected FROM (
    SELECT 'ts_ddmmyyyy_fixed' AS rule, count(*) AS rows_affected
    FROM raw WHERE order_ts LIKE '%/%'
    UNION ALL SELECT 'ts_isot_fixed', count(*) FROM raw WHERE order_ts LIKE '%T%'
    UNION ALL SELECT 'ts_unparseable_to_null', count(*) FROM raw
        WHERE try_strptime(order_ts, ['%Y-%m-%d %H:%M:%S','%d/%m/%Y %H:%M:%S',
                                      '%Y-%m-%dT%H:%M:%S']) IS NULL
    UNION ALL SELECT 'total_na_or_empty_to_null', count(*) FROM raw
        WHERE order_total IS NULL OR TRIM(order_total) = 'N/A'
    UNION ALL SELECT 'customer_id_float_fixed', count(*) FROM raw WHERE customer_id LIKE '%.0'
    UNION ALL SELECT 'dup_order_id_removed', count(*) - count(DISTINCT order_id) FROM raw
    -- TODO: total_dollar_stripped, total_decimal_comma_fixed, total_negative_kept,
    --       status_recased, status_junk_to_null, payment_recased, customer_id_missing
);`,
            },
          ],
        },
      ],
      accept: [
        bi(
          'The report has 13 rules matching the Verify table exactly',
          'Báo cáo có đủ 13 quy tắc khớp chính xác với bảng ở phần Tự kiểm chứng',
        ),
        bi(
          'Each rate (rows_affected / 59,024) agrees with SPEC §3.5 within noise — proof the cleaners fix the documented dirt and nothing else',
          'Mỗi tỉ lệ (số dòng ảnh hưởng chia 59.024) khớp với SPEC §3.5 trong phạm vi nhiễu — bằng chứng rằng các bộ làm sạch sửa đúng phần rác đã ghi trong tài liệu và không sửa gì khác',
        ),
      ],
    },

    {
      id: 'a03-t6',
      num: 6,
      title: bi('Clean the dimensions into core', 'Làm sạch các bảng chiều đưa vào core'),
      goal: bi(
        'Conformance for countries, three timestamp formats including epoch seconds, and explicit boolean whitelists.',
        'Hợp nhất biến thể cho quốc gia, ba định dạng thời gian trong đó có epoch giây, và danh sách trắng tường minh cho kiểu luận lý.',
      ),
      steps: [
        {
          title: bi('Discover first — read the output before coding', 'Khám phá trước — đọc kết quả rồi mới viết code'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'customers.csv is deliberately the dirtiest table per-capita in the lab.',
                'File customers.csv được cố ý làm bẩn nhất tính theo đầu dòng trong cả lab.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT country, count(*)   FROM read_csv('{R}/raw/dims/customers.csv', header=true)
GROUP BY 1 ORDER BY 2 DESC;          -- 24 spellings of 10 countries, plus NULL
SELECT is_active, count(*) FROM read_csv('{R}/raw/dims/customers.csv', header=true)
GROUP BY 1 ORDER BY 2 DESC;          -- 11 flavors of true/false, plus NULL`,
            },
          ],
        },
        {
          title: bi('a) Country conformance table', 'a) Bảng hợp nhất quốc gia'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `-- grain: one row = one spelling variant of one country
CREATE OR REPLACE TABLE staging.shopcore_country_map(variant VARCHAR, iso2 VARCHAR);
INSERT INTO staging.shopcore_country_map VALUES
 ('us','US'),('usa','US'),('united states','US'),
 ('vn','VN'),('vietnam','VN'),('viet nam','VN'),
 ('gb','GB'),('uk','GB'),('united kingdom','GB');
 -- TODO: DE, FR, JP, AU, CA, BR, IN variants — extend until Verify's country check passes`,
            },
            {
              kind: 'why',
              body: bi(
                'Join on lowercase so US and us need only one row. A new upstream spelling is then one INSERT, not a code change — that is the whole point of a mapping table over a CASE expression.',
                'Nối theo dạng chữ thường để US và us chỉ cần một dòng. Khi phía trên có thêm một cách viết mới thì chỉ cần một lệnh INSERT, không phải sửa code — đó chính là lý do dùng bảng ánh xạ thay vì biểu thức CASE.',
              ),
            },
          ],
        },
        {
          title: bi('b) Build core.customers', 'b) Dựng bảng core.customers'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'The star exhibit: signup_ts is ONE column with THREE formats — ISO timestamps, DD/MM/YYYY dates, and epoch seconds (integers like 1712345678 = seconds since 1970).',
                'Hiện vật chính: cột signup_ts là MỘT cột chứa BA định dạng — mốc thời gian ISO, ngày kiểu DD/MM/YYYY, và epoch giây (số nguyên như 1712345678, tức số giây kể từ năm 1970).',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `con.execute(f"""
-- grain: one row = one customer
CREATE OR REPLACE TABLE core.customers AS
WITH raw AS (
    SELECT * FROM read_csv('{R}/raw/dims/customers.csv', header=true,
        columns={{'customer_id':'BIGINT','name':'VARCHAR','email':'VARCHAR',
                 'country':'VARCHAR','city':'VARCHAR','signup_ts':'VARCHAR',
                 'is_active':'VARCHAR'}})
),
fixed AS (
    SELECT
        customer_id,
        CASE WHEN name LIKE '%,%'    -- "NGUYEN, Linh" -> "Linh Nguyen"
             THEN TRIM(split_part(name, ',', 2)) || ' ' ||
                  upper(substr(TRIM(split_part(name, ',', 1)), 1, 1)) ||
                  lower(substr(TRIM(split_part(name, ',', 1)), 2))
             ELSE TRIM(name) END                                  AS name,
        lower(TRIM(email))                                        AS email,
        TRIM(country)                                             AS country_raw,
        city,
        CASE WHEN signup_ts IS NULL THEN NULL
             WHEN regexp_full_match(signup_ts, '[0-9]+')
                 THEN CAST(to_timestamp(CAST(signup_ts AS BIGINT)) AS TIMESTAMP)
             ELSE try_strptime(signup_ts, ['%Y-%m-%d %H:%M:%S', '%d/%m/%Y'])
        END                                                       AS signup_ts,
        CASE WHEN lower(TRIM(is_active)) IN ('true','1','yes','y','t') THEN true
             WHEN lower(TRIM(is_active)) IN ('false','0','no','n','f') THEN false
        END                                                       AS is_active
    FROM raw
)
SELECT f.customer_id, f.name, f.email, m.iso2 AS country, f.city,
       f.signup_ts, f.is_active,
       current_date         AS _data_date,   -- dims are undated snapshots: sync date = load date
       CAST(NULL AS BIGINT) AS _run_id
FROM fixed f
LEFT JOIN staging.shopcore_country_map m ON lower(f.country_raw) = m.variant;
""")`,
            },
            {
              kind: 'trap',
              body: bi(
                'Digits-only rows take the epoch route via to_timestamp, which returns a timezone-aware value — that is why Setup pinned the session to UTC, or every laptop would decode epochs differently.',
                'Những dòng chỉ toàn chữ số đi theo nhánh epoch qua hàm to_timestamp, mà hàm này trả về giá trị có nhận biết múi giờ — đó là lý do phần Chuẩn bị ghim phiên làm việc về UTC, nếu không thì mỗi máy sẽ giải mã epoch ra một kiểu.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Beware TRY_CAST(is_active AS BOOLEAN): it accepts \'yes\' but not \'N\' — a half-right cleaner is worse than none. Whitelists are explicit, on both sides.',
                'Cẩn thận với TRY_CAST(is_active AS BOOLEAN): nó chấp nhận \'yes\' nhưng không chấp nhận \'N\' — một bộ làm sạch đúng một nửa còn tệ hơn không có. Danh sách trắng phải tường minh, cho cả hai phía.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'About 2% of names are FULL SHOUTING — counted today, fixed in stretch goal 1.',
                'Khoảng 2% tên đang VIẾT HOA TOÀN BỘ — hôm nay chỉ đếm, sửa ở bài mở rộng số 1.',
              ),
            },
          ],
        },
        {
          title: bi('c) Products and stores', 'c) Bảng sản phẩm và cửa hàng'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'products.unit_price has the European-comma disease too — reuse the Task 3b pattern on an explicit read. The file\'s seven columns, all VARCHAR in the columns dict: sku, product_name, category, subcategory, unit_price, tags, attrs. Clean unit_price to DECIMAL(10,2); keep tags and attrs as VARCHAR, they are A04 material. You write that CREATE TABLE yourself — write its grain on it first: one row = one sku.',
                'Cột products.unit_price cũng mắc bệnh dấu phẩy châu Âu — dùng lại khuôn của Task 3b trên một lệnh đọc tường minh. Bảy cột của file, tất cả để VARCHAR trong phần khai columns: sku, product_name, category, subcategory, unit_price, tags, attrs. Làm sạch unit_price về DECIMAL(10,2); giữ tags và attrs ở dạng VARCHAR vì chúng là nguyên liệu của A04. Câu CREATE TABLE này bạn tự viết — viết grain lên đầu trước đã: một dòng = một sku.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `-- grain: one row = one store
CREATE TABLE core.stores AS SELECT * FROM read_csv('{R}/raw/dims/stores.csv', header=true);`,
            },
            {
              kind: 'text',
              body: bi(
                'Auto-detect is fine here, but DESCRIBE the result before you trust it. Give both tables the two lineage columns too — dims use current_date as _data_date, since an undated snapshot\'s sync date is the day you pulled it. From today, every staging/core table carries them, and nothing carries more.',
                'Ở đây để máy tự dò kiểu là được, nhưng hãy DESCRIBE kết quả trước khi tin nó. Nhớ cho cả hai bảng hai cột lineage — các bảng chiều dùng current_date làm _data_date, vì ngày đồng bộ của một bản chụp không có ngày chính là ngày bạn kéo nó về. Từ hôm nay, mọi bảng staging và core đều mang hai cột đó, và không mang thêm gì nữa.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'The dim checks all pass: NULL counts, no unmapped countries, no comma-form names, no VARCHAR prices',
          'Toàn bộ phép kiểm tra bảng chiều đều đạt: số lượng NULL, không còn quốc gia chưa ánh xạ, không còn tên dạng có dấu phẩy, không còn giá dạng VARCHAR',
        ),
      ],
    },

    {
      id: 'a03-t7',
      num: 7,
      title: bi('Graduate the cleaners into work/cleaners.py', 'Thăng cấp các bộ làm sạch vào work/cleaners.py'),
      goal: bi(
        'One home for every rule, and a proof the refactor changed the plumbing and not one value.',
        'Một ngôi nhà duy nhất cho mọi quy tắc, và một bằng chứng rằng việc tái cấu trúc chỉ đổi đường ống chứ không đổi một giá trị nào.',
      ),
      steps: [
        {
          title: bi('Why now', 'Vì sao là lúc này'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'Your cleaning rules now live in two places — Task 4\'s staging SQL and Task 6\'s dim SQL — about to be four. A05\'s validate_day.py and A07\'s load_day.py will import this module. The extraction is mechanical: each cleaner becomes a function returning its SQL fragment as a string, with the column name as a parameter, so clean_money serves order_total now and unit_price five minutes later.',
                'Các quy tắc làm sạch của bạn hiện nằm ở hai chỗ — SQL staging của Task 4 và SQL bảng chiều của Task 6 — và sắp thành bốn. File validate_day.py của A05 và load_day.py của A07 sẽ import module này. Việc tách ra hoàn toàn máy móc: mỗi bộ làm sạch thành một hàm trả về đoạn SQL dưới dạng chuỗi, với tên cột làm tham số, nhờ vậy clean_money phục vụ order_total bây giờ và unit_price năm phút sau.',
              ),
            },
          ],
        },
        {
          title: bi('The module', 'Module'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `"""Cleaning rules for the shopcore feed, one per known pathology (SPEC 3.5).

Job: return canonical SQL expressions (as strings) that later code embeds in
its queries with f-strings. This module is the single home of these rules --
A05's checks and A07's pipeline import it; nobody re-pastes the SQL.

Assumptions:
  - dirty columns arrive as VARCHAR (staging reads dirt as text so it can count it)
  - session TimeZone is 'UTC' (clean_signup_ts decodes epoch seconds)
  - ids fit in a DOUBLE without precision loss (ours < 1.2M; limit ~2^53)
"""

TS_FORMATS = ['%Y-%m-%d %H:%M:%S', '%d/%m/%Y %H:%M:%S', '%Y-%m-%dT%H:%M:%S']

STATUS_VALUES = ('created', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')
PAYMENT_VALUES = ('card', 'wallet', 'bank_transfer', 'cod', 'paypal')


def _sql_list(values) -> str:
    """('a','b') -> "'a', 'b'" -- values must not contain single quotes."""
    return ", ".join(f"'{v}'" for v in values)


def clean_order_ts(col: str = "order_ts") -> str:
    """Three known formats -> TIMESTAMP; anything else (incl. impossible dates) -> NULL."""
    return f"try_strptime({col}, [{_sql_list(TS_FORMATS)}])"


def clean_money(col: str = "order_total") -> str:
    """'93,32'/'1.234,56' (euro), '$79.98', 'N/A'/empty -> DECIMAL(14,2) or NULL.

    Negatives survive on purpose: sign is a validity problem (A05), not a format one.
    """
    return (f"TRY_CAST(NULLIF("
            f"CASE WHEN {col} LIKE '%,%' "
            f"THEN replace(replace({col}, '.', ''), ',', '.') "  # thousands-dots first
            f"ELSE replace(TRIM({col}), '$', '') END, "
            f"'N/A') AS DECIMAL(14,2))")


def clean_id(col: str = "customer_id") -> str:
    """Excel-float '123456.0' -> BIGINT; empty/garbage -> NULL. DOUBLE detour: portable."""
    return f"CAST(TRY_CAST({col} AS DOUBLE) AS BIGINT)"


def clean_enum(col: str, allowed: tuple) -> str:
    """TRIM + lower, then whitelist; junk -> NULL. A cleaner never guesses a category."""
    return (f"CASE WHEN lower(TRIM({col})) IN ({_sql_list(allowed)}) "
            f"THEN lower(TRIM({col})) END")


def clean_signup_ts(col: str = "signup_ts") -> str:
    """ISO / DD-MM-YYYY / epoch-seconds strings -> TIMESTAMP. Digits-only = epoch."""
    return (f"CASE WHEN {col} IS NULL THEN NULL "
            f"WHEN regexp_full_match({col}, '[0-9]+') "
            f"THEN CAST(to_timestamp(CAST({col} AS BIGINT)) AS TIMESTAMP) "
            f"ELSE try_strptime({col}, ['%Y-%m-%d %H:%M:%S', '%d/%m/%Y']) END")


def clean_bool(col: str = "is_active") -> str:
    """Mixed booleans -> BOOLEAN; unknown -> NULL. Explicit whitelists on both sides."""
    return (f"CASE WHEN lower(TRIM({col})) IN ('true','1','yes','y','t') THEN true "
            f"WHEN lower(TRIM({col})) IN ('false','0','no','n','f') THEN false END")`,
            },
            {
              kind: 'text',
              body: bi(
                'Every expression is lifted verbatim from Tasks 3–6 — extraction, not invention. Note the module docstring states its JOB and its ASSUMPTIONS, and that comments state constraints, not narration.',
                'Mọi biểu thức đều được bê nguyên văn từ Task 3 tới 6 — tách ra chứ không sáng tác. Chú ý docstring của module nêu rõ NHIỆM VỤ và các GIẢ ĐỊNH, và các dòng chú thích nêu ràng buộc chứ không kể lể.',
              ),
            },
          ],
        },
        {
          title: bi('Now prove the refactor changed nothing', 'Giờ chứng minh việc tái cấu trúc không đổi gì'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Keep the hand-built table, rebuild staging through the module, then compare.',
                'Giữ lại bảng dựng bằng tay, dựng lại staging thông qua module, rồi so sánh.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `con.execute("""CREATE OR REPLACE TABLE staging.shopcore_orders_hand AS
               SELECT * FROM staging.shopcore_orders""")

from work.cleaners import (PAYMENT_VALUES, STATUS_VALUES, clean_enum, clean_id,
                           clean_money, clean_order_ts)

con.execute(f"""
-- grain: one row = one order (its latest version in this file)
CREATE OR REPLACE TABLE staging.shopcore_orders AS
WITH cleaned AS (
    SELECT
        order_id,
        {clean_id('customer_id')}                       AS customer_id,
        store_id,
        {clean_order_ts('order_ts')}                    AS order_ts,
        updated_at,
        {clean_enum('status', STATUS_VALUES)}           AS status,
        {clean_enum('payment_method', PAYMENT_VALUES)}  AS payment_method,
        {clean_money('order_total')}                    AS order_total,
        items, meta,
        _data_date, _run_id
    FROM staging.shopcore_orders_raw
),
numbered AS (
    SELECT *, row_number() OVER (PARTITION BY order_id
                                 ORDER BY updated_at DESC) AS rn FROM cleaned
)
SELECT * EXCLUDE (rn), CAST(order_ts AS DATE) AS order_date
FROM numbered WHERE rn = 1;
""")`,
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT
  (SELECT count(*) FROM (SELECT * FROM staging.shopcore_orders_hand
                         EXCEPT SELECT * FROM staging.shopcore_orders)) AS hand_not_module,
  (SELECT count(*) FROM (SELECT * FROM staging.shopcore_orders
                         EXCEPT SELECT * FROM staging.shopcore_orders_hand)) AS module_not_hand;
-- -> 0 | 0   (and count(*) is still 58,993)
DROP TABLE staging.shopcore_orders_hand;`,
            },
            {
              kind: 'glossary',
              items: [
                {
                  term: 'EXCEPT',
                  means: bi(
                    'Rows in the first set but not the second. Two empty EXCEPTs plus equal counts means identical tables. It works because both builds read the same unchanged _raw table.',
                    'Những dòng có trong tập thứ nhất mà không có trong tập thứ hai. Hai phép EXCEPT đều rỗng cộng với số dòng bằng nhau nghĩa là hai bảng giống hệt. Cách này đúng vì cả hai lần dựng đều đọc từ cùng một bảng _raw chưa hề thay đổi.',
                  ),
                },
              ],
            },
            {
              kind: 'text',
              body: bi(
                'Do the dims too: rebuild core.customers with clean_signup_ts and clean_bool in place of the inline expressions, and products with clean_money (add ::DECIMAL(10,2) to keep Task 6\'s type). Every Task 5 and 6 number must stay put.',
                'Làm cả các bảng chiều: dựng lại core.customers bằng clean_signup_ts và clean_bool thay cho các biểu thức viết thẳng, và bảng sản phẩm bằng clean_money (thêm ::DECIMAL(10,2) để giữ đúng kiểu của Task 6). Mọi con số của Task 5 và 6 phải giữ nguyên.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Staging count is still 58,993', 'Số dòng staging vẫn là 58.993'),
        bi('Both EXCEPT counts are 0', 'Cả hai phép EXCEPT đều trả về 0'),
        bi('Task 5 and 6 numbers unchanged', 'Các con số của Task 5 và 6 không đổi'),
      ],
    },

    {
      id: 'a03-t8',
      num: 8,
      title: bi('Pin the rules with tests: tests/test_cleaners.py', 'Ghim các quy tắc bằng test: tests/test_cleaners.py'),
      goal: bi(
        'Seven tests, running in about a second, that keep every fix fixed as the module evolves.',
        'Bảy phép kiểm thử chạy trong khoảng một giây, giữ cho mọi phép sửa vẫn đúng khi module tiến hoá.',
      ),
      steps: [
        {
          title: bi('Why a test file, and the pattern', 'Vì sao cần file kiểm thử, và khuôn mẫu'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'These rules are about to be depended on by every remaining assignment, then edited underneath them — stretch goal 2 rewires the enums, A10 adds new schema eras. A test file is how a fix stays fixed. Run each cleaner over a VALUES table in an IN-MEMORY DuckDB: duckdb.connect() with no path is a database born empty that dies with the test. No data files, no warehouse, so the suite runs anywhere in about a second.',
                'Các quy tắc này sắp bị mọi bài còn lại phụ thuộc vào, rồi lại bị sửa ngay bên dưới chúng — bài mở rộng số 2 thay lại cách xử lý enum, A10 thêm kỷ nguyên lược đồ mới. File kiểm thử là cách để một phép sửa vẫn còn đúng. Chạy từng bộ làm sạch trên một bảng VALUES trong một DuckDB TRONG BỘ NHỚ: gọi duckdb.connect() không kèm đường dẫn sẽ tạo ra một database sinh ra rỗng và chết theo bài test. Không file dữ liệu, không kho, nên bộ test chạy được ở đâu cũng chỉ mất khoảng một giây.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'You already did this by hand in Task 3b when you tried the money cleaner on a VALUES table; pytest makes the habit permanent.',
                'Bạn đã tự làm điều này bằng tay ở Task 3b khi thử bộ làm sạch tiền trên một bảng VALUES; pytest biến thói quen đó thành vĩnh viễn.',
              ),
            },
          ],
        },
        {
          title: bi('Two given, five yours', 'Hai cái cho sẵn, năm cái của bạn'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `"""Every pathology the lab cleans (SPEC 3.5), pinned as a test forever."""
from datetime import datetime
from decimal import Decimal

import duckdb
import pytest

from work.cleaners import (PAYMENT_VALUES, STATUS_VALUES, clean_bool,
                           clean_enum, clean_id, clean_money, clean_order_ts,
                           clean_signup_ts)


@pytest.fixture
def con():
    c = duckdb.connect()                # in-memory: born empty, gone after the test
    c.execute("SET TimeZone='UTC';")    # module assumption: epochs decode as UTC
    yield c
    c.close()


def check(con, expr, cases):
    """Run one cleaner over a VALUES table of (dirty, expected); compare row by row."""
    placeholders = ", ".join("(?)" for _ in cases)
    got = [row[0] for row in con.execute(
        f"SELECT {expr} FROM (VALUES {placeholders}) t(v)",
        [dirty for dirty, _ in cases]).fetchall()]
    assert got == [expected for _, expected in cases]


def test_money(con):
    check(con, clean_money("v"), [
        ("79.98",    Decimal("79.98")),     # clean passes through
        ("93,32",    Decimal("93.32")),     # European decimal comma
        ("1.234,56", Decimal("1234.56")),   # comma + thousands dot
        ("$79.98",   Decimal("79.98")),     # currency prefix
        ("N/A",      None),
        (None,       None),                 # empty CSV field
        ("-42.10",   Decimal("-42.10")),    # negatives survive: A05's call, not ours
    ])


def test_status(con):
    check(con, clean_enum("v", STATUS_VALUES), [
        ("delivered", "delivered"),
        ("PAID ",     "paid"),              # casing + padding
        ("Paid",      "paid"),
        ("unknown",   None),                # junk -> NULL, never a guess
        (None,        None),
    ])`,
            },
            {
              kind: 'text',
              body: bi(
                'The other five follow the same one-VALUES-row-per-pathology shape, and the import line already names every cleaner you need: test_order_ts (all three formats, the impossible 2026-06-31, NULL), test_customer_id (the Excel-float \'123456.0\'), test_payment (clean_enum again with PAYMENT_VALUES: casing, padding, \'bitcoin\' → NULL), test_signup_ts (ISO, DD/MM/YYYY, and a digits-only epoch — pin the exact UTC datetime it must decode to), and test_is_active (hits from both whitelists, \'maybe\' → NULL).',
                'Năm bài còn lại theo đúng khuôn mỗi bệnh lý một dòng VALUES, và dòng import phía trên đã gọi tên đủ mọi bộ làm sạch bạn cần: test_order_ts (cả ba định dạng, ngày bất khả thi 2026-06-31, và NULL), test_customer_id (số thực kiểu Excel \'123456.0\'), test_payment (lại là clean_enum nhưng với PAYMENT_VALUES: hoa thường, khoảng trắng, \'bitcoin\' thành NULL), test_signup_ts (ISO, DD/MM/YYYY, và một chuỗi toàn chữ số dạng epoch — ghim chính xác mốc UTC mà nó phải giải mã ra), và test_is_active (các giá trị thuộc cả hai danh sách trắng, \'maybe\' thành NULL).',
              ),
            },
          ],
        },
        {
          title: bi('Run it, then break it on purpose', 'Chạy nó, rồi cố ý làm nó hỏng'),
          blocks: [
            {
              kind: 'code',
              lang: 'text',
              body: `> python -m pytest tests/ -q
.......                                                                  [100%]
7 passed in 1.16s`,
            },
            {
              kind: 'why',
              body: bi(
                'A test you have never seen fail tells you nothing. Change one expected value — say ("PAID ", "paid") to ("PAID ", "Paid") — rerun, read the report, then revert it.',
                'Một bài test mà bạn chưa từng thấy nó hỏng thì chẳng nói lên điều gì. Đổi một giá trị kỳ vọng — ví dụ ("PAID ", "paid") thành ("PAID ", "Paid") — chạy lại, đọc báo cáo, rồi hoàn tác.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `FAILED tests/test_cleaners.py::test_status - AssertionError: assert ['deliver...
1 failed, 6 passed in 1.57s`,
            },
            {
              kind: 'trap',
              body: bi(
                'Run it from the repo root with python -m pytest — the -m puts the repo root on the import path so "from work.cleaners import …" resolves. A bare pytest may not even be on your PATH. From this assignment on, the lab rule is: python -m pytest tests/ -q is green before your branch merges to main.',
                'Chạy từ gốc repo bằng python -m pytest — cờ -m đặt gốc repo vào import path để dòng "from work.cleaners import …" phân giải được. Còn gọi pytest trần trụi thì có khi nó còn không nằm trong PATH của bạn. Từ bài này trở đi, luật của lab là: python -m pytest tests/ -q phải xanh trước khi nhánh của bạn gộp về main.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('7 passed in about a second', 'Bảy bài test đạt trong khoảng một giây'),
        bi('You have watched one deliberate failure and reverted it', 'Bạn đã tận mắt thấy một lần hỏng có chủ ý và đã hoàn tác'),
      ],
    },

    {
      id: 'a03-t9',
      num: 9,
      title: bi('Enrich and aggregate', 'Làm giàu và tổng hợp'),
      goal: bi(
        'The payoff layer, and a deliberate denormalization you can defend.',
        'Tầng thu hoạch, và một phép phi chuẩn hoá có chủ đích mà bạn bảo vệ được.',
      ),
      steps: [
        {
          title: bi('Join staging to the cleaned dims', 'Nối staging với các bảng chiều đã làm sạch'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'LEFT JOIN, because about 0.2% of orders have a missing or orphan customer_id and an INNER JOIN would silently drop them. A05 decides their fate; today we keep and count.',
                'Dùng LEFT JOIN, vì khoảng 0,2% đơn hàng có customer_id bị thiếu hoặc mồ côi, mà INNER JOIN sẽ âm thầm loại chúng đi. A05 sẽ quyết định số phận của chúng; hôm nay ta giữ lại và đếm.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `-- grain: one row = one order — unchanged by the joins (the count below proves it)
CREATE OR REPLACE TABLE core.orders_enriched AS
SELECT
    o.*,           -- incl. both lineage columns: they ride into core for free
    c.country AS customer_country, c.is_active  AS customer_is_active,
    s.store_name, s.region                      AS store_region,
    extract(hour FROM o.order_ts)               AS order_hour,
    extract(isodow FROM o.order_date) IN (6, 7) AS is_weekend,
    CASE WHEN o.order_total IS NULL THEN 'unknown'
         WHEN o.order_total < 0    THEN 'invalid'
         WHEN o.order_total < 20   THEN 'small'
         WHEN o.order_total < 100  THEN 'medium'
         WHEN o.order_total < 500  THEN 'large'
         ELSE 'huge' END                        AS total_bucket
FROM staging.shopcore_orders o
LEFT JOIN core.customers c USING (customer_id)
LEFT JOIN core.stores    s USING (store_id);`,
            },
            {
              kind: 'why',
              body: bi(
                'Name what you just did: a deliberate denormalization. customer_country, store_name and store_region are dimension attributes copied into the fact, so the everyday question "revenue by region" reads one table instead of joining three. That convenience is bought twice: in storage (58,993 copies of a two-character country code) and in freshness — when a customer moves country, the dim row changes and this table stays wrong until it is rebuilt. Here the trade is worth it because the whole table is rebuilt from scratch each run; the rule is that denormalization needs a stated reason, never a reflex.',
                'Hãy gọi tên việc bạn vừa làm: phi chuẩn hoá có chủ đích. Các cột customer_country, store_name và store_region là thuộc tính của bảng chiều được chép vào bảng sự kiện, để câu hỏi thường ngày "doanh thu theo vùng" chỉ đọc một bảng thay vì nối ba bảng. Sự tiện lợi đó phải trả giá hai lần: bằng dung lượng (58.993 bản sao của một mã quốc gia hai ký tự) và bằng độ tươi — khi một khách hàng chuyển quốc gia, dòng trong bảng chiều đổi còn bảng này vẫn sai cho tới khi được dựng lại. Ở đây đánh đổi này đáng, vì cả bảng được dựng lại từ đầu ở mỗi lần chạy; luật là phi chuẩn hoá phải có lý do được nói ra, không bao giờ là phản xạ.',
              ),
            },
          ],
        },
        {
          title: bi('Count what the join could not match', 'Đếm những gì phép nối không khớp được'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT count(*) FILTER (WHERE customer_id IS NULL)  AS missing_id,
       count(*) FILTER (WHERE customer_id IS NOT NULL
                        AND c.customer_id IS NULL)  AS orphan_id
FROM staging.shopcore_orders o LEFT JOIN core.customers c USING (customer_id);
-- -> 94 missing, 27 orphans (ids beyond the dim — upstream bug, not yours)`,
            },
            {
              kind: 'text',
              body: bi('Journal this number; A05 will hold you to it.', 'Ghi con số này vào journal; A05 sẽ bắt bạn chịu trách nhiệm với nó.'),
            },
          ],
        },
        {
          title: bi('The first aggregate table', 'Bảng tổng hợp đầu tiên'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `-- grain: one row = one store per order_date — the GROUP BY is a deliberate grain change,
--        the same move A04 makes with unnest (order grain -> item grain)
CREATE OR REPLACE TABLE core.daily_store_sales AS
SELECT
    order_date, store_id,
    any_value(store_name) AS store_name, any_value(store_region) AS region,
    count(*) AS orders, count(DISTINCT customer_id) AS customers,
    sum(order_total) AS gross_revenue, round(avg(order_total), 2) AS avg_order_value,
    count(*) FILTER (WHERE status = 'cancelled')   AS cancelled_orders,
    count(*) FILTER (WHERE order_total IS NULL)    AS orders_missing_total,
    any_value(_data_date) AS _data_date,  -- the lineage pair rides into the rollup too: one
    any_value(_run_id)    AS _run_id      -- delivery per build, so one value each per group
FROM core.orders_enriched
GROUP BY order_date, store_id;`,
            },
            {
              kind: 'why',
              body: bi(
                'Note orders_missing_total: aggregates must CARRY their uncertainty, not hide it — whoever reads gross_revenue deserves to know 117 orders contributed nothing to it. And note the lineage pair survives the GROUP BY: the two-column rule covers every staging/core table, rollups included. any_value is honest only because one build covers one delivery; a rollup spanning several loads would have to add them to the GROUP BY, or say max(_data_date) and mean "latest".',
                'Chú ý cột orders_missing_total: bảng tổng hợp phải MANG THEO phần bất định của nó chứ không giấu đi — ai đọc gross_revenue đều xứng đáng được biết có 117 đơn hàng không đóng góp gì vào con số đó. Và chú ý cặp cột lineage sống sót qua GROUP BY: quy tắc hai cột áp dụng cho mọi bảng staging và core, kể cả bảng tổng hợp. Hàm any_value chỉ trung thực vì một lần dựng ứng với một bản giao; một bảng tổng hợp trải qua nhiều lần nạp thì phải đưa chúng vào GROUP BY, hoặc viết max(_data_date) và hiểu là "mới nhất".',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Enriched count = 58,993 — nothing dropped', 'Số dòng bảng làm giàu bằng 58.993 — không mất dòng nào'),
        bi('Miss-split = 94 missing / 27 orphans', 'Phân tách lệch: 94 thiếu và 27 mồ côi'),
        bi(
          'daily_store_sales has 723 rows — why more than 400 stores? Late rows put two order_dates plus NULL in one file. That question is on the A08 exam.',
          'Bảng daily_store_sales có 723 dòng — vì sao nhiều hơn 400 cửa hàng? Vì các dòng về trễ khiến một file chứa hai order_date cộng thêm NULL. Câu hỏi đó nằm trong bài thi của A08.',
        ),
      ],
    },

    {
      id: 'a03-t10',
      num: 10,
      title: bi('Parameterize, then run at full scale', 'Tham số hoá, rồi chạy ở quy mô đầy đủ'),
      goal: bi(
        'One command rebuilds everything, at either scale.',
        'Một câu lệnh dựng lại toàn bộ, ở quy mô nào cũng được.',
      ),
      steps: [
        {
          title: bi('Collect the build into a script', 'Gom toàn bộ việc dựng vào một script'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'Hard-coded dates are a dead end — A07 and A11 will run ranges. Every cleaning rule is imported from work/cleaners.py, nothing re-pasted.',
                'Ngày ghi cứng là ngõ cụt — A07 và A11 sẽ chạy theo khoảng ngày. Mọi quy tắc làm sạch đều import từ work/cleaners.py, không dán lại thứ gì.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `# work/a03_build_day.py -- usage: python -m work.a03_build_day --date 2026-06-02 --scale small
import argparse, json
import duckdb
from lib.labpaths import data_root, warehouse_path, ensure_dirs
from work.cleaners import (PAYMENT_VALUES, STATUS_VALUES, clean_enum, clean_id,
                           clean_money, clean_order_ts)   # ONE home for the rules (Task 7)

def build_day(con, r: str, day: str) -> None:
    con.execute(f"CREATE OR REPLACE TABLE staging.shopcore_orders_raw AS ...")  # Task 2 — _data_date now comes from \`day\`
    con.execute(f"CREATE OR REPLACE TABLE staging.shopcore_orders AS ...")      # Task 7's module-built SQL, verbatim
    con.execute(f"CREATE OR REPLACE TABLE ops.cleaning_report AS ...")          # Task 5 (file_date = day)
    ...                                                                         # Tasks 6 + 9

ap = argparse.ArgumentParser()
ap.add_argument("--date", required=True)
ap.add_argument("--scale", choices=["small", "full"], default="small")
args = ap.parse_args()
ensure_dirs(args.scale); root = data_root(args.scale)
con = duckdb.connect(str(warehouse_path(args.scale)))
con.execute("SET memory_limit='8GB'; SET threads=8; SET TimeZone='UTC';")
con.execute(f"SET temp_directory='{root.as_posix()}/tmp';")
build_day(con, root.as_posix(), args.date)
man = json.loads((root / "raw" / "manifest" / f"orders_{args.date}.json").read_text())
got = con.execute("SELECT count(*) FROM staging.shopcore_orders_raw").fetchone()[0]
print(f"{args.date}: raw={got} manifest={man['rows']} match={got == man['rows']}")`,
            },
          ],
        },
        {
          title: bi('Run small, then full', 'Chạy small, rồi chạy full'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: 'python -m work.a03_build_day --date 2026-06-02 --scale small\npython -m work.a03_build_day --date 2026-06-02 --scale full',
            },
            {
              kind: 'expect',
              body: bi(
                'The small run must reproduce every number from Tasks 2–9. At full scale the CSV is ~350 MB / 1,180,490 rows; expect roughly 10–30 s total on the baseline machine. Full-scale staging lands at 1,179,758 rows = 1,180,490 − 590 in-file dups − 142 late-collisions.',
                'Lần chạy small phải tái lập đúng mọi con số từ Task 2 tới 9. Ở quy mô đầy đủ, file CSV nặng khoảng 350 MB với 1.180.490 dòng; dự kiến tổng cộng khoảng 10 tới 30 giây trên máy chuẩn. Bảng staging ở quy mô đầy đủ dừng ở 1.179.758 dòng = 1.180.490 − 590 bản trùng trong file − 142 va chạm do dòng về trễ.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Watch python\'s RAM in Task Manager — it stays far under the 8 GB limit because DuckDB streams the CSV. That is A01\'s pandas lesson, seen from the other side. Journal both wall-clocks: A12 will make you 3× faster and you will want the receipt.',
                'Theo dõi bộ nhớ của python trong Task Manager — nó ở xa dưới mức trần 8 GB vì DuckDB xử lý CSV theo dòng chảy. Đó chính là bài học pandas của A01 nhìn từ phía bên kia. Ghi cả hai mốc thời gian vào journal: A12 sẽ làm bạn nhanh gấp ba lần và lúc đó bạn sẽ cần cái biên lai này.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Both scales run end-to-end from one command', 'Cả hai quy mô chạy trọn vẹn từ một câu lệnh'),
        bi('Full raw count matches the manifest', 'Số dòng raw ở quy mô đầy đủ khớp với manifest'),
      ],
    },

    {
      id: 'a03-verify',
      title: bi('Verify yourself', 'Tự kiểm chứng'),
      goal: bi(
        'Thirteen rules and a dozen counts, all deterministic for small scale on 2026-06-02.',
        'Mười ba quy tắc và hơn chục con số đếm, tất cả đều tất định cho quy mô nhỏ ngày 2026-06-02.',
      ),
      steps: [
        {
          title: bi('The cleaning report table', 'Bảng báo cáo làm sạch'),
          blocks: [
            {
              kind: 'code',
              lang: 'text',
              body: `rule                       | rows_affected | SPEC 3.5 says
---------------------------|--------------:|---------------------------------
customer_id_float_fixed    |           120 | ~0.2%
customer_id_missing        |            94 | ~0.15%
dup_order_id_removed       |            31 | ~0.05% + late collisions
payment_recased            |           204 | ~0.3%
status_junk_to_null        |            71 | ~0.15%  (the 'unknown'/empty half)
status_recased             |            74 | ~0.15%  (the 'PAID '/'Paid' half)
total_decimal_comma_fixed  |           187 | ~0.3%
total_dollar_stripped      |           112 | ~0.2%
total_na_or_empty_to_null  |           117 | ~0.2%
total_negative_kept        |            52 | ~0.1%
ts_ddmmyyyy_fixed          |           231 | ~0.4%
ts_isot_fixed              |           164 | ~0.3%
ts_unparseable_to_null     |            18 | ~0.02%`,
            },
          ],
        },
        {
          title: bi('Staging and lineage checks', 'Kiểm tra staging và lineage'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT count(*) FROM staging.shopcore_orders;                         -- 58993
SELECT count(*) FROM staging.shopcore_orders WHERE order_ts IS NULL;  -- 18
SELECT order_date, count(*) FROM staging.shopcore_orders GROUP BY 1 ORDER BY 1;
-- 2026-06-01: 883 | 2026-06-02: 58092 | NULL: 18
SELECT max(_data_date) FROM staging.shopcore_orders;                  -- 2026-06-02

-- the two-column rule, asked of the catalog instead of your memory:
SELECT table_name, column_name, data_type FROM duckdb_columns()
WHERE (schema_name, table_name) IN (('staging','shopcore_orders'),
                                    ('core','daily_store_sales'))
  AND column_name LIKE '\\_%' ESCAPE '\\' ORDER BY 1, 2;
-- exactly two each, neither is a string, and the aggregate is not exempt`,
            },
          ],
        },
        {
          title: bi('Dimension and core checks', 'Kiểm tra bảng chiều và core'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT count(*) FROM core.customers;                            -- 60000
SELECT count(*) FROM core.customers WHERE signup_ts IS NULL;    -- 1175  (~2%)
SELECT count(*) FROM core.customers WHERE is_active IS NULL;    -- 1164  (~2%)
SELECT count(*) FROM core.customers WHERE country   IS NULL;    -- 548 (~1% blank)
SELECT min(signup_ts), max(signup_ts) FROM core.customers;
-- 2019-01-01 00:00:00 .. 2026-05-31 23:05:17   (sane dates = TZ pinned right)
SELECT count(*) FROM core.customers WHERE name LIKE '%,%';      -- 0
SELECT count(*) FROM core.products  WHERE unit_price IS NULL;   -- 0 (5 comma-forms fixed)

SELECT count(*) FROM core.orders_enriched;                      -- 58993
SELECT total_bucket, count(*) FROM core.orders_enriched GROUP BY 1 ORDER BY 2 DESC;
-- large 26289 | medium 25287 | small 6234 | huge 1014 | unknown 117 | invalid 52
SELECT count(*) FROM core.daily_store_sales;                    -- 723`,
            },
            {
              kind: 'expect',
              body: bi(
                'Full scale, same date: raw = 1,180,490 (manifest), staging = 1,179,758; roughly 10–30 s wall-clock. Numbers are identical whether staging was built by Task 4\'s hand-written SQL or Task 7\'s module — that is the whole point of the EXCEPT proof.',
                'Quy mô đầy đủ, cùng ngày: raw bằng 1.180.490 theo manifest, staging bằng 1.179.758; thời gian chạy khoảng 10 tới 30 giây. Các con số giống hệt nhau dù staging được dựng bằng SQL viết tay của Task 4 hay bằng module của Task 7 — đó chính là toàn bộ ý nghĩa của phép chứng minh bằng EXCEPT.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('All 13 report rules match', 'Cả 13 quy tắc trong báo cáo đều khớp'),
        bi('All staging, dim and core counts match', 'Mọi con số đếm ở staging, bảng chiều và core đều khớp'),
        bi('python -m pytest tests/ -q → 7 passed', 'Lệnh python -m pytest tests/ -q cho ra 7 bài đạt'),
      ],
    },

    {
      id: 'a03-mistakes',
      title: bi('Common beginner mistakes', 'Lỗi thường gặp của người mới'),
      goal: bi('Seven traps, most of which fail silently.', 'Bảy cái bẫy, mà phần lớn hỏng trong im lặng.'),
      steps: [
        {
          title: bi('The seven', 'Bảy lỗi'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'CAST where you meant TRY_CAST — one bad value kills a 59k-row load. The mirror is worse: TRY_CAST everywhere with no cleaning report, and revenue quietly goes NULL. Count, always.',
                'Dùng CAST trong khi ý bạn là TRY_CAST — một giá trị hỏng giết cả lần nạp 59 nghìn dòng. Cái ngược lại còn tệ hơn: TRY_CAST ở khắp nơi mà không có báo cáo làm sạch, thế là doanh thu lặng lẽ thành NULL. Luôn luôn đếm.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'De-commaing without killing thousands-dots first. replace(\'1.234,56\', \',\', \'.\') gives \'1.234.56\' → NULL. Inner replace(\'.\',\'\') first, like the canonical cleaner.',
                'Đổi dấu phẩy mà chưa xoá dấu chấm ngăn nghìn trước. Lệnh replace(\'1.234,56\', \',\', \'.\') cho ra \'1.234.56\' rồi thành NULL. Phải chạy replace(\'.\',\'\') ở bên trong trước, đúng như biểu thức chuẩn.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'lower() without TRIM(). \' cod \' lowercases to \' cod \' — still not \'cod\'.',
                'Dùng lower() mà không TRIM(). Chuỗi \' cod \' viết thường vẫn là \' cod \' — vẫn không phải \'cod\'.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                "Testing empties with = ''. DuckDB's CSV reader delivers empty fields as NULL, so that predicate matches nothing; three report rules silently return 0 if you get this wrong.",
                "Kiểm tra ô rỗng bằng = ''. Trình đọc CSV của DuckDB giao ô rỗng dưới dạng NULL, nên vị từ đó không khớp gì cả; ba quy tắc trong báo cáo sẽ âm thầm trả về 0 nếu bạn hiểu sai chỗ này.",
              ),
            },
            {
              kind: 'trap',
              body: bi(
                "Epoch timestamps without pinning the timezone. to_timestamp() is timezone-aware; skip SET TimeZone='UTC' and signup_ts shifts by your laptop's UTC offset — checks stop matching.",
                "Xử lý epoch mà không ghim múi giờ. Hàm to_timestamp() có nhận biết múi giờ; bỏ qua SET TimeZone='UTC' thì signup_ts sẽ lệch đúng bằng chênh lệch múi giờ của máy bạn — và các phép kiểm tra không còn khớp.",
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Cleaning downstream (core, marts, the BI tool). Fix a value in three downstream places and you own three future bugs. Staging is THE place; everything after it trusts the types.',
                'Làm sạch ở phía dưới, trong core, marts hay công cụ BI. Sửa một giá trị ở ba nơi phía dưới là bạn sở hữu ba lỗi tương lai. Staging là NƠI DUY NHẤT; mọi thứ sau nó tin vào kiểu dữ liệu đã có.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Running scripts by path instead of -m. python work/a03_bootstrap.py or a bare pytest starts Python\'s import path in the wrong directory — ModuleNotFoundError on lib or work. From the repo root, always python -i -m work.a03_bootstrap and python -m pytest tests/ -q.',
                'Chạy script theo đường dẫn thay vì dùng -m. Lệnh python work/a03_bootstrap.py hay pytest trần trụi khiến import path của Python bắt đầu ở sai thư mục — ModuleNotFoundError với lib hoặc work. Từ gốc repo, luôn dùng python -i -m work.a03_bootstrap và python -m pytest tests/ -q.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Đọc qua một lượt trước khi bắt đầu Task 3')],
    },

    {
      id: 'a03-stretch',
      title: bi('Stretch goals', 'Bài mở rộng'),
      goal: bi('Four optional exercises; the fourth teaches the most.', 'Bốn bài tự chọn; bài thứ tư dạy được nhiều nhất.'),
      steps: [
        {
          title: bi('1 — Fix the SHOUTING names', '1 — Sửa những cái tên VIẾT HOA'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `array_to_string(list_transform(string_split(lower(name), ' '), w ->
  upper(substr(w, 1, 1)) || substr(w, 2)), ' ')
-- applied only WHERE name = upper(name); prove the leftover count is 0`,
            },
            {
              kind: 'text',
              body: bi(
                '1,179 remain, about 2%. A sneak preview of A04\'s list functions.',
                'Còn lại 1.179 dòng, khoảng 2%. Xem trước một chút các hàm danh sách của A04.',
              ),
            },
          ],
        },
        {
          title: bi('2 — Promote the enums to mapping tables', '2 — Nâng cấp enum thành bảng ánh xạ'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Replace the status/payment CASE whitelists with staging.shopcore_status_map(variant, canonical) seeded by INSERTs (junk→NULL rows included), so a new upstream variant is one INSERT, not a code change. The edit belongs in work/cleaners.py, as a clean_enum_via_map beside clean_enum, and tests/test_cleaners.py grows to pin the new path. Rebuild; the report — and pytest — must not change.',
                'Thay các danh sách trắng CASE của status và payment bằng bảng staging.shopcore_status_map(variant, canonical) nạp sẵn bằng INSERT, kể cả các dòng rác ánh xạ về NULL, để một biến thể mới từ phía trên chỉ cần một lệnh INSERT chứ không phải sửa code. Phần sửa thuộc về work/cleaners.py, thành hàm clean_enum_via_map nằm cạnh clean_enum, và tests/test_cleaners.py mở rộng để ghim nhánh mới. Dựng lại; báo cáo và pytest đều không được đổi.',
              ),
            },
          ],
        },
        {
          title: bi('3 — Trend the dirt', '3 — Theo dõi xu hướng của rác'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Loop build_day over 5 v1 dates, appending (not replacing) the cleaning report, then query rates per day. They should be flat — that flatness is exactly what A05 turns into automated checks.',
                'Lặp hàm build_day qua 5 ngày thuộc v1, ghi thêm chứ không ghi đè báo cáo làm sạch, rồi truy vấn tỉ lệ theo từng ngày. Chúng phải phẳng — chính sự phẳng đó là thứ A05 biến thành các phép kiểm tra tự động.',
              ),
            },
          ],
        },
        {
          title: bi('4 — Price the columns you did not add', '4 — Định giá những cột bạn đã không thêm'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'The lineage rule argues from modeling. Argue from BYTES too, and watch the byte argument fail to matter — which is the real lesson. Write your day twice and compare.',
                'Quy tắc lineage lập luận từ góc độ mô hình hoá. Hãy thử lập luận từ góc độ SỐ BYTE nữa, rồi xem lập luận số byte thất bại thế nào — và đó mới là bài học thật.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `con.execute(f"COPY (SELECT * FROM staging.shopcore_orders) "
            f"TO '{R}/tmp/lineage_2col.parquet' (FORMAT parquet);")
con.execute(f"""COPY (SELECT *,
                        'orders_2026-06-02.csv'  AS _source_file,
                        CAST(now() AS TIMESTAMP) AS _loaded_at
                      FROM staging.shopcore_orders)
                TO '{R}/tmp/lineage_4col.parquet' (FORMAT parquet);""")`,
            },
            {
              kind: 'expect',
              body: bi(
                'Guess the delta before you measure. Naive arithmetic says 58,993 rows × (a 21-char file name + an 8-byte timestamp) ≈ 1.7 MB. Measured: 4,278,003 bytes vs 4,278,538 bytes. The two extra columns cost 535 bytes — 0.013%, about 1/100th of a byte per row, roughly 3,200× under the naive estimate.',
                'Đoán phần chênh trước khi đo. Phép tính ngây thơ nói 58.993 dòng nhân với (một tên file 21 ký tự cộng một mốc thời gian 8 byte) là khoảng 1,7 MB. Đo thật: 4.278.003 byte so với 4.278.538 byte. Hai cột thêm vào tốn 535 byte — tức 0,013%, khoảng một phần trăm byte trên mỗi dòng, thấp hơn ước lượng ngây thơ chừng 3.200 lần.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT path_in_schema, sum(total_compressed_size) AS bytes, any_value(encodings) AS enc
FROM parquet_metadata('<root>/tmp/lineage_4col.parquet') GROUP BY 1 ORDER BY 2 DESC;
-- items         1,752,622  PLAIN
-- _source_file         74  PLAIN_DICTIONARY   <- 58,993 rows of a 21-char string
-- _loaded_at           57  PLAIN_DICTIONARY
-- _data_date           53  PLAIN_DICTIONARY
-- _run_id              29  PLAIN`,
            },
            {
              kind: 'why',
              body: bi(
                'A column with one distinct value becomes a one-entry dictionary plus a run of identical indices, and that compresses to nothing. Write the conclusion in your journal, because it is the one people get backwards: the storage argument for two columns is WEAK — you could afford four. The reason to keep two is that _source_file and _loaded_at describe the run, so the run ledger is where they are correct, editable in one place, and never able to disagree with themselves across 1.2M copies.',
                'Một cột chỉ có một giá trị phân biệt trở thành một từ điển một mục cộng một chuỗi chỉ số giống hệt nhau, và cái đó nén xuống gần như bằng không. Hãy viết kết luận vào journal, vì đây là điều người ta hay hiểu ngược: lập luận dung lượng để giữ hai cột là YẾU — bạn thừa sức nuôi bốn cột. Lý do giữ hai cột là vì _source_file và _loaded_at mô tả lần chạy, nên bảng nhật ký lần chạy mới là nơi chúng đúng, sửa được ở một chỗ, và không bao giờ có thể tự mâu thuẫn qua 1,2 triệu bản sao.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Hoàn thành ít nhất một mục và ghi kết luận vào journal')],
    },
  ],
}
