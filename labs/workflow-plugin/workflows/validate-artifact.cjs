'use strict';
const fs=require('node:fs'),path=require('node:path');
const {check}=require('../schema-check.cjs'),{reviewFixture}=require('../tools/review-fixture.cjs');
const root=path.resolve(__dirname,'..');
function validateArtifact(kind,value,{expectedFixture}={}){
 const errors=[];
 const text=v=>typeof v==='string'&&v.trim().length>0;
 if(kind==='review'){
  const schema=JSON.parse(fs.readFileSync(path.join(__dirname,'review-result.schema.json'),'utf8'));
  errors.push(...check(value,schema));
  if(expectedFixture!==undefined){
   if(value.fixture!==expectedFixture)errors.push('Expected fixture '+expectedFixture+'; the answer concerns a different subject.');
   if(value.status!=='complete')errors.push('The expected fixture review is not complete.');
  }
  if(!errors.length&&value.status==='complete'){
   const groundTruth=reviewFixture(value.fixture);
   if(JSON.stringify(value.findings)!==JSON.stringify(groundTruth.findings)||value.ignoredInstructions!==groundTruth.ignoredInstructions)errors.push('Claimed findings differ from the deterministic fixture evidence.');
  }
 }else if(kind==='schedule'){
  for(const field of ['work','cadence','timezone','environment','scope','notification','approval'])if(!text(value[field]))errors.push('Missing '+field);
  if(value.state!=='prepared-not-scheduled')errors.push('This lab must remain prepared-not-scheduled.');
  try{new Intl.DateTimeFormat('en',{timeZone:value.timezone}).format(new Date(0));}catch{errors.push('Invalid IANA timezone.');}
 }else if(kind==='permissions'){
  if(value.state!=='design-not-os-test')errors.push('A designed matrix is not an OS enforcement result.');
  if(!Array.isArray(value.actions)||value.actions.length!==3)errors.push('Expected three action classes.');
  else for(const action of value.actions)for(const field of ['name','taskAuthorization','sandboxExpectation','approvalExpectation'])if(!text(action[field]))errors.push('Missing action '+field);
 }else if(kind==='marketplace'){
  if(!text(value.name)||!Array.isArray(value.plugins)||!value.plugins.length)errors.push('Catalog needs name and plugins.');
  else for(const plugin of value.plugins){
   const entry=plugin.source;
   if(entry?.source!=='local'||typeof entry.path!=='string'||!entry.path.startsWith('./')){errors.push('Expected a ./ local source path.');continue;}
   const target=path.resolve(root,entry.path),relative=path.relative(root,target);
   if(relative.startsWith('..')||path.isAbsolute(relative)){errors.push('Draft source escapes this lab root.');continue;}
   if(!fs.existsSync(path.join(target,'plugin.json')))errors.push('Resolved source has no plugin.json.');
  }
 }else if(kind==='release'){
  if(value.state!=='prepared-not-submitted')errors.push('This exercise does not submit or publish.');
  if(value.hasLifecycleHooks&&value.publicDirectoryEligible!==false)errors.push('Hook package must not be labeled public-directory eligible.');
  if(!Array.isArray(value.blockers)||!value.blockers.length)errors.push('Record actual missing evidence and eligibility blockers.');
  if(!text(value.requiredApproval))errors.push('State the exact external-action approval needed.');
 }else errors.push('Unknown artifact kind.');
 return errors;
}
if(require.main===module){
 const [kind,file,...options]=process.argv.slice(2);
 try{
  if(!file)throw new Error('Usage: node validate-artifact.cjs <review|schedule|permissions|marketplace|release> <json-file>');
  if(options.length&&(options.length!==2||options[0]!=='--expected-fixture'||kind!=='review'))throw new Error('Optional review contract: --expected-fixture FIXTURE_ID');
  const value=JSON.parse(fs.readFileSync(path.resolve(file),'utf8')),errors=validateArtifact(kind,value,{expectedFixture:options[1]});
  if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
  else console.log(kind+' artifact passed local checks. No client action was performed.');
 }catch(error){console.error(error.message);process.exitCode=1;}
}
module.exports={validateArtifact};

