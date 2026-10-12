import {marked} from './vendor/marked.mjs';

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isWritingHeading=t=>t.type==='heading'&&t.depth===2&&/^(?:Model\s*(?:answer|\d+)|My attempt\s*\d*)$/i.test(t.text);
const isImage=t=>t.type==='paragraph'&&t.tokens?.some(x=>x.type==='image');
const clean=tokens=>tokens.filter(t=>t.type!=='space'&&t.type!=='hr');
const textOf=tokens=>tokens.map(t=>t.raw.trimEnd()).join('\n\n')+'\n';

export function studyLayout(markdown,page,parse){
  if(!page.layout)return parse(markdown);
  const tokens=marked.lexer(markdown,{gfm:true});
  const first=tokens.findIndex(isWritingHeading);
  if(first<0)return parse(markdown);
  const title=tokens.find(t=>t.type==='heading'&&t.depth===1);
  const intro=clean(tokens.slice(0,first).filter(t=>t!==title&&!isImage(t)));
  const introParagraphs=new Set(intro.filter(t=>t.type==='paragraph').map(t=>t.raw.trim()));
  const chart=tokens.find(isImage);
  const sections=[];
  for(let i=first;i<tokens.length;i++){
    const t=tokens[i];
    if(isWritingHeading(t))sections.push({title:t.text,tokens:[]});
    else if(sections.length)sections.at(-1).tokens.push(t);
  }
  const notes=[];
  const writing=sections.map(section=>{
    const content=clean(section.tokens.filter(t=>!isImage(t)&&!introParagraphs.has(t.raw.trim())));
    const noteStart=content.findIndex(t=>t.type==='heading'&&t.depth>=3);
    const body=noteStart<0?content:content.slice(0,noteStart);
    if(noteStart>=0)notes.push({title:section.title,tokens:content.slice(noteStart)});
    return {...section,body,html:body.length?parse(textOf(body)):'<p class="empty-attempt">No attempt added yet.</p>'};
  });
  let html=(title?parse(title.raw):'')+
    (intro.length?`<div class="task-prompt"><span class="eyebrow">Writing task</span>${parse(textOf(intro))}</div>`:'');
  if(page.layout==='task1'&&chart){
    html+='<div class="task-one">'+writing.map((section,i)=>{
      const label=esc(section.title);
      return `<section class="practice-row${i%2?' reversed':''}" aria-label="${label}"><figure class="task-visual"><div class="visual-sticky">${parse(chart.raw)}<figcaption>Original task · select the image to enlarge</figcaption></div></figure><div class="writing-panel"><div class="panel-heading"><span class="eyebrow">${/^My attempt/i.test(section.title)?'My writing':'Reference writing'}</span><h2>${label}</h2></div><div class="writing-body">${section.html}</div></div></section>`;
    }).join('')+'</div>';
  }else{
    const models=writing.filter(s=>/^Model/i.test(s.title));
    const attempts=writing.filter(s=>/^My attempt/i.test(s.title));
    const panel=(s,kind)=>`<section class="writing-panel ${kind}" aria-label="${esc(s.title)}"><div class="panel-heading"><span class="eyebrow">${kind==='model'?'Reference writing':'My writing'}</span><h2>${esc(s.title)}</h2></div><div class="writing-body">${s.html}</div></section>`;
    html+='<div class="essay-comparison">'+models.map(s=>panel(s,'model')).join('')+attempts.map(s=>panel(s,'attempt')).join('')+'</div>';
  }
  if(notes.length)html+='<section class="learning-section"><span class="eyebrow">Revisit the language</span><h2>Phrase banks & notes</h2>'+notes.map(n=>`<details class="learning-notes"><summary>${esc(n.title)} <span>Language notes</span></summary><div class="learning-content">${parse(textOf(n.tokens))}</div></details>`).join('')+'</section>';
  return html;
}
