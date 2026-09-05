import type { AssignmentSpec } from '../types'
import { bi, vi } from '../types'
import { a08Terms, a08Theory } from './a08.theory'

export const a08: AssignmentSpec = {
  id: 'a08',
  code: 'A08',
  title: bi('Append vs upsert vs partition refresh', 'Append, upsert, hay partition refresh'),
  summary: bi(
    'Build all three load strategies over the same ten files, then prove they agree on every single row — and watch what happens when one window is off by seven days.',
    'Dựng cả ba chiến lược load trên cùng mười file, rồi chứng minh chúng khớp nhau tới từng dòng — và xem chuyện gì xảy ra khi một cửa sổ bị lệch bảy ngày.',
  ),
  estHours: 4,
  difficulty: 3,
  outcome: bi(
    'You can pick a load strategy for a feed that sends corrections, defend the choice against the other two, and prove three implementations agree by content rather than by count.',
    'Bạn chọn được chiến lược load cho một feed có gửi bản sửa, bảo vệ được lựa chọn đó trước hai phương án còn lại, và chứng minh được ba cách cài đặt khớp nhau bằng nội dung chứ không phải bằng số đếm.',
  ),
  theory: a08Theory,
  terms: a08Terms,
  tasks: [
    {
      id: 'a08-t0',
      title: bi('Setup', 'Chuẩn bị'),
      goal: bi(
        'A ten-day window, three experiment tables, and your real core.orders left alone.',
        'Một cửa sổ mười ngày, ba bảng thí nghiệm, và bảng core.orders thật thì để yên.',
      ),
      steps: [
        {
          title: bi('Scope and scale', 'Phạm vi và scale'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Data: month 1, era v1 only, a 10-day window 2026-06-01 → 2026-06-10, small scale first. Full scale only in Task 8. One process on the warehouse at a time — DuckDB is single-writer, so close stray notebooks.',
                'Dữ liệu: tháng 1, chỉ kỷ nguyên v1, cửa sổ 10 ngày từ 2026-06-01 tới 2026-06-10, làm ở scale small trước. Chỉ Task 8 mới chuyển sang full. Mỗi lúc chỉ một tiến trình mở warehouse — DuckDB chỉ cho một writer, nên đóng hết notebook đang mở dở.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Your real core.orders from A05/A07 stays UNTOUCHED. Today builds separate experiment tables — core.orders_log, core.orders_upsert, core.orders_refresh — so you can compare them side by side.',
                'Bảng core.orders thật từ A05 và A07 thì để nguyên, đừng đụng vào. Hôm nay dựng ba bảng thí nghiệm riêng là core.orders_log, core.orders_upsert và core.orders_refresh, để bạn đặt chúng cạnh nhau mà so.',
              ),
            },
          ],
        },
        {
          title: bi('Three things to notice in staged_select()', 'Ba điều cần để ý trong hàm staged_select()'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `SCALE = "small"                       # chỉ đổi sang "full" ở Task 8
START = dt.date(2026, 6, 1)
DATES = [START + dt.timedelta(days=i) for i in range(10)]   # 06-01 .. 06-10

def staged_select(d: dt.date) -> str:
    """Một file một ngày, staged tối thiểu bằng cleaner của A03, kèm cột _data_date."""
    f = (RAW / f"orders_{d}.csv").as_posix()
    return f"""
    SELECT order_id, customer_id, store_id,
      try_strptime(order_ts, {TS}) AS order_ts,
      updated_at, status, payment_method,
      TRY_CAST(...) AS order_total,
      COALESCE(CAST(try_strptime(order_ts, {TS}) AS DATE), DATE '{d}') AS order_date,
      DATE '{d}' AS _data_date
    FROM read_csv('{f}', header=true, columns={{...}})
    """`,
            },
            {
              kind: 'why',
              body: bi(
                'One lineage column, and that is the whole list. _data_date still tells you which file a row came from: the contract\'s path_pattern is one file per business date, so _data_date IS orders_<_data_date>.csv. The file name, load timestamp, status and row count are facts about the RUN — they live on the ops.etl_runs row that _run_id points at. These throwaway experiment tables are filled by a bare loop instead of A07\'s ledgered loader, so they carry no _run_id either; your real core.orders does.',
                'Chỉ một cột lineage duy nhất, và đó là toàn bộ danh sách. Cột _data_date vẫn cho biết một dòng đến từ file nào: điều khoản path_pattern trong contract quy định mỗi business date một file, nên _data_date chính là orders_<_data_date>.csv. Còn tên file, thời điểm load, trạng thái và số dòng là những sự thật về lần chạy — chúng nằm ở dòng trong ops.etl_runs mà _run_id trỏ tới. Mấy bảng thí nghiệm dùng một lần này được đổ đầy bằng một vòng lặp trần chứ không qua loader có ledger của A07, nên chúng cũng không mang _run_id; bảng core.orders thật của bạn thì có.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'order_date gets a COALESCE fallback to the file\'s date. About 0.02% of rows have impossible timestamps that clean to NULL, and a partition key must NEVER be NULL — a NULL-dated row can never be matched by WHERE order_date BETWEEN …, so Strategy C would silently lose it forever.',
                'Cột order_date có một COALESCE lùi về ngày của file. Khoảng 0,02% số dòng có timestamp bất khả thi và sau khi làm sạch thì thành NULL, mà khoá partition thì tuyệt đối không được NULL — một dòng có ngày NULL sẽ không bao giờ khớp điều kiện WHERE order_date BETWEEN, nên chiến lược C sẽ lặng lẽ đánh mất nó vĩnh viễn.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'And items/meta are left out of the experiment tables — the strategies behave identically with more columns, and the JSON strings would just make every rewrite heavier.',
                'Còn items và meta thì được bỏ ra khỏi các bảng thí nghiệm — có thêm cột thì ba chiến lược cũng hành xử y hệt, mà mấy chuỗi JSON chỉ làm mỗi lần ghi lại nặng thêm.',
              ),
            },
          ],
        },
      ],
      accept: [bi('Script runs; three experiment tables are separate from core.orders', 'Script chạy được; ba bảng thí nghiệm tách riêng khỏi core.orders')],
    },

    {
      id: 'a08-t1',
      num: 1,
      title: bi('Measure the phenomenon before building anything', 'Đo hiện tượng trước khi dựng bất cứ thứ gì'),
      goal: bi('Never design a load strategy for data you have not measured.', 'Đừng bao giờ thiết kế chiến lược load cho thứ dữ liệu mà bạn chưa đo.'),
      steps: [
        {
          title: bi('Read the manifests', 'Đọc manifest'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.sql(f"""
  SELECT sum(rows) AS rows, sum(late_rows) AS late, sum(dup_rows) AS dups
  FROM read_json_auto('{MAN}')
  WHERE CAST(date AS DATE) BETWEEN DATE '2026-06-01' AND DATE '2026-06-10'
""").show()`,
            },
            {
              kind: 'expect',
              body: bi(
                'Small scale says: 577,673 rows, 7,750 late, 284 in-file dups. None of this is a surprise — it is the contract keeping its word. The late_corrections clause promises exactly this shape, and the 284 in-file dups are 0.05% of the window, comfortably inside the 0.2% tolerance.',
                'Scale small cho ra: 577.673 dòng, 7.750 dòng trễ, 284 bản trùng trong file. Chẳng có gì bất ngờ cả — đó là contract đang giữ lời. Điều khoản late_corrections đã hứa đúng cái hình dạng này, còn 284 bản trùng trong file chỉ chiếm 0,05% cửa sổ, nằm khá thoải mái dưới ngưỡng 0,2%.',
              ),
            },
          ],
        },
        {
          title: bi('Prove the overlap is real', 'Chứng minh phần chồng lấn là có thật'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Count order_ids that appear in BOTH the 06-01 and 06-02 files — use INTERSECT between two read_csv selects with the explicit schema. You should get 883. Compare it with late_rows in orders_2026-06-02.json, which says 885, and write one sentence explaining the gap of 2.',
                'Đếm những order_id xuất hiện ở CẢ file 06-01 lẫn 06-02, dùng INTERSECT giữa hai câu read_csv với schema khai tường minh. Bạn sẽ được 883. So nó với trường late_rows trong file orders_2026-06-02.json, vốn ghi 885, rồi viết một câu giải thích chỗ chênh 2 dòng.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Hint: can one order be corrected twice in one file?',
                'Gợi ý: một đơn hàng có thể được sửa hai lần trong cùng một file không?',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'You can state the expected duplicate-id volume for the window from manifests alone, and your two-file overlap is 883',
          'Bạn nói được lượng id trùng dự kiến của cửa sổ chỉ dựa vào manifest, và phần chồng lấn giữa hai file ra đúng 883',
        ),
      ],
    },

    {
      id: 'a08-t2',
      num: 2,
      title: bi('Strategy A: the append-only log', 'Chiến lược A: append-only log'),
      goal: bi('A faithful copy of what arrived — nothing dropped, nothing deduped.', 'Một bản sao trung thực của những gì đã về — không bỏ dòng nào, không dedupe gì cả.'),
      steps: [
        {
          title: bi('Ten days into one growing table', 'Mười ngày đổ vào một bảng lớn dần'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.execute(f"""
-- grain: one row = one delivered version of an order — một đơn đã sửa nằm ở đây hai lần
CREATE OR REPLACE TABLE core.orders_log AS {staged_select(DATES[0])} LIMIT 0
""")

t0 = time.perf_counter()
for d in DATES:
    con.execute(f"DELETE FROM core.orders_log WHERE _data_date = DATE '{d}'")
    con.execute(f"INSERT INTO core.orders_log {staged_select(d)}")
print(f"append: {time.perf_counter() - t0:.1f}s")`,
            },
            {
              kind: 'text',
              body: bi(
                'The DELETE before each INSERT is A07\'s lesson applied: a rerun of any day cannot double-load it.',
                'Lệnh DELETE trước mỗi INSERT chính là bài học của A07 đem áp dụng: chạy lại một ngày bất kỳ thì cũng không nạp đôi được.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'The log must hold EXACTLY the manifest sum: 577,673 rows. Nothing dropped, nothing deduped — an append log is a faithful copy of what arrived. Check there are 0 NULL order_dates, and note the wall-clock (roughly 3 s on the baseline machine).',
                'Log phải chứa đúng bằng tổng của manifest: 577.673 dòng. Không bỏ dòng nào, không dedupe gì — append log là bản sao trung thực của những gì đã về. Kiểm tra xem có 0 dòng order_date NULL không, và ghi lại thời gian chạy, khoảng 3 giây trên máy chuẩn.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('count(*) = 577,673 = manifest sum, and rerunning one day changes nothing', 'count(*) bằng 577.673, tức bằng tổng manifest, và chạy lại một ngày thì không đổi gì'),
      ],
    },

    {
      id: 'a08-t3',
      num: 3,
      title: bi('Strategy A continued: dedupe-on-read view', 'Chiến lược A phần tiếp: view dedupe lúc đọc'),
      goal: bi('Pick each order\'s winner, deterministically.', 'Chọn ra bản thắng cho từng đơn hàng, một cách tất định.'),
      steps: [
        {
          title: bi('The view', 'View'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `-- grain: one row = one order — phiên bản mới nhất của nó
CREATE OR REPLACE VIEW core.orders_latest AS
SELECT * EXCLUDE (rn) FROM (
  SELECT *,
         row_number() OVER (PARTITION BY order_id
                            ORDER BY updated_at DESC, _data_date ASC) AS rn
  FROM core.orders_log
) WHERE rn = 1`,
            },
            {
              kind: 'text',
              body: bi(
                'Read it aloud: number the versions of each order, newest updated_at first, keep row 1. EXCLUDE (rn) drops the helper column from SELECT *.',
                'Đọc to lên xem: đánh số các phiên bản của mỗi đơn, updated_at mới nhất đứng trước, giữ lại dòng số 1. Còn EXCLUDE (rn) thì bỏ cột phụ trợ ra khỏi SELECT *.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'The second sort key is a TIE-BREAKER: if two versions ever carried the same updated_at, "earliest file wins" makes the choice deterministic — and, not by accident, it is exactly the choice MERGE will make in Task 4 (its > guard refuses an equal timestamp). Not hypothetical: at full scale this window contains exactly one real tie — order 1520054262, same updated_at in two files with two different totals. Without the tie-break, two "correct" strategies can legally disagree by one row, and you would chase that row for an hour.',
                'Khoá sắp xếp thứ hai đóng vai trò phá thế hoà: nếu hai phiên bản có cùng updated_at thì quy tắc "file về trước thắng" khiến lựa chọn trở nên tất định. Và không phải ngẫu nhiên đâu, đó đúng là lựa chọn mà MERGE sẽ đưa ra ở Task 4, vì điều kiện dấu lớn hơn của nó từ chối các timestamp bằng nhau. Cũng không phải chuyện giả định: ở scale full, cửa sổ này có đúng một thế hoà thật là đơn 1520054262, cùng updated_at ở hai file mà hai tổng tiền khác nhau. Không có luật phá hoà thì hai chiến lược đều "đúng" vẫn có thể lệch nhau một dòng một cách hợp lệ, và bạn sẽ mất cả tiếng để truy cái dòng đó.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Notice what the two DDL comments just said — the grain rule you have kept since A03. The log and the view describe the same orders at two different grains: one row = one delivered VERSION there, one row = one ORDER here. That is exactly why they are two objects and not one, and why the same window is 577,673 rows in the first and 569,639 in the second.',
                'Để ý hai dòng comment trên DDL vừa nói gì — chính là quy tắc grain mà bạn giữ từ A03 tới giờ. Log và view mô tả cùng những đơn hàng đó nhưng ở hai grain khác nhau: bên kia một dòng bằng một phiên bản đã giao, bên này một dòng bằng một đơn hàng. Đó chính là lý do chúng là hai đối tượng chứ không phải một, và cũng là lý do cùng một cửa sổ ra 577.673 dòng ở cái đầu và 569.639 ở cái sau.',
              ),
            },
          ],
        },
        {
          title: bi('Measure the phenomenon across all ten files', 'Đo hiện tượng trên cả mười file'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT count(*) FROM (
  SELECT order_id FROM core.orders_log
  GROUP BY 1 HAVING count(DISTINCT _data_date) > 1);`,
            },
            {
              kind: 'expect',
              body: bi(
                'Expect 7,684 order_ids seen in more than one file — about 1.35% of the 569,639 distinct orders, and just under the manifests\' 7,750 late rows (some orders were corrected twice). Time a count(*) on the view versus on the log: the dedupe costs real work on every single read. That is Strategy A\'s tax.',
                'Kỳ vọng 7.684 order_id xuất hiện ở nhiều hơn một file, tức khoảng 1,35% của 569.639 đơn hàng phân biệt, và hơi thấp hơn con số 7.750 dòng trễ trong manifest, vì có những đơn bị sửa hai lần. Đo thử thời gian chạy count(*) trên view so với trên log: phép dedupe tốn công thật ở mỗi lần đọc. Đó là khoản thuế của chiến lược A.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('View count = 569,639; multi-file percentage computed and journaled', 'Số dòng của view bằng 569.639; đã tính và ghi vào journal tỉ lệ đơn xuất hiện ở nhiều file'),
      ],
    },

    {
      id: 'a08-t4',
      num: 4,
      title: bi('Strategy B: upsert with MERGE', 'Chiến lược B: upsert bằng MERGE'),
      goal: bi('Two rules make upserts correct. Both are easy to forget.', 'Hai quy tắc làm cho upsert chạy đúng. Cả hai đều dễ quên.'),
      steps: [
        {
          title: bi('Rule 1: one row per key in the source', 'Quy tắc 1: mỗi key chỉ một dòng ở phía nguồn'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'The feed has in-file duplicates — 284 in this window — and if the source has two rows for one order_id, DuckDB\'s MERGE does NOT error. It silently applies an arbitrary one. So each day gets deduped in staging first.',
                'Feed này có bản trùng ngay trong file, 284 cái trong cửa sổ này. Mà nếu nguồn có hai dòng cho cùng một order_id thì MERGE của DuckDB không báo lỗi — nó lặng lẽ chọn bừa một dòng. Nên mỗi ngày phải được dedupe ở staging trước đã.',
              ),
            },
          ],
        },
        {
          title: bi('Rule 2: guard the update', 'Quy tắc 2: chặn phép update lại'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `written += con.execute("""
  MERGE INTO core.orders_upsert t USING stg_day s ON t.order_id = s.order_id
  WHEN MATCHED AND s.updated_at > t.updated_at THEN UPDATE
  WHEN NOT MATCHED THEN INSERT
""").fetchone()[0]`,
            },
            {
              kind: 'text',
              body: bi(
                'Only overwrite when the incoming version is strictly newer, or a stale correction will clobber a newer row. (WHEN MATCHED … THEN UPDATE with no SET list updates all columns by name; same for the bare INSERT.)',
                'Chỉ ghi đè khi phiên bản đang về mới hơn hẳn, nếu không một bản sửa cũ sẽ đè lên dòng mới hơn. Câu WHEN MATCHED rồi THEN UPDATE mà không kèm danh sách SET thì nó update toàn bộ cột theo tên; lệnh INSERT trần cũng vậy.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Expect 575,494 rows written and a final count of 569,639. Do the arithmetic in your journal: 577,673 arrived, 284 collapsed as in-file dups — so roughly 1,900 source rows produced NO write. Those are stale corrections: versions arriving in a later file with an OLDER updated_at than what the table already held. The guard refused them.',
                'Kỳ vọng 575.494 dòng được ghi và số dòng cuối cùng là 569.639. Làm phép tính vào journal: 577.673 dòng về, 284 dòng gộp lại vì trùng trong file, vậy còn khoảng 1.900 dòng nguồn không tạo ra lần ghi nào cả. Đó là các bản sửa đã cũ: chúng về ở file sau nhưng mang updated_at cũ hơn thứ bảng đang giữ. Điều kiện chặn đã từ chối chúng.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Yes, this feed really does that; you will meet one face to face in Task 7.',
                'Đúng vậy, feed này làm thế thật. Ở Task 7 bạn sẽ gặp một cái tận mắt.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Final count = 569,639 = the view\'s count', 'Số dòng cuối cùng bằng 569.639, tức bằng số dòng của view'),
        bi('You can explain where the ~1,900 non-writes went', 'Bạn giải thích được khoảng 1.900 dòng không được ghi kia đã đi đâu'),
        bi('Rerunning one day\'s MERGE reports 0 rows written', 'Chạy lại MERGE của một ngày thì báo 0 dòng được ghi'),
      ],
    },

    {
      id: 'a08-t5',
      num: 5,
      title: bi('Strategy C: partition refresh', 'Chiến lược C: refresh cả partition'),
      goal: bi('Recompute whole date windows — and get the shape right.', 'Tính lại nguyên cả cửa sổ ngày — và phải viết đúng hình dạng câu query.'),
      steps: [
        {
          title: bi('Delete the window, re-insert the winners, atomically', 'Xoá cửa sổ, insert lại các bản thắng, trong một transaction'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `for d in DATES:
    lo = max(START, d - dt.timedelta(days=7))
    con.execute("BEGIN")
    deleted += con.execute(
        "DELETE FROM core.orders_refresh WHERE order_date BETWEEN ? AND ?",
        [lo, d]).fetchone()[0]
    written += con.execute(f"""
      INSERT INTO core.orders_refresh
      SELECT * EXCLUDE (rn) FROM (
        SELECT *, row_number() OVER (PARTITION BY order_id
                                     ORDER BY updated_at DESC, _data_date ASC) AS rn
        FROM core.orders_log
        WHERE _data_date <= DATE '{d}'
      ) WHERE rn = 1 AND order_date BETWEEN DATE '{lo}' AND DATE '{d}'
    """).fetchone()[0]
    con.execute("COMMIT")`,
            },
            {
              kind: 'text',
              body: bi(
                'One transaction — a crash between the DELETE and the INSERT must not leave a hole. That was A07.',
                'Một transaction thôi — một lần crash giữa DELETE và INSERT không được để lại lỗ hổng. Đó là bài học của A07.',
              ),
            },
          ],
        },
        {
          title: bi('Two details in that insert repay careful reading', 'Hai chi tiết trong câu insert đó đáng đọc kỹ'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                '_data_date <= D is an AS-OF condition: your log already holds all 10 files, but on day D the pipeline had only seen files up to D — the filter replays history honestly. In a live pipeline it holds automatically.',
                'Điều kiện _data_date nhỏ hơn hoặc bằng D là một điều kiện tính-tới-thời-điểm: log của bạn đã chứa sẵn cả 10 file, nhưng vào ngày D thì pipeline mới chỉ thấy các file tính tới D. Bộ lọc này tái hiện lịch sử một cách trung thực. Trong pipeline chạy thật thì điều đó tự đúng.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'And the shape matters: dedupe over the WHOLE as-of log first, THEN keep winners inside the window — choose winners globally, place them locally. The tempting "optimization" of filtering to the window before deduping is subtly wrong: an order\'s true winner can live OUTSIDE the window, and window-local dedupe would resurrect a stale version. The nasty part: at small scale both shapes agree perfectly — at full scale the wrong shape ends with 7 duplicated orders. Develop on small, but never certify on small.',
                'Và hình dạng câu query rất quan trọng: phải dedupe trên toàn bộ log tính tới ngày D trước, rồi mới giữ lại các bản thắng nằm trong cửa sổ. Chọn bản thắng toàn cục, đặt vào vị trí cục bộ. Cái "tối ưu" nghe rất hợp lý là lọc về cửa sổ rồi mới dedupe thì lại sai tinh vi: bản thắng thật của một đơn có thể nằm ngoài cửa sổ, và dedupe cục bộ sẽ làm sống lại một phiên bản đã cũ. Chỗ khó chịu là ở scale small hai cách viết khớp nhau hoàn hảo, còn ở scale full thì cách sai để lại 7 đơn bị trùng. Phát triển trên small được, nhưng đừng bao giờ nghiệm thu trên small.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Expect roughly 2.98M rows written and 2.41M deleted — you received 577k rows and rewrote five times that. That asymmetry IS Strategy C: pay in bulk I/O, get simplicity and file-compatibility back.',
                'Kỳ vọng khoảng 2,98 triệu dòng được ghi và 2,41 triệu dòng bị xoá — bạn nhận vào 577 nghìn dòng mà ghi lại gấp năm lần chừng đó. Chính sự bất cân xứng đó là chiến lược C: trả bằng I/O hàng loạt, đổi lại được sự đơn giản và khả năng chạy trên file.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'One caveat to journal: re-running the NEWEST day is perfectly idempotent, but re-running an OLDER day D rewinds [D−7, D] to its as-of-D state — corrections that arrived after D are removed until you replay D+1 onward. A refresh rerun is a mini backfill: restart from D and roll forward.',
                'Một cái bẫy đáng ghi vào journal: chạy lại ngày mới nhất thì idempotent hoàn hảo, nhưng chạy lại một ngày D cũ hơn sẽ tua cửa sổ D trừ 7 tới D về đúng trạng thái của thời điểm D. Mọi bản sửa về sau ngày D đều biến mất, cho tới khi bạn chạy lại từ D cộng 1 trở đi. Chạy lại một lần refresh thực chất là một lần backfill thu nhỏ: khởi động lại từ D rồi cuốn tới.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Final count = 569,639', 'Số dòng cuối cùng bằng 569.639'),
        bi('Delete/write volumes journaled with one sentence on why they dwarf the arrival volume', 'Đã ghi vào journal lượng xoá và lượng ghi, kèm một câu giải thích vì sao chúng lớn hơn hẳn lượng dữ liệu về'),
      ],
    },

    {
      id: 'a08-t6',
      num: 6,
      title: bi('The reconciliation — and why counts are not enough', 'Reconcile — và vì sao đếm số dòng là chưa đủ'),
      goal: bi('Three implementations, one truth.', 'Ba cách cài đặt, một sự thật.'),
      steps: [
        {
          title: bi('Counts first, then content, both directions', 'Đếm trước, rồi so nội dung, và so cả hai chiều'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT
  (SELECT count(*) FROM core.orders_latest)  AS append_view,
  (SELECT count(*) FROM core.orders_upsert)  AS upsert,
  (SELECT count(*) FROM core.orders_refresh) AS refresh,
  (SELECT count(*) FROM (SELECT * FROM core.orders_latest
                         EXCEPT SELECT * FROM core.orders_upsert)) AS av_minus_up
  -- …ba diff còn lại bạn tự viết: up−av, av−rf, rf−av
;`,
            },
            {
              kind: 'text',
              body: bi(
                'All three counts must be 569,639 and all four diffs 0.',
                'Cả ba con số phải là 569.639 và cả bốn phép diff phải ra 0.',
              ),
            },
          ],
        },
        {
          title: bi('Now earn the lesson', 'Giờ tới phần rút ra bài học'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Copy your Task 5 loop into a scratch table core.orders_refresh_bad, but use the naive window [D, D] — delete only day D, insert only order_date = D. Run it and reconcile against the view.',
                'Chép vòng lặp ở Task 5 sang một bảng nháp tên core.orders_refresh_bad, nhưng dùng cửa sổ ngây thơ D tới D: chỉ xoá đúng ngày D, chỉ insert những dòng có order_date bằng D. Chạy nó rồi reconcile với view.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'On the baseline data the count comes out 569,640 — off by one, a number nobody would ever notice. The content diff says 5,824 rows are wrong: every order whose current version is a correction is stuck at its stale original. Counting is not reconciliation; always diff content. Drop the _bad table when you are done.',
                'Với dữ liệu chuẩn thì số dòng ra 569.640 — lệch đúng một, con số chẳng ai để ý bao giờ. Nhưng diff nội dung lại cho thấy 5.824 dòng sai: mọi đơn hàng mà phiên bản hiện hành là một bản sửa đều bị kẹt ở bản gốc đã cũ. Đếm không phải là reconcile; luôn phải diff nội dung. Xong thì drop bảng _bad đi.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('The three-way reconciliation is all zeros', 'Phép reconcile ba chiều toàn số 0'),
        bi('Your journal states what the wrong-window run got wrong and why the count barely moved', 'Journal của bạn ghi rõ lần chạy sai cửa sổ đã sai ở đâu và vì sao số dòng gần như không đổi'),
      ],
    },

    {
      id: 'a08-t7',
      num: 7,
      title: bi('Trace one correction end-to-end', 'Truy vết một bản sửa từ đầu tới cuối'),
      goal: bi('Numbers convince engineers; a single traced row convinces everyone else.', 'Con số thuyết phục được kỹ sư; còn một dòng được truy vết thì thuyết phục được tất cả những người còn lại.'),
      steps: [
        {
          title: bi('Find a much-corrected order', 'Tìm một đơn hàng bị sửa nhiều lần'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT order_id, count(*) AS versions, count(DISTINCT _data_date) AS files
FROM core.orders_log
GROUP BY 1 HAVING count(DISTINCT _data_date) > 1
ORDER BY versions DESC, order_id LIMIT 3;`,
            },
            {
              kind: 'text',
              body: bi(
                'The top candidate on small scale is 1510000111 — the id scheme encodes the day: ordinal 151 = 2026-06-01, sequence 111. Three versions across three files. Show its full history from the log ordered by updated_at, then write one query (UNION ALL over the three targets) showing its final state in each strategy.',
                'Ứng viên đứng đầu ở scale small là 1510000111 — cách đánh id có mã hoá ngày: số thứ tự 151 ứng với 2026-06-01, còn 111 là số thứ tự trong ngày. Ba phiên bản trải trên ba file. Hãy in ra toàn bộ lịch sử của nó từ log, sắp theo updated_at, rồi viết một câu query dùng UNION ALL trên cả ba bảng để xem trạng thái cuối cùng của nó ở từng chiến lược.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `2026-06-02 | refunded  | 435.92 | 2026-06-02 00:10:35   <- bản sửa đã THUA
2026-06-01 | delivered |  84.48 | 2026-06-02 20:27:19   <- bản gốc
2026-06-06 | refunded  | 230.65 | 2026-06-06 07:53:51   <- bản thắng hiện tại`,
            },
            {
              kind: 'why',
              body: bi(
                'Look closely at the history: the correction in file 06-02 carries an updated_at EARLIER than the original\'s — it lost, correctly, in all three strategies. That is the Task 4 guard doing its job, and file order proving it means nothing.',
                'Nhìn kỹ phần lịch sử: bản sửa trong file 06-02 mang updated_at cũ hơn cả bản gốc, nên nó thua, và thua đúng, ở cả ba chiến lược. Đó là điều kiện chặn ở Task 4 đang làm việc, và cũng là bằng chứng cho thấy thứ tự file chẳng có ý nghĩa gì.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('History and three-way final state printed', 'Đã in ra lịch sử và trạng thái cuối cùng ở cả ba bảng'),
        bi(
          'One journal paragraph tells this order\'s story in plain business words (ordered, delivered, refunded — when did we learn what?)',
          'Một đoạn trong journal kể lại câu chuyện của đơn hàng này bằng ngôn ngữ nghiệp vụ bình thường: đặt hàng, giao hàng, hoàn tiền — và chúng ta biết chuyện gì vào lúc nào?',
        ),
      ],
    },

    {
      id: 'a08-t8',
      num: 8,
      title: bi('Full scale, and the decision', 'Scale full, và quyết định cuối cùng'),
      goal: bi('Feel the write asymmetry, then choose.', 'Cảm nhận sự bất cân xứng khi ghi, rồi chọn.'),
      steps: [
        {
          title: bi('Rerun Tasks 2–6 at full scale', 'Chạy lại Task 2 tới 6 ở scale full'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Same 10-day window — 10 files, ~3.5 GB of CSV, ~11.6M rows. The wrong-window experiment is optional here. While it runs, watch Task Manager and <DATA_ROOT>/tmp: the refresh loop rewrites millions of rows per day, and the write asymmetry becomes something you can FEEL.',
                'Vẫn cửa sổ 10 ngày đó: 10 file, khoảng 3,5 GB CSV, chừng 11,6 triệu dòng. Thí nghiệm cửa sổ sai thì không bắt buộc ở đây. Trong lúc nó chạy, nhìn Task Manager và thư mục tạm: vòng lặp refresh ghi lại hàng triệu dòng mỗi ngày, và lúc này sự bất cân xứng khi ghi trở thành thứ bạn cảm nhận được.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'On the baseline machine expect roughly 20 s for the append loop and about a minute each for the upsert and refresh loops, with refresh writing ~60M rows to deliver ~11.6M. The dedupe view now costs about a second per read — Strategy A\'s tax at scale.',
                'Trên máy chuẩn, dự kiến khoảng 20 giây cho vòng lặp append, và khoảng một phút cho mỗi vòng upsert và refresh, trong đó refresh ghi ra chừng 60 triệu dòng để giao 11,6 triệu. View dedupe giờ tốn khoảng một giây mỗi lần đọc — đó là khoản thuế của chiến lược A khi lên quy mô.',
              ),
            },
          ],
        },
        {
          title: bi('Fill the table, then decide in writing', 'Điền bảng, rồi viết ra quyết định'),
          blocks: [
            {
              kind: 'code',
              lang: 'text',
              body: `                | dòng ghi (small/full) | thời gian | chi phí đọc  | giữ lịch sử | chạy trên file bất biến | hợp khi…
append + view   | 577.673 / 11.553.524  |           | dedupe mỗi lần| đầy đủ      | được                    | event bất biến, cần audit
upsert          | 575.494 / 11.509.661  |           | không        | mất         | không                   | thực thể đổi được, trong DB
refresh         | ~2,98M / ~59,6M       |           | không        | mất         | ĐƯỢC — cách duy nhất    | file lake, độ trễ có giới hạn`,
            },
            {
              kind: 'why',
              body: bi(
                'The lab\'s answer: keep the append log as the durable source, serve core.orders by partition refresh from it — A07\'s transaction, now with the correct [D−7, D] window. A09 makes readers safe during the rewrite; A15 shows dbt shipping this exact strategy as three lines of config.',
                'Câu trả lời của lab: giữ append log làm nguồn bền vững, rồi phục vụ bảng core.orders bằng cách refresh partition từ log đó — vẫn là transaction của A07, nhưng giờ với cửa sổ D trừ 7 tới D cho đúng. A09 sẽ lo an toàn cho người đọc trong lúc ghi lại; A15 cho thấy dbt đóng gói đúng chiến lược này thành ba dòng cấu hình.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('The table is filled with your measured numbers', 'Bảng đã được điền bằng số đo thật của bạn'),
        bi('All three strategies agree at full scale', 'Cả ba chiến lược khớp nhau ở scale full'),
        bi('Your journal has a defended recommendation', 'Journal của bạn có một đề xuất kèm lập luận bảo vệ'),
      ],
    },

    {
      id: 'a08-verify',
      title: bi('Verify yourself', 'Tự kiểm chứng'),
      goal: bi('Exact numbers at both scales.', 'Các con số chính xác ở cả hai scale.'),
      steps: [
        {
          title: bi('The checkpoints', 'Các mốc kiểm tra'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `-- 1. Cửa sổ, theo manifest (small): rows=577673, late=7750, dups=284
SELECT sum(rows), sum(late_rows), sum(dup_rows)
FROM read_json_auto('<DATA_ROOT>/small/raw/manifest/orders_*.json')
WHERE CAST(date AS DATE) BETWEEN DATE '2026-06-01' AND DATE '2026-06-10';

-- 2. Ba chiến lược đồng thuận (small): 569639 | 569639 | 569639, mọi diff bằng 0
SELECT (SELECT count(*) FROM core.orders_latest),
       (SELECT count(*) FROM core.orders_upsert),
       (SELECT count(*) FROM core.orders_refresh);

-- 3. Đơn hàng được truy vết (small) — lịch sử sắp theo updated_at:
SELECT _data_date, status, order_total, updated_at
FROM core.orders_log WHERE order_id = 1510000111 ORDER BY updated_at;
-- Trạng thái cuối ở cả ba chiến lược: refunded / 230.65 / 2026-06-06 07:53:51`,
            },
            {
              kind: 'expect',
              body: bi(
                'Full-scale checkpoints: window sums are 11,553,524 rows / 155,088 late / 5,773 dups; the three-way agreement count is 11,392,663, with 153,678 order_ids (1.35%) seen in more than one file. If your full-scale log count disagrees with query 1, a day failed to load — find it via GROUP BY _data_date before touching anything else.',
                'Mốc kiểm tra ở scale full: tổng của cửa sổ là 11.553.524 dòng, 155.088 dòng trễ, 5.773 bản trùng; con số đồng thuận của ba chiến lược là 11.392.663, với 153.678 order_id, tức 1,35%, xuất hiện ở nhiều hơn một file. Nếu số dòng log ở scale full lệch với truy vấn số 1 thì có một ngày load hỏng — tìm nó bằng GROUP BY _data_date trước khi đụng vào bất cứ thứ gì khác.',
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
      id: 'a08-mistakes',
      title: bi('Common beginner mistakes', 'Lỗi thường gặp của người mới'),
      goal: bi('Six traps; the first two you proved yourself.', 'Sáu cái bẫy; hai cái đầu bạn đã tự tay chứng minh.'),
      steps: [
        {
          title: bi('The six', 'Sáu lỗi'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'Refreshing only [D, D]. Late rows live in earlier partitions. Delete-window ≠ insert-window ≠ contract allowance is the classic silent-staleness bug — you proved it yourself in Task 6, and the count only moved by 1. Its subtler cousin: deduping only the rows INSIDE the window — winners are chosen globally or not at all.',
                'Chỉ refresh cửa sổ D tới D. Các dòng về trễ nằm ở partition cũ hơn. Cửa sổ xoá khác cửa sổ insert khác mức trễ contract cho phép — đó là bug cũ-dữ-liệu-trong-im-lặng kinh điển, và bạn đã tự chứng minh ở Task 6 với số dòng chỉ nhích đúng 1. Người anh em tinh vi hơn của nó là chỉ dedupe những dòng nằm trong cửa sổ: bản thắng phải được chọn trên toàn cục, không thì thôi.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Skipping the source dedupe before MERGE. Duplicate keys in the source do not error in DuckDB — one version wins arbitrarily and the run still reports success.',
                'Bỏ qua bước dedupe nguồn trước khi MERGE. Key trùng ở phía nguồn không làm DuckDB báo lỗi — một phiên bản thắng một cách tuỳ tiện, mà lần chạy vẫn báo thành công.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Dropping the s.updated_at > t.updated_at guard. "Matched means update" feels obvious and is wrong: on this window an unguarded MERGE ends with ~1,860 silently stale rows — last-file-wins instead of latest-version-wins. Only the content diff catches it.',
                'Bỏ điều kiện chặn s.updated_at lớn hơn t.updated_at. Cái ý nghĩ "khớp key thì update" nghe rất hiển nhiên mà lại sai: trên cửa sổ này, một lệnh MERGE không chặn sẽ để lại khoảng 1.860 dòng cũ trong im lặng, thành ra file về sau thắng chứ không phải phiên bản mới nhất thắng. Chỉ có diff nội dung mới bắt được.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'A nullable partition key. Rows with NULL order_date are invisible to BETWEEN-windows: never deleted, never re-inserted. COALESCE to the file date. A07 coalesced to the updated_at date instead — also a valid non-NULL choice; today we use the file\'s date so a row\'s partition is knowable from the file alone. Either works; pick one and keep it.',
                'Để khoá partition có thể NULL. Những dòng có order_date NULL thì vô hình với các cửa sổ BETWEEN: không bao giờ bị xoá, cũng không bao giờ được insert lại. Hãy COALESCE về ngày của file. A07 thì COALESCE về ngày của updated_at — cũng là một lựa chọn khác NULL hợp lệ; hôm nay ta dùng ngày của file để chỉ cần nhìn file là biết dòng đó thuộc partition nào. Cách nào cũng được; chọn một cái rồi giữ nguyên.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'DELETE and INSERT outside one transaction. A crash in between leaves partitions empty, and readers mid-refresh see a hole. BEGIN/COMMIT costs one line.',
                'Để DELETE và INSERT nằm ngoài một transaction. Một lần crash ở giữa sẽ để lại partition rỗng, và người đọc đúng lúc refresh sẽ thấy một lỗ hổng. Cặp BEGIN và COMMIT chỉ tốn một dòng.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Reconciling by counts alone. Two tables with equal counts can disagree on thousands of rows. EXCEPT in both directions, always.',
                'Reconcile chỉ bằng số đếm. Hai bảng bằng nhau về số dòng vẫn có thể lệch nhau hàng nghìn dòng. Luôn chạy EXCEPT theo cả hai chiều.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Đọc qua một lượt trước khi bắt đầu Task 5')],
    },

    {
      id: 'a08-stretch',
      title: bi('Stretch goals', 'Bài mở rộng'),
      goal: bi('Four optional exercises; the last one audits a promise nothing has tested.', 'Bốn bài tự chọn; bài cuối kiểm tra một cam kết mà chưa check nào đụng tới.'),
      steps: [
        {
          title: bi('1 — Out-of-order arrival', '1 — File về không đúng thứ tự'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Shuffle DATES and rerun Tasks 2–5. Which strategies still converge to the same final state, and why? (The MERGE guard earns its keep; for refresh, think about what its window must cover — then check whether it did.)',
                'Xáo trộn danh sách DATES rồi chạy lại Task 2 tới 5. Chiến lược nào vẫn hội tụ về cùng trạng thái cuối, và vì sao? Điều kiện chặn của MERGE sẽ chứng tỏ giá trị của nó; còn với refresh, hãy nghĩ xem cửa sổ của nó phải phủ những gì, rồi kiểm tra xem nó có phủ thật không.',
              ),
            },
          ],
        },
        {
          title: bi('2 — Instant SCD2', '2 — Dựng SCD2 ngay lập tức'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'From the log alone, build core.orders_history with valid_from / valid_to / is_current columns using lead(updated_at) OVER (PARTITION BY order_id ORDER BY updated_at) — the append log makes "slowly changing dimension" history a query, not a pipeline.',
                'Chỉ từ log thôi, dựng bảng core.orders_history với các cột valid_from, valid_to và is_current bằng hàm lead(updated_at) OVER (PARTITION BY order_id ORDER BY updated_at). Append log biến lịch sử kiểu slowly changing dimension thành một câu query chứ không phải cả một pipeline.',
              ),
            },
          ],
        },
        {
          title: bi('3 — MERGE growth curve', '3 — Đường cong tăng trưởng của MERGE'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Time each day\'s MERGE separately at full scale and plot the trend as the target grows. Extrapolate to a year of data — and note your reasoning for A14, where you will learn to verify it with EXPLAIN ANALYZE.',
                'Đo thời gian MERGE của từng ngày riêng ở scale full rồi vẽ xu hướng khi bảng đích lớn dần. Ngoại suy ra một năm dữ liệu, và ghi lại lập luận của bạn cho A14, lúc đó bạn sẽ học cách kiểm chứng nó bằng EXPLAIN ANALYZE.',
              ),
            },
          ],
        },
        {
          title: bi('4 — Audit the one untested promise', '4 — Kiểm tra cam kết duy nhất chưa ai đụng tới'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'The contract\'s business_rules.status_transitions clause says corrections only ever move an order\'s status FORWARD — and it is the one contract block no check has exercised yet. Your append log is the perfect witness: order each order\'s versions by updated_at using lag(status) OVER (…), map statuses to their lifecycle rank, and count backward moves. Expect 0; if you find any, that is an incident note to shopcore citing the clause.',
                'Điều khoản business_rules.status_transitions trong contract nói rằng bản sửa chỉ đẩy status của đơn hàng tiến về phía trước, và đó là block duy nhất trong contract mà chưa check nào chạm tới. Append log của bạn là nhân chứng hoàn hảo: sắp các phiên bản của từng đơn theo updated_at bằng hàm lag(status) OVER, ánh xạ các status sang thứ hạng trong vòng đời, rồi đếm số lần lùi. Kỳ vọng là 0; nếu tìm thấy cái nào thì đó là một incident note gửi shopcore kèm trích dẫn điều khoản.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'A per-day check like A05\'s cannot see this — only a cross-file view can, which is exactly why append logs earn their storage.',
                'Một phép check theo từng ngày kiểu A05 thì không thấy được chuyện này. Chỉ có góc nhìn xuyên nhiều file mới thấy, và đó chính là lý do append log xứng đáng với chỗ lưu trữ mà nó chiếm.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Hoàn thành ít nhất một mục và ghi kết luận vào journal')],
    },
  ],
}