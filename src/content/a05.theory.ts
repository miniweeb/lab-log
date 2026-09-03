import type { TheorySection, Term } from '../types'
import { bi } from '../types'

export const a05Theory: TheorySection[] = [
  /* ─────────── TẦNG 1 ─────────── */
  {
    level: 'problem',
    heading: bi('Some dirt has no fix', 'Có những thứ bẩn không có cách sửa'),
    paras: [
      bi(
        'In A03 you fixed the dirt that CAN be fixed. Today you deal with what cannot: an order with no total, a customer id that exists in no dimension, a total that contradicts its own line items. No amount of formatting turns "unknown" into a valid status.',
        'Ở A03 bạn đã sửa những thứ bẩn CÓ THỂ sửa. Hôm nay bạn đối mặt với những thứ không sửa được: một đơn hàng không có tổng tiền, một mã khách hàng không tồn tại trong bất kỳ dimension nào, một tổng tiền mâu thuẫn với chính các dòng hàng của nó. Không phép định dạng nào biến "unknown" thành một trạng thái hợp lệ.',
      ),
      bi(
        'The worst thing a pipeline can do with such rows is pass them through silently — wrong numbers, nobody notices for months. The second worst is to crash the whole load over 1% of bad rows.',
        'Điều tệ nhất mà một pipeline có thể làm với những dòng như vậy là cho chúng đi qua trong im lặng — con số sai, và không ai phát hiện suốt nhiều tháng. Điều tệ thứ nhì là làm sập cả lần nạp chỉ vì 1% số dòng hỏng.',
      ),
      bi(
        'And there is a failure mode neither of those covers: core can pass every check and still be three days stale — perfectly clean, silently lying to every dashboard that reads it.',
        'Và còn một kiểu hỏng mà cả hai điều trên đều không nói tới: tầng core có thể vượt qua mọi check mà vẫn cũ ba ngày — sạch sẽ hoàn hảo, và lặng lẽ nói dối mọi dashboard đang đọc nó.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Why is crashing the load over 1% bad rows almost as bad as passing them through?',
          'Vì sao làm sập cả lần nạp vì 1% dòng hỏng lại gần như tệ ngang với cho chúng đi qua?',
        ),
        a: bi(
          'Because this feed is ~97% clean by design — rejecting ~1.7% of rows every day is not an incident, it is Tuesday. A pipeline that stops on normal dirt never runs at all, and the team learns to ignore it. You would have thrown away 98% of good data to protect against 2%.',
          'Vì feed này vốn dĩ sạch khoảng 97% — loại bỏ chừng 1,7% số dòng mỗi ngày không phải sự cố, đó là chuyện thường ngày. Một pipeline dừng lại vì mức bẩn bình thường thì sẽ chẳng bao giờ chạy được, và cả team sẽ bỏ qua nó nó. Bạn đã vứt bỏ 98% dữ liệu tốt để phòng vệ trước 2%.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 2 ─────────── */
  {
    level: 'alternatives',
    heading: bi('Four ways to handle unfixable rows', 'Bốn cách xử lý những dòng không sửa được'),
    paras: [],
    alternatives: [
      {
        name: bi('Delete the bad rows', 'Xoá những dòng hỏng'),
        appeal: bi(
          'They are broken and unusable. Deleting keeps core clean and the pipeline simple.',
          'Chúng hỏng và không dùng được. Xoá đi thì core sạch và pipeline đơn giản.',
        ),
        breaks: bi(
          'A rejected row is EVIDENCE: for "why 300 more rejects than usual?", for showing the producer exactly which rows are broken, and for REPLAYING rows if a rule proves too strict. Delete them and you have destroyed your only way to answer any of those. Quarantine, do not delete.',
          'Một dòng bị reject là EVIDENCE: để trả lời câu "sao hôm nay nhiều hơn 300 dòng bị reject?", để chỉ cho producer chính xác những dòng nào hỏng, và để CHẠY LẠI những dòng đó nếu một quy tắc hoá ra quá chặt. Xoá chúng là bạn đã phá huỷ cách duy nhất để trả lời bất kỳ câu nào trong số đó. Hãy quarantine, đừng xoá.',
        ),
      },
      {
        name: bi('Fix them in the validation step', 'Sửa luôn chúng ở bước validation'),
        appeal: bi(
          'You are already looking at each row. Why not repair what you can while you are there?',
          'Dù sao bạn cũng đang xem từng dòng rồi. Sao không sửa luôn những gì sửa được?',
        ),
        breaks: bi(
          'A03 normalized REPRESENTATION — case, whitespace, number and date formats. Today you judge VALUES after that cleaning. " CARD " is not dirt, it is card in a costume, and A03 already handled it. If validation also fixes, the two layers overlap and nobody can say which one changed a value. Detect, do not fix.',
          'A03 đã normalize CÁCH BIỂU DIỄN — hoa thường, khoảng trắng, định dạng số và ngày. Hôm nay bạn đánh giá GIÁ TRỊ sau khi đã cleaning. Chuỗi " CARD " không phải rác, nó chỉ là card viết hoa và thừa khoảng trắng, và A03 đã xử lý rồi. Nếu bước validation cũng sửa thì hai tầng chồng lên nhau và không ai nói được tầng nào đã đổi một giá trị. Hãy phát hiện, đừng sửa.',
        ),
      },
      {
        name: bi('Pick your own reject thresholds', 'Tự chọn ngưỡng loại bỏ của mình'),
        appeal: bi(
          '1% feels reasonable for most rules. You know the data best; six literals in the code and you are done.',
          '1% nghe hợp lý cho hầu hết các quy tắc. Bạn hiểu dữ liệu nhất mà; ghi sáu con số vào code là xong.',
        ),
        breaks: bi(
          'A tolerance is a SHARED DECISION, not your opinion. shopcore and the warehouse team signed a contract whose quality.row_level_tolerances block states, rule by rule, exactly how much dirt is tolerated. Load those numbers, never invent them: when v1.4.0 tightens orphan_customer_id, every consumer\'s gate follows on the next run, zero code edits.',
          'Một tolerance là một QUYẾT ĐỊNH CHUNG, không phải ý kiến của bạn. shopcore và team warehouse đã ký một contract, trong đó khối quality.row_level_tolerances ghi rõ từng quy tắc được phép bẩn tới mức nào. Hãy nạp những con số đó vào, đừng bao giờ tự nghĩ ra: khi version 1.4.0 siết chặt orphan_customer_id, gate của mọi consumer tự đi theo ở lần chạy kế tiếp, không sửa một dòng code nào.',
        ),
      },
      {
        name: bi('Load first, check afterwards', 'Nạp trước, kiểm tra sau'),
        appeal: bi(
          'Simpler code: one INSERT, then run the checks over what landed. And you can check the real table instead of a temp one.',
          'Code đơn giản hơn: một lệnh INSERT, rồi chạy kiểm tra trên những gì đã vào. Và bạn kiểm tra được bảng thật thay vì một bảng tạm.',
        ),
        breaks: bi(
          'A gate that fires after loading is a smoke alarm installed after the fire. The rotten day is already in core, and "fail the day" now means manual cleanup. The order is not negotiable: count → quarantine → gate → load.',
          'Một gate kích hoạt sau khi đã nạp là chuông báo cháy lắp sau khi cháy xong. Cái ngày hỏng đã nằm trong core rồi, và "cho ngày đó trượt" giờ đồng nghĩa với dọn dẹp thủ công. Thứ tự này không thương lượng được: đếm rồi quarantine rồi chặn rồi mới nạp.',
        ),
      },
    ],
    checks: [
      {
        q: bi(
          'Duplicate order_ids appear within one file. Should they be quarantined?',
          'Có những order_id trùng nhau trong cùng một file. Có nên quarantine chúng không?',
        ),
        a: bi(
          'No. In-file duplicates are expected corrections — latest updated_at wins, and folding them is A08\'s job. Report the rate; reject nothing. A quarantine count about 30 rows above the reference usually means you made this mistake.',
          'Không. Các bản trùng trong cùng file là những bản sửa được dự kiến trước — bản có updated_at mới nhất thắng, và việc gộp chúng lại là công việc của A08. Hãy báo cáo tỉ lệ; đừng loại bỏ gì cả. Số dòng quarantine cao hơn số tham chiếu khoảng 30 dòng thường là dấu hiệu bạn đã mắc lỗi này.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 3 ─────────── */
  {
    level: 'idea',
    heading: bi('Load the good, park the bad, stop only when dirt is abnormal', 'Nạp phần tốt, giữ lại phần xấu, chỉ dừng khi mức bẩn bất thường'),
    paras: [
      bi(
        'Validation plus quarantine is the middle path between the two disasters: load the good 98%, park the bad rows WITH EVIDENCE, and stop the line only when the dirt level itself is abnormal.',
        'Validation cộng với quarantine là cách làm ở giữa hai thái cực: nạp 98% phần tốt, giữ lại những dòng xấu KÈM EVIDENCE, và chỉ dừng pipeline khi bản thân mức độ bẩn là bất thường.',
      ),
      bi(
        'That last clause reframes the whole question. It is not "is there dirt?" — there always is. It is "is today\'s dirt UNUSUAL?" And "unusual" is defined by the contract, not by you.',
        'Vế cuối cùng đó định nghĩa lại toàn bộ câu hỏi. Nó không phải "có bẩn không?" — lúc nào chẳng có. Nó là "phần bẩn hôm nay có BẤT THƯỜNG không?" Và "bất thường" được định nghĩa bởi contract, không phải bởi bạn.',
      ),
      bi(
        'Bad rows go to quarantine as Parquet, tagged with WHY (reject_reason), WHEN (_rejected_at) and WHICH DELIVERY (_data_date). A row can fail several checks at once, so reject_reason is a semicolon-separated list.',
        'Các dòng xấu đi vào quarantine dưới dạng Parquet, gắn nhãn VÌ SAO (reject_reason), KHI NÀO (_rejected_at) và THUỘC FILE NÀO (_data_date). Một dòng có thể trượt nhiều check cùng lúc, nên reject_reason là một danh sách ngăn bằng dấu chấm phẩy.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Why does a quarantined row not carry the source file name?',
          'Vì sao một dòng bị quarantine lại không mang theo tên file nguồn?',
        ),
        a: bi(
          'Because this feed is one file per business date, so _data_date already names the delivery — 2026-06-02 IS orders_2026-06-02.csv. Stamping the file name onto all 992 rows would store one fact 992 times. From A07 on, _run_id joins ops.etl_runs for the file name, the load timestamp and the run status.',
          'Vì nguồn này mỗi business date một file, nên _data_date đã đủ để xác định file — ngày 2026-06-02 CHÍNH LÀ file orders_2026-06-02.csv. Đóng dấu tên file lên cả 992 dòng là lưu một sự thật 992 lần. Từ A07 trở đi, cột _run_id nối sang bảng ops.etl_runs để lấy tên file, thời điểm nạp và trạng thái lần chạy.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 4 ─────────── */
  {
    level: 'mechanism',
    heading: bi('Five kinds of checks, and one reject_reason per row', 'Năm loại kiểm tra, và một reject_reason cho mỗi dòng'),
    paras: [
      bi(
        'Every data quality suite is some mix of five kinds. SCHEMA: right columns and types at all? ROW: is this row acceptable — not-null keys, enum whitelists, numeric ranges, cross-field rules? AGGREGATE: is the SET of rows plausible — uniqueness, duplicate rates, counts in a band? No single row is guilty; the group is. RECONCILIATION: does what we loaded match what the producer says it sent? FRESHNESS: is the table current at all?',
        'Mọi check suite chất lượng dữ liệu đều là sự pha trộn của năm loại. SCHEMA: có đúng cột và đúng kiểu không? DÒNG: dòng này có chấp nhận được không — khoá không được rỗng, whitelist cho tập giá trị, khoảng số hợp lệ, quy tắc liên cột? TỔNG HỢP: cả TẬP dòng có hợp lý không — tính duy nhất, tỉ lệ trùng, số lượng có nằm trong dải không? Ở đây không dòng nào có tội; cả nhóm mới có. ĐỐI CHIẾU: thứ ta nạp vào có khớp với thứ producer khai đã gửi không? ĐỘ TƯƠI: bảng này có còn mới không?',
      ),
      bi(
        'Reconciliation is the cheapest, highest-value check in the whole suite: the manifest carries exact per-file row counts, so loaded must equal manifest, every day, no excuses.',
        'Reconcile là check rẻ nhất và có giá trị cao nhất trong cả bộ: manifest mang theo số dòng chính xác của từng file, nên số nạp vào phải bằng số trong manifest, mỗi ngày, không có ngoại lệ.',
      ),
      bi(
        'Freshness is the one people forget. A03\'s _data_date lineage column makes it a one-liner: max(_data_date) against the latest day you expect. In production the expected latest day is simply yesterday.',
        'Freshness là thứ người ta hay quên. Cột lineage _data_date của A03 khiến nó chỉ còn một dòng: so max(_data_date) với ngày mới nhất mà bạn kỳ vọng. Trong production, ngày mới nhất kỳ vọng đơn giản là hôm qua.',
      ),
      bi(
        'The row checks all collapse into one column. One CASE per check yielding the check\'s name (or NULL if it passes), glued with concat_ws — which skips NULLs — and NULLIF(..., \'\') so a fully clean row gets reject_reason = NULL. Then count(reject_reason) counts non-NULLs, which is your quarantine count.',
        'Toàn bộ các check ở row-level gộp lại thành một cột duy nhất. Mỗi check là một biểu thức CASE trả về tên của check đó (hoặc NULL nếu đạt), rồi nối lại bằng concat_ws — hàm này tự bỏ qua NULL — và dùng NULLIF(..., \'\') để một dòng hoàn toàn sạch nhận reject_reason bằng NULL. Sau đó count(reject_reason) đếm các giá trị khác NULL, và đó chính là số dòng bị quarantine.',
      ),
    ],
    checks: [
      {
        q: bi(
          'The per-check sum for 2026-06-02 is 997, but only 992 rows were quarantined. Where did the extra 5 go?',
          'Tổng các check cho ngày 2026-06-02 là 997, nhưng chỉ có 992 dòng bị quarantine. Năm dòng chênh đi đâu?',
        ),
        a: bi(
          'Five rows failed two checks at once, so they appear twice in the per-check breakdown but once in the row count. Confirm it: count quarantine rows where reject_reason LIKE \'%;%\' → 5. This is exactly why reject_reason is a list.',
          'Có năm dòng trượt hai check cùng lúc, nên chúng xuất hiện hai lần trong bảng thống kê theo từng check nhưng chỉ một lần trong số dòng. Kiểm chứng: đếm các dòng quarantine có reject_reason LIKE \'%;%\' sẽ ra 5. Đây chính là lý do reject_reason phải là một danh sách.',
        ),
      },
      {
        q: bi(
          'Why does ops.dq_report record checks that found zero failures?',
          'Vì sao bảng ops.dq_report lại ghi cả những check không tìm thấy lỗi nào?',
        ),
        a: bi(
          'Because zeros are proof that the check RAN. bad_payment = 0 proves A03\'s normalization works. A report that only lists failures cannot distinguish "this check passed" from "this check was never executed".',
          'Vì con số không chính là evidence rằng check ĐÃ CHẠY. Giá trị bad_payment bằng 0 chứng minh phép normalize của A03 hoạt động. Một báo cáo chỉ liệt kê lỗi thì không phân biệt được "phép này đã đạt" với "phép này chưa từng được chạy".',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 5 ─────────── */
  {
    level: 'detail',
    heading: bi('Gate order, file names, and where a tool belongs', 'Thứ tự gate, tên file, và chỗ đứng của công cụ'),
    paras: [
      bi(
        'The gate order, said out loud before you run: park the evidence → check the tolerances → load. Evidence is ALWAYS written, even — especially — on a terrible day. A day that hard-fails is the day you most need to see which rows broke.',
        'Thứ tự gate, hãy nói to trước khi chạy: giữ lại evidence, rồi kiểm tra tolerance, rồi mới nạp. Evidence LUÔN LUÔN được ghi, kể cả — và nhất là — trong một ngày tồi tệ. Cái ngày mà hệ thống hard-fail chính là ngày bạn cần nhìn thấy nhất những dòng nào đã hỏng.',
      ),
      bi(
        'Two small details in the quarantine COPY carry real weight. COALESCE(order_date, DAY): a row with an unparseable timestamp has no order_date, so it borrows the file\'s date rather than becoming a NULL partition key. And FILENAME_PATTERN: late bad rows land in EARLIER order_date= partitions, so consecutive days write into shared folders — default naming would let day D+1 overwrite day D\'s data_0.parquet there. This is A02\'s rake, met again in a new place.',
        'Hai chi tiết nhỏ trong lệnh COPY của quarantine lại mang sức nặng thật. COALESCE(order_date, DAY): một dòng có mốc thời gian không phân tích được thì không có order_date, nên nó mượn ngày của file thay vì trở thành một khoá phân vùng NULL. Và FILENAME_PATTERN: những dòng xấu về trễ rơi vào các phân vùng order_date= CŨ HƠN, nên các ngày liên tiếp cùng ghi vào những thư mục dùng chung — cách đặt tên mặc định sẽ để ngày D+1 đè lên file data_0.parquet của ngày D ở đó. Đây chính là cái cào của A02, gặp lại ở một chỗ mới.',
      ),
      bi(
        'Plain INSERT into core is NOT rerun-safe: run it twice and the day is in core twice. Live with it today — re-run means DROP TABLE and reload — and A07 fixes it properly. Counts at exactly 2× the manifest are this, nothing else.',
        'Lệnh INSERT thường vào core KHÔNG an toàn khi chạy lại: chạy hai lần thì ngày đó nằm trong core hai lần. Hôm nay cứ sống chung với nó — chạy lại nghĩa là DROP TABLE rồi nạp lại — và A07 sẽ sửa chuyện này cho đàng hoàng. Số dòng đúng gấp đôi manifest là do chuyện này, không phải do gì khác.',
      ),
      bi(
        'Violation or gap? Almost every reason in today\'s quarantine breaks a rule WRITTEN in the contract — a violation to count and report to shopcore. Not null_customer: the contract pins customer_id as nullable: true ("Null = guest checkout"), so no clause is broken there. Classifying the whole pile is A06\'s opening exercise on exactly this output.',
          'Violation hay gap? Gần như mọi lý do trong quarantine hôm nay đều phá vỡ một quy tắc ĐƯỢC VIẾT trong contract — đó là violation, phải đếm và báo cáo cho shopcore. Trừ null_customer: contract ghim customer_id là nullable: true, tức "NULL nghĩa là mua hàng không đăng nhập", nên không điều khoản nào bị phá ở đó. Phân loại cả đống này là bài mở đầu của A06, làm trên đúng kết quả này.',
      ),
      bi(
        'Where a validation framework belongs. pandera validates a DataFrame, so the rows must be IN MEMORY first. Three columns of one small day are about 4.3 MB; the same three across the full 82.3M-row dataset would be roughly 5.9 GB, and all twelve staging columns roughly 36 GB — past your 8 GB limit, in order to check rules DuckDB evaluates without materializing a single row. That is the whole reason the pipeline keeps the SQL suite: the checks run where the 82M rows already are.',
        'Chỗ đứng của một framework validation. Thư viện pandera validation một DataFrame, nên các dòng phải nằm TRONG BỘ NHỚ trước đã. Ba cột của một ngày ở scale small là khoảng 4,3 MB; cũng ba cột đó trên toàn bộ 82,3 triệu dòng sẽ là chừng 5,9 GB, và cả mười hai cột staging là khoảng 36 GB — vượt quá mức trần 8 GB của bạn, chỉ để kiểm tra những quy tắc mà DuckDB đánh giá được mà không cần materialize một dòng nào. Đó là toàn bộ lý do pipeline giữ lại check suite bằng SQL: các check chạy ngay tại chỗ 82 triệu dòng đang nằm.',
      ),
      bi(
        'Reach for pandera where the data is already a DataFrame and already small — a feature frame, an API payload, a test fixture — or as the READABLE statement of the rules a reviewer approves, standing beside the SQL that enforces them at scale. Do not swap it in for the gate.',
        'Hãy dùng pandera ở nơi dữ liệu vốn đã là DataFrame và vốn đã nhỏ — một bảng đặc trưng, một gói dữ liệu API, một dữ liệu mẫu cho kiểm thử — hoặc dùng nó làm bản trình bày DỄ ĐỌC của các quy tắc để người duyệt phê chuẩn, đứng cạnh phần SQL thực thi chúng ở quy mô lớn. Đừng thay nó vào chỗ của gate.',
      ),
    ],
    checks: [
      {
        q: bi(
          'pandera reports bad_status split into two checks (isin 35, not_nullable 36) where your SQL reported one number, 71. Which shape is right?',
          'pandera báo bad_status tách thành hai check (isin 35, not_nullable 36) trong khi SQL của bạn báo một con số duy nhất là 71. Hình dạng nào đúng?',
        ),
        a: bi(
          'Both, and it is a real design decision. The split triages faster — you see immediately whether the problem is missing values or wrong values. The fused one thresholds more simply against the contract\'s single null_or_invalid_status: 1%. Nullability is a property of the column; a whitelist is a value rule. pandera separates them because it thinks in schemas.',
          'Cả hai, và đây là một quyết định thiết kế thật sự. Cách tách giúp phân loại nhanh hơn — bạn thấy ngay vấn đề là thiếu giá trị hay là giá trị sai. Cách gộp thì dễ so với ngưỡng hơn, vì contract chỉ có một dòng null_or_invalid_status ở mức 1%. Tính cho phép rỗng là thuộc tính của cột; còn whitelist là quy tắc về giá trị. pandera tách chúng ra vì nó tư duy theo schema.',
        ),
      },
    ],
  },
]

export const a05Terms: Term[] = [
  {
    term: 'Quarantine',
    gloss: 'quarantine',
    means: bi(
      'Rejected rows written to Parquet with why (reject_reason), when (_rejected_at) and which delivery (_data_date). Evidence, not garbage — you replay from it when a rule proves too strict.',
      'Những dòng bị reject được ghi ra Parquet kèm vì sao (reject_reason), khi nào (_rejected_at) và thuộc file nào (_data_date). Là evidence chứ không phải rác — bạn chạy lại từ đó khi một quy tắc hoá ra quá chặt.',
    ),
    source: { name: 'MotherDuck glossary — data quality', url: 'https://motherduck.com/glossary/' },
  },
  {
    term: 'Enum whitelist',
    gloss: 'whitelist cho tập giá trị',
    means: bi(
      'A fixed set of allowed values, taken verbatim from the contract\'s allowed_values. Anything outside it is rejected — a checker never guesses a category.',
      'Một tập giá trị được phép, cố định, lấy nguyên văn từ trường allowed_values của contract. Thứ gì nằm ngoài nó thì bị loại — một check suite không bao giờ đoán một hạng mục.',
    ),
    source: { name: 'DuckDB — ENUM type', url: 'https://duckdb.org/docs/sql/data_types/enum' },
  },
  {
    term: 'Row / aggregate check',
    gloss: 'kiểm tra row-level / mức tập hợp',
    means: bi(
      'A row check judges one row: not-null keys, ranges, cross-field rules. An aggregate check judges the SET: uniqueness, duplicate rates, volume bands. No single row is guilty; the group is.',
      'Kiểm tra row-level đánh giá một dòng: khoá không rỗng, khoảng giá trị, quy tắc liên cột. Kiểm tra mức tập hợp đánh giá cả TẬP: tính duy nhất, tỉ lệ trùng, dải khối lượng. Ở đó không dòng nào có tội; cả nhóm mới có.',
    ),
    source: { name: 'Great Expectations — core concepts', url: 'https://docs.greatexpectations.io/' },
  },
  {
    term: 'Reconciliation',
    gloss: 'reconcile',
    means: bi(
      'Loaded rows must equal manifest rows, every day, no excuses. The cheapest, highest-value check in the whole suite.',
      'Số dòng nạp vào phải bằng số dòng trong manifest, mỗi ngày, không ngoại lệ. Check rẻ nhất và giá trị nhất trong cả bộ.',
    ),
    source: { name: 'MotherDuck glossary', url: 'https://motherduck.com/glossary/' },
  },
  {
    term: 'Freshness',
    gloss: 'freshness',
    means: bi(
      'Is the table current at all? max(_data_date) against the day you expect. Core can pass every other check and still be three days stale.',
      'Bảng này có còn mới không? So max(_data_date) với ngày bạn kỳ vọng. Tầng core có thể vượt qua mọi check khác mà vẫn cũ ba ngày.',
    ),
    source: { name: 'dbt — source freshness', url: 'https://docs.getdbt.com/docs/build/sources' },
  },
  {
    term: 'Tolerance / gate',
    gloss: 'tolerance / gate',
    means: bi(
      'How much dirt the contract allows per rule. The gate compares today\'s rate against it and hard-fails above. Loaded from YAML, never hard-coded — a tolerance is a shared decision.',
      'Mức bẩn mà contract cho phép với từng quy tắc. Gate so tỉ lệ hôm nay với nó và cho hard-fail nếu vượt. Nạp từ file YAML, không bao giờ ghi cứng — một tolerance là quyết định chung.',
    ),
    source: { name: 'Great Expectations — core concepts', url: 'https://docs.greatexpectations.io/' },
  },
  {
    term: 'Violation vs gap',
    gloss: 'violation so với gap',
    means: bi(
      'A violation breaks a rule written in the contract — report it to the producer. A gap is something the contract never pinned down — a candidate for the A06 amendment list.',
      'Violation là phá vỡ một quy tắc được viết trong contract — hãy báo cho producer. Gap là điều contract chưa bao giờ ghim xuống — ứng viên cho danh sách sửa đổi ở A06.',
    ),
    source: { name: 'MotherDuck glossary', url: 'https://motherduck.com/glossary/' },
  },
  {
    term: 'concat_ws / NULLIF pattern',
    gloss: 'khuôn gộp lý do loại bỏ',
    means: bi(
      'concat_ws skips NULLs, so one CASE per check glues into a semicolon-separated list of every reason a row failed; NULLIF(..., \'\') turns a clean row into NULL.',
      'Hàm concat_ws tự bỏ qua NULL, nên mỗi check một biểu thức CASE sẽ dán lại thành danh sách ngăn bằng dấu chấm phẩy gồm mọi lý do một dòng trượt; còn NULLIF(..., \'\') biến một dòng sạch thành NULL.',
    ),
    source: { name: 'DuckDB — text functions', url: 'https://duckdb.org/docs/sql/functions/char' },
  },
]
