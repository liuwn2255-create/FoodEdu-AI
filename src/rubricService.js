import { generateAIContent } from './services/aiApiAdapter.js';

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const makeLevels = (focus) => ({
  4: `能獨立且精確地${focus}，並能說明其對餐飲品質或流程的影響。`,
  3: `能依課程要求${focus}，主要步驟正確，僅需少量提醒。`,
  2: `能完成部分${focus}，但有明顯遺漏或需要多次提醒。`,
  1: `尚未能依基本要求${focus}，操作或判斷已影響成果。`,
});

const criteria = (entries) => entries.map(([name, weight, focus]) => ({ name, weight, levels: makeLevels(focus) }));

const templates = {
  bakery: criteria([
    ['食材與器具準備', 15, '依配方秤量食材並確認器具及工作站狀態'],
    ['麵糰處理', 15, '掌握攪拌程度、麵糰溫度與延展性'],
    ['包油與摺疊', 15, '保持奶油與麵糰延展性相近並均勻完成摺疊'],
    ['整形操作', 15, '依規格擀開、切割並維持層次完整'],
    ['發酵控制', 15, '依體積、表面與回彈狀態判斷發酵程度'],
    ['烘烤與成品品質', 15, '控制烘烤條件並依色澤、體積與組織檢查成品'],
    ['衛生與安全', 10, '維持個人衛生、工作檯清潔並安全使用設備'],
  ]),
  cooking: criteria([
    ['刀工與備料', 15, '依料理需求完成安全且均勻的刀工與分料'],
    ['食材處理', 15, '辨認食材狀態並完成適當清洗、瀝乾與保存'],
    ['火候控制', 20, '依鍋溫與食材狀態調整火力和烹調時間'],
    ['調味與風味', 10, '分階段調味並依試味結果修正風味平衡'],
    ['操作流程', 15, '按正確順序備料、下鍋及完成烹調'],
    ['成品品質', 15, '以熟度、色澤、香氣與口感檢核成品'],
    ['衛生與安全', 10, '遵守生熟食分區、刀具及熱源安全要求'],
  ]),
  service: criteria([
    ['顧客需求理解', 20, '傾聽並確認顧客的問題、需求與期待結果'],
    ['溝通技巧', 20, '以清楚、尊重且具同理心的方式說明與回應'],
    ['情緒管理', 15, '在壓力情境中保持平穩語氣並適時尋求支援'],
    ['問題分析', 15, '釐清客訴事實、影響範圍及可處理的原因'],
    ['服務補救', 20, '提出符合顧客需求及服務授權範圍的補救方案'],
    ['應對流程與追蹤', 10, '依客訴處理流程完成回應、紀錄與後續追蹤'],
  ]),
  management: criteria([
    ['成本分析', 20, '依正確資料拆解食材、人力或營運成本構成'],
    ['資料判讀', 15, '辨識營運資料趨勢、限制與合理比較基準'],
    ['成本率計算', 20, '正確計算成本率並說明計算口徑與結果'],
    ['菜單策略', 15, '依毛利、銷售表現及顧客需求提出菜單調整'],
    ['營運判斷', 15, '評估庫存、人力與流程對營運決策的影響'],
    ['提案能力', 15, '以數據說明可行方案、預期效益及追蹤指標'],
  ]),
  safety: criteria([
    ['危害辨識', 20, '找出流程中的生物性、化學性或物理性危害'],
    ['生熟食分離', 20, '以分區、標示及專用器具避免交叉污染'],
    ['個人衛生', 15, '在正確時機落實洗手、工作服與個人衛生要求'],
    ['器具清潔消毒', 15, '依程序清潔器具並正確使用消毒用品'],
    ['保存溫度與紀錄', 15, '正確測量、記錄並依保存條件處置食品'],
    ['食品安全判斷', 15, '發現異常時採取隔離、通報及可追溯處置'],
  ]),
  general: criteria([
    ['材料與器具準備', 15, '依任務要求準備材料並確認器具可安全使用'],
    ['操作流程', 20, '依步驟完成操作並掌握關鍵順序'],
    ['技術與狀態判斷', 20, '運用合適技術觀察過程並作出合理判斷'],
    ['時間與品質控制', 15, '記錄關鍵時間或條件並達成基本品質標準'],
    ['衛生與安全', 15, '遵守餐飲衛生、工作站整理與操作安全要求'],
    ['成果檢核與說明', 15, '依評量標準檢視成果並說明改進方向'],
  ]),
};

function selectTemplate(course) {
  const context = `${course.courseName} ${course.topic} ${course.teachingNeeds}`.toLowerCase();
  const department = `${course.department}`.toLowerCase();
  if (/食品安全|食品衛生|交叉污染|生熟分離|保存溫度|危害控制|衛生管理/.test(context)) return templates.safety;
  if (/客訴|顧客|餐桌服務|餐飲服務|服務流程|服務補救|應對技巧|情緒管理|服務管理/.test(context)) return templates.service;
  if (/成本控制|餐廳成本|庫存管理|菜單設計|營運管理|餐飲管理|人力配置/.test(context)) return templates.management;
  if (/烘焙|可頌|麵包|蛋糕|西點|發酵|麵糰|麵團/.test(context) || /烘焙/.test(department)) return templates.bakery;
  if (/烹調|熱炒|刀工|湯品|烹飪|炒鍋|火候/.test(context)) return templates.cooking;
  return templates.general;
}

export async function generateRubric(course) {
  return generateAIContent({
    type: 'rubric',
    course,
    instruction: '依課程資料產生包含四級表現描述及權重的教師評量 Rubric。',
  }, {
    mockGenerator: async ({ course: requestedCourse }) => {
      await delay(650);
      const items = selectTemplate(requestedCourse).map((item) => ({ ...item, levels: { ...item.levels } }));
      return {
        title: '課程評量 Rubric',
        courseName: requestedCourse.courseName,
        topic: requestedCourse.topic,
        grade: requestedCourse.year,
        students: requestedCourse.studentCount,
        items,
        levels: [
          { score: 4, label: '優秀', description: '表現明顯優於課程要求。' },
          { score: 3, label: '良好', description: '達到課程要求，操作大致正確。' },
          { score: 2, label: '待改進', description: '部分達到要求，但仍有明顯問題。' },
          { score: 1, label: '需加強', description: '尚未達到基本課程要求。' },
        ],
        totalWeight: items.reduce((sum, item) => sum + item.weight, 0),
      };
    },
  });
}
