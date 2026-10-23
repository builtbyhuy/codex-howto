// Motion never owns visibility: cancelling an animation always exposes the real state.
const preference=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')||{matches:true,addEventListener(){}};
const running=new Set();let keyboard=false;
const curve='cubic-bezier(.16,1,.3,1)';
globalThis.document?.addEventListener('keydown',()=>{keyboard=true;},true);
globalThis.document?.addEventListener('pointerdown',()=>{keyboard=false;},true);
export function settleMotion(){for(const a of running)a.cancel();running.clear();}
preference.addEventListener('change',()=>{if(preference.matches)settleMotion();});
export function arrive(element,{distance=5,duration=180,force=false,opacity=.35}={}){
 if(!element||preference.matches||keyboard&&!force)return;
 element.getAnimations().forEach(a=>a.cancel());
 const a=element.animate([{opacity,transform:`translateY(${distance}px)`},{opacity:1,transform:'translateY(0)'}],{duration,easing:curve});running.add(a);a.finished.catch(()=>{}).finally(()=>running.delete(a));
}
export function showDialog(dialog){if(dialog.open)return;dialog.showModal();arrive(dialog,{distance:7,duration:220});}
export function installInteractions(){
 document.addEventListener('toggle',event=>{const el=event.target;if(el.tagName==='DETAILS'&&el.open)arrive(el.querySelector(':scope > :not(summary)'),{distance:3,duration:160});},true);
 const observer=new MutationObserver(records=>{for(const r of records){const el=r.target;if(r.attributeName==='open'&&el.tagName==='DIALOG'&&el.open)arrive(el,{distance:7,duration:220});if(r.attributeName==='hidden'&&!el.hidden&&el.matches('.a-lessons'))arrive(el,{distance:4,duration:170});if(r.attributeName==='class'&&el.matches('#app-rail.open,#nav-menu.open'))arrive(el,{distance:4,duration:180});}});
 observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open','hidden','class']});
}
let readerCleanup=()=>{};
export function disposeReader(){readerCleanup();readerCleanup=()=>{};settleMotion();}
export function mountReader(scope){
 const links=[...scope.querySelectorAll('.lesson-toc a')],bar=scope.querySelector('.reading-progress i');if(!links.length)return;
 const sections=links.map(a=>document.getElementById(new URLSearchParams(a.hash.split('?')[1]).get('part')));let frame;
 function paint(){frame=null;let selected=0;sections.forEach((el,i)=>{if(el?.getBoundingClientRect().top<180)selected=i;});links.forEach((a,i)=>{if(i===selected)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});if(bar){const article=scope.querySelector('.lesson-article'),rect=article.getBoundingClientRect(),distance=article.offsetHeight-innerHeight+100;bar.style.transform=`scaleX(${Math.max(0,Math.min(1,(100-rect.top)/Math.max(1,distance)))})`;}}
 function request(){if(!frame)frame=requestAnimationFrame(paint);}
 window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request);paint();readerCleanup=()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',request);window.removeEventListener('resize',request);};
}
