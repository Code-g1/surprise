# 💝 Birthday gift for Dalleiii

Passcode: **0904**

## 1. Put it on GitHub
1. On github.com click **+ → New repository**. Pick a hard-to-guess name (for example `dalleiii-h7k2-gift`). Choose **Public**, then **Create repository**.
2. Click **uploading an existing file**, drag in everything inside this folder (index.html, css, js, assets, tools, .nojekyll), then **Commit changes**.
3. Go to **Settings → Pages**. Under *Build and deployment* choose **Deploy from a branch**, branch **main**, folder **/(root)**, then **Save**.
4. After 1 to 2 minutes your link appears on that page: `https://YOUR-USERNAME.github.io/REPO-NAME/`. Open it on your phone to test.

## 2. Add your photos and videos
- Open the repo, go into `assets/photos`, click **Add file → Upload files** and drop in your 12 photos named exactly `photo-01.jpg` … `photo-12.jpg` (lowercase). `.jpeg`, `.png` and `.webp` also work.
- Do the same in `assets/videos` with `video-01.mp4` and `video-02.mp4`.
- Optional song: `assets/music/song.mp3`. A music button shows up by itself.
- iPhone photos in HEIC format will not show in browsers. Export them as JPG first.
- Make photos about 1600 px wide (try squoosh.app) so they load fast.
- GitHub's website uploader accepts files up to 25 MB. Shrink big videos with HandBrake, or with ffmpeg:
  `ffmpeg -i in.mov -vf scale=-2:720 -c:v libx264 -crf 28 -c:a aac -movflags +faststart video-01.mp4`

## 3. Write the letter, captions and messages
Open `js/config.js` on GitHub, click the pencil ✏️, edit, then **Commit changes**.
- `letter`: replace the sample text. **The sample is only a placeholder.**
- `photos` and `videos`: type captions between the quotes.
- `gameMessages`: add or change the sweet lines in the falling hearts.
- `togetherSince`: for example `"2025-03-14"` to show a "days together" counter.

Changes go live about a minute after you commit. If you still see the old version, refresh a few times.

## About the passcode
It is a soft lock, so it keeps the surprise from being opened by accident but is not real security. To change it, open `tools/make-passcode.html` in your browser, type the 4 digits, and paste the result into `passcodeHash` in `config.js`.

## About privacy
Free GitHub Pages needs a public repository, so anyone with the exact link or file addresses can see the photos. Use a hard-to-guess repo name and share the link only with her. You can also delete the repo after her birthday.
Put your photos here, named photo-01.jpg, photo-02.jpg ... photo-12.jpg
(.jpeg / .png / .webp also work). Tip: resize to about 1600px wide first so the page loads fast.

Put your 2 videos here: video-01.mp4 and video-02.mp4. Keep each under 25 MB for the GitHub website uploader.

Optional: put her song here as song.mp3 and a music button appears automatically.
