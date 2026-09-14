import type { AssignmentSpec } from '../types'
import { bi } from '../types'
import { a11Terms, a11Theory } from './a11.theory'

export const a11: AssignmentSpec = {
  id: 'a11',
  code: 'A11',
  title: bi('Backfill: rebuild history', 'Backfill: dựng lại lịch sử'),
  summary: bi(
    'Replay all 69 days through one runner, walk into a genuinely corrupt file from five weeks ago, and handle it like a professional: diagnose, quarantine, document, resume. You do not start over.',
    'Bạn sẽ chạy lại cả 69 ngày qua một runner, đâm thẳng vào một file hỏng thật từ năm tuần trước, rồi xử lý nó cho ra nghề: chẩn đoán, cách ly, ghi chép, chạy tiếp. Không làm lại từ đầu.',
  ),
  estHours: 5,
  difficulty: 3,
  outcome: bi(
    'You can replay months of history through your normal pipeline without writing a second copy of it, resume a backfill that died at day 40 without redoing days 1 to 39, diagnose a failure by walking layers instead of guessing, and hand a producer an incident note with counted evidence attached.',
    'Sau bài này bạn chạy lại được nhiều tháng lịch sử qua chính pipeline bình thường mà không phải viết bản sao thứ hai của nó, chạy tiếp được một lần backfill đã chết ở ngày 40 mà không phải làm lại từ ngày 1 tới 39, chẩn đoán được một lần hỏng bằng cách đi lần lượt qua từng tầng thay vì đoán mò, và đưa được cho bên cung cấp một bản ghi sự cố kèm bằng chứng đã đếm.',
  ),
  theory: a11Theory,
  terms: a11Terms,
  tasks: [
    /* ═══════════════ T0 — SETUP ═══════════════ */
    {
      id: 'a11-t0',
      title: bi('Setup', 'Chuẩn bị'),
      goal: bi(
        'Both scales, a branch, and one thing you must not do early.',
        'Cả hai scale, một nhánh git, và một việc tuyệt đối không được làm sớm.',
      ),
      steps: [
        {
          title: bi('What you need in place', 'Những thứ phải có sẵn'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'A10 done, the full 69-day raw history generated at BOTH scales, your idempotent per-day pipeline from A07 upgraded in A10 to output the canonical schema, work/preflight.py from A07, and the ops.etl_runs ledger from A07 plus the ops.alerts table from A05.',
                'Bạn cần đã xong A10, đã sinh đủ 69 ngày dữ liệu thô ở CẢ HAI scale, có pipeline theo ngày mang tính idempotent từ A07 và đã nâng cấp ở A10 để trả ra canonical schema, có file work/preflight.py từ A07, cùng bảng ops.etl_runs từ A07 và bảng ops.alerts từ A05.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Develop and debug the runner on small, then do one full-scale run for the record. Have open: your repo, your journal, Task Manager on the Performance tab, and a terminal at the repo root.',
                'Hãy dựng và gỡ lỗi runner ở scale small trước, rồi chạy một lần ở full để lấy số liệu chính thức. Nên mở sẵn: repo, journal, Task Manager ở tab Performance, và một terminal đặt tại thư mục gốc của repo.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `SET memory_limit = '8GB'; SET threads = 8;
SET temp_directory = '<DATA_ROOT>/tmp';`,
            },
            {
              kind: 'trap',
              body: bi(
                'Run scripts from the REPO ROOT with python -m work.runner … so that both lib and work import cleanly. Running the file directly from inside work/ gives you an ImportError that looks like a missing package.',
                'Hãy chạy script từ THƯ MỤC GỐC của repo bằng lệnh python -m work.runner … để cả lib lẫn work đều import được. Nếu chạy thẳng file từ bên trong thư mục work/ thì bạn sẽ nhận một lỗi ImportError trông y như thiếu thư viện.',
              ),
            },
          ],
        },
        {
          title: bi('Git ritual, and one rule', 'Nếp git, và một quy tắc'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `git switch -c a11-backfill
# commit sau mỗi task có đánh số:
git commit -m "A11 task 2: backfill runner"
# merge về main khi Definition of Done xanh hết`,
            },
            {
              kind: 'trap',
              body: bi(
                'Do NOT pre-fix anything for 2026-07-22. Walk into the wall first — the diagnosis in Task 4 is the point of the assignment, and it only works if you have not already guessed the answer.',
                'ĐỪNG sửa trước bất cứ thứ gì cho ngày 2026-07-22. Cứ đâm vào tường đã, vì phần chẩn đoán ở Task 4 mới là điểm chính của cả bài, mà nó chỉ có tác dụng nếu bạn chưa đoán trước câu trả lời.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Branch created, both scales generated, python -m work.runner resolves imports from the repo root',
          'Đã tạo nhánh, đã sinh dữ liệu ở cả hai scale, và lệnh python -m work.runner import được từ thư mục gốc repo',
        ),
      ],
    },

    /* ═══════════════ T1 ═══════════════ */
    {
      id: 'a11-t1',
      num: 1,
      title: bi('Know the target before you fire', 'Biết đích trước khi bắn'),
      goal: bi(
        'A backfill starts with a number: how many rows should history contain?',
        'Một lần backfill bắt đầu bằng một con số: phần lịch sử lẽ ra phải có bao nhiêu dòng?',
      ),
      steps: [
        {
          title: bi('Read every manifest at once', 'Đọc toàn bộ manifest trong một lượt'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT count(*)          AS files,
       sum(rows)         AS total_rows,
       sum(corrupt_rows) AS corrupt_lines
FROM read_json_auto('<DATA_ROOT>/small/raw/manifest/orders_*.json');`,
            },
            {
              kind: 'expect',
              body: bi(
                'Small scale, deterministic: 69 files, 4,116,840 rows, 151 corrupt lines.',
                'Ở scale small thì con số cố định: 69 file, 4.116.840 dòng, và 151 dòng hỏng.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'corrupt_lines is not zero. The manifests have been warning you about 2026-07-22 all along — the producer\'s own paperwork confesses before you read a single byte of CSV. Remember this for the detection-gap section of the postmortem in Task 9.',
                'Để ý là số dòng hỏng không bằng 0. Mấy cái manifest đã cảnh báo bạn về ngày 2026-07-22 từ đầu tới giờ, tức là giấy tờ của chính bên cung cấp đã tự thú trước khi bạn kịp đọc lấy một byte CSV nào. Hãy nhớ chuyện này để dùng cho mục khoảng trống phát hiện trong bản ghi chép sự cố ở Task 9.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT file, era, rows, corrupt_rows
FROM read_json_auto('<DATA_ROOT>/small/raw/manifest/orders_*.json')
WHERE corrupt_rows > 0;`,
            },
            {
              kind: 'expect',
              body: bi(
                'Full scale: roughly 82M rows. Your own manifest sum is the truth — run the same query against the full manifests and write both totals down.',
                'Ở scale full thì chừng 82 triệu dòng. Nhưng con số đúng là tổng theo manifest trên chính máy bạn, nên hãy chạy đúng câu query đó trên manifest bản full rồi ghi lại cả hai tổng.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Both query results in the journal, plus the same totals for full scale',
          'Kết quả của cả hai câu query đã nằm trong journal, kèm các tổng tương ứng ở scale full',
        ),
      ],
    },

    /* ═══════════════ T2 ═══════════════ */
    {
      id: 'a11-t2',
      num: 2,
      title: bi('Build the runner', 'Dựng runner'),
      goal: bi(
        'One module that loads a day, and one loop that drives it over a range.',
        'Một module lo việc nạp một ngày, và một vòng lặp điều khiển nó chạy trên cả dải ngày.',
      ),
      steps: [
        {
          title: bi('First, assemble work/pipeline.py', 'Trước hết, lắp file work/pipeline.py'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Nothing named work/pipeline.py exists yet. Build it now: one module exposing load_day(con, day, scale) -> int, stitched from code you already wrote. This is the biggest assembly step in the lab, and it is the composable-code ladder doing its job — read guides/composable_code.md if the pattern feels new.',
                'Hiện chưa có file nào tên work/pipeline.py cả, nên bây giờ bạn dựng nó: một module cung cấp hàm load_day(con, day, scale) trả về một số nguyên, ghép lại từ những đoạn code bạn đã viết. Đây là bước lắp ráp lớn nhất trong cả khoá, và cũng là lúc cái thang code ghép được phát huy tác dụng. Nếu khuôn này còn lạ thì đọc guides/composable_code.md.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `"""work/pipeline.py - một ngày, CSV thô -> core.orders canonical, runner gọi được."""
import datetime as dt

from lib.labpaths import manifest_dir, raw_orders_dir
from work.a10_canonical import CANON, era_of, open_day   # A10 Task 5-6


def load_day(con, day: dt.date, scale: str, run_id=None) -> int:
    # 1. bảo đảm core.orders — CREATE TABLE IF NOT EXISTS, cột canonical
    #    (A10 Task 4) + hai cột lineage §7.2 (A07 Task 3, ensure_tables)
    # 2. dispatch theo era: open_day(con, day, era_of(day), raw_orders_dir(scale)),
    #    rồi TEMP stg_day từ CANON (A10 Task 5-6 — thay cho bước stage
    #    chỉ-dành-cho-v1 ở A07 Task 3)
    # 3. validate: count(*) FROM aligned == trường rows của manifest (A07 Task 3,
    #    bước 3 — đếm aligned chứ không đếm stg_day: CANON loại các dòng ts không parse được)
    # 4. publish: BEGIN; DELETE WHERE _data_date; INSERT stg_day + lineage;
    #    COMMIT (A07 Task 3, bước 4 — TRỪ phần UPDATE ledger: ops.etl_runs
    #    giờ thuộc về runner)
    ...
    return raw_n   # số dòng thô ở bước 3 — thứ runner ghi vào ops.etl_runs`,
            },
            {
              kind: 'text',
              body: bi(
                'The adapter checklist, four items. Signature: A07\'s was load_day(con, scale, day, chaos=0.0) — rename the module, reorder the arguments, drop chaos or default it to 0, accept the runner\'s run_id so the _run_id lineage column gets stamped, and return the day\'s raw row count. Era dispatch: route every date through A10\'s era_of(day) and per-era schemas, so month-2 files load as canonical rows instead of crashing.',
                'Có bốn việc phải sửa khi lắp. Thứ nhất là chữ ký hàm: bản ở A07 là load_day(con, scale, day, chaos=0.0), nên bạn đổi tên module, đổi lại thứ tự tham số, bỏ chaos đi hoặc để mặc định bằng 0, nhận thêm run_id từ runner để cột lineage _run_id được đóng dấu, và trả về số dòng thô của ngày đó. Thứ hai là dispatch theo era: đưa mọi ngày đi qua hàm era_of(day) và các schema theo era của A10, để file tháng 2 nạp vào thành dòng canonical thay vì làm chết chương trình.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Retire the v1 target table. core.orders still has the 13-column v1 shape A07 created — skip this and day 1 dies with "Binder Error: table orders has 13 columns but 18 values were supplied". It is derived data, so DROP TABLE core.orders once and let your pipeline\'s CREATE TABLE IF NOT EXISTS recreate it in the A10 canonical schema plus _data_date and _run_id. That is the whole list of underscore columns.',
                'Việc thứ ba là cho cái bảng đích kiểu v1 nghỉ. Bảng core.orders vẫn đang mang hình dạng v1 với 13 cột do A07 tạo ra, nên nếu bỏ qua bước này thì ngày đầu tiên sẽ chết với thông báo Binder Error kiểu bảng orders có 13 cột nhưng lại đưa vào 18 giá trị. Đó là dữ liệu dẫn xuất nên cứ chạy DROP TABLE core.orders một lần, rồi để câu CREATE TABLE IF NOT EXISTS trong pipeline dựng lại nó theo canonical schema của A10 cộng hai cột _data_date và _run_id. Đó là toàn bộ danh sách những cột có gạch dưới.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Keep the A07 transaction intact: stage, validate, then BEGIN; DELETE the day; INSERT; COMMIT. The runner\'s resume logic is only trustworthy because a crashed day leaves nothing behind. Weaken the transaction and "not green, so run it again" stops being safe.',
                'Việc thứ tư là giữ nguyên transaction của A07: stage, validate, rồi BEGIN, xoá ngày đó, insert lại, và COMMIT. Phần logic chạy tiếp của runner sở dĩ đáng tin là vì một ngày chết giữa chừng không để lại thứ gì. Làm yếu transaction đi thì cái luật chưa xanh nên chạy lại sẽ không còn an toàn nữa.',
              ),
            },
          ],
        },
        {
          title: bi('Then the runner itself', 'Rồi tới chính cái runner'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `def build_plan(con, dates, only_failed: bool, force: bool):
    plan = []                             # (date, "run"|"skip", reason)
    for d in dates:
        st = latest_status(con, d)
        if force:
            plan.append((d, "run", f"--force (last status: {st})"))
        elif only_failed:
            if st == "failed":
                plan.append((d, "run", "last run failed"))
            else:
                plan.append((d, "skip", f"last status is {st}, not failed"))
        elif st == "success":
            plan.append((d, "skip", "already green"))
        else:
            plan.append((d, "run", "never ran" if st is None else f"last status: {st}"))
    return plan`,
            },
            {
              kind: 'text',
              body: bi(
                'Read build_plan until the three modes are obvious. Default skips green days, which is resume. --only-failed retries known failures only. --force rebuilds everything, and that is a restatement.',
                'Hãy đọc hàm build_plan cho tới khi ba chế độ của nó trở nên hiển nhiên. Chế độ mặc định bỏ qua những ngày đã xanh, tức là chạy tiếp. Cờ --only-failed chỉ thử lại những ngày đã biết là hỏng. Còn cờ --force dựng lại tất cả, và đó là một lần restatement.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'One state to know before you meet it: kill the runner mid-day with Ctrl-C and that day\'s ledger row stays at running. The default resume picks it up, because anything not green runs again. --only-failed does not, because it selects exactly the status its name says.',
                'Có một trạng thái bạn nên biết trước khi gặp: nếu bấm Ctrl-C giết runner giữa chừng thì dòng ledger của ngày đó nằm lại ở trạng thái running. Chế độ mặc định sẽ nhặt nó lên, vì hễ chưa xanh là chạy lại. Còn --only-failed thì không, bởi nó chỉ chọn đúng cái trạng thái mà tên của nó nói ra.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `        try:
            if not run_checks(args.scale, d):         # preflight chạy trước MỖI ngày
                raise RuntimeError(
                    "preflight failed - fix the FAIL line above, then --only-failed")
            n = load_day(con, d, scale=args.scale, run_id=run_id)
            con.execute("""UPDATE ops.etl_runs SET status='success',
                           finished_at=now(), rows=? WHERE run_id = ?""", [n, run_id])
        except Exception as e:            # lỗi thì ghi lại rồi đi tiếp
            try:
                con.execute("ROLLBACK")   # load_day có thể chết trong BEGIN của nó;
            except duckdb.Error:          #  transaction chết sẽ giết luôn câu UPDATE
                pass                      #  ledger (quy tắc đường-lỗi của A07)
            con.execute("""UPDATE ops.etl_runs SET status='failed',
                           finished_at=now(), error=? WHERE run_id = ?""",
                        [str(e)[:500], run_id])`,
            },
            {
              kind: 'why',
              body: bi(
                'The ROLLBACK in the error path is not decoration. load_day may have died inside its own BEGIN, and a dead transaction would make the ledger UPDATE fail too — so the failure would not even be recorded, and the runner would look like it silently skipped a day.',
                'Lệnh ROLLBACK ở nhánh lỗi không phải để trang trí đâu. Hàm load_day có thể đã chết ngay bên trong BEGIN của chính nó, mà một transaction đã chết thì làm hỏng luôn câu UPDATE lên ledger. Khi đó lần hỏng ấy thậm chí còn không được ghi lại, và nhìn vào thì tưởng runner lặng lẽ bỏ qua một ngày.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Preflight is called before EVERY day, not once at startup. Each date brings its own source file and manifest, and disks fill and locks appear mid-backfill. A permission or disk problem caught at hour 0 costs nothing; the same problem discovered at row 40 million costs the evening. And because a failed preflight lands in the ledger like any other failure, --only-failed picks that day up as soon as you fix what the FAIL line named.',
                'Preflight được gọi trước MỖI ngày chứ không phải một lần lúc khởi động. Mỗi ngày mang theo file nguồn và manifest riêng, mà chuyện đĩa đầy hay file bị khoá thì xuất hiện ngay giữa lúc backfill đang chạy. Một vấn đề về quyền hay dung lượng bắt được ở giờ thứ 0 thì chẳng tốn gì, còn đúng vấn đề đó mà phát hiện ở dòng thứ 40 triệu thì mất cả buổi tối. Và vì preflight hỏng cũng vào ledger như mọi kiểu hỏng khác, nên --only-failed sẽ nhặt ngày đó lên ngay khi bạn sửa xong thứ mà dòng FAIL đã gọi tên.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'The runner writes source_file on the INSERT, not on the UPDATE. A failed day must still say which file it was trying to read. This is the other half of the A03 decision: the file name is recorded once per attempt on the ledger, and your data rows carry only _data_date and _run_id. Today that pays — the Task 9 write-up reads file name, load time and row count from 69 ledger rows instead of 4 million data rows.',
                'Runner ghi cột source_file ở câu INSERT chứ không phải ở câu UPDATE, vì một ngày hỏng vẫn phải nói được nó đang định đọc file nào. Đây là nửa còn lại của quyết định từ A03: tên file được ghi đúng một lần cho mỗi lần thử trên ledger, còn các dòng dữ liệu thì chỉ mang _data_date và _run_id. Hôm nay là lúc chuyện đó sinh lời, vì phần ghi chép ở Task 9 đọc tên file, thời điểm nạp và số dòng từ 69 dòng ledger thay vì từ 4 triệu dòng dữ liệu.',
              ),
            },
          ],
        },
        {
          title: bi('Test the safety catch, then smoke-test the stitch', 'Thử cái chốt an toàn, rồi thử mối lắp'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `python -m work.runner --scale small --start 2026-06-01 --end 2026-08-08 --dry-run`,
            },
            {
              kind: 'code',
              lang: 'python',
              body: `import datetime as dt, duckdb
from lib.labpaths import tmp_dir, warehouse_path
from work.pipeline import load_day

con = duckdb.connect(str(warehouse_path("small")))
con.execute(f"SET memory_limit='8GB'; SET threads=8; "
            f"SET temp_directory='{tmp_dir('small').as_posix()}';")
print(load_day(con, dt.date(2026, 6, 2), scale="small"))    # ngày v1
print(load_day(con, dt.date(2026, 7, 20), scale="small"))   # ngày v2`,
            },
            {
              kind: 'text',
              body: bi(
                'Two minutes now versus discovering a bad stitch forty days into Task 3. Each number must equal that manifest\'s rows — one equality that proves the whole assembly: per-era columns= read, aligner, canonicalizer, atomic publish into the canonical core.orders.',
                'Bỏ ra hai phút bây giờ, so với việc phát hiện mối lắp hỏng khi đã chạy tới ngày thứ bốn mươi ở Task 3. Mỗi con số in ra phải bằng đúng trường rows của manifest tương ứng, và đúng một phép bằng nhau đó chứng minh cả bộ lắp ráp: đọc bằng columns= theo từng era, aligner, canonicalizer, và bước publish atomic vào bảng core.orders đã canonical.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'The smoke test returns 59,024 for 2026-06-02 and 59,743 for 2026-07-20. The dry run prints a 69-line plan and says 69 of 69 dates selected. And ops.etl_runs has no new rows after either check.',
                'Lần thử nhanh phải trả về 59.024 cho ngày 2026-06-02 và 59.743 cho ngày 2026-07-20. Lần chạy thử thì in ra kế hoạch 69 dòng và báo là chọn 69 trên 69 ngày. Và sau cả hai phép kiểm, bảng ops.etl_runs không được có dòng mới nào.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'A dry run that writes anything is a bug, and the ledger is the runner\'s to write, not load_day\'s. Notice what a direct call does: it stamps _run_id NULL and leaves the ledger alone, which is why Task 3 will still select all 69 dates and simply replace today\'s two idempotently.',
                'Một lần chạy thử mà ghi ra bất cứ thứ gì là lỗi, còn ledger thì thuộc quyền ghi của runner chứ không phải của load_day. Hãy để ý một lần gọi trực tiếp sẽ làm gì: nó đóng dấu _run_id là NULL và không đụng tới ledger, và đó là lý do Task 3 vẫn chọn đủ 69 ngày rồi ghi đè hai ngày hôm nay một cách idempotent.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'If 06-02 dies with the 13-versus-18 Binder Error instead, you skipped the third item on the adapter checklist.',
                'Nếu ngày 06-02 lại chết với lỗi Binder Error kiểu 13 so với 18 thì nghĩa là bạn đã bỏ qua việc thứ ba trong danh sách bốn việc phải sửa khi lắp.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Smoke test returns 59,024 and 59,743, each exactly its manifest rows',
          'Lần thử nhanh trả về 59.024 và 59.743, mỗi số bằng đúng trường rows của manifest tương ứng',
        ),
        bi(
          'Dry run prints a 69-line plan and selects 69 of 69 dates',
          'Lần chạy thử in ra kế hoạch 69 dòng và chọn 69 trên 69 ngày',
        ),
        bi(
          'ops.etl_runs has no new rows after either check',
          'Bảng ops.etl_runs không có dòng mới nào sau cả hai phép kiểm',
        ),
      ],
    },

    /* ═══════════════ T3 ═══════════════ */
    {
      id: 'a11-t3',
      num: 3,
      title: bi('Full-history backfill, first attempt', 'Backfill toàn bộ lịch sử, lần thử đầu tiên'),
      goal: bi(
        'Run it for real and watch one day go red without taking the others with it.',
        'Chạy thật một lần và xem một ngày đỏ lên mà không kéo theo những ngày còn lại.',
      ),
      steps: [
        {
          title: bi('Launch, and watch', 'Chạy, và quan sát'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `python -m work.runner --scale small --start 2026-06-01 --end 2026-08-08`,
            },
            {
              kind: 'text',
              body: bi(
                'While it runs, watch Task Manager: CPU spikes while each day\'s SQL executes, then dips between days. The machine is far from saturated. Remember this picture — A12 exists because of it.',
                'Trong lúc nó chạy, hãy mở Task Manager ra xem: CPU vọt lên khi câu SQL của mỗi ngày chạy, rồi tụt xuống ở quãng giữa hai ngày. Nghĩa là máy còn xa mới đầy tải. Hãy nhớ hình ảnh đó, vì A12 sinh ra chính vì nó.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Each day opens with your preflight\'s PASS lines scrolling past. Routine and boring, which is exactly what you want from them — Task 4 shows the payoff.',
                'Mỗi ngày mở đầu bằng mấy dòng PASS của preflight trôi qua màn hình. Đều đều và nhàm chán, mà đó đúng là thứ bạn muốn ở chúng. Task 4 sẽ cho thấy nó sinh lời ở chỗ nào.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'The runner reaches 2026-07-22, goes red, and keeps going. The end summary shows failed 1 / success 68. That is the design working, not the design breaking.',
                'Runner sẽ chạy tới ngày 2026-07-22, đỏ lên, rồi vẫn chạy tiếp. Bảng tổng kết cuối cùng hiện 1 failed và 68 success. Đó là thiết kế đang hoạt động đúng chứ không phải thiết kế đang hỏng.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Summary shows 68 success + 1 failed; per-day timings and total wall clock are in the journal',
          'Bảng tổng kết hiện 68 success và 1 failed, còn thời gian từng ngày và tổng thời gian chạy đã ghi vào journal',
        ),
      ],
    },

    /* ═══════════════ T4 ═══════════════ */
    {
      id: 'a11-t4',
      num: 4,
      title: bi('Diagnose the failure, layer by layer', 'Chẩn đoán lỗi, đi qua từng tầng'),
      goal: bi(
        'Read what actually happened, and check in order rather than in inspiration order.',
        'Đọc xem chuyện gì thật sự đã xảy ra, và kiểm theo đúng thứ tự thay vì theo thứ tự nảy ra trong đầu.',
      ),
      steps: [
        {
          title: bi('Rule zero — read the error', 'Quy tắc số không — đọc thông báo lỗi'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT run_date, error FROM ops.etl_runs
WHERE status = 'failed' ORDER BY started_at DESC LIMIT 1;`,
            },
            {
              kind: 'text',
              body: bi(
                'It says something like "Error when sniffing file … It was not possible to automatically detect the CSV parsing dialect". Copy it into your journal verbatim — then refuse to act on it.',
                'Nó sẽ nói đại loại là có lỗi khi dò file, không tự xác định được cách parse CSV. Hãy chép nguyên văn câu đó vào journal, rồi từ chối hành động theo nó.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'The dialect has not changed — commas and quotes are the same as every other file. Error messages point at the symptom nearest to the code that raised them, not at the root cause. Rule zero\'s job is to collect the words, not to believe them.',
                'Thật ra cách parse chẳng đổi gì cả: dấu phẩy và dấu nháy vẫn y như mọi file khác. Thông báo lỗi chỉ vào triệu chứng gần nhất với đoạn code đã ném nó ra, chứ không chỉ vào nguyên nhân gốc. Việc của quy tắc số không là thu thập lấy câu chữ, không phải tin vào chúng.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Open guides/troubleshooting.md next to your terminal. It is a top-down checklist: rule zero, read the error; layer 1 environment; layer 2 storage and permissions; layer 3 the data itself. The habit you practise here — walk the layers, cross each off with evidence — is worth more than today\'s answer.',
                'Hãy mở guides/troubleshooting.md ra bên cạnh terminal. Nó là một danh sách kiểm đi từ trên xuống: quy tắc số không là đọc lỗi, tầng 1 là môi trường, tầng 2 là lưu trữ và quyền, tầng 3 là chính dữ liệu. Cái thói quen bạn tập ở đây, tức là đi lần lượt qua từng tầng và gạch từng tầng bằng bằng chứng, còn giá trị hơn cả đáp án của hôm nay.',
              ),
            },
          ],
        },
        {
          title: bi('Layers 1 and 2 — crossed off in seconds', 'Tầng 1 và tầng 2 — gạch trong vài giây'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'Before blaming the data, rule out the environment (right venv? data root set?) and the storage (disk full? permissions? temp on the wrong volume? DB file locked?). You cross both off with evidence rather than optimism: your runner\'s preflight ran green for this exact date moments before the crash. That is the quiet payoff of the per-day preflight call — mid-incident, it hands you two pre-cleared layers.',
                'Trước khi đổ lỗi cho dữ liệu, hãy loại trừ môi trường (đúng venv chưa, đã đặt data root chưa) và phần lưu trữ (đĩa đầy chưa, quyền thế nào, thư mục tạm có nằm nhầm ổ không, file database có bị khoá không). Bạn gạch cả hai tầng bằng bằng chứng chứ không bằng sự lạc quan: preflight của runner vừa chạy xanh cho đúng ngày này ngay trước lúc nó chết. Đó là chỗ sinh lời âm thầm của việc gọi preflight mỗi ngày, vì giữa lúc sự cố nó đưa cho bạn sẵn hai tầng đã dọn.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'On a networked warehouse this is where you would probe DNS, port, TLS, credentials and grants instead — the guide\'s second column.',
                'Với một warehouse chạy qua mạng thì đây lại là chỗ bạn đi thăm dò DNS, cổng, TLS, thông tin đăng nhập và quyền, tức là cột thứ hai trong bảng của guide.',
              ),
            },
          ],
        },
        {
          title: bi('Layer 3 — the data itself', 'Tầng 3 — chính dữ liệu'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `Get-ChildItem "$env:ETL_LAB_DATA\\small\\raw\\orders\\orders_2026-07-2*.csv" | Select-Object Name, Length
Get-Content "$env:ETL_LAB_DATA\\small\\raw\\orders\\orders_2026-07-22.csv" -TotalCount 2`,
            },
            {
              kind: 'text',
              body: bi(
                'Three questions, straight down the checklist. Does the file exist at a plausible size? It is there, about 19 MB, the same ballpark as its neighbours — so this is not a failed or truncated-to-nothing delivery. What does the manifest say? Task 1 already told you: corrupt_rows 151. Is the header intact? A clean 13-column v2 header and a normal first row.',
                'Ba câu hỏi, đi thẳng theo danh sách. Một, file có tồn tại với kích thước hợp lý không? Nó nằm đó, chừng 19 MB, cùng tầm với mấy file bên cạnh, nên đây không phải một lần giao hỏng hay bị cắt còn rỗng. Hai, manifest nói gì? Task 1 đã cho bạn biết rồi: corrupt_rows bằng 151. Ba, header còn nguyên không? Một header v2 13 cột sạch sẽ và một dòng đầu tiên hoàn toàn bình thường.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Delivered file, plausible size, intact header, but the producer\'s own manifest admits 151 broken lines. Conclusion: structural corruption. Some LINES are broken — not the file, not your settings, not your code. The walk stops at the layer where the evidence converges, and today that was layer 3.',
                'Tổng lại: file đã được giao, kích thước hợp lý, header còn nguyên, nhưng manifest của chính bên cung cấp thừa nhận có 151 dòng hỏng. Kết luận là hỏng về mặt cấu trúc. Một số DÒNG bị hỏng, chứ không phải cả file, không phải thiết lập của bạn, cũng không phải code của bạn. Cuộc đi dừng lại ở cái tầng mà bằng chứng hội tụ về, và hôm nay tầng đó là tầng 3.',
              ),
            },
          ],
        },
        {
          title: bi('Confirm with store_rejects', 'Xác nhận bằng store_rejects'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `CREATE TABLE probe AS
SELECT * FROM read_csv('<DATA_ROOT>/small/raw/orders/orders_2026-07-22.csv',
    header=true, store_rejects=true,
    columns={'order_id':'BIGINT','customer_id':'BIGINT','store_id':'INTEGER',
             'order_ts':'VARCHAR','updated_at':'TIMESTAMP','status':'VARCHAR',
             'payment_method':'VARCHAR','order_total':'VARCHAR',
             'items':'VARCHAR','meta':'VARCHAR','currency':'VARCHAR',
             'discount_amount':'VARCHAR','channel':'VARCHAR'});   -- era v2

SELECT count(*) FROM probe;                       -- 58.400 ở scale small
SELECT count(DISTINCT line) FROM reject_errors;   -- 151 = corrupt_rows của manifest
SELECT error_type, count(*) AS records, count(DISTINCT line) AS lines
FROM reject_errors GROUP BY 1 ORDER BY 2 DESC;`,
            },
            {
              kind: 'trap',
              body: bi(
                'Rejects only appear on a materializing scan. A bare count(*) probe is optimized past parsing and leaves the reject table empty — a false all-clear that reads exactly like a real one. Use CREATE TABLE … AS.',
                'Các dòng bị loại chỉ xuất hiện khi phép quét có vật chất hoá kết quả. Một câu count(*) trần sẽ bị tối ưu bỏ qua phần parse và để bảng reject rỗng, tức là một lần báo an toàn giả mà đọc lên y hệt một lần báo an toàn thật. Vậy nên phải dùng CREATE TABLE … AS.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'A truncated line yields one reject record per missing column. At small scale you see about 1,651 records but only 151 distinct lines: 150 truncated lines plus exactly 1 unclosed-quote line. Always count DISTINCT line, or you inflate the incident by a factor of ten.',
                'Một dòng bị cắt cụt sinh ra một bản ghi lỗi cho mỗi cột còn thiếu. Ở scale small bạn sẽ thấy chừng 1.651 bản ghi nhưng chỉ có 151 dòng khác nhau, gồm 150 dòng bị cắt cụt cộng đúng 1 dòng thiếu dấu nháy đóng. Hãy luôn đếm số dòng khác nhau, không thì bạn thổi phồng sự cố lên gấp mười lần.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                '58,400 rows parsed, 151 distinct rejected lines — equal to the manifest\'s corrupt_rows. Error types: missing columns on 150 lines, a cast error on the same 150, and one unquoted value on 1 line.',
                'Kết quả phải là parse được 58.400 dòng và có 151 dòng khác nhau bị loại, bằng đúng trường corrupt_rows của manifest. Các loại lỗi gồm: thiếu cột ở 150 dòng, lỗi cast cũng ở đúng 150 dòng đó, và một giá trị thiếu dấu nháy ở 1 dòng.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Now rule zero\'s message finally makes sense. Among the 151 is exactly ONE line with an unclosed quote, and that single line poisons DuckDB\'s dialect sniffer for the whole file. That is why the error talked about dialect detection while the disease was truncated lines.',
                'Tới đây thì thông báo ở quy tắc số không mới có nghĩa. Trong 151 dòng đó có đúng MỘT dòng thiếu dấu nháy đóng, và riêng một dòng ấy đủ làm nhiễu bộ dò dialect của DuckDB cho cả file. Đó là lý do thông báo lỗi nói chuyện dò cách parse trong khi căn bệnh thật sự lại là các dòng bị cắt cụt.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'You can say in one sentence why the error mentioned sniffing when the root cause was truncated lines',
          'Bạn nói được trong một câu vì sao thông báo lỗi nhắc tới chuyện dò file trong khi nguyên nhân gốc là các dòng bị cắt cụt',
        ),
        bi(
          'Your DISTINCT line count equals the manifest\'s corrupt_rows',
          'Số dòng khác nhau bị loại bằng đúng trường corrupt_rows của manifest',
        ),
        bi(
          'Journal shows rule zero and layers 1–3 crossed off in order, each with one line of evidence',
          'Journal cho thấy quy tắc số không và các tầng 1 tới 3 đã được gạch theo thứ tự, mỗi tầng kèm một dòng bằng chứng',
        ),
      ],
    },

    /* ═══════════════ T5 ═══════════════ */
    {
      id: 'a11-t5',
      num: 5,
      title: bi('Fix, quarantine, resume', 'Sửa, cách ly, chạy tiếp'),
      goal: bi(
        'Read tolerantly, save the evidence, verify you got everything the manifest promised.',
        'Đọc rộng lượng hơn, giữ lại bằng chứng, và kiểm rằng bạn đã lấy đủ những gì manifest hứa.',
      ),
      steps: [
        {
          title: bi('Graft the fix into load_day', 'Ghép phần sửa vào load_day'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `def load_day(con, d, scale="small", run_id=None):
    f = raw_orders_dir(scale) / f"orders_{d}.csv"
    rid = ("CAST(NULL AS BIGINT)"                     # gọi ad-hoc thì để NULL — nhưng
           if run_id is None else int(run_id))        #  có kiểu, để _run_id luôn là
                                                      #  BIGINT (§7.2)
    con.execute(f"""
        CREATE OR REPLACE TABLE staging.shopcore_orders_day_raw AS
        SELECT *,
               DATE '{d}' AS _data_date,        -- lineage §7.2, đóng dấu lúc nạp:
               {rid}      AS _run_id            --  đúng hai cột, không hơn
        FROM read_csv('{f.as_posix()}', header=true,
                      columns={era_columns(d)},      -- schema theo era của A10
                      store_rejects=true)
    """)`,
            },
            {
              kind: 'text',
              body: bi(
                'era_columns(d) is not something A10 shipped — it is a one-liner you write from what A10 did ship: pick V1_COLS, V2_COLS or V3_COLS by era_of(d).',
                'Hàm era_columns(d) không phải thứ A10 giao sẵn cho bạn, mà là một dòng bạn tự viết ra từ những gì A10 đã giao: chọn V1_COLS, V2_COLS hay V3_COLS dựa theo era_of(d).',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'The staging table name follows the shared-namespace rule: staging.shopcore_orders_day_raw says WHOSE feed this is. A warehouse full of bare day_raw tables becomes unreadable the day a second source lands.',
                'Tên bảng staging tuân theo quy tắc không gian tên dùng chung: cái tên staging.shopcore_orders_day_raw nói rõ đây là feed CỦA AI. Một warehouse đầy những bảng tên trơ trọi kiểu day_raw sẽ không còn đọc nổi vào ngày có nguồn thứ hai đổ về.',
              ),
            },
          ],
        },
        {
          title: bi('Route bad lines to quarantine, with reasons', 'Đẩy các dòng hỏng sang quarantine, kèm lý do'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `    n_rejects = con.execute("SELECT count(*) FROM reject_errors").fetchone()[0]
    if n_rejects:
        out = quarantine_dir(scale) / "orders_badlines" / f"file_date={d}"
        out.mkdir(parents=True, exist_ok=True)
        con.execute(f"""
            COPY (SELECT DATE '{d}' AS _data_date, {rid} AS _run_id,
                         now() AS _rejected_at,
                         line, column_name,
                         error_type, error_message,
                         csv_line
                  FROM reject_errors)
            TO '{(out / 'rejects.parquet').as_posix()}' (FORMAT parquet)
        """)
        con.execute("DELETE FROM reject_errors")   # nó tích luỹ theo connection —
                                                   # không xoá thì ngày N+1 chép lại
                                                   # phần bị loại của ngày N`,
            },
            {
              kind: 'trap',
              body: bi(
                'Bad lines go to quarantine — never to /dev/null, and never fixed by hand-editing the raw CSV. Raw files are immutable evidence, and the generator would just recreate them anyway.',
                'Các dòng hỏng phải đi vào quarantine, tuyệt đối không vứt đi và cũng không sửa bằng cách chỉnh tay file CSV gốc. File thô là bằng chứng bất biến, mà generator thì dù sao cũng sẽ tạo lại chúng thôi.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'The quarantine parquet does not store the file name, and does not need to. _run_id ties every rejected line to the ops.etl_runs attempt that met it, so "which file was this, read when, by which run, and how did that run end" is one join away. If _run_id is NULL the join returns nothing — correct and informative: no recorded run owns those rows, so rerun the day through the runner.',
                'File parquet quarantine không lưu tên file, và cũng không cần lưu. Cột _run_id nối mỗi dòng bị loại với lần thử trong ops.etl_runs đã gặp nó, nên câu hỏi đây là file nào, đọc lúc nào, do lần chạy nào, và lần chạy đó kết thúc ra sao chỉ cách một phép join. Nếu _run_id là NULL thì phép join không trả về gì, mà như vậy vừa đúng vừa có thông tin: không có lần chạy nào được ghi nhận sở hữu mấy dòng đó, nên hãy chạy lại ngày ấy qua runner.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT r.source_file, r.started_at, r.status, r.rows,
       count(DISTINCT q.line) AS bad_lines
FROM read_parquet('<DATA_ROOT>/small/quarantine/orders_badlines/*/*.parquet') q
JOIN ops.etl_runs r ON r.run_id = q._run_id
GROUP BY 1, 2, 3, 4;
-- orders_2026-07-22.csv | <thời điểm chạy lại> | success | 58400 | 151`,
            },
          ],
        },
        {
          title: bi('The reconciliation guard', 'Chốt đối soát'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `    mf = manifest_dir(scale) / f"orders_{d}.json"
    expected = con.execute(
        f"SELECT rows FROM read_json_auto('{mf.as_posix()}')").fetchone()[0]
    loaded = con.execute(
        "SELECT count(*) FROM staging.shopcore_orders_day_raw").fetchone()[0]
    if loaded != expected:
        raise RuntimeError(f"{d}: loaded {loaded:,} rows, manifest says {expected:,}")`,
            },
            {
              kind: 'why',
              body: bi(
                'Reading tolerantly is exactly the change that could hide a short load: store_rejects means a file can lose thousands of lines and still report success. The guard turns a silent short-load into a loud failure. Tolerant reading without a count check is worse than strict reading.',
                'Chính việc đọc rộng lượng hơn mới là thay đổi có thể che giấu một lần nạp thiếu, vì có store_rejects thì một file mất cả nghìn dòng vẫn báo thành công như thường. Cái chốt này biến một lần nạp thiếu im lặng thành một lần hỏng ồn ào. Đọc rộng lượng mà không kiểm số dòng thì còn tệ hơn đọc nghiêm ngặt.',
              ),
            },
          ],
        },
        {
          title: bi('One scope decision that protects your lake', 'Một quyết định về phạm vi, để bảo vệ lake'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'load_day targets the warehouse core ONLY — leave your A10 lake COPY … APPEND out of it. APPEND is not idempotent, so a 69-day replay through it would silently double the 68 days A10 already wrote, and nothing before A15\'s exact source count would catch it.',
                'Hàm load_day CHỈ nhắm vào phần core trong warehouse, nên đừng đưa lệnh COPY … APPEND ghi lake của A10 vào bên trong nó. Phép APPEND không idempotent, nên chạy lại 69 ngày xuyên qua nó sẽ lặng lẽ nhân đôi 68 ngày mà A10 đã ghi, và không phép kiểm nào trước A15 bắt được chuyện đó.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Your canonical lake is missing exactly one day — 2026-07-22, the day A10 deferred to you. Repair it once, by hand: after the resume below turns the day green, COPY its canonical staging output into your versioned lake dir with the same one-day APPEND your A10 loop used.',
                'Cái lake canonical của bạn hiện chỉ thiếu đúng một ngày, là 2026-07-22, ngày mà A10 đã hoãn lại và để dành cho bạn. Hãy vá nó một lần bằng tay: sau khi lệnh chạy tiếp bên dưới làm ngày đó xanh lên, hãy COPY phần output canonical của nó vào thư mục lake có đánh version, dùng đúng lệnh APPEND cho một ngày mà vòng lặp ở A10 đã dùng.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'At small scale that appends 58,387 rows — the file\'s 58,400 minus the 13 unparseable timestamps your cleaner drops — and closes the 69-day lake for good.',
                'Ở scale small thì lệnh đó thêm vào 58.387 dòng, tức là 58.400 dòng của file trừ đi 13 dòng có timestamp không parse được mà cleaner đã loại, và như vậy là khép lại cái lake 69 ngày.',
              ),
            },
          ],
        },
        {
          title: bi('Resume — only the red day', 'Chạy tiếp — chỉ riêng ngày đang đỏ'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `python -m work.runner --scale small --start 2026-06-01 --end 2026-08-08 --only-failed`,
            },
            {
              kind: 'expect',
              body: bi(
                'Exactly 1 of 69 dates selected, and it goes green loading 58,400 rows at small scale. The quarantine parquet exists and is queryable.',
                'Phải có đúng 1 trên 69 ngày được chọn, và nó xanh lên với 58.400 dòng ở scale small. File parquet quarantine thì tồn tại và query được.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Exactly 1 of 69 dates selected on resume; it goes green loading 58,400 rows',
          'Khi chạy tiếp thì đúng 1 trên 69 ngày được chọn, và nó xanh lên với 58.400 dòng',
        ),
        bi(
          'Quarantine parquet exists and is queryable, and joins to ops.etl_runs on _run_id',
          'File parquet quarantine tồn tại, query được, và join được với ops.etl_runs qua cột _run_id',
        ),
        bi(
          '07-22\'s canonical rows appended to the lake exactly once',
          'Các dòng canonical của ngày 07-22 được append vào lake đúng một lần',
        ),
      ],
    },

    /* ═══════════════ T6 ═══════════════ */
    {
      id: 'a11-t6',
      num: 6,
      title: bi('The real thing: full scale', 'Chạy thật: scale full'),
      goal: bi(
        'Measure how slow sequential really is. That number is today\'s deliverable.',
        'Đo xem chạy tuần tự thật ra chậm tới mức nào. Con số đó chính là sản phẩm của hôm nay.',
      ),
      steps: [
        {
          title: bi('Dry run first, always', 'Chạy thử trước, lúc nào cũng vậy'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `python -m work.runner --scale full --start 2026-06-01 --end 2026-08-08 --dry-run
python -m work.runner --scale full --start 2026-06-01 --end 2026-08-08`,
            },
            {
              kind: 'text',
              body: bi(
                'Then go make coffee. Sequential is slow, and measuring how slow is the point — A12\'s job is to beat this by 3× or more.',
                'Rồi đi pha cà phê. Chạy tuần tự thì chậm, mà đo được nó chậm bao nhiêu mới là điểm chính, vì việc của A12 là đánh bại con số này ít nhất ba lần.',
              ),
            },
          ],
        },
        {
          title: bi('What to watch and write down', 'Nhìn gì và ghi lại gì'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Journal all of it: per-day seconds from the runner output; the two spike days, 2026-06-19 and 2026-07-11, taking roughly 3× a normal day; 2026-07-22 quarantining roughly 3,000 bad lines this time — the exact number is that manifest\'s corrupt_rows; Task Manager showing the busy-burst-then-dip pattern; and any spill files appearing in <DATA_ROOT>/tmp.',
                'Hãy ghi hết vào journal: số giây của từng ngày lấy từ output của runner; hai ngày tăng vọt là 2026-06-19 và 2026-07-11, mỗi ngày mất chừng gấp ba lần một ngày thường; ngày 2026-07-22 lần này cách ly chừng 3.000 dòng hỏng, mà con số chính xác chính là trường corrupt_rows của manifest đó; Task Manager cho thấy kiểu bận rộn từng đợt rồi tụt xuống; và cả những file tràn xuất hiện trong thư mục <DATA_ROOT>/tmp.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'On the baseline machine expect very roughly 30 to 90 minutes total, depending on how heavy your pipeline is. The end summary says 69 success.',
                'Trên máy chuẩn thì tổng thời gian rất áng chừng vào khoảng 30 tới 90 phút, tuỳ pipeline của bạn nặng tới đâu. Bảng tổng kết cuối cùng phải báo 69 success.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'The full-scale lake is missing 2026-07-22 exactly like the small one was. Once that day is green, repeat the one-day COPY … APPEND of its canonical output into your full-scale versioned dir — once.',
                'Cái lake ở scale full cũng thiếu ngày 2026-07-22 y như bản small lúc nãy. Khi ngày đó đã xanh lên thì hãy lặp lại lệnh COPY … APPEND cho một ngày, đưa phần output canonical của nó vào thư mục có đánh version ở scale full, và chỉ làm đúng một lần.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'End summary says 69 success; both lakes now hold all 69 days',
          'Bảng tổng kết báo 69 success, và cả hai lake giờ đã có đủ 69 ngày',
        ),
        bi(
          'Total wall clock recorded in journal.md as the official A12 baseline',
          'Tổng thời gian chạy đã ghi vào journal.md làm mốc chuẩn chính thức cho A12',
        ),
      ],
    },

    /* ═══════════════ T7 ═══════════════ */
    {
      id: 'a11-t7',
      num: 7,
      title: bi('Ops wiring: the freshness gate and the run ledger', 'Nối phần vận hành: freshness gate và run ledger'),
      goal: bi(
        'Turn today\'s one-off heroics into a system that watches itself.',
        'Biến màn xoay xở một lần của hôm nay thành một hệ thống tự canh chính nó.',
      ),
      steps: [
        {
          title: bi('(a) The freshness gate', '(a) Freshness gate'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'The contract\'s freshness_sla is precise: the file for business date D is complete by 02:00 UTC on D+1, the warehouse load must be able to start by 04:00 UTC, and a file missing at 04:00 UTC is a producer incident.',
                'Điều khoản freshness_sla trong contract nói rất rõ ràng: file của ngày nghiệp vụ D phải hoàn tất trước 02:00 UTC của ngày D cộng 1, việc nạp vào warehouse phải bắt đầu được trước 04:00 UTC, và một file còn thiếu vào lúc 04:00 UTC là sự cố phía nhà cung cấp.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Here is the catch: your runner only notices a missing file if someone happens to run it. A delivery that never arrives triggers no error anywhere, because the job that would have failed never starts. An SLA needs a watchdog that runs on the clock, not on demand.',
                'Nhưng có một chỗ mắc: runner của bạn chỉ nhận ra một file thiếu khi có ai đó tình cờ chạy nó. Một lần giao không bao giờ tới thì chẳng kích hoạt lỗi ở đâu cả, bởi cái job lẽ ra phải hỏng thì lại không hề khởi động. Một cam kết SLA vì vậy cần một cái canh cửa chạy theo giờ, chứ không phải chạy khi được gọi.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Create work/freshness_gate.py as a NEW file, not an edit to your A05 work/freshness_check.py. The A05 probe watches the warehouse from the inside — what is the newest _data_date I hold. This gate watches the producer\'s drop folder from the outside. Different sensors, same ops.alerts sink.',
                'Hãy tạo file work/freshness_gate.py như một file MỚI chứ đừng sửa vào file work/freshness_check.py của A05. Phép dò ở A05 nhìn warehouse từ bên trong, kiểu như _data_date mới nhất mình đang giữ là ngày nào. Còn cái gate này nhìn thư mục nhận file của bên cung cấp từ bên ngoài. Hai cảm biến khác nhau, nhưng cùng đổ về một chỗ là bảng ops.alerts.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `FEED_START = dt.date(2026, 6, 1)          # effective_from của contract
SLA_HOUR_UTC = 4                          # mốc 04:00 UTC trong freshness_sla


def due_through(as_of: dt.datetime) -> dt.date:
    """Ngày nghiệp vụ mới nhất mà file của nó phải đã tồn tại tại thời điểm as_of."""
    lag = 1 if as_of.hour >= SLA_HOUR_UTC else 2   # file của D đến hạn vào D+1
    return as_of.date() - dt.timedelta(days=lag)`,
            },
            {
              kind: 'code',
              lang: 'powershell',
              body: `python -m work.freshness_gate --scale small --as-of 2026-08-09T04:30    # mọi file đến hạn đều có
python -m work.freshness_gate --scale small --as-of 2026-08-10T04:30    # 08-09 đến hạn — và vắng mặt
echo $LASTEXITCODE                                                      # 1`,
            },
            {
              kind: 'expect',
              body: bi(
                'The first prints that every file through 2026-08-08 was delivered. The second prints the ALERT line, writes one ops.alerts row with severity error and source freshness, and exits non-zero — console plus exit code simulate paging.',
                'Lệnh thứ nhất in ra rằng mọi file tính tới ngày 2026-08-08 đều đã được giao. Lệnh thứ hai in ra dòng ALERT, ghi một dòng vào bảng ops.alerts với severity là error và source là freshness, rồi thoát với mã khác 0. Phần in ra màn hình cộng với mã thoát chính là cách mô phỏng việc gọi người trực.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'The feed\'s last delivery is 2026-08-08, so pretending the clock rolled one day further IS the simulated missing day. No files are harmed, and the demo stays deterministic — a production gate would drop the --as-of flag and read the real clock.',
                'Lần giao cuối cùng của feed là ngày 2026-08-08, nên việc giả vờ đồng hồ nhích thêm một ngày CHÍNH LÀ cái ngày thiếu được mô phỏng. Không file nào bị đụng tới, và màn demo vẫn giữ được tính cố định. Một cái gate chạy thật thì sẽ bỏ cờ --as-of đi và đọc đồng hồ thật.',
              ),
            },
          ],
        },
        {
          title: bi('(b) The run ledger is your evidence', '(b) Run ledger chính là bằng chứng của bạn'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'A07 promised that ops.etl_runs history is never deleted. Here is the payoff: the postmortem in Task 9 needs detection times, resolution times and blast radius, and the ledger has all three on record.',
                'A07 đã hứa rằng phần lịch sử trong bảng ops.etl_runs không bao giờ bị xoá. Và đây là lúc lời hứa đó sinh lời: bản ghi chép sự cố ở Task 9 cần thời điểm phát hiện, thời điểm xử lý xong và phạm vi ảnh hưởng, mà ledger thì có sẵn cả ba.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `-- 1. Số lần thử theo ngày — dấu vân tay của sự cố
SELECT run_date, count(*) AS attempts,
       count(*) FILTER (WHERE status = 'failed') AS failed
FROM ops.etl_runs
WHERE step = 'day'
GROUP BY 1 HAVING count(*) > 1 ORDER BY 1;
-- 2026-07-22 | 2 | 1          (và không ngày nào khác)

-- 2. Dòng thời gian sự cố — từ phát hiện tới xử lý xong, có mốc giờ
SELECT started_at, finished_at, status, rows, source_file, left(error, 60) AS error
FROM ops.etl_runs
WHERE step = 'day' AND run_date = DATE '2026-07-22'
ORDER BY started_at;

-- 3. Số dòng qua các lần chạy — kiểm phạm vi ảnh hưởng (small; full thì bar max 4000000)
SELECT run_date, rows, bar(rows, 0, 200000, 40) AS profile
FROM (SELECT run_date, rows,
             row_number() OVER (PARTITION BY run_date
                                ORDER BY started_at DESC) AS rn
      FROM ops.etl_runs
      WHERE step = 'day' AND status = 'success')
WHERE rn = 1 ORDER BY run_date;`,
            },
            {
              kind: 'why',
              body: bi(
                'Read the third one like an incident responder: a weekday plateau around 60k, weekend dips, the two 3× spike bars on 06-19 and 07-11, and nothing else unusual. That is containment evidence — the incident touched exactly one day. Attempts prove when you knew, the timeline proves how long the fix took, the profile proves how far it spread.',
                'Hãy đọc câu thứ ba như một người đang xử lý sự cố: mặt bằng ngày thường quanh 60 nghìn dòng, ngày cuối tuần tụt xuống, hai cột tăng vọt gấp ba vào ngày 06-19 và 07-11, và ngoài ra không có gì bất thường. Đó là bằng chứng cho thấy sự cố đã được khoanh vùng, nó chỉ chạm vào đúng một ngày. Số lần thử chứng minh bạn biết từ lúc nào, dòng thời gian chứng minh việc sửa mất bao lâu, còn biểu đồ chứng minh nó lan tới đâu.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'On Windows, if you save these outputs by redirecting Python output to a file, set PYTHONIOENCODING=utf-8 first. The bar() function draws Unicode block characters that do not fit cp1252, and the redirect dies with UnicodeEncodeError.',
                'Trên Windows, nếu bạn lưu mấy kết quả này bằng cách chuyển hướng output của Python vào file thì nhớ đặt PYTHONIOENCODING=utf-8 trước. Hàm bar() vẽ bằng ký tự khối Unicode vốn không nằm trong bảng mã cp1252, nên lệnh chuyển hướng sẽ chết với lỗi UnicodeEncodeError.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Gate green for 2026-08-09T04:30 and red for 2026-08-10T04:30, with exactly one new freshness row in ops.alerts and a non-zero exit',
          'Gate xanh với mốc 2026-08-09T04:30 và đỏ với mốc 2026-08-10T04:30, kèm đúng một dòng freshness mới trong ops.alerts và mã thoát khác 0',
        ),
        bi(
          'The three ledger queries match the annotated shapes, and their outputs are saved for Task 9',
          'Ba câu query trên ledger cho ra đúng hình dạng đã chú thích, và kết quả được lưu lại để dùng cho Task 9',
        ),
      ],
    },

    /* ═══════════════ T8 ═══════════════ */
    {
      id: 'a11-t8',
      num: 8,
      title: bi('Cost math and backfill etiquette', 'Tính chi phí và phép lịch sự khi backfill'),
      goal: bi(
        'Answer "how long will this take" before launching, and "who needs to know" before the numbers move.',
        'Trả lời câu cái này chạy bao lâu trước khi bấm nút, và câu ai cần được báo trước khi các con số thay đổi.',
      ),
      steps: [
        {
          title: bi('Throughput, from your own ledger', 'Tốc độ, lấy từ chính ledger của bạn'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT sum(rows) AS rows_done,
       sum(epoch(finished_at - started_at)) AS seconds,
       round(sum(rows) / sum(epoch(finished_at - started_at))) AS rows_per_sec
FROM ops.etl_runs WHERE step = 'day' AND status = 'success';`,
            },
            {
              kind: 'why',
              body: bi(
                'rows per second times rows remaining equals time remaining. That one line of arithmetic is how professionals answer "how long will the backfill take" before launching it — and, in the cloud, "what will it cost".',
                'Lấy số dòng mỗi giây nhân với số dòng còn lại thì ra thời gian còn lại. Đúng một dòng số học đó là cách người làm nghề trả lời câu hỏi backfill này chạy bao lâu trước khi bấm nút, và nếu chạy trên cloud thì còn là câu nó tốn bao nhiêu tiền.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Check it: does small-scale rows per second times your full-scale manifest total predict your actual Task 6 wall clock? Usually the right ballpark but not exact. Write down why — bigger files stream differently, the spike days skew the average, and per-day overhead is fixed.',
                'Hãy kiểm lại: lấy số dòng mỗi giây đo ở scale small nhân với tổng số dòng theo manifest bản full thì có dự đoán đúng thời gian chạy thật ở Task 6 không? Thường là đúng tầm nhưng không khớp hẳn. Hãy ghi lại lý do: file lớn hơn thì đọc theo kiểu khác, mấy ngày tăng vọt kéo lệch trung bình, còn phần chi phí cố định của mỗi ngày thì không đổi.',
              ),
            },
          ],
        },
        {
          title: bi('Three prompts, a paragraph each', 'Ba câu hỏi, mỗi câu một đoạn'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Chunking: why might you run a 69-day backfill as 10 weekly chunks instead of one shot? Think about the blast radius of a failure, disk and tmp pressure, and having a chance to eyeball early results before burning hours.',
                'Về chuyện chia khúc: vì sao có khi nên chạy một lần backfill 69 ngày thành 10 khúc theo tuần thay vì làm một lượt? Hãy nghĩ tới phạm vi ảnh hưởng khi có sự cố, tới áp lực lên đĩa và thư mục tạm, và tới việc bạn có cơ hội ngó qua kết quả của những khúc đầu trước khi đốt hết mấy tiếng đồng hồ.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Derived marts: your A04 marts are built FROM core. After restating core for 69 days, what else must rerun, and in what order?',
                'Về các mart dẫn xuất: mấy cái mart ở A04 được dựng TỪ core. Vậy sau khi dựng lại core cho 69 ngày thì còn thứ gì phải chạy lại nữa, và theo thứ tự nào?',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Restatement comms: if June\'s revenue dashboard changes after this rebuild, what do consumers need to hear from you, and when — before or after the numbers move?',
                'Về chuyện thông báo restatement: nếu dashboard doanh thu tháng 6 đổi số sau lần dựng lại này thì người dùng cần nghe gì từ bạn, và nghe vào lúc nào, trước hay sau khi các con số thay đổi?',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Notice the contract gives you no script for the third one: v1.3.0 has no restatement clause, and its own freshness_sla text admits it. That silence is a gap, and your postmortem\'s follow-ups will flag it.',
                'Để ý là contract không đưa cho bạn kịch bản nào cho câu thứ ba: bản 1.3.0 không có điều khoản nào về restatement, và chính phần freshness_sla của nó cũng thừa nhận điều đó. Chỗ im lặng ấy là một lỗ hổng, và phần việc phải làm tiếp trong bản ghi chép sự cố của bạn sẽ nêu nó ra.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'rows/sec computed from your own ledger, and the prediction compared with the Task 6 wall clock',
          'Đã tính số dòng mỗi giây từ chính ledger của mình, và đã đem dự đoán so với thời gian chạy thật ở Task 6',
        ),
        bi(
          'Three etiquette prompts answered in the journal, a short paragraph each',
          'Ba câu hỏi về phép lịch sự đã được trả lời trong journal, mỗi câu một đoạn ngắn',
        ),
      ],
    },

    /* ═══════════════ T9 ═══════════════ */
    {
      id: 'a11-t9',
      num: 9,
      title: bi('The postmortem', 'Bản ghi chép sự cố'),
      goal: bi(
        'A short blameless write-up whose job is to make the next incident shorter.',
        'Một bản ghi ngắn, không quy tội ai, mà mục đích là làm cho sự cố lần sau ngắn hơn.',
      ),
      steps: [
        {
          title: bi('Write work/incidents/2026-07-22_corrupt_export.md', 'Viết file work/incidents/2026-07-22_corrupt_export.md'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Sections: impact — what was wrong, for how long, which tables and dates. Timeline — detected, diagnosed, fixed, backfilled; paste Task 7\'s ledger timeline, timestamps and file name from ops.etl_runs, not from memory. Root cause — the real cause, not the first error message you saw. Detection gap. Producer note. Resolution. Action items with owners.',
                'Các mục cần có: ảnh hưởng, tức là cái gì sai, sai trong bao lâu, chạm vào bảng nào và ngày nào. Dòng thời gian, gồm lúc phát hiện, lúc chẩn đoán, lúc sửa, lúc nạp bù; hãy dán dòng thời gian lấy từ ledger ở Task 7, còn các mốc giờ và tên file thì lấy từ bảng ops.etl_runs chứ đừng lấy từ trí nhớ. Nguyên nhân gốc, tức nguyên nhân thật chứ không phải thông báo lỗi đầu tiên bạn nhìn thấy. Khoảng trống phát hiện. Ghi chú gửi bên cung cấp. Cách xử lý. Và các việc phải làm kèm người chịu trách nhiệm.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'This one has a second audience. The contract\'s quality.structural clause tolerates zero malformed lines, so a file with unparseable lines is a producer incident — the write-up includes a note addressed to shopcore\'s Checkout Platform team, escalation contact in the contract header, with your reject counts attached: 151 lines at small scale, that manifest\'s corrupt_rows at full. Their incident to fix; yours to contain.',
                'Bản này còn có một nhóm người đọc thứ hai. Điều khoản quality.structural trong contract không dung thứ một dòng hỏng nào, nên một file có dòng không parse được là sự cố phía nhà cung cấp. Vì vậy bản ghi phải có một mục gửi đội Checkout Platform của shopcore, với đầu mối leo thang nằm ở phần đầu contract, và đính kèm số dòng bị loại của bạn: 151 dòng ở scale small, còn ở full thì lấy trường corrupt_rows của manifest tương ứng. Sửa là việc của họ, còn khoanh vùng là việc của bạn.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'The root-cause section must explain truncated lines plus one unclosed quote — not "sniffing failed". Writing down the first error message as the root cause is how the same incident takes just as long next time.',
                'Mục nguyên nhân gốc phải giải thích rằng có các dòng bị cắt cụt cộng thêm một dòng thiếu dấu nháy đóng, chứ không phải viết là việc dò file thất bại. Chép thông báo lỗi đầu tiên vào chỗ nguyên nhân gốc chính là cách để lần sau đúng sự cố đó lại mất ngần ấy thời gian.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Action items need two in particular: a prevention item that would have caught this before the backfill ran — an alert when a manifest\'s corrupt_rows is above zero — and the contract follow-up. If shopcore re-exports a fixed file tomorrow, no clause says how that restatement must be announced. Propose the amendment through the A06 change_management flow.',
                'Phần việc phải làm cần có hai mục cụ thể. Một là mục phòng ngừa, tức thứ lẽ ra đã bắt được chuyện này trước khi backfill chạy: một cảnh báo khi trường corrupt_rows của manifest lớn hơn 0. Hai là mục theo dõi về contract: nếu ngày mai shopcore xuất lại một file đã sửa thì hiện không có điều khoản nào nói lần restatement đó phải được thông báo ra sao. Hãy đề xuất bản sửa đổi qua quy trình change_management của A06.',
              ),
            },
          ],
        },
        {
          title: bi('Stretch goals', 'Phần mở rộng'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Chunked mode: add --chunk-days 7, run week-sized chunks with a per-chunk summary, and abort the whole backfill if any chunk exceeds a failure threshold. Live ETA: after each day, print projected time remaining from the running rows per second and the manifests\' remaining row counts, then compare the day-5 prediction with reality.',
                'Chế độ chia khúc: thêm cờ --chunk-days 7, chạy từng khúc dài một tuần với một bảng tổng kết cho mỗi khúc, và huỷ cả lần backfill nếu có khúc nào vượt ngưỡng số ngày hỏng. Ước tính thời gian còn lại theo thời gian thực: sau mỗi ngày, in ra thời gian còn lại tính từ tốc độ đang chạy và số dòng còn lại theo manifest, rồi đem dự đoán ở ngày thứ 5 so với thực tế.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Restatement drill: write the actual email announcing the June restatement to your imaginary analytics consumers. What changes, when, why, what they should do. Ten lines, no jargon — you are drafting the process the missing restatement clause should have pinned down.',
                'Diễn tập restatement: hãy viết hẳn cái email thông báo lần dựng lại tháng 6 cho nhóm người dùng phân tích tưởng tượng của bạn. Nội dung gồm cái gì đổi, đổi vào lúc nào, vì sao, và họ nên làm gì. Mười dòng thôi và đừng dùng thuật ngữ, vì bạn đang phác ra chính cái quy trình mà điều khoản restatement còn thiếu lẽ ra phải quy định.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Put the watchdog on the clock: hand the freshness gate to the OS scheduler with schtasks on Windows or crontab elsewhere, let it fire once for real, and check that ops.alerts gains a row whose alert_ts is the moment the scheduler ran your script. Then clean the task up. Two details bite: the scheduler starts tasks in System32, so cd to the repo first, and ETL_LAB_DATA must be set at the user level because a scheduled task never reads your open terminal.',
                'Đưa cái canh cửa vào lịch chạy: giao freshness gate cho bộ lập lịch của hệ điều hành, bằng schtasks trên Windows hoặc crontab ở nơi khác, để nó bắn thật một lần, rồi kiểm xem bảng ops.alerts có thêm một dòng với alert_ts đúng vào lúc bộ lập lịch chạy script hay không. Xong thì xoá cái task đó đi. Có hai chi tiết hay cắn: bộ lập lịch khởi động task trong thư mục System32 nên phải cd về repo trước, và biến ETL_LAB_DATA phải được đặt ở mức người dùng, vì một task chạy theo lịch không bao giờ đọc được cái terminal bạn đang mở.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Close with two sentences in your journal on watchdogs running on the clock versus on demand. A gate you run by hand only ever confirms what you already suspected; the same gate on a schedule finds problems nobody was looking for.',
                'Hãy kết lại bằng hai câu trong journal về chuyện canh cửa chạy theo giờ so với chạy khi được gọi. Một cái gate bạn chạy bằng tay thì chỉ xác nhận lại thứ bạn vốn đã nghi; cũng cái gate đó đặt vào lịch chạy thì lại tìm ra những vấn đề không ai đang đi tìm.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Root cause explains truncated lines plus one unclosed quote; the timeline is pasted from the ledger',
          'Mục nguyên nhân gốc giải thích được các dòng bị cắt cụt cộng một dòng thiếu dấu nháy đóng, và dòng thời gian được dán từ ledger',
        ),
        bi(
          'Producer note cites the structural clause with your reject counts',
          'Mục gửi bên cung cấp có trích dẫn điều khoản về cấu trúc kèm số dòng bị loại của bạn',
        ),
        bi(
          'Action items include both a prevention item and the restatement-clause amendment',
          'Phần việc phải làm có cả một mục phòng ngừa lẫn mục đề xuất bổ sung điều khoản restatement',
        ),
      ],
    },
  ],
}