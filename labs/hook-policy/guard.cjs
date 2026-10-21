'use strict';
// Teaching policy for canonical apply_patch events only.
// It never applies a patch, reads target files, resolves symlinks, or runs a command.
const fs = require('node:fs');
const path = require('node:path');
const invalid = reason => ({classification:'invalid',reason,paths:[]});
function evaluate(event, options={}) {
  if (!event || typeof event !== 'object' || Array.isArray(event)) return invalid('Event must be an object.');
  if (event.hook_event_name !== 'PreToolUse') return {classification:'irrelevant',reason:'Not a PreToolUse event.',paths:[]};
  if (typeof event.tool_name !== 'string') return invalid('tool_name must be a string.');
  if (event.tool_name !== 'apply_patch') return {classification:'irrelevant',reason:'Tool is outside this apply_patch-only policy.',paths:[]};
  if (typeof event.cwd !== 'string' || !event.cwd || /[\0\r\n]/.test(event.cwd)) return invalid('cwd must be a clean absolute path.');
  const windows = /^[A-Za-z]:[\\/]/.test(event.cwd) || /^\\\\/.test(event.cwd);
  const paths = windows ? path.win32 : path.posix;
  if (!paths.isAbsolute(event.cwd)) return invalid('cwd must be absolute.');
  const root = paths.resolve(event.cwd);
  const input = event.tool_input;
  if (!input || typeof input !== 'object' || Array.isArray(input) || typeof input.command !== 'string') return invalid('apply_patch requires tool_input.command as a string.');
  if (Buffer.byteLength(input.command,'utf8') > 65536) return invalid('Patch exceeds the 64 KiB teaching limit.');
  const lines = input.command.replace(/\r\n/g,'\n').replace(/\n+$/,'').split('\n');
  if (lines[0] !== '*** Begin Patch' || lines.at(-1) !== '*** End Patch') return invalid('Expected complete Begin Patch and End Patch markers.');
  const candidates = [];
  let previousOperation = null;
  for (const line of lines.slice(1,-1)) {
    let match = line.match(/^\*\*\* (Add|Update|Delete) File: (.*)$/);
    if (match) { previousOperation=match[1]; candidates.push(match[2]); continue; }
    match = line.match(/^\*\*\* Move to: (.*)$/);
    if (match) {
      if (previousOperation !== 'Update') return invalid('Move to must follow an Update File operation.');
      candidates.push(match[1]); continue;
    }
    // Unknown control headers must not silently escape the path inventory.
    if (line.startsWith('*** ') && !['*** End of File'].includes(line)) return invalid('Unknown patch control header.');
  }
  if (!candidates.length) return invalid('No patch target paths were found.');
  const resolved = [];
  for (const candidate of candidates) {
    if (!candidate || candidate !== candidate.trim() || /[\0\r\n]/.test(candidate)) return invalid('Patch path is empty or contains ambiguous whitespace/control characters.');
    if (!windows && (/^[A-Za-z]:/.test(candidate) || candidate.includes('\\'))) return invalid('Windows path syntax is not valid for this POSIX fixture root.');
    // Windows drive-relative and rooted-without-drive paths have ambiguous intent.
    if (windows && (/^[A-Za-z]:(?![\\/])/.test(candidate) || /^[\\/](?![\\/])/.test(candidate))) return invalid('Ambiguous Windows rooted path.');
    const target = paths.resolve(root,candidate);
    const relative = paths.relative(root,target);
    if (!relative || relative === '..' || relative.startsWith('..'+paths.sep) || paths.isAbsolute(relative)) {
      return {classification:'deny',reason:'Patch target is outside the practice root or is the root itself.',paths:[candidate]};
    }
    const segments = relative.split(/[\\/]/);
    const compare = windows ? segments.map(s=>s.toLowerCase()) : segments;
    if (compare.includes('protected') || compare.some(s=>s === '.env' || s.startsWith('.env.'))) {
      return {classification:'deny',reason:'Patch targets a protected directory or environment file.',paths:[relative]};
    }
    if (options.protectGenerated && compare[0] === 'generated') return {classification:'deny',reason:'Extension policy protects generated files.',paths:[relative]};
    resolved.push(relative.replace(/\\/g,'/'));
  }
  return {classification:'allow',reason:'All inventoried patch paths are inside the permitted practice area.',paths:resolved};
}
function wire(result) {
  if (result.classification === 'irrelevant') return {};
  if (['deny','invalid'].includes(result.classification)) {
    return {hookSpecificOutput:{hookEventName:'PreToolUse',permissionDecision:'deny',permissionDecisionReason:result.reason}};
  }
  // No objection from this policy is not a grant that overrides the active sandbox.
  return {hookSpecificOutput:{hookEventName:'PreToolUse',additionalContext:'Practice patch policy: checked '+result.paths.length+' target path(s); no policy objection.'}};
}
function run(options={}) {
  let result;
  try {
    const raw=fs.readFileSync(0,'utf8');
    if (Buffer.byteLength(raw,'utf8') > 70000) result=invalid('Event exceeds the 70 KiB teaching limit.');
    else result=evaluate(JSON.parse(raw),options);
  } catch { result=invalid('Input is not valid JSON.'); }
  if (result.classification === 'invalid') process.stderr.write('Practice input validation failed: '+result.reason+'\n');
  process.stdout.write(JSON.stringify(wire(result))+'\n');
}
if (require.main === module) run();
module.exports={evaluate,wire,run};

