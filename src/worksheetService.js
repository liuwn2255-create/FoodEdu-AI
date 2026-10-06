import { generateAIContent } from './services/aiApiAdapter.js';

const worksheetDesigns = [
  {
    key: 'baking',
    label: '烘焙製程與成品品質',
    matches: ['烘焙', '西點', '西点', '可頌', '可颂', '麵包', '面包', '發酵', '蛋糕', '甜點', '甜点'],
    objectives: ['辨認本次產品的麵糰狀態與發酵成熟度。', '依序記錄整形、烘烤中的關鍵參數。', '使用成品層次、體積與色澤判斷製程品質。'],
    questions: ['可頌麵糰的延展性與溫度會如何影響包油及成品層次？', '發酵不足或過度時，從麵糰外觀與烘烤結果可以觀察到哪些差異？', '為什麼需要記錄整形尺寸、發酵時間與烤焙條件？'],
    observations: ['麵糰狀態（延展性、溫度與筋性）', '發酵程度（體積、時間與按壓回彈）', '整形與包摺（厚度、切口及層次完整度）', '烘烤成品（色澤、體積、層次與中心熟度）'],
    tasks: ['依配方完成秤量與麵糰狀態紀錄，標出本次關鍵製程參數。', '完成發酵與整形觀察，將實際結果與預期狀態比較。', '品評烘烤成品，選出一項差異並提出可能的製程原因。'],
    thoughts: ['今天我學到最重要的一個麵糰或發酵判斷依據是什麼？', '哪個製程紀錄最能幫助我解釋成品層次或體積的差異？', '如果重新製作一次，我會優先調整哪個步驟？'],
  },
  {
    key: 'cooking',
    label: '烹調操作與成品檢核',
    matches: ['烹調', '烹飪', '廚藝', '刀工', '火候', '西餐', '中餐', '料理', '熱廚', '冷廚'],
    objectives: ['依菜色需求說明食材處理及前置備料的理由。', '記錄烹調火候、時間與調味時點對風味的影響。', '以份量、質地、溫度與擺盤檢視成品是否符合規格。'],
    questions: ['本次食材採用此種切割或前處理方式，會如何影響受熱與口感？', '火候或烹調時間改變時，成品的熟度與水分會產生什麼差異？', '如何判斷調味平衡，而不只依賴個人喜好？'],
    observations: ['食材處理（規格、清潔與備料完整度）', '火候控制（設備、溫度與烹調時間）', '調味紀錄（比例、加入時點與風味平衡）', '成品檢核（熟度、質地、份量及擺盤）'],
    tasks: ['按作業流程完成備料，檢查食材規格及生熟食分流。', '記錄一項火候或時間參數，觀察其對成品熟度的影響。', '完成成品品評，依共同檢核項目提出一項可操作的修正。'],
    thoughts: ['今天哪個食材處理或火候判斷最影響成品？', '我用什麼具體證據判斷調味與熟度，而不是只憑印象？', '如果重做一次，我會改進哪一個作業步驟？'],
  },
  {
    key: 'service',
    label: '顧客服務與情境應對',
    matches: ['客訴', '顧客', '服務', '外場', '桌邊', '餐桌', '接待', '宴會', '客人'],
    objectives: ['辨識顧客需求及本次情境中的關鍵服務接觸點。', '依服務流程練習桌面準備、溝通應對與適當的內外場交接。', '遇到客訴時能整理事實、回應顧客並提出符合現場權責的處理方式。'],
    questions: ['在客訴情境中，哪些資訊需要先聆聽與確認，才能避免誤解？', '餐桌擺設、服務動線或回應語句會如何影響顧客感受？', '哪些客訴可以由第一線處理，哪些情況需要回報主管？'],
    observations: ['顧客服務（需求確認、服務時機與接觸點）', '餐桌擺設（餐具位置、整潔及服務動線）', '應對技巧（聆聽、同理回應與資訊確認）', '客訴處理（處理步驟、權責判斷及後續回報）'],
    tasks: ['依指定情境完成桌面準備，使用檢核表檢視整潔與服務動線。', '輪替顧客與服務人員角色，演練需求確認及客訴回應。', '整理一份服務紀錄，說明處理結果與需要交接的資訊。'],
    thoughts: ['今天哪一句回應最能讓顧客知道需求已被理解？', '我如何在安撫顧客的同時，遵守現場服務規範與權責？', '如果重新演練，我會改進哪一個應對或交接步驟？'],
  },
  {
    key: 'food-safety',
    label: '食品安全與衛生檢核',
    matches: ['食品安全', '食品衛生', '衛生安全', '食安', '交叉污染', '保存溫度', '微生物', '冷藏'],
    objectives: ['辨識本次餐飲作業中的交叉污染與食品保存風險。', '依作業步驟確認個人衛生及時間、溫度管理要求。', '發現異常時能記錄事實並提出立即矯正與後續預防措施。'],
    questions: ['本次作業中，哪些環節可能造成生熟食或器具間的交叉污染？', '保存溫度與存放時間為什麼需要一起記錄？', '發現溫度或衛生紀錄異常時，第一步應如何處置？'],
    observations: ['交叉污染（作業分區、器具與接觸途徑）', '保存溫度（量測位置、數值及紀錄時間）', '個人衛生（洗手、工作服及操作習慣）', '食品安全（危害、預防措施與異常處置）'],
    tasks: ['沿作業流程標出可能發生交叉污染的位置及預防方式。', '量測或判讀食材保存條件，完成時間、溫度紀錄。', '針對一項模擬異常填寫處置紀錄及後續預防措施。'],
    thoughts: ['今天發現的哪項食品安全風險最需要立即控制？', '我留下的紀錄能否讓下一位同學清楚判斷食材狀態？', '如何讓衛生習慣在忙碌的餐飲現場也能確實執行？'],
  },
  {
    key: 'management',
    label: '餐飲營運與管理判讀',
    matches: ['管理', '經營', '成本', '菜單', '人力', '營運', '庫存', '採購', '行銷'],
    objectives: ['找出本次主題涉及的餐飲營運資料與決策條件。', '運用成本、人力、菜單或營運指標整理問題。', '提出能執行且可追蹤成效的改善方向。'],
    questions: ['要判斷本次營運問題，還需要哪些成本、人力或銷售資料？', '菜單設計或人力配置會如何影響顧客體驗及作業成本？', '用哪一項指標可以追蹤改善方案是否有效？'],
    observations: ['成本資料（食材成本、耗損與估算依據）', '人力配置（工作量、時段與角色分工）', '菜單分析（品項定位、備料與銷售表現）', '營運檢核（目標指標、現況數據與改善結果）'],
    tasks: ['從案例資料標記一項主要營運問題，寫下支持判斷的數據。', '比較兩個處理方案，說明其對成本、人力或顧客的影響。', '提出一個可追蹤的改善指標及資料蒐集方式。'],
    thoughts: ['今天哪一項資料改變了我對營運問題的判斷？', '我的建議如何兼顧成本、現場執行與顧客需求？', '下一次要如何確認改善措施確實帶來成效？'],
  },
  {
    key: 'general',
    label: '餐飲專業情境觀察',
    matches: [],
    objectives: ['說明「{topic}」在餐飲現場中的一項專業應用。', '依課堂示範完成相關觀察或操作，並記錄判斷依據。', '使用檢核項目回顧成果，提出一項具體改進方向。'],
    questions: ['本次主題「{topic}」在餐飲現場會遇到什麼實際問題？', '判斷操作或服務品質時，有哪些可觀察的證據？', '如何讓今天學到的方法更穩定地運用在實務情境？'],
    observations: ['作業條件（食材、設備或情境需求）', '操作步驟（順序、方法與注意事項）', '品質結果（符合要求的證據）', '改善方向（可調整的步驟或標準）'],
    tasks: ['依課堂指示整理主題相關的作業步驟或情境資訊。', '與同組同學完成操作／案例任務，留下成果檢核紀錄。', '提出一項有觀察依據的改善建議，並與同儕分享。'],
    thoughts: ['今天我學到最重要的一件專業知識是什麼？', '我用哪些觀察結果確認任務成果？', '如果重新做一次，我會改進什麼？'],
  },
];

function chooseDesign(course) {
  const fields = [course.topic, course.courseName, course.department]
    .filter(Boolean)
    .map((value) => value.toLocaleLowerCase());
  for (const field of fields) {
    const match = worksheetDesigns.find((design) => design.matches.some((keyword) => field.includes(keyword.toLocaleLowerCase())));
    if (match) return match;
  }
  return worksheetDesigns.at(-1);
}

function fillTopic(text, topic) {
  return text.replaceAll('{topic}', topic);
}

function buildWorksheet(course) {
  const design = chooseDesign(course);
  const topic = course.topic?.trim() || course.courseName;
  const tasks = design.tasks.map((task) => fillTopic(task, topic));
  const objectives = design.objectives.map((objective) => fillTopic(objective, topic));
  const questions = design.questions.map((question) => fillTopic(question, topic));
  const date = new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  return {
    title: '學生學習單',
    courseName: course.courseName,
    topic,
    grade: course.year,
    date,
    themeLabel: design.label,
    objectives,
    questions,
    notePrompts: ['重點一', '重點二', '重點三'],
    observations: design.observations.map((item) => fillTopic(item, topic)),
    tasks,
    reflections: design.thoughts.map((item) => fillTopic(item, topic)),
  };
}

function mockGenerateWorksheet(course) {
  return buildWorksheet(course);
}

// Swap this provider for an API-backed implementation when a production endpoint is ready.
export async function generateWorksheet(course, options = {}) {
  return generateAIContent({
    type: 'worksheet',
    course,
    options,
    instruction: options.instruction ?? '依課程資料產生適合大學生填寫與列印的學生學習單。',
  });
}
