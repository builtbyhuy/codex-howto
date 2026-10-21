'use strict';
// Classroom scope: create a fresh temporary marketplace, never select an owner profile.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const KIND='codex-howto-workflow-plugin-v1';
const PACKAGE='workflow-review-practice',MARKETPLACE='howto-practice-local';
function inside(root,target){const relative=path.relative(root,target);return relative===''||(!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative));}
function createWorkspace(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'codex-howto-workflow-'));
 const marketplaceRoot=path.join(root,'marketplace'),packageRoot=path.join(marketplaceRoot,'plugins',PACKAGE),codexHome=path.join(root,'codex-home');
 fs.mkdirSync(path.join(marketplaceRoot,'.agents','plugins'),{recursive:true});fs.mkdirSync(codexHome);
 fs.cpSync(__dirname,packageRoot,{recursive:true,filter:source=>{
  if(fs.lstatSync(source).isSymbolicLink())throw new Error('The practice package must contain ordinary files, not symbolic links.');
  return !['node_modules','.git'].includes(path.basename(source));
 }});
 const catalog={name:MARKETPLACE,interface:{displayName:'Codex How-To Practice'},plugins:[{name:PACKAGE,source:{source:'local',path:'./plugins/'+PACKAGE},policy:{installation:'AVAILABLE',authentication:'ON_INSTALL'},category:'Productivity'}]};
 fs.writeFileSync(path.join(marketplaceRoot,'.agents/plugins/marketplace.json'),JSON.stringify(catalog,null,2)+'\n');
 // Empty file authentication store prevents a metadata exercise using a desktop keychain.
 fs.writeFileSync(path.join(codexHome,'config.toml'),'cli_auth_credentials_store = "file"\n');
 const marker={kind:KIND,createdAt:new Date().toISOString(),marketplace:MARKETPLACE,plugin:PACKAGE};
 fs.writeFileSync(path.join(root,'PRACTICE-WORKSPACE.json'),JSON.stringify(marker,null,2)+'\n');
 return {root,marketplaceRoot,packageRoot,codexHome,...marker};
}
function readWorkspace(input){
 if(typeof input!=='string'||!path.isAbsolute(input))throw new Error('Use the absolute workspace path printed by create-workspace.cjs.');
 const root=fs.realpathSync(input),temporaryRoot=fs.realpathSync(os.tmpdir());
 if(!inside(temporaryRoot,root)||!/^codex-howto-workflow-/.test(path.basename(root)))throw new Error('Only a generated temporary practice workspace is accepted.');
 const marker=JSON.parse(fs.readFileSync(path.join(root,'PRACTICE-WORKSPACE.json'),'utf8'));
 if(marker.kind!==KIND||marker.marketplace!==MARKETPLACE||marker.plugin!==PACKAGE)throw new Error('Not this lab’s practice workspace.');
 const marketplaceRoot=fs.realpathSync(path.join(root,'marketplace')),codexHome=fs.realpathSync(path.join(root,'codex-home')),packageRoot=fs.realpathSync(path.join(marketplaceRoot,'plugins',PACKAGE));
 for(const directory of[marketplaceRoot,codexHome,packageRoot])if(!inside(root,directory))throw new Error('A practice path resolves outside its generated workspace.');
 const catalog=JSON.parse(fs.readFileSync(path.join(marketplaceRoot,'.agents/plugins/marketplace.json'),'utf8'));
 if(catalog.name!==MARKETPLACE||catalog.plugins?.length!==1||catalog.plugins[0].name!==PACKAGE||catalog.plugins[0].source?.source!=='local'||catalog.plugins[0].source.path!=='./plugins/'+PACKAGE)throw new Error('Keep the generated local marketplace entry for this bounded exercise.');
 return {root,marketplaceRoot,packageRoot,codexHome,...marker};
}
module.exports={KIND,PACKAGE,MARKETPLACE,inside,createWorkspace,readWorkspace};
