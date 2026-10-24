// O HTML fornecido é a estrutura visual; o estado é salvo somente neste navegador.
const $=s=>document.querySelector(s);
const cards=[...document.querySelectorAll('article')];
const stream=cards[0].parentElement;
const key='taskflow-tasks-v1';
const statuses={pendente:'Pendente',andamento:'Em andamento',concluida:'Concluída'};
let tasks=cards.map((card,i)=>({id:crypto.randomUUID(),title:card.querySelector('h3').textContent.trim(),description:card.querySelector('p')?.textContent.trim()||'',status:card.querySelector('select').value,priority:i===2?'alta':'normal',due:'',mine:true}));
let storageOK=true;
try{const saved=JSON.parse(localStorage.getItem(key));if(Array.isArray(saved)&&saved.every(t=>t&&typeof t.id==='string'&&typeof t.title==='string'&&typeof t.description==='string'&&Object.hasOwn(statuses,t.status)&&['alta','normal'].includes(t.priority)&&typeof t.due==='string'&&typeof t.mine==='boolean'))tasks=saved;}catch{storageOK=false;}
tasks=tasks.map(task=>({...task,requester:typeof task.requester==='string'?task.requester:''}));
let statusFilter='all',extraFilter='all',query='',wizardStep=0,editing=null,draft={};
const search=$('header input');search.setAttribute('aria-label','Buscar tarefas');
const mobileTools=document.createElement('div');mobileTools.className='task-tools';const searchGroup=search.parentElement.parentElement;searchGroup.className='task-search';mobileTools.append(searchGroup);const statusNav=document.querySelector('header nav');statusNav.className='task-status-nav';statusNav.setAttribute('aria-label','Filtrar por status');statusNav.querySelectorAll('a').forEach(a=>{a.className='px-3 py-1.5 rounded-lg';a.classList.toggle('filter-active',a.dataset.path==='todas');});mobileTools.append(statusNav);document.querySelector('main h1').closest('section').after(mobileTools);
const toast=$('#toast-notification');toast.hidden=true;toast.setAttribute('role','status');let timer;
function notify(message){toast.querySelector('p').textContent=message;toast.querySelector('span.font-body-sm').textContent=storageOK?'Salvo neste navegador':'Armazenamento indisponível; dados apenas nesta sessão';toast.hidden=false;clearTimeout(timer);timer=setTimeout(()=>toast.hidden=true,4000);}
toast.querySelector('button').onclick=()=>toast.hidden=true;
function save(){try{localStorage.setItem(key,JSON.stringify(tasks));storageOK=true;}catch{storageOK=false;}render();}
function el(tag,text,classes=''){const node=document.createElement(tag);node.textContent=text;node.className=classes;return node;}
function render(){
 stream.replaceChildren();
 const visible=tasks.filter(t=>(statusFilter==='all'||t.status===statusFilter)&&(!['alta','normal'].includes(extraFilter)||t.priority===extraFilter)&&(extraFilter!=='mine'||t.mine)&&`${t.title} ${t.description} ${t.requester}`.toLocaleLowerCase().includes(query));
 visible.sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999'));
 visible.forEach(task=>{
  const card=el('article','','group bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-space-md');
  card.classList.toggle('completed-task',task.status==='concluida');
  const content=el('div','','flex items-start gap-space-sm min-w-0 flex-1');
  const check=el('button',task.status==='concluida'?'✓':'○','w-8 h-8 rounded-lg bg-surface-container-low text-primary shrink-0');check.setAttribute('aria-label',`${task.status==='concluida'?'Reabrir':'Concluir'} ${task.title}`);check.setAttribute('aria-pressed',String(task.status==='concluida'));check.onclick=()=>{task.status=task.status==='concluida'?'pendente':'concluida';save();notify('Status atualizado.');};
  const body=el('div','','min-w-0');body.append(el('span',statuses[task.status],`task-badge status-${task.status}`),el('h3',task.title,'font-headline-sm text-headline-sm mt-2 break-words'),el('p',task.description,'text-on-surface-variant mt-1 break-words'),el('div',`${task.priority==='alta'?'Prioridade alta':'Prioridade normal'} · ${task.due?`Prazo: ${task.due.split('-').reverse().join('/')}`:'Sem prazo'}`,'task-meta'));const meta=body.querySelector('.task-meta');meta.replaceChildren(el('span',task.priority==='alta'?'Prioridade alta':'Prioridade normal',`priority-badge priority-${task.priority}`),document.createTextNode(` · ${task.due?`Prazo: ${task.due.split('-').reverse().join('/')}`:'Sem prazo'}`));body.append(el('div',`Solicitante: ${task.requester||'Não informado'}`,'task-meta'));content.append(check,body);
  const actions=el('div','','flex items-center gap-2 flex-wrap');const select=el('select','','bg-surface-container-low rounded-lg px-3 py-2');select.setAttribute('aria-label',`Status de ${task.title}`);Object.entries(statuses).forEach(([value,label])=>{const option=el('option',label);option.value=value;select.append(option);});select.value=task.status;select.classList.add('status-control',`status-${task.status}`);select.onchange=()=>{task.status=select.value;save();notify('Status atualizado.');};
  const edit=el('button','Editar','px-3 py-2 rounded-lg text-primary');edit.onclick=()=>openTask(task);
  const remove=el('button','Excluir','px-3 py-2 rounded-lg text-error');remove.onclick=()=>{if(confirm(`Excluir “${task.title}”? Esta ação não pode ser desfeita.`)){tasks=tasks.filter(t=>t.id!==task.id);save();notify('Tarefa excluída.');}};
  actions.append(select,edit,remove);card.append(content,actions);stream.append(card);
 });
 if(!visible.length)stream.append(el('p',tasks.length?'Nenhuma tarefa corresponde aos filtros.':'Tudo livre por aqui. Crie sua primeira tarefa.','empty-tasks'));
 updateMetrics();
 if(document.querySelector(".color-filter-panel"))syncColorFilters();
}
const metricSection=$('main section.grid');
function updateMetrics(){
 const done=tasks.filter(t=>t.status==='concluida').length,total=tasks.length,pct=total?Math.round(done/total*100):0;
 const big=metricSection.querySelector('.text-headline-xl');big.textContent=`${pct}%`;
 const count=metricSection.querySelector('.flex.items-baseline.justify-between > span');if(count)count.textContent=`${done} de ${total} tarefas finalizadas`;
 const bar=metricSection.querySelector('[style*="width"]');bar.style.width=`${pct}%`;bar.parentElement.setAttribute('role','progressbar');bar.parentElement.setAttribute('aria-label','Tarefas concluídas');bar.parentElement.setAttribute('aria-valuenow',pct);bar.parentElement.setAttribute('aria-valuemin','0');bar.parentElement.setAttribute('aria-valuemax','100');
 metricSection.querySelectorAll('.text-headline-lg').forEach((node,i)=>node.textContent=tasks.filter(t=>t.status===['pendente','andamento','concluida'][i]).length);
 metricSection.querySelector('.mt-3').replaceChildren(el('span',`${total-done} tarefas em aberto`),el('span','Dados locais'));
 const active=$('header .animate-pulse')?.nextElementSibling;if(active)active.textContent=`${total-done} ativas`;
 filterButtons[0].textContent=`Todas as Tarefas (${total})`;
}
const strip=metricSection.nextElementSibling;
const filterButtons=[...strip.querySelectorAll('button')];
filterButtons.forEach((button,i)=>button.onclick=()=>{extraFilter=['all','mine','alta'][i];filterButtons.forEach((b,j)=>b.classList.toggle('filter-active',i===j));render();});
const sort=strip.querySelector('strong');if(sort)sort.textContent='Data limite';
search.oninput=()=>{query=search.value.toLocaleLowerCase().trim();render();};
document.querySelectorAll('nav a[data-path]').forEach(link=>link.onclick=event=>{event.preventDefault();statusFilter=({todas:'all',pendentes:'pendente','em-andamento':'andamento',concluidas:'concluida'})[link.dataset.path];document.querySelectorAll('nav a').forEach(a=>{a.classList.toggle('filter-active',a===link);a.removeAttribute('aria-current');});link.setAttribute('aria-current','page');render();});
const dialog=document.createElement('dialog');dialog.id='task-dialog';dialog.setAttribute('aria-labelledby','task-title');
dialog.innerHTML=`<button type="button" class="close-modal" aria-label="Fechar">✕</button><h2 id="task-title" tabindex="-1">Nova tarefa</h2><p id="wizard-label" aria-live="polite"></p><progress class="wizard-progress" max="3" value="1" aria-label="Progresso da tarefa"></progress><ol class="wizard-steps" aria-label="Etapas da tarefa"><li>1. Detalhes</li><li>2. Organização</li><li>3. Revisão</li></ol><form novalidate><section data-panel="0"><label for="task-name">Título *</label><input id="task-name" maxlength="160" required aria-describedby="task-name-error"><small id="task-name-error" class="form-error"></small><label for="task-requester">Solicitante</label><input id="task-requester" name="requester" maxlength="120" placeholder="Nome de quem solicitou a tarefa" autocomplete="off"><label for="task-description">Descrição</label><textarea id="task-description" maxlength="2000"></textarea></section><section data-panel="1" hidden><label for="task-status">Status</label><select id="task-status"><option value="pendente">Pendente</option><option value="andamento">Em andamento</option><option value="concluida">Concluída</option></select><label for="task-priority">Prioridade</label><select id="task-priority"><option value="normal">Normal</option><option value="alta">Alta</option></select><label for="task-due">Data limite (opcional)</label><input id="task-due" type="date" aria-describedby="task-due-error"><small id="task-due-error" class="form-error"></small></section><section data-panel="2" hidden><h3>Confira antes de salvar</h3><div id="task-review"></div></section><div class="modal-actions"><button type="button" id="task-back">Voltar</button><button class="modal-primary" type="submit" id="task-next">Próximo →</button></div></form>`;
document.body.append(dialog);
const field=id=>dialog.querySelector(id);
function openTask(task=null,title=''){
 editing=task?.id||null;draft=task?{...task}:{title,requester:'',description:'',status:'pendente',priority:'normal',due:'',mine:true};wizardStep=0;
 field('form').reset();field('#task-name').value=draft.title;field('#task-requester').value=draft.requester||'';field('#task-description').value=draft.description;field('#task-status').value=draft.status;field('#task-priority').value=draft.priority;field('#task-due').value=draft.due;field('#task-title').textContent=editing?'Editar tarefa':'Nova tarefa';dialog.querySelectorAll('.form-error').forEach(n=>n.textContent='');field('#task-name').removeAttribute('aria-invalid');showStep();dialog.showModal();field('#task-name').focus();
}
// O rascunho fica em memória; save() só é chamado na confirmação final.
function collect(){Object.assign(draft,{title:field('#task-name').value.trim(),requester:field('#task-requester').value.trim(),description:field('#task-description').value.trim(),status:field('#task-status').value,priority:field('#task-priority').value,due:field('#task-due').value});}
// Ocultar etapas preserva seus campos; voltar nunca exige validação.
function updateDraftColors(){field('#task-status').dataset.status=field('#task-status').value;field('#task-priority').dataset.priority=field('#task-priority').value;}
field('#task-status').addEventListener('change',updateDraftColors);field('#task-priority').addEventListener('change',updateDraftColors);
function showStep(){updateDraftColors();dialog.querySelectorAll('[data-panel]').forEach((node,i)=>node.hidden=i!==wizardStep);field('#wizard-label').textContent=`Passo ${wizardStep+1} de 3 · ${['Detalhes','Organização','Revisão'][wizardStep]}`;field('progress').value=wizardStep+1;dialog.querySelectorAll('.wizard-steps li').forEach((item,i)=>{item.classList.toggle('done',i<wizardStep);if(i===wizardStep)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');});field('#task-back').hidden=wizardStep===0;field('#task-next').textContent=wizardStep===2?'Finalizar':'Próximo →';if(wizardStep===2){const review=field('#task-review');review.replaceChildren();[draft.title,draft.description||'Sem descrição',statuses[draft.status],`Prioridade ${draft.priority}`,draft.due||'Sem prazo'].forEach((text,index)=>{const row=el('p',text);if(index===2||index===3){row.textContent='';row.append(el('span',text,index===2?`task-badge status-${draft.status}`:`priority-badge priority-${draft.priority}`));}review.append(row);});review.append(el('p',`Solicitante: ${draft.requester||'Não informado'}`));}}
field('.close-modal').onclick=()=>dialog.close();field('#task-back').onclick=()=>{collect();wizardStep--;showStep();field('#task-title').focus();};
field('form').onsubmit=event=>{event.preventDefault();collect();if(!draft.title){wizardStep=0;showStep();field('#task-name-error').textContent='Informe o título da tarefa.';field('#task-name').setAttribute('aria-invalid','true');field('#task-name').focus();return;}field('#task-name-error').textContent='';field('#task-name').removeAttribute('aria-invalid');if(!field('#task-due').validity.valid){wizardStep=1;showStep();field('#task-due-error').textContent='Informe uma data válida.';field('#task-due').focus();return;}field('#task-due-error').textContent='';if(wizardStep<2){wizardStep++;showStep();field('#task-title').focus();return;}if(editing)tasks=tasks.map(t=>t.id===editing?{...draft,id:editing}:t);else tasks.push({...draft,id:crypto.randomUUID()});save();dialog.close();notify(editing?'Tarefa atualizada.':'Tarefa criada.');};
document.querySelectorAll('button').forEach(button=>{if(button.textContent.includes('Nova Tarefa'))button.onclick=()=>openTask();if(button.textContent.includes('Filtrar'))button.onclick=()=>{statusFilter='all';extraFilter=extraFilter==='alta'?'all':'alta';filterButtons.forEach((b,i)=>b.classList.toggle('filter-active',i===(extraFilter==='alta'?2:0)));render();notify(extraFilter==='alta'?'Filtro: prioridade alta.':'Exibindo todas as prioridades.');};});
const quick=$('input[placeholder="Nome da nova tarefa rápida..."]');quick.setAttribute('aria-label','Título da tarefa rápida');quick.maxLength=160;const add=quick.nextElementSibling;add.onclick=()=>{openTask(null,quick.value.trim());quick.value='';};quick.onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();add.click();}};
const banner=$('main aside');banner.querySelector('h4').textContent='Seu progresso, em um só lugar';banner.querySelector('p').textContent='Acompanhe os números reais do seu painel e mantenha o foco na próxima entrega.';banner.querySelector('button').onclick=()=>{const complete=tasks.filter(t=>t.status==='concluida').length;notify(`${tasks.length} tarefas · ${complete} concluídas · ${tasks.length-complete} em aberto.`);};
metricSection.querySelector('.bg-primary-fixed')?.remove();
const link=el('a','Configurar minha conta →','local-link');link.href='cadastro.html';$('main h1').parentElement.append(link);
document.addEventListener('keydown',event=>{if(dialog.open||event.ctrlKey||event.metaKey||event.altKey||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;if(event.key.toLowerCase()==='n'){event.preventDefault();openTask();}if(event.key==='/'){event.preventDefault();search.focus();}if(event.key==='Escape'){query='';search.value='';statusFilter='all';extraFilter='all';filterButtons.forEach(b=>b.classList.remove('filter-active'));document.querySelectorAll('nav a').forEach(a=>{a.classList.remove('filter-active');a.removeAttribute('aria-current');});render();}});
render();




// Link de teste que abre diretamente o formulário centralizado.
if(new URLSearchParams(location.search).get('nova')==='1')openTask();

// Relatório inclui todas as tarefas salvas, sem transmitir dados para um servidor.
const pdfButton=el('button','Gerar relatório em PDF','pdf-report-button');pdfButton.type='button';pdfButton.onclick=()=>{try{window.TaskFlowReport.download(tasks);notify('PDF gerado. Verifique os downloads do navegador.');}catch{notify('Não foi possível gerar o PDF. Tente novamente.');}};mobileTools.append(pdfButton);

// Filtros semânticos: status e prioridade podem ser combinados.
const colorFilters=el('section','','color-filter-panel');colorFilters.setAttribute('aria-label','Filtrar tarefas por status e prioridade');
const statusChoices=[['all','Todos os status'],['pendente','Pendente'],['andamento','Em andamento'],['concluida','Concluída']];
const priorityChoices=[['all','Todas as prioridades'],['alta','Alta'],['normal','Normal']];
function filterGroup(title,choices,kind){
 const group=el('div','','color-filter-group');group.append(el('span',title,'filter-label'));
 const controls=el('div','','color-filter-options');controls.setAttribute('role','group');controls.setAttribute('aria-label',title);
 choices.forEach(([value,label])=>{const button=el('button',label,'color-filter '+(value==='all'?'filter-neutral':kind+'-'+value));button.type='button';button.dataset.filterKind=kind;button.dataset.filterValue=value;button.onclick=()=>{if(kind==='status')statusFilter=value;else extraFilter=value;render();};controls.append(button);});group.append(controls);return group;
}
colorFilters.append(filterGroup('Status',statusChoices,'status'),filterGroup('Prioridade',priorityChoices,'priority'));
const clearFilters=el('button','Limpar filtros','clear-color-filters');clearFilters.type='button';clearFilters.onclick=()=>{statusFilter='all';extraFilter='all';query='';search.value='';render();};colorFilters.append(clearFilters);mobileTools.after(colorFilters);
function syncColorFilters(){
 document.querySelectorAll('[data-filter-kind]').forEach(button=>{const active=button.dataset.filterValue===(button.dataset.filterKind==='status'?statusFilter:extraFilter);button.setAttribute('aria-pressed',String(active));});
 document.querySelectorAll('nav a[data-path]').forEach(link=>{const active=({todas:'all',pendentes:'pendente','em-andamento':'andamento',concluidas:'concluida'})[link.dataset.path]===statusFilter;link.classList.toggle('filter-active',active);if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
 filterButtons.forEach((button,i)=>button.classList.toggle('filter-active',['all','mine','alta'][i]===extraFilter));
}
syncColorFilters();
