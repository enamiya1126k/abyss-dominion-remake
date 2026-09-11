// Build408 design contract; no import-time mutation of SPECIES or battle skills.
function freeze(value){if(value && typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;}
export const CHAPTER_TWO_ABILITY_DESIGN408=freeze({
  "build": 408,
  "status": "design_locked_runtime_foundation_only",
  "individualTraitsEnabled": false,
  "pairEnhancementsEnabled": false,
  "common": {
    "pairPerMemberPerRound": 1,
    "pairPerRound": 2,
    "extraMp": 0,
    "duplicateQuota": "side + pairId/abilityId + speciesId",
    "pairRequires": "指定2種が同陣営・生存・行動可能",
    "checkpoint": "quota, receipts, unique deaths, meters, hibernation stored together with HP",
    "terminalProtectedModes": [
      "boss",
      "raid",
      "pvp",
      "online",
      "story",
      "instantDeathImmune"
    ],
    "secondaryEventBudget": 32
  },
  "rankBudgets": [
    {
      "rarity": "N",
      "role": "単独の一点支援。通常火力を犠牲に、対策可能な独自ルール。",
      "statPolicy": "現行の基礎値・成長率を維持。特殊5体だけ個別の開戦時補正を適用。",
      "specialistTarget": "敵の特定戦術に対して1枠採用の価値"
    },
    {
      "rarity": "R",
      "role": "条件を作る前半役。相方なしでは汎用支援。",
      "statPolicy": "現行の基礎値・成長率を維持。特殊5体だけ個別の開戦時補正を適用。",
      "specialistTarget": "SR相方との2枠で状態異常編成を成立"
    },
    {
      "rarity": "SR",
      "role": "Rの条件を回収する専門役、単独の極端能力は回数制限。",
      "statPolicy": "現行の基礎値・成長率を維持。特殊5体だけ個別の開戦時補正を適用。",
      "specialistTarget": "R+SRで得意な相手の2枠基準効率を10〜20%改善"
    },
    {
      "rarity": "SSR",
      "role": "単独でも役割を持つ制御・防御の前半役。",
      "statPolicy": "現行の基礎値・成長率を維持。特殊5体だけ個別の開戦時補正を適用。",
      "specialistTarget": "UR相方と同格の汎用2枠を得意場面で15〜25%改善"
    },
    {
      "rarity": "UR",
      "role": "状態を作りながら回収もできる後半役。",
      "statPolicy": "現行の基礎値・成長率を維持。特殊5体だけ個別の開戦時補正を適用。",
      "specialistTarget": "SSR+URで十神混成への対策枠を狙う"
    },
    {
      "rarity": "LR",
      "role": "蓄積・保護・準備を担当する上位役。",
      "statPolicy": "現行の基礎値・成長率を維持。特殊5体だけ個別の開戦時補正を適用。",
      "specialistTarget": "神話相方との2枠で明確な勝ち筋"
    },
    {
      "rarity": "神話",
      "role": "条件達成時の大技と専門分野で最高峰。",
      "statPolicy": "現行の基礎値・成長率を維持。特殊5体だけ個別の開戦時補正を適用。",
      "specialistTarget": "LR+神話で同育成の十神2枠を得意場面で10〜20%改善、汎用では同等未満"
    }
  ],
  "pairs": [
    {
      "id": "mirrors",
      "label": "鏡侍女",
      "members": [
        "ch2_ryune",
        "ch2_rose"
      ],
      "names": [
        "【鏡侍女】リュネ",
        "【鏡侍女】ロゼ"
      ],
      "ranks": [
        "R",
        "SR"
      ],
      "identity": "標的をそろえる連撃",
      "current": {
        "id": "mirrors",
        "name": "双鏡狂奏",
        "members": [
          "ch2_ryune",
          "ch2_rose"
        ],
        "names": [
          "リュネ",
          "ロゼ"
        ],
        "power": 1.1,
        "hits": 3,
        "damageClass": "physical",
        "defenseIgnore": 0.3,
        "shield": 0.12,
        "scope": "twins",
        "description": "相方が敵単体へ1.10倍×3連撃（防御30%無視）。双子に最大HP12%の障壁。"
      },
      "plannedFeature": {
        "id": "sameTarget",
        "value": 0.2,
        "perRound": 1,
        "perBattle": 999,
        "description": "二人が同じ敵へ自然な攻撃行動を行ったラウンドは、後手の共鳴だけ最終ダメージ+20%。標的を変えると不成立。"
      },
      "counterplay": "相方の行動前に標的を倒す・挑発で標的を分ける。"
    },
    {
      "id": "talismans",
      "label": "霊符",
      "members": [
        "ch2_shion",
        "ch2_suiren"
      ],
      "names": [
        "【霊符】シオン",
        "【霊符】スイレン"
      ],
      "ranks": [
        "SSR",
        "UR"
      ],
      "identity": "回復を封じる結界",
      "current": {
        "id": "talismans",
        "name": "双符百鬼夜行",
        "members": [
          "ch2_shion",
          "ch2_suiren"
        ],
        "names": [
          "シオン",
          "スイレン"
        ],
        "power": 2.2,
        "hits": 1,
        "all": true,
        "damageClass": "magic",
        "defenseIgnore": 0,
        "heal": 0.12,
        "scope": "party",
        "debuff": {
          "kind": "healDown",
          "value": 0.35,
          "turns": 2
        },
        "description": "相方が敵全体へ2.20倍の魔法追撃。命中した敵のHP回復35%低下（2ターン）。生存味方全体のHP12%回復。"
      },
      "plannedFeature": {
        "id": "extendHealBlock",
        "value": 1.0,
        "perRound": 1,
        "perBattle": 999,
        "description": "共鳴が回復阻害中の敵に命中すると、その敵の回復阻害を1ラウンド延長（残り最大3）。"
      },
      "counterplay": "浄化・回復に頼らない部隊で対処。"
    },
    {
      "id": "wings",
      "label": "聖翼",
      "members": [
        "ch2_aure",
        "ch2_noelle"
      ],
      "names": [
        "【聖翼】アウレ",
        "【聖翼】ノエル"
      ],
      "ranks": [
        "LR",
        "神話"
      ],
      "identity": "壊れた翼を守る救援",
      "current": {
        "id": "wings",
        "name": "天穹・双翼聖歌",
        "members": [
          "ch2_aure",
          "ch2_noelle"
        ],
        "names": [
          "アウレ",
          "ノエル"
        ],
        "power": 3,
        "hits": 1,
        "all": true,
        "damageClass": "hybrid",
        "defenseIgnore": 0,
        "heal": 0.2,
        "shield": 0.2,
        "scope": "party",
        "description": "相方が敵全体へ3.00倍の追撃（高い方の攻撃・魔力で判定）。生存味方全体のHP20%回復＋最大HP20%の障壁。"
      },
      "plannedFeature": {
        "id": "rescueBarrier",
        "value": 0.25,
        "perRound": 1,
        "perBattle": 1,
        "description": "いずれかのHPが30%以下になり二人とも生存なら、二人に最大HP25%の専用障壁。死亡後は発動しない。"
      },
      "counterplay": "障壁の解除・単発の致死攻撃・相方の行動不能。"
    },
    {
      "id": "garden",
      "label": "薬毒",
      "members": [
        "ch2_mirea",
        "ch2_viola"
      ],
      "names": [
        "【薬毒】ミレア",
        "【薬毒】ヴィオラ"
      ],
      "ranks": [
        "R",
        "SR"
      ],
      "identity": "毒を薬に変える回復",
      "current": {
        "id": "garden",
        "kind": "相棒",
        "name": "薬毒・豊穣輪舞",
        "members": [
          "ch2_mirea",
          "ch2_viola"
        ],
        "names": [
          "ミレア",
          "ヴィオラ"
        ],
        "power": 2,
        "hits": 1,
        "all": true,
        "damageClass": "magic",
        "defenseIgnore": 0,
        "heal": 0.15,
        "scope": "party",
        "bonusVsStatus": {
          "id": "poison",
          "multiplier": 1.5
        },
        "description": "相方が敵全体へ魔法2.00倍、毒状態の敵には3.00倍。生存味方全体のHP15%回復。先に毒を付けると大幅強化。"
      },
      "plannedFeature": {
        "id": "poisonMedicine",
        "value": 0.08,
        "perRound": 1,
        "perBattle": 999,
        "description": "共鳴時に毒状態の敵が1体以上いれば、生存味方の最低HP割合1人を追加で8%回復。人数で増えない。"
      },
      "counterplay": "毒無効・浄化・回復阻害。"
    },
    {
      "id": "foxmoon",
      "label": "月狐",
      "members": [
        "ch2_kagura",
        "ch2_sayo"
      ],
      "names": [
        "【月狐】カグラ",
        "【月狐】サヨ"
      ],
      "ranks": [
        "SSR",
        "UR"
      ],
      "identity": "火傷を狙う必中",
      "current": {
        "id": "foxmoon",
        "kind": "姉妹",
        "name": "霊狐・焔月神楽",
        "members": [
          "ch2_kagura",
          "ch2_sayo"
        ],
        "names": [
          "カグラ",
          "サヨ"
        ],
        "power": 1.15,
        "hits": 3,
        "damageClass": "physical",
        "defenseIgnore": 0.2,
        "scope": "party",
        "bonusVsStatus": {
          "id": "burn",
          "multiplier": 1.45
        },
        "partyEffect": {
          "kind": "accuracyUp",
          "value": 0.18,
          "turns": 2
        },
        "description": "相方が敵単体へ物理1.15倍×3連撃（防御20%無視）。火傷中には各打撃1.45倍。生存味方全体の命中18%上昇（2ターン）。"
      },
      "plannedFeature": {
        "id": "burnAccuracy",
        "value": 1.0,
        "perRound": 1,
        "perBattle": 999,
        "description": "二人が同じ敵へ自然な攻撃行動した後の共鳴は、その敵が火傷中なら必中。会心確定は付けない。"
      },
      "counterplay": "火傷解除・挑発・相方の行動不能。"
    },
    {
      "id": "starthread",
      "label": "星糸",
      "members": [
        "ch2_celes",
        "ch2_lumina"
      ],
      "names": [
        "【星糸】セレス",
        "【星糸】ルミナ"
      ],
      "ranks": [
        "LR",
        "神話"
      ],
      "identity": "同ラウンドの合流",
      "current": {
        "id": "starthread",
        "kind": "姉妹機",
        "name": "星糸のデュエット",
        "members": [
          "ch2_celes",
          "ch2_lumina"
        ],
        "names": [
          "セレス",
          "ルミナ"
        ],
        "power": 1.6,
        "hits": 1,
        "all": true,
        "damageClass": "hybrid",
        "defenseIgnore": 0,
        "shield": 0.08,
        "scope": "party",
        "burst": {
          "threshold": 2,
          "name": "星幕・終演のアリア",
          "power": 4.2,
          "defenseIgnore": 0.45,
          "shield": 0.22
        },
        "description": "1回目は敵全体1.60倍＋生存味方全体にHP8%障壁。同ラウンド2回目は「星幕・終演のアリア」へ変化：敵全体4.20倍、防御45%無視、HP22%障壁。高い方の攻撃・魔力を使用。"
      },
      "plannedFeature": {
        "id": "burstGuard",
        "value": 0.2,
        "perRound": 1,
        "perBattle": 999,
        "description": "後手の4.20倍共鳴に限り、味方の最低HP割合1人へ1ラウンドの被ダメージ20%軽減。既存軽減とは最大値。"
      },
      "counterplay": "行動順の分断・後手の拘束。"
    },
    {
      "id": "stitch",
      "label": "縫兎",
      "members": [
        "ch2_rikka",
        "ch2_rinne"
      ],
      "names": [
        "【縫兎】リッカ",
        "【縫兎】リンネ"
      ],
      "ranks": [
        "R",
        "SR"
      ],
      "identity": "瀕死からの縫合",
      "current": {
        "id": "stitch",
        "kind": "姉妹",
        "name": "白黒・綴命の契り",
        "members": [
          "ch2_rikka",
          "ch2_rinne"
        ],
        "names": [
          "リッカ",
          "リンネ"
        ],
        "power": 2.2,
        "hits": 1,
        "all": true,
        "damageClass": "physical",
        "defenseIgnore": 0,
        "shield": 0.12,
        "scope": "party",
        "emergency": {
          "threshold": 0.35,
          "name": "白黒・繕命の奇跡",
          "power": 3.1,
          "heal": 0.18,
          "shield": 0.18
        },
        "description": "相方が敵全体へ物理2.20倍、全体にHP12%障壁。発動時に姉妹のどちらかがHP35%以下なら「繕命の奇跡」へ変化：全体3.10倍＋生存味方全体HP18%回復・HP18%障壁。両方の生存が必要。"
      },
      "plannedFeature": {
        "id": "rescueCleanse",
        "value": 1.0,
        "perRound": 1,
        "perBattle": 999,
        "description": "既存のHP35%以下の救援共鳴が発動した時、二人の行動不能以外の弱体を1個ずつ解除（古い順）。"
      },
      "counterplay": "致死攻撃・複数弱体・行動不能は残る。"
    },
    {
      "id": "glassaria",
      "label": "硝子",
      "members": [
        "ch2_seria",
        "ch2_carmia"
      ],
      "names": [
        "【硝子】セリア",
        "【硝子】カルミア"
      ],
      "ranks": [
        "SSR",
        "UR"
      ],
      "identity": "鈍化と回避低下を割る",
      "current": {
        "id": "glassaria",
        "kind": "姉妹",
        "name": "氷紅・硝子の二重奏",
        "members": [
          "ch2_seria",
          "ch2_carmia"
        ],
        "names": [
          "セリア",
          "カルミア"
        ],
        "power": 2.2,
        "hits": 1,
        "all": true,
        "damageClass": "magic",
        "defenseIgnore": 0.15,
        "heal": 0.1,
        "scope": "party",
        "bonusVsEffects": {
          "kinds": [
            "spdDown",
            "evasionDown"
          ],
          "multiplier": 1.65
        },
        "description": "相方が敵全体へ魔法2.20倍、防御15%無視。速度低下と回避低下の両方がある敵には3.63倍。生存味方全体HP10%回復。どちらかの弱体を消すと強化が解除される。"
      },
      "plannedFeature": {
        "id": "doubleDebuffMp",
        "value": 0.04,
        "perRound": 1,
        "perBattle": 999,
        "description": "速度低下・回避低下の両方がある敵へ強化共鳴が命中すると、二人のMPを各最大値4%回復。"
      },
      "counterplay": "どちらかの弱体を浄化・MP回復阻害。"
    },
    {
      "id": "eclipsecrown",
      "label": "終始",
      "members": [
        "ch2_aeriel",
        "ch2_vespera"
      ],
      "names": [
        "【終始】アエリエル",
        "【終始】ヴェスペラ"
      ],
      "ranks": [
        "LR",
        "神話"
      ],
      "identity": "倒した後に次を刈る",
      "current": {
        "id": "eclipsecrown",
        "kind": "姉妹",
        "name": "終始・双冠の断罪",
        "members": [
          "ch2_aeriel",
          "ch2_vespera"
        ],
        "names": [
          "アエリエル",
          "ヴェスペラ"
        ],
        "power": 1.25,
        "hits": 3,
        "damageClass": "hybrid",
        "defenseIgnore": 0.35,
        "heal": 0.12,
        "scope": "party",
        "dispelOne": true,
        "description": "最初の対象の解除可能な強化を1つ取り除き、相方が単体1.25倍×3連撃、防御35%無視。攻撃・魔力の高い方を使用。生存味方全体HP12%回復。倒すと残りの打撃は別の生存敵へ向かう。"
      },
      "plannedFeature": {
        "id": "retargetDispel",
        "value": 1.0,
        "perRound": 1,
        "perBattle": 999,
        "description": "共鳴の残り打撃が別の敵へ移った時、最初の移動先1人の強化を1個解除。追加攻撃は生成しない。"
      },
      "counterplay": "高耐久の単体・解除不能強化。"
    },
    {
      "id": "oathguard",
      "label": "誓姫",
      "members": [
        "ch2_lyriet",
        "ch2_rosette"
      ],
      "names": [
        "【誓姫】リリエット",
        "【誓姫】ロゼット"
      ],
      "ranks": [
        "R",
        "SR"
      ],
      "identity": "障壁が砕けたら守る",
      "current": {
        "id": "oathguard",
        "kind": "双子",
        "name": "誓約・双剣の護陣",
        "members": [
          "ch2_lyriet",
          "ch2_rosette"
        ],
        "names": [
          "リリエット",
          "ロゼット"
        ],
        "power": 2.1,
        "hits": 1,
        "all": true,
        "damageClass": "physical",
        "defenseIgnore": 0,
        "shield": 0.18,
        "scope": "party",
        "partyEffect": {
          "kind": "atkUp",
          "value": 0.12,
          "turns": 2
        },
        "description": "相方が敵全体へ物理2.10倍。生存味方全体に最大HP18%の障壁と攻撃12%上昇（2ターン）。連撃をしのいで攻勢へ移る双子の護陣。障壁は加算されない。"
      },
      "plannedFeature": {
        "id": "brokenShieldDefense",
        "value": 0.15,
        "perRound": 1,
        "perBattle": 999,
        "description": "自分たちの共鳴障壁が敵の攻撃で全消費された時、二人に防御15%上昇を2ラウンド。期限切れ・上書きでは発動しない。"
      },
      "counterplay": "防御無視・障壁解除・消耗の時間差。"
    },
    {
      "id": "rosevow",
      "label": "薔薇",
      "members": [
        "ch2_noctelle",
        "ch2_auriane"
      ],
      "names": [
        "【薔薇】ノクテル",
        "【薔薇】オーリアン"
      ],
      "ranks": [
        "SSR",
        "UR"
      ],
      "identity": "窮地を越える誓い",
      "current": {
        "id": "rosevow",
        "kind": "姉妹",
        "name": "薔薇・黎闇の契り",
        "members": [
          "ch2_noctelle",
          "ch2_auriane"
        ],
        "names": [
          "ノクテル",
          "オーリアン"
        ],
        "power": 1.3,
        "hits": 3,
        "damageClass": "physical",
        "defenseIgnore": 0.25,
        "heal": 0.12,
        "scope": "party",
        "emergency": {
          "threshold": 0.4,
          "name": "薔薇・不滅の黎明",
          "power": 1.65,
          "heal": 0.2
        },
        "description": "相方が単体へ物理1.30倍×3連撃、防御25%無視。生存味方全体HP12%回復。発動時に姉妹のどちらかがHP40%以下なら「不滅の黎明」：1.65倍×3連撃＋全体HP20%回復。両方の生存が必要。"
      },
      "plannedFeature": {
        "id": "emergencyHealCleanse",
        "value": 1.0,
        "perRound": 1,
        "perBattle": 999,
        "description": "HP40%以下で始まる強化共鳴の最後の一撃が命中したら、低HP側1人の回復阻害を1個解除。"
      },
      "counterplay": "相方を拘束・命中を落とす・致死攻撃。"
    },
    {
      "id": "twinclock",
      "label": "星刻",
      "members": [
        "ch2_eirene",
        "ch2_iridelle"
      ],
      "names": [
        "【星刻】エイレーネ",
        "【星刻】イリデル"
      ],
      "ranks": [
        "LR",
        "神話"
      ],
      "identity": "遅らせて刻む一撃",
      "current": {
        "id": "twinclock",
        "kind": "姉妹",
        "name": "双刻・星律の終奏",
        "members": [
          "ch2_eirene",
          "ch2_iridelle"
        ],
        "names": [
          "エイレーネ",
          "イリデル"
        ],
        "power": 2.4,
        "hits": 1,
        "all": true,
        "damageClass": "hybrid",
        "defenseIgnore": 0.2,
        "shield": 0.1,
        "scope": "party",
        "partyEffect": {
          "kind": "spdUp",
          "value": 0.18,
          "turns": 2
        },
        "bonusVsEffects": {
          "kinds": [
            "spdDown",
            "defDown"
          ],
          "multiplier": 1.6
        },
        "description": "相方が敵全体へ2.40倍、防御20%無視。速度低下と防御低下の両方がある敵には3.84倍。高い方の攻撃・魔力を使用。生存味方全体にHP10%障壁と速度18%上昇（2ターン）。"
      },
      "plannedFeature": {
        "id": "clockTempo",
        "value": 0.25,
        "perRound": 1,
        "perBattle": 999,
        "description": "速度低下と防御低下の両方がある敵への強化共鳴が命中すると、二人だけ既存の速度18%上昇を25%へ置換（2ラウンド）。"
      },
      "counterplay": "弱体解除・速度低下無効・全体CT操作は持たない。"
    },
    {
      "id": "wisteria",
      "label": "双藤",
      "members": [
        "ch2_nevia",
        "ch2_elmina"
      ],
      "names": [
        "【双藤】ネヴィア",
        "【双藤】エルミナ"
      ],
      "ranks": [
        "R",
        "SR"
      ],
      "identity": "毒から回復封鎖",
      "current": {
        "id": "wisteria",
        "kind": "双子",
        "name": "双藤・毒鎖の刈舞",
        "members": [
          "ch2_nevia",
          "ch2_elmina"
        ],
        "names": [
          "ネヴィア",
          "エルミナ"
        ],
        "power": 1.1,
        "hits": 3,
        "damageClass": "physical",
        "defenseIgnore": 0.2,
        "scope": "party",
        "bonusVsStatus": {
          "id": "poison",
          "multiplier": 1.6
        },
        "debuff": {
          "kind": "healDown",
          "value": 0.25,
          "turns": 2
        },
        "description": "相方が単体へ物理1.10倍×3連撃、防御20%無視。毒状態の敵には各打撃1.76倍。命中した敵の受けるHP回復25%低下（2ターン）。毒を先に付けると大幅強化。"
      },
      "plannedFeature": {
        "id": "poisonHealSeal",
        "value": 0.4,
        "perRound": 1,
        "perBattle": 999,
        "description": "毒への強化共鳴が命中した敵の回復阻害を25%から40%へ置換（2ラウンド）。"
      },
      "counterplay": "毒無効・浄化・回復以外で耐える。"
    },
    {
      "id": "twinthunder",
      "label": "双雷",
      "members": [
        "ch2_calista",
        "ch2_solenne"
      ],
      "names": [
        "【双雷】カリスタ",
        "【双雷】ソレーヌ"
      ],
      "ranks": [
        "SSR",
        "UR"
      ],
      "identity": "二人目が落とす雷",
      "current": {
        "id": "twinthunder",
        "kind": "姉妹",
        "name": "双雷・天穿の連星",
        "members": [
          "ch2_calista",
          "ch2_solenne"
        ],
        "names": [
          "カリスタ",
          "ソレーヌ"
        ],
        "power": 2,
        "hits": 1,
        "all": true,
        "damageClass": "physical",
        "defenseIgnore": 0,
        "shield": 0.08,
        "scope": "party",
        "partyEffect": {
          "kind": "spdUp",
          "value": 0.15,
          "turns": 2
        },
        "burst": {
          "threshold": 2,
          "name": "双雷・天穿の終雷",
          "power": 4.4,
          "defenseIgnore": 0.35,
          "shield": 0.18
        },
        "description": "1回目は敵全体へ物理2.00倍、全体にHP8%障壁・速度15%上昇（2ターン）。同ラウンド2回目は「天穿の終雷」：全体4.40倍、防御35%無視、HP18%障壁。同じキャラの複数個体では2回目を発動できない。"
      },
      "plannedFeature": {
        "id": "burstDiscount",
        "value": 0.1,
        "perRound": 1,
        "perBattle": 999,
        "description": "後手の4.40倍共鳴が敵1体以上へ命中すると、二人の次の固有スキルのMP消費を各10%軽減。1回使うか次ラウンド末に消失。"
      },
      "counterplay": "後手を止める・MPを枯らす。CTは減らさない。"
    },
    {
      "id": "twinkeys",
      "label": "封鍵",
      "members": [
        "ch2_meliora",
        "ch2_elyselle"
      ],
      "names": [
        "【封鍵】メリオラ",
        "【封鍵】エリゼル"
      ],
      "ranks": [
        "LR",
        "神話"
      ],
      "identity": "強化を鍵にする連撃",
      "current": {
        "id": "twinkeys",
        "kind": "姉妹機",
        "name": "双鍵・封界解放",
        "members": [
          "ch2_meliora",
          "ch2_elyselle"
        ],
        "names": [
          "メリオラ",
          "エリゼル"
        ],
        "power": 1.1,
        "hits": 4,
        "damageClass": "hybrid",
        "defenseIgnore": 0.4,
        "heal": 0.12,
        "shield": 0.14,
        "scope": "party",
        "dispelOne": true,
        "description": "最初の対象の解除可能な強化を1つ剥がし、相方が単体へ1.10倍×4連撃、防御40%無視。高い方の攻撃・魔力を使用。生存味方全体HP12%回復・HP14%障壁。倒すと残りの打撃は別の生存敵へ。"
      },
      "plannedFeature": {
        "id": "dispelPierce",
        "value": 0.6,
        "perRound": 1,
        "perBattle": 999,
        "description": "共鳴の強化解除が成功すると、最後の1打のみ防御無視を40%から60%へ置換。対象死亡時は残り打撃の移動先に適用。"
      },
      "counterplay": "解除可能な強化を置かない・解除不能強化。"
    },
    {
      "id": "frostshatter",
      "label": "氷晶",
      "members": [
        "ch2_iselle",
        "ch2_virelle"
      ],
      "names": [
        "【氷晶】イゼル",
        "【氷晶】ヴィレル"
      ],
      "ranks": [
        "R",
        "SR"
      ],
      "identity": "凍結の破砕",
      "current": {
        "id": "frostshatter",
        "kind": "双子",
        "name": "双晶・氷紋粉砕",
        "members": [
          "ch2_iselle",
          "ch2_virelle"
        ],
        "names": [
          "イゼル",
          "ヴィレル"
        ],
        "power": 1.15,
        "hits": 3,
        "damageClass": "hybrid",
        "defenseIgnore": 0.25,
        "scope": "twins",
        "bonusVsStatus": {
          "id": "freeze",
          "multiplier": 1.7
        },
        "description": "単体へ1.15倍×3連撃、防御25%無視。凍結中の標的には各打撃1.955倍。相方の攻撃・魔力の高い方で判定。先に氷紋で凍らせて粉砕する。"
      },
      "plannedFeature": {
        "id": "frostGuard",
        "value": 0.1,
        "perRound": 1,
        "perBattle": 999,
        "description": "凍結相手への強化共鳴後、凍結を延長せず二人に次の被ダメージ10%軽減を付与（1回・次ラウンド末まで）。"
      },
      "counterplay": "凍結無効・浄化。永久凍結はできない。"
    },
    {
      "id": "oathreturn",
      "label": "返誓",
      "members": [
        "ch2_rostia",
        "ch2_althea"
      ],
      "names": [
        "【返誓】ロスティア",
        "【返誓】アルテア"
      ],
      "ranks": [
        "SSR",
        "UR"
      ],
      "identity": "防いだ側と相方の反撃",
      "current": {
        "id": "oathreturn",
        "kind": "姉妹機",
        "name": "双誓・黒盾紅剣",
        "members": [
          "ch2_rostia",
          "ch2_althea"
        ],
        "names": [
          "ロスティア",
          "アルテア"
        ],
        "power": 1.7,
        "hits": 1,
        "damageClass": "physical",
        "defenseIgnore": 0.2,
        "shield": 0.18,
        "scope": "twins",
        "partyEffect": {
          "kind": "guard",
          "value": 0.25,
          "turns": 2
        },
        "counter390": {
          "name": "双誓・返誓の紅刃",
          "power": 2.4,
          "defenseIgnore": 0.25
        },
        "description": "単体へ物理1.70倍、防御20%無視。姉妹にHP18%障壁・被ダメージ25%軽減（2ターン）。この護誓中に攻撃を受けると、攻撃行動後に相方が攻撃者へ2.40倍の反撃（防御25%無視）。各姉妹の被弾につき1ラウンド1回、合計最大2回。反撃から反撃・共鳴は連鎖しない。"
      },
      "plannedFeature": {
        "id": "counterMend",
        "value": 0.05,
        "perRound": 2,
        "perBattle": 999,
        "description": "既存の相方カウンターが命中すると、守られた本人を最大HP5%回復。反撃1回ごと、同一被防御種はラウンド1回。"
      },
      "counterplay": "ガード解除・相方拘束・回復阻害。"
    },
    {
      "id": "starconfluence",
      "label": "魔導姫",
      "members": [
        "ch2_sephira",
        "ch2_astrelle"
      ],
      "names": [
        "【魔導姫】セフィラ",
        "【魔導姫】アストレル"
      ],
      "ranks": [
        "LR",
        "神話"
      ],
      "identity": "二人で溜めて放つ",
      "current": {
        "id": "starconfluence",
        "kind": "姉妹",
        "name": "双星・星門詠唱",
        "members": [
          "ch2_sephira",
          "ch2_astrelle"
        ],
        "names": [
          "セフィラ",
          "アストレル"
        ],
        "power": 0,
        "hits": 0,
        "damageClass": "magic",
        "defenseIgnore": 0,
        "shield": 0.12,
        "scope": "party",
        "charge390": {
          "threshold": 3,
          "release": {
            "name": "双星・極天星門",
            "power": 5.5,
            "hits": 1,
            "all": true,
            "damageClass": "magic",
            "defenseIgnore": 0.35,
            "shield": 0.2
          }
        },
        "description": "共鳴1・2回目は魔力を1つ蓄積し、生存味方全体にHP12%障壁。3回目は蓄積を消費して敵全体へ魔法5.50倍、防御35%無視、全体HP20%障壁。蓄積はラウンドをまたいで保持。各キャラ1ラウンド1回のため、最速で2ラウンド目に合体魔法。"
      },
      "plannedFeature": {
        "id": "chargedAccuracy",
        "value": 1.0,
        "perRound": 1,
        "perBattle": 999,
        "description": "既存の3回目・5.50倍の解放共鳴は、開始時に二人が生存かつ行動可能なら必中。会心は通常判定。"
      },
      "counterplay": "解放前に片方を拘束・倒す。単独では充填しない。"
    },
    {
      "id": "crimsonwings",
      "label": "紅羽",
      "members": [
        "ch2_nizelle",
        "ch2_charne"
      ],
      "names": [
        "【紅羽】ニゼル",
        "【紅羽】シャルネ"
      ],
      "ranks": [
        "R",
        "SR"
      ],
      "identity": "出血から追い詰める",
      "current": {
        "id": "crimsonwings",
        "kind": "双子",
        "name": "双羽・紅糸乱舞",
        "members": [
          "ch2_nizelle",
          "ch2_charne"
        ],
        "names": [
          "ニゼル",
          "シャルネ"
        ],
        "power": 1.2,
        "hits": 3,
        "damageClass": "physical",
        "defenseIgnore": 0.25,
        "scope": "twins",
        "bonusVsStatus": {
          "id": "bleed",
          "multiplier": 1.6
        },
        "description": "相方が単体へ物理1.20倍×3連撃、防御25%無視。出血中の標的には各打撃1.92倍。姉の出血から妹の双剣へつなぐ。"
      },
      "plannedFeature": {
        "id": "bleedPressure",
        "value": 0.2,
        "perRound": 1,
        "perBattle": 999,
        "description": "出血への強化共鳴が命中した敵1体に、被回復量20%低下を2ラウンド。既存阻害とは最大値。"
      },
      "counterplay": "出血無効・浄化・回復以外の防御。"
    },
    {
      "id": "absolutionbells",
      "label": "双鐘",
      "members": [
        "ch2_ferne",
        "ch2_clarisse"
      ],
      "names": [
        "【双鐘】フェルネ",
        "【双鐘】クラリス"
      ],
      "ranks": [
        "SSR",
        "UR"
      ],
      "identity": "浄化した数を防壁に",
      "current": {
        "id": "absolutionbells",
        "kind": "姉妹機",
        "name": "双鐘・宵暁の赦し",
        "members": [
          "ch2_ferne",
          "ch2_clarisse"
        ],
        "names": [
          "フェルネ",
          "クラリス"
        ],
        "power": 2.3,
        "hits": 1,
        "all": true,
        "damageClass": "hybrid",
        "defenseIgnore": 0.2,
        "scope": "party",
        "cleanse391": true,
        "heal": 0.1,
        "description": "相方が敵全体へ2.30倍、防御20%無視（攻撃・魔力の高い方）。追撃後、生存味方全体の状態異常・弱体を浄化してHP10%回復。戦闘不能の復活や固有スキルの再使用待ち解除は行わない。"
      },
      "plannedFeature": {
        "id": "cleanseShield",
        "value": 0.1,
        "perRound": 1,
        "perBattle": 999,
        "description": "既存の共鳴浄化が味方から1個以上を解除した時、二人に最大HP10%の障壁。異常数で増えない。"
      },
      "counterplay": "異常を使わず火力で押す・障壁解除。"
    },
    {
      "id": "eclipserenewal",
      "label": "日月",
      "members": [
        "ch2_lunaria",
        "ch2_solaria"
      ],
      "names": [
        "【日月】ルナリア",
        "【日月】ソラリア"
      ],
      "ranks": [
        "LR",
        "神話"
      ],
      "identity": "魔力の昼夜循環",
      "current": {
        "id": "eclipserenewal",
        "kind": "姉妹",
        "name": "双輪・日月巡環",
        "members": [
          "ch2_lunaria",
          "ch2_solaria"
        ],
        "names": [
          "ルナリア",
          "ソラリア"
        ],
        "power": 2.6,
        "hits": 1,
        "all": true,
        "damageClass": "magic",
        "defenseIgnore": 0.3,
        "scope": "twins",
        "mpHeal391": 0.12,
        "description": "相方が敵全体へ魔法2.60倍、防御30%無視。追撃後、姉妹2人のMPを最大MPの12%ずつ回復。MP回復阻害の影響を受ける。1組1ラウンド最大2回、複製個体では回数を増やせない。"
      },
      "plannedFeature": {
        "id": "overflowDiscount",
        "value": 0.1,
        "perRound": 1,
        "perBattle": 999,
        "description": "既存の共鳴MP回復が満タンであふれた場合、二人へ次の固有スキルのMP消費10%軽減（各1回・次ラウンド末まで）。"
      },
      "counterplay": "MP回復阻害・MP吸収。MPを超えて蓄積しない。"
    },
    {
      "id": "dreamharvest",
      "label": "夢境",
      "members": [
        "ch2_morina",
        "ch2_elmize"
      ],
      "names": [
        "【夢境】モリナ",
        "【夢境】エルミゼ"
      ],
      "ranks": [
        "R",
        "SR"
      ],
      "identity": "眠りを逃がさない刈取り",
      "current": {
        "id": "dreamharvest",
        "kind": "双子",
        "name": "双夢・夢境刈り",
        "members": [
          "ch2_morina",
          "ch2_elmize"
        ],
        "names": [
          "モリナ",
          "エルミゼ"
        ],
        "power": 3.2,
        "hits": 1,
        "damageClass": "hybrid",
        "defenseIgnore": 0.3,
        "scope": "twins",
        "bonusVsStatus": {
          "id": "sleep",
          "multiplier": 1.8
        },
        "description": "相方が単体へ3.20倍、防御30%無視（攻撃・魔力の高い方）。睡眠中の標的には5.76倍。眠らせた直後の一撃を狙う双子の連携。"
      },
      "plannedFeature": {
        "id": "dreamAfterimage",
        "value": 0.15,
        "perRound": 1,
        "perBattle": 999,
        "description": "睡眠への5.76倍共鳴が命中した場合、対象に命中15%低下を2ラウンド。睡眠は通常どおり解除され得る。"
      },
      "counterplay": "睡眠無効・浄化・必中攻撃。"
    },
    {
      "id": "dragonliberation",
      "label": "竜姫",
      "members": [
        "ch2_dracia",
        "ch2_rucie"
      ],
      "names": [
        "【竜姫】ドラシア",
        "【竜姫】リュシエ"
      ],
      "ranks": [
        "SSR",
        "UR"
      ],
      "identity": "敵の加護を奪う盾",
      "current": {
        "id": "dragonliberation",
        "kind": "姉妹",
        "name": "双竜・天鎖解放",
        "members": [
          "ch2_dracia",
          "ch2_rucie"
        ],
        "names": [
          "ドラシア",
          "リュシエ"
        ],
        "power": 2.7,
        "hits": 1,
        "all": true,
        "damageClass": "physical",
        "defenseIgnore": 0.25,
        "scope": "twins",
        "dispelEach392": true,
        "shield": 0.2,
        "description": "敵全体それぞれの解除可能な強化を1つ剥がし、相方が物理2.70倍、防御25%無視の追撃。姉妹に最大HP20%の障壁。解除対象は強化効果で、HP障壁や魔法陣そのものは破壊しない。"
      },
      "plannedFeature": {
        "id": "dispelBarrier",
        "value": 0.28,
        "perRound": 1,
        "perBattle": 999,
        "description": "共鳴で敵の強化を1個以上解除した場合、二人の共鳴障壁を20%から28%へ置換。解除数で増えない。"
      },
      "counterplay": "解除できる強化を置かない・障壁解除。"
    },
    {
      "id": "crownsfinale",
      "label": "剣姫",
      "members": [
        "ch2_nemesia",
        "ch2_everia"
      ],
      "names": [
        "【剣姫】ネメシア",
        "【剣姫】エヴェリア"
      ],
      "ranks": [
        "LR",
        "神話"
      ],
      "identity": "二人で作る終幕",
      "current": {
        "id": "crownsfinale",
        "kind": "姉妹",
        "name": "双冠・夜明けの誓剣",
        "members": [
          "ch2_nemesia",
          "ch2_everia"
        ],
        "names": [
          "ネメシア",
          "エヴェリア"
        ],
        "power": 2.1,
        "hits": 1,
        "all": true,
        "damageClass": "physical",
        "defenseIgnore": 0.2,
        "scope": "party",
        "shield": 0.1,
        "burst": {
          "threshold": 2,
          "name": "双冠・黒白の終剣",
          "power": 3.8,
          "defenseIgnore": 0.35,
          "shield": 0.18,
          "bonusVsHp392": {
            "threshold": 0.35,
            "multiplier": 1.6
          }
        },
        "description": "1回目は敵全体へ物理2.10倍、防御20%無視、全体HP10%障壁。同ラウンドにもう一方が連携すると「黒白の終剣」：全体3.80倍、防御35%無視、全体HP18%障壁。終剣の命中直前にHP35%以下の敵には6.08倍。各敵の残HPを個別に判定する。"
      },
      "plannedFeature": {
        "id": "finaleMomentum",
        "value": 0.1,
        "perRound": 1,
        "perBattle": 999,
        "description": "後手の強化共鳴でHP35%以下の敵へ命中した場合、次ラウンドの最初の共鳴だけ攻撃者自身の計算に対して最終ダメージ+10%。持越し1回まで。"
      },
      "counterplay": "35%を割る前に回復・後手を止める。追加ラウンドは得ない。"
    }
  ],
  "traits": [
    {
      "id": "deathPact",
      "speciesId": "ch2_senela",
      "name": "灰燭の道連れ",
      "rarity": "SR",
      "entryMultipliers": {
        "hp": 0.55,
        "atk": 0.5,
        "matk": 0.5,
        "def": 0.55,
        "mdef": 0.55,
        "spd": 0.8
      },
      "trigger": "敵の一次攻撃・敵由来DoTで本人の戦闘不能が確定した直後",
      "perRound": 1,
      "perBattle": 1,
      "description": "倒した敵1人に道連れ。撃破者が死亡・不明なら生存敵の脅威値最大（同値はID順）。通常敵はHP0への終端攻撃。防御と通常障壁を無視し、無敵・踏みとどまり・自動蘇生は尊重。",
      "exception": "全ボス・レイド・PvP・オンライン・物語保護・即死無効には、開戦時魔法ATK×2.0の通常闇ダメージ。",
      "counterplay": "本人を無視、反射・味方の自傷では発動させない、無敵・踏みとどまり。",
      "notes": "道連れによる死は別の道連れを誘発しない。同種複数でも陣営1回。蘇生で回数は戻らない。",
      "characterName": "灰燭の呪術師セネラ"
    },
    {
      "id": "reverseLetter",
      "speciesId": "ch2_lumea",
      "name": "裏返しの封書",
      "rarity": "N",
      "entryMultipliers": {
        "hp": 0.55,
        "atk": 0.5,
        "matk": 0.5,
        "def": 0.6,
        "mdef": 0.6,
        "spd": 0.8
      },
      "trigger": "本人への敵由来の通常弱体が命中した直後・付与前",
      "perRound": null,
      "perBattle": null,
      "description": "現行21種の通常弱体を自分への2ラウンドのバフへ置換。同種は加算せず最大値で更新。ステータス系は12%、再生は3%。回数制限なし。",
      "exception": "CT延長・MP吸収・強化解除・隔離・権能・コスト・味方や自分由来の弱体は反転しない。",
      "counterplay": "直接ダメージ・強化解除・MP吸収。本人だけが対象で、味方の異常は防げない。",
      "notes": "変換前の状態異常とstun補助効果は両方生成しない。入場前に付いていた異常は通常の浄化が必要。",
      "characterName": "封書の小剣姫ルメア"
    },
    {
      "id": "hibernation",
      "speciesId": "ch2_noctia",
      "name": "十夜の冬眠鐘",
      "rarity": "SSR",
      "entryMultipliers": {
        "hp": 0.4,
        "atk": 0.25,
        "matk": 0.25,
        "def": 0.4,
        "mdef": 0.4,
        "spd": 0.5
      },
      "trigger": "本人の自然行動開始。最初の10回を見送り、11回目に解放",
      "perRound": 1,
      "perBattle": 1,
      "description": "生存敵全体へHP1を下限とする終端攻撃。防御と通常障壁を無視。通常行動・スキル・ガードは10回とも行わない。被弾だけでは冬眠を解除しない。",
      "exception": "全ボス等の保護対象には開戦時魔法ATK（弱体化前）×4.0の通常氷ダメージ。無敵・ダメージ無効は尊重。",
      "counterplay": "11回目までに倒す・隔離・麻痺等で自然行動のカウントを止める。",
      "notes": "倍速・追加行動・CT短縮では進まない。戦闘不能で中断、蘇生しても再開しない。解放後は弱い本体で通常行動に戻る。",
      "characterName": "霜鐘梟ノクティア"
    },
    {
      "id": "deathAbsorb",
      "speciesId": "ch2_velg",
      "name": "鎖翼の死喰い",
      "rarity": "UR",
      "entryMultipliers": {
        "hp": 0.25,
        "atk": 0.25,
        "matk": 0.25,
        "def": 0.25,
        "mdef": 0.25,
        "spd": 0.8
      },
      "trigger": "本人が生存中、開戦時から存在する他ユニットの最初の戦闘不能が確定",
      "perRound": 3,
      "perBattle": 3,
      "description": "HP・物理ATK・魔法ATK・両DEFが死亡1件ごとに2倍、最大8倍。開戦時基準比25%→50%→100%→200%。速度は80%固定。",
      "exception": "同じ個体の蘇生後再死亡・召喚物・捕獲・離脱・本人の死は数えない。同時全滅時は吸収しない。",
      "counterplay": "成長前に本人へ集中攻撃。味方を犠牲にすると行動人数を失う。",
      "notes": "最大HPが増えても現在HPは回復しない。恒久ステータスには加算しない。成長は陣営同種共有、最大3件を複製して増幅しない。",
      "characterName": "鎖翼竜ヴェルグ"
    },
    {
      "id": "paperShield",
      "speciesId": "ch2_fiora",
      "name": "百命の従騎盾",
      "rarity": "N",
      "entryMultipliers": {
        "hp": 1,
        "atk": 0.5,
        "matk": 0.5,
        "def": 0.5,
        "mdef": 0.5,
        "spd": 0.8
      },
      "fixedMaxHp": 100,
      "trigger": "開戦時と本人の自然行動開始時（本人が生存・行動可能）",
      "perRound": 1,
      "perBattle": 999,
      "description": "本人を除く生存味方全員へ、各自の開戦時最大HP8%の専用障壁を2ラウンド付与。自分の最大HPは装備・強化を含め最終100固定。",
      "exception": "自身には全ての障壁を付与できない。HP増加・蘇生で最大HP100を超えない。",
      "counterplay": "全体攻撃・継続ダメージ・本人狙い・行動不能。",
      "notes": "同種複数の盾は陣営で共有、加算せず8%まで更新。開戦時付与はラウンド1の枠を消費。既存「従騎の小さな盾」は同じ専用盾の8%更新へ置換。",
      "characterName": "夜灯の従騎フィオラ"
    }
  ]
});
