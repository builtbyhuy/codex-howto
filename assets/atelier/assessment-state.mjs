// Stored checks are study aids. Rebuild grading from the current course, never storage.
export const DRAFT_KEY='codex-howto-assessment-draft-v1';
export function assessmentItems(mode,lessons,modules){
 return mode==='quick'?modules.map(m=>m.lessons[0]):mode==='deep'?lessons:null;
}
export function bankSignature(lessons){
 const text=JSON.stringify(lessons.map(l=>[l.id,l.quiz.question,l.quiz.options,l.quiz.answer,l.quiz.explanation]));
 let hash=2166136261;
 for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);
 return 'course-2-'+(hash>>>0).toString(36); // Cache freshness marker, not a security signature.
}
export function serializeSession(session,bank){
 return {version:1,bank,mode:session.mode,index:session.index,answers:session.results.map(r=>r.answer),choice:session.choice??null,updated:Date.now()};
}
export function restoreSession(raw,lessons,modules,bank){
 if(!raw)return {session:null,reason:null};
 try{
  if(typeof raw!=='string'||raw.length>65536)throw Error('invalid');
  const d=JSON.parse(raw);
  if(d?.version!==1)throw Error('invalid');
  if(d.bank!==bank)return {session:null,reason:'changed'};
  const items=assessmentItems(d.mode,lessons,modules);
  if(!items||!Number.isInteger(d.index)||d.index<0||d.index>=items.length||!Array.isArray(d.answers)||![d.index,d.index+1].includes(d.answers.length)||!Number.isInteger(d.updated)||d.updated<=0)throw Error('invalid');
  const valid=(a,l)=>Number.isInteger(a)&&a>=-1&&a<l.quiz.options.length;
  if(!d.answers.every((a,i)=>valid(a,items[i]))||(d.choice!==null&&!valid(d.choice,items[d.index])))throw Error('invalid');
  if(d.answers.length===d.index+1&&d.choice!==d.answers.at(-1))throw Error('invalid');
  return {session:{mode:d.mode,items,index:d.index,choice:d.choice,results:d.answers.map((answer,i)=>({l:items[i],answer,correct:answer===items[i].quiz.answer}))},reason:null};
 }catch{return {session:null,reason:'invalid'};}
}
