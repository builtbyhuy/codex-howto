'use strict';
// Deterministic Stop alternative: literal headings + fresh evidence, at most one continuation.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function hash(text){return crypto.createHash('sha256').update(text).digest('hex');}
function evaluateStop(event){
 if(!event||event.hook_event_name!=='Stop')return {output:{},diagnostic:'Outside this Stop-only teaching contract.'};
 if(event.stop_hook_active===true)return {output:{},diagnostic:'Already continued once. Report missing evidence or hand off; do not loop.'};
 const block=reason=>({output:{decision:'block',reason:'Practice completion check: '+reason+' Make one focused correction, update review-evidence.json from the final candidate, and report what remains unverified.'},diagnostic:reason});
 if(typeof event.cwd!=='string'||!path.isAbsolute(event.cwd))return block('An absolute scratch cwd is required.');
 try{
  const root=fs.realpathSync(event.cwd),candidatePath=fs.realpathSync(path.join(root,'candidate.md')),evidencePath=fs.realpathSync(path.join(root,'review-evidence.json'));
  for(const file of[candidatePath,evidencePath])if(path.dirname(file)!==root)return block('A practice artifact resolves outside this scratch root.');
  const candidate=fs.readFileSync(candidatePath,'utf8'),evidence=JSON.parse(fs.readFileSync(evidencePath,'utf8'));
  if(evidence.artifactSha256!==hash(candidate))return block('The recorded hash does not match the final candidate.');
  const expected=[['running-section',/^## Running\s*$/m.test(candidate)],['verification-section',/^## Verification\s*$/m.test(candidate)]];
  if(!Array.isArray(evidence.checks)||evidence.checks.length!==2)return block('Exactly two bounded check observations are required.');
  for(const[id,actual]of expected){const rows=evidence.checks.filter(c=>c.id===id);if(!actual||rows.length!==1||rows[0].passed!==true)return block('Criterion '+id+' is missing, false or unsupported by the file.');}
  return {output:{},diagnostic:'Both literal headings and the final artifact hash match. This is not a general quality certificate.'};
 }catch{return block('The candidate or evidence could not be read and validated.');}
}
if(require.main===module){let input='';process.stdin.setEncoding('utf8');process.stdin.on('data',chunk=>input+=chunk);process.stdin.on('end',()=>{try{const r=evaluateStop(JSON.parse(input));process.stdout.write(JSON.stringify(r.output)+'\n');process.stderr.write(r.diagnostic+'\n');}catch{process.stdout.write('{}\n');process.stderr.write('Malformed event: no completion decision was produced. Inspect the hook contract.\n');}});}
module.exports={hash,evaluateStop};
