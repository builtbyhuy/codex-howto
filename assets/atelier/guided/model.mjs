import {getActivity} from './activities.mjs';

const clone = value => JSON.parse(JSON.stringify(value));
const hasText = value => typeof value === 'string' && value.trim().length > 0;

/** Present canonical lessons in guided stages without modifying their content or progress. */
export function getGuidedLesson(lesson, module) {
  if (!lesson || !module || !/^\d{2}$/.test(module.id) || !new RegExp('^s' + module.id + '-\\d{2}$').test(lesson.id)) {
    throw new TypeError('A canonical lesson and its matching module are required.');
  }
  if (!hasText(lesson.goal) || !hasText(lesson.exercise) || !Array.isArray(lesson.steps) || !Array.isArray(lesson.checks) || !lesson.quiz) {
    throw new TypeError('The lesson is missing its source goal, practice or checks.');
  }
  if (!/^labs\/[a-z0-9-]+$/.test(lesson.lab?.path)) throw new TypeError('The lesson needs its canonical practice path.');
  const activity = getActivity(module.id);
  if (!activity) throw new RangeError('No module practice exists for ' + module.id);
  return {
    lessonId: lesson.id,
    title: lesson.title,
    moduleId: module.id,
    summary: lesson.goal,
    sourceKey: lesson.sourceKey,
    readingUrl: 'assets/reading/' + lesson.id + '.html',
    practiceUrl: lesson.lab.path + '/README.md',
    stages: [
      {
        id: 'understand', title: 'Understand the outcome', instruction: lesson.goal,
        focus: [lesson.body?.[0], lesson.note].filter(hasText)
      },
      {
        id: 'inspect', title: 'Inspect the source',
        instruction: 'Follow the lesson evidence before making a decision. ' + (lesson.lab.takeaway || ''),
        focus: lesson.steps.slice(0, 2)
      },
      {
        id: 'try', title: 'Try one bounded task', instruction: lesson.exercise,
        focus: [...lesson.steps.slice(2), 'The interactive exercise below is shared module practice. The linked lab contains this lesson’s specific hands-on task.']
      },
      {
        id: 'check', title: 'Check your evidence',
        instruction: 'Compare your own attempt with these lesson criteria. A browser answer does not establish native execution or practical mastery.',
        focus: [...lesson.checks, lesson.quiz.question]
      }
    ],
    activity,
    lessonQuiz: clone(lesson.quiz),
    reference: {worked: clone(lesson.worked), solution: clone(lesson.solution)},
    troubleshooting: clone(lesson.troubleshooting || []),
    sources: clone(lesson.sources || [])
  };
}
