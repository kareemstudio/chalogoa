// Static game content for Chalo Goa — The Goa Game.
// Consumed by store.js (seeding) and game.js (rendering).
window.CG_CONTENT = {
  // 1. Secret / team / personal missions
  missions: [
    { id: "op_coconut", title: "Operation Coconut", description: 'Get someone to say "Bro, this is actually a vibe." without telling them why.', points: 250, mtype: "secret", prompt: 'Make someone say "Bro, this is actually a vibe."' },
    { id: "group_selfie", title: "The Evidence", description: "Convince everyone to take a ridiculous group selfie.", points: 200, mtype: "team" },
    { id: "stranger_photo", title: "Tourist Trap", description: "Get a stranger to take your group photo.", points: 200, mtype: "team" },
    { id: "new_food", title: "Fear Factor", description: "Order something nobody has tried before.", points: 180, mtype: "personal" },
    { id: "make_kareem_dance", title: "DJ Kareem", description: "Make Kareem dance. On purpose.", points: 300, mtype: "secret", prompt: "Make Kareem dance." },
    { id: "sunglasses_five", title: "Shade Squad", description: "Photograph all five people wearing sunglasses.", points: 220, mtype: "team" },
    { id: "make_sing", title: "Karaoke Conspiracy", description: "Get someone to sing. In public.", points: 200, mtype: "secret", prompt: "Get someone to sing in public." },
    { id: "weird_souvenir", title: "Souvenir of Shame", description: "Find the weirdest possible souvenir.", points: 180, mtype: "personal" },
    { id: "goa_dog", title: "Dog Whisperer", description: "Take a photo with a Goa dog.", points: 150, mtype: "personal" },
    { id: "worst_pose", title: "Worst Pose", description: "Create the worst possible group pose.", points: 200, mtype: "team" },
    { id: "into_sea", title: "Full Send", description: "Get everyone into the sea.", points: 350, mtype: "team" },
    { id: "capture_sleep", title: "Sleeping Beauty", description: "Capture someone sleeping. On purpose.", points: 150, mtype: "secret", prompt: "Photograph someone asleep." },
    { id: "initials", title: "Initial Offense", description: "Find something with all five friends' initials.", points: 250, mtype: "personal" }
  ],

  // 2. Achievements (hidden — requirements not shown)
  achievements: [
    { id: "no_survivors", name: "No Survivors", description: "All five stayed out after 2 AM.", icon: "🏆" },
    { id: "photographer", name: "The Photographer", description: "Uploaded 25 photos.", icon: "📸" },
    { id: "united_nations", name: "United Nations", description: "Spoke to people from 5 different places.", icon: "🌍" },
    { id: "sunrise_dept", name: "Sunrise Department", description: "Still awake at sunrise.", icon: "🌅" },
    { id: "responsible_adult", name: "Responsible Adult", description: "Someone remembered water.", icon: "💧" },
    { id: "goa_veteran", name: "Goa Veteran", description: "Survived the whole trip.", icon: "🎖️" },
    { id: "main_character", name: "Main Character", description: "Center of every photo.", icon: "🌟" },
    { id: "passenger_princess", name: "Passenger Princess", description: "Never carried a bag.", icon: "👑" },
    { id: "dj_dept", name: "DJ Department", description: "Controlled the aux for an hour.", icon: "🎧" },
    { id: "lost_and_found", name: "Lost & Found", description: "Lost something and found it.", icon: "🔎" },
    { id: "one_last_drink", name: "One Last Drink", description: 'Said "one last drink".', icon: "🍹" }
  ],

  // 3. Goa Bingo (5x5)
  bingo: [
    { icon: "🌴", label: "Coconut" }, { icon: "🍹", label: "Group selfie" }, { icon: "🛵", label: "Goa dog" }, { icon: "🐶", label: "Scooter" }, { icon: "🌅", label: "Sunset" },
    { icon: "⏰", label: "Someone late" }, { icon: "🤝", label: "New friend" }, { icon: "🎤", label: "Karaoke" }, { icon: "🏖️", label: "Beach" }, { icon: "🥃", label: "Shot" },
    { icon: "🍜", label: "Weird food" }, { icon: "🆓", label: "FREE CHAOS" }, { icon: "💃", label: "Dance" }, { icon: "🕶️", label: "Sunglasses" }, { icon: "🚕", label: "Taxi" },
    { icon: "🔍", label: "Lost item" }, { icon: "🏊", label: "Pool" }, { icon: "🎂", label: "Birthday" }, { icon: "🌭", label: "3 AM food" }, { icon: "📸", label: "Photo bomb" },
    { icon: "🌊", label: "Sea" }, { icon: "🎶", label: "DJ" }, { icon: "☕", label: "Café" }, { icon: "🥴", label: "Hangover" }, { icon: "💡", label: "Bad idea" }
  ],

  // 4. Tonight's decision poll options
  pollOptions: ["🍸 Cocktail bar", "🏖️ Beach", "🎶 Club", "🍕 Food crawl", "🎲 Random mode"],

  // 5. Most Likely To questions (seed rounds; votes hidden until reveal)
  mlQuestions: [
    "Lose their phone tonight?",
    "Be the first to disappear at the party?",
    "Order food at 3 AM?",
    "Fall asleep in the cab?",
    "Make a new best friend?",
    "Lose their sunglasses?",
    "Get everyone kicked out?",
    'Say "one last drink"?',
    "Wake up earliest?",
    "Cancel tomorrow's plan?",
    "Become the DJ?",
    "Spend the most money?",
    "Take 400 photos?",
    "Start Goa romance gossip? 😏"
  ],

  // 6. Flight predictions (admin sets result later)
  predictions: [
    "Who reaches the airport last?",
    "Who packs too much?",
    "First to get drunk?",
    "First person in the pool?",
    "Who wakes latest?",
    "Who takes most photos?",
    "Who spends the most?",
    'First to say "I\'m tired"',
    "Who forgets something?",
    "Who orders room service?"
  ],

  // 7. Passport stamps
  stamps: [
    { id: "boarding", icon: "🛫", label: "Boarding Complete" },
    { id: "beach", icon: "🌊", label: "First Beach" },
    { id: "drink", icon: "🍹", label: "First Drink" },
    { id: "sunset", icon: "🌅", label: "Sunset Certified" },
    { id: "birthday", icon: "🎂", label: "Birthday Survivor" },
    { id: "explorer", icon: "🛵", label: "Goa Explorer" },
    { id: "club", icon: "🌙", label: "3 AM Club" },
    { id: "champion", icon: "🏆", label: "Chaos Champion" }
  ]
};
