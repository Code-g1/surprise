/* ============================================================
   ✏️  THIS IS THE ONLY FILE YOU NEED TO EDIT  ✏️
   Change names, captions, the letter and the sweet messages here.
   Keep the quote marks "" and commas , exactly as they are.
   ============================================================ */

window.GIFT = {

  /* ---------- Names & birthday ---------- */
  herName: "Dalleiii",
  hisName: "Angry Bird",
  age: 15,
  birthday: "Poush 4",

  /* ---------- Passcode (currently 0904) ----------
     To change it: open tools/make-passcode.html in your browser,
     type the new 4 digits, and paste the result below.            */
  salt: "dalleiii-love:",
  passcodeHash: "1659c62c27ae52",
  hint: "Hint: our special four numbers 💕",

  /* Optional: the day you became a couple, like "2025-03-14" (year-month-day).
     Leave it as "" to hide the "days together" counter.                       */
  togetherSince: "",

  /* ---------- Photos ----------
     Upload photos to  assets/photos/  and name them
     photo-01.jpg, photo-02.jpg ... photo-12.jpg
     (.jpg .jpeg .png .webp all work automatically).
     Write a caption between the quotes whenever you want one.            */
  photos: [
    { file: "IMG_20261107_220442_427_2.jpg", caption: "" },
    { file: "IMG_20261107_220443_260_9.jpg", caption: "" },
    { file: "IMG_20261107_220450_882.jpg", caption: "" },
    { file: "IMG_20261107_220456_121.jpg", caption: "" },
    { file: "IMG_20261107_220503_066.jpg", caption: "" },
    { file: "IMG_20261107_220507_728.jpg", caption: "" },
    { file: "IMG_20261107_220509_110.jpg", caption: "" },
    { file: "IMG_20261107_220510_726.jpg", caption: "" },
    { file: "IMG_20261107_220512_073.jpg", caption: "" },
    { file: "IMG_20261107_220513_353.jpg", caption: "" },
    { file: "IMG_20261107_220514_547.jpg", caption: "" },
    { file: "IMG_20261107_220516_638.jpg", caption: "" }
  ],

  /* While true, empty frames show for photos/videos you haven't uploaded yet.
     When everything is uploaded this makes no difference.
     Set to false if you upload fewer than 12 photos and want no empty frames. */
  showPlaceholders: true,

  /* ---------- Videos ----------
     Upload to  assets/videos/  as  video-01.mp4  and  video-02.mp4  */
  videos: [
    { file: "video-01", title: "Moment one", caption: "" },
    { file: "video-02", title: "Moment two", caption: "" }
  ],

  /* ---------- Music (optional) ----------
     Upload a song as  assets/music/song.mp3  and a little music
     button appears by itself. No file = no button.            */
  music: "assets/music/song",

  /* ---------- Intro lines (words between *stars* get highlighted) ---------- */
  introQuotes: [
    "In your *smile*, I found my *peace*.",
    "With you, every day feels like a *celebration*.",
    "You are my *favorite* person in the whole *world*."
  ],

  /* ---------- Your letter ----------
     ⚠️ THIS IS SAMPLE TEXT. Replace everything between the backticks ` `
     with your own words. Press Enter twice to start a new paragraph. */
  letter: `My dearest Dalleiii,

[Write your own letter here. Tell her what she means to you, your favorite memory together, and what you wish for her this year.]

Happy 15th birthday, my love. I'm so lucky to be yours.

Forever yours,
Angry Bird`,

  /* ---------- Game: messages inside the falling hearts ----------
     {name} becomes her name, {him} becomes your name, {age} her age (15),
   {ordinal} her age as "15th".
     Add as many lines as you like. They show in random order and
     none repeats until she has seen them all.                       */
  gameMessages: [
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
    "Please never forget how loved you are."
  ],

  /* Rare golden hearts (every 7th heart she catches) */
  goldenMessages: [
    "🌟 Golden heart! You are the best thing that ever happened to me, {name}.",
    "🌟 Golden heart! Wish granted: one forever hug from your {him}.",
    "🌟 Golden heart! Close your eyes, make a birthday wish… I hope it's us. 💕",
    "🌟 Golden heart! Here's to {age} beautiful years of the world having you.",
    "🌟 Golden heart! Happy Birthday, {name}. I love you more than words can say."
  ]
};
