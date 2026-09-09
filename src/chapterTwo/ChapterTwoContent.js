export const CHAPTER_TWO_AREAS=Object.freeze([
 {
  "id": 0,
  "name": "境界の森",
  "skin": "forest",
  "subtitle": "予言の外へ",
  "goal": "東西の封印樹を解放する",
  "gate": "封印",
  "level": 1000,
  "accent": "#91dbe3",
  "element": "nature",
  "positions": [[0, 2], [1, 2], [2, 2], [1, 1], [2, 1], [2, 0]],
  "keys": [
   "patrol",
   "west",
   "east",
   "heart"
  ],
  "rooms": [
   {
    "id": 0,
    "name": "境界の林道",
    "links": {
     "east": 1
    },
    "hint": "探索状況は帰還しても保存されます。"
   },
   {
    "id": 1,
    "name": "倒木の小径",
    "links": {
     "west": 0,
     "east": 2,
     "north": 3
    },
    "encounter": "patrol",
    "hint": "通路を進んで次の区画へ。マップから進む方向を選べます。"
   },
   {
    "id": 2,
    "name": "月映りの水辺",
    "links": {
     "west": 1,
     "north": 4
    },
    "hint": "泉で全回復。宝箱から育成資金を入手できます。",
    "chest": true,
    "spring": true
   },
   {
    "id": 3,
    "name": "西の封印樹",
    "links": {
     "south": 1,
     "east": 4
    },
    "encounter": "west",
    "hint": "守護者を倒すと封印を一つ獲得。"
   },
   {
    "id": 4,
    "name": "東の封印樹",
    "links": {
     "south": 2,
     "west": 3,
     "north": 5
    },
    "encounter": "east",
    "hint": "守護者を倒すと封印を一つ獲得。"
   },
   {
    "id": 5,
    "name": "侵食の根源",
    "links": {
     "south": 4
    },
    "encounter": "heart",
    "hint": "二つの条件を達成して、地域の強敵に挑もう。"
   }
  ]
 },
 {
  "id": 1,
  "name": "黒根の侵食域",
  "skin": "invasion",
  "subtitle": "奪われる大地",
  "goal": "侵食を支える根脈を断つ",
  "gate": "根脈",
  "level": 1400,
  "accent": "#e6a46f",
  "element": "fire",
  "positions": [[2, 2], [1, 2], [0, 2], [1, 1], [0, 1], [0, 0]],
  "keys": [
   "a1_patrol",
   "a1_west",
   "a1_east",
   "a1_heart"
  ],
  "rooms": [
   {
    "id": 0,
    "name": "赤灰の入口",
    "links": {
     "west": 1
    },
    "hint": "探索状況は帰還しても保存されます。"
   },
   {
    "id": 1,
    "name": "吸命の荒野",
    "links": {
     "east": 0,
     "west": 2,
     "north": 3
    },
    "encounter": "a1_patrol",
    "hint": "通路を進んで次の区画へ。マップから進む方向を選べます。"
   },
   {
    "id": 2,
    "name": "残照の泉",
    "links": {
     "east": 1,
     "north": 4
    },
    "hint": "泉で全回復。宝箱から育成資金を入手できます。",
    "chest": true,
    "spring": true
   },
   {
    "id": 3,
    "name": "飢えた根脈",
    "links": {
     "south": 1,
     "west": 4
    },
    "encounter": "a1_west",
    "hint": "守護者を倒すと根脈を一つ獲得。"
   },
   {
    "id": 4,
    "name": "焼け跡の根脈",
    "links": {
     "south": 2,
     "east": 3,
     "north": 5
    },
    "encounter": "a1_east",
    "hint": "守護者を倒すと根脈を一つ獲得。"
   },
   {
    "id": 5,
    "name": "黒根の心臓",
    "links": {
     "south": 4
    },
    "encounter": "a1_heart",
    "hint": "二つの条件を達成して、地域の強敵に挑もう。"
   }
  ]
 },
 {
  "id": 2,
  "name": "深淵の回廊",
  "skin": "abyss",
  "subtitle": "旧世界の記憶",
  "goal": "深淵の証を二つ得る",
  "gate": "深淵の証",
  "level": 2000,
  "accent": "#c29ce8",
  "element": "dark",
  "positions": [[0, 0], [1, 0], [2, 0], [1, 1], [2, 1], [2, 2]],
  "keys": [
   "a2_patrol",
   "a2_west",
   "a2_east",
   "a2_heart"
  ],
  "rooms": [
   {
    "id": 0,
    "name": "沈黙の門",
    "links": {
     "east": 1
    },
    "hint": "探索状況は帰還しても保存されます。"
   },
   {
    "id": 1,
    "name": "忘却の鎖道",
    "links": {
     "west": 0,
     "east": 2,
     "south": 3
    },
    "encounter": "a2_patrol",
    "hint": "通路を進んで次の区画へ。マップから進む方向を選べます。"
   },
   {
    "id": 2,
    "name": "記憶の水鏡",
    "links": {
     "west": 1,
     "south": 4
    },
    "hint": "泉で全回復。宝箱から育成資金を入手できます。",
    "chest": true,
    "spring": true
   },
   {
    "id": 3,
    "name": "眠りの裁定",
    "links": {
     "north": 1,
     "east": 4
    },
    "encounter": "a2_west",
    "hint": "守護者を倒すと深淵の証を一つ獲得。"
   },
   {
    "id": 4,
    "name": "王権の裁定",
    "links": {
     "north": 2,
     "west": 3,
     "south": 5
    },
    "encounter": "a2_east",
    "hint": "守護者を倒すと深淵の証を一つ獲得。"
   },
   {
    "id": 5,
    "name": "七つの影の座",
    "links": {
     "north": 4
    },
    "encounter": "a2_heart",
    "hint": "二つの条件を達成して、地域の強敵に挑もう。"
   }
  ]
 },
 {
  "id": 3,
  "name": "天律の聖域",
  "skin": "sanctum",
  "subtitle": "神々の選択",
  "goal": "十神の承認を二つ得る",
  "gate": "神の承認",
  "level": 2800,
  "accent": "#e9d8a0",
  "element": "light",
  "positions": [[2, 2], [1, 2], [0, 2], [1, 1], [0, 1], [0, 0]],
  "keys": [
   "a3_patrol",
   "a3_west",
   "a3_east",
   "a3_heart"
  ],
  "rooms": [
   {
    "id": 0,
    "name": "白金の階",
    "links": {
     "west": 1
    },
    "hint": "探索状況は帰還しても保存されます。"
   },
   {
    "id": 1,
    "name": "天秤の回廊",
    "links": {
     "east": 0,
     "west": 2,
     "north": 3
    },
    "encounter": "a3_patrol",
    "hint": "通路を進んで次の区画へ。マップから進む方向を選べます。"
   },
   {
    "id": 2,
    "name": "清浄の泉",
    "links": {
     "east": 1,
     "north": 4
    },
    "hint": "泉で全回復。宝箱から育成資金を入手できます。",
    "chest": true,
    "spring": true
   },
   {
    "id": 3,
    "name": "生命の聖壇",
    "links": {
     "south": 1,
     "west": 4
    },
    "encounter": "a3_west",
    "hint": "守護者を倒すと神の承認を一つ獲得。"
   },
   {
    "id": 4,
    "name": "因果の聖壇",
    "links": {
     "south": 2,
     "east": 3,
     "north": 5
    },
    "encounter": "a3_east",
    "hint": "守護者を倒すと神の承認を一つ獲得。"
   },
   {
    "id": 5,
    "name": "天律の大聖座",
    "links": {
     "south": 4
    },
    "encounter": "a3_heart",
    "hint": "二つの条件を達成して、地域の強敵に挑もう。"
   }
  ]
 },
 {
  "id": 4,
  "name": "理の中枢",
  "skin": "core",
  "subtitle": "筋書きのない明日",
  "goal": "循環を縛る中枢を停止する",
  "gate": "中枢停止",
  "level": 3800,
  "accent": "#e5c879",
  "element": "light",
  "positions": [[0, 0], [1, 0], [2, 0], [1, 1], [2, 1], [2, 2]],
  "keys": [
   "a4_patrol",
   "a4_west",
   "a4_east",
   "a4_heart"
  ],
  "rooms": [
   {
    "id": 0,
    "name": "終端の入口",
    "links": {
     "east": 1
    },
    "hint": "探索状況は帰還しても保存されます。"
   },
   {
    "id": 1,
    "name": "輪廻の歯車",
    "links": {
     "west": 0,
     "east": 2,
     "south": 3
    },
    "encounter": "a4_patrol",
    "hint": "通路を進んで次の区画へ。マップから進む方向を選べます。"
   },
   {
    "id": 2,
    "name": "星明かりの泉",
    "links": {
     "west": 1,
     "south": 4
    },
    "hint": "泉で全回復。宝箱から育成資金を入手できます。",
    "chest": true,
    "spring": true
   },
   {
    "id": 3,
    "name": "記録の中枢",
    "links": {
     "north": 1,
     "east": 4
    },
    "encounter": "a4_west",
    "hint": "守護者を倒すと中枢停止を一つ獲得。"
   },
   {
    "id": 4,
    "name": "修復の中枢",
    "links": {
     "north": 2,
     "west": 3,
     "south": 5
    },
    "encounter": "a4_east",
    "hint": "守護者を倒すと中枢停止を一つ獲得。"
   },
   {
    "id": 5,
    "name": "白紙の玉座",
    "links": {
     "north": 4
    },
    "encounter": "a4_heart",
    "hint": "二つの条件を達成して、地域の強敵に挑もう。"
   }
  ]
 }
]);
export const CHAPTER_TWO_NEW_ENCOUNTERS=Object.freeze({
 "a1_patrol": {
  "area": 1,
  "name": "吸命獣の群れ",
  "species": [
   "dire_wolf",
   "mandrake",
   "jade_mantis"
  ],
  "authorities": [
   null,
   null,
   null
  ],
  "roles": [
   "leader",
   "support",
   "disruptor"
  ],
  "level": 1400,
  "hp": 240000,
  "atk": 23000,
  "spd": 9000,
  "experience": 125000,
  "gold": 175000,
  "seal": false,
  "boss": false,
  "def": 10000
 },
 "a1_west": {
  "area": 1,
  "name": "飢根の捕食者",
  "species": [
   "ogre",
   "frost_dryad",
   "dire_wolf"
  ],
  "authorities": [
   "abyss_gluttony",
   null,
   null
  ],
  "roles": [
   "leader",
   "support",
   "disruptor"
  ],
  "level": 1460,
  "hp": 324000,
  "atk": 25760,
  "spd": 9500,
  "experience": 250000,
  "gold": 350000,
  "seal": true,
  "boss": false,
  "def": 11000
 },
 "a1_east": {
  "area": 1,
  "name": "灰燼の憤怒",
  "species": [
   "dark_knight",
   "salamander",
   "root_guard"
  ],
  "authorities": [
   "abyss_wrath",
   null,
   null
  ],
  "roles": [
   "leader",
   "support",
   "disruptor"
  ],
  "level": 1520,
  "hp": 336000,
  "atk": 28520,
  "spd": 10000,
  "experience": 375000,
  "gold": 525000,
  "seal": true,
  "boss": false,
  "def": 12000
 },
 "a1_heart": {
  "area": 1,
  "name": "黒根の王・喰界",
  "species": [
   "ogre",
   "mandrake",
   "dark_knight",
   "frost_dryad"
  ],
  "authorities": [
   "abyss_gluttony",
   null,
   null,
   null
  ],
  "roles": [
   "leader",
   "support",
   "disruptor",
   "guardian"
  ],
  "level": 1580,
  "hp": 516000,
  "atk": 31280,
  "spd": 10500,
  "experience": 500000,
  "gold": 700000,
  "seal": false,
  "boss": true,
  "def": 13000
 },
 "a2_patrol": {
  "area": 2,
  "name": "忘却を運ぶ影",
  "species": [
   "wraith",
   "mimic",
   "goblin_shaman"
  ],
  "authorities": [
   null,
   null,
   null
  ],
  "roles": [
   "leader",
   "support",
   "disruptor"
  ],
  "level": 2000,
  "hp": 390000,
  "atk": 34000,
  "spd": 11000,
  "experience": 190000,
  "gold": 260000,
  "seal": false,
  "boss": false,
  "def": 16000
 },
 "a2_west": {
  "area": 2,
  "name": "静寂の深淵",
  "species": [
   "stone_golem",
   "wraith",
   "frost_dryad"
  ],
  "authorities": [
   "abyss_sloth",
   "abyss_lust",
   null
  ],
  "roles": [
   "leader",
   "support",
   "disruptor"
  ],
  "level": 2060,
  "hp": 526500,
  "atk": 38080,
  "spd": 11500,
  "experience": 380000,
  "gold": 520000,
  "seal": true,
  "boss": false,
  "def": 17600
 },
 "a2_east": {
  "area": 2,
  "name": "奪う者の王権",
  "species": [
   "goblin_shaman",
   "mimic",
   "dark_knight"
  ],
  "authorities": [
   "abyss_greed",
   "abyss_envy",
   null
  ],
  "roles": [
   "leader",
   "support",
   "disruptor"
  ],
  "level": 2120,
  "hp": 546000,
  "atk": 42160,
  "spd": 12000,
  "experience": 570000,
  "gold": 780000,
  "seal": true,
  "boss": false,
  "def": 19200
 },
 "a2_heart": {
  "area": 2,
  "name": "深淵の総意",
  "species": [
   "ancient_dragon",
   "dark_knight",
   "wraith",
   "goblin_shaman"
  ],
  "authorities": [
   "abyss_pride",
   "abyss_wrath",
   "abyss_lust",
   "abyss_greed"
  ],
  "roles": [
   "leader",
   "support",
   "disruptor",
   "guardian"
  ],
  "level": 2180,
  "hp": 838500,
  "atk": 46240,
  "spd": 12500,
  "experience": 760000,
  "gold": 1040000,
  "seal": false,
  "boss": true,
  "def": 20800
 },
 "a3_patrol": {
  "area": 3,
  "name": "白金の審問団",
  "species": [
   "angelic_orb",
   "clockwork",
   "water_spirit"
  ],
  "authorities": [
   null,
   null,
   null
  ],
  "roles": [
   "leader",
   "support",
   "disruptor"
  ],
  "level": 2800,
  "hp": 640000,
  "atk": 49000,
  "spd": 13000,
  "experience": 255000,
  "gold": 345000,
  "seal": false,
  "boss": false,
  "def": 23500
 },
 "a3_west": {
  "area": 3,
  "name": "生命を守る神々",
  "species": [
   "water_spirit",
   "dark_knight",
   "angelic_orb"
  ],
  "authorities": [
   "ten_life",
   "ten_death",
   null
  ],
  "roles": [
   "leader",
   "support",
   "disruptor"
  ],
  "level": 2860,
  "hp": 864000,
  "atk": 54880,
  "spd": 13500,
  "experience": 510000,
  "gold": 690000,
  "seal": true,
  "boss": false,
  "def": 25850
 },
 "a3_east": {
  "area": 3,
  "name": "因果を測る神々",
  "species": [
   "clockwork",
   "wyvern",
   "ancient_dragon"
  ],
  "authorities": [
   "ten_time",
   "ten_fate",
   "ten_space"
  ],
  "roles": [
   "leader",
   "support",
   "disruptor"
  ],
  "level": 2920,
  "hp": 896000,
  "atk": 60760,
  "spd": 14000,
  "experience": 765000,
  "gold": 1035000,
  "seal": true,
  "boss": false,
  "def": 28200
 },
 "a3_heart": {
  "area": 3,
  "name": "十神の最終審理",
  "species": [
   "ancient_dragon",
   "water_spirit",
   "clockwork",
   "angelic_orb"
  ],
  "authorities": [
   "ten_divinity",
   "ten_life",
   "ten_time",
   "ten_creation"
  ],
  "roles": [
   "leader",
   "support",
   "disruptor",
   "guardian"
  ],
  "level": 2980,
  "hp": 1376000,
  "atk": 66640,
  "spd": 14500,
  "experience": 1020000,
  "gold": 1380000,
  "seal": false,
  "boss": true,
  "def": 30550
 },
 "a4_patrol": {
  "area": 4,
  "name": "循環の執行兵",
  "species": [
   "divine_machine",
   "eternal_moon",
   "clockwork"
  ],
  "authorities": [
   null,
   null,
   null
  ],
  "roles": [
   "leader",
   "support",
   "disruptor"
  ],
  "level": 3800,
  "hp": 980000,
  "atk": 69000,
  "spd": 15000,
  "experience": 320000,
  "gold": 430000,
  "seal": false,
  "boss": false,
  "def": 33000
 },
 "a4_west": {
  "area": 4,
  "name": "記録を閉ざす者",
  "species": [
   "goblin_shaman",
   "frost_dragon",
   "wyvern"
  ],
  "authorities": [
   "ten_dominion",
   "ten_chaos",
   "ten_fate"
  ],
  "roles": [
   "leader",
   "support",
   "disruptor"
  ],
  "level": 3860,
  "hp": 1323000,
  "atk": 77280,
  "spd": 15500,
  "experience": 640000,
  "gold": 860000,
  "seal": true,
  "boss": false,
  "def": 36300
 },
 "a4_east": {
  "area": 4,
  "name": "修復を続ける者",
  "species": [
   "angelic_orb",
   "water_spirit",
   "salamander"
  ],
  "authorities": [
   "ten_creation",
   "ten_life",
   "ten_end"
  ],
  "roles": [
   "leader",
   "support",
   "disruptor"
  ],
  "level": 3920,
  "hp": 1372000,
  "atk": 85560,
  "spd": 16000,
  "experience": 960000,
  "gold": 1290000,
  "seal": true,
  "boss": false,
  "def": 39600
 },
 "a4_heart": {
  "area": 4,
  "name": "天律の裁定者",
  "species": [
   "ancient_dragon",
   "clockwork",
   "water_spirit",
   "frost_dragon"
  ],
  "authorities": [
   "ten_divinity",
   "ten_time",
   "ten_life",
   "ten_chaos"
  ],
  "roles": [
   "leader",
   "support",
   "disruptor",
   "guardian"
  ],
  "level": 3980,
  "hp": 2107000,
  "atk": 93840,
  "spd": 16500,
  "experience": 1280000,
  "gold": 1720000,
  "seal": false,
  "boss": true,
  "def": 42900
 }
});
export const chapterTwoArea=run=>CHAPTER_TWO_AREAS[run?.area??0]??CHAPTER_TWO_AREAS[0];
export const chapterTwoRooms=run=>chapterTwoArea(run).rooms;
