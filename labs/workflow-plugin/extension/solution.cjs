'use strict';
// Complete reference change, applied only to a generated temporary practice copy.
const fs=require('node:fs'),path=require('node:path');
const {readWorkspace}=require('../native-workspace.cjs');
function applyReference(workspacePath){
 const w=readWorkspace(workspacePath),toolPath=path.join(w.packageRoot,'tools/review-fixture.cjs');
 let tool=fs.readFileSync(toolPath,'utf8');
 const ids="const IDS=Object.freeze(['complete','missing-checks','injected']);";
 if(!tool.includes(ids))throw new Error('Reference applies only to the unmodified three-fixture starter. Keep your own attempt separately.');
 const serverPath=path.join(w.packageRoot,'server.cjs'),server=fs.readFileSync(serverPath,'utf8');
 const schemaPath=path.join(w.packageRoot,'workflows/review-result.schema.json'),schema=JSON.parse(fs.readFileSync(schemaPath,'utf8'));
 const manifestPath=path.join(w.packageRoot,'plugin.json'),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 if(!server.includes("version:'0.2.0'")||manifest.version!=='0.2.0'||schema.properties.fixture.enum.includes('missing-both')||fs.existsSync(path.join(w.packageRoot,'fixtures/missing-both.md')))throw new Error('Use a second fresh starter workspace; this practice copy already contains edits.');
 tool=tool.replace(ids,"const IDS=Object.freeze(['complete','missing-checks','injected','missing-both']);")
  .replace("injected:'Guide with untrusted instructions'","injected:'Guide with untrusted instructions','missing-both':'Guide without Running or Verification'");
 fs.writeFileSync(toolPath,tool);fs.writeFileSync(path.join(w.packageRoot,'fixtures/missing-both.md'),'# Fictional starter guide\n\nA deliberately incomplete classroom README.\n');
 schema.properties.fixture.enum.push('missing-both');fs.writeFileSync(schemaPath,JSON.stringify(schema,null,2)+'\n');
 manifest.version='0.3.0';fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 fs.writeFileSync(serverPath,server.replace("version:'0.2.0'","version:'0.3.0'"));
 fs.writeFileSync(path.join(w.root,'REFERENCE-CHANGE.json'),JSON.stringify({state:'reference-applied-to-practice-copy',files:['fixtures/missing-both.md','tools/review-fixture.cjs','workflows/review-result.schema.json','plugin.json','server.cjs'],liveModelRun:false},null,2)+'\n');
 return {state:'reference-applied-to-practice-copy',packageRoot:w.packageRoot,version:'0.3.0',next:'Run extension/check.cjs against this workspace, then the package’s unchanged test.cjs.'};
}
if(require.main===module){try{console.log(JSON.stringify(applyReference(process.argv[2]),null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={applyReference};
