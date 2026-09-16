import type { AssignmentSpec } from '../types'
import { bi } from '../types'
import { a15Terms, a15Theory } from './a15.theory'

export const a15: AssignmentSpec = {
  id: 'a15',
  code: 'A15',
  title: bi('dbt capstone', 'dbt — bài tổng kết'),
  summary: bi(
    'Rebuild your whole T-layer in dbt and find the punchline of the lab: there is nothing in it you have not already built by hand. Sources over the lake, staging views, two incremental facts, the A05 test suite in YAML, a windowed rebuild drill, a documentation site that is a real data catalog, two kinds of lineage — and finally the thing fourteen assignments never asked of you: design a table instead of implementing one.',
    'Bạn sẽ dựng lại toàn bộ tầng biến đổi bằng dbt và gặp câu chốt của cả khoá lab: trong đó không có thứ gì bạn chưa từng tự tay làm. Khai source trên lake, dựng view staging, hai bảng fact tăng dần, bộ test của A05 viết thành YAML, bài tập dựng lại theo cửa sổ ngày, một trang tài liệu thật sự là một data catalog, hai tầng lineage — và cuối cùng là thứ mười bốn bài trước chưa từng đòi hỏi: tự thiết kế một cái bảng thay vì đi hiện thực hoá nó.',
  ),
  estHours: 7,
  difficulty: 5,
  outcome: bi(
    'You can stand up a dbt project on DuckDB from three files, port hand-written cleaning and incremental logic into models, express a data contract as tests with honest severities, rebuild any date window idempotently, publish a browsable catalog with real descriptions, answer a breaking-change request with column-level precision, and design a new mart from a vague question — naming the trade-offs you took.',
    'Sau bài này bạn dựng được một dự án dbt trên DuckDB chỉ từ ba file, chuyển được phần làm sạch và logic nạp tăng dần viết tay thành model, diễn đạt được data contract thành các test với mức nghiêm khắc trung thực, dựng lại được bất kỳ cửa sổ ngày nào mà không sợ lặp, xuất bản được một cuốn danh mục tra cứu được với mô tả thật, trả lời được một yêu cầu đổi cấu trúc ở độ chính xác mức cột, và thiết kế được một mart mới từ một câu hỏi mơ hồ, kèm tên của những đánh đổi bạn đã chọn.',
  ),
  theory: a15Theory,
  terms: a15Terms,
  tasks: [
    /* ═══════════════ T0 — SETUP ═══════════════ */
    {
      id: 'a15-t0',
      title: bi('Setup', 'Chuẩn bị'),
      goal: bi(
        'One pip install, one branch, one env var — and close every session holding the database.',
        'Một lệnh pip install, một nhánh git, một biến môi trường — và đóng mọi phiên đang giữ file database.',
      ),
      steps: [
        {
          title: bi('What you need in place', 'Những thứ phải có sẵn'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'A14 done. The full 69-day canonical lake at both scales, built in A10 and repaired in A11. warehouse.duckdb at both scales. ETL_LAB_DATA set as an environment variable — dbt errors when env_var() is missing, on purpose, so the <repo>/data fallback will not save you here.',
                'Bạn cần đã xong A14. Có sẵn canonical lake đủ 69 ngày ở cả hai scale, dựng ở A10 và vá ở A11. Có warehouse.duckdb ở cả hai scale. Và phải đặt biến môi trường ETL_LAB_DATA, vì dbt cố tình báo lỗi khi env_var() không có, nên cái đường lui <repo>/data sẽ không cứu bạn ở đây.',
              ),
            },
            {
              kind: 'code',
              lang: 'powershell',
              body: `pip install dbt-duckdb
dbt --version    # dbt Core ~1.12, plugin duckdb ~1.11 (hoặc mới hơn)`,
            },
            {
              kind: 'text',
              body: bi(
                'The project lives in the repo at dbt_lab/ — it is code, so it is versioned, unlike data. Add three lines to .gitignore: dbt_lab/target/, dbt_lab/logs/, dbt_lab/dbt_packages/. Then the git ritual one last time: git switch -c a15-dbt, a commit after each numbered task, merge to main when the Definition of Done is green.',
                'Dự án nằm trong repo tại thư mục dbt_lab/, vì nó là code nên nó được version, khác với dữ liệu. Thêm ba dòng vào .gitignore: dbt_lab/target/, dbt_lab/logs/, dbt_lab/dbt_packages/. Rồi làm nghi thức git lần cuối: git switch -c a15-dbt, commit sau mỗi task có đánh số, và merge về main khi phần Định nghĩa hoàn thành đã xanh hết.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Run every dbt command from inside dbt_lab/ — dbt looks for its config where you stand. And close any Python REPL or DBeaver session holding the same warehouse.duckdb: one process, one writer, the A12 rule. "Could not find profile" almost always means wrong folder, not broken YAML.',
                'Mọi lệnh dbt đều phải chạy từ bên trong thư mục dbt_lab/, vì dbt tìm file cấu hình ngay tại chỗ bạn đang đứng. Và hãy đóng mọi phiên Python REPL hay DBeaver đang giữ file warehouse.duckdb đó: một tiến trình, một người ghi, đúng luật của A12. Lỗi "Could not find profile" gần như luôn có nghĩa là bạn đứng sai thư mục, chứ không phải file YAML hỏng.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Scale rule, one last time: develop on small for Tasks 1 to 8, run full once it is green in Task 9. Tasks 10 to 13 read your project rather than your data, so either target does. Tasks 14 and 15 are pen and paper.',
                'Luật về scale, nhắc lần cuối: làm trên small cho Task 1 tới 8, rồi chạy full một lần khi mọi thứ đã xanh ở Task 9. Task 10 tới 13 đọc dự án của bạn chứ không đọc dữ liệu, nên target nào cũng được. Còn Task 14 và 15 là giấy bút.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'dbt-duckdb installed, branch created, ETL_LAB_DATA set, target/ logs/ dbt_packages/ gitignored, and no other process holding warehouse.duckdb',
          'Đã cài dbt-duckdb, đã tạo nhánh, đã đặt ETL_LAB_DATA, đã gitignore target/ logs/ dbt_packages/, và không còn tiến trình nào khác giữ file warehouse.duckdb',
        ),
      ],
    },

    /* ═══════════════ T1 ═══════════════ */
    {
      id: 'a15-t1',
      num: 1,
      title: bi('Scaffold the project and connect', 'Dựng khung dự án và nối vào kho'),
      goal: bi(
        'Three files: what to build, where to build it, and how to name the schemas.',
        'Ba file: dựng cái gì, dựng ở đâu, và đặt tên schema ra sao.',
      ),
      steps: [
        {
          title: bi('dbt_project.yml — the identity card', 'dbt_project.yml — tấm căn cước của dự án'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Do not run dbt init — it scaffolds a demo project. Build yours deliberately, three files. First dbt_lab/dbt_project.yml.',
                'Đừng chạy dbt init, vì nó dựng ra một dự án mẫu. Hãy tự dựng của bạn một cách có chủ đích, chỉ ba file. Đầu tiên là dbt_lab/dbt_project.yml.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `name: etl_lab_dbt
version: "1.0.0"
profile: etl_lab_dbt

model-paths: ["models"]
seed-paths: ["seeds"]
test-paths: ["tests"]
macro-paths: ["macros"]

vars:
  start_date: "2026-06-01"   # mặc định = toàn bộ lịch sử, tức là an toàn
  end_date: "2026-08-08"

models:
  etl_lab_dbt:
    staging:
      +materialized: view
      +schema: staging
    core:
      +materialized: table
      +schema: core
    marts:
      +materialized: table
      +schema: marts

seeds:
  etl_lab_dbt:
    +schema: staging`,
            },
            {
              kind: 'why',
              body: bi(
                'Read the models: block as policy — everything in models/staging/ becomes a view in schema staging, and so on. That is the A03 layer convention, now enforced by folder structure instead of by your memory. The vars: are runtime parameters, your A11 runner\'s --start/--end; defaulting them to the whole history means a forgotten var restates rather than under-loads.',
                'Hãy đọc khối models: như một chính sách: mọi thứ trong models/staging/ thành view ở schema staging, tương tự cho các tầng khác. Đó chính là quy ước phân tầng của A03, giờ được chính cấu trúc thư mục cưỡng chế thay vì dựa vào trí nhớ của bạn. Khối vars: là tham số lúc chạy, tức cặp --start/--end của runner ở A11; để mặc định bằng toàn bộ lịch sử nghĩa là quên truyền var thì bị dựng lại thừa chứ không bị nạp thiếu.',
              ),
            },
          ],
        },
        {
          title: bi('profiles.yml — where to build', 'profiles.yml — dựng ở đâu'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Project says what, profile says where. They are separate files because the what is shared across the team and the where is per-machine.',
                'File dự án nói dựng cái gì, file profile nói dựng ở đâu. Chúng tách làm hai vì phần "cái gì" thì cả đội dùng chung, còn phần "ở đâu" thì mỗi máy một khác.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `etl_lab_dbt:
  target: small            # dev trên small — luật của lab từ A00
  outputs:
    small:
      type: duckdb
      path: "{{ env_var('ETL_LAB_DATA') }}/small/warehouse/warehouse.duckdb"
      threads: 4
      settings:
        memory_limit: 8GB
        threads: 8
        timezone: UTC
        temp_directory: "{{ env_var('ETL_LAB_DATA') }}/small/tmp"
    full:
      type: duckdb
      path: "{{ env_var('ETL_LAB_DATA') }}/warehouse/warehouse.duckdb"
      threads: 4
      settings:
        memory_limit: 8GB
        threads: 8
        timezone: UTC
        temp_directory: "{{ env_var('ETL_LAB_DATA') }}/tmp"`,
            },
            {
              kind: 'trap',
              body: bi(
                'Two different threads on purpose. The top-level threads: 4 is how many models dbt builds concurrently; settings.threads: 8 is DuckDB\'s core count per query. Do not conflate them.',
                'Có hai chữ threads khác nhau, và là cố ý. Dòng threads: 4 ở ngoài là số model dbt dựng song song; còn settings.threads: 8 là số core DuckDB dùng cho mỗi query. Đừng gộp hai thứ đó làm một.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Note what you do not see here: no N-workers times memory_limit budget math. One DuckDB process, one 8 GB limit — dbt lives inside the single-process alternative you measured in A12. And settings.timezone: UTC pins epoch decoding, the same reason as A03 Task 6.',
                'Hãy để ý thứ KHÔNG có mặt ở đây: không có phép tính ngân sách kiểu N worker nhân với memory_limit. Một tiến trình DuckDB, một giới hạn 8 GB — dbt sống ngay trong cái phương án một-tiến-trình mà bạn đã đo ở A12. Còn settings.timezone: UTC là để ghim cách giải mã epoch, cùng lý do với Task 6 của A03.',
              ),
            },
          ],
        },
        {
          title: bi('The schema-name macro', 'Macro đặt tên schema'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'By default dbt names custom schemas <target_schema>_<custom_schema>, so you would get main_staging. Five lines in dbt_lab/macros/schema_names.sql give your A03 names back.',
                'Mặc định dbt đặt tên schema tuỳ biến theo kiểu <target_schema>_<custom_schema>, nên bạn sẽ nhận được main_staging. Năm dòng trong dbt_lab/macros/schema_names.sql trả lại đúng tên của A03.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `{% macro generate_schema_name(custom_schema_name, node) -%}
    {%- if custom_schema_name is none -%}
        {{ target.schema }}
    {%- else -%}
        {{ custom_schema_name | trim }}
    {%- endif -%}
{%- endmacro %}`,
            },
            {
              kind: 'code',
              lang: 'powershell',
              body: `cd dbt_lab
dbt debug
dbt debug --target full`,
            },
          ],
        },
      ],
      accept: [
        bi(
          'dbt debug ends with "All checks passed!" — and dbt debug --target full passes too.',
          'Lệnh dbt debug kết thúc bằng "All checks passed!", và dbt debug --target full cũng qua.',
        ),
      ],
    },

    /* ═══════════════ T2 ═══════════════ */
    {
      id: 'a15-t2',
      num: 2,
      title: bi('Sources: point dbt at data it does not own', 'Source: chỉ cho dbt chỗ dữ liệu nó không sở hữu'),
      goal: bi(
        'One producer, four feeds, and a freshness check that is your A06 clause made executable.',
        'Một bên gửi, bốn luồng dữ liệu, và một phép kiểm độ tươi chính là điều khoản A06 ở dạng chạy được.',
      ),
      steps: [
        {
          title: bi('Declare the shopcore source', 'Khai source shopcore'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'A source is a contract-like declaration: this data exists, here is where, here is how fresh it must be. With dbt-duckdb a source table can be an external_location — any read_parquet or read_csv expression — so no import step is needed. Create dbt_lab/models/sources.yml.',
                'Source là một lời khai mang dáng dấp contract: dữ liệu này có tồn tại, nó nằm ở đây, và nó phải tươi tới mức nào. Với dbt-duckdb thì một bảng source có thể là một external_location, tức bất kỳ biểu thức read_parquet hay read_csv nào, nên không cần bước import nào cả. Hãy tạo dbt_lab/models/sources.yml.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `version: 2

sources:
  - name: shopcore
    description: >
      Mọi luồng dữ liệu từ shopcore, nền tảng thương mại điện tử: luồng orders
      (dưới dạng canonical Parquet lake dựng ở A10, vá ở A11) cộng các file CSV
      dimension đúng y như lúc nhận, bẩn có chủ đích.
    meta:
      external_location: "read_csv('{{ env_var('ETL_LAB_DATA') }}{{ '/small' if target.name == 'small' else '' }}/raw/dims/{name}.csv', header=true, all_varchar=true)"
    tables:
      - name: orders
        description: Mỗi dòng là một sự kiện đơn hàng, schema canonical, đủ cả ba era.
        meta:
          external_location: "read_parquet('{{ env_var('ETL_LAB_DATA') }}{{ '/small' if target.name == 'small' else '' }}/lake/orders_v=*/*/*.parquet', hive_partitioning=true)"
        loaded_at_field: updated_at
        freshness:
          warn_after: {count: 24, period: hour}
          error_after: {count: 7, period: day}
      - name: customers
      - name: products
      - name: stores`,
            },
            {
              kind: 'why',
              body: bi(
                'One producer, one source. shopcore ships four feeds, so they are four tables under one shopcore source, not four sources. That keeps source(\'shopcore\', ...) reading like the org chart: the name answers "who do I page?", exactly like the contract\'s producer: block.',
                'Một bên gửi thì một source. shopcore gửi bốn luồng, nên chúng là bốn bảng nằm dưới một source tên shopcore, chứ không phải bốn source. Nhờ vậy source(\'shopcore\', ...) đọc lên giống như sơ đồ tổ chức: cái tên trả lời câu "gọi ai đây?", y hệt khối producer: trong contract.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'The single-brace {name} in the source-level external_location is a dbt-duckdb placeholder filled with each table\'s name — one line serves all three dim CSVs. Table-level meta wins over source-level, which is how one source spans a Parquet lake and three CSVs. Do not put any other literal braces in that field; it treats them as placeholders.',
                'Cái {name} một ngoặc trong external_location ở mức source là chỗ trống của dbt-duckdb, được điền bằng tên từng bảng, nên một dòng phục vụ được cả ba file CSV dimension. Phần meta ở mức bảng thắng phần ở mức source, và đó là cách một source trải được lên cả một Parquet lake lẫn ba file CSV. Đừng đặt thêm cặp ngoặc nhọn nào khác vào trường đó, vì nó sẽ hiểu thành chỗ trống.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'all_varchar=true reads every dim column as text, deliberately: A03 taught you that a cleaning layer reads dirty columns as strings so it can see what it fixes. Staging will do the visible, counted casting.',
                'Tham số all_varchar=true đọc mọi cột dimension thành chữ, và đó là cố ý: A03 đã dạy rằng tầng làm sạch đọc các cột bẩn dưới dạng chuỗi để nhìn thấy được thứ mình đang sửa. Việc ép kiểu, có đếm và nhìn thấy được, sẽ do tầng staging làm.',
              ),
            },
          ],
        },
        {
          title: bi('Probe it, and meet freshness', 'Thử nó, và làm quen với freshness'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `dbt show --inline "select count(*) as lake_rows from {{ source('shopcore','orders') }}"
dbt source freshness`,
            },
            {
              kind: 'expect',
              body: bi(
                'Small scale: exactly 4,116,024 — the manifest total 4,116,840 minus the 816 unparseable-timestamp rows your A10/A11 pipeline dropped and counted. Your identity from A10 Task 7, reappearing.',
                'Ở scale small: đúng 4.116.024 — bằng tổng manifest 4.116.840 trừ đi 816 dòng có timestamp không parse nổi mà pipeline A10/A11 đã bỏ và đã đếm. Chính là đẳng thức từ Task 7 của A10 quay lại.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Freshness computes max(updated_at) — small scale gives 2026-08-10 23:31:14 — and compares it to now, so your result depends on the day you run it: within 7 days of that stamp you get WARN, later you get ERROR. Both are correct. The feed really did stop on 2026-08-08, with the last corrections landing on the 10th. A dead feed should go red; in production this check pages someone before a dashboard silently flatlines.',
                'Phép kiểm freshness tính max(updated_at) — ở scale small ra 2026-08-10 23:31:14 — rồi so với thời điểm hiện tại, nên kết quả phụ thuộc vào ngày bạn chạy: trong vòng 7 ngày kể từ mốc đó thì ra WARN, muộn hơn thì ra ERROR. Cả hai đều đúng. Cái feed này đúng là đã dừng vào 2026-08-08, với những bản sửa cuối cùng về vào ngày 10. Một feed đã chết thì phải đỏ lên; trong môi trường thật, phép kiểm này gọi người dậy trước khi một cái dashboard lặng lẽ nằm ngang.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'The inline count matches 4,116,024, and you can explain in one sentence why your freshness status (WARN or ERROR) is the right answer today.',
          'Số đếm inline khớp 4.116.024, và bạn giải thích được trong một câu vì sao trạng thái freshness của mình (WARN hay ERROR) là câu trả lời đúng cho hôm nay.',
        ),
      ],
    },

    /* ═══════════════ T3 ═══════════════ */
    {
      id: 'a15-t3',
      num: 3,
      title: bi('Seed + staging views', 'Seed và các view staging'),
      goal: bi(
        'The A03 country map as versioned code, and four thin cleaning views.',
        'Bảng ánh xạ quốc gia của A03 dưới dạng code có version, cộng bốn view làm sạch mỏng.',
      ),
      steps: [
        {
          title: bi('The seed', 'Phần seed'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Your A03 country conformance table becomes dbt_lab/seeds/country_map.csv. A seed is exactly "small mapping table, versioned with the code".',
                'Bảng quy chuẩn tên quốc gia của A03 trở thành dbt_lab/seeds/country_map.csv. Seed đúng nghĩa là "bảng ánh xạ nhỏ, được version cùng với code".',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `variant,iso2
us,US
usa,US
united states,US
vn,VN
vietnam,VN
viet nam,VN
gb,GB
uk,GB
united kingdom,GB`,
            },
            {
              kind: 'text',
              body: bi(
                'That is the starter. Extend it from your A03 staging.shopcore_country_map — the DE, FR, JP, AU, CA, BR and IN variants you already discovered — until the verification count passes.',
                'Đó mới là phần mồi. Hãy mở rộng nó từ bảng staging.shopcore_country_map của A03, tức các biến thể DE, FR, JP, AU, CA, BR, IN mà bạn đã tìm ra, cho tới khi con số kiểm chứng khớp.',
              ),
            },
          ],
        },
        {
          title: bi('Naming, spelled in dbt', 'Quy tắc đặt tên, viết bằng phương ngữ dbt'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'Same rules as the warehouse, different dialect. There, staging tables are source-prefixed (staging.shopcore_orders) because a shared namespace must say whose data every name is. dbt spells that rule as stg_<source>__<entity> — stg_shopcore__orders, with a double underscore between source and entity so the name still parses when the entity has underscores of its own (stg_shopcore__order_items). core and marts keep their conformed short names: dim_customers, fct_orders, daily_store_sales.',
                'Vẫn là luật cũ của kho dữ liệu, chỉ khác phương ngữ. Bên kho, bảng staging có tiền tố theo nguồn (staging.shopcore_orders), vì trong một không gian tên dùng chung thì mỗi cái tên phải nói rõ đó là dữ liệu của ai. dbt viết luật đó thành stg_<source>__<entity> — ví dụ stg_shopcore__orders, với hai dấu gạch dưới giữa nguồn và thực thể để cái tên vẫn đọc ra được khi bản thân thực thể có dấu gạch dưới (stg_shopcore__order_items). Còn core và marts giữ tên ngắn đã được quy chuẩn: dim_customers, fct_orders, daily_store_sales.',
              ),
            },
          ],
        },
        {
          title: bi('Four staging views', 'Bốn view staging'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'stg_shopcore__orders.sql is thin, because A10 already did the era alignment and the heavy cleaning before the lake. What remains: the enum cleanup (the lake kept raw status and payment values) and dropping the technical orders_v partition column by simply not selecting it.',
                'File stg_shopcore__orders.sql rất mỏng, vì A10 đã căn chỉnh era và làm sạch phần nặng trước khi ghi vào lake. Còn lại đúng hai việc: dọn lại các giá trị enum (lake vẫn giữ nguyên status và payment thô) và bỏ cột phân vùng kỹ thuật orders_v bằng cách đơn giản là không select nó.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `select
    order_id, order_id_num, customer_id, store_id,
    order_ts, updated_at,
    case when lower(trim(status)) in
              ('created','paid','shipped','delivered','cancelled','refunded')
         then lower(trim(status)) end                       as status,
    nullif(lower(trim(payment_method)), '')                 as payment_method,
    order_total, currency, discount_amount, channel, loyalty_tier,
    items, meta, order_date
from {{ source('shopcore', 'orders') }}`,
            },
            {
              kind: 'why',
              body: bi(
                'If your A10 canonicalizer already cleaned the enums, this cleaner is idempotent — clean in, clean out. Harmless either way.',
                'Nếu bộ canonicalizer ở A10 của bạn đã dọn enum rồi thì đoạn dọn này là idempotent: sạch vào, sạch ra. Kiểu nào cũng vô hại.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'stg_shopcore__customers.sql is your A03 Task 6 relocated, with one deliberate difference: per the data-classification clause you drafted in A06 (emails are PII), the model keeps md5(lower(trim(email))) as email_hash and never selects the raw address. Join and dedupe capability preserved, exposure gone. Note the seed joined via ref(), which puts country_map into the DAG.',
                'File stg_shopcore__customers.sql chính là Task 6 của A03 dời sang, với đúng một khác biệt có chủ đích: theo điều khoản phân loại dữ liệu bạn soạn ở A06 (email là PII), model giữ md5(lower(trim(email))) dưới tên email_hash và không bao giờ select địa chỉ thô. Khả năng join và khử trùng lặp vẫn còn, phần phơi bày thì hết. Để ý là seed được join qua ref(), nhờ vậy country_map lọt vào DAG.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `with src as (
    select * from {{ source('shopcore', 'customers') }}
),

cleaned as (
    select
        cast(customer_id as bigint)                          as customer_id,
        case when name like '%,%'    -- "NGUYEN, Linh" -> "Linh Nguyen"
             then trim(split_part(name, ',', 2)) || ' ' ||
                  upper(substr(trim(split_part(name, ',', 1)), 1, 1)) ||
                  lower(substr(trim(split_part(name, ',', 1)), 2))
             else trim(name) end                             as name,
        md5(lower(trim(email)))                              as email_hash,
        lower(trim(country))                                 as country_variant,
        city,
        case when nullif(trim(signup_ts), '') is null then null
             when regexp_full_match(signup_ts, '[0-9]+')     -- epoch giây
                 then cast(to_timestamp(cast(signup_ts as bigint)) as timestamp)
             else try_strptime(signup_ts, ['%Y-%m-%d %H:%M:%S', '%d/%m/%Y'])
        end                                                  as signup_ts,
        case when lower(trim(is_active)) in ('true','1','yes','y','t') then true
             when lower(trim(is_active)) in ('false','0','no','n','f') then false
        end                                                  as is_active
    from src
)

select
    c.customer_id, c.name, c.email_hash,
    m.iso2 as country,
    c.city, c.signup_ts, c.is_active
from cleaned c
left join {{ ref('country_map') }} m on c.country_variant = m.variant`,
            },
            {
              kind: 'text',
              body: bi(
                'You write stg_shopcore__products.sql and stg_shopcore__stores.sql. Products: select from the products source, clean unit_price with the canonical A03 money cleaner into DECIMAL(10,2), pass tags and attrs through untouched. Stores: cast store_id to INTEGER and opened_date to DATE, rest as-is. Then build just this layer with a selector — dbt\'s version of your runner running a subset.',
                'Phần bạn tự viết là stg_shopcore__products.sql và stg_shopcore__stores.sql. Với products: select từ source products, làm sạch unit_price bằng bộ dọn tiền tệ canonical của A03 rồi ép về DECIMAL(10,2), còn tags và attrs thì để nguyên cho đi qua. Với stores: ép store_id về INTEGER và opened_date về DATE, phần còn lại giữ nguyên. Rồi build riêng tầng này bằng một selector, tức bản dbt của chuyện runner chạy một tập con.',
              ),
            },
            {
              kind: 'code',
              lang: 'powershell',
              body: `dbt build --select staging country_map`,
            },
          ],
        },
      ],
      accept: [
        bi(
          '5 of 5 pass; staging.stg_shopcore__customers has 60,000 rows with country NULL for exactly 548 (more NULLs means the seed is incomplete); stg_shopcore__products.unit_price has zero NULLs.',
          '5 trên 5 đều pass; bảng staging.stg_shopcore__customers có 60.000 dòng với đúng 548 dòng country NULL (nhiều NULL hơn nghĩa là seed còn thiếu); cột unit_price của stg_shopcore__products không có NULL nào.',
        ),
      ],
    },

    /* ═══════════════ T4 ═══════════════ */
    {
      id: 'a15-t4',
      num: 4,
      title: bi('Core dimensions', 'Các bảng dimension ở core'),
      goal: bi(
        'Pay the build cost once, because every fact join hits these.',
        'Trả chi phí build một lần, vì mọi phép join của bảng fact đều đâm vào mấy bảng này.',
      ),
      steps: [
        {
          title: bi('Three dims, two of them boring', 'Ba dimension, hai cái nhạt nhẽo'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'The staging views hold the logic; dims persist it. A view is free until queried — but every fact join will hit these, so pay the build cost once. That is the whole reason models/core/ is +materialized: table. dim_customers.sql is honestly boring, and that is the design: its one job is the materialization boundary.',
                'Các view staging giữ phần logic; còn dimension thì làm cho nó bền. Một view là miễn phí cho tới khi có ai query, nhưng mọi phép join của bảng fact đều đâm vào mấy bảng này, nên trả chi phí build một lần là hơn. Đó chính là toàn bộ lý do models/core/ được đặt +materialized: table. File dim_customers.sql nhạt thật, và nhạt là đúng thiết kế: việc duy nhất của nó là làm ranh giới vật chất hoá.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `select * from {{ ref('stg_shopcore__customers') }}`,
            },
            {
              kind: 'text',
              body: bi(
                'dim_products.sql carries your A04 complex-type work — pipe-separated tags to a LIST, attrs JSON to real columns.',
                'File dim_products.sql mang theo phần kiểu dữ liệu phức tạp của A04: chuỗi tags ngăn bằng dấu gạch đứng thành một LIST, còn JSON trong attrs thành các cột thật.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `select
    sku, product_name, category, subcategory, unit_price,
    string_split(tags, '|')                                  as tags,
    cast(attrs as json)->>'brand'                            as brand,
    try_cast(cast(attrs as json)->>'weight_g' as double)     as weight_g,
    cast(attrs as json)->>'color'                            as color
from {{ ref('stg_shopcore__products') }}`,
            },
            {
              kind: 'text',
              body: bi(
                'You write dim_stores.sql — one line, same pattern as dim_customers. Build with dbt build --select core. Staging is not rebuilt (the views are already there), but dbt still knows the order thanks to ref().',
                'Phần bạn tự viết là dim_stores.sql, đúng một dòng, cùng khuôn với dim_customers. Build bằng dbt build --select core. Tầng staging không bị dựng lại (mấy view đã nằm đó rồi), nhưng dbt vẫn biết thứ tự nhờ ref().',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'core.dim_customers = 60,000; core.dim_products = 2,000 with tags typed VARCHAR[]; core.dim_stores = 400.',
          'core.dim_customers = 60.000; core.dim_products = 2.000 với cột tags có kiểu VARCHAR[]; core.dim_stores = 400.',
        ),
      ],
    },

    /* ═══════════════ T5 ═══════════════ */
    {
      id: 'a15-t5',
      num: 5,
      title: bi('fct_orders: your A07/A08 machinery, formalized', 'fct_orders: bộ máy A07/A08 của bạn, được hình thức hoá'),
      goal: bi(
        'One config block replaces the twelve lines you wrote by hand.',
        'Một khối config thay cho mười hai dòng bạn đã viết tay.',
      ),
      steps: [
        {
          title: bi('The model', 'Bản thân model'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `-- Mỗi dòng một đơn hàng, bản sửa mới nhất thắng. ĐÂY CHÍNH LÀ transaction của
-- A07 và chiến lược (c) của A08: delete+insert của dbt xoá mọi order_date có mặt
-- trong lô, rồi chèn lô vào — một phép refresh phân vùng theo ngày.
{{ config(
    materialized='incremental',
    incremental_strategy='delete+insert',
    unique_key='order_date'
) }}

with batch as (

    select * from {{ ref('stg_shopcore__orders') }}
    {% if is_incremental() %}
    -- cặp --start/--end của runner A11, tái sinh dưới dạng var của dbt
    where order_date between date '{{ var("start_date") }}'
                         and date '{{ var("end_date") }}'
    {% endif %}

),

latest as (
    -- chiến lược (a) của A08: khử trùng lặp lúc đọc, updated_at mới nhất thắng
    select *,
           row_number() over (partition by order_id_num
                              order by updated_at desc) as rn
    from batch
)

select
    order_id, order_id_num, customer_id, store_id,
    order_ts, updated_at, status, payment_method,
    order_total, currency, discount_amount, channel, loyalty_tier,
    items, meta, order_date
from latest
where rn = 1`,
            },
          ],
        },
        {
          title: bi('The incremental lifecycle', 'Vòng đời của model tăng dần'),
          blocks: [
            {
              kind: 'why',
              body: bi(
                'First run, table absent: is_incremental() is false, the date filter vanishes, dbt runs CREATE TABLE over all history. That is your A11 full backfill. Later runs: is_incremental() is true, the batch is only the window, dbt materializes it to a temp table, then deletes every order_date present in the batch from the target and inserts the batch, transactionally. Open your A07 script next to this — same machine, dbt just writes the boilerplate.',
                'Lần chạy đầu, bảng chưa có: is_incremental() trả false, bộ lọc ngày biến mất, dbt chạy CREATE TABLE trên toàn bộ lịch sử. Đó chính là lần backfill toàn phần của A11. Các lần sau: is_incremental() trả true, lô chỉ còn đúng cửa sổ, dbt vật chất hoá nó ra bảng tạm, rồi xoá khỏi bảng đích mọi order_date có trong lô và chèn lô vào, gọn trong một transaction. Hãy mở script A07 đặt cạnh cái này: cùng một bộ máy, dbt chỉ gõ hộ phần khuôn mẫu.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Why the window is safe: the lake already holds late corrections inside the correct order_date partitions — you proved that in A02 and fixed the ids in A10 — so rebuilding a date range from the lake is complete by construction. The dedupe window then keeps only the newest updated_at per order_id_num, so corrections win, exactly as your A08 reconciliation demanded.',
                'Vì sao cửa sổ đó an toàn: lake vốn đã chứa các bản sửa muộn nằm đúng trong phân vùng order_date của chúng, điều bạn đã chứng minh ở A02 và đã sửa phần id ở A10, nên dựng lại một dải ngày từ lake là đầy đủ theo cấu tạo. Rồi cửa sổ khử trùng lặp chỉ giữ bản có updated_at mới nhất cho mỗi order_id_num, nên bản sửa thắng, đúng như phép đối soát A08 đòi hỏi.',
              ),
            },
            {
              kind: 'code',
              lang: 'powershell',
              body: `dbt build --select fct_orders`,
            },
            {
              kind: 'text',
              body: bi(
                'Then look at what dbt actually ran: the compiled SQL sits at dbt_lab/target/run/etl_lab_dbt/models/core/fct_orders.sql. On this first run it is a plain CREATE TABLE over all history, with no delete+insert anywhere, because is_incremental() was false. After Task 8\'s windowed run, reopen the same file — the A07 DELETE and INSERT dance will be sitting in it. See both with your own eyes.',
                'Rồi hãy nhìn thứ dbt thật sự đã chạy: file SQL đã biên dịch nằm ở dbt_lab/target/run/etl_lab_dbt/models/core/fct_orders.sql. Ở lần chạy đầu này nó chỉ là một câu CREATE TABLE trên toàn bộ lịch sử, không có delete+insert nào cả, vì is_incremental() trả false. Sau lần chạy theo cửa sổ ở Task 8, hãy mở lại đúng file đó: cặp DELETE và INSERT của A07 sẽ nằm sẵn trong đấy. Hãy tận mắt nhìn cả hai.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'The model builds green (roughly 10–60 s at small scale) and core.fct_orders has 4,053,208 rows — 4,116,024 lake rows minus 62,816 folded duplicate/correction rows. Journal that delta: it is the across-files dedupe you measured in A08.',
          'Model build xanh (chừng 10–60 giây ở scale small) và core.fct_orders có 4.053.208 dòng — bằng 4.116.024 dòng lake trừ 62.816 dòng trùng lặp và bản sửa đã gộp lại. Hãy ghi journal con số chênh lệch đó: chính là phần khử trùng lặp xuyên file mà bạn đã đo ở A08.',
        ),
      ],
    },

    /* ═══════════════ T6 ═══════════════ */
    {
      id: 'a15-t6',
      num: 6,
      title: bi('fct_order_items and the marts', 'fct_order_items và các mart'),
      goal: bi(
        'Unnest downstream of the deduped fact, so no item is ever counted twice.',
        'Bung mảng ở phía sau bảng fact đã khử trùng lặp, để không dòng hàng nào bị đếm hai lần.',
      ),
      steps: [
        {
          title: bi('Items', 'Bảng dòng hàng'),
          blocks: [
            {
              kind: 'code',
              lang: 'sql',
              body: `{{ config(
    materialized='incremental',
    incremental_strategy='delete+insert',
    unique_key='order_date'
) }}

with orders as (

    select order_id, order_id_num, order_date, store_id, customer_id,
           currency, items
    from {{ ref('fct_orders') }}
    {% if is_incremental() %}
    where order_date between date '{{ var("start_date") }}'
                         and date '{{ var("end_date") }}'
    {% endif %}

)

select
    order_id, order_id_num, order_date, store_id, customer_id, currency,
    generate_subscripts(items, 1)      as line_no,
    unnest(items, recursive := true)   -- -> sku, qty, unit_price, disc
from orders
where items is not null`,
            },
            {
              kind: 'why',
              body: bi(
                'generate_subscripts is the one new SQL function today: it emits 1, 2, 3… in lockstep with unnest, giving each item its line number.',
                'Hàm generate_subscripts là hàm SQL mới duy nhất của hôm nay: nó phát ra 1, 2, 3… song song nhịp với unnest, nhờ vậy mỗi dòng hàng có số thứ tự của mình.',
              ),
            },
          ],
        },
        {
          title: bi('Two marts', 'Hai bảng mart'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'models/marts/daily_store_sales.sql is given, with one A10 scar folded in: currency joins the grain, because summing USD and VND into one number is a ×25,000 lie you have already been burned by.',
                'File models/marts/daily_store_sales.sql được cho sẵn, kèm một vết sẹo của A10 đã gấp vào trong: currency được đưa vào grain, vì cộng USD với VND thành một con số là một lời nói dối gấp 25.000 lần mà bạn từng bị bỏng rồi.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `select
    o.order_date, o.store_id, o.currency,
    any_value(s.store_name)                          as store_name,
    any_value(s.region)                              as region,
    count(*)                                         as orders,
    count(distinct o.customer_id)                    as customers,
    sum(o.order_total)                               as gross_revenue,
    round(avg(o.order_total), 2)                     as avg_order_value,
    count(*) filter (where o.status = 'cancelled')   as cancelled_orders,
    count(*) filter (where o.order_total is null)    as orders_missing_total
from {{ ref('fct_orders') }} o
left join {{ ref('dim_stores') }} s using (store_id)
group by 1, 2, 3`,
            },
            {
              kind: 'text',
              body: bi(
                'You write models/marts/category_daily_revenue.sql: from fct_order_items, LEFT JOIN dim_products on sku, grain = (order_date, category, currency), measures = distinct orders, sum(qty) as units, sum(qty * unit_price) as gross_revenue. LEFT JOIN on purpose — A04\'s 0.2% orphan SKUs must land visibly in a NULL category, not vanish.',
                'Phần bạn tự viết là models/marts/category_daily_revenue.sql: lấy từ fct_order_items, LEFT JOIN với dim_products theo sku, grain là (order_date, category, currency), các measure gồm số đơn phân biệt, sum(qty) là số lượng, và sum(qty * unit_price) là doanh thu gộp. Dùng LEFT JOIN là cố ý: khoảng 0,2% SKU mồ côi của A04 phải rơi vào một category NULL nhìn thấy được, chứ không được biến mất.',
              ),
            },
            {
              kind: 'code',
              lang: 'powershell',
              body: `dbt build`,
            },
          ],
        },
      ],
      accept: [
        bi(
          'Everything green; core.fct_order_items = 10,253,421 (≈2.53 items per order — sanity check against A04); marts.daily_store_sales = 50,282; marts.category_daily_revenue = 1,990, of which 143 rows have NULL category. If the NULL-category rows are missing, you inner-joined.',
          'Mọi thứ đều xanh; core.fct_order_items = 10.253.421 (≈2,53 dòng hàng mỗi đơn — đối chiếu lại với A04 cho chắc); marts.daily_store_sales = 50.282; marts.category_daily_revenue = 1.990, trong đó 143 dòng có category NULL. Nếu không thấy mấy dòng category NULL thì bạn đã lỡ dùng inner join.',
        ),
      ],
    },

    /* ═══════════════ T7 ═══════════════ */
    {
      id: 'a15-t7',
      num: 7,
      title: bi('Tests: the A05 suite comes home', 'Test: bộ kiểm của A05 trở về nhà'),
      goal: bi(
        'The contract\'s per-column promises, executable — with honest severities.',
        'Các lời hứa theo từng cột của contract, ở dạng chạy được, với mức nghiêm khắc trung thực.',
      ),
      steps: [
        {
          title: bi('Generic tests in YAML', 'Generic test trong YAML'),
          blocks: [
            {
              kind: 'code',
              lang: 'text',
              body: `version: 2

models:
  - name: fct_orders
    description: Mỗi dòng một đơn hàng, schema canonical, đã áp bản sửa mới nhất.
    columns:
      - name: order_id
        data_tests: [not_null, unique]
      - name: order_id_num
        data_tests: [not_null]
      - name: order_date
        data_tests: [not_null]
      - name: status
        data_tests:
          - accepted_values:
              arguments:
                values: ['created', 'paid', 'shipped', 'delivered',
                         'cancelled', 'refunded']
      - name: store_id
        data_tests:
          - not_null
          - relationships:
              arguments:
                to: ref('dim_stores')
                field: store_id
      - name: customer_id
        data_tests:
          - relationships:
              arguments:
                to: ref('dim_customers')
                field: customer_id
              config:
                severity: warn   # ~0.05% id mồ côi là rác đã ghi nhận (A05)

  - name: dim_customers
    columns:
      - name: customer_id
        data_tests: [not_null, unique]

  - name: dim_products
    columns:
      - name: sku
        data_tests: [not_null, unique]`,
            },
            {
              kind: 'trap',
              body: bi(
                'Syntax for dbt ≥ 1.12: the key is data_tests:, and tests that take parameters nest them under arguments:.',
                'Cú pháp cho dbt từ 1.12 trở lên: khoá là data_tests:, và các test có tham số thì đặt tham số lồng dưới arguments:.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Each entry compiles to a SELECT that must return zero rows — dbt even saves them under target/compiled/, and they read exactly like your A05 queries, because they are your A05 queries. The rules are not invented here either: generic tests are the contract\'s per-column schema promises made executable. accepted_values is allowed_values; relationships is references, straight out of the schema: block of your contract YAML.',
                'Mỗi mục biên dịch ra một câu SELECT bắt buộc trả về 0 dòng; dbt còn lưu chúng dưới target/compiled/, và chúng đọc lên y hệt mấy query A05 của bạn, vì đúng là mấy query A05 của bạn. Mà mấy luật này cũng không phải bịa ra ở đây: generic test chính là các lời hứa theo cột trong contract được biến thành thứ chạy được. accepted_values chính là allowed_values; relationships chính là references, lấy thẳng từ khối schema: trong file contract YAML.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'The design decision worth staring at is severity: warn on the customer relationship. You know orphan customer ids exist — about 0.05%, documented since A05. A test that fails on documented dirt trains people to ignore red. Warn means known and watched; error means stop the line. That is your A05 threshold philosophy expressed in dbt: tolerances come from the contract, not from perfection.',
                'Quyết định thiết kế đáng ngồi ngắm là dòng severity: warn ở phép kiểm quan hệ customer. Bạn biết rõ có tồn tại customer_id mồ côi, chừng 0,05%, đã ghi nhận từ A05. Một test cứ đỏ vì thứ rác đã được ghi nhận sẽ dạy người ta thói quen làm ngơ màu đỏ. Warn nghĩa là đã biết và đang theo dõi; error nghĩa là dừng dây chuyền. Đó là triết lý ngưỡng của A05 nói bằng dbt: dung sai đến từ contract, không đến từ sự hoàn hảo.',
              ),
            },
          ],
        },
        {
          title: bi('The singular test', 'Singular test'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'One check cannot be expressed column by column: the items-sum reconciliation. That is a singular test — plain SQL in dbt_lab/tests/assert_order_totals_reconcile.sql.',
                'Có một phép kiểm không thể diễn đạt theo từng cột: phép đối soát tổng tiền với tổng các dòng hàng. Đó là một singular test, tức SQL thuần trong dbt_lab/tests/assert_order_totals_reconcile.sql.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `-- Phép kiểm bắc-nhiều-trường của A05 dưới dạng singular test, và MÙ ERA nhờ A10:
-- order_total = items_total - discount_amount đúng cho cả v1/v2/v3, vì các dòng
-- v1 đã được canonical hoá với discount_amount = 0.
-- ~0,5% lệch là rác đã ghi nhận; chỉ đỏ khi vượt dung sai của contract
-- (total_vs_items_mismatch = 1% — đúng con số A05 nạp từ file YAML).
with items_sum as (
    select order_id, sum(qty * unit_price) as items_total
    from {{ ref('fct_order_items') }}
    group by 1
),

checked as (
    select o.order_id, o.order_total, o.discount_amount, i.items_total
    from {{ ref('fct_orders') }} o
    join items_sum i using (order_id)
    where o.order_total is not null
)

select
    count(*) filter (
        where abs(order_total - (items_total - discount_amount)) > 0.01
    )                          as bad_rows,
    count(*)                   as checked_rows
from checked
having bad_rows > 0.01 * checked_rows`,
            },
            {
              kind: 'why',
              body: bi(
                'Zero rows = pass. The HAVING is the threshold: on the baseline data about 0.6% of orders mismatch, well under the 1% tolerance, so the test passes while the dirt exists — precisely the A05 lesson about thresholds versus perfection. And it is era-blind: one formula for v1, v2 and v3, possible only because your A10 canonicalization set discount_amount = 0 for v1. Savor that a second time.',
                'Không dòng nào tức là pass. Mệnh đề HAVING chính là cái ngưỡng: trên bộ dữ liệu chuẩn thì chừng 0,6% số đơn bị lệch, thấp hơn hẳn dung sai 1%, nên test vẫn pass trong khi rác vẫn còn đó — đúng bài học của A05 về ngưỡng so với sự hoàn hảo. Và nó mù era: một công thức duy nhất cho cả v1, v2, v3, làm được chỉ vì phép canonical hoá ở A10 đã đặt discount_amount = 0 cho v1. Hãy tận hưởng chuyện đó thêm lần nữa.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'dbt build runs seeds, models and tests in DAG order — and tests gate: if fct_orders failed a test, downstream models would be skipped, like your runner refusing to build marts on a red day.',
                'Lệnh dbt build chạy seed, model và test theo thứ tự của DAG, và test có vai trò cổng chặn: nếu fct_orders trượt một test thì các model phía dưới bị bỏ qua, y như cái runner của bạn từ chối dựng marts vào một ngày đỏ.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Name the successor, the last one in this lab. dbt\'s built-in generic tests are deliberately few. The community package dbt-expectations ports the Great Expectations assertion library into dbt tests — distribution shape, string patterns, row-count-between, column-type checks — installed via packages.yml plus dbt deps. We do not install it: your four generic tests plus one singular test already express every rule the contract states, and a package that adds fifty assertions you have not justified is how test suites turn into noise. Know the name; reach for it when a real rule needs a shape dbt Core cannot say.',
                'Gọi tên người kế nhiệm, lần cuối trong khoá lab này. Bộ generic test có sẵn của dbt cố tình ít ỏi. Gói cộng đồng dbt-expectations mang thư viện khẳng định của Great Expectations vào dbt: hình dạng phân phối, mẫu chuỗi, khoảng số dòng, kiểm kiểu cột — cài qua packages.yml rồi dbt deps. Ở đây ta không cài: bốn generic test cộng một singular test của bạn đã diễn đạt hết mọi luật contract phát biểu, mà một gói thêm năm chục khẳng định bạn chưa biện minh được chính là cách một bộ test biến thành tiếng ồn. Cứ biết tên nó; khi nào có một luật thật cần hình dạng mà dbt Core không nói nổi thì hãy với tay lấy.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'The summary reads PASS=24 WARN=1 ERROR=0 SKIP=0 … TOTAL=25, and the one WARN is the customer relationship with 2,056 orphan rows at small scale — journal that number.',
          'Bảng tổng kết đọc ra PASS=24 WARN=1 ERROR=0 SKIP=0 … TOTAL=25, và cái WARN duy nhất là phép kiểm quan hệ customer với 2.056 dòng mồ côi ở scale small — hãy ghi con số đó vào journal.',
        ),
      ],
    },

    /* ═══════════════ T8 ═══════════════ */
    {
      id: 'a15-t8',
      num: 8,
      title: bi('The incremental backfill drill', 'Bài tập backfill theo cửa sổ'),
      goal: bi(
        'Prove the property the lab has hammered since A07: safe to rerun, any window, any number of times.',
        'Chứng minh cái tính chất khoá lab nện từ A07 tới giờ: chạy lại bao nhiêu lần, cửa sổ nào cũng an toàn.',
      ),
      steps: [
        {
          title: bi('Three runs, three timings', 'Ba lần chạy, ba con số thời gian'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `# 1) nền: build toàn phần (đã có từ Task 7 — chừng 20-90 giây ở scale small)
# 2) cửa sổ 3 ngày, đúng khuôn --start/--end của A11:
dbt build --vars "{start_date: 2026-08-01, end_date: 2026-08-03}"
# 3) chạy LẠI đúng lệnh đó — bài kiểm chạy hai lần của A07:
dbt build --vars "{start_date: 2026-08-01, end_date: 2026-08-03}"`,
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT count(*), count(DISTINCT order_id) FROM core.fct_orders;   -- 4053208, 4053208
SELECT order_date, count(*) FROM core.fct_orders
WHERE order_date BETWEEN DATE '2026-08-01' AND DATE '2026-08-03'
GROUP BY 1 ORDER BY 1;    -- 2026-08-01: 46273 · 08-02: 45874 · 08-03: 56940`,
            },
            {
              kind: 'trap',
              body: bi(
                'Run those checks in a DuckDB session, then close it before the next dbt run — one process, one writer.',
                'Chạy mấy phép kiểm đó trong một phiên DuckDB, rồi đóng phiên lại trước lần chạy dbt kế tiếp: một tiến trình, một người ghi.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Counts identical after a rerun = delete+insert idempotency, the thing you built by hand in A07 and here got for one line of config(). This is also the moment Task 5 promised: reopen target/run/etl_lab_dbt/models/core/fct_orders.sql and the DELETE + INSERT pair is now sitting in it.',
                'Số đếm y hệt sau lần chạy lại chính là tính idempotent của delete+insert, thứ bạn tự tay dựng ở A07 mà ở đây chỉ tốn một dòng config(). Đây cũng là khoảnh khắc Task 5 đã hẹn: hãy mở lại target/run/etl_lab_dbt/models/core/fct_orders.sql, giờ cặp DELETE và INSERT đã nằm sẵn trong đó.',
              ),
            },
          ],
        },
        {
          title: bi('Two variations, and one trap to write down', 'Hai biến thể, và một cái bẫy phải ghi lại'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `dbt build --select fct_orders+ --vars "{start_date: 2026-08-01, end_date: 2026-08-03}"
dbt build --full-refresh      # xoá và dựng lại incremental từ đầu`,
            },
            {
              kind: 'why',
              body: bi(
                'fct_orders+ means "and everything downstream" — the surgical version, dims and staging untouched. --full-refresh is your A11 --force: a restatement, with everything that word implied about warning consumers first. The windowed run should land in roughly a third of the full-build time at small scale, since dims and marts still rebuild fully and only the facts are windowed; at full scale the gap grows much larger because the facts dominate.',
                'Ký hiệu fct_orders+ nghĩa là "và mọi thứ phía dưới", tức phiên bản mổ chính xác, không đụng tới dims và staging. Còn --full-refresh chính là --force của A11: một lần restatement, kèm theo tất cả những gì chữ đó hàm ý về việc phải báo trước cho bên tiêu thụ. Lần chạy theo cửa sổ nên rơi vào cỡ một phần ba thời gian build toàn phần ở scale small, vì dims và marts vẫn dựng lại đầy đủ, chỉ có mấy bảng fact là theo cửa sổ; lên scale full thì khoảng cách giãn ra nhiều hơn hẳn vì fact chiếm phần lớn.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Write this in your journal before it bites: the late-data allowance still applies. When tomorrow\'s file D lands in the lake, partitions D−7 through D changed (A06 contract, measured in A08). The correct daily window is start_date = D−7, end_date = D — never just D. dbt formalized your pipeline, not your calendar math.',
                'Hãy ghi vào journal trước khi bị cắn: cái khoản dữ liệu về muộn vẫn còn hiệu lực. Khi file của ngày D về tới lake, các phân vùng từ D−7 tới D đều thay đổi (theo contract A06, đo ở A08). Cửa sổ chạy hằng ngày đúng phải là start_date = D−7, end_date = D, chứ không bao giờ chỉ mỗi D. dbt hình thức hoá cái pipeline của bạn, chứ không hình thức hoá phép tính lịch của bạn.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Both windowed runs are green with stable counts, timings journaled, and the D−7 rule is written down.',
          'Cả hai lần chạy theo cửa sổ đều xanh với số đếm không đổi, các mốc thời gian đã ghi journal, và luật D−7 đã được viết ra.',
        ),
      ],
    },

    /* ═══════════════ T9 ═══════════════ */
    {
      id: 'a15-t9',
      num: 9,
      title: bi('The real thing: full scale', 'Hàng thật: chạy ở scale full'),
      goal: bi(
        'One flag. That is the payoff of the two-target profile.',
        'Một cái cờ. Đó là phần thưởng của việc profile có hai target.',
      ),
      steps: [
        {
          title: bi('Switch targets and wait', 'Đổi target rồi ngồi chờ'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `dbt debug --target full
dbt build --target full`,
            },
            {
              kind: 'expect',
              body: bi(
                'Roughly 10 to 30 minutes on the baseline machine for the first full build: about 82M order rows in the lake, about 200M item rows through unnest. Watch Task Manager — memory stays under the 8 GB limit, and spill may appear in <DATA_ROOT>/tmp, exactly as A13 taught you to expect.',
                'Chừng 10 tới 30 phút trên máy chuẩn cho lần build toàn phần đầu tiên: khoảng 82 triệu dòng đơn hàng trong lake, khoảng 200 triệu dòng hàng sau khi unnest. Hãy mở Task Manager ra xem: bộ nhớ nằm dưới mức giới hạn 8 GB, và có thể thấy spill xuất hiện trong <DATA_ROOT>/tmp, đúng như A13 đã dạy bạn chờ đợi.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Then run the 3-day window at full scale, twice, and journal all three wall clocks. Full build versus windowed versus windowed-again is the clearest before-and-after of the whole lab.',
                'Sau đó chạy cửa sổ 3 ngày ở scale full, hai lần, rồi ghi journal cả ba mốc thời gian thực. So build toàn phần với chạy theo cửa sổ rồi lại chạy cửa sổ lần nữa chính là cặp trước-sau rõ ràng nhất của cả khoá lab.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'dbt build --target full is green with the same single WARN; the windowed rerun is green with stable counts; three timings in the journal.',
          'Lệnh dbt build --target full xanh với đúng một WARN như cũ; lần chạy lại theo cửa sổ xanh với số đếm không đổi; ba mốc thời gian đã nằm trong journal.',
        ),
      ],
    },

    /* ═══════════════ T10 ═══════════════ */
    {
      id: 'a15-t10',
      num: 10,
      title: bi('Describe it: the metadata a catalog catalogues', 'Viết mô tả: thứ metadata mà một cuốn danh mục đem ra kiểm kê'),
      goal: bi(
        'The one part no tool can produce for you: what a column actually means.',
        'Cái phần duy nhất không công cụ nào làm hộ được: một cột thật ra nghĩa là gì.',
      ),
      steps: [
        {
          title: bi('Write real descriptions', 'Viết mô tả cho ra mô tả'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Everything you have built so far is data. Metadata is the data about it: types, tests, freshness, dependencies — and the one part no tool can produce for you, what a column actually means. dbt collects the mechanical metadata for free. The meanings you write yourself, and schema.yml is where they go.',
                'Mọi thứ bạn dựng tới giờ đều là dữ liệu. Metadata là dữ liệu nói về dữ liệu đó: kiểu, test, độ tươi, các phụ thuộc — và cái phần duy nhất không công cụ nào làm hộ được, đó là một cột thật ra nghĩa là gì. dbt gom phần metadata cơ học miễn phí. Còn phần nghĩa thì bạn tự viết, và chỗ để viết là file schema.yml.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `models:
  - name: fct_orders
    description: >
      Mỗi dòng là một đơn hàng, schema canonical, đã áp bản sửa mới nhất. Dựng từ
      lake bằng cách giữ bản có \`updated_at\` cao nhất cho mỗi \`order_id_num\`, nên
      một đơn được sửa ở file sau chỉ xuất hiện một lần, ở trạng thái cuối cùng.
      Dựng lại theo cửa sổ ngày (delete+insert), nên nạp lại dải ngày nào cũng an toàn.
    columns:
      # order_id_num, status và store_id lược bớt ở đây cho gọn — hãy GIỮ NGUYÊN
      # các mục Task 7 của chúng, kèm test, nếu không TOTAL tụt từ 25 xuống 21.
      - name: order_id
        description: >
          Khoá đơn hàng canonical, tiền tố \`ORD-\` cộng số 10 chữ số đệm 0. Ổn định
          qua cả ba era schema — id dạng số của v1/v2 đã được định dạng lại về hình
          này ở A10 để bản sửa của v3 khớp được với lịch sử v1.
        data_tests: [not_null, unique]
      - name: order_date
        description: >
          Ngày nghiệp vụ của đơn, dẫn xuất từ \`order_ts\` đã làm sạch. Đây là khoá
          phân vùng của lake và cũng là khoá delete+insert của model này — nạp lại
          một dải ngày sẽ thay thế đúng bằng ấy dòng.
        data_tests: [not_null]
      - name: customer_id
        description: >
          Khách đặt đơn; khoá ngoại về \`dim_customers\`. NULL ở đây CÓ NGHĨA — contract
          nói đó là mua không đăng nhập, không phải dữ liệu thiếu. Khoảng 0,05% id là
          mồ côi (rác đã ghi nhận từ A05), và đó là lý do phép kiểm quan hệ chỉ cảnh
          báo chứ không làm đỏ.
        data_tests:
          - relationships:
              arguments:
                to: ref('dim_customers')
                field: customer_id
              config:
                severity: warn
      - name: currency
        description: >
          Mã tiền tệ ISO của \`order_total\` và giá các dòng hàng. ĐỪNG BAO GIỜ cộng
          xuyên tiền tệ — số tiền VND lớn hơn USD chừng 25.000 lần, và đó là lý do
          mọi mart trong dự án này đều mang currency trong grain.`,
            },
            {
              kind: 'why',
              body: bi(
                'Read what those sentences are doing. Not one of them says "the order id" or "the order date". A description that only restates the column name is worse than no description at all: it makes the catalog look documented while telling the reader nothing, and nobody ever reopens a field that already has text in it. Every description above carries something the name cannot — a decision (why the id has that shape), a constraint (never sum across currency), or a warning (NULL means guest checkout, not a bug).',
                'Hãy đọc kỹ mấy câu đó đang làm gì. Không câu nào viết "mã đơn hàng" hay "ngày đặt hàng". Một dòng mô tả chỉ chép lại tên cột thì còn tệ hơn để trống: nó làm cuốn danh mục trông như đã có tài liệu trong khi chẳng nói với người đọc điều gì, mà một ô đã có chữ thì không ai mở lại lần nữa. Mọi dòng mô tả ở trên đều mang theo thứ cái tên không nói được: một quyết định (vì sao mã đơn có hình dạng đó), một ràng buộc (đừng cộng xuyên tiền tệ), hoặc một lời cảnh báo (NULL nghĩa là mua không đăng nhập, không phải lỗi).',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Note where fct_orders starts: "one row per order" — its grain — before a word about what the table is for. That is the rule, not a house style: every model description opens with its grain sentence, the same "one row = one …" A03 made you write as a comment on the DDL. The comment is read by whoever edits the model; the catalog is where everybody else meets the table.',
                'Để ý chỗ fct_orders bắt đầu: "mỗi dòng là một đơn hàng", tức grain của nó, trước cả một chữ nào về việc bảng này dùng để làm gì. Đó là luật chứ không phải gu riêng: mọi mô tả model đều mở đầu bằng câu về grain, đúng cái câu "một dòng = một …" mà A03 bắt bạn viết làm chú thích cho DDL. Chú thích thì dành cho người sửa model đọc; còn cuốn danh mục mới là chỗ tất cả những người còn lại gặp cái bảng.',
              ),
            },
          ],
        },
        {
          title: bi('Two more files, descriptions only', 'Thêm hai file, chỉ có mô tả'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'No tests in these, so your TOTAL=25 does not move. First models/marts/schema.yml, where the audience is least likely to have read your SQL.',
                'Hai file này không chứa test nào, để con số TOTAL=25 không xê dịch. Trước hết là models/marts/schema.yml, nơi người đọc ít có khả năng đã xem SQL của bạn nhất.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `version: 2

models:
  - name: daily_store_sales
    description: >
      Mỗi dòng là một bộ (order_date, store_id, currency) — hiệu quả bán của từng
      cửa hàng theo ngày: số đơn, số khách phân biệt, doanh thu và số đơn huỷ.
      Currency nằm trong grain là CỐ Ý — cộng USD với VND thành một số là lời nói
      dối gấp 25.000 lần, đúng vết sẹo A10 mà mart này từ chối lặp lại.
    columns:
      - name: gross_revenue
        description: >
          Tổng \`fct_orders.order_total\` theo ngày, cửa hàng và tiền tệ. ĐÃ BAO GỒM
          đơn huỷ và đơn hoàn tiền; doanh thu thuần là một câu hỏi khác và sẽ là
          một mart khác.
      - name: orders_missing_total
        description: >
          Số đơn có tổng tiền không parse được thành số. Được đưa ra thành cột chứ
          không giấu đi — nó là phần chú thích về mẫu số cho \`avg_order_value\`.`,
            },
            {
              kind: 'text',
              body: bi(
                'You write models/staging/schema.yml the same way: the four stg_shopcore__* models, plus the country_map seed under a seeds: key in the same file. Say what the layer is — thin, because A10 aligned the three eras before anything reached the lake.',
                'Phần bạn tự viết là models/staging/schema.yml theo cùng kiểu: bốn model stg_shopcore__*, cộng seed country_map nằm dưới khoá seeds: trong cùng file đó. Hãy nói rõ tầng này là gì: mỏng, vì A10 đã căn chỉnh ba era trước khi bất cứ thứ gì chạm tới lake.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Two facts belong in descriptions specifically because no reader can infer them from the SQL. stg_shopcore__customers.email_hash exists because of A06\'s data-classification clause — the raw address is deliberately not selected, not accidentally missing. And dim_products.unit_price is today\'s list price, while fct_order_items.unit_price is what that order was actually charged. Both are exactly the wrong-query-waiting-to-happen that a catalog exists to prevent.',
                'Có hai sự thật bắt buộc phải nằm trong mô tả, chính xác vì không người đọc nào suy ra được từ SQL. Cột stg_shopcore__customers.email_hash tồn tại là do điều khoản phân loại dữ liệu của A06: địa chỉ thô bị cố tình không select, chứ không phải vô tình thiếu. Và dim_products.unit_price là giá niêm yết hôm nay, còn fct_order_items.unit_price là số tiền đơn đó thật sự bị tính. Cả hai đúng là kiểu câu-query-sai-đang-chờ-xảy-ra mà một cuốn danh mục sinh ra để ngăn chặn.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Every model and the seed carry a real description whose first sentence states its grain; dbt build still ends PASS=24 WARN=1 ERROR=0 … TOTAL=25 (descriptions are not tests); and you can point at three descriptions that would have saved a colleague a wrong query.',
          'Mọi model và cả seed đều có mô tả thật, với câu đầu tiên nói rõ grain; lệnh dbt build vẫn kết thúc bằng PASS=24 WARN=1 ERROR=0 … TOTAL=25 (mô tả không phải là test); và bạn chỉ ra được ba dòng mô tả đáng lẽ đã cứu một đồng nghiệp khỏi một câu query sai.',
        ),
      ],
    },

    /* ═══════════════ T11 ═══════════════ */
    {
      id: 'a15-t11',
      num: 11,
      title: bi('dbt docs generate IS a data catalog', 'dbt docs generate CHÍNH LÀ một data catalog'),
      goal: bi(
        'Answer the three questions a stranger asks, without opening a .sql file.',
        'Trả lời được ba câu hỏi của một người lạ mà không cần mở file .sql nào.',
      ),
      steps: [
        {
          title: bi('Generate and serve', 'Sinh ra và phục vụ'),
          blocks: [
            {
              kind: 'code',
              lang: 'powershell',
              body: `dbt docs generate
dbt docs serve      # mở http://localhost:8080 — Ctrl+C để dừng`,
            },
            {
              kind: 'why',
              body: bi(
                'generate ends with "Catalog written to …\\dbt_lab\\target\\catalog.json". dbt uses the word itself, and it means it. A data catalog is the searchable inventory of what data exists, what it means, and whether you can trust it — and the site you just built is one. Two files feed it: target/manifest.json holds what you declared (descriptions, tests, dependencies) and target/catalog.json holds what the warehouse reports (actual column types and stats). The site is the join of the two, which is why Task 10 had to come first: docs generate publishes your metadata, it does not invent it.',
                'Lệnh generate kết thúc bằng dòng "Catalog written to …\\dbt_lab\\target\\catalog.json". dbt dùng đúng chữ catalog, và nó nói thật. Một data catalog là bản kiểm kê tra cứu được về chuyện dữ liệu nào đang tồn tại, chúng nghĩa là gì, và có tin được không — và trang bạn vừa dựng đúng là một cuốn như vậy. Hai file nuôi nó: target/manifest.json giữ những gì bạn khai (mô tả, test, phụ thuộc), còn target/catalog.json giữ những gì kho dữ liệu báo về (kiểu cột thật và thống kê). Trang web là phép join của hai file đó, và đó là lý do Task 10 phải làm trước: docs generate xuất bản metadata của bạn chứ không bịa ra nó.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Click into fct_orders, then daily_store_sales. Ask the three questions a stranger asks — what is this, can I trust it, who do I ask — and notice you can now answer all three without opening a .sql file. That is the entire product.',
                'Hãy bấm vào fct_orders, rồi tới daily_store_sales. Đặt ba câu hỏi mà một người lạ luôn hỏi: cái này là gì, tin được không, hỏi ai — và để ý rằng giờ bạn trả lời được cả ba mà không phải mở file .sql nào. Đó chính là toàn bộ sản phẩm.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'The commercial versions are DataHub, OpenMetadata, Unity Catalog and AWS Glue Data Catalog; the lab installs none of them, for the same reason it skipped Great Expectations — own backend, own config, a learning curve that would bury the lesson. What they add over dbt docs is coverage and automation: everything in the company rather than everything in one dbt project, usage statistics, stewardship workflows, access policies, and column-level lineage. dbt does reach past its own DAG in one way worth knowing: exposures: let you declare the dashboards and reports that read your marts, so "what breaks?" can name a dashboard and not just a table.',
                'Các bản thương mại là DataHub, OpenMetadata, Unity Catalog và AWS Glue Data Catalog; khoá lab không cài cái nào, cùng lý do với việc bỏ qua Great Expectations: mỗi thứ một backend riêng, cấu hình riêng, và một đường cong học tập đủ sức chôn vùi bài học. Thứ chúng có hơn dbt docs là độ phủ và mức tự động hoá: bao quát cả công ty chứ không chỉ một dự án dbt, thống kê mức sử dụng, quy trình quản trị dữ liệu, chính sách truy cập, và lineage ở mức cột. Nhưng dbt cũng vươn ra ngoài DAG của nó theo đúng một cách đáng biết: khối exposures: cho phép khai báo các dashboard và báo cáo đang đọc mart của bạn, nhờ vậy câu hỏi "hỏng cái gì" có thể gọi tên một dashboard chứ không chỉ một cái bảng.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'Notice what your catalog already carries from the rest of the lab: ownership and escalation live in the A06 contract, the classification decision shows up as email_hash, quality standards show up as tests with contract tolerances, row-level provenance is _data_date and _run_id pointing at ops.etl_runs, and the audit trail of who ran what when is that same ledger. Governance is not a product you buy. It is a set of decisions, and you have made all of them; the catalog is just where they finally become findable.',
                'Hãy để ý cuốn danh mục của bạn đã mang sẵn những gì từ phần còn lại của khoá lab: chuyện ai sở hữu và leo thang cho ai nằm trong contract A06, quyết định phân loại dữ liệu hiện ra thành cột email_hash, tiêu chuẩn chất lượng hiện ra thành các test với dung sai lấy từ contract, provenance mức dòng là hai cột _data_date và _run_id trỏ về ops.etl_runs, còn dấu vết kiểm toán về chuyện ai chạy cái gì lúc nào cũng chính là cuốn sổ đó. Governance không phải một sản phẩm đi mua. Nó là một tập các quyết định, mà bạn đã ra hết rồi; cuốn danh mục chỉ là nơi chúng cuối cùng cũng tìm được ra.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'The site is served, and — from the site alone, no SQL — you can say what orders_missing_total counts and which two tests guard fct_orders.order_id.',
          'Trang tài liệu đã chạy, và chỉ từ trang đó, không mở SQL, bạn nói được orders_missing_total đếm cái gì và hai test nào đang canh cột fct_orders.order_id.',
        ),
      ],
    },

    /* ═══════════════ T12 ═══════════════ */
    {
      id: 'a15-t12',
      num: 12,
      title: bi('Table-level lineage and the impact-analysis drill', 'Lineage mức bảng và bài tập phân tích ảnh hưởng'),
      goal: bi(
        'A breaking-change request arrives. Do not grep — ask the DAG.',
        'Một yêu cầu đổi cấu trúc gây vỡ vừa tới. Đừng grep, hãy hỏi cái DAG.',
      ),
      steps: [
        {
          title: bi('The scenario', 'Tình huống'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'shopcore posts to #shopcore-data-changes, the channel named in the contract\'s change_management block: "Planning to drop channel from the orders export. Any objections? Need an answer this week." Dropping a column is a breaking change — the contract owes you 30 days\' notice and a MAJOR version bump, per A10\'s amendment discipline. But before you quote a clause you need the engineering answer: what actually breaks?',
                'shopcore đăng lên kênh #shopcore-data-changes, đúng cái kênh được nêu tên trong khối change_management của contract: "Bên mình định bỏ cột channel khỏi bản xuất orders. Có ai phản đối không? Cần câu trả lời trong tuần này." Bỏ một cột là thay đổi gây vỡ, và theo contract thì bạn được nợ 30 ngày báo trước cộng một lần bump version MAJOR, theo đúng kỷ luật sửa đổi của A10. Nhưng trước khi trích điều khoản, bạn cần câu trả lời kỹ thuật đã: thật ra thì hỏng cái gì?',
              ),
            },
            {
              kind: 'code',
              lang: 'powershell',
              body: `dbt ls --quiet --select "source:shopcore.orders+"`,
            },
            {
              kind: 'expect',
              body: bi(
                'Fifteen nodes: five models (stg_shopcore__orders, fct_orders, fct_order_items, daily_store_sales, category_daily_revenue), the source itself, and nine tests. Identical on either target, because this reads your project structure, not your data.',
                'Mười lăm node: năm model (stg_shopcore__orders, fct_orders, fct_order_items, daily_store_sales, category_daily_revenue), bản thân cái source, và chín test. Kết quả giống nhau ở cả hai target, vì lệnh này đọc cấu trúc dự án chứ không đọc dữ liệu.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                '--quiet prints nodes only — without it dbt\'s three startup log lines land on stdout too and ruin any Measure-Object you pipe it into. Narrow further with --resource-type model when you only want the build list.',
                'Cờ --quiet chỉ in ra các node; thiếu nó thì ba dòng log khởi động của dbt cũng rơi vào stdout và phá hỏng mọi phép Measure-Object bạn nối ống vào. Muốn gọn hơn nữa thì thêm --resource-type model khi chỉ cần danh sách để build.',
              ),
            },
          ],
        },
        {
          title: bi('Write the reply', 'Viết thư trả lời'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Three parts, and none of them is "sure, go ahead". One: blast radius, from the DAG — five models and nine tests sit downstream of this source, name them. That is the list you would have had to assemble by memory before today. Two: the contract — column removal is MAJOR under change_management, so 30 days\' notice, a version bump, a migration note, announced on that channel; your A06 pre-load gate will fail the first file that drops the column, which is the correct behaviour per the contract\'s own "fail loudly rather than load garbage" policy. Three: what you need back — an effective date, so you can retire the column from staging after the last file that still carries it, the same era-boundary handling you built in A10.',
                'Ba phần, và không phần nào là "ừ cứ làm đi". Một: bán kính ảnh hưởng, lấy từ DAG — có năm model và chín test nằm phía dưới cái source này, hãy gọi tên chúng. Đó đúng là danh sách mà trước hôm nay bạn sẽ phải ngồi nhớ ra bằng trí nhớ. Hai: phần contract — bỏ cột là MAJOR theo khối change_management, nên phải báo trước 30 ngày, bump version, kèm ghi chú di trú, và thông báo trên đúng kênh đó; cái cổng tiền-nạp của A06 sẽ làm đỏ ngay file đầu tiên thiếu cột, và đó là hành vi ĐÚNG theo chính chính sách "thà đỏ to còn hơn nạp rác" của contract. Ba: thứ bạn cần nhận lại — một ngày hiệu lực, để bạn cho cột đó nghỉ hưu khỏi staging SAU file cuối cùng còn mang nó, đúng kiểu xử lý ranh giới era bạn đã dựng ở A10.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'Then journal the honest limitation, because it is the entire reason Task 13 exists: dbt ls told you which models read the orders source. It did not tell you which models read the channel column. Table-level lineage always over-reports — safe, but blunt.',
                'Rồi hãy ghi journal cái giới hạn trung thực này, vì nó chính là toàn bộ lý do Task 13 tồn tại: dbt ls cho bạn biết model nào đọc cái nguồn orders. Nó KHÔNG cho biết model nào đọc cái cột channel. Lineage mức bảng luôn báo dư: an toàn, nhưng cùn.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'The impact list is in your journal with all five models named, the reply cites change_management by name, and you have written down why that list is an upper bound rather than an answer.',
          'Danh sách ảnh hưởng đã nằm trong journal với đủ tên năm model, thư trả lời gọi đích danh điều khoản change_management, và bạn đã viết ra vì sao danh sách đó mới là chặn trên chứ chưa phải câu trả lời.',
        ),
      ],
    },

    /* ═══════════════ T13 ═══════════════ */
    {
      id: 'a15-t13',
      num: 13,
      title: bi('Column-level lineage, by hand', 'Lineage mức cột, làm bằng tay'),
      goal: bi(
        'Turn "five models at risk" into "two models to edit".',
        'Biến câu "năm model có nguy cơ" thành "hai model phải sửa".',
      ),
      steps: [
        {
          title: bi('Trace order_total', 'Lần theo order_total'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Column-level lineage tracks a single field through every expression that reads it. dbt Core\'s docs site does not draw it — the DAG stops at model boundaries. Commercial catalogs, and dbt\'s own paid Explorer, parse each model\'s SQL to derive it. Today you do it the way you will do it on any system that lacks the feature: by reading four files. Write down each hop with its expression.',
                'Lineage mức cột lần theo một trường duy nhất qua từng biểu thức có đọc nó. Trang tài liệu của dbt Core không vẽ tầng này, vì DAG dừng lại ở ranh giới giữa các model. Các catalog thương mại, và cả bản Explorer trả phí của chính dbt, phân tích SQL của từng model để suy ra nó. Hôm nay bạn làm theo cách bạn sẽ làm trên mọi hệ thống không có tính năng này: đọc bốn cái file. Hãy ghi lại từng chặng kèm biểu thức của nó.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `1  shopcore.orders (lake)              DECIMAL(14,2), đã sạch — bộ dọn $ / N/A /
                                       dấu phẩy thập phân của A03 chạy trước khi ghi Parquet
2  stg_shopcore__orders.order_total    đi qua, không đụng gì
3  fct_orders.order_total              chỉ sống sót trên dòng thắng của cửa sổ khử trùng
                                       lặp — một bản sửa THAY THẾ giá trị này
4  daily_store_sales.gross_revenue     sum(order_total) theo (order_date, store_id, currency)
4' daily_store_sales.avg_order_value   round(avg(order_total), 2) — cùng cột, measure thứ hai
4" daily_store_sales.orders_missing_total  count(*) filter (where order_total is null)
4‴ tests/assert_order_totals_reconcile     so với sum(qty * unit_price) − discount_amount`,
            },
            {
              kind: 'why',
              body: bi(
                'Now the payoff. marts.category_daily_revenue was in Task 12\'s list of five — and it appears nowhere in this table. It computes revenue from qty * unit_price on order lines; order_total never reaches it. Table-level lineage said "at risk". Column-level lineage says "untouched".',
                'Và đây là phần thưởng. Bảng marts.category_daily_revenue có tên trong danh sách năm model của Task 12, nhưng lại không xuất hiện ở bất cứ đâu trong bảng trên. Nó tính doanh thu từ qty * unit_price trên các dòng hàng; order_total không hề chạm tới nó. Lineage mức bảng nói "có nguy cơ". Lineage mức cột nói "không đụng gì".',
              ),
            },
          ],
        },
        {
          title: bi('Now trace channel', 'Giờ lần theo channel'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Do the same for the column shopcore actually asked about. channel reaches stg_shopcore__orders, then fct_orders — and stops. No mart selects it. No test asserts on it. So the true answer is: two models to edit, no mart output changes, no test changes. A twenty-minute job, not a project.',
                'Làm y như vậy với đúng cái cột shopcore hỏi. Cột channel đi tới stg_shopcore__orders, rồi tới fct_orders — và dừng. Không mart nào select nó. Không test nào kiểm nó. Vậy câu trả lời thật là: hai model phải sửa, không mart nào đổi đầu ra, không test nào phải đổi. Một việc hai chục phút, không phải một dự án.',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'That is a very different email from the one the DAG alone would have made you write, and it is the difference between an engineer who can be trusted with a change request and one who answers "everything might break" every time.',
                'Đó là một lá thư rất khác so với lá thư mà riêng cái DAG sẽ khiến bạn viết, và đó chính là khác biệt giữa một kỹ sư có thể tin tưởng giao cho một yêu cầu thay đổi, với một kỹ sư lần nào cũng trả lời "chắc là hỏng hết".',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'Both traces are in your journal, and you can state in one sentence what column-level lineage buys you over the DAG — and what it costs you: you did it by hand, while a catalog does it by parsing every model\'s SQL, which is precisely the automation you are paying for.',
          'Cả hai lần lần theo đều nằm trong journal, và bạn nói được trong một câu rằng lineage mức cột cho bạn thêm gì so với DAG — và nó tốn của bạn cái gì: bạn làm bằng tay, còn một cuốn catalog làm bằng cách phân tích SQL của từng model, mà đó đúng là phần tự động hoá bạn bỏ tiền ra mua.',
        ),
      ],
    },

    /* ═══════════════ T14 ═══════════════ */
    {
      id: 'a15-t14',
      num: 14,
      title: bi('Design a table that does not exist yet', 'Thiết kế một cái bảng còn chưa tồn tại'),
      goal: bi(
        'The part of this job that does not automate: deciding the shape before writing SQL.',
        'Cái phần của nghề này không tự động hoá được: quyết hình dạng trước khi viết SQL.',
      ),
      steps: [
        {
          title: bi('The request, and the six headings', 'Yêu cầu, và sáu đề mục'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Fourteen assignments handed you a target and asked you to hit it. Real work does not arrive that way: someone asks a question, and the shape of the table that answers it is your decision. The merchandising lead writes, in the same channel where shopcore posted yesterday: "Which products get returned most, by region and month? I\'d want to see it every month."',
                'Mười bốn bài trước đưa cho bạn một cái đích rồi bảo bạn bắn trúng. Việc thật không tới theo kiểu đó: có người đặt một câu hỏi, còn hình dạng của cái bảng trả lời được câu đó là quyết định của bạn. Trưởng bộ phận hàng hoá viết, ngay trong cái kênh mà hôm qua shopcore vừa đăng bài: "Sản phẩm nào bị trả lại nhiều nhất, theo vùng và theo tháng? Mình muốn xem hằng tháng luôn."',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Write the design first, on paper, no SQL. Prose and a small table in journal.md, under six headings: (1) Grain — one sentence, "one row = one …", everything else follows from it. (2) Keys — what identifies a row, which are natural, which the warehouse controls, and whether you need a new one at all. (3) Dimensions — which existing dims answer "by region" and "by month", and whether either forces a new dimension. (4) Measures — the numbers, and for each: additive over every dimension in the grain, or not? Say why. (5) Refresh strategy — full rebuild or incremental; if incremental, keyed on what, over what window (remember the late-data rule from Task 8). (6) Reuse — which existing models it stands on, and what new models it forces you to add.',
                'Hãy viết phần thiết kế trước, trên giấy, không SQL. Viết văn xuôi và một bảng nhỏ trong journal.md, dưới sáu đề mục: (1) Grain — một câu, "một dòng = một …", mọi thứ khác đều suy ra từ đó. (2) Khoá — cái gì định danh một dòng, cái nào là khoá tự nhiên, cái nào do kho dữ liệu kiểm soát, và rốt cuộc có cần khoá mới không. (3) Dimension — những dimension đang có nào trả lời được "theo vùng" và "theo tháng", và có cái nào buộc phải dựng dimension mới không. (4) Measure — các con số, và với từng con số: nó có additive trên mọi chiều trong grain không? Nói rõ vì sao. (5) Chiến lược làm mới — dựng lại toàn phần hay tăng dần; nếu tăng dần thì khoá theo cái gì, trên cửa sổ nào (nhớ luật dữ liệu về muộn ở Task 8). (6) Tái sử dụng — nó đứng trên những model nào đang có, và nó buộc bạn thêm model mới nào.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'And one line above all six: what the question actually means, because as asked it is not answerable. Three words in it are ambiguous, and spotting them is half the exercise. Do not read the reference answer until those six headings are filled in — it looks obvious once you have read it, and that feeling teaches nothing.',
                'Và một dòng nằm trên cả sáu đề mục: câu hỏi đó THẬT RA nghĩa là gì, vì hỏi như vậy thì chưa trả lời được. Trong đó có ba chữ mơ hồ, và nhận ra chúng đã là một nửa bài tập. Đừng đọc đáp án tham khảo trước khi điền xong sáu đề mục, vì đọc rồi thì nó trông hiển nhiên, mà cảm giác hiển nhiên đó chẳng dạy được gì.',
              ),
            },
          ],
        },
        {
          title: bi('Reference answer — three ambiguities', 'Đáp án tham khảo — ba chỗ mơ hồ'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                '"Returned": this feed has no return event. The only return signal is status = refunded on the order, and the contract is explicit that refunds arrive as status=refunded with a positive order_total — the sign is implied by the status, which is exactly why a negative total is a violation and not a refund. So "returned" means "was a line on an order whose latest status is refunded". Put that sentence at the top of your design and into the model\'s description, because your reader will otherwise assume something else.',
                '"Trả lại": cái feed này không có sự kiện trả hàng nào cả. Tín hiệu trả hàng duy nhất là status = refunded trên đơn, và contract nói rõ rằng hoàn tiền về dưới dạng status=refunded với order_total DƯƠNG — dấu được ngầm định bởi trạng thái, và đó đúng là lý do một tổng tiền âm là vi phạm chứ không phải hoàn tiền. Vậy "trả lại" nghĩa là "từng là một dòng hàng trên một đơn có trạng thái mới nhất là refunded". Hãy đặt câu đó lên đầu bản thiết kế và vào cả phần description của model, vì nếu không thì người đọc sẽ hiểu sang chuyện khác.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                '"Most": most units, most orders, or highest rate? Three rankings, and they disagree. Carry the ingredients for all three; rank in the query, not in the table. "Region": whose? dim_stores.region (NA / EU / APAC / LATAM — the store the order was placed at), or the customer\'s country in dim_customers? Both exist in your project; only one of them is called region, so that is the one — and you say so out loud rather than choosing silently.',
                '"Nhiều nhất": nhiều nhất về số lượng, về số đơn, hay là tỷ lệ cao nhất? Ba bảng xếp hạng, và chúng không trùng nhau. Hãy mang theo nguyên liệu cho cả ba; còn xếp hạng thì làm trong câu query chứ không làm trong bảng. "Vùng": vùng của ai? Là dim_stores.region (NA / EU / APAC / LATAM, tức cửa hàng nơi đơn được đặt), hay là quốc gia của khách trong dim_customers? Cả hai đều có trong dự án; nhưng chỉ một cái được GỌI là region, nên lấy cái đó — và hãy nói rõ ra chứ đừng lẳng lặng chọn.',
              ),
            },
          ],
        },
        {
          title: bi('Grain, the fork, keys and dimensions', 'Grain, ngã rẽ, khoá và dimension'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Grain: one row per (order_month, region, sku). The question is per product, and product only exists at item grain — fct_orders has no sku at all. That is A04\'s lesson arriving as a design constraint: you do not pick the grain, the question does.',
                'Grain: mỗi dòng là một bộ (order_month, region, sku). Câu hỏi là theo từng sản phẩm, mà sản phẩm chỉ tồn tại ở grain mức dòng hàng — bảng fct_orders vốn không có cột sku nào. Đó là bài học của A04 quay lại dưới dạng một ràng buộc thiết kế: bạn không chọn grain, câu hỏi chọn.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'The real fork: reuse the item fact, or build a returns fact? Three defensible answers, and the argument matters more than the pick. (a) A mart over fct_order_items filtered to refunded orders — cheapest, no new fact, nothing extra to backfill. The cost is a join, because fct_order_items does not carry status; fine for one mart, irritating by the tenth. (b) A separate fct_returns at item grain — wins the day returns acquire attributes the order fact cannot hold: a reason, a restocking flag, a return date distinct from the order date. Those are facts about the return, not about the order. But this feed ships none of them today, so fct_returns would be fct_order_items with rows removed: a second copy of data you already have. Not yet — design for the data you have, and name the trigger that would change your mind. (c) Push status down onto fct_order_items — one denormalized column and the join disappears for every future returns question. The cost is the staleness A03 named for orders_enriched, except here it barely applies, since the item fact is rebuilt by the same delete+insert window as the order fact it reads from, so the copy cannot drift. If you argued (c) you argued well.',
                'Ngã rẽ thật sự: tái dùng bảng fact dòng hàng, hay dựng hẳn một bảng fact trả hàng? Có ba câu trả lời đều bảo vệ được, và phần lập luận quan trọng hơn phần chọn. (a) Một mart đặt trên fct_order_items rồi lọc theo đơn refunded — rẻ nhất, không thêm fact nào, không thêm gì phải backfill. Cái giá là một phép join, vì fct_order_items không mang cột status; ổn cho một cái mart, tới cái thứ mười thì bực. (b) Một bảng fct_returns riêng ở grain dòng hàng — cách này thắng vào ngày mà chuyện trả hàng có thêm thuộc tính mà bảng fact đơn hàng không chứa nổi: lý do trả, cờ nhập kho lại, ngày trả khác ngày đặt. Đó là các sự thật về lần trả hàng, không phải về cái đơn. Nhưng feed hiện tại không gửi thứ nào trong số đó, nên fct_returns sẽ chỉ là fct_order_items bị bỏ bớt dòng, tức một bản sao thứ hai của dữ liệu bạn đã có. Chưa phải lúc — hãy thiết kế cho dữ liệu bạn đang có, và gọi tên cái điều kiện sẽ khiến bạn đổi ý. (c) Đẩy cột status xuống fct_order_items — thêm một cột phi chuẩn hoá là phép join biến mất cho mọi câu hỏi trả hàng về sau. Cái giá là chuyện bản sao bị cũ đi mà A03 đã gọi tên với orders_enriched, có điều ở đây gần như không áp dụng, vì bảng fact dòng hàng được dựng lại bằng đúng cửa sổ delete+insert với bảng fact đơn hàng mà nó đọc, nên bản sao không thể trôi lệch. Ai lập luận theo (c) là lập luận hay.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Keys: nothing new. sku is dim_products\' natural key, store_id is dim_stores\', and both already flow through the item fact. The mart\'s own key is its grain: (order_month, region, sku) is unique by construction of the GROUP BY, which is what "the grain is the key" means for an aggregate. Note the key you deliberately did not add — a surrogate earns its keep when other tables reference this one, and nothing references a mart.',
                'Khoá: không cần gì mới. sku là khoá tự nhiên của dim_products, store_id là của dim_stores, và cả hai vốn đã chảy qua bảng fact dòng hàng. Khoá của chính cái mart này là grain của nó: bộ (order_month, region, sku) là duy nhất theo cấu tạo của mệnh đề GROUP BY, và đó chính là nghĩa của câu "grain chính là khoá" đối với một bảng tổng hợp. Hãy để ý cái khoá bạn CỐ Ý không thêm: một khoá đại diện chỉ đáng giá khi có bảng khác tham chiếu tới bảng này, mà chẳng có gì tham chiếu tới một cái mart.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Dimensions: also nothing new. Region arrives through dim_stores on the store_id the item fact already carries. The urge to invent a dim_regions is worth refusing out loud: region is an attribute of a store, not an entity with a life of its own. And month is not a dimension here, it is a rollup: date_trunc(\'month\', order_date). There is no dim_date in this project, and you can answer "by month" without one, which is precisely why it was never built. Real warehouses often do build one, for the things date_trunc cannot compute — fiscal periods, holidays, week-of-year, "was this a promo day". When merchandising comes back asking for fiscal months, that is when you build it. What you must not do is store a month column on the fact: it is derivable from order_date, so it is a second copy of a fact, and second copies drift.',
                'Dimension: cũng không cần gì mới. Vùng đến qua dim_stores nhờ cột store_id mà bảng fact dòng hàng vốn đã mang. Cái thôi thúc bịa ra một bảng dim_regions đáng được từ chối thành tiếng: vùng là một thuộc tính của cửa hàng, không phải một thực thể có đời sống riêng. Còn tháng ở đây không phải dimension mà là một phép gộp: date_trunc(\'month\', order_date). Dự án này không có dim_date, mà bạn vẫn trả lời được "theo tháng" khi không có nó, và đó đúng là lý do nó chưa bao giờ được dựng. Các kho dữ liệu thật thì hay dựng bảng đó, cho những thứ date_trunc tính không nổi: kỳ tài chính, ngày lễ, tuần thứ mấy trong năm, "hôm đó có phải ngày khuyến mãi không". Khi bộ phận hàng hoá quay lại hỏi theo THÁNG TÀI CHÍNH, đó mới là lúc dựng. Thứ bạn tuyệt đối không được làm là lưu một cột month trên bảng fact: nó suy ra được từ order_date, nên nó là bản sao thứ hai của một sự thật, mà bản sao thứ hai thì sẽ trôi lệch.',
              ),
            },
          ],
        },
        {
          title: bi('Measures — the trap this whole exercise exists for', 'Measure — cái bẫy mà cả bài tập này sinh ra vì nó'),
          blocks: [
            {
              kind: 'code',
              lang: 'text',
              body: `returned_units    sum(qty) filter (where status = 'refunded')        additive: CÓ
sold_units        sum(qty)                                           additive: CÓ
returned_lines    count(*) filter (where status = 'refunded')         additive: CÓ
returned_orders   count(distinct order_id) filter (...)               additive: KHÔNG
return_rate       returned_units / sold_units                         KHÔNG — ĐỪNG LƯU`,
            },
            {
              kind: 'why',
              body: bi(
                'A ratio is not additive, and the test for additivity is not "does the number look wrong" — it is: can I recover a rollup from the stored values alone? For returned_units, yes: add them up. For return_rate, no. EU\'s June rate is not the sum of its per-SKU rates, and it is not their average either, unless every SKU happened to sell exactly the same number of units. A stored rate cannot be rolled up at all once its denominator is gone. So store the numerator and the denominator, and compute the rate in the query.',
                'Một tỷ lệ thì không additive, và phép thử tính additive không phải là "con số này trông có sai không", mà là: tôi có khôi phục được con số tổng hợp chỉ từ các giá trị đã lưu không? Với returned_units thì được: cứ cộng lại. Với return_rate thì không. Tỷ lệ tháng 6 của vùng EU không phải tổng các tỷ lệ theo từng SKU, mà cũng chẳng phải trung bình của chúng, trừ khi mọi SKU tình cờ bán ra đúng bằng số lượng như nhau. Một tỷ lệ đã lưu thì không tài nào gộp lên được nữa khi mẫu số của nó đã mất. Vậy nên hãy lưu tử số và mẫu số, rồi tính tỷ lệ ngay trong câu query.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `SELECT round(sum(returned_units) * 1.0 / sum(sold_units), 6) AS pooled_rate,
       round(avg(returned_units * 1.0 / sold_units), 6)      AS avg_of_cell_rates
FROM marts.monthly_product_returns
WHERE sold_units > 0;`,
            },
            {
              kind: 'trap',
              body: bi(
                'Run it and read the result honestly: on this feed the two land within a fraction of a percent of each other, because the generator refunds every product at the same underlying rate and the cells are all roughly the same size. That near-agreement is a property of this data, not of ratios — and it is the most dangerous kind of luck, the kind that lets a wrong habit pass its first test. A real catalogue is lumpy: one clearance SKU with nine units sold and one returned reads as 11%, and in an unweighted average it outweighs a bestseller with thirty thousand. Only pooled_rate ever answers "what fraction of units come back".',
                'Chạy thử rồi đọc kết quả cho trung thực: trên feed này hai con số lệch nhau chưa tới một phần trăm, vì bộ sinh dữ liệu hoàn tiền mọi sản phẩm với cùng một tỷ lệ nền và các ô đều xấp xỉ bằng nhau. Chuyện hai số gần bằng nhau là đặc tính của BỘ DỮ LIỆU NÀY, không phải của tỷ lệ nói chung — và đó là kiểu may mắn nguy hiểm nhất, kiểu để cho một thói quen sai vượt qua bài kiểm tra đầu tiên. Danh mục hàng thật thì lồi lõm: một mã xả hàng bán được chín cái mà trả lại một cái là 11%, và trong một phép trung bình không trọng số nó đè bẹp một mã bán chạy ba chục nghìn cái. Chỉ có pooled_rate mới trả lời được câu "bao nhiêu phần trăm số lượng quay về".',
              ),
            },
            {
              kind: 'why',
              body: bi(
                'returned_orders is the subtler one, and it is subtle because of the grain you chose: a refunded order lands in one row per distinct product it contains, so summing returned_orders across SKUs counts a three-product order three times. Expect the sum over all cells to overshoot the true distinct count by roughly 2.5× — which is, of course, the average items per order from A04. Keep the column, since it answers "how many orders" within a cell, and label it non-additive in the description. Then look at daily_store_sales.customers and notice it has had exactly this property since Task 6: sum it over seven days and you do not get the week\'s distinct customers. You just learned to read your own model.',
                'Cột returned_orders mới là cái tinh vi hơn, và nó tinh vi CHÍNH VÌ cái grain bạn đã chọn: một đơn được hoàn tiền rơi vào mỗi sản phẩm phân biệt nó chứa một dòng, nên cộng returned_orders qua các SKU sẽ đếm một đơn ba sản phẩm thành ba lần. Hãy chờ tổng qua mọi ô vượt số đếm phân biệt thật khoảng 2,5 lần — mà đó dĩ nhiên chính là số dòng hàng trung bình mỗi đơn của A04. Cứ giữ cột đó lại, vì nó trả lời được câu "bao nhiêu đơn" TRONG một ô, nhưng phải ghi rõ trong mô tả rằng nó không additive. Rồi hãy nhìn sang cột daily_store_sales.customers và nhận ra nó đã mang đúng tính chất này từ Task 6: cộng nó qua bảy ngày thì không ra số khách phân biệt của cả tuần. Bạn vừa học được cách đọc chính model của mình.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'One measure you do not need, and why that is interesting: no money. Counts and units are currency-free, so — unlike every other mart in this project — currency does not belong in this grain. Add returned_value tomorrow and it belongs instantly, for the ×25,000 reason daily_store_sales carries it. Grain follows measures.',
                'Có một measure bạn không cần, và chỗ thú vị nằm ở lý do: không có tiền. Các phép đếm và số lượng thì không dính tiền tệ, nên khác với mọi mart còn lại của dự án, currency KHÔNG thuộc về grain này. Ngày mai thêm cột returned_value vào là nó thuộc về ngay lập tức, vì đúng cái lý do gấp 25.000 lần mà daily_store_sales phải mang nó. Grain đi theo measure.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'The honest caveat, which is a modeling limit and not a bug: the refund status sits on the order, not the line. A refunded three-line order makes all three products look returned; if only the headphones came back, this mart still blames the cable and the case. No SQL fixes that — the fix is line-level return events from the producer, i.e. an A06 contract amendment with a notice period, not an afternoon\'s work. Write the caveat into the mart\'s description. (One warning about the synthetic feed: it assigns refunds without regard to product, so the leaderboard you get is noise. The shape of the answer is the lesson; the ranking is not.)',
                'Phần cảnh báo trung thực, mà đây là giới hạn của mô hình chứ không phải bug: trạng thái hoàn tiền nằm trên ĐƠN chứ không nằm trên dòng hàng. Một đơn ba dòng bị hoàn tiền sẽ làm cả ba sản phẩm trông như bị trả lại; nếu thật ra chỉ cái tai nghe quay về thì cái mart này vẫn đổ oan cho sợi cáp và cái hộp. Không có SQL nào sửa được chuyện đó — cách sửa là bên gửi phải gửi sự kiện trả hàng ở mức dòng, tức một lần sửa đổi contract theo A06 kèm thời hạn báo trước, chứ không phải việc làm trong một buổi chiều. Hãy viết cảnh báo đó vào phần description của mart. (Một lưu ý về feed tổng hợp: nó gán hoàn tiền mà không quan tâm sản phẩm nào, nên cái bảng xếp hạng bạn nhận được chỉ là nhiễu. Hình dạng của câu trả lời mới là bài học, thứ hạng thì không.)',
              ),
            },
          ],
        },
        {
          title: bi('Refresh, reuse, and the optional build', 'Làm mới, tái dùng, và phần build tuỳ chọn'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Refresh strategy: the mart is derived, so it inherits the facts\' window. Two defensible answers. Full rebuild as a table every run, what daily_store_sales does — the output is tens of thousands of rows, seconds to build, and "the simplest thing that works" is a real answer here, not a cop-out. Or incremental, delete+insert on order_month, worth it only once the full rebuild stops being cheap; if you pick it, watch what the late-data rule does: a file for day D corrects days D−7 to D, so any month those days touch is dirty and must be recomputed whole. The refresh key and the grain turn out to be the same decision — usually a sign the grain was right.',
                'Chiến lược làm mới: cái mart này là dẫn xuất, nên nó thừa hưởng cửa sổ của các bảng fact. Có hai câu trả lời đều bảo vệ được. Một là dựng lại toàn phần thành table mỗi lần chạy, y như daily_store_sales — đầu ra chỉ vài chục nghìn dòng, build vài giây, và "cái đơn giản nhất mà chạy được" ở đây là một câu trả lời thật chứ không phải né tránh. Hai là tăng dần, delete+insert theo order_month, chỉ đáng làm khi việc dựng lại toàn phần không còn rẻ nữa; nếu chọn cách này thì hãy nhìn kỹ luật dữ liệu về muộn: file của ngày D sửa các ngày từ D−7 tới D, nên bất kỳ tháng nào mấy ngày đó chạm vào đều bẩn và phải tính lại NGUYÊN THÁNG. Hoá ra khoá làm mới và grain lại là cùng một quyết định, mà đó thường là dấu hiệu grain đã chọn đúng.',
              ),
            },
            {
              kind: 'text',
              body: bi(
                'Reuse: fct_order_items (grain plus sku), fct_orders (status), dim_stores (region), dim_products (category). Zero new sources, zero new staging models, zero edits to existing models. That ratio is the tell of a good design — a request that forces a new source is usually a different question wearing this one\'s clothes.',
                'Tái dùng: fct_order_items (cho grain và sku), fct_orders (cho status), dim_stores (cho region), dim_products (cho category). Không thêm source nào, không thêm model staging nào, không sửa model nào đang có. Cái tỷ lệ đó là dấu hiệu của một thiết kế tốt — một yêu cầu buộc phải thêm SOURCE mới thì thường là một câu hỏi khác đang mặc áo của câu hỏi này.',
              ),
            },
            {
              kind: 'code',
              lang: 'sql',
              body: `-- Grain: mỗi dòng là một bộ (order_month, region, sku).
-- "Trả lại" = một dòng hàng trên đơn có trạng thái mới nhất là 'refunded'. Tín
-- hiệu nằm ở mức ĐƠN, nên mọi dòng của một đơn hoàn tiền đều bị tính — xem description.
with lines as (

    select
        cast(date_trunc('month', i.order_date) as date) as order_month,
        s.region    as region,
        i.sku       as sku,
        i.order_id  as order_id,
        i.qty       as qty,
        o.status    as status,
        p.category  as category
    from {{ ref('fct_order_items') }} i
    join      {{ ref('fct_orders') }}   o using (order_id)
    left join {{ ref('dim_stores') }}   s on s.store_id = i.store_id
    left join {{ ref('dim_products') }} p on p.sku      = i.sku

)

select
    order_month, region, sku,
    any_value(category)                                          as category,
    count(*)                 filter (where status = 'refunded')  as returned_lines,
    coalesce(sum(qty) filter (where status = 'refunded'), 0)     as returned_units,
    count(distinct order_id) filter (where status = 'refunded')  as returned_orders,
    count(*)                                                     as sold_lines,
    sum(qty)                                                     as sold_units
from lines
group by 1, 2, 3`,
            },
            {
              kind: 'why',
              body: bi(
                'Three details worth ten seconds. cast(... as date) because date_trunc hands back a TIMESTAMP, and a month column printing 2026-06-01 00:00:00 invites the question "00:00:00 of what?". coalesce(…, 0) because a cell with no returns has zero returns, not unknown ones — a NULL there would quietly drop the row out of every average someone runs. And category is denormalized in with any_value for the same reason daily_store_sales carries store_name: convenience, paid for with a rebuild when the dim changes. The LEFT JOINs are deliberate — A04\'s ~0.2% orphan SKUs must land in a visible NULL category, not vanish into an inner join.',
                'Ba chi tiết đáng bỏ ra mười giây. Dùng cast(... as date) vì date_trunc trả về TIMESTAMP, mà một cột tháng in ra 2026-06-01 00:00:00 thì mời gọi câu hỏi "00:00:00 của cái gì?". Dùng coalesce(…, 0) vì một ô không có lượt trả nào thì có KHÔNG lượt trả, chứ không phải không biết bao nhiêu — để NULL ở đó sẽ lặng lẽ hất dòng đó ra khỏi mọi phép trung bình có người chạy. Còn category được phi chuẩn hoá vào bằng any_value, cùng lý do daily_store_sales mang store_name: tiện, và trả giá bằng việc phải dựng lại khi dimension đổi. Mấy phép LEFT JOIN là cố ý — khoảng 0,2% SKU mồ côi của A04 phải rơi vào một category NULL nhìn thấy được, chứ không được biến mất vào một phép inner join.',
              ),
            },
            {
              kind: 'trap',
              body: bi(
                'If you build it, your counts move: a thirteenth buildable takes the summary from TOTAL=25 to TOTAL=26 (PASS=25 WARN=1). Every number in the Definition of Done is stated for the project without this optional model. And add its description to models/marts/schema.yml — grain in the first line, the order-level-signal caveat in the second — or you have just shipped the undocumented table Task 10 spent half an hour arguing against.',
                'Nếu bạn build nó thì các con số sẽ xê dịch: có thêm cái thứ mười ba để build, bảng tổng kết chuyển từ TOTAL=25 thành TOTAL=26 (PASS=25 WARN=1). Mọi con số trong phần Định nghĩa hoàn thành đều được phát biểu cho dự án KHÔNG có model tuỳ chọn này. Và nhớ thêm phần description của nó vào models/marts/schema.yml — dòng đầu là grain, dòng thứ hai là cảnh báo về chuyện tín hiệu nằm ở mức đơn — nếu không thì bạn vừa xuất xưởng đúng cái bảng không tài liệu mà Task 10 đã tốn nửa tiếng để phản đối.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'The six headings are filled in, in your journal, written before you read the reference answer — and you can defend one place where your design differs from it by naming the trade-off you accepted. Agreement is not the pass condition; a named trade-off is.',
          'Sáu đề mục đã điền đủ trong journal, và viết TRƯỚC khi đọc đáp án tham khảo — cộng với việc bạn bảo vệ được một chỗ mà thiết kế của mình khác đáp án, bằng cách gọi tên cái đánh đổi mình đã chấp nhận. Điều kiện qua bài không phải là trùng khớp, mà là gọi được tên đánh đổi.',
        ),
      ],
    },

    /* ═══════════════ T15 ═══════════════ */
    {
      id: 'a15-t15',
      num: 15,
      title: bi('The map back', 'Tấm bản đồ quay ngược lại'),
      goal: bi(
        'Every dbt feature, next to the assignment where you built it by hand.',
        'Mỗi tính năng của dbt, đặt cạnh cái bài mà bạn đã tự tay dựng ra nó.',
      ),
      steps: [
        {
          title: bi('Copy the table, check every row', 'Chép bảng này ra, đối chiếu từng dòng'),
          blocks: [
            {
              kind: 'text',
              body: bi(
                'Copy this into journal.md, check every row against something you actually did today, and add at least two rows of your own — candidates: dbt show, selectors, target/compiled/, the schema macro.',
                'Chép bảng này vào journal.md, đối chiếu từng dòng với một việc bạn thật sự đã làm hôm nay, và tự thêm ít nhất hai dòng của riêng bạn — vài ứng viên: dbt show, các selector, thư mục target/compiled/, và cái macro đặt tên schema.',
              ),
            },
            {
              kind: 'code',
              lang: 'text',
              body: `source + external_location          A01/A02 — read_csv / read_parquet trên lake
source freshness                    A05 đối soát + điều khoản freshness của A06
seed (country_map)                  A03 — bảng ánh xạ quy chuẩn
staging view (đổi tên/ép kiểu/dọn)  A03 staging + canonicalizer của A10
ref() — đồ thị phụ thuộc            A11 Task 8 — "marts chạy lại sau core"
materialization (view/table)        A03 — thiết kế tầng, cái gì lưu, cái gì dẫn xuất
incremental delete+insert theo ngày A07 BEGIN;DELETE;INSERT;COMMIT + A08 chiến lược (c)
cửa sổ khử trùng lặp trong fact     A08 chiến lược (a) — updated_at mới nhất thắng
var("start_date"/"end_date")        A11 runner --start/--end
--full-refresh                      A11 --force (restatement, kèm thông báo)
generic test (not_null/unique/…)    A05 bộ check
lời hứa theo cột của contract       A05/A06 — các điều khoản YAML, ở dạng chạy được
severity: warn / ngưỡng             A05 — rác đã ghi nhận so với lỗi thật
singular test (đối soát dòng hàng)  A05 kiểm bắc-nhiều-trường, mù era nhờ A10
--target small/full                 A00 — luật dev trên small
threads + DuckDB một tiến trình     A12 — phép tính ngân sách và luật một người ghi
description: trong schema.yml        journal của bạn + ngữ nghĩa từng cột trong contract A06
dbt docs generate = data catalog    chưa từng có — lần đầu metadata của lab tra cứu được
DAG = lineage mức bảng              bức tranh "cái gì nuôi cái gì" bạn mang trong đầu từ A02
dbt ls --select source:…+           A06 change_management — trả lời "hỏng cái gì" trước khi gật
lineage mức cột (làm tay)           chuỗi cleaner A03 → A10; không thứ gì trong lab vẽ nó
provenance mức dòng                 A03/A07 — _data_date + _run_id → ops.etl_runs. Tầng mà
                                    dbt KHÔNG mô hình hoá: nó sống trên dòng dữ liệu và trên
                                    cuốn sổ của bạn, không nằm trong DAG`,
            },
            {
              kind: 'why',
              body: bi(
                'The last row is the one to dwell on: dbt gave you two of the three levels of lineage for free and cannot give you the third. A dbt DAG will never tell you which run wrote a particular row.',
                'Dòng cuối cùng là dòng đáng ngồi lại lâu nhất: dbt cho bạn hai trong ba tầng lineage miễn phí, và không thể cho bạn tầng thứ ba. Một cái DAG của dbt sẽ không bao giờ nói được lần chạy nào đã ghi ra một dòng cụ thể.',
              ),
            },
          ],
        },
      ],
      accept: [
        bi(
          'The table is in your journal with your two added rows, and for every row you can say one sentence about the hand-built version without looking it up.',
          'Bảng đã nằm trong journal kèm hai dòng bạn tự thêm, và với mỗi dòng bạn nói được một câu về phiên bản tự tay dựng mà không cần tra lại.',
        ),
      ],
    },
  ],
}