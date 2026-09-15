import type { AssignmentSpec } from '../types'
import { bi } from '../types'
import { a13Terms, a13Theory } from './a13.theory'

export const a13: AssignmentSpec = {
  id: 'a13',
  code: 'A13',
  title: bi('Resource monitoring & optimization', 'Đo và tối ưu tài nguyên'),
  summary: bi(
    'Build a monitor that watches a whole process tree, then use it to catch DuckDB trading disk for RAM, walk pandas up to the OOM cliff with a rope on, and answer the production question: what is the smallest memory limit this job can live in?',
    'Bạn sẽ tự dựng một cái monitor theo dõi cả cây tiến trình, rồi dùng nó để bắt tại trận cảnh DuckDB đem đĩa đổi lấy RAM, dẫn pandas ra sát mép vực OOM nhưng có buộc dây, và trả lời câu hỏi rất sản xuất: cái job này sống được trong mức bộ nhớ nhỏ nhất là bao nhiêu?',
  ),
  estHours: 4,
  difficulty: 4,
  outcome: bi(
    'You can measure where a run\'s RAM, CPU and disk IO actually went instead of guessing, prove that spill lands on the data volume and not the OS drive, name the smallest memory limit your daily load can live in, and turn all of it into a yearly dollar figure.',
    'Sau bài này bạn đo được RAM, CPU và IO đĩa của một lần chạy đã đi đâu thay vì ngồi đoán, chứng minh được phần spill rơi vào ổ dữ liệu chứ không phải ổ hệ điều hành, gọi tên được mức bộ nhớ nhỏ nhất mà tác vụ nạp hằng ngày sống được, và quy hết mấy thứ đó ra một con số tiền cho mỗi năm.',
  ),
  theory: a13Theory,
  terms: a13Terms,
  tasks: [
    /* ═══════════════ T0 — SETUP ═══════════════ */
    {
      id: 'a13-t0',
      title: bi('Setup', 'Chuẩn bị'),
      goal: bi(
        'Two terminals, 25 GB of headroom, and a memory limit you are allowed to change.',
        'Hai terminal, 25 GB chỗ trống, và một cái memory limit mà lần này bạn được phép đổi.',
      ),
      steps: [
        {
          title: bi('What you need in place', 'Những thứ phải có sẵn'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'A12 done, the full 69-day canonical lake from A10 and A11 on disk, both scales of raw data generated, and roughly 25 GB free on the data drive — the spill lab needs it.',
                'Bạn cần đã xong A12, có sẵn trên đĩa toàn bộ canonical lake 69 ngày từ A10 và A11, đã sinh dữ liệu thô ở cả hai scale, và còn trống chừng 25 GB trên ổ dữ liệu, vì phần thí nghiệm spill cần ngần ấy.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Two PowerShell windows at the repo root with the venv active — one runs workloads, one watches — plus Task Manager open on the Details tab.',
                'Hãy mở hai cửa sổ PowerShell tại thư mục gốc repo với venv đã kích hoạt, một cửa sổ để chạy, một cửa sổ để canh, cùng với Task Manager mở ở tab Details.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Short on space? Everything under lake/.trash/ (the retired dirs from A09 and A10, both scales) and tmp/backfill_stage/ from A12 is safe to delete now. Keep raw/, the current orders_v= lake and warehouse.duckdb — later assignments need all three.',
                'Thiếu chỗ? Mọi thứ nằm dưới lake/.trash/, tức các thư mục đã nghỉ hưu từ A09 và A10 ở cả hai scale, cùng với tmp/backfill_stage/ từ A12, giờ xoá được hết. Nhưng hãy giữ lại raw/, thư mục lake orders_v= hiện hành và file warehouse.duckdb, vì các bài sau còn cần cả ba.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'The memory limit IS today\'s experiment: set it per task instead of the usual fixed 8GB. What never changes is the rest of the convention block — temp_directory on the data volume, and threads=8.',
                'Cái memory limit CHÍNH LÀ thí nghiệm của hôm nay: hãy đặt nó riêng cho từng task thay vì để cố định 8GB như mọi khi. Thứ không bao giờ đổi là phần còn lại của khối quy ước: temp_directory nằm trên ổ dữ liệu, và threads=8.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `SET memory_limit = '<per-task>'; SET threads = 8;
SET temp_directory = '<DATA_ROOT>/tmp';`,
            },
            {
              kind: 'why',
              body: bi(
                'Develop every script on small first, where a run takes seconds, then measure on full for the record. Each task below says which scale its numbers refer to.',
                'Hãy dựng mọi script ở scale small trước, nơi mỗi lần chạy chỉ mất vài giây, rồi mới đo ở full để lấy số chính thức. Mỗi task dưới đây đều nói rõ con số của nó thuộc scale nào.',
              ),
            },
          ],
        },
        {
          title: bi('Git ritual', 'Nếp git'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `git switch -c a13-resource-monitoring
# commit sau mỗi task có đánh số:
git commit -m "A13 task 4: spill lab"
# merge về main khi Definition of Done xanh hết`,
            },
            {
              kind: 'trap',
              body: bi(
                'Every listing today that imports lib must run from the repo root with python -m work.<name>. Running the file directly from inside work/ gives an ImportError that looks like a missing package — the same trap as A03 and A11.',
                'Mọi đoạn code hôm nay có import lib đều phải chạy từ thư mục gốc repo bằng python -m work.<tên>. Chạy thẳng file từ bên trong thư mục work/ sẽ cho một lỗi ImportError trông y như thiếu thư viện, đúng cái bẫy đã gặp ở A03 và A11.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Branch created, ~25 GB free on the data drive, two terminals and Task Manager open',
          'Đã tạo nhánh, ổ dữ liệu còn trống chừng 25 GB, đã mở hai terminal và Task Manager',
        ),
      ],
    },

    /* ═══════════════ T1 ═══════════════ */
    {
      id: 'a13-t1',
      num: 1,
      title: bi('Build the monitor', 'Dựng cái monitor'),
      goal: bi(
        'A wrapper that runs any command, samples its whole process tree, and writes a CSV.',
        'Một lớp bọc chạy được câu lệnh bất kỳ, lấy mẫu cả cây tiến trình của nó, rồi ghi ra một file CSV.',
      ),
      steps: [
        {
          title: bi('Save work/resmon.py', 'Lưu file work/resmon.py'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Read it before you run it — the two comments marked important are the difference between a monitor that works and one that lies.',
                'Hãy đọc nó trước khi chạy, vì hai đoạn chú thích được đánh dấu important chính là khác biệt giữa một cái monitor chạy được và một cái monitor nói dối.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `"""resmon.py -- chạy một câu lệnh, lấy mẫu tài nguyên của nó, ghi ra CSV.

Cách dùng (mọi thứ sau dấu -- là câu lệnh cần chạy và theo dõi):
    python work/resmon.py --out monitor.csv -- python my_pipeline.py --date 2026-06-05
"""
import argparse, csv, subprocess, sys, time
from pathlib import Path

import psutil


class ProcessTree:
    """Lấy mẫu một tiến trình và toàn bộ tiến trình con của nó. QUAN TRỌNG:
    giữ ĐÚNG MỘT đối tượng psutil.Process cho mỗi pid suốt cả lần chạy --
    cpu_percent(interval=None) đo "CPU kể từ lần gọi trước trên chính đối
    tượng này", nên một đối tượng mới tinh sẽ luôn báo 0."""

    def __init__(self, pid: int):
        self.cache: dict[int, psutil.Process] = {pid: psutil.Process(pid)}
        self.root_pid = pid

    def sample(self) -> dict | None:
        root = self.cache.get(self.root_pid)
        if root is None:
            return None
        try:
            for child in root.children(recursive=True):
                self.cache.setdefault(child.pid, child)
        except psutil.NoSuchProcess:
            return None                       # câu lệnh đã thoát rồi
        rss, cpu, read_b, write_b, alive = 0, 0.0, 0, 0, 0
        for pid, p in list(self.cache.items()):
            try:
                with p.oneshot():             # gom syscall thành một lượt cho mỗi tiến trình
                    rss += p.memory_info().rss
                    cpu += p.cpu_percent(interval=None)
                    io = p.io_counters()
                    read_b += io.read_bytes
                    write_b += io.write_bytes
                    alive += 1
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                del self.cache[pid]           # tiến trình đó đã thoát
        return {"rss": rss, "cpu_pct": round(cpu, 1),
                "read_bytes": read_b, "write_bytes": write_b, "nprocs": alive}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="monitor.csv")
    ap.add_argument("cmd", nargs=argparse.REMAINDER)
    args = ap.parse_args()
    cmd = args.cmd[1:] if args.cmd and args.cmd[0] == "--" else args.cmd
    if not cmd:
        ap.error("phải đưa một câu lệnh sau dấu --")

    child = subprocess.Popen(cmd)
    tree = ProcessTree(child.pid)
    t0 = time.time()
    rows: list[dict] = []
    while child.poll() is None:
        snap = tree.sample()
        if snap is not None:
            snap["t_s"] = round(time.time() - t0, 2)
            rows.append(snap)
        time.sleep(0.5)                       # khoảng lấy mẫu
    wall = time.time() - t0

    with Path(args.out).open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["t_s", "rss", "cpu_pct",
                                          "read_bytes", "write_bytes", "nprocs"])
        w.writeheader()
        w.writerows(rows)

    if not rows:
        print("resmon: câu lệnh kết thúc trước cả mẫu đầu tiên")
        return child.returncode
    # QUAN TRỌNG: số cpu_percent() đầu tiên luôn là 0 -- bỏ mẫu số một đi
    cpu_rows = rows[1:] or rows
    print("--- resmon summary ---")
    print(f"wall clock : {wall:8.1f} s")
    print(f"peak RSS   : {max(r['rss'] for r in rows) / 2**30:8.2f} GB")
    print(f"avg CPU    : {sum(r['cpu_pct'] for r in cpu_rows) / len(cpu_rows):8.0f} %"
          "   (100 = một nhân chạy hết)")
    # lấy max chứ không lấy mẫu cuối: worker thoát ra là bộ đếm IO của nó rời khỏi tổng
    print(f"disk read  : {max(r['read_bytes'] for r in rows) / 2**30:8.2f} GB")
    print(f"disk write : {max(r['write_bytes'] for r in rows) / 2**30:8.2f} GB")
    print(f"samples    : {len(rows):8d}   -> {args.out}")
    return child.returncode


if __name__ == "__main__":
    sys.exit(main())`,
            },
            {
              kind: 'why',
              body: bi(
                'Two rules hide in there. Cache one Process object per pid, or cpu_percent reports 0 forever and your worker pool looks idle while eight cores burn. And report the MAX of the summed read_bytes, not the last sample — when a worker exits, its counters leave the sum and the total appears to go backwards.',
                'Có hai quy tắc nấp trong đó. Một là cache mỗi pid một đối tượng Process, nếu không thì cpu_percent báo 0 vĩnh viễn và cái pool worker trông như đang ngồi chơi trong lúc tám nhân đang cháy. Hai là báo giá trị LỚN NHẤT của tổng read_bytes chứ không phải mẫu cuối cùng, vì khi một worker thoát thì bộ đếm của nó rời khỏi phép cộng và tổng số trông như đi giật lùi.',
              ),
            },
          ],
        },
        {
          title: bi('Smoke test', 'Chạy thử cho chắc'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `python work\\resmon.py --out work\\mon_test.csv -- python -c "import time; x = bytearray(300*2**20); time.sleep(3)"`,
            },
            {
              kind: 'expect',
              body: bi(
                'The summary prints, peak RSS is roughly 0.3 GB — that is the bytearray — and work\\mon_test.csv has one row per half second, so six or seven rows.',
                'Bảng tổng kết hiện ra, đỉnh RSS chừng 0,3 GB tức đúng cái bytearray, và file work\\mon_test.csv có mỗi nửa giây một dòng, tức là sáu hay bảy dòng.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'resmon runs any command, tracks children, writes a valid CSV, and prints a plausible summary',
          'resmon chạy được câu lệnh bất kỳ, theo dõi được các tiến trình con, ghi ra CSV hợp lệ và in ra bảng tổng kết hợp lý',
        ),
      ],
    },

    /* ═══════════════ T2 ═══════════════ */
    {
      id: 'a13-t2',
      num: 2,
      title: bi('Analyze the monitor CSV with DuckDB', 'Phân tích file CSV đo được bằng DuckDB'),
      goal: bi(
        'Your monitor emits CSV. You analyze CSV for a living. Connect the dots.',
        'Cái monitor của bạn nhả ra CSV. Bạn thì sống bằng nghề phân tích CSV. Nối hai đầu lại.',
      ),
      steps: [
        {
          title: bi('The starter query', 'Câu query mở màn'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT
  round(max(rss) / pow(2,30), 2)          AS peak_rss_gb,
  round(avg(cpu_pct), 0)                  AS avg_cpu_pct,
  round(max(read_bytes) / pow(2,30), 2)   AS disk_read_gb,
  round(max(t_s), 1)                      AS wall_s
FROM read_csv('work/mon_test.csv', header=true);`,
            },
            {
              kind: 'text',
              body: bi(
                'Then write two more yourself — practice, not new syntax. Peak RSS per 30-second bucket, with CAST(t_s/30 AS INTEGER)*30 and a GROUP BY. And seconds spent above 4 GB: each row is one 0.5 s sample, so count(*) * 0.5 with WHERE rss > 4*pow(2,30).',
                'Rồi tự viết thêm hai câu nữa, phần này là luyện tay chứ không có cú pháp mới. Câu một: đỉnh RSS theo từng khoảng 30 giây, dùng CAST(t_s/30 AS INTEGER)*30 rồi GROUP BY. Câu hai: số giây nằm trên 4 GB, mỗi dòng là một mẫu 0,5 giây nên lấy count(*) * 0.5 với điều kiện WHERE rss > 4*pow(2,30).',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Using your own pipeline exhaust as data has a name: dogfooding. A graph you stared at in Task Manager cannot be diffed against last week; a CSV can.',
                'Việc lấy chính khí thải của pipeline mình làm dữ liệu có tên riêng là dogfooding. Một cái biểu đồ bạn ngồi nhìn trong Task Manager thì không đem so với tuần trước được, còn một file CSV thì được.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'From SQL alone you can say what the peak RSS was and in which 30-second window it happened',
          'Chỉ bằng SQL, bạn nói được đỉnh RSS là bao nhiêu và nó rơi vào khoảng 30 giây nào',
        ),
      ],
    },

    /* ═══════════════ T3 ═══════════════ */
    {
      id: 'a13-t3',
      num: 3,
      title: bi('Point it at your real pipeline', 'Chĩa nó vào pipeline thật của bạn'),
      goal: bi(
        'Profile the things you actually built — sequential A11, then parallel A12. Full scale.',
        'Đo chính những thứ bạn đã dựng: bản tuần tự của A11, rồi bản song song của A12. Ở scale full.',
      ),
      steps: [
        {
          title: bi('Wrap both runners', 'Bọc cả hai runner'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `# một ngày qua pipeline theo ngày của A11 (--force để chạy lại ngày vốn đã xanh)
python work\\resmon.py --out work\\mon_seq.csv -- python -m work.runner --scale full --start 2026-06-05 --end 2026-06-05 --force

# một tuần qua backfill song song của A12, với cấu hình worker bạn đã chọn (nhớ chuyển SCALE sang "full")
python work\\resmon.py --out work\\mon_par.csv -- python work\\parallel_runner.py --start 2026-06-01 --end 2026-06-07 --workers 4 --threads 2 --mem 3GB`,
            },
            {
              kind: 'why',
              body: bi(
                'resmon sees DuckDB because DuckDB works inside your Python process. The parallel workers are picked up as children — the nprocs column is the proof.',
                'resmon nhìn thấy DuckDB là vì DuckDB làm việc ngay bên trong tiến trình Python của bạn. Còn các worker song song thì được nhặt lên với tư cách tiến trình con, và cột nprocs chính là bằng chứng.',
              ),
            },
          ],
        },
        {
          title: bi('Three questions, answered from the CSVs', 'Ba câu hỏi, trả lời bằng chính hai file CSV'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'One: peak RSS of the parallel run against your A12 paper budget — how close did the paper come? Two: of the 800% CPU available, how much did each run actually use? Three: is the sequential run compute-bound, meaning high CPU, or IO-bound, meaning low CPU while read_bytes keeps climbing?',
                'Câu một: đỉnh RSS của lần chạy song song so với ngân sách bạn tính trên giấy ở A12, tờ giấy đó đoán sát tới đâu? Câu hai: trong 800% CPU có sẵn thì mỗi lần chạy dùng thật bao nhiêu? Câu ba: lần chạy tuần tự nghẽn ở tính toán, tức CPU cao, hay nghẽn ở IO, tức CPU thấp trong khi read_bytes cứ leo?',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Both CSVs exist and the three answers are in journal.md',
          'Có đủ hai file CSV và ba câu trả lời nằm trong journal.md',
        ),
      ],
    },

    /* ═══════════════ T4 ═══════════════ */
    {
      id: 'a13-t4',
      num: 4,
      title: bi('The spill lab: disk traded for RAM', 'Thí nghiệm spill: đem đĩa đổi lấy RAM'),
      goal: bi(
        'Sort 82 million rows in 8 GB, then in 4, then in 1, and watch what the engine does instead of dying.',
        'Sort 82 triệu dòng trong 8 GB, rồi 4 GB, rồi 1 GB, và xem engine làm gì thay vì chết.',
      ),
      steps: [
        {
          title: bi('Save work/spill_lab.py', 'Lưu file work/spill_lab.py'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `"""spill_lab.py -- memory_limit đổi thì phép sort toàn bộ lịch sử đổi ra sao?"""
from pathlib import Path
import threading
import time
import duckdb

from lib.labpaths import lake_dir, tmp_dir

# lake có version của A10 -- sửa "orders_v=*" nếu tên thư mục của bạn khác.
# hive_partitioning sẽ bịa ra một cột orders_v từ tên thư mục; hôm nay vô hại.
LAKE = (lake_dir("full") / "orders_v=*").as_posix()
TMP = tmp_dir("full")
OUT = (TMP / "sorted_orders.parquet").as_posix()

for limit in ["8GB", "4GB", "1GB"]:
    con = duckdb.connect()                    # mỗi lần chạy một connection mới
    con.execute(f"SET memory_limit='{limit}'; SET threads=8;")
    con.execute(f"SET temp_directory='{TMP.as_posix()}'; SET preserve_insertion_order=false;")
    # đỉnh spill, lấy từ chính sổ sách của engine: một cursor thứ hai poll
    # duckdb_temporary_files() trong lúc sort chạy -- vòng canh bên PowerShell
    # không thấy được kích thước đang ghi dở (một cái dở của Windows, giải thích bên dưới)
    peak, done = 0, threading.Event()
    def watch():
        global peak
        poller = con.cursor()                 # cursor thứ hai trên CÙNG database
        while not done.is_set():
            rows = poller.execute("SELECT size FROM duckdb_temporary_files()").fetchall()
            peak = max(peak, sum(s for (s,) in rows))
            time.sleep(0.5)
    t = threading.Thread(target=watch)
    t.start()
    t0 = time.time()
    status = "ok"
    try:
        con.execute(f"""
            COPY (SELECT *
                  FROM read_parquet('{LAKE}/*/*.parquet', hive_partitioning=true)
                  ORDER BY customer_id, order_ts)
            TO '{OUT}' (FORMAT parquet)
        """)
    except duckdb.OutOfMemoryException:
        status = "OOM -- limit quá nhỏ cho khối lượng này"
    finally:
        done.set()                            # LUÔN LUÔN dừng watcher -- không thì script treo mãi
        t.join()
    print(f"memory_limit={limit:>4}: {time.time()-t0:6.1f} s   "
          f"peak spill {peak / 2**30:5.2f} GB   {status}")
    con.close()
    Path(OUT).unlink(missing_ok=True)         # output nháp, đừng bao giờ giữ lại`,
            },
            {
              kind: 'trap',
              body: bi(
                'Run it from the repo root with python -m work.spill_lab so the lib import resolves. And note the finally block: if the watcher thread is never told to stop, the script finishes the query and then hangs forever.',
                'Hãy chạy từ thư mục gốc repo bằng python -m work.spill_lab để phần import lib giải được. Và để ý khối finally: nếu không ai bảo thread watcher dừng thì script chạy xong query rồi treo vĩnh viễn.',
              ),
            },
          ],
        },
        {
          title: bi('Put a watcher in the second terminal', 'Đặt một vòng canh ở terminal thứ hai'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `while ($true) {
  $f = Get-ChildItem "$env:ETL_LAB_DATA\\tmp" -File -ErrorAction SilentlyContinue
  $mb = (($f | Measure-Object Length -Sum).Sum) / 1MB
  "{0:HH:mm:ss}  {1} files  {2:N0} MB" -f (Get-Date), $f.Count, $mb
  Start-Sleep 1
}`,
            },
            {
              kind: 'why',
              body: bi(
                'One Windows wart, so you trust the right number: the watcher\'s MB column reads about zero even mid-spill. NTFS refreshes a file size in directory listings only when the writing process closes its handle, and DuckDB keeps its temp files open until the query ends. The watcher proves the lifecycle — files appear, multiply, vanish — and the script\'s duckdb_temporary_files() poll gives the sizes.',
                'Có một cái dở của Windows, biết để mà tin đúng con số: cột MB của vòng canh đứng gần như bằng không ngay cả giữa lúc đang spill. NTFS chỉ làm mới kích thước file trong danh sách thư mục khi tiến trình đang ghi đóng handle, mà DuckDB thì giữ file tạm mở tới lúc query xong. Vòng canh chứng minh vòng đời của file, tức chúng hiện ra, sinh sôi rồi biến mất, còn kích thước thì để phần poll duckdb_temporary_files() trong script lo.',
              ),
            },
          ],
        },
        {
          title: bi('Watch, then fill the table', 'Ngồi xem, rồi điền bảng'),
          blocks: [
            {
              kind: 'expect',
              body: bi(
                'Each full-scale run takes a few minutes on the baseline machine. This sort\'s working set is roughly twice the 8GB limit, so even the 8GB run spills a few GB; as the limit drops, spill volume and runtime both grow, and at 1GB the sort lives almost entirely on disk. The duckdb_temp_storage_*.tmp files vanish the moment the query ends.',
                'Mỗi lần chạy ở scale full mất vài phút trên máy chuẩn. Khối dữ liệu mà phép sort này phải xử lý lớn chừng gấp đôi giới hạn 8GB, nên ngay cả lần chạy 8GB cũng spill vài GB; giới hạn càng giảm thì lượng spill và thời gian chạy càng tăng, và tới 1GB thì phép sort gần như sống hẳn trên đĩa. Mấy file duckdb_temp_storage_*.tmp biến mất ngay khi query kết thúc.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'In Task Manager the Python process flat-lines AT the memory limit instead of growing — the contract holds. If the 1GB run raises the clean OOM instead of finishing, that is a valid result too: some operations need a minimum working set. Write down which happened.',
                'Trong Task Manager, tiến trình Python nằm phẳng ĐÚNG ở mức memory limit chứ không phình lên: giao kèo được giữ. Nếu lần chạy 1GB ném ra OOM sạch sẽ thay vì chạy xong thì đó cũng là một kết quả hợp lệ, vì có những phép toán cần một lượng bộ nhớ tối thiểu mới khởi động được. Hãy ghi lại trường hợp nào đã xảy ra.',
              ),
            },
            {
              kind: 'code',
              lang: 'markdown',
              body: `| memory_limit | wall clock | peak spill in tmp/ | finished? |
|--------------|-----------|--------------------|-----------|
| 8GB          |           |                    |           |
| 4GB          |           |                    |           |
| 1GB          |           |                    |           |`,
            },
          ],
        },
      ],
      accept: [
        bi(
          'The table is filled, and you can explain in two sentences what spilling is and why the 1GB run is slower while the machine stayed usable',
          'Bảng đã điền đủ, và bạn giải thích được trong hai câu spill là gì cùng vì sao lần chạy 1GB chậm hơn mà cái máy vẫn dùng được',
        ),
      ],
    },

    /* ═══════════════ T5 ═══════════════ */
    {
      id: 'a13-t5',
      num: 5,
      title: bi('Where does spill live?', 'Spill sống ở đâu?'),
      goal: bi(
        'Task 4 proved spill happens. Now prove where — because in production, where it lands is the difference between a slow night and a dead server.',
        'Task 4 đã chứng minh spill có xảy ra. Giờ chứng minh nó rơi vào đâu, vì trong môi trường sản xuất thì chỗ nó rơi xuống là khác biệt giữa một đêm chạy chậm và một cái server chết.',
      ),
      steps: [
        {
          title: bi('Why this is not paranoia', 'Vì sao đây không phải chuyện lo xa'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Provisioned machines usually pair a small OS disk with big attached storage — a 40 GB C: next to terabytes of data volume is a normal cloud shape. An engine quietly spilling tens of GB onto the OS drive fills it, and a full OS drive takes down everything on the box: logging stops, remote desktop breaks, unrelated services crash.',
                'Máy được cấp phát thường ghép một ổ hệ điều hành nhỏ với một ổ dữ liệu gắn thêm rất lớn: một ổ C: 40 GB nằm cạnh vài terabyte ổ dữ liệu là hình dạng hết sức bình thường trên cloud. Một engine lặng lẽ spill vài chục GB xuống ổ hệ điều hành sẽ làm nó đầy, mà ổ hệ điều hành đầy thì kéo sập mọi thứ trên máy: log ngừng ghi, remote desktop hỏng, mấy dịch vụ chẳng liên quan cũng chết theo.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Worse, it is a hidden failure point. Spill files vanish the moment the query ends — you watched them vanish in Task 4 — so the problem is invisible in every small test run, and by the time somebody investigates the crash the evidence is gone. Your convention block pins temp_directory precisely so this cannot happen. Today you stop trusting that line and verify it.',
                'Tệ hơn nữa, đây là một điểm hỏng ẩn. File spill biến mất ngay khi query kết thúc, chính bạn đã thấy chúng biến mất ở Task 4, nên vấn đề vô hình trong mọi lần chạy thử nhỏ, và tới lúc có người đi điều tra vụ sập thì bằng chứng đã bay mất. Khối quy ước của bạn ghim temp_directory chính là để chuyện đó không thể xảy ra. Hôm nay bạn thôi tin dòng đó và đi xác minh nó.',
              ),
            },
          ],
        },
        {
          title: bi('a) Assert the location, live', 'a) Khẳng định vị trí, ngay lúc đang chạy'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Small scale is enough — this proof needs spill, not volume. Save as work/spill_where.py and run python -m work.spill_where from the repo root; your Task 4 watcher works here too, pointed at $env:ETL_LAB_DATA\\small\\tmp.',
                'Scale small là đủ, vì phép chứng minh này cần có spill chứ không cần khối lượng lớn. Lưu thành work/spill_where.py rồi chạy python -m work.spill_where từ thư mục gốc repo; vòng canh ở Task 4 vẫn dùng được, chỉ cần chĩa vào $env:ETL_LAB_DATA\\small\\tmp.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `"""spill_where.py -- chứng minh spill sống Ở ĐÂU: dưới <DATA_ROOT>/tmp, trên ổ dữ liệu.

Chạy một phép sort không thể nhét vừa memory_limit cố ý đặt nhỏ, hỏi chính DuckDB
(duckdb_temporary_files()) xem file tạm của nó nằm đâu TRONG LÚC query chạy, rồi
khẳng định mọi đường dẫn báo về đều nằm dưới tmp/ -- tức preflight check #3, chứng
minh tại trận.
"""
import os
import threading
import time
from pathlib import Path

import duckdb

from lib.labpaths import raw_orders_dir, tmp_dir

SCALE = "small"   # phép chứng minh cần spill chứ không cần scale: small + limit nhỏ là spill sau vài giây
LIMIT = "1GB"     # đủ nhỏ để sort tháng 6 phải spill, đủ lớn để 8 thread khởi động được

TMP = tmp_dir(SCALE)
TMP.mkdir(parents=True, exist_ok=True)
OUT = TMP / "spill_where_probe.parquet"

con = duckdb.connect()
con.execute(f"SET memory_limit='{LIMIT}'; SET threads=8;")
con.execute(f"SET temp_directory='{TMP.as_posix()}'; SET preserve_insertion_order=false;")

seen: set[Path] = set()      # mọi đường dẫn file tạm mà DuckDB báo về trong lần chạy
peak = 0                     # tổng kích thước tạm lớn nhất thấy được trong một lần poll (byte)
done = threading.Event()

def watch() -> None:
    global peak
    poller = con.cursor()    # cursor thứ hai trên CÙNG database -- thấy được file tạm của nó
    while not done.is_set():
        rows = poller.execute("SELECT path, size FROM duckdb_temporary_files()").fetchall()
        seen.update(Path(p) for p, _ in rows)
        peak = max(peak, sum(s for _, s in rows))
        time.sleep(0.2)

t = threading.Thread(target=watch)
t.start()
status = "ok"
try:
    con.execute(f"""
        COPY (SELECT * FROM read_csv('{raw_orders_dir(SCALE).as_posix()}/orders_2026-06-*.csv',
                  header=true,
                  columns={{'order_id':'BIGINT','customer_id':'BIGINT','store_id':'INTEGER',
                           'order_ts':'VARCHAR','updated_at':'TIMESTAMP','status':'VARCHAR',
                           'payment_method':'VARCHAR','order_total':'VARCHAR',
                           'items':'VARCHAR','meta':'VARCHAR'}})
              ORDER BY customer_id, order_ts)
        TO '{OUT.as_posix()}' (FORMAT parquet)
    """)
except duckdb.OutOfMemoryException:
    status = f"clean OOM ở mức {LIMIT}"      # nhỏ tới mức không khởi động nổi -- nâng LIMIT lên một nấc
finally:
    done.set()               # LUÔN LUÔN dừng watcher -- không thì script treo mãi
    t.join()
    con.close()
    OUT.unlink(missing_ok=True)           # output nháp, đừng bao giờ giữ lại

assert seen, f"không quan sát được spill nào ({status}) -- chỉnh LIMIT rồi chạy lại"
outside = sorted(str(p) for p in seen if not p.is_relative_to(TMP))
assert not outside, f"FAIL: có spill NẰM NGOÀI tmp/: {outside}"
os_drive = os.environ.get("SystemDrive", "C:").upper()
verdict = "PASS" if TMP.drive.upper() != os_drive else "WARN -- tmp/ đang nằm trên ổ hệ điều hành!"
print(f"query status     : {status}")
print(f"spill files seen : {len(seen)}  (đỉnh {peak / 2**30:.2f} GB nằm trên đĩa cùng lúc)")
print(f"all of them under: {TMP}")
print(f"volume           : {TMP.drive}  vs OS drive {os_drive}  -> {verdict}")`,
            },
            {
              kind: 'why',
              body: bi(
                'Two things make this a proof rather than a glance. The paths come from DuckDB itself — the same poll that gave Task 4 its peak spill, only now keeping the paths too — not from you guessing which directory to watch. And the script asserts: every reported path under tmp/, and the tmp volume different from the OS drive. That second assertion is exactly preflight check #3 from A07, and you are watching, live, the failure it exists to prevent.',
                'Có hai thứ biến chuyện này thành một phép chứng minh chứ không phải một cái liếc mắt. Thứ nhất, các đường dẫn đến từ chính DuckDB, vẫn là phép poll đã cho Task 4 con số đỉnh spill, chỉ khác là lần này giữ lại cả đường dẫn, chứ không phải từ việc bạn đoán xem nên canh thư mục nào. Thứ hai, script có assert hẳn hoi: mọi đường dẫn báo về phải nằm dưới tmp/, và ổ chứa tmp phải khác ổ hệ điều hành. Cái assert thứ hai đó đúng là preflight check #3 của A07, và bạn đang nhìn tận mắt cái hỏng mà phép kiểm ấy sinh ra để phòng.',
              ),
            },
            {
              kind: 'expect',
              body: bi(
                'On the baseline machine, small scale, with ETL_LAB_DATA on a data drive: query status ok, around 5 spill files, peak roughly 0.2 to 0.3 GB, all under F:\\etl_lab\\small\\tmp, and the last line ends with -> PASS. Note that ~0.27 GB of spill for ~0.5 GB of June CSV means even this small sort lived a third on disk.',
                'Trên máy chuẩn, scale small, với ETL_LAB_DATA đặt ở ổ dữ liệu: query status là ok, chừng 5 file spill, đỉnh khoảng 0,2 tới 0,3 GB, tất cả nằm dưới F:\\etl_lab\\small\\tmp, và dòng cuối kết thúc bằng -> PASS. Để ý con số: chừng 0,27 GB spill cho chừng 0,5 GB CSV của tháng 6, nghĩa là ngay cả phép sort nhỏ này cũng sống một phần ba trên đĩa.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'If you get the clean OOM instead: on the baseline machine, below roughly 1 GB the 8-thread CSV reader cannot even start on this data — Task 4\'s minimum working set, met again. Raise LIMIT one notch and rerun.',
                'Nếu bạn nhận được OOM sạch sẽ thay vì chạy xong: trên máy chuẩn, dưới mức chừng 1 GB thì bộ đọc CSV chạy 8 thread không khởi động nổi trên bộ dữ liệu này, đúng cái chuyện lượng bộ nhớ tối thiểu ở Task 4, gặp lại lần nữa. Hãy nâng LIMIT lên một nấc rồi chạy lại.',
              ),
            },
          ],
        },
        {
          title: bi('b) Blast-radius arithmetic', 'b) Tính phạm vi thiệt hại'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `$freeGB  = [math]::Round((Get-PSDrive C).Free / 1GB, 1)
$spillGB = 6.0   # <-- đỉnh spill của bạn ở Task 4 (lần chạy limit 1GB, scale full)
"C: còn trống {0} GB; mỗi lần chạy spill {1} GB thì {2} lần chạy đồng thời là đầy ổ hệ điều hành" -f $freeGB, $spillGB, [math]::Floor($freeGB / $spillGB)`,
            },
            {
              kind: 'text',
              body: bi(
                'Example, your numbers will differ: 90 GB free and 6 GB of spill per run gives 14 concurrent runs. Now recompute for the provisioned shape from the intro — a 40 GB OS disk with, say, 15 GB free: two runs. Your A12 sweet spot ran four workers at once, so if each worker\'s job spilled like that sort, a single parallel backfill session kills the box. That is the whole temp-discipline rationale in one division.',
                'Ví dụ, số của bạn sẽ khác: còn trống 90 GB, mỗi lần chạy spill 6 GB thì được 14 lần chạy đồng thời. Giờ tính lại cho hình dạng máy được cấp phát nói ở đầu bài, ổ hệ điều hành 40 GB còn trống chừng 15 GB: được hai lần. Cấu hình ngon nhất của bạn ở A12 chạy bốn worker cùng lúc, nên nếu mỗi worker cũng spill như phép sort kia thì chỉ một phiên backfill song song là đủ giết cái máy. Toàn bộ lý do của kỷ luật về thư mục tạm nằm gọn trong một phép chia.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'This is arithmetic only. Never point temp_directory at C:\\ to "see it for real" — filling the OS drive is precisely the incident you are learning to prevent, and it takes down more than your experiment.',
                'Đây chỉ là phép tính thôi. Tuyệt đối đừng chĩa temp_directory vào C:\\ để "xem thử cho biết", vì làm đầy ổ hệ điều hành đúng là cái sự cố bạn đang học cách phòng, và nó kéo sập nhiều thứ hơn cái thí nghiệm của bạn.',
              ),
            },
          ],
        },
        {
          title: bi('c) Close the loop in the journal', 'c) Khép lại trong journal'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Two sentences. Where does spill live in this lab and what guarantees it — the convention block plus preflight check #3 before every load, because a convention is a promise and the check is enforcement. And why DuckDB\'s default temp location, beside the database file or the working directory, happens to be safe here but is a trap on a machine where the code, or merely the shell\'s current directory, lives on the OS drive.',
                'Viết hai câu. Câu một: trong lab này thì spill sống ở đâu và cái gì bảo đảm điều đó, tức khối quy ước cộng với preflight check #3 chạy trước mỗi lần nạp, vì quy ước là một lời hứa còn phép kiểm mới là sự cưỡng chế. Câu hai: vì sao vị trí tạm mặc định của DuckDB, tức cạnh file database hoặc thư mục làm việc, tình cờ an toàn ở đây nhưng lại là cái bẫy trên một cái máy mà code, hoặc chỉ cần thư mục hiện hành của shell, nằm trên ổ hệ điều hành.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'spill_where.py prints -> PASS on your machine, and afterwards small\\tmp\\ is empty again',
          'spill_where.py in ra -> PASS trên máy bạn, và sau đó thư mục small\\tmp\\ rỗng trở lại',
        ),
        bi(
          'Both blast-radius numbers — your C: and the 15-GB-free scenario — are in the journal with the arithmetic shown',
          'Cả hai con số về phạm vi thiệt hại, tức ổ C: của bạn và kịch bản còn trống 15 GB, đều có trong journal kèm phép tính',
        ),
        bi(
          'The two closing sentences are written',
          'Đã viết xong hai câu kết',
        ),
      ],
    },

    /* ═══════════════ T6 ═══════════════ */
    {
      id: 'a13-t6',
      num: 6,
      title: bi('The near-OOM cliff, with a guard rail', 'Sát mép vực OOM, nhưng có buộc dây'),
      goal: bi(
        'Meet the ugly flavour of running out of memory — safely, on purpose, once.',
        'Gặp kiểu hết bộ nhớ xấu xí, một cách an toàn, có chủ đích, đúng một lần.',
      ),
      steps: [
        {
          title: bi('Save work/oom_probe.py', 'Lưu file work/oom_probe.py'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'pandas has no memory limit and no spill — it grows until something breaks. You will walk toward the cliff with a rope tied on. Close heavy apps, save your work, and never remove the guard. Run with python -m work.oom_probe.',
                'pandas không có memory limit và cũng không spill, nó cứ phình ra cho tới khi có thứ gì đó vỡ. Bạn sẽ đi ra phía mép vực nhưng có buộc dây. Hãy đóng mấy ứng dụng nặng, lưu lại phần đang làm dở, và tuyệt đối đừng gỡ cái guard đi. Chạy bằng python -m work.oom_probe.',
              ),
            },
            {
              kind: 'code',
              lang: 'python',
              body: `"""oom_probe.py -- nạp dần các ngày ở scale full vào pandas cho tới khi guard bật."""
import pandas as pd
import psutil

from lib.labpaths import raw_orders_dir

GUARD_RSS_GB = 12        # dừng trước khi Windows bắt đầu paging tới chết
GUARD_AVAIL_GB = 2       # ...hoặc trước khi CẢ HỆ THỐNG cạn RAM, cái nào tới trước thì tính

proc = psutil.Process()
frames = []
for i, path in enumerate(sorted(raw_orders_dir("full").glob("orders_2026-06-*.csv")), 1):
    frames.append(pd.read_csv(path))
    rss = proc.memory_info().rss / 2**30
    avail = psutil.virtual_memory().available / 2**30
    print(f"sau {i:2d} ngày: RSS của tôi {rss:5.1f} GB   hệ thống còn {avail:5.1f} GB")
    if rss > GUARD_RSS_GB or avail < GUARD_AVAIL_GB:
        print(f"GUARD BẬT sau {i} ngày -- dừng trước khi Windows dừng hộ chúng ta.")
        break`,
            },
            {
              kind: 'expect',
              body: bi(
                'Watch Task Manager\'s memory graph climb. On the baseline machine expect roughly 0.5 to 2 GB of RSS per day — newer pandas stores strings far more compactly, so your GB per day IS the measurement — and a guard trips somewhere between a handful of days and about twenty.',
                'Hãy nhìn biểu đồ bộ nhớ trong Task Manager leo lên. Trên máy chuẩn, hãy chờ đợi chừng 0,5 tới 2 GB RSS cho mỗi ngày dữ liệu, vì pandas đời mới lưu chuỗi gọn hơn hẳn nên con số GB mỗi ngày của bạn CHÍNH LÀ kết quả đo, và cái guard sẽ bật đâu đó trong khoảng từ vài ngày tới chừng hai chục ngày.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Journal: GB per day, which guard tripped and after how many days, and — dividing into 69 days — why "just load it all with pandas" was never an option. Contrast with Task 4: DuckDB sorted the whole 69 days in 1 GB.',
                'Ghi vào journal: số GB mỗi ngày, guard nào đã bật và bật sau bao nhiêu ngày, rồi đem chia cho 69 ngày để thấy vì sao phương án "cứ nạp hết bằng pandas" chưa bao giờ là một phương án. Hãy đặt cạnh Task 4: DuckDB sort cả 69 ngày trong 1 GB.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Running this without the guard "just to see" is how you lose the evening. With RAM full, Windows pages and everything crawls — including the editor holding your unsaved journal. The guard costs two lines. Keep it.',
                'Chạy cái này mà bỏ guard đi "để xem thử" chính là cách bạn mất cả buổi tối. RAM đầy thì Windows paging và mọi thứ bò lê, kể cả cái editor đang giữ bản journal chưa lưu của bạn. Guard tốn có hai dòng. Giữ nó lại.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'The write-up is in the journal and your machine stayed usable throughout',
          'Phần ghi chép đã có trong journal và máy bạn vẫn dùng được suốt quá trình',
        ),
      ],
    },

    /* ═══════════════ T7 ═══════════════ */
    {
      id: 'a13-t7',
      num: 7,
      title: bi('IO volume: CSV vs Parquet', 'Lượng IO: CSV so với Parquet'),
      goal: bi(
        'Memory is not the only resource. Ask both formats the same question and count bytes read.',
        'Bộ nhớ không phải tài nguyên duy nhất. Hãy hỏi cả hai định dạng cùng một câu rồi đếm số byte đọc.',
      ),
      steps: [
        {
          title: bi('Save work/io_volume.py', 'Lưu file work/io_volume.py'),
          blocks: [
            {
              kind: 'code',
              lang: 'python',
              body: `"""io_volume.py -- cùng một phép tổng hợp, CSV so với Parquet: so số byte ĐỌC."""
import duckdb
import psutil

from lib.labpaths import lake_dir, raw_orders_dir

SCALE = "full"                     # dựng thử với "small" trước
proc = psutil.Process()
con = duckdb.connect()
con.execute("SET memory_limit='8GB'; SET threads=8;")

before = proc.io_counters().read_bytes
con.execute(f"""
    SELECT store_id, count(*) AS orders
    FROM read_csv('{(raw_orders_dir(SCALE) / "orders_2026-06-*.csv").as_posix()}',
        header=true,
        columns={{'order_id':'BIGINT','customer_id':'BIGINT','store_id':'INTEGER',
                 'order_ts':'VARCHAR','updated_at':'TIMESTAMP','status':'VARCHAR',
                 'payment_method':'VARCHAR','order_total':'VARCHAR',
                 'items':'VARCHAR','meta':'VARCHAR'}})
    GROUP BY 1
""").fetchall()
csv_gb = (proc.io_counters().read_bytes - before) / 2**30

before = proc.io_counters().read_bytes
# lake có version của A10 -- sửa "orders_v=*" nếu tên thư mục của bạn khác
con.execute(f"""
    SELECT store_id, count(*) AS orders
    FROM read_parquet('{(lake_dir(SCALE) / "orders_v=*").as_posix()}/*/*.parquet',
                      hive_partitioning=true)
    WHERE order_date BETWEEN DATE '2026-06-01' AND DATE '2026-06-30'
    GROUP BY 1
""").fetchall()
pq_gb = (proc.io_counters().read_bytes - before) / 2**30

print(f"CSV    : đọc {csv_gb:6.2f} GB")
print(f"Parquet: đọc {pq_gb:6.2f} GB")
print(f"tỉ lệ  : ít IO hơn {csv_gb / max(pq_gb, 1e-9):.0f} lần khi dùng parquet")`,
            },
            {
              kind: 'expect',
              body: bi(
                'At full scale the CSV side must read all of June, about 10 GB. The Parquet side reads only the store_id column of the pruned June partitions — expect well under 0.1 GB, a hundredfold reduction or more.',
                'Ở scale full, phía CSV buộc phải đọc cả tháng 6, chừng 10 GB. Phía Parquet chỉ đọc cột store_id của mấy partition tháng 6 đã được cắt bớt, nên hãy chờ đợi con số dưới 0,1 GB, tức giảm từ trăm lần trở lên.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Row counts differ slightly — late rows, as you learned in A02 and A08. Today we compare bytes, not rows. Explain the gap in one journal sentence using three words: columns, compression, partitions.',
                'Số dòng hai bên lệch nhau chút ít vì có dòng về trễ, đúng thứ bạn đã học ở A02 và A08. Hôm nay chúng ta so byte chứ không so dòng. Hãy giải thích khoảng cách đó trong một câu ghi vào journal, dùng ba từ: cột, nén, partition.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Both numbers and the one-sentence explanation are in the journal',
          'Cả hai con số và câu giải thích một dòng đều có trong journal',
        ),
      ],
    },

    /* ═══════════════ T8 ═══════════════ */
    {
      id: 'a13-t8',
      num: 8,
      title: bi('Right-size the daily load', 'Chọn đúng cỡ cho tác vụ nạp hằng ngày'),
      goal: bi(
        'Answer the production question with data, not vibes: what is the smallest memory_limit that runs the daily load in under 2x the best time?',
        'Trả lời câu hỏi rất sản xuất bằng dữ liệu chứ không bằng cảm giác: memory_limit nhỏ nhất mà vẫn chạy được tác vụ nạp hằng ngày trong dưới 2 lần thời gian tốt nhất là bao nhiêu?',
      ),
      steps: [
        {
          title: bi('Build the sweep', 'Dựng phép quét'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Copy spill_lab.py to work/rightsize.py and replace the sort with the daily load: one day\'s raw CSV — pick 2026-06-05 — cleaned, then partitioned parquet under tmp/rightsize/. That is the read, canonicalize and COPY … PARTITION_BY (order_date) part of your A02 and A11 per-day load, writing under tmp/ instead of the lake, with the warehouse INSERT left out. Reuse that code, do not rewrite it.',
                'Chép spill_lab.py thành work/rightsize.py rồi thay phép sort bằng tác vụ nạp hằng ngày: lấy file CSV thô của một ngày, chọn ngày 2026-06-05, làm sạch, rồi ghi ra parquet có partition dưới tmp/rightsize/. Tức là phần đọc, chuẩn hoá và COPY … PARTITION_BY (order_date) trong tác vụ nạp theo ngày của A02 và A11, chỉ khác là ghi xuống tmp/ thay vì ghi vào lake, và bỏ phần INSERT vào warehouse đi. Hãy dùng lại đoạn code đó chứ đừng viết lại.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Extend the sweep downward: 8GB, 4GB, 2GB, 1GB, 512MB, 256MB, 128MB, 64MB. Print seconds and status per limit, plus a "vs best" ratio.',
                'Kéo dải quét xuống thấp hơn: 8GB, 4GB, 2GB, 1GB, 512MB, 256MB, 128MB, 64MB. In ra số giây và trạng thái cho từng mức, kèm tỉ lệ so với mức tốt nhất.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `memory_limit | seconds | vs best | status
         4GB |     0.4 |    1.3x | ok
       512MB |     0.3 |    1.0x | ok
        64MB |     0.8 |    2.7x | ok`,
            },
            {
              kind: 'why',
              body: bi(
                'Typical shape: flat, flat, then a knee where spilling starts, then possibly a clean OOM floor. Your answer is the smallest "ok" limit still under 2.0x — smallest matters because in the cloud, RAM is the price tag.',
                'Hình dạng thường thấy: phẳng, phẳng, rồi gãy khuỷu ở chỗ bắt đầu spill, rồi có thể là một cái đáy OOM sạch sẽ. Đáp án của bạn là mức nhỏ nhất còn báo ok mà vẫn dưới 2,0 lần. Nhỏ nhất mới quan trọng, vì trên cloud thì RAM chính là cái bảng giá.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'If every limit gives the same time, your workload never exceeded the smallest limit — you measured nothing. Use full scale. The example table above is a small-scale dev run; your real numbers will be much larger.',
                'Nếu mọi mức giới hạn đều cho cùng một thời gian thì khối lượng công việc của bạn chưa bao giờ vượt quá mức nhỏ nhất, tức là bạn chưa đo được gì. Hãy dùng scale full. Cái bảng ví dụ ở trên là một lần chạy thử ở scale small, số thật của bạn sẽ lớn hơn nhiều.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'The full table and the one-line answer are in journal.md, and the table shows a knee',
          'Bảng đầy đủ và câu trả lời một dòng đã có trong journal.md, và bảng đó cho thấy một chỗ gãy khuỷu',
        ),
      ],
    },

    /* ═══════════════ T9 ═══════════════ */
    {
      id: 'a13-t9',
      num: 9,
      title: bi('What your tuning is worth in money', 'Phần tuning của bạn đáng bao nhiêu tiền'),
      goal: bi(
        'Turn the measurements into the language the decision gets made in.',
        'Quy mấy con số đo được sang đúng ngôn ngữ mà quyết định được đưa ra.',
      ),
      steps: [
        {
          title: bi('The arithmetic, on paper', 'Phép tính, làm trên giấy'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'On your laptop, waste costs time; on a cloud VM the meter runs per hour and bigger RAM tiers cost more. Use a stand-in price of $0.40 per hour for an eight-core, 16 GB on-demand VM, or look up a real one.',
                'Trên laptop thì lãng phí mất thời gian; còn trên một máy ảo cloud thì đồng hồ chạy theo giờ, và tier nhiều RAM hơn thì đắt hơn. Hãy lấy một mức giá tạm là 0,40 đô la mỗi giờ cho máy ảo on-demand tám nhân, 16 GB, hoặc tự tra một mức giá thật.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'One — speed: your A11 baseline backfill wall clock against A12 parallel. Hours saved times $0.40 times 365 runs a year is what A12 alone is worth annually. Two — size: if Task 8 showed the daily load fits in about 4 GB, it fits a VM tier half the size at roughly half the price. Recompute the job\'s yearly cost.',
                'Một, về tốc độ: lấy thời gian chạy backfill nền ở A11 so với bản song song của A12. Số giờ tiết kiệm được nhân 0,40 đô la nhân 365 lần chạy mỗi năm chính là giá trị hằng năm của riêng phần A12. Hai, về kích cỡ: nếu Task 8 cho thấy tác vụ nạp hằng ngày nằm gọn trong chừng 4 GB thì nó vừa một tier máy nhỏ đi một nửa, giá cũng chừng một nửa. Hãy tính lại chi phí mỗi năm của cái job đó.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'The prices are estimates. The habit of doing this arithmetic is the deliverable — it is what lets you argue for a configuration instead of preferring one.',
                'Mấy con số giá chỉ là ước lượng. Thứ cần đạt được là cái thói quen ngồi làm phép tính này, vì chính nó cho phép bạn lập luận cho một cấu hình thay vì chỉ thấy thích một cấu hình.',
              ),
            },
          ],
        },
        {
          title: bi('Verify yourself', 'Tự kiểm lại'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `-- khối lượng bạn đã sort ở Task 4, lấy thẳng từ manifest (kiểu A05)
SELECT count(*) AS files, sum(rows) AS total_rows,
       round(sum(bytes)/pow(2,30), 1) AS csv_gb
FROM read_json_auto('<DATA_ROOT>/raw/manifest/orders_*.json');`,
            },
            {
              kind: 'expect',
              body: bi(
                'Full scale, generator 1.0: 69 files, 82,337,467 rows, about 24.2 GB. June alone, the Task 7 window: 30 files, 36,060,981 rows, about 10.2 GB.',
                'Ở scale full với generator 1.0: 69 file, 82.337.467 dòng, chừng 24,2 GB. Riêng tháng 6, tức cửa sổ dùng ở Task 7: 30 file, 36.060.981 dòng, chừng 10,2 GB.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Also check: during the 1GB spill run the watcher must show several duckdb_temp_storage_*.tmp files with the MB column near zero, while the script\'s peak spill reports several GB — and within seconds of the run ending, tmp/ must be empty again.',
                'Kiểm thêm: trong lần chạy spill ở mức 1GB, vòng canh phải hiện ra vài file duckdb_temp_storage_*.tmp với cột MB gần bằng không, trong khi con số peak spill của script báo vài GB. Và chỉ vài giây sau khi lần chạy kết thúc, thư mục tmp/ phải rỗng trở lại.',
              ),
            },
          ],
        },
        {
          title: bi('Common beginner mistakes', 'Mấy lỗi hay gặp khi mới làm'),
          blocks: [
            {
              kind: 'trap',
              body: bi(
                'Creating a fresh psutil.Process every sample — cpu_percent(interval=None) compares against the previous call on the same object, so fresh objects report 0 forever and your worker pool looks idle while eight cores burn.',
                'Tạo một psutil.Process mới ở mỗi lần lấy mẫu. cpu_percent(interval=None) so với lần gọi trước trên cùng đối tượng, nên đối tượng mới tinh báo 0 vĩnh viễn và cái pool worker trông như đang ngồi chơi trong lúc tám nhân đang cháy.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Monitoring only the parent process — the A12 pool parent sits near 0.2 GB while its children hold gigabytes. Always sum the tree.',
                'Chỉ theo dõi mỗi tiến trình cha. Tiến trình cha của pool ở A12 nằm quanh 0,2 GB trong khi đám con giữ hàng GB. Luôn luôn cộng cả cây.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Comparing a cold run against a warm one — Windows caches file reads, so a second scan of the same CSV can be much faster with identical read_bytes. For fair A/B timings run each variant twice and compare same-position runs. A14 formalizes this.',
                'Đem một lần chạy nguội so với một lần chạy nóng. Windows có cache khi đọc file, nên lần quét thứ hai trên cùng file CSV có thể nhanh hơn hẳn dù read_bytes y như cũ. Muốn so A/B cho công bằng thì chạy mỗi biến thể hai lần rồi so lần chạy cùng vị trí. A14 sẽ làm chuyện này cho bài bản.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Pointing temp_directory at C:\\ or OneDrive — spill files reach many GB fast, and a nearly full or synced drive turns the spill lab into a disk-full incident. Task 5\'s arithmetic tells you exactly how few runs that takes.',
                'Chĩa temp_directory vào C:\\ hoặc vào OneDrive. File spill phình lên nhiều GB rất nhanh, và một cái ổ gần đầy hoặc đang đồng bộ sẽ biến thí nghiệm spill thành một sự cố đầy đĩa. Phép tính ở Task 5 nói cho bạn biết chính xác chỉ cần ít lần chạy tới mức nào là đủ.',
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
                'Spill curves: Task 4\'s watcher thread already polls duckdb_temporary_files() for a peak — extend it to log (t_s, total_bytes) per poll to a CSV at each memory_limit, then compare the three spill-over-time curves. With DuckDB, of course.',
                'Vẽ đường cong spill: cái thread watcher ở Task 4 vốn đã poll duckdb_temporary_files() để lấy đỉnh, hãy mở rộng nó để ghi cặp (t_s, total_bytes) của mỗi lần poll ra một file CSV cho từng mức memory_limit, rồi đem so ba đường cong spill theo thời gian. Tất nhiên là so bằng DuckDB.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Rates, not just totals: turn resmon\'s cumulative read_bytes into a MB/s column with lag() over t_s, and find where the run flips from read-heavy to compute-heavy. And profile the pathological configs — rerun A12\'s oversubscription and memory-over-commit experiments under resmon, then describe their signatures in the CSV.',
                'Tốc độ chứ không chỉ tổng số: biến cột read_bytes tích luỹ của resmon thành một cột MB/s bằng lag() theo t_s, rồi tìm chỗ lần chạy lật từ nặng đọc sang nặng tính. Và hãy đo luôn mấy cấu hình bệnh hoạn: chạy lại các thí nghiệm oversubscription và cấp bộ nhớ quá tay của A12 dưới resmon, rồi mô tả dấu vết của chúng trong file CSV.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Resource alerting: give resmon a --max-rss-gb flag. When the child tree\'s summed RSS exceeds the budget, set a breach flag, remember the peak, and keep monitoring — warn, do not kill. Write one ops.alerts row, severity warn, source resmon, message naming the command and the peak GB, into warehouse.duckdb, the same table A05 created and A07 and A11 write to.',
                'Cảnh báo tài nguyên: thêm cho resmon một cờ --max-rss-gb. Khi tổng RSS của cây tiến trình con vượt ngân sách thì bật một cờ vi phạm, nhớ lại mức đỉnh, rồi tiếp tục theo dõi, tức là cảnh báo chứ không giết. Ghi đúng một dòng vào ops.alerts với severity là warn, source là resmon, message nêu tên câu lệnh và số GB đỉnh, vào file warehouse.duckdb, chính cái bảng mà A05 đã tạo còn A07 và A11 vẫn ghi vào.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Write that row only AFTER the wrapped command exits — the child may hold warehouse.duckdb open, and A12\'s single-writer rule means resmon must not be the second writer. At most one row per run. Verify with the Task 1 smoke test at --max-rss-gb 0.2 against the small warehouse: exactly one new warn row should appear.',
                'Chỉ ghi dòng đó SAU KHI câu lệnh được bọc đã thoát, vì tiến trình con có thể đang giữ warehouse.duckdb mở, mà quy tắc một người ghi duy nhất của A12 nghĩa là resmon không được làm người ghi thứ hai. Mỗi lần chạy nhiều nhất một dòng. Hãy kiểm bằng phép chạy thử ở Task 1 với --max-rss-gb 0.2 trên warehouse của scale small: phải thấy xuất hiện đúng một dòng warn mới.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Both dollar figures are in the journal with the arithmetic shown',
          'Cả hai con số tiền đều có trong journal kèm phép tính',
        ),
      ],
    },
  ],
}