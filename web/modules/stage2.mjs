import {renderSynthesis} from './synthesis.mjs';
import {renderSynthesisTree} from './synthesis-tree.mjs';
export function initStage2({show,run}){
 let epoch=0;const entries=[['synthesis','真题题库',renderSynthesis],['synthesis-tree','知识树',renderSynthesisTree]],buttons=[],views=[];
 for(const [key,title,render] of entries){const button=document.querySelector('#open-stage2-'+key);buttons.push(button);const view=document.createElement('section');view.id='stage2-'+key;view.hidden=true;view.innerHTML=`<div class="view-title"><div><p class="page-eyebrow">学习资料</p><h1>${title}</h1></div><button class="secondary" data-stage2-home>返回首页</button></div><div data-body></div>`;document.querySelector('main').append(view);views.push(view);view.querySelector('[data-stage2-home]').onclick=()=>document.querySelector('#brand-home').click();button.onclick=()=>run(async()=>{const request=++epoch;show(view.id);await render({body:view.querySelector('[data-body]'),run,isCurrent:()=>request===epoch});});}
 return {setUser(user){for(const b of buttons)b.hidden=!user;},reset(){epoch++;buttons.forEach(b=>b.hidden=true);views.forEach(v=>v.querySelector('[data-body]').replaceChildren());}};
}
