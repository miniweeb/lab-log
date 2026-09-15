import type { TheorySection, Term } from '../types'
import { bi } from '../types'

export const a13Theory: TheorySection[] = [
  /* ─────────── TẦNG 1 ─────────── */
  {
    level: 'problem',
    heading: bi(
      'A pipeline that "feels slow" stays broken until somebody measures it',
      'Một pipeline "thấy chậm chậm" sẽ hỏng mãi cho tới khi có người đo nó',
    ),
    paras: [
      bi(
        'In A12 you did capacity math on paper: workers times memory limit must stay under 16 GB. Paper is where tuning starts, not where it ends. Today you check the paper against the machine.',
        'Ở A12 bạn đã tính sức chứa trên giấy: số worker nhân với memory limit phải nằm dưới 16 GB. Giấy là chỗ bắt đầu của việc tuning chứ không phải chỗ kết thúc. Hôm nay bạn đem tờ giấy đó đối chiếu với cái máy thật.',
      ),
      bi(
        'The rule production data engineers live by is short: you cannot tune what you cannot see. A run that "sometimes crashes" and a run that "feels slow" are the same problem — nobody knows where the RAM, the CPU and the disk actually went, so every fix is a guess, and guesses are expensive to test.',
        'Quy tắc mà dân data engineer sống chết với nó rất ngắn: không thấy thì không tune được. Một lần chạy "thỉnh thoảng chết" và một lần chạy "thấy chậm chậm" thật ra là cùng một vấn đề: không ai biết RAM, CPU và đĩa đã đi đâu, nên mọi cách sửa đều là đoán, mà đoán thì thử rất tốn.',
      ),
      bi(
        'On a laptop, waste costs you an evening. In the cloud it costs money every hour, because the machine tier you pick is a line on an invoice: every GB of RAM you over-provision is billed whether the job touches it or not. Measuring is how a number replaces a feeling, and a number is the only thing you can put in a budget.',
        'Trên laptop, lãng phí thì bạn mất một buổi tối. Trên cloud thì nó mất tiền theo từng giờ, vì cái tier máy bạn chọn là một dòng trong hoá đơn: mỗi GB RAM bạn cấp dư đều bị tính tiền, bất kể job có đụng tới nó hay không. Đo đạc là cách một con số thay chỗ cho một cảm giác, và chỉ có con số mới đưa được vào bảng ngân sách.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Your backfill got slower this month. What is the first thing to find out?',
          'Lần backfill tháng này chạy chậm hơn hẳn. Việc đầu tiên cần tìm ra là gì?',
        ),
        a: bi(
          'Which resource it is waiting on. CPU, memory, disk IO and disk space — at any moment exactly one of them is the bottleneck, and tuning the other three changes nothing. A run at 90% CPU and a run at 12% CPU need opposite fixes.',
          'Là nó đang chờ tài nguyên nào. CPU, bộ nhớ, IO đĩa và dung lượng đĩa — ở bất kỳ thời điểm nào cũng chỉ có đúng một thứ là bottleneck, và tune ba thứ còn lại thì chẳng thay đổi gì. Một lần chạy ở 90% CPU và một lần chạy ở 12% CPU cần hai cách sửa ngược nhau.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 2 ─────────── */
  {
    level: 'alternatives',
    heading: bi(
      'Four ways to find out where the resources went',
      'Bốn cách để biết tài nguyên đã đi đâu',
    ),
    paras: [
      bi(
        'The question is not "which tool is fancier". It is whether the answer survives being written down, compared with last week, and shown to somebody else.',
        'Câu hỏi ở đây không phải "công cụ nào xịn hơn". Nó là câu trả lời có sống nổi khi bị ghi lại, đem so với tuần trước, và đưa cho người khác xem hay không.',
      ),
    ],
    alternatives: [
      {
        name: bi('Watch Task Manager', 'Ngồi nhìn Task Manager'),
        appeal: bi(
          'Zero setup, already open, and the memory graph climbing in real time is genuinely convincing — you see the shape of the run.',
          'Không phải cài gì, vốn đã mở sẵn, và cái biểu đồ bộ nhớ leo lên theo thời gian thực thì thuyết phục thật: bạn nhìn thấy hình dạng của lần chạy.',
        ),
        breaks: bi(
          'It leaves no record. You cannot diff today against last week, cannot answer "in which 30-second window did the peak happen", and cannot paste a graph you stared at into a journal. It also shows the wrong number for a process tree: the parent of your A12 pool sits near 0.2 GB while its children hold gigabytes.',
          'Nhưng nó không để lại dấu vết nào. Bạn không so được hôm nay với tuần trước, không trả lời được câu "đỉnh rơi vào cửa sổ 30 giây nào", và cũng không dán được cái biểu đồ bạn vừa nhìn vào journal. Nó còn báo sai số với một cây tiến trình: tiến trình cha của pool A12 nằm quanh 0,2 GB trong khi đám con giữ hàng GB.',
        ),
      },
      {
        name: bi('Time the run and compare numbers', 'Bấm giờ rồi so số'),
        appeal: bi(
          'Wall clock is the number your boss cares about, it needs no library, and faster is unambiguously better.',
          'Thời gian chạy là con số mà sếp quan tâm, không cần thư viện nào, và nhanh hơn thì rõ ràng là tốt hơn.',
        ),
        breaks: bi(
          'It tells you that something changed, never what. Two runs of the same length can be one CPU-bound and one waiting on disk, and they need opposite fixes. Wall clock is the score, not the diagnosis.',
          'Nhưng nó chỉ cho biết có thứ gì đó đã đổi, chứ không bao giờ nói là thứ gì. Hai lần chạy cùng độ dài có thể một bên nghẽn CPU, một bên nằm chờ đĩa, và chúng cần hai cách sửa ngược nhau. Thời gian chạy là tỉ số trận đấu, không phải bản chẩn đoán.',
        ),
      },
      {
        name: bi('Reach for a profiler or an APM agent', 'Lôi profiler hay APM agent ra dùng'),
        appeal: bi(
          'Line-level flame graphs, dashboards, alerting — the professional-looking answer, and in a real company it is often the right one.',
          'Có flame graph tới từng dòng, có dashboard, có cảnh báo. Trông rất chuyên nghiệp, và trong một công ty thật thì đây thường là lựa chọn đúng.',
        ),
        breaks: bi(
          'Today it answers the wrong question. Your time goes into DuckDB and the OS, not into your Python lines, so a Python profiler shows you a flat call to execute() holding 100% of the run. And you learn the vendor UI instead of learning what RSS, spill and IO volume actually are.',
          'Nhưng hôm nay nó trả lời nhầm câu hỏi. Thời gian của bạn chui vào DuckDB và hệ điều hành chứ không nằm ở mấy dòng Python, nên một cái profiler Python sẽ chỉ cho bạn thấy một lời gọi execute() phẳng lì chiếm 100% lần chạy. Và bạn học được giao diện của hãng bán công cụ thay vì học RSS, spill và lượng IO thật sự là gì.',
        ),
      },
      {
        name: bi('Wrap the command in your own sampler', 'Tự viết một cái sampler bọc quanh câu lệnh'),
        appeal: bi(
          'Thirty lines of psutil that run any command, walk its process tree twice a second, and write a CSV. The CSV is the point: it is data, and you already spend your days analyzing data.',
          'Ba chục dòng psutil: chạy câu lệnh bất kỳ, nửa giây một lần đi khắp cây tiến trình của nó, rồi ghi ra một file CSV. Chính cái CSV mới là điểm mấu chốt: nó là dữ liệu, mà bạn thì cả ngày đi phân tích dữ liệu.',
        ),
        breaks: bi(
          'It samples, so a spike shorter than the interval is invisible, and it measures from the outside — it can say the run held 6 GB but not which operator held it. That is the honest trade, and it is enough for every decision you make today.',
          'Đổi lại nó lấy mẫu, nên một cú nhảy vọt ngắn hơn khoảng lấy mẫu thì vô hình, và nó đo từ bên ngoài: nó nói được lần chạy giữ 6 GB nhưng không nói được toán tử nào giữ. Đó là cái giá phải trả một cách sòng phẳng, và nó đủ cho mọi quyết định bạn ra hôm nay.',
        ),
      },
    ],
    checks: [
      {
        q: bi(
          'Why write the samples to CSV instead of printing them?',
          'Vì sao lại ghi các mẫu đo ra CSV thay vì in ra màn hình?',
        ),
        a: bi(
          'Because then the monitor output is just another dataset, and you can ask it SQL questions: peak RSS per 30-second bucket, seconds spent above 4 GB, this run against last week. Using your own pipeline exhaust as data has a name — dogfooding.',
          'Vì như vậy thì phần đo được chỉ là một bộ dữ liệu như mọi bộ khác, và bạn hỏi nó bằng SQL: đỉnh RSS theo từng khoảng 30 giây, số giây nằm trên 4 GB, lần chạy này so với tuần trước. Việc lấy chính khí thải của pipeline mình làm dữ liệu có tên riêng là dogfooding.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 3 ─────────── */
  {
    level: 'idea',
    heading: bi(
      'Four resources, one bottleneck, and a limit that turns a crash into a slowdown',
      'Bốn tài nguyên, một bottleneck, và một cái limit biến sự cố chết máy thành chuyện chạy chậm',
    ),
    paras: [
      bi(
        'Every run consumes exactly four things: CPU, memory, disk IO — bytes read and written — and disk space. At any instant one of them is the bottleneck, the thing the run is waiting on. Tuning means finding that one and fixing it. Everything else you "improve" is decoration.',
        'Mỗi lần chạy tiêu thụ đúng bốn thứ: CPU, bộ nhớ, IO đĩa tức số byte đọc và ghi, và dung lượng đĩa. Ở mỗi thời điểm, một trong bốn thứ đó là bottleneck, là thứ mà lần chạy đang phải chờ. Tune nghĩa là tìm ra đúng thứ đó rồi sửa. Mọi thứ khác bạn "cải thiện" chỉ là trang trí.',
      ),
      bi(
        'The memory number that matters is RSS, resident set size: the RAM your process physically occupies right now — the number that answers "will this fit in 16 GB?". And a pipeline is usually a tree of processes, not one: your A12 pool is a parent plus N children, so a monitor that watches only the parent reports almost nothing.',
        'Con số về bộ nhớ đáng quan tâm là RSS, tức resident set size: lượng RAM mà tiến trình của bạn đang thật sự chiếm — con số trả lời câu "cái này có nhét vừa 16 GB không?". Và một pipeline thường là một cây tiến trình chứ không phải một tiến trình: pool ở A12 gồm một cha cộng N con, nên một cái monitor chỉ nhìn tiến trình cha thì gần như chẳng báo được gì.',
      ),
      bi(
        'The big idea of the day is the contract called memory_limit. Without one, a big sort or join simply grows until the OS starts paging — quietly moving memory to disk behind your back — and the whole machine turns to glue. With one, DuckDB promises never to hold more than that in RAM, and when it needs more it spills: writes intermediate chunks to temp files and processes them piece by piece. Out-of-core processing. Slower than staying in RAM, but it finishes, and it never takes the machine down.',
        'Ý chính của hôm nay là cái giao kèo mang tên memory_limit. Không có nó, một phép sort hay join lớn cứ thế phình ra cho tới khi hệ điều hành bắt đầu paging, tức lặng lẽ đẩy bộ nhớ xuống đĩa sau lưng bạn, và cả cái máy đặc quánh lại. Có nó, DuckDB hứa không bao giờ giữ quá ngần ấy trong RAM, và khi cần hơn thì nó spill: ghi các khối trung gian ra file tạm rồi xử lý từng phần. Đó là xử lý out-of-core, chậm hơn so với nằm hẳn trong RAM, nhưng nó chạy xong, và nó không bao giờ hạ gục cái máy.',
      ),
      bi(
        'Which gives you the two flavours of running out of memory, and the difference between them is the whole lesson. The clean flavour: DuckDB decides the limit cannot be honoured and raises OutOfMemoryException; your script catches it, logs it, the machine is fine. The ugly flavour: pandas, or any grow-until-it-dies tool, eats RAM until Windows pages, the mouse stutters, and something crashes — maybe your process, maybe an unrelated one. You met the ugly flavour in A01. Today you walk up to it with a rope tied on.',
        'Từ đó sinh ra hai kiểu hết bộ nhớ, và khác biệt giữa chúng chính là toàn bộ bài học. Kiểu sạch sẽ: DuckDB thấy không giữ nổi lời hứa nên ném ra OutOfMemoryException; script của bạn bắt lấy, ghi log, cái máy vẫn khoẻ. Kiểu xấu xí: pandas, hay bất cứ công cụ nào cứ phình ra tới chết, ngốn RAM cho tới khi Windows paging, con chuột giật cục, rồi có thứ gì đó chết — có thể là tiến trình của bạn, có thể là một tiến trình chẳng liên quan. Kiểu xấu xí thì bạn gặp rồi, ở A01. Hôm nay bạn đi tới sát mép vực nhưng có buộc dây.',
      ),
    ],
    checks: [
      {
        q: bi(
          'DuckDB sorted 82 million rows inside a 1 GB memory limit. Where did the rest of the data live?',
          'DuckDB sort được 82 triệu dòng trong giới hạn bộ nhớ 1 GB. Vậy phần dữ liệu còn lại nằm ở đâu?',
        ),
        a: bi(
          'On disk, in temp files under temp_directory, written and re-read chunk by chunk. That is spilling. The run is slower because disk is slower than RAM, but the limit was honoured and the machine stayed usable the whole time.',
          'Nằm trên đĩa, trong các file tạm dưới temp_directory, được ghi ra rồi đọc lại theo từng khối. Đó là spill. Lần chạy chậm hơn vì đĩa chậm hơn RAM, nhưng lời hứa về giới hạn vẫn được giữ và cái máy vẫn dùng được suốt cả quá trình.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 4 ─────────── */
  {
    level: 'mechanism',
    heading: bi(
      'How a sampler tells the truth, and how to see spill that hides from you',
      'Sampler nói thật bằng cách nào, và làm sao thấy được phần spill đang trốn bạn',
    ),
    paras: [
      bi(
        'The monitor is a loop: start the command as a child process, and every half second walk its process tree and sum RSS, CPU, bytes read and bytes written across every process still alive. One row per sample, straight to CSV. The sampling interval is the resolution — half a second sees a two-minute run in detail and misses a spike that lasts 200 ms.',
        'Cái monitor chỉ là một vòng lặp: khởi động câu lệnh dưới dạng tiến trình con, rồi cứ nửa giây một lần đi khắp cây tiến trình của nó và cộng RSS, CPU, số byte đọc và số byte ghi của mọi tiến trình còn sống. Mỗi lần lấy mẫu là một dòng, ghi thẳng ra CSV. Khoảng lấy mẫu chính là độ phân giải: nửa giây thì nhìn rõ một lần chạy hai phút nhưng bỏ sót một cú nhảy vọt chỉ kéo dài 200 ms.',
      ),
      bi(
        'Two details decide whether the numbers are real. First, keep ONE psutil.Process object per pid for the whole run: cpu_percent(interval=None) means "CPU used since the last call on this same object", so a freshly created object reports 0 forever — and your worker pool looks idle while eight cores burn. For the same reason the first sample is always 0; skip it when averaging. Second, sum the tree, not the parent, and let processes drop out of the cache as they exit.',
        'Có hai chi tiết quyết định mấy con số kia có thật hay không. Thứ nhất, với mỗi pid hãy giữ ĐÚNG MỘT đối tượng psutil.Process suốt cả lần chạy: cpu_percent(interval=None) nghĩa là "phần CPU dùng kể từ lần gọi trước trên chính đối tượng này", nên một đối tượng vừa tạo mới sẽ báo 0 vĩnh viễn, và cái pool worker của bạn trông như đang ngồi chơi trong khi tám nhân đang cháy. Cũng vì lý do đó, mẫu đầu tiên luôn là 0, hãy bỏ nó ra khi tính trung bình. Thứ hai, hãy cộng cả cây chứ đừng lấy mỗi tiến trình cha, và cho các tiến trình rơi khỏi cache khi chúng thoát.',
      ),
      bi(
        'IO counters are cumulative and per process, which produces one surprising rule: report the MAX of the summed read_bytes over the run, not the last sample. When a worker exits it leaves the cache, so its counters leave the sum too, and the total appears to go backwards at the end of a parallel run.',
        'Bộ đếm IO thì tích luỹ và tính theo từng tiến trình, và điều đó sinh ra một quy tắc hơi bất ngờ: hãy lấy giá trị LỚN NHẤT của tổng read_bytes trong cả lần chạy chứ đừng lấy mẫu cuối cùng. Vì khi một worker thoát ra thì nó rời khỏi cache, bộ đếm của nó cũng rời khỏi phép cộng, và tổng số trông như đi giật lùi vào cuối một lần chạy song song.',
      ),
      bi(
        'Spill is measured differently, because on Windows it hides. NTFS updates a file size in directory listings lazily — only when the writing process closes its handle — and DuckDB holds its temp files open until the query ends. So a PowerShell watcher polling the tmp folder shows the files appearing, multiplying and vanishing, but its MB column reads about zero the whole time. For sizes, ask the engine: a second cursor on the same connection polls duckdb_temporary_files() while the query runs, and that view reports both the paths and the live sizes.',
        'Phần spill thì phải đo theo cách khác, vì trên Windows nó trốn rất giỏi. NTFS cập nhật kích thước file trong danh sách thư mục một cách lười biếng, chỉ khi tiến trình đang ghi đóng handle lại, mà DuckDB thì giữ file tạm mở cho tới khi query kết thúc. Nên một vòng lặp PowerShell canh thư mục tmp sẽ thấy các file hiện ra, sinh sôi rồi biến mất, nhưng cột MB thì đứng gần như bằng không suốt. Muốn biết kích thước thì phải hỏi chính engine: mở một cursor thứ hai trên cùng connection để poll duckdb_temporary_files() trong lúc query chạy, view đó trả về cả đường dẫn lẫn kích thước tại thời điểm hiện tại.',
      ),
      bi(
        'Polling from a background thread means you must always stop it: set the event in a finally block and join the thread, or your script finishes the query and then hangs forever on a watcher nobody told to leave.',
        'Poll từ một thread chạy nền thì bắt buộc phải có chỗ dừng nó lại: set cờ trong khối finally rồi join thread, nếu không script của bạn chạy xong query rồi treo vĩnh viễn vì cái watcher không ai bảo nó nghỉ.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Your monitor reports 0% CPU for a parallel backfill that is clearly saturating the machine. What did you do wrong?',
          'Cái monitor báo 0% CPU cho một lần backfill song song rõ ràng đang chạy hết công suất máy. Bạn đã làm sai chỗ nào?',
        ),
        a: bi(
          'You created a new psutil.Process each sample. cpu_percent(interval=None) compares against the previous call on the same object — with a fresh object there is no previous call, so the answer is 0 every time. Cache one object per pid.',
          'Bạn tạo một psutil.Process mới ở mỗi lần lấy mẫu. cpu_percent(interval=None) so với lần gọi trước trên cùng đối tượng, mà đối tượng vừa tạo thì làm gì có lần gọi trước, nên lần nào cũng ra 0. Hãy cache mỗi pid một đối tượng.',
        ),
      },
      {
        q: bi(
          'The PowerShell watcher shows six temp files at 0 MB while the sort is clearly spilling. Is the spill real?',
          'Vòng canh PowerShell hiện sáu file tạm với 0 MB trong khi phép sort rõ ràng đang spill. Vậy phần spill đó có thật không?',
        ),
        a: bi(
          'Yes. The size is stale, not absent: NTFS only refreshes it when the handle closes, and DuckDB keeps its temp files open until the query ends. The watcher proves the lifecycle; duckdb_temporary_files() gives the sizes.',
          'Có thật. Kích thước chỉ là số cũ chứ không phải không có: NTFS chỉ cập nhật khi handle được đóng, mà DuckDB giữ file tạm mở tới lúc query xong. Vòng canh chứng minh vòng đời của file; còn kích thước thì hỏi duckdb_temporary_files().',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 5 ─────────── */
  {
    level: 'detail',
    heading: bi(
      'Where spill lands, why the smallest limit wins, and what all of it costs',
      'Spill rơi vào đâu, vì sao giới hạn nhỏ nhất mới là đáp án, và tất cả những thứ đó tốn bao nhiêu',
    ),
    paras: [
      bi(
        'Spill location is the detail that takes down servers. Provisioned machines usually pair a small OS disk with big attached storage — a 40 GB C: next to terabytes of data volume is a perfectly normal cloud shape. An engine quietly spilling tens of GB onto the OS drive fills it, and a full OS drive takes down everything on the box: logging stops, remote desktop breaks, unrelated services crash.',
        'Chỗ spill rơi xuống mới là chi tiết hạ gục cả server. Máy được cấp phát thường ghép một ổ hệ điều hành nhỏ với một ổ dữ liệu gắn thêm rất lớn: một ổ C: 40 GB nằm cạnh vài terabyte ổ dữ liệu là hình dạng hết sức bình thường trên cloud. Một engine lặng lẽ spill vài chục GB xuống ổ hệ điều hành sẽ làm nó đầy, mà ổ hệ điều hành đầy thì kéo sập mọi thứ trên máy đó: log ngừng ghi, remote desktop hỏng, mấy dịch vụ chẳng liên quan cũng chết theo.',
      ),
      bi(
        'Worse, it is a hidden failure. Spill files vanish the moment the query ends, so the problem is invisible in every small test run, and by the time somebody investigates the crash the evidence is already gone. That is why the convention block pins temp_directory to the data volume and why preflight check #3 from A07 verifies it before every load: a convention is a promise, the check is enforcement.',
        'Tệ hơn nữa, đây là kiểu hỏng ẩn. File spill biến mất ngay khi query kết thúc, nên vấn đề vô hình trong mọi lần chạy thử nhỏ, và tới lúc có người đi điều tra vụ sập thì bằng chứng đã bay mất. Đó là lý do khối quy ước ghim temp_directory vào ổ dữ liệu, và là lý do phép kiểm preflight số 3 từ A07 xác minh nó trước mỗi lần nạp: quy ước là một lời hứa, còn phép kiểm mới là sự cưỡng chế.',
      ),
      bi(
        'The blast radius is one division. Free space on the OS drive divided by spill per run gives the number of concurrent runs that fill it. With 90 GB free and 6 GB per run that is fourteen — comfortable. With the provisioned shape, 15 GB free, it is two. Your A12 sweet spot ran four workers at once, so a single parallel backfill session would kill that box. Do the arithmetic, never the experiment: filling the OS drive is precisely the incident you are learning to prevent.',
        'Phạm vi thiệt hại chỉ là một phép chia. Lấy dung lượng trống của ổ hệ điều hành chia cho lượng spill mỗi lần chạy thì ra số lần chạy đồng thời đủ làm nó đầy. Còn trống 90 GB, mỗi lần chạy spill 6 GB, thì được mười bốn, khá thoải mái. Với hình dạng máy được cấp phát, trống 15 GB, thì được hai. Cấu hình ngon nhất bạn tìm ra ở A12 chạy bốn worker cùng lúc, nên chỉ một phiên backfill song song là đủ giết cái máy đó. Hãy làm phép tính chứ đừng làm thí nghiệm: làm đầy ổ hệ điều hành đúng là cái sự cố mà bạn đang học cách phòng.',
      ),
      bi(
        'Right-sizing asks a production question: what is the smallest memory_limit that still runs the daily load in under twice the best time? Smallest, because in the cloud RAM is the price tag. Sweep the limit downward and the shape is always the same — flat, flat, then a knee where spilling starts, then possibly a clean OOM floor where the operation cannot get its minimum working set. Your answer is the smallest limit still under 2.0x. If every limit gives the same time, your workload never exceeded the smallest one and you measured nothing.',
        'Việc right-size đặt ra một câu hỏi rất sản xuất: memory_limit nhỏ nhất mà vẫn chạy được phần nạp hằng ngày trong vòng dưới hai lần thời gian tốt nhất là bao nhiêu? Nhỏ nhất, vì trên cloud thì RAM chính là cái bảng giá. Quét giới hạn giảm dần thì hình dạng lúc nào cũng vậy: phẳng, phẳng, rồi tới một khuỷu nơi bắt đầu spill, rồi có thể là một cái đáy OOM sạch sẽ nơi phép toán không xin nổi lượng bộ nhớ tối thiểu để khởi động. Đáp án của bạn là giới hạn nhỏ nhất mà vẫn dưới 2,0 lần. Nếu mọi giới hạn đều cho cùng một thời gian thì khối lượng công việc của bạn chưa bao giờ vượt quá cái giới hạn nhỏ nhất, tức là bạn chưa đo được gì cả.',
      ),
      bi(
        'IO volume is the resource people forget. Ask CSV and Parquet the same question — June order count per store — and count bytes read. The CSV side must read all of June, about 10 GB at full scale. The Parquet side reads one column of the pruned June partitions, well under 0.1 GB. Three words explain the hundredfold gap: columns, compression, partitions.',
        'Lượng IO là tài nguyên người ta hay quên. Hãy hỏi CSV và Parquet cùng một câu, là số đơn theo từng cửa hàng trong tháng 6, rồi đếm số byte đọc. Phía CSV buộc phải đọc cả tháng 6, chừng 10 GB ở scale full. Phía Parquet chỉ đọc một cột của mấy partition tháng 6 đã được cắt bớt, chưa tới 0,1 GB. Ba từ giải thích khoảng cách trăm lần đó: cột, nén, partition.',
      ),
      bi(
        'Two measurement hygiene rules, or your numbers lie. Windows caches file reads, so a second scan of the same CSV can be far faster with identical read_bytes — for fair A/B timings run each variant twice and compare same-position runs, which A14 formalizes. And develop every script on small first, where a run takes seconds, then measure on full for the record.',
        'Hai quy tắc vệ sinh khi đo, không có thì số của bạn nói dối. Windows có cache khi đọc file, nên lần quét thứ hai trên cùng một file CSV có thể nhanh hơn hẳn với đúng con số read_bytes như cũ; muốn so A/B cho công bằng thì chạy mỗi biến thể hai lần rồi so lần chạy cùng vị trí, chuyện này A14 sẽ làm cho bài bản. Và hãy dựng mọi script ở scale small trước, nơi mỗi lần chạy chỉ vài giây, rồi mới đo ở full để lấy số chính thức.',
      ),
      bi(
        'Finally, turn the tuning into money, because that is the language the decision is made in. Take a stand-in price of $0.40/hour for an eight-core, 16 GB on-demand VM. Hours saved by A12 times that price times 365 runs a year is what parallelism is worth annually. And if right-sizing showed the daily load fits in 4 GB, it fits a VM tier half the size at roughly half the price. The prices are estimates; the habit of doing this arithmetic is the deliverable.',
        'Cuối cùng, hãy quy phần tuning ra tiền, vì đó là ngôn ngữ mà quyết định được đưa ra. Lấy một mức giá tạm là 0,40 đô la mỗi giờ cho một máy ảo on-demand tám nhân, 16 GB. Số giờ tiết kiệm được nhờ A12 nhân với mức giá đó nhân với 365 lần chạy mỗi năm chính là giá trị hằng năm của việc chạy song song. Còn nếu phần right-size cho thấy tác vụ nạp hằng ngày nằm gọn trong 4 GB thì nó vừa một tier máy nhỏ đi một nửa, giá cũng chừng một nửa. Mấy con số giá chỉ là ước lượng; thứ cần đạt được là cái thói quen ngồi làm phép tính này.',
      ),
    ],
    checks: [
      {
        q: bi(
          'DuckDB defaults temp files to the working directory, and on your machine that is safe. Why is it still a trap?',
          'Mặc định DuckDB để file tạm ở thư mục làm việc, và trên máy bạn thì như vậy vẫn an toàn. Nhưng vì sao nó vẫn là một cái bẫy?',
        ),
        a: bi(
          'Because the default follows the code and the shell, not the data. On a machine where the repo — or merely the shell\'s current directory — sits on the OS drive, the same default sends tens of GB onto C:. Safe by accident is not safe; pin temp_directory explicitly and let preflight verify it.',
          'Vì cái mặc định đó đi theo code và theo shell chứ không đi theo dữ liệu. Trên một cái máy mà repo, hoặc chỉ cần thư mục hiện hành của shell, nằm trên ổ hệ điều hành, thì đúng cái mặc định ấy đẩy vài chục GB vào ổ C:. An toàn nhờ ăn may thì không phải an toàn; hãy ghim temp_directory một cách tường minh và để preflight xác minh nó.',
        ),
      },
      {
        q: bi(
          'Why is "just use the biggest memory_limit that fits" the wrong answer in production?',
          'Vì sao "cứ chọn memory_limit lớn nhất mà máy chịu được" lại là đáp án sai trong môi trường sản xuất?',
        ),
        a: bi(
          'Because RAM is billed. If the job runs in 4 GB at 1.2x the best time, it fits a cheaper VM tier and the difference is real money every hour, forever. The right question is the smallest limit whose runtime you can live with, and only measurement answers it.',
          'Vì RAM bị tính tiền. Nếu job chạy được trong 4 GB với thời gian bằng 1,2 lần mức tốt nhất thì nó vừa một tier máy rẻ hơn, và khoản chênh đó là tiền thật, mỗi giờ, mãi mãi. Câu hỏi đúng là giới hạn nhỏ nhất mà bạn còn chịu được thời gian chạy của nó, và chỉ có đo mới trả lời được.',
        ),
      },
    ],
  },
]

export const a13Terms: Term[] = [
  {
    term: 'RSS',
    gloss: 'lượng RAM tiến trình đang thật sự chiếm',
    means: bi(
      'Resident set size: the RAM a process physically occupies right now — the number that answers "will this fit in 16 GB?". Task Manager shows a close cousin; psutil gives the real thing, scriptable. For a process tree you must sum every child, not read the parent.',
      'Resident set size, tức lượng RAM mà một tiến trình đang thật sự chiếm ngay lúc này, chính là con số trả lời câu "cái này có nhét vừa 16 GB không?". Task Manager hiện một con số họ hàng gần với nó; còn psutil cho đúng con số thật và viết script được. Với một cây tiến trình thì phải cộng mọi tiến trình con chứ không đọc mỗi tiến trình cha.',
    ),
    source: {
      name: 'psutil — Process.memory_info',
      url: 'https://psutil.readthedocs.io/en/latest/#psutil.Process.memory_info',
    },
  },
  {
    term: 'Bottleneck',
    gloss: 'tài nguyên mà lần chạy đang phải chờ',
    means: bi(
      'Of CPU, memory, disk IO and disk space, exactly one is the thing a run is waiting on at any instant. Tuning means finding that one; improving the other three changes nothing measurable.',
      'Trong bốn thứ CPU, bộ nhớ, IO đĩa và dung lượng đĩa thì ở mỗi thời điểm chỉ có đúng một thứ là thứ mà lần chạy đang phải chờ. Tune nghĩa là tìm ra đúng thứ đó; cải thiện ba thứ còn lại thì không đổi được gì đo được.',
    ),
  },
  {
    term: 'memory_limit',
    gloss: 'giao kèo về lượng RAM tối đa',
    means: bi(
      'A DuckDB setting that promises never to hold more than that amount in RAM. If an operation needs more, the engine spills to disk instead of growing. Without a limit, a big sort grows until the OS pages and the machine turns to glue.',
      'Một thiết lập của DuckDB, hứa rằng nó sẽ không bao giờ giữ quá ngần ấy trong RAM. Nếu một phép toán cần hơn thì engine spill xuống đĩa chứ không phình ra tiếp. Không có giới hạn này thì một phép sort lớn cứ thế phình cho tới khi hệ điều hành paging và cả cái máy đặc quánh lại.',
    ),
    source: {
      name: 'DuckDB — Configuration',
      url: 'https://duckdb.org/docs/stable/configuration/overview',
    },
  },
  {
    term: 'Spill',
    gloss: 'ghi tạm xuống đĩa khi RAM không đủ',
    means: bi(
      'When a working set exceeds memory_limit, DuckDB writes intermediate chunks to temp files in temp_directory and processes them piece by piece — out-of-core processing. Slower than staying in RAM, but it finishes and the machine stays usable.',
      'Khi phần dữ liệu đang xử lý vượt quá memory_limit, DuckDB ghi các khối trung gian ra file tạm trong temp_directory rồi xử lý từng phần, tức là xử lý out-of-core. Chậm hơn so với nằm hẳn trong RAM, nhưng nó chạy xong và cái máy vẫn dùng được.',
    ),
  },
  {
    term: 'temp_directory',
    gloss: 'nơi file spill rơi xuống',
    means: bi(
      'Where DuckDB puts its spill files. Must point at the data volume, never the OS drive: a small C: filled by tens of GB of spill takes down logging, remote access and unrelated services. Preflight check #3 from A07 verifies it before every load.',
      'Chỗ DuckDB đặt các file spill. Nó phải trỏ vào ổ dữ liệu chứ tuyệt đối không phải ổ hệ điều hành: một ổ C: nhỏ bị vài chục GB spill làm đầy sẽ kéo sập việc ghi log, việc truy cập từ xa và cả mấy dịch vụ chẳng liên quan. Phép kiểm preflight số 3 từ A07 xác minh điều này trước mỗi lần nạp.',
    ),
  },
  {
    term: 'duckdb_temporary_files()',
    gloss: 'sổ sách của engine về file tạm',
    means: bi(
      'A view listing the paths and live sizes of DuckDB\'s temp files. Poll it from a second cursor while the query runs — on Windows a directory listing shows those files at ~0 MB because NTFS refreshes sizes only when the handle closes.',
      'Một view liệt kê đường dẫn và kích thước hiện thời của các file tạm do DuckDB tạo ra. Hãy poll nó từ một cursor thứ hai trong lúc query chạy, vì trên Windows thì danh sách thư mục hiện mấy file đó ở mức khoảng 0 MB do NTFS chỉ làm mới kích thước khi handle được đóng.',
    ),
    source: {
      name: 'DuckDB — duckdb_temporary_files',
      url: 'https://duckdb.org/docs/stable/sql/meta/duckdb_table_functions',
    },
  },
  {
    term: 'Clean OOM',
    gloss: 'hết bộ nhớ nhưng có kiểm soát',
    means: bi(
      'DuckDB decides the memory limit cannot be honoured and raises OutOfMemoryException. Your script catches it, logs it, the machine is fine. A valid experimental result, not a failure — some operations simply need a minimum working set.',
      'DuckDB thấy không giữ nổi lời hứa về giới hạn bộ nhớ nên ném ra OutOfMemoryException. Script của bạn bắt lấy, ghi log, cái máy vẫn khoẻ. Đây là một kết quả thí nghiệm hợp lệ chứ không phải một lần thất bại, vì có những phép toán cần một lượng bộ nhớ tối thiểu mới khởi động được.',
    ),
  },
  {
    term: 'Paging',
    gloss: 'hệ điều hành âm thầm đẩy RAM xuống đĩa',
    means: bi(
      'What the OS does when RAM runs out and nothing set a limit: memory is moved to disk behind your back, everything crawls — including the editor holding your unsaved journal — and something eventually crashes. The ugly flavour of running out of memory.',
      'Là thứ hệ điều hành làm khi RAM cạn mà không ai đặt giới hạn: bộ nhớ bị đẩy xuống đĩa sau lưng bạn, mọi thứ bò lê, kể cả cái editor đang giữ bản journal chưa lưu, và rốt cuộc có thứ gì đó chết. Đây là kiểu hết bộ nhớ xấu xí.',
    ),
  },
  {
    term: 'Guard rail',
    gloss: 'hai dòng chặn trước khi chạm vực',
    means: bi(
      'A check inside a deliberately dangerous experiment: abort when my RSS exceeds a budget, or when system available memory drops below a floor. Costs two lines, and it is what separates walking to the cliff edge from falling off it.',
      'Một phép kiểm đặt ngay trong một thí nghiệm cố ý nguy hiểm: dừng lại khi RSS của mình vượt ngân sách, hoặc khi bộ nhớ còn trống của cả hệ thống tụt xuống dưới một mức sàn. Nó tốn hai dòng, và chính nó phân biệt giữa việc đi ra sát mép vực với việc rơi xuống.',
    ),
  },
  {
    term: 'IO volume',
    gloss: 'số byte thật sự phải đọc',
    means: bi(
      'Bytes read and written, measured with io_counters. The resource people forget: the same aggregate over June costs about 10 GB of reads from CSV and well under 0.1 GB from the Parquet lake. Columns, compression, partitions.',
      'Số byte đọc và ghi, đo bằng io_counters. Đây là tài nguyên người ta hay quên: cùng một phép tổng hợp cho tháng 6 mà đọc từ CSV thì tốn chừng 10 GB, còn đọc từ Parquet lake thì chưa tới 0,1 GB. Lý do gói trong ba từ: cột, nén, partition.',
    ),
  },
  {
    term: 'Right-sizing',
    gloss: 'tìm giới hạn nhỏ nhất còn chấp nhận được',
    means: bi(
      'Sweeping memory_limit downward to find the smallest one that still runs the job in under 2x the best time. Smallest matters because in the cloud RAM is the price tag. The curve is flat, flat, knee, then possibly a clean OOM floor.',
      'Quét memory_limit giảm dần để tìm ra giới hạn nhỏ nhất mà vẫn chạy xong công việc trong dưới 2 lần thời gian tốt nhất. Nhỏ nhất mới quan trọng, vì trên cloud thì RAM chính là cái bảng giá. Đường cong sẽ phẳng, phẳng, rồi gãy khuỷu, rồi có thể là một cái đáy OOM sạch sẽ.',
    ),
  },
  {
    term: 'Blast radius (disk)',
    gloss: 'mấy lần chạy thì đầy ổ hệ thống',
    means: bi(
      'Free space on the OS drive divided by spill per run. With 90 GB free and 6 GB per run it is fourteen concurrent runs; on a provisioned 40 GB OS disk with 15 GB free it is two — and your A12 sweet spot ran four workers.',
      'Lấy dung lượng trống của ổ hệ điều hành chia cho lượng spill mỗi lần chạy. Còn trống 90 GB, mỗi lần 6 GB, thì được mười bốn lần chạy đồng thời; còn trên một ổ hệ điều hành 40 GB được cấp phát, trống 15 GB, thì chỉ được hai, trong khi cấu hình ngon nhất ở A12 của bạn chạy tới bốn worker.',
    ),
  },
  {
    term: 'Dogfooding',
    gloss: 'lấy khí thải của chính pipeline làm dữ liệu',
    means: bi(
      'Your monitor emits CSV; you spend your days analyzing CSV. Query the monitor output with DuckDB — peak RSS per 30-second bucket, seconds spent above 4 GB — instead of squinting at a graph you cannot save.',
      'Cái monitor của bạn nhả ra CSV, mà bạn thì cả ngày đi phân tích CSV. Hãy query phần output đó bằng DuckDB, kiểu như đỉnh RSS theo từng khoảng 30 giây hay số giây nằm trên 4 GB, thay vì nheo mắt nhìn một cái biểu đồ không lưu lại được.',
    ),
  },
  {
    term: 'Cold vs warm run',
    gloss: 'lần chạy đầu và lần chạy sau không so được',
    means: bi(
      'Windows caches file reads, so a second scan of the same CSV can be much faster with identical read_bytes. For fair A/B timings run each variant twice and compare same-position runs. A14 formalizes this.',
      'Windows có cache khi đọc file, nên lần quét thứ hai trên cùng một file CSV có thể nhanh hơn hẳn dù read_bytes không đổi. Muốn so A/B cho công bằng thì chạy mỗi biến thể hai lần rồi so lần chạy cùng vị trí. A14 sẽ làm chuyện này cho bài bản.',
    ),
  },
]