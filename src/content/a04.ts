import type { AssignmentSpec } from '../types'
import { bi, vi } from '../types'
import { a04Terms, a04Theory } from './a04.theory'

export const a04: AssignmentSpec = {
  id: 'a04',
  code: 'A04',
  title: bi('Complex data types: JSON, structs, lists', 'Kiểu dữ liệu phức hợp: JSON, struct, list'),
  summary: bi(
    'Crack open the JSON stuffed into a CSV cell, change the grain on purpose, and build your first mart.',
    'Parse khối JSON bị nhét trong ô CSV, đổi grain một cách có chủ đích, và dựng bảng mart đầu tiên.',
  ),
  estHours: 4,
  difficulty: 3,
  outcome: bi(
    'You can turn nested JSON into properly typed rows in SQL, change grain deliberately and prove nothing was lost, and explain why nobody unnests a whole history in one query.',
    'Bạn biến được JSON lồng nhau thành các dòng có kiểu rõ ràng bằng SQL, đổi grain một cách có chủ đích và chứng minh không mất gì, và giải thích được vì sao không ai unnest toàn bộ lịch sử trong một truy vấn.',
  ),
  theory: a04Theory,
  terms: a04Terms,
  tasks: [
    {
      id: 'a04-t0',
      title: bi('Setup', 'Chuẩn bị'),
      goal: bi('The usual scaffold, at small scale.', 'Bộ khung quen thuộc, ở scale small.'),
      steps: [
        {
          title: bi('Preconditions', 'Điều kiện cần'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'A03 finished: month-1 raw data exists at both scales, and warehouse.duckdb has your staging and core schemas. Today adds core.order_items and your first marts table. Work at SMALL scale for every task; only Tasks 8–9 move to full.',
                'A03 đã xong: dữ liệu thô tháng một có ở cả hai quy mô, và file warehouse.duckdb đã có các schema staging và core của bạn. Hôm nay thêm core.order_items và bảng marts đầu tiên. Làm ở quy mô NHỎ cho mọi task; chỉ Task 8 và 9 mới chuyển sang scale full.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `import duckdb
from lib.labpaths import data_root, warehouse_path

SCALE = "small"                     # develop here; switch to "full" only where a task says so
DAY = "2026-06-02"                  # any v1 day works; verify numbers below assume this one
ROOT = data_root(SCALE)
RAW = (ROOT / "raw" / "orders" / f"orders_{DAY}.csv").as_posix()
PRODUCTS = (ROOT / "raw" / "dims" / "products.csv").as_posix()

con = duckdb.connect(str(warehouse_path(SCALE)))
con.execute(f"SET memory_limit='8GB'; SET threads=8; "
            f"SET temp_directory='{(ROOT / 'tmp').as_posix()}';")`,
            },
            {
              kind: 'text',
              body: bi(
                'JSON support is built into DuckDB — nothing to install. Keep Task Manager handy for Task 9 and your journal.md open throughout.',
                'Hỗ trợ JSON có sẵn trong DuckDB — không phải cài gì. Giữ Task Manager trong tầm tay cho Task 9 và mở file journal.md suốt buổi.',
              ),
            },
          ],
        },
      ],
      accept: [bi('Connection opens against warehouse.duckdb', 'Kết nối mở được tới warehouse.duckdb')],
    },

    {
      id: 'a04-t1',
      num: 1,
      title: bi('Look at the raw strings', 'Nhìn vào các chuỗi thô'),
      goal: bi('Before parsing anything, look at what you have.', 'Trước khi phân tích thứ gì, hãy nhìn xem bạn đang có gì.'),
      steps: [
        {
          title: bi('Build the day table first', 'Dựng bảng ngày trước đã'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.execute(f"""
CREATE OR REPLACE TEMP TABLE shopcore_orders_day AS
SELECT order_id,
       try_strptime(order_ts, ['%Y-%m-%d %H:%M:%S', '%d/%m/%Y %H:%M:%S',
                               '%Y-%m-%dT%H:%M:%S']) AS order_ts,
       items, meta
FROM read_csv('{RAW}', header=true,
    columns={{'order_id':'BIGINT','customer_id':'BIGINT','store_id':'INTEGER',
             'order_ts':'VARCHAR','updated_at':'TIMESTAMP','status':'VARCHAR',
             'payment_method':'VARCHAR','order_total':'VARCHAR',
             'items':'VARCHAR','meta':'VARCHAR'}});
""")`,
            },
            {
              kind: 'code',
              lang: 'python',
              body: 'con.sql("SELECT items, meta FROM shopcore_orders_day LIMIT 5").show()',
            },
            {
              kind: 'why',
              body: bi(
                'This doc uses its own day table, and it is TEMP: it lives in your connection, not in the shared staging schema, and vanishes when your script exits. That placement is the point — it is a scratch table for today\'s exercises, not a pipeline output, so it skips the two lineage columns, and a table without them has no business sitting in staging. One consequence: a fresh session starts without it, so re-run this snippet first.',
                'Tài liệu này dùng bảng ngày riêng của nó, và bảng đó là TEMP: nó sống trong kết nối của bạn chứ không nằm trong schema staging dùng chung, và biến mất khi script kết thúc. Chỗ đặt đó chính là điểm mấu chốt — nó là bảng nháp cho bài tập hôm nay, không phải kết quả pipeline, nên nó bỏ qua hai cột lineage, mà một bảng thiếu chúng thì không có tư cách ngồi trong staging. Một hệ quả: phiên làm việc mới sẽ không có nó, nên hãy chạy lại đoạn này trước.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Build it with this snippet even if your A03 staging.shopcore_orders is still around: it is deliberately NOT deduped, so every count today matches the manifest (59,024), and it keeps just the four columns you need. If you reuse your deduped A03 table instead, expect 58,993 rows and 149,099 item lines — everything else shifts by the same ~31 duplicate orders.',
                'Hãy dựng nó bằng đoạn này ngay cả khi bảng staging.shopcore_orders từ A03 vẫn còn: bảng này CỐ Ý không khử trùng, để mọi con số hôm nay khớp với manifest, tức 59.024, và nó chỉ giữ đúng bốn cột bạn cần. Nếu bạn dùng lại bảng A03 đã khử trùng, hãy chờ đợi 58.993 dòng và 149.099 dòng item — mọi thứ khác cũng lệch đi đúng chừng 31 đơn trùng đó.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'You can say what items is (a JSON ARRAY of OBJECTS, 1–6 of them) and what meta is (a JSON OBJECT)',
          'Bạn nói được items là gì (một MẢNG JSON chứa các ĐỐI TƯỢNG, từ 1 tới 6 cái) và meta là gì (một ĐỐI TƯỢNG JSON)',
        ),
        bi("The day table's count equals manifest rows — 59,024", 'Số dòng của bảng ngày bằng trường rows trong manifest — 59.024'),
      ],
    },

    {
      id: 'a04-t2',
      num: 2,
      title: bi('Parse items — both ways', 'Phân tích items — bằng cả hai cách'),
      goal: bi('Strict cast and lenient transform, then probe the dirt.', 'Ép kiểu chặt và lenient transform, rồi dò tìm phần rác.'),
      steps: [
        {
          title: bi('Both forms, same result shape', 'Hai dạng, cùng một cấu trúc kết quả'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.sql("""
    SELECT CAST(items AS JSON)::STRUCT(sku VARCHAR, qty INTEGER, unit_price DOUBLE)[] AS item_list
    FROM shopcore_orders_day LIMIT 5
""").show()
con.sql("""                                          -- lenient; same result shape
    SELECT json_transform(items,
           '[{"sku":"VARCHAR","qty":"INTEGER","unit_price":"DOUBLE"}]') AS item_list
    FROM shopcore_orders_day LIMIT 5
""").show()`,
            },
          ],
        },
        {
          title: bi('Now the dirt probe', 'Giờ tới phép dò rác'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'About 0.3% of rows carry qty and unit_price as JSON STRINGS ("qty":"2" instead of "qty":2). Count them.',
                'Khoảng 0,3% số dòng ghi qty và unit_price dưới dạng CHUỖI JSON ("qty":"2" thay vì "qty":2). Hãy đếm chúng.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `con.sql("""
    SELECT count(*) FROM shopcore_orders_day
    WHERE json_type(items, '$[0].qty') = 'VARCHAR'
""").show()`,
            },
            {
              kind: 'text',
              body: bi(
                'Then check whether the strict cast survived them — count item lists containing a NULL qty after casting. Hint: list_filter(item_list, x -> x.qty IS NULL).',
                'Sau đó kiểm tra xem strict cast có sống sót qua chúng không — đếm các danh sách item chứa qty bằng NULL sau khi ép kiểu. Gợi ý: list_filter(item_list, x -> x.qty IS NULL).',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'You should find ZERO: DuckDB\'s JSON casts coerce a numeric string like "2" into 2. Note that down — convenient, but the cast quietly FIXED data; the json_type probe above is your audit trail. That is the A03 "count every rule" habit again. Contract-wise this dirt is a GAP, not a violation — the shopcore contract never pins the inner JSON types, which is exactly the kind of silence you will hunt down formally in A06.',
                'Bạn sẽ thấy con số KHÔNG: các cast JSON của DuckDB tự ép một chuỗi số như "2" thành 2. Ghi lại điều đó — tiện thật, nhưng cast đã lặng lẽ SỬA dữ liệu; phép dò bằng json_type ở trên chính là audit trail của bạn. Lại đúng thói quen "đếm mọi quy tắc" của A03. Xét theo contract thì phần rác này là một KHOẢNG TRỐNG, không phải violation — contract shopcore chưa bao giờ ghim các kiểu bên trong JSON, và đó đúng là loại im lặng mà bạn sẽ truy lùng một cách chính thức ở A06.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'String-typed row count is roughly 0.3% — exactly 161 on small 2026-06-02. NULL-qty count after strict cast is 0.',
                'Số dòng có kiểu chuỗi vào khoảng 0,3% — chính xác là 161 với bộ nhỏ ngày 2026-06-02. Số qty bằng NULL sau strict cast là 0.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Both forms return identical-looking lists', 'Cả hai dạng trả về những danh sách trông giống hệt nhau'),
        bi('String-typed row count is 161; NULL-qty after strict cast is 0', 'Số dòng kiểu chuỗi là 161; số qty NULL sau strict cast là 0'),
      ],
    },

    {
      id: 'a04-t3',
      num: 3,
      title: bi('Unnest into core.order_items', 'Unnest thành bảng core.order_items'),
      goal: bi('Change the grain, then prove nothing was lost.', 'Đổi grain, rồi chứng minh không mất gì.'),
      steps: [
        {
          title: bi('Explode each list into rows', 'Bung từng danh sách thành các dòng'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.execute(f"""
-- grain: one row = one line item of one delivered order *version*
-- (this day table is deliberately un-deduped, so the 31 re-sent orders each
--  contribute a second line set: (order_id, line_no) is not yet unique here.
--  One-row-per-order arrives with A08's dedupe.)
CREATE OR REPLACE TABLE core.order_items AS
SELECT
    order_id,
    generate_subscripts(item_list, 1) AS line_no,     -- 1, 2, 3, ... per order
    unnest(item_list, recursive := true),             -- explodes struct fields into columns
    DATE '{DAY}'         AS _data_date,               -- lineage: the delivery's business date
    CAST(NULL AS BIGINT) AS _run_id                   -- lineage: NULL until A07's ledger
FROM (
    SELECT order_id,
           CAST(items AS JSON)::STRUCT(sku VARCHAR, qty INTEGER, unit_price DOUBLE)[] AS item_list
    FROM shopcore_orders_day
);
""")`,
            },
            {
              kind: 'glossary',
              items: [
                {
                  term: 'recursive := true',
                  means: bi(
                    "Unpacks the struct's fields into real columns (sku, qty, unit_price) instead of one struct column.",
                    'Bung các trường của struct thành các cột thật (sku, qty, unit_price) thay vì một cột struct duy nhất.',
                  ),
                },
                {
                  term: 'generate_subscripts',
                  means: bi(
                    'Walks the same list in step with unnest, which gives you line_no.',
                    'Đi qua cùng danh sách đó song song với unnest, nhờ đó bạn có được line_no.',
                  ),
                },
                {
                  term: '_data_date / _run_id',
                  means: bi(
                    'The lineage pair: a core table carries them, and item grain inherits the delivery date of the orders it exploded. A TEMP parent has no lineage to inherit, so it comes straight from DAY.',
                    'Cặp cột lineage: một bảng thuộc core thì phải mang chúng, và grain item thừa kế ngày giao của những đơn hàng mà nó unnest. Bảng cha dạng TEMP không có lineage để thừa kế, nên giá trị lấy thẳng từ biến DAY.',
                  ),
                },
              ],
            },
          ],
        },
        {
          title: bi('The conservation check', 'Conservation check'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.sql("""
    SELECT (SELECT count(*) FROM core.order_items)               AS item_rows,
           (SELECT sum(json_array_length(items))
              FROM shopcore_orders_day)                          AS expected
""").show()`,
            },
            {
              kind: 'why',
              body: bi(
                'After any grain change, prove no rows appeared or vanished. The same discipline as A03\'s cleaning report, applied to a structural transformation instead of a cleaning one.',
                'Sau mọi lần đổi grain, hãy chứng minh không dòng nào tự sinh ra hay biến mất. Cùng một kỷ luật với báo cáo cleaning của A03, nhưng áp dụng cho một phép biến đổi cấu trúc thay vì một phép cleaning.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'The two counts match exactly — 149,190 on small 2026-06-02. DESCRIBE core.order_items shows the 5 typed item columns (no VARCHAR numbers) plus the two lineage columns, 7 in all.',
                'Hai con số khớp chính xác — 149.190 với bộ nhỏ ngày 2026-06-02. Lệnh DESCRIBE core.order_items cho thấy 5 cột item đã có kiểu (không còn số dạng VARCHAR) cộng hai cột lineage, tổng cộng 7 cột.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('DESCRIBE shows 7 columns, no VARCHAR numbers', 'Lệnh DESCRIBE cho thấy 7 cột, không còn số dạng VARCHAR'),
        bi('The two counts match exactly — 149,190', 'Hai con số khớp chính xác — 149.190'),
      ],
    },

    {
      id: 'a04-t4',
      num: 4,
      title: bi('Know your new table: distributions', 'Làm quen với bảng mới: các phân bố'),
      goal: bi('Get a feel for the item grain.', 'Cảm nhận được grain item.'),
      steps: [
        {
          title: bi('Items-per-order distribution', 'Phân bố số item mỗi đơn'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.sql("""
    SELECT json_array_length(items) AS n_items,
           count(*)                 AS orders,
           round(count(*) * 100.0 / sum(count(*)) OVER (), 1) AS pct
    FROM shopcore_orders_day
    GROUP BY 1 ORDER BY 1
""").show()`,
            },
            {
              kind: 'text',
              body: bi(
                'Now YOU write the equivalent for the qty distribution over core.order_items, same shape. Also compute the average items per order — you will need it for Task 9.',
                'Giờ tới lượt BẠN viết câu tương đương cho phân bố của qty trên bảng core.order_items, cùng cấu trúc. Đồng thời tính số item trung bình mỗi đơn — bạn sẽ cần nó ở Task 9.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Items-per-order runs 1–6 with ~30% at 1; qty runs 1–5 with ~55% at 1; average items per order is ~2.5 (2.53 on small 2026-06-02).',
                'Số item mỗi đơn chạy từ 1 tới 6 với khoảng 30% ở mức 1; qty chạy từ 1 tới 5 với khoảng 55% ở mức 1; số item trung bình mỗi đơn khoảng 2,5 (là 2,53 với bộ nhỏ ngày 2026-06-02).',
              ),
            },
          ],
        },
      ],
      accept: [bi('The three distributions are noted in your journal', 'Ba phân bố đó đã được ghi vào journal')],
    },

    {
      id: 'a04-t5',
      num: 5,
      title: bi('Join items to products — meet the orphans', 'Nối item với sản phẩm — gặp các orphan'),
      goal: bi('Measure and report; do not fix.', 'Đo và báo cáo; đừng sửa.'),
      steps: [
        {
          title: bi('Count the unmatched lines', 'Đếm các dòng không khớp'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.sql(f"""
    SELECT count(*) AS orphan_lines,
           round(100.0 * count(*) / (SELECT count(*) FROM core.order_items), 2) AS pct
    FROM core.order_items i
    LEFT JOIN read_csv('{PRODUCTS}', header=true) p USING (sku)
    WHERE ...                                        -- you finish it
""").show()`,
            },
            {
              kind: 'why',
              body: bi(
                'Why LEFT and not INNER? An INNER join would silently DROP those lines — revenue shrinks and nobody knows. A LEFT join keeps them so you can count them. These orphan SKUs are real dirt: products sold but never added to the dim.',
                'Vì sao LEFT chứ không phải INNER? Một phép INNER join sẽ ngầm LOẠI BỎ những dòng đó — doanh thu co lại mà không ai biết. Phép LEFT join giữ chúng lại để bạn đếm được. Những mã orphan sku này là rác thật: hàng đã bán nhưng chưa bao giờ được thêm vào dimension.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Do NOT delete or fix them today — detecting and quarantining unfixable rows is A05\'s whole job. Today you only measure and report.',
                'ĐỪNG xoá hay sửa chúng hôm nay — phát hiện và quarantine những dòng không sửa được là toàn bộ công việc của A05. Hôm nay bạn chỉ đo và báo cáo.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Orphan count is roughly 0.2% of item lines — 310 lines, 0.21%, on small 2026-06-02.',
                'Số orphan vào khoảng 0,2% số dòng item — 310 dòng, tức 0,21%, với bộ nhỏ ngày 2026-06-02.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Orphan count is 310 lines (0.21%)', 'Số dòng orphan là 310, tức 0,21%'),
        bi('You can explain why LEFT JOIN was the right choice', 'Bạn giải thích được vì sao LEFT JOIN là lựa chọn đúng'),
      ],
    },

    {
      id: 'a04-t6',
      num: 6,
      title: bi('Parse meta — three flavors of missing', 'Phân tích meta — ba dạng giá trị rỗng'),
      goal: bi('Count each flavor separately, then collapse them honestly.', 'Đếm từng kiểu riêng rẽ, rồi gộp chúng lại một cách trung thực.'),
      steps: [
        {
          title: bi('Single-field extraction first', 'Trích xuất một trường trước đã'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'CAST(meta AS JSON)->>\'device\' returns VARCHAR; json_extract_string(meta, \'$.device\') is the same thing spelled out. Group by it and eyeball the device split.',
                'Biểu thức CAST(meta AS JSON)->>\'device\' trả về VARCHAR; còn json_extract_string(meta, \'$.device\') là chính nó nhưng viết dài ra. Gom nhóm theo nó và nhìn qua tỉ lệ các loại thiết bị.',
              ),
            },
          ],
        },
        {
          title: bi('Now utm — count each flavor separately', 'Giờ tới utm — đếm riêng từng kiểu'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.sql("""
    SELECT
      count(*) FILTER (WHERE CAST(meta AS JSON)->>'utm' = 'none') AS sentinel_none,
      count(*) FILTER (WHERE json_type(meta, '$.utm') = 'NULL')   AS json_null,
      count(*) FILTER (WHERE json_extract(meta, '$.utm') IS NULL) AS key_absent,
      count(*)                                                    AS total_rows
    FROM shopcore_orders_day
""").show()`,
            },
            {
              kind: 'why',
              body: bi(
                'Read those predicates carefully — they are the lesson. json_extract returns SQL NULL ONLY when the key is absent; a stored JSON null comes back as a JSON null value (json_type says \'NULL\'), which is NOT SQL NULL. Meanwhile ->> collapses both cases to SQL NULL — verify: counting ->>\'utm\' IS NULL should give json_null + key_absent.',
                'Đọc kỹ các vị từ đó — chính chúng là bài học. Hàm json_extract trả về NULL của SQL CHỈ khi khoá key vắng mặt; còn một giá trị null được lưu trong JSON thì quay về dưới dạng giá trị null của JSON (json_type nói là \'NULL\'), và cái đó KHÔNG PHẢI NULL của SQL. Trong khi đó toán tử ->> gộp cả hai trường hợp thành NULL của SQL — hãy kiểm chứng: đếm ->>\'utm\' IS NULL phải ra bằng tổng của json_null và key_absent.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: "NULLIF(CAST(meta AS JSON)->>'utm', 'none')   -- folds all three into one honest NULL",
            },
          ],
        },
        {
          title: bi('One more discovery: strict fails here', 'Thêm một phát hiện: phép chặt hỏng ở đây'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.sql("""
    SELECT CAST(meta AS JSON)::STRUCT(device VARCHAR, utm VARCHAR, sess VARCHAR)
    FROM shopcore_orders_day LIMIT 5
""").show()                                   # dies -- read the error message
con.sql("""
    SELECT json_transform(meta, '{"device":"VARCHAR","utm":"VARCHAR","sess":"VARCHAR"}') AS m
    FROM shopcore_orders_day LIMIT 5
""").show()                                   # missing keys become NULL fields, no drama`,
            },
            {
              kind: 'why',
              body: bi(
                'The strict cast fails with Object {...} does not have key "utm": a strict struct cast demands EVERY field, and ~10% of rows legitimately have no utm key. This is the case where lenient wins. Note the trade in your journal: strict for items (fixed shape, want loud failures), lenient for meta (optional keys are legitimate).',
                'Phép strict cast hỏng với thông báo Object {...} does not have key "utm": một cast struct chặt đòi hỏi phải có ĐỦ MỌI trường, mà khoảng 10% số dòng thì hợp lệ mà không có khoá utm. Đây là trường hợp mà cách lỏng thắng. Ghi lại sự đánh đổi này vào journal: chặt cho items (cấu trúc cố định, muốn hỏng ồn ào), lỏng cho meta (khoá tuỳ chọn là hợp lệ).',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'The three flavors count 5,930 / 5,981 / 5,945 (sentinel, JSON null, absent) — ~10% each — on small 2026-06-02. Normalized utm has 4 real sources plus NULL.',
                'Ba kiểu đếm được lần lượt là 5.930, 5.981, 5.945 (sentinel string, null của JSON, key vắng mặt) — mỗi loại khoảng 10% — với bộ nhỏ ngày 2026-06-02. Cột utm sau khi chuẩn hoá có 4 nguồn thật cộng thêm NULL.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('The three flavors count 5,930 / 5,981 / 5,945', 'Ba kiểu đếm được 5.930 / 5.981 / 5.945'),
        bi('You saw the strict cast fail and know why', 'Bạn đã thấy strict cast hỏng và biết vì sao'),
      ],
    },

    {
      id: 'a04-t7',
      num: 7,
      title: bi('Products: pipe-separated tags and attrs JSON', 'Sản phẩm: tags ngăn bằng dấu gạch đứng và attrs dạng JSON'),
      goal: bi('Two more complex-type shapes, and the unnest/GROUP BY rule in action.', 'Thêm hai cấu trúc kiểu phức hợp, và quy tắc unnest với GROUP BY trong thực tế.'),
      steps: [
        {
          title: bi("tags is a poor man's list", 'tags là danh sách của nhà nghèo'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.sql(f"""
    SELECT tag, count(*) AS products
    FROM (
      SELECT unnest(string_split(tags, '|')) AS tag
      FROM read_csv('{PRODUCTS}', header=true)
    )
    GROUP BY 1 ORDER BY 2 DESC LIMIT 10
""").show()`,
            },
            {
              kind: 'trap',
              body: bi(
                'Note the rule in action: unnest in the subquery, GROUP BY outside. DuckDB refuses to let them share one SELECT.',
                'Chú ý quy tắc đang được áp dụng: unnest nằm trong truy vấn con, GROUP BY nằm ngoài. DuckDB từ chối cho hai thứ đó dùng chung một câu SELECT.',
              ),
            },
          ],
        },
        {
          title: bi('attrs is a JSON object', 'attrs là một đối tượng JSON'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'attrs holds {"brand":…,"weight_g":…,"color":…}. Extract all three fields with the tools from Task 6 — weight_g should end up an INTEGER, not text (-> returns JSON, ->> returns VARCHAR; cast accordingly). Then answer: which brand has the most products?',
                'Cột attrs chứa {"brand":…,"weight_g":…,"color":…}. Trích cả ba trường bằng các công cụ ở Task 6 — weight_g phải kết thúc ở kiểu INTEGER chứ không phải văn bản (toán tử -> trả về JSON, còn ->> trả về VARCHAR; ép kiểu cho phù hợp). Rồi trả lời: thương hiệu nào có nhiều sản phẩm nhất?',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('You have a top-10 tag list and a brand count table, and weight_g is numeric', 'Bạn có danh sách 10 tag hàng đầu và một bảng đếm theo thương hiệu, và weight_g ở dạng số'),
      ],
    },

    {
      id: 'a04-t8',
      num: 8,
      title: bi('Your first mart: marts.category_daily_revenue', 'Bảng mart đầu tiên: marts.category_daily_revenue'),
      goal: bi('The payoff for the plumbing — and one surprise in the output.', 'Phần thưởng cho toàn bộ công đoạn đường ống — và một bất ngờ trong kết quả.'),
      steps: [
        {
          title: bi('Combine everything from today', 'Ghép mọi thứ của hôm nay lại'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.execute("CREATE SCHEMA IF NOT EXISTS marts;")
con.execute(f"""
CREATE OR REPLACE TABLE marts.category_daily_revenue AS
SELECT
    CAST(s.order_ts AS DATE)              AS order_date,
    COALESCE(p.category, '(unknown sku)') AS category,
    round(sum(i.qty * i.unit_price), 2)   AS revenue,
    ...                                   -- add: units (sum of qty), distinct order count
FROM core.order_items i
JOIN shopcore_orders_day s USING (order_id)
LEFT JOIN read_csv('{PRODUCTS}', header=true) p USING (sku)
GROUP BY 1, 2;
""")`,
            },
            {
              kind: 'text',
              body: bi(
                'A mart is a small, purpose-built table that answers business questions directly.',
                'Một mart là một bảng nhỏ, dựng riêng cho một mục đích, trả lời thẳng câu hỏi nghiệp vụ.',
              ),
            },
          ],
        },
        {
          title: bi('Three date groups from one file', 'Ba nhóm ngày từ một file duy nhất'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'Look at the order_date column — you loaded ONE file, but you get THREE date groups. Explain each before reading on: yesterday\'s date (the ~1.5% late correction rows whose order_ts belongs to prior days — same thing you saw in the A02 lake), your day, and NULL (the ~0.02% impossible timestamps your A03 cleaner nulled). One file ≠ one day — journal that; it is the entire plot of A08.',
                'Nhìn cột order_date — bạn nạp MỘT file, nhưng nhận về BA nhóm ngày. Hãy tự giải thích từng nhóm trước khi đọc tiếp: ngày hôm trước (khoảng 1,5% dòng sửa về trễ có order_ts thuộc về những ngày trước — đúng thứ bạn đã thấy trong lake ở A02), ngày của bạn, và NULL (khoảng 0,02% mốc thời gian bất khả thi mà bộ cleaning A03 của bạn đã cho về NULL). Một file không bằng một ngày — ghi điều đó vào journal; nó là toàn bộ cốt truyện của A08.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Small scale shows 13 categories in each dated group (the tiny NULL group has fewer), top category "office" at ~734k revenue on 2026-06-02. Then switch SCALE = "full" and rerun the whole script for the same day: expect seconds-to-a-minute territory, not minutes — DuckDB parses JSON in parallel. Full scale runs at roughly 20× (~1.18M rows, ~3M item lines).',
                'Scale small cho thấy 13 danh mục trong mỗi nhóm có ngày (nhóm NULL bé xíu thì ít hơn), danh mục dẫn đầu là "office" với doanh thu khoảng 734 nghìn vào ngày 2026-06-02. Sau đó đổi SCALE thành "full" và chạy lại cả script cho cùng ngày: dự kiến ở mức vài giây tới một phút chứ không phải nhiều phút — DuckDB phân tích JSON song song. Scale full chạy ở mức khoảng 20 lần, tức chừng 1,18 triệu dòng và 3 triệu dòng item.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('13 categories per dated group, top category office at ~734k', '13 danh mục trong mỗi nhóm có ngày, danh mục dẫn đầu là office với khoảng 734 nghìn'),
        bi('Full scale runs clean at roughly 20×', 'Scale full chạy sạch sẽ ở mức khoảng 20 lần'),
        bi('The three order_date groups explained in your journal', 'Ba nhóm order_date đã được giải thích trong journal'),
      ],
    },

    {
      id: 'a04-t9',
      num: 9,
      title: bi('Scale probe: the spike day, and the 200M-row estimate', 'Scale probe: spike day, và ước lượng 200 triệu dòng'),
      goal: bi('Measure what "the whole history" would actually mean.', 'Đo xem "toàn bộ lịch sử" thật ra nghĩa là gì.'),
      steps: [
        {
          title: bi('First, on paper', 'Trước hết, trên giấy'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'You only have month 1 (45 days) so far, but the feed eventually totals ~82M order rows across 69 days — month 2 arrives in A10. Multiply by your Task 4 average items per order: roughly 200M item rows. That is what "unnest the whole history" costs, and why nobody does it as one giant query.',
                'Hiện bạn mới có tháng một, tức 45 ngày, nhưng feed này cuối cùng tổng cộng khoảng 82 triệu dòng đơn hàng trải trên 69 ngày — tháng hai về ở A10. Nhân với số item trung bình mỗi đơn mà bạn tính ở Task 4: khoảng 200 triệu dòng item. Đó là cái giá của việc "unnest toàn bộ lịch sử", và là lý do không ai làm nó bằng một truy vấn khổng lồ.',
              ),
            },
          ],
        },
        {
          title: bi('Part A — stream', 'Phần A — streaming'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `spike = (data_root("full") / "raw" / "orders" / "orders_2026-06-19.csv").as_posix()
V1_COLS = ("{'order_id':'BIGINT','customer_id':'BIGINT','store_id':'INTEGER',"
           "'order_ts':'VARCHAR','updated_at':'TIMESTAMP','status':'VARCHAR',"
           "'payment_method':'VARCHAR','order_total':'VARCHAR',"
           "'items':'VARCHAR','meta':'VARCHAR'}")
con.sql(f"""
    SELECT count(*) FROM (
        SELECT unnest(CAST(items AS JSON)::STRUCT(sku VARCHAR, qty INTEGER, unit_price DOUBLE)[])
        FROM read_csv('{spike}', header=true, columns={V1_COLS})
    )
""").show()`,
            },
            {
              kind: 'expect',
              body: bi(
                'Watch python\'s memory while it runs: it barely moves. On the baseline machine expect roughly 2 seconds and well under half a GB — DuckDB streams: parse a chunk, count it, throw it away.',
                'Theo dõi bộ nhớ của python trong lúc nó chạy: nó gần như không nhúc nhích. Trên máy chuẩn, dự kiến khoảng 2 giây và thấp hơn nửa GB khá nhiều — DuckDB xử lý theo streaming: phân tích một khối, đếm nó, rồi vứt đi.',
              ),
            },
          ],
        },
        {
          title: bi('Part B — materialize', 'Phần B — materialize'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.execute(f"""
CREATE OR REPLACE TEMP TABLE spike_items AS
SELECT order_id,
       generate_subscripts(item_list, 1) AS line_no,
       unnest(item_list, recursive := true)
FROM (
    SELECT order_id,
           CAST(items AS JSON)::STRUCT(sku VARCHAR, qty INTEGER, unit_price DOUBLE)[] AS item_list
    FROM read_csv('{spike}', header=true, columns={V1_COLS})
);
""")`,
            },
            {
              kind: 'expect',
              body: bi(
                'Same 9.2M rows, but now they have to live somewhere. Expect roughly double the wall-clock and noticeably more RAM, still under 1 GB on the baseline machine. Journal both runs: wall-clock, peak RAM, row count.',
                'Vẫn 9,2 triệu dòng đó, nhưng giờ chúng phải sống ở đâu đó. Dự kiến thời gian chạy gấp khoảng đôi và RAM tăng thấy rõ, nhưng vẫn dưới 1 GB trên máy chuẩn. Ghi cả hai lần chạy vào journal: thời gian, RAM đỉnh, số dòng.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Now extrapolate, in writing: one spike day materialized ≈ 9.2M rows and most of a GB. The full history is ~200M rows — over 20 spike days at once — plus working memory for any sort or join on top. That blows past your 8 GB memory_limit, and DuckDB starts spilling to temp_directory and gets slow (you will watch that happen, on purpose, in A13). This is why real pipelines process PER PARTITION — one day at a time, like your A02 loader — and why A12 parallelizes those per-day units instead of throwing one giant query at the problem.',
                'Giờ hãy ngoại suy, và viết ra: một spike day được materialize là khoảng 9,2 triệu dòng và gần trọn một GB. Cả lịch sử là khoảng 200 triệu dòng — hơn 20 spike day cùng lúc — cộng thêm bộ nhớ làm việc cho bất kỳ phép sắp xếp hay nối nào chồng lên. Cái đó vượt xa mức trần 8 GB của bạn, và DuckDB bắt đầu tràn ra thư mục tạm rồi chậm dần (bạn sẽ tận mắt thấy chuyện đó, một cách có chủ đích, ở A13). Đây là lý do pipeline thật xử lý THEO TỪNG PHÂN VÙNG — mỗi lần một ngày, như bộ nạp của bạn ở A02 — và là lý do A12 song song hoá các đơn vị theo ngày đó thay vì ném một truy vấn khổng lồ vào bài toán.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Both counts are exactly 9,214,235 (the manifest says 3,643,024 order rows for the spike day)', 'Cả hai con số đếm đều đúng bằng 9.214.235 (manifest ghi 3.643.024 dòng đơn hàng cho spike day)'),
        bi('You recorded wall-clock and peak RAM for stream vs materialize', 'Bạn đã ghi lại thời gian chạy và RAM đỉnh cho cả cách streaming lẫn cách materialize'),
        bi('Your journal states the ~200M estimate and why per-partition processing follows from it', 'Journal của bạn nêu ước lượng khoảng 200 triệu dòng và vì sao từ đó suy ra cách xử lý theo từng phân vùng'),
      ],
    },

    {
      id: 'a04-verify',
      title: bi('Verify yourself', 'Tự kiểm chứng'),
      goal: bi('Exact numbers for small scale, day 2026-06-02.', 'Các con số chính xác cho scale small, ngày 2026-06-02.'),
      steps: [
        {
          title: bi('The reference table', 'Bảng số chuẩn'),
          blocks: [
            {
              kind: 'code',
              lang: 'text',
              body: `Check                          | Expect
-------------------------------|------------------------------------------
Day-table rows                 | 59,024   (= manifest)
Item rows                      | 149,190  (= sum(json_array_length(items)))
String-typed qty rows          | 161
NULL qty after strict cast     | 0
Avg items/order                | 2.53
Orphan item lines              | 310  (0.21%)
utm sentinel / null / absent   | 5,930 / 5,981 / 5,945
->>'utm' IS NULL               | 11,926   (collapses null + absent)
Devices                        | android 20,399 · ios 17,863
                               | web 14,850 · desktop 5,912
Mart date groups               | 3 (2026-06-01, 2026-06-02, NULL)
Spike day (small) item lines   | 460,210
Spike day (full) item lines    | 9,214,235`,
            },
            {
              kind: 'text',
              body: bi(
                'Full scale: the same 2026-06-02 has roughly 20× everything (exact row count in your full-scale manifest: 1,180,490). Timings and RAM are machine-dependent.',
                'Ở scale full: cùng ngày 2026-06-02 thì mọi thứ gấp khoảng 20 lần (số dòng chính xác nằm trong manifest scale full của bạn: 1.180.490). Thời gian và RAM thì tuỳ máy.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('core.order_items exists, typed, with the two lineage columns', 'Bảng core.order_items tồn tại, có kiểu rõ ràng, kèm hai cột lineage'),
        bi('Conservation check passes', 'Conservation check đạt'),
        bi('marts.category_daily_revenue built; the three order_date groups explained', 'Đã dựng marts.category_daily_revenue; đã giải thích ba nhóm order_date'),
      ],
    },

    {
      id: 'a04-mistakes',
      title: bi('Common beginner mistakes', 'Lỗi thường gặp của người mới'),
      goal: bi('Five traps; the third is the expensive one.', 'Năm cái bẫy; cái thứ ba là cái tốn kém nhất.'),
      steps: [
        {
          title: bi('The five', 'Năm lỗi'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'Parsing JSON in a Python loop — json.loads over fetchall() rows. It works on 59k rows and dies of old age on 1.2M × 69. The database parses JSON in parallel; let it.',
                'Phân tích JSON bằng vòng lặp Python — chạy json.loads trên các dòng lấy từ fetchall(). Nó chạy được với 59 nghìn dòng và chạy mãi không xong với 1,2 triệu nhân 69. Database phân tích JSON song song; hãy để nó làm.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'unnest next to GROUP BY in one SELECT — DuckDB refuses. Explode in a subquery, aggregate outside.',
                'Đặt unnest cạnh GROUP BY trong cùng một câu SELECT — DuckDB từ chối. Unnest trong truy vấn con, tổng hợp ở bên ngoài.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Joining item grain back to order grain and summing order columns — join order_items to orders and sum(order_total): every 3-item order counts its total 3 times. Sum each measure at its own grain.',
                'Nối grain item ngược về grain đơn hàng rồi cộng các cột của đơn hàng — nối order_items với orders rồi sum(order_total): mỗi đơn có 3 item sẽ tính tổng tiền của nó 3 lần. Hãy tính tổng mỗi measure ở đúng grain của nó.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Reading ->> NULL as "the key was absent" — it also swallows stored JSON null. To DISTINGUISH (audits, contracts), use json_extract / json_type; to NORMALIZE, the collapsing is a feature.',
                'Hiểu ->> trả NULL thành "khoá đã key vắng mặt" — nó cũng nuốt luôn giá trị null được lưu trong JSON. Để PHÂN BIỆT, phục vụ kiểm toán và contract, hãy dùng json_extract hoặc json_type; còn để CHUẨN HOÁ thì chính sự gộp đó lại là một tính năng.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Strict-casting objects with optional keys — worked on five sample rows, dies on row 50,001 where utm is absent. Sampling is not schema; know which fields are optional.',
                'Ép kiểu chặt cho các đối tượng có khoá tuỳ chọn — chạy ngon với năm dòng mẫu, rồi chết ở dòng thứ 50.001 nơi utm key vắng mặt. Lấy mẫu không phải là schema; hãy biết trường nào là tuỳ chọn.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Đọc qua một lượt trước khi bắt đầu Task 2')],
    },

    {
      id: 'a04-stretch',
      title: bi('Stretch goals', 'Bài mở rộng'),
      goal: bi('Three optional exercises.', 'Ba bài tự chọn.'),
      steps: [
        {
          title: bi('Sessions', 'Session'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'meta.sess is a session id. Count distinct sessions for your day and how many contain more than one order. Very few — 58,995 distinct for 59,024 rows on small 2026-06-02.',
                'Trường meta.sess là mã session. Đếm số phiên phân biệt trong ngày của bạn và xem bao nhiêu phiên chứa nhiều hơn một đơn hàng. Rất ít — 58.995 phiên phân biệt trên 59.024 dòng với bộ nhỏ ngày 2026-06-02.',
              ),
            },
          ],
        },
        {
          title: bi('Reconciliation preview', 'Xem trước phép reconcile'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Compare each order\'s sum(qty * unit_price) from core.order_items against the cleaned order_total from A03; count orders differing by more than 0.01. Expect roughly 0.5–0.8% — the deliberate 0.5% mismatch dirt plus late corrections that changed totals. Just count today; A05 turns this into a formal check with quarantine.',
                'So tổng qty nhân unit_price của từng đơn lấy từ core.order_items với cột order_total đã cleaning ở A03; đếm số đơn lệch quá 0,01. Dự kiến khoảng 0,5 tới 0,8% — phần rác lệch 0,5% được cài có chủ đích cộng với các bản sửa về trễ làm đổi tổng tiền. Hôm nay chỉ đếm thôi; A05 sẽ biến việc này thành một check chính thức kèm quarantine.',
              ),
            },
          ],
        },
        {
          title: bi('Nested Parquet', 'Parquet lồng nhau'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'COPY a SELECT order_id, <the strict cast> AS items to a Parquet file, then DESCRIBE a read_parquet of it: the column comes back as the full LIST<STRUCT> type — Parquet stores nested types natively, no JSON strings anywhere. Compare the file size against the same rows as raw CSV.',
                'Dùng COPY để ghi một câu SELECT order_id cùng strict cast thành cột items ra một file Parquet, rồi DESCRIBE kết quả read_parquet của nó: cột đó quay về đúng kiểu LIST<STRUCT> đầy đủ — Parquet lưu các nested type một cách native, không còn chuỗi JSON ở đâu cả. So dung lượng file với chính những dòng đó ở dạng CSV thô.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Hoàn thành ít nhất một mục')],
    },
  ],
}
