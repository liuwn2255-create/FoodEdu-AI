const supportedTypes = new Set([
  'lessonPlan',
  'worksheet',
  'questionBank',
  'practicalTeaching',
  'practicalLesson',
  'rubric',
]);
const lessonPlanSectionCount = 9;
const apiTypes = new Set(['lessonPlan', 'worksheet', 'questionBank', 'practicalLesson']);

class AIAdapterError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'AIAdapterError';
    this.code = code;
  }
}

function validateRequest(request) {
  if (!request || typeof request !== 'object') {
    throw new TypeError('AI Adapter request is required.');
  }
  if (!supportedTypes.has(request.type)) {
    throw new TypeError(`Unsupported AI content type: ${String(request.type)}.`);
  }
  if (!request.course || typeof request.course !== 'object') {
    throw new TypeError('AI Adapter course is required.');
  }

  const requiredFields = ['department', 'year', 'courseName', 'topic', 'duration', 'studentCount', 'teachingNeeds'];
  const missingFields = requiredFields.filter((field) => request.course[field] === undefined || request.course[field] === null);
  if (missingFields.length > 0) {
    throw new TypeError(`Course DTO is missing required fields: ${missingFields.join(', ')}.`);
  }
  if (typeof request.instruction !== 'string' || request.instruction.trim() === '') {
    throw new TypeError('AI Adapter instruction is required.');
  }
}

function validateLessonPlan(data) {
  const stringFields = ['title', 'courseName', 'topic', 'department', 'grade', 'classTime'];
  if (!data || typeof data !== 'object' || stringFields.some((field) => typeof data[field] !== 'string' || !data[field].trim())) {
    throw new AIAdapterError('教案服務回傳的資料格式不完整。', 'INVALID_LESSON_PLAN');
  }
  if (typeof data.studentCount !== 'number' || !Number.isFinite(data.studentCount)) {
    throw new AIAdapterError('教案服務回傳的學生人數格式不正確。', 'INVALID_LESSON_PLAN');
  }
  if (!Array.isArray(data.sections) || data.sections.length !== lessonPlanSectionCount) {
    throw new AIAdapterError('教案服務未回傳完整的九個章節。', 'INVALID_LESSON_PLAN_SECTIONS');
  }
  if (data.sections.some((section) => !section || typeof section.title !== 'string' || !section.title.trim()
    || !Array.isArray(section.items) || section.items.some((item) => typeof item !== 'string'))) {
    throw new AIAdapterError('教案章節內容格式不正確。', 'INVALID_LESSON_PLAN_SECTIONS');
  }

  return {
    title: data.title,
    courseName: data.courseName,
    topic: data.topic,
    department: data.department,
    grade: data.grade,
    classTime: data.classTime,
    studentCount: data.studentCount,
    sections: data.sections.map((section) => ({ title: section.title, items: [...section.items] })),
  };
}

function getWorkerEndpoint() {
  const baseUrl = typeof document === 'undefined'
    ? ''
    : document.querySelector('meta[name="foodedu-ai-worker-url"]')?.content.trim();
  if (!baseUrl) {
    throw new AIAdapterError('教案 API 尚未設定 Worker URL。', 'WORKER_URL_MISSING');
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    throw new AIAdapterError('教案 API Worker URL 格式不正確。', 'WORKER_URL_INVALID');
  }
  const isLocalHttp = parsedUrl.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsedUrl.hostname);
  if (parsedUrl.protocol !== 'https:' && !isLocalHttp) {
    throw new AIAdapterError('教案 API Worker URL 必須使用 HTTPS。', 'WORKER_URL_INVALID');
  }
  if (parsedUrl.username || parsedUrl.password || parsedUrl.search || parsedUrl.hash) {
    throw new AIAdapterError('教案 API Worker URL 格式不正確。', 'WORKER_URL_INVALID');
  }
  return new URL('/api/ai', parsedUrl.origin).toString();
}

async function requestLessonPlan(request) {
  const endpoint = getWorkerEndpoint();
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: request.type, course: request.course, instruction: request.instruction }),
    });
  } catch {
    throw new AIAdapterError('無法連線到教案服務，請稍後再試。', 'WORKER_UNAVAILABLE');
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new AIAdapterError('教案服務回傳了無法讀取的資料。', 'WORKER_INVALID_JSON');
  }
  if (!response.ok) {
    throw new AIAdapterError(
      typeof result?.error?.message === 'string' ? result.error.message : '教案服務目前無法完成請求。',
      typeof result?.error?.code === 'string' ? result.error.code : 'WORKER_HTTP_ERROR',
    );
  }
  if (result?.ok !== true || !result.data || typeof result.data !== 'object') {
    throw new AIAdapterError('教案服務未回傳有效教案資料。', 'WORKER_INVALID_RESPONSE');
  }
  return validateLessonPlan(result.data);
}

function requireStrings(value, fields, label) {
  if (!value || fields.some((field) => typeof value[field] !== 'string' || !value[field].trim())) {
    throw new AIAdapterError(`${label}回傳的資料格式不完整。`, 'INVALID_AI_CONTENT');
  }
}

function validateToolOutput(type, data, options = {}) {
  const label = type === 'worksheet' ? '學習單' : type === 'questionBank' ? '題庫' : '實作教學';
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new AIAdapterError(`${label}服務未回傳有效資料。`, 'WORKER_INVALID_RESPONSE');
  const stringArray = (value) => Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.trim());
  if (type === 'worksheet') {
    requireStrings(data, ['title', 'courseName', 'topic', 'grade', 'date', 'themeLabel'], label);
    if (!['objectives', 'questions', 'notePrompts', 'observations', 'tasks', 'reflections'].every((key) => stringArray(data[key])) || !Array.isArray(data.teacherAnswers) || data.teacherAnswers.some((answer) => typeof answer !== 'string')) throw new AIAdapterError('學習單內容格式不完整。', 'INVALID_AI_CONTENT');
    if (data.questions.length !== (Number(options.questionCount) || 5)) throw new AIAdapterError('學習單題數與設定不符。', 'INVALID_AI_CONTENT');
    if (options.teacherAnswers !== false && data.teacherAnswers.length !== data.questions.length) throw new AIAdapterError('學習單教師解答數量不符。', 'INVALID_AI_CONTENT');
  } else if (type === 'questionBank') {
    requireStrings(data, ['title', 'courseName', 'topic', 'grade', 'needs'], label);
    if (!data.questions || !['multipleChoice', 'trueFalse', 'fillIn', 'shortAnswer'].every((key) => Array.isArray(data.questions[key]))) throw new AIAdapterError('題庫題型格式不完整。', 'INVALID_AI_CONTENT');
    const allQuestions = [...data.questions.multipleChoice, ...data.questions.trueFalse, ...data.questions.fillIn, ...data.questions.shortAnswer];
    if (allQuestions.length !== (Number(options.questionCount) || 5)) throw new AIAdapterError('題庫題數與設定不符。', 'INVALID_AI_CONTENT');
    if (data.questions.multipleChoice.some((item) => !item || typeof item.prompt !== 'string' || !Array.isArray(item.options) || item.options.length !== 4 || typeof item.answer !== 'string' || typeof item.explanation !== 'string')) throw new AIAdapterError('選擇題格式不完整。', 'INVALID_AI_CONTENT');
    if (data.questions.trueFalse.some((item) => !item || typeof item.prompt !== 'string' || typeof item.answer !== 'boolean' || typeof item.explanation !== 'string')) throw new AIAdapterError('是非題格式不完整。', 'INVALID_AI_CONTENT');
    if (data.questions.fillIn.some((item) => !item || typeof item.prompt !== 'string' || typeof item.answer !== 'string' || typeof item.explanation !== 'string')) throw new AIAdapterError('填充題格式不完整。', 'INVALID_AI_CONTENT');
    if (data.questions.shortAnswer.some((item) => !item || typeof item.prompt !== 'string' || typeof item.referenceAnswer !== 'string' || !stringArray(item.gradingPoints))) throw new AIAdapterError('簡答題格式不完整。', 'INVALID_AI_CONTENT');
  } else {
    requireStrings(data, ['title', 'category', 'courseName', 'topic', 'grade', 'classTime', 'needs'], label);
    if (!stringArray(data.objectives) || !stringArray(data.questions) || !stringArray(data.observations) || !stringArray(data.checklist)
      || !data.preparation || !['ingredients', 'tools', 'facility'].every((key) => stringArray(data.preparation[key]))
      || !Array.isArray(data.steps) || data.steps.length < 3
      || !Array.isArray(data.demonstrations) || data.demonstrations.length < 3
      || !Array.isArray(data.failures) || data.failures.length < 3) throw new AIAdapterError('實作教學內容格式不完整。', 'INVALID_AI_CONTENT');
  }
  return data;
}

async function requestStructuredContent(request) {
  const endpoint = getWorkerEndpoint();
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: request.type, course: request.course, instruction: request.instruction, options: request.options ?? {} }),
    });
  } catch {
    throw new AIAdapterError('無法連線到 AI 服務，請稍後再試。', 'WORKER_UNAVAILABLE');
  }
  let result;
  try { result = await response.json(); }
  catch { throw new AIAdapterError('AI 服務回傳了無法讀取的資料。', 'WORKER_INVALID_JSON'); }
  if (!response.ok) {
    throw new AIAdapterError(typeof result?.error?.message === 'string' ? result.error.message : 'AI 服務目前無法完成請求。', typeof result?.error?.code === 'string' ? result.error.code : 'WORKER_HTTP_ERROR');
  }
  if (result?.ok !== true || !result.data || typeof result.data !== 'object') throw new AIAdapterError('AI 服務未回傳有效資料。', 'WORKER_INVALID_RESPONSE');
  return validateToolOutput(request.type, result.data, request.options);
}

/**
 * Shared boundary for future backend requests. For now, each feature supplies
 * its existing mock generator so its output contract and mock content remain unchanged.
 * Replace this mock execution with fetch() to a trusted backend when ready.
 */
export function generateAIContent(request, { mockGenerator } = {}) {
  return Promise.resolve().then(async () => {
    validateRequest(request);
    if (request.type === 'lessonPlan') return requestLessonPlan(request);
    if (apiTypes.has(request.type)) return requestStructuredContent(request);
    if (typeof mockGenerator !== 'function') {
      throw new TypeError('AI Adapter mock generator is required in mock mode.');
    }

    try {
      return await mockGenerator({
        type: request.type,
        course: request.course,
        instruction: request.instruction,
        options: request.options,
      });
    } catch (cause) {
      const error = new Error(`AI Adapter execution failed for ${request.type}.`, { cause });
      error.name = 'AIAdapterExecutionError';
      throw error;
    }
  });
}
