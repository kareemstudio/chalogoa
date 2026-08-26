(function () {
  "use strict";
  const errBox = document.getElementById("err");
  function err(m) { try { errBox.style.display = "block"; errBox.textContent += m + "\n"; } catch (e) {} }
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

  /* ---------- localStorage ---------- */
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  const FAVS = new Set(LS.get("cg_favs", []));
  const LANG_EMOJI = {}; ROT.forEach((r) => (LANG_EMOJI[r.id] = r.emoji));

  /* ---------- covers ---------- */
  function coverFor(song) {
    const e = LANG_EMOJI[song.rotation] || "🎵";
    const map = { Hindi: ["#ff7a3c", "#ffce5a"], Punjabi: ["#ff4fa3", "#7a1e5a"], English: ["#0e6ba8", "#2ec4b6"] };
    const c = map[song.lang] || ["#ff5d73", "#0e6ba8"];
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='" + c[0] + "'/><stop offset='1' stop-color='" + c[1] + "'/></linearGradient></defs><rect width='300' height='300' fill='url(#g)'/><text x='150' y='195' font-size='140' text-anchor='middle'>" + e + "</text></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  /* ---------- toast / confetti ---------- */
  let toastT;
  function toast(m) {
    const t = $("#toast"); t.textContent = m; t.classList.remove("hidden");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.add("hidden"), 1900);
  }
  function confetti(n) {
    const layer = $("#confetti"); const em = ["🎉", "🎊", "🎈", "🥳", "✨", "🎂", "🌴", "🪩"];
    for (let i = 0; i < (n || 60); i++) {
      const s = document.createElement("i");
      s.textContent = em[Math.floor(Math.random() * em.length)];
      s.style.left = Math.random() * 100 + "vw";
      s.style.fontSize = 12 + Math.random() * 20 + "px";
      s.style.animationDuration = 2.4 + Math.random() * 2 + "s";
      s.style.animationDelay = Math.random() * 0.6 + "s";
      layer.appendChild(s);
      setTimeout(() => s.remove(), 5200);
    }
  }

  /* ---------- state ---------- */
  const state = { radioLang: "hindi", plLang: "all", shuffle: false, repeat: false };
  let cur = null, ytReady = false, playing = false, progT = null, pending = null;
  const favMatch = (s) => s && FAVS.has(s.id);

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
  (function loadYT() {
    const tag = document.createElement("script"); tag.src = "https://www.youtube.com/iframe_api";
    tag.onerror = function () { err("YouTube script failed to load (offline?). Audio will not play."); };
    document.head.appendChild(tag);
  })();

  function pool() {
    const l = state.radioLang;
    return SONGS.filter((s) => norm(s.lang) === l);
  }
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
    cur = song;
    LS.set("cg_last", song.id);
    renderNowPlaying();
    if (ytReady && yt && yt.loadVideoById) {
      yt.loadVideoById({ videoId: song.id, startSeconds: 0 });
      if (!autoplay) yt.pauseVideo();
      if (autoplay) yt.playVideo();
    } else {
      pending = function () { yt.loadVideoById({ videoId: song.id, startSeconds: 0 }); if (autoplay) yt.playVideo(); };
      toast("Loading Goa Radio…");
    }
    $("#mini").classList.add("show");
  }
  function play() {
    if (!cur) { const f = pool()[0]; if (f) load(f, true); return; }
    if (ytReady && yt && yt.playVideo) yt.playVideo(); else pending = play;
  }
  function pause() { if (ytReady && yt && yt.pauseVideo) yt.pauseVideo(); playing = false; setPlayingUI(false); }
  function toggle() { playing ? pause() : play(); }
  function next() { const s = pickNext(); if (s) load(s, true); else play(); }
  function prev() {
    if (ytReady && yt && yt.getCurrentTime && yt.getCurrentTime() > 3) { yt.seekTo(0); return; }
    const s = pickPrev(); if (s) load(s, true);
  }
  function setVol(v) { if (ytReady && yt && yt.setVolume) yt.setVolume(v); LS.set("cg_vol", v); }

  /* ---------- progress ---------- */
  function startProg() {
    clearInterval(progT);
    progT = setInterval(function () {
      if (!ytReady || !yt || !yt.getDuration) return;
      const d = yt.getDuration() || cur.dur || 0; const c = yt.getCurrentTime() || 0;
      const pct = d ? (c / d) * 100 : 0;
      $("#r-bar").style.width = pct + "%"; $("#np-bar").style.width = pct + "%";
      $("#r-cur").textContent = fmt(c); $("#np-cur").textContent = fmt(c);
      $("#r-dur").textContent = fmt(d); $("#np-dur").textContent = fmt(d);
    }, 400);
  }

  /* ---------- render now playing everywhere ---------- */
  function renderNowPlaying() {
    if (!cur) return;
    const cov = coverFor(cur);
    $("#r-cover").src = cov; $("#np-big").src = cov; $("#m-cover").src = cov;
    $("#r-title").textContent = cur.title; $("#np-title").textContent = cur.title;
    $("#m-title").textContent = cur.title;
    $("#r-artist").textContent = cur.artist + (cur.film ? " · " + cur.film : "");
    $("#np-artist").textContent = cur.artist + (cur.film ? " · " + cur.film : "");
    $("#m-artist").textContent = cur.artist;
    $("#r-lang").textContent = cur.lang; $("#np-lang").textContent = cur.lang;
    const lc = norm(cur.lang);
    $("#np-bg").className = "np-bg " + lc;
    $$(".track").forEach((el) => el.classList.toggle("playing", el.dataset.id === cur.id));
    refreshFav();
  }
  function setPlayingUI(on) {
    const sym = on ? "⏸" : "▶";
    ["#r-play", "#np-play", "#m-play"].forEach((s) => ($(s).textContent = sym));
    $("#eq").classList.toggle("paused", !on);
    $("#menu-eq").classList.toggle("paused", !on);
    $("#m-wave").classList.toggle("paused", !on);
  }
  function refreshFav() {
    const on = favMatch(cur);
    ["#r-fav", "#np-fav"].forEach((s) => { $(s).textContent = on ? "♥" : "♡"; $(s).classList.toggle("on", on); });
    $$(".track").forEach((el) => { const b = el.querySelector(".track-fav"); if (b) { const f = FAVS.has(el.dataset.id); b.classList.toggle("on", f); b.textContent = f ? "♥" : "♡"; } });
  }
  function toggleFav() {
    if (!cur) return; if (FAVS.has(cur.id)) FAVS.delete(cur.id); else FAVS.add(cur.id);
    LS.set("cg_favs", Array.from(FAVS)); refreshFav(); toast(FAVS.has(cur.id) ? "Added to favourites ♥" : "Removed from favourites");
  }

  /* ---------- navigation ---------- */
  function show(view) {
    $$(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + view));
    $$(".bn").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    $$(".menu-nav a").forEach((a) => a.classList.toggle("active", a.dataset.view === view));
    closeMenu(); closeNp();
    window.scrollTo(0, 0);
    if (view === "journey") requestAnimationFrame(updateCar);
  }
  function closeMenu() { $("#menu").classList.remove("show"); }
  function closeNp() { $("#nowplaying").classList.remove("show"); }
  function openNp() { if (!cur) { play(); } $("#nowplaying").classList.add("show"); }

  /* ---------- radio language selector ---------- */
  function buildLangSel() {
    const wrap = $("#lang-sel");
    ["hindi", "punjabi", "english"].forEach((l) => {
      const b = document.createElement("button");
      b.textContent = l[0].toUpperCase() + l.slice(1);
      b.className = state.radioLang === l ? "on" : "";
      b.onclick = function () { state.radioLang = l; buildLangSel(); toast("Radio: " + l); };
      wrap.appendChild(b);
    });
  }

  /* ---------- playlist ---------- */
  function buildPlChips() {
    const wrap = $("#pl-chips"); wrap.innerHTML = "";
    ["all", "hindi", "punjabi", "english"].forEach((l) => {
      const b = document.createElement("button");
      b.textContent = l === "all" ? "All" : l[0].toUpperCase() + l.slice(1);
      b.className = state.plLang === l ? "on" : "";
      b.onclick = function () { state.plLang = l; buildPlChips(); renderPlaylist(); };
      wrap.appendChild(b);
    });
  }
  function renderPlaylist() {
    const wrap = $("#playlist"); wrap.innerHTML = "";
    ROT.forEach((rot) => {
      let list = SONGS.filter((s) => s.rotation === rot.id);
      if (state.plLang !== "all") list = list.filter((s) => norm(s.lang) === state.plLang);
      if (!list.length) return;
      const h = document.createElement("div"); h.className = "pl-section"; h.textContent = rot.emoji + " " + rot.name; wrap.appendChild(h);
      list.forEach((s) => wrap.appendChild(trackRow(s)));
    });
  }
  function trackRow(s) {
    const row = document.createElement("div"); row.className = "track"; row.dataset.id = s.id;
    if (cur && cur.id === s.id) row.classList.add("playing");
    row.innerHTML =
      '<img class="track-art" src="' + coverFor(s) + '" alt="" />' +
      '<div class="track-meta"><div class="track-title">' + esc(s.title) + '</div><div class="track-artist">' + esc(s.artist) + " · " + esc(s.lang) + "</div></div>" +
      '<button class="track-fav' + (FAVS.has(s.id) ? " on" : "") + '">' + (FAVS.has(s.id) ? "♥" : "♡") + "</button>" +
      '<span class="track-dur">' + fmt(s.dur) + "</span>";
    row.querySelector(".track-fav").onclick = function (e) { e.stopPropagation(); if (FAVS.has(s.id)) FAVS.delete(s.id); else FAVS.add(s.id); LS.set("cg_favs", Array.from(FAVS)); renderPlaylist(); };
    row.onclick = function () { load(s, true); toast("▶ " + s.title); };
    return row;
  }

  /* ---------- crew ---------- */
  function renderCrew() {
    const wrap = $("#crew-list"); wrap.innerHTML = "";
    (TRIP.friends || []).forEach((f) => {
      const c = document.createElement("div"); c.className = "crew-card";
      c.innerHTML =
        '<span class="crew-tape">GOA SQUAD</span>' +
        '<div class="crew-photo">' + (f.emoji || "🙂") + "</div>" +
        '<div class="crew-name">' + esc(f.name) + "</div>" +
        '<span class="crew-badge">' + esc(f.nick || "") + "</span>" +
        '<div class="crew-tag">' + esc(f.title || "") + "</div>" +
        '<div class="crew-stamp">' + (f.emoji || "🙂") + "</div>";
      wrap.appendChild(c);
    });
  }

  /* ---------- vibes / memories ---------- */
  function renderVibes() {
    const g = $("#vibes-grid"); g.innerHTML = "";
    const items = [
      { b: "Beach Shacks", c: "linear-gradient(135deg,#2ec4b6,#0e6ba8)", s: "CHILL" },
      { b: "Tito's Night", c: "linear-gradient(135deg,#ff4fa3,#7a1e5a)", s: "WILD", tall: true },
      { b: "Sunset Points", c: "linear-gradient(135deg,#ff7a3c,#ffce5a)" },
      { b: "Scooter Rides", c: "linear-gradient(135deg,#ff5d73,#ffce5a)", s: "VIBE" },
      { b: "Candlelight", c: "linear-gradient(135deg,#0e6ba8,#2ec4b6)" },
      { b: "Cake Moments", c: "linear-gradient(135deg,#ffce5a,#ff5d73)", s: "YUM", wide: true },
    ];
    items.forEach((it) => {
      const d = document.createElement("div");
      d.className = "vibe" + (it.tall ? " tall" : "") + (it.wide ? " wide" : "");
      d.style.background = it.c;
      d.innerHTML = (it.s ? '<span class="v-sticker">' + it.s + "</span>" : "") + "<b>" + esc(it.b) + "</b>";
      g.appendChild(d);
    });
  }
  function renderMemories() {
    const g = $("#mem-grid"); g.innerHTML = "";
    ["DAY 1 · TOUCHDOWN", "DAY 2 · KAREEM DAY", "DAY 3 · NO PLANS", "DAY 4 · LAST SPLASH"].forEach((t, i) => {
      const m = document.createElement("div"); m.className = "mem";
      m.innerHTML = '<div class="mem-ph">' + ["✈️", "🎂", "🛵", "🌊"][i] + '</div><div class="mem-tag">' + esc(t) + "</div>";
      g.appendChild(m);
    });
  }

  /* ---------- birthday ---------- */
  function initBirthday() {
    const card = $("#bday-card");
    const active = LS.get("cg_bday", false);
    if (active) card.classList.add("on");
    $("#bday-activate").onclick = function () {
      const on = card.classList.toggle("on");
      LS.set("cg_bday", on);
      if (on) { confetti(80); toast("🎉 Birthday Mode ON"); }
      else toast("Birthday Mode OFF");
    };
  }

  /* ---------- journey car ---------- */
  function updateCar() {
    if (!$("#view-journey").classList.contains("active")) return;
    const road = $("#road"); const r = road.getBoundingClientRect(); const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height * 0.2)));
    $("#road-car").style.top = p * (r.height - 50) + "px";
  }
  window.addEventListener("scroll", updateCar, { passive: true });

  /* ---------- wire up ---------- */
  function wire() {
    $("#btn-menu").onclick = () => $("#menu").classList.add("show");
    $("#menu-close").onclick = closeMenu;
    $$(".menu-nav a").forEach((a) => (a.onclick = () => show(a.dataset.view)));
    $$(".bn").forEach((b) => (b.onclick = () => show(b.dataset.view)));
    $("#cta-trip").onclick = () => show("journey");
    $("#cta-radio").onclick = () => show("radio");
    $("#wa-join").href = TRIP.whatsapp || "https://chat.whatsapp.com/Eqhqy3MxclnJtjKXbwQicW";

    ["#r-play", "#np-play", "#m-play"].forEach((s) => ($(s).onclick = toggle));
    $("#r-next").onclick = next; $("#np-next").onclick = next; $("#m-next").onclick = next;
    $("#r-prev").onclick = prev; $("#np-prev").onclick = prev;
    function setShuffle(on) { state.shuffle = on; ["#r-shuffle", "#np-shuffle"].forEach((s) => $(s).classList.toggle("on", on)); toast("Shuffle " + (on ? "ON" : "OFF")); }
    $("#r-shuffle").onclick = () => setShuffle(!state.shuffle);
    $("#np-shuffle").onclick = () => setShuffle(!state.shuffle);
    function setRepeat(on) { state.repeat = on; ["#r-repeat", "#np-repeat"].forEach((s) => $(s).classList.toggle("on", on)); toast("Repeat " + (on ? "ON" : "OFF")); }
    $("#r-repeat").onclick = () => setRepeat(!state.repeat);
    $("#np-repeat").onclick = () => setRepeat(!state.repeat);
    $("#r-fav").onclick = toggleFav; $("#np-fav").onclick = toggleFav;
    $("#r-vol").oninput = (e) => setVol(+e.target.value);
    $("#np-vol").oninput = (e) => setVol(+e.target.value);
    $("#np-vol").value = LS.get("cg_vol", 80); $("#r-vol").value = LS.get("cg_vol", 80);

    $("#r-cover").onclick = openNp;
    $("#mini").onclick = function (e) { if (e.target.closest(".c-btn")) return; openNp(); };
    $("#np-close").onclick = closeNp;
    $("#np-bg").onclick = closeNp;
    $("#pl-shuffle").onclick = function () { setShuffle(true); const p = pool(); if (p.length) load(p[Math.floor(Math.random() * p.length)], true); };
  }

  /* ---------- boot ---------- */
  function boot() {
    buildLangSel(); buildPlChips(); renderPlaylist(); renderCrew(); renderVibes(); renderMemories(); initBirthday(); wire();
    const lastId = LS.get("cg_last", null);
    if (lastId) { const s = SONGS.find((x) => x.id === lastId); if (s) { cur = s; renderNowPlaying(); $("#mini").classList.add("show"); } }
    setPlayingUI(false);
    confetti(24);
    toast("CHALO GOA loaded 🌴");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
