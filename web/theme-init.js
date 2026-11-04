(function(){
 'use strict';
 const key='ruanshizi-theme-v1';let theme='dark';
 try{if(localStorage.getItem(key)==='light')theme='light';}catch{}
 const apply=()=>{document.documentElement.dataset.theme=theme;const button=document.getElementById('theme-toggle');if(!button)return;const light=theme==='light';button.setAttribute('aria-label',light?'当前日间模式，切换到深色模式':'当前深色模式，切换到日间模式');button.setAttribute('aria-pressed',String(light));button.title=light?'切换到深色模式':'切换到日间模式';button.querySelector('[aria-hidden]').textContent=light?'☾':'☀';button.querySelector('.theme-toggle-label').textContent=light?'深色模式':'日间模式';};
 apply();document.addEventListener('DOMContentLoaded',()=>{apply();const button=document.getElementById('theme-toggle');button.addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';try{localStorage.setItem(key,theme);}catch{}apply();});});
})();
