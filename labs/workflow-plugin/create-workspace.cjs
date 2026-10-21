'use strict';
const {createWorkspace}=require('./native-workspace.cjs');
if(require.main===module){try{
 if(process.argv.length>3||(process.argv[2]&&process.argv[2]!=='--path-only'))throw new Error('Usage: node create-workspace.cjs [--path-only]');
 const workspace=createWorkspace();console.log(process.argv[2]==='--path-only'?workspace.root:JSON.stringify(workspace,null,2));
}catch(e){console.error(e.message);process.exitCode=1;}}
