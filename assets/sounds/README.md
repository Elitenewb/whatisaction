# Sound files (optional)

Add your audio files **in this folder** using exactly these filenames so the game can play them automatically:

| Filename | When it plays |
|----------|----------------|
| `dice-roll.mp3` | When a player clicks **Roll** (during the number animation) |
| `correct.mp3` | After a **correct** answer |
| `incorrect.mp3` | After an **incorrect** answer |
| `victory.mp3` | When someone **wins** (game over modal) |

**Format:** The code uses `.mp3` paths. You can replace with `.ogg` if you prefer — then edit the filenames in [`app.js`](../app.js) in the `SOUND_URLS` object at the top of the file.

If a file is missing, the game still works; failed playback is ignored.

**Licensing:** Only use sounds you have the rights to use in class or on the web.
