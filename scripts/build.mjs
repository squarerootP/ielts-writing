import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {studyLayout} from './study-layout.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {marked}=await import('./vendor/marked.mjs');
const workspace=JSON.parse(await fs.readFile(path.join(root,'workspace.json'),'utf8'));
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pageByPath=new Map(workspace.pages.map(p=>[p.path,p]));
const safeURL=url=>!/^\s*(?:javascript|data|vbscript):/i.test(url);
const pages=[];
for(const p of workspace.pages){
  const markdown=await fs.readFile(path.join(root,p.path),'utf8');
  const renderer=new marked.Renderer();
  renderer.html=({text})=>/^\s*<\/?aside>\s*$/.test(text)?text.replace(/aside/g,'blockquote'):escape(text);
  const urlFor=url=>{
    if(!safeURL(url)) return '#';
    if(/^[a-z]+:/i.test(url)||url.startsWith('#')) return url;
    const [target,fragment]=url.split('#');
    const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(p.path),decodeURIComponent(target)));
    if(pageByPath.has(resolved))return '#page='+pageByPath.get(resolved).id+(fragment?'&section='+encodeURIComponent(fragment):'');
    return resolved+(fragment?'#'+fragment:'');
  };
  renderer.link=function({href,title,tokens}){return `<a href="${escape(urlFor(href))}"${title?` title="${escape(title)}"`:''}>${this.parser.parseInline(tokens)}</a>`;};
  renderer.image=({href,text})=>`<a class="image-link" href="${escape(urlFor(href))}" target="_blank" rel="noopener"><img loading="lazy" src="${escape(urlFor(href))}" alt="${escape(text||'Writing task chart')}"></a>`;
  const parse=content=>marked.parse(content,{renderer,gfm:true,breaks:false});
  let html=studyLayout(markdown,p,parse);
  html=html.replace(/<table>/g,'<div class="table-scroll" tabindex="0" role="region" aria-label="Scrollable notes table"><table>').replace(/<\/table>/g,'</table></div>');
  const headings=new Map();
  html=html.replace(/<h([1-6])>(.*?)<\/h\1>/gs,(_,level,title)=>{
    const base=title.replace(/<[^>]*>/g,'').toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu,'').trim().replace(/\s+/g,'-');
    const count=headings.get(base)||0;headings.set(base,count+1);
    return `<h${level} id="${escape(base+(count?'-'+count:''))}">${title}</h${level}>`;
  });
  pages.push({...p,html,search:markdown.toLowerCase()});
}
const template=await fs.readFile(path.join(root,'scripts/reader.html'),'utf8');
await fs.writeFile(path.join(root,'index.html'),template.replace('/* WORKSPACE_DATA */',JSON.stringify(pages).replace(/</g,'\\u003c')));
await fs.writeFile(path.join(root,'.nojekyll'),'');
console.log(`Built reader for ${pages.length} pages.`);
