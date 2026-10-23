'use strict';
const fs = require('node:fs');
const path = require('node:path');
function review(dir) {
  const readmePath = path.join(dir, 'README.md');
  if (!fs.existsSync(readmePath)) return { findings: [], unknowns: ['README.md is missing'], inspected: [], executed: false };
  const readme = fs.readFileSync(readmePath, 'utf8');
  const packagePath = path.join(dir, 'package.json');
  if (!fs.existsSync(packagePath)) return { findings: [], unknowns: ['package.json is missing; command existence is unknown'], inspected: ['README.md'], executed: false };
  let pkg;
  try { pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8')); }
  catch { return { findings: [], unknowns: ['package.json is not valid JSON'], inspected: ['README.md','package.json'], executed: false }; }
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const configUnknown = message => ({ findings: [], unknowns: [message], inspected: ['README.md','package.json'], executed: false });
  if (!isObject(pkg)) return configUnknown('package.json must contain an object; command existence is unknown');
  if (pkg.scripts !== undefined && (!isObject(pkg.scripts) || Object.values(pkg.scripts).some(value => typeof value !== 'string' || !value.trim()))) return configUnknown('package.json scripts must be an object of nonempty strings; command existence is unknown');
  const scripts = pkg.scripts || {};
  const commands = [];
  const unknowns = [];
  let heading = '', hasVerificationHeading = false;
  readme.split(/\r?\n/).forEach((line, i) => {
    const title = line.match(/^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/);
    if (title) heading = title[1];
    const verificationSection = /\b(test(?:ing|s)?|verification|validation|checks?)\b/i.test(heading);
    hasVerificationHeading ||= verificationSection;
    if (/\b(?:pnpm|yarn|bun)\s+(?:run\s+)?[A-Za-z][\w:-]*/.test(line)) unknowns.push('Unsupported package-manager syntax at README.md:' + (i+1) + '; this helper evaluates selected npm script commands only');
    if (/\bnpm\s+run\s+-/.test(line)) unknowns.push('Unsupported npm run option syntax at README.md:' + (i+1));
    for (const match of line.matchAll(/\bnpm\s+(?:run\s+([A-Za-z0-9][\w:-]*)|(start|test))\b/g)) {
      const script = match[1] || match[2];
      commands.push({ command: match[0], script, line: i + 1, verification: verificationSection || /^(?:test|check|verify|validate|lint)(?:$|[:_-])/.test(script) });
    }
  });
  const hasImplicitStart = !Object.hasOwn(scripts,'start') && fs.existsSync(path.join(dir,'server.js')) && fs.statSync(path.join(dir,'server.js')).isFile();
  const findings = commands.filter(c => !Object.hasOwn(scripts, c.script) && !(c.script === 'start' && hasImplicitStart)).map(c => ({
    code: 'UNKNOWN_SCRIPT', command: c.command, readmeLine: c.line,
    evidence: 'package.json scripts: ' + Object.keys(scripts).sort().join(', ')
  }));
  if (!commands.some(c => c.verification) && !hasVerificationHeading && !unknowns.length) findings.push({
    code: 'MISSING_TEST_GUIDANCE', evidence: Object.hasOwn(scripts,'test') ? 'package.json declares test, README has no supported npm test instruction' : 'README has no recognized verification guidance; inspect the project before proposing a command'
  });
  if (hasVerificationHeading && !commands.some(c => c.verification)) unknowns.push('A verification section exists, but no supported npm command in it could be evaluated');
  if (hasImplicitStart && commands.some(c => c.script === 'start')) unknowns.push('npm start can use the root server.js fallback; execution is not tested');
  unknowns.push('Whether documented commands execute successfully is not tested');
  return { findings, unknowns: [...new Set(unknowns)], inspected: ['README.md','package.json',...(hasImplicitStart ? ['server.js'] : [])], executed: false };
}
if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { process.stderr.write('Usage: node review.cjs <project-directory>\n'); process.exitCode = 2; }
  else { try { process.stdout.write(JSON.stringify(review(path.resolve(dir)), null, 2) + '\n'); } catch(e) { process.stderr.write(e.message+'\n'); process.exitCode=1; } }
}
module.exports = { review };


