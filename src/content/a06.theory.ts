import type { TheorySection, Term } from '../types'
import { bi } from '../types'

export const a06Theory: TheorySection[] = [
  /* ─────────── TẦNG 1 ─────────── */
  {
    level: 'problem',
    heading: bi('By the time you find it, it is your problem', 'Lúc bạn phát hiện ra thì nó đã thành vấn đề của bạn'),
    paras: [
      bi(
        'In A05 you found the dirt AFTER it was already on your disk — by then it is your problem, whatever the cause. Real teams get burned this way: upstream renames a column on a Friday, Monday\'s load silently writes garbage, and the dashboard is wrong for a week.',
        'Ở A05 bạn phát hiện dữ liệu bẩn SAU KHI nó đã nằm trên đĩa. Lúc đó nó là vấn đề của bạn, bất kể ai gây ra. Các team thật bị dính đúng kiểu này: upstream đổi tên một cột vào thứ Sáu, job sáng thứ Hai ghi rác mà không báo gì, và dashboard sai suốt một tuần.',
      ),
      bi(
        'The deeper problem is not detection but ACCOUNTABILITY. Your A05 suite answers "is this data good enough to load?" from your side. It cannot answer "whose fault is this?" — because nothing was ever promised. Without a written promise, every argument with the producing team is your word against theirs, and you lose, because you are the one holding the broken data.',
        'Vấn đề sâu hơn không phải là phát hiện, mà là TRÁCH NHIỆM. Bộ check của A05 trả lời câu "dữ liệu này có đủ tốt để load không?" từ phía bạn. Nó không trả lời được "lỗi này của ai?" — vì chưa ai cam kết gì cả. Không có cam kết bằng văn bản thì mọi cuộc tranh luận với team upstream đều là lời bạn chọi lời họ, và bạn thua, vì bạn là người đang ôm đống dữ liệu hỏng.',
      ),
    ],
    checks: [
      {
        q: bi(
          'You already have a validation suite that catches everything. Why is that not enough?',
          'Bạn đã có bộ validation bắt được mọi thứ. Vì sao vẫn chưa đủ?',
        ),
        a: bi(
          'Because catching is not the same as preventing, and neither is the same as assigning blame. A05 tells you the file is bad; a contract tells you WHO broke WHICH promise — and that turns a shrug into a version bump with a notice period.',
          'Vì bắt được không đồng nghĩa với ngăn được, và cả hai đều không đồng nghĩa với quy trách nhiệm. A05 cho biết file hỏng; contract cho biết AI đã vi phạm điều khoản NÀO — và điều đó biến một cái nhún vai thành một lần bump version kèm thời hạn báo trước.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 2 ─────────── */
  {
    level: 'alternatives',
    heading: bi('Four ways teams try to live without a contract', 'Bốn cách team cố sống mà không có contract'),
    paras: [],
    alternatives: [
      {
        name: bi('Just handle every surprise in the ETL', 'Cứ xử lý mọi bất ngờ ngay trong ETL'),
        appeal: bi(
          'The pipeline keeps running, nobody has to have an awkward conversation, and the numbers come out.',
          'Pipeline vẫn chạy, không ai phải nói chuyện khó xử, và số liệu vẫn ra.',
        ),
        breaks: bi(
          'Silent patching hides a producer bug FOREVER. Every workaround is a permanent tax on your code that nobody upstream knows they caused, and the next engineer cannot tell a deliberate rule from a scar. Violations get quarantined, counted and REPORTED — never patched quietly.',
          'Vá ngầm sẽ che giấu bug của producer VĨNH VIỄN. Mỗi workaround là một khoản nợ kỹ thuật trong code của bạn mà upstream không hề biết họ gây ra, và engineer tiếp theo không phân biệt được đâu là rule có chủ đích, đâu là vết vá. Violation thì phải quarantine, đếm, và BÁO CÁO — không được vá ngầm.',
        ),
      },
      {
        name: bi('Email the producer whenever something breaks', 'Có lỗi thì email cho producer'),
        appeal: bi(
          'Human, flexible, no ceremony. You describe the problem, they fix it.',
          'Đơn giản, linh hoạt, không thủ tục. Bạn mô tả vấn đề, họ sửa.',
        ),
        breaks: bi(
          'Without a written baseline, half your emails are wrong. You will report a European decimal comma as a bug when the money clause never mentioned locale — blaming shopcore for a promise never made burns credibility you will need for real incidents. And nothing accumulates: the same conversation happens again with the next engineer.',
          'Không có baseline bằng văn bản thì một nửa số email của bạn sai. Bạn sẽ báo dấu phẩy thập phân kiểu châu Âu là bug, trong khi điều khoản money chưa từng quy định về locale — đổ lỗi cho shopcore về điều họ chưa từng cam kết sẽ làm mất uy tín mà bạn cần cho những incident thật. Và không có gì tích luỹ được: cuộc trao đổi đó lại lặp lại với engineer tiếp theo.',
        ),
      },
      {
        name: bi('Let the sniffer define the schema', 'Để CSV sniffer tự xác định schema'),
        appeal: bi(
          'The file itself is the source of truth about its own shape. Why maintain a second copy that can drift?',
          'Bản thân file là nguồn sự thật về cấu trúc của chính nó. Việc gì phải giữ thêm một bản mô tả có thể lệch?',
        ),
        breaks: bi(
          'Sniffed types drift with whatever dirt lands in the sample. Ask DuckDB about one day here and it calls customer_id a DOUBLE (a fraction of a percent look like "123456.0", so the guess widens to fit the dirt) and gives updated_at a TIMEZONE nobody promised. A schema derived from the data can never detect that the data changed — that is circular. The contract is the fixed point.',
          'Kiểu do sniffer đoán sẽ trôi theo dữ liệu bẩn trong mẫu. Hỏi DuckDB về một ngày ở đây, nó bảo customer_id là DOUBLE (một phần nhỏ phần trăm giá trị dạng "123456.0" khiến nó nới kiểu ra cho vừa), và gán cho updated_at một TIMEZONE mà không ai cam kết. Một schema suy ra từ chính dữ liệu thì không bao giờ phát hiện được dữ liệu đã thay đổi — đó là lập luận vòng tròn. Contract mới là điểm cố định để đối chiếu.',
        ),
      },
      {
        name: bi('Run the checks after loading, like A05 does', 'Chạy check sau khi load, như A05'),
        appeal: bi(
          'Simpler: one code path, and you can check the real table instead of a sample.',
          'Đơn giản hơn: một luồng code duy nhất, và check được bảng thật thay vì chỉ một mẫu.',
        ),
        breaks: bi(
          'Then it is just A05 with extra steps. The entire value of a contract gate is refusing BEFORE bad data enters the warehouse — the contract\'s own change_management clause demands consumers "fail loudly (pre-load gate) on undeclared drift rather than load garbage". The gate does not replace A05; it runs first, fast, on a sample, and A05 still validates every row afterwards.',
          'Vậy thì nó chỉ là A05 thêm vài bước thừa. Toàn bộ giá trị của contract gate nằm ở việc từ chối TRƯỚC KHI dữ liệu xấu vào warehouse — chính điều khoản change_management yêu cầu consumer phải "fail rõ ràng tại pre-load gate khi có thay đổi không khai báo, thay vì load rác vào". Gate không thay thế A05; nó chạy trước, nhanh, trên một mẫu, còn A05 vẫn validate từng dòng sau đó.',
        ),
      },
    ],
    checks: [
      {
        q: bi(
          'A European decimal comma appears in order_total. Violation or gap?',
          'Dấu phẩy thập phân kiểu châu Âu xuất hiện trong order_total. Violation hay gap?',
        ),
        a: bi(
          'Gap — the money clause pins currency, scale and rounding but never mentions transport locale. You cannot blame shopcore for a promise never made. Handle it explicitly in your ETL AND turn it into a proposed amendment so the silence closes.',
          'Gap — điều khoản money quy định currency, scale và rounding, nhưng chưa từng nói gì về transport locale. Không thể trách shopcore về điều họ chưa cam kết. Hãy xử lý nó rõ ràng trong ETL VÀ đưa nó thành một amendment đề xuất, để lấp chỗ chưa quy định đó.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 3 ─────────── */
  {
    level: 'idea',
    heading: bi('Move the checkpoint to the boundary between teams', 'Dời điểm kiểm tra ra ranh giới giữa hai team'),
    paras: [
      bi(
        'A data contract is the agreed, versioned promise between a producer and a consumer. It is a plain file — YAML here — that both sides review and diff like code, and that a script can enforce.',
        'Data contract là thoả thuận có version giữa producer (bên tạo dữ liệu) và consumer (bên dùng dữ liệu). Nó là một file bình thường — ở đây là YAML — mà cả hai bên cùng review và diff như code, và một script có thể enforce nó.',
      ),
      bi(
        'You have already used one clause of it without ceremony: A05\'s thresholds came from the row_level_tolerances block. That file is the real thing — version 1.3.0, status agreed, owned by shopcore\'s Checkout Platform team, with an escalation channel for 4am and a change-management policy for everything else. Note the 1.3.0: it has been amended before. Contracts are living documents.',
        'Bạn đã dùng một điều khoản của nó rồi mà không để ý: các ngưỡng ở A05 lấy từ block row_level_tolerances. File đó là thật — version 1.3.0, status agreed, do team Checkout Platform của shopcore sở hữu, có kênh escalation cho lúc 4 giờ sáng và policy change management cho mọi thứ còn lại. Chú ý con số 1.3.0: nó đã từng được sửa đổi. Contract là tài liệu sống.',
      ),
      bi(
        'Two failure modes, and telling them apart is the core skill of this assignment. A VIOLATION is dirt the contract explicitly forbids — a negative order_total when the money clause says negative_allowed: false. Violations get quarantined, counted, and reported to the producer. A GAP is dirt the contract is SILENT about. Gaps get handled explicitly in your ETL and turned into a proposed amendment so the silence closes.',
        'Có hai loại lỗi, và phân biệt được chúng là kỹ năng cốt lõi của bài này. VIOLATION là dữ liệu bẩn mà contract cấm rõ ràng — order_total âm trong khi điều khoản money ghi negative_allowed: false. Violation thì quarantine, đếm, và báo cho producer. GAP là dữ liệu bẩn mà contract KHÔNG QUY ĐỊNH. Gap thì xử lý rõ ràng trong ETL của bạn, đồng thời đề xuất thành amendment để lấp chỗ trống đó.',
      ),
      bi(
        'The contract README calls it hunting the silences before they hunt you. That is not a metaphor: a gap is dangerous precisely BECAUSE nobody is accountable until a clause exists.',
        'File README của contract gọi việc này là tìm ra những chỗ chưa quy định trước khi chúng gây hại. Đây không phải cách nói bóng: gap nguy hiểm chính VÌ không ai chịu trách nhiệm cho tới khi có điều khoản.',
      ),
    ],
    checks: [
      {
        q: bi(
          'The same order_id is re-sent inside one file. Violation, gap, or something else?',
          'Cùng một order_id được gửi lại trong một file. Violation, gap, hay gì khác?',
        ),
        a: bi(
          'A third category: TOLERATED. The duplicates.within_file_exact_resends clause explicitly allows up to 0.2% as the price of at-least-once delivery. It is neither a broken promise nor a silence — it is a promise that says "this will happen, and here is how much".',
          'Loại thứ ba: TOLERATED, tức nằm trong ngưỡng cho phép. Điều khoản duplicates.within_file_exact_resends cho phép tới 0,2%, coi đó là cái giá của cơ chế at-least-once delivery. Nó không phải cam kết bị vi phạm, cũng không phải chỗ chưa quy định — nó là cam kết nói rằng "chuyện này sẽ xảy ra, và đây là mức tối đa".',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 4 ─────────── */
  {
    level: 'mechanism',
    heading: bi('The gate, semver, and validating the validator', 'Gate, semver, và validate chính bộ validate'),
    paras: [
      bi(
        'The gate checks in order, stopping early when a deeper check would be meaningless: file naming → completeness signal (manifest bytes) → schema (exact names, exact ORDER) → sampled value probes → late-corrections window. Wrong columns make value checks nonsense, so it returns immediately at that layer.',
        'Gate kiểm tra theo thứ tự, dừng sớm khi bước sâu hơn trở nên vô nghĩa: tên file, rồi completeness signal (số byte trong manifest), rồi schema (đúng tên, đúng THỨ TỰ), rồi value probe trên mẫu, rồi late-corrections window. Sai cột thì việc check giá trị vô nghĩa, nên nó return ngay ở tầng đó.',
      ),
      bi(
        'Sampling is a design requirement, not a shortcut. The gate reads at most 100,000 rows per file, so a full-scale sweep of 45 files at ~350 MB each finishes in under a minute instead of reading 16 GB. A pre-flight check must be cheap enough that nobody is ever tempted to skip it.',
        'Việc sampling là yêu cầu thiết kế, không phải làm ẩu. Gate đọc tối đa 100.000 dòng mỗi file, nên quét toàn bộ 45 file cỡ 350 MB mỗi file chỉ mất chưa tới một phút thay vì phải đọc 16 GB. Một pre-flight check phải đủ rẻ để không ai nghĩ tới chuyện bỏ qua nó.',
      ),
      bi(
        'Semver gives change a vocabulary. BREAKING (MAJOR, 1.3.0 → 2.0.0) makes existing consumer code wrong: a rename, a type change, a removed column — 30 days notice. NON-BREAKING (MINOR, 1.4.0) adds something existing code tolerates — 7 days notice. PATCH clarifies wording only. And status has its own lifecycle: draft → proposed → agreed → deprecated. The ritual\'s point: a breaking change requires a conversation and a migration plan BEFORE the file ships, not an error log after.',
        'Semver cho ta bộ từ vựng để nói về thay đổi. BREAKING (MAJOR, 1.3.0 lên 2.0.0) làm code hiện tại của consumer bị sai: đổi tên cột, đổi kiểu, bỏ cột — báo trước 30 ngày. NON-BREAKING (MINOR, 1.4.0) thêm thứ mà code hiện tại vẫn chịu được — báo trước 7 ngày. PATCH chỉ làm rõ câu chữ. Còn status có vòng đời riêng: draft, proposed, agreed, deprecated. Ý nghĩa của quy trình này: một breaking change cần một cuộc trao đổi và kế hoạch migration TRƯỚC KHI file được gửi, chứ không phải một log lỗi sau đó.',
      ),
      bi(
        'And then the twist: your gate is now the strictest thing in the pipeline — about the DATA. About the CONTRACT it is credulous. yaml.safe_load hands back a plain dict, and every lookup after it is an unchecked guess about a file that humans edit. Nothing validates the validator.',
        'Rồi tới điểm bất ngờ: gate của bạn giờ là thứ chặt chẽ nhất pipeline — về DỮ LIỆU. Còn về CONTRACT thì nó cả tin. Hàm yaml.safe_load trả về một dict thường, và mọi lần tra key sau đó đều là phỏng đoán không được kiểm tra, trên một file mà con người vẫn sửa tay. Không có gì validate chính bộ validate.',
      ),
      bi(
        'Two shapes of mistake, and this contract is about to be amended twice. A MISSPELT KEY: someone types nullible: true. YAML is delighted — it is a perfectly good mapping key. The mistake sits there until some line of code touches it: a KeyError days later that blames YOUR script and never mentions the contract — or, wherever you wrote .get(), no error at all, just a rule that quietly stopped existing. A gate with one rule silently switched off is worse than no gate, because you still trust it. A WRONG TYPE: window_days: seven, and nothing complains until the arithmetic runs at file 30 of 45.',
        'Có hai kiểu sai, mà contract này sắp được sửa đổi hai lần. GÕ SAI TÊN KEY: ai đó gõ nullible: true. YAML chấp nhận ngay — đó là một mapping key hợp lệ. Lỗi đó nằm im cho tới khi có dòng code chạm vào: một KeyError vài ngày sau, đổ lỗi cho SCRIPT CỦA BẠN và không hề nhắc tới contract — hoặc ở chỗ bạn viết .get() thì không lỗi gì cả, chỉ là một rule âm thầm ngừng hoạt động. Một gate có một rule bị tắt ngầm còn tệ hơn không có gate, vì bạn vẫn tin nó. SAI KIỂU: window_days: seven, và không ai phàn nàn cho tới khi phép tính chạy ở file thứ 30 trên 45.',
      ),
      bi(
        'pydantic is the industry answer: declare the document\'s shape as Python classes, and it either hands back typed objects or raises, naming the exact field. The line that does the real work is extra="forbid" — pydantic\'s default is to IGNORE unrecognised keys, which would swallow a misspelt optional key in total silence, exactly like yaml.safe_load.',
        'pydantic là giải pháp phổ biến của ngành: khai báo cấu trúc tài liệu thành các class Python, rồi nó hoặc trả về object có kiểu rõ ràng, hoặc raise lỗi kèm tên field sai. Dòng làm việc thật sự là extra="forbid" — mặc định pydantic BỎ QUA key lạ, và như vậy sẽ nuốt mất một optional key gõ sai mà không báo gì, y hệt yaml.safe_load.',
      ),
    ],
    checks: [
      {
        q: bi(
          'The tampered file with string order ids has the right column names in the right order. Which gate layer catches it?',
          'File bị sửa với order_id dạng chuỗi vẫn đúng tên cột và đúng thứ tự. Tầng nào của gate bắt được?',
        ),
        a: bi(
          'Not the schema layer — same names, same order, so it slips straight past. The value layer catches it at 100% cast failure, with \'ORD-…\' examples. That is why the gate has both layers: names alone do not prove types.',
          'Không phải tầng schema — cùng tên, cùng thứ tự nên nó lọt qua. Tầng value bắt được, với tỉ lệ cast lỗi 100% và ví dụ dạng \'ORD-…\'. Đó là lý do gate cần cả hai tầng: chỉ tên cột thì không chứng minh được kiểu dữ liệu.',
        ),
      },
      {
        q: bi(
          'Why does the gate try recovery formats before declaring order_ts unparseable?',
          'Vì sao gate thử các format phục hồi trước khi kết luận order_ts không parse được?',
        ),
        a: bi(
          'Because "unparseable" is narrower than "wrongly formatted". Roughly 0.7% of rows break the pinned written format — violations you count in A05 — but the 0.5% hard-fail tolerance is for rows NO known format recovers (~0.03%). A gate that hard-failed on the strict format would be red every single day, and a gate that is always red is a gate nobody reads.',
          'Vì "không parse được" hẹp hơn "sai format". Khoảng 0,7% số dòng sai format đã quy định — đó là violation bạn đếm ở A05 — nhưng ngưỡng hard-fail 0,5% là dành cho những dòng mà KHÔNG format nào cứu được, chỉ chừng 0,03%. Một gate hard-fail vì sai format chặt sẽ đỏ mỗi ngày, mà gate lúc nào cũng đỏ thì không ai đọc.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 5 ─────────── */
  {
    level: 'detail',
    heading: bi('The ethic, the tool boundary, and the clause that creates work', 'Nguyên tắc nghề, ranh giới công cụ, và điều khoản tạo ra việc phải làm'),
    paras: [
      bi(
        'You never edit the signed contract. Not to make a red gate green, not even for a demo — the typo demo corrupts a COPY in scratch space, and git status must show contracts/ byte-for-byte unchanged afterwards. A contract edit is a producer conversation plus a version bump. Quietly widening a tolerance is a fig leaf over a broken promise.',
        'Không bao giờ sửa contract đã ký. Không sửa để làm gate từ đỏ sang xanh, cũng không sửa để demo — bài demo lỗi gõ sai làm hỏng một BẢN SAO trong thư mục tạm, và sau đó git status phải cho thấy thư mục contracts/ không đổi một byte nào. Sửa contract nghĩa là phải trao đổi với producer cộng bump version. Âm thầm nới ngưỡng tolerance chỉ là cách che giấu việc vi phạm.',
      ),
      bi(
        'Where pydantic belongs, and where it does not. Right here: one small document, parsed once per run, on which every other check depends. Wrong, loudly, one layer down: a Column-style model per DATA ROW means 82 million Python objects for the full feed, each with its own validation pass — hours of CPU and RAM you do not have, to answer questions DuckDB answers in one scan over columnar data. pydantic is for config; SQL and frame schemas are for feeds. Reach for the wrong one and the 82M-row day is where you find out.',
        'pydantic hợp ở đâu và không hợp ở đâu. Hợp ở đây: một tài liệu nhỏ, parse một lần mỗi lần chạy, mà mọi check khác đều phụ thuộc vào. Không hợp, và sai nghiêm trọng, ở tầng dưới: dùng một model kiểu Column cho MỖI DÒNG DỮ LIỆU nghĩa là 82 triệu object Python cho toàn bộ feed, mỗi object một lần validate — tốn hàng giờ CPU và lượng RAM bạn không có, chỉ để trả lời những câu mà DuckDB xử lý trong một lần quét dữ liệu dạng cột. pydantic dùng cho config; SQL và frame schema dùng cho feed. Chọn nhầm thì ngày 82 triệu dòng là lúc bạn biết.',
      ),
      bi(
        'The gate deliberately skips three checks: orphan_customer_id, orphan_sku_lines and total_vs_items_mismatch need the dimension feeds or per-row JSON math — too heavy for pre-flight. They stay in your A05 post-load suite. The gate covers what one file alone can prove cheaply.',
        'Gate cố ý bỏ qua ba check: orphan_customer_id, orphan_sku_lines và total_vs_items_mismatch cần tới dimension feed hoặc tính JSON theo từng dòng — quá nặng cho pre-flight. Chúng ở lại trong bộ check sau khi load của A05. Gate chỉ lo những gì một file đơn lẻ tự chứng minh được với chi phí rẻ.',
      ),
      bi(
        'And then one gap is different in kind from all the others. The customers feed carries email — PII, data that points at a real, findable person. Every other silence on your list risks wrong numbers; this one risks a breach notification. Look at your own warehouse: core.customers has stored raw email addresses since A03. Nobody decided that — no clause allows it, none forbids it, so the warehouse became a PII store BY ACCIDENT.',
        'Rồi có một gap khác hẳn về bản chất so với các gap còn lại. Feed customers chứa cột email — đó là PII, dữ liệu định danh được một cá nhân cụ thể. Mọi chỗ chưa quy định khác chỉ dẫn tới số liệu sai; cái này dẫn tới nghĩa vụ thông báo rò rỉ dữ liệu. Nhìn lại warehouse của bạn: bảng core.customers đã lưu email thô từ A03 tới giờ. Không ai quyết định điều đó — không điều khoản nào cho phép, cũng không điều khoản nào cấm, nên warehouse trở thành nơi chứa PII một cách TÌNH CỜ.',
      ),
      bi(
        'That clause is not done when it parses. It hands YOU cleanup work in your own tables — and it costs a MINOR bump, because not one byte of any feed changes. Semver sizes the PROMISE, not the work it creates.',
        'Điều khoản đó không xong khi nó parse được. Nó giao cho CHÍNH BẠN việc dọn dẹp trong bảng của mình — mà chỉ tốn một lần bump MINOR, vì không byte dữ liệu nào trong feed thay đổi. Semver đo mức độ thay đổi của CAM KẾT, không đo khối lượng công việc nó tạo ra.',
      ),
      bi(
        'Hash for analytics, mask for display, tokenize for reversibility. Hashing is one-way: equality survives — joins and dedupe still work — but the value cannot be walked back. Masking keeps the shape for human eyes; masked values never compare equal. Tokenization swaps in a token only a locked-down vault can reverse, for when the original must come back.',
        'Hash để phân tích, mask để hiển thị, tokenize khi cần lấy lại giá trị gốc. Hash là một chiều: quan hệ bằng nhau vẫn giữ được — join và dedupe vẫn chạy — nhưng không lần ngược ra giá trị gốc. Mask giữ lại hình dạng cho người nhìn; giá trị đã mask thì không so bằng nhau được. Tokenize thay bằng một token mà chỉ vault được bảo vệ mới đảo ngược được, dùng khi bắt buộc phải lấy lại giá trị gốc.',
      ),
      bi(
        'One detail in that hash carries the whole clause: md5(lower(trim(email))), not md5(email). The expression is now a contract clause — it must not depend on A03\'s cleaning staying upstream of it forever, and md5(\'John@X.com\') ≠ md5(\'john@x.com\'). An un-canonicalized hash silently loses the very dedupe capability the clause promises. Hash the canonical form, always, at the hash site.',
        'Một chi tiết trong hàm hash mang cả điều khoản: phải là md5(lower(trim(email))), không phải md5(email). Biểu thức này giờ là một điều khoản contract — nó không được phụ thuộc vào việc phần cleaning của A03 mãi mãi chạy trước nó, và md5(\'John@X.com\') khác md5(\'john@x.com\'). Hash mà chưa chuẩn hoá sẽ âm thầm mất đi đúng khả năng dedupe mà điều khoản cam kết. Luôn chuẩn hoá ngay bên trong hàm hash.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Junk-status rate creeps from 0.3% to 0.8% over a month. Breaking change? What bump?',
          'Tỉ lệ status rác tăng dần từ 0,3% lên 0,8% trong một tháng. Có phải breaking change không? Bump kiểu gì?',
        ),
        a: bi(
          'It breaks nothing YET — it still passes the 1% null_or_invalid_status tolerance, and no clause changed, so no bump is owed. That is exactly what makes it the sneaky one: a gate that only fires at the threshold cannot see drift. Only a history table of rates over time reveals it.',
          'Nó CHƯA phá vỡ gì cả — vẫn dưới ngưỡng 1% của null_or_invalid_status, và không điều khoản nào thay đổi, nên không cần bump version. Và đó chính là điểm khó nhận ra: một gate chỉ báo động khi vượt ngưỡng thì không thấy được xu hướng trôi dần. Chỉ có bảng lịch sử ghi lại tỉ lệ theo thời gian mới phát hiện được.',
        ),
      },
    ],
  },
]

export const a06Terms: Term[] = [
  {
    term: 'Data contract',
    gloss: 'thoả thuận dữ liệu có version',
    means: bi(
      'The agreed, versioned promise between a producer and a consumer — a plain YAML file both sides review and diff like code, and that a script can enforce.',
      'Thoả thuận có version giữa producer và consumer — một file YAML mà cả hai bên cùng review và diff như code, và script có thể enforce.',
    ),
    source: { name: 'MotherDuck glossary', url: 'https://motherduck.com/glossary/' },
  },
  {
    term: 'Producer / consumer',
    gloss: 'bên tạo dữ liệu / bên dùng dữ liệu',
    means: bi(
      'The team that generates the feed, and the team whose pipeline reads it. The contract is the boundary between them.',
      'Team tạo ra feed, và team có pipeline đọc feed đó. Contract chính là ranh giới giữa hai bên.',
    ),
    source: { name: 'MotherDuck glossary', url: 'https://motherduck.com/glossary/' },
  },
  {
    term: 'Violation / gap / tolerated',
    gloss: 'vi phạm / chưa quy định / trong ngưỡng cho phép',
    means: bi(
      'A violation breaks a stated clause — report it. A gap is something the contract never covers — close it with an amendment. Tolerated means a clause explicitly allows it at this rate.',
      'Violation là vi phạm điều khoản đã ghi — phải báo cáo. Gap là điều contract chưa quy định — lấp bằng amendment. Tolerated nghĩa là có điều khoản cho phép ở mức tỉ lệ đó.',
    ),
    source: { name: 'MotherDuck glossary', url: 'https://motherduck.com/glossary/' },
  },
  {
    term: 'Semver (MAJOR / MINOR / PATCH)',
    gloss: 'quy ước đánh version theo ngữ nghĩa',
    means: bi(
      'MAJOR breaks existing consumer code (rename, type change, removal) — 30 days notice. MINOR adds something existing code tolerates — 7 days. PATCH clarifies wording only.',
      'MAJOR làm code hiện tại của consumer bị sai (đổi tên, đổi kiểu, bỏ cột) — báo trước 30 ngày. MINOR thêm thứ mà code hiện tại vẫn chịu được — 7 ngày. PATCH chỉ làm rõ câu chữ.',
    ),
    source: { name: 'Semantic Versioning 2.0.0', url: 'https://semver.org/' },
  },
  {
    term: 'Status lifecycle',
    gloss: 'vòng đời trạng thái contract',
    means: bi(
      'draft → proposed → agreed → deprecated. A clause is only something an engineer may rely on once it is countersigned into agreed.',
      'draft, proposed, agreed, deprecated. Một điều khoản chỉ đáng để engineer dựa vào khi đã được hai bên ký duyệt sang agreed.',
    ),
    source: { name: 'Semantic Versioning 2.0.0', url: 'https://semver.org/' },
  },
  {
    term: 'Pre-flight gate',
    gloss: 'cổng kiểm tra trước khi load',
    means: bi(
      'A fast check on a sample that refuses a file BEFORE any row is loaded. Layers: naming → manifest → schema → value probes → late window, stopping early when a deeper check would be meaningless.',
      'Một bước kiểm tra nhanh trên mẫu, từ chối file TRƯỚC KHI load bất kỳ dòng nào. Các tầng: tên file, manifest, schema, value probe, late window — dừng sớm khi bước sâu hơn trở nên vô nghĩa.',
    ),
    source: { name: 'Great Expectations — core concepts', url: 'https://docs.greatexpectations.io/' },
  },
  {
    term: 'extra="forbid"',
    gloss: 'chặn key lạ trong pydantic',
    means: bi(
      'The pydantic setting that turns an unknown key into an error instead of a shrug. Without it, a misspelt optional key vanishes in silence — exactly like yaml.safe_load.',
      'Thiết lập của pydantic biến một key lạ thành lỗi thay vì bỏ qua. Không có nó, một optional key gõ sai sẽ biến mất không dấu vết — y hệt yaml.safe_load.',
    ),
    source: { name: 'pydantic — model config', url: 'https://docs.pydantic.dev/latest/api/config/' },
  },
  {
    term: 'PII',
    gloss: 'thông tin định danh cá nhân',
    means: bi(
      'Personally identifiable information — data that points at a real, findable person. Other gaps risk wrong numbers; this one risks a breach notification.',
      'Dữ liệu định danh được một cá nhân cụ thể. Các gap khác chỉ dẫn tới số liệu sai; gap này dẫn tới nghĩa vụ thông báo rò rỉ dữ liệu.',
    ),
    source: { name: 'NIST — PII definition', url: 'https://csrc.nist.gov/glossary/term/personally_identifiable_information' },
  },
  {
    term: 'Hash / mask / tokenize',
    gloss: 'ba cách che dữ liệu nhạy cảm',
    means: bi(
      'Hash for analytics (one-way; equality survives). Mask for display (shape kept; never compares equal). Tokenize for reversibility (a vault can undo it).',
      'Hash để phân tích (một chiều; vẫn so bằng nhau được). Mask để hiển thị (giữ hình dạng; không so bằng nhau được). Tokenize khi cần đảo ngược (vault lấy lại được giá trị gốc).',
    ),
    source: { name: 'NIST — de-identification', url: 'https://csrc.nist.gov/glossary/term/de_identification' },
  },
]
