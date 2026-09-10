import type { TheorySection, Term } from '../types'
import { bi } from '../types'

export const a07Theory: TheorySection[] = [
  /* ─────────── TẦNG 1 ─────────── */
  {
    level: 'problem',
    heading: bi(
      'Failure is not the problem. What it leaves behind is.',
      'Chuyện hỏng không đáng sợ. Đáng sợ là thứ nó để lại',
    ),
    paras: [
      bi(
        'Real pipelines fail constantly. The network drops, a disk fills up, a laptop sleeps mid-run, someone hits Ctrl+C. None of that is avoidable.',
        'Pipeline thật hỏng suốt. Mạng rớt, đĩa đầy, laptop ngủ giữa chừng, hoặc ai đó bấm Ctrl+C. Không tránh được cái nào cả.',
      ),
      bi(
        'The question is what state the crash leaves the table in, and what happens when you — or a scheduler, at 3 a.m., without asking — run the job again.',
        'Vấn đề là lần chết đó để cái bảng của bạn ở trạng thái nào, và chuyện gì xảy ra khi bạn, hoặc một cái scheduler lúc 3 giờ sáng chẳng hỏi ai, chạy lại đúng job đó.',
      ),
      bi(
        'A crashed or re-run load ends three ugly ways. Double data: the job succeeded, someone ran it again, every row is in twice. Half data: the job died mid-insert and the table holds part of a day. Missing data: the job deleted the old day, then died before inserting the new one.',
        'Một lần nạp bị chết hoặc bị chạy lại kết thúc theo ba kiểu xấu. Một là dữ liệu nhân đôi: job chạy xong rồi, có người chạy lại, mọi dòng vào bảng hai lần. Hai là dữ liệu một nửa: job chết giữa lúc insert, bảng chỉ giữ được một phần của ngày. Ba là mất dữ liệu: job xoá ngày cũ xong thì chết, chưa kịp insert ngày mới.',
      ),
      bi(
        'Task 1 makes you watch the first one happen: 62,707 rows become 125,414 after an accidental second run. Nothing errors. No warning. The worst pipeline failures are the quiet ones.',
        'Task 1 bắt bạn nhìn tận mắt kiểu thứ nhất: 62.707 dòng thành 125.414 sau một lần chạy lại nhỡ tay. Không lỗi nào báo. Không cảnh báo nào. Mấy kiểu hỏng tệ nhất của pipeline đều là kiểu im lặng.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Why can a plain INSERT never be safe to re-run?',
          'Vì sao một câu INSERT trần không bao giờ an toàn khi chạy lại?',
        ),
        a: bi(
          'Because it only knows how to add. It has no idea whether the rows it is about to write are already sitting in the table — and the table has no way to tell it. Safety has to come from somewhere else: either the operation removes what it is about to write first, or the table refuses duplicates on its own.',
          'Vì nó chỉ biết thêm vào. Nó không hề biết mấy dòng nó sắp ghi đã nằm sẵn trong bảng hay chưa, mà bảng thì cũng chẳng có cách nào nói cho nó biết. Tính an toàn phải đến từ chỗ khác: hoặc bản thân thao tác tự xoá đúng phần nó sắp ghi trước đã, hoặc cái bảng tự nó từ chối dòng trùng.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 2 ─────────── */
  {
    level: 'alternatives',
    heading: bi(
      'Four ways to make a re-run safe',
      'Bốn cách làm cho việc chạy lại trở nên an toàn',
    ),
    paras: [
      bi(
        'All four are used in production somewhere. The difference is how much they ask of the storage, and how much they ask of you to remember.',
        'Cả bốn cách đều đang chạy thật ở đâu đó. Khác nhau ở chỗ chúng đòi hỏi gì ở kho lưu trữ, và bắt bạn phải nhớ bao nhiêu thứ.',
      ),
    ],
    alternatives: [
      {
        name: bi('Just be careful not to run it twice', 'Cứ cẩn thận đừng chạy hai lần'),
        appeal: bi(
          'No code at all. And honestly, for a job one person runs by hand once a week, it holds up longer than it deserves to.',
          'Không phải viết dòng nào. Mà nói thật, với một job mà mỗi tuần một người chạy tay một lần thì nó trụ được lâu hơn mức đáng ra nó nên trụ.',
        ),
        breaks: bi(
          'It stops holding the moment a scheduler is involved, or a retry, or a second person, or you at the end of a long day. And the failure is silent — you find out from a number that looks slightly too good.',
          'Nó thôi trụ ngay khi có một cái scheduler tham gia, hoặc một lần retry, hoặc một người thứ hai, hoặc chính bạn vào cuối một ngày dài. Mà lúc hỏng thì nó im lặng — bạn phát hiện ra qua một con số trông hơi đẹp quá mức bình thường.',
        ),
      },
      {
        name: bi('Put a unique key on the table and let it reject duplicates', 'Đặt khoá unique lên bảng, để nó tự chặn dòng trùng'),
        appeal: bi(
          'The database enforces it, so no discipline is required. Insert the same day twice and the second one bounces off a constraint.',
          'Database tự lo, nên không cần ai phải kỷ luật gì. Insert cùng một ngày hai lần thì lần thứ hai bị ràng buộc chặn lại.',
        ),
        breaks: bi(
          'This feed has no unique key to give you. The same order_id legitimately appears in several files, because about 1.5% of every file is late corrections, and some ids are already duplicated inside a single file. A constraint here would reject correct data and let the real problem through.',
          'Nhưng feed này không có khoá unique nào để mà đặt. Cùng một order_id xuất hiện ở nhiều file là chuyện hợp lệ, vì khoảng 1,5% mỗi file là bản sửa về trễ, và có những id vốn đã trùng ngay bên trong một file. Đặt ràng buộc ở đây sẽ chặn nhầm dữ liệu đúng, còn vấn đề thật thì vẫn lọt.',
        ),
      },
      {
        name: bi('Check before inserting: has this day loaded yet?', 'Kiểm trước khi insert: ngày này nạp chưa?'),
        appeal: bi(
          'Cheap, obvious, and it reads exactly like what you want: if the day is already there, skip it.',
          'Rẻ, dễ hiểu, và đọc lên đúng như thứ bạn muốn: ngày đó có rồi thì bỏ qua.',
        ),
        breaks: bi(
          'It cannot tell "loaded" from "half loaded". A job that died mid-insert leaves rows for that date, so the check says yes and the day stays broken forever. And now you have two code paths — first load and re-load — which drift apart, because only one of them gets exercised daily.',
          'Nhưng nó không phân biệt được "đã nạp" với "nạp được một nửa". Một job chết giữa lúc insert vẫn để lại dòng của ngày đó, nên phép kiểm trả lời là có, và ngày đó hỏng vĩnh viễn. Với lại giờ bạn có hai nhánh code — nạp lần đầu và nạp lại — rồi hai nhánh sẽ trôi khỏi nhau, vì chỉ một nhánh được chạy mỗi ngày.',
        ),
      },
      {
        name: bi('Delete what you are about to write, then write it', 'Xoá đúng phần sắp ghi, rồi ghi'),
        appeal: bi(
          'One code path for everything. DELETE WHERE _data_date = D runs on the very first load too — it deletes zero rows and costs nothing. First run and re-run are literally the same lines of code, so there is no second path to rot.',
          'Một nhánh code cho mọi trường hợp. Câu DELETE WHERE _data_date = D chạy cả ở lần nạp đầu tiên — nó xoá 0 dòng và chẳng tốn gì. Lần đầu và lần chạy lại dùng đúng những dòng code y hệt nhau, nên không có nhánh thứ hai nào để mà mục ruỗng.',
        ),
        breaks: bi(
          'On its own it still leaves a hole: die between the DELETE and the INSERT and the day is gone. That is what the transaction is for, and why the two always travel together.',
          'Nhưng chỉ mình nó thì vẫn hở một lỗ: chết giữa DELETE và INSERT là mất trắng cả ngày đó. Cái transaction sinh ra để bịt chỗ đó, và cũng vì thế mà hai thứ này luôn đi cùng nhau.',
        ),
      },
    ],
    checks: [
      {
        q: bi(
          'What exactly makes the delete+insert pattern idempotent?',
          'Chính xác thì điều gì làm cho khuôn delete rồi insert trở nên idempotent?',
        ),
        a: bi(
          'That the DELETE covers exactly what the INSERT is about to write, no more and no less. Here the unit is one source file — one day\'s CSV — and every row already carries that day in _data_date. Pick the unit of work and make it replaceable; the rest follows.',
          'Ở chỗ câu DELETE phủ đúng phần mà câu INSERT sắp ghi, không thừa không thiếu. Ở đây đơn vị công việc là một file nguồn, tức CSV của một ngày, và mọi dòng đều đã mang sẵn ngày đó ở cột _data_date. Chọn đơn vị công việc rồi làm cho nó thay thế được, phần còn lại tự theo sau.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 3 ─────────── */
  {
    level: 'idea',
    heading: bi(
      'Make the operation replaceable, and give the pipeline a memory',
      'Làm cho thao tác thay thế được, và cho pipeline một trí nhớ',
    ),
    paras: [
      bi(
        'Idempotent, in one line: running an operation once or ten times leaves the system in the same final state. An elevator call button is idempotent — press it five times, one elevator comes. A "top up my account by $10" button is not.',
        'Idempotent, nói gọn một câu: chạy một lần hay chạy mười lần thì hệ thống cũng dừng lại ở cùng một trạng thái. Cái nút gọi thang máy là idempotent — bấm năm lần thì vẫn một cái thang tới. Cái nút "nạp thêm 10 đô vào tài khoản" thì không.',
      ),
      bi(
        'Transactions remove two of the three failure modes. A transaction groups statements into one all-or-nothing unit: after BEGIN nothing is visible until COMMIT, and if the process dies first it is as if nothing ran. So publishing becomes BEGIN, DELETE the old copy, INSERT the new copy, COMMIT. Readers see the old day or the new day, never a mix.',
        'Transaction xử lý hai trong ba kiểu hỏng. Nó gom các câu lệnh thành một khối trọn-hoặc-không: sau BEGIN thì chưa ai thấy gì cho tới lúc COMMIT, còn nếu tiến trình chết trước đó thì coi như chưa có gì chạy. Nên việc công bố dữ liệu thành ra là BEGIN, xoá bản cũ, insert bản mới, COMMIT. Người đọc thấy ngày cũ hoặc ngày mới, không bao giờ thấy một mớ lẫn lộn.',
      ),
      bi(
        'A run ledger removes the third. A pipeline needs memory of what it has done, and ops.etl_runs is that memory: a plain table, one row per attempt, carrying the date, the step, running/success/failed, the row count and the error. It answers "did yesterday load?" with a query instead of a guess.',
        'Còn kiểu hỏng thứ ba thì cần một cuốn sổ ghi các lần chạy. Pipeline phải nhớ được nó đã làm những gì, và bảng ops.etl_runs chính là trí nhớ đó: một cái bảng thường, mỗi lần thử một dòng, ghi ngày, bước, trạng thái running hay success hay failed, số dòng và lỗi. Nó trả lời câu "hôm qua nạp được chưa" bằng một câu query chứ không bằng phỏng đoán.',
      ),
      bi(
        'Every attempt gets its own row. Failures are history worth keeping, not shame to overwrite — and A11 is built entirely on being able to read that history back.',
        'Mỗi lần thử một dòng riêng. Những lần hỏng là lịch sử đáng giữ, không phải chuyện xấu hổ cần ghi đè lên — mà A11 thì dựng hoàn toàn trên khả năng đọc lại được cái lịch sử đó.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Why does the success UPDATE on the ledger sit inside BEGIN…COMMIT?',
          'Vì sao câu UPDATE báo thành công lên ledger lại nằm bên trong BEGIN và COMMIT?',
        ),
        a: bi(
          'So the ledger can never claim success for data that is not there. If the update sat outside, a crash in the gap would leave a row saying success next to a table with nothing in it — and the next run would trust the ledger and skip the day.',
          'Để ledger không bao giờ báo thành công cho một mớ dữ liệu không tồn tại. Nếu câu update nằm ngoài, một lần chết đúng vào khoảng giữa sẽ để lại một dòng ghi success bên cạnh một cái bảng rỗng — rồi lần chạy sau tin vào ledger và bỏ qua ngày đó luôn.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 4 ─────────── */
  {
    level: 'mechanism',
    heading: bi(
      'Where the run\'s facts live, and which failures deserve a retry',
      'Những sự thật về lần chạy nằm ở đâu, và kiểu hỏng nào đáng thử lại',
    ),
    paras: [
      bi(
        'The ledger finishes a story A03 started. The _run_id lineage column has sat NULL in every row since then; today it comes alive. Every published row names the run that wrote it, every run writes its own log file, and a load that gives up for good writes an ops.alerts row. Row points at run, run points at log.',
        'Cuốn sổ này khép lại một câu chuyện mở ra từ A03. Cột lineage _run_id nằm NULL trong mọi dòng từ hồi đó tới giờ; hôm nay nó sống dậy. Mỗi dòng được công bố đều gọi tên lần chạy đã ghi ra nó, mỗi lần chạy tự ghi một file log riêng, và một lần nạp bỏ cuộc hẳn thì ghi thêm một dòng vào ops.alerts. Dòng trỏ tới lần chạy, lần chạy trỏ tới log.',
      ),
      bi(
        'It also collects on A03\'s other lesson, the restraint. A03 gave every row exactly two warehouse-added columns and said the file name and load timestamp did not belong there. Today you build the place they do belong: ops.etl_runs carries source_file and finished_at, one row per attempt, and _run_id is the pointer.',
        'Nó cũng thu về bài học còn lại của A03, tức chuyện biết kiềm chế. A03 cho mỗi dòng đúng hai cột do warehouse thêm vào, và nói rằng tên file với thời điểm nạp không thuộc về chỗ đó. Hôm nay bạn dựng đúng cái chỗ chúng thuộc về: bảng ops.etl_runs mang cột source_file và finished_at, mỗi lần thử một dòng, còn _run_id là con trỏ nối hai bên.',
      ),
      bi(
        'The arithmetic makes the case. Store the file name once on the run and 62,707 rows point at it with an 8-byte id. Copy it onto every row instead and you have 62,707 identical copies of a string — and if the day is re-loaded from a corrected file, all 62,707 have to be rewritten. One ledger row changes instead.',
        'Làm phép tính là thấy ngay. Lưu tên file một lần trên lần chạy, thế là 62.707 dòng trỏ tới nó qua một cái id 8 byte. Còn chép nó xuống từng dòng thì bạn có 62.707 bản sao y hệt của một chuỗi — mà nếu ngày đó phải nạp lại từ một file đã sửa thì cả 62.707 bản đều phải viết lại. Cách kia thì chỉ một dòng trong ledger đổi.',
      ),
      bi(
        'The INSERT that opens the ledger row records source_file right away, before anything can go wrong. A failed attempt should still be able to tell you which file it choked on.',
        'Câu INSERT mở dòng ledger ghi luôn cột source_file ngay từ đầu, trước khi có gì kịp hỏng. Một lần thử thất bại vẫn phải nói được nó nghẹn ở file nào.',
      ),
      bi(
        'Now retries. A transient failure — a network blip, a briefly locked file — is worth retrying, with doubling waits of 1, 2, 4, 8 seconds, to give a struggling system air instead of hammering it. A deterministic failure — a corrupt file, a failed validation — will just fail again, slower. Retry only the transient kind, and that means your code has to be able to tell them apart.',
        'Giờ tới chuyện thử lại. Một lần hỏng nhất thời — mạng chớp một cái, file bị khoá trong chốc lát — thì đáng thử lại, với thời gian chờ nhân đôi dần 1, 2, 4, 8 giây, để hệ thống đang đuối có chỗ thở chứ không bị nện liên tục. Còn một lần hỏng tất định — file hỏng, validate không qua — thì thử lại cũng hỏng y như vậy, chỉ chậm hơn. Chỉ thử lại loại nhất thời, và điều đó có nghĩa code của bạn phải phân biệt được hai loại.',
      ),
    ],
    checks: [
      {
        q: bi(
          'The chaos monkey kills the loader between the DELETE and the INSERT. What does the table look like afterwards?',
          'Con khỉ phá hoại giết loader đúng giữa câu DELETE và câu INSERT. Sau đó cái bảng trông thế nào?',
        ),
        a: bi(
          'Exactly as it did before the run started. The DELETE was never committed, so it never happened as far as any reader is concerned. That is the whole promise of the A in ACID, and Task 6 has you verify it by checksum rather than take it on faith.',
          'Y hệt như trước khi lần chạy đó bắt đầu. Câu DELETE chưa được commit, nên với mọi người đọc thì nó chưa từng xảy ra. Đó đúng là lời hứa của chữ A trong ACID, và Task 6 bắt bạn kiểm lại bằng checksum chứ không phải tin suông.',
        ),
      },
      {
        q: bi(
          'Why check the environment before touching data, when the load would fail anyway?',
          'Vì sao phải kiểm môi trường trước khi động vào dữ liệu, trong khi đằng nào lần nạp đó cũng hỏng?',
        ),
        a: bi(
          'Because of when it fails, and how clearly. A full disk discovered by preflight costs you one FAIL line and zero seconds. The same disk discovered forty minutes into a load costs you the forty minutes, plus an error message about temp files that says nothing about disks. A11\'s backfill runner calls preflight before every single day for exactly this reason.',
          'Vì nó hỏng vào lúc nào, và hỏng rõ ràng tới đâu. Một cái đĩa đầy mà preflight phát hiện ra thì bạn mất một dòng FAIL và không mất giây nào. Cũng cái đĩa đó mà phát hiện ra khi đã nạp được bốn mươi phút thì bạn mất bốn mươi phút, cộng thêm một thông báo lỗi về file tạm chẳng nói gì tới đĩa. Runner backfill của A11 gọi preflight trước từng ngày một, đúng vì lý do này.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 5 ─────────── */
  {
    level: 'detail',
    heading: bi(
      'What today does not promise, and the habits that ride along',
      'Hôm nay không hứa cái gì, và mấy thói quen đi kèm',
    ),
    paras: [
      bi(
        'Be precise about the promise. Today makes the OPERATION safe: re-running a day replaces that day cleanly. It does not make the CONTENT converge. The same order_id still appears in several files, because about 1.5% of every file is late corrections, and nothing here decides which version wins. That is A08\'s job.',
        'Phải nói cho chính xác về lời hứa. Hôm nay làm cho THAO TÁC an toàn: chạy lại một ngày thì ngày đó được thay sạch sẽ. Nó không làm cho NỘI DUNG hội tụ. Cùng một order_id vẫn xuất hiện ở nhiều file, vì khoảng 1,5% mỗi file là bản sửa về trễ, mà ở đây chưa có gì quyết định phiên bản nào thắng. Đó là việc của A08.',
      ),
      bi(
        'A design point that costs nothing and pays forever: DELETE WHERE _data_date = D runs on the first load too. It deletes zero rows. Keeping it means there is one code path instead of two, and the path that runs daily is the same one that runs during a recovery. Fewer paths, fewer bugs.',
        'Có một chỗ trong thiết kế chẳng tốn gì mà lời mãi: câu DELETE WHERE _data_date = D chạy cả ở lần nạp đầu tiên. Nó xoá 0 dòng. Giữ nó lại nghĩa là bạn có một nhánh code thay vì hai, và cái nhánh chạy hằng ngày cũng chính là nhánh chạy lúc khắc phục sự cố. Ít nhánh thì ít lỗi.',
      ),
      bi(
        'The retry wrapper needs a give-up. Retrying forever is not resilience, it is a job that never reports failure — the worst possible outcome, because a pipeline that never says it failed is a pipeline nobody looks at. After the last attempt, write an ops.alerts row and stop.',
        'Cái vòng thử lại phải biết bỏ cuộc. Thử lại mãi mãi không phải là bền bỉ, đó là một job không bao giờ báo hỏng — kết cục tệ nhất có thể, vì một pipeline không bao giờ nói mình hỏng là một pipeline không ai buồn nhìn tới. Sau lần thử cuối cùng thì ghi một dòng vào ops.alerts rồi dừng.',
      ),
      bi(
        'Two habits stop being theory today. A preflight checks the environment before any data moves — disk, permissions, temp directory, the warehouse file, the source file, the manifest — and reports one PASS or FAIL line each. And a git savepoint right before deliberately breaking things turns "I mangled the loader I spent two hours on" from a disaster into one command.',
        'Hôm nay có hai thói quen thôi nằm trên giấy. Preflight kiểm môi trường trước khi có dữ liệu nào dịch chuyển — đĩa, quyền, thư mục tạm, file warehouse, file nguồn, manifest — mỗi thứ một dòng PASS hoặc FAIL. Còn một cái savepoint trên git ngay trước khi cố tình phá đồ thì biến chuyện "tôi vừa băm nát cái loader làm hai tiếng mới xong" từ thảm hoạ thành một câu lệnh.',
      ),
      bi(
        'One nice thing to notice: you have already been using an idempotent tool without calling it that. datagen/generate.py skips files that already exist unless you pass --force. Same property, same reason.',
        'Có một chuyện thú vị đáng để ý: bạn đã dùng một công cụ idempotent từ lâu mà không gọi nó bằng cái tên đó. Script datagen/generate.py bỏ qua những file đã tồn tại, trừ khi bạn truyền cờ --force. Cùng một tính chất, cùng một lý do.',
      ),
      bi(
        'And this is the floor everything above stands on. A09 protects readers during a rewrite, A11 replays this loader over 69 days, and every orchestrator you will ever touch — Airflow, Dagster, dbt — assumes your tasks already have the property you built today. They do not give it to you. They assume it.',
        'Và đây là cái nền mà mọi thứ phía trên đứng lên. A09 lo cho người đọc trong lúc dữ liệu đang được ghi lại, A11 chạy lại chính cái loader này trên 69 ngày, còn mọi công cụ điều phối bạn từng đụng tới — Airflow, Dagster, dbt — đều mặc định rằng task của bạn vốn đã có tính chất bạn dựng hôm nay. Chúng không cho bạn tính chất đó. Chúng cho rằng bạn đã có.',
      ),
    ],
    checks: [
      {
        q: bi(
          'A chaos run failed four times, then succeeded. What should the ledger look like?',
          'Một lần chạy có phá hoại hỏng bốn lần rồi mới thành công. Ledger lúc đó nên trông thế nào?',
        ),
        a: bi(
          'Five rows for that date: four failed, each naming the point it died at, then one success. Not one row overwritten five times. The four failures are how you later answer "was this day flaky, or did it break once?" — and that question comes up during incidents, when guessing is expensive.',
          'Năm dòng cho ngày đó: bốn dòng failed, mỗi dòng gọi tên chỗ nó chết, rồi một dòng success. Không phải một dòng bị ghi đè năm lần. Bốn lần hỏng đó chính là thứ sau này giúp bạn trả lời câu "ngày này chập chờn hay chỉ hỏng đúng một lần" — mà câu đó hay được hỏi giữa lúc có sự cố, lúc mà đoán mò rất đắt.',
        ),
      },
      {
        q: bi(
          'Four runs — one clean, three under chaos — give four identical checksums. What has that proved, and what has it not?',
          'Bốn lần chạy — một lần sạch, ba lần có phá hoại — cho ra bốn checksum giống hệt nhau. Điều đó chứng minh được gì, và chưa chứng minh được gì?',
        ),
        a: bi(
          'Proved: the operation is idempotent — crashes at any of the four points leave the same final state as a clean run. Not proved: that the content is right. The checksum only says every run agrees with every other run, not that they agree with reality. Validation against the manifest is what covers that, and it is a separate step for a reason.',
          'Chứng minh được: thao tác này idempotent — chết ở bất kỳ điểm nào trong bốn điểm cũng để lại trạng thái cuối giống hệt một lần chạy sạch. Chưa chứng minh được: nội dung có đúng hay không. Checksum chỉ nói mọi lần chạy khớp với nhau, chứ không nói chúng khớp với thực tế. Phần đó thuộc về bước validate với manifest, và nó là một bước riêng vì lý do đó.',
        ),
      },
    ],
  },
]

export const a07Terms: Term[] = [
  {
    term: 'Idempotent',
    gloss: 'chạy mấy lần cũng ra một kết quả',
    means: bi(
      'Running an operation once or ten times leaves the system in the same final state. An elevator call button is idempotent; a "top up my account by $10" button is not.',
      'Chạy một lần hay mười lần thì hệ thống cũng dừng ở cùng một trạng thái. Nút gọi thang máy là idempotent; nút "nạp thêm 10 đô vào tài khoản" thì không.',
    ),
    source: {
      name: 'dbt — Incremental strategies',
      url: 'https://docs.getdbt.com/docs/build/incremental-strategy',
    },
  },
  {
    term: 'Unit of work',
    gloss: 'phần nhỏ nhất mà bạn thay nguyên cục',
    means: bi(
      'The slice a re-run replaces whole. Here it is one source file — one day\'s CSV — and every row carries that day in _data_date, so publishing can delete exactly what it is about to write.',
      'Phần dữ liệu mà một lần chạy lại sẽ thay nguyên cục. Ở đây là một file nguồn, tức CSV của một ngày, và mọi dòng đều mang ngày đó ở cột _data_date, nên lúc công bố có thể xoá đúng phần sắp ghi.',
    ),
  },
  {
    term: 'Transaction',
    gloss: 'một khối trọn-hoặc-không',
    means: bi(
      'Statements grouped into one all-or-nothing unit: after BEGIN nothing is visible until COMMIT, and if the process dies first it is as if nothing ran. DuckDB guarantees this even when the process is killed outright.',
      'Nhiều câu lệnh gom thành một khối trọn-hoặc-không: sau BEGIN thì chưa ai thấy gì cho tới COMMIT, còn tiến trình chết trước đó thì coi như chưa có gì chạy. DuckDB bảo đảm điều này kể cả khi tiến trình bị giết thẳng.',
    ),
    source: {
      name: 'DuckDB — Transaction management',
      url: 'https://duckdb.org/docs/stable/sql/statements/transactions',
    },
  },
  {
    term: 'Delete + insert',
    gloss: 'xoá đúng phần sắp ghi, rồi ghi',
    means: bi(
      'DELETE WHERE _data_date = D, then INSERT, inside one transaction. It runs on the first load too, deleting zero rows — so first run and re-run are the same code path.',
      'Chạy DELETE WHERE _data_date = D rồi INSERT, trong cùng một transaction. Nó chạy cả ở lần nạp đầu tiên, xoá 0 dòng — nhờ vậy lần đầu và lần chạy lại dùng chung một nhánh code.',
    ),
    source: {
      name: 'dbt — Incremental strategies',
      url: 'https://docs.getdbt.com/docs/build/incremental-strategy',
    },
  },
  {
    term: 'Run ledger',
    gloss: 'sổ ghi mọi lần chạy, không ghi đè',
    means: bi(
      'ops.etl_runs: one row per attempt, carrying date, step, status, row count, source_file, finished_at and error. Failures are history worth keeping, not shame to overwrite.',
      'Bảng ops.etl_runs: mỗi lần thử một dòng, ghi ngày, bước, trạng thái, số dòng, tên file nguồn, thời điểm kết thúc và lỗi. Những lần hỏng là lịch sử đáng giữ, không phải chuyện xấu hổ cần ghi đè lên.',
    ),
  },
  {
    term: 'Lineage pointer',
    gloss: '_run_id trỏ về lần chạy, thay vì chép mọi thứ xuống từng dòng',
    means: bi(
      'The file name and load timestamp are facts about the run, so they live once on ops.etl_runs and 62,707 rows point at them with an 8-byte id. Re-load from a corrected file and one ledger row changes, not 62,707 strings.',
      'Tên file và thời điểm nạp là sự thật về lần chạy, nên chúng nằm một lần trên ops.etl_runs và 62.707 dòng trỏ tới qua một id 8 byte. Nạp lại từ một file đã sửa thì chỉ một dòng ledger đổi, chứ không phải 62.707 chuỗi.',
    ),
  },
  {
    term: 'Transient vs deterministic failure',
    gloss: 'hỏng nhất thời và hỏng lần nào cũng hỏng',
    means: bi(
      'A network blip or a briefly locked file is worth retrying. A corrupt file or a failed validation will fail again, slower. Your code has to tell them apart, or the retry loop just wastes time on the second kind.',
      'Mạng chớp một cái hay file bị khoá trong chốc lát thì đáng thử lại. File hỏng hay validate không qua thì thử lại cũng hỏng, chỉ chậm hơn. Code phải phân biệt được hai loại, không thì vòng thử lại chỉ phí thời gian cho loại thứ hai.',
    ),
  },
  {
    term: 'Exponential backoff',
    gloss: 'chờ lâu dần giữa các lần thử lại',
    means: bi(
      'Doubling waits — 1s, 2s, 4s, 8s — so a struggling system gets air instead of being hammered. Pair it with a give-up: retrying forever is a job that never reports failure.',
      'Thời gian chờ nhân đôi dần — 1, 2, 4, 8 giây — để một hệ thống đang đuối có chỗ thở thay vì bị nện liên tục. Phải đi kèm một mốc bỏ cuộc: thử lại mãi mãi nghĩa là một job không bao giờ báo hỏng.',
    ),
  },
  {
    term: 'Preflight',
    gloss: 'kiểm môi trường trước khi động vào dữ liệu',
    means: bi(
      'Disk, permissions, temp directory, warehouse file, source file, manifest — one PASS or FAIL line each, before anything moves. A full disk caught here costs one line; caught forty minutes in, it costs forty minutes.',
      'Kiểm đĩa, quyền, thư mục tạm, file warehouse, file nguồn, manifest — mỗi thứ một dòng PASS hoặc FAIL, trước khi có gì dịch chuyển. Một cái đĩa đầy bắt được ở đây thì mất một dòng; bắt được sau bốn mươi phút thì mất bốn mươi phút.',
    ),
  },
  {
    term: 'Chaos testing',
    gloss: 'cố tình cho chết ở những chỗ tệ nhất',
    means: bi(
      'Injecting failures at chosen points — after staging, mid-transaction, before commit — to check the recovery you designed actually works. Verifying by checksum rather than by hope.',
      'Cố tình gây lỗi ở những điểm đã chọn — sau khi stage, giữa transaction, ngay trước commit — để kiểm xem cách khắc phục bạn thiết kế có chạy thật không. Kiểm bằng checksum chứ không bằng hy vọng.',
    ),
    source: {
      name: 'Netflix — Chaos Monkey',
      url: 'https://netflix.github.io/chaosmonkey/',
    },
  },
]