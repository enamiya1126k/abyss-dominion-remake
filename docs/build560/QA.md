# Build560 QA

- 10 focused audio lifecycle tests passed.
- Reproduction compares the deployed Build559 AudioSystem against the fix with the same controlled resume/policy failures. These mocks reproduce a code failure mechanism; they do not prove the state of the reporting iPhone.
- Chromium 133 with mobile touch and user-gesture autoplay policy decoded all seven unchanged MP3s. Playback times advanced and a Web Audio analyser measured nonzero PCM energy for each theme. This verifies decoded audio, not the physical output of the user’s phone.
- Automatic scene switches reused the same HTMLAudioElement. Additional taps did not rewind. OFF remained silent. Simulated pagehide/pageshow and a forced NotAllowedError followed by a trusted tap recovered. No browser page errors or failed resource responses.
- Existing sound-effect synthesis code matches the deployed source exactly.
- Main.js is unchanged; AudioSystem supplies recovery listeners in addition to its existing once-only pointerdown hook. The old build311 import is explicitly mapped to the new implementation.
- Client settings and saves are untouched. No server or gameplay changes; no public deployment.

Run from game/:

```
node --test tests/build560-audio.test.mjs
node tools/build560/reproduce.mjs
QA_CHROMIUM=/path/to/chromium node tools/build560/browser.mjs
python tools/build560/package.py
```

The browser harness reads the seven MP3s from ../.task-audio560/music. The fixture is local-only and has no production imports beyond AudioSystem.
