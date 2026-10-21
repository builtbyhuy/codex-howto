'use strict';
// A complete new scratch project, with no owner configuration or automatic trust action.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {hash}=require('./stop-review.cjs');
const quotePS=s=>"'"+s.replace(/'/g,"''")+"'",quoteSH=s=>"'"+s.replace(/'/g,"'\\''")+"'";
function handler(script){const win='& '+quotePS(process.execPath)+' '+quotePS(script);return {type:'command',command:process.platform==='win32'?win:quoteSH(process.execPath)+' '+quoteSH(script),commandWindows:win,timeout:10};}
function createWorkspace({withStop=false}={}){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'codex-howto-hooks-'));
 for(const directory of['src','protected','.codex'])fs.mkdirSync(path.join(root,directory));
 fs.copyFileSync(path.join(__dirname,'guard.cjs'),path.join(root,'.codex/guard.cjs'));
 const config={description:'Disposable Codex How-To practice hooks; inspect and trust exact definitions only if you choose.',hooks:{PreToolUse:[{matcher:'^apply_patch$',hooks:[handler(path.join(root,'.codex/guard.cjs'))]}]}};
 fs.writeFileSync(path.join(root,'src/note.md'),'# Editable practice note\n\nChange only this fictional file in the allowed test.\n');
 fs.writeFileSync(path.join(root,'protected/note.md'),'# Protected practice note\n\nThis fictional file must stay unchanged in the protected apply_patch test.\n');
 const candidate='# Fictional practice guide\n\n## Running\n\nRun the supplied local checks.\n';fs.writeFileSync(path.join(root,'candidate.md'),candidate);
 fs.writeFileSync(path.join(root,'review-evidence.json'),JSON.stringify({artifactSha256:hash(candidate),checks:[{id:'running-section',passed:true},{id:'verification-section',passed:false}]},null,2)+'\n');
 if(withStop){fs.copyFileSync(path.join(__dirname,'stop-review.cjs'),path.join(root,'.codex/stop-review.cjs'));config.hooks.Stop=[{hooks:[handler(path.join(root,'.codex/stop-review.cjs'))]}];}
 fs.writeFileSync(path.join(root,'.codex/hooks.json'),JSON.stringify(config,null,2)+'\n');
 fs.writeFileSync(path.join(root,'README.md'),'# Codex hook practice\n\nA disposable project for allowed/protected apply_patch and optional bounded Stop checks.\nRead the downloaded NATIVE-CLIENT.md before electing trust. No hook has been trusted by this generator.\n');
 fs.writeFileSync(path.join(root,'AGENTS.md'),'Use apply_patch for the two requested edit observations. Never use a shell write to bypass a denied patch. State which tool actually ran. Files in protected/ are fictional practice targets. Do not change .codex/ or hooks during the observations.\n');
 return {root,withStop,config:path.join(root,'.codex/hooks.json'),state:'scratch-files-created-not-trusted',next:'Read NATIVE-CLIENT.md, initialize this scratch directory with Git, and open it in the chosen supported client.'};
}
if(require.main===module){try{const args=process.argv.slice(2);if(args.some(x=>!['--path-only','--with-stop'].includes(x)))throw new Error('Usage: node create-workspace.cjs [--path-only] [--with-stop]');const result=createWorkspace({withStop:args.includes('--with-stop')});console.log(args.includes('--path-only')?result.root:JSON.stringify(result,null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={createWorkspace};
