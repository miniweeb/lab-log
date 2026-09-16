import type { TheorySection, Term } from '../types'
import { bi } from '../types'

export const a15Theory: TheorySection[] = [
  /* ─────────── TẦNG 1 ─────────── */
  {
    level: 'problem',
    heading: bi(
      'Fourteen assignments of handwork, and a tool that does most of it',
      'Mười bốn bài làm tay, và một công cụ làm gần hết chỗ đó',
    ),
    paras: [
      bi(
        'You built a transformation pipeline with your bare hands: staging, cleaning, incremental loads, tests, backfills, docs written as journal entries. Almost every data team wraps exactly that work in a tool called dbt. It is the closest thing this field has to an industry standard, and it will be on the job description.',
        'Bạn đã tự tay dựng một pipeline biến đổi dữ liệu: staging, làm sạch, nạp tăng dần, test, backfill, tài liệu viết dưới dạng journal. Gần như mọi đội data ngoài kia đều bọc đúng chỗ công việc đó lại bằng một công cụ tên là dbt. Đây là thứ gần với chuẩn ngành nhất mà nghề này có, và nó sẽ nằm trong bản mô tả công việc.',
      ),
      bi(
        'Here is the punchline of the whole lab: there is nothing in dbt you have not already built yourself. Incremental models are your A07 transaction. Tests are your A05 check suite. Vars are your A11 runner flags. The DAG is the build order you reasoned out by hand.',
        'Và đây là câu chốt của cả khoá lab này: trong dbt không có thứ gì mà bạn chưa từng tự dựng. Model incremental chính là cái transaction của A07. Test chính là bộ check của A05. Biến var chính là mấy cái cờ dòng lệnh của runner ở A11. Cái DAG chính là thứ tự build mà bạn đã tự ngồi suy ra.',
      ),
      bi(
        'That order matters more than it looks. People who learn dbt first treat it as magic and cannot debug it — when a run goes wrong they can only reread the docs, because they have never seen the machinery underneath. You learned the machinery first, so for you dbt is a labor-saving formalization, and when it misbehaves you already know which hand-built part is hiding under the hood.',
        'Thứ tự đó quan trọng hơn vẻ ngoài của nó. Người học dbt trước coi nó là phép màu và không debug nổi: lúc một lần chạy sai, họ chỉ còn cách đọc lại tài liệu, vì chưa bao giờ nhìn thấy bộ máy bên dưới. Bạn học bộ máy trước, nên với bạn dbt chỉ là một cách hình thức hoá cho đỡ tốn sức, và khi nó giở chứng thì bạn biết ngay phần tự dựng nào đang nấp bên dưới.',
      ),
      bi(
        'One boundary to keep straight: dbt runs the T of ELT and only the T. It does not extract and it does not load. Your lake loader, your quarantine routing, your runner from A02 to A11 keep those jobs. dbt takes over from the moment the data is already sitting somewhere queryable.',
        'Có một ranh giới cần nhớ cho rõ: dbt lo chữ T trong ELT, và chỉ chữ T thôi. Nó không extract, cũng không load. Bộ nạp lake, phần định tuyến quarantine, và cái runner bạn viết từ A02 tới A11 vẫn giữ nguyên nhiệm vụ của chúng. dbt chỉ tiếp quản từ lúc dữ liệu đã nằm sẵn ở một chỗ query được.',
      ),
    ],
    checks: [
      {
        q: bi(
          'Why does the lab teach dbt last instead of first?',
          'Vì sao khoá lab để dbt ở bài cuối chứ không phải bài đầu?',
        ),
        a: bi(
          'Because every dbt feature is a formalization of something you already built. Meeting the formalization first leaves you with vocabulary and no model of what is happening, which is exactly the person who cannot debug a failed run.',
          'Vì mọi tính năng của dbt đều là bản hình thức hoá của một thứ bạn đã tự dựng. Gặp bản hình thức hoá trước thì bạn chỉ có từ vựng mà không có hình dung về chuyện đang xảy ra, và đó đúng là kiểu người không debug nổi một lần chạy hỏng.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 2 ─────────── */
  {
    level: 'alternatives',
    heading: bi(
      'Four ways to run a transformation layer',
      'Bốn cách vận hành tầng biến đổi',
    ),
    paras: [
      bi(
        'All four exist at real companies right now. The question is not which is most powerful but which one a new person can read, and which one still tells the truth about build order when the project has sixty models instead of twelve.',
        'Cả bốn cách dưới đây đều đang tồn tại ở các công ty thật. Câu hỏi không phải cách nào mạnh nhất, mà là cách nào một người mới vào đọc hiểu được, và cách nào còn nói thật về thứ tự build khi dự án có sáu chục model chứ không phải mười hai.',
      ),
    ],
    alternatives: [
      {
        name: bi('Keep the hand-written scripts', 'Giữ nguyên đống script tự viết'),
        appeal: bi(
          'It is yours, you know every line, and it does exactly what you told it to. No framework between you and the SQL, no version to upgrade.',
          'Nó là của bạn, bạn thuộc từng dòng, và nó làm đúng y những gì bạn bảo. Không có framework nào chen giữa bạn và SQL, cũng không có phiên bản nào phải nâng cấp.',
        ),
        breaks: bi(
          'Build order lives in your head. Add a model and you must remember to update the runner; hire someone and they must read every file to learn what feeds what. The boilerplate you retype for each incremental table is the same twelve lines, and one day a typo in one of them is a silent data bug.',
          'Nhưng thứ tự build thì nằm trong đầu bạn. Thêm một model là phải nhớ sửa runner; tuyển người mới là họ phải đọc hết mọi file mới biết cái gì nuôi cái gì. Cái đoạn khuôn mẫu bạn gõ lại cho từng bảng tăng dần vẫn là mười hai dòng đó, rồi một ngày nào đó một lỗi gõ nhầm trong số đó thành một con bug dữ liệu im lặng.',
        ),
      },
      {
        name: bi('Build your own in-house framework', 'Tự dựng framework nội bộ'),
        appeal: bi(
          'Wrap the boilerplate yourself, exactly to your team\'s shape, with no external dependency and no opinions you disagree with.',
          'Bạn tự bọc phần khuôn mẫu lại, đo ni đóng giày cho đúng đội mình, không phụ thuộc bên ngoài, cũng không phải chịu quan điểm nào mà mình không đồng ý.',
        ),
        breaks: bi(
          'You now maintain a framework in addition to a pipeline, and a new hire has to learn a tool that exists nowhere else on earth. This is the most common expensive mistake in the field, and it is usually made by a team that would have been happy with dbt.',
          'Đổi lại giờ bạn nuôi một cái framework song song với cái pipeline, và người mới vào phải học một công cụ không tồn tại ở bất cứ đâu khác trên đời. Đây là sai lầm tốn kém phổ biến nhất của nghề này, mà thường lại do đúng những đội lẽ ra đã hài lòng với dbt mắc phải.',
        ),
      },
      {
        name: bi('An orchestrator running raw SQL files', 'Orchestrator kéo các file SQL thô'),
        appeal: bi(
          'Airflow or similar already schedules everything else you run, so the SQL steps just become more tasks in a graph you already operate.',
          'Airflow hay công cụ tương tự vốn đã lên lịch cho mọi thứ khác bạn chạy, nên mấy bước SQL chỉ việc trở thành thêm vài node trong một đồ thị bạn đang vận hành sẵn.',
        ),
        breaks: bi(
          'The dependency graph is hand-declared, so it drifts from the SQL the moment someone adds a join and forgets the edge. There is also no testing layer, no documentation layer, and no incremental pattern — you write all three yourself anyway.',
          'Nhưng cái đồ thị phụ thuộc là do người khai bằng tay, nên nó lệch khỏi SQL ngay khi có ai đó thêm một phép join mà quên khai cạnh nối. Ngoài ra nó cũng không có tầng test, không có tầng tài liệu, không có khuôn nạp tăng dần, nên rốt cuộc bạn vẫn phải tự viết cả ba.',
        ),
      },
      {
        name: bi('dbt', 'dbt'),
        appeal: bi(
          'One SELECT per model plus a little config. Write ref() instead of a table name and the dependency graph derives itself from the SQL, so it cannot drift. Tests, docs, incremental strategies and multi-environment targets come in the same box.',
          'Mỗi model là một câu SELECT cộng một chút cấu hình. Viết ref() thay cho tên bảng thì đồ thị phụ thuộc tự sinh ra từ chính SQL, nên nó không thể lệch được. Test, tài liệu, các chiến lược nạp tăng dần và chuyện chạy nhiều môi trường đều nằm sẵn trong cùng một hộp.',
        ),
        breaks: bi(
          'It is opinionated, it only does T, and it hides the SQL it generates behind a compile step — which is exactly why the lab made you write that SQL by hand first. Read target/run/ when you want the truth back.',
          'Đổi lại nó khá áp đặt, nó chỉ làm mỗi chữ T, và nó giấu phần SQL nó sinh ra sau một bước biên dịch, mà đó chính là lý do khoá lab bắt bạn viết đống SQL đó bằng tay trước đã. Khi cần sự thật thì cứ mở thư mục target/run/ ra đọc.',
        ),
      },
    ],
    checks: [
      {
        q: bi(
          'What does dbt give you that an orchestrator running the same SQL does not?',
          'dbt cho bạn thứ gì mà một orchestrator chạy đúng đống SQL đó không có?',
        ),
        a: bi(
          'A dependency graph derived from the SQL itself, not declared beside it. Plus tests and a documentation site generated from the same project, so all three stay in sync by construction.',
          'Một đồ thị phụ thuộc suy ra từ chính SQL, chứ không phải khai riêng bên cạnh. Cộng thêm test và một trang tài liệu sinh ra từ cùng một dự án, nên cả ba luôn khớp nhau theo cấu tạo.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 3 ─────────── */
  {
    level: 'idea',
    heading: bi(
      'One SELECT per table, and ref() writes the build order',
      'Mỗi bảng một câu SELECT, còn ref() thì tự viết thứ tự build',
    ),
    paras: [
      bi(
        'Five nouns cover most of dbt. A model is one .sql file holding one SELECT, and the filename becomes the table name. A materialization says how that SELECT becomes real: a view, a table rebuilt from scratch, or an incremental table where only a slice is rebuilt. A source declares raw data dbt reads but does not build. A seed is a small CSV dbt loads as a table. A test is a SELECT that must return zero rows.',
        'Năm danh từ là đủ cho phần lớn dbt. Model là một file .sql chứa đúng một câu SELECT, và tên file trở thành tên bảng. Materialization nói câu SELECT đó thành hiện thực bằng cách nào: một view, một bảng dựng lại từ đầu, hay một bảng tăng dần chỉ dựng lại một lát. Source là lời khai về dữ liệu thô mà dbt đọc nhưng không dựng. Seed là một file CSV nhỏ mà dbt nạp thành bảng. Còn test là một câu SELECT bắt buộc phải trả về 0 dòng.',
      ),
      bi(
        'The trick that makes the whole thing work is that inside a model you never write a table name. You write ref(\'stg_shopcore__orders\') or source(\'shopcore\', \'orders\') in double braces, and dbt substitutes the real name at compile time. Because dbt now knows who reads whom, it derives the DAG and always builds parents before children.',
        'Cái mẹo làm cho toàn bộ chuyện này chạy được là: bên trong một model, bạn không bao giờ gõ tên bảng. Bạn viết ref(\'stg_shopcore__orders\') hay source(\'shopcore\', \'orders\') trong cặp ngoặc nhọn kép, rồi dbt thay bằng tên thật lúc biên dịch. Vì giờ dbt biết ai đọc của ai, nó tự suy ra cái DAG và luôn dựng cha trước con.',
      ),
      bi(
        'Remember A11 Task 8, where you reasoned out that marts must rerun after core, in that order? ref() is that reasoning, automated — and unlike your reasoning it cannot go stale, because it is the same string the SQL actually runs on.',
        'Còn nhớ Task 8 của A11, chỗ bạn ngồi suy ra rằng marts phải chạy lại sau core, theo đúng thứ tự đó không? ref() chính là cái suy luận đó được tự động hoá, mà khác với suy luận trong đầu bạn, nó không bao giờ cũ đi, vì nó chính là chuỗi ký tự mà SQL đang thật sự chạy trên đó.',
      ),
      bi(
        'Two more pieces complete the picture. The project file is policy: everything in models/staging/ becomes a view in schema staging, everything in models/core/ becomes a table in core — the A03 layer convention, now enforced by folder structure. And the profile is where: two targets, small and full, so switching scale is one flag instead of an edit.',
        'Hai mảnh nữa là đủ bức tranh. File dự án đóng vai chính sách: mọi thứ trong models/staging/ thành view ở schema staging, mọi thứ trong models/core/ thành bảng ở core, tức là đúng quy ước phân tầng của A03, giờ được chính cấu trúc thư mục cưỡng chế. Còn profile trả lời câu hỏi ở đâu: hai target là small và full, nên đổi scale chỉ tốn một cái cờ thay vì phải sửa file.',
      ),
    ],
    checks: [
      {
        q: bi(
          'A model contains "from core.fct_orders" and it builds fine. What is wrong?',
          'Một model viết "from core.fct_orders" và nó build ngon lành. Vậy sai ở đâu?',
        ),
        a: bi(
          'It fell out of the DAG. dbt does not know this model depends on fct_orders, so build order is luck, lineage is missing and the docs are wrong. Working today is not the same as correct.',
          'Nó rơi ra khỏi DAG. dbt không biết model này phụ thuộc fct_orders, nên thứ tự build là do hên, phần lineage thì mất, và tài liệu thì sai. Hôm nay chạy được không có nghĩa là đúng.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 4 ─────────── */
  {
    level: 'mechanism',
    heading: bi(
      'The incremental lifecycle, and where your A07 transaction went',
      'Vòng đời của một model tăng dần, và cái transaction A07 của bạn đã đi đâu',
    ),
    paras: [
      bi(
        'An incremental model runs two different ways depending on whether its table already exists. On the first run the table is absent, is_incremental() is false, the date filter inside the Jinja block vanishes, and dbt issues a plain CREATE TABLE over all history. That is your A11 full backfill.',
        'Một model tăng dần chạy theo hai kiểu khác nhau, tuỳ vào việc bảng của nó đã tồn tại hay chưa. Ở lần chạy đầu, bảng chưa có, is_incremental() trả về false, cái bộ lọc ngày nằm trong khối Jinja biến mất, và dbt phát ra một câu CREATE TABLE trên toàn bộ lịch sử. Đó chính là lần backfill toàn phần của A11.',
      ),
      bi(
        'On later runs is_incremental() is true, so the batch narrows to the window you passed in. dbt materializes that batch to a temp table, then — because the strategy is delete+insert keyed on order_date — deletes every order_date present in the batch from the target and inserts the batch, in one transaction. Open your A07 script next to the compiled file: BEGIN; DELETE day-range; INSERT; COMMIT. Same machine. dbt just writes the boilerplate.',
        'Ở các lần sau, is_incremental() trả về true, nên lô dữ liệu thu hẹp lại đúng cái cửa sổ bạn truyền vào. dbt vật chất hoá lô đó ra một bảng tạm, rồi vì chiến lược là delete+insert khoá theo order_date, nó xoá khỏi bảng đích mọi order_date có mặt trong lô rồi chèn lô đó vào, gọn trong một transaction. Hãy mở script A07 của bạn đặt cạnh file đã biên dịch: BEGIN; DELETE dải ngày; INSERT; COMMIT. Cùng một bộ máy. dbt chỉ gõ hộ phần khuôn mẫu.',
      ),
      bi(
        'Why the window is safe at all: the lake already holds late corrections inside the correct order_date partitions, which you proved in A02 and fixed the ids for in A10. So rebuilding a date range from the lake is complete by construction, and the dedupe window then keeps only the newest updated_at per order — corrections win, exactly as your A08 reconciliation demanded.',
        'Vì sao cái cửa sổ đó lại an toàn: phần lake vốn đã chứa các bản sửa muộn nằm đúng trong phân vùng order_date của chúng, điều bạn đã chứng minh ở A02 và đã sửa lại phần id ở A10. Nên dựng lại một dải ngày từ lake là đầy đủ theo cấu tạo, rồi cửa sổ khử trùng lặp chỉ giữ lại bản có updated_at mới nhất cho mỗi đơn, tức là bản sửa thắng, đúng như phép đối soát ở A08 đòi hỏi.',
      ),
      bi(
        'Tests work the same way: each one compiles to a SELECT that must return zero rows, and dbt saves them under target/compiled/ so you can read them. Generic tests live in YAML beside the model and are the contract\'s per-column promises made executable — accepted_values is allowed_values, relationships is references. A singular test is hand-written SQL for a rule no single column can state, like the items-sum reconciliation.',
        'Test cũng vận hành y như vậy: mỗi cái biên dịch ra một câu SELECT bắt buộc trả về 0 dòng, và dbt lưu chúng dưới target/compiled/ để bạn đọc được. Generic test sống trong file YAML nằm cạnh model, và chính là các lời hứa theo từng cột trong contract được biến thành thứ chạy được: accepted_values chính là allowed_values, relationships chính là references. Còn singular test là SQL viết tay cho một luật mà không cột đơn lẻ nào phát biểu nổi, chẳng hạn phép đối soát tổng tiền với tổng các dòng hàng.',
      ),
      bi(
        'And severity is the piece people get wrong. You know orphan customer ids exist, around 0.05 percent, documented since A05. A test that fails on documented dirt trains people to ignore red. So warn means known and watched; error means stop the line. That is your A05 threshold philosophy, spelled in dbt.',
        'Còn mức severity mới là chỗ người ta hay làm sai. Bạn biết rõ là có tồn tại các customer_id mồ côi, chừng 0,05 phần trăm, đã ghi nhận từ A05. Một cái test cứ đỏ vì thứ rác đã được ghi nhận sẽ dạy cho người ta thói quen làm ngơ màu đỏ. Vậy nên warn nghĩa là đã biết và đang theo dõi, còn error nghĩa là dừng dây chuyền. Đó chính là triết lý ngưỡng của A05, viết bằng phương ngữ dbt.',
      ),
    ],
    checks: [
      {
        q: bi(
          'A "3-day" windowed run takes as long as the full build. What happened?',
          'Một lần chạy cửa sổ "3 ngày" lại mất đúng bằng thời gian build toàn phần. Chuyện gì đã xảy ra?',
        ),
        a: bi(
          'The is_incremental() guard is missing or the table was dropped, so the filter never applied and you restated all 69 days. Read target/run/ to see what actually executed — A14\'s rule: measure, do not guess.',
          'Hoặc là thiếu cái chốt is_incremental(), hoặc bảng đã bị xoá, nên bộ lọc không hề có tác dụng và bạn vừa dựng lại cả 69 ngày. Hãy mở target/run/ ra xem thứ thật sự đã chạy, theo đúng luật của A14: đo chứ đừng đoán.',
        ),
      },
      {
        q: bi(
          'Why is the correct daily window [D−7, D] rather than [D, D]?',
          'Vì sao cửa sổ chạy hằng ngày đúng phải là [D−7, D] chứ không phải [D, D]?',
        ),
        a: bi(
          'Because the file for day D carries corrections for days D−7 through D, per the A06 contract and measured in A08. dbt formalized your pipeline, not your calendar math — that part is still on you.',
          'Vì file của ngày D mang theo các bản sửa cho những ngày từ D−7 tới D, theo contract của A06 và đã đo ở A08. dbt hình thức hoá cái pipeline của bạn chứ không hình thức hoá phép tính lịch của bạn, phần đó vẫn là việc của bạn.',
        ),
      },
    ],
  },

  /* ─────────── TẦNG 5 ─────────── */
  {
    level: 'detail',
    heading: bi(
      'A catalog, three levels of lineage, and the one dbt cannot give you',
      'Một cuốn danh mục, ba tầng lineage, và tầng mà dbt không thể cho bạn',
    ),
    paras: [
      bi(
        'Everything you have built so far is data. Metadata is the data about it: types, tests, freshness, dependencies — and the one part no tool can produce for you, what a column actually means. dbt collects the mechanical half for free. The meanings you write yourself, in schema.yml.',
        'Mọi thứ bạn dựng tới giờ đều là dữ liệu. Metadata là dữ liệu nói về dữ liệu đó: kiểu, test, độ tươi, các phụ thuộc, và cái phần mà không công cụ nào làm hộ được, đó là một cột thật ra có nghĩa gì. dbt gom giùm bạn nửa cơ học miễn phí. Còn phần nghĩa thì bạn tự viết, trong file schema.yml.',
      ),
      bi(
        'A description that only restates the column name is worse than no description at all: it makes the catalog look documented while telling the reader nothing, and nobody ever reopens a field that already has text in it. A description earns its place by carrying a decision, a constraint or a warning — the things the SQL cannot say out loud. And every model description opens with its grain sentence, because a stranger deciding whether this table answers their question needs to know what one row is before anything else.',
        'Một dòng mô tả chỉ chép lại tên cột thì còn tệ hơn là để trống: nó khiến cuốn danh mục trông như đã có tài liệu trong khi chẳng nói với người đọc điều gì, mà một ô đã có chữ thì không ai mở lại lần nữa. Một dòng mô tả xứng đáng có mặt khi nó mang theo một quyết định, một ràng buộc hoặc một lời cảnh báo, tức là những thứ SQL không nói thành lời được. Và mọi mô tả model đều mở đầu bằng câu về grain, vì một người lạ đang cân nhắc xem bảng này có trả lời được câu hỏi của họ hay không thì cần biết một dòng là gì trước đã.',
      ),
      bi(
        'Run dbt docs generate and it ends by saying "Catalog written to target/catalog.json". dbt uses the word itself, and it means it. A data catalog is the searchable inventory of what data exists, what it means, and whether you can trust it. Two files feed the site: manifest.json holds what you declared, catalog.json holds what the warehouse reports. The site is the join of the two, which is why the descriptions have to come first — docs generate publishes your metadata, it does not invent it.',
        'Chạy dbt docs generate và nó kết thúc bằng dòng "Catalog written to target/catalog.json". dbt dùng đúng chữ catalog, và nó nói thật. Một data catalog là bản kiểm kê tra cứu được về chuyện dữ liệu nào đang tồn tại, chúng nghĩa là gì, và có tin được không. Hai file nuôi trang đó: manifest.json giữ những gì bạn khai, còn catalog.json giữ những gì kho dữ liệu báo về. Trang web là phép join của hai file đó, và đó là lý do phần mô tả phải làm trước, vì docs generate chỉ xuất bản metadata của bạn chứ không bịa ra nó.',
      ),
      bi(
        'Lineage comes in three levels. Table-level lineage is the DAG: what feeds this table and what breaks if its source changes. It always over-reports — it tells you which models read the orders source, not which models read the channel column. Column-level lineage traces one field through every expression, which is why category_daily_revenue shows up in the DAG\'s list of five but is untouched by order_total. dbt Core does not draw it; commercial catalogs sell exactly that automation. Row-level provenance is the third: _data_date and _run_id pointing at ops.etl_runs. A dbt DAG will never tell you which run wrote a particular row.',
        'Lineage có ba tầng. Tầng bảng chính là cái DAG: cái gì nuôi bảng này, và hỏng những gì nếu nguồn của nó đổi. Tầng này luôn báo dư: nó cho biết model nào đọc nguồn orders, chứ không cho biết model nào đọc cột channel. Tầng cột thì lần theo một trường qua từng biểu thức, và đó là lý do category_daily_revenue có tên trong danh sách năm model của DAG nhưng lại chẳng hề chạm tới order_total. dbt Core không vẽ tầng này; các catalog thương mại bán đúng phần tự động hoá đó. Tầng thứ ba là provenance ở mức dòng: hai cột _data_date và _run_id trỏ về ops.etl_runs. Một cái DAG của dbt sẽ không bao giờ nói cho bạn biết lần chạy nào đã ghi ra một dòng cụ thể.',
      ),
      bi(
        'One modeling word closes the lab, because the last task turns on it. A measure is additive when a rollup is recoverable from the stored values alone. Sum returned_units across months, regions or SKUs and the answer still means what it says. A ratio is not additive and must not be stored: a region\'s return rate is not the sum of its per-SKU rates, and not their average either unless every SKU sold the same number of units. Store the numerator and the denominator, divide at read time. And recompute a distinct count from the fact, never by summing a rollup.',
        'Một từ về mô hình hoá khép lại khoá lab, vì task cuối xoay quanh đúng nó. Một measure là additive khi ta khôi phục được con số tổng hợp chỉ từ các giá trị đã lưu. Cộng returned_units qua các tháng, các vùng hay các SKU thì kết quả vẫn đúng nghĩa của nó. Còn một tỷ lệ thì không additive và không được phép lưu: tỷ lệ trả hàng của một vùng không phải tổng các tỷ lệ theo từng SKU, mà cũng chẳng phải trung bình của chúng, trừ khi mọi SKU đều bán ra đúng bằng số lượng như nhau. Hãy lưu tử số và mẫu số, rồi chia lúc đọc. Còn phép đếm phân biệt thì luôn tính lại từ bảng fact, đừng bao giờ tính bằng cách cộng một bảng tổng hợp.',
      ),
    ],
    checks: [
      {
        q: bi(
          'dbt ls says five models break if shopcore drops the channel column. Is that the answer you send?',
          'dbt ls báo có năm model hỏng nếu shopcore bỏ cột channel. Đó có phải câu trả lời bạn gửi đi không?',
        ),
        a: bi(
          'No — it is an upper bound. Trace the column by hand and channel reaches staging and fct_orders and stops: no mart selects it, no test asserts on it. Two models to edit, a twenty-minute job, not a project.',
          'Không, đó mới là chặn trên. Lần theo cột đó bằng tay thì channel đi tới staging rồi tới fct_orders là hết: không mart nào chọn nó, không test nào kiểm nó. Chỉ có hai model phải sửa, một việc hai chục phút chứ không phải một dự án.',
        ),
      },
      {
        q: bi(
          'Your pooled return rate and your average of per-cell rates agree to within a fraction of a percent. Does that mean storing the rate is fine?',
          'Tỷ lệ trả hàng gộp và trung bình các tỷ lệ theo từng ô của bạn chênh nhau chưa tới một phần trăm. Vậy có nghĩa là lưu sẵn tỷ lệ cũng không sao chứ?',
        ),
        a: bi(
          'No. That near-agreement is a property of this synthetic data, where every cell is about the same size — the most dangerous kind of luck, the kind that lets a wrong habit pass its first test. A real catalogue is lumpy, and only the pooled rate ever answers the question.',
          'Không. Chuyện hai số gần bằng nhau là đặc tính của bộ dữ liệu tổng hợp này, nơi mọi ô đều xấp xỉ bằng nhau, tức là kiểu may mắn nguy hiểm nhất, kiểu để cho một thói quen sai vượt qua bài kiểm tra đầu tiên. Danh mục hàng thật thì lồi lõm, và chỉ có tỷ lệ gộp mới trả lời được câu hỏi.',
        ),
      },
    ],
  },
]

export const a15Terms: Term[] = [
  {
    term: 'model',
    gloss: 'một file .sql, một câu SELECT',
    means: bi(
      'One .sql file containing one SELECT; the filename becomes the table or view name. Everything dbt builds is a model, a seed, or a test.',
      'Một file .sql chứa đúng một câu SELECT, và tên file trở thành tên bảng hoặc view. Mọi thứ dbt dựng ra đều là model, seed hoặc test.',
    ),
    source: { name: 'dbt — About models', url: 'https://docs.getdbt.com/docs/build/models' },
  },
  {
    term: 'materialization',
    gloss: 'câu SELECT đó thành hiện thực bằng cách nào',
    means: bi(
      'view (free until queried), table (rebuilt from scratch each run), or incremental (only a slice is rebuilt). The A03 layer design — what persists versus what derives — as one config line.',
      'Là view (miễn phí cho tới khi có ai query), table (dựng lại từ đầu mỗi lần chạy), hoặc incremental (chỉ dựng lại một lát). Chính là thiết kế phân tầng của A03 về chuyện cái gì lưu lại và cái gì dẫn xuất, gói lại thành một dòng cấu hình.',
    ),
  },
  {
    term: 'source',
    gloss: 'lời khai về dữ liệu dbt đọc mà không dựng',
    means: bi(
      'A declaration: this data exists, here is where, here is how fresh it must be. A thin version of your A06 YAML contract — and named after the same producer system, shopcore.',
      'Một lời khai: dữ liệu này có tồn tại, nó nằm ở đây, và nó phải tươi tới mức nào. Đây là bản mỏng của contract YAML bạn viết ở A06, và được đặt tên theo đúng hệ thống bên gửi là shopcore.',
    ),
  },
  {
    term: 'seed',
    gloss: 'file CSV nhỏ được version cùng code',
    means: bi(
      'A small mapping table dbt loads as a table. Your A03 country conformance map, formalized — it is code, so it lives in the repo and goes through review like code.',
      'Một bảng ánh xạ nhỏ mà dbt nạp thành bảng. Chính là bảng quy chuẩn tên quốc gia của A03 được hình thức hoá; nó là code nên nằm trong repo và đi qua review như code.',
    ),
  },
  {
    term: 'ref() / source()',
    gloss: 'không bao giờ gõ tên bảng',
    means: bi(
      'Jinja calls dbt replaces with the real name at compile time. Because dbt knows who reads whom, it derives the DAG. Type a schema name inside a model and that model silently falls out of the graph.',
      'Là các lời gọi Jinja mà dbt thay bằng tên thật lúc biên dịch. Vì dbt biết ai đọc của ai nên nó suy ra được DAG. Còn gõ thẳng tên schema vào trong model thì model đó lặng lẽ rơi khỏi đồ thị.',
    ),
  },
  {
    term: 'DAG',
    gloss: 'bản đồ phụ thuộc, cha trước con',
    means: bi(
      'Directed acyclic graph — the dependency map derived from ref(). It is A11 Task 8\'s "marts rerun after core, in this order", automated and unable to go stale.',
      'Viết tắt của directed acyclic graph, tức bản đồ phụ thuộc suy ra từ ref(). Nó chính là câu "marts chạy lại sau core, theo thứ tự này" ở Task 8 của A11, được tự động hoá và không thể cũ đi.',
    ),
  },
  {
    term: 'incremental + delete+insert',
    gloss: 'transaction A07 gói trong một dòng config',
    means: bi(
      'dbt materializes the batch to a temp table, deletes every unique_key value present in it from the target, then inserts — transactionally. Open A07 next to the compiled file: BEGIN; DELETE; INSERT; COMMIT.',
      'dbt vật chất hoá lô dữ liệu ra một bảng tạm, xoá khỏi bảng đích mọi giá trị unique_key có trong lô đó, rồi chèn vào, tất cả trong một transaction. Hãy mở A07 đặt cạnh file đã biên dịch: BEGIN; DELETE; INSERT; COMMIT.',
    ),
  },
  {
    term: 'is_incremental()',
    gloss: 'lần đầu dựng hết, lần sau dựng lát',
    means: bi(
      'False when the table is absent, so the date filter vanishes and dbt does a full CREATE TABLE. True afterwards, so only the window rebuilds. Drop the guard and every "3-day" run silently restates all 69 days.',
      'Trả về false khi bảng chưa tồn tại, nên bộ lọc ngày biến mất và dbt chạy CREATE TABLE toàn phần. Sau đó trả về true, nên chỉ có cửa sổ được dựng lại. Bỏ cái chốt này đi thì mọi lần chạy "3 ngày" lặng lẽ dựng lại cả 69 ngày.',
    ),
  },
  {
    term: 'var / --vars',
    gloss: 'cờ --start/--end của A11, đội lốt mới',
    means: bi(
      'Runtime parameters declared in dbt_project.yml and overridden on the command line. Defaulting them to the whole history is the safe choice: a forgotten var then restates rather than under-loads.',
      'Là các tham số lúc chạy, khai trong dbt_project.yml và ghi đè được ở dòng lệnh. Đặt mặc định bằng toàn bộ lịch sử là lựa chọn an toàn: quên truyền var thì bị dựng lại thừa chứ không bị nạp thiếu.',
    ),
  },
  {
    term: 'generic vs singular test',
    gloss: 'luật theo cột, và luật không cột nào nói nổi',
    means: bi(
      'Generic tests are configured in YAML (not_null, unique, accepted_values, relationships) — the contract\'s per-column promises made executable. A singular test is hand-written SQL for a cross-field rule. Both compile to a SELECT that must return zero rows.',
      'Generic test được cấu hình trong YAML (not_null, unique, accepted_values, relationships), tức các lời hứa theo từng cột của contract được biến thành thứ chạy được. Còn singular test là SQL viết tay cho một luật bắc qua nhiều trường. Cả hai đều biên dịch ra một câu SELECT bắt buộc trả về 0 dòng.',
    ),
  },
  {
    term: 'severity: warn',
    gloss: 'rác đã biết thì cảnh báo, đừng chặn',
    means: bi(
      'Orphan customer ids are documented dirt since A05, around 0.05%. A test that fails on known dirt trains people to ignore red. Warn = known and watched; error = stop the line.',
      'Mấy cái customer_id mồ côi là rác đã được ghi nhận từ A05, chừng 0,05%. Một test cứ đỏ vì rác đã biết sẽ dạy người ta làm ngơ màu đỏ. Warn nghĩa là đã biết và đang theo dõi; error nghĩa là dừng dây chuyền.',
    ),
  },
  {
    term: 'source freshness',
    gloss: 'cái feed còn sống không',
    means: bi(
      'dbt computes max(loaded_at_field) and compares it to now. Your A06 freshness clause, executable. A dead feed should go red — in production this pages someone before a dashboard silently flatlines.',
      'dbt tính max của cột loaded_at_field rồi so với thời điểm hiện tại. Chính là điều khoản freshness của A06, ở dạng chạy được. Một cái feed đã chết thì phải đỏ lên, vì trong môi trường thật nó gọi người dậy trước khi một cái dashboard lặng lẽ nằm ngang.',
    ),
  },
  {
    term: 'metadata / data catalog',
    gloss: 'dữ liệu nói về dữ liệu, và chỗ tra cứu nó',
    means: bi(
      'Metadata is types, tests, freshness, dependencies, and what a column means. A catalog is the searchable place it lives, so someone who did not build a table can find it and decide whether to trust it. dbt docs generate builds one.',
      'Metadata là kiểu dữ liệu, test, độ tươi, các phụ thuộc, và nghĩa của từng cột. Catalog là nơi tra cứu được của đống đó, để một người không dựng ra bảng vẫn tìm thấy nó và quyết định có tin nó hay không. Lệnh dbt docs generate dựng ra đúng một cuốn như vậy.',
    ),
  },
  {
    term: 'table-level lineage',
    gloss: 'DAG trả lời "hỏng cái gì", nhưng báo dư',
    means: bi(
      'dbt ls --select "source:x+" lists everything downstream. It tells you which models read the source, not which read the column — always an upper bound, safe but blunt.',
      'Lệnh dbt ls --select "source:x+" liệt kê mọi thứ nằm phía dưới. Nó cho biết model nào đọc cái nguồn, chứ không cho biết model nào đọc cái cột, nên luôn là một chặn trên: an toàn nhưng cùn.',
    ),
  },
  {
    term: 'column-level lineage',
    gloss: 'lần theo một trường qua từng biểu thức',
    means: bi(
      'dbt Core does not draw it; you do it by reading four files. It is what turns "five models at risk" into "two models to edit" — and the automation commercial catalogs actually sell.',
      'dbt Core không vẽ tầng này; bạn tự làm bằng cách đọc bốn cái file. Chính nó biến câu "năm model có nguy cơ" thành "hai model phải sửa", và đó đúng là phần tự động hoá mà các catalog thương mại đang bán.',
    ),
  },
  {
    term: 'row-level provenance',
    gloss: 'tầng lineage dbt không có',
    means: bi(
      '_data_date and _run_id on the row, joining to ops.etl_runs for the file, the load time, the status and the row count. A dbt DAG will never tell you which run wrote a particular row.',
      'Hai cột _data_date và _run_id nằm trên dòng dữ liệu, join về ops.etl_runs để lấy tên file, giờ nạp, trạng thái và số dòng. Một cái DAG của dbt sẽ không bao giờ nói được lần chạy nào đã ghi ra một dòng cụ thể.',
    ),
  },
  {
    term: 'additive',
    gloss: 'cộng lên vẫn đúng nghĩa',
    means: bi(
      'A measure is additive when a rollup is recoverable from the stored values alone. Ratios never are: store the numerator and denominator, divide at read time. Distinct counts are not either: recompute from the fact.',
      'Một measure là additive khi ta khôi phục được con số tổng hợp chỉ từ các giá trị đã lưu. Tỷ lệ thì không bao giờ additive: hãy lưu tử số và mẫu số rồi chia lúc đọc. Phép đếm phân biệt cũng không: hãy tính lại từ bảng fact.',
    ),
    source: { name: 'guides/data_modeling.md §2', url: '' },
  },
  {
    term: 'grain',
    gloss: 'một dòng là một cái gì',
    means: bi(
      'The first sentence of every model description, and the thing the question decides rather than you. "Per product" forces item grain, because fct_orders has no sku at all.',
      'Là câu đầu tiên trong mọi dòng mô tả model, và là thứ do câu hỏi quyết định chứ không phải do bạn. Hỏi "theo từng sản phẩm" là ép về grain mức dòng hàng, vì fct_orders vốn không có cột sku nào cả.',
    ),
  },
  {
    term: 'accumulating-snapshot fact',
    gloss: 'loại fact bài này gọi tên mà không dựng',
    means: bi(
      'One row per process instance, one column per milestone, updated in place. The order lifecycle would be exactly this — but the feed ships only the current status, and at small scale only ~1.5% of orders are ever seen twice, so nearly every milestone column would be NULL. A fact type is only as good as the events you actually receive.',
      'Mỗi dòng là một lần chạy của quy trình, mỗi cột là một cột mốc, cập nhật tại chỗ. Vòng đời đơn hàng đúng ra phải là bảng kiểu này, nhưng feed chỉ gửi trạng thái hiện tại, mà ở scale small thì chỉ chừng 1,5% đơn từng được nhìn thấy quá một lần, nên gần như mọi cột mốc sẽ là NULL. Một loại fact chỉ tốt bằng đúng những sự kiện bạn thật sự nhận được.',
    ),
  },
]