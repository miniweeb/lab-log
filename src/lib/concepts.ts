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
  {
    "id": "c_fanout_trap",
    "subject": "Complex Types",
    "term": "21. Fan-Out Join Trap",
    "pronounceOrType": "Cạm bẫy nhân trùng doanh thu",
    "definition": "Khi bảng con có N dòng cho 1 đơn hàng, tuyệt đối không JOIN ngược về bảng cha rồi SUM(order_total) vì doanh thu sẽ bị nhân lên N lần.",
    "formulaOrSyntax": "-- ĐÚNG: Tính tổng từ bảng con\nSELECT round(sum(qty * unit_price), 2) AS total_sales FROM core.order_items;\n\n-- SAI (Fan-out nhân doanh thu N lần):\nSELECT sum(o.order_total) FROM core.order_items i JOIN staging.orders o USING(order_id);",
    "pitfall": "Báo cáo sai lệch doanh thu hàng chục tỷ cho ban giám đốc do lỗi nhân trùng từ phép JOIN làm mịn dữ liệu.",
    "sourceLink": {
      "text": "DuckDB Aggregates",
      "url": "https://duckdb.org/docs/sql/functions/aggregate"
    }
  },
  {
    "id": "c_json_null_tristate",
    "subject": "Complex Types",
    "term": "22. JSON Empty Tri-State",
    "pronounceOrType": "Ba sắc thái rỗng trong JSON",
    "definition": "JSON có 3 kiểu rỗng: key mang null literal, key vắng mặt, và chuỗi sentinel 'none'. Phải kết hợp ->> với NULLIF để gấp về 1 giá trị SQL NULL duy nhất.",
    "formulaOrSyntax": "NULLIF(CAST(meta AS JSON)->>'utm', 'none') AS clean_utm",
    "pitfall": "Dùng -> trả về JSON string (chứa cả ngoặc kép hoặc chữ 'null'), phải dùng ->> mới trả về SQL VARCHAR/NULL thực sự.",
    "sourceLink": {
      "text": "DuckDB JSON Types",
      "url": "https://duckdb.org/docs/sql/data_types/json"
    }
  },
  {
    "id": "c_lifecycle_sequence",
    "subject": "Quality Gate",
    "term": "23. Quality Gate 6-Step Sequence",
    "pronounceOrType": "Quy trình thực thi bất biến",
    "definition": "Thứ tự bắt buộc trong 1 batch nạp: Khởi tạo Staging -> Gắn cờ lỗi (Flagging) -> Báo cáo kiểm định (Log report) -> Xuất cách ly (Quarantine) -> Đánh giá Gate -> Nạp Core.",
    "formulaOrSyntax": "1. Stage   ➔ Nạp CSV thô sang typed staging\n2. Flag    ➔ LEFT JOIN kiểm tra luật, gắn reject_reason\n3. Report  ➔ Ghi nhận 16 checks vào ops.dq_report\n4. Quaran. ➔ Xuất dữ liệu lỗi ra Parquet partition\n5. Gate    ➔ So sánh % lỗi với Contract Tolerance (Hard Fail nếu vượt)\n6. Load    ➔ Nạp dữ liệu sạch vào core.orders",
    "pitfall": "Đặt Gate sau bước nạp Core (load_good): dữ liệu lỗi đã lọt vào kho nghiệp vụ trước khi phát hiện vi phạm.",
    "sourceLink": {
      "text": "Data Contracts Quality Gate",
      "url": "https://datacontracts.com/"
    }
  },
  {
    "id": "c_split_load",
    "subject": "Quality Gate",
    "term": "24. Split Load & Quarantine Pattern",
    "pronounceOrType": "Cơ chế tách luồng kiểm dịch",
    "definition": "Tách dòng sạch nạp vào Core, đẩy dòng bẩn ra vùng kiểm dịch (Quarantine Parquet) lưu đầy đủ lý do, thời điểm và 2 cột lineage để kiểm toán hoặc nạp bù.",
    "formulaOrSyntax": "-- 1. Quarantine (Ghi nhận bằng chứng lỗi):\nCOPY (SELECT *, now() AT TIME ZONE 'UTC' AS _rejected_at FROM flagged WHERE reject_reason IS NOT NULL)\nTO 'quarantine/orders' (FORMAT PARQUET, PARTITION_BY(order_date), FILENAME_PATTERN 'from_{DAY}_{i}');\n\n-- 2. Core (Nạp dòng sạch khi Gate PASS):\nINSERT INTO core.orders SELECT * EXCLUDE(reject_reason) FROM flagged WHERE reject_reason IS NULL;",
    "pitfall": "Xóa bỏ âm thầm các bản ghi lỗi: làm mất bằng chứng đối soát với nhà cung cấp và mất khả năng replay dữ liệu sau khi sửa lỗi.",
    "sourceLink": {
      "text": "DuckDB Parquet Copy",
      "url": "https://duckdb.org/docs/sql/statements/copy"
    }
  },
  {
    "id": "c_zero_counts",
    "subject": "Quality Gate",
    "term": "25. Zero-Fail Value in Audit Logging",
    "pronounceOrType": "Giá trị kiểm toán của số 0",
    "definition": "Ghi nhận đầy đủ mọi check vào ops.dq_report kể cả khi số dòng lỗi bằng 0. Số 0 là bằng chứng chứng minh check ĐÃ CHẠY và dữ liệu ĐẠT chuẩn.",
    "formulaOrSyntax": "SELECT current_timestamp, DATE '{DAY}', 'row', check_name, rows_checked,\n       coalesce(rows_failed, 0) AS rows_failed, ...\nFROM all_checks LEFT JOIN observed USING(check_name);",
    "pitfall": "Chỉ ghi log các check bị lỗi: không thể phân biệt giữa 'check đạt 0 lỗi' với 'check bị quên chưa chạy'.",
    "sourceLink": {
      "text": "DuckDB INSERT Statement",
      "url": "https://duckdb.org/docs/sql/statements/insert"
    }
  },
  {
    "id": "c_data_observability_5",
    "subject": "Quality Gate",
    "term": "26. 5 Pillars of Data Observability",
    "pronounceOrType": "Năm trụ cột quan sát chất lượng dữ liệu",
    "definition": "Khung tiêu chuẩn giám sát toàn diện: 1. Freshness (Độ tươi), 2. Quality (Chất lượng nội dung), 3. Volume (Khối lượng số dòng), 4. Schema (Hình dạng lược đồ), 5. Lineage (Nguồn gốc truy vết).",
    "formulaOrSyntax": "1. Freshness ➔ max(_data_date) có trễ SLA không?\n2. Quality   ➔ Tỷ lệ rác có vượt Tolerance Contract?\n3. Volume    ➔ Count staged có khớp Manifest producer khai?\n4. Schema    ➔ Cột bẩn có phá vỡ Explicit Schema?\n5. Lineage   ➔ _data_date, _run_id có truy vết được run nào không?",
    "pitfall": "Chỉ theo dõi pipeline chạy thành công (exit 0) mà bỏ qua 5 trụ cột: job xanh nhưng thực tế nạp 0 dòng hoặc nạp dữ liệu cũ 3 ngày trước.",
    "sourceLink": {
      "text": "DuckDB Documentation",
      "url": "https://duckdb.org/docs/"
    }
  },
  {
    "id": "c_null_three_valued",
    "subject": "SQL Fundamentals",
    "term": "27. Three-Valued Logic (NULL semantics)",
    "pronounceOrType": "Logic ba trị: TRUE / FALSE / UNKNOWN",
    "definition": "SQL không dùng logic hai trị như Python. Mọi phép so sánh với NULL trả về UNKNOWN, và WHERE chỉ giữ dòng khi điều kiện là TRUE — UNKNOWN bị loại y hệt FALSE. Đây là nguồn gốc của phần lớn lỗi đếm sai trong data engineering, và nó đúng ở mọi engine SQL.",
    "formulaOrSyntax": "NULL = NULL              ➔ UNKNOWN  (không phải TRUE!)\nNULL <> 'a'              ➔ UNKNOWN  (không phải TRUE!)\nstatus NOT IN ('a','b')  ➔ UNKNOWN khi status IS NULL\n\n-- Cách đúng:\nWHERE status IS NULL OR status NOT IN ('a','b')\nWHERE col IS DISTINCT FROM other    -- so sánh coi NULL = NULL\n\n-- count() cũng phân biệt:\ncount(*)    ➔ đếm mọi dòng\ncount(col)  ➔ BỎ QUA dòng có col IS NULL",
    "pitfall": "Viết WHERE status NOT IN (...) để bắt giá trị rác: dòng có status NULL trả về UNKNOWN nên LỌT QUA bộ lọc. Rác đi thẳng vào core trong khi check báo 0 lỗi.",
    "sourceLink": {
      "text": "DuckDB — NULL values",
      "url": "https://duckdb.org/docs/sql/data_types/nulls"
    }
  },
  {
    "id": "c_window_vs_groupby",
    "subject": "SQL Fundamentals",
    "term": "28. Window Function vs GROUP BY",
    "pronounceOrType": "Gom nhóm mà KHÔNG làm sụp dòng",
    "definition": "GROUP BY gộp N dòng thành 1. Window function tính trên nhóm nhưng GIỮ NGUYÊN N dòng, thêm kết quả thành một cột. Đây là công cụ cho: chọn bản mới nhất mỗi khoá, xếp hạng, running total, và so một dòng với trung bình nhóm của chính nó.",
    "formulaOrSyntax": "-- Chọn bản mới nhất mỗi khoá (latest-wins dedupe):\nSELECT * EXCLUDE (rn) FROM (\n  SELECT *, row_number() OVER (\n    PARTITION BY order_id ORDER BY updated_at DESC) AS rn\n  FROM staging.orders\n) WHERE rn = 1;\n\n-- So một dòng với trung bình nhóm của nó (GROUP BY không làm được):\nSELECT store_id, order_total,\n       avg(order_total) OVER (PARTITION BY store_id) AS store_avg\nFROM orders;\n\n-- Running total theo thời gian:\nsum(total) OVER (ORDER BY order_ts ROWS UNBOUNDED PRECEDING)\n\n-- Khi có giá trị bằng nhau, ba hàm cho ba kết quả khác nhau:\nrow_number ➔ 1,2,3,4    rank ➔ 1,2,2,4    dense_rank ➔ 1,2,2,3",
    "pitfall": "Dùng GROUP BY + max(updated_at) để dedupe: bạn lấy được thời điểm mới nhất, nhưng các cột KHÁC lại lấy từ dòng bất kỳ trong nhóm — dữ liệu bị trộn giữa hai phiên bản.",
    "sourceLink": {
      "text": "DuckDB — Window functions",
      "url": "https://duckdb.org/docs/sql/functions/window_functions"
    }
  },
  {
    "id": "c_grain_declaration",
    "subject": "Data Modeling",
    "term": "29. Grain Declaration & Uniqueness Proof",
    "pronounceOrType": "Quyết định thiết kế ĐẦU TIÊN của mỗi bảng",
    "definition": "Grain là câu trả lời cho \"MỘT DÒNG của bảng này là cái gì\", viết trong đúng một câu, trước cả việc chọn cột. Và grain không phải lời hứa suông: nó phải chứng minh được bằng một truy vấn kiểm tra tính duy nhất của khoá.",
    "formulaOrSyntax": "-- Ghi grain thành comment ngay trên DDL:\n-- grain: one row = one order (latest version in this file)\nCREATE TABLE staging.orders AS ...\n\n-- grain: one row = one store per order_date\nCREATE TABLE core.daily_store_sales AS ...\n\n-- CHỨNG MINH grain: khoá phải duy nhất, kết quả PHẢI rỗng\nSELECT order_date, store_id, count(*)\nFROM core.daily_store_sales\nGROUP BY 1, 2 HAVING count(*) > 1;",
    "pitfall": "Hai bảng tên gần giống nhưng khác grain (orders_raw = một PHIÊN BẢN đơn hàng; orders = một ĐƠN HÀNG). Nối chúng rồi cộng tiền là đếm trùng doanh thu mà không lỗi nào báo.",
    "sourceLink": {
      "text": "Kimball Group — Dimensional modeling techniques",
      "url": "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/"
    }
  },
  {
    "id": "c_scd_type2",
    "subject": "Data Modeling",
    "term": "30. Slowly Changing Dimension (Type 1 vs Type 2)",
    "pronounceOrType": "Attribute thay đổi theo thời gian",
    "definition": "Khách hàng chuyển từ VN sang US. Báo cáo doanh thu năm ngoái nên tính họ là VN hay US? Type 1 ghi đè (mất lịch sử, đơn giản). Type 2 thêm dòng mới kèm khoảng hiệu lực (giữ lịch sử, join phức tạp hơn). Đây là câu hỏi bạn sẽ gặp ở mọi dự án có dimension.",
    "formulaOrSyntax": "-- Type 1: ghi đè, chỉ biết hiện tại\nUPDATE dim_customer SET country = 'US' WHERE customer_id = 42;\n\n-- Type 2: thêm dòng, giữ lịch sử\ncustomer_sk | customer_id | country | valid_from | valid_to   | is_current\n        101 |          42 | VN      | 2020-01-01 | 2026-03-15 | false\n        102 |          42 | US      | 2026-03-15 | 9999-12-31 | true\n\n-- Join theo THỜI ĐIỂM SỰ KIỆN, không phải theo hiện tại:\nJOIN dim_customer d ON f.customer_id = d.customer_id\n  AND f.order_ts >= d.valid_from\n  AND f.order_ts <  d.valid_to",
    "pitfall": "Dùng Type 1 rồi ngạc nhiên vì báo cáo cũ tự đổi số mỗi lần chạy lại. Nếu nghiệp vụ cần \"doanh thu theo quốc gia TẠI THỜI ĐIỂM đặt hàng\" thì bắt buộc Type 2 — và không sửa ngược được sau khi đã mất lịch sử.",
    "sourceLink": {
      "text": "Kimball Group — Slowly changing dimensions",
      "url": "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/"
    }
  },
  {
    "id": "c_surrogate_key",
    "subject": "Data Modeling",
    "term": "31. Natural Key vs Surrogate Key",
    "pronounceOrType": "Ai là người cấp khoá",
    "definition": "Natural key do nguồn cấp (order_id từ hệ thống upstream) — miễn phí và có ý nghĩa, nhưng nằm NGOÀI tầm kiểm soát của bạn. Surrogate key do warehouse tự sinh — vô nghĩa với người dùng nhưng bạn làm chủ hoàn toàn. Với SCD Type 2, surrogate key trở thành bắt buộc.",
    "formulaOrSyntax": "-- Natural key: nguồn cấp, có thể đổi format bất cứ lúc nào\norder_id BIGINT      -- upstream đổi sang 'ORD-000123' ➔ warehouse vỡ\n\n-- Surrogate key: warehouse tự sinh\nCREATE SEQUENCE seq_customer_sk;\ncustomer_sk BIGINT DEFAULT nextval('seq_customer_sk')\n\n-- Hash key: tất định, sinh lại được, không cần sequence\nmd5(source_system || '|' || CAST(natural_key AS VARCHAR)) AS row_key",
    "pitfall": "Với SCD Type 2, natural key KHÔNG còn duy nhất — một customer_id có nhiều dòng lịch sử. Join bằng natural key sẽ fan-out và nhân doanh thu lên theo số lần khách hàng đó đổi thông tin.",
    "sourceLink": {
      "text": "Kimball Group — Dimensional modeling techniques",
      "url": "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/"
    }
  },
  {
    "id": "c_atomic_swap",
    "subject": "Reliability & Ops",
    "term": "32. Atomic Swap (Build ➔ Rename)",
    "pronounceOrType": "Không để ai đọc thấy trạng thái nửa vời",
    "definition": "Trong lúc bạn dựng lại một bảng, người dùng vẫn đang query nó. TRUNCATE rồi INSERT tạo ra cửa sổ vài phút mà bảng rỗng hoặc thiếu dữ liệu. Cách đúng: dựng bảng mới HOÀN CHỈNH ở tên tạm, rồi đổi tên — thao tác đổi tên là nguyên tử.",
    "formulaOrSyntax": "-- SAI: có cửa sổ bảng rỗng\nTRUNCATE core.orders;\nINSERT INTO core.orders SELECT ...;   -- 3 phút bảng thiếu dữ liệu\n\n-- ĐÚNG: build ➔ swap\nCREATE OR REPLACE TABLE core.orders_new AS SELECT ...;\nBEGIN;\n  DROP TABLE IF EXISTS core.orders_old;\n  ALTER TABLE core.orders     RENAME TO orders_old;\n  ALTER TABLE core.orders_new RENAME TO orders;\nCOMMIT;\n-- orders_old giữ lại làm bản rollback tức thì",
    "pitfall": "Chỉ nghĩ tới bảng đích mà quên các thứ phụ thuộc: view, index, hoặc mart đang đọc từ nó. Swap xong phải kiểm tra chúng còn trỏ đúng chỗ.",
    "sourceLink": {
      "text": "DuckDB — ALTER TABLE",
      "url": "https://duckdb.org/docs/sql/statements/alter_table"
    }
  },
  {
    "id": "c_orchestration",
    "subject": "Reliability & Ops",
    "term": "33. Orchestration & DAG",
    "pronounceOrType": "Ai chạy job, theo thứ tự nào, khi nào",
    "definition": "Pipeline thật gồm nhiều bước phụ thuộc nhau. DAG (đồ thị có hướng không chu trình) mô tả thứ tự đó. Orchestrator lo bốn việc mà một script tự viết không có: lịch chạy, thử lại khi lỗi, chạy song song nhánh độc lập, và báo động khi hỏng.",
    "formulaOrSyntax": "extract ➔ contract_gate ➔ stage ➔ validate ➔ load_core ➔ build_marts\n                                        ↘ quarantine\n\n# Bốn thứ orchestrator lo hộ:\n#  1. schedule    — 02:00 UTC mỗi ngày\n#  2. retry       — lỗi mạng thử lại 3 lần, cách 5 phút\n#  3. dependency  — build_marts chỉ chạy khi load_core xong\n#  4. alerting    — job fail ➔ báo động ngay, không đợi ai phát hiện\n\n# Công cụ phổ biến: Airflow, Dagster, Prefect",
    "pitfall": "Dùng cron thay orchestrator: cron không biết bước trước đã xong chưa, không thử lại, không báo động, và không trả lời được câu \"job hôm qua có chạy không\".",
    "sourceLink": {
      "text": "Airflow — Core concepts",
      "url": "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/index.html"
    }
  },
  {
    "id": "c_benchmark_hygiene",
    "subject": "SQL & Engine",
    "term": "34. Benchmark Hygiene (Cold vs Warm)",
    "pronounceOrType": "Luật đo hiệu năng",
    "definition": "Lần đọc file đầu tiên trả giá đĩa; lần thứ hai lấy từ OS page cache và nhanh hơn nhiều dù code không đổi một dòng. So một lần chạy nguội với một lần chạy ấm cho ra kết luận không chỉ thiếu chính xác mà còn NGƯỢC HẲN.",
    "formulaOrSyntax": "def timed(sql, runs=3):\n    times = []\n    for _ in range(runs):\n        t0 = time.perf_counter()\n        con.execute(sql).fetchall()\n        times.append(time.perf_counter() - t0)\n    return statistics.median(times)   # bỏ lần đầu, lấy trung vị\n\n-- Đọc kế hoạch thực thi thay vì đoán:\nEXPLAIN         SELECT ...;   -- engine ĐỊNH làm gì\nEXPLAIN ANALYZE SELECT ...;   -- engine ĐÃ làm gì, kèm thời gian từng bước",
    "pitfall": "Tối ưu theo cảm giác: sửa query rồi thấy nhanh hơn nên kết luận là sửa đúng, trong khi thật ra chỉ là lần chạy thứ hai. Luôn chạy nhiều lần, lấy trung vị, và đọc EXPLAIN.",
    "sourceLink": {
      "text": "DuckDB — EXPLAIN ANALYZE",
      "url": "https://duckdb.org/docs/guides/meta/explain_analyze"
    }
  },
  {
    "id": "c_violation_gap_tolerated",
    "subject": "Quality Gate",
    "term": "35. Violation / Gap / Tolerated",
    "pronounceOrType": "Ba loại rác — phân theo trách nhiệm",
    "definition": "Khi phát hiện dữ liệu bẩn, câu hỏi đầu tiên không phải 'sửa thế nào' mà 'contract có cấm chuyện này không'. Violation: contract cấm rõ, đổ lỗi được cho producer. Gap: contract im lặng, không đổ lỗi được cho ai vì họ chưa từng hứa. Tolerated: contract cho phép rõ ở mức tỉ lệ đó, không phải lỗi.",
    "formulaOrSyntax": "Có clause cấm?  ─ không ─➔ GAP        (tự xử lý + đề xuất amendment)\n      │ có\n      ▼\nCó tolerance?   ─ không ─➔ VIOLATION zero-budget (báo incident)\n      │ có\n      ▼\nrate <= tolerance ─➔ trong ngưỡng (vẫn đếm, báo cáo theo SLO)\nrate >  tolerance ─➔ hard-fail, chặn cả lô",
    "pitfall": "Xếp mọi bất ngờ vào violation. Đổ lỗi cho producer về một lời hứa chưa từng có sẽ đốt uy tín cần dùng cho sự cố thật. Ngược lại, dòng nằm trong tolerance vẫn là vi phạm phải đếm — tolerance là ngưỡng hard-fail, không phải giấy phép. Loại thứ ba dễ bỏ sót: check của chính consumer NGHIÊM HƠN contract (gate chặn cột thừa trong khi contract ghi rõ consumer phải chịu được cột lạ). Đó là quyết định thiết kế đơn phương, không phải điều khoản — phải biết mình đang đứng ở đâu trước khi gọi cho producer.",
    "sourceLink": {
      "text": "Data Contracts Architecture",
      "url": "https://datacontracts.com/"
    }
  },
  {
    "id": "c_semver_data_contract",
    "subject": "Pipeline Lifecycle",
    "term": "36. Semantic Versioning (semver) & Change Management",
    "pronounceOrType": "MAJOR.MINOR.PATCH — hợp đồng về THỜI GIAN, không phải nhãn",
    "definition": "Chuẩn semver 2.0.0: version là bộ ba số MAJOR.MINOR.PATCH, mỗi số có luật tăng riêng và KHÔNG BAO GIỜ giảm. Áp cho data contract thì mỗi mức bump còn gắn thêm một thời hạn báo trước — version không chỉ nói 'đã đổi gì' mà nói 'bên kia có bao lâu để chuẩn bị'. Tiêu chí phân biệt breaking không phải 'consumer có phải sửa code không' (thêm cột cũng bắt sửa) mà là 'có thứ gì ĐANG CHẠY bị phá không'.",
    "formulaOrSyntax": "MAJOR ➔ thay đổi PHÁ tương thích ngược. Bump MAJOR thì MINOR và PATCH về 0.\nMINOR ➔ thêm chức năng, vẫn tương thích ngược. Bump MINOR thì PATCH về 0.\nPATCH ➔ sửa lỗi / làm rõ câu chữ, không đổi hành vi.\n1.9.3 ➔ 1.10.0 (KHÔNG phải 2.0.0) — mỗi số tăng độc lập, không nhớ thập phân\n\n0.y.z  ➔ giai đoạn phát triển ban đầu: KHÔNG có cam kết ổn định nào, mọi thứ đổi bất cứ lúc nào\n1.0.0  ➔ mốc công khai API/contract. Từ đây luật trên mới có hiệu lực\n1.0.0-rc.1     ➔ pre-release, XẾP TRƯỚC 1.0.0\n1.0.0+build.5  ➔ build metadata, BỎ QUA khi so thứ tự\n\n-- Áp cho data contract:\nMAJOR ➔ đổi tên / xoá cột / đổi kiểu / đổi ngữ nghĩa  ─ báo trước 30 ngày\nMINOR ➔ thêm cột, thêm ràng buộc, mở rộng enum        ─ báo trước 7-14 ngày\nPATCH ➔ sửa comment, làm rõ mô tả                     ─ không cần báo\nstatus: draft ➔ proposed ➔ agreed ➔ deprecated\n-- consumer chỉ được DỰA VÀO một clause khi status = agreed",
    "pitfall": "Bốn lỗi hay gặp. (1) Coi version là số thập phân: sau 1.9 là 1.10 chứ không phải 2.0. (2) Ở lại 0.y.z mãi mãi rồi vẫn để người khác phụ thuộc — 0.x nghĩa là KHÔNG hứa gì cả. (3) Bump MAJOR mà quên reset MINOR/PATCH về 0. (4) Riêng với data: thêm giá trị vào allowed_values rồi coi là vô hại — với producer đúng là vô hại, nhưng consumer có whitelist cứng sẽ đẩy toàn bộ bản ghi mới vào quarantine, mà change_management thường IM LẶNG về trường hợp này. Nguy hiểm nhất là đổi NGỮ NGHĨA mà giữ nguyên schema (UTC ➔ giờ local): mọi gate dựa trên tên/kiểu/thứ tự cột đều mù, phải bắt bằng semantic check so với baseline lịch sử.",
    "sourceLink": {
      "text": "Semantic Versioning 2.0.0",
      "url": "https://semver.org/"
    }
  },
  {
    "id": "c_preflight_gate",
    "subject": "Quality Gate",
    "term": "37. Pre-flight Gate (Shift-Left Validation)",
    "pronounceOrType": "Chốt kiểm đặt trước khi đọc dữ liệu",
    "definition": "Khác với validation của quality gate — chạy sau khi dữ liệu đã vào staging và hỏi 'dữ liệu này đủ tốt để nạp chưa' — pre-flight gate chạy trước khi đọc dòng nào và hỏi 'file này có đúng thứ đã thoả thuận không'. Kiểm theo tầng và dừng sớm khi tầng sâu hơn mất ý nghĩa.",
    "formulaOrSyntax": "1. tên file      ─ sai feed thì không cần đọc tiếp (return ngay)\n2. manifest      ─ bytes trên đĩa == manifest.bytes\n3. schema        ─ tên cột VÀ thứ tự cột, đối chiếu contract\n4. probe giá trị ─ TRY_CAST trên MẪU, all_varchar=true\n5. cửa sổ sửa trễ ─ min/max ts so với business_date\n-- exit 0 = pass, exit 1 = fail ➔ cắm vào đầu script load",
    "pitfall": "Để engine tự đoán kiểu khi probe. Kiểu suy ra sẽ TRÔI theo rác: sniffer gọi customer_id là DOUBLE vì 0.2% rác Excel-float, gọi order_total là VARCHAR, và gán cho updated_at một TIMESTAMP WITH TIME ZONE mà chẳng ai hứa. Điểm cố định để đối chiếu là block schema của contract, không phải dữ liệu. Đọc all_varchar rồi tự TRY_CAST. Và gate phải RẺ — bỏ LIMIT lấy mẫu thì sweep đọc hàng chục GB, mà gate đắt là gate bị bỏ qua.",
    "sourceLink": {
      "text": "Great Expectations — Validation",
      "url": "https://docs.greatexpectations.io/"
    }
  },
  {
    "id": "c_config_validation",
    "subject": "Reliability & Ops",
    "term": "38. Config Validation (validate cái validator)",
    "pronounceOrType": "Typed config — pydantic / JSON Schema",
    "definition": "Gate rất nghiêm với dữ liệu nhưng thường cả tin với chính file cấu hình của nó. yaml.safe_load trả về dict trần, nên mọi phép tra sau đó chỉ là đoán về một file do người sửa tay. Model có kiểu bắt lỗi ngay lúc đọc, kèm đường dẫn tới đúng trường sai.",
    "formulaOrSyntax": "class Clause(BaseModel):\n    model_config = ConfigDict(extra=\"forbid\")   # key lạ = LỖI, không phải bỏ qua\n\nclass Money(Clause):\n    negative_allowed: bool      # ghim KIỂU, không chỉ ghim tên key\n\n# Contract.model_validate(raw) ➔ nullible: schema.1.nullible — Extra inputs not permitted",
    "pitfall": "Mặc định của pydantic là BỎ QUA key lạ. Gõ sai key bắt buộc thì vẫn có lỗi, nhưng gõ sai key tuỳ chọn (alowed_values:) bị nuốt im lặng y hệt yaml — một luật lặng lẽ ngừng tồn tại. Gate có luật bị tắt âm thầm còn tệ hơn không có gate, vì mình vẫn tin nó. Lưu ý YAML: `none` là CHUỖI chứ không phải null, và chuỗi khác rỗng là truthy.",
    "sourceLink": {
      "text": "Pydantic — Model Config",
      "url": "https://docs.pydantic.dev/latest/api/config/"
    }
  },
  {
    "id": "c_pii_deidentification",
    "subject": "Cleansing",
    "term": "39. PII & De-identification (Hash / Mask / Tokenize / Generalize)",
    "pronounceOrType": "Phổ che dữ liệu — chọn theo NĂNG LỰC cần giữ lại",
    "definition": "PII là dữ liệu định danh được một người cụ thể, trực tiếp (email, CCCD, số điện thoại) hoặc gián tiếp qua tổ hợp quasi-identifier (ngày sinh + mã bưu chính + giới tính đủ để định danh phần lớn dân số). Khác mọi loại rác khác: gap thường gây SỐ SAI, gap PII gây NGHĨA VỤ THÔNG BÁO rò rỉ. De-identification là một PHỔ chứ không phải công tắc — đi từ giữ nguyên tới xoá hẳn, và mỗi nấc đánh đổi giữa mức riêng tư và năng lực phân tích còn lại.",
    "formulaOrSyntax": "Phổ, từ ít riêng tư tới nhiều:\n  raw ➔ tokenize ➔ hash ➔ mask ➔ generalize ➔ k-anonymity ➔ differential privacy ➔ xoá\n\nTOKENIZE  ➔ thay bằng token; vault đảo ngược được. Khi bản gốc PHẢI quay lại (thanh toán)\nHASH      ➔ một chiều; quan hệ BẰNG NHAU còn ➔ join & dedupe chạy được\nMASK      ➔ giữ hình dạng cho mắt người (a***@x.com); KHÔNG bao giờ so bằng\nGENERALIZE➔ hạ độ chi tiết: ngày sinh ➔ nhóm tuổi, phường ➔ tỉnh\nk-ANON    ➔ mỗi tổ hợp quasi-identifier phải ứng với ít nhất k người\nDP        ➔ thêm nhiễu có kiểm soát; bảo đảm toán học, trả giá bằng độ chính xác\n\n-- Hash phải CHUẨN HOÁ BÊN TRONG, và nên có salt nếu miền giá trị nhỏ:\nmd5(lower(trim(email)))                     -- đủ cho dedupe nội bộ\nsha256(lower(trim(phone)) || :pepper)       -- miền hẹp thì hash trần bị dò ngược được\n\n-- ĐO NĂNG LỰC trước và sau khi phá cột, nếu không thì không chứng minh được là đã giữ:\nSELECT count(email)      - count(DISTINCT email)      FROM core.customers;  -- 180\nSELECT count(email_hash) - count(DISTINCT email_hash) FROM core.customers;  -- 180 y hệt",
    "pitfall": "Ba cái bẫy. (1) Hash chưa chuẩn hoá: md5('John@X.com') khác md5('john@x.com'), âm thầm đánh mất đúng cái năng lực dedupe mà chính sách hứa. Chuẩn hoá TẠI NƠI hash, đừng dựa vào tầng thượng nguồn làm sạch hộ. (2) Tưởng hash là ẩn danh: với miền giá trị hữu hạn (số điện thoại, email phổ biến) thì dựng bảng tra ngược rẻ như bèo — cần salt/pepper, và về pháp lý dữ liệu đã hash vẫn thường bị coi là PSEUDONYMOUS chứ không phải anonymous. (3) Chỉ che cột trực tiếp mà quên quasi-identifier: xoá tên nhưng giữ ngày sinh + mã bưu chính + giới tính thì vẫn định danh được. Dấu hiệu chính sách đã có hiệu lực: chạy lại phép dựng lần hai thì hỏng ngay — Binder Error: Referenced column \"email\" not found. Không còn giá trị thô để hash lại, cũng không còn để rò rỉ.",
    "sourceLink": {
      "text": "NIST — De-identification",
      "url": "https://csrc.nist.gov/glossary/term/de_identification"
    }
  },
  {
    "id": "c_contract_anatomy",
    "subject": "Pipeline Lifecycle",
    "term": "40. Data Contract Anatomy (tám khối)",
    "pronounceOrType": "Cấu trúc một bản contract, khối nào trả lời câu gì",
    "definition": "Data contract không phải file schema. Schema chỉ trả lời 'dữ liệu trông thế nào'; một contract đầy đủ còn phải trả lời 'ai chịu trách nhiệm', 'giao khi nào', 'sai bao nhiêu thì chặn', và 'muốn đổi thì báo trước bao lâu'. Thiếu khối nào thì chỗ đó thành khoảng trống không ai chịu trách nhiệm.",
    "formulaOrSyntax": "producer / consumer  ➔ AI chịu trách nhiệm, liên hệ ở đâu, escalate cho ai\ndelivery             ➔ đường dẫn, định dạng, lịch giao, SLA độ tươi, tín hiệu hoàn tất\nschema               ➔ từng cột: kiểu, nullable, enum, đơn vị, timezone, tham chiếu\nquality              ➔ tolerance từng luật, quy tắc đối soát, chính sách trùng lặp\nchange_management    ➔ semver + thời hạn báo trước + kênh thông báo\nbusiness_rules       ➔ ràng buộc liên cột và chuyển trạng thái hợp lệ\nslo_reporting        ➔ ai gửi gì cho ai, định kỳ bao lâu\nversion / status     ➔ 1.3.0, agreed, effective_from\n\n-- Đọc contract thì hỏi từng cột: kiểu THẬT là gì, có null được không, lặp được không,\n-- timezone nào, đơn vị nào, ai sở hữu ý nghĩa — và ĐIỀU GÌ KHÔNG ĐƯỢC VIẾT RA?",
    "pitfall": "Coi contract là schema rồi bỏ qua các khối còn lại. Thiếu delivery thì không ai biết mấy giờ file trễ mới thành sự cố. Thiếu change_management thì mọi thay đổi đều là bất ngờ. Và khối nguy hiểm nhất là khối KHÔNG CÓ: chỗ contract im lặng vẫn định hình thiết kế y như chỗ nó nói rõ, chỉ khác là không ai chịu trách nhiệm. Contract tốt tự đánh dấu những chỗ im lặng đó.",
    "sourceLink": {
      "text": "Data Contracts",
      "url": "https://datacontracts.com/"
    }
  },
  {
    "id": "c_sli_slo_sla",
    "subject": "Reliability & Ops",
    "term": "41. SLI / SLO / SLA & Error Budget",
    "pronounceOrType": "Ba tầng cam kết chất lượng — đo, mục tiêu, chế tài",
    "definition": "Ba từ hay bị dùng lẫn. SLI là con số ĐO ĐƯỢC (tỉ lệ dòng hỏng, độ trễ, độ tươi). SLO là MỤC TIÊU đặt trên SLI đó, nội bộ, dùng để quyết định khi nào dừng tính năng mới mà đi sửa độ tin cậy. SLA là HỢP ĐỒNG với bên ngoài, có chế tài khi vi phạm — nên SLA luôn lỏng hơn SLO, để còn chỗ xoay xở trước khi thành chuyện pháp lý. Tolerance trong data contract chính là SLO cho chất lượng dữ liệu.",
    "formulaOrSyntax": "SLI ➔ null_or_invalid_status = 0.30%   (đo được, không ý kiến)\nSLO ➔ phải <= 1%                       (mục tiêu; quá thì hard-fail)\nSLA ➔ file phải về trước 04:00 UTC     (quá thì là incident của producer)\n\nerror_budget = 1 - SLO\n  SLO 99.9% uptime ➔ ngân sách 43 phút chết mỗi tháng\n  Còn ngân sách ➔ cứ ship. Hết ngân sách ➔ đóng băng tính năng, đi sửa độ tin cậy.\n\n-- SLO chỉ có nghĩa khi có LỊCH SỬ. Đo một lần chỉ thấy hôm nay:\nCREATE TABLE ops.contract_checks (\n  run_at TIMESTAMP, check_name VARCHAR, rate DOUBLE, tolerance DOUBLE, passed BOOLEAN);\nSELECT run_at, rate, tolerance FROM ops.contract_checks\nWHERE check_name = 'null_or_invalid_status' ORDER BY run_at;   -- đường xu hướng",
    "pitfall": "Đặt SLO bằng 100%: không còn error budget thì mọi sự cố nhỏ đều là khủng hoảng, và đội sẽ học cách giấu sự cố. Đặt SLA chặt bằng SLO: hết chỗ xoay xở, vi phạm nội bộ lập tức thành vi phạm hợp đồng. Và lỗi âm thầm nhất: chỉ kiểm SLI theo từng lần chạy mà không lưu lịch sử — một tỉ lệ bò từ 0.15% lên 0.9% qua nhiều tuần vẫn PASS mọi lần, nhưng nó đang tiến thẳng về ngưỡng và không ai thấy.",
    "sourceLink": {
      "text": "Google SRE Book — Service Level Objectives",
      "url": "https://sre.google/sre-book/service-level-objectives/"
    }
  },
  {
    "id": "c_acid_transaction",
    "subject": "Reliability & Ops",
    "term": "42. ACID & Transaction (Atomicity · Consistency · Isolation · Durability)",
    "pronounceOrType": "Bốn bảo đảm của một transaction — BEGIN / COMMIT / ROLLBACK",
    "definition": "Transaction là một nhóm lệnh được engine đối xử như MỘT thao tác duy nhất. Bốn chữ ACID là bốn bảo đảm khác nhau, hay bị gộp làm một:\n• Atomicity — ăn cả ngã về không: hoặc mọi lệnh có hiệu lực, hoặc không lệnh nào.\n• Consistency — kết thúc transaction, mọi ràng buộc (khoá chính, khoá ngoại, CHECK) vẫn đúng; engine từ chối commit nếu không.\n• Isolation — nhiều transaction chạy đồng thời cho kết quả như thể chúng chạy lần lượt; mức isolation quyết định mỗi transaction thấy được gì của transaction khác.\n• Durability — đã COMMIT là còn, kể cả khi mất điện ngay sau đó; write-ahead log ghi trước, dữ liệu ghi sau.",
    "formulaOrSyntax": "BEGIN TRANSACTION;\n  DELETE FROM core.orders WHERE _data_date = DATE '2026-06-02';\n  INSERT INTO core.orders SELECT * FROM stg_day;\n  UPDATE ops.etl_runs SET status='success' WHERE run_id = 57;\nCOMMIT;   -- lỗi ở bất kỳ đâu ➔ ROLLBACK, warehouse như chưa từng chạy\n\n-- Bốn mức isolation, từ lỏng tới chặt, và thứ mỗi mức còn cho lọt:\nREAD UNCOMMITTED ➔ dirty read (thấy dữ liệu chưa commit của người khác)\nREAD COMMITTED   ➔ non-repeatable read (đọc lại cùng dòng ra giá trị khác)\nREPEATABLE READ  ➔ phantom read (đọc lại cùng điều kiện ra thêm dòng mới)\nSERIALIZABLE     ➔ không lọt gì, trả giá bằng thông lượng\n-- DuckDB dùng snapshot isolation (MVCC): mỗi transaction thấy một ảnh chụp nhất quán",
    "pitfall": "Nhầm atomicity của DATABASE với atomicity của FILE SYSTEM. Ghi Parquet ra lake KHÔNG nằm trong transaction của engine — muốn nguyên tử ở tầng file thì phải dựng thư mục tạm rồi đổi tên (atomic swap, khái niệm 32). Hai lỗi hay gặp nữa: (1) để lệnh ghi audit log NGOÀI transaction, khiến ledger khai thành công cho dữ liệu đã bị rollback; (2) tưởng cứ có transaction là an toàn trước ghi đồng thời — cái đó là ISOLATION, một chữ khác, và mức mặc định thường lỏng hơn bạn nghĩ.",
    "sourceLink": {
      "text": "DuckDB — Transaction Management",
      "url": "https://duckdb.org/docs/sql/statements/transactions"
    }
  },
  {
    "id": "c_retry_backoff",
    "subject": "Reliability & Ops",
    "term": "43. Transient vs Deterministic Failure & Retry Policy",
    "pronounceOrType": "Phân loại lỗi TRƯỚC khi quyết định retry",
    "definition": "Retry chỉ có nghĩa với lỗi TẠM THỜI — mạng chập, file bị khoá, service quá tải, rate limit: thử lại sau vài giây thì thành công. Lỗi TẤT ĐỊNH — schema sai, file không tồn tại, dữ liệu hỏng, chia cho 0 — chạy lại một triệu lần vẫn hỏng y hệt, chỉ tốn thời gian và chôn sâu nguyên nhân thật. Phân loại lỗi là một QUYẾT ĐỊNH THIẾT KẾ, không phải chi tiết cài đặt.",
    "formulaOrSyntax": "for attempt in range(1, MAX + 1):\n    try: return work()\n    except TransientError as e:\n        if attempt == MAX: raise            # hết lượt ➔ báo động\n        delay = min(BASE * 2 ** (attempt-1), MAX_DELAY)\n        time.sleep(delay + random.uniform(0, JITTER))\n    except DeterministicError: raise        # KHÔNG retry, fail ngay\n\nbackoff: 1s ➔ 2s ➔ 4s ➔ 8s ➔ 16s ➔ 30s (trần)\njitter  : cộng nhiễu ngẫu nhiên để cả đàn client không dội cùng một thời điểm\n\n-- Ba chính sách TÁCH BIỆT, đừng gộp:\nretry policy  ➔ thử lại mấy lần, chờ bao lâu\nalert policy  ➔ khi nào đánh thức người trực\ncircuit breaker ➔ khi service hỏng kéo dài thì NGỪNG gọi hẳn một thời gian",
    "pitfall": "Bọc `except Exception` rồi retry tất: lỗi tất định bị lặp tới hết lượt, và stack trace thật bị chôn dưới lần thất bại cuối. Thiếu jitter thì mọi client retry đúng một thời điểm, dồn tải đúng lúc hệ thống đang yếu (thundering herd). Và đừng gộp retry với alert: đặt max_attempts quá thấp thì mọi lỗi thoáng qua đều thành alert và người trực học cách bỏ qua alert; đặt quá cao thì lỗi thật bị giấu hàng chục phút. Retry chỉ AN TOÀN khi thao tác được retry là idempotent — retry một INSERT trần là nhân đôi dữ liệu.",
    "sourceLink": {
      "text": "Google SRE Book — Handling Overload",
      "url": "https://sre.google/sre-book/handling-overload/"
    }
  },
  {
    "id": "c_order_independent_checksum",
    "subject": "Reliability & Ops",
    "term": "44. Order-independent Checksum",
    "pronounceOrType": "Bằng chứng đo được cho tính idempotent",
    "definition": "Muốn chứng minh chạy lại không đổi kết quả thì cần một con số so sánh được. Nhưng count(*) quá thô — đổi nội dung mà giữ số dòng thì không thấy — còn hash cả bảng theo thứ tự lại phụ thuộc thứ tự dòng, mà thứ tự dòng không được đảm bảo khi engine chạy song song. Lời giải là gom các hash bằng một phép GIAO HOÁN: xor, sum, hoặc count(DISTINCT).",
    "formulaOrSyntax": "SELECT count(*) AS n,\n       bit_xor(hash(order_id, updated_at, status, order_total)) AS checksum\nFROM core.orders WHERE _data_date = DATE '2026-06-03';\n-- chạy lần 1 và lần 2 phải ra HAI cặp số giống hệt\n\n-- CHỌN CỘT có chủ đích: chỉ hash cột NGHIỆP VỤ.\n-- Cột lineage (_run_id, loaded_at) ĐÁNG LẼ phải khác giữa hai lần chạy —\n-- đó là lịch sử được ghi lại, không phải dữ liệu thay đổi.\n\nbit_xor ➔ giao hoán, kết hợp; nhưng hai dòng GIỐNG HỆT triệt tiêu nhau\nsum     ➔ giao hoán, giữ được bản trùng; cẩn thận tràn số\nkèm count(*) để bù điểm mù của bit_xor",
    "pitfall": "Dùng string_agg hoặc list rồi hash: kết quả đổi mỗi lần engine đổi thứ tự đọc, nên test đỏ ngẫu nhiên và mất niềm tin. Chỉ so count(*) thì một lần chạy lại làm hỏng nội dung nhưng giữ nguyên số dòng sẽ lọt qua. Dùng bit_xor một mình thì một cặp dòng trùng khít triệt tiêu nhau và biến mất khỏi checksum — luôn kèm count(*). Và giá trị hash() phụ thuộc bản cài engine: chỉ so checksum của chính mình qua thời gian, đừng so với máy khác.",
    "sourceLink": {
      "text": "DuckDB — Aggregate Functions",
      "url": "https://duckdb.org/docs/sql/functions/aggregates"
    }
  },
  {
    "id": "c_load_strategy_trilemma",
    "subject": "Pipeline Lifecycle",
    "term": "45. Load Strategy: Append / Upsert / Partition Refresh",
    "pronounceOrType": "Ba cách nạp dữ liệu có sửa đổi — chọn một, không có cái nào thắng hết",
    "definition": "Khi nguồn gửi lại bản sửa cho dữ liệu cũ, pipeline phải chọn một trong ba cách nạp. Mọi engine hiện đại đều đặt tên riêng cho đúng ba cái này.\n\nAPPEND — ghi nối mọi phiên bản vào một bảng log, rồi dùng view để lấy bản mới nhất lúc đọc. Ghi nhanh nhất, giữ được toàn bộ lịch sử. Đổi lại mọi câu query đều phải chạy dedupe.\n\nUPSERT — dùng MERGE để sửa từng dòng theo khoá. Ghi và đọc đều nhanh, nhưng ghi đè mất bản cũ, và chỉ chạy được trong database. File Parquet không sửa được từng dòng.\n\nPARTITION REFRESH — xoá cả partition rồi ghi lại từ nguồn. Ghi tốn nhất, cũng mất lịch sử, nhưng là cách duy nhất chạy được trên file lake.\n\nĐiểm cần thấy: công dedupe không mất đi, nó chỉ chuyển từ lúc đọc sang lúc ghi. Append trả công đó ở mỗi câu query; upsert và refresh trả một lần lúc nạp. Vì một bảng được đọc hàng nghìn lần mỗi ngày mà chỉ nạp một lần, nên trả lúc ghi rẻ hơn.\n\nSố đo trên 11,5 triệu dòng: append ghi 1,0× trong 24,7s nhưng count(*) qua view tốn 2,131s. Upsert ghi 1,0× trong 59,1s. Refresh ghi 5,2× trong 66,7s — gấp 5 lần số dòng mà chỉ chậm hơn upsert 13%, vì ghi một lượt lớn rẻ hơn hàng triệu lần tìm khoá rời rạc.\n\nMột điều dễ đoán sai: công dedupe lúc đọc KHÔNG giữ nguyên tỉ lệ khi dữ liệu lớn lên. Nó từ chậm 13 lần thành chậm 426 lần, vì count trên bảng thường chỉ đọc metadata còn window function thì phải quét thật.",
    "formulaOrSyntax": "-- Ba model kind của SQLMesh chính là ba chiến lược này:\nINCREMENTAL_BY_TIME_RANGE   ➔ Refresh : DELETE theo khoảng thời gian rồi INSERT\nINCREMENTAL_BY_UNIQUE_KEY   ➔ Upsert  : MERGE theo khoá\nFULL / APPEND               ➔ Append  : nối thêm, hoặc dựng lại toàn bộ\n\n-- dbt gọi cùng ba thứ đó là incremental_strategy:\n{{ config(materialized='incremental', incremental_strategy='delete+insert') }}  -- Refresh\n{{ config(materialized='incremental', incremental_strategy='merge') }}         -- Upsert\n{{ config(materialized='incremental', incremental_strategy='append') }}        -- Append",
    "pitfall": "Chọn upsert vì nó ghi ít nhất, rồi phát hiện Parquet không sửa từng dòng được — phải viết lại pipeline khi chuyển sang lakehouse. Chiều ngược lại cũng có: chọn refresh rồi để cửa sổ lookback nới lên 30 ngày, lúc đó số dòng phải ghi lại vọt lên và upsert nhanh hơn hẳn. Con số '5,2× mà chỉ chậm 13%' chỉ đúng với cửa sổ 7 ngày.",
    "sourceLink": {
      "text": "SQLMesh — Model kinds (ba kind, kèm SQL mà engine sinh ra cho từng loại)",
      "url": "https://sqlmesh.readthedocs.io/en/stable/concepts/models/model_kinds/"
    }
  },
  {
    "id": "c_merge_semantics",
    "subject": "SQL Fundamentals",
    "term": "46. MERGE — hai điều kiện để upsert chạy đúng",
    "pronounceOrType": "Engine không kiểm tra hộ, cả hai đều phải tự lo",
    "definition": "MERGE trông đơn giản nhưng chỉ cho kết quả đúng khi thoả hai điều kiện, và không điều kiện nào được engine kiểm tra giúp.\n\nĐIỀU KIỆN 1 — bảng nguồn phải có đúng một dòng cho mỗi khoá. Nếu nguồn có hai dòng cùng order_id, MERGE không báo lỗi. Nó lấy bừa một dòng rồi báo chạy xong. Vì vậy phải dedupe nguồn ở staging trước khi merge.\n\nĐIỀU KIỆN 2 — mệnh đề UPDATE phải kèm điều kiện so sánh phiên bản. Không có nó, một bản sửa cũ về sau sẽ ghi đè lên dòng mới hơn. Lúc đó bảng của bạn chạy theo luật 'file nào về sau thì thắng' chứ không phải 'phiên bản nào mới nhất thì thắng'.\n\nDấu hiệu cho thấy đây là luật chung chứ không riêng bài lab: SQLMesh cho khai báo đúng hai thứ này thành hai tham số — unique_key cho điều kiện 1, when_matched cho điều kiện 2.",
    "formulaOrSyntax": "-- Điều kiện 1: dedupe nguồn trước khi merge\nCREATE OR REPLACE TEMP TABLE stg AS SELECT * EXCLUDE (rn) FROM (\n  SELECT *, row_number() OVER (PARTITION BY id ORDER BY updated_at DESC) rn\n  FROM src) WHERE rn = 1;\n\n-- Điều kiện 2: so sánh bằng dấu > (dấu này cũng loại luôn trường hợp bằng nhau)\nMERGE INTO tgt t USING stg s ON t.id = s.id\nWHEN MATCHED AND s.updated_at > t.updated_at THEN UPDATE\nWHEN NOT MATCHED THEN INSERT;\n\n-- Khai báo tương đương trong SQLMesh:\nkind INCREMENTAL_BY_UNIQUE_KEY (\n  unique_key id,\n  when_matched WHEN MATCHED AND source.updated_at > target.updated_at THEN UPDATE SET ...\n)",
    "pitfall": "Bỏ điều kiện so sánh: job vẫn chạy, count cuối vẫn khớp tuyệt đối, nhưng hàng chục nghìn dòng bị ghi đè bằng phiên bản cũ. Đo thực tế: điều kiện đó chặn đúng 38.090 dòng trên 11,5 triệu. Bỏ nó thì 38.090 đơn hàng mang giá trị sai, mà không có test đếm dòng nào phát hiện ra.",
    "sourceLink": {
      "text": "SQLMesh — Incremental by unique key (unique_key, when_matched, merge_filter)",
      "url": "https://sqlmesh.readthedocs.io/en/stable/concepts/models/model_kinds/"
    }
  },
  {
    "id": "c_lookback_window",
    "subject": "Pipeline Lifecycle",
    "term": "47. Lookback window cho dữ liệu về trễ",
    "pronounceOrType": "Độ rộng cửa sổ lấy từ contract, không tự đoán",
    "definition": "Nguồn gửi bản sửa trễ so với ngày nghiệp vụ của dòng đó: một đơn hàng ngày 01/06 có thể được sửa và gửi lại trong file ngày 06/06. Khi refresh, cửa sổ phải rộng đủ để phủ hết những partition mà bản sửa đang về có thể thuộc vào.\n\nĐộ rộng cửa sổ không được đoán. Nó là cam kết ghi trong data contract (late_corrections.window_days), và code phải đọc từ đó thay vì viết cứng số 7 vào query.\n\nĐây là chuyện phổ biến đến mức framework đặt hẳn một tham số cho nó. SQLMesh gọi là lookback, định nghĩa là 'số interval trước interval đang xử lý mà model cần đọc thêm để bắt dữ liệu về trễ'.\n\nCẩn thận đơn vị: lookback đếm theo interval_unit của model chứ không phải theo ngày. Model chạy mỗi 6 giờ mà đặt lookback 4 thì không được 24 giờ nhìn lại.",
    "formulaOrSyntax": "lo = max(START, D - INTERVAL window_days DAY)\nDELETE FROM tgt WHERE part_date BETWEEN lo AND D;\nINSERT INTO tgt SELECT ... WHERE part_date BETWEEN lo AND D;\n-- window_days đọc từ: contract.late_corrections.window_days\n\n-- Khai báo tương đương trong SQLMesh:\nkind INCREMENTAL_BY_TIME_RANGE (\n  time_column transaction_date,\n  lookback 7          -- 7 interval_unit trước interval đang xử lý\n)",
    "pitfall": "Dùng cửa sổ [D, D] cho gọn — chỉ xử lý đúng ngày đang nạp. Đo thực tế: số dòng chỉ lệch 1 (0,0002%, không ai để ý) nhưng 1,02% dữ liệu mang giá trị sai. Mọi đơn hàng có bản sửa về trễ đều kẹt ở giá trị gốc, vì bản sửa thuộc partition cũ hơn mà cửa sổ hẹp không đụng tới.",
    "sourceLink": {
      "text": "SQLMesh — lookback (định nghĩa chuẩn và bẫy interval_unit)",
      "url": "https://sqlmesh.readthedocs.io/en/stable/concepts/models/overview/"
    }
  },
  {
    "id": "c_bitemporality",
    "subject": "Data Modeling",
    "term": "48. Bi-temporality — event time và ingestion time",
    "pronounceOrType": "Chuyện xảy ra lúc nào, và ta biết lúc nào",
    "definition": "Mỗi dòng dữ liệu có hai mốc thời gian không liên quan nhau: lúc sự kiện xảy ra (event time, thường là updated_at) và lúc ta nhận được nó (ingestion time, thường là ngày của file).\n\nThứ tự file về không phản ánh thứ tự sự kiện. Một file về sau hoàn toàn có thể chứa nội dung cũ hơn — do nguồn gửi lại, do retry, do các hệ thống bên nguồn không đồng bộ với nhau.\n\nHệ quả quan trọng nhất nằm ở phía nghiệp vụ. Một báo cáo chốt tháng trước có thể không sai ở thời điểm chốt, chỉ là lúc đó ta chưa biết hết. Phân biệt được hai chuyện đó mới trả lời được câu 'vì sao doanh thu tháng 6 hôm nay khác con số tháng 6 in ra hồi tháng 7'.\n\nChỉ append log giữ được cả hai mốc. Upsert và refresh ghi đè mất mốc thứ hai — đó là lý do nhiều pipeline vẫn giữ log làm nguồn dù phục vụ người dùng bằng bảng đã dedupe.\n\nLiên hệ với concept 30: SCD Type 2 chính là cách dựng bảng chiều theo đúng ý này, chỉ khác là nó dùng hai cặp valid_from/valid_to cho hai mốc.",
    "formulaOrSyntax": "-- Sai: xếp hạng theo lúc NHẬN được\nORDER BY _data_date DESC\n-- Đúng: xếp hạng theo lúc sự kiện XẢY RA\nORDER BY updated_at DESC, _data_date ASC\n\n-- Ví dụ thật trong lab, đơn 1510000111:\n--   file ngày 06-02 chứa updated_at = 2026-06-02 00:10:35\n--   file ngày 06-01 chứa updated_at = 2026-06-02 20:27:19\n--   ➔ file về sau nhưng nội dung cũ hơn",
    "pitfall": "Xếp hạng phiên bản theo ngày của file vì nó dễ nghĩ hơn. Trong lab, cách này chọn nhầm giá trị 435,92 thay vì 230,65 — sai gần gấp đôi, và số dòng không đổi một chút nào.",
    "sourceLink": {
      "text": "Martin Fowler — Bitemporal History",
      "url": "https://martinfowler.com/articles/bitemporal-history.html"
    }
  },
  {
    "id": "c_content_reconciliation",
    "subject": "Quality Gate",
    "term": "49. Đối soát nội dung — đếm dòng là chưa đủ",
    "pronounceOrType": "EXCEPT hai chiều, hoặc dùng công cụ diff",
    "definition": "count(*) trả lời câu 'có bao nhiêu dòng', không trả lời câu 'có đúng những dòng đó không'. Hai bảng cùng số dòng vẫn có thể khác nhau hoàn toàn về nội dung.\n\nMuốn chứng minh hai bảng bằng nhau phải so nội dung theo cả hai chiều. Chỉ chạy A EXCEPT B rồi thấy 0 thì mới biết A nằm gọn trong B, chưa biết B có dòng thừa hay không.\n\nTrong cùng một database, EXCEPT hai chiều là đủ. Khi bảng quá lớn hoặc hai bảng nằm ở hai database khác nhau thì EXCEPT không chạy được, lúc đó cần công cụ diff riêng — chúng băm dữ liệu theo từng đoạn rồi chỉ đào sâu vào đoạn nào khác nhau.\n\nDùng lúc nào trong thực tế: so bảng dev với bảng production trước khi merge PR, so nguồn với đích khi chuyển warehouse, so kết quả trước và sau khi sửa logic transform.",
    "formulaOrSyntax": "-- Trong cùng một database:\nSELECT (SELECT count(*) FROM (SELECT * FROM a EXCEPT SELECT * FROM b)) AS a_minus_b,\n       (SELECT count(*) FROM (SELECT * FROM b EXCEPT SELECT * FROM a)) AS b_minus_a;\n-- cả hai bằng 0 thì hai bảng giống nhau tới từng byte\n\n-- Khi bảng lớn hoặc khác database, dùng package dbt-audit-helper:\n{{ audit_helper.compare_relations(\n     a_relation = ref('orders_old'),\n     b_relation = ref('orders_new'),\n     primary_key = 'order_id') }}\n-- trả về: số dòng chỉ có ở a / chỉ có ở b / khớp cả hai, kèm tỉ lệ phần trăm",
    "pitfall": "Dừng lại khi thấy count khớp. Trường hợp thật trong lab: count lệch đúng 1 dòng — 0,0002%, không ai để ý — trong khi 5.824 dòng (1,02%) mang giá trị sai hoàn toàn.",
    "sourceLink": {
      "text": "dbt-audit-helper — compare_relations / compare_queries",
      "url": "https://github.com/dbt-labs/dbt-audit-helper"
    }
  },
  {
    "id": "c_deterministic_tiebreak",
    "subject": "SQL Fundamentals",
    "term": "50. Tie-breaker trong ORDER BY",
    "pronounceOrType": "Hai dòng bằng nhau thì engine chọn dòng nào?",
    "definition": "Khi hai dòng có cùng giá trị ở cột đầu tiên trong ORDER BY, engine chọn dòng nào là tuỳ nó. Chạy lại lần nữa có thể ra kết quả khác; hai engine khác nhau thì gần như chắc chắn khác. Trạng thái đó gọi là không deterministic.\n\nThêm một cột nữa vào ORDER BY thì kết quả cố định. Cột thêm vào đó gọi là tie-breaker.\n\nNhưng chỉ thêm thôi chưa đủ — nó còn phải khớp với luật mà những chỗ khác trong pipeline đang dùng ngầm. Ví dụ trong lab: view dùng ORDER BY updated_at DESC, _data_date ASC, tức là hoà thì file về trước thắng. MERGE dùng điều kiện dấu >, tức là timestamp bằng nhau thì không update, cũng là file về trước thắng. Hai luật khớp nhau là có chủ ý.\n\nVì sao loại bug này khó tìm: cả hai cách viết đều đúng theo đặc tả, chúng chỉ bất đồng ở trường hợp hoà. Đối soát sẽ báo lệch một dòng, và bạn không có manh mối nào để biết bên nào sai.",
    "formulaOrSyntax": "row_number() OVER (PARTITION BY id ORDER BY updated_at DESC, _data_date ASC)\n--                                                        └── tie-breaker\n\n-- Kiểm tra xem dữ liệu có trường hợp hoà không, trước khi tin là không có:\nSELECT id, updated_at, count(*) FROM tbl\nGROUP BY 1, 2 HAVING count(*) > 1;",
    "pitfall": "Bỏ tie-breaker vì 'dữ liệu này không có trùng updated_at'. Ở scale small quả thật không có; ở scale full có đúng một trường hợp — và một trường hợp là đủ để hai cách viết đều đúng cho ra kết quả lệch nhau một dòng.",
    "sourceLink": {
      "text": "Use The Index, Luke — Sorting and grouping",
      "url": "https://use-the-index-luke.com/sql/sorting-grouping"
    }
  },
  {
    "id": "c_partition_key_not_null",
    "subject": "Storage & Pruning",
    "term": "51. Partition key không bao giờ được NULL",
    "pronounceOrType": "NULL gặp BETWEEN thì dòng đó biến mất",
    "definition": "NULL BETWEEN x AND y cho ra NULL chứ không phải TRUE hay FALSE. Dòng có partition key bằng NULL sẽ không lọt qua bất kỳ mệnh đề WHERE nào — nó không được INSERT vào, cũng không bị DELETE ra.\n\nKết quả: mất dòng, không báo lỗi, không cảnh báo. Đây là loại bug tệ nhất vì nó im lặng hoàn toàn cho tới bước đối soát, lúc đó ba chiến lược nạp đột nhiên lệch nhau mà không rõ vì đâu.\n\nNULL thường sinh ra từ bước làm sạch: try_strptime và TRY_CAST trả NULL cho giá trị hỏng thay vì ném lỗi (khoảng 0,02% số dòng trong lab). Đó là hành vi đúng của cleaner, nhưng partition key thì phải có lưới hứng.\n\nChọn giá trị thay thế nào cũng được — ngày của file, ngày của updated_at, hay một giá trị đánh dấu như 1900-01-01 — miễn là chọn một rồi giữ nguyên và ghi vào tài liệu. Giá trị đánh dấu có lợi thế là dễ lọc ra để điều tra sau.",
    "formulaOrSyntax": "COALESCE(CAST(try_strptime(ts, FORMATS) AS DATE), DATE '{file_date}') AS part_date\n\n-- Kiểm tra lưới đã hứng hết chưa — chạy sau mọi lần nạp:\nSELECT count(*) FILTER (WHERE part_date IS NULL) FROM tbl;   -- phải bằng 0",
    "pitfall": "Tin rằng ràng buộc NOT NULL sẽ bắt được. Nó bắt được, nếu bạn có đặt. Phần lớn bảng staging không đặt ràng buộc nào, và file Parquet thì không có khái niệm ràng buộc.",
    "sourceLink": {
      "text": "DuckDB — NULL semantics (bảng chân trị đầy đủ)",
      "url": "https://duckdb.org/docs/stable/sql/data_types/nulls"
    }
  },
  {
    "id": "c_scale_dependent_correctness",
    "subject": "Reliability & Ops",
    "term": "52. Lỗi chỉ xuất hiện ở scale lớn",
    "pronounceOrType": "Viết code ở small, nghiệm thu ở full",
    "definition": "Có những lỗi logic im lặng hoàn toàn trên dữ liệu nhỏ và chỉ lộ ra ở quy mô thật, vì trường hợp kích hoạt chúng quá hiếm để xuất hiện trong mẫu nhỏ.\n\nChạy đúng trên tập dev không phải là bằng chứng code đúng. Bước chạy full không phải để đo tốc độ — nó là bước kiểm tra tính đúng.\n\nHai ví dụ trong lab, cùng một bản chất. Một là dedupe trong phạm vi cửa sổ thay vì dedupe toàn bộ rồi mới lọc: ở small hai cách cho kết quả giống hệt, ở full cách sai để lại 7 dòng trùng. Hai là thiếu tie-breaker: ở small không có trường hợp hoà nào, ở full có đúng một.\n\nCách phòng: khi làm tập dev, đừng chỉ lấy mẫu nhỏ hơn một cách ngẫu nhiên. Phải cố ý nhét vào đó các trường hợp biên đã biết — giá trị hoà, dữ liệu về trễ, giá trị NULL, khoá trùng. Không thì tập dev chỉ đang xác nhận rằng đường đi thuận lợi vẫn chạy được.",
    "formulaOrSyntax": "-- Đúng: dedupe TOÀN BỘ trước, rồi mới lọc theo cửa sổ\nSELECT * FROM (SELECT *, row_number() OVER (...) rn\n               FROM log WHERE _data_date <= D)\nWHERE rn = 1 AND part_date BETWEEN lo AND D;\n\n-- Sai, nhưng small không phát hiện ra: lọc cửa sổ trước rồi mới dedupe\nSELECT * FROM (SELECT *, row_number() OVER (...) rn\n               FROM log WHERE part_date BETWEEN lo AND D)\nWHERE rn = 1;\n-- bản mới nhất của một đơn có thể nằm NGOÀI cửa sổ ➔ dedupe cục bộ chọn nhầm bản cũ",
    "pitfall": "Thấy tất cả test đều xanh trên tập dev rồi deploy. Trong lab, cách viết sai cho kết quả giống hệt cách đúng ở scale small — không chạy full thì lỗi đó lên thẳng production.",
    "sourceLink": {
      "text": "Maxime Beauchemin — Functional Data Engineering",
      "url": "https://maximebeauchemin.medium.com/functional-data-engineering-a-modern-paradigm-for-batch-data-processing-2327ec32c42a"
    }
  },
  {
    "id": "c_restatement_semantics",
    "subject": "Reliability & Ops",
    "term": "53. Chạy lại partition cũ chính là backfill",
    "pronounceOrType": "Refresh chỉ idempotent ở partition mới nhất",
    "definition": "Partition refresh chỉ cho kết quả không đổi khi bạn chạy lại ngày mới nhất. Chạy lại một ngày D cũ hơn sẽ đưa cửa sổ [D−N, D] về đúng trạng thái tại thời điểm D, tức là xoá mất mọi bản sửa đã về sau ngày đó.\n\nVì vậy 'chạy lại một ngày' và 'backfill' không phải hai việc khác nhau. Chạy lại một ngày trong quá khứ chính là một lần backfill nhỏ, và phải chạy tiếp từ D tới hiện tại thì kết quả mới đúng.\n\nĐiều kiện _data_date <= D là thứ làm cho việc tái hiện quá khứ trung thực. Trong pipeline chạy thật nó tự đúng vì lúc đó chưa có file D+1; khi replay lại lịch sử thì phải tự viết ra.\n\nFramework tách rõ hai khái niệm này: SQLMesh phân biệt lookback (chỉ mở rộng phạm vi dữ liệu ĐỌC ở mỗi lần chạy) với restatement (ghi LẠI dữ liệu đã xử lý trước đó). Nhầm hai cái là nguồn của rất nhiều sự cố mất dữ liệu.",
    "formulaOrSyntax": "-- Điều kiện as-of, để tái hiện đúng những gì pipeline thấy vào ngày D:\nWHERE _data_date <= DATE '{D}'\n\n-- Chạy lại ĐÚNG (cuốn tới hiện tại):\nfor d in date_range(D, today): refresh(d)\n\n-- Chạy lại SAI (xoá mọi bản sửa về sau D, không báo lỗi):\nrefresh(D)\n\n-- SQLMesh có lệnh riêng cho việc này:\nsqlmesh plan --restate-model db.orders --start 2026-06-01 --end 2026-06-10",
    "pitfall": "Chạy lại một ngày lẻ trong quá khứ để 'sửa nhanh'. Nó âm thầm xoá mọi bản sửa đã về sau ngày đó, và bạn chỉ biết khi có người hỏi vì sao con số tháng trước đổi.",
    "sourceLink": {
      "text": "SQLMesh — Plans & restatement (phân biệt lookback với restate)",
      "url": "https://sqlmesh.readthedocs.io/en/stable/concepts/plans/"
    }
  }
]