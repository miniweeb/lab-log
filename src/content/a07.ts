import type { AssignmentSpec } from '../types'
import { bi, vi } from '../types'
import { a07Terms, a07Theory } from './a07.theory'

export const a07: AssignmentSpec = {
  id: 'a07',
  code: 'A07',
  title: bi('Failures, retries & idempotency', 'Lỗi, retry và tính idempotent'),
  summary: bi(
    'Make one day\'s load safe to re-run any number of times — then crash it on purpose and prove the data never moved.',
    'Làm cho việc load một ngày chạy lại bao nhiêu lần cũng an toàn — rồi cố ý làm nó crash và chứng minh dữ liệu không hề đổi.',
  ),
  estHours: 6,
  difficulty: 3,
  outcome: bi(
    'You can build a load that survives being killed mid-transaction, retries only what is worth retrying, and leaves an audit chain from any row back to the run and log file that produced it.',
    'Bạn dựng được một job load sống sót khi bị giết giữa transaction, chỉ retry những lỗi đáng retry, và để lại chuỗi audit từ bất kỳ dòng nào ngược về lần chạy và file log đã tạo ra nó.',
  ),
  theory: a07Theory,
  terms: a07Terms,
  tasks: [
    {
      id: 'a07-t0',
      title: bi('Setup', 'Chuẩn bị'),
      goal: bi(
        'A branch, the right core.orders shape, and a savepoint mindset.',
        'Một branch, bảng core.orders đúng hình dạng, và tâm thế có savepoint.',
      ),
      steps: [
        {
          title: bi('Branch and scale', 'Branch và scale'),
          blocks: [
            { kind: 'code', lang: 'powershell', body: 'git switch -c a07-idempotency' },
            {
              kind: 'text',
              body: bi(
                'Scale: small for Tasks 1–8, full only in Task 9. Have open: your editor, one PowerShell terminal, and (for Task 9) Task Manager. The script sets the usual knobs itself: memory_limit=8GB, threads=8, temp_directory=<DATA_ROOT>/tmp.',
                'Scale: dùng small cho Task 1 tới 8, chỉ Task 9 mới dùng full. Mở sẵn: editor, một terminal PowerShell, và Task Manager cho Task 9. Script tự đặt các thiết lập quen thuộc: memory_limit=8GB, threads=8, temp_directory=<DATA_ROOT>/tmp.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Today the git ritual earns its keep: Task 5 turns those per-task commits into crash insurance, because Tasks 6 and 7 have you deliberately wrecking a working pipeline.',
                'Hôm nay quy trình git mới thật sự có giá trị: Task 5 biến các commit sau mỗi task thành bảo hiểm, vì Task 6 và 7 bắt bạn cố ý phá hỏng một pipeline đang chạy tốt.',
              ),
            },
          ],
        },
        {
          title: bi('Heads-up on core.orders', 'Lưu ý về bảng core.orders'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'Task 3 wants a core.orders carrying the two lineage columns — _data_date and _run_id, and no more. If your existing core.orders has a different shape (A05 left it doubled, remember), DROP TABLE core.orders first. It is derived data — rebuildable from raw/, and after today you own the tool that rebuilds it safely.',
                'Task 3 cần bảng core.orders mang đúng hai cột lineage — _data_date và _run_id, không hơn. Nếu bảng core.orders hiện tại của bạn có hình dạng khác (A05 để nó bị nhân đôi, nhớ không), hãy DROP TABLE core.orders trước. Đó là dữ liệu dẫn xuất — dựng lại được từ raw/, và sau hôm nay bạn sở hữu chính công cụ dựng lại nó một cách an toàn.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'That mindset — raw + code = truth — is half of this assignment.',
                'Chính tâm thế đó — raw cộng code bằng sự thật — là một nửa của bài này.',
              ),
            },
          ],
        },
      ],
      accept: [bi('On branch a07-idempotency', 'Đang ở branch a07-idempotency')],
    },

    {
      id: 'a07-t1',
      num: 1,
      title: bi('Break it on purpose: the double-run bug', 'Cố ý làm hỏng: bug chạy hai lần'),
      goal: bi('Meet the bug before fixing it.', 'Gặp mặt bug trước khi sửa nó.'),
      steps: [
        {
          title: bi('Load naively, then "accidentally" load again', 'Load theo cách ngây thơ, rồi "lỡ tay" load lại'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `import duckdb
con = duckdb.connect()   # in-memory scratch; we are breaking things on purpose
RAW = "<DATA_ROOT>/small/raw/orders/orders_2026-06-03.csv"
con.execute(f"CREATE TABLE naive_orders AS SELECT * FROM read_csv('{RAW}')")
print(con.execute("SELECT count(*) FROM naive_orders").fetchone())   # first run
con.execute(f"INSERT INTO naive_orders SELECT * FROM read_csv('{RAW}')")
print(con.execute("SELECT count(*) FROM naive_orders").fetchone())   # "oops"`,
            },
            {
              kind: 'expect',
              body: bi(
                '62,707 rows become 125,414. Nothing errored. No warning. The worst pipeline failures are silent.',
                '62.707 dòng thành 125.414. Không lỗi nào. Không cảnh báo nào. Những lần hỏng tệ nhất của pipeline đều diễn ra trong im lặng.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: "SELECT order_id, count(*) FROM naive_orders GROUP BY 1 HAVING count(*) > 2 LIMIT 5;",
            },
            {
              kind: 'text',
              body: bi(
                'A handful of ids appear FOUR times: they were already duplicated inside the file (the in-file dups you met in A03), now doubled again. A08 deals with those.',
                'Một vài id xuất hiện BỐN lần: chúng vốn đã trùng ngay trong file (các bản trùng trong file mà bạn gặp ở A03), giờ bị nhân đôi thêm lần nữa. A08 sẽ xử lý chúng.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'You can explain, in one journal sentence, why plain INSERT can never be safe to re-run',
          'Bạn giải thích được trong một câu vào journal vì sao lệnh INSERT thường không bao giờ an toàn khi chạy lại',
        ),
      ],
    },

    {
      id: 'a07-t2',
      num: 2,
      title: bi('Build the run ledger: ops.etl_runs', 'Dựng run ledger: ops.etl_runs'),
      goal: bi('Give the pipeline a memory of what it has done.', 'Cho pipeline một trí nhớ về những gì nó đã làm.'),
      steps: [
        {
          title: bi('Nine columns', 'Chín cột'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `CREATE SCHEMA IF NOT EXISTS ops;
CREATE SEQUENCE IF NOT EXISTS ops.run_id_seq;
CREATE TABLE IF NOT EXISTS ops.etl_runs (
    run_id      BIGINT PRIMARY KEY,   -- nextval('ops.run_id_seq')
    run_date    DATE,                 -- the data date being loaded
    step        VARCHAR,              -- 'load_day' today; more steps later
    status      VARCHAR,              -- 'running' | 'success' | 'failed'
    started_at  TIMESTAMP,
    finished_at TIMESTAMP,            -- when the load landed
    rows        BIGINT,               -- rows published (success only)
    source_file VARCHAR,              -- which file this attempt read
    error       VARCHAR               -- error message (failed only)
);`,
            },
            {
              kind: 'text',
              body: bi(
                'Every ATTEMPT gets its own row — failures are history worth keeping, not shame to overwrite.',
                'Mỗi LẦN THỬ một dòng riêng — những lần thất bại là lịch sử đáng giữ, không phải điều đáng che giấu.',
              ),
            },
          ],
        },
        {
          title: bi('Two columns a junior would have put elsewhere', 'Hai cột mà người mới sẽ đặt nhầm chỗ'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'source_file and finished_at are exactly the "where did this come from / when did it land" facts that tempt people into stamping _source_file and _loaded_at onto every data row. A03 said no, and this table is why: the file that produced a delivery and the moment it landed are properties of the RUN. Store them once here, and 62,707 rows point at them with a single _run_id — instead of carrying 62,707 identical copies of a string that, if you re-load the day from a corrected file, would all have to be rewritten. One ledger row changes instead.',
                'Hai cột source_file và finished_at chính là những sự thật kiểu "dòng này từ đâu ra / nó về lúc nào" khiến người ta muốn đóng dấu _source_file và _loaded_at lên từng dòng dữ liệu. A03 đã nói không, và bảng này là lý do: file tạo ra một lần giao và thời điểm nó về là thuộc tính của LẦN CHẠY. Lưu chúng một lần ở đây, và 62.707 dòng trỏ tới bằng một cột _run_id duy nhất — thay vì mang 62.707 bản sao giống hệt của một chuỗi mà nếu nạp lại ngày đó từ file đã sửa thì phải ghi lại toàn bộ. Thay vào đó chỉ một dòng ledger thay đổi.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'The table exists and you can say what each column is for without looking — including which two facts live here INSTEAD OF on the data rows, and why',
          'Bảng tồn tại và bạn nói được từng cột dùng làm gì mà không cần nhìn lại — kể cả hai sự thật nào sống ở đây THAY VÌ ở trên dòng dữ liệu, và vì sao',
        ),
      ],
    },

    {
      id: 'a07-t3',
      num: 3,
      title: bi('Refactor: stage → validate → atomic publish', 'Tái cấu trúc: stage → validate → publish nguyên tử'),
      goal: bi('The real loader. Three details to catch.', 'Bộ loader thật. Ba chi tiết cần bắt được.'),
      steps: [
        {
          title: bi('Three things to notice in the shape', 'Ba điều cần để ý trong bộ khung'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'The success UPDATE on ops.etl_runs sits INSIDE BEGIN…COMMIT, so the ledger can never claim success for data that is not there. DELETE WHERE _data_date = ? runs even on the very first load (deletes 0 rows, costs nothing) — first run and re-run are the SAME CODE PATH; fewer paths, fewer bugs. And every attempt allocates its own run_id, then narrates itself to logs/run_<run_id>.log — console for you, the file for the audit trail.',
                'Lệnh UPDATE ghi thành công vào ops.etl_runs nằm BÊN TRONG BEGIN…COMMIT, nên ledger không bao giờ có thể khai thành công cho dữ liệu không tồn tại. Lệnh DELETE WHERE _data_date = ? chạy ngay cả ở lần load đầu tiên (xoá 0 dòng, không tốn gì) — lần chạy đầu và lần chạy lại đi CÙNG MỘT NHÁNH CODE; ít nhánh thì ít bug. Và mỗi lần thử tự cấp một run_id riêng, rồi tự thuật lại vào file logs/run_<run_id>.log — console cho bạn xem, file để làm dấu vết audit.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'One detail to catch in passing: the INSERT that opens the ledger row records source_file right away, BEFORE anything can go wrong. A failed attempt should still be able to tell you which file it choked on.',
                'Một chi tiết cần bắt được khi lướt qua: lệnh INSERT mở dòng ledger ghi source_file ngay lập tức, TRƯỚC KHI có gì đó hỏng. Một lần thử thất bại vẫn phải nói được cho bạn biết nó nghẹn ở file nào.',
              ),
            },
          ],
        },
        {
          title: bi('The publish block', 'Khối publish'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `        # step 4: publish - data AND ledger in one atomic transaction.
        con.execute("BEGIN TRANSACTION")
        con.execute("DELETE FROM core.orders WHERE _data_date = ?", [day])
        con.execute("""
            INSERT INTO core.orders
            SELECT *, CAST(COALESCE(order_ts, updated_at) AS DATE) AS order_date,
                   ? AS _data_date, ? AS _run_id
            FROM stg_day""", [day, run_id])
        con.execute("""
            UPDATE ops.etl_runs SET status = 'success', finished_at = now(),
                   rows = ? WHERE run_id = ?""", [staged, run_id])
        con.execute("COMMIT")`,
            },
            {
              kind: 'text',
              body: bi(
                'About COALESCE(order_ts, updated_at): ~0.02% of rows had impossible timestamps that became NULL in cleaning (13 rows in small 2026-06-03); we still need a non-NULL order_date, and updated_at is the honest fallback. A05 quarantines them properly.',
                'Về COALESCE(order_ts, updated_at): khoảng 0,02% số dòng có timestamp bất khả thi và đã thành NULL khi cleaning (13 dòng ở small ngày 2026-06-03); ta vẫn cần một order_date khác NULL, và updated_at là phương án dự phòng trung thực. A05 mới là nơi quarantine chúng cho đúng.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Two gaps are yours to fill: already_succeeded() must query ops.etl_runs and return True if at least one row exists for this run_date with step = load_day AND status = success. And one line in ensure_tables is deliberately in the wrong place — CREATE SCHEMA must come BEFORE the table that needs it.',
                'Hai chỗ trống bạn phải tự điền: hàm already_succeeded() phải truy vấn ops.etl_runs và trả về True nếu có ít nhất một dòng cho run_date này với step = load_day VÀ status = success. Và có một dòng trong ensure_tables cố ý đặt sai chỗ — lệnh CREATE SCHEMA phải nằm TRƯỚC bảng cần tới nó.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'The timestamp and money expressions in step 2 are the work/cleaners.py fragments from A03, inlined only to keep the listing self-contained. In your own script, import them instead of re-pasting: tests/test_cleaners.py pins their behavior, and a fragment fixed in one place is fixed everywhere it is imported.',
                'Các biểu thức xử lý timestamp và tiền ở bước 2 chính là những đoạn trong work/cleaners.py từ A03, viết thẳng ra đây chỉ để phần code đứng độc lập đọc được. Trong script của bạn, hãy import chúng thay vì dán lại: file tests/test_cleaners.py đã ghim hành vi của chúng, và một đoạn được sửa ở một chỗ là được sửa ở mọi nơi import nó.',
              ),
            },
          ],
        },
        {
          title: bi('Run it twice, compare checksums', 'Chạy hai lần, so checksum'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `python work\\a07_load_day.py --scale small --date 2026-06-03
python work\\a07_load_day.py --scale small --date 2026-06-03 --force`,
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT count(*) AS n,
       bit_xor(hash(order_id, updated_at, status, order_total)) AS checksum
FROM core.orders WHERE _data_date = DATE '2026-06-03';`,
            },
            {
              kind: 'expect',
              body: bi(
                'Both runs log 62707 rows published, count + checksum identical after the second run, and logs/ holds one file per run.',
                'Cả hai lần chạy đều báo 62707 rows published, số dòng và checksum giống hệt sau lần chạy thứ hai, và thư mục logs/ có một file cho mỗi lần chạy.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'The checksum hashes only business columns ON PURPOSE: _run_id SHOULD differ between the two runs — and so should the finished_at on the ledger row it points at. That is lineage recording history, not data changing. Write the checksum in your journal; you will compare against it all day. (hash() values are only comparable within your own DuckDB install — do not compare with a classmate.)',
                'Checksum CỐ Ý chỉ hash các cột nghiệp vụ: cột _run_id ĐÁNG LẼ phải khác nhau giữa hai lần chạy — và finished_at trên dòng ledger mà nó trỏ tới cũng vậy. Đó là lineage đang ghi lại lịch sử, không phải dữ liệu thay đổi. Ghi checksum vào journal; cả ngày hôm nay bạn sẽ so với nó. (Giá trị hash() chỉ so sánh được trong cùng một bản cài DuckDB của bạn — đừng so với người khác.)',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Both runs publish 62,707 rows; count + checksum identical', 'Cả hai lần chạy publish 62.707 dòng; số dòng và checksum giống hệt'),
        bi('logs/ holds one file per run', 'Thư mục logs/ có một file cho mỗi lần chạy'),
        bi('Both TODO gaps filled', 'Đã điền cả hai chỗ trống TODO'),
      ],
    },

    {
      id: 'a07-t4',
      num: 4,
      title: bi('Preflight: check the environment before you touch data', 'Preflight: kiểm tra môi trường trước khi chạm vào dữ liệu'),
      goal: bi('Seven checks, fix hints, non-zero exit.', 'Bảy phép kiểm tra, gợi ý sửa, mã thoát khác 0.'),
      steps: [
        {
          title: bi('What actually breaks pipelines at 2 a.m.', 'Thứ gì thật sự làm hỏng pipeline lúc 2 giờ sáng'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'Rarely the SQL. The disk is full. The file never arrived. Another process is holding the database. A config quietly aims temp space at the OS drive. Every one of those is checkable in under a second, BEFORE any data moves. From today, every runner in this lab calls preflight first — A11\'s backfill runner will import it before every single day it loads.',
                'Hiếm khi là SQL. Ổ đĩa đầy. File chưa bao giờ về. Một process khác đang giữ database. Một dòng cấu hình lặng lẽ trỏ thư mục tạm về ổ hệ thống. Mỗi thứ đó đều kiểm tra được trong chưa tới một giây, TRƯỚC KHI dữ liệu di chuyển. Từ hôm nay, mọi runner trong lab này đều gọi preflight trước — bộ backfill runner của A11 sẽ import nó trước từng ngày mà nó load.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `1. data root writable          — thư mục có thể tồn tại mà vẫn từ chối ghi
2. free space on data volume   — chỗ trống trên ổ C không giúp được gì
3. temp dir on data volume     — spill phải nằm cạnh dữ liệu
4. source CSV + manifest       — (bạn tự viết) ba cách một delivery hỏng
5. warehouse writable, not locked — mở connection CHÍNH LÀ phép dò khoá
6. schemas creatable           — CREATE SCHEMA IF NOT EXISTS = dò quyền miễn phí
7. contract parseable          — YAML hỏng phải fail ở đây, không phải giữa pipeline`,
            },
            {
              kind: 'trap',
              body: bi(
                'Check 4 is your gap: three ways a delivery is broken — the CSV is missing, the CSV is 0 bytes, the manifest JSON is missing. Append exactly ONE results row; ok only if none of the three hold. On FAIL the detail must NAME THE EXACT PATH that is wrong, and the hint must say what to do (typo in --date? generator never run? a 0-byte file is an incident to escalate to shopcore).',
                'Check số 4 là phần của bạn: ba cách một delivery bị hỏng — file CSV không có, file CSV 0 byte, file manifest JSON không có. Thêm đúng MỘT dòng kết quả; chỉ ok khi không rơi vào cả ba. Khi FAIL thì phần chi tiết phải NÊU ĐÍCH DANH ĐƯỜNG DẪN sai, và gợi ý phải nói rõ làm gì (gõ nhầm --date? chưa chạy generator? file 0 byte là sự cố phải báo lên shopcore).',
              ),
            },
          ],
        },
        {
          title: bi('Wire it into the loader', 'Nối nó vào loader'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `REPO_ROOT = Path(__file__).resolve().parents[1]   # already there
sys.path.insert(0, str(REPO_ROOT))                # repo root, so work.* imports resolve
from work import preflight

# ...và trong main(), ngay sau day = date.fromisoformat(args.date):
    if not preflight.run_checks(args.scale, day):
        sys.exit(2)     # red preflight = hands off the data`,
            },
          ],
        },
        {
          title: bi('The red/green demo', 'Diễn tập đỏ/xanh'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `python work\\preflight.py --scale small --date 2026-06-03; $LASTEXITCODE
# 7 dòng PASS, rồi mã thoát 0

python work\\preflight.py --scale small --date 2026-06-03 --tmp C:\\Windows\\Temp; $LASTEXITCODE
# [FAIL] 3. temp dir on data volume   C:\\Windows\\Temp is not on the data volume (F:)
#          fix: spill belongs next to the data: SET temp_directory='<DATA_ROOT>/tmp'
# ...sáu PASS xung quanh, và mã thoát 1`,
            },
            {
              kind: 'why',
              body: bi(
                'The exit code is the part schedulers obey; a red report that still exits 0 is a smoke alarm with no battery. Try --date 2026-05-01 too: your check 4 must go red and name the missing path. To see check 5 fire, open the warehouse from a second window and run preflight within 30 seconds — check 5 FAILs with the classic "being used by another process", and check 6 honestly reports "skipped: no connection".',
                'Mã thoát mới là thứ scheduler tuân theo; một báo cáo đỏ mà vẫn thoát với mã 0 là chuông báo cháy không lắp pin. Thử luôn --date 2026-05-01: check 4 của bạn phải chuyển đỏ và nêu tên đường dẫn bị thiếu. Để thấy check 5 kích hoạt, mở warehouse từ một cửa sổ thứ hai rồi chạy preflight trong vòng 30 giây — check 5 sẽ FAIL với thông báo kinh điển "being used by another process", còn check 6 báo trung thực "skipped: no connection".',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Green run prints seven PASS lines and exit code 0', 'Lần chạy xanh in bảy dòng PASS và mã thoát 0'),
        bi('The --tmp C:\\Windows\\Temp run FAILs check 3 with a fix hint and exits 1', 'Lần chạy với --tmp C:\\Windows\\Temp làm check 3 FAIL kèm gợi ý sửa và thoát với mã 1'),
        bi('A bogus --date FAILs your check 4, naming the missing path', 'Một --date không tồn tại làm check 4 của bạn FAIL và nêu đúng đường dẫn thiếu'),
        bi('A normal loader run now starts with the seven preflight lines', 'Một lần chạy loader bình thường giờ bắt đầu bằng bảy dòng preflight'),
      ],
    },

    {
      id: 'a07-t5',
      num: 5,
      title: bi('Savepoint before the storm: the git rescue kit', 'Savepoint trước bão: bộ đồ cứu hộ git'),
      goal: bi('Make the next two tasks reversible.', 'Làm cho hai task tiếp theo có thể hoàn tác được.'),
      steps: [
        {
          title: bi('Commit, then stage the disaster', 'Commit, rồi dàn dựng thảm hoạ'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `git add work\\a07_load_day.py work\\preflight.py
git commit -m "A07 task 5: pre-chaos savepoint"
git log --oneline     # ghi lại sha ngắn của savepoint

# Bây giờ phá FILE (không phải dữ liệu):
Set-Content work\\a07_load_day.py "# TODO rewrite everything"   # lần sửa lúc 11 giờ đêm
git status --short        #  M work/a07_load_day.py
git diff --stat           # ~167 dòng bị xoá — thiệt hại được định lượng trước khi hoảng`,
            },
            {
              kind: 'why',
              body: bi(
                'Tasks 6 and 7 have you deliberately wrecking a working pipeline, with edits made quickly and under pressure — exactly the setting where a botched edit eats a file you spent two hours getting right.',
                'Task 6 và 7 bắt bạn cố ý phá hỏng một pipeline đang chạy tốt, với những lần sửa code vội vàng và căng thẳng — đúng hoàn cảnh mà một lần sửa hỏng tay có thể nuốt mất file bạn mất hai giờ mới viết đúng.',
              ),
            },
          ],
        },
        {
          title: bi('Three rescues', 'Ba cách cứu'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `# 1. Mess CHƯA commit — vứt bỏ thay đổi, lấy lại bản đã commit
git restore work\\a07_load_day.py
git status --short        # sạch — loader trở lại nguyên vẹn từng byte

# 2. Mess ĐÃ commit — lấy lại một file từ một commit cũ
git checkout <sha> -- work\\a07_load_day.py

# 3. Vứt bỏ mọi thứ từ savepoint tới giờ
git reset --hard <sha>
git reflog                # ngay cả commit đã reset đi vẫn còn đây`,
            },
            {
              kind: 'code',
              lang: 'powershell',
              body: 'python work\\a07_load_day.py --scale small --date 2026-06-03   # already loaded - skipping',
            },
            {
              kind: 'text',
              body: bi(
                'Close the drill by proving nothing of value burned.',
                'Kết thúc buổi diễn tập bằng cách chứng minh không có gì giá trị bị cháy.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('The savepoint commit exists', 'Commit savepoint tồn tại'),
        bi('You mangled and recovered the loader once via git restore and once via git reset --hard', 'Bạn đã phá và cứu lại loader một lần bằng git restore và một lần bằng git reset --hard'),
        bi('git reflog shows the whole journey; the loader still skips-on-rerun', 'Lệnh git reflog cho thấy toàn bộ hành trình; loader vẫn bỏ qua khi chạy lại'),
      ],
    },

    {
      id: 'a07-t6',
      num: 6,
      title: bi('Release the chaos monkey', 'Thả chaos monkey'),
      goal: bi('A pipeline that has never crashed mid-flight is untested.', 'Một pipeline chưa từng crash giữa chừng là pipeline chưa được kiểm thử.'),
      steps: [
        {
          title: bi('Four failure points', 'Bốn điểm gây lỗi'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `import random

class TransientError(RuntimeError):
    """A failure worth retrying: network blip, locked file, chaos monkey."""

def maybe_fail(point: str, chaos: float) -> None:
    if random.random() < chaos:
        raise TransientError(f"chaos monkey struck at: {point}")

# call sites trong load_day (signature thành load_day(con, scale, day, chaos=0.0)):
maybe_fail("after_read_manifest", chaos)   # sau bước 1
maybe_fail("after_stage", chaos)           # sau bước 2
maybe_fail("mid_transaction", chaos)       # giữa DELETE và INSERT  <- điểm đáng sợ
maybe_fail("before_commit", chaos)         # sau INSERT, trước COMMIT`,
            },
            {
              kind: 'why',
              body: bi(
                'mid_transaction is the money shot: the old day is deleted, the new one not yet written — without a transaction this crash LOSES A DAY OF DATA.',
                'Điểm mid_transaction là cú quyết định: ngày cũ đã bị xoá, ngày mới chưa được ghi — không có transaction thì lần crash này LÀM MẤT MỘT NGÀY DỮ LIỆU.',
              ),
            },
          ],
        },
        {
          title: bi('Crash it a lot', 'Làm nó crash thật nhiều'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: 'python work\\a07_load_day.py --scale small --date 2026-06-03 --force --chaos 0.6',
            },
            {
              kind: 'trap',
              body: bi(
                'Run it 8–10 times to start — but fair warning: reaching a later point means surviving every earlier roll first, so the points get exponentially rarer. At chaos 0.6, before_commit fires on only ~4% of runs; seeing it can easily take 20–30 runs. That is chance, not a bug in your maybe_fail wiring.',
                'Chạy 8 tới 10 lần để bắt đầu — nhưng lưu ý: để tới được một điểm ở sau thì phải sống sót qua mọi lần tung xúc xắc trước đó, nên các điểm sau càng lúc càng hiếm theo hàm mũ. Với chaos 0.6, điểm before_commit chỉ kích hoạt ở khoảng 4% số lần chạy; để thấy nó có thể mất 20 tới 30 lần. Đó là xác suất, không phải lỗi trong cách bạn gắn maybe_fail.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'After EVERY crash, run the Task 3 checksum query: count still 62,707, checksum unchanged — even when it died between DELETE and INSERT, because ROLLBACK undid the delete.',
                'Sau MỖI lần crash, chạy lại câu checksum của Task 3: số dòng vẫn 62.707, checksum không đổi — kể cả khi nó chết giữa DELETE và INSERT, vì ROLLBACK đã hoàn tác lệnh xoá.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: 'SELECT run_id, status, rows, error FROM ops.etl_runs ORDER BY run_id DESC LIMIT 5;',
            },
          ],
        },
      ],
      accept: [
        bi('You have seen it die at all four points (keep rerunning until you have)', 'Bạn đã thấy nó chết ở cả bốn điểm (cứ chạy lại tới khi thấy đủ)'),
        bi('The checksum never moved', 'Checksum không hề thay đổi'),
      ],
    },

    {
      id: 'a07-t7',
      num: 7,
      title: bi('Retry with exponential backoff', 'Retry với exponential backoff'),
      goal: bi('Crashing cleanly is good; recovering without a human is better.', 'Crash sạch sẽ là tốt; tự phục hồi không cần người còn tốt hơn.'),
      steps: [
        {
          title: bi('The wrapper', 'Hàm bọc'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `def with_retry(fn, max_attempts: int = 8, base_delay: float = 1.0,
               max_delay: float = 30.0):
    """Call fn(); on TransientError wait, then try again. Backoff doubles."""
    for attempt in range(1, max_attempts + 1):
        try:
            return fn()
        except TransientError as exc:
            if attempt == max_attempts:
                log.error("attempt %d/%d failed - giving up", attempt, max_attempts)
                raise
            delay = min(base_delay * 2 ** (attempt - 1), max_delay)
            log.warning("attempt %d/%d failed (%s) - retrying in %.1fs",
                        attempt, max_attempts, exc, delay)
            time.sleep(delay)`,
            },
            {
              kind: 'why',
              body: bi(
                'It catches TransientError ONLY: a ValueError from validation means the DATA is wrong — retrying cannot fix that and must fail immediately. Journal one sentence on this distinction; it is the most-ignored rule in retry design.',
                'Nó CHỈ bắt TransientError: một ValueError từ khâu validation nghĩa là DỮ LIỆU sai — retry không sửa được và phải fail ngay. Ghi một câu vào journal về sự phân biệt này; đó là quy tắc bị bỏ qua nhiều nhất trong thiết kế retry.',
              ),
            },
          ],
        },
        {
          title: bi('A load that gives up must be heard', 'Một lần load bỏ cuộc phải được nghe thấy'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'On final failure — a TransientError that exhausted its attempts OR a ValueError that failed fast — write one error row to ops.alerts, the table your A05 suite created. Retry policy and alert policy are different decisions.',
                'Khi thất bại lần cuối — dù là TransientError đã dùng hết số lần thử HAY một ValueError fail ngay — hãy ghi một dòng error vào ops.alerts, chính bảng mà bộ check của A05 đã tạo. Chính sách retry và chính sách cảnh báo là hai quyết định khác nhau.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `    try:
        with_retry(lambda: load_day(con, args.scale, day, chaos=args.chaos),
                   max_attempts=args.max_attempts)
    except Exception as exc:
        write_alert(con, day, exc)
        raise`,
            },
          ],
        },
      ],
      accept: [
        bi(
          'A chaos run shows attempt 1/8 failed ... retrying in 1.0s, 2.0s, 4.0s — doubling delays',
          'Một lần chạy chaos hiện attempt 1/8 failed ... retrying in 1.0s, rồi 2.0s, rồi 4.0s — thời gian chờ nhân đôi',
        ),
        bi(
          'A forced give-up (--chaos 1 --max-attempts 3) leaves exactly one new ops.alerts row, severity error, whose run_id is the last failed attempt',
          'Một lần bỏ cuộc cưỡng bức (--chaos 1 --max-attempts 3) để lại đúng một dòng mới trong ops.alerts, severity là error, với run_id là lần thử thất bại cuối cùng',
        ),
      ],
    },

    {
      id: 'a07-t8',
      num: 8,
      title: bi('The proof', 'Phần chứng minh'),
      goal: bi('Prove the property this assignment is named after.', 'Chứng minh chính tính chất mà bài này được đặt tên theo.'),
      steps: [
        {
          title: bi('Four checksums', 'Bốn checksum'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                '1. Clean reference: --force run with no chaos. Record count + checksum.\n2. Chaos gauntlet: --force --chaos 0.3 --max-attempts 10. Let it run to success. Checksum: identical to step 1.\n3. Repeat step 2 twice more. Still identical. A run that crashed 5 times on the way is indistinguishable from a run that succeeded first try.\n4. Skip check: run WITHOUT --force. It must log "already loaded - skipping" and exit in about a second.',
                '1. Mốc tham chiếu sạch: chạy --force không chaos. Ghi lại số dòng và checksum.\n2. Vòng chaos: --force --chaos 0.3 --max-attempts 10. Để nó chạy tới khi thành công. Checksum: giống hệt bước 1.\n3. Lặp lại bước 2 thêm hai lần. Vẫn giống hệt. Một lần chạy crash 5 lần trên đường đi không phân biệt được với một lần chạy thành công ngay từ đầu.\n4. Kiểm tra skip: chạy KHÔNG kèm --force. Nó phải báo "already loaded - skipping" và thoát trong khoảng một giây.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Small chance — about 1 in 15 — that all 10 attempts fail. Just run it again, and notice that even total failure left the table consistent — and paged you via ops.alerts. That is the property working.',
                'Có xác suất nhỏ — khoảng 1 trên 15 — rằng cả 10 lần thử đều fail. Cứ chạy lại, và để ý rằng ngay cả khi thất bại hoàn toàn thì bảng vẫn nhất quán — và đã báo động cho bạn qua ops.alerts. Đó chính là tính chất đang hoạt động.',
              ),
            },
          ],
        },
        {
          title: bi('Traceability — the payoff', 'Truy vết — phần thu hoạch'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'First look at what a core.orders row actually carries. DESCRIBE core.orders: ten source columns, a derived order_date, and then just _data_date and _run_id. Two. That is less than your instinct wanted — A03 talked you out of _source_file and _loaded_at and promised you would not miss them. Collect on the promise.',
                'Trước hết hãy xem một dòng core.orders thật sự mang những gì. Chạy DESCRIBE core.orders: mười cột từ nguồn, một cột order_date suy ra, rồi chỉ có _data_date và _run_id. Hai cột. Ít hơn bản năng của bạn muốn — A03 đã thuyết phục bạn bỏ _source_file và _loaded_at, và hứa rằng bạn sẽ không thấy thiếu chúng. Giờ là lúc đòi lời hứa đó.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT o.order_id, o._data_date, o._run_id,
       r.source_file, r.finished_at, r.status, r.rows
FROM core.orders o
JOIN ops.etl_runs r ON r.run_id = o._run_id
WHERE o._data_date = DATE '2026-06-03'
LIMIT 1;   -- bất kỳ dòng nào cũng cho cùng câu trả lời, và đó chính là điểm mấu chốt`,
            },
            {
              kind: 'why',
              body: bi(
                'Say the win out loud, because it is the whole argument: a fact about the RUN is stored ONCE, on the run, and 62,707 rows point at it with an 8-byte id — instead of 62,707 identical copies of a file name and a timestamp sitting in a fact table. That is plain normalization, the same rule that keeps a customer\'s address out of every order row. It also pays maintenance: re-load this day from a corrected file and the ledger records the new fact in ONE row; the copy-it-everywhere design would have to rewrite the same string 62,707 times — 1.2M times at full scale.',
                'Hãy nói to điều được lợi, vì nó là toàn bộ lập luận: một sự thật về LẦN CHẠY được lưu MỘT LẦN, ở lần chạy đó, và 62.707 dòng trỏ tới bằng một id 8 byte — thay vì 62.707 bản sao giống hệt của một tên file và một dấu thời gian nằm trong fact table. Đó là normalization thông thường, cùng quy tắc giữ cho địa chỉ khách hàng không bị chép vào từng dòng đơn hàng. Nó cũng lợi về bảo trì: nạp lại ngày này từ file đã sửa thì ledger ghi sự thật mới vào MỘT dòng; còn thiết kế chép-khắp-nơi sẽ phải ghi lại cùng chuỗi đó 62.707 lần — và 1,2 triệu lần ở scale full.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Every one of the 62,707 rows names the SAME run — the last successful attempt. Some failed attempts got as far as INSERT, but ROLLBACK erased their rows; only the ledger and their log files remember them. Now open logs/run_<that id>.log: the row\'s biography in one file. Row → run → log is the audit chain, and you just walked it.',
                'Cả 62.707 dòng đều ghi tên CÙNG MỘT lần chạy — lần thử thành công cuối cùng. Một vài lần thử thất bại đã đi được tới bước INSERT, nhưng ROLLBACK đã xoá sạch dòng của chúng; chỉ có ledger và các file log còn nhớ. Giờ mở file logs/run_<id đó>.log: tiểu sử của dòng dữ liệu gói trong một file. Dòng → lần chạy → log là chuỗi audit, và bạn vừa đi hết nó.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Four identical checksums in your journal', 'Bốn checksum giống hệt nhau trong journal'),
        bi(
          'A ledger showing a pile of failed rows and your success rows — the honest history of a resilient pipeline',
          'Ledger cho thấy một đống dòng failed cùng các dòng success — lịch sử trung thực của một pipeline chịu lỗi tốt',
        ),
        bi('The traceability chain walked once: row → ledger → a real log file', 'Đã đi hết chuỗi truy vết một lần: dòng dữ liệu → ledger → một file log thật'),
      ],
    },

    {
      id: 'a07-t9',
      num: 9,
      title: bi('Full scale', 'Scale full'),
      goal: bi('Same code, real weight.', 'Cùng code, khối lượng thật.'),
      steps: [
        {
          title: bi('Three days, no chaos', 'Ba ngày, không chaos'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `foreach ($d in "2026-06-01","2026-06-02","2026-06-03") {
  python work\\a07_load_day.py --scale full --date $d
}`,
            },
            {
              kind: 'why',
              body: bi(
                'Watch Task Manager while it runs: Python + DuckDB should stay around 1–2 GB — DuckDB streams the CSV; nothing like the pandas cliff from A01. Each day takes roughly 10–60 seconds on the baseline machine (finished_at - started_at in ops.etl_runs gives each day\'s exact duration).',
                'Theo dõi Task Manager trong lúc chạy: Python cộng DuckDB nên ở khoảng 1 tới 2 GB — DuckDB đọc CSV theo dòng chảy; không giống vách đá pandas ở A01. Mỗi ngày mất khoảng 10 tới 60 giây trên máy chuẩn (lấy finished_at trừ started_at trong ops.etl_runs sẽ ra thời lượng chính xác của từng ngày).',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Then: --force re-run 2026-06-01 (same duration, same checksum — replacing 1.2M rows is cheap for DuckDB); re-run without --force (skips instantly); and reconcile each day\'s rows in ops.etl_runs against the manifest. They must match exactly.',
                'Sau đó: chạy lại 2026-06-01 với --force (cùng thời lượng, cùng checksum — thay thế 1,2 triệu dòng là chuyện rẻ với DuckDB); chạy lại không kèm --force (bỏ qua tức thì); và đối chiếu cột rows của từng ngày trong ops.etl_runs với manifest. Chúng phải khớp chính xác.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Three full days green in the ledger', 'Ba ngày full đều xanh trong ledger'),
        bi('Counts equal to manifests', 'Số dòng bằng đúng manifest'),
        bi('One forced re-run proven identical', 'Một lần chạy lại cưỡng bức được chứng minh giống hệt'),
      ],
    },

    {
      id: 'a07-verify',
      title: bi('Verify yourself', 'Tự kiểm chứng'),
      goal: bi('Seven queries that prove the property.', 'Bảy truy vấn chứng minh tính chất đó.'),
      steps: [
        {
          title: bi('The queries', 'Các truy vấn'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `-- n = 62,707 chính xác; checksum không bao giờ đổi qua re-run hay chaos run
SELECT count(*) AS n,
       bit_xor(hash(order_id, updated_at, status, order_total)) AS checksum
FROM core.orders WHERE _data_date = DATE '2026-06-03';

-- vài dòng 'failed' (mỗi error nêu tên một điểm chaos), cộng các dòng success;
-- không dòng nào kẹt ở 'running' sau khi các lần chạy đã kết thúc
SELECT status, count(*) FROM ops.etl_runs GROUP BY 1;

-- ĐÚNG MỘT run sở hữu cả ngày -> kỳ vọng 1
SELECT count(DISTINCT _run_id) FROM core.orders
WHERE _data_date = DATE '2026-06-03';

-- ngân sách cột lineage: đúng HAI cột do warehouse thêm vào
SELECT column_name, column_type FROM (DESCRIBE core.orders)
WHERE column_name LIKE '\\_%' ESCAPE '\\';

-- ...và mọi thứ chúng thay thế chỉ cách một phép join, cho mọi dòng của ngày
SELECT count(*) AS rows_traced FROM core.orders o
JOIN ops.etl_runs r ON r.run_id = o._run_id
WHERE o._data_date = DATE '2026-06-03'
  AND r.source_file = 'orders_2026-06-03.csv'
  AND r.finished_at IS NOT NULL;      -- kỳ vọng 62.707: không dòng nào mồ côi

-- sau demo bỏ cuộc ở Task 7
SELECT severity, run_id, message FROM ops.alerts ORDER BY alert_ts DESC LIMIT 1;

-- kiểm tra ghi dở: mỗi ngày đã load hoặc là 0 (chưa từng thành công) hoặc là
-- đúng con số manifest — giờ bạn không thể tạo ra trạng thái ở giữa nữa
SELECT _data_date, count(*) FROM core.orders GROUP BY 1 ORDER BY 1;`,
            },
            {
              kind: 'expect',
              body: bi(
                'Task 1\'s naive table: 62,707 → 125,414 after the double run. Full scale: each day\'s count must equal its manifest rows (roughly 1.2M on weekdays).',
                'Bảng naive của Task 1: 62.707 thành 125.414 sau lần chạy đôi. Ở scale full: số dòng của mỗi ngày phải bằng trường rows trong manifest của nó (khoảng 1,2 triệu vào ngày thường).',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('All seven queries give the expected shape', 'Cả bảy truy vấn cho ra kết quả đúng hình dạng kỳ vọng'),
        bi('python -m pytest tests/ -q still green before merging', 'Lệnh python -m pytest tests/ -q vẫn xanh trước khi merge'),
      ],
    },

    {
      id: 'a07-mistakes',
      title: bi('Common beginner mistakes', 'Lỗi thường gặp của người mới'),
      goal: bi('Seven traps; the second is the sneakiest.', 'Bảy cái bẫy; cái thứ hai khó thấy nhất.'),
      steps: [
        {
          title: bi('The seven', 'Bảy lỗi'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'Recording success outside the transaction. Update the ledger inside BEGIN…COMMIT — otherwise a crash between the two makes the ledger lie, and ledger lies become skipped or doubled days later.',
                'Ghi nhận thành công ở ngoài transaction. Hãy cập nhật ledger bên trong BEGIN…COMMIT — nếu không thì một lần crash ở giữa hai thứ đó sẽ khiến ledger nói sai, và ledger nói sai sẽ biến thành ngày bị bỏ qua hoặc bị nhân đôi về sau.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Deleting by order_date instead of _data_date. Remember A02: ~1.5% of a file\'s rows are late rows belonging to EARLIER order dates. Delete by order_date and every re-run duplicates the late rows. The idempotency key is "what did this file write" (_data_date), not "what dates does it mention" (order_date).',
                'Xoá theo order_date thay vì _data_date. Nhớ lại A02: khoảng 1,5% số dòng trong một file là dòng về trễ thuộc về những order date CŨ HƠN. Xoá theo order_date thì mỗi lần chạy lại sẽ nhân đôi những dòng trễ đó. Khoá idempotency là "file này đã ghi những gì" (_data_date), không phải "file này nhắc tới những ngày nào" (order_date).',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Retrying deterministic failures. A validation error retried 8 times is the same error, 8 times slower. Catch TransientError, let ValueError fly.',
                'Retry những lỗi tất định. Một lỗi validation thử lại 8 lần vẫn là cùng lỗi đó, chỉ chậm hơn 8 lần. Bắt TransientError, để ValueError bay ra.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Bolting _source_file / _loaded_at back onto core.orders. It feels convenient — no join needed. It is denormalized log data in a fact table: the same string copied 62,707 times (1.2M at full scale), and a re-load from a corrected file leaves every copy stale.',
                'Gắn lại _source_file và _loaded_at lên bảng core.orders. Nghe có vẻ tiện — khỏi cần join. Nhưng đó là dữ liệu log bị phi chuẩn hoá nhét vào fact table: cùng một chuỗi được chép 62.707 lần (1,2 triệu ở scale full), và một lần nạp lại từ file đã sửa sẽ khiến mọi bản sao đó lỗi thời.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Swallowing exceptions. except Exception: pass turns a failed load into a silently empty day. Record the failure, then re-raise.',
                'Nuốt chửng exception. Câu except Exception: pass biến một lần load thất bại thành một ngày rỗng trong im lặng. Hãy ghi nhận thất bại rồi ném lại lỗi.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Forgetting ROLLBACK in the error path. After a failure inside a transaction, the connection still holds the aborted transaction and the ledger UPDATE fails too. Roll back first (guarded — there may be no transaction open), then record.',
                'Quên ROLLBACK ở nhánh xử lý lỗi. Sau một lần hỏng bên trong transaction, connection vẫn đang giữ transaction đã huỷ và lệnh UPDATE ledger cũng sẽ fail theo. Hãy rollback trước (có bọc phòng hờ — có thể không có transaction nào đang mở), rồi mới ghi nhận.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Testing only the happy re-run. Run-twice proves half the property. Until you have crashed BETWEEN DELETE and INSERT and checked the table, you have not tested idempotency.',
                'Chỉ kiểm thử trường hợp chạy lại êm đẹp. Chạy hai lần chỉ chứng minh được một nửa tính chất. Chừng nào bạn chưa crash GIỮA lệnh DELETE và INSERT rồi kiểm tra lại bảng, bạn chưa kiểm thử tính idempotent.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Đọc qua một lượt trước khi bắt đầu Task 3')],
    },

    {
      id: 'a07-stretch',
      title: bi('Stretch goals', 'Bài mở rộng'),
      goal: bi('Three optional exercises; the second is the real test.', 'Ba bài tự chọn; bài thứ hai mới là phép thử thật.'),
      steps: [
        {
          title: bi('1 — Wire in your gates', '1 — Nối các gate của bạn vào'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'work/preflight.py clears the ENVIRONMENT; your A06 contract gate and A05 validation suite judge the DATA. Chain them after preflight, each recorded as its own step in ops.etl_runs — the shape of a real multi-step pipeline.',
                'File work/preflight.py lo phần MÔI TRƯỜNG; còn contract gate của A06 và bộ validation của A05 đánh giá DỮ LIỆU. Hãy nối chúng sau preflight, mỗi cái ghi thành một step riêng trong ops.etl_runs — đó là hình dạng của một pipeline nhiều bước thật sự.',
              ),
            },
          ],
        },
        {
          title: bi('2 — Kill it for real', '2 — Giết nó thật sự'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Exceptions are polite; processes die rudely. Add time.sleep(10) at the mid_transaction point, run a full-scale day, and Stop-Process the python process from a second terminal during the sleep. Reopen the warehouse: the day is intact — DuckDB\'s atomicity survives process death.',
                'Exception thì lịch sự; còn process thì chết thô bạo. Thêm time.sleep(10) ở điểm mid_transaction, chạy một ngày ở scale full, rồi dùng Stop-Process để giết tiến trình python từ một terminal khác trong lúc nó đang sleep. Mở lại warehouse: ngày đó vẫn nguyên vẹn — tính atomicity của DuckDB sống sót qua cả cái chết của process.',
              ),
            },
          ],
        },
        {
          title: bi('3 — Add jitter', '3 — Thêm jitter'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'If 50 workers all fail at once and retry after exactly 1s, they stampede the struggling system together ("thundering herd"). Add delay *= random.uniform(0.5, 1.5) and note why staggered retries are kinder.',
                'Nếu 50 worker cùng fail một lúc rồi cùng retry sau đúng 1 giây, chúng sẽ cùng ùa vào hệ thống đang vật vã ("thundering herd"). Thêm delay *= random.uniform(0.5, 1.5) và ghi lại vì sao việc retry so le lại nhẹ nhàng hơn cho hệ thống.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Hoàn thành ít nhất một mục và ghi kết luận vào journal')],
    },
  ],
}