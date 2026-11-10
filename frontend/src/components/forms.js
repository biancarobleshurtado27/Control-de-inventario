import {$,status} from './ui.js';
import {api} from '../services/api.js';
export function errores(form,campos={}){
 form.querySelectorAll('.field-error').forEach(e=>e.remove());
 for(const e of form.elements){e.removeAttribute('aria-invalid');e.removeAttribute('aria-describedby');}
 for(const [key,message]of Object.entries(campos)){
  const name=key.replace(/^detalles\.0\./,'');
  const input=[...form.elements].find(e=>e.name===name&&!e.disabled);if(!input)continue;
  const note=document.createElement('small');note.className='field-error';note.id=form.id+'-'+name+'-error';note.textContent=message;input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby',note.id);input.closest('label').append(note);
 }
 form.querySelector('[aria-invalid]')?.focus();
}
export function preparar(form){form.noValidate=true;form.addEventListener('input',()=>errores(form));form.addEventListener('reset',()=>errores(form));}
export function validar(form){const campos={};for(const e of form.elements)if(!e.disabled&&e.willValidate&&!e.validity.valid)campos[e.name]=e.validationMessage;errores(form,campos);return !Object.keys(campos).length;}
export function confirmar(form,title='Confirmar registro'){
 return new Promise(resolve=>{
  const trigger=document.activeElement;const dialog=document.createElement('dialog');dialog.className='confirm-dialog';dialog.setAttribute('aria-labelledby','confirm-title');
  const heading=document.createElement('h2');heading.id='confirm-title';heading.textContent=title;
  const note=document.createElement('p');note.textContent='Revisa los datos antes de guardar.';const list=document.createElement('dl');
  for(const e of form.elements){if(!e.name||e.disabled||!e.value||e.type==='hidden')continue;const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=e.closest('label')?.childNodes[0]?.textContent.trim()||e.name;dd.textContent=e.tagName==='SELECT'?e.selectedOptions[0]?.textContent:e.value;list.append(dt,dd);}
  const actions=document.createElement('div');actions.className='form-action';const cancel=document.createElement('button'),save=document.createElement('button');cancel.type=save.type='button';cancel.className='secondary';cancel.textContent='Volver a editar';save.textContent='Confirmar y guardar';save.dataset.confirm='true';
  const finish=value=>{dialog.remove();trigger?.focus();resolve(value);};cancel.onclick=()=>finish(false);save.onclick=()=>finish(true);dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false);});actions.append(cancel,save);dialog.append(heading,note,list,actions);document.body.append(dialog);dialog.showModal();cancel.focus();
 });
}
export function submit(selector,path,numeric,refresh,afterReset=()=>{},config={}){
 const form=$(selector);preparar(form);
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(form.dataset.busy||!validar(form))return;
  const button=form.querySelector('button:not([type="reset"]):not([type="button"])');form.dataset.busy='true';button.disabled=true;
  try{
   if(!await confirmar(form,config.title?.()||'Confirmar registro'))return;
   let data=Object.fromEntries(new FormData(form));numeric.forEach(k=>{if(k in data)data[k]=data[k]===''?null:Number(data[k]);});if(config.transform)data=config.transform(data);
   await api(typeof path==='function'?path():path,{method:config.method?.()||'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
   form.reset();afterReset();await refresh();status('Registro guardado correctamente.');
  }catch(error){errores(form,error.campos);status(error.message,true);}finally{delete form.dataset.busy;button.disabled=false;}
 });
}
