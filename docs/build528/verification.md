# Build528 verification

- Rules tests: `node --test tests/build528-party.test.mjs` — 20/20.
- Regression: `node tools/build528/regression.mjs` — 37/37. Existing tests 511/482/498 adapted only for the new protocol flag/version and the DOM fixture's bounding rectangle. Production coordinator coverage uses the original tests' catalog fixtures only where the partial checkout lacks base catalogs.
- Browser: Chromium 153, mobile emulation with real touch dispatch at 320×568, 375×667, 390×700, 430×800. All equipment reachable; no duplicate selector; scroll survives rebuild; four player buttons switch directly; Escape closes; 8/16 controls update facts; movement card warning shown before use; gorilla rage artwork loads. No page JavaScript errors.
- Japanese Noto Sans JP supplied only by the QA harness. Placeholder creature portraits are not production changes.
- Runtime syntax and import-map/offline consistency: `package-checks.json`.

## Browser reproduction

Install Playwright and its Chromium, then run `node tools/build528/browser-qa.mjs` from a full checkout. Optional environment variables: `PLAYWRIGHT_MODULE` (module path), `CHROMIUM_PATH` (executable), `QA_FONT_DIR` (unpacked @fontsource/noto-sans-jp package for Linux QA fonts). It hosts a local preview on 127.0.0.1:8528 and writes results/screenshots to this directory.

The browser harness drives production UI modules using a local controller and fixed public game states, not an authenticated live server. Node regression covers the production coordinator. Native iPhone/Safari and full main-app bootstrap are not verified here.
