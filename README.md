# 🏝️ Chalo Goa — Kareem's Birthday Escape

A private, mobile-first trip companion for **Chalo goa✈️ ✈️ ✈️ ✈️** — 5 friends, Goa, 24–27 Sep, celebrating Kareem's birthday.

No build step, no framework, no account needed — it's plain HTML/CSS/JS, so it runs anywhere, including free GitHub Pages hosting.

## ✨ What's inside

- Cinematic countdown hero → PIN-gated entry (optional) → Goa HQ dashboard
- Bottom nav: HQ · Trip Timeline · Games · Scores · Memories
- Menu: The Gang, Kareem Birthday Mode (with a card that unlocks itself on his birthday + confetti), Expenses, Trip Recap, Admin
- 6 games: Spin the Goa Wheel, Who Knows Kareem Best (quiz), Goa Bingo, Most Likely To, Truth/Dare/Challenge, Secret Missions
- Goa Points leaderboard + podium + editable final awards
- Polaroid-style Memory Wall (photo upload straight from the phone)
- Lightweight expense splitter ("who owes whom")
- Password-protected Admin tab to edit **everything** (friends, itinerary, challenges, quiz, bingo tiles, birthday settings, WhatsApp link, PIN) — no code editing required
- Installable as a PWA (friends can "Add to Home Screen")

## ⚠️ One important thing to know

This site has **no server/database** — all content (points, bingo progress, votes, memories, expenses) is saved in each person's own browser via `localStorage`. That means:

- Whoever fills in the Admin tab (friends' names, itinerary, challenges, etc.) should do it **before sharing the link**, on the version that gets deployed — their edits are what everyone will see.
- Things people *do* on their own phone afterwards (points earned, bingo taps, memories they upload, votes) stay on **their own phone** and won't automatically appear on someone else's phone.
- This is totally fine for a fun private trip site. If you later want a truly shared, real-time leaderboard/gallery across everyone's phones, the easiest upgrade is adding a free [Supabase](https://supabase.com) or [Firebase](https://firebase.google.com) project — happy to help wire that in later if you want it.

## 🚀 Put it on GitHub (so you can share it)

This folder is **already a git repository** with one commit ready to go (branch `main`) — you just need to create an empty repo on GitHub and push to it.

1. **Create a new repository** on GitHub: go to [github.com/new](https://github.com/new), name it e.g. `chalo-goa`, keep it **Public** (needed for free GitHub Pages) or Private if you have GitHub Pro. **Don't** initialize it with a README/gitignore/license — leave it completely empty.
2. On your computer, open a terminal in this folder (the one with `index.html` in it) and run:

   ```bash
   git remote add origin https://github.com/<your-username>/chalo-goa.git
   git push -u origin main
   ```

   *(If you'd rather not use git, you can instead go to your new empty repo on GitHub → "uploading an existing file" and drag every file in this folder there — just make sure `index.html` ends up at the repo's root, not inside a subfolder.)*

3. **Turn on GitHub Pages**: in your repo on GitHub, go to **Settings → Pages**, under "Build and deployment" choose **Source: Deploy from a branch**, branch **main**, folder **/(root)**, then **Save**.
4. After a minute, GitHub will show your live URL, something like:

   ```
   https://<your-username>.github.io/chalo-goa/
   ```

5. **Before sending it to the group**, open that link yourself, go to the menu (☰) → **Admin**, log in with the default password `goa2026` (change it in Admin → Settings), and fill in:
   - The Gang → each friend's name, nickname, photo
   - Itinerary → your actual plans for each day
   - Birthday → confirm Kareem's exact birthday date/time
   - Wheel / Quiz / Bingo / Truth-Dare / Missions → customize challenges
   - Settings → double check trip dates, WhatsApp link, and set a PIN if you want it locked to the group

6. Share the GitHub Pages link in **Chalo goa✈️ ✈️ ✈️ ✈️** 🎉 (there's already a floating WhatsApp button on the site pointing at your group).

## 🛠️ Editing content without touching code

Everything editable lives behind the **Admin** tab (menu → Admin). Default password: `goa2026` — change it immediately in Admin → Settings.

You can also **Export data (.json)** from Admin as a backup, and **Import data (.json)** to restore it or move it to another browser/device.

## 🧑‍💻 Editing the code itself

- `index.html` — page structure / all views
- `styles.css` — the whole visual design system (colors, fonts, layout)
- `app.js` — all app logic (routing, games, admin, storage)
- `data.js` — the default/starting content (friends, itinerary, challenges, etc.)
- `manifest.json` / `sw.js` — PWA install + basic offline support
- `icons/` — app icon

To preview locally before pushing, just run a tiny local server from this folder (no install needed if you have Python):

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## 📱 Add to Home Screen

Once it's live, friends can open the link on their phone and use "Add to Home Screen" (Safari: Share → Add to Home Screen; Chrome/Android: menu → Install app) so it opens like a real app.

---

Until the next bad idea. ✈️
