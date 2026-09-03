import type { AssignmentSpec } from '../types'
import { bi, vi } from '../types'
import { a00Terms, a00Theory } from './a00.theory'

export const a00: AssignmentSpec = {
  id: 'a00',
  code: 'A00',
  title: bi('Setup & data generation', 'Dựng môi trường và sinh dữ liệu'),
  summary: bi(
    'Make your environment boring and reproducible, generate the course data, and verify it.',
    'Làm cho môi trường của bạn trở nên đơn giản và tái lập được, sinh dữ liệu cho khoá học, rồi kiểm chứng nó.',
  ),
  estHours: 2,
  difficulty: 1,
  outcome: bi(
    'You have a workspace where nobody can ever ask "which Python was that?", and you have already practised the habit the whole lab runs on: never assume, always check.',
    'Bạn có một chỗ làm việc mà không ai còn hỏi được câu "hồi nãy chạy bằng Python nào vậy?", và bạn đã tập luôn thói quen mà cả lab vận hành dựa trên nó: không bao giờ giả định, luôn luôn kiểm chứng.',
  ),
  theory: a00Theory,
  terms: a00Terms,
  tasks: [
    {
      id: 'a00-t1',
      num: 1,
      title: bi('Create the environment', 'Tạo môi trường'),
      goal: bi('An isolated Python with duckdb ≥ 1.4 importable.', 'Một Python cô lập, import được duckdb version 1.4 trở lên.'),
      steps: [
        {
          title: bi('Survey the machine first', 'Khảo sát máy trước đã'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Windows 10/11 (macOS or Linux are fine too — translate the shell lines), 16 GB RAM, 8 cores, ~80 GB free on a local SSD, Python 3.11+, git 2.x.',
                'Windows 10 hoặc 11 (macOS hay Linux cũng được — chỉ cần dịch các dòng lệnh shell), 16 GB RAM, 8 nhân, khoảng 80 GB trống trên ổ SSD nội bộ, Python 3.11 trở lên, git 2.x.',
              ),
            },
            {
              kind: 'code',
              lang: 'powershell',
              body: `python --version
py -0p                                          # which Pythons are installed
git --version
Test-Path .\\.venv\\Scripts\\Activate.ps1          # is there already a venv?
git rev-parse --is-inside-work-tree 2>$null     # is git initialized?
$env:ETL_LAB_DATA
Get-PSDrive -PSProvider FileSystem | Select-Object Name,
  @{n='UsedGB';e={[math]::Round($_.Used/1GB,1)}},
  @{n='FreeGB';e={[math]::Round($_.Free/1GB,1)}}
(Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB
(Get-CimInstance Win32_Processor).NumberOfLogicalProcessors`,
            },
          ],
        },
        {
          title: bi('Create and activate', 'Tạo và kích hoạt'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
python -c "import duckdb, pyarrow, numpy, pandas, psutil, pytest; print('duckdb', duckdb.__version__)"`,
            },
            { kind: 'expect', body: bi('The last line prints a duckdb version ≥ 1.4.', 'Dòng cuối in ra version duckdb từ 1.4 trở lên.') },
            {
              kind: 'why',
              body: bi(
                'pytest is in that list on purpose — from A03 on, your own code gets its own tests, and this is the tool that runs them.',
                'pytest nằm trong danh sách đó là có chủ ý — từ A03 trở đi, code của chính bạn sẽ có bộ kiểm thử riêng, và đây là công cụ chạy chúng.',
              ),
            },
          ],
        },
      ],
      accept: [bi('duckdb version ≥ 1.4 prints without error', 'Phiên bản duckdb từ 1.4 trở lên in ra không lỗi')],
    },

    {
      id: 'a00-t2',
      num: 2,
      title: bi('Put the repo under version control', 'Đưa repo vào quản lý version'),
      goal: bi('A git repo on main with your first commit, and data excluded.', 'Một repo git trên nhánh main với commit đầu tiên, và dữ liệu bị loại trừ.'),
      steps: [
        {
          title: bi('Initialize and configure', 'Khởi tạo và cấu hình'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `git init -b main
git config user.name "Your Name"
git config user.email "you@example.com"
git config core.editor "notepad"`,
            },
            {
              kind: 'glossary',
              items: [
                {
                  term: 'git init -b main',
                  means: bi(
                    'Turns this folder into a git repository whose first branch is named main (the modern default name).',
                    'Biến thư mục này thành một repo git với nhánh đầu tiên tên là main (tên mặc định hiện đại).',
                  ),
                },
                {
                  term: 'user.name / user.email',
                  means: bi(
                    'Label every commit with who made it — git refuses to commit without them. These apply to this repo only; add --global to set them machine-wide.',
                    'Gắn nhãn cho mọi commit về việc ai đã tạo ra nó — không có chúng thì git từ chối commit. Hai dòng này chỉ áp dụng cho repo này; thêm --global nếu muốn đặt cho cả máy.',
                  ),
                },
                {
                  term: 'core.editor "notepad"',
                  means: bi(
                    'Trap-defusal: if you run git commit without -m "message", git opens an editor and waits. With this setting that is plain Notepad instead of vim, whose exit sequence (Esc then :q!) has baffled generations of juniors.',
                    'Gỡ bẫy: nếu bạn chạy git commit mà không kèm -m "thông điệp", git sẽ mở một trình soạn thảo rồi đứng chờ. Với thiết lập này thì đó là Notepad bình thường thay vì vim, mà chuỗi phím thoát của vim (Esc rồi :q!) đã làm bao thế hệ người mới hoang mang.',
                  ),
                },
              ],
            },
          ],
        },
        {
          title: bi('Read the .gitignore — three groups', 'Đọc file .gitignore — ba nhóm'),
          blocks: [
            {
              kind: 'code',
              lang: 'text',
              body: `# data never lives in the repo
data/
*.duckdb
*.duckdb.wal
tmp/
quarantine/
# python
__pycache__/
.pytest_cache/
*.pyc
.venv/
venv/
# dbt (A15)
**/target/
**/dbt_packages/
logs/`,
            },
            {
              kind: 'glossary',
              items: [
                {
                  term: 'data group',
                  means: bi(
                    'Datasets and databases never enter git — they are gigabytes, regenerable, and git handles large binaries badly.',
                    'Tập dữ liệu và database không bao giờ vào git — chúng nặng hàng gigabyte, sinh lại được, và git xử lý file nhị phân lớn rất tệ.',
                  ),
                },
                {
                  term: 'python group',
                  means: bi('Machine-generated Python clutter that every machine rebuilds for itself.', 'Rác do Python sinh ra mà máy nào cũng tự dựng lại được.'),
                },
                {
                  term: 'dbt & logs group',
                  means: bi('Tool output, recreated on every run. You will meet these in A07 and A15.', 'Kết quả do công cụ tạo ra, sinh lại ở mỗi lần chạy. Bạn sẽ gặp chúng ở A07 và A15.'),
                },
              ],
            },
          ],
        },
        {
          title: bi('Make your first commit', 'Tạo commit đầu tiên'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `git status      # untracked files — note .venv is NOT listed:
                # the .gitignore is already doing its job
git add .
git commit -m "A00: environment up"
git log --oneline`,
            },
            {
              kind: 'expect',
              body: bi(
                'git commit prints [main (root-commit) <sha>] A00: environment up, and git log --oneline shows exactly that one commit.',
                'Lệnh git commit in ra [main (root-commit) <sha>] A00: environment up, và git log --oneline hiện đúng một commit đó.',
              ),
            },
          ],
        },
        {
          title: bi('How you will work from A01 on', 'Cách bạn sẽ làm việc từ A01 trở đi'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Every assignment follows one git ritual: start a branch named aNN-<topic>, make one commit after each numbered task (message like "A01 task 6: parquet load" — imperative, subject ≤ 72 characters), and merge back only when the Definition of Done is green.',
                'Mỗi bài đều theo một nghi thức git: mở một nhánh tên aNN-<chủ đề>, tạo một commit sau mỗi task có đánh số (thông điệp kiểu "A01 task 6: parquet load" — thể mệnh lệnh, tiêu đề không quá 72 ký tự), và chỉ gộp về khi mọi điều kiện hoàn thành đều xanh.',
              ),
            },
            {
              kind: 'code',
              lang: 'powershell',
              body: `git switch -c a01-first-contact
# ... task 1 -> commit ... task 6 -> commit ...
git switch main
git merge --no-ff a01-first-contact`,
            },
          ],
        },
      ],
      accept: [
        bi('git log --oneline shows exactly one commit', 'Lệnh git log --oneline hiện đúng một commit'),
        bi('git status does not list .venv', 'Lệnh git status không liệt kê .venv'),
      ],
    },

    {
      id: 'a00-t3',
      num: 3,
      title: bi('Choose the data home', 'Chọn nhà cho dữ liệu'),
      goal: bi('Data and spill space on a fast local non-synced drive.', 'Dữ liệu và chỗ tràn nằm trên ổ nội bộ nhanh không đồng bộ đám mây.'),
      steps: [
        {
          title: bi('Pick the volume, then declare it', 'Chọn ổ đĩa, rồi khai báo nó'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Pick a folder on a fast local, non-synced drive with ~80 GB free, e.g. D:\\etl_lab. This volume holds more than the dataset: the lab points all temp and spill space at <DATA_ROOT>\\tmp too.',
                'Chọn một thư mục trên ổ nội bộ nhanh, không đồng bộ đám mây, còn khoảng 80 GB trống, ví dụ D:\\etl_lab. Ổ này chứa nhiều hơn chỉ tập dữ liệu: lab còn trỏ toàn bộ chỗ chứa file tạm và dữ liệu tràn về <DATA_ROOT>\\tmp.',
              ),
            },
            { kind: 'code', lang: 'powershell', body: 'setx ETL_LAB_DATA "D:\\etl_lab"' },
            {
              kind: 'trap',
              body: bi(
                'setx affects FUTURE terminals — close and reopen your terminal (and re-activate the venv) before verifying.',
                'Lệnh setx chỉ ảnh hưởng tới các terminal TƯƠNG LAI — đóng và mở lại terminal (và kích hoạt lại venv) rồi mới kiểm tra.',
              ),
            },
            { kind: 'code', lang: 'powershell', body: 'python lib/labpaths.py' },
            {
              kind: 'expect',
              body: bi(
                'It prints your chosen root with "(from ETL_LAB_DATA)" — not the <repo>/data fallback.',
                'Nó in ra thư mục gốc bạn chọn kèm dòng "(from ETL_LAB_DATA)" — chứ không phải phương án dự phòng <repo>/data.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `repo:       D:\\ETL_SAMPLE
data root:  D:\\etl_lab   (from ETL_LAB_DATA)
  small: D:\\etl_lab\\small
  full : D:\\etl_lab`,
            },
          ],
        },
      ],
      accept: [
        bi('labpaths.py confirms the root came from ETL_LAB_DATA', 'labpaths.py xác nhận thư mục gốc lấy từ ETL_LAB_DATA'),
        bi('The drive has ~80 GB free and is not cloud-synced', 'Ổ đĩa còn khoảng 80 GB trống và không đồng bộ đám mây'),
      ],
    },

    {
      id: 'a00-t4',
      num: 4,
      title: bi('Generate the small dataset', 'Sinh bộ dữ liệu nhỏ'),
      goal: bi('45 files, ~800 MB, in seconds.', '45 file, khoảng 800 MB, trong vài giây.'),
      steps: [
        {
          title: bi('Generate and read the output', 'Sinh dữ liệu và đọc kết quả in ra'),
          blocks: [
            { kind: 'code', lang: 'powershell', body: 'python datagen/generate.py --scale small --month 1' },
            {
              kind: 'text',
              body: bi(
                'Watch the output: one line per day with row counts and sizes. Note two days are much bigger than the rest — 2026-06-19 and 2026-07-11, flash sales; they will matter a lot later — and weekends are smaller.',
                'Theo dõi phần in ra: mỗi ngày một dòng kèm số dòng và dung lượng. Chú ý hai ngày lớn hơn hẳn phần còn lại — 2026-06-19 và 2026-07-11, các ngày khuyến mãi chớp nhoáng; chúng sẽ rất quan trọng về sau — và các ngày cuối tuần thì nhỏ hơn.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Note --month 1. There is a month 2. Do not generate it, do not read about it. It arrives when the course says it arrives (A10).',
                'Chú ý tham số --month 1. Có một tháng hai. Đừng sinh nó, đừng đọc về nó. Nó sẽ về khi khoá học nói nó về, tức là ở A10.',
              ),
            },
          ],
        },
      ],
      accept: [bi('45 files under <DATA_ROOT>\\small\\raw\\orders\\, ~800 MB total', '45 file trong <DATA_ROOT>\\small\\raw\\orders\\, tổng khoảng 800 MB')],
    },

    {
      id: 'a00-t5',
      num: 5,
      title: bi('Generate the full dataset', 'Sinh bộ dữ liệu đầy đủ'),
      goal: bi('~16 GB of CSV for month 1, plus the dimension files.', 'Khoảng 16 GB CSV cho tháng một, cộng các file dimension.'),
      steps: [
        {
          title: bi('Start it and go make coffee', 'Khởi động rồi đi pha cà phê'),
          blocks: [
            { kind: 'code', lang: 'powershell', body: 'python datagen/generate.py --scale full --month 1' },
            {
              kind: 'text',
              body: bi(
                'It takes roughly 10–20 minutes and peaks at several GB of RAM with the default 4 workers. Close the RAM-hungry apps first. Waiting for data is an authentic part of the job.',
                'Nó mất khoảng 10 tới 20 phút và đỉnh điểm chiếm vài GB RAM với 4 process mặc định. Đóng các ứng dụng ngốn RAM trước đã. Ngồi chờ dữ liệu là một phần chân thật của nghề này.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'While it runs, open Task Manager → Performance and watch CPU and disk. This is your first resource observation — by A13 this will be a reflex.',
                'Trong lúc nó chạy, mở Task Manager, tab Performance, và quan sát CPU cùng ổ đĩa. Đây là lần quan sát tài nguyên đầu tiên của bạn — tới A13 việc này sẽ thành phản xạ.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                '45 files under <DATA_ROOT>\\raw\\orders\\, ~16 GB total, plus customers.csv (~110 MB), products.csv, stores.csv under raw\\dims\\.',
                '45 file trong <DATA_ROOT>\\raw\\orders\\, tổng khoảng 16 GB, cộng thêm customers.csv (khoảng 110 MB), products.csv và stores.csv trong raw\\dims\\.',
              ),
            },
          ],
        },
      ],
      accept: [bi('45 full-scale files plus the three dimension files exist', 'Có 45 file ở scale full cộng ba file dimension')],
    },

    {
      id: 'a00-t6',
      num: 6,
      title: bi('Verify — never assume', 'Kiểm chứng — không bao giờ giả định'),
      goal: bi('Every check PASS on both scales.', 'Mọi phép kiểm tra đều PASS ở cả hai quy mô.'),
      steps: [
        {
          title: bi('Run the selftest twice', 'Chạy selftest hai lần'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: 'python datagen/selftest.py --scale small\npython datagen/selftest.py --scale full',
            },
            {
              kind: 'why',
              body: bi(
                'If anything fails: delete the offending file and regenerate — determinism makes this safe — then re-run. Skipping the selftest is expensive: half of the later assignments quote exact numbers that assume a verified dataset.',
                'Nếu có gì đó hỏng: xoá file có vấn đề rồi sinh lại — tính tất định khiến việc này an toàn — rồi chạy lại. Bỏ qua selftest sẽ trả giá đắt: một nửa số bài sau trích dẫn những con số chính xác vốn giả định tập dữ liệu đã được kiểm chứng.',
              ),
            },
          ],
        },
      ],
      accept: [bi('Every check PASS on both scales', 'Mọi phép kiểm tra đều PASS ở cả hai quy mô')],
    },

    {
      id: 'a00-t7',
      num: 7,
      title: bi('Look at the data (without opening Excel)', 'Nhìn vào dữ liệu (mà không mở Excel)'),
      goal: bi('Meet the ten columns, the embedded JSON, the manifest, and the contract.', 'Làm quen với mười cột, phần JSON nhúng bên trong, manifest, và data contract.'),
      steps: [
        {
          title: bi('Stream a peek instead', 'Xem lướt theo kiểu streaming'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'Excel would try to load 1.2M rows into memory and truncate at 1,048,576 rows — never inspect big CSVs with spreadsheet apps.',
                'Excel sẽ cố nạp 1,2 triệu dòng vào bộ nhớ rồi cắt cụt ở dòng thứ 1.048.576 — đừng bao giờ soi file CSV lớn bằng ứng dụng bảng tính.',
              ),
            },
            {
              kind: 'code',
              lang: 'powershell',
              body: 'Get-Content "$env:ETL_LAB_DATA\\raw\\orders\\orders_2026-06-02.csv" -TotalCount 5',
            },
            {
              kind: 'code',
              lang: 'text',
              body: `order_id, customer_id, store_id, order_ts, updated_at,
status, payment_method, order_total, items, meta`,
            },
            { kind: 'text', body: bi('Read the five lines. Really read them.', 'Đọc năm dòng đó. Đọc thật sự, đừng lướt.') },
          ],
        },
        {
          title: bi('How is JSON escaped inside CSV?', 'JSON được escape thế nào bên trong CSV?'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'Before RFC 4180 there was no CSV standard — every program did its own thing. RFC 4180 wrote down the common rules; it is about six pages. "Double-quote escaping" is not a proper name, just a description of rule 7 in it: a quote character is escaped by doubling it. Two things happen together — the whole field is wrapped in quotes, so the JSON\'s commas are not read as column separators; and every quote inside the JSON is doubled, so the parser knows it is content, not the field\'s closing quote.',
                'Trước khi có RFC 4180, CSV không hề có chuẩn — mỗi phần mềm làm một kiểu. RFC 4180 viết ra luật chung; nó rất ngắn, khoảng sáu trang. "Double-quote escaping" không phải một tên riêng, chỉ là mô tả của quy tắc số 7 trong đó: dấu nháy kép được escape bằng cách nhân đôi nó lên. Hai việc xảy ra cùng lúc — cả trường được bọc trong dấu nháy, nên các dấu phẩy của JSON không bị hiểu là dấu chia cột; và mỗi dấu nháy bên trong JSON được nhân đôi, nên trình phân tích biết đó là nội dung chứ không phải dấu đóng trường.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `JSON thật:  [{"sku":"SKU-031482","qty":3}]
Trong CSV:  "[{""sku"":""SKU-031482"",""qty"":3}]"`,
            },
            {
              kind: 'text',
              body: bi(
                'A standard CSV parser restores "" back to " when reading, so no manual unescaping is needed.',
                'Một trình phân tích CSV chuẩn tự hoàn nguyên "" thành " khi đọc, nên không cần tự tay unescape.',
              ),
            },
          ],
        },
        {
          title: bi('Open the matching manifest', 'Mở manifest tương ứng'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: 'Get-Content "$env:ETL_LAB_DATA\\raw\\manifest\\orders_2026-06-02.json"',
            },
            {
              kind: 'code',
              lang: 'json',
              body: `{
 "file": "orders_2026-06-02.csv",
 "date": "2026-06-02",
 "era": "v1",
 "scale": "full",
 "rows": 1180490,
 "late_rows": 17707,
 "dup_rows": 590,
 "corrupt_rows": 0,
 "bytes": 359260066,
 "min_order_ts": "2026-06-01 00:00:00",
 "max_order_ts": "2026-06-02 23:59:59",
 "generator_version": "1.0"
}`,
            },
            {
              kind: 'why',
              body: bi(
                'Read min_order_ts closely: the file is named 2026-06-02, but its earliest order happened on 06-01. The manifest is telling you, on day one, that file date does not equal every row\'s order date. That single line is the seed of A02, A08, and most of the hard problems in this lab.',
                'Đọc kỹ trường min_order_ts: file tên là 2026-06-02, nhưng đơn hàng sớm nhất trong đó xảy ra ngày 06-01. Ngay từ ngày đầu, manifest đã nói với bạn rằng ngày của file không bằng ngày đặt hàng của mọi dòng. Đúng một dòng đó là hạt giống của A02, A08, và phần lớn những bài toán khó trong lab này.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Then skim contracts/shopcore_orders_daily.contract.yaml — the promises this file makes. You will hold shopcore to them from A05 on.',
                'Sau đó lướt qua contracts/shopcore_orders_daily.contract.yaml — những lời hứa mà file này đưa ra. Từ A05 trở đi bạn sẽ bắt shopcore giữ lời.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('You can name the 10 columns from memory', 'Bạn đọc thuộc mười tên cột'),
        bi('You can explain how JSON is escaped inside a CSV field', 'Bạn giải thích được JSON được escape thế nào bên trong một ô CSV'),
        bi('You have read the manifest and skimmed the contract', 'Bạn đã đọc manifest và lướt qua data contract'),
      ],
    },

    {
      id: 'a00-t8',
      num: 8,
      title: bi('Start your journal', 'Lập journal'),
      goal: bi('A file that becomes your baseline in A12–A14.', 'Một file sẽ trở thành mốc chuẩn của bạn ở A12 tới A14.'),
      steps: [
        {
          title: bi('Create journal.md in the repo root', 'Tạo journal.md ở gốc repo'),
          blocks: [
            {
              kind: 'code',
              lang: 'markdown',
              body: `# Lab journal
## A00 — <today's date>
- full generation wall-clock: ___ min, workers: 4
- total raw size: ___ GB (orders) + ___ MB (dims)
- one thing that surprised me: ___`,
            },
            {
              kind: 'why',
              body: bi(
                'You will add timings and observations to this file in every assignment. In A12–A14 your own journal numbers become the baseline you optimize against.',
                'Bạn sẽ thêm số đo thời gian và các quan sát vào file này ở mọi bài. Tới A12 và A14, chính những con số trong journal của bạn trở thành mốc chuẩn để bạn tối ưu dựa vào đó.',
              ),
            },
          ],
        },
      ],
      accept: [bi('journal.md exists with your first entries', 'File journal.md tồn tại với các mục ghi đầu tiên')],
    },

    {
      id: 'a00-verify',
      title: bi('Verify yourself', 'Tự kiểm chứng'),
      goal: bi('Four commands that prove the whole setup.', 'Bốn câu lệnh chứng minh toàn bộ phần dựng môi trường.'),
      steps: [
        {
          title: bi('Git, file counts, manifest', 'Git, số file, manifest'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `# the repo is a git repo on main with your first commit
git log --oneline      # -> 5a1ce3e A00: environment up   (your sha will differ)
git branch             # -> * main

# file count must be 45 at each scale
(Get-ChildItem "$env:ETL_LAB_DATA\\raw\\orders\\*.csv").Count
(Get-ChildItem "$env:ETL_LAB_DATA\\small\\raw\\orders\\*.csv").Count

# manifests promise exact row counts — pick any day and remember this trick
Get-Content "$env:ETL_LAB_DATA\\raw\\manifest\\orders_2026-06-10.json"`,
            },
          ],
        },
      ],
      accept: [
        bi('venv active, requirements installed (incl. pytest), duckdb ≥ 1.4', 'venv đang bật, đã cài requirements kể cả pytest, duckdb từ 1.4 trở lên'),
        bi('git repo on main; identity and core.editor configured; first commit exists', 'Repo git trên nhánh main; đã cấu hình danh tính và core.editor; có commit đầu tiên'),
        bi('ETL_LAB_DATA set to a local non-synced drive, confirmed by labpaths.py', 'ETL_LAB_DATA trỏ tới ổ nội bộ không đồng bộ, được labpaths.py xác nhận'),
        bi('small + full month-1 data generated (45 files each) with dims', 'Đã sinh dữ liệu tháng một ở cả small và full, mỗi bên 45 file, kèm các dimension'),
        bi('selftest.py fully green on both scales', 'selftest.py xanh hoàn toàn ở cả hai quy mô'),
        bi('You can state from memory the 10 columns of a month-1 orders file', 'Bạn đọc thuộc mười cột của file đơn hàng tháng một'),
        bi('journal.md created with your first entries', 'Đã tạo journal.md với các mục ghi đầu tiên'),
      ],
    },

    {
      id: 'a00-mistakes',
      title: bi('Common beginner mistakes', 'Lỗi thường gặp của người mới'),
      goal: bi('Six ways to lose an afternoon.', 'Sáu cách để mất toi một buổi chiều.'),
      steps: [
        {
          title: bi('The six', 'Sáu lỗi'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'Putting ETL_LAB_DATA inside OneDrive/Documents anyway ("it\'s just this once"). Your sync client will spend the whole course fighting you.',
                'Vẫn cứ đặt ETL_LAB_DATA vào trong OneDrive hoặc Documents ("chỉ lần này thôi mà"). Trình đồng bộ của bạn sẽ dành cả khoá học để chống lại bạn.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Running setx and staying in the same terminal — the variable is not there. New terminal.',
                'Chạy setx rồi ngồi lại chính terminal đó — biến không có ở đấy. Phải mở terminal mới.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Skipping the git config identity lines — your first commit stops with "Please tell me who you are". Set them, then commit again.',
                'Bỏ qua hai dòng git config khai danh tính — commit đầu tiên sẽ dừng lại với thông báo "Please tell me who you are". Đặt chúng rồi commit lại.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Double-clicking a 350 MB CSV. Windows will try to open it in Excel or Notepad; both end badly. Peek with Get-Content -TotalCount.',
                'Nháy đúp vào một file CSV 350 MB. Windows sẽ cố mở nó bằng Excel hoặc Notepad; cả hai đều kết thúc tồi tệ. Hãy xem lướt bằng Get-Content -TotalCount.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Skipping the selftest. Half of the later assignments quote exact numbers that assume a verified dataset.',
                'Bỏ qua selftest. Một nửa số bài sau trích dẫn những con số chính xác vốn giả định tập dữ liệu đã được kiểm chứng.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Generating month 2 "to be ready". You will rob yourself of A10\'s main lesson.',
                'Sinh tháng hai "cho sẵn sàng". Bạn sẽ tự cướp mất bài học chính của A10.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Đọc qua một lượt trước khi bắt đầu Task 3')],
    },

    {
      id: 'a00-stretch',
      title: bi('Stretch goals', 'Bài mở rộng'),
      goal: bi('Two optional peeks ahead.', 'Hai bài tự chọn để ngó trước.'),
      steps: [
        {
          title: bi('Read the generator constants', 'Đọc các hằng số của generator'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Read datagen/profiles.py — just the constants at the top. This file is shopcore\'s side of the data contract you will work with in A06. Its constants are the ground truth that contracts/shopcore_orders_daily.contract.yaml writes down as promises.',
                'Đọc file datagen/profiles.py — chỉ phần hằng số ở đầu thôi. File này là phía shopcore của bản data contract mà bạn sẽ làm việc cùng ở A06. Các hằng số trong đó chính là nguồn tham chiếu chuẩn mà file contracts/shopcore_orders_daily.contract.yaml viết ra dưới dạng lời hứa.',
              ),
            },
          ],
        },
        {
          title: bi('Time 1 worker against 4', 'Đo thời gian 1 process so với 4'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Time generate.py --scale small --month 1 --force with --workers 1 vs --workers 4 and note the speedup — a preview of A12.',
                'Đo thời gian chạy generate.py --scale small --month 1 --force với --workers 1 rồi với --workers 4, và ghi lại mức tăng tốc — xem trước một chút của A12.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Hoàn thành ít nhất một mục')],
    },
  ],
}
