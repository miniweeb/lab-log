import type { TheorySection, Term } from '../types'
import { bi } from '../types'

export const a00Theory: TheorySection[] = [
  {
    level: 'problem',
    heading: bi('Every incident report contains the same sentence', 'Mọi báo cáo sự cố đều chứa cùng một câu'),
    paras: [
      bi(
        'Every data engineering incident report contains a sentence like "the job ran on the wrong environment / wrong path / wrong Python". Professionals make their environment boring and reproducible before touching data.',
        'Mọi báo cáo sự cố trong data engineering đều chứa một câu đại loại "job đã chạy nhầm môi trường / nhầm đường dẫn / nhầm bản Python". Người có kinh nghiệm sẽ làm cho môi trường của mình đơn giản và tái lập được TRƯỚC khi chạm vào dữ liệu.',
      ),
      bi(
        'The second problem is where data lives. Cloud-sync folders — OneDrive, Dropbox, Documents on many corporate laptops — are poison for data work. A 24 GB dataset in OneDrive will grind your sync, your disk, and possibly your quota.',
        'Vấn đề thứ hai là dữ liệu nằm ở đâu. Các thư mục đồng bộ đám mây — OneDrive, Dropbox, hay Documents trên nhiều laptop công ty — rất tệ cho công việc dữ liệu. Một tập dữ liệu 24 GB nằm trong OneDrive sẽ làm trình đồng bộ ì ạch, ổ đĩa quá tải, và có thể vượt hạn mức lưu trữ.',
      ),
      bi(
        'There is a third, quieter one: temp and spill space. When an engine needs more memory than it is allowed, it spills working data to disk. Real provisioned machines usually pair a small OS disk with a big attached data disk, and an engine quietly spilling tens of GB onto C:\\ fills the OS drive and takes down everything on the box — a hidden failure point that only shows up under load.',
        'Còn vấn đề thứ ba, khó thấy hơn: chỗ chứa file tạm và dữ liệu tràn. Khi một engine cần nhiều bộ nhớ hơn mức được phép, nó sẽ đẩy dữ liệu đang xử lý xuống đĩa. Máy chủ thật thường ghép một ổ hệ thống nhỏ với một ổ dữ liệu lớn gắn thêm, và một engine lặng lẽ đổ hàng chục GB xuống ổ C: sẽ làm đầy ổ hệ thống và làm sập mọi thứ trên máy đó — một điểm hỏng ẩn chỉ lộ ra khi chịu tải.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Why is "it works on my machine" a technical problem and not just an excuse?',
          'Vì sao "máy tôi chạy được mà" là một vấn đề kỹ thuật chứ không chỉ là một cái cớ?',
        ),
        a: bi(
          'Because a number is only evidence if someone can reproduce it. The moment your result depends on which Python happened to be first in PATH, or which library version you installed last month, the number stops being evidence and becomes an anecdote.',
          'Vì một con số chỉ là bằng chứng nếu có người tái lập được nó. Ngay khi kết quả của bạn phụ thuộc vào việc Python nào tình cờ đứng đầu trong PATH, hay bạn cài version thư viện nào hồi tháng trước, con số đó không còn là bằng chứng, chỉ còn là chuyện kể lại.',
        ),
      },
    ],
  },
  {
    level: 'alternatives',
    heading: bi('The shortcuts, and what each one costs', 'Những lối tắt, và cái giá của từng cái'),
    paras: [],
    alternatives: [
      {
        name: bi('pip install straight into system Python', 'pip install thẳng vào Python hệ thống'),
        appeal: bi('One command, no extra folders, everything available everywhere.', 'Một câu lệnh, không thư mục thừa, mọi thứ dùng được ở mọi nơi.'),
        breaks: bi(
          'Two projects needing different versions of the same library cannot coexist. And you can never answer "what exactly does this project need?", because the answer is entangled with everything else you ever installed. A venv is a private copy of Python just for this project, so the lab\'s package versions can never collide with anything else on your machine.',
          'Hai dự án cần hai version khác nhau của cùng một thư viện thì không thể cùng tồn tại. Và bạn không bao giờ trả lời được câu "dự án này cần chính xác những gì?", vì nó lẫn với mọi thứ khác bạn từng cài. Một venv là bản Python riêng chỉ dành cho dự án này, nhờ đó version gói của lab không bao giờ va chạm với bất cứ thứ gì khác trên máy bạn.',
        ),
      },
      {
        name: bi('Keep the data next to the code, in the repo', 'Để dữ liệu ngay cạnh code, trong repo'),
        appeal: bi('Everything in one place. Clone the repo and you have the whole project.', 'Mọi thứ ở một chỗ. Clone repo về là có nguyên dự án.'),
        breaks: bi(
          'Code goes in git; data never does — it is huge and regenerable, and git handles large binaries badly. The shipped .gitignore enforces that split for you: data/, *.duckdb, tmp/, quarantine/ never enter git.',
          'Code đi vào git; dữ liệu thì không bao giờ — nó rất lớn và tạo lại được, mà git thì xử lý file nhị phân lớn rất tệ. File .gitignore có sẵn đã tách sẵn hai thứ đó: data/, *.duckdb, tmp/, quarantine/ không bao giờ được vào git.',
        ),
      },
      {
        name: bi('Develop straight on the full dataset', 'Phát triển thẳng trên bộ dữ liệu đầy đủ'),
        appeal: bi('Why work on a toy? Real conditions from day one means no surprises later.', 'Sao phải làm trên dữ liệu giả? Điều kiện thật ngay từ ngày đầu thì về sau khỏi bất ngờ.'),
        breaks: bi(
          'The generator produces the same dataset at two sizes: small (60k rows/day, ~800 MB for month 1; fits anywhere, runs in seconds) and full (1.2M rows/day, ~24 GB — big enough that careless code visibly struggles on a 16 GB machine). You develop every pipeline on small and run it on full. Fast feedback while coding, real conditions when it counts.',
          'Generator tạo ra cùng một tập dữ liệu ở hai cỡ: small (60 nghìn dòng mỗi ngày, khoảng 800 MB cho tháng một; chạy được ở đâu cũng được, mất vài giây) và full (1,2 triệu dòng mỗi ngày, khoảng 24 GB — đủ lớn để code viết ẩu lộ rõ vấn đề trên máy 16 GB). Bạn phát triển mọi pipeline trên small rồi chạy nó trên full. Phản hồi nhanh lúc viết code, điều kiện thật lúc cần.',
        ),
      },
    ],
  },
  {
    level: 'idea',
    heading: bi('Separate the three things, and make data disposable', 'Tách ba thứ ra, và làm cho dữ liệu vứt đi được'),
    paras: [
      bi(
        'Code lives in a git repo. The environment lives in .venv, described by requirements.txt so it can be rebuilt from scratch. Data lives on a fast local non-synced disk, and its location is named by the ETL_LAB_DATA environment variable so no script ever contains a hard-coded path.',
        'Code nằm trong repo git. Môi trường nằm trong .venv, được mô tả bởi requirements.txt để dựng lại được từ đầu. Dữ liệu nằm trên một ổ nội bộ nhanh không đồng bộ đám mây, và vị trí của nó được đặt tên qua biến môi trường ETL_LAB_DATA, nhờ đó không script nào chứa đường dẫn ghi cứng.',
      ),
      bi(
        'Determinism. The generator is seeded per date: the file for 2026-06-10 is byte-identical every time anyone generates it. That means expected numbers in these assignments are exact, regeneration is always safe, and a corrupted experiment is never a disaster — delete and regenerate.',
        'Tính tất định. Generator dùng seed theo từng ngày: file của ngày 2026-06-10 giống hệt nhau tới từng byte, dù ai sinh ra và sinh bao nhiêu lần. Điều đó nghĩa là các con số kỳ vọng trong các bài này là chính xác, việc sinh lại luôn an toàn, và một thí nghiệm bị hỏng không phải vấn đề lớn — cứ xoá đi rồi sinh lại.',
      ),
      bi(
        'That last property changes how you work. When data is disposable, you stop being careful in the wrong way — you stop protecting a dataset you can rebuild in ten minutes, and start being careful about the thing that actually matters: your code, and whether its numbers are checkable.',
        'Tính chất cuối cùng đó thay đổi cách bạn làm việc. Khi dữ liệu có thể tạo lại, bạn thôi cẩn thận nhầm chỗ — thôi bảo vệ một tập dữ liệu mà bạn dựng lại được trong mười phút, và bắt đầu cẩn thận với thứ thật sự quan trọng: code của bạn, và việc các con số của nó có kiểm chứng được hay không.',
      ),
    ],
  },
  {
    level: 'mechanism',
    heading: bi('What the pieces actually do', 'Các mảnh ghép thật sự làm gì'),
    paras: [
      bi(
        'The venv. python -m venv .venv creates a folder holding a private Python. Activate.ps1 edits PATH for this terminal session only, so python and pip point into .venv. The prompt gaining a (.venv) prefix is the only visible sign it is active.',
        'Về venv. Lệnh python -m venv .venv tạo ra một thư mục chứa bản Python riêng. Script Activate.ps1 sửa biến PATH chỉ cho riêng phiên terminal này, để python và pip trỏ vào .venv. Dấu nhắc lệnh có thêm tiền tố (.venv) là dấu hiệu duy nhất nhìn thấy được rằng nó đang bật.',
      ),
      bi(
        'Git as a save-point system. Over the next 15 assignments you will write real code, and some assignments (A07 especially) break things on purpose. A commit is a snapshot of your code you can always return to, so no experiment is ever fatal.',
        'Git như một hệ thống save point. Qua 15 bài tiếp theo bạn sẽ viết code thật, và một số bài (đặc biệt là A07) cố ý làm hỏng mọi thứ. Một commit là một bản snapshot code mà bạn luôn quay về được, nhờ vậy không thử nghiệm nào là không cứu được.',
      ),
      bi(
        'The environment variable. setx writes to the Windows registry, but a running process reads environment variables once, at startup — so setx affects FUTURE terminals. Close and reopen your terminal (and re-activate the venv), then verify. This is true of every OS and every language.',
        'Về biến môi trường. Lệnh setx ghi vào registry của Windows, nhưng một process đang chạy chỉ đọc biến môi trường đúng một lần, lúc khởi động — nên setx chỉ ảnh hưởng tới các terminal TƯƠNG LAI. Đóng terminal, mở lại (và kích hoạt lại venv), rồi mới kiểm tra. Điều này đúng với mọi hệ điều hành và mọi ngôn ngữ.',
      ),
      bi(
        'The manifest. Next to every orders file, shopcore writes raw/manifest/orders_YYYY-MM-DD.json stating exact row count, byte size, and min/max order_ts. This is your ground truth. Rule for the rest of the lab: after any load, reconcile your count against the producer\'s claim. Never assume a file arrived complete.',
        'Về manifest. Bên cạnh mỗi file đơn hàng, shopcore ghi một file raw/manifest/orders_YYYY-MM-DD.json khai chính xác số dòng, số byte, và mốc order_ts nhỏ nhất cùng lớn nhất. Đây là nguồn tham chiếu chuẩn của bạn. Luật cho phần còn lại của lab: sau mọi lần nạp, reconcile số bạn đếm được với con số producer đã khai. Đừng bao giờ giả định rằng một file đã về đầy đủ.',
      ),
    ],
    checks: [
      {
        q: bi('You run setx and then echo the variable in the same terminal. Nothing. Why?', 'Bạn chạy setx rồi in biến ra ngay trong terminal đó. Không có gì. Vì sao?'),
        a: bi(
          'A running process reads environment variables once, at startup, and setx wrote to the registry afterwards. Open a new terminal. This is a general law, not a Windows quirk.',
          'Một process đang chạy chỉ đọc biến môi trường một lần lúc khởi động, còn setx thì ghi vào registry sau đó. Mở terminal mới. Đây là một luật chung, không phải chuyện riêng của Windows.',
        ),
      },
    ],
  },
  {
    level: 'detail',
    heading: bi('The data contract, and the silences in it', 'Data contract, và những chỗ nó im lặng'),
    paras: [
      bi(
        'This lab simulates a real feed: shopcore, the e-commerce platform, exports one CSV of orders per day. Your laptop plays two roles at once — shopcore\'s side (a data generator that writes those CSVs) and you, the data engineer who must turn them into something trustworthy.',
        'Lab này mô phỏng một feed thật: shopcore, một nền tảng thương mại điện tử, xuất ra mỗi ngày một file CSV đơn hàng. Laptop của bạn đóng cùng lúc hai vai trò — phía shopcore (một generator viết ra các file CSV đó) và chính bạn, data engineer phải biến chúng thành dữ liệu đáng tin.',
      ),
      bi(
        'Between the two sides sits contracts/shopcore_orders_daily.contract.yaml — the agreement between the producing application team and the data warehouse team. It is a promise, version-controlled and reviewed like code. The warehouse validates every delivery against it (A05/A06); anything the data does that this file forbids is an INCIDENT to raise with the producer, not something to silently "fix" in ETL.',
        'Giữa hai phía là file contracts/shopcore_orders_daily.contract.yaml — thoả thuận giữa team ứng dụng tạo dữ liệu và đội warehouse. Nó là một cam kết, có version và được review như code. Warehouse validate mọi file giao dựa trên nó ở A05 và A06; bất cứ điều gì dữ liệu làm mà file này cấm đều là một SỰ CỐ phải nêu với producer, chứ không phải thứ để lặng lẽ "sửa" trong ETL.',
      ),
      bi(
        'Read it the way a data engineer must: for every column ask — what type is it REALLY, can it be null, can it repeat, what timezone, what currency/scale, who owns the meaning, and WHAT IS NOT WRITTEN HERE?',
        'Hãy đọc nó theo cách một data engineer buộc phải đọc: với mỗi cột, hãy hỏi — nó THẬT SỰ là kiểu gì, có được null không, có lặp lại được không, múi giờ nào, tiền tệ và số chữ số thập phân ra sao, ai sở hữu ý nghĩa của nó, và ĐIỀU GÌ KHÔNG ĐƯỢC VIẾT RA Ở ĐÂY?',
      ),
      bi(
        'That last question is the one juniors skip. The contract says updated_at is a "last-change marker used for latest-wins dedupe" — and says nothing about this column\'s timezone or whether it is event time or export-batch time. That silence is load-bearing.',
        'Câu hỏi cuối cùng đó là câu mà người mới thường bỏ qua. Contract nói updated_at là "dấu mốc thay đổi cuối, dùng cho phép dedupe lấy bản mới nhất" — và không nói gì về múi giờ của cột này, cũng không nói nó là event time hay thời điểm export batch. Chỗ không quy định đó lại rất quan trọng.',
      ),
      bi(
        'Three clauses matter enough to meet today. business_date: the date in the file name is the order business date in UTC, but the file for day D also carries corrections for orders up to 7 days old — consumers must not assume file date equals every row\'s order date. late_corrections: the same order_id may be re-sent in a later file; latest updated_at wins, by VALUE not arrival order. completeness_signal: the warehouse MUST reconcile loaded rows against manifest.rows every load.',
        'Ba điều khoản cần biết ngay hôm nay. business_date: ngày trong tên file là business date của đơn hàng theo giờ UTC, nhưng file của ngày D còn mang theo các bản sửa cho đơn hàng cũ tới 7 ngày — consumer không được giả định ngày của file bằng ngày đặt hàng của mọi dòng. late_corrections: cùng một order_id có thể được gửi lại trong file sau; bản có updated_at mới nhất thắng, mới nhất theo GIÁ TRỊ chứ không theo thứ tự file về. completeness_signal: warehouse BẮT BUỘC phải reconcile số dòng đã nạp với manifest.rows ở mọi lần nạp.',
      ),
      bi(
        'That first clause is the one you will feel from A02 onward. One sentence in a YAML file is why one input file writes into eight partition folders, why the same order_id lives in two places, and why A08 exists at all.',
        'Điều khoản đầu tiên đó là thứ bạn sẽ gặp lại từ A02 trở đi. Một câu trong file YAML là lý do một file đầu vào ghi vào tám partition, là lý do cùng một order_id tồn tại ở hai nơi, và là lý do A08 tồn tại.',
      ),
    ],
    checks: [
      {
        q: bi('The lab title says 24 GB but you only generate ~16 GB today. Where is the rest?', 'Tiêu đề lab nói 24 GB nhưng hôm nay bạn chỉ sinh ra khoảng 16 GB. Phần còn lại đâu?'),
        a: bi(
          'Month 2, and it arrives in A10 — when the upstream team ships it with a changed schema. Do not generate it, do not read about it. Generating month 2 "to be ready" robs you of A10\'s main lesson.',
          'Đó là tháng hai, và nó về ở A10 — khi team upstream gửi nó với schema đã thay đổi. Đừng sinh nó, đừng đọc về nó. Sinh tháng hai "cho sẵn sàng" là tự làm mất bài học chính của A10.',
        ),
      },
    ],
  },
]

export const a00Terms: Term[] = [
  {
    term: 'Virtual environment (venv)',
    gloss: 'môi trường ảo',
    means: bi(
      'A private copy of Python just for this project, so the lab\'s package versions can never collide with anything else on your machine.',
      'Một bản Python riêng chỉ dành cho dự án này, để version gói của lab không bao giờ va chạm với bất cứ thứ gì khác trên máy bạn.',
    ),
    source: { name: 'Python docs — venv', url: 'https://docs.python.org/3/library/venv.html' },
  },
  {
    term: 'Two scales (small / full)',
    gloss: 'hai quy mô',
    means: bi(
      'The same dataset at 60k rows/day and 1.2M rows/day. Develop on small, run on full: fast feedback while coding, real conditions when it counts.',
      'Cùng một tập dữ liệu ở mức 60 nghìn dòng mỗi ngày và 1,2 triệu dòng mỗi ngày. Phát triển trên small, chạy trên full: phản hồi nhanh lúc viết code, điều kiện thật lúc cần.',
    ),
    source: { name: 'DuckDB docs', url: 'https://duckdb.org/docs/' },
  },
  {
    term: 'Determinism',
    gloss: 'tính tất định',
    means: bi(
      'The generator is seeded per date, so a given day\'s file is byte-identical every time. Expected numbers are exact, and regeneration is always safe.',
      'Generator dùng seed theo từng ngày, nên file của một ngày cho trước luôn giống hệt tới từng byte. Các con số kỳ vọng là chính xác, và việc sinh lại luôn an toàn.',
    ),
    source: { name: 'Python docs — random.seed', url: 'https://docs.python.org/3/library/random.html#random.seed' },
  },
  {
    term: 'Manifest',
    gloss: 'manifest của producer',
    means: bi(
      'A JSON beside each orders file stating exact row count, byte size, and min/max order_ts. Your ground truth: after any load, reconcile against it.',
      'Một file JSON nằm cạnh mỗi file đơn hàng, khai chính xác số dòng, số byte, và mốc order_ts nhỏ nhất cùng lớn nhất. Đây là nguồn tham chiếu chuẩn: sau mọi lần nạp, hãy reconcile với nó.',
    ),
    source: { name: 'MotherDuck glossary', url: 'https://motherduck.com/glossary/' },
  },
  {
    term: 'Data contract',
    gloss: 'data contract',
    means: bi(
      'The version-controlled agreement between producer and warehouse. Anything the data does that the contract forbids is an incident to raise, not something to silently fix in ETL.',
      'Thoả thuận được quản lý version giữa producer và warehouse. Bất cứ điều gì dữ liệu làm mà contract cấm đều là sự cố phải nêu ra, không phải thứ để lặng lẽ sửa trong ETL.',
    ),
    source: { name: 'MotherDuck glossary', url: 'https://motherduck.com/glossary/' },
  },
  {
    term: 'Spill / temp directory',
    gloss: 'tràn ra đĩa / thư mục tạm',
    means: bi(
      'When an engine needs more memory than allowed it writes working data to disk. Point it at the data volume — spilling tens of GB onto the OS drive takes down the whole machine.',
      'Khi một engine cần nhiều bộ nhớ hơn mức cho phép, nó ghi dữ liệu đang xử lý xuống đĩa. Hãy trỏ nó về ổ dữ liệu — đổ hàng chục GB xuống ổ hệ thống sẽ hạ gục cả cỗ máy.',
    ),
    source: { name: 'DuckDB — configuration', url: 'https://duckdb.org/docs/configuration/overview' },
  },
  {
    term: 'RFC 4180 quoting',
    gloss: 'quy tắc bọc nháy của CSV',
    means: bi(
      'The CSV standard: a field containing commas or quotes is wrapped in quotes, and every inner quote is doubled. This is how JSON survives inside a CSV cell.',
      'Chuẩn của CSV: một trường chứa dấu phẩy hoặc dấu nháy thì được bọc trong dấu nháy, và mọi dấu nháy bên trong được nhân đôi. Đây là cách JSON sống sót bên trong một ô CSV.',
    ),
    source: { name: 'RFC 4180', url: 'https://www.rfc-editor.org/rfc/rfc4180' },
  },
]
