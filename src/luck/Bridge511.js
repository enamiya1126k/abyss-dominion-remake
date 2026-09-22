// Existing Build507/508 matches remain playable after the client/server update.
import * as old from './Bridge510.js';
import * as next from './View511.js';
const modern=c=>c.state?.luck?.rules511===1;
export const luckView507=c=>modern(c)?next.luckView511(c):old.luckView507(c);
export function luckBefore507(c){old.luckBefore507(c);next.luckBefore511(c)}
export function luckDispose507(c){old.luckDispose507(c);next.luckDispose511(c)}
export const luckAfter507=c=>modern(c)?next.luckAfter511(c):old.luckAfter507(c);
export const luckTick507=c=>modern(c)?next.luckTick511(c):old.luckTick507(c);
export const luckClick507=(c,b)=>modern(c)?next.luckClick511(c,b):old.luckClick507(c,b);
export const luckInput507=(c,e)=>modern(c)?next.luckInput511(c,e):old.luckInput507(c,e);
export const luckKey507=(c,e)=>modern(c)?next.luckKey511(c,e):old.luckKey507(c,e);
export function luckReceive507(c){old.luckReceive507(c);next.luckReceive511(c)}
export function luckError507(c,m){old.luckError507(c,m);next.luckError511(c,m)}
