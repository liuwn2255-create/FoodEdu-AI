import { generateAIContent } from './services/aiApiAdapter.js';

const questionSets = [
  {
    key: 'baking',
    matches: ['烘焙', '西點', '西点', '可頌', '可颂', '麵包', '面包', '發酵', '蛋糕', '甜點', '甜点'],
    multipleChoice: [
      { prompt: '製作「{topic}」時，麵糰溫度高於配方設定的工作目標，準備進入包油摺疊前，較適當的處理是？', options: ['A', 'B', 'C', 'D'], answer: 'B', explanation: '先讓麵糰回到適合操作的溫度範圍，可降低奶油過早軟化、滲入麵糰而破壞層次的風險。實際目標仍依配方、室溫與設備條件判定。' },
      { prompt: '可頌製作中，包覆用奶油的延展性最重要的作用是什麼？', options: ['A', 'B', 'C', 'D'], answer: 'C', choiceTexts: ['提供油脂風味，與麵糰延展性無關', '完全融化後吸收到麵糰中', '與麵糰同步延展，形成連續且均勻的油脂層', '取代麵糰中的酵母作用'], explanation: '奶油與麵糰需要有相近的延展性，摺疊時才能形成連續、均勻的油脂層；奶油過硬易刺破麵糰，過軟則容易滲出。' },
      { prompt: '麵糰摺疊並冷藏鬆弛的主要目的為何？', options: ['A', 'B', 'C', 'D'], answer: 'A', choiceTexts: ['建立麵糰與奶油交替層，並讓麵筋鬆弛、奶油維持可塑性', '加快酵母發酵，使麵糰立即膨大', '讓奶油完全融入麵糰以避免分層', '減少烘烤時所需的烤爐溫度'], explanation: '反覆包油與摺疊建立麵糰、奶油交替的薄層；鬆弛可降低麵筋張力，也讓奶油維持可塑性，利於後續延展。' },
      { prompt: '判斷可頌最後發酵是否適當，最可靠的做法是？', options: ['A', 'B', 'C', 'D'], answer: 'D', choiceTexts: ['只依配方標示的固定時間判斷', '觀察烘烤後的表面上色', '以麵糰室溫代替發酵狀態檢查', '綜合觀察體積、層次狀態與輕觸回彈'], explanation: '須同時觀察體積、層次狀態與輕觸回彈，並配合發酵環境判斷；只依固定時間容易忽略麵糰溫度、酵母活性及環境差異。' },
      { prompt: '出爐後檢視「{topic}」的層次與烘烤品質，下列哪一項最適合作為判讀依據？', options: ['A', 'B', 'C', 'D'], answer: 'A', choiceTexts: ['綜合檢視色澤、側面層次、體積、內部熟度與組織', '只看產品表面顏色是否一致', '只核對實際烘烤分鐘數', '只比較出爐前後重量'], explanation: '應綜合觀察外層色澤、側面層次、體積、內部熟度與組織，不以單一表面顏色判定成品品質。' },
    ],
    trueFalse: [
      { prompt: '包油摺疊時，若奶油延展性遠低於麵糰，奶油容易在擀壓時斷裂並造成層次不均。', answer: true, explanation: '奶油與麵糰的延展性不匹配會使油脂層破碎或集中，影響後續層次。' },
      { prompt: '可頌最後發酵只要達到固定時間，就不需要再觀察麵糰狀態。', answer: false, explanation: '發酵速度會受麵糰溫度、酵母活性及環境影響，應以體積與觸感等狀態指標輔助判斷。' },
      { prompt: '烘烤溫度與時間會影響奶油水分汽化、層次膨起與成品上色。', answer: true, explanation: '烘烤條件會影響蒸氣膨發、結構定型及梅納反應，須依產品大小與烤爐特性調整。' },
    ],
    shortAnswer: [
      { prompt: '說明包油前如何判斷麵糰與奶油是否適合進行摺疊，並寫出一項可採取的修正方式。', referenceAnswer: '可觀察麵糰與奶油的溫度、硬度及延展性；兩者應能同步擀開。若麵糰偏軟或溫度偏高，可先冷藏鬆弛；奶油偏硬則需回溫至可塑但不融化。', scoringPoints: ['提到麵糰與奶油的延展性／硬度比較（2 分）', '提出與狀態相符的溫度或鬆弛修正方式（2 分）'] },
      { prompt: '烘烤後若可頌層次黏合、體積偏小，請列出兩項可能的製程原因及你會如何查證。', referenceAnswer: '可能原因包括包油層破裂、摺疊時奶油融化、最後發酵不足或烘烤條件不適。可比對包油與摺疊紀錄、發酵體積／觸感及烤爐溫度時間紀錄來查證。', scoringPoints: ['提出至少兩項與層次或發酵相關的合理原因（2 分）', '說明以製程紀錄或成品證據查證（2 分）'] },
    ],
  },
  {
    key: 'cooking',
    matches: ['烹調', '烹飪', '廚藝', '刀工', '火候', '熱炒', '西餐', '中餐', '料理', '熱廚', '冷廚'],
    multipleChoice: [
      { prompt: '進行「{topic}」前，刀工規格一致最直接的專業效益為何？', options: ['A', 'B', 'C', 'D'], answer: 'D', explanation: '食材大小一致有助於受熱速度與熟度一致，也使份量、口感及出餐品質較易標準化。' },
      { prompt: '熱炒時鍋具與油脂尚未達適當操作狀態便放入主食材，最可能造成什麼結果？', options: ['A', 'B', 'C', 'D'], answer: 'B', choiceTexts: ['食材快速形成焦香且水分立即鎖住', '鍋溫不足使食材出水、加熱時間延長且香氣不易形成', '食材切面縮小並自動均勻熟成', '油脂溫度降低會增加鍋氣'], explanation: '鍋溫不足會讓食材出水、延長加熱時間，難以形成預期的香氣與表面色澤；應依設備與食材特性判斷鍋溫。' },
      { prompt: '中式熱炒依序下料的主要考量為何？', options: ['A', 'B', 'C', 'D'], answer: 'A', choiceTexts: ['依食材厚度、含水量與熟成時間安排下料，維持口感與熟度', '先放最易熟的食材，讓其在鍋中等待較久', '所有食材同時入鍋以統一受熱時間', '只依食材顏色決定下鍋順序'], explanation: '不同食材的厚度、含水量與熟成時間不同，依序下料可避免易熟食材過度加熱，並維持成品口感。' },
      { prompt: '為使「{topic}」的調味結果可重現，課堂紀錄最應包含什麼？', options: ['A', 'B', 'C', 'D'], answer: 'C', choiceTexts: ['僅記錄料理完成時間', '只記錄組員的個人喜好', '調味比例、加入時點及試味結果', '只記錄食材採購價格'], explanation: '紀錄調味比例、加入時點與試味結果，才能將個人感受轉化為可比較、可修正的操作依據。' },
      { prompt: '出餐前檢查炒製成品時，下列哪組項目最完整？', options: ['A', 'B', 'C', 'D'], answer: 'B', choiceTexts: ['只檢查盤面是否乾淨', '熟度、風味、食材口感、份量與呈盤', '只確認訂單桌號', '只比較表面色澤深淺'], explanation: '出餐品質需同時考量熟度、風味、食材口感、份量與呈盤，不宜只依賴色澤判斷。' },
    ],
    trueFalse: [
      { prompt: '食材切割大小會影響受熱速度，因此刀工規格與烹調時間有關。', answer: true, explanation: '尺寸會影響熱傳與熟成速度，規格不一致可能導致同鍋成品熟度不同。' },
      { prompt: '為了加快出餐，所有食材都應在熱炒一開始同時下鍋。', answer: false, explanation: '食材熟成時間與含水量不同，應依工序安排下料順序。' },
      { prompt: '調味若未記錄比例與加入時點，日後較難比較批次間的風味差異。', answer: true, explanation: '製程資料有助於檢查差異來源，並建立穩定的風味標準。' },
    ],
    shortAnswer: [
      { prompt: '請以「{topic}」為例，說明一種刀工規格如何影響火候或成品口感。', referenceAnswer: '依菜色說明食材規格與厚度如何影響受熱速度、熟度或口感，並舉出一致切割有助於成品穩定的例子。', scoringPoints: ['正確連結刀工尺寸與受熱／熟度（2 分）', '舉出符合菜色情境的說明（2 分）'] },
      { prompt: '若同一批成品有的過熟、有的仍偏生，請提出兩項可能原因及一項改善作法。', referenceAnswer: '可能原因包括切割規格不一、下料順序不當、鍋溫不穩或翻炒不均。可統一食材尺寸並依熟成時間安排下料，再記錄鍋溫與烹調時間。', scoringPoints: ['指出至少兩項合理製程原因（2 分）', '提出具體且可執行的改善作法（2 分）'] },
    ],
  },
  {
    key: 'service',
    matches: ['客訴', '顧客', '服務', '外場', '桌邊', '餐桌', '接待', '宴會', '客人'],
    multipleChoice: [
      { prompt: '處理「{topic}」時，顧客表示餐點延誤且情緒激動，服務人員第一步最適合怎麼做？', options: ['A', 'B', 'C', 'D'], answer: 'C', explanation: '先維持冷靜並傾聽，確認顧客實際需求與已發生的事實，再依權責說明可採取的處理方式。立即辯解或承諾超出權限的補償都可能升高衝突。' },
      { prompt: '下列哪一組最符合客訴處理的基本流程？', options: ['A', 'B', 'C', 'D'], answer: 'A', choiceTexts: ['傾聽與確認事實 → 表達理解 → 提出可行處理 → 確認結果並紀錄', '先反駁顧客 → 結束對話 → 事後再查證', '先承諾最高補償 → 不必確認權限 → 不留紀錄', '請顧客自行聯繫其他部門 → 服務人員不再追蹤'], explanation: '適當流程包含聆聽、確認事實與需求、表達理解、提出可行處理、確認顧客感受並完成紀錄與回報。' },
      { prompt: '服務補救的主要目的為何？', options: ['A', 'B', 'C', 'D'], answer: 'D', choiceTexts: ['只要完成折讓程序即可，不需了解顧客感受', '避免向主管通報服務問題', '要求顧客接受餐廳原有安排', '回應顧客受影響的需求、恢復信任並回饋現場改善'], explanation: '服務補救須回應顧客受影響的需求並恢復信任，同時留下資訊供現場改善；單純完成賠償程序不一定解決問題。' },
      { prompt: '服務人員遇到無法立即處理、超出職權的客訴時，最恰當的作法是？', options: ['A', 'B', 'C', 'D'], answer: 'B', choiceTexts: ['先答應顧客提出的所有補償要求', '說明將依程序請主管協助，整理事實並完成交接', '請顧客稍後重新提出，不記錄事件', '將責任直接轉給廚房人員'], explanation: '應先安定現場並清楚告知後續處理，完整記錄事實，依組織規範即時交由主管處理，避免擅自承諾。' },
      { prompt: '客訴結案前，哪一項最能確認服務補救是否符合顧客需求？', options: ['A', 'B', 'C', 'D'], answer: 'C', choiceTexts: ['確認已完成內部表單即可', '確認主管已讀取訊息即可', '確認顧客對處理結果的感受並說明後續追蹤', '確認同桌其他顧客沒有提出抱怨即可'], explanation: '確認顧客對處理結果的感受並說明後續追蹤，才能判斷問題是否真正解除，而不只是完成內部程序。' },
    ],
    trueFalse: [
      { prompt: '客訴處理時，先確認顧客描述與實際需求，有助於避免提出不適切的補救方式。', answer: true, explanation: '釐清事實與期待是選擇適當服務補救的依據。' },
      { prompt: '為了讓顧客立刻滿意，第一線服務人員可以不需確認權限就承諾任何折讓或補償。', answer: false, explanation: '超出權限的承諾會造成後續履行問題，應依服務規範升級處理並清楚告知顧客。' },
      { prompt: '客訴處理完成後仍應留下事實、處置結果與必要的後續回報紀錄。', answer: true, explanation: '紀錄有助交接、追蹤顧客狀況與改善重複發生的服務問題。' },
    ],
    shortAnswer: [
      { prompt: '請為「{topic}」寫出一段三步驟的服務補救回應，並說明每一步的目的。', referenceAnswer: '可依序呈現：聆聽並確認顧客需求、表達理解並說明可行處理選項、確認顧客接受的方案並告知後續追蹤；依情境補充紀錄與主管回報。', scoringPoints: ['回應包含傾聽／釐清與同理（2 分）', '提出在權責內的處理並確認後續（2 分）'] },
      { prompt: '顧客仍不接受初步處理方案時，服務人員如何管理自己的情緒並完成適當交接？', referenceAnswer: '保持語氣平穩、不與顧客爭辯；重述已確認的需求與事實，說明將依權責請主管協助，並完整交代時間、事件、已採措施及顧客期待。', scoringPoints: ['提出具體情緒調節及溝通方式（2 分）', '指出交接所需的客觀資訊（2 分）'] },
    ],
  },
  {
    key: 'management',
    matches: ['管理', '成本', '毛利', '菜單', '人事', '人力', '庫存', '採購', '營運', '經營'],
    multipleChoice: [
      { prompt: '分析「{topic}」時，食材成本率通常以哪種方式計算？', options: ['A', 'B', 'C', 'D'], answer: 'A', explanation: '食材成本率常以食材成本除以銷售額，再乘以百分比表示；計算期間與成本口徑需一致，才可比較。' },
      { prompt: '下列哪項作法最有助於區分食材耗損與盤點誤差？', options: ['A', 'B', 'C', 'D'], answer: 'D', choiceTexts: ['只比較本月與上月採購總額', '查看廚房當日剩餘食材外觀', '以銷售額估計所有耗損', '核對收貨、領用、報廢、銷售與期末盤點紀錄'], explanation: '建立收貨、領用、報廢與期末盤點紀錄，並核對相同期間的銷售與庫存資料，才能辨認差異來源。' },
      { prompt: '餐廳評估菜單品項時，除了銷售量，還應同時比較什麼？', options: ['A', 'B', 'C', 'D'], answer: 'B', choiceTexts: ['餐點照片的色彩數量', '單品貢獻毛利、備料耗損、製作工時及菜單定位', '每道菜的餐具重量', '廚房員工的個人偏好'], explanation: '銷售量需與單品貢獻毛利、備料耗損、製作工時及菜單定位一併檢視，避免只依人氣做決策。' },
      { prompt: '人事成本比率上升時，第一個適當的管理步驟是？', options: ['A', 'B', 'C', 'D'], answer: 'C', choiceTexts: ['直接取消尖峰時段排班', '不檢視營業額，立即減少所有班別人數', '核對排班工時、時段工作量與服務需求，再分析成本變化原因', '將必要服務工作全部移除'], explanation: '應先核對排班工時、營業時段工作量與服務需求，確認上升原因，再提出排班或流程調整，而非直接削減必要人力。' },
      { prompt: '要判斷成本改善方案是否有效，最重要的是？', options: ['A', 'B', 'C', 'D'], answer: 'B', choiceTexts: ['只比較改善後單日採購金額', '先設定一致基準與量化指標，再追蹤成本及服務品質變化', '只詢問執行人員是否覺得方便', '不需保留改善前資料'], explanation: '先設定一致的基準期與可量化指標，再追蹤成本變化及顧客服務品質，確認改善沒有造成其他負面影響。' },
    ],
    trueFalse: [
      { prompt: '成本率比較時應使用相同期間與一致的計算口徑。', answer: true, explanation: '期間或成本範圍不一致會使數值失去可比較性。' },
      { prompt: '銷售量最高的菜色一定是貢獻毛利最高、最應保留的菜色。', answer: false, explanation: '銷售量不等同單品貢獻毛利，還需檢視成本、耗損、工時與菜單定位。' },
      { prompt: '庫存管理紀錄可協助追蹤採購、領用與食材耗損。', answer: true, explanation: '完整的進出存及報廢紀錄是盤點差異分析與採購規劃的基礎。' },
    ],
    shortAnswer: [
      { prompt: '請說明評估「{topic}」時，如何同時運用成本率與毛利資訊，避免只看單一數字。', referenceAnswer: '先以一致口徑計算食材成本率，再檢視單品售價、單位成本與貢獻毛利，並結合銷售量、耗損及菜單定位提出管理判斷。', scoringPoints: ['正確說明成本率與毛利需分別判讀（2 分）', '提出至少一項搭配使用的營運資料（2 分）'] },
      { prompt: '餐廳盤點發現原料用量高於理論值，請列出兩項可能原因與一項查核方法。', referenceAnswer: '可能原因包括份量控制不一致、備料修切耗損、報廢未記錄、領料或盤點誤差。可核對標準配方、領料、報廢、銷售及實際盤點紀錄。', scoringPoints: ['提出至少兩項合理差異來源（2 分）', '提出可追溯的交叉查核方式（2 分）'] },
    ],
  },
  {
    key: 'food-safety',
    matches: ['食品安全', '食品衛生', '食安', '交叉污染', '保存溫度', '微生物', '冷藏', '危害'],
    multipleChoice: [
      { prompt: '處理生鮮食材後要接觸即食食品，最優先的防止交叉污染措施是？', options: ['A', 'B', 'C', 'D'], answer: 'C', explanation: '應依程序洗手並更換或清潔消毒受污染的器具與工作表面，且將生熟食作業分開。只擦拭手套外層不足以去除污染。' },
      { prompt: '為確認冷藏食品保存條件，下列哪種紀錄最具判讀價值？', options: ['A', 'B', 'C', 'D'], answer: 'A', choiceTexts: ['實測溫度、量測時間及設備／食品識別資訊', '只記錄冷藏設備的設定數字', '只寫下負責人姓名', '每週記一次室溫即可'], explanation: '紀錄應包含實測溫度、量測時間與設備／食品識別資訊，並依場所標準判斷是否需要矯正。' },
      { prompt: '以下哪項最能降低共用刀具造成的交叉污染風險？', options: ['A', 'B', 'C', 'D'], answer: 'D', choiceTexts: ['使用後以紙巾擦拭刀面', '以清水沖過後立刻切即食食品', '同一把刀依序處理生食與熟食，不需中斷', '依生熟食或食材類別分流器具，轉換用途時清洗消毒'], explanation: '依生熟食或食材類別分流器具，並在轉換用途時依程序清洗消毒，比單純以清水沖洗更能控制污染。' },
      { prompt: '食品接觸面完成清潔與消毒後，操作人員還應確認什麼？', options: ['A', 'B', 'C', 'D'], answer: 'B', choiceTexts: ['表面看起來沒有水漬即可', '依標示確認消毒劑濃度、作用時間及後續沖洗／乾燥要求', '只確認清潔工具已收好', '立即用未清潔的抹布擦乾'], explanation: '需依消毒劑標示確認濃度、作用時間及是否需沖洗／乾燥，並遵循食品接觸面的作業規範。' },
      { prompt: '發現保存溫度紀錄超出現場標準時，最合適的第一步是？', options: ['A', 'B', 'C', 'D'], answer: 'D', choiceTexts: ['忽略紀錄並以食品外觀判斷', '立即把紀錄改成標準範圍', '繼續供餐，等下班再通知', '依程序隔離或標示食品、確認影響範圍並通知負責人'], explanation: '先依現場程序隔離或標示相關食品、確認受影響範圍並通知負責人，再依食品安全規範判斷後續處置並留存紀錄。' },
    ],
    trueFalse: [
      { prompt: '生熟食分開處理有助於降低交叉污染風險。', answer: true, explanation: '作業區、容器及器具分流可降低病原微生物由生食轉移至即食食品的機會。' },
      { prompt: '只要佩戴手套，就不需要依規範洗手或更換手套。', answer: false, explanation: '手套可能受到污染，也不能取代洗手；轉換作業或污染時須依規範更換並洗手。' },
      { prompt: '食品保存紀錄若有異常，應依程序處置並留下追蹤紀錄。', answer: true, explanation: '可追溯紀錄有助於確認受影響食品、矯正措施與後續預防是否完成。' },
    ],
    shortAnswer: [
      { prompt: '請依「{topic}」情境說明一條可能的交叉污染途徑，並寫出兩項阻斷措施。', referenceAnswer: '例如生肉汁液經砧板或手部接觸即食食品；可採生熟食分區與專用器具、作業轉換時洗手並依程序清潔消毒。', scoringPoints: ['指出合理的污染來源與傳播途徑（2 分）', '提出兩項可執行的阻斷措施（2 分）'] },
      { prompt: '冷藏設備的保存溫度紀錄出現異常時，現場應如何確認受影響食品並完成處置？', referenceAnswer: '確認量測時間、設備狀態、食品種類及存放時段，先依程序隔離與標示受影響食品，通知負責人並依標準判定可否使用或需報廢，記錄矯正及複核結果。', scoringPoints: ['說明受影響範圍與食品狀態確認（2 分）', '提出隔離、通報、判定及紀錄等適當步驟（2 分）'] },
    ],
  },
  {
    key: 'general',
    matches: [],
    multipleChoice: [
      { prompt: '針對「{topic}」設計餐飲現場作業時，何者最能讓品質要求被穩定執行？', options: ['A', 'B', 'C', 'D'], answer: 'B', explanation: '將作業步驟、關鍵標準與檢核方式明確化，並留下必要紀錄，能提升不同操作者間的一致性。' },
      { prompt: '學生觀察餐飲作業成果時，哪一種紀錄最有助於之後追查差異？', options: ['A', 'B', 'C', 'D'], answer: 'D', choiceTexts: ['只寫下最後成品「好吃／不好吃」', '只記錄參與學生名單', '只記錄課程結束時間', '記錄實際條件、操作步驟與成果證據'], explanation: '記錄實際條件、操作步驟與成果證據，比僅寫主觀感受更能支持後續比較與改善。' },
      { prompt: '當實際成果未符合課程要求時，最適當的分析方式是？', options: ['A', 'B', 'C', 'D'], answer: 'A', choiceTexts: ['對照作業標準，找出可能影響條件並提出可驗證的修正', '同時改變所有操作條件，不必保留紀錄', '直接判定操作者不適合此項工作', '忽略不符合項目並繼續下一流程'], explanation: '將結果對照作業標準，找出可能影響的步驟或條件，提出可驗證的修正，而非一次更動多項因素。' },
      { prompt: '在餐飲現場調整作業流程前，應優先確認什麼？', options: ['A', 'B', 'C', 'D'], answer: 'C', choiceTexts: ['只確認流程是否能縮短時間', '只確認食材成本是否降低', '食品安全、服務品質、設備人力與現場規範', '只確認負責人是否同意'], explanation: '流程調整須同時檢視食品安全、服務品質、設備人力與現場規範，避免改善一項指標卻產生新的風險。' },
      { prompt: '一項改善建議要具備可評估性，至少應包含什麼？', options: ['A', 'B', 'C', 'D'], answer: 'B', choiceTexts: ['負責人的個人看法', '明確目標、執行方式與可觀察或量化的成果指標', '僅有改善後的想像情境', '不需設定追蹤時間'], explanation: '需有明確目標、執行方式及可觀察或量化的成果指標，才能在執行後判斷成效。' },
    ],
    trueFalse: [
      { prompt: '作業紀錄可協助比較不同操作條件與餐飲成果之間的關係。', answer: true, explanation: '一致的紀錄使觀察結果可比較，也有助於追溯問題來源。' },
      { prompt: '未先確認問題原因前，同時改動所有操作條件最容易判斷改善成效。', answer: false, explanation: '一次改動過多因素會難以辨認哪項調整造成結果變化，宜依證據逐項驗證。' },
      { prompt: '餐飲作業改善仍須符合食品安全與現場規範。', answer: true, explanation: '效率或成本改善不得以犧牲食品安全與必要品質為代價。' },
    ],
    shortAnswer: [
      { prompt: '請以「{topic}」為例，列出一項可觀察的品質指標及其檢核方式。', referenceAnswer: '答案需提出與主題相關的品質指標、觀察或量測方式，以及判定符合要求的依據。', scoringPoints: ['指標與課程主題相關且可觀察（2 分）', '檢核方式與判定依據清楚（2 分）'] },
      { prompt: '若「{topic}」的作業成果不穩定，請提出一項可能原因及一個可驗證的改善步驟。', referenceAnswer: '指出一項具體作業條件或流程原因，提出單一可執行的調整，並說明如何記錄與比較改善前後的結果。', scoringPoints: ['原因具體且與流程相關（2 分）', '改善步驟可驗證且有成果紀錄（2 分）'] },
    ],
  },
];

function selectQuestionSet(course) {
  const fields = [course.topic, course.courseName, course.department]
    .filter(Boolean)
    .map((value) => value.toLocaleLowerCase());
  for (const field of fields) {
    const matched = questionSets.find((set) => set.matches.some((keyword) => field.includes(keyword.toLocaleLowerCase())));
    if (matched) return matched;
  }
  return questionSets.at(-1);
}

function interpolate(text, topic) {
  return text.replaceAll('{topic}', topic);
}

function buildQuestionBank(course) {
  const set = selectQuestionSet(course);
  const topic = course.topic?.trim() || course.courseName;
  return {
    courseName: course.courseName,
    topic,
    grade: course.year,
    needs: course.teachingNeeds,
    questions: {
      multipleChoice: set.multipleChoice.map((item) => ({
        ...item,
        prompt: interpolate(item.prompt, topic),
        options: item.options.map((option, index) => ({ label: option, text: interpolate(item.choiceTexts?.[index] ?? optionText[set.key][option], topic) })),
      })),
      trueFalse: set.trueFalse.map((item) => ({ ...item, prompt: interpolate(item.prompt, topic) })),
      shortAnswer: set.shortAnswer.map((item) => ({ ...item, prompt: interpolate(item.prompt, topic), referenceAnswer: interpolate(item.referenceAnswer, topic) })),
    },
  };
}

const optionText = {
  baking: { A: '依原定流程直接包油，不需理會麵糰狀態', B: '先降溫至配方適用的操作範圍，再確認延展性', C: '提高室溫讓奶油快速融入麵糰', D: '額外加入麵粉吸收奶油' },
  cooking: { A: '只要縮短備料時間，切割大小不需一致', B: '所有食材同時下鍋以維持相同烹調時間', C: '以增加調味料取代火候控制', D: '使同批食材受熱速度與熟度較一致' },
  service: { A: '立即說明餐廳沒有延誤責任', B: '先承諾免費招待，再確認事件經過', C: '保持冷靜傾聽，確認需求與事實後再提出處理方式', D: '請顧客先停止表達並等待結帳' },
  management: { A: '食材成本 ÷ 銷售額 × 100%', B: '銷售額 ÷ 人數', C: '庫存量 ÷ 人事工時', D: '毛利 ÷ 採購單價' },
  'food-safety': { A: '只記錄設備面板顯示，不記錄量測時間', B: '以目視確認食品沒有變色即可', C: '依程序洗手，並清潔消毒或更換受污染器具與表面', D: '以清水快速沖過手套後繼續操作' },
  general: { A: '只依資深員工記憶操作，不需留下資料', B: '明確作業步驟、品質標準與檢核紀錄', C: '只在客訴發生後才檢查流程', D: '讓每位操作者各自決定份量與流程' },
};

function mockGenerateQuestionBank(course) {
  return buildQuestionBank(course);
}

// Replace this provider with an API-backed implementation when a production endpoint is ready.
export async function generateQuestionBank(course, options = {}) {
  const settings = { questionCount: 10, questionTypes: ['選擇題', '是非題', '簡答題'], typeCounts: { multipleChoice: 5, trueFalse: 3, fillIn: 0, shortAnswer: 2 }, ...options };
  return generateAIContent({
    type: 'questionBank',
    course,
    options: settings,
    instruction: settings.instruction ?? '產生 5 題選擇題、3 題是非題及 2 題簡答題，包含教師答案與解析。',
  });
}
