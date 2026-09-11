// Presentation names only. Pair IDs, member IDs and combat rules stay stable.
const rows=[
  {
    "id": "mirrors",
    "group": "鏡侍女",
    "members": [
      {
        "id": "ch2_ryune",
        "short": "リュネ",
        "legacyName": "湖鏡の侍女リュネ"
      },
      {
        "id": "ch2_rose",
        "short": "ロゼ",
        "legacyName": "紅鏡の侍女ロゼ"
      }
    ]
  },
  {
    "id": "talismans",
    "group": "霊符",
    "members": [
      {
        "id": "ch2_shion",
        "short": "シオン",
        "legacyName": "幽符の姉シオン"
      },
      {
        "id": "ch2_suiren",
        "short": "スイレン",
        "legacyName": "霊鈴の妹スイレン"
      }
    ]
  },
  {
    "id": "wings",
    "group": "聖翼",
    "members": [
      {
        "id": "ch2_aure",
        "short": "アウレ",
        "legacyName": "暁翼の祈姫アウレ"
      },
      {
        "id": "ch2_noelle",
        "short": "ノエル",
        "legacyName": "宵翼の詠姫ノエル"
      }
    ]
  },
  {
    "id": "garden",
    "group": "薬毒",
    "members": [
      {
        "id": "ch2_mirea",
        "short": "ミレア",
        "legacyName": "翠薬の魔女ミレア"
      },
      {
        "id": "ch2_viola",
        "short": "ヴィオラ",
        "legacyName": "毒花の魔女ヴィオラ"
      }
    ]
  },
  {
    "id": "foxmoon",
    "group": "月狐",
    "members": [
      {
        "id": "ch2_kagura",
        "short": "カグラ",
        "legacyName": "紅月の巫狐カグラ"
      },
      {
        "id": "ch2_sayo",
        "short": "サヨ",
        "legacyName": "蒼月の巫狐サヨ"
      }
    ]
  },
  {
    "id": "starthread",
    "group": "星糸",
    "members": [
      {
        "id": "ch2_celes",
        "short": "セレス",
        "legacyName": "星糸の織姫セレス"
      },
      {
        "id": "ch2_lumina",
        "short": "ルミナ",
        "legacyName": "星刃の舞姫ルミナ"
      }
    ]
  },
  {
    "id": "stitch",
    "group": "縫兎",
    "members": [
      {
        "id": "ch2_rikka",
        "short": "リッカ",
        "legacyName": "白兎の縫姫リッカ"
      },
      {
        "id": "ch2_rinne",
        "short": "リンネ",
        "legacyName": "黒兎の鋏姫リンネ"
      }
    ]
  },
  {
    "id": "glassaria",
    "group": "硝子",
    "members": [
      {
        "id": "ch2_seria",
        "short": "セリア",
        "legacyName": "氷硝の歌姫セリア"
      },
      {
        "id": "ch2_carmia",
        "short": "カルミア",
        "legacyName": "紅硝の奏姫カルミア"
      }
    ]
  },
  {
    "id": "eclipsecrown",
    "group": "終始",
    "members": [
      {
        "id": "ch2_aeriel",
        "short": "アエリエル",
        "legacyName": "終律の聖姫アエリエル"
      },
      {
        "id": "ch2_vespera",
        "short": "ヴェスペラ",
        "legacyName": "始淵の魔姫ヴェスペラ"
      }
    ]
  },
  {
    "id": "oathguard",
    "group": "誓姫",
    "members": [
      {
        "id": "ch2_lyriet",
        "short": "リリエット",
        "legacyName": "蒼刃の誓姫リリエット"
      },
      {
        "id": "ch2_rosette",
        "short": "ロゼット",
        "legacyName": "紅盾の誓姫ロゼット"
      }
    ]
  },
  {
    "id": "rosevow",
    "group": "薔薇",
    "members": [
      {
        "id": "ch2_noctelle",
        "short": "ノクテル",
        "legacyName": "黒薔薇の刃姫ノクテル"
      },
      {
        "id": "ch2_auriane",
        "short": "オーリアン",
        "legacyName": "白薔薇の衛姫オーリアン"
      }
    ]
  },
  {
    "id": "twinclock",
    "group": "星刻",
    "members": [
      {
        "id": "ch2_eirene",
        "short": "エイレーネ",
        "legacyName": "蒼刻の星姫エイレーネ"
      },
      {
        "id": "ch2_iridelle",
        "short": "イリデル",
        "legacyName": "緋刻の星姫イリデル"
      }
    ]
  },
  {
    "id": "wisteria",
    "group": "双藤",
    "members": [
      {
        "id": "ch2_nevia",
        "short": "ネヴィア",
        "legacyName": "藤影の鎖姫ネヴィア"
      },
      {
        "id": "ch2_elmina",
        "short": "エルミナ",
        "legacyName": "白藤の鎌姫エルミナ"
      }
    ]
  },
  {
    "id": "twinthunder",
    "group": "双雷",
    "members": [
      {
        "id": "ch2_calista",
        "short": "カリスタ",
        "legacyName": "蒼雷の槍姫カリスタ"
      },
      {
        "id": "ch2_solenne",
        "short": "ソレーヌ",
        "legacyName": "金雷の盾姫ソレーヌ"
      }
    ]
  },
  {
    "id": "twinkeys",
    "group": "封鍵",
    "members": [
      {
        "id": "ch2_meliora",
        "short": "メリオラ",
        "legacyName": "冥鍵の剣姫メリオラ"
      },
      {
        "id": "ch2_elyselle",
        "short": "エリゼル",
        "legacyName": "聖鍵の冠姫エリゼル"
      }
    ]
  },
  {
    "id": "frostshatter",
    "group": "氷晶",
    "members": [
      {
        "id": "ch2_iselle",
        "short": "イゼル",
        "legacyName": "氷紋の杖姫イゼル"
      },
      {
        "id": "ch2_virelle",
        "short": "ヴィレル",
        "legacyName": "砕氷の槌姫ヴィレル"
      }
    ]
  },
  {
    "id": "oathreturn",
    "group": "返誓",
    "members": [
      {
        "id": "ch2_rostia",
        "short": "ロスティア",
        "legacyName": "黒盾の誓姫ロスティア"
      },
      {
        "id": "ch2_althea",
        "short": "アルテア",
        "legacyName": "紅剣の返誓姫アルテア"
      }
    ]
  },
  {
    "id": "starconfluence",
    "group": "魔導姫",
    "members": [
      {
        "id": "ch2_sephira",
        "short": "セフィラ",
        "legacyName": "星詠の魔導姫セフィラ"
      },
      {
        "id": "ch2_astrelle",
        "short": "アストレル",
        "legacyName": "天環の魔導姫アストレル"
      }
    ]
  },
  {
    "id": "crimsonwings",
    "group": "紅羽",
    "members": [
      {
        "id": "ch2_nizelle",
        "short": "ニゼル",
        "legacyName": "黒羽の細剣姫ニゼル"
      },
      {
        "id": "ch2_charne",
        "short": "シャルネ",
        "legacyName": "紅羽の双剣姫シャルネ"
      }
    ]
  },
  {
    "id": "absolutionbells",
    "group": "双鐘",
    "members": [
      {
        "id": "ch2_ferne",
        "short": "フェルネ",
        "legacyName": "宵鐘の護姫フェルネ"
      },
      {
        "id": "ch2_clarisse",
        "short": "クラリス",
        "legacyName": "暁鐘の聖姫クラリス"
      }
    ]
  },
  {
    "id": "eclipserenewal",
    "group": "日月",
    "members": [
      {
        "id": "ch2_lunaria",
        "short": "ルナリア",
        "legacyName": "月冥の翼姫ルナリア"
      },
      {
        "id": "ch2_solaria",
        "short": "ソラリア",
        "legacyName": "日輪の翼姫ソラリア"
      }
    ]
  },
  {
    "id": "dreamharvest",
    "group": "夢境",
    "members": [
      {
        "id": "ch2_morina",
        "short": "モリナ",
        "legacyName": "幻眠の扇姫モリナ"
      },
      {
        "id": "ch2_elmize",
        "short": "エルミゼ",
        "legacyName": "醒夢の鎌姫エルミゼ"
      }
    ]
  },
  {
    "id": "dragonliberation",
    "group": "竜姫",
    "members": [
      {
        "id": "ch2_dracia",
        "short": "ドラシア",
        "legacyName": "黒鎖の竜姫ドラシア"
      },
      {
        "id": "ch2_rucie",
        "short": "リュシエ",
        "legacyName": "白翼の竜姫リュシエ"
      }
    ]
  },
  {
    "id": "crownsfinale",
    "group": "剣姫",
    "members": [
      {
        "id": "ch2_nemesia",
        "short": "ネメシア",
        "legacyName": "夜冠の剣姫ネメシア"
      },
      {
        "id": "ch2_everia",
        "short": "エヴェリア",
        "legacyName": "暁冠の剣姫エヴェリア"
      }
    ]
  }
];
export const CHAPTER_TWO_PAIR_NAMES406=Object.freeze(rows.map(row=>Object.freeze({...row,members:Object.freeze(row.members.map(member=>Object.freeze({...member,name:`【${row.group}】${member.short}`})))})));
const byMember=new Map(CHAPTER_TWO_PAIR_NAMES406.flatMap(pair=>pair.members.map(member=>[member.id,{...member,pairId:pair.id,group:pair.group,partner:pair.members.find(other=>other.id!==member.id)}])));
export function chapterTwoPairMember406(subject){return byMember.get(typeof subject==='string'?subject:subject?.speciesId??subject?.id)??null;}
export function chapterTwoPairDisplayName406(subject,fallback=''){
 const member=chapterTwoPairMember406(subject);if(!member)return String(fallback??'');
 const name=String(fallback??'').trim(),prefix=`【${member.group}】`;
 if(!name||[member.legacyName,member.short,member.name].includes(name))return member.name;
 // Preserve a player's nickname, adding its pair identity once.
 return name.startsWith(prefix)?name:`${prefix}${name}`;
}
export function applyChapterTwoPairName406(species){
 const member=chapterTwoPairMember406(species);if(!member)return species;
 return {...species,legacyName:species.legacyName??species.name,name:member.name,
  pairGroup406:member.group,pairPartnerId406:member.partner.id,
  rankNames:(species.rankNames??[species.name]).map(name=>String(name).replace(species.name,member.name))};
}
// Keep the editable nickname separate from the generated common-name prefix.
export function chapterTwoPairEditableName406(monster,fallback=''){
 const member=chapterTwoPairMember406(monster);if(!member)return fallback;
 const name=String(monster?.nickname??'').trim(),prefix=`【${member.group}】`;
 if(!name||[member.legacyName,member.name,member.short].includes(name))return member.short;
 return name.startsWith(prefix)?name.slice(prefix.length):name;
}
export function normalizeChapterTwoPairNicknames406(state){
 for(const monster of state?.monsters??[]){
  const member=chapterTwoPairMember406(monster);
  if(member&&monster.nickname===member.legacyName)monster.nickname=member.name;
 }
 return state;
}
