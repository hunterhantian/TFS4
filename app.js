const questions = [
  [1,"Pourquoi la femme a-t-elle l'air soucieux ?",["Parce qu'elle a des soucis familiaux.","Parce qu'elle a des soucis d'argent.","Parce qu'elle a des problèmes de santé."],"B"],
  [2,"Laquelle des affirmations suivantes est vraie ?",["Il n'y a pas de fleuriste dans le quartier.","Le fleuriste ferme dans 5 minutes.","Le fleuriste est tout près."],"C"],
  [3,"Quel temps fait-il ?",["Il fait froid.","Il fait chaud.","Il gèle."],"A"],
  [4,"Où se déroule le dialogue probablement ?",["En Chine.","À la tour Eiffel.","À la poste."],"C"],
  [5,"Pourquoi Stéphane demande-t-il à voir madame Leclerc ?",["Pour changer les dates de ses vacances.","Pour annuler ses vacances.","Pour prolonger ses vacances."],"A"],
  [6,"Que conseille la pharmacienne ?",["D'aller voir un médecin.","De prendre des médicaments.","De se reposer."],"B"],
  [7,"Laquelle des affirmations suivantes est vraie ?",["L'homme sera présent à la fête organisée par Paul.","L'homme a prévu de partir voir sa grand-mère.","L'homme a pris un billet de train pour partir dimanche."],"B"],
  [8,"Où travaille la femme ?",["À Paris.","À Rouen.","Aux États-Unis."],"A"],
  [9,"Que fera la femme probablement ?",["Elle fera un échange pour la taille plus petite.","Elle achètera un autre modèle.","Elle se fera rembourser."],"C"],
  [10,"Qu'est-ce que le mari pense du TGV ?",["Il pense que le TGV ne mérite pas sa réputation.","Il pense que c'est un miracle.","Il pense que c'est l'invention du siècle."],"A"],
  [11,"De quoi parle le livre de Marie ?",["De son enfance.","De son travail à Paris.","De son voyage en Asie."],"C"],
  [12,"Dans quel pays asiatique Marie a-t-elle trouvé le plus d'inspiration ?",["Au Vietnam.","Au Népal.","En Inde."],"A"],
  [13,"Quelle difficulté Marie a-t-elle rencontrée au Népal ?",["Elle s'est perdue.","Elle s'est fait voler ses bagages.","Elle a été malade."],"C"],
  [14,"Comment Marie trouvait-elle la mésaventure au Népal ?",["Elle la trouvait décourageante.","Elle la trouvait douloureuse.","Elle la considérait comme une opportunité de créativité."],"C"],
  [15,"Qui l'a soutenue dans son projet d'écriture ?",["Sa famille et ses amis.","Son éditeur.","Ses collègues."],"A"],
  [16,"Qu'est-ce que Marie a reçu comme formation ?",["Elle a suivi un cours de littérature à Paris.","Elle a suivi un atelier d'écriture à Paris.","Elle a suivi un atelier de création littéraire."],"B"],
  [17,"Qu'est-ce qui a donné envie à Marie d'entreprendre son voyage ?",["La formation sur le récit de voyage.","La formation sur l'écriture romantique.","La formation d'agents de voyages."],"A"],
  [18,"Quelle sera la prochaine destination de Marie ?",["L'Europe.","L'Amérique.","L'Afrique."],"C"],
  [19,"Comment Marie s'organise-t-elle pour écrire pendant ses voyages ?",["Elle écrit quand elle est inspirée.","Elle écrit chaque soir.","Elle écrit à la fin du voyage."],"B"],
  [20,"Que conseille Marie aux jeunes écrivains ?",["De suivre des cours d'écriture.","De lire autant que possible.","De sortir de leur zone de confort."],"C"]
];
const pageSize = 10, storeKey = "tfs4-prototype-attempt";
let page = 0, state = JSON.parse(localStorage.getItem(storeKey) || "null") || {startedAt:Date.now(),answers:{},confidence:{},submitted:false};
const $ = s => document.querySelector(s), letters = ["A","B","C"];
function save(){localStorage.setItem(storeKey,JSON.stringify(state));updateProgress()}
function elapsed(){return Math.max(0,Date.now()-state.startedAt)}
function format(ms){const s=Math.floor(ms/1000),h=String(Math.floor(s/3600)).padStart(2,"0"),m=String(Math.floor(s%3600/60)).padStart(2,"0"),x=String(s%60).padStart(2,"0");return `${h}:${m}:${x}`}
function render(){const slice=questions.slice(page*pageSize,(page+1)*pageSize);$("#questionList").innerHTML=slice.map(([id,prompt,options])=>`<article class="question"><div class="question-top"><span class="number">QUESTION ${String(id).padStart(2,"0")}</span><span class="tag">${id<=10?"Section A":"Section B"}</span></div><h2 class="prompt">${prompt}</h2><div class="options">${options.map((o,i)=>`<button class="option ${state.answers[id]===letters[i]?"selected":""}" data-answer="${letters[i]}" data-id="${id}" type="button"><b>${letters[i]}</b>${o}</button>`).join("")}</div><div class="confidence"><span>你的把握程度</span>${[["certain","😄 肯定"],["unsure","😐 犹豫"],["guess","🎲 猜测"]].map(([key,label])=>`<button type="button" data-confidence="${key}" data-id="${id}" class="${state.confidence[id]===key?"active":""}">${label}</button>`).join("")}</div></article>`).join("");
  $("#previous").disabled=page===0;$("#next").textContent=page===1?"完成并交卷":"下一页 →";$("#pageText").textContent=`第 ${page+1} / 2 页`;$("#pageDots").innerHTML=[0,1].map(i=>`<button type="button" data-page="${i}" class="${i===page?"active":""}" aria-label="第 ${i+1} 页"></button>`).join("");
}
function updateProgress(){const n=Object.keys(state.answers).length;$("#progressText").textContent=`${n} / 20 已作答`;$("#progressBar").style.width=`${n/20*100}%`}
document.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.answer){state.answers[b.dataset.id]=b.dataset.answer;save();render()}if(b.dataset.confidence){state.confidence[b.dataset.id]=b.dataset.confidence;save();render()}if(b.dataset.page!==undefined){page=+b.dataset.page;render()} });
$("#previous").onclick=()=>{page=0;render();window.scrollTo({top:0,behavior:"smooth"})};$("#next").onclick=()=>{if(page===0){page=1;render();window.scrollTo({top:0,behavior:"smooth"})}else submit()};
function submit(){const correct=questions.filter(q=>state.answers[q[0]]===q[3]).length,answered=Object.keys(state.answers).length,certain=Object.values(state.confidence).filter(x=>x==="certain").length;state.submitted=true;state.finishedAt=Date.now();save();$("#score").textContent=correct;$("#resultAnswered").textContent=`${answered} / 20`;$("#resultCertain").textContent=certain;$("#resultTime").textContent=format(elapsed());$("#resultTitle").textContent=answered?"完成得分":"尚未作答";$("#resultDialog").showModal()}
$("#submit").onclick=submit;$("#closeDialog").onclick=()=>$("#resultDialog").close();$("#restart").onclick=()=>{localStorage.removeItem(storeKey);state={startedAt:Date.now(),answers:{},confidence:{},submitted:false};page=0;$("#resultDialog").close();render();save();window.scrollTo({top:0,behavior:"smooth"})};
setInterval(()=>$("#timer").textContent=format(elapsed()),1000);$("#timer").textContent=format(elapsed());render();updateProgress();
