export const FULL_RESET_CONFIRMATION_TEXT="初期化";

export const FULL_RESET_WARNING=[
 "ゲームデータを完全に初期化します。",
 "階層進行・仲間・装備・所持品・魔法陣・実績・オンライン報酬／交換履歴など、このセーブに含まれる内容はすべて削除され、元に戻せません。",
 "シリアルコードの使用済み履歴も同時に初期化され、最初から始めたセーブで再び使用できます。",
 "オンラインサーバーへ本人確認を行い、今週のレイド記録とギルド所属・役職・加入申請・招待も同時に初期化します。通信できない場合はゲームデータを変更せず中止します。",
 "オンラインのフレンドID・フレンド関係・固定サーバーURLは、この端末の接続情報として保持されます。",
 "交換品を預けている間は、資産の消失や二重受取を防ぐため初期化できません。"
].join("\n\n");

export const FULL_RESET_INPUT_PROMPT=`本当に最初からやり直す場合は、確認のため「${FULL_RESET_CONFIRMATION_TEXT}」と文字どおり入力してください。`;
export const FULL_RESET_FINAL_WARNING="最終確認：ゲーム本体の全セーブ・シリアルコード使用履歴・今週のレイド記録・ギルド所属を初期化します。元に戻せません。実行しますか？";

export function isExactFullResetConfirmation(value){
 return typeof value==="string"&&value===FULL_RESET_CONFIRMATION_TEXT;
}

export function pendingFullResetTradeIds(state){
 const escrow=state?.onlineParty?.tradeEscrow;
 if(!escrow||typeof escrow!=="object"||Array.isArray(escrow))return[];
 return Object.keys(escrow).filter(id=>id&&escrow[id]);
}

export function runConfirmedFullReset({state,confirm=globalThis.confirm,prompt=globalThis.prompt,reset}={}){
 const pendingTradeIds=pendingFullResetTradeIds(state);
 if(pendingTradeIds.length)return{ok:false,reason:"tradePending",pendingTradeIds};
 if(typeof confirm!=="function"||typeof prompt!=="function"||typeof reset!=="function")return{ok:false,reason:"unavailable"};
 if(!confirm(FULL_RESET_WARNING))return{ok:false,reason:"cancelled"};
 const input=prompt(FULL_RESET_INPUT_PROMPT);
 if(!isExactFullResetConfirmation(input))return{ok:false,reason:"mismatch"};
 if(!confirm(FULL_RESET_FINAL_WARNING))return{ok:false,reason:"cancelledFinal"};
 return reset()===true?{ok:true}:{ok:false,reason:"saveFailed"};
}
