// Local-first data layer for Chalo Goa — The Goa Game.
// LOCAL mode:  localStorage + BroadcastChannel (cross-tab realtime).
// LIVE mode:   same localStorage cache is hydrated from Supabase on boot,
//              every write also pushes to Supabase, and Postgres realtime
//              changes are mirrored back into the cache + emitted to subscribers.
// The public API is identical in both modes, so game.js never changes.
window.DB = (function () {
  const NS = "cg_";
  const HAS_LS = "localStorage" in window;
  const SEAT = ["1A", "1B", "1C", "1D", "1E"];
  const LEVEL_NAMES = ["", "Boarding", "Cabin Crew", "Goa Certified", "Chaos Officer", "Captain of Bad Decisions"];

  function load(t, def) { if (!HAS_LS) return def; try { return JSON.parse(localStorage.getItem(NS + t)) || def; } catch (e) { return def; } }
  function save(t, v) { if (HAS_LS) localStorage.setItem(NS + t, JSON.stringify(v)); }
  function uid() { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); return "id" + Date.now() + Math.random().toString(36).slice(2, 8); }

  const BCH = ("BroadcastChannel" in window) ? new BroadcastChannel("cg-live") : null;
  const subs = {};
  function emit(table) { if (BCH) BCH.postMessage({ table }); (subs[table] || []).forEach((cb) => { try { cb(); } catch (e) {} }); }
  function on(table, cb) { (subs[table] = subs[table] || []).push(cb); return () => { subs[table] = subs[table].filter((x) => x !== cb); }; }
  if (BCH) BCH.onmessage = (e) => { const t = e.data && e.data.table; if (t && subs[t]) subs[t].slice().forEach((cb) => cb()); };

  // ---- Supabase live bridge ----
  function client() { return (window.SB && window.SB.client) || null; }
  function live() { return !!(window.SB && window.SB.mode === "live" && window.SB.client); }
  function push(promise) { if (live()) { const p = promise; if (p && p.catch) p.catch(() => {}); } }

  // upsert a row into a localStorage array, matched by primary key field(s)
  function upsertLS(key, obj, pk) { if (!obj) return; const fields = Array.isArray(pk) ? pk : [pk]; const arr = load(key, []); let i = arr.findIndex((a) => fields.every((f) => String(a[f]) === String(obj[f]))); if (i >= 0) arr[i] = Object.assign({}, arr[i], obj); else arr.push(obj); save(key, arr); }
  function removeLS(key, obj, pk) { const fields = Array.isArray(pk) ? pk : [pk]; const arr = load(key, []).filter((a) => !(fields.every((f) => String(a[f]) === String(obj[f])))); save(key, arr); }

  function levelFor(m) { if (m >= 1800) return 5; if (m >= 1200) return 4; if (m >= 700) return 3; if (m >= 300) return 2; return 1; }

  function addActivity(a) {
    const rec = Object.assign({ id: uid(), created_at: new Date().toISOString() }, a);
    const list = load("activities", []); list.unshift(rec); save("activities", list.slice(0, 200)); emit("activities");
    push(client().from("activities").insert(rec));
  }

  function getActivities() { return load("activities", []); }

  function seed() {
    if (!window.TRIP || !window.CG_CONTENT) return;
    if (!load("profiles", null)) save("profiles", window.TRIP.friends.map((f, i) => ({ id: f.id, name: f.name, avatar: f.emoji, seat: SEAT[i] || ("1" + (i + 1)), chaos_miles: 0, level: 1, votes_recv: 0, missions_done: 0, predictions_won: 0 })));
    if (!load("missions", null)) save("missions", window.CG_CONTENT.missions.map((m) => Object.assign({}, m)));
    if (!load("achievements", null)) save("achievements", window.CG_CONTENT.achievements.map((a) => Object.assign({}, a)));
    if (!load("bingo", null)) save("bingo", window.CG_CONTENT.bingo.map((b, i) => ({ idx: i, icon: b.icon, label: b.label })));
    if (!load("activities", null)) save("activities", []);
    if (!load("votes", null)) save("votes", []);
    if (!load("questions", null)) save("questions", []);
    if (!load("games", null)) save("games", []);
    if (!load("user_missions", null)) save("user_missions", []);
    if (!load("polls", null)) save("polls", [{ id: "poll_tonight", question: "Where are we going tonight?", options: window.CG_CONTENT.pollOptions, closes_at: null, status: "open" }]);
    if (!load("poll_votes", null)) save("poll_votes", []);
    if (!load("user_achievements", null)) save("user_achievements", []);
    if (!load("passport", null)) save("passport", []);
    if (!load("photos", null)) save("photos", []);
    if (!load("photo_votes", null)) save("photo_votes", []);
    if (!load("predictions", null)) save("predictions", window.CG_CONTENT.predictions.map((t, i) => ({ id: "pred_" + i, text: t, result_id: null, closes_at: null, status: "open" })));
    if (!load("prediction_votes", null)) save("prediction_votes", []);
    if (!load("bingo_marks", null)) save("bingo_marks", []);
    if (load("mlIndex", null) === null) save("mlIndex", 0);
  }

  // hydrate localStorage cache from Supabase (live mode)
  async function fetchAll() {
    const tbls = [["profiles", "profiles"], ["activities", "activities"], ["games", "games"], ["questions", "questions"], ["votes", "votes"], ["missions", "missions"], ["user_missions", "user_missions"], ["daily_polls", "polls"], ["poll_votes", "poll_votes"], ["user_achievements", "user_achievements"], ["passport_stamps", "passport"], ["photos", "photos"], ["photo_votes", "photo_votes"], ["bingo_squares", "bingo"], ["bingo_marks", "bingo_marks"], ["achievements", "achievements"], ["predictions", "predictions"], ["prediction_votes", "prediction_votes"]];
    for (const [t, ls] of tbls) { try { const { data, error } = await client().from(t).select("*"); if (!error && data) save(ls, data); } catch (e) {} }
  }

  // insert any static rows that don't exist yet (friends, missions, bingo, achievements, a first poll)
  async function seedStatic() {
    const friends = (window.TRIP && window.TRIP.friends) ? window.TRIP.friends.map((f, i) => ({ id: f.id, name: f.name, avatar: f.emoji, seat: SEAT[i] || ("1" + (i + 1)), chaos_miles: 0, level: 1, votes_recv: 0, missions_done: 0, predictions_won: 0 })) : [];
    const haveP = new Set(load("profiles", []).map((p) => p.id)); const missP = friends.filter((f) => !haveP.has(f.id));
    if (missP.length) { await client().from("profiles").upsert(missP); const a = load("profiles", []); missP.forEach((f) => { if (!a.find((x) => x.id === f.id)) a.push(f); }); save("profiles", a); }

    const ms = (window.CG_CONTENT && window.CG_CONTENT.missions) || [];
    const haveM = new Set(load("missions", []).map((m) => m.id));
    const missM = ms.map((m) => ({ id: m.id, title: m.title, description: m.description, points: m.points, mtype: m.mtype, prompt: m.prompt })).filter((m) => !haveM.has(m.id));
    if (missM.length) { await client().from("missions").upsert(missM); const a = load("missions", []); missM.forEach((m) => { if (!a.find((x) => x.id === m.id)) a.push(m); }); save("missions", a); }

    const bs = (window.CG_CONTENT && window.CG_CONTENT.bingo) || [];
    const haveB = new Set(load("bingo", []).map((b) => b.idx));
    const missB = bs.map((b, i) => ({ idx: i, label: b.label, icon: b.icon })).filter((b) => !haveB.has(b.idx));
    if (missB.length) { await client().from("bingo_squares").upsert(missB); const a = load("bingo", []); missB.forEach((b) => { if (!a.find((x) => x.idx === b.idx)) a.push(b); }); save("bingo", a); }

    const ac = (window.CG_CONTENT && window.CG_CONTENT.achievements) || [];
    const haveA = new Set(load("achievements", []).map((a) => a.id));
    const missA = ac.map((a) => ({ id: a.id, name: a.name, description: a.description, icon: a.icon })).filter((a) => !haveA.has(a.id));
    if (missA.length) { await client().from("achievements").upsert(missA); const a = load("achievements", []); missA.forEach((x) => { if (!a.find((y) => y.id === x.id)) a.push(x); }); save("achievements", a); }

    if (!load("polls", []).length) { const opts = (window.CG_CONTENT && window.CG_CONTENT.pollOptions) || ["Cocktail bar", "Beach shack", "Club", "Room-service chaos"]; const p = { id: uid(), question: "Where are we going tonight?", options: opts, status: "open" }; await client().from("daily_polls").insert(p); save("polls", [p]); }
  }

  function setupSubs() {
    const map = [["activities", "activities", "id"], ["profiles", "profiles", "id"], ["games", "games", "id"], ["questions", "questions", "id"], ["votes", "votes", "id"], ["missions", "missions", "id"], ["user_missions", "user_missions", ["user_id", "mission_id"]], ["daily_polls", "polls", "id"], ["poll_votes", "poll_votes", ["poll_id", "user_id"]], ["user_achievements", "user_achievements", ["user_id", "achievement_id"]], ["passport_stamps", "passport", ["user_id", "stamp_id"]], ["photos", "photos", "id"], ["photo_votes", "photo_votes", ["photo_id", "user_id"]], ["bingo_squares", "bingo", "idx"], ["bingo_marks", "bingo_marks", ["user_id", "idx"]], ["achievements", "achievements", "id"], ["predictions", "predictions", "id"], ["prediction_votes", "prediction_votes", ["prediction_id", "user_id"]]];
    map.forEach(([table, ls, pk]) => {
      client().channel("cg_" + table).on("postgres_changes", { event: "*", schema: "public", table }, (e) => {
        if (e.eventType === "DELETE") removeLS(ls, e.old, pk); else upsertLS(ls, e.new, pk);
        emit(ls);
      }).subscribe();
    });
  }

  function init() {
    if (live()) return fetchAll().then(seedStatic).then(setupSubs).then(() => emit("ready")).catch((err) => { console.error("Supabase init failed", err); });
    return Promise.resolve();
  }

  const profiles = {
    all() { return load("profiles", []); },
    get(id) { return this.all().find((p) => p.id === id); },
    save(p) { const a = this.all(); const i = a.findIndex((x) => x.id === p.id); if (i >= 0) a[i] = Object.assign({}, a[i], p); else a.push(p); save("profiles", a); emit("profiles"); push(client().from("profiles").update(p).eq("id", p.id)); },
    addMiles(id, pts) {
      const p = this.get(id); if (!p) return;
      p.chaos_miles = (p.chaos_miles || 0) + pts; p.level = levelFor(p.chaos_miles);
      this.save(p); addActivity({ user_id: id, type: "miles", points: pts, text: "+" + pts + " Chaos Miles" });
    }
  };

  const missions = {
    all() { return load("missions", []); },
    userMissions(id) { return load("user_missions", []).filter((m) => m.user_id === id); },
    claim(userId, mid, evidenceUrl) {
      const a = load("user_missions", []);
      const ex = a.find((x) => x.user_id === userId && x.mission_id === mid);
      const m = this.all().find((x) => x.id === mid);
      if (ex) { ex.status = "done"; if (evidenceUrl) ex.evidence_url = evidenceUrl; }
      else a.push({ user_id: userId, mission_id: mid, status: "done", evidence_url: evidenceUrl });
      save("user_missions", a); emit("user_missions");
      push(client().from("user_missions").upsert({ user_id: userId, mission_id: mid, status: "done", evidence_url: evidenceUrl }, { onConflict: "user_id,mission_id" }));
      if (m) { profiles.addMiles(userId, m.points); addActivity({ user_id: userId, type: "mission_complete", points: m.points, text: "completed " + m.title }); const p = profiles.get(userId); if (p) { p.missions_done = (p.missions_done || 0) + 1; profiles.save(p); } }
    }
  };

  const bingo = {
    squares() { return load("bingo", []); },
    marks(userId) { return load("bingo_marks", []).filter((m) => m.user_id === userId).map((m) => m.idx); },
    toggle(userId, idx) {
      const a = load("bingo_marks", []); const i = a.findIndex((m) => m.user_id === userId && m.idx === idx);
      if (i >= 0) { a.splice(i, 1); if (live()) push(client().from("bingo_marks").delete().eq("user_id", userId).eq("idx", idx)); }
      else { a.push({ user_id: userId, idx }); if (live()) push(client().from("bingo_marks").insert({ user_id: userId, idx })); }
      save("bingo_marks", a); emit("bingo_marks"); return this.marks(userId);
    }
  };

  const polls = {
    current() { return load("polls", []).find((p) => p.status === "open") || load("polls", [])[0]; },
    vote(pollId, userId, option) {
      const a = load("poll_votes", []); const ex = a.find((x) => x.poll_id === pollId && x.user_id === userId);
      if (ex) ex.option = option; else a.push({ poll_id: pollId, user_id: userId, option });
      save("poll_votes", a); emit("poll_votes");
      push(client().from("poll_votes").upsert({ poll_id: pollId, user_id: userId, option }, { onConflict: "poll_id,user_id" }));
    },
    tally(pollId) { const p = this.current(); if (!p) return []; const votes = load("poll_votes", []).filter((v) => v.poll_id === pollId); return p.options.map((o, i) => ({ option: i, label: o, count: votes.filter((v) => v.option === i).length })); },
    close(pollId) { const a = load("polls", []); const p = a.find((x) => x.id === pollId); if (p) p.status = "closed"; save("polls", a); emit("polls"); push(client().from("daily_polls").update({ status: "closed" }).eq("id", pollId)); }
  };

  const ml = {
    active() {
      const g = load("games", []).filter((x) => x.game_type === "most_likely" && x.status !== "revealed").sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at))[0];
      if (!g) return null; const q = load("questions", []).find((x) => x.game_id === g.id); if (!q) return null;
      return { game: g, question: q, votes: load("votes", []).filter((v) => v.question_id === q.id) };
    },
    ensureRound() {
      const open = load("games", []).filter((x) => x.game_type === "most_likely" && x.status !== "revealed");
      if (open.length) return open.sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at))[0];
      const idx = load("mlIndex", 0);
      const text = window.CG_CONTENT.mlQuestions[idx % window.CG_CONTENT.mlQuestions.length];
      const g = { id: uid(), game_type: "most_likely", status: "open", starts_at: new Date().toISOString() };
      const q = { id: uid(), game_id: g.id, text: text, round: idx + 1 };
      save("games", load("games", []).concat(g)); save("questions", load("questions", []).concat(q)); save("mlIndex", idx + 1); emit("games"); emit("questions");
      push(client().from("games").insert(g)); push(client().from("questions").insert(q));
      return g;
    },
    vote(qid, voterId, targetId) {
      const a = load("votes", []); const ex = a.find((x) => x.question_id === qid && x.voter_id === voterId);
      if (ex) ex.selected_id = targetId; else a.push({ id: uid(), question_id: qid, voter_id: voterId, selected_id: targetId });
      save("votes", a); emit("votes");
      push(client().from("votes").upsert({ question_id: qid, voter_id: voterId, selected_id: targetId }, { onConflict: "question_id,voter_id" }));
    },
    reveal(gid) { const a = load("games", []); const g = a.find((x) => x.id === gid); if (g) g.status = "revealed"; save("games", a); emit("games"); push(client().from("games").update({ status: "revealed" }).eq("id", gid)); }
  };

  const ach = {
    all() { return load("achievements", []); },
    unlocked(userId) { return load("user_achievements", []).filter((a) => a.user_id === userId).map((a) => a.achievement_id); },
    unlock(userId, achId) {
      const a = load("user_achievements", []);
      if (a.find((x) => x.user_id === userId && x.achievement_id === achId)) return false;
      a.push({ user_id: userId, achievement_id: achId }); save("user_achievements", a); emit("user_achievements");
      push(client().from("user_achievements").upsert({ user_id: userId, achievement_id: achId }, { onConflict: "user_id,achievement_id" }));
      const ac = this.all().find((x) => x.id === achId); if (ac) addActivity({ user_id: userId, type: "achievement", text: "unlocked " + ac.name });
      return true;
    }
  };

  const passport = {
    stamps(userId) { return load("passport", []).filter((s) => s.user_id === userId).map((s) => s.stamp_id); },
    add(userId, stampId) {
      const a = load("passport", []); if (a.find((x) => x.user_id === userId && x.stamp_id === stampId)) return false;
      a.push({ user_id: userId, stamp_id: stampId }); save("passport", a); emit("passport");
      push(client().from("passport_stamps").insert({ user_id: userId, stamp_id: stampId }));
      const st = (window.CG_CONTENT && window.CG_CONTENT.stamps || []).find((s) => s.id === stampId); if (st) addActivity({ user_id: userId, type: "stamp", text: "got stamp " + st.label });
      return true;
    }
  };

  const photos = {
    all() { return load("photos", []); },
    add(p) {
      const rec = Object.assign({ id: uid(), created_at: new Date().toISOString() }, p);
      const a = load("photos", []); a.unshift(rec); save("photos", a); emit("photos");
      if (live()) {
        const row = { id: rec.id, user_id: rec.user_id, image_url: rec.data || "", caption: rec.caption || "", day: rec.day || null };
        if (rec.file) {
          const path = rec.id + "_" + (rec.file.name || "img");
          client().storage.from("evidence").upload(path, rec.file).then(() => client().storage.from("evidence").getPublicUrl(path).data.publicUrl).then((url) => { row.image_url = url; return client().from("photos").insert(row); }).catch(() => client().from("photos").insert(row));
        } else push(client().from("photos").insert(row));
      }
      return rec;
    },
    vote(photoId, userId) { const a = load("photo_votes", []); if (a.find((x) => x.photo_id === photoId && x.user_id === userId)) return; a.push({ photo_id: photoId, user_id: userId }); save("photo_votes", a); emit("photo_votes"); push(client().from("photo_votes").insert({ photo_id: photoId, user_id: userId })); },
    votesFor(photoId) { return load("photo_votes", []).filter((v) => v.photo_id === photoId).length; }
  };

  const predictions = {
    all() { return load("predictions", []); },
    vote(pid, userId, pickId) { const a = load("prediction_votes", []); const ex = a.find((x) => x.prediction_id === pid && x.user_id === userId); if (ex) ex.pick_id = pickId; else a.push({ prediction_id: pid, user_id: userId, pick_id: pickId }); save("prediction_votes", a); emit("prediction_votes"); push(client().from("prediction_votes").upsert({ prediction_id: pid, user_id: userId, pick_id: pickId }, { onConflict: "prediction_id,user_id" })); },
    setResult(pid, resultId) {
      const a = load("predictions", []); const p = a.find((x) => x.id === pid); if (p) { p.result_id = resultId; p.status = "closed"; } save("predictions", a);
      const correct = load("prediction_votes", []).filter((v) => v.prediction_id === pid && v.pick_id === resultId);
      correct.forEach((v) => { profiles.addMiles(v.user_id, 100); const p2 = profiles.get(v.user_id); if (p2) { p2.predictions_won = (p2.predictions_won || 0) + 1; profiles.save(p2); } });
      emit("predictions");
    }
  };

  return {
    seed, init, on, profiles, addActivity, getActivities, missions, bingo, polls, ml, ach, passport, photos, predictions, levelFor, LEVEL_NAMES,
    leaderboard() { return this.profiles.all().slice().sort((a, b) => b.chaos_miles - a.chaos_miles); },
    SEAT
  };
})();
