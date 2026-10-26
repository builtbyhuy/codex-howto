'use strict';
// Deterministic home metadata and canonical sitemap, without changing lessons.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
(async()=>{
 const {siteMeta:s}=await import('../assets/atelier/site-meta.mjs');
 const lessons=['a','b','c'].flatMap(p=>JSON.parse(fs.readFileSync(path.join(root,'content/part-'+p+'.json')))).flatMap(m=>m.lessons);
 assert.equal(lessons.length,60);assert.equal(new Set(lessons.map(l=>l.id)).size,60);
 let home=fs.readFileSync(path.join(root,'index.html'),'utf8');const before=home;
 const replace=(pattern,value)=>{assert.equal([...home.matchAll(pattern)].length,1,'Exactly one authored metadata slot: '+pattern);home=home.replace(pattern,()=>value);};
 replace(/<title>[\s\S]*?<\/title>/g,'<title>'+escape(s.title)+'</title>');
 for(const [kind,name,value]of [['name','description',s.description],['property','og:title',s.title],['property','og:description',s.description]])replace(new RegExp('<meta '+kind+'="'+name+'" content="[^"]*">','g'),'<meta '+kind+'="'+name+'" content="'+escape(value)+'">');
 const token=/<meta name="google-site-verification" content="[^"]*"\s*\/?\s*>/g;
 const count=[...home.matchAll(token)].length;assert.ok(count<=1,'Duplicate Google verification tags');
 if(s.verification){const tag='<meta name="google-site-verification" content="'+escape(s.verification)+'">';if(count)replace(token,tag);else{assert.equal((home.match(/<\/head>/g)||[]).length,1);home=home.replace('</head>',()=>tag+'\n</head>');}}
 const urls=[s.origin,s.origin+'assets/reading/index.html',...lessons.map(l=>s.origin+'assets/reading/'+l.id+'.html')];
 for(const u of urls){const file=u===s.origin?'index.html':u.slice(s.origin.length);assert.ok(fs.statSync(path.join(root,file)).isFile(),'Sitemap destination exists: '+file);}
 const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>'  <url><loc>'+escape(u)+'</loc></url>').join('\n')+'\n</urlset>\n';
 if(process.argv.includes('--check')){assert.equal(before,home,'Home metadata needs regeneration');assert.equal(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8'),xml,'Canonical sitemap needs regeneration');}
 else{if(before!==home)fs.writeFileSync(path.join(root,'index.html'),home);fs.writeFileSync(path.join(root,'sitemap.xml'),xml);}
 console.log(JSON.stringify({status:'PASS',mode:process.argv.includes('--check')?'check':'build',sitemapURLs:urls.length,origin:s.origin,lastmod:'Omitted: no invented modification dates',verificationTag:!!s.verification}));
})().catch(e=>{console.error(e);process.exitCode=1;});
