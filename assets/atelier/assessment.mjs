import {DRAFT_KEY,assessmentItems,bankSignature,serializeSession,restoreSession} from './assessment-state.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inline=v=>esc(v).replace(/`([^`]+)`/g,'<code>$1</code>');
export function mountAssessment({lessons,modules,showDialog}){
 const body=document.querySelector('#assessment-body'),dialog=document.querySelector('#assessment-dialog');
 const planKey='codex-howto-assessment-v1',knownIds=new Set(lessons.map(l=>l.id)),bank=bankSignature(lessons);
 let session=null,savedPlan=null,draftStored=false,restoreReason=null,pausedDraft=null,keyboardInput=false;
 body.addEventListener('keydown',()=>{keyboardInput=true;},true);
 body.addEventListener('pointerdown',()=>{keyboardInput=false;},true);
 try{
  const p=JSON.parse(localStorage.getItem(planKey));
  if(p?.version===1&&['quick','deep'].includes(p.mode)&&p.total===(p.mode==='quick'?10:60)&&Array.isArray(p.gaps)&&p.gaps.length<=p.total&&new Set(p.gaps).size===p.gaps.length&&p.gaps.every(id=>knownIds.has(id))&&typeof p.date==='string'&&Number.isFinite(Date.parse(p.date)))savedPlan=p;
 }catch{}
 try{const restored=restoreSession(localStorage.getItem(DRAFT_KEY),lessons,modules,bank);pausedDraft=restored.session;restoreReason=restored.reason;draftStored=!!pausedDraft;}catch{restoreReason='unavailable';}
 const draftMessage=()=>draftStored?'Your place and selected answer are saved in this browser. You can close this check or reload and resume.':'Browser storage is unavailable. You can pause in this page, but reloading may lose this unfinished check.';
 function saveDraft(){
  pausedDraft=session;
  try{localStorage.setItem(DRAFT_KEY,JSON.stringify(serializeSession(session,bank)));draftStored=true;}catch{draftStored=false;}
  const note=body.querySelector('#assessment-save-state');if(note&&note.textContent!==draftMessage())note.textContent=draftMessage();
 }
 function removeDraft(){try{localStorage.removeItem(DRAFT_KEY);pausedDraft=null;restoreReason=null;return true;}catch{return false;}}
 function planMarkup(p){const ids=new Set(p.gaps);return `<div class="assessment-review">${modules.filter(m=>m.lessons.some(l=>ids.has(l.id))).map(m=>`<section><h3>${esc(m.title)}</h3>${m.lessons.filter(l=>ids.has(l.id)).map(l=>`<a href="#lesson/${l.id}?part=quiz">${esc(l.title)} →</a>`).join('')}</section>`).join('')}</div>`;}
 function choose(){
  session=null;
  const resume=pausedDraft?`<section class="assessment-resume" aria-label="Unfinished knowledge check"><span class="eyebrow">Continue where you paused</span><h3>${pausedDraft.mode==='quick'?'Quick':'Full'} check · Question ${pausedDraft.index+1} / ${pausedDraft.items.length}</h3><p>${pausedDraft.results.length} answers checked. Course completion is unchanged.</p><div class="dialog-actions"><button class="button button-solid" data-assess-resume>Resume ${pausedDraft.mode==='quick'?'quick':'full'} check →</button><button class="button" data-assess-discard>Discard unfinished check</button></div><p id="draft-remove-status" role="status"></p></section>`:'';
  const warning=restoreReason&&restoreReason!=='unavailable'?`<p class="notice">${restoreReason==='changed'?'The course questions have changed. Start a new check so grading uses the current questions.':'The saved unfinished check could not be read. Start a new check.'} Your course progress and completed revision plan were kept.</p>`:'';
  body.innerHTML=`<span class="eyebrow">Find your starting point</span><h2 id="assessment-title" tabindex="-1">What should you learn next?</h2><p>Use real scenarios to find gaps. These checks use the course question bank and never mark lessons complete.</p>${resume}${warning}${savedPlan?'<button class="button saved-plan-button" data-assess-saved>Open my saved revision plan →</button>':''}<div class="assessment-modes"><button class="assessment-mode" data-assess-mode="quick"><strong>Quick check <span>10 questions</span></strong><p>One question per module. A short route into the course.</p></button><button class="assessment-mode" data-assess-mode="deep"><strong>Full check <span>60 questions</span></strong><p>Every lesson’s question, grouped into a revision plan.</p></button></div><p class="fine-print">${pausedDraft?'Starting a new check replaces the unfinished check. ':''}Unfinished checks and completed revision plans are saved separately from course progress in this browser when storage is available. This is a learning aid, not certification or proof of practical skill.</p>`;
  if(dialog.open)body.querySelector('h2').focus();
 }
 function showSaved(){
  body.innerHTML=`<span class="eyebrow">Your saved revision plan</span><h2 id="assessment-title" tabindex="-1">Return to your practice</h2><p>${savedPlan.mode==='quick'?'Quick':'Full'} check · ${esc(new Date(savedPlan.date).toLocaleDateString('en-GB'))}. ${savedPlan.gaps.length?`${savedPlan.gaps.length} topics to revisit from that check.`:'No gaps recorded in that check. Try a practice project.'} This is a historical study aid, not a current measure of skill. Your course progress is unchanged.</p>${planMarkup(savedPlan)}<div class="dialog-actions"><a class="button button-solid" href="${savedPlan.gaps.length?'#lesson/'+savedPlan.gaps[0]:'#labs'}">${savedPlan.gaps.length?'Continue revision':'Try a practice project'}</a><button class="button" data-assess-restart>Choose another check</button><button class="button" data-assess-forget>Forget this plan</button></div><p id="plan-storage-status" role="status"></p>`;
  body.querySelector('h2').focus();
 }
 function feedback(focus=true){
  const r=session.results[session.index];
  body.querySelectorAll('#knowledge-assessment input,#knowledge-assessment button').forEach(x=>x.disabled=true);
  body.querySelector('#assessment-feedback').innerHTML=`<strong>${r.correct?'That’s right.':'A useful gap to revisit.'}</strong><p>${inline(r.l.quiz.explanation)}</p><button class="button button-solid" data-assess-next>${session.index+1===session.items.length?'See my revision plan':'Next question →'}</button>`;
  // Pointer grading grows feedback below the question without scrolling it away.
  // Keyboard grading intentionally follows focus to the next available action.
  if(focus&&keyboardInput)body.querySelector('[data-assess-next]').focus();
 }
 function question(){
  const l=session.items[session.index],n=session.index+1;
  body.innerHTML=`<div class="assessment-status"><span>${session.mode==='quick'?'Quick':'Full'} check</span><span>Question ${n} / ${session.items.length}</span></div><progress value="${session.index}" max="${session.items.length}" aria-label="Assessment progress"></progress><h2 id="assessment-title" tabindex="-1">${esc(modules.find(m=>m.lessons.includes(l)).title)}</h2><form id="knowledge-assessment"><fieldset><legend>${inline(l.quiz.question)}</legend>${[...l.quiz.options,'I’m not sure yet'].map((o,i)=>{const value=i===l.quiz.options.length?-1:i;return `<label class="quiz-option"><input type="radio" name="knowledge-answer" value="${value}" required ${session.choice===value?'checked':''}><span>${inline(o)}</span></label>`;}).join('')}</fieldset><button class="button button-solid" type="submit">Check and continue</button></form><div id="assessment-feedback" role="status"></div><p class="fine-print" id="assessment-save-state" role="status">${draftMessage()}</p><button class="button" data-assess-pause>Pause check</button>`;
  if(session.results.length===n)feedback(false);
  body.querySelector('h2').focus();
 }
 function result(){
  const wrong=session.results.filter(r=>!r.correct);
  savedPlan={version:1,mode:session.mode,total:session.items.length,gaps:wrong.map(r=>r.l.id),date:new Date().toISOString()};
  let stored=false;try{localStorage.setItem(planKey,JSON.stringify(savedPlan));stored=true;}catch{}
  const cleared=removeDraft();pausedDraft=null;
  body.innerHTML=`<span class="eyebrow">Your revision plan</span><h2 id="assessment-title" tabindex="-1">${session.items.length-wrong.length} of ${session.items.length} correct</h2><p>${wrong.length?'Begin with the first gap, then work through the topics below.':'You answered this set correctly. Put the knowledge into practice with the labs.'} Your course progress is unchanged.</p><p class="plan-save-status" role="status">${stored?'Plan saved in this browser. Reopen the starting-point check to find it after visiting a lesson or reloading.':'Storage is unavailable. This plan remains available only while this page stays open.'}${cleared?'':' The older unfinished check could not be removed because browser storage is unavailable.'}</p>${planMarkup(savedPlan)}<div class="dialog-actions"><a class="button button-solid" href="${wrong.length?'#lesson/'+wrong[0].l.id:'#labs'}">${wrong.length?'Start with my first gap':'Try a practice project'}</a><button class="button" data-assess-restart>Choose another check</button></div>`;
  session=null;body.querySelector('h2').focus();
 }
 body.addEventListener('change',e=>{if(session&&e.target.name==='knowledge-answer'&&session.results.length===session.index){session.choice=Number(e.target.value);saveDraft();}});
 body.addEventListener('click',e=>{
  const mode=e.target.closest('[data-assess-mode]')?.dataset.assessMode;
  if(mode){session={mode,items:assessmentItems(mode,lessons,modules),index:0,results:[],choice:null};restoreReason=null;saveDraft();question();}
  if(e.target.closest('[data-assess-resume]')&&pausedDraft){session=pausedDraft;question();}
  if(e.target.closest('[data-assess-discard]')){if(removeDraft())choose();else body.querySelector('#draft-remove-status').textContent='Could not discard the saved check. Browser storage is unavailable. Your course progress was kept.';}
  if(e.target.closest('[data-assess-next]')&&session&&session.results.length===session.index+1){session.index++;session.choice=null;if(session.index<session.items.length){saveDraft();question();}else result();}
  if(e.target.closest('[data-assess-restart]'))choose();
  if(e.target.closest('[data-assess-saved]')&&savedPlan)showSaved();
  if(e.target.closest('[data-assess-forget]')){try{localStorage.removeItem(planKey);savedPlan=null;choose();}catch{body.querySelector('#plan-storage-status').textContent='Could not remove the saved plan. Browser storage is unavailable. Try again when it is available.';}}
  if(e.target.closest('a,[data-assess-pause]'))dialog.close();
 });
 body.addEventListener('submit',e=>{
  if(e.target.id!=='knowledge-assessment')return;e.preventDefault();
  if(!session||session.results.length!==session.index)return;
  const raw=new FormData(e.target).get('knowledge-answer'),l=session.items[session.index],answer=Number(raw);
  if(raw===null||!Number.isInteger(answer)||answer< -1||answer>=l.quiz.options.length)return;
  session.choice=answer;session.results.push({l,answer,correct:answer===l.quiz.answer});saveDraft();feedback();
 });
 return {showAssessment(){if(!session)choose();showDialog(dialog);}};
}
