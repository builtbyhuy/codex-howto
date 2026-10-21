'use strict';
function buildReport(tasks) {
 if(!Array.isArray(tasks))throw new TypeError('tasks must be an array');
 const ids=new Set();
 for(const t of tasks){
  if(!t||typeof t.id!=='string'||ids.has(t.id)||!['open','done','blocked'].includes(t.status)||!Number.isFinite(t.minutes)||t.minutes<0)throw new TypeError('invalid or duplicate task');
  ids.add(t.id);
 }
 const done=tasks.filter(t=>t.status==='done');
 return {total:tasks.length,done:done.length,doneMinutes:done.reduce((n,t)=>n+t.minutes,0)};
}
module.exports={buildReport};


