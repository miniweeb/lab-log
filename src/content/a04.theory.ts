import type { TheorySection, Term } from '../types'
import { bi } from '../types'

export const a04Theory: TheorySection[] = [
  {
    level: 'problem',
    heading: bi('CSV cannot say "one order contains many items"', 'CSV không có cách nào nói "một đơn hàng chứa nhiều item"'),
    paras: [
      bi(
        'Real-world feeds are not flat. An order CONTAINS items — one order, many products — and CSV has no way to say that, so shopcore stuffs a JSON string into a cell.',
        'Feed trong thực tế không phẳng. Một đơn hàng CHỨA nhiều item — một đơn, nhiều sản phẩm — mà CSV thì không có cách nào diễn đạt điều đó, nên shopcore nhét một chuỗi JSON vào trong một ô.',
      ),
      bi(
        'Until you crack that string open, "revenue by product category" is literally unanswerable. The information is right there in the file and completely inert: to the database, items is a VARCHAR, no different from a name.',
        'Chừng nào bạn chưa parse chuỗi đó ra, câu hỏi "doanh thu theo danh mục sản phẩm" là câu hỏi không thể trả lời được theo đúng nghĩa đen. Thông tin nằm ngay đó trong file và hoàn toàn không dùng được: với database, items chỉ là một VARCHAR, không khác gì một cái tên.',
      ),
      bi(
        'Turning JSON text into properly typed rows and columns is one of the most common jobs in data engineering, and doing it in SQL instead of a Python loop is the difference between seconds and hours at scale.',
        'Biến văn bản JSON thành các dòng và cột có kiểu rõ ràng là một trong những công việc phổ biến nhất của data engineering, và làm nó bằng SQL thay vì bằng một vòng lặp Python là khác biệt giữa vài giây và vài giờ khi lên quy mô.',
      ),
    ],
  },
  {
    level: 'alternatives',
    heading: bi('Four tempting ways to handle nesting', 'Bốn cách hấp dẫn để xử lý dữ liệu lồng nhau'),
    paras: [],
    alternatives: [
      {
        name: bi('Parse the JSON in a Python loop', 'Phân tích JSON bằng một vòng lặp Python'),
        appeal: bi(
          'json.loads over fetchall() rows is obvious, readable, and you already know how to do it.',
          'Chạy json.loads trên các dòng lấy từ fetchall() là cách hiển nhiên, dễ đọc, và bạn đã biết làm rồi.',
        ),
        breaks: bi(
          'It works on 59k rows and dies of old age on 1.2M × 69 days. The database parses JSON in parallel; let it. This is the single most common way juniors turn a 20-second job into an overnight one.',
          'Nó chạy được với 59 nghìn dòng và chạy mãi không xong với 1,2 triệu dòng nhân 69 ngày. Database phân tích JSON song song; hãy để nó làm. Đây là cách phổ biến nhất mà người mới biến một công việc 20 giây thành một công việc chạy qua đêm.',
        ),
      },
      {
        name: bi('Flatten into sku_1, qty_1, sku_2, qty_2 …', 'Dàn phẳng thành sku_1, qty_1, sku_2, qty_2 …'),
        appeal: bi(
          'Keeps one row per order, which everyone already understands. No new tables, no grain change.',
          'Giữ nguyên mỗi đơn một dòng, cách mà ai cũng đã hiểu sẵn. Không bảng mới, không đổi grain.',
        ),
        breaks: bi(
          'How many columns? Orders here have 1 to 6 items, so you would need 12 columns, mostly NULL — and the day a 7-item order arrives, your schema is wrong. Worse, "revenue by category" now means checking six column pairs. A fact is defined by its grain, so two grains means two facts: the lines get their own core.order_items table.',
          'Bao nhiêu cột? Đơn hàng ở đây có từ 1 tới 6 item, nên bạn cần 12 cột, mà phần lớn là NULL — và khi có đơn 7 item, schema của bạn sai. Tệ hơn, câu "doanh thu theo danh mục" giờ đồng nghĩa với việc kiểm tra sáu cặp cột. Một fact table được định nghĩa bởi grain của nó, nên hai grain nghĩa là hai fact table: các dòng item có bảng core.order_items riêng của chúng.',
        ),
      },
      {
        name: bi('Cast everything strictly and let it fail loudly', 'Ép kiểu chặt hết và để nó hỏng ầm ĩ'),
        appeal: bi(
          'Strict is the right default — problems fail loud instead of turning into silent NULLs.',
          'Chặt chẽ đúng là lựa chọn mặc định hợp lý — vấn đề hỏng một cách ồn ào thay vì biến thành NULL mà không báo gì.',
        ),
        breaks: bi(
          'Right for items, wrong for meta. A strict struct cast demands every field, and ~10% of rows legitimately have no utm key — the cast dies with Object {...} does not have key "utm". Neither strict nor lenient is "the right one": strict is the right default; lenient is the right tool when the data has LEGITIMATE variation.',
          'Đúng với items, sai với meta. Strict cast sang struct đòi hỏi phải có đủ mọi trường, mà khoảng 10% số dòng thì hợp lệ mà không hề có khoá utm — strict cast lỗi với thông báo Object {...} does not have key "utm". Không cái nào trong hai cái là "cái đúng": chặt chẽ là mặc định hợp lý; nới lỏng là công cụ đúng khi dữ liệu có biến thiên HỢP LỆ.',
        ),
      },
      {
        name: bi('Unnest the whole history in one query', 'Bung toàn bộ lịch sử trong một truy vấn'),
        appeal: bi(
          'One query, one table, done. The engine streams, so why process day by day?',
          'Một truy vấn, một bảng, xong. Engine xử lý theo streaming mà, việc gì phải làm từng ngày một?',
        ),
        breaks: bi(
          'The feed eventually totals ~82M order rows across 69 days. Multiply by ~2.5 items per order: roughly 200M item rows. One spike day materialized is already 9.2M rows and most of a GB. 200M rows is over 20 spike days at once, plus working memory for any sort or join on top — that blows past your 8 GB memory_limit and DuckDB starts spilling to disk. This is why real pipelines process PER PARTITION, one day at a time.',
          'Feed này cuối cùng tổng cộng khoảng 82 triệu dòng đơn hàng trải trên 69 ngày. Nhân với khoảng 2,5 item mỗi đơn: chừng 200 triệu dòng item. Chỉ một spike day được materialize đã là 9,2 triệu dòng và gần trọn một GB. 200 triệu dòng là hơn 20 spike day cùng lúc, cộng thêm bộ nhớ làm việc cho bất kỳ phép sắp xếp hay nối nào chồng lên — cái đó vượt xa mức trần 8 GB của bạn và DuckDB bắt đầu tràn ra đĩa. Đây là lý do pipeline thật xử lý THEO TỪNG PHÂN VÙNG, mỗi lần một ngày.',
        ),
      },
    ],
    checks: [
      {
        q: bi(
          'You join order_items back to orders and sum(order_total). What goes wrong?',
          'Bạn nối order_items ngược về bảng orders rồi tính sum(order_total). Điều gì sẽ hỏng?',
        ),
        a: bi(
          'Every 3-item order counts its total 3 times. Sum each measure at its OWN grain: qty * unit_price belongs to the item row, order_total to the order row. This is how people double-count revenue.',
          'Mỗi đơn hàng có 3 item sẽ tính tổng tiền của nó 3 lần. Hãy tính tổng mỗi measure ở ĐÚNG grain của nó: qty nhân unit_price thuộc về dòng item, còn order_total thuộc về dòng đơn hàng. Đây chính là cách người ta đếm trùng doanh thu.',
        ),
      },
    ],
  },
  {
    level: 'idea',
    heading: bi('Three type worlds, and one deliberate grain change', 'Ba thế giới kiểu dữ liệu, và một lần đổi grain có chủ đích'),
    paras: [
      bi(
        'The items column in your staging table is currently a VARCHAR — to the database it is just text. Cast it to JSON and DuckDB PARSES it: now it knows there is an array with objects inside, and you can reach in with path expressions. But JSON is still loosely typed — every value is "whatever the text says". The final step is casting to native nested types, where the schema is fixed and enforced.',
        'Cột items trong bảng staging của bạn hiện là VARCHAR — với database thì nó chỉ là văn bản. Ép kiểu nó sang JSON thì DuckDB PHÂN TÍCH nó: giờ nó biết bên trong có một mảng chứa các đối tượng, và bạn với vào được bằng các biểu thức đường dẫn. Nhưng JSON vẫn là kiểu lỏng lẻo — mọi giá trị đều là "văn bản nói sao thì là vậy". Bước cuối cùng là ép sang các nested type native, nơi schema đã cố định và được thực thi.',
      ),
      bi(
        'A STRUCT is a value with named, typed fields — like a row inside a cell: {\'sku\': \'SKU-001965\', \'qty\': 2, \'unit_price\': 114.46}. A LIST is a variable-length array of values sharing one type, written TYPE[]. Combined, one cell holds LIST<STRUCT> — exactly what an order\'s items are. Native types are what you want downstream: columnar, compact, fast to filter, stored natively by Parquet. JSON is the doorway, not the destination.',
        'Một STRUCT là một giá trị có các trường được đặt tên và có kiểu — như một dòng nằm bên trong một ô: {\'sku\': \'SKU-001965\', \'qty\': 2, \'unit_price\': 114.46}. Một LIST là một mảng độ dài thay đổi chứa các giá trị cùng kiểu, viết là TYPE[]. Ghép lại, một ô chứa LIST<STRUCT> — đúng bằng cái mà các item của một đơn vốn là. Kiểu native mới là thứ bạn muốn ở phía dưới: lưu theo cột, gọn, lọc nhanh, và được Parquet lưu native. JSON là bước trung gian, không phải đích đến.',
      ),
      bi(
        'Grain. Your staging table has ORDER grain: one row = one order. To analyze products you need ITEM grain: one row = one line item. unnest is the operation that explodes a list into rows — it CHANGES the grain. Expect the row count to multiply by the average list length, about 2.5 here. Changing grain on purpose is modeling; changing it by accident is how people double-count revenue.',
        'Về grain, tức grain. Bảng staging của bạn có grain ĐƠN HÀNG: một dòng bằng một đơn hàng. Để phân tích sản phẩm, bạn cần grain MẶT HÀNG: một dòng bằng một line item. Hàm unnest là phép toán unnest một danh sách thành nhiều dòng — nó ĐỔI grain. Hãy chờ đợi số dòng nhân lên theo độ dài trung bình của danh sách, ở đây khoảng 2,5. Đổi grain có chủ đích là mô hình hoá; đổi nó do sơ ý là cách người ta đếm trùng doanh thu.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Why does items get its own table instead of columns on the order row?',
          'Vì sao items được cho một bảng riêng thay vì thành các cột trên dòng đơn hàng?',
        ),
        a: bi(
          'Because a fact is defined by its grain, and these are two different grains. A03 named core.orders_enriched a fact at order grain; core.order_items is a SECOND fact table at item grain. Measures follow their grain too.',
          'Vì một fact table được định nghĩa bởi grain của nó, mà đây là hai grain khác nhau. A03 đã gọi core.orders_enriched là một fact table ở grain đơn hàng; còn core.order_items là fact table THỨ HAI ở grain item. Các measure đo cũng đi theo grain của chúng.',
        ),
      },
    ],
  },
  {
    level: 'mechanism',
    heading: bi('Strict vs lenient, and three flavors of missing', 'Chặt so với lỏng, và ba dạng giá trị rỗng'),
    paras: [
      bi(
        'DuckDB gives you two ways from JSON to typed values. CAST(x AS JSON)::STRUCT(...)[] is STRICT: anything that does not fit the target type is an error and the whole query dies. Good, because problems fail loud. json_transform(x, \'...spec...\') is LENIENT: anything that does not fit becomes NULL, silently. Good, because it survives messy reality. Bad, because it is silent.',
        'DuckDB cho bạn hai đường đi từ JSON sang giá trị có kiểu. Cách CAST(x AS JSON)::STRUCT(...)[] là CHẶT: thứ gì không vừa kiểu đích sẽ thành lỗi và cả truy vấn chết theo. Tốt, vì vấn đề hỏng một cách ồn ào. Cách json_transform(x, \'...đặc tả...\') là LỎNG: thứ gì không vừa sẽ thành NULL, mà không báo gì. Tốt, vì nó sống sót qua thực tế bừa bộn. Dở, vì nó im lặng.',
      ),
      bi(
        'In a flat column, "no value" is just NULL. JSON has THREE ways to say it: the key holds JSON null, the key is ABSENT entirely, or upstream wrote a sentinel string like "none". All three occur in this feed\'s meta.utm, all three mean the same thing to the business.',
        'Trong một cột phẳng, "không có giá trị" chỉ đơn giản là NULL. JSON thì có BA cách để nói điều đó: khoá chứa giá trị null của JSON, khoá VẮNG MẶT hoàn toàn, hoặc upstream ghi một sentinel string kiểu "none". Cả ba đều xuất hiện trong cột meta.utm của nguồn này, và với nghiệp vụ thì cả ba đều mang cùng một ý nghĩa.',
      ),
      bi(
        'The predicates that tell them apart are the lesson. json_extract returns SQL NULL ONLY when the key is absent; a stored JSON null comes back as a JSON null value (json_type says \'NULL\'), which is NOT SQL NULL. Meanwhile ->> collapses both cases to SQL NULL. That collapsing is what you want for cleaning: NULLIF(CAST(meta AS JSON)->>\'utm\', \'none\') folds all three flavors into one honest NULL.',
        'Chính những vị từ dùng để phân biệt chúng mới là bài học. Hàm json_extract trả về NULL của SQL CHỈ khi khoá key vắng mặt; còn một giá trị null được lưu trong JSON thì quay về dưới dạng giá trị null của JSON (hàm json_type nói là \'NULL\'), và cái đó KHÔNG PHẢI NULL của SQL. Trong khi đó toán tử ->> gộp cả hai trường hợp thành NULL của SQL. Chính sự gộp đó là thứ bạn cần khi cleaning: biểu thức NULLIF(CAST(meta AS JSON)->>\'utm\', \'none\') gộp cả ba kiểu lại thành một NULL trung thực duy nhất.',
      ),
      bi(
        'One more rule you will trip over otherwise: in DuckDB, unnest cannot share a SELECT with GROUP BY. Explode in a subquery, aggregate outside — you will use this pattern twice today.',
        'Còn một luật nữa mà không biết thì bạn sẽ vấp: trong DuckDB, unnest không dùng chung một câu SELECT với GROUP BY được. Unnest trong một truy vấn con, tổng hợp ở bên ngoài — hôm nay bạn sẽ dùng khuôn này hai lần.',
      ),
    ],
    checks: [
      {
        q: bi(
          'You count ->>\'utm\' IS NULL and get 11,926, but sentinel/json-null/absent are 5,930 / 5,981 / 5,945. Check the arithmetic.',
          'Bạn đếm ->>\'utm\' IS NULL và được 11.926, trong khi ba nhóm sentinel, json null và key vắng mặt lần lượt là 5.930, 5.981, 5.945. Kiểm tra lại phép tính.',
        ),
        a: bi(
          '5,981 + 5,945 = 11,926. The ->> operator collapses json-null and absent, but NOT the sentinel string "none" — that is still the text "none", not NULL. Which is exactly why NULLIF is needed on top.',
          '5.981 cộng 5.945 bằng 11.926. Toán tử ->> gộp nhóm json null và nhóm key vắng mặt, nhưng KHÔNG gộp sentinel string "none" — cái đó vẫn là văn bản "none", không phải NULL. Và đó chính là lý do cần thêm NULLIF ở bên ngoài.',
        ),
      },
    ],
  },
  {
    level: 'detail',
    heading: bi('Conservation, orphans, and where scratch tables live', 'Bảo toàn, orphan, và chỗ ở của các bảng nháp'),
    paras: [
      bi(
        'Conservation check. After any grain change, prove no rows appeared or vanished: the item row count must equal sum(json_array_length(items)). This is the A03 habit — every rule counts what it touched — applied to a structural transformation instead of a cleaning one.',
        'Conservation check. Sau mọi lần đổi grain, hãy chứng minh không có dòng nào tự sinh ra hay biến mất: số dòng item phải bằng sum(json_array_length(items)). Đây chính là thói quen của A03 — mọi quy tắc đều đếm thứ nó chạm vào — nhưng áp dụng cho một phép biến đổi cấu trúc thay vì một phép cleaning.',
      ),
      bi(
        'Orphans. Some item lines have a sku with no match in the products dimension — products sold but never added to the dim. Use LEFT JOIN, not INNER: an INNER join would silently DROP those lines, revenue shrinks and nobody knows. A LEFT join keeps them so you can count them. Do not delete or fix them today — detecting and quarantining unfixable rows is A05\'s whole job. Today you only measure and report.',
        'Về orphan. Một số dòng item có mã sku không khớp với bất kỳ dòng nào trong dimension products — hàng đã bán nhưng chưa từng được thêm vào dimension. Hãy dùng LEFT JOIN chứ không phải INNER: một phép INNER join sẽ ngầm LOẠI BỎ những dòng đó, doanh thu co lại mà không ai biết. Phép LEFT join giữ chúng lại để bạn đếm được. Hôm nay đừng xoá hay sửa chúng — phát hiện và quarantine những dòng không sửa được là toàn bộ công việc của A05. Hôm nay bạn chỉ đo và báo cáo.',
      ),
      bi(
        'Scratch tables stay TEMP. Today\'s day table lives in your connection, not in the shared staging schema, and vanishes when your script exits. That placement is the point: it is a scratch table for exercises, not a pipeline output, so it skips the two lineage columns — and since the lineage rule promises both on every staging/core row, a table without them has no business sitting in staging.',
        'Bảng nháp thì để dạng TEMP. Bảng ngày của hôm nay sống trong kết nối của bạn chứ không nằm trong schema staging dùng chung, và biến mất khi script kết thúc. Chỗ đặt đó chính là điểm mấu chốt: nó là bảng nháp cho bài tập, không phải kết quả của pipeline, nên nó bỏ qua hai cột lineage — và vì quy tắc lineage hứa rằng mọi dòng ở staging và core đều có đủ hai cột đó, một bảng thiếu chúng thì không có tư cách ngồi trong staging.',
      ),
      bi(
        'The rule cuts the other way for core.order_items: that table IS durable, so it stamps the pair itself — _data_date straight from DAY, because a TEMP parent has no lineage to inherit.',
        'Quy tắc đó lại cắt theo chiều ngược lại với core.order_items: bảng đó thì BỀN, nên nó tự đóng dấu cặp cột lineage — với _data_date lấy thẳng từ biến DAY, bởi vì một bảng cha dạng TEMP thì chẳng có lineage nào để mà thừa kế.',
      ),
      bi(
        'Contract gaps versus violations. About 0.3% of rows carry qty as a JSON string ("qty":"2" instead of "qty":2), and the strict cast quietly coerces them to numbers. That is a GAP, not a violation — the shopcore contract never pins the inner JSON types. Same for the utm null representation. Gaps are candidates for the A06 amendment list, not producer bug reports.',
        'Gap của contract, khác với violation contract. Khoảng 0,3% số dòng ghi qty dưới dạng chuỗi JSON ("qty":"2" thay vì "qty":2), và strict cast lặng lẽ ép chúng thành số. Đó là một KHOẢNG TRỐNG, không phải violation — contract shopcore chưa bao giờ ghim các kiểu bên trong JSON. Cách biểu diễn giá trị rỗng của utm cũng vậy. Gap là ứng viên cho danh sách amendment contract ở A06, chứ không phải cho báo cáo lỗi gửi producer.',
      ),
    ],
  },
]

export const a04Terms: Term[] = [
  {
    term: 'STRUCT',
    gloss: 'giá trị có các trường được đặt tên',
    means: bi(
      'A value with named, typed fields — like a row inside a cell: {\'sku\': \'SKU-001965\', \'qty\': 2, \'unit_price\': 114.46}.',
      'Một giá trị có các trường được đặt tên và có kiểu — như một dòng nằm bên trong một ô: {\'sku\': \'SKU-001965\', \'qty\': 2, \'unit_price\': 114.46}.',
    ),
    source: { name: 'DuckDB — STRUCT type', url: 'https://duckdb.org/docs/sql/data_types/struct' },
  },
  {
    term: 'LIST',
    gloss: 'mảng độ dài thay đổi',
    means: bi(
      'A variable-length array of values sharing one type, written TYPE[]. An order\'s items are LIST<STRUCT>.',
      'Một mảng độ dài thay đổi chứa các giá trị cùng kiểu, viết là TYPE[]. Các item của một đơn là LIST<STRUCT>.',
    ),
    source: { name: 'DuckDB — LIST type', url: 'https://duckdb.org/docs/sql/data_types/list' },
  },
  {
    term: 'unnest',
    gloss: 'unnest danh sách thành dòng',
    means: bi(
      'Explodes a list into rows — it CHANGES the grain. Row count multiplies by average list length. Cannot share a SELECT with GROUP BY in DuckDB.',
      'Bung một danh sách thành nhiều dòng — nó ĐỔI grain. Số dòng nhân lên theo độ dài trung bình của danh sách. Trong DuckDB, nó không dùng chung câu SELECT với GROUP BY được.',
    ),
    source: { name: 'DuckDB — unnest', url: 'https://duckdb.org/docs/sql/query_syntax/unnest' },
  },
  {
    term: 'Grain',
    gloss: 'grain',
    means: bi(
      'What one row means. Order grain: one row = one order. Item grain: one row = one line item. Changing it on purpose is modeling; by accident it is how people double-count.',
      'Một dòng nghĩa là gì. Grain đơn hàng: một dòng bằng một đơn. Grain item: một dòng bằng một line item. Đổi nó có chủ đích là mô hình hoá; đổi do sơ ý là cách người ta tính trùng.',
    ),
    source: { name: 'Kimball Group — dimensional modeling techniques', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/' },
  },
  {
    term: 'Strict vs lenient conversion',
    gloss: 'strict vs lenient',
    means: bi(
      'Strict cast errors on anything that does not fit; json_transform turns it into NULL silently. Strict is the right default; lenient is right when variation is legitimate.',
      'Phép strict cast báo lỗi với bất cứ thứ gì không vừa; hàm json_transform biến nó thành NULL mà không báo gì. Chặt là mặc định hợp lý; lỏng là đúng khi sự biến thiên là hợp lệ.',
    ),
    source: { name: 'DuckDB — JSON functions', url: 'https://duckdb.org/docs/data/json/overview' },
  },
  {
    term: 'Conservation check',
    gloss: 'conservation check',
    means: bi(
      'After any grain change, prove no rows appeared or vanished: item rows must equal sum(json_array_length(items)).',
      'Sau mọi lần đổi grain, chứng minh không dòng nào tự sinh ra hay biến mất: số dòng item phải bằng sum(json_array_length(items)).',
    ),
    source: { name: 'dbt — tests', url: 'https://docs.getdbt.com/docs/build/data-tests' },
  },
  {
    term: 'Mart',
    gloss: 'mart',
    means: bi(
      'A small, purpose-built table that answers business questions directly — the payoff for the plumbing.',
      'Một bảng nhỏ, dựng riêng cho một mục đích, trả lời thẳng câu hỏi nghiệp vụ — phần thưởng cho toàn bộ công đoạn đường ống.',
    ),
    source: { name: 'dbt — how we structure projects', url: 'https://docs.getdbt.com/best-practices/how-we-structure/4-marts' },
  },
  {
    term: 'Contract gap vs violation',
    gloss: 'gap contract so với violation',
    means: bi(
      'A violation breaks a written promise. A gap is something the contract never pinned down — a candidate for the A06 amendment list, not a producer bug report.',
      'Một violation là phá vỡ một lời hứa đã được viết ra. Một gap là điều mà contract chưa bao giờ ghim xuống — ứng viên cho danh sách amendment ở A06, chứ không phải cho báo cáo lỗi gửi producer.',
    ),
    source: { name: 'MotherDuck glossary', url: 'https://motherduck.com/glossary/' },
  },
]
