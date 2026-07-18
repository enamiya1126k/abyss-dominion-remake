import{SPECIES}from"../../data/species.js";
import{PERSONALITIES}from"../../data/personalities.js";
import{MONSTER_COLORS}from"../../data/colors.js";
import{
  displayName,rankName,colorValue,calculatedStats,unlockedSkills
}from"../../models/Monster.js";

export function MonsterDetailScreen(monster,state){
  const species=SPECIES[monster.speciesId];
  const personality=PERSONALITIES[monster.personalityId];
  const stats=calculatedStats(monster);
  const skills=unlockedSkills(monster);

  return`
    <section class="screen">
      <header class="topbar">
        <button id="backMonsters">←</button>
        <h2>モンスター詳細</h2>
        <button id="toggleFavorite">${monster.favorite?"★":"☆"}</button>
      </header>

      <div class="page">
        <div class="panel detail-hero">
          <div class="detail-orb" style="background:${colorValue(monster)}"></div>
          <div>
            <div class="eyebrow">${rankName(monster)}</div>
            <h1>${displayName(monster)}</h1>
            <div class="stars">${"★".repeat(monster.stars)}${"☆".repeat(Math.max(0,5-monster.stars))}</div>
            <div class="subline">Lv.${monster.level} / Rank ${monster.rank} / +${monster.plus}</div>
          </div>
        </div>

        <div class="panel">
          <h2>名前</h2>
          <div class="edit-row" style="margin-top:10px">
            <input id="nicknameInput" maxlength="12" value="${displayName(monster)}">
            <button id="saveNickname">変更</button>
          </div>
        </div>

        <div class="panel">
          <h2>個体カラー</h2>
          <div class="color-row" style="margin-top:10px">
            ${MONSTER_COLORS.map(color=>`
              <button
                class="color-dot ${monster.colorId===color.id?"selected":""}"
                style="background:${color.value}"
                data-color-id="${color.id}"
                aria-label="${color.name}">
              </button>`).join("")}
          </div>
        </div>

        <div class="panel">
          <h2>基本ステータス</h2>
          <div class="stat-grid" style="margin-top:10px">
            <div class="stat-card"><span>HP</span><b>${stats.hp}</b></div>
            <div class="stat-card"><span>ATK</span><b>${stats.atk}</b></div>
            <div class="stat-card"><span>DEF</span><b>${stats.def}</b></div>
            <div class="stat-card"><span>SPD</span><b>${stats.spd}</b></div>
            <div class="stat-card"><span>会心率</span><b>${stats.crit}%</b></div>
            <div class="stat-card"><span>回避率</span><b>${stats.evasion}%</b></div>
          </div>
        </div>

        <div class="panel">
          <h2>性格：${personality.name}</h2>
          <p class="muted" style="margin-top:7px">${personality.description}</p>
        </div>

        <div class="panel">
          <h2>個体値</h2>
          ${Object.entries(monster.ivs).map(([key,value])=>`
            <div class="iv-row">
              <span>${key.toUpperCase()}</span>
              <div class="iv-bar"><i style="width:${value}%"></i></div>
              <b>${value}</b>
            </div>`).join("")}
        </div>

        <div class="panel">
          <h2>装備</h2>
          <div class="subline" style="margin-top:10px">
            武器：${state?.equipment?.find(i=>i.id===monster.equipment.weapon)?.name??"未装備"}<br>
            防具：${state?.equipment?.find(i=>i.id===monster.equipment.armor)?.name??"未装備"}<br>
            アクセ：${state?.equipment?.find(i=>i.id===monster.equipment.accessory)?.name??"未装備"}
          </div>
        </div>

        <div class="panel">
          <h2>スキル</h2>
          <div class="skill-list" style="margin-top:10px">
            ${skills.map(skill=>`
              <div class="skill-card ${skill.unlocked?"":"locked"}">
                <b>${skill.unlocked?"○":"🔒"} ${skill.name}</b>
                <small>${skill.description}</small>
                <small>${skill.unlock.type==="level"
                  ? `Lv.${skill.unlock.value}で解禁`
                  : `Rank ${skill.unlock.value}で解禁`}</small>
              </div>`).join("")}
          </div>
        </div>

        <div class="panel danger-zone">
          <h2>モンスター整理</h2>
          <button id="releaseMonster" class="danger">このモンスターを解放</button>
          <small class="muted">出撃中・お気に入り・ロック中は解放できません。</small>
        </div>
        <div class="panel">
          <h2>個体記録</h2>
          <div class="subline" style="margin-top:8px">
            捕獲日：${new Date(monster.capturedAt).toLocaleDateString("ja-JP")}<br>
            戦闘参加：${monster.battles}回<br>
            撃破数：${monster.defeats}体<br>
            絆：${monster.bond}
          </div>
        </div>
      </div>
    </section>
  `;
}
