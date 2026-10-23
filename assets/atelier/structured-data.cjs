'use strict';
// Only inline, inert JSON-LD is permitted in static reading documents.
const assert=require('node:assert/strict');
function withoutJSONLD(html){
 const stripped=html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi,(_,attrs,body)=>{
  assert.match(attrs,/^\s+type\s*=\s*(?:"application\/ld\+json"|'application\/ld\+json')\s*$/i,'Static scripts must have only an inert JSON-LD type; src and other attributes are forbidden');
  const value=JSON.parse(body);assert.ok(value&&typeof value==='object'&&!Array.isArray(value),'JSON-LD must be an object');return '';
 });
 assert.ok(!/<script\b/i.test(stripped),'Unclosed or executable static script');return stripped;
}
module.exports={withoutJSONLD};
