'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const root = path.resolve(__dirname, '..');
const api = Promise.all([
  import(pathToFileURL(path.join(root, 'assets/atelier/guided/activities.mjs'))),
  import(pathToFileURL(path.join(root, 'assets/atelier/guided/model.mjs')))
]);
// Independent expectations from the original source files, not the reveal API.
const correct = {
  'orbit-evidence': {'note-ids':'n1, n2, n3, n4', package:'absent', deployment:'unknown'},
  'instruction-scope': {chain:'root-override',heading:'short','without-override':'ordinary',observation:'observed'},
  'skill-boundaries': {credentials:'workflow-only',injection:'data',execution:'inspected','missing-config':'unknown'},
  'delegation-contract': {owner:'normalize',integration:'both-evidence',report:'4, 2, 55',isolation:'no'},
  'mcp-record': {record:'T-101',owner:'Ari',minutes:'20',method:'call',native:'local-only'},
  'hook-policy': {generated:'deny',lookalike:'allow','exit-zero':'response',irrelevant:'outside'},
  'plugin-release': {version:'0.3.0',findings:'two',distribution:'separate',paths:'no'},
  'targeted-recovery': {recovery:'heading',preserve:'both',draft:'status',chat:'unchanged'},
  'bounded-plan': {approach:'allowlist',acceptance:'preserve',schedule:'prepared',external:'no'},
  'cli-acceptance': {artifact:'a','check-command':'node --test checks.cjs',producer:'reject',completion:'artifact'}
};

test('all ten activities accept source-correct attempts and reject each independently wrong answer', async () => {
  const [{getActivity, evaluateActivity, activityIds}] = await api;
  assert.equal(activityIds.length, 10);
  assert.deepEqual(new Set(activityIds), new Set(Object.keys(correct)));
  for (let number = 1; number <= 10; number++) {
    const activity = getActivity(String(number).padStart(2, '0'));
    assert.equal(activity.isModulePractice, true);
    assert.deepEqual(activity.states, ['inspect','attempt','compare']);
    assert.equal(evaluateActivity(activity.id, correct[activity.id]).passed, true, activity.id);
    for (const question of activity.questions) {
      const wrong = {...correct[activity.id], [question.id]: '__unsupported__'};
      const result = evaluateActivity(activity.id, wrong);
      assert.equal(result.passed, false, activity.id + '/' + question.id);
      assert.equal(result.items.filter(item => !item.passed).length, 1);
      assert.equal(result.items.find(item => item.id === question.id).passed, false);
    }
  }
});

test('blank, malformed, inherited and oversized attempts cannot pass', async () => {
  const [{evaluateActivity, activityIds}] = await api;
  for (const id of activityIds) {
    for (const attempt of [null, undefined, [], 'passed', {}, Object.create(correct[id])]) {
      const result = evaluateActivity(id, attempt);
      assert.equal(result.passed, false, id);
      assert.equal(result.items.every(item => !item.passed), true, id);
    }
    const oversized = Object.fromEntries(Object.keys(correct[id]).map(key => [key, 'x'.repeat(2001)]));
    assert.equal(evaluateActivity(id, oversized).items.every(item => !item.passed), true);
  }
});

test('bounded text comparisons tolerate case and spacing but reject missing, duplicated or invented facts', async () => {
  const [{evaluateActivity}] = await api;
  const orbit = {...correct['orbit-evidence'], 'note-ids':'N4; n3 n2, n1'};
  assert.equal(evaluateActivity('orbit-evidence', orbit).passed, true);
  for (const value of ['n1,n2,n3', 'n1,n2,n3,n4,n5', 'n1,n2,n3,n3', 'n1,n2,n3,n4<script>']) {
    assert.equal(evaluateActivity('orbit-evidence', {...orbit, 'note-ids':value}).passed, false);
  }
  assert.equal(evaluateActivity('mcp-record', {...correct['mcp-record'],owner:'  ARI  '}).passed, true);
  assert.equal(evaluateActivity('delegation-contract', {...correct['delegation-contract'],report:'4 2 55'}).passed, true);
  for (const report of ['4,55,2','4,2,55,0','4,2,-55','4,2,55.1']) {
    assert.equal(evaluateActivity('delegation-contract', {...correct['delegation-contract'],report}).passed, false);
  }
  assert.equal(evaluateActivity('cli-acceptance', {...correct['cli-acceptance'],'check-command':'npm test'}).passed, false);
  assert.equal(evaluateActivity('cli-acceptance', {...correct['cli-acceptance'],'check-command':'node --test CHECKS.CJS'}).passed, false);
});

test('embedded full files equal the original sources and same-origin links point to real files', async () => {
  const [{getActivity}] = await api;
  let exactFiles = 0;
  for (let number = 1; number <= 10; number++) {
    const activity = getActivity(number);
    for (const file of activity.files) {
      assert.match(file.path, /^(labs|content)\/[a-zA-Z0-9_./-]+$/);
      assert.equal(file.path.includes('..'), false);
      const source = fs.readFileSync(path.join(root, file.path), 'utf8');
      if (!file.excerpt) {
        assert.equal(file.content, source, file.path);
        exactFiles++;
      } else {
        assert.equal(source.includes(file.content), true, file.path);
      }
    }
  }
  assert.ok(exactFiles >= 29);
});

test('all sixty canonical lessons retain specific goals, tasks, checks and quiz semantics in four stages', async () => {
  const [, {getGuidedLesson}] = await api;
  const modules = ['a','b','c'].flatMap(part => JSON.parse(fs.readFileSync(path.join(root, 'content/part-' + part + '.json'), 'utf8')));
  let total = 0;
  for (const module of modules) {
    for (const lesson of module.lessons) {
      const before = JSON.stringify({lesson,module});
      const guided = getGuidedLesson(lesson,module);
      assert.equal(guided.lessonId,lesson.id);
      assert.equal(guided.moduleId,module.id);
      assert.equal(guided.sourceKey,lesson.sourceKey);
      assert.deepEqual(guided.stages.map(stage => stage.id),['understand','inspect','try','check']);
      assert.equal(guided.stages[0].instruction,lesson.goal);
      assert.equal(guided.stages[2].instruction,lesson.exercise);
      assert.deepEqual(guided.stages[3].focus.slice(0,lesson.checks.length),lesson.checks);
      assert.deepEqual(guided.lessonQuiz,lesson.quiz);
      assert.equal(guided.activity.moduleId,module.id);
      for (const url of [guided.readingUrl,guided.practiceUrl]) {
        assert.equal(url.includes('://'),false);
        assert.equal(fs.existsSync(path.join(root,url)),true,url);
      }
      assert.equal(JSON.stringify({lesson,module}),before);
      total++;
    }
  }
  assert.equal(total,60);
});

test('public activities have no checker fields and cannot mutate later calls or revealed references', async () => {
  const [{getActivity,getActivityReference,evaluateActivity}] = await api;
  const first = getActivity('01');
  for (const question of first.questions) {
    for (const privateField of ['answer','expected','correct','rule','tokens','numbers']) assert.equal(Object.hasOwn(question,privateField),false);
  }
  first.questions[0].label = 'modified';
  first.files[0].content = 'modified';
  assert.notEqual(getActivity('01').questions[0].label,'modified');
  assert.notEqual(getActivity('01').files[0].content,'modified');
  const reference = getActivityReference('orbit-evidence');
  reference.answers[0].value = 'n5';
  assert.equal(evaluateActivity('orbit-evidence',correct['orbit-evidence']).passed,true);
  assert.notEqual(getActivityReference('orbit-evidence').answers[0].value,'n5');
  assert.equal(getActivity('99'),null);
  assert.throws(() => evaluateActivity('unknown',{}),RangeError);
  assert.throws(() => getActivityReference('unknown'),RangeError);
});
