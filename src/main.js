import { homeView, courseFormView, summaryView, toolInputView } from './views.js';
import { generateLessonPlan } from './lessonPlanService.js';
import { generateWorksheet } from './worksheetService.js';
import { generateQuestionBank } from './questionBankService.js';
import { generatePracticalTeaching } from './practicalTeachingService.js';
import { generateRubric } from './rubricService.js';
import { deleteSavedLessonPlan, findContent, findSavedLessonPlan, getSavedContents, saveContent, saveLessonPlan } from './lessonPlanStorage.js';

const app = document.querySelector('#app');
let currentCourse = null;
let activeView = 'home';
let activeTool = null;
let activeTab = 'plan';
let lessonPlanState = { status: 'idle', plan: null, error: null };
let worksheetState = { status: 'idle', worksheet: null, error: null };
let questionBankState = { status: 'idle', bank: null, error: null, answersVisible: true };
let practicalTeachingState = { status: 'idle', guide: null, error: null };
let rubricState = { status: 'idle', rubric: null, error: null };
let toolGenerationState = { status: 'idle', data: null, error: null };

function createCourseDTO(values) {
  return {
    department: values.department.trim(),
    year: values.grade.trim(),
    courseName: values.courseName.trim(),
    topic: values.topic.trim(),
    duration: values.duration.trim(),
    studentCount: Number(values.students),
    teachingNeeds: values.needs.trim(),
  };
}

function courseSummaryViewModel(course) {
  return {
    ...course,
    grade: course.year,
    students: String(course.studentCount),
    classTime: course.duration,
    needs: course.teachingNeeds,
  };
}

function render({ scrollToTop = true } = {}) {
  if (activeView === 'form') app.innerHTML = courseFormView();
  else if (activeView === 'tool-form') app.innerHTML = toolInputView(activeTool, toolGenerationState);
  else if (activeView === 'summary' && currentCourse) app.innerHTML = summaryView(courseSummaryViewModel(currentCourse), activeTab, lessonPlanState, worksheetState, questionBankState, practicalTeachingState, rubricState);
  else { activeView = 'home'; app.innerHTML = homeView(getSavedContents()); }
  if (scrollToTop) window.scrollTo(0, 0);
}

function go(view) { activeView = view; render(); }

function persistGeneratedContent(type, course, data, label) {
  try {
    return saveContent(type, course, data);
  } catch (error) {
    const failure = new Error(`${label}已產生，但保存至「我的課程」失敗：${error?.message || '瀏覽器儲存空間目前無法寫入。'}`);
    failure.name = 'ContentSaveError';
    throw failure;
  }
}

app.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]');
  if (action) {
    event.preventDefault();
    if (action.dataset.action === 'create') go('form');
    else if (action.dataset.action === 'home') go('home');
    else if (action.dataset.action === 'courses') {
      go('home');
      requestAnimationFrame(() => document.querySelector('#courses')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }
  const savedPlanDelete = event.target.closest('[data-delete-saved-plan]');
  if (savedPlanDelete) {
    deleteSavedLessonPlan(savedPlanDelete.dataset.deleteSavedPlan);
    render({ scrollToTop: false });
    return;
  }
  const savedPlanOpen = event.target.closest('[data-open-saved-plan]');
  if (savedPlanOpen) {
    openSavedLessonPlan(savedPlanOpen.dataset.openSavedPlan);
    return;
  }
  const savedContentOpen = event.target.closest('[data-open-saved-content]');
  if (savedContentOpen) {
    openSavedContent(savedContentOpen.dataset.openSavedContent);
    return;
  }
  const tab = event.target.closest('[data-tab]');
  if (tab) { activeTab = tab.dataset.tab; render(); }
  const feature = event.target.closest('[data-feature]');
  if (feature) {
    activeTool = ['plan', 'worksheet', 'quiz', 'practical'][Number(feature.dataset.feature)];
    toolGenerationState = { status: 'idle', data: null, error: null };
    go('tool-form');
  }
  if (event.target.closest('[data-generate-lesson-plan]')) void generateCurrentLessonPlan();
  if (event.target.closest('[data-print-lesson-plan]')) printDocument('lesson-plan');
  if (event.target.closest('[data-print-tool-lesson-plan]')) printDocument('tool-lesson-plan');
  if (event.target.closest('[data-print-tool-worksheet]')) printDocument('tool-worksheet');
  if (event.target.closest('[data-print-tool-question-bank]')) printDocument('tool-question-bank');
  if (event.target.closest('[data-print-tool-practical]')) printDocument('tool-practical-lesson');
  if (event.target.closest('[data-generate-worksheet]')) void generateCurrentWorksheet();
  if (event.target.closest('[data-generate-question-bank]')) void generateCurrentQuestionBank();
  if (event.target.closest('[data-generate-practical-teaching]')) void generateCurrentPracticalTeaching();
  if (event.target.closest('[data-generate-rubric]')) void generateCurrentRubric();
  if (event.target.closest('[data-toggle-answers]')) {
    questionBankState = { ...questionBankState, answersVisible: !questionBankState.answersVisible };
    render({ scrollToTop: false });
  }
  if (event.target.closest('[data-print-worksheet]')) printDocument('worksheet');
  if (event.target.closest('[data-print-question-bank]')) printDocument('question-bank');
  if (event.target.closest('[data-print-practical-teaching]')) printDocument('practical-teaching');
  if (event.target.closest('[data-print-rubric]')) printDocument('rubric');
});

function printDocument(target) {
  document.body.dataset.printTarget = target;
  window.print();
}

function openSavedLessonPlan(id) {
  const record = findSavedLessonPlan(id);
  if (!record?.course || !record.lessonPlan) return;
  currentCourse = record.course;
  activeTab = 'plan';
  lessonPlanState = {
    status: 'ready',
    plan: record.lessonPlan,
    error: null,
    savedAt: record.createdAt,
    savedRecordId: record.id,
  };
  worksheetState = { status: 'idle', worksheet: null, error: null };
  questionBankState = { status: 'idle', bank: null, error: null, answersVisible: true };
  practicalTeachingState = { status: 'idle', guide: null, error: null };
  rubricState = { status: 'idle', rubric: null, error: null };
  go('summary');
}

function openSavedContent(id) {
  const record = findContent(id);
  if (!record) return;
  if (record.type === 'lessonPlan') {
    openSavedLessonPlan(id);
    return;
  }
  const toolByType = { worksheet: 'worksheet', questionBank: 'quiz', practicalLesson: 'practical' };
  const tool = toolByType[record.type];
  if (!tool) return;
  currentCourse = record.course;
  activeTool = tool;
  toolGenerationState = {
    status: 'ready',
    data: record.data,
    error: null,
    savedAt: record.createdAt,
    savedRecordId: record.id,
    teacherAnswers: true,
    showAnswers: true,
  };
  go('tool-form');
}

window.addEventListener('afterprint', () => { delete document.body.dataset.printTarget; });

async function generateCurrentLessonPlan() {
  if (!currentCourse || lessonPlanState.status === 'loading') return;
  const requestedCourse = currentCourse;
  lessonPlanState = { status: 'loading', plan: null, error: null };
  render({ scrollToTop: false });

  try {
    const plan = await generateLessonPlan(requestedCourse);
    if (currentCourse !== requestedCourse || activeView !== 'summary') return;
    try {
      const savedRecord = saveLessonPlan(requestedCourse, plan);
      lessonPlanState = { status: 'ready', plan, error: null, savedAt: savedRecord.createdAt, savedRecordId: savedRecord.id };
    } catch {
      lessonPlanState = { status: 'ready', plan, error: null, saveError: '教案已產生，但瀏覽器無法保存至「我的課程」。請確認瀏覽器儲存空間可用。' };
    }
  } catch (error) {
    if (currentCourse !== requestedCourse || activeView !== 'summary') return;
    const errorMessage = error?.name === 'AIAdapterError' && typeof error.message === 'string'
      ? error.message
      : '教案產生時發生問題，請再試一次。';
    lessonPlanState = { status: 'error', plan: null, error: errorMessage };
  }
  render({ scrollToTop: false });
}

async function generateCurrentWorksheet() {
  if (!currentCourse || lessonPlanState.status !== 'ready' || worksheetState.status === 'loading') return;
  const requestedCourse = currentCourse;
  const requestedPlan = lessonPlanState.plan;
  worksheetState = { status: 'loading', worksheet: null, error: null };
  render({ scrollToTop: false });

  try {
    const worksheet = await generateWorksheet(requestedCourse);
    if (currentCourse !== requestedCourse || lessonPlanState.plan !== requestedPlan || activeView !== 'summary') return;
    const savedRecord = persistGeneratedContent('worksheet', requestedCourse, worksheet, '學習單');
    worksheetState = { status: 'ready', worksheet, error: null, savedAt: savedRecord.createdAt, savedRecordId: savedRecord.id };
  } catch (error) {
    if (currentCourse !== requestedCourse || activeView !== 'summary') return;
    worksheetState = { status: 'error', worksheet: null, error: error?.name === 'ContentSaveError' ? error.message : '學習單產生時發生問題，請再試一次。' };
  }
  render({ scrollToTop: false });
}

async function generateCurrentQuestionBank() {
  if (!currentCourse || lessonPlanState.status !== 'ready' || questionBankState.status === 'loading') return;
  const requestedCourse = currentCourse;
  const requestedPlan = lessonPlanState.plan;
  questionBankState = { ...questionBankState, status: 'loading', bank: null, error: null };
  render({ scrollToTop: false });

  try {
    const bank = await generateQuestionBank(requestedCourse);
    if (currentCourse !== requestedCourse || lessonPlanState.plan !== requestedPlan || activeView !== 'summary') return;
    const savedRecord = persistGeneratedContent('questionBank', requestedCourse, bank, '題庫');
    questionBankState = { ...questionBankState, status: 'ready', bank, error: null, savedAt: savedRecord.createdAt, savedRecordId: savedRecord.id };
  } catch (error) {
    if (currentCourse !== requestedCourse || activeView !== 'summary') return;
    questionBankState = { ...questionBankState, status: 'error', bank: null, error: error?.name === 'ContentSaveError' ? error.message : '題庫產生時發生問題，請再試一次。' };
  }
  render({ scrollToTop: false });
}

async function generateCurrentPracticalTeaching() {
  if (!currentCourse || practicalTeachingState.status === 'loading') return;
  const requestedCourse = currentCourse;
  practicalTeachingState = { status: 'loading', guide: null, error: null };
  render({ scrollToTop: false });

  try {
    const guide = await generatePracticalTeaching(requestedCourse);
    if (currentCourse !== requestedCourse || activeView !== 'summary') return;
    const savedRecord = persistGeneratedContent('practicalLesson', requestedCourse, guide, '實作教學');
    practicalTeachingState = { status: 'ready', guide, error: null, savedAt: savedRecord.createdAt, savedRecordId: savedRecord.id };
  } catch (error) {
    if (currentCourse !== requestedCourse || activeView !== 'summary') return;
    practicalTeachingState = { status: 'error', guide: null, error: error?.name === 'ContentSaveError' ? error.message : '實作教學內容產生時發生問題，請再試一次。' };
  }
  render({ scrollToTop: false });
}

async function generateCurrentRubric() {
  if (!currentCourse || rubricState.status === 'loading') return;
  const requestedCourse = currentCourse;
  rubricState = { status: 'loading', rubric: null, error: null };
  render({ scrollToTop: false });

  try {
    const rubric = await generateRubric(requestedCourse);
    if (currentCourse !== requestedCourse || activeView !== 'summary') return;
    rubricState = { status: 'ready', rubric, error: null };
  } catch {
    if (currentCourse !== requestedCourse || activeView !== 'summary') return;
    rubricState = { status: 'error', rubric: null, error: '評量表產生時發生問題，請再試一次。' };
  }
  render({ scrollToTop: false });
}

app.addEventListener('submit', (event) => {
  if (event.target.id === 'tool-input-form') {
    event.preventDefault();
    void generateToolInput(event.target);
    return;
  }
  if (event.target.id !== 'course-form') return;
  event.preventDefault();
  const form = event.target;
  if (!form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form));
  currentCourse = createCourseDTO(values);
  if (Object.values(currentCourse).some((value) => !value)) {
    document.querySelector('#form-error').textContent = '請確認所有必填欄位都已完成。';
    return;
  }
  activeTab = 'plan';
  lessonPlanState = { status: 'idle', plan: null, error: null };
  worksheetState = { status: 'idle', worksheet: null, error: null };
  questionBankState = { status: 'idle', bank: null, error: null, answersVisible: true };
  practicalTeachingState = { status: 'idle', guide: null, error: null };
  rubricState = { status: 'idle', rubric: null, error: null };
  go('summary');
});

async function generateToolInput(form) {
  if (toolGenerationState.status === 'loading' || !activeTool || activeView !== 'tool-form') return;
  if (!form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form));
  const department = '餐飲管理系';
  const year = values.year ?? '二至三年級';
  const studentCount = Number(values.studentCount) || 17;
  const duration = values.duration ?? '50分鐘';
  const courseName = values.courseName.trim();
  const topic = values.topic.trim();
  const requirementParts = [values.needs, values.objective && `學習目標：${values.objective}`, values.method && `教學方式：${values.method}`, values.materials && `材料／設備：${values.materials}`, values.safety && `安全注意事項：${values.safety}`].filter(Boolean);
  const course = { department, year, courseName, topic, duration, studentCount, teachingNeeds: requirementParts.join('；') || `請根據「${topic}」設計適合大學餐飲相關科系的教學內容。` };
  const selectedQuestionTypes = [...form.querySelectorAll('[name="questionTypes"]:checked')].map((input) => input.value);
  if (activeTool === 'quiz' && selectedQuestionTypes.length === 0) {
    form.querySelector('[data-tool-status]').textContent = '請至少選擇一種題型。';
    return;
  }
  const quizQuestionCount = Number(values.questionCount) || 5;
  const perType = selectedQuestionTypes.length ? Math.floor(quizQuestionCount / selectedQuestionTypes.length) : 0;
  const extraQuestions = selectedQuestionTypes.length ? quizQuestionCount % selectedQuestionTypes.length : 0;
  const typeCounts = { multipleChoice: 0, trueFalse: 0, fillIn: 0, shortAnswer: 0 };
  const typeKeys = { 選擇題: 'multipleChoice', 是非題: 'trueFalse', 填充題: 'fillIn', 簡答題: 'shortAnswer' };
  selectedQuestionTypes.forEach((type, index) => { typeCounts[typeKeys[type]] = perType + (index < extraQuestions ? 1 : 0); });
  const options = {
    questionCount: quizQuestionCount,
    teacherAnswers: values.teacherAnswers !== 'no',
    questionTypes: selectedQuestionTypes,
    typeCounts,
    difficulty: values.difficulty,
    answerMode: values.answerMode,
  };
  const instruction = activeTool === 'plan'
    ? `教學目標：${values.objective || '依課程主題訂定可觀察目標'}；學生程度：${year}；教學方式：${values.method}；${values.needs || ''}`
    : activeTool === 'worksheet'
      ? `設計 ${options.questionCount} 個學生可完成的學習問題。${options.teacherAnswers ? '附教師參考解答。' : '不要提供教師解答。'} ${values.objective || ''} ${values.needs || ''}`
      : activeTool === 'quiz'
        ? `產生總數 ${options.questionCount} 題，難度為${options.difficulty}，題型與題數配置：${JSON.stringify(typeCounts)}。答案設定：${values.answerMode}。${values.needs || ''}`
        : `安排 ${duration}、${studentCount} 位學生的食品實作教學。材料設備：${values.materials || '依主題建議'}；學習目標：${values.objective || '依主題訂定'}；安全注意事項：${values.safety || '請提出主題相關安全要求'}；${values.needs || ''}`;

  toolGenerationState = { status: 'loading', data: null, error: null, teacherAnswers: options.teacherAnswers, showAnswers: options.answerMode !== 'no' };
  form.querySelector('[data-generate-tool]').disabled = true;
  form.querySelector('[data-tool-status]').textContent = '正在呼叫 AI 產生內容…';
  const resultContainer = app.querySelector('[data-tool-result]');
  resultContainer.innerHTML = '<p class="tool-result-status" role="status" aria-live="polite">正在呼叫 AI 產生內容…</p>';

  try {
    const data = activeTool === 'plan'
      ? await generateLessonPlan(course, instruction)
      : activeTool === 'worksheet'
        ? await generateWorksheet(course, { ...options, instruction })
        : activeTool === 'quiz'
          ? await generateQuestionBank(course, { ...options, instruction })
          : await generatePracticalTeaching(course, { ...options, instruction });
    if (activeView !== 'tool-form') return;
    let saveWarning = '';
    let savedRecord = null;
    if (activeTool === 'plan') {
      try {
        savedRecord = saveLessonPlan(course, data);
      } catch {
        saveWarning = '教案已產生，但無法保存至「我的課程」。請確認瀏覽器儲存空間可用。';
      }
    } else {
      const typeByTool = { worksheet: 'worksheet', quiz: 'questionBank', practical: 'practicalLesson' };
      const labelByTool = { worksheet: '學習單', quiz: '題庫', practical: '實作教學' };
      const type = typeByTool[activeTool];
      if (type) savedRecord = persistGeneratedContent(type, course, data, labelByTool[activeTool]);
    }
    toolGenerationState = {
      ...toolGenerationState,
      status: 'ready',
      data,
      error: null,
      ...(savedRecord ? { savedAt: savedRecord.createdAt, savedRecordId: savedRecord.id } : {}),
      ...(saveWarning ? { saveWarning } : {}),
    };
    render({ scrollToTop: false });
    if (saveWarning) app.querySelector('[data-tool-status]').textContent = saveWarning;
    return;
  } catch (error) {
    if (activeView !== 'tool-form') return;
    toolGenerationState = { ...toolGenerationState, status: 'error', data: null, error: error?.message || 'AI 產生失敗，請稍後再試。' };
  }
  render({ scrollToTop: false });
}

app.addEventListener('change', (event) => {
  if (event.target.id !== 'teaching-needs-example') return;
  const exampleSelect = event.target;
  const teachingNeedsField = app.querySelector('#course-form [name="needs"]');
  const feedback = app.querySelector('#teaching-needs-example-feedback');
  if (!teachingNeedsField) return;

  if (exampleSelect.value === '__clear__') {
    teachingNeedsField.value = '';
    exampleSelect.value = '';
    delete exampleSelect.dataset.appliedValue;
    if (feedback) feedback.textContent = '已清空教學需求，請輸入自訂內容或選擇範例。';
    return;
  }
  if (!exampleSelect.value) return;

  const previousExample = exampleSelect.dataset.appliedValue;
  const currentText = teachingNeedsField.value.trim();
  if (!currentText || currentText === previousExample) {
    teachingNeedsField.value = exampleSelect.value;
    exampleSelect.dataset.appliedValue = exampleSelect.value;
    if (feedback) feedback.textContent = '範例已帶入；你可以直接修改教學需求內容。';
  } else {
    exampleSelect.value = '';
    if (feedback) feedback.textContent = '欄位已有自訂內容，已保留原文。若要套用範例，請先選擇「清除／自訂」。';
  }
});

render();
