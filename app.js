/* =========================================================
   CHALO GOA — app.js
   Vanilla JS SPA. State persists to localStorage on this device.
   NOTE: without a backend, Goa Points / Bingo / votes are tracked
   per-device. See README for how to add a shared backend later.
========================================================= */

const STORAGE_KEY = "chaloGoaState_v1";
const ME_KEY = "chaloGoaMe";
const SESSION_PIN_KEY = "chaloGoaPinOk";
const SESSION_ADMIN_KEY = "chaloGoaAdminOk";

let DATA = loadState();
let currentView = "hq";
let currentDayIndex = 0;
let currentAdminTab = "friends";

/* ---------- state helpers ---------- */
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return migrate(JSON.parse(raw));
  }catch(e){ console.warn("state load failed", e); }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}
function migrate(saved){
  // shallow-merge so new default fields appear after an update
  const base = JSON.parse(JSON.stringify(DEFAULT_DATA));
  return deepMerge(base, saved);
}
function deepMerge(base, override){
  if(Array.isArray(base)) return override !== undefined ? override : base;
  if(typeof base === "object" && base !== null){
    const out = {...base};
    for(const k in base){
      out[k] = override && (k in override) ? deepMerge(base[k], override[k]) : base[k];
    }
    if(override){ for(const k in override){ if(!(k in out)) out[k] = override[k]; } }
    return out;
  }
  return override !== undefined ? override : base;
}
function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));
}
function uid(){ return Math.random().toString(36).slice(2,10); }

function getMe(){ return localStorage.getItem(ME_KEY) || ""; }
function setMe(id){ localStorage.setItem(ME_KEY, id); }
function friendById(id){ return DATA.friends.find(f=>f.id===id); }

/* ---------- DOM helpers ---------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
function el(html){ const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }
function escapeHtml(s){ return (s||"").toString().replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

function showScooter(){
  const s = $("#scooter-loader");
  s.classList.remove("hidden");
  s.style.animation = "none"; void s.offsetWidth; s.style.animation = "";
  setTimeout(()=> s.classList.add("hidden"), 1100);
}

/* ---------- modal ---------- */
function openModal(innerHtml, onMount){
  const root = $("#modal-root");
  root.innerHTML = `<div class="modal-card">${innerHtml}</div>`;
  root.classList.remove("hidden");
  root.onclick = (e)=>{ if(e.target === root) closeModal(); };
  if(onMount) onMount(root);
}
function closeModal(){ $("#modal-root").classList.add("hidden"); $("#modal-root").innerHTML=""; }

/* =========================================================
   COUNTDOWN
========================================================= */
function tickCountdowns(){
  const now = new Date();

  // splash
  const start = new Date(DATA.trip.startDate);
  diffInto(start-now, "cd-days","cd-hours","cd-mins","cd-secs");

  // birthday
  const bday = new Date(DATA.birthday.dateTime);
  diffInto(bday-now, "bd-days","bd-hours","bd-mins","bd-secs");

  updateHQCountdownStats();
  maybeUnlockBirthdayCard();
}
function diffInto(ms, dId,hId,mId,sId){
  const d=$("#"+dId), h=$("#"+hId), m=$("#"+mId), s=$("#"+sId);
  if(!d) return;
  if(ms <= 0){ d.textContent=h.textContent=m.textContent=s.textContent="00"; return; }
  const days = Math.floor(ms/86400000);
  const hours = Math.floor((ms%86400000)/3600000);
  const mins = Math.floor((ms%3600000)/60000);
  const secs = Math.floor((ms%60000)/1000);
  d.textContent = String(days).padStart(2,"0");
  h.textContent = String(hours).padStart(2,"0");
  m.textContent = String(mins).padStart(2,"0");
  s.textContent = String(secs).padStart(2,"0");
}

function tripStatus(){
  const now = new Date();
  const start = new Date(DATA.trip.startDate);
  const end = new Date(DATA.trip.endDate);
  if(now < start) return "before";
  if(now > end) return "after";
  return "during";
}

function updateHQCountdownStats(){
  const now = new Date();
  const start = new Date(DATA.trip.startDate);
  const end = new Date(DATA.trip.endDate);
  const bday = new Date(DATA.birthday.dateTime);

  const daysLeft = Math.max(0, Math.ceil((start-now)/86400000));
  const bdayLeft = Math.max(0, Math.ceil((bday-now)/86400000));

  const status = tripStatus();
  let progress = 0;
  if(status === "during"){
    progress = Math.min(100, Math.max(0, Math.round(((now-start)/(end-start))*100)));
  } else if(status === "after"){
    progress = 100;
  }

  const modeVal = status==="before" ? "GOA LOADING… 🌴" : status==="during" ? "FULL GOA 😎" : "GOA WRAPPED 🌅";
  const hqDays = $("#hq-days-left"); if(hqDays) hqDays.textContent = status==="before" ? daysLeft : "🏝️";
  const hqBday = $("#hq-birthday-left"); if(hqBday) hqBday.textContent = bdayLeft;
  const hqProg = $("#hq-progress"); if(hqProg) hqProg.textContent = progress+"%";
  const hqProgSub = $("#hq-progress-sub"); if(hqProgSub) hqProgSub.textContent = status==="before" ? "Let's go!" : status==="during" ? "Living it" : "What a trip";
  const modeValEl = $("#mode-value"); if(modeValEl) modeValEl.textContent = modeVal;
  const badge = $("#btn-mode-badge"); if(badge) badge.textContent = status==="during" ? "😎" : "🔔";
}

let birthdayUnlocked = false;
function maybeUnlockBirthdayCard(){
  const now = new Date();
  const bday = new Date(DATA.birthday.dateTime);
  const front = $("#locked-card-front"), back = $("#locked-card-back");
  if(!front) return;
  if(now >= bday && !birthdayUnlocked){
    birthdayUnlocked = true;
    front.classList.add("hidden");
    back.classList.remove("hidden");
    $("#unlocked-text").textContent = `Happy Birthday ${DATA.birthday.name}! The whole gang loves you. 🎂`;
    launchConfetti();
  } else if(now >= bday){
    front.classList.add("hidden");
    back.classList.remove("hidden");
  } else {
    front.classList.remove("hidden");
    back.classList.add("hidden");
  }
}

/* =========================================================
   ROUTING
========================================================= */
const BOTTOM_TABS = ["hq","trip","games","scores","memories"];
function navigate(view){
  currentView = view;
  $$(".view").forEach(v=>v.classList.add("hidden"));
  const target = $("#view-"+view);
  if(target) target.classList.remove("hidden");
  $$(".nav-btn").forEach(b=> b.classList.toggle("active", b.dataset.nav===view));
  const titles = {hq:"GOA HQ 🌴", trip:"TRIP TIMELINE 🗺️", games:"GOA GAMES 🎮", scores:"WHO RULES GOA? 🏆",
    memories:"MEMORY WALL 📸", gang:"THE GANG 🕶️", birthday:"KAREEM MODE 🎂", expenses:"EXPENSES 💸",
    recap:"TRIP RECAP 👀", admin:"ADMIN 🔧"};
  $("#topbar-title").textContent = titles[view] || "CHALO GOA";
  closeSideMenu();
  window.scrollTo(0,0);
  showScooter();
  renderView(view);
}
function renderView(view){
  if(view==="hq") renderHQ();
  else if(view==="trip") renderTrip();
  else if(view==="games") renderGamesHub();
  else if(view==="scores") renderScores();
  else if(view==="memories") renderMemories();
  else if(view==="gang") renderGang();
  else if(view==="birthday") renderBirthday();
  else if(view==="expenses") renderExpenses();
  else if(view==="recap") renderRecap();
  else if(view==="admin") renderAdmin();
}

function closeSideMenu(){ $("#sidemenu").classList.add("hidden"); }

/* =========================================================
   HQ
========================================================= */
function renderHQ(){
  updateHQCountdownStats();

  const sorted = [...DATA.friends].sort((a,b)=>b.points-a.points);
  const prevBanner = $("#vibe-text");
  const status = tripStatus();
  prevBanner.textContent = status==="before" ? "Plan locked. Spirits unlocked. 😎"
    : status==="during" ? "You're in Goa. Act accordingly. 🏖️"
    : "It happened. It was legendary. 🌅";

  // next up: from today's itinerary or first day
  const day = DATA.itinerary[Math.min(currentDayIndex, DATA.itinerary.length-1)];
  const nextSlot = ["morning","afternoon","evening","nightlife"].map(k=>day[k]).find(s=>s && s.text);
  $("#hq-next-up-title").textContent = nextSlot ? nextSlot.text : "Nothing planned yet";
  $("#hq-next-up-time").textContent = nextSlot ? day.label : "Add it in Trip →";

  const lastChallenge = DATA._lastWheelChallenge;
  $("#hq-challenge-title").textContent = lastChallenge ? lastChallenge.text : "Spin the wheel to get one 🎡";

  // leaderboard preview (top 5)
  const lb = $("#hq-leaderboard-preview");
  lb.innerHTML = sorted.map((f,i)=>leaderChipHtml(f,i+1)).join("");

  // memory preview
  const mp = $("#hq-memory-preview");
  const recent = [...DATA.memories].sort((a,b)=>b.ts-a.ts).slice(0,8);
  mp.innerHTML = recent.length ? recent.map(m=>`<img class="mem-thumb" src="${m.photo}" alt="">`).join("")
    : `<p class="muted">No memories yet — be the first to add one 📸</p>`;

  $("#hq-challenge-btn").onclick = ()=> navigate("games");
}
function leaderChipHtml(f, rank){
  const medal = rank===1?"🥇":rank===2?"🥈":rank===3?"🥉":rank;
  return `<div class="leader-chip">
    <div class="rank">${rank<=3?medal:""}</div>
    <div class="avatar">${f.photo?`<img src="${f.photo}" style="width:100%;height:100%;object-fit:cover">`:"🙂"}</div>
    <div class="name">${escapeHtml(f.nickname||f.name)}</div>
    <div class="pts">${f.points} pts</div>
  </div>`;
}

/* =========================================================
   TRIP TIMELINE
========================================================= */
function renderTrip(){
  const tabs = $("#day-tabs");
  tabs.innerHTML = DATA.itinerary.map((d,i)=>`<button class="day-tab ${i===currentDayIndex?'active':''}" data-i="${i}">${d.label}</button>`).join("");
  tabs.querySelectorAll(".day-tab").forEach(b=> b.onclick = ()=>{ currentDayIndex = +b.dataset.i; renderTrip(); });

  const prog = $("#day-progress");
  prog.innerHTML = DATA.itinerary.map((d,i)=>{
    const cls = i<currentDayIndex ? "done" : i===currentDayIndex ? "current" : "";
    return `<div class="day-progress-seg ${cls}"></div>`;
  }).join("");

  const day = DATA.itinerary[currentDayIndex];
  const rows = [
    ["morning","Morning"],["afternoon","Afternoon"],["evening","Evening"],["nightlife","Nightlife"]
  ].map(([k,label])=>{
    const seg = day[k];
    if(!seg || !seg.text) return "";
    return `<div class="day-row"><div class="ico">${seg.icon||"•"}</div><div><div class="lbl">${label}</div><div class="txt">${escapeHtml(seg.text)}</div></div></div>`;
  }).join("") || `<p class="muted">Nothing added for this day yet. Add it from Admin → Itinerary.</p>`;

  const meta = [];
  if(day.restaurant) meta.push(`🍽️ ${escapeHtml(day.restaurant)}`);
  if(day.beach) meta.push(`🏖️ ${escapeHtml(day.beach)}`);
  if(day.activity) meta.push(`🎯 ${escapeHtml(day.activity)}`);
  if(day.transport) meta.push(`🛵 ${escapeHtml(day.transport)}`);
  if(day.costEstimate) meta.push(`💰 ${escapeHtml(day.costEstimate)}`);

  $("#day-cards").innerHTML = `
    <div class="day-card">
      <div class="day-card-cover">
        ${day.cover?`<img src="${day.cover}" alt="">`:""}
        <div class="label-wrap">
          <div class="big">${day.label}</div>
          <div class="small">${escapeHtml(day.dayTitle||"")}</div>
        </div>
      </div>
      <div class="day-card-body">
        ${rows}
        ${meta.length?`<div class="day-meta">${meta.map(m=>`<span>${m}</span>`).join("")}</div>`:""}
        ${day.mapUrl?`<div class="day-actions"><a class="btn-secondary" style="text-decoration:none;text-align:center" href="${day.mapUrl}" target="_blank" rel="noopener">📍 Open Map</a></div>`:""}
        ${day.notes?`<div class="day-notes">📝 ${escapeHtml(day.notes)}</div>`:""}
      </div>
    </div>`;
}

/* =========================================================
   GAMES HUB
========================================================= */
function renderGamesHub(){
  $("#game-panel").classList.add("hidden");
  $("#game-panel").innerHTML = "";
  $$("#games-grid .game-tile").forEach(btn=>{
    btn.onclick = ()=> openGame(btn.dataset.game);
  });
}
function openGame(game){
  const panel = $("#game-panel");
  panel.classList.remove("hidden");
  if(game==="wheel") renderWheelGame(panel);
  else if(game==="quiz") renderQuizGame(panel);
  else if(game==="bingo") renderBingoGame(panel);
  else if(game==="mostlikely") renderMostLikelyGame(panel);
  else if(game==="tdc") renderTdcGame(panel);
  else if(game==="secret") renderSecretGame(panel);
  panel.scrollIntoView({behavior:"smooth", block:"start"});
}
function panelHeader(title){
  return `<button class="close-panel icon-btn" onclick="closeGamePanel()">✕</button><h3>${title}</h3>`;
}
function closeGamePanel(){ $("#game-panel").classList.add("hidden"); $("#game-panel").innerHTML=""; }

function awardPoints(friendId, pts){
  const f = friendById(friendId);
  if(!f) return;
  f.points += pts;
  f.challengesCompleted += pts>0 ? 1 : 0;
  saveState();
}

/* ---- Game 1: Wheel ---- */
const WHEEL_COLORS = ["#FF7A45","#2DD4C4","#FF4D8D","#C6FF3D","#7A6CFF","#FFC65A","#3AC0FF","#FF6C6C"];
function renderWheelGame(panel){
  const items = DATA.wheel.challenges;
  const n = items.length;
  const seg = 360/n;
  let paths = "";
  const cx=130, cy=130, r=125;
  for(let i=0;i<n;i++){
    const a0 = (i*seg)*Math.PI/180, a1 = ((i+1)*seg)*Math.PI/180;
    const x0 = cx + r*Math.cos(a0), y0 = cy + r*Math.sin(a0);
    const x1 = cx + r*Math.cos(a1), y1 = cy + r*Math.sin(a1);
    const large = seg>180?1:0;
    paths += `<path d="M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z" fill="${WHEEL_COLORS[i%WHEEL_COLORS.length]}"/>`;
    const mid = (a0+a1)/2;
    const tx = cx + (r*0.62)*Math.cos(mid), ty = cy + (r*0.62)*Math.sin(mid);
    const rot = (i*seg + seg/2);
    paths += `<text x="${tx}" y="${ty}" fill="#0B1F3A" font-size="8" font-weight="700" text-anchor="middle" transform="rotate(${rot} ${tx} ${ty})">${escapeHtml(items[i].category)}</text>`;
  }
  panel.innerHTML = `${panelHeader("Spin the Goa Wheel 🎡")}
    <div class="wheel-wrap">
      <div class="wheel-outer">
        <div class="wheel-pointer">📍</div>
        <svg id="wheel-svg" class="wheel-svg" viewBox="0 0 260 260">${paths}</svg>
      </div>
      <button class="btn-primary" id="btn-spin">SPIN</button>
      <div class="wheel-result hidden" id="wheel-result"></div>
    </div>`;
  $("#btn-spin").onclick = ()=>{
    const svg = $("#wheel-svg");
    const idx = Math.floor(Math.random()*n);
    const target = 360*5 + (360 - (idx*seg + seg/2));
    svg.style.transform = `rotate(${target}deg)`;
    $("#btn-spin").disabled = true;
    setTimeout(()=>{
      const chosen = items[idx];
      DATA._lastWheelChallenge = chosen;
      saveState();
      const res = $("#wheel-result");
      res.classList.remove("hidden");
      res.innerHTML = `<p class="res-cat">${escapeHtml(chosen.category)} · +${chosen.points} pts</p>
        <p class="res-text">${escapeHtml(chosen.text)}</p>
        <div class="admin-row-actions"><select id="wheel-who"></select><button class="btn-chip" id="wheel-done">Mark Done</button></div>`;
      fillFriendSelect($("#wheel-who"));
      $("#wheel-done").onclick = ()=>{ awardPoints($("#wheel-who").value, chosen.points); toast(`+${chosen.points} pts awarded 🎉`); renderHQ(); };
      $("#btn-spin").disabled = false;
    }, 4000);
  };
}
function fillFriendSelect(select){
  select.innerHTML = DATA.friends.map(f=>`<option value="${f.id}">${escapeHtml(f.nickname||f.name)}</option>`).join("");
  const me = getMe(); if(me) select.value = me;
}

/* ---- Game 2: Quiz ---- */
let quizState = {i:0, score:0};
function renderQuizGame(panel){
  quizState = {i:0, score:0};
  if(!DATA.quiz.questions.length){
    panel.innerHTML = `${panelHeader(DATA.quiz.title||"Who Knows Kareem Best?")}<p class="muted">No quiz questions yet. Add some from Admin → Quiz.</p>`;
    return;
  }
  drawQuizQuestion(panel);
}
function drawQuizQuestion(panel){
  const qs = DATA.quiz.questions;
  if(quizState.i >= qs.length){
    panel.innerHTML = `${panelHeader("Quiz Complete 🎉")}
      <p style="text-align:center;font-size:18px;font-weight:700;margin:20px 0;">You scored ${quizState.score} / ${qs.length}</p>
      <div class="admin-row-actions"><select id="quiz-who"></select><button class="btn-chip" id="quiz-award">Award ${quizState.score*10} pts</button></div>`;
    fillFriendSelect($("#quiz-who"));
    $("#quiz-award").onclick = ()=>{ awardPoints($("#quiz-who").value, quizState.score*10); toast("Points awarded 🎉"); renderHQ(); };
    return;
  }
  const q = qs[quizState.i];
  panel.innerHTML = `${panelHeader(DATA.quiz.title||"Who Knows Kareem Best?")}
    <div class="quiz-progress"><div class="quiz-progress-bar" style="width:${(quizState.i/qs.length)*100}%"></div></div>
    <p class="quiz-q">${escapeHtml(q.q)}</p>
    <div id="quiz-opts">${q.options.map((o,idx)=>`<button class="quiz-opt" data-i="${idx}">${escapeHtml(o)}</button>`).join("")}</div>`;
  $$("#quiz-opts .quiz-opt").forEach(btn=>{
    btn.onclick = ()=>{
      const idx = +btn.dataset.i;
      $$("#quiz-opts .quiz-opt").forEach(b=>b.disabled=true);
      if(idx===q.correctIndex){ btn.classList.add("correct"); quizState.score++; }
      else { btn.classList.add("wrong"); $$("#quiz-opts .quiz-opt")[q.correctIndex].classList.add("correct"); }
      setTimeout(()=>{ quizState.i++; drawQuizQuestion(panel); }, 900);
    };
  });
}

/* ---- Game 3: Bingo ---- */
function renderBingoGame(panel){
  const tiles = DATA.bingo.tiles;
  const size = DATA.bingo.size || 4;
  DATA.bingoProgress = DATA.bingoProgress || [];
  panel.innerHTML = `${panelHeader("Goa Bingo 🎯")}
    <div class="bingo-grid" style="grid-template-columns:repeat(${size},1fr)">
      ${tiles.slice(0,size*size).map((t,i)=>`<div class="bingo-tile ${DATA.bingoProgress.includes(i)?'done':''}" data-i="${i}">${escapeHtml(t)}</div>`).join("")}
    </div>
    <p class="muted" style="margin-top:12px;text-align:center;">Tap a tile you've done. Complete a full row for bonus points!</p>`;
  $$(".bingo-tile").forEach(tile=>{
    tile.onclick = ()=>{
      const i = +tile.dataset.i;
      const wasDone = DATA.bingoProgress.includes(i);
      if(wasDone) DATA.bingoProgress = DATA.bingoProgress.filter(x=>x!==i);
      else DATA.bingoProgress.push(i);
      saveState();
      tile.classList.toggle("done", !wasDone);
      if(!wasDone) checkBingoRows(size);
    };
  });
}
function checkBingoRows(size){
  const p = DATA.bingoProgress;
  for(let r=0;r<size;r++){
    const row = Array.from({length:size},(_,c)=>r*size+c);
    if(row.every(i=>p.includes(i))){
      launchConfetti();
      const me = getMe(); if(me) awardPoints(me, 20);
      toast("Row complete! +20 pts 🎉");
      return;
    }
  }
}

/* ---- Game 4: Most Likely To ---- */
let mlIndex = 0;
function renderMostLikelyGame(panel){
  mlIndex = 0;
  DATA.mostLikelyVotes = DATA.mostLikelyVotes || {};
  drawMostLikely(panel);
}
function drawMostLikely(panel){
  const prompts = DATA.mostLikely.prompts;
  if(!prompts.length){ panel.innerHTML = `${panelHeader("Most Likely To 🫣")}<p class="muted">Add prompts from Admin.</p>`; return; }
  if(mlIndex >= prompts.length) mlIndex = 0;
  const prompt = prompts[mlIndex];
  const key = "p"+mlIndex;
  const votes = DATA.mostLikelyVotes[key] || {};
  const me = getMe();
  const myVote = me ? votes[me] : null;

  panel.innerHTML = `${panelHeader("Most Likely To 🫣")}
    <p class="ml-prompt">${escapeHtml(prompt)}</p>
    <div class="ml-votes" id="ml-votes"></div>
    <div id="ml-results" style="margin-top:16px;"></div>
    <div class="admin-row-actions" style="margin-top:14px;">
      <button class="btn-secondary" id="ml-prev">← Prev</button>
      <button class="btn-secondary" id="ml-next">Next →</button>
    </div>`;
  const votesWrap = $("#ml-votes");
  votesWrap.innerHTML = DATA.friends.map(f=>`
    <button class="ml-vote-btn" data-id="${f.id}" style="${myVote===f.id?'border-color:var(--lime);background:rgba(198,255,61,.15)':''}">
      <span class="av">${f.photo?`<img src="${f.photo}" style="width:100%;height:100%;object-fit:cover">`:"🙂"}</span>
      ${escapeHtml(f.nickname||f.name)}
    </button>`).join("");
  $$(".ml-vote-btn").forEach(btn=>{
    btn.onclick = ()=>{
      if(!me){ toast("Pick 'Who are you?' first (menu)"); return; }
      DATA.mostLikelyVotes[key] = DATA.mostLikelyVotes[key]||{};
      DATA.mostLikelyVotes[key][me] = btn.dataset.id;
      saveState();
      drawMostLikely(panel);
    };
  });
  const allVoted = DATA.friends.every(f=>votes[f.id] !== undefined || votes[f.id]===undefined) && Object.keys(votes).length>0;
  if(Object.keys(votes).length>0){
    const tally = {};
    Object.values(votes).forEach(v=> tally[v] = (tally[v]||0)+1);
    const total = Object.values(tally).reduce((a,b)=>a+b,0);
    const results = $("#ml-results");
    results.innerHTML = `<p class="muted" style="margin-bottom:8px;">Results so far:</p>` + DATA.friends.map(f=>{
      const c = tally[f.id]||0;
      const pct = total? Math.round((c/total)*100):0;
      return `<div class="ml-result-bar"><span>${escapeHtml(f.nickname||f.name)}</span><span>${c} vote${c!==1?'s':''}</span></div><div class="ml-result-fill" style="width:${pct}%"></div>`;
    }).join("");
  }
  $("#ml-prev").onclick = ()=>{ mlIndex = (mlIndex-1+prompts.length)%prompts.length; drawMostLikely(panel); };
  $("#ml-next").onclick = ()=>{ mlIndex = (mlIndex+1)%prompts.length; drawMostLikely(panel); };
}

/* ---- Game 5: Truth / Dare / Challenge ---- */
function renderTdcGame(panel){
  panel.innerHTML = `${panelHeader("Truth / Dare / Challenge 🃏")}
    <div class="tdc-choices">
      <button class="tdc-choice" data-type="truth">TRUTH</button>
      <button class="tdc-choice" data-type="dare">DARE</button>
      <button class="tdc-choice" data-type="goa">GOA CHALLENGE</button>
    </div>
    <div class="tdc-card" id="tdc-card">Pick one above 👆</div>
    <div class="tdc-actions hidden" id="tdc-actions">
      <button class="btn-secondary" id="tdc-skip">Skip 😏 (-5 pts)</button>
      <button class="btn-primary" id="tdc-done">Complete ✅ (+10 pts)</button>
    </div>`;
  $$(".tdc-choice").forEach(btn=>{
    btn.onclick = ()=>{
      const type = btn.dataset.type;
      const bank = type==="truth"?DATA.truthDareChallenge.truths : type==="dare"?DATA.truthDareChallenge.dares : DATA.truthDareChallenge.goaChallenges;
      if(!bank.length){ $("#tdc-card").textContent = "No prompts added yet — add some from Admin."; return; }
      const pick = bank[Math.floor(Math.random()*bank.length)];
      $("#tdc-card").textContent = pick;
      $("#tdc-actions").classList.remove("hidden");
      $("#tdc-skip").onclick = ()=>{ const me=getMe(); if(me) awardPoints(me,-5); toast("Skipped 😏"); $("#tdc-actions").classList.add("hidden"); };
      $("#tdc-done").onclick = ()=>{ const me=getMe(); if(me) awardPoints(me,10); toast("+10 pts 🎉"); launchConfetti(); $("#tdc-actions").classList.add("hidden"); };
    };
  });
}

/* ---- Game 6: Secret Missions ---- */
function renderSecretGame(panel){
  const me = getMe();
  if(!me){
    panel.innerHTML = `${panelHeader("Secret Missions 🕵️")}<p class="muted">Pick "Who are you?" from the menu first so we know whose mission to show.</p>
    <button class="btn-primary" id="pick-me-btn" style="margin-top:10px;">Who are you?</button>`;
    $("#pick-me-btn").onclick = openWhoAreYou;
    return;
  }
  const mine = DATA.secretMissions.find(m=>m.friendId===me);
  panel.innerHTML = `${panelHeader("Secret Missions 🕵️")}
    <div class="mission-card">
      <p class="lbl">YOUR SECRET GOA MISSION</p>
      <p class="txt">${mine ? escapeHtml(mine.mission) : "No mission assigned yet — ask the admin to assign one."}</p>
      ${mine?`<button class="btn-chip" id="mission-done">Mark Complete (+15 pts)</button>`:""}
    </div>
    <p class="muted" style="margin-top:10px;text-align:center;">🤫 The others don't know your mission — keep it that way.</p>`;
  if(mine){
    $("#mission-done").onclick = ()=>{ awardPoints(me, 15); toast("Mission complete! +15 pts 🎉"); launchConfetti(); };
  }
}

/* =========================================================
   SCORES
========================================================= */
function renderScores(){
  const sorted = [...DATA.friends].sort((a,b)=>b.points-a.points);
  const podium = $("#podium");
  const order = [1,0,2].filter(i=>sorted[i]);
  podium.innerHTML = order.map(i=>{
    const f = sorted[i]; if(!f) return "";
    const cls = i===0?"p1":i===1?"p2":"p3";
    return `<div class="podium-spot ${cls}">
      <div class="avatar">${f.photo?`<img src="${f.photo}" style="width:100%;height:100%;object-fit:cover">`:"🙂"}</div>
      <div class="name">${escapeHtml(f.nickname||f.name)}</div>
      <div class="pts">${f.points} pts</div>
      <div class="bar"></div>
    </div>`;
  }).join("");

  $("#leaderboard-list").innerHTML = sorted.map((f,i)=>`
    <div class="lb-row">
      <div class="rank">${i+1}</div>
      <div class="avatar">${f.photo?`<img src="${f.photo}" style="width:100%;height:100%;object-fit:cover">`:"🙂"}</div>
      <div class="info"><div class="n">${escapeHtml(f.name)}</div><div class="c">${f.challengesCompleted} challenges done</div></div>
      <div class="pts">${f.points} pts</div>
    </div>`).join("");

  $("#awards-grid").innerHTML = DATA.awards.map((a,i)=>`
    <div class="award-card">
      <div class="t">${escapeHtml(a.title)}</div>
      <select data-i="${i}" class="award-select">
        <option value="">— choose —</option>
        ${DATA.friends.map(f=>`<option value="${f.id}" ${a.winnerId===f.id?'selected':''}>${escapeHtml(f.nickname||f.name)}</option>`).join("")}
      </select>
    </div>`).join("");
  $$(".award-select").forEach(sel=>{
    sel.onchange = ()=>{ DATA.awards[+sel.dataset.i].winnerId = sel.value; saveState(); };
  });
}

/* =========================================================
   MEMORIES
========================================================= */
let memoryDayFilter = "all";
function renderMemories(){
  const filterWrap = $("#memory-day-filter");
  const days = [{date:"all", label:"All"}, ...DATA.itinerary.map(d=>({date:d.date, label:d.label}))];
  filterWrap.innerHTML = days.map(d=>`<button data-d="${d.date}" class="${memoryDayFilter===d.date?'active':''}">${d.label}</button>`).join("");
  $$("#memory-day-filter button").forEach(b=> b.onclick = ()=>{ memoryDayFilter = b.dataset.d; renderMemories(); });

  const list = DATA.memories.filter(m=> memoryDayFilter==="all" || m.day===memoryDayFilter).sort((a,b)=>b.ts-a.ts);
  const grid = $("#memory-grid");
  if(!list.length){
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="e">📸</div><p>No memories yet for this day.<br>Tap "Add a Memory" to start the scrapbook.</p></div>`;
    return;
  }
  grid.innerHTML = list.map(m=>`
    <div class="polaroid">
      <img src="${m.photo}" alt="">
      <p class="cap">${escapeHtml(m.caption||"")}</p>
      <p class="date">${m.day||""}</p>
    </div>`).join("");
}
function openAddMemoryModal(){
  openModal(`
    <h3>Add a Memory 📸</h3>
    <label>Photo</label>
    <input type="file" id="mem-photo" accept="image/*">
    <label>Caption</label>
    <input type="text" id="mem-caption" placeholder="What happened here?" maxlength="80">
    <label>Day</label>
    <select id="mem-day">${DATA.itinerary.map(d=>`<option value="${d.date}">${d.label}</option>`).join("")}</select>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" id="mem-save">Save</button>
    </div>
  `);
  $("#mem-save").onclick = async ()=>{
    const file = $("#mem-photo").files[0];
    if(!file){ toast("Pick a photo first"); return; }
    const photo = await fileToDataUrl(file, 1000);
    DATA.memories.push({ id: uid(), day: $("#mem-day").value, caption: $("#mem-caption").value, photo, ts: Date.now() });
    saveState();
    closeModal();
    renderMemories();
    renderHQ();
    launchConfetti();
  };
}
function fileToDataUrl(file, maxDim){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = ()=>{
      const img = new Image();
      img.onload = ()=>{
        let {width,height} = img;
        if(width>height && width>maxDim){ height = height*(maxDim/width); width=maxDim; }
        else if(height>maxDim){ width = width*(maxDim/height); height=maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width=width; canvas.height=height;
        canvas.getContext("2d").drawImage(img,0,0,width,height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* =========================================================
   GANG
========================================================= */
function renderGang(){
  $("#gang-cards").innerHTML = DATA.friends.map(f=>`
    <div class="gang-card">
      <div class="avatar">${f.photo?`<img src="${f.photo}" style="width:100%;height:100%;object-fit:cover">`:"🙂"}</div>
      <div>
        <div class="name">${escapeHtml(f.name)}</div>
        <div class="nick">${escapeHtml(f.nickname||"")}</div>
        <div class="title">${escapeHtml(f.title||"")}</div>
        <div class="power">⚡ ${escapeHtml(f.superpower||"")}</div>
        ${f.quote?`<div class="quote">"${escapeHtml(f.quote)}"</div>`:""}
        <div class="pts">${f.points} Goa Points · ${f.challengesCompleted} challenges</div>
      </div>
    </div>`).join("");
}

/* =========================================================
   BIRTHDAY
========================================================= */
function renderBirthday(){
  $("#birthday-title").textContent = DATA.birthday.title;
  $("#birthday-subtitle").textContent = DATA.birthday.subtitle;
  $("#birthday-surprise").textContent = DATA.birthday.surprise;

  const msgWrap = $("#birthday-messages");
  msgWrap.innerHTML = DATA.birthday.messages.length ? DATA.birthday.messages.map(m=>`
    <div class="bmsg"><div class="from">${escapeHtml(m.from)}</div><div class="txt">${escapeHtml(m.text)}</div></div>`).join("")
    : `<p class="muted">No messages yet — be the first to write one!</p>`;

  fillFriendSelect($("#msg-from"));
  $("#btn-add-message").onclick = ()=>{
    const text = $("#msg-text").value.trim();
    if(!text) return;
    const fromF = friendById($("#msg-from").value);
    DATA.birthday.messages.push({from: fromF?(fromF.nickname||fromF.name):"Someone", text});
    saveState();
    $("#msg-text").value="";
    renderBirthday();
  };
  maybeUnlockBirthdayCard();
}

/* =========================================================
   EXPENSES
========================================================= */
function renderExpenses(){
  const total = DATA.expenses.reduce((s,e)=>s+Number(e.amount||0),0);
  $("#exp-total").textContent = "₹"+total.toLocaleString("en-IN");
  const perPerson = DATA.friends.length ? Math.round(total/DATA.friends.length) : 0;
  $("#exp-per-person").textContent = "₹"+perPerson.toLocaleString("en-IN");

  // compute balances
  const balance = {}; DATA.friends.forEach(f=>balance[f.id]=0);
  DATA.expenses.forEach(e=>{
    const included = e.includedIds && e.includedIds.length ? e.includedIds : DATA.friends.map(f=>f.id);
    const amt = Number(e.amount||0);
    const share = e.split==="custom" && e.customShares ? null : amt/included.length;
    included.forEach(fid=>{
      const s = share!==null ? share : Number((e.customShares||{})[fid]||0);
      if(balance[fid]!==undefined) balance[fid] -= s;
    });
    if(balance[e.payerId]!==undefined) balance[e.payerId] += amt;
  });
  const debtors = Object.entries(balance).filter(([,v])=>v<-0.5).map(([id,v])=>({id,v:-v}));
  const creditors = Object.entries(balance).filter(([,v])=>v>0.5).map(([id,v])=>({id,v}));
  const settlements = [];
  let di=0, ci=0;
  while(di<debtors.length && ci<creditors.length){
    const amt = Math.min(debtors[di].v, creditors[ci].v);
    settlements.push({from:debtors[di].id, to:creditors[ci].id, amt: Math.round(amt)});
    debtors[di].v -= amt; creditors[ci].v -= amt;
    if(debtors[di].v<0.5) di++;
    if(creditors[ci].v<0.5) ci++;
  }
  $("#exp-settlements").innerHTML = settlements.length ? settlements.map(s=>`
    <div class="settle-row"><span>${escapeHtml(friendById(s.from)?.name||"?")} → ${escapeHtml(friendById(s.to)?.name||"?")}</span><span class="amt">₹${s.amt}</span></div>`).join("")
    : `<p class="muted">All settled up 🎉</p>`;

  $("#exp-list").innerHTML = DATA.expenses.length ? [...DATA.expenses].reverse().map(e=>`
    <div class="exp-row">
      <div><div class="t">${escapeHtml(e.title)}</div><div class="s">Paid by ${escapeHtml(friendById(e.payerId)?.name||"?")}</div></div>
      <div style="text-align:right;">
        <div class="amt">₹${Number(e.amount).toLocaleString("en-IN")}</div>
        <span class="${e.settled?'settled-tag':'unsettled-tag'}" data-id="${e.id}" style="cursor:pointer;">${e.settled?'Settled':'Unsettled'}</span>
      </div>
    </div>`).join("") : `<p class="muted">No expenses logged yet.</p>`;
  $$("#exp-list [data-id]").forEach(tag=>{
    tag.onclick = ()=>{ const e = DATA.expenses.find(x=>x.id===tag.dataset.id); e.settled=!e.settled; saveState(); renderExpenses(); };
  });
}
function openAddExpenseModal(){
  openModal(`
    <h3>Add Expense 💸</h3>
    <label>Title</label>
    <input type="text" id="exp-title" placeholder="e.g. Beach shack dinner">
    <label>Amount (₹)</label>
    <input type="number" id="exp-amount" placeholder="0">
    <label>Paid by</label>
    <select id="exp-payer">${DATA.friends.map(f=>`<option value="${f.id}">${escapeHtml(f.name)}</option>`).join("")}</select>
    <label>Split between</label>
    ${DATA.friends.map(f=>`<div class="check-row"><input type="checkbox" checked value="${f.id}" class="exp-inc"> ${escapeHtml(f.name)}</div>`).join("")}
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" id="exp-save">Save</button>
    </div>
  `);
  $("#exp-save").onclick = ()=>{
    const title = $("#exp-title").value.trim();
    const amount = Number($("#exp-amount").value);
    if(!title || !amount){ toast("Add a title and amount"); return; }
    const includedIds = $$(".exp-inc").filter(c=>c.checked).map(c=>c.value);
    DATA.expenses.push({ id: uid(), title, amount, payerId: $("#exp-payer").value, includedIds, split:"equal", settled:false });
    saveState(); closeModal(); renderExpenses();
  };
}

/* =========================================================
   RECAP
========================================================= */
function renderRecap(){
  $("#recap-photos").textContent = DATA.memories.length;
  const totalChallenges = DATA.friends.reduce((s,f)=>s+f.challengesCompleted,0);
  $("#recap-challenges").textContent = totalChallenges;
  const winner = [...DATA.friends].sort((a,b)=>b.points-a.points)[0];
  $("#recap-winner").textContent = winner ? (winner.nickname||winner.name) : "—";

  $("#recap-awards").innerHTML = DATA.awards.map(a=>`
    <div class="award-card"><div class="t">${escapeHtml(a.title)}</div>
    <div class="winner">${a.winnerId ? escapeHtml(friendById(a.winnerId)?.nickname || friendById(a.winnerId)?.name || "") : "Not decided yet"}</div></div>`).join("");

  const top = [...DATA.memories].sort((a,b)=>b.ts-a.ts).slice(0,6);
  $("#recap-memories").innerHTML = top.length ? top.map(m=>`
    <div class="polaroid"><img src="${m.photo}" alt=""><p class="cap">${escapeHtml(m.caption||"")}</p></div>`).join("")
    : `<p class="muted">No memories saved yet.</p>`;
}

/* =========================================================
   ADMIN
========================================================= */
function renderAdmin(){
  const unlocked = sessionStorage.getItem(SESSION_ADMIN_KEY)==="1";
  $("#admin-lock").classList.toggle("hidden", unlocked);
  $("#admin-panel").classList.toggle("hidden", !unlocked);
  if(unlocked) renderAdminTab(currentAdminTab);
}
$("#btn-admin-unlock") && ($("#btn-admin-unlock").onclick = ()=>{
  if($("#admin-pass-input").value === DATA.trip.adminPassword){
    sessionStorage.setItem(SESSION_ADMIN_KEY,"1");
    renderAdmin();
  } else toast("Wrong password");
});

function renderAdminTab(tab){
  currentAdminTab = tab;
  $$(".admin-tab").forEach(b=> b.classList.toggle("active", b.dataset.tab===tab));
  const c = $("#admin-content");
  if(tab==="friends") c.innerHTML = adminFriendsHtml();
  else if(tab==="itinerary") c.innerHTML = adminItineraryHtml();
  else if(tab==="birthday") c.innerHTML = adminBirthdayHtml();
  else if(tab==="wheel") c.innerHTML = adminListHtml("wheel.challenges", DATA.wheel.challenges, ["text","category","points"]);
  else if(tab==="quiz") c.innerHTML = adminQuizHtml();
  else if(tab==="bingo") c.innerHTML = adminBingoHtml();
  else if(tab==="tdc") c.innerHTML = adminTdcHtml();
  else if(tab==="missions") c.innerHTML = adminMissionsHtml();
  else if(tab==="awards") c.innerHTML = adminAwardsHtml();
  else if(tab==="settings") c.innerHTML = adminSettingsHtml();
  bindAdminHandlers(tab);
}

function adminFriendsHtml(){
  return DATA.friends.map((f,i)=>`
    <div class="admin-block" data-i="${i}">
      <label>Name</label><input type="text" data-f="name" value="${escapeHtml(f.name)}">
      <label>Nickname</label><input type="text" data-f="nickname" value="${escapeHtml(f.nickname)}">
      <label>Funny Title</label><input type="text" data-f="title" value="${escapeHtml(f.title)}">
      <label>Goa Superpower</label><input type="text" data-f="superpower" value="${escapeHtml(f.superpower)}">
      <label>Quote (optional)</label><input type="text" data-f="quote" value="${escapeHtml(f.quote)}">
      <label>Photo</label><input type="file" accept="image/*" data-f="photo">
      <label>Points</label><input type="number" data-f="points" value="${f.points}">
    </div>`).join("");
}
function adminItineraryHtml(){
  return DATA.itinerary.map((d,i)=>`
    <div class="admin-block" data-i="${i}">
      <label>${d.label} — Day title</label><input type="text" data-f="dayTitle" value="${escapeHtml(d.dayTitle)}">
      <label>Cover photo</label><input type="file" accept="image/*" data-f="cover">
      <label>Morning</label><input type="text" data-f="morning" value="${escapeHtml(d.morning.text)}">
      <label>Afternoon</label><input type="text" data-f="afternoon" value="${escapeHtml(d.afternoon.text)}">
      <label>Evening</label><input type="text" data-f="evening" value="${escapeHtml(d.evening.text)}">
      <label>Nightlife</label><input type="text" data-f="nightlife" value="${escapeHtml(d.nightlife.text)}">
      <label>Restaurant</label><input type="text" data-f="restaurant" value="${escapeHtml(d.restaurant)}">
      <label>Beach</label><input type="text" data-f="beach" value="${escapeHtml(d.beach)}">
      <label>Activity</label><input type="text" data-f="activity" value="${escapeHtml(d.activity)}">
      <label>Transport</label><input type="text" data-f="transport" value="${escapeHtml(d.transport)}">
      <label>Map URL</label><input type="text" data-f="mapUrl" value="${escapeHtml(d.mapUrl)}">
      <label>Cost estimate</label><input type="text" data-f="costEstimate" value="${escapeHtml(d.costEstimate)}">
      <label>Notes</label><textarea data-f="notes">${escapeHtml(d.notes)}</textarea>
    </div>`).join("");
}
function adminBirthdayHtml(){
  const b = DATA.birthday;
  return `<div class="admin-block">
    <label>Birthday person's name</label><input type="text" id="bd-name" value="${escapeHtml(b.name)}">
    <label>Birthday date & time</label><input type="datetime-local" id="bd-datetime" value="${toLocalInput(b.dateTime)}">
    <label>Title</label><input type="text" id="bd-title" value="${escapeHtml(b.title)}">
    <label>Subtitle</label><input type="text" id="bd-subtitle" value="${escapeHtml(b.subtitle)}">
    <label>Secret surprise note</label><textarea id="bd-surprise">${escapeHtml(b.surprise)}</textarea>
  </div>
  <button class="btn-primary" id="save-birthday">Save Birthday Settings</button>`;
}
function toLocalInput(iso){ const d = new Date(iso); const pad=n=>String(n).padStart(2,"0"); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; }

function adminListHtml(path, arr, fields){
  return arr.map((item,i)=>`
    <div class="admin-block" data-i="${i}" data-path="${path}">
      ${fields.map(f=>`<label>${f}</label><input type="text" data-f="${f}" value="${escapeHtml(item[f])}">`).join("")}
      <div class="admin-row-actions"><button class="remove-btn" data-remove="${path}:${i}">Remove</button></div>
    </div>`).join("") + `<button class="small-btn" data-add="${path}">+ Add item</button>`;
}
function adminQuizHtml(){
  const qs = DATA.quiz.questions;
  return `<div class="admin-block"><label>Quiz title</label><input type="text" id="quiz-title" value="${escapeHtml(DATA.quiz.title)}"></div>` +
  qs.map((q,i)=>`
    <div class="admin-block" data-i="${i}">
      <label>Question</label><input type="text" data-f="q" value="${escapeHtml(q.q)}">
      <label>Options (comma separated)</label><input type="text" data-f="options" value="${escapeHtml(q.options.join(", "))}">
      <label>Correct option (0-indexed)</label><input type="number" data-f="correctIndex" value="${q.correctIndex}">
      <div class="admin-row-actions"><button class="remove-btn" data-remove="quiz.questions:${i}">Remove</button></div>
    </div>`).join("") + `<button class="small-btn" data-add="quiz.questions">+ Add question</button>`;
}
function adminBingoHtml(){
  return `<div class="admin-block"><label>Grid size</label><input type="number" id="bingo-size" value="${DATA.bingo.size}"></div>` +
  DATA.bingo.tiles.map((t,i)=>`
    <div class="admin-block" data-i="${i}">
      <label>Tile ${i+1}</label><input type="text" data-f="tile" value="${escapeHtml(t)}">
      <div class="admin-row-actions"><button class="remove-btn" data-remove="bingo.tiles:${i}">Remove</button></div>
    </div>`).join("") + `<button class="small-btn" data-add="bingo.tiles">+ Add tile</button>`;
}
function adminTdcHtml(){
  const groups = [["truths","Truths"],["dares","Dares"],["goaChallenges","Goa Challenges"]];
  return groups.map(([key,label])=>`
    <div class="admin-block">
      <label>${label} (one per line)</label>
      <textarea data-tdc="${key}" style="min-height:100px">${DATA.truthDareChallenge[key].join("\n")}</textarea>
    </div>`).join("") + `<button class="btn-primary" id="save-tdc">Save Truth/Dare/Challenge</button>`;
}
function adminMissionsHtml(){
  return DATA.friends.map(f=>{
    const existing = DATA.secretMissions.find(m=>m.friendId===f.id);
    return `<div class="admin-block" data-friend="${f.id}">
      <label>${escapeHtml(f.name)}'s secret mission</label>
      <textarea data-mission="${f.id}">${escapeHtml(existing?existing.mission:"")}</textarea>
    </div>`;
  }).join("") + `<button class="btn-primary" id="save-missions">Save Missions</button>`;
}
function adminAwardsHtml(){
  return DATA.awards.map((a,i)=>`
    <div class="admin-block" data-i="${i}">
      <label>Award title</label><input type="text" data-f="title" value="${escapeHtml(a.title)}">
      <div class="admin-row-actions"><button class="remove-btn" data-remove="awards:${i}">Remove</button></div>
    </div>`).join("") + `<button class="small-btn" data-add="awards">+ Add award</button>`;
}
function adminSettingsHtml(){
  const t = DATA.trip;
  return `<div class="admin-block">
    <label>WhatsApp group name</label><input type="text" id="s-groupname" value="${escapeHtml(t.groupName)}">
    <label>Tagline</label><input type="text" id="s-tagline" value="${escapeHtml(t.tagline)}">
    <label>Trip start</label><input type="datetime-local" id="s-start" value="${toLocalInput(t.startDate)}">
    <label>Trip end</label><input type="datetime-local" id="s-end" value="${toLocalInput(t.endDate)}">
    <label>WhatsApp invite URL</label><input type="text" id="s-wa" value="${escapeHtml(t.whatsappUrl)}">
    <label>Enable entry PIN?</label>
    <select id="s-pinenabled"><option value="false" ${!t.pinEnabled?'selected':''}>No</option><option value="true" ${t.pinEnabled?'selected':''}>Yes</option></select>
    <label>Entry PIN</label><input type="text" id="s-pin" value="${escapeHtml(t.pin)}">
    <label>Admin password</label><input type="text" id="s-adminpass" value="${escapeHtml(t.adminPassword)}">
  </div>
  <button class="btn-primary" id="save-settings">Save Settings</button>
  <p class="muted" style="margin-top:14px;">Heads up: without a shared backend, Goa Points, Bingo progress and votes are stored per phone/browser, not synced across the group. See the README for how to add Firebase later if you want a shared live leaderboard.</p>`;
}

function bindAdminHandlers(tab){
  $$(".admin-tab").forEach(b=> b.onclick = ()=> renderAdminTab(b.dataset.tab));

  if(tab==="friends"){
    $$("#admin-content .admin-block").forEach(block=>{
      const i = +block.dataset.i;
      block.querySelectorAll("input[data-f]").forEach(inp=>{
        if(inp.type==="file"){
          inp.onchange = async ()=>{ if(inp.files[0]) { DATA.friends[i].photo = await fileToDataUrl(inp.files[0], 400); saveState(); toast("Photo updated"); } };
        } else {
          inp.onchange = ()=>{ DATA.friends[i][inp.dataset.f] = inp.type==="number"?Number(inp.value):inp.value; saveState(); };
        }
      });
    });
  }
  else if(tab==="itinerary"){
    $$("#admin-content .admin-block").forEach(block=>{
      const i = +block.dataset.i;
      block.querySelectorAll("[data-f]").forEach(inp=>{
        if(inp.type==="file"){
          inp.onchange = async ()=>{ if(inp.files[0]){ DATA.itinerary[i].cover = await fileToDataUrl(inp.files[0], 900); saveState(); toast("Cover updated"); } };
        } else {
          inp.onchange = ()=>{
            const f = inp.dataset.f;
            if(["morning","afternoon","evening","nightlife"].includes(f)) DATA.itinerary[i][f].text = inp.value;
            else DATA.itinerary[i][f] = inp.value;
            saveState();
          };
        }
      });
    });
  }
  else if(tab==="birthday"){
    $("#save-birthday").onclick = ()=>{
      DATA.birthday.name = $("#bd-name").value;
      DATA.birthday.dateTime = new Date($("#bd-datetime").value).toISOString();
      DATA.birthday.title = $("#bd-title").value;
      DATA.birthday.subtitle = $("#bd-subtitle").value;
      DATA.birthday.surprise = $("#bd-surprise").value;
      saveState(); toast("Saved 🎂"); birthdayUnlocked=false;
    };
  }
  else if(tab==="wheel"){
    bindGenericList("wheel.challenges");
  }
  else if(tab==="quiz"){
    $("#quiz-title").onchange = ()=>{ DATA.quiz.title = $("#quiz-title").value; saveState(); };
    $$("#admin-content .admin-block[data-i]").forEach(block=>{
      const i = +block.dataset.i;
      block.querySelectorAll("[data-f]").forEach(inp=>{
        inp.onchange = ()=>{
          if(inp.dataset.f==="options") DATA.quiz.questions[i].options = inp.value.split(",").map(s=>s.trim()).filter(Boolean);
          else if(inp.dataset.f==="correctIndex") DATA.quiz.questions[i].correctIndex = Number(inp.value);
          else DATA.quiz.questions[i].q = inp.value;
          saveState();
        };
      });
    });
    bindRemoveAdd("quiz.questions", ()=>({q:"New question?", options:["A","B","C","D"], correctIndex:0}));
  }
  else if(tab==="bingo"){
    $("#bingo-size").onchange = ()=>{ DATA.bingo.size = Number($("#bingo-size").value); saveState(); };
    $$("#admin-content .admin-block[data-i]").forEach(block=>{
      const i = +block.dataset.i;
      block.querySelector("[data-f='tile']").onchange = (e)=>{ DATA.bingo.tiles[i] = e.target.value; saveState(); };
    });
    bindRemoveAdd("bingo.tiles", ()=>"New tile");
  }
  else if(tab==="tdc"){
    $("#save-tdc").onclick = ()=>{
      ["truths","dares","goaChallenges"].forEach(k=>{
        DATA.truthDareChallenge[k] = $(`[data-tdc="${k}"]`).value.split("\n").map(s=>s.trim()).filter(Boolean);
      });
      saveState(); toast("Saved 🃏");
    };
  }
  else if(tab==="missions"){
    $("#save-missions").onclick = ()=>{
      DATA.friends.forEach(f=>{
        const val = $(`[data-mission="${f.id}"]`).value.trim();
        const existing = DATA.secretMissions.find(m=>m.friendId===f.id);
        if(existing) existing.mission = val;
        else if(val) DATA.secretMissions.push({friendId:f.id, mission:val});
      });
      saveState(); toast("Missions saved 🕵️");
    };
  }
  else if(tab==="awards"){
    $$("#admin-content .admin-block[data-i]").forEach(block=>{
      const i = +block.dataset.i;
      block.querySelector("[data-f='title']").onchange = (e)=>{ DATA.awards[i].title = e.target.value; saveState(); };
    });
    bindRemoveAdd("awards", ()=>({title:"New Award 🏆", winnerId:""}));
  }
  else if(tab==="settings"){
    $("#save-settings").onclick = ()=>{
      DATA.trip.groupName = $("#s-groupname").value;
      DATA.trip.tagline = $("#s-tagline").value;
      DATA.trip.startDate = new Date($("#s-start").value).toISOString();
      DATA.trip.endDate = new Date($("#s-end").value).toISOString();
      DATA.trip.whatsappUrl = $("#s-wa").value;
      DATA.trip.pinEnabled = $("#s-pinenabled").value==="true";
      DATA.trip.pin = $("#s-pin").value;
      DATA.trip.adminPassword = $("#s-adminpass").value;
      saveState(); toast("Settings saved ✅");
      applyTripBasics();
    };
  }
}
function bindGenericList(path){
  const arr = getByPath(path);
  $$("#admin-content .admin-block[data-i]").forEach(block=>{
    const i = +block.dataset.i;
    block.querySelectorAll("[data-f]").forEach(inp=>{
      inp.onchange = ()=>{ arr[i][inp.dataset.f] = inp.dataset.f==="points"?Number(inp.value):inp.value; saveState(); };
    });
  });
  bindRemoveAdd(path, ()=>({text:"New challenge", category:"Funny", points:10}));
}
function bindRemoveAdd(path, factory){
  $$(`[data-remove^="${path}:"]`).forEach(btn=>{
    btn.onclick = ()=>{
      const i = +btn.dataset.remove.split(":")[1];
      getByPath(path).splice(i,1); saveState(); renderAdminTab(currentAdminTab);
    };
  });
  const addBtn = $(`[data-add="${path}"]`);
  if(addBtn) addBtn.onclick = ()=>{ getByPath(path).push(factory()); saveState(); renderAdminTab(currentAdminTab); };
}
function getByPath(path){
  return path.split(".").reduce((o,k)=>o[k], DATA);
}

/* export / import / reset */
function bindAdminIO(){
  $("#btn-export").onclick = ()=>{
    const blob = new Blob([JSON.stringify(DATA,null,2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "chalo-goa-data.json";
    a.click();
  };
  $("#import-file").onchange = (e)=>{
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{ DATA = migrate(JSON.parse(reader.result)); saveState(); toast("Data imported ✅"); location.reload(); }
      catch(err){ toast("Invalid file"); }
    };
    reader.readAsText(file);
  };
  $("#btn-reset").onclick = ()=>{
    openModal(`<h3>Reset all data?</h3><p class="muted">This clears everything on this device and can't be undone.</p>
      <div class="modal-actions"><button class="btn-secondary" onclick="closeModal()">Cancel</button><button class="btn-danger" id="confirm-reset">Yes, reset</button></div>`);
    $("#confirm-reset").onclick = ()=>{ localStorage.removeItem(STORAGE_KEY); location.reload(); };
  };
}

/* =========================================================
   MISC UI: toast, confetti, who-are-you
========================================================= */
function toast(msg){
  const t = el(`<div style="position:fixed;left:50%;bottom:100px;transform:translateX(-50%);background:#0B1F3A;border:1px solid rgba(255,255,255,.2);color:#fff;padding:10px 18px;border-radius:999px;font-size:13px;font-weight:700;z-index:300;box-shadow:0 8px 20px rgba(0,0,0,.4);">${escapeHtml(msg)}</div>`);
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 2200);
}
function launchConfetti(){
  const layer = $("#global-confetti");
  const emojis = ["🎉","🎊","🌴","✨","🥳"];
  for(let i=0;i<24;i++){
    const piece = el(`<div class="confetti-piece">${emojis[Math.floor(Math.random()*emojis.length)]}</div>`);
    piece.style.left = Math.random()*100+"%";
    piece.style.top = "-20px";
    piece.style.animationDuration = (1.5+Math.random()*1.5)+"s";
    piece.style.fontSize = (14+Math.random()*10)+"px";
    layer.appendChild(piece);
    setTimeout(()=>piece.remove(), 3200);
  }
}
function openWhoAreYou(){
  openModal(`<h3>Who are you? 🙋</h3><p class="muted">This just helps the games and missions know which friend is using this phone.</p>
    <select id="whoami-select">${DATA.friends.map(f=>`<option value="${f.id}">${escapeHtml(f.name)}</option>`).join("")}</select>
    <div class="modal-actions"><button class="btn-primary" id="whoami-save" style="width:100%;">Save</button></div>`);
  const sel = $("#whoami-select"); const me = getMe(); if(me) sel.value = me;
  $("#whoami-save").onclick = ()=>{ setMe(sel.value); closeModal(); toast("Saved! Enjoy Goa 🏝️"); };
}

/* =========================================================
   BOOT
========================================================= */
function applyTripBasics(){
  $("#splash-group-name").textContent = DATA.trip.groupName;
  $("#splash-tagline").innerHTML = DATA.trip.tagline;
  const start = new Date(DATA.trip.startDate), end = new Date(DATA.trip.endDate);
  const fmt = d => d.toLocaleDateString("en-GB", {day:"2-digit", month:"short"}).toUpperCase();
  $("#splash-dates").textContent = `${fmt(start)} → ${fmt(end)}`;
  $("#menu-whatsapp").href = DATA.trip.whatsappUrl;
  $("#whatsapp-fab").href = DATA.trip.whatsappUrl;
}

function initNav(){
  $$(".nav-btn[data-nav]").forEach(b=> b.onclick = ()=> navigate(b.dataset.nav));
  $$("[data-nav]").forEach(b=>{
    if(!b.classList.contains("nav-btn")) b.addEventListener("click", (e)=>{ e.preventDefault(); navigate(b.dataset.nav); });
  });
  $("#btn-menu").onclick = ()=> $("#sidemenu").classList.remove("hidden");
  $("#btn-close-menu").onclick = closeSideMenu;
  $("#sidemenu").addEventListener("click",(e)=>{ if(e.target.id==="sidemenu") closeSideMenu(); });
}

function initEnterFlow(){
  $("#btn-enter-trip").onclick = ()=>{
    $("#view-splash").classList.add("hidden");
    if(DATA.trip.pinEnabled && sessionStorage.getItem(SESSION_PIN_KEY)!=="1"){
      $("#view-pin").classList.remove("hidden");
    } else {
      enterShell();
    }
  };
  $("#btn-pin-submit").onclick = ()=>{
    if($("#pin-input").value === DATA.trip.pin){
      sessionStorage.setItem(SESSION_PIN_KEY,"1");
      $("#view-pin").classList.add("hidden");
      enterShell();
    } else {
      $("#pin-error").classList.remove("hidden");
    }
  };
}
function enterShell(){
  $("#shell").classList.remove("hidden");
  navigate("hq");
  if(!getMe()) setTimeout(openWhoAreYou, 400);
}

function initGameButtons(){
  $("#btn-add-memory").onclick = openAddMemoryModal;
  $("#btn-add-expense").onclick = openAddExpenseModal;
}

window.closeGamePanel = closeGamePanel;
window.closeModal = closeModal;

document.addEventListener("DOMContentLoaded", ()=>{
  applyTripBasics();
  initNav();
  initEnterFlow();
  initGameButtons();
  bindAdminIO();
  tickCountdowns();
  setInterval(tickCountdowns, 1000);

  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("sw.js").catch(()=>{});
  }
});
