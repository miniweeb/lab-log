import type { TheorySection, Term } from '../types'
import { bi } from '../types'

export const a10Theory: TheorySection[] = [
  /* ─────────── TẦNG 1 ─────────── */
  {
    level: 'problem',
    heading: bi(
      'The shape of the input changed, and your history did not',
      'Hình dạng dữ liệu vào đã đổi, còn lịch sử thì không',
    ),
    paras: [
      bi(
        'The upstream team at shopcore emailed after the fact: export v2 shipped on July 16, v3 on August 1, "should be backwards compatible". Three columns were appended, then a column was renamed, a key changed type, a field appeared inside the items JSON, and the column order moved.',
        'Đội bên shopcore gửi mail sau khi chuyện đã rồi: bản export v2 phát hành ngày 16 tháng 7, v3 ngày 1 tháng 8, "chắc là vẫn tương thích ngược". Thực tế: ba cột được thêm vào cuối, rồi một cột bị đổi tên, một khoá đổi kiểu, một field mới xuất hiện bên trong JSON của items, và thứ tự cột thay đổi.',
      ),
      bi(
        'Your 45 files of month 1 do not get rewritten. From today the pipeline must read three shapes at once, forever. That is the part people miss: schema evolution is not a migration you finish, it is a set of eras you carry.',
        'Bốn mươi lăm file của tháng 1 không được viết lại. Từ hôm nay pipeline phải đọc ba hình dạng cùng lúc, và mãi về sau vẫn thế. Đây là chỗ hay bị bỏ qua: schema evolution không phải một lần chuyển đổi rồi xong, mà là một tập các era phải mang theo.',
      ),
      bi(
        'Two of the changes stop your loader with an error. The rename does not stop anything. A reader that matches columns by name gives you both payment_method and payment_type, each NULL on the other era\'s files, and reports success. You meet that with your own eyes in Task 3.',
        'Hai trong số các thay đổi làm loader dừng lại kèm lỗi. Riêng cái rename thì không làm dừng gì cả. Một reader ghép cột theo tên sẽ trả về cả payment_method lẫn payment_type, mỗi cột NULL ở phần file của era kia, và báo là chạy xong. Task 3 cho bạn nhìn thấy chuyện đó tận mắt.',
      ),
      bi(
        'And the corrections from A08 cross the boundary. A v3 file carries about 705 late corrections to orders that sit in your lake as BIGINT ids. The string \'ORD-2070012345\' never equals the number 2070012345 in a join, so every one of those corrections misses — and in an upsert it inserts as a brand new order instead.',
        'Chưa hết, các bản sửa từ A08 đi xuyên qua ranh giới era. Một file v3 mang theo khoảng 705 bản sửa cho những đơn hàng đang nằm trong lake dưới dạng id kiểu BIGINT. Chuỗi \'ORD-2070012345\' không bao giờ bằng số 2070012345 trong một phép join, nên toàn bộ số bản sửa đó trượt — và trong một lệnh upsert, chúng được insert vào như đơn hàng mới hoàn toàn.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Which of the three changes is the most dangerous, and why is it not the one that crashes?',
          'Trong ba loại thay đổi, cái nào nguy hiểm nhất, và vì sao lại không phải cái làm chương trình chết?',
        ),
        a: bi(
          'The rename. A crash stops the pipeline and hands you a stack trace within minutes. The rename loads, reports success, and leaves payment_method NULL for every row after July 31 — a column that quietly becomes two-thirds empty. Nobody looks until a dashboard is questioned weeks later.',
          'Cái rename. Chương trình chết thì pipeline dừng và bạn có stack trace trong vài phút. Còn rename thì nạp xong, báo thành công, và để payment_method rỗng cho mọi dòng sau ngày 31 tháng 7 — một cột lặng lẽ trống mất hai phần ba. Không ai ngó tới cho đến khi có người thắc mắc về một dashboard, hàng tuần sau đó.',
        ),
      },
      {
        q: bi(
          'The loader fails on 2026-07-16 with "It was not possible to automatically detect the CSV parsing dialect". Is the delimiter the problem?',
          'Loader chết ở file 2026-07-16 với thông báo "It was not possible to automatically detect the CSV parsing dialect". Vấn đề có phải ở dấu phân cách không?',
        ),
        a: bi(
          'No. You handed read_csv 10 columns and the file has 13; the sniffer gives up and reports it as a dialect problem. Task 2 has you run the A06 contract gate on the same file — it names the unexpected columns. That difference between a cryptic crash and an actionable message is the entire argument for contracts.',
          'Không. Bạn đưa cho read_csv 10 cột trong khi file có 13; bộ sniffer bó tay và báo ra thành lỗi dấu phân cách. Task 2 bắt bạn chạy contract gate của A06 trên đúng file đó — nó gọi tên đúng các cột lạ. Khoảng cách giữa một lỗi khó hiểu và một thông báo dùng được chính là toàn bộ lý do contract tồn tại.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 2 ─────────── */
  {
    level: 'alternatives',
    heading: bi(
      'Four ways to survive three schemas, and what each one costs',
      'Bốn cách sống sót qua ba schema, và cái giá của từng cách',
    ),
    paras: [
      bi(
        'Every one of these is in production somewhere right now. The question is not which is clever, it is which one leaves the rest of your pipeline with a single shape to reason about.',
        'Cả bốn cách đều đang chạy thật ở đâu đó vào lúc này. Câu hỏi không phải cái nào khôn hơn, mà là cái nào để lại cho phần còn lại của pipeline đúng một hình dạng để làm việc.',
      ),
    ],
    alternatives: [
      {
        name: bi('Just point union_by_name at everything', 'Cứ chĩa union_by_name vào tất cả'),
        appeal: bi(
          'One flag, no code. DuckDB matches columns by name across files, pads missing ones with NULL, and reads all three eras in a single statement.',
          'Một tham số, không cần viết code. DuckDB ghép cột theo tên qua các file, cột thiếu thì độn NULL, và đọc được cả ba era trong một câu lệnh.',
        ),
        breaks: bi(
          'It papers over additive changes and hides renames. You get payment_method and payment_type as two separate columns, each half NULL, and order_id promoted to VARCHAR because the v3 strings forced it — so your BIGINT history no longer joins. Nothing errors. It is an exploration tool for Task 3, not a load path.',
          'Nó che được các thay đổi kiểu thêm cột, nhưng giấu mất phép đổi tên. Bạn nhận về payment_method và payment_type thành hai cột riêng, mỗi cột NULL một nửa, còn order_id bị đẩy lên VARCHAR vì mấy chuỗi của v3 — thế là lịch sử kiểu BIGINT không join được nữa. Không lỗi nào báo. Đây là công cụ để thăm dò ở Task 3, không phải đường nạp dữ liệu.',
        ),
      },
      {
        name: bi('Read every column as VARCHAR and sort it out later', 'Đọc mọi cột thành VARCHAR rồi tính sau'),
        appeal: bi(
          'Nothing can fail to cast if nothing is cast. Load first, decide later — the schema-on-read promise.',
          'Không cast gì thì không có phép cast nào hỏng được. Cứ nạp trước, quyết sau — đúng lời hứa của schema-on-read.',
        ),
        breaks: bi(
          'The decision does not disappear, it moves to every query downstream, and each analyst makes it differently. The rename is still there, the column reorder is still there, and now you have neither types nor errors. You have deferred the work and lost the checks.',
          'Quyết định không biến mất, nó chuyển xuống mọi query phía sau, và mỗi người phân tích lại quyết một kiểu. Cái rename vẫn còn đó, thứ tự cột đổi vẫn còn đó, mà giờ bạn không có kiểu dữ liệu lẫn thông báo lỗi. Bạn hoãn được việc và mất luôn các phép kiểm.',
        ),
      },
      {
        name: bi('One table per era, UNION them at query time', 'Mỗi era một bảng, tới lúc query thì UNION lại'),
        appeal: bi(
          'Each table is honest about the era it holds. No mapping, no defaults, no invented values — the raw shape is preserved exactly as delivered.',
          'Mỗi bảng trung thực với era mà nó chứa. Không ánh xạ, không giá trị mặc định, không bịa thêm gì — hình dạng gốc được giữ đúng như lúc nhận.',
        ),
        breaks: bi(
          'Every consumer now has to know the era table. Marts, contracts, quality checks, the A08 dedupe view — each one grows a branch per era, and a fourth era means editing all of them. The mapping still gets written; it just gets written many times, by many people, differently.',
          'Giờ mọi người dùng đều phải biết tới bảng của từng era. Marts, contract, các phép kiểm chất lượng, view dedupe của A08 — mỗi thứ mọc thêm một nhánh cho mỗi era, và có era thứ tư thì phải sửa hết. Phép ánh xạ vẫn phải viết; chỉ là nó bị viết nhiều lần, bởi nhiều người, mỗi người một kiểu.',
        ),
      },
      {
        name: bi('Canonical schema plus one normalizer per era', 'Một canonical schema kèm mỗi era một normalizer'),
        appeal: bi(
          'Define one target schema. Write one small SELECT per era that renames, casts and fills in what is missing. Everything downstream — staging, core, marts, contracts — sees exactly one shape and never learns which era a row came from.',
          'Định nghĩa đúng một schema đích. Mỗi era viết một câu SELECT nhỏ để đổi tên, cast kiểu và điền vào chỗ thiếu. Mọi thứ phía sau — staging, core, marts, contract — chỉ nhìn thấy một hình dạng duy nhất và không bao giờ phải biết một dòng đến từ era nào.',
        ),
        breaks: bi(
          'It costs a per-era mapping you must maintain, and it demands a decision on every backfilled column: is the missing value known or unknown? Get that wrong and you have invented data. This is what you build today.',
          'Cái giá là một bảng ánh xạ cho mỗi era mà bạn phải nuôi, và nó bắt bạn quyết định cho từng cột phải điền thêm: giá trị thiếu đó là đã biết hay không biết? Quyết sai là bịa dữ liệu. Đây chính là thứ bạn dựng hôm nay.',
        ),
      },
    ],
    checks: [
      {
        q: bi(
          'v1 rows have no currency and no channel. Why does one get a default and the other get NULL?',
          'Dòng v1 không có currency và cũng không có channel. Vì sao một cột được điền giá trị mặc định còn cột kia để NULL?',
        ),
        a: bi(
          'Because one value is known and the other is not. Every v1 order really was in USD, so \'USD\' is a fact you can write down. Nobody recorded the channel in v1, so any value you pick is invented. Known value → default; unknown value → NULL. And discount_amount = 0 for v1 is a known value too, which is what makes the new reconciliation rule work on all three eras.',
          'Vì một giá trị thì đã biết, còn giá trị kia thì không. Mọi đơn hàng v1 đều thực sự tính bằng USD, nên \'USD\' là một sự thật ghi được. Còn channel thì v1 không ai ghi lại, nên chọn giá trị nào cũng là bịa. Biết thì điền mặc định; không biết thì để NULL. Trường discount_amount bằng 0 cho v1 cũng thuộc loại đã biết, và chính nó làm cho quy tắc đối soát mới chạy đúng trên cả ba era.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 3 ─────────── */
  {
    level: 'idea',
    heading: bi(
      'One shape at the door, so nothing behind it has to care',
      'Một hình dạng duy nhất ở cửa, để phía sau không ai phải bận tâm',
    ),
    paras: [
      bi(
        'The whole assignment is one sentence: put a thin per-era translation layer at the entrance, and let every era pass through it into a single canonical schema. Era knowledge lives in exactly one file and nowhere else.',
        'Cả bài gói trong một câu: đặt một lớp dịch mỏng cho từng era ngay ở cửa vào, và cho mọi era đi qua nó để thành một canonical schema duy nhất. Kiến thức về era nằm đúng ở một file, không ở đâu khác.',
      ),
      bi(
        'The layer splits in two, and the split is the design. An ALIGNER does schema work only — rename, build ids, add the missing columns — and outputs the same 15 columns for every era. Then ONE shared CANONICALIZER does the value cleaning you wrote in A03. The aligner knows about eras; the canonicalizer never does.',
        'Lớp đó tách làm hai, và chính chỗ tách này là thiết kế. Một aligner chỉ làm việc về schema — đổi tên, dựng id, thêm cột còn thiếu — và trả ra đúng 15 cột giống nhau cho mọi era. Sau đó đúng một canonicalizer dùng chung làm phần làm sạch giá trị mà bạn đã viết ở A03. Aligner biết về era; canonicalizer thì không bao giờ biết.',
      ),
      bi(
        'The proof that it worked is not that the code runs. It is that one formula now holds across all three eras: order_total equals items total minus discount_amount, at roughly 99.4% on every era, including the 45 v1 days that never had a discount column. That number is the assignment passing its own test.',
        'Bằng chứng cho việc nó chạy đúng không nằm ở chỗ code chạy được. Nó nằm ở chỗ một công thức duy nhất giờ đúng trên cả ba era: order_total bằng tổng tiền items trừ discount_amount, đạt khoảng 99,4% ở mọi era, kể cả 45 ngày v1 vốn chưa từng có cột discount. Con số đó là bài này tự vượt qua phép thử của chính nó.',
      ),
      bi(
        'And the key gets two columns instead of one: order_id VARCHAR in the \'ORD-…\' form for the future, order_id_num BIGINT for matching history. Not a patch — the format becomes something your warehouse owns, while shopcore keeps owning the meaning.',
        'Còn khoá thì được hai cột thay vì một: order_id kiểu VARCHAR ở dạng \'ORD-…\' để dùng về sau, và order_id_num kiểu BIGINT để khớp với lịch sử. Đây không phải bản vá — định dạng trở thành thứ warehouse của bạn nắm, còn ý nghĩa thì shopcore vẫn nắm.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Why keep the aligner and the canonicalizer as two separate layers instead of one SELECT per era?',
          'Vì sao phải tách aligner và canonicalizer thành hai lớp, thay vì mỗi era một câu SELECT làm hết?',
        ),
        a: bi(
          'Because the cleaning rules would then be copied three times. Fix a timestamp format and you fix it in three places, or in two and forget the third. With the split there is one copy of every cleaning rule, and a fourth era costs you one aligner.',
          'Vì như thế các quy tắc làm sạch sẽ bị chép ba lần. Sửa một định dạng timestamp là phải sửa ở ba chỗ, hoặc sửa hai chỗ rồi quên chỗ thứ ba. Tách ra thì mỗi quy tắc làm sạch chỉ có một bản, và thêm một era thứ tư chỉ tốn thêm một aligner.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 4 ─────────── */
  {
    level: 'mechanism',
    heading: bi(
      'Where each piece can quietly go wrong',
      'Chỗ nào của từng mảnh có thể hỏng trong im lặng',
    ),
    paras: [
      bi(
        'Finding the era boundaries: do not sniff types, compare header lines. Sniffed types wobble from file to file for reasons that have nothing to do with schema — a day with no NULLs in a column reads differently from a day with some. The header string is cheap and stable. Group 69 files by their first line and you get exactly 3 groups: 45, 16, 8.',
        'Tìm ranh giới era: đừng dò kiểu dữ liệu, hãy so dòng header. Kiểu do sniffer đoán ra dao động giữa các file vì những lý do chẳng liên quan gì tới schema — một ngày mà cột nào đó không có NULL sẽ đọc ra khác với ngày có NULL. Còn chuỗi header thì rẻ và ổn định. Gom 69 file theo dòng đầu tiên, bạn được đúng 3 nhóm: 45, 16 và 8.',
      ),
      bi(
        'The columns= argument maps by POSITION, not by name. The header row is skipped, not matched. v3 moved currency, discount_amount, channel and loyalty_tier ahead of items and meta — list them in the v2 order and DuckDB loads the string \'USD\' into your items column without raising anything, because both sides are VARCHAR-ish. Build V3_COLS from the header you actually printed, then spot-check two values.',
        'Tham số columns= ánh xạ theo VỊ TRÍ chứ không theo tên. Dòng header chỉ bị bỏ qua, không được đem ra khớp. Bản v3 đã đẩy currency, discount_amount, channel và loyalty_tier lên trước items và meta — liệt kê chúng theo thứ tự của v2 thì DuckDB sẽ nạp chuỗi \'USD\' vào cột items mà không báo gì hết, vì hai bên đều thuộc dạng VARCHAR. Hãy dựng V3_COLS từ đúng cái header bạn đã in ra, rồi kiểm tra tay hai giá trị bất kỳ.',
      ),
      bi(
        'The nested change comes free if you cast into the target struct. v1 items JSON has no disc field; cast it into STRUCT(sku, qty, unit_price, disc)[] and disc simply comes out NULL for every v1 row. A backfill inside a nested type, with no extra code.',
        'Thay đổi bên trong kiểu lồng nhau thì tự giải quyết nếu bạn cast thẳng vào struct đích. JSON items của v1 không có field disc; cast nó vào STRUCT(sku, qty, unit_price, disc)[] thì disc ra NULL cho mọi dòng v1. Cột thiếu bên trong kiểu lồng được điền mà không tốn dòng code nào.',
      ),
      bi(
        'The canonicalizer keeps the A03 WHERE that drops rows whose timestamp cannot be parsed at all — roughly 0.02% of rows, the impossible dates. They have no order_date, so they cannot be partitioned. Count them on every single run: a dropped row you did not count is a lie in your row math, and the identity check in Task 7 will not close without that number.',
        'Canonicalizer giữ nguyên mệnh đề WHERE của A03, loại các dòng có timestamp không parse được cách nào — khoảng 0,02% số dòng, tức mấy ngày bất khả thi. Chúng không có order_date nên không partition được. Phải đếm chúng ở mọi lần chạy: một dòng bị loại mà không đếm là một chỗ nói dối trong phép cộng số dòng, và phép kiểm ở Task 7 sẽ không khớp nếu thiếu con số đó.',
      ),
      bi(
        'Staging carries exactly two lineage columns and no more: _data_date for the delivery a row came from, _run_id for the run that wrote it. The file name, the load time and the status are facts about the run, and they live on the ops.etl_runs row that _run_id points at. Eighteen columns out — the sixteen canonical ones plus that pair.',
        'Bảng staging mang đúng hai cột lineage, không hơn: _data_date cho biết dòng đó đến từ lần giao nào, và _run_id cho biết lần chạy nào đã ghi nó. Tên file, thời điểm load và trạng thái là những sự thật về lần chạy, chúng nằm ở dòng trong ops.etl_runs mà _run_id trỏ tới. Ra mười tám cột — mười sáu cột canonical cộng thêm cặp đó.',
      ),
      bi(
        'The lake gets neither of the two. Parquet under lake/ is re-derivable storage, not a warehouse table, and the month-1 half is a bulk migration of files A02 wrote — their delivery dates are gone. order_date is not a substitute: late rows are exactly the rows whose file date differs from their order date. A uniformly lineage-free lake beats one stamped on the half you happen to know.',
        'Còn lake thì không nhận cột nào trong hai cột đó. Parquet nằm dưới lake/ là kho dựng lại được, không phải bảng warehouse, và nửa của tháng 1 là một lần chuyển hàng loạt từ những file A02 đã ghi — ngày giao của chúng không còn nữa. Cột order_date không thay thế được: dòng về trễ chính là những dòng có ngày file khác ngày đơn hàng. Một lake sạch cột lineage đồng đều còn hơn một lake chỉ đóng dấu được nửa mà bạn tình cờ biết.',
      ),
    ],
    checks: [
      {
        q: bi(
          'The correction join in Task 6 returns 0 for raw ids and 705 for canonical ids. What would 0 have meant in production?',
          'Phép join bản sửa ở Task 6 ra 0 với id thô và 705 với id đã canonical. Nếu ở môi trường thật thì con số 0 đó nghĩa là gì?',
        ),
        a: bi(
          'That all 705 corrections would have upserted as new orders. Same customers, same amounts, counted twice. No error, no failed run, no alert — just a revenue number that is quietly too high, and 705 orders that exist in two forms. This single join is why order_id_num exists.',
          'Nghĩa là cả 705 bản sửa sẽ được upsert vào như đơn hàng mới. Cùng khách, cùng số tiền, đếm hai lần. Không lỗi, không lần chạy thất bại, không cảnh báo — chỉ có một con số doanh thu cao hơn thực tế trong im lặng, và 705 đơn hàng tồn tại dưới hai dạng. Đúng một phép join này là lý do cột order_id_num tồn tại.',
        ),
      },
      {
        q: bi(
          'You list V3_COLS in the v2 order and the load reports success. How do you find out?',
          'Bạn khai V3_COLS theo thứ tự của v2 và lần nạp báo thành công. Làm sao phát hiện ra?',
        ),
        a: bi(
          'Not from the loader — it has nothing to complain about, every column is VARCHAR-ish and every value fits. You find it by looking: SELECT two rows after reading a new explicit schema, and check that items still looks like JSON and currency still looks like a currency code. Two seconds of looking, once per new era.',
          'Không phải từ loader — nó chẳng có gì để phàn nàn, mọi cột đều thuộc dạng VARCHAR và mọi giá trị đều vừa. Bạn phát hiện bằng cách nhìn: SELECT ra hai dòng sau khi khai một schema tường minh mới, rồi kiểm xem items có còn giống JSON không và currency có còn giống mã tiền tệ không. Hai giây để nhìn, mỗi era mới một lần.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 5 ─────────── */
  {
    level: 'detail',
    heading: bi(
      'The key ladder, the write mode, and the file that is not drifted',
      'Ba nấc thang của khoá, chế độ ghi, và cái file không hề drift',
    ),
    paras: [
      bi(
        'Name what you built: a warehouse-controlled canonical key. shopcore still supplies the meaning — which order this is — while your warehouse owns the format. There are three rungs on that ladder and you should be able to argue all three, because you now have evidence instead of a preference.',
        'Hãy gọi đúng tên thứ bạn vừa dựng: một canonical key do warehouse kiểm soát. shopcore vẫn cung cấp ý nghĩa — đây là đơn hàng nào — còn warehouse của bạn nắm phần định dạng. Nấc thang này có ba bậc và bạn nên bảo vệ được cả ba, vì bây giờ bạn có bằng chứng chứ không phải sở thích.',
      ),
      bi(
        'Rung (a), use the producer key raw: no code, and every join reads exactly like the source. It just broke on two counts — the type changed, and the late corrections stopped matching history, 0 out of 705. Rung (b), canonicalize: one deterministic expression per era, joins against BIGINT history keep working, no extra state, and any engineer can re-derive the key by eye. Rung (c), a true surrogate key: the warehouse mints its own id and keeps the natural key as an attribute, so shopcore can rename or retype the id and your core.orders key never moves.',
        'Bậc (a), dùng thẳng khoá của nhà cung cấp: không phải viết code, và mọi phép join đọc lên y hệt bên nguồn. Nó vừa hỏng vì hai lẽ — kiểu dữ liệu đã đổi, và các bản sửa về trễ không còn khớp với lịch sử, 0 trên 705. Bậc (b), canonicalize: mỗi era một biểu thức deterministic, join với lịch sử kiểu BIGINT vẫn chạy, không phải giữ thêm trạng thái nào, và bất kỳ kỹ sư nào cũng nhẩm lại được khoá bằng mắt. Bậc (c), một surrogate key thật: warehouse tự sinh id của mình và giữ khoá gốc như một thuộc tính thường, nên shopcore có đổi tên hay đổi kiểu id thì khoá của core.orders vẫn đứng yên.',
      ),
      bi(
        'Rung (c) is not free. Every load needs a key lookup — given this order, what is its surrogate — and late rows mean that lookup hits history, not just today\'s batch. Debugging against the source gains one hop, because your id exists nowhere in shopcore\'s system. And note what it does not buy: the lookup still has to match \'ORD-0000000123\' to 123, so the canonicalization on this page does not disappear, it moves inside the key assignment. Most teams pick (b); teams burned twice pick (c).',
        'Bậc (c) không miễn phí. Mỗi lần nạp phải tra khoá — đơn này thì surrogate của nó là gì — và vì có dòng về trễ nên phép tra đó phải đụng vào lịch sử chứ không chỉ lô hôm nay. Việc dò lỗi ngược về nguồn dài thêm một chặng, vì id của bạn không tồn tại ở bất cứ đâu trong hệ thống shopcore. Và để ý thứ nó không mua được: phép tra vẫn phải khớp \'ORD-0000000123\' với 123, nên phần canonicalize ở trang này không biến mất, nó chỉ chuyển vào bên trong bước gán khoá. Phần lớn các đội chọn (b); đội nào bị đau hai lần thì chọn (c).',
      ),
      bi(
        'Writing the lake day by day: use APPEND, not OVERWRITE_OR_IGNORE. Each day\'s COPY names its files data_0.parquet from scratch, and late rows make day D write into partitions D−7 through D — the same folders earlier days already wrote. With OVERWRITE_OR_IGNORE, day D\'s data_0.parquet replaces the earlier file in a shared partition. This was tested so you do not have to: a 4-million-row lake came out at 45 thousand rows, with no error anywhere. APPEND generates unique file names instead, so a boundary partition ends up holding several Parquet files, one per writer.',
        'Ghi lake theo từng ngày: dùng APPEND, đừng dùng OVERWRITE_OR_IGNORE. Mỗi ngày, lệnh COPY đặt tên file lại từ đầu là data_0.parquet, mà vì có dòng về trễ nên ngày D ghi vào các partition từ D trừ 7 tới D — đúng những thư mục mà các ngày trước đã ghi. Với OVERWRITE_OR_IGNORE, file data_0.parquet của ngày D thay thế file cũ trong partition dùng chung. Chuyện này đã được thử sẵn để bạn khỏi phải thử: một lake 4 triệu dòng ra còn 45 nghìn dòng, không lỗi nào ở đâu cả. APPEND thì sinh tên file khác nhau, nên một partition ở vùng ranh giới sẽ chứa vài file Parquet, mỗi writer một file.',
      ),
      bi(
        'One day, 2026-07-22, refuses to load with another cryptic sniffing error. Do not fix it today — record it as failed in ops.etl_runs, journal one line, move on. Its partition folder will exist anyway, because days 07-23 through 07-29 deliver late corrections into 2026-07-22. That is also why the lake ends with 69 distinct order_date values while only 68 files loaded.',
        'Có một ngày, 2026-07-22, không chịu nạp và ném ra một lỗi sniffing khó hiểu nữa. Đừng sửa nó hôm nay — ghi lại là failed trong ops.etl_runs, viết một dòng vào journal, rồi đi tiếp. Thư mục partition của ngày đó vẫn sẽ tồn tại, vì các ngày từ 07-23 tới 07-29 giao bản sửa về trễ vào đúng ngày 2026-07-22. Đó cũng là lý do lake kết thúc với 69 giá trị order_date khác nhau trong khi chỉ có 68 file được nạp.',
      ),
      bi(
        'And 07-22 teaches the gate one more distinction. sniff_csv does not raise on that file, it degenerates: the broken lines poison dialect detection, the sniffer settles on a delimiter that is not in the data, and returns ONE column whose name is the entire 13-column header line. An untaught gate then reports "missing columns: all of them" — a schema-drift verdict for a file that is not drifted, it is unreadable. A sniffed schema that collapses to a single column with commas in its name is a structural failure, and belongs under quality.structural, not under schema.',
        'Và 07-22 dạy cho gate thêm một sự phân biệt nữa. Hàm sniff_csv không ném lỗi với file đó, nó thoái hoá: mấy dòng hỏng làm nhiễu phần dò dialect, sniffer chốt lấy một dấu phân cách vốn không có trong dữ liệu, rồi trả về ĐÚNG MỘT cột mà tên của nó là cả dòng header 13 cột. Một gate chưa được dạy sẽ báo "thiếu cột: thiếu hết" — tức là kết luận drift schema cho một file không hề drift, nó chỉ là không đọc được. Một schema dò ra mà co lại còn một cột với dấu phẩy nằm trong tên thì đó là hỏng cấu trúc, và phải xếp vào quality.structural chứ không phải vào phần schema.',
      ),
      bi(
        'Last, the process side. The contract\'s change_management block required 30 days\' notice in #shopcore-data-changes plus a semver MAJOR bump for a rename or a type change; even the v2 additions needed 7 days. shopcore shipped both eras and emailed afterwards. Citing change_management.notice_breaking in your incident note is what turns "the data broke" into a producer incident with an owner — and your own amendments go 1.3.0 → 2.0.0 → 3.0.0, because rewriting the meaning of an existing business rule breaks every consumer that reconciles.',
        'Cuối cùng là phía quy trình. Khối change_management trong contract yêu cầu báo trước 30 ngày ở kênh #shopcore-data-changes kèm một lần tăng số MAJOR theo semver cho mỗi phép đổi tên hay đổi kiểu; ngay cả mấy cột thêm ở v2 cũng cần báo trước 7 ngày. shopcore phát hành cả hai era rồi mới gửi mail. Việc trích dẫn change_management.notice_breaking trong ghi chép sự cố là thứ biến "dữ liệu hỏng" thành một sự cố có chủ sở hữu bên phía nhà cung cấp — còn các bản sửa đổi của chính bạn thì đi 1.3.0 rồi 2.0.0 rồi 3.0.0, vì viết lại ý nghĩa của một quy tắc nghiệp vụ đang có sẽ làm hỏng mọi bên tiêu thụ có đối soát.',
      ),
    ],
    checks: [
      {
        q: bi(
          'The three v2 columns alone would be a minor version bump. Why is the v2 amendment 2.0.0?',
          'Chỉ riêng ba cột mới của v2 thì chỉ đáng tăng số minor. Vì sao bản sửa đổi cho v2 lại là 2.0.0?',
        ),
        a: bi(
          'Because of the rule change that came with them: order_total now means items total minus discount. Adding a column that old readers can ignore is additive. Rewriting what an existing column means breaks every consumer that reconciles against it — and those consumers will not error, they will just start disagreeing. That is a MAJOR bump, which is exactly why the 30-day notice clause applied.',
          'Vì thay đổi quy tắc đi kèm: order_total bây giờ có nghĩa là tổng tiền items trừ discount. Thêm một cột mà reader cũ bỏ qua được thì chỉ là thêm. Còn viết lại ý nghĩa của một cột đang có thì làm hỏng mọi bên tiêu thụ đang đối soát dựa vào nó — mà những bên đó sẽ không báo lỗi, họ chỉ bắt đầu ra số khác. Đó là mức MAJOR, và cũng chính vì vậy mà điều khoản báo trước 30 ngày được áp dụng.',
        ),
      },
      {
        q: bi(
          'Task 7 says 69 distinct order_date values but only 68 files loaded. Where does the extra date come from?',
          'Task 7 nói lake có 69 giá trị order_date khác nhau trong khi chỉ 68 file được nạp. Ngày dư ra đó ở đâu ra?',
        ),
        a: bi(
          'From late corrections. The 07-22 file never loaded, but days 07-23 through 07-29 each carry corrections to orders whose order_date is 2026-07-22, and those rows land in that partition. The folder exists and holds real data — just not the data the 07-22 delivery would have brought.',
          'Từ các bản sửa về trễ. File 07-22 không nạp được, nhưng các ngày từ 07-23 tới 07-29 đều mang theo bản sửa cho những đơn hàng có order_date là 2026-07-22, và mấy dòng đó rơi vào đúng partition ấy. Thư mục tồn tại và có dữ liệu thật — chỉ là không phải dữ liệu mà lần giao ngày 07-22 lẽ ra đem tới.',
        ),
      },
    ],
  },
]

export const a10Terms: Term[] = [
  {
    term: 'Schema evolution',
    gloss: 'cấu trúc dữ liệu vào thay đổi theo thời gian',
    means: bi(
      'The structure of your input changes while the pipeline keeps running: columns added, renamed, retyped, reordered. Your history does not change, so from that day on the pipeline reads every version at once, forever.',
      'Cấu trúc dữ liệu đầu vào thay đổi trong lúc pipeline vẫn chạy: cột được thêm, đổi tên, đổi kiểu, đổi thứ tự. Lịch sử thì không đổi, nên từ ngày đó trở đi pipeline phải đọc mọi phiên bản cùng lúc, và mãi về sau vẫn thế.',
    ),
    source: {
      name: 'Delta Lake protocol — schema evolution rules',
      url: 'https://docs.delta.io/latest/delta-batch.html#automatic-schema-update',
    },
  },
  {
    term: 'Era',
    gloss: 'một khoảng ngày dùng chung một schema',
    means: bi(
      'A date range over which the incoming schema is stable. This feed has three: v1 from 06-01 to 07-15 (45 files), v2 to 07-31 (16 files), v3 to 08-08 (8 files). You find the boundaries by grouping files on their header line.',
      'Một khoảng ngày mà schema đầu vào giữ nguyên. Feed này có ba: v1 từ 06-01 tới 07-15 gồm 45 file, v2 tới 07-31 gồm 16 file, v3 tới 08-08 gồm 8 file. Tìm ranh giới bằng cách gom file theo dòng header.',
    ),
    source: {
      name: 'Apache Iceberg — schema evolution spec',
      url: 'https://iceberg.apache.org/spec/#schema-evolution',
    },
  },
  {
    term: 'Canonical schema',
    gloss: 'schema đích duy nhất mọi era phải quy về',
    means: bi(
      'One target schema every era is mapped into, so staging, core, marts and contracts see exactly one shape and never learn which era a row came from.',
      'Một schema đích duy nhất mà mọi era đều được ánh xạ vào, để staging, core, marts và contract chỉ nhìn thấy một hình dạng và không bao giờ phải biết một dòng đến từ era nào.',
    ),
    source: {
      name: 'SQLMesh — model kinds and column-level contracts',
      url: 'https://sqlmesh.readthedocs.io/en/stable/concepts/models/model_kinds/',
    },
  },
  {
    term: 'Aligner',
    gloss: 'lớp chỉ chỉnh schema, mỗi era một cái',
    means: bi(
      'A per-era SELECT that does schema work only — rename, build the id pair, add missing columns — and outputs the same 15 columns for every era. It knows about eras so nothing else has to.',
      'Một câu SELECT riêng cho mỗi era, chỉ làm phần schema: đổi tên, dựng cặp id, thêm cột thiếu, rồi trả ra đúng 15 cột giống nhau cho mọi era. Nó biết về era để những chỗ khác khỏi phải biết.',
    ),
  },
  {
    term: 'Canonicalizer',
    gloss: 'lớp làm sạch giá trị, dùng chung cho mọi era',
    means: bi(
      'The single shared SELECT that applies your A03 value cleaning — timestamps, amounts, the items struct — to already-aligned rows. Era-blind on purpose: one copy of every cleaning rule.',
      'Câu SELECT dùng chung duy nhất, áp phần làm sạch giá trị của A03 — timestamp, số tiền, struct items — lên những dòng đã được align. Cố ý không biết gì về era: mỗi quy tắc làm sạch chỉ có một bản.',
    ),
  },
  {
    term: 'union_by_name',
    gloss: 'ghép cột theo tên khi đọc nhiều file',
    means: bi(
      'A read_csv flag that matches columns by name across files and pads missing ones with NULL. An exploration tool: it papers over additive changes, hides renames as two half-NULL columns, and promotes a key to VARCHAR when one era sends strings.',
      'Một tham số của read_csv, ghép cột theo tên qua nhiều file và độn NULL vào cột thiếu. Đây là công cụ thăm dò: nó che được các thay đổi kiểu thêm cột, giấu phép đổi tên thành hai cột NULL một nửa, và đẩy khoá lên VARCHAR khi có một era gửi chuỗi.',
    ),
    source: {
      name: 'DuckDB — multi-file reads and union_by_name',
      url: 'https://duckdb.org/docs/stable/data/multiple_files/combining_schemas',
    },
  },
  {
    term: 'Positional column mapping',
    gloss: 'columns= khớp theo vị trí, không theo tên',
    means: bi(
      'The columns= argument of read_csv assigns names by position; the header row is skipped, not matched. List a reordered era in the old order and values land in the wrong columns with no error raised.',
      'Tham số columns= của read_csv gán tên theo vị trí; dòng header chỉ bị bỏ qua chứ không đem ra khớp. Khai một era đã đổi thứ tự theo thứ tự cũ thì giá trị rơi vào sai cột mà không lỗi nào được ném ra.',
    ),
    source: {
      name: 'DuckDB — read_csv columns parameter',
      url: 'https://duckdb.org/docs/stable/data/csv/overview',
    },
  },
  {
    term: 'Silent vs loud failure',
    gloss: 'hỏng im lặng và hỏng có báo',
    means: bi(
      'A loud failure stops the pipeline with an error. A silent one loads wrong data and reports success. Loud failures are gifts; the rename and the column reorder are the silent ones here.',
      'Hỏng có báo thì pipeline dừng lại kèm lỗi. Hỏng im lặng thì nạp dữ liệu sai và báo thành công. Hỏng có báo là món quà; ở bài này, phép đổi tên và việc đổi thứ tự cột thuộc loại im lặng.',
    ),
  },
  {
    term: 'Backfill default',
    gloss: 'điền vào chỗ thiếu bằng đúng loại không-có',
    means: bi(
      'Known value becomes a default, unknown value becomes NULL. v1 orders really were USD, so currency gets \'USD\'; v1 had no discounts, so discount_amount gets 0; nobody recorded channel, so it gets NULL. Never invent data.',
      'Giá trị đã biết thì điền mặc định, giá trị không biết thì để NULL. Đơn hàng v1 đúng là tính bằng USD nên currency được \'USD\'; v1 không có giảm giá nên discount_amount được 0; channel thì không ai ghi lại nên để NULL. Đừng bịa dữ liệu.',
    ),
  },
  {
    term: 'Natural key',
    gloss: 'khoá do nguồn cấp, mình không kiểm soát',
    means: bi(
      'A key that arrives with the data, minted by the producer. Meaningful and free, but outside your control — which is what you just watched when order_id changed type underneath you.',
      'Khoá đi kèm dữ liệu, do bên cung cấp sinh ra. Có ý nghĩa và không tốn gì, nhưng nằm ngoài tầm kiểm soát của bạn — đúng như chuyện vừa xảy ra khi order_id đổi kiểu ngay dưới chân.',
    ),
    source: {
      name: 'Kimball Group — surrogate keys',
      url: 'https://www.kimballgroup.com/1998/05/surrogate-keys/',
    },
  },
  {
    term: 'Warehouse-controlled canonical key',
    gloss: 'nguồn giữ ý nghĩa, warehouse giữ định dạng',
    means: bi(
      'One deterministic expression per era turns the producer key into a fixed format your warehouse owns, while the producer keeps owning which entity it points at. Here: order_id VARCHAR for the future, order_id_num BIGINT for matching history.',
      'Mỗi era một biểu thức deterministic biến khoá của nguồn thành một định dạng cố định do warehouse nắm, còn nguồn vẫn nắm phần nó trỏ tới thực thể nào. Ở đây: order_id kiểu VARCHAR để dùng về sau, order_id_num kiểu BIGINT để khớp lịch sử.',
    ),
  },
  {
    term: 'Surrogate key',
    gloss: 'khoá do warehouse tự sinh',
    means: bi(
      'The warehouse mints its own id — a sequence or a hash — and keeps the natural key as an ordinary attribute. Fully decoupled from the producer, at the cost of a key lookup on every load that must reach into history, and one more hop when debugging against the source.',
      'Warehouse tự sinh id của mình — một dãy số hoặc một giá trị băm — và giữ khoá gốc như một thuộc tính thường. Tách hẳn khỏi bên cung cấp, đổi lại mỗi lần nạp phải tra khoá và phép tra đó còn phải với vào lịch sử, cộng thêm một chặng nữa mỗi khi dò lỗi ngược về nguồn.',
    ),
    source: {
      name: 'Kimball Group — surrogate keys',
      url: 'https://www.kimballgroup.com/1998/05/surrogate-keys/',
    },
  },
  {
    term: 'Structural failure',
    gloss: 'file không đọc được, khác với file drift',
    means: bi(
      'A file whose dialect cannot be detected at all — sniff_csv degenerates and returns one column whose name is the whole header line. That is not schema drift, and reporting it as drift sends you looking for a change that never happened.',
      'File mà dialect không dò ra được — sniff_csv thoái hoá và trả về một cột duy nhất với cái tên là cả dòng header. Đó không phải drift schema, và báo nó thành drift sẽ khiến bạn đi tìm một thay đổi chưa từng xảy ra.',
    ),
    source: {
      name: 'datacontract CLI — test và phân loại lỗi theo block',
      url: 'https://cli.datacontract.com/',
    },
  },
  {
    term: 'Contract amendment',
    gloss: 'sửa đổi contract, có hiệu lực từ một ngày',
    means: bi(
      'A versioned change to the contract carrying its own effective_from, so the gate can hold all three versions at once and validate each file against the version in force on its date.',
      'Một thay đổi có đánh version cho contract, mang theo mốc effective_from của riêng nó, để gate giữ được cả ba phiên bản cùng lúc và kiểm mỗi file theo phiên bản đang có hiệu lực vào ngày của file đó.',
    ),
    source: {
      name: 'Data Contract Specification — versioning',
      url: 'https://datacontract.com/',
    },
  },
]