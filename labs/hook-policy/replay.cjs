'use strict';
const fs=require('node:fs'),path=require('node:path'),{evaluate,wire}=require('./guard.cjs');
const name=process.argv[2]||'deny-protected';
if(!/^[a-z-]+$/.test(name)){console.error('Use a bundled fixture name.');process.exitCode=1;}
else {try {const value=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures',name+'.json'),'utf8'));process.stdout.write(JSON.stringify(wire(evaluate(value)),null,2)+'\n');}catch(error){console.error(error.message);process.exitCode=1;}}
