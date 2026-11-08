# ✦ Dalleiii's Universe

Passcode (launch code): **0904**

## Put it online with GitHub
1. github.com → **+ → New repository**. Use a hard-to-guess name, choose **Public**, **Create**.
2. Upload every file keeping the same folders (index.html at the top; css/, js/, assets/ folders).
3. **Settings → Pages → Deploy from a branch → main → /(root) → Save**.
4. In 1 to 2 minutes your link is `https://YOUR-USERNAME.github.io/REPO-NAME/`. Test it on a phone.

## Add your photos, videos and song
- `assets/photos/` → `photo-01.jpg` … `photo-12.jpg` (.jpeg .png .webp work too)
- `assets/videos/` → `video-01.mp4`, `video-02.mp4` (under 25 MB each for the website uploader)
- `assets/music/` → `song.mp3` (optional; a sound button controls it)
- Different file names? Change the `file:` names in `js/config.js` (leave off the ending, like `.jpg`).
- iPhone HEIC photos do not show in browsers. Export as JPG. Resize photos to about 1600 px wide.
- Compress a big video: `ffmpeg -i in.mov -vf scale=-2:720 -c:v libx264 -crf 28 -c:a aac -movflags +faststart video-01.mp4`

## Edit the words (only js/config.js)
Open it on GitHub, click the pencil, edit, **Commit changes**. You can change:
the letter (**sample text, replace it!**), captions, chapter lines, the star messages, the certificate, and `togetherSince` (like "2025-03-14") for a days-together line.
When all media is uploaded you may set `showPlaceholders: false`.

## Notes
- The passcode is a soft lock, not real security. A new passcode hash: open the site, press F12, Console, and run `hashCode(GIFT.salt + "1234")`; paste the result into `passcodeHash`.
- Free GitHub Pages needs a public repo, so anyone with the exact file address can see the photos. Use an unguessable repo name and only share the link with her.
- Best on a phone. Turn the sound on for the full effect.
Put photo-01.jpg ... photo-12.jpg here (.jpeg/.png/.webp also work).
Put video-01.mp4 and video-02.mp4 here (under 25 MB each).
Optional: put song.mp3 here.
