/* ============================================================
   ✏️  THIS IS THE ONLY FILE YOU NEED TO EDIT  ✏️
   Keep the quote marks "" and the commas , exactly as they are.
   {name} = her name, {him} = your name, {age} = 15, {ordinal} = 15th
   ============================================================ */

window.GIFT = {

  /* ---------- Names & birthday ---------- */
  herName: "Dalleiii",
  hisName: "Angry Bird",
  age: 15,
  birthday: "Poush 4",

  /* ---------- Passcode (currently 0904) ---------- */
  salt: "dalleiii-love:",
  passcodeHash: "1659c62c27ae52",
  hint: "Hint: our four special numbers 💕",

  /* Optional: the day you became a couple, like "2025-03-14".
     Leave "" to hide the "days together" line.               */
  togetherSince: "",

  /* ---------- Opening lines (typed one by one on a black screen) ---------- */
  introLines: [
    "Hey, {name}.",
    "I built something.",
    "It took late nights, and one very big secret.",
    "There is only one copy in the whole universe… and it's yours."
  ],

  /* ---------- Lines under the star reveal ---------- */
  birthLines: [
    "Out of billions of stars…",
    "…there is one I could never lose sight of.",
    "You make my whole sky glow.",
    "Happy {ordinal} birthday, my love."
  ],
  birthFinal: "Poush 4 · the day the universe got its brightest star",

  /* ---------- Chapters shown while she flies through your photos ----------
     1st-3rd appear before each group of 4 photos, the 4th before the videos,
     "endNote" appears at the very end of the flight.                         */
  chapters: [
    { tag: "Chapter One",   text: "Every photo is a tiny universe with the two of us inside." },
    { tag: "Chapter Two",   text: "Some days with you felt like they were made of stardust." },
    { tag: "Chapter Three", text: "And somehow, it keeps getting even better." },
    { tag: "Chapter Four",  text: "Some moments were too alive for a photo…" }
  ],
  endNote: "One more thing… keep flying. There's a message waiting for you.",

  /* ---------- Photos ----------
     Upload to  assets/photos/  as  photo-01.jpg … photo-12.jpg
     (.jpeg .png .webp also work). Write a caption between the quotes, or leave "". */
  photos: [
    { file: "./IMG_20261107_220503_066.jpg", caption: "" },
    { file: "./IMG_20261107_220512_073.jpg", caption: "" },
    { file: "./IMG_20261107_220509_110.jpg", caption: "" },
    { file: "./IMG_20261107_220507_728.jpg", caption: "" },
    { file: "./IMG_20261107_220510_726.jpg", caption: "" },
    { file: "./IMG_20261107_220513_353.jpg", caption: "" },
    { file: "./IMG_20261107_220443_260_9.jpg", caption: "" },
    { file: "./IMG_20261107_220516_638.jpg", caption: "" },
    { file: "./IMG_20261107_220456_121.jpg", caption: "" },
    { file: "./IMG_20261107_220450_882.jpg", caption: "" },
    { file: "./IMG_20261107_220442_427_2.jpg", caption: "" },
    { file: "./IMG_20261107_220514_547.jpg", caption: "" }
  ],

  /* true = empty frames for files you haven't uploaded yet (good while testing).
     false = only photos/videos that really exist are shown.                     */
  showPlaceholders: true,

  /* ---------- Videos: upload to assets/videos/ as video-01.mp4 and video-02.mp4 ---------- */
  videos: [
    { file: "./Messenger_creation_70D0B9AA-4118-44A8-AA58-2FA32AEAF44A.mp4", title: "Moment one", caption: "" },
    { file: "./VID_20261107_082005_115.mp4", title: "Moment two", caption: "" }
  ],

  /* ---------- Music (optional): upload  assets/music/song.mp3 ---------- */
  music: "assets/music/song",

  /* ---------- Your letter ----------
     ⚠️ THIS IS SAMPLE TEXT. Replace everything between the backticks ` `.
     Press Enter twice for a new paragraph.                              */
  letter: `My dearest Dalleiii,

[Write your own letter here. Tell her what she means to you, your favorite memory together, and what you wish for her this year.]

Happy 15th birthday, my love. I'm so lucky to be yours.

Forever yours,
Angry Bird`,

  /* ---------- Game: messages inside the 12 stars ----------
     Every time she plays, the stars show different messages. None repeats
     until she has seen them all. Add as many as you like.                 */
  starMessages: [
    "{name}, you're my favorite hello and my hardest goodbye.",
    "Every time you smile, my whole world gets brighter.",
    "You make ordinary days feel like little celebrations.",
    "If I could pick anywhere to be, it would be next to you.",
    "You're the reason I check my phone with a silly smile.",
    "Thank you for being exactly who you are.",
    "My heart does a tiny happy dance whenever you text me.",
    "You're not just my girlfriend, you're my best friend.",
    "I would choose you in every lifetime, {name}.",
    "Your laugh is my favorite song.",
    "Being yours is my favorite thing to be.",
    "You're prettier than every sunset we've ever watched.",
    "I'm so lucky it's you I get to love.",
    "Somehow you make 'just talking' feel like magic.",
    "You're my calm after a long day.",
    "You're my sunshine on cloudy days, {name}.",
    "I fell for you, and I'm still falling every single day.",
    "Your hugs are my safest place.",
    "No matter what, I'm on your team. Always.",
    "You turn my bad days into good ones just by existing.",
    "I love the way you say my name.",
    "You're the best part of every single day.",
    "I could look at our photos forever and still miss you.",
    "You deserve all the happiness in the world, {name}.",
    "Whatever tomorrow brings, I want it with you.",
    "You're my favorite notification.",
    "You are loved more than you will ever know.",
    "I'm proud of you, today and every day.",
    "Even when we're apart, you're always on my mind.",
    "My heart has your name written all over it.",
    "Thank you for being patient with me, my love.",
    "Even the stars would be jealous of your sparkle.",
    "Loving you is the easiest thing I've ever done.",
    "Happy {ordinal}, {name}! You make growing up feel like a fairytale.",
    "If hugs were stars, I'd send you the whole sky.",
    "You're my favorite person to be silly with.",
    "Your smile is my favorite view.",
    "I promise to keep choosing you, every single day.",
    "You are my today and all of my tomorrows.",
    "Distance, time, whatever: my heart finds you anyway.",
    "Every love story is beautiful, but ours is my favorite.",
    "You make me want to be a better person.",
    "Thank you for being my safe place and my happy place.",
    "Roses are red, violets are blue, nobody makes me smile like you.",
    "Just so you know, I'm thinking of you right now.",
    "You're the cutest, {name}. That's it. That's the message.",
    "I love you to the moon and back, then back again.",
    "Of all the people in the world, I'm so glad I found you.",
    "You're my favorite adventure.",
    "Little reminder: you're amazing, and I adore you.",
    "Your {him} will always fly back to you.",
    "Even when I'm grumpy, my heart is soft for you.",
    "Birthday wish: more laughs, more hugs, more us.",
    "May your year be as beautiful as your heart.",
    "Your kindness is just as beautiful as you are.",
    "Hold on to this: you are enough, exactly as you are.",
    "I saved the biggest piece of my heart for you.",
    "Every moment with you is a memory I treasure.",
    "Please never forget how loved you are.",
    "Of all the stars I've ever seen, you're the only one I'd wish on.",
    "You're my north star, {name}. I always find my way back to you.",
    "In a universe this big, I'm grateful our paths crossed.",
    "You light up my sky even on the darkest nights."
  ],

  /* Rare shooting stars that cross the sky (tap them for a bonus wish) */
  wishMessages: [
    "🌠 A wish for you: may every dream you have find its way to you.",
    "🌠 Wish granted: one forever hug from your {him}.",
    "🌠 I wished on this star, and I wished for you. Again.",
    "🌠 May this year bring you everything that makes you smile.",
    "🌠 My wish never changes: more days with you, {name}."
  ],

  /* Shown when all 12 stars are lit */
  constellationFinale: "Twelve stars, one heart. Every one of them leads back to you, {name}. 💖",

  /* ---------- Star certificate (final screen) ---------- */
  certificate: {
    catalog: "DAL-0904",
    brightness: "Infinite",
    distance: "0 km from {him}'s heart",
    owner: "{name}, forever and always"
  }
};
