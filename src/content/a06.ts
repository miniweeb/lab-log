import type { AssignmentSpec } from '../types'
import { bi, vi } from '../types'
import { a06Terms, a06Theory } from './a06.theory'

export const a06: AssignmentSpec = {
  id: 'a06',
  code: 'A06',
  title: bi('Data contracts', 'Data contract'),
  summary: bi(
    'Read the signed promise, classify your A05 findings as violation or gap, build the pre-flight gate — then close one silence with your own hands.',
    'Đọc bản cam kết đã ký, phân loại kết quả A05 thành violation hay gap, dựng pre-flight gate, rồi tự tay lấp một chỗ chưa quy định.',
  ),
  estHours: 5,
  difficulty: 3,
  outcome: bi(
    'You can read a contract clause by clause, tell a broken promise from a promise never made, build a gate that refuses a file before it is loaded, and draft the amendment that closes a silence for good.',
    'Bạn đọc được contract theo từng điều khoản, phân biệt được cam kết bị phá với thứ chưa ai từng hứa, dựng được gate từ chối file trước khi load, và soạn được amendment lấp hẳn một chỗ trống.',
  ),
  theory: a06Theory,
  terms: a06Terms,
  tasks: [
    {
      id: 'a06-t0',
      title: bi('Setup', 'Chuẩn bị'),
      goal: bi(
        'A branch, the contracts folder, and the A05 warehouse on hand.',
        'Một branch, thư mục contracts, và warehouse từ A05.',
      ),
      steps: [
        {
          title: bi('Branch and preconditions', 'Branch và điều kiện cần'),
          blocks: [
            { kind: 'code', lang: 'powershell', body: 'git switch -c a06-data-contract' },
            {
              kind: 'text',
              body: bi(
                'Venv active — pyyaml and pydantic are both in requirements.txt. The contracts/ folder ships with the repo: the signed contract plus contracts/README.md. warehouse.duckdb from A05 on hand (ops.dq_report, quarantine Parquet), with core.customers from A03 still in it — Task 12 rebuilds that table.',
                'Venv đang bật; pyyaml và pydantic đều có sẵn trong requirements.txt. Thư mục contracts/ đi kèm repo, gồm contract đã ký và file README.md. Cần có warehouse.duckdb từ A05 với bảng ops.dq_report và các file Parquet trong quarantine, và bảng core.customers từ A03 vẫn còn trong đó — Task 12 sẽ dựng lại bảng ấy.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'You NEVER edit the signed contract — amendments are drafted separately and proposed (Tasks 11–12). Not to make a red gate green, not even for a demo.',
                'Tuyệt đối không sửa contract đã ký. Mọi amendment đều soạn riêng rồi đề xuất, ở Task 11 và 12. Không sửa để làm gate đang đỏ chuyển xanh, cũng không sửa để demo.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Scale: develop everything on small, run the final sweep on full. No special memory settings today — the gate samples at most 100,000 rows per file on throwaway in-memory connections; the warehouse is not touched until Task 8.',
                'Scale: làm mọi thứ trên small, chỉ lần quét cuối mới chạy full. Hôm nay không cần thiết lập bộ nhớ gì đặc biệt vì gate chỉ lấy mẫu tối đa 100.000 dòng mỗi file trên các connection in-memory dùng một lần. Warehouse không bị đụng tới cho tới Task 8.',
              ),
            },
          ],
        },
      ],
      accept: [bi('On branch a06-data-contract; contracts/ folder present', 'Đang ở branch a06-data-contract; thư mục contracts/ có mặt')],
    },

    {
      id: 'a06-t1',
      num: 1,
      title: bi('Read the contract like a professional', 'Đọc contract như người làm nghề'),
      goal: bi(
        'Ten questions, each answered with the clause that answers it.',
        'Mười câu hỏi, mỗi câu trả lời kèm điều khoản trả lời cho nó.',
      ),
      steps: [
        {
          title: bi('The per-column interrogation', 'Rà từng cột một'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Open the contract and contracts/README.md side by side. For every column ask: what type is it really, can it be null, can it repeat, what timezone, what currency, and what is NOT written?',
                'Mở contract và file contracts/README.md cạnh nhau. Với mỗi cột, hỏi: nó thật sự là kiểu gì, có được null không, có lặp lại được không, múi giờ nào, tiền tệ nào, và điều gì không được viết ra?',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Two worked examples. (1) What currency is order_total, and who rounds? — USD, single-currency by contract; scale 2, half-up, applied by the PRODUCER. The warehouse never re-rounds. (2) A refund lands. What sign? — Positive. The "negative" lives in status=refunded, not in the number. A naive SUM(order_total) therefore OVERSTATES revenue unless status is considered.',
                'Hai câu làm mẫu. Một, order_total dùng tiền gì và ai làm tròn? USD, contract quy định một loại tiền duy nhất; hai chữ số thập phân, làm tròn nửa lên, và do producer làm. Warehouse không bao giờ làm tròn lại. Hai, một giao dịch hoàn tiền về thì mang dấu gì? Dấu dương. Cái "âm" nằm ở status bằng refunded chứ không nằm trong con số. Nghĩa là một câu SUM(order_total) ngây thơ sẽ thổi phồng doanh thu nếu không xét tới status.',
              ),
            },
          ],
        },
        {
          title: bi('The eight that are yours', 'Tám câu còn lại bạn tự trả lời'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                '3. What timezone is order_ts, who converted it, and who handled DST?\n4. Finance wants store-local reporting. Where does timezone conversion happen — and why does the contract FORBID converting at ingest?\n5. customer_id arrives NULL. Data loss, producer bug, or meaning?\n6. Is order_id unique? In exactly what scope — per file, per day, per real-world order?\n7. Which two columns decide which copy of a re-sent order wins?\n8. How far back may a file for day D reach? So which lake partitions can loading file D touch?\n9. How do you know a delivery is COMPLETE — and what two numbers must you reconcile on every load?\n10. At what time does a missing file stop being your slow morning and become shopcore\'s incident?',
                '3. Cột order_ts ở múi giờ nào, ai đã chuyển đổi nó, và ai lo chuyện giờ mùa hè?\n4. Bên tài chính muốn báo cáo theo giờ địa phương của cửa hàng. Việc chuyển múi giờ diễn ra ở đâu, và vì sao contract cấm chuyển ngay lúc nạp?\n5. Cột customer_id về tới nơi là NULL. Mất dữ liệu, bug của producer, hay đó là một ý nghĩa?\n6. order_id có duy nhất không? Duy nhất trong phạm vi nào: mỗi file, mỗi ngày, hay mỗi đơn hàng ngoài đời?\n7. Hai cột nào quyết định bản nào của một đơn được gửi lại sẽ thắng?\n8. File của ngày D được với ngược về xa tới đâu? Vậy việc load file D có thể chạm vào những partition nào trong lake?\n9. Làm sao biết một lần giao file là đầy đủ, và hai con số nào bạn buộc phải reconcile ở mỗi lần load?\n10. Tới mấy giờ thì một file thiếu thôi là buổi sáng chậm chạp của bạn và trở thành sự cố của shopcore?',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Question 4 is the one worth the rubber duck. The warehouse_policy clause forbids converting at ingest because one raw UTC fact can serve EVERY regional mart; a fact converted at ingest serves exactly one. That is a modeling principle, not a preference.',
                'Câu số 4 là câu đáng đem đi giải thích cho người khác nghe. Điều khoản warehouse_policy cấm chuyển múi giờ lúc nạp, vì một dữ kiện thô ở giờ UTC phục vụ được mọi mart theo vùng, còn một dữ kiện đã chuyển đổi lúc nạp thì chỉ phục vụ được đúng một vùng. Đó là nguyên tắc mô hình hoá, không phải sở thích cá nhân.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'All ten answers in your journal with clause names, and you can explain #4 to a rubber duck without opening the file',
          'Đủ mười câu trả lời trong journal kèm tên điều khoản, và bạn giải thích được câu số 4 cho người khác nghe mà không cần mở file',
        ),
      ],
    },

    {
      id: 'a06-t2',
      num: 2,
      title: bi('Violation or gap? Classify your A05 findings', 'Violation hay gap? Phân loại kết quả của A05'),
      goal: bi(
        'Hold your quarantine against the promise, then write the two artifacts real teams write.',
        'Đặt phần quarantine của bạn cạnh bản cam kết, rồi viết hai văn bản mà các team thật vẫn viết.',
      ),
      steps: [
        {
          title: bi('Summarize by reason', 'Thống kê theo reject_reason'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT reject_reason, count(*) AS rows
FROM read_parquet('<DATA_ROOT>/quarantine/orders/order_date=*/*.parquet')
GROUP BY 1 ORDER BY 2 DESC;`,
            },
            {
              kind: 'text',
              body: bi(
                'For every distinct reject_reason (plus anything notable in ops.dq_report), decide: VIOLATION (a stated clause is broken — name it), GAP (the contract is silent — name the silence), or TOLERATED (the contract explicitly allows it at this rate).',
                'Với mỗi reject_reason khác nhau, cộng thêm những gì đáng chú ý trong ops.dq_report, hãy quyết định nó thuộc loại nào: violation, tức có điều khoản bị phá và bạn phải nêu tên điều khoản đó; gap, tức contract không nói gì và bạn phải nêu rõ chỗ nào không nói; hay tolerated, tức contract cho phép sẵn ở mức tỉ lệ đó.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Careful with that last one: the within-file exact re-sends you met in A03/A05 are NOT a violation — duplicates.within_file_exact_resends tolerates up to 0.2% as the price of at-least-once delivery.',
                'Cẩn thận với loại cuối. Những bản gửi lại y hệt trong cùng một file mà bạn gặp ở A03 và A05 không phải violation. Điều khoản duplicates.within_file_exact_resends cho phép tới 0,2%, coi đó là cái giá của cơ chế at-least-once delivery.',
              ),
            },
          ],
        },
        {
          title: bi('The incident note and the gaps list', 'Incident note và danh sách gap'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'work/incident_note.md — addressed to checkout-eng@shopcore.example: every VIOLATION with its measured count for one day and the clause it breaks. Half a page. A producer must be able to act on it without reading your code. This is the weekly report the contract\'s slo_reporting block promises them.',
                'File work/incident_note.md, gửi tới checkout-eng@shopcore.example, tức đầu mối của producer ghi trong contract. Nội dung: từng violation kèm số đo được của một ngày và điều khoản mà nó phá. Nửa trang thôi. Producer phải hành động được dựa vào nó mà không cần đọc code của bạn. Đây chính là báo cáo hằng tuần mà block slo_reporting trong contract đã hứa với họ.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'A gaps list in your journal — input for Task 3. No blame, no counts needed; just "the contract does not say X, and the data does Y".',
                'Một danh sách gap trong journal, làm đầu vào cho Task 3. Không quy tội ai, cũng không cần con số; chỉ cần ghi kiểu "contract không nói gì về X, mà dữ liệu thì lại làm Y".',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Every reject_reason carries one of the three labels', 'Mỗi reject_reason đều mang một trong ba nhãn'),
        bi('The incident note cites a clause per violation', 'Incident note trích dẫn một điều khoản cho mỗi violation'),
        bi('Nothing in it says "please fix" about a gap', 'Trong đó không có chỗ nào nói "làm ơn sửa" về một gap'),
      ],
    },

    {
      id: 'a06-t3',
      num: 3,
      title: bi('The gap hunt', 'Đi tìm những chỗ chưa quy định'),
      goal: bi(
        'Four silences, including the two the author seeded on purpose.',
        'Bốn chỗ trống, gồm cả hai chỗ tác giả cố ý cài sẵn.',
      ),
      steps: [
        {
          title: bi('Find the two seeded NOTEs first', 'Tìm hai dòng NOTE có sẵn trước đã'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'The contract\'s author left two # NOTE comments in the YAML flagging silences on purpose — find them; they are your first two entries and your template for what a "silence" looks like. Then hunt at least FOUR total, drawing on everything the data has done to you since A03.',
                'Tác giả contract đã để lại hai dòng comment # NOTE trong file YAML, cố ý đánh dấu những chỗ chưa quy định. Tìm chúng trước: đó là hai mục đầu tiên của bạn, và là mẫu để bạn biết một "chỗ trống" trông như thế nào. Sau đó tìm cho đủ ít nhất bốn cái, dựa vào tất cả những gì dữ liệu đã gây ra cho bạn từ A03 tới giờ.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `| chỗ contract không nói | nó gây hại thế nào (rác hoặc chỗ mơ hồ cụ thể) | điều khoản sẽ lấp nó |
|---|---|---|`,
            },
            {
              kind: 'why',
              body: bi(
                'A gap is NOT a bug report. The producer owes you nothing here — that is exactly what makes gaps dangerous: nobody is accountable until a clause exists. Your "clause that would close it" column is the seed of Task 11\'s amendment.',
                'Gap không phải một báo cáo lỗi. Ở đây producer không nợ bạn gì cả, và chính điều đó khiến gap nguy hiểm: chưa ai chịu trách nhiệm chừng nào chưa có điều khoản. Cột "điều khoản sẽ lấp nó" chính là hạt giống cho amendment ở Task 11.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Candidates: updated_at timezone/meaning (seeded), items inner types / max array length / optional-key representation (seeded), money transport locale, utm null representation, restatement policy, PII and retention for the customers feed. Finding something defensible beyond this list is a feature, not a mistake.',
                'Các ứng viên: múi giờ và ý nghĩa của updated_at (cài sẵn), kiểu bên trong của items cùng độ dài mảng tối đa và cách biểu diễn key tuỳ chọn (cài sẵn), locale khi truyền dữ liệu tiền, cách biểu diễn giá trị rỗng của utm, chính sách công bố lại số liệu, và PII cùng thời hạn lưu trữ cho feed customers. Tìm được thứ gì bảo vệ được ngoài danh sách này là điểm cộng chứ không phải làm sai.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          '≥4 rows, including both seeded # NOTEs, each with a concrete bite you have actually observed in this lab\'s data',
          'Ít nhất 4 dòng, gồm cả hai dòng # NOTE cài sẵn, mỗi dòng kèm một tác hại cụ thể mà bạn đã thật sự thấy trong dữ liệu của lab này',
        ),
      ],
    },

    {
      id: 'a06-t4',
      num: 4,
      title: bi('The pre-flight gate: work/contract_check.py', 'Pre-flight gate: work/contract_check.py'),
      goal: bi(
        'Five layers, stopping early, testing against DECLARED types.',
        'Năm tầng, dừng sớm, và kiểm tra dựa trên kiểu đã khai báo.',
      ),
      steps: [
        {
          title: bi('First, see why declared beats guessed', 'Trước hết: vì sao kiểu khai báo tốt hơn kiểu sniffer đoán'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `import duckdb, os
from pathlib import Path

f = Path(os.environ["ETL_LAB_DATA"]) / "small" / "raw" / "orders" / "orders_2026-06-01.csv"
con = duckdb.connect()
for c in con.execute("SELECT Columns FROM sniff_csv(?)", [str(f)]).fetchone()[0]:
    print(f"{c['name']:16s} {c['type']}")`,
            },
            {
              kind: 'why',
              body: bi(
                'The sniffer calls customer_id a DOUBLE — a fraction of a percent look like "123456.0" (A03\'s Excel-float dirt) and the guess WIDENS to fit the dirt. order_ts comes back VARCHAR. And updated_at comes back TIMESTAMP WITH TIME ZONE — a timezone NOBODY PROMISED (Task 3 material!). Sniffed types drift with whatever dirt lands in the sample; the contract\'s schema block is the fixed point to test against.',
                'Sniffer bảo customer_id là DOUBLE, chỉ vì vài phần trăm nghìn giá trị trông như "123456.0" — đúng thứ rác Excel-float từ A03 — và nó nới kiểu ra cho vừa với rác. Cột order_ts thì trả về VARCHAR. Còn updated_at trả về TIMESTAMP WITH TIME ZONE, một múi giờ mà chẳng ai cam kết, và đây là nguyên liệu cho Task 3. Kiểu do sniffer đoán trôi theo rác lọt vào mẫu; còn block schema trong contract mới là điểm cố định để đối chiếu.',
              ),
            },
          ],
        },
        {
          title: bi('The gate skeleton', 'Khung của gate'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'The contract itself orders this build: change_management.policy says consumer pipelines "must fail loudly (pre-load gate) on undeclared drift rather than load garbage". Checks in order: naming → manifest → schema → sampled probes → late window.',
                'Chính contract yêu cầu bạn dựng cái này: điều khoản change_management.policy nói pipeline của consumer phải fail rõ ràng ở pre-load gate khi có thay đổi chưa khai báo, thay vì load rác vào. Thứ tự kiểm tra: tên file, manifest, schema, dò giá trị trên mẫu, rồi late window.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `def check_file(csv_path: Path, contract: dict) -> list[str]:
    """Return a list of producer-facing problems. Empty list = PASS."""
    problems: list[str] = []
    con = duckdb.connect()                      # in-memory scratch connection

    # ---- 1. delivery: file naming ----
    if not NAMING_RX.match(csv_path.name):
        return [f"file name '{csv_path.name}' does not match delivery.path_pattern"]
    file_date = date.fromisoformat(csv_path.stem.split("_")[1])

    # ---- 2. completeness signal: the manifest ----
    manifest_path = csv_path.parent.parent / "manifest" / (csv_path.stem + ".json")
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        size = csv_path.stat().st_size
        if size != manifest["bytes"]:
            problems.append(f"bytes on disk ({size}) != manifest.bytes "
                            f"({manifest['bytes']}) - truncated delivery?")

    # ---- 3. schema: exact names, exact order ----
    expected = [c["name"] for c in contract["schema"]]
    sniffed = con.execute("SELECT Columns FROM sniff_csv(?)", [str(csv_path)]).fetchone()[0]
    actual = [c["name"] for c in sniffed]
    if actual != expected:
        # ...missing / extra / order changed, each with its own message
        return problems     # value checks are meaningless on the wrong columns`,
            },
          ],
        },
        {
          title: bi('Layer 4 — sampled value probes', 'Tầng 4 — dò giá trị trên mẫu'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `    checks: dict[str, tuple[str, str, float, str]] = {
        "order_id_not_castable": (
            "order_id", "order_id IS NULL OR TRY_CAST(order_id AS BIGINT) IS NULL",
            0.0, "schema.order_id: BIGINT, not nullable - no tolerance declared"),
        "unparseable_order_ts": (
            "order_ts", f"order_ts IS NULL OR {ts_recover} IS NULL",
            tol["unparseable_order_ts"], "quality.row_level_tolerances"),
        "null_or_invalid_status": (
            "status", f"status IS NULL OR status NOT IN ({status_list})",
            tol["null_or_invalid_status"], "schema.status: allowed_values + case"),
        # TODO "customer_id_not_castable": tolerance 0.0 - nhưng nullable: true!
        #      NULL nghĩa là guest checkout, không phải rác: chỉ đếm những giá trị
        #      CÓ mặt mà KHÔNG cast được sang BIGINT.
        # TODO "store_id_not_castable": làm giống order_id nhưng với INTEGER.
        # TODO "unparseable_order_total": dòng xấu = NULL HOẶC không khớp
        #      regexp '^[0-9]+\\.[0-9]{2}$'
    }`,
            },
          ],
        },
        {
          title: bi('Two design notes worth reading twice', 'Hai điểm thiết kế đáng đọc kỹ'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                '"Unparseable" is narrower than "wrongly formatted". Roughly 0.7% of rows break the pinned written format (DD/MM and ISO-T forms) — those are VIOLATIONS you count and report in A05. But the 0.5% hard-fail tolerance is for unparseable_order_ts: rows no known format recovers (the impossible dates, ~0.03%). That is why ts_recover tries the recovery formats before declaring a row lost. A gate that hard-failed on the strict format would be red every single day — and a gate that is always red is a gate nobody reads.',
                '"Không parse được" hẹp hơn "sai format". Khoảng 0,7% số dòng sai cái format đã quy định, tức các dạng DD/MM và ISO-T, và đó là violation mà bạn đếm rồi báo cáo ở A05. Nhưng ngưỡng hard-fail 0,5% là dành riêng cho unparseable_order_ts, tức những dòng mà không format nào biết cách cứu — mấy cái ngày bất khả thi, chỉ chừng 0,03%. Đó là lý do hàm ts_recover thử các format phục hồi trước khi kết luận một dòng là mất. Nếu gate hard-fail ngay khi sai format chặt thì ngày nào nó cũng đỏ, mà gate lúc nào cũng đỏ thì không ai đọc.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'What the gate deliberately SKIPS: orphan_customer_id, orphan_sku_lines and total_vs_items_mismatch need the dimension feeds or per-row JSON math — too heavy for pre-flight. They stay in your A05 post-load suite. The gate covers what one file alone can prove cheaply.',
                'Gate cố ý bỏ qua ba check: orphan_customer_id, orphan_sku_lines và total_vs_items_mismatch. Chúng cần tới dimension feed hoặc phải tính JSON theo từng dòng, quá nặng cho pre-flight. Ba cái đó ở lại trong bộ check sau khi load của A05. Gate chỉ lo phần mà một file đơn lẻ tự chứng minh được với chi phí rẻ.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'main() is yours. It must: accept either explicit file paths or --scale small|full with --start/--end; print one [PASS]/[FAIL] line per file plus its problems (a missing expected file is a FAIL — freshness_sla!); end with "{passed}/{total} files passed contract {contract} v{version}" (both read from the YAML — the gate never hard-codes what it enforces) and sys.exit(1) if anything failed.',
                'Hàm main() là phần của bạn. Nó phải nhận hoặc danh sách đường dẫn file cụ thể, hoặc cờ --scale small hay full kèm --start và --end. Nó in một dòng PASS hoặc FAIL cho mỗi file cùng các vấn đề của file đó — một file đáng lẽ phải có mà thiếu thì tính là FAIL, theo điều khoản freshness_sla. Cuối cùng in dòng tổng kết dạng "{passed}/{total} files passed contract {contract} v{version}", cả tên contract lẫn version đều đọc từ YAML chứ gate không bao giờ ghi cứng thứ mà nó đang enforce, rồi gọi sys.exit(1) nếu có file nào trượt.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'All TODOs filled and one small file passes: [PASS] preceded by one [warn] line about payment_method (~0.3% — the contract\'s silence made visible on every run)',
          'Điền hết các phần TODO và một file small chạy qua được: dòng [PASS] có kèm một dòng [warn] về payment_method khoảng 0,3% — chỗ contract chưa quy định được hiện ra ở mỗi lần chạy',
        ),
      ],
    },

    {
      id: 'a06-t5',
      num: 5,
      title: bi('Validate the contract itself: pydantic', 'Validate chính contract: pydantic'),
      goal: bi('Nothing validates the validator — until now.', 'Chưa có gì validate chính bộ validate — cho tới bây giờ.'),
      steps: [
        {
          title: bi('Two shapes of mistake', 'Hai kiểu sai'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'A MISSPELT KEY: someone drafting v1.4.0 types nullible: true. YAML is delighted — it is a perfectly good mapping key. Nothing reads the document as a whole, so the mistake sits there until some line of code happens to touch that key: a KeyError days later that blames YOUR script and never mentions the contract — or, wherever you wrote .get() or if "x" in c, no error at all, just a rule that quietly stopped existing. A gate with one rule silently switched off is worse than no gate, because you still trust it.',
                'Kiểu thứ nhất là gõ sai tên key: người đang soạn bản 1.4.0 viết nullible thay vì nullable. YAML chấp nhận ngay, vì đó vẫn là mapping key hợp lệ. Không có gì đọc cả tài liệu như một chỉnh thể, nên lỗi cứ nằm im tới khi có dòng code nào tình cờ chạm vào key đó. Lúc ấy bạn nhận một KeyError sau vài ngày, đổ lỗi cho script của bạn và không hề nhắc tới contract. Còn ở chỗ nào bạn viết .get() hay if "x" in c thì chẳng có lỗi nào cả, chỉ là một rule âm thầm ngừng tồn tại. Một gate có rule bị tắt ngầm còn tệ hơn không có gate, vì bạn vẫn đang tin nó.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'A WRONG TYPE: window_days: seven. Nothing complains until the late-corrections arithmetic runs — at file 30 of 45, with a TypeError that names timedelta and never mentions the contract.',
                'Kiểu thứ hai là sai kiểu dữ liệu: window_days ghi là "seven". Chẳng ai kêu gì cho tới khi phép tính late-corrections chạy — ở file thứ 30 trên 45, với một TypeError gọi tên timedelta và không hề nhắc gì tới contract.',
              ),
            },
          ],
        },
        {
          title: bi('work/contract_model.py — four decisions worth arguing with', 'work/contract_model.py — bốn quyết định đáng tranh luận'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `class Clause(BaseModel):
    """Base for every modelled block: an unknown key is an error, not a shrug."""
    model_config = ConfigDict(extra="forbid")


class Money(Clause):
    currency: str
    scale: int
    rounding: str
    negative_allowed: bool          # một chuỗi truthy ở đây sẽ đảo ngược rule


class Column(Clause):
    name: str
    type: str
    nullable: bool                  # bắt buộc: 'nullible:' không thể lọt qua đây
    allowed_values: list[str] | None = None


class Contract(Clause):
    contract: str
    version: str
    status: Literal["draft", "proposed", "agreed", "deprecated"]
    effective_from: date
    columns: list[Column] = Field(alias="schema")   # 'schema' đã bị BaseModel chiếm
    quality: Quality
    # Khai báo nhưng không model hoá: gate không đọc tới chúng
    producer: dict[str, Any]
    consumer: dict[str, Any]
    change_management: dict[str, Any]`,
            },
            {
              kind: 'glossary',
              items: [
                {
                  term: 'extra="forbid"',
                  means: bi(
                    "The whole point. pydantic's default is to IGNORE unrecognised keys. Misspell a REQUIRED key and you would still get an error, but pointed at the wrong field — nullable is missing, and nobody mentions nullible. Misspell an OPTIONAL one and the default swallows it in total silence.",
                    'Đây mới là điểm mấu chốt. Mặc định pydantic bỏ qua key lạ. Gõ sai một key bắt buộc thì vẫn có lỗi, nhưng lỗi chỉ nhầm chỗ: nó nói thiếu nullable, chẳng ai nhắc tới nullible. Còn gõ sai một key tuỳ chọn thì mặc định nuốt luôn, không một tiếng động.',
                  ),
                },
                {
                  term: 'Model what the gate reads',
                  means: bi(
                    'producer, consumer and change_management are prose for humans; no check consults them. They are still DECLARED as dict[str, Any] — because with extra="forbid" at the top level, an undeclared block is an error, and a misspelt block name should be one.',
                    'Các block producer, consumer và change_management là văn xuôi cho người đọc, không check nào tra tới. Nhưng chúng vẫn phải được khai dưới dạng dict[str, Any], vì với extra="forbid" ở mức cao nhất thì một block chưa khai là lỗi — và một tên block gõ sai cũng nên là lỗi.',
                  ),
                },
                {
                  term: 'negative_allowed: bool',
                  means: bi(
                    'The sharpest one. In a raw dict, a contract saying negative_allowed: "false" hands you the STRING "false", which is truthy in Python: if money["negative_allowed"]: reads it as "negatives are allowed" and the money rule INVERTS.',
                    'Cái sắc nhất trong bốn cái. Với một dict thường, nếu contract ghi negative_allowed: "false" thì bạn nhận về chuỗi "false", mà chuỗi đó là truthy trong Python. Câu if money["negative_allowed"] sẽ đọc thành "cho phép giá trị âm", và rule về tiền bị đảo ngược hoàn toàn.',
                  ),
                },
              ],
            },
          ],
        },
        {
          title: bi('Break it — on a COPY', 'Làm hỏng nó — trên một bản sao'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'The signed contract is never edited, not even for a demo — that is the whole ethic of this assignment. The corruption lands in scratch space, like the tampered CSVs of Task 7.',
                'Contract đã ký thì không bao giờ được sửa, kể cả để demo — đó là toàn bộ nguyên tắc nghề của bài này. Phần làm hỏng rơi vào thư mục tạm, giống mấy file CSV bị sửa ở Task 7.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `python -m work.contract_typo_demo
# [typed] shopcore_orders_daily v1.3.0 - 10 columns OK
# [yaml ] loads fine: 10 columns, customer_id.nullable = <<GONE>>, window_days = 'seven'
# [typed] 3 validation errors for Contract
# late_corrections.window_days
#   Input should be a valid integer, unable to parse string as an integer
# schema.1.nullable
#   Field required
# schema.1.nullible
#   Extra inputs are not permitted`,
            },
            {
              kind: 'why',
              body: bi(
                'Read line 2 twice: yaml.safe_load loaded the broken file WITHOUT A MURMUR, and reported customer_id.nullable = <<GONE>>. That is what your Task 4 gate would have been running on. Then read the error paths. Not "something is wrong with the contract" — schema.1.nullible says SECOND COLUMN of the schema block, key nullible, not permitted, which is an address you can hand back to whoever drafted the amendment.',
                'Đọc kỹ dòng thứ hai: yaml.safe_load nạp file hỏng đó mà không hé một tiếng, và báo customer_id.nullable = <<GONE>>. Đó chính là thứ mà gate ở Task 4 của bạn lẽ ra đã chạy dựa trên. Rồi đọc mấy dòng đường dẫn lỗi. Nó không nói chung chung kiểu "contract có gì đó sai" — dòng schema.1.nullible chỉ đúng cột thứ hai trong block schema, key tên nullible, không được phép. Đó là một địa chỉ cụ thể mà bạn trao ngược lại được cho người đã soạn amendment.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'When NOT to use it. Right here: one small document, parsed once per run. Wrong, loudly, one layer down: a Column-style model per DATA ROW means 82 million Python objects for the full feed — hours of CPU and RAM you do not have, to answer questions DuckDB answers in one scan. pydantic is for config; SQL and frame schemas are for feeds.',
                'Khi nào không nên dùng nó. Hợp là ở đây: một tài liệu nhỏ, parse một lần mỗi lần chạy. Còn sai chỗ, sai nặng, là ở tầng dưới: dùng một model kiểu Column cho từng dòng dữ liệu nghĩa là 82 triệu object Python cho cả feed. Tốn hàng giờ CPU và lượng RAM bạn không có, chỉ để trả lời những câu mà DuckDB xử lý gọn trong một lần quét. pydantic dành cho config; SQL và frame schema dành cho feed.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('python -m work.contract_model prints the contract\'s real name and version', 'Lệnh python -m work.contract_model in ra đúng tên và version của contract'),
        bi('The typo demo shows yaml.safe_load accepting the broken copy and pydantic rejecting it with schema.1.nullible', 'Bài demo lỗi gõ sai cho thấy yaml.safe_load chấp nhận bản sao hỏng còn pydantic từ chối kèm dòng schema.1.nullible'),
        bi('The signed contract on disk is untouched', 'Contract đã ký trên đĩa không bị đụng tới'),
      ],
    },

    {
      id: 'a06-t6',
      num: 6,
      title: bi('Gate all of month 1 (small)', 'Chạy gate cho cả tháng 1 (small)'),
      goal: bi('45 files, 45 passes.', '45 file, 45 lần pass.'),
      steps: [
        {
          title: bi('The sweep', 'Quét một lượt'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: 'python work\\contract_check.py --scale small --start 2026-06-01 --end 2026-07-15',
            },
            {
              kind: 'expect',
              body: bi(
                '45 [PASS] lines (each with its payment_method [warn]) and "45/45 files passed contract shopcore_orders_daily v1.3.0" in roughly 25–30 seconds. The cost per file is the SAMPLE READ, not the file size — remember that for Task 9.',
                '45 dòng PASS, mỗi dòng kèm một dòng warn về payment_method, rồi dòng "45/45 files passed contract shopcore_orders_daily v1.3.0", trong khoảng 25 tới 30 giây. Chi phí cho mỗi file là ở lần đọc mẫu chứ không phải ở kích thước file — nhớ điều này cho Task 9.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'If a file FAILs, read the cited clause before touching anything — and remember the fix is never "edit the signed contract until green".',
                'Nếu một file bị FAIL, hãy đọc điều khoản được trích dẫn trước khi đụng vào bất cứ thứ gì. Và nhớ rằng cách sửa không bao giờ là "sửa contract đã ký cho tới khi xanh".',
              ),
            },
          ],
        },
      ],
      accept: [bi('45/45 PASS at small scale, and the run time is in your journal', '45/45 pass ở scale small, và thời gian chạy đã ghi vào journal')],
    },

    {
      id: 'a06-t7',
      num: 7,
      title: bi('Break it on purpose: three tampered files', 'Cố ý làm hỏng: ba file bị sửa'),
      goal: bi('You cannot trust a gate you have never seen fail.', 'Không thể tin một cái gate mà bạn chưa từng thấy nó bắt được gì.'),
      steps: [
        {
          title: bi('Craft three broken copies', 'Tạo ba bản sao hỏng'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Each in its own folder so all three can keep the real file name — they must get PAST the naming check to test the deeper layers.',
                'Mỗi bản để trong một thư mục riêng để cả ba giữ được tên file thật. Chúng phải lọt qua được tầng kiểm tra tên file thì mới thử được các tầng sâu hơn.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `i = header.index("payment_method")     # 1. BỎ cột: nó biến mất lặng lẽ
write("dropped_col", header[:i] + header[i+1:], [r[:i] + r[i+1:] for r in data])

write("added_col", header + ["currency"],      # 2. THÊM cột ở cuối
      [r + ["USD"] for r in data])

j = header.index("order_id")           # 3. ĐỔI kiểu: BIGINT -> chuỗi 'ORD-...'
write("type_change", header,
      [r[:j] + [f"ORD-{int(r[j]):010d}"] + r[j+1:] for r in data])`,
            },
            {
              kind: 'why',
              body: bi(
                'The dropped and added columns are caught at the SCHEMA layer; the type change slips past it — same names, same order! — and is caught by the VALUE layer at 100% cast failure, with \'ORD-…\' examples. You will also see the manifest [warn] fire: scratch copies have no completeness signal, and the gate says so instead of failing ad-hoc checks.',
                'Cột bị bỏ và cột thêm vào đều bị tầng schema bắt. Còn thay đổi kiểu thì lọt qua tầng đó — cùng tên, cùng thứ tự mà — và bị tầng value bắt với tỉ lệ cast lỗi 100%, kèm mấy ví dụ dạng ORD-… Bạn cũng sẽ thấy dòng warn về manifest kích hoạt: các bản sao trong thư mục tạm không có completeness signal, và gate nói thẳng ra điều đó thay vì cho các file rời trượt oan.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Not random tampers, either — a new currency column and string order ids are exactly what shopcore ships as "month 2" in A10.',
                'Mà đây cũng không phải mấy kiểu phá hoại ngẫu nhiên đâu: một cột currency mới cùng order_id dạng chuỗi chính là thứ shopcore sẽ gửi dưới tên "tháng 2" ở A10.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('0/3 files passed, and each message names the exact problem', '0/3 file pass, và mỗi thông báo nêu đích danh vấn đề'),
        bi('Journal records which layer caught which tamper', 'Journal ghi lại tầng nào bắt được kiểu phá nào'),
      ],
    },

    {
      id: 'a06-t8',
      num: 8,
      title: bi('Wire the gate into your A05 pipeline', 'Gắn gate vào pipeline A05'),
      goal: bi('A gate you run by hand when you remember is not a gate.', 'Một cái gate mà bạn chỉ chạy tay khi nào nhớ ra thì không phải gate.'),
      steps: [
        {
          title: bi('At the very top, before any read of the data', 'Đặt ở đầu, trước mọi thao tác đọc dữ liệu'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `from work.contract_check import load_contract, check_file

problems = check_file(csv_path, load_contract())
if problems:
    for msg in problems:
        print(" -", msg)
    raise SystemExit(f"[contract gate] {csv_path.name} FAILED - nothing was loaded.")
print(f"[contract gate] {csv_path.name} PASS")`,
            },
            {
              kind: 'trap',
              body: bi(
                'Expect core.orders to come out of this holding the rerun day TWICE — plain INSERT is not rerun-safe (A05\'s known limitation). Do NOT fix it by hand; A07\'s Setup has you drop and rebuild this table with a properly idempotent loader.',
                'Hãy chuẩn bị tinh thần là bảng core.orders sau bước này sẽ chứa ngày chạy lại hai lần — lệnh INSERT thường không an toàn khi rerun, đúng cái giới hạn đã biết của A05. Đừng sửa bằng tay; phần Chuẩn bị của A07 sẽ bắt bạn drop rồi dựng lại bảng này bằng một loader idempotent đàng hoàng.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Then run the same pipeline against the type_change tampered file: give your validate_day() an optional csv_path argument so the gate — and only the gate — can be aimed at the tampered copy. NEVER copy a tampered file over a real path under raw/. Confirm the run aborts BEFORE the warehouse is touched (count(*) before and after).',
                'Sau đó chạy chính pipeline đó với file đã bị sửa kiểu type_change. Thêm cho hàm validate_day() một tham số csv_path tuỳ chọn, để gate — và chỉ mình gate — được chĩa vào bản sao đã sửa. Tuyệt đối không chép đè file hỏng lên một đường dẫn thật dưới raw/. Xác nhận lần chạy bị huỷ trước khi warehouse bị đụng tới, bằng cách đếm count(*) trước và sau.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Clean day loads with a PASS line; tampered day aborts pre-load', 'Ngày sạch load được kèm dòng PASS; ngày bị sửa thì huỷ trước khi load'),
      ],
    },

    {
      id: 'a06-t9',
      num: 9,
      title: bi('The full-scale sweep', 'Quét toàn bộ ở scale full'),
      goal: bi('Twenty times the data, barely more time.', 'Dữ liệu gấp hai mươi lần, mà thời gian gần như không tăng.'),
      steps: [
        {
          title: bi('Run and watch', 'Chạy và theo dõi'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: 'python work\\contract_check.py --scale full --start 2026-06-01 --end 2026-07-15',
            },
            {
              kind: 'why',
              body: bi(
                'Expect 45/45 PASS again — under a minute total, roughly a second per file. These files are ~350 MB each, twenty times the small ones, yet the gate barely slows down, because it samples 100,000 rows and STOPS. Watch Task Manager: memory barely moves. A pre-flight check must be cheap enough that nobody is ever tempted to skip it — that is a design requirement, not a nice-to-have.',
                'Vẫn 45/45 pass, tổng cộng dưới một phút, khoảng một giây mỗi file. Mấy file này nặng chừng 350 MB mỗi cái, gấp hai mươi lần bản small, vậy mà gate gần như không chậm đi, vì nó lấy mẫu 100.000 dòng rồi dừng. Nhìn Task Manager: bộ nhớ gần như không nhúc nhích. Một pre-flight check phải rẻ tới mức không ai nghĩ tới chuyện bỏ qua nó, và đó là yêu cầu thiết kế chứ không phải thứ có thì tốt.',
              ),
            },
          ],
        },
      ],
      accept: [bi('45/45 PASS at full scale; total time in your journal', '45/45 pass ở scale full; tổng thời gian đã ghi vào journal')],
    },

    {
      id: 'a06-t10',
      num: 10,
      title: bi('The change catalogue', 'Bảng phân loại thay đổi'),
      goal: bi('Eight scenarios, each with a bump and a notice period.', 'Tám tình huống, mỗi cái kèm mức bump và thời hạn báo trước.'),
      steps: [
        {
          title: bi('Two worked, six yours', 'Hai cái làm mẫu, sáu cái của bạn'),
          blocks: [
            {
              kind: 'code',
              lang: 'text',
              body: `1. Thêm một cột optional ở cuối
   -> Không breaking với reader đọc theo tên cột; breaking với reader đọc theo
      vị trí (gate so thứ tự chặt của ta sẽ gắn cờ để review). MINOR, báo 7 ngày.
2. Đổi tên payment_method thành payment_type
   -> Breaking: mọi query gọi tên cột đều sai. MAJOR, báo 30 ngày.
3. order_id chuyển sang dạng chuỗi 'ORD-…'              ?
4. Chèn một cột mới vào GIỮA                             ?
5. Xuất hiện giá trị status mới "on_hold"                ?
6. Tỉ lệ status rác nhích 0,3% -> 0,8% trong một tháng   ?
7. Đổi cách đặt tên file thành orders-YYYYMMDD.csv       ?
8. Producer sửa lỗi chính tả trong phần mô tả            ?`,
            },
            {
              kind: 'why',
              body: bi(
                'Think hard about #5 and #6, the sneaky ones. #5 breaks any consumer with exhaustive CASE status ... logic even though the SCHEMA is untouched. #6 breaks nothing YET — it still passes the 1% null_or_invalid_status tolerance — and is exactly the slow drift the stretch-goal history table would reveal.',
                'Nghĩ kỹ về số 5 và số 6, hai cái khó thấy nhất. Số 5 làm hỏng bất kỳ consumer nào có logic CASE status liệt kê đầy đủ, dù schema không hề bị đụng tới. Số 6 thì chưa phá gì cả, vẫn dưới ngưỡng 1% của null_or_invalid_status — và đó đúng là kiểu trôi dần mà bảng lịch sử ở bài mở rộng sẽ lộ ra.',
              ),
            },
          ],
        },
      ],
      accept: [bi('All 8 rows filled with a defensible one-line reason each', 'Đủ 8 dòng, mỗi dòng một lý do một câu bảo vệ được')],
    },

    {
      id: 'a06-t11',
      num: 11,
      title: bi('Draft amendment v1.4.0', 'Soạn amendment v1.4.0'),
      goal: bi('Turn gaps into clauses. The signed contract stays untouched.', 'Biến gap thành điều khoản. Contract đã ký vẫn nguyên vẹn.'),
      steps: [
        {
          title: bi('Three parts', 'Ba phần của amendment'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'You draft work/amendment_v1_4_0.md with status: proposed snippets and a rollout note — exactly what you would post in #shopcore-data-changes.',
                'Bạn soạn file work/amendment_v1_4_0.md gồm các đoạn ở trạng thái proposed cùng một ghi chú triển khai — đúng thứ bạn sẽ đăng lên kênh #shopcore-data-changes.',
              ),
            },
            {
              kind: 'code',
              lang: 'yaml',
              body: `# đề xuất cho v1.4.0 - status: proposed, có hiệu lực sau khi hai bên ký
  - name: order_total
    money:
      transport_locale:
        decimal_separator: "."       # "1234.56" - không bao giờ "1.234,56"
        thousands_separator: none
        currency_symbols: none       # không bao giờ "$79.98"`,
            },
            {
              kind: 'text',
              body: bi(
                'That first clause converts the euro-comma and $-prefix GAP into a VIOLATION going forward. Then add ONE MORE clause closing a Task 3 gap of your choice. One gap is reserved: PII and retention — Task 12 drafts that in full, so pick a different silence here.',
                'Điều khoản đầu tiên đó biến chỗ trống về dấu phẩy châu Âu và tiền tố $ thành một violation kể từ nay. Rồi thêm một điều khoản nữa để lấp một gap mà bạn chọn từ Task 3. Có một gap đã bị giữ chỗ: PII và thời hạn lưu trữ, vì Task 12 sẽ soạn nó đầy đủ, nên hãy chọn chỗ trống khác ở đây.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'The rollout note, three sentences: the version bump and WHY IT IS MINOR (it adds constraints that match current intent; no consumer code breaks; it is more than a wording PATCH), the notice period per change_management, and the status lifecycle step (proposed until countersigned).',
                'Ghi chú triển khai, ba câu. Một, mức bump version và vì sao nó là MINOR: nó thêm ràng buộc khớp với ý định hiện tại, không code nào của consumer bị vỡ, và nó nhiều hơn một bản PATCH chỉ sửa câu chữ. Hai, thời hạn báo trước theo change_management. Ba, bước trong vòng đời trạng thái: là proposed cho tới khi hai bên ký duyệt.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Paste-check that your snippets parse: drop each one into a scratch .yaml file and run it through yaml.safe_load. A proposed clause with a syntax error is an unreviewable clause.',
                'Nhớ kiểm tra các đoạn của bạn có parse được không: đổ từng cái vào một file .yaml nháp rồi cho chạy qua yaml.safe_load. Một điều khoản đề xuất mà lỗi cú pháp là điều khoản không ai review được.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Both clauses parse as YAML', 'Cả hai điều khoản parse được dưới dạng YAML'),
        bi('The rollout note names bump, notice, and status without hedging', 'Ghi chú triển khai nêu rõ mức bump, thời hạn báo trước và trạng thái, không nói nước đôi'),
      ],
    },

    {
      id: 'a06-t12',
      num: 12,
      title: bi('PII: the clause that cannot stay on paper', 'PII: điều khoản không thể chỉ nằm trên giấy'),
      goal: bi('Close the one silence that hands YOU cleanup work.', 'Lấp chỗ trống duy nhất tự giao việc dọn dẹp cho chính bạn.'),
      steps: [
        {
          title: bi('Why this one is different in kind', 'Vì sao gap này khác hẳn'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'The customers feed carries email — PII: data that points at a real, findable person. Every other silence on your list risks wrong numbers; this one risks a breach notification. And look at your own warehouse: core.customers has stored raw email addresses since A03. Nobody decided that — no clause allows it, none forbids it, so the warehouse became a PII store BY ACCIDENT.',
                'Feed customers có cột email, tức PII, dữ liệu định danh được một người cụ thể. Mọi chỗ trống khác trong danh sách của bạn chỉ dẫn tới số liệu sai; riêng cái này dẫn tới nghĩa vụ thông báo rò rỉ dữ liệu. Và thử nhìn lại warehouse của chính bạn: bảng core.customers đã lưu email thô từ A03 tới giờ. Không ai quyết định chuyện đó. Không điều khoản nào cho phép, cũng không điều khoản nào cấm, thế là warehouse thành nơi chứa PII một cách tình cờ.',
              ),
            },
            {
              kind: 'code',
              lang: 'yaml',
              body: `# đề xuất cho v1.4.0 - block mới ở mức cao nhất
data_classification:
  default: internal              # mọi cột không nêu tên bên dưới
  pii:
    - feed: shopcore_customers
      column: email
      class: pii_direct_identifier
      retention: >
        Giá trị thô không bao giờ được lưu trong warehouse. Chỉ lưu bản dẫn xuất
        không đảo ngược được md5(lower(trim(email))) dưới tên email_hash, và nó
        tồn tại đúng bằng vòng đời của dòng customer đó.
      allowed_usage: >
        Chỉ dùng email_hash để join và phát hiện trùng. Không export, không hiển
        thị, không dùng làm danh sách liên hệ - mỗi việc đó cần một thoả thuận mới.`,
            },
            {
              kind: 'text',
              body: bi(
                'Two things to notice. WHERE IT LIVES: the honest home — a customers-feed contract — does not exist yet, so the block sits in the only signed agreement between the teams. WHAT THE BUMP COSTS: v1.4.0 stays MINOR — not one byte of any feed changes — yet it hands the consumer a migration. Semver sizes the PROMISE, not the work it creates.',
                'Hai điều đáng để ý. Thứ nhất, nó nằm ở đâu: chỗ đúng của nó là một contract riêng cho feed customers, nhưng contract đó chưa tồn tại, nên block này tạm ngồi trong thoả thuận duy nhất đã ký giữa hai team. Thứ hai, lần bump này tốn gì: bản 1.4.0 vẫn là MINOR vì không byte dữ liệu nào trong feed thay đổi, vậy mà nó giao cho consumer nguyên một cuộc migration. Semver đo mức thay đổi của cam kết, không đo khối lượng việc mà cam kết đó tạo ra.',
              ),
            },
          ],
        },
        {
          title: bi('Implement it: rebuild core.customers', 'Thực thi: rebuild core.customers'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'The clause promises two things — exposure gone, capability kept — so MEASURE THE CAPABILITY BEFORE you destroy the column, or you cannot prove you kept it.',
                'Điều khoản này hứa hai chuyện: không còn phơi nhiễm, mà vẫn giữ được khả năng dùng. Nên phải đo cái khả năng đó trước khi bạn xoá cột, nếu không thì lấy gì chứng minh là đã giữ được.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `-- TRƯỚC: cột thô đang mang bao nhiêu tín hiệu trùng email?
SELECT count(email) - count(DISTINCT email) AS dup_email_rows
FROM core.customers;                            -- small: 180

-- REBUILD: cùng một bảng, nhưng giá trị thô không sống sót qua nó
CREATE OR REPLACE TABLE core.customers AS
SELECT customer_id, name,
       md5(lower(trim(email))) AS email_hash,   -- chuẩn hoá BÊN TRONG hàm hash
       country, city, signup_ts, is_active,
       _data_date, _run_id
FROM core.customers;

-- SAU, nửa lời hứa thứ nhất - không còn phơi nhiễm:
DESCRIBE core.customers;              -- có email_hash, không còn email ở đâu cả

-- SAU, nửa lời hứa thứ hai - khả năng vẫn còn:
SELECT count(email_hash) - count(DISTINCT email_hash) AS dup_hash_rows
FROM core.customers;                            -- small: 180 - giống hệt`,
            },
            {
              kind: 'why',
              body: bi(
                'Why md5(lower(trim(email))) and not just md5(email)? The expression is now a CONTRACT CLAUSE — it must not depend on A03\'s cleaning staying upstream of it forever, and md5(\'John@X.com\') ≠ md5(\'john@x.com\'). An un-canonicalized hash silently loses the very dedupe capability the clause promises.',
                'Vì sao phải md5(lower(trim(email))) chứ không phải md5(email)? Vì biểu thức này giờ đã là một điều khoản contract, nên nó không được phụ thuộc vào việc phần cleaning của A03 mãi mãi chạy trước nó. Mà md5 của "John@X.com" khác md5 của "john@x.com". Một hàm hash chưa chuẩn hoá đầu vào sẽ âm thầm làm mất đúng cái khả năng dedupe mà điều khoản hứa hẹn.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Run the rebuild a SECOND time and it fails — Binder Error: Referenced column "email" not found — and that error is the clause WORKING: no raw email left to re-hash, or to leak. Repeat against the full-scale warehouse too: 1,200,000 rows, and the dup count is 3,594 before and after.',
                'Chạy lệnh rebuild lần thứ hai thì nó lỗi: Binder Error: Referenced column "email" not found. Và chính cái lỗi đó là điều khoản đang hoạt động: không còn email thô nào để hash lại, cũng chẳng còn gì để rò rỉ. Làm lại với warehouse ở scale full: 1.200.000 dòng, và số trùng là 3.594 cả trước lẫn sau.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('The clause parses as YAML inside the amendment', 'Điều khoản parse được dưới dạng YAML bên trong amendment'),
        bi('DESCRIBE core.customers shows email_hash and no email', 'Lệnh DESCRIBE core.customers cho thấy email_hash và không còn email'),
        bi('The duplicate count via email_hash equals the count measured on the raw column before the rebuild (small: 180 = 180)', 'Số trùng tính qua email_hash bằng đúng số đo trên cột thô trước khi rebuild (small: 180 bằng 180)'),
      ],
    },

    {
      id: 'a06-verify',
      title: bi('Verify yourself', 'Tự kiểm chứng'),
      goal: bi('Sanity numbers, and the classification table.', 'Các con số hợp lý, và bảng phân loại.'),
      steps: [
        {
          title: bi('The headroom is the design', 'Khoảng cách tới ngưỡng chính là thiết kế'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Small scale, any day: the STRICT written format for order_ts is broken by roughly 0.7% of rows — violations you reported in Task 2 — but truly UNPARSEABLE rows sit near 0.03%, comfortably under the 0.5% hard-fail tolerance. Junk status runs ~0.2–0.3% (tolerance 1%), bad totals ~0.8% (tolerance 1%), payment_method ~0.3% (warn only). That headroom is the design: normal dirt passes, CHANGE trips the gate.',
                'Scale small, ngày nào cũng vậy: cái format chặt đã quy định cho order_ts bị khoảng 0,7% số dòng phá vỡ, và đó là violation bạn đã báo ở Task 2. Nhưng những dòng thật sự không parse được thì chỉ chừng 0,03%, thấp hơn ngưỡng hard-fail 0,5% khá thoải mái. Status rác chạy khoảng 0,2 tới 0,3% với ngưỡng 1%, tổng tiền hỏng khoảng 0,8% với ngưỡng 1%, payment_method khoảng 0,3% và chỉ warn. Chính khoảng cách đó là thiết kế: rác bình thường thì lọt qua, còn sự thay đổi mới làm gate kích hoạt.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `Phát hiện ở A05                          | Loại       | Điều khoản / chỗ trống
-----------------------------------------|------------|------------------------------
order_total âm                           | violation  | money.negative_allowed: false
order_total là "N/A" hoặc rỗng           | violation  | đã hứa DECIMAL, nullable: false
status rác / thừa khoảng trắng / sai hoa | violation  | allowed_values + case
payment_method sai hoa thường            | violation  | allowed_values (không có ngưỡng!)
order_ts dạng DD/MM, ISO-T, ngày bất khả | violation  | format đã quy định rõ
customer_id dạng Excel-float "123456.0"  | violation  | đã hứa BIGINT
total lệch items quá ±0.01               | violation  | order_total.business_rule
customer_id / SKU mồ côi                 | violation  | references + tolerances
gửi lại y hệt trong file (<=0,2%)        | TOLERATED  | at-least-once delivery
dấu phẩy châu Âu / tiền tố $             | GAP        | money không nói gì về locale
"qty":"2" dạng chuỗi trong items         | GAP        | items chưa ghim kiểu (# NOTE)
utm: null vs "none" vs không có key      | GAP        | chưa quy định cách biểu diễn`,
            },
          ],
        },
        {
          title: bi('Task 12 exact numbers', 'Số chính xác của Task 12'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT count(*) FROM core.customers;                                  -- 60000
SELECT count(email_hash) - count(DISTINCT email_hash)
FROM core.customers;                                                  -- 180
-- full scale: 1,200,000 / 3,594`,
            },
            {
              kind: 'text',
              body: bi(
                'And prove the signed file survived: git status shows contracts/ unchanged, and the broken copy sits in <DATA_ROOT>/tmp/contract_typo/ where it belongs.',
                'Và chứng minh file đã ký còn nguyên: git status cho thấy thư mục contracts/ không đổi, còn bản sao hỏng thì nằm trong <DATA_ROOT>/tmp/contract_typo/, đúng chỗ của nó.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('45/45 PASS at both scales; 0/3 tampered files pass', '45/45 pass ở cả hai scale; 0/3 file bị sửa pass'),
        bi('contracts/ byte-for-byte unchanged in git status', 'Thư mục contracts/ không đổi một byte nào theo git status'),
      ],
    },

    {
      id: 'a06-mistakes',
      title: bi('Common beginner mistakes', 'Lỗi thường gặp của người mới'),
      goal: bi('Six traps; the first is an ethics failure, not a technical one.', 'Sáu cái bẫy; cái đầu là lỗi nguyên tắc chứ không phải lỗi kỹ thuật.'),
      steps: [
        {
          title: bi('The six', 'Sáu lỗi'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'Editing the signed contract to make a red gate green. A contract edit is a producer conversation plus a version bump — the amendment path. Quietly widening a tolerance is a fig leaf over a broken promise.',
                'Sửa contract đã ký để làm gate đang đỏ chuyển xanh. Sửa contract nghĩa là phải nói chuyện với producer rồi bump version, tức đi đường amendment. Còn lặng lẽ nới một ngưỡng tolerance chỉ là cách che đi việc ai đó đã không giữ lời.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Classifying every surprise as a violation. Check that the clause actually EXISTS before writing the incident note. Blaming shopcore for a promise never made burns credibility you will need for real incidents.',
                'Cứ thấy gì lạ là xếp vào violation. Hãy kiểm tra xem điều khoản đó có thật sự tồn tại không trước khi viết incident note. Trách shopcore về thứ họ chưa từng hứa là tự đốt uy tín mà bạn cần để dành cho những sự cố thật.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Trusting the sniffer as the contract. Auto-detected types drift with dirt — you saw customer_id become DOUBLE and updated_at grow a timezone. Pin names and order exactly; probe types with TRY_CAST rates against tolerances.',
                'Tin sniffer như tin contract. Kiểu tự đoán sẽ trôi theo rác — bạn đã thấy customer_id thành DOUBLE và updated_at tự mọc thêm một timezone. Hãy ghim tên và thứ tự cột thật chính xác, còn kiểu thì dò bằng tỉ lệ TRY_CAST đối chiếu với ngưỡng.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Forgetting NULL in enum checks. Empty CSV fields arrive as SQL NULL, and status NOT IN (...) is NULL (not true!) for NULLs — junk silently passes.',
                'Quên NULL trong các check enum. Ô CSV rỗng về tới nơi là NULL của SQL, mà biểu thức status NOT IN (...) với NULL thì trả về NULL chứ không phải true — thế là rác lọt qua lặng lẽ.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Running the gate after loading. Then it is just A05 with extra steps. The entire value is refusing BEFORE bad data enters the warehouse.',
                'Chạy gate sau khi đã load. Vậy thì nó chỉ là A05 cộng vài bước thừa. Toàn bộ giá trị nằm ở chỗ từ chối trước khi dữ liệu xấu vào warehouse.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Scanning whole files in the gate. Without LIMIT sample_rows the full-scale sweep reads ~16 GB instead of a few hundred MB. Expensive gates get skipped.',
                'Quét trọn file trong gate. Không có LIMIT sample_rows thì lần quét ở scale full đọc khoảng 16 GB thay vì vài trăm MB. Mà gate càng đắt thì càng dễ bị bỏ qua.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Đọc qua một lượt trước khi bắt đầu Task 4')],
    },

    {
      id: 'a06-stretch',
      title: bi('Stretch goals', 'Bài mở rộng'),
      goal: bi('Three optional exercises.', 'Ba bài tự chọn.'),
      steps: [
        {
          title: bi('1 — Contract-check history', '1 — Lịch sử chạy gate'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Log every gate result (date, file, check, rate, tolerance, pass) to ops.contract_checks in warehouse.duckdb. A rate climbing toward its tolerance over weeks is scenario #6 made visible.',
                'Ghi mọi kết quả của gate — ngày, file, tên check, tỉ lệ, ngưỡng, pass hay không — vào bảng ops.contract_checks trong warehouse.duckdb. Một tỉ lệ leo dần về phía ngưỡng qua nhiều tuần chính là tình huống số 6 được nhìn thấy.',
              ),
            },
          ],
        },
        {
          title: bi('2 — Contract the dimensions', '2 — Viết contract cho dimension'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Draft contracts/shopcore_customers.contract.yaml (status: draft) using the README\'s per-column interrogation, and extend the checker. Harder than it looks: what does the money/timestamp checklist say about signup_ts, when the DATA ITSELF admits three formats? What tolerance is honest?',
                'Soạn file contracts/shopcore_customers.contract.yaml ở trạng thái draft, theo cách rà từng cột trong README, rồi mở rộng bộ checker. Khó hơn vẻ ngoài: bảng kiểm tra về tiền và thời gian nói gì về signup_ts, khi mà chính dữ liệu thừa nhận có ba format? Ngưỡng nào mới là trung thực?',
              ),
            },
          ],
        },
        {
          title: bi('3 — Smarter sampling', '3 — Lấy mẫu thông minh hơn'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'First-N sampling is fine here because the dirt is evenly scattered — but a SORTED file would fool it. Try USING SAMPLE and compare.',
                'Lấy N dòng đầu là ổn ở đây vì rác rải đều. Nhưng một file đã sắp xếp thì sẽ đánh lừa được cách đó. Thử dùng USING SAMPLE rồi so sánh.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Hoàn thành ít nhất một mục và ghi kết luận vào journal')],
    },
  ],
}