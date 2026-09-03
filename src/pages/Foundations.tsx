import { useEffect, useMemo, useRef, useState } from 'react'
import { Empty } from '../components/ui'

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
    "term": "4. Idempotency (Tính bất biến khi chạy lại)",
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
    "pronounceOrType": "Tiến hóa lược đồ dữ liệu",
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
    "pronounceOrType": "Phép kiểm tra toàn vẹn độ mịn",
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
  }
]


const STORAGE_KEY = 'lab-log:foundations:concepts'
const MASTERED_KEY = 'lab-log:foundations:mastered'

function readStoredConcepts(): ConceptItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return DEFAULT_CONCEPTS
}

export default function Foundations() {
  const [concepts, setConcepts] = useState<ConceptItem[]>(readStoredConcepts)
  const [activeSub, setActiveSub] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  
  // Pagination state (Chỉ cần phân trang sổ tay tra cứu)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  
  // Mastered state
  const [mastered, setMastered] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(MASTERED_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch { return {} }
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(concepts))
  }, [concepts])

  const toggleMaster = (id: string) => {
    const next = { ...mastered, [id]: !mastered[id] }
    setMastered(next)
    localStorage.setItem(MASTERED_KEY, JSON.stringify(next))
  }

  // ── IMPORT / EXPORT FUNCTIONS ──
  const handleExportJSON = () => {
    const dataToExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      totalConcepts: concepts.length,
      concepts,
      mastered
    }
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `foundations-concepts-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        let importedConcepts: ConceptItem[] = []
        let importedMastered: Record<string, boolean> = {}

        if (Array.isArray(parsed)) {
          importedConcepts = parsed
        } else if (parsed && Array.isArray(parsed.concepts)) {
          importedConcepts = parsed.concepts
          if (parsed.mastered) importedMastered = parsed.mastered
        }

        if (importedConcepts.length > 0) {
          setConcepts(importedConcepts)
          setPage(1)
          if (Object.keys(importedMastered).length > 0) {
            setMastered(importedMastered)
            localStorage.setItem(MASTERED_KEY, JSON.stringify(importedMastered))
          }
          alert(`Đã nạp thành công ${importedConcepts.length} khái niệm vào Foundations!`)
        } else {
          alert('File JSON không đúng cấu trúc danh sách khái niệm Foundations.')
        }
      } catch {
        alert('Lỗi: File JSON không đọc được hoặc sai định dạng.')
      }
    }
    reader.readAsText(file)
  }

  const handleResetDefault = () => {
    if (confirm('Khôi phục danh sách 34 khái niệm gốc theo đúng thứ tự logic (1 - 34)? Mọi thay đổi trước đó sẽ được làm mới.')) {
      setConcepts(DEFAULT_CONCEPTS)
      setPage(1)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONCEPTS))
      alert('Đã khôi phục danh sách chuẩn từ 1 đến 34.')
    }
  }

  const subjects = [
    'ALL',
    'Pipeline Lifecycle',
    'SQL & Engine',
    'Storage & Pruning',
    'Cleansing',
    'Complex Types',
    'Quality Gate',
    'SQL Fundamentals',
    'Data Modeling',
    'Reliability & Ops',
  ]

  const filtered = useMemo(() => {
    return concepts.filter((c) => {
      const matchSub = activeSub === 'ALL' || c.subject === activeSub
      const q = search.toLowerCase().trim()
      const matchQ = !q || c.term.toLowerCase().includes(q) || c.definition.toLowerCase().includes(q) || c.formulaOrSyntax.toLowerCase().includes(q)
      return matchSub && matchQ
    })
  }, [concepts, activeSub, search])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const pagedConcepts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div className="page-head">
        <h2>Foundations · Sổ tay Khái niệm & Cú pháp ETL</h2>
      </div>

      <div className="card intro" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ margin: 0 }}>
            Hệ thống khái niệm sắp xếp tuần tự theo lộ trình học từ: Mô hình tư duy ➔ Nạp dữ liệu ➔ Lưu trữ ➔ Làm sạch ➔ Biến đổi ➔ Cổng kiểm soát.
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn ghost sm" onClick={handleExportJSON}>📥 Xuất JSON</button>
            <button className="btn ghost sm" onClick={() => fileInputRef.current?.click()}>📤 Nạp JSON</button>
            <button className="btn ghost sm" onClick={handleResetDefault} title="Khôi phục thứ tự chuẩn">🔄 Đặt lại</button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => e.target.files?.[0] && handleImportJSON(e.target.files[0])}
            />
          </div>
        </div>
      </div>

      {/* Filter Controls & Search */}
      <div className="vocab-controls" style={{ marginBottom: 12 }}>
        <input
          type="text"
          className="vocab-search"
          placeholder="Tìm kiếm theo số thứ tự (1, 2...), tên khái niệm, cú pháp SQL, cạm bẫy..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {/* Filter Chips */}
      <div className="chiprow" style={{ marginBottom: 16 }}>
        {subjects.map((sub) => (
          <button
            key={sub}
            className="fchip"
            aria-pressed={activeSub === sub}
            onClick={() => {
              setActiveSub(sub)
              setPage(1)
            }}
          >
            {sub}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty ico="🔍">Không tìm thấy khái niệm phù hợp với bộ lọc.</Empty>
      ) : (
        /* ════════════ BROWSE HANDBOOK LIST (WITH PAGINATION) ════════════ */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Controls bar: count & page size */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, margin: '0 0 4px' }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              Hiển thị <b>{pagedConcepts.length}</b> / <b>{filtered.length}</b> khái niệm · Trang {currentPage}/{totalPages}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
              <span>Hiển thị:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: '1px solid var(--line)',
                  background: '#fff',
                  color: 'var(--text)',
                  fontSize: 13
                }}
              >
                <option value={4}>4 mục / trang</option>
                <option value={6}>6 mục / trang</option>
                <option value={10}>10 mục / trang</option>
                <option value={26}>Toàn bộ (26 mục)</option>
              </select>
            </div>
          </div>

          {pagedConcepts.map((item) => {
            const isDone = mastered[item.id]
            return (
              <div
                key={item.id}
                className="card"
                style={{
                  borderLeft: isDone ? '4px solid #10b981' : '4px solid var(--coral)',
                  padding: 16
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <span className="code-tag" style={{ marginRight: 8 }}>{item.subject}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>
                      {item.pronounceOrType}
                    </span>
                    <h3 style={{ margin: '4px 0 0', fontSize: 18, color: 'var(--text)' }}>
                      {item.term}
                    </h3>
                  </div>
                  <button
                    className={`btn sm ${isDone ? 'ghost' : ''}`}
                    style={{ fontSize: 12, padding: '4px 10px' }}
                    onClick={() => toggleMaster(item.id)}
                  >
                    {isDone ? '✓ Đã thuộc' : '○ Thuộc lòng'}
                  </button>
                </div>

                <p style={{ margin: '0 0 10px', fontSize: 14, color: 'var(--text)' }}>
                  <b>Định nghĩa: </b>{item.definition}
                </p>

                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>
                    Cú pháp / Công thức chuẩn:
                  </span>
                  <pre style={{
                    background: '#181825',
                    color: '#cdd6f4',
                    padding: 10,
                    borderRadius: 6,
                    fontSize: 12,
                    overflowX: 'auto',
                    fontFamily: 'var(--mono)',
                    margin: '4px 0 0'
                  }}>
                    <code>{item.formulaOrSyntax}</code>
                  </pre>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, background: '#fafafa', padding: 8, borderRadius: 6 }}>
                  <div style={{ fontSize: 12.5, color: '#b91c1c' }}>
                    <b>⚠️ Cạm bẫy: </b>{item.pitfall}
                  </div>
                  {item.sourceLink && (
                    <a
                      href={item.sourceLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 12, color: 'var(--coral)', textDecoration: 'none', fontWeight: 500 }}
                    >
                      {item.sourceLink.text} ↗
                    </a>
                  )}
                </div>
              </div>
            )
          })}

          {/* ── PAGINATION BAR ── */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
              marginTop: 20,
              marginBottom: 16,
              flexWrap: 'wrap'
            }}>
              <button
                className="btn ghost sm"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                ← Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1]
                  return (
                    <span key={p} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {prev && p - prev > 1 && <span style={{ color: 'var(--muted)' }}>...</span>}
                      <button
                        className={`btn sm ${p === currentPage ? '' : 'ghost'}`}
                        style={{
                          minWidth: 36,
                          padding: '6px 10px',
                          fontWeight: p === currentPage ? 600 : 400
                        }}
                        onClick={() => handlePageChange(p)}
                      >
                        {p}
                      </button>
                    </span>
                  )
                })}

              <button
                className="btn ghost sm"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}