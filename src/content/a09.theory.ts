import type { TheorySection, Term } from '../types'
import { bi } from '../types'

export const a09Theory: TheorySection[] = [
  /* ─────────── TẦNG 1 ─────────── */
  {
    level: 'problem',
    heading: bi(
      'The folder has no transaction',
      'Thư mục thì không có transaction',
    ),
    paras: [
      bi(
        'In A08 the refresh was safe because DELETE and INSERT sat inside one transaction — nobody could see the half-done state. Your Parquet lake gives you none of that. It is files in folders, and BEGIN/COMMIT does not reach them.',
        'Ở A08, phép refresh an toàn vì DELETE và INSERT nằm trong cùng một transaction — không ai nhìn thấy trạng thái làm dở. Parquet lake thì không cho bạn thứ đó. Nó chỉ là file nằm trong thư mục, và BEGIN với COMMIT không với tới được.',
      ),
      bi(
        'While you rewrite a partition, whoever reads it at that moment — a dashboard, a teammate, your own next pipeline step — sees whatever files happen to exist right then: fewer rows, zero rows, duplicates, or an IO error on a file that is still being written. A read that catches this in-between state is a torn read.',
        'Trong lúc bạn ghi lại một partition, ai đọc đúng lúc đó — một dashboard, một đồng nghiệp, hay chính bước sau trong pipeline của bạn — sẽ thấy đúng những file đang tình cờ tồn tại ở thời điểm ấy: ít dòng hơn, không dòng nào, dòng trùng, hoặc một lỗi IO trên file còn đang ghi dở. Một lần đọc rơi vào trạng thái dở dang đó gọi là torn read.',
      ),
      bi(
        'Nothing warns anyone. The wrong number is served as a perfectly normal answer. And this is not perfectionism: the shopcore orders contract declares the data finance-grade and rates double counting a sev-2, so atomicity here is a contractual duty, not a preference.',
        'Không có cảnh báo nào cả. Con số sai được trả về như một câu trả lời hoàn toàn bình thường. Và đây không phải chuyện cầu toàn: contract của shopcore khai dữ liệu này là finance-grade và xếp lỗi đếm trùng ở mức sev-2, nên tính atomic ở đây là nghĩa vụ theo contract chứ không phải sở thích.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Would writing the new files FIRST and deleting the old ones after solve it?',
          'Vậy ghi file mới trước rồi mới xoá file cũ thì có giải quyết được không?',
        ),
        a: bi(
          'No. You just swap one failure for another: instead of a hole, readers see old and new at the same time — double counts, the exact sev-2 the contract names. The order of the two steps is not the problem; the gap between them is.',
          'Không. Bạn chỉ đổi kiểu hỏng này lấy kiểu hỏng khác: thay vì một lỗ hổng, người đọc thấy cả bản cũ lẫn bản mới cùng lúc — tức đếm trùng, đúng cái sev-2 mà contract đã gọi tên. Vấn đề không nằm ở thứ tự hai bước, mà nằm ở khoảng trống giữa chúng.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 2 ─────────── */
  {
    level: 'alternatives',
    heading: bi(
      'Four ways to publish a rewrite, and why three of them are the industry',
      'Bốn cách công bố một lần ghi lại, và vì sao ba trong số đó là cách của cả ngành',
    ),
    paras: [
      bi(
        'The gap is as long as your slowest step. Rebuilding the spike-day partition means scanning eight days of raw CSV, because late corrections for day D arrive in files D..D+7 — you measured that in A08. At full scale that is tens of seconds, on every scheduled refresh, forever.',
        'Khoảng trống dài bằng đúng bước chậm nhất của bạn. Dựng lại partition của ngày cao điểm nghĩa là quét tám ngày CSV thô, vì bản sửa của ngày D về trong các file từ D tới D cộng 7 — bạn đã đo chuyện đó ở A08. Ở scale full thì khoảng trống ấy dài hàng chục giây, lặp lại ở mọi lần refresh theo lịch, mãi mãi.',
      ),
    ],
    alternatives: [
      {
        name: bi('Rewrite in place and accept the window', 'Ghi đè tại chỗ và chấp nhận khoảng hở'),
        appeal: bi(
          'Simplest possible code: delete the folder\'s files, COPY the new result in. No extra directories, no bookkeeping, and the refresh window is only a few seconds anyway — surely nobody queries in exactly that second.',
          'Code đơn giản nhất có thể: xoá file trong thư mục rồi COPY kết quả mới vào. Không thư mục phụ, không sổ sách gì, mà cửa sổ refresh cũng chỉ vài giây — chắc chẳng ai query đúng vào giây đó đâu.',
        ),
        breaks: bi(
          'Someone will. A scheduled dashboard polls on a timer, and it does not know to avoid your refresh. The failure is silent: 0 rows, a partial count, or an IOException — each served as a normal answer. Task 3 makes you watch it happen.',
          'Sẽ có người query đúng lúc đó. Một dashboard chạy theo lịch thì cứ đến giờ là hỏi, và nó không biết phải né lần refresh của bạn. Kiểu hỏng này im lặng: 0 dòng, một con số dở dang, hoặc một IOException — mỗi thứ đều được trả về như một câu trả lời bình thường. Task 3 bắt bạn nhìn tận mắt.',
        ),
      },
      {
        name: bi('Pattern 1 — staging-dir swap (file level)', 'Khuôn 1 — swap bằng thư mục staging, ở mức file'),
        appeal: bi(
          'Build the new partition in a staging folder the readers\' glob cannot see, then os.rename it into place. A rename only rewires directory metadata: microseconds regardless of folder size, and on one volume it either fully happens or does not happen at all.',
          'Dựng partition mới trong một thư mục staging mà glob của người đọc không nhìn thấy, rồi os.rename nó vào đúng chỗ. Phép rename chỉ nối lại metadata của thư mục: mất vài micro giây bất kể thư mục to cỡ nào, và trên cùng một ổ đĩa thì nó hoặc xảy ra trọn vẹn, hoặc không xảy ra.',
        ),
        breaks: bi(
          'Replacing a LIVE folder takes two renames — live to trash, then staging to live — and two renames are not one atomic step. For a few milliseconds the partition does not exist. It is near-atomic, not atomic, and readers need a retry rule to ride through the gap.',
          'Nhưng thay thế một thư mục đang sống thì cần hai lần rename: live sang trash, rồi staging sang live. Mà hai lần rename không phải một bước atomic. Trong vài mili giây, partition đó không tồn tại. Nó gần-atomic chứ không atomic, và người đọc cần một quy tắc thử lại để đi qua khoảng hở.',
        ),
      },
      {
        name: bi('Pattern 2 — table swap in the catalog (warehouse level)', 'Khuôn 2 — swap bảng trong catalog, ở mức warehouse'),
        appeal: bi(
          'Inside the warehouse you need no file tricks at all. Build orders_new as a real table while readers keep using orders, then rename both inside one transaction. The catalog makes it genuinely atomic — both renames become visible together at COMMIT.',
          'Bên trong warehouse thì chẳng cần mẹo file nào. Dựng bảng orders_new như một bảng thật trong lúc người đọc vẫn dùng bảng orders, rồi đổi tên cả hai trong cùng một transaction. Catalog làm cho việc đó atomic thật sự: cả hai phép đổi tên cùng hiện ra tại thời điểm COMMIT.',
        ),
        breaks: bi(
          'It protects only connections to the warehouse, and only within the single-writer rule you meet head-on in A12. It does nothing for Parquet readers — those files live outside the catalog, which is the entire reason patterns 1 and 3 exist.',
          'Nó chỉ bảo vệ những kết nối tới warehouse, và cũng chỉ trong giới hạn của luật một-writer mà bạn sẽ đụng thẳng ở A12. Nó không giúp gì cho người đọc Parquet: mấy file đó nằm ngoài catalog, và đó chính là lý do tồn tại của khuôn 1 và khuôn 3.',
        ),
      },
      {
        name: bi('Pattern 3 — versioned dirs + view repoint (lake + catalog)', 'Khuôn 3 — thư mục có version cộng với trỏ lại view, ở mức lake và catalog'),
        appeal: bi(
          'Never touch a published folder at all. Each rewrite publishes a whole new version folder, and a view is re-created to point at the newest one. CREATE OR REPLACE VIEW is a catalog change, so the flip is atomic. Old versions stay: free rollback and free time travel.',
          'Không bao giờ đụng vào một thư mục đã công bố. Mỗi lần ghi lại thì công bố hẳn một thư mục version mới, rồi tạo lại view để trỏ vào cái mới nhất. Câu CREATE OR REPLACE VIEW là một thay đổi trong catalog, nên cú lật đó atomic. Các version cũ vẫn nằm đó: rollback miễn phí và xem lại dữ liệu quá khứ cũng miễn phí.',
        ),
        breaks: bi(
          'A naive copy duplicates the whole lake on every publish — a few hundred MB at small scale, several GB at full. That pain is exactly why Iceberg and Delta Lake exist: they keep the versioned-pointer idea but track individual files in metadata, so version N+1 reuses every unchanged file.',
          'Cách làm ngây thơ là copy, và nó nhân đôi cả cái lake ở mỗi lần công bố: vài trăm MB ở scale small, vài GB ở scale full. Đúng cái đau đó là lý do Iceberg và Delta Lake ra đời: chúng giữ ý tưởng con trỏ theo version, nhưng theo dõi từng file trong metadata, nên version N cộng 1 dùng lại mọi file không đổi.',
        ),
      },
    ],
    checks: [
      {
        q: bi(
          'Why must staging and trash live on the same drive as the lake?',
          'Vì sao staging và trash phải nằm cùng ổ đĩa với lake?',
        ),
        a: bi(
          'Because a cross-drive rename is not a rename. The OS silently turns it into copy plus delete: minutes of non-atomic exposure instead of microseconds. The whole guarantee comes from the fact that a same-volume rename only edits directory metadata.',
          'Vì rename qua ổ khác thì không còn là rename. Hệ điều hành lặng lẽ biến nó thành copy rồi delete: phơi ra hàng phút trạng thái không atomic thay vì vài micro giây. Toàn bộ đảm bảo ở đây đến từ chỗ rename trong cùng một ổ chỉ sửa metadata của thư mục.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 3 ─────────── */
  {
    level: 'idea',
    heading: bi(
      'One idea at three levels',
      'Một ý tưởng, ba mức áp dụng',
    ),
    paras: [
      bi(
        'Never modify what readers are looking at. Build the new version somewhere invisible, then publish it with one cheap, near-instant switch. That single sentence generates all three patterns; they differ only in what the switch is — a directory rename, a catalog rename, or a view repoint.',
        'Đừng bao giờ sửa thứ mà người đọc đang nhìn. Dựng phiên bản mới ở một chỗ vô hình, rồi công bố nó bằng đúng một cú chuyển rẻ và gần như tức thời. Một câu đó sinh ra cả ba khuôn; chúng chỉ khác nhau ở chỗ cú chuyển là gì: đổi tên thư mục, đổi tên trong catalog, hay trỏ lại một view.',
      ),
      bi(
        'The point is the ratio, not the speed. The rebuild is still slow — 2 to 3 seconds at small scale, roughly 10 to 60 at full. Publishing is about 4 milliseconds. You did not make the work faster; you moved all of it off-stage so the exposed window shrank from seconds to milliseconds.',
        'Trọng tâm là tỉ lệ chứ không phải tốc độ. Việc dựng lại vẫn chậm: 2 tới 3 giây ở scale small, chừng 10 tới 60 giây ở scale full. Còn công bố thì khoảng 4 mili giây. Bạn không làm cho công việc nhanh hơn; bạn dời toàn bộ nó ra sau hậu trường, để khoảng thời gian bị phơi ra co từ hàng giây xuống hàng mili giây.',
      ),
      bi(
        'And "invisible" is a literal requirement about the readers\' glob, not a vibe. Staging is a sibling of orders/, never a child of it. Task 4 shows what happens when you get that wrong.',
        'Còn chữ "vô hình" là một yêu cầu rất cụ thể về cái glob mà người đọc dùng, không phải chuyện cảm tính. Staging phải là anh em cùng cấp với thư mục orders, không bao giờ nằm bên trong nó. Task 4 cho thấy chuyện gì xảy ra khi bạn làm sai chỗ đó.',
      ),
    ],
    checks: [
      {
        q: bi(
          'You stage into order_date=2026-06-19.__tmp__ inside orders/. What does the analyst see?',
          'Bạn staging vào thư mục order_date=2026-06-19.__tmp__ nằm trong orders. Người phân tích sẽ thấy gì?',
        ),
        a: bi(
          'Double the rows. The reader glob */*.parquet matches the tmp folder, and the filter order_date = DATE \'2026-06-19\' still matches it because DuckDB\'s DATE cast ignores trailing text. A dot-prefixed name is worse: the glob still matches, and the mismatched folder name breaks every reader with a Hive partition mismatch.',
          'Số dòng gấp đôi. Cái glob */*.parquet của người đọc khớp luôn thư mục tmp, và điều kiện order_date bằng ngày 2026-06-19 vẫn khớp, vì phép cast sang DATE của DuckDB bỏ qua phần đuôi thừa. Đặt tên có dấu chấm ở đầu còn tệ hơn: glob vẫn khớp, mà tên thư mục sai khuôn thì làm mọi người đọc gãy với lỗi Hive partition mismatch.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 4 ─────────── */
  {
    level: 'mechanism',
    heading: bi(
      'What each switch actually does',
      'Từng cú chuyển thật ra làm gì',
    ),
    paras: [
      bi(
        'A same-volume rename edits directory metadata and nothing else. It does not read or move a single byte of your Parquet files, which is why a 1 GB partition publishes in the same few milliseconds as a 1 MB one. That property — constant time, all-or-nothing — is the entire mechanism of pattern 1.',
        'Một phép rename trong cùng ổ đĩa chỉ sửa metadata của thư mục, không làm gì khác. Nó không đọc và không di chuyển một byte nào trong file Parquet của bạn, và vì thế một partition 1 GB được công bố trong đúng vài mili giây như một partition 1 MB. Cái tính chất đó — thời gian không đổi, và toàn bộ hoặc không gì cả — chính là toàn bộ cơ chế của khuôn 1.',
      ),
      bi(
        'Replacing a live folder needs two of them, so the safety does not come from atomicity but from an invariant: at every instant, staging or trash still holds a complete copy. That is what makes recover() possible. If live is missing and staging has parquet files, finish the swap forward; if only trash survived, roll back to the newest one. Nothing is ever destroyed before its replacement exists.',
          'Thay một thư mục đang sống thì cần hai phép như vậy, nên sự an toàn không đến từ tính atomic mà đến từ một bất biến: ở mọi thời điểm, staging hoặc trash vẫn đang giữ một bản đầy đủ. Chính nó làm cho hàm recover chạy được. Nếu live biến mất mà staging có file parquet thì đi tiếp cho xong cú swap; nếu chỉ còn trash thì lùi về bản trash mới nhất. Không có thứ gì bị huỷ trước khi bản thay thế của nó tồn tại.',
      ),
      bi(
        'Retry-on-read is the reader\'s half of the deal. The reader knows this partition has data, so a count of 0 cannot be an answer — it can only mean a swap is in flight. Fifteen attempts at 0.3 s outlast any real gap, and the cost is that an answer sometimes arrives a beat later instead of arriving wrong.',
        'Retry-on-read là phần việc của phía người đọc. Người đọc biết partition này có dữ liệu, nên con số 0 không thể là một câu trả lời — nó chỉ có thể nghĩa là đang có một cú swap diễn ra. Mười lăm lần thử, mỗi lần cách 0,3 giây, thừa sức chờ qua mọi khoảng hở thật, và cái giá phải trả chỉ là đôi khi câu trả lời về chậm một nhịp thay vì về sai.',
      ),
      bi(
        'Rename also fails, and that is normal on Windows. While any process holds a file inside the folder open — a reader mid-scan, the search indexer, an antivirus — os.rename raises PermissionError. Readers hold files for milliseconds, so a short retry loop wins. Unglamorous, and not optional in production.',
        'Phép rename cũng có lúc lỗi, và trên Windows thì đó là chuyện bình thường. Khi có bất kỳ tiến trình nào đang mở một file bên trong thư mục — một người đọc đang quét dở, trình lập chỉ mục của Windows, hay phần mềm diệt virus — thì os.rename ném ra PermissionError. Người đọc chỉ giữ file trong vài mili giây, nên một vòng thử lại ngắn là thắng. Chẳng có gì hào nhoáng, nhưng ở môi trường thật thì không được bỏ.',
      ),
      bi(
        'The rebuilt file must match the lake\'s file schema exactly, byte-for-byte in shape. Two rules pull in opposite directions: drop order_date, because the folder name carries the partition value and PARTITION_BY files do not contain that column — but keep order_ts_clean, because the A02 loader wrote it into every lake file and a glob read wants one schema across all of them.',
        'File được dựng lại phải khớp chính xác schema của các file trong lake. Có hai quy tắc kéo về hai phía ngược nhau: bỏ cột order_date, vì tên thư mục đã mang giá trị partition rồi và các file do PARTITION_BY ghi ra không chứa cột đó — nhưng phải giữ cột order_ts_clean, vì loader của A02 đã ghi nó vào mọi file trong lake, mà một lần đọc bằng glob thì đòi mọi file cùng một schema.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Your rebuilt file keeps order_date. Nothing errors today. What breaks later?',
          'File bạn dựng lại vẫn giữ cột order_date. Hôm nay không lỗi gì. Vậy sau này hỏng ở đâu?',
        ),
        a: bi(
          'Every multi-partition read. A glob over all partitions needs one schema across all files; your one odd file has a column the others do not, and Task 8 or A10 dies with a schema mismatch. Same class of bug as dropping order_ts_clean, in the opposite direction — and both are invisible until someone reads more than one partition.',
          'Mọi lần đọc nhiều partition cùng lúc. Một glob trải trên tất cả partition đòi mọi file cùng một schema; riêng file của bạn lại có thêm một cột mà các file khác không có, và Task 8 hoặc A10 sẽ chết vì schema mismatch. Cùng loại bug với việc lỡ bỏ cột order_ts_clean, chỉ ngược chiều — và cả hai đều vô hình cho tới khi có người đọc nhiều hơn một partition.',
        ),
      },
      {
        q: bi(
          'Mid-transaction in Task 8, the reader connection prints the OLD count. Why is that the correct result?',
          'Ở Task 8, giữa lúc transaction đang mở, kết nối của người đọc in ra số dòng CŨ. Vì sao đó lại là kết quả đúng?',
        ),
        a: bi(
          'Because the two ALTER TABLE renames are not visible until COMMIT — the catalog makes them appear together or not at all. The reader is never shown a moment where the old name is gone and the new one has not arrived. That is exactly the guarantee a folder cannot give you.',
          'Vì hai lệnh ALTER TABLE đổi tên chưa hiện ra cho tới khi COMMIT — catalog làm cho chúng cùng xuất hiện, hoặc không cái nào xuất hiện. Người đọc không bao giờ bị đưa vào khoảnh khắc mà tên cũ đã mất còn tên mới thì chưa tới. Đó đúng là thứ đảm bảo mà một thư mục không thể cho bạn.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 5 ─────────── */
  {
    level: 'detail',
    heading: bi(
      'What still bites, and what to keep',
      'Những chỗ vẫn cắn được, và thứ nên giữ lại',
    ),
    paras: [
      bi(
        'Do not delete the old generation immediately. The trashed copy IS your rollback, and it costs only disk until the new version is verified. A janitor prunes old trash later — with N never set to 0.',
        'Đừng xoá thế hệ cũ ngay lập tức. Bản nằm trong trash chính là đường lùi của bạn, và nó chỉ tốn dung lượng đĩa cho tới khi bản mới được kiểm chứng. Một script dọn dẹp sẽ tỉa bớt trash cũ sau, với ngưỡng N không bao giờ đặt bằng 0.',
      ),
      bi(
        'Never rewrite by COPYing into the live folder with OVERWRITE_OR_IGNORE. Readers see old plus new duplicates while it runs, and it can silently overwrite an existing data_0.parquet — eating the late-correction files your A02 loader appended. If your Task 1 before-count looks strangely tiny, that already happened to you.',
        'Đừng bao giờ ghi lại bằng cách COPY thẳng vào thư mục live với tuỳ chọn OVERWRITE_OR_IGNORE. Trong lúc chạy thì người đọc thấy cả bản cũ lẫn bản mới nên đếm trùng, và nó có thể lặng lẽ đè lên file data_0.parquet đang có — ăn mất các file bản sửa trễ mà loader của A02 đã ghi thêm. Nếu số dòng trước khi sửa ở Task 1 của bạn nhỏ một cách lạ lùng, thì chuyện đó đã xảy ra với bạn rồi.',
      ),
      bi(
        'And do not over-trust BEGIN/COMMIT. Transactions guard the catalog — tables and views. Files on disk are on their own. That single boundary is why one assignment needs three patterns instead of one.',
        'Và đừng tin BEGIN với COMMIT quá mức. Transaction bảo vệ catalog, tức là các bảng và view. Còn file trên đĩa thì tự lo. Đúng cái ranh giới đó là lý do một bài phải có ba khuôn thay vì một.',
      ),
      bi(
        'Pattern 3 is the one worth recognizing outside this lab. Consumers query core.lake_orders and never a folder path — that indirection is the whole trick, and it is the poor man\'s Iceberg. The industrial table formats keep the current-version pointer in metadata files and rewrite only changed data files, which is the copytree pain removed.',
        'Khuôn 3 là thứ đáng nhận ra ở ngoài phạm vi lab này. Bên tiêu thụ query vào core.lake_orders chứ không bao giờ vào một đường dẫn thư mục — cái lớp gián tiếp đó chính là toàn bộ mẹo, và nó là phiên bản nhà nghèo của Iceberg. Các table format công nghiệp giữ con trỏ version hiện hành trong file metadata và chỉ ghi lại những file dữ liệu có thay đổi, tức là đã gỡ đúng cái đau của copytree.',
      ),
      bi(
        'This thread keeps running. A10 reads across many partitions, which is what punishes a schema-mismatched rebuilt file. A11 replays this per-day publish over history. A12 makes you meet the single-writer rule that quietly limited pattern 2 all along.',
        'Sợi chỉ này còn chạy tiếp. A10 sẽ đọc xuyên nhiều partition, và đó là chỗ trừng phạt một file dựng lại bị lệch schema. A11 sẽ chạy lại cú công bố theo từng ngày này trên toàn bộ lịch sử. A12 thì cho bạn đụng thẳng vào luật một-writer, thứ vẫn âm thầm giới hạn khuôn 2 từ đầu tới giờ.',
      ),
    ],
    checks: [
      {
        q: bi(
          'The stretch goal writes a _current.json listing the exact files of the current version. Why does that beat the two-rename swap?',
          'Bài mở rộng bảo ghi một file _current.json liệt kê đúng những file thuộc phiên bản hiện hành. Vì sao cách đó hơn cú swap hai lần rename?',
        ),
        a: bi(
          'Because publishing becomes os.replace of one small file, which is atomic on Windows — the two-rename gap disappears entirely, so readers need no retry rule. Readers scan the listed files instead of globbing. That is the core of a table format\'s snapshot, built by hand.',
          'Vì lúc đó việc công bố chỉ còn là os.replace một file nhỏ, mà thao tác đó atomic trên Windows — khoảng hở giữa hai lần rename biến mất hoàn toàn, nên người đọc không cần quy tắc thử lại nữa. Người đọc quét đúng danh sách file trong đó thay vì dùng glob. Đó chính là lõi của cơ chế snapshot trong một table format, được dựng bằng tay.',
        ),
      },
    ],
  },
]

export const a09Terms: Term[] = [
  {
    term: 'Atomic',
    gloss: 'toàn bộ hoặc không gì cả',
    means: bi(
      'A change every reader sees as complete-old or complete-new, never as a mix. In A07 a transaction gave you this for free inside the warehouse; a folder of files gives you nothing.',
      'Một thay đổi mà mọi người đọc đều chỉ thấy hoặc trọn bản cũ, hoặc trọn bản mới, không bao giờ thấy pha trộn. Ở A07, một transaction cho bạn điều đó miễn phí bên trong warehouse; còn một thư mục đầy file thì không cho gì cả.',
    ),
    source: {
      name: 'DuckDB — Transaction management',
      url: 'https://duckdb.org/docs/sql/statements/transactions',
    },
  },
  {
    term: 'Torn read',
    gloss: 'lần đọc rơi vào trạng thái dở dang',
    means: bi(
      'A read that catches a rewrite half-done: fewer rows, zero rows, duplicates, or an IO error on a file still being written. It is served as a normal answer, with no warning that it is wrong.',
      'Một lần đọc rơi đúng vào lúc ghi lại đang dở: ít dòng hơn, không dòng nào, dòng trùng, hoặc lỗi IO trên file còn đang ghi. Nó được trả về như một câu trả lời bình thường, không có cảnh báo nào cho biết nó sai.',
    ),
    source: {
      name: 'MotherDuck — Data engineering glossary',
      url: 'https://motherduck.com/learn-more/data-engineering-glossary/',
    },
  },
  {
    term: 'Staging-dir swap',
    gloss: 'dựng ở thư mục staging rồi đổi tên vào chỗ',
    means: bi(
      'Build the new partition where the readers\' glob cannot reach — a sibling of orders/, not a child — then rename it into place. The slow rebuild happens off-stage; only the rename is visible.',
      'Dựng partition mới ở chỗ mà glob của người đọc không với tới — là thư mục anh em cùng cấp với orders, không phải nằm trong nó — rồi đổi tên nó vào đúng chỗ. Phần dựng lại chậm chạp diễn ra sau hậu trường; chỉ có phép đổi tên là hiện ra.',
    ),
    source: {
      name: 'Python — os.rename / os.replace',
      url: 'https://docs.python.org/3/library/os.html#os.replace',
    },
  },
  {
    term: 'Same-volume rename',
    gloss: 'đổi tên trong cùng một ổ đĩa',
    means: bi(
      'Rewires directory metadata only — microseconds regardless of folder size, and all-or-nothing. Across drives the OS silently turns it into copy plus delete: minutes of non-atomic exposure.',
      'Chỉ nối lại metadata của thư mục — mất vài micro giây bất kể thư mục lớn cỡ nào, và theo kiểu toàn bộ hoặc không gì cả. Còn qua ổ đĩa khác thì hệ điều hành lặng lẽ biến nó thành copy rồi delete: phơi ra hàng phút trạng thái không atomic.',
    ),
    source: {
      name: 'Python — os.rename / os.replace',
      url: 'https://docs.python.org/3/library/os.html#os.replace',
    },
  },
  {
    term: 'Retry-on-read',
    gloss: 'gặp trạng thái vô lý thì thử lại',
    means: bi(
      'The reader knows the partition has data, so 0 rows or a vanished file can only mean a swap is in flight. Retrying a few times converts a wrong answer into an answer that arrives a beat later.',
      'Người đọc biết partition này có dữ liệu, nên 0 dòng hay một file biến mất chỉ có thể nghĩa là đang có cú swap diễn ra. Thử lại vài lần biến một câu trả lời sai thành một câu trả lời về chậm một nhịp.',
    ),
    source: {
      name: 'DuckDB — Reading Parquet files',
      url: 'https://duckdb.org/docs/data/parquet/overview',
    },
  },
  {
    term: 'Trash generation',
    gloss: 'thế hệ cũ giữ trong thùng rác',
    means: bi(
      'The old partition renamed aside instead of deleted. It IS the rollback, and it costs only disk until the new version is verified. Prune it later with a janitor — never with N = 0.',
      'Partition cũ được đổi tên dời sang một bên thay vì xoá. Nó chính là đường lùi, và chỉ tốn dung lượng đĩa cho tới khi bản mới được kiểm chứng. Tỉa nó sau bằng một script dọn dẹp, và đừng bao giờ đặt ngưỡng bằng 0.',
    ),
    source: {
      name: 'Apache Iceberg — Maintenance',
      url: 'https://iceberg.apache.org/docs/latest/maintenance/',
    },
  },
  {
    term: 'Catalog atomicity',
    gloss: 'tính atomic do catalog đảm bảo',
    means: bi(
      'Two ALTER TABLE renames inside one transaction become visible together at COMMIT. It guards tables and views — connections to the warehouse — and does nothing for Parquet files on disk.',
      'Hai lệnh ALTER TABLE đổi tên nằm trong cùng một transaction sẽ cùng hiện ra tại thời điểm COMMIT. Nó bảo vệ các bảng và view, tức là những kết nối tới warehouse, còn file Parquet trên đĩa thì nó không giúp được gì.',
    ),
    source: {
      name: 'DuckDB — ALTER TABLE',
      url: 'https://duckdb.org/docs/sql/statements/alter_table',
    },
  },
  {
    term: 'Versioned dirs + view repoint',
    gloss: 'thư mục theo version, view trỏ lại',
    means: bi(
      'Publish a whole new version folder and re-create the view to point at it. Consumers query the view, never a path. CREATE OR REPLACE VIEW is a catalog change, so the flip is atomic.',
      'Công bố hẳn một thư mục version mới rồi tạo lại view trỏ vào đó. Bên tiêu thụ query vào view chứ không bao giờ vào một đường dẫn. Câu CREATE OR REPLACE VIEW là thay đổi trong catalog, nên cú lật đó atomic.',
    ),
    source: {
      name: 'DuckDB — CREATE VIEW',
      url: 'https://duckdb.org/docs/sql/statements/create_view',
    },
  },
  {
    term: 'Table format (Iceberg / Delta Lake)',
    gloss: 'định dạng bảng cho file lake',
    means: bi(
      'The industrial version of pattern 3: the current-version pointer lives in metadata files and only changed data files are rewritten, so version N+1 reuses every unchanged file instead of copying the lake.',
      'Phiên bản công nghiệp của khuôn 3: con trỏ version hiện hành nằm trong các file metadata, và chỉ những file dữ liệu có thay đổi mới bị ghi lại, nên version N cộng 1 dùng lại mọi file không đổi thay vì copy cả cái lake.',
    ),
    source: {
      name: 'Apache Iceberg — Table spec',
      url: 'https://iceberg.apache.org/spec/',
    },
  },
  {
    term: 'Schema match on rebuilt files',
    gloss: 'file dựng lại phải khớp schema của lake',
    means: bi(
      'Drop order_date, because the folder name carries it and PARTITION_BY files omit it; keep order_ts_clean, because every existing lake file has it. A glob read needs one schema across all files.',
      'Bỏ cột order_date, vì tên thư mục đã mang giá trị đó và các file do PARTITION_BY ghi ra không có cột này; nhưng giữ cột order_ts_clean, vì mọi file đang có trong lake đều có nó. Một lần đọc bằng glob đòi mọi file cùng một schema.',
    ),
    source: {
      name: 'DuckDB — Hive partitioning',
      url: 'https://duckdb.org/docs/data/partitioning/hive_partitioning',
    },
  },
  {
    term: 'Crash-safety invariant',
    gloss: 'bất biến giúp sống sót khi crash',
    means: bi(
      'At every instant, staging or trash still holds a complete copy — nothing is destroyed before its replacement exists. That is what lets recover() decide: finish forward, or roll back.',
      'Ở mọi thời điểm, staging hoặc trash vẫn đang giữ một bản đầy đủ — không thứ gì bị huỷ trước khi bản thay thế của nó tồn tại. Chính điều đó cho phép hàm recover quyết định: đi tiếp cho xong, hay lùi lại.',
    ),
    source: {
      name: 'Apache Iceberg — Table spec',
      url: 'https://iceberg.apache.org/spec/',
    },
  },
]