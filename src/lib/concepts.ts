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
  /* ─────────── KIẾN TRÚC & VẬN HÀNH (PIPELINE & OPS) ─────────── */
  {
    "id": "c_elt_architecture",
    "subject": "Pipeline Lifecycle",
    "term": "1. Dịch chuyển kiến trúc: ETL vs. ELT vs. EtLT",
    "pronounceOrType": "Tư duy phân bổ tính toán",
    "definition": "Quyết định xem dữ liệu bị 'nhào nặn' ở đâu. ETL truyền thống dùng một máy chủ trung gian để nhào nặn dữ liệu trước khi đẩy vào kho. ELT hiện đại nạp thẳng dữ liệu thô vào kho rồi mới dùng sức mạnh của kho để tính toán. EtLT là điểm cân bằng: Dọn dẹp định dạng cơ bản ('t' nhỏ) ngay lúc đọc file, rồi nạp vào kho để thực hiện các phép JOIN và xử lý nghiệp vụ nặng nề ('T' lớn).",
    "formulaOrSyntax": "-- Công cụ mở rộng: dbt & Cloud Data Warehouse (Snowflake, BigQuery)\nMô hình ELT thống trị nhờ dbt (công cụ chuyên viết SQL trong kho) và sức mạnh tính toán khổng lồ của Cloud.\nĐánh đổi (Trade-offs): ELT giúp phát triển nhanh vì chỉ cần biết SQL, không phải bảo trì máy chủ trung gian. Nhưng bạn đang dùng chính Data Warehouse đắt đỏ để dọn rác. Nếu viết SQL kém tối ưu, hóa đơn Cloud cuối tháng sẽ tăng phi mã.",
    "pitfall": "Lầm tưởng mọi thứ đều phải làm sạch triệt để trước khi nạp. Nếu lọc bỏ dòng lỗi ngay từ lúc kéo file (Extract), bạn sẽ làm mất dấu vết nguồn, mất khả năng kiểm toán (Audit) và không có manh mối để điều tra khi số liệu báo cáo bị lệch.",
    "sourceLink": { "text": "dbt: ETL vs ELT", "url": "https://www.getdbt.com/analytics-engineering/transformation/etl-vs-elt/" }
  },
  {
    "id": "c_batch_vs_streaming",
    "subject": "Pipeline Lifecycle",
    "term": "2. Độ trễ luồng dữ liệu (Latency): Batch vs. Streaming",
    "pronounceOrType": "Mô hình xử lý theo thời gian",
    "definition": "Đường ống chạy theo chu kỳ nào: Batch (gom một lô lớn chạy định kỳ, ví dụ 1 lần/ngày), Micro-batch (gom các lô nhỏ vài giây/phút), và Streaming (xử lý ngay lập tức khi có sự kiện). Các hệ thống phân tích dữ liệu đa số đều chạy theo mô hình Daily Batch (T+1), tức là dữ liệu hôm nay thì ngày mai mới lên báo cáo.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Apache Airflow (Batch) vs. Apache Kafka / Flink (Streaming)\nĐánh đổi (Trade-offs): Business luôn đòi 'Real-time' (Thời gian thực). Nhưng Streaming đòi hỏi duy trì cụm server 24/7 (như Kafka), logic xử lý dữ liệu trễ cực kỳ phức tạp và chi phí đắt gấp chục lần. 90% nhu cầu báo cáo thực tế chỉ cần dữ liệu cập nhật theo ngày thông qua Airflow là đủ.",
    "pitfall": "Áp dụng các hàm tính toán toàn cục (như ROW_NUMBER() để lấy bản ghi mới nhất) vào luồng Streaming. Trong Streaming, dữ liệu trôi liên tục không có điểm dừng, các hàm toàn cục sẽ làm tràn RAM hệ thống nếu không có cơ chế chặn cửa sổ thời gian (Watermark).",
    "sourceLink": { "text": "Confluent: Batch vs Streaming", "url": "https://www.confluent.io/learn/batch-vs-real-time-data-processing/" }
  },
  {
    "id": "c_orchestration_fault_isolation",
    "subject": "Reliability & Ops",
    "term": "3. Điều phối (Orchestration) & Cô lập lỗi (Fault Isolation)",
    "pronounceOrType": "Tư duy quản trị tác vụ",
    "definition": "Khi chạy tự động nạp lại lịch sử 60 ngày, nếu ngày thứ 20 gặp file hỏng, hệ thống phải biết đánh dấu 'failed' vào sổ trạng thái rồi tiếp tục đi nạp ngày 21. Khả năng tự động khoanh vùng mẻ hỏng này gọi là Cô lập lỗi (Fault Isolation), cũng là sự khác biệt cốt lõi giữa việc viết một vòng lặp FOR ngây thơ bằng Python và việc dùng một hệ điều phối chuyên nghiệp.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Apache Airflow / Dagster\nAirflow cho phép định nghĩa các tác vụ (Tasks) độc lập. Task A hỏng, Task B (nếu không phụ thuộc A) vẫn chạy bình thường.\nĐánh đổi (Trade-offs): Airflow cung cấp sẵn cơ chế chạy lại (Retry) rất xịn. Tuy nhiên, nếu bạn bọc try-except rồi nhắm mắt Retry mọi thứ thì việc thử lại một file hỏng cấu trúc 10 lần chỉ làm nghẽn server và chôn vùi thông báo lỗi thật sự. Nguyên tắc: Lỗi mạng thì thử lại, lỗi dữ liệu thì sập luôn.",
    "pitfall": "Viết script ETL gom chung mọi thứ vào một hàm chạy một mạch từ đầu đến cuối. Dữ liệu một ngày bị sai dấu phẩy làm sập toàn bộ script, báo cáo của tất cả các ngày khác đều bị đứng im.",
    "sourceLink": { "text": "Airflow Core Concepts", "url": "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/index.html" }
  },
  {
    "id": "c_idempotency_atomic",
    "subject": "Reliability & Ops",
    "term": "4. Chạy lại an toàn (Idempotency) & Giao dịch trọn vẹn (Atomic Transactions)",
    "pronounceOrType": "Trạng thái phục hồi an toàn khi sập hệ thống",
    "definition": "Đặc tính sống còn của Pipeline dữ liệu: Chạy 1 lần hay 100 lần với cùng một tập dữ liệu thì kết quả bảng đích phải hoàn toàn giống nhau, không sinh dòng trùng lặp (Idempotency). Để đạt được điều này với dữ liệu quá khứ, ta bọc lệnh Xóa (theo ngày) và lệnh Ghi vào chung một Giao dịch trọn vẹn (Transaction - thành công tất cả hoặc hủy toàn bộ). Nếu đứt gánh giữa chừng, hệ thống tự động hoàn tác (Rollback) mọi thay đổi, không để lại rác dở dang.",
    "formulaOrSyntax": "-- Xóa dữ liệu cũ trước khi nạp lô mới (Delete-before-insert)\nBEGIN TRANSACTION;\nDELETE FROM core.orders WHERE order_date = '2026-06-02';\nINSERT INTO core.orders SELECT * FROM staging_orders;\nCOMMIT;",
    "pitfall": "Dùng lệnh INSERT INTO trần thả rông. Khi hệ thống sập giữa đường, scheduler của Airflow kích hoạt chạy lại sẽ vô tư nhét thêm dữ liệu mới, làm nhân đôi toàn bộ doanh thu của ngày hôm đó một cách lặng lẽ.",
    "sourceLink": { "text": "DuckDB Transactions", "url": "https://duckdb.org/docs/stable/sql/statements/transactions" }
  },
  {
    "id": "c_preflight_checks",
    "subject": "Reliability & Ops",
    "term": "5. Chốt kiểm tra điều kiện (Pre-flight Checks)",
    "pronounceOrType": "Phòng bệnh hơn chữa bệnh lúc nửa đêm",
    "definition": "Sự cố làm sập pipeline lúc 2 giờ sáng hiếm khi do câu SQL viết sai. Thường là do: Ổ cứng đầy, file đối tác chưa gửi tới, hoặc Database đang bị một tiến trình khác khóa. Pre-flight Checks là các đoạn script chạy kiểm tra môi trường trước khi dữ liệu thực sự di chuyển, giúp phát hiện và báo lỗi ngay lập tức thay vì để hệ thống chạy 2 tiếng đồng hồ rồi mới sập.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Databand / Great Expectations\nĐánh đổi (Trade-offs): Tích hợp các tool kiểm tra dữ liệu nặng nề trước khi chạy sẽ làm tăng độ trễ (latency) của pipeline. Các Pre-flight check hiệu quả nhất lại là những lệnh kiểm tra hệ điều hành siêu rẻ: check dung lượng ổ cứng, ping thử API, check quyền ghi file.",
    "pitfall": "Bỏ qua việc kiểm tra cấu hình. Hệ thống chạy xử lý xong xuôi hết dữ liệu, đến lúc ghi kết quả ra đĩa mới phát hiện ổ cứng đã hết dung lượng từ hôm qua. Mất trắng công sức tính toán.",
    "sourceLink": { "text": "Fail-fast Principle", "url": "https://en.wikipedia.org/wiki/Fail-fast" }
  },

  /* ─────────── LÀM SẠCH & KIỂM ĐỊNH (CLEANSING & QUALITY) ─────────── */
  {
    "id": "c_defensive_cleansing",
    "subject": "Cleansing",
    "term": "6. Xử lý rác chủ động (Defensive Cleansing) & Ép kiểu an toàn (Safe Casting)",
    "pronounceOrType": "Nguyên lý đón đầu lỗi từ hệ thống nguồn",
    "definition": "Hệ thống nguồn luôn tìm cách đẩy rác vào kho: ID khách hàng bị gắn đuôi `.0` (do xuất qua Excel), tiền tệ dính dấu phẩy Châu Âu `1.234,56`. Xử lý rác chủ động là việc đoán trước các biến thể này, dùng hàm xử lý chuỗi để gọt dũa dữ liệu về chuẩn trước khi ép kiểu. Những rác ngoài tầm kiểm soát thì ép thành giá trị Rỗng (NULL) để bảo vệ pipeline khỏi lỗi sập dừng chương trình.",
    "formulaOrSyntax": "-- Công cụ mở rộng: dbt Macros / PySpark UDFs\nTrong dbt, thay vì copy-paste code dọn rác ở mọi nơi, ta gói chúng thành các Macro tái sử dụng được.\nĐánh đổi (Trade-offs): Xử lý chuỗi (regex, replace) ngốn rất nhiều CPU. Đôi khi, việc đàm phán ép hệ thống nguồn xuất file đúng chuẩn còn rẻ và hiệu quả hơn là cắm đầu gánh chi phí dọn rác ở kho.",
    "pitfall": "Xóa nhầm dấu phẩy tiền tệ (vd: xóa phẩy của `123,45` thay vì đổi thành `.`) sẽ khiến doanh thu của đơn hàng tăng vọt 100 lần. Việc dùng tính năng tự đoán kiểu (Auto-detect) cũng là tự sát: chỉ cần 0.2% dữ liệu dính đuôi `.0`, engine sẽ biến toàn bộ cột ID thành số thực (DOUBLE).",
    "sourceLink": { "text": "DuckDB Casting Rules", "url": "https://duckdb.org/docs/sql/expressions/cast" }
  },
  {
    "id": "c_cleansing_vs_validation",
    "subject": "Cleansing",
    "term": "7. Ranh giới giữa Làm sạch (Cleansing) và Kiểm định (Validation)",
    "pronounceOrType": "Đừng bao giờ tự ý sửa dữ liệu nghiệp vụ",
    "definition": "Phân định rõ ranh giới: Làm sạch (Cleansing) chỉ được phép sửa hình thức biểu diễn kỹ thuật (xóa khoảng trắng thừa, đưa chữ về viết thường, đổi định dạng ngày). Kiểm định (Validation) là bước phán xét tính đúng đắn nghiệp vụ (ví dụ: tổng tiền bị âm, trạng thái đơn hàng lạ). Kỹ sư Data KHÔNG được phép tự ý sửa các lỗi nghiệp vụ mà phải giữ nguyên trạng để đẩy vào vùng kiểm định rác.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Pydantic / Soda Data Quality\nCác tool này cho phép định nghĩa các rule Validation chặt chẽ.\nĐánh đổi (Trade-offs): Nếu bạn dùng script Python tự động biến các số tiền âm thành số 0 ở bước Cleansing, bạn đã vĩnh viễn tiêu hủy bằng chứng hệ thống nguồn bị lỗi. Khi kế toán phát hiện lệch tiền, bạn sẽ không có bằng chứng để giải thích.",
    "pitfall": "Thấy trạng thái đơn hàng là 'Unknown', kỹ sư lanh chanh viết code đổi nó thành NULL cho 'sạch'. Hậu quả là làm mất đi tín hiệu lỗi quan trọng từ hệ thống nguồn.",
    "sourceLink": { "text": "DuckDB CASE Statement", "url": "https://duckdb.org/docs/sql/expressions/case" }
  },
  {
    "id": "c_quality_gate_quarantine",
    "subject": "Quality Gate",
    "term": "8. Chốt chặn chất lượng (Quality Gate) & Tách luồng (Split Load)",
    "pronounceOrType": "Bảo vệ kho dữ liệu cốt lõi",
    "definition": "Dữ liệu thực tế luôn có 1-2% là rác. Dừng toàn bộ hệ thống chỉ vì 1% rác là thiết kế tồi. Giải pháp là Tách luồng (Split Load): Dòng sạch nạp thẳng vào bảng Core, dòng bẩn bị đẩy ra một thư mục riêng gọi là Vùng chứa rác (Quarantine) kèm lý do vì sao nó trượt. Lượng rác này chính là bằng chứng để đi đòi đối tác sửa lỗi. Bạn phải phân biệt giữa 'Rác trong mức dung sai' (Tolerated) và 'Vi phạm hợp đồng' (Violation) để quyết định xem có báo động sập dây chuyền hay không.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Dead Letter Queue (DLQ) trong Kafka / AWS SQS\nTrong hệ thống Streaming, dòng dữ liệu lỗi không làm sập pipeline mà bị tạt sang một hàng đợi riêng gọi là DLQ để xử lý sau.\nĐánh đổi (Trade-offs): Lưu trữ rác ở Quarantine tốn dung lượng đĩa và cần người dọn dẹp định kỳ. Nhưng nó đảm bảo 99% dữ liệu sạch vẫn lên báo cáo đúng giờ.",
    "pitfall": "Chỉ in thông báo lỗi ra log console rồi bỏ qua dòng dữ liệu đó. Về sau nhìn lại, bạn không thể phân biệt một pipeline 'chạy mượt mà ra 0 lỗi' với một pipeline 'chạy lỗi nhưng kỹ sư đã giấu đi'.",
    "sourceLink": { "text": "Data Contracts Quality Gate", "url": "https://datacontracts.com/" }
  },
  {
    "id": "c_executable_contracts_alert_fatigue",
    "subject": "Quality Gate",
    "term": "9. Kiểm thử tự động (Executable Contracts) & Hội chứng nhờn cảnh báo",
    "pronounceOrType": "Biến Giao ước dữ liệu thành Bộ bảo vệ chủ động",
    "definition": "Giao ước dữ liệu (Data Contract) phải được chuyển hóa thành các bài kiểm tra tự động chạy được (Executable Tests). Tuy nhiên, nếu một loại rác (như thiếu ID khách hàng do khách mua ẩn danh) vốn dĩ đã được Giao ước chấp nhận ở mức 0.05%, bạn phải đặt bài test đó là `warn` (Cảnh báo) chứ không phải `error` (Lỗi). Cảnh báo là để theo dõi, Lỗi là để dừng dây chuyền.",
    "formulaOrSyntax": "-- Công cụ mở rộng: dbt Tests / Great Expectations (GE)\nGE là thư viện khổng lồ giúp kiểm tra phân phối thống kê, định dạng regex phức tạp.\nĐánh đổi (Trade-offs): Nhồi nhét hàng chục bài test vụn vặt không mang ý nghĩa nghiệp vụ sinh tử sẽ làm pipeline đỏ rực mỗi ngày. Kỹ sư sẽ sinh ra tâm lý 'Nhờn cảnh báo' (Alert Fatigue) và phớt lờ luôn cả những cảnh báo sập nguồn thực sự.",
    "pitfall": "Tư duy đòi hỏi sự hoàn hảo 100%, thiết lập `error` cho mọi sự sai lệch dữ liệu dù là nhỏ nhất. Pipeline sập liên tục vì những dữ liệu rác thông thường. Một bộ Test lúc nào cũng báo đỏ là một bộ Test vô dụng.",
    "sourceLink": { "text": "dbt Data Tests", "url": "https://docs.getdbt.com/docs/build/data-tests" }
  },
  {
    "id": "c_gap_vs_violation",
    "subject": "Quality Gate",
    "term": "10. Lỗ hổng hợp đồng (Gap) vs. Vi phạm dữ liệu (Violation)",
    "pronounceOrType": "Luật chơi của Giao ước Dữ liệu",
    "definition": "Khi phát hiện dữ liệu bất thường, phải chiếu theo Giao ước. Lỗi bị cấm rõ ràng (Ví dụ: Tiền không được âm) ➔ Vi phạm (Violation), báo cáo đối tác sửa ngay. Lỗi do hợp đồng chưa nhắc tới (Ví dụ: Không quy định múi giờ là UTC hay Local) ➔ Lỗ hổng (Gap), bạn tự xử lý trong code của mình, sau đó làm đề xuất nâng cấp Giao ước.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Schema Registry (Kafka)\nSchema Registry ép chặt cấu trúc dữ liệu ngay từ lúc bên gửi tạo sự kiện. Sai Schema là hệ thống từ chối nhận file.\nĐánh đổi (Trade-offs): Schema Registry rất cứng nhắc, gây khó khăn khi team phát triển muốn thêm tính năng mới nhanh chóng. Việc dùng Data Contract mềm dẻo (như YAML) cho phép hệ thống linh hoạt hơn, chỉ chặn khi thực sự cần thiết.",
    "pitfall": "Lôi một cái Gap (thứ chưa từng được cam kết) ra đổ lỗi cho nhà cung cấp. Bạn sẽ cạn kiệt uy tín khi cần giải quyết các sự cố phá vỡ cam kết thực sự sau này.",
    "sourceLink": { "text": "Data Contracts Architecture", "url": "https://datacontracts.com/" }
  },
  {
    "id": "c_symptom_vs_root_cause",
    "subject": "Reliability & Ops",
    "term": "11. Triệu chứng (Symptom) vs. Nguyên nhân gốc rễ (Root Cause)",
    "pronounceOrType": "Đừng tin lời thông báo lỗi của công cụ",
    "definition": "Khi hệ thống sập, thông báo lỗi chỉ cho bạn biết 'chỗ chương trình đầu hàng', chứ không trỏ đúng 'chỗ dữ liệu bị hỏng'. Ví dụ: Công cụ đọc CSV báo lỗi 'không tìm thấy dấu phân cách' (Triệu chứng) thực ra là do bộ quét đọc trúng 1 dấu nháy kép không có dấu đóng. Nguyên nhân thật sự là hệ thống nguồn xuất file bị sập giữa chừng, làm đứt đoạn 150 dòng cuối file.",
    "formulaOrSyntax": "-- Tư duy chẩn đoán lỗi:\nLỗi ồn ào văng ra ➔ Đọc thông báo ➔ ĐỪNG sửa code vội ➔ Dùng lệnh head/tail soi nội dung vật lý của file ➔ Chốt nguyên nhân gốc.",
    "pitfall": "Thấy báo lỗi phân cách, lập tức cắm mặt vào sửa code, ép cứng delimiter vào hàm đọc file. Code rườm rà thêm mà file vẫn chết, vì bản chất file đã đứt ruột từ hệ thống nguồn.",
    "sourceLink": { "text": "datacontract CLI Testing", "url": "https://cli.datacontract.com/" }
  },
  {
    "id": "c_pii_hash_normalization",
    "subject": "Cleansing",
    "term": "12. Che giấu dữ liệu cá nhân (PII Masking) & Chuẩn hóa Hash",
    "pronounceOrType": "Bảo vệ dữ liệu cá nhân & Năng lực đếm trùng",
    "definition": "Dữ liệu định danh (PII như email, SĐT) phải được che giấu. Cách rẻ nhất là dùng hàm băm (Hash) để che nội dung nhưng vẫn giữ được khả năng nhận diện người dùng cũ. NHƯNG, hàm băm cực kỳ nhạy cảm với hình thức: `John@x.com` và `john@x.com` sẽ sinh ra 2 mã hash hoàn toàn khác biệt. Phải chuẩn hóa văn bản (đưa về chữ thường, cắt khoảng trắng) TRƯỚC KHI băm.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Tokenization Vault (HashiCorp Vault)\nCác tổ chức tài chính dùng Tokenization: Hệ thống Vault sẽ tạo một chuỗi ngẫu nhiên thay thế cho Email và cất bản gốc vào két sắt bảo mật.\nĐánh đổi (Trade-offs): Tokenization có thể dịch ngược lại bản gốc khi cần, nhưng chi phí thiết lập hạ tầng đắt đỏ hơn nhiều so với việc gọi hàm MD5/SHA256 ngay trong SQL.",
    "pitfall": "Chỉ viết `md5(email)`. Hệ thống vẫn băm ra mã, pipeline không báo lỗi, nhưng các email trùng lặp về bản chất lại không khớp mã với nhau. Bạn đã âm thầm đánh mất hoàn toàn khả năng đếm lượng khách hàng chính xác.",
    "sourceLink": { "text": "NIST De-identification", "url": "https://csrc.nist.gov/glossary/term/de_identification" }
  },

  /* ─────────── MÔ HÌNH HÓA DỮ LIỆU & KIỂU PHỨC TẠP (DATA MODELING) ─────────── */
  {
    "id": "c_explicit_schema_positional",
    "subject": "SQL & Engine",
    "term": "13. Lược đồ tường minh (Explicit Schema) & Bẫy đọc theo vị trí",
    "pronounceOrType": "Lỗi hỏng ngầm khi nguồn đổi cấu trúc",
    "definition": "Khi đọc file CSV, ta phải khai báo một bộ khung chuẩn (Explicit Schema) để công cụ khỏi đoán sai kiểu dữ liệu. Nhưng các engine thường ghép cột theo VỊ TRÍ (Cột 1, Cột 2...), ngó lơ hoàn toàn tên cột trên dòng đầu tiên (header). Nếu nhà cung cấp tự ý đảo thứ tự cột trong file, dữ liệu sẽ chạy thẳng vào sai cột.",
    "formulaOrSyntax": "-- Công cụ mở rộng: AWS Glue Crawler / Thư viện tự dò Schema\nĐánh đổi (Trade-offs): Dùng Glue Crawler tự động nhận diện cấu trúc file giúp Kỹ sư rảnh tay. Nhưng khi file rác xuất hiện, Glue sẽ tự động tạo bảng mới hoặc đổi kiểu cột làm sập các báo cáo phía sau. Khai báo Tường minh (Explicit Schema) thủ công tuy tốn công nhưng bảo vệ kho dữ liệu ở trạng thái Fail-fast (chết ngay lập tức khi file lệch chuẩn).",
    "pitfall": "Nhà cung cấp đảo cột Tiền tệ lên vị trí số 2. Cột Tiền tệ chui tọt vào cột 'Sản phẩm'. Vì cả hai đều là văn bản (VARCHAR), chương trình chạy mượt mà không văng lỗi. Lỗi làm sập script hóa ra lại dễ chịu hơn vì có còi báo để ta sửa ngay.",
    "sourceLink": { "text": "DuckDB CSV Reader", "url": "https://duckdb.org/docs/data/csv/overview" }
  },
  {
    "id": "c_three_valued_logic_null",
    "subject": "SQL Fundamentals",
    "term": "14. Logic 3 trạng thái (Three-valued Logic) & Bẫy giá trị NULL",
    "pronounceOrType": "Bản chất hàm điều kiện trong SQL",
    "definition": "Không giống Python chỉ có True/False, SQL có trạng thái thứ 3 là UNKNOWN. Bất cứ phép so sánh nào với giá trị NULL (kể cả `NULL <> 'a'`) đều trả về UNKNOWN. Khi nằm trong mệnh đề WHERE, giá trị UNKNOWN bị gạt đi y hệt như FALSE. Điều này làm lủng mọi bộ lọc chặn rác nếu không viết cẩn thận.",
    "formulaOrSyntax": "-- Khi cột status mang giá trị NULL, phép thử này trả về UNKNOWN và bỏ qua luôn:\nWHERE status NOT IN ('paid', 'cancelled') \n-- Cách viết phòng thủ: Bắt riêng trường hợp NULL\nWHERE status IS NULL OR status NOT IN ('paid', 'cancelled')",
    "pitfall": "Viết bộ lọc lỏng lẻo khiến các dòng rác (mang giá trị NULL) lặng lẽ lọt qua khe và chui thẳng vào kho dữ liệu. Kỹ sư tự tin khoe check báo 0 lỗi, nhưng kho chứa đầy rác tàng hình.",
    "sourceLink": { "text": "DuckDB NULL values", "url": "https://duckdb.org/docs/sql/data_types/nulls" }
  },
  {
    "id": "c_multi_format_timestamp_utc",
    "subject": "Cleansing",
    "term": "15. Đa định dạng Thời gian & Chuẩn hóa UTC",
    "pronounceOrType": "Chuẩn hóa trục thời gian toàn cầu",
    "definition": "Dữ liệu thời gian từ các hệ thống khác nhau đổ về đủ loại định dạng: ISO chuẩn, Ngày đứng trước (Day-first), hoặc ISO có chữ 'T'. Việc dùng các hàm thử định dạng (`try_strptime`) giúp cứu vãn những dữ liệu này thay vì đánh rớt chúng. Quy tắc tối thượng: Toàn bộ mốc thời gian trong kho dữ liệu bắt buộc phải quy về giờ phối hợp quốc tế (UTC). Việc chuyển đổi sang múi giờ địa phương chỉ được phép làm ở tầng hiển thị báo cáo.",
    "formulaOrSyntax": "-- Đánh đổi (Trade-offs):\nGiữ UTC ở tầng lõi giúp bạn dễ dàng phục vụ báo cáo cho các quốc gia khác nhau, hoặc giải quyết bài toán bù trừ giờ mùa hè (DST). Nếu bạn ép sang múi giờ Việt Nam ngay lúc nạp, bảng Fact đó vĩnh viễn bị trói buộc vào một khu vực địa lý, phá vỡ tính tái sử dụng.",
    "pitfall": "Quên ghim múi giờ UTC khi giải mã các giá trị Epoch (số giây từ năm 1970). Hệ thống sẽ âm thầm cộng/trừ thêm múi giờ của máy chủ đang chạy script, khiến toàn bộ thời gian đơn hàng bị lệch ngầm.",
    "sourceLink": { "text": "DuckDB Date Functions", "url": "https://duckdb.org/docs/sql/functions/date" }
  },
  {
    "id": "c_grain_fanout_trap",
    "subject": "Complex Types",
    "term": "16. Độ mịn dữ liệu (Grain), Bung mảng (Unnest) & Bẫy nhân trùng số liệu (Fan-out)",
    "pronounceOrType": "Nguyên lý định hình dữ liệu",
    "definition": "Độ mịn (Grain) quyết định 1 dòng của bảng đại diện cho cái gì. Khi dùng `UNNEST()` để bung 1 mảng JSON chứa 3 mặt hàng, 1 dòng Đơn hàng sẽ đẻ ra 3 dòng Chi tiết (Độ mịn đổi từ mức Đơn hàng sang mức Dòng hàng). Từ đây sinh ra cạm bẫy Fan-out: Nếu bạn tùy tiện JOIN bảng chi tiết ngược lại bảng cha, rồi `SUM` cột tổng tiền của bảng cha, con số doanh thu sẽ bị nhân lên nhiều lần.",
    "formulaOrSyntax": "-- Công cụ mở rộng: dbt Semantic Layer / Cube.dev\nĐánh đổi (Trade-offs): Semantic Layer giải quyết bẫy Fan-out bằng cách quản lý sẵn các công thức aggregations ở máy chủ trung tâm, tránh việc Analyst tự ý JOIN sai. Đổi lại, kiến trúc trở nên cồng kềnh hơn. Nếu không dùng tool, kỹ sư bắt buộc phải tính `SUM` từ đúng độ mịn của bảng con.",
    "pitfall": "Kéo cột tổng doanh thu của bảng Đơn hàng xuống bảng Dòng hàng rồi tính tổng. Báo cáo doanh thu tăng vọt hàng chục tỷ nhưng pipeline vẫn báo xanh, không có bất kỳ thông báo lỗi nào văng ra. Đổi độ mịn có chủ đích là mô hình hóa; đổi do sơ ý là phá nát số liệu.",
    "sourceLink": { "text": "DuckDB UNNEST Syntax", "url": "https://duckdb.org/docs/sql/query_syntax/unnest" }
  },
  {
    "id": "c_conservation_law_unnest",
    "subject": "Complex Types",
    "term": "17. Định luật bảo toàn số dòng khi bung mảng",
    "pronounceOrType": "Phép thử tính toàn vẹn dữ liệu",
    "definition": "Sau mọi lần thực hiện thao tác bung mảng (`UNNEST`), tổng số dòng được bung ra ở bảng chi tiết BẮT BUỘC phải bằng chính xác tổng chiều dài (số phần tử) của các mảng ở bảng nguồn ban đầu.",
    "formulaOrSyntax": "-- Cách kiểm tra bảo toàn số dòng\nSELECT (SELECT count(*) FROM core.order_items) \n     = (SELECT sum(json_array_length(items)) FROM staging.orders);",
    "pitfall": "Không kiểm tra tính bảo toàn. Các đơn hàng có mảng sản phẩm rỗng `[]` hoặc cấu trúc struct bị lỗi sẽ bị hàm UNNEST nuốt chửng âm thầm, làm hụt số liệu đơn hàng mà hệ thống không báo lỗi.",
    "sourceLink": { "text": "DuckDB JSON Functions", "url": "https://duckdb.org/docs/sql/functions/nested" }
  },
  {
    "id": "c_non_additive_measures",
    "subject": "Data Modeling",
    "term": "18. Bẫy cộng dồn (Additivity) của Thước đo tỷ lệ",
    "pronounceOrType": "Sai lầm phá nát số liệu tài chính",
    "definition": "Khi thiết kế Data Mart, các Thước đo (Measures) như Số lượng bán, Doanh thu là Additive — có thể cộng dồn thoải mái qua các tháng, các vùng. Nhưng các Thước đo Tỷ lệ (như Tỷ lệ trả hàng - Return Rate) thì TUYỆT ĐỐI KHÔNG mang tính cộng dồn. Tỷ lệ trả hàng của cả khu vực Châu Á không bao giờ là trung bình cộng tỷ lệ của từng cửa hàng (trừ phi cửa hàng nào cũng bán ra số lượng y hệt nhau).",
    "formulaOrSyntax": "-- Công cụ mở rộng: BI Tools (Tableau, PowerBI, Looker)\nĐánh đổi (Trade-offs): Đừng bao giờ tính sẵn các con số Tỷ lệ (Ratio) rồi lưu cứng vào Data Mart. Việc này chỉ giúp câu SQL trông gọn hơn, nhưng làm mất khả năng linh hoạt của Báo cáo. Hãy lưu Tử số và Mẫu số riêng biệt (vd: Tổng hàng bán, Tổng hàng trả), rồi ép người dùng cấu hình phép chia trực tiếp trên BI Tool.",
    "pitfall": "Lưu sẵn cột `return_rate` vào bảng. Nhân viên phân tích kéo thả cột này vào BI Tool và vô tư chọn hàm `AVERAGE`, hệ thống tính ra một tỷ lệ trung bình vô nghĩa, dẫn đến các quyết định kinh doanh sai lệch hoàn toàn.",
    "sourceLink": { "text": "Kimball Dimensional Modeling", "url": "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/" }
  },
  {
    "id": "c_canonical_vs_natural_key",
    "subject": "Data Modeling",
    "term": "19. Khóa chuẩn hóa hệ thống (Canonical Key) vs. Khóa tự nhiên (Natural Key)",
    "pronounceOrType": "Phòng thủ rủi ro khi nguồn đổi định dạng Khóa",
    "definition": "Khóa của nguồn cấp cho bạn gọi là Khóa Tự nhiên. Hôm nay là số `123`, ngày mai nhà cung cấp đổi thành chuỗi `'ORD-123'`. Nếu đem khóa thô này đi JOIN với dữ liệu lịch sử, hệ thống sẽ gãy. Thay vì tạo một Khóa đại diện nhân tạo (Surrogate Key) từ đầu, thực chiến nhất là giữ lại bản gốc để làm bằng chứng, đồng thời tự cắt gọt chuỗi để sinh ra một bản số nguyên sạch sẽ (Canonical Key) dùng riêng cho nội bộ kho dữ liệu.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Khóa đại diện bằng băm Hash (Surrogate Keys)\nCác framework như dbt hỗ trợ tạo Khóa đại diện bằng hàm băm (vd: `dbt_utils.generate_surrogate_key`).\nĐánh đổi (Trade-offs): Khóa băm Hash giúp hệ thống miễn nhiễm hoàn toàn với định dạng của Khóa tự nhiên. Nhưng cái giá phải trả là tốn chi phí CPU để băm cho hàng triệu dòng mỗi khi nạp dữ liệu. Canonical Key (ép kiểu đơn giản) là điểm cân bằng tốt hơn.",
    "pitfall": "Cố chấp JOIN chuỗi `'ORD-123'` với con số `123`. Kết quả không khớp dòng nào. Các bản cập nhật gửi trễ (late-arriving) bị hệ thống tưởng là đơn hàng mới, lặng lẽ nhân đôi doanh thu.",
    "sourceLink": { "text": "Kimball Surrogate Keys", "url": "https://www.kimballgroup.com/1998/05/surrogate-keys/" }
  },
  {
    "id": "c_canonical_aligner_schema_drift",
    "subject": "Data Modeling",
    "term": "20. Lớp chuẩn hóa cấu trúc (Canonical Aligner) & Trôi dạt lược đồ (Schema Drift)",
    "pronounceOrType": "Chiến lược gom lịch sử khi nguồn tự đổi hình dạng",
    "definition": "Nhà cung cấp tự ý đổi cấu trúc file, thêm bớt cột liên tục (Schema Drift). Thay vì bắt các bảng báo cáo phía sau phải gồng gánh logic kiểm tra IF-ELSE phức tạp, hãy dựng một lớp dịch mỏng (Canonical Aligner) ngay tại cửa nạp. Lớp này làm nhiệm vụ nắn mọi phiên bản cũ/mới về chung một khuôn chuẩn duy nhất trước khi đưa vào lõi.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Fivetran Schema Evolution\nCác tool ELT tự động có tính năng tự nhận diện cột mới và thêm vào Database.\nĐánh đổi (Trade-offs): Tự động hóa giúp Kỹ sư nhàn rỗi, nhưng cột tự động thêm vào có thể làm vỡ logic các bảng Report phía sau. Lớp Canonical Aligner viết bằng tay SQL tuy tốn công bảo trì, nhưng giúp Kỹ sư kiểm soát 100% hình dáng dữ liệu lọt vào kho.",
    "pitfall": "Gom chung logic dịch Schema (thêm/bớt cột) vào cùng một hàm với logic Dọn dẹp giá trị (Cleansing). Bạn sẽ phải chép bộ luật dọn dẹp làm 3 bản cho 3 thời kỳ; quên cập nhật 1 bản là số liệu lệch nhau.",
    "sourceLink": { "text": "SQLMesh Model Kinds", "url": "https://sqlmesh.readthedocs.io/en/stable/concepts/models/model_kinds/" }
  },
  {
    "id": "c_known_vs_unknown_default",
    "subject": "Data Modeling",
    "term": "21. Luật điền dữ liệu khuyết (Known vs. Unknown Default)",
    "pronounceOrType": "Nguyên tắc vá lỗ hổng lịch sử",
    "definition": "Khi dải dữ liệu cũ bị thiếu một cột mới được thêm vào ở hiện tại, bạn điền gì? Luật chốt: Chỗ thiếu mà mình BIẾT CHẮC sự thật lịch sử thì điền giá trị cứng (Ví dụ: Thời kỳ đầu chưa có chương trình giảm giá, chắc chắn điền `discount = 0`). Chỗ thiếu do lịch sử không ai đo đạc (Ví dụ: Không lưu thiết bị mua hàng) thì mới được để NULL.",
    "formulaOrSyntax": "-- Biết chắc lịch sử chưa có tính năng này ➔ Điền 0\ndiscount_amount = 0\n-- Cột UTM kênh bán (không ai đo) ➔ Điền NULL\nchannel = NULL",
    "pitfall": "Lười biếng điền NULL cho mọi cột thiếu. Khi bảng tính chạy lệnh `doanh_thu = tổng - giảm_giá (NULL)`, toán hạng chứa NULL sẽ làm toàn bộ biểu thức hóa NULL, âm thầm gạt sạch doanh thu của các năm lịch sử.",
    "sourceLink": { "text": "Delta Lake Schema Update", "url": "https://docs.delta.io/latest/delta-batch.html#automatic-schema-update" }
  },
  {
    "id": "c_bitemporality_late_arriving",
    "subject": "Data Modeling",
    "term": "22. Xung đột mốc thời gian (Bi-temporality) & Dữ liệu đến trễ",
    "pronounceOrType": "Phân định thời gian Sự kiện và thời gian Nạp",
    "definition": "Hệ thống luôn có hai mốc thời gian: Lúc sự kiện thực sự xảy ra (Event Time) và lúc hệ thống nhận được file (Arrival Time). Đơn hàng phát sinh hôm qua bị đẩy muộn vào file ngày hôm nay là chuyện bình thường. Khi đối soát để tìm ra trạng thái mới nhất của đơn hàng, quyền quyết định phải thuộc về mốc thời gian sự kiện (`updated_at`), tuyệt đối không được dùng mốc thời gian nhận file.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Apache Hudi (Streaming Data Lake)\nHudi chuyên xử lý Upsert các luồng dữ liệu cập nhật liên tục trực tiếp trên Lake.\nĐánh đổi (Trade-offs): Hudi cập nhật bản ghi trễ rất tốt, nhưng các file trên Lake sẽ bị phân mảnh nhỏ li ti (Small files problem), tốn công chạy các job dọn dẹp (Compaction). Ghi thô dạng Append-only kết hợp khử trùng lặp lúc đọc (Read-time dedupe) là cách làm đơn giản và bảo toàn được lịch sử thay đổi.",
    "pitfall": "Dùng lệnh ghi đè (OVERWRITE) thư mục của ngày hôm nay. Dữ liệu gửi bù của ngày hôm qua chui vào thư mục hôm nay sẽ xóa trắng toàn bộ dữ liệu lịch sử của ngày hôm qua.",
    "sourceLink": { "text": "Martin Fowler Bitemporal", "url": "https://martinfowler.com/articles/bitemporal-history.html" }
  },

  /* ─────────── CHIẾN LƯỢC NẠP & LƯU TRỮ (LOAD & STORAGE) ─────────── */
  {
    "id": "c_load_strategy_tradeoffs",
    "subject": "Pipeline Lifecycle",
    "term": "23. Đánh đổi chiến lược nạp: Làm mới theo cửa sổ (Window Refresh) vs. Cập nhật chèn (Upsert)",
    "pronounceOrType": "Quyết định chuyển chi phí tính toán",
    "definition": "Làm sao nạp các bản sửa đổi gửi trễ vào kho? Upsert (MERGE) đi tìm và cập nhật trực tiếp dòng cũ, ghi rất nhanh, nhưng file Parquet trên Lake là bất biến (không sửa được từng dòng). Window Refresh: Xóa nguyên cụm dữ liệu theo cửa sổ ngày (ví dụ `[D-7, D]`) rồi ghi mới lại từ đầu. Chấp nhận tốn I/O ghi đè lặp lại dữ liệu, để đổi lấy bảng trên đĩa luôn sạch, tốc độ truy vấn nhanh nhất và tương thích hoàn hảo với Data Lake.",
    "formulaOrSyntax": "-- Công cụ mở rộng: dbt Incremental Strategy\nTrong dbt, bạn không cần tự viết SQL, chỉ cần khai báo `incremental_strategy = 'delete+insert'` hoặc `'merge'`.\nĐánh đổi (Trade-offs): Window Refresh (Xóa-Ghi) thì tốn I/O đĩa lúc ghi nhưng đọc cực nhanh. Upsert (Merge) thì ghi nhanh nhưng đọc chậm do dữ liệu bị phân mảnh. Bạn phải chọn ưu tiên Tốc độ Ghi hay Tốc độ Đọc.",
    "pitfall": "Đặt cửa sổ nạp (Window) hẹp đúng 1 ngày `[D, D]` cho nhanh. Các bản sửa đổi của đơn hàng gửi trễ rơi vào phân vùng `D-3` sẽ không bao giờ được quét tới. Đơn hàng kẹt luôn ở trạng thái cũ rích.",
    "sourceLink": { "text": "dbt Incremental Models", "url": "https://docs.getdbt.com/docs/build/incremental-strategy" }
  },
  {
    "id": "c_reconciliation_vs_count",
    "subject": "Quality Gate",
    "term": "24. Đối soát nội dung (Reconciliation) vs. Đếm dòng thuần túy",
    "pronounceOrType": "Phép kiểm tra ngoại trừ hai chiều",
    "definition": "Lệnh đếm `count(*)` chỉ trả lời câu 'Có đủ số lượng không?', nó hoàn toàn câm điếc trước câu hỏi 'Nội dung bên trong có đúng không?'. Việc thiết lập sai cửa sổ nạp có thể làm 5000 đơn hàng kẹt ở trạng thái cũ, nhưng tổng số dòng đếm được vẫn khớp y hệt. Muốn đối soát độ chính xác tuyệt đối, phải dùng lệnh trừ chéo nội dung (EXCEPT) theo cả hai chiều.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Datafold / dbt-audit-helper\nDatafold là nền tảng so sánh dữ liệu tự động cho phép Diff hàng tỷ dòng để tìm ra chênh lệch giá trị.\nĐánh đổi (Trade-offs): Phép toán EXACT Diff (So sánh giá trị từng cột) cực kỳ ngốn tài nguyên Compute và chạy rất chậm so với việc chỉ đếm số lượng dòng. Chỉ nên dùng khi thực hiện thay đổi cấu trúc diện rộng (Refactor).",
    "pitfall": "Dừng lại và ăn mừng khi thấy đếm số lượng dòng hai bên khớp nhau. Thực tế sai lệch cấu trúc ngầm bên trong vẫn chui thẳng ra báo cáo sản xuất.",
    "sourceLink": { "text": "dbt-audit-helper", "url": "https://github.com/dbt-labs/dbt-audit-helper" }
  },
  {
    "id": "c_parquet_pruning_zone_maps",
    "subject": "Storage & Pruning",
    "term": "25. Kiến trúc Parquet & Các tầng bỏ qua dữ liệu (Pruning)",
    "pronounceOrType": "Đọc nhanh nhất là không cần đọc",
    "definition": "Đọc dữ liệu cực nhanh nhờ 3 cách né việc của Engine: 1. Partition Pruning (Lọc đúng thư mục chứa ngày cần tìm, không mở file thừa). 2. Zone Maps (Mỗi khối dữ liệu Parquet tự lưu giá trị Min/Max, engine thấy giá trị cần tìm nằm ngoài Min/Max sẽ nhảy cóc qua khối đó). 3. Column Projection (Chỉ giải mã đúng cột được gọi tên). Kết hợp lại, lượng I/O giảm hàng trăm lần so với quét CSV.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Apache Parquet\nParquet là định dạng lưu trữ dạng cột (Columnar format) tiêu chuẩn của mọi Data Lake hiện đại.\nĐánh đổi (Trade-offs): Định dạng cột giải quyết xuất sắc bài toán phân tích (OLAP) quét nhiều dòng ít cột. Nhưng nó cực kỳ chậm trong việc ghi hoặc cập nhật một bản ghi đơn lẻ (OLTP).",
    "pitfall": "Bọc cột dùng làm partition vào một hàm xử lý chuỗi (ví dụ: `strftime(order_date, '%Y')`). Việc này làm bộ tối ưu hóa bị mù, ép hệ thống phải mở toàn bộ các file trên đĩa lên để định dạng lại từng dòng. Lệnh `SELECT *` cũng tự tay tắt mất tính năng lấy đúng cột cần thiết.",
    "sourceLink": { "text": "Apache Parquet File Format", "url": "https://parquet.apache.org/docs/file-format/" }
  },
  {
    "id": "c_physical_sort_row_group",
    "subject": "Storage & Pruning",
    "term": "26. Sắp xếp vật lý (Physical Sort) & Kích thước khối dữ liệu (Row Group)",
    "pronounceOrType": "Hai núm vặn lúc ghi đánh thuế mọi lần đọc",
    "definition": "Cơ chế nhảy cóc Zone Map chỉ hiệu quả nếu dữ liệu đã được gom cụm (ORDER BY) ngay từ lúc ghi file. Đánh đổi: Về mặt vật lý, bạn chỉ sắp xếp tuyến tính được theo 1 chiều. Sắp theo Cửa hàng thì lọc cửa hàng cực nhanh, nhưng vô dụng với truy vấn lọc theo Khách hàng. Núm vặn thứ hai là Kích thước khối (Row Group): Cắt khối quá nhỏ (vd 5000 dòng) sẽ sinh ra hàng ngàn khối, khiến phần phí đọc mục lục của mỗi khối trở thành gánh nặng đánh thuế lên mọi câu truy vấn về sau.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Z-Ordering trong Apache Iceberg / Delta Lake\nTable Format hiện đại dùng Z-Ordering để sắp xếp dữ liệu đan xen đa chiều, lách luật giới hạn 1 chiều vật lý.\nĐánh đổi (Trade-offs): Z-Ordering ngốn cực kỳ nhiều CPU và thời gian tại thời điểm ghi file. Việc gom cụm tuyến tính truyền thống ưu tiên cho đúng 1 bộ lọc 'nóng' nhất vẫn là cách làm rẻ và thực chiến.",
    "pitfall": "Đặt kích thước khối quá nhỏ cho một pipeline Batch chạy ban đêm. Nhóm nhỏ chỉ đúng khi hệ thống cần ghi liên tục theo lô siêu nhỏ (Streaming) và cần độ trễ thấp; dùng sai chỗ sẽ bóp nghẹt tốc độ đọc toàn bảng mãi mãi về sau.",
    "sourceLink": { "text": "Z-Ordering in Delta Lake", "url": "https://docs.delta.io/latest/optimizations-oss.html#z-ordering-multi-dimensional-clustering" }
  },
  {
    "id": "c_torn_read_atomic_swap",
    "subject": "Reliability & Ops",
    "term": "27. Lỗi đọc dữ liệu đang ghi dở (Torn Read) & Tráo đổi thư mục tức thì (Atomic Swap)",
    "pronounceOrType": "Xuất bản dữ liệu trên File không gây gián đoạn",
    "definition": "Ghi đè file trên Data Lake không có cơ chế bảo vệ như trong Database. Quá trình xóa file cũ và ghi file mới tốn vài phút. Nếu người dùng truy vấn đúng vào khoảng thời gian đó (Torn Read), họ sẽ nhận về kết quả rỗng. Kỹ thuật Atomic Swap giải quyết bằng cách: Dựng bản dữ liệu mới ở thư mục tạm (khuất tầm nhìn), cất bản cũ vào thùng rác, rồi dùng lệnh đổi tên (Rename) của hệ điều hành để tráo bản mới vào. Lệnh Rename chỉ sửa mục lục cấp OS nên tốn vài mili-giây.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Iceberg Snapshots (Apache Iceberg)\nIceberg giải quyết Torn Read triệt để bằng cách không tráo đổi thư mục vật lý, mà dùng file `metadata.json` để chỉ định danh sách file thuộc phiên bản hiện hành.\nĐánh đổi (Trade-offs): Thiết lập Iceberg cồng kềnh hơn nhiều so với việc viết script Atomic Swap đổi tên thư mục thuần túy. Atomic swap tiện nhưng vẫn có khoảng hở vài mili-giây giữa các lệnh rename.",
    "pitfall": "Đặt thư mục tạm ngay bên trong thư mục đang phục vụ. Trình đọc quét file theo dấu sao (wildcard) sẽ vơ luôn cả file tạm vào, nhân đôi doanh thu trong im lặng.",
    "sourceLink": { "text": "Iceberg Snapshots", "url": "https://iceberg.apache.org/spec/#snapshots" }
  },
  {
    "id": "c_race_condition_lake",
    "subject": "Storage & Pruning",
    "term": "28. Xung đột ghi chéo (Race Condition) trên Data Lake",
    "pronounceOrType": "Nguy cơ đâm xe khi không có khóa bảo vệ",
    "definition": "Vì sao không cho nhiều Worker chạy song song ghi thẳng vào chung một thư mục ngày trên Data Lake? Do dữ liệu đến trễ, file của ngày D có chứa bản cập nhật đơn hàng của ngày D-7. Nếu Worker A đang xử lý file ngày D, và Worker B xử lý ngày D-3, cả hai sẽ cùng lúc tạo file đè vào thư mục của ngày `D-7`. File System không có khái niệm Khóa bảo vệ (Lock) như Database.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Optimistic Concurrency Control (OCC) trong Iceberg\nIceberg dùng OCC để giải quyết Xung đột ghi chéo. Worker cứ ghi file thoải mái, ai update file `metadata.json` trước thì thắng, người thua phải đọc lại và thử lại.\nĐánh đổi (Trade-offs): Cài đặt Table Format phức tạp. Ở Data Lake thuần, giải pháp an toàn nhất là thiết kế Scatter-Gather: Bắt mỗi Worker sinh ra 1 file định danh UUID riêng biệt ở thư mục riêng, rồi mới gom lại.",
    "pitfall": "Cứ thấy API hỗ trợ ghi phân vùng (Partition) là quăng vào chạy đa luồng. Worker 1 ghi xong dữ liệu, Worker 2 tới sau ghi file trùng tên mặc định lặng lẽ đè nát kết quả của Worker 1.",
    "sourceLink": { "text": "DuckDB Partitioned Writes", "url": "https://duckdb.org/docs/data/partitioning/partitioned_writes" }
  },
  {
    "id": "c_single_writer_lock",
    "subject": "Reliability & Ops",
    "term": "29. Khóa ghi độc quyền (Single-Writer Lock)",
    "pronounceOrType": "Tránh tranh chấp ghi trong môi trường Database nhúng",
    "definition": "Các database server (như Postgres, Snowflake) có hệ thống trung tâm để điều phối hàng ngàn kết nối đọc/ghi cùng lúc. Nhưng các database nhúng (như DuckDB, SQLite) chạy trực tiếp trong script của bạn thì bảo vệ dữ liệu bằng cách khóa hẳn file ở tầng hệ điều hành: Đã có một tiến trình mở để ghi, mọi tiến trình khác lập tức bị chặn. Do đó, kiến trúc bắt buộc phải tách ra: Các tiến trình con tự xử lý dữ liệu và xả file rời rạc, sau đó đúng một tiến trình duy nhất mở Database lên để gom tất cả vào.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Snowflake Cloud Data Warehouse vs. DuckDB\nSnowflake tách rời Storage và Compute, hỗ trợ Multi-cluster ghi dữ liệu đồng thời vào cùng một bảng không bị khóa.\nĐánh đổi (Trade-offs): DuckDB miễn phí, chạy siêu tốc trên 1 node nhưng bị trói buộc bởi Khóa ghi độc quyền. Snowflake giải quyết concurrency rất tốt nhưng tốn chi phí Cloud đắt đỏ.",
    "pitfall": "Thấy DuckDB chạy nhanh nên cho 8 worker cùng chạy lệnh INSERT thẳng vào Warehouse. Hệ thống chết ồn ào ngay lập tức với lỗi `IOException`. Khóa độc quyền này thực chất là món quà bảo vệ file database khỏi bị hỏng vật lý (corruption).",
    "sourceLink": { "text": "DuckDB Concurrency", "url": "https://duckdb.org/docs/stable/connect/concurrency" }
  },

  /* ─────────── TỐI ƯU HIỆU NĂNG, SONG SONG HÓA & ĐO LƯỜNG ─────────── */
  {
    "id": "c_resource_overcommit_oversubscription",
    "subject": "Reliability & Ops",
    "term": "30. Cấp khống tài nguyên CPU và RAM (Oversubscription & Overcommit)",
    "pronounceOrType": "Nghẽn cổ chai cấp độ Hệ điều hành",
    "definition": "Máy tính không tự to ra chỉ vì bạn gọi thêm tiến trình xử lý song song. 1. Cấp khống CPU: Nhét 64 luồng vào máy 8 lõi không làm nó nhanh gấp 8, nó chỉ khiến hệ điều hành tốn sức chuyển đổi qua lại, CPU ghim 100% nhưng chạy chậm rì. 2. Cấp khống RAM: Cấp cấu hình 12GB cho 8 worker là tự hứa 96GB trên cái máy 16GB. Khi RAM đầy, máy sẽ ép tráo dữ liệu ra ổ cứng (Swapping), đĩa quay liên tục và máy chết đứng.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Kubernetes (K8s) Requests & Limits\nTrong K8s, Kỹ sư cấu hình `requests` (RAM/CPU tối thiểu đảm bảo) và `limits` (Ngưỡng tối đa được dùng).\nĐánh đổi (Trade-offs): K8s bảo vệ cụm server bằng cách hy sinh các Pod vi phạm (bắn lỗi OOMKilled và chém ngay lập tức). Tự chạy script trần trên server vật lý giúp tận dụng tối đa phần cứng nhưng đối diện rủi ro máy treo ngầm không báo lỗi.",
    "pitfall": "Quên khai báo trần bộ nhớ tối đa, các tiến trình âm thầm dùng mức mặc định (thường là 80% RAM máy tính/tiến trình). Pipeline sụp đổ mà không để lại bất kỳ dòng log lỗi nào.",
    "sourceLink": { "text": "DuckDB Memory Management", "url": "https://duckdb.org/docs/stable/guides/performance/how_to_tune_workloads" }
  },
  {
    "id": "c_data_skew_straggler",
    "subject": "Reliability & Ops",
    "term": "31. Lệch tải (Data Skew) & Vấn đề nút thắt tác vụ chậm (Straggler)",
    "pronounceOrType": "Chiến lược phân bổ công việc (Load Balancing)",
    "definition": "Dữ liệu thực tế không bao giờ chia đều. Một ngày sale lớn to gấp 3 ngày thường. Khi chạy song song, nếu bạn quăng việc ngẫu nhiên, ngày to nhất có thể rớt xuống chạy cuối cùng. Khi đó, 7 lõi CPU chạy xong sớm sẽ ngồi chơi xơi nước nhìn 1 lõi cày cục nốt cục dữ liệu khổng lồ. Thời gian cả nhóm bị kéo tụt bởi kẻ chậm tiến nhất này.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Apache Spark Dynamic Allocation / Salting\nSpark xử lý Lệch tải bằng kỹ thuật Thêm muối (Salting) hoặc cắt nhỏ task to ra rải đều cho các node.\nĐánh đổi (Trade-offs): Spark xử lý Skew cực kỳ xịn nhưng đánh đổi bằng việc vận hành cụm phân tán phức tạp. Ở Python thuần, đơn giản nhất là xếp việc to nhất lên chạy đầu tiên (Biggest-first) để các việc nhỏ tự lấp vào khoảng hở phía sau.",
    "pitfall": "Mù quáng nhồi thêm Worker với ảo tưởng máy sẽ chạy nhanh tuyến tính. Việc tăng từ 4 lên 8 tiến trình sẽ không giúp bạn về đích sớm hơn nếu bạn không giải quyết được cục bướu nằm ở cuối hàng đợi.",
    "sourceLink": { "text": "Multiprocessing Best Practices", "url": "https://docs.python.org/3/library/multiprocessing.html" }
  },
  {
    "id": "c_amdahls_law",
    "subject": "Reliability & Ops",
    "term": "32. Định luật Amdahl về giới hạn xử lý song song",
    "pronounceOrType": "Tìm đúng nút thắt cổ chai",
    "definition": "Định luật Amdahl chỉ ra: Tốc độ tối đa của một hệ thống bị khóa chặt bởi phần việc BẮT BUỘC phải chạy tuần tự. Ví dụ: Pha làm sạch chạy song song tốn 200 giây. Nhưng pha gom dữ liệu bắt buộc chạy 1 tiến trình tốn tới 400 giây. Dù bạn có siêu máy tính để ép pha làm sạch chạy trong 0 giây, tổng thời gian không bao giờ lặn xuống dưới mức 400 giây.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Dask / Ray Frameworks\nMuốn phá vỡ giới hạn này, phải dùng các framework Distributed Computing (như Dask, Ray) để phân tán pha gom dữ liệu trên nhiều máy.\nĐánh đổi (Trade-offs): Tốn tài nguyên quản lý mạng giao tiếp giữa các máy (network overhead), code phức tạp hơn gấp nhiều lần so với đa tiến trình cục bộ.",
    "pitfall": "Đổ thêm tiền mua máy nhiều lõi hơn khi chưa tìm ra nút thắt. Thay vì bắt engine sắp xếp toàn cục hàng chục triệu dòng (`PARTITION BY order_id`), hãy thu hẹp phạm vi gom nhóm xuống cấp nhỏ hơn (`PARTITION BY order_date, order_id`). Sửa 1 câu SQL rẻ hơn mua 1 con server.",
    "sourceLink": { "text": "Amdahl's Law", "url": "https://en.wikipedia.org/wiki/Amdahl%27s_law" }
  },
  {
    "id": "c_use_method_monitoring",
    "subject": "Reliability & Ops",
    "term": "33. Phương pháp đo lường USE & Bẫy công cụ giám sát",
    "pronounceOrType": "Chẩn đoán đúng chỗ nghẽn thay vì đoán mò",
    "definition": "Khi pipeline chạy chậm, hệ thống thường đang bị nghẽn ở một trong các tài nguyên: CPU, RAM, I/O ổ đĩa, hoặc dung lượng đĩa (theo phương pháp USE của Brendan Gregg). Phải dùng script đo lường để tìm nút thắt. Tuy nhiên, tự viết script đo lường rất dễ sai: Nếu pipeline chạy nhiều tiến trình con, chỉ đo tiến trình cha sẽ không thấy lượng RAM thực tế bị ngốn. Hàm đo CPU cũng hay báo 0% nếu đối tượng đo không được lưu trữ (cache) qua các vòng lặp để lấy lịch sử.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Prometheus & Grafana vs. Tự viết Sampler (psutil)\nĐánh đổi (Trade-offs): Prometheus vẽ biểu đồ hệ thống rất chuyên nghiệp nhưng tần suất lấy mẫu thường thưa (10-15s/lần), rất dễ bỏ sót các đợt tăng tải chớp nhoáng của các batch job. Tự viết sampler bằng Python cho phép đo sát từng nửa giây, nhưng bạn phải tự lo khâu lưu trữ log và truy vấn.",
    "pitfall": "Thấy pipeline chậm, lập tức đi tối ưu thuật toán hoặc thêm luồng (threads) xử lý. Trong khi thực tế hệ thống đang nghẽn I/O ổ đĩa (mất thời gian chờ đọc file). Bỏ ra vài giờ sửa code không giải quyết được nút thắt thực sự.",
    "sourceLink": { "text": "Brendan Gregg — The USE Method", "url": "https://www.brendangregg.com/usemethod.html" }
  },
  {
    "id": "c_clean_oom_vs_swapping",
    "subject": "Reliability & Ops",
    "term": "34. Tràn RAM có kiểm soát (Clean OOM) vs. Treo máy ngầm (Swapping)",
    "pronounceOrType": "Cơ chế phản ứng của hệ thống khi cạn RAM",
    "definition": "Khi khối lượng dữ liệu lớn hơn RAM, hệ thống có hai cách phản ứng. Xấu xí: Các thư viện mặc định như Pandas sẽ nạp dữ liệu cho đến khi cạn RAM. Lúc này, hệ điều hành buộc phải đẩy bớt bộ nhớ xuống ổ cứng (Swapping/Paging), làm máy chậm đi rõ rệt rồi treo hẳn mà không văng ra log lỗi nào. Sạch sẽ: Các engine chuyên dụng cho phép đặt trần bộ nhớ cứng (`memory_limit`). Khi chạm trần, chúng sẽ chủ động ghi file tạm ra đĩa để xử lý tiếp, hoặc ném thẳng lỗi `OutOfMemory`. Máy báo lỗi nhưng OS vẫn an toàn.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Kubernetes OOMKilled vs. Engine memory_limit\nĐánh đổi (Trade-offs): K8s dùng `resources.limits` là giới hạn cứng của Cụm: Tiến trình vượt mức sẽ bị K8s chém ngay lập tức kèm lỗi OOMKilled để bảo vệ máy chủ (Job sập). Giới hạn mềm của App: Chạm trần thì tự tản nhiệt ra đĩa (Job hoàn thành, nhưng chạy chậm do I/O đĩa).",
    "pitfall": "Tự tin mở file dữ liệu chục GB bằng Pandas trên máy chủ dùng chung. Script không báo lỗi gì nhưng lặng lẽ vắt kiệt RAM, hệ điều hành phải swap liên tục, kéo sập tốc độ của tất cả các dịch vụ khác đang chạy chung.",
    "sourceLink": { "text": "Kubernetes Resource Limits", "url": "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/" }
  },
  {
    "id": "c_out_of_core_os_illusions",
    "subject": "Reliability & Ops",
    "term": "35. Xử lý tràn đĩa (Out-of-Core) & Ảo giác dung lượng của hệ điều hành",
    "pronounceOrType": "Đem ổ cứng ra đổi lấy RAM",
    "definition": "Kỹ thuật Out-of-Core chia nhỏ dữ liệu, xử lý đến đâu xả rác tạm (spill) ra ổ đĩa đến đó rồi gom lại. Chạy chậm hơn nhưng chắc chắn xong. Bẫy đo lường: Trên hệ thống Windows, khi bạn mở thư mục để xem xả rác bao nhiêu GB, Windows báo 0 KB. Vì hệ điều hành cực kỳ lười, nó chỉ cập nhật dung lượng khi tiến trình ĐÓNG file. Vì database giữ file mở liên tục trong lúc truy vấn, bạn sẽ bị hệ điều hành đánh lừa.",
    "formulaOrSyntax": "-- CÁCH ĐÚNG: Đừng tin giao diện hệ điều hành, hãy hỏi trực tiếp sổ sách của Engine\nSELECT path, size FROM duckdb_temporary_files();",
    "pitfall": "Để mặc định thư mục xả rác của engine. Nó lặng lẽ xả 40GB rác làm đầy nghẹt ổ hệ điều hành C:, kéo sập toàn bộ máy chủ (log ngừng ghi, đứt kết nối remote). Phải luôn ghim thư mục rác ra ổ đĩa lưu trữ lớn.",
    "sourceLink": { "text": "DuckDB Out-of-Core Workloads", "url": "https://duckdb.org/docs/stable/guides/performance/how_to_tune_workloads" }
  },
  {
    "id": "c_benchmark_hygiene_os_cache",
    "subject": "Reliability & Ops",
    "term": "36. Kỷ luật đo lường (Benchmark Hygiene) & Hiện tượng OS Cache",
    "pronounceOrType": "Tránh để số liệu nói dối",
    "definition": "Đo thời gian chạy tổng thường không nhất quán vì hệ điều hành luôn tự động lưu đệm file vừa đọc vào RAM (OS Cache). Lần chạy thứ 2 luôn nhanh hơn lần 1 dù code không đổi. Kỷ luật đo lường chuẩn mực yêu cầu: 1. Chạy mồi 1 lần để trả phí đĩa lạnh (Cold cache). 2. Đo 3 lần sau lấy trung vị (Median). 3. Kéo hẳn kết quả về (`fetchall`), nếu không bạn chỉ đang đo thời gian khởi động của lệnh. Tuy nhiên, thước đo chân lý nhất vẫn là Số byte thực sự phải quét trên đĩa (I/O Volume), vì thời gian có thể lừa bạn, nhưng số byte thì không.",
    "formulaOrSyntax": "-- Công cụ mở rộng: eBPF / iostat vs. hàm io_counters()\nĐánh đổi (Trade-offs): `eBPF` cho độ chi tiết I/O cực cao tận tầng lõi hệ điều hành nhưng đòi quyền root và setup phức tạp. Dùng hàm `io_counters()` của thư viện hệ thống là điểm cân bằng hoàn hảo: đủ sâu để biết tiến trình đã quét bao nhiêu byte, dễ nhúng thẳng vào code.",
    "pitfall": "Vừa sửa vài dòng SQL, chạy lại lần 2 thấy số giây giảm một nửa, liền hớn hở báo cáo sếp là đã tối ưu code xịn. Sự thật là bạn chỉ đang đo tốc độ đọc file từ RAM do OS Cache hỗ trợ. Nếu I/O Volume không giảm, thuật toán của bạn không hề tốt lên.",
    "sourceLink": { "text": "DuckDB Profiling & Explain Analyze", "url": "https://duckdb.org/docs/stable/guides/meta/explain_analyze" }
  },
  {
    "id": "c_finops_right_sizing",
    "subject": "Reliability & Ops",
    "term": "37. Tối ưu cấu hình vừa đủ (Right-Sizing) & Bài toán chi phí (FinOps)",
    "pronounceOrType": "Chuyển hóa tối ưu thành Tiền",
    "definition": "Trên nền tảng Cloud, cấp dư RAM hay CPU đều bị tính tiền thực tế. Tối ưu hệ thống không chỉ là code cho chạy nhanh, mà là kỹ thuật Right-sizing: Giảm dần mức cấp phát RAM để tìm ra mức cấu hình thấp nhất mà job vẫn chạy xong với thời gian trong giới hạn cho phép. Khi tìm được cấu hình vừa đủ, bước cuối cùng là phải quy đổi mức tiết kiệm tài nguyên đó thành số tiền tiết kiệm được mỗi năm.",
    "formulaOrSyntax": "-- Công cụ mở rộng: AWS Compute Optimizer / Karpenter (K8s)\nKarpenter tự động theo dõi và đổi máy ảo nhỏ hơn để tiết kiệm chi phí.\nĐánh đổi (Trade-offs): Auto-scaler giải quyết việc cấp phát động rất tốt nhưng chúng phản ứng có độ trễ và khó chốt ngân sách từ đầu tháng. Kỹ sư tự Right-sizing ngay trong cấu hình job giúp chốt cứng baseline chi phí, dễ báo cáo ngân sách hơn.",
    "pitfall": "Chỉ dừng ở việc khoe code chạy nhanh hơn. Cấp quản lý không quan tâm số mili-giây, cái họ cần là con số chi phí tiết kiệm được để quyết định xem có nên rót ngân sách cho đội Data tiếp tục tái cấu trúc (refactor) hệ thống hay không.",
    "sourceLink": { "text": "AWS Compute Optimizer", "url": "https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html" }
  },
  {
    "id": "c_performance_tuning_loop",
    "subject": "Reliability & Ops",
    "term": "38. Vòng lặp tối ưu: Đo đạc ➔ Xếp hạng ➔ Gọt giũa",
    "pronounceOrType": "Kỷ luật của kỹ sư hệ thống",
    "definition": "Khi một pipeline chạy chậm, lỗi 'xấu xí' nhất chưa chắc đã là lỗi tốn thời gian nhất. Một lệnh DISTINCT thừa có thể chỉ tốn 0.5 giây, trong khi một vòng lặp nhạt nhẽo lại ngốn tới 70 giây. Kỷ luật tối ưu là: Dùng đồng hồ đo thời gian từng bước, xếp hạng điểm nghẽn, và chỉ tập trung cắt gọt phần tốn nhiều thời gian nhất.",
    "formulaOrSyntax": "-- CÁCH SỬA SAI: Bỏ ra cả tuần để tối ưu 1 bước 0.3s nhanh gấp 100 lần (Chỉ tiết kiệm được 0.3s).\n-- CÁCH SỬA ĐÚNG: Bỏ ra 1 giờ để làm cái bước 70s nhanh gấp 2 lần (Tiết kiệm tới 35s).",
    "pitfall": "Tối ưu dựa trên cảm tính hoặc học thuộc lòng các danh sách mẹo vặt. Kết quả là làm cho đoạn code phụ chạy nhanh hơn một chút, trong khi đồng hồ tính tiền server vẫn quay vù vù ở cục nghẽn chính.",
    "sourceLink": { "text": "DuckDB — Profiling & Explain", "url": "https://duckdb.org/docs/stable/guides/meta/explain_analyze" }
  },
  {
    "id": "c_equality_proof",
    "subject": "Quality Gate",
    "term": "39. Bằng chứng độ chính xác (Equality Proof)",
    "pronounceOrType": "Tốc độ phải đi kèm tính chính xác",
    "definition": "Bạn vừa xóa một lệnh và job chạy nhanh lên thấy rõ. Khoan vội mừng, hoàn toàn có thể bạn vừa làm hệ thống chạy nhanh bằng cách... làm nó sai đi (ví dụ: mất đi công dụng lọc dòng ngầm của lệnh đó). Mọi con số báo cáo tốc độ mà không đi kèm với bằng chứng đối soát nội dung hai chiều (chạy EXCEPT ra 0 dòng lệch) thì chỉ là tin đồn. Bắt buộc phải chạy phép kiểm tra này sau TỪNG LẦN sửa code, chứ không phải đợi gom một cục tới cuối cùng mới kiểm.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Datafold / dbt Data Diff\nNgoài thực tế, các đội data dùng công cụ Data Diff chạy tự động trên quy trình CI/CD.\nĐánh đổi (Trade-offs): Chạy so sánh toàn bộ bảng tốn nhiều compute và làm chậm quá trình duyệt code, nhưng nó chặn đứng thảm họa dữ liệu sai ngầm trước khi lên Production.",
    "pitfall": "Thấy tốc độ tăng vọt là hớn hở đẩy code lên Production mà không đối soát. Dữ liệu bị nhân đôi do vô tình xóa nhầm lệnh quan trọng, hậu quả phá nát báo cáo nặng nề hơn cả việc code chạy chậm.",
    "sourceLink": { "text": "dbt-audit-helper", "url": "https://github.com/dbt-labs/dbt-audit-helper" }
  },
  {
    "id": "c_sql_python_border_crossing",
    "subject": "SQL & Engine",
    "term": "40. Xử lý tập hợp (Set-based) & Nút thắt khi vượt biên giới SQL-Python",
    "pronounceOrType": "Sát thủ giết hiệu năng kinh điển",
    "definition": "Đẩy 60,000 dòng từ Database lên Python, rồi dùng vòng lặp để INSERT ngược lại từng dòng một. Mỗi câu lệnh SQL gửi đi đều bắt Database phải trả một khoản phí cố định để phân tích cú pháp và lập kế hoạch. 60,000 lần như vậy là mất toi 1 phút ngồi chơi xơi nước trước khi có việc thật nào được làm. Các Database Engine được thiết kế để xử lý theo tập hợp - tính toán nguyên cả cột cùng lúc.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Apache Arrow (Vectorized Execution)\nArrow chuyển dữ liệu giữa Python và Database trực tiếp trên RAM siêu tốc mà không cần ép kiểu.\nĐánh đổi (Trade-offs): Dù Arrow cực nhanh, việc xử lý trọn vẹn ngay bên trong Database bằng SQL chuẩn vẫn luôn ưu việt và tốn ít chi phí nghẽn mạng nhất.",
    "pitfall": "Nghĩ rằng Python xử lý dữ liệu chậm. Thật ra Python không chậm ở đây, cái chậm là việc bạn vứt bỏ hoàn toàn lợi thế xử lý tập hợp của engine và bắt hệ thống trả 'phí qua trạm' liên tục giữa 2 môi trường.",
    "sourceLink": { "text": "DuckDB Vectorized Execution", "url": "https://duckdb.org/why_duckdb" }
  },
  {
    "id": "c_optimizer_limits_and_pointless_joins",
    "subject": "SQL & Engine",
    "term": "41. Điểm mù của bộ tối ưu hóa (Optimizer) & Phép JOIN vô nghĩa",
    "pronounceOrType": "Xóa bớt việc là phần của bạn, không phải của Engine",
    "definition": "Những lời truyền miệng kiểu 'nhớ đặt bảng nhỏ bên phải phép Hash Join' đã lỗi thời. Các bộ tối ưu hiện đại tự biết ước lượng kích thước và đảo thứ tự dựng bảng cho bạn. NHƯNG, Optimizer có một điểm mù: Nó có thể chọn kế hoạch tốt nhất để chạy một phép `LEFT JOIN`, nhưng nó không bao giờ biết rằng phép JOIN đó là hoàn toàn vô ích (ví dụ: Data Mart join với bảng Khách hàng nhưng không sử dụng bất kỳ cột nào từ bảng đó).",
    "formulaOrSyntax": "-- CÁCH ĐÚNG: Dùng EXPLAIN ANALYZE.\nNhìn vào kế hoạch thực thi để bắt tận tay Engine đang quét nguyên cái bảng Dimension to tổ chảng chỉ để phục vụ một phép JOIN không ai đặt hàng.",
    "pitfall": "Tốn thời gian tuning thứ tự JOIN, trong khi đúng ra chỉ cần xóa nguyên dòng LEFT JOIN vô dụng đó đi là tốc độ tăng vọt. Việc xóa các câu lệnh thừa là trách nhiệm của kỹ sư, không phải của công cụ.",
    "sourceLink": { "text": "DuckDB EXPLAIN ANALYZE", "url": "https://duckdb.org/docs/stable/guides/meta/explain_analyze" }
  },

  /* ─────────── PHẦN 6: TỰ ĐỘNG HÓA PIPELINE & DBT ECOSYSTEM ─────────── */
  {
    "id": "c_dbt_t_layer_boundary",
    "subject": "Pipeline Lifecycle",
    "term": "42. Công cụ dbt (Data Build Tool) & Ranh giới chữ 'T' trong ELT",
    "pronounceOrType": "Định vị công cụ trong kiến trúc dữ liệu",
    "definition": "dbt hiện là tiêu chuẩn công nghiệp để tự động hóa việc viết SQL trong kho dữ liệu. Tuy nhiên, dbt chỉ đảm nhận duy nhất chữ 'T' (Transformation - Biến đổi) trong mô hình ELT. Nó không tự đi tải file từ nguồn, cũng không nạp dữ liệu vật lý vào đĩa. Nó chỉ tiếp quản công việc khi dữ liệu đã nằm yên ở một nơi có thể chạy truy vấn SQL. Trong dbt, mỗi bảng dữ liệu được đại diện bằng đúng 1 file SQL chứa duy nhất 1 câu lệnh SELECT.",
    "formulaOrSyntax": "-- Công cụ mở rộng: dbt Core (Mã nguồn mở) vs. dbt Cloud\nĐánh đổi (Trade-offs): dbt Cloud có giao diện web, tự lên lịch chạy, dễ dùng cho team nhỏ, nhưng chi phí bản quyền rất đắt đỏ khi team phình to. dbt Core hoàn toàn miễn phí, kỹ sư kiểm soát được mọi thứ trong mã nguồn, đổi lại bạn phải tự xây dựng hạ tầng máy chủ và tự dùng công cụ điều phối khác (như Airflow) để lên lịch chạy.",
    "pitfall": "Lầm tưởng dbt có thể thay thế toàn bộ hệ thống Data Pipeline. Bạn vẫn phải tự viết các đoạn code Python để xử lý việc kéo file, chặn lỗi đường truyền hay dọn rác hệ điều hành. Dùng sai công cụ cho phần Extract/Load sẽ khiến dự án rối tung.",
    "sourceLink": { "text": "dbt About Models", "url": "https://docs.getdbt.com/docs/build/models" }
  },
  {
    "id": "c_auto_dag_generation",
    "subject": "Reliability & Ops",
    "term": "43. Tự động vẽ Đồ thị phụ thuộc (DAG) với hàm ref()",
    "pronounceOrType": "Cách hệ thống tự biết ai chạy trước, ai chạy sau",
    "definition": "Trong một kho dữ liệu, bảng B được tính ra từ bảng A, bảng C lấy số từ bảng B. Đồ thị quy định thứ tự này gọi là DAG. Thay vì kỹ sư phải nhớ và cấu hình thủ công 'Chạy A rồi mới chạy B', dbt đưa ra một quy tắc: Bên trong câu SQL, cấm gõ trực tiếp tên bảng vật lý. Phải dùng hàm `{{ ref('ten_bang') }}`. Khi biên dịch, dbt sẽ quét các hàm ref() này, tự động vẽ ra DAG và tự biết phải dựng bảng cha trước, bảng con sau.",
    "formulaOrSyntax": "-- Công cụ mở rộng: dbt DAG vs. Airflow Task Dependencies\nĐánh đổi (Trade-offs): Nối luồng bằng tay trong Airflow giúp dễ bao quát các tác vụ phi-SQL (gửi email, gọi API), nhưng khi file SQL thay đổi logic mà quên cập nhật đồ thị thì thứ tự chạy sẽ sai bét. Hàm ref() của dbt lấy đồ thị trực tiếp từ mã nguồn SQL nên không bao giờ bị lệch, đổi lại dbt sẽ giấu câu lệnh SQL thật sự đằng sau một bước biên dịch, đôi khi gây khó chịu lúc gỡ lỗi.",
    "pitfall": "Do thói quen, kỹ sư gõ thẳng tên schema và tên bảng vật lý vào file dbt model thay vì dùng hàm ref(). Lệnh SQL vẫn chạy thành công ngày hôm nay, nhưng model đó lặng lẽ rơi ra khỏi DAG. Thứ tự chạy ngày mai sẽ hoàn toàn phụ thuộc vào may rủi.",
    "sourceLink": { "text": "dbt ref function", "url": "https://docs.getdbt.com/reference/dbt-jinja-functions/ref" }
  },
  {
    "id": "c_data_catalog_descriptions",
    "subject": "Pipeline Lifecycle",
    "term": "44. Từ điển Dữ liệu (Data Catalog) & Nghệ thuật viết mô tả",
    "pronounceOrType": "Minh bạch hóa kho dữ liệu cho người dùng cuối",
    "definition": "Khi người lạ nhìn vào một bảng dữ liệu, họ sẽ hỏi 3 câu: Bảng này chứa gì? Dữ liệu có tin được không? Gặp lỗi thì hỏi ai? Từ điển dữ liệu là một trang web sinh ra để trả lời 3 câu đó. Công cụ (như dbt) sẽ tự động gom cấu trúc bảng, kiểu dữ liệu, danh sách Tests. Nhưng phần hồn — Ý nghĩa thực sự của từng cột — thì con người phải tự viết. Dòng đầu tiên của mọi phần mô tả bảng bắt buộc phải định nghĩa Độ hạt (Grain): 'Một dòng của bảng này đại diện cho cái gì?'.",
    "formulaOrSyntax": "-- Công cụ mở rộng: dbt Docs vs. Enterprise Catalogs (DataHub / Atlan)\nĐánh đổi (Trade-offs): dbt Docs sinh ra web tĩnh miễn phí nhưng bị bó hẹp trong nội bộ dự án đó. Các bản thương mại (DataHub, Atlan) bao quát toàn bộ tài sản dữ liệu của cả công ty, có phân quyền, nhưng tốn rất nhiều tiền. Thực tế, nếu kỹ sư chưa viết nổi mô tả cho tử tế ở dự án gốc, thì có vứt tiền mua tool xịn cũng vô dụng.",
    "pitfall": "Viết mô tả theo kiểu nhại lại tên cột (Ví dụ cột `order_date` thì ghi chú là 'Ngày đặt hàng'). Một dòng mô tả vô hồn khiến catalog trông có vẻ chuyên nghiệp nhưng người đọc không thu được giá trị gì. Mô tả đúng phải mang theo quyết định thiết kế hoặc cảnh báo.",
    "sourceLink": { "text": "dbt Docs", "url": "https://docs.getdbt.com/docs/collaborate/explore-projects" }
  },
  {
    "id": "c_three_levels_of_lineage",
    "subject": "Reliability & Ops",
    "term": "45. Ba cấp độ truy vết nguồn gốc dữ liệu (Data Lineage)",
    "pronounceOrType": "Phân tích bán kính ảnh hưởng khi có yêu cầu thay đổi",
    "definition": "Truy vết Nguồn gốc dữ liệu có 3 tầng. 1. Mức Bảng (Table-level): Cho biết bảng nào nuôi bảng nào. 2. Mức Cột (Column-level): Truy vết sự thay đổi của một cột duy nhất qua từng câu SQL. 3. Mức Dòng (Row-level): Lần chạy pipeline nào đã nạp vào dòng dữ liệu này. Khi đối tác thông báo sẽ xóa một cột, Lineage mức Bảng sẽ báo động đỏ: 'Cả 5 bảng phía sau sẽ sập'. Nhưng nếu tự lần tay ở mức Cột, bạn nhận ra chỉ có 2 bảng thực sự chạm vào cột đó, 3 bảng còn lại hoàn toàn an toàn.",
    "formulaOrSyntax": "-- Công cụ mở rộng: Trích xuất Lineage mức cột tự động\nCác catalog thương mại hoặc bản trả phí dùng công nghệ phân tích cú pháp SQL (AST Parsing) để tự động vẽ ra Lineage mức Cột.\nĐánh đổi (Trade-offs): Đổi tiền lấy sự tự động hóa để đánh giá rủi ro chính xác hơn. Tuy nhiên, dù công nghệ đắt tiền đến mấy cũng KHÔNG thể cho bạn Lineage mức Dòng. Việc dán nhãn ID phiên chạy và lưu nhật ký hệ thống bắt buộc phải do kỹ sư tự thiết kế ngay từ lúc nạp dữ liệu thô.",
    "pitfall": "Phụ thuộc 100% vào báo cáo rủi ro mức Bảng của công cụ. Hoảng sợ báo cáo với cấp trên rằng hệ thống sẽ sập toàn diện khi đối tác xóa 1 cột nhỏ, trong khi thực tế chỉ tốn 20 phút để sửa lại 2 Model bị ảnh hưởng trực tiếp.",
    "sourceLink": { "text": "dbt Understand Node Lineage", "url": "https://docs.getdbt.com/docs/collaborate/explore-projects#understand-node-lineage" }
  }
]