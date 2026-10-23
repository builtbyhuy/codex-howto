'use strict';
// Copies this teaching skill into a NEW project only. Never writes user settings.
const fs=require('node:fs'),path=require('node:path');
const packageRoot=__dirname;
function prepareScratch(destination,{explicitOnly=false}={}){
 if(typeof destination!=='string'||!destination.trim())throw new TypeError('Supply a new practice-directory path');
 const target=path.resolve(destination),source=fs.realpathSync(packageRoot),parent=fs.realpathSync(path.dirname(target));
 if(target===source||target.startsWith(source+path.sep)||parent===source||parent.startsWith(source+path.sep))throw new Error('Choose a new directory outside this lab package');
 if(fs.existsSync(target))throw new Error('Destination already exists; no files were changed');
 fs.mkdirSync(target); // Deliberately not recursive: its parent must already exist.
 const skill=path.join(target,'.agents','skills','readme-evidence-review');
 fs.mkdirSync(path.dirname(skill),{recursive:true});
 fs.cpSync(path.join(source,'skill'),skill,{recursive:true,errorOnExist:true,force:false});
 for(const file of ['README.md','package.json'])fs.copyFileSync(path.join(source,'fixtures','broken',file),path.join(target,file),fs.constants.COPYFILE_EXCL);
 if(explicitOnly){fs.mkdirSync(path.join(skill,'agents'));fs.copyFileSync(path.join(source,'explicit-only-draft.yaml'),path.join(skill,'agents','openai.yaml'));}
 fs.writeFileSync(path.join(target,'activation-results.csv'),'case,expected_activation,observed_activation,findings_correct,evidence\nexplicit,yes,not_run,not_run,\nparaphrase,'+(explicitOnly?'no':'evaluate')+',not_run,not_run,\nunrelated,no,not_run,not_run,\n');
 return {kind:'prepared-project-skill',project:target,skill,explicitOnly,nativeClientStarted:false,userConfigurationChanged:false,expectedHelperFindings:['UNKNOWN_SCRIPT','MISSING_TEST_GUIDANCE']};
}
if(require.main===module){try{const args=process.argv.slice(2),explicitOnly=args.includes('--explicit-only'),paths=args.filter(x=>x!=='--explicit-only');if(paths.length!==1)throw new Error('Usage: node prepare-scratch.cjs NEW_DIRECTORY [--explicit-only]');console.log(JSON.stringify(prepareScratch(paths[0],{explicitOnly}),null,2));}catch(error){console.error(error.message);process.exitCode=1;}}
module.exports={prepareScratch};
