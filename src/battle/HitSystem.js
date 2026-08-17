export const EVASION_CAP=75;
export const HIT_CHANCE_MIN=.08;
export const HIT_CHANCE_MAX=.98;

function number(value,fallback=0){const parsed=Number(value);return Number.isFinite(parsed)?parsed:fallback}
function clamp(value,min,max){return Math.max(min,Math.min(max,value))}

/**
 * All combat modes use the same visible accuracy/evasion calculation.
 * Values are percentage points (accuracy 100 = no accuracy modifier).
 */
export function effectiveEvasion({evasion=0,evasionUp=0,evasionDown=0}={}){
 return clamp(number(evasion)*(1+number(evasionUp)-number(evasionDown)),0,EVASION_CAP);
}

export function attackHitChance({accuracy=100,accuracyUp=0,accuracyDown=0,evasion=0,evasionUp=0,evasionDown=0,guaranteedHit=false}={}){
 if(guaranteedHit)return 1;
 const resolvedAccuracy=clamp(number(accuracy,100)*(1+number(accuracyUp)-number(accuracyDown)),20,180);
 const resolvedEvasion=effectiveEvasion({evasion,evasionUp,evasionDown});
 // Accuracy above/below 100 offsets half as many evasion points. This keeps
 // evasion important without letting ordinary accuracy erase it completely.
 const dodge=clamp(resolvedEvasion-(resolvedAccuracy-100)*.5,0,EVASION_CAP)/100;
 return clamp(1-dodge,HIT_CHANCE_MIN,HIT_CHANCE_MAX);
}

export function attackHits(options={},random=Math.random){return Number(random())<attackHitChance(options)}

export function displayedEvasion(value){return `${effectiveEvasion({evasion:value}).toFixed(1).replace(/\.0$/,'')}%`}
