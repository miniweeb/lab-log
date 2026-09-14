import type { AssignmentSpec } from '../types'
import { bi, vi } from '../types'
import { a10Terms, a10Theory } from './a10.theory'

export const a10: AssignmentSpec = {
  id: 'a10',
  code: 'A10',
  title: bi('Schema evolution: month 2 arrives', 'Schema thay đổi: tháng 2 về'),
  summary: bi(
    'Three schema versions land in one feed. Detect the drift, classify how dangerous each change is, and fold all three eras into one canonical schema the rest of your pipeline never has to think about.',
    'Ba phiên bản schema cùng nằm trong một feed. Bạn sẽ phát hiện chỗ thay đổi, xếp loại xem từng thay đổi nguy hiểm tới đâu, rồi gộp cả ba era về một canonical schema mà phần còn lại của pipeline không bao giờ phải bận tâm tới.',
  ),
  estHours: 4,
  difficulty: 3,
  outcome: bi(
    'You can spot a schema change in a feed, say out loud which changes will crash and which will load garbage silently, map several eras into one canonical schema without inventing data, and defend your key design against both the raw producer key and a true surrogate key.',
    'Sau bài này bạn phát hiện được một thay đổi schema trong feed, nói ra được thay đổi nào sẽ làm chết chương trình và thay đổi nào sẽ lặng lẽ nạp vào dữ liệu sai, ánh xạ được nhiều era về một canonical schema mà không bịa thêm dữ liệu, và bảo vệ được thiết kế khoá của mình trước cả cách dùng thẳng khoá của nguồn lẫn cách dùng surrogate key thật.',
  ),
  theory: a10Theory,
  terms: a10Terms,
  tasks: [
    /* ═══════════════ T0 — SETUP ═══════════════ */
    {
      id: 'a10-t0',
      title: bi('Setup', 'Chuẩn bị'),
      goal: bi(
        'Disk space, scale discipline, and knowing what today will not fix.',
        'Dung lượng đĩa, kỷ luật về scale, và biết trước hôm nay sẽ không sửa cái gì.',
      ),
      steps: [
        {
          title: bi('Scope and scale', 'Phạm vi và scale'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Data: month 2 on top of month 1, so 69 files spanning 2026-06-01 → 2026-08-08 across three eras. Develop every step on small. Only Task 7 switches to full.',
                'Dữ liệu của bài này là tháng 2 chồng lên tháng 1, tức 69 file trải từ 2026-06-01 tới 2026-08-08, đi qua ba era. Mọi bước đều làm ở scale small trước, chỉ tới Task 7 mới chuyển sang full.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Full-scale month 2 needs roughly 8–9 GB more raw CSV plus a few GB of Parquet. Check free disk BEFORE you start the generator — running out halfway leaves you with a partial file set and no error that says so.',
                'Tháng 2 ở scale full cần thêm chừng 8 tới 9 GB CSV thô, cộng thêm vài GB Parquet nữa. Hãy kiểm dung lượng còn trống TRƯỚC khi chạy generator, vì hết đĩa giữa chừng sẽ để lại một bộ file dở dang mà không có lỗi nào nói cho bạn biết điều đó.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'You need on hand: journal.md, your work/ scripts from A02, A07 and A09, the contract gate from A06, and the idempotent per-day loader from A07.',
                'Cần chuẩn bị sẵn trong tầm tay: file journal.md, các script trong thư mục work/ từ A02, A07 và A09, contract gate từ A06, và cái loader theo ngày có tính idempotent từ A07.',
              ),
            },
          ],
        },
        {
          title: bi('Connection', 'Kết nối'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `import duckdb
from lib.labpaths import data_root

ROOT = data_root("small")                      # chỉ đổi sang "full" ở Task 7
con = duckdb.connect(str(ROOT / "warehouse" / "warehouse.duckdb"))
con.execute(f"SET memory_limit='8GB'; SET threads=8; "
            f"SET temp_directory='{(ROOT / 'tmp').as_posix()}';")`,
            },
            {
              kind: 'why',
              body: bi(
                'One process on the warehouse at a time. DuckDB allows a single writer, and Task 1 has you running a generator in a second terminal — that one writes CSV files, not the database, so it is safe. A stray notebook holding the warehouse open is not.',
                'Mỗi lúc chỉ nên có một tiến trình mở warehouse, vì DuckDB chỉ cho phép một writer. Task 1 có bảo bạn chạy generator ở một terminal thứ hai, nhưng cái đó ghi ra file CSV chứ không ghi vào database nên không sao. Còn một cái notebook bỏ quên đang giữ warehouse thì lại có sao.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Venv active, warehouse opens, free disk checked against the 8–9 GB estimate',
          'Venv đã kích hoạt, warehouse mở được, và đã kiểm dung lượng trống so với mức ước tính 8 tới 9 GB',
        ),
      ],
    },

    /* ═══════════════ T1 ═══════════════ */
    {
      id: 'a10-t1',
      num: 1,
      title: bi('Generate month 2', 'Sinh dữ liệu tháng 2'),
      goal: bi(
        'The upstream team ships v2 and v3 the moment you run this.',
        'Đội bên nguồn phát hành v2 và v3 ngay khi bạn chạy lệnh này.',
      ),
      steps: [
        {
          title: bi('Small first, full in a second terminal', 'Small trước, full chạy ở terminal thứ hai'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `python datagen/generate.py --scale small --month 2

# ở terminal THỨ HAI, khởi động bản lớn ngay để kịp cho Task 7:
python datagen/generate.py --scale full --month 2     # khoảng 5–10 phút`,
            },
            {
              kind: 'why',
              body: bi(
                'Start the full generator now, not at Task 7. It runs for 5–10 minutes and does not touch the warehouse, so it costs you nothing to have it finish in the background while you work on small.',
                'Hãy khởi động generator bản full ngay bây giờ chứ đừng đợi tới Task 7. Nó chạy mất 5 tới 10 phút và không đụng gì tới warehouse, nên cứ để nó chạy nền trong lúc bạn làm ở scale small thì chẳng mất gì cả.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'small/raw/orders/ holds 69 files, 2026-06-01 through 2026-08-08, and small/raw/manifest/ holds 69 JSON files. Count them before moving on.',
                'Thư mục small/raw/orders/ phải có 69 file, từ 2026-06-01 tới 2026-08-08, và small/raw/manifest/ cũng có 69 file JSON. Đếm lại cho chắc rồi hãy đi tiếp.',
              ),
            },
            {
              kind: 'code',
              lang: 'powershell',
              body: `(Get-ChildItem "$env:ETL_LAB_DATA\\small\\raw\\orders").Count    # 69`,
            },
          ],
        },
        {
          title: bi('The era census, straight from the manifests', 'Thống kê era, lấy thẳng từ manifest'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT era, count(*) AS files, sum(rows) AS rows
FROM read_json_auto('<DATA_ROOT>/small/raw/manifest/orders_*.json')
GROUP BY era ORDER BY era;`,
            },
            {
              kind: 'expect',
              body: bi(
                'Small scale, exact — the generator is deterministic: v1 has 45 files and 2,773,566 rows; v2 has 16 files and 907,584 rows; v3 has 8 files and 435,690 rows.',
                'Ở scale small thì con số phải khớp chính xác, vì generator là deterministic: v1 có 45 file và 2.773.566 dòng, v2 có 16 file và 907.584 dòng, v3 có 8 file và 435.690 dòng.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          '69 raw files and 69 manifests at small scale; full-scale generation started',
          'Có 69 file thô và 69 manifest ở scale small, và bản full đã bắt đầu sinh',
        ),
        bi(
          'Era census matches 45 / 16 / 8 files',
          'Thống kê era ra đúng 45 / 16 / 8 file',
        ),
      ],
    },

    /* ═══════════════ T2 ═══════════════ */
    {
      id: 'a10-t2',
      num: 2,
      title: bi('Break your loader on purpose', 'Cố ý làm chết loader của mình'),
      goal: bi(
        'See what schema drift actually looks like from inside a running pipeline.',
        'Xem một thay đổi schema thật ra trông như thế nào khi nhìn từ bên trong một pipeline đang chạy.',
      ),
      steps: [
        {
          title: bi('Point the A07 loader at the new eras', 'Chĩa loader của A07 vào các era mới'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `load_day("2026-07-16")     # loader cũ, khai schema 10 cột của v1
load_day("2026-08-01")`,
            },
            {
              kind: 'text',
              body: bi(
                'Both fail. Paste the exact error text into your journal — both of them, verbatim, not summarised.',
                'Cả hai lệnh đều chết. Hãy dán nguyên văn thông báo lỗi vào journal, cả hai cái, đúng từng chữ chứ đừng tóm tắt lại.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'DuckDB says it could not automatically detect the CSV parsing dialect. Nothing about three new columns. You gave read_csv 10 columns, the file has 13, and the sniffer gives up with an error that sounds like a delimiter problem. When drift surfaces, it usually surfaces as a confusing error rather than an honest one.',
                'DuckDB báo rằng nó không tự dò được cách parse CSV, không một chữ nào nhắc tới ba cột mới. Chuyện là bạn đưa cho read_csv 10 cột trong khi file có 13, nên bộ sniffer bó tay rồi ném ra một thông báo nghe như lỗi dấu phân cách. Khi drift lộ ra, nó thường lộ ra dưới dạng một lỗi khó hiểu chứ không phải một lỗi thành thật.',
              ),
            },
          ],
        },
        {
          title: bi('Now run the A06 gate on the same file', 'Giờ chạy gate của A06 lên đúng file đó'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Run your contract gate against orders_2026-07-16.csv and read its report next to the DuckDB error. The gate names the actual problem: unexpected columns, and which ones.',
                'Chạy contract gate lên file orders_2026-07-16.csv, rồi đọc báo cáo của nó đặt cạnh thông báo lỗi của DuckDB. Gate gọi đúng tên vấn đề: có cột lạ, và là những cột nào.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'This is the whole argument for contracts, in two lines of output. One tool tells you it is confused; the other tells you what changed. The difference is not intelligence — it is that you wrote down what you expected, so something could compare against it.',
                'Toàn bộ lý do contract tồn tại nằm gọn trong hai dòng output này. Một công cụ nói với bạn rằng nó đang bối rối, công cụ kia nói cho bạn biết cái gì đã thay đổi. Khác biệt không nằm ở chỗ cái nào thông minh hơn, mà ở chỗ bạn đã ghi ra thứ mình mong đợi, nên mới có cái để đem đi so.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Journal has both error texts verbatim, plus one sentence on why the raw error is misleading and the gate\'s is not',
          'Journal có nguyên văn cả hai thông báo lỗi, kèm một câu giải thích vì sao lỗi gốc gây hiểu nhầm còn thông báo của gate thì không',
        ),
      ],
    },

    /* ═══════════════ T3 ═══════════════ */
    {
      id: 'a10-t3',
      num: 3,
      title: bi('Map and classify the drift', 'Vẽ bản đồ và xếp loại các thay đổi'),
      goal: bi(
        'Find when the schema changed, then say how dangerous each change is.',
        'Tìm ra schema đổi vào lúc nào, rồi nói được từng thay đổi nguy hiểm tới đâu.',
      ),
      steps: [
        {
          title: bi('Group the files by header line', 'Gom file theo dòng header'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `from pathlib import Path
sigs = {}
for f in sorted((ROOT / "raw" / "orders").glob("orders_*.csv")):
    header = open(f, encoding="utf-8").readline().strip()
    sigs.setdefault(header, []).append(f.stem[-10:])
for h, dates in sigs.items():
    print(f"{len(dates):3d} files  {dates[0]} .. {dates[-1]}\\n     {h[:100]}")`,
            },
            {
              kind: 'why',
              body: bi(
                'Compare header lines, not sniffed types. Sniffed types wobble file to file for reasons unrelated to schema — a day where a column happens to contain no NULLs reads differently from a day where it does. The header string is one line, costs nothing to read, and only changes when the producer changes it.',
                'Hãy so dòng header chứ đừng so kiểu do sniffer đoán ra. Kiểu đoán ra dao động giữa file này với file kia vì những lý do chẳng liên quan gì tới schema, chẳng hạn một ngày mà cột nào đó tình cờ không có NULL sẽ đọc ra khác với ngày có NULL. Còn chuỗi header thì chỉ là một dòng, đọc chẳng tốn gì, và chỉ đổi khi bên cung cấp thật sự đổi nó.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Exactly 3 headers: 45 files, then 16, then 8. Boundaries land between 07-15 and 07-16, and between 07-31 and 08-01.',
                'Kết quả phải ra đúng 3 header: 45 file, rồi 16, rồi 8. Ranh giới nằm giữa 07-15 và 07-16, và giữa 07-31 và 08-01.',
              ),
            },
          ],
        },
        {
          title: bi('Watch union_by_name paper over the problem', 'Xem union_by_name che vấn đề đi như thế nào'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT * FROM read_csv(
  ['<DATA_ROOT>/small/raw/orders/orders_2026-06-02.csv',
   '<DATA_ROOT>/small/raw/orders/orders_2026-07-16.csv',
   '<DATA_ROOT>/small/raw/orders/orders_2026-08-01.csv'],
  union_by_name=true, filename=true);`,
            },
            {
              kind: 'text',
              body: bi(
                'Run DESCRIBE on that and write down three observations. First: order_id came out VARCHAR — the v3 strings forced a promotion, so your BIGINT history will not join it. Second: payment_method AND payment_type both exist, each NULL for the other era\'s files. Third: v1 rows show NULL for currency and the rest — automatic NULL padding. Count it per file with count(currency) grouped by filename.',
                'Chạy DESCRIBE lên câu đó rồi ghi lại ba quan sát. Thứ nhất, order_id ra kiểu VARCHAR, vì mấy chuỗi của v3 đã buộc nó phải đổi, và thế là phần lịch sử kiểu BIGINT không join được với nó. Thứ hai, cả payment_method lẫn payment_type đều tồn tại, mỗi cột rỗng ở phần file của era kia. Thứ ba, các dòng của v1 hiện NULL ở currency và mấy cột còn lại, đó là phần độn NULL tự động. Muốn đếm theo từng file thì dùng count(currency) rồi gom nhóm theo filename.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'union_by_name cannot know payment_method and payment_type are the same column. It handles additive changes and hides renames — and it reports success either way. Use it to explore, never as a load path.',
                'union_by_name không có cách nào biết payment_method và payment_type vốn là cùng một cột. Nó xử lý được các thay đổi kiểu thêm cột nhưng lại giấu mất phép đổi tên, mà kiểu nào thì nó cũng báo thành công. Hãy dùng nó để thăm dò, đừng bao giờ dùng nó làm đường nạp dữ liệu.',
              ),
            },
          ],
        },
        {
          title: bi('Fill in the classification table', 'Điền bảng xếp loại'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Six rows, one per change. For each: what class is it (additive, rename, type change, nested add, reorder), does it fail loud or silent, and why. The six are: the three appended v2 columns; payment_method → payment_type; order_id BIGINT → VARCHAR; items gains disc; loyalty_tier added; v3 column order changed.',
                'Bảng gồm sáu dòng, mỗi thay đổi một dòng. Với từng cái, hãy ghi nó thuộc loại nào (thêm cột, đổi tên, đổi kiểu, thêm field bên trong kiểu lồng, đổi thứ tự), nó hỏng có báo hay hỏng im lặng, và vì sao. Sáu cái đó gồm: ba cột thêm vào ở v2; payment_method đổi thành payment_type; order_id từ BIGINT sang VARCHAR; items có thêm field disc; thêm cột loyalty_tier; và thứ tự cột của v3 thay đổi.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Two of these are only loud because YOUR loader pins 10 columns. A loader written with union_by_name would take the v2 additions in silence. The loudness of a change is a property of your reader as much as of the change — say that in your table.',
                'Hai trong số này chỉ hỏng có báo vì loader CỦA BẠN ghim cứng 10 cột. Một loader viết bằng union_by_name sẽ nuốt mấy cột thêm của v2 trong im lặng. Nghĩa là chuyện một thay đổi có ồn ào hay không là thuộc tính của reader chứ không chỉ của bản thân thay đổi, và bạn nên viết điều đó vào bảng.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'The column reorder is silent for any positional reader — and that is exactly what you are about to write in Task 5. Mark it now so you remember to be careful there.',
                'Việc đổi thứ tự cột là kiểu hỏng im lặng đối với mọi reader đọc theo vị trí, mà đó đúng là thứ bạn sắp viết ở Task 5. Hãy đánh dấu nó lại ngay bây giờ để nhớ mà cẩn thận khi tới đó.',
              ),
            },
          ],
        },
        {
          title: bi('This is also a process failure', 'Đây cũng là một sự cố về quy trình'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Open contracts/shopcore_orders_daily.contract.yaml and read the change_management block. A rename or a type change is a MAJOR change requiring 30 days\' notice in #shopcore-data-changes, a semver MAJOR bump, and a migration note. Even the v2 additions needed 7 days. shopcore shipped both eras and sent a cheery email afterwards.',
                'Mở file contracts/shopcore_orders_daily.contract.yaml và đọc khối change_management. Theo đó, một phép đổi tên hay đổi kiểu là thay đổi mức MAJOR, đòi phải báo trước 30 ngày ở kênh #shopcore-data-changes, tăng số MAJOR theo semver, và kèm một ghi chú về cách chuyển đổi. Ngay cả mấy cột thêm vào ở v2 cũng cần báo trước 7 ngày. Vậy mà shopcore phát hành cả hai era rồi mới gửi một cái mail vui vẻ sau đó.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Add one line to your incident write-up citing change_management.notice_breaking. That citation is what turns "the data broke" into a producer incident with an owner and a clause behind it. Without it you are a consumer complaining; with it you are a consumer holding a signed document.',
                'Hãy thêm một dòng vào phần ghi chép sự cố, trích dẫn change_management.notice_breaking. Chính cái trích dẫn đó biến câu nói dữ liệu hỏng thành một sự cố phía nhà cung cấp, có người chịu trách nhiệm và có điều khoản đứng sau. Không có nó thì bạn chỉ là một bên tiêu thụ đang than phiền; có nó thì bạn là một bên tiêu thụ đang cầm văn bản đã ký.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Header script prints 45 / 16 / 8 with the right boundary dates',
          'Script đọc header in ra 45 / 16 / 8 với đúng các ngày ranh giới',
        ),
        bi(
          'Classification table has all six rows filled, each with class, loudness and reason',
          'Bảng xếp loại đủ sáu dòng, mỗi dòng có loại thay đổi, mức ồn ào và lý do',
        ),
        bi(
          'Journal cites the violated change-management clause',
          'Journal có trích dẫn điều khoản change-management bị vi phạm',
        ),
      ],
    },

    /* ═══════════════ T4 ═══════════════ */
    {
      id: 'a10-t4',
      num: 4,
      title: bi('Define the canonical schema', 'Định nghĩa canonical schema'),
      goal: bi(
        'A design step with no data: decide the one shape everything will be mapped into.',
        'Một bước thiết kế không đụng tới dữ liệu: quyết định hình dạng duy nhất mà mọi thứ sẽ được ánh xạ vào.',
      ),
      steps: [
        {
          title: bi('The target shape', 'Hình dạng đích'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Copy the schema table from the assignment into your journal and write one line of justification next to every decision. The columns that matter most: order_id VARCHAR built as \'ORD-\' plus 10 digits; order_id_num BIGINT; payment_method taken from payment_type for v3; currency defaulting to \'USD\' for v1; discount_amount defaulting to 0 for v1; channel and loyalty_tier NULL where unknown; items cast into STRUCT(sku VARCHAR, qty INTEGER, unit_price DOUBLE, disc DOUBLE)[].',
                'Chép bảng schema trong đề vào journal, rồi viết một dòng biện minh bên cạnh mỗi quyết định. Những cột quan trọng nhất gồm: order_id kiểu VARCHAR dựng theo dạng \'ORD-\' cộng 10 chữ số; order_id_num kiểu BIGINT; payment_method lấy từ payment_type với era v3; currency mặc định là \'USD\' cho v1; discount_amount mặc định là 0 cho v1; channel và loyalty_tier để NULL ở chỗ không biết; và items được cast vào STRUCT(sku VARCHAR, qty INTEGER, unit_price DOUBLE, disc DOUBLE)[].',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Known value becomes a default, unknown value becomes NULL. Every v1 order really was in USD, so \'USD\' is a fact. v1 had no discounts at all, so 0 is a fact. Nobody recorded the channel in v1, so any value you choose is invented data. Write which of the two each default is, in words, next to it.',
                'Giá trị đã biết thì thành giá trị mặc định, giá trị không biết thì thành NULL. Mọi đơn hàng thời v1 đều thực sự tính bằng USD nên \'USD\' là một sự thật. Thời v1 cũng hoàn toàn không có giảm giá nên số 0 cũng là một sự thật. Còn channel thì thời v1 không ai ghi lại, nên bạn chọn giá trị nào cũng là bịa ra dữ liệu. Hãy viết bằng chữ, ngay bên cạnh mỗi giá trị mặc định, rằng nó thuộc loại nào trong hai loại đó.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'The side effect is the point: once v1 rows carry discount_amount = 0, the new v2 rule order_total ≈ items_total − discount_amount is true for all three eras. One formula for all history.',
                'Cái tác dụng phụ mới chính là điểm mấu chốt: khi các dòng của v1 đã mang discount_amount bằng 0, quy tắc mới của v2 là order_total xấp xỉ tổng tiền items trừ discount_amount trở nên đúng trên cả ba era. Một công thức duy nhất cho toàn bộ lịch sử.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Setting discount_amount = NULL for v1 instead of 0 breaks the unified formula, because NULL propagates through the subtraction and every v1 row silently drops out of the check. Setting channel = \'web\' invents data. Both mistakes look tidy in the schema table.',
                'Nếu bạn đặt discount_amount thành NULL cho v1 thay vì 0 thì công thức chung sẽ hỏng, vì NULL lan qua phép trừ và mọi dòng của v1 lặng lẽ rơi ra ngoài phép kiểm. Còn đặt channel bằng \'web\' thì là bịa dữ liệu. Cả hai lỗi này nhìn trong bảng schema đều rất gọn gàng.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Casting v1 items JSON into the struct with disc simply yields disc = NULL for every v1 row. A nested column backfilled for free, with no extra code.',
                'Cast JSON items của v1 vào struct đã có sẵn field disc thì disc ra NULL ở mọi dòng của v1. Một cột nằm bên trong kiểu lồng được điền sẵn mà không tốn thêm dòng code nào.',
              ),
            },
          ],
        },
        {
          title: bi('Name what you just decided', 'Gọi tên thứ bạn vừa quyết'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'order_id is a natural key — a key that arrives with the data, minted by the producer. Open the contract and read order_id\'s comment: shopcore calls it a surrogate key, surrogate for shopcore. From where you sit it is inherited, which is why A03 called it natural: meaningful, free, and outside your control. You have just watched a natural key change type underneath you.',
                'Cột order_id là một natural key, tức là khoá đi kèm theo dữ liệu và do bên cung cấp sinh ra. Hãy mở contract và đọc phần chú thích của order_id: shopcore gọi nó là surrogate key, nhưng là surrogate đối với shopcore. Còn từ chỗ bạn ngồi thì nó là khoá thừa hưởng, và đó là lý do A03 gọi nó là natural: có ý nghĩa, không tốn gì, và nằm ngoài tầm kiểm soát của bạn. Bạn vừa chứng kiến một natural key đổi kiểu ngay dưới chân mình.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'The order_id VARCHAR plus order_id_num BIGINT pair is not a patch. It is a warehouse-controlled canonical key: shopcore still supplies the meaning, which order this is, while your warehouse owns the format. Three rungs on that ladder, and your journal paragraph must argue all three.',
                'Cặp order_id kiểu VARCHAR cộng order_id_num kiểu BIGINT không phải một bản vá chắp víu. Nó là một canonical key do warehouse kiểm soát: shopcore vẫn cung cấp ý nghĩa, tức là đây là đơn hàng nào, còn warehouse của bạn nắm phần định dạng. Cái thang này có ba bậc, và đoạn văn bạn viết trong journal phải bảo vệ được cả ba.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                '(a) Use the producer\'s key raw: no code, and every join reads exactly like the source. It just broke on two counts — the type changed, and the late corrections stopped matching history. Task 6 measures that: 0 out of 705.',
                'Bậc (a) là dùng thẳng khoá của bên cung cấp: không phải viết code, và mọi phép join đọc lên y hệt như bên nguồn. Nó vừa hỏng vì hai lẽ, một là kiểu dữ liệu đã đổi, hai là các bản sửa về trễ không còn khớp với lịch sử. Task 6 sẽ đo đúng chuyện đó, kết quả là 0 trên 705.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                '(b) Canonicalize it — what you are doing here. One deterministic expression per era. The format is yours, the meaning stays shopcore\'s, joins against BIGINT history keep working because you kept order_id_num, and it is cheap: no extra state, no lookup, and any engineer can re-derive the key by eye.',
                'Bậc (b) là canonicalize nó, đúng thứ bạn đang làm ở đây. Mỗi era một biểu thức deterministic. Định dạng là của bạn, ý nghĩa vẫn là của shopcore, join với phần lịch sử kiểu BIGINT vẫn chạy vì bạn đã giữ lại order_id_num, và cách này rẻ: không phải giữ thêm trạng thái, không phải tra cứu, và bất kỳ kỹ sư nào cũng nhẩm lại được khoá bằng mắt.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                '(c) A true surrogate key: the warehouse mints its own id — a sequence, or a hash of the natural key — and keeps the natural key as an ordinary attribute. shopcore can rename, retype or re-prefix the id and your core.orders key never moves.',
                'Bậc (c) là dùng một surrogate key thật: warehouse tự sinh ra id của riêng mình, có thể là một dãy số hoặc một giá trị băm của natural key, rồi giữ natural key như một thuộc tính thường. Khi đó shopcore có đổi tên, đổi kiểu hay đổi tiền tố của id thì khoá trong core.orders của bạn vẫn đứng yên.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'The costs of (c) are real: a key lookup on every load — given this order, what is its surrogate — and late rows mean that lookup hits history, not just today\'s batch. Plus one more hop every time you debug against the source, because your id exists nowhere in shopcore\'s system. And note what it does not buy: the lookup still has to match \'ORD-0000000123\' to 123, so the canonicalization does not disappear, it moves inside the key assignment.',
                'Cái giá của bậc (c) là có thật: mỗi lần nạp đều phải tra khoá, kiểu như đơn này thì surrogate của nó là gì, mà vì có dòng về trễ nên phép tra đó phải với cả vào lịch sử chứ không chỉ lô hôm nay. Chưa kể mỗi lần bạn dò lỗi ngược về nguồn lại dài thêm một chặng, bởi id của bạn không tồn tại ở bất cứ đâu trong hệ thống shopcore. Và để ý thứ nó không mua được cho bạn: phép tra vẫn phải khớp \'ORD-0000000123\' với 123, nên phần canonicalize không biến mất, nó chỉ chuyển vào bên trong bước gán khoá.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Which rung is right depends on one thing: how much you trust the producer\'s key to stay put. Most teams pick (b) and are fine; teams burned twice pick (c). Today you have evidence rather than an opinion — write it down while it is fresh.',
                'Chọn bậc nào thì phụ thuộc vào đúng một điều: bạn tin khoá của bên cung cấp sẽ đứng yên tới mức nào. Phần lớn các đội chọn bậc (b) và không gặp vấn đề gì; đội nào bị đau hai lần thì chọn bậc (c). Hôm nay bạn có bằng chứng trong tay chứ không phải chỉ có quan điểm, nên hãy viết ra khi nó còn nóng.',
              ),
            },
            {
              kind: 'text',
              body: vi(
                'Đây là lúc nên đọc guides/data_modeling.md mục 3 về Keys, vì phần đó trình bày đúng cái thang này, đặt nó cạnh composite key và degenerate dimension, và lấy chính bài này làm ví dụ.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Every default has a written "known value" or "unknown" justification',
          'Mỗi giá trị mặc định đều có phần biện minh viết rõ là đã biết hay không biết',
        ),
        bi(
          'Journal has one paragraph naming the key as a warehouse-controlled canonical key and arguing it against (a) and (c), citing the Task 3 drift as evidence',
          'Journal có một đoạn gọi tên khoá là canonical key do warehouse kiểm soát, và bảo vệ nó trước bậc (a) và bậc (c), lấy phần drift ở Task 3 làm bằng chứng',
        ),
      ],
    },

    /* ═══════════════ T5 ═══════════════ */
    {
      id: 'a10-t5',
      num: 5,
      title: bi('Per-era readers and aligners', 'Reader và aligner cho từng era'),
      goal: bi(
        'Three eras in, one identical 15-column shape out.',
        'Ba era đi vào, một hình dạng 15 cột giống hệt nhau đi ra.',
      ),
      steps: [
        {
          title: bi('Two layers, kept separate on purpose', 'Hai lớp, cố ý tách rời'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'An aligner per era does schema work only — rename, ids, missing columns — and outputs the same 15 raw-ish columns for every era. Then ONE shared canonicalizer does the value cleaning from A03. If you merged them, every cleaning rule would exist in three copies, and the third copy is the one you forget to fix.',
                'Mỗi era có một aligner, và aligner chỉ lo phần schema: đổi tên, dựng id, thêm cột còn thiếu, rồi trả ra đúng 15 cột thô giống nhau cho mọi era. Sau đó đúng một canonicalizer dùng chung sẽ làm phần làm sạch giá trị của A03. Nếu gộp hai lớp lại thì mỗi quy tắc làm sạch sẽ tồn tại ba bản, mà bản thứ ba chính là bản bạn quên sửa.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `# work/a10_canonical.py
from datetime import date

def era_of(d: date) -> str:
    if d <= date(2026, 7, 15): return "v1"
    if d <= date(2026, 7, 31): return "v2"
    return "v3"

V1_COLS = {'order_id':'BIGINT','customer_id':'BIGINT','store_id':'INTEGER',
           'order_ts':'VARCHAR','updated_at':'TIMESTAMP','status':'VARCHAR',
           'payment_method':'VARCHAR','order_total':'VARCHAR',
           'items':'VARCHAR','meta':'VARCHAR'}
V2_COLS = dict(V1_COLS, **{'currency':'VARCHAR',
                           'discount_amount':'DECIMAL(14,2)','channel':'VARCHAR'})
V3_COLS = { ... }   # BẠN viết cái này — đọc cảnh báo bên dưới trước đã`,
            },
            {
              kind: 'trap',
              body: bi(
                'columns= maps by POSITION, not by name. The header row is only skipped, not matched. v3 moved currency, discount_amount, channel and loyalty_tier ahead of items and meta. List v3 columns in the v2 order and DuckDB will happily load the string \'USD\' into your items column — every column is VARCHAR-ish, so no error is raised. This is the silent misload from your Task 3 table.',
                'Tham số columns= ánh xạ theo VỊ TRÍ chứ không theo tên, còn dòng header thì chỉ bị bỏ qua chứ không được đem ra khớp. Bản v3 đã đẩy currency, discount_amount, channel và loyalty_tier lên trước items và meta. Nếu bạn khai cột của v3 theo thứ tự của v2 thì DuckDB sẽ vui vẻ nạp chuỗi \'USD\' vào cột items, vì mọi cột đều thuộc dạng VARCHAR nên không lỗi nào được ném ra. Đây chính là kiểu nạp sai im lặng trong bảng bạn điền ở Task 3. Vậy nên hãy dựng V3_COLS từ chính header bạn đã in ra ở Task 3, theo đúng thứ tự trong file, rồi kiểm tay hai giá trị: items phải vẫn giống JSON, currency phải vẫn giống một mã tiền tệ.',
              ),
            },
          ],
        },
        {
          title: bi('The aligners', 'Các aligner'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `ALIGN = {
"v1": """SELECT
    printf('ORD-%010d', order_id) AS order_id,
    order_id                      AS order_id_num,
    customer_id, store_id, order_ts, updated_at, status,
    payment_method, order_total,
    'USD'                    AS currency,
    CAST(0 AS DECIMAL(14,2)) AS discount_amount,
    CAST(NULL AS VARCHAR)    AS channel,
    CAST(NULL AS VARCHAR)    AS loyalty_tier,
    items, meta
  FROM src""",
"v2": """ ... """,          # BẠN: currency/discount/channel thật, loyalty_tier NULL
"v3": """SELECT
    order_id,
    CAST(replace(order_id, 'ORD-', '') AS BIGINT) AS order_id_num,
    customer_id, store_id, order_ts, updated_at, status,
    payment_type AS payment_method,
    order_total, currency, discount_amount, channel, loyalty_tier,
    items, meta
  FROM src""",
}`,
            },
            {
              kind: 'text',
              body: bi(
                'v1 is given. v3 is given because it holds the two new tricks — the rename mapped back to the canonical name, and the id pair built by stripping the prefix. You write v2: start from v1, exactly three lines change, because the three backfilled defaults become pass-through columns.',
                'Aligner của v1 đã cho sẵn. Của v3 cũng cho sẵn vì nó chứa hai chiêu mới: phép đổi tên được ánh xạ ngược về tên canonical, và cặp id dựng bằng cách cắt bỏ tiền tố. Phần bạn viết là v2: khởi đi từ v1, và đúng ba dòng thay đổi, vì ba giá trị mặc định điền thêm giờ trở thành cột lấy thẳng từ file.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Note the direction of the rename: payment_type AS payment_method, not the other way round. The canonical name is the one your 45 v1 files, your marts and your contract already use. Renaming history to match the newest era means editing everything downstream — the whole point is that downstream never moves.',
                'Để ý chiều của phép đổi tên: payment_type AS payment_method chứ không phải ngược lại. Tên canonical là cái tên mà 45 file của v1, các mart và contract của bạn đang dùng. Đổi tên phần lịch sử cho khớp với era mới nhất thì đồng nghĩa với việc phải sửa mọi thứ phía sau, mà cả điểm của bài này là phía sau không phải nhúc nhích gì.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `def open_day(con, day: str, era: str, raw_dir):
    f = (raw_dir / f"orders_{day}.csv").as_posix()
    cols = {"v1": V1_COLS, "v2": V2_COLS, "v3": V3_COLS}[era]
    con.execute(f"CREATE OR REPLACE VIEW src AS "
                f"SELECT * FROM read_csv('{f}', header=true, columns={cols})")
    con.execute(f"CREATE OR REPLACE VIEW aligned AS {ALIGN[era]}")`,
            },
            {
              kind: 'expect',
              body: bi(
                'For one day per era — say 06-02, 07-16 and 08-01 — DESCRIBE SELECT * FROM aligned returns the identical 15 columns in the identical order. Not similar. Identical, including order.',
                'Với một ngày cho mỗi era, chẳng hạn 06-02, 07-16 và 08-01, câu DESCRIBE SELECT * FROM aligned phải trả về đúng 15 cột giống hệt nhau và theo cùng một thứ tự. Không phải gần giống, mà là giống hệt, kể cả thứ tự.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'DESCRIBE on aligned gives the identical 15 columns in identical order for all three eras',
          'Chạy DESCRIBE lên view aligned cho ra đúng 15 cột giống hệt và cùng thứ tự ở cả ba era',
        ),
        bi(
          'A v3 spot check shows order_id_num as a plain number and real values in items',
          'Kiểm tay một dòng của v3 cho thấy order_id_num là số thường và items có giá trị thật',
        ),
      ],
    },

    /* ═══════════════ T6 ═══════════════ */
    {
      id: 'a10-t6',
      num: 6,
      title: bi('One canonical staging, and the proof it works', 'Một staging canonical, và bằng chứng nó chạy đúng'),
      goal: bi(
        'Land one day per era, then prove three things about the result.',
        'Nạp một ngày cho mỗi era, rồi chứng minh ba điều về kết quả.',
      ),
      steps: [
        {
          title: bi('The shared canonicalizer', 'Canonicalizer dùng chung'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `TS = ("try_strptime(order_ts, ['%Y-%m-%d %H:%M:%S',"
      "'%d/%m/%Y %H:%M:%S','%Y-%m-%dT%H:%M:%S'])")
CANON = f"""
SELECT
  order_id, order_id_num, customer_id, store_id,
  {TS} AS order_ts, updated_at, status, payment_method,
  TRY_CAST(NULLIF(
    CASE WHEN order_total LIKE '%,%'
         THEN replace(replace(order_total, '.', ''), ',', '.')
         ELSE replace(TRIM(order_total), '$', '') END,
    'N/A') AS DECIMAL(14,2)) AS order_total,
  currency, discount_amount, channel, loyalty_tier,
  TRY_CAST(CAST(items AS JSON) AS
    STRUCT(sku VARCHAR, qty INTEGER, unit_price DOUBLE, disc DOUBLE)[]) AS items,
  meta,
  CAST({TS} AS DATE) AS order_date
FROM aligned
WHERE {TS} IS NOT NULL
"""`,
            },
            {
              kind: 'text',
              body: bi(
                'These are your A03 cleaners, unchanged, applied once and era-blind. The WHERE drops rows whose timestamp cannot be parsed at all — roughly 0.02% of rows, the impossible dates. They have no order_date, so they cannot be partitioned.',
                'Đây chính là các cleaner của A03, không sửa gì cả, được áp một lần và không biết gì về era. Mệnh đề WHERE loại đi những dòng có timestamp không cách nào parse được, chừng 0,02% số dòng, mấy cái ngày bất khả thi. Chúng không có order_date nên cũng không partition được.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Count the dropped rows on every single run: SELECT count(*) FROM aligned WHERE {TS} IS NULL. A dropped row you did not count is a lie in your row math, and the identity check in Task 7 will not close without that number. If your A05 quarantine is wired into the loader, route them there instead of dropping them.',
                'Nhớ đếm số dòng bị loại ở mọi lần chạy, bằng câu SELECT count(*) FROM aligned WHERE {TS} IS NULL. Một dòng bị loại mà không đếm là một chỗ nói dối trong phép cộng số dòng, và phép kiểm ở Task 7 sẽ không khớp nếu thiếu con số đó. Nếu quarantine của A05 đã nối vào loader rồi thì hãy đẩy chúng sang đó thay vì bỏ đi.',
              ),
            },
          ],
        },
        {
          title: bi('Land the day, with exactly two lineage columns', 'Nạp một ngày, kèm đúng hai cột lineage'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `con.execute(f"""CREATE OR REPLACE TABLE staging.shopcore_orders_canon AS
  SELECT *, DATE '{day}'         AS _data_date,   -- dòng này đến từ lần giao nào
            CAST(NULL AS BIGINT) AS _run_id       -- sống dậy khi A11 có runner đăng ký run
  FROM ({CANON})""")`,
            },
            {
              kind: 'why',
              body: bi(
                'Two, and that is the whole list. The file name, the load time and the status are facts about the RUN, not about the order — they live on the ops.etl_runs row that _run_id points at. Eighteen columns out: the sixteen canonical ones from Task 4, plus the pair.',
                'Chỉ hai cột, và đó là toàn bộ danh sách. Tên file, thời điểm nạp và trạng thái là những sự thật về LẦN CHẠY chứ không phải về đơn hàng, nên chúng nằm ở dòng trong bảng ops.etl_runs mà _run_id trỏ tới. Tổng cộng ra mười tám cột: mười sáu cột canonical từ Task 4 cộng thêm cặp này.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'CANON is era-blind AND delivery-blind on purpose: it never learns which file it is reading. The day you handed open_day is what stamps _data_date.',
                'CANON cố ý vừa không biết gì về era vừa không biết gì về lần giao: nó không bao giờ biết mình đang đọc file nào. Cái ngày mà bạn truyền vào open_day mới là thứ đóng dấu lên _data_date.',
              ),
            },
          ],
        },
        {
          title: bi('Check 1 — counts', 'Kiểm 1 — số dòng'),
          blocks: [
            {
              kind: 'expect',
              body: bi(
                'kept + dropped must equal the manifest rows field exactly, for each day. Small scale: 06-02 → 59,024 · 07-16 → 59,613 · 08-01 → 47,008.',
                'Số dòng giữ lại cộng số dòng bị loại phải bằng đúng trường rows trong manifest, với từng ngày một. Ở scale small: ngày 06-02 ra 59.024, ngày 07-16 ra 59.613, ngày 08-01 ra 47.008.',
              ),
            },
          ],
        },
        {
          title: bi('Check 2 — one reconciliation rule for all eras', 'Kiểm 2 — một quy tắc đối soát cho mọi era'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT count(*) FILTER (abs(order_total - (items_sum - discount_amount)) <= 0.01) AS ok,
       count(*) AS total
FROM (SELECT order_total, discount_amount,
             (SELECT sum(i.qty * i.unit_price) FROM unnest(items) AS t(i)) AS items_sum
      FROM staging.shopcore_orders_canon
      WHERE order_total IS NOT NULL AND items IS NOT NULL);`,
            },
            {
              kind: 'expect',
              body: bi(
                'Roughly 99.4% ok on every era. The remaining ~0.5% is the mismatch dirt from A05, nothing more. Run it for all three days.',
                'Kết quả phải đạt chừng 99,4% ở mỗi era. Phần còn lại khoảng 0,5% chính là loại dữ liệu lệch mà bạn đã gặp ở A05, không có gì khác. Hãy chạy cho cả ba ngày.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'The v1 days pass a rule written for the v2 era only because you set discount_amount = 0 instead of NULL. That is the Task 4 decision paying off, and it is worth stopping to notice — one formula now covers 69 days across three schemas.',
                'Mấy ngày của v1 vượt qua được một quy tắc vốn viết cho era v2, và sở dĩ được vậy chỉ vì bạn đặt discount_amount bằng 0 chứ không phải NULL. Đó là quyết định ở Task 4 đang sinh lời, và đáng để dừng lại một chút mà nhìn: bây giờ một công thức duy nhất phủ được 69 ngày qua ba schema.',
              ),
            },
          ],
        },
        {
          title: bi('Check 3 — the correction join', 'Kiểm 3 — phép join bản sửa'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'The 08-01 file carries about 705 late corrections — its manifest\'s late_rows — to orders that live in the late-July files as BIGINT ids. Prove that raw ids never match and canonical ids all do.',
                'File ngày 08-01 mang theo chừng 705 bản sửa về trễ, chính là trường late_rows trong manifest của nó, dành cho những đơn hàng nằm ở các file cuối tháng 7 dưới dạng id kiểu BIGINT. Việc của bạn là chứng minh rằng id thô không khớp cái nào, còn id đã canonical thì khớp hết.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `-- hist  = order_id_num từ canonical staging của 07-25..07-31
-- v3day = file thô 08-01 đọc bằng V3_COLS
SELECT count(*) FROM v3day v JOIN hist h
  ON v.order_id = CAST(h.order_id_num AS VARCHAR);          -- naive:      0
SELECT count(DISTINCT v.order_id) FROM v3day v JOIN hist h
  ON CAST(replace(v.order_id,'ORD-','') AS BIGINT) = h.order_id_num;  -- canonical: 705`,
            },
            {
              kind: 'expect',
              body: bi(
                'Exactly 0 and exactly 705 at small scale. Not "close to" — the generator is deterministic and 705 is the late_rows value in orders_2026-08-01.json. At full scale expect that manifest\'s late_rows instead.',
                'Ở scale small phải ra đúng 0 và đúng 705, không phải xấp xỉ, vì generator là deterministic và 705 chính là giá trị late_rows trong file orders_2026-08-01.json. Ở scale full thì lấy giá trị late_rows của manifest tương ứng mà đối chiếu.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Zero matched corrections means every one of them would have upserted as a new order in A08\'s MERGE. Same customers, same amounts, counted twice, no error anywhere. This single number is why order_id_num exists.',
                'Không bản sửa nào khớp nghĩa là cả 705 cái sẽ được lệnh MERGE của A08 upsert vào như những đơn hàng mới. Vẫn khách đó, vẫn số tiền đó, nhưng đếm hai lần, và không có lỗi nào ở đâu cả. Đúng một con số này là lý do cột order_id_num tồn tại.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'All three checks pass at small scale, with 0 and 705 exactly',
          'Cả ba phép kiểm đều đạt ở scale small, với đúng 0 và đúng 705',
        ),
        bi(
          'DESCRIBE staging.shopcore_orders_canon ends in exactly _data_date DATE and _run_id BIGINT',
          'Chạy DESCRIBE staging.shopcore_orders_canon thì hai cột cuối đúng là _data_date DATE và _run_id BIGINT',
        ),
      ],
    },

    /* ═══════════════ T7 ═══════════════ */
    {
      id: 'a10-t7',
      num: 7,
      title: bi('Rebuild the whole lake in canonical schema', 'Dựng lại toàn bộ lake theo canonical schema'),
      goal: bi(
        'Make history and future look the same, then swap readers over.',
        'Làm cho lịch sử và tương lai trông giống nhau, rồi chuyển người đọc sang.',
      ),
      steps: [
        {
          title: bi('The plan', 'Kế hoạch'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Migrate month 1 from your existing lake Parquet — no need to re-parse 45 CSVs, migrating stored data is its own skill. Load month-2 days from raw CSV. Everything goes into a NEW versioned directory, then you swap the reader over. That is the A09 pattern, pattern 3.',
                'Tháng 1 thì chuyển từ chính Parquet trong lake hiện có, không cần parse lại 45 file CSV, vì chuyển dữ liệu đã lưu là một kỹ năng riêng. Các ngày của tháng 2 thì nạp từ CSV thô. Tất cả đi vào một thư mục MỚI có đánh version, rồi bạn chuyển người đọc sang. Đó chính là khuôn thứ ba của A09.',
              ),
            },
          ],
        },
        {
          title: bi('(a) Migrate month 1', '(a) Chuyển tháng 1'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'DESCRIBE your current lake first. It should be v1-shaped plus order_date — which means it IS a v1 source, so reuse the machinery you already have.',
                'Trước hết hãy chạy DESCRIBE lên lake hiện tại. Nó phải mang hình dạng của v1 cộng thêm order_date, nghĩa là bản thân nó cũng là một nguồn v1, nên cứ tái dùng bộ máy bạn đã có.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `ver = "orders_v=20260814"        # hoặc một timestamp; giữ thư mục cũ tới khi kiểm xong
con.execute(f"""CREATE OR REPLACE VIEW src AS
  SELECT * FROM read_parquet('{(ROOT/'lake'/'orders').as_posix()}/*/*.parquet',
                             hive_partitioning=true)""")
con.execute(f"CREATE OR REPLACE VIEW aligned AS {ALIGN['v1']}")
con.execute(f"""COPY ({CANON}) TO '{(ROOT/'lake'/ver).as_posix()}'
  (FORMAT parquet, PARTITION_BY (order_date), APPEND, ROW_GROUP_SIZE 122880)""")`,
            },
            {
              kind: 'trap',
              body: bi(
                'If your A02 lake already stores a cleaned TIMESTAMP for order_ts, replace the try_strptime with a pass-through. Adapt, do not cargo-cult — running a string parser over a TIMESTAMP column will not do what you want.',
                'Nếu lake từ A02 đã lưu order_ts dưới dạng TIMESTAMP đã làm sạch thì hãy thay try_strptime bằng cách lấy thẳng cột đó. Sửa cho hợp chứ đừng chép nguyên, vì chạy một bộ parse chuỗi lên một cột TIMESTAMP sẽ không cho ra thứ bạn muốn.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'The lake does NOT get the two lineage columns. Parquet under lake/ is re-derivable storage, not a warehouse table, and the month-1 half is a bulk migration of files A02 wrote — their delivery dates are gone. order_date is not a substitute: late rows are exactly the rows whose file date differs. A uniformly lineage-free lake beats one that is stamped on the half you happen to know. The pair lands on core.orders in A11, where each day is loaded under a real run_id.',
                'Lake thì KHÔNG nhận hai cột lineage. Parquet nằm dưới lake/ là kho có thể dựng lại được chứ không phải một bảng trong warehouse, và nửa thuộc tháng 1 là kết quả của một lần chuyển hàng loạt từ những file mà A02 đã ghi, nên ngày giao của chúng không còn nữa. Cột order_date cũng không thay thế được, vì những dòng về trễ chính là những dòng có ngày file khác đi. Một cái lake sạch cột lineage một cách đồng đều vẫn hơn một cái lake chỉ đóng dấu được nửa mà bạn tình cờ biết. Cặp cột đó sẽ về core.orders ở A11, nơi mỗi ngày được nạp dưới một run_id thật.',
              ),
            },
          ],
        },
        {
          title: bi('(b) Load month 2 day by day', '(b) Nạp tháng 2 theo từng ngày'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Loop 2026-07-16 → 2026-08-08: open_day, then COPY (CANON) TO the versioned dir with PARTITION_BY (order_date) and APPEND, logging each day to ops.etl_runs the way A07 taught you. The rows column holds kept; the ledger has no column for dropped, so keep a running dropped total in your script or journal — step (d) needs it.',
                'Lặp từ ngày 2026-07-16 tới 2026-08-08: gọi open_day, rồi COPY (CANON) TO thư mục có version, với PARTITION_BY (order_date) và APPEND, đồng thời ghi log từng ngày vào ops.etl_runs đúng như A07 đã dạy. Cột rows giữ số dòng được giữ lại; ledger không có cột nào cho số dòng bị loại, nên bạn phải tự cộng dồn số đó trong script hoặc trong journal, vì bước (d) sẽ cần tới.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Use APPEND, not OVERWRITE_OR_IGNORE. Each day\'s COPY names its files data_0.parquet from scratch, and late rows make day D write into partitions D−7 through D — the same folders earlier days wrote. With OVERWRITE_OR_IGNORE, day D\'s data_0.parquet silently replaces an earlier file in a shared partition. This was tested so you do not have to: a 4-million-row lake came out at 45 thousand rows, with no error anywhere.',
                'Hãy dùng APPEND, đừng dùng OVERWRITE_OR_IGNORE. Mỗi ngày, lệnh COPY lại đặt tên file từ đầu là data_0.parquet, mà vì có dòng về trễ nên ngày D ghi vào các partition từ D trừ 7 cho tới D, đúng những thư mục mà các ngày trước đã ghi. Với OVERWRITE_OR_IGNORE thì file data_0.parquet của ngày D lặng lẽ thay thế file cũ trong cái partition dùng chung đó. Chuyện này đã được thử sẵn để bạn khỏi phải thử: một cái lake 4 triệu dòng ra còn 45 nghìn dòng, mà không lỗi nào ở đâu cả.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Look inside a boundary partition like order_date=2026-07-14/ afterwards: several Parquet files, one per writer. That is what correct looks like.',
                'Sau đó hãy ngó vào một partition ở vùng ranh giới, chẳng hạn order_date=2026-07-14/: trong đó có vài file Parquet, mỗi writer một file. Đúng thì nó trông như vậy.',
              ),
            },
          ],
        },
        {
          title: bi('(c) One day will refuse to load', '(c) Sẽ có một ngày không chịu nạp'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'orders_2026-07-22.csv fails with another cryptic sniffing error. Do NOT fix it today. Let your try/except record it as failed in ops.etl_runs, journal one line — "07-22 unreadable, deferred" — and move on. Diagnosing and repairing that file is the centerpiece of A11.',
                'File orders_2026-07-22.csv sẽ chết kèm một lỗi sniffing khó hiểu nữa. ĐỪNG sửa nó hôm nay. Cứ để khối try/except ghi nó thành failed trong ops.etl_runs, viết một dòng vào journal kiểu như 07-22 không đọc được, hoãn lại, rồi đi tiếp. Việc chẩn đoán và sửa file đó là trọng tâm của A11.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Its partition folder will exist anyway, because days 07-23 through 07-29 deliver late corrections into 2026-07-22. That is why the lake ends with 69 distinct order_date values while only 68 files loaded.',
                'Thư mục partition của ngày đó dù sao cũng tồn tại, vì các ngày từ 07-23 tới 07-29 đều giao bản sửa về trễ vào đúng ngày 2026-07-22. Đó là lý do lake kết thúc với 69 giá trị order_date khác nhau trong khi chỉ có 68 file được nạp.',
              ),
            },
          ],
        },
        {
          title: bi('(d) Verify, then swap', '(d) Kiểm, rồi chuyển'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'The row math must close before you publish anything to readers.',
                'Phép cộng số dòng phải khớp trước khi bạn công bố bất cứ thứ gì cho người đọc.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT sum(rows) FROM read_json_auto('<DATA_ROOT>/small/raw/manifest/orders_*.json')
WHERE file != 'orders_2026-07-22.csv';                      -- small: 4,058,440

SELECT count(*), count(DISTINCT order_date)
FROM read_parquet('<DATA_ROOT>/small/lake/orders_v=20260814/*/*.parquet',
                  hive_partitioning=true);                  -- small: 4,057,637 · 69`,
            },
            {
              kind: 'expect',
              body: bi(
                'Small scale: 4,057,637 lake rows + 803 dropped = 4,058,440 manifest rows excluding 07-22, and 69 distinct order_date values. The identity must close exactly, not approximately.',
                'Ở scale small: 4.057.637 dòng trong lake cộng 803 dòng bị loại thì bằng 4.058.440 dòng theo manifest sau khi trừ ngày 07-22, và có 69 giá trị order_date khác nhau. Đẳng thức này phải khớp chính xác chứ không phải xấp xỉ.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'If your month-1 lake had already dropped a few unparseable-timestamp rows back in A02, those belong on the dropped side of the identity. The sum must still close — find those rows rather than adjusting the target number.',
                'Nếu lake của tháng 1 đã loại sẵn vài dòng có timestamp không parse được từ hồi A02 thì mấy dòng đó thuộc về vế bị loại trong đẳng thức. Tổng vẫn phải khớp, nên hãy đi tìm mấy dòng đó chứ đừng chỉnh con số đích cho vừa.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `CREATE OR REPLACE VIEW core.lake_orders AS
SELECT * EXCLUDE (orders_v)
FROM read_parquet('<DATA_ROOT>/small/lake/orders_v=20260814/*/*.parquet',
                  hive_partitioning=true);`,
            },
            {
              kind: 'why',
              body: bi(
                'A09\'s cleanup dropped this view, so this is a create rather than a repoint — but it is the same A09 catalog move, atomic for warehouse readers. Then retire the old dir to .trash. And EXCLUDE (orders_v) because the orders_v=… directory name looks like a Hive partition, so hive_partitioning=true invents an orders_v column: harmless, but keep the canonical shape clean.',
                'Bước dọn dẹp của A09 đã xoá mất view này, nên ở đây là tạo mới chứ không phải trỏ lại, nhưng vẫn là đúng thao tác trên catalog của A09 và vẫn atomic đối với người đọc trong warehouse. Sau đó thì đưa thư mục cũ vào .trash. Còn lý do phải EXCLUDE (orders_v) là vì cái tên thư mục orders_v=… trông giống một partition kiểu Hive, nên hive_partitioning=true sẽ tự bịa ra một cột orders_v. Cột đó vô hại, nhưng nên giữ cho hình dạng canonical sạch sẽ.',
              ),
            },
          ],
        },
        {
          title: bi('(e) Full scale', '(e) Chạy ở scale full'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Switch to data_root("full") and rerun (a) through (d). Sequential month-2 loading plus the migration takes roughly 20–45 minutes on the baseline machine. Watch Task Manager while it runs — steady CPU, disk-bound phases — and journal the wall-clock. A12 will make that number embarrassing.',
                'Chuyển sang data_root("full") rồi chạy lại từ (a) tới (d). Việc nạp tháng 2 một cách tuần tự cộng với phần chuyển đổi mất chừng 20 tới 45 phút trên máy chuẩn. Trong lúc nó chạy thì mở Task Manager ra xem: CPU đều đều, có những giai đoạn nghẽn ở đĩa. Nhớ ghi thời gian thực tế vào journal, vì A12 sẽ làm con số đó trở nên đáng xấu hổ.',
              ),
            },
            {
              kind: 'expect',
              body: vi(
                'Hãy chạy lại đúng mấy câu query ở trên với manifest bản full: đẳng thức phải khớp y như vậy, và tổng thì chừng gấp 20 lần scale small. Con số chính xác chỉ có sau khi bạn chạy xong, nên điền vào journal rồi gửi lại đây.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Small-scale identity closes exactly; full-scale identity closes',
          'Đẳng thức ở scale small khớp chính xác, và ở scale full cũng khớp',
        ),
        bi(
          'core.lake_orders serves all 69 dates in one schema',
          'View core.lake_orders phục vụ đủ 69 ngày trong một schema duy nhất',
        ),
        bi(
          '2026-07-22 is recorded as failed, not fixed; old dir retired to .trash',
          'Ngày 2026-07-22 được ghi là failed chứ không sửa, và thư mục cũ đã chuyển vào .trash',
        ),
      ],
    },

    /* ═══════════════ T8 ═══════════════ */
    {
      id: 'a10-t8',
      num: 8,
      title: bi('Update the contract, close the loop', 'Cập nhật contract, khép vòng'),
      goal: bi(
        'Evolve the contract, not just the code.',
        'Cho contract tiến hoá theo, chứ không chỉ sửa code.',
      ),
      steps: [
        {
          title: bi('Two amendments', 'Hai bản sửa đổi'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Your A06 gate still describes v1, so it now correctly rejects two-thirds of the feed. Amend the real file, contracts/shopcore_orders_daily.contract.yaml, currently at 1.3.0 — yes, still: your A06 v1.4.0 stayed proposed and shopcore never countersigned it. Fold its locale clause into the 2.0.0 amendment so it finally ships. Proposals that miss one train catch the next breaking change.',
                'Gate của A06 vẫn đang mô tả v1, nên bây giờ nó từ chối hai phần ba feed một cách hoàn toàn đúng đắn. Hãy sửa đổi trên file thật là contracts/shopcore_orders_daily.contract.yaml, hiện đang ở phiên bản 1.3.0. Đúng vậy, vẫn là 1.3.0, vì bản v1.4.0 bạn soạn ở A06 dừng lại ở trạng thái đề xuất và shopcore chưa bao giờ ký đối. Hãy gộp điều khoản về locale của nó vào bản sửa đổi 2.0.0 để nó cuối cùng cũng được phát hành. Một đề xuất lỡ chuyến này thì bắt chuyến sau, tức là lần thay đổi phá vỡ kế tiếp.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Amendment 2.0.0 covers the v2 era: the three appended columns with their nullability, and the new reconciliation rule order_total = items_total − discount_amount. Amendment 3.0.0 covers v3: the rename, the id type change, loyalty_tier, the items disc field, and the new column order.',
                'Bản sửa đổi 2.0.0 phủ era v2, gồm ba cột thêm vào kèm quy định cột nào được phép NULL, và quy tắc đối soát mới là order_total bằng tổng tiền items trừ discount_amount. Bản sửa đổi 3.0.0 phủ era v3, gồm phép đổi tên, việc đổi kiểu của id, cột loyalty_tier, field disc trong items, và thứ tự cột mới.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'The three v2 columns alone would be a minor bump. Rewriting the meaning of an existing business rule breaks every consumer that reconciles against it — and those consumers do not error, they just start disagreeing. That makes the whole change MAJOR, 1.3.0 → 2.0.0, which is exactly why the 30-day-notice clause applied. v3 is breaking on four counts, so another major bump.',
                'Nếu chỉ có ba cột thêm của v2 thì chỉ đáng tăng số minor. Nhưng việc viết lại ý nghĩa của một quy tắc nghiệp vụ đang có sẽ làm hỏng mọi bên tiêu thụ đang đối soát dựa trên nó, mà mấy bên đó không báo lỗi đâu, họ chỉ bắt đầu ra số khác bạn. Vì vậy cả thay đổi này ở mức MAJOR, từ 1.3.0 lên 2.0.0, và cũng chính vì thế mà điều khoản báo trước 30 ngày được áp dụng. Còn v3 thì phá vỡ ở bốn điểm, nên lại thêm một lần tăng major nữa.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Keep the earlier eras loadable. Each amendment carries its own effective_from, so the gate can hold all three versions of the one contract — by git tag, or three dated copies in scratch — and validate a file against the version in force on its date. An amendment that replaces the old text leaves you unable to check 45 files.',
                'Nhớ giữ cho các era cũ vẫn nạp được. Mỗi bản sửa đổi mang theo mốc effective_from của riêng nó, nhờ vậy gate giữ được cả ba phiên bản của cùng một contract, bằng git tag hoặc bằng ba bản sao có ghi ngày trong thư mục scratch, rồi kiểm mỗi file theo đúng phiên bản đang có hiệu lực vào ngày của file đó. Một bản sửa đổi ghi đè lên nội dung cũ sẽ khiến bạn không còn kiểm được 45 file.',
              ),
            },
          ],
        },
        {
          title: bi('Teach the gate to pick a version', 'Dạy gate chọn đúng phiên bản'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Pick the contract by file date, using the era boundaries. Better: match the header against each contract and report when date and header disagree — that is how you catch a misnamed file instead of validating it against the wrong version.',
                'Cách đơn giản là chọn contract theo ngày của file, dựa vào các ranh giới era. Cách tốt hơn là đem header đi khớp với từng contract, rồi báo lên khi ngày và header bất đồng với nhau. Đó là cách bắt được một file bị đặt sai tên, thay vì đem nó đi kiểm theo nhầm phiên bản.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Then update your A05 check suite: the cross-field check becomes the one canonical formula. It runs on canonical staging, so it needs no era branches at all.',
                'Sau đó cập nhật bộ kiểm của A05: phép kiểm chéo giữa các cột giờ trở thành đúng một công thức canonical. Nó chạy trên staging đã canonical nên không cần nhánh nào theo era cả.',
              ),
            },
          ],
        },
        {
          title: bi('07-22 needs one more gate skill', '07-22 cần thêm một kỹ năng nữa cho gate'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Run your unmodified gate on orders_2026-07-22.csv first and read the report. sniff_csv does not raise on the corrupt file — it degenerates: the broken lines poison dialect detection, the sniffer settles on a delimiter that is not even in the data, and it returns ONE column whose name is the entire 13-column header line.',
                'Trước hết hãy chạy cái gate chưa sửa lên file orders_2026-07-22.csv và đọc báo cáo của nó. Hàm sniff_csv không ném lỗi với file hỏng đó, nó thoái hoá: mấy dòng hỏng làm nhiễu phần dò dialect, sniffer chốt lấy một dấu phân cách thậm chí không hề có trong dữ liệu, rồi trả về ĐÚNG MỘT cột mà tên của cột đó là cả dòng header 13 cột.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Your gate then dutifully reports "missing column(s): all of them" plus one unexpected mega-column — a schema-drift verdict for a file that is not drifted, it is unreadable. Teach the gate the difference: a sniffed schema that collapses to a single column with commas or quotes in its name is a structural failure, and belongs under quality.structural as a producer incident, not under the schema block. Wrapping the gate\'s sample read in try/except is the other half of unreadability detection.',
                'Gate của bạn khi đó sẽ ngoan ngoãn báo là thiếu cột, mà thiếu hết, cộng thêm một cột lạ khổng lồ. Tức là nó kết luận drift schema cho một file không hề drift, nó chỉ là không đọc được. Hãy dạy cho gate biết phân biệt: một schema dò ra mà co lại còn đúng một cột với dấu phẩy hay dấu nháy nằm trong tên thì đó là hỏng về cấu trúc, phải xếp vào quality.structural như một sự cố phía nhà cung cấp chứ không xếp vào khối schema. Nửa còn lại của việc phát hiện file không đọc được là bọc phần đọc thử của gate trong try/except.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Run the gate over all 69 small files: 68 green, and orders_2026-07-22.csv failing as unreadable rather than as a contract violation.',
                'Chạy gate lên cả 69 file ở scale small: 68 file xanh, và orders_2026-07-22.csv trượt vì không đọc được chứ không phải vì vi phạm contract.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Amendments 2.0.0 and 3.0.0 written, each with its own effective_from; the A06 locale clause folded into 2.0.0',
          'Đã viết hai bản sửa đổi 2.0.0 và 3.0.0, mỗi bản có effective_from riêng, và điều khoản locale của A06 đã được gộp vào 2.0.0',
        ),
        bi(
          'Gate green on 68 files; 07-22 flagged unreadable, and the distinction noted in the journal',
          'Gate xanh trên 68 file, riêng 07-22 bị đánh dấu là không đọc được, và sự phân biệt đó đã ghi vào journal',
        ),
      ],
    },

    /* ═══════════════ T9 ═══════════════ */
    {
      id: 'a10-t9',
      num: 9,
      title: bi('Explain it back', 'Nói lại bằng lời của bạn'),
      goal: bi(
        'Three sentences you could say out loud in an incident review.',
        'Ba câu mà bạn nói ra miệng được trong một buổi review sự cố.',
      ),
      steps: [
        {
          title: bi('Three questions', 'Ba câu hỏi'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'One: which changes were breaking, and why. Two: which change was the most dangerous despite not being breaking on paper — the one that never raised an error. Three: what would you ask the upstream team to do differently next time. A version field in the file? Announce before shipping? Both?',
                'Câu một: những thay đổi nào là breaking, và vì sao. Câu hai: thay đổi nào nguy hiểm nhất dù trên giấy tờ nó không phải breaking, tức là cái chưa từng ném ra một lỗi nào. Câu ba: bạn sẽ đề nghị đội bên nguồn làm khác đi thế nào cho lần sau? Thêm một trường version vào file? Báo trước khi phát hành? Hay cả hai?',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Write this while the evidence is still in your terminal. In six months you will remember that something broke; you will not remember that the naive correction join returned 0 out of 705, and that number is the argument.',
                'Hãy viết ngay khi bằng chứng còn nằm trên terminal. Sáu tháng nữa bạn sẽ chỉ nhớ là có cái gì đó hỏng, chứ không nhớ rằng phép join bản sửa theo cách thô trả về 0 trên 705, mà chính con số đó mới là lập luận.',
              ),
            },
          ],
        },
        {
          title: bi('Stretch goals', 'Phần mở rộng'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'The VND bomb: about 1% of v2 and v3 rows are in VND with amounts multiplied by 25,000. Compute daily avg(order_total) for month 2, raw versus normalized (divide VND by 25,000), and chart both series.',
                'Quả bom VND: chừng 1% số dòng của v2 và v3 được tính bằng VND với số tiền nhân lên 25.000 lần. Hãy tính avg(order_total) theo từng ngày cho tháng 2, một bản tính thô và một bản đã quy đổi bằng cách chia VND cho 25.000, rồi vẽ cả hai đường lên biểu đồ.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Small scale, 2026-07-17: the naive average is roughly 30,589 against roughly 124 normalized. A factor of about 246, produced by 1% of the rows.',
                'Ở scale small, ngày 2026-07-17: trung bình tính thô ra chừng 30.589, còn sau khi quy đổi thì chừng 124. Lệch nhau khoảng 246 lần, và chỉ do 1% số dòng gây ra.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Era autodetect: files can arrive misnamed. Make era_of read the header line and match it against the known era headers, using the filename date only as a cross-check that warns on disagreement.',
                'Tự dò era: file có thể về với cái tên bị đặt sai. Hãy sửa hàm era_of để nó đọc dòng header rồi khớp với các header đã biết của từng era, còn ngày trong tên file thì chỉ dùng để đối chiếu và cảnh báo khi hai bên bất đồng.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Cross-era load strategies: re-run the A08 three-strategy comparison on a window spanning 07-29 → 08-03, keyed on order_id_num. All three must still agree — canonical keys are what make dedupe possible across eras.',
                'Chiến lược load xuyên era: chạy lại phép so ba chiến lược của A08 trên cửa sổ từ 07-29 tới 08-03, lấy order_id_num làm khoá. Cả ba vẫn phải khớp nhau, vì chính canonical key mới làm cho việc dedupe qua các era trở nên khả thi.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Journal answers all three questions, each grounded in a number you measured today',
          'Journal trả lời đủ cả ba câu, mỗi câu đều dựa trên một con số bạn đã tự đo hôm nay',
        ),
      ],
    },
  ],
}