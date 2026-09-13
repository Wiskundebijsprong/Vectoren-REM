const app = document.getElementById('app');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const progressPct = document.getElementById('progressPct');
const STORAGE = 'vectoren-rem-v1';

const modules = [
  {id:'vergelijk', title:'Vectoren vergelijken', short:'Gelijk, tegengesteld of geen van beide', color:'mint'},
  {id:'tekenen', title:'Vectoren tekenen', short:'Tegengestelde vector en vectorsom', color:'sky'},
  {id:'vereenvoudigen', title:'Vectoruitdrukkingen', short:'Schrijf als één vector', color:'amber'}
];

let state = load();
let current = {view:'home', module:null, stage:null, qIndex:0, score:0, answers:[]};

function freshState(){ return {done:{}, attempts:{}, lastModule:null}; }
function load(){ try{return JSON.parse(localStorage.getItem(STORAGE))||freshState()}catch{return freshState()} }
function save(){ localStorage.setItem(STORAGE, JSON.stringify(state)); }
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function v(x){ return `<span class="vector">${esc(x)}</span>`; }
function setProgress(label,pct){progressText.textContent=label; progressPct.textContent=`${pct}%`; progressBar.style.width=`${pct}%`;}
function screen(html){ app.innerHTML=`<section class="screen"><div class="panel">${html}</div></section>`; window.scrollTo({top:0,behavior:'smooth'}); }

function home(){
  current={view:'home',module:null,stage:null,qIndex:0,score:0,answers:[]};
  const doneCount = modules.filter(m=>state.done[m.id]).length;
  setProgress(doneCount ? `${doneCount}/3 modules afgerond` : 'Start', Math.round(doneCount/3*100));
  screen(`
    <span class="eyebrow">Remediëring na Toets 1</span>
    <h1>Niet opnieuw alles.<br>Wel precies wat jij nodig hebt.</h1>
    <p class="lead">Deze remediëring werkt <strong>pagina per pagina</strong>. Je start per onderdeel met een korte diagnose. Bij een fout antwoord krijg je eerst gerichte uitleg en eenvoudige oefeningen. Pas daarna ga je door naar moeilijkere toepassingen.</p>
    <div class="note"><strong>Doel:</strong> een leerling die rond 50% scoorde, krijgt geen lange herhaling van de volledige leerstof, maar een kort adaptief traject per fouttype.</div>
    <div class="grid3">
      ${modules.map((m,i)=>`<article class="module-card"><div class="num">${i+1}</div><h3>${m.title}</h3><p>${m.short}</p><span class="status">${state.done[m.id]?'✓ afgerond':'start met diagnose'}</span><div class="actions"><button class="btn secondary" onclick="startDiagnostic('${m.id}')">${state.done[m.id]?'Opnieuw oefenen':'Start'}</button></div></article>`).join('')}
    </div>
    <div class="actions"><button class="btn" onclick="startRecommended()">Start aanbevolen traject</button></div>
  `);
}

function startRecommended(){
  const next=modules.find(m=>!state.done[m.id])||modules[0];
  startDiagnostic(next.id);
}

const content = {
  vergelijk:{
    diagnostic:[
      {q:`Welke drie kenmerken moeten overeenkomen opdat twee vectoren <strong>gelijk</strong> zijn?`, choices:['richting, zin en grootte','beginpunt, eindpunt en ligging','richting en beginpunt','zin en eindpunt'], correct:0, explain:'Gelijke vectoren hebben dezelfde richting, dezelfde zin én dezelfde grootte.'},
      {q:`Twee even lange vectoren liggen op evenwijdige rechten, maar wijzen in tegengestelde zin. Ze zijn …`,choices:['gelijk','tegengesteld','geen van beide'],correct:1,explain:'Zelfde richting en grootte, maar tegengestelde zin ⇒ tegengestelde vectoren.'}
    ],
    lesson:{
      title:'Stap 1 — Vergelijk altijd in dezelfde volgorde',
      body:`<div class="lesson"><div class="explain"><h3>Controleer 3 kenmerken</h3><ol><li><strong>Richting:</strong> liggen de vectoren evenwijdig?</li><li><strong>Zin:</strong> wijzen de pijlen dezelfde kant op?</li><li><strong>Grootte:</strong> zijn ze even lang?</li></ol><p class="rule">Alle 3 gelijk → gelijke vectoren.<br>Richting + grootte gelijk, zin tegengesteld → tegengestelde vectoren.</p></div><div class="example"><strong>Belangrijk bij een figuur</strong><p>Laat je niet misleiden door de plaats van de pijl. Een vector mag verschoven worden zolang richting, zin en grootte behouden blijven.</p><span class="badge">plaats is géén kenmerk</span></div></div>`
    },
    basic:[
      {q:`${v('a')} en ${v('b')} zijn even lang, evenwijdig en wijzen dezelfde kant op.`,choices:['gelijk','tegengesteld','geen van beide'],correct:0},
      {q:`${v('p')} en ${v('q')} zijn evenwijdig en even lang, maar wijzen tegengesteld.`,choices:['gelijk','tegengesteld','geen van beide'],correct:1},
      {q:`${v('u')} en ${v('v')} wijzen dezelfde kant op, maar ${v('u')} is langer.`,choices:['gelijk','tegengesteld','geen van beide'],correct:2}
    ],
    complex:[
      {q:`In een parallellogram ABCD: wat geldt voor ${v('AB')} en ${v('DC')}?`,choices:['gelijk','tegengesteld','geen van beide'],correct:0,explain:'Overstaande zijden zijn evenwijdig en even lang; AB en DC hebben bovendien dezelfde zin.'},
      {q:`In hetzelfde parallellogram: wat geldt voor ${v('AB')} en ${v('CD')}?`,choices:['gelijk','tegengesteld','geen van beide'],correct:1,explain:'AB en CD zijn even lang en evenwijdig, maar hebben tegengestelde zin.'}
    ]
  },
  tekenen:{
    diagnostic:[
      {q:`Wat verandert er als je de tegengestelde vector ${v('-AB')} tekent?`,choices:['alleen de grootte','alleen de zin','richting en grootte','alles'],correct:1,explain:'De tegengestelde vector behoudt richting en grootte, maar keert de zin om.'},
      {q:`Bij de parallellogrammethode voor ${v('u')} + ${v('v')}: waar begint de somvector?`,choices:['in het gemeenschappelijke beginpunt','in het eindpunt van u','in het midden van het parallellogram','dat maakt niet uit'],correct:0,explain:'De diagonaal vanuit het gemeenschappelijke beginpunt stelt de somvector voor.'}
    ],
    lesson:{title:'Stap 2 — Tekenen zonder coördinaten',body:`<div class="lesson"><div class="explain"><h3>Tegengestelde vector</h3><p>Voor ${v('PQ')} = −${v('AB')}:</p><ol><li>zelfde <strong>richting</strong> als ${v('AB')}</li><li>zelfde <strong>grootte</strong></li><li>tegengestelde <strong>zin</strong></li><li>begin in het opgegeven punt P</li></ol></div><div class="example"><strong>Som van vectoren</strong><p>Breng de vectoren met hun beginpunten samen. Maak het parallellogram. De diagonaal vanuit het gemeenschappelijke beginpunt is de som.</p><span class="badge">parallellogrammethode</span></div></div>`},
    basic:[
      {q:`Je tekent ${v('r')} = −${v('s')}. Welke uitspraak is fout?`,choices:['r en s zijn even lang','r en s zijn evenwijdig','r en s hebben dezelfde zin'],correct:2},
      {q:`Bij ${v('u')} + ${v('v')} wijst de resultaatvector …`,choices:['van het gemeenschappelijke beginpunt naar de overstaande hoek','van het eindpunt van u naar het eindpunt van v','altijd horizontaal'],correct:0},
      {q:`Als ${v('u')} en ${v('v')} gelijk en gelijkgericht zijn, is ${v('u')}+${v('v')} …`,choices:['even lang als u','twee keer zo lang als u','de nulvector'],correct:1}
    ],
    complex:[
      {q:`Je moet ${v('z')} = ${v('u')} + ${v('v')} + ${v('w')} tekenen. Wat is een geldige aanpak?`,choices:['tel eerst u en v op en tel daarna w bij de resultante','keer alle pijlen om en tel dan op','gebruik alleen de langste twee vectoren'],correct:0},
      {q:`Als ${v('v')} = −${v('u')}, wat is ${v('u')} + ${v('v')}?`,choices:['u','v','de nulvector'],correct:2}
    ]
  },
  vereenvoudigen:{
    diagnostic:[
      {q:`Welke kettingregel is correct?`,choices:[`${v('AB')} + ${v('BC')} = ${v('AC')}`,`${v('AB')} + ${v('BC')} = ${v('CA')}`,`${v('AB')} - ${v('BC')} = ${v('AC')}`],correct:0,explain:'Kop-aan-staart: van A naar B en van B naar C geeft rechtstreeks van A naar C.'},
      {q:`Wat gebeurt er met ${v('BC')} − ${v('BC')}?`,choices:[v('BC'),v('CB'),'de nulvector'],correct:2,explain:'Een vector min zichzelf is de nulvector.'}
    ],
    lesson:{title:'Stap 3 — Vereenvoudig met kettingen en tegengestelden',body:`<div class="lesson"><div class="explain"><h3>Drie vaste zetten</h3><ol><li><strong>Ketting:</strong> ${v('AB')} + ${v('BC')} = ${v('AC')}</li><li><strong>Min wordt tegengestelde:</strong> −${v('AB')} = ${v('BA')}</li><li><strong>Wegvallen:</strong> ${v('AB')} − ${v('AB')} = ${v('0')}</li></ol></div><div class="example"><strong>Werk doelgericht</strong><p>Zoek eerst termen die je kunt omkeren of schrappen. Bouw daarna een route: beginpunt → tussenpunt → eindpunt.</p><span class="badge">kop-aan-staart</span></div></div>`},
    basic:[
      {q:`${v('AB')} + ${v('BC')} = …`,choices:[v('AC'),v('CA'),v('AB')],correct:0},
      {q:`−${v('DB')} = …`,choices:[v('BD'),v('DB'),'0'],correct:0},
      {q:`${v('AB')} − ${v('AB')} = …`,choices:[v('BA'),'nulvector',v('AA')+' met lengte 1'],correct:1}
    ],
    complex:[
      {q:`Vereenvoudig: ${v('DB')} − ${v('DC')} + ${v('AC')}`,choices:[v('AB'),v('BA'),v('DC')],correct:0,explain:`−${v('DC')} = ${v('CD')}; dus ${v('DB')} + ${v('CD')} + ${v('AC')}. Herschikken: ${v('AC')} + ${v('CD')} + ${v('DB')} = ${v('AB')}.`},
      {q:`Vereenvoudig: ${v('AB')} − ${v('DB')} − ${v('AD')}`,choices:['nulvector',v('AB'),v('DA')],correct:0,explain:`−${v('DB')}=${v('BD')} en −${v('AD')}=${v('DA')}; ${v('AB')}+${v('BD')}=${v('AD')}; daarna ${v('AD')}+${v('DA')}=0.`},
      {q:`Vereenvoudig: ${v('AB')} − ${v('BC')} + ${v('BC')} − ${v('AB')}`,choices:['nulvector',v('AC'),v('BA')],correct:0,explain:'De middelste termen vallen weg en ook AB − AB = 0.'}
    ]
  }
};

function startDiagnostic(id){ current={view:'quiz',module:id,stage:'diagnostic',qIndex:0,score:0,answers:[]}; state.lastModule=id; save(); renderQuiz(); }
function renderQuiz(){
  const m=content[current.module]; const qs=m[current.stage]; const q=qs[current.qIndex];
  const idx=modules.findIndex(x=>x.id===current.module); const stagePct={diagnostic:8,basic:18,complex:28}[current.stage];
  setProgress(`${modules[idx].title} • ${labelStage(current.stage)}`, Math.round((idx*33)+stagePct));
  screen(`
    <span class="eyebrow">${labelStage(current.stage)}</span>
    <h2>${modules[idx].title}</h2>
    <div class="levels"><span class="level ${current.stage==='diagnostic'?'active':''}">Diagnose</span><span class="level ${current.stage==='basic'?'active':''}">Basis</span><span class="level ${current.stage==='complex'?'active':''}">Verdieping</span></div>
    <div class="question"><span class="badge">Vraag ${current.qIndex+1} van ${qs.length}</span><h3>${q.q}</h3><div class="choices" id="choices">${q.choices.map((c,i)=>`<button class="choice" onclick="answer(${i})">${c}</button>`).join('')}</div><div id="feedback"></div></div>
    <div class="actions"><button class="btn secondary" onclick="home()">Terug naar overzicht</button></div>
  `);
}
function labelStage(s){return s==='diagnostic'?'Korte diagnose':s==='basic'?'Gerichte basisoefeningen':'Complexere oefeningen'}
function answer(i){
  const qs=content[current.module][current.stage]; const q=qs[current.qIndex]; const btns=[...document.querySelectorAll('.choice')]; btns.forEach((b,j)=>{b.disabled=true; if(j===q.correct)b.classList.add('correct'); if(j===i&&i!==q.correct)b.classList.add('wrong')});
  const ok=i===q.correct; if(ok) current.score++; current.answers.push(ok);
  const feedback=document.getElementById('feedback');
  feedback.innerHTML=`<div class="feedback ${ok?'ok':'bad'}"><strong>${ok?'Juist.':'Nog niet.'}</strong> ${q.explain||defaultExplain(current.module,current.stage)}</div><div class="actions"><button class="btn" onclick="nextQuestion()">Verder</button></div>`;
}
function defaultExplain(module,stage){
  if(module==='vergelijk') return 'Controleer richting, zin en grootte afzonderlijk.';
  if(module==='tekenen') return 'Denk eerst aan richting, zin en grootte; bij een som gebruik je de diagonaal van het parallellogram.';
  return 'Zet mintekens om naar tegengestelde vectoren en zoek daarna kettingen die aansluiten.';
}
function nextQuestion(){
  const qs=content[current.module][current.stage];
  if(current.qIndex<qs.length-1){current.qIndex++; renderQuiz(); return;}
  finishStage();
}
function finishStage(){
  const stage=current.stage, score=current.score, total=content[current.module][stage].length;
  if(stage==='diagnostic'){
    if(score===total){
      renderBranch('Sterke diagnose',`${score}/${total}`,`Je basis zit goed. Je mag de uitleg overslaan en meteen naar complexere toepassingen.`,()=>startStage('complex'),'Toch uitleg bekijken',()=>renderLesson('diagnostic'));
    } else {
      renderBranch('Remediëring aanbevolen',`${score}/${total}`,`Je krijgt nu eerst een korte uitleg, daarna enkele eenvoudige oefeningen.`,()=>renderLesson('diagnostic'),'Terug naar overzicht',home);
    }
  } else if(stage==='basic'){
    if(score>=2){ renderBranch('Basis beheerst',`${score}/${total}`,`Goed. Nu verhogen we het niveau.`,()=>startStage('complex'),'Uitleg nog eens bekijken',()=>renderLesson('basic')); }
    else { renderBranch('Nog één extra ronde',`${score}/${total}`,`Je krijgt de uitleg opnieuw in compacte vorm. Daarna proberen we de basisoefeningen opnieuw.`,()=>renderLesson('retry'),'Terug naar overzicht',home); }
  } else {
    const passed=score>=Math.ceil(total*0.66);
    if(passed){ state.done[current.module]=true; save(); renderBranch('Onderdeel afgerond',`${score}/${total}`,`Je hebt dit onderdeel voldoende beheerst. Ga door naar het volgende remediëringsblok.`,()=>home,'Nog eens oefenen',()=>startStage('complex')); }
    else { renderBranch('Nog niet stabiel genoeg',`${score}/${total}`,`We schakelen terug naar de basis. Na een korte herhaling krijg je opnieuw eenvoudige oefeningen.`,()=>renderLesson('retry'),'Terug naar overzicht',home); }
  }
}
function renderBranch(title,score,text,primary,secondaryLabel,secondary){
  setProgress(title, current.stage==='complex'?30:18);
  window._primary=primary; window._secondary=secondary;
  screen(`<span class="eyebrow">Adaptieve keuze</span><h2>${title}</h2><div class="scorebox"><div class="scorebig">${score}</div><div>${text}</div></div><div class="branch"><strong>Wat gebeurt er nu?</strong><br>De volgende stap wordt bepaald door je antwoorden, niet door een vaste lange reeks pagina's.</div><div class="actions"><button class="btn" onclick="_primary()">Verder</button><button class="btn secondary" onclick="_secondary()">${secondaryLabel}</button></div>`);
}
function renderLesson(mode){
  const lesson=content[current.module].lesson; const idx=modules.findIndex(x=>x.id===current.module); setProgress(`${modules[idx].title} • uitleg`,Math.round(idx*33+13));
  const retry = mode==='retry';
  screen(`<span class="eyebrow">${retry?'Herhaling':'Gerichte uitleg'}</span><h2>${lesson.title}</h2><p class="lead">Lees dit rustig. Je hoeft niet te scrollen naar een volgend hoofdstuk: na deze pagina krijg je meteen oefeningen op precies dit idee.</p>${lesson.body}<div class="actions"><button class="btn" onclick="startStage('basic')">${retry?'Probeer de basis opnieuw':'Oefen dit nu'}</button><button class="btn secondary" onclick="home()">Terug naar overzicht</button></div>`);
}
function startStage(stage){ current.view='quiz'; current.stage=stage; current.qIndex=0; current.score=0; current.answers=[]; renderQuiz(); }

document.getElementById('resetBtn').addEventListener('click',()=>{if(confirm('Alle lokale voortgang wissen?')){localStorage.removeItem(STORAGE);state=freshState();home();}});
window.home=home; window.startDiagnostic=startDiagnostic; window.startRecommended=startRecommended; window.answer=answer; window.nextQuestion=nextQuestion; window.startStage=startStage; window.renderLesson=renderLesson;
home();
