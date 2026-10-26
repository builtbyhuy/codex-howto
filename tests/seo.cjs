'use strict';
// Site-specific acceptance contract, independently derived from authored inputs.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {elements,entities}=require('./html-elements.cjs');
const origin='https://builtbyhuy.github.io/codex-howto/';
// Observed in Google's authorized HTML-tag verification UI, 26 October 2026.
const verification='y3_C0SOwSyzHX25IKOoJ373nBtdXRWYo9-uRVpc7A70';
const arg=n=>{const i=process.argv.indexOf('--'+n);return i<0?undefined:process.argv[i+1];};
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function check(root){
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const lessons=['a','b','c'].flatMap(p=>JSON.parse(read('content/part-'+p+'.json'))).flatMap(m=>m.lessons);assert.equal(lessons.length,60);
 const pages=['index.html','assets/reading/index.html',...lessons.map(l=>'assets/reading/'+l.id+'.html')],urls=pages.map(f=>f==='index.html'?origin:origin+f),titles=[],descriptions=[];
 for(const [i,file]of pages.entries()){
  const nodes=elements(read(file));
  const one=(name,predicate)=>{const found=nodes.filter(n=>n.name===name&&predicate(n));assert.equal(found.length,1,file+': exactly one '+name);return found[0];};
  const canonical=one('link',n=>n.inHead&&(n.attrs.rel||'').toLowerCase()==='canonical');assert.equal(entities(canonical.attrs.href),urls[i],file+': canonical');
  const title=entities(one('title',n=>n.inHead).body);assert.ok(title.trim(),file+': title');titles.push(title);
  const description=entities(one('meta',n=>n.inHead&&(n.attrs.name||'').toLowerCase()==='description').attrs.content||'');assert.ok(description.trim(),file+': description');descriptions.push(description);
  assert.equal(nodes.filter(n=>n.name==='h1').length,1,file+': one actual H1');
  for(const n of nodes.filter(n=>n.name==='meta'&&['robots','googlebot'].includes((n.attrs.name||'').toLowerCase())))assert.ok(!/(?:^|[,\s])(?:noindex|nofollow|none)(?:$|[,\s])/i.test(n.attrs.content||''),file+': indexability meta');
  if(i===0){
   assert.match(title,/OpenAI Codex Guide/);assert.ok(title.includes('Howto codex'));
   assert.match(description,/OpenAI Codex/);assert.match(description,/60/);assert.match(description,/7/);
   const meta=(name)=>entities(one('meta',n=>n.inHead&&n.attrs.property===name).attrs.content);
   assert.equal(meta('og:title'),title);assert.equal(meta('og:description'),description);assert.equal(meta('og:url'),origin);
   assert.equal(one('meta',n=>n.inHead&&n.attrs.name==='google-site-verification').attrs.content,verification,'Authorized Google ownership proof');
  }
 }
 assert.equal(new Set(titles).size,pages.length,'Unique page titles');assert.equal(new Set(descriptions).size,pages.length,'Unique page descriptions');
 const xml=read('sitemap.xml').replace(/^\uFEFF/,'').replace(/<!--(?:(?!--)[\s\S])*?-->/g,'').trim();
 const body=xml.match(/^(?:<\?xml[^?]*\?>\s*)?<urlset\s+xmlns=(['"])http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9\1\s*>([\s\S]*)<\/urlset>$/);assert.ok(body,'Bounded sitemap XML envelope');
 const entry=/<url>\s*<loc>([^<]+)<\/loc>\s*<\/url>/g,locations=[...body[2].matchAll(entry)].map(m=>entities(m[1]));assert.equal(body[2].replace(entry,'').trim(),'','Unexpected sitemap fields or malformed XML');
 assert.equal(locations.length,new Set(locations).size,'Duplicate sitemap URL');assert.deepEqual(locations.slice().sort(),urls.slice().sort(),'Sitemap matches all real canonical HTML pages only');
 for(const u of locations){const parsed=new URL(u);assert.equal(parsed.protocol,'https:');assert.equal(parsed.hash+parsed.search,'');assert.ok(u.startsWith(origin));}
 return {status:'PASS',htmlPages:pages.length,sitemapURLs:locations.length,uniqueTitles:titles.length,uniqueDescriptions:descriptions.length,ownership:'Exact authorized tag',limit:'Current site contract and deliberately bounded sitemap format; not Google indexing or ranking evidence'};
}
function controls(root,temp){
 fs.mkdirSync(temp,{recursive:false});for(const dir of ['content','assets/reading'])fs.cpSync(path.join(root,dir),path.join(temp,dir),{recursive:true});for(const f of ['index.html','sitemap.xml'])fs.copyFileSync(path.join(root,f),path.join(temp,f));
 const report={at:new Date().toISOString(),controls:[],scope:'Temporary input changes with a fixed independent checker. Invalid means violates this site contract, not necessarily invalid for every XML/HTML consumer.'};
 check(temp);
 const rows=[
  ['sitemap.xml','valid extra XML whitespace',s=>s.replaceAll('<url>','<url>\n  '),true],
  ['sitemap.xml','valid XML comment',s=>s.replace('<urlset','<!-- canonical URL inventory -->\n<urlset'),true],
  ['sitemap.xml','valid reordered entries',s=>{const matches=[...s.matchAll(/  <url>.*?<\/url>/g)].map(x=>x[0]);return s.replace(matches.join('\n'),matches.reverse().join('\n'));},true],
  ['index.html','valid explicit index-follow',s=>s.replace('</head>','<meta name="robots" content="index,follow"></head>'),true],
  ['sitemap.xml','missing lesson',s=>s.replace(/\s*<url><loc>[^<]+s01-01\.html<\/loc><\/url>/,''),false],
  ['sitemap.xml','duplicate URL',s=>s.replace('</urlset>','<url><loc>'+origin+'</loc></url></urlset>'),false],
  ['sitemap.xml','hash route',s=>s.replace('assets/reading/s01-01.html','#lesson/s01-01'),false],
  ['sitemap.xml','foreign canonical',s=>s.replace(origin,'https://example.invalid/'),false],
  ['sitemap.xml','missing XML closing tag',s=>s.replace('</urlset>',''),false],
  ['sitemap.xml','wrong namespace',s=>s.replace('/sitemap/0.9','/sitemap/9.9'),false],
  ['sitemap.xml','unproven lastmod field',s=>s.replace('</loc>','</loc><lastmod>2026-10-26</lastmod>'),false],
  ['index.html','wrong self canonical',s=>s.replace('rel="canonical" href="'+origin+'"','rel="canonical" href="https://example.invalid/"'),false],
  ['index.html','noindex',s=>s.replace('</head>','<meta name="robots" content="NOINDEX,follow"></head>'),false],
  ['index.html','Googlebot noindex',s=>s.replace('</head>','<meta name="googlebot" content="noindex"></head>'),false],
  ['index.html','missing description',s=>s.replace(/<meta name="description"[^>]+>/,''),false],
  ['index.html','wrong verification owner',s=>s.replace(verification,'not-the-authorized-token'),false],
  ['index.html','missing H1',s=>s.replace('<h1 id="hero-title">','<h2 id="hero-title">').replace('</h1>','</h2>'),false],
  ['index.html','misleading OG URL',s=>s.replace('property="og:url" content="'+origin+'"','property="og:url" content="https://example.invalid/"'),false]
 ];
 for(const [file,name,mutate,expectedPass]of rows){const target=path.join(temp,file),original=fs.readFileSync(target,'utf8'),changed=mutate(original);assert.notEqual(changed,original,'Effective control '+name);let passed=true,error='';try{fs.writeFileSync(target,changed);try{check(temp);}catch(e){passed=false;error=e.message;}}finally{fs.writeFileSync(target,original);}report.controls.push({name,expectedPass,passed,inputSHA256:sha(changed),error});assert.equal(passed,expectedPass,name);check(temp);}
 report.status='PASS';return report;
}
if(require.main===module){
 if(process.argv.includes('--help')){console.log('node tests/seo.cjs [--root product] [--controls] [--temp fresh-directory] [--out fresh-report.json]');process.exit(0);}
 const root=path.resolve(arg('root')||path.join(__dirname,'..'));let result;
 try{result={check:check(root)};if(process.argv.includes('--controls')){let temp=arg('temp');if(!temp){const parent=fs.mkdtempSync(path.join(os.tmpdir(),'howto-seo-'));temp=path.join(parent,'product');}result.controls=controls(root,path.resolve(temp));}result.status='PASS';}catch(e){result={status:'FAIL',error:e.stack};process.exitCode=1;}
 if(arg('out')){const p=path.resolve(arg('out'));fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(result,null,2)+'\n',{flag:'wx'});}console.log(JSON.stringify(result));
}
module.exports={check,controls};
