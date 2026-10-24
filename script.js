/* Os campos permanecem no DOM ao navegar; o estado só é confirmado no final. */
const {digits,validate}=window.TaskFlowValidation;
const form=document.querySelector('#flow');
const panels=[...document.querySelectorAll('[data-step]')];
const inputs=[...form.querySelectorAll('input')];
const back=document.querySelector('#back');
const next=document.querySelector('#next');
let step=0;
const data=()=>Object.fromEntries(inputs.map(input=>[input.name,input.value]));
inputs.forEach(input=>{
  input.setAttribute('aria-describedby',`${input.id}-error${input.id==='password'?' password-hint':''}`);
  input.addEventListener('blur',()=>check(input));
  input.addEventListener('input',()=>{
    if(input.name==='cpf')input.value=digits(input.value).slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1-$2');
    if(input.name==='cep')input.value=digits(input.value).slice(0,8).replace(/(\d{5})(\d)/,'$1-$2');
    if(input.hasAttribute('aria-invalid'))check(input);
    if(input.name==='password' && document.querySelector('#confirm').value)check(document.querySelector('#confirm'));
  });
});
function check(input){
  const error=validate(input.name,input.value,data());
  document.getElementById(`${input.id}-error`).textContent=error;
  input.setAttribute('aria-invalid',String(Boolean(error)));
  return !error;
}
function render(focus=true){
  panels.forEach((panel,i)=>panel.hidden=i!==step);
  document.querySelector('#step-label').textContent=`Passo ${step+1} de 4`;
  document.querySelector('#percent').textContent=`${(step+1)*25}%`;
  document.querySelector('#progress').value=step+1;
  document.querySelectorAll('.stepper li').forEach((item,i)=>{
    item.classList.toggle('done',i<step);
    if(i===step)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
  });
  back.hidden=step===0;
  next.textContent=step===3?'Finalizar ✓':'Próximo →';
  if(step===3)renderSummary();
  if(focus)panels[step].querySelector('h2').focus();
}
function renderSummary(){
  const values=data();
  const summary=document.querySelector('#summary');
  summary.replaceChildren();
  [['Dados pessoais',0,[['Nome',values.name],['E-mail',values.email],['CPF',values.cpf]]],['Endereço',1,[['CEP',values.cep],['Rua',values.street],['Número',values.number]]],['Sua conta',2,[['Senha','Definida ••••••••']]]].forEach(([title,index,rows])=>{
    const group=document.createElement('section');group.className='summary-group';
    const header=document.createElement('header');header.textContent=title;
    const edit=document.createElement('button');edit.type='button';edit.className='edit';edit.textContent='Editar';edit.setAttribute('aria-label',`Editar ${title.toLowerCase()}`);edit.onclick=()=>{step=index;render();};header.append(edit);
    const list=document.createElement('dl');
    rows.forEach(([label,value])=>{const row=document.createElement('div');const dt=document.createElement('dt');const dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);list.append(row);});
    group.append(header,list);summary.append(group);
  });
}
back.onclick=()=>{if(step>0){step--;render();}};
form.addEventListener('submit',event=>{
  event.preventDefault();
  // Valide todos os campos da etapa antes de liberar a navegação.
  const current=step===3?inputs:[...panels[step].querySelectorAll('input')];
  const results=current.map(input=>check(input));
  if(results.includes(false)){
    const invalid=current[results.indexOf(false)];
    step=Number(invalid.closest('[data-step]').dataset.step);render(false);invalid.focus();return;
  }
  if(step<3){step++;render();return;}
  // Ponto de integração: um backend deve validar novamente e confirmar o envio.
  // Esta versão local não realiza uma requisição nem persiste dados pessoais.
  form.reset();document.querySelector('#summary').replaceChildren();form.hidden=true;
  document.querySelector('#success').hidden=false;document.querySelector('#success h2').focus();
  document.querySelector('#step-label').textContent='Fluxo concluído';
});
document.querySelector('#toggle-password').onclick=event=>{
  const show=document.querySelector('#password').type==='password';
  ['password','confirm'].forEach(id=>document.getElementById(id).type=show?'text':'password');
  event.currentTarget.textContent=show?'Ocultar':'Mostrar';event.currentTarget.setAttribute('aria-pressed',String(show));
};
document.querySelector('#restart').onclick=()=>{
  inputs.forEach(input=>{input.removeAttribute('aria-invalid');document.getElementById(`${input.id}-error`).textContent='';});
  ['password','confirm'].forEach(id=>document.getElementById(id).type='password');
  const toggle=document.querySelector('#toggle-password');toggle.textContent='Mostrar';toggle.setAttribute('aria-pressed','false');
  step=0;form.hidden=false;document.querySelector('#success').hidden=true;render();
};
document.querySelector('#year').textContent=new Date().getFullYear();
render(false);
