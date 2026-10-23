'use strict';
// Grade the actual copied package, not a claimed completion report.
const fs=require('node:fs'),path=require('node:path');
const {inside,readWorkspace}=require('../native-workspace.cjs');
async function checkExtension(workspacePath){
 const w=readWorkspace(workspacePath);
 for(const cached of Object.keys(require.cache))if(inside(w.packageRoot,cached))delete require.cache[cached];
 const load=file=>require(path.join(w.packageRoot,file));
 const {IDS,reviewFixture}=load('tools/review-fixture.cjs');
 if(!IDS.includes('missing-both'))throw new Error('Starter is incomplete: add the missing-both fixture to the bounded tool.');
 const direct=reviewFixture('missing-both'),kinds=direct.findings.map(f=>f.kind).sort();
 if(JSON.stringify(kinds)!==JSON.stringify(['missing-running','missing-verification'])||direct.ignoredInstructions!==false||direct.findings.some(f=>!f.evidence))throw new Error('missing-both must have exactly two evidence-backed missing-heading findings.');
 if(reviewFixture('complete').findings.length!==0||reviewFixture('missing-checks').findings.length!==1||reviewFixture('injected').findings.length!==2)throw new Error('A baseline fixture regressed.');
 const schema=JSON.parse(fs.readFileSync(path.join(w.packageRoot,'workflows/review-result.schema.json'),'utf8'));
 if(!schema.properties.fixture.enum.includes('missing-both'))throw new Error('The standalone output-schema enum is stale.');
 const plugin=JSON.parse(fs.readFileSync(path.join(w.packageRoot,'plugin.json'),'utf8'));
 if(plugin.version!=='0.3.0')throw new Error('Use exercise version 0.3.0 so an installed cache can be distinguished from the starter.');
 const {connect}=load('client.cjs'),client=connect();
 try{
  const init=await client.initialize();if(init.result.serverInfo.version!==plugin.version)throw new Error('Server and package versions disagree.');
  const discovery=await client.request('tools/list'),tool=discovery.result.tools.find(t=>t.name==='review_fixture_readme');
  if(!tool?.inputSchema.properties.fixture.enum.includes('missing-both'))throw new Error('MCP discovery does not advertise the extension.');
  const response=await client.request('tools/call',{name:'review_fixture_readme',arguments:{fixture:'missing-both'}});
  if(response.result?.isError||JSON.stringify(response.result?.structuredContent)!==JSON.stringify(direct))throw new Error('The real stdio call disagrees with the direct checker.');
  const rejection=await client.request('tools/call',{name:'review_fixture_readme',arguments:{fixture:'../private'}});
  if(rejection.error?.code!==-32602)throw new Error('Path traversal was not rejected.');
 }finally{await client.close();}
 return {status:'passed',fixture:'missing-both',findings:kinds,packageVersion:plugin.version,protocol:'Real local stdio discovery/call/rejection; no Codex model session.'};
}
if(require.main===module)checkExtension(process.argv[2]).then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={checkExtension};
