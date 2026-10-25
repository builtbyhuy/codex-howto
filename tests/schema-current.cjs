'use strict';
// Current metadata contract controls; adapted from the retained historical suite.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {check}=require('./structured-data.cjs');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const arg=name=>{const i=process.argv.indexOf('--'+name);return i<0?undefined:process.argv[i+1];};
if(process.argv.includes('--help')){console.log('node tests/schema-current.cjs [--root product] [--temp fresh-directory] [--out report.json]');process.exit(0);}
const root=path.resolve(arg('root')||path.join(__dirname,'..'));
const temp=arg('temp')?path.resolve(arg('temp')):fs.mkdtempSync(path.join(os.tmpdir(),'howto-schema-controls-'));
if(arg('temp'))fs.mkdirSync(temp,{recursive:false});
for(const dir of ['content','assets/reading'])fs.cpSync(path.join(root,dir),path.join(temp,dir),{recursive:true});
fs.mkdirSync(path.join(temp,'assets/atelier'),{recursive:true});
fs.copyFileSync(path.join(root,'assets/atelier/structured-data.cjs'),path.join(temp,'assets/atelier/structured-data.cjs'));
fs.copyFileSync(path.join(root,'index.html'),path.join(temp,'index.html'));
const report={at:new Date().toISOString(),node:process.version,scope:'Current authored HTML/schema contract, not general HTML sanitization or Google eligibility certification',historicalControlSourceSHA256:'c58b6b05cb66eb3a9699fdc0322ddf7ba34830963052ead9f5cc19f9e11b1c46',controls:[]};
const changeJSON=(s,fn)=>s.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,(_,a,b,c)=>{const v=JSON.parse(b);fn(v);return a+JSON.stringify(v)+c;});
const controls=[
 ...['template','xmp'].flatMap(tag=>[
  ['canonical only in '+tag,s=>s.replace(/<link rel="canonical"[^>]*>/,`<${tag}>$&</${tag}>`),false],
  ['schema only in '+tag,s=>s.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,`<${tag}>$&</${tag}>`),false],
  ['title only in '+tag,s=>s.replace(/<title>[\s\S]*?<\/title>/,`<${tag}>$&</${tag}>`),false]
 ]),
 ['canonical in body',s=>{const link=s.match(/<link rel="canonical"[^>]*>/)[0];return s.replace(link,'').replace('</body>',link+'</body>');},false],
 ['title in body',s=>{const title=s.match(/<title>[\s\S]*?<\/title>/)[0];return s.replace(title,'').replace('</body>',title+'</body>');},false],
 ['encoded srcdoc script',s=>s.replace('</body>','<iframe srcdoc="&lt;script&gt;alert(1)&lt;/script&gt;"></iframe></body>'),false],
 ['numeric entity without semicolon',s=>s.replace('</body>','<a href="java&#115cript:alert(1)">Run</a></body>'),false],
 ['valid body JSON-LD',s=>{const schema=s.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/)[0];return s.replace(schema,'').replace('</body>',schema+'</body>');},true],
 ['valid inert metadata decoys',s=>s.replace('</body>','<template><template><title>Ignored</title></template><link rel="canonical" href="wrong"></template><xmp><title>Ignored</title></xmp></body>'),true],
 ['data-rel is not rel',s=>s.replace('rel="canonical"','data-rel="canonical"'),false],
 ['data-href cannot mask wrong href',s=>s.replace(/(<link rel="canonical") href="([^"]+)"/,'$1 data-href="$2" href="https://example.org/wrong"'),false],
 ['commented canonical',s=>s.replace(/<link rel="canonical"[^>]*>/,'<!--$&-->'),false],
 ['commented JSON-LD',s=>s.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,'<!--$&-->'),false],
 ['commented title masks wrong title',s=>s.replace(/<title>[\s\S]*?<\/title>/,'<!--$&--><title>Wrong actual title</title>'),false],
 ['commented heading masks wrong heading',s=>s.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/,'<!--$&--><h1>Wrong heading</h1>'),false],
 ['duplicate canonical attribute',s=>s.replace('rel="canonical"','rel="canonical" rel="alternate"'),false],
 ['duplicate href attribute',s=>s.replace('rel="canonical"','href="https://example.org/wrong" rel="canonical"'),false],
 ['duplicate canonical node',s=>s.replace(/<link rel="canonical"[^>]*>/,'$&$&'),false],
 ['duplicate JSON-LD node',s=>s.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,'$&$&'),false],
 ['canonical fragment',s=>s.replace(/(<link rel="canonical" href=")([^"]+)/,'$1$2#fragment'),false],
 ['breadcrumb query',s=>changeJSON(s,v=>v.itemListElement[2].item+='?query=1'),false],
 ['breadcrumb fragment',s=>changeJSON(s,v=>v.itemListElement[2].item+='#fragment'),false],
 ['encoded JavaScript link',s=>s.replace('</body>','<a href="java&#x73;cript:alert(1)">Run</a></body>'),false],
 ['valid canonical attribute order',s=>s.replace(/<link rel="canonical" href="([^"]+)"\s*>/, '<link href="$1" rel="canonical">'),true],
 ['valid canonical quotes whitespace data attribute',s=>s.replace(/<link rel="canonical" href="([^"]+)"\s*>/,"<link\n data-label='reader > lesson' href = '$1'\n rel = 'canonical' >"),true],
 ['valid MIME capitalization whitespace',s=>s.replace('<script type="application/ld+json">',"<SCRIPT\n TYPE = 'APPLICATION/LD+JSON' >"),true],
 ['malformed JSON',s=>s.replace('"@context":','"@context" '),false],
 ['wrong origin',s=>s.replaceAll('https://builtbyhuy.github.io/codex-howto/','https://example.org/'),false],
 ['wrong breadcrumb title',s=>changeJSON(s,v=>v.itemListElement[2].name='Wrong lesson'),false],
 ['wrong position',s=>changeJSON(s,v=>v.itemListElement[2].position=9),false],
 ['wrong destination',s=>changeJSON(s,v=>v.itemListElement[2].item='https://builtbyhuy.github.io/codex-howto/assets/reading/s01-02.html'),false],
 ['wrong type',s=>changeJSON(s,v=>v['@type']='Course'),false],
 ['canonical query',s=>s.replace('rel="canonical" href="','rel="canonical" href="?bad=1'),false],
 ['missing canonical',s=>s.replace(/<link rel="canonical"[^>]*>/,''),false],
 ['missing JSON-LD',s=>s.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,''),false],
 ['executable script',s=>s.replace('</head>','<script>globalThis.bad=true</script></head>'),false],
 ['JSON-LD src',s=>s.replace('<script type="application/ld+json">','<script src="evil.js" type="application/ld+json">'),false],
 ['extra script attribute',s=>s.replace('<script type="application/ld+json">','<script onload="bad()" type="application/ld+json">'),false],
 ['event handler',s=>s.replace('<body data-page="static">','<body data-page="static" onload="bad()">'),false],
 ['unclosed script',s=>s.replace('</head>','<script type="application/ld+json">{}</head>'),false],
 ['valid final URL omitted',s=>changeJSON(s,v=>delete v.itemListElement[2].item),true],
 ['valid JSON formatting/order',s=>s.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,(_,a,b,c)=>a+JSON.stringify(Object.fromEntries(Object.entries(JSON.parse(b)).reverse()),null,2)+c),true],
 ['valid single quote MIME',s=>s.replace('type="application/ld+json"',"type='application/ld+json'"),true]
 ];
const lesson=path.join(temp,'assets/reading/s01-01.html'),home=path.join(temp,'index.html');
const originalLesson=fs.readFileSync(lesson,'utf8'),originalHome=fs.readFileSync(home,'utf8');
controls.push(['missing breadcrumb identity',s=>changeJSON(s,v=>delete v['@id']),false],['wrong breadcrumb identity',s=>changeJSON(s,v=>v['@id']='https://example.org/#breadcrumb'),false]);
function probe(target,original,name,mutate,expected){const altered=mutate(original);assert.notEqual(altered,original,'Control did not mutate: '+name);fs.writeFileSync(target,altered);let passed=true,error='';try{check(temp);}catch(e){passed=false;error=e.message;}finally{fs.writeFileSync(target,original);}report.controls.push({name,expectedPass:expected,passed,inputSha256:sha(altered),error});assert.equal(passed,expected,name);}
try{
 check(temp);
 for(const [name,mutate,expected]of controls)probe(lesson,originalLesson,name,mutate,expected);
 for(const [name,fn]of [
 ['wrong WebSite brand',v=>v.name='ChatGPT'],['wrong WebSite type',v=>v['@type']='Course'],['missing WebSite identity',v=>delete v['@id']],['wrong WebSite language',v=>v.inLanguage='vi'],['invented home description',v=>v.description='Invented rating and claims']
 ])probe(home,originalHome,name,s=>changeJSON(s,fn),false);
 probe(home,originalHome,'commented home JSON-LD',s=>s.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,'<!--$&-->'),false);
 const missing=path.join(temp,'assets/reading/s01-02.html'),bytes=fs.readFileSync(missing);fs.unlinkSync(missing);let passed=true;try{check(temp);}catch{passed=false;}finally{fs.writeFileSync(missing,bytes);}report.controls.push({name:'missing destination',expectedPass:false,passed});assert.equal(passed,false);
 check(temp);report.status='PASS';
}catch(e){report.status='FAIL';report.error=e.stack;process.exitCode=1;}
report.valid=report.controls.filter(c=>c.expectedPass).length;report.invalid=report.controls.filter(c=>!c.expectedPass).length;
if(arg('out')){fs.mkdirSync(path.dirname(path.resolve(arg('out'))),{recursive:true});fs.writeFileSync(path.resolve(arg('out')),JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
console.log(JSON.stringify({status:report.status,controls:report.controls.length,valid:report.valid,invalid:report.invalid,error:report.error}));
