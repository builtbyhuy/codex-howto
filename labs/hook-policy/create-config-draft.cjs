'use strict';
// Prints a draft; never writes an active config file.
const path=require('node:path');
const script=path.join(__dirname, process.argv.includes('--solution')?'solution/guard.cjs':'guard.cjs');
const ps=s=>"'"+s.replace(/'/g,"''")+"'";
const sh=s=>"'"+s.replace(/'/g,"'\\''")+"'";
const win='& '+ps(process.execPath)+' '+ps(script);
const command=process.platform==='win32'?win:sh(process.execPath)+' '+sh(script);
process.stdout.write(JSON.stringify({
  description:'Teaching apply_patch policy only; review scope and limitations before activation.',
  hooks:{PreToolUse:[{matcher:'^apply_patch$',hooks:[{type:'command',command,commandWindows:win,timeout:10,statusMessage:'Checking practice patch paths'}]}]}
},null,2)+'\n');

