(() => {
  // src/core/config.js
  var APP_VERSION = "0.8.0-alpha.2.1";
  var SAVE_KEY = "abyss-dominion-remake-v001";

  // src/data/species.js
  var SPECIES = {
    slime: { id: "slime", emoji: "\u{1FAE7}", name: "\u30B9\u30E9\u30A4\u30E0", element: "water", race: "slime", role: "balanced", rarity: "N", minFloor: 1, captureRate: 1, maxMp: 16, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 46, atk: 6, def: 4, spd: 10, crit: 5, evasion: 3 }, rankNames: ["\u30B9\u30E9\u30A4\u30E0", "\u4E0A\u4F4D\u30B9\u30E9\u30A4\u30E0", "\u30B9\u30E9\u30A4\u30E0\u738B", "\u6DF1\u6DF5\u30B9\u30E9\u30A4\u30E0"], skills: [{ id: "slime_skill", name: "\u4F53\u5F53\u305F\u308A", unlock: { type: "level", value: 1 }, description: "\u4F53\u5F53\u305F\u308A\u3067\u6226\u3046\u3002" }] },
    baby_slime: { id: "baby_slime", emoji: "\u{1F7E2}", name: "\u30D9\u30D3\u30FC\u30B9\u30E9\u30A4\u30E0", element: "water", race: "slime", role: "support", rarity: "N", minFloor: 2, captureRate: 1, maxMp: 18, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 34, atk: 4, def: 3, spd: 13, crit: 4, evasion: 6 }, rankNames: ["\u30D9\u30D3\u30FC\u30B9\u30E9\u30A4\u30E0", "\u4E0A\u4F4D\u30D9\u30D3\u30FC\u30B9\u30E9\u30A4\u30E0", "\u30D9\u30D3\u30FC\u30B9\u30E9\u30A4\u30E0\u738B", "\u6DF1\u6DF5\u30D9\u30D3\u30FC\u30B9\u30E9\u30A4\u30E0"], skills: [{ id: "baby_slime_skill", name: "\u3077\u308B\u3077\u308B\u5FDC\u63F4", unlock: { type: "level", value: 1 }, description: "\u3077\u308B\u3077\u308B\u5FDC\u63F4\u3067\u6226\u3046\u3002" }] },
    acid_slime: { id: "acid_slime", emoji: "\u{1F9EA}", name: "\u9178\u30B9\u30E9\u30A4\u30E0", element: "poison", race: "slime", role: "debuffer", rarity: "N", minFloor: 5, captureRate: 1, maxMp: 17, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 44, atk: 7, def: 4, spd: 9, crit: 5, evasion: 3 }, rankNames: ["\u9178\u30B9\u30E9\u30A4\u30E0", "\u4E0A\u4F4D\u9178\u30B9\u30E9\u30A4\u30E0", "\u9178\u30B9\u30E9\u30A4\u30E0\u738B", "\u6DF1\u6DF5\u9178\u30B9\u30E9\u30A4\u30E0"], skills: [{ id: "acid_slime_skill", name: "\u9178\u6DB2", unlock: { type: "level", value: 1 }, description: "\u9178\u6DB2\u3067\u6226\u3046\u3002" }] },
    ember_slime: { id: "ember_slime", emoji: "\u{1F7E0}", name: "\u706B\u7A2E\u30B9\u30E9\u30A4\u30E0", element: "fire", race: "slime", role: "burner", rarity: "N", minFloor: 8, captureRate: 1, maxMp: 16, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 42, atk: 8, def: 3, spd: 11, crit: 6, evasion: 4 }, rankNames: ["\u706B\u7A2E\u30B9\u30E9\u30A4\u30E0", "\u4E0A\u4F4D\u706B\u7A2E\u30B9\u30E9\u30A4\u30E0", "\u706B\u7A2E\u30B9\u30E9\u30A4\u30E0\u738B", "\u6DF1\u6DF5\u706B\u7A2E\u30B9\u30E9\u30A4\u30E0"], skills: [{ id: "ember_slime_skill", name: "\u706B\u7A2E\u5F3E", unlock: { type: "level", value: 1 }, description: "\u706B\u7A2E\u5F3E\u3067\u6226\u3046\u3002" }] },
    frost_slime: { id: "frost_slime", emoji: "\u{1F535}", name: "\u6C37\u7D50\u30B9\u30E9\u30A4\u30E0", element: "water", race: "slime", role: "controller", rarity: "N", minFloor: 12, captureRate: 1, maxMp: 18, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 48, atk: 6, def: 6, spd: 8, crit: 4, evasion: 3 }, rankNames: ["\u6C37\u7D50\u30B9\u30E9\u30A4\u30E0", "\u4E0A\u4F4D\u6C37\u7D50\u30B9\u30E9\u30A4\u30E0", "\u6C37\u7D50\u30B9\u30E9\u30A4\u30E0\u738B", "\u6DF1\u6DF5\u6C37\u7D50\u30B9\u30E9\u30A4\u30E0"], skills: [{ id: "frost_slime_skill", name: "\u6C37\u3064\u3076\u3066", unlock: { type: "level", value: 1 }, description: "\u6C37\u3064\u3076\u3066\u3067\u6226\u3046\u3002" }] },
    king_slime: { id: "king_slime", emoji: "\u{1F451}", name: "\u30AD\u30F3\u30B0\u30B9\u30E9\u30A4\u30E0", element: "water", race: "slime", role: "tank", rarity: "SR", minFloor: 35, captureRate: 1, maxMp: 25, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 88, atk: 10, def: 12, spd: 5, crit: 5, evasion: 2 }, rankNames: ["\u30AD\u30F3\u30B0\u30B9\u30E9\u30A4\u30E0", "\u4E0A\u4F4D\u30AD\u30F3\u30B0\u30B9\u30E9\u30A4\u30E0", "\u30AD\u30F3\u30B0\u30B9\u30E9\u30A4\u30E0\u738B", "\u6DF1\u6DF5\u30AD\u30F3\u30B0\u30B9\u30E9\u30A4\u30E0"], skills: [{ id: "king_slime_skill", name: "\u738B\u306E\u7C98\u819C", unlock: { type: "level", value: 1 }, description: "\u738B\u306E\u7C98\u819C\u3067\u6226\u3046\u3002" }] },
    cave_rat: { id: "cave_rat", emoji: "\u{1F400}", name: "\u6D1E\u7A9F\u30CD\u30BA\u30DF", element: "earth", race: "beast", role: "speed", rarity: "N", minFloor: 2, captureRate: 1, maxMp: 10, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 35, atk: 7, def: 3, spd: 18, crit: 10, evasion: 12 }, rankNames: ["\u6D1E\u7A9F\u30CD\u30BA\u30DF", "\u4E0A\u4F4D\u6D1E\u7A9F\u30CD\u30BA\u30DF", "\u6D1E\u7A9F\u30CD\u30BA\u30DF\u738B", "\u6DF1\u6DF5\u6D1E\u7A9F\u30CD\u30BA\u30DF"], skills: [{ id: "cave_rat_skill", name: "\u304B\u3058\u308A\u3064\u304F", unlock: { type: "level", value: 1 }, description: "\u304B\u3058\u308A\u3064\u304F\u3067\u6226\u3046\u3002" }] },
    fang_rat: { id: "fang_rat", emoji: "\u{1F401}", name: "\u7259\u30CD\u30BA\u30DF", element: "dark", race: "beast", role: "critical", rarity: "N", minFloor: 7, captureRate: 1, maxMp: 10, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 39, atk: 9, def: 3, spd: 20, crit: 16, evasion: 11 }, rankNames: ["\u7259\u30CD\u30BA\u30DF", "\u4E0A\u4F4D\u7259\u30CD\u30BA\u30DF", "\u7259\u30CD\u30BA\u30DF\u738B", "\u6DF1\u6DF5\u7259\u30CD\u30BA\u30DF"], skills: [{ id: "fang_rat_skill", name: "\u6025\u6240\u565B\u307F", unlock: { type: "level", value: 1 }, description: "\u6025\u6240\u565B\u307F\u3067\u6226\u3046\u3002" }] },
    bat: { id: "bat", emoji: "\u{1F987}", name: "\u30B3\u30A6\u30E2\u30EA", element: "dark", race: "flying", role: "speed", rarity: "N", minFloor: 2, captureRate: 1, maxMp: 13, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 31, atk: 6, def: 2, spd: 22, crit: 9, evasion: 16 }, rankNames: ["\u30B3\u30A6\u30E2\u30EA", "\u4E0A\u4F4D\u30B3\u30A6\u30E2\u30EA", "\u30B3\u30A6\u30E2\u30EA\u738B", "\u6DF1\u6DF5\u30B3\u30A6\u30E2\u30EA"], skills: [{ id: "bat_skill", name: "\u97F3\u6CE2", unlock: { type: "level", value: 1 }, description: "\u97F3\u6CE2\u3067\u6226\u3046\u3002" }] },
    vampire_bat: { id: "vampire_bat", emoji: "\u{1F9DB}", name: "\u5438\u8840\u30B3\u30A6\u30E2\u30EA", element: "dark", race: "flying", role: "drain", rarity: "N", minFloor: 10, captureRate: 1, maxMp: 16, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 38, atk: 8, def: 3, spd: 19, crit: 10, evasion: 14 }, rankNames: ["\u5438\u8840\u30B3\u30A6\u30E2\u30EA", "\u4E0A\u4F4D\u5438\u8840\u30B3\u30A6\u30E2\u30EA", "\u5438\u8840\u30B3\u30A6\u30E2\u30EA\u738B", "\u6DF1\u6DF5\u5438\u8840\u30B3\u30A6\u30E2\u30EA"], skills: [{ id: "vampire_bat_skill", name: "\u5438\u8840", unlock: { type: "level", value: 1 }, description: "\u5438\u8840\u3067\u6226\u3046\u3002" }] },
    caterpillar: { id: "caterpillar", emoji: "\u{1F41B}", name: "\u6D1E\u7A9F\u30A4\u30E2\u30E0\u30B7", element: "earth", race: "insect", role: "tank", rarity: "N", minFloor: 3, captureRate: 1, maxMp: 12, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 55, atk: 5, def: 8, spd: 4, crit: 3, evasion: 1 }, rankNames: ["\u6D1E\u7A9F\u30A4\u30E2\u30E0\u30B7", "\u4E0A\u4F4D\u6D1E\u7A9F\u30A4\u30E2\u30E0\u30B7", "\u6D1E\u7A9F\u30A4\u30E2\u30E0\u30B7\u738B", "\u6DF1\u6DF5\u6D1E\u7A9F\u30A4\u30E2\u30E0\u30B7"], skills: [{ id: "caterpillar_skill", name: "\u7C98\u7740\u7CF8", unlock: { type: "level", value: 1 }, description: "\u7C98\u7740\u7CF8\u3067\u6226\u3046\u3002" }] },
    centipede: { id: "centipede", emoji: "\u{1FAB1}", name: "\u5CA9\u30E0\u30AB\u30C7", element: "poison", race: "insect", role: "poison", rarity: "N", minFloor: 6, captureRate: 1, maxMp: 14, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 49, atk: 9, def: 6, spd: 12, crit: 8, evasion: 5 }, rankNames: ["\u5CA9\u30E0\u30AB\u30C7", "\u4E0A\u4F4D\u5CA9\u30E0\u30AB\u30C7", "\u5CA9\u30E0\u30AB\u30C7\u738B", "\u6DF1\u6DF5\u5CA9\u30E0\u30AB\u30C7"], skills: [{ id: "centipede_skill", name: "\u6BD2\u7259", unlock: { type: "level", value: 1 }, description: "\u6BD2\u7259\u3067\u6226\u3046\u3002" }] },
    beetle: { id: "beetle", emoji: "\u{1FAB2}", name: "\u7532\u5191\u30AB\u30D6\u30C8", element: "earth", race: "insect", role: "tank", rarity: "N", minFloor: 12, captureRate: 1, maxMp: 12, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 62, atk: 8, def: 12, spd: 5, crit: 5, evasion: 2 }, rankNames: ["\u7532\u5191\u30AB\u30D6\u30C8", "\u4E0A\u4F4D\u7532\u5191\u30AB\u30D6\u30C8", "\u7532\u5191\u30AB\u30D6\u30C8\u738B", "\u6DF1\u6DF5\u7532\u5191\u30AB\u30D6\u30C8"], skills: [{ id: "beetle_skill", name: "\u89D2\u7A81\u9032", unlock: { type: "level", value: 1 }, description: "\u89D2\u7A81\u9032\u3067\u6226\u3046\u3002" }] },
    mantis: { id: "mantis", emoji: "\u{1F997}", name: "\u5203\u30AB\u30DE\u30AD\u30EA", element: "wind", race: "insect", role: "assassin", rarity: "N", minFloor: 18, captureRate: 1, maxMp: 13, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 43, atk: 13, def: 4, spd: 19, crit: 15, evasion: 10 }, rankNames: ["\u5203\u30AB\u30DE\u30AD\u30EA", "\u4E0A\u4F4D\u5203\u30AB\u30DE\u30AD\u30EA", "\u5203\u30AB\u30DE\u30AD\u30EA\u738B", "\u6DF1\u6DF5\u5203\u30AB\u30DE\u30AD\u30EA"], skills: [{ id: "mantis_skill", name: "\u938C\u9023\u6483", unlock: { type: "level", value: 1 }, description: "\u938C\u9023\u6483\u3067\u6226\u3046\u3002" }] },
    skeleton: { id: "skeleton", emoji: "\u{1F480}", name: "\u30B9\u30B1\u30EB\u30C8\u30F3", element: "dark", race: "undead", role: "balanced", rarity: "N", minFloor: 3, captureRate: 1, maxMp: 12, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 48, atk: 8, def: 6, spd: 10, crit: 7, evasion: 4 }, rankNames: ["\u30B9\u30B1\u30EB\u30C8\u30F3", "\u4E0A\u4F4D\u30B9\u30B1\u30EB\u30C8\u30F3", "\u30B9\u30B1\u30EB\u30C8\u30F3\u738B", "\u6DF1\u6DF5\u30B9\u30B1\u30EB\u30C8\u30F3"], skills: [{ id: "skeleton_skill", name: "\u9AA8\u65AC\u308A", unlock: { type: "level", value: 1 }, description: "\u9AA8\u65AC\u308A\u3067\u6226\u3046\u3002" }] },
    skeleton_archer: { id: "skeleton_archer", emoji: "\u{1F3F9}", name: "\u9AB8\u9AA8\u5F13\u5175", element: "dark", race: "undead", role: "ranged", rarity: "N", minFloor: 8, captureRate: 1, maxMp: 14, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 41, atk: 11, def: 4, spd: 14, crit: 12, evasion: 7 }, rankNames: ["\u9AB8\u9AA8\u5F13\u5175", "\u4E0A\u4F4D\u9AB8\u9AA8\u5F13\u5175", "\u9AB8\u9AA8\u5F13\u5175\u738B", "\u6DF1\u6DF5\u9AB8\u9AA8\u5F13\u5175"], skills: [{ id: "skeleton_archer_skill", name: "\u9AA8\u77E2", unlock: { type: "level", value: 1 }, description: "\u9AA8\u77E2\u3067\u6226\u3046\u3002" }] },
    skeleton_guard: { id: "skeleton_guard", emoji: "\u{1F6E1}\uFE0F", name: "\u9AB8\u9AA8\u5175\u58EB", element: "dark", race: "undead", role: "tank", rarity: "N", minFloor: 14, captureRate: 1, maxMp: 13, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 64, atk: 8, def: 12, spd: 6, crit: 5, evasion: 2 }, rankNames: ["\u9AB8\u9AA8\u5175\u58EB", "\u4E0A\u4F4D\u9AB8\u9AA8\u5175\u58EB", "\u9AB8\u9AA8\u5175\u58EB\u738B", "\u6DF1\u6DF5\u9AB8\u9AA8\u5175\u58EB"], skills: [{ id: "skeleton_guard_skill", name: "\u76FE\u6BB4\u308A", unlock: { type: "level", value: 1 }, description: "\u76FE\u6BB4\u308A\u3067\u6226\u3046\u3002" }] },
    zombie: { id: "zombie", emoji: "\u{1F9DF}", name: "\u30BE\u30F3\u30D3", element: "poison", race: "undead", role: "tank", rarity: "N", minFloor: 9, captureRate: 1, maxMp: 11, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 72, atk: 9, def: 8, spd: 3, crit: 3, evasion: 1 }, rankNames: ["\u30BE\u30F3\u30D3", "\u4E0A\u4F4D\u30BE\u30F3\u30D3", "\u30BE\u30F3\u30D3\u738B", "\u6DF1\u6DF5\u30BE\u30F3\u30D3"], skills: [{ id: "zombie_skill", name: "\u8150\u722A", unlock: { type: "level", value: 1 }, description: "\u8150\u722A\u3067\u6226\u3046\u3002" }] },
    ghost: { id: "ghost", emoji: "\u{1F47B}", name: "\u30B4\u30FC\u30B9\u30C8", element: "dark", race: "undead", role: "magic", rarity: "N", minFloor: 15, captureRate: 1, maxMp: 22, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 39, atk: 10, def: 3, spd: 17, crit: 8, evasion: 20 }, rankNames: ["\u30B4\u30FC\u30B9\u30C8", "\u4E0A\u4F4D\u30B4\u30FC\u30B9\u30C8", "\u30B4\u30FC\u30B9\u30C8\u738B", "\u6DF1\u6DF5\u30B4\u30FC\u30B9\u30C8"], skills: [{ id: "ghost_skill", name: "\u970A\u5F3E", unlock: { type: "level", value: 1 }, description: "\u970A\u5F3E\u3067\u6226\u3046\u3002" }] },
    wraith: { id: "wraith", emoji: "\u{1F32B}\uFE0F", name: "\u30EC\u30A4\u30B9", element: "dark", race: "undead", role: "debuffer", rarity: "SR", minFloor: 32, captureRate: 1, maxMp: 26, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 48, atk: 12, def: 5, spd: 18, crit: 12, evasion: 17 }, rankNames: ["\u30EC\u30A4\u30B9", "\u4E0A\u4F4D\u30EC\u30A4\u30B9", "\u30EC\u30A4\u30B9\u738B", "\u6DF1\u6DF5\u30EC\u30A4\u30B9"], skills: [{ id: "wraith_skill", name: "\u9B42\u55B0\u3044", unlock: { type: "level", value: 1 }, description: "\u9B42\u55B0\u3044\u3067\u6226\u3046\u3002" }] },
    goblin: { id: "goblin", emoji: "\u{1F47A}", name: "\u30B4\u30D6\u30EA\u30F3", element: "dark", race: "goblin", role: "speed", rarity: "N", minFloor: 4, captureRate: 1, maxMp: 13, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 50, atk: 9, def: 5, spd: 15, crit: 11, evasion: 8 }, rankNames: ["\u30B4\u30D6\u30EA\u30F3", "\u4E0A\u4F4D\u30B4\u30D6\u30EA\u30F3", "\u30B4\u30D6\u30EA\u30F3\u738B", "\u6DF1\u6DF5\u30B4\u30D6\u30EA\u30F3"], skills: [{ id: "goblin_skill", name: "\u4E8C\u6BB5\u65AC\u308A", unlock: { type: "level", value: 1 }, description: "\u4E8C\u6BB5\u65AC\u308A\u3067\u6226\u3046\u3002" }] },
    goblin_guard: { id: "goblin_guard", emoji: "\u{1FA96}", name: "\u30B4\u30D6\u30EA\u30F3\u5175", element: "earth", race: "goblin", role: "tank", rarity: "N", minFloor: 10, captureRate: 1, maxMp: 14, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 61, atk: 9, def: 10, spd: 9, crit: 6, evasion: 4 }, rankNames: ["\u30B4\u30D6\u30EA\u30F3\u5175", "\u4E0A\u4F4D\u30B4\u30D6\u30EA\u30F3\u5175", "\u30B4\u30D6\u30EA\u30F3\u5175\u738B", "\u6DF1\u6DF5\u30B4\u30D6\u30EA\u30F3\u5175"], skills: [{ id: "goblin_guard_skill", name: "\u9632\u885B\u7A81\u304D", unlock: { type: "level", value: 1 }, description: "\u9632\u885B\u7A81\u304D\u3067\u6226\u3046\u3002" }] },
    goblin_shaman: { id: "goblin_shaman", emoji: "\u{1FA84}", name: "\u30B4\u30D6\u30EA\u30F3\u546A\u8853\u5E2B", element: "dark", race: "goblin", role: "magic", rarity: "N", minFloor: 16, captureRate: 1, maxMp: 24, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 42, atk: 12, def: 4, spd: 12, crit: 7, evasion: 6 }, rankNames: ["\u30B4\u30D6\u30EA\u30F3\u546A\u8853\u5E2B", "\u4E0A\u4F4D\u30B4\u30D6\u30EA\u30F3\u546A\u8853\u5E2B", "\u30B4\u30D6\u30EA\u30F3\u546A\u8853\u5E2B\u738B", "\u6DF1\u6DF5\u30B4\u30D6\u30EA\u30F3\u546A\u8853\u5E2B"], skills: [{ id: "goblin_shaman_skill", name: "\u546A\u5F3E", unlock: { type: "level", value: 1 }, description: "\u546A\u5F3E\u3067\u6226\u3046\u3002" }] },
    orc: { id: "orc", emoji: "\u{1F479}", name: "\u30AA\u30FC\u30AF", element: "earth", race: "demon", role: "bruiser", rarity: "N", minFloor: 18, captureRate: 1, maxMp: 14, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 78, atk: 14, def: 9, spd: 6, crit: 7, evasion: 2 }, rankNames: ["\u30AA\u30FC\u30AF", "\u4E0A\u4F4D\u30AA\u30FC\u30AF", "\u30AA\u30FC\u30AF\u738B", "\u6DF1\u6DF5\u30AA\u30FC\u30AF"], skills: [{ id: "orc_skill", name: "\u8C6A\u8155", unlock: { type: "level", value: 1 }, description: "\u8C6A\u8155\u3067\u6226\u3046\u3002" }] },
    ogre: { id: "ogre", emoji: "\u{1F9CC}", name: "\u30AA\u30FC\u30AC", element: "earth", race: "demon", role: "bruiser", rarity: "N", minFloor: 28, captureRate: 1, maxMp: 13, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 96, atk: 18, def: 8, spd: 4, crit: 8, evasion: 1 }, rankNames: ["\u30AA\u30FC\u30AC", "\u4E0A\u4F4D\u30AA\u30FC\u30AC", "\u30AA\u30FC\u30AC\u738B", "\u6DF1\u6DF5\u30AA\u30FC\u30AC"], skills: [{ id: "ogre_skill", name: "\u5927\u5730\u7815\u304D", unlock: { type: "level", value: 1 }, description: "\u5927\u5730\u7815\u304D\u3067\u6226\u3046\u3002" }] },
    mushroom: { id: "mushroom", emoji: "\u{1F344}", name: "\u6BD2\u30AD\u30CE\u30B3", element: "poison", race: "plant", role: "poison", rarity: "N", minFloor: 5, captureRate: 1, maxMp: 17, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 58, atk: 8, def: 6, spd: 8, crit: 5, evasion: 5 }, rankNames: ["\u6BD2\u30AD\u30CE\u30B3", "\u4E0A\u4F4D\u6BD2\u30AD\u30CE\u30B3", "\u6BD2\u30AD\u30CE\u30B3\u738B", "\u6DF1\u6DF5\u6BD2\u30AD\u30CE\u30B3"], skills: [{ id: "mushroom_skill", name: "\u6BD2\u80DE\u5B50", unlock: { type: "level", value: 1 }, description: "\u6BD2\u80DE\u5B50\u3067\u6226\u3046\u3002" }] },
    healing_mushroom: { id: "healing_mushroom", emoji: "\u{1F344}\u200D\u{1F7EB}", name: "\u7652\u3057\u30AD\u30CE\u30B3", element: "nature", race: "plant", role: "healer", rarity: "N", minFloor: 14, captureRate: 1, maxMp: 24, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 52, atk: 5, def: 7, spd: 7, crit: 4, evasion: 4 }, rankNames: ["\u7652\u3057\u30AD\u30CE\u30B3", "\u4E0A\u4F4D\u7652\u3057\u30AD\u30CE\u30B3", "\u7652\u3057\u30AD\u30CE\u30B3\u738B", "\u6DF1\u6DF5\u7652\u3057\u30AD\u30CE\u30B3"], skills: [{ id: "healing_mushroom_skill", name: "\u80DE\u5B50\u6CBB\u7652", unlock: { type: "level", value: 1 }, description: "\u80DE\u5B50\u6CBB\u7652\u3067\u6226\u3046\u3002" }] },
    thorn_bud: { id: "thorn_bud", emoji: "\u{1F331}", name: "\u30C8\u30B2\u30C4\u30DC\u30DF", element: "nature", race: "plant", role: "counter", rarity: "N", minFloor: 11, captureRate: 1, maxMp: 16, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 54, atk: 10, def: 8, spd: 7, crit: 7, evasion: 3 }, rankNames: ["\u30C8\u30B2\u30C4\u30DC\u30DF", "\u4E0A\u4F4D\u30C8\u30B2\u30C4\u30DC\u30DF", "\u30C8\u30B2\u30C4\u30DC\u30DF\u738B", "\u6DF1\u6DF5\u30C8\u30B2\u30C4\u30DC\u30DF"], skills: [{ id: "thorn_bud_skill", name: "\u68D8\u98DB\u3070\u3057", unlock: { type: "level", value: 1 }, description: "\u68D8\u98DB\u3070\u3057\u3067\u6226\u3046\u3002" }] },
    mandrake: { id: "mandrake", emoji: "\u{1FAB4}", name: "\u30DE\u30F3\u30C9\u30E9\u30B4\u30E9", element: "nature", race: "plant", role: "debuffer", rarity: "N", minFloor: 22, captureRate: 1, maxMp: 25, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 57, atk: 9, def: 7, spd: 10, crit: 5, evasion: 5 }, rankNames: ["\u30DE\u30F3\u30C9\u30E9\u30B4\u30E9", "\u4E0A\u4F4D\u30DE\u30F3\u30C9\u30E9\u30B4\u30E9", "\u30DE\u30F3\u30C9\u30E9\u30B4\u30E9\u738B", "\u6DF1\u6DF5\u30DE\u30F3\u30C9\u30E9\u30B4\u30E9"], skills: [{ id: "mandrake_skill", name: "\u7D76\u53EB", unlock: { type: "level", value: 1 }, description: "\u7D76\u53EB\u3067\u6226\u3046\u3002" }] },
    fairy: { id: "fairy", emoji: "\u{1F9DA}", name: "\u5996\u7CBE", element: "light", race: "spirit", role: "healer", rarity: "N", minFloor: 12, captureRate: 1, maxMp: 24, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 34, atk: 4, def: 3, spd: 18, crit: 4, evasion: 14 }, rankNames: ["\u5996\u7CBE", "\u4E0A\u4F4D\u5996\u7CBE", "\u5996\u7CBE\u738B", "\u6DF1\u6DF5\u5996\u7CBE"], skills: [{ id: "fairy_skill", name: "\u7652\u3084\u3057\u306E\u98A8", unlock: { type: "level", value: 1 }, description: "\u7652\u3084\u3057\u306E\u98A8\u3067\u6226\u3046\u3002" }] },
    willowisp: { id: "willowisp", emoji: "\u{1F525}", name: "\u9B3C\u706B", element: "fire", race: "spirit", role: "magic", rarity: "N", minFloor: 17, captureRate: 1, maxMp: 22, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 36, atk: 11, def: 3, spd: 20, crit: 9, evasion: 18 }, rankNames: ["\u9B3C\u706B", "\u4E0A\u4F4D\u9B3C\u706B", "\u9B3C\u706B\u738B", "\u6DF1\u6DF5\u9B3C\u706B"], skills: [{ id: "willowisp_skill", name: "\u706B\u306E\u7389", unlock: { type: "level", value: 1 }, description: "\u706B\u306E\u7389\u3067\u6226\u3046\u3002" }] },
    water_spirit: { id: "water_spirit", emoji: "\u{1F4A7}", name: "\u6C34\u7CBE", element: "water", race: "spirit", role: "support", rarity: "N", minFloor: 21, captureRate: 1, maxMp: 26, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 46, atk: 7, def: 6, spd: 15, crit: 5, evasion: 10 }, rankNames: ["\u6C34\u7CBE", "\u4E0A\u4F4D\u6C34\u7CBE", "\u6C34\u7CBE\u738B", "\u6DF1\u6DF5\u6C34\u7CBE"], skills: [{ id: "water_spirit_skill", name: "\u6E05\u6D41", unlock: { type: "level", value: 1 }, description: "\u6E05\u6D41\u3067\u6226\u3046\u3002" }] },
    stone_golem: { id: "stone_golem", emoji: "\u{1F5FF}", name: "\u77F3\u30B4\u30FC\u30EC\u30E0", element: "earth", race: "construct", role: "tank", rarity: "N", minFloor: 25, captureRate: 1, maxMp: 10, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 102, atk: 11, def: 17, spd: 2, crit: 3, evasion: 0 }, rankNames: ["\u77F3\u30B4\u30FC\u30EC\u30E0", "\u4E0A\u4F4D\u77F3\u30B4\u30FC\u30EC\u30E0", "\u77F3\u30B4\u30FC\u30EC\u30E0\u738B", "\u6DF1\u6DF5\u77F3\u30B4\u30FC\u30EC\u30E0"], skills: [{ id: "stone_golem_skill", name: "\u5CA9\u77F3\u62F3", unlock: { type: "level", value: 1 }, description: "\u5CA9\u77F3\u62F3\u3067\u6226\u3046\u3002" }] },
    clockwork: { id: "clockwork", emoji: "\u2699\uFE0F", name: "\u6B6F\u8ECA\u5175", element: "lightning", race: "construct", role: "balanced", rarity: "N", minFloor: 33, captureRate: 1, maxMp: 18, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 63, atk: 12, def: 10, spd: 12, crit: 8, evasion: 5 }, rankNames: ["\u6B6F\u8ECA\u5175", "\u4E0A\u4F4D\u6B6F\u8ECA\u5175", "\u6B6F\u8ECA\u5175\u738B", "\u6DF1\u6DF5\u6B6F\u8ECA\u5175"], skills: [{ id: "clockwork_skill", name: "\u96FB\u78C1\u6253\u6483", unlock: { type: "level", value: 1 }, description: "\u96FB\u78C1\u6253\u6483\u3067\u6226\u3046\u3002" }] },
    wolf: { id: "wolf", emoji: "\u{1F43A}", name: "\u6D1E\u7A9F\u30A6\u30EB\u30D5", element: "wind", race: "beast", role: "speed", rarity: "N", minFloor: 16, captureRate: 1, maxMp: 14, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 58, atk: 12, def: 6, spd: 19, crit: 12, evasion: 10 }, rankNames: ["\u6D1E\u7A9F\u30A6\u30EB\u30D5", "\u4E0A\u4F4D\u6D1E\u7A9F\u30A6\u30EB\u30D5", "\u6D1E\u7A9F\u30A6\u30EB\u30D5\u738B", "\u6DF1\u6DF5\u6D1E\u7A9F\u30A6\u30EB\u30D5"], skills: [{ id: "wolf_skill", name: "\u75BE\u98A8\u7259", unlock: { type: "level", value: 1 }, description: "\u75BE\u98A8\u7259\u3067\u6226\u3046\u3002" }] },
    dire_wolf: { id: "dire_wolf", emoji: "\u{1F43A}", name: "\u30C0\u30A4\u30A2\u30A6\u30EB\u30D5", element: "dark", race: "beast", role: "bruiser", rarity: "SR", minFloor: 38, captureRate: 1, maxMp: 16, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 76, atk: 16, def: 8, spd: 15, crit: 13, evasion: 8 }, rankNames: ["\u30C0\u30A4\u30A2\u30A6\u30EB\u30D5", "\u4E0A\u4F4D\u30C0\u30A4\u30A2\u30A6\u30EB\u30D5", "\u30C0\u30A4\u30A2\u30A6\u30EB\u30D5\u738B", "\u6DF1\u6DF5\u30C0\u30A4\u30A2\u30A6\u30EB\u30D5"], skills: [{ id: "dire_wolf_skill", name: "\u6708\u5F71\u7259", unlock: { type: "level", value: 1 }, description: "\u6708\u5F71\u7259\u3067\u6226\u3046\u3002" }] },
    bear: { id: "bear", emoji: "\u{1F43B}", name: "\u5CA9\u718A", element: "earth", race: "beast", role: "tank", rarity: "N", minFloor: 30, captureRate: 1, maxMp: 12, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 105, atk: 16, def: 13, spd: 5, crit: 6, evasion: 2 }, rankNames: ["\u5CA9\u718A", "\u4E0A\u4F4D\u5CA9\u718A", "\u5CA9\u718A\u738B", "\u6DF1\u6DF5\u5CA9\u718A"], skills: [{ id: "bear_skill", name: "\u718A\u638C", unlock: { type: "level", value: 1 }, description: "\u718A\u638C\u3067\u6226\u3046\u3002" }] },
    lizardman: { id: "lizardman", emoji: "\u{1F98E}", name: "\u30EA\u30B6\u30FC\u30C9\u30DE\u30F3", element: "water", race: "reptile", role: "balanced", rarity: "N", minFloor: 24, captureRate: 1, maxMp: 17, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 72, atk: 13, def: 10, spd: 11, crit: 8, evasion: 6 }, rankNames: ["\u30EA\u30B6\u30FC\u30C9\u30DE\u30F3", "\u4E0A\u4F4D\u30EA\u30B6\u30FC\u30C9\u30DE\u30F3", "\u30EA\u30B6\u30FC\u30C9\u30DE\u30F3\u738B", "\u6DF1\u6DF5\u30EA\u30B6\u30FC\u30C9\u30DE\u30F3"], skills: [{ id: "lizardman_skill", name: "\u69CD\u7A81\u304D", unlock: { type: "level", value: 1 }, description: "\u69CD\u7A81\u304D\u3067\u6226\u3046\u3002" }] },
    salamander: { id: "salamander", emoji: "\u{1F98E}", name: "\u30B5\u30E9\u30DE\u30F3\u30C0\u30FC", element: "fire", race: "reptile", role: "burner", rarity: "N", minFloor: 36, captureRate: 1, maxMp: 20, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 68, atk: 15, def: 8, spd: 13, crit: 9, evasion: 7 }, rankNames: ["\u30B5\u30E9\u30DE\u30F3\u30C0\u30FC", "\u4E0A\u4F4D\u30B5\u30E9\u30DE\u30F3\u30C0\u30FC", "\u30B5\u30E9\u30DE\u30F3\u30C0\u30FC\u738B", "\u6DF1\u6DF5\u30B5\u30E9\u30DE\u30F3\u30C0\u30FC"], skills: [{ id: "salamander_skill", name: "\u706B\u708E\u5C3E", unlock: { type: "level", value: 1 }, description: "\u706B\u708E\u5C3E\u3067\u6226\u3046\u3002" }] },
    harpy: { id: "harpy", emoji: "\u{1FABD}", name: "\u30CF\u30FC\u30D4\u30FC", element: "wind", race: "flying", role: "speed", rarity: "N", minFloor: 31, captureRate: 1, maxMp: 18, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 52, atk: 13, def: 5, spd: 23, crit: 13, evasion: 14 }, rankNames: ["\u30CF\u30FC\u30D4\u30FC", "\u4E0A\u4F4D\u30CF\u30FC\u30D4\u30FC", "\u30CF\u30FC\u30D4\u30FC\u738B", "\u6DF1\u6DF5\u30CF\u30FC\u30D4\u30FC"], skills: [{ id: "harpy_skill", name: "\u98A8\u5203", unlock: { type: "level", value: 1 }, description: "\u98A8\u5203\u3067\u6226\u3046\u3002" }] },
    gargoyle: { id: "gargoyle", emoji: "\u{1F5FF}", name: "\u30AC\u30FC\u30B4\u30A4\u30EB", element: "dark", race: "construct", role: "tank", rarity: "N", minFloor: 40, captureRate: 1, maxMp: 15, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 86, atk: 14, def: 15, spd: 7, crit: 6, evasion: 3 }, rankNames: ["\u30AC\u30FC\u30B4\u30A4\u30EB", "\u4E0A\u4F4D\u30AC\u30FC\u30B4\u30A4\u30EB", "\u30AC\u30FC\u30B4\u30A4\u30EB\u738B", "\u6DF1\u6DF5\u30AC\u30FC\u30B4\u30A4\u30EB"], skills: [{ id: "gargoyle_skill", name: "\u77F3\u7FFC\u6483", unlock: { type: "level", value: 1 }, description: "\u77F3\u7FFC\u6483\u3067\u6226\u3046\u3002" }] },
    wyvern: { id: "wyvern", emoji: "\u{1F432}", name: "\u30EF\u30A4\u30D0\u30FC\u30F3", element: "wind", race: "dragon", role: "bruiser", rarity: "SR", minFloor: 45, captureRate: 1, maxMp: 20, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 92, atk: 19, def: 9, spd: 12, crit: 10, evasion: 6 }, rankNames: ["\u30EF\u30A4\u30D0\u30FC\u30F3", "\u4E0A\u4F4D\u30EF\u30A4\u30D0\u30FC\u30F3", "\u30EF\u30A4\u30D0\u30FC\u30F3\u738B", "\u6DF1\u6DF5\u30EF\u30A4\u30D0\u30FC\u30F3"], skills: [{ id: "wyvern_skill", name: "\u6ED1\u7A7A\u7A81\u6483", unlock: { type: "level", value: 1 }, description: "\u6ED1\u7A7A\u7A81\u6483\u3067\u6226\u3046\u3002" }] },
    dragon: { id: "dragon", emoji: "\u{1F409}", name: "\u30C9\u30E9\u30B4\u30F3", element: "fire", race: "dragon", role: "burst", rarity: "SSR", minFloor: 70, captureRate: 0.35, maxMp: 18, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 124, atk: 24, def: 10, spd: 5, crit: 8, evasion: 2 }, rankNames: ["\u30C9\u30E9\u30B4\u30F3", "\u4E0A\u4F4D\u30C9\u30E9\u30B4\u30F3", "\u30C9\u30E9\u30B4\u30F3\u738B", "\u6DF1\u6DF5\u30C9\u30E9\u30B4\u30F3"], skills: [{ id: "dragon_skill", name: "\u7ADC\u708E\u30D6\u30EC\u30B9", unlock: { type: "level", value: 1 }, description: "\u7ADC\u708E\u30D6\u30EC\u30B9\u3067\u6226\u3046\u3002" }] },
    frost_dragon: { id: "frost_dragon", emoji: "\u{1F409}", name: "\u6C37\u7ADC", element: "water", race: "dragon", role: "controller", rarity: "SSR", minFloor: 110, captureRate: 0.3, maxMp: 20, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 132, atk: 22, def: 13, spd: 4, crit: 7, evasion: 2 }, rankNames: ["\u6C37\u7ADC", "\u4E0A\u4F4D\u6C37\u7ADC", "\u6C37\u7ADC\u738B", "\u6DF1\u6DF5\u6C37\u7ADC"], skills: [{ id: "frost_dragon_skill", name: "\u6C37\u7ADC\u606F", unlock: { type: "level", value: 1 }, description: "\u6C37\u7ADC\u606F\u3067\u6226\u3046\u3002" }] },
    ancient_dragon: { id: "ancient_dragon", emoji: "\u{1F409}", name: "\u53E4\u9F8D", element: "light", race: "dragon", role: "burst", rarity: "LR", minFloor: 180, captureRate: 0.18, maxMp: 24, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 175, atk: 31, def: 17, spd: 3, crit: 10, evasion: 1 }, rankNames: ["\u53E4\u9F8D", "\u4E0A\u4F4D\u53E4\u9F8D", "\u53E4\u9F8D\u738B", "\u6DF1\u6DF5\u53E4\u9F8D"], skills: [{ id: "ancient_dragon_skill", name: "\u53E4\u9F8D\u7832", unlock: { type: "level", value: 1 }, description: "\u53E4\u9F8D\u7832\u3067\u6226\u3046\u3002" }] },
    mimic: { id: "mimic", emoji: "\u{1F9F0}", name: "\u30DF\u30DF\u30C3\u30AF", element: "dark", race: "construct", role: "ambush", rarity: "SR", minFloor: 28, captureRate: 1, maxMp: 16, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 74, atk: 17, def: 12, spd: 8, crit: 15, evasion: 4 }, rankNames: ["\u30DF\u30DF\u30C3\u30AF", "\u4E0A\u4F4D\u30DF\u30DF\u30C3\u30AF", "\u30DF\u30DF\u30C3\u30AF\u738B", "\u6DF1\u6DF5\u30DF\u30DF\u30C3\u30AF"], skills: [{ id: "mimic_skill", name: "\u5947\u8972\u565B\u307F", unlock: { type: "level", value: 1 }, description: "\u5947\u8972\u565B\u307F\u3067\u6226\u3046\u3002" }] },
    dark_knight: { id: "dark_knight", emoji: "\u265E", name: "\u9ED2\u9A0E\u58EB", element: "dark", race: "undead", role: "tank", rarity: "SSR", minFloor: 75, captureRate: 1, maxMp: 22, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 112, atk: 20, def: 18, spd: 8, crit: 10, evasion: 4 }, rankNames: ["\u9ED2\u9A0E\u58EB", "\u4E0A\u4F4D\u9ED2\u9A0E\u58EB", "\u9ED2\u9A0E\u58EB\u738B", "\u6DF1\u6DF5\u9ED2\u9A0E\u58EB"], skills: [{ id: "dark_knight_skill", name: "\u6F06\u9ED2\u5263", unlock: { type: "level", value: 1 }, description: "\u6F06\u9ED2\u5263\u3067\u6226\u3046\u3002" }] },
    angelic_orb: { id: "angelic_orb", emoji: "\u{1F506}", name: "\u5149\u7403\u7CBE", element: "light", race: "spirit", role: "support", rarity: "SR", minFloor: 55, captureRate: 1, maxMp: 30, growth: { hp: 1, atk: 1, def: 1, spd: 1 }, baseStats: { hp: 55, atk: 13, def: 7, spd: 21, crit: 8, evasion: 16 }, rankNames: ["\u5149\u7403\u7CBE", "\u4E0A\u4F4D\u5149\u7403\u7CBE", "\u5149\u7403\u7CBE\u738B", "\u6DF1\u6DF5\u5149\u7403\u7CBE"], skills: [{ id: "angelic_orb_skill", name: "\u5149\u8F2A", unlock: { type: "level", value: 1 }, description: "\u5149\u8F2A\u3067\u6226\u3046\u3002" }] }
  };

  // src/data/personalities.js
  var PERSONALITIES = {
    brave: { name: "\u52C7\u6562", modifiers: { atk: 1.08, def: 0.95 }, description: "ATK+8% / DEF-5%" },
    cautious: { name: "\u614E\u91CD", modifiers: { def: 1.08, crit: 0.95 }, description: "DEF+8% / \u4F1A\u5FC3-5%" },
    swift: { name: "\u4FCA\u8DB3", modifiers: { spd: 1.1, hp: 0.96 }, description: "SPD+10% / HP-4%" },
    bold: { name: "\u8C6A\u80C6", modifiers: { hp: 1.1, evasion: 0.95 }, description: "HP+10% / \u56DE\u907F-5%" },
    cheerful: { name: "\u967D\u6C17", modifiers: { spd: 1.06, crit: 1.04 }, description: "SPD+6% / \u4F1A\u5FC3+4%" },
    stubborn: { name: "\u9811\u56FA", modifiers: { def: 1.1, spd: 0.94 }, description: "DEF+10% / SPD-6%" },
    calm: { name: "\u51B7\u9759", modifiers: { crit: 1.08, atk: 0.96 }, description: "\u4F1A\u5FC3+8% / ATK-4%" },
    skillful: { name: "\u5668\u7528", modifiers: { crit: 1.05, evasion: 1.05 }, description: "\u4F1A\u5FC3+5% / \u56DE\u907F+5%" },
    lucky: { name: "\u5E78\u904B", modifiers: { crit: 1.04, evasion: 1.04 }, description: "\u4F1A\u5FC3+4% / \u56DE\u907F+4%" },
    timid: { name: "\u81C6\u75C5", modifiers: { evasion: 1.1, def: 0.94 }, description: "\u56DE\u907F+10% / DEF-6%" }
  };

  // src/data/colors.js
  var MONSTER_COLORS = [
    { id: "violet", name: "\u7D2B", value: "#9b63e6" },
    { id: "green", name: "\u7DD1", value: "#68d27b" },
    { id: "blue", name: "\u9752", value: "#6bb5ef" },
    { id: "orange", name: "\u6A59", value: "#e99953" },
    { id: "red", name: "\u8D64", value: "#df6262" },
    { id: "pink", name: "\u6843", value: "#e879b4" },
    { id: "gold", name: "\u91D1", value: "#d9b55c" },
    { id: "cyan", name: "\u6C34", value: "#72d5d8" }
  ];

  // src/data/attributes.js
  var ATTRIBUTES = {
    neutral: { name: "\u7121", icon: "\u26AA" },
    fire: { name: "\u706B", icon: "\u{1F525}" },
    water: { name: "\u6C34", icon: "\u{1F4A7}" },
    lightning: { name: "\u96F7", icon: "\u26A1" },
    earth: { name: "\u571F", icon: "\u{1FAA8}" },
    wind: { name: "\u98A8", icon: "\u{1F32A}\uFE0F" },
    light: { name: "\u5149", icon: "\u2728" },
    dark: { name: "\u95C7", icon: "\u{1F311}" },
    poison: { name: "\u6BD2", icon: "\u2620\uFE0F" },
    nature: { name: "\u81EA\u7136", icon: "\u{1F33F}" }
  };
  var DEFAULT_RESISTANCES = Object.freeze(Object.fromEntries(Object.keys(ATTRIBUTES).map((id) => [id, 1])));
  function normalizedResistances(value = {}) {
    return { ...DEFAULT_RESISTANCES, ...value };
  }

  // src/data/equipmentSeries.js
  var EQUIPMENT_SERIES = {
    flame: { name: "\u708E\u5E1D", bonuses: { 2: { atk: 0.1 }, 4: { fireDamage: 0.18 }, 6: { fireDamage: 0.3, fireRes: 0.25 } } },
    guardian: { name: "\u5B88\u8B77\u8005", bonuses: { 2: { def: 0.15 }, 4: { hp: 0.18 }, 6: { def: 0.25, hp: 0.25 } } },
    traveler: { name: "\u65C5\u4EBA", bonuses: { 2: { spd: 0.1 }, 4: { evasion: 8 }, 6: { spd: 0.2, evasion: 15 } } },
    capturer: { name: "\u6355\u7372\u5E2B", bonuses: { 2: { capture: 0.12 }, 4: { capture: 0.2 }, 6: { capture: 0.35 } } }
  };
  function activeSeriesBonuses(counts = {}) {
    const active = [];
    for (const [id, count] of Object.entries(counts)) {
      const series = EQUIPMENT_SERIES[id];
      if (!series) continue;
      for (const [pieces, effect] of Object.entries(series.bonuses)) if (count >= Number(pieces)) active.push({ seriesId: id, pieces: Number(pieces), effect });
    }
    return active;
  }

  // src/models/Monster.js
  function uid() {
    return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  function randomKey(object) {
    const keys = Object.keys(object);
    return keys[Math.floor(Math.random() * keys.length)];
  }
  function randomIV() {
    return Math.floor(70 + Math.random() * 31);
  }
  var TRAITS = {
    sturdy: { name: "\u9811\u4E08", description: "HP+8%", mods: { hp: 1.08 } },
    fierce: { name: "\u731B\u653B", description: "ATK+9% / DEF-4%", mods: { atk: 1.09, def: 0.96 } },
    swift: { name: "\u4FCA\u654F", description: "SPD+10%", mods: { spd: 1.1 } },
    guarded: { name: "\u5B88\u8B77", description: "DEF+9%", mods: { def: 1.09 } },
    arcane: { name: "\u9B54\u529B\u4F53", description: "MP+12%", mods: {} },
    lucky: { name: "\u5E78\u904B", description: "\u4F1A\u5FC3\u7387+5%", mods: { crit: 5 } },
    steady: { name: "\u5B89\u5B9A", description: "\u80FD\u529B\u306E\u504F\u308A\u304C\u5C11\u306A\u3044", mods: {} }
  };
  var RACE_EXP_RATE = {
    slime: 0.68,
    beast: 0.82,
    flying: 0.8,
    insect: 0.78,
    goblin: 0.9,
    plant: 0.88,
    undead: 1,
    demon: 1.22,
    elemental: 1.18,
    golem: 1.35,
    dragon: 1.95
  };
  var RACE_GROWTH_RATE = {
    slime: { hp: 0.82, atk: 0.72, def: 0.82, spd: 0.92 },
    beast: { hp: 0.94, atk: 1.04, def: 0.88, spd: 1.12 },
    flying: { hp: 0.78, atk: 0.96, def: 0.72, spd: 1.2 },
    insect: { hp: 0.96, atk: 0.94, def: 1.02, spd: 0.92 },
    goblin: { hp: 0.96, atk: 1, def: 0.94, spd: 1.02 },
    plant: { hp: 1.08, atk: 0.84, def: 1.05, spd: 0.72 },
    undead: { hp: 1.1, atk: 0.98, def: 1.05, spd: 0.78 },
    demon: { hp: 1.12, atk: 1.16, def: 1.02, spd: 0.86 },
    elemental: { hp: 0.88, atk: 1.12, def: 0.9, spd: 1.06 },
    golem: { hp: 1.28, atk: 1.04, def: 1.32, spd: 0.55 },
    dragon: { hp: 1.34, atk: 1.32, def: 1.16, spd: 0.64 }
  };
  function expNeedFor(monster) {
    const species = SPECIES[monster.speciesId];
    const rate = species.expRate ?? RACE_EXP_RATE[species.race] ?? 1;
    const base = 40 + monster.level * 25 + Math.floor(monster.level * monster.level * 0.55);
    return Math.max(25, Math.floor(base * rate));
  }
  function randomTrait() {
    const keys = Object.keys(TRAITS);
    return keys[Math.floor(Math.random() * keys.length)];
  }
  function createMonster(speciesId, options = {}) {
    const species = SPECIES[speciesId];
    if (!species) throw new Error(`Unknown species: ${speciesId}`);
    const personalityId = options.personalityId ?? randomKey(PERSONALITIES);
    const colorId = options.colorId ?? MONSTER_COLORS[Math.floor(Math.random() * MONSTER_COLORS.length)].id;
    const level = options.level ?? 1;
    return {
      id: uid(),
      speciesId,
      nickname: options.nickname ?? species.name,
      colorId,
      personalityId,
      traitId: options.traitId ?? randomTrait(),
      ivs: options.ivs ?? { hp: randomIV(), atk: randomIV(), def: randomIV(), spd: randomIV() },
      level,
      exp: options.exp ?? 0,
      stars: options.stars ?? 1,
      rank: options.rank ?? 1,
      plus: options.plus ?? 0,
      bond: options.bond ?? 0,
      title: options.title ?? null,
      favorite: options.favorite ?? false,
      locked: options.locked ?? false,
      attribute: options.attribute ?? species.element ?? "neutral",
      resistances: normalizedResistances(options.resistances ?? species.resistances),
      tags: options.tags ?? [species.race, species.role],
      isBoss: options.isBoss ?? false,
      sealedPower: options.sealedPower ?? null,
      equipment: { weaponRight: null, weaponLeft: null, armorBody: null, armorSupport: null, accessoryNeck: null, accessoryFinger: null, ...options.equipment ?? {} },
      capturedAt: options.capturedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
      battles: options.battles ?? 0,
      defeats: options.defeats ?? 0,
      currentHp: options.currentHp ?? null,
      currentMp: options.currentMp ?? null
    };
  }
  function displayName(monster) {
    const species = SPECIES[monster.speciesId];
    return monster.nickname || species.name;
  }
  function rankName(monster) {
    const species = SPECIES[monster.speciesId];
    return species.rankNames[Math.min(monster.rank - 1, species.rankNames.length - 1)];
  }
  function colorValue(monster) {
    return MONSTER_COLORS.find((c) => c.id === monster.colorId)?.value ?? MONSTER_COLORS[0].value;
  }
  function calculatedStats(monster) {
    const species = SPECIES[monster.speciesId];
    const personality = PERSONALITIES[monster.personalityId];
    const rankMultiplier = 1 + (monster.rank - 1) * 0.5;
    const starMultiplier = 1 + (monster.stars - 1) * 0.08;
    const growth = species.growth ?? {};
    const raceGrowth = RACE_GROWTH_RATE[species.race] ?? {};
    const levelGrowthFor = (key) => 1 + (monster.level - 1) * 0.055 * (growth[key] ?? 1) * (raceGrowth[key] ?? 1);
    const plusBonus = monster.plus * 0.012;
    const calc = (key) => {
      const base = species.baseStats[key];
      const iv = monster.ivs[key] ?? 75;
      const ivMultiplier = 0.75 + iv / 400;
      const personalityMultiplier = personality.modifiers[key] ?? 1;
      return Math.floor(base * rankMultiplier * starMultiplier * levelGrowthFor(key) * ivMultiplier * personalityMultiplier * (1 + plusBonus));
    };
    const trait = TRAITS[monster.traitId] ?? TRAITS.steady;
    const gear = monster._equipmentStats ?? {};
    const syn = monster._synergy ?? {};
    const result = {
      hp: calc("hp") + (gear.hp ?? 0),
      atk: calc("atk") + (gear.atk ?? 0),
      def: calc("def") + (gear.def ?? 0),
      spd: calc("spd") + (gear.spd ?? 0),
      crit: Math.floor(species.baseStats.crit * (personality.modifiers.crit ?? 1)) + (gear.crit ?? 0),
      evasion: Math.floor(species.baseStats.evasion * (personality.modifiers.evasion ?? 1)) + (gear.evasion ?? 0)
    };
    for (const key of ["hp", "atk", "def", "spd"]) {
      if (trait.mods[key]) result[key] = Math.floor(result[key] * trait.mods[key]);
    }
    if (trait.mods.crit) result.crit += trait.mods.crit;
    if (syn.atk) result.atk = Math.floor(result.atk * (1 + syn.atk));
    if (syn.def) result.def = Math.floor(result.def * (1 + syn.def));
    if (syn.spd) result.spd = Math.floor(result.spd * (1 + syn.spd));
    if (syn.crit) result.crit += syn.crit;
    for (const bonus of activeSeriesBonuses(monster._seriesCounts)) {
      if (bonus.effect.atk) result.atk = Math.floor(result.atk * (1 + bonus.effect.atk));
      if (bonus.effect.def) result.def = Math.floor(result.def * (1 + bonus.effect.def));
      if (bonus.effect.hp) result.hp = Math.floor(result.hp * (1 + bonus.effect.hp));
      if (bonus.effect.spd) result.spd = Math.floor(result.spd * (1 + bonus.effect.spd));
      if (bonus.effect.crit) result.crit += bonus.effect.crit;
      if (bonus.effect.evasion) result.evasion += bonus.effect.evasion;
    }
    return result;
  }
  function unlockedSkills(monster) {
    return SPECIES[monster.speciesId].skills.map((skill) => {
      const unlocked = skill.unlock.type === "level" ? monster.level >= skill.unlock.value : monster.rank >= skill.unlock.value;
      return { ...skill, unlocked };
    });
  }

  // src/data/skills.js
  var SKILLS = {
    slime_skill: { id: "slime_skill", name: "\u4F53\u5F53\u305F\u308A", mp: 4, type: "attack", power: 1.25, description: "\u4F53\u5F53\u305F\u308A\u3002" },
    baby_slime_skill: { id: "baby_slime_skill", name: "\u3077\u308B\u3077\u308B\u5FDC\u63F4", mp: 4, type: "allHeal", heal: 0.12, description: "\u3077\u308B\u3077\u308B\u5FDC\u63F4\u3002" },
    acid_slime_skill: { id: "acid_slime_skill", name: "\u9178\u6DB2", mp: 4, type: "attack", power: 1.15, status: { id: "poison", name: "\u6BD2", chance: 0.55, turns: 3, power: 0.025 }, description: "\u9178\u6DB2\u3002" },
    ember_slime_skill: { id: "ember_slime_skill", name: "\u706B\u7A2E\u5F3E", mp: 4, type: "attack", power: 1.25, status: { id: "burn", name: "\u708E\u4E0A", chance: 0.45, turns: 3, power: 0.035 }, description: "\u706B\u7A2E\u5F3E\u3002" },
    frost_slime_skill: { id: "frost_slime_skill", name: "\u6C37\u3064\u3076\u3066", mp: 4, type: "attack", power: 1.15, description: "\u6C37\u3064\u3076\u3066\u3002" },
    king_slime_skill: { id: "king_slime_skill", name: "\u738B\u306E\u7C98\u819C", mp: 6, type: "selfHeal", heal: 0.4, description: "\u738B\u306E\u7C98\u819C\u3002" },
    cave_rat_skill: { id: "cave_rat_skill", name: "\u304B\u3058\u308A\u3064\u304F", mp: 2, type: "attack", power: 1.15, description: "\u304B\u3058\u308A\u3064\u304F\u3002" },
    fang_rat_skill: { id: "fang_rat_skill", name: "\u6025\u6240\u565B\u307F", mp: 2, type: "attack", power: 1.35, description: "\u6025\u6240\u565B\u307F\u3002" },
    bat_skill: { id: "bat_skill", name: "\u97F3\u6CE2", mp: 3, type: "attack", power: 1.1, description: "\u97F3\u6CE2\u3002" },
    vampire_bat_skill: { id: "vampire_bat_skill", name: "\u5438\u8840", mp: 4, type: "drain", power: 1.05, drain: 0.4, description: "\u5438\u8840\u3002" },
    caterpillar_skill: { id: "caterpillar_skill", name: "\u7C98\u7740\u7CF8", mp: 3, type: "attack", power: 1, description: "\u7C98\u7740\u7CF8\u3002" },
    centipede_skill: { id: "centipede_skill", name: "\u6BD2\u7259", mp: 3, type: "attack", power: 1.2, status: { id: "poison", name: "\u6BD2", chance: 0.65, turns: 3, power: 0.03 }, description: "\u6BD2\u7259\u3002" },
    beetle_skill: { id: "beetle_skill", name: "\u89D2\u7A81\u9032", mp: 3, type: "attack", power: 1.35, description: "\u89D2\u7A81\u9032\u3002" },
    mantis_skill: { id: "mantis_skill", name: "\u938C\u9023\u6483", mp: 3, type: "multiAttack", power: 0.72, hits: 2, description: "\u938C\u9023\u6483\u3002" },
    skeleton_skill: { id: "skeleton_skill", name: "\u9AA8\u65AC\u308A", mp: 3, type: "attack", power: 1.2, description: "\u9AA8\u65AC\u308A\u3002" },
    skeleton_archer_skill: { id: "skeleton_archer_skill", name: "\u9AA8\u77E2", mp: 3, type: "attack", power: 1.35, description: "\u9AA8\u77E2\u3002" },
    skeleton_guard_skill: { id: "skeleton_guard_skill", name: "\u76FE\u6BB4\u308A", mp: 3, type: "attack", power: 1.1, description: "\u76FE\u6BB4\u308A\u3002" },
    zombie_skill: { id: "zombie_skill", name: "\u8150\u722A", mp: 2, type: "attack", power: 1.25, status: { id: "poison", name: "\u8150\u6557", chance: 0.35, turns: 3, power: 0.025 }, description: "\u8150\u722A\u3002" },
    ghost_skill: { id: "ghost_skill", name: "\u970A\u5F3E", mp: 5, type: "attack", power: 1.45, description: "\u970A\u5F3E\u3002" },
    wraith_skill: { id: "wraith_skill", name: "\u9B42\u55B0\u3044", mp: 6, type: "drain", power: 1.25, drain: 0.4, description: "\u9B42\u55B0\u3044\u3002" },
    goblin_skill: { id: "goblin_skill", name: "\u4E8C\u6BB5\u65AC\u308A", mp: 3, type: "multiAttack", power: 0.72, hits: 2, description: "\u4E8C\u6BB5\u65AC\u308A\u3002" },
    goblin_guard_skill: { id: "goblin_guard_skill", name: "\u9632\u885B\u7A81\u304D", mp: 3, type: "attack", power: 1.25, description: "\u9632\u885B\u7A81\u304D\u3002" },
    goblin_shaman_skill: { id: "goblin_shaman_skill", name: "\u546A\u5F3E", mp: 5, type: "attack", power: 1.5, description: "\u546A\u5F3E\u3002" },
    orc_skill: { id: "orc_skill", name: "\u8C6A\u8155", mp: 3, type: "attack", power: 1.5, description: "\u8C6A\u8155\u3002" },
    ogre_skill: { id: "ogre_skill", name: "\u5927\u5730\u7815\u304D", mp: 3, type: "attack", power: 1.7, description: "\u5927\u5730\u7815\u304D\u3002" },
    mushroom_skill: { id: "mushroom_skill", name: "\u6BD2\u80DE\u5B50", mp: 4, type: "attack", power: 1.3, status: { id: "poison", name: "\u6BD2", chance: 0.7, turns: 3, power: 0.03 }, description: "\u6BD2\u80DE\u5B50\u3002" },
    healing_mushroom_skill: { id: "healing_mushroom_skill", name: "\u80DE\u5B50\u6CBB\u7652", mp: 5, type: "allHeal", heal: 0.2, description: "\u80DE\u5B50\u6CBB\u7652\u3002" },
    thorn_bud_skill: { id: "thorn_bud_skill", name: "\u68D8\u98DB\u3070\u3057", mp: 4, type: "attack", power: 1.3, description: "\u68D8\u98DB\u3070\u3057\u3002" },
    mandrake_skill: { id: "mandrake_skill", name: "\u7D76\u53EB", mp: 6, type: "attack", power: 1.25, description: "\u7D76\u53EB\u3002" },
    fairy_skill: { id: "fairy_skill", name: "\u7652\u3084\u3057\u306E\u98A8", mp: 5, type: "allHeal", heal: 0.25, description: "\u7652\u3084\u3057\u306E\u98A8\u3002" },
    willowisp_skill: { id: "willowisp_skill", name: "\u706B\u306E\u7389", mp: 5, type: "attack", power: 1.45, status: { id: "burn", name: "\u708E\u4E0A", chance: 0.45, turns: 3, power: 0.04 }, description: "\u706B\u306E\u7389\u3002" },
    water_spirit_skill: { id: "water_spirit_skill", name: "\u6E05\u6D41", mp: 6, type: "allHeal", heal: 0.18, description: "\u6E05\u6D41\u3002" },
    stone_golem_skill: { id: "stone_golem_skill", name: "\u5CA9\u77F3\u62F3", mp: 2, type: "attack", power: 1.35, description: "\u5CA9\u77F3\u62F3\u3002" },
    clockwork_skill: { id: "clockwork_skill", name: "\u96FB\u78C1\u6253\u6483", mp: 4, type: "attack", power: 1.4, description: "\u96FB\u78C1\u6253\u6483\u3002" },
    wolf_skill: { id: "wolf_skill", name: "\u75BE\u98A8\u7259", mp: 3, type: "attack", power: 1.35, description: "\u75BE\u98A8\u7259\u3002" },
    dire_wolf_skill: { id: "dire_wolf_skill", name: "\u6708\u5F71\u7259", mp: 4, type: "attack", power: 1.6, description: "\u6708\u5F71\u7259\u3002" },
    bear_skill: { id: "bear_skill", name: "\u718A\u638C", mp: 3, type: "attack", power: 1.45, description: "\u718A\u638C\u3002" },
    lizardman_skill: { id: "lizardman_skill", name: "\u69CD\u7A81\u304D", mp: 4, type: "attack", power: 1.4, description: "\u69CD\u7A81\u304D\u3002" },
    salamander_skill: { id: "salamander_skill", name: "\u706B\u708E\u5C3E", mp: 4, type: "attack", power: 1.5, status: { id: "burn", name: "\u708E\u4E0A", chance: 0.55, turns: 3, power: 0.045 }, description: "\u706B\u708E\u5C3E\u3002" },
    harpy_skill: { id: "harpy_skill", name: "\u98A8\u5203", mp: 4, type: "attack", power: 1.35, description: "\u98A8\u5203\u3002" },
    gargoyle_skill: { id: "gargoyle_skill", name: "\u77F3\u7FFC\u6483", mp: 3, type: "attack", power: 1.45, description: "\u77F3\u7FFC\u6483\u3002" },
    wyvern_skill: { id: "wyvern_skill", name: "\u6ED1\u7A7A\u7A81\u6483", mp: 4, type: "attack", power: 1.65, description: "\u6ED1\u7A7A\u7A81\u6483\u3002" },
    dragon_skill: { id: "dragon_skill", name: "\u7ADC\u708E\u30D6\u30EC\u30B9", mp: 4, type: "attack", power: 1.85, status: { id: "burn", name: "\u708E\u4E0A", chance: 0.6, turns: 3, power: 0.05 }, description: "\u7ADC\u708E\u30D6\u30EC\u30B9\u3002" },
    frost_dragon_skill: { id: "frost_dragon_skill", name: "\u6C37\u7ADC\u606F", mp: 4, type: "attack", power: 1.75, description: "\u6C37\u7ADC\u606F\u3002" },
    ancient_dragon_skill: { id: "ancient_dragon_skill", name: "\u53E4\u9F8D\u7832", mp: 5, type: "attack", power: 2.35, description: "\u53E4\u9F8D\u7832\u3002" },
    mimic_skill: { id: "mimic_skill", name: "\u5947\u8972\u565B\u307F", mp: 4, type: "attack", power: 1.7, description: "\u5947\u8972\u565B\u307F\u3002" },
    dark_knight_skill: { id: "dark_knight_skill", name: "\u6F06\u9ED2\u5263", mp: 5, type: "attack", power: 1.8, description: "\u6F06\u9ED2\u5263\u3002" },
    angelic_orb_skill: { id: "angelic_orb_skill", name: "\u5149\u8F2A", mp: 7, type: "attack", power: 1.55, description: "\u5149\u8F2A\u3002" }
  };

  // src/battle/SkillSystem.js
  function maxMp(monster) {
    const species = SPECIES[monster.speciesId];
    const base = species?.maxMp ?? 15;
    return Math.floor(base + (monster.level - 1) * 0.65 + (monster.rank - 1) * 5 + (monster.stars - 1));
  }
  function learnedSkills(monster) {
    return SPECIES[monster.speciesId].skills.filter((entry) => entry.unlock.type === "level" ? monster.level >= entry.unlock.value : monster.rank >= entry.unlock.value).map((entry) => ({ ...entry, ...SKILLS[entry.id] })).filter((skill) => skill.id && skill.type);
  }
  function skillById(id) {
    return SKILLS[id] ?? null;
  }
  function canUseSkill(monster, skill, cooldown = 0) {
    return Boolean(skill) && monster.currentMp >= skill.mp && cooldown <= 0;
  }
  function skillDamage(stats, enemy, skill, critical = false) {
    const base = Math.max(1, Math.floor(stats.atk * skill.power - enemy.def * 0.3));
    return critical ? Math.floor(base * 1.65) : base;
  }

  // src/services/SaveService.js?v=0.8.0-alpha.2.1
  function initialState() {
    const monsters = [
      createMonster("slime", { nickname: "\u3077\u308B\u3093", colorId: "green", personalityId: "bold" })
    ];
    return { schemaVersion: 11, appVersion: APP_VERSION, flags: { abyssUnlocked: false, trueLevelCapRevealed: false, deepAbyssUnlocked: false }, player: { gold: 1e3, crystals: 20, maxFloor: 1, currentFloor: 1, checkpoint: 1, inRun: false, nextShopFloor: 4, floorSeeds: {}, openedChests: {}, bossRewards: {}, bossKills: {} }, monsters, party: monsters.map((m) => m.id), equipment: [], reserveEquipment: [], bossEquipmentVault: [], inventory: { potions: 3, partyPotions: 1, statusCures: 1, partyStatusCures: 0, fullHeals: 0, partyFullHeals: 0, captureCrystals: 5, abyssKeys: 0 }, settings: { minimapVisible: true, shopDiscountSeed: null, autoBattle: true, equipmentSort: "rarity", battleSpeed: 1, mapTogglePosition: null, tutorialSeen: {} }, gacha: { firstTenUsed: false, lastDailyKey: null }, rest: { lastFreeKey: null }, records: { kills: 0, captures: 0, chests: 0, purchases: 0 } };
  }
  var SaveService = class {
    constructor() {
      this.state = this.load();
      this.save();
    }
    load() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        return raw ? this.migrate(JSON.parse(raw)) : initialState();
      } catch (e) {
        console.error(e);
        return initialState();
      }
    }
    migrate(s) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L;
      const from = Number(s.schemaVersion ?? 1);
      s.flags ?? (s.flags = {});
      (_a = s.flags).abyssUnlocked ?? (_a.abyssUnlocked = false);
      (_b = s.flags).trueLevelCapRevealed ?? (_b.trueLevelCapRevealed = false);
      (_c = s.flags).deepAbyssUnlocked ?? (_c.deepAbyssUnlocked = false);
      s.player ?? (s.player = {});
      (_d = s.player).gold ?? (_d.gold = 1e3);
      (_e = s.player).crystals ?? (_e.crystals = 20);
      (_f = s.player).maxFloor ?? (_f.maxFloor = 1);
      (_g = s.player).currentFloor ?? (_g.currentFloor = 1);
      (_h = s.player).checkpoint ?? (_h.checkpoint = 1);
      (_i = s.player).inRun ?? (_i.inRun = false);
      (_j = s.player).nextShopFloor ?? (_j.nextShopFloor = 4);
      (_k = s.player).floorSeeds ?? (_k.floorSeeds = {});
      (_l = s.player).openedChests ?? (_l.openedChests = {});
      (_m = s.player).bossRewards ?? (_m.bossRewards = {});
      (_n = s.player).bossKills ?? (_n.bossKills = {});
      s.monsters ?? (s.monsters = []);
      s.party ?? (s.party = []);
      s.equipment ?? (s.equipment = []);
      s.reserveEquipment ?? (s.reserveEquipment = []);
      s.bossEquipmentVault ?? (s.bossEquipmentVault = []);
      s.inventory ?? (s.inventory = { potions: 0, captureCrystals: 0 });
      (_o = s.inventory).potions ?? (_o.potions = 0);
      (_p = s.inventory).partyPotions ?? (_p.partyPotions = 0);
      (_q = s.inventory).statusCures ?? (_q.statusCures = 0);
      (_r = s.inventory).partyStatusCures ?? (_r.partyStatusCures = 0);
      (_s = s.inventory).fullHeals ?? (_s.fullHeals = 0);
      (_t = s.inventory).partyFullHeals ?? (_t.partyFullHeals = 0);
      (_u = s.inventory).captureCrystals ?? (_u.captureCrystals = 0);
      (_v = s.inventory).abyssKeys ?? (_v.abyssKeys = 0);
      s.settings ?? (s.settings = {});
      (_w = s.settings).minimapVisible ?? (_w.minimapVisible = true);
      (_x = s.settings).shopDiscountSeed ?? (_x.shopDiscountSeed = null);
      (_y = s.settings).autoBattle ?? (_y.autoBattle = true);
      (_z = s.settings).equipmentSort ?? (_z.equipmentSort = "rarity");
      (_A = s.settings).equipmentSlot ?? (_A.equipmentSlot = "weapon");
      (_B = s.settings).equipmentStorage ?? (_B.equipmentStorage = "inventory");
      (_C = s.settings).battleSpeed ?? (_C.battleSpeed = 1);
      (_D = s.settings).mapTogglePosition ?? (_D.mapTogglePosition = null);
      (_E = s.settings).tutorialSeen ?? (_E.tutorialSeen = {});
      s.gacha ?? (s.gacha = {});
      (_F = s.gacha).firstTenUsed ?? (_F.firstTenUsed = false);
      (_G = s.gacha).lastDailyKey ?? (_G.lastDailyKey = null);
      s.rest ?? (s.rest = {});
      (_H = s.rest).lastFreeKey ?? (_H.lastFreeKey = null);
      s.records ?? (s.records = { kills: 0, captures: 0, chests: 0, purchases: 0 });
      (_I = s.records).kills ?? (_I.kills = 0);
      (_J = s.records).captures ?? (_J.captures = 0);
      (_K = s.records).chests ?? (_K.chests = 0);
      (_L = s.records).purchases ?? (_L.purchases = 0);
      s.monsters.forEach((m) => {
        m.traitId ?? (m.traitId = "steady");
        m.currentMp ?? (m.currentMp = maxMp(m));
        m.currentMp = Math.min(m.currentMp, maxMp(m));
        const oldGear = m.equipment ?? {};
        m.equipment = { weaponRight: oldGear.weaponRight ?? oldGear.weapon ?? null, weaponLeft: oldGear.weaponLeft ?? null, armorBody: oldGear.armorBody ?? oldGear.armor ?? null, armorSupport: oldGear.armorSupport ?? null, accessoryNeck: oldGear.accessoryNeck ?? oldGear.accessory ?? null, accessoryFinger: oldGear.accessoryFinger ?? null };
        m.attribute ?? (m.attribute = null);
        m.resistances ?? (m.resistances = {});
        m.tags ?? (m.tags = []);
        m.isBoss ?? (m.isBoss = false);
        m.sealedPower ?? (m.sealedPower = null);
      });
      for (const list of [s.equipment, s.reserveEquipment, s.bossEquipmentVault]) list.forEach((i) => {
        i.favorite ?? (i.favorite = false);
        i.locked ?? (i.locked = false);
        i.equippedBy ?? (i.equippedBy = null);
        i.plus ?? (i.plus = 0);
        i.level ?? (i.level = 1);
        i.createdAt ?? (i.createdAt = (/* @__PURE__ */ new Date(0)).toISOString());
        i.series ?? (i.series = null);
        i.handedness ?? (i.handedness = i.slot === "weapon" ? "either" : null);
        i.ruleOverrides ?? (i.ruleOverrides = {});
      });
      const mainIds = new Set(s.equipment.map((i) => i.id));
      s.monsters.forEach((m) => Object.values(m.equipment).forEach((id) => {
        if (!id) return;
        const stored = [...s.reserveEquipment, ...s.bossEquipmentVault].find((i) => i.id === id);
        if (stored && !mainIds.has(id)) {
          s.reserveEquipment = s.reserveEquipment.filter((i) => i.id !== id);
          s.bossEquipmentVault = s.bossEquipmentVault.filter((i) => i.id !== id);
          s.equipment.push(stored);
          mainIds.add(id);
        }
      }));
      s.schemaVersion = 11;
      s.appVersion = APP_VERSION;
      if (from < 11) s.lastMigration = { from, to: 11, at: (/* @__PURE__ */ new Date()).toISOString() };
      return s;
    }
    save() {
      this.state.appVersion = APP_VERSION;
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    }
    reset() {
      localStorage.removeItem(SAVE_KEY);
      this.state = initialState();
      this.save();
    }
  };

  // src/ui/components/MonsterCard.js
  function MonsterCard(monster, inParty = false) {
    const stats = calculatedStats(monster);
    const personality = PERSONALITIES[monster.personalityId];
    return `
    <article class="monster-card">
      <div class="monster-orb" style="background:${colorValue(monster)}"></div>
      <div>
        <div class="monster-name">${inParty ? "\u{1F7E2} \u51FA\u6483 " : ""}${monster.favorite ? "\u2605 " : ""}${displayName(monster)}</div>
        <div class="subline">${rankName(monster)} / Lv.${monster.level} +${monster.plus}</div>
        <div class="stars">${"\u2605".repeat(monster.stars)}${"\u2606".repeat(Math.max(0, 5 - monster.stars))}</div>
        <div class="subline">
          <span class="badge">${personality.name}</span>
          HP ${stats.hp} / ATK ${stats.atk} / DEF ${stats.def} / SPD ${stats.spd}
        </div>
      </div>
      <button data-monster-id="${monster.id}">\u8A73\u7D30</button>
    </article>
  `;
  }

  // src/ui/screens/HomeScreen.js
  function HomeScreen(state) {
    const party = state.party.map((id) => state.monsters.find((m) => m.id === id)).filter(Boolean);
    return `
    <section class="screen">
      <div class="page">
        <div class="eyebrow">ABYSS DOMINION / PRODUCTION EDITION</div>
        <h1 class="hero-title">\u5730\u4E0B1000\u968E\u306E\u9B54\u738B</h1>
        <p class="muted">\u6700\u5F37\u306E\u30E2\u30F3\u30B9\u30BF\u30FC\u8ECD\u56E3\u3092\u3001\u4F55\u767E\u6642\u9593\u3082\u80B2\u3066\u7D9A\u3051\u308B\u3002</p>

        <div class="panel">
          <div class="spread">
            <div>
              <div class="gold">REMAKE v${APP_VERSION}</div>
              <h2>\u30E2\u30F3\u30B9\u30BF\u30FC\u57FA\u76E4</h2>
            </div>
            <div class="muted">\u6700\u9AD8 ${state.player.maxFloor}\u968E</div>
          </div>
          <div class="subline" style="margin-top:10px">
            GOLD ${state.player.gold}\u3000\u9B54\u6676\u77F3 ${state.player.crystals}
          </div>
        </div>

        <div class="grid">
          <button id="openMonsters" class="primary">\u30E2\u30F3\u30B9\u30BF\u30FC</button>
          <button id="openExplore" class="primary">\u63A2\u7D22\u3078</button>
          <button id="openEquipment">\u88C5\u5099</button>
          <button id="openSettings">\u8A2D\u5B9A</button>
          <button id="openRest">\u{1F6CF}\uFE0F \u4F11\u606F</button>
          <button id="openGacha" class="summon-button">\u{1F52E} \u6DF1\u6DF5\u53EC\u559A</button>
        </div>

        <div class="panel">
          <div class="spread"><h2>\u73FE\u5728\u306E\u30D1\u30FC\u30C6\u30A3\u30FC</h2><div class="home-party-actions"><span class="muted">${party.length}/4</span><button id="editHomeParty" class="compact-button">\u7DE8\u6210\u3059\u308B</button></div></div>
          <div class="home-vitals">${party.map((m) => {
      const s = calculatedStats(m), hp = m.currentHp ?? s.hp, mp = m.currentMp ?? maxMp(m);
      return `<div><b>${displayName(m)} Lv.${m.level}</b><small>HP ${hp}/${s.hp}\u3000MP ${mp}/${maxMp(m)}</small></div>`;
    }).join("")}</div>
          <div class="monster-list" style="margin-top:12px">
            ${party.map(MonsterCard).join("") || '<div class="empty">\u30D1\u30FC\u30C6\u30A3\u30FC\u306A\u3057</div>'}
          </div>
        </div>

        <p class="footer-note">\u53EC\u559A\u30FB\u4F11\u606F\u30FB\u88C5\u5099\u5F37\u5316\u30FB\u30B7\u30EA\u30FC\u30BA\u52B9\u679C\u30FB\u5C5E\u6027\u5171\u9CF4\u304C\u89E3\u653E\u3055\u308C\u305F\u3002</p>
      </div>
    </section>
  `;
  }

  // src/ui/screens/MonsterListScreen.js
  function MonsterListScreen(state) {
    const sorted = [...state.monsters].sort(
      (a, b) => Number(b.favorite) - Number(a.favorite) || b.level - a.level || b.stars - a.stars
    );
    return `
    <section class="screen">
      <header class="topbar">
        <button id="backHome">\u2190</button>
        <h2>\u624B\u6301\u3061\u30E2\u30F3\u30B9\u30BF\u30FC</h2>
        <span class="muted">${state.monsters.length}/500</span>
      </header>
      <div class="page">
        <div class="panel">
          <input id="monsterSearch" placeholder="\u540D\u524D\u30FB\u7A2E\u65CF\u3067\u691C\u7D22">
        </div>
        <div id="monsterList" class="monster-list">
          ${sorted.map((m) => MonsterCard(m, state.party.includes(m.id))).join("")}
        </div>
      </div>
    </section>
  `;
  }

  // src/ui/screens/MonsterDetailScreen.js
  function MonsterDetailScreen(monster, state) {
    const species = SPECIES[monster.speciesId];
    const personality = PERSONALITIES[monster.personalityId];
    const stats = calculatedStats(monster);
    const skills = unlockedSkills(monster);
    const trait = TRAITS[monster.traitId] ?? TRAITS.steady;
    const need = Math.floor(65 * Math.pow(1.12, monster.level - 1));
    const remaining = Math.max(0, need - monster.exp);
    return `
    <section class="screen">
      <header class="topbar">
        <button id="backMonsters">\u2190</button>
        <h2>\u30E2\u30F3\u30B9\u30BF\u30FC\u8A73\u7D30</h2>
        <button id="toggleFavorite">${monster.favorite ? "\u2605" : "\u2606"}</button>
      </header>

      <div class="page">
        <div class="panel detail-hero">
          <div class="detail-orb" style="background:${colorValue(monster)}"></div>
          <div>
            <div class="eyebrow">${rankName(monster)}</div>
            <h1>${displayName(monster)}</h1>
            <div class="stars">${"\u2605".repeat(monster.stars)}${"\u2606".repeat(Math.max(0, 5 - monster.stars))}</div>
            <div class="subline">Lv.${monster.level} / Rank ${monster.rank} / +${monster.plus}</div><div class="subline">${species.race}\u65CF / ${species.role} / ${species.element}\u5C5E\u6027</div>
          </div>
        </div>

        <div class="panel">
          <h2>\u540D\u524D</h2>
          <div class="edit-row" style="margin-top:10px">
            <input id="nicknameInput" maxlength="12" value="${displayName(monster)}">
            <button id="saveNickname">\u5909\u66F4</button>
          </div>
        </div>

        <div class="panel">
          <h2>\u500B\u4F53\u30AB\u30E9\u30FC</h2>
          <div class="color-row" style="margin-top:10px">
            ${MONSTER_COLORS.map((color) => `
              <button
                class="color-dot ${monster.colorId === color.id ? "selected" : ""}"
                style="background:${color.value}"
                data-color-id="${color.id}"
                aria-label="${color.name}">
              </button>`).join("")}
          </div>
        </div>

        <div class="panel">
          <h2>\u57FA\u672C\u30B9\u30C6\u30FC\u30BF\u30B9</h2>
          <div class="stat-grid" style="margin-top:10px">
            <div class="stat-card"><span>HP</span><b>${stats.hp}</b></div>
            <div class="stat-card"><span>ATK</span><b>${stats.atk}</b></div>
            <div class="stat-card"><span>DEF</span><b>${stats.def}</b></div>
            <div class="stat-card"><span>SPD</span><b>${stats.spd}</b></div>
            <div class="stat-card"><span>\u4F1A\u5FC3\u7387</span><b>${stats.crit}%</b></div>
            <div class="stat-card"><span>\u56DE\u907F\u7387</span><b>${stats.evasion}%</b></div>
          </div>
        </div>

        <div class="panel"><h2>\u7D4C\u9A13\u5024</h2><p><b>${monster.exp.toLocaleString()} / ${need.toLocaleString()}</b><br><small>\u6B21\u306E\u30EC\u30D9\u30EB\u307E\u3067\u3042\u3068 ${remaining.toLocaleString()}</small></p></div>

        <div class="panel"><h2>\u56FA\u6709\u7279\u6027\uFF1A${trait.name}</h2><p class="muted">${trait.description}</p></div>

        <div class="panel">
          <h2>\u6027\u683C\uFF1A${personality.name}</h2>
          <p class="muted" style="margin-top:7px">${personality.description}</p>
        </div>

        <div class="panel">
          <h2>\u500B\u4F53\u5024</h2>
          ${Object.entries(monster.ivs).map(([key, value]) => `
            <div class="iv-row">
              <span>${key.toUpperCase()}</span>
              <div class="iv-bar"><i style="width:${value}%"></i></div>
              <b>${value}</b>
            </div>`).join("")}
        </div>

        <div class="panel">
          <h2>\u88C5\u5099</h2>
          <div class="subline" style="margin-top:10px">
            \u53F3\u624B\uFF1A${state?.equipment?.find((i) => i.id === monster.equipment.weaponRight)?.name ?? "\u672A\u88C5\u5099"}<br>
            \u5DE6\u624B\uFF1A${state?.equipment?.find((i) => i.id === monster.equipment.weaponLeft)?.name ?? "\u672A\u88C5\u5099"}<br>
            \u80F4\uFF1A${state?.equipment?.find((i) => i.id === monster.equipment.armorBody)?.name ?? "\u672A\u88C5\u5099"}<br>
            \u88DC\u52A9\uFF1A${state?.equipment?.find((i) => i.id === monster.equipment.armorSupport)?.name ?? "\u672A\u88C5\u5099"}<br>
            \u9996\uFF1A${state?.equipment?.find((i) => i.id === monster.equipment.accessoryNeck)?.name ?? "\u672A\u88C5\u5099"}<br>
            \u6307\uFF1A${state?.equipment?.find((i) => i.id === monster.equipment.accessoryFinger)?.name ?? "\u672A\u88C5\u5099"}
          </div>
        </div>

        <div class="panel">
          <h2>\u30B9\u30AD\u30EB</h2>
          <div class="skill-list" style="margin-top:10px">
            ${skills.map((skill) => `
              <div class="skill-card ${skill.unlocked ? "" : "locked"}">
                <b>${skill.unlocked ? "\u25CB" : "\u{1F512}"} ${skill.name}</b>
                <small>${skill.description}</small>
                <small>${skill.unlock.type === "level" ? `Lv.${skill.unlock.value}\u3067\u89E3\u7981` : `Rank ${skill.unlock.value}\u3067\u89E3\u7981`}</small>
              </div>`).join("")}
          </div>
        </div>

        <div class="panel danger-zone">
          <h2>\u30E2\u30F3\u30B9\u30BF\u30FC\u6574\u7406</h2>
          <button id="releaseMonster" class="danger">\u3053\u306E\u30E2\u30F3\u30B9\u30BF\u30FC\u3092\u89E3\u653E</button>
          <small class="muted">\u51FA\u6483\u4E2D\u30FB\u304A\u6C17\u306B\u5165\u308A\u30FB\u30ED\u30C3\u30AF\u4E2D\u306F\u89E3\u653E\u3067\u304D\u307E\u305B\u3093\u3002</small>
        </div>
        <div class="panel">
          <h2>\u500B\u4F53\u8A18\u9332</h2>
          <div class="subline" style="margin-top:8px">
            \u6355\u7372\u65E5\uFF1A${new Date(monster.capturedAt).toLocaleDateString("ja-JP")}<br>
            \u6226\u95D8\u53C2\u52A0\uFF1A${monster.battles}\u56DE<br>
            \u6483\u7834\u6570\uFF1A${monster.defeats}\u4F53<br>
            \u7D46\uFF1A${monster.bond}
          </div>
        </div>
      </div>
    </section>
  `;
  }

  // src/ui/screens/SettingsScreen.js
  function SettingsScreen(state) {
    return `
    <section class="screen">
      <header class="topbar">
        <button id="backHome">\u2190</button>
        <h2>\u8A2D\u5B9A</h2>
        <span></span>
      </header>
      <div class="page">
        <div class="panel">
          <div class="spread">
            <span>\u6226\u95D8AUTO\u521D\u671F\u5024</span>
            <button id="toggleAuto">${state.settings.autoBattle ? "ON" : "OFF"}</button>
          </div>
        </div>
        <div class="panel">
          <div class="spread">
            <span>\u30DF\u30CB\u30DE\u30C3\u30D7\u521D\u671F\u8868\u793A</span>
            <button id="toggleMinimap">${state.settings.minimapVisible ? "ON" : "OFF"}</button>
          </div>
        </div>
        <div class="panel"><div class="spread"><span>\u5E8F\u76E4\u30C1\u30E5\u30FC\u30C8\u30EA\u30A2\u30EB</span><button id="resetTutorials">\u518D\u8868\u793A\u3059\u308B</button></div></div>
        <button id="resetSave" class="danger" style="width:100%">\u30BB\u30FC\u30D6\u521D\u671F\u5316</button>
      </div>
    </section>
  `;
  }

  // src/ui/screens/ExploreScreen.js
  function ExploreScreen(state) {
    const p = state.party.map((id) => state.monsters.find((m) => m.id === id)).filter(Boolean);
    return `<section class="screen explore-screen"><header class="explore-hud"><div><small>\u968E</small><b>${state.player.currentFloor}</b></div><div><small>G</small><b id="goldHud">${state.player.gold}</b></div><div><small>\u9B54\u6676\u77F3</small><b>${state.player.crystals}</b></div><div><small>\u6355\u7372</small><b id="captureHud">${state.inventory.captureCrystals}</b></div><div class="version">v${APP_VERSION}</div></header><div class="explore-party-strip">${p.map((m) => {
      const s = calculatedStats(m), hp = Math.max(0, m.currentHp ?? s.hp), mp = Math.max(0, m.currentMp ?? maxMp(m));
      return `<button type="button" data-explore-monster="${m.id}"><b>${displayName(m)}</b><span>Lv.${m.level}</span><i class="hud-bar hp"><em style="width:${Math.min(100, hp / s.hp * 100)}%"></em><small>HP:${hp}/${s.hp}</small></i><i class="hud-bar mp"><em style="width:${Math.min(100, mp / maxMp(m) * 100)}%"></em><small>MP:${mp}/${maxMp(m)}</small></i></button>`;
    }).join("")}</div><div class="explore-stage"><canvas id="gameCanvas"></canvas><canvas id="miniMap"></canvas><button id="miniMapToggle" class="minimap-toggle" style="${state.settings.mapTogglePosition ? `left:${state.settings.mapTogglePosition.x}px;top:${state.settings.mapTogglePosition.y}px;right:auto` : ``}">${state.settings.minimapVisible ? "MAP ON" : "MAP OFF"}</button></div><nav class="explore-nav"><button id="pauseParty">\u7DE8\u6210</button><button id="fieldEquipment">\u88C5\u5099</button><button id="pauseItems">\u6301\u3061\u7269</button><button id="centerCamera">\u73FE\u5728\u5730</button><button id="returnHome" class="danger">\u5E30\u9084</button></nav></section>`;
  }

  // src/battle/BattleRules.js
  function createBattleRulesState(party) {
    return {
      cooldowns: Object.fromEntries(party.map((m) => [m.id, {}])),
      enemyStatuses: {},
      log: ["\u6226\u95D8\u958B\u59CB"],
      lastStatusTurn: 0
    };
  }
  function cooldownRemaining(battle2, monsterId, skillId) {
    return battle2.cooldowns?.[monsterId]?.[skillId] ?? 0;
  }
  function setSkillCooldown(battle2, monsterId, skill) {
    var _a;
    if (!skill?.cooldown) return;
    (_a = battle2.cooldowns)[monsterId] ?? (_a[monsterId] = {});
    battle2.cooldowns[monsterId][skill.id] = skill.cooldown + 1;
  }
  function tickCooldowns(battle2) {
    Object.values(battle2.cooldowns ?? {}).forEach((map) => {
      Object.keys(map).forEach((id) => {
        map[id] = Math.max(0, map[id] - 1);
        if (map[id] === 0) delete map[id];
      });
    });
  }
  function addBattleLog(battle2, text) {
    battle2.log ?? (battle2.log = []);
    battle2.log.unshift(text);
    battle2.log = battle2.log.slice(0, 6);
  }
  function enemyStatusesFor(battle2, enemyId) {
    var _a;
    battle2.enemyStatuses ?? (battle2.enemyStatuses = {});
    if (Array.isArray(battle2.enemyStatuses)) battle2.enemyStatuses = {};
    (_a = battle2.enemyStatuses)[enemyId] ?? (_a[enemyId] = []);
    return battle2.enemyStatuses[enemyId];
  }
  function applyEnemyStatus(battle2, status, enemyId = battle2.targetEnemyId) {
    if (!status || !enemyId) return false;
    const statuses = enemyStatusesFor(battle2, enemyId), existing = statuses.find((s) => s.id === status.id);
    if (existing) {
      existing.turns = Math.max(existing.turns, status.turns);
      existing.power = Math.max(existing.power, status.power);
    } else statuses.push({ ...status });
    return true;
  }
  function processEnemyStatuses(battle2) {
    const results = [];
    (battle2.enemies ?? [battle2.enemy]).filter(Boolean).forEach((enemy) => {
      const statuses = enemyStatusesFor(battle2, enemy.id);
      battle2.enemyStatuses[enemy.id] = statuses.filter((status) => {
        let damage = 0;
        if (status.id === "poison" || status.id === "burn") damage = Math.max(1, Math.floor(enemy.maxHp * status.power));
        if (damage) {
          enemy.hp = Math.max(0, enemy.hp - damage);
          results.push({ enemy, id: status.id, name: status.name, damage });
        }
        status.turns--;
        return status.turns > 0 && enemy.hp > 0;
      });
    });
    return results;
  }
  function statusLabel(status) {
    return `${status.name} ${status.turns}T`;
  }

  // src/battle/TurnSystem.js
  function aliveEnemies(battle2) {
    return (battle2.enemies ?? [battle2.enemy]).filter(Boolean).filter((enemy) => enemy.hp > 0);
  }
  function selectedEnemy(battle2) {
    const alive = aliveEnemies(battle2);
    let target = alive.find((e) => e.id === battle2.targetEnemyId);
    if (!target) {
      target = alive[0] ?? null;
      battle2.targetEnemyId = target?.id ?? null;
    }
    return target;
  }
  function buildTurnQueue(battle2) {
    const entries = battle2.party.filter((monster) => monster.currentHp > 0).map((monster) => ({ type: "ally", id: monster.id, name: displayName(monster), spd: calculatedStats(monster).spd ?? 0, tie: Math.random() }));
    aliveEnemies(battle2).forEach((enemy) => entries.push({ type: "enemy", id: enemy.id, name: enemy.name, spd: enemy.spd ?? 0, tie: Math.random() }));
    entries.sort((a, b) => b.spd - a.spd || b.tie - a.tie);
    battle2.turnQueue = entries;
    battle2.queueIndex = 0;
    return entries;
  }
  function currentTurnEntry(battle2) {
    return battle2.turnQueue?.[battle2.queueIndex] ?? null;
  }
  function currentAlly(battle2) {
    const entry = currentTurnEntry(battle2);
    if (entry?.type !== "ally") return null;
    return battle2.party.find((monster) => monster.id === entry.id && monster.currentHp > 0) ?? null;
  }
  function currentEnemy(battle2) {
    const entry = currentTurnEntry(battle2);
    if (entry?.type !== "enemy") return null;
    return aliveEnemies(battle2).find((enemy) => enemy.id === entry.id) ?? null;
  }
  function skipInvalidEntries(battle2) {
    while (battle2.queueIndex < (battle2.turnQueue?.length ?? 0)) {
      const entry = currentTurnEntry(battle2);
      if (entry?.type === "enemy" && aliveEnemies(battle2).some((e) => e.id === entry.id)) return entry;
      if (entry?.type === "ally" && battle2.party.some((m) => m.id === entry.id && m.currentHp > 0)) return entry;
      battle2.queueIndex++;
    }
    return null;
  }
  function advanceQueue(battle2) {
    battle2.queueIndex++;
    return skipInvalidEntries(battle2);
  }
  function queueFinished(battle2) {
    return battle2.queueIndex >= (battle2.turnQueue?.length ?? 0);
  }

  // src/ui/screens/BattleScreen.js
  function renderTurnOrder(battle2) {
    return (battle2.turnQueue ?? []).map((entry, index) => {
      const shortName = entry.name.length > 6 ? entry.name.slice(0, 6) + "\u2026" : entry.name;
      const classes = ["turn-chip", entry.type, index === battle2.queueIndex ? "current" : "", index < battle2.queueIndex ? "done" : ""].filter(Boolean).join(" ");
      return `<span class="${classes}"><b>${shortName}</b><small>SPD ${entry.spd}</small></span>`;
    }).join("");
  }
  function renderEnemies(battle2, enemies, target) {
    return enemies.map((enemy) => {
      const statuses = enemyStatusesFor(battle2, enemy.id);
      const statusHtml = statuses.length ? `<div class="status-row">${statuses.map((s) => `<span class="status-chip ${s.id}">${statusLabel(s)}</span>`).join("")}</div>` : "";
      const badge = enemy.boss ? '<span class="boss-badge">BOSS</span>' : "";
      return `<button id="enemy-${enemy.id}" data-enemy-target="${enemy.id}" class="combatant enemy-combatant ${target?.id === enemy.id ? "targeted" : ""}">
   <div class="enemy-name">${badge}${enemy.name} Lv.${enemy.level}</div>
   <div class="enemy-intent">${enemy.intent}${enemy.enraged ? "\u30FB\u72C2\u66B4\u5316" : ""}</div>
   ${statusHtml}
   <div class="enemy-orb" style="background:${enemy.color}"><span>${enemy.emoji ?? "\u{1F47E}"}</span></div>
   <div class="battle-bar"><i style="width:${enemy.hp / enemy.maxHp * 100}%"></i></div>
   <div class="battle-hp">${enemy.hp}/${enemy.maxHp}</div>
  </button>`;
    }).join("");
  }
  function renderParty(battle2, actor2) {
    return battle2.party.map((m) => {
      const stats = calculatedStats(m), mp = maxMp(m), need = expNeedFor(m);
      return `<button id="ally-${m.id}" data-battle-detail="${m.id}" class="battle-unit combatant ${actor2?.id === m.id ? "active" : ""} ${m.currentHp <= 0 ? "dead" : ""}">
   <div class="unit-head"><span class="unit-orb" style="background:${colorValue(m)}">${battle2.species?.[m.speciesId]?.emoji ?? "\u25CF"}</span><b>${displayName(m)} Lv.${m.level}</b></div>
   <div class="battle-bar ally"><span class="bar-label">HP ${m.currentHp}/${stats.hp}</span><i style="width:${Math.max(0, m.currentHp / stats.hp * 100)}%"></i></div>
   <div class="battle-bar mp"><span class="bar-label">MP ${m.currentMp}/${mp}</span><i style="width:${Math.max(0, m.currentMp / mp * 100)}%"></i></div>
   <small class="battle-mini-stats">ATK ${stats.atk} / DEF ${stats.def} / SPD ${stats.spd}</small>
   <div class="battle-exp-row"><small>\u3042\u3068${Math.max(0, need - m.exp)}</small><div class="battle-bar exp"><i style="width:${Math.min(100, m.exp / need * 100)}%"></i></div></div>
  </button>`;
    }).join("");
  }
  function renderSkills(battle2, actor2, skills) {
    const rows = skills.map((skill) => {
      const cd = cooldownRemaining(battle2, actor2.id, skill.id), disabled = actor2.currentMp < skill.mp || cd > 0;
      const cost = cd > 0 ? `CD ${cd}` : `MP ${skill.mp}`;
      return `<button data-skill-id="${skill.id}" ${disabled ? "disabled" : ""}><span><b>${skill.name}</b><small>${skill.description}</small></span><strong>${cost}</strong></button>`;
    }).join("");
    return `<div class="skill-command-list">${rows}<button id="closeSkillMenu" class="secondary">\u623B\u308B</button></div>`;
  }
  function renderItems(inventory) {
    const defs = [
      ["potions", "\u2764\uFE0F", "\u5358\u4F53\u56DE\u5FA9\u85AC", "HP100\u56DE\u5FA9"],
      ["partyPotions", "\u{1F49A}", "\u5168\u4F53\u56DE\u5FA9\u85AC", "\u5168\u54E1HP50\u56DE\u5FA9"],
      ["statusCures", "\u{1FA79}", "\u72B6\u614B\u7570\u5E38\u56DE\u5FA9\u30FB\u5358\u4F53", "\u5358\u4F53\u306E\u7570\u5E38\u89E3\u9664"],
      ["partyStatusCures", "\u{1F4A8}", "\u72B6\u614B\u7570\u5E38\u56DE\u5FA9\u30FB\u5168\u4F53", "\u5168\u54E1\u306E\u7570\u5E38\u89E3\u9664"],
      ["fullHeals", "\u2728", "\u5B8C\u5168\u56DE\u5FA9\u85AC\u30FB\u5358\u4F53", "HP\u30FBMP\u30FB\u7570\u5E38\u3092\u5168\u56DE\u5FA9"],
      ["partyFullHeals", "\u{1F31F}", "\u5B8C\u5168\u56DE\u5FA9\u85AC\u30FB\u5168\u4F53", "\u5168\u54E1\u3092\u5B8C\u5168\u56DE\u5FA9"]
    ];
    const rows = defs.filter((d) => (inventory[d[0]] ?? 0) > 0).map(([id, icon, name, desc]) => `<button data-battle-item="${id}"><span><b>${icon} ${name}</b><small>${desc}</small></span><strong>\xD7${inventory[id] ?? 0}</strong></button>`).join("");
    const body = rows || '<div class="empty">\u4F7F\u7528\u3067\u304D\u308B\u30A2\u30A4\u30C6\u30E0\u304C\u3042\u308A\u307E\u305B\u3093</div>';
    return `<div class="skill-command-list battle-item-list">${body}<button id="closeItemMenu" class="secondary">\u623B\u308B</button></div>`;
  }
  function renderCommands(battle2, actor2, current, enemies, target, inventory, skills) {
    const title = actor2 ? `${displayName(actor2)}\u306E\u884C\u52D5` : current?.type === "enemy" ? `${(battle2.enemies ?? []).find((e) => e.id === current.id)?.name ?? "\u6575"}\u304C\u884C\u52D5\u4E2D` : "\u30E9\u30A6\u30F3\u30C9\u51E6\u7406\u4E2D";
    const targetHelp = actor2 && enemies.length > 1 ? `<small class="target-help">\u653B\u6483\u5BFE\u8C61\uFF1A${target?.name ?? "\u306A\u3057"}\uFF08\u6575\u3092\u30BF\u30C3\u30D7\u3057\u3066\u5909\u66F4\uFF09</small>` : "";
    let controls;
    if (!actor2) controls = '<div class="enemy-thinking">\u6575\u306E\u884C\u52D5\u3092\u51E6\u7406\u3057\u3066\u3044\u307E\u3059\u2026</div>';
    else if (battle2.skillMenu) controls = renderSkills(battle2, actor2, skills);
    else if (battle2.itemMenu) controls = renderItems(inventory);
    else controls = '<div class="command-grid"><button data-command="attack">\u305F\u305F\u304B\u3046</button><button data-command="guard">\u30AC\u30FC\u30C9</button><button data-command="skill">\u30B9\u30AD\u30EB</button><button data-command="item">\u30A2\u30A4\u30C6\u30E0</button><button data-command="capture">\u6355\u7372</button></div>';
    return `<div class="battle-command"><div class="spread"><h2>${title}</h2><span class="muted">\u6355\u7372\u7D50\u6676 ${inventory.captureCrystals}</span></div>${targetHelp}${controls}</div>`;
  }
  function BattleScreen(battle2, inventory, settings) {
    const actor2 = currentAlly(battle2), current = currentTurnEntry(battle2), enemies = aliveEnemies(battle2), target = selectedEnemy(battle2), skills = actor2 ? learnedSkills(actor2) : [];
    return `<section class="battle-screen" data-speed="${settings.battleSpeed}">
  <div class="battle-header"><div class="round-label"><small>ROUND</small><b>${battle2.turn}</b></div><button id="toggleBattleAuto">AUTO ${battle2.auto ? "ON" : "OFF"}</button><button id="battleSpeed">\xD7${settings.battleSpeed}</button><button id="escapeBattle">\u9003\u3052\u308B</button></div>
  <div class="turn-order"><span class="turn-order-title">\u884C\u52D5\u9806</span>${renderTurnOrder(battle2)}</div>
  <div class="battle-arena multi-enemy"><div class="enemy-party">${renderEnemies(battle2, enemies, target)}</div><div class="battle-party">${renderParty(battle2, actor2)}</div><div id="battleFxLayer" class="battle-fx-layer"></div></div>
  ${renderCommands(battle2, actor2, current, enemies, target, inventory, skills)}
  <div class="battle-log">${(battle2.log ?? []).map((line) => `<div>${line}</div>`).join("")}</div>
 </section>`;
  }

  // src/ui/components/Modal.js
  function Modal(title, body, button = "\u9589\u3058\u308B") {
    return `<div class="game-modal"><div class="game-modal-card"><button type="button" class="modal-x" data-modal-dismiss aria-label="\u9589\u3058\u308B">\xD7</button><h2>${title}</h2><div class="game-modal-body">${body}</div><button id="closeGameModal" class="primary" style="width:100%;margin-top:12px">${button}</button></div></div>`;
  }

  // src/data/equipment.js
  var RARITY_ORDER = { N: 0, R: 1, SR: 2, SSR: 3, LR: 4 };
  var RARITY_COLORS = { N: "#d9d9d9", R: "#71c5ff", SR: "#c586ff", SSR: "#ffd05c", LR: "#ff79dd" };
  var EQUIPMENT_BASES = {
    weapon: [
      { name: "\u9244\u306E\u5263", handedness: "right", stats: { atk: 5, crit: 2 } },
      { name: "\u9B54\u722A", handedness: "either", stats: { atk: 7, spd: 1 } },
      { name: "\u708E\u5203", handedness: "twoHanded", stats: { atk: 9, crit: 3 } },
      { name: "\u6355\u7372\u5E2B\u306E\u77ED\u5263", handedness: "left", stats: { atk: 4, capture: 7 } }
    ],
    armor: [
      { name: "\u9769\u93A7", stats: { hp: 12, def: 3 } },
      { name: "\u9B54\u5E03\u306E\u30ED\u30FC\u30D6", stats: { hp: 18, def: 2, heal: 5 } },
      { name: "\u7ADC\u9C57\u93A7", stats: { hp: 25, def: 6, fireRes: 8 } },
      { name: "\u5B88\u8B77\u8005\u306E\u5916\u5957", stats: { hp: 20, def: 5 } }
    ],
    accessory: [
      { name: "\u65C5\u4EBA\u306E\u6307\u8F2A", stats: { spd: 2, capture: 3 } },
      { name: "\u5E78\u904B\u306E\u8B77\u7B26", stats: { crit: 4, evasion: 2 } },
      { name: "\u7652\u3084\u3057\u306E\u96EB", stats: { heal: 12, hp: 8 } },
      { name: "\u708E\u306E\u6307\u8F2A", stats: { atk: 3, fireRes: 12 } }
    ]
  };
  function equipmentStatLabel(key) {
    return { atk: "ATK", def: "DEF", hp: "HP", spd: "SPD", crit: "\u4F1A\u5FC3", evasion: "\u56DE\u907F", capture: "\u6355\u7372", heal: "\u56DE\u5FA9\u91CF", fireRes: "\u708E\u8010\u6027" }[key] ?? key;
  }
  var SLOT_UNLOCK_LEVEL = { weaponRight: 1, armorBody: 1, accessoryNeck: 1, armorSupport: 25, accessoryFinger: 50, weaponLeft: 100 };
  function equipmentSubslotLabel(id) {
    return { weaponRight: "\u53F3\u624B", weaponLeft: "\u5DE6\u624B", armorBody: "\u80F4", armorSupport: "\u88DC\u52A9", accessoryNeck: "\u9996", accessoryFinger: "\u6307" }[id] ?? id;
  }
  function compatibleSubslots(item) {
    if (item.slot === "armor") return ["armorBody", "armorSupport"];
    if (item.slot === "accessory") return ["accessoryNeck", "accessoryFinger"];
    if (item.handedness === "right") return ["weaponRight"];
    if (item.handedness === "left") return ["weaponLeft"];
    if (item.handedness === "twoHanded") return ["weaponRight"];
    return ["weaponRight", "weaponLeft"];
  }

  // src/models/Equipment.js
  function uid2() {
    return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  function createEquipment(slot, options = {}) {
    const pool = EQUIPMENT_BASES[slot];
    const base = options.base ?? pool[Math.floor(Math.random() * pool.length)];
    const rarity = options.rarity ?? rollRarity();
    const mult = { N: 0.8, R: 1, SR: 1.45, SSR: 2.05, LR: 3 }[rarity];
    const stats = {};
    for (const [key, value] of Object.entries(base.stats)) stats[key] = Math.max(1, Math.round(value * mult));
    return {
      id: uid2(),
      slot,
      name: base.name,
      rarity,
      level: 1,
      plus: 0,
      stats,
      handedness: options.handedness ?? base.handedness ?? (slot === "weapon" ? "either" : null),
      ruleOverrides: options.ruleOverrides ?? {},
      series: options.series ?? seriesForName(base.name),
      favorite: false,
      locked: false,
      equippedBy: null,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  function seriesForName(name) {
    if (/炎|竜鱗/.test(name)) return "flame";
    if (/守護者|革鎧|鉄の剣/.test(name)) return "guardian";
    if (/旅人|幸運/.test(name)) return "traveler";
    if (/捕獲師/.test(name)) return "capturer";
    return null;
  }
  function rollRarity() {
    const r = Math.random();
    if (r < 0.01) return "LR";
    if (r < 0.07) return "SSR";
    if (r < 0.27) return "SR";
    if (r < 0.82) return "R";
    return "N";
  }
  function equipmentPower(item) {
    return Object.values(item.stats).reduce((a, b) => a + b, 0) * (1 + (item.plus ?? 0) * 0.08) + (item.plus ?? 0) * 3 + (item.level ?? 1);
  }

  // src/services/EquipmentStorage.js?v=0.8.0-alpha.2.1
  var EQUIPMENT_LIMIT = 500;
  var RESERVE_LIMIT = 30;
  function equipmentSellPrice(item) {
    return ({ N: 15, R: 45, SR: 110, SSR: 260, LR: 650 }[item.rarity] ?? 10) + (item.plus ?? 0) * 25 + (item.level ?? 1) * 2;
  }
  function slotLabel(slot) {
    return { weapon: "\u6B66\u5668", armor: "\u9632\u5177", accessory: "\u30A2\u30AF\u30BB", weaponRight: "\u53F3\u624B\u6B66\u5668", weaponLeft: "\u5DE6\u624B\u6B66\u5668", armorBody: "\u80F4\u9632\u5177", armorSupport: "\u88DC\u52A9\u9632\u5177", accessoryNeck: "\u9996\u30A2\u30AF\u30BB", accessoryFinger: "\u6307\u30A2\u30AF\u30BB" }[slot] ?? slot;
  }
  function ensureEquipmentStorage(state) {
    state.equipment ?? (state.equipment = []);
    state.reserveEquipment ?? (state.reserveEquipment = []);
    state.bossEquipmentVault ?? (state.bossEquipmentVault = []);
  }
  function receiveEquipment(state, item, { bossReward = false } = {}) {
    ensureEquipmentStorage(state);
    if (state.equipment.length < EQUIPMENT_LIMIT) {
      state.equipment.push(item);
      return { location: "inventory", message: "\u88C5\u5099\u4E00\u89A7\u3078\u8FFD\u52A0" };
    }
    if (state.reserveEquipment.length < RESERVE_LIMIT) {
      item.equippedBy = null;
      state.reserveEquipment.push(item);
      return { location: "reserve", message: `\u6240\u6301\u4E0A\u9650\u306E\u305F\u3081\u4E88\u5099BOX\u3078\u8EE2\u9001\uFF08${state.reserveEquipment.length}/${RESERVE_LIMIT}\uFF09` };
    }
    if (bossReward) {
      item.equippedBy = null;
      state.bossEquipmentVault.push(item);
      return { location: "bossVault", message: "\u30DC\u30B9\u9650\u5B9A\u5831\u916C\u3092\u738B\u88C5\u4FDD\u7BA1\u5EAB\u3078\u8EE2\u9001" };
    }
    const gold = equipmentSellPrice(item);
    state.player.gold += gold;
    return { location: "sold", gold, message: `\u6240\u6301\u4E0A\u9650\u30FB\u4E88\u5099BOX\u6E80\u676F\u306E\u305F\u3081 ${gold}G \u306B\u81EA\u52D5\u63DB\u91D1` };
  }
  function takeFromStorage(state, itemId, source) {
    ensureEquipmentStorage(state);
    if (state.equipment.length >= EQUIPMENT_LIMIT) return { ok: false, message: "\u901A\u5E38\u6240\u6301\u304C500\u500B\u3067\u6E80\u676F\u3067\u3059\u3002\u5148\u306B\u6574\u7406\u3057\u3066\u304F\u3060\u3055\u3044\u3002" };
    const key = source === "reserve" ? "reserveEquipment" : "bossEquipmentVault";
    const list = state[key];
    const index = list.findIndex((item2) => item2.id === itemId);
    if (index < 0) return { ok: false, message: "\u88C5\u5099\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002" };
    const [item] = list.splice(index, 1);
    item.equippedBy = null;
    state.equipment.push(item);
    return { ok: true, item };
  }

  // src/services/EquipmentStorage.js
  var EQUIPMENT_LIMIT2 = 500;
  function equipmentSellPrice2(item) {
    return ({ N: 15, R: 45, SR: 110, SSR: 260, LR: 650 }[item.rarity] ?? 10) + (item.plus ?? 0) * 25 + (item.level ?? 1) * 2;
  }
  function slotLabel2(slot) {
    return { weapon: "\u6B66\u5668", armor: "\u9632\u5177", accessory: "\u30A2\u30AF\u30BB", weaponRight: "\u53F3\u624B\u6B66\u5668", weaponLeft: "\u5DE6\u624B\u6B66\u5668", armorBody: "\u80F4\u9632\u5177", armorSupport: "\u88DC\u52A9\u9632\u5177", accessoryNeck: "\u9996\u30A2\u30AF\u30BB", accessoryFinger: "\u6307\u30A2\u30AF\u30BB" }[slot] ?? slot;
  }

  // src/ui/screens/EquipmentScreen.js?v=0.8.0-alpha.2.1
  var SLOT_ICONS = { weapon: "\u2694\uFE0F", armor: "\u{1F6E1}\uFE0F", accessory: "\u{1F48D}" };
  function EquipmentScreen(state, targetId, { home = false } = {}) {
    state.settings ?? (state.settings = {});
    const target = state.monsters.find((m) => m.id === targetId) ?? state.monsters[0];
    const slot = state.settings.equipmentSlot ?? "weapon";
    let storage = state.settings.equipmentStorage ?? "inventory";
    if (!home && storage !== "inventory") storage = "inventory";
    const sort = state.settings.equipmentSort ?? "rarity";
    const source = storage === "reserve" ? state.reserveEquipment : storage === "bossVault" ? state.bossEquipmentVault : state.equipment;
    if (!target) return `<section class="screen"><header class="topbar"><button id="backEquipmentHome">\u2190</button><h2>\u88C5\u5099\u7BA1\u7406</h2></header></section>`;
    const list = [...source].filter((i) => i.slot === slot && (!i.equippedBy || i.equippedBy === target.id)).sort((a, b) => sortItems(a, b, sort));
    const name = (id) => state.equipment.find((i) => i.id === id)?.name ?? "\u306A\u3057";
    return `<section class="screen"><header class="topbar"><button id="backEquipmentHome">\u2190</button><h2>\u88C5\u5099\u7BA1\u7406</h2><span>${state.equipment.length}/${EQUIPMENT_LIMIT2}</span></header><div class="page equipment-page"><div class="panel"><div class="spread"><b>\u88C5\u5099\u5BFE\u8C61</b><select id="equipmentTarget">${state.party.map((id) => state.monsters.find((m) => m.id === id)).filter(Boolean).map((m) => `<option value="${m.id}" ${m.id === target.id ? "selected" : ""}>${displayName(m)} Lv.${m.level}</option>`).join("")}</select></div><div class="equipped-summary six-slots">${Object.keys(SLOT_UNLOCK_LEVEL).map((s) => {
      const locked = target.level < SLOT_UNLOCK_LEVEL[s];
      return `<span class="${locked ? "locked-slot" : ""}">${equipmentSubslotLabel(s)}\uFF1A${locked ? `\u{1F512} Lv.${SLOT_UNLOCK_LEVEL[s]}` : name(target.equipment?.[s])}</span>`;
    }).join("")}</div><div class="auto-equip-row"><button id="autoEquipOne">\u26A1 \u3053\u306E\u30AD\u30E3\u30E9\u3092\u81EA\u52D5\u88C5\u5099</button><button id="autoEquipParty">\u26A1 \u30D1\u30FC\u30C6\u30A3\u5168\u54E1\u3092\u81EA\u52D5\u88C5\u5099</button></div></div><div class="equipment-slot-tabs">${["weapon", "armor", "accessory"].map((id) => `<button data-equipment-slot="${id}" class="${slot === id ? "active" : ""}">${SLOT_ICONS[id]} ${slotLabel2(id)}</button>`).join("")}</div><div class="equipment-storage-tabs"><button data-equipment-storage="inventory" class="${storage === "inventory" ? "active" : ""}">\u6240\u6301\u54C1</button><button data-equipment-storage="reserve" ${home ? "" : "disabled"}>\u4E88\u5099BOX</button><button data-equipment-storage="bossVault" ${home ? "" : "disabled"}>\u738B\u88C5\u4FDD\u7BA1\u5EAB</button></div><div class="panel equipment-manage-panel"><div class="spread"><b>\u88C5\u5099\u6574\u7406</b><button id="bulkSellEquipment">N\u301CR\u4E00\u62EC\u58F2\u5374</button></div></div><div class="panel equipment-sort-panel"><div class="spread"><b>${slotLabel2(slot)}\u306E\u4E26\u3073\u66FF\u3048</b><select id="equipmentSort"><option value="rarity">\u30EC\u30A2\u5EA6\u9806</option><option value="power">\u7DCF\u5408\u80FD\u529B\u9806</option><option value="atk">ATK\u9806</option><option value="def">DEF\u9806</option><option value="hp">HP\u9806</option><option value="spd">SPD\u9806</option><option value="newest">\u65B0\u3057\u3044\u9806</option><option value="favorite">\u304A\u6C17\u306B\u5165\u308A\u9806</option><option value="name">\u540D\u524D\u9806</option></select></div></div><div class="equipment-list">${list.map((i) => card(i, state, target, storage)).join("") || '<div class="empty">\u88C5\u5099\u304C\u3042\u308A\u307E\u305B\u3093</div>'}</div></div></section>`;
  }
  function sortItems(a, b, s) {
    if (s === "rarity") return RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
    if (s === "power") return total(b) - total(a);
    if (["atk", "def", "hp", "spd"].includes(s)) return (b.stats?.[s] ?? 0) - (a.stats?.[s] ?? 0);
    if (s === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (s === "favorite") return Number(b.favorite) - Number(a.favorite);
    return a.name.localeCompare(b.name, "ja");
  }
  function total(i) {
    return Object.values(i.stats ?? {}).reduce((a, b) => a + b, 0) + (i.plus ?? 0) * 3;
  }
  function handLabel(i) {
    return i.slot !== "weapon" ? "" : { right: "\u53F3\u624B\u5411\u304D", left: "\u5DE6\u624B\u5411\u304D", either: "\u5DE6\u53F3\u5BFE\u5FDC", twoHanded: "\u4E21\u624B\u6B66\u5668" }[i.handedness] ?? "\u5DE6\u53F3\u5BFE\u5FDC";
  }
  function card(item, state, target, storage) {
    const mult = 1 + (item.plus ?? 0) * 0.08, stats = Object.entries(item.stats).map(([k, v]) => `${equipmentStatLabel(k)}+${Math.round(v * mult)}`).join(" / "), owner = item.equippedBy ? state.monsters.find((m) => m.id === item.equippedBy) : null, inventory = storage === "inventory";
    const buttons = compatibleSubslots(item).map((s) => {
      const locked = target.level < SLOT_UNLOCK_LEVEL[s];
      return `<button data-equip="${item.id}" data-target="${target.id}" data-subslot="${s}" ${locked ? "disabled" : ""}>${equipmentSubslotLabel(s)}\u3078${locked ? `\uFF08Lv.${SLOT_UNLOCK_LEVEL[s]}\uFF09` : ""}</button>`;
    }).join("");
    return `<article class="equipment-card"><div class="spread"><b style="color:${RARITY_COLORS[item.rarity]}">[${item.rarity}] ${item.name}${item.plus ? ` +${item.plus}` : ""}</b><span>${item.favorite ? "\u2605" : ""}${item.locked ? "\u{1F512}" : ""}</span></div><div class="subline">${slotLabel2(item.slot)} ${handLabel(item)} / ${stats}<br>${owner ? `\u88C5\u5099\u4E2D\uFF1A${displayName(owner)}` : "\u672A\u88C5\u5099"}</div><div class="equipment-actions">${inventory ? buttons + (item.equippedBy ? `<button data-unequip="${item.id}">\u5916\u3059</button>` : `<button data-sell="${item.id}">\u58F2\u5374 ${equipmentSellPrice2(item)}G</button>`) + `<button data-enhance-equipment="${item.id}">\u5F37\u5316</button><button data-favorite-equipment="${item.id}">\u2606</button><button data-lock-equipment="${item.id}">\u{1F512}</button>` : `<button data-take-equipment="${item.id}" data-storage="${storage}">\u6240\u6301\u54C1\u3078</button>`}</div></article>`;
  }

  // src/ui/screens/ShopScreen.js
  function ShopScreen(state) {
    const d = state.shop?.discount ?? 0;
    const discountLabel = d ? `\u672C\u65E5\u306E\u88C5\u5099\u53EC\u559A ${d}%OFF` : "\u672C\u65E5\u306E\u5272\u5F15\u306A\u3057";
    return `<section class="screen shop-screen">
  <div class="page">
   <div class="spread"><div><div class="eyebrow">SAFE ROOM</div><h1 class="hero-title">\u6DF1\u6DF5\u5546\u5E97\u8857</h1></div><button id="leaveShop">\u63A2\u7D22\u3078</button></div>
   <div class="panel"><div class="spread"><span>\u6240\u6301GOLD</span><b id="shopGold">${state.player.gold}</b></div><small class="muted">\u9B54\u6676\u77F3 ${state.player.crystals}\u3000\uFF0F\u3000${discountLabel}</small></div>
   <div class="shop-grid">
    <button data-shop-menu="bed"><span>\u{1F6CF}\uFE0F</span><b>\u5BBF\u5C4B</b><small>\u5168\u56DE\u5FA9 180G</small></button>
    <button data-shop-menu="herb"><span>\u{1F33F}</span><b>\u85AC\u8349\u5C4B</b><small>\u56DE\u5FA9\u30FB\u72B6\u614B\u7570\u5E38\u30A2\u30A4\u30C6\u30E0</small></button>
    <button data-shop-menu="capture"><span>\u{1F48E}</span><b>\u6355\u7372\u5546\u4EBA</b><small>\u6355\u7372\u7D50\u6676 420G\u301C</small></button>
    <button data-shop-menu="gear"><span>\u{1F3B0}</span><b>\u88C5\u5099\u53EC\u559A</b><small>\u8907\u6570\u30AC\u30C1\u30E3\u30FB\u5272\u5F15\u3042\u308A</small></button>
   </div>
  </div>
 </section>`;
  }

  // src/battle/EnemyAI.js
  var ENEMY_ACTIONS = {
    attack: "attack",
    guard: "guard",
    charge: "charge",
    power: "power",
    heal: "heal",
    enrage: "enrage"
  };
  function isBossFloor(floor) {
    return floor > 0 && floor % 10 === 0;
  }
  function createEnemyBattleState(species, source, floor) {
    const boss = source.boss ?? isBossFloor(floor);
    const hpScale = boss ? 2.35 : 1;
    const attackScale = boss ? 1.3 : 1;
    const maxHp = Math.floor((species.baseStats.hp + source.level * 8) * hpScale);
    return {
      speciesId: source.speciesId,
      name: boss ? `\u6DF1\u6DF5\u306E${species.name}` : species.name,
      level: source.level,
      hp: maxHp,
      maxHp,
      atk: Math.floor((species.baseStats.atk + source.level * 1.4) * attackScale),
      def: Math.floor((species.baseStats.def + source.level * 0.5) * (boss ? 1.2 : 1)),
      spd: Math.floor((species.baseStats.spd + source.level * 0.18) * (boss ? 1.08 : 1)),
      emoji: species.emoji ?? "\u{1F47E}",
      color: boss ? "#bb4cff" : species.baseStats.atk > 12 ? "#df6262" : "#a58f59",
      boss,
      phase: 1,
      enraged: false,
      guard: false,
      charging: false,
      healed: false,
      intent: "\u69D8\u5B50\u3092\u898B\u3066\u3044\u308B"
    };
  }
  function chooseEnemyAction(enemy) {
    const hpRate = enemy.hp / enemy.maxHp;
    if (enemy.charging) {
      enemy.charging = false;
      enemy.intent = "\u5F37\u653B\u6483\u3092\u653E\u3064";
      return ENEMY_ACTIONS.power;
    }
    if (enemy.boss && hpRate <= 0.5 && !enemy.enraged) {
      enemy.enraged = true;
      enemy.phase = 2;
      enemy.intent = "\u72C2\u66B4\u5316";
      return ENEMY_ACTIONS.enrage;
    }
    if (hpRate <= 0.3 && !enemy.healed && Math.random() < 0.5) {
      enemy.healed = true;
      enemy.intent = "\u81EA\u5DF1\u56DE\u5FA9";
      return ENEMY_ACTIONS.heal;
    }
    const roll = Math.random();
    const guardChance = enemy.boss ? 0.12 : 0.18;
    const chargeChance = enemy.boss ? 0.25 : 0.16;
    if (roll < guardChance) {
      enemy.guard = true;
      enemy.intent = "\u9632\u5FA1\u614B\u52E2";
      return ENEMY_ACTIONS.guard;
    }
    if (roll < guardChance + chargeChance) {
      enemy.charging = true;
      enemy.intent = "\u529B\u3092\u6E9C\u3081\u3066\u3044\u308B";
      return ENEMY_ACTIONS.charge;
    }
    enemy.intent = enemy.enraged ? "\u72C2\u4E71\u653B\u6483" : "\u901A\u5E38\u653B\u6483";
    return ENEMY_ACTIONS.attack;
  }
  function enemyDamageMultiplier(enemy) {
    if (!enemy.guard) return 1;
    enemy.guard = false;
    return 0.48;
  }
  function enemyHealAmount(enemy) {
    return Math.max(1, Math.floor(enemy.maxHp * (enemy.boss ? 0.22 : 0.16)));
  }
  function enemyAttackMultiplier(enemy, action) {
    if (action === ENEMY_ACTIONS.power) return enemy.boss ? 2.15 : 1.8;
    if (enemy.enraged) return 1.35;
    return 1;
  }

  // src/main.js
  var TILE = 48;
  var app = document.getElementById("app");
  var save = new SaveService();
  var screen = "home";
  var selected = null;
  var equipmentTarget = null;
  var game = null;
  var battle = null;
  var snapshot = null;
  var activeEnemy = null;
  var navigationOrigin = "home";
  function topModal() {
    const mods = document.querySelectorAll(".game-modal");
    return mods[mods.length - 1] ?? null;
  }
  function topModalButton() {
    return topModal()?.querySelector("#closeGameModal") ?? null;
  }
  function closeTopModal() {
    topModal()?.remove();
  }
  function showToast(text) {
    document.querySelector(".game-toast")?.remove();
    const el = document.createElement("div");
    el.className = "game-toast";
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest?.("[data-modal-dismiss]");
    if (!b) return;
    const modal = b.closest(".game-modal");
    modal?.remove();
    if (game?.paused && !document.querySelector(".game-modal")) game.paused = false;
  });
  document.addEventListener("contextmenu", (e) => {
    if (!e.target.closest("input,textarea")) e.preventDefault();
  });
  document.addEventListener("selectstart", (e) => {
    if (!e.target.closest("input,textarea")) e.preventDefault();
  });
  var lastTouchEnd = 0;
  document.addEventListener("touchend", (e) => {
    const now = Date.now();
    if (now - lastTouchEnd < 320 && !e.target.closest("input,textarea")) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
  var Entity = class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.rx = x;
      this.ry = y;
      this.path = [];
      this.p = 0;
    }
    setPath(p) {
      this.path = p;
      this.p = 0;
    }
    move(dt, s) {
      if (!this.path.length) return false;
      const t = this.path[0];
      this.p += dt * s;
      const n = Math.min(1, this.p);
      this.rx = this.x + (t.x - this.x) * n;
      this.ry = this.y + (t.y - this.y) * n;
      if (this.p >= 1) {
        this.x = t.x;
        this.y = t.y;
        this.rx = this.x;
        this.ry = this.y;
        this.path.shift();
        this.p = 0;
        return true;
      }
      return false;
    }
  };
  var Camera = class {
    constructor(c) {
      this.c = c;
      this.x = TILE;
      this.y = TILE;
      this.z = 0.85;
      this.ox = 0;
      this.oy = 0;
      this.manual = false;
    }
    world(wx, wy) {
      return { x: (wx - this.x) * this.z + this.c.width / 2 + this.ox, y: (wy - this.y) * this.z + this.c.height / 2 + this.oy };
    }
    screen(sx, sy) {
      return { x: (sx - this.c.width / 2 - this.ox) / this.z + this.x, y: (sy - this.c.height / 2 - this.oy) / this.z + this.y };
    }
    pan(dx, dy) {
      this.ox += dx;
      this.oy += dy;
      this.manual = true;
    }
    reset(px, py) {
      this.x = px;
      this.y = py;
      this.ox = 0;
      this.oy = 0;
      this.z = 0.85;
      this.manual = false;
    }
    follow(px, py) {
      if (this.manual) return;
      const p = this.world(px, py), l = this.c.width * 0.34, r = this.c.width * 0.66, t = this.c.height * 0.34, b = this.c.height * 0.66;
      if (p.x < l) this.x += (p.x - l) / this.z * 0.12;
      if (p.x > r) this.x += (p.x - r) / this.z * 0.12;
      if (p.y < t) this.y += (p.y - t) / this.z * 0.12;
      if (p.y > b) this.y += (p.y - b) / this.z * 0.12;
    }
    clamp(w) {
      const edge = 30, mw = w.cols * TILE * this.z, mh = w.rows * TILE * this.z, ml = this.c.width / 2 - this.x * this.z, mt = this.c.height / 2 - this.y * this.z, minX = edge - (ml + mw), maxX = this.c.width - edge - ml, minY = edge - (mt + mh), maxY = this.c.height - edge - mt;
      this.ox = mw <= this.c.width - edge * 2 ? (this.c.width - mw) / 2 - ml : Math.max(minX, Math.min(maxX, this.ox));
      this.oy = mh <= this.c.height - edge * 2 ? (this.c.height - mh) / 2 - mt : Math.max(minY, Math.min(maxY, this.oy));
    }
  };
  function normalizeEquipmentState() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    (_a = save.state).equipment ?? (_a.equipment = []);
    (_b = save.state).reserveEquipment ?? (_b.reserveEquipment = []);
    (_c = save.state).bossEquipmentVault ?? (_c.bossEquipmentVault = []);
    (_d = save.state).settings ?? (_d.settings = {});
    (_e = save.state.settings).equipmentSort ?? (_e.equipmentSort = "rarity");
    (_f = save.state.settings).equipmentSlot ?? (_f.equipmentSlot = "weapon");
    (_g = save.state.settings).equipmentStorage ?? (_g.equipmentStorage = "inventory");
    (_h = save.state).gacha ?? (_h.gacha = { firstTenUsed: false, lastDailyKey: null });
    (_i = save.state).rest ?? (_i.rest = { lastFreeKey: null });
    const byId = new Map(save.state.equipment.map((i) => [i.id, i]));
    save.state.equipment.forEach((i) => i.equippedBy = null);
    save.state.monsters.forEach((m) => {
      m.traitId ?? (m.traitId = "steady");
      const slots = { weaponRight: null, weaponLeft: null, armorBody: null, armorSupport: null, accessoryNeck: null, accessoryFinger: null };
      const old = m.equipment ?? {};
      slots.weaponRight = old.weaponRight ?? old.weapon ?? null;
      slots.weaponLeft = old.weaponLeft ?? null;
      slots.armorBody = old.armorBody ?? old.armor ?? null;
      slots.armorSupport = old.armorSupport ?? null;
      slots.accessoryNeck = old.accessoryNeck ?? old.accessory ?? null;
      slots.accessoryFinger = old.accessoryFinger ?? null;
      const seen = /* @__PURE__ */ new Set();
      for (const key of Object.keys(slots)) {
        const id = slots[key];
        const item = id ? byId.get(id) : null;
        if (!item || seen.has(id)) {
          slots[key] = null;
          continue;
        }
        seen.add(id);
        item.equippedBy = m.id;
      }
      m.equipment = slots;
      const natural = calculatedStats(m);
      if (m.currentHp == null || !Number.isFinite(m.currentHp)) m.currentHp = natural.hp;
      if (m.currentMp == null || !Number.isFinite(m.currentMp)) m.currentMp = maxMp(m);
      const counts = {}, stats = {};
      Object.values(m.equipment).forEach((id) => {
        const item = byId.get(id);
        if (!item) return;
        const mult = 1 + (item.plus ?? 0) * 0.08;
        Object.entries(item.stats ?? {}).forEach(([k, v]) => stats[k] = (stats[k] ?? 0) + Math.round(v * mult));
        if (item.series) counts[item.series] = (counts[item.series] ?? 0) + 1;
      });
      m._equipmentStats = stats;
      m._seriesCounts = counts;
    });
  }
  function render() {
    normalizeEquipmentState();
    if (screen === "home") {
      app.innerHTML = HomeScreen(save.state);
      bindHome();
    } else if (screen === "monsters") {
      app.innerHTML = MonsterListScreen(save.state);
      bindList();
    } else if (screen === "detail") {
      const m = save.state.monsters.find((x) => x.id === selected);
      app.innerHTML = MonsterDetailScreen(m, save.state);
      bindDetail(m);
    } else if (screen === "settings") {
      app.innerHTML = SettingsScreen(save.state);
      bindSettings();
    } else if (screen === "explore") {
      app.innerHTML = ExploreScreen(save.state);
      bindExplore();
    } else if (screen === "equipment") {
      equipmentTarget ?? (equipmentTarget = save.state.party[0]);
      app.innerHTML = EquipmentScreen(save.state, equipmentTarget, { home: navigationOrigin === "home" });
      bindEquipment();
    } else if (screen === "shop") {
      app.innerHTML = ShopScreen(save.state);
      bindShop();
    }
  }
  function go(s) {
    screen = s;
    render();
  }
  function bindHome() {
    document.getElementById("openMonsters").onclick = () => go("monsters");
    document.getElementById("editHomeParty")?.addEventListener("click", openHomePartyEditor);
    document.getElementById("openRest")?.addEventListener("click", openRest);
    document.getElementById("openGacha")?.addEventListener("click", openGacha);
    document.getElementById("openSettings").onclick = () => go("settings");
    document.getElementById("openExplore").onclick = () => {
      const max = save.state.player.maxFloor;
      app.insertAdjacentHTML("beforeend", Modal("\u63A2\u7D22\u958B\u59CB", `<p>\u518D\u958B\u3059\u308B\u968E\u5C64\u3092\u9078\u629E</p><input id="floorSelect" type="number" min="1" max="${max}" value="${max}"><p class="muted">1\u301C${max}\u968E\u3002\u5B9D\u7BB1\u306F\u4E00\u5EA6\u958B\u3051\u305F\u3082\u306E\u306F\u5FA9\u6D3B\u3057\u307E\u305B\u3093\u3002</p>`, `\u51FA\u767A`));
      const modal = topModal(), button = modal.querySelector("#closeGameModal");
      button.onclick = () => {
        const f = Math.max(1, Math.min(max, Number(modal.querySelector("#floorSelect").value) || max));
        save.state.player.currentFloor = f;
        save.state.player.inRun = true;
        save.save();
        snapshot = null;
        modal.remove();
        go("explore");
      };
    };
    document.getElementById("openEquipment").onclick = () => go("equipment");
    detailButtons();
  }
  function bindList() {
    document.getElementById("backHome").onclick = () => go("home");
    const input = document.getElementById("monsterSearch");
    input.oninput = () => document.querySelectorAll(".monster-card").forEach((c) => {
      const m = save.state.monsters.find((x) => x.id === c.querySelector("[data-monster-id]").dataset.monsterId), q = input.value.trim();
      c.style.display = m.nickname.includes(q) || SPECIES[m.speciesId].name.includes(q) ? "grid" : "none";
    });
    detailButtons();
  }
  function detailButtons() {
    document.querySelectorAll("[data-monster-id]").forEach((b) => b.onclick = () => {
      selected = b.dataset.monsterId;
      go("detail");
    });
  }
  function bindDetail(m) {
    document.getElementById("backMonsters").onclick = () => go("monsters");
    document.getElementById("releaseMonster")?.addEventListener("click", () => releaseMonster(m));
    document.getElementById("toggleFavorite").onclick = () => {
      m.favorite = !m.favorite;
      save.save();
      render();
    };
    document.getElementById("saveNickname").onclick = () => {
      const v = document.getElementById("nicknameInput").value.trim();
      if (v) m.nickname = v.slice(0, 12);
      save.save();
      render();
    };
    document.querySelectorAll("[data-color-id]").forEach((b) => b.onclick = () => {
      m.colorId = b.dataset.colorId;
      save.save();
      render();
    });
  }
  function bindSettings() {
    document.getElementById("backHome").onclick = () => go("home");
    document.getElementById("toggleAuto").onclick = () => {
      save.state.settings.autoBattle = !save.state.settings.autoBattle;
      save.save();
      render();
    };
    document.getElementById("toggleMinimap").onclick = () => {
      save.state.settings.minimapVisible = !save.state.settings.minimapVisible;
      save.save();
      render();
    };
    document.getElementById("resetTutorials")?.addEventListener("click", () => {
      save.state.settings.tutorialSeen = {};
      save.save();
      alert("1\u301C5\u968E\u306E\u30C1\u30E5\u30FC\u30C8\u30EA\u30A2\u30EB\u3092\u518D\u8868\u793A\u3057\u307E\u3059");
    });
    document.getElementById("resetSave").onclick = () => {
      if (confirm("\u521D\u671F\u5316\u3059\u308B\uFF1F")) {
        save.reset();
        snapshot = null;
        go("home");
      }
    };
  }
  function bindEquipment() {
    document.getElementById("backEquipmentHome").onclick = () => {
      const target = navigationOrigin;
      navigationOrigin = "home";
      go(target);
    };
    document.getElementById("equipmentTarget").onchange = (e) => {
      equipmentTarget = e.target.value;
      render();
    };
    document.getElementById("equipmentSort").onchange = (e) => {
      save.state.settings.equipmentSort = e.target.value;
      save.save();
      render();
    };
    document.querySelectorAll("[data-equipment-slot]").forEach((b) => b.onclick = () => {
      save.state.settings.equipmentSlot = b.dataset.equipmentSlot;
      save.save();
      render();
    });
    document.querySelectorAll("[data-equipment-storage]").forEach((b) => b.onclick = () => {
      if (b.disabled) return;
      save.state.settings.equipmentStorage = b.dataset.equipmentStorage;
      save.save();
      render();
    });
    document.querySelectorAll("[data-equip]").forEach((b) => b.onclick = () => equipItem(b.dataset.equip, b.dataset.target, b.dataset.subslot));
    document.getElementById("autoEquipOne")?.addEventListener("click", () => {
      autoEquipMonster(equipmentTarget);
      save.save();
      render();
    });
    document.getElementById("autoEquipParty")?.addEventListener("click", () => {
      save.state.party.forEach(autoEquipMonster);
      save.save();
      render();
    });
    document.querySelectorAll("[data-unequip]").forEach((b) => b.onclick = () => unequipItem(b.dataset.unequip));
    document.querySelectorAll("[data-favorite-equipment]").forEach((b) => b.onclick = () => {
      const i = save.state.equipment.find((x) => x.id === b.dataset.favoriteEquipment);
      if (!i) return;
      i.favorite = !i.favorite;
      save.save();
      render();
    });
    document.querySelectorAll("[data-lock-equipment]").forEach((b) => b.onclick = () => {
      const i = save.state.equipment.find((x) => x.id === b.dataset.lockEquipment);
      if (!i) return;
      i.locked = !i.locked;
      save.save();
      render();
    });
    document.querySelectorAll("[data-sell]").forEach((b) => b.onclick = () => sellItem(b.dataset.sell));
    document.querySelectorAll("[data-enhance-equipment]").forEach((b) => b.onclick = () => enhanceEquipment(b.dataset.enhanceEquipment));
    document.getElementById("bulkSellEquipment")?.addEventListener("click", bulkSellEquipment);
    document.querySelectorAll("[data-take-equipment]").forEach((b) => b.onclick = () => {
      const result = takeFromStorage(save.state, b.dataset.takeEquipment, b.dataset.storage);
      if (!result.ok) return alert(result.message);
      save.save();
      render();
    });
  }
  function preserveVitals(monster, beforeStats, beforeMp) {
    const oldHpMax = Math.max(1, beforeStats.hp), oldMpMax = Math.max(1, beforeMp);
    const hpWasZero = (monster.currentHp ?? oldHpMax) <= 0, mpWasZero = (monster.currentMp ?? oldMpMax) <= 0;
    normalizeEquipmentState();
    const afterStats = calculatedStats(monster), afterMp = maxMp(monster);
    if (hpWasZero) monster.currentHp = 0;
    else monster.currentHp = Math.max(1, Math.min(afterStats.hp, Math.round((monster.currentHp ?? oldHpMax) / oldHpMax * afterStats.hp)));
    if (mpWasZero) monster.currentMp = 0;
    else monster.currentMp = Math.max(0, Math.min(afterMp, Math.round((monster.currentMp ?? oldMpMax) / oldMpMax * afterMp)));
  }
  function togglePartyMember(id) {
    const has = save.state.party.includes(id), m = save.state.monsters.find((x) => x.id === id);
    if (has && save.state.party.length <= 1) return alert("\u6700\u4F4E1\u4F53\u5FC5\u8981");
    if (!has && save.state.party.length >= 4) return alert("\u7DE8\u6210\u306F4\u4F53\u307E\u3067");
    if (has) {
      const beforeStats = m ? calculatedStats(m) : null, beforeMp = m ? maxMp(m) : 1;
      Object.values(m?.equipment ?? {}).forEach((itemId) => {
        const item = save.state.equipment.find((i) => i.id === itemId);
        if (item) item.equippedBy = null;
      });
      if (m) {
        m.equipment = { weaponRight: null, weaponLeft: null, armorBody: null, armorSupport: null, accessoryNeck: null, accessoryFinger: null };
        preserveVitals(m, beforeStats, beforeMp);
      }
      save.state.party = save.state.party.filter((x) => x !== id);
    } else save.state.party.push(id);
    save.save();
  }
  function openHomePartyEditor() {
    const body = `<p class="muted">\u30BF\u30C3\u30D7\u3067\u51FA\u6483\uFF0F\u63A7\u3048\u3092\u5207\u308A\u66FF\u3048\u3002\u51FA\u6483\u306F1\u301C4\u4F53\u3002</p><div class="party-editor">${save.state.monsters.map((m) => `<button data-home-party-toggle="${m.id}" class="${save.state.party.includes(m.id) ? "selected" : ""}"><span>${SPECIES[m.speciesId].emoji}</span><b>${displayName(m)}</b><small>${save.state.party.includes(m.id) ? "\u51FA\u6483\u4E2D" : "\u63A7\u3048"} Lv.${m.level}</small></button>`).join("")}</div>`;
    app.insertAdjacentHTML("beforeend", Modal("\u30D1\u30FC\u30C6\u30A3\u30FC\u7DE8\u6210", body, "\u78BA\u5B9A"));
    document.querySelectorAll("[data-home-party-toggle]").forEach((b) => b.onclick = () => {
      togglePartyMember(b.dataset.homePartyToggle);
      document.querySelector(".game-modal").remove();
      openHomePartyEditor();
    });
    topModalButton().onclick = () => {
      document.querySelector(".game-modal").remove();
      render();
    };
  }
  function equipItem(itemId, monsterId, subslot) {
    const item = save.state.equipment.find((i) => i.id === itemId), monster = save.state.monsters.find((m) => m.id === monsterId);
    if (!item || !monster || !subslot) return;
    if (!save.state.party.includes(monsterId)) return alert("\u63A7\u3048\u30E2\u30F3\u30B9\u30BF\u30FC\u306B\u306F\u88C5\u5099\u3067\u304D\u307E\u305B\u3093\u3002");
    const beforeStats = calculatedStats(monster), beforeMp = maxMp(monster);
    if (item.equippedBy) {
      const old = save.state.monsters.find((m) => m.id === item.equippedBy);
      if (old) {
        for (const key of Object.keys(old.equipment ?? {})) if (old.equipment[key] === item.id) old.equipment[key] = null;
      }
    }
    const prior = monster.equipment[subslot];
    if (prior) {
      const oldItem = save.state.equipment.find((i) => i.id === prior);
      if (oldItem) oldItem.equippedBy = null;
    }
    monster.equipment[subslot] = item.id;
    item.equippedBy = monster.id;
    preserveVitals(monster, beforeStats, beforeMp);
    save.save();
    render();
  }
  function autoEquipMonster(monsterId) {
    const monster = save.state.monsters.find((m) => m.id === monsterId);
    if (!monster || !save.state.party.includes(monsterId)) return;
    const beforeStats = calculatedStats(monster), beforeMp = maxMp(monster), pairs = [["weaponRight", "weapon"], ["armorBody", "armor"], ["accessoryNeck", "accessory"], ["armorSupport", "armor"], ["accessoryFinger", "accessory"], ["weaponLeft", "weapon"]];
    for (const [subslot, slot] of pairs) {
      const unlock = { armorSupport: 25, accessoryFinger: 50, weaponLeft: 100 }[subslot] ?? 1;
      if (monster.level < unlock) continue;
      const candidates = save.state.equipment.filter((i) => i.slot === slot && (!i.equippedBy || i.equippedBy === monsterId) && !Object.values(monster.equipment ?? {}).includes(i.id)).sort((a, b) => equipmentPower(b) - equipmentPower(a));
      const best = candidates[0];
      if (!best) continue;
      const currentId = monster.equipment[subslot], current = save.state.equipment.find((i) => i.id === currentId);
      if (current && equipmentPower(current) >= equipmentPower(best)) continue;
      if (current) current.equippedBy = null;
      monster.equipment[subslot] = best.id;
      best.equippedBy = monsterId;
    }
    preserveVitals(monster, beforeStats, beforeMp);
  }
  function unequipItem(itemId) {
    const item = save.state.equipment.find((i) => i.id === itemId);
    if (!item?.equippedBy) return;
    const monster = save.state.monsters.find((m) => m.id === item.equippedBy);
    if (!monster) {
      item.equippedBy = null;
      save.save();
      return render();
    }
    const beforeStats = calculatedStats(monster), beforeMp = maxMp(monster);
    for (const key of Object.keys(monster.equipment ?? {})) if (monster.equipment[key] === item.id) monster.equipment[key] = null;
    item.equippedBy = null;
    preserveVitals(monster, beforeStats, beforeMp);
    save.save();
    render();
  }
  function sellItem(itemId) {
    const item = save.state.equipment.find((i) => i.id === itemId);
    if (!item || item.equippedBy || item.locked) return alert(item?.locked ? "\u30ED\u30C3\u30AF\u4E2D\u306F\u58F2\u5374\u3067\u304D\u306A\u3044" : "\u88C5\u5099\u4E2D\u306F\u58F2\u5374\u3067\u304D\u306A\u3044");
    const price = equipmentSellPrice(item);
    if (!confirm(`${item.name}\u3092${price}G\u3067\u58F2\u5374\u3059\u308B\uFF1F`)) return;
    save.state.equipment = save.state.equipment.filter((i) => i.id !== itemId);
    save.state.player.gold += price;
    save.save();
    render();
  }
  function localDayKey() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(/* @__PURE__ */ new Date());
  }
  function partyRecoveryNeed() {
    return save.state.party.reduce((total2, id) => {
      const m = save.state.monsters.find((x) => x.id === id);
      if (!m) return total2;
      const st = calculatedStats(m), mp = maxMp(m), hpMissing = Math.max(0, st.hp - (m.currentHp ?? st.hp)), mpMissing = Math.max(0, mp - (m.currentMp ?? mp)), ailments = (m.statuses?.length ?? 0) + (m.ailments?.length ?? 0) + (m.status ? 1 : 0);
      return total2 + hpMissing + mpMissing + ailments * 100;
    }, 0);
  }
  function healParty() {
    save.state.party.forEach((id) => {
      const m = save.state.monsters.find((x) => x.id === id);
      if (!m) return;
      m.currentHp = calculatedStats(m).hp;
      m.currentMp = maxMp(m);
      m.statuses = [];
      m.status = null;
      m.ailments = [];
    });
  }
  function openRest() {
    const key = localDayKey(), free = save.state.rest.lastFreeKey !== key, need = partyRecoveryNeed(), cost = Math.max(0, need * 5);
    if (need <= 0) {
      app.insertAdjacentHTML("beforeend", Modal("\u{1F4A4} \u3082\u3046\u5143\u6C17\u3060\u3088\uFF01", "<p>\u51FA\u6483\u30E1\u30F3\u30D0\u30FC\u306F\u5168\u54E1\u3001HP\u30FBMP\u3068\u3082\u306B\u6E80\u30BF\u30F3\u3067\u72B6\u614B\u7570\u5E38\u3082\u3042\u308A\u307E\u305B\u3093\u3002</p>", "\u9589\u3058\u308B"));
      topModalButton().onclick = closeTopModal;
      return;
    }
    app.insertAdjacentHTML("beforeend", Modal("\u{1F6CF}\uFE0F \u6DF1\u6DF5\u306E\u4F11\u606F", `<p>\u51FA\u6483\u30E1\u30F3\u30D0\u30FC\u306EHP\u30FBMP\u30FB\u72B6\u614B\u7570\u5E38\u3092\u5B8C\u5168\u56DE\u5FA9\u3057\u307E\u3059\u3002</p><div class="rest-price"><b>${free ? "\u672C\u65E51\u56DE \u7121\u6599" : `${cost.toLocaleString()}G`}</b><small>\u56DE\u5FA9\u5FC5\u8981\u91CF ${need.toLocaleString()} / \u6240\u6301 ${save.state.player.gold.toLocaleString()}G</small></div>`, free ? "\u7121\u6599\u3067\u4F11\u3080" : `${cost.toLocaleString()}G\u3067\u4F11\u3080`));
    const modal = topModal();
    modal.querySelector("#closeGameModal").onclick = () => {
      if (!free && save.state.player.gold < cost) return alert("GOLD\u304C\u8DB3\u308A\u306A\u3044");
      if (!confirm(free ? "\u672C\u65E5\u306E\u7121\u6599\u4F11\u606F\u3092\u4F7F\u3044\u307E\u3059\u304B\uFF1F" : `${cost.toLocaleString()}G\u3067\u4F11\u606F\u3057\u307E\u3059\u304B\uFF1F`)) return;
      if (free) save.state.rest.lastFreeKey = key;
      else save.state.player.gold -= cost;
      healParty();
      save.save();
      modal.remove();
      render();
    };
  }
  function rarityRoll(mode = "normal") {
    const r = Math.random();
    if (mode === "guaranteed") return r < 0.08 ? "LR" : r < 0.32 ? "SSR" : "SR";
    if (r < 2e-3) return "LR";
    if (r < 0.03) return "SSR";
    if (r < 0.15) return "SR";
    if (r < 0.48) return "R";
    return "N";
  }
  function summonOne({ guaranteedMonster = false, guaranteedRare = false } = {}) {
    const isMonster = guaranteedMonster || Math.random() < 0.3, rarity = rarityRoll(guaranteedRare ? "guaranteed" : "normal");
    if (isMonster) {
      const pool = Object.values(SPECIES).filter((s) => s.rarity !== "LR" && !(s.race === "dragon" && rarity !== "SSR" && rarity !== "LR")), speciesId = pool[Math.floor(Math.random() * pool.length)].id, stars = { N: 1, R: 1, SR: 2, SSR: 3, LR: 4 }[rarity], m = createMonster(speciesId, { stars, nickname: SPECIES[speciesId].name });
      m.summonRarity = rarity;
      save.state.monsters.push(m);
      return { type: "monster", rarity, name: displayName(m), icon: SPECIES[speciesId].emoji, item: m };
    }
    const slot = ["weapon", "armor", "accessory"][Math.floor(Math.random() * 3)], item = createEquipment(slot, { rarity });
    receiveEquipment(save.state, item);
    return { type: "equipment", rarity, name: item.name, icon: { weapon: "\u2694\uFE0F", armor: "\u{1F6E1}\uFE0F", accessory: "\u{1F48D}" }[slot], item };
  }
  function openGacha() {
    const key = localDayKey(), daily = save.state.gacha.lastDailyKey !== key, first = !save.state.gacha.firstTenUsed;
    const body = `<div class="gacha-menu">${first ? '<button data-gacha="first"><b>\u521D\u56DE\u9650\u5B9A \u7121\u659910\u9023</b><small>SR\u4EE5\u4E0A\u30E2\u30F3\u30B9\u30BF\u30FC1\u4F53\u78BA\u5B9A</small></button>' : ""}<button data-gacha="daily" ${daily ? "" : "disabled"}><b>1\u65E51\u56DE \u7121\u6599\u53EC\u559A</b><small>${daily ? "\u672C\u65E5\u5206\u3092\u5F15\u3051\u307E\u3059" : "\u672C\u65E5\u5206\u306F\u53EC\u559A\u6E08\u307F"}</small></button><button data-gacha="single"><b>\u5358\u767A\u53EC\u559A\u3000\u{1F48E}5</b><small>\u30E2\u30F3\u30B9\u30BF\u30FC30% / \u88C5\u509970%</small></button><button data-gacha="ten"><b>10\u9023\u53EC\u559A\u3000\u{1F48E}45</b><small>\u6700\u5F8C\u306E1\u67A0\u306FSR\u4EE5\u4E0A</small></button></div>`;
    app.insertAdjacentHTML("beforeend", Modal("\u{1F52E} \u6DF1\u6DF5\u53EC\u559A", body, "\u9589\u3058\u308B"));
    document.querySelectorAll("[data-gacha]").forEach((b) => b.onclick = () => performGacha(b.dataset.gacha));
    topModalButton().onclick = () => {
      const mods = document.querySelectorAll(".game-modal");
      mods[mods.length - 1]?.remove();
    };
  }
  function performGacha(type) {
    let count = 1, cost = 0;
    if (type === "first") {
      if (save.state.gacha.firstTenUsed) return;
      count = 10;
      save.state.gacha.firstTenUsed = true;
    } else if (type === "daily") {
      const key = localDayKey();
      if (save.state.gacha.lastDailyKey === key) return;
      save.state.gacha.lastDailyKey = key;
    } else if (type === "single") cost = 5;
    else if (type === "ten") {
      cost = 45;
      count = 10;
    }
    if (save.state.player.crystals < cost) return alert("\u9B54\u6676\u77F3\u304C\u8DB3\u308A\u306A\u3044");
    save.state.player.crystals -= cost;
    const results = [];
    for (let i = 0; i < count; i++) {
      const last = i === count - 1;
      results.push(summonOne({ guaranteedMonster: type === "first" && last, guaranteedRare: (type === "first" || type === "ten") && last }));
    }
    save.save();
    document.querySelector(".game-modal")?.remove();
    app.insertAdjacentHTML("beforeend", Modal("\u53EC\u559A\u7D50\u679C", `<div class="gacha-results">${results.map((r) => `<div class="rarity-${r.rarity}"><span>${r.icon}</span><b>[${r.rarity}] ${r.name}</b><small>${r.type === "monster" ? "\u30E2\u30F3\u30B9\u30BF\u30FC" : "\u88C5\u5099"} NEW</small></div>`).join("")}</div>${type === "first" ? '<p class="muted">\u7DE8\u6210\u304B\u3089\u65B0\u3057\u3044\u4EF2\u9593\u3092\u51FA\u6483\u3055\u305B\u3088\u3046\u3002</p>' : ""}`, "\u30DB\u30FC\u30E0\u3078"));
    topModalButton().onclick = () => {
      document.querySelector(".game-modal").remove();
      render();
    };
  }
  function enhanceEquipment(id) {
    const item = save.state.equipment.find((i) => i.id === id);
    if (!item || item.plus >= 10) return;
    const rarityCost = { N: 80, R: 140, SR: 260, SSR: 480, LR: 900 }[item.rarity], cost = rarityCost * (item.plus + 1);
    if (save.state.player.gold < cost) return alert(`\u5F37\u5316\u306B\u306F${cost}G\u5FC5\u8981`);
    if (!confirm(`${item.name}\u3092 +${item.plus + 1}\u3078\u5F37\u5316\u3059\u308B\uFF1F
\u8CBB\u7528 ${cost}G`)) return;
    save.state.player.gold -= cost;
    item.plus++;
    save.save();
    render();
  }
  function bulkSellEquipment() {
    const targets = save.state.equipment.filter((i) => !i.equippedBy && !i.locked && !i.favorite && ["N", "R"].includes(i.rarity));
    if (!targets.length) return alert("\u58F2\u5374\u5BFE\u8C61\u304C\u3042\u308A\u307E\u305B\u3093");
    const total2 = targets.reduce((n, i) => n + equipmentSellPrice(i), 0);
    if (!confirm(`${targets.length}\u500B\u3092\u4E00\u62EC\u58F2\u5374\u3057\u3066 ${total2}G\u7372\u5F97\u3059\u308B\uFF1F`)) return;
    const ids = new Set(targets.map((i) => i.id));
    save.state.equipment = save.state.equipment.filter((i) => !ids.has(i.id));
    save.state.player.gold += total2;
    save.save();
    render();
  }
  function releaseMonster(m) {
    if (save.state.party.includes(m.id)) return alert("\u51FA\u6483\u4E2D\u306E\u30E2\u30F3\u30B9\u30BF\u30FC\u306F\u89E3\u653E\u3067\u304D\u307E\u305B\u3093");
    if (m.favorite || m.locked) return alert("\u304A\u6C17\u306B\u5165\u308A\u30FB\u30ED\u30C3\u30AF\u4E2D\u306F\u89E3\u653E\u3067\u304D\u307E\u305B\u3093");
    if (save.state.monsters.length <= 1) return alert("\u6700\u5F8C\u306E1\u4F53\u306F\u89E3\u653E\u3067\u304D\u307E\u305B\u3093");
    if (!confirm(`${displayName(m)}\u3092\u89E3\u653E\u3059\u308B\uFF1F
\u9B42\u3068\u3057\u3066\u9B54\u6676\u77F31\u500B\u3092\u7372\u5F97\u3057\u307E\u3059\u3002`)) return;
    Object.values(m.equipment ?? {}).forEach((id) => {
      const i = save.state.equipment.find((x) => x.id === id);
      if (i) i.equippedBy = null;
    });
    save.state.monsters = save.state.monsters.filter((x) => x.id !== m.id);
    save.state.player.crystals++;
    save.save();
    go("monsters");
  }
  function partySynergy() {
    const counts = {};
    save.state.party.map((id) => save.state.monsters.find((m) => m.id === id)).filter(Boolean).forEach((m) => {
      const e = SPECIES[m.speciesId].element ?? "neutral";
      counts[e] = (counts[e] ?? 0) + 1;
    });
    const [element, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] ?? [null, 0];
    if (count < 3) return null;
    const effects = { fire: { name: "\u{1F525} \u706B\u306E\u5171\u9CF4", atk: count >= 4 ? 0.3 : 0.2 }, water: { name: "\u{1F4A7} \u6C34\u306E\u5171\u9CF4", regen: count >= 4 ? 0.05 : 0.03 }, dark: { name: "\u{1F311} \u95C7\u306E\u5171\u9CF4", crit: count >= 4 ? 20 : 15 }, light: { name: "\u2728 \u5149\u306E\u5171\u9CF4", def: count >= 4 ? 0.2 : 0.12 }, poison: { name: "\u2620\uFE0F \u6BD2\u306E\u5171\u9CF4", atk: count >= 4 ? 0.18 : 0.1 } };
    return effects[element] ? { element, count, ...effects[element] } : null;
  }
  function clearPartySynergy() {
    save.state.monsters.forEach((m) => delete m._synergy);
  }
  function bindShop() {
    var _a;
    (_a = save.state).shop ?? (_a.shop = {});
    if (save.state.shop.discount == null) {
      const roll = Math.random();
      save.state.shop.discount = roll < 0.01 ? 90 : roll < 0.04 ? 70 : roll < 0.1 ? 50 : roll < 0.24 ? 30 : roll < 0.48 ? 10 : 0;
      save.save();
    }
    document.getElementById("leaveShop").onclick = () => {
      save.state.shop.discount = null;
      save.save();
      go("explore");
    };
    document.querySelectorAll("[data-shop-menu]").forEach((b) => b.onclick = () => openShopMenu(b.dataset.shopMenu));
  }
  function shopPrice(base) {
    const d = save.state.shop?.discount ?? 0;
    return Math.max(1, Math.floor(base * (1 - d / 100)));
  }
  function openShopMenu(type) {
    if (type === "bed") return buyShopItem("bed", 180);
    const items = type === "herb" ? [
      ["potions", "\u2764\uFE0F", "\u5358\u4F53\u56DE\u5FA9\u85AC", "HP100\u56DE\u5FA9", 160],
      ["partyPotions", "\u{1F49A}", "\u5168\u4F53\u56DE\u5FA9\u85AC", "\u5168\u54E1HP50\u56DE\u5FA9", 520],
      ["statusCures", "\u{1FA79}", "\u72B6\u614B\u7570\u5E38\u56DE\u5FA9\u30FB\u5358\u4F53", "\u5358\u4F53\u306E\u7570\u5E38\u89E3\u9664", 300],
      ["partyStatusCures", "\u{1F4A8}", "\u72B6\u614B\u7570\u5E38\u56DE\u5FA9\u30FB\u5168\u4F53", "\u5168\u54E1\u306E\u7570\u5E38\u89E3\u9664", 980],
      ["fullHeals", "\u2728", "\u5B8C\u5168\u56DE\u5FA9\u85AC\u30FB\u5358\u4F53", "HP\u30FBMP\u30FB\u7570\u5E38\u3092\u5168\u56DE\u5FA9", 1800],
      ["partyFullHeals", "\u{1F31F}", "\u5B8C\u5168\u56DE\u5FA9\u85AC\u30FB\u5168\u4F53", "\u5168\u54E1\u3092\u5B8C\u5168\u56DE\u5FA9", 6500]
    ] : type === "capture" ? [
      ["captureCrystals", "\u{1F48E}", "\u6355\u7372\u7D50\u6676", "\u6A19\u6E96\u6355\u7372\u7D50\u6676", 420],
      ["captureCrystals", "\u{1F4A0}", "\u6355\u7372\u7D50\u6676 3\u500B", "\u307E\u3068\u3081\u8CB7\u3044", 1150]
    ] : [
      ["gear-normal", "\u{1FAB5}", "\u901A\u5E38\u88C5\u5099\u53EC\u559A", "N\u301CSR\u4E2D\u5FC3", 900],
      ["gear-advanced", "\u{1F7E3}", "\u4E0A\u7D1A\u88C5\u5099\u53EC\u559A", "R\u301CSSR\u4E2D\u5FC3", 3200],
      ["gear-mythic", "\u{1F308}", "\u795E\u8A71\u88C5\u5099\u53EC\u559A", "SR\u4EE5\u4E0A\u78BA\u5B9A", 12e3]
    ];
    const title = type === "herb" ? "\u{1F33F} \u85AC\u8349\u5C4B" : type === "capture" ? "\u{1F48E} \u6355\u7372\u5546\u4EBA" : `\u{1F3B0} \u88C5\u5099\u53EC\u559A ${save.state.shop.discount ? `${save.state.shop.discount}%OFF` : ""}`;
    const body = `<div class="shop-list">${items.map(([id, icon, name, desc, base]) => {
      const price = type === "gear" ? shopPrice(base) : base;
      return `<button data-shop-buy="${id}" data-shop-price="${price}"><span>${icon}</span><b>${name}</b><small>${desc}</small><em>${price}G</em></button>`;
    }).join("")}</div>`;
    app.insertAdjacentHTML("beforeend", Modal(title, body, "\u9589\u3058\u308B"));
    document.querySelectorAll("[data-shop-buy]").forEach((b) => b.onclick = () => buyShopItem(b.dataset.shopBuy, Number(b.dataset.shopPrice)));
    topModalButton().onclick = closeTopModal;
  }
  function buyShopItem(type, cost) {
    if (save.state.player.gold < cost) return purchaseResult("\u8CFC\u5165\u5931\u6557", "GOLD\u304C\u8DB3\u308A\u306A\u3044\u3002");
    save.state.player.gold -= cost;
    save.state.records.purchases++;
    let title = "", body = "";
    if (type === "bed") {
      const before = save.state.party.reduce((n, id) => {
        const m = save.state.monsters.find((x) => x.id === id);
        return n + (m.currentHp ?? calculatedStats(m).hp);
      }, 0);
      save.state.party.forEach((id) => {
        const m = save.state.monsters.find((x) => x.id === id);
        m.currentHp = calculatedStats(m).hp;
        m.currentMp = maxMp(m);
      });
      const after = save.state.party.reduce((n, id) => n + calculatedStats(save.state.monsters.find((x) => x.id === id)).hp, 0);
      title = "\u5168\u56DE\u5FA9\uFF01";
      body = `\u30D1\u30FC\u30C6\u30A3\u30FCHP ${before} \u2192 ${after}`;
    } else if (type.startsWith("gear-")) {
      const rarity = type === "gear-mythic" ? Math.random() < 0.15 ? "LR" : "SSR" : type === "gear-advanced" ? Math.random() < 0.16 ? "SSR" : Math.random() < 0.55 ? "SR" : "R" : void 0;
      const item = createEquipment(["weapon", "armor", "accessory"][Math.floor(Math.random() * 3)], rarity ? { rarity } : {}), receipt = equipmentReceipt(item);
      title = `[${item.rarity}] ${item.name}`;
      body = `${slotLabel(item.slot)} / ${Object.entries(item.stats).map(([k, v]) => `${equipmentStatLabel(k)}+${v}`).join(" / ")}<br>${receipt.message}`;
    } else {
      const amount = type === "captureCrystals" && cost > 500 ? 3 : 1;
      save.state.inventory[type] = (save.state.inventory[type] ?? 0) + amount;
      title = "\u8CFC\u5165\u5B8C\u4E86";
      body = `${amount}\u500B\u8CFC\u5165\uFF0F\u6240\u6301\u6570 ${save.state.inventory[type]}`;
    }
    save.save();
    document.querySelector(".game-modal")?.remove();
    render();
    purchaseResult(title, body);
  }
  function equipmentReceipt(item, options = {}) {
    const result = receiveEquipment(save.state, item, options);
    return { ...result, item, label: `[${item.rarity}] ${item.name}`, slot: slotLabel(item.slot) };
  }
  function equipmentReceiptText(receipt) {
    if (receipt.location === "inventory") return `${receipt.label}\uFF08${receipt.slot}\uFF09\u3092\u7372\u5F97`;
    if (receipt.location === "reserve") return `${receipt.label}<br>${receipt.message}`;
    if (receipt.location === "bossVault") return `${receipt.label}<br>${receipt.message}`;
    return `${receipt.label}<br>${receipt.message}`;
  }
  function purchaseResult(title, body) {
    app.insertAdjacentHTML("beforeend", Modal(title, `<div class="reward-icon">\u2728</div><p>${body}</p>`));
    topModalButton().onclick = closeTopModal;
  }
  function createInputState() {
    return { pts: /* @__PURE__ */ new Map(), last: null, pinch: null, drag: false, tap: 0 };
  }
  function seeded(seed) {
    let n = seed >>> 0;
    return () => {
      n = n * 1664525 + 1013904223 >>> 0;
      return n / 4294967296;
    };
  }
  function floorSeed(floor) {
    const seeds = save.state.player.floorSeeds;
    seeds[floor] ?? (seeds[floor] = Math.floor(Math.random() * 2147483647));
    save.save();
    return seeds[floor];
  }
  function floorConfig(floor, rng) {
    const tier = Math.min(9, Math.floor((floor - 1) / 10));
    const min = 11 + Math.min(8, tier), max = Math.min(31, 17 + tier * 2);
    let cols = min + Math.floor(rng() * (max - min + 1)) | 1, rows = min + Math.floor(rng() * (max - min + 1)) | 1;
    const roll = rng();
    const shape = roll < 0.66 ? "cave" : roll < 0.78 ? "maze" : roll < 0.88 ? "open" : roll < 0.94 ? "square" : "ring";
    if (shape === "open") {
      cols = Math.max(cols, 19);
      rows = Math.max(rows, 19);
    }
    if (shape === "square") {
      const s = Math.min(cols, rows) | 1;
      cols = s;
      rows = s;
    }
    return { cols, rows, shape };
  }
  function maze() {
    const floor = save.state.player.currentFloor, rng = seeded(floorSeed(floor));
    if (floor % 10 === 0) {
      const cols2 = 15, rows2 = 23, tiles2 = Array.from({ length: rows2 }, () => Array(cols2).fill(1)), cx = Math.floor(cols2 / 2);
      for (let y = 2; y < rows2 - 2; y++) for (let x = cx - 1; x <= cx + 1; x++) tiles2[y][x] = 0;
      for (let y = 2; y <= 7; y++) for (let x = 2; x < cols2 - 2; x++) tiles2[y][x] = 0;
      const start = { x: cx, y: rows2 - 3 }, boss2 = { x: cx, y: 5, active: true }, exit2 = { x: cx, y: 2 };
      return { cols: cols2, rows: rows2, shape: "bossCorridor", tiles: tiles2, start, exit: exit2, shop: null, boss: boss2, chests: [], treasureRoom: false, steps: 0, nextEncounter: 999999, encountering: false };
    }
    const cfg = floorConfig(floor, rng), { cols, rows, shape } = cfg;
    let tiles = Array.from({ length: rows }, () => Array(cols).fill(1));
    const inside = (x, y) => x > 0 && y > 0 && x < cols - 1 && y < rows - 1;
    const carveBlob = (x, y, r = 1) => {
      for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (inside(x + xx, y + yy) && xx * xx + yy * yy <= r * r + r) tiles[y + yy][x + xx] = 0;
    };
    const center = { x: Math.floor(cols / 2), y: Math.floor(rows / 2) };
    if (shape === "open" || shape === "square") {
      const margin = shape === "square" ? 2 : 1 + Math.floor(rng() * 3);
      for (let y = margin; y < rows - margin; y++) for (let x = margin; x < cols - margin; x++) tiles[y][x] = 0;
      const holes = Math.floor(cols * rows * (shape === "open" ? 0.035 : 0.018));
      for (let i = 0; i < holes; i++) {
        const x = 2 + Math.floor(rng() * (cols - 4)), y = 2 + Math.floor(rng() * (rows - 4));
        if (rng() < 0.7) tiles[y][x] = 1;
      }
    } else if (shape === "ring") {
      for (let y = 2; y < rows - 2; y++) for (let x = 2; x < cols - 2; x++) {
        const dx = (x - center.x) / (cols * 0.42), dy = (y - center.y) / (rows * 0.42), d = dx * dx + dy * dy;
        if (d < 1 && d > 0.22) tiles[y][x] = 0;
      }
      carveBlob(center.x, 2, 2);
      carveBlob(center.x, rows - 3, 2);
    } else if (shape === "maze") {
      let carve = function(x, y) {
        tiles[y][x] = 0;
        for (const [dx, dy] of [[2, 0], [-2, 0], [0, 2], [0, -2]].sort(() => rng() - 0.5)) {
          const nx = x + dx, ny = y + dy;
          if (inside(nx, ny) && tiles[ny][nx]) {
            tiles[y + dy / 2][x + dx / 2] = 0;
            carve(nx, ny);
          }
        }
      };
      carve(1, 1);
      for (let i = 0; i < Math.floor(cols * rows / 45); i++) {
        const x = 1 + Math.floor(rng() * (cols - 2)), y = 1 + Math.floor(rng() * (rows - 2));
        if (!tiles[y][x]) carveBlob(x, y, rng() > 0.75 ? 2 : 1);
      }
    } else {
      let x = center.x, y = center.y;
      carveBlob(x, y, 2);
      const target = Math.floor(cols * rows * (0.38 + rng() * 0.18));
      let guard = target * 25;
      while (tiles.flat().filter((v) => v === 0).length < target && guard-- > 0) {
        const d = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(rng() * 4)];
        x = Math.max(2, Math.min(cols - 3, x + d[0]));
        y = Math.max(2, Math.min(rows - 3, y + d[1]));
        carveBlob(x, y, rng() < 0.08 ? 2 : rng() < 0.32 ? 1 : 0);
      }
      const rooms = 2 + Math.floor(rng() * 5);
      for (let i = 0; i < rooms; i++) {
        const tx = 2 + Math.floor(rng() * (cols - 4)), ty = 2 + Math.floor(rng() * (rows - 4));
        carveBlob(tx, ty, 1 + Math.floor(rng() * 3));
        while (x !== tx || y !== ty) {
          if (rng() < 0.5 && x !== tx) x += Math.sign(tx - x);
          else if (y !== ty) y += Math.sign(ty - y);
          else x += Math.sign(tx - x);
          carveBlob(x, y, rng() < 0.25 ? 1 : 0);
        }
      }
    }
    const cells = [];
    for (let y = 1; y < rows - 1; y++) for (let x = 1; x < cols - 1; x++) if (!tiles[y][x]) cells.push({ x, y });
    if (cells.length < 2) {
      tiles[1][1] = 0;
      tiles[rows - 2][cols - 2] = 0;
      cells.push({ x: 1, y: 1 }, { x: cols - 2, y: rows - 2 });
    }
    const distance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y), startCell = cells[Math.floor(rng() * cells.length)], exit = cells.reduce((a, c) => distance(c, startCell) > distance(a, startCell) ? c : a, cells[0]);
    const reserved = (c) => distance(c, startCell) <= 4 || distance(c, exit) <= 4, candidates = cells.filter((c) => !reserved(c)), used = /* @__PURE__ */ new Set([`${startCell.x},${startCell.y}`, `${exit.x},${exit.y}`]);
    const pick = () => {
      const available = candidates.filter((c) => !used.has(`${c.x},${c.y}`)), pool = available.length ? available : candidates.length ? candidates : cells, p = { ...pool[Math.floor(rng() * pool.length)] };
      used.add(`${p.x},${p.y}`);
      return p;
    };
    const opened = save.state.player.openedChests[floor] ?? [], chests = [], treasureRoom = rng() < 0.025, count = treasureRoom ? 6 + Math.floor(rng() * 3) : rng() < 0.16 ? 0 : rng() < 0.72 ? 1 : 2;
    for (let i = 0; i < count; i++) {
      const roll = rng(), kind = treasureRoom ? roll > 0.55 ? "radiant" : "cabinet" : roll > 0.96 ? "radiant" : roll > 0.78 ? "cabinet" : roll > 0.25 ? "box" : "apple", locked = kind === "radiant" && rng() < 0.45, mimic = treasureRoom && rng() < 0.5, emoji2 = mimic ? "\u{1F9F0}" : locked ? "\u{1F512}" : { apple: "\u{1FA8E}", box: "\u{1F4E6}", cabinet: "\u{1F5C3}\uFE0F", radiant: "\u2728\u{1F4E6}" }[kind], p = pick();
      chests.push({ ...p, id: `${floor}-${i}`, kind, emoji: emoji2, locked, mimic, open: opened.includes(`${floor}-${i}`) });
    }
    const shopChance = floor % 10 === 0 ? 0.35 : 0.09, shop = rng() < shopChance ? { ...pick(), active: true } : null;
    if (shop) save.state.player.nextShopFloor = floor + 3 + Math.floor(rng() * 8);
    const boss = floor % 10 === 0 ? { ...pick(), active: true } : null;
    return { cols, rows, shape, tiles, start: startCell, exit: { ...exit }, shop, boss, chests, treasureRoom, steps: 0, nextEncounter: 10 + Math.floor(rng() * 23), encountering: false };
  }
  function currentSnapshot() {
    game.world.encountering = false;
    game.player.path = [];
    game.player.p = 0;
    game.player.rx = game.player.x;
    game.player.ry = game.player.y;
    return { world: game.world, player: game.player, cameraData: { x: game.camera.x, y: game.camera.y, z: game.camera.z, ox: game.camera.ox, oy: game.camera.oy, manual: game.camera.manual } };
  }
  function bindExplore() {
    const canvas = document.getElementById("gameCanvas"), r = canvas.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    canvas.width = r.width * d;
    canvas.height = r.height * d;
    const mini = document.getElementById("miniMap");
    mini.width = 132 * d;
    mini.height = 132 * d;
    game = snapshot ?? { world: maze(), player: null, camera: null, paused: false, running: true, input: createInputState() };
    game.input = createInputState();
    game.player ?? (game.player = new Entity(game.world.start.x, game.world.start.y));
    game.world.encountering = false;
    game.player.path = [];
    game.player.p = 0;
    if (!Number.isFinite(game.player.x) || !Number.isFinite(game.player.y)) {
      game.player.x = game.world.start.x;
      game.player.y = game.world.start.y;
    }
    game.player.rx = game.player.x;
    game.player.ry = game.player.y;
    game.camera = new Camera(canvas);
    if (snapshot?.cameraData) Object.assign(game.camera, snapshot.cameraData);
    else game.camera.reset(game.player.x * TILE, game.player.y * TILE);
    game.camera.clamp(game.world);
    game.ctx = canvas.getContext("2d");
    game.running = true;
    game.paused = false;
    bindInput(canvas);
    game.last = performance.now();
    requestAnimationFrame(loop);
    bindMovableMapToggle();
    bindExploreMonsterLongPress();
    showFloorTutorial();
    document.getElementById("centerCamera").onclick = () => {
      game.camera.reset(game.player.rx * TILE, game.player.ry * TILE);
      game.camera.clamp(game.world);
    };
    document.getElementById("pauseParty").onclick = openPartyEditor;
    document.getElementById("fieldEquipment").onclick = () => {
      snapshot = currentSnapshot();
      stopGame();
      navigationOrigin = "explore";
      go("equipment");
    };
    document.getElementById("pauseItems").onclick = openFieldItems;
    document.getElementById("returnHome").onclick = () => {
      if (confirm(`${save.state.player.currentFloor}\u968E\u304B\u3089\u5E30\u9084\u3059\u308B\uFF1F
\u6B21\u56DE\u306F\u5230\u9054\u6E08\u307F\u306E\u968E\u3092\u9078\u3093\u3067\u518D\u958B\u3067\u304D\u307E\u3059\u3002`)) {
        stopGame();
        snapshot = null;
        save.state.player.inRun = false;
        save.save();
        go("home");
      }
    };
  }
  function showFloorTutorial() {
    const floor = save.state.player.currentFloor;
    if (floor < 1 || floor > 5 || save.state.settings.tutorialSeen?.[floor]) return;
    const tutorials = { 1: ["\u6226\u95D8\u306E\u57FA\u672C", "\u307E\u305A\u306F\u6B69\u3044\u3066\u6575\u3068\u906D\u9047\u3057\u3088\u3046\u3002\u300E\u305F\u305F\u304B\u3046\u300F\u300E\u30B9\u30AD\u30EB\u300F\u300E\u30AC\u30FC\u30C9\u300F\u3092\u4F7F\u3044\u5206\u3051\u3001\u30B9\u30E9\u30A4\u30E0Lv.1\u3092\u5012\u3057\u3066\u6700\u521D\u306E\u30EC\u30D9\u30EB\u3092\u4E0A\u3052\u3088\u3046\u3002"], 2: ["\u6355\u7372", "\u6575\u306FHP\u3092\u6E1B\u3089\u3059\u307B\u3069\u6355\u7372\u3057\u3084\u3059\u304F\u306A\u308B\u3002\u6355\u7372\u7D50\u6676\u306B\u306F\u9650\u308A\u304C\u3042\u308B\u306E\u3067\u3001\u6B32\u3057\u3044\u76F8\u624B\u3092\u5F31\u3089\u305B\u3066\u304B\u3089\u4F7F\u304A\u3046\u3002"], 3: ["\u7DE8\u6210", "\u6355\u307E\u3048\u305F\u4EF2\u9593\u306F\u300E\u7DE8\u6210\u300F\u304B\u3089\u51FA\u6483\u3067\u304D\u308B\u3002\u6700\u59274\u4F53\u307E\u3067\u3002\u5012\u308C\u305F\u4EF2\u9593\u306B\u306FEXP\u304C\u5165\u3089\u305A\u3001\u751F\u5B58\u8005\u3078\u518D\u5206\u914D\u3055\u308C\u308B\u3002"], 4: ["\u88C5\u5099", "\u6B66\u5668\u30FB\u9632\u5177\u30FB\u30A2\u30AF\u30BB\u3067\u80FD\u529B\u304C\u5909\u308F\u308B\u3002\u300E\u88C5\u5099\u300F\u306E\u81EA\u52D5\u88C5\u5099\u3082\u4F7F\u3048\u308B\u304C\u3001\u5F79\u5272\u306B\u5408\u308F\u305B\u305F\u624B\u52D5\u8ABF\u6574\u3082\u5F37\u529B\u3002"], 5: ["\u8907\u6570\u306E\u6575", "\u3053\u306E\u968E\u304B\u3089\u6575\u304C2\u4F53\u3067\u73FE\u308C\u308B\u3053\u3068\u304C\u3042\u308B\u3002\u6575\u3092\u30BF\u30C3\u30D7\u3057\u3066\u653B\u6483\u5BFE\u8C61\u3092\u5909\u66F4\u3057\u3001\u5371\u967A\u306A\u76F8\u624B\u304B\u3089\u5012\u305D\u3046\u3002"] };
    const [title, body] = tutorials[floor];
    game.paused = true;
    setTimeout(() => {
      app.insertAdjacentHTML("beforeend", Modal(`${floor}\u968E\u30C1\u30E5\u30FC\u30C8\u30EA\u30A2\u30EB\uFF1A${title}`, `<p>${body}</p><p class="muted">\u3053\u306E\u8AAC\u660E\u306F\u521D\u56DE\u3060\u3051\u8868\u793A\u3055\u308C\u3001\u8A2D\u5B9A\u304B\u3089\u518D\u78BA\u8A8D\u3067\u304D\u307E\u3059\u3002</p>`, `\u63A2\u7D22\u958B\u59CB`));
      topModalButton().onclick = () => {
        save.state.settings.tutorialSeen[floor] = true;
        save.save();
        document.querySelector(".game-modal").remove();
        game.paused = false;
      };
    }, 120);
  }
  function exploreMonsterDetail(id) {
    const m = save.state.monsters.find((x) => x.id === id);
    if (!m) return;
    const st = calculatedStats(m), need = expNeed(m), remain = Math.max(0, need - m.exp), gear = Object.entries(m.equipment ?? {}).map(([slot, itemId]) => `${slotLabel(slot)}\uFF1A${save.state.equipment.find((i) => i.id === itemId)?.name ?? "\u306A\u3057"}`).join("<br>");
    app.insertAdjacentHTML("beforeend", Modal(`${SPECIES[m.speciesId].emoji} ${displayName(m)}`, `<div class="explore-detail"><p><b>Lv.${m.level}\u3000\u2605${m.stars}\u3000+${m.plus}</b></p><p>HP ${m.currentHp ?? st.hp}/${st.hp}<br>MP ${m.currentMp ?? maxMp(m)}/${maxMp(m)}<br>ATK ${st.atk} / DEF ${st.def} / SPD ${st.spd}<br>\u4F1A\u5FC3 ${st.crit}% / \u56DE\u907F ${st.evasion}%<br><b>${SPECIES[m.speciesId].race}\u65CF / ${SPECIES[m.speciesId].role}</b><br>\u7279\u6027\uFF1A${TRAITS[m.traitId]?.name ?? "\u5B89\u5B9A"}\uFF08${TRAITS[m.traitId]?.description ?? ""}\uFF09</p><p><b>EXP ${m.exp.toLocaleString()} / ${need.toLocaleString()}</b><br><small>\u6B21\u306E\u30EC\u30D9\u30EB\u307E\u3067\u3042\u3068 ${remain.toLocaleString()}</small></p><p>${gear}</p><p><b>\u30B9\u30AD\u30EB</b><br>${learnedSkills(m).map((x) => `${x.name}\uFF08MP${x.mp}\uFF09`).join("<br>") || "\u306A\u3057"}</p></div>`, `\u9589\u3058\u308B`));
    topModalButton().onclick = () => {
      const mods = document.querySelectorAll(".game-modal");
      mods[mods.length - 1]?.remove();
    };
  }
  function bindExploreMonsterLongPress() {
    document.querySelectorAll("[data-explore-monster]").forEach((el) => el.onclick = () => exploreMonsterDetail(el.dataset.exploreMonster));
  }
  function bindMovableMapToggle() {
    const b = document.getElementById("miniMapToggle"), stage = document.querySelector(".explore-stage");
    if (!b || !stage) return;
    let timer = null, drag = false, offset = { x: 0, y: 0 };
    const place = (e) => {
      const r = stage.getBoundingClientRect(), br = b.getBoundingClientRect(), x = Math.max(4, Math.min(r.width - br.width - 4, e.clientX - r.left - offset.x)), y = Math.max(4, Math.min(r.height - br.height - 4, e.clientY - r.top - offset.y));
      b.style.left = `${x}px`;
      b.style.top = `${y}px`;
      b.style.right = "auto";
      save.state.settings.mapTogglePosition = { x: Math.round(x), y: Math.round(y) };
    };
    b.onpointerdown = (e) => {
      const br = b.getBoundingClientRect();
      offset = { x: e.clientX - br.left, y: e.clientY - br.top };
      timer = setTimeout(() => {
        drag = true;
        navigator.vibrate?.(20);
        b.classList.add("dragging");
        b.setPointerCapture?.(e.pointerId);
      }, 420);
    };
    b.onpointermove = (e) => {
      if (drag) place(e);
    };
    b.onpointerup = (e) => {
      clearTimeout(timer);
      if (drag) {
        place(e);
        save.save();
        drag = false;
        b.classList.remove("dragging");
        return;
      }
      save.state.settings.minimapVisible = !save.state.settings.minimapVisible;
      save.save();
      b.textContent = save.state.settings.minimapVisible ? "MAP ON" : "MAP OFF";
    };
    b.onpointercancel = () => {
      clearTimeout(timer);
      drag = false;
      b.classList.remove("dragging");
    };
  }
  function itemCount(type) {
    return save.state.inventory[type] ?? 0;
  }
  function openFieldItems() {
    game.paused = true;
    const items = [["potions", "\u2764\uFE0F", "\u5358\u4F53\u56DE\u5FA9", "HP100\u56DE\u5FA9"], ["partyPotions", "\u{1F49A}", "\u5168\u4F53\u56DE\u5FA9", "\u5168\u54E1HP50\u56DE\u5FA9"], ["statusCures", "\u{1FA79}", "\u72B6\u614B\u7570\u5E38\u56DE\u5FA9\u30FB\u5358\u4F53", "\u5358\u4F53\u306E\u72B6\u614B\u7570\u5E38\u3092\u89E3\u9664"], ["partyStatusCures", "\u{1F4A8}", "\u72B6\u614B\u7570\u5E38\u56DE\u5FA9\u30FB\u5168\u4F53", "\u5168\u54E1\u306E\u72B6\u614B\u7570\u5E38\u3092\u89E3\u9664"], ["fullHeals", "\u2728", "\u5168\u56DE\u5FA9\uFF0B\u7570\u5E38\u56DE\u5FA9\u30FB\u5358\u4F53", "\u5358\u4F53\u3092\u5B8C\u5168\u56DE\u5FA9"], ["partyFullHeals", "\u{1F31F}", "\u5168\u56DE\u5FA9\uFF0B\u7570\u5E38\u56DE\u5FA9\u30FB\u5168\u4F53", "\u5168\u54E1\u3092\u5B8C\u5168\u56DE\u5FA9"]], targets = save.state.party.map((id) => save.state.monsters.find((m) => m.id === id)).filter(Boolean);
    let targetId = targets[0]?.id;
    const body = `<p class="muted">\u30BF\u30C3\u30D7\u3067\u4F7F\u7528\u5BFE\u8C61\u3092\u9078\u629E\uFF0F\u9577\u62BC\u3057\u3067\u8A73\u7D30</p><div class="modal-party-vitals selectable">${targets.map((m, i) => {
      const st = calculatedStats(m);
      return `<button class="${i === 0 ? "selected" : ""}" data-field-target="${m.id}"><b>${displayName(m)} Lv.${m.level}</b><small>HP ${m.currentHp ?? st.hp}/${st.hp}\u3000MP ${m.currentMp ?? maxMp(m)}/${maxMp(m)}</small></button>`;
    }).join("")}</div><div class="field-item-grid">${items.filter(([id]) => itemCount(id) > 0).map(([id, icon, name, desc]) => `<button data-field-item="${id}"><span>${icon}</span><b>${name}</b><small>${desc}</small><em>\xD7${itemCount(id)}</em></button>`).join("") || '<div class="empty">\u4F7F\u7528\u3067\u304D\u308B\u30A2\u30A4\u30C6\u30E0\u3092\u6301\u3063\u3066\u3044\u307E\u305B\u3093</div>'}</div>`;
    app.insertAdjacentHTML("beforeend", Modal("\u6301\u3061\u7269", body, "\u9589\u3058\u308B"));
    const modal = topModal();
    modal.querySelectorAll("[data-field-target]").forEach((el) => {
      let timer, moved = false;
      const cancel = () => {
        clearTimeout(timer);
        timer = null;
      };
      el.onpointerdown = () => {
        moved = false;
        timer = setTimeout(() => {
          timer = null;
          exploreMonsterDetail(el.dataset.fieldTarget);
        }, 520);
      };
      el.onpointermove = () => moved = true;
      el.onpointerup = () => {
        if (timer && !moved) {
          cancel();
          targetId = el.dataset.fieldTarget;
          modal.querySelectorAll("[data-field-target]").forEach((x) => x.classList.toggle("selected", x === el));
        } else cancel();
      };
      el.onpointercancel = cancel;
    });
    modal.querySelectorAll("[data-field-item]").forEach((b) => b.onclick = () => useFieldItem(b.dataset.fieldItem, targetId));
    modal.querySelector("#closeGameModal").onclick = () => {
      modal.remove();
      game.paused = false;
    };
  }
  function clearAilments(m) {
    m.statuses = [];
    m.status = null;
    m.ailments = [];
  }
  function useFieldItem(type, targetId) {
    if (itemCount(type) <= 0) return;
    const target = save.state.monsters.find((m) => m.id === targetId), party = save.state.party.map((id) => save.state.monsters.find((m) => m.id === id)).filter(Boolean), single = ["potions", "statusCures", "fullHeals"].includes(type);
    if (single && !target) return;
    const list = single ? [target] : party;
    if (single && target.currentHp <= 0) return alert("\u6226\u95D8\u4E0D\u80FD\u306E\u4EF2\u9593\u306B\u306F\u4F7F\u7528\u3067\u304D\u307E\u305B\u3093");
    const hasAilment = (m) => (m.statuses?.length ?? 0) || (m.ailments?.length ?? 0) || m.status;
    const usable = type === "potions" ? target.currentHp < calculatedStats(target).hp : type === "partyPotions" ? list.some((m) => m.currentHp > 0 && m.currentHp < calculatedStats(m).hp) : type === "statusCures" ? hasAilment(target) : type === "partyStatusCures" ? list.some(hasAilment) : type === "fullHeals" ? target.currentHp < calculatedStats(target).hp || target.currentMp < maxMp(target) || hasAilment(target) : list.some((m) => m.currentHp > 0 && (m.currentHp < calculatedStats(m).hp || m.currentMp < maxMp(m) || hasAilment(m)));
    if (!usable) return alert("\u3082\u3046\u5143\u6C17\u3060\u3088\uFF01");
    if (type === "potions") target.currentHp = Math.min(calculatedStats(target).hp, target.currentHp + 100);
    if (type === "partyPotions") list.filter((m) => m.currentHp > 0).forEach((m) => m.currentHp = Math.min(calculatedStats(m).hp, m.currentHp + 50));
    if (type === "statusCures" || type === "partyStatusCures") list.forEach(clearAilments);
    if (type === "fullHeals" || type === "partyFullHeals") list.filter((m) => m.currentHp > 0).forEach((m) => {
      m.currentHp = calculatedStats(m).hp;
      m.currentMp = maxMp(m);
      clearAilments(m);
    });
    save.state.inventory[type]--;
    save.save();
    closeTopModal();
    snapshot = currentSnapshot();
    stopGame();
    render();
  }
  function openPartyEditor() {
    game.paused = true;
    const body = `<p class="muted">\u305D\u306E\u5834\u3067\u81EA\u7531\u306B\u7DE8\u6210\u3067\u304D\u307E\u3059\u3002\u6355\u7372\u76F4\u5F8C\u306E\u4EF2\u9593\u3082\u3059\u3050\u4F7F\u7528\u53EF\u80FD\u3002</p><div class="party-editor">${save.state.monsters.map((m) => `<button data-party-toggle="${m.id}" class="${save.state.party.includes(m.id) ? "selected" : ""}"><span>${SPECIES[m.speciesId].emoji}</span><b>${displayName(m)}</b><small>Lv.${m.level}</small></button>`).join("")}</div>`;
    app.insertAdjacentHTML("beforeend", Modal("\u30D5\u30A3\u30FC\u30EB\u30C9\u7DE8\u6210", body, "\u9589\u3058\u308B"));
    document.querySelectorAll("[data-party-toggle]").forEach((b) => b.onclick = () => {
      togglePartyMember(b.dataset.partyToggle);
      document.querySelector(".game-modal").remove();
      openPartyEditor();
    });
    topModalButton().onclick = () => {
      document.querySelector(".game-modal").remove();
      snapshot = currentSnapshot();
      stopGame();
      render();
    };
  }
  function enemyLevelForFloor(floor) {
    const band = Math.floor((floor - 1) / 10), base = band * 10 + 1, jumps = [0, 0, 1, 2, 3, 5, 7, 9], variance = jumps[Math.floor(Math.random() * jumps.length)] - (Math.random() < 0.28 ? Math.floor(Math.random() * 4) : 0), milestone = floor % 50 === 1 && floor > 1 ? 8 : floor % 25 === 1 && floor > 1 ? 4 : 0;
    return Math.max(1, base + Math.floor((floor - 1) % 10 * 0.58) + variance + milestone);
  }
  function speciesPoolForFloor(floor) {
    const entries = Object.values(SPECIES).filter((s) => s.minFloor <= floor && s.minFloor >= Math.max(1, floor - 42));
    const safe = entries.filter((s) => floor >= s.minFloor);
    return safe.length ? safe : [SPECIES.slime];
  }
  function randomEnemy() {
    const floor = save.state.player.currentFloor;
    if (floor === 1) return { speciesId: "slime", level: 1, boss: false, equipped: false, gear: null };
    if (floor >= 2 && Math.random() < 6e-3) return { speciesId: "baby_slime", level: Math.max(1, enemyLevelForFloor(floor)), boss: false, equipped: false, gear: null, rareExp: true };
    const pool = speciesPoolForFloor(floor).filter((s) => s.id !== "baby_slime"), picked = pool[Math.floor(Math.random() * pool.length)], speciesId = picked.id, equipped = floor >= 6 && Math.random() < 0.11, gear = equipped ? createEquipment(["weapon", "armor", "accessory"][Math.floor(Math.random() * 3)]) : null;
    return { speciesId, level: enemyLevelForFloor(floor), boss: false, equipped, gear };
  }
  function randomEnemyGroup() {
    const floor = save.state.player.currentFloor;
    if (floor <= 4) return [randomEnemy()];
    let count = 1, r = Math.random();
    if (floor < 10) {
      if (r < 0.12) count = 2;
    } else if (floor < 50) {
      if (r < 0.03) count = 3;
      else if (r < 0.25) count = 2;
    } else {
      if (r < 0.08) count = 3;
      else if (r < 0.35) count = 2;
    }
    return Array.from({ length: count }, randomEnemy);
  }
  function floorBossEnemy() {
    const floor = save.state.player.currentFloor, pool = speciesPoolForFloor(Math.max(floor, 10)).filter((s) => s.minFloor <= floor);
    const speciesId = (pool[Math.floor(seeded(floorSeed(floor) + 991)() * pool.length)] ?? SPECIES.slime).id;
    const cycle = Math.floor(floor / 10);
    return { speciesId, level: Math.max(20, cycle * 20 + 5 + Math.floor(Math.random() * 6)), boss: true };
  }
  function loop(now) {
    if (!game?.running) return;
    const dt = Math.min(0.05, (now - game.last) / 1e3 || 0);
    game.last = now;
    if (!game.paused) update(dt);
    if (!game?.running) return;
    draw();
    requestAnimationFrame(loop);
  }
  async function beginEncounter(enemyOverride = null) {
    if (!game?.running || game.world.encountering) return;
    game.world.encountering = true;
    game.player.path = [];
    game.paused = true;
    const canvas = document.getElementById("gameCanvas");
    const stage = document.querySelector(".explore-stage");
    if (canvas) canvas.classList.add("encounter-shake");
    const fx = document.createElement("div");
    fx.className = "encounter-transition";
    fx.innerHTML = '<div class="encounter-vortex"></div><div class="encounter-flash"></div>';
    (stage ?? document.body).appendChild(fx);
    await wait(430);
    fx.classList.add("is-pulling");
    if (canvas) canvas.classList.add("encounter-pull");
    await wait(920);
    fx.classList.add("is-dark");
    await wait(350);
    if (!game) return;
    activeEnemy = enemyOverride ?? randomEnemyGroup();
    snapshot = currentSnapshot();
    stopGame();
    startBattle(activeEnemy);
    setTimeout(() => fx.remove(), 500);
  }
  function update(dt) {
    if (game.world.encountering) return;
    if (game.player.move(dt, 7.5)) {
      game.world.steps++;
      for (const c of game.world.chests) if (!c.open && c.x === game.player.x && c.y === game.player.y) {
        openChest(c);
        return;
      }
      if (game.world.boss && game.player.x === game.world.boss.x && game.player.y === game.world.boss.y) {
        game.player.path = [];
        game.paused = true;
        const floor = save.state.player.currentFloor, lines = ["\u3053\u3053\u307E\u3067\u8FBF\u308A\u7740\u3044\u305F\u304B\u3002\u3060\u304C\u3001\u3053\u3053\u304B\u3089\u5148\u306F\u901A\u3055\u3093\u3002", "\u5E7E\u5EA6\u6765\u3088\u3046\u3068\u540C\u3058\u3053\u3068\u3002\u529B\u306E\u5DEE\u3092\u523B\u3093\u3067\u3084\u308B\u3002", "\u305D\u306E\u899A\u609F\u3001\u672C\u7269\u304B\u3069\u3046\u304B\u8A66\u3057\u3066\u3084\u308D\u3046\u3002", "\u3053\u306E\u968E\u5C64\u3067\u673D\u3061\u308B\u304C\u3044\u3044\u3002", "\u3088\u304F\u6765\u305F\u3002\u30EF\u30B7\u3092\u8D8A\u3048\u3089\u308C\u308B\u3068\u601D\u3046\u306A\u3089\u3001\u5263\u3092\u53D6\u308C\u3002"];
        const bossInfo = floorBossEnemy(), name = SPECIES[bossInfo.speciesId].name;
        app.insertAdjacentHTML("beforeend", Modal(`\u7B2C${floor}\u968E\u5C64\u306E\u652F\u914D\u8005`, `<p>${lines[Math.floor(Math.random() * lines.length)]}</p><p><b>${name} Lv.${bossInfo.level}</b></p>`, "\u6226\u3046"));
        const modal = topModal();
        modal.querySelector("#closeGameModal").onclick = () => {
          modal.remove();
          game.paused = false;
          beginEncounter(bossInfo);
        };
        return;
      }
      if (game.world.shop && game.player.x === game.world.shop.x && game.player.y === game.world.shop.y) {
        stopGame();
        snapshot = currentSnapshot();
        save.state.player.nextShopFloor = save.state.player.currentFloor + 3 + Math.floor(Math.random() * 5);
        save.save();
        screen = "shop";
        render();
        return;
      }
      if (game.player.x === game.world.exit.x && game.player.y === game.world.exit.y) {
        if (save.state.player.currentFloor % 10 === 0 && game.world.boss) {
          game.player.path = [];
          game.paused = true;
          app.insertAdjacentHTML("beforeend", Modal("\u307E\u3060\u5148\u3078\u306F\u9032\u3081\u306A\u3044", "<p>\u3053\u306E\u968E\u5C64\u306E\u652F\u914D\u8005\u304C\u9053\u3092\u5C01\u3058\u3066\u3044\u308B\u3002</p>", "\u623B\u308B"));
          const modal = topModal();
          modal.querySelector("#closeGameModal").onclick = () => {
            modal.remove();
            game.paused = false;
          };
          return;
        }
        stopGame();
        snapshot = null;
        save.state.player.currentFloor++;
        save.state.player.maxFloor = Math.max(save.state.player.maxFloor, save.state.player.currentFloor);
        save.save();
        go("explore");
        return;
      }
      if (game.world.steps >= game.world.nextEncounter) {
        game.world.steps = 0;
        game.world.nextEncounter = 8 + Math.floor(Math.random() * 24);
        beginEncounter();
        return;
      }
    }
    game.camera.follow(game.player.rx * TILE, game.player.ry * TILE);
    game.camera.clamp(game.world);
  }
  function openChest(c) {
    var _a;
    const floor = save.state.player.currentFloor;
    if (c.locked && (save.state.inventory.abyssKeys ?? 0) <= 0) {
      game.player.path = [];
      return pauseModal("\u{1F512} \u9375\u4ED8\u304D\u5B9D\u7BB1", '<p>\u6DF1\u6DF5\u306E\u9375\u304C\u5FC5\u8981\u3060\u3002</p><p class="muted">\u9375\u306F\u5F37\u6575\u3084\u3054\u304F\u7A00\u306A\u6575\u30C9\u30ED\u30C3\u30D7\u304B\u3089\u5165\u624B\u3067\u304D\u307E\u3059\u3002</p>');
    }
    if (c.locked) save.state.inventory.abyssKeys--;
    c.open = true;
    (_a = save.state.player.openedChests)[floor] ?? (_a[floor] = []);
    if (!save.state.player.openedChests[floor].includes(c.id)) save.state.player.openedChests[floor].push(c.id);
    save.state.records.chests++;
    if (c.mimic) {
      save.save();
      game.player.path = [];
      pauseModal("\uFF01\uFF1F", "<p>\u5B9D\u7BB1\u304C\u7259\u3092\u5265\u3044\u305F\uFF01</p>");
      setTimeout(() => {
        closeTopModal();
        game.paused = false;
        beginEncounter({ speciesId: "mimic", level: Math.max(enemyLevelForFloor(floor) + 12, Math.round(floor * 1.5)), boss: false, equipped: true, gear: createEquipment("accessory", { rarity: "SR" }) });
      }, 650);
      return;
    }
    let title = "\u5B9D\u7BB1", body = "";
    if (c.kind === "apple") {
      save.state.inventory.potions++;
      title = "\u{1FA8E} \u6DF1\u6DF5\u306E\u679C\u5B9F";
      body = "\u56DE\u5FA9\u85AC\u30921\u500B\u7372\u5F97";
    } else if (c.kind === "box") {
      if (Math.random() < 0.5) {
        const gold = 80 + floor * 12;
        save.state.player.gold += gold;
        body = `${gold}G\u3092\u7372\u5F97`;
      } else {
        const item = createEquipment("weapon"), receipt = equipmentReceipt(item);
        body = equipmentReceiptText(receipt);
      }
    } else {
      const rarity = c.locked ? Math.random() < 0.25 ? "LR" : "SSR" : c.kind === "radiant" ? Math.random() < 0.35 ? "LR" : "SSR" : Math.random() < 0.35 ? "SSR" : "SR", item = createEquipment(["weapon", "armor", "accessory"][Math.floor(Math.random() * 3)], { rarity }), receipt = equipmentReceipt(item);
      title = c.locked ? "\u{1F513} \u9375\u4ED8\u304D\u5B9D\u7BB1" : c.kind === "radiant" ? "\u2728 \u8F1D\u304F\u5B9D\u7BB1" : "\u{1F5C3}\uFE0F \u53E4\u3044\u53CE\u7D0D\u7BB1";
      body = `${equipmentReceiptText(receipt)}<br>${Object.entries(item.stats).map(([k, v]) => `${equipmentStatLabel(k)}+${v}`).join(" / ")}`;
    }
    save.save();
    pauseModal(title, body);
  }
  function draw() {
    const c = game.ctx, w = game.world;
    c.fillStyle = "#120c18";
    c.fillRect(0, 0, game.canvas.width, game.canvas.height);
    for (let y = 0; y < w.rows; y++) for (let x = 0; x < w.cols; x++) {
      const p = game.camera.world(x * TILE, y * TILE), s = TILE * game.camera.z;
      c.fillStyle = w.tiles[y][x] ? "#21182a" : "#6a4a7f";
      c.fillRect(p.x, p.y, s + 1, s + 1);
    }
    emoji(w.exit, "\u{1F573}\uFE0F");
    if (w.shop) emoji(w.shop, "\u{1F6AA}");
    if (w.boss) emoji(w.boss, "\u{1F479}", true);
    w.chests.forEach((x) => !x.open && emoji(x, x.emoji, x.kind === "radiant"));
    emoji({ x: game.player.rx, y: game.player.ry }, "\u{1F608}", true);
    drawMini();
  }
  function emoji(o, t, glow = false) {
    const p = game.camera.world(o.x * TILE, o.y * TILE), pulse = glow ? 1 + Math.sin(performance.now() / 170) * 0.12 : 1;
    game.ctx.save();
    if (glow) {
      game.ctx.shadowColor = "#ffe36f";
      game.ctx.shadowBlur = 18;
    }
    game.ctx.font = `${28 * game.camera.z * pulse}px sans-serif`;
    game.ctx.textAlign = "center";
    game.ctx.fillText(t, p.x + TILE * game.camera.z / 2, p.y + TILE * game.camera.z / 2);
    game.ctx.restore();
  }
  function drawMini() {
    const m = document.getElementById("miniMap");
    if (!m || !game?.running) return;
    const w = game.world;
    if (!save.state.settings.minimapVisible) {
      m.style.opacity = 0;
      return;
    }
    m.style.opacity = 1;
    const c = m.getContext("2d"), cell = Math.min(m.width / w.cols, m.height / w.rows), ox = (m.width - w.cols * cell) / 2, oy = (m.height - w.rows * cell) / 2;
    c.fillStyle = "#130c18";
    c.fillRect(0, 0, m.width, m.height);
    for (let y = 0; y < w.rows; y++) for (let x = 0; x < w.cols; x++) {
      c.fillStyle = w.tiles[y][x] ? "#24192d" : "#b178d0";
      c.fillRect(ox + x * cell, oy + y * cell, cell, cell);
    }
    c.fillStyle = "#ff5d66";
    c.fillRect(ox + w.exit.x * cell, oy + w.exit.y * cell, cell, cell);
    c.fillStyle = "#5dff82";
    c.fillRect(ox + game.player.x * cell, oy + game.player.y * cell, cell, cell);
  }
  function path(w, s, g) {
    const goalIsExit = g.x === w.exit.x && g.y === w.exit.y;
    const walk = (x, y) => {
      if (x < 0 || y < 0 || x >= w.cols || y >= w.rows || w.tiles[y][x]) return false;
      if (!goalIsExit && x === w.exit.x && y === w.exit.y) return false;
      return true;
    };
    const key = (p) => p.x + "," + p.y;
    if (!walk(g.x, g.y)) return [];
    const q = [{ x: s.x, y: s.y }], seen = /* @__PURE__ */ new Set([key(s)]), prev = /* @__PURE__ */ new Map();
    while (q.length) {
      const c = q.shift();
      if (c.x === g.x && c.y === g.y) break;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = { x: c.x + dx, y: c.y + dy }, k = key(n);
        if (walk(n.x, n.y) && !seen.has(k)) {
          seen.add(k);
          prev.set(k, c);
          q.push(n);
        }
      }
    }
    if (!seen.has(key(g))) return [];
    const out = [];
    let cur = g;
    while (cur.x !== s.x || cur.y !== s.y) {
      out.unshift(cur);
      cur = prev.get(key(cur));
      if (!cur) return [];
    }
    return out;
  }
  function bindInput(c) {
    game.canvas = c;
    if (!game.input || !(game.input.pts instanceof Map)) game.input = createInputState();
    const i = game.input;
    i.pts.clear();
    i.pinch = null;
    i.drag = false;
    const scalePoint = (e) => {
      const r = c.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) };
    };
    const finish = (e) => {
      i.pts.delete(e.pointerId);
      if (i.pts.size < 2) i.pinch = null;
      if (!i.pts.size) i.drag = false;
    };
    c.onpointerdown = (e) => {
      if (game.paused) return;
      c.setPointerCapture?.(e.pointerId);
      const q = scalePoint(e);
      i.pts.set(e.pointerId, { ...q, sx: q.x, sy: q.y });
      if (i.pts.size === 2) {
        const [a, b] = [...i.pts.values()];
        i.pinch = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom: game.camera.z };
        i.drag = true;
      }
    };
    c.onpointermove = (e) => {
      const p = i.pts.get(e.pointerId);
      if (!p || game.paused) return;
      const q = scalePoint(e), dx = q.x - p.x, dy = q.y - p.y;
      p.x = q.x;
      p.y = q.y;
      if (i.pts.size >= 2) {
        const [a, b] = [...i.pts.values()], dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (!i.pinch) i.pinch = { distance: dist, zoom: game.camera.z };
        const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, before = game.camera.screen(center.x, center.y);
        game.camera.z = Math.max(0.45, Math.min(2.25, i.pinch.zoom * dist / Math.max(1, i.pinch.distance)));
        const after = game.camera.world(before.x, before.y);
        game.camera.ox += center.x - after.x;
        game.camera.oy += center.y - after.y;
        game.camera.manual = true;
        game.camera.clamp(game.world);
        i.drag = true;
        return;
      }
      if (Math.hypot(p.x - p.sx, p.y - p.sy) > 7) i.drag = true;
      if (i.drag) {
        game.camera.pan(dx, dy);
        game.camera.clamp(game.world);
      }
    };
    c.onpointerup = (e) => {
      const p = i.pts.get(e.pointerId), wasMulti = i.pinch, drag = i.drag;
      finish(e);
      if (!p || drag || wasMulti || game.paused) return;
      const q = scalePoint(e), w = game.camera.screen(q.x, q.y), g = { x: Math.floor(w.x / TILE), y: Math.floor(w.y / TILE) };
      game.player.setPath(path(game.world, game.player, g));
    };
    c.onpointercancel = c.onlostpointercapture = finish;
  }
  function stopGame() {
    if (!game) return;
    game.running = false;
    const c = game.canvas;
    if (c) c.onpointerdown = c.onpointermove = c.onpointerup = c.onpointercancel = c.onlostpointercapture = null;
  }
  function pauseModal(title, body) {
    game.paused = true;
    app.insertAdjacentHTML("beforeend", Modal(title, body));
    topModalButton().onclick = () => {
      document.querySelector(".game-modal").remove();
      game.paused = false;
    };
  }
  function battleSpeed() {
    return save.state.settings.battleSpeed ?? 1;
  }
  function wait(ms) {
    return new Promise((r) => setTimeout(r, Math.max(55, ms / battleSpeed())));
  }
  function battleTarget(target) {
    if (target === "enemy") return document.querySelector(".enemy-combatant.targeted") ?? document.querySelector(".enemy-combatant");
    if (String(target).startsWith("enemy-")) return document.getElementById(`enemy-${target}`);
    if (target === "party") return document.querySelector(".battle-party");
    return document.getElementById(`ally-${target}`);
  }
  async function animateAttack(from, skill = false) {
    const el = battleTarget(from);
    if (!el) return;
    el.classList.remove("fx-lunge", "fx-skill-lunge");
    void el.offsetWidth;
    el.classList.add(skill ? "fx-skill-lunge" : "fx-lunge");
    await wait(skill ? 300 : 220);
    el.classList.remove("fx-lunge", "fx-skill-lunge");
  }
  async function animateHit(target, critical = false) {
    const el = battleTarget(target);
    if (!el) return;
    el.classList.remove("fx-hit", "fx-critical-hit");
    void el.offsetWidth;
    el.classList.add(critical ? "fx-critical-hit" : "fx-hit");
    await wait(260);
    el.classList.remove("fx-hit", "fx-critical-hit");
  }
  async function animateDefeat(target, captured = false) {
    const el = battleTarget(target);
    if (!el) return;
    el.classList.add(captured ? "fx-captured" : "fx-defeat");
    await wait(500);
  }
  async function floatText(text, target, type) {
    const layer = document.getElementById("battleFxLayer"), el = battleTarget(target);
    if (!layer || !el) return;
    const lr = layer.getBoundingClientRect(), r = el.getBoundingClientRect(), n = document.createElement("div");
    n.className = `floating-number ${type}`;
    n.textContent = text;
    n.style.left = `${r.left - lr.left + r.width / 2}px`;
    n.style.top = `${r.top - lr.top + r.height * 0.35}px`;
    layer.appendChild(n);
    await wait(560);
    n.remove();
  }
  function makeBattleEnemy(e, index = 0) {
    const sp = SPECIES[e.speciesId], enemy = createEnemyBattleState(sp, e, save.state.player.currentFloor);
    enemy.id = `enemy-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`;
    if (e.equipped && e.gear) {
      enemy.gear = e.gear;
      enemy.name = `\u2694\uFE0F ${enemy.name}`;
      enemy.atk += e.gear.stats.atk ?? 0;
      enemy.def += e.gear.stats.def ?? 0;
      enemy.spd += e.gear.stats.spd ?? 0;
      enemy.maxHp += e.gear.stats.hp ?? 0;
      enemy.hp = enemy.maxHp;
    }
    return enemy;
  }
  function saveBattleCheckpoint() {
    if (!battle) return;
    save.state.activeBattle = { floor: save.state.player.currentFloor, enemies: battle.enemies, turn: battle.turn, turnQueue: battle.turnQueue, queueIndex: battle.queueIndex, targetEnemyId: battle.targetEnemyId, auto: battle.auto, guards: battle.guards, cooldowns: battle.cooldowns, enemyStatuses: battle.enemyStatuses, log: battle.log };
    save.save();
  }
  function clearBattleCheckpoint() {
    delete save.state.activeBattle;
    save.save();
  }
  function resumeSavedBattle() {
    const data = save.state.activeBattle;
    if (!data?.enemies?.length) return false;
    const party = save.state.party.map((id) => save.state.monsters.find((m) => m.id === id)).filter(Boolean);
    if (!party.length) return false;
    save.state.player.currentFloor = data.floor ?? save.state.player.currentFloor;
    battle = { ...data, party, species: SPECIES, busy: false, skillMenu: false, itemMenu: false, enemy: data.enemies[0], ...createBattleRulesState(party), cooldowns: data.cooldowns ?? {}, enemyStatuses: data.enemyStatuses ?? {}, log: data.log ?? [] };
    battle.turnQueue = data.turnQueue ?? [];
    battle.queueIndex = data.queueIndex ?? 0;
    battle.targetEnemyId = data.targetEnemyId ?? aliveEnemies(battle)[0]?.id ?? null;
    screen = "explore";
    renderBattle();
    setTimeout(() => continueBattleFlow(), 250);
    return true;
  }
  function startBattle(encounter) {
    const party = save.state.party.map((id) => save.state.monsters.find((m) => m.id === id)).filter(Boolean), synergy = partySynergy();
    party.forEach((m) => {
      m._synergy = synergy ? { atk: synergy.atk ?? 0, def: synergy.def ?? 0, spd: synergy.spd ?? 0, crit: synergy.crit ?? 0 } : {};
      const hp = calculatedStats(m).hp, mp = maxMp(m);
      if (m.currentHp == null) m.currentHp = hp;
      if (m.currentMp == null) m.currentMp = mp;
      m.currentHp = Math.min(m.currentHp, hp);
      m.currentMp = Math.min(m.currentMp, mp);
    });
    const entries = Array.isArray(encounter) ? encounter : [encounter], enemies = entries.map(makeBattleEnemy);
    battle = { enemies, enemy: enemies[0], targetEnemyId: enemies[0]?.id, party, species: SPECIES, turn: 1, busy: false, auto: save.state.settings.autoBattle, guards: {}, skillMenu: false, itemMenu: false, ...createBattleRulesState(party) };
    buildTurnQueue(battle);
    if (synergy) addBattleLog(battle, `${synergy.name}\u304C\u767A\u52D5\uFF01`);
    addBattleLog(battle, `\u884C\u52D5\u9806\uFF1A${battle.turnQueue.map((entry) => entry.name).join(" \u2192 ")}`);
    saveBattleCheckpoint();
    renderBattle();
    setTimeout(() => continueBattleFlow(), 360 / battleSpeed());
  }
  function actor() {
    return currentAlly(battle);
  }
  function renderBattle() {
    document.querySelector(".battle-screen")?.remove();
    app.insertAdjacentHTML("beforeend", BattleScreen(battle, save.state.inventory, save.state.settings));
    document.querySelectorAll("[data-command]").forEach((b) => b.onclick = () => command(b.dataset.command));
    document.querySelectorAll("[data-skill-id]").forEach((b) => b.onclick = () => command("skill", b.dataset.skillId));
    document.querySelectorAll("[data-battle-item]").forEach((b) => b.onclick = () => openBattleItemTarget(b.dataset.battleItem));
    document.querySelectorAll("[data-battle-detail]").forEach((b) => b.onclick = () => showBattleMonsterDetail(b.dataset.battleDetail));
    document.querySelectorAll("[data-enemy-target]").forEach((b) => b.onclick = () => {
      if (battle.busy) return;
      battle.targetEnemyId = b.dataset.enemyTarget;
      renderBattle();
    });
    document.querySelector(".battle-arena")?.addEventListener("click", (e) => {
      if (!battle.auto || e.target.closest("button,.combatant")) return;
      battle.auto = false;
      save.state.settings.autoBattle = false;
      saveBattleCheckpoint();
      showToast("\u624B\u52D5\u64CD\u4F5C\u3078\u5207\u308A\u66FF\u3048\u307E\u3057\u305F");
      renderBattle();
    });
    const closeSkill = document.getElementById("closeSkillMenu");
    if (closeSkill) closeSkill.onclick = () => {
      battle.skillMenu = false;
      renderBattle();
    };
    const closeItem = document.getElementById("closeItemMenu");
    if (closeItem) closeItem.onclick = () => {
      battle.itemMenu = false;
      renderBattle();
    };
    document.getElementById("battleSpeed").onclick = () => {
      const sp = battleSpeed();
      save.state.settings.battleSpeed = sp === 1 ? 2 : sp === 2 ? 4 : 1;
      save.save();
      renderBattle();
    };
    document.getElementById("toggleBattleAuto").onclick = () => {
      battle.auto = !battle.auto;
      save.state.settings.autoBattle = battle.auto;
      save.save();
      renderBattle();
      if (battle.auto && !battle.busy) continueBattleFlow();
    };
    document.getElementById("escapeBattle").onclick = async () => {
      if (battle.busy || currentTurnEntry(battle)?.type !== "ally") return;
      battle.busy = true;
      if (Math.random() < 0.65) {
        clearBattleCheckpoint();
        document.querySelector(".battle-screen").remove();
        activeEnemy = null;
        screen = "explore";
        render();
      } else {
        addBattleLog(battle, "\u9003\u8D70\u306B\u5931\u6557\u3057\u305F");
        await floatText("\u9003\u8D70\u5931\u6557", "party", "miss");
        battle.busy = false;
        await finishCurrentAction();
      }
    };
  }
  function openBattleItemTarget(type) {
    if ((save.state.inventory[type] ?? 0) <= 0) return;
    const single = ["potions", "statusCures", "fullHeals"].includes(type);
    if (!single) return useBattleItem(type, null);
    const cards = battle.party.map((m) => {
      const st = calculatedStats(m);
      return `<button data-battle-item-target="${m.id}" ${m.currentHp <= 0 ? "disabled" : ""}><b>${displayName(m)} Lv.${m.level}</b><small>HP ${m.currentHp}/${st.hp}\u3000MP ${m.currentMp}/${maxMp(m)}</small></button>`;
    }).join("");
    app.insertAdjacentHTML("beforeend", Modal("\u4F7F\u7528\u5BFE\u8C61\u3092\u9078\u629E", `<div class="modal-party-vitals selectable">${cards}</div>`, `\u3084\u3081\u308B`));
    const modal = topModal();
    modal.querySelectorAll("[data-battle-item-target]").forEach((b) => b.onclick = () => {
      modal.remove();
      useBattleItem(type, b.dataset.battleItemTarget);
    });
    modal.querySelector("#closeGameModal").onclick = () => modal.remove();
  }
  async function useBattleItem(type, targetId) {
    if (battle.busy) return;
    const a = actor();
    if (!a) return;
    const party = battle.party, target = party.find((m) => m.id === targetId), single = ["potions", "statusCures", "fullHeals"].includes(type), list = single ? [target] : party;
    if (single && !target) return;
    if (single && target.currentHp <= 0) return alert("\u6226\u95D8\u4E0D\u80FD\u306E\u4EF2\u9593\u306B\u306F\u4F7F\u7528\u3067\u304D\u307E\u305B\u3093");
    const hasAilment = (m) => (m.statuses?.length ?? 0) || (m.ailments?.length ?? 0) || m.status;
    const usable = type === "potions" ? target.currentHp < calculatedStats(target).hp : type === "partyPotions" ? list.some((m) => m.currentHp > 0 && m.currentHp < calculatedStats(m).hp) : type === "statusCures" ? hasAilment(target) : type === "partyStatusCures" ? list.some(hasAilment) : type === "fullHeals" ? target.currentHp < calculatedStats(target).hp || target.currentMp < maxMp(target) || hasAilment(target) : list.some((m) => m.currentHp > 0 && (m.currentHp < calculatedStats(m).hp || m.currentMp < maxMp(m) || hasAilment(m)));
    if (!usable) return alert("\u3082\u3046\u5143\u6C17\u3060\u3088\uFF01");
    battle.busy = true;
    battle.itemMenu = false;
    save.state.inventory[type]--;
    if (type === "potions") target.currentHp = Math.min(calculatedStats(target).hp, target.currentHp + 100);
    if (type === "partyPotions") list.filter((m) => m.currentHp > 0).forEach((m) => m.currentHp = Math.min(calculatedStats(m).hp, m.currentHp + 50));
    if (type === "statusCures" || type === "partyStatusCures") list.forEach(clearAilments);
    if (type === "fullHeals" || type === "partyFullHeals") list.filter((m) => m.currentHp > 0).forEach((m) => {
      m.currentHp = calculatedStats(m).hp;
      m.currentMp = maxMp(m);
      clearAilments(m);
    });
    addBattleLog(battle, `${displayName(a)}\uFF1A\u30A2\u30A4\u30C6\u30E0\u4F7F\u7528`);
    saveBattleCheckpoint();
    renderBattle();
    await wait(220 / battleSpeed());
    battle.busy = false;
    await finishCurrentAction();
  }
  function showBattleMonsterDetail(id) {
    const m = battle.party.find((x) => x.id === id);
    if (!m) return;
    const st = calculatedStats(m), need = expNeed(m), gear = Object.entries(m.equipment ?? {}).map(([slot, itemId]) => `${slotLabel(slot)}\uFF1A${save.state.equipment.find((i) => i.id === itemId)?.name ?? "\u306A\u3057"}`).join("<br>");
    app.insertAdjacentHTML("beforeend", Modal(`${SPECIES[m.speciesId].emoji} ${displayName(m)}`, `<div class="battle-detail"><p><b>Lv.${m.level} \u2605${m.stars} +${m.plus}</b></p><p>HP ${m.currentHp ?? st.hp}/${st.hp}<br>MP ${m.currentMp ?? maxMp(m)}/${maxMp(m)}<br>ATK ${st.atk} / DEF ${st.def} / SPD ${st.spd}<br>\u4F1A\u5FC3 ${st.crit}% / \u56DE\u907F ${st.evasion}%<br><b>${SPECIES[m.speciesId].race}\u65CF / ${SPECIES[m.speciesId].role}</b><br>\u7279\u6027\uFF1A${TRAITS[m.traitId]?.name ?? "\u5B89\u5B9A"}\uFF08${TRAITS[m.traitId]?.description ?? ""}\uFF09</p><p>EXP ${m.exp}/${need}</p><div class="battle-bar exp"><i style="width:${Math.min(100, m.exp / need * 100)}%"></i></div><p>${gear}</p><p><b>\u30B9\u30AD\u30EB</b><br>${learnedSkills(m).map((x) => `${x.name}\uFF08MP${x.mp}\uFF09`).join("<br>") || "\u306A\u3057"}</p></div>`, "\u9589\u3058\u308B"));
    topModalButton().onclick = closeTopModal;
  }
  async function command(type, skillId = null) {
    if (battle.busy) return;
    const entry = currentTurnEntry(battle), a = actor();
    if (entry?.type !== "ally" || !a) return;
    battle.busy = true;
    const s = calculatedStats(a), e = selectedEnemy(battle);
    if (!e) {
      battle.busy = false;
      return win(false, null);
    }
    ;
    battle.enemy = e;
    if (type === "attack") {
      addBattleLog(battle, `${displayName(a)}\uFF1A\u305F\u305F\u304B\u3046`);
      await animateAttack(a.id);
      if (Math.random() < 0.06) await floatText("MISS", e.id, "miss");
      else {
        const critical = Math.random() < Math.min(0.35, 0.08 + (s.spd ?? 0) * 5e-3);
        const base = Math.max(1, Math.floor(s.atk * (0.9 + Math.random() * 0.2) - e.def * 0.4));
        const raw = critical ? Math.floor(base * 1.7) : base, d = Math.max(1, Math.floor(raw * enemyDamageMultiplier(e)));
        e.hp = Math.max(0, e.hp - d);
        await animateHit(e.id, critical);
        await floatText(`${critical ? "CRITICAL " : ""}-${d}`, e.id, critical ? "critical" : "damage");
      }
    }
    if (type === "skill" && !skillId) {
      battle.busy = false;
      battle.skillMenu = true;
      renderBattle();
      return;
    }
    if (type === "skill" && skillId) {
      const skill = skillById(skillId), cd = cooldownRemaining(battle, a.id, skillId);
      if (!learnedSkills(a).some((x) => x.id === skillId) || !canUseSkill(a, skill, cd)) {
        battle.busy = false;
        return alert(cd > 0 ? `\u3042\u3068${cd}\u30E9\u30A6\u30F3\u30C9\u4F7F\u7528\u3067\u304D\u306A\u3044` : "MP\u304C\u8DB3\u308A\u306A\u3044");
      }
      a.currentMp -= skill.mp;
      setSkillCooldown(battle, a.id, skill);
      battle.skillMenu = false;
      addBattleLog(battle, `${displayName(a)}\uFF1A${skill.name}`);
      if (skill.type === "selfHeal") {
        const h = Math.max(1, Math.floor(s.hp * skill.heal));
        a.currentHp = Math.min(s.hp, a.currentHp + h);
        await floatText(`+${h}`, a.id, "heal");
      } else if (skill.type === "allHeal") {
        const healed = [];
        battle.party.filter((m) => m.currentHp > 0).forEach((m) => {
          const max = calculatedStats(m).hp, h = Math.max(1, Math.floor(max * skill.heal)), before = m.currentHp;
          m.currentHp = Math.min(max, m.currentHp + h);
          healed.push(m.currentHp - before);
        });
        await floatText(`\u5168\u4F53 +${Math.max(...healed)}`, "party", "heal");
      } else {
        await animateAttack(a.id, true);
        const hits = skill.hits ?? 1;
        let total2 = 0;
        for (let i = 0; i < hits && e.hp > 0; i++) {
          const critical = Math.random() < Math.min(0.45, 0.1 + (skill.critBonus ?? 0) + (s.spd ?? 0) * 4e-3), raw = skillDamage(s, e, skill, critical), d = Math.max(1, Math.floor(raw * enemyDamageMultiplier(e)));
          e.hp = Math.max(0, e.hp - d);
          total2 += d;
          await animateHit(e.id, critical);
          await floatText(`${critical ? "CRITICAL " : ""}-${d}`, e.id, critical ? "critical" : "skill");
        }
        if (skill.type === "drain") {
          const h = Math.max(1, Math.floor(total2 * skill.drain));
          a.currentHp = Math.min(s.hp, a.currentHp + h);
          await floatText(`+${h}`, a.id, "heal");
        }
        if (skill.status && e.hp > 0 && Math.random() < skill.status.chance) {
          applyEnemyStatus(battle, skill.status, e.id);
          addBattleLog(battle, `${e.name}\u306F${skill.status.name}\u72B6\u614B\u306B\u306A\u3063\u305F`);
          await floatText(skill.status.name, e.id, skill.status.id);
        }
      }
    }
    if (type === "guard") {
      battle.guards[a.id] = true;
      addBattleLog(battle, `${displayName(a)}\uFF1A\u30AC\u30FC\u30C9`);
      await floatText("GUARD", a.id, "guard");
    }
    if (type === "item") {
      battle.busy = false;
      battle.auto = false;
      save.state.settings.autoBattle = false;
      battle.itemMenu = true;
      save.save();
      renderBattle();
      return;
    }
    if (type === "capture") {
      if (e.boss) {
        const floor = save.state.player.currentFloor, defeated = (save.state.player.bossKills[floor] ?? 0) > 0;
        if (!defeated) {
          battle.busy = false;
          return alert("\u521D\u56DE\u306E\u968E\u5C64\u30DC\u30B9\u306F\u6355\u7372\u3067\u304D\u307E\u305B\u3093\u3002\u307E\u305A\u6483\u7834\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
        }
      }
      if (save.state.inventory.captureCrystals <= 0) {
        battle.busy = false;
        return alert("\u6355\u7372\u7D50\u6676\u304C\u306A\u3044");
      }
      save.state.inventory.captureCrystals--;
      addBattleLog(battle, "\u6355\u7372\u3092\u8A66\u307F\u305F");
      const chance = e.boss ? Math.max(0.01, Math.min(0.05, 0.01 + (1 - e.hp / e.maxHp) * 0.04)) : Math.max(0.08, Math.min(0.88, 0.2 + (1 - e.hp / e.maxHp) * 0.55 + (Math.max(...battle.party.map((m) => m.level + m.stars * 2 + m.plus)) - e.level) * 0.012));
      await floatText(`\u6355\u7372 ${Math.round(chance * 100)}%`, e.id, "capture");
      await wait(500);
      if (Math.random() < chance) {
        const m = createMonster(e.speciesId, { level: e.level });
        save.state.monsters.push(m);
        save.state.records.captures++;
        e.captured = true;
        e.hp = 0;
        save.save();
        await animateDefeat(e.id, true);
        battle.targetEnemyId = aliveEnemies(battle)[0]?.id ?? null;
        if (!aliveEnemies(battle).length) return win(true, m);
        addBattleLog(battle, `${e.name}\u3092\u6355\u7372\u3057\u305F`);
      }
    }
    saveBattleCheckpoint();
    renderBattle();
    await wait(260 / battleSpeed());
    if (e.hp <= 0) {
      await animateDefeat(e.id);
      battle.targetEnemyId = aliveEnemies(battle)[0]?.id ?? null;
      if (!aliveEnemies(battle).length) return win(false, null);
    }
    battle.busy = false;
    await finishCurrentAction();
  }
  function chooseEnemyTarget() {
    const alive = battle.party.filter((monster) => monster.currentHp > 0);
    if (!alive.length) return null;
    const guarded = alive.filter((monster) => battle.guards[monster.id]);
    if (guarded.length && Math.random() < 0.45) return guarded[Math.floor(Math.random() * guarded.length)];
    return alive[Math.floor(Math.random() * alive.length)];
  }
  async function enemyTurn() {
    if (battle.busy) return;
    const entry = currentTurnEntry(battle);
    if (entry?.type !== "enemy") return continueBattleFlow();
    const target = chooseEnemyTarget();
    if (!target) return lose();
    battle.busy = true;
    const e = currentEnemy(battle);
    if (!e) {
      battle.busy = false;
      return finishCurrentAction();
    }
    battle.enemy = e;
    const action = chooseEnemyAction(e);
    addBattleLog(battle, `${e.name}\uFF1A${e.intent}`);
    if (action === ENEMY_ACTIONS.guard) {
      await floatText("GUARD", e.id, "guard");
    } else if (action === ENEMY_ACTIONS.charge) {
      await floatText("CHARGE", e.id, "charge");
    } else if (action === ENEMY_ACTIONS.heal) {
      const h = enemyHealAmount(e);
      e.hp = Math.min(e.maxHp, e.hp + h);
      await floatText(`+${h}`, e.id, "heal");
    } else if (action === ENEMY_ACTIONS.enrage) {
      e.atk = Math.floor(e.atk * 1.18);
      e.def = Math.floor(e.def * 1.08);
      await floatText("ENRAGE", e.id, "enrage");
      await animateHit(e.id, true);
    } else {
      const s = calculatedStats(target);
      await animateAttack(e.id, action === ENEMY_ACTIONS.power);
      if (action !== ENEMY_ACTIONS.power && Math.random() < 0.05) await floatText("MISS", target.id, "miss");
      else {
        const guard = Boolean(battle.guards[target.id]), critical = Math.random() < (e.enraged ? 0.13 : 0.08), multiplier = enemyAttackMultiplier(e, action);
        let d = Math.max(1, Math.floor((e.atk - s.def * 0.45) * multiplier * (guard ? 0.45 : 1)));
        if (critical) d = Math.floor(d * 1.55);
        target.currentHp = Math.max(0, target.currentHp - d);
        addBattleLog(battle, `${displayName(target)}\u306B${d}\u30C0\u30E1\u30FC\u30B8`);
        await animateHit(target.id, critical);
        await floatText(`${action === ENEMY_ACTIONS.power ? "\u5F37\u6483 " : ""}${critical ? "CRITICAL " : ""}-${d}`, target.id, critical ? "critical" : "enemy");
        if (target.currentHp <= 0) await animateDefeat(target.id);
      }
    }
    saveBattleCheckpoint();
    renderBattle();
    await wait(300 / battleSpeed());
    battle.busy = false;
    if (!battle.party.some((m) => m.currentHp > 0)) return lose();
    await finishCurrentAction();
  }
  async function finishCurrentAction() {
    advanceQueue(battle);
    if (queueFinished(battle)) return endRound();
    renderBattle();
    await wait(180 / battleSpeed());
    return continueBattleFlow();
  }
  async function endRound() {
    battle.busy = true;
    const statusResults = processEnemyStatuses(battle);
    for (const result of statusResults) {
      addBattleLog(battle, `${result.enemy.name}\u306B${result.name} ${result.damage}\u30C0\u30E1\u30FC\u30B8`);
      renderBattle();
      await floatText(`-${result.damage}`, result.enemy.id, result.id);
    }
    tickCooldowns(battle);
    battle.guards = {};
    for (const e of (battle.enemies ?? []).filter((x) => x.hp <= 0)) await animateDefeat(e.id);
    if (!aliveEnemies(battle).length) return win(false, null);
    if (!battle.party.some((m) => m.currentHp > 0)) return lose();
    battle.turn++;
    buildTurnQueue(battle);
    addBattleLog(battle, `ROUND ${battle.turn}\uFF1A${battle.turnQueue.map((entry) => entry.name).join(" \u2192 ")}`);
    battle.busy = false;
    saveBattleCheckpoint();
    renderBattle();
    await wait(260 / battleSpeed());
    return continueBattleFlow();
  }
  async function continueBattleFlow() {
    if (!battle || battle.busy) return;
    skipInvalidEntries(battle);
    if (queueFinished(battle)) return endRound();
    const entry = currentTurnEntry(battle);
    renderBattle();
    if (entry?.type === "enemy") return enemyTurn();
    if (entry?.type === "ally" && battle.auto) {
      await wait(220 / battleSpeed());
      return command("attack");
    }
  }
  function expNeed(m) {
    return expNeedFor(m);
  }
  function win(caught, m) {
    const defeated = (battle.enemies ?? [battle.enemy]).filter(Boolean), floor = save.state.player.currentFloor, boss = defeated.find((e) => e.boss), firstBoss = !!boss && !save.state.player.bossRewards[floor];
    const gold = defeated.reduce((sum, e) => sum + (e.boss ? firstBoss ? 80 + e.level * 14 : 28 + e.level * 7 : 16 + e.level * 5), 0);
    save.state.player.gold += gold;
    save.state.records.kills += defeated.filter((e) => !e.captured).length;
    const baseGain = defeated.reduce((sum, e) => {
      if (e.boss) return sum + (firstBoss ? Math.round(110 + e.level * 28) : Math.round(24 + e.level * 8));
      if (e.rareExp) return sum + Math.round(100 + e.level * 22);
      const difficulty = (e.gear ? 1.35 : 1) * (e.level > floor + 4 ? 1.2 : 1);
      return sum + Math.max(6, Math.round((10 + e.level * 4.4) * difficulty));
    }, 0);
    const totalExp = baseGain * battle.party.length;
    const keyDrop = defeated.some((e) => !e.boss && Math.random() < 2e-3) || firstBoss && floor % 50 === 0;
    if (keyDrop) save.state.inventory.abyssKeys = (save.state.inventory.abyssKeys ?? 0) + 1;
    const survivors = battle.party.filter((monster) => monster.currentHp > 0);
    const share = survivors.length ? Math.floor(totalExp / survivors.length) : 0;
    let remainder = survivors.length ? totalExp % survivors.length : 0;
    const progress = battle.party.map((monster) => {
      const alive = monster.currentHp > 0;
      const before = { level: monster.level, exp: monster.exp, need: expNeed(monster), stats: { ...calculatedStats(monster) }, hp: monster.currentHp, mp: monster.currentMp };
      const gain = alive ? share + (remainder-- > 0 ? 1 : 0) : 0;
      monster.exp += gain;
      let levels = 0;
      while (monster.exp >= expNeed(monster)) {
        monster.exp -= expNeed(monster);
        monster.level++;
        levels++;
        monster.currentHp = calculatedStats(monster).hp;
        monster.currentMp = Math.min(maxMp(monster), monster.currentMp + 2);
      }
      return { x: monster, before, gain, levels, need: expNeed(monster), alive, afterStats: { ...calculatedStats(monster) } };
    });
    let drop = null, dropReceipt = null;
    const geared = defeated.find((e) => e.gear);
    if (geared && Math.random() < 0.18) {
      drop = { ...geared.gear, id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`, equippedBy: null, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
      dropReceipt = equipmentReceipt(drop);
    } else if (Math.random() < 0.12) {
      drop = createEquipment(["weapon", "armor", "accessory"][Math.floor(Math.random() * 3)]);
      dropReceipt = equipmentReceipt(drop);
    }
    clearPartySynergy();
    clearBattleCheckpoint();
    activeEnemy = null;
    document.querySelector(".battle-screen")?.remove();
    const result = `<div class="victory-title">VICTORY</div><div class="reward-summary"><b>+${gold}G</b><small>\u7DCFEXP ${totalExp} / \u751F\u5B58 ${survivors.length}\u4F53\u3067\u5206\u914D${firstBoss ? "\u30FB\u521D\u56DE\u30DC\u30B9\u6483\u7834\u30DC\u30FC\u30CA\u30B9" : ""}</small>${drop ? `<b>[${drop.rarity}] ${drop.name}\uFF08${slotLabel(drop.slot)}\uFF09</b><small>${dropReceipt.message}</small>` : ""}${keyDrop ? `<b>\u{1F5DD}\uFE0F \u6DF1\u6DF5\u306E\u9375\u3092\u7372\u5F97</b>` : ""}${caught ? `<b>${m.nickname}\u3092\u6355\u7372\uFF01</b>` : ""}</div><div class="exp-results compact">${progress.map((p) => {
      const hpMax = p.afterStats.hp, mpMax = maxMp(p.x), remaining = Math.max(0, p.need - p.x.exp), diff = (k) => p.afterStats[k] - (p.before.stats[k] ?? 0);
      return `<div class="${p.alive ? "" : "exp-defeated"} ${p.levels ? "level-up-card" : ""}"><span>${SPECIES[p.x.speciesId].emoji}</span><section><b>${displayName(p.x)} ${p.levels ? `Lv.${p.before.level} \u2192 Lv.${p.x.level} <em>LEVEL UP!</em>` : `Lv.${p.x.level}`}</b><div class="result-vitals"><small>HP ${p.x.currentHp}/${hpMax}</small><small>MP ${p.x.currentMp}/${mpMax}</small><small>${p.alive ? `\u6B21\u307E\u3067\u3042\u3068${remaining}EXP` : "\u6226\u95D8\u4E0D\u80FD\uFF1AEXP 0"}</small></div><i class="result-exp"><u style="width:${Math.min(100, p.x.exp / p.need * 100)}%"></u></i>${p.levels ? `<div class="level-gains"><span>HP ${p.before.stats.hp} \u2192 ${p.afterStats.hp} <strong>+${diff("hp")}</strong></span><span>ATK ${p.before.stats.atk} \u2192 ${p.afterStats.atk} <strong>+${diff("atk")}</strong></span><span>DEF ${p.before.stats.def} \u2192 ${p.afterStats.def} <strong>+${diff("def")}</strong></span><span>SPD ${p.before.stats.spd} \u2192 ${p.afterStats.spd} <strong>+${diff("spd")}</strong></span></div>` : ""}</section></div>`;
    }).join("")}</div>`;
    if (boss) {
      battle.enemy = boss;
      save.state.player.bossKills[floor] = (save.state.player.bossKills[floor] ?? 0) + 1;
      if (snapshot?.world) snapshot.world.boss = null;
      if (firstBoss) return showBossRewards(result);
    }
    app.insertAdjacentHTML("beforeend", Modal(caught ? "\u6355\u7372\u6210\u529F\uFF01" : "\u6226\u95D8\u7D50\u679C", result, "\u63A2\u7D22\u3078"));
    topModalButton().onclick = () => {
      document.querySelector(".game-modal").remove();
      screen = "explore";
      render();
    };
  }
  function showBossRewards(result) {
    const floor = save.state.player.currentFloor, species = battle.enemy.speciesId, sp = SPECIES[species], weapon = createEquipment("weapon", { rarity: "LR" });
    weapon.name = `${sp.name}\u306E\u738B\u88C5`;
    const options = [{ id: "weapon", icon: "\u2694\uFE0F", title: weapon.name, desc: `\u9650\u5B9ALR\u6B66\u5668 / ${Object.entries(weapon.stats).map(([k, v]) => `${equipmentStatLabel(k)}+${v}`).join(" ")}` }, { id: "boss", icon: sp.emoji, title: `${sp.name}\u3092\u4EF2\u9593\u306B\u3059\u308B`, desc: `Lv.${battle.enemy.level}\u306E\u30DC\u30B9\u500B\u4F53` }, { id: "crystal", icon: "\u{1F48E}", title: `\u9B54\u6676\u77F3 \xD7${80 + floor * 4}`, desc: "\u80B2\u6210\u30FB\u30AC\u30C1\u30E3\u7528\u306E\u5927\u91CF\u8CC7\u6E90" }, { id: "supply", icon: "\u{1F5C3}\uFE0F", title: "\u6DF1\u6DF5\u9060\u5F81\u30BB\u30C3\u30C8", desc: `\u6355\u7372\u7D50\u6676\xD7${5 + Math.floor(floor / 10)} / \u56DE\u5FA9\u85AC\xD75` }];
    app.insertAdjacentHTML("beforeend", `<div class="game-modal"><div class="game-modal-card boss-reward"><div>${result}</div><h2>\u904B\u547D\u306E4\u629E</h2><p class="muted">\u4E2D\u8EAB\u3092\u898B\u3066\u3001\u3072\u3068\u3064\u3060\u3051\u9078\u629E\u3002\u9078\u3073\u76F4\u3057\u306F\u3067\u304D\u307E\u305B\u3093\u3002</p><div class="boss-reward-grid">${options.map((o) => `<button data-boss-reward="${o.id}"><span>${o.icon}</span><b>${o.title}</b><small>${o.desc}</small></button>`).join("")}</div></div></div>`);
    document.querySelectorAll("[data-boss-reward]").forEach((b) => b.onclick = () => {
      if (!confirm(`${b.querySelector("b").textContent}\u3092\u9078\u3076\uFF1F
\u3053\u306E\u968E\u306E\u4ED6\u306E\u5831\u916C\u306F\u5165\u624B\u3067\u304D\u307E\u305B\u3093\u3002`)) return;
      const id = b.dataset.bossReward;
      if (id === "weapon") receiveEquipment(save.state, weapon, { bossReward: true });
      if (id === "boss") save.state.monsters.push(createMonster(species, { level: battle.enemy.level, stars: 3, nickname: `\u8987 ${sp.name}` }));
      if (id === "crystal") save.state.player.crystals += 80 + floor * 4;
      if (id === "supply") {
        save.state.inventory.captureCrystals += 5 + Math.floor(floor / 10);
        save.state.inventory.potions += 5;
      }
      save.state.player.bossRewards[floor] = id;
      save.save();
      document.querySelector(".game-modal").remove();
      screen = "explore";
      render();
    });
  }
  function lose() {
    clearPartySynergy();
    const lost = Math.floor(save.state.player.gold * 0.25);
    save.state.player.gold -= lost;
    save.state.player.currentFloor = save.state.player.checkpoint;
    save.state.player.inRun = false;
    battle.party.forEach((m) => {
      m.currentHp = 1;
      m.currentMp = 0;
      clearAilments(m);
    });
    clearBattleCheckpoint();
    snapshot = null;
    document.querySelector(".battle-screen")?.remove();
    alert(`\u5168\u6EC5\uFF01 ${lost}G\u5931\u3063\u305F`);
    go("home");
  }
  if (!resumeSavedBattle()) render();
})();
