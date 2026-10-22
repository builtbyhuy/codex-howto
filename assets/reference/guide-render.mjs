import {guideLanguages} from './home-render.mjs';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function inline(text){
 const pieces=String(text).split(/(\[[^\]]+\]\([^\s)]+\))/g);
 return pieces.map(piece=>{
  const match=/^\[([^\]]+)\]\(([^\s)]+)\)$/.exec(piece);
  if(match){const language=/^(?:\.\.\/)?(en|vi|zh|ja|uk)\/README\.md$/.exec(match[2]);if(language)return `<a href="#guide/${language[1]}">${esc(match[1])}</a>`;const course='https://codex-howto.hokhachuy1234.chatgpt.site/';if(match[2].startsWith(course)){const relative=match[2].slice(course.length)||'#';const local=relative.startsWith('#')?relative:'./'+relative;return `<a href="${esc(local)}"${local.endsWith('.zip')?' download':''}>${esc(match[1])}</a>`;}if(/^(?:https:\/\/|#guide\/)/.test(match[2]))return `<a href="${esc(match[2])}"${match[2].startsWith('https://')?' target="_blank" rel="noopener noreferrer"':''}>${esc(match[1])}</a>`;}
  return esc(piece).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
 }).join('');
}
// A deliberately small Markdown reader for the authored guide files. Raw HTML
// is always escaped; the guide never executes its code examples.
export function guideMarkdown(markdown){
 const lines=markdown.replace(/\r/g,'').split('\n');let html='',list='',paragraph=[];
 const flush=()=>{if(paragraph.length){html+=`<p>${inline(paragraph.join(' '))}</p>`;paragraph=[];}};
 const closeList=()=>{if(list){html+=`</${list}>`;list='';}};
 for(let i=0;i<lines.length;i++){
  const line=lines[i];
  if(line.startsWith('```')){flush();closeList();let code=[];while(++i<lines.length&&!lines[i].startsWith('```'))code.push(lines[i]);let text=code.join('\n');html+=`<div class="code-block"><div class="code-header"><span>Example · run in your practice folder</span><button class="copy-button" type="button" data-copy="${esc(text)}" aria-label="Copy this guide example">Copy</button></div><pre><code>${esc(text)}</code></pre></div>`;continue;}
  const heading=/^(#{1,6})\s+(.+)$/.exec(line);
  if(heading){flush();closeList();const level=Math.min(heading[1].length+1,6);html+=`<h${level}>${inline(heading[2])}</h${level}>`;continue;}
  if(/^\|/.test(line)&&i+1<lines.length&&/^\|[\s:|-]+\|$/.test(lines[i+1])){
   flush();closeList();const cells=s=>s.replace(/^\||\|$/g,'').split('|').map(x=>x.trim());html+='<div class="guide-table"><table><thead><tr>'+cells(line).map(x=>'<th scope="col">'+inline(x)+'</th>').join('')+'</tr></thead><tbody>';i++;
   while(i+1<lines.length&&/^\|/.test(lines[i+1]))html+='<tr>'+cells(lines[++i]).map(x=>'<td>'+inline(x)+'</td>').join('')+'</tr>';
   html+='</tbody></table></div>';continue;
  }
  const item=/^\s*(?:([-*])\s+|\d+[.)]\s+)(.+)$/.exec(line);
  if(item){flush();const type=item[1]?'ul':'ol';if(list!==type){closeList();list=type;html+=`<${list}>`;}html+=`<li>${inline(item[2])}</li>`;continue;}
  if(!line.trim()){flush();closeList();continue;}
  closeList();paragraph.push(line.replace(/^>\s?/,''));
 }
 flush();closeList();return html;
}
export function guidePage(lang,text){
 const name=guideLanguages.find(([code])=>code===lang)?.[1]||'English';
 return `<article class="source-page translated-guide" lang="${lang}" aria-labelledby="translated-guide-title"><a class="back-roadmap" href="#languages">← All guide languages</a><span class="eyebrow">Getting-started guide · ${name}</span><h1 id="translated-guide-title">${name}</h1><nav class="guide-language-nav" aria-label="Guide language">${guideLanguages.map(([code,label])=>`<a href="#guide/${code}" lang="${code}"${code===lang?' aria-current="page"':''}>${label}</a>`).join('')}</nav><p class="guide-scope">This getting-started guide is translated. The 60 detailed lessons, quizzes and practice files are in English.</p><div class="guide-prose">${guideMarkdown(text)}</div><a class="button button-solid" href="#lesson/s01-01">Start the first lesson · English →</a></article>`;
}
