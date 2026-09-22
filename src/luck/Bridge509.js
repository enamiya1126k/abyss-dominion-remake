// Existing Build507/508 matches remain playable after the client/server update.
import * as old from './Bridge508.js';
import * as next from './View509.js';
const modern=c=>c.state?.luck?.rules509===1;
export const luckView507=c=>modern(c)?next.luckView509(c):old.luckView507(c);
export function luckBefore507(c){old.luckBefore507(c);next.luckBefore509(c)}
export function luckDispose507(c){old.luckDispose507(c);next.luckDispose509(c)}
export const luckAfter507=c=>modern(c)?next.luckAfter509(c):old.luckAfter507(c);
export const luckTick507=c=>modern(c)?next.luckTick509(c):old.luckTick507(c);
export const luckClick507=(c,b)=>modern(c)?next.luckClick509(c,b):old.luckClick507(c,b);
export const luckInput507=(c,e)=>modern(c)?next.luckInput509(c,e):old.luckInput507(c,e);
export const luckKey507=(c,e)=>modern(c)?next.luckKey509(c,e):old.luckKey507(c,e);
export function luckReceive507(c){old.luckReceive507(c);next.luckReceive509(c)}
export function luckError507(c,m){old.luckError507(c,m);next.luckError509(c,m)}
