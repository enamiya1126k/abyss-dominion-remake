import test from "node:test";
import assert from "node:assert/strict";

const SERVER_KEY = "abyss-dominion-online-server-url";
const TOKEN_KEY = "abyss-dominion-online-resume-token";
const AUTO_KEY = "abyss-dominion-online-auto-connect";
const FIXED_URL = "https://stumble-mountain-lego.ngrok-free.dev";

test("build246 always fills the online URL field with the fixed ngrok domain", async () => {
  const previousStorage = globalThis.localStorage;
  const values = new Map([
    [SERVER_KEY, "https://old-tunnel.example"],
    [TOKEN_KEY, "old-server-token"],
    [AUTO_KEY, "1"],
  ]);
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
  try {
    const { DEFAULT_ONLINE_SERVER_URL, enforceFixedOnlineServerUrl } = await import("../src/ui/screens/OnlinePartyScreen.js?v=2.11.70-build246-fixed-url-test");
    assert.equal(DEFAULT_ONLINE_SERVER_URL, FIXED_URL);
    assert.equal(enforceFixedOnlineServerUrl(), FIXED_URL);
    assert.equal(values.get(SERVER_KEY), FIXED_URL);
    assert.equal(values.get(TOKEN_KEY), "", "a recovery token from another server is not sent to the fixed server");
    assert.equal(values.get(AUTO_KEY), "0", "a changed endpoint waits for one explicit connection");
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});

test("build246 preserves reconnection state when the saved hostname is already the fixed server", async () => {
  const previousStorage = globalThis.localStorage;
  const values = new Map([
    [SERVER_KEY, "stumble-mountain-lego.ngrok-free.dev"],
    [TOKEN_KEY, "current-server-token"],
    [AUTO_KEY, "1"],
  ]);
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
  try {
    const { enforceFixedOnlineServerUrl } = await import("../src/ui/screens/OnlinePartyScreen.js?v=2.11.70-build246-fixed-url-preserve-test");
    assert.equal(enforceFixedOnlineServerUrl(), FIXED_URL);
    assert.equal(values.get(SERVER_KEY), FIXED_URL);
    assert.equal(values.get(TOKEN_KEY), "current-server-token");
    assert.equal(values.get(AUTO_KEY), "1");
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});

