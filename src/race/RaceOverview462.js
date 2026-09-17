import{course459}from'./RaceCourse459.js';
export function overviewFrame462(track,width){const oval=course459(track).shape==='oval',bounds=oval?{cx:960,cy:720,width:1920,height:1440}:{cx:1600,cy:485,width:3000,height:460},scale=width/bounds.width;return{height:Math.ceil(bounds.height*scale),camera:{cx:bounds.cx,cy:bounds.cy,scale}}}
