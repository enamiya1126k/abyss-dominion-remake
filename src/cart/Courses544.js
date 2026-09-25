import {COURSES556,courseById556,insideZone556} from './Courses556.js';
import {GOLD557,parking557} from './Parking557.js';
// Retain the original five IDs for archived records and explicit old-course fixtures.
export const COURSES544=Object.freeze(COURSES556.slice(0,5));
export const GOLD544=GOLD557;
export const course544=g=>courseById556(g.courseId556)??COURSES544[Math.max(0,Math.min(4,(g.round??1)-1))];
export const resistance544=(g,y,x=0)=>{const c=course544(g);return c.zones.find(z=>z.friction&&insideZone556(z,x,y))?.friction??c.friction};
export const parkingBonus544=(p,radius=.58)=>parking557(p,radius).bonus;
