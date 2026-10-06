import { generateAIContent } from './services/aiApiAdapter.js';

export function generateLessonPlan(course, instruction = '請產生大學餐飲系教師可直接使用的完整教案。') {
  return generateAIContent({
    type: 'lessonPlan',
    course,
    instruction,
  });
}
