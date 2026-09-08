import type { AssignmentSpec } from '../types'
import { bi, vi } from '../types'
import { a09Terms, a09Theory } from './a09.theory'

export const a09: AssignmentSpec = {
  id: 'a09',
  code: 'A09',
  title: bi('Atomic partition swap', 'Swap partition kiểu atomic'),
  summary: bi(
    'Watch a naive rewrite serve wrong answers to a live reader, then publish rewrites so nobody ever sees the in-between state — by rename, by catalog, and by version pointer.',
    'Nhìn một lần ghi lại ngây thơ trả về câu trả lời sai cho một người đọc đang chạy thật, rồi học cách công bố sao cho không ai thấy trạng thái dở dang — bằng rename, bằng catalog, và bằng con trỏ version.',
  ),
  estHours: 3,
  difficulty: 3,
  outcome: bi(
    'You can rewrite a partition in a file lake without ever showing a reader a wrong answer, recover from a crash mid-publish, and explain why Iceberg and Delta Lake exist.',
    'Bạn ghi lại được một partition trong file lake mà không bao giờ đưa cho người đọc một câu trả lời sai, khôi phục được khi crash giữa lúc công bố, và giải thích được vì sao Iceberg và Delta Lake tồn tại.',
  ),
  theory: a09Theory,
  terms: a09Terms,
  tasks: [
    {
      id: 'a09-t0',
      title: bi('Setup', 'Chuẩn bị'),
      goal: bi(
        'Two terminals, one victim partition, and everything else left alone.',
        'Hai terminal, một partition làm vật thí nghiệm, và mọi thứ khác thì để yên.',
      ),
      steps: [
        {
          title: bi('Scope and scale', 'Phạm vi và scale'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Two terminals at the repo root — one plays the reader, one the writer — plus Task Manager for the full-scale runs. Develop everything at small scale (Tasks 1–6), rerun at full in Task 7. Month-1, era v1 only. Scripts live in work/, run from the repo root.',
                'Hai terminal mở ở repo root, một cái đóng vai người đọc, một cái đóng vai người ghi, kèm Task Manager cho các lần chạy ở scale full. Làm hết ở scale small trước (Task 1 tới 6), rồi chạy lại ở full ở Task 7. Chỉ dùng dữ liệu tháng 1, kỷ nguyên v1. Script nằm trong work/, chạy từ repo root.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Victim partition: the spike day order_date=2026-06-19. Big enough to make rewrites slow — which is exactly when torn reads bite. Writers use SET memory_limit=\'8GB\'; SET threads=8; the reader uses 2GB, because counting needs almost nothing and being a polite memory citizen is a habit A12 will reward.',
                'Partition làm vật thí nghiệm là ngày cao điểm order_date=2026-06-19. Nó đủ lớn để việc ghi lại chậm — mà chậm chính là lúc torn read cắn. Bên ghi dùng SET memory_limit=\'8GB\' và SET threads=8; bên đọc dùng 2GB, vì đếm số dòng gần như không tốn gì, và thói quen dùng bộ nhớ có ý tứ sẽ được A12 trả công.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'This assignment touches only that one partition, plus the .staging and .trash dirs, plus temporary orders_v=* folders in Task 9 at small scale. Everything else stays untouched. And one rule throughout: staging and trash must live on the SAME drive as the lake — a cross-drive rename silently becomes copy plus delete.',
                'Bài này chỉ đụng vào đúng một partition đó, cộng thêm hai thư mục .staging và .trash, cộng mấy thư mục tạm orders_v=* ở Task 9 tại scale small. Mọi thứ khác để nguyên. Và một luật xuyên suốt: staging với trash phải nằm CÙNG ổ đĩa với lake — rename qua ổ khác sẽ lặng lẽ biến thành copy rồi delete.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Two terminals open at the repo root; ETL_LAB_DATA points at the same drive as your staging plan', 'Hai terminal đã mở ở repo root; biến ETL_LAB_DATA trỏ vào cùng ổ đĩa với chỗ bạn định đặt staging'),
      ],
    },

    {
      id: 'a09-t1',
      num: 1,
      title: bi('Know your before state', 'Biết rõ trạng thái trước khi động vào'),
      goal: bi('You cannot detect a torn read without a number to compare against.', 'Không có sẵn một con số để đối chiếu thì bạn không phát hiện được torn read.'),
      steps: [
        {
          title: bi('Read the manifest, then look at the folder', 'Đọc manifest, rồi nhìn vào thư mục'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT rows, late_rows, dup_rows
FROM read_json_auto('<DATA_ROOT>/small/raw/manifest/orders_2026-06-19.json');
-- 182151, 2732, 91   (tất định — generator gieo seed theo từng ngày)`,
            },
            {
              kind: 'code',
              lang: 'text',
              body: `Get-ChildItem "$env:ETL_LAB_DATA\\small\\lake\\orders\\order_date=2026-06-19"`,
            },
            {
              kind: 'expect',
              body: bi(
                'Several Parquet files: the big one from loading 06-19 itself, plus small ones appended when days 06-20..06-26 delivered late corrections — the A02 discovery moment. Record the file count and the partition row count in your journal. Expect roughly 180k rows at small scale (A02 measured it exactly: 180,183), fewer than the manifest\'s 182,151 because the file\'s own late rows live in earlier partitions.',
                'Bạn sẽ thấy vài file Parquet: một file lớn từ lúc load chính ngày 06-19, cộng mấy file nhỏ được ghi thêm khi các ngày 06-20 tới 06-26 gửi bản sửa trễ — đúng cái khoảnh khắc bạn phát hiện ra ở A02. Ghi lại số file và số dòng của partition vào journal. Ở scale small kỳ vọng khoảng 180 nghìn dòng (A02 đo chính xác là 180.183), ít hơn con số 182.151 trong manifest vì những dòng trễ của chính file đó nằm ở các partition cũ hơn.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'If the partition is suspiciously tiny instead, your A02 loader COPYed into the live folder with OVERWRITE_OR_IGNORE and ate the appended late-correction files. Note it — Task 3 and the mistakes list will make sense of it.',
                'Còn nếu partition lại nhỏ một cách đáng ngờ thì loader ở A02 của bạn đã COPY thẳng vào thư mục live với tuỳ chọn OVERWRITE_OR_IGNORE và ăn mất mấy file bản sửa trễ ghi thêm. Ghi nhận chuyện đó lại — Task 3 và phần lỗi thường gặp sẽ giải thích.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Manifest numbers match 182,151 / 2,732 / 91', 'Số trong manifest khớp 182.151, 2.732 và 91'),
        bi('Before-count and file count noted in the journal', 'Đã ghi vào journal số dòng và số file trước khi sửa'),
      ],
    },

    {
      id: 'a09-t2',
      num: 2,
      title: bi('Build the reader', 'Dựng người đọc'),
      goal: bi('An innocent analyst who polls one count and only speaks when the answer changes.', 'Một người phân tích vô tội, cứ hỏi đi hỏi lại một con số và chỉ lên tiếng khi câu trả lời đổi.'),
      steps: [
        {
          title: bi('work/a09_common.py — the rebuild query', 'work/a09_common.py — câu query dựng lại'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `def rebuild_sql(scale: str, day: str = DAY) -> str:
    """Dựng lại một partition order_date từ raw.
    Bản sửa trễ của ngày D về trong các file D..D+7 (SPEC 3.4), nên quét đúng
    tám file đó, giữ lại dòng của ngày D, rồi giữ updated_at mới nhất mỗi
    order_id — chính phép dedupe bạn viết ở A08."""
    d0 = date.fromisoformat(day)
    files = [raw_orders_dir(scale) / f"orders_{d0 + timedelta(days=k)}.csv"
             for k in range(8)]
    files = [f.as_posix() for f in files if f.exists()]
    return f"""
    WITH src AS (
      SELECT *, try_strptime(order_ts, [...]) AS order_ts_clean,
             CAST(order_ts_clean AS DATE) AS order_date
      FROM read_csv({files}, header=true, columns={V1_COLUMNS})
      WHERE order_date = DATE '{day}'
    ), ranked AS (
      SELECT *, row_number() OVER (PARTITION BY order_id
                                   ORDER BY updated_at DESC) AS rn
      FROM src
    )
    SELECT * EXCLUDE (order_date, rn) FROM ranked WHERE rn = 1
    """`,
            },
            {
              kind: 'trap',
              body: bi(
                'Two schema rules that pull in opposite directions. EXCLUDE (order_date): the folder name carries the partition value, and files written by PARTITION_BY do not contain that column, so yours must not either. But KEEP order_ts_clean: the A02 loader wrote it into every lake file, and a glob read wants one schema across all files. Drop it here and every multi-partition read — Task 8, A10 — dies with a schema mismatch.',
                'Hai quy tắc về schema kéo về hai phía ngược nhau. Phải EXCLUDE cột order_date: tên thư mục đã mang giá trị partition rồi, và các file do PARTITION_BY ghi ra không chứa cột đó, nên file của bạn cũng không được chứa. Nhưng phải GIỮ cột order_ts_clean: loader của A02 đã ghi nó vào mọi file trong lake, mà đọc bằng glob thì đòi mọi file cùng một schema. Bỏ nó đi là mọi lần đọc nhiều partition — Task 8, rồi A10 — sẽ chết vì schema mismatch.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Why eight files? Because the contract\'s late_corrections clause allows 7 days, and you measured the shape of it in A08. The rebuild window is not a guess; it is the same window that made Strategy C sound.',
                'Vì sao lại tám file? Vì điều khoản late_corrections trong contract cho phép trễ 7 ngày, và bạn đã đo hình dạng của nó ở A08. Cửa sổ dựng lại không phải là đoán mò; nó chính là cái cửa sổ đã làm cho chiến lược C có căn cứ.',
              ),
            },
          ],
        },
        {
          title: bi('work/a09_reader.py — print only on change', 'work/a09_reader.py — chỉ in khi có thay đổi'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `q = (f"SELECT count(*) FROM read_parquet('{glob}', hive_partitioning=true) "
     f"WHERE order_date = DATE '{DAY}'")

def read_with_retry(attempts=15, wait=0.3):
    """Coi 'không có dòng nào' và 'file biến mất' là 'đang có swap, thử lại'.
    Ta BIẾT partition này có dữ liệu, nên 0 chỉ có thể nghĩa là đang swap."""
    ...

while time.time() < t_end:
    ...
    if out != prev:            # chỉ in khi câu trả lời ĐỔI
        print(f"{ts}  {out}", flush=True)
        prev = out
    time.sleep(0.1)`,
            },
            {
              kind: 'text',
              body: bi(
                'Printing only on change is what makes the log readable: after the first line, every line is news. Run it against the untouched lake with `python work/a09_reader.py small 10`.',
                'Chỉ in khi có thay đổi là thứ làm cho log đọc được: sau dòng đầu tiên thì mọi dòng đều là tin mới. Chạy nó trên cái lake chưa ai đụng vào bằng lệnh python work/a09_reader.py small 10.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Exactly one count= line. A stable lake is a quiet reader.',
                'Đúng một dòng count= duy nhất. Một cái lake ổn định thì người đọc im lặng.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Exactly one count= line prints against the untouched lake', 'Chạy trên lake chưa đụng tới thì in ra đúng một dòng count='),
      ],
    },

    {
      id: 'a09-t3',
      num: 3,
      title: bi('Break it: the naive in-place rewrite', 'Làm hỏng nó: ghi đè tại chỗ kiểu ngây thơ'),
      goal: bi('See a wrong answer served to a real reader, with no warning attached.', 'Nhìn tận mắt một câu trả lời sai được đưa cho người đọc thật, mà chẳng có cảnh báo nào kèm theo.'),
      steps: [
        {
          title: bi('work/a09_rewrite_naive.py', 'work/a09_rewrite_naive.py'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `t0 = time.time()
for f in part.glob("*.parquet"):         # bước 1: xoá file cũ
    f.unlink()
print(f"old files gone at t={time.time() - t0:.1f}s", flush=True)

con.execute(f"COPY ({rebuild_sql(scale)}) "                   # bước 2: ghi file mới
            f"TO '{(part / 'data_0.parquet').as_posix()}' (FORMAT parquet)")
print(f"new file ready at t={time.time() - t0:.1f}s  <- đó chính là cửa sổ bị xé")`,
            },
            {
              kind: 'trap',
              body: bi(
                'This script deletes real Parquet files. It is safe here because Task 3\'s rebuild is deterministic and reproduces the partition, but do not point it at anything else.',
                'Script này xoá file Parquet thật. Ở đây nó an toàn vì phép dựng lại của Task 3 là tất định và tái tạo lại đúng partition, nhưng đừng chĩa nó vào bất cứ thứ gì khác.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Terminal 1: `python work/a09_reader.py small 20`. Wait for the first count, then in terminal 2: `python work/a09_rewrite_naive.py small`. Copy the reader\'s output into your journal.',
                'Terminal 1 chạy python work/a09_reader.py small 20. Chờ con số đầu tiên hiện ra, rồi ở terminal 2 chạy python work/a09_rewrite_naive.py small. Chép output của bên đọc vào journal.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `count=180183        <- số dòng trước khi sửa
count=0             <- partition biến mất
IOException: IO Error: Cannot open file "...data_0.parquet"   <- file ghi dở
count=179294        <- số mới, chừng 2-3s sau lệnh xoá`,
            },
            {
              kind: 'why',
              body: bi(
                'The exact sequence varies per run — partial counts, zero, or errors, depending on when each poll lands. Every one of them was served to "the analyst" as a perfectly normal answer. That is the whole problem in one screenful.',
                'Trình tự cụ thể khác nhau ở mỗi lần chạy: có thể là số dở dang, số 0, hoặc lỗi, tuỳ vào lần hỏi rơi vào lúc nào. Nhưng mọi thứ đó đều được đưa cho "người phân tích" như một câu trả lời hoàn toàn bình thường. Cả vấn đề của bài này gói gọn trong một màn hình như vậy.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Your journal shows at least one wrong intermediate answer between the old and new counts', 'Journal của bạn có ít nhất một câu trả lời sai ở giữa, nằm giữa số cũ và số mới'),
      ],
    },

    {
      id: 'a09-t4',
      num: 4,
      title: bi('Why staging must hide: the leaky tmp dir', 'Vì sao staging phải giấu đi: cái thư mục tmp bị lộ'),
      goal: bi('Prove that "invisible" is a claim about the glob, not a feeling.', 'Chứng minh rằng chữ "vô hình" là một khẳng định về cái glob, chứ không phải cảm giác.'),
      steps: [
        {
          title: bi('Simulate the classic mistake with a copy', 'Mô phỏng lỗi kinh điển bằng một bản copy'),
          blocks: [
            {
              kind: 'code',
              lang: 'text',
              body: `$lake = "$env:ETL_LAB_DATA\\small\\lake\\orders"
Copy-Item -Recurse "$lake\\order_date=2026-06-19" "$lake\\order_date=2026-06-19.__tmp__"
python work\\a09_reader.py small 5        # người phân tích thấy gì bây giờ?
Remove-Item -Recurse -Force "$lake\\order_date=2026-06-19.__tmp__"`,
            },
            {
              kind: 'expect',
              body: bi(
                'The count DOUBLES. Two things went wrong at once: the readers\' glob */*.parquet happily matches the tmp folder, and the filter order_date = DATE \'2026-06-19\' still matches it because DuckDB\'s DATE cast ignores trailing text — CAST(\'2026-06-19.__tmp__\' AS DATE) is 2026-06-19. Try that cast yourself.',
                'Số dòng gấp đôi. Hai thứ hỏng cùng lúc: cái glob */*.parquet của người đọc khớp luôn thư mục tmp, và điều kiện order_date bằng ngày 2026-06-19 vẫn khớp, vì phép cast sang DATE của DuckDB bỏ qua phần đuôi thừa — CAST(\'2026-06-19.__tmp__\' AS DATE) ra đúng 2026-06-19. Tự chạy thử phép cast đó xem.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'A dot-prefixed folder inside the tree is even worse: DuckDB\'s glob matches it too, and the mismatched folder name breaks EVERY reader with a Hive partition mismatch binder error. Conclusion: staging lives where the glob cannot reach — a sibling of orders/, not inside it.',
                'Đặt thư mục có dấu chấm ở đầu tên ngay bên trong cây thư mục còn tệ hơn: glob của DuckDB vẫn khớp nó, mà tên thư mục sai khuôn thì làm MỌI người đọc gãy với lỗi binder Hive partition mismatch. Kết luận: staging phải nằm ở chỗ glob không với tới, tức là anh em cùng cấp với orders, không nằm bên trong.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('You saw the doubled count and can explain it in one sentence', 'Bạn đã thấy số dòng gấp đôi và giải thích được bằng một câu'),
      ],
    },

    {
      id: 'a09-t5',
      num: 5,
      title: bi('The staging-dir swap', 'Swap bằng thư mục staging'),
      goal: bi('Move the slow part off-stage; publish in milliseconds.', 'Dời phần chậm ra sau hậu trường; công bố trong vài mili giây.'),
      steps: [
        {
          title: bi('work/a09_swap.py — build aside, publish by rename', 'work/a09_swap.py — dựng ở chỗ khác, công bố bằng rename'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `live    = lake_root / "orders" / f"order_date={DAY}"
staging = lake_root / ".staging" / f"order_date={DAY}"    # NGOÀI glob của người đọc
trash   = lake_root / ".trash" / f"order_date={DAY}.{int(time.time())}"

def rename_with_retry(src, dst, attempts=20, wait=0.25):
    """Windows: rename lỗi PermissionError khi BẤT KỲ tiến trình nào đang mở một
    file bên trong src — người đọc đang quét, indexer, antivirus.
    Người đọc chỉ giữ file vài mili giây, nên vòng thử lại ngắn là thắng."""
    ...

def swap():
    rename_with_retry(live, trash)            # rename 1: live -> trash
    rename_with_retry(staging, live)          # rename 2: staging -> live
    print(f"published in {time.time() - t0:.3f}s (bản cũ giữ ở .trash/{trash.name})")`,
            },
            {
              kind: 'text',
              body: bi(
                'Reader in terminal 1 for 20s, then `python work/a09_swap.py small` in terminal 2.',
                'Cho người đọc chạy 20 giây ở terminal 1, rồi chạy python work/a09_swap.py small ở terminal 2.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'The reader prints exactly one line and stays there. Not two: Task 3 already replaced this partition with the rebuilt content, and the rebuild is deterministic, so old and new counts coincide at 179,294 — a print-only-on-change reader has nothing new to say. The win is what is ABSENT: no zeros, no IO errors, no partial counts, while the same rebuild that tore Task 3\'s reads ran start to finish. Publishing took about 0.004s on the baseline machine.',
                'Bên đọc in ra đúng một dòng rồi đứng yên. Không phải hai dòng: Task 3 đã thay nội dung partition này bằng bản dựng lại rồi, mà phép dựng lại là tất định, nên số cũ và số mới trùng nhau ở 179.294 — một người đọc chỉ in khi có thay đổi thì chẳng có gì mới để nói. Cái thắng nằm ở thứ VẮNG MẶT: không số 0, không lỗi IO, không số dở dang, trong khi đúng phép dựng lại đã xé nát các lần đọc ở Task 3 vẫn chạy từ đầu tới cuối. Việc công bố mất khoảng 0,004 giây trên máy chuẩn.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'You did not make anything faster. The rebuild still takes seconds. You moved all of it somewhere readers cannot see, so the exposed window shrank from seconds to milliseconds. That ratio is the lesson.',
                'Bạn không làm cho thứ gì nhanh hơn cả. Phép dựng lại vẫn mất hàng giây. Bạn chỉ dời toàn bộ nó sang chỗ người đọc không nhìn thấy, nên khoảng thời gian bị phơi ra co từ hàng giây xuống hàng mili giây. Chính cái tỉ lệ đó là bài học.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('The reader holds one steady count while the swap runs — no zeros, no errors, no partial counts', 'Bên đọc giữ nguyên một con số trong suốt lúc swap chạy — không số 0, không lỗi, không số dở dang'),
        bi('The script printed "published in" some milliseconds', 'Script in ra dòng published in với thời gian cỡ mili giây'),
      ],
    },

    {
      id: 'a09-t6',
      num: 6,
      title: bi('The gap is real: nap, retry, crash, recover', 'Khoảng hở là có thật: nap, retry, crash, recover'),
      goal: bi('Near-atomic is not atomic. Prove the gap, then cover it two ways.', 'Gần-atomic thì không phải atomic. Chứng minh khoảng hở đó tồn tại, rồi che nó bằng hai cách.'),
      steps: [
        {
          title: bi('1 — Widen the gap on purpose', '1 — Cố tình nới rộng khoảng hở'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Between the two renames the partition does not exist. The window is normally about 4 milliseconds — a 0.1s-polling reader will basically never catch it. Reader WITHOUT retry, then `python work/a09_swap.py small --nap 2`.',
                'Giữa hai lần rename thì partition không tồn tại. Bình thường khoảng hở đó chừng 4 mili giây — một người đọc hỏi mỗi 0,1 giây thì gần như không bao giờ bắt được. Chạy bên đọc KHÔNG có retry, rồi chạy python work/a09_swap.py small --nap 2.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'The reader prints count=0 during the nap. A 2-second outage, served as a valid answer.',
                'Bên đọc in ra count=0 trong lúc ngủ. Một lần mất dữ liệu 2 giây, được trả về như một câu trả lời hợp lệ.',
              ),
            },
          ],
        },
        {
          title: bi('2 — Retry-on-read rides through it', '2 — Retry-on-read đi qua được khoảng hở'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Same `--nap 2` swap, but run the reader WITH `--retry`. The retry loop (15 × 0.3s) simply outlasts the gap.',
                'Vẫn cú swap --nap 2 đó, nhưng chạy bên đọc KÈM cờ --retry. Vòng thử lại 15 lần mỗi lần 0,3 giây đơn giản là chờ lâu hơn khoảng hở.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'One steady count. That is retry-on-read: cheap on the reader side, and it converts "wrong answer" into "answer arrives a beat later". It works only because the reader KNOWS this partition has data, so 0 cannot be an answer.',
                'Một con số ổn định. Đó chính là retry-on-read: rẻ với phía đọc, và nó biến "câu trả lời sai" thành "câu trả lời về chậm một nhịp". Nó chạy được chỉ vì bên đọc BIẾT partition này có dữ liệu, nên số 0 không thể là một câu trả lời.',
              ),
            },
          ],
        },
        {
          title: bi('3 — Crash at the worst possible moment', '3 — Crash đúng lúc tệ nhất có thể'),
          blocks: [
            {
              kind: 'code',
              lang: 'text',
              body: `python work\\a09_swap.py small --crash      # chết ngay giữa hai lần rename
Get-ChildItem "$env:ETL_LAB_DATA\\small\\lake\\orders"   # live đã biến mất
python work\\a09_swap.py small --recover
# -> finished the swap: staging -> live`,
            },
            {
              kind: 'why',
              body: bi(
                'Read recover() and name the invariant that makes it safe: at every step, staging or trash still holds a complete copy. If live is gone and staging has parquet files, finish forward; if only trash survived, roll back to the newest one. Nothing is destroyed before its replacement exists.',
                'Đọc hàm recover và gọi tên cái bất biến làm cho nó an toàn: ở mọi bước, staging hoặc trash vẫn đang giữ một bản đầy đủ. Nếu live mất mà staging có file parquet thì đi tiếp cho xong; nếu chỉ còn trash thì lùi về bản trash mới nhất. Không thứ gì bị huỷ trước khi bản thay thế của nó tồn tại.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('You observed all three cases', 'Bạn đã quan sát đủ cả ba trường hợp'),
        bi('Recovery restored a queryable partition with the expected count', 'Phép recover khôi phục lại một partition query được với đúng số dòng kỳ vọng'),
      ],
    },

    {
      id: 'a09-t7',
      num: 7,
      title: bi('Now at full scale', 'Giờ chạy ở scale full'),
      goal: bi('Feel how long the torn window would be in production.', 'Cảm nhận xem ở môi trường thật thì cửa sổ bị xé dài cỡ nào.'),
      steps: [
        {
          title: bi('Repeat Tasks 3 and 5 with full', 'Chạy lại Task 3 và Task 5 với scale full'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Note the full manifest numbers first: the spike day has 3,643,024 rows, about 1.1 GB of CSV, and the rebuild scans eight full days.',
                'Ghi lại số trong manifest ở scale full trước đã: ngày cao điểm có 3.643.024 dòng, khoảng 1,1 GB CSV, và phép dựng lại phải quét trọn tám ngày.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Naive rewrite: the reader now shows wrong answers for a long stretch — roughly 11s on our machine, expect 10–60s depending on your disk. While it runs, watch Task Manager: python and DuckDB pulling several GB of RAM and all 8 cores during the CSV scan plus dedupe. This is the torn window your users would live inside every single day.',
                'Với bản ghi đè ngây thơ: bên đọc trả về câu trả lời sai suốt một quãng dài — chừng 11 giây trên máy của lab, còn tuỳ ổ đĩa thì dự kiến 10 tới 60 giây. Trong lúc nó chạy, nhìn Task Manager: python và DuckDB ngốn vài GB RAM và cả 8 nhân trong lúc quét CSV rồi dedupe. Đây chính là cửa sổ bị xé mà người dùng của bạn sẽ sống trong đó mỗi ngày.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Staged swap: the rebuild still takes just as long — but readers do not care, and publishing is still milliseconds. Journal both timings side by side: rebuild seconds vs publish seconds. That ratio is the whole lesson.',
                'Với bản swap qua staging: phép dựng lại vẫn chậm y như vậy — nhưng người đọc không quan tâm, và việc công bố vẫn chỉ vài mili giây. Ghi cả hai con số cạnh nhau vào journal: số giây dựng lại so với số giây công bố. Chính tỉ lệ đó là toàn bộ bài học.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Torn reads observed at full scale with the naive script', 'Đã quan sát được torn read ở scale full với script ngây thơ'),
        bi('A steady, error-free reader through the swap', 'Bên đọc giữ ổn định, không lỗi, trong suốt cú swap'),
        bi('Both timings in your journal', 'Cả hai con số thời gian đều đã có trong journal'),
      ],
    },

    {
      id: 'a09-t8',
      num: 8,
      title: bi('Warehouse table swap', 'Swap bảng trong warehouse'),
      goal: bi('Inside the catalog you get real atomicity — and see exactly where it stops.', 'Bên trong catalog thì bạn có tính atomic thật — và thấy rõ nó dừng lại ở đâu.'),
      steps: [
        {
          title: bi('Rename both tables in one transaction', 'Đổi tên cả hai bảng trong một transaction'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `reader = duckdb.connect(str(warehouse_path("small")))    # kết nối thứ hai = nhà phân tích

writer.execute("BEGIN TRANSACTION")
writer.execute("ALTER TABLE core.orders_a09 RENAME TO orders_a09_old")
writer.execute("ALTER TABLE core.orders_a09_new RENAME TO orders_a09")
print("mid-swap  :", reader.execute("SELECT count(*) FROM core.orders_a09").fetchone())
writer.execute("COMMIT")
print("post-commit:", reader.execute("SELECT count(*) FROM core.orders_a09").fetchone())
writer.execute("DROP TABLE core.orders_a09_old")`,
            },
            {
              kind: 'expect',
              body: bi(
                'Mid-transaction the reader still sees the OLD table, complete and correct; the instant after COMMIT it sees the new one, visibly smaller. Both renames became visible together — that is what atomic buys you when a catalog manages the names.',
                'Giữa lúc transaction đang mở, bên đọc vẫn thấy bảng CŨ, đầy đủ và đúng; ngay sau COMMIT thì nó thấy bảng mới, nhỏ hơn thấy rõ. Hai phép đổi tên cùng hiện ra một lúc — đó là thứ bạn mua được bằng tính atomic khi có catalog quản lý tên.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Both orders_a09 tables are swap props read straight out of the lake, so neither carries the §7.2 lineage pair: the lake files hold no _data_date, and nothing here registers a run to hand out a _run_id. The core.orders you built in A07 carries both — these two exist only to be renamed at each other and dropped.',
                'Hai bảng orders_a09 chỉ là đạo cụ cho cú swap, đọc thẳng từ lake ra, nên không bảng nào mang cặp cột lineage ở mục 7.2: file trong lake không có _data_date, mà ở đây cũng chẳng có gì đăng ký một lần chạy để cấp _run_id. Bảng core.orders bạn dựng ở A07 thì có đủ cả hai — hai bảng này tồn tại chỉ để đổi tên cho nhau rồi bị drop.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Know where this stops. It protects connections to the warehouse, and only within the single-writer rule you meet head-on in A12 — a separate process cannot even open the file while your writer holds it. And it does nothing for Parquet readers: those files are outside the catalog. That boundary is the entire reason patterns 1 and 3 exist.',
                'Phải biết nó dừng ở đâu. Nó bảo vệ các kết nối tới warehouse, và cũng chỉ trong giới hạn của luật một-writer mà bạn sẽ đụng thẳng ở A12 — một tiến trình khác thậm chí không mở nổi file khi writer của bạn đang giữ. Còn với người đọc Parquet thì nó không giúp gì: mấy file đó nằm ngoài catalog. Đúng cái ranh giới ấy là lý do tồn tại của khuôn 1 và khuôn 3.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Mid-swap prints the old count, post-commit the new one', 'Giữa lúc swap in ra số cũ, sau COMMIT in ra số mới'),
        bi('You can say why the file lake cannot give you this for free', 'Bạn nói được vì sao file lake không cho bạn thứ này miễn phí'),
      ],
    },

    {
      id: 'a09-t9',
      num: 9,
      title: bi('Versioned dirs + view repoint (small only)', 'Thư mục theo version và trỏ lại view (chỉ scale small)'),
      goal: bi('Never modify a published folder — and feel why Iceberg exists.', 'Không bao giờ sửa một thư mục đã công bố — và cảm nhận vì sao Iceberg tồn tại.'),
      steps: [
        {
          title: bi('Turn the lake into v1, then publish v2', 'Biến lake thành v1, rồi công bố v2'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `v1 = int(time.time())
(root / "orders").rename(root / f"orders_v={v1}")        # tức thì, cùng ổ đĩa
con.execute(f"""
CREATE OR REPLACE VIEW core.lake_orders AS
SELECT * FROM read_parquet('.../orders_v={v1}/*/*.parquet', hive_partitioning=true)
""")

v2 = v1 + 1
shutil.copytree(root / f"orders_v={v1}", root / f"orders_v={v2}")
# ... dựng lại order_date=2026-06-19 bên trong orders_v=<v2>, dùng lại rebuild_sql ...
con.execute(f"""
CREATE OR REPLACE VIEW core.lake_orders AS
SELECT * FROM read_parquet('.../orders_v={v2}/*/*.parquet', hive_partitioning=true)
""")`,
            },
            {
              kind: 'text',
              body: bi(
                'From now on consumers query core.lake_orders and never a folder path. CREATE OR REPLACE VIEW is a catalog change — atomic, like Task 8. Old versions stay around: free rollback and "what did the data look like yesterday?" for the price of disk.',
                'Từ đây trở đi, bên tiêu thụ query vào core.lake_orders chứ không bao giờ vào một đường dẫn thư mục. Câu CREATE OR REPLACE VIEW là một thay đổi trong catalog, nên atomic, giống Task 8. Các version cũ vẫn nằm đó: rollback miễn phí và câu hỏi "hôm qua dữ liệu trông thế nào" cũng miễn phí, chỉ tốn dung lượng đĩa.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'And that price is the catch: copytree duplicated your whole small lake — a few hundred MB, feel how long it takes. At full scale that would be several GB per publish. Sit with that pain for a second: this is why Iceberg and Delta Lake exist. They keep the versioned-pointer idea but track individual files in metadata, so version N+1 reuses every unchanged file and only the rewritten partition costs disk.',
                'Và cái giá đó chính là chỗ mắc: lệnh copytree đã nhân đôi cả cái lake small của bạn — vài trăm MB, hãy cảm nhận xem nó mất bao lâu. Ở scale full thì mỗi lần công bố sẽ tốn vài GB. Ngồi với cái đau đó một lát: đây chính là lý do Iceberg và Delta Lake ra đời. Chúng giữ ý tưởng con trỏ theo version, nhưng theo dõi từng file trong metadata, nên version N cộng 1 dùng lại mọi file không đổi, và chỉ partition được ghi lại mới tốn đĩa.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Cleanup, do not skip: later assignments expect the standard layout. Drop the view, delete orders_v=<v2>, and rename orders_v=<v1> back to orders.',
                'Dọn dẹp, đừng bỏ qua: các bài sau trông chờ vào bố cục thư mục chuẩn. Drop cái view đi, xoá thư mục orders_v=<v2>, rồi đổi tên orders_v=<v1> về lại thành orders.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('The view flipped versions atomically', 'View đã lật giữa hai version một cách atomic'),
        bi('The lake is back at <DATA_ROOT>/small/lake/orders', 'Lake đã trở về đúng đường dẫn <DATA_ROOT>/small/lake/orders'),
      ],
    },

    {
      id: 'a09-verify',
      title: bi('Verify yourself', 'Tự kiểm chứng'),
      goal: bi('Exact numbers at both scales.', 'Các con số chính xác ở cả hai scale.'),
      steps: [
        {
          title: bi('The checkpoints', 'Các mốc kiểm tra'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `-- manifest (tất định; scale small)
SELECT rows, late_rows, dup_rows
FROM read_json_auto('<DATA_ROOT>/small/raw/manifest/orders_2026-06-19.json');
-- -> 182151, 2732, 91          (scale full: 3643024, 54645, 1821)`,
            },
            {
              kind: 'code',
              lang: 'text',
              body: `# partition sau khi dựng lại, scale small (đúng với rebuild_sql ở trên):
python work\\a09_reader.py small 5
# -> count=179294               (scale full: khoảng 3.586.000)`,
            },
            {
              kind: 'expect',
              body: bi(
                'Before the rewrite the partition holds roughly 180k rows at small scale — A02 measured it exactly at 180,183: day-19 rows plus appended late-correction files. After: 179,294. The delta is the in-file duplicates and collapsed late corrections, per A08.',
                'Trước khi ghi lại, partition có khoảng 180 nghìn dòng ở scale small — A02 đo chính xác là 180.183: gồm dòng của ngày 19 cộng các file bản sửa trễ ghi thêm. Sau khi ghi lại: 179.294. Chênh lệch là do các bản trùng trong file và các bản sửa trễ bị gộp lại, đúng như A08.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Naive rewrite reader log: old count → (0 / partial / IOException) → new count. Swap reader log: one steady count and nothing else — Task 3 already left the rebuilt 179,294 in place, so there is no flip to see. The absence of garbage IS the result. Then `python work/a09_swap.py small --crash` followed by `--recover` prints "finished the swap: staging -> live" and the count above. Task 8 prints the mid-swap old count, then a visibly smaller post-commit count.',
                'Log của bên đọc khi ghi đè ngây thơ: số cũ, rồi tới 0 hoặc số dở dang hoặc IOException, rồi tới số mới. Log của bên đọc khi swap: một con số ổn định và không gì khác — Task 3 đã để lại sẵn bản dựng lại 179.294, nên chẳng có cú lật nào để nhìn. Việc KHÔNG có rác chính là kết quả. Sau đó chạy python work/a09_swap.py small --crash rồi --recover thì in ra dòng finished the swap: staging -> live cùng con số ở trên. Task 8 in ra số cũ ở giữa cú swap, rồi một số nhỏ hơn hẳn sau COMMIT.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('All checkpoints match at both scales', 'Mọi mốc kiểm tra đều khớp ở cả hai scale'),
      ],
    },

    {
      id: 'a09-mistakes',
      title: bi('Common beginner mistakes', 'Lỗi thường gặp của người mới'),
      goal: bi('Six traps; the first two you proved yourself.', 'Sáu cái bẫy; hai cái đầu bạn đã tự tay chứng minh.'),
      steps: [
        {
          title: bi('The six', 'Sáu lỗi'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'Staging inside the live tree. order_date=D.__tmp__ doubles wildcard readers\' counts, because DuckDB\'s DATE cast ignores trailing text — and a dot-prefixed folder breaks every reader with a Hive partition mismatch. Staging goes outside the glob, full stop.',
                'Đặt staging ngay trong cây thư mục đang sống. Thư mục order_date=D.__tmp__ làm số đếm của người đọc dùng wildcard gấp đôi, vì phép cast sang DATE của DuckDB bỏ qua phần đuôi thừa — còn thư mục có dấu chấm ở đầu tên thì làm mọi người đọc gãy với lỗi Hive partition mismatch. Staging phải nằm ngoài tầm glob, hết.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Trash or staging on a different drive. The "rename" quietly becomes copy plus delete: minutes of non-atomic exposure instead of microseconds. Same volume, always.',
                'Đặt trash hay staging ở ổ đĩa khác. Phép "rename" lặng lẽ biến thành copy rồi delete: phơi ra hàng phút trạng thái không atomic thay vì vài micro giây. Luôn luôn cùng một ổ đĩa.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                '"Rewriting" by COPYing into the live folder with OVERWRITE_OR_IGNORE. Readers see old plus new duplicates while it runs — and it can silently overwrite an existing data_0.parquet, eating the late-correction files your A02 loader appended. If your Task 1 before-count was strangely tiny, your A02 loader already did this to you.',
                'Ghi lại bằng cách COPY thẳng vào thư mục live với tuỳ chọn OVERWRITE_OR_IGNORE. Trong lúc chạy thì người đọc thấy cả bản cũ lẫn bản mới nên đếm trùng — và nó có thể lặng lẽ đè lên file data_0.parquet đang có, ăn mất các file bản sửa trễ mà loader A02 đã ghi thêm. Nếu số dòng trước khi sửa ở Task 1 của bạn nhỏ một cách lạ lùng thì loader A02 đã làm chuyện đó với bạn rồi.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Deleting the old version immediately. Keep the trashed generation until the new one is verified — it IS your rollback. A janitor can prune old trash later.',
                'Xoá bản cũ ngay lập tức. Hãy giữ thế hệ đã dời vào trash cho tới khi bản mới được kiểm chứng — nó chính là đường lùi của bạn. Một script dọn dẹp có thể tỉa trash cũ sau.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'No retry on renames. On Windows the first PermissionError — a reader mid-scan, the indexer, an antivirus — will crash a retry-less swap script at the worst possible moment.',
                'Không thử lại khi rename. Trên Windows, cái PermissionError đầu tiên — do người đọc đang quét dở, do indexer, hay do phần mềm diệt virus — sẽ làm một script swap không có vòng thử lại chết đúng vào lúc tệ nhất.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Trusting BEGIN...COMMIT to protect Parquet readers. Transactions guard the catalog — tables and views. Files on disk are on their own. That is the whole reason patterns 1 and 3 exist.',
                'Tin rằng BEGIN với COMMIT bảo vệ được người đọc Parquet. Transaction bảo vệ catalog, tức các bảng và view. File trên đĩa thì tự lo. Đó chính là toàn bộ lý do khuôn 1 và khuôn 3 tồn tại.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Đọc qua một lượt trước khi bắt đầu Task 5')],
    },

    {
      id: 'a09-stretch',
      title: bi('Stretch goals', 'Bài mở rộng'),
      goal: bi('Three optional exercises; the first one removes the gap entirely.', 'Ba bài tự chọn; bài đầu tiên xoá sạch khoảng hở.'),
      steps: [
        {
          title: bi('1 — Pointer file (mini-Iceberg)', '1 — File con trỏ, phiên bản Iceberg thu nhỏ'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Write a _current.json next to the partition listing the exact Parquet files that make up the current version. Readers read the pointer, then scan only those files — no globs. Publishing becomes os.replace of one small file, which IS atomic on Windows: the two-rename gap disappears entirely. Congratulations, you have reinvented the core of a table format\'s snapshot.',
                'Ghi một file _current.json nằm cạnh partition, liệt kê đúng những file Parquet tạo nên phiên bản hiện hành. Người đọc đọc file con trỏ đó rồi chỉ quét đúng những file được liệt kê, không dùng glob nữa. Việc công bố lúc này chỉ còn là os.replace một file nhỏ, mà thao tác đó atomic thật trên Windows: khoảng hở giữa hai lần rename biến mất hoàn toàn. Xin chúc mừng, bạn vừa phát minh lại cái lõi snapshot của một table format.',
              ),
            },
          ],
        },
        {
          title: bi('2 — Trash janitor', '2 — Script dọn thùng rác'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'A script that deletes .trash and old orders_v=* entries older than N days, but always keeps the most recent one. When would you dare set N=0? (Answer: never.)',
                'Viết một script xoá các mục trong .trash và các thư mục orders_v=* cũ hơn N ngày, nhưng luôn giữ lại cái mới nhất. Khi nào bạn dám đặt N bằng 0? Câu trả lời: không bao giờ.',
              ),
            },
          ],
        },
        {
          title: bi('3 — Hammer test', '3 — Thử nện liên tục'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Run the reader at 0.01s intervals while looping 20 swaps. Count how often rename_with_retry actually retries — measure how real the Windows file-lock caveat is on your machine.',
                'Cho bên đọc chạy với chu kỳ 0,01 giây trong lúc lặp 20 cú swap. Đếm xem hàm rename_with_retry thật sự phải thử lại bao nhiêu lần — để đo xem cái cảnh báo về khoá file trên Windows thật tới đâu trên máy của bạn.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Hoàn thành ít nhất một mục và ghi kết luận vào journal')],
    },
  ],
}