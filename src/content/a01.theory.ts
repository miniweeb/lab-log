import type { TheorySection, Term } from '../types'
import { bi } from '../types'

export const a01Theory: TheorySection[] = [
  {
    level: 'problem',
    heading: bi('Code written against data nobody looked at', 'Code viết cho thứ dữ liệu chưa ai nhìn vào'),
    paras: [
      bi(
        'Most pipeline disasters start the same way: someone wrote code against data they had never actually looked at. Today you do the opposite — you interrogate the raw feed before moving a single byte.',
        'Phần lớn sự cố pipeline lớn đều bắt đầu giống nhau: có ai đó viết code cho thứ dữ liệu mà họ chưa từng thật sự nhìn vào. Hôm nay bạn làm điều ngược lại — bạn khảo sát kỹ feed thô trước khi di chuyển một byte nào.',
      ),
      bi(
        'A CSV is text pretending to be a table. The file on disk is just characters: 1520021227,"47593",308,... There are no types. Nothing in the file says customer_id is a number — that idea lives only in your head, or in code. Every single time you query a CSV, the engine must re-parse every character of every row, even if you only wanted one column. That is why CSV is fine as an exchange format and terrible as a working format.',
        'Một file CSV chỉ là text trông giống bảng. File nằm trên đĩa chỉ là các ký tự: 1520021227,"47593",308,... Không hề có kiểu dữ liệu. Không có gì trong file nói rằng customer_id là một con số — cái đó chỉ tồn tại trong đầu bạn, hoặc trong code. Mỗi lần bạn query một file CSV, engine phải phân tích lại từng ký tự của từng dòng, kể cả khi bạn chỉ cần một cột. Đó là lý do CSV ổn khi làm định dạng TRAO ĐỔI và tồi tệ khi làm định dạng LÀM VIỆC.',
      ),
      bi(
        'And there is a hard ceiling waiting. Month 1 is ~15.7 GB of CSV. A parsed table in RAM is usually larger than the file on disk. Loading all 45 files pandas-style needs 30+ GB of RAM. The machine has 16 GB. When month 2 arrives it is 45+ GB. This is not "slow" — it is impossible, and the OS will kill or thrash the process long before the end.',
        'Và có một giới hạn cứng đang chờ. Tháng một là khoảng 15,7 GB CSV. Một bảng đã parse nằm trong RAM thường LỚN HƠN file trên đĩa. Nạp cả 45 file theo kiểu pandas cần hơn 30 GB RAM. Máy chỉ có 16 GB. Khi tháng hai về thì con số là hơn 45 GB. Đây không phải chuyện "chậm" — đây là chuyện BẤT KHẢ THI, và hệ điều hành sẽ giết hoặc làm process vật vã từ rất lâu trước khi nó xong.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Why is a parsed table in RAM larger than the same data on disk?',
          'Vì sao một bảng đã parse trong RAM lại lớn hơn chính dữ liệu đó trên đĩa?',
        ),
        a: bi(
          'Numbers unpack — the four text characters "1234" become an 8-byte integer — and strings carry per-object overhead. On the baseline machine one 350 MB CSV day ends up around 0.5–2 GB in a pandas process. The ratio, roughly 2× or more, is the point.',
          'Số bị giải nén ra — bốn ký tự văn bản "1234" trở thành một số nguyên 8 byte — và chuỗi thì tốn thêm overhead cho mỗi object. Trên máy chuẩn, một ngày dữ liệu 350 MB dạng CSV chiếm khoảng 0,5 tới 2 GB trong một process pandas. Tỉ lệ đó, khoảng gấp đôi trở lên, mới là điều cần nhớ.',
        ),
      },
    ],
  },
  {
    level: 'alternatives',
    heading: bi('Ways people try to skip the interrogation', 'Những cách người ta hay dùng để bỏ qua bước khảo sát'),
    paras: [],
    alternatives: [
      {
        name: bi('Open it in Excel just to look', 'Mở bằng Excel chỉ để nhìn một chút'),
        appeal: bi('Fast, visual, no code. You see real values immediately.', 'Nhanh, trực quan, không cần code. Thấy giá trị thật ngay lập tức.'),
        breaks: bi(
          'Excel truncates at 1,048,576 rows, reformats dates, and strips leading zeros — and if you save, the file is ruined. The customer_id float-forms in this feed are exactly the kind of scar such round-trips leave. Use Get-Content -TotalCount or a DuckDB LIMIT.',
          'Excel cắt cụt ở dòng thứ 1.048.576, định dạng lại ngày tháng, và bỏ mất các số 0 ở đầu — và nếu bạn bấm lưu thì file coi như hỏng. Những giá trị customer_id ở dạng số thực trong nguồn này chính là dấu vết mà những lần mở-lưu như vậy để lại. Hãy dùng Get-Content -TotalCount hoặc một câu LIMIT trong DuckDB.',
        ),
      },
      {
        name: bi('Let the engine auto-detect the schema', 'Để engine tự dò schema'),
        appeal: bi(
          'Zero configuration, and the tool has seen more CSVs than you have. Why would you type ten column types by hand?',
          'Không cần cấu hình gì, và công cụ đã nhìn thấy nhiều file CSV hơn bạn. Sao phải gõ tay mười kiểu cột?',
        ),
        breaks: bi(
          'Auto-detect reads a sample of rows and guesses. A few weird rows can flip a column\'s type, and tomorrow\'s file may be guessed differently than today\'s. Today you will catch it making a real mistake on this dataset: 0.2% of rows carry customer_id as "47593.0", and that is enough to make the entire column DOUBLE. Sniff when exploring, declare schemas when loading.',
          'Sniffer đọc một mẫu vài dòng rồi đoán. Chỉ vài dòng bất thường là đủ đổi kiểu của cả cột, và file của ngày mai có thể được đoán khác file hôm nay. Hôm nay bạn sẽ thấy nó đoán sai thật sự trên tập dữ liệu này: 0,2% số dòng ghi customer_id thành "47593.0", và chừng đó đủ để biến cả cột thành DOUBLE. Dò kiểu khi khám phá, khai kiểu khi nạp.',
        ),
      },
      {
        name: bi('Just use pandas, it is what everyone knows', 'Cứ dùng pandas, ai cũng biết nó mà'),
        appeal: bi('Familiar API, huge ecosystem, works fine on the 60k-row small scale.', 'API quen thuộc, hệ sinh thái lớn, chạy tốt trên scale small 60 nghìn dòng.'),
        breaks: bi(
          'pandas materializes: read_csv parses the whole file into RAM as a DataFrame before you can touch row one. Memory needed grows with file size. DuckDB streams: it reads the file in chunks, keeps only the small piece it currently needs, and throws each chunk away once processed. A count or an aggregate over a 350 MB file needs only a few hundred MB of working memory — and roughly the same for a 24 GB folder.',
          'pandas materialize dữ liệu: hàm read_csv phân tích cả file vào RAM thành một DataFrame trước khi bạn chạm được vào dòng đầu tiên. Bộ nhớ cần dùng tăng theo kích thước file. DuckDB thì xử lý theo streaming: nó đọc file theo từng khối, chỉ giữ đúng mảnh nhỏ đang cần, và vứt bỏ từng khối sau khi xử lý xong. Một phép đếm hay tổng hợp trên file 350 MB chỉ cần vài trăm MB bộ nhớ làm việc — và với một thư mục 24 GB thì cũng xấp xỉ như vậy.',
        ),
      },
    ],
    checks: [
      {
        q: bi(
          'Auto-detect returns customer_id as DOUBLE. Customer ids with decimal points — what actually happened?',
          'Sniffer trả về customer_id kiểu DOUBLE. Mã khách hàng mà có phần thập phân — chuyện gì đã thật sự xảy ra?',
        ),
        a: bi(
          'A producer round-tripped the ids through a float type somewhere upstream — Excel is a common culprit — leaving values like "47593.0". A few thousandths of the rows are enough to flip auto-detect\'s guess for the ENTIRE column. This is why pipelines do not sniff.',
          'Ở đâu đó phía upstream, một producer đã cho các id này đi qua kiểu float — Excel là thủ phạm hay gặp — để lại những giá trị kiểu "47593.0". Chỉ vài phần nghìn số dòng là đủ để sniffer đoán sai cho CẢ CỘT. Đây chính là lý do pipeline không dò kiểu.',
        ),
      },
    ],
  },
  {
    level: 'idea',
    heading: bi('Look first, declare second, convert third', 'Nhìn trước, khai kiểu sau, chuyển đổi thứ ba'),
    paras: [
      bi(
        'Three moves, in order. Look: spend the first hours producing numbers ABOUT the data instead of code that processes it. Declare: stop letting the engine guess — write the schema down yourself, and land dirty columns as text on purpose. Convert: turn the text file into a columnar typed file once, and never parse it again.',
        'Ba bước, theo đúng thứ tự. Nhìn: dành những giờ đầu để tạo ra các con số VỀ dữ liệu thay vì code XỬ LÝ nó. Khai kiểu: thôi để engine đoán — tự tay viết schema ra, và cố ý đưa các cột bẩn vào ở dạng văn bản. Chuyển đổi: biến file văn bản thành một file columnar và có kiểu, một lần duy nhất, rồi không bao giờ phải phân tích lại nữa.',
      ),
      bi(
        'Parquet is what data engineers convert CSV into. Three properties matter: it is columnar (each column stored separately, so a query touching 2 of 10 columns reads ~20% of the file), typed (the schema is stored in the file — parse once, never again), and compressed (similar values sit next to each other, which compresses well).',
        'Parquet là thứ mà data engineer chuyển CSV thành. Ba tính chất quan trọng: nó columnar (mỗi cột lưu riêng, nên query chạm vào 2 trong 10 cột chỉ đọc khoảng 20% file), có kiểu (schema được lưu ngay trong file — phân tích một lần, không bao giờ lại nữa), và được nén (các giá trị giống nhau nằm cạnh nhau nên nén rất tốt).',
      ),
      bi(
        'That one conversion is the foundation of everything you build in A02 through A15.',
        'Chỉ một bước chuyển đổi đó là nền tảng của mọi thứ bạn xây từ A02 tới A15.',
      ),
    ],
  },
  {
    level: 'mechanism',
    heading: bi('Row groups, and why not reading is the fastest IO', 'Row group, và vì sao không-đọc là cách vào ra nhanh nhất'),
    paras: [
      bi(
        'Inside, a Parquet file is split into row groups — horizontal chunks of ~100k rows (DuckDB\'s default is 122,880). Each row group stores min/max statistics per column, so an engine can skip whole row groups that cannot possibly match your filter.',
        'Bên trong, một file Parquet được chia thành các row group — những khối ngang khoảng 100 nghìn dòng (mặc định của DuckDB là 122.880). Mỗi row group lưu kèm thống kê min/max cho từng cột, nhờ đó engine bỏ qua được nguyên cả row group không thể nào khớp với điều kiện lọc của bạn.',
      ),
      bi(
        'A query with WHERE order_id = 1520000042 compares against each group\'s min/max and skips groups that cannot contain it. Not reading is the fastest IO there is.',
        'Một query có WHERE order_id = 1520000042 sẽ so với cặp min/max của từng nhóm rồi bỏ qua các nhóm không thể chứa nó. Không đọc chính là cách I/O nhanh nhất.',
      ),
      bi(
        'Why is Parquet count(*) near-instant? Because the row count sits in the file\'s metadata — no data pages are read at all. Why is a filter so fast? Partly columnar reading (only store_id is touched), partly row-group skipping. Notice also total_compressed_size in the metadata: items, the JSON blob, dwarfs every other column, and columnar means a query ignoring items never pays for those bytes.',
        'Vì sao count(*) trên Parquet gần như tức thì? Vì số dòng nằm sẵn trong phần metadata của file — không đọc data page nào cả. Vì sao filter lại nhanh đến vậy? Một phần nhờ đọc theo cột (chỉ chạm vào store_id), một phần nhờ bỏ qua row group. Cũng để ý cột total_compressed_size trong metadata: cột items, tức khối JSON, lớn hơn hẳn mọi cột khác, và columnar nghĩa là một query bỏ qua items sẽ không bao giờ phải trả tiền cho đống byte đó.',
      ),
      bi(
        'In A02 you extend this same skipping idea from row groups to whole folders.',
        'Ở A02 bạn sẽ mở rộng đúng ý tưởng bỏ qua này, từ row group lên tới cả thư mục.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Your full-scale day has 10 row groups; your small-scale day has 1. Why does that matter?',
          'Ngày ở scale full của bạn có 10 row group; ngày ở scale small chỉ có 1. Vì sao điều đó lại quan trọng?',
        ),
        a: bi(
          'Skipping only helps if there is something to skip. With one row group there is nothing to prune — which is a good reminder that a performance technique measured on the small scale can look like it does nothing. Measure the mechanism where the mechanism can actually fire.',
          'Việc bỏ qua chỉ có ích khi có thứ để bỏ qua. Với đúng một row group thì chẳng có gì để cắt tỉa — và đó là lời nhắc tốt rằng một kỹ thuật hiệu năng đo trên scale small có thể trông như chẳng làm gì cả. Hãy đo cơ chế ở nơi cơ chế đó thật sự kích hoạt được.',
        ),
      },
    ],
  },
  {
    level: 'detail',
    heading: bi('Two habits that outlive this assignment', 'Hai thói quen sống lâu hơn bài này'),
    paras: [
      bi(
        'Land dirty columns as text, on purpose. In the canonical v1 read, order_ts and order_total are declared VARCHAR deliberately: they contain dirty values, and if you declared TIMESTAMP or DECIMAL the read would fail or lose rows. Production habit: land dirty columns as text, clean them in a staging step (A03), so the raw read never silently drops data.',
        'Đưa cột bẩn vào ở dạng văn bản, một cách có chủ ý. Trong lệnh đọc chuẩn của kỷ nguyên v1, hai cột order_ts và order_total được khai VARCHAR có chủ đích: chúng chứa giá trị bẩn, và nếu bạn khai TIMESTAMP hay DECIMAL thì lệnh đọc sẽ hỏng hoặc mất dòng. Thói quen của môi trường thật: đưa cột bẩn vào ở dạng văn bản, cleaning chúng ở bước staging tại A03, để lệnh đọc thô không bao giờ âm thầm đánh rơi dữ liệu.',
      ),
      bi(
        'Meanwhile customer_id IS declared BIGINT. The reader converts the float-forms ("47593.0" → 47593) and turns empties into NULL. The column is a proper id again — auto-detect\'s DOUBLE mistake is gone. Two columns, opposite decisions, and both are deliberate: that is what "declaring a schema" actually means.',
        'Trong khi đó customer_id thì LẠI được khai BIGINT. Trình đọc chuyển đổi các dạng số thực ("47593.0" thành 47593) và biến ô rỗng thành NULL. Cột này lại là một mã đàng hoàng — lỗi DOUBLE của sniffer đã biến mất. Hai cột, hai quyết định trái ngược, và cả hai đều có chủ đích: đó mới đúng là ý nghĩa của việc "khai một schema".',
      ),
      bi(
        'Never benchmark cold against warm. First read of a file pays the disk; the second comes from OS cache. Run every query twice and record the second run. Comparing a cold run to a warm one is a classic benchmarking sin, and it produces conclusions that are not just imprecise but backwards.',
        'Đừng bao giờ benchmark lần chạy nguội so với lần chạy ấm. Lần đọc đầu tiên trả giá đĩa; lần thứ hai lấy từ OS cache. Chạy mỗi query hai lần và ghi lại lần thứ hai. So lần nguội với lần ấm là lỗi kinh điển khi benchmark, và nó cho ra những kết luận không chỉ thiếu chính xác mà còn ngược hẳn.',
      ),
      bi(
        'And the habit that everything rests on: reading "match=True" as "data is good" is the mistake. The row count matches and the values are still ~3% dirty. Structure parses; values lie. A03 and A05 deal with that.',
        'Và thói quen mà mọi thứ dựa vào: hiểu "match=True" thành "dữ liệu tốt" chính là sai lầm. Số dòng khớp mà giá trị vẫn bẩn khoảng 3%. Cấu trúc thì phân tích được; còn giá trị vẫn có thể sai. A03 và A05 sẽ xử lý chuyện đó.',
      ),
    ],
    checks: [
      {
        q: bi(
          'SUMMARIZE shows order_ts min starting with 01/06/2026 and max being an impossible date. What are both telling you?',
          'Lệnh SUMMARIZE cho thấy order_ts nhỏ nhất bắt đầu bằng 01/06/2026 còn lớn nhất là một ngày bất khả thi. Cả hai đang nói gì với bạn?',
        ),
        a: bi(
          'Both are lies in plain sight. The min sorts first only AS TEXT — it is a day-first format, so the column is not really being ordered by time. The max is a date that cannot exist. Dirty values, parseable structure: this feed\'s signature.',
          'Cả hai đều là những lời không đáng tin lộ rõ. Giá trị nhỏ nhất chỉ đứng đầu khi sắp xếp NHƯ VĂN BẢN — nó ở định dạng ngày-trước, nên cột này thật ra không hề được sắp theo thời gian. Còn giá trị lớn nhất là một ngày không thể tồn tại. Giá trị thì bẩn, cấu trúc thì phân tích được: đó là chữ ký của feed này.',
        ),
      },
    ],
  },
]

export const a01Terms: Term[] = [
  {
    term: 'Schema (sniffed vs explicit)',
    gloss: 'schema (dò ra so với khai tường minh)',
    means: bi(
      'The formal answer to "what columns exist and what type is each one?". Sniffing reads a sample and guesses; explicit means you declare every column yourself. Sniff when exploring, declare when loading.',
      'Câu trả lời chính thức cho câu hỏi "có những cột nào và mỗi cột kiểu gì?". Dò kiểu là đọc một mẫu rồi đoán; khai tường minh là bạn tự khai từng cột. Dò kiểu khi khám phá, khai kiểu khi nạp.',
    ),
    source: { name: 'DuckDB — CSV auto detection', url: 'https://duckdb.org/docs/data/csv/auto_detection' },
  },
  {
    term: 'Materialize vs stream',
    gloss: 'materialize so với streaming',
    means: bi(
      'pandas parses the whole file into RAM before you touch row one. DuckDB reads in chunks and discards each after use, so memory stays flat regardless of file size.',
      'pandas phân tích cả file vào RAM trước khi bạn chạm được dòng đầu tiên. DuckDB đọc theo từng khối và vứt bỏ mỗi khối sau khi dùng, nên bộ nhớ giữ nguyên bất kể file lớn cỡ nào.',
    ),
    source: { name: 'DuckDB docs', url: 'https://duckdb.org/docs/' },
  },
  {
    term: 'RSS (Resident Set Size)',
    gloss: 'RAM thật mà process đang dùng',
    means: bi(
      'The actual physical RAM a process is using — Task Manager\'s "Memory" column shows it. The number you record when you want to say "this approach costs this much memory".',
      'Lượng RAM vật lý mà một process đang thật sự dùng — cột "Memory" trong Task Manager hiển thị nó. Đây là con số bạn ghi lại khi muốn nói "cách làm này tốn từng này bộ nhớ".',
    ),
    source: { name: 'psutil docs', url: 'https://psutil.readthedocs.io/en/latest/' },
  },
  {
    term: 'Parquet',
    gloss: 'định dạng columnar',
    means: bi(
      'Columnar, typed, compressed. A query touching 2 of 10 columns reads ~20% of the file; the schema lives inside the file so nothing is re-parsed.',
      'Columnar, có kiểu, được nén. Một query chạm vào 2 trong 10 cột chỉ đọc khoảng 20% file; schema nằm ngay trong file nên không phải phân tích lại gì cả.',
    ),
    source: { name: 'Apache Parquet docs', url: 'https://parquet.apache.org/docs/' },
  },
  {
    term: 'Row group',
    gloss: 'row group',
    means: bi(
      'A horizontal chunk of ~100k rows inside a Parquet file, carrying min/max stats per column so the engine can skip groups that cannot match.',
      'Một khối ngang khoảng 100 nghìn dòng bên trong file Parquet, mang theo thống kê min/max cho từng cột để engine bỏ qua được các nhóm không thể khớp.',
    ),
    source: { name: 'Apache Parquet — file format', url: 'https://parquet.apache.org/docs/file-format/' },
  },
  {
    term: 'TRY_CAST',
    gloss: 'cast không báo lỗi',
    means: bi(
      'Returns NULL instead of erroring when a cast fails — your main tool for probing dirty columns, because a failure you can count is a failure you can report.',
      'Trả về NULL thay vì báo lỗi khi cast thất bại — công cụ chính để dò cột bẩn, vì một thất bại đếm được là một thất bại báo cáo được.',
    ),
    source: { name: 'DuckDB — casting', url: 'https://duckdb.org/docs/sql/expressions/cast' },
  },
  {
    term: 'Reconciliation',
    gloss: 'reconcile',
    means: bi(
      'Comparing your row count against the producer\'s manifest claim. Runs after every load for the rest of the lab. Never assume a file arrived complete.',
      'So số dòng bạn đếm được với con số producer khai trong manifest. Chạy sau mọi lần nạp, suốt phần còn lại của lab. Đừng bao giờ giả định một file đã về đầy đủ.',
    ),
    source: { name: 'MotherDuck glossary', url: 'https://motherduck.com/glossary/' },
  },
]
