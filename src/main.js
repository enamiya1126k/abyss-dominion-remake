import{SaveService}from"./services/SaveService.js";
import{SPECIES}from"./data/species.js";
import{HomeScreen}from"./ui/screens/HomeScreen.js";
import{MonsterListScreen}from"./ui/screens/MonsterListScreen.js";
import{MonsterDetailScreen}from"./ui/screens/MonsterDetailScreen.js";
import{SettingsScreen}from"./ui/screens/SettingsScreen.js";

const app=document.getElementById("app");
const saveService=new SaveService();
let currentScreen="home";
let selectedMonsterId=null;

function render(){
  const state=saveService.state;

  if(currentScreen==="home"){
    app.innerHTML=HomeScreen(state);
    bindHome();
    return;
  }

  if(currentScreen==="monsters"){
    app.innerHTML=MonsterListScreen(state);
    bindMonsterList();
    return;
  }

  if(currentScreen==="detail"){
    const monster=state.monsters.find(m=>m.id===selectedMonsterId);
    if(!monster){
      currentScreen="monsters";
      render();
      return;
    }
    app.innerHTML=MonsterDetailScreen(monster);
    bindMonsterDetail(monster);
    return;
  }

  if(currentScreen==="settings"){
    app.innerHTML=SettingsScreen(state);
    bindSettings();
  }
}

function go(screen){
  currentScreen=screen;
  render();
}

function bindHome(){
  document.getElementById("openMonsters").onclick=()=>go("monsters");
  document.getElementById("openSettings").onclick=()=>go("settings");
  document.getElementById("openExplore").onclick=()=>alert("探索はv0.0.2で実装する。");
  document.getElementById("openEquipment").onclick=()=>alert("装備はv0.0.3で実装する。");
  bindDetailButtons();
}

function bindMonsterList(){
  document.getElementById("backHome").onclick=()=>go("home");
  const input=document.getElementById("monsterSearch");
  input.oninput=()=>{
    const query=input.value.trim();
    document.querySelectorAll(".monster-card").forEach(card=>{
      const id=card.querySelector("[data-monster-id]")?.dataset.monsterId;
      const monster=saveService.state.monsters.find(m=>m.id===id);
      const species=SPECIES[monster.speciesId];
      const matches=monster.nickname.includes(query)||species.name.includes(query);
      card.style.display=matches?"grid":"none";
    });
  };
  bindDetailButtons();
}

function bindDetailButtons(){
  document.querySelectorAll("[data-monster-id]").forEach(button=>{
    button.onclick=()=>{
      selectedMonsterId=button.dataset.monsterId;
      go("detail");
    };
  });
}

function bindMonsterDetail(monster){
  document.getElementById("backMonsters").onclick=()=>go("monsters");

  document.getElementById("toggleFavorite").onclick=()=>{
    monster.favorite=!monster.favorite;
    saveService.save();
    render();
  };

  document.getElementById("saveNickname").onclick=()=>{
    const input=document.getElementById("nicknameInput");
    const next=input.value.trim();
    if(!next)return alert("名前を入力してね");
    monster.nickname=next.slice(0,12);
    saveService.save();
    render();
  };

  document.querySelectorAll("[data-color-id]").forEach(button=>{
    button.onclick=()=>{
      monster.colorId=button.dataset.colorId;
      saveService.save();
      render();
    };
  });
}

function bindSettings(){
  document.getElementById("backHome").onclick=()=>go("home");

  document.getElementById("toggleAuto").onclick=()=>{
    saveService.state.settings.autoBattle=!saveService.state.settings.autoBattle;
    saveService.save();
    render();
  };

  document.getElementById("toggleMinimap").onclick=()=>{
    saveService.state.settings.minimapVisible=!saveService.state.settings.minimapVisible;
    saveService.save();
    render();
  };

  document.getElementById("resetSave").onclick=()=>{
    if(!confirm("本当にセーブを初期化する？"))return;
    saveService.reset();
    selectedMonsterId=null;
    go("home");
  };
}

render();
