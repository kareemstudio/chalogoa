/* Chalo Goa radio catalogue.
   Playback is via official YouTube embeds so artists/labels get the view. */
window.GOA_RADIO = {
  timezone: "Asia/Kolkata",
  rotations: [
    {
      id: "highway",
      hi: "हाईवे टू गोवा",
      name: "Highway Heat",
      hours: "05:00–11:00 IST",
      start: 5,
      end: 11,
      vibe: "Windows down. Scooter tank on empty. Ilahi on repeat.",
      emoji: "🛵"
    },
    {
      id: "shack",
      hi: "बीच शैक",
      name: "Beach Shack",
      hours: "11:00–17:00 IST",
      start: 11,
      end: 17,
      vibe: "Sandy feet, lime soda, someone already lost their slippers.",
      emoji: "🏖️"
    },
    {
      id: "sunset",
      hi: "सनसेट स्लो",
      name: "Golden Hour",
      hours: "17:00–21:00 IST",
      start: 17,
      end: 21,
      vibe: "Orange sky, Arijit, one last swim before the night shift.",
      emoji: "🌅"
    },
    {
      id: "tito",
      hi: "टीटो’स नाइट",
      name: "After Dark",
      hours: "21:00–05:00 IST",
      start: 21,
      end: 5,
      vibe: "Neon, Punjabi bass, bad decisions with a cover charge.",
      emoji: "🪩"
    },
    {
      id: "birthday",
      hi: "करीम्स केक",
      name: "Birthday FM",
      hours: "on request · auto on 25 Sep",
      start: null,
      end: null,
      vibe: "The birthday boy's aux. No skip shame. Extra confetti.",
      emoji: "🎂",
      onRequest: true
    },
    {
      id: "sunrise",
      hi: "सनराइज़ सेशन",
      name: "Sunrise Session",
      hours: "05:00–08:00 IST",
      start: 5,
      end: 8,
      vibe: "The beach is empty, the sky is pink, and nobody is ready to go home.",
      emoji: "🌤️"
    },
    {
      id: "cafe",
      hi: "कैफे कट",
      name: "Café Cut",
      hours: "08:00–11:00 IST",
      start: 8,
      end: 11,
      vibe: "Iced coffee, slow scrolling, and the first plan of the day.",
      emoji: "☕"
    },
    {
      id: "afterglow",
      hi: "आफ्टरग्लो",
      name: "Afterglow FM",
      hours: "21:00–01:00 IST",
      start: 21,
      end: 1,
      vibe: "Neon outside, salt in your hair, one more song before the taxi.",
      emoji: "🌙"
    }
  ],
  songs: [
    /* —— Highway —— */
    { id: "fdubeMFwuGs", title: "Ilahi", artist: "Arijit Singh", film: "Yeh Jawaani Hai Deewani", year: 2013, lang: "Hindi", rotation: "highway", dur: 231, note: "The original Chalo Goa anthem. Windows down, beard growing, no plan." },
    { id: "6vKucgAeF_Q", title: "Matargashti", artist: "Mohit Chauhan", film: "Tamasha", year: 2015, lang: "Hindi", rotation: "highway", dur: 240, note: "For the stretch between the airport and the first beach shack." },
    { id: "bVl3om0-GFE", title: "Sooraj Dooba Hain", artist: "Arijit Singh, Amaal Mallik", film: "Roy", year: 2015, lang: "Hindi", rotation: "highway", dur: 244, note: "Sunrise after a night you will not put on the story." },
    { id: "jHNNMj5bNQw", title: "Kabira", artist: "Tochi Raina, Rekha Bhardwaj", film: "Yeh Jawaani Hai Deewani", year: 2013, lang: "Hindi", rotation: "highway", dur: 222, note: "The quiet one between two loud ones. Let it play." },
    { id: "VAdGW7QDJiU", title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", film: "Jawan", year: 2023, lang: "Hindi", rotation: "highway", dur: 201, note: "SRK, rain, and the feeling that the trip has officially started." },
    { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh", film: "Brahmāstra", year: 2022, lang: "Hindi", rotation: "highway", dur: 268, note: "Saffron sky over the Mandovi. Sing it anyway." },
    { id: "hT_nvWreIhg", title: "Counting Stars", artist: "OneRepublic", film: "", year: 2013, lang: "English", rotation: "highway", dur: 257, note: "English highway fuel. Volume up at the toll." },
    { id: "IcrbM1l_BoI", title: "Wake Me Up", artist: "Avicii", film: "", year: 2013, lang: "English", rotation: "highway", dur: 247, note: "For the friend who fell asleep in the back of the Innova." },
    { id: "UtF6Jej8yb4", title: "The Nights", artist: "Avicii", film: "", year: 2014, lang: "English", rotation: "highway", dur: 176, note: "Tell your friends you remember this trip. Mean it." },
    { id: "YlUKcNNmywk", title: "Californication", artist: "Red Hot Chili Peppers", film: "", year: 2000, lang: "English", rotation: "highway", dur: 321, note: "Swap California for Calangute. Same dream, saltier air." },

    /* —— Beach shack —— */
    { id: "qFkNATtc3mc", title: "Ghungroo", artist: "Arijit Singh, Shilpa Rao", film: "War", year: 2019, lang: "Hindi", rotation: "shack", dur: 302, note: "Shot on a beach for a reason. Hrithik energy, Goa humidity." },
    { id: "E07s5ZYygMg", title: "Watermelon Sugar", artist: "Harry Styles", film: "", year: 2019, lang: "English", rotation: "shack", dur: 174, note: "Coconut water, not watermelon. Close enough." },
    { id: "mRD0-GxqHVo", title: "Heat Waves", artist: "Glass Animals", film: "", year: 2020, lang: "English", rotation: "shack", dur: 238, note: "The 3pm sun. The 3pm lie-down. The 3pm playlist." },
    { id: "ApXoWvfEYVU", title: "Sunflower", artist: "Post Malone, Swae Lee", film: "Spider-Verse", year: 2018, lang: "English", rotation: "shack", dur: 158, note: "Hammock song. Do not attempt choreography." },
    { id: "nYh-n7EOtMA", title: "Cheap Thrills", artist: "Sia ft. Sean Paul", film: "", year: 2016, lang: "English", rotation: "shack", dur: 224, note: "The shack speaker has been playing this since 2016. Respect it." },
    { id: "HCjNJDNzw8Y", title: "Havana", artist: "Camila Cabello", film: "", year: 2017, lang: "English", rotation: "shack", dur: 217, note: "Latin afternoon. Someone will try the dance. Let them." },
    { id: "YqeW9_5kURI", title: "Lean On", artist: "Major Lazer & DJ Snake ft. MØ", film: "", year: 2015, lang: "English", rotation: "shack", dur: 176, note: "Festival leftover that never left the beach." },
    { id: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", film: "", year: 2017, lang: "English", rotation: "shack", dur: 263, note: "You know every word. That is a scientific fact." },
    { id: "RLzC55ai0eo", title: "Heeriye", artist: "Jasleen Royal, Arijit Singh", film: "", year: 2023, lang: "Hindi", rotation: "shack", dur: 194, note: "Soft afternoon. Phone on Do Not Disturb." },
    { id: "BBAyRBTfsOU", title: "Vaaste", artist: "Dhvani Bhanushali, Nikhil D'Souza", film: "", year: 2019, lang: "Hindi", rotation: "shack", dur: 192, note: "The shack uncle's favourite. Do not fight the aux." },
    { id: "zaGUr6wzyT8", title: "Three Little Birds", artist: "Bob Marley", film: "", year: 1977, lang: "English", rotation: "shack", dur: 180, note: "Every Goa afternoon is legally required to include one reggae song." },
    { id: "FTQbiNvZqaY", title: "Africa", artist: "Toto", film: "", year: 1982, lang: "English", rotation: "shack", dur: 295, note: "Bless the rains. Then bless the Baga breeze." },

    /* —— Sunset —— */
    { id: "IJq0yyWug1k", title: "Tum Hi Ho", artist: "Arijit Singh", film: "Aashiqui 2", year: 2013, lang: "Hindi", rotation: "sunset", dur: 262, note: "The sky goes orange. The group goes quiet. Then someone sings." },
    { id: "284Ov7ysmfA", title: "Channa Mereya", artist: "Arijit Singh", film: "Ae Dil Hai Mushkil", year: 2016, lang: "Hindi", rotation: "sunset", dur: 289, note: "For the friend who always gets emotional at golden hour." },
    { id: "lpdRqn6xwiM", title: "Zaalima", artist: "Arijit Singh, Harshdeep Kaur", film: "Raees", year: 2017, lang: "Hindi", rotation: "sunset", dur: 266, note: "SRK in a leather jacket. You in a rented Activa." },
    { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran", film: "", year: 2017, lang: "English", rotation: "sunset", dur: 263, note: "Slow dance in the sand. No choreography required." },
    { id: "syFZfO_wfMQ", title: "Night Changes", artist: "One Direction", film: "", year: 2014, lang: "English", rotation: "sunset", dur: 226, note: "The day is folding. The night is loading." },
    { id: "H5v3kku4y6Q", title: "As It Was", artist: "Harry Styles", film: "", year: 2022, lang: "English", rotation: "sunset", dur: 167, note: "Nostalgia for a trip that hasn't even ended." },
    { id: "hMy5za-m5Ew", title: "Filhall", artist: "BPraak", film: "", year: 2019, lang: "Punjabi", rotation: "sunset", dur: 335, note: "The Punjabi ballad that turns a sunset into a scene." },
    { id: "N2-HsIYd0Go", title: "Mile Ho Tum", artist: "Neha Kakkar, Tony Kakkar", film: "Fever", year: 2016, lang: "Hindi", rotation: "sunset", dur: 241, note: "Reprise version. Soft, sticky, slightly dangerous." },
    { id: "FM7MFYoylVs", title: "Something Just Like This", artist: "The Chainsmokers & Coldplay", film: "", year: 2017, lang: "English", rotation: "sunset", dur: 247, note: "Superheroes optional. Sunset mandatory." },
    { id: "lY2yjAdbvdQ", title: "Treat You Better", artist: "Shawn Mendes", film: "", year: 2016, lang: "English", rotation: "sunset", dur: 187, note: "Walk back from the water. Phone torch off. Stars on." },

    /* —— Tito's night —— */
    { id: "k4yXQkG2s1E", title: "Kala Chashma", artist: "Badshah, Neha Kakkar, Amar Arshi", film: "Baar Baar Dekho", year: 2016, lang: "Hindi", rotation: "tito", dur: 173, note: "The glasses stay on. The dignity does not." },
    { id: "Wd2B8OAotU8", title: "Nashe Si Chadh Gayi", artist: "Arijit Singh", film: "Befikre", year: 2016, lang: "Hindi", rotation: "tito", dur: 237, note: "Befikre, as a lifestyle." },
    { id: "VNs_cCtdbPc", title: "Brown Munde", artist: "AP Dhillon, Gurinder Gill, Shinda Kahlon", film: "", year: 2020, lang: "Punjabi", rotation: "tito", dur: 254, note: "The 2020s Goa night starter pack." },
    { id: "vX2cDW8LUWk", title: "Excuses", artist: "AP Dhillon, Gurinder Gill, Intense", film: "", year: 2020, lang: "Punjabi", rotation: "tito", dur: 176, note: "No excuses for sitting this one out." },
    { id: "hjWf8A0YNSE", title: "High Rated Gabru", artist: "Guru Randhawa", film: "", year: 2017, lang: "Punjabi", rotation: "tito", dur: 225, note: "A billion views. A billion nights. One more." },
    { id: "dZ0fwJojhrs", title: "Lahore", artist: "Guru Randhawa", film: "", year: 2017, lang: "Punjabi", rotation: "tito", dur: 232, note: "The Challenger, the highway, the chorus." },
    { id: "vu5-aKf_QqA", title: "Aankh Marey", artist: "Mika Singh, Neha Kakkar, Kumar Sanu", film: "Simmba", year: 2018, lang: "Hindi", rotation: "tito", dur: 221, note: "Ranveer energy. Floor permission granted." },
    { id: "JFcgOboQZ08", title: "Dilbar", artist: "Neha Kakkar, Dhvani Bhanushali, Ikka", film: "Satyameva Jayate", year: 2018, lang: "Hindi", rotation: "tito", dur: 194, note: "The remix that ate the original and then ate the club." },
    { id: "yIIGQB6EMAM", title: "Bom Diggy Diggy", artist: "Zack Knight, Jasmin Walia", film: "Sonu Ke Titu Ki Sweety", year: 2018, lang: "Hindi", rotation: "tito", dur: 198, note: "If the gang does not scream the hook, check their pulse." },
    { id: "TUVcZfQe-Kw", title: "Levitating", artist: "Dua Lipa ft. DaBaby", film: "", year: 2020, lang: "English", rotation: "tito", dur: 203, note: "Disco ball. Disco knees. Disco tomorrow-morning regret." },
    { id: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", film: "", year: 2019, lang: "English", rotation: "tito", dur: 201, note: "Neon Goa. After midnight. Before the taxi argument." },
    { id: "OPf0YbXqDm0", title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", film: "", year: 2014, lang: "English", rotation: "tito", dur: 272, note: "The wedding DJ's gift to nightlife. Still undefeated." },
    { id: "k2qgadSvNyU", title: "New Rules", artist: "Dua Lipa", film: "", year: 2017, lang: "English", rotation: "tito", dur: 212, note: "Rule one: do not give the aux to the sleepy one." },
    { id: "PT2_F-1esPk", title: "Closer", artist: "The Chainsmokers ft. Halsey", film: "", year: 2016, lang: "English", rotation: "tito", dur: 261, note: "The 1am slow-build. Stay on the floor." },
    { id: "gCYcHz2k5x0", title: "Animals", artist: "Martin Garrix", film: "", year: 2013, lang: "English", rotation: "tito", dur: 174, note: "Drop incoming. Hold your coconut." },
    { id: "kJQP7kiw5Fk", title: "Despacito", artist: "Luis Fonsi ft. Daddy Yankee", film: "", year: 2017, lang: "English", rotation: "tito", dur: 281, note: "Spanish, technically. Universal, actually." },
    { id: "bzW9fmwcmG4", title: "Daru Badnaam", artist: "Kamal Khahlon, Param Singh", film: "", year: 2016, lang: "Punjabi", rotation: "tito", dur: 218, note: "The Punjabi night that starts before you sit down." },
    { id: "RKioDWlajvo", title: "Lehanga", artist: "Jass Manak", film: "", year: 2018, lang: "Punjabi", rotation: "tito", dur: 160, note: "India's most-viewed Punjabi earworm. Resistance is futile." },
    { id: "YpkJO_GrCo0", title: "Laung Laachi", artist: "Mannat Noor", film: "Laung Laachi", year: 2018, lang: "Punjabi", rotation: "tito", dur: 168, note: "Wedding energy, beach edition." },
    { id: "ZnGMxARIxoY", title: "Jhanjar", artist: "Karan Aujla", film: "", year: 2020, lang: "Punjabi", rotation: "tito", dur: 195, note: "Aujla after midnight. Keep the volume honest." },
    { id: "ebXbLfLACGM", title: "Summer", artist: "Calvin Harris", film: "", year: 2014, lang: "English", rotation: "tito", dur: 222, note: "Not technically summer in September. Spiritually yes." },
    { id: "ru0K8uYEZWw", title: "Can't Stop the Feeling!", artist: "Justin Timberlake", film: "Trolls", year: 2016, lang: "English", rotation: "tito", dur: 236, note: "Joy as a policy. Dance as a civic duty." },

    /* —— Birthday cake mix —— */
    { id: "ZbZSe6N_BXs", title: "Happy", artist: "Pharrell Williams", film: "Despicable Me 2", year: 2013, lang: "English", rotation: "birthday", dur: 233, note: "Mandatory. Non-negotiable. Clap on two and four." },
    { id: "QJO3ROT-A4E", title: "What Makes You Beautiful", artist: "One Direction", film: "", year: 2011, lang: "English", rotation: "birthday", dur: 198, note: "For the birthday boy, sung badly, meant fully." },
    { id: "nfWlot6h_JM", title: "Shake It Off", artist: "Taylor Swift", film: "", year: 2014, lang: "English", rotation: "birthday", dur: 242, note: "Shake off the year. Shake on the trip." },
    { id: "e-ORhEE9VVg", title: "Blank Space", artist: "Taylor Swift", film: "", year: 2014, lang: "English", rotation: "birthday", dur: 231, note: "Nightmare dressed like a daydream. Goa dressed like a plan." },
    { id: "b1kbLwvqugk", title: "Anti-Hero", artist: "Taylor Swift", film: "", year: 2022, lang: "English", rotation: "birthday", dur: 200, note: "It's me. Hi. I'm the birthday boy, it's me." },
    { id: "tQ0yjYUFKAE", title: "Peaches", artist: "Justin Bieber", film: "", year: 2021, lang: "English", rotation: "birthday", dur: 198, note: "Smooth, sun-tired, slightly too loud for the restaurant." },
    { id: "gGdGFtwCNBE", title: "Mr. Brightside", artist: "The Killers", film: "", year: 2004, lang: "English", rotation: "birthday", dur: 222, note: "The song every group trip is legally obligated to scream." },
    { id: "1k8craCGpgs", title: "Don't Stop Believin'", artist: "Journey", film: "", year: 1981, lang: "English", rotation: "birthday", dur: 250, note: "Streetlight. People. Living just to find emotion. Also: cake." },
    { id: "djV11Xbc914", title: "Take On Me", artist: "a-ha", film: "", year: 1985, lang: "English", rotation: "birthday", dur: 227, note: "The high note. Someone will attempt it. Film them." },
    { id: "1w7OgIMMRc4", title: "Sweet Child O' Mine", artist: "Guns N' Roses", film: "", year: 1988, lang: "English", rotation: "birthday", dur: 302, note: "Air guitar on the sand. Commit." },
    { id: "sCbbMZ-q4-I", title: "Lut Gaye", artist: "Jubin Nautiyal", film: "", year: 2021, lang: "Hindi", rotation: "birthday", dur: 238, note: "The late-night Hindi that still belongs on a birthday." },
    { id: "ic8j13piAhQ", title: "Cruel Summer", artist: "Taylor Swift", film: "", year: 2019, lang: "English", rotation: "birthday", dur: 178, note: "September is a technicality. This is still summer." },
    { id: "Pkh8UtuejGw", title: "Señorita", artist: "Shawn Mendes, Camila Cabello", film: "", year: 2019, lang: "English", rotation: "birthday", dur: 191, note: "Not the ZNMD one. Still a Goa song. Still a vibe." }
    ,

    /* —— New collection cuts —— */
    { id: "hLQl3WQQoQ0", title: "Someone Like You", artist: "Adele", film: "", year: 2011, lang: "English", rotation: "sunrise", dur: 285, note: "For the walk back from the water when the whole beach is still asleep." },
    { id: "450p7goxZqg", title: "All of Me", artist: "John Legend", film: "", year: 2013, lang: "English", rotation: "sunrise", dur: 270, note: "Soft-focus morning, shared headphones, no group chat notifications." },
    { id: "J_ub7Etch2U", title: "Let Her Go", artist: "Passenger", film: "", year: 2012, lang: "English", rotation: "sunrise", dur: 252, note: "A little dramatic. Exactly right for a pink-sky departure." },
    { id: "YQHsXMglC9A", title: "Hello", artist: "Adele", film: "", year: 2015, lang: "English", rotation: "cafe", dur: 295, note: "The café table is quiet until someone says the trip needs a spreadsheet." },
    { id: "CevxZvSJLk8", title: "Roar", artist: "Katy Perry", film: "", year: 2013, lang: "English", rotation: "cafe", dur: 224, note: "Breakfast optimism. Even if the checkout time is already a problem." },
    { id: "09R8_2nJtjg", title: "Sugar", artist: "Maroon 5", film: "", year: 2015, lang: "English", rotation: "cafe", dur: 235, note: "A sugary reset before the beach committee starts debating lunch." },
    { id: "RgKAFK5djSk", title: "See You Again", artist: "Wiz Khalifa ft. Charlie Puth", film: "Furious 7", year: 2015, lang: "English", rotation: "afterglow", dur: 230, note: "The closing credits before the night decides it has another act." },
    { id: "fLexgOxsZu0", title: "The Lazy Song", artist: "Bruno Mars", film: "", year: 2011, lang: "English", rotation: "afterglow", dur: 199, note: "For the 1am moment where sitting down feels like an itinerary." },
    { id: "60ItHLz5WEA", title: "Faded", artist: "Alan Walker", film: "", year: 2015, lang: "English", rotation: "afterglow", dur: 212, note: "Blue-hour bass for the ride back along the coast." },
    { id: "8of5w7RgcTc", title: "Apna Bana Le", artist: "Arijit Singh", film: "Bhediya", year: 2022, lang: "Hindi", rotation: "sunrise", dur: 252, note: "The morning after the birthday night. Still warm, still singing." },
    { id: "6FURuLYrR_Q", title: "Choo Lo", artist: "The Local Train", film: "", year: 2015, lang: "Hindi", rotation: "cafe", dur: 248, note: "A slower table-side detour for when the coffee takes its time." },
    { id: "V-_O7nl0Ii0", title: "Havana", artist: "Camila Cabello", film: "", year: 2017, lang: "English", rotation: "afterglow", dur: 217, note: "Wrong city, right heat. The night will allow it." }
  ]
};
