// Existing Build507/508 matches remain playable after the client/server update.
import * as old from './Bridge508.js';
import * as next from './View510.js';
const modern=c=>c.state?.luck?.rules509===1;
export const luckView507=c=>modern(c)?next.luckView510(c):old.luckView507(c);
export function luckBefore507(c){old.luckBefore507(c);next.luckBefore510(c)}
export function luckDispose507(c){old.luckDispose507(c);next.luckDispose510(c)}
export const luckAfter507=c=>modern(c)?next.luckAfter510(c):old.luckAfter507(c);
export const luckTick507=c=>modern(c)?next.luckTick510(c):old.luckTick507(c);
export const luckClick507=(c,b)=>modern(c)?next.luckClick510(c,b):old.luckClick507(c,b);
export const luckInput507=(c,e)=>modern(c)?next.luckInput510(c,e):old.luckInput507(c,e);
export const luckKey507=(c,e)=>modern(c)?next.luckKey510(c,e):old.luckKey507(c,e);
export function luckReceive507(c){old.luckReceive507(c);next.luckReceive510(c)}
export function luckError507(c,m){old.luckError507(c,m);next.luckError510(c,m)}
