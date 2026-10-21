'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const STARTER = path.join(__dirname, 'starter');
const gitExecutable = () => process.env.CODEX_COURSE_GIT || 'git';
function gitEnvironment(workspace) {
  // Git honors inherited repository, index and config variables even with -C.
  // Keep this exercise inside its owned folder and independent of user config.
  const env = Object.fromEntries(Object.entries(process.env).filter(([name]) => !/^GIT_/i.test(name)));
  return { ...env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: path.join(workspace,'.course-empty-gitconfig'), GIT_TERMINAL_PROMPT: '0' };
}
function git(workspace, args) {
  const result = spawnSync(gitExecutable(), ['-C', workspace, ...args], {
    shell: false, encoding: 'utf8', windowsHide: true,
    env: gitEnvironment(workspace),
  });
  if (result.error || result.status !== 0) throw new Error(`Git ${args[0]}: ${result.error?.message || result.stderr.trim()}`);
  return result.stdout.trimEnd();
}
function createWorkspace({ withGit = false, tempRoot = process.env.CODEX_COURSE_LAB_TMP || os.tmpdir() } = {}) {
  const parent = fs.realpathSync(tempRoot);
  const workspace = fs.mkdtempSync(path.join(parent, 'codex-project-workflow-'));
  fs.cpSync(STARTER, workspace, { recursive:true });
  fs.writeFileSync(path.join(workspace,'.course-empty-gitconfig'),'');
  fs.mkdirSync(path.join(workspace,'.course-empty-template'));
  const metadata = { ownedBy:'Codex How-To project-workflow lab', workspace, withGit, baseline:'file copy' };
  if (withGit) {
    git(workspace, ['init','--quiet','--initial-branch=course-lab',`--template=${path.join(workspace,'.course-empty-template')}`]);
    git(workspace, ['add','--','.gitignore','AGENTS.md','README.md','WORK-NOTE.md','checks.cjs','cli.cjs','notes.cjs','notes.json']);
    metadata.baseline = git(workspace, ['write-tree']);
  }
  fs.writeFileSync(path.join(workspace,'.course-workspace.json'),JSON.stringify(metadata,null,2)+'\n');
  return metadata;
}
function check(workspace) {
  const env = { ...process.env };
  // A parent node --test process sets an internal child protocol variable.
  // This subprocess is an independent TAP run, not a child in that protocol.
  delete env.NODE_TEST_CONTEXT;
  return spawnSync(process.execPath, ['--test','--test-reporter=tap','checks.cjs'], { cwd:workspace,shell:false,encoding:'utf8',windowsHide:true,env });
}
function verifyReference({ withGit = false, tempRoot } = {}) {
  const created = createWorkspace({withGit,tempRoot});
  const file = name => path.join(created.workspace,name);
  const before = Object.fromEntries(['notes.json','checks.cjs','WORK-NOTE.md'].map(name=>[name,fs.readFileSync(file(name),'utf8')]));
  const baseline = check(created.workspace);
  if (baseline.status !== 1 || !/^# fail 2$/m.test(baseline.stdout)) throw new Error('The known baseline must fail exactly two checks.');
  for (const name of ['notes.cjs','README.md']) fs.copyFileSync(path.join(__dirname,'solution',name),file(name));
  const solved = check(created.workspace);
  if (solved.status !== 0 || !/^# pass 6$/m.test(solved.stdout)) throw new Error('The reference must pass all six checks.');
  for (const [name,content] of Object.entries(before)) if (fs.readFileSync(file(name),'utf8') !== content) throw new Error(`Unrelated file changed: ${name}`);
  const candidate = fs.readFileSync(file('README.md'),'utf8');
  const useful = '\n## Review note\n\nThe useful additional paragraph must survive a rejected heading experiment.\n';
  fs.writeFileSync(file('README.md'),candidate.replace('# Orbit Notes','# Rejected heading experiment')+useful);
  const experiment = fs.readFileSync(file('README.md'),'utf8');
  fs.writeFileSync(file('README.md'),experiment.replace(/^# Rejected heading experiment/m,'# Orbit Notes'));
  if (fs.readFileSync(file('README.md'),'utf8') !== candidate+useful) throw new Error('Targeted recovery failed to preserve the useful paragraph.');
  let diff = null;
  if (withGit) {
    diff = git(created.workspace,['diff','--no-ext-diff','--','README.md','notes.cjs']);
    if (!diff.includes('toLowerCase') || !diff.includes('node --test checks.cjs')) throw new Error('The actual Git diff omitted the expected change.');
    if (git(created.workspace,['diff','--no-ext-diff','--','WORK-NOTE.md','notes.json','checks.cjs'])) throw new Error('A protected file differs from its index baseline.');
    fs.writeFileSync(file('evidence.diff'),diff+'\n');
  }
  return { ...created, baselineChecks:{pass:4,fail:2},referenceChecks:{pass:6,fail:0},unrelatedFiles:'preserved',targetedRecovery:'useful paragraph preserved',diffPath:withGit?file('evidence.diff'):null };
}
module.exports = { createWorkspace, verifyReference, git, gitExecutable, gitEnvironment };
