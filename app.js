/* AIR CHALO CG-2409 — The Goa Game (front-end). Music-first, local-first, Supabase-optional. */
(function () {
  "use strict";
  const DB = window.DB, SB = window.SB, TRIP = window.TRIP, RADIO = window.GOA_RADIO, CONTENT = window.CG_CONTENT;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const me = () => DB.profiles.get(myId);
  let myId = localStorage.getItem("cg_myid") || "";

  window.addEventListener("error", (e) => { const el = $("#err"); if (el) { el.style.display = "block"; el.textContent = "⚠ " + (e.message || e.error || "error"); } });

  function toast(m) { const el = $("#toast"); if (!el) return; el.textContent = m; el.classList.remove("hidden"); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.add("hidden"), 2200); }
  function confetti() { const layer = $("#confetti"); if (!layer) return; ["🎉", "🌴", "🥥", "✈️", "🎂", "🪩"].forEach((b) => { const p = document.createElement("i"); p.textContent = b; p.style.left = Math.random() * 100 + "%"; p.style.animationDuration = 1.1 + Math.random() + "s"; p.style.fontSize = 12 + Math.random() * 14 + "px"; layer.appendChild(p); setTimeout(() => p.remove(), 1800); }); }
  function rel(ts) { if (!ts) return ""; const s = Math.max(0, Math.floor((Date.now() - new Date(ts).getTime()) / 1000)); if (s < 60) return s + "s ago"; if (s < 3600) return Math.floor(s / 60) + "m ago"; if (s < 86400) return Math.floor(s / 3600) + "h ago"; return Math.floor(s / 86400) + "d ago"; }

  /* ===================== MUSIC ===================== */
  let player = null, ytReady = false, playing = false, liveClock = true, current = null, langFilter = "all";
  const CH_NO = { highway: "01", shack: "02", sunset: "03", tito: "04", birthday: "05" };
  const istParts = (d = new Date()) => { const o = {}; new Intl.DateTimeFormat("en-GB", { timeZone: RADIO.timezone, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(d).forEach((p) => o[p.type] = p.value); if (o.hour === "24") o.hour = "00"; return o; };
  const clockRotId = () => { const p = istParts(); const h = +p.hour; if (p.month === "09" && p.day === "25") return "birthday"; if (h >= 21 || h < 5) return "tito"; if (h < 11) return "highway"; if (h < 17) return "shack"; return "sunset"; };
  const rotById = (id) => RADIO.rotations.find((r) => r.id === id);
  const songsFor = (id) => RADIO.songs.filter((s) => s.rotation === id);
  const loopIndex = (rotId) => { const list = songsFor(rotId); const total = list.reduce((n, s) => n + (s.dur || 180), 0) || 1; const p = istParts(); let t = (+p.hour * 3600 + +p.minute * 60 + +p.second) % total; for (let i = 0; i < list.length; i++) { const d = list[i].dur || 180; if (t < d) return { song: list[i], offset: t, i }; t -= d; } return { song: list[0], offset: 0, i: 0 }; };
  const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const coverUrl = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  function paintSong(song, rotId) {
    current = song; const rot = rotById(rotId || song.rotation);
    $("#ch-pill").textContent = `CH ${CH_NO[rot.id]} · ${rot.name.toUpperCase()}`;
    const z = $("#ch-pill"); if (z) { z.classList.remove("go"); void z.offsetWidth; z.classList.add("go"); }
    $("#cover").src = coverUrl(song.id); $("#cover").onerror = () => ($("#cover").src = "icon.svg");
    $("#song-title").textContent = song.title;
    $("#song-artist").textContent = `${song.artist}${song.film ? " · " + song.film : ""} · ${song.year} · ${song.lang}`;
    $("#yt-link").href = `https://www.youtube.com/watch?v=${song.id}`;
    $("#ytm-link").href = `https://music.youtube.com/watch?v=${song.id}`;
    $$(".ch").forEach((b) => b.classList.toggle("on", b.dataset.id === rot.id));
  }
  function loadSong(song, seek, autoplay) { paintSong(song, song.rotation); if (!player || !ytReady) return; try { player.loadVideoById({ videoId: song.id, startSeconds: Math.max(0, Math.floor(seek || 0)) }); if (!autoplay) player.pauseVideo(); } catch (e) { try { player.cueVideoById({ videoId: song.id, startSeconds: Math.max(0, Math.floor(seek || 0)) }); } catch (e2) {} } }
  function playLive() { liveClock = true; const { song, offset } = loopIndex(clockRotId()); loadSong(song, offset, true); playing = true; syncPlayBtn(); }
  function skip(dir) { liveClock = false; const rot = current ? current.rotation : clockRotId(); const list = songsFor(rot); const i = Math.max(0, list.findIndex((s) => s.id === current && current.id)); loadSong(list[(i + dir + list.length) % list.length], 0, true); playing = true; syncPlayBtn(); }
  function setChannel(id) { liveClock = id === clockRotId(); const { song, offset } = loopIndex(id); loadSong(song, liveClock ? offset : 0, true); playing = true; syncPlayBtn(); }
  function syncPlayBtn() { const b = $("#btn-play"); if (b) b.textContent = playing ? "❚❚ PAUSE" : "▶ PLAY"; const disc = $("#cover"); if (disc) disc.classList.toggle("spin", playing); }
  function tickProgress() { if (!player || !ytReady) return; try { const t = player.getCurrentTime() || 0, d = (player.getDuration() || (current && current.dur) || 1); $("#bar").style.width = Math.min(100, (t / d) * 100) + "%"; $("#t-cur").textContent = fmt(t); $("#t-dur").textContent = fmt(d); } catch (e) {} }
  function renderChannels() { $("#channels").innerHTML = RADIO.rotations.map((r) => `<button type="button" class="ch" data-id="${r.id}"><span class="n">CH ${CH_NO[r.id]} ${r.emoji}</span><span class="nm">${esc(r.name)}</span><span class="hr">${esc(r.hours)}</span><span class="vb">${esc(r.vibe)}</span></button>`).join(""); $$("#channels .ch").forEach((b) => b.onclick = () => setChannel(b.dataset.id)); }
  function renderLangs() { const langs = ["all"].concat(Array.from(new Set(RADIO.songs.map((s) => s.lang)))); $("#lang-row").innerHTML = langs.map((l) => `<button data-lang="${l}" class="${l === "all" ? "on" : ""}">${l === "all" ? "ALL" : esc(l)}</button>`).join(""); $$("#lang-row button").forEach((b) => b.onclick = () => { langFilter = b.dataset.lang; $$("#lang-row button").forEach((x) => x.classList.toggle("on", x === b)); renderSongs(); }); }
  function renderSongs() { const list = RADIO.songs.filter((s) => langFilter === "all" || s.lang === langFilter); $("#song-list").innerHTML = list.map((s) => `<button type="button" class="song" data-id="${s.id}"><span class="lg">${esc(s.lang).slice(0, 3).toUpperCase()}</span><span><span class="ti">${esc(s.title)}</span><span class="ar"> · ${esc(s.artist)}</span><div class="nt">${esc(s.note || "")}</div></span><span class="ch-no">CH ${CH_NO[s.rotation]}</span></button>`).join(""); $$("#song-list .song").forEach((b) => b.onclick = () => { liveClock = false; loadSong(RADIO.songs.find((s) => s.id === b.dataset.id), 0, true); playing = true; syncPlayBtn(); }); }
  function bootYT() { window.onYouTubeIframeAPIReady = () => { try { player = new YT.Player("yt-player", { width: 1, height: 1, playerVars: { autoplay: 0, controls: 0, rel: 0, playsinline: 1, modestbranding: 1 }, events: { onReady: () => { ytReady = true; try { player.setVolume(+($("#vol").value || 80)); } catch (e) {} }, onStateChange: (e) => { if (e.data === YT.PlayerState.ENDED) { liveClock ? playLive() : skip(1); } if (e.data === YT.PlayerState.PLAYING) { playing = true; syncPlayBtn(); } if (e.data === YT.PlayerState.PAUSED) { playing = false; syncPlayBtn(); } }, onError: () => skip(1) } }); } catch (e) {} }; const tag = document.createElement("script"); tag.src = "https://www.youtube.com/iframe_api"; tag.onerror = () => {}; document.head.appendChild(tag); }

  /* ===================== BOARDING ===================== */
  function renderSeats() { $("#seat-select").innerHTML = TRIP.friends.map((f, i) => `<button type="button" class="seat-card ${myId === f.id ? "on" : ""}" data-id="${f.id}"><span class="sc-check">✓</span><span class="sc-seat">${DB.SEAT[i]}</span><div class="sc-emoji">${f.emoji}</div><div class="sc-name">${esc(f.name)}</div><div class="sc-nick">${esc(f.nick || "")}</div></button>`).join(""); $$("#seat-select .seat-card").forEach((b) => b.onclick = () => { myId = b.dataset.id; localStorage.setItem("cg_myid", myId); syncPass(); renderSeats(); }); }
  function syncPass() { const f = TRIP.friends.find((x) => x.id === myId); const i = TRIP.friends.findIndex((x) => x.id === myId); $("#pass-name").textContent = f ? f.name.toUpperCase() : "PICK A SEAT"; $("#pass-seat").textContent = f ? DB.SEAT[i] : "—"; $("#my-seat").textContent = f ? DB.SEAT[i] : "—"; const btn = $("#btn-board"); btn.disabled = !f; btn.textContent = f ? "BOARD CG-2409" : "PICK A SEAT FIRST"; }
  function board() { if (!myId) { toast("Pick a seat first"); return; } const ov = $("#takeoff"); ov.classList.remove("hidden"); let n = 0; $("#tk-line").textContent = "DOORS CLOSING"; const iv = setInterval(() => { n++; if (n < 3) $("#tk-line").textContent = ["CABIN LIGHTS", "AUX ARMED"][n - 1]; else { clearInterval(iv); ov.classList.add("hidden"); enterGame(); } }, 900); }
  function enterGame() {
    DB.passport.add(myId, "boarding");
    DB.addActivity({ user_id: myId, type: "join", text: "boarded CG-2409" });
    $("#app").classList.remove("hidden");
    setupNav(); renderAll(); subscribeAll();
    if (me() && me().id === "kareem") confetti();
    window.scrollTo({ top: $("#home").offsetTop - 10, behavior: "smooth" });
  }

  /* ===================== CHAPTER ===================== */
  function chapterInfo() { const now = new Date(); const start = new Date(TRIP.start), end = new Date(TRIP.end), bday = new Date(TRIP.birthday); const p = istParts(); const night = (+p.hour >= 21 || +p.hour < 5); if (now < start) return { t: "CHAPTER 0 — BEFORE DEPARTURE" }; if (now >= bday) return night ? { t: "CHAPTER 3 — THE BIRTHDAY 🎂" } : { t: "CHAPTER 2 — WELCOME TO GOA" }; if (now <= end) return night ? { t: "CHAPTER 4 — CHAOS MODE 🌙" } : { t: "CHAPTER 1 — BOARDING" }; return { t: "CHAPTER 5 — FLIGHT HOME" }; }
  function renderChapter() { const b = $("#chapter-banner"); if (b) b.textContent = chapterInfo().t; }

  /* ===================== DASHBOARD ===================== */
  function renderHead() { const p = me(); if (!p) return; const lb = DB.leaderboard(); const rank = lb.findIndex((x) => x.id === p.id) + 1; $("#dash-head").innerHTML = `<div class="dh-hello">WELCOME ABOARD, ${esc(p.name.toUpperCase())}</div><div class="dh-meta">Seat ${esc(p.seat)} · <b>${p.chaos_miles}</b> Chaos Miles · Rank #${rank} · ${DB.LEVEL_NAMES[p.level]}</div>`; }
  function renderDashMission() { const claimed = DB.missions.userMissions(myId).map((m) => m.mission_id); const next = DB.missions.all().find((m) => !claimed.includes(m.id)); const el = $("#dash-mission"); if (!next) { el.innerHTML = `<p class="sec-h">🎯 MISSION</p><p>All missions done. Legend. 😎</p>`; return; } el.innerHTML = `<p class="sec-h">🎯 SECRET MISSION</p><p class="dm-title">${esc(next.title)}</p><p class="dm-desc">${esc(next.description)}</p><p class="dm-pts">+${next.points}</p>`; }
  function renderDashVote() { const poll = DB.polls.current(); const el = $("#dash-vote"); if (!poll) { el.innerHTML = `<p class="sec-h">🗳 VOTE</p><p>No active vote.</p>`; return; } const voted = DB.polls.tally(poll.id).reduce((a, b) => a + b.count, 0); el.innerHTML = `<p class="sec-h">🗳 LIVE VOTE</p><p class="dv-q">${esc(poll.question)}</p><p class="dv-sub">${voted}/5 voted</p>`; }
  function renderDashGame() { const st = DB.ml.active() || { question: { text: "Start a round" } }; const el = $("#dash-game"); el.innerHTML = `<p class="sec-h">🎮 GAME</p><p class="dg-q">Most Likely To…</p><p class="dg-sub">${esc(st.question.text)}</p><a class="dg-link" href="#ml">Play →</a>`; }
  function renderActivity(target) { const el = target || $("#dash-activity"); if (!el) return; const acts = DB.getActivities().slice(0, 12); el.innerHTML = acts.map((a) => { const u = DB.profiles.get(a.user_id); return `<div class="act"><span class="act-av">${u ? u.avatar : "✈️"}</span><span class="act-txt">${u ? esc(u.name) : "Someone"} ${esc(a.text)}</span><span class="act-time">${rel(a.created_at)}</span></div>`; }).join("") || "<p class='muted'>No activity yet.</p>"; }

  /* ===================== MISSIONS ===================== */
  function renderMissions() {
    const claimed = DB.missions.userMissions(myId).map((m) => m.mission_id);
    $("#mission-list").innerHTML = DB.missions.all().map((m) => {
      const done = claimed.includes(m.id); const ev = DB.missions.userMissions(myId).find((x) => x.mission_id === m.id);
      return `<div class="mission ${done ? "done" : ""}">
        <div class="m-top"><span class="m-badge">${m.mtype === "secret" ? "🔒 CLASSIFIED" : m.mtype === "team" ? "👥 TEAM" : "🎯 PERSONAL"}</span><span class="m-pts">+${m.points}</span></div>
        <h3 class="m-title">${esc(m.title)}</h3>
        <p class="m-desc">${esc(m.description)}</p>
        ${done ? `<div class="m-done">✓ Done</div>${ev && ev.evidence_url ? `<img class="m-ev" src="${ev.evidence_url}" alt="evidence"/>` : ""}` : `<div class="m-actions"><button class="m-claim" data-id="${m.id}">COMPLETE MISSION</button><label class="m-up">UPLOAD EVIDENCE<input type="file" accept="image/*" data-id="${m.id}" class="m-file"/></label></div>`}
      </div>`;
    }).join("");
    $$("#mission-list .m-claim").forEach((b) => b.onclick = () => { DB.missions.claim(myId, b.dataset.id); toast("Mission complete! +miles"); renderMissions(); renderDashMission(); checkAch(); });
    $$("#mission-list .m-file").forEach((f) => f.onchange = () => { const file = f.files[0]; if (!file) return; const url = URL.createObjectURL(file); DB.missions.claim(myId, f.dataset.id, url); toast("Evidence uploaded"); renderMissions(); });
  }

  /* ===================== MOST LIKELY ===================== */
  let mlRevealing = false;
  function renderML() {
    const g = DB.ml.ensureRound(); const st = DB.ml.active(); const el = $("#ml-stage");
    const myVote = st ? st.votes.find((v) => v.voter_id === myId) : null;
    const voted = st ? st.votes.length : 0;
    el.innerHTML = `<div class="ml-card">
      <p class="ml-kicker">WHO IS MOST LIKELY TO…</p>
      <p class="ml-q">${esc(st ? st.question.text : "—")}</p>
      <div class="ml-opts">${TRIP.friends.map((f) => `<button class="ml-opt" data-id="${f.id}" ${myVote ? "disabled" : ""}>${f.emoji}<span>${esc(f.name)}</span></button>`).join("")}</div>
      <p class="ml-count">${voted}/5 voted${myVote ? " · you voted" : ""}</p>
      ${mlRevealing ? `<div class="ml-reveal" id="ml-reveal"></div>` : `<div class="ml-foot"><button class="ml-next" id="ml-next">Next question →</button></div>`}
    </div>`;
    $$("#ml-stage .ml-opt").forEach((b) => b.onclick = () => { DB.ml.vote(st.question.id, myId, b.dataset.id); toast("Vote locked"); renderML(); });
    const nx = $("#ml-next"); if (nx) nx.onclick = () => { mlRevealing = true; renderML(); runReveal(g.id); };
  }
  function runReveal(gid) {
    const box = $("#ml-reveal"); if (!box) return;
    let c = 3; box.textContent = c; const iv = setInterval(() => { c--; if (c > 0) { box.textContent = c; } else { clearInterval(iv); mlRevealing = false; const st = DB.ml.active(); const tally = {}; (st ? st.votes : []).forEach((v) => tally[v.selected_id] = (tally[v.selected_id] || 0) + 1); let win = null, max = 0; Object.entries(tally).forEach(([k, v]) => { if (v > max) { max = v; win = k; } }); const w = win ? DB.profiles.get(win) : null; box.innerHTML = `🥁<br><b>${w ? w.avatar + " " + esc(w.name) : "No votes"}</b>${win ? " — " + max + " votes 😂" : ""}`;
      if (win) { const wp = DB.profiles.get(win); wp.votes_recv = (wp.votes_recv || 0) + 1; DB.profiles.save(wp); }
      DB.ml.reveal(gid);
      DB.addActivity({ user_id: win, type: "ml_win", text: `won Most Likely To (${max} votes)` });
      setTimeout(() => { DB.ml.ensureRound(); renderML(); }, 3500);
    } }, 800);
  }

  /* ===================== BINGO ===================== */
  function renderBingo() { const squares = DB.bingo.squares(); const marks = DB.bingo.marks(myId); $("#bingo-grid").innerHTML = squares.map((s) => `<button class="bingo-sq ${marks.includes(s.idx) ? "on" : ""}" data-idx="${s.idx}"><span class="bs-ic">${s.icon}</span><span class="bs-lb">${esc(s.label)}</span></button>`).join(""); $$("#bingo-grid .bingo-sq").forEach((b) => b.onclick = () => { const m = DB.bingo.toggle(myId, +b.dataset.idx); checkBingo(m); renderBingo(); }); }
  function checkBingo(marks) {
    const lines = []; for (let i = 0; i < 5; i++) { lines.push([i * 5, i * 5 + 1, i * 5 + 2, i * 5 + 3, i * 5 + 4]); lines.push([i, i + 5, i + 10, i + 15, i + 20]); }
    lines.push([0, 6, 12, 18, 24]); lines.push([4, 8, 12, 16, 20]);
    const has = (l) => l.every((x) => marks.includes(x));
    const flag = "cg_bingo_line"; if (!localStorage.getItem(flag) && lines.some(has)) { localStorage.setItem(flag, "1"); DB.profiles.addMiles(myId, 300); toast("BINGO LINE! +300"); confetti(); }
    if (marks.length === 25 && !localStorage.getItem("cg_bingo_full")) { localStorage.setItem("cg_bingo_full", "1"); DB.profiles.addMiles(myId, 800); DB.ach.unlock(myId, "no_survivors"); toast("FULL BOARD! Legendary."); confetti(); }
  }

  /* ===================== VOTE ===================== */
  function loadPollVote(pid) { try { return JSON.parse(localStorage.getItem("cg_poll_" + pid) || "null"); } catch (e) { return null; } }
  function renderVote() { const poll = DB.polls.current(); const el = $("#poll-box"); if (!poll) { el.innerHTML = `<p>No active vote.</p>`; return; } const tally = DB.polls.tally(poll.id); const myVote = loadPollVote(poll.id); el.innerHTML = `<p class="poll-q">${esc(poll.question)}</p><div class="poll-opts">${poll.options.map((o, i) => `<button class="poll-opt ${myVote === i ? "on" : ""}" data-i="${i}">${esc(o)}</button>`).join("")}</div><div class="poll-tally">${tally.map((t) => `<div class="pt"><span>${esc(t.label)}</span><b>${t.count}</b></div>`).join("")}</div><button class="poll-close" id="poll-close">Close & reveal</button>`; $$("#poll-box .poll-opt").forEach((b) => b.onclick = () => { DB.polls.vote(poll.id, myId, +b.dataset.i); try { localStorage.setItem("cg_poll_" + poll.id, b.dataset.i); } catch (e) {} renderVote(); renderDashVote(); }); const c = $("#poll-close"); if (c) c.onclick = () => { DB.polls.close(poll.id); const t = DB.polls.tally(poll.id); const win = t.slice().sort((a, b) => b.count - a.count)[0]; toast(`Crew chose: ${win.label}`); DB.addActivity({ user_id: null, type: "poll", text: `crew voted ${win.label}` }); renderVote(); }; }

  /* ===================== PASSPORT / ACHIEVEMENTS ===================== */
  function renderPassport() { const stamps = DB.passport.stamps(myId); $("#passport-box").innerHTML = `<div class="pass-card"><div class="pc-head">REPUBLIC OF BAD IDEAS</div><div class="pc-sub">Passenger: ${esc(me().name)} · Flight CG-2409</div><div class="pc-stamps">${CONTENT.stamps.map((s) => `<div class="pc-stamp ${stamps.includes(s.id) ? "on" : ""}"><span>${s.icon}</span><b>${esc(s.label)}</b></div>`).join("")}</div></div>`; const un = DB.ach.unlocked(myId); $("#ach-grid").innerHTML = DB.ach.all().map((a) => `<div class="ach ${un.includes(a.id) ? "on" : ""}"><span class="ach-ic">${a.icon}</span><b>${esc(a.name)}</b><small>${un.includes(a.id) ? esc(a.description) : "???"}</small></div>`).join(""); }
  function checkAch() { const p = me(); if (!p) return; if (p.missions_done >= 3) DB.ach.unlock(myId, "goa_veteran"); if (DB.photos.all().filter((x) => x.user_id === myId).length >= 5) DB.ach.unlock(myId, "photographer"); if (p.chaos_miles >= 1800) { DB.ach.unlock(myId, "main_character"); DB.passport.add(myId, "champion"); } }

  /* ===================== WRAPPED ===================== */
  function renderWrapped() {
    const acts = DB.getActivities(); const photos = DB.photos.all();
    const totalMissions = DB.profiles.all().reduce((a, p) => a + (p.missions_done || 0), 0);
    const lb = DB.leaderboard(); const top = lb[0];
    $("#wrapped-box").innerHTML = `<div class="wrap-card">
      <h3>CG-2409 STATISTICS</h3>
      <div class="wc-stats">
        <div><b>${acts.length}</b><span>messages / events</span></div>
        <div><b>${photos.length}</b><span>photos</span></div>
        <div><b>${totalMissions}</b><span>missions done</span></div>
        <div><b>${lb.reduce((a, p) => a + (p.predictions_won || 0), 0)}</b><span>predictions won</span></div>
      </div>
      <h3>${esc(top.name)}'S GOA WRAPPED</h3>
      <div class="wc-card">
        <div class="wc-rank">🏆 Chaos Rank #${lb.findIndex((x) => x.id === top.id) + 1}</div>
        <div class="wc-row"><span>📷 Photos</span><b>${photos.filter((x) => x.user_id === top.id).length}</b></div>
        <div class="wc-row"><span>🎯 Missions</span><b>${top.missions_done || 0}</b></div>
        <div class="wc-row"><span>💎 Chaos Miles</span><b>${top.chaos_miles}</b></div>
        <div class="wc-row"><span>🌟 Level</span><b>${DB.LEVEL_NAMES[top.level]}</b></div>
      </div>
      <p class="wc-foot">Five passengers boarded. Five returned. Details remain classified.</p>
    </div>`;
  }

  /* ===================== NAV ===================== */
  function setupNav() {
    const nav = $("#nav"); const mq = window.matchMedia("(max-width: 880px)");
    const apply = () => nav.classList.toggle("mobile", mq.matches);
    apply(); if (mq.addEventListener) mq.addEventListener("change", apply); else if (mq.addListener) mq.addListener(apply);
    $$("#nav-links a").forEach((a) => a.onclick = () => { const t = document.getElementById(a.dataset.jump); if (t) window.scrollTo({ top: t.offsetTop - 10, behavior: "smooth" }); });
    const links = $$("#nav-links a"); const map = {}; links.forEach((a) => map[a.dataset.jump] = a);
    const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { links.forEach((l) => l.classList.remove("active")); if (map[e.target.id]) map[e.target.id].classList.add("active"); } }), { rootMargin: "-45% 0px -50% 0px" });
    ["home", "missions", "ml", "bingo", "vote", "passport", "music", "wrapped"].forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
  }

  /* ===================== CLOCKS ===================== */
  function tickClocks() {
    const p = istParts(); const el = $("#ist-clock"); if (el) el.textContent = `${p.hour}:${p.minute}:${p.second} IST · ${p.weekday}`;
    const start = new Date(TRIP.start), end = new Date(TRIP.end), now = new Date();
    let lbl = "DEPARTS IN", ms = start - now; if (now >= start && now <= end) { lbl = "IN THE AIR · REMAINING"; ms = end - now; } else if (now > end) { lbl = "LANDED"; ms = 0; }
    const set = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = String(v).padStart(2, "0"); };
    set("g-d", Math.floor(ms / 86400000)); set("g-h", Math.floor(ms % 86400000 / 3600000)); set("g-m", Math.floor(ms % 3600000 / 60000)); set("g-s", Math.floor(ms % 60000 / 1000));
    renderChapter();
  }

  /* ===================== SUBSCRIPTIONS ===================== */
  function subscribeAll() {
    DB.on("activities", () => { renderActivity(); renderHead(); });
    DB.on("profiles", () => { renderHead(); renderPassport(); });
    DB.on("poll_votes", () => { renderVote(); renderDashVote(); });
    DB.on("polls", () => { renderVote(); renderDashVote(); });
    DB.on("games", () => { if (!mlRevealing) renderML(); renderDashGame(); });
    DB.on("votes", () => { if (!mlRevealing) renderML(); });
    DB.on("questions", () => { if (!mlRevealing) renderML(); });
    DB.on("user_missions", () => { renderMissions(); renderDashMission(); checkAch(); });
    DB.on("bingo_marks", () => renderBingo());
    DB.on("user_achievements", () => { renderPassport(); });
    DB.on("passport", () => renderPassport());
    DB.on("photos", () => checkAch());
  }

  function renderAll() { renderHead(); renderDashMission(); renderDashVote(); renderDashGame(); renderActivity(); renderMissions(); renderML(); renderBingo(); renderVote(); renderPassport(); renderWrapped(); }

  /* ===================== INIT ===================== */
  function init() {
    DB.seed();
    renderSeats(); syncPass();
    $("#btn-board").onclick = board;
    renderChannels(); renderLangs(); renderSongs();
    $("#btn-play").onclick = () => { if (!ytReady) { toast("Cabin screen warming up… tap again"); return; } if (!current) playLive(); else if (playing) { player.pauseVideo(); playing = false; } else { player.playVideo(); playing = true; } syncPlayBtn(); };
    $("#btn-next").onclick = () => skip(1); $("#btn-prev").onclick = () => skip(-1); $("#btn-live").onclick = () => { playLive(); toast("Locked to Goa time"); };
    $("#scrub").onclick = (e) => { if (!player || !ytReady) return; const r = e.currentTarget.getBoundingClientRect(); const pct = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); try { player.seekTo((player.getDuration() || 0) * pct, true); liveClock = false; } catch (e2) {} };
    const vol = $("#vol"); if (vol) vol.oninput = (e) => { if (player && ytReady) try { player.setVolume(+e.target.value); } catch (e2) {} };
    bootYT();
    tickClocks(); setInterval(tickClocks, 1000); setInterval(tickProgress, 400);
    if (SB && SB.mode === "live") $("#mode-pill").textContent = "LIVE";
    // Music-first: start on first interaction anywhere.
    document.addEventListener("pointerdown", () => { if (!ytReady) return; if (!current) playLive(); }, { once: true });
  }

  // boot immediately (local-first); Supabase hydrates in background
  function boot() { try { init(); } catch (e) { const el = $("#err"); if (el) { el.style.display = "block"; el.textContent = "⚠ init: " + (e.message || e); } } try { setTimeout(confetti, 500); } catch (e2) {} DB.init().then(() => { try { if ($("#app") && !$("#app").classList.contains("hidden")) renderAll(); } catch (e3) {} }).catch(() => {}); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
