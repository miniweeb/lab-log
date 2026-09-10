import type { TheorySection, Term } from '../types'
import { bi } from '../types'

export const a09Theory: TheorySection[] = [
  /* ─────────── TẦNG 1 ─────────── */
  {
    level: 'problem',
    heading: bi(
      'While you rewrite a folder, someone is reading it',
      'Bạn đang ghi lại thư mục thì có người đọc nó',
    ),
    paras: [
      bi(
        'In A08 you refreshed partitions with delete+insert inside a transaction, so nobody could ever see the half-done state. Your Parquet lake has no transactions. It is files in folders.',
        'Ở A08, bạn refresh partition bằng delete rồi insert, gói trong một transaction, nên không ai thấy được trạng thái dở dang. Parquet lake thì không có transaction. Nó chỉ là file nằm trong thư mục.',
      ),
      bi(
        'So while a partition is being rewritten, whoever reads it right then — a dashboard, a teammate, your own next pipeline step — gets whatever files happen to exist at that instant. Partial data. Duplicates. Or an IO error because a file vanished mid-scan.',
        'Nên trong lúc một partition đang được ghi lại, ai đọc vào đúng lúc đó — một dashboard, một đồng nghiệp, hay chính bước tiếp theo trong pipeline của bạn — sẽ nhận về đúng những file đang có mặt tại thời điểm ấy. Có khi thiếu dữ liệu. Có khi trùng. Có khi lỗi IO vì file biến mất giữa lúc quét.',
      ),
      bi(
        'And nothing warns them. The query returns a number, the dashboard draws a chart, and the number is wrong.',
        'Mà chẳng có gì báo cho họ biết. Query vẫn trả về một con số, dashboard vẫn vẽ ra biểu đồ, chỉ có điều con số đó sai.',
      ),
      bi(
        'This is not perfectionism. The shopcore orders contract declares the data finance-grade in its consumer block, and rates double counting a sev-2. Publishing atomically is something you owe under a signed document.',
        'Đây không phải chuyện cầu toàn. Contract của feed shopcore ghi rõ trong phần dành cho bên tiêu thụ rằng dữ liệu này dùng cho tài chính, và xếp việc đếm trùng ở mức sev-2. Công bố dữ liệu một cách atomic là nghĩa vụ đã ký, không phải sở thích kỹ thuật.',
      ),
    ],
    checks: [
      {
        q: bi(
          'How long is the dangerous window, in practice?',
          'Cửa sổ nguy hiểm đó kéo dài bao lâu?',
        ),
        a: bi(
          'As long as your slowest step. Rebuilding one spike-day partition means scanning eight days of raw CSV, because late corrections for day D arrive in files D through D+7. At small scale that rebuild took about 11 seconds on the lab machine; at full scale it is tens of seconds. And it happens on every scheduled refresh, forever.',
          'Bằng đúng bước chậm nhất của bạn. Dựng lại một partition của ngày cao điểm nghĩa là quét tám ngày CSV thô, vì bản sửa của ngày D nằm rải trong các file từ D tới D cộng 7. Trên máy của lab, riêng phần dựng lại mất khoảng 11 giây ở scale small; ở full là vài chục giây. Và nó lặp lại ở mọi lần refresh theo lịch, mãi mãi.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 2 ─────────── */
  {
    level: 'alternatives',
    heading: bi(
      'Reordering the two steps does not save you',
      'Đảo thứ tự hai bước cũng không cứu được',
    ),
    paras: [
      bi(
        'An in-place rewrite is always two steps with a gap between them. You can choose which failure the gap produces; you cannot remove it.',
        'Ghi đè tại chỗ luôn là hai bước, và giữa hai bước có một khoảng trống. Bạn chọn được khoảng trống đó gây ra kiểu hỏng nào, chứ không bỏ được nó đi.',
      ),
    ],
    alternatives: [
      {
        name: bi('Delete the old files, then write the new ones', 'Xoá file cũ trước, rồi ghi file mới'),
        appeal: bi(
          'It matches how you think about the job: clear the folder, put the new version in. No moment where old and new coexist, so no double counting.',
          'Nó khớp với cách bạn nghĩ về công việc: dọn thư mục xong thì bỏ bản mới vào. Không có lúc nào bản cũ và bản mới cùng nằm đó, nên không sợ đếm trùng.',
        ),
        breaks: bi(
          'During the gap the reader sees fewer rows, or zero rows, or gets "IO Error: Cannot open file" because DuckDB was scanning a file that disappeared. A count of zero is not an error message — it is an answer, and it looks like one.',
          'Nhưng trong khoảng trống đó, người đọc thấy ít dòng hơn, hoặc không thấy dòng nào, hoặc nhận lỗi không mở được file vì DuckDB đang quét đúng cái file vừa biến mất. Mà số 0 thì không phải thông báo lỗi. Nó là một câu trả lời, và trông y như một câu trả lời thật.',
        ),
      },
      {
        name: bi('Write the new files first, then delete the old ones', 'Ghi file mới trước, rồi mới xoá file cũ'),
        appeal: bi(
          'The reverse instinct, and a reasonable one: at no point is the folder empty, so nobody can ever read zero rows.',
          'Phản xạ ngược lại, và cũng có lý: không lúc nào thư mục rỗng cả, nên không ai đọc ra 0 dòng được.',
        ),
        breaks: bi(
          'Now the gap shows old and new at the same time. Every order in that partition is counted twice. The contract rates that sev-2 — and unlike a zero, a doubled number can sit in a report for weeks.',
          'Đổi lại, khoảng trống bây giờ cho thấy cả bản cũ lẫn bản mới. Mọi đơn hàng trong partition đó bị đếm hai lần. Contract xếp việc này ở mức sev-2 — và khác với số 0, một con số bị nhân đôi có thể nằm yên trong báo cáo hàng tuần liền mà không ai nghi.',
        ),
      },
      {
        name: bi('Just refresh at 3 a.m. and hope', 'Cứ chạy refresh lúc 3 giờ sáng rồi cầu may'),
        appeal: bi(
          'Nobody queries at 3 a.m. Zero code, zero design, and for a small internal dataset it genuinely works for a while.',
          '3 giờ sáng thì có ai query đâu. Không phải viết dòng code nào, không phải thiết kế gì, mà với một tập dữ liệu nội bộ nhỏ thì đúng là chạy được một thời gian.',
        ),
        breaks: bi(
          'It works until the first scheduled job in another timezone, the first retry that lands at 9 a.m., or the first backfill that runs for two hours in the middle of the day. You have not fixed anything, you have narrowed the odds — and nobody will remember that when the number is wrong.',
          'Chạy được cho tới cái job đầu tiên chạy theo múi giờ khác, cho tới lần retry đầu tiên rơi vào 9 giờ sáng, hoặc lần backfill đầu tiên kéo hai tiếng giữa ban ngày. Bạn không sửa được gì cả, chỉ làm xác suất nhỏ lại — và lúc con số sai thì chẳng ai nhớ tới chuyện xác suất.',
        ),
      },
      {
        name: bi('Build aside, then publish with one switch', 'Dựng ở chỗ khác, rồi công bố bằng một cú chuyển'),
        appeal: bi(
          'Never touch what readers are looking at. The slow work happens somewhere invisible, and going live is one cheap operation that either happened or did not.',
          'Không đụng vào thứ người đọc đang nhìn. Phần việc chậm diễn ra ở một chỗ không ai thấy, còn lúc đưa lên thì chỉ là một thao tác rẻ, hoặc xong hẳn hoặc chưa xảy ra.',
        ),
        breaks: bi(
          'It costs disk — for a while, two copies of the partition exist. And the switch is only near-instant, not instant: on files it takes two renames, and between them the partition is briefly absent. That gap is about 4 milliseconds, and Task 6 has you widen it on purpose to prove it is there.',
          'Cái giá là dung lượng: trong một lúc, partition tồn tại hai bản. Với lại cú chuyển chỉ gần như tức thì chứ không tức thì: trên file thì nó là hai lệnh rename, và giữa hai lệnh đó partition biến mất một chốc. Khoảng đó chừng 4 mili giây, và Task 6 sẽ bắt bạn cố tình kéo dài nó ra để thấy rằng nó có thật.',
        ),
      },
    ],
    checks: [
      {
        q: bi(
          'Why is a rename cheap no matter how big the folder is?',
          'Vì sao lệnh rename rẻ, kể cả khi thư mục rất lớn?',
        ),
        a: bi(
          'Because it does not move any bytes. It rewires directory metadata — the entry pointing at that folder changes name, the data stays exactly where it is. Microseconds for a folder of any size, as long as both names are on the same volume.',
          'Vì nó không chuyển đi byte nào. Nó chỉ sửa lại metadata của thư mục: cái mục trỏ tới thư mục đó đổi tên, còn dữ liệu vẫn nằm nguyên chỗ cũ. Thư mục to cỡ nào cũng chỉ vài micro giây, miễn là hai cái tên nằm trên cùng một ổ đĩa.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 3 ─────────── */
  {
    level: 'idea',
    heading: bi(
      'One idea, three levels',
      'Một ý tưởng, ba tầng áp dụng',
    ),
    paras: [
      bi(
        'The whole assignment is one sentence: never modify what readers are looking at. Build the new version somewhere invisible, then publish it with one cheap switch.',
        'Cả bài gói trong một câu: đừng sửa thứ mà người đọc đang nhìn. Dựng bản mới ở một chỗ họ không thấy, rồi công bố nó bằng một cú chuyển rẻ tiền.',
      ),
      bi(
        'At file level that is a staging-dir swap: write the new partition into a folder that readers\' globs cannot match, then rename it into place.',
        'Ở tầng file, đó là đổi chỗ thư mục staging: ghi partition mới vào một thư mục mà mẫu glob của người đọc không quét tới, rồi rename nó vào đúng vị trí.',
      ),
      bi(
        'At warehouse level it is a table swap: build orders_new as a real table while readers keep using orders, then rename both tables inside one transaction. Here the catalog does the work, and it is genuinely atomic — no two-step gap at all.',
        'Ở tầng warehouse, đó là đổi chỗ bảng: dựng orders_new thành một bảng thật trong lúc người đọc vẫn dùng bảng orders, rồi đổi tên cả hai bảng trong cùng một transaction. Ở đây catalog làm phần việc đó, và nó atomic thật sự, không còn khoảng trống hai bước nào.',
      ),
      bi(
        'At lake level it is versioned dirs plus a view repoint: never touch a published folder at all. Each rewrite publishes a whole new orders_v=<ts>/ folder, and the view is re-created to point at the newest one.',
        'Ở tầng lake, đó là thư mục có đánh version cộng với việc trỏ lại view: không đụng vào thư mục đã công bố, một lần nào. Mỗi lần ghi lại sẽ sinh hẳn một thư mục orders_v=<ts>/ mới, rồi tạo lại view để nó trỏ sang thư mục mới nhất.',
      ),
      bi(
        'That third one is a poor man\'s Iceberg or Delta Lake. The industrial table formats do exactly this, except the current-version pointer lives in metadata files, and only the data files that actually changed get rewritten.',
        'Cách thứ ba chính là bản nhà nghèo của Iceberg hay Delta Lake. Mấy định dạng bảng dùng trong công nghiệp làm đúng như vậy, chỉ khác là cái con trỏ chỉ tới phiên bản hiện hành nằm trong file metadata, và chỉ những file dữ liệu thật sự thay đổi mới bị ghi lại.',
      ),
    ],
    checks: [
      {
        q: bi(
          'The rebuild takes 11 seconds and publishing takes 4 milliseconds. What did you actually optimize?',
          'Dựng lại mất 11 giây, công bố mất 4 mili giây. Vậy rốt cuộc bạn đã tối ưu cái gì?',
        ),
        a: bi(
          'Nothing about speed. The rebuild is exactly as slow as before. What shrank is the window during which a reader can get a wrong answer — from 11 seconds to 4 milliseconds. Journal both timings side by side; that ratio is the lesson.',
          'Không tối ưu tốc độ chút nào. Phần dựng lại vẫn chậm y như cũ. Thứ co lại là khoảng thời gian mà người đọc có thể nhận về câu trả lời sai — từ 11 giây xuống còn 4 mili giây. Ghi hai con số đó cạnh nhau vào journal; tỉ lệ giữa chúng mới là bài học.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 4 ─────────── */
  {
    level: 'mechanism',
    heading: bi(
      'What the switch actually does, and where it is not one step',
      'Cú chuyển thật ra làm gì, và chỗ nào nó không phải một bước',
    ),
    paras: [
      bi(
        'Replacing a live folder takes two renames, not one: live goes to trash, then staging goes to live. For a few milliseconds between them, the partition simply does not exist.',
        'Thay một thư mục đang phục vụ cần hai lệnh rename chứ không phải một: thư mục đang chạy bị đẩy sang trash, rồi thư mục staging được đưa vào chỗ đó. Trong vài mili giây ở giữa, partition đó không tồn tại.',
      ),
      bi(
        'So the reader has to be taught something: "no data for a day I know has data" means try again, not zero. That mitigation has a name, retry-on-read, and in the lab it is a loop of 15 attempts, 0.3 seconds apart. It turns a wrong answer into an answer that arrives a beat later.',
        'Nên phải dạy cho phía đọc một điều: gặp cảnh không có dữ liệu ở một ngày mà bạn biết chắc là có dữ liệu, thì nghĩa là thử lại, chứ không phải bằng 0. Cách xử lý đó có tên là retry-on-read, và trong lab nó chỉ là một vòng lặp 15 lần, mỗi lần cách nhau 0,3 giây. Nó biến một câu trả lời sai thành một câu trả lời tới chậm hơn một nhịp.',
      ),
      bi(
        'On Windows there is a second thing to handle. A rename fails with PermissionError while any process holds a file inside that folder open: a reader mid-scan, the search indexer, an antivirus. Readers hold files for milliseconds, so the fix is unglamorous — retry the rename a few times and it goes through.',
        'Trên Windows còn một chuyện nữa phải lo. Lệnh rename sẽ hỏng với PermissionError nếu có bất kỳ tiến trình nào đang mở một file bên trong thư mục đó: một người đọc đang quét dở, bộ đánh chỉ mục của Windows, hay phần mềm diệt virus. Người đọc chỉ giữ file trong vài mili giây, nên cách chữa cũng chẳng có gì hay ho: thử lại lệnh rename vài lần là qua.',
      ),
      bi(
        'The crash case is worth reading in the code rather than taking on trust. Kill the script between the two renames — the worst possible moment — and recovery is still safe, because of one invariant: at every step, either staging or trash still holds a complete copy of the partition. There is no moment where the only copy is half-written.',
        'Trường hợp script chết giữa chừng thì nên tự đọc trong code chứ đừng tin lời kể. Giết script đúng giữa hai lệnh rename — thời điểm tệ nhất có thể — mà vẫn khôi phục được an toàn, nhờ đúng một tính chất bất biến: ở mọi thời điểm, staging hoặc trash vẫn đang giữ một bản đầy đủ của partition. Không có lúc nào bản duy nhất còn sót lại là một bản ghi dở.',
      ),
      bi(
        'Inside the warehouse none of this applies. Build the replacement table, rename both tables in one transaction, and a reader connection sees the old table complete right up to COMMIT, then the new one. Both renames become visible together, which is what a catalog buys you.',
        'Còn bên trong warehouse thì không có chuyện gì như trên cả. Dựng bảng thay thế, đổi tên cả hai bảng trong một transaction, thế là connection đang đọc nhìn thấy bảng cũ nguyên vẹn cho tới đúng lúc COMMIT, rồi thấy bảng mới. Hai lệnh đổi tên hiện ra cùng lúc, và đó là thứ mà một catalog đem lại cho bạn.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Your reader polls every 0.1 seconds and never once catches the 4-millisecond gap. Does the gap matter?',
          'Người đọc của bạn hỏi lại mỗi 0,1 giây và chưa lần nào rơi trúng khoảng trống 4 mili giây. Vậy khoảng trống đó có đáng bận tâm không?',
        ),
        a: bi(
          'Yes, and Task 6 is where you stop arguing about it: run the swap with --nap 2 and the reader without retry prints count=0. A two-second outage, served as a valid answer. Then run the same swap against a reader with --retry and the count never moves. Rare is not the same as impossible, and a wrong number does not care how rare it was.',
          'Có, và Task 6 là chỗ chấm dứt tranh cãi: chạy swap với cờ --nap 2, người đọc không bật retry sẽ in ra count=0. Hai giây mất dữ liệu, được đưa ra như một câu trả lời hợp lệ. Rồi chạy đúng lần swap đó với người đọc có --retry thì con số không nhúc nhích. Hiếm không có nghĩa là không thể, và một con số sai thì không quan tâm nó hiếm tới đâu.',
        ),
      },
      {
        q: bi(
          'Why must staging and trash sit on the same drive as the lake?',
          'Vì sao staging và trash phải nằm cùng ổ đĩa với lake?',
        ),
        a: bi(
          'Because across drives a rename is not a rename. The OS quietly turns it into copy plus delete: minutes of real data movement instead of microseconds of metadata, and not atomic at any point. Nothing errors, so you would only find out from the timings.',
          'Vì khác ổ đĩa thì rename không còn là rename. Hệ điều hành lặng lẽ biến nó thành chép rồi xoá: hàng phút chuyển dữ liệu thật thay vì vài micro giây sửa metadata, và không atomic ở bất kỳ khoảnh khắc nào. Không có lỗi nào báo, nên bạn chỉ phát hiện ra qua số đo thời gian.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 5 ─────────── */
  {
    level: 'detail',
    heading: bi(
      'What the three patterns cost, and which one you keep',
      'Ba khuôn này tốn gì, và cuối cùng giữ lại cái nào',
    ),
    paras: [
      bi(
        'The staging swap costs one extra copy of the partition on disk, for as long as the rebuild runs. For one day of orders that is nothing; for a rewrite spanning many partitions it is a number you should compute before launching.',
        'Khuôn staging swap tốn thêm một bản sao của partition trên đĩa, trong suốt thời gian dựng lại. Với một ngày đơn hàng thì chẳng đáng gì; nhưng với một lần ghi lại trải qua nhiều partition thì đó là con số nên tính trước khi bấm nút.',
      ),
      bi(
        'The table swap is the cleanest of the three, and the most limited. It protects connections to the warehouse and nothing else. A separate process cannot even open the file while your writer holds it — the single-writer rule you meet head-on in A12 — and it does nothing at all for Parquet readers, because those files live outside the catalog.',
        'Khuôn table swap sạch sẽ nhất trong ba khuôn, mà cũng hẹp nhất. Nó bảo vệ các connection vào warehouse, chỉ vậy thôi. Một tiến trình khác thậm chí không mở nổi file khi writer của bạn đang giữ — đúng cái luật một-writer mà A12 sẽ cho bạn đâm vào — và nó hoàn toàn không giúp gì cho những ai đang đọc Parquet, vì mấy file đó nằm ngoài catalog.',
      ),
      bi(
        'Versioned dirs cost the most disk and give the most back: the previous version is still sitting there, so rolling back is renaming a pointer, and a reader that started before the switch can keep reading a consistent snapshot to the end. That last property is what turns "atomic publish" into "time travel", and it is the reason Iceberg and Delta exist.',
        'Thư mục có version tốn đĩa nhiều nhất và cũng trả lại nhiều nhất: bản trước vẫn còn nằm đó, nên quay lui chỉ là đổi chỗ một con trỏ, và một người đọc bắt đầu trước lúc chuyển vẫn đọc hết được một bản chụp nhất quán. Chính tính chất cuối này biến chuyện công bố atomic thành chuyện đọc lại quá khứ, và đó là lý do Iceberg với Delta ra đời.',
      ),
      bi(
        'A detail that only shows up when you look: the swap props built straight out of the lake carry no lineage columns. The lake files hold no _data_date, and nothing here registers a run, so there is no _run_id to hand out. The core.orders you built in A07 carries both. These two tables exist only to be renamed at each other and then dropped.',
        'Một chi tiết chỉ lộ ra nếu bạn để ý: mấy cái bảng đạo cụ dựng thẳng từ lake không mang cột lineage nào. File trong lake không có _data_date, mà ở đây cũng không có lần chạy nào được đăng ký nên chẳng có _run_id để phát. Bảng core.orders bạn dựng ở A07 thì có cả hai. Hai cái bảng này sinh ra chỉ để đổi tên cho nhau rồi bị xoá.',
      ),
      bi(
        'And if you want to remove the two-rename gap entirely, the stretch goal points at how the real formats do it. Write a small _current.json next to the partition listing exactly which Parquet files make up the current version. Readers read the pointer and scan only those files, no globs. Publishing becomes replacing one small file, which is a single atomic operation even on Windows. At that point you have rebuilt the core of a table format\'s snapshot mechanism.',
        'Còn nếu muốn xoá hẳn khoảng trống giữa hai lệnh rename thì phần mở rộng chỉ đúng cách mà các định dạng thật đang làm. Ghi một file _current.json nhỏ nằm cạnh partition, liệt kê đúng những file Parquet tạo nên phiên bản hiện hành. Người đọc đọc cái con trỏ đó rồi chỉ quét đúng mấy file được liệt kê, không dùng glob nữa. Việc công bố khi đó chỉ là thay một file nhỏ, mà thao tác này atomic ngay cả trên Windows. Tới đó thì bạn đã dựng lại phần lõi của cơ chế snapshot trong một định dạng bảng.',
      ),
    ],
    checks: [
      {
        q: bi(
          'You did the swap, but readers still glob the folder. Which pattern have you actually got?',
          'Bạn đã làm swap, nhưng phía đọc vẫn quét thư mục bằng glob. Vậy thực tế bạn đang có khuôn nào?',
        ),
        a: bi(
          'The file-level one, with its two-rename gap intact — that is the pattern globs allow. The gap only disappears when readers stop discovering files by pattern and start being told which files to read, whether by a pointer file or by a view naming one version folder.',
          'Khuôn ở tầng file, kèm nguyên khoảng trống hai lệnh rename — vì đó là thứ mà cách quét bằng glob cho phép. Khoảng trống chỉ biến mất khi phía đọc thôi tự đi tìm file theo mẫu và chuyển sang được chỉ định đọc file nào, dù là qua một file con trỏ hay qua một view trỏ đúng vào một thư mục version.',
        ),
      },
    ],
  },
]

export const a09Terms: Term[] = [
  {
    term: 'Atomic',
    gloss: 'hoặc xong hẳn, hoặc coi như chưa xảy ra',
    means: bi(
      'All-or-nothing. An atomic rewrite is one where every reader sees either the complete old data or the complete new data, and never a mix.',
      'Hoặc trọn vẹn, hoặc không có gì. Một lần ghi lại được gọi là atomic khi mọi người đọc chỉ thấy nguyên bản cũ hoặc nguyên bản mới, không bao giờ thấy một mớ lẫn lộn.',
    ),
    source: {
      name: 'Delta Lake protocol — atomicity của commit',
      url: 'https://github.com/delta-io/delta/blob/master/PROTOCOL.md',
    },
  },
  {
    term: 'Torn read',
    gloss: 'đọc trúng lúc đang ghi dở',
    means: bi(
      'A read that catches the in-between state: partial rows, duplicated rows, or an IO error because a file vanished mid-scan. It returns an answer, not a warning.',
      'Một lần đọc rơi trúng trạng thái dở dang: thiếu dòng, trùng dòng, hoặc lỗi IO vì file biến mất giữa lúc quét. Nó trả về một câu trả lời, chứ không phải một lời cảnh báo.',
    ),
  },
  {
    term: 'Staging-dir swap',
    gloss: 'dựng ở thư mục khuất, rồi rename vào chỗ',
    means: bi(
      'Write the new partition into a folder readers\' globs cannot match, then rename it into place. The rename rewires directory metadata, so it takes microseconds no matter how big the folder is.',
      'Ghi partition mới vào một thư mục mà mẫu glob của người đọc không quét tới, rồi rename nó vào đúng chỗ. Lệnh rename chỉ sửa metadata thư mục, nên thư mục to cỡ nào cũng chỉ vài micro giây.',
    ),
  },
  {
    term: 'Retry-on-read',
    gloss: 'không thấy dữ liệu thì thử lại, đừng trả về 0',
    means: bi(
      'Teaching the reader that "no data for a day I know has data" means try again. In the lab: 15 attempts, 0.3 seconds apart. It converts a wrong answer into an answer that arrives a beat later.',
      'Dạy phía đọc rằng gặp cảnh không có dữ liệu ở một ngày vốn dĩ có dữ liệu thì nghĩa là thử lại. Trong lab là 15 lần, mỗi lần cách 0,3 giây. Nó biến một câu trả lời sai thành một câu trả lời tới chậm hơn một nhịp.',
    ),
  },
  {
    term: 'Table swap',
    gloss: 'đổi tên hai bảng trong một transaction',
    means: bi(
      'Build the replacement as a real table while readers keep using the old one, then rename both inside one transaction. The catalog makes both renames visible together — genuinely atomic, with no gap.',
      'Dựng bảng thay thế thành một bảng thật trong lúc người đọc vẫn dùng bảng cũ, rồi đổi tên cả hai trong cùng một transaction. Catalog làm cho hai lệnh đổi tên hiện ra cùng lúc — atomic thật, không có khoảng trống nào.',
    ),
    source: {
      name: 'DuckDB — ALTER TABLE / RENAME',
      url: 'https://duckdb.org/docs/stable/sql/statements/alter_table',
    },
  },
  {
    term: 'Versioned dir + view repoint',
    gloss: 'mỗi lần ghi ra một thư mục mới, view trỏ sang',
    means: bi(
      'Never touch a published folder. Each rewrite publishes a new orders_v=<ts>/ folder and the view is re-created to point at the newest. Rolling back is repointing the view.',
      'Không đụng vào thư mục đã công bố. Mỗi lần ghi lại sinh ra một thư mục orders_v=<ts>/ mới, rồi tạo lại view để trỏ sang cái mới nhất. Muốn quay lui thì chỉ cần trỏ view về chỗ cũ.',
    ),
    source: {
      name: 'Apache Iceberg — spec về snapshot',
      url: 'https://iceberg.apache.org/spec/#snapshots',
    },
  },
  {
    term: 'Same-volume rename',
    gloss: 'rename chỉ rẻ khi cùng một ổ đĩa',
    means: bi(
      'Across drives the OS quietly turns a rename into copy plus delete: minutes of data movement instead of microseconds of metadata, and not atomic at any point. Keep staging and trash on the lake\'s volume.',
      'Khác ổ đĩa thì hệ điều hành lặng lẽ biến rename thành chép rồi xoá: hàng phút chuyển dữ liệu thay vì vài micro giây sửa metadata, và không atomic ở khoảnh khắc nào. Hãy để staging và trash nằm cùng ổ với lake.',
    ),
  },
  {
    term: 'Pointer file',
    gloss: 'file nhỏ ghi rõ phiên bản hiện hành gồm file nào',
    means: bi(
      'A small JSON next to the partition naming exactly which Parquet files make up the current version. Readers stop globbing; publishing becomes replacing one small file, which is atomic even on Windows.',
      'Một file JSON nhỏ nằm cạnh partition, ghi rõ phiên bản hiện hành gồm đúng những file Parquet nào. Người đọc thôi dùng glob; việc công bố rút lại thành thay một file nhỏ, mà thao tác đó atomic ngay cả trên Windows.',
    ),
    source: {
      name: 'Apache Iceberg — spec về snapshot',
      url: 'https://iceberg.apache.org/spec/#snapshots',
    },
  },
]