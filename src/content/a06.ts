import type { AssignmentSpec } from '../types'
import { bi, vi } from '../types'
import { a06Terms, a06Theory } from './a06.theory'

export const a06: AssignmentSpec = {
  id: 'a06',
  code: 'A06',
  title: bi('Data contracts', 'Contract dữ liệu'),
  summary: bi(
    'Read the signed promise, classify your A05 findings as violation or gap, build the pre-flight gate — then close one silence with your own hands.',
    'Đọc bản hứa đã ký, phân loại các phát hiện của A05 thành violation hay gap, dựng pre-flight gate — rồi tự tay đóng lại một chỗ chưa quy định.',
  ),
  estHours: 5,
  difficulty: 3,
  outcome: bi(
    'You can read a contract clause by clause, tell a broken promise from a promise never made, build a gate that refuses a file before it is loaded, and draft the amendment that closes a silence for good.',
    'Bạn đọc được một contract theo từng điều khoản, phân biệt được một lời hứa bị phá vỡ với một lời hứa chưa bao giờ được đưa ra, dựng được gate từ chối một file trước khi nó được nạp, và soạn được amendment đóng lại một chỗ chưa quy định vĩnh viễn.',
  ),
  theory: a06Theory,
  terms: a06Terms,
  tasks: [
    {
      id: 'a06-t0',
      title: bi('Setup', 'Chuẩn bị'),
      goal: bi('A branch, the contracts folder, and the A05 warehouse on hand.', 'Một branch, thư mục contracts, và warehouse từ A05.'),
      steps: [
        {
          title: bi('Branch and preconditions', 'Branch và điều kiện cần'),
          blocks: [
            { kind: 'code', lang: 'powershell', body: 'git switch -c a06-data-contract' },
            {
              kind: 'text',
              body: bi(
                'Venv active — pyyaml and pydantic are both in requirements.txt. The contracts/ folder ships with the repo: the signed contract plus contracts/README.md. warehouse.duckdb from A05 on hand (ops.dq_report, quarantine Parquet), with core.customers from A03 still in it — Task 12 rebuilds that table.',
                'Môi trường ảo đang bật — pyyaml và pydantic đều có trong requirements.txt. Thư mục contracts/ đi kèm repo: contract đã ký cộng file contracts/README.md. Cần có warehouse.duckdb từ A05 (bảng ops.dq_report, các file Parquet trong quarantine), và bảng core.customers từ A03 vẫn còn trong đó — Task 12 sẽ dựng lại bảng ấy.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'You NEVER edit the signed contract — amendments are drafted separately and proposed (Tasks 11–12). Not to make a red gate green, not even for a demo.',
                'Bạn KHÔNG BAO GIỜ sửa contract đã ký — các amendment được soạn riêng và đưa ra đề xuất ở Task 11 và 12. Không phải để làm gate đang đỏ chuyển xanh, cũng không phải để diễn thử.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Scale: develop everything on small, run the final sweep on full. No special memory settings today — the gate samples at most 100,000 rows per file on throwaway in-memory connections; the warehouse is not touched until Task 8.',
                'Quy mô: phát triển mọi thứ trên small, chạy lần quét cuối trên full. Hôm nay không cần thiết lập bộ nhớ đặc biệt — gate chỉ lấy mẫu tối đa 100.000 dòng mỗi file trên các kết nối in-memory dùng một lần; warehouse không bị đụng tới cho tới Task 8.',
              ),
            },
          ],
        },
      ],
      accept: [bi('On branch a06-data-contract; contracts/ folder present', 'Đang ở nhánh a06-data-contract; thư mục contracts/ có mặt')],
    },

    {
      id: 'a06-t1',
      num: 1,
      title: bi('Read the contract like a professional', 'Đọc contract như người làm nghề'),
      goal: bi('Ten questions, each answered with the clause that answers it.', 'Mười câu hỏi, mỗi câu trả lời kèm điều khoản trả lời cho nó.'),
      steps: [
        {
          title: bi('The per-column interrogation', 'Rà soát từng cột'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Open the contract and contracts/README.md side by side. For every column ask: what type is it really, can it be null, can it repeat, what timezone, what currency, and what is NOT written?',
                'Mở contract và file contracts/README.md cạnh nhau. Với mỗi cột, hãy hỏi: nó thật sự là kiểu gì, có được null không, có lặp lại được không, múi giờ nào, tiền tệ gì, và điều gì KHÔNG được viết ra?',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Two worked examples. (1) What currency is order_total, and who rounds? — USD, single-currency by contract; scale 2, half-up, applied by the PRODUCER (schema.order_total.money). The warehouse never re-rounds. (2) A refund lands. What sign? — Positive. The "negative" lives in status=refunded, not in the number (money.negative_allowed: false + business_rules.refunds). A naive SUM(order_total) therefore OVERSTATES revenue unless status is considered.',
                'Hai ví dụ đã làm sẵn. (1) order_total dùng tiền gì, và ai làm tròn? — USD, contract quy định một loại tiền duy nhất; hai chữ số thập phân, làm tròn nửa lên, do BÊN SẢN XUẤT thực hiện (schema.order_total.money). Warehouse không bao giờ làm tròn lại. (2) Một giao dịch hoàn tiền về. Nó mang dấu gì? — Dấu dương. Cái "âm" nằm ở status=refunded chứ không nằm trong con số (money.negative_allowed: false cộng business_rules.refunds). Vì thế một câu SUM(order_total) ngây thơ sẽ THỔI PHỒNG doanh thu nếu không xét tới trạng thái.',
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
                '3. order_ts ở múi giờ nào, ai đã chuyển đổi nó, và ai xử lý chuyện giờ mùa hè?\n4. Bên tài chính muốn báo cáo theo giờ địa phương của cửa hàng. Việc chuyển múi giờ diễn ra ở đâu — và vì sao contract CẤM chuyển đổi ngay lúc nạp?\n5. customer_id về tới nơi là NULL. Mất dữ liệu, lỗi producer, hay là một ý nghĩa?\n6. order_id có duy nhất không? Duy nhất trong phạm vi chính xác nào — mỗi file, mỗi ngày, hay mỗi đơn hàng ngoài đời?\n7. Hai cột nào quyết định bản nào của một đơn được gửi lại sẽ thắng?\n8. File của ngày D được phép với ngược về xa tới đâu? Vậy việc nạp file D có thể chạm vào những phân vùng nào của lake?\n9. Làm sao bạn biết một lần giao file là ĐẦY ĐỦ — và hai con số nào bạn buộc phải reconcile ở mọi lần nạp?\n10. Vào lúc mấy giờ thì một file thiếu thôi là buổi sáng chậm chạp của bạn và trở thành sự cố của shopcore?',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Question 4 is the one worth the rubber duck. The warehouse_policy clause forbids converting at ingest because one raw UTC fact can serve EVERY regional mart; a fact converted at ingest serves exactly one. That is a modeling principle, not a preference.',
                'Câu số 4 là câu đáng đem đi giải thích cho con vịt cao su. Điều khoản warehouse_policy cấm chuyển múi giờ lúc nạp vì một dữ kiện thô ở giờ UTC có thể phục vụ MỌI bảng mart theo vùng; còn một dữ kiện đã chuyển đổi lúc nạp thì chỉ phục vụ được đúng một. Đó là nguyên tắc model hoá, không phải sở thích.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'All ten answers in your journal with clause names, and you can explain #4 to a rubber duck without opening the file',
          'Đủ mười câu trả lời trong journal kèm tên điều khoản, và bạn giải thích được câu số 4 cho con vịt cao su mà không cần mở file',
        ),
      ],
    },

    {
      id: 'a06-t2',
      num: 2,
      title: bi('Violation or gap? Classify your A05 findings', 'Violation hay gap? Phân loại kết quả A05'),
      goal: bi('Hold your quarantine against the promise, then write the two artifacts real teams write.', 'Đặt quarantine của bạn cạnh lời hứa, rồi viết hai văn bản mà các đội thật vẫn viết.'),
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
                'Với mỗi reject_reason phân biệt (cộng bất cứ điều gì đáng chú ý trong ops.dq_report), hãy quyết định: VI PHẠM (một điều khoản đã ghi bị phá vỡ — nêu tên nó), KHOẢNG TRỐNG (contract im lặng — nêu tên chỗ chưa quy định đó), hay ĐƯỢC DUNG THỨ (contract cho phép tường minh ở mức tỉ lệ đó).',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Careful with that last one: the within-file exact re-sends you met in A03/A05 are NOT a violation — duplicates.within_file_exact_resends tolerates up to 0.2% as the price of at-least-once delivery.',
                'Cẩn thận với loại cuối: các bản gửi lại y hệt trong cùng file mà bạn đã gặp ở A03 và A05 KHÔNG phải violation — điều khoản duplicates.within_file_exact_resends cho phép tới 0,2%, coi đó là cái giá của cơ chế giao ít nhất một lần.',
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
                'work/incident_note.md — addressed to checkout-eng@shopcore.example (producer contact, from the contract): every VIOLATION with its measured count for one day and the clause it breaks. Half a page. A producer must be able to act on it without reading your code. This is the weekly report the contract\'s slo_reporting block promises them.',
                'File work/incident_note.md — gửi tới checkout-eng@shopcore.example (đầu mối producer, lấy từ contract): mọi VI PHẠM kèm số đo được của một ngày và điều khoản mà nó phá vỡ. Nửa trang. Bên sản xuất phải hành động được dựa trên nó mà không cần đọc code của bạn. Đây chính là báo cáo hằng tuần mà khối slo_reporting trong contract đã hứa với họ.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'A gaps list in your journal — input for Task 3. No blame, no counts needed; just "the contract does not say X, and the data does Y".',
                'Một danh sách gap trong journal — đầu vào cho Task 3. Không quy tội, không cần số lượng; chỉ cần "contract không nói X, mà dữ liệu lại làm Y".',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Every reject_reason carries one of the three labels', 'Mọi reject_reason đều mang một trong ba nhãn'),
        bi('The incident note cites a clause per violation', 'Incident note trích dẫn một điều khoản cho mỗi violation'),
        bi('Nothing in it says "please fix" about a gap', 'Trong đó không có chỗ nào nói "làm ơn sửa" về một gap'),
      ],
    },

    {
      id: 'a06-t3',
      num: 3,
      title: bi('The gap hunt', 'Tìm những chỗ contract chưa quy định'),
      goal: bi('Four silences, including the two the author seeded on purpose.', 'Bốn chỗ chưa quy định, kể cả hai cái mà tác giả cố ý gieo sẵn.'),
      steps: [
        {
          title: bi('Find the two seeded NOTEs first', 'Tìm hai dòng NOTE có sẵn trước đã'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'The contract\'s author left two # NOTE comments in the YAML flagging silences on purpose — find them; they are your first two entries and your template for what a "silence" looks like. Then hunt at least FOUR total, drawing on everything the data has done to you since A03.',
                'Tác giả contract để lại hai dòng chú thích # NOTE trong file YAML, cố ý đánh dấu các chỗ chưa quy định — hãy tìm chúng; đó là hai mục đầu tiên của bạn và là khuôn mẫu cho việc một "chỗ chưa quy định" trông như thế nào. Sau đó săn cho đủ ít nhất BỐN cái, dựa trên mọi thứ mà dữ liệu đã làm với bạn từ A03 tới giờ.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `| silence (điều contract không nói) | how it bites (rác hoặc mơ hồ cụ thể) | clause that would close it |
|---|---|---|`,
            },
            {
              kind: 'why',
              body: bi(
                'A gap is NOT a bug report. The producer owes you nothing here — that is exactly what makes gaps dangerous: nobody is accountable until a clause exists. Your "clause that would close it" column is the seed of Task 11\'s amendment.',
                'Một gap KHÔNG phải một báo cáo lỗi. Bên sản xuất không nợ bạn gì ở đây cả — và đó chính là điều khiến gap nguy hiểm: không ai chịu trách nhiệm cho tới khi có một điều khoản tồn tại. Cột "điều khoản sẽ đóng nó lại" của bạn chính là hạt giống cho amendment ở Task 11.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Candidates: updated_at timezone/meaning (seeded), items inner types / max array length / optional-key representation (seeded), money transport locale, utm null representation, restatement policy (the freshness_sla text itself confesses this one), PII and retention for the customers feed. Finding something defensible beyond this list is a feature, not a mistake.',
                'Các ứng viên: múi giờ và ý nghĩa của updated_at (gieo sẵn), kiểu bên trong của items cùng độ dài mảng tối đa và cách biểu diễn khoá tuỳ chọn (gieo sẵn), quy ước biểu diễn tiền khi truyền, cách biểu diễn giá trị rỗng của utm, chính sách công bố lại (chính đoạn văn freshness_sla thú nhận cái này), và PII cùng thời hạn lưu trữ cho feed customers. Tìm ra thứ gì bảo vệ được ngoài danh sách này là một điểm cộng, không phải lỗi.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          '≥4 rows, including both seeded # NOTEs, each with a concrete bite you have actually observed in this lab\'s data',
          'Ít nhất 4 dòng, gồm cả hai dòng # NOTE được gieo sẵn, mỗi dòng kèm một chỗ cắn cụ thể mà bạn đã thật sự quan sát được trong dữ liệu của lab này',
        ),
      ],
    },

    {
      id: 'a06-t4',
      num: 4,
      title: bi('The pre-flight gate: work/contract_check.py', 'Pre-flight gate: work/contract_check.py'),
      goal: bi('Five layers, stopping early, testing against DECLARED types.', 'Năm tầng, dừng sớm, và kiểm tra dựa trên kiểu ĐÃ KHAI.'),
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
                'Sniffer gọi customer_id là DOUBLE — một phần nhỏ phần trăm giá trị trông như "123456.0" (đúng thứ rác Excel-float của A03) và kết quả đoán NỚI RỘNG ra để vừa với rác. Cột order_ts trả về VARCHAR. Còn updated_at trả về TIMESTAMP WITH TIME ZONE — một múi giờ mà KHÔNG AI HỨA (nguyên liệu cho Task 3!). Kiểu do dò ra trôi theo bất cứ thứ rác nào rơi vào mẫu; khối schema trong contract mới là điểm cố định để reconcile.',
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
                'Chính contract ra lệnh cho việc dựng này: điều khoản change_management.policy nói pipeline consumer "phải hỏng một cách ồn ào tại gate trước khi nạp, khi có trôi dạt chưa được khai báo, thay vì nạp rác vào". Thứ tự kiểm tra: tên file, manifest, schema, dò mẫu, cửa sổ trễ.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `"""Pre-flight contract gate: check a raw shopcore orders CSV against the
signed contract BEFORE any row is loaded. Exit 0 = all files pass; 1 = at
least one failed."""
import argparse, json, os, re, sys
from datetime import date, timedelta
from pathlib import Path

import duckdb
import yaml

REPO_ROOT = Path(__file__).resolve().parents[1]
DATA_ROOT = Path(os.environ.get("ETL_LAB_DATA", REPO_ROOT / "data"))
CONTRACT = REPO_ROOT / "contracts" / "shopcore_orders_daily.contract.yaml"

SAMPLE_ROWS = 100_000                  # gate design choice, not a contract clause
TS_FORMAT = "%Y-%m-%d %H:%M:%S"        # schema.order_ts pins the written form
NAMING_RX = re.compile(r"^orders_\\d{4}-\\d{2}-\\d{2}\\.csv$")   # delivery.path_pattern


def pct(s) -> float:
    """'0.5%' -> 0.005 - the contract writes tolerances the way humans read them."""
    return float(str(s).split("%")[0].strip()) / 100.0


def check_file(csv_path: Path, contract: dict) -> list[str]:
    """Return a list of producer-facing problems. Empty list = PASS."""
    problems: list[str] = []
    con = duckdb.connect()                      # in-memory scratch connection

    # ---- 1. delivery: file naming ----------------------------------------
    if not NAMING_RX.match(csv_path.name):
        return [f"file name '{csv_path.name}' does not match delivery.path_pattern"]
    file_date = date.fromisoformat(csv_path.stem.split("_")[1])

    # ---- 2. completeness signal: the manifest ----------------------------
    manifest_path = csv_path.parent.parent / "manifest" / (csv_path.stem + ".json")
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        size = csv_path.stat().st_size
        if size != manifest["bytes"]:
            problems.append(f"bytes on disk ({size}) != manifest.bytes "
                            f"({manifest['bytes']}) - truncated delivery? "
                            "(quality.reconciliation)")
    else:
        print(f"  [warn] {csv_path.name}: no manifest found")

    # ---- 3. schema: exact names, exact order -----------------------------
    expected = [c["name"] for c in contract["schema"]]
    sniffed = con.execute("SELECT Columns FROM sniff_csv(?)", [str(csv_path)]).fetchone()[0]
    actual = [c["name"] for c in sniffed]
    if actual != expected:
        missing = [c for c in expected if c not in actual]
        extra = [c for c in actual if c not in expected]
        if missing:
            problems.append(f"missing column(s) {missing} - dropped or renamed upstream? "
                            "change_management: MAJOR bump, 30 days notice.")
        if extra:
            problems.append(f"unexpected column(s) {extra} - new export version? "
                            "change_management: additive needs MINOR, 7 days notice.")
        if not missing and not extra:
            problems.append(f"column order changed: expected {expected}, got {actual}")
        return problems     # value checks are meaningless on the wrong columns`,
            },
          ],
        },
        {
          title: bi('Layer 4 — sampled value probes', 'Tầng 4 — value probe trên mẫu'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `    # ---- 4. sampled value probes, everything as text ---------------------
    con.execute("CREATE TEMP TABLE sample AS SELECT * FROM "
                "read_csv(?, header=true, all_varchar=true) LIMIT ?",
                [str(csv_path), SAMPLE_ROWS])
    total = con.execute("SELECT count(*) FROM sample").fetchone()[0]
    tol = {k: pct(v) for k, v in contract["quality"]["row_level_tolerances"].items()}
    enums = {c["name"]: c["allowed_values"]
             for c in contract["schema"] if "allowed_values" in c}
    status_list = ", ".join(f"'{s}'" for s in enums["status"])
    ts_recover = (f"COALESCE(try_strptime(order_ts, ['{TS_FORMAT}', "
                  "'%d/%m/%Y %H:%M:%S']), TRY_CAST(order_ts AS TIMESTAMP))")

    checks: dict[str, tuple[str, str, float, str]] = {
        "order_id_not_castable": (
            "order_id", "order_id IS NULL OR TRY_CAST(order_id AS BIGINT) IS NULL",
            0.0, "schema.order_id: BIGINT, not nullable - no tolerance declared"),
        "unparseable_order_ts": (
            "order_ts", f"order_ts IS NULL OR {ts_recover} IS NULL",
            tol["unparseable_order_ts"], "quality.row_level_tolerances"),
        "null_or_invalid_status": (
            "status", f"status IS NULL OR status NOT IN ({status_list})",
            tol["null_or_invalid_status"], "schema.status: allowed_values + case"),
        # TODO "customer_id_not_castable": tolerance 0.0 - but nullable: true!
        #      NULL is guest checkout, not dirt: count only values that are
        #      present AND not castable to BIGINT.
        # TODO "store_id_not_castable": mirror order_id with INTEGER.
        # TODO "unparseable_order_total": tolerance tol["unparseable_order_total"].
        #      Bad row = NULL OR NOT regexp_matches(order_total, '^[0-9]+\\.[0-9]{2}$')
    }
    for name, (col, bad, tolerance, clause) in checks.items():
        n = con.execute(f"SELECT count(*) FROM sample WHERE {bad}").fetchone()[0]
        if n / total > tolerance:
            ex = [r[0] for r in con.execute(
                f"SELECT DISTINCT {col} FROM sample WHERE {bad} LIMIT 3").fetchall()]
            problems.append(f"{name}: {n}/{total} sampled rows ({n / total:.2%}) exceed "
                            f"tolerance {tolerance:.2%} ({clause}). Examples: {ex}")

    # payment_method: enum + case pinned, but row_level_tolerances is SILENT
    # about it. No agreed threshold -> measure and report, do not hard-fail.
    pay_list = ", ".join(f"'{p}'" for p in enums["payment_method"])
    n = con.execute("SELECT count(*) FROM sample WHERE payment_method IS NULL "
                    f"OR payment_method NOT IN ({pay_list})").fetchone()[0]
    if n:
        print(f"  [warn] {csv_path.name}: payment_method {n}/{total} ({n / total:.2%}) "
              "outside the enum - a violation to report weekly (slo_reporting), "
              "but no hard-fail tolerance is declared. Amendment material.")

    # ---- 5. late-corrections window --------------------------------------
    # TODO: SELECT min/max of ts_recover over the sample (min/max skip NULLs).
    # FAIL if the oldest timestamp's date < file_date - window_days, or the
    # newest is after file_date itself - schema.order_ts.range is
    # [business_date - 7 days, business_date + 1 day), so anything later means
    # shopcore is leaking tomorrow's orders. Cite both clauses. timedelta helps.
    con.close()
    return problems`,
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
                '"Không phân tích được" hẹp hơn "sai định dạng". Khoảng 0,7% số dòng phá vỡ định dạng viết đã ghim (dạng DD/MM và ISO-T) — đó là các VI PHẠM mà bạn đếm và báo cáo ở A05. Nhưng ngưỡng trượt hẳn 0,5% là dành cho unparseable_order_ts: những dòng mà không định dạng nào đã biết cứu được, tức các ngày bất khả thi, chừng 0,03%. Đó là lý do ts_recover thử các định dạng phục hồi trước khi tuyên bố một dòng là mất. Một gate trượt hẳn vì sai định dạng chặt sẽ đỏ mỗi ngày — và một gate lúc nào cũng đỏ là gate không ai buồn đọc.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'What the gate deliberately SKIPS: orphan_customer_id, orphan_sku_lines and total_vs_items_mismatch need the dimension feeds or per-row JSON math — too heavy for pre-flight. They stay in your A05 post-load suite. The gate covers what one file alone can prove cheaply.',
                'Điều mà gate CỐ Ý BỎ QUA: orphan_customer_id, orphan_sku_lines và total_vs_items_mismatch cần tới các nguồn dimension hoặc phép tính JSON theo từng dòng — quá nặng cho phép kiểm tra pre-flight. Chúng ở lại trong bộ kiểm tra sau nạp của A05. Gate chỉ phủ những gì mà một file đơn lẻ tự chứng minh được với chi phí rẻ.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'main() is yours. It must: accept either explicit file paths or --scale small|full with --start/--end; print one [PASS]/[FAIL] line per file plus its problems (a missing expected file is a FAIL — freshness_sla!); end with "{passed}/{total} files passed contract {contract} v{version}" (both read from the YAML — the gate never hard-codes what it enforces) and sys.exit(1) if anything failed. That exit code is what lets Task 8 automate this.',
                'Hàm main() là phần của bạn. Nó phải: nhận hoặc các đường dẫn file tường minh, hoặc --scale small|full kèm --start và --end; in một dòng [PASS] hoặc [FAIL] cho mỗi file cùng các vấn đề của nó (một file đáng lẽ phải có mà thiếu thì là FAIL — điều khoản freshness_sla!); kết thúc bằng dòng "{passed}/{total} files passed contract {contract} v{version}" (cả hai đọc từ file YAML — gate không bao giờ ghi cứng thứ mà nó thực thi) và gọi sys.exit(1) nếu có bất kỳ file nào trượt. Chính mã thoát đó là thứ cho phép Task 8 tự động hoá việc này.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'All TODOs filled and one small file passes: [PASS] preceded by one [warn] line about payment_method (~0.3% — the contract\'s silence made visible on every run)',
          'Điền đủ mọi phần TODO và một file nhỏ vượt qua: dòng [PASS] có một dòng [warn] về payment_method đứng trước, khoảng 0,3% — chỗ chưa quy định của contract hiện ra ở mọi lần chạy',
        ),
      ],
    },

    {
      id: 'a06-t5',
      num: 5,
      title: bi('Validate the contract itself: pydantic', 'Validate chính contract: pydantic'),
      goal: bi('Nothing validates the validator — until now.', 'Không có gì validate chính bộ validate — cho tới bây giờ.'),
      steps: [
        {
          title: bi('Two shapes of mistake', 'Hai kiểu sai'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'A MISSPELT KEY: someone drafting v1.4.0 types nullible: true. YAML is delighted — it is a perfectly good mapping key. Nothing reads the document as a whole, so the mistake sits there until some line of code happens to touch that key: a KeyError days later that blames YOUR script and never mentions the contract — or, wherever you wrote .get() or if "x" in c, no error at all, just a rule that quietly stopped existing. A gate with one rule silently switched off is worse than no gate, because you still trust it.',
                'KHOÁ VIẾT SAI CHÍNH TẢ: ai đó đang soạn bản 1.4.0 gõ nullible: true. YAML rất hài lòng — đó là một khoá ánh xạ hoàn toàn hợp lệ. Không có gì đọc cả tài liệu như một chỉnh thể, nên lỗi đó nằm im cho tới khi một dòng code nào đó tình cờ chạm vào khoá ấy: một KeyError vài ngày sau, đổ lỗi cho SCRIPT CỦA BẠN và không hề nhắc tới contract — hoặc, ở những chỗ bạn viết .get() hay if "x" in c, thì không có lỗi nào cả, chỉ có một quy tắc lặng lẽ thôi tồn tại. Một gate có một quy tắc bị tắt trong im lặng còn tệ hơn không có gate nào, vì bạn vẫn tin nó.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'A WRONG TYPE: window_days: seven. Nothing complains until the late-corrections arithmetic runs — at file 30 of 45, with a TypeError that names timedelta and never mentions the contract.',
                'KIỂU SAI: window_days: seven. Không ai phàn nàn cho tới khi phép tính cửa sổ sửa trễ chạy — ở file thứ 30 trên 45, với một TypeError gọi tên timedelta và không hề nhắc tới contract.',
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
    negative_allowed: bool          # a truthy STRING here would invert the rule


class Column(Clause):
    name: str
    type: str
    nullable: bool                  # required: 'nullible:' cannot pass as this
    allowed_values: list[str] | None = None
    # ... case, money, references, range, shape, timezone, unique,
    #     warehouse_policy, business_rule, comment - all optional


class Contract(Clause):
    contract: str
    version: str
    status: Literal["draft", "proposed", "agreed", "deprecated"]
    effective_from: date
    delivery: Delivery
    late_corrections: LateCorrections
    columns: list[Column] = Field(alias="schema")   # 'schema' is taken on BaseModel
    quality: Quality
    # Declared, not modelled: nothing in the gate reads them.
    producer: dict[str, Any]
    consumer: dict[str, Any]
    change_management: dict[str, Any]
    business_rules: dict[str, Any]
    slo_reporting: dict[str, Any]`,
            },
            {
              kind: 'glossary',
              items: [
                {
                  term: 'extra="forbid"',
                  means: bi(
                    "The whole point. pydantic's default is to IGNORE unrecognised keys. Misspell a REQUIRED key and you would still get an error, but pointed at the wrong field — nullable is missing, and nobody mentions nullible. Misspell an OPTIONAL one (alowed_values:) and the default swallows it in total silence, exactly like yaml.safe_load.",
                    'Đây mới là điểm mấu chốt. Mặc định của pydantic là BỎ QUA các khoá không nhận ra. Viết sai một khoá BẮT BUỘC thì bạn vẫn nhận được lỗi, nhưng lỗi chỉ vào nhầm trường — nó nói thiếu nullable, và không ai nhắc tới nullible. Viết sai một khoá TUỲ CHỌN (alowed_values:) thì mặc định nuốt chửng nó trong im lặng hoàn toàn, y hệt yaml.safe_load.',
                  ),
                },
                {
                  term: 'Model what the gate reads',
                  means: bi(
                    'producer, consumer, change_management, business_rules and slo_reporting are prose for humans; no check consults them. They are still DECLARED as dict[str, Any] — because with extra="forbid" at the top level, an undeclared block is an error, and a misspelt block name should be one.',
                    'Các khối producer, consumer, change_management, business_rules và slo_reporting là văn xuôi cho con người đọc; không phép kiểm tra nào tra cứu chúng. Nhưng chúng vẫn được KHAI BÁO dưới dạng dict[str, Any] — vì với extra="forbid" ở mức cao nhất, một khối chưa khai báo là một lỗi, và một tên khối viết sai chính tả cũng nên là một lỗi.',
                  ),
                },
                {
                  term: 'alias="schema"',
                  means: bi(
                    'BaseModel.schema is taken by pydantic itself, so the field is columns with alias="schema". Validation still reads the YAML key schema, and — usefully — error paths still SAY schema.',
                    'Thuộc tính BaseModel.schema đã bị chính pydantic chiếm dụng, nên trường này đặt tên là columns với alias="schema". Việc validate vẫn đọc khoá schema trong YAML, và — rất hữu ích — đường dẫn lỗi vẫn NÓI là schema.',
                  ),
                },
                {
                  term: 'negative_allowed: bool',
                  means: bi(
                    'The sharpest one. In a raw dict, a contract saying negative_allowed: "false" hands you the STRING "false", which is truthy in Python: if money["negative_allowed"]: reads it as "negatives are allowed" and the money rule INVERTS. The model returns a real bool or refuses.',
                    'Cái sắc bén nhất. Trong một từ điển thuần, một contract ghi negative_allowed: "false" sẽ trao cho bạn CHUỖI "false", mà chuỗi đó là giá trị đúng trong Python: câu if money["negative_allowed"]: sẽ đọc nó thành "cho phép giá trị âm" và quy tắc về tiền bị ĐẢO NGƯỢC. Mô hình thì hoặc trả về một bool thật, hoặc từ chối.',
                  ),
                },
              ],
            },
          ],
        },
        {
          title: bi('Break it — on a COPY', 'Làm hỏng nó — trên BẢN SAO'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'The signed contract is never edited, not even for a demo — that is the whole ethic of this assignment. The corruption lands in scratch space, like the tampered CSVs of Task 7.',
                'Bản contract đã ký không bao giờ được sửa, kể cả để diễn thử — đó là toàn bộ đạo đức nghề của bài này. Phần làm hỏng rơi vào thư mục tạm, giống như các file CSV bị sửa ở Task 7.',
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
                'Read line 2 twice: yaml.safe_load loaded the broken file WITHOUT A MURMUR, and reported customer_id.nullable = <<GONE>>. That is what your Task 4 gate would have been running on. Then read the error paths. Not "something is wrong with the contract" — schema.1.nullible says SECOND COLUMN of the schema block, key nullible, not permitted, which is an address you can hand back to whoever drafted the amendment. One typo produced two errors, and the wrong type was caught in the same pass instead of 30 files into a sweep.',
                'Đọc dòng thứ hai hai lần: yaml.safe_load đã nạp file hỏng đó mà KHÔNG HÉ RĂNG, và báo customer_id.nullable = <<GONE>>. Đó chính là thứ mà gate ở Task 4 của bạn lẽ ra đã chạy dựa trên. Rồi đọc các đường dẫn lỗi. Không phải "có gì đó sai trong contract" — dòng schema.1.nullible nói rõ CỘT THỨ HAI trong khối schema, khoá nullible, không được phép, và đó là một địa chỉ bạn trao ngược lại được cho người đã soạn amendment. Một lỗi chính tả sinh ra hai lỗi, và kiểu sai bị bắt trong cùng một lượt thay vì tới file thứ 30 mới lộ.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `from work.contract_model import Contract          # new import

def load_contract() -> dict:
    raw = yaml.safe_load(CONTRACT.read_text(encoding="utf-8"))
    Contract.model_validate(raw)      # the gate on the gate: bad contract, no run
    return raw`,
            },
            {
              kind: 'trap',
              body: bi(
                'When NOT to use it. Right here: one small document, parsed once per run. Wrong, loudly, one layer down: a Column-style model per DATA ROW means 82 million Python objects for the full feed — hours of CPU and RAM you do not have, to answer questions DuckDB answers in one scan. pydantic is for config; SQL and frame schemas are for feeds.',
                'Khi nào KHÔNG dùng nó. Đúng chỗ là ở đây: một tài liệu nhỏ, phân tích một lần mỗi lần chạy. Sai chỗ, và sai ồn ào, là ở tầng dưới: một mô hình kiểu Column cho mỗi DÒNG DỮ LIỆU nghĩa là 82 triệu đối tượng Python cho toàn bộ nguồn — hàng giờ CPU và lượng RAM bạn không có, chỉ để trả lời những câu mà DuckDB trả lời trong một lần quét. pydantic dành cho cấu hình; SQL và schema mức khung dữ liệu dành cho nguồn dữ liệu.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('python -m work.contract_model prints the contract\'s real name and version', 'Lệnh python -m work.contract_model in ra đúng tên và version của contract'),
        bi('The typo demo shows yaml.safe_load accepting the broken copy and pydantic rejecting it with schema.1.nullible', 'Bài diễn tập lỗi chính tả cho thấy yaml.safe_load chấp nhận bản sao hỏng còn pydantic từ chối nó kèm schema.1.nullible'),
        bi('The signed contract on disk is untouched', 'Bản contract đã ký trên đĩa không bị đụng tới'),
        bi('contract_check.py now validates the contract through the model before using it', 'File contract_check.py giờ validate contract qua mô hình trước khi dùng nó'),
      ],
    },

    {
      id: 'a06-t6',
      num: 6,
      title: bi('Gate all of month 1 (small)', 'Chạy gate cho cả tháng 1 (small)'),
      goal: bi('45 files, 45 passes.', '45 file, 45 lần đạt.'),
      steps: [
        {
          title: bi('The sweep', 'Lần quét'),
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
                '45 dòng [PASS], mỗi dòng kèm một dòng [warn] về payment_method, và dòng "45/45 files passed contract shopcore_orders_daily v1.3.0" trong khoảng 25 tới 30 giây. Chi phí cho mỗi file là LƯỢT ĐỌC MẪU, không phải kích thước file — nhớ điều đó cho Task 9.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'If a file FAILs, read the cited clause before touching anything — and remember the fix is never "edit the signed contract until green".',
                'Nếu một file bị FAIL, hãy đọc điều khoản được trích dẫn trước khi đụng vào bất cứ thứ gì — và nhớ rằng cách chữa không bao giờ là "sửa contract đã ký cho tới khi xanh".',
              ),
            },
          ],
        },
      ],
      accept: [bi('45/45 PASS at small scale, and the run time is in your journal', '45/45 đạt ở scale small, và thời gian chạy đã có trong journal')],
    },

    {
      id: 'a06-t7',
      num: 7,
      title: bi('Break it on purpose: three tampered files', 'Cố ý làm hỏng: ba file đã bị sửa'),
      goal: bi('You cannot trust a gate you have never seen fail.', 'Bạn không thể tin một gate mà bạn chưa từng thấy nó kích hoạt.'),
      steps: [
        {
          title: bi('Craft three broken copies', 'Tạo ba bản sao hỏng'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Each in its own folder so all three can keep the real file name — they must get PAST the naming check to test the deeper layers. Save as work/make_tampered.py and run once.',
                'Mỗi bản trong một thư mục riêng để cả ba giữ được tên file thật — chúng phải LỌT QUA phép kiểm tra tên file thì mới thử được các tầng sâu hơn. Lưu thành work/make_tampered.py rồi chạy một lần.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `i = header.index("payment_method")     # 1. DROPPED column: it silently vanishes
write("dropped_col", header[:i] + header[i+1:], [r[:i] + r[i+1:] for r in data])

write("added_col", header + ["currency"],      # 2. ADDED column at the end
      [r + ["USD"] for r in data])

j = header.index("order_id")           # 3. TYPE change: BIGINT -> 'ORD-...' string
write("type_change", header,
      [r[:j] + [f"ORD-{int(r[j]):010d}"] + r[j+1:] for r in data])`,
            },
            {
              kind: 'why',
              body: bi(
                'The dropped and added columns are caught at the SCHEMA layer; the type change slips past it — same names, same order! — and is caught by the VALUE layer at 100% cast failure, with \'ORD-…\' examples. You will also see the manifest [warn] fire: scratch copies have no completeness signal, and the gate says so instead of failing ad-hoc checks.',
                'Cột bị bỏ và cột thêm vào bị bắt ở tầng LƯỢC ĐỒ; còn thay đổi kiểu thì lọt qua tầng đó — cùng tên, cùng thứ tự! — và bị tầng GIÁ TRỊ bắt với tỉ lệ ép kiểu thất bại 100%, kèm các ví dụ dạng \'ORD-…\'. Bạn cũng sẽ thấy dòng [warn] về manifest kích hoạt: các bản sao trong thư mục tạm không có completeness signal, và gate nói ra điều đó thay vì cho các file rời trượt.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Not random tampers, either — a new currency column and string order ids are exactly what shopcore ships as "month 2" in A10.',
                'Và đây cũng không phải những kiểu phá hoại ngẫu nhiên — một cột currency mới cùng các order id dạng chuỗi chính xác là thứ shopcore sẽ gửi dưới tên "tháng 2" ở A10.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('0/3 files passed, and each message names the exact problem', '0/3 file đạt, và mỗi thông báo nêu đích danh vấn đề'),
        bi('Journal records which layer caught which tamper', 'Journal ghi lại tầng nào bắt được kiểu phá nào'),
      ],
    },

    {
      id: 'a06-t8',
      num: 8,
      title: bi('Wire the gate into your A05 pipeline', 'Gắn gate vào pipeline A05'),
      goal: bi('A gate you run by hand when you remember is not a gate.', 'Một gate mà bạn chạy tay khi nào nhớ ra thì không phải gate.'),
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
                'Expect core.orders to come out of this holding the rerun day TWICE — plain INSERT is not rerun-safe (A05\'s known limitation, exactly the doubled-counts state its beginner-mistakes list warns about). Do NOT fix it by hand; A07\'s Setup has you drop and rebuild this table with a properly idempotent loader.',
                'Hãy chờ đợi bảng core.orders sau lần này chứa ngày chạy lại HAI LẦN — lệnh INSERT thường không an toàn khi chạy lại, đúng cái giới hạn đã biết của A05 và đúng cái trạng thái đếm gấp đôi mà danh sách lỗi thường gặp của nó đã cảnh báo. ĐỪNG sửa bằng tay; phần Chuẩn bị của A07 sẽ bắt bạn xoá và dựng lại bảng này bằng một bộ nạp bất biến đúng nghĩa.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Then run the same pipeline against the type_change tampered file: give your validate_day() an optional csv_path argument (defaulting to the canonical raw path) so the gate — and only the gate — can be aimed at the tampered copy. NEVER copy a tampered file over a real path under raw/. Confirm the run aborts BEFORE the warehouse is touched (count(*) before and after).',
                'Rồi chạy chính pipeline đó với file bị sửa kiểu type_change: thêm cho hàm validate_day() của bạn một tham số csv_path tuỳ chọn, mặc định là đường dẫn thô chuẩn, để gate — và chỉ gate — được chĩa vào bản sao đã bị sửa. TUYỆT ĐỐI không chép đè file bị sửa lên một đường dẫn thật dưới raw/. Xác nhận lần chạy bị huỷ TRƯỚC KHI warehouse bị đụng tới, bằng cách đếm count(*) trước và sau.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Clean day loads with a PASS line; tampered day aborts pre-load', 'Ngày sạch nạp được kèm dòng PASS; ngày bị sửa bị huỷ trước khi nạp'),
      ],
    },

    {
      id: 'a06-t9',
      num: 9,
      title: bi('The full-scale sweep', 'Quét toàn bộ ở scale full'),
      goal: bi('Twenty times the data, barely more time.', 'Dữ liệu gấp hai mươi lần, thời gian gần như không tăng.'),
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
                'Vẫn 45/45 đạt — tổng cộng dưới một phút, khoảng một giây mỗi file. Các file này nặng chừng 350 MB mỗi cái, gấp hai mươi lần bản nhỏ, vậy mà gate gần như không chậm đi, vì nó lấy mẫu 100.000 dòng rồi DỪNG. Nhìn Task Manager: bộ nhớ gần như không nhúc nhích. Một phép kiểm tra pre-flight phải rẻ tới mức không ai từng bị cám dỗ bỏ qua nó — đó là một yêu cầu thiết kế, không phải thứ có thì tốt.',
              ),
            },
          ],
        },
      ],
      accept: [bi('45/45 PASS at full scale; total time in your journal', '45/45 đạt ở scale full; tổng thời gian đã có trong journal')],
    },

    {
      id: 'a06-t10',
      num: 10,
      title: bi('The change catalogue', 'Bảng phân loại thay đổi'),
      goal: bi('Eight scenarios, each with a bump and a notice period.', 'Tám kịch bản, mỗi cái kèm một mức bump version và notice period.'),
      steps: [
        {
          title: bi('Two worked, six yours', 'Hai cái làm sẵn, sáu cái của bạn'),
          blocks: [
            {
              kind: 'code',
              lang: 'text',
              body: `1. New optional column appended at the end
   -> Non-breaking for name-based readers; breaking for position-based ones
      (our exact-order gate flags it for review). MINOR, 7 days notice.
2. payment_method renamed to payment_type
   -> Breaking - every query naming the column. MAJOR, 30 days notice.
3. order_id becomes 'ORD-…' strings                       ?
4. New column inserted in the MIDDLE                      ?
5. A new status value "on_hold" starts appearing          ?
6. Junk-status rate creeps 0.3% -> 0.8% over a month      ?
7. File naming changes to orders-YYYYMMDD.csv             ?
8. Producer fixes a typo in the description text          ?`,
            },
            {
              kind: 'why',
              body: bi(
                'Think hard about #5 and #6, the sneaky ones. #5 breaks any consumer with exhaustive CASE status ... logic even though the SCHEMA is untouched. #6 breaks nothing YET — it still passes the 1% null_or_invalid_status tolerance — and is exactly the slow drift the stretch-goal history table would reveal.',
                'Hãy nghĩ kỹ về số 5 và số 6, hai cái nham hiểm. Số 5 phá vỡ bất kỳ consumer nào có logic CASE status ... liệt kê đầy đủ, dù LƯỢC ĐỒ không hề bị đụng tới. Số 6 thì CHƯA phá vỡ gì cả — nó vẫn nằm dưới ngưỡng 1% của null_or_invalid_status — và chính là kiểu trôi dạt chậm mà bảng lịch sử ở bài mở rộng sẽ phơi bày ra.',
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
      goal: bi('Turn gaps into clauses. The signed contract stays untouched.', 'Biến gap thành điều khoản. Bản contract đã ký vẫn nguyên.'),
      steps: [
        {
          title: bi('Three parts', 'Ba phần của amendment'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'You draft work/amendment_v1_4_0.md with status: proposed snippets and a rollout note — exactly what you would post in #shopcore-data-changes.',
                'Bạn soạn file work/amendment_v1_4_0.md với các đoạn ở trạng thái proposed cùng một ghi chú triển khai — đúng thứ bạn sẽ đăng trong kênh #shopcore-data-changes.',
              ),
            },
            {
              kind: 'code',
              lang: 'yaml',
              body: `# proposed for v1.4.0 - status: proposed, effective after both sides sign
  - name: order_total
    money:
      transport_locale:
        decimal_separator: "."       # "1234.56" - never "1.234,56"
        thousands_separator: none
        currency_symbols: none       # never "$79.98"`,
            },
            {
              kind: 'text',
              body: bi(
                'That first clause converts the euro-comma and $-prefix GAP into a VIOLATION going forward. Then add ONE MORE clause closing a Task 3 gap of your choice — updated_at timezone and meaning, pinned inner types for items, a null-representation rule for utm, a restatement policy, a hard-fail tolerance for payment_method. One gap is reserved: PII and retention — Task 12 drafts that in full, so pick a different silence here.',
                'Điều khoản đầu tiên đó biến KHOẢNG TRỐNG về dấu phẩy châu Âu và tiền tố $ thành một VI PHẠM kể từ nay về sau. Rồi thêm MỘT điều khoản nữa đóng lại một gap ở Task 3 mà bạn chọn — múi giờ và ý nghĩa của updated_at, ghim kiểu bên trong cho items, một quy tắc biểu diễn giá trị rỗng cho utm, một chính sách công bố lại, hay một ngưỡng trượt hẳn cho payment_method. Có một gap đã bị giữ chỗ: PII và thời hạn lưu trữ — Task 12 soạn nó đầy đủ, nên hãy chọn một chỗ chưa quy định khác ở đây.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'The rollout note, three sentences: the version bump and WHY IT IS MINOR (it adds constraints that match current intent; no consumer code breaks; it is more than a wording PATCH), the notice period per change_management, and the status lifecycle step (proposed until countersigned — then a data engineer may finally rely on it).',
                'Ghi chú triển khai, ba câu: mức bump version và VÌ SAO NÓ LÀ MINOR (nó thêm ràng buộc khớp với ý định hiện tại; không code nào của consumer bị vỡ; và nó nhiều hơn một bản PATCH chỉ sửa câu chữ), notice period theo change_management, và bước trong vòng đời trạng thái (là proposed cho tới khi được ký duyệt — lúc đó một kỹ sư dữ liệu mới được phép dựa vào nó).',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Paste-check that your snippets parse: drop each one into a scratch .yaml file and run it through yaml.safe_load. A proposed clause with a syntax error is an unreviewable clause.',
                'Kiểm tra các đoạn của bạn có phân tích được cú pháp không: đổ từng cái vào một file .yaml nháp rồi cho chạy qua yaml.safe_load. Một điều khoản đề xuất mà lỗi cú pháp là một điều khoản không duyệt được.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('Both clauses parse as YAML', 'Cả hai điều khoản phân tích được dưới dạng YAML'),
        bi('The rollout note names bump, notice, and status without hedging', 'Ghi chú triển khai nêu rõ mức nâng, notice period, và trạng thái, không nói nước đôi'),
      ],
    },

    {
      id: 'a06-t12',
      num: 12,
      title: bi('PII: the clause that cannot stay on paper', 'PII: điều khoản không thể chỉ nằm trên giấy'),
      goal: bi('Close the one silence that hands YOU cleanup work.', 'Đóng lại chỗ chưa quy định duy nhất giao việc dọn dẹp cho CHÍNH BẠN.'),
      steps: [
        {
          title: bi('Why this one is different in kind', 'Vì sao gap này khác hẳn'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'The customers feed carries email — PII: data that points at a real, findable person. Every other silence on your list risks wrong numbers; this one risks a breach notification. And look at your own warehouse: core.customers has stored raw email addresses since A03. Nobody decided that — no clause allows it, none forbids it, so the warehouse became a PII store BY ACCIDENT.',
                'Nguồn dữ liệu khách hàng mang theo cột email — đó là PII: dữ liệu chỉ tới một con người thật, tìm được. Mọi chỗ chưa quy định khác trong danh sách của bạn chỉ rủi ro cho ra con số sai; cái này rủi ro dẫn tới một thông báo rò rỉ dữ liệu. Và hãy nhìn vào chính kho của bạn: bảng core.customers đã lưu địa chỉ email thô từ A03 tới giờ. Không ai quyết định điều đó — không điều khoản nào cho phép, cũng không điều khoản nào cấm, nên cái kho trở thành nơi chứa PII MỘT CÁCH TÌNH CỜ.',
              ),
            },
            {
              kind: 'code',
              lang: 'yaml',
              body: `# proposed for v1.4.0 - new top-level block (would sit after business_rules;
# its long-term home is a shopcore_customers contract, which does not exist yet)
data_classification:
  default: internal              # any column not named below
  pii:
    - feed: shopcore_customers
      column: email
      class: pii_direct_identifier
      retention: >
        The raw value is never persisted in the warehouse. Only the
        irreversible derivative md5(lower(trim(email))) is stored, as
        email_hash, and it lives exactly as long as the customer row does.
      allowed_usage: >
        Joins and duplicate detection via email_hash only. No export, no
        display, no contact lists - any of those needs a new agreement.`,
            },
            {
              kind: 'text',
              body: bi(
                'Two things to notice. WHERE IT LIVES: the honest home — a customers-feed contract — does not exist yet, so the block sits in the only signed agreement between the teams. WHAT THE BUMP COSTS: v1.4.0 stays MINOR — not one byte of any feed changes — yet it hands the consumer a migration. Semver sizes the PROMISE, not the work it creates.',
                'Hai điều cần để ý. NÓ NẰM Ở ĐÂU: ngôi nhà trung thực của nó — một contract cho feed customers — chưa tồn tại, nên khối này ngồi tạm trong bản thoả thuận duy nhất đã ký giữa hai đội. LẦN NÂNG NÀY TỐN GÌ: bản 1.4.0 vẫn là MINOR — không một byte nào trong bất kỳ nguồn dữ liệu nào thay đổi — vậy mà nó giao cho consumer một migration. Semver đo kích thước của LỜI HỨA, không đo khối lượng công việc mà nó tạo ra.',
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
                'Điều khoản này hứa hai điều — phơi nhiễm biến mất, khả năng vẫn giữ — nên hãy ĐO KHẢ NĂNG ĐÓ TRƯỚC KHI bạn phá huỷ cột, nếu không thì bạn không chứng minh được là đã giữ được nó.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `-- BEFORE: how much duplicate-email signal does the raw column carry?
SELECT count(email) - count(DISTINCT email) AS dup_email_rows
FROM core.customers;                            -- small: 180

-- THE REBUILD: same table - but the raw value does not survive it
CREATE OR REPLACE TABLE core.customers AS
SELECT customer_id, name,
       md5(lower(trim(email))) AS email_hash,   -- canonicalize INSIDE the hash
       country, city, signup_ts, is_active,
       _data_date, _run_id
FROM core.customers;

-- AFTER, promise half 1 - exposure gone:
DESCRIBE core.customers;              -- email_hash VARCHAR, no email anywhere

-- AFTER, promise half 2 - capability kept:
SELECT count(email_hash) - count(DISTINCT email_hash) AS dup_hash_rows
FROM core.customers;                            -- small: 180 - identical`,
            },
            {
              kind: 'why',
              body: bi(
                'Why md5(lower(trim(email))) and not just md5(email)? The expression is now a CONTRACT CLAUSE — it must not depend on A03\'s cleaning staying upstream of it forever, and md5(\'John@X.com\') ≠ md5(\'john@x.com\'). An un-canonicalized hash silently loses the very dedupe capability the clause promises. Hash the canonical form, always, at the hash site.',
                'Vì sao phải là md5(lower(trim(email))) chứ không phải md5(email)? Vì biểu thức này giờ là một ĐIỀU KHOẢN HỢP ĐỒNG — nó không được phép phụ thuộc vào việc phần làm sạch của A03 mãi mãi nằm ở phía trên nó, và md5(\'John@X.com\') khác md5(\'john@x.com\'). Một phép hash chưa canonicalize sẽ âm thầm đánh mất đúng cái khả năng khử trùng mà điều khoản đó hứa hẹn. Hãy hash dạng chuẩn, luôn luôn, ngay tại chỗ hash.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'Run the rebuild a SECOND time and it fails — Binder Error: Referenced column "email" not found — and that error is the clause WORKING: no raw email left to re-hash, or to leak. Repeat against the full-scale warehouse too: 1,200,000 rows, and the dup count is 3,594 before and after.',
                'Chạy lệnh dựng lại LẦN THỨ HAI thì nó hỏng — Binder Error: Referenced column "email" not found — và chính lỗi đó là điều khoản đang HOẠT ĐỘNG: không còn email thô nào để hash lại, cũng không còn gì để rò rỉ. Làm lại với kho ở scale full: 1.200.000 dòng, và số trùng là 3.594 cả trước lẫn sau.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Hash for analytics, mask for display, tokenize for reversibility. This clause has a future too: in A15, stg_shopcore__customers computes the same email_hash straight from the raw feed and never selects the raw column — the clause enforced by construction in every dbt rebuild.',
                'Hash để phân tích, che để hiển thị, mã hoá thành token khi cần lấy lại bản gốc. Điều khoản này cũng có tương lai: ở A15, mô hình stg_shopcore__customers tính đúng email_hash đó thẳng từ nguồn thô và không bao giờ chọn cột thô — điều khoản được thực thi ngay từ cấu trúc, ở mọi lần dbt dựng lại.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('The clause parses as YAML inside the amendment', 'Điều khoản phân tích được dưới dạng YAML bên trong amendment'),
        bi('DESCRIBE core.customers shows email_hash and no email', 'Lệnh DESCRIBE core.customers cho thấy email_hash và không còn email'),
        bi('The duplicate count via email_hash equals the count measured on the raw column before the rebuild (small: 180 = 180)', 'Số trùng tính qua email_hash bằng đúng số đo được trên cột thô trước khi dựng lại (bộ nhỏ: 180 bằng 180)'),
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
                'Small scale, any day: the STRICT written format for order_ts is broken by roughly 0.7% of rows (0.4% DD/MM + 0.3% ISO-T + a trace of impossible dates) — violations you reported in Task 2 — but truly UNPARSEABLE rows sit near 0.03%, comfortably under the 0.5% hard-fail tolerance. Junk status runs ~0.2–0.3% (tolerance 1%), bad totals ~0.8% (tolerance 1%), payment_method ~0.3% (warn only). That headroom is the design: normal dirt passes, CHANGE trips the gate.',
                'Quy mô nhỏ, ngày nào cũng vậy: định dạng viết CHẶT của order_ts bị khoảng 0,7% số dòng phá vỡ (0,4% dạng DD/MM cộng 0,3% dạng ISO-T cộng một chút ngày bất khả thi) — đó là các violation bạn đã báo cáo ở Task 2 — nhưng những dòng thật sự KHÔNG PHÂN TÍCH ĐƯỢC chỉ chừng 0,03%, thấp hơn ngưỡng trượt hẳn 0,5% khá thoải mái. Trạng thái rác chạy khoảng 0,2 tới 0,3% (ngưỡng 1%), tổng tiền hỏng khoảng 0,8% (ngưỡng 1%), payment_method khoảng 0,3% (chỉ cảnh báo). Khoảng dôi đó chính là thiết kế: rác bình thường thì lọt qua, còn SỰ THAY ĐỔI mới làm gate kích hoạt.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `A05 finding                              | Class      | Clause / silence
-----------------------------------------|------------|------------------------------
negative order_total                     | violation  | money.negative_allowed: false
"N/A"/empty order_total                  | violation  | DECIMAL promised, nullable: false
junk / padded / wrong-case status        | violation  | allowed_values + case
payment_method casing variants           | violation  | allowed_values (no hard-fail tol!)
DD/MM + ISO-T order_ts, impossible dates | violation  | written format pinned
Excel-float customer_id "123456.0"       | violation  | BIGINT promised
total != items sum beyond ±0.01          | violation  | order_total.business_rule
orphan customer_id / SKU                 | violation  | references + tolerances
within-file exact re-sends (<=0.2%)      | TOLERATED  | at-least-once delivery
European comma / $-prefix totals         | GAP        | money silent on transport locale
string-typed "qty":"2" in items          | GAP        | items "number" not pinned (# NOTE)
utm null vs "none" vs absent key         | GAP        | null representation unstated`,
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
SELECT count(*) FROM (SELECT 1 FROM core.customers
                      GROUP BY email_hash HAVING count(*) > 1);       -- 180
-- full scale: 1,200,000 / 3,594 / 3,594`,
            },
            {
              kind: 'text',
              body: bi(
                'And prove the signed file survived: git status shows contracts/ unchanged, and the broken copy sits in <DATA_ROOT>/tmp/contract_typo/ where it belongs.',
                'Và chứng minh bản đã ký còn sống sót: git status cho thấy thư mục contracts/ không đổi, còn bản sao hỏng thì nằm trong <DATA_ROOT>/tmp/contract_typo/, đúng chỗ của nó.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi('45/45 PASS at both scales; 0/3 tampered files pass', '45/45 đạt ở cả hai quy mô; 0/3 file bị sửa đạt'),
        bi('contracts/ byte-for-byte unchanged in git status', 'Thư mục contracts/ không đổi một byte nào theo git status'),
      ],
    },

    {
      id: 'a06-mistakes',
      title: bi('Common beginner mistakes', 'Lỗi thường gặp của người mới'),
      goal: bi('Six traps; the first is an ethics failure, not a technical one.', 'Sáu cái bẫy; cái đầu tiên là lỗi nguyên tắc, không phải lỗi kỹ thuật.'),
      steps: [
        {
          title: bi('The six', 'Sáu lỗi'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'Editing the signed contract to make a red gate green. A contract edit is a producer conversation plus a version bump — the amendment path. Quietly widening a tolerance is a fig leaf over a broken promise.',
                'Sửa contract đã ký để làm một gate đang đỏ chuyển sang xanh. Sửa contract đồng nghĩa với một cuộc trò chuyện với producer cộng một lần bump version — đó là con đường amendment. Lặng lẽ nới rộng một ngưỡng tolerance chỉ là chiếc lá che một lời hứa đã bị phá vỡ.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Classifying every surprise as a violation. Check that the clause actually EXISTS before writing the incident note. Blaming shopcore for a promise never made burns credibility you will need for real incidents.',
                'Phân loại mọi bất ngờ thành violation. Hãy kiểm tra xem điều khoản đó có THẬT SỰ TỒN TẠI không trước khi viết incident note. Đổ lỗi cho shopcore về một lời hứa chưa bao giờ được đưa ra sẽ đốt hết uy tín mà bạn cần dành cho những sự cố thật.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Trusting the sniffer as the contract. Auto-detected types drift with dirt — you saw customer_id become DOUBLE and updated_at grow a timezone. Pin names and order exactly; probe types with TRY_CAST rates against tolerances.',
                'Tin sniffer như tin contract. Kiểu tự phát hiện sẽ trôi theo rác — bạn đã thấy customer_id thành DOUBLE và updated_at mọc thêm một múi giờ. Hãy ghim tên và thứ tự thật chính xác; còn kiểu thì dò bằng tỉ lệ TRY_CAST reconcile với ngưỡng tolerance.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Forgetting NULL in enum checks. Empty CSV fields arrive as SQL NULL, and status NOT IN (...) is NULL (not true!) for NULLs — junk silently passes.',
                'Quên mất NULL trong các phép kiểm tra tập giá trị. Ô CSV rỗng về tới nơi dưới dạng NULL của SQL, và biểu thức status NOT IN (...) trả về NULL chứ không phải true đối với các giá trị NULL — thế là rác lọt qua trong im lặng.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Running the gate after loading. Then it is just A05 with extra steps. The entire value is refusing BEFORE bad data enters the warehouse.',
                'Chạy gate sau khi đã nạp. Vậy thì nó chỉ là A05 với thêm vài bước thừa. Toàn bộ giá trị nằm ở việc từ chối TRƯỚC KHI dữ liệu xấu vào kho.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Scanning whole files in the gate. Without LIMIT sample_rows the full-scale sweep reads ~16 GB instead of a few hundred MB. Expensive gates get skipped.',
                'Quét trọn file trong gate. Không có LIMIT sample_rows thì lần quét ở scale full đọc khoảng 16 GB thay vì vài trăm MB. Gate đắt đỏ thì sẽ bị bỏ qua.',
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
          title: bi('1 — Contract-check history', '1 — Lịch sử kiểm tra contract'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Log every gate result (date, file, check, rate, tolerance, pass) to ops.contract_checks in warehouse.duckdb. A rate climbing toward its tolerance over weeks is scenario #6 made visible.',
                'Ghi mọi kết quả của gate (ngày, file, phép kiểm tra, tỉ lệ, ngưỡng, đạt hay không) vào bảng ops.contract_checks trong warehouse.duckdb. Một tỉ lệ leo dần về phía ngưỡng của nó qua nhiều tuần chính là kịch bản số 6 được phơi bày ra.',
              ),
            },
          ],
        },
        {
          title: bi('2 — Contract the dimensions', '2 — Làm contract cho các dimension'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Draft contracts/shopcore_customers.contract.yaml (status: draft) using the README\'s per-column interrogation, and extend the checker. Harder than it looks: what does the money/timestamp checklist say about signup_ts, when the DATA ITSELF admits three formats? What tolerance is honest?',
                'Soạn file contracts/shopcore_customers.contract.yaml ở trạng thái draft, dùng phần thẩm vấn từng cột trong README, rồi mở rộng bộ kiểm tra. Khó hơn vẻ ngoài của nó: bảng kiểm tra về tiền và thời gian nói gì về signup_ts, khi mà CHÍNH DỮ LIỆU thừa nhận có ba định dạng? Ngưỡng dung sai nào mới là trung thực?',
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
                'Lấy N dòng đầu là ổn ở đây vì rác rải đều — nhưng một file ĐÃ SẮP XẾP sẽ đánh lừa được nó. Thử dùng USING SAMPLE rồi so sánh.',
              ),
            },
          ],
        },
      ],
      accept: [vi('Hoàn thành ít nhất một mục và ghi kết luận vào journal')],
    },
  ],
}
