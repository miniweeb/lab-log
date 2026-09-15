export interface ConceptItem {
  id: string
  subject:
    | 'Pipeline Lifecycle'
    | 'SQL & Engine'
    | 'Storage & Pruning'
    | 'Cleansing'
    | 'Complex Types'
    | 'Quality Gate'
    | 'SQL Fundamentals'
    | 'Data Modeling'
    | 'Reliability & Ops'
  term: string              // Thuật ngữ / Khái niệm chính
  pronounceOrType?: string  // Phân loại kỹ thuật / Bước thực thi
  formulaOrSyntax: string   // Công thức / Cú pháp chuẩn
  definition: string        // Định nghĩa bản chất
  pitfall: string           // Cạm bẫy / Điểm mấu chốt cần tránh
  sourceLink?: { text: string; url: string }
}

export const DEFAULT_CONCEPTS: ConceptItem[] = [
  {
    "id": "c_pipeline_paradigms",
    "subject": "Pipeline Lifecycle",
    "term": "1. ETL vs. ELT vs. EtLT Paradigms",
    "pronounceOrType": "Mô hình kiến trúc tổng quan",
    "definition": "Khái niệm đầu tiên cần hiểu: Dữ liệu biến đổi ở đâu? ETL (biến đổi ngoài kho), ELT (nạp thô rồi biến đổi trong kho), và EtLT (làm sạch nhẹ 't' tại staging rồi mới biến đổi nghiệp vụ nặng 'T' trong kho). Lab này là EtLT.",
    "formulaOrSyntax": "ETL  ➔ Extract ➔ Transform (server riêng) ➔ Load\nELT  ➔ Extract ➔ Load thô vào DW ➔ Transform SQL\nEtLT ➔ Extract ➔ 't' (Làm sạch nhẹ) ➔ Load Core ➔ 'T' (Marts/Facts)\n-- Lab A00-A05: 't' ở a03_cleaners ➔ Load Core/Quarantine ➔ 'T' ở a04 marts",
    "pitfall": "Tưởng rằng lab này là ETL cổ điển; thực chất DuckDB chạy theo mô hình EtLT hiện đại biến đổi trực tiếp trong Lakehouse.",
    "sourceLink": {
      "text": "DuckDB Architecture Overview",
      "url": "https://duckdb.org/docs/guides/overview"
    }
  },
  {
    "id": "c_batch_vs_streaming",
    "subject": "Pipeline Lifecycle",
    "term": "2. Batch vs. Micro-batch vs. Streaming",
    "pronounceOrType": "Mô hình xử lý theo độ trễ",
    "definition": "Đường ống chạy theo chu kỳ nào: Batch (theo lô định kỳ ngày/giờ, khối lượng lớn), Micro-batch (chia luồng thành các lô vài giây), và Streaming (xử lý từng sự kiện real-time). Lab chạy Daily Batch.",
    "formulaOrSyntax": "Batch       ➔ Chạy theo ngày (T+1), xử lý bounded data (ví dụ: Day 2026-06-02)\nMicro-batch ➔ Gom cửa sổ 5s-1m (Apache Spark Streaming)\nStreaming   ➔ Xử lý unbounded stream từng event (Kafka/Flink)",
    "pitfall": "Đưa các hàm gom nhóm toàn cục (như ROW_NUMBER trên toàn file) vào Streaming mà không có cơ chế Watermark.",
    "sourceLink": {
      "text": "DuckDB Query Syntax",
      "url": "https://duckdb.org/docs/sql/query_syntax/from"
    }
  },
  {
    "id": "c_blame_isolation",
    "subject": "Pipeline Lifecycle",
    "term": "3. Blame Isolation (Khoanh vùng trách nhiệm)",
    "pronounceOrType": "Nguyên tắc thiết kế phân tầng",
    "definition": "Khi dữ liệu sai, lỗi do ai? Chia tầng để định vị: Sai ở Raw do Upstream (Vendor), sai ở Staging do Cleaning Rules, sai ở Core do logic Modeling/Joins.",
    "formulaOrSyntax": "Raw (VARCHAR) ➔ Staging (1:1 Cleaned) ➔ Core (Enriched/Joined) ➔ Ops (Audit/Alerts)",
    "pitfall": "Lọc bỏ dòng lỗi ngay từ Raw: làm mất dấu vết nguồn và mất khả năng kiểm toán, tái lập dữ liệu khi cần điều tra.",
    "sourceLink": {
      "text": "DuckDB Schemas",
      "url": "https://duckdb.org/docs/sql/statements/create_schema"
    }
  },
  {
    "id": "c_idempotency",
    "subject": "Pipeline Lifecycle",
    "term": "4. Idempotency (chạy lại bao nhiêu lần cũng ra một kết quả)",
    "pronounceOrType": "Nguyên lý vàng trong Data Engineering",
    "definition": "Đặc tính sống còn: Pipeline chạy 1 lần hay chạy lại 10 lần với cùng một batch dữ liệu thì kết quả bảng đích phải như nhau, không sinh trùng lặp hay lỗi trạng thái.",
    "formulaOrSyntax": "-- Xóa theo ngày dữ liệu trước khi nạp lại (Delete before Insert):\nDELETE FROM core.orders WHERE _data_date = DATE '2026-06-02';\nINSERT INTO core.orders SELECT * FROM staging.clean_orders;",
    "pitfall": "Dùng INSERT INTO trần mà không có khóa partition hoặc delete-before-insert: chạy lại job khi có sự cố sẽ nhân đôi toàn bộ dữ liệu.",
    "sourceLink": {
      "text": "DuckDB DELETE Statement",
      "url": "https://duckdb.org/docs/sql/statements/delete"
    }
  },
  {
    "id": "c_contract_vs_code",
    "subject": "Pipeline Lifecycle",
    "term": "5. Data Contract Separation",
    "pronounceOrType": "Mã nguồn quản trị (Governance as Code)",
    "definition": "Tách bạch thỏa thuận và thực thi: Ngân sách dung sai (Tolerances) được định nghĩa trong Contract YAML có version control; code chỉ nạp động cấu hình, không hard-code.",
    "formulaOrSyntax": "CHECK_MAP = { 'null_or_invalid_status': 'bad_status', ... }\nTHRESHOLDS = { CHECK_MAP[k]: float(v.rstrip('%')) for k, v in contract_yaml.items() }",
    "pitfall": "Hard-code ngưỡng lỗi vào code: khi doanh nghiệp đổi chính sách dung sai, kỹ sư phải sửa code và deploy lại toàn bộ pipeline.",
    "sourceLink": {
      "text": "Data Contracts Architecture",
      "url": "https://datacontracts.com/"
    }
  },
  {
    "id": "c_explicit_schema",
    "subject": "SQL & Engine",
    "term": "6. Explicit Schema Binding",
    "pronounceOrType": "Khai báo kiểu tường minh (Fail-fast)",
    "definition": "Bắt buộc khai báo rõ kiểu dữ liệu từng cột khi đọc file thô; nếu cấu trúc file gửi sai thì pipeline phải hỏng ngay lập tức thay vì suy đoán sai kiểu.",
    "formulaOrSyntax": "read_csv('orders.csv', columns={'order_id':'BIGINT', 'customer_id':'VARCHAR', ...})",
    "pitfall": "Dùng auto-detect: chỉ cần 0.2% dòng float (123.0) sẽ khiến engine suy đoán sai và hạ cấp toàn bộ 100% cột sang DOUBLE.",
    "sourceLink": {
      "text": "DuckDB CSV Reader",
      "url": "https://duckdb.org/docs/data/csv/overview"
    }
  },
  {
    "id": "c_reconciliation_manifest",
    "subject": "SQL & Engine",
    "term": "7. Reconciliation (Đối soát số dòng)",
    "pronounceOrType": "Đẳng thức kiểm tra toàn vẹn",
    "definition": "Quy tắc kiểm tra cơ bản nhất sau khi nạp: Số dòng đếm được trong bảng Staging phải bằng chính xác số dòng nhà cung cấp khai báo trong Manifest.",
    "formulaOrSyntax": "SELECT (SELECT count(*) FROM staging.orders) = (SELECT rows FROM read_json_auto('manifest.json')) AS is_reconciled;",
    "pitfall": "Cho rằng lệch vài dòng là sai số chấp nhận được. Trong Ingestion, lệch dù chỉ 1 dòng là dấu hiệu của bug cú pháp hoặc mất file.",
    "sourceLink": {
      "text": "DuckDB read_json_auto",
      "url": "https://duckdb.org/docs/data/json/overview"
    }
  },
  {
    "id": "c_stream_vs_materialize",
    "subject": "SQL & Engine",
    "term": "8. Streaming vs. Materialization",
    "pronounceOrType": "Cơ chế quản trị bộ nhớ RAM",
    "definition": "Hiểu cách engine đọc dữ liệu: Streaming xử lý theo luồng vector nhị phân (RAM phẳng ~20MB bất kể file 15GB); Materialization ép toàn bộ bảng lưu trên RAM gây cạn kiệt bộ nhớ.",
    "formulaOrSyntax": "-- Streaming (RAM phẳng ~20MB):\nSELECT count(*) FROM read_csv('orders.csv');\n\n-- Materialization (Tốn RAM, dễ tràn đĩa swap):\nCREATE TEMP TABLE tmp AS SELECT * FROM read_csv('orders.csv');",
    "pitfall": "Tạo quá nhiều bảng tạm (TEMP TABLE) cho các bước trung gian khiến bộ nhớ RAM bị đầy và engine buộc phải spill dữ liệu ra đĩa làm chậm hệ thống.",
    "sourceLink": {
      "text": "DuckDB Vectorized Engine",
      "url": "https://duckdb.org/docs/internals/vector"
    }
  },
  {
    "id": "c_dedup_window",
    "subject": "SQL & Engine",
    "term": "9. In-batch Deduplication",
    "pronounceOrType": "Khử trùng lặp bản ghi trong file",
    "definition": "Khi 1 đơn hàng xuất hiện nhiều lần trong cùng 1 file (do sửa đổi trạng thái trong ngày), dùng Window Function để giữ lại bản ghi có mốc updated_at mới nhất.",
    "formulaOrSyntax": "WITH ranked AS (\n  SELECT *, ROW_NUMBER() OVER (\n    PARTITION BY order_id \n    ORDER BY updated_at DESC\n  ) AS rn\n  FROM staging.orders_raw\n)\nSELECT * EXCLUDE (rn) FROM ranked WHERE rn = 1;",
    "pitfall": "Dùng DISTINCT thông thường: không xác định được dòng nào mới nhất và làm mất thông tin thời gian cập nhật.",
    "sourceLink": {
      "text": "DuckDB Window Functions",
      "url": "https://duckdb.org/docs/sql/window_functions"
    }
  },
  {
    "id": "c_parquet_trio",
    "subject": "Storage & Pruning",
    "term": "10. Parquet Performance Trio",
    "pronounceOrType": "Bộ ba tối ưu hóa định dạng cột",
    "definition": "Vì sao Parquet nhanh gấp hàng trăm lần CSV: 1. Typed Binary (không tốn CPU parse ký tự), 2. Column Projection (chỉ nạp cột cần), 3. Footer Metadata (đọc count(*) chỉ mất 1ms).",
    "formulaOrSyntax": "1. Typed Binary       ➔ Tiêu triệt CPU parse text\n2. Column Projection  ➔ Chỉ nạp cột trong SELECT\n3. Min/Max Stats      ➔ Bỏ qua khối không khớp WHERE",
    "pitfall": "Nghĩ rằng Parquet chỉ là file nén zip; bản chất thực sự của Parquet là kiến trúc định vị cột và cắt tỉa I/O cực mạnh.",
    "sourceLink": {
      "text": "Apache Parquet Docs",
      "url": "https://parquet.apache.org/docs/"
    }
  },
  {
    "id": "c_hive_pruning",
    "subject": "Storage & Pruning",
    "term": "11. Hive Partition Pruning",
    "pronounceOrType": "Cắt tỉa I/O cấp thư mục",
    "definition": "Tổ chức dữ liệu dạng key=value/ (ví dụ: order_date=2026-06-02/): Engine chỉ cần quét tên thư mục để bỏ qua 90-99% file mà không cần mở đĩa giải nén.",
    "formulaOrSyntax": "WHERE order_date = '2026-06-19'       -- Scanning 8/377 files (10ms)\n-- Ngược lại:\nWHERE CAST(order_ts AS DATE) = '2026-06-19' -- Scanning 377/377 files (31ms)",
    "pitfall": "Lọc trên biểu thức biến đổi dữ liệu (CAST) thay vì cột partition key, khiến cơ chế Partition Pruning bị vô hiệu hóa.",
    "sourceLink": {
      "text": "DuckDB Partitioning",
      "url": "https://duckdb.org/docs/data/partitioning/partitioned_writes"
    }
  },
  {
    "id": "c_late_arriving_append",
    "subject": "Storage & Pruning",
    "term": "12. Late-Arriving Data & Append Safety",
    "pronounceOrType": "Xung đột Event Time vs. Arrival Time",
    "definition": "Đơn hàng phát sinh ngày hôm trước (Event Time) bị đẩy muộn vào file ngày hôm nay (Arrival Time). Phải ghi chế độ APPEND kèm UUID để không xóa đè dữ liệu cũ.",
    "formulaOrSyntax": "COPY (...) TO 'lake/orders' \n(FORMAT PARQUET, PARTITION_BY (order_date), \n OVERWRITE_OR_IGNORE false, FILENAME_PATTERN 'data_{uuid}');",
    "pitfall": "Dùng chế độ ghi đè thư mục (OVERWRITE) khiến dữ liệu gửi bù ngày hôm sau xóa trắng toàn bộ dữ liệu lịch sử của ngày hôm trước.",
    "sourceLink": {
      "text": "DuckDB Partitioned Writes",
      "url": "https://duckdb.org/docs/data/partitioning/partitioned_writes"
    }
  },
  {
    "id": "c_dimensional_modeling",
    "subject": "Storage & Pruning",
    "term": "13. Star Schema vs. 3NF (Kimball Model)",
    "pronounceOrType": "Mô hình hóa dữ liệu phân tích",
    "definition": "Cách tổ chức bảng trong Data Warehouse: Fact Table chứa các số đo định lượng (doanh thu, số lượng) gắn với các Dimension Tables chứa ngữ cảnh (khách hàng, cửa hàng, sản phẩm).",
    "formulaOrSyntax": "Fact Table      ➔ core.order_items (order_id, sku, qty, revenue)\nDimension Table ➔ core.customers, core.products, core.stores\nData Mart       ➔ marts.category_daily_revenue (bảng tổng hợp)",
    "pitfall": "Cố gắng chuẩn hóa bậc cao (3NF) trong Data Mart khiến truy vấn báo cáo phân tích phải JOIN quá nhiều bảng, làm suy giảm hiệu năng BI.",
    "sourceLink": {
      "text": "DuckDB Schema Overview",
      "url": "https://duckdb.org/docs/sql/statements/create_table"
    }
  },
  {
    "id": "c_clean_vs_validate",
    "subject": "Cleansing",
    "term": "14. Cleansing vs. Validation Boundary",
    "pronounceOrType": "Ranh giới Hình thức vs. Bản chất",
    "definition": "Phân định rõ: Cleansing chỉ sửa hình thức biểu diễn kỹ thuật (khoảng trắng, hoa thường, định dạng ngày). Validation phán xét tính đúng đắn nghiệp vụ (tiền âm, mã không hợp lệ).",
    "formulaOrSyntax": "Cleansing  ➔ '  PAID  ' thành 'paid', '1.234,56' thành 1234.56\nValidation ➔ Tiền âm (<0) là SAI, status 'unknown' là RÁC ➔ Đẩy Quarantine",
    "pitfall": "Tự ý sửa tiền âm thành 0 hoặc biến status rác thành NULL ở bước Cleansing: làm mất bằng chứng vi phạm của nhà cung cấp.",
    "sourceLink": {
      "text": "DuckDB CASE Statement",
      "url": "https://duckdb.org/docs/sql/expressions/case"
    }
  },
  {
    "id": "c_excel_float",
    "subject": "Cleansing",
    "term": "15. Excel-Float Two-Step Casting",
    "pronounceOrType": "Quy tắc ép kiểu an toàn 2 bước",
    "definition": "Xử lý khóa ID nguyên bị Excel làm tròn thành số thực dạng text ('123456.0'): Phải ép gián tiếp qua DOUBLE trước rồi mới sang BIGINT.",
    "formulaOrSyntax": "CAST(TRY_CAST(customer_id AS DOUBLE) AS BIGINT) AS customer_id",
    "pitfall": "Ép trực tiếp chuỗi '123456.0' sang BIGINT sẽ làm câu lệnh crash vì chứa dấu chấm thập phân.",
    "sourceLink": {
      "text": "DuckDB Casting Rules",
      "url": "https://duckdb.org/docs/sql/expressions/cast"
    }
  },
  {
    "id": "c_eu_currency",
    "subject": "Cleansing",
    "term": "16. European Decimal Comma Parser",
    "pronounceOrType": "Chuẩn hóa tiền tệ châu Âu",
    "definition": "Xử lý số tiền dạng 1.234,56: Xóa dấu chấm phân cách hàng nghìn TRƯỚC, sau đó mới đổi dấu phẩy thành dấu chấm thập phân.",
    "formulaOrSyntax": "TRY_CAST(NULLIF(\n  CASE WHEN total LIKE '%,%'\n       THEN replace(replace(total, '.', ''), ',', '.')\n       ELSE replace(TRIM(total), '$', '') END,\n  'N/A') AS DECIMAL(14,2))",
    "pitfall": "Đổi phẩy thành chấm trước: 1.234,56 thành 1.234.56 (vô nghĩa); hoặc xóa nhầm dấu phẩy khiến số tiền tăng vọt 100 lần trong im lặng.",
    "sourceLink": {
      "text": "DuckDB String Functions",
      "url": "https://duckdb.org/docs/sql/functions/char"
    }
  },
  {
    "id": "c_multi_timestamp",
    "subject": "Cleansing",
    "term": "17. Multi-format Timestamp with UTC",
    "pronounceOrType": "Đa định dạng thời gian + Ghim múi giờ",
    "definition": "Dùng try_strptime thử mảng định dạng ưu tiên (ISO -> Day-first -> ISO-T). Bắt buộc ghim TimeZone=UTC để giải mã epoch đồng nhất.",
    "formulaOrSyntax": "SET TimeZone = 'UTC';\ntry_strptime(order_ts, ['%Y-%m-%d %H:%M:%S', '%d/%m/%Y %H:%M:%S', '%Y-%m-%dT%H:%M:%S'])",
    "pitfall": "Thiếu định dạng ISO-T: 0.3% đơn hợp lệ bị biến thành NULL oan uổng; không ghim TimeZone UTC: epoch bị lệch giờ ngầm.",
    "sourceLink": {
      "text": "DuckDB Date Functions",
      "url": "https://duckdb.org/docs/sql/functions/date"
    }
  },
  {
    "id": "c_schema_drift",
    "subject": "Cleansing",
    "term": "18. Schema Drift & Evolution",
    "pronounceOrType": "Tiến hóa lược đồ dữ liệu — thêm, bớt, đổi kiểu cột",
    "definition": "Dữ liệu nguồn upstream thay đổi ngầm định theo thời gian (thêm cột, đổi kiểu). Cần chiến lược: cột cốt lõi ép kiểu chặt (Fail-fast), cột mở rộng dùng lỏng (JSON).",
    "formulaOrSyntax": "1. Cột chính ➔ Explicit Schema bắt lỗi ngay\n2. Cột phụ   ➔ Dùng json_transform hoặc STRUCT lỏng lẻo\n3. Phiên bản ➔ Quản lý version era trong Data Contract",
    "pitfall": "Bật auto-detect khi có schema drift: các cột mới hoặc dữ liệu dị biệt sẽ làm thay đổi kiểu dữ liệu của cả bảng mà downstream không hay biết.",
    "sourceLink": {
      "text": "DuckDB Data Types",
      "url": "https://duckdb.org/docs/sql/data_types/overview"
    }
  },
  {
    "id": "c_unnest_grain",
    "subject": "Complex Types",
    "term": "19. Unnest & Grain Change",
    "pronounceOrType": "Thay đổi độ mịn (Order -> Line Item)",
    "definition": "Chuyển đổi độ mịn từ 1 đơn hàng thành nhiều mặt hàng chi tiết bằng unnest(). Luật DuckDB: unnest() phải đặt ở subquery trước khi GROUP BY ở ngoài.",
    "formulaOrSyntax": "SELECT order_id,\n       generate_subscripts(item_list, 1) AS line_no,\n       unnest(item_list, recursive := true)\nFROM (\n  SELECT order_id, CAST(items AS JSON)::STRUCT(sku VARCHAR, qty INT, unit_price DOUBLE)[] AS item_list\n  FROM staging.orders\n);",
    "pitfall": "Đặt unnest() chung mệnh đề SELECT với GROUP BY sẽ gây lỗi Binder Error ngay lập tức.",
    "sourceLink": {
      "text": "DuckDB UNNEST Syntax",
      "url": "https://duckdb.org/docs/sql/query_syntax/unnest"
    }
  },
  {
    "id": "c_conservation_law",
    "subject": "Complex Types",
    "term": "20. Conservation Law (Bảo toàn số dòng)",
    "pronounceOrType": "Kiểm tra không mất dòng khi đổi grain",
    "definition": "Định luật bảo toàn dữ liệu: Sau mọi lần unnest, tổng số dòng bung ra ở bảng chi tiết phải bằng chính xác tổng độ dài mảng ban đầu.",
    "formulaOrSyntax": "SELECT (SELECT count(*) FROM core.order_items) = (SELECT sum(json_array_length(items)) FROM staging.orders) AS is_conserved;",
    "pitfall": "Không kiểm tra tính bảo toàn khiến các đơn hàng có mảng rỗng [] hoặc struct lỗi bị nuốt chửng âm thầm.",
    "sourceLink": {
      "text": "DuckDB JSON Length",
      "url": "https://duckdb.org/docs/sql/functions/nested"
    }
  },
  /* ─────────── BẪY ĐỌC DỮ LIỆU & LOGIC XỬ LÝ ─────────── */
  {
    "id": "c_positional_mapping",
    "subject": "Storage & Pruning",
    "term": "21. Cạm bẫy đọc theo vị trí (Positional Mapping Trap)",
    "pronounceOrType": "Lỗi hỏng trong im lặng khi nguồn đổi cấu trúc",
    "definition": "Khi đọc file CSV, ta thường khai báo một bộ khung chuẩn (Explicit Schema) để công cụ khỏi đoán sai kiểu. Nhưng công cụ (engine) thường ghép cột theo VỊ TRÍ 1-2-3, ngó lơ hoàn toàn tên cột trên dòng đầu tiên (header). Nếu hôm nay nhà cung cấp tự ý đảo thứ tự cột trong file, dữ liệu sẽ chạy thẳng vào sai cột.",
    "formulaOrSyntax": "-- Cấu hình khai báo: Cột 2 là JSON Items, Cột 3 là Tiền tệ (đều là kiểu chuỗi)\nread_csv(..., columns={'id':'INT', 'items':'VARCHAR', 'currency':'VARCHAR'})",
    "pitfall": "Nhà cung cấp đảo cột tiền tệ lên vị trí số 2. Chuỗi 'USD' chui tọt vào cột 'items'. Vì cả hai đều là văn bản, chương trình chạy mượt mà không văng lỗi (Silent failure). Lỗi làm sập script hóa ra lại dễ chịu hơn vì có còi báo để ta sửa ngay[cite: 8, 12].",
    "sourceLink": { "text": "DuckDB read_csv columns", "url": "https://duckdb.org/docs/stable/data/csv/overview" }
  },
  {
    "id": "c_fanout_trap",
    "subject": "Complex Types",
    "term": "22. Cạm bẫy Fan-Out (Nhân trùng doanh thu)",
    "pronounceOrType": "Nguyên lý bảo toàn độ mịn dữ liệu",
    "definition": "Độ mịn (grain) quyết định 1 dòng của bảng đại diện cho cái gì. Khi bạn bung một đơn hàng thành 3 mặt hàng chi tiết, 1 dòng cha đẻ ra 3 dòng con. Nếu bạn tùy tiện nối (JOIN) bảng con này ngược lại bảng cha, rồi cộng tổng tiền từ cột của bảng cha, con số sẽ bị nhân lên 3 lần.",
    "formulaOrSyntax": "-- CÁCH ĐÚNG: Tính tổng từ đúng độ mịn của con\nSELECT sum(qty * unit_price) FROM core.order_items;\n-- CÁCH SAI: Kéo cột tổng của cha xuống dòng con rồi SUM\nSELECT sum(o.order_total) FROM order_items i JOIN orders o ...;",
    "pitfall": "Báo cáo doanh thu tăng vọt hàng chục tỷ nhưng pipeline vẫn báo xanh, không có bất kỳ thông báo lỗi nào văng ra. Đổi độ mịn có chủ đích là mô hình hóa; đổi do sơ ý là phá nát số liệu[cite: 14].",
    "sourceLink": { "text": "DuckDB Aggregates", "url": "https://duckdb.org/docs/sql/functions/aggregate" }
  },
  {
    "id": "c_three_valued_null",
    "subject": "SQL Fundamentals",
    "term": "23. Bẫy logic 3 trị & Bỏ lọt rác với NULL",
    "pronounceOrType": "Bản chất hàm điều kiện trong SQL",
    "definition": "Không giống Python chỉ có True/False, SQL có trạng thái thứ 3 là UNKNOWN (Không biết). Bất cứ phép so sánh nào với NULL (kể cả `NULL <> 'a'`) đều trả về UNKNOWN. Khi nằm trong mệnh đề WHERE, UNKNOWN bị gạt đi y hệt như FALSE. Điều này làm lủng mọi bộ lọc chặn rác nếu không viết kỹ.",
    "formulaOrSyntax": "-- Khi cột status mang giá trị NULL, phép thử này trả về UNKNOWN:\nWHERE status NOT IN ('paid', 'cancelled') \n-- Cách viết kín kẽ: Bắt riêng trường hợp NULL\nWHERE status IS NULL OR status NOT IN ('paid', 'cancelled')",
    "pitfall": "Viết bộ lọc lỏng lẻo khiến các dòng rác (mang giá trị NULL) lặng lẽ lọt qua khe và chui thẳng vào kho dữ liệu. Kỹ sư tự tin khoe check báo 0 lỗi, nhưng kho chứa đầy rác[cite: 15].",
    "sourceLink": { "text": "DuckDB — NULL values", "url": "https://duckdb.org/docs/sql/data_types/nulls" }
  },

  /* ─────────── KIỂM DỊCH & XỬ LÝ SỰ CỐ TẠI CỬA VÀO ─────────── */
  {
    "id": "c_split_load_evidence",
    "subject": "Quality Gate",
    "term": "24. Tách luồng kiểm dịch (Split Load) & Bằng chứng số 0",
    "pronounceOrType": "Kiến trúc lưới lọc dữ liệu",
    "definition": "Dữ liệu thực tế luôn có 1-2% là rác. Làm sập cả hệ thống nạp chỉ vì 1% rác là thiết kế tồi. Nguyên tắc: Dòng sạch nạp thẳng vào kho chính (Core), dòng bẩn đẩy ra một thư mục riêng (Quarantine) kèm lý do vì sao nó trượt. Lượng rác này chính là bằng chứng để đi đòi nhà cung cấp sửa lỗi.",
    "formulaOrSyntax": "1. Dòng sạch ➔ Nạp kho: INSERT ... WHERE reject_reason IS NULL;\n2. Dòng bẩn ➔ Cách ly: COPY ... WHERE reject_reason IS NOT NULL;\n3. Kiểm toán ➔ Ghi nhận `rows_failed = 0` vào sổ.",
    "pitfall": "Chỉ ghi log khi có lỗi văng ra. Về sau nhìn lại, bạn không thể phân biệt nổi một quy tắc \"chạy mượt mà ra 0 lỗi\" với một quy tắc \"bị sập hoặc lập trình viên bỏ quên chưa từng chạy\"[cite: 15].",
    "sourceLink": { "text": "Data Contracts Quality Gate", "url": "https://datacontracts.com/" }
  },
  {
    "id": "c_symptom_vs_rootcause",
    "subject": "Reliability & Ops",
    "term": "25. Triệu chứng (Symptom) vs. Căn nguyên (Root Cause)",
    "pronounceOrType": "Đừng tin lời thông báo lỗi của công cụ",
    "definition": "Khi hệ thống sập, thông báo lỗi chỉ cho bạn biết 'chỗ chương trình đầu hàng', chứ không trỏ đúng 'chỗ dữ liệu bị hỏng'. Ví dụ: Công cụ báo 'không dò được dấu phân cách' (Triệu chứng) thực ra là do bộ quét đọc trúng 1 dấu nháy kép không có dấu đóng. Tại sao lại thiếu dấu đóng? Vì hệ thống nguồn xuất file bị ngắt đứt đoạn 150 dòng giữa chừng (Căn nguyên).",
    "formulaOrSyntax": "Lỗi ồn ào văng ra ➔ Đọc thông báo ➔ ĐỪNG sửa code vội ➔ Soi dung lượng file và dòng header vật lý ➔ Chốt nguyên nhân gốc.",
    "pitfall": "Thấy báo lỗi phân cách, lập tức cắm mặt vào sửa code, ép cứng delimiter vào hàm đọc file. Code rườm rà thêm mà file vẫn chết, vì bản chất file đã đứt ruột từ hệ thống nguồn[cite: 7, 8].",
    "sourceLink": { "text": "datacontract CLI Testing", "url": "https://cli.datacontract.com/" }
  },
  {
    "id": "c_data_contract_gap_violation",
    "subject": "Quality Gate",
    "term": "26. Phân định rác: Gap vs. Violation",
    "pronounceOrType": "Luật chơi của Giao ước Dữ liệu (Data Contracts)",
    "definition": "Khi phát hiện dữ liệu bất thường, phải chiếu theo Hợp đồng: \n- Lỗi cấm rõ trong hợp đồng (Ví dụ: Tiền không được âm) ➔ Violation (Vi phạm). Cách ly, đếm số lượng và đem đi chất vấn đối tác.\n- Lỗi hợp đồng quên chưa nhắc tới (Ví dụ: Múi giờ là gì?) ➔ Gap (Khoảng trống). Tự vá trong code của mình, sau đó đề xuất nâng cấp hợp đồng.",
    "formulaOrSyntax": "Có cấm trong Contract không?\n- CÓ ➔ Kiểm tra ngưỡng cho phép ➔ Vượt ngưỡng thì sập lô hàng (Hard-fail).\n- KHÔNG ➔ Ghi nhận là Gap ➔ Đề xuất sửa đổi Hợp đồng (Amendment).",
    "pitfall": "Lôi một cái Gap (thứ chưa từng được cam kết) ra đổ lỗi cho nhà cung cấp. Bạn sẽ cạn kiệt uy tín khi cần giải quyết các sự cố phá vỡ cam kết thực sự[cite: 12].",
    "sourceLink": { "text": "Data Contracts Architecture", "url": "https://datacontracts.com/" }
  },

  /* ─────────── MÔ HÌNH HÓA VÀ THÍCH ỨNG SCHEMA ─────────── */
  {
    "id": "c_canonical_aligner",
    "subject": "Data Modeling",
    "term": "27. Canonical Aligner (Dịch một lần ở cửa vào)",
    "pronounceOrType": "Chiến lược gom lịch sử khi nguồn tự đổi hình dạng",
    "definition": "Nhà cung cấp tự ý đổi cấu trúc file 3 lần trong năm (gọi là 3 eras). Thay vì bắt các bảng báo cáo phía sau phải gồng gánh logic kiểm tra (nếu là thời kỳ 1 thì lấy cột A, nếu thời kỳ 2 thì lấy cột B), hãy dựng một lớp dịch mỏng (Canonical Aligner) ngay tại cửa nạp. Nó nắn mọi phiên bản cũ/mới về chung một khuôn chuẩn duy nhất.",
    "formulaOrSyntax": "File era v1 -+\nFile era v2 -+-> Lớp dịch riêng (thêm cột, đổi tên) -> Khuôn chuẩn duy nhất\nFile era v3 -+",
    "pitfall": "Gom chung logic dịch Schema (thêm/bớt cột) vào cùng một hàm với logic Dọn dẹp giá trị (Cleansing). Bạn sẽ phải chép bộ luật dọn dẹp làm 3 bản cho 3 thời kỳ; quên cập nhật 1 bản là số liệu lệch nhau[cite: 8, 12].",
    "sourceLink": { "text": "SQLMesh Model Kinds", "url": "https://sqlmesh.readthedocs.io/en/stable/concepts/models/model_kinds/" }
  },
  {
    "id": "c_backfill_default",
    "subject": "Data Modeling",
    "term": "28. Luật điền dữ liệu cũ (Known vs. Unknown Default)",
    "pronounceOrType": "Nguyên tắc vá lỗ hổng lịch sử",
    "definition": "Khi dải dữ liệu cũ thiếu một cột mới được thêm vào, bạn điền gì? Luật chốt: Chỗ thiếu mà mình biết chắc sự thật lịch sử thì điền giá trị cứng (Ví dụ: Thời kỳ v1 chưa có chương trình giảm giá, chắc chắn điền `discount = 0`). Chỗ thiếu mà do lịch sử không ai đo đạc (Ví dụ: Không đo kênh bán hàng) thì mới được để NULL.",
    "formulaOrSyntax": "-- Cột giảm giá thời v1 (biết chắc là chưa có):\ndiscount_amount = 0\n-- Cột UTM kênh bán (không ai đo):\nchannel = NULL",
    "pitfall": "Lười biếng điền NULL cho mọi cột thiếu. Khi bảng tính chạy lệnh `doanh_thu = tổng - giảm_giá (NULL)`, toán hạng chứa NULL sẽ làm toàn bộ biểu thức hóa NULL, âm thầm gạt sạch doanh thu của nhiều năm lịch sử[cite: 8, 12].",
    "sourceLink": { "text": "Delta Lake Schema Update", "url": "https://docs.delta.io/latest/delta-batch.html#automatic-schema-update" }
  },
  {
    "id": "c_canonical_vs_natural_key",
    "subject": "Data Modeling",
    "term": "29. Quản trị Khóa: Canonical Key vs. Natural Key",
    "pronounceOrType": "Phòng thủ rủi ro khi nguồn đổi định dạng Khóa",
    "definition": "Khóa của nguồn cấp cho bạn gọi là Natural Key. Vì sao nó nằm ngoài tầm kiểm soát? Vì hôm nay nó là số `123`, ngày mai nhà cung cấp hứng lên thêm chữ thành `'ORD-123'` mà không hỏi bạn. Nếu đem khóa thô này đi nối (JOIN) với dữ liệu cũ, hệ thống sẽ gãy. Thay vì tự đúc Khóa nhân tạo (Surrogate Key bằng Hash) tốn tài nguyên, cách thực chiến nhất là giữ lại bản gốc để làm bằng chứng (Natural Key), đồng thời tự cắt gọt chữ để sinh ra một bản số nguyên sạch sẽ (Canonical Key) dùng riêng cho các bảng nội bộ của team Data.",
    "formulaOrSyntax": "-- Giữ cả 2 định dạng trên cùng một dòng trong kho:\norder_id VARCHAR = 'ORD-0123'     -- Giữ nguyên bản gốc để đối soát với nguồn\norder_id_num BIGINT = 123         -- Kho tự ép về số nguyên để nối bảng nội bộ",
    "pitfall": "Cố chấp JOIN chuỗi `'ORD-123'` với con số `123`. Kết quả không khớp dòng nào. Các bản cập nhật gửi trễ (late-arriving) bị hệ thống tưởng là đơn hàng mới, lặng lẽ nhân đôi doanh thu mà không báo lỗi[cite: 8, 12].",
    "sourceLink": { "text": "Kimball Surrogate Keys", "url": "https://www.kimballgroup.com/1998/05/surrogate-keys/" }
  },
  {
    "id": "c_pii_hash_normalization",
    "subject": "Cleansing",
    "term": "30. Che giấu PII & Bẫy chuẩn hóa Hash",
    "pronounceOrType": "Bảo vệ dữ liệu cá nhân & Năng lực đếm trùng",
    "definition": "Dữ liệu định danh cá nhân (PII như email, SĐT) phải được che giấu. Dùng hàm Băm một chiều (Hash) để che nội dung nhưng vẫn giữ được khả năng đếm số khách hàng trùng lặp (Dedupe). NHƯNG, hàm băm cực kỳ nhạy cảm với hình thức: `John@x.com` và `john@x.com` sinh ra 2 mã hash hoàn toàn khác biệt. Phải chuẩn hóa văn bản trước khi băm.",
    "formulaOrSyntax": "-- CÚ PHÁP ĐÚNG: Chuẩn hóa ngay bên trong hàm hash\nmd5(lower(trim(email))) AS email_hash",
    "pitfall": "Chỉ viết `md5(email)`. Hệ thống vẫn băm ra mã, nhưng các email trùng lặp về bản chất lại không khớp mã với nhau. Pipeline âm thầm đánh mất hoàn toàn khả năng đếm khách hàng trùng lặp mà chính sách đã hứa hẹn[cite: 12].",
    "sourceLink": { "text": "NIST De-identification", "url": "https://csrc.nist.gov/glossary/term/de_identification" }
  },

  /* ─────────── CHIẾN LƯỢC NẠP, XUẤT BẢN & ĐỐI SOÁT ─────────── */
  {
    "id": "c_load_strategy_tradeoffs",
    "subject": "Pipeline Lifecycle",
    "term": "31. Đánh đổi chiến lược nạp: Window Refresh vs. Upsert",
    "pronounceOrType": "Quyết định chuyển chi phí tính toán",
    "definition": "Làm sao nạp các bản cập nhật trạng thái đơn hàng gửi trễ? \n- Upsert (MERGE) cập nhật trực tiếp dòng cũ rất nhanh, nhưng file Parquet trên Lake là bất biến (immutable), không hỗ trợ sửa dòng.\n- Window Refresh: Xóa nguyên cụm dữ liệu 7 ngày rồi ghi mới lại từ đầu. Chấp nhận tốn công ghi đè lặp đi lặp lại 5 lần dữ liệu, để đổi lấy việc bảng trên đĩa luôn sạch, tốc độ truy vấn nhanh nhất và không bắt phía dashboard gánh tải lọc trùng lặp.",
    "formulaOrSyntax": "-- Cấu hình trong các công cụ thực tế (dbt / SQLMesh):\nincremental_strategy = 'delete+insert' (Window Refresh)\nincremental_strategy = 'merge' (Upsert)",
    "pitfall": "Đặt cửa sổ nạp hẹp đúng 1 ngày `[D, D]` cho nhanh. Các bản sửa đổi của đơn hàng gửi trễ rơi vào phân vùng `D-3` sẽ bị bỏ lọt vĩnh viễn. Đơn hàng kẹt luôn ở trạng thái cũ rích[cite: 10].",
    "sourceLink": { "text": "SQLMesh Model Kinds", "url": "https://sqlmesh.readthedocs.io/en/stable/concepts/models/model_kinds/" }
  },
  {
    "id": "c_bitemporality_late_arriving",
    "subject": "Data Modeling",
    "term": "32. Bi-temporality & Cái bẫy của Upsert",
    "pronounceOrType": "Xung đột Thời gian sự kiện vs Thời gian nhận file",
    "definition": "Hệ thống luôn có hai mốc thời gian: Lúc sự kiện thực sự xảy ra (Event Time, vd `updated_at`) và lúc hệ thống nhận được file (Ingestion Time). Một bản sửa đổi gửi muộn hoàn toàn có thể mang nội dung cũ hơn chính bản đang có trong kho. Quyền quyết định phiên bản nào thắng phải thuộc về `updated_at`, tuyệt đối không theo thứ tự file về.",
    "formulaOrSyntax": "-- Cú pháp chặn bản cũ đè bản mới trong MERGE:\nWHEN MATCHED AND nguồn.updated_at > đích.updated_at THEN UPDATE",
    "pitfall": "Bỏ quên điều kiện `nguồn > đích`. Lệnh nạp vẫn chạy mượt mà exit 0, số đếm (count) cuối ngày khớp tuyệt đối, nhưng hàng chục nghìn đơn hàng bị ghi đè ngược lùi về trạng thái cũ (Silent Failure)[cite: 10].",
    "sourceLink": { "text": "Martin Fowler Bitemporal", "url": "https://martinfowler.com/articles/bitemporal-history.html" }
  },
  {
    "id": "c_reconciliation_content_diff",
    "subject": "Quality Gate",
    "term": "33. Đếm dòng không phải là Đối soát (Reconciliation)",
    "pronounceOrType": "Phép kiểm tra ngoại trừ hai chiều",
    "definition": "Đếm `count(*)` chỉ trả lời câu 'Có đủ số lượng không?', nó câm điếc trước câu 'Nội dung bên trong có đúng không?'. Lệch cửa sổ nạp làm 5000 đơn hàng kẹt ở phiên bản cũ, nhưng tổng số đếm vẫn bằng y hệt. Muốn đối soát chuẩn, phải kiểm tra trừ chéo nội dung (EXCEPT) theo cả hai chiều.",
    "formulaOrSyntax": "-- Đối soát nội dung tuyệt đối:\nSELECT * FROM a EXCEPT SELECT * FROM b;  -- Chiều 1: B thiếu gì của A?\nSELECT * FROM b EXCEPT SELECT * FROM a;  -- Chiều 2: B thừa gì so với A?",
    "pitfall": "Dừng lại và ăn mừng khi thấy count hai bên khớp nhau. Thực tế sai lệch cấu trúc ngầm bên trong (1% dữ liệu mang giá trị sai) vẫn chui thẳng ra báo cáo sản xuất[cite: 10].",
    "sourceLink": { "text": "dbt-audit-helper", "url": "https://github.com/dbt-labs/dbt-audit-helper" }
  },
  {
    "id": "c_torn_read",
    "subject": "Reliability & Ops",
    "term": "34. Torn Read (Đọc trúng lúc đang ghi dở)",
    "pronounceOrType": "Sự cố văng dashboard khi lưu trữ trên File",
    "definition": "Ghi đè file Parquet không có cơ chế bảo vệ giao dịch (Transaction) như trong cơ sở dữ liệu. Bước 1 xóa file cũ, Bước 2 ghi file mới. Quá trình ghi này tốn vài giây đến vài phút. Nếu người dùng mở dashboard truy vấn đúng vào khoảng trống thời gian đó, họ sẽ đọc trúng phần dữ liệu dở dang (Torn Read), nhận về số 0 tròn trĩnh hoặc bị văng lỗi.",
    "formulaOrSyntax": "DELETE FROM <thư_mục_partition>;        \n-- KHOẢNG TRỐNG NGUY HIỂM (Dashboard hiển thị số 0)\nCOPY (...) TO '<thư_mục_partition>';",
    "pitfall": "Tự mãn vì job nạp dữ liệu chạy xong không lỗi lầm. Job xanh mượt nhưng người dùng hứng chịu khoảng thời gian sập dữ liệu thì đó vẫn là một hệ thống thiết kế lỗi[cite: 11].",
    "sourceLink": { "text": "Delta Lake Atomicity", "url": "https://github.com/delta-io/delta/blob/master/PROTOCOL.md" }
  },
  {
    "id": "c_atomic_swap",
    "subject": "Reliability & Ops",
    "term": "35. Atomic Swap (Hoán đổi thư mục tức thì)",
    "pronounceOrType": "Tuyệt chiêu xuất bản dữ liệu không gây gián đoạn",
    "definition": "Luật chốt: Đừng bao giờ sửa trực tiếp thứ người đọc đang nhìn. Hãy dựng bản dữ liệu mới ở một thư mục tạm (khuất tầm nhìn), sau đó dùng lệnh đổi tên (rename) của hệ điều hành để tráo vào. Lệnh rename chỉ sửa mục lục (metadata) nên không phải di chuyển byte nào, tốn đúng vài phần nghìn giây.",
    "formulaOrSyntax": "1. Dựng bản mới ➔ lake/.staging/part=1\n2. Cất bản cũ ➔ lake/.trash/part=1\n3. Tráo bản mới ➔ lake/orders/part=1",
    "pitfall": "Thư mục tạm `.staging/` được đặt ngay bên trong thư mục đang phục vụ `orders/`. Trình đọc quét file quét theo mẫu `orders/*/*.parquet` sẽ vơ luôn cả file tạm vào, nhân đôi doanh thu trong im lặng[cite: 11].",
    "sourceLink": { "text": "Iceberg Snapshots", "url": "https://iceberg.apache.org/spec/#snapshots" }
  },

  /* ─────────── TỰ ĐỘNG HÓA VÀ VẬN HÀNH BỀN BỈ ─────────── */
  {
    "id": "c_lakehouse_table_formats",
    "subject": "Storage & Pruning",
    "term": "36. Từ Swap Thư mục tới Lakehouse Format",
    "pronounceOrType": "Mở rộng liên kết công nghệ thực tế",
    "definition": "Cách Swap thư mục vật lý giải quyết được Torn Read nhưng vẫn còn một kẽ hở 4 mili giây giữa 2 lệnh rename, và tốn dung lượng ổ cứng để lưu bản nháp. Sự cồng kềnh này chính là lý do các định dạng bảng hiện đại (Apache Iceberg, Delta Lake) ra đời. Chúng không tráo đổi thư mục vật lý, mà dùng một file con trỏ (metadata pointer) để chỉ định chính xác danh sách file nào đang thuộc phiên bản hiện hành.",
    "formulaOrSyntax": "-- Triết lý của Iceberg/Delta:\nThay vì chép/rename thư mục, hệ thống tạo file `metadata.json`. Việc công bố dữ liệu mới chỉ là thao tác tráo đổi file con trỏ này thành phiên bản mới nhất.",
    "pitfall": "Chạy lệnh Swap thư mục giữa 2 ổ đĩa cứng khác nhau. Hệ điều hành sẽ âm thầm biến lệnh rename nhanh gọn thành lệnh Copy + Delete cồng kềnh, kéo dài khoảng hở từ vài mili giây lên hàng chục phút[cite: 11].",
    "sourceLink": { "text": "Apache Iceberg Specs", "url": "https://iceberg.apache.org/spec/#snapshots" }
  },
  {
    "id": "c_idempotency_checksum",
    "subject": "Reliability & Ops",
    "term": "37. Chạy lại an toàn (Idempotency) & Order-independent Checksum",
    "pronounceOrType": "Trạng thái bất biến khi phục hồi hệ thống",
    "definition": "Hệ thống sập, muốn chạy lại tự động thì pipeline phải có khả năng bảo toàn trạng thái (chạy 1 lần hay 10 lần kết quả cuối cùng không đổi). Đạt được nhờ việc bọc lệnh Xóa và Ghi vào chung 1 Giao dịch (Transaction). Để chứng minh, dùng hàm `bit_xor` sinh checksum: nó gom các mã băm lại mà không bị phụ thuộc vào việc engine đọc dòng nào trước dòng nào sau.",
    "formulaOrSyntax": "BEGIN;\n  DELETE FROM tbl WHERE data_date = D;\n  INSERT INTO tbl ...;\nCOMMIT;\n-- Đo checksum độc lập thứ tự:\nbit_xor(hash(order_id, updated_at, status, order_total))",
    "pitfall": "Dùng lệnh `INSERT` trần thả rông. Khi hệ thống đứt gánh giữa đường, scheduler chạy lại sẽ vô tư nhét thêm dữ liệu, làm nhân đôi toàn bộ doanh thu của ngày hôm đó[cite: 9].",
    "sourceLink": { "text": "DuckDB Transactions", "url": "https://duckdb.org/docs/stable/sql/statements/transactions" }
  },
  {
    "id": "c_orchestration_fault_isolation",
    "subject": "Reliability & Ops",
    "term": "38. Orchestration & Ranh giới cô lập lỗi (Fault Isolation)",
    "pronounceOrType": "Tư duy điều phối DAG: Lỗi mẻ nào khoanh vùng mẻ đó",
    "definition": "Khi chạy tự động nạp lại lịch sử 69 ngày, nếu ngày 22 gặp file hỏng, hệ thống phải biết đánh dấu 'failed' vào sổ trạng thái rồi tiếp tục đi nạp ngày 23. Đây là ranh giới cô lập lỗi, cũng là sự khác biệt cốt lõi giữa việc viết một vòng lặp FOR ngây thơ và dùng một hệ điều phối (Orchestrator như Airflow/Dagster). Đi kèm là luật Retry: Lỗi mạng chập chờn thì thử lại giãn cách; lỗi sai schema thì chết ngay lập tức.",
    "formulaOrSyntax": "-- Cốt lõi của Orchestrator:\n1. Dependency (Chờ bước A xong mới làm bước B)\n2. Fault Isolation (Ngày 22 hỏng không làm sập ngày 23)\n3. Retry Backoff (Lỗi mạng thì thử lại, lỗi dữ liệu thì sập luôn)",
    "pitfall": "Bọc `except Exception` rồi nhắm mắt retry mọi thứ. Việc thử lại một file hỏng schema 10 lần chỉ làm tắc nghẽn server, làm mệt hệ thống và chôn vùi mất dòng thông báo lỗi thật sự[cite: 7, 9].",
    "sourceLink": { "text": "Airflow Core Concepts", "url": "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/index.html" }
  },
  {
    "id": "c_validate_validator",
    "subject": "Reliability & Ops",
    "term": "39. Validate cái Validator (Quản trị file cấu hình)",
    "pronounceOrType": "Bảo vệ các bộ luật chặn rác",
    "definition": "Kỹ sư thường viết luật kiểm tra dữ liệu rất khắt khe, nhưng lại vô cùng dễ dãi với chính file cấu hình YAML chứa các luật đó. Dùng thư viện đọc YAML bình thường trả về một kiểu dữ liệu trần (Dict). Gõ sai chính tả một key cấu hình, không ai báo lỗi cả. Phải dùng các model kiểm tra cấu trúc (như Pydantic) với cờ `extra=\"forbid\"` để bắt lỗi chính tả ngay lúc đọc file.",
    "formulaOrSyntax": "class ContractConfig(BaseModel):\n    model_config = ConfigDict(extra=\"forbid\")\n# Chặn đứng việc kỹ sư gõ sai 'nullible' thay vì 'nullable'",
    "pitfall": "Dùng `yaml.safe_load` mù quáng. Có người gõ nhầm chữ `nullable` thành `nullible`, YAML nuốt trọn vẹn. Kết quả là một luật chặn rác quan trọng bị tắt ngấm trong im lặng, dữ liệu bẩn cứ thế ùa vào kho[cite: 12].",
    "sourceLink": { "text": "Pydantic Extra Forbid", "url": "https://docs.pydantic.dev/latest/api/config/" }
  }
]