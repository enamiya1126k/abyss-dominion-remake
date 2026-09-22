// Existing Build507 matches remain playable after the client/server update.
import * as old from './View507.js';
import * as next from './View508.js';
const modern=c=>c.state?.luck?.rules508===1;
export const luckView507=c=>modern(c)?next.luckView508(c):old.luckView507(c);
export function luckBefore507(c){old.luckBefore507(c);next.luckBefore508(c)}
export function luckDispose507(c){old.luckDispose507(c);next.luckDispose508(c)}
export const luckAfter507=c=>modern(c)?next.luckAfter508(c):old.luckAfter507(c);
export const luckTick507=c=>modern(c)?next.luckTick508(c):old.luckTick507(c);
export const luckClick507=(c,b)=>modern(c)?next.luckClick508(c,b):old.luckClick507(c,b);
export const luckInput507=(c,e)=>modern(c)?next.luckInput508(c,e):old.luckInput507(c,e);
export const luckKey507=(c,e)=>modern(c)?next.luckKey508(c,e):old.luckKey507(c,e);
export function luckReceive507(c){old.luckReceive507(c);next.luckReceive508(c)}
export function luckError507(c,m){old.luckError507(c,m);next.luckError508(c,m)}
