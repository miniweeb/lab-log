import type { TheorySection, Term } from '../types'
import { bi } from '../types'

export const a14Theory: TheorySection[] = [
  /* ─────────── TẦNG 1 ─────────── */
  {
    level: 'problem',
    heading: bi(
      'Every team owns a job that is correct and slow',
      'Đội nào cũng có một cái job vừa đúng vừa chậm',
    ),
    paras: [
      bi(
        'Today you inherit one. A colleague left, their nightly job still runs, it still produces the right numbers, and it takes seventy seconds at small scale and twenty minutes at full. Nobody has touched it because touching it means risking the numbers.',
        'Hôm nay bạn nhận lại một cái như vậy. Một đồng nghiệp nghỉ việc, cái job chạy đêm của họ vẫn chạy, vẫn ra đúng số, và nó mất bảy mươi giây ở scale small, hai mươi phút ở scale full. Chẳng ai dám đụng vào, vì đụng vào là có nguy cơ làm sai số.',
      ),
      bi(
        'The trap is that the interesting sins are not the expensive ones. Read that job and you will spot a needless DISTINCT, a string function hiding a date, a pointless ORDER BY — and all three of them together live inside half a second, while one boring step holds ninety-nine percent of the runtime.',
        'Cái bẫy ở đây là mấy lỗi trông thú vị thì lại không phải mấy lỗi tốn thời gian. Đọc cái job đó, bạn sẽ thấy ngay một phép DISTINCT thừa, một hàm chuỗi che mất một cột ngày, một lệnh ORDER BY chẳng ai cần. Nhưng cả ba cái đó cộng lại nằm gọn trong nửa giây, trong khi đúng một bước nhàm chán lại chiếm chín mươi chín phần trăm thời gian chạy.',
      ),
      bi(
        'A job spends 70 seconds in step A and 0.3 seconds in step B. A brilliant 100× fix to B saves you 0,3 giây; a lazy 2× fix to A saves 35. You never optimize a step — you optimize the most expensive step.',
        'Giả sử một job mất 70 giây ở bước A và 0,3 giây ở bước B. Một pha sửa xuất sắc làm bước B nhanh gấp 100 lần thì tiết kiệm được 0,3 giây; còn một pha sửa lười biếng làm bước A nhanh gấp đôi thì tiết kiệm 35 giây. Bạn không bao giờ tối ưu một bước nào đó, bạn tối ưu đúng cái bước tốn nhiều thời gian nhất.',
      ),
      bi(
        'So the skill today is not a bag of tricks. It is a loop: measure, explain, fix, measure again — one change at a time, biggest cost first. Engineers who guess spend a week making the wrong part twice as fast. Engineers who measure spend an hour making the right part a hundred times faster.',
        'Vậy nên kỹ năng của hôm nay không phải một túi mẹo vặt. Nó là một vòng lặp: đo, giải thích, sửa, rồi đo lại, mỗi lần chỉ đổi một thứ và làm từ chỗ tốn nhất trước. Người đoán mò mất cả tuần để làm phần sai nhanh lên gấp đôi. Người chịu đo mất một tiếng để làm phần đúng nhanh lên gấp trăm lần.',
      ),
    ],
    checks: [
      {
        q: bi(
          'You read the inherited job and immediately spot three ugly things. What do you do first?',
          'Bạn đọc cái job vừa nhận và thấy ngay ba chỗ xấu xí. Vậy việc đầu tiên bạn làm là gì?',
        ),
        a: bi(
          'Not fix them. Run it with per-step timings and write the baseline down. Only then do you know which of the three, if any, is worth your afternoon. The ranking is what tells you where to start, and it will surprise you.',
          'Không phải sửa chúng. Hãy chạy nó với đồng hồ đo từng bước rồi ghi lại con số mốc. Chỉ khi đó bạn mới biết trong ba chỗ đó có chỗ nào đáng để bạn bỏ cả buổi chiều ra sửa không. Cái bảng xếp hạng mới là thứ chỉ cho bạn bắt đầu từ đâu, và nó sẽ làm bạn bất ngờ.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 2 ─────────── */
  {
    level: 'alternatives',
    heading: bi(
      'Four ways to make a slow job faster',
      'Bốn cách làm một cái job chậm nhanh lên',
    ),
    paras: [
      bi(
        'Three of these are what people actually do, and they all fail in the same way: the effort lands somewhere other than where the time is.',
        'Ba trong bốn cách này là thứ người ta vẫn làm ngoài đời, và cả ba hỏng theo cùng một kiểu: công sức đổ vào một chỗ khác với chỗ đang ngốn thời gian.',
      ),
    ],
    alternatives: [
      {
        name: bi('Learn a list of tricks and apply them all', 'Học thuộc một danh sách mẹo rồi áp hết vào'),
        appeal: bi(
          'It feels like progress and it is easy to teach. Add indexes, avoid SELECT *, do not use DISTINCT, put the small table on the right side of the join.',
          'Nó cho cảm giác mình đang tiến bộ, mà lại dễ truyền cho người khác. Thêm index, tránh SELECT *, đừng dùng DISTINCT, đặt bảng nhỏ ở bên phải phép join.',
        ),
        breaks: bi(
          'Half the folklore is already out of date — a modern optimizer re-orders joins and picks build sides on its own. And a trick applied to a step that costs 0.3 seconds cannot save you more than 0.3 seconds, no matter how correct the trick is.',
          'Một nửa số mẹo đó đã lỗi thời, vì một optimizer hiện đại tự sắp lại thứ tự join và tự chọn bên nào để dựng bảng băm. Còn một mẹo đúng đắn áp vào một bước vốn chỉ tốn 0,3 giây thì cũng không tiết kiệm nổi hơn 0,3 giây.',
        ),
      },
      {
        name: bi('Fix whatever looks worst in the code', 'Thấy chỗ nào trong code trông tệ nhất thì sửa chỗ đó'),
        appeal: bi(
          'You can start right now, with no tooling and no setup. Bad code usually is slow, so reading carefully feels like a reasonable substitute for measuring.',
          'Bắt tay được ngay, không cần công cụ, không cần chuẩn bị gì. Code tệ thì thường cũng chậm, nên việc đọc kỹ có vẻ thay thế được cho việc đo.',
        ),
        breaks: bi(
          'What looks worst and what costs most are different lists. In the job you inherit today, the three cleverest finds are worth about half a second between them, while the step that nobody would look at twice holds seventy seconds.',
          'Nhưng danh sách những chỗ trông tệ nhất và danh sách những chỗ tốn nhất là hai danh sách khác nhau. Ngay trong cái job bạn nhận hôm nay, ba chỗ đáng khoe nhất cộng lại đáng chừng nửa giây, còn cái bước chẳng ai buồn nhìn tới lần thứ hai thì chiếm bảy mươi giây.',
        ),
      },
      {
        name: bi('Buy a bigger machine', 'Mua một cái máy to hơn'),
        appeal: bi(
          'It needs no code review, no regression risk, and sometimes it really is the cheapest answer — engineer-hours are not free either.',
          'Không cần ai review code, không có rủi ro làm hỏng kết quả, mà đôi khi đúng là cách rẻ nhất thật, vì giờ công của kỹ sư cũng đâu có miễn phí.',
        ),
        breaks: bi(
          'It does not help the failure mode you are about to meet. A million rows crossing the border between SQL and Python one at a time is not waiting on CPU or disk; it is paying a fixed cost a million times. Twice the cores pay it twice as fast at best, and you have made the meter run faster too.',
          'Có điều nó không giúp gì cho kiểu hỏng mà bạn sắp gặp. Một triệu dòng đi qua biên giới giữa SQL và Python từng dòng một thì không hề chờ CPU hay chờ đĩa; nó đang trả một khoản phí cố định một triệu lần. Gấp đôi số lõi thì may lắm trả nhanh gấp đôi, mà đồng hồ tính tiền cũng quay nhanh gấp đôi.',
        ),
      },
      {
        name: bi('Measure, rank by time, fix one thing at a time', 'Đo, xếp hạng theo thời gian, mỗi lần sửa một thứ'),
        appeal: bi(
          'You always know what your next change is worth, because you measured before and after. And when a change makes things worse, you know exactly which change it was.',
          'Lúc nào bạn cũng biết thay đổi tiếp theo đáng giá bao nhiêu, vì đã đo trước và đo sau. Còn khi một thay đổi làm mọi thứ tệ đi, bạn biết chính xác đó là thay đổi nào.',
        ),
        breaks: bi(
          'It is slower to start: you need an honest stopwatch, a way to read the plan, and an equality check ready before the first fix. That setup is most of Task 1, and it is the part people skip.',
          'Đổi lại thì khởi động chậm hơn: bạn cần một cái đồng hồ bấm giờ trung thực, cần cách đọc kế hoạch thực thi, và cần sẵn một phép kiểm bằng nhau trước cả lần sửa đầu tiên. Phần chuẩn bị đó chiếm gần hết Task 1, và cũng chính là phần người ta hay bỏ qua.',
        ),
      },
    ],
    checks: [
      {
        q: bi(
          'Why does the measuring approach insist on one change per measurement?',
          'Vì sao cách làm dựa trên đo đạc lại đòi mỗi lần đo chỉ được đổi một thứ?',
        ),
        a: bi(
          'Because two changes cannot be attributed. Worse, if one of them makes things worse, the pair can cancel out and the measurement looks like nothing happened — so you keep a regression and never know.',
          'Vì đổi hai thứ cùng lúc thì không quy được công cho cái nào. Tệ hơn nữa, nếu một trong hai làm mọi thứ chậm đi thì hai cái triệt tiêu nhau, con số đo được trông như chẳng có gì xảy ra, và bạn giữ lại một chỗ tệ hơn mà không hề biết.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 3 ─────────── */
  {
    level: 'idea',
    heading: bi(
      'Fast and still right, or it does not count',
      'Vừa nhanh vừa vẫn đúng, không thì không tính',
    ),
    paras: [
      bi(
        'The whole assignment is one loop: measure, explain, fix, measure again. Rank by measured time, fix the biggest first, change one thing between measurements, and after every change prove the output did not move.',
        'Cả bài này là một vòng lặp: đo, giải thích, sửa, đo lại. Xếp hạng theo thời gian đo được, sửa cái tốn nhất trước, mỗi lần đo chỉ đổi một thứ, và sau mỗi thay đổi phải chứng minh kết quả không hề xê dịch.',
      ),
      bi(
        'The last part is not a formality. It is entirely possible to make a job fast by making it wrong — delete a DISTINCT that was actually removing duplicates, or simplify away a join that was quietly filtering rows. A speedup without an equality proof is a rumour.',
        'Phần cuối không phải thủ tục cho có. Hoàn toàn có thể làm một cái job nhanh lên bằng cách làm nó sai đi: xoá một phép DISTINCT mà hoá ra nó đang thật sự khử trùng lặp, hoặc gộp mất một phép join mà hoá ra nó đang lặng lẽ lọc bớt dòng. Một con số nhanh hơn mà không kèm bằng chứng kết quả không đổi thì chỉ là tin đồn.',
      ),
      bi(
        'The check itself is the one you already wrote in A08: EXCEPT in both directions, on both artifacts. Run it after every single fix, not once at the end — that way, when it finally returns rows, you know which fix broke it.',
        'Bản thân phép kiểm đó chính là thứ bạn đã viết ở A08: chạy EXCEPT theo cả hai chiều, trên cả hai sản phẩm đầu ra. Hãy chạy nó sau từng lần sửa chứ đừng chạy một lần ở cuối, vì như vậy tới lúc nó trả về dòng nào đó thì bạn biết ngay lần sửa nào làm hỏng.',
      ),
      bi(
        'And know when to stop. Fast enough is a business number, not an ego number: once the nightly job finishes inside its window with room to spare, the next hour of tuning buys nothing anyone will notice.',
        'Và phải biết lúc nào thì dừng. Đủ nhanh là một con số nghiệp vụ chứ không phải một con số để tự hào: khi cái job chạy đêm đã xong sớm hơn hạn với khoảng dư thoải mái, thì một tiếng chỉnh thêm chẳng mang lại gì mà ai đó nhận ra được.',
      ),
    ],
    checks: [
      {
        q: bi(
          'You delete a DISTINCT and the job gets faster. What must you have done before deleting it?',
          'Bạn xoá một phép DISTINCT và cái job nhanh lên. Vậy trước khi xoá, bạn phải làm gì?',
        ),
        a: bi(
          'Counted the rows with and without it, and seen the same number. If the counts differ, DISTINCT was doing real work and you have just introduced duplicates. Never delete on faith — and if your counts do differ, stop and investigate, because a data bug outranks any speedup.',
          'Phải đếm số dòng trong hai trường hợp có và không có nó, rồi thấy hai con số bằng nhau. Nếu hai con số khác nhau thì phép DISTINCT đang làm việc thật, và bạn vừa tạo ra dòng trùng. Đừng bao giờ xoá theo cảm tính — mà nếu số của bạn lệch thật thì hãy dừng lại điều tra, vì một lỗi dữ liệu quan trọng hơn mọi con số tốc độ.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 4 ─────────── */
  {
    level: 'mechanism',
    heading: bi(
      'Where the time goes, and how an engine skips work',
      'Thời gian chảy đi đâu, và engine bỏ bớt việc bằng cách nào',
    ),
    paras: [
      bi(
        'Analytical pipelines spend nearly everything in four places: scanning, which is reading and decoding bytes; joining; aggregating and sorting; and the classic killer, crossing the border between SQL and Python row by row.',
        'Các pipeline phân tích tiêu gần hết thời gian ở bốn chỗ: quét dữ liệu, tức đọc và giải mã byte; join; gom nhóm và sắp xếp; và cái chỗ giết người kinh điển là đi qua biên giới giữa SQL và Python từng dòng một.',
      ),
      bi(
        'That last one deserves its own arithmetic. Every SQL statement carries roughly a millisecond of fixed overhead for parsing, planning and committing. One statement over 60,000 rows pays that once. Sixty thousand single-row INSERTs pay it sixty thousand times, which is a minute of pure overhead before any real work happens. Engines are set-based: they process whole columns at once, and a Python loop over rows throws that away.',
        'Riêng cái cuối cùng đáng được tính ra bằng con số. Mỗi câu lệnh SQL đều mang theo chừng một mili giây phí cố định để phân tích cú pháp, lập kế hoạch và commit. Một câu lệnh chạy trên 60 nghìn dòng thì trả khoản đó đúng một lần. Còn sáu mươi nghìn lệnh INSERT mỗi lệnh một dòng thì trả sáu mươi nghìn lần, tức là một phút phí cố định thuần tuý trước khi có việc thật nào được làm. Engine vốn làm việc theo tập hợp, nó xử lý cả cột một lúc, mà một vòng lặp Python chạy qua từng dòng thì vứt bỏ hết cái lợi thế đó.',
      ),
      bi(
        'On the scanning side, the fastest byte is one never read. Your lake gives the engine three levels of skipping. First, partition pruning from A02: filter on the partition column and whole files never get opened. Second, zone maps: inside a Parquet file rows live in row groups, and each group stores every column\'s minimum and maximum, so a filter on store_id skips any group whose range excludes it. Third, projection pushdown: columnar files store columns separately, so the reader only decodes the columns you name — which is exactly what SELECT * turns off.',
        'Về phía quét dữ liệu thì byte nhanh nhất là byte không bao giờ phải đọc. Cái lake của bạn cho engine ba tầng để bỏ bớt việc. Tầng một là partition pruning từ A02: lọc theo cột dùng làm partition thì cả những file đó không bao giờ được mở ra. Tầng hai là zone map: bên trong một file Parquet, các dòng nằm trong những khối gọi là row group, và mỗi khối lưu giá trị nhỏ nhất và lớn nhất của từng cột, nên một phép lọc theo store_id sẽ bỏ qua mọi khối mà khoảng giá trị của nó không chứa số cần tìm. Tầng ba là projection pushdown: file dạng cột lưu các cột tách riêng, nên bộ đọc chỉ giải mã đúng những cột bạn gọi tên, và SELECT * chính là thứ tắt mất tầng này.',
      ),
      bi(
        'Zone maps only work if the values are clustered. Sort by store_id at write time and each group covers a tight range, so almost every group gets skipped. Leave it unsorted and store 42 appears everywhere, so nothing can be skipped — same file size, same data, a twenty-fold difference in read time.',
        'Zone map chỉ có tác dụng khi các giá trị nằm cụm lại với nhau. Sắp xếp theo store_id lúc ghi thì mỗi khối chỉ phủ một khoảng hẹp, nhờ vậy gần như mọi khối đều bị bỏ qua. Để nguyên không sắp thì cửa hàng số 42 rải rác khắp nơi, chẳng khối nào bỏ qua được: vẫn file đó, vẫn dữ liệu đó, mà thời gian đọc chênh nhau hai chục lần.',
      ),
      bi(
        'A hash join builds an in-memory table from one side and probes it with the other, and you want to build on the small side. But modern optimizers already re-order joins and pick build sides from size estimates, so most join folklore is dead. Your job is not to out-guess the optimizer; it is to not hand the query joins it does not need — because the optimizer can choose a good plan for a pointless join, but it cannot know the join is pointless.',
        'Một phép hash join sẽ dựng một bảng băm trong bộ nhớ từ một bên rồi lấy bên kia dò vào, và bạn muốn dựng từ bên nhỏ. Nhưng các optimizer hiện đại đã tự sắp lại thứ tự join và tự chọn bên để dựng dựa trên ước lượng kích thước, nên phần lớn mấy lời truyền miệng về join đã chết. Việc của bạn không phải đoán giỏi hơn optimizer, mà là đừng đưa cho câu query những phép join nó không cần: optimizer có thể chọn kế hoạch tốt cho một phép join vô ích, nhưng nó không có cách nào biết phép join đó là vô ích.',
      ),
      bi(
        'You confirm all of this with three lenses on the same query. The stopwatch tells you how long. EXPLAIN ANALYZE shows the plan with real numbers in it, including the line that proves pruning happened — Scanning Files: 1 out of N. And the JSON profiler gives you the same truth as data, so you can sort operators by time and read off the top three.',
        'Tất cả những điều trên đều kiểm chứng được bằng ba ống kính nhìn vào cùng một câu query. Cái đồng hồ bấm giờ cho biết mất bao lâu. Lệnh EXPLAIN ANALYZE cho thấy kế hoạch thực thi kèm số liệu thật, trong đó có dòng chứng minh việc bỏ bớt file đã thật sự xảy ra, kiểu như quét 1 trên N file. Còn bộ profiler dạng JSON đưa đúng sự thật đó ra dưới dạng dữ liệu, để bạn sắp các toán tử theo thời gian rồi đọc luôn ba cái đứng đầu.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Three correct ways to filter one day differ by 200× at full scale. What separates them?',
          'Ba cách lọc lấy một ngày, cả ba đều đúng, mà ở scale full chênh nhau 200 lần. Cái gì tách chúng ra?',
        ),
        a: bi(
          'How much the engine is allowed to skip. Filtering on the partition column opens one file. Casting the timestamp to a date looks clumsy but the optimizer rewrites it into a range check, so zone maps rescue it. Wrapping the column in a string function hides it from every optimizer, so every file is opened and every row formatted.',
          'Là chuyện engine được phép bỏ qua bao nhiêu. Lọc theo đúng cột dùng làm partition thì chỉ mở một file. Ép kiểu timestamp về ngày trông vụng về nhưng optimizer viết lại thành một phép so khoảng, nên zone map cứu được. Còn bọc cột đó vào trong một hàm chuỗi thì giấu nó khỏi mọi optimizer, thế là file nào cũng phải mở và dòng nào cũng phải định dạng lại.',
        ),
      },
      {
        q: bi(
          'Why measure with a fetch, not just an execute?',
          'Vì sao khi đo phải lấy hẳn kết quả về chứ không chỉ gọi thực thi?',
        ),
        a: bi(
          'Because an execute can return before the work is finished, so you would be timing only part of it. Pull the rows and you time the whole thing — the same reason the reject table in A11 stayed empty until the scan was materialized.',
          'Vì lệnh thực thi có thể trả về trước khi công việc làm xong, nên bạn chỉ đang bấm giờ cho một phần. Kéo hẳn các dòng kết quả về thì mới đo trọn vẹn — cũng chính là lý do cái bảng chứa dòng bị loại ở A11 vẫn rỗng cho tới khi phép quét được vật chất hoá.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 5 ─────────── */
  {
    level: 'detail',
    heading: bi(
      'Honest numbers, storage dials, and the day that costs triple',
      'Số liệu trung thực, hai cái núm ở tầng lưu trữ, và cái ngày tốn gấp ba',
    ),
    paras: [
      bi(
        'A benchmark lies unless you make it honest. The first run pays for the cold disk cache, so warm up once, then take the median of three — median, not mean, because one antivirus hiccup should not move your number. To benchmark a statement that creates something, write it as CREATE OR REPLACE so the second run works at all.',
        'Một phép đo tốc độ sẽ nói dối trừ khi bạn ép nó trung thực. Lần chạy đầu tiên phải trả giá cho việc đĩa còn lạnh, nên hãy chạy làm nóng một lần rồi lấy trung vị của ba lần sau. Trung vị chứ không phải trung bình, vì một lần phần mềm diệt virus nhảy vào không được phép làm lệch con số của bạn. Còn muốn đo một câu lệnh có tạo ra thứ gì đó thì viết nó thành CREATE OR REPLACE, để lần chạy thứ hai còn chạy được.',
      ),
      bi(
        'Two dials set at write time decide how much every future reader can skip. Row-group size: too small and per-group overhead taxes every scan forever — thirteen thousand groups instead of seven hundred made every query about four times slower, including queries that read everything. Sort order: with sane groups, sorting on the filtered column made a single-store filter around eighteen times faster, because zone maps then skipped 669 groups out of 670.',
        'Có hai cái núm được vặn vào lúc ghi, và chúng quyết định mọi lần đọc về sau được bỏ qua bao nhiêu việc. Núm thứ nhất là kích thước row group: đặt quá nhỏ thì phần phí của mỗi khối sẽ đánh thuế lên mọi lần quét, mãi về sau — mười ba nghìn khối thay vì bảy trăm khối làm mọi câu query chậm đi chừng bốn lần, kể cả những câu vốn phải đọc hết. Núm thứ hai là thứ tự sắp xếp: với kích thước khối hợp lý, sắp theo đúng cột hay dùng để lọc làm một phép lọc theo một cửa hàng nhanh lên chừng mười tám lần, vì zone map khi đó bỏ qua được 669 khối trên tổng số 670.',
      ),
      bi(
        'You can only physically sort one way, so spend it on your hottest filter. Sorting by store_id helps store filters and does nothing for customer filters; there is no arrangement that is best for both. That is a design decision with a written reason, not a default.',
        'Nhưng về mặt vật lý bạn chỉ sắp được theo một chiều, nên hãy dành nó cho phép lọc chạy nhiều nhất. Sắp theo store_id thì giúp mấy câu lọc theo cửa hàng và chẳng giúp gì cho mấy câu lọc theo khách hàng; không có cách sắp nào tốt nhất cho cả hai. Đây là một quyết định thiết kế có lý do viết ra hẳn hoi, chứ không phải một giá trị mặc định.',
      ),
      bi(
        'Cost is a function of the data, not just the SQL. Bench the same slice on a normal day and on a spike day and the answer changes with the scale you ask at: at small scale the two land close together, because fixed overhead swamps the work; at full scale the clean three-fold ratio the manifests predict comes out. Small scale ranks your problems but cannot size them, so confirm at full scale before promising anything.',
        'Chi phí là một hàm của dữ liệu chứ không chỉ của câu SQL. Đem đo cùng một phép cắt lát trên một ngày bình thường và một ngày cao điểm thì câu trả lời còn đổi theo quy mô bạn hỏi: ở scale small hai con số nằm sát nhau, vì phí cố định lấn át phần việc thật; ở scale full thì tỉ lệ gấp ba đúng như bản kê khai dự báo mới lộ ra. Scale small xếp hạng được các vấn đề nhưng không đo được độ lớn của chúng, nên hãy xác nhận lại ở full trước khi hứa hẹn điều gì.',
      ),
      bi(
        'And budget a daily job for its worst days, not its average day. A job sized for the average will miss its window every time the calendar produces a spike — which is why "the nightly load is slow sometimes" tickets so often track the calendar rather than the code.',
        'Ngoài ra hãy tính hạn mức cho một job chạy hằng ngày theo những ngày nặng nhất của nó chứ không theo ngày trung bình. Một cái job tính theo mức trung bình sẽ trễ hạn mỗi lần lịch rơi vào ngày cao điểm — và đó là lý do những phiếu báo lỗi kiểu job chạy đêm thỉnh thoảng chậm hay bám theo cuốn lịch hơn là bám theo đoạn code.',
      ),
    ],
    checks: [
      {
        q: bi(
          'When would a tiny row-group size ever be the right choice?',
          'Có khi nào đặt kích thước row group thật nhỏ lại là lựa chọn đúng không?',
        ),
        a: bi(
          'When readers fetch a few rows at a time rather than aggregating over many — a tiny group is the smallest unit that can be skipped, so small groups mean finer skipping for very selective point lookups. The moment anything scans or aggregates broadly, the per-group overhead dominates and you pay for it on every query, forever.',
          'Có, khi người đọc chỉ lấy vài dòng một lúc thay vì gom nhóm trên rất nhiều dòng. Một khối là đơn vị nhỏ nhất có thể bỏ qua, nên khối nhỏ nghĩa là bỏ qua được mịn hơn với những phép tra cứu rất chọn lọc. Nhưng hễ có thứ gì quét rộng hay gom nhóm rộng thì phần phí của mỗi khối sẽ lấn át, và bạn trả cái giá đó ở mọi câu query, mãi về sau.',
        ),
      },
      {
        q: bi(
          'Your speedup is 20× but you never ran the EXCEPT check. What do you have?',
          'Bạn đạt được tốc độ nhanh gấp 20 lần nhưng chưa từng chạy phép kiểm EXCEPT. Vậy bạn đang có cái gì?',
        ),
        a: bi(
          'A rumour. Until both artifacts match in both directions, you have a job that is fast and possibly wrong, which is worse than the slow job you started with — the slow one at least produced numbers people could trust.',
          'Một tin đồn. Chừng nào cả hai sản phẩm đầu ra chưa khớp nhau theo cả hai chiều thì bạn đang có một cái job nhanh và có thể sai, mà như vậy còn tệ hơn cái job chậm lúc đầu: ít ra cái chậm kia còn ra những con số người ta tin được.',
        ),
      },
    ],
  },
]

export const a14Terms: Term[] = [
  {
    term: 'Rank by measured time',
    gloss: 'xếp hạng theo thời gian đo được rồi mới sửa',
    means: bi(
      'Optimize the most expensive step, not a step. A 100× fix to a 0.3 s step saves 0.3 s; a 2× fix to a 70 s step saves 35 s. The ranking, not the code review, tells you where to start.',
      'Tối ưu đúng cái bước tốn nhiều thời gian nhất, chứ không phải một bước nào đó. Làm một bước 0,3 giây nhanh gấp 100 lần thì tiết kiệm 0,3 giây; làm một bước 70 giây nhanh gấp đôi thì tiết kiệm 35 giây. Cái bảng xếp hạng mới chỉ cho bạn bắt đầu từ đâu, chứ không phải việc đọc code.',
    ),
  },
  {
    term: 'Set-based processing',
    gloss: 'xử lý cả tập một lúc, không chạy vòng lặp từng dòng',
    means: bi(
      'Engines process whole columns at once. A Python loop over rows throws that away and pays SQL\'s fixed per-statement overhead once per row instead of once per batch.',
      'Engine xử lý cả cột một lúc. Một vòng lặp Python chạy qua từng dòng thì vứt bỏ lợi thế đó, và trả khoản phí cố định của mỗi câu lệnh SQL một lần cho mỗi dòng thay vì một lần cho cả lô.',
    ),
    source: {
      name: 'DuckDB — vectorized execution',
      url: 'https://duckdb.org/why_duckdb',
    },
  },
  {
    term: 'SQL↔Python border crossing',
    gloss: 'ferry dòng qua lại giữa SQL và Python',
    means: bi(
      'The classic killer. Every statement costs roughly a millisecond of parse, plan and commit; 60,000 single-row INSERTs pay that 60,000 times, which is a minute of overhead before any real work.',
      'Kiểu hỏng giết người kinh điển. Mỗi câu lệnh tốn chừng một mili giây để phân tích cú pháp, lập kế hoạch và commit; 60 nghìn lệnh INSERT mỗi lệnh một dòng thì trả khoản đó 60 nghìn lần, tức một phút phí trước khi có việc thật nào được làm.',
    ),
  },
  {
    term: 'Partition pruning',
    gloss: 'lọc theo cột partition thì cả file không được mở',
    means: bi(
      'The first and cheapest level of skipping. Filter on the column your lake is partitioned by and whole files are never opened. The proof is in the plan: Scanning Files: 1/N.',
      'Tầng bỏ bớt việc đầu tiên và rẻ nhất. Lọc theo đúng cột mà lake được chia thư mục theo nó thì cả những file kia không bao giờ được mở. Bằng chứng nằm trong kế hoạch thực thi: dòng báo quét 1 trên N file.',
    ),
    source: {
      name: 'DuckDB — Hive partitioning và filter pushdown',
      url: 'https://duckdb.org/docs/stable/data/partitioning/hive_partitioning',
    },
  },
  {
    term: 'Row group',
    gloss: 'khối dòng bên trong một file Parquet',
    means: bi(
      'The unit a reader can skip. Too small and per-group overhead taxes every future scan — 13,400 groups instead of 670 made every query about four times slower, including ones that read everything.',
      'Đơn vị nhỏ nhất mà bộ đọc có thể bỏ qua. Đặt quá nhỏ thì phần phí của mỗi khối đánh thuế lên mọi lần quét về sau: 13.400 khối thay vì 670 khối làm mọi câu query chậm đi chừng bốn lần, kể cả những câu vốn phải đọc hết.',
    ),
    source: {
      name: 'Apache Parquet — file format',
      url: 'https://parquet.apache.org/docs/file-format/',
    },
  },
  {
    term: 'Zone map',
    gloss: 'min và max của từng cột trong mỗi khối',
    means: bi(
      'Each row group stores every column\'s minimum and maximum, so a filter can skip any group whose range excludes the value. Only works if the values are clustered — sorted at write time, 669 groups out of 670 got skipped.',
      'Mỗi row group lưu giá trị nhỏ nhất và lớn nhất của từng cột, nhờ đó một phép lọc bỏ qua được mọi khối mà khoảng giá trị không chứa giá trị cần tìm. Chỉ có tác dụng khi các giá trị nằm cụm lại: sắp xếp lúc ghi thì bỏ qua được 669 khối trên 670.',
    ),
  },
  {
    term: 'Projection pushdown',
    gloss: 'chỉ giải mã đúng những cột được gọi tên',
    means: bi(
      'Columnar files store columns separately, so the reader decodes only the columns you name. SELECT * turns this off by definition, and drags the widest columns through every step.',
      'File dạng cột lưu các cột tách riêng nhau, nên bộ đọc chỉ giải mã đúng những cột bạn gọi tên. Viết SELECT * thì theo định nghĩa là tắt mất tầng này, và kéo theo những cột nặng nhất đi qua từng bước một.',
    ),
  },
  {
    term: 'Hash join build side',
    gloss: 'bên nào được dựng thành bảng băm',
    means: bi(
      'A hash join builds a table from one side and probes it with the other; you want to build on the small side. Modern optimizers already do this, so verify with EXPLAIN instead of following folklore — and spend your effort deleting joins the query never needed.',
      'Một phép hash join dựng bảng băm từ một bên rồi lấy bên kia dò vào, và bạn muốn dựng từ bên nhỏ. Các optimizer hiện đại đã tự làm chuyện đó rồi, nên hãy kiểm bằng EXPLAIN thay vì tin lời truyền miệng, và dồn công sức vào việc xoá bỏ những phép join mà câu query vốn không cần.',
    ),
  },
  {
    term: 'Warm median-of-3',
    gloss: 'chạy làm nóng rồi lấy trung vị ba lần',
    means: bi(
      'The honest way to time anything: one warm-up run to pay the cold disk cache, then the median of three. Median rather than mean, so one hiccup does not move the number. And fetch the rows, or you time only part of the work.',
      'Cách đo thời gian trung thực: chạy làm nóng một lần để trả phần đĩa còn lạnh, rồi lấy trung vị của ba lần sau. Lấy trung vị chứ không lấy trung bình, để một lần trục trặc không làm lệch con số. Và nhớ kéo hẳn kết quả về, không thì bạn chỉ đo được một phần công việc.',
    ),
  },
  {
    term: 'EXPLAIN ANALYZE',
    gloss: 'kế hoạch thực thi kèm số liệu thật',
    means: bi(
      'The second lens. It shows the plan with measured time and row counts in each box, including the line that proves pruning happened and the operator where the time actually went.',
      'Ống kính thứ hai. Nó cho thấy kế hoạch thực thi kèm thời gian đo được và số dòng ở từng ô, trong đó có dòng chứng minh việc bỏ bớt file đã xảy ra, và cả cái toán tử thật sự ngốn thời gian.',
    ),
    source: {
      name: 'DuckDB — profiling và EXPLAIN ANALYZE',
      url: 'https://duckdb.org/docs/stable/guides/meta/explain_analyze',
    },
  },
  {
    term: 'Equality proof',
    gloss: 'chứng minh kết quả không đổi sau khi sửa',
    means: bi(
      'EXCEPT in both directions, on every artifact, after every single fix. A speedup without it is a rumour, because it is entirely possible to make a job fast by making it wrong.',
      'Chạy EXCEPT theo cả hai chiều, trên mọi sản phẩm đầu ra, sau từng lần sửa một. Một con số nhanh hơn mà thiếu phép kiểm này thì chỉ là tin đồn, bởi hoàn toàn có thể làm một cái job nhanh lên bằng cách làm nó sai đi.',
    ),
  },
  {
    term: 'p95 day',
    gloss: 'tính hạn mức theo ngày nặng chứ không theo ngày trung bình',
    means: bi(
      'Cost is a function of the data, not just the SQL. A spike day carries about three times a normal day, so a job sized for the average misses its window every time the calendar produces one.',
      'Chi phí là một hàm của dữ liệu chứ không chỉ của câu SQL. Một ngày cao điểm mang lượng dữ liệu gấp chừng ba lần ngày thường, nên một cái job tính theo mức trung bình sẽ trễ hạn mỗi lần lịch rơi vào một ngày như thế.',
    ),
  },
]