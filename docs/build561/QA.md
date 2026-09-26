# Build561: BGM delivery through a Service Worker

## Finding

The live GitHub Pages index and worker were Build560. A direct HTTP request for the first two bytes of the home MP3 returned 206 with `Content-Range: bytes 0-1/3640405` and two bytes. The corresponding GitHub commit and source hashes are in `source-verification.json`.

The previous browser harness did not register the production Service Worker. Build560's worker awaited `cache.put()` for every successful response, including a 206. A real browser Cache API rejects that write, which rejects the entire response promise. A cached full response also ignored incoming Range headers. The Build561 harness reproduced both defects and actual HTMLAudioElement failure using the old production worker.

## Verified

- Cold old worker: two-byte Range fetch rejects with TypeError.
- Warm old worker: the same two-byte request incorrectly receives 200 and 3,640,405 bytes.
- Cold old worker with real audio: MediaError code 4; playback remains at zero.
- Update to Build561 takes control without clearing application localStorage.
- New worker: correct 206 and two bytes, even with an intentionally stale cached full audio entry.
- All seven real bundled MP3s advance playback time and produce nonzero decoded PCM RMS through the production AudioSystem. Same permitted media element is reused.
- Forced HTTP 503 produces the error status; the in-game replay button reloads and recovers after connectivity returns.
- Additional taps do not rewind; manual retry respects OFF and zero music volume; pagehide/pageshow stops/resumes.
- Existing JavaScript offline caching remains usable with the browser context offline.
- No uncaught page errors. Expected old-worker network errors and injected 503 are part of the reproduction.
- Ten existing lifecycle tests and two additional failure/retry tests pass.
- The original `sfx()` implementation is unchanged. No production server, game, save, MP3, or stylesheet changes.

## Commands

Run from the project root:

```sh
node --test tests/build560-audio.test.mjs tests/build561-audio-recovery.test.mjs
node tools/build561/browser.mjs
python tools/build561/package.py
```

The harness serves the real production worker scripts under a GitHub Pages-like repository subpath. It uses `../baseline560` for old code, `../.task-audio560/music` for the unchanged MP3s, Playwright, and `QA_CHROMIUM` (or the local Chromium 133 runtime). These local QA dependencies are not runtime imports of the game.

## Limits

This verifies a concrete production failure mechanism and its repair; it is not a recording of the reporting iPhone. No iPhone hardware, Safari hardware audio routing, or live phone call was tested. The app status reports media playback state, not whether the physical speaker is audible. Standard browser networking now handles media; persistent offline audio caching is not promised. The patch was not deployed by the assistant.
