import type { TheorySection, Term } from '../types'
import { bi } from '../types'

export const a08Theory: TheorySection[] = [
  /* ─────────── TẦNG 1 ─────────── */
  {
    level: 'problem',
    heading: bi(
      'Yesterday\'s facts refuse to stay still',
      'Chuyện của hôm qua không chịu nằm yên',
    ),
    paras: [
      bi(
        'Every pipeline must answer one question: when new data arrives, HOW does it enter the table? If yesterday\'s facts never changed, you could just append forever and go home.',
        'Mọi pipeline đều phải trả lời một câu: khi dữ liệu mới về, nó vào bảng bằng cách nào? Nếu chuyện của hôm qua không bao giờ đổi thì bạn cứ append mãi rồi về nhà là xong.',
      ),
      bi(
        'But this feed — like almost every real feed — sends CORRECTIONS. Today\'s file quietly contains new versions of orders from up to a week ago: same order_id, advanced status, sometimes a changed total, and a fresh updated_at. About 1.5% of every file is this.',
        'Nhưng feed này, và gần như mọi feed thật, đều gửi kèm bản sửa. File hôm nay lặng lẽ chứa phiên bản mới của những đơn hàng từ cả tuần trước: cùng order_id, status đã tiến thêm một bước, đôi khi tổng tiền đổi, và một updated_at mới. Khoảng 1,5% mỗi file là thứ đó.',
      ),
      bi(
        'Pick the wrong load strategy and your warehouse either double-counts orders or silently shows stale statuses. Both failures are quiet — nothing errors, and the number on the dashboard just happens to be wrong.',
        'Chọn nhầm chiến lược load thì warehouse của bạn hoặc đếm trùng đơn hàng, hoặc lặng lẽ hiển thị status đã cũ. Cả hai kiểu hỏng đều im lặng: không lỗi nào báo, chỉ là con số trên dashboard tình cờ sai.',
      ),
    ],
    checks: [
      {
        q: bi(
          'A correction arrives whose updated_at is OLDER than the version you already have. What should happen?',
          'Một bản sửa về, mà updated_at của nó lại cũ hơn phiên bản bạn đang có. Nên xử lý thế nào?',
        ),
        a: bi(
          'It must lose. The rule is "latest updated_at wins", not "latest file wins" — updated_at is the version authority, and file arrival order means nothing. This feed really does send such rows; you meet one face to face in Task 7.',
          'Nó phải thua. Quy tắc là bản có updated_at mới nhất thắng, chứ không phải bản về sau thắng. updated_at mới là thứ quyết định phiên bản nào là hiện hành, còn thứ tự file về thì chẳng có ý nghĩa gì. Feed này gửi những dòng như vậy thật, và ở Task 7 bạn sẽ gặp một cái tận mắt.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 2 ─────────── */
  {
    level: 'alternatives',
    heading: bi(
      'Three answers the industry has, and the fourth that does not work',
      'Ba câu trả lời của ngành, và cái thứ tư không dùng được',
    ),
    paras: [
      bi(
        'These are not four options among many — the first three are THE three answers, and every tool you will ever meet, dbt included, is a wrapper around one of them.',
        'Đây không phải bốn phương án trong vô số phương án. Ba cái đầu chính là ba câu trả lời của ngành, và mọi công cụ bạn từng gặp, kể cả dbt, đều chỉ là lớp vỏ bọc quanh một trong ba.',
      ),
    ],
    alternatives: [
      {
        name: bi('Just append, and hope nothing changes', 'Cứ append, và mong đừng có gì đổi'),
        appeal: bi(
          'Cheapest possible write, no lookups, no deletes. And for an event log — clicks, page views — it is actually correct.',
          'Cách ghi rẻ nhất có thể: không tra cứu, không xoá gì. Mà với một event log kiểu click hay lượt xem trang thì nó đúng thật.',
        ),
        breaks: bi(
          'Not here. This feed sends corrections, so appending alone leaves you with several versions of the same order and no rule for picking one. Every downstream query would have to invent its own tiebreak — and they would not all invent the same one.',
          'Nhưng không đúng ở đây. Feed này gửi bản sửa, nên chỉ append thôi thì bạn có nhiều phiên bản của cùng một đơn hàng mà không có quy tắc nào chọn ra một. Mọi query phía sau sẽ phải tự nghĩ ra cách chọn, và chúng sẽ không nghĩ ra giống nhau đâu.',
        ),
      },
      {
        name: bi('Strategy A — append-only log + dedupe-on-read view', 'Chiến lược A — append-only log kèm view dedupe lúc đọc'),
        appeal: bi(
          'Never update, never delete: every row from every file goes into one ever-growing table, and a view picks the winner per order_id with a window function. Writes are as cheap as writes get, and you keep the full history of every correction — an audit trail for free.',
          'Không bao giờ update, không bao giờ xoá: mọi dòng từ mọi file đổ vào một bảng lớn dần, rồi một view dùng window function chọn ra bản thắng cho từng order_id. Ghi thì rẻ hết mức, mà bạn giữ được toàn bộ lịch sử của mọi bản sửa — coi như có audit trail miễn phí.',
        ),
        breaks: bi(
          'The cost moves to the readers: every single query pays the dedupe. At full scale that is about a second per read, forever, for everyone. This is how event logs and "bronze" layers work — and it is a fine choice, as long as you know who is paying.',
          'Cái giá chuyển sang phía người đọc: mọi query đều phải trả tiền cho phép dedupe. Ở scale full là khoảng một giây mỗi lần đọc, mãi mãi, với mọi người. Đây là cách các event log và tầng bronze vận hành, và nó là lựa chọn tốt — miễn là bạn biết ai đang trả cái giá đó.',
        ),
      },
      {
        name: bi('Strategy B — upsert with MERGE', 'Chiến lược B — upsert bằng MERGE'),
        appeal: bi(
          'Upsert = UPdate the row if the key exists, inSERT it if not — one statement. The table always holds exactly one current row per order, so reads are cheap and simple. The classic warehouse pattern for mutable entities.',
          'Upsert là ghép của update và insert: có key rồi thì update, chưa có thì insert, gói trong một câu lệnh. Bảng luôn giữ đúng một dòng hiện hành cho mỗi đơn, nên đọc vừa rẻ vừa đơn giản. Đây là khuôn kinh điển của warehouse cho các thực thể thay đổi được.',
        ),
        breaks: bi(
          'History is gone — the old version is overwritten and nobody can ever ask "when did we learn this order was refunded?". And it needs storage that can update in place: a database, not a folder of files. Point it at a Parquet lake and it simply cannot run.',
          'Lịch sử mất sạch: phiên bản cũ bị ghi đè, và sau này không ai hỏi được "chúng ta biết đơn này bị hoàn tiền từ lúc nào?". Ngoài ra nó cần loại lưu trữ update tại chỗ được, tức là database chứ không phải một thư mục đầy file. Chĩa nó vào một Parquet lake thì đơn giản là chạy không được.',
        ),
      },
      {
        name: bi('Strategy C — partition refresh (delete+insert by date)', 'Chiến lược C — refresh cả partition, tức delete rồi insert theo ngày'),
        appeal: bi(
          'Do not touch individual rows at all: recompute WHOLE date partitions. When file D arrives, delete everything with order_date between D−7 and D, then re-insert those dates fresh from all data received so far. Blunt, simple, and beautifully idempotent.',
          'Không đụng tới từng dòng: tính lại nguyên cả partition theo ngày. File D về thì xoá hết những dòng có order_date từ D trừ 7 tới D, rồi insert lại mấy ngày đó từ toàn bộ dữ liệu đã nhận. Thô, đơn giản, và idempotent một cách rất đẹp.',
        ),
        breaks: bi(
          'The price is bulk I/O: you rewrite roughly 8 days of data to load 1. But it is the ONLY strategy that works when your storage is immutable files — you cannot update a row inside a Parquet file, you can only rewrite the file. That is why it wins for file lakes.',
          'Cái giá là I/O hàng loạt: ghi lại khoảng 8 ngày dữ liệu chỉ để nạp 1 ngày. Nhưng nó là chiến lược duy nhất chạy được khi kho của bạn là các file bất biến — bạn không sửa được một dòng bên trong file Parquet, chỉ ghi lại cả file thôi. Đó là lý do nó thắng ở các file lake.',
        ),
      },
    ],
    checks: [
      {
        q: bi(
          'Why D−7? Where does the number come from?',
          'Vì sao lại là D trừ 7? Con số đó ở đâu ra?',
        ),
        a: bi(
          'From the A06 contract: the late_corrections clause promises corrections arrive at most 7 days late. The refresh window must cover every partition where any version of an incoming order can live — and the contract is what makes that window sound. Without a written allowance you would be guessing.',
          'Từ contract ở A06: điều khoản late_corrections cam kết bản sửa về trễ tối đa 7 ngày. Cửa sổ refresh phải phủ hết mọi partition mà một phiên bản của đơn hàng đang về có thể nằm trong đó, và chính contract là thứ làm cho cửa sổ ấy có căn cứ. Không có cam kết bằng văn bản thì bạn chỉ đang đoán.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 3 ─────────── */
  {
    level: 'idea',
    heading: bi(
      'One truth, three ways to reach it',
      'Một sự thật, ba đường đi tới',
    ),
    paras: [
      bi(
        'All three strategies, run over the same files, must produce IDENTICAL current state. If they do not, at least one is wrong. Proving that agreement is the centerpiece of this assignment — not building any single one of them.',
        'Cả ba chiến lược, chạy trên cùng bộ file, phải cho ra trạng thái hiện hành giống hệt nhau. Nếu khác nhau thì ít nhất một cái sai. Chứng minh được sự đồng thuận đó mới là trọng tâm của bài này, chứ không phải dựng xong một chiến lược nào cả.',
      ),
      bi(
        'The business rule underneath all three is one sentence: for each order_id, the version with the latest updated_at wins. updated_at is the VERSION AUTHORITY — the column that decides which copy of a row is current. Not file order, not arrival time, not the row you saw last.',
        'Quy tắc nghiệp vụ nằm dưới cả ba gói gọn trong một câu: với mỗi order_id, phiên bản có updated_at mới nhất thắng. Cột updated_at chính là thứ có thẩm quyền quyết định phiên bản nào là hiện hành. Không phải thứ tự file, không phải thời điểm về, cũng không phải dòng bạn nhìn thấy sau cùng.',
      ),
      bi(
        'And the two grains are not the same table wearing different clothes. The log is "one row = one delivered VERSION of an order"; the view is "one row = one ORDER, its newest version". That is exactly why they are two objects and not one, and why the same window is 577,673 rows in the first and 569,639 in the second.',
        'Và hai cái grain ở đây không phải cùng một bảng mặc áo khác nhau. Log là "một dòng bằng một phiên bản đơn hàng đã được giao", còn view là "một dòng bằng một đơn hàng, ở phiên bản mới nhất". Chính vì vậy chúng là hai đối tượng chứ không phải một, và cũng vì vậy cùng một cửa sổ 10 ngày cho ra 577.673 dòng ở cái đầu và 569.639 ở cái sau.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Two strategies both return 569,639 rows. Are they in agreement?',
          'Hai chiến lược cùng trả về 569.639 dòng. Vậy chúng đã đồng thuận chưa?',
        ),
        a: bi(
          'Not proven. Two tables with equal counts can disagree on thousands of rows. Task 6 has you run a deliberately wrong window whose count comes out 569,640 — off by one, a number nobody would notice — while 5,824 rows are actually wrong. Counting is not reconciliation; diff the content, both directions.',
          'Chưa chứng minh được gì. Hai bảng bằng nhau về số dòng vẫn có thể lệch nhau hàng nghìn dòng. Task 6 bắt bạn chạy một cửa sổ sai có chủ đích, và số dòng ra 569.640 — lệch đúng một, con số chẳng ai để ý — trong khi thật ra có 5.824 dòng sai. Đếm không phải là reconcile; phải diff nội dung, và diff cả hai chiều.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 4 ─────────── */
  {
    level: 'mechanism',
    heading: bi(
      'What makes each one correct',
      'Điều gì làm cho từng cái chạy đúng',
    ),
    paras: [
      bi(
        'Strategy A leans on one window function: number the versions of each order, newest updated_at first, keep row 1. The second sort key is a TIE-BREAKER — if two versions ever carried the same updated_at, "earliest file wins" makes the choice deterministic. Not hypothetical: at full scale this window contains exactly one real tie, with two different totals.',
        'Chiến lược A dựa vào đúng một window function: đánh số các phiên bản của mỗi đơn, updated_at mới nhất đứng trước, rồi giữ dòng số 1. Khoá sắp xếp thứ hai đóng vai trò phá thế hoà — nếu hai phiên bản có cùng updated_at thì quy tắc "file về trước thắng" khiến lựa chọn trở nên tất định. Đây không phải chuyện giả định: ở scale full, cửa sổ này có đúng một thế hoà thật, với hai tổng tiền khác nhau.',
      ),
      bi(
        'Strategy B needs two rules, and both are easy to forget. Rule 1: one row per key in the source. The feed has in-file duplicates, and if the source has two rows for one order_id, DuckDB\'s MERGE does NOT error — it silently applies an arbitrary one. So dedupe each day in staging first. Rule 2: guard the update with s.updated_at > t.updated_at, or a stale correction will clobber a newer row.',
        'Chiến lược B cần hai quy tắc, mà cả hai đều dễ quên. Quy tắc một: mỗi key chỉ một dòng ở phía nguồn. Feed này có bản trùng ngay trong file, và nếu nguồn có hai dòng cho cùng một order_id thì MERGE của DuckDB không báo lỗi — nó lặng lẽ chọn bừa một dòng. Nên phải dedupe từng ngày ở staging trước. Quy tắc hai: chặn phép update bằng điều kiện s.updated_at > t.updated_at, nếu không một bản sửa cũ sẽ đè lên dòng mới hơn.',
      ),
      bi(
        'Strategy C hides its trap in the shape of one query: dedupe over the WHOLE as-of log first, THEN keep winners inside the window. Choose winners globally, place them locally. The tempting "optimization" of filtering to the window before deduping is subtly wrong — an order\'s true winner can live outside the window, and window-local dedupe would resurrect a stale version.',
        'Chiến lược C giấu cái bẫy của nó ngay trong hình dạng của một câu query: phải dedupe trên toàn bộ log tính tới ngày D trước, rồi mới giữ lại những bản thắng nằm trong cửa sổ. Chọn bản thắng trên toàn cục, đặt chúng vào vị trí cục bộ. Cái "tối ưu" nghe rất hợp lý là lọc về cửa sổ trước rồi mới dedupe thì lại sai một cách rất tinh vi: bản thắng thật của một đơn có thể nằm ngoài cửa sổ, và dedupe cục bộ sẽ làm sống lại một phiên bản đã cũ.',
      ),
      bi(
        'The nasty part: at small scale both shapes agree perfectly — at full scale the wrong shape ends with 7 duplicated orders. Develop on small, but never certify on small.',
        'Chỗ khó chịu là: ở scale small hai cách viết cho kết quả giống hệt nhau, còn ở scale full thì cách sai để lại 7 đơn hàng bị trùng. Phát triển trên small được, nhưng đừng bao giờ nghiệm thu trên small.',
      ),
    ],
    checks: [
      {
        q: bi(
          'You drop the s.updated_at > t.updated_at guard from MERGE. What breaks, and would you notice?',
          'Bạn bỏ điều kiện chặn s.updated_at > t.updated_at trong MERGE. Cái gì hỏng, và bạn có nhận ra không?',
        ),
        a: bi(
          '"Matched means update" feels obvious and is wrong. On this window an unguarded MERGE ends with about 1,860 silently stale rows — last-file-wins instead of latest-version-wins. The row count is unchanged, so only a content diff catches it.',
          'Cái ý nghĩ "khớp key thì update" nghe rất hiển nhiên mà lại sai. Trên cửa sổ này, một lệnh MERGE không có điều kiện chặn sẽ để lại khoảng 1.860 dòng cũ trong im lặng — thành ra file về sau thắng chứ không phải phiên bản mới nhất thắng. Số dòng không đổi, nên chỉ có diff nội dung mới bắt được.',
        ),
      },
      {
        q: bi(
          'Why must the partition key never be NULL?',
          'Vì sao khoá partition không bao giờ được là NULL?',
        ),
        a: bi(
          'Because a NULL-dated row can never be matched by WHERE order_date BETWEEN … — never deleted, never re-inserted. Strategy C would silently lose it forever. About 0.02% of rows have impossible timestamps that clean to NULL, so order_date needs a COALESCE fallback to the file\'s date.',
          'Vì một dòng có ngày NULL thì không bao giờ khớp được điều kiện WHERE order_date BETWEEN — không bao giờ bị xoá, cũng không bao giờ được insert lại. Chiến lược C sẽ lặng lẽ đánh mất nó vĩnh viễn. Khoảng 0,02% số dòng có timestamp bất khả thi và sau khi làm sạch thì thành NULL, nên order_date cần một COALESCE lùi về ngày của file.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 5 ─────────── */
  {
    level: 'detail',
    heading: bi(
      'The asymmetry, the rerun caveat, and what to actually adopt',
      'Sự bất cân xứng, cái bẫy khi chạy lại, và cuối cùng nên chọn cái nào',
    ),
    paras: [
      bi(
        'The write asymmetry is not a bug, it is the deal. Strategy C receives 577k rows and writes about 2.98M — five times what arrived. At full scale that is 60M rows written to deliver 11.6M. You pay in bulk I/O and get simplicity and file-compatibility back.',
        'Chuyện ghi nhiều gấp mấy lần không phải lỗi, đó là điều kiện trao đổi. Chiến lược C nhận vào 577 nghìn dòng và ghi ra khoảng 2,98 triệu — gấp năm lần lượng nhận. Ở scale full là 60 triệu dòng ghi ra để giao 11,6 triệu. Bạn trả bằng I/O hàng loạt và đổi lại được sự đơn giản cùng khả năng chạy trên file.',
      ),
      bi(
        'One caveat worth journaling: re-running the NEWEST day is perfectly idempotent, but re-running an OLDER day D rewinds [D−7, D] to its as-of-D state — corrections that arrived after D are removed until you replay D+1 onward. A refresh rerun is a mini backfill: restart from D and roll forward.',
        'Có một cái bẫy đáng ghi vào journal: chạy lại ngày mới nhất thì idempotent hoàn hảo, nhưng chạy lại một ngày D cũ hơn sẽ tua cửa sổ D trừ 7 tới D về đúng trạng thái của thời điểm D — mọi bản sửa về sau ngày D đều biến mất, cho tới khi bạn chạy lại từ D cộng 1 trở đi. Chạy lại một lần refresh thực chất là một lần backfill thu nhỏ: khởi động lại từ D rồi cuốn tới.',
      ),
      bi(
        'And the as-of condition inside the refresh insert is easy to misread. Your log already holds all 10 files, but on day D the pipeline had only seen files up to D — the _data_date <= D filter replays history honestly. In a live pipeline it holds automatically; here you have to write it, because you are simulating the past.',
        'Còn điều kiện tính-tới-ngày trong câu insert của refresh thì rất dễ đọc nhầm. Log của bạn đã chứa sẵn cả 10 file, nhưng vào ngày D thì pipeline mới chỉ nhìn thấy các file tính tới D — bộ lọc _data_date nhỏ hơn hoặc bằng D là để tái hiện lịch sử một cách trung thực. Trong pipeline chạy thật thì điều đó tự đúng; ở đây bạn phải tự viết ra, vì bạn đang mô phỏng lại quá khứ.',
      ),
      bi(
        'What to adopt? The lab\'s answer: keep the append log as the durable source — it is the only thing that can answer "when did we learn this?" — and serve core.orders by partition refresh from it. That gives you history AND cheap reads, at the cost of the bulk rewrite.',
        'Vậy cuối cùng nên chọn gì? Câu trả lời của lab: giữ append log làm nguồn bền vững, vì nó là thứ duy nhất trả lời được câu "chúng ta biết chuyện này từ lúc nào", rồi phục vụ bảng core.orders bằng cách refresh partition từ log đó. Cách này cho bạn cả lịch sử lẫn việc đọc rẻ, đổi lại phải chịu chi phí ghi lại hàng loạt.',
      ),
      bi(
        'This is not the end of the story. A09 fixes what readers see DURING a refresh — right now there is a window where the table is half-rewritten. A11 replays this per-day pipeline over history. And A15 shows dbt shipping this exact strategy as three lines of config: its delete+insert incremental strategy is literally Strategy C.',
        'Câu chuyện chưa dừng ở đây. A09 sẽ xử lý chuyện người đọc nhìn thấy gì trong lúc refresh đang chạy — hiện tại vẫn có một khoảng thời gian bảng bị ghi lại dở dang. A11 sẽ chạy lại pipeline theo ngày này trên toàn bộ lịch sử. Còn A15 cho thấy dbt đóng gói đúng chiến lược này thành ba dòng cấu hình: incremental strategy kiểu delete rồi insert của nó chính là chiến lược C.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Your refresh loop used window [D, D] instead of [D−7, D]. The count came out 569,640 instead of 569,639. Is that close enough?',
          'Vòng lặp refresh của bạn dùng cửa sổ D tới D thay vì D trừ 7 tới D. Số dòng ra 569.640 thay vì 569.639. Vậy có coi là gần đúng được không?',
        ),
        a: bi(
          'No — 5,824 rows are wrong. Every order whose current version is a correction is stuck at its stale original, because the correction landed in an earlier partition that the narrow window never touched. The count barely moved, which is exactly what makes this bug survive to production.',
          'Không — có 5.824 dòng sai. Mọi đơn hàng mà phiên bản hiện hành là một bản sửa đều bị kẹt ở bản gốc đã cũ, vì bản sửa rơi vào một partition cũ hơn mà cửa sổ hẹp không hề chạm tới. Số dòng gần như không nhúc nhích, và chính điều đó khiến bug này sống sót được tới môi trường thật.',
        ),
      },
    ],
  },
]

export const a08Terms: Term[] = [
  {
    term: 'Late-arriving correction',
    gloss: 'bản sửa về trễ',
    means: bi(
      'A new version of an order first seen on an earlier day: same order_id, advanced status, fresh updated_at. About 1.5% of every file. The contract allows up to 7 days late.',
      'Một phiên bản mới của đơn hàng đã xuất hiện ở ngày trước đó: cùng order_id, status tiến thêm, updated_at mới. Chiếm khoảng 1,5% mỗi file. Contract cho phép trễ tối đa 7 ngày.',
    ),
    source: {
      name: 'Apache Flink — event time',
      url: 'https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/',
    },
  },
  {
    term: 'Version authority',
    gloss: 'cột quyết định phiên bản hiện hành',
    means: bi(
      'The column that decides which copy of a row is current. Here it is updated_at — NOT file order, not arrival time. A correction with an older updated_at must lose even though it arrived later.',
      'Cột quyết định bản nào của một dòng là hiện hành. Ở đây là updated_at, chứ không phải thứ tự file hay thời điểm về. Một bản sửa có updated_at cũ hơn thì phải thua, dù nó về sau.',
    ),
    source: {
      name: 'dbt — Snapshots',
      url: 'https://docs.getdbt.com/docs/build/snapshots',
    },
  },
  {
    term: 'Append-only log',
    gloss: 'log chỉ ghi thêm',
    means: bi(
      'Never update, never delete — every row from every file lands in one growing table. Cheapest writes, full history, but every read pays for the dedupe.',
      'Không update, không xoá — mọi dòng từ mọi file đổ vào một bảng lớn dần. Ghi rẻ nhất, giữ đủ lịch sử, nhưng mọi lần đọc đều phải trả tiền cho phép dedupe.',
    ),
    source: {
      name: 'dbt — How we structure our projects',
      url: 'https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview',
    },
  },
  {
    term: 'Dedupe-on-read',
    gloss: 'khử trùng lúc đọc',
    means: bi(
      'A view that picks each key\'s winner with row_number() OVER (PARTITION BY key ORDER BY version DESC). Moves the cost from write time to read time — for every reader, forever.',
      'Một view chọn ra bản thắng cho từng key bằng row_number() OVER (PARTITION BY key ORDER BY phiên bản DESC). Nó chuyển chi phí từ lúc ghi sang lúc đọc, và mọi người đọc đều phải chịu, mãi mãi.',
    ),
    source: {
      name: 'DuckDB — Window functions',
      url: 'https://duckdb.org/docs/sql/functions/window_functions',
    },
  },
  {
    term: 'Upsert / MERGE',
    gloss: 'có thì update, chưa có thì insert',
    means: bi(
      'One statement that updates a matched key and inserts an unmatched one. Needs a deduped source and a version guard, and needs storage that can update in place.',
      'Một câu lệnh vừa update khi key đã có, vừa insert khi chưa có. Cần nguồn đã dedupe sẵn, cần điều kiện chặn theo phiên bản, và cần loại lưu trữ update tại chỗ được.',
    ),
    source: {
      name: 'DuckDB — MERGE INTO',
      url: 'https://duckdb.org/docs/sql/statements/merge_into',
    },
  },
  {
    term: 'Partition refresh',
    gloss: 'tính lại nguyên cả partition',
    means: bi(
      'Delete a date window and re-insert it from scratch. Rewrites ~8 days to load 1, but it is the only updater immutable files allow — you cannot edit a row inside a Parquet file.',
      'Xoá một cửa sổ ngày rồi insert lại từ đầu. Ghi lại khoảng 8 ngày để nạp 1 ngày, nhưng đây là cách cập nhật duy nhất mà file bất biến cho phép — bạn không sửa được một dòng bên trong file Parquet.',
    ),
    source: {
      name: 'dbt — Incremental strategies',
      url: 'https://docs.getdbt.com/docs/build/incremental-strategy',
    },
  },
  {
    term: 'Late-data allowance',
    gloss: 'mức trễ được phép',
    means: bi(
      'The contract\'s promise that corrections arrive at most N days late. It is what makes the refresh window sound — without a written allowance you are guessing how far back to rewrite.',
      'Cam kết trong contract rằng bản sửa về trễ tối đa N ngày. Chính nó làm cho cửa sổ refresh có căn cứ — không có cam kết bằng văn bản thì bạn chỉ đang đoán phải ghi lại lùi về bao xa.',
    ),
    source: {
      name: 'Apache Flink — event time',
      url: 'https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/',
    },
  },
  {
    term: 'As-of filter',
    gloss: 'lọc theo trạng thái tính tới ngày D',
    means: bi(
      '_data_date <= D, which replays history honestly: on day D the pipeline had only seen files up to D. Automatic in a live pipeline; you must write it when simulating the past.',
      'Điều kiện _data_date nhỏ hơn hoặc bằng D, để tái hiện lịch sử trung thực: vào ngày D thì pipeline mới chỉ thấy các file tính tới D. Trong pipeline chạy thật thì nó tự đúng; khi mô phỏng quá khứ thì bạn phải tự viết.',
    ),
    source: {
      name: 'dbt — Snapshots',
      url: 'https://docs.getdbt.com/docs/build/snapshots',
    },
  },
  {
    term: 'Choose globally, place locally',
    gloss: 'chọn bản thắng toàn cục, đặt vào cục bộ',
    means: bi(
      'Dedupe over the whole as-of log first, THEN keep winners inside the refresh window. Filtering to the window before deduping resurrects stale versions — and small scale will not catch it.',
      'Dedupe trên toàn bộ log tính tới ngày D trước, rồi mới giữ lại các bản thắng nằm trong cửa sổ refresh. Lọc về cửa sổ rồi mới dedupe sẽ làm sống lại các phiên bản cũ — mà chạy ở scale small thì không phát hiện ra.',
    ),
    source: {
      name: 'DuckDB — Window functions',
      url: 'https://duckdb.org/docs/sql/functions/window_functions',
    },
  },
  {
    term: 'Content diff (EXCEPT both ways)',
    gloss: 'diff nội dung, cả hai chiều',
    means: bi(
      'Two tables with equal counts can disagree on thousands of rows. Reconciliation means EXCEPT in both directions, not count comparison.',
      'Hai bảng bằng nhau về số dòng vẫn có thể lệch nhau hàng nghìn dòng. Reconcile nghĩa là chạy EXCEPT theo cả hai chiều, chứ không phải so số đếm.',
    ),
    source: {
      name: 'DuckDB — Set operations',
      url: 'https://duckdb.org/docs/sql/query_syntax/setops',
    },
  },
]