import type { TheorySection, Term } from '../types'
import { bi } from '../types'

export const a03Theory: TheorySection[] = [
  /* ─────────── TẦNG 1 ─────────── */
  {
    level: 'problem',
    heading: bi('97% clean is the dangerous kind of clean', '97% sạch là kiểu sạch nguy hiểm'),
    paras: [
      bi(
        'Our daily feed from shopcore is about 97% clean. That sounds good, and it is exactly the problem. If the feed were 50% broken you would notice on day one. At 3% it loads fine, queries fine, and produces a revenue number that is quietly wrong.',
        'Nguồn dữ liệu hằng ngày từ shopcore sạch khoảng 97%. Nghe thì tốt, mà đó chính là vấn đề. Nếu nguồn hỏng 50% thì bạn phát hiện ngay ngày đầu. Ở mức 3%, nó nạp được, truy vấn được, và cho ra một con số doanh thu sai trong im lặng.',
      ),
      bi(
        'At full scale, 0.2% of one day is about 2,400 rows. Far too many to fix by hand, so you fix them in code. And the moment you fix things in code, a second problem appears: how does anyone know what you changed?',
        'Ở quy mô đầy đủ, 0,2% của một ngày là khoảng 2.400 dòng. Quá nhiều để sửa tay, nên bạn sửa bằng code. Và ngay khi bạn sửa bằng code, vấn đề thứ hai xuất hiện: làm sao ai đó biết bạn đã đổi những gì?',
      ),
      bi(
        'A fix nobody can audit is data loss with better PR. If your cleaner turns 2,400 values into NULL and nothing records that it happened, you have destroyed data and called it cleaning.',
        'Một phép sửa mà không ai kiểm toán được thì chính là mất dữ liệu, chỉ khác cái tên gọi cho êm tai. Nếu bộ làm sạch của bạn biến 2.400 giá trị thành NULL mà không có gì ghi lại chuyện đó, bạn đã phá dữ liệu và gọi nó là làm sạch.',
      ),
      bi(
        'There is a third problem, quieter than both: types. A VARCHAR column full of numbers is a bug magnet. The string comparison \'9\' > \'10\' is true, and a date kept as text cannot be compared, bucketed, or partitioned.',
        'Còn một vấn đề thứ ba, âm thầm hơn cả hai cái trên: kiểu dữ liệu. Một cột VARCHAR chứa toàn số là nam châm hút lỗi. Phép so chuỗi \'9\' > \'10\' cho ra đúng, và một ngày tháng để dạng văn bản thì không so sánh, không chia nhóm, không phân vùng được.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Why is a 3% error rate more dangerous than a 50% error rate?',
          'Vì sao tỉ lệ lỗi 3% lại nguy hiểm hơn tỉ lệ lỗi 50%?',
        ),
        a: bi(
          'Because 50% is impossible to miss — everything breaks loudly and immediately. 3% passes every smoke test, survives to production, and shows up as a number in a report that a human then makes a decision on. The damage scales with how long it goes unnoticed.',
          'Vì 50% thì không thể không thấy — mọi thứ hỏng ầm ĩ và ngay lập tức. Còn 3% vượt qua mọi phép kiểm tra sơ bộ, sống sót tới môi trường thật, rồi xuất hiện dưới dạng một con số trong báo cáo mà con người dựa vào đó ra quyết định. Thiệt hại tỉ lệ thuận với thời gian nó không bị phát hiện.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 2 ─────────── */
  {
    level: 'alternatives',
    heading: bi('Four tempting ways to handle dirt', 'Bốn cách hấp dẫn để xử lý dữ liệu bẩn'),
    paras: [
      bi(
        'Before accepting the layered warehouse, walk through what else you might do and find where each one breaks.',
        'Trước khi chấp nhận mô hình kho dữ liệu phân tầng, hãy đi qua những gì bạn có thể làm thay thế và tìm chỗ hỏng của từng cách.',
      ),
    ],
    alternatives: [
      {
        name: bi('Fix the values in the source files', 'Sửa thẳng giá trị trong file nguồn'),
        appeal: bi(
          'The dirt is right there in the CSV. Open it, fix it, and everything downstream is clean forever.',
          'Rác nằm ngay trong file CSV. Mở ra, sửa, thế là mọi thứ phía sau sạch mãi mãi.',
        ),
        breaks: bi(
          'You have just destroyed the one artifact you can always rebuild from. When a number looks wrong six months later, the original delivery is the only evidence of whether the fault was upstream or yours — and you have overwritten it. Raw is never edited. That is not a preference, it is the foundation everything else rests on.',
          'Bạn vừa phá huỷ thứ duy nhất mà bạn luôn có thể dựng lại từ đó. Khi một con số trông sai sau sáu tháng, bản giao gốc là bằng chứng duy nhất cho biết lỗi thuộc về phía trên hay thuộc về bạn — mà bạn đã ghi đè lên nó. Tầng raw không bao giờ được sửa. Đó không phải sở thích, đó là nền móng mà mọi thứ khác đứng lên.',
        ),
      },
      {
        name: bi('Clean it downstream, in the BI tool', 'Làm sạch ở phía dưới, trong công cụ BI'),
        appeal: bi(
          'The report is where the number is consumed, so fixing it there fixes what people actually see. No pipeline change needed.',
          'Báo cáo là nơi con số được tiêu thụ, nên sửa ở đó là sửa đúng thứ người ta nhìn thấy. Không cần đụng vào pipeline.',
        ),
        breaks: bi(
          'The next report re-implements the same rule slightly differently, and now two dashboards disagree about revenue. Fix a value in three downstream places and you own three future bugs. Staging is the one place; everything after it trusts the types.',
          'Báo cáo tiếp theo sẽ cài lại đúng quy tắc đó nhưng hơi khác một chút, và thế là hai bảng điều khiển bất đồng về doanh thu. Sửa một giá trị ở ba nơi phía dưới là bạn sở hữu ba lỗi tương lai. Staging là nơi duy nhất; mọi thứ sau nó tin vào kiểu dữ liệu đã có.',
        ),
      },
      {
        name: bi('Let the CSV reader auto-cast the columns', 'Để trình đọc CSV tự ép kiểu các cột'),
        appeal: bi(
          'A01 read customer_id as BIGINT with an explicit schema and it worked. No cleaning code needed at all.',
          'A01 đọc customer_id thành BIGINT bằng lược đồ khai tường minh và nó chạy được. Chẳng cần code làm sạch gì cả.',
        ),
        breaks: bi(
          '"Worked" hid something. The reader silently converted 120 Excel-mangled values like "123456.0" into clean integers. Convenient, and unaccountable — you cannot count what you never saw. A cleaning layer reads dirty columns as text FIRST, precisely so it can see and count what it fixes. That single reversal is the whole assignment.',
          '"Chạy được" đã che giấu một chuyện. Trình đọc đã âm thầm biến 120 giá trị bị Excel làm hỏng kiểu "123456.0" thành số nguyên sạch sẽ. Tiện lợi, và không thể quy trách nhiệm — bạn không thể đếm thứ mà bạn chưa từng nhìn thấy. Tầng làm sạch đọc cột bẩn ở dạng văn bản TRƯỚC, chính là để nhìn thấy và đếm được những gì nó sửa. Đúng một phép đảo ngược đó là toàn bộ bài này.',
        ),
      },
      {
        name: bi('Throw away rows that will not parse', 'Vứt bỏ những dòng không phân tích được'),
        appeal: bi(
          'A row with an impossible date is useless anyway. Dropping it keeps the table clean and every column strongly typed.',
          'Một dòng có ngày bất khả thi thì cũng vô dụng thôi. Bỏ nó đi giữ cho bảng sạch và mọi cột đều có kiểu chặt chẽ.',
        ),
        breaks: bi(
          'Deciding whether a whole ROW is too broken to load is validation, and it is a different decision with different consequences — A05 owns it. Today the rule is narrower and stricter: fix what has an obvious fix, and where there is no defensible fix, write NULL. NULL is the honest way to say "we do not know". Nothing is thrown away except exact-key duplicates.',
          'Quyết định xem cả một DÒNG có hỏng quá mức để nạp hay không là việc kiểm định, và đó là một quyết định khác với hệ quả khác — A05 phụ trách. Hôm nay quy tắc hẹp hơn và chặt hơn: sửa những gì có cách sửa hiển nhiên, còn chỗ nào không có cách sửa bảo vệ được thì ghi NULL. NULL là cách trung thực để nói "chúng tôi không biết". Không vứt đi thứ gì ngoài các bản trùng khoá chính xác.',
        ),
      },
    ],
    checks: [
      {
        q: bi(
          '"$79.98" becomes 79.98, and status "Paid" becomes "paid". What about a total of -42.10?',
          '"$79.98" thành 79.98, và trạng thái "Paid" thành "paid". Vậy còn tổng tiền -42.10 thì sao?',
        ),
        a: bi(
          'It survives as -42.10, on purpose. A negative total is not a FORMAT problem, it is a VALIDITY problem. Cleansing normalizes form; validation judges meaning. A05 quarantines negatives. Keeping the two separate is what stops a cleaner from quietly making business decisions.',
          'Nó sống sót dưới dạng -42.10, một cách có chủ ý. Tổng tiền âm không phải vấn đề ĐỊNH DẠNG, nó là vấn đề TÍNH HỢP LỆ. Làm sạch thì chuẩn hoá hình thức; kiểm định thì phán xét ý nghĩa. A05 sẽ cách ly các giá trị âm. Giữ hai việc này tách rời chính là thứ ngăn một bộ làm sạch âm thầm ra quyết định kinh doanh.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 3 ─────────── */
  {
    level: 'idea',
    heading: bi('Three layers, three jobs, and every rule counts itself', 'Ba tầng, ba nhiệm vụ, và mọi quy tắc đều tự đếm'),
    paras: [
      bi(
        'raw — files exactly as delivered. Never edited: the one thing you can always rebuild from.\nstaging — one row in, one row out (minus provable duplicates). Same meaning as raw, but every column has the right type and dirty values are normalized. Nothing joined yet.\ncore — business tables: staging joined to dimensions, derived columns, aggregates.',
        'raw — file y nguyên như lúc được giao. Không bao giờ sửa: đây là thứ duy nhất bạn luôn dựng lại được từ đó.\nstaging — một dòng vào, một dòng ra (trừ các bản trùng chứng minh được). Cùng ý nghĩa với raw, nhưng mọi cột đã đúng kiểu và giá trị bẩn đã được chuẩn hoá. Chưa nối bảng nào cả.\ncore — bảng nghiệp vụ: staging nối với các bảng chiều, thêm cột suy ra, thêm bảng tổng hợp.',
      ),
      bi(
        'Why the middle layer? It isolates blame. When a number looks wrong: wrong in raw means upstream is at fault; wrong in staging means your cleaning; wrong in core means your joins. Without layers, every bug hunt starts from zero.',
        'Vì sao cần tầng ở giữa? Nó khoanh vùng trách nhiệm. Khi một con số trông sai: sai ở raw là lỗi phía trên; sai ở staging là lỗi khâu làm sạch của bạn; sai ở core là lỗi phép nối của bạn. Không có phân tầng thì mọi cuộc truy lỗi đều bắt đầu từ con số không.',
      ),
      bi(
        'And beside the layers, the habit that marks a professional: every cleaning rule counts the rows it touched. You build a cleaning catalog — one rule per known pathology — and a cleaning report giving rule → rows_affected for the day, compared against the documented dirt rates. If a rule suddenly touches 40% of rows instead of 0.4%, something upstream changed, and your report catches it on day one.',
        'Và bên cạnh việc phân tầng là thói quen phân biệt người làm nghề: mọi quy tắc làm sạch đều đếm số dòng nó chạm vào. Bạn dựng một danh mục làm sạch — mỗi bệnh lý đã biết là một quy tắc — và một báo cáo làm sạch cho biết quy tắc nào ảnh hưởng bao nhiêu dòng trong ngày, rồi đối chiếu với tỉ lệ bẩn đã được ghi trong tài liệu. Nếu một quy tắc đột nhiên chạm vào 40% số dòng thay vì 0,4%, tức là có gì đó ở phía trên đã đổi, và báo cáo của bạn bắt được nó ngay ngày đầu tiên.',
      ),
    ],
    checks: [
      {
        q: bi(
          'A revenue number looks wrong. What is the first query you run?',
          'Một con số doanh thu trông sai. Câu truy vấn đầu tiên bạn chạy là gì?',
        ),
        a: bi(
          'Compare the same figure at each layer. If raw already disagrees with the manifest, it is upstream. If raw is right but staging is wrong, a cleaning rule did it — and the cleaning report tells you which one. If staging is right but core is wrong, it is a join. The layers turn one hard question into three easy ones.',
          'So chính con số đó ở từng tầng. Nếu raw đã lệch với manifest thì lỗi ở phía trên. Nếu raw đúng mà staging sai thì một quy tắc làm sạch gây ra — và báo cáo làm sạch chỉ ra quy tắc nào. Nếu staging đúng mà core sai thì là do phép nối. Phân tầng biến một câu hỏi khó thành ba câu hỏi dễ.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 4 ─────────── */
  {
    level: 'mechanism',
    heading: bi('The two tools, and why reading as text comes first', 'Hai công cụ, và vì sao phải đọc dạng văn bản trước'),
    paras: [
      bi(
        'TRY_CAST returns NULL instead of exploding on a bad value. try_strptime is the same idea for parsing timestamps against a list of formats — it tries each in order and returns NULL if none fits. Together they do most of the work.',
        'TRY_CAST trả về NULL thay vì làm nổ truy vấn khi gặp giá trị hỏng. Hàm try_strptime cũng cùng ý tưởng đó nhưng dùng để phân tích mốc thời gian theo một danh sách định dạng — nó thử từng cái theo thứ tự và trả NULL nếu không cái nào khớp. Hai thứ đó làm phần lớn công việc.',
      ),
      bi(
        'But a tool that returns NULL is only half a solution. You must count those NULLs, or you lose data silently — which is the exact failure this assignment exists to prevent. TRY_CAST without a cleaning report is worse than CAST, because CAST at least fails loudly.',
        'Nhưng một công cụ trả về NULL mới chỉ là nửa lời giải. Bạn phải đếm những giá trị NULL đó, nếu không bạn mất dữ liệu trong im lặng — đúng cái kiểu hỏng mà bài này sinh ra để ngăn chặn. TRY_CAST mà không có báo cáo làm sạch còn tệ hơn CAST, vì ít nhất CAST còn hỏng một cách ồn ào.',
      ),
      bi(
        'This is why the raw staging table reads dirty columns as VARCHAR. Read customer_id as BIGINT and the reader silently repairs 120 Excel-mangled values for you — you get a clean column and no idea it happened. Read it as text and one query counts both the 94 missing and the 120 Excel floats. You cannot report a fix you never made.',
        'Đây chính là lý do bảng staging thô đọc các cột bẩn ở dạng VARCHAR. Đọc customer_id thành BIGINT thì trình đọc âm thầm sửa giúp bạn 120 giá trị bị Excel làm hỏng — bạn có một cột sạch và không hay biết gì. Đọc dạng văn bản thì một câu truy vấn đếm được cả 94 giá trị thiếu lẫn 120 số thực kiểu Excel. Bạn không thể báo cáo một phép sửa mà bạn chưa từng thực hiện.',
      ),
      bi(
        'For long lists of value-variants the tool changes shape. Small normalizations fit in a CASE expression. Twenty-four spellings of ten countries belong in a mapping table you extend with an INSERT, not a code edit. The pattern is called conformance: many spellings in, one canonical code out.',
        'Với những danh sách biến thể dài thì công cụ đổi hình dạng. Chuẩn hoá nhỏ thì nhét vừa một biểu thức CASE. Còn hai mươi tư cách viết của mười quốc gia thì thuộc về một bảng ánh xạ mà bạn mở rộng bằng lệnh INSERT, chứ không phải bằng cách sửa code. Kiểu mẫu này gọi là conformance: nhiều cách viết đi vào, một mã chuẩn đi ra.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Why does the money cleaner strip thousands-dots BEFORE swapping comma to point?',
          'Vì sao bộ làm sạch tiền phải xoá dấu chấm ngăn nghìn TRƯỚC khi đổi dấu phẩy thành dấu chấm?',
        ),
        a: bi(
          'Order matters. replace(\'1.234,56\', \',\', \'.\') gives \'1.234.56\', which is not a number and casts to NULL. Killing the dots first gives \'1234,56\', then the comma swap gives \'1234.56\'. Same two operations, opposite outcomes.',
          'Thứ tự quan trọng. Lệnh replace(\'1.234,56\', \',\', \'.\') cho ra \'1.234.56\', không phải một con số và sẽ ép kiểu thành NULL. Xoá dấu chấm trước thì được \'1234,56\', rồi đổi dấu phẩy sẽ ra \'1234.56\'. Cùng hai thao tác, kết quả trái ngược nhau.',
        ),
      },
      {
        q: bi(
          'Three cleaning report rules silently return 0 if you get one CSV detail wrong. Which detail?',
          'Ba quy tắc trong báo cáo làm sạch sẽ âm thầm trả về 0 nếu bạn hiểu sai một chi tiết của CSV. Chi tiết nào?',
        ),
        a: bi(
          'An empty CSV field arrives as NULL, not as an empty string. So WHERE col = \'\' matches nothing at all. Test col IS NULL instead. The rule still runs, still reports a number, and the number is a lie.',
          'Một ô CSV rỗng về tới nơi dưới dạng NULL, không phải chuỗi rỗng. Nên điều kiện WHERE col = \'\' không khớp gì cả. Phải kiểm tra col IS NULL. Quy tắc vẫn chạy, vẫn báo ra một con số, và con số đó là lời nói dối.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 5 ─────────── */
  {
    level: 'detail',
    heading: bi('Grain, lineage, names, and code that graduates', 'Grain, lineage, cách đặt tên, và code được thăng cấp'),
    paras: [
      bi(
        'Grain. Before you build a table, say what one of its rows IS. That sentence is its grain, and it belongs on the DDL as a comment. A table whose grain you cannot state in one line is a table you have not designed. One pair is worth meeting up front, because they read like the same table and are not: shopcore_orders_raw is one row = one order VERSION as delivered (a corrected order ships twice), while shopcore_orders is one row = one ORDER, latest version only. The gap between those two sentences is all of Task 4.',
        'Grain, tức độ hạt của bảng. Trước khi dựng một bảng, hãy nói một dòng của nó LÀ CÁI GÌ. Câu đó chính là grain, và nó thuộc về câu lệnh tạo bảng dưới dạng chú thích. Một bảng mà bạn không nói được grain trong một dòng là một bảng bạn chưa hề thiết kế. Có một cặp đáng gặp ngay từ đầu, vì chúng đọc lên như cùng một bảng mà thực ra không phải: shopcore_orders_raw có một dòng = một PHIÊN BẢN đơn hàng như lúc được giao (một đơn đã sửa sẽ về hai lần), còn shopcore_orders có một dòng = một ĐƠN HÀNG, chỉ phiên bản mới nhất. Khoảng cách giữa hai câu đó chính là toàn bộ Task 4.',
      ),
      bi(
        'Fact or dimension? core.orders_enriched records events at order grain and carries measures you add up — order_total, and the row count itself. That makes it a fact. Dimensions describe the entities a fact points at and carry the attributes you filter and group by: country, region, category. Which table is which is a decision you make, not a label the source ships.',
        'Bảng sự kiện hay bảng chiều? Bảng core.orders_enriched ghi lại các sự kiện ở độ hạt đơn hàng và mang theo những đại lượng bạn cộng dồn được — order_total, và chính số dòng. Điều đó khiến nó là một fact, tức bảng sự kiện. Các dimension, tức bảng chiều, mô tả những thực thể mà bảng sự kiện trỏ tới và mang các thuộc tính bạn dùng để lọc và gom nhóm: quốc gia, vùng, danh mục. Bảng nào thuộc loại nào là quyết định của bạn, không phải cái nhãn mà nguồn dữ liệu gắn sẵn.',
      ),
      bi(
        'Lineage — exactly two columns. Every staging and core row carries _data_date (DATE), the business date of the delivery it came from, and _run_id (BIGINT), which pipeline run wrote it. _data_date is load-bearing, not decoration: it is the DELETE key for idempotent reloads in A07 and A08, the partition key, and the staleness probe — max(_data_date) answers "how fresh is this table?" in one query.',
        'Lineage, tức dấu vết nguồn gốc — đúng hai cột. Mọi dòng ở staging và core đều mang theo _data_date kiểu DATE, là ngày nghiệp vụ của bản giao mà dòng đó đến từ, và _run_id kiểu BIGINT, cho biết lần chạy pipeline nào đã ghi nó. Cột _data_date là cột chịu lực chứ không phải trang trí: nó là khoá DELETE cho việc nạp lại bất biến ở A07 và A08, là khoá phân vùng, và là que thăm độ tươi — max(_data_date) trả lời câu "bảng này mới tới đâu?" chỉ bằng một truy vấn.',
      ),
      bi(
        'And no more — the restraint is the lesson. The instinct is to also stamp _source_file and _loaded_at on every row, but those are facts about the RUN, not about the ORDER. They belong on the single ops.etl_runs row that _run_id points at. Copy them onto the rows instead and you store 1.2M identical strings, then rewrite all 1.2M whenever the truth about one load changes.',
        'Và không thêm gì nữa — chính sự kiềm chế mới là bài học. Bản năng là muốn đóng thêm _source_file và _loaded_at lên mọi dòng, nhưng đó là sự thật về LẦN CHẠY, không phải về ĐƠN HÀNG. Chúng thuộc về đúng một dòng trong bảng ops.etl_runs mà _run_id trỏ tới. Chép chúng lên từng dòng thì bạn lưu 1,2 triệu chuỗi giống hệt nhau, rồi phải ghi lại cả 1,2 triệu dòng mỗi khi sự thật về một lần nạp thay đổi.',
      ),
      bi(
        'Naming — the warehouse is a shared namespace. A warehouse hosts data from many applications, so a table name must say WHOSE data it holds. Staging tables are source-prefixed: staging.shopcore_orders, and a second app\'s users would be staging.adsight_users. A bare "users" in a shared schema is a collision waiting to happen. core earns its short names because that layer conforms sources into one agreed definition — but generic names like data, final, tmp2 stay banned.',
        'Đặt tên — kho dữ liệu là một không gian tên dùng chung. Một kho chứa dữ liệu của nhiều ứng dụng, nên tên bảng phải nói rõ đó là dữ liệu CỦA AI. Vì vậy các bảng staging mang tiền tố nguồn: staging.shopcore_orders, và bảng người dùng của một ứng dụng khác sẽ là staging.adsight_users. Một cái tên trần trụi kiểu "users" trong một schema dùng chung là một vụ va chạm đang chờ xảy ra. Tầng core được quyền dùng tên ngắn vì nó hợp nhất các nguồn về một định nghĩa chung — nhưng những cái tên chung chung như data, final, tmp2 thì vẫn bị cấm.',
      ),
      bi(
        'Code that graduates. Today\'s cleaning rules are not throwaway: A05 will check values with the very same rules, A07\'s pipeline rebuilds staging with them on every run, A15 ports them into dbt. So SQL that has proven itself moves into a small Python module — work/cleaners.py — and from then on later code IMPORTS it, never re-pastes it. Two copies of a rule always drift apart, and the copy you forgot about is the one that lies. A module also buys you something a SQL snippet never can: a test file.',
        'Code được thăng cấp. Các quy tắc làm sạch hôm nay không phải hàng dùng một lần: A05 sẽ kiểm tra giá trị bằng đúng những quy tắc này, pipeline của A07 dựng lại staging bằng chúng ở mỗi lần chạy, A15 chuyển chúng sang dbt. Vì vậy đoạn SQL nào đã tự chứng minh được thì chuyển vào một module Python nhỏ — work/cleaners.py — và từ đó về sau code IMPORT nó, không bao giờ dán lại. Hai bản sao của một quy tắc rồi sẽ lệch nhau, và bản mà bạn quên mất chính là bản nói dối. Một module còn mua cho bạn thứ mà một đoạn SQL rời không bao giờ có được: một file kiểm thử.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Task 4 gives 58,993 rows = 59,024 − 31, but the manifest says dup_rows is 29. Who are the other 2?',
          'Task 4 cho ra 58.993 dòng = 59.024 − 31, nhưng manifest nói dup_rows là 29. Vậy hai dòng còn lại là ai?',
        ),
        a: bi(
          'Two late-correction rows happen to reference the same corrected order — a collision the dedupe rightly folds. The lesson matters more than the number: never expect data to match theory to the row; expect to EXPLAIN the difference.',
          'Hai dòng sửa về trễ tình cờ cùng trỏ tới một đơn hàng đã được sửa — một va chạm mà phép khử trùng gộp lại là đúng. Bài học quan trọng hơn con số: đừng bao giờ mong dữ liệu khớp với lý thuyết tới từng dòng; hãy mong GIẢI THÍCH ĐƯỢC phần chênh lệch.',
        ),
      },
      {
        q: bi(
          'Why does _source_file cost only 74 bytes for 58,993 rows in Parquet?',
          'Vì sao cột _source_file chỉ tốn 74 byte cho 58.993 dòng trong Parquet?',
        ),
        a: bi(
          'A column with one distinct value becomes a one-entry dictionary plus a run of identical indices, which compresses to almost nothing. So the storage argument for keeping only two lineage columns is WEAK — you could afford four. The real reason is modeling: those two fields describe the run, so the run ledger is where they are correct, editable in one place, and unable to disagree with themselves across 1.2M copies.',
          'Một cột chỉ có một giá trị phân biệt sẽ thành một từ điển một mục cộng với một chuỗi chỉ số giống hệt nhau, và cái đó nén xuống gần như bằng không. Nghĩa là lập luận về dung lượng để giữ chỉ hai cột lineage là YẾU — bạn thừa sức nuôi bốn cột. Lý do thật nằm ở mô hình hoá: hai trường kia mô tả lần chạy, nên bảng nhật ký lần chạy mới là nơi chúng đúng, sửa được ở một chỗ, và không thể tự mâu thuẫn với chính mình qua 1,2 triệu bản sao.',
        ),
      },
    ],
  },
]

export const a03Terms: Term[] = [
  {
    term: 'Layered warehouse (raw / staging / core)',
    gloss: 'kho dữ liệu phân tầng',
    means: bi(
      'raw is untouched delivery, staging is clean and typed one-to-one with raw, core is joined and meaningful. Layers isolate blame when a number looks wrong.',
      'raw là bản giao còn nguyên, staging là bản sạch và đúng kiểu tương ứng một-một với raw, core là bản đã nối và có ý nghĩa nghiệp vụ. Phân tầng giúp khoanh vùng trách nhiệm khi một con số trông sai.',
    ),
    source: { name: 'dbt — how we structure projects', url: 'https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview' },
  },
  {
    term: 'Grain',
    gloss: 'độ hạt của bảng',
    means: bi(
      'What one row of a table IS, stated in one sentence. Belongs on the DDL as a comment. A table whose grain you cannot state is a table you have not designed.',
      'Một dòng của bảng LÀ CÁI GÌ, nói gọn trong một câu. Thuộc về câu lệnh tạo bảng dưới dạng chú thích. Bảng mà bạn không nói được grain là bảng bạn chưa thiết kế.',
    ),
    source: { name: 'Kimball Group — dimensional modeling techniques', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/' },
  },
  {
    term: 'Cleansing vs validation',
    gloss: 'làm sạch so với kiểm định',
    means: bi(
      'Cleansing normalizes FORM: "$79.98" is clearly 79.98. Validation judges MEANING: a negative total may be invalid. Today is cleansing only; A05 is validation.',
      'Làm sạch chuẩn hoá HÌNH THỨC: "$79.98" rõ ràng là 79.98. Kiểm định phán xét Ý NGHĨA: một tổng tiền âm có thể là không hợp lệ. Hôm nay chỉ làm sạch; A05 mới là kiểm định.',
    ),
    source: { name: 'dbt — how we structure projects', url: 'https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview' },
  },
  {
    term: 'Lineage columns',
    gloss: 'cột dấu vết nguồn gốc',
    means: bi(
      'Exactly two, on every staging and core table: _data_date (the delivery\'s business date, also the DELETE key and staleness probe) and _run_id (which run wrote the row, NULL until A07).',
      'Đúng hai cột, trên mọi bảng staging và core: _data_date (ngày nghiệp vụ của bản giao, đồng thời là khoá DELETE và que thăm độ tươi) và _run_id (lần chạy nào ghi dòng này, còn NULL cho tới A07).',
    ),
    source: { name: 'dbt — data lineage', url: 'https://docs.getdbt.com/terms/data-lineage' },
  },
  {
    term: 'Conformance',
    gloss: 'hợp nhất biến thể',
    means: bi(
      'Many spellings in, one canonical code out — via a mapping table you extend with an INSERT rather than a code edit. Used here for 24 spellings of 10 countries.',
      'Nhiều cách viết đi vào, một mã chuẩn đi ra — qua một bảng ánh xạ mà bạn mở rộng bằng INSERT thay vì sửa code. Ở đây dùng cho 24 cách viết của 10 quốc gia.',
    ),
    source: { name: 'Kimball Group — dimensional modeling techniques', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/' },
  },
  {
    term: 'Cleaning report',
    gloss: 'báo cáo làm sạch',
    means: bi(
      'One row per rule: rule → rows_affected, compared against documented dirt rates. A rule that suddenly touches 40% instead of 0.4% means something upstream changed.',
      'Mỗi quy tắc một dòng: quy tắc nào ảnh hưởng bao nhiêu dòng, đối chiếu với tỉ lệ bẩn đã ghi trong tài liệu. Một quy tắc đột nhiên chạm 40% thay vì 0,4% nghĩa là phía trên đã có gì đó thay đổi.',
    ),
    source: { name: 'dbt — tests', url: 'https://docs.getdbt.com/docs/build/data-tests' },
  },
  {
    term: 'Window function / row_number()',
    gloss: 'hàm cửa sổ',
    means: bi(
      'Numbers rows within each group WITHOUT collapsing them, unlike GROUP BY. row_number() OVER (PARTITION BY order_id ORDER BY updated_at DESC) ranks the newest version of each order as 1.',
      'Đánh số các dòng trong từng nhóm mà KHÔNG gộp chúng lại, khác với GROUP BY. Câu row_number() OVER (PARTITION BY order_id ORDER BY updated_at DESC) xếp phiên bản mới nhất của mỗi đơn hàng ở hạng 1.',
    ),
    source: { name: 'DuckDB — window functions', url: 'https://duckdb.org/docs/sql/functions/window_functions' },
  },
  {
    term: 'Fact / dimension',
    gloss: 'bảng sự kiện / bảng chiều',
    means: bi(
      'A fact records events and carries measures you add up. A dimension describes the entities a fact points at and carries attributes you filter and group by. The distinction is your decision, not a label the source ships.',
      'Bảng sự kiện ghi lại các sự kiện và mang những đại lượng cộng dồn được. Bảng chiều mô tả các thực thể mà bảng sự kiện trỏ tới và mang các thuộc tính dùng để lọc và gom nhóm. Phân biệt này là quyết định của bạn, không phải nhãn mà nguồn gắn sẵn.',
    ),
    source: { name: 'Kimball Group — dimensional modeling techniques', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/' },
  },
  {
    term: 'Denormalization',
    gloss: 'phi chuẩn hoá có chủ đích',
    means: bi(
      'Copying dimension attributes into the fact so the everyday question reads one table instead of three. Paid for in storage and in freshness — it needs a stated reason, never a reflex.',
      'Chép các thuộc tính của bảng chiều vào bảng sự kiện để câu hỏi thường ngày chỉ phải đọc một bảng thay vì ba. Phải trả giá bằng dung lượng và bằng độ tươi — nó cần một lý do được nói ra, không bao giờ là phản xạ.',
    ),
    source: { name: 'Kimball Group — dimensional modeling techniques', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/' },
  },
  {
    term: 'Natural key',
    gloss: 'khoá tự nhiên',
    means: bi(
      'A key the source mints, like order_id — free and meaningful, and outside your control. A10 is where that bill arrives.',
      'Khoá do nguồn tạo ra, như order_id — miễn phí và có ý nghĩa, nhưng nằm ngoài tầm kiểm soát của bạn. A10 là lúc hoá đơn đó tới.',
    ),
    source: { name: 'Kimball Group — dimensional modeling techniques', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/' },
  },
]
