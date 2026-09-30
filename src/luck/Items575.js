export const ITEMS575=[
 {id:'regalia',name:'王者の号令',move:150,persistent:true,type:'首位の倍率',detail:'毎回+150m。装備した次の回から、ラウンド開始時に単独1位なら前進×4。2個なら×16。同率1位では発動しない。'},
 {id:'podium',name:'栄光のトロフィー',move:120,persistent:true,type:'序盤上位の成長',early:.5,detail:'前半だけ出現。装備中、前半の回を2位以内で終えるたび勲章+1。同順位も対象。次の回から前進×2^勲章数。1回×2、2回×4。倍率は後半も残り、複数個は掛け算。毎回+120m。'},
 {id:'frontier',name:'先駆者の星図',move:120,persistent:true,type:'序盤到達の覚醒',early:.5,detail:'前半だけ出現。装備中、前半の回の終了時に累計1万m以上なら覚醒。次の回からずっと前進×8。2個なら×64。後退しても覚醒は消えない。毎回+120m。'},
 {id:'usurper',name:'奪冠の太陽冠',move:150,persistent:true,type:'序盤の首位奪取',early:.5,detail:'前半だけ出現。装備中、前半に開始時2位以下から終了時の単独1位へ上がると、1個につき一度だけ太陽+3。次の大技へ持ち越し、太陽3個は×27。同率1位は対象外。毎回+150m。'}
].map((x,i)=>({...x,tile:[0,1,4,5][i],atlas:575}));
