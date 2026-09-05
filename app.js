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
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>\"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (t) => { t = Math.max(0, Math.floor(t || 0)); const m = Math.floor(t / 60); const s = t % 60; return m + ":" + (s < 10 ? "0" : "") + s; };
  const norm = (s) => String(s || "").toLowerCase();
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const FAVS = new Set(LS.get("cg_favs", []));
  const state = { radioLang: "all", collection: "all", shuffle: false, repeat: false, search: "" };
  const COLLECTION_STYLES = [
    ["#ee6b49", "#182e3c"], ["#ddb957", "#275466"], ["#ca8494", "#261c32"], ["#1b9e9a", "#092c3b"], ["#b5d85d", "#31514b"], ["#86b9db", "#203550"], ["#e7a476", "#422b3b"]
  ];
  let cur = null, ytReady = false, playing = false, progT = null, pending = null, loaded = false, toastT;

  function toast(m) { const t = $("#toast"); if (!t) return; t.textContent = m; t.classList.remove("hidden"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.add("hidden"), 1900); }
  function rotationFor(song) { return ROT.find((r) => r.id === (song && song.rotation)) || ROT[0] || { name: "All songs", vibe: "Good songs for a good detour.", emoji: "✦" }; }
  function filteredSongs() {
    let list = SONGS.slice();
    if (state.radioLang !== "all") list = list.filter((s) => norm(s.lang) === state.radioLang);
    if (state.collection !== "all") list = list.filter((s) => s.rotation === state.collection);
    if (state.search) { const q = norm(state.search); list = list.filter((s) => norm(s.title + " " + s.artist + " " + s.film).includes(q)); }
    return list;
  }
  function pool() { return filteredSongs(); }
  function pickNext() { const p = pool().length ? pool() : SONGS; if (!p.length) return null; if (state.shuffle) return p[Math.floor(Math.random() * p.length)]; let i = p.indexOf(cur); return p[(i + 1 + p.length) % p.length]; }
  function pickPrev() { const p = pool().length ? pool() : SONGS; if (!p.length) return null; let i = p.indexOf(cur); return p[(i - 1 + p.length) % p.length]; }

  /* YouTube playback keeps the official video/artist view path intact. */
  let yt = null;
  window.onYouTubeIframeAPIReady = function () {
    yt = new YT.Player("yt-player", { height: "1", width: "1", playerVars: { autoplay: 0, controls: 0, disablekb: 1, modestbranding: 1, rel: 0, playsinline: 1 }, events: {
      onReady: function () { ytReady = true; const v = LS.get("cg_vol", 80); if (yt.setVolume) yt.setVolume(v); if (pending) { const p = pending; pending = null; p(); } },
      onStateChange: function (e) { if (e.data === YT.PlayerState.PLAYING) { playing = true; setPlayingUI(true); startProg(); } else if (e.data === YT.PlayerState.PAUSED) { playing = false; setPlayingUI(false); } else if (e.data === YT.PlayerState.ENDED) { if (state.repeat) play(); else next(); } }
    } });
  };
  (function () { const t = document.createElement("script"); t.src = "https://www.youtube.com/iframe_api"; t.onerror = function () { err("YouTube audio could not load. The catalogue is still available offline."); }; document.head.appendChild(t); }());

  function load(song, autoplay) {
    if (!song) return;
    cur = song; loaded = true; LS.set("cg_last", song.id); renderNow();
    if (ytReady && yt && yt.loadVideoById) { yt.loadVideoById({ videoId: song.id, startSeconds: 0 }); if (autoplay) yt.playVideo(); else yt.pauseVideo(); }
    else { pending = function () { yt.loadVideoById({ videoId: song.id, startSeconds: 0 }); if (autoplay) yt.playVideo(); }; toast("Loading Goa Radio…"); }
  }
  function play() { if (!cur) { const f = pool()[0] || SONGS[0]; if (f) load(f, true); return; } if (loaded) { if (ytReady && yt && yt.playVideo) yt.playVideo(); else pending = play; } else load(cur, true); }
  function pause() { if (ytReady && yt && yt.pauseVideo) yt.pauseVideo(); playing = false; setPlayingUI(false); }
  function toggle() { playing ? pause() : play(); }
  function next() { const s = pickNext(); if (s) load(s, true); }
  function prev() { if (ytReady && yt && yt.getCurrentTime && yt.getCurrentTime() > 3) { yt.seekTo(0); return; } const s = pickPrev(); if (s) load(s, true); }
  function setVol(v) { if (ytReady && yt && yt.setVolume) yt.setVolume(v); LS.set("cg_vol", v); }
  function startProg() { clearInterval(progT); progT = setInterval(function () { if (!ytReady || !yt || !yt.getDuration) return; const d = yt.getDuration() || (cur && cur.dur) || 0; const c = yt.getCurrentTime() || 0; const pct = d ? (c / d) * 100 : 0; const f = $("#np-fill"); if (f) f.style.width = pct + "%"; const curEl = $("#np-cur"); if (curEl) curEl.textContent = fmt(c); const durEl = $("#np-dur"); if (durEl) durEl.textContent = fmt(d); }, 400); }
  function renderNow() {
    if (!cur) return;
    const rot = rotationFor(cur);
    const title = $("#np-title"); if (title) title.textContent = cur.title;
    const artist = $("#np-artist"); if (artist) artist.textContent = cur.artist + (cur.film ? " • " + cur.film : "") + " • " + cur.lang;
    const d = $("#np-dur"); if (d) d.textContent = fmt(cur.dur);
    const homeTitle = $("#home-now-title"); if (homeTitle) homeTitle.textContent = cur.title;
    const homeArtist = $("#home-now-artist"); if (homeArtist) homeArtist.textContent = cur.artist;
    const homeLang = $("#home-now-lang"); if (homeLang) homeLang.textContent = norm(cur.lang).toUpperCase();
    const rotTitle = $("#player-rotation"); if (rotTitle) rotTitle.textContent = rot.name.toUpperCase();
    const rotSub = $("#player-rotation-sub"); if (rotSub) rotSub.textContent = (rot.vibe || "WINDOWS DOWN / VOLUME UP").split(".")[0].toUpperCase();
    const pc = $("#player-collection-name"); if (pc) pc.textContent = rot.name.toUpperCase();
    $$(".trackrow").forEach((el) => el.classList.toggle("playing", el.dataset.id === cur.id));
    refreshFav();
  }
  function setPlayingUI(on) { const p = $("#play"); if (p) p.textContent = on ? "Ⅱ" : "▶"; const hp = $("#homePlay"); if (hp) hp.textContent = on ? "Ⅱ" : "▶"; const st = $("#stereo"); if (st) st.classList.toggle("playing", on); const rail = $(".signal-card"); if (rail) rail.classList.toggle("playing", on); }
  function refreshFav() { const on = cur && FAVS.has(cur.id); const f = $("#fav"); if (f) { f.textContent = on ? "♥" : "♡"; f.classList.toggle("on", on); } $$(".trackrow .fav").forEach((b) => { const id = b.closest(".trackrow").dataset.id; const fo = FAVS.has(id); b.textContent = fo ? "♥" : "♡"; b.classList.toggle("on", fo); }); }
  function toggleFavId(id) { if (FAVS.has(id)) FAVS.delete(id); else FAVS.add(id); LS.set("cg_favs", Array.from(FAVS)); }
  function toggleFav() { if (!cur) return; toggleFavId(cur.id); refreshFav(); }

  /* Navigation */
  const screens = $$(".screen"); const navBtns = $$(".nav [data-go]");
  function go(id) { screens.forEach((s) => s.classList.toggle("active", s.id === id)); navBtns.forEach((b) => b.classList.toggle("active", b.dataset.go === id)); const el = document.getElementById(id); if (el) el.scrollTo(0, 0); }
  $$('[data-go]').forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));

  /* More sheet */
  const more = $("#more"); const moreMenu = $("#moreMenu");
  function showMoreMenu() { if (moreMenu) moreMenu.style.display = "block"; $$(".detail").forEach((d) => d.classList.remove("active")); if (more) more.setAttribute("aria-hidden", "true"); }
  function openMore() { if (more) { more.classList.add("open"); more.setAttribute("aria-hidden", "false"); } showMoreMenu(); }
  const moreBtn = $("#moreBtn"); if (moreBtn) moreBtn.onclick = openMore; const moreBottom = $("#moreBtnBottom"); if (moreBottom) moreBottom.onclick = openMore;
  const closeMore = $("#closeMore"); if (closeMore) closeMore.onclick = () => { if (more) { more.classList.remove("open"); more.setAttribute("aria-hidden", "true"); } };
  $$('[data-detail]').forEach((b) => (b.onclick = () => { if (moreMenu) moreMenu.style.display = "none"; const d = $("#detail-" + b.dataset.detail); if (d) d.classList.add("active"); if (more) more.scrollTo(0, 0); }));
  $$('[data-back-more]').forEach((b) => (b.onclick = showMoreMenu));

  /* Collection browsing */
  function collectionCard(rot, i) { const colors = COLLECTION_STYLES[i % COLLECTION_STYLES.length]; const count = SONGS.filter((s) => s.rotation === rot.id).length; const b = document.createElement("button"); b.className = "collection-card"; b.style.setProperty("--card-one", colors[0]); b.style.setProperty("--card-two", colors[1]); b.innerHTML = '<div class="collection-num"><span>' + String(i + 1).padStart(2, "0") + '</span><span>' + String(count).padStart(2, "0") + ' TRACKS</span></div><h3>' + esc(rot.name) + '</h3><p>' + esc(rot.vibe || "A handpicked Goa mood.") + '</p>'; b.onclick = () => { state.collection = rot.id; state.radioLang = "all"; renderCollectionChips(); renderPlaylist(); go("radio"); toast(rot.name.toUpperCase() + " LOADED"); }; return b; }
  function renderHomeCollections() { const w = $("#home-collections"); if (!w) return; w.innerHTML = ""; ROT.slice(0, 4).forEach((rot, i) => w.appendChild(collectionCard(rot, i))); }
  function renderCollectionChips() { const w = $("#radio-collections"); if (!w) return; w.innerHTML = ""; const all = document.createElement("button"); all.className = "collection-chip" + (state.collection === "all" ? " active" : ""); all.innerHTML = '<strong>All songs</strong><small>' + SONGS.length + ' tracks / full trip</small><em>' + SONGS.length + '<small>TRACKS</small></em><span class="chip-arrow">&gt;</span>'; all.onclick = () => { state.collection = "all"; renderCollectionChips(); renderPlaylist(); }; w.appendChild(all); const tags = { highway: "UPBEAT · ROAD TRIP · SUN ON SKIN", shack: "LAID-BACK · SALTY AIR · GOOD VIBES", sunset: "WARM · DREAMY · EASY HEART", tito: "DEEP · SMOOTH · NIGHT DRIVES", birthday: "FUN · DANCE · ALL TOGETHER" }; ROT.forEach((r) => { const count = SONGS.filter((s) => s.rotation === r.id).length; const b = document.createElement("button"); b.className = "collection-chip" + (state.collection === r.id ? " active" : ""); b.innerHTML = '<strong>' + esc(r.name) + '</strong><small>' + esc(tags[r.id] || "CURATED FOR THE CREW") + '</small><em>' + count + '<small>TRACKS</small></em><span class="chip-arrow">&gt;</span>'; b.onclick = () => { state.collection = r.id; renderCollectionChips(); renderPlaylist(); }; w.appendChild(b); }); }

  /* Crew */
  function renderCrew() { const w = $("#crew-list"); if (!w) return; w.innerHTML = ""; (TRIP.friends || []).forEach((f) => { const c = document.createElement("article"); c.className = "crew-card"; c.innerHTML = '<div class="crew-quote">“</div><div class="photo">' + (f.emoji || "✦") + '</div><h3>' + esc(f.name) + '</h3><p>' + esc(f.title || "") + '</p><span class="tag">' + esc(f.nick || "GOA CREW") + '</span>'; w.appendChild(c); }); }

  /* Playlist */
  function trackRow(s, index) { const row = document.createElement("div"); row.className = "trackrow"; row.dataset.id = s.id; const fav = FAVS.has(s.id); const r = rotationFor(s); const hue = COLLECTION_STYLES[Math.max(0, ROT.indexOf(r)) % COLLECTION_STYLES.length]; row.innerHTML = '<div class="thumb" style="--thumb-one:' + hue[0] + ';--thumb-two:' + hue[1] + '">' + String(index + 1).padStart(2, "0") + '</div><div><b>' + esc(s.title) + '</b><small>' + esc(s.artist) + ' • ' + esc(s.lang) + '</small></div><time>' + fmt(s.dur) + '</time><button class="fav' + (fav ? " on" : "") + '" aria-label="Favourite ' + esc(s.title) + '">' + (fav ? "♥" : "♡") + '</button>'; row.querySelector(".fav").onclick = function (e) { e.stopPropagation(); toggleFavId(s.id); renderPlaylist(); }; row.onclick = function () { load(s, true); toast("▶ " + s.title); }; if (cur && cur.id === s.id) row.classList.add("playing"); return row; }
  function renderPlaylist() { const w = $("#playlist"); if (!w) return; w.innerHTML = ""; const list = filteredSongs(); if (!list.length) { w.innerHTML = '<div style="padding:30px 0;color:var(--muted);font:11px DM Mono">NO SONGS MATCH THAT SEARCH. TRY ANOTHER DETOUR.</div>'; return; } let grouped = state.collection === "all" && !state.search; if (grouped) { ROT.forEach((rot) => { const songs = list.filter((s) => s.rotation === rot.id); if (!songs.length) return; const h = document.createElement("div"); h.className = "pl-section"; h.innerHTML = esc(rot.emoji || "✦") + " " + esc(rot.name.toUpperCase()); w.appendChild(h); songs.forEach((s, i) => w.appendChild(trackRow(s, i))); }); } else list.forEach((s, i) => w.appendChild(trackRow(s, i))); refreshFav(); }

  function wire() {
    const p = $("#play"); if (p) p.onclick = toggle; const hp = $("#homePlay"); if (hp) hp.onclick = toggle; const pv = $("#prev"); if (pv) pv.onclick = prev; const nx = $("#next"); if (nx) nx.onclick = next; const sh = $("#shuffle"); if (sh) sh.onclick = function () { state.shuffle = !state.shuffle; sh.classList.toggle("on", state.shuffle); toast("SHUFFLE " + (state.shuffle ? "ON" : "OFF")); }; const rp = $("#repeat"); if (rp) rp.onclick = function () { state.repeat = !state.repeat; rp.classList.toggle("on", state.repeat); toast("REPEAT " + (state.repeat ? "ON" : "OFF")); }; const fv = $("#fav"); if (fv) fv.onclick = toggleFav; const vol = $("#vol"); if (vol) { vol.oninput = (e) => setVol(+e.target.value); vol.value = LS.get("cg_vol", 80); } const sr = $("#shuffleRoad"); if (sr) sr.onclick = function () { state.shuffle = true; if (sh) sh.classList.add("on"); const p2 = filteredSongs().length ? filteredSongs() : SONGS; if (p2.length) load(p2[Math.floor(Math.random() * p2.length)], true); };
    $$(".tab").forEach((t) => (t.onclick = function () { $$(".tab").forEach((x) => x.classList.remove("active")); t.classList.add("active"); state.radioLang = t.dataset.lang; renderPlaylist(); toast("FILTER: " + t.dataset.lang.toUpperCase()); }));
    const search = $("#song-search"); if (search) search.oninput = function (e) { state.search = e.target.value.trim(); renderPlaylist(); };
    const party = $("#partyBtn"); if (party) party.onclick = function () { const bd = $("#birthday"); const on = bd.classList.toggle("party"); const mode = on ? "BIRTHDAY MODE ACTIVE" : "ACTIVATE BIRTHDAY MODE"; party.innerHTML = mode + ' <span>✦</span>'; toast(on ? "CONFETTI UNLOCKED" : "BIRTHDAY MODE OFF"); };
  }
  function boot() { renderHomeCollections(); renderCollectionChips(); renderCrew(); renderPlaylist(); wire(); const last = LS.get("cg_last", null); if (last) { const s = SONGS.find((x) => x.id === last); if (s) { cur = s; renderNow(); } } if (!cur && SONGS[0]) { cur = SONGS[0]; renderNow(); } const count = $("#song-count"); if (count) count.textContent = SONGS.length; const collections = $("#collection-count"); if (collections) collections.textContent = String(ROT.length).padStart(2, "0"); setPlayingUI(false); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
