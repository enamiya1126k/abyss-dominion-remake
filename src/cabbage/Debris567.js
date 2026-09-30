// Small, bounded 2D rigid ribbons. No engine, pairwise collision pass or network
// state: gravity, board collision, restitution, rolling friction, then sleep.
export const DEBRIS567=Object.freeze({max:40,gravity:920,restitution:.29,life:9});
export function createDebris567(){return {bodies:[],serial:0};}
export function release567(world,{x,y,floor,width=390,cuts=0,wood=false,energy=1},random=Math.random){
  const scale=width/390,n=wood?6:4;
  for(let i=0;i<n;i++){
    const sign=i%2?-1:1,length=(wood?11:Math.max(7,28/(1+cuts/90)))*( .7+random()*.65)*scale;
    world.bodies.push({id:++world.serial,x:x+(random()-.5)*22*scale,y:y-random()*6*scale,
      vx:sign*(30+random()*75)*scale*Math.min(1.6,energy),vy:-(65+random()*100)*scale,
      angle:(random()-.5)*1.8,spin:sign*(3+random()*5),length,thickness:(wood?5:2.4+random()*2)*scale,
      radius:Math.max(2,length*.13),floor,wood,shade:i%3,age:0,sleep:false,bounces:0});
  }
  if(world.bodies.length>DEBRIS567.max)world.bodies.splice(0,world.bodies.length-DEBRIS567.max);
}
export function stepDebris567(world,seconds,{width=390,floor}={}){
  // Bounded substeps keep a background-tab pause or slow frame from tunnelling.
  const dt=Math.max(0,Math.min(.05,seconds)),steps=Math.max(1,Math.ceil(dt/(1/120))),h=dt/steps,scale=width/390;
  for(const b of world.bodies){
    b.age+=dt;
    if(Number.isFinite(floor)&&floor>b.floor+.5){b.floor=floor;b.sleep=false;}
    if(b.sleep)continue;
    for(let i=0;i<steps;i++){
      b.vy+=DEBRIS567.gravity*scale*h;b.x+=b.vx*h;b.y+=b.vy*h;b.angle+=b.spin*h;
      const onBoard=b.x>=width*.05&&b.x<=width*.95;
      if(onBoard&&b.y+b.radius>=b.floor&&b.vy>0){
        b.y=b.floor-b.radius;
        if(b.vy>35*scale){b.vy*=-DEBRIS567.restitution;b.bounces++;b.spin*=.62;b.vx*=.79;}
        else{b.vy=0;b.vx*=Math.exp(-6*h);b.spin=b.vx/Math.max(5,b.length);b.angle+=(Math.round(b.angle/Math.PI)*Math.PI-b.angle)*Math.min(1,12*h);
          if(Math.abs(b.vx)<2.5*scale&&Math.abs(Math.sin(b.angle))<.06){b.sleep=true;b.vx=0;b.spin=0;}}
      }
    }
  }
  world.bodies=world.bodies.filter(b=>b.age<DEBRIS567.life&&b.y<(floor??b.floor)+width*.8);
}
