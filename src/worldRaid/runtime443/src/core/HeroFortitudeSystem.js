const HEROES=new Set(['myth_enami','myth_yori','myth_rion','myth_hide']);
export const hasHeroFortitude=u=>HEROES.has(u?.speciesId);
export function heroFortitudeUsed(b,u){return Boolean(b?.heroFortitude361?.[u?.playerId??u?.id]);}
export function tryHeroFortitude(b,u,beforeHp){
 if(!b||!hasHeroFortitude(u)||beforeHp<=0||(u.currentHp??u.hp)>0||heroFortitudeUsed(b,u))return false;
 b.heroFortitude361??={};b.heroFortitude361[u.playerId??u.id]=true;
 if('currentHp'in u)u.currentHp=1;else u.hp=1;
 u._circleLastLifeUsed=true;u.circleLastLifeUsed=true;u._unyieldingUsed=true;
 b.heroFortitudeCue361??=[];b.heroFortitudeCue361.push(`${u.name??u.nickname??'勇者'}：勇者のふんばり！`);
 b.log??=[];b.log.unshift(`${u.name??'勇者'}：勇者のふんばり！ HP1で耐えた`);b.log=b.log.slice(0,6);
 return true;
}
