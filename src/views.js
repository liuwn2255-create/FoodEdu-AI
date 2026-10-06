import { featureCards, sampleMaterials } from './data.js';

const icons = {
  logo: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="15" fill="currentColor"/><path d="M15 31V17h7.1c4.3 0 6.9 2.2 6.9 5.8s-2.6 5.8-6.9 5.8H19v2.4h-4Zm4-5.7h2.8c2 0 3.1-.9 3.1-2.5s-1.1-2.5-3.1-2.5H19v5ZM31.2 17h3.9v14h-3.9z" fill="#fff"/></svg>',
  arrow: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12M10 4l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  plus: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
};

function shell(content, active = 'home') {
  return `<div class="app-shell"><aside class="sidebar">
    <a class="brand" href="#" data-action="home"><span class="brand-mark">${icons.logo}</span><span class="brand-copy"><strong>FoodEdu <span>AI</span></strong><small>教學，一起更有想像</small></span></a>
    <span class="nav-caption">工作空間</span><nav class="side-nav">
      <a href="#" class="nav-link ${active === 'home' ? 'is-active' : ''}" data-action="home"><span class="nav-icon">⌂</span>教學工作台</a>
      <a href="#courses" class="nav-link ${active === 'courses' ? 'is-active' : ''}" data-action="courses"><span class="nav-icon">▤</span>我的課程</a>
    </nav>
    </aside><main class="main-area"><header class="topbar"><div class="mobile-brand"><span class="brand-mark">${icons.logo}</span><strong>FoodEdu <span>AI</span></strong></div><span class="crumb">教學工作台 <span>/</span> ${active === 'home' ? '教學工作台' : active === 'courses' ? '我的課程' : active === 'tool' ? '備課工具箱' : '課程摘要'}</span><div class="top-actions"><span class="status-pill"><i></i> 教學空間</span><div class="teacher-profile"><img class="teacher-avatar" src="/src/assets/avatar.png" alt="劉老師" /><span class="teacher-copy"><strong>劉老師</strong><small>餐飲教育 AI 助手</small></span></div></div></header><div class="page-content">${content}</div><footer class="footer">為每一堂課，留一點新的想像 <span>FOODEDU AI · V1.0</span></footer></main></div>`;
}

function savedContentCard(record) {
  const course = record.course;
  const date = new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.createdAt));
  const types = {
    lessonPlan: { icon: '📘', label: '教案' },
    worksheet: { icon: '📝', label: '學習單' },
    questionBank: { icon: '📚', label: '題庫' },
    practicalLesson: { icon: '🧪', label: '實作教學' },
  };
  const type = types[record.type] ?? { icon: '📄', label: '其他' };
  const openAttribute = record.type === 'lessonPlan' ? 'data-open-saved-plan' : 'data-open-saved-content';
  return `<article class="course-card saved-plan-card"><div class="course-card-top"><span class="course-symbol mint">${type.icon}</span><button class="saved-plan-delete" type="button" data-delete-saved-plan="${escapeHtml(record.id)}" aria-label="刪除 ${escapeHtml(course.courseName)} 第 ${record.version} 版${type.label}">刪除</button></div><button class="saved-plan-open" type="button" ${openAttribute}="${escapeHtml(record.id)}"><span class="saved-plan-type">${type.icon} ${type.label}</span><h3>${escapeHtml(course.courseName)}</h3><p>${escapeHtml(course.topic)} · ${escapeHtml(course.department)}・${escapeHtml(course.year)}</p><span class="saved-plan-version">${type.label}版本 ${record.version}</span></button><div class="course-card-foot"><span>${escapeHtml(date)}</span><span class="card-arrow">${icons.arrow}</span></div></article>`;
}

export function homeView(savedPlans = []) {
  const cards = savedPlans.map(savedContentCard).join('');
  const types = {
    lessonPlan: { icon: '📘', label: '教案' },
    worksheet: { icon: '📝', label: '學習單' },
    questionBank: { icon: '📚', label: '題庫' },
    practicalLesson: { icon: '🧪', label: '實作教學' },
  };
  const recent = [...savedPlans].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)).slice(0, 3);
  const recentItems = recent.length
    ? recent.map((record) => {
      const type = types[record.type] ?? { icon: '📄', label: '其他' };
      const openAttribute = record.type === 'lessonPlan' ? 'data-open-saved-plan' : 'data-open-saved-content';
      return `<button class="recent-item" type="button" ${openAttribute}="${escapeHtml(record.id)}"><span class="recent-item-type">${type.icon} ${type.label}</span><strong>${escapeHtml(record.course?.courseName ?? '未命名課程')}</strong><span class="recent-item-topic">${escapeHtml(record.course?.topic ?? '')}</span>${icons.arrow}</button>`;
    }).join('')
    : '<p class="recent-empty">目前還沒有最近使用的內容。建立課程或使用備課工具後，內容會出現在這裡。</p>';
  const toolLabels = [
    { icon: '📘', label: '教案' },
    { icon: '📝', label: '學習單' },
    { icon: '📚', label: '題庫' },
    { icon: '🧪', label: '實作教學' },
  ];
  const features = featureCards.map((item, index) => `<button class="feature-card" data-feature="${index}" type="button"><span class="feature-icon ${item.tone}">${toolLabels[index].icon}</span><span class="feature-copy"><strong>${toolLabels[index].label}</strong><small>${item.text}</small></span><span class="feature-arrow">${icons.arrow}</span></button>`).join('');
  return shell(`<section class="workbench-heading"><div><div class="eyebrow"><span class="eyebrow-line"></span>2026 教學學期</div><h1>教學工作台</h1><p>快速進入課程與備課工具，接續最近的教學準備。</p></div><button class="button button-primary workbench-create" data-action="create">${icons.plus} 建立新課程</button></section>
    <section class="workbench-overview" aria-label="工作台快速入口"><button class="workbench-course-entry" type="button" data-action="courses"><span class="workbench-entry-icon">📚</span><span class="workbench-entry-copy"><strong>我的課程</strong><small>已保存 ${savedPlans.length} 筆內容</small></span><span class="workbench-entry-arrow">查看課程 ${icons.arrow}</span></button><div class="workbench-toolbox"><div class="workbench-toolbox-heading"><span>🧰</span><div><strong>備課工具箱</strong><small>選擇一項工具開始備課</small></div></div><div class="feature-grid">${features}</div></div></section>
    <section class="workbench-recent"><div class="workbench-section-heading"><div><span class="section-kicker">CONTINUE PREPARING</span><h2>最近使用</h2></div><span>最多顯示 3 筆</span></div><div class="recent-list">${recentItems}</div></section>
    <section class="workbench-quick-start"><div><span class="section-kicker">QUICK START</span><h2>準備一堂新課</h2><p>從課程基本資料開始，逐步完成教學準備。</p></div><button class="button button-primary" data-action="create">${icons.plus} 建立新課程</button></section>
    <section class="section courses-section" id="courses"><div class="section-heading"><div><div class="section-kicker">YOUR CLASSROOM</div><h2>我的課程 <span class="count-pill">${savedPlans.length.toString().padStart(2, '0')}</span></h2></div></div><div class="course-grid">${cards}<button class="new-course-card" data-action="create"><span class="new-course-plus">${icons.plus}</span><strong>規劃一門新課程</strong><small>從你的教學靈感開始</small></button></div></section>`);
}

export function courseFormView() {
  return shell(`<div class="form-page"><button class="back-link" data-action="home">← <span>回到總覽</span></button><div class="form-heading"><div class="eyebrow"><span class="eyebrow-line"></span>NEW COURSE · 01</div><h1>先認識你的<br><span>這一堂課。</span></h1><p>填寫課程資訊，為你的教學準備一個好起點。</p></div><form id="course-form" class="course-form" novalidate>
      <div class="form-section-title"><span class="step-number">01</span><div><strong>課程基本資訊</strong><small>讓我們了解課程的輪廓</small></div></div>
      <div class="form-grid"><label class="field"><span>科系 <b>*</b></span><select name="department" required><option value="" disabled selected>選擇科系</option><option>餐飲管理系</option><option>餐旅管理系</option><option>食品科技系</option><option>烘焙管理系</option><option>觀光餐旅系</option><option>其他餐飲相關科系</option></select></label>
      <label class="field"><span>年級 <b>*</b></span><select name="grade" required><option value="" disabled selected>選擇年級</option><option>一年級</option><option>二年級</option><option>三年級</option><option>四年級</option></select></label>
      <label class="field field-wide"><span>課程名稱 <b>*</b></span><input name="courseName" required maxlength="60" placeholder="例：餐飲服務管理" /></label>
      <label class="field field-wide"><span>課程主題 <b>*</b></span><input name="topic" required maxlength="100" placeholder="例：顧客體驗與服務流程設計" /></label></div>
      <div class="form-section-title section-spaced"><span class="step-number">02</span><div><strong>教學安排</strong><small>提供一些現場資訊，讓內容更貼近需求</small></div></div>
      <div class="form-grid"><label class="field"><span>課程時長 <b>*</b></span><select name="duration" required><option value="30分鐘">30 分鐘</option><option value="50分鐘" selected>50 分鐘</option><option value="90分鐘">90 分鐘</option><option value="120分鐘">120 分鐘</option></select></label>
      <label class="field"><span>學生人數 <b>*</b></span><div class="input-suffix"><input name="students" type="number" required min="1" max="500" placeholder="例：35" /><span>人</span></div></label>
      <label class="field field-wide"><span>教學需求範例（選填）</span><select id="teaching-needs-example"><option value="">選擇教學需求範例</option><option value="__clear__">清除／自訂（清空教學需求）</option><option value="希望結合理論與實際案例，讓學生了解食品標示的重要性，並能辨識食品包裝上的主要標示內容。">範例 1｜食品標示</option><option value="希望透過生活中常見的食品安全案例，引導學生了解食品污染的原因，並學習正確的食品保存與處理方法。">範例 2｜食品安全</option><option value="希望結合日常飲食案例，讓學生了解六大類營養素的功能，並能判斷自己的飲食是否均衡。">範例 3｜營養素</option><option value="希望透過常見食品的實例，讓學生了解食品添加物的用途與安全性，並建立正確的食品添加物觀念。">範例 4｜食品添加物</option><option value="希望介紹食品加工的基本原理，並搭配實際食品案例，讓學生了解加工技術如何影響食品的保存性與品質。">範例 5｜食品加工</option><option value="希望透過生活中的實際案例，讓學生了解食品衛生的重要性，並能說明預防食品中毒的基本方法。">範例 6｜食品衛生</option><option value="希望增加課堂互動與討論，透過問題引導學生思考，並搭配實際案例提升學生的學習興趣與參與度。">範例 7｜互動討論</option><option value="希望結合理論與實務操作，讓學生能將課堂所學應用到實際生活中，並培養分析與解決問題的能力。">範例 8｜理論與實務</option><option value="希望整理本單元的重要觀念與常考內容，搭配實際案例與練習題，幫助學生掌握學習重點。">範例 9｜單元複習</option><option value="希望以生活化、容易理解的方式進行教學，搭配圖片、案例與提問，讓學生能在輕鬆的課堂氣氛中理解課程內容。">範例 10｜生活化教學</option></select><small id="teaching-needs-example-feedback" class="field-hint" role="status">選取範例會帶入下方欄位；欄位已有自訂內容時會先保留原文。</small></label>
      <label class="field field-wide"><span>教學需求 <b>*</b></span><textarea name="needs" required maxlength="600" rows="4" placeholder="描述這堂課希望達成的目標、實作安排或學生學習上的重點⋯"></textarea><small class="field-hint">可以提到學習目標、教學方式或希望學生帶走的能力。</small></label></div>
      <div class="form-bottom"><span><b>*</b> 為必填欄位</span><button class="button button-primary" type="submit">開始建立課程 ${icons.arrow}</button></div><p id="form-error" class="form-error" role="alert"></p>
    </form></div>`, 'courses');
}

const toolInputDefinitions = {
  plan: {
    icon: '📚', eyebrow: 'LESSON PLAN', title: '教案規劃', description: '設定教學主題與課堂條件，整理教師備課時需要的教案輸入資料。',
    fields: `<label class="field"><span>課程名稱</span><input name="courseName" required value="食品安全" /></label><label class="field"><span>教學主題</span><input name="topic" required value="食品標示與食品安全" /></label><label class="field"><span>課程時長</span><select name="duration"><option>30分鐘</option><option selected>50分鐘</option><option>90分鐘</option><option>120分鐘</option></select></label><label class="field"><span>學生程度</span><select name="year"><option>一年級</option><option selected>二至三年級</option><option>四年級</option><option>研究所</option></select></label><label class="field field-wide"><span>教學目標</span><textarea name="objective" rows="2" placeholder="學生完成課程後應能理解或做到什麼？"></textarea></label><label class="field"><span>教學方式</span><select name="method"><option>講授與引導提問</option><option>案例分析</option><option>示範與實作</option><option>分組討論</option></select></label><label class="field"><span>教學需求</span><input name="needs" placeholder="補充課堂重點或限制" /></label>`,
  },
  worksheet: {
    icon: '📝', eyebrow: 'STUDENT WORKSHEET', title: '學生學習單', description: '規劃學生課堂要閱讀、思考與完成的學習活動。',
    fields: `<label class="field"><span>課程名稱</span><input name="courseName" required value="食品安全" /></label><label class="field"><span>學習主題</span><input name="topic" required value="食品標示與食品安全" /></label><label class="field field-wide"><span>學習目標</span><textarea name="objective" rows="2" placeholder="學生透過學習單要練習什麼？"></textarea></label><label class="field"><span>學生程度</span><select name="year"><option>一年級</option><option selected>二至三年級</option><option>四年級</option></select></label><label class="field"><span>題目數量</span><select name="questionCount"><option selected>5</option><option>8</option><option>10</option><option>15</option></select></label><label class="field"><span>教師解答</span><select name="teacherAnswers"><option value="yes" selected>需要教師解答</option><option value="no">不需要教師解答</option></select></label><label class="field"><span>其他需求</span><input name="needs" placeholder="例：加入分組觀察任務" /></label>`,
  },
  quiz: {
    icon: '🧠', eyebrow: 'QUESTION BANK', title: '課程題庫', description: '選擇題型、題數與難度，規劃課堂練習或單元檢核。',
    fields: `<label class="field"><span>課程名稱</span><input name="courseName" required value="食品安全" /></label><label class="field"><span>題目主題</span><input name="topic" required value="食品標示與食品安全" /></label><fieldset class="tool-choice-group field-wide"><legend>題型（可複選）</legend><label><input name="questionTypes" type="checkbox" value="選擇題" checked />選擇題</label><label><input name="questionTypes" type="checkbox" value="是非題" checked />是非題</label><label><input name="questionTypes" type="checkbox" value="填充題" />填充題</label><label><input name="questionTypes" type="checkbox" value="簡答題" />簡答題</label></fieldset><label class="field"><span>題目數量</span><select name="questionCount"><option selected>5</option><option>10</option><option>15</option><option>20</option></select></label><label class="field"><span>難度</span><select name="difficulty"><option selected>基礎</option><option>中等</option><option>進階</option></select></label><label class="field"><span>答案與解析</span><select name="answerMode"><option value="yes" selected>需要答案與解析</option><option value="answers">只需要答案</option><option value="no">不需要</option></select></label><label class="field"><span>其他需求</span><input name="needs" placeholder="例：加入情境判斷題" /></label>`,
  },
  practical: {
    icon: '👨‍🍳', eyebrow: 'PRACTICAL TEACHING', title: '實作教學', description: '整理實作主題、材料設備與安全條件，作為食品實作課程的規劃基礎。',
    fields: `<label class="field"><span>課程名稱</span><input name="courseName" required value="食品安全" /></label><label class="field"><span>實作主題</span><input name="topic" required value="食品衛生與安全" /></label><label class="field"><span>實作時間</span><select name="duration"><option>30分鐘</option><option selected>50分鐘</option><option>90分鐘</option><option>120分鐘</option></select></label><label class="field"><span>學生人數</span><input name="studentCount" type="number" min="1" value="17" required /></label><label class="field field-wide"><span>材料／設備</span><textarea name="materials" rows="2" placeholder="列出主要食材、材料或設備"></textarea></label><label class="field"><span>學習目標</span><input name="objective" placeholder="例：能完成食品安全檢核" /></label><label class="field"><span>安全注意事項</span><input name="safety" placeholder="例：手部衛生與清潔消毒" /></label><label class="field field-wide"><span>其他需求</span><input name="needs" placeholder="補充分組方式或場地條件" /></label>`,
  },
};

export function toolInputView(tool, state = {}) {
  const definition = toolInputDefinitions[tool];
  if (!definition) return homeView();
  return shell(`<section class="tool-input-page"><button class="back-link" data-action="home">← <span>回到總覽</span></button><header class="tool-input-heading"><span class="tool-input-icon">${definition.icon}</span><div><div class="eyebrow"><span class="eyebrow-line"></span>${definition.eyebrow}</div><h1>${definition.title}</h1><p>${definition.description}</p></div></header><form id="tool-input-form" class="tool-input-card"><div class="tool-input-card-heading"><div><span class="section-kicker">INPUT SETTINGS</span><h2>輸入課程條件</h2></div><span class="tool-input-step">01 / 01</span></div><div class="tool-input-grid">${definition.fields}</div><div class="tool-input-footer"><p data-tool-status role="status" aria-live="polite">送出後將依照所選條件產生內容。</p><button class="button button-primary" type="submit" data-generate-tool ${state.status === 'loading' ? 'disabled aria-disabled="true"' : ''}>${definition.icon} ${state.status === 'loading' ? '正在產生…' : `產生${definition.title}`}</button></div></form><div data-tool-result>${toolResultView(tool, state)}</div></section>`, 'tool');
}

export function toolResultView(tool, state = {}) {
  if (state.status === 'loading') return '<p class="tool-result-status" role="status" aria-live="polite">正在呼叫 AI 產生內容…</p>';
  if (state.status === 'error') return `<p class="tool-result-status tool-result-error" role="alert">${escapeHtml(state.error)}</p>`;
  const data = state.data;
  if (state.status !== 'ready' || !data) return '';
  const list = (items) => Array.isArray(items) ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '';
  let content = '';
  if (tool === 'plan') content = `<div class="tool-result-sections">${data.sections.map((section) => `<section><h3>${escapeHtml(section.title)}</h3>${list(section.items)}</section>`).join('')}</div>`;
  if (tool === 'worksheet') {
    const writingSpace = (lines = 2) => `<div class="tool-worksheet-writing-space" aria-hidden="true">${Array.from({ length: lines }, () => '<span></span>').join('')}</div>`;
    const promptValue = (item) => typeof item === 'string' ? item : (item?.prompt ?? item?.question ?? '');
    const options = (item) => Array.isArray(item?.options) ? `<ul class="tool-worksheet-options">${item.options.map((option) => `<li>${escapeHtml(typeof option === 'string' ? option : `${option.label ? `${option.label}. ` : ''}${option.text ?? ''}`)}</li>`).join('')}</ul>` : '';
    const prompts = (items, lines = 2) => Array.isArray(items) ? `<div class="tool-worksheet-prompts">${items.map((item, index) => `<div class="tool-worksheet-prompt"><p><b>${index + 1}.</b> ${escapeHtml(promptValue(item))}</p>${options(item)}${writingSpace(lines)}</div>`).join('')}</div>` : '';
    const studentSections = [
      data.objectives?.length ? `<section><h3>一、今日學習目標</h3>${list(data.objectives)}</section>` : '',
      data.questions?.length ? `<section><h3>二、課前思考</h3>${prompts(data.questions, 2)}</section>` : '',
      data.observations?.length ? `<section><h3>三、實作／案例觀察</h3>${prompts(data.observations, 1)}</section>` : '',
      data.tasks?.length ? `<section><h3>四、課堂任務</h3>${prompts(data.tasks, 2)}</section>` : '',
      data.notePrompts?.length ? `<section><h3>五、課堂重點紀錄</h3>${data.notePrompts.map((item) => `<div class="tool-worksheet-prompt"><p>${escapeHtml(item)}</p>${writingSpace(2)}</div>`).join('')}</section>` : '',
      data.reflections?.length ? `<section><h3>六、課後反思</h3>${prompts(data.reflections, 2)}</section>` : '',
    ].filter(Boolean).join('');
    const teacherAnswers = Array.isArray(data.teacherAnswers) && data.teacherAnswers.length
      ? `<section class="tool-worksheet-teacher-answers${state.teacherAnswers ? '' : ' is-hidden'}"><h3>【教師解答】</h3>${list(data.teacherAnswers)}</section>`
      : '';
    content = `<div class="tool-result-sections tool-worksheet-sections">${studentSections}${teacherAnswers}</div>`;
  }
  if (tool === 'quiz') {
    const groups = [
      { key: 'multipleChoice', title: '選擇題' },
      { key: 'trueFalse', title: '是非題' },
      { key: 'fillIn', title: '填充題' },
      { key: 'shortAnswer', title: '簡答題' },
    ].map((group) => ({ ...group, items: Array.isArray(data.questions?.[group.key]) ? data.questions[group.key] : [] }));
    content = `<div class="tool-result-sections tool-question-bank-screen">${groups.map(({ title, items }) => items.length ? `<section><h3>${title}</h3><ol>${items.map((item) => `<li><b>${escapeHtml(item.prompt)}</b>${Array.isArray(item.options) ? `<ul>${item.options.map((option) => `<li>${escapeHtml(option.label)}. ${escapeHtml(option.text)}</li>`).join('')}</ul>` : ''}${state.showAnswers ? `<p><b>答案／參考答案：</b>${escapeHtml(typeof item.answer === 'boolean' ? (item.answer ? '是' : '非') : (item.answer ?? item.referenceAnswer ?? ''))}</p><p><b>解析：</b>${escapeHtml(item.explanation ?? (item.gradingPoints || []).join('、'))}</p>` : ''}</li>`).join('')}</ol></section>` : '').join('')}</div>`;
    let number = 0;
    const numberedGroups = groups.map((group) => ({
      ...group,
      questions: group.items.map((item) => ({ item, number: ++number })),
    }));
    const renderQuestionOptions = (optionsList) => Array.isArray(optionsList)
      ? `<ol class="tool-bank-options" type="A">${optionsList.map((option) => `<li>${escapeHtml(option.text ?? option.label ?? option)}</li>`).join('')}</ol>`
      : '';
    const renderAnswerSpace = (key) => key === 'multipleChoice'
      ? '<div class="tool-bank-response">作答：________________</div>'
      : key === 'trueFalse'
        ? '<div class="tool-bank-response">作答：□ 是　□ 非</div>'
        : key === 'fillIn'
          ? '<div class="tool-bank-response">作答：________________________________</div>'
          : '<div class="tool-bank-response tool-bank-writing-space"><span></span><span></span><span></span></div>';
    const studentQuestionSections = numberedGroups.map(({ key, title, questions }) => questions.length
      ? `<section class="tool-bank-question-group"><h3>${escapeHtml(title)}</h3>${questions.map(({ item, number: questionNumber }) => `<article class="tool-bank-question"><h4><span>${questionNumber}.</span> ${escapeHtml(item.prompt)}</h4>${key === 'multipleChoice' ? renderQuestionOptions(item.options) : ''}${renderAnswerSpace(key)}</article>`).join('')}</section>`
      : '').join('');
    const teacherAnswers = numberedGroups.flatMap(({ key, title, questions }) => questions.map(({ item, number: questionNumber }) => {
      const answer = typeof item.answer === 'boolean' ? (item.answer ? '是' : '非') : (item.answer ?? item.referenceAnswer ?? '');
      const detail = item.explanation ?? '';
      const grading = Array.isArray(item.gradingPoints) && item.gradingPoints.length
        ? `<p><b>評分重點：</b>${escapeHtml(item.gradingPoints.join('；'))}</p>`
        : '';
      return `<article class="tool-bank-answer"><h4>第 ${questionNumber} 題｜${escapeHtml(title)}</h4><p><b>正確答案／參考答案：</b>${escapeHtml(answer)}</p>${detail ? `<p><b>答案解析：</b>${escapeHtml(detail)}</p>` : ''}${grading}</article>`;
    })).join('');
    const printContent = `<div class="tool-question-bank-print-only"><section class="tool-bank-student-paper"><h3>【學生題本】</h3><div class="tool-bank-meta"><span><b>課程名稱：</b>${escapeHtml(data.courseName)}</span><span><b>題目主題：</b>${escapeHtml(data.topic)}</span></div><div class="tool-bank-student-fields"><span>姓名：________________</span><span>班級／座號：________________</span><span>日期：________________</span></div>${studentQuestionSections}</section><section class="tool-bank-teacher-key"><h3>【教師解答】</h3>${teacherAnswers}</section></div>`;
    content += printContent;
  }
  if (tool === 'practical') {
    content = `<div class="tool-result-sections tool-practical-screen"><section><h3>實作目標</h3>${list(data.objectives)}</section><section><h3>實作前準備</h3><h4>材料</h4>${list(data.preparation.ingredients)}<h4>器具</h4>${list(data.preparation.tools)}<h4>場地／設備</h4>${list(data.preparation.facility)}</section><section><h3>實作流程</h3><ol>${data.steps.map((step) => `<li><b>Step ${step.number}</b><p>學生：${escapeHtml(step.studentAction)}</p><p>教師：${escapeHtml(step.teacherFocus)}</p></li>`).join('')}</ol></section><section><h3>教師示範重點</h3><ul>${data.demonstrations.map((item) => `<li><b>${escapeHtml(item.title)}</b>：${escapeHtml(item.description)}</li>`).join('')}</ul></section><section><h3>常見失敗與處理</h3><ul>${data.failures.map((item) => `<li><b>${escapeHtml(item.problem)}</b>｜${escapeHtml(item.cause)}；處理：${escapeHtml(item.response)}</li>`).join('')}</ul></section><section><h3>巡堂提問</h3>${list(data.questions)}</section><section><h3>學生觀察與完成檢核</h3>${list([...data.observations, ...data.checklist])}</section></div>`;
    const optionalNotes = [data.teacherNotes, data.notes, data.instructorNotes].flatMap((note) => Array.isArray(note) ? note : [note]).filter((note) => typeof note === 'string' && note.trim());
    const safetyItems = [...(data.checklist ?? []), ...(data.observations ?? [])];
    const practicalPrintContent = `<div class="tool-practical-print-only"><section><h3>課程資料</h3><p><b>課程名稱：</b>${escapeHtml(data.courseName)}</p><p><b>實作主題：</b>${escapeHtml(data.topic)}</p><p><b>實作時間：</b>${escapeHtml(data.classTime)}</p><p><b>學生人數：</b>${escapeHtml(data.students)}</p></section><section><h3>材料／設備</h3><h4>材料</h4>${list(data.preparation?.ingredients ?? [])}<h4>器具</h4>${list(data.preparation?.tools ?? [])}<h4>場地／設備</h4>${list(data.preparation?.facility ?? [])}</section><section><h3>學習目標</h3>${list(data.objectives ?? [])}</section><section><h3>實作前準備</h3>${list(data.preparation?.facility ?? [])}</section><section><h3>實作步驟／流程與學生操作事項</h3><ol>${(data.steps ?? []).map((step) => `<li><b>Step ${escapeHtml(step.number)}</b><p><b>學生操作：</b>${escapeHtml(step.studentAction)}</p><p><b>教師提醒：</b>${escapeHtml(step.teacherFocus)}</p></li>`).join('')}</ol></section><section><h3>安全注意事項</h3><p><b>課程需求：</b>${escapeHtml(data.needs ?? '')}</p>${list(safetyItems)}</section><section><h3>教師提醒／備註</h3><ul>${(data.demonstrations ?? []).map((item) => `<li><b>${escapeHtml(item.title)}</b>：${escapeHtml(item.description)}</li>`).join('')}${(data.failures ?? []).map((item) => `<li><b>${escapeHtml(item.problem)}</b>｜可能原因：${escapeHtml(item.cause)}；處理方式：${escapeHtml(item.response)}</li>`).join('')}${optionalNotes.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul></section></div>`;
    content += practicalPrintContent;
  }
  const worksheetMeta = tool === 'worksheet' ? `<div class="tool-worksheet-meta"><span><b>課程名稱：</b>${escapeHtml(data.courseName)}</span><span><b>學習主題：</b>${escapeHtml(data.topic)}</span>${data.grade ? `<span><b>學生程度：</b>${escapeHtml(data.grade)}</span>` : ''}${data.date ? `<span><b>日期：</b>${escapeHtml(data.date)}</span>` : ''}</div><div class="tool-worksheet-student-fields"><span>姓名：____________________</span><span>班級／座號：____________</span><span>日期：____________</span></div>` : '';
  const lessonPlanPrintButton = tool === 'plan' ? '<button class="tool-plan-print-button" type="button" data-print-tool-lesson-plan>🖨️ 列印教案</button>' : '';
  const worksheetPrintButton = tool === 'worksheet' ? '<button class="tool-worksheet-print-button" type="button" data-print-tool-worksheet>🖨️ 列印學習單</button>' : '';
  const questionBankPrintButton = tool === 'quiz' ? '<button class="tool-question-bank-print-button" type="button" data-print-tool-question-bank>🖨️ 列印題庫</button>' : '';
  const practicalPrintButton = tool === 'practical' ? '<button class="tool-practical-print-button" type="button" data-print-tool-practical>🖨️ 列印實作教學</button>' : '';
  const isPrintDocument = tool === 'plan' || tool === 'worksheet' || tool === 'quiz' || tool === 'practical';
  const printId = tool === 'plan' ? 'tool-lesson-plan' : tool === 'worksheet' ? 'tool-worksheet' : tool === 'quiz' ? 'tool-question-bank' : 'tool-practical-lesson';
  return `<article class="tool-result-card${tool === 'plan' ? ' tool-plan-document' : ''}${tool === 'worksheet' ? ' tool-worksheet-document' : ''}${tool === 'quiz' ? ' tool-question-bank-document' : ''}${tool === 'practical' ? ' tool-practical-document' : ''}"${isPrintDocument ? ` id="${printId}"` : ''}><header><div><span class="section-kicker">AI GENERATED · ${escapeHtml(data.courseName)}</span><h2>${escapeHtml(data.title ?? (tool === 'plan' ? '課程教案' : tool === 'quiz' ? '課程題庫' : ''))}</h2><p>${escapeHtml(data.topic)} · ${escapeHtml(data.grade ?? '')} ${data.classTime ? `· ${escapeHtml(data.classTime)}` : ''}</p></div>${lessonPlanPrintButton}${worksheetPrintButton}${questionBankPrintButton}${practicalPrintButton}</header>${worksheetMeta}${content}</article>`;
}

function materialPanel(key, course) {
  const material = sampleMaterials[key];
  const context = `${course.courseName} ${course.topic} ${course.needs}`.toLowerCase();
  const department = `${course.department}`.toLowerCase();
  let demo;

  if (/食品安全|食品衛生|交叉污染|生熟分離|保存溫度|危害控制|衛生管理/.test(context)) {
    demo = { title: '食品安全示範', body: '以「{topic}」檢視人員、器具、食材與環境的衛生風險，練習選擇可查核的預防措施。', items: ['辨認可能的污染途徑與食品危害。', '安排生熟食分區、手部衛生及器具清潔。', '依保存條件記錄時間與溫度。', '發現異常時完成隔離、通報與追蹤。'] };
  } else if (/客訴|顧客|餐桌服務|餐飲服務|服務流程|服務補救|應對技巧|情緒管理|服務管理/.test(context)) {
    demo = { title: '餐飲服務示範', body: '以「{topic}」模擬服務接觸情境，練習理解顧客需求並依流程回應。', items: ['確認顧客需求與事件資訊。', '使用傾聽、複述與同理表達。', '提出符合授權範圍的服務補救。', '追蹤處理結果並整理服務紀錄。'] };
  } else if (/成本控制|餐廳成本|庫存管理|菜單設計|營運管理|餐飲管理|人力配置/.test(context)) {
    demo = { title: '餐飲管理示範', body: '以「{topic}」分析餐飲營運資料，讓管理決策能同時兼顧成本、品質與顧客需求。', items: ['整理食材成本、庫存或銷售資料。', '檢視人力配置與營運流程限制。', '比較菜單或採購調整方案。', '提出可追蹤的營運改善指標。'] };
  } else if (/烘焙|可頌|麵包|蛋糕|西點|發酵|麵糰|麵團/.test(context) || /烘焙/.test(department)) {
    demo = { title: '烘焙實作示範', body: '以「{topic}」示範從麵糰狀態到成品檢核的製程判斷，連結每個操作與品質變化。', items: ['依配方秤量並檢查原料狀態。', '觀察麵糰溫度、筋性與延展性。', '掌握摺疊、整形與發酵狀態。', '記錄烘烤條件並檢查成品色澤與組織。'] };
  } else if (/烹調|熱炒|刀工|湯品|烹飪|炒鍋|火候/.test(context)) {
    demo = { title: '烹調實作示範', body: '以「{topic}」串連備料、火候與調味，示範如何以過程觀察穩定成品質量。', items: ['依成品需求統一刀工與備料規格。', '觀察鍋具預熱並控制火候。', '依食材特性安排下鍋順序與調味。', '檢查熟度、色澤、風味與出餐品質。'] };
  } else {
    demo = { title: '餐飲教學示範', body: '以「{topic}」整理餐飲實作的準備、操作與檢核，讓學生能說明操作依據並回顧成果。', items: ['確認任務目標、材料與工作站。', '依安全衛生要求準備器具與場地。', '按步驟完成操作並記錄關鍵狀態。', '依課程標準檢查成果並提出改善方向。'] };
  }

  const intro = demo.body.replace('{topic}', escapeHtml(course.topic));
  return `<article class="material-card"><div class="material-label"><span>${material.icon}</span>課程專屬示範<span class="mock-label">本地示範內容</span></div><h3>${escapeHtml(demo.title)}</h3><p class="material-intro">${intro}</p><ol>${demo.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol><div class="material-foot"><span>${escapeHtml(course.courseName)} · ${escapeHtml(course.topic)}</span><button type="button" data-action="create">建立另一門課 ${icons.arrow}</button></div></article>`;
}

function escapeHtml(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function lessonPlanPanel(state) {
  const loading = state.status === 'loading';
  let result = '';

  if (loading) {
    result = '<p class="lesson-plan-status" role="status" aria-live="polite">⏳ 正在依據課程主題與教學需求整理教案，請稍候⋯</p>';
  } else if (state.status === 'error') {
    result = `<p class="lesson-plan-status lesson-plan-error" role="alert">${escapeHtml(state.error)}</p>`;
  } else if (state.status === 'ready' && state.plan) {
    const { plan } = state;
    const saveMessage = state.saveError
      ? `<p class="lesson-plan-save-message lesson-plan-save-error" role="status">${escapeHtml(state.saveError)}</p>`
      : state.savedAt
        ? `<p class="lesson-plan-save-message" role="status">✓ 已保存至「我的課程」 · ${escapeHtml(new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(state.savedAt)))}</p>`
        : '';
    result = `${saveMessage}<article class="lesson-plan-result" id="course-lesson-plan" aria-live="polite">
      <div class="lesson-plan-result-head"><div><span class="section-kicker">MOCK AI · 課程專屬草稿</span><h3># ${escapeHtml(plan.title)}</h3></div><span class="mock-label">本地假資料</span></div>
      <div class="lesson-plan-meta"><span>${escapeHtml(plan.courseName)}</span><span>${escapeHtml(plan.topic)}</span><span>${escapeHtml(plan.department)}・${escapeHtml(plan.grade)}</span><span>${escapeHtml(plan.classTime)}</span><span>${escapeHtml(plan.studentCount)} 位學生</span></div>
      <div class="lesson-plan-content">${plan.sections.map((section) => `<section><h4>${escapeHtml(section.title)}</h4><ol>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol></section>`).join('')}</div>
    </article>`;
  }

  return `<section class="lesson-plan-section"><div class="lesson-plan-toolbar"><div><div class="section-kicker">AI LESSON PLAN</div><h2>課程教案</h2><p>依照這門課的主題、年級、人數與教學需求，建立餐飲專業教案草稿。</p></div><div class="lesson-plan-actions"><button class="button button-primary lesson-plan-button" type="button" data-generate-lesson-plan ${loading ? 'disabled aria-disabled="true"' : ''}>✨ ${loading ? '正在產生教案' : 'AI 產生教案'}</button>${state.status === 'ready' && state.plan ? '<button class="lesson-plan-print-button" type="button" data-print-lesson-plan>🖨️ 列印教案</button>' : ''}</div></div>${result}</section>`;
}

function worksheetPanel(state, lessonPlanReady) {
  if (!lessonPlanReady) return '';
  const loading = state.status === 'loading';
  let result = '';

  if (loading) {
    result = '<p class="worksheet-status" role="status" aria-live="polite">正在依照課程資料整理學生學習單…</p>';
  } else if (state.status === 'error') {
    result = `<p class="worksheet-status worksheet-error" role="alert">${escapeHtml(state.error)}</p>`;
  } else if (state.status === 'ready' && state.worksheet) {
    const worksheet = state.worksheet;
    const renderList = (items) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    result = `<article class="worksheet-sheet" id="student-worksheet">
      <header class="worksheet-sheet-header"><div><div class="worksheet-eyebrow">FOODEDU AI · STUDENT WORKSHEET</div><h2># ${escapeHtml(worksheet.title)}</h2><span class="worksheet-theme">${escapeHtml(worksheet.themeLabel)}</span></div><button class="worksheet-print-button" type="button" data-print-worksheet>🖨️ 列印學習單</button></header>
      <div class="worksheet-meta"><div><span>課程名稱</span><strong>${escapeHtml(worksheet.courseName)}</strong></div><div><span>課程主題</span><strong>${escapeHtml(worksheet.topic)}</strong></div><div><span>年級</span><strong>${escapeHtml(worksheet.grade)}</strong></div><div><span>日期</span><strong>${escapeHtml(worksheet.date)}</strong></div></div>
      <div class="worksheet-student-lines"><span>姓名<div></div></span><span>班級／座號<div></div></span><span>組別<div></div></span></div>
      <div class="worksheet-body">
        <section class="worksheet-block"><h3>一、今日學習目標</h3><ul class="worksheet-list">${renderList(worksheet.objectives)}</ul></section>
        <section class="worksheet-block"><h3>二、課前思考</h3><ol class="worksheet-list">${renderList(worksheet.questions)}</ol></section>
        <section class="worksheet-block"><h3>三、課堂重點紀錄</h3><div class="worksheet-note-lines">${worksheet.notePrompts.map((label) => `<div class="worksheet-note-row"><span>${escapeHtml(label)}</span><div class="worksheet-answer-line"></div></div>`).join('')}</div></section>
        <section class="worksheet-block"><h3>四、實作／案例觀察</h3><p class="worksheet-prompt">觀察「${escapeHtml(worksheet.topic)}」的操作或案例，記下看到的證據與疑問。</p><div class="worksheet-observations">${worksheet.observations.map((item) => `<div class="worksheet-observation"><span>${escapeHtml(item)}</span><div class="worksheet-answer-line"></div></div>`).join('')}</div></section>
        <section class="worksheet-block"><h3>五、課堂任務</h3><ol class="worksheet-list worksheet-tasks">${renderList(worksheet.tasks)}</ol></section>
        <section class="worksheet-block"><h3>六、我的實作紀錄</h3><p class="worksheet-prompt">今天我完成了：</p><div class="worksheet-checklist">${worksheet.tasks.map((task, index) => `<div><span class="worksheet-checkbox" aria-hidden="true"></span><span>任務 ${['一', '二', '三'][index]}：${escapeHtml(task)}</span></div>`).join('')}</div><div class="worksheet-response"><span>遇到的問題：</span><div class="worksheet-answer-line"></div><div class="worksheet-answer-line"></div></div><div class="worksheet-response"><span>我是如何解決的：</span><div class="worksheet-answer-line"></div><div class="worksheet-answer-line"></div></div></section>
        <section class="worksheet-block"><h3>七、課後反思</h3><ol class="worksheet-list">${renderList(worksheet.reflections)}</ol><div class="worksheet-reflection-lines"><div class="worksheet-answer-line"></div><div class="worksheet-answer-line"></div></div></section>
      </div><footer class="worksheet-footer">FOODEDU AI <span>餐飲專業學習紀錄</span></footer>
    </article>`;
  }

  return `<section class="worksheet-section"><div class="worksheet-toolbar"><div><div class="section-kicker">STUDENT WORKSHEET</div><h2>學生學習單</h2><p>教案已完成，接著建立可供學生課堂填寫與列印的學習單。</p></div><button class="button button-primary worksheet-generate-button" type="button" data-generate-worksheet ${loading ? 'disabled aria-disabled="true"' : ''}>📝 ${loading ? '正在產生學習單…' : '產生學生學習單'}</button></div>${result}</section>`;
}

function questionBankPanel(state, lessonPlanReady) {
  if (!lessonPlanReady) return '';
  const loading = state.status === 'loading';
  let result = '';

  if (loading) {
    result = '<p class="question-bank-status" role="status" aria-live="polite">正在根據課程資料整理題庫…</p>';
  } else if (state.status === 'error') {
    result = `<p class="question-bank-status question-bank-error" role="alert">${escapeHtml(state.error)}</p>`;
  } else if (state.status === 'ready' && state.bank) {
    const bank = state.bank;
    const answersClass = state.answersVisible ? '' : ' answers-hidden';
    const multipleChoice = bank.questions.multipleChoice.map((question, index) => `<article class="bank-question">
      <h4><span>${index + 1}.</span> ${escapeHtml(question.prompt)}</h4>
      <ul class="question-options">${question.options.map((option) => `<li><span class="option-label">${escapeHtml(option.label)}</span><span>${escapeHtml(option.text)}</span></li>`).join('')}</ul>
      <div class="question-answer"><p><strong>正確答案：${escapeHtml(question.answer)}</strong></p><p><b>答案解析</b>｜${escapeHtml(question.explanation)}</p></div>
    </article>`).join('');
    const trueFalse = bank.questions.trueFalse.map((question, index) => `<article class="bank-question">
      <h4><span>${index + 1}.</span> ${escapeHtml(question.prompt)}</h4>
      <div class="question-answer"><p><strong>正確答案：${question.answer ? '是' : '非'}</strong></p><p><b>答案解析</b>｜${escapeHtml(question.explanation)}</p></div>
    </article>`).join('');
    const shortAnswer = bank.questions.shortAnswer.map((question, index) => `<article class="bank-question">
      <h4><span>${index + 1}.</span> ${escapeHtml(question.prompt)}</h4>
      <div class="question-answer"><p><strong>參考答案</strong>｜${escapeHtml(question.referenceAnswer)}</p><p><b>評分重點</b></p><ul class="scoring-points">${question.scoringPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul></div>
    </article>`).join('');
    result = `<article class="question-bank${answersClass}" id="course-question-bank">
      <header class="question-bank-header"><div><div class="question-bank-eyebrow">FOODEDU AI · TEACHER QUESTION BANK</div><h2>📚 課程題庫</h2></div><div class="question-bank-actions"><button class="teacher-answer-toggle" type="button" data-toggle-answers aria-pressed="${state.answersVisible}">👨‍🏫 教師答案：${state.answersVisible ? '顯示答案' : '隱藏答案'}</button><button class="question-bank-print" type="button" data-print-question-bank>🖨️ 列印題庫</button></div></header>
      <div class="question-bank-meta"><span><b>課程名稱：</b>${escapeHtml(bank.courseName)}</span><span><b>課程主題：</b>${escapeHtml(bank.topic)}</span><span><b>年級：</b>${escapeHtml(bank.grade)}</span></div>
      <p class="question-bank-needs"><b>教學需求焦點：</b>${escapeHtml(bank.needs)}</p>
      <section class="question-group multiple-choice-group"><h3>🟦 選擇題 <span>5 題</span></h3>${multipleChoice}</section>
      <section class="question-group true-false-group"><h3>🟩 是非題 <span>3 題</span></h3>${trueFalse}</section>
      <section class="question-group short-answer-group"><h3>🟨 簡答題 <span>2 題</span></h3>${shortAnswer}</section>
    </article>`;
  }

  return `<section class="question-bank-section"><div class="question-bank-generate-row"><div><div class="section-kicker">TEACHER QUESTION BANK</div><h2>課程題庫</h2><p>依據課程主題與教學需求，整理選擇、是非與簡答題。</p></div><button class="button button-primary question-bank-generate" type="button" data-generate-question-bank ${loading ? 'disabled aria-disabled="true"' : ''}>📚 ${loading ? '正在產生題庫…' : '產生課程題庫'}</button></div>${result}</section>`;
}

function practicalTeachingPanel(state, course) {
  const loading = state.status === 'loading';
  let result = '';

  if (loading) {
    result = '<p class="practical-status" role="status" aria-live="polite">⏳ 正在準備實作教學…</p>';
  } else if (state.status === 'error') {
    result = `<p class="practical-status practical-error" role="alert">${escapeHtml(state.error)}</p>`;
  } else if (state.status === 'ready' && state.guide) {
    const guide = state.guide;
    const renderList = (items) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    result = `<article class="practical-guide" id="practical-teaching-guide">
      <header class="practical-guide-header"><div><div class="practical-eyebrow">FOODEDU AI · ${escapeHtml(guide.category)}</div><h2>👨‍🍳 實作教學助手</h2><p>教師操作指引 · ${escapeHtml(guide.grade)} · ${escapeHtml(guide.students)} 位學生 · ${escapeHtml(guide.classTime)}</p></div><button class="practical-print-button" type="button" data-print-practical-teaching>🖨️ 列印實作教學</button></header>
      <div class="practical-course-meta"><span><b>課程名稱：</b>${escapeHtml(guide.courseName)}</span><span><b>課程主題：</b>${escapeHtml(guide.topic)}</span><span class="practical-needs"><b>教學需求：</b>${escapeHtml(guide.needs)}</span></div>
      <div class="practical-content-grid">
        <section class="practical-block"><h3>① 今日實作目標</h3><ul>${renderList(guide.objectives)}</ul></section>
        <section class="practical-block"><h3>② 實作前準備</h3><div class="practical-prep-grid"><div><h4>食材／情境材料</h4><ul>${renderList(guide.preparation.ingredients)}</ul></div><div><h4>器具</h4><ul>${renderList(guide.preparation.tools)}</ul></div><div><h4>場地／設備</h4><ul>${renderList(guide.preparation.facility)}</ul></div></div></section>
        <section class="practical-block practical-block-wide"><h3>③ 實作流程</h3><ol class="practical-steps">${guide.steps.map((step) => `<li><span class="practical-step-number">Step ${step.number}</span><div><b>學生要做什麼</b><p>${escapeHtml(step.studentAction)}</p><b>教師要注意什麼</b><p>${escapeHtml(step.teacherFocus)}</p></div></li>`).join('')}</ol></section>
        <section class="practical-block"><h3>④ 教師示範重點</h3><div class="practical-demonstrations">${guide.demonstrations.map((item) => `<article><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.description)}</p></article>`).join('')}</div></section>
        <section class="practical-block practical-block-wide"><h3>⑤ 常見失敗與原因</h3><div class="practical-failures">${guide.failures.map((item) => `<article><h4>${escapeHtml(item.problem)}</h4><div><b>可能原因</b><p>${escapeHtml(item.cause)}</p></div><div><b>教師處理方式</b><p>${escapeHtml(item.response)}</p></div></article>`).join('')}</div></section>
        <section class="practical-block"><h3>⑥ 教師巡堂提問</h3><ol class="practical-questions">${renderList(guide.questions)}</ol></section>
        <section class="practical-block"><h3>⑦ 學生觀察重點</h3><ul class="practical-observations">${guide.observations.map((item) => `<li><span aria-hidden="true">□</span>${escapeHtml(item)}</li>`).join('')}</ul></section>
        <section class="practical-block practical-block-wide"><h3>⑧ 實作完成檢核</h3><ul class="practical-checklist">${guide.checklist.map((item) => `<li><span aria-hidden="true">□</span>${escapeHtml(item)}</li>`).join('')}</ul><div class="practical-notes"><b>教師備註</b><span></span><span></span></div></section>
      </div><footer class="practical-guide-footer">FOODEDU AI <span>餐飲專業實作教學指引</span></footer>
    </article>`;
  }

  return `<section class="practical-teaching-section"><div class="practical-toolbar"><div><div class="section-kicker">PRACTICAL TEACHING</div><h2>👨‍🍳 實作教學助手</h2><p>依課程主題整理備料、示範、巡堂與實作檢核指引。</p></div><button class="button button-primary practical-generate-button" type="button" data-generate-practical-teaching ${loading ? 'disabled aria-disabled="true"' : ''}>👨‍🍳 ${loading ? '正在準備實作教學…' : '實作教學助手'}</button></div>${result}</section>`;
}

function rubricPanel(state) {
  const loading = state.status === 'loading';
  let result = '';

  if (loading) {
    result = '<p class="rubric-status" role="status" aria-live="polite">⏳ 正在產生評量表…</p>';
  } else if (state.status === 'error') {
    result = `<p class="rubric-status rubric-error" role="alert">${escapeHtml(state.error)}</p>`;
  } else if (state.status === 'ready' && state.rubric) {
    const rubric = state.rubric;
    const rows = rubric.items.map((item) => `<tr>
      <td data-label="評量項目" class="rubric-criterion">${escapeHtml(item.name)}</td>
      <td data-label="權重" class="rubric-weight">${item.weight}%</td>
      ${rubric.levels.map((level) => `<td data-label="${level.score} ${escapeHtml(level.label)}">${escapeHtml(item.levels[level.score])}</td>`).join('')}
    </tr>`).join('');
    result = `<article class="rubric-document" id="course-rubric">
      <header class="rubric-document-header"><div><div class="rubric-eyebrow">FOODEDU AI · TEACHER ASSESSMENT</div><h2>📊 課程評量 Rubric</h2></div><button class="rubric-print-button" type="button" data-print-rubric>🖨️ 列印評量表</button></header>
      <div class="rubric-course-meta"><span><b>課程名稱：</b>${escapeHtml(rubric.courseName)}</span><span><b>課程主題：</b>${escapeHtml(rubric.topic)}</span><span><b>年級：</b>${escapeHtml(rubric.grade)}</span><span><b>學生人數：</b>${escapeHtml(rubric.students)} 人</span></div>
      <section class="rubric-level-guide"><h3>四級評量標準</h3><div>${rubric.levels.map((level) => `<article><b>${level.score} ${escapeHtml(level.label)}</b><p>${escapeHtml(level.description)}</p></article>`).join('')}</div></section>
      <div class="rubric-table-wrap"><table class="rubric-table"><thead><tr><th scope="col">評量項目</th><th scope="col">權重</th>${rubric.levels.map((level) => `<th scope="col">${level.score} ${escapeHtml(level.label)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody><tfoot><tr><th scope="row" colspan="2">權重總和</th><td colspan="4">${rubric.totalWeight}%</td></tr></tfoot></table></div>
      <section class="rubric-scoring"><h3>🧮 評分方式</h3><p>每個評量項目採 1～4 分，依各項權重計算加權總分（各項得分 ÷ 4 × 權重後加總）。</p><div class="rubric-total-score">總分：<span>____</span> / 100</div><div class="rubric-teacher-comment"><b>教師評語：</b><span></span><span></span></div></section>
      <footer class="rubric-footer">FOODEDU AI <span>課程評量紀錄</span></footer>
    </article>`;
  }

  return `<section class="rubric-section"><div class="rubric-toolbar"><div><div class="section-kicker">COURSE ASSESSMENT</div><h2>評量與 Rubric</h2><p>依課程主題產生教師用評量指標與四級表現描述。</p></div><button class="button button-primary rubric-generate-button" type="button" data-generate-rubric ${loading ? 'disabled aria-disabled="true"' : ''}>📊 ${loading ? '正在產生評量表…' : '產生評量 Rubric'}</button></div>${result}</section>`;
}

export function summaryView(course, selectedTab = 'plan', lessonPlanState = { status: 'idle', plan: null, error: null }, worksheetState = { status: 'idle', worksheet: null, error: null }, questionBankState = { status: 'idle', bank: null, error: null, answersVisible: true }, practicalTeachingState = { status: 'idle', guide: null, error: null }, rubricState = { status: 'idle', rubric: null, error: null }) {
  const tabs = Object.entries(sampleMaterials).map(([key, material]) => `<button class="summary-tab ${selectedTab === key ? 'selected' : ''}" role="tab" aria-selected="${selectedTab === key}" data-tab="${key}" type="button"><span>${material.icon}</span>${material.label}</button>`).join('');
  return shell(`<button class="back-link" data-action="home">← <span>回到總覽</span></button><div class="summary-head"><div><div class="eyebrow"><span class="eyebrow-line"></span>COURSE OVERVIEW · 01</div><h1>${course.courseName}</h1><p>課程已建立。先看看教學素材草稿，再依照你的課堂需要調整。</p></div><span class="draft-status"><i></i>教學素材草稿</span></div>
    <section class="summary-layout"><article class="overview-card"><div class="overview-top"><span class="course-symbol sage">${'🍽️'}</span><div><span class="section-kicker">COURSE SNAPSHOT</span><h2>${course.courseName}</h2></div></div><div class="snapshot-grid"><div><span>科系</span><strong>${course.department}</strong></div><div><span>年級</span><strong>${course.grade}</strong></div><div><span>學生人數</span><strong>${course.students} 人</strong></div><div><span>課程時長</span><strong>${course.classTime}</strong></div><div class="snapshot-wide"><span>課程主題</span><strong>${course.topic}</strong></div><div class="snapshot-wide"><span>教學需求</span><strong class="needs-text">${course.needs}</strong></div></div></article>
    <article class="ai-card"><div class="ai-orbit">✳</div><div class="ai-card-kicker">YOUR TEACHING, YOUR WAY</div><h3>備課有了<br>更清晰的起點。</h3><p>以下內容是依照課程資訊建立的本地示範，作為你規劃教學的靈感草稿。</p><div class="ai-card-tag"><span>✦</span> 本地假資料 · 未連接 AI API</div></article></section>
    ${lessonPlanPanel(lessonPlanState)}
    ${practicalTeachingPanel(practicalTeachingState, course)}
    ${rubricPanel(rubricState)}
    ${worksheetPanel(worksheetState, lessonPlanState.status === 'ready')}
    ${questionBankPanel(questionBankState, lessonPlanState.status === 'ready')}
    <section class="generated-section"><div class="section-heading"><div><div class="section-kicker">CLASSROOM MATERIALS</div><h2>教學素材草稿</h2></div><span class="section-aside">選擇素材，預覽課堂內容</span></div><div class="summary-tabs" role="tablist" aria-label="教學素材">${tabs}</div><div class="material-output" role="tabpanel">${materialPanel(selectedTab, course)}</div></section>`,'summary');
}
