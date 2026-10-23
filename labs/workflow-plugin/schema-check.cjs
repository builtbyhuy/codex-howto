'use strict';
// Dependency-free evaluator for every keyword used by the two bundled canonical schemas.
const fs=require('node:fs'),path=require('node:path');
function check(value,schema,root=schema,where='$'){
 if(typeof schema==='boolean')return schema?[]:[where+' prohibited'];
 if(schema.$ref){const target=schema.$ref.split('/').slice(1).reduce((v,k)=>v[k.replace(/~1/g,'/').replace(/~0/g,'~')],root);return check(value,target,root,where);}
 const allowed=new Set(['$schema','$id','$defs','title','description','type','const','enum','not','oneOf','properties','required','additionalProperties','propertyNames','items','minLength','maxLength','pattern']);
 for(const key of Object.keys(schema))if(!allowed.has(key))throw new Error('Unsupported schema keyword: '+key);
 let errors=[];
 if('const'in schema&&value!==schema.const)errors.push(where+' must equal '+schema.const);
 if(schema.enum&&!schema.enum.includes(value))errors.push(where+' not in enum');
 if(schema.not&&check(value,schema.not,root,where).length===0)errors.push(where+' matches prohibited schema');
 if(schema.oneOf){const count=schema.oneOf.filter(option=>check(value,option,root,where).length===0).length;if(count!==1)errors.push(where+' must match exactly one branch');}
 if(schema.type){const ok=schema.type==='object'?value!==null&&typeof value==='object'&&!Array.isArray(value):schema.type==='array'?Array.isArray(value):typeof value===schema.type;if(!ok)return [...errors,where+' must be '+schema.type];}
 if(typeof value==='string'){
  if(schema.minLength!==undefined&&value.length<schema.minLength)errors.push(where+' too short');
  if(schema.maxLength!==undefined&&value.length>schema.maxLength)errors.push(where+' too long');
  if(schema.pattern&&!new RegExp(schema.pattern).test(value))errors.push(where+' pattern mismatch');
 }
 if(Array.isArray(value)&&schema.items)value.forEach((v,i)=>errors.push(...check(v,schema.items,root,where+'['+i+']')));
 if(value&&typeof value==='object'&&!Array.isArray(value)){
  for(const key of schema.required||[])if(!Object.hasOwn(value,key))errors.push(where+'.'+key+' required');
  for(const[key,v]of Object.entries(value)){
   if(schema.propertyNames)errors.push(...check(key,schema.propertyNames,root,where+' key'));
   if(schema.properties&&Object.hasOwn(schema.properties,key))errors.push(...check(v,schema.properties[key],root,where+'.'+key));
   else if(schema.additionalProperties===false)errors.push(where+'.'+key+' unknown');
   else if(schema.additionalProperties&&typeof schema.additionalProperties==='object')errors.push(...check(v,schema.additionalProperties,root,where+'.'+key));
  }
 }
 return errors;
}
function validatePackage(){
 let errors=[];
 for(const [file,schema]of [['plugin.json','plugin.schema.json'],['mcp.json','mcp.schema.json']]){
  const value=JSON.parse(fs.readFileSync(path.join(__dirname,file),'utf8'));
  const definition=JSON.parse(fs.readFileSync(path.join(__dirname,'schemas',schema),'utf8'));
  errors.push(...check(value,definition).map(message=>file+': '+message));
 }
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'plugin.json'),'utf8'));
 const hookPath=manifest.extensions['com.openai'].hooks;
 if(!hookPath.startsWith('./')||hookPath.includes('..')||!fs.existsSync(path.join(__dirname,hookPath)))errors.push('OpenAI hook path must resolve inside the package.');
 return errors;
}
if(require.main===module){const errors=validatePackage();if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('Portable manifest and MCP configuration match the cached canonical schemas.');}
module.exports={check,validatePackage};

