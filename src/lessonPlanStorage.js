export const SAVED_LESSON_PLANS_KEY = 'foodedu-ai-saved-lesson-plans-v1';

function readRecords() {
  try {
    const value = localStorage.getItem(SAVED_LESSON_PLANS_KEY);
    if (!value) return [];
    const records = JSON.parse(value);
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

const CONTENT_TYPES = new Set(['lessonPlan', 'worksheet', 'questionBank', 'practicalLesson']);

function normalizeRecord(record) {
  if (!record || typeof record !== 'object' || !record.course) return null;
  // Legacy lesson-plan entries keep their original shape in localStorage.
  if (!record.type && record.lessonPlan) {
    return { ...record, type: 'lessonPlan', data: record.lessonPlan };
  }
  if (!CONTENT_TYPES.has(record.type) || !('data' in record)) return null;
  return record;
}

function sameCourse(left, right) {
  return ['department', 'year', 'courseName', 'topic'].every((field) => left[field] === right[field]);
}

function createId() {
  return globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getSavedLessonPlans() {
  return readContents().sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

export function getSavedContents() {
  return getSavedLessonPlans();
}

export function readContents() {
  return readRecords().map(normalizeRecord).filter(Boolean);
}

export function findContent(id) {
  const record = readRecords().find((item) => item.id === id);
  return record ? normalizeRecord(record) : null;
}

export function saveContent(type, course, data) {
  if (!CONTENT_TYPES.has(type)) throw new TypeError(`Unsupported saved content type: ${type}`);
  if (!course || !data || typeof data !== 'object') throw new TypeError('Course and content data are required.');
  const records = readRecords();
  const version = records
    .map(normalizeRecord)
    .filter((record) => record?.type === type && record.course && sameCourse(record.course, course))
    .reduce((highest, record) => Math.max(highest, Number(record.version) || 0), 0) + 1;
  const record = {
    id: createId(),
    type,
    course: {
      department: course.department,
      year: course.year,
      courseName: course.courseName,
      topic: course.topic,
      duration: course.duration,
      studentCount: course.studentCount,
      teachingNeeds: course.teachingNeeds,
    },
    data,
    version,
    createdAt: new Date().toISOString(),
  };
  // Preserve legacy records byte-for-byte in shape; new records use the common DTO.
  localStorage.setItem(SAVED_LESSON_PLANS_KEY, JSON.stringify([record, ...records]));
  return record;
}

export function saveLessonPlan(course, lessonPlan) {
  const records = readRecords();
  const version = records
    .filter((record) => normalizeRecord(record)?.type === 'lessonPlan' && record.course && sameCourse(record.course, course))
    .reduce((highest, record) => Math.max(highest, Number(record.version) || 0), 0) + 1;
  const record = {
    id: createId(),
    course: {
      department: course.department,
      year: course.year,
      courseName: course.courseName,
      topic: course.topic,
      duration: course.duration,
      studentCount: course.studentCount,
      teachingNeeds: course.teachingNeeds,
    },
    lessonPlan,
    version,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(SAVED_LESSON_PLANS_KEY, JSON.stringify([record, ...records]));
  return record;
}

export function deleteSavedLessonPlan(id) {
  const records = readRecords();
  const remaining = records.filter((record) => record.id !== id);
  localStorage.setItem(SAVED_LESSON_PLANS_KEY, JSON.stringify(remaining));
  return remaining.length !== records.length;
}

export function deleteContent(id) {
  return deleteSavedLessonPlan(id);
}

export function findSavedLessonPlan(id) {
  const record = findContent(id);
  return record?.type === 'lessonPlan'
    ? { ...record, lessonPlan: record.data }
    : null;
}
