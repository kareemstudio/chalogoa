# Chalo Goa — Air Chalo flight CG-2409

This is not a travel brochure. It is the **boarding pass and seatback screen** for a charter that should not exist: Kareem's birthday escape to Goa, 24–27 Sep.

Open it on a phone. Board. The cabin entertainment is a Hindi · Punjabi · English mix, locked to **Goa time (IST)** — the same trick Deluxe Saloon uses, pointed at a beach instead of a barbershop.

## How it feels

1. **The gate** — full-screen sunset, perforated boarding pass, countdown to 24 Sep.
2. **BOARD FLIGHT CG-2409** — you enter the cabin.
3. **Seatback IFE** — five channels:
   - CH 01 Highway to Goa (05–11)
   - CH 02 Beach Shack FM (11–17)
   - CH 03 Sunset Slow (17–21)
   - CH 04 Tito's Night (21–05)
   - CH 05 Kareem's Cake Mix (on request, auto on 25 Sep)
4. **Safety card** = the four-day itinerary
5. **Passenger manifest** = the gang
6. **Overhead bin** = a birthday card that unseals itself on 25 Sep

Songs stream through YouTube so artists get the view. Skip if you want; **LIVE CLOCK** snaps you back to whatever the cabin would actually be playing right now in India.

## Preview locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Files

- `index.html` — gate + cabin
- `styles.css` — sunset gate, boarding pass, IFE bezel
- `app.js` — YouTube player, IST clock, channels
- `songs.js` — the mix
- `data.js` — friends, dates, fake itinerary

Default WhatsApp group link lives in `data.js`.
