import {mountWorkbench,disposeWorkbench} from './workbench.mjs';
let active=null,themeTransition;
const themePreference=matchMedia('(prefers-reduced-motion: reduce)');
themePreference.addEventListener('change',()=>{if(themePreference.matches)themeTransition?.skipTransition();});
export function disposeReferenceMotion(){if(active){active.animations.forEach(a=>a.cancel());cancelAnimationFrame(active.frame);active.preference.removeEventListener('change',active.change);active=null;}disposeWorkbench();}
export function mountReferenceMotion(scope=document,{entrance=true}={}){disposeReferenceMotion();const preference=matchMedia('(prefers-reduced-motion: reduce)'),animations=[],state={preference,animations,frame:0,change:()=>{if(preference.matches)animations.forEach(a=>a.finish());}};active=state;mountWorkbench(scope);if(entrance&&!preference.matches){scope.querySelectorAll('[data-enter]').forEach((el,i)=>animations.push(el.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:560,delay:i*70,easing:'cubic-bezier(.2,.75,.2,1)'})));const ring=scope.querySelector('#ring-fg');if(ring){const target=ring.style.strokeDashoffset;ring.style.transition='none';ring.style.strokeDashoffset=String(2*Math.PI*52);state.frame=requestAnimationFrame(()=>{if(active!==state)return;ring.getBoundingClientRect();ring.style.transition='';ring.style.strokeDashoffset=target;});}}preference.addEventListener('change',state.change);}
export function animateReferenceTheme(change,doc=document){
 themeTransition?.skipTransition();
 // Snapshot the complete palettes; independently fading text/surfaces can turn white on white.
 if(themePreference.matches||!doc.startViewTransition){change();return;}
 const transition=doc.startViewTransition(change);themeTransition=transition;
 transition.ready.catch(()=>{});transition.updateCallbackDone.catch(()=>{});
 transition.finished.catch(()=>{}).finally(()=>{if(themeTransition===transition)themeTransition=null;});
}
