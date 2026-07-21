
export const SECOND_WORLD_EVENTS=[
 {id:"arrival",floor:1001,title:"未知領域"},
 {id:"echo",floor:1010,title:"深淵の囁き"},
 {id:"rift",floor:1050,title:"空間の裂け目"}
];
export function eventsForFloor(floor){
 return SECOND_WORLD_EVENTS.filter(e=>e.floor===Number(floor));
}
