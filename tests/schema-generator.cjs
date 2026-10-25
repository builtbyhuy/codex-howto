'use strict';
// Valid authored text must survive generation. All mutations stay in one copy.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const {check}=require('./structured-data.cjs');
const arg=n=>{const i=process.argv.indexOf('--'+n);return i<0?undefined:process.argv[i+1];};
if(process.argv.includes('--help')){console.log('node tests/schema-generator.cjs [--root product] [--temp fresh-directory] [--out report.json]');process.exit(0);}
const root=path.resolve(arg('root')||path.join(__dirname,'..'));
const temp=arg('temp')?path.resolve(arg('temp')):fs.mkdtempSync(path.join(os.tmpdir(),'howto-schema-generator-'));
if(arg('temp'))fs.mkdirSync(temp,{recursive:false});
for(const d of ['content','assets','labs','docs','study'])fs.cpSync(path.join(root,d),path.join(temp,d),{recursive:true});
fs.mkdirSync(path.join(temp,'scripts'));fs.copyFileSync(path.join(root,'scripts/build-reading-fallback.cjs'),path.join(temp,'scripts/build-reading-fallback.cjs'));
const home=fs.readFileSync(path.join(root,'index.html'),'utf8'),target=path.join(temp,'index.html');
const enc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const before=sha(path.join(root,'index.html'));
const report={node:process.version,scope:'Generator transport and idempotence in a disposable copy; not arbitrary HTML sanitization',cases:[]};
try{
 for(const [name,description,valid]of [
  ['ordinary authored description','A useful course & a clear result.',true],
  ['literal replacement tokens and script-closing text',"Literal $& $' $` $$ and </script><script>globalThis.schemaProbe=1</script> stay text.",true],
  ['missing authored language','A useful course.',false]
 ]){
  let input=home.replace(/(<meta name="description" content=")[^"]*(")/,(_,a,b)=>a+enc(description)+b);
  if(!valid)input=input.replace('lang="en"','');fs.writeFileSync(target,input);
  const generate=()=>spawnSync(process.execPath,['scripts/build-reading-fallback.cjs'],{cwd:temp,encoding:'utf8',timeout:30000,env:{...process.env,STRUCTURED_DATA_EVIDENCE:''}});
  const first=generate();assert.equal(first.status===0,valid,name+' generation result');
  if(valid){check(temp);const html=fs.readFileSync(target,'utf8'),data=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);assert.equal(data.description,description);assert.equal((html.match(/<script type="application\/ld\+json">/g)||[]).length,1);const bytes=Buffer.from(html);assert.equal(generate().status,0);assert.ok(bytes.equals(fs.readFileSync(target)),'Idempotent home');check(temp);}
  report.cases.push({name,expectedValid:valid,status:'PASS',generationExit:first.status});
 }
 report.status='PASS';
}catch(e){report.status='FAIL';report.error=e.stack;process.exitCode=1;}
finally{assert.equal(sha(path.join(root,'index.html')),before,'Authored source changed');}
if(arg('out')){const out=path.resolve(arg('out'));fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
console.log(JSON.stringify(report));
