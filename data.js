// ============================================================
// CHALO GOA — default trip data
// Everything here is editable from the Admin tab. Nothing here
// is a real booking, price, or personal fact — just placeholders
// for the group to fill in before the trip.
// ============================================================

const DEFAULT_DATA = {
  trip: {
    groupName: "Chalo goa✈️ ✈️ ✈️ ✈️",
    tagline: "5 Friends. 4 Days. 1 Birthday. Unlimited Bad Decisions. 😎",
    startDate: "2026-09-24T00:00:00",
    endDate: "2026-09-27T23:59:00",
    whatsappUrl: "https://chat.whatsapp.com/Eqhqy3MxclnJtjKXbwQicW",
    pinEnabled: false,
    pin: "2409",
    adminPassword: "goa2026"
  },

  birthday: {
    name: "Kareem",
    dateTime: "2026-09-25T00:00:00",
    title: "KAREEM MODE ACTIVATED 🎂",
    subtitle: "Today, normal Goa rules do not apply.",
    messages: [
      // { from: "Friend name", text: "message" }
    ],
    surprise: "The gang is planning something. Check back closer to the day 👀",
    galleryNote: "Birthday photos will show up here once someone uploads one."
  },

  friends: [
    {
      id: "kareem",
      name: "Kareem",
      nickname: "Birthday Boy",
      title: "The Reason We're All Here",
      superpower: "Turning any evening into an event",
      quote: "",
      photo: "",
      points: 0,
      challengesCompleted: 0
    },
    {
      id: "friend2",
      name: "Friend 2",
      nickname: "Add a nickname",
      title: "Add a funny title",
      superpower: "Add their Goa superpower",
      quote: "",
      photo: "",
      points: 0,
      challengesCompleted: 0
    },
    {
      id: "friend3",
      name: "Friend 3",
      nickname: "Add a nickname",
      title: "Add a funny title",
      superpower: "Add their Goa superpower",
      quote: "",
      photo: "",
      points: 0,
      challengesCompleted: 0
    },
    {
      id: "friend4",
      name: "Friend 4",
      nickname: "Add a nickname",
      title: "Add a funny title",
      superpower: "Add their Goa superpower",
      quote: "",
      photo: "",
      points: 0,
      challengesCompleted: 0
    },
    {
      id: "friend5",
      name: "Friend 5",
      nickname: "Add a nickname",
      title: "Add a funny title",
      superpower: "Add their Goa superpower",
      quote: "",
      photo: "",
      points: 0,
      challengesCompleted: 0
    }
  ],

  itinerary: [
    {
      date: "2026-09-24",
      label: "24 SEP",
      dayTitle: "Day 1",
      cover: "",
      morning: { text: "", icon: "🌅" },
      afternoon: { text: "", icon: "🏖️" },
      evening: { text: "", icon: "🌇" },
      nightlife: { text: "", icon: "🎶" },
      restaurant: "",
      beach: "",
      activity: "",
      transport: "",
      mapUrl: "",
      costEstimate: "",
      notes: ""
    },
    {
      date: "2026-09-25",
      label: "25 SEP",
      dayTitle: "Day 2 — Birthday Day",
      cover: "",
      morning: { text: "", icon: "🌅" },
      afternoon: { text: "", icon: "🏖️" },
      evening: { text: "", icon: "🌇" },
      nightlife: { text: "", icon: "🎶" },
      restaurant: "",
      beach: "",
      activity: "",
      transport: "",
      mapUrl: "",
      costEstimate: "",
      notes: ""
    },
    {
      date: "2026-09-26",
      label: "26 SEP",
      dayTitle: "Day 3",
      cover: "",
      morning: { text: "", icon: "🌅" },
      afternoon: { text: "", icon: "🏖️" },
      evening: { text: "", icon: "🌇" },
      nightlife: { text: "", icon: "🎶" },
      restaurant: "",
      beach: "",
      activity: "",
      transport: "",
      mapUrl: "",
      costEstimate: "",
      notes: ""
    },
    {
      date: "2026-09-27",
      label: "27 SEP",
      dayTitle: "Day 4 — Going Home",
      cover: "",
      morning: { text: "", icon: "🌅" },
      afternoon: { text: "", icon: "🏖️" },
      evening: { text: "", icon: "🌇" },
      nightlife: { text: "", icon: "🎶" },
      restaurant: "",
      beach: "",
      activity: "",
      transport: "",
      mapUrl: "",
      costEstimate: "",
      notes: ""
    }
  ],

  wheel: {
    challenges: [
      { text: "Take the weirdest group selfie.", category: "Photo", points: 10 },
      { text: "Birthday boy chooses the next activity.", category: "Birthday", points: 15 },
      { text: "Speak only in movie dialogues for 10 minutes.", category: "Funny", points: 10 },
      { text: "Take a Bollywood-style slow-motion beach video.", category: "Photo", points: 15 },
      { text: "Buy chai/coffee for the gang.", category: "Food", points: 10 },
      { text: "Do 10 jumping jacks in the sea.", category: "Beach", points: 5 },
      { text: "Compliment a stranger (nicely).", category: "Social", points: 10 },
      { text: "Everyone does a group cheers photo.", category: "Group Challenge", points: 10 }
    ]
  },

  quiz: {
    title: "Who Knows Kareem Best?",
    questions: [
      // { q: "...", options: ["A","B","C","D"], correctIndex: 0 }
      // Add real questions about Kareem from the Admin tab.
    ]
  },

  bingo: {
    size: 4,
    tiles: [
      "Sunset selfie", "Coconut water", "Beach dog", "Scooter ride",
      "Group selfie", "Goa food", "Someone gets sunburnt", "Dance video",
      "Random tourist selfie", "Karaoke moment", "Watched the sunrise", "Wore flip-flops all day",
      "Lost your slippers", "Tried a water sport", "Bought a souvenir", "Late night snack run"
    ]
  },

  mostLikely: {
    prompts: [
      "Who is most likely to wake up last?",
      "Who is most likely to lose their phone?",
      "Who is most likely to over-order food?",
      "Who is most likely to fall asleep first at night?",
      "Who is most likely to make a scene at a restaurant?"
    ]
  },

  truthDareChallenge: {
    truths: [
      "What's the most embarrassing thing that's happened to you on a trip?",
      "Who in this group would you trust with a secret?",
      "What's one thing you've never told the group?"
    ],
    dares: [
      "Do your best Bollywood dance move right now.",
      "Send a voice note singing happy birthday to Kareem.",
      "Let the group pick your profile picture for a day."
    ],
    goaChallenges: [
      "Order in the local language.",
      "Try a food you've never had before.",
      "Take a solo sunset photo and post it in the group."
    ]
  },

  secretMissions: [
    // { friendId: "kareem", mission: "..." }
  ],

  awards: [
    { title: "Goa Legend 🏆", winnerId: "" },
    { title: "Chaos King 🤡", winnerId: "" },
    { title: "Best Photographer 📸", winnerId: "" },
    { title: "Party Machine 🔥", winnerId: "" },
    { title: "Sleeping Beauty 😴", winnerId: "" }
  ],

  memories: [
    // { id, day: "2026-09-24", caption: "", photo: base64, ts }
  ],

  expenses: [
    // { id, title, amount, payerId, includedIds: [], split: "equal"|"custom", customShares: {}, settled: false }
  ]
};
