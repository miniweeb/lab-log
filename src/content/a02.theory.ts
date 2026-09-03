import type { TheorySection, Term } from '../types'
import { bi } from '../types'

export const a02Theory: TheorySection[] = [
  /* ─────────── TẦNG 1 ─────────── */
  {
    level: 'problem',
    heading: bi(
      'Every question costs a full read',
      'Mọi câu hỏi đều phải trả giá đọc toàn bộ',
    ),
    paras: [
      bi(
        'You have 45 CSV files, 16 GB, sitting in one folder. Your mentor asks: "how much revenue did we make on June 19?" That is a question about one day — about 2% of your data.',
        'Bạn có 45 file CSV, 16 GB, nằm chung một thư mục. Mentor hỏi: "ngày 19 tháng 6 doanh thu bao nhiêu?" Đó là câu hỏi về một ngày, tức khoảng 2% dữ liệu.',
      ),
      bi(
        'To answer it, the engine must open all 45 files, decompress them, parse every row, check the date, and throw away 98% of what it just read. You paid the full 16 GB to get back 350 MB worth of answer. The cost of a question has nothing to do with the size of its answer.',
        'Để trả lời, engine phải mở cả 45 file, giải nén, phân tích từng dòng, kiểm tra ngày, rồi vứt đi 98% những gì vừa đọc. Bạn trả giá trọn 16 GB để nhận về câu trả lời đáng giá 350 MB. Chi phí của câu hỏi không hề liên quan tới kích thước câu trả lời.',
      ),
      bi(
        'Now scale it. A real pipeline holds years, not weeks. The same question against three years of history reads a terabyte to answer something about one Tuesday. And almost every question asked of a pipeline is date-shaped: yesterday, last week, reload June. This is not an edge case — it is the normal case, and it is unaffordable.',
        'Giờ nhân lên. Một pipeline thật giữ nhiều năm chứ không phải vài tuần. Cùng câu hỏi đó trên ba năm lịch sử sẽ đọc cả terabyte để trả lời về đúng một ngày thứ Ba. Mà gần như mọi câu hỏi đặt ra cho pipeline đều có hình dạng ngày tháng: hôm qua, tuần trước, nạp lại tháng sáu. Đây không phải trường hợp hiếm — đây là trường hợp thường, và nó không kham nổi.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Your data grows 10x but you still only ever ask about one day. Does the cost of that question change?',
          'Dữ liệu của bạn tăng gấp 10 lần nhưng bạn vẫn chỉ hỏi về một ngày. Chi phí của câu hỏi đó có đổi không?',
        ),
        a: bi(
          'Yes — it grows 10x too, even though the answer stays the same size. That decoupling of question size from answer size is exactly the problem.',
          'Có — nó cũng tăng 10 lần, dù câu trả lời vẫn bằng đúng từng ấy. Việc chi phí câu hỏi tách rời khỏi kích thước câu trả lời chính là vấn đề.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 2 ─────────── */
  {
    level: 'alternatives',
    heading: bi(
      'The obvious fixes, and where each one breaks',
      'Những cách chữa hiển nhiên, và chỗ hỏng của từng cách',
    ),
    paras: [
      bi(
        'Partitioning is not the only idea anyone ever had. Before accepting it, walk through what else you might reach for and find the exact point where each falls apart. This is the difference between knowing a technique and knowing why it exists.',
        'Phân vùng không phải ý tưởng duy nhất từng có người nghĩ ra. Trước khi chấp nhận nó, hãy đi qua những thứ khác bạn có thể nghĩ tới và tìm đúng điểm mà mỗi cái sụp đổ. Đây chính là khác biệt giữa biết một kỹ thuật và biết vì sao nó tồn tại.',
      ),
    ],
    alternatives: [
      {
        name: bi('Put it in a database with an index', 'Nhét vào database rồi đánh chỉ mục'),
        appeal: bi(
          'This is what indexes are for. A B-tree on order_date answers date queries in milliseconds. Databases have solved this for fifty years.',
          'Chỉ mục sinh ra để làm đúng việc đó. Một cây B-tree trên order_date trả lời truy vấn theo ngày trong vài mili giây. Database đã giải quyết chuyện này năm mươi năm nay.',
        ),
        breaks: bi(
          'It works, and for many workloads it is the right answer. It breaks on three things: loading 16 GB into a database is slow and you must do it before you can ask anything; the data now lives in one engine\'s private format, so Spark or a colleague\'s Python script cannot read it; and an index optimized for finding a few rows is the wrong shape for scanning millions of them, which is what analytics does.',
          'Nó chạy được, và với nhiều loại tải thì đó đúng là câu trả lời. Nó hỏng ở ba chỗ: nạp 16 GB vào database rất chậm và bạn phải nạp xong mới hỏi được gì; dữ liệu giờ nằm trong định dạng riêng của một engine, nên Spark hay script Python của đồng nghiệp không đọc được; và chỉ mục vốn tối ưu để tìm vài dòng lại sai hình dạng cho việc quét hàng triệu dòng, mà quét hàng triệu dòng chính là việc của phân tích dữ liệu.',
        ),
      },
      {
        name: bi('Just use Parquet — it already has min/max stats', 'Cứ dùng Parquet — nó đã có sẵn thống kê min/max'),
        appeal: bi(
          'A01 showed that every Parquet row group stores the min and max of each column. The engine compares your WHERE clause to those and skips groups that cannot match. Is that not already pruning?',
          'A01 đã cho thấy mỗi nhóm dòng trong Parquet lưu kèm min và max của từng cột. Engine so điều kiện WHERE với chúng rồi bỏ qua nhóm không thể khớp. Vậy chẳng phải đó đã là cắt tỉa rồi sao?',
        ),
        breaks: bi(
          'It is real, and it helps — but the engine must still open every file to read those footers. 45 files means 45 file opens, 45 footer reads, before a single row is skipped. At 10,000 files that overhead alone dominates. Row-group stats prune inside a file; you need something that prunes before opening it.',
          'Có thật, và có ích — nhưng engine vẫn phải mở từng file để đọc phần chân trang đó. 45 file nghĩa là 45 lần mở file, 45 lần đọc chân trang, trước khi bỏ qua được một dòng nào. Tới 10.000 file thì riêng phần phụ trội đó đã chiếm hết. Thống kê nhóm dòng cắt tỉa BÊN TRONG một file; bạn cần thứ cắt tỉa TRƯỚC KHI mở file.',
        ),
      },
      {
        name: bi('Sort the data by date', 'Sắp xếp dữ liệu theo ngày'),
        appeal: bi(
          'If rows are sorted by date, all of June 19 sits contiguously. Combined with row-group stats, the engine skips almost everything.',
          'Nếu các dòng đã sắp theo ngày thì toàn bộ ngày 19 tháng 6 nằm liền một khối. Kết hợp với thống kê nhóm dòng, engine bỏ qua được gần hết.',
        ),
        breaks: bi(
          'Sorting works beautifully — until new data arrives. Tomorrow\'s file must be merged into sorted order, which means rewriting the files it lands between. And you still open every file to read footers. Sorting optimizes reads by making writes expensive; a daily pipeline writes every day.',
          'Sắp xếp cho kết quả rất đẹp — cho tới khi dữ liệu mới về. File của ngày mai phải được trộn vào đúng vị trí đã sắp, nghĩa là phải ghi lại những file mà nó rơi vào giữa. Và bạn vẫn phải mở từng file để đọc chân trang. Sắp xếp tối ưu việc đọc bằng cách làm việc ghi trở nên đắt; mà pipeline hằng ngày thì ngày nào cũng ghi.',
        ),
      },
      {
        name: bi('Keep a side table of "which file has which dates"', 'Giữ một bảng phụ ghi "file nào chứa ngày nào"'),
        appeal: bi(
          'Maintain a small manifest mapping date ranges to filenames. Read it first, then open only the files you need. No wasted opens.',
          'Duy trì một manifest nhỏ ánh xạ khoảng ngày sang tên file. Đọc nó trước, rồi chỉ mở những file cần. Không mở thừa file nào.',
        ),
        breaks: bi(
          'Nothing is wrong with this — in fact it is exactly what Iceberg and Delta Lake do, and it is strictly more powerful than folders. The catch is that you must now keep the side table and the files in agreement forever. Every write, every delete, every crashed job. That consistency problem is the entire reason those table formats are complicated pieces of software. Folder-based partitioning gets you 80% of the benefit with zero moving parts, because the folder name cannot drift out of sync with the folder\'s contents.',
          'Cách này không sai gì cả — thực ra đây đúng là điều Iceberg và Delta Lake làm, và nó mạnh hơn hẳn cách dùng thư mục. Điểm mắc là từ nay bạn phải giữ cho bảng phụ và các file luôn đồng thuận với nhau, mãi mãi. Qua mọi lần ghi, mọi lần xoá, mọi lần job chết giữa chừng. Chính bài toán nhất quán đó là lý do các định dạng bảng kia là những phần mềm phức tạp. Phân vùng bằng thư mục cho bạn 80% lợi ích mà không có bộ phận chuyển động nào, bởi tên thư mục không thể lệch khỏi nội dung bên trong nó.',
        ),
      },
    ],
    checks: [
      {
        q: bi(
          'Why is "the folder name cannot drift out of sync" such a strong property?',
          'Vì sao tính chất "tên thư mục không thể lệch khỏi nội dung" lại mạnh đến vậy?',
        ),
        a: bi(
          'Because there is no second copy of the truth to maintain. The metadata IS the storage location. A file cannot be inside order_date=2026-06-19/ and simultaneously be listed elsewhere — there is no "elsewhere". Every system that keeps metadata separately must solve the problem of the two disagreeing.',
          'Vì không có bản sao thứ hai nào của sự thật để phải duy trì. Metadata CHÍNH LÀ vị trí lưu trữ. Một file không thể vừa nằm trong order_date=2026-06-19/ vừa được ghi ở chỗ khác — vì không có "chỗ khác" nào cả. Mọi hệ thống giữ metadata riêng đều phải giải bài toán hai bên nói khác nhau.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 3 ─────────── */
  {
    level: 'idea',
    heading: bi('Make the folder name carry the data', 'Để tên thư mục mang dữ liệu'),
    paras: [
      bi(
        'Here is the whole idea in one sentence: instead of storing the date only inside the rows, also encode it in the directory path, so a query engine can decide what to read by reading folder names.',
        'Toàn bộ ý tưởng gói trong một câu: thay vì chỉ lưu ngày bên trong các dòng, hãy mã hoá nó luôn vào đường dẫn thư mục, để engine quyết định đọc gì chỉ bằng cách đọc tên thư mục.',
      ),
      bi(
        'A directory listing is essentially free — it is a metadata operation, not a data read. So the engine gets to make its most expensive decision (what to open) using its cheapest available information (what the folders are called).',
        'Liệt kê thư mục gần như miễn phí — đó là thao tác trên metadata, không phải đọc dữ liệu. Nhờ vậy engine được đưa ra quyết định đắt nhất của nó (mở cái gì) bằng thông tin rẻ nhất mà nó có (các thư mục tên là gì).',
      ),
      bi(
        'The layout has a name: the Hive layout, after Apache Hive which popularized it. One subfolder per value, named column=value. Spark, Hive, BigQuery, Athena, Trino, DuckDB — all of them recognize this convention. It is a de facto standard held together by nothing but a naming agreement.',
        'Bố cục này có tên riêng: Hive layout, đặt theo Apache Hive vì Hive làm nó phổ biến. Mỗi giá trị là một thư mục con, tên dạng cột=giá_trị. Spark, Hive, BigQuery, Athena, Trino, DuckDB — tất cả đều nhận ra quy ước này. Đó là một chuẩn trên thực tế, được giữ lại với nhau chỉ bằng một thoả thuận về cách đặt tên.',
      ),
    ],
    code: {
      lang: 'text',
      body: `<DATA_ROOT>/lake/orders/
  order_date=2026-06-01/          <- tên thư mục CHÍNH LÀ dữ liệu
    a3f1....parquet
    9c2e....parquet
  order_date=2026-06-02/
    ...
  order_date=__HIVE_DEFAULT_PARTITION__/   <- chỗ chứa giá trị NULL`,
      caption: bi(
        'The folder name is a promise: every row underneath it has that order date.',
        'Tên thư mục là một lời hứa: mọi dòng nằm dưới nó đều có đúng ngày đặt hàng đó.',
      ),
    },
    checks: [
      {
        q: bi(
          'The column order_date does not physically exist inside the Parquet files. How does a query still return it?',
          'Cột order_date không hề tồn tại vật lý bên trong các file Parquet. Vậy sao truy vấn vẫn trả về được nó?',
        ),
        a: bi(
          'The engine reconstructs it from the path. That is what hive_partitioning=true switches on — parse the folder name back into a real column. Without that flag the column simply is not there.',
          'Engine dựng lại nó từ đường dẫn. Đó chính là thứ mà hive_partitioning=true bật lên — phân tích tên thư mục ngược trở lại thành một cột thật. Không có cờ đó thì cột này đơn giản là không tồn tại.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 4 ─────────── */
  {
    level: 'mechanism',
    heading: bi('What the engine actually does', 'Engine thật sự làm gì'),
    paras: [
      bi(
        'When you run a query against lake/orders/*/*.parquet with a filter on order_date, the engine does this, in this order:',
        'Khi bạn chạy truy vấn trên lake/orders/*/*.parquet với điều kiện lọc theo order_date, engine làm những việc sau, đúng thứ tự này:',
      ),
      bi(
        '1. List the directories. Cheap. It now has 46 folder names.\n2. Parse each name into a value: order_date=2026-06-19 becomes the date 2026-06-19.\n3. Evaluate your WHERE clause against those values alone. Folders that cannot match are dropped — no file is opened.\n4. Only for surviving folders, open the files and read Parquet footers.\n5. Inside those files, use row-group min/max stats to skip further.\n6. Read the remaining row groups and apply the filter row by row.',
        '1. Liệt kê các thư mục. Rẻ. Giờ nó có 46 tên thư mục.\n2. Phân tích từng tên thành một giá trị: order_date=2026-06-19 trở thành ngày 2026-06-19.\n3. Đánh giá điều kiện WHERE của bạn chỉ dựa trên các giá trị đó. Thư mục không thể khớp bị loại — không file nào được mở.\n4. Chỉ với những thư mục sống sót, mới mở file và đọc chân trang Parquet.\n5. Bên trong các file đó, dùng thống kê min/max của nhóm dòng để bỏ qua tiếp.\n6. Đọc các nhóm dòng còn lại rồi áp điều kiện lọc lên từng dòng.',
      ),
      bi(
        'Steps 3 and 5 are two different prunings at two different scales, and A01 only showed you the second one. Step 3 is partition pruning: it operates on folder names and can eliminate 98% of your data before touching a byte of it. Step 5 is row-group pruning: it operates inside files already opened.',
        'Bước 3 và bước 5 là hai phép cắt tỉa khác nhau ở hai quy mô khác nhau, và A01 mới chỉ cho bạn thấy cái thứ hai. Bước 3 là cắt tỉa phân vùng: nó làm việc trên tên thư mục và có thể loại bỏ 98% dữ liệu trước khi chạm vào một byte nào. Bước 5 là cắt tỉa nhóm dòng: nó làm việc bên trong những file đã mở.',
      ),
      bi(
        'You will see step 3 with your own eyes in Task 5. EXPLAIN prints a line "Scanning Files: 8/377" — eight files opened out of three hundred seventy-seven. Those 369 skipped files were eliminated by string comparison on their parent folder names.',
        'Bạn sẽ tận mắt thấy bước 3 ở Task 5. Lệnh EXPLAIN in ra dòng "Scanning Files: 8/377" — tám file được mở trên tổng ba trăm bảy mươi bảy. 369 file bị bỏ qua kia được loại bằng phép so sánh chuỗi trên tên thư mục cha của chúng.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Query A filters on order_date, Query B filters on CAST(order_ts_clean AS DATE). Same rows, same result. Why is B slower?',
          'Truy vấn A lọc theo order_date, truy vấn B lọc theo CAST(order_ts_clean AS DATE). Cùng số dòng, cùng kết quả. Vì sao B chậm hơn?',
        ),
        a: bi(
          'order_ts_clean lives inside the files. To evaluate the filter the engine must open every file and read that column — step 3 cannot fire because folder names say nothing about order_ts_clean. Identical results, completely different amount of reading.',
          'Cột order_ts_clean nằm bên trong các file. Để đánh giá điều kiện lọc, engine phải mở mọi file và đọc cột đó — bước 3 không kích hoạt được vì tên thư mục chẳng nói gì về order_ts_clean. Kết quả giống hệt nhau, nhưng lượng đọc khác nhau hoàn toàn.',
        ),
      },
      {
        q: bi(
          "Would WHERE order_ts LIKE '2026-06-19%' prune?",
          "Điều kiện WHERE order_ts LIKE '2026-06-19%' có cắt tỉa được không?",
        ),
        a: bi(
          'No, and worse, it returns wrong answers. No pruning because order_ts is not the partition column. Wrong answers because rows stored as 19/06/2026 do not match that string pattern at all.',
          'Không, và tệ hơn nữa là nó trả về kết quả sai. Không cắt tỉa vì order_ts không phải cột phân vùng. Kết quả sai vì những dòng lưu dạng 19/06/2026 hoàn toàn không khớp mẫu chuỗi đó.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 5 ─────────── */
  {
    level: 'detail',
    heading: bi('Choosing, sizing, and the ways this bites', 'Chọn cột, chia độ mịn, và những chỗ nó cắn lại'),
    paras: [
      bi(
        'Choosing the column. Partition by what matches how data arrives and how it is asked for. Our feed arrives daily, corrections are day-ranged, most queries filter on time. Date is obvious. A column nobody filters on gives you all of the cost and none of the benefit.',
        'Chọn cột. Phân vùng theo thứ khớp với cách dữ liệu VỀ và cách người ta HỎI nó. Nguồn của chúng ta về hằng ngày, các bản sửa cũng theo khoảng ngày, và phần lớn truy vấn lọc theo thời gian. Ngày là lựa chọn hiển nhiên. Một cột không ai lọc theo sẽ mang lại toàn bộ chi phí mà không có chút lợi ích nào.',
      ),
      bi(
        'Granularity. Finer partitions prune better but produce more, smaller files — and every file costs a footer read plus an OS file-open. Rule of thumb: aim for partition files in the tens-to-hundreds of MB. Daily is right here. Partitioning by date and store would mean thousands of kilobyte-sized files per month; stretch goal 1 lets you feel exactly how sluggish that gets.',
        'Độ mịn. Phân vùng càng nhỏ thì cắt tỉa càng tốt nhưng sinh ra càng nhiều file càng bé — mà mỗi file tốn một lần đọc chân trang cộng một lần hệ điều hành mở file. Quy tắc kinh nghiệm: nhắm cho mỗi file phân vùng nằm trong khoảng vài chục tới vài trăm MB. Theo ngày là vừa ở đây. Phân vùng theo cả ngày lẫn cửa hàng sẽ ra hàng nghìn file cỡ kilobyte mỗi tháng; bài mở rộng số 1 cho bạn cảm nhận đúng độ ì của chuyện đó.',
      ),
      bi(
        'Event time is not arrival time. The file orders_2026-06-10.csv is named for the day it arrived. Inside, roughly 1.5% of rows are late corrections — orders that happened on one of the seven previous days and got a status update today. We partition by when the order happened, derived from order_ts, not by which file delivered it. Consequence: one input file writes into up to eight different partition folders.',
        'Thời điểm xảy ra không phải thời điểm về. File orders_2026-06-10.csv được đặt tên theo ngày nó VỀ. Bên trong, khoảng 1,5% số dòng là bản sửa về trễ — những đơn đã XẢY RA trong bảy ngày trước đó và hôm nay mới có cập nhật trạng thái. Ta phân vùng theo thời điểm đơn hàng xảy ra, suy ra từ order_ts, chứ không theo file nào mang nó tới. Hệ quả: một file đầu vào ghi vào tối đa tám thư mục phân vùng khác nhau.',
      ),
      bi(
        'This is contractual, not a bug. The shopcore_orders_daily contract\'s business_date and late_corrections clauses promise exactly this behavior. You will see it in Task 4; A08 deals with the consequences.',
        'Đây là điều khoản hợp đồng, không phải lỗi. Các điều khoản business_date và late_corrections trong hợp đồng shopcore_orders_daily hứa đúng hành vi này. Bạn sẽ thấy nó ở Task 4; A08 xử lý các hệ quả của nó.',
      ),
      bi(
        'Filenames matter, and this is where you will get hurt. Each COPY writes files into every folder it touches. Two writes producing the same filename means the second silently replaces the first. OVERWRITE_OR_IGNORE literally means "do not complain if files are in the way" — fine for a one-shot full rewrite, poison for a loop that touches the same partition twice. APPEND gives every written file a unique UUID name, so writes add instead of replace. You will step on this rake deliberately in Task 2.',
        'Tên file có ý nghĩa, và đây là chỗ bạn sẽ bị đau. Mỗi lệnh COPY ghi file vào mọi thư mục nó chạm tới. Hai lần ghi sinh ra cùng một tên file nghĩa là lần sau âm thầm thay thế lần trước. OVERWRITE_OR_IGNORE dịch sát nghĩa là "đừng phàn nàn nếu có file nằm chắn đường" — ổn cho một lần ghi đè toàn bộ, nhưng là thuốc độc cho vòng lặp chạm vào cùng một phân vùng hai lần. Chế độ APPEND đặt cho mỗi file được ghi một tên UUID duy nhất, nên các lần ghi THÊM VÀO thay vì THAY THẾ. Bạn sẽ cố ý giẫm lên cái cào này ở Task 2.',
      ),
      bi(
        'NULLs go somewhere visible. About 0.02% of rows have impossible timestamps like 2026-06-31. They parse to NULL, and DuckDB routes them into order_date=__HIVE_DEFAULT_PARTITION__ — parked, not vanished. A05 quarantines them properly. We are not cleaning data today; A03 owns cleansing. We parse order_ts just enough to know which day a row belongs to.',
        'Giá trị NULL đi tới một chỗ nhìn thấy được. Khoảng 0,02% số dòng có mốc thời gian bất khả thi kiểu 2026-06-31. Chúng phân tích ra NULL, và DuckDB dẫn chúng vào thư mục order_date=__HIVE_DEFAULT_PARTITION__ — được gửi tạm chứ không biến mất. A05 sẽ cách ly chúng đúng cách. Hôm nay ta không làm sạch dữ liệu; A03 mới là bài về làm sạch. Ta chỉ phân tích order_ts vừa đủ để biết một dòng thuộc về ngày nào.',
      ),
      bi(
        'The lake is an append-only log, not final truth. After late corrections, the same order_id can exist in two partitions: the original and the correction. Deduplicating that is A08\'s whole topic.',
        'Lake là một nhật ký chỉ ghi thêm, không phải sự thật cuối cùng. Sau các bản sửa trễ, cùng một order_id có thể tồn tại trong hai phân vùng: bản gốc và bản sửa. Khử trùng lặp chuyện đó là toàn bộ chủ đề của A08.',
      ),
    ],
    checks: [
      {
        q: bi(
          'You run the build loop twice without wiping the lake. What happens, and what does verify print?',
          'Bạn chạy vòng lặp dựng lake hai lần mà không xoá lake. Chuyện gì xảy ra, và verify in ra gì?',
        ),
        a: bi(
          'APPEND means append. Every row now exists twice and verify prints MISMATCH with 5,547,132 — exactly double. Nothing errored. Safe re-runs are A07.',
          'APPEND nghĩa đúng là thêm vào. Mọi dòng giờ tồn tại hai bản và verify in MISMATCH với 5.547.132 — đúng gấp đôi. Không có lỗi nào được báo. Chạy lại an toàn là chủ đề A07.',
        ),
      },
      {
        q: bi(
          'Why does partitioning by date AND store_id make things worse here?',
          'Vì sao phân vùng theo cả ngày lẫn store_id lại làm mọi thứ tệ đi ở đây?',
        ),
        a: bi(
          'It explodes into roughly 1,100 folders of ~6 KB files per day. Each tiny file still costs a footer read and a file open, so the fixed overhead per file starts to dominate the actual data. You prune better but read slower.',
          'Nó nổ tung thành khoảng 1.100 thư mục chứa file cỡ 6 KB mỗi ngày. Mỗi file tí hon vẫn tốn một lần đọc chân trang và một lần mở file, nên phần phụ trội cố định trên mỗi file bắt đầu lấn át chính dữ liệu. Bạn cắt tỉa tốt hơn nhưng đọc chậm hơn.',
        ),
      },
    ],
  },
]

export const a02Terms: Term[] = [
  {
    term: 'Partition',
    gloss: 'phân vùng',
    means: bi(
      'A folder whose name carries data. One subfolder per value of the chosen column, named column=value.',
      'Một thư mục mà tên của nó mang dữ liệu. Mỗi giá trị của cột được chọn là một thư mục con, tên dạng cột=giá_trị.',
    ),
    source: { name: 'MotherDuck — Hive partitioning', url: 'https://motherduck.com/glossary/hive-partitioning/' },
  },
  {
    term: 'Hive layout',
    gloss: 'bố cục kiểu Hive',
    means: bi(
      'The column=value directory naming convention, named after Apache Hive. A de facto standard every major engine recognizes.',
      'Quy ước đặt tên thư mục dạng cột=giá_trị, gọi theo tên Apache Hive. Một chuẩn trên thực tế mà mọi engine lớn đều nhận ra.',
    ),
    source: { name: 'MotherDuck — Hive partitioning', url: 'https://motherduck.com/glossary/hive-partitioning/' },
  },
  {
    term: 'Partition pruning',
    gloss: 'cắt tỉa phân vùng',
    means: bi(
      'Skipping whole folders by comparing folder names to the WHERE clause, without opening any file. The biggest performance lever in any file-based lake.',
      'Bỏ qua nguyên cả thư mục bằng cách so tên thư mục với điều kiện WHERE, không mở file nào. Đòn bẩy hiệu năng lớn nhất trong mọi lake dựa trên file.',
    ),
    source: { name: 'MotherDuck — partition pruning', url: 'https://motherduck.com/glossary/partition-pruning/' },
  },
  {
    term: 'Event time / arrival time',
    gloss: 'thời điểm xảy ra / thời điểm về',
    means: bi(
      'When something happened versus when the file carrying it landed. Partitioning by event time is why one input file writes into up to 8 folders.',
      'Lúc sự việc xảy ra so với lúc file mang nó về tới nơi. Phân vùng theo thời điểm xảy ra chính là lý do một file đầu vào ghi vào tối đa 8 thư mục.',
    ),
    source: { name: 'Apache Flink — event time', url: 'https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/' },
  },
  {
    term: 'Late correction',
    gloss: 'bản sửa về trễ',
    means: bi(
      'A row for an older day re-sent in today\'s file. Contractual under shopcore_orders_daily: up to 7 days back. Roughly 1.5% of rows.',
      'Một dòng thuộc về ngày cũ nhưng được gửi lại trong file hôm nay. Là điều khoản trong hợp đồng shopcore_orders_daily: lùi tối đa 7 ngày. Chiếm khoảng 1,5% số dòng.',
    ),
    source: { name: 'Apache Flink — event time', url: 'https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/' },
  },
  {
    term: 'Granularity',
    gloss: 'độ mịn của phân vùng',
    means: bi(
      'How finely you slice. Finer prunes better but multiplies file count; each file costs a footer read plus an OS open. Aim for tens-to-hundreds of MB per file.',
      'Bạn chia nhỏ tới mức nào. Càng mịn thì cắt tỉa càng tốt nhưng số file nhân lên; mỗi file tốn một lần đọc chân trang cộng một lần hệ điều hành mở file. Nhắm khoảng vài chục tới vài trăm MB mỗi file.',
    ),
    source: { name: 'MotherDuck — Hive partitioning', url: 'https://motherduck.com/glossary/hive-partitioning/' },
  },
  {
    term: 'APPEND vs OVERWRITE_OR_IGNORE',
    gloss: 'thêm vào so với ghi đè-hoặc-bỏ qua',
    means: bi(
      'APPEND gives each written file a unique UUID name so writes add. OVERWRITE_OR_IGNORE reuses names like data_0.parquet, so a second write into the same folder silently replaces the first.',
      'APPEND đặt cho mỗi file được ghi một tên UUID duy nhất nên các lần ghi cộng dồn. OVERWRITE_OR_IGNORE dùng lại tên kiểu data_0.parquet, nên lần ghi thứ hai vào cùng thư mục âm thầm thay thế lần đầu.',
    ),
    source: { name: 'DuckDB — partitioned writes', url: 'https://duckdb.org/docs/data/partitioning/partitioned_writes' },
  },
  {
    term: '__HIVE_DEFAULT_PARTITION__',
    gloss: 'phân vùng mặc định cho giá trị NULL',
    means: bi(
      'The folder DuckDB creates for rows whose partition value is NULL. Here: ~0.02% of rows with impossible timestamps. Parked and visible, not lost.',
      'Thư mục DuckDB tạo ra cho những dòng có giá trị phân vùng là NULL. Ở đây là khoảng 0,02% số dòng có mốc thời gian bất khả thi. Được gửi tạm và nhìn thấy được, không mất.',
    ),
    source: { name: 'DuckDB — partitioned writes', url: 'https://duckdb.org/docs/data/partitioning/partitioned_writes' },
  },
  {
    term: 'hive_partitioning=true',
    gloss: 'bật đọc phân vùng kiểu Hive',
    means: bi(
      'Tells the reader to parse folder names back into a real column. Without it, order_date does not exist in your query results.',
      'Bảo trình đọc phân tích tên thư mục ngược lại thành một cột thật. Không có nó thì order_date không tồn tại trong kết quả truy vấn của bạn.',
    ),
    source: { name: 'DuckDB — Hive partitioning', url: 'https://duckdb.org/docs/data/partitioning/hive_partitioning' },
  },
  {
    term: 'try_strptime',
    gloss: 'thử phân tích chuỗi thời gian',
    means: bi(
      'Tries a list of timestamp formats in order and returns NULL when none fit, instead of crashing the query the way a plain CAST does.',
      'Thử lần lượt một danh sách định dạng thời gian theo đúng thứ tự và trả NULL khi không cái nào khớp, thay vì làm nổ truy vấn như CAST thường.',
    ),
    source: { name: 'DuckDB — timestamp functions', url: 'https://duckdb.org/docs/sql/functions/timestamp' },
  },
]
