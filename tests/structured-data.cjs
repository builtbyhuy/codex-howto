'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const origin='https://builtbyhuy.github.io/codex-howto/';
const {elements,entities}=require('./html-elements.cjs');
const decode=s=>s.replace(/<[^>]+>/g,'').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
function check(root){
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const {withoutJSONLD}=require(path.join(root,'assets/atelier/structured-data.cjs'));
 const lessons=['a','b','c'].flatMap(p=>JSON.parse(read('content/part-'+p+'.json'))).flatMap(m=>m.lessons);
 assert.equal(lessons.length,60);assert.equal(new Set(lessons.map(l=>l.id)).size,60);
 const inventory=['index.html',...lessons.map(l=>l.id+'.html')];
 assert.deepEqual(fs.readdirSync(path.join(root,'assets/reading')).filter(f=>f.endsWith('.html')).sort(),inventory.slice().sort());
 const json=html=>{const blocks=elements(html).filter(n=>n.name==='script'&&n.attrs.type?.toLowerCase()==='application/ld+json');assert.equal(blocks.length,1,'Exactly one JSON-LD block');assert.deepEqual(Object.keys(blocks[0].attrs),['type']);return JSON.parse(blocks[0].body);};
 const canonical=html=>{const links=elements(html).filter(n=>n.name==='link'&&n.attrs.rel?.toLowerCase().split(/\s+/).includes('canonical'));assert.equal(links.length,1,'One self canonical');assert.ok(links[0].inHead,'Canonical must be in head');return links[0].attrs.href;};
 const text=(nodes,name)=>{const found=nodes.filter(n=>n.name===name);assert.equal(found.length,1,'One actual '+name);return decode(found[0].body);};
 const home=read('index.html');
 const homeNodes=elements(home),descriptions=homeNodes.filter(n=>n.name==='meta'&&n.inHead&&n.attrs.name==='description');
 assert.equal(descriptions.length,1,'One authored home description');
 const language=homeNodes.find(n=>n.name==='html')?.attrs.lang;assert.ok(language,'Authored home language');
 assert.deepEqual(json(home),{'@context':'https://schema.org','@type':'WebSite','@id':origin+'#website',name:'Howto codex',url:origin,inLanguage:language,description:entities(descriptions[0].attrs.content)});assert.equal(canonical(home),origin);
 for(const filename of inventory){
  const html=read('assets/reading/'+filename),isIndex=filename==='index.html';
  const lesson=lessons.find(l=>l.id+'.html'===filename);
  const plain=withoutJSONLD(html);assert.ok(!/<(?:script|form|button)\b|<[a-z][^>]*\son[a-z]+\s*=/i.test(plain),'Static executable controls');
  const url=origin+'assets/reading/'+filename;assert.equal(canonical(html),url);
  const nodes=elements(html),title=text(nodes,'title');
  assert.ok(nodes.find(n=>n.name==='title').inHead,'Title must be in head');
  assert.ok(!nodes.some(n=>Object.hasOwn(n.attrs,'srcdoc')),'Static srcdoc is executable content');
  for(const node of nodes)for(const [key,value]of Object.entries(node.attrs))if(['href','src','action','formaction','xlink:href'].includes(key))assert.ok(!/^(?:javascript|vbscript|data):/i.test(entities(value).replace(/[\u0000-\u0020]/g,'')),'Executable URL');
  const name=isIndex?'Reading curriculum':lesson.title;
  assert.equal(title,name+' — Howto codex');
  if(!isIndex)assert.equal(text(nodes,'h1'),name,'Visible lesson title');
  else assert.ok(html.includes('Reading curriculum'),'Visible curriculum label');
  const items=[{name:'Howto codex',item:origin},{name:'Reading curriculum',item:origin+'assets/reading/index.html'}];
  if(!isIndex)items.push({name,item:url});
  const data=json(html);assert.deepEqual(Object.keys(data).sort(),['@context','@type','@id','itemListElement'].sort());assert.equal(data['@context'],'https://schema.org');assert.equal(data['@type'],'BreadcrumbList');assert.equal(data['@id'],url+'#breadcrumb','Stable canonical breadcrumb identity');assert.equal(data.itemListElement.length,items.length);
  data.itemListElement.forEach((entry,i)=>{
   const expected={'@type':'ListItem',position:i+1,...items[i]};
   // Google permits the final item URL to be omitted.
   if(i===items.length-1&&!Object.hasOwn(entry,'item'))delete expected.item;
   assert.deepEqual(entry,expected,'Breadcrumb relationship/title/position');
   if(entry.item){const u=new URL(entry.item);assert.equal(u.protocol,'https:');assert.equal(u.origin,new URL(origin).origin);assert.equal(u.search+u.hash,'');const file=u.pathname===new URL(origin).pathname?'index.html':u.pathname.slice(new URL(origin).pathname.length);assert.ok(fs.statSync(path.join(root,file)).isFile(),'Breadcrumb delivered destination');}
  });
 }
 return {status:'PASS',readingPages:61,homeWebSites:1};
}
if(require.main===module){try{console.log(JSON.stringify(check(path.resolve(process.argv[2]||path.join(__dirname,'..')))));}catch(e){console.error(e.stack);process.exitCode=1;}}
module.exports={check};
