// Shared browser/server authoring contract. Content is data, never executable HTML.
export const EDITION = 2;
export const PARTS = ['part-a', 'part-b', 'part-c'];
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const text = value => typeof value === 'string' && value.trim().length > 0;
export function validateCourse(input, catalog, diagrams) {
  assert(diagrams?.lessons,'Semantic diagram catalog unavailable');
  if(diagrams){
    assert(diagrams.lessons && Object.keys(diagrams.lessons).length===60,'Expected sixty semantic diagrams');
    input=input.map(m=>({...m,lessons:m.lessons.map(l=>({...l,diagram:diagrams.lessons[l.id]}))}));
  }
  assert(Array.isArray(input) && input.length === 10, 'Expected ten modules');
  assert(catalog?.modules?.length === 10, 'Source catalog unavailable');
  const moduleIds = new Set(), lessonIds = new Set(), sourceKeys = new Set();
  for (const m of input) {
    assert(!moduleIds.has(m.id), 'Duplicate module'); moduleIds.add(m.id);
    const source = catalog.modules.find(s => s.id === m.id);
    assert(source && source.level === m.level && text(m.title) && text(m.description), 'Invalid module '+m.id);
    assert(Array.isArray(m.lessons) && m.lessons.length === source.lessons.length, 'Incomplete module '+m.id);
    assert(m.minutes === m.lessons.reduce((sum,l)=>sum+l.minutes,0), 'Incorrect module time '+m.id);
    for (const [index,l] of m.lessons.entries()) {
      assert(l.id === 's'+m.id+'-'+String(index+1).padStart(2,'0') && !lessonIds.has(l.id), 'Invalid lesson ID'); lessonIds.add(l.id);
      assert(l.sourceKey === source.lessons[index].key && !sourceKeys.has(l.sourceKey), 'Incorrect source coverage '+l.id); sourceKeys.add(l.sourceKey);
      for (const field of ['title','surface','goal','exercise','note']) assert(text(l[field]), 'Missing '+field+' '+l.id);
      for (const [field,min] of [['body',3],['steps',4],['checks',3],['mistakes',2],['sources',1]]) assert(Array.isArray(l[field]) && l[field].length >= min && (field==='sources'||l[field].every(text)), 'Missing '+field+' '+l.id);
      assert(Number.isInteger(l.minutes) && l.minutes > 0, 'Invalid estimate');
      assert(text(l.example?.code) && text(l.example?.label) && text(l.example?.language), 'Missing example '+l.id);
      assert(!l.examples || (Array.isArray(l.examples) && l.examples.every(ex=>text(ex.code)&&text(ex.label)&&text(ex.language))), 'Invalid extra example '+l.id);
      assert(!l.sections || (Array.isArray(l.sections) && l.sections.every(s=>text(s.title)&&Array.isArray(s.paragraphs)&&s.paragraphs.length&&s.paragraphs.every(text))), 'Invalid section '+l.id);
      assert(['equivalent','different','alternative'].includes(l.equivalence?.status) && text(l.equivalence.summary), 'Missing mapping '+l.id);
      if(diagrams)assert(text(l.diagram?.title)&&text(l.diagram?.text)&&text(l.diagram?.source)&&['flow','decision','hierarchy','sequence','comparison','cycle','branch','state'].includes(l.diagram?.kind)&&l.diagram?.asset==='assets/diagrams/'+l.id+'.svg'&&Number.isFinite(l.diagram.width)&&l.diagram.width>0&&Number.isFinite(l.diagram.height)&&l.diagram.height>0,'Invalid semantic diagram '+l.id);
      assert(l.lab,'Missing executable lab '+l.id);
      if(l.lab){assert(text(l.lab.title)&&/^labs\/[a-z0-9-]+$/.test(l.lab.path)&&Array.isArray(l.lab.commands)&&l.lab.commands.length&&l.lab.commands.every(c=>text(c.command)&&text(c.expected))&&Array.isArray(l.lab.files)&&l.lab.files.every(f=>text(f.label)&&/^labs\//.test(f.path)&&!f.path.includes('..'))&&text(l.lab.takeaway),'Invalid lab '+l.id);assert(!l.lab.relatedPaths||(Array.isArray(l.lab.relatedPaths)&&l.lab.relatedPaths.every(p=>/^labs\/[a-z0-9-]+$/.test(p)&&p!==l.lab.path)),'Invalid companion lab '+l.id);}
      assert(l.solution,'Missing reference solution '+l.id);
      if(l.solution)assert(text(l.solution.summary)&&Array.isArray(l.solution.steps)&&l.solution.steps.length&&l.solution.steps.every(text),'Invalid solution '+l.id);
      assert(l.worked,'Missing worked example '+l.id);
      if(l.worked)assert(['title','scenario','code','language','output','explanation'].every(f=>text(l.worked[f])),'Invalid worked example '+l.id);
      assert(l.troubleshooting,'Missing targeted troubleshooting '+l.id);
      if(l.troubleshooting)assert(Array.isArray(l.troubleshooting)&&l.troubleshooting.length>=2&&l.troubleshooting.every(t=>text(t.symptom)&&text(t.cause)&&text(t.fix)),'Invalid troubleshooting '+l.id);
      assert(text(l.quiz?.question) && l.quiz?.options?.length >= 3 && l.quiz.options.every(text) && Number.isInteger(l.quiz.answer) && l.quiz.answer >= 0 && l.quiz.answer < l.quiz.options.length && text(l.quiz.explanation), 'Invalid quiz '+l.id);
      for (const s of l.sources) { const url = new URL(s.url); assert(url.protocol === 'https:' && ['learn.chatgpt.com','developers.openai.com','platform.openai.com'].includes(url.hostname) && text(s.title), 'Invalid official source '+l.id); }
    }
  }
  assert(lessonIds.size === 60, 'Expected sixty unique lessons');
  return catalog.modules.map(s=>input.find(m=>m.id===s.id));
}
export function sanitizeProgress(parsed, lessons) {
  assert(parsed && typeof parsed === 'object' && parsed.lessons && typeof parsed.lessons === 'object' && !Array.isArray(parsed.lessons), 'Invalid progress');
  const byId = new Map(lessons.map(l=>[l.id,l])), clean = {};
  for (const [id,v] of Object.entries(parsed.lessons)) {
    if (!byId.has(id) || !['started','done'].includes(v?.status)) continue;
    clean[id] = {status:v.status,updated:Number.isFinite(v.updated)?v.updated:0};
    if (Number.isInteger(v.answer) && v.answer >= 0 && v.answer < byId.get(id).quiz.options.length) clean[id].answer=v.answer;
  }
  return {lessons:clean,last:byId.has(parsed.last)?parsed.last:null};
}
