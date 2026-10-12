import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {pages}=JSON.parse(await fs.readFile(path.join(root,'workspace.json'),'utf8'));
const ids=new Set(pages.map(p=>p.id));let links=0,images=0;
if(ids.size!==pages.length)throw Error('Duplicate page IDs');
for(const p of pages){
  if(p.parent&&!ids.has(p.parent))throw Error(`Missing parent: ${p.title}`);
  const seen=new Set([p.id]);let parent=p.parent;
  while(parent){if(seen.has(parent))throw Error('Hierarchy cycle');seen.add(parent);parent=pages.find(x=>x.id===parent).parent;}
  const md=await fs.readFile(path.join(root,p.path),'utf8');
  for(const m of md.matchAll(/(!?\[[^\]\n]*\]\()([^\s\n]+)(\))/g)){
    const target=m[2].split('#')[0];if(!target||/^[a-z]+:/i.test(target))continue;
    const full=path.resolve(root,path.dirname(p.path),decodeURIComponent(target));
    if(!full.startsWith(root+path.sep))throw Error('Link escapes repository');
    await fs.access(full);links++;if(m[1].startsWith('!'))images++;
  }
}
const html=await fs.readFile(path.join(root,'index.html'),'utf8');
if(html.includes('/* WORKSPACE_DATA */'))throw Error('Reader is not built');
const built=JSON.parse(html.match(/const pages=(.*);\nconst byId/)[1]);
if(built.length!==pages.length)throw Error('Reader page count differs from the manifest');
for(const p of built){
  if(p.layout==='task1'){
    const source=await fs.readFile(path.join(root,p.path),'utf8');
    const expected=(source.match(/^## (?:Model\s*(?:answer|\d+)|My attempt\s*\d*)$/gim)||[]).length;
    const rows=(p.html.match(/class="practice-row/g)||[]).length;
    const charts=(p.html.match(/class="task-visual"/g)||[]).length;
    if(!expected||rows!==expected||charts!==rows)throw Error('Writing/chart pairing failed: '+p.title);
  }
  if(p.layout==='task2'&&(!p.html.includes('writing-panel model')||!p.html.includes('writing-panel attempt')))
    throw Error('Missing model or attempt column: '+p.title);
}
console.log(`Verified ${pages.length} pages, ${links} local links and ${images} image references.`);
