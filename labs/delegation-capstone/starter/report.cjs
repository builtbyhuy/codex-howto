'use strict';
function buildReport(tasks) {
 return {total:tasks.length,done:tasks.filter(t=>t.status==='done').length,doneMinutes:tasks.reduce((n,t)=>n+t.minutes,0)};
}
module.exports={buildReport};


