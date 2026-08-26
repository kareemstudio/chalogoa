(function () {
  "use strict";
  const errBox = document.getElementById("err");
  function err(m) { if (errBox) { errBox.style.display = "block"; errBox.textContent += m + "\n"; } }
  window.addEventListener("error", function (e) { err("⚠ " + (e.message || e.error) + (e.filename ? " @ " + e.filename + ":" + e.lineno : "")); });

  const RADIO = window.GOA_RADIO || { songs: [], rotations: [] };
  const TRIP = window.TRIP || { friends: [] };
  const SONGS = RADIO.songs || [];
  const ROT = RADIO.rotations || [];
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.prototype.slice.call(document.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (t) => { t = Math.max(0, Math.floor(t || 0)); const m = Math.floor(t / 60); const s = t % 60; return m + ":" + (s < 10 ? "0" : "") + s; };
  const norm = (s) => String(s || "").toLowerCase();

  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  const FAVS = new Set(LS.get("cg_favs", []));
  const state = { radioLang: "hindi", shuffle: false, repeat: false };
  let cur = null, ytReady = false, playing = false, progT = null, pending = null, loaded = false;

  let toastT;
  function toast(m) { const t = $("#toast"); if (!t) return; t.textContent = m; t.classList.remove("hidden"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.add("hidden"), 1900); }

  /* ---------- YouTube player (audio-only) ---------- */
  let yt = null;
  window.onYouTubeIframeAPIReady = function () {
    yt = new YT.Player("yt-player", {
      height: "1", width: "1",
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, modestbranding: 1, rel: 0, playsinline: 1 },
      events: {
        onReady: function () {
          ytReady = true;
          const v = LS.get("cg_vol", 80); if (yt.setVolume) yt.setVolume(v);
          if (pending) { const p = pending; pending = null; p(); }
        },
        onStateChange: function (e) {
          if (e.data === YT.PlayerState.PLAYING) { playing = true; setPlayingUI(true); startProg(); }
          else if (e.data === YT.PlayerState.PAUSED) { playing = false; setPlayingUI(false); }
          else if (e.data === YT.PlayerState.ENDED) { if (state.repeat) play(); else next(); }
        },
      },
    });
  };
  (function () {
    const t = document.createElement("script"); t.src = "https://www.youtube.com/iframe_api";
    t.onerror = function () { err("YouTube script failed to load (offline?). Audio will not play."); };
    document.head.appendChild(t);
  })();

  function pool() { return SONGS.filter((s) => norm(s.lang) === state.radioLang); }
  function pickNext() {
    const p = pool(); if (!p.length) return null;
    if (state.shuffle) return p[Math.floor(Math.random() * p.length)];
    let i = p.indexOf(cur); i = (i + 1) % p.length; return p[i];
  }
  function pickPrev() {
    const p = pool(); if (!p.length) return null;
    let i = p.indexOf(cur); i = (i - 1 + p.length) % p.length; return p[i];
  }
  function load(song, autoplay) {
    if (!song) return;
    cur = song; loaded = true; LS.set("cg_last", song.id); renderNow();
    if (ytReady && yt && yt.loadVideoById) {
      yt.loadVideoById({ videoId: song.id, startSeconds: 0 });
      if (autoplay) yt.playVideo(); else yt.pauseVideo();
    } else {
      pending = function () { yt.loadVideoById({ videoId: song.id, startSeconds: 0 }); if (autoplay) yt.playVideo(); };
      toast("Loading Goa Radio…");
    }
  }
  function play() {
    if (!cur) { const f = pool()[0]; if (f) load(f, true); return; }
    if (loaded) { if (ytReady && yt && yt.playVideo) yt.playVideo(); else pending = play; }
    else load(cur, true);
  }
  function pause() { if (ytReady && yt && yt.pauseVideo) yt.pauseVideo(); playing = false; setPlayingUI(false); }
  function toggle() { playing ? pause() : play(); }
  function next() { const s = pickNext(); if (s) load(s, true); else play(); }
  function prev() { if (ytReady && yt && yt.getCurrentTime && yt.getCurrentTime() > 3) { yt.seekTo(0); return; } const s = pickPrev(); if (s) load(s, true); }
  function setVol(v) { if (ytReady && yt && yt.setVolume) yt.setVolume(v); LS.set("cg_vol", v); }
  function startProg() {
    clearInterval(progT);
    progT = setInterval(function () {
      if (!ytReady || !yt || !yt.getDuration) return;
      const d = yt.getDuration() || (cur && cur.dur) || 0; const c = yt.getCurrentTime() || 0;
      const pct = d ? (c / d) * 100 : 0;
      const f = $("#np-fill"); if (f) f.style.width = pct + "%";
      const curEl = $("#np-cur"); if (curEl) curEl.textContent = fmt(c);
      const durEl = $("#np-dur"); if (durEl) durEl.textContent = fmt(d);
    }, 400);
  }
  function renderNow() {
    if (!cur) return;
    const t = $("#np-title"); if (t) t.textContent = cur.title;
    const a = $("#np-artist"); if (a) a.textContent = cur.artist + (cur.film ? " • " + cur.film : "") + " • " + cur.lang;
    const c = $("#np-cur"); if (c) c.textContent = "0:00";
    const d = $("#np-dur"); if (d) d.textContent = fmt(cur.dur);
    $$(".trackrow").forEach((el) => el.classList.toggle("playing", el.dataset.id === cur.id));
    refreshFav();
  }
  function setPlayingUI(on) {
    const p = $("#play"); if (p) p.textContent = on ? "❚❚" : "▶";
    const st = $("#stereo"); if (st) st.classList.toggle("playing", on);
  }
  function refreshFav() {
    const on = cur && FAVS.has(cur.id);
    const f = $("#fav"); if (f) { f.textContent = on ? "♥" : "♡"; f.classList.toggle("on", on); }
    $$(".trackrow .fav").forEach((b) => { const id = b.closest(".trackrow").dataset.id; const fo = FAVS.has(id); b.textContent = fo ? "♥" : "♡"; b.classList.toggle("on", fo); });
  }
  function toggleFavId(id) { if (FAVS.has(id)) FAVS.delete(id); else FAVS.add(id); LS.set("cg_favs", Array.from(FAVS)); }
  function toggleFav() { if (!cur) return; toggleFavId(cur.id); refreshFav(); }

  /* ---------- navigation ---------- */
  const screens = $$(".screen");
  const navBtns = $$(".nav [data-go]");
  function go(id) {
    screens.forEach((s) => s.classList.toggle("active", s.id === id));
    navBtns.forEach((b) => b.classList.toggle("active", b.dataset.go === id));
    const el = document.getElementById(id); if (el) el.scrollTo(0, 0);
  }
  $$("[data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));

  const more = document.getElementById("more");
  const moreMenu = document.getElementById("moreMenu");
  function showMoreMenu() { if (moreMenu) moreMenu.style.display = "block"; $$(".detail").forEach((d) => d.classList.remove("active")); }
  const moreBtn = document.getElementById("moreBtn"); if (moreBtn) moreBtn.onclick = () => { if (more) more.classList.add("open"); showMoreMenu(); };
  const closeMore = document.getElementById("closeMore"); if (closeMore) closeMore.onclick = () => { if (more) more.classList.remove("open"); };
  $$("[data-detail]").forEach((b) => (b.onclick = () => { if (moreMenu) moreMenu.style.display = "none"; const d = document.getElementById("detail-" + b.dataset.detail); if (d) d.classList.add("active"); if (more) more.scrollTo(0, 0); }));

  /* ---------- crew ---------- */
  function renderCrew() {
    const w = $("#crew-list"); if (!w) return; w.innerHTML = "";
    (TRIP.friends || []).forEach((f) => {
      const c = document.createElement("div"); c.className = "crew-card";
      c.innerHTML = '<div class="photo">' + (f.emoji || "📸") + '</div><div><h3>' + esc(f.name) + "</h3><p>" + esc(f.title || "") + '</p><span class="tag">' + esc(f.nick || "GOA CREW") + "</span></div>";
      w.appendChild(c);
    });
  }

  /* ---------- playlist ---------- */
  function trackRow(s) {
    const row = document.createElement("div"); row.className = "trackrow"; row.dataset.id = s.id;
    const fav = FAVS.has(s.id);
    row.innerHTML = '<div class="thumb"></div><div><b>' + esc(s.title) + "</b><small>" + esc(s.artist) + " • " + esc(s.lang) + '</small></div><button class="fav' + (fav ? " on" : "") + '">' + (fav ? "♥" : "♡") + "</button>";
    row.querySelector(".fav").onclick = function (e) { e.stopPropagation(); toggleFavId(s.id); renderPlaylist(); };
    row.onclick = function () { load(s, true); toast("▶ " + s.title); };
    if (cur && cur.id === s.id) row.classList.add("playing");
    return row;
  }
  function renderPlaylist() {
    const w = $("#playlist"); if (!w) return; w.innerHTML = "";
    ROT.forEach((rot) => {
      let list = SONGS.filter((s) => s.rotation === rot.id);
      if (state.radioLang !== "all") list = list.filter((s) => norm(s.lang) === state.radioLang);
      if (!list.length) return;
      const h = document.createElement("div"); h.className = "pl-section"; h.textContent = rot.emoji + " " + rot.name.toUpperCase(); w.appendChild(h);
      list.forEach((s) => w.appendChild(trackRow(s)));
    });
  }

  /* ---------- birthday ---------- */
  function initBirthday() {
    const btn = $("#partyBtn"); if (!btn) return;
    btn.onclick = function () {
      const bd = $("#birthday"); const on = bd.classList.toggle("party");
      const mode = $("#mode"); if (mode) mode.textContent = on ? "BIRTHDAY MODE: ON" : "BIRTHDAY MODE: OFF";
      btn.textContent = on ? "🎉 BIRTHDAY MODE ACTIVE" : "🎉 ACTIVATE BIRTHDAY MODE";
    };
  }

  /* ---------- wire player ---------- */
  function wire() {
    const p = $("#play"); if (p) p.onclick = toggle;
    const pv = $("#prev"); if (pv) pv.onclick = prev;
    const nx = $("#next"); if (nx) nx.onclick = next;
    const sh = $("#shuffle"); if (sh) sh.onclick = function () { state.shuffle = !state.shuffle; sh.classList.toggle("on", state.shuffle); toast("Shuffle " + (state.shuffle ? "ON" : "OFF")); };
    const rp = $("#repeat"); if (rp) rp.onclick = function () { state.repeat = !state.repeat; rp.classList.toggle("on", state.repeat); toast("Repeat " + (state.repeat ? "ON" : "OFF")); };
    const fv = $("#fav"); if (fv) fv.onclick = toggleFav;
    const vol = $("#vol"); if (vol) { vol.oninput = (e) => setVol(+e.target.value); vol.value = LS.get("cg_vol", 80); }
    const sr = $("#shuffleRoad"); if (sr) sr.onclick = function () { state.shuffle = true; if (sh) sh.classList.add("on"); const p2 = pool(); if (p2.length) load(p2[Math.floor(Math.random() * p2.length)], true); };
    $$(".tab").forEach((t) => (t.onclick = function () {
      $$(".tab").forEach((x) => x.classList.remove("active")); t.classList.add("active");
      state.radioLang = t.dataset.lang; renderPlaylist(); toast("Radio: " + t.dataset.lang.toUpperCase());
    }));
  }

  /* ---------- boot ---------- */
  function boot() {
    renderCrew(); renderPlaylist(); initBirthday(); wire();
    const last = LS.get("cg_last", null);
    if (last) { const s = SONGS.find((x) => x.id === last); if (s) { cur = s; renderNow(); } }
    if (!cur && pool()[0]) { cur = pool()[0]; renderNow(); }
    setPlayingUI(false);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
