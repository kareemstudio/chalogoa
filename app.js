/* Air Chalo CG-2409 — cabin entertainment */
const RADIO = window.GOA_RADIO;
const TRIP = window.TRIP;
const CH_NO = { highway: "01", shack: "02", sunset: "03", tito: "04", birthday: "05" };

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const esc = (t) => String(t || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

let player = null;
let ytReady = false;
let playing = false;
let liveClock = true;
let current = null;
let langFilter = "all";
let dayIndex = 0;
let paTimer = 0;

const PA = [
  "Cabin crew, prepare for takeoff. Aux is armed.",
  "The captain has turned on the party sign.",
  "We are cruising at one birthday and unlimited bad decisions.",
  "In the event of a good time, scream the chorus.",
  "Scooters on the left. Shacks on the right. Cake overhead.",
  "Goa time is the only time that matters in this cabin.",
  "Please keep your seatbelt fastened until Kareem blows the candles.",
  "Connecting flight: Highway to Tito’s, with a sunset layover."
];

function istParts(d = new Date()) {
  const o = {};
  new Intl.DateTimeFormat("en-GB", {
    timeZone: RADIO.timezone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).formatToParts(d).forEach((p) => { o[p.type] = p.value; });
  if (o.hour === "24") o.hour = "00";
  return o;
}

function istDate() {
  const p = istParts();
  return new Date(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}+05:30`);
}

function clockRotId() {
  const p = istParts();
  const h = Number(p.hour);
  const isBday = p.month === "09" && p.day === "25";
  if (isBday) return "birthday";
  if (h >= 21 || h < 5) return "tito";
  if (h < 11) return "highway";
  if (h < 17) return "shack";
  return "sunset";
}

function rotById(id) {
  return RADIO.rotations.find((r) => r.id === id);
}

function songsFor(rotId) {
  return RADIO.songs.filter((s) => s.rotation === rotId);
}

function loopIndex(rotId, extraSec = 0) {
  const list = songsFor(rotId);
  const total = list.reduce((n, s) => n + (s.dur || 180), 0) || 1;
  const p = istParts();
  const sec =
    Number(p.hour) * 3600 + Number(p.minute) * 60 + Number(p.second) + extraSec;
  let t = ((sec % total) + total) % total;
  for (let i = 0; i < list.length; i++) {
    const d = list[i].dur || 180;
    if (t < d) return { song: list[i], offset: t, i };
    t -= d;
  }
  return { song: list[0], offset: 0, i: 0 };
}

function fmt(sec) {
  sec = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function coverUrl(id) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add("hidden"), 2200);
}

function paintSong(song, rotId) {
  current = song;
  const rot = rotById(rotId || song.rotation);
  $("#cover").src = coverUrl(song.id);
  $("#cover").onerror = () => { $("#cover").src = "icon.svg"; };
  $("#song-title").textContent = song.title;
  $("#song-artist").textContent = `${song.artist}${song.film ? " · " + song.film : ""} · ${song.year} · ${song.lang}`;
  $("#ch-pill").textContent = `CH ${CH_NO[rot.id]} · ${rot.name.toUpperCase()}`;
  $("#yt-link").href = `https://www.youtube.com/watch?v=${song.id}`;
  $("#ytm-link").href = `https://music.youtube.com/watch?v=${song.id}`;
  $$(".ch").forEach((b) => b.classList.toggle("on", b.dataset.id === rot.id));
}

function loadSong(song, seek, autoplay) {
  paintSong(song, song.rotation);
  if (!player || !ytReady) return;
  const start = Math.max(0, Math.floor(seek || 0));
  try {
    player.loadVideoById({ videoId: song.id, startSeconds: start });
    if (!autoplay) player.pauseVideo();
  } catch (e) {
    player.cueVideoById({ videoId: song.id, startSeconds: start });
  }
}

function playLive() {
  liveClock = true;
  const rot = clockRotId();
  const { song, offset } = loopIndex(rot);
  loadSong(song, offset, true);
  playing = true;
  syncPlayBtn();
}

function skip(dir) {
  liveClock = false;
  const rot = current ? current.rotation : clockRotId();
  const list = songsFor(rot);
  const i = Math.max(0, list.findIndex((s) => s.id === current?.id));
  const next = list[(i + dir + list.length) % list.length];
  loadSong(next, 0, true);
  playing = true;
  syncPlayBtn();
}

function setChannel(id) {
  liveClock = id === clockRotId();
  const { song, offset } = loopIndex(id);
  loadSong(song, liveClock ? offset : 0, true);
  playing = true;
  syncPlayBtn();
}

function syncPlayBtn() {
  $("#btn-play").textContent = playing ? "❚❚ PAUSE" : "▶ PLAY";
}

function tickProgress() {
  if (!player || !ytReady) return;
  try {
    const t = player.getCurrentTime() || 0;
    const d = player.getDuration() || current?.dur || 1;
    $("#bar").style.width = `${Math.min(100, (t / d) * 100)}%`;
    $("#t-cur").textContent = fmt(t);
    $("#t-dur").textContent = fmt(d);
  } catch (e) { /* player not ready */ }
}

function tickClocks() {
  const p = istParts();
  const el = $("#ist-clock");
  if (el) el.textContent = `${p.hour}:${p.minute}:${p.second} IST · ${p.weekday}`;

  const start = new Date(TRIP.start);
  const end = new Date(TRIP.end);
  const now = new Date();
  let lbl = "DEPARTS IN";
  let ms = start - now;
  if (now >= start && now <= end) {
    lbl = "IN THE AIR · REMAINING";
    ms = end - now;
  } else if (now > end) {
    lbl = "LANDED";
    ms = 0;
  }
  const gateLbl = $("#gate-cd-lbl");
  if (gateLbl) gateLbl.textContent = lbl;
  const days = Math.floor(ms / 86400000);
  const hrs = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  const set = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = String(v).padStart(2, "0"); };
  set("g-d", days); set("g-h", hrs); set("g-m", mins); set("g-s", secs);

  const belt = $("#seatbelt");
  if (belt) {
    const inCabin = !$("#cabin").classList.contains("hidden");
    if (inCabin) belt.textContent = now > end ? "LANDED" : "IN CABIN";
    else if (now < start) belt.textContent = "BOARDING";
    else if (now > end) belt.textContent = "LANDED";
    else belt.textContent = "FASTEN SEATBELTS";
  }

  const bday = new Date(TRIP.birthday);
  const locked = now >= bday;
  const card = $("#locked");
  if (card) {
    card.classList.toggle("open", locked);
    $("#cake-title").textContent = locked
      ? `Happy birthday, ${TRIP.birthdayName}. The cabin is yours.`
      : "Sealed until 25 SEP";
    $("#cake-body").textContent = locked
      ? "Five friends. One cake. Unlimited bad decisions, officially licensed."
      : "Do not open before Kareem’s day. The crew will know.";
  }
}

function renderChannels() {
  $("#channels").innerHTML = RADIO.rotations.map((r) => `
    <button type="button" class="ch" data-id="${r.id}">
      <span class="n">CH ${CH_NO[r.id]} ${r.emoji}</span>
      <span class="nm">${esc(r.name)}</span>
      <span class="hr">${esc(r.hours)}</span>
    </button>`).join("");
  $$("#channels .ch").forEach((b) => {
    b.onclick = () => setChannel(b.dataset.id);
  });
}

function renderSeats() {
  $("#seats").innerHTML = TRIP.friends.map((f, i) => `
    <div class="seat">
      <div class="em">${f.emoji}</div>
      <div class="nm">${esc(f.name)}</div>
      <div class="nk">${esc(f.nick)} · ${String.fromCharCode(65 + i)}1</div>
      <div class="tt">${esc(f.title)}</div>
    </div>`).join("");
}

function renderDays() {
  $("#day-switch").innerHTML = TRIP.days.map((d, i) =>
    `<button type="button" data-i="${i}" class="${i === dayIndex ? "on" : ""}">${d.date}</button>`
  ).join("");
  $$("#day-switch button").forEach((b) => {
    b.onclick = () => { dayIndex = +b.dataset.i; renderDays(); };
  });
  const d = TRIP.days[dayIndex];
  $("#safety-card").innerHTML = `
    <h4>${esc(d.date)} · ${esc(d.title)}</h4>
    <p class="sub">${esc(d.line)}</p>
    ${d.slots.map((s) => `<div class="slot"><span>${s.i}</span><div><b>${esc(s.t)}</b>${esc(s.x)}</div></div>`).join("")}
  `;
}

function renderSongs() {
  const list = RADIO.songs.filter((s) => langFilter === "all" || s.lang === langFilter);
  $("#song-list").innerHTML = list.map((s) => `
    <button type="button" class="song" data-id="${s.id}">
      <span class="lg">${esc(s.lang).slice(0, 3).toUpperCase()}</span>
      <span>
        <span class="ti">${esc(s.title)}</span>
        <span class="ar"> · ${esc(s.artist)}</span>
        <div class="nt">${esc(s.note)}</div>
      </span>
      <span class="ar">${CH_NO[s.rotation]}</span>
    </button>`).join("");
  $$("#song-list .song").forEach((b) => {
    b.onclick = () => {
      const song = RADIO.songs.find((s) => s.id === b.dataset.id);
      liveClock = false;
      loadSong(song, 0, true);
      playing = true;
      syncPlayBtn();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  });
}

function cyclePA() {
  const el = $("#pa");
  if (!el) return;
  let i = 0;
  el.textContent = PA[0];
  clearInterval(paTimer);
  paTimer = setInterval(() => {
    i = (i + 1) % PA.length;
    el.textContent = PA[i];
  }, 7000);
}

function board() {
  $("#gate").classList.add("hidden");
  $("#cabin").classList.remove("hidden");
  window.scrollTo(0, 0);
  cyclePA();
  const starter = loopIndex(clockRotId());
  paintSong(starter.song, starter.song.rotation);
}

function bind() {
  $("#btn-board").onclick = board;
  $("#btn-gate").onclick = () => {
    $("#cabin").classList.add("hidden");
    $("#gate").classList.remove("hidden");
  };
  $("#btn-play").onclick = () => {
    if (!ytReady) {
      toast("Cabin screen warming up… tap again in a second");
      return;
    }
    if (!current) playLive();
    else if (playing) {
      player.pauseVideo();
      playing = false;
    } else {
      player.playVideo();
      playing = true;
    }
    syncPlayBtn();
  };
  $("#btn-next").onclick = () => skip(1);
  $("#btn-prev").onclick = () => skip(-1);
  $("#btn-live").onclick = () => { playLive(); toast("Locked to Goa time"); };
  $$("#lang-row button").forEach((b) => {
    b.onclick = () => {
      langFilter = b.dataset.lang;
      $$("#lang-row button").forEach((x) => x.classList.toggle("on", x === b));
      renderSongs();
    };
  });
  const wa = TRIP.whatsapp;
  $("#wa-foot").href = wa;
}

function bootYT() {
  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player("yt-player", {
      width: 1,
      height: 1,
      playerVars: { autoplay: 0, controls: 0, rel: 0, playsinline: 1, modestbranding: 1 },
      events: {
        onReady: () => { ytReady = true; },
        onStateChange: (e) => {
          if (e.data === YT.PlayerState.ENDED) {
            if (liveClock) playLive();
            else skip(1);
          }
          if (e.data === YT.PlayerState.PLAYING) { playing = true; syncPlayBtn(); }
          if (e.data === YT.PlayerState.PAUSED) { playing = false; syncPlayBtn(); }
        },
        onError: () => skip(1)
      }
    });
  };
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
}

document.addEventListener("DOMContentLoaded", () => {
  renderChannels();
  renderSeats();
  renderDays();
  renderSongs();
  bind();
  tickClocks();
  setInterval(tickClocks, 1000);
  setInterval(tickProgress, 400);
  bootYT();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
});
