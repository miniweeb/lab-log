import type { TheorySection, Term } from '../types'
import { bi } from '../types'

export const a07Theory: TheorySection[] = [
  /* ─────────── TẦNG 1 ─────────── */
  {
    level: 'problem',
    heading: bi(
      'Failure is not the problem — what it leaves behind is',
      'Việc job hỏng không phải vấn đề — vấn đề là nó để lại trạng thái gì',
    ),
    paras: [
      bi(
        'Real pipelines fail all the time: the network drops, a disk fills up, a laptop sleeps mid-run, someone hits Ctrl+C. Failure itself is not the problem — the problem is what state it leaves behind, and what happens when you (or a scheduler) run the job again.',
        'Pipeline thật hỏng liên tục: mạng rớt, ổ đĩa đầy, laptop sleep giữa chừng, ai đó bấm Ctrl+C. Bản thân việc hỏng không phải vấn đề — vấn đề là nó để lại trạng thái gì, và chuyện gì xảy ra khi bạn (hoặc scheduler) chạy lại job đó.',
      ),
      bi(
        'A crashed or re-run load job can end three ugly ways. DOUBLE DATA: the job succeeded, someone ran it again, every row is in twice. HALF DATA: the job crashed mid-insert; the table holds part of a day. MISSING DATA: the job deleted the old day, crashed before inserting the new one.',
        'Một job load bị crash hoặc chạy lại có thể kết thúc theo ba cách tệ. DỮ LIỆU GẤP ĐÔI: job chạy xong, ai đó chạy lại, mọi dòng vào hai lần. DỮ LIỆU MỘT NỬA: job crash giữa lúc insert; bảng chứa một phần của ngày. MẤT DỮ LIỆU: job đã xoá ngày cũ rồi crash trước khi insert ngày mới.',
      ),
      bi(
        'The worst pipeline failures are silent. A double INSERT does not error, does not warn — 62,707 rows quietly become 125,414 and every downstream number doubles. Nobody finds out until someone questions a revenue figure.',
        'Những lần hỏng tệ nhất của pipeline đều diễn ra trong im lặng. Một lệnh INSERT chạy hai lần không báo lỗi, không cảnh báo — 62.707 dòng lặng lẽ thành 125.414 và mọi con số phía dưới nhân đôi. Không ai phát hiện cho tới khi có người thắc mắc về một con số doanh thu.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Why is "just be careful not to run it twice" not a solution?',
          'Vì sao "cẩn thận đừng chạy hai lần" không phải là giải pháp?',
        ),
        a: bi(
          'Because you are not the only one running it. A scheduler retries on timeout, a colleague reruns after a fix, a backfill sweeps the same date range. Every serious orchestrator (Airflow, Dagster, dbt) ASSUMES your tasks are safe to re-run — that assumption is the interface.',
          'Vì không chỉ mình bạn chạy nó. Scheduler tự retry khi timeout, đồng nghiệp chạy lại sau khi sửa lỗi, một lần backfill quét lại đúng khoảng ngày đó. Mọi orchestrator nghiêm túc (Airflow, Dagster, dbt) đều GIẢ ĐỊNH task của bạn chạy lại được an toàn — giả định đó chính là giao diện làm việc.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 2 ─────────── */
  {
    level: 'alternatives',
    heading: bi('Four ways to handle a re-run', 'Bốn cách xử lý việc chạy lại'),
    paras: [],
    alternatives: [
      {
        name: bi('Just INSERT — and be careful', 'Cứ INSERT — và cẩn thận'),
        appeal: bi(
          'Simplest possible code, one statement, no state to manage.',
          'Code đơn giản nhất có thể, một câu lệnh, không phải quản lý trạng thái gì.',
        ),
        breaks: bi(
          'It fails silently in the worst way: rows double, nothing errors, no warning. And "careful" does not survive contact with a scheduler that retries on timeout — the retry itself is the second run.',
          'Nó hỏng trong im lặng theo cách tệ nhất: số dòng nhân đôi, không lỗi, không cảnh báo. Và "cẩn thận" không sống sót khi gặp một scheduler tự retry lúc timeout — chính lần retry đó là lần chạy thứ hai.',
        ),
      },
      {
        name: bi('TRUNCATE the whole table, then reload everything', 'TRUNCATE cả bảng rồi nạp lại toàn bộ'),
        appeal: bi(
          'Guaranteed no duplicates: the table always ends up holding exactly what the source says.',
          'Chắc chắn không trùng: bảng luôn kết thúc ở đúng trạng thái mà nguồn quy định.',
        ),
        breaks: bi(
          'Reloading one day means reprocessing the entire history — 45 files today, thousands later. And a crash mid-reload leaves you with nothing at all, not even the old data. Re-runnability should cost the size of one unit of work, not the size of the warehouse.',
          'Nạp lại một ngày nghĩa là xử lý lại toàn bộ lịch sử — hôm nay là 45 file, sau này là hàng nghìn. Và nếu crash giữa lúc nạp lại thì bạn không còn gì cả, kể cả dữ liệu cũ. Khả năng chạy lại phải tốn bằng kích thước MỘT đơn vị công việc, không phải bằng kích thước cả warehouse.',
        ),
      },
      {
        name: bi('Check first: "does this day already exist?"', 'Kiểm tra trước: "ngày này đã có chưa?"'),
        appeal: bi(
          'Cheap, obvious, and it stops the double INSERT.',
          'Rẻ, dễ hiểu, và nó chặn được việc INSERT hai lần.',
        ),
        breaks: bi(
          'It stops the double, but it cannot fix a HALF day. If the previous run crashed after inserting 30,000 of 62,707 rows, the check says "exists" and skips — leaving the table permanently wrong. A guard is not a substitute for a transaction.',
          'Nó chặn được việc nhân đôi, nhưng không sửa được một ngày NẠP DỞ. Nếu lần chạy trước crash sau khi insert 30.000 trên 62.707 dòng, phép kiểm tra sẽ nói "đã có" rồi bỏ qua — để lại bảng sai vĩnh viễn. Một cái chốt kiểm tra không thay thế được transaction.',
        ),
      },
      {
        name: bi('Use MERGE / UPSERT on the primary key', 'Dùng MERGE / UPSERT theo primary key'),
        appeal: bi(
          'The database handles it: matched rows update, unmatched insert. One statement, no delete.',
          'Để database lo: dòng khớp thì update, không khớp thì insert. Một câu lệnh, không cần xoá.',
        ),
        breaks: bi(
          'It works — for feeds where a key means one row. Here it does not: the same order_id legitimately appears in several files as a late correction, so "the key" is not unique in the target. And MERGE cannot remove rows a corrected file no longer contains. Delete-what-I-would-write is simpler and covers both.',
          'Nó chạy được — với những feed mà một key ứng với một dòng. Ở đây thì không: cùng một order_id xuất hiện hợp lệ trong nhiều file dưới dạng late correction, nên "key" không duy nhất trong bảng đích. Và MERGE không xoá được những dòng mà file đã sửa không còn chứa nữa. Cách "xoá đúng phần mình sắp ghi" đơn giản hơn và phủ được cả hai.',
        ),
      },
    ],
    checks: [
      {
        q: bi(
          'Why delete by _data_date and not by order_date?',
          'Vì sao xoá theo _data_date chứ không theo order_date?',
        ),
        a: bi(
          'Because ~1.5% of a file\'s rows are late corrections belonging to EARLIER order dates (A02). Delete by order_date and every re-run duplicates those late rows. The idempotency key is "what did this file write" (_data_date), not "what dates does it mention" (order_date).',
          'Vì khoảng 1,5% số dòng trong một file là late correction thuộc về những order date CŨ HƠN (A02). Xoá theo order_date thì mỗi lần chạy lại sẽ nhân đôi những dòng trễ đó. Khoá idempotency là "file này đã ghi những gì" (_data_date), không phải "file này nhắc tới những ngày nào" (order_date).',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 3 ─────────── */
  {
    level: 'idea',
    heading: bi(
      'Pick a unit of work, make it replaceable',
      'Chọn một đơn vị công việc, làm cho nó thay thế được',
    ),
    paras: [
      bi(
        'Idempotent, in one line: an operation is idempotent if running it once or running it ten times leaves the system in the same final state. An elevator call button is idempotent — press it five times, one elevator comes. A "top up my account by $10" button is not.',
        'Idempotent, định nghĩa một dòng: một thao tác là idempotent nếu chạy nó một lần hay mười lần đều để lại hệ thống ở cùng một trạng thái cuối. Nút gọi thang máy là idempotent — bấm năm lần vẫn một thang máy tới. Nút "nạp thêm 10 đô vào tài khoản" thì không.',
      ),
      bi(
        'One design decision matters more than any code: pick the unit of work, and make it replaceable. Our unit is ONE SOURCE FILE — one day\'s CSV. Every row already carries the file\'s business date (the _data_date lineage column from A03), and publishing deletes exactly WHERE _data_date = D before inserting. Delete-what-I-would-write, then write: re-run = replace.',
        'Có một quyết định thiết kế quan trọng hơn mọi dòng code: chọn đơn vị công việc, và làm cho nó thay thế được. Đơn vị của chúng ta là MỘT FILE NGUỒN — file CSV của một ngày. Mọi dòng đã mang sẵn business date của file (cột lineage _data_date từ A03), và khi publish thì xoá đúng WHERE _data_date = D trước khi insert. Xoá đúng phần mình sắp ghi, rồi mới ghi: chạy lại = thay thế.',
      ),
      bi(
        'Note what this does NOT promise: the same order_id still appears in several files (the ~1.5% late corrections from A02). Making the CONTENT converge — latest update wins — is A08\'s job. Today we only make the OPERATION safe.',
        'Chú ý điều này KHÔNG hứa: cùng một order_id vẫn xuất hiện trong nhiều file (khoảng 1,5% late correction từ A02). Làm cho NỘI DUNG hội tụ — bản cập nhật mới nhất thắng — là việc của A08. Hôm nay ta chỉ làm cho THAO TÁC trở nên an toàn.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Why does DELETE run even on the very first load, when there is nothing to delete?',
          'Vì sao lệnh DELETE vẫn chạy ngay cả ở lần load đầu tiên, khi chẳng có gì để xoá?',
        ),
        a: bi(
          'It deletes 0 rows and costs nothing — and in exchange, the first run and the re-run are the SAME CODE PATH. Fewer paths, fewer bugs. A branch that only executes on re-runs is a branch nobody tests.',
          'Nó xoá 0 dòng và không tốn gì — đổi lại, lần chạy đầu và lần chạy lại đi CÙNG MỘT NHÁNH CODE. Ít nhánh thì ít lỗi. Một nhánh chỉ chạy khi rerun là một nhánh không ai kiểm thử.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 4 ─────────── */
  {
    level: 'mechanism',
    heading: bi(
      'Transactions, the run ledger, and what each one removes',
      'Transaction, run ledger, và mỗi thứ loại bỏ được kiểu hỏng nào',
    ),
    paras: [
      bi(
        'A TRANSACTION removes two of the three failure modes. It groups statements into one all-or-nothing unit: after BEGIN, nothing is visible until COMMIT; if the process dies first, it is as if nothing ran. DuckDB guarantees this — it is an ACID database, and the A (atomicity) is exactly this promise — even when the process is killed outright.',
        'TRANSACTION loại bỏ hai trong ba kiểu hỏng. Nó gom các câu lệnh thành một khối được ăn cả ngã về không: sau BEGIN, không gì hiển thị ra ngoài cho tới COMMIT; nếu process chết trước đó thì coi như chưa có gì chạy. DuckDB đảm bảo điều này — nó là database ACID, và chữ A (atomicity) chính là lời hứa này — kể cả khi process bị giết thẳng.',
      ),
      bi(
        'So publishing becomes: BEGIN; DELETE the old copy; INSERT the new copy; COMMIT. Readers see the old day or the new day, never a mix. And the ledger UPDATE that records success sits INSIDE that transaction, so the ledger can never claim success for data that is not there.',
        'Nhờ vậy việc publish trở thành: BEGIN; DELETE bản cũ; INSERT bản mới; COMMIT. Người đọc thấy hoặc ngày cũ hoặc ngày mới, không bao giờ thấy hỗn hợp. Và lệnh UPDATE ghi nhận thành công vào ledger nằm BÊN TRONG transaction đó, nên ledger không bao giờ có thể khai là thành công cho dữ liệu không tồn tại.',
      ),
      bi(
        'A RUN LEDGER removes the third. A pipeline needs memory of what it has done. ops.etl_runs is a plain table with one row per ATTEMPT: date, step, running/success/failed, row count, error. It answers "did yesterday load?" with a query instead of a guess — and lets you skip work already done. Every attempt gets its own row; failures are history worth keeping, not shame to overwrite.',
        'RUN LEDGER loại bỏ kiểu hỏng thứ ba. Một pipeline cần có trí nhớ về những gì nó đã làm. Bảng ops.etl_runs là một bảng bình thường, mỗi LẦN THỬ một dòng: ngày, bước, trạng thái running/success/failed, số dòng, lỗi. Nó trả lời câu "hôm qua có load không?" bằng một truy vấn thay vì bằng phỏng đoán — và cho phép bỏ qua việc đã làm rồi. Mỗi lần thử một dòng riêng; những lần thất bại là lịch sử đáng giữ, không phải điều đáng che giấu.',
      ),
      bi(
        'The ledger also finishes a story A03 started. The _run_id lineage column has sat NULL in every row since then. Today it comes alive: every published row names the run that wrote it, every run writes its own log file, and a load that gives up for good writes an ops.alerts row. Row → run → log: when a number looks wrong three weeks from now, you can reconstruct exactly where it came from.',
        'Ledger cũng kết thúc một câu chuyện mà A03 đã mở ra. Cột lineage _run_id đã nằm NULL ở mọi dòng từ hồi đó tới giờ. Hôm nay nó sống dậy: mọi dòng được publish đều ghi tên lần chạy đã ghi nó, mọi lần chạy đều viết file log riêng, và một lần load bỏ cuộc hẳn sẽ ghi một dòng vào ops.alerts. Dòng dữ liệu → lần chạy → file log: khi một con số trông sai sau ba tuần, bạn dựng lại được chính xác nó từ đâu ra.',
      ),
      bi(
        'RETRIES handle the rest. Transient failures (network blip, briefly locked file) are worth retrying — with doubling waits, 1s, 2s, 4s, 8s ("exponential backoff"), to give a struggling system air instead of hammering it. Deterministic failures (corrupt file, failed validation) just fail again, slower. Catch TransientError only; let ValueError fly.',
        'RETRY lo phần còn lại. Những lỗi tạm thời (mạng chớp tắt, file bị khoá trong chốc lát) thì đáng thử lại — với thời gian chờ nhân đôi dần: 1 giây, 2 giây, 4 giây, 8 giây ("exponential backoff"), để hệ thống đang vật vã có chỗ thở thay vì bị dồn ép. Còn lỗi tất định (file hỏng, validation không đạt) thì thử lại vẫn hỏng, chỉ chậm hơn. Chỉ bắt TransientError; để ValueError bay thẳng ra.',
      ),
    ],
    checks: [
      {
        q: bi(
          'The job crashes between DELETE and INSERT. Why is the day still intact?',
          'Job crash giữa lệnh DELETE và INSERT. Vì sao ngày đó vẫn còn nguyên?',
        ),
        a: bi(
          'Because both statements are inside one transaction. The crash triggers a rollback, which undoes the DELETE — the old day is still there, untouched. Without a transaction this exact crash LOSES A DAY OF DATA, which is why mid_transaction is the chaos point worth seeing fire.',
          'Vì cả hai câu lệnh nằm trong cùng một transaction. Lần crash đó kích hoạt rollback, và rollback hoàn tác lệnh DELETE — ngày cũ vẫn còn đó, nguyên vẹn. Không có transaction thì đúng lần crash này sẽ LÀM MẤT MỘT NGÀY DỮ LIỆU, và đó là lý do mid_transaction là điểm chaos đáng nhìn thấy nhất.',
        ),
      },
      {
        q: bi(
          'Why must the ledger UPDATE sit inside BEGIN…COMMIT?',
          'Vì sao lệnh UPDATE ledger phải nằm bên trong BEGIN…COMMIT?',
        ),
        a: bi(
          'Otherwise a crash between the data commit and the ledger update makes the ledger LIE — it says failed for data that is actually there, or success for data that is not. And ledger lies become skipped or doubled days later, when already_succeeded() reads it and believes it.',
          'Nếu không thì một lần crash giữa lúc commit dữ liệu và lúc cập nhật ledger sẽ khiến ledger NÓI SAI — nó báo failed cho dữ liệu thật ra đã có, hoặc báo success cho dữ liệu không tồn tại. Và ledger nói sai sẽ biến thành ngày bị bỏ qua hoặc bị nhân đôi về sau, khi hàm already_succeeded() đọc nó và tin nó.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 5 ─────────── */
  {
    level: 'detail',
    heading: bi(
      'Where run facts live, and two habits that ride along',
      'Sự thật về lần chạy nằm ở đâu, và hai thói quen đi kèm',
    ),
    paras: [
      bi(
        'This assignment collects on A03\'s restraint. A03 gave every row exactly two warehouse-added columns, _data_date and _run_id, and said the file name and the load timestamp did NOT belong there because they are facts about the RUN, not about the order. Today you build the place they do belong: ops.etl_runs carries source_file and finished_at, one row per attempt, and _run_id is the pointer.',
        'Bài này thu hoạch lại sự kiềm chế của A03. A03 cho mỗi dòng đúng hai cột do warehouse thêm vào, _data_date và _run_id, và nói rằng tên file cùng thời điểm nạp KHÔNG thuộc về đó, vì chúng là sự thật về LẦN CHẠY chứ không phải về đơn hàng. Hôm nay bạn dựng đúng chỗ mà chúng thuộc về: bảng ops.etl_runs mang source_file và finished_at, mỗi lần thử một dòng, và _run_id là con trỏ.',
      ),
      bi(
        'Say the win out loud, because it is the whole argument: a fact about the run is stored ONCE, on the run, and 62,707 rows point at it with an 8-byte id — instead of 62,707 identical copies of a file name and a timestamp sitting in a fact table. That is plain normalization, the same rule that keeps a customer\'s address out of every order row.',
        'Hãy nói to điều được lợi ở đây, vì nó là toàn bộ lập luận: một sự thật về lần chạy được lưu MỘT LẦN, ở lần chạy đó, và 62.707 dòng trỏ tới nó bằng một id 8 byte — thay vì 62.707 bản sao giống hệt nhau của một tên file và một dấu thời gian nằm trong fact table. Đó chính là normalization thông thường, cùng quy tắc giữ cho địa chỉ khách hàng không bị chép vào từng dòng đơn hàng.',
      ),
      bi(
        'It also pays maintenance: re-load this day from a corrected file and the ledger records the new fact in ONE row; the copy-it-everywhere design would have to rewrite the same string 62,707 times to fix a single fact — 1.2M times at full scale.',
        'Nó cũng có lợi về bảo trì: nạp lại ngày này từ một file đã sửa thì ledger ghi sự thật mới vào MỘT dòng; còn thiết kế chép-khắp-nơi sẽ phải ghi lại cùng một chuỗi 62.707 lần chỉ để sửa một sự thật — và 1,2 triệu lần ở scale full.',
      ),
      bi(
        'PREFLIGHT is the first habit that rides along. Think about what actually breaks pipelines at 2 a.m. — rarely the SQL. The disk is full. The file never arrived. Another process is holding the database. A config quietly aims temp space at the OS drive. Every one of those is checkable in under a second, BEFORE any data moves, and each check must print a fix hint and exit non-zero so a scheduler stops cold. A red report that still exits 0 is a smoke alarm with no battery.',
        'PREFLIGHT là thói quen thứ nhất đi kèm. Hãy nghĩ xem thứ gì thật sự làm hỏng pipeline lúc 2 giờ sáng — hiếm khi là SQL. Ổ đĩa đầy. File chưa bao giờ về tới. Một process khác đang giữ database. Một dòng cấu hình lặng lẽ trỏ chỗ chứa file tạm về ổ hệ thống. Mỗi thứ đó đều kiểm tra được trong chưa tới một giây, TRƯỚC KHI dữ liệu di chuyển, và mỗi phép kiểm tra phải in ra gợi ý cách sửa cùng mã thoát khác 0 để scheduler dừng hẳn. Một báo cáo đỏ mà vẫn thoát với mã 0 là chuông báo cháy không lắp pin.',
      ),
      bi(
        'The GIT SAVEPOINT is the second. An assignment that breaks things on purpose, with edits made quickly and under pressure, is exactly the setting where a botched edit eats a file you spent two hours getting right. Commit before the chaos work; then git restore recovers an uncommitted mess, git checkout <sha> -- <file> recovers a committed one, and git reflog proves even reset-away commits survive.',
        'GIT SAVEPOINT là thói quen thứ hai. Một bài học cố ý phá hỏng mọi thứ, với những lần sửa code vội vàng và căng thẳng, chính là hoàn cảnh mà một lần sửa hỏng tay có thể nuốt mất file bạn mất hai giờ mới viết đúng. Hãy commit trước khi bắt đầu phần phá hoại; sau đó git restore cứu được đống hỗn độn chưa commit, git checkout <sha> -- <file> cứu được cái đã commit, và git reflog chứng minh rằng ngay cả những commit bị reset đi cũng vẫn còn.',
      ),
      bi(
        'One last thing worth noticing: you have already used an idempotent tool without thinking about it. datagen/generate.py skips existing files unless you pass --force. That flag is the same design decision you are making today.',
        'Một điều cuối đáng để ý: bạn đã dùng một công cụ idempotent mà không nghĩ tới. Script datagen/generate.py bỏ qua các file đã tồn tại trừ khi bạn truyền --force. Chính cờ đó là cùng một quyết định thiết kế mà hôm nay bạn đang đưa ra.',
      ),
    ],
    checks: [
      {
        q: bi(
          'The checksum is identical after a re-run, but _run_id changed. Is that a bug?',
          'Checksum giống hệt sau khi chạy lại, nhưng _run_id đã đổi. Đó có phải lỗi không?',
        ),
        a: bi(
          'No — that is lineage recording history, not data changing. The checksum deliberately hashes only BUSINESS columns; _run_id SHOULD differ between two runs, and so should the finished_at on the ledger row it points at. Hashing lineage into the checksum would make idempotency impossible to prove.',
          'Không — đó là lineage đang ghi lại lịch sử, không phải dữ liệu thay đổi. Checksum cố ý chỉ hash các cột NGHIỆP VỤ; _run_id ĐÁNG LẼ phải khác nhau giữa hai lần chạy, và finished_at trên dòng ledger mà nó trỏ tới cũng vậy. Nếu hash cả cột lineage vào checksum thì sẽ không bao giờ chứng minh được tính idempotent.',
        ),
      },
    ],
  },
]

export const a07Terms: Term[] = [
  {
    term: 'Idempotency',
    gloss: 'chạy lại bao nhiêu lần cũng ra một kết quả',
    means: bi(
      'Running an operation once or ten times leaves the system in the same final state. An elevator call button is idempotent; a "top up by $10" button is not.',
      'Chạy một thao tác một lần hay mười lần đều để lại hệ thống ở cùng trạng thái cuối. Nút gọi thang máy là idempotent; nút "nạp thêm 10 đô" thì không.',
    ),
    source: {
      name: 'dbt — Incremental models',
      url: 'https://docs.getdbt.com/docs/build/incremental-models',
    },
  },
  {
    term: 'Transaction / ACID atomicity',
    gloss: 'khối được ăn cả ngã về không',
    means: bi(
      'BEGIN…COMMIT groups statements into one all-or-nothing unit. Nothing is visible until COMMIT; if the process dies first, it is as if nothing ran. This removes both "half data" and "missing data".',
      'BEGIN…COMMIT gom các câu lệnh thành một khối được ăn cả ngã về không. Không gì hiển thị ra cho tới COMMIT; nếu process chết trước thì coi như chưa chạy gì. Điều này loại bỏ cả kiểu "dữ liệu một nửa" lẫn "mất dữ liệu".',
    ),
    source: {
      name: 'DuckDB — Transaction management',
      url: 'https://duckdb.org/docs/sql/statements/transactions',
    },
  },
  {
    term: 'Delete-then-insert',
    gloss: 'xoá đúng phần mình sắp ghi, rồi ghi',
    means: bi(
      'The idempotent publish pattern: DELETE WHERE _data_date = D, then INSERT, both inside one transaction. Re-run = replace. DELETE runs even on the first load so first run and re-run share one code path.',
      'Khuôn publish idempotent: DELETE WHERE _data_date = D rồi INSERT, cả hai trong một transaction. Chạy lại = thay thế. Lệnh DELETE chạy cả ở lần đầu để lần chạy đầu và lần chạy lại đi chung một nhánh code.',
    ),
    source: {
      name: 'dbt — Incremental strategies',
      url: 'https://docs.getdbt.com/docs/build/incremental-strategy',
    },
  },
  {
    term: 'Unit of work',
    gloss: 'đơn vị công việc thay thế được',
    means: bi(
      'The chunk your pipeline replaces wholesale on a re-run. Here: one source file (one day). Re-runnability should cost the size of one unit, not the size of the warehouse.',
      'Khối dữ liệu mà pipeline thay thế trọn vẹn khi chạy lại. Ở đây là một file nguồn, tức một ngày. Khả năng chạy lại phải tốn bằng kích thước một đơn vị, không phải bằng kích thước cả warehouse.',
    ),
    source: {
      name: 'Airflow — DAG runs',
      url: 'https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dag-run.html',
    },
  },
  {
    term: 'Run ledger (ops.etl_runs)',
    gloss: 'sổ cái các lần chạy',
    means: bi(
      'One row per ATTEMPT: date, step, status, rows, source_file, error. Answers "did yesterday load?" with a query instead of a guess. Failures are history worth keeping, not shame to overwrite.',
      'Mỗi LẦN THỬ một dòng: ngày, bước, trạng thái, số dòng, tên file nguồn, lỗi. Trả lời câu "hôm qua có load không?" bằng truy vấn thay vì phỏng đoán. Những lần thất bại là lịch sử đáng giữ, không phải điều đáng che.',
    ),
    source: {
      name: 'dbt — Data lineage',
      url: 'https://docs.getdbt.com/terms/data-lineage',
    },
  },
  {
    term: 'Transient vs deterministic failure',
    gloss: 'lỗi tạm thời so với lỗi tất định',
    means: bi(
      'Transient (network blip, locked file) is worth retrying. Deterministic (corrupt file, failed validation) just fails again, slower. Catch TransientError only; let ValueError fly.',
      'Lỗi tạm thời (mạng chớp tắt, file bị khoá) thì đáng thử lại. Lỗi tất định (file hỏng, validation không đạt) thì thử lại vẫn hỏng, chỉ chậm hơn. Chỉ bắt TransientError; để ValueError bay thẳng ra.',
    ),
    source: {
      name: 'Google SRE Book — Handling overload',
      url: 'https://sre.google/sre-book/handling-overload/',
    },
  },
  {
    term: 'Exponential backoff',
    gloss: 'thời gian chờ nhân đôi dần',
    means: bi(
      'Wait 1s, 2s, 4s, 8s between retries instead of hammering a struggling system. Add jitter (random 0.5–1.5×) so many workers do not stampede together after the same outage.',
      'Chờ 1 giây, 2 giây, 4 giây, 8 giây giữa các lần thử lại thay vì dồn ép một hệ thống đang vật vã. Thêm jitter (nhân ngẫu nhiên 0,5 tới 1,5 lần) để nhiều worker không cùng ùa vào sau một sự cố.',
    ),
    source: {
      name: 'Google SRE Book — Handling overload',
      url: 'https://sre.google/sre-book/handling-overload/',
    },
  },
  {
    term: 'Preflight check',
    gloss: 'kiểm tra môi trường trước khi chạy',
    means: bi(
      'Seven environment checks before any data moves: disk space, temp location, source file present, DB not locked, schemas creatable, contract parseable. Each prints a fix hint; any FAIL exits non-zero.',
      'Bảy phép kiểm tra môi trường trước khi dữ liệu di chuyển: dung lượng đĩa, vị trí thư mục tạm, file nguồn có mặt, database không bị khoá, schema tạo được, contract parse được. Mỗi cái in ra gợi ý sửa; chỉ cần một cái FAIL là thoát với mã khác 0.',
    ),
    source: {
      name: 'Google SRE Book — Release engineering',
      url: 'https://sre.google/sre-book/release-engineering/',
    },
  },
  {
    term: 'Chaos engineering',
    gloss: 'cố ý gây lỗi để kiểm chứng',
    means: bi(
      'Injecting failures on purpose to prove a system survives them. A pipeline that has never crashed mid-flight is untested — especially between DELETE and INSERT, the crash that would lose a day without a transaction.',
      'Cố ý tiêm lỗi vào để chứng minh hệ thống sống sót được. Một pipeline chưa từng crash giữa chừng là pipeline chưa được kiểm thử — nhất là ở đoạn giữa DELETE và INSERT, lần crash sẽ làm mất một ngày dữ liệu nếu không có transaction.',
    ),
    source: {
      name: 'Principles of Chaos Engineering',
      url: 'https://principlesofchaos.org/',
    },
  },
  {
    term: 'Order-independent checksum',
    gloss: 'checksum không phụ thuộc thứ tự dòng',
    means: bi(
      'bit_xor(hash(cols)) gives the same value for the same set of rows regardless of order — the tool that proves two runs produced identical data. Hash only BUSINESS columns: lineage should differ between runs.',
      'Hàm bit_xor(hash(các cột)) cho cùng một giá trị với cùng một tập dòng bất kể thứ tự — công cụ chứng minh hai lần chạy tạo ra dữ liệu giống hệt nhau. Chỉ hash các cột NGHIỆP VỤ: cột lineage đáng lẽ phải khác nhau giữa các lần chạy.',
    ),
    source: {
      name: 'DuckDB — Aggregate functions',
      url: 'https://duckdb.org/docs/sql/functions/aggregates',
    },
  },
]