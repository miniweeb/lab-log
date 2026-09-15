import type { TheorySection, Term } from '../types'
import { bi } from '../types'

export const a12Theory: TheorySection[] = [
  /* ─────────── TẦNG 1 ─────────── */
  {
    level: 'problem',
    heading: bi(
      'Sixty-nine independent days, eight cores, one at a time',
      'Sáu mươi chín ngày chẳng liên quan gì tới nhau, tám lõi CPU, mà vẫn chạy từng ngày một',
    ),
    paras: [
      bi(
        'Your A11 backfill worked and it took tens of minutes. It will run again every time history needs a rebuild, so those minutes are not a one-off cost.',
        'Lần backfill ở A11 chạy đúng, và nó ngốn mất hàng chục phút. Vấn đề là mỗi lần lịch sử cần dựng lại thì nó lại chạy, nên mấy chục phút đó không phải cái giá trả một lần rồi thôi.',
      ),
      bi(
        'The obvious fix is running several days at once. Real teams do this constantly, and the ones who do it badly take down their own machines: eight workers that each believe they own all the RAM freeze a server just as happily as they freeze your laptop.',
        'Cách sửa thì hiển nhiên thôi: chạy nhiều ngày cùng lúc. Các đội ngoài đời vẫn làm vậy suốt, có điều đội nào làm ẩu thì tự treo máy của mình. Tám tiến trình mà cái nào cũng tưởng cả bộ nhớ là của riêng nó thì làm đơ một con server cũng dễ như làm đơ cái laptop của bạn.',
      ),
      bi(
        'And your baseline is faster than you think. A11 was sequential across days, but it was never single-core: with SET threads=8, DuckDB already spread each day\'s SQL over all eight cores. A pool adds parallelism ACROSS days — it fills the gaps where one day cannot keep eight cores busy, such as Python overhead, disk waits and small query steps.',
        'Nhưng khoan, cái mốc mà bạn định so nó nhanh hơn bạn tưởng đấy. A11 chạy tuần tự giữa các ngày, chứ nó chưa bao giờ chỉ dùng một lõi: với SET threads=8 thì DuckDB đã trải câu SQL của từng ngày ra cả tám lõi rồi. Chạy nhiều tiến trình chỉ thêm được phần song song GIỮA các ngày, tức là lấp vào mấy quãng mà một ngày không đủ việc để giữ tám lõi bận, chẳng hạn lúc Python lo phần của nó, lúc ngồi chờ đĩa, hay mấy bước query lặt vặt.',
      ),
      bi(
        'So the honest comparison is a pool versus one process with eight threads, and the honest expectation is a real speedup, not a miracle 8×.',
        'Vậy nên so cho đàng hoàng thì phải là nhóm tiến trình đấu với một tiến trình tám luồng, và kỳ vọng cho đàng hoàng là nhanh hơn thật sự, chứ không phải nhanh gấp tám lần như phép màu.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Why is comparing your pool against a 1-worker 1-thread run dishonest?',
          'Vì sao đem nhóm tiến trình ra so với một lần chạy một tiến trình một luồng lại là không trung thực?',
        ),
        a: bi(
          'Because nobody ran it that way. Your A11 loop already had eight threads inside each query, so 1×1 is a baseline that never existed — it exists only to make your pool look good. The number that matters is how much you beat the thing you were actually doing yesterday.',
          'Vì có ai chạy như thế đâu. Vòng lặp ở A11 vốn đã dùng tám luồng bên trong từng câu query rồi, nên cấu hình một-một là một cái mốc chưa từng tồn tại, và nó chỉ sinh ra để làm cho nhóm tiến trình của bạn trông đẹp. Con số đáng quan tâm là bạn vượt được bao nhiêu so với đúng cái thứ bạn đang làm hôm qua.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 2 ─────────── */
  {
    level: 'alternatives',
    heading: bi(
      'Four ways to use eight cores, and what each one runs into',
      'Bốn cách dùng tám lõi, và mỗi cách vấp phải cái gì',
    ),
    paras: [
      bi(
        'These are not ranked by cleverness. Which one wins depends on whether your bottleneck is CPU, disk, or the fact that only one process may write the database.',
        'Bốn cách này không xếp theo mức khôn khéo đâu. Cách nào thắng còn tuỳ chỗ nghẽn của bạn nằm ở CPU, ở đĩa, hay ở cái luật chỉ cho một tiến trình được ghi vào database.',
      ),
    ],
    alternatives: [
      {
        name: bi('Just raise the thread count', 'Cứ tăng số luồng lên là xong'),
        appeal: bi(
          'One setting, no new code. If eight threads are good, surely sixty-four are better.',
          'Sửa đúng một thiết lập, chẳng phải viết thêm dòng code nào. Tám luồng mà đã ngon thì sáu mươi tư luồng hẳn phải ngon hơn.',
        ),
        breaks: bi(
          'Cores do not multiply. Sixty-four runnable threads on eight cores just means the machine switches between them more often, and switching is not free. You watch CPU pin at 100% while wall-clock lands no better than eight threads — often a little worse.',
          'Có điều lõi CPU không tự nhân lên được. Sáu mươi tư luồng cùng đòi chạy trên tám lõi thì máy chỉ phải chuyển qua chuyển lại giữa chúng nhiều hơn, mà mỗi lần chuyển như vậy đều mất thời gian. Bạn sẽ thấy CPU ghim ở 100% trong khi đồng hồ chẳng khá hơn tám luồng, có khi còn tệ hơn một chút.',
        ),
      },
      {
        name: bi('Let every worker write the warehouse', 'Cho mọi tiến trình cùng ghi vào warehouse'),
        appeal: bi(
          'Simplest possible design: each worker finishes its day by inserting into the same table, and there is no merge step to write at all.',
          'Thiết kế đơn giản nhất có thể nghĩ ra: tiến trình nào làm xong ngày của mình thì insert thẳng vào cùng một bảng, khỏi phải viết bước gộp nào cả.',
        ),
        breaks: bi(
          'It cannot even start. A DuckDB file can be open for writing by one process at a time; the second one dies with an IO error, and even a read-only open fails while a writer holds the file. This is not a limit you can tune around, so the design has to move.',
          'Nhưng nó còn chẳng khởi động nổi. Một file DuckDB chỉ cho đúng một tiến trình mở để ghi tại một thời điểm; cái thứ hai chết luôn kèm lỗi vào ra, mà ngay cả mở ở chế độ chỉ đọc cũng hỏng nốt khi đang có người giữ file để ghi. Đây không phải giới hạn chỉnh được bằng tham số, nên phải đổi thiết kế chứ không né được.',
        ),
      },
      {
        name: bi('One process, one big query over all the files', 'Một tiến trình, một câu query lớn đọc hết các file'),
        appeal: bi(
          'DuckDB already parallelizes a single query across many files by itself. Hand it the whole file list, write one COPY, and the code is dead simple. Because there is only one writer, partitioning straight into a shared folder is safe here.',
          'Bản thân DuckDB vốn đã tự chia một câu query ra chạy song song trên nhiều file. Bạn cứ đưa nó cả danh sách file, viết một lệnh COPY, thế là xong, code đơn giản đến mức khó tin. Mà vì chỉ có một người ghi nên ở đây ghi thẳng vào một thư mục chia theo ngày cũng an toàn.',
        ),
        breaks: bi(
          'It is all-or-nothing. No per-day retry, no per-day record in the run ledger — if it fails at minute forty, it fails entirely. And one query handles one schema, so three eras means three file lists and three queries. In A11\'s vocabulary this is a restatement, not a resumable backfill.',
          'Cái dở là nó được ăn cả ngã về không. Không thử lại được từng ngày, cũng không có dòng nào cho từng ngày trong sổ ghi các lần chạy, nên hỏng ở phút thứ bốn mươi là hỏng cả. Thêm nữa một câu query chỉ xử lý được một schema, nên ba era thì phải có ba danh sách file và ba câu query. Nói theo cách của A11 thì đây là một lần restatement chứ chưa phải một lần backfill chạy tiếp được.',
        ),
      },
      {
        name: bi('A pool of processes, then one committer', 'Một nhóm tiến trình, rồi một người gộp'),
        appeal: bi(
          'Each worker gets its own private DuckDB with its own memory limit, and writes its own Parquet file — nothing shared, nothing to lock. When the pool is done, one committer process merges everything into the warehouse. A crash in one worker cannot corrupt the others, and every day keeps its own retry and its own ledger row.',
          'Mỗi tiến trình có một DuckDB riêng với hạn mức bộ nhớ riêng, rồi ghi ra file Parquet của riêng nó. Không dùng chung gì nên cũng chẳng có gì để tranh nhau. Xong xuôi thì một tiến trình gộp duy nhất đem tất cả nhập vào warehouse. Một tiến trình chết cũng không làm hỏng mấy cái kia, mà mỗi ngày vẫn giữ được phần thử lại riêng và dòng riêng trong sổ ghi các lần chạy.',
        ),
        breaks: bi(
          'You now own the capacity math by hand: nothing in the system adds up your workers\' memory limits for you. And the pool finishes only when its slowest task finishes, so one oversized day scheduled late leaves seven cores waiting.',
          'Đổi lại thì phần tính dung lượng máy là việc của bạn, vì chẳng có gì trong hệ thống cộng hộ hạn mức bộ nhớ của các tiến trình cả. Với lại cả nhóm chỉ xong khi việc chậm nhất xong, nên chỉ cần một ngày quá khổ bị xếp vào cuối là bảy lõi còn lại ngồi chơi.',
        ),
      },
    ],
    checks: [
      {
        q: bi(
          'Why must workers write one file per day instead of partitioning into the shared lake folder?',
          'Vì sao mỗi tiến trình phải ghi một file cho một ngày, thay vì ghi thẳng vào thư mục lake chia theo ngày?',
        ),
        a: bi(
          'Because of late rows. A day\'s file carries corrections for the previous week, so two workers handling two different delivery days both end up writing into the same order_date folder — and they silently overwrite each other\'s output. One file per worker removes the collision entirely.',
          'Tại dữ liệu về trễ. File của một ngày còn mang theo bản sửa cho cả tuần trước đó, nên hai tiến trình lo hai ngày giao khác nhau vẫn có thể cùng ghi vào một thư mục order_date, rồi lặng lẽ đè lên kết quả của nhau. Mỗi tiến trình một file thì chẳng còn chỗ nào để va vào nhau nữa.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 3 ─────────── */
  {
    level: 'idea',
    heading: bi(
      'The machine does not grow because you asked for more workers',
      'Cái máy không to ra chỉ vì bạn xin thêm tiến trình',
    ),
    paras: [
      bi(
        'The whole assignment is one sentence: work out the capacity budget on paper first, then write code that stays inside it.',
        'Cả bài này gói gọn trong một câu: cứ tính phần dung lượng máy ra giấy trước đã, rồi mới viết code sao cho nó nằm gọn trong phần vừa tính.',
      ),
      bi(
        'Two constraints, and both are just addition. Workers times threads per worker must not exceed your core count. Workers times memory limit per worker, plus a few gigabytes for the operating system and whatever else is open, must not exceed your RAM.',
        'Có hai ràng buộc thôi, mà cả hai chỉ là phép cộng. Một là số tiến trình nhân số luồng mỗi tiến trình thì không được quá số lõi. Hai là số tiến trình nhân hạn mức bộ nhớ mỗi tiến trình, cộng thêm vài gigabyte cho hệ điều hành và mấy thứ đang mở, thì không được quá dung lượng RAM.',
      ),
      bi(
        'Nothing enforces these totals for you, and that is the part worth remembering. The memory limit is per process, so eight workers left on defaults collectively promise themselves far more RAM than the machine has. That promise gets settled with swapping, with spilling to disk, or with a machine that stops responding.',
        'Chỗ đáng nhớ nhất là chẳng có gì kiểm hộ bạn hai phép cộng đó. Hạn mức bộ nhớ được tính riêng cho từng tiến trình, nên tám tiến trình để nguyên mặc định sẽ cùng nhau tự hứa một lượng RAM lớn hơn nhiều so với thứ máy đang có. Mà lời hứa thì rồi cũng phải thanh toán: hoặc là tráo bộ nhớ ra đĩa, hoặc là dữ liệu tạm tràn ra ổ cứng, hoặc là cái máy đứng hình.',
      ),
      bi(
        'And one more idea that makes the design click: a parallel job has phases, and each phase gets the whole machine. The workers share the budget while they stage; the committer runs afterwards, alone, and takes the full memory and all eight threads for itself.',
        'Còn một ý nữa, nắm được thì cả thiết kế tự khớp lại: một công việc chạy song song có nhiều pha, và mỗi pha được dùng cả cái máy. Trong lúc chuẩn bị dữ liệu thì các tiến trình chia nhau ngân sách; còn tiến trình gộp chạy sau, chạy một mình, nên nó lấy trọn bộ nhớ và cả tám luồng cho riêng mình.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Eight workers with one thread each and no memory limit set. Which constraint breaks?',
          'Tám tiến trình, mỗi cái một luồng, và không đặt hạn mức bộ nhớ. Vậy ràng buộc nào bị phá?',
        ),
        a: bi(
          'The memory one, badly. Eight threads on eight cores is perfectly legal, but the default limit is around 80% of machine RAM per process — so the eight of them together promise roughly six times what the machine has. Nothing warns you at startup; you find out when the memory graph climbs and the disk starts churning.',
          'Ràng buộc về bộ nhớ, mà phá rất nặng. Tám luồng trên tám lõi thì hợp lệ quá đi chứ, nhưng hạn mức mặc định lại là khoảng 80% RAM của máy tính cho MỖI tiến trình, nên tám cái cộng lại tự hứa chừng sáu lần lượng RAM máy có. Lúc khởi động chẳng ai nói gì với bạn cả; bạn chỉ biết khi thấy biểu đồ bộ nhớ leo lên và đĩa bắt đầu quay không ngừng.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 4 ─────────── */
  {
    level: 'mechanism',
    heading: bi(
      'What a new process actually is, and what it does not inherit',
      'Một tiến trình mới thật ra là cái gì, và nó không thừa hưởng những gì',
    ),
    paras: [
      bi(
        'A thread is a worker inside your program that shares its memory. A process is a separate program with its own memory. Today you use processes, because each one then gets a private DuckDB with its own limit, and a crash in one cannot corrupt the others.',
        'Luồng là một người làm việc nằm bên trong chương trình của bạn và xài chung bộ nhớ với nó. Còn tiến trình là hẳn một chương trình riêng với bộ nhớ riêng. Hôm nay bạn dùng tiến trình, vì như vậy mỗi cái mới có một DuckDB riêng với hạn mức riêng, và một cái chết thì cũng không kéo mấy cái còn lại chết theo.',
      ),
      bi(
        'On Windows a new process starts by spawn: the child launches a fresh Python and re-imports your script file from the top. Two rules follow from that. The code that starts the pool must sit under a main guard, otherwise every child starts a pool of its own and you get an error about bootstrapping or a screen full of Pythons. And the worker function must be defined at the top level of the file, because the child looks it up by name after re-importing.',
        'Trên Windows, một tiến trình mới sinh ra theo kiểu spawn: nó bật một Python mới tinh rồi nạp lại file script của bạn từ dòng đầu tiên. Từ đó có hai luật. Thứ nhất, đoạn code mở nhóm tiến trình phải nằm dưới khối main, không thì mỗi tiến trình con lại tự mở một nhóm của riêng nó, và bạn nhận về một lỗi về giai đoạn khởi tạo hoặc cả màn hình đầy Python. Thứ hai, cái hàm mà tiến trình con phải chạy bắt buộc nằm ở cấp ngoài cùng của file, bởi sau khi nạp lại file thì nó tìm hàm đó theo tên.',
      ),
      bi(
        'The same mechanism explains a subtler thing: command-line arguments you parsed in the parent do not reach the children by magic. Anything a worker needs either travels inside the task you hand it, or sits at module level so the re-import picks it up.',
        'Cũng chính cơ chế đó giải thích một chuyện tinh vi hơn: mấy tham số dòng lệnh bạn đọc ở tiến trình cha chẳng tự nhiên bay sang tiến trình con được đâu. Thứ gì tiến trình con cần thì hoặc phải đi kèm ngay trong công việc bạn giao cho nó, hoặc phải nằm ở cấp module để lần nạp lại file đón được.',
      ),
      bi(
        'Results come back in completion order, not in the order you submitted them. That is a feature, not a bug: the pool hands you each day\'s outcome the moment its worker finishes, so a slow day never blocks the reporting of a fast one.',
        'Kết quả trả về theo thứ tự làm xong chứ không theo thứ tự bạn gửi đi. Đó là chủ ý chứ không phải lỗi: nhóm tiến trình đưa cho bạn kết quả của một ngày ngay khi tiến trình lo ngày đó làm xong, nhờ vậy một ngày chậm không chặn mất phần báo cáo của một ngày nhanh.',
      ),
      bi(
        'To know whether you stayed inside the budget you have to measure the whole family, not just the parent. Sum the resident memory of the parent and every child every half second and keep the peak — that peak is the number you compare against your RAM, and it is the number you write in your journal next to each configuration.',
        'Muốn biết mình có nằm trong ngân sách hay không thì phải đo cả nhà chứ đo mỗi tiến trình cha là không đủ. Cứ nửa giây một lần, cộng bộ nhớ thực tế của tiến trình cha với tất cả tiến trình con rồi giữ lại giá trị lớn nhất. Cái đỉnh đó mới là con số đem so với RAM của máy, và cũng là con số bạn ghi vào journal bên cạnh mỗi cấu hình.',
      ),
    ],
    checks: [
      {
        q: bi(
          'You forget the main guard and get an error about starting a process before the bootstrapping phase is complete. What is actually happening?',
          'Bạn quên khối main và nhận một lỗi nói rằng có tiến trình được khởi động trước khi giai đoạn khởi tạo xong. Thật ra chuyện gì đang diễn ra?',
        ),
        a: bi(
          'Each child re-imports your file from the top, so it reaches the pool-starting line too and tries to open a pool of its own — which would spawn children that do the same. Python notices the recursion and stops it. The guard exists precisely so that the re-import defines your functions without re-running your program.',
          'Mỗi tiến trình con nạp lại file của bạn từ đầu, nên nó cũng chạy tới dòng mở nhóm tiến trình và định mở một nhóm của riêng nó, mà nhóm đó lại đẻ ra tiến trình con làm y hệt như vậy. Python nhìn ra cái vòng luẩn quẩn này nên chặn lại. Khối main sinh ra đúng để lần nạp lại chỉ định nghĩa các hàm của bạn thôi, chứ không chạy lại cả chương trình.',
        ),
      },
      {
        q: bi(
          'Why does the committer get the full memory and thread budget when the workers only got a share?',
          'Vì sao tiến trình gộp lại được xài trọn ngân sách bộ nhớ và số luồng, trong khi các tiến trình con chỉ được một phần?',
        ),
        a: bi(
          'Because it runs alone, after the pool has exited. The budget is a rule about what is running at the same moment, not a quota you divide once and live with. A parallel job has phases, and each phase gets the whole machine.',
          'Vì nó chạy một mình, sau khi nhóm tiến trình đã đóng lại rồi. Ngân sách là quy tắc về những gì đang chạy cùng một thời điểm, chứ không phải một suất chia một lần rồi cứ thế chịu mãi. Một công việc chạy song song có nhiều pha, và mỗi pha được dùng cả cái máy.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 5 ─────────── */
  {
    level: 'detail',
    heading: bi(
      'Stragglers, cold caches, and when not to do this at all',
      'Việc chậm nhất kéo cả nhóm, đĩa còn lạnh, và khi nào thì đừng làm chuyện này',
    ),
    paras: [
      bi(
        'Not all days are equal. The two spike days carry roughly three times a normal day, and in a pool the slowest task sets the finish line. A big day scheduled near the end leaves seven cores idle while one worker grinds — that lone late task is called a straggler.',
        'Các ngày không giống nhau đâu. Hai ngày cao điểm mang lượng dữ liệu gấp chừng ba lần ngày thường, mà trong một nhóm tiến trình thì việc chậm nhất mới là thứ quyết định lúc nào cả nhóm xong. Một ngày to bị xếp gần cuối sẽ khiến bảy lõi ngồi không trong lúc một tiến trình cày nốt; cái việc lẻ loi tới muộn đó người ta gọi là straggler.',
      ),
      bi(
        'The fix costs one line: sort the days biggest first, using the byte size the manifest already reports. Big days start immediately and the small ones pack into the gaps behind them. On one dev machine that alone was worth about a quarter of the wall-clock.',
        'Cách chữa tốn đúng một dòng: sắp các ngày theo thứ tự to trước, dựa vào kích thước tính bằng byte mà bản kê khai vốn đã ghi sẵn. Ngày to được bắt ngay, còn mấy ngày nhỏ thì lấp vào những khoảng trống phía sau. Riêng thay đổi đó, trên một máy dùng để phát triển, đã rút được chừng một phần tư thời gian chạy.',
      ),
      bi(
        'Be careful with single timings. The first run pays for a cold disk cache and the second one looks magically faster, so note the run order and repeat at least once. Building a proper harness that takes the median of several runs is A14\'s job; today, just do not believe a number you have seen only once.',
        'Phải cẩn thận với mấy con số đo đúng một lần. Lần chạy đầu tiên phải trả giá cho việc đĩa còn lạnh, nên lần thứ hai trông nhanh như có phép; hãy ghi lại thứ tự chạy và lặp thêm ít nhất một lần nữa. Chuyện dựng một bộ đo tử tế lấy trung vị của nhiều lần chạy thì để A14 lo; hôm nay chỉ cần đừng tin một con số mà bạn mới thấy có một lần.',
      ),
      bi(
        'Two deliberate bad runs are worth doing once, on a single week of data rather than the whole history. Oversubscription — many workers each asking for many threads — pins the CPU at full while the clock does not improve. Overcommit — forgetting the per-worker memory limit — makes the memory graph climb and the disk churn. Keep the task manager visible and be ready to abort; the point is to recognise the shape of each failure, not to survive it.',
        'Có hai lần chạy hỏng cố ý đáng làm một lần cho biết, mà nhớ là chỉ làm trên một tuần dữ liệu thôi, đừng làm trên cả lịch sử. Một là đặt quá tay số luồng: nhiều tiến trình mà cái nào cũng xin nhiều luồng, khiến CPU ghim ở mức đầy trong khi đồng hồ chẳng nhúc nhích. Hai là hứa quá tay bộ nhớ: quên đặt hạn mức cho từng tiến trình, khiến biểu đồ bộ nhớ leo lên và đĩa quay liên tục. Hãy để cửa sổ theo dõi tài nguyên trong tầm mắt và sẵn sàng bấm dừng; mục đích là nhận ra hình dạng của từng kiểu hỏng, chứ không phải chịu đựng cho tới lúc nó xong.',
      ),
      bi(
        'Finally, the paragraph nobody writes: when not to parallelize. When the job is already fast enough, because your hours cost more than the machine\'s minutes. When the work waits on disk or network, so more workers only queue on the same bottleneck. When the tasks share a writer or depend on each other. When one big engine query already parallelizes better than your hand-rolled pool. And when the machine is shared, because your eight workers are somebody else\'s outage.',
        'Cuối cùng là cái đoạn mà chẳng mấy ai chịu viết: khi nào thì đừng chạy song song. Khi công việc vốn đã đủ nhanh, vì giờ công của bạn đắt hơn mấy phút chạy máy. Khi phần việc phải ngồi chờ đĩa hoặc chờ mạng, lúc đó thêm tiến trình chỉ là thêm người xếp hàng ở đúng chỗ nghẽn cũ. Khi các việc dùng chung một người ghi hoặc phụ thuộc lẫn nhau. Khi một câu query lớn của engine vốn đã chia việc khéo hơn cái nhóm tiến trình bạn tự dựng. Và khi cái máy là của chung, vì tám tiến trình của bạn chính là sự cố của người khác.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Your pool is only 1.5× faster than the sequential run. Where do you look first?',
          'Nhóm tiến trình của bạn chỉ nhanh hơn lần chạy tuần tự khoảng 1,5 lần. Vậy nhìn vào đâu trước?',
        ),
        a: bi(
          'At the CPU graph during the staging phase. If it sits well under full, the work is waiting on disk and more workers will not help — they queue on the same drive. If the CPU is full but the clock is flat, you have oversubscribed. And check whether the merge step is eating the time: it is one big query, and it needs the whole machine to itself.',
          'Nhìn biểu đồ CPU trong lúc đang chuẩn bị dữ liệu. Nếu nó nằm thấp hơn hẳn mức đầy thì phần việc đang chờ đĩa, mà thêm tiến trình cũng vô ích vì chúng xếp hàng ở đúng cái ổ đĩa đó. Nếu CPU đầy mà đồng hồ vẫn đứng yên thì bạn đã đặt quá tay số luồng. Ngoài ra kiểm luôn xem bước gộp có đang ngốn hết thời gian không, vì nó là một câu query lớn và cần được dùng cả cái máy.',
        ),
      },
    ],
  },
]

export const a12Terms: Term[] = [
  {
    term: 'Process vs thread',
    gloss: 'tiến trình riêng bộ nhớ, luồng thì xài chung',
    means: bi(
      'A thread is a worker inside your program sharing its memory; a process is a separate program with its own. Processes are used here so each gets a private DuckDB with its own limit, and a crash in one cannot corrupt the others.',
      'Luồng là người làm việc nằm bên trong chương trình và xài chung bộ nhớ với nó; còn tiến trình là hẳn một chương trình riêng với bộ nhớ riêng. Ở đây dùng tiến trình để mỗi cái có một DuckDB riêng với hạn mức riêng, và một cái chết thì cũng không kéo mấy cái kia chết theo.',
    ),
    source: {
      name: 'Python — multiprocessing programming guidelines',
      url: 'https://docs.python.org/3/library/multiprocessing.html#programming-guidelines',
    },
  },
  {
    term: 'Spawn',
    gloss: 'tiến trình con nạp lại file script từ đầu',
    means: bi(
      'How a new process starts on Windows: a fresh Python that re-imports your script. Hence the main guard and top-level worker functions — and hence parsed arguments never reach the children on their own.',
      'Cách một tiến trình mới sinh ra trên Windows: bật một Python mới tinh rồi nạp lại file script của bạn. Vì thế mới cần khối main và hàm worker đặt ở cấp ngoài cùng, và cũng vì thế mà tham số dòng lệnh không tự đi sang tiến trình con được.',
    ),
    source: {
      name: 'Python — contexts and start methods',
      url: 'https://docs.python.org/3/library/multiprocessing.html#contexts-and-start-methods',
    },
  },
  {
    term: 'Capacity budget',
    gloss: 'hai phép cộng phải tự kiểm bằng tay',
    means: bi(
      'Workers times threads each must not exceed your cores; workers times memory each, plus a few GB for the OS, must not exceed your RAM. Nothing in the system adds these up for you.',
      'Số tiến trình nhân số luồng mỗi cái thì không được quá số lõi; số tiến trình nhân hạn mức bộ nhớ mỗi cái, cộng vài GB cho hệ điều hành, thì không được quá dung lượng RAM. Chẳng có gì trong hệ thống cộng hộ bạn hai phép tính này.',
    ),
  },
  {
    term: 'memory_limit',
    gloss: 'hạn mức tính cho từng tiến trình, không phải cho cả máy',
    means: bi(
      'A DuckDB setting whose default is roughly 80% of machine RAM — per process. Eight workers left on defaults collectively promise themselves several times what the machine has.',
      'Một thiết lập của DuckDB, mặc định khoảng 80% RAM của máy, mà là tính cho TỪNG tiến trình. Tám tiến trình để nguyên mặc định thì cộng lại tự hứa gấp mấy lần lượng RAM máy đang có.',
    ),
    source: {
      name: 'DuckDB — memory management',
      url: 'https://duckdb.org/docs/stable/guides/performance/how_to_tune_workloads',
    },
  },
  {
    term: 'Single-writer rule',
    gloss: 'một file database, một người ghi',
    means: bi(
      'A DuckDB file can be open for writing by one process at a time. The second gets an IO error, and even a read-only open fails while a writer holds it. Not tunable — the design has to move around it.',
      'Một file DuckDB chỉ cho đúng một tiến trình mở để ghi tại một thời điểm. Cái thứ hai nhận lỗi vào ra, mà mở ở chế độ chỉ đọc cũng hỏng nốt khi đang có người giữ file để ghi. Đây không phải thứ chỉnh được, nên thiết kế phải đi vòng qua nó.',
    ),
    source: {
      name: 'DuckDB — concurrency',
      url: 'https://duckdb.org/docs/stable/connect/concurrency',
    },
  },
  {
    term: 'Committer',
    gloss: 'tiến trình duy nhất được ghi vào warehouse',
    means: bi(
      'Workers only stage: raw in, one Parquet file per day out. Then one committer merges those files into the warehouse. It runs alone, after the pool, so it takes the full memory and thread budget for itself.',
      'Các tiến trình con chỉ lo phần chuẩn bị: đọc dữ liệu thô vào, ghi ra mỗi ngày một file Parquet. Sau đó đúng một tiến trình gộp đem mấy file đó nhập vào warehouse. Nó chạy một mình sau khi nhóm kia xong, nên lấy trọn ngân sách bộ nhớ và số luồng cho riêng mình.',
    ),
  },
  {
    term: 'Straggler',
    gloss: 'việc chậm nhất quyết định lúc cả nhóm xong',
    means: bi(
      'One oversized task scheduled late, leaving the other cores idle while it grinds. The spike days carry about three times a normal day, so they are the usual culprits.',
      'Một việc quá khổ bị xếp vào cuối, để mặc các lõi còn lại ngồi không trong lúc nó cày nốt. Mấy ngày cao điểm mang lượng dữ liệu gấp chừng ba lần ngày thường nên hay là thủ phạm.',
    ),
  },
  {
    term: 'Biggest-first scheduling',
    gloss: 'xếp việc to lên trước, việc nhỏ lấp khe',
    means: bi(
      'Sorting tasks by the byte size the manifest already reports, descending. Big days start immediately and small ones pack into the gaps behind them. One line of code, worth about a quarter of the wall-clock on one dev machine.',
      'Sắp các việc theo kích thước tính bằng byte mà bản kê khai vốn đã ghi sẵn, từ lớn xuống nhỏ. Ngày to được bắt ngay, còn ngày nhỏ lấp vào các khoảng trống phía sau. Chỉ một dòng code, mà trên một máy dùng để phát triển đã rút được chừng một phần tư thời gian chạy.',
    ),
  },
  {
    term: 'Oversubscription',
    gloss: 'tổng số luồng vượt quá số lõi',
    means: bi(
      'Many workers each asking for many threads. Cores do not multiply; the machine just switches between threads more often, and switching costs time. CPU pins at full while the clock does not improve.',
      'Nhiều tiến trình mà cái nào cũng xin nhiều luồng. Lõi CPU đâu có tự nhân lên, máy chỉ phải chuyển qua chuyển lại giữa các luồng nhiều hơn, mà mỗi lần chuyển đều mất thời gian. CPU ghim ở mức đầy trong khi đồng hồ chẳng khá lên.',
    ),
  },
  {
    term: 'Memory overcommit',
    gloss: 'hứa nhiều bộ nhớ hơn máy có',
    means: bi(
      'Forgetting the per-worker limit, so the workers together promise several times the machine\'s RAM. The promise is settled with swapping, spilling to disk, or a machine that stops responding.',
      'Quên đặt hạn mức cho từng tiến trình, thành ra các tiến trình cộng lại hứa gấp mấy lần lượng RAM của máy. Mà lời hứa thì rồi cũng phải thanh toán: hoặc tráo bộ nhớ ra đĩa, hoặc dữ liệu tạm tràn ra ổ cứng, hoặc cái máy đứng hình.',
    ),
  },
  {
    term: 'Peak RSS',
    gloss: 'đỉnh bộ nhớ thực của cả nhà tiến trình',
    means: bi(
      'The highest total resident memory of the parent and every child, sampled a few times a second. This is the number you compare against your RAM, not the limit you asked for.',
      'Giá trị lớn nhất của tổng bộ nhớ thực tế mà tiến trình cha và tất cả tiến trình con đang chiếm, lấy mẫu vài lần mỗi giây. Đây mới là con số đem so với RAM của máy, chứ không phải cái hạn mức bạn khai.',
    ),
  },
  {
    term: 'Cold cache effect',
    gloss: 'lần chạy đầu chịu phần đọc đĩa lần đầu',
    means: bi(
      'The first run pays for reading from disk; the second looks magically faster because the file is already in the OS cache. Note run order and repeat at least once before believing a timing.',
      'Lần chạy đầu phải trả giá cho việc đọc từ đĩa, còn lần thứ hai trông nhanh như có phép vì file đã nằm sẵn trong bộ đệm của hệ điều hành. Hãy ghi lại thứ tự chạy và lặp thêm ít nhất một lần nữa rồi hẵng tin vào con số đo được.',
    ),
  },
]