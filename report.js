/* PDF local sem dependências: páginas A4, quebra de linhas e fonte WinAnsi. */
(function(root){
 const colors={pendente:'0.57 0.25 0.05',andamento:'0.11 0.31 0.85',concluida:'0.02 0.47 0.34'};
 function hex(text){return Array.from(String(text).normalize('NFC'),char=>{const code=char.codePointAt(0);return (code<=255?code:63).toString(16).padStart(2,'0');}).join('');}
 function wrap(text,width=52){const lines=[];String(text).split(/\r?\n/).forEach(paragraph=>{let line='';for(const word of paragraph.split(/\s+/)){if(!word)continue;let rest=word;if(line && line.length+rest.length+1>width){lines.push(line);line='';}while(rest.length>width){if(line){lines.push(line);line='';}lines.push(rest.slice(0,width));rest=rest.slice(width);}line+=(line?' ':'')+rest;}lines.push(line);});return lines;}
 function createPDF(tasks,date=new Date()){
  const labels={pendente:'Pendente',andamento:'Em andamento',concluida:'Concluída'};
  const pages=[[]];let page=pages[0];
  function add(text,color='0.18 0.23 0.3'){for(const line of wrap(text)){if(page.length>=43){page=[];pages.push(page);}page.push({text:line,color});}}
  const completed=tasks.filter(t=>t.status==='concluida').length;
  add(`Total: ${tasks.length} | Concluídas: ${completed} | Em aberto: ${tasks.length-completed}`);
  add('');
  if(!tasks.length)add('Nenhuma tarefa cadastrada.');
  tasks.forEach((task,i)=>{add(`${i+1}. ${task.title}`,'0.05 0.15 0.3');add(`Status: ${labels[task.status]||task.status} | Prioridade: ${task.priority==='alta'?'Alta':'Normal'}`,colors[task.status]||'0 0 0');add(`Solicitante: ${task.requester||'Não informado'}`);add(`Prazo: ${task.due?task.due.split('-').reverse().join('/'):'Sem prazo'}`);add(`Descrição: ${task.description||'Sem descrição'}`);add('');});
  const objects=[];const set=(id,value)=>objects[id]=value;
  set(1,'<< /Type /Catalog /Pages 2 0 R >>');
  set(2,`<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_,i)=>`${4+i*2} 0 R`).join(' ')}] >>`);
  set(3,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  pages.forEach((lines,i)=>{
   const text=(value,x,y,size=10,color='0.18 0.23 0.3')=>`BT /F1 ${size} Tf ${color} rg 1 0 0 1 ${x} ${y} Tm <${hex(value)}> Tj ET\n`;
   let content=text('TaskFlow | Relatório de tarefas',40,792,19,'0.11 0.31 0.85');
   content+=text(`Gerado em ${date.toLocaleString('pt-BR')} | Todas as tarefas`,40,768,9);
   content+='0.85 0.88 0.93 RG 40 752 m 555 752 l S\n';
   lines.forEach((line,j)=>content+=text(line.text,40,731-j*15,10,line.color));
   content+=text(`Página ${i+1} de ${pages.length} | Relatório local`,40,40,9);
   const id=4+i*2;
   set(id,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${id+1} 0 R >>`);
   set(id+1,`<< /Length ${content.length} >>\nstream\n${content}endstream`);
  });
  let pdf='%PDF-1.4\n';const offsets=[0];
  for(let id=1;id<objects.length;id++){offsets[id]=pdf.length;pdf+=`${id} 0 obj\n${objects[id]}\nendobj\n`;}
  const xref=pdf.length;pdf+=`xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for(let id=1;id<objects.length;id++)pdf+=`${String(offsets[id]).padStart(10,'0')} 00000 n \n`;
  pdf+=`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
 }
 function download(tasks){const bytes=createPDF(tasks);const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));const a=document.createElement('a');a.href=url;a.download=`taskflow-relatorio-${new Date().toLocaleDateString('sv-SE')}.pdf`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
 const api={createPDF,download};if(typeof module!=='undefined')module.exports=api;else root.TaskFlowReport=api;
})(typeof window!=='undefined'?window:globalThis);

