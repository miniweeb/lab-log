import type { AssignmentSpec } from '../types'
import { bi, vi } from '../types'
import { a05Terms, a05Theory } from './a05.theory'

export const a05: AssignmentSpec = {
  id: 'a05',
  code: 'A05',
  title: bi('Validation & quarantine', 'Validation và quarantine'),
  summary: bi(
    'Load the good 98%, park the bad rows with evidence, and stop the line only when the contract says the dirt is abnormal.',
    'Nạp 98% phần tốt, giữ lại những dòng xấu kèm evidence, và chỉ dừng pipeline khi contract nói mức bẩn là bất thường.',
  ),
  estHours: 4,
  difficulty: 3,
  outcome: bi(
    'You can build a check suite that quarantines with evidence, gates on contract tolerances loaded from YAML, and leaves a paper trail that proves each check actually ran.',
    'Bạn dựng được một check suite biết quarantine kèm evidence, biết chặn dựa trên tolerance nạp từ file YAML của contract, và để lại dấu vết chứng minh từng check đã thật sự chạy.',
  ),
  theory: a05Theory,
  terms: a05Terms,
  tasks: [
    {
      id: 'a05-t0',
      title: bi('Setup', 'Chuẩn bị'),
      goal: bi('A branch, the scaffold, and one optional install deferred to Task 12.', 'Một nhánh, bộ khung, và một thư viện tuỳ chọn để dành tới Task 12.'),
      steps: [
        {
          title: bi('Branch and scale', 'Nhánh và quy mô'),
          blocks: [
            { kind: 'code', lang: 'powershell', body: 'git switch -c a05-validation' },
            {
              kind: 'text',
              body: bi(
                'Work at SMALL scale for Tasks 1–10 and 12; Task 11 re-runs at full scale. Task Manager open for Task 11; journal.md open throughout.',
                'Làm ở quy mô NHỎ cho Task 1 tới 10 và Task 12; Task 11 chạy lại ở scale full. Mở Task Manager cho Task 11; mở journal.md suốt buổi.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Optional install, Task 12 ONLY: pip install pandera. requirements.txt carries the line commented out for exactly this reason — install it when you reach the tool-bridge task, not before.',
                'Thư viện tuỳ chọn, CHỈ dành cho Task 12: pip install pandera. File requirements.txt để dòng đó ở dạng chú thích đúng vì lý do này — cài nó khi bạn tới task tool bridge, không phải trước đó.',
              ),
            },
          ],
        },
        {
          title: bi('Start work/a05_validation.py', 'Tạo file work/a05_validation.py'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `import duckdb
import yaml
from lib.labpaths import (raw_orders_dir, raw_dims_dir, manifest_dir,
                          warehouse_path, quarantine_dir, tmp_dir)

SCALE = "small"                 # develop here; Task 11 switches to "full"
DAY   = "2026-06-02"            # any v1 day; the verify numbers assume this one
CONTRACT = "contracts/shopcore_orders_daily.contract.yaml"   # in the repo, not <DATA_ROOT>

ORDERS_CSV = (raw_orders_dir(SCALE) / f"orders_{DAY}.csv").as_posix()
MANIFEST   = (manifest_dir(SCALE)   / f"orders_{DAY}.json").as_posix()
CUSTOMERS  = (raw_dims_dir(SCALE)   / "customers.csv").as_posix()
PRODUCTS   = (raw_dims_dir(SCALE)   / "products.csv").as_posix()
STORES     = (raw_dims_dir(SCALE)   / "stores.csv").as_posix()
QUARANTINE = quarantine_dir(SCALE)  / "orders"

con = duckdb.connect(str(warehouse_path(SCALE)))
con.execute(f"SET memory_limit='8GB'; SET threads=8; "
            f"SET temp_directory='{tmp_dir(SCALE).as_posix()}';")
con.execute("CREATE SCHEMA IF NOT EXISTS staging; CREATE SCHEMA IF NOT EXISTS core; "
            "CREATE SCHEMA IF NOT EXISTS ops;")`,
            },
            {
              kind: 'text',
              body: bi(
                'The code below joins referential-integrity checks against the RAW dim CSVs so this doc stands alone; joining your A03 core.customers and core.stores instead is the better architecture — same queries, different FROM.',
                'Phần code bên dưới nối các check toàn vẹn tham chiếu với các file CSV dimension THÔ để tài liệu này đứng độc lập được; nối với core.customers và core.stores từ A03 mới là kiến trúc tốt hơn — cùng truy vấn, chỉ khác mệnh đề FROM.',
              ),
            },
          ],
        },
      ],
      accept: [bi('Connection opens; three schemas exist', 'Kết nối mở được; ba schema đã tồn tại')],
    },

    {
      id: 'a05-t1',
      num: 1,
      title: bi('Read the rules — they live in the contract', 'Đọc luật — chúng nằm trong contract'),
      goal: bi('Load six tolerances from YAML instead of inventing them.', 'Nạp sáu tolerance từ file YAML thay vì tự nghĩ ra chúng.'),
      steps: [
        {
          title: bi('Load the tolerances', 'Nạp các tolerance'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'The checks you are about to build enforce PROMISES, and the promises are written down: contracts/shopcore_orders_daily.contract.yaml, v1.3.0, signed by shopcore\'s Checkout Platform team and yours. Skim its schema and quality blocks now; every check in Task 5 traces back to a line in it.',
                'Các check bạn sắp dựng là để thực thi những LỜI HỨA, và các lời hứa đó đã được viết ra: file contracts/shopcore_orders_daily.contract.yaml, version 1.3.0, ký giữa đội Checkout Platform của shopcore và đội của bạn. Hãy lướt qua khối schema và quality ngay bây giờ; mọi check ở Task 5 đều truy ngược về được một dòng trong đó.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `contract = yaml.safe_load(open(CONTRACT, encoding="utf-8"))
TOL = {rule: float(str(tol).rstrip('%'))     # YAML has no percent type --
       for rule, tol in                      # '0.5%' arrives as a *string*
       contract["quality"]["row_level_tolerances"].items()}

CHECK_FOR = {                                # contract rule -> Task 5 check name
    "null_or_invalid_status":  "bad_status",
    "unparseable_order_ts":    "bad_order_ts",
    "unparseable_order_total": "null_total",
    "orphan_customer_id":      "orphan_customer",
    "orphan_sku_lines":        "orphan_sku",
    "total_vs_items_mismatch": "total_mismatch",
}
THRESHOLDS = {CHECK_FOR[rule]: tol for rule, tol in TOL.items()}
print(contract["version"], THRESHOLDS)`,
            },
            {
              kind: 'why',
              body: bi(
                'Why not six literals? Because a tolerance is a SHARED DECISION, not your opinion — one number in one reviewed, versioned place. When v1.4.0 tightens orphan_customer_id, every consumer\'s gate follows on the next run, zero code edits.',
                'Sao không ghi thẳng sáu con số? Vì một tolerance là QUYẾT ĐỊNH CHUNG, không phải ý kiến của bạn — một con số ở một nơi duy nhất đã được duyệt và quản lý version. Khi version 1.4.0 siết chặt orphan_customer_id, gate của mọi consumer tự đi theo ở lần chạy kế tiếp, không sửa dòng code nào.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Two pieces of fine print worth a journal line: the contract budgets orphan SKU LINES while your check will flag whole ORDERS (close enough at these rates; noticing such mismatches is an A06 skill), and rules pinned without any tolerance — order_id is nullable: false, full stop — stay informational today.',
                'Hai dòng chữ nhỏ đáng ghi vào journal: contract đặt ngân sách cho các DÒNG HÀNG có sku mồ côi trong khi check của bạn lại gắn cờ cho cả ĐƠN HÀNG (ở mức tỉ lệ này thì đủ gần; nhận ra những chỗ lệch kiểu vậy là kỹ năng của A06), và những quy tắc được ghim mà không có tolerance nào — order_id là nullable: false, chấm hết — thì hôm nay chỉ mang tính thông tin.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'The script prints 1.3.0 and six thresholds — bad_order_ts and orphan_customer at 0.5, the rest at 1.0.',
                'Script in ra 1.3.0 và sáu ngưỡng — bad_order_ts và orphan_customer ở mức 0,5, còn lại ở mức 1,0.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Six thresholds printed, and you can point at the YAML line each one came from', 'In ra sáu ngưỡng, và bạn chỉ được ra dòng YAML mà từng cái đến từ đó'),
      ],
    },

    {
      id: 'a05-t2',
      num: 2,
      title: bi("Read the producer's claim", 'Đọc lời khai của producer'),
      goal: bi('DuckDB reads JSON files like tables.', 'DuckDB đọc file JSON như đọc bảng.'),
      steps: [
        {
          title: bi('One line', 'Một dòng'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.sql(f"SELECT rows, late_rows, dup_rows FROM read_json_auto('{MANIFEST}')").show()`,
            },
            {
              kind: 'text',
              body: bi(
                'Every orders file ships with a manifest — the producer stating what it wrote. The contract\'s delivery.completeness_signal clause is exactly this promise.',
                'Mỗi file đơn hàng đều đi kèm một manifest — producer khai báo họ đã ghi những gì. Điều khoản delivery.completeness_signal trong contract chính là lời hứa này.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('rows = 59024 for small 2026-06-02', 'Trường rows bằng 59.024 với bộ nhỏ ngày 2026-06-02'),
        bi('You can say what late_rows and dup_rows mean', 'Bạn nói được late_rows và dup_rows nghĩa là gì'),
      ],
    },

    {
      id: 'a05-t3',
      num: 3,
      title: bi('Stage one day, cleaned', 'Dựng staging cho một ngày, đã cleaning'),
      goal: bi('Validation runs on cleaned data, never on raw text.', 'Validation chạy trên dữ liệu đã cleaning, không bao giờ chạy trên văn bản thô.'),
      steps: [
        {
          title: bi('Rebuild the A03-style staging table', 'Dựng lại bảng staging theo kiểu A03'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.execute(f"""
CREATE OR REPLACE TABLE staging.shopcore_orders_day AS
SELECT
    order_id,
    CAST(TRY_CAST(customer_id AS DOUBLE) AS BIGINT)            AS customer_id,
    store_id,
    try_strptime(order_ts, ['%Y-%m-%d %H:%M:%S',
                            '%d/%m/%Y %H:%M:%S',
                            '%Y-%m-%dT%H:%M:%S'])              AS order_ts,
    updated_at,
    NULLIF(LOWER(TRIM(status)), '')                            AS status,
    NULLIF(LOWER(TRIM(payment_method)), '')                    AS payment_method,
    TRY_CAST(NULLIF(
      CASE WHEN order_total LIKE '%,%'
           THEN replace(replace(order_total, '.', ''), ',', '.')
           ELSE replace(TRIM(order_total), '$', '') END,
      'N/A') AS DECIMAL(14,2))                                 AS order_total,
    items,
    meta,
    DATE '{DAY}'                                               AS _data_date,
    CAST(NULL AS BIGINT)                                       AS _run_id
FROM read_csv('{ORDERS_CSV}',
    header=true,
    columns={{'order_id':'BIGINT','customer_id':'VARCHAR','store_id':'INTEGER',
             'order_ts':'VARCHAR','updated_at':'TIMESTAMP','status':'VARCHAR',
             'payment_method':'VARCHAR','order_total':'VARCHAR',
             'items':'VARCHAR','meta':'VARCHAR'}});
""")`,
            },
            {
              kind: 'why',
              body: bi(
                'The timestamp, money and id cleaners are not new code — they are clean_order_ts, clean_money and clean_id, the expressions that graduated into work/cleaners.py at the end of A03, spelled out inline only so you can reread each rule next to the dirt it handles. In your script, build those three columns by importing them rather than re-pasting.',
                'Ba bộ cleaning cho thời gian, tiền và mã không phải code mới — chúng chính là clean_order_ts, clean_money và clean_id, những biểu thức đã tốt nghiệp vào work/cleaners.py ở cuối A03, viết thẳng ra đây chỉ để bạn đọc lại từng quy tắc cạnh phần rác mà nó xử lý. Trong script của bạn, hãy dựng ba cột đó bằng cách import chứ không dán lại.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Note what staging does NOT do: it does not map \'unknown\' status to NULL or drop anything. Representation is normalized; judging values is the check suite\'s job — which is why the two enum columns deliberately SKIP clean_enum (its whitelist already judges: junk → NULL) and keep only the lighter NULLIF(LOWER(TRIM(...)), \'\'). A junk status must reach quarantine with its value intact as evidence.',
                'Chú ý điều mà staging KHÔNG làm: nó không ánh xạ trạng thái \'unknown\' thành NULL và không bỏ đi thứ gì. Cách biểu diễn thì được normalize; còn đánh giá giá trị là việc của check suite — và đó là lý do hai cột enum cố ý BỎ QUA clean_enum (whitelist của nó đã đánh giá sẵn: rác thành NULL) mà chỉ giữ version nhẹ hơn là NULLIF(LOWER(TRIM(...)), \'\'). Một trạng thái rác phải tới được quarantine với giá trị còn nguyên vẹn để làm evidence.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'count(*) equals the manifest rows exactly. That equality IS reconciliation — you formalize it in Task 7.',
          'count(*) bằng đúng trường rows trong manifest. Chính sự bằng nhau đó LÀ reconciliation — bạn sẽ chính thức hoá nó ở Task 7.',
        ),
      ],
    },

    {
      id: 'a05-t4',
      num: 4,
      title: bi('What do the items say each order costs?', 'Các dòng hàng nói mỗi đơn đáng giá bao nhiêu?'),
      goal: bi('Per-order items total, plus orphan SKU counts, in one pass.', 'Tổng tiền theo dòng hàng cho từng đơn, cộng số sku mồ côi, trong một lượt.'),
      steps: [
        {
          title: bi('Explode in a subquery', 'Bung ra trong một truy vấn con'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.execute(f"""
CREATE OR REPLACE TEMP TABLE items_agg AS
SELECT order_id, updated_at,
       round(sum(it.qty * it.unit_price), 2) AS items_total,
       count(*) FILTER (p.sku IS NULL)       AS n_orphan_sku
FROM (
    SELECT order_id, updated_at,
           unnest(CAST(items AS JSON)::STRUCT(sku VARCHAR, qty INTEGER,
                                              unit_price DOUBLE)[]) AS it
    FROM staging.shopcore_orders_day
) LEFT JOIN read_csv('{PRODUCTS}', header=true) p ON it.sku = p.sku
GROUP BY 1, 2;
""")`,
            },
            {
              kind: 'why',
              body: bi(
                'Why group by (order_id, updated_at), not just order_id? Because ~0.05% of order_ids appear twice in one file — in-file corrections, A08\'s problem. The PAIR is unique; the id alone is not. You prove that in Task 7.',
                'Vì sao gom nhóm theo cặp (order_id, updated_at) chứ không chỉ order_id? Vì khoảng 0,05% mã đơn hàng xuất hiện hai lần trong cùng một file — đó là các bản sửa trong cùng file, bài toán của A08. CẶP đó mới là duy nhất; riêng mã thì không. Bạn sẽ chứng minh điều đó ở Task 7.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'unnest cannot share a SELECT with GROUP BY — explode in a subquery, aggregate outside. Binder error, every time.',
                'Hàm unnest không dùng chung câu SELECT với GROUP BY được — bung ra trong truy vấn con, tổng hợp ở bên ngoài. Không thì lỗi binder, lần nào cũng vậy.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('items_agg has exactly as many rows as staging.shopcore_orders_day', 'Bảng items_agg có đúng bằng số dòng của staging.shopcore_orders_day'),
        bi('count(*) WHERE n_orphan_sku > 0 is roughly 310 (≈0.5% of orders)', 'count(*) với điều kiện n_orphan_sku > 0 vào khoảng 310, tức chừng 0,5% số đơn'),
      ],
    },

    {
      id: 'a05-t5',
      num: 5,
      title: bi('The check suite → one reject_reason per row', 'Bộ kiểm tra → một reject_reason cho mỗi dòng'),
      goal: bi('Flag every row, collecting ALL reasons it fails.', 'Gắn cờ mọi dòng, thu thập TẤT CẢ lý do khiến nó trượt.'),
      steps: [
        {
          title: bi('Eight given, four TODO', 'Tám cái cho sẵn, bốn cái để bạn viết'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.execute(f"""
CREATE OR REPLACE TEMP TABLE flagged AS
SELECT s.*, i.items_total,
       NULLIF(concat_ws('; ',
         CASE WHEN s.order_id IS NULL THEN 'null_order_id' END,
         CASE WHEN s.order_ts IS NULL THEN 'bad_order_ts' END,
         -- the contract's range clause on order_ts: within
         -- [business_date - 7 days, business_date + 1 day)
         CASE WHEN s.order_ts IS NOT NULL AND NOT (
                s.order_ts >= GREATEST(DATE '2026-06-01',
                                       DATE '{DAY}' - INTERVAL 7 DAY)
            AND s.order_ts <  DATE '{DAY}' + INTERVAL 1 DAY)
              THEN 'ts_out_of_range' END,
         -- enum whitelist -- the contract's allowed_values, verbatim
         CASE WHEN s.status IS NULL OR s.status NOT IN
              ('created','paid','shipped','delivered','cancelled','refunded')
              THEN 'bad_status' END,
         -- TODO 'bad_payment': whitelist card/wallet/bank_transfer/cod/paypal
         CASE WHEN s.order_total IS NULL THEN 'null_total' END,
         CASE WHEN s.order_total < 0 THEN 'negative_total' END,
         -- cross-field: v1 rule is total == items sum, one cent of slack;
         -- guarded so a negative total is flagged once, not twice
         CASE WHEN s.order_total >= 0 AND i.items_total IS NOT NULL
               AND abs(s.order_total - i.items_total) > 0.01
              THEN 'total_mismatch' END,
         -- referential integrity
         -- TODO 'null_customer':   customer_id IS NULL
         -- TODO 'orphan_customer': customer_id set, but c.customer_id IS NULL
         -- TODO 'orphan_store':    no such store in the dim
         CASE WHEN i.n_orphan_sku > 0 THEN 'orphan_sku' END
       ), '') AS reject_reason
FROM staging.shopcore_orders_day s
LEFT JOIN items_agg i USING (order_id, updated_at)
LEFT JOIN read_csv('{CUSTOMERS}', header=true) c ON s.customer_id = c.customer_id
LEFT JOIN read_csv('{STORES}',    header=true) st ON s.store_id   = st.store_id;
""")
print(con.execute("SELECT count(*), count(reject_reason) FROM flagged").fetchone())`,
            },
            {
              kind: 'glossary',
              items: [
                {
                  term: "concat_ws('; ', ...)",
                  means: bi(
                    'Glues the CASE results together, skipping NULLs — so a row that fails three checks gets all three names in one string.',
                    'Dán các kết quả CASE lại với nhau và tự bỏ qua NULL — nên một dòng trượt ba check sẽ có đủ ba cái tên trong một chuỗi.',
                  ),
                },
                {
                  term: "NULLIF(..., '')",
                  means: bi(
                    'A fully clean row produces an empty string from concat_ws; this turns it into NULL so count(reject_reason) works.',
                    'Một dòng hoàn toàn sạch sẽ cho ra chuỗi rỗng từ concat_ws; hàm này biến nó thành NULL để count(reject_reason) chạy đúng.',
                  ),
                },
                {
                  term: 'count(reject_reason)',
                  means: bi(
                    'Counts non-NULLs — your quarantine count, in one aggregate.',
                    'Đếm các giá trị khác NULL — chính là số dòng bị quarantine, gói trong một phép tổng hợp.',
                  ),
                },
              ],
            },
            {
              kind: 'text',
              body: bi(
                'Look at ten victims (... FROM flagged WHERE reject_reason IS NOT NULL LIMIT 10); every reason should make you nod.',
                'Xem thử mười nạn nhân (... FROM flagged WHERE reject_reason IS NOT NULL LIMIT 10); mọi lý do đều phải khiến bạn gật đầu.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'With the reference rules, small 2026-06-02 flags 992 rows (1.68%). Within a few dozen means your rules differ slightly — find and justify each difference. Zero or thousands means a bug: wrong join key, or you validated raw instead of staged.',
                'Với bộ quy tắc chuẩn, bộ nhỏ ngày 2026-06-02 gắn cờ 992 dòng, tức 1,68%. Lệch vài chục dòng nghĩa là quy tắc của bạn hơi khác — hãy tìm và giải thích từng chỗ khác. Ra số không hoặc hàng nghìn là có lỗi: sai khoá nối, hoặc bạn đã validation dữ liệu thô thay vì dữ liệu đã staging.',
              ),
            },
          ],
        },
      ],
      accept: [bi('992 rows flagged (1.68%) on small 2026-06-02', 'Gắn cờ 992 dòng, tức 1,68%, với bộ nhỏ ngày 2026-06-02')],
    },

    {
      id: 'a05-t6',
      num: 6,
      title: bi('Split load: quarantine, gate, then core', 'Chia lần nạp: quarantine, chặn, rồi mới vào core'),
      goal: bi('Order matters. Say it out loud before running.', 'Thứ tự quan trọng. Hãy nói to nó ra trước khi chạy.'),
      steps: [
        {
          title: bi('Park the evidence → check the tolerances → load', 'Gửi tạm evidence → kiểm ngưỡng → nạp'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `bad, staged = con.execute(
    "SELECT count(reject_reason), count(*) FROM flagged").fetchone()
pct = 100.0 * bad / staged

# 1) evidence is ALWAYS written, even (especially) on a terrible day
QUARANTINE.mkdir(parents=True, exist_ok=True)   # COPY creates partition dirs,
                                                # but not missing parents
con.execute(f"""
COPY (
  SELECT *, now() AT TIME ZONE 'UTC' AS _rejected_at,
         COALESCE(CAST(order_ts AS DATE), DATE '{DAY}') AS order_date
  FROM flagged WHERE reject_reason IS NOT NULL
) TO '{QUARANTINE.as_posix()}'
  (FORMAT parquet, PARTITION_BY (order_date), OVERWRITE_OR_IGNORE,
   FILENAME_PATTERN 'from_{DAY}_{{i}}');
""")`,
            },
            {
              kind: 'trap',
              body: bi(
                'COALESCE(..., DATE \'{DAY}\') — a row with an unparseable timestamp has no order_date; it borrows the file\'s date rather than becoming a NULL partition key. And FILENAME_PATTERN: late bad rows land in EARLIER order_date= partitions, so consecutive days write into shared folders; default naming would let day D+1 overwrite day D\'s data_0.parquet there. This is A02\'s rake in a new place.',
                'Hàm COALESCE(..., DATE \'{DAY}\') — một dòng có mốc thời gian không phân tích được thì không có order_date; nó mượn ngày của file thay vì trở thành khoá phân vùng NULL. Còn FILENAME_PATTERN: những dòng xấu về trễ rơi vào các phân vùng order_date= CŨ HƠN, nên các ngày liên tiếp cùng ghi vào thư mục dùng chung; cách đặt tên mặc định sẽ để ngày D+1 đè lên file data_0.parquet của ngày D ở đó. Đây là cái cào của A02 ở một chỗ mới.',
              ),
            },
          ],
        },
        {
          title: bi('The gate — before core sees a row', 'Gate — trước khi core nhìn thấy một dòng nào'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.execute("""
CREATE TABLE IF NOT EXISTS ops.alerts (
  alert_ts TIMESTAMP, run_id BIGINT, severity VARCHAR,
  source VARCHAR, message VARCHAR);
""")
rate = dict(con.execute(f"""
    SELECT reason, round(100.0 * count(*) / {staged}, 3) FROM (
      SELECT unnest(string_split(reject_reason, '; ')) AS reason
      FROM flagged WHERE reject_reason IS NOT NULL) GROUP BY 1""").fetchall())
breaches = [(c, rate.get(c, 0.0), t)
            for c, t in THRESHOLDS.items() if rate.get(c, 0.0) > t]
if breaches:
    for check, got, limit in breaches:
        msg = (f"DQ HARD FAIL {DAY}: {check} at {got}% "
               f"exceeds contract tolerance {limit}%")
        con.execute("INSERT INTO ops.alerts VALUES "
                    "(current_timestamp, NULL, 'error', 'dq_gate', ?)", [msg])
        print("ALERT:", msg)
    raise RuntimeError(f"DQ HARD FAIL {DAY}: {len(breaches)} contract "
                       f"tolerance(s) breached. Nothing loaded to core.")`,
            },
            {
              kind: 'why',
              body: bi(
                'ops.alerts is created here and reused for the rest of the lab: A07 writes error alerts when a run dies for good, A11 when a file misses its SLA. Its run_id stays NULL for the same reason _run_id does — until A07, whose BIGINT run-ledger ids the column is typed to hold. The RuntimeError doubles as the non-zero exit code; in production that line is where the pager fires.',
                'Bảng ops.alerts được tạo ở đây và dùng lại suốt phần còn lại của lab: A07 ghi cảnh báo mức error khi một lần chạy chết hẳn, A11 ghi khi một file trễ hạn cam kết. Cột run_id của nó vẫn NULL vì cùng lý do với _run_id — cho tới A07, nơi sinh ra các mã lần chạy kiểu BIGINT mà cột này được khai để chứa. Câu lệnh RuntimeError đồng thời đóng vai mã thoát khác không; trong production thì đó là dòng khiến hệ thống báo động kích hoạt.',
              ),
            },
          ],
        },
        {
          title: bi('Then the good rows', 'Rồi mới tới các dòng tốt'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.execute("""
-- grain: one row = one delivered version of an order (unique on order_id,
-- _data_date). Not one row per order: ~1.5% of every file re-delivers a prior
-- day's order as a correction, and A08 is where you fold those down.
CREATE TABLE IF NOT EXISTS core.orders AS
SELECT * EXCLUDE (reject_reason), CAST(order_ts AS DATE) AS order_date
FROM flagged WHERE 1 = 0;              -- WHERE 1=0: clone the shape, zero rows
""")
con.execute("""
INSERT INTO core.orders
SELECT * EXCLUDE (reject_reason), CAST(order_ts AS DATE) AS order_date
FROM flagged WHERE reject_reason IS NULL;
""")`,
            },
            {
              kind: 'trap',
              body: bi(
                'Plain INSERT into core is NOT rerun-safe: run it twice, the day is in core twice. Live with it today — re-run means DROP TABLE core.orders and reload; A07 fixes this properly.',
                'Lệnh INSERT thường vào core KHÔNG an toàn khi chạy lại: chạy hai lần thì ngày đó nằm trong core hai lần. Hôm nay cứ sống chung với nó — chạy lại nghĩa là DROP TABLE core.orders rồi nạp lại; A07 sẽ sửa cho đàng hoàng.',
              ),
            },
            {
              kind: 'code',
              lang: 'powershell',
              body: 'Get-ChildItem "$env:ETL_LAB_DATA\\small\\quarantine\\orders"',
            },
          ],
        },
      ],
      accept: [
        bi('core.orders has 58,032 rows (= 59,024 − 992)', 'Bảng core.orders có 58.032 dòng, bằng 59.024 trừ 992'),
        bi('The quarantine Parquet holds 992 rows', 'File Parquet trong quarantine chứa 992 dòng'),
        bi('count(*) FROM ops.alerts returns 0 — a clean day pages nobody', 'count(*) trên ops.alerts trả về 0 — một ngày sạch thì không báo động ai cả'),
        bi(
          'You can explain why a folder order_date=2026-06-01 exists even though you loaded 2026-06-02',
          'Bạn giải thích được vì sao có thư mục order_date=2026-06-01 dù bạn nạp ngày 2026-06-02',
        ),
      ],
    },

    {
      id: 'a05-t7',
      num: 7,
      title: bi("ops.dq_report — the suite's paper trail", 'ops.dq_report — paper trail của check suite'),
      goal: bi('One row per (date, check) — including zero-failure checks.', 'Mỗi cặp (ngày, check) một dòng — kể cả những phép không có lỗi nào.'),
      steps: [
        {
          title: bi('Why zeros matter', 'Vì sao con số không lại quan trọng'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'Checks nobody can see later might as well not have run. Zeros matter: bad_payment = 0 PROVES A03\'s normalization works. A report that only lists failures cannot distinguish "this check passed" from "this check was never executed".',
                'Những check mà sau này không ai nhìn thấy được thì cũng như chưa từng chạy. Con số không có ý nghĩa riêng: bad_payment bằng 0 CHỨNG MINH phép normalize của A03 hoạt động. Một báo cáo chỉ liệt kê lỗi thì không phân biệt được "phép này đã đạt" với "phép này chưa từng được chạy".',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `con.execute("""
CREATE TABLE IF NOT EXISTS ops.dq_report (
  run_at TIMESTAMP, order_date DATE, check_type VARCHAR, check_name VARCHAR,
  rows_checked BIGINT, rows_failed BIGINT, pct_failed DOUBLE,
  threshold_pct DOUBLE, passed BOOLEAN);
""")
# row checks: observed failure counts, left-joined onto the FULL check list.
check_rows = ", ".join(
    f"('{c}', {THRESHOLDS.get(c, 'NULL')})"
    for c in ['null_order_id','bad_order_ts','ts_out_of_range','bad_status',
              'bad_payment','null_total','negative_total','total_mismatch',
              'null_customer','orphan_customer','orphan_store','orphan_sku'])
con.execute(f"""
INSERT INTO ops.dq_report
WITH observed AS (
  SELECT reason, count(*) AS n FROM (
    SELECT unnest(string_split(reject_reason, '; ')) AS reason
    FROM flagged WHERE reject_reason IS NOT NULL)
  GROUP BY 1
)
SELECT current_timestamp, DATE '{DAY}', 'row', c.check_name,
       {staged}, coalesce(o.n, 0),
       round(100.0 * coalesce(o.n, 0) / {staged}, 3) AS pct,
       c.threshold_pct,
       coalesce(pct <= c.threshold_pct, true)
FROM (VALUES {check_rows}) c(check_name, threshold_pct)
LEFT JOIN observed o ON o.reason = c.check_name;
""")`,
            },
          ],
        },
        {
          title: bi('Aggregate and reconciliation rows', 'Các dòng aggregate và reconcile'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `# aggregate: (order_id, updated_at) must be unique -- Task 4's claim, proven
con.execute(f"""
INSERT INTO ops.dq_report
SELECT current_timestamp, DATE '{DAY}', 'aggregate', 'unique_order_id_updated_at',
       {staged}, count(*), round(100.0 * count(*) / {staged}, 3), 0.0, count(*) = 0
FROM (SELECT order_id, updated_at FROM staging.shopcore_orders_day
      GROUP BY 1, 2 HAVING count(*) > 1);
""")
# aggregate TODO -- YOU write 'dup_order_id': same shape but grouped by
# order_id alone; informational (threshold NULL, passed true).

# reconciliation: our count vs the producer's manifest
con.execute(f"""
INSERT INTO ops.dq_report
SELECT current_timestamp, DATE '{DAY}', 'reconciliation', 'rowcount_vs_manifest',
       {staged}, abs({staged} - rows), NULL, 0.0, {staged} = rows
FROM read_json_auto('{MANIFEST}');
""")
# aggregate TODO -- YOU write 'quarantine_rate': rows_failed = bad,
# pct_failed = pct, threshold_pct = NULL (the contract budgets per rule,
# not per day), passed = true. Stretch goal 1's trend chart uses this row.`,
            },
          ],
        },
      ],
      accept: [
        bi(
          "count(*) FROM ops.dq_report WHERE order_date = DATE '2026-06-02' returns 16 (12 row + 3 aggregate + 1 reconciliation)",
          "count(*) trên ops.dq_report với order_date = DATE '2026-06-02' trả về 16, gồm 12 row-level, 3 aggregate và 1 reconcile",
        ),
        bi('Every passed is true', 'Mọi giá trị passed đều là true'),
        bi('threshold_pct carries the contract number on exactly the six mapped row checks', 'Cột threshold_pct mang con số của contract ở đúng sáu check đã ánh xạ'),
      ],
    },

    {
      id: 'a05-t8',
      num: 8,
      title: bi('Wrap it into work/validate_day.py; run three days', 'Gói lại thành work/validate_day.py; chạy ba ngày'),
      goal: bi('One function, in gate order, over a normal day and both spike days.', 'Một hàm duy nhất, theo đúng thứ tự gate, chạy cho một ngày thường và cả hai ngày cao điểm.'),
      steps: [
        {
          title: bi('The shape', 'Bộ khung'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `def validate_day(con, day: str) -> None:
    staged = stage_day(con, day)          # Task 3
    flag_rows(con, day)                   # Tasks 4 + 5
    bad = con.execute("SELECT count(reject_reason) FROM flagged").fetchone()[0]
    pct = 100.0 * bad / staged
    report(con, day, staged, bad, pct)    # Task 7
    quarantine_bad(con, day)              # Task 6 step 1
    check_gate(con, day, staged)          # Task 6 step 2 -- alerts, then raises
    load_good(con)                        # Task 6 step 3
    print(f"{day}: staged={staged} core+={staged - bad} "
          f"quarantined={bad} ({pct:.2f}%)")`,
            },
            {
              kind: 'text',
              body: bi(
                'This module is your next rung on the composable-code ladder, so it plays by the ladder\'s rules: a docstring stating its job and assumptions, comments that state constraints not narration, cleaner expressions imported from work/cleaners.py — and later assignments (A07\'s pipeline, A11\'s runner) will import THIS module the same way, never re-paste it.',
                'Module này là nấc thang tiếp theo trên chiếc thang code ghép được, nên nó chơi theo luật của chiếc thang đó: một docstring nêu nhiệm vụ và các giả định, các dòng chú thích nêu ràng buộc chứ không kể lể, các biểu thức cleaning import từ work/cleaners.py — và các bài sau, pipeline của A07 và bộ chạy của A11, sẽ import CHÍNH module này theo đúng cách đó, không bao giờ dán lại.',
              ),
            },
          ],
        },
        {
          title: bi('Start clean, then run three days', 'Dọn sạch, rồi chạy ba ngày'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.execute("DROP TABLE IF EXISTS core.orders; "
            "DELETE FROM ops.dq_report; DELETE FROM ops.alerts;")
# và trong PowerShell:
# Remove-Item -Recurse -Force "$env:ETL_LAB_DATA\\small\\quarantine\\orders"

for day in ["2026-06-02", "2026-06-19", "2026-07-11"]:
    validate_day(con, day)`,
            },
            {
              kind: 'why',
              body: bi(
                'Everything below raw/ is derived and disposable, so rebuilding is always allowed. And the key observation: the spike days have ~3× the ROWS but the same ~1.7% quarantine RATE. Volume changed, quality did not — that is exactly why the threshold is a percentage, not a row count. Journal it.',
                'Mọi thứ nằm dưới raw/ đều là dữ liệu dẫn xuất và vứt đi được, nên dựng lại lúc nào cũng được phép. Và quan sát mấu chốt: các ngày cao điểm có SỐ DÒNG gấp khoảng ba lần nhưng TỈ LỆ quarantine vẫn khoảng 1,7%. Khối lượng đổi, chất lượng không đổi — và đó chính là lý do ngưỡng được đặt theo phần trăm chứ không theo số dòng. Ghi vào journal.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('All three days pass in a few seconds total', 'Cả ba ngày đều đạt, tổng cộng trong vài giây'),
        bi('Spike days have ~3× the rows but the same ~1.7% quarantine rate', 'Các ngày cao điểm có số dòng gấp khoảng ba lần nhưng tỉ lệ quarantine vẫn khoảng 1,7%'),
      ],
    },

    {
      id: 'a05-t9',
      num: 9,
      title: bi('Freshness — is core current at all?', 'Freshness — core có còn mới không?'),
      goal: bi('The check that notices when the pipeline simply stops running.', 'Check phát hiện ra khi pipeline đơn giản là ngừng chạy.'),
      steps: [
        {
          title: bi('work/freshness_check.py', 'File work/freshness_check.py'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `import sys
import duckdb
from lib.labpaths import warehouse_path

SCALE, FRESH_EXPECT = "small", "2026-07-11"   # latest day core should contain

con = duckdb.connect(str(warehouse_path(SCALE)))
latest, stale = con.execute(f"""
    SELECT max(_data_date), max(_data_date) < DATE '{FRESH_EXPECT}'
    FROM core.orders""").fetchone()
if stale:
    msg = (f"FRESHNESS BREACH: core.orders max(_data_date) = {latest}, "
           f"expected {FRESH_EXPECT}")
    con.execute("INSERT INTO ops.alerts VALUES "
                "(current_timestamp, NULL, 'error', 'freshness', ?)", [msg])
    print("ALERT:", msg)
    sys.exit(1)                               # non-zero exit: the scheduler pages
print(f"fresh: core.orders is at {latest}")`,
            },
            {
              kind: 'why',
              body: bi(
                'Every check so far judged one day\'s CONTENT; none of them notices when the pipeline simply stops running. What "expected" means comes from the contract\'s delivery.schedule — file complete by 02:00 UTC on D+1 — so in production the expected latest day is simply yesterday, and A11 wires that clock to the real SLA.',
                'Mọi check tới giờ đều đánh giá NỘI DUNG của một ngày; không phép nào phát hiện ra khi pipeline đơn giản là ngừng chạy. Ý nghĩa của chữ "kỳ vọng" đến từ điều khoản delivery.schedule trong contract — file phải xong trước 02:00 UTC ngày D+1 — nên trong production, ngày mới nhất kỳ vọng đơn giản là hôm qua, và A11 sẽ nối cái đồng hồ đó với cam kết dịch vụ thật.',
              ),
            },
          ],
        },
        {
          title: bi('The breach demo', 'Diễn tập violation'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `python -m work.freshness_check          # fresh: core.orders is at 2026-07-11

# đổi FRESH_EXPECT thành "2026-07-12" (ngày bạn chưa bao giờ nạp), rồi:
python -m work.freshness_check; $LASTEXITCODE     # dòng ALERT, rồi số 1`,
            },
            {
              kind: 'text',
              body: bi('Set FRESH_EXPECT back to 2026-07-11 afterwards.', 'Xong nhớ đặt FRESH_EXPECT về lại 2026-07-11.'),
            },
          ],
        },
      ],
      accept: [
        bi('The green run exits 0', 'Lần chạy xanh thoát với mã 0'),
        bi("The breach run prints the ALERT, $LASTEXITCODE is 1, and ops.alerts holds exactly one new row (severity = 'error', source = 'freshness')", "Lần chạy violation in ra dòng ALERT, $LASTEXITCODE bằng 1, và ops.alerts có đúng một dòng mới với severity = 'error' và source = 'freshness'"),
      ],
    },

    {
      id: 'a05-t10',
      num: 10,
      title: bi('Break it on purpose', 'Cố ý làm nó hỏng'),
      goal: bi('A gate you have never seen fire is a rumor.', 'Một gate mà bạn chưa từng thấy nó kích hoạt thì chỉ là lời đồn.'),
      steps: [
        {
          title: bi('Override in code, never in the YAML', 'Ghi đè trong code, tuyệt đối không sửa file YAML'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'Do NOT edit the contract YAML to stage the failure — that file is a signed agreement, not your config. Override the loaded value in code instead.',
                'ĐỪNG sửa file YAML của contract để dàn dựng lần hỏng — file đó là một thoả thuận đã ký, không phải file cấu hình của bạn. Hãy ghi đè giá trị đã nạp ở trong code.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `# sau khi dựng THRESHOLDS, thêm dòng này (giả vờ một amendment siết chặt 10 lần)
THRESHOLDS["total_mismatch"] = 0.1
# rồi chạy lại ngày 2026-06-19`,
            },
            {
              kind: 'expect',
              body: bi(
                'ALERT: DQ HARD FAIL 2026-06-19: total_mismatch at 0.522% exceeds contract tolerance 0.1%\nRuntimeError: DQ HARD FAIL 2026-06-19: 1 contract tolerance(s) breached. Nothing loaded to core.',
                'ALERT: DQ HARD FAIL 2026-06-19: total_mismatch at 0.522% exceeds contract tolerance 0.1%\nRuntimeError: DQ HARD FAIL 2026-06-19: 1 contract tolerance(s) breached. Nothing loaded to core.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'The dq_report row for the failed check exists EVEN THOUGH the run died — which is why reporting happens before the gate. A run that fails is the run whose evidence you most need.',
                'Dòng trong dq_report cho check bị trượt vẫn tồn tại NGAY CẢ KHI lần chạy đã chết — và đó chính là lý do việc báo cáo diễn ra trước gate. Lần chạy thất bại lại chính là lần chạy mà bạn cần evidence nhất.',
              ),
            },
            {
              kind: 'text',
              body: bi('Delete the override line afterwards.', 'Xong nhớ xoá dòng ghi đè đi.'),
            },
          ],
        },
      ],
      accept: [
        bi('You get the RuntimeError (1 contract tolerance(s) breached)', 'Bạn nhận được RuntimeError với thông báo 1 contract tolerance(s) breached'),
        bi('count(*) FROM core.orders is exactly what it was after Task 8 — the failed day added nothing', 'count(*) trên core.orders đúng bằng con số sau Task 8 — ngày trượt không thêm gì cả'),
        bi('The newest total_mismatch row for 06-19 shows threshold_pct = 0.1 and passed = false', 'Dòng total_mismatch mới nhất cho ngày 06-19 hiện threshold_pct bằng 0,1 và passed bằng false'),
        bi('ops.alerts gained one dq_gate error naming the check', 'Bảng ops.alerts có thêm một dòng lỗi dq_gate nêu đích danh check'),
      ],
    },

    {
      id: 'a05-t11',
      num: 11,
      title: bi('Full scale', 'Scale full'),
      goal: bi('Same rate at 20× the volume.', 'Cùng tỉ lệ đó ở khối lượng gấp 20 lần.'),
      steps: [
        {
          title: bi('Flip and re-run', 'Đổi rồi chạy lại'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Flip SCALE = "full" and re-run Task 8\'s three days. Every path — warehouse, quarantine, tmp — re-roots automatically via labpaths, so small and full never mix.',
                'Đổi SCALE thành "full" rồi chạy lại ba ngày của Task 8. Mọi đường dẫn — kho, quarantine, thư mục tạm — đều tự đổi gốc qua labpaths, nên small và full không bao giờ lẫn vào nhau.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'While the spike day runs, watch Task Manager: python should climb to roughly 2–3 GB — unnest plus three dim joins on 3.6M rows, your heaviest run yet — all cores busy, well inside the 8 GB limit. On the baseline machine expect roughly 5–10 s for a normal day, 15–25 s for a spike day.',
                'Trong lúc ngày cao điểm chạy, hãy nhìn Task Manager: python sẽ leo lên khoảng 2 tới 3 GB — phép unnest cộng ba phép nối dimension trên 3,6 triệu dòng, lần chạy nặng nhất của bạn từ trước tới giờ — mọi nhân CPU đều bận, và vẫn nằm gọn trong mức trần 8 GB. Trên máy chuẩn, dự kiến khoảng 5 tới 10 giây cho một ngày thường, 15 tới 25 giây cho một ngày cao điểm.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Staged counts equal the full-scale manifests exactly: 1,180,490 / 3,643,024 / 3,602,310. The quarantine rate is still ~1.7% at 20× the volume — roughly 19,700 on 06-02 and roughly 60,600 on 06-19.',
                'Số dòng staging bằng đúng manifest ở scale full: 1.180.490 / 3.643.024 / 3.602.310. Tỉ lệ quarantine vẫn khoảng 1,7% ở khối lượng gấp 20 lần — chừng 19.700 dòng ngày 06-02 và chừng 60.600 dòng ngày 06-19.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('All three days pass; staged counts equal the full-scale manifests exactly', 'Cả ba ngày đều đạt; số dòng staging bằng đúng manifest ở scale full'),
        bi('The quarantine rate is still ~1.7%', 'Tỉ lệ quarantine vẫn khoảng 1,7%'),
        bi('Timings are in your journal next to the small-scale ones', 'Các mốc thời gian đã nằm trong journal, cạnh số của scale small'),
      ],
    },

    {
      id: 'a05-t12',
      num: 12,
      title: bi('Tool bridge: the same checks, declared — pandera', 'Cầu nối công cụ: cũng những check đó, viết dưới dạng khai báo — pandera'),
      goal: bi('Meet a validation framework knowing exactly what it would be doing for you.', 'Gặp một framework validation trong khi biết chính xác nó sẽ làm hộ bạn những gì.'),
      steps: [
        {
          title: bi('Install and declare', 'Cài đặt và khai báo'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'You have hand-rolled a validation suite, which is the only honest way to meet a validation FRAMEWORK: you now know exactly what it would be doing for you. Back to SCALE = "small".',
                'Bạn đã tự tay dựng một bộ validation, và đó là cách trung thực duy nhất để gặp một FRAMEWORK validation: giờ bạn biết chính xác nó sẽ làm hộ bạn những gì. Quay lại SCALE = "small".',
              ),
            },
            { kind: 'code', lang: 'powershell', body: 'pip install pandera' },
            {
              kind: 'code',
              lang: 'python',
              body: `import duckdb
import pandera.pandas as pa
from lib.labpaths import warehouse_path
from work.validate_day import stage_day     # Task 8's module -- imported, never re-pasted

SCALE, DAY = "small", "2026-06-02"
STATUSES = ['created', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded']

con = duckdb.connect(str(warehouse_path(SCALE)))
stage_day(con, DAY)
df = con.execute("""
    SELECT order_id, status, order_total FROM staging.shopcore_orders_day
""").df()
print(f"{DAY}: {len(df):,} rows -> pandas; order_total dtype = {df.order_total.dtype}")

schema = pa.DataFrameSchema(
    {
        "order_id":    pa.Column("int64", nullable=False),
        "status":      pa.Column(nullable=False, checks=pa.Check.isin(STATUSES)),
        "order_total": pa.Column("float64", nullable=False, checks=pa.Check.ge(0)),
    },
    name="staging.shopcore_orders_day",
    strict=False,                             # tolerate columns you did not declare
)

try:
    schema.validate(df, lazy=True)            # lazy: collect ALL failures
    print("pandera: all checks passed")
except pa.errors.SchemaErrors as err:
    fc = err.failure_cases.assign(
        check=lambda d: d["check"].str.split("(").str[0])
    print(fc.groupby(["column", "check"]).size().to_string())
    print(fc.dropna(subset=["failure_case"])[
        ["column", "check", "failure_case", "index"]].head(5).to_string(index=False))`,
            },
            {
              kind: 'glossary',
              items: [
                {
                  term: 'lazy=True',
                  means: bi(
                    'Collects EVERY failure instead of raising on the first — the same reason your concat_ws collects every reject_reason.',
                    'Thu thập MỌI lỗi thay vì báo lỗi ngay cái đầu tiên — cùng lý do khiến concat_ws của bạn thu thập mọi reject_reason.',
                  ),
                },
                {
                  term: 'strict=False',
                  means: bi(
                    "Tolerates undeclared columns, which is the contract's own change_management rule: consumer must tolerate unknown columns.",
                    'Chấp nhận các cột chưa khai báo, đúng theo quy tắc change_management của chính contract: consumer phải cho phép được các cột lạ.',
                  ),
                },
                {
                  term: 'nullable=False',
                  means: bi(
                    'A SEPARATE statement from the value check — and that separation turns out to matter.',
                    'Là một khai báo TÁCH RỜI khỏi check giá trị — và sự tách rời đó hoá ra lại quan trọng.',
                  ),
                },
              ],
            },
          ],
        },
        {
          title: bi("Read that against Task 7's report", 'Đọc kết quả đó reconcile với báo cáo ở Task 7'),
          blocks: [
            {
              kind: 'code',
              lang: 'text',
              body: `column       check
order_total  greater_than_or_equal_to     52
             not_nullable                117
status       isin                         35
             not_nullable                 36`,
            },
            {
              kind: 'expect',
              body: bi(
                'The numbers reconcile: 35 + 36 = 71, exactly your bad_status; 117 + 52 = 169, exactly null_total + negative_total.',
                'Các con số khớp lại: 35 cộng 36 bằng 71, đúng bằng bad_status của bạn; 117 cộng 52 bằng 169, đúng bằng null_total cộng negative_total.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Three differences are the actual lesson. pandera SPLITS what your SQL fused: your bad_status CASE folded "NULL" and "not in the whitelist" into one reason; pandera reports two checks, because nullability is a property of the column, not a value rule. order_id says nothing at all — it passed, so it emits no rows, while ops.dq_report deliberately records the zeros too. And err.failure_cases is a TYPED DataFrame, not a string: column, check, failure_case, index, one row per offending value — precisely what your unnest(string_split(reject_reason, \'; \')) was hand-building.',
                'Ba điểm khác biệt mới là bài học thật. pandera TÁCH thứ mà SQL của bạn gộp lại: biểu thức CASE cho bad_status gộp "NULL" và "không nằm trong whitelist" thành một lý do; pandera báo thành hai check, vì tính cho phép rỗng là thuộc tính của cột chứ không phải quy tắc về giá trị. Cột order_id thì không nói gì cả — nó đạt nên không phát ra dòng nào, trong khi ops.dq_report cố ý ghi cả những số không. Và err.failure_cases là một DataFrame CÓ KIỂU chứ không phải chuỗi: gồm column, check, failure_case, index, mỗi giá trị violation một dòng — đúng bằng thứ mà câu unnest(string_split(reject_reason, \'; \')) của bạn đang dựng thủ công.',
              ),
            },
          ],
        },
        {
          title: bi('When NOT to use it', 'Khi nào KHÔNG nên dùng nó'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'pandera validates a DataFrame, so the rows have to be IN MEMORY first. On the baseline machine these three columns for this one small day are about 4.3 MB, so the same three across the full 82.3M-row dataset would be roughly 5.9 GB — and all twelve staging columns roughly 36 GB, past your 8 GB limit, in order to check rules DuckDB evaluates without materializing a single row. That is the whole reason the lab\'s pipeline keeps the SQL suite: the checks run where the 82M rows already are.',
                'pandera validation một DataFrame, nên các dòng phải nằm TRONG BỘ NHỚ trước đã. Trên máy chuẩn, ba cột này cho đúng một ngày ở scale small là khoảng 4,3 MB, nên cũng ba cột đó trên toàn bộ 82,3 triệu dòng sẽ là chừng 5,9 GB — và cả mười hai cột staging là khoảng 36 GB, vượt quá mức trần 8 GB của bạn, chỉ để kiểm tra những quy tắc mà DuckDB đánh giá được mà không cần materialize một dòng nào. Đó là toàn bộ lý do pipeline của lab giữ lại check suite bằng SQL: các check chạy ngay tại chỗ 82 triệu dòng đang nằm.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Watch the print, too: DuckDB\'s DECIMAL(14,2) lands in pandas as float64 — money turned into binary floating point on the way out the door. A second reason to judge money where it is stored.',
                'Cũng để ý dòng in ra: kiểu DECIMAL(14,2) của DuckDB rơi vào pandas thành float64 — tiền bị biến thành số thực dấu phẩy động nhị phân ngay trên đường đi ra. Thêm một lý do nữa để đánh giá tiền ngay tại nơi nó được lưu.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'One size up: Great Expectations and Soda hand you the apparatus around the schema object. An expectation suite is a named, versioned, reusable rule set — your THRESHOLDS dict grown up. A results store persists every validation run with its history — that is ops.dq_report, but managed by the tool. And data docs are the piece you have no equivalent for: generated HTML showing which expectations passed and failed, per column, per run, over time — something you can point a finance analyst at, which SELECT * FROM ops.dq_report is not. The lab names them and stops there on purpose: installing one here would swap today\'s lesson — what a check IS and where the gate must sit — for a lesson in someone else\'s YAML.',
                'Lên một cỡ nữa: Great Expectations và Soda trao cho bạn cả bộ máy bao quanh cái đối tượng schema. Một expectation suite là một tập quy tắc có tên, có version, dùng lại được — chính là cái từ điển THRESHOLDS của bạn đã trưởng thành. Một results store lưu lại mọi lần validation kèm lịch sử — chính là ops.dq_report, nhưng do công cụ quản lý. Và data docs là mảnh mà bạn chưa có gì tương đương: trang HTML được sinh ra cho thấy kỳ vọng nào đạt, kỳ vọng nào trượt, theo từng cột, từng lần chạy, theo thời gian — thứ bạn chỉ cho một chuyên viên tài chính xem được, còn SELECT * FROM ops.dq_report thì không. Lab gọi tên chúng rồi dừng lại ở đó một cách có chủ đích: cài một cái vào đây sẽ đánh đổi bài học hôm nay — một check LÀ GÌ và gate phải đứng ở đâu — lấy một bài học về file YAML của người khác.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('The schema raises SchemaErrors on 2026-06-02 — not a clean pass, which would mean you pointed it at core.orders', 'Schema ném ra SchemaErrors với ngày 2026-06-02 — không được đạt sạch, vì đạt sạch nghĩa là bạn đã trỏ nó vào core.orders'),
        bi('The failure counts reconcile: status 71, order_total 169', 'Các con số lỗi khớp lại: status 71, order_total 169'),
        bi('Your journal names one check you would keep in SQL forever and one you would rather read as a schema, with the reason for each', 'Journal của bạn nêu tên một check bạn sẽ giữ trong SQL mãi mãi và một phép bạn thà đọc dưới dạng schema, kèm lý do cho từng cái'),
      ],
    },

    {
      id: 'a05-verify',
      title: bi('Verify yourself', 'Tự kiểm chứng'),
      goal: bi('Numbers assume the reference rules — explain every gap.', 'Các con số giả định bộ quy tắc chuẩn — hãy giải thích mọi chỗ lệch.'),
      steps: [
        {
          title: bi('Small scale, after Task 8', 'Scale small, sau Task 8'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT count(*) FROM core.orders;
-- 414095   (58032 + 179044 + 177019)

SELECT check_name, rows_failed, pct_failed FROM ops.dq_report
WHERE order_date = DATE '2026-06-02' AND check_type = 'row'
ORDER BY rows_failed DESC;
-- orphan_sku 310 · total_mismatch 308 · null_total 117 · null_customer 94
-- bad_status 71 · negative_total 52 · orphan_customer 27 · bad_order_ts 18
-- ts_out_of_range, bad_payment, orphan_store, null_order_id: all 0

SELECT count(*) FROM ops.dq_report;
-- 48 (16 × 3 days; Task 10's failed run will append 16 more)`,
            },
            {
              kind: 'why',
              body: bi(
                'The per-check sum for 06-02 (997) exceeds the quarantined row count (992): five rows failed two checks at once. Confirm: count quarantine rows where _data_date = DATE \'2026-06-02\' AND reject_reason LIKE \'%;%\' → 5. Note that _data_date is how you pick one delivery out of the quarantine pile — the folders are partitioned by order_date, which late bad rows do NOT share with the file they arrived in.',
                'Tổng theo từng check cho ngày 06-02 là 997, vượt quá số dòng bị quarantine là 992: có năm dòng trượt hai phép cùng lúc. Kiểm chứng: đếm các dòng quarantine có _data_date bằng DATE \'2026-06-02\' và reject_reason LIKE \'%;%\' sẽ ra 5. Lưu ý _data_date là cách bạn nhặt ra đúng một file trong đống quarantine — các thư mục được phân vùng theo order_date, mà những dòng xấu về trễ thì KHÔNG dùng chung giá trị đó với file mang chúng tới.',
              ),
            },
          ],
        },
        {
          title: bi('The pager trail', 'Dấu vết của hệ thống báo động'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT severity, source, message FROM ops.alerts ORDER BY alert_ts;
-- error · freshness · FRESHNESS BREACH: core.orders max(_data_date) = 2026-07-11, expected 2026-07-12
-- error · dq_gate   · DQ HARD FAIL 2026-06-19: total_mismatch at 0.522% exceeds contract tolerance 0.1%`,
            },
          ],
        },
      ],
      accept: [
        bi('core.orders has 414,095 rows after Task 8', 'Bảng core.orders có 414.095 dòng sau Task 8'),
        bi('ops.dq_report has 48 rows; all passed true', 'Bảng ops.dq_report có 48 dòng; mọi giá trị passed đều là true'),
        bi('Five quarantine rows have a multi-reason reject_reason', 'Có năm dòng quarantine mang reject_reason gồm nhiều lý do'),
      ],
    },

    {
      id: 'a05-mistakes',
      title: bi('Common beginner mistakes', 'Lỗi thường gặp của người mới'),
      goal: bi('Six traps; two of them show up as a specific wrong number.', 'Sáu cái bẫy; hai trong số đó lộ ra thành một con số sai rất cụ thể.'),
      steps: [
        {
          title: bi('The six', 'Sáu lỗi'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'Validating raw text instead of cleaned staging. " CARD " gets flagged as bad payment and your quarantine rate triples with rows your own cleaners would have saved.',
                'Validation văn bản thô thay vì bảng staging đã cleaning. Chuỗi " CARD " sẽ bị gắn cờ là phương thức thanh toán sai, và tỉ lệ quarantine của bạn tăng gấp ba với những dòng mà chính bộ cleaning của bạn đã có thể cứu.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'unnest next to GROUP BY in one SELECT. Binder error, every time. Explode in a subquery, aggregate outside.',
                'Đặt unnest cạnh GROUP BY trong cùng một câu SELECT. Lỗi binder, lần nào cũng vậy. Bung ra trong truy vấn con, tổng hợp ở bên ngoài.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'COPY dying with "Failed to create directory". Partitioned COPY creates the order_date=… folders but not missing PARENTS — mkdir(parents=True) the target first.',
                'Lệnh COPY chết với thông báo "Failed to create directory". Lệnh COPY có phân vùng sẽ tạo các thư mục order_date=… nhưng không tạo các thư mục CHA còn thiếu — hãy mkdir(parents=True) cho thư mục đích trước.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Gating after loading. A threshold checked after the INSERT means the rotten day is already in core and "fail the day" means manual cleanup. Count → quarantine → gate → load.',
                'Đặt gate sau khi đã nạp. Một ngưỡng được kiểm sau lệnh INSERT nghĩa là cái ngày hỏng đã nằm trong core rồi, và "cho ngày đó trượt" đồng nghĩa với dọn dẹp thủ công. Đếm rồi quarantine rồi chặn rồi mới nạp.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Quarantining duplicate order_ids. In-file duplicates are expected corrections — latest updated_at wins, A08\'s job — not dirt. Report the rate; reject nothing. A quarantine count ~30 rows above the reference usually means this.',
                'Quarantine các order_id trùng nhau. Các bản trùng trong cùng file là những bản sửa được dự kiến trước — bản có updated_at mới nhất thắng, và đó là việc của A08 — chứ không phải rác. Hãy báo cáo tỉ lệ; đừng loại bỏ gì. Số dòng quarantine cao hơn số tham chiếu khoảng 30 dòng thường là do lỗi này.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Re-running a green day and doubling core. Plain INSERT is not idempotent. Until A07, re-run = drop and reload; counts at exactly 2× the manifest are this, nothing else.',
                'Chạy lại một ngày đã xanh và làm core nhân đôi. Lệnh INSERT thường không bất biến khi chạy lại. Cho tới A07, chạy lại nghĩa là xoá bảng rồi nạp lại; số dòng đúng gấp đôi manifest là do chuyện này, không phải do gì khác.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Đọc qua một lượt trước khi bắt đầu Task 5')],
    },

    {
      id: 'a05-stretch',
      title: bi('Stretch goals', 'Bài mở rộng'),
      goal: bi('Four optional exercises; the fourth is the one that pays off later.', 'Bốn bài tự chọn; bài thứ tư là bài có lãi về sau.'),
      steps: [
        {
          title: bi('1 — Trend line', '1 — Đường xu hướng'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Run all 45 v1 days at small scale (~2 minutes) and eyeball quarantine_rate by day from ops.dq_report. It should sit flat at ~1.7% — spikes included. A rate chart like this is the most useful DQ dashboard in real teams.',
                'Chạy cả 45 ngày thuộc v1 ở scale small, mất khoảng 2 phút, rồi nhìn cột quarantine_rate theo từng ngày trong ops.dq_report. Nó phải nằm phẳng ở mức khoảng 1,7% — kể cả các ngày cao điểm. Một biểu đồ tỉ lệ như vậy là dashboard chất lượng dữ liệu hữu ích nhất trong các đội thật.',
              ),
            },
          ],
        },
        {
          title: bi('2 — Volume band', '2 — Dải khối lượng'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'The contract\'s volume_expectation clause says loads outside 0.5×–4× of the trailing-7-day median should alert. Implement it as an aggregate check over the rows_checked history in ops.dq_report, writing a warn-severity alert on breach. Confirm the spike days stay inside the band — that width is deliberate.',
                'Điều khoản volume_expectation trong contract nói rằng những lần nạp nằm ngoài khoảng 0,5 tới 4 lần trung vị của 7 ngày gần nhất thì phải cảnh báo. Hãy cài nó thành một check aggregate trên lịch sử cột rows_checked trong ops.dq_report, ghi ra một cảnh báo mức warn khi violation. Xác nhận rằng các ngày cao điểm vẫn nằm trong dải — độ rộng đó là có chủ đích.',
              ),
            },
          ],
        },
        {
          title: bi('3 — Quarantine replay', '3 — Chạy lại từ quarantine'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Write work/replay_quarantine.py: read quarantined rows for a date range, re-run the current checks over them, print how many would pass today — how you recover rows after loosening a too-strict rule, and a first taste of A11\'s backfill thinking.',
                'Viết file work/replay_quarantine.py: đọc các dòng bị quarantine trong một khoảng ngày, chạy lại check suite hiện tại trên chúng, rồi in ra hôm nay có bao nhiêu dòng sẽ đạt — đó là cách bạn thu hồi lại các dòng sau khi nới lỏng một quy tắc quá chặt, và cũng là hương vị đầu tiên của lối tư duy nạp bù ở A11.',
              ),
            },
          ],
        },
        {
          title: bi('4 — Tests for two checks', '4 — Kiểm thử cho hai check'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Follow tests/test_cleaners.py\'s pattern from A03: each rule run over a VALUES table of hand-picked rows in an in-memory DuckDB. Write tests/test_checks.py covering two check expressions — good candidates are total_mismatch (equal totals, off by exactly 0.01 so the boundary passes, and off by 0.02) and ts_out_of_range (inside the window, the day before it, the day after). python -m pytest tests/ -q green before the branch merges.',
                'Theo đúng khuôn của tests/test_cleaners.py từ A03: mỗi quy tắc chạy trên một bảng VALUES gồm các dòng chọn tay, trong một DuckDB nằm trong bộ nhớ. Viết file tests/test_checks.py phủ hai biểu thức kiểm tra — ứng viên tốt là total_mismatch (tổng bằng nhau, lệch đúng 0,01 để biên vẫn đạt, và lệch 0,02) cùng ts_out_of_range (nằm trong cửa sổ, ngày ngay trước, và ngày ngay sau). Lệnh python -m pytest tests/ -q phải xanh trước khi nhánh được gộp.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Hoàn thành ít nhất một mục và ghi kết luận vào journal')],
    },
  ],
}
