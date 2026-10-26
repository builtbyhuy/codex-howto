'use strict';
// Narrow HTML tokenizer for authored documents, not a browser DOM/security sanitizer.
// Comments and raw-text element bodies cannot manufacture metadata elements.
const assert=require('node:assert/strict');
const entities=s=>s.replace(/&(#x[0-9a-f]+;?|#\d+;?|amp;|quot;|apos;|lt;|gt;)/gi,(_,raw)=>{const v=raw.replace(/;$/,'');return v[0]==='#'?String.fromCodePoint(parseInt(v.slice(v[1].toLowerCase()==='x'?2:1),v[1].toLowerCase()==='x'?16:10)):({amp:'&',quot:'"',apos:"'",lt:'<',gt:'>'})[v.toLowerCase()];});
function elements(html){
 const result=[];let i=0,templates=0,inHead=false;
 while(i<html.length){
  if(html.startsWith('<!--',i)){const end=html.indexOf('-->',i+4);assert.ok(end>=0,'Unclosed comment');i=end+3;continue;}
  if(html[i]!=='<'){i++;continue;}
  const closingTag=/^<\/(template|head)\s*>/i.exec(html.slice(i));
  if(closingTag){if(closingTag[1].toLowerCase()==='template')templates=Math.max(0,templates-1);else if(!templates)inHead=false;i+=closingTag[0].length;continue;}
  const start=i,match=/^<([a-z][\w:-]*)\b/i.exec(html.slice(i));
  if(!match){i++;continue;}
  const name=match[1].toLowerCase(),attrs=Object.create(null);i+=match[0].length;
  while(true){
   while(/\s/.test(html[i]||'')&&i<html.length)i++;
   if(html.startsWith('/>',i)){i+=2;break;}
   if(html[i]==='>'){i++;break;}
   const attr=/^[^\s=<>"'`/]+/.exec(html.slice(i));assert.ok(attr,'Malformed attribute');
   const key=attr[0].toLowerCase();assert.ok(!Object.hasOwn(attrs,key),'Duplicate attribute: '+key);i+=attr[0].length;
   while(i<html.length&&/\s/.test(html[i]))i++;
   let value='';
   if(html[i]==='='){
    i++;while(i<html.length&&/\s/.test(html[i]))i++;
    const quote=html[i];
    if(quote==='"'||quote==="'"){const end=html.indexOf(quote,++i);assert.ok(end>=0,'Unclosed attribute');value=html.slice(i,end);i=end+1;}
    else {const val=/^[^\s<>`"'=]+/.exec(html.slice(i));assert.ok(val,'Missing attribute value');value=val[0];i+=value.length;}
   }
   attrs[key]=entities(value);
  }
  if(name==='head'&&!templates)inHead=true;
  if(name==='body'&&!templates)inHead=false;
  const node={name,attrs,start,contentStart:i,body:'',inHead};if(!templates&&name!=='template')result.push(node);
  if(name==='template')templates++;
  if(['script','style','title','textarea','xmp','iframe','noembed','noframes'].includes(name)){
   const closing=new RegExp('</'+name+'\\s*>','ig');closing.lastIndex=i;const end=closing.exec(html);assert.ok(end,'Unclosed '+name);node.body=html.slice(i,end.index);i=closing.lastIndex;
  }else if(name==='h1'){
   const end=/<\/h1\s*>/ig;end.lastIndex=i;const close=end.exec(html);assert.ok(close,'Unclosed h1');node.body=html.slice(i,close.index).replace(/<!--[\s\S]*?-->/g,'');
  }
 }
 return result;
}
module.exports={elements,entities};
