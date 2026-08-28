# Chalo Goa — Design Direction

## Three stylistic approaches

### Theme Name: Coastal Dispatch
Very brief intro: An editorial road-trip journal with sun-bleached paper, deep sea ink, and mango-orange accents. It feels like a premium travel zine made by the friends who actually took the trip.
Probability: 0.07

### Theme Name: Night Bus FM
Very brief intro: A dark, cinematic music-first interface with cobalt black, sodium-vapor amber, and a live-radio control bar. It turns the trip into a late-night broadcast from the highway.
Probability: 0.04

### Theme Name: Palm Springs Postcard
Very brief intro: A playful, high-key vacation postcard system with washed pastels, hand-drawn stickers, and breezy scrapbook composition. It is optimistic, social, and deliberately nostalgic.
Probability: 0.09

## Chosen approach: Coastal Dispatch

### Design Movement
Contemporary editorial travel design informed by Swiss International Typographic Style, independent print zines, and 1970s Indian tourism ephemera. The page should feel composed like a collectible field guide rather than a generic landing page.

### Core Principles
1. **Editorial hierarchy over UI uniformity.** Use a strong reading order, oversized condensed display type, and asymmetrical blocks instead of a centered hero with evenly spaced cards.
2. **Sun-washed contrast.** Pair a warm paper base with ink-dark navy and one unmistakable mango-orange signature color. The palette should feel tactile, bright, and coastal without becoming tropical cliché.
3. **Artifacts with purpose.** Route lines, ticket stubs, cropped photo frames, issue numbers, tape marks, and hand-noted annotations should act as navigation and storytelling devices, not decoration.
4. **Designed for motion.** Interactions should feel like flipping through a field journal: quick, tactile, and responsive, with restrained reveals and no distracting spectacle.

### Color Philosophy
The base is **salt paper** (#F3EBDD), chosen to make the page feel printed and sun-faded rather than digitally sterile. **Monsoon ink** (#102C34) carries the reading experience and provides the seriousness of a field notebook. **Mango signal** (#F47C3C) is the ownable brand color: hot, energetic, and easy to spot on a road sign or ticket. Supporting tones include **sea glass** (#BCD9CE) and **terracotta dust** (#C95D44), used sparingly to separate trip phases and preserve hierarchy.

### Layout Paradigm
A vertical editorial story with a fixed chapter rail on desktop and a compact sticky route dock on mobile. Sections alternate between full-bleed visual moments and offset content columns. The hero uses a split composition: oversized wordmark and trip details on the left, a large cropped Goa coast image and ticket-like date stamp on the right. The route section uses a horizontal journey line with place cards. The radio module sits as a dark inset spread, like a two-page record sleeve.

### Signature Elements
- A thin orange **route thread** that travels through the main story and becomes a progress indicator.
- **Field-note labels** in uppercase monospace with issue numbers, coordinates, and tiny editorial annotations.
- **Ticket / postcard geometry**: slightly irregular borders, perforation dots, offset stamps, and image crops with subtle grain.

### Interaction Philosophy
Every clickable element should feel like picking up a physical trip artifact. Buttons have a firm press state and directional arrow. Cards lift only a few pixels on hover. The radio player supports play, mute, next, and station switching with clear pressed states. The menu on small screens opens as a paper-like drawer rather than a generic full-screen overlay. Non-functional actions use a concise toast so the interface never dead-ends.

### Animation
Use short, physical transitions: 160–220ms for buttons, 240ms for cards, and 360ms for section reveals. On load, stagger the hero eyebrow, display type, date block, and image by 60ms increments. The route thread draws in with a scaleX reveal. Avoid animating layout dimensions; prefer opacity and transform. Respect prefers-reduced-motion by removing non-essential stagger and parallax.

### Typography System
Use **Bebas Neue** for the giant condensed display face and **DM Sans** for body copy, UI labels, and trip metadata. Use **IBM Plex Mono** for coordinates, timestamps, station labels, and field notes. Display hierarchy: Bebas Neue at 9–15vw for the hero wordmark, 4–7rem for section titles, and 2–3rem for card headlines. Body copy stays at 15–18px with generous line-height. Uppercase metadata uses 10–12px with 0.14em tracking.

### Brand Essence
**Chalo Goa is a private road-trip field guide for the friends making the memory, not the tourists collecting the view.**
Personality adjectives: sun-soaked, mischievous, considered.

### Brand Voice
Headlines are declarative, punchy, and specific. CTAs sound like a friend handing you the aux cable: direct, warm, and a little cheeky. Microcopy is observational, never corporate. Avoid filler such as “Welcome to our website” or “Get started today.”

Example lines:
- “Four days. One coastline. Zero sensible bedtimes.”
- “Take the scenic route. Keep the aux.”

### Wordmark & Logo
The wordmark is a stacked, condensed **CHALO / GOA** lockup with a small orange route-arrow slash cutting through the O. The icon is a bold circular road bend with a palm-leaf notch, designed to read as a route marker at favicon size. Use the symbol without text wherever a compact mark is needed.

### Signature Brand Color
**Mango signal — #F47C3C.** It is the trip’s visible flare: the color of a roadside sign at golden hour, a ticket stamp, and the moment someone turns the music up.

## Content structure

- Hero: “Four days. One coastline. Zero sensible bedtimes.” with date range, destination, and primary CTA.
- Trip index: five friends, four days, one birthday, one destination.
- Route: a visual Goa run from arrival to final beach morning.
- Crew: five personality-led cards, each with role and short copy.
- Radio: station tabs and a tactile playlist player, with functional play / next / mute interactions.
- Birthday: a celebratory final chapter with confetti-like ticket marks and a clear activation CTA.
- Footer: compact chapter links, trip dates, and a closing line.

## Implementation reminder
Every CSS/component/page file must preserve the Coastal Dispatch system: salt paper, monsoon ink, mango signal, editorial asymmetry, field-note labels, route-thread motifs, and tactile transitions. When in doubt, ask: **Does this choice reinforce or dilute our design philosophy?**
