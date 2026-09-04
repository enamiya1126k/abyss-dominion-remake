export function explorePerformanceProfile({pixelRatio=1,screenWidth=1280,maxTouchPoints=0,hardwareConcurrency=8,deviceMemory=8}={}){
 const ratio=Math.max(1,Number(pixelRatio)||1),width=Math.max(1,Number(screenWidth)||1280),touch=Math.max(0,Number(maxTouchPoints)||0)>0,cores=Math.max(1,Number(hardwareConcurrency)||8),memory=Math.max(1,Number(deviceMemory)||8),compact=touch||width<=900,constrained=compact||cores<=4||memory<=4;
 return Object.freeze({compact,constrained,pixelRatio:Math.min(ratio,constrained?1.35:1.75),frameInterval:constrained?1000/30:1000/50,miniMapInterval:constrained?140:80,tutorialMarkerInterval:constrained?180:100,particleScale:constrained?.45:.75,shadowScale:constrained?.45:.8});
}

export function currentExplorePerformanceProfile(scope=globalThis){
 const nav=scope?.navigator??{},screenWidth=scope?.innerWidth??scope?.screen?.width??1280;
 return explorePerformanceProfile({pixelRatio:scope?.devicePixelRatio??1,screenWidth,maxTouchPoints:nav.maxTouchPoints??0,hardwareConcurrency:nav.hardwareConcurrency??8,deviceMemory:nav.deviceMemory??8});
}

export function shouldPaintExploreFrame(state,now,interval){
 const time=Math.max(0,Number(now)||0),gap=Math.max(0,Number(interval)||0),last=Math.max(0,Number(state?.lastPaintAt)||0);if(last&&time-last<gap)return false;if(state)state.lastPaintAt=time;return true;
}
